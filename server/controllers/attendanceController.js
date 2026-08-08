import { Attendance } from '../models/Attendance.js';
import { User } from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/appError.js';

// Get today's start and end date
const getTodayDateRange = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

// Clock In
export const clockIn = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const { workLocation, notes } = req.body;
  const { start } = getTodayDateRange();

  let existingAttendance = await Attendance.findOne({ user: userId, date: start });
  if (existingAttendance && existingAttendance.clockIn) {
    return next(new AppError('You have already clocked in for today.', 400));
  }

  const now = new Date();
  const workStartHour = 9; // 9 AM
  const isLate = now.getHours() >= 9 && (now.getHours() > 9 || now.getMinutes() > 15);

  const attendance = await Attendance.create({
    user: userId,
    date: start,
    clockIn: now,
    workLocation: workLocation || 'IN_OFFICE',
    status: isLate ? 'LATE' : 'PRESENT',
    notes: notes || ''
  });

  res.status(201).json({
    status: 'success',
    data: { attendance }
  });
});

// Clock Out
export const clockOut = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const { start } = getTodayDateRange();

  const attendance = await Attendance.findOne({ user: userId, date: start });
  if (!attendance) {
    return next(new AppError('No clock-in record found for today.', 404));
  }

  if (attendance.clockOut) {
    return next(new AppError('You have already clocked out for today.', 400));
  }

  const now = new Date();
  const diffMs = now - new Date(attendance.clockIn);
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

  const startDate = new Date(currentYear, currentMonth - 1, 1);
  const endDate = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);

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
  } else if (role === 'MANAGER') {
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

  // Calculate Summary Metrics
  const totalDays = logs.length;
  const presentCount = logs.filter((l) => ['PRESENT', 'LATE'].includes(l.status)).length;
  const wfhCount = logs.filter((l) => l.workLocation === 'WFH').length;
  const lateCount = logs.filter((l) => l.status === 'LATE').length;

  res.status(200).json({
    status: 'success',
    data: {
      logs,
      summary: {
        totalDays,
        presentCount,
        wfhCount,
        lateCount
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
