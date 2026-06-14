import pool from '../config/db.js';
import { logActivity } from './activity.controller.js';
import { canWriteProjectContent } from '../utils/permissions.js';

const getTicketAccess = async (ticketId, userId) => {
  const result = await pool.query(
    `
    SELECT
      t.id,
      t.project_id,
      p.owner_id,
      pm.role AS member_role
    FROM tickets t
    JOIN projects p ON p.id = t.project_id
    LEFT JOIN project_members pm
      ON pm.project_id = p.id AND pm.user_id = $2
    WHERE t.id = $1
    `,
    [ticketId, userId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const ticket = result.rows[0];
  const isOwner = ticket.owner_id === userId;

  return {
    ticket,
    isMember: isOwner || Boolean(ticket.member_role),
    userRole: isOwner ? 'owner' : ticket.member_role,
  };
};

const getCommentDetails = async (commentId) => {
  const result = await pool.query(
    `
    SELECT
      c.id,
      c.ticket_id,
      c.author_id,
      c.body,
      c.created_at,
      u.name AS author_name,
      u.email AS author_email,
      u.avatar_url
    FROM comments c
    JOIN users u ON u.id = c.author_id
    WHERE c.id = $1
    `,
    [commentId]
  );

  return result.rows[0] || null;
};

/**
 * Get all comments for a ticket.
 */
export const getTicketComments = async (req, res, next) => {
  try {
    const access = await getTicketAccess(req.params.ticketId, req.user.userId);

    if (!access) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found',
      });
    }

    if (!access.isMember) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    const result = await pool.query(
      `
      SELECT
        c.id,
        c.ticket_id,
        c.author_id,
        c.body,
        c.created_at,
        u.name AS author_name,
        u.email AS author_email,
        u.avatar_url
      FROM comments c
      JOIN users u ON u.id = c.author_id
      WHERE c.ticket_id = $1
      ORDER BY c.created_at DESC
      `,
      [req.params.ticketId]
    );

    return res.status(200).json({
      success: true,
      data: {
        comments: result.rows,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a comment on a ticket.
 */
export const createComment = async (req, res, next) => {
  try {
    const ticketId = req.params.ticketId;
    const userId = req.user.userId;
    const body = req.body.body?.trim();
    const access = await getTicketAccess(ticketId, userId);

    if (!body) {
      return res.status(400).json({
        success: false,
        message: 'Comment body is required',
      });
    }

    if (!access) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found',
      });
    }

    if (!access.isMember) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    if (!canWriteProjectContent(access.userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Viewers cannot create comments',
      });
    }

    const result = await pool.query(
      `
      INSERT INTO comments (ticket_id, author_id, body)
      VALUES ($1, $2, $3)
      RETURNING id
      `,
      [ticketId, userId, body]
    );

    const comment = await getCommentDetails(result.rows[0].id);

    await logActivity(access.ticket.project_id, userId, 'commented', 'comment', comment.id, {
      ticketId,
    });

    return res.status(201).json({
      success: true,
      message: 'Comment created successfully',
      data: {
        comment,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a comment.
 */
export const deleteComment = async (req, res, next) => {
  try {
    const commentId = req.params.commentId;
    const userId = req.user.userId;

    const result = await pool.query(
      `
      SELECT
        c.id,
        c.author_id,
        c.ticket_id,
        t.project_id,
        p.owner_id,
        pm.role AS member_role
      FROM comments c
      JOIN tickets t ON t.id = c.ticket_id
      JOIN projects p ON p.id = t.project_id
      LEFT JOIN project_members pm
        ON pm.project_id = p.id AND pm.user_id = $2
      WHERE c.id = $1
      `,
      [commentId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      });
    }

    const comment = result.rows[0];
    const isOwner = comment.owner_id === userId;
    const isMember = isOwner || Boolean(comment.member_role);

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    const canDelete =
      comment.author_id === userId ||
      isOwner ||
      ['admin', 'manager'].includes(comment.member_role);

    if (!canDelete) {
      return res.status(403).json({
        success: false,
        message: 'Only the comment author, owner, admin, or manager can delete this comment',
      });
    }

    await pool.query('DELETE FROM comments WHERE id = $1', [commentId]);

    await logActivity(comment.project_id, userId, 'deleted', 'comment', commentId, {
      ticketId: comment.ticket_id,
      authorId: comment.author_id,
    });

    return res.status(200).json({
      success: true,
      message: 'Comment deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
