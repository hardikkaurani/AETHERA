import express from 'express';
import authenticate from '../middleware/auth.middleware.js';
import {
  getProjectTickets,
  createTicket,
  getTicketById,
  updateTicket,
  updateTicketStatus,
  deleteTicket,
} from '../controllers/tickets.controller.js';

const router = express.Router();

/**
 * All ticket routes are protected (require valid JWT)
 */

/**
 * @route   GET /api/projects/:id/tickets
 * @desc    Get all tickets for a project with filters
 * @access  Protected (project member)
 * @query   { status, priority, assignee, search, page, limit, sortBy, sortOrder }
 * @returns { tickets[], pagination }
 */
router.get('/projects/:id/tickets', authenticate, getProjectTickets);

/**
 * @route   POST /api/projects/:id/tickets
 * @desc    Create a new ticket in a project
 * @access  Protected (project member)
 * @body    { title, description, priority, type, assignee_id, due_date }
 * @returns { ticket }
 */
router.post('/projects/:id/tickets', authenticate, createTicket);

/**
 * @route   GET /api/tickets/:ticketId
 * @desc    Get single ticket with comments
 * @access  Protected (project member)
 * @returns { ticket, comments }
 */
router.get('/tickets/:ticketId', authenticate, getTicketById);

/**
 * @route   PUT /api/tickets/:ticketId
 * @desc    Update ticket details
 * @access  Protected (project member)
 * @body    { title, description, priority, type, assignee_id, due_date }
 * @returns { ticket }
 */
router.put('/tickets/:ticketId', authenticate, updateTicket);

/**
 * @route   PATCH /api/tickets/:ticketId/status
 * @desc    Update ticket status (Kanban drag-and-drop)
 * @access  Protected (project member)
 * @body    { status: 'todo' | 'in_progress' | 'done' }
 * @returns { ticket }
 */
router.patch('/tickets/:ticketId/status', authenticate, updateTicketStatus);

/**
 * @route   DELETE /api/tickets/:ticketId
 * @desc    Delete ticket (reporter or admin only)
 * @access  Protected
 * @returns { success message }
 */
router.delete('/tickets/:ticketId', authenticate, deleteTicket);

export default router;
