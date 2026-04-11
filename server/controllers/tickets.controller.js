import pool from '../config/db.js';

/**
 * Get all tickets for a project with filters
 * Supports filtering by: status, priority, assignee, search term
 * Supports pagination and sorting
 */
export const getProjectTickets = async (req, res, next) => {
  try {
    const { id: projectId } = req.params;
    const userId = req.user.userId;
    const {
      status,
      priority,
      assignee,
      search,
      page = 1,
      limit = 20,
      sortBy = 'created_at',
      sortOrder = 'DESC',
    } = req.query;

    // Verify user has access to project
    const accessCheck = await pool.query(
      `
      SELECT role FROM project_members
      WHERE project_id = $1 AND user_id = $2
      `,
      [projectId, userId]
    );

    if (accessCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    // Build dynamic query
    let whereClause = 'WHERE t.project_id = $1';
    const params = [projectId];
    let paramIndex = 2;

    // Add filters
    if (status) {
      whereClause += ` AND t.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (priority) {
      whereClause += ` AND t.priority = $${paramIndex}`;
      params.push(priority);
      paramIndex++;
    }

    if (assignee) {
      whereClause += ` AND t.assignee_id = $${paramIndex}`;
      params.push(assignee);
      paramIndex++;
    }

    if (search) {
      whereClause += ` AND (t.title ILIKE $${paramIndex} OR t.description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Validate sortBy to prevent SQL injection
    const validSortFields = ['created_at', 'updated_at', 'priority', 'status', 'title', 'due_date'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Get total count
    const countResult = await pool.query(
      `SELECT COUNT(*) as total FROM tickets t ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    // Get tickets with assignee and reporter info
    const offset = (page - 1) * limit;
    const ticketsResult = await pool.query(
      `
      SELECT 
        t.*,
        a.name as assignee_name,
        a.email as assignee_email,
        r.name as reporter_name,
        r.email as reporter_email,
        COUNT(c.id) as comment_count
      FROM tickets t
      LEFT JOIN users a ON t.assignee_id = a.id
      LEFT JOIN users r ON t.reporter_id = r.id
      LEFT JOIN comments c ON t.id = c.ticket_id
      ${whereClause}
      GROUP BY t.id, a.id, a.name, a.email, r.id, r.name, r.email
      ORDER BY t.${sortField} ${order}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `,
      [...params, limit, offset]
    );

    return res.status(200).json({
      success: true,
      data: {
        tickets: ticketsResult.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          total,
          limit: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error('Get tickets error:', error);
    next(error);
  }
};

/**
 * Create a new ticket in a project
 */
export const createTicket = async (req, res, next) => {
  try {
    const { id: projectId } = req.params;
    const userId = req.user.userId;
    const { title, description, priority = 'medium', type = 'bug', assignee_id, due_date } = req.body;

    // Validate input
    if (!title || title.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Ticket title is required',
      });
    }

    // Verify user is project member
    const memberCheck = await pool.query(
      'SELECT role FROM project_members WHERE project_id = $1 AND user_id = $2',
      [projectId, userId]
    );

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    // Validate enum values
    const validPriorities = ['low', 'medium', 'high', 'critical'];
    const validTypes = ['bug', 'feature', 'task', 'improvement'];

    if (!validPriorities.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: `Invalid priority. Must be one of: ${validPriorities.join(', ')}`,
      });
    }

    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `Invalid type. Must be one of: ${validTypes.join(', ')}`,
      });
    }

    // If assignee provided, verify they're a project member
    if (assignee_id) {
      const assigneeCheck = await pool.query(
        'SELECT user_id FROM project_members WHERE project_id = $1 AND user_id = $2',
        [projectId, assignee_id]
      );

      if (assigneeCheck.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Assignee must be a project member',
        });
      }
    }

    // Create ticket
    const result = await pool.query(
      `
      INSERT INTO tickets (project_id, title, description, priority, type, reporter_id, assignee_id, due_date, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
      `,
      [projectId, title, description || null, priority, type, userId, assignee_id || null, due_date || null, 'todo']
    );

    const ticket = result.rows[0];

    return res.status(201).json({
      success: true,
      message: 'Ticket created successfully',
      data: {
        ticket,
      },
    });
  } catch (error) {
    console.error('Create ticket error:', error);
    next(error);
  }
};

/**
 * Get single ticket details with comments
 */
export const getTicketById = async (req, res, next) => {
  try {
    const { ticketId } = req.params;
    const userId = req.user.userId;

    // Get ticket with assignee/reporter info
    const ticketResult = await pool.query(
      `
      SELECT 
        t.*,
        a.name as assignee_name,
        a.email as assignee_email,
        r.name as reporter_name,
        r.email as reporter_email
      FROM tickets t
      LEFT JOIN users a ON t.assignee_id = a.id
      LEFT JOIN users r ON t.reporter_id = r.id
      WHERE t.id = $1
      `,
      [ticketId]
    );

    if (ticketResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found',
      });
    }

    const ticket = ticketResult.rows[0];

    // Verify user has access to this ticket's project
    const accessCheck = await pool.query(
      `
      SELECT role FROM project_members
      WHERE project_id = $1 AND user_id = $2
      `,
      [ticket.project_id, userId]
    );

    if (accessCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    // Get comments for this ticket
    const commentsResult = await pool.query(
      `
      SELECT c.*, u.name, u.email, u.avatar_url
      FROM comments c
      JOIN users u ON c.author_id = u.id
      WHERE c.ticket_id = $1
      ORDER BY c.created_at DESC
      `,
      [ticketId]
    );

    return res.status(200).json({
      success: true,
      data: {
        ticket: {
          ...ticket,
          comments: commentsResult.rows,
        },
      },
    });
  } catch (error) {
    console.error('Get ticket error:', error);
    next(error);
  }
};

/**
 * Update ticket (title, description, priority, type, assignee, due_date)
 * Any project member can update
 */
export const updateTicket = async (req, res, next) => {
  try {
    const { ticketId } = req.params;
    const userId = req.user.userId;
    const { title, description, priority, type, assignee_id, due_date } = req.body;

    // Get ticket
    const ticketResult = await pool.query('SELECT project_id FROM tickets WHERE id = $1', [ticketId]);

    if (ticketResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found',
      });
    }

    const projectId = ticketResult.rows[0].project_id;

    // Verify user is project member
    const memberCheck = await pool.query(
      'SELECT role FROM project_members WHERE project_id = $1 AND user_id = $2',
      [projectId, userId]
    );

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    // Build update query dynamically
    const updates = [];
    const values = [ticketId];
    let paramIndex = 2;

    if (title !== undefined) {
      updates.push(`title = $${paramIndex}`);
      values.push(title);
      paramIndex++;
    }

    if (description !== undefined) {
      updates.push(`description = $${paramIndex}`);
      values.push(description);
      paramIndex++;
    }

    if (priority !== undefined) {
      updates.push(`priority = $${paramIndex}`);
      values.push(priority);
      paramIndex++;
    }

    if (type !== undefined) {
      updates.push(`type = $${paramIndex}`);
      values.push(type);
      paramIndex++;
    }

    if (assignee_id !== undefined) {
      // Verify assignee is project member
      if (assignee_id !== null) {
        const assigneeCheck = await pool.query(
          'SELECT user_id FROM project_members WHERE project_id = $1 AND user_id = $2',
          [projectId, assignee_id]
        );

        if (assigneeCheck.rows.length === 0) {
          return res.status(400).json({
            success: false,
            message: 'Assignee must be a project member',
          });
        }
      }

      updates.push(`assignee_id = $${paramIndex}`);
      values.push(assignee_id);
      paramIndex++;
    }

    if (due_date !== undefined) {
      updates.push(`due_date = $${paramIndex}`);
      values.push(due_date);
      paramIndex++;
    }

    // Always update updated_at
    updates.push(`updated_at = NOW()`);

    if (updates.length === 1) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update',
      });
    }

    const query = `UPDATE tickets SET ${updates.join(', ')} WHERE id = $1 RETURNING *`;

    const result = await pool.query(query, values);
    const ticket = result.rows[0];

    // Get updated comment count
    const commentCount = await pool.query(
      'SELECT COUNT(*) as count FROM comments WHERE ticket_id = $1',
      [ticketId]
    );

    ticket.comment_count = parseInt(commentCount.rows[0].count);

    return res.status(200).json({
      success: true,
      message: 'Ticket updated successfully',
      data: {
        ticket,
      },
    });
  } catch (error) {
    console.error('Update ticket error:', error);
    next(error);
  }
};

/**
 * Update ticket status (todo, in_progress, done)
 * Used for Kanban drag-and-drop
 */
export const updateTicketStatus = async (req, res, next) => {
  try {
    const { ticketId } = req.params;
    const userId = req.user.userId;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['todo', 'in_progress', 'done'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    // Get ticket
    const ticketResult = await pool.query('SELECT project_id FROM tickets WHERE id = $1', [ticketId]);

    if (ticketResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found',
      });
    }

    const projectId = ticketResult.rows[0].project_id;

    // Verify user is project member
    const memberCheck = await pool.query(
      'SELECT role FROM project_members WHERE project_id = $1 AND user_id = $2',
      [projectId, userId]
    );

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    // Update status
    const result = await pool.query(
      'UPDATE tickets SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, ticketId]
    );

    return res.status(200).json({
      success: true,
      message: 'Ticket status updated',
      data: {
        ticket: result.rows[0],
      },
    });
  } catch (error) {
    console.error('Update ticket status error:', error);
    next(error);
  }
};

/**
 * Delete ticket
 * Only reporter or project admin can delete
 */
export const deleteTicket = async (req, res, next) => {
  try {
    const { ticketId } = req.params;
    const userId = req.user.userId;

    // Get ticket
    const ticketResult = await pool.query(
      'SELECT project_id, reporter_id FROM tickets WHERE id = $1',
      [ticketId]
    );

    if (ticketResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found',
      });
    }

    const { project_id: projectId, reporter_id: reporterId } = ticketResult.rows[0];

    // Verify user is reporter or admin
    const memberResult = await pool.query(
      'SELECT role FROM project_members WHERE project_id = $1 AND user_id = $2',
      [projectId, userId]
    );

    if (memberResult.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    const userRole = memberResult.rows[0].role;
    const isReporter = userId === reporterId;
    const isAdmin = ['admin', 'manager'].includes(userRole);

    if (!isReporter && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only ticket reporter or admin can delete',
      });
    }

    // Delete ticket (cascades to comments)
    await pool.query('DELETE FROM tickets WHERE id = $1', [ticketId]);

    return res.status(200).json({
      success: true,
      message: 'Ticket deleted successfully',
    });
  } catch (error) {
    console.error('Delete ticket error:', error);
    next(error);
  }
};
