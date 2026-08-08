import express from 'express';
import {
  submitDailyReport,
  getTodayReportStatus,
  getDailyReports,
  reviewDailyReport,
  updateDailyReport,
  deleteDailyReport,
  sendDailyReportReminder,
  getEmployeeReportHistory
} from '../controllers/dailyReportController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/', submitDailyReport);
router.post('/remind', restrictTo('SUPER_ADMIN', 'HR', 'CEO', 'MANAGER'), sendDailyReportReminder);
router.get('/today', getTodayReportStatus);
router.get('/history/:userId', getEmployeeReportHistory);
router.get('/', getDailyReports);
router.put('/:id', updateDailyReport);
router.patch('/:id', restrictTo('SUPER_ADMIN', 'HR', 'CEO', 'MANAGER'), reviewDailyReport);
router.delete('/:id', deleteDailyReport);

export default router;
