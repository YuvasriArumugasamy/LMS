import { AuditLog } from '../models/AuditLog.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getAuditLogs = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 20, module } = req.query;
  const query = {};
  if (module) query.module = module;

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
