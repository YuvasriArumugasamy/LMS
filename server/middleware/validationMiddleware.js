/**
 * Input Validation & Sanitization Middleware
 * Prevents XSS attacks and validates file uploads
 */

import { AppError } from '../utils/appError.js';

// HTML/Script tag sanitization
export const sanitizeInput = (str) => {
  if (typeof str !== 'string') return str;
  
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
};

// Recursive object sanitization
export const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  
  const sanitized = Array.isArray(obj) ? [] : {};
  
  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      sanitized[key] = sanitizeInput(obj[key]);
    } else if (typeof obj[key] === 'object') {
      sanitized[key] = sanitizeObject(obj[key]);
    } else {
      sanitized[key] = obj[key];
    }
  }
  
  return sanitized;
};

// Middleware to sanitize request body
export const sanitizeRequestBody = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  next();
};

// File upload validation
export const validateFileUpload = (req, res, next) => {
  const { attachments } = req.body;
  
  if (!attachments || !Array.isArray(attachments) || attachments.length === 0) {
    return next();
  }
  
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'];
  const ALLOWED_MIME_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  for (const file of attachments) {
    // Check file name
    if (!file.fileName || typeof file.fileName !== 'string') {
      return next(new AppError('Invalid file name', 400));
    }
    
    // Check extension
    const ext = file.fileName.toLowerCase().slice(file.fileName.lastIndexOf('.'));
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return next(new AppError(`File type ${ext} not allowed. Allowed types: PDF, JPG, PNG, DOC, DOCX`, 400));
    }
    
    // Check MIME type if provided
    if (file.fileType && !ALLOWED_MIME_TYPES.includes(file.fileType.toLowerCase())) {
      return next(new AppError(`MIME type ${file.fileType} not allowed`, 400));
    }
    
    // Check file URL for dangerous patterns
    if (file.fileUrl) {
      const dangerousPatterns = ['.exe', '.sh', '.bat', '.cmd', '.com', 'javascript:', 'data:'];
      const urlLower = file.fileUrl.toLowerCase();
      
      for (const pattern of dangerousPatterns) {
        if (urlLower.includes(pattern)) {
          return next(new AppError(`Dangerous file pattern detected: ${pattern}`, 400));
        }
      }
    }
    
    // Estimate size if base64 data URL
    if (file.fileUrl && file.fileUrl.startsWith('data:')) {
      const base64Length = file.fileUrl.split(',')[1]?.length || 0;
      const estimatedSize = (base64Length * 3) / 4;
      
      if (estimatedSize > MAX_FILE_SIZE) {
        return next(new AppError(`File ${file.fileName} exceeds maximum size of 5MB`, 400));
      }
    }
  }
  
  next();
};

// Strong password validation
export const validateStrongPassword = (password) => {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: 'Password is required' };
  }
  
  if (password.length < 10) {
    return { valid: false, message: 'Password must be at least 10 characters long' };
  }
  
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one special character (!@#$%^&*...)' };
  }
  
  return { valid: true };
};
