import express from 'express';
import {
  getLeaveRequests,
  getLeaveRequestById,
  applyLeave,
  approveLeave,
  rejectLeave,
  cancelLeave,
  getLeaveBalances
} from '../controllers/leaveRequestController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getLeaveRequests);
router.get('/balance', getLeaveBalances);
router.get('/:id', getLeaveRequestById);
router.post('/', applyLeave);
router.post('/:id/approve', restrictTo('MANAGER', 'HR', 'SUPER_ADMIN', 'CEO'), approveLeave);
router.post('/:id/reject', restrictTo('MANAGER', 'HR', 'SUPER_ADMIN', 'CEO'), rejectLeave);
router.post('/:id/cancel', cancelLeave);

export default router;
