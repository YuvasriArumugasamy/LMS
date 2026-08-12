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
router.post('/', restrictTo('ADMIN', 'CEO'), createLeaveType);
router.put('/:id', restrictTo('ADMIN', 'CEO'), updateLeaveType);
router.delete('/:id', restrictTo('ADMIN', 'CEO'), deleteLeaveType);

export default router;
