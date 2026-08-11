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
    notes: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// Prevent multiple attendance records for the same user on the same date
attendanceSchema.index({ user: 1, date: 1 }, { unique: true });

export const Attendance = mongoose.model('Attendance', attendanceSchema);
