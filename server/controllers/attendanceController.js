import { Attendance } from '../models/Attendance.js';
import { User } from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/appError.js';

// Get today's start and end date in IST (Asia/Kolkata timezone)
const getTodayDateRange = () => {
  const now = new Date();
  const istDateStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(now);
  const start = new Date(`${istDateStr}T00:00:00.000+05:30`);
  const end = new Date(`${istDateStr}T23:59:59.999+05:30`);
  return { start, end };
};

// Helper to get IST hours, minutes, and day regardless of server UTC environment
const getISTTime = (date = new Date()) => {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    hour: 'numeric',
    minute: 'numeric',
    weekday: 'short',
    hour12: false
  });
  const parts = formatter.formatToParts(date);
  let hours = 0;
  let minutes = 0;
  let dayName = '';
  for (const part of parts) {
    if (part.type === 'hour') hours = parseInt(part.value, 10);
    if (part.type === 'minute') minutes = parseInt(part.value, 10);
    if (part.type === 'weekday') dayName = part.value;
  }
  if (hours === 24) hours = 0;
  const isSunday = dayName === 'Sun';
  return { hours, minutes, isSunday };
};

// Calculate Euclidean distance between two descriptor arrays
const calculateEuclideanDistance = (desc1, desc2) => {
  if (!desc1 || !desc2 || desc1.length !== desc2.length) return 1.0;
  let sum = 0;
  for (let i = 0; i < desc1.length; i++) {
    const diff = desc1[i] - desc2[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
};

const verifyUserFaceDescriptor = (user, submittedDescriptor) => {
  // CEO is exempt from biometric face lock requirements
  if (user?.role === 'CEO') {
    return { valid: true, isExempt: true };
  }
  // If face is not registered, block check-in — face registration is mandatory
  if (!user.isFaceRegistered || !user.faceDescriptor || user.faceDescriptor.length === 0) {
    return {
      valid: false,
      message: 'Face Lock not registered. Please contact your administrator to register your face before checking in/out.'
    };
  }
  // Face is registered — submitted descriptor is required
  if (!submittedDescriptor || !Array.isArray(submittedDescriptor) || submittedDescriptor.length === 0) {
    return { valid: false, message: 'Face scan is required for Check-In/Out verification.' };
  }
  // Compare submitted face against registered face descriptor
  const distance = calculateEuclideanDistance(user.faceDescriptor, submittedDescriptor);
  if (distance > 0.60) {
    return { valid: false, message: 'Face verification failed! Face does not match the registered profile. Please use your own registered face.' };
  }
  return { valid: true, distance };
};

// Clock In
export const clockIn = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const { workLocation, notes, faceDescriptor } = req.body;
  const { start } = getTodayDateRange();

  // Face Verification Check
  const faceVerification = verifyUserFaceDescriptor(req.user, faceDescriptor);
  if (!faceVerification.valid) {
    return next(new AppError(faceVerification.message, 400));
  }

  let existingAttendance = await Attendance.findOne({ user: userId, date: start });
  if (existingAttendance && existingAttendance.clockIn) {
    return next(new AppError('You have already clocked in for today.', 400));
  }

  const now = new Date();
  const { hours, minutes, isSunday } = getISTTime(now);
  // Late if after 9:40 AM IST
  const isLate = hours >= 9 && (hours > 9 || minutes > 40);

  // Auto-detect Sunday / Holiday Check-in as OVER_DUTY (OD)
  const attendanceStatus = isSunday ? 'OVER_DUTY' : (isLate ? 'LATE' : 'PRESENT');

  const attendance = await Attendance.create({
    user: userId,
    date: start,
    clockIn: now,
    workLocation: workLocation || 'IN_OFFICE',
    status: attendanceStatus,
    notes: notes || (isSunday ? 'Sunday Special Over Duty (OD)' : '')
  });

  res.status(201).json({
    status: 'success',
    data: { attendance }
  });
});

