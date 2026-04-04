/**
 * Auth Controller
 * Handles registration and login logic.
 * Issues JWTs on successful authentication.
 */
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { AppError } = require('../middleware/errorHandler');

// ─── Helper: Sign and return a JWT for a user ─────────────────────────────────
const signToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// ─── POST /api/auth/register ──────────────────────────────────────────────────
const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('Email is already registered', 409));
    }

    // Public registration defaults to Viewer. Role field is only used if
    // the request comes from an Admin via the /api/users endpoint.
    const newUser = await User.create({
      name,
      email,
      password,
      role: role || 'Viewer',
    });

    const token = signToken(newUser);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: newUser.toSafeObject(),
    });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Explicitly select password since it has select:false in schema
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return next(new AppError('Invalid email or password', 401));
    }

    if (user.status === 'inactive') {
      return next(new AppError('Your account is deactivated. Contact an administrator', 403));
    }

    // Update last login timestamp
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = signToken(user);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: user.toSafeObject(),
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return next(new AppError('User not found', 404));

    res.status(200).json({
      success: true,
      user: user.toSafeObject(),
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe };
