import express from 'express';
import {
  login,
  register,
  refresh,
  logout,
  forgotPassword,
  resetPassword
} from '../controllers/authController.js';

import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', login);
router.post('/register', register);

router.post('/refresh', refresh);
router.post('/logout', protect, logout);

// Forgot password
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
