const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'LOGIN',
        'LOGOUT',
        'CREATE_RECORD',
        'UPDATE_RECORD',
        'DELETE_RECORD',
        'RESTORE_RECORD',
        'CREATE_USER',
        'UPDATE_USER',
        'DEACTIVATE_USER',
        'ROLE_CHANGE',
        'ACCESS_REQUEST_CREATED',
        'ACCESS_REQUEST_APPROVED',
        'ACCESS_REQUEST_REJECTED',
      ],
    },
    entity: {
      type: String,
      required: true,
      enum: ['User', 'FinancialRecord', 'AccessRequest', 'System'],
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    details: {
      type: String,
      required: true,
    },
    ipAddress: {
      type: String,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Only log when it was created
  }
);

// Indexed for faster auditing searches
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ entity: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
