import express from 'express';
import {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  toggleEmployeeStatus,
  deleteEmployee,
  registerFaceLock,
  removeFaceLock
} from '../controllers/employeeController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getEmployees);
router.get('/:id', getEmployeeById);
router.post('/', restrictTo('CEO'), createEmployee);
router.put('/:id', restrictTo('SUPER_ADMIN', 'HR', 'CEO'), updateEmployee);
router.patch('/:id/status', restrictTo('SUPER_ADMIN', 'HR', 'CEO'), toggleEmployeeStatus);
router.delete('/:id', restrictTo('SUPER_ADMIN', 'HR', 'CEO'), deleteEmployee);
router.post('/:id/face-lock', restrictTo('SUPER_ADMIN', 'HR', 'CEO'), registerFaceLock);
router.delete('/:id/face-lock', restrictTo('SUPER_ADMIN', 'HR', 'CEO'), removeFaceLock);

export default router;
