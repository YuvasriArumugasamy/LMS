import { LeaveRequest } from '../models/LeaveRequest.js';
import { User } from '../models/User.js';
import { Department } from '../models/Department.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getLeaveReports = asyncHandler(async (req, res, next) => {
  const { year = new Date().getFullYear(), month, department, leaveType, status } = req.query;

  const matchQuery = { isDeleted: false };
  if (status) {
    if (status === 'APPROVED' || status === 'HR_APPROVED') {
      matchQuery.status = { $in: ['HR_APPROVED', 'ADMIN_APPROVED', 'CEO_APPROVED'] };
    } else if (status === 'REJECTED' || status === 'HR_REJECTED') {
      matchQuery.status = { $in: ['TEAM_LEAD_REJECTED', 'HR_REJECTED', 'ADMIN_REJECTED', 'CEO_REJECTED'] };
    } else {
      matchQuery.status = status;
    }
  }
  if (leaveType) matchQuery.leaveType = leaveType;

  const startDate = month ? new Date(year, month - 1, 1) : new Date(year, 0, 1);
  const endDate = month ? new Date(year, month, 0, 23, 59, 59) : new Date(year, 11, 31, 23, 59, 59);

  matchQuery.fromDate = { $gte: startDate, $lte: endDate };

  const leaves = await LeaveRequest.find(matchQuery)
    .populate('user', 'firstName lastName employeeId department designation')
    .populate({
      path: 'user',
      populate: { path: 'department', select: 'name code' }
    })
    .populate('leaveType', 'name code colorBadge')
    .sort({ fromDate: -1 });

  // Filter department in memory if populated
  let filtered = leaves;
  if (department) {
    filtered = leaves.filter((l) => l.user && l.user.department && l.user.department._id.toString() === department);
  }

  res.status(200).json({
    status: 'success',
    data: {
      totalRecords: filtered.length,
      reports: filtered
    }
  });
});

export const exportReport = asyncHandler(async (req, res, next) => {
  const { format = 'csv' } = req.query;
  // Return downloadable structured JSON payload that client converts to CSV / PDF / Excel dynamically
  const leaves = await LeaveRequest.find({ isDeleted: false })
    .populate('user', 'firstName lastName employeeId')
    .populate('leaveType', 'name')
    .sort({ createdAt: -1 });

  const exportData = leaves.map((l) => ({
    'Employee ID': l.user?.employeeId || 'N/A',
    'Employee Name': `${l.user?.firstName || ''} ${l.user?.lastName || ''}`,
    'Leave Type': l.leaveType?.name || 'N/A',
    'From Date': new Date(l.fromDate).toLocaleDateString(),
    'To Date': new Date(l.toDate).toLocaleDateString(),
    Days: l.daysCount,
    Status: l.status,
    Reason: l.reason
  }));

  res.status(200).json({
    status: 'success',
    format,
    data: exportData
  });
});
