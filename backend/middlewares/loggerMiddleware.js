import supabase from '../config/db.js';

export const logAuditEvent = async (userId, action, details, ipAddress = null) => {
  try {
    await supabase.from('audit_logs').insert({ user_id: userId, action, details, ip_address: ipAddress });
  } catch (error) {
    console.error('Audit log write failed:', error.message);
  }
};

export const auditMiddleware = (req, res, next) => {
  req.clientIp = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;
  req.audit = (action, details) => logAuditEvent(req.user?.id, action, details, req.clientIp);
  next();
};
