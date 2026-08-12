import mongoose from 'mongoose';

const leaveRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    leaveType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LeaveType',
      required: true
    },
    fromDate: {
      type: Date,
      required: true
    },
    toDate: {
      type: Date,
      required: true
    },
    daysCount: {
      type: Number,
      required: true
    },
    isHalfDay: {
      type: Boolean,
      default: false
    },
    halfDayType: {
      type: String,
      enum: ['FIRST_HALF', 'SECOND_HALF', 'NONE'],
      default: 'NONE'
    },
    isEmergency: {
      type: Boolean,
      default: false,
      index: true
    },
    reason: {
      type: String,
      required: true
    },
    contactNumber: {
      type: String
    },
    attachments: [
      {
        fileName: String,
        fileUrl: String,
        fileType: String
      }
    ],
    status: {
      type: String,
      default: 'PENDING',
      index: true
    },
    escalatedAt: {
      type: Date
    },
    escalationDeadline: {
      type: Date
    },
    approvalFlow: [
      {
        reviewer: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        reviewerRole: {
          type: String
        },
        action: {
          type: String
        },
        comments: String,
        timestamp: {
          type: Date,
          default: Date.now
        }
      }
    ],
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

export const LeaveRequest = mongoose.model('LeaveRequest', leaveRequestSchema);
