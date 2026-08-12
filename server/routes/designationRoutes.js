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
router.post('/', restrictTo('ADMIN', 'HR', 'CEO', 'TEAM_LEAD'), createDesignation);
router.put('/:id', restrictTo('ADMIN', 'HR', 'CEO', 'TEAM_LEAD'), updateDesignation);
router.delete('/:id', restrictTo('ADMIN', 'HR', 'CEO', 'TEAM_LEAD'), deleteDesignation);

export default router;
