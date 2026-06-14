import express from 'express';
import { register, login, getMe, changePassword } from '../controllers/auth.controller.js';
import authenticate from '../middleware/auth.middleware.js';
import rateLimit from '../middleware/rateLimit.middleware.js';

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 * @body    { name, email, password, confirmPassword }
 * @returns { user, token }
 */
router.post('/register', rateLimit, register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user and return JWT token
 * @access  Public
 * @body    { email, password }
 * @returns { user, token }
 */
router.post('/login', rateLimit, login);

/**
 * @route   GET /api/auth/me
 * @desc    Get current authenticated user
 * @access  Protected (requires valid JWT)
 * @returns { user }
 */
router.get('/me', authenticate, getMe);
router.put('/change-password', authenticate, rateLimit, changePassword);

export default router;
