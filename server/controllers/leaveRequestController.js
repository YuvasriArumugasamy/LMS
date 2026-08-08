import { LeaveRequest } from '../models/LeaveRequest.js';
import { LeaveBalance } from '../models/LeaveBalance.js';
import { LeaveType } from '../models/LeaveType.js';
import { User } from '../models/User.js';
import { Notification } from '../models/Notification.js';
import { Settings } from '../models/Settings.js';
import { AppError } from '../utils/appError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AuditLog } from '../models/AuditLog.js';

export const getLeaveRequests = asyncHandler(async (req, res, next) => {
  const { status, leaveType, search, user, page = 1, limit = 10 } = req.query;
  const query = { isDeleted: false };

  // Role-based visibility scoping
  if (req.user.role === 'EMPLOYEE') {
    query.user = req.user._id;
  } else if (req.user.role === 'MANAGER') {
    // Managers can see their own requests OR requests from employees reporting to them (or all if team unassigned)
    const teamMembers = await User.find({ reportingManager: req.user._id, isDeleted: false }).select('_id');
    const teamIds = teamMembers.map((m) => m._id);
    if (teamIds.length > 0) {
      query.$or = [{ user: req.user._id }, { user: { $in: teamIds } }];
    }
  }

  if (user) query.user = user;
  if (status) {
    if (status === 'APPROVED') {
      query.status = { $in: ['HR_APPROVED', 'ADMIN_APPROVED', 'CEO_APPROVED'] };
    } else if (status === 'REJECTED') {
      query.status = { $in: ['MANAGER_REJECTED', 'HR_REJECTED', 'ADMIN_REJECTED', 'CEO_REJECTED'] };
    } else {
      query.status = status;
    }
  }
  if (leaveType) query.leaveType = leaveType;

  const skip = (Number(page) - 1) * Number(limit);
  const total = await LeaveRequest.countDocuments(query);
  const leaves = await LeaveRequest.find(query)
    .populate('user', 'firstName lastName email employeeId profileImage department designation reportingManager')
    .populate({
      path: 'user',
      populate: [
        { path: 'department', select: 'name code' },
        { path: 'designation', select: 'name code' }
      ]
    })
    .populate('leaveType', 'name code colorBadge maxDays paidLeave')
    .populate('approvalFlow.reviewer', 'firstName lastName role')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  res.status(200).json({
    status: 'success',
    data: {
      leaves,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit))
      }
    }
  });
});

export const getLeaveRequestById = asyncHandler(async (req, res, next) => {
  const leave = await LeaveRequest.findById(req.params.id)
    .populate('user', 'firstName lastName email employeeId profileImage department designation')
    .populate('leaveType', 'name code colorBadge')
    .populate('approvalFlow.reviewer', 'firstName lastName role');

  if (!leave || leave.isDeleted) return next(new AppError('Leave request not found.', 404));

  res.status(200).json({ status: 'success', data: { leave } });
});

