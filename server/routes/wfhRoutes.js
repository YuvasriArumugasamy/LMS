import express from 'express';
import {
  createWfhRequest,
  getWfhRequests,
  approveWfhRequest,
  rejectWfhRequest,
  cancelWfhRequest
} from '../controllers/wfhController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/apply', createWfhRequest);
router.get('/requests', getWfhRequests);
router.patch('/:id/approve', restrictTo('MANAGER', 'HR', 'SUPER_ADMIN'), approveWfhRequest);
router.patch('/:id/reject', restrictTo('MANAGER', 'HR', 'SUPER_ADMIN'), rejectWfhRequest);
router.patch('/:id/cancel', cancelWfhRequest);

export default router;