// Lunch Out
export const lunchOut = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const { faceDescriptor } = req.body;
  const { start } = getTodayDateRange();

  // Face Verification Check
  const faceVerification = verifyUserFaceDescriptor(req.user, faceDescriptor);
  if (!faceVerification.valid) {
    return next(new AppError(faceVerification.message, 400));
  }

  const attendance = await Attendance.findOne({ user: userId, date: start });
  if (!attendance) {
    return next(new AppError('No clock-in record found for today.', 404));
  }

  if (attendance.clockOut) {
    return next(new AppError('You have already clocked out for today.', 400));
  }

  if (attendance.lunchOut) {
    return next(new AppError('You have already taken lunch out.', 400));
  }

  const now = new Date();
  attendance.lunchOut = now;
  await attendance.save();

  res.status(200).json({
    status: 'success',
    data: { attendance }
  });
});

// Lunch In
export const lunchIn = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const { faceDescriptor } = req.body;
  const { start } = getTodayDateRange();

  // Face Verification Check
  const faceVerification = verifyUserFaceDescriptor(req.user, faceDescriptor);
  if (!faceVerification.valid) {
    return next(new AppError(faceVerification.message, 400));
  }

  const attendance = await Attendance.findOne({ user: userId, date: start });
  if (!attendance) {
    return next(new AppError('No clock-in record found for today.', 404));
  }

  if (attendance.clockOut) {
    return next(new AppError('You have already clocked out for today.', 400));
  }

  if (!attendance.lunchOut) {
    return next(new AppError('You have not taken lunch out yet.', 400));
  }

  if (attendance.lunchIn) {
    return next(new AppError('You have already taken lunch in.', 400));
  }

  const now = new Date();
  attendance.lunchIn = now;
  await attendance.save();

  res.status(200).json({
    status: 'success',
    data: { attendance }
  });
});

// Clock Out
export const clockOut = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const { faceDescriptor } = req.body;
  const { start } = getTodayDateRange();

  // Face Verification Check
  const faceVerification = verifyUserFaceDescriptor(req.user, faceDescriptor);
  if (!faceVerification.valid) {
    return next(new AppError(faceVerification.message, 400));
  }

  const attendance = await Attendance.findOne({ user: userId, date: start });
  if (!attendance) {
    return next(new AppError('No clock-in record found for today.', 404));
  }

  if (attendance.clockOut) {
    return next(new AppError('You have already clocked out for today.', 400));
  }

  if (attendance.lunchOut && !attendance.lunchIn) {
    return next(new AppError('Please Lunch In before checking out.', 400));
  }

  const now = new Date();
  let diffMs = now - new Date(attendance.clockIn);

  if (attendance.lunchOut && attendance.lunchIn) {
    const lunchBreakMs = new Date(attendance.lunchIn) - new Date(attendance.lunchOut);
    diffMs -= lunchBreakMs;
  }

  const totalHours = Number((diffMs / (1000 * 60 * 60)).toFixed(2));

  attendance.clockOut = now;
  attendance.totalHours = totalHours;

  if (totalHours < 4 && attendance.status !== 'LATE') {
    attendance.status = 'HALF_DAY';
  }

  await attendance.save();

  res.status(200).json({
    status: 'success',
    data: { attendance }
  });
});

// Get Today Attendance Status
export const getTodayAttendance = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const { start } = getTodayDateRange();

  const attendance = await Attendance.findOne({ user: userId, date: start });

  res.status(200).json({
    status: 'success',
    data: { attendance }
  });
});

