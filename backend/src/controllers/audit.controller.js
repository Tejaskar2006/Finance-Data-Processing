const AuditLog = require('../models/AuditLog');

/**
 * Get all audit logs (Admin only)
 * Support filters: userId, action, startDate, endDate, pagination
 */
exports.getAllLogs = async (req, res, next) => {
  try {
    const { userId, action, startDate, endDate, page = 1, limit = 20 } = req.query;

    const query = {};

    if (userId) query.userId = userId;
    if (action) query.action = action;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const total = await AuditLog.countDocuments(query);
    const pages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;

    const logs = await AuditLog.find(query)
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      data: logs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single audit log by ID (Admin only)
 */
exports.getLogById = async (req, res, next) => {
  try {
    const log = await AuditLog.findById(req.params.id).populate('userId', 'name email role');
    if (!log) {
      return res.status(404).json({ success: false, message: 'Log not found' });
    }
    res.status(200).json({ success: true, data: log });
  } catch (error) {
    next(error);
  }
};
