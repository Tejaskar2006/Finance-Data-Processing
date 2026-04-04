/**
 * FinancialRecord Model - Mongoose Schema
 * Tracks all income and expense entries with soft-delete support.
 * Linked to the User who created it via a reference.
 */
const mongoose = require('mongoose');

const VALID_CATEGORIES = [
  'Salary', 'Freelance', 'Investment', 'Rental', 'Business',
  'Food', 'Transport', 'Healthcare', 'Education', 'Entertainment',
  'Utilities', 'Shopping', 'Travel', 'Insurance', 'Tax', 'Other',
];

const financialRecordSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    type: {
      type: String,
      enum: ['income', 'expense'],
      required: [true, 'Transaction type is required'],
    },
    category: {
      type: String,
      enum: VALID_CATEGORIES,
      required: [true, 'Category is required'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Soft delete — never physically remove records, just mark them
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// ─── Index for faster querying ────────────────────────────────────────────────
financialRecordSchema.index({ type: 1, date: -1 });
financialRecordSchema.index({ category: 1 });
financialRecordSchema.index({ isDeleted: 1 });
financialRecordSchema.index({ createdBy: 1 });
// Text index enables full-text search on notes and category
financialRecordSchema.index({ notes: 'text', category: 'text' });

// ─── Query Helper: Always exclude soft-deleted by default ─────────────────────
financialRecordSchema.pre(/^find/, function (next) {
  // Only apply default filter if not explicitly overridden
  if (!this._conditions.hasOwnProperty('isDeleted')) {
    this.where({ isDeleted: false });
  }
  next();
});

module.exports = mongoose.model('FinancialRecord', financialRecordSchema);
module.exports.VALID_CATEGORIES = VALID_CATEGORIES;