// Get Attendance Logs (Monthly / Team / All)
export const getAttendanceLogs = asyncHandler(async (req, res, next) => {
  const role = req.user.role;
  const userId = req.user._id;
  const { month, year, status } = req.query;

  const currentYear = Number(year) || new Date().getFullYear();
  const currentMonth = Number(month) || new Date().getMonth() + 1;

  // Build IST-aware month start and end dates
  const monthStr = String(currentMonth).padStart(2, '0');
  const lastDay = new Date(currentYear, currentMonth, 0).getDate();
  const startDate = new Date(`${currentYear}-${monthStr}-01T00:00:00.000+05:30`);
  const endDate = new Date(`${currentYear}-${monthStr}-${String(lastDay).padStart(2, '0')}T23:59:59.999+05:30`);

  let query = {
    date: { $gte: startDate, $lte: endDate }
  };

  if (status) {
    if (status === 'WFH') {
      query.workLocation = 'WFH';
    } else {
      query.status = status;
    }
  }

  if (role === 'EMPLOYEE') {
    query.user = userId;
  } else if (role === 'TEAM_LEAD') {
    const teamMembers = await User.find({ reportingManager: userId }).select('_id');
    const teamIds = teamMembers.map((m) => m._id);
    teamIds.push(userId);
    query.user = { $in: teamIds };
  } else {
    // Exclude CEO role users from employee attendance logs list
    const ceoUsers = await User.find({ role: 'CEO' }).select('_id');
    const ceoIds = ceoUsers.map((u) => u._id);
    if (ceoIds.length > 0) {
      query.user = { $nin: ceoIds };
    }
  }

  let rawLogs = await Attendance.find(query)
    .populate({
      path: 'user',
      select: 'firstName lastName employeeId department profileImage role email',
      populate: { path: 'department', select: 'name code' }
    })
    .sort({ date: -1, clockIn: -1 });

  // Strictly filter out any logs without a valid user object or with CEO role
  const logs = rawLogs.filter((l) => l.user && l.user.role !== 'CEO');

  // Calculate Summary Metrics (for the current user's visible logs only)
  const totalDays = logs.length;
  const presentCount = logs.filter((l) => ['PRESENT', 'LATE', 'HALF_DAY', 'OVER_DUTY', 'OD'].includes(l.status)).length;
  const wfhCount = logs.filter((l) => l.workLocation === 'WFH').length;
  const lateCount = logs.filter((l) => l.status === 'LATE').length;
  const overDutyCount = logs.filter((l) => ['OVER_DUTY', 'OD'].includes(l.status)).length;

  res.status(200).json({
    status: 'success',
    data: {
      logs,
      summary: {
        totalDays,
        presentCount,
        wfhCount,
        lateCount,
        overDutyCount
      }
    }
  });
});

// Update Attendance Record (Work Location, Status, etc.)
export const updateAttendance = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { workLocation, status } = req.body;

  const updateData = {};
  if (workLocation) updateData.workLocation = workLocation;
  if (status) updateData.status = status;

  const attendance = await Attendance.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true
  });

  if (!attendance) {
    return next(new AppError('Attendance record not found.', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { attendance }
  });
});

// Get Live Status of all currently clocked-in employees (for CEO/Admin/HR/TL)
export const getLiveStatus = asyncHandler(async (req, res, next) => {
  const { start: todayStart, end: todayEnd } = getTodayDateRange();

  // Exclude CEO users
  const ceoUsers = await User.find({ role: 'CEO' }).select('_id');
  const ceoIds = ceoUsers.map((u) => u._id);

  let userQuery = { isDeleted: false, status: 'ACTIVE' };
  if (ceoIds.length > 0) userQuery._id = { $nin: ceoIds };

  // TEAM_LEAD: only show direct reports
  if (req.user.role === 'TEAM_LEAD') {
    const teamMembers = await User.find({ reportingManager: req.user._id, isDeleted: false }).select('_id');
    const teamIds = teamMembers.map((m) => m._id);
    userQuery._id = { $in: teamIds };
  }

  const allEmployees = await User.find(userQuery)
    .select('firstName lastName employeeId profileImage department designation role')
    .populate('department', 'name')
    .populate('designation', 'name');

  // Get today's attendance for all these employees
  const employeeIds = allEmployees.map((e) => e._id);
  const todayLogs = await Attendance.find({
    user: { $in: employeeIds },
    date: { $gte: todayStart, $lte: todayEnd }
  }).lean();

  const logMap = {};
  todayLogs.forEach((log) => { logMap[log.user.toString()] = log; });

  const liveStatus = allEmployees.map((emp) => {
    const log = logMap[emp._id.toString()] || null;
    let statusLabel = 'NOT_CHECKED_IN';
    if (log) {
      if (log.clockOut) statusLabel = 'CHECKED_OUT';
      else if (log.lunchOut && !log.lunchIn) statusLabel = 'ON_LUNCH';
      else statusLabel = 'CHECKED_IN';
    }

    return {
      employee: emp,
      attendance: log,
      statusLabel,
      clockInTime: log?.clockIn || null,
      clockOutTime: log?.clockOut || null,
      lunchOutTime: log?.lunchOut || null,
      lunchInTime: log?.lunchIn || null,
      workLocation: log?.workLocation || null,
      totalHours: log?.totalHours || null
    };
  });

  // Sort: CHECKED_IN first, then ON_LUNCH, then NOT_CHECKED_IN, then CHECKED_OUT
  const order = { CHECKED_IN: 0, ON_LUNCH: 1, NOT_CHECKED_IN: 2, CHECKED_OUT: 3 };
  liveStatus.sort((a, b) => (order[a.statusLabel] ?? 4) - (order[b.statusLabel] ?? 4));

  res.status(200).json({
    status: 'success',
    data: { liveStatus }
  });
});

