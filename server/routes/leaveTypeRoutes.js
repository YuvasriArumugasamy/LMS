import express from 'express';
import {
  getLeaveTypes,
  createLeaveType,
  updateLeaveType,
  deleteLeaveType
} from '../controllers/leaveTypeController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getLeaveTypes);
router.post('/', restrictTo('SUPER_ADMIN', 'HR', 'CEO', 'MANAGER'), createLeaveType);
router.put('/:id', restrictTo('SUPER_ADMIN', 'HR', 'CEO', 'MANAGER'), updateLeaveType);
router.delete('/:id', restrictTo('SUPER_ADMIN', 'HR', 'CEO', 'MANAGER'), deleteLeaveType);

export default router;
