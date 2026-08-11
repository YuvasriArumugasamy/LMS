import { User } from '../models/User.js';
import { verifyAccessToken } from '../utils/jwt.js';
import { AppError } from '../utils/appError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const protect = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You are not logged in. Please log in to access this resource.', 401));
  }

  try {
    const decoded = verifyAccessToken(token);
    let currentUser = await User.findById(decoded.id).select('+faceDescriptor');

    if (!currentUser || currentUser.isDeleted || currentUser.status !== 'ACTIVE') {
      return next(new AppError('The user belonging to this token no longer exists or is inactive.', 401));
    }

    if (!currentUser) {
      return next(new AppError('The user belonging to this token no longer exists or is inactive.', 401));
    }

    req.user = currentUser;
    next();
  } catch (error) {
    return next(new AppError('Invalid or expired token. Please log in again.', 401));
  }
});

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action.', 403));
    }
    next();
  };
};
