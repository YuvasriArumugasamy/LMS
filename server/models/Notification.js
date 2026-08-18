import mongoose from 'mongoose';

const VALID_NOTIFICATION_TYPES = ['LEAVE_APPLIED', 'LEAVE_APPROVED', 'LEAVE_REJECTED', 'LEAVE_ESCALATED', 'HOLIDAY_ANNOUNCEMENT', 'DAILY_REPORT', 'SYSTEM'];

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: VALID_NOTIFICATION_TYPES,
      default: 'SYSTEM'
    },
    isRead: {
      type: Boolean,
      default: false
    },
    targetUrl: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

// Compound index for optimized notification queries
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

// Pre-save hook: sanitize type to prevent invalid enum errors crashing the app
notificationSchema.pre('save', function (next) {
  if (!VALID_NOTIFICATION_TYPES.includes(this.type)) {
    this.type = 'SYSTEM';
  }
  next();
});

// Safe static helper to create notifications without crashing on invalid input
notificationSchema.statics.safeCreate = async function (data) {
  try {
    if (!data || !data.recipient) {
      console.warn('[Notification] Skipped: missing recipient', data);
      return null;
    }
    if (!VALID_NOTIFICATION_TYPES.includes(data.type)) {
      console.warn(`[Notification] Invalid type "${data.type}" — defaulting to SYSTEM`);
      data.type = 'SYSTEM';
    }
    return await this.create(data);
  } catch (err) {
    console.error('[Notification safeCreate Error]', err.message);
    return null;
  }
};

export const Notification = mongoose.model('Notification', notificationSchema);
