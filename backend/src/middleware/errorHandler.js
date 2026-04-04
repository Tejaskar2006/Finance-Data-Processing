/**
 * Centralized Error Handler
 * All errors thrown anywhere in the app flow to this handler.
 * Provides consistent JSON error responses.
 */

// Custom error class to include HTTP status codes
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // Distinguishes expected errors from bugs
    Error.captureStackTrace(this, this.constructor);
  }
}

// Express global error handler (4 arguments = error middleware)
const errorHandler = (err, req, res, next) => {
  let { statusCode = 500, message, isOperational } = err;

  // Handle specific Mongoose errors gracefully
  if (err.name === 'ValidationError') {
    // Mongoose model validation failed
    const errors = Object.values(err.errors).map((e) => e.message);
    message = errors.join('. ');
    statusCode = 400;
  } else if (err.code === 11000) {
    // Duplicate key (e.g., unique email)
    const field = Object.keys(err.keyValue)[0];
    message = `A record with this ${field} already exists`;
    statusCode = 409;
  } else if (err.name === 'CastError') {
    // Invalid MongoDB ObjectId format
    message = `Invalid ${err.path}: ${err.value}`;
    statusCode = 400;
  }

  // Log non-operational (unexpected) errors for debugging
  if (!isOperational || process.env.NODE_ENV === 'development') {
    console.error('❌ ERROR:', err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    // Include stack trace only in development
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = { AppError, errorHandler };
