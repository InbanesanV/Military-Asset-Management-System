import supabase from '../config/db.js';

export const createPurchase = async (req, res) => {
  try {
    const { baseId, equipmentTypeId, quantity, notes } = req.body;

    if (!baseId || !equipmentTypeId || !quantity)
      return res.status(400).json({ message: 'baseId, equipmentTypeId, and quantity are required.' });
    if (quantity <= 0)
      return res.status(400).json({ message: 'Quantity must be greater than 0.' });

    const { data, error } = await supabase
      .from('purchases')
      .insert({ base_id: parseInt(baseId), equipment_type_id: parseInt(equipmentTypeId), quantity: parseInt(quantity), notes: notes || null, purchased_by: req.user.id })
      .select()
      .single();

    if (error) throw error;

    // Audit log
    await supabase.from('audit_logs').insert({
      user_id: req.user.id,
      action: 'PURCHASE',
      details: `Purchased ${quantity} units of equipment type #${equipmentTypeId} for base #${baseId}. Notes: ${notes || 'N/A'}`,
      ip_address: req.clientIp || null,
    });

    res.status(201).json({ message: 'Purchase recorded successfully.', purchase: data });
  } catch (error) {
    console.error('Create purchase error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getPurchases = async (req, res) => {
  try {
    let { baseId, equipmentTypeId, startDate, endDate, page = 1, limit = 20 } = req.query;
    const from = (parseInt(page) - 1) * parseInt(limit);
    const to = from + parseInt(limit) - 1;

    let q = supabase
      .from('purchases')
      .select('id, quantity, notes, created_at, bases(name), equipment_types(name, category), users(username)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (baseId) q = q.eq('base_id', parseInt(baseId));
    if (equipmentTypeId) q = q.eq('equipment_type_id', parseInt(equipmentTypeId));
    if (startDate) q = q.gte('created_at', startDate);
    if (endDate) q = q.lte('created_at', endDate);

    const { data, error, count } = await q;
    if (error) throw error;

    const purchases = (data || []).map(p => ({
      ...p,
      base_name: p.bases?.name,
      equipment_name: p.equipment_types?.name,
      category: p.equipment_types?.category,
      purchased_by_user: p.users?.username,
    }));

    res.json({ purchases, total: count || 0, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    console.error('Get purchases error:', error);
    res.status(500).json({ error: error.message });
  }
};
