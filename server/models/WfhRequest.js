import mongoose from 'mongoose';

const wfhRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
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
      required: true,
      default: 1
    },
    reason: {
      type: String,
      required: true,
      trim: true
    },
    workObjectives: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'],
      default: 'PENDING',
      index: true
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    comments: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

export const WfhRequest = mongoose.model('WfhRequest', wfhRequestSchema);
