import express from 'express';
import {
  getHolidays,
  createHoliday,
  updateHoliday,
  deleteHoliday
} from '../controllers/holidayController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getHolidays);
router.post('/', restrictTo('ADMIN', 'HR', 'CEO'), createHoliday);
router.put('/:id', restrictTo('ADMIN', 'HR', 'CEO'), updateHoliday);
router.delete('/:id', restrictTo('ADMIN', 'HR', 'CEO'), deleteHoliday);

export default router;
