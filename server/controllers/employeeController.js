import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { LeaveBalance } from '../models/LeaveBalance.js';
import { LeaveType } from '../models/LeaveType.js';
import { Department } from '../models/Department.js';
import { AppError } from '../utils/appError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AuditLog } from '../models/AuditLog.js';

export const getEmployees = asyncHandler(async (req, res, next) => {
  const { search, department, role, status, page = 1, limit = 10 } = req.query;
  const query = { isDeleted: false };

  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { employeeId: { $regex: search, $options: 'i' } }
    ];
  }

  if (department) {
    let deptObjId = null;
    if (mongoose.Types.ObjectId.isValid(department)) {
      deptObjId = department;
    } else {
      const deptDoc = await Department.findOne({
        $or: [{ name: department }, { code: department }],
        isDeleted: false
      });
      if (deptDoc) deptObjId = deptDoc._id;
    }

    if (deptObjId) {
      query.department = deptObjId;
    }
  }
  if (role) query.role = role;
  if (status) query.status = status;

  // Filter for Manager role: show team members if requested
  if (req.user.role === 'TEAM_LEAD' && req.query.teamOnly === 'true') {
    query.reportingManager = req.user._id;
  }

  const skip = (Number(page) - 1) * Number(limit);
  const total = await User.countDocuments(query);
  const employees = await User.find(query)
    .populate('department', 'name code')
    .populate('designation', 'name code')
    .populate('reportingManager', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  res.status(200).json({
    status: 'success',
    data: {
      employees,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit))
      }
    }
  });
});

export const getEmployeeById = asyncHandler(async (req, res, next) => {
  const employee = await User.findById(req.params.id)
    .populate('department', 'name code description')
    .populate('designation', 'name code grade')
    .populate('reportingManager', 'firstName lastName email profileImage');

  if (!employee || employee.isDeleted) {
    return next(new AppError('Employee not found.', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { employee }
  });
});

export const createEmployee = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  // Check if email already exists
  if (email) {
    const existingEmail = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingEmail) {
      return next(new AppError('An employee account with this Email address already exists.', 400));
    }
  }

  // Check or Auto-generate unique employeeId
  if (req.body.employeeId && req.body.employeeId.trim()) {
    const existingId = await User.findOne({ employeeId: req.body.employeeId.trim() });
    if (existingId) {
      return next(new AppError('Employee ID already exists. Please use a different ID.', 400));
    }
  } else {
    // Auto-generate highest non-conflicting EMP-XXXX ID
    const usersWithEmpId = await User.find({ employeeId: { $regex: /^EMP-\d+$/i } }).select('employeeId');
    let maxNum = 0;
    usersWithEmpId.forEach((u) => {
      if (u.employeeId) {
        const num = parseInt(u.employeeId.replace(/EMP-/i, ''), 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    });

    let nextNum = maxNum + 1;
    let candidateId = `EMP-${String(nextNum).padStart(4, '0')}`;

    while (await User.exists({ employeeId: candidateId })) {
      nextNum += 1;
      candidateId = `EMP-${String(nextNum).padStart(4, '0')}`;
    }

    req.body.employeeId = candidateId;
  }

  // Clean empty strings for ObjectIds
  if (!req.body.department) delete req.body.department;
  if (!req.body.designation) delete req.body.designation;
  if (!req.body.reportingManager) delete req.body.reportingManager;

  // Default password if not provided — strong default
  if (!req.body.password) {
    req.body.password = 'Welcome@123';
  }

  const newEmployee = await User.create(req.body);

  // Initialize Leave Balances for all active Leave Types
  const activeLeaveTypes = await LeaveType.find({ status: 'ACTIVE', isDeleted: false });
  const allocations = activeLeaveTypes.map((lt) => ({
    leaveType: lt._id,
    leaveTypeName: lt.name,
    leaveTypeCode: lt.code,
    colorBadge: lt.colorBadge,
    total: lt.maxDays,
    used: 0,
    pending: 0,
    remaining: lt.maxDays
  }));

  await LeaveBalance.create({
    user: newEmployee._id,
    year: new Date().getFullYear(),
    allocations
  });

  // Increment Department employeeCount
  if (newEmployee.department) {
    await Department.findByIdAndUpdate(newEmployee.department, { $inc: { employeeCount: 1 } });
  }

  // Audit log
  await AuditLog.create({
    user: req.user._id,
    userName: `${req.user.firstName} ${req.user.lastName}`,
    userRole: req.user.role,
    action: 'EMPLOYEE_CREATE',
    module: 'EMPLOYEE',
    details: `Created new employee: ${newEmployee.firstName} ${newEmployee.lastName} (${newEmployee.employeeId})`
  });

  res.status(201).json({
    status: 'success',
    data: { employee: newEmployee }
  });
});