export const applyLeave = asyncHandler(async (req, res, next) => {
  const { leaveType, fromDate, toDate, isHalfDay, halfDayType, isEmergency, reason, contactNumber, attachments } = req.body;
  const userId = req.user._id;

  const start = new Date(fromDate);
  const end = new Date(toDate);

  if (start > end) {
    return next(new AppError('From Date cannot be later than To Date.', 400));
  }

  // Calculate day count
  const diffTime = Math.abs(end - start);
  let daysCount = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  if (isHalfDay) daysCount = 0.5;

  // Prevent overlapping leave requests
  const overlapping = await LeaveRequest.findOne({
    user: userId,
    isDeleted: false,
    status: { $nin: ['CANCELLED', 'MANAGER_REJECTED', 'HR_REJECTED'] },
    $or: [
      { fromDate: { $lte: end }, toDate: { $gte: start } }
    ]
  });

  if (overlapping) {
    return next(new AppError('You already have a pending or approved leave request during these dates.', 400));
  }

  // Check Leave Balance
  const currentYear = new Date().getFullYear();
  let userBalance = await LeaveBalance.findOne({ user: userId, year: currentYear });

  if (!userBalance) {
    // Auto-create balance entry if missing
    const activeLeaveTypes = await LeaveType.find({ status: 'ACTIVE', isDeleted: false });
    const allocations = activeLeaveTypes.map((lt) => ({
      leaveType: lt._id,
      leaveTypeName: lt.name,
      leaveTypeCode: lt.code,
      colorBadge: lt.colorBadge,
      total: lt.maxDays,
      used: 0,
      pending: 0,
      remaining: lt.maxDays
    }));

    userBalance = await LeaveBalance.create({ user: userId, year: currentYear, allocations });
  }

  const alloc = userBalance.allocations.find((a) => a.leaveType.toString() === leaveType);
  if (alloc && alloc.remaining < daysCount) {
    return next(new AppError(`Insufficient leave balance! You have ${alloc.remaining} days remaining for this leave type.`, 400));
  }

  // Fetch escalation timer settings
  const settings = await Settings.findOne() || { emergencyEscalationMinutes: 5 };
  const escalationMinutes = settings.emergencyEscalationMinutes || 5;

  const now = new Date();
  const escalationDeadline = isEmergency ? new Date(now.getTime() + escalationMinutes * 60000) : null;

  const newLeave = await LeaveRequest.create({
    user: userId,
    leaveType,
    fromDate: start,
    toDate: end,
    daysCount,
    isHalfDay: !!isHalfDay,
    halfDayType: halfDayType || 'NONE',
    isEmergency: !!isEmergency,
    reason,
    contactNumber,
    attachments: attachments || [],
    status: 'PENDING',
    escalationDeadline,
    approvalFlow: [
      {
        reviewer: userId,
        reviewerRole: req.user.role,
        action: 'APPLIED',
        comments: isEmergency ? 'Applied Urgent Emergency Leave' : 'Leave request submitted',
        timestamp: now
      }
    ]
  });

  // Update Pending Balance
  if (alloc) {
    alloc.pending += daysCount;
    alloc.remaining -= daysCount;
    await userBalance.save();
  }

  // 1. Notify Applicant
  await Notification.create({
    recipient: userId,
    title: isEmergency ? '🚨 Urgent Emergency Leave Submitted' : 'Leave Application Submitted',
    message: `Your leave request for ${daysCount} day(s) (${start.toLocaleDateString()} - ${end.toLocaleDateString()}) has been submitted successfully.`,
    type: 'LEAVE_APPLIED',
    targetUrl: '/leaves'
  });

  // 2. Notify Reporting Manager if assigned
  const managerId = req.user.reportingManager;
  if (managerId && managerId.toString() !== userId.toString()) {
    await Notification.create({
      recipient: managerId,
      title: isEmergency ? '🚨 Urgent Emergency Leave Request' : 'New Leave Request Received',
      message: `${req.user.firstName} ${req.user.lastName} applied for ${daysCount} day(s) leave.`,
      type: 'LEAVE_APPLIED',
      targetUrl: '/leaves'
    });
  }

  // 3. Notify HR and Super Admin Managers
  try {
    const hrAdmins = await User.find({
      role: { $in: ['HR', 'SUPER_ADMIN'] },
      status: 'ACTIVE',
      _id: { $ne: userId }
    });

    for (const adminUser of hrAdmins) {
      await Notification.create({
        recipient: adminUser._id,
        title: isEmergency ? '🚨 Urgent Emergency Leave Alert' : 'New Leave Application Submitted',
        message: `${req.user.firstName} ${req.user.lastName} (${req.user.employeeId}) applied for ${daysCount} day(s) leave.`,
        type: 'LEAVE_APPLIED',
        targetUrl: '/leaves'
      });
    }
  } catch (err) {
    console.error('[Notification Dispatch Error]', err);
  }

  await AuditLog.create({
    user: userId,
    userName: `${req.user.firstName} ${req.user.lastName}`,
    userRole: req.user.role,
    action: 'LEAVE_APPLY',
    module: 'LEAVE',
    details: `Applied ${isEmergency ? 'Emergency ' : ''}leave from ${fromDate} to ${toDate}`
  });

  res.status(201).json({
    status: 'success',
    data: { leave: newLeave }
  });
});

