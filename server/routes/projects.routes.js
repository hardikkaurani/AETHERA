import express from 'express';
import authenticate from '../middleware/auth.middleware.js';
import {
  getProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
  addProjectMember,
  removeProjectMember,
} from '../controllers/projects.controller.js';

const router = express.Router();

/**
 * All project routes are protected (require valid JWT)
 */

/**
 * @route   GET /api/projects
 * @desc    Get all projects for current user
 * @access  Protected
 * @query   { page, limit }
 * @returns { projects[], pagination }
 */
router.get('/', authenticate, getProjects);

/**
 * @route   POST /api/projects
 * @desc    Create a new project
 * @access  Protected
 * @body    { title, description }
 * @returns { project }
 */
router.post('/', authenticate, createProject);

/**
 * @route   GET /api/projects/:id
 * @desc    Get single project with all members
 * @access  Protected (member or owner only)
 * @returns { project, members }
 */
router.get('/:id', authenticate, getProjectById);

/**
 * @route   PUT /api/projects/:id
 * @desc    Update project (owner only)
 * @access  Protected
 * @body    { title, description }
 * @returns { project }
 */
router.put('/:id', authenticate, updateProject);

/**
 * @route   DELETE /api/projects/:id
 * @desc    Delete project (owner only)
 * @access  Protected
 * @returns { success message }
 */
router.delete('/:id', authenticate, deleteProject);

/**
 * @route   POST /api/projects/:id/members
 * @desc    Add member to project (owner/admin only)
 * @access  Protected
 * @body    { email, role }
 * @returns { member }
 */
router.post('/:id/members', authenticate, addProjectMember);

/**
 * @route   DELETE /api/projects/:id/members/:memberId
 * @desc    Remove member from project (owner/admin only)
 * @access  Protected
 * @returns { success message }
 */
router.delete('/:id/members/:memberId', authenticate, removeProjectMember);

export default router;
