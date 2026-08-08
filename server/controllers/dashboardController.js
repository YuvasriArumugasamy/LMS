import { User } from '../models/User.js';
import { Department } from '../models/Department.js';
import { LeaveRequest } from '../models/LeaveRequest.js';
import { LeaveBalance } from '../models/LeaveBalance.js';
import { Holiday } from '../models/Holiday.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getDashboardStats = asyncHandler(async (req, res, next) => {
  const role = req.user.role;
  const userId = req.user._id;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const defaultMonthlyTrend = [
    { month: 'Jan', leaves: 12, count: 12 },
    { month: 'Feb', leaves: 18, count: 18 },
    { month: 'Mar', leaves: 24, count: 24 },
    { month: 'Apr', leaves: 15, count: 15 },
    { month: 'May', leaves: 29, count: 29 },
    { month: 'Jun', leaves: 32, count: 32 },
    { month: 'Jul', leaves: 22, count: 22 },
    { month: 'Aug', leaves: 19, count: 19 }
  ];

  if (['SUPER_ADMIN', 'CEO'].includes(role)) {
    const totalEmployees = await User.countDocuments({ isDeleted: false, status: 'ACTIVE' });
    const totalDepartments = await Department.countDocuments({ isDeleted: false });
    const totalManagers = await User.countDocuments({ role: 'MANAGER', isDeleted: false });
    const pendingLeaves = await LeaveRequest.countDocuments({ status: { $in: ['PENDING', 'ESCALATED_TO_HR'] }, isDeleted: false });
    const approvedLeaves = await LeaveRequest.countDocuments({ status: 'HR_APPROVED', isDeleted: false });
    const rejectedLeaves = await LeaveRequest.countDocuments({ status: { $in: ['MANAGER_REJECTED', 'HR_REJECTED'] }, isDeleted: false });

    // Employees on leave today
    const leavesToday = await LeaveRequest.find({
      status: 'HR_APPROVED',
      fromDate: { $lte: today },
      toDate: { $gte: today },
      isDeleted: false
    }).populate('user', 'firstName lastName employeeId department profileImage');

    res.status(200).json({
      status: 'success',
      data: {
        cards: {
          totalEmployees,
          totalDepartments,
          totalManagers,
          pendingLeaves,
          approvedLeaves,
          rejectedLeaves,
          employeesOnLeaveToday: leavesToday.length
        },
        leavesToday,
        monthlyTrend: defaultMonthlyTrend
      }
    });
  } else if (role === 'HR') {
    const totalEmployees = await User.countDocuments({ isDeleted: false });
    const pendingHrApprovals = await LeaveRequest.countDocuments({ status: { $in: ['MANAGER_APPROVED', 'ESCALATED_TO_HR', 'PENDING'] }, isDeleted: false });
    const holidayCount = await Holiday.countDocuments({ isDeleted: false, status: 'ACTIVE' });
    const newEmployees = await User.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      isDeleted: false
    });

    const recentRequests = await LeaveRequest.find({ isDeleted: false })
      .populate('user', 'firstName lastName profileImage department')
      .populate('leaveType', 'name colorBadge')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      status: 'success',
      data: {
        cards: {
          totalEmployees,
          pendingHrApprovals,
          holidayCount,
          newEmployees
        },
        recentRequests,
        monthlyTrend: defaultMonthlyTrend
      }
    });
  } else if (role === 'MANAGER') {
    const teamMembers = await User.find({ reportingManager: userId, isDeleted: false }).select('_id');
    const teamIds = teamMembers.map((m) => m._id);

    const teamCount = teamIds.length;
    const pendingRequests = await LeaveRequest.countDocuments({ user: { $in: teamIds }, status: 'PENDING', isDeleted: false });
    const approvedRequests = await LeaveRequest.countDocuments({ user: { $in: teamIds }, status: 'HR_APPROVED', isDeleted: false });

    const teamOnLeaveToday = await LeaveRequest.find({
      user: { $in: teamIds },
      status: 'HR_APPROVED',
      fromDate: { $lte: today },
      toDate: { $gte: today },
      isDeleted: false
    }).populate('user', 'firstName lastName profileImage designation');

    res.status(200).json({
      status: 'success',
      data: {
        cards: {
          teamCount,
          pendingRequests,
          approvedRequests,
          teamOnLeaveTodayCount: teamOnLeaveToday.length
        },
        teamOnLeaveToday,
        monthlyTrend: defaultMonthlyTrend
      }
    });
  } else {
    // EMPLOYEE DASHBOARD
    const balance = await LeaveBalance.findOne({ user: userId, year: new Date().getFullYear() }).populate('allocations.leaveType');
    const pendingRequests = await LeaveRequest.countDocuments({ user: userId, status: { $in: ['PENDING', 'MANAGER_APPROVED', 'ESCALATED_TO_HR'] }, isDeleted: false });
    const approvedLeaves = await LeaveRequest.countDocuments({ user: userId, status: 'HR_APPROVED', isDeleted: false });
    const rejectedLeaves = await LeaveRequest.countDocuments({ user: userId, status: { $in: ['MANAGER_REJECTED', 'HR_REJECTED'] }, isDeleted: false });

    const upcomingHolidays = await Holiday.find({ date: { $gte: today }, isDeleted: false, status: 'ACTIVE' })
      .sort({ date: 1 })
      .limit(5);

    const recentLeaves = await LeaveRequest.find({ user: userId, isDeleted: false })
      .populate('leaveType', 'name colorBadge')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      status: 'success',
      data: {
        cards: {
          pendingRequests,
          approvedLeaves,
          rejectedLeaves
        },
        balance,
        upcomingHolidays,
        recentLeaves,
        monthlyTrend: defaultMonthlyTrend
      }
    });
  }
});
