import supabase from '../config/db.js';

// Helper: parse int or null
const intOrNull = (v) => (v ? parseInt(v) : null);

/**
 * GET /api/v1/assets/dashboard
 * Computes Opening Balance, Net Movement, Assigned, Expended, Closing Balance
 */
export const getDashboardMetrics = async (req, res) => {
  try {
    let { baseId, equipmentTypeId, startDate, endDate } = req.query;
    const bId = intOrNull(baseId);
    const eId = intOrNull(equipmentTypeId);

    // Helper to build a filtered sum query
    const sumQuery = async (table, qtyField, baseField, filters = {}) => {
      let q = supabase.from(table).select(qtyField);
      if (bId && baseField) {
        if (Array.isArray(baseField)) {
          // For transfers (source OR destination)
          // We'll handle separately
        } else {
          q = q.eq(baseField, bId);
        }
      }
      if (eId) q = q.eq('equipment_type_id', eId);
      if (filters.before && startDate) q = q.lt('created_at', startDate);
      if (filters.inRange) {
        if (startDate) q = q.gte('created_at', startDate);
        if (endDate) q = q.lte('created_at', endDate);
      }
      const { data, error } = await q;
      if (error) throw error;
      return (data || []).reduce((sum, row) => sum + (row[qtyField] || 0), 0);
    };

    // Opening period (before startDate)
    const openingFilters = { before: true };
    const periodFilters = { inRange: true };

    // --- OPENING BALANCE ---
    const [oPurch, oTrIn, oTrOut, oAssign, oExpend] = await Promise.all([
      sumQuery('purchases', 'quantity', 'base_id', openingFilters).then(async () => {
        let q = supabase.from('purchases').select('quantity');
        if (bId) q = q.eq('base_id', bId);
        if (eId) q = q.eq('equipment_type_id', eId);
        if (startDate) q = q.lt('created_at', startDate);
        const { data, error } = await q;
        if (error) throw error;
        return (data || []).reduce((s, r) => s + (r.quantity || 0), 0);
      }),
      (async () => {
        let q = supabase.from('transfers').select('quantity').eq('status', 'COMPLETED');
        if (bId) q = q.eq('destination_base_id', bId);
        if (eId) q = q.eq('equipment_type_id', eId);
        if (startDate) q = q.lt('created_at', startDate);
        const { data, error } = await q;
        if (error) throw error;
        return (data || []).reduce((s, r) => s + (r.quantity || 0), 0);
      })(),
      (async () => {
        let q = supabase.from('transfers').select('quantity').eq('status', 'COMPLETED');
        if (bId) q = q.eq('source_base_id', bId);
        if (eId) q = q.eq('equipment_type_id', eId);
        if (startDate) q = q.lt('created_at', startDate);
        const { data, error } = await q;
        if (error) throw error;
        return (data || []).reduce((s, r) => s + (r.quantity || 0), 0);
      })(),
      (async () => {
        let q = supabase.from('assignments').select('quantity');
        if (bId) q = q.eq('base_id', bId);
        if (eId) q = q.eq('equipment_type_id', eId);
        if (startDate) q = q.lt('created_at', startDate);
        const { data, error } = await q;
        if (error) throw error;
        return (data || []).reduce((s, r) => s + (r.quantity || 0), 0);
      })(),
      (async () => {
        let q = supabase.from('expenditures').select('quantity');
        if (bId) q = q.eq('base_id', bId);
        if (eId) q = q.eq('equipment_type_id', eId);
        if (startDate) q = q.lt('created_at', startDate);
        const { data, error } = await q;
        if (error) throw error;
        return (data || []).reduce((s, r) => s + (r.quantity || 0), 0);
      })(),
    ]);

    const openingBalance = oPurch + oTrIn - oTrOut - oAssign - oExpend;

    // --- PERIOD METRICS ---
    const applyDateRange = (q) => {
      if (startDate) q = q.gte('created_at', startDate);
      if (endDate) q = q.lte('created_at', endDate);
      return q;
    };

    const [purchases, transfersIn, transfersOut, assigned, expended] = await Promise.all([
      (async () => {
        let q = supabase.from('purchases').select('quantity');
        if (bId) q = q.eq('base_id', bId);
        if (eId) q = q.eq('equipment_type_id', eId);
        q = applyDateRange(q);
        const { data, error } = await q;
        if (error) throw error;
        return (data || []).reduce((s, r) => s + (r.quantity || 0), 0);
      })(),
      (async () => {
        let q = supabase.from('transfers').select('quantity').eq('status', 'COMPLETED');
        if (bId) q = q.eq('destination_base_id', bId);
        if (eId) q = q.eq('equipment_type_id', eId);
        q = applyDateRange(q);
        const { data, error } = await q;
        if (error) throw error;
        return (data || []).reduce((s, r) => s + (r.quantity || 0), 0);
      })(),
      (async () => {
        let q = supabase.from('transfers').select('quantity').eq('status', 'COMPLETED');
        if (bId) q = q.eq('source_base_id', bId);
        if (eId) q = q.eq('equipment_type_id', eId);
        q = applyDateRange(q);
        const { data, error } = await q;
        if (error) throw error;
        return (data || []).reduce((s, r) => s + (r.quantity || 0), 0);
      })(),
      (async () => {
        let q = supabase.from('assignments').select('quantity');
        if (bId) q = q.eq('base_id', bId);
        if (eId) q = q.eq('equipment_type_id', eId);
        q = applyDateRange(q);
        const { data, error } = await q;
        if (error) throw error;
        return (data || []).reduce((s, r) => s + (r.quantity || 0), 0);
      })(),
      (async () => {
        let q = supabase.from('expenditures').select('quantity');
        if (bId) q = q.eq('base_id', bId);
        if (eId) q = q.eq('equipment_type_id', eId);
        q = applyDateRange(q);
        const { data, error } = await q;
        if (error) throw error;
        return (data || []).reduce((s, r) => s + (r.quantity || 0), 0);
      })(),
    ]);

    const netMovement = purchases + transfersIn - transfersOut;
    const closingBalance = openingBalance + netMovement - assigned - expended;

    res.json({ openingBalance, purchases, transfersIn, transfersOut, netMovement, assigned, expended, closingBalance });
  } catch (error) {
    console.error('Dashboard metrics error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/v1/assets/bases-overview
 */
export const getBasesOverview = async (req, res) => {
  try {
    const { data, error } = await supabase.from('bases').select('id, name, location');
    if (error) throw error;
    res.json({ bases: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/v1/assets/chart
 * Per-base inventory breakdown for Recharts
 */
export const getChartData = async (req, res) => {
  try {
    const [basesRes, purchasesRes, transfersInRes, transfersOutRes, assignRes, expendRes] = await Promise.all([
      supabase.from('bases').select('id, name'),
      supabase.from('purchases').select('base_id, quantity, equipment_types(category)'),
      supabase.from('transfers').select('destination_base_id, quantity, equipment_types(category)').eq('status', 'COMPLETED'),
      supabase.from('transfers').select('source_base_id, quantity, equipment_types(category)').eq('status', 'COMPLETED'),
      supabase.from('assignments').select('base_id, quantity, equipment_types(category)'),
      supabase.from('expenditures').select('base_id, quantity, equipment_types(category)'),
    ]);

    if (basesRes.error) throw basesRes.error;

    const chartData = basesRes.data.map((base) => {
      const entry = { name: base.name, WEAPON: 0, VEHICLE: 0, AMMUNITION: 0 };

      (purchasesRes.data || []).filter(r => r.base_id === base.id).forEach(r => {
        const cat = r.equipment_types?.category;
        if (cat) entry[cat] = (entry[cat] || 0) + r.quantity;
      });
      (transfersInRes.data || []).filter(r => r.destination_base_id === base.id).forEach(r => {
        const cat = r.equipment_types?.category;
        if (cat) entry[cat] = (entry[cat] || 0) + r.quantity;
      });
      (transfersOutRes.data || []).filter(r => r.source_base_id === base.id).forEach(r => {
        const cat = r.equipment_types?.category;
        if (cat) entry[cat] = (entry[cat] || 0) - r.quantity;
      });
      (assignRes.data || []).filter(r => r.base_id === base.id).forEach(r => {
        const cat = r.equipment_types?.category;
        if (cat) entry[cat] = (entry[cat] || 0) - r.quantity;
      });
      (expendRes.data || []).filter(r => r.base_id === base.id).forEach(r => {
        const cat = r.equipment_types?.category;
        if (cat) entry[cat] = (entry[cat] || 0) - r.quantity;
      });

      // Ensure non-negative
      entry.WEAPON = Math.max(0, entry.WEAPON);
      entry.VEHICLE = Math.max(0, entry.VEHICLE);
      entry.AMMUNITION = Math.max(0, entry.AMMUNITION);

      return entry;
    });

    res.json({ chartData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/v1/assets/equipment-types
 */
export const getEquipmentTypes = async (req, res) => {
  try {
    const { data, error } = await supabase.from('equipment_types').select('*').order('category').order('name');
    if (error) throw error;
    res.json({ equipmentTypes: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/v1/assets/bases
 */
export const getBases = async (req, res) => {
  try {
    const { data, error } = await supabase.from('bases').select('*').order('name');
    if (error) throw error;
    res.json({ bases: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
