import mongoose from 'mongoose';

const leaveTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },
    maxDays: {
      type: Number,
      required: true,
      default: 12
    },
    paidLeave: {
      type: Boolean,
      default: true
    },
    carryForward: {
      type: Boolean,
      default: false
    },
    maxCarryForwardDays: {
      type: Number,
      default: 0
    },
    documentRequired: {
      type: Boolean,
      default: false
    },
    allowHalfDay: {
      type: Boolean,
      default: true
    },
    colorBadge: {
      type: String,
      default: '#2563EB'
    },
    description: {
      type: String
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      default: 'ACTIVE'
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

export const LeaveType = mongoose.model('LeaveType', leaveTypeSchema);
