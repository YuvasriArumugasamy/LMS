import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    date: {
      type: Date,
      required: true,
      index: true
    },
    clockIn: {
      type: Date,
      required: true
    },
    clockOut: {
      type: Date
    },
    lunchOut: {
      type: Date
    },
    lunchIn: {
      type: Date
    },
    workLocation: {
      type: String,
      enum: ['IN_OFFICE', 'WFH', 'ON_FIELD'],
      default: 'IN_OFFICE'
    },
    status: {
      type: String,
      enum: ['PRESENT', 'HALF_DAY', 'LATE', 'ABSENT', 'OVER_DUTY', 'OD', 'WEEK_OFF'],
      default: 'PRESENT'
    },
    totalHours: {
      type: Number,
      default: 0
    },
    extraBreakMs: {
      type: Number,
      default: 0
    },
    notes: {
      type: String,
      trim: true
    },
    timeline: [
      {
        type: {
          type: String,
          enum: ['CLOCK_IN', 'CLOCK_OUT', 'LUNCH_OUT', 'LUNCH_IN', 'FORCE_CHECKOUT'],
          required: true
        },
        timestamp: {
          type: Date,
          default: Date.now
        },
        workLocation: String,
        note: String
      }
    ],
    role: {
      type: String,
      enum: ['ADMIN', 'HR', 'TEAM_LEAD', 'EMPLOYEE', 'CEO']
    }
  },
  {
    timestamps: true
  }
);

// Prevent multiple attendance records for the same user on the same date
attendanceSchema.index({ user: 1, date: 1 }, { unique: true });

// Additional compound indexes for queries
attendanceSchema.index({ date: 1, status: 1 }); // For monthly reports by status
attendanceSchema.index({ user: 1, date: -1 }); // For user attendance history

export const Attendance = mongoose.model('Attendance', attendanceSchema);