export const updateEmployee = asyncHandler(async (req, res, next) => {
  const employee = await User.findById(req.params.id);
  if (!employee || employee.isDeleted) {
    return next(new AppError('Employee not found.', 404));
  }

  const updateData = { ...req.body };

  // Handle password separately
  if (updateData.password) {
    if (typeof updateData.password === 'string' && updateData.password.trim().length > 0) {
      updateData.password = await bcrypt.hash(updateData.password, 12);
    } else {
      delete updateData.password;
    }
  }

  // Remove empty string ObjectId fields to avoid validation errors
  if (!updateData.department) delete updateData.department;
  if (!updateData.designation) delete updateData.designation;
  if (!updateData.reportingManager) delete updateData.reportingManager;

  // Remove empty required string fields to avoid overwriting with empty string
  ['firstName', 'lastName', 'email', 'employeeId'].forEach((field) => {
    if (field in updateData && !updateData[field]?.toString().trim()) {
      delete updateData[field];
    }
  });

  const updatedEmployee = await User.findByIdAndUpdate(
    req.params.id,
    { $set: updateData },
    { new: true, runValidators: true, context: 'query' }
  )
    .populate('department', 'name code')
    .populate('designation', 'name code')
    .populate('reportingManager', 'firstName lastName email');

  res.status(200).json({
    status: 'success',
    data: { employee: updatedEmployee }
  });
});

export const toggleEmployeeStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;
  const employee = await User.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  );

  if (!employee) return next(new AppError('Employee not found.', 404));

  res.status(200).json({
    status: 'success',
    data: { employee }
  });
});

export const deleteEmployee = asyncHandler(async (req, res, next) => {
  const employee = await User.findByIdAndUpdate(req.params.id, { isDeleted: true, status: 'INACTIVE' });
  if (!employee) return next(new AppError('Employee not found.', 404));

  res.status(200).json({
    status: 'success',
    message: 'Employee deactivated successfully.'
  });
});

// Register or Update Face Lock Descriptor (CEO & HR Access Only)
export const registerFaceLock = asyncHandler(async (req, res, next) => {
  const { faceDescriptor } = req.body;
  const { id } = req.params;

  if (!faceDescriptor || !Array.isArray(faceDescriptor) || faceDescriptor.length === 0) {
    return next(new AppError('Valid Face Descriptor array is required.', 400));
  }

  const employee = await User.findById(id);
  if (!employee || employee.isDeleted) {
    return next(new AppError('Employee not found.', 404));
  }

  employee.faceDescriptor = faceDescriptor;
  employee.isFaceRegistered = true;
  await employee.save({ validateBeforeSave: false });

  await AuditLog.create({
    user: req.user._id,
    userName: `${req.user.firstName} ${req.user.lastName}`,
    userRole: req.user.role,
    action: 'FACE_LOCK_REGISTER',
    module: 'EMPLOYEE',
    details: `Registered Face Lock pattern for employee ${employee.firstName} ${employee.lastName} (${employee.employeeId})`
  });

  res.status(200).json({
    status: 'success',
    message: 'Face Lock registered successfully!',
    data: {
      isFaceRegistered: true
    }
  });
});

// Reset / Remove Face Lock (CEO & HR Access Only)
export const removeFaceLock = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const employee = await User.findById(id);
  if (!employee || employee.isDeleted) {
    return next(new AppError('Employee not found.', 404));
  }

  employee.faceDescriptor = [];
  employee.isFaceRegistered = false;
  await employee.save({ validateBeforeSave: false });

  await AuditLog.create({
    user: req.user._id,
    userName: `${req.user.firstName} ${req.user.lastName}`,
    userRole: req.user.role,
    action: 'FACE_LOCK_REMOVE',
    module: 'EMPLOYEE',
    details: `Removed Face Lock pattern for employee ${employee.firstName} ${employee.lastName} (${employee.employeeId})`
  });

  res.status(200).json({
    status: 'success',
    message: 'Face Lock pattern removed successfully.',
    data: {
      isFaceRegistered: false
    }
  });
});

