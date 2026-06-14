import ApiError from '../utils/ApiError.js';

/**
 * Role-based access control middleware.
 * Must be used after `authenticate` so req.user is already populated.
 *
 * Usage: requireRole('admin')  or  requireRole('admin', 'customer')
 */
export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new ApiError(403, 'Access denied: insufficient permissions'));
  }
  next();
};
