import mongoose from 'mongoose';

const leaveBalanceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    year: {
      type: Number,
      required: true,
      default: () => new Date().getFullYear()
    },
    allocations: [
      {
        leaveType: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'LeaveType',
          required: true
        },
        leaveTypeName: String,
        leaveTypeCode: String,
        colorBadge: String,
        total: {
          type: Number,
          default: 0
        },
        used: {
          type: Number,
          default: 0
        },
        pending: {
          type: Number,
          default: 0
        },
        remaining: {
          type: Number,
          default: 0
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

leaveBalanceSchema.index({ user: 1, year: 1 }, { unique: true });

export const LeaveBalance = mongoose.model('LeaveBalance', leaveBalanceSchema);
