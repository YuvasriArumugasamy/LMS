import { DailyReport } from '../models/DailyReport.js';
import { User } from '../models/User.js';
import { Notification } from '../models/Notification.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/appError.js';

// Get today's start and end date range
const getTodayRange = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

// Submit / Upsert Daily Report for Today
export const submitDailyReport = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const { title, projectTitle, moduleName, tasksCompleted, pendingTasks, blockers, hoursWorked, workStatus } = req.body;

  if (!title || !title.trim()) {
    return next(new AppError('Please provide a report title.', 400));
  }
  if (!tasksCompleted || !tasksCompleted.trim()) {
    return next(new AppError('Please describe tasks completed today.', 400));
  }

  const { start, end } = getTodayRange();

  let report = await DailyReport.findOne({
    user: userId,
    date: { $gte: start, $lte: end }
  });

  if (report) {
    report.title = title.trim();
    report.projectTitle = (projectTitle || 'Attendance Project').trim();
    report.moduleName = (moduleName || 'General').trim();
    report.tasksCompleted = tasksCompleted.trim();
    report.pendingTasks = (pendingTasks || '').trim();
    report.blockers = (blockers || '').trim();
    report.hoursWorked = Number(hoursWorked) || 8;
    if (workStatus) report.workStatus = workStatus;
    report.status = 'SUBMITTED';
    await report.save();
  } else {
    report = await DailyReport.create({
      user: userId,
      date: new Date(),
      title: title.trim(),
      projectTitle: (projectTitle || 'Attendance Project').trim(),
      moduleName: (moduleName || 'General').trim(),
      tasksCompleted: tasksCompleted.trim(),
      pendingTasks: (pendingTasks || '').trim(),
      blockers: (blockers || '').trim(),
      hoursWorked: Number(hoursWorked) || 8,
      workStatus: workStatus || 'IN_PROGRESS',
      status: 'SUBMITTED'
    });
  }

  res.status(200).json({
    status: 'success',
    data: { report }
  });
});

// Check if current user submitted today's report
export const getTodayReportStatus = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const { start, end } = getTodayRange();

  const report = await DailyReport.findOne({
    user: userId,
    date: { $gte: start, $lte: end }
  });

  res.status(200).json({
    status: 'success',
    data: {
      hasSubmitted: !!report,
      report
    }
  });
});

// Send Reminder to Employee for Daily Report Submission
export const sendDailyReportReminder = asyncHandler(async (req, res, next) => {
  const { userId } = req.body;
  const targetUser = await User.findById(userId);

  if (!targetUser) {
    return next(new AppError('Employee not found.', 404));
  }

  const senderRole = req.user.role === 'CEO' ? 'CEO' : req.user.role === 'MANAGER' ? 'Manager' : 'HR';
  await Notification.safeCreate({
    recipient: userId,
    title: 'Daily Report Reminder 🔔',
    message: `${senderRole} ${req.user.firstName || ''} ${req.user.lastName || ''} sent you a reminder: Please submit your Daily Work Report for today.`,
    type: 'DAILY_REPORT',
    targetUrl: '/daily-reports'
  });

  res.status(200).json({
    status: 'success',
    message: `Reminder sent to ${targetUser.firstName || 'employee'}.`
  });
});

// Get Daily Reports (Role-Based Access with Employee Status Tracking)
export const getDailyReports = asyncHandler(async (req, res, next) => {
  const role = req.user.role;
  const userId = req.user._id;
  const { date, status, search } = req.query;

  let reportDateQuery = {};

  if (date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    reportDateQuery.date = { $gte: start, $lte: end };
  } else {
    const today = new Date();
    const start = new Date(today);
    start.setHours(0, 0, 0, 0);
    const end = new Date(today);
    end.setHours(23, 59, 59, 999);
    reportDateQuery.date = { $gte: start, $lte: end };
  }

  // 1. Fetch relevant users to track
  let userQuery = { role: { $ne: 'CEO' } };
  if (role === 'EMPLOYEE') {
    userQuery._id = userId;
  } else if (role === 'MANAGER') {
    const teamMembers = await User.find({ reportingManager: userId }).select('_id');
    const teamIds = teamMembers.map((m) => m._id);
    teamIds.push(userId);
    userQuery._id = { $in: teamIds };
  }

  const trackingUsers = await User.find(userQuery)
    .select('firstName lastName employeeId department role email profileImage')
    .populate('department', 'name code')
    .sort({ firstName: 1 });

  // 2. Fetch existing daily reports for target date & users
  const userIds = trackingUsers.map((u) => u._id);
  const reports = await DailyReport.find({
    ...reportDateQuery,
    user: { $in: userIds }
  })
    .populate({
      path: 'user',
      select: 'firstName lastName employeeId department role email profileImage',
      populate: { path: 'department', select: 'name code' }
    })
    .populate('reviewedBy', 'firstName lastName role')
    .sort({ date: -1, createdAt: -1 });

  // Map user ID to their report
  const reportMap = {};
  reports.forEach((r) => {
    if (r.user) {
      reportMap[r.user._id.toString()] = r;
    }
  });

  // 3. Build unified employee status list
  let employeeStatuses = trackingUsers.map((u) => {
    const report = reportMap[u._id.toString()] || null;
    return {
      _id: report ? report._id : `pending_${u._id}`,
      user: u,
      hasSubmitted: !!report,
      reportStatus: report ? report.status : 'NOT_SUBMITTED',
      report: report
    };
  });

  // 4. Apply status filter
  if (status) {
    if (status === 'NOT_SUBMITTED' || status === 'PENDING') {
      employeeStatuses = employeeStatuses.filter((item) => !item.hasSubmitted);
    } else {
      employeeStatuses = employeeStatuses.filter((item) => item.reportStatus === status);
    }
  }

  // 5. Apply search query filter
  if (search && search.trim()) {
    const q = search.toLowerCase().trim();
    employeeStatuses = employeeStatuses.filter((item) => {
      const name = `${item.user.firstName || ''} ${item.user.lastName || ''}`.toLowerCase();
      const empId = (item.user.employeeId || '').toLowerCase();
      const dept = (item.user.department?.name || '').toLowerCase();
      const title = (item.report?.title || '').toLowerCase();
      return name.includes(q) || empId.includes(q) || dept.includes(q) || title.includes(q);
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      reports,
      employeeStatuses,
      totalTracked: trackingUsers.length,
      submittedCount: reports.length,
      pendingCount: trackingUsers.length - reports.length
    }
  });
});

