import { AuditLog } from '../models/AuditLog.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getAuditLogs = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 20, module, action, fromDate, toDate } = req.query;
  const query = {};

  if (module) query.module = module;
  if (action) query.action = { $regex: action, $options: 'i' };

  // Date range filter
  if (fromDate || toDate) {
    query.createdAt = {};
    if (fromDate) query.createdAt.$gte = new Date(fromDate);
    if (toDate) {
      const end = new Date(toDate);
      end.setHours(23, 59, 59, 999);
      query.createdAt.$lte = end;
    }
  }

  const skip = (Number(page) - 1) * Number(limit);
  const total = await AuditLog.countDocuments(query);
  const logs = await AuditLog.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  res.status(200).json({
    status: 'success',
    data: {
      logs,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit))
      }
    }
  });
});

export const clearAuditLogs = asyncHandler(async (req, res, next) => {
  await AuditLog.deleteMany({});
  res.status(200).json({
    status: 'success',
    message: 'All audit logs have been cleared'
  });
});
