import pool from '../config/db.js';

/**
 * Get all comments for a ticket
 */
export const getTicketComments = async (req, res, next) => {
  try {
    const { ticketId } = req.params;
    const userId = req.user.userId;

    // Get ticket to verify access
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

    // Get comments
    const result = await pool.query(
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
        comments: result.rows,
      },
    });
  } catch (error) {
    console.error('Get comments error:', error);
    next(error);
  }
};

/**
 * Create a comment on a ticket
 */
export const createComment = async (req, res, next) => {
  try {
    const { ticketId } = req.params;
    const userId = req.user.userId;
    const { body } = req.body;

    // Validate input
    if (!body || body.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Comment body is required',
      });
    }

    // Get ticket to verify access
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

    // Create comment
    const result = await pool.query(
      `
      INSERT INTO comments (ticket_id, author_id, body)
      VALUES ($1, $2, $3)
      RETURNING *
      `,
      [ticketId, userId, body]
    );

    const comment = result.rows[0];

    // Get author info
    const authorResult = await pool.query('SELECT name, email, avatar_url FROM users WHERE id = $1', [userId]);

    return res.status(201).json({
      success: true,
      message: 'Comment created successfully',
      data: {
        comment: {
          ...comment,
          name: authorResult.rows[0].name,
          email: authorResult.rows[0].email,
          avatar_url: authorResult.rows[0].avatar_url,
        },
      },
    });
  } catch (error) {
    console.error('Create comment error:', error);
    next(error);
  }
};

/**
 * Delete a comment (author or admin only)
 */
export const deleteComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.userId;

    // Get comment
    const commentResult = await pool.query(
      `
      SELECT c.author_id, t.project_id
      FROM comments c
      JOIN tickets t ON c.ticket_id = t.id
      WHERE c.id = $1
      `,
      [commentId]
    );

    if (commentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      });
    }

    const { author_id: authorId, project_id: projectId } = commentResult.rows[0];

    // Check if user is author or admin
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
    const isAuthor = userId === authorId;
    const isAdmin = ['admin', 'manager'].includes(userRole);

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only comment author or admin can delete',
      });
    }

    // Delete comment
    await pool.query('DELETE FROM comments WHERE id = $1', [commentId]);

    return res.status(200).json({
      success: true,
      message: 'Comment deleted successfully',
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    next(error);
  }
};
