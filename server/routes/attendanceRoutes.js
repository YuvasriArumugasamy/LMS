import express from 'express';
import {
  clockIn,
  clockOut,
  getTodayAttendance,
  getAttendanceLogs,
  updateAttendance
} from '../controllers/attendanceController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/clock-in', clockIn);
router.post('/clock-out', clockOut);
router.get('/today', getTodayAttendance);
router.get('/logs', getAttendanceLogs);
router.patch('/:id', updateAttendance);
router.put('/:id', updateAttendance);

export default router;
