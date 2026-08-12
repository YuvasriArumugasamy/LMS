import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
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
import dailyReportRoutes from './routes/dailyReportRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import { checkEmergencyEscalations } from './services/escalationService.js';
import { updateEarnedLeaveToPaidLeave, updateCeoName } from './utils/seed.js';

dotenv.config();

const app = express();

// Database Connection (Only run top-level connection on non-Vercel environments)
if (process.env.VERCEL !== '1') {
  try {
    const dailyReportPath = path.resolve(process.cwd(), 'client/src/pages/DailyReports.jsx');
    if (fs.existsSync(dailyReportPath)) {
      const buf = fs.readFileSync(dailyReportPath);
      let utf8Str = '';
      if (buf[0] === 0xff && buf[1] === 0xfe) {
        utf8Str = buf.toString('utf16le');
      } else {
        utf8Str = buf.toString('utf8');
      }
      utf8Str = utf8Str.replace(/[^\x00-\x7F]/g, '');
      utf8Str = utf8Str.replace(/-ml-(?:\[[^\]]+\]|\S+)/g, 'ml-0');
      utf8Str = utf8Str.replace(/-left-(?:\[[^\]]+\]|\S+)/g, 'left-0');
      utf8Str = utf8Str.replace(/-translate-x-(?:\[[^\]]+\]|\S+)/g, 'translate-x-0');
      utf8Str = utf8Str.replace(/marginLeft\s*:\s*['"]-[^'"]+['"]/g, "marginLeft: '0px'");
      utf8Str = utf8Str.replace(/left\s*:\s*['"]-[^'"]+['"]/g, "left: '0px'");
      utf8Str = utf8Str.replace(
        /(<div[^>]*className=["'][^"']*relative[^"']*w-full[^"']*["'][^>]*>[\s\S]*?<input[^>]*placeholder=["']Search by employee name[^>]*>[\s\S]*?<\/div>)/g,
        `{user?.role !== 'EMPLOYEE' && ( $1 )}`
      );
      utf8Str = utf8Str.replace(
        /(<input[^>]*placeholder=["']Search by employee name[^>]*>)/g,
        `{user?.role !== 'EMPLOYEE' ? $1 : null}`
      );
      utf8Str = utf8Str.replace(
        /(<select[^>]*value={statusFilter}[^>]*>[\s\S]*?<\/select>)/g,
        `{user?.role !== 'EMPLOYEE' && ( $1 )}`
      );

      fs.writeFileSync(dailyReportPath, utf8Str, 'utf8');
      fs.writeFileSync(path.resolve(process.cwd(), 'client/src/pages/DailyReports_utf8.txt'), utf8Str, 'utf8');
      console.log('[UTF-8 Fix] DailyReports.jsx converted to clean UTF-8 and sanitized negative margins.');
    }
  } catch (_) {}

  connectDB().then(() => {
    updateEarnedLeaveToPaidLeave();
    updateCeoName();
  }).catch((err) => {
    console.error('[DB Init Error]', err.message);
  });
}

// Lazy DB connection middleware for Vercel serverless requests
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('[DB Middleware Error]', err.message);
    return res.status(503).json({
      status: 'error',
      message: 'Database connection unavailable. Please try again shortly.'
    });
  }
});

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

// Root & Health Check API
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    service: 'Enterprise Leave Management System (ELMS) API Backend',
    version: '1.0.0'
  });
});

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
app.use('/api/daily-reports', dailyReportRoutes);
app.use('/api/settings', settingsRoutes);

// Global Error Handler
app.use(globalErrorHandler);

// Emergency Leave Escalation Cron/Background Service (Checks every 30 seconds)
const ESCALATION_INTERVAL = Number(process.env.ESCALATION_CHECK_INTERVAL_MS) || 30000;
if (process.env.VERCEL !== '1') {
  setInterval(() => {
    checkEmergencyEscalations();
  }, ESCALATION_INTERVAL);
}

const PORT = process.env.PORT || 5000;
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🚀 [ELMS Server] Running on http://localhost:${PORT}`);
    console.log(`🚨 [Emergency Escalation Engine] Active (Check every ${ESCALATION_INTERVAL / 1000}s)`);
    console.log(`======================================================\n`);
  });
}

export default app;
