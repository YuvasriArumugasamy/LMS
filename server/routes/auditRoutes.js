import express from 'express';
import { getAuditLogs } from '../controllers/auditController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.get('/', restrictTo('SUPER_ADMIN', 'HR', 'CEO'), getAuditLogs);

export default router;
