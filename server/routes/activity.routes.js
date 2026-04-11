import express from 'express';
import { getProjectActivity, getUserActivity } from '../controllers/activity.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * Activity Routes
 * Supports retrieving activity logs for projects and users
 */

// Get project activity log
router.get('/projects/:projectId/activity', authMiddleware, getProjectActivity);

// Get user activity log
router.get('/activity', authMiddleware, getUserActivity);

export default router;
