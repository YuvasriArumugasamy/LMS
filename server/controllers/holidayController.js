import { Holiday } from '../models/Holiday.js';
import { AppError } from '../utils/appError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getHolidays = asyncHandler(async (req, res, next) => {
  const { year } = req.query;
  const query = { isDeleted: false, status: 'ACTIVE' };

  if (year) {
    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${year}-12-31`);
    query.date = { $gte: startDate, $lte: endDate };
  }

  const holidays = await Holiday.find(query).sort({ date: 1 });
  res.status(200).json({ status: 'success', data: { holidays } });
});

export const createHoliday = asyncHandler(async (req, res, next) => {
  const holiday = await Holiday.create(req.body);
  res.status(201).json({ status: 'success', data: { holiday } });
});

export const updateHoliday = asyncHandler(async (req, res, next) => {
  const holiday = await Holiday.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!holiday) return next(new AppError('Holiday not found.', 404));
  res.status(200).json({ status: 'success', data: { holiday } });
});

export const deleteHoliday = asyncHandler(async (req, res, next) => {
  const holiday = await Holiday.findByIdAndUpdate(req.params.id, { isDeleted: true });
  if (!holiday) return next(new AppError('Holiday not found.', 404));
  res.status(200).json({ status: 'success', message: 'Holiday deleted successfully.' });
});
