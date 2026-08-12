import express from 'express';
import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment
} from '../controllers/departmentController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getDepartments);
router.post('/', restrictTo('ADMIN', 'HR', 'CEO'), createDepartment);
router.put('/:id', restrictTo('ADMIN', 'HR', 'CEO'), updateDepartment);
router.delete('/:id', restrictTo('ADMIN', 'HR', 'CEO'), deleteDepartment);

export default router;
