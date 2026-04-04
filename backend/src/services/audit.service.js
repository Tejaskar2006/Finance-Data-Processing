const AuditLog = require('../models/AuditLog');

/**
 * Reusable Audit Logging Service
 */
exports.logAction = async ({ req, userId, action, entity, entityId, details }) => {
  try {
    // 1. Better IP detection (Handles Proxies/X-Forwarded-For array)
    const ipAddress = (req.ips?.length ? req.ips[0] : req.ip) || 
                      req.headers['x-forwarded-for']?.split(',')[0] || 
                      req.socket.remoteAddress || 
                      'unknown';

    // 2. String Truncation to prevent DB bloat (Cap at 500 characters)
    let sanitizedDetails = details || '';
    if (sanitizedDetails.length > 500) {
      sanitizedDetails = sanitizedDetails.substring(0, 497) + '...';
    }

    await AuditLog.create({
      userId: userId || req.user?.id,
      action,
      entity,
      entityId,
      details: sanitizedDetails,
      ipAddress,
    });
  } catch (error) {
    // Silent catch — prevent logging failure from breaking main application flow.
    console.error('Audit log failed:', error.message);
  }
};
