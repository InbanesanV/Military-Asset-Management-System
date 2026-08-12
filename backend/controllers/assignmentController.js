import supabase from '../config/db.js';

// ─── ASSIGNMENTS ───────────────────────────────────────────

export const createAssignment = async (req, res) => {
  try {
    const { baseId, equipmentTypeId, quantity, assignedTo, notes } = req.body;
    if (!baseId || !equipmentTypeId || !quantity || !assignedTo)
      return res.status(400).json({ message: 'baseId, equipmentTypeId, quantity, and assignedTo are required.' });

    const { data, error } = await supabase
      .from('assignments')
      .insert({ base_id: parseInt(baseId), equipment_type_id: parseInt(equipmentTypeId), quantity: parseInt(quantity), assigned_to: assignedTo, notes: notes || null, assigned_by: req.user.id })
      .select().single();

    if (error) throw error;

    await supabase.from('audit_logs').insert({
      user_id: req.user.id,
      action: 'ASSIGNMENT',
      details: `Assigned ${quantity} units of equipment type #${equipmentTypeId} to "${assignedTo}" at base #${baseId}`,
      ip_address: req.clientIp || null,
    });

    res.status(201).json({ message: 'Assignment recorded successfully.', assignment: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAssignments = async (req, res) => {
  try {
    let { baseId, equipmentTypeId, startDate, endDate, page = 1, limit = 20 } = req.query;
    const from = (parseInt(page) - 1) * parseInt(limit);
    const to = from + parseInt(limit) - 1;

    let q = supabase
      .from('assignments')
      .select('id, quantity, assigned_to, notes, created_at, bases(name), equipment_types(name, category), users(username)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (baseId) q = q.eq('base_id', parseInt(baseId));
    if (equipmentTypeId) q = q.eq('equipment_type_id', parseInt(equipmentTypeId));
    if (startDate) q = q.gte('created_at', startDate);
    if (endDate) q = q.lte('created_at', endDate);

    const { data, error, count } = await q;
    if (error) throw error;

    const assignments = (data || []).map(a => ({
      ...a,
      base_name: a.bases?.name,
      equipment_name: a.equipment_types?.name,
      category: a.equipment_types?.category,
      assigned_by_user: a.users?.username,
    }));

    res.json({ assignments, total: count || 0, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── EXPENDITURES ──────────────────────────────────────────

export const createExpenditure = async (req, res) => {
  try {
    const { baseId, equipmentTypeId, quantity, reason } = req.body;
    if (!baseId || !equipmentTypeId || !quantity)
      return res.status(400).json({ message: 'baseId, equipmentTypeId, and quantity are required.' });

    const { data, error } = await supabase
      .from('expenditures')
      .insert({ base_id: parseInt(baseId), equipment_type_id: parseInt(equipmentTypeId), quantity: parseInt(quantity), reason: reason || null, recorded_by: req.user.id })
      .select().single();

    if (error) throw error;

    await supabase.from('audit_logs').insert({
      user_id: req.user.id,
      action: 'EXPENDITURE',
      details: `Recorded ${quantity} units of equipment type #${equipmentTypeId} as expended at base #${baseId}. Reason: ${reason || 'N/A'}`,
      ip_address: req.clientIp || null,
    });

    res.status(201).json({ message: 'Expenditure recorded successfully.', expenditure: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getExpenditures = async (req, res) => {
  try {
    let { baseId, equipmentTypeId, startDate, endDate, page = 1, limit = 20 } = req.query;
    const from = (parseInt(page) - 1) * parseInt(limit);
    const to = from + parseInt(limit) - 1;

    let q = supabase
      .from('expenditures')
      .select('id, quantity, reason, created_at, bases(name), equipment_types(name, category), users(username)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (baseId) q = q.eq('base_id', parseInt(baseId));
    if (equipmentTypeId) q = q.eq('equipment_type_id', parseInt(equipmentTypeId));
    if (startDate) q = q.gte('created_at', startDate);
    if (endDate) q = q.lte('created_at', endDate);

    const { data, error, count } = await q;
    if (error) throw error;

    const expenditures = (data || []).map(e => ({
      ...e,
      base_name: e.bases?.name,
      equipment_name: e.equipment_types?.name,
      category: e.equipment_types?.category,
      recorded_by_user: e.users?.username,
    }));

    res.json({ expenditures, total: count || 0, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