export const approveLeave = asyncHandler(async (req, res, next) => {
  const { comments } = req.body;
  const leave = await LeaveRequest.findById(req.params.id)
    .populate('user')
    .populate('leaveType');

  if (!leave || leave.isDeleted) return next(new AppError('Leave request not found.', 404));

  const reviewerRole = req.user.role;
  const applicantRole = leave.user?.role || 'EMPLOYEE';
  const isSelfRequest = leave.user?._id.toString() === req.user._id.toString();
  const previousStatus = leave.status;
  const now = new Date();

  // Rule: Users cannot approve their own leave request (except CEO)
  if (isSelfRequest && reviewerRole !== 'CEO') {
    return next(new AppError('You cannot approve your own leave request.', 403));
  }

  // Prevent approval if leave request is already finalized or rejected
  if (['CEO_APPROVED', 'MANAGER_REJECTED', 'HR_REJECTED', 'ADMIN_REJECTED', 'CEO_REJECTED', 'CANCELLED'].includes(leave.status)) {
    return next(new AppError(`This leave request is already finalized or rejected (${leave.status.replace('_', ' ')}).`, 400));
  }

  // Sequential Approval Flow Implementation based on Applicant Role
  if (applicantRole === 'EMPLOYEE') {
    // Sequential Flow: TL (MANAGER) -> HR -> Admin (SUPER_ADMIN) -> CEO
    if (leave.status === 'PENDING' || leave.status === 'ESCALATED_TO_HR') {
      if (!['MANAGER', 'CEO'].includes(reviewerRole)) {
        return next(new AppError('Employee leave request requires TL (Manager) approval first.', 403));
      }
      leave.status = 'MANAGER_APPROVED';
      leave.approvalFlow.push({
        reviewer: req.user._id,
        reviewerRole: reviewerRole,
        action: 'MANAGER_APPROVE',
        comments: comments || 'Approved by Team Lead (Manager). Pending HR approval.',
        timestamp: now
      });
    } else if (leave.status === 'MANAGER_APPROVED') {
      if (!['HR', 'CEO'].includes(reviewerRole)) {
        return next(new AppError('Employee leave request requires HR approval next.', 403));
      }
      leave.status = 'HR_APPROVED';
      leave.approvalFlow.push({
        reviewer: req.user._id,
        reviewerRole: reviewerRole,
        action: 'HR_APPROVE',
        comments: comments || 'Approved by HR. Pending Admin approval.',
        timestamp: now
      });
    } else if (leave.status === 'HR_APPROVED') {
      if (!['SUPER_ADMIN', 'CEO'].includes(reviewerRole)) {
        return next(new AppError('Employee leave request requires Admin (Super Admin) approval next.', 403));
      }
      leave.status = 'ADMIN_APPROVED';
      leave.approvalFlow.push({
        reviewer: req.user._id,
        reviewerRole: reviewerRole,
        action: 'ADMIN_APPROVE',
        comments: comments || 'Approved by Admin. Pending CEO final confirmation.',
        timestamp: now
      });
    } else if (leave.status === 'ADMIN_APPROVED') {
      if (reviewerRole !== 'CEO') {
        return next(new AppError('Employee leave request requires CEO final approval.', 403));
      }
      leave.status = 'CEO_APPROVED';
      leave.approvalFlow.push({
        reviewer: req.user._id,
        reviewerRole: 'CEO',
        action: 'CEO_APPROVE',
        comments: comments || 'Final executive approval granted by CEO.',
        timestamp: now
      });
    }
  } else if (applicantRole === 'MANAGER') {
    // Sequential Flow for TL/Manager: HR -> Admin (SUPER_ADMIN) -> CEO
    if (leave.status === 'PENDING' || leave.status === 'ESCALATED_TO_HR') {
      if (!['HR', 'CEO'].includes(reviewerRole)) {
        return next(new AppError('TL leave request requires HR approval first.', 403));
      }
      leave.status = 'HR_APPROVED';
      leave.approvalFlow.push({
        reviewer: req.user._id,
        reviewerRole: reviewerRole,
        action: 'HR_APPROVE',
        comments: comments || 'Approved by HR for TL leave. Pending Admin approval.',
        timestamp: now
      });
    } else if (leave.status === 'HR_APPROVED') {
      if (!['SUPER_ADMIN', 'CEO'].includes(reviewerRole)) {
        return next(new AppError('TL leave request requires Admin (Super Admin) approval next.', 403));
      }
      leave.status = 'ADMIN_APPROVED';
      leave.approvalFlow.push({
        reviewer: req.user._id,
        reviewerRole: reviewerRole,
        action: 'ADMIN_APPROVE',
        comments: comments || 'Approved by Admin for TL leave. Pending CEO final confirmation.',
        timestamp: now
      });
    } else if (leave.status === 'ADMIN_APPROVED') {
      if (reviewerRole !== 'CEO') {
        return next(new AppError('TL leave request requires CEO final approval.', 403));
      }
      leave.status = 'CEO_APPROVED';
      leave.approvalFlow.push({
        reviewer: req.user._id,
        reviewerRole: 'CEO',
        action: 'CEO_APPROVE',
        comments: comments || 'Final executive approval granted by CEO for TL leave.',
        timestamp: now
      });
    }
  } else if (applicantRole === 'SUPER_ADMIN') {
    // Sequential Flow for Admin: HR -> CEO
    if (leave.status === 'PENDING' || leave.status === 'ESCALATED_TO_HR') {
      if (!['HR', 'CEO'].includes(reviewerRole)) {
        return next(new AppError('Admin leave request requires HR approval first.', 403));
      }
      leave.status = 'HR_APPROVED';
      leave.approvalFlow.push({
        reviewer: req.user._id,
        reviewerRole: reviewerRole,
        action: 'HR_APPROVE',
        comments: comments || 'Approved by HR for Admin leave. Pending CEO final confirmation.',
        timestamp: now
      });
    } else if (leave.status === 'HR_APPROVED') {
      if (reviewerRole !== 'CEO') {
        return next(new AppError('Admin leave request requires CEO final approval.', 403));
      }
      leave.status = 'CEO_APPROVED';
      leave.approvalFlow.push({
        reviewer: req.user._id,
        reviewerRole: 'CEO',
        action: 'CEO_APPROVE',
        comments: comments || 'Final executive approval granted by CEO for Admin leave.',
        timestamp: now
      });
    }
  } else if (applicantRole === 'HR') {
    // Sequential Flow for HR: Admin (SUPER_ADMIN) -> CEO
    if (leave.status === 'PENDING' || leave.status === 'ESCALATED_TO_HR') {
      if (!['SUPER_ADMIN', 'CEO'].includes(reviewerRole)) {
        return next(new AppError('HR leave request requires Admin (Super Admin) approval first.', 403));
      }
      leave.status = 'ADMIN_APPROVED';
      leave.approvalFlow.push({
        reviewer: req.user._id,
        reviewerRole: reviewerRole,
        action: 'ADMIN_APPROVE',
        comments: comments || 'Approved by Admin for HR leave. Pending CEO final confirmation.',
        timestamp: now
      });
    } else if (leave.status === 'ADMIN_APPROVED') {
      if (reviewerRole !== 'CEO') {
        return next(new AppError('HR leave request requires CEO final approval.', 403));
      }
      leave.status = 'CEO_APPROVED';
      leave.approvalFlow.push({
        reviewer: req.user._id,
        reviewerRole: 'CEO',
        action: 'CEO_APPROVE',
        comments: comments || 'Final executive approval granted by CEO for HR leave.',
        timestamp: now
      });
    }
  } else if (applicantRole === 'CEO') {
    leave.status = 'CEO_APPROVED';
    leave.approvalFlow.push({
      reviewer: req.user._id,
      reviewerRole: 'CEO',
      action: 'CEO_APPROVE',
      comments: comments || 'CEO self leave confirmed.',
      timestamp: now
    });
  }

  // Deduct from Pending and add to Used ONLY when leave reaches final CEO_APPROVED status
  if (leave.status === 'CEO_APPROVED') {
    const currentYear = new Date(leave.fromDate).getFullYear();
    const balance = await LeaveBalance.findOne({ user: leave.user._id, year: currentYear });
    if (balance) {
      const alloc = balance.allocations.find((a) => a.leaveType.toString() === leave.leaveType._id.toString());
      if (alloc) {
        alloc.pending = Math.max(0, alloc.pending - leave.daysCount);
        alloc.used += leave.daysCount;
        await balance.save();
      }
    }
  }

  await leave.save();

  // Notify Employee / Applicant
  await Notification.create({
    recipient: leave.user._id,
    title: leave.status === 'CEO_APPROVED' ? 'Leave Request Final Approved by CEO ✅' : `Leave Request Status Updated: ${leave.status.replace('_', ' ')}`,
    message: `Your leave request for ${leave.daysCount} day(s) has been updated to ${leave.status.replace('_', ' ')}.`,
    type: 'LEAVE_APPROVED',
    targetUrl: '/leaves'
  });

  // Level 1 -> Level 2 Notification Dispatch: Notify CEO if Level 1 approval was done and CEO final approval is pending
  if (leave.status === 'ADMIN_APPROVED' || leave.status === 'HR_APPROVED') {
    try {
      const ceoUsers = await User.find({ role: 'CEO', status: 'ACTIVE' });
      for (const ceo of ceoUsers) {
        await Notification.create({
          recipient: ceo._id,
          title: `🚨 CEO Level 2 Final Approval Required (${applicantRole} Leave)`,
          message: `${leave.user?.firstName} ${leave.user?.lastName} (${applicantRole}) leave request has passed Level 1 and requires your CEO final approval.`,
          type: 'LEAVE_APPLIED',
          targetUrl: '/leaves'
        });
      }
    } catch (err) {
      console.error('[Notification Dispatch Error]', err);
    }
  }

  res.status(200).json({ status: 'success', data: { leave } });
});

