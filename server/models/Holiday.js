import mongoose from 'mongoose';

const holidaySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    date: {
      type: Date,
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: ['NATIONAL', 'COMPANY', 'OPTIONAL', 'RESTRICTED'],
      default: 'NATIONAL'
    },
    description: {
      type: String
    },
    branch: {
      type: String,
      default: 'All Branches'
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

export const Holiday = mongoose.model('Holiday', holidaySchema);
