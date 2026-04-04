/**
 * Authentication Middleware
 * Verifies the JWT from the Authorization header.
 * Attaches decoded user payload to req.user.
 *
 * Usage: router.get('/protected', authenticate, handler)
 */
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { AppError } = require('./errorHandler');

const authenticate = async (req, res, next) => {
  try {
    // 1. Extract token from Authorization header (Bearer <token>)
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError('No authentication token provided', 401));
    }

    const token = authHeader.split(' ')[1];

    // 2. Verify token signature and expiry
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return next(new AppError('Token has expired. Please log in again', 401));
      }
      return next(new AppError('Invalid token. Please log in again', 401));
    }

    // 3. Confirm user still exists and is active
    const user = await User.findById(decoded.id).select('+status +role');
    if (!user) {
      return next(new AppError('User no longer exists', 401));
    }
    if (user.status === 'inactive') {
      return next(new AppError('Your account has been deactivated. Contact admin', 403));
    }

    // 4. Attach user to request for downstream middleware/controllers
    req.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    };

    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Authorization Middleware Factory (RBAC)
 * Creates role-based guards that restrict route access.
 *
 * Usage: authorize('Admin')  or  authorize('Admin', 'Analyst')
 *
 * How RBAC works:
 *  - authenticate() first populates req.user with role info
 *  - authorize() checks if the user's role is in the allowed list
 *  - If not allowed → 403 Forbidden response
 *  - No frontend bypass is possible because all checks are server-side
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          `Access denied. Required role(s): ${allowedRoles.join(', ')}. Your role: ${req.user.role}`,
          403
        )
      );
    }
    next();
  };
};

module.exports = { authenticate, authorize };
