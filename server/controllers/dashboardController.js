import { User } from '../models/User.js';
import { Department } from '../models/Department.js';
import { LeaveRequest } from '../models/LeaveRequest.js';
import { LeaveBalance } from '../models/LeaveBalance.js';
import { Holiday } from '../models/Holiday.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Build real monthly leave trend for current year
const buildMonthlyTrend = async (matchQuery = {}) => {
  const year = new Date().getFullYear();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const results = await LeaveRequest.aggregate([
    {
      $match: {
        isDeleted: false,
        fromDate: { $gte: new Date(`${year}-01-01`), $lte: new Date(`${year}-12-31`) },
        ...matchQuery
      }
    },
    {
      $group: {
        _id: { $month: '$fromDate' },
        count: { $sum: 1 }
      }
    }
  ]);

  const countMap = {};
  results.forEach((r) => { countMap[r._id] = r.count; });

  return months.map((month, idx) => ({
    month,
    leaves: countMap[idx + 1] || 0,
    count: countMap[idx + 1] || 0
  }));
};

export const getDashboardStats = asyncHandler(async (req, res, next) => {
  const role = req.user.role;
  const userId = req.user._id;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (['ADMIN', 'CEO'].includes(role)) {
    // Optimized: Use aggregation to reduce query count from 8 to 4
    const [employeeDeptStats, leaveStats, leavesToday, monthlyTrend] = await Promise.all([
      // Combined aggregation for employee, department, and manager counts
      Promise.all([
        User.countDocuments({ isDeleted: false, status: 'ACTIVE' }),
        Department.countDocuments({ isDeleted: false }),
        User.countDocuments({ role: 'TEAM_LEAD', isDeleted: false })
      ]),
      // Single aggregation for all leave status counts
      LeaveRequest.aggregate([
        { $match: { isDeleted: false } },
        {
          $group: {
            _id: null,
            pending: {
              $sum: {
                $cond: [{ $in: ['$status', ['PENDING', 'ESCALATED_TO_HR']] }, 1, 0]
              }
            },
            approved: {
              $sum: {
                $cond: [{ $in: ['$status', ['HR_APPROVED', 'ADMIN_APPROVED', 'CEO_APPROVED']] }, 1, 0]
              }
            },
            rejected: {
              $sum: {
                $cond: [{ $in: ['$status', ['TEAM_LEAD_REJECTED', 'HR_REJECTED', 'ADMIN_REJECTED', 'CEO_REJECTED']] }, 1, 0]
              }
            }
          }
        }
      ]),
      LeaveRequest.find({
        status: { $in: ['HR_APPROVED', 'ADMIN_APPROVED', 'CEO_APPROVED'] },
        fromDate: { $lte: today },
        toDate: { $gte: today },
        isDeleted: false
      }).populate('user', 'firstName lastName employeeId department profileImage'),
      buildMonthlyTrend()
    ]);

    const [totalEmployees, totalDepartments, totalManagers] = employeeDeptStats;
    const leaveCounts = leaveStats[0] || { pending: 0, approved: 0, rejected: 0 };

    res.status(200).json({
      status: 'success',
      data: {
        cards: {
          totalEmployees,
          totalDepartments,
          totalManagers,
          pendingLeaves: leaveCounts.pending,
          approvedLeaves: leaveCounts.approved,
          rejectedLeaves: leaveCounts.rejected,
          employeesOnLeaveToday: leavesToday.length
        },
        leavesToday,
        monthlyTrend
      }
    });
  } else if (role === 'HR') {
    const [totalEmployees, pendingHrApprovals, holidayCount, newEmployees, recentRequests, monthlyTrend] = await Promise.all([
      User.countDocuments({ isDeleted: false }),
      LeaveRequest.countDocuments({ status: { $in: ['TEAM_LEAD_APPROVED', 'ESCALATED_TO_HR', 'PENDING'] }, isDeleted: false }),
      Holiday.countDocuments({ isDeleted: false, status: 'ACTIVE' }),
      User.countDocuments({ createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, isDeleted: false }),
      LeaveRequest.find({ isDeleted: false })
        .populate('user', 'firstName lastName profileImage department')
        .populate('leaveType', 'name colorBadge')
        .sort({ createdAt: -1 })
        .limit(5),
      buildMonthlyTrend()
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        cards: { totalEmployees, pendingHrApprovals, holidayCount, newEmployees },
        recentRequests,
        monthlyTrend
      }
    });
  } else if (role === 'TEAM_LEAD') {
    const teamMembers = await User.find({ reportingManager: userId, isDeleted: false }).select('_id');
    const teamIds = teamMembers.map((m) => m._id);

    // Edge case: if no team members, return empty stats
    const teamQuery = teamIds.length > 0 ? { user: { $in: teamIds } } : { user: { $in: [userId] } };

    const [teamCount, pendingRequests, approvedRequests, teamOnLeaveToday, monthlyTrend] = await Promise.all([
      Promise.resolve(teamIds.length),
      LeaveRequest.countDocuments({ ...teamQuery, status: 'PENDING', isDeleted: false }),
      LeaveRequest.countDocuments({ ...teamQuery, status: { $in: ['HR_APPROVED', 'ADMIN_APPROVED', 'CEO_APPROVED'] }, isDeleted: false }),
      LeaveRequest.find({ ...teamQuery, status: { $in: ['HR_APPROVED', 'ADMIN_APPROVED', 'CEO_APPROVED'] }, fromDate: { $lte: today }, toDate: { $gte: today }, isDeleted: false })
        .populate('user', 'firstName lastName profileImage designation'),
      teamIds.length > 0 ? buildMonthlyTrend({ user: { $in: teamIds } }) : buildMonthlyTrend({ user: userId })
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        cards: { teamCount, pendingRequests, approvedRequests, teamOnLeaveTodayCount: teamOnLeaveToday.length },
        teamOnLeaveToday,
        monthlyTrend
      }
    });
  } else {
    // EMPLOYEE DASHBOARD
    const [balance, pendingRequests, approvedLeaves, rejectedLeaves, upcomingHolidays, recentLeaves, monthlyTrend] = await Promise.all([
      LeaveBalance.findOne({ user: userId, year: new Date().getFullYear() }).populate('allocations.leaveType'),
      LeaveRequest.countDocuments({ user: userId, status: { $in: ['PENDING', 'TEAM_LEAD_APPROVED', 'ESCALATED_TO_HR'] }, isDeleted: false }),
      LeaveRequest.countDocuments({ user: userId, status: { $in: ['HR_APPROVED', 'ADMIN_APPROVED', 'CEO_APPROVED'] }, isDeleted: false }),
      LeaveRequest.countDocuments({ user: userId, status: { $in: ['TEAM_LEAD_REJECTED', 'HR_REJECTED', 'ADMIN_REJECTED', 'CEO_REJECTED'] }, isDeleted: false }),
      Holiday.find({ date: { $gte: today }, isDeleted: false, status: 'ACTIVE' }).sort({ date: 1 }).limit(5),
      LeaveRequest.find({ user: userId, isDeleted: false }).populate('leaveType', 'name colorBadge').sort({ createdAt: -1 }).limit(5),
      buildMonthlyTrend({ user: userId })
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        cards: { pendingRequests, approvedLeaves, rejectedLeaves },
        balance,
        upcomingHolidays,
        recentLeaves,
        monthlyTrend
      }
    });
  }
});
