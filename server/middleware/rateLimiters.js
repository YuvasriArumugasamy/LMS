/**
 * Rate Limiting Middleware for All POST Endpoints
 * Prevents DoS attacks and spam
 */

import rateLimit from 'express-rate-limit';

// General POST endpoint rate limiter (5 requests per minute)
export const postEndpointLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  message: {
    status: 'fail',
    message: 'Too many requests. Please wait a minute before trying again.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false
});

// Leave application rate limiter (3 per minute)
export const leaveApplicationLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  message: {
    status: 'fail',
    message: 'Too many leave applications. Please wait before submitting another.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Attendance clock-in/out rate limiter (2 per minute)
export const attendanceLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 2,
  message: {
    status: 'fail',
    message: 'Too many attendance actions. Please wait before trying again.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Daily report submission rate limiter (3 per 5 minutes)
export const dailyReportLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 3,
  message: {
    status: 'fail',
    message: 'Too many report submissions. Please wait before submitting again.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Employee creation rate limiter (10 per hour for admins)
export const employeeCreationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: {
    status: 'fail',
    message: 'Too many employee creation requests. Please wait an hour.'
  },
  standardHeaders: true,
  legacyHeaders: false
});
