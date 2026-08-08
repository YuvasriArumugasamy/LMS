import { Designation } from '../models/Designation.js';
import { AppError } from '../utils/appError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getDesignations = asyncHandler(async (req, res, next) => {
  const designations = await Designation.find({ isDeleted: false })
    .populate('department', 'name code')
    .sort({ name: 1 });

  res.status(200).json({
    status: 'success',
    data: { designations }
  });
});

export const createDesignation = asyncHandler(async (req, res, next) => {
  const designation = await Designation.create(req.body);
  res.status(201).json({
    status: 'success',
    data: { designation }
  });
});

export const updateDesignation = asyncHandler(async (req, res, next) => {
  const designation = await Designation.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  }).populate('department', 'name code');

  if (!designation) return next(new AppError('Designation not found.', 404));

  res.status(200).json({
    status: 'success',
    data: { designation }
  });
});

export const deleteDesignation = asyncHandler(async (req, res, next) => {
  const designation = await Designation.findByIdAndUpdate(req.params.id, { isDeleted: true });
  if (!designation) return next(new AppError('Designation not found.', 404));

  res.status(200).json({
    status: 'success',
    message: 'Designation removed successfully.'
  });
});
