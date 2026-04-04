/**
 * Financial Records Controller
 * RBAC rules enforced here AND in route middleware:
 *   - Admin   → full CRUD
 *   - Analyst → read + filter + search
 *   - Viewer  → read last 10 records only (no advanced filters)
 */
const FinancialRecord = require('../models/FinancialRecord');
const { AppError } = require('../middleware/errorHandler');

// ─── GET /api/records ─────────────────────────────────────────────────────────
const getRecords = async (req, res, next) => {
  try {
    const role = req.user.role;

    // Viewer gets a hardcoded limit of 10 most recent records, no filters
    if (role === 'Viewer') {
      const records = await FinancialRecord.find()
        .populate('createdBy', 'name email')
        .sort({ date: -1 })
        .limit(10);

      return res.status(200).json({
        success: true,
        data: records,
        pagination: { page: 1, limit: 10, total: records.length, pages: 1 },
        note: 'Viewers see the 10 most recent records only',
      });
    }

    // Admin and Analyst: full filtering, search & pagination
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const filter = {};

    // Filter by type (income/expense)
    if (req.query.type && ['income', 'expense'].includes(req.query.type)) {
      filter.type = req.query.type;
    }

    // Filter by category
    if (req.query.category) {
      filter.category = req.query.category;
    }

    // Filter by date range
    if (req.query.startDate || req.query.endDate) {
      filter.date = {};
      if (req.query.startDate) filter.date.$gte = new Date(req.query.startDate);
      if (req.query.endDate) filter.date.$lte = new Date(req.query.endDate);
    }

    // Full-text search on notes and category
    if (req.query.search) {
      filter.$or = [
        { notes: { $regex: req.query.search, $options: 'i' } },
        { category: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    const sortField = req.query.sortBy || 'date';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    const [records, total] = await Promise.all([
      FinancialRecord.find(filter)
        .populate('createdBy', 'name email')
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limit),
      FinancialRecord.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: records,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/records/:id ─────────────────────────────────────────────────────
const getRecordById = async (req, res, next) => {
  try {
    const record = await FinancialRecord.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!record) return next(new AppError('Record not found', 404));

    res.status(200).json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/records (Admin only) ──────────────────────────────────────────
const createRecord = async (req, res, next) => {
  try {
    const { amount, type, category, date, notes } = req.body;

    const record = await FinancialRecord.create({
      amount,
      type,
      category,
      date: date || new Date(),
      notes,
      createdBy: req.user.id,
    });

    await record.populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Financial record created',
      data: record,
    });
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /api/records/:id (Admin only) ──────────────────────────────────────
const updateRecord = async (req, res, next) => {
  try {
    const allowedFields = ['amount', 'type', 'category', 'date', 'notes'];
    const updateData = {};
    allowedFields.forEach((f) => {
      if (req.body[f] !== undefined) updateData[f] = req.body[f];
    });

    const record = await FinancialRecord.findOneAndUpdate(
      {
        _id: req.params.id,
        // If __v is provided, enforce version match (Optimistic Concurrency)
        ...(req.body.__v !== undefined && { __v: req.body.__v }),
      },
      updateData,
      {
        new: true,
        runValidators: true,
      }
    ).populate('createdBy', 'name email');

    if (!record) {
      // Check if it's a version mismatch or just not found
      const exists = await FinancialRecord.findById(req.params.id);
      if (exists) {
        return next(
          new AppError('This record has been updated by another user. Please refresh and try again.', 409)
        );
      }
      return next(new AppError('Record not found', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Record updated successfully',
      data: record,
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/records/trash (Admin and Analyst) ───────────────────────────────
const getDeletedRecords = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const filter = { isDeleted: true };

    const [records, total] = await Promise.all([
      FinancialRecord.find(filter)
        .populate('createdBy', 'name email')
        .sort({ deletedAt: -1 })
        .skip(skip)
        .limit(limit),
      FinancialRecord.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: records,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /api/records/:id (Admin only, soft delete) ────────────────────────
const deleteRecord = async (req, res, next) => {
  try {
    const record = await FinancialRecord.findByIdAndUpdate(
      req.params.id,
      {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: req.user.id,
      },
      { new: true }
    );

    if (!record) return next(new AppError('Record not found', 404));

    res.status(200).json({
      success: true,
      message: 'Record deleted successfully (soft delete)',
    });
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /api/records/:id/restore (Admin only) ──────────────────────────────
const restoreRecord = async (req, res, next) => {
  try {
    const record = await FinancialRecord.findOneAndUpdate(
      { _id: req.params.id, isDeleted: true },
      {
        isDeleted: false,
        name: 'Record Restored', // Optional: logging/indication
        $unset: { deletedAt: 1, deletedBy: 1 },
      },
      { new: true }
    );

    if (!record) return next(new AppError('Deleted record not found', 404));

    res.status(200).json({
      success: true,
      message: 'Record restored successfully',
      data: record,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getRecords,
  getRecordById,
  getDeletedRecords,
  createRecord,
  updateRecord,
  restoreRecord,
  deleteRecord,
};
