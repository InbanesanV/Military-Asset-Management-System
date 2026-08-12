import supabase from '../config/db.js';

export const getAuditLogs = async (req, res) => {
  try {
    const { action, userId, startDate, endDate, page = 1, limit = 50 } = req.query;
    const from = (parseInt(page) - 1) * parseInt(limit);
    const to = from + parseInt(limit) - 1;

    let q = supabase
      .from('audit_logs')
      .select('id, action, details, ip_address, created_at, users(username)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (action) q = q.eq('action', action);
    if (userId) q = q.eq('user_id', parseInt(userId));
    if (startDate) q = q.gte('created_at', startDate);
    if (endDate) q = q.lte('created_at', endDate);

    const { data, error, count } = await q;
    if (error) throw error;

    const logs = (data || []).map(log => ({
      ...log,
      username: log.users?.username,
    }));

    res.json({ logs, total: count || 0, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
