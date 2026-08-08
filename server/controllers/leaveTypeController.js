import { LeaveType } from '../models/LeaveType.js';
import { LeaveBalance } from '../models/LeaveBalance.js';
import { AppError } from '../utils/appError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getLeaveTypes = asyncHandler(async (req, res, next) => {
  const leaveTypes = await LeaveType.find({ isDeleted: false }).sort({ name: 1 });
  res.status(200).json({
    status: 'success',
    data: { leaveTypes }
  });
});

export const createLeaveType = asyncHandler(async (req, res, next) => {
  const { name, code } = req.body;
  const existing = await LeaveType.findOne({ $or: [{ name }, { code }], isDeleted: false });
  if (existing) {
    return next(new AppError('Leave type with this name or code already exists.', 400));
  }

  const leaveType = await LeaveType.create(req.body);

  // Synchronize new leave type to all active user leave balances
  const balances = await LeaveBalance.find();
  for (let bal of balances) {
    bal.allocations.push({
      leaveType: leaveType._id,
      leaveTypeName: leaveType.name,
      leaveTypeCode: leaveType.code,
      colorBadge: leaveType.colorBadge,
      total: leaveType.maxDays,
      used: 0,
      pending: 0,
      remaining: leaveType.maxDays
    });
    await bal.save();
  }

  res.status(201).json({
    status: 'success',
    data: { leaveType }
  });
});

export const updateLeaveType = asyncHandler(async (req, res, next) => {
  const leaveType = await LeaveType.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!leaveType) return next(new AppError('Leave type not found.', 404));

  res.status(200).json({
    status: 'success',
    data: { leaveType }
  });
});

export const deleteLeaveType = asyncHandler(async (req, res, next) => {
  const leaveType = await LeaveType.findByIdAndUpdate(req.params.id, { isDeleted: true });
  if (!leaveType) return next(new AppError('Leave type not found.', 404));

  res.status(200).json({
    status: 'success',
    message: 'Leave type disabled successfully.'
  });
});