export const rejectLeave = asyncHandler(async (req, res, next) => {
  const { comments } = req.body;
  if (!comments) return next(new AppError('Rejection reason/comments are required.', 400));

  const leave = await LeaveRequest.findById(req.params.id);
  if (!leave || leave.isDeleted) return next(new AppError('Leave request not found.', 404));

  const reviewerRole = req.user.role;
  const previousStatus = leave.status;
  const now = new Date();

  if (['MANAGER_REJECTED', 'HR_REJECTED', 'ADMIN_REJECTED', 'CEO_REJECTED', 'CANCELLED'].includes(leave.status)) {
    return next(new AppError(`This leave request has already been rejected/cancelled (${leave.status.replace('_', ' ')}).`, 400));
  }

  let rejectStatus = 'MANAGER_REJECTED';
  let rejectAction = 'MANAGER_REJECT';

  if (reviewerRole === 'HR') {
    rejectStatus = 'HR_REJECTED';
    rejectAction = 'HR_REJECT';
  } else if (reviewerRole === 'SUPER_ADMIN') {
    rejectStatus = 'ADMIN_REJECTED';
    rejectAction = 'ADMIN_REJECT';
  } else if (reviewerRole === 'CEO') {
    rejectStatus = 'CEO_REJECTED';
    rejectAction = 'CEO_REJECT';
  }

  leave.status = rejectStatus;
  leave.approvalFlow.push({
    reviewer: req.user._id,
    reviewerRole: reviewerRole,
    action: rejectAction,
    comments,
    timestamp: now
  });

  await leave.save();

  // Restore Leave Balance based on previous status
  const currentYear = new Date(leave.fromDate).getFullYear();
  const balance = await LeaveBalance.findOne({ user: leave.user, year: currentYear });
  if (balance) {
    const alloc = balance.allocations.find((a) => a.leaveType.toString() === leave.leaveType.toString());
    if (alloc) {
      if (['HR_APPROVED', 'ADMIN_APPROVED', 'CEO_APPROVED'].includes(previousStatus)) {
        alloc.used = Math.max(0, alloc.used - leave.daysCount);
        alloc.remaining += leave.daysCount;
      } else if (['PENDING', 'MANAGER_APPROVED', 'ESCALATED_TO_HR'].includes(previousStatus)) {
        alloc.pending = Math.max(0, alloc.pending - leave.daysCount);
        alloc.remaining += leave.daysCount;
      }
      await balance.save();
    }
  }

  // Notify Employee
  await Notification.create({
    recipient: leave.user,
    title: `Leave Request Rejected by ${reviewerRole} ❌`,
    message: `Your leave request has been rejected. Reason: ${comments}`,
    type: 'LEAVE_REJECTED',
    targetUrl: '/leaves'
  });

  res.status(200).json({ status: 'success', data: { leave } });
});

