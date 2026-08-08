import express from 'express';
import { getLeaveReports, exportReport } from '../controllers/reportController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.get('/', restrictTo('SUPER_ADMIN', 'HR', 'MANAGER'), getLeaveReports);
router.get('/export', restrictTo('SUPER_ADMIN', 'HR', 'MANAGER'), exportReport);

export default router;
