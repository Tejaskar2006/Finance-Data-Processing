/**
 * Validation Middleware using Joi
 * Wraps Joi schemas to validate req.body.
 * Returns standardized 400 errors on validation failure.
 */
const Joi = require('joi');
const { AppError } = require('./errorHandler');

// Factory: wraps a Joi schema and returns an Express middleware
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false, // Collect all errors, not just the first
      stripUnknown: true, // Remove unknown keys
    });

    if (error) {
      const message = error.details.map((d) => d.message.replace(/"/g, '')).join('. ');
      return next(new AppError(message, 400));
    }

    // Replace request body with validated/sanitized data
    req[property] = value;
    next();
  };
};

// ─── Validation Schemas ───────────────────────────────────────────────────────

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('Admin', 'Analyst', 'Viewer').default('Viewer'),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const createUserSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('Admin', 'Analyst', 'Viewer').required(),
});

const updateUserSchema = Joi.object({
  role: Joi.string().valid('Admin', 'Analyst', 'Viewer'),
  status: Joi.string().valid('active', 'inactive'),
  name: Joi.string().min(2).max(50),
}).min(1); // At least one field must be present

const VALID_CATEGORIES = [
  'Salary', 'Freelance', 'Investment', 'Rental', 'Business',
  'Food', 'Transport', 'Healthcare', 'Education', 'Entertainment',
  'Utilities', 'Shopping', 'Travel', 'Insurance', 'Tax', 'Other',
];

const createRecordSchema = Joi.object({
  amount: Joi.number().positive().required(),
  type: Joi.string().valid('income', 'expense').required(),
  category: Joi.string().valid(...VALID_CATEGORIES).required(),
  date: Joi.date().iso().default(() => new Date()),
  notes: Joi.string().max(500).allow('', null),
});

const updateRecordSchema = Joi.object({
  amount: Joi.number().positive(),
  type: Joi.string().valid('income', 'expense'),
  category: Joi.string().valid(...VALID_CATEGORIES),
  date: Joi.date().iso(),
  notes: Joi.string().max(500).allow('', null),
}).min(1);

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  createUserSchema,
  updateUserSchema,
  createRecordSchema,
  updateRecordSchema,
};
