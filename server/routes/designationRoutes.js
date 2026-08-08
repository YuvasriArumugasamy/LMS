import express from 'express';
import {
  getDesignations,
  createDesignation,
  updateDesignation,
  deleteDesignation
} from '../controllers/designationController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getDesignations);
router.post('/', restrictTo('SUPER_ADMIN', 'HR', 'CEO', 'MANAGER'), createDesignation);
router.put('/:id', restrictTo('SUPER_ADMIN', 'HR', 'CEO', 'MANAGER'), updateDesignation);
router.delete('/:id', restrictTo('SUPER_ADMIN', 'HR', 'CEO', 'MANAGER'), deleteDesignation);

export default router;