export const cancelLeave = asyncHandler(async (req, res, next) => {
  const leave = await LeaveRequest.findById(req.params.id);
  if (!leave || leave.isDeleted) return next(new AppError('Leave request not found.', 404));

  if (leave.user.toString() !== req.user._id.toString() && req.user.role === 'EMPLOYEE') {
    return next(new AppError('You can only cancel your own leave requests.', 403));
  }

  const previousStatus = leave.status;
  leave.status = 'CANCELLED';
  leave.approvalFlow.push({
    reviewer: req.user._id,
    reviewerRole: req.user.role,
    action: 'CANCELLED',
    comments: 'Leave request cancelled by user',
    timestamp: new Date()
  });

  await leave.save();

  // Restore balance based on previous status
  const currentYear = new Date(leave.fromDate).getFullYear();
  const balance = await LeaveBalance.findOne({ user: leave.user, year: currentYear });
  if (balance) {
    const alloc = balance.allocations.find((a) => a.leaveType.toString() === leave.leaveType.toString());
    if (alloc) {
      if (previousStatus === 'HR_APPROVED') {
        alloc.used = Math.max(0, alloc.used - leave.daysCount);
        alloc.remaining += leave.daysCount;
      } else if (['PENDING', 'MANAGER_APPROVED', 'ESCALATED_TO_HR'].includes(previousStatus)) {
        alloc.pending = Math.max(0, alloc.pending - leave.daysCount);
        alloc.remaining += leave.daysCount;
      }
      await balance.save();
    }
  }

  res.status(200).json({ status: 'success', data: { leave } });
});

export const getLeaveBalances = asyncHandler(async (req, res, next) => {
  const targetUser = req.query.userId || req.user._id;
  const year = req.query.year || new Date().getFullYear();

  let balance = await LeaveBalance.findOne({ user: targetUser, year }).populate('allocations.leaveType');

  if (!balance) {
    const activeLeaveTypes = await LeaveType.find({ status: 'ACTIVE', isDeleted: false });
    const allocations = activeLeaveTypes.map((lt) => ({
      leaveType: lt._id,
      leaveTypeName: lt.name,
      leaveTypeCode: lt.code,
      colorBadge: lt.colorBadge,
      total: lt.maxDays,
      used: 0,
      pending: 0,
      remaining: lt.maxDays
    }));

    balance = await LeaveBalance.create({ user: targetUser, year, allocations });
  }

  res.status(200).json({ status: 'success', data: { balance } });
});
