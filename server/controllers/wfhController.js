import { WfhRequest } from '../models/WfhRequest.js';
import { User } from '../models/User.js';
import { Notification } from '../models/Notification.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/appError.js';

// Apply WFH Request
export const createWfhRequest = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const { fromDate, toDate, reason, workObjectives } = req.body;

  if (!fromDate || !toDate || !reason) {
    return next(new AppError('Please provide fromDate, toDate, and reason for WFH.', 400));
  }

  const start = new Date(fromDate);
  const end = new Date(toDate);

  if (start > end) {
    return next(new AppError('From date cannot be after To date.', 400));
  }

  // Overlap check — prevent duplicate WFH for same dates
  const overlapping = await WfhRequest.findOne({
    user: userId,
    status: { $nin: ['CANCELLED', 'REJECTED'] },
    $or: [{ fromDate: { $lte: end }, toDate: { $gte: start } }]
  });

  if (overlapping) {
    return next(new AppError('You already have a pending or approved WFH request for these dates.', 400));
  }

  const diffTime = Math.abs(end - start);
  const daysCount = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  const wfhRequest = await WfhRequest.create({
    user: userId,
    fromDate: start,
    toDate: end,
    daysCount,
    reason,
    workObjectives: workObjectives || '',
    status: 'PENDING'
  });

  // Notify reporting manager
  try {
    const managerId = req.user.reportingManager;
    if (managerId) {
      await Notification.safeCreate({
        recipient: managerId,
        title: 'New WFH Request Received',
        message: `${req.user.firstName} ${req.user.lastName} applied for ${daysCount} day(s) WFH.`,
        type: 'SYSTEM',
        targetUrl: '/wfh'
      });
    }
  } catch (err) {
    console.error('[WFH Notification Error]', err.message);
  }

  res.status(201).json({
    status: 'success',
    data: { wfhRequest }
  });
});

// Get WFH Requests
export const getWfhRequests = asyncHandler(async (req, res, next) => {
  const role = req.user.role;
  const userId = req.user._id;
  const { status } = req.query;

  let query = {};
  if (status) query.status = status;

  if (role === 'EMPLOYEE') {
    query.user = userId;
  } else if (role === 'MANAGER') {
    const teamMembers = await User.find({ reportingManager: userId }).select('_id');
    const teamIds = teamMembers.map((m) => m._id);
    teamIds.push(userId);
    query.user = { $in: teamIds };
  }

  const requests = await WfhRequest.find(query)
    .populate('user', 'firstName lastName employeeId department profileImage role')
    .populate('reviewedBy', 'firstName lastName')
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: 'success',
    data: { requests }
  });
});

// Approve WFH Request
export const approveWfhRequest = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { comments } = req.body;

  const request = await WfhRequest.findById(id).populate('user', 'firstName lastName');
  if (!request) {
    return next(new AppError('WFH request not found.', 404));
  }

  request.status = 'APPROVED';
  request.reviewedBy = req.user._id;
  request.comments = comments || 'Approved';
  await request.save();

  // Notify employee
  await Notification.safeCreate({
    recipient: request.user._id,
    title: 'WFH Request Approved ✅',
    message: `Your WFH request for ${request.daysCount} day(s) has been approved by ${req.user.firstName} ${req.user.lastName}.`,
    type: 'SYSTEM',
    targetUrl: '/wfh'
  });

  res.status(200).json({
    status: 'success',
    data: { request }
  });
});

// Reject WFH Request
export const rejectWfhRequest = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { comments } = req.body;

  const request = await WfhRequest.findById(id).populate('user', 'firstName lastName');
  if (!request) {
    return next(new AppError('WFH request not found.', 404));
  }

  request.status = 'REJECTED';
  request.reviewedBy = req.user._id;
  request.comments = comments || 'Rejected';
  await request.save();

  // Notify employee
  await Notification.safeCreate({
    recipient: request.user._id,
    title: 'WFH Request Rejected ❌',
    message: `Your WFH request has been rejected. ${comments ? `Reason: ${comments}` : ''}`,
    type: 'SYSTEM',
    targetUrl: '/wfh'
  });

  res.status(200).json({
    status: 'success',
    data: { request }
  });
});

// Cancel WFH Request (Owner)
export const cancelWfhRequest = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const request = await WfhRequest.findById(id);
  if (!request) {
    return next(new AppError('WFH request not found.', 404));
  }

  if (request.user.toString() !== req.user._id.toString()) {
    return next(new AppError('You can only cancel your own WFH requests.', 403));
  }

  request.status = 'CANCELLED';
  await request.save();

  res.status(200).json({
    status: 'success',
    data: { request }
  });
});
