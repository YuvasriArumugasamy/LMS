import express from 'express';
import {
  login,
  refreshToken,
  getProfile,
  updateProfile,
  forgotPassword,
  resetPassword
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/refresh-token', refreshToken);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

export default router;
