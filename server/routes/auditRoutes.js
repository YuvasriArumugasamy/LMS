import express from 'express';
import { getAuditLogs, clearAuditLogs } from '../controllers/auditController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.get('/', restrictTo('ADMIN', 'HR', 'CEO', 'TEAM_LEAD'), getAuditLogs);
router.delete('/', restrictTo('ADMIN', 'HR', 'CEO', 'TEAM_LEAD'), clearAuditLogs);

export default router;
