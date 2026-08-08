import dotenv from 'dotenv';
import './copy_imgs.mjs';
// LMS Server Entry Point - Updated CEO Exclude Filter
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { connectDB } from './config/db.js';
import { globalErrorHandler } from './middleware/errorMiddleware.js';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import departmentRoutes from './routes/departmentRoutes.js';
import designationRoutes from './routes/designationRoutes.js';
import leaveTypeRoutes from './routes/leaveTypeRoutes.js';
import leaveRequestRoutes from './routes/leaveRequestRoutes.js';
import holidayRoutes from './routes/holidayRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import auditRoutes from './routes/auditRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import wfhRoutes from './routes/wfhRoutes.js';
import dailyReportRoutes from './routes/dailyReportRoutes.js';
import { checkEmergencyEscalations } from './services/escalationService.js';

dotenv.config();

const app = express();

// Database Connection
connectDB();

// Essential Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
  })
);
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check API
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    service: 'Enterprise Leave Management System (ELMS) API',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/designations', designationRoutes);
app.use('/api/leave-types', leaveTypeRoutes);
app.use('/api/leaves', leaveRequestRoutes);
app.use('/api/holidays', holidayRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/wfh', wfhRoutes);
app.use('/api/daily-reports', dailyReportRoutes);

// Global Error Handler
app.use(globalErrorHandler);

// Emergency Leave Escalation Cron/Background Service (Checks every 30 seconds)
const ESCALATION_INTERVAL = Number(process.env.ESCALATION_CHECK_INTERVAL_MS) || 30000;
setInterval(() => {
  checkEmergencyEscalations();
}, ESCALATION_INTERVAL);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 [ELMS Server] Running on http://localhost:${PORT}`);
  console.log(`🚨 [Emergency Escalation Engine] Active (Check every ${ESCALATION_INTERVAL / 1000}s)`);
  console.log(`======================================================\n`);
});
