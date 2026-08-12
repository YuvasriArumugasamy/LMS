import { Department } from '../models/Department.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/appError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getDepartments = asyncHandler(async (req, res, next) => {
  const rawDepartments = await Department.find({ isDeleted: false })
    .populate('departmentHead', 'firstName lastName email profileImage')
    .sort({ name: 1 })
    .lean();

  const departments = await Promise.all(
    rawDepartments.map(async (dept) => {
      const count = await User.countDocuments({ department: dept._id, isDeleted: false });
      return { ...dept, employeeCount: count };
    })
  );

  res.status(200).json({
    status: 'success',
    data: { departments }
  });
});

export const createDepartment = asyncHandler(async (req, res, next) => {
  const { name, code } = req.body;
  const existing = await Department.findOne({ $or: [{ name }, { code }], isDeleted: false });
  if (existing) {
    return next(new AppError('Department name or code already exists.', 400));
  }

  const department = await Department.create(req.body);

  res.status(201).json({
    status: 'success',
    data: { department }
  });
});

export const updateDepartment = asyncHandler(async (req, res, next) => {
  const updateData = { ...req.body };

  // Remove empty required fields to avoid validation errors
  ['name', 'code'].forEach((field) => {
    if (field in updateData && !updateData[field]?.toString().trim()) {
      delete updateData[field];
    }
  });

  const department = await Department.findByIdAndUpdate(
    req.params.id,
    { $set: updateData },
    { new: true, runValidators: true, context: 'query' }
  ).populate('departmentHead', 'firstName lastName email');

  if (!department) return next(new AppError('Department not found.', 404));

  res.status(200).json({
    status: 'success',
    data: { department }
  });
});

export const deleteDepartment = asyncHandler(async (req, res, next) => {
  const department = await Department.findByIdAndUpdate(req.params.id, { isDeleted: true });
  if (!department) return next(new AppError('Department not found.', 404));

  res.status(200).json({
    status: 'success',
    message: 'Department removed successfully.'
  });
});
