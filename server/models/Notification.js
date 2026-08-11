import mongoose from 'mongoose';

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
      enum: ['LEAVE_APPLIED', 'LEAVE_APPROVED', 'LEAVE_REJECTED', 'LEAVE_ESCALATED', 'HOLIDAY_ANNOUNCEMENT', 'DAILY_REPORT', 'SYSTEM'],
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

export const Notification = mongoose.model('Notification', notificationSchema);
