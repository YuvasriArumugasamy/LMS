import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    userName: String,
    userRole: String,
    action: {
      type: String,
      required: true
    },
    module: {
      type: String,
      required: true
    },
    details: {
      type: String
    },
    ipAddress: {
      type: String
    },
    userAgent: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