// Get Full Report History for a Specific Employee
export const getEmployeeReportHistory = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;

  const targetUser = await User.findById(userId)
    .select('firstName lastName employeeId department role email profileImage designation')
    .populate('department', 'name code')
    .populate('designation', 'title name');

  if (!targetUser) {
    return next(new AppError('Employee not found.', 404));
  }

  const reports = await DailyReport.find({ user: userId })
    .populate('reviewedBy', 'firstName lastName role')
    .sort({ date: -1 });

  const totalSubmitted = reports.length;
  const totalHours = reports.reduce((sum, r) => sum + (r.hoursWorked || 8), 0);
  const approvedCount = reports.filter((r) => r.status === 'APPROVED' || r.status === 'REVIEWED').length;

  res.status(200).json({
    status: 'success',
    data: {
      user: targetUser,
      reports,
      stats: {
        totalSubmitted,
        totalHours,
        approvedCount
      }
    }
  });
});

// Review / Add Feedback / Approve Report
export const reviewDailyReport = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { feedback, status } = req.body;

  const report = await DailyReport.findById(id);
  if (!report) {
    return next(new AppError('Daily report not found.', 404));
  }

  if (feedback !== undefined) report.feedback = feedback.trim();
  if (status) report.status = status;

  report.reviewedBy = req.user._id;
  report.reviewedAt = new Date();

  await report.save();

  // Send real-time notification to the employee about the feedback
  try {
    const reviewerRole = req.user.role === 'CEO' ? 'CEO' : req.user.role === 'MANAGER' ? 'Manager' : 'HR';
    await Notification.safeCreate({
      recipient: report.user,
      title: `Daily Report ${status || 'Reviewed'}`,
      message: `${reviewerRole} ${req.user.firstName || ''} ${req.user.lastName || ''} reviewed your report "${report.title}": ${feedback ? `"${feedback}"` : 'Status updated.'}`,
      type: 'DAILY_REPORT',
      targetUrl: '/daily-reports'
    });
  } catch (notifErr) {
    console.error('[Notification Error]', notifErr);
  }

  res.status(200).json({
    status: 'success',
    data: { report }
  });
});

// Update / Edit Daily Report
export const updateDailyReport = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { title, projectTitle, moduleName, tasksCompleted, pendingTasks, blockers, hoursWorked, workStatus } = req.body;

  const report = await DailyReport.findById(id);
  if (!report) {
    return next(new AppError('Daily report not found.', 404));
  }

  // Strict Rule: ONLY the owner (creator) of the report can edit their own report!
  if (report.user.toString() !== req.user._id.toString()) {
    return next(new AppError('You can only edit your own daily report.', 403));
  }

  if (title) report.title = title.trim();
  if (projectTitle !== undefined) report.projectTitle = projectTitle.trim();
  if (moduleName !== undefined) report.moduleName = moduleName.trim();
  if (tasksCompleted) report.tasksCompleted = tasksCompleted.trim();
  if (pendingTasks !== undefined) report.pendingTasks = pendingTasks.trim();
  if (blockers !== undefined) report.blockers = blockers.trim();
  if (hoursWorked !== undefined) report.hoursWorked = Number(hoursWorked) || 8;
  if (workStatus) report.workStatus = workStatus;

  await report.save();

  res.status(200).json({
    status: 'success',
    data: { report }
  });
});

// Delete Daily Report
export const deleteDailyReport = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const report = await DailyReport.findById(id);
  if (!report) {
    return next(new AppError('Daily report not found.', 404));
  }

  // Strict Rule: ONLY the owner (creator) of the report can delete their own report!
  if (report.user.toString() !== req.user._id.toString()) {
    return next(new AppError('You can only delete your own daily report.', 403));
  }

  await DailyReport.findByIdAndDelete(id);

  res.status(200).json({
    status: 'success',
    message: 'Daily report deleted successfully.'
  });
});
