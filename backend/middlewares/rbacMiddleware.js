/**
 * Role-Based Access Control Middleware
 * Enforces role restrictions and base-level scoping for BASE_COMMANDER
 */

export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'Access Denied: Insufficient authorization level.',
        required: allowedRoles,
        current: req.user?.role || 'NONE',
      });
    }
    next();
  };
};

/**
 * Automatically scopes BASE_COMMANDER to their own base.
 * Admins and Logistics Officers can see all bases.
 */
export const enforceBaseScope = (req, res, next) => {
  if (req.user.role === 'BASE_COMMANDER') {
    // Force all queries to only see their assigned base
    req.query.baseId = String(req.user.baseId);
    req.body.baseId = req.user.baseId;
  }
  next();
};

/**
 * For creation endpoints: ensures BASE_COMMANDER can only
 * create records for their own base.
 */
export const enforceBaseOwnership = (req, res, next) => {
  if (req.user.role === 'BASE_COMMANDER') {
    const requestedBaseId = parseInt(req.body.baseId || req.body.base_id);
    if (requestedBaseId && requestedBaseId !== req.user.baseId) {
      return res.status(403).json({
        message: 'Access Denied: You can only manage assets for your assigned base.',
      });
    }
    req.body.baseId = req.user.baseId;
  }
  next();
};