// Force Check-Out an employee (CEO/Admin/HR/TL only)
export const forceCheckOut = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  const { reason } = req.body;
  const { start } = getTodayDateRange();

  const targetEmployee = await User.findById(userId);
  if (!targetEmployee || targetEmployee.isDeleted) {
    return next(new AppError('Employee not found.', 404));
  }

  // TEAM_LEAD can only force checkout their direct reports
  if (req.user.role === 'TEAM_LEAD') {
    const isDirectReport = targetEmployee.reportingManager?.toString() === req.user._id.toString();
    if (!isDirectReport) {
      return next(new AppError('You can only force check-out your direct team members.', 403));
    }
  }

  const attendance = await Attendance.findOne({ user: userId, date: start });
  if (!attendance) {
    return next(new AppError('No check-in record found for this employee today.', 404));
  }
  if (attendance.clockOut) {
    return next(new AppError('This employee has already checked out.', 400));
  }

  const now = new Date();
  let diffMs = now - new Date(attendance.clockIn);
  if (attendance.lunchOut && attendance.lunchIn) {
    diffMs -= new Date(attendance.lunchIn) - new Date(attendance.lunchOut);
  }
  const totalHours = Number((diffMs / (1000 * 60 * 60)).toFixed(2));

  attendance.clockOut = now;
  attendance.totalHours = totalHours;
  attendance.notes = `Force checked out by ${req.user.firstName} ${req.user.lastName} (${req.user.role})${reason ? ': ' + reason : ''}`;
  if (totalHours < 4 && attendance.status !== 'LATE') attendance.status = 'HALF_DAY';
  await attendance.save();

  // Notify the employee
  const { Notification } = await import('../models/Notification.js');
  await Notification.safeCreate({
    recipient: userId,
    title: '⚠️ You have been checked out',
    message: `${req.user.firstName} ${req.user.lastName} (${req.user.role}) has checked you out at ${now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} IST.${reason ? ' Reason: ' + reason : ''}`,
    type: 'SYSTEM',
    targetUrl: '/attendance'
  });

  // Audit Log
  const { AuditLog } = await import('../models/AuditLog.js');
  await AuditLog.create({
    user: req.user._id,
    userName: `${req.user.firstName} ${req.user.lastName}`,
    userRole: req.user.role,
    action: 'FORCE_CHECKOUT',
    module: 'ATTENDANCE',
    details: `Force checked out ${targetEmployee.firstName} ${targetEmployee.lastName} (${targetEmployee.employeeId}) at ${now.toISOString()}${reason ? ' — Reason: ' + reason : ''}`
  });

  res.status(200).json({
    status: 'success',
    message: `${targetEmployee.firstName} ${targetEmployee.lastName} has been checked out successfully.`,
    data: { attendance }
  });
});
