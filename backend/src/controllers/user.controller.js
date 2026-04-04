/**
 * User Controller (Admin Only)
 * Full CRUD for user management.
 * All routes guarded by authenticate + authorize('Admin') middleware.
 */
const User = require('../models/User');
const { AppError } = require('../middleware/errorHandler');
const { logAction } = require('../services/audit.service');

// ─── GET /api/users — Get all users (paginated) ───────────────────────────────
const getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
      User.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: users,
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

// ─── GET /api/users/:id — Get single user ─────────────────────────────────────
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return next(new AppError('User not found', 404));

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/users — Admin creates a user with any role ─────────────────────
const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return next(new AppError('Email already in use', 409));

    const user = await User.create({ name, email, password, role });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user.toSafeObject(),
    });

    // Log the action
    logAction({
      req,
      action: 'CREATE_USER',
      entity: 'User',
      entityId: user._id,
      details: `Admin created user: ${user.email} with role ${user.role}`,
    });
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /api/users/:id — Update user role or status ────────────────────────
const updateUser = async (req, res, next) => {
  try {
    // Prevent admin from accidentally deactivating themselves
    if (req.params.id === req.user.id && req.body.status === 'inactive') {
      return next(new AppError('You cannot deactivate your own account', 400));
    }

    const updateFields = {};
    if (req.body.role) updateFields.role = req.body.role;
    if (req.body.status) updateFields.status = req.body.status;
    if (req.body.name) updateFields.name = req.body.name;

    const user = await User.findByIdAndUpdate(req.params.id, updateFields, {
      new: true,        // Return updated document
      runValidators: true,
    });

    if (!user) return next(new AppError('User not found', 404));

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: user.toSafeObject(),
    });

    // Log the action
    logAction({
      req,
      action: req.body.role ? 'ROLE_CHANGE' : 'UPDATE_USER',
      entity: 'User',
      entityId: user._id,
      details: `Admin updated user ${user.email}. Role change: ${!!req.body.role}. New status: ${user.status}`,
    });
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /api/users/:id — Deactivate (soft-delete) a user ─────────────────
const deactivateUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user.id) {
      return next(new AppError('You cannot deactivate your own account', 400));
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: 'inactive' },
      { new: true }
    );

    if (!user) return next(new AppError('User not found', 404));

    res.status(200).json({
      success: true,
      message: 'User deactivated successfully',
      data: user.toSafeObject(),
    });

    // Log the action
    logAction({
      req,
      action: 'DEACTIVATE_USER',
      entity: 'User',
      entityId: user._id,
      details: `Admin deactivated user: ${user.email}`,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllUsers, getUserById, createUser, updateUser, deactivateUser };
