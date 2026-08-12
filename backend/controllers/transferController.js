import supabase from '../config/db.js';

export const createTransfer = async (req, res) => {
  try {
    const { sourceBaseId, destinationBaseId, equipmentTypeId, quantity, notes } = req.body;

    if (!sourceBaseId || !destinationBaseId || !equipmentTypeId || !quantity)
      return res.status(400).json({ message: 'sourceBaseId, destinationBaseId, equipmentTypeId, and quantity are required.' });
    if (parseInt(sourceBaseId) === parseInt(destinationBaseId))
      return res.status(400).json({ message: 'Source and destination bases must be different.' });
    if (quantity <= 0)
      return res.status(400).json({ message: 'Quantity must be greater than 0.' });

    // Insert transfer
    const { data: transfer, error: tErr } = await supabase
      .from('transfers')
      .insert({
        source_base_id: parseInt(sourceBaseId),
        destination_base_id: parseInt(destinationBaseId),
        equipment_type_id: parseInt(equipmentTypeId),
        quantity: parseInt(quantity),
        status: 'COMPLETED',
        notes: notes || null,
        initiated_by: req.user.id,
      })
      .select()
      .single();

    if (tErr) throw tErr;

    // Audit log
    await supabase.from('audit_logs').insert({
      user_id: req.user.id,
      action: 'TRANSFER',
      details: `Transferred ${quantity} units of equipment type #${equipmentTypeId} from base #${sourceBaseId} to base #${destinationBaseId}`,
      ip_address: req.clientIp || null,
    });

    res.status(201).json({ message: 'Transfer completed successfully.', transfer });
  } catch (error) {
    console.error('Transfer error:', error);
    res.status(500).json({ error: 'Transfer failed: ' + error.message });
  }
};

export const getTransfers = async (req, res) => {
  try {
    let { baseId, equipmentTypeId, startDate, endDate, page = 1, limit = 20 } = req.query;
    const from = (parseInt(page) - 1) * parseInt(limit);
    const to = from + parseInt(limit) - 1;

    let q = supabase
      .from('transfers')
      .select(`
        id, quantity, status, notes, created_at,
        source:bases!source_base_id(name),
        destination:bases!destination_base_id(name),
        equipment_types(name, category),
        users(username)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (baseId) {
      // Base commanders see transfers involving their base
      q = q.or(`source_base_id.eq.${parseInt(baseId)},destination_base_id.eq.${parseInt(baseId)}`);
    }
    if (equipmentTypeId) q = q.eq('equipment_type_id', parseInt(equipmentTypeId));
    if (startDate) q = q.gte('created_at', startDate);
    if (endDate) q = q.lte('created_at', endDate);

    const { data, error, count } = await q;
    if (error) throw error;

    const transfers = (data || []).map(t => ({
      ...t,
      source_base_name: t.source?.name,
      destination_base_name: t.destination?.name,
      equipment_name: t.equipment_types?.name,
      category: t.equipment_types?.category,
      initiated_by_user: t.users?.username,
    }));

    res.json({ transfers, total: count || 0, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    console.error('Get transfers error:', error);
    res.status(500).json({ error: error.message });
  }
};
