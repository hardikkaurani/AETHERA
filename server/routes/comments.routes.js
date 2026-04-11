import express from 'express';
import authenticate from '../middleware/auth.middleware.js';
import {
  getTicketComments,
  createComment,
  deleteComment,
} from '../controllers/comments.controller.js';

const router = express.Router();

/**
 * All comment routes are protected (require valid JWT)
 */

/**
 * @route   GET /api/tickets/:ticketId/comments
 * @desc    Get all comments for a ticket
 * @access  Protected (project member)
 * @returns { comments[] }
 */
router.get('/tickets/:ticketId/comments', authenticate, getTicketComments);

/**
 * @route   POST /api/tickets/:ticketId/comments
 * @desc    Add a comment to a ticket
 * @access  Protected (project member)
 * @body    { body }
 * @returns { comment }
 */
router.post('/tickets/:ticketId/comments', authenticate, createComment);

/**
 * @route   DELETE /api/comments/:commentId
 * @desc    Delete a comment (author or admin only)
 * @access  Protected
 * @returns { success message }
 */
router.delete('/comments/:commentId', authenticate, deleteComment);

export default router;
