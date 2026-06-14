import pool from '../config/db.js';
import { logActivity } from './activity.controller.js';
import { canWriteProjectContent } from '../utils/permissions.js';

const validPriorities = ['low', 'medium', 'high', 'critical'];
const validTypes = ['bug', 'feature', 'task', 'improvement'];
const validStatuses = ['todo', 'in_progress', 'done'];

const parsePage = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) || parsed < 1 ? fallback : parsed;
};

const normalizeStatus = (status) => {
  if (!status) {
    return undefined;
  }

  const value = String(status).trim().toLowerCase();
  return value === 'in-progress' ? 'in_progress' : value;
};

const getProjectAccess = async (projectId, userId) => {
  const result = await pool.query(
    `
    SELECT
      p.id,
      p.owner_id,
      pm.role AS member_role
    FROM projects p
    LEFT JOIN project_members pm
      ON pm.project_id = p.id AND pm.user_id = $2
    WHERE p.id = $1
    `,
    [projectId, userId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const project = result.rows[0];
  const isOwner = project.owner_id === userId;
  const isMember = isOwner || Boolean(project.member_role);

  return {
    project,
    isOwner,
    isMember,
    userRole: isOwner ? 'owner' : project.member_role,
  };
};

const getTicketAccess = async (ticketId, userId) => {
  const result = await pool.query(
    `
    SELECT
      t.id,
      t.project_id,
      t.reporter_id,
      t.assignee_id,
      t.status,
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
  const isMember = isOwner || Boolean(ticket.member_role);

  return {
    ticket,
    isOwner,
    isMember,
    userRole: isOwner ? 'owner' : ticket.member_role,
  };
};

const isProjectMember = async (projectId, userId) => {
  const result = await pool.query(
    'SELECT 1 FROM project_members WHERE project_id = $1 AND user_id = $2',
    [projectId, userId]
  );

  return result.rows.length > 0;
};

const getTicketWithMeta = async (ticketId) => {
  const result = await pool.query(
    `
    SELECT
      t.*,
      a.name AS assignee_name,
      a.email AS assignee_email,
      r.name AS reporter_name,
      r.email AS reporter_email,
      COUNT(c.id)::INT AS comment_count
    FROM tickets t
    LEFT JOIN users a ON a.id = t.assignee_id
    LEFT JOIN users r ON r.id = t.reporter_id
    LEFT JOIN comments c ON c.ticket_id = t.id
    WHERE t.id = $1
    GROUP BY t.id, a.id, a.name, a.email, r.id, r.name, r.email
    `,
    [ticketId]
  );

  return result.rows[0] || null;
};

/**
 * Get all tickets for a project with filters.
 */
export const getProjectTickets = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.userId;
    const access = await getProjectAccess(projectId, userId);

    if (!access) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    if (!access.isMember) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    const page = parsePage(req.query.page, 1);
    const limit = Math.min(parsePage(req.query.limit, 20), 100);
    const offset = (page - 1) * limit;
    const status = normalizeStatus(req.query.status);
    const priority = req.query.priority?.trim().toLowerCase();
    const assignee = req.query.assignee?.trim();
    const search = req.query.search?.trim();
    const sortBy = req.query.sortBy;
    const sortOrder = req.query.sortOrder;

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: todo, in-progress, done`,
      });
    }

    if (priority && !validPriorities.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: `Invalid priority. Must be one of: ${validPriorities.join(', ')}`,
      });
    }

    const where = ['t.project_id = $1'];
    const params = [projectId];

    if (status) {
      params.push(status);
      where.push(`t.status = $${params.length}`);
    }

    if (priority) {
      params.push(priority);
      where.push(`t.priority = $${params.length}`);
    }

    if (assignee) {
      params.push(assignee);
      where.push(`t.assignee_id = $${params.length}`);
    }

    if (search) {
      params.push(`%${search}%`);
      where.push(`(t.title ILIKE $${params.length} OR COALESCE(t.description, '') ILIKE $${params.length})`);
    }

    const whereClause = `WHERE ${where.join(' AND ')}`;
    const validSortFields = ['created_at', 'updated_at', 'priority', 'status', 'title', 'due_date'];
    const safeSortBy = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    const safeSortOrder = String(sortOrder).toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const countResult = await pool.query(
      `SELECT COUNT(*)::INT AS total FROM tickets t ${whereClause}`,
      params
    );

    const ticketsResult = await pool.query(
      `
      SELECT
        t.*,
        a.name AS assignee_name,
        a.email AS assignee_email,
        r.name AS reporter_name,
        r.email AS reporter_email,
        COUNT(c.id)::INT AS comment_count
      FROM tickets t
      LEFT JOIN users a ON a.id = t.assignee_id
      LEFT JOIN users r ON r.id = t.reporter_id
      LEFT JOIN comments c ON c.ticket_id = t.id
      ${whereClause}
      GROUP BY t.id, a.id, a.name, a.email, r.id, r.name, r.email
      ORDER BY t.${safeSortBy} ${safeSortOrder}
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
      `,
      [...params, limit, offset]
    );

    const total = countResult.rows[0].total;

    return res.status(200).json({
      success: true,
      data: {
        tickets: ticketsResult.rows,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit) || 1,
          total,
          limit,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new ticket in a project.
 */
export const createTicket = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.userId;
    const access = await getProjectAccess(projectId, userId);

    if (!access) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
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
        message: 'Viewers cannot create tickets',
      });
    }

    const title = req.body.title?.trim();
    const description = req.body.description?.trim() || null;
    const priority = req.body.priority?.trim().toLowerCase() || 'medium';
    const type = req.body.type?.trim().toLowerCase() || 'bug';
    const assigneeId = req.body.assignee_id || null;
    const dueDate = req.body.due_date || null;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Ticket title is required',
      });
    }

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

    if (assigneeId && !(await isProjectMember(projectId, assigneeId))) {
      return res.status(400).json({
        success: false,
        message: 'Assignee must be a project member',
      });
    }

    const result = await pool.query(
      `
      INSERT INTO tickets (
        project_id,
        title,
        description,
        priority,
        type,
        reporter_id,
        assignee_id,
        due_date,
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'todo')
      RETURNING id
      `,
      [projectId, title, description, priority, type, userId, assigneeId, dueDate]
    );

    const ticket = await getTicketWithMeta(result.rows[0].id);

    await logActivity(projectId, userId, 'created', 'ticket', ticket.id, {
      title: ticket.title,
      status: ticket.status,
      priority: ticket.priority,
      assigneeId: ticket.assignee_id,
    });

    return res.status(201).json({
      success: true,
      message: 'Ticket created successfully',
      data: {
        ticket,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single ticket details with comments.
 */
export const getTicketById = async (req, res, next) => {
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

    const ticket = await getTicketWithMeta(req.params.ticketId);
    const commentsResult = await pool.query(
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
        ticket: {
          ...ticket,
          comments: commentsResult.rows,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update ticket details.
 */
export const updateTicket = async (req, res, next) => {
  try {
    const ticketId = req.params.ticketId;
    const userId = req.user.userId;
    const access = await getTicketAccess(ticketId, userId);

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
        message: 'Viewers cannot update tickets',
      });
    }

    const updates = [];
    const values = [ticketId];
    const changedFields = {};

    if (req.body.title !== undefined) {
      const title = req.body.title?.trim();

      if (!title) {
        return res.status(400).json({
          success: false,
          message: 'Ticket title cannot be empty',
        });
      }

      values.push(title);
      updates.push(`title = $${values.length}`);
      changedFields.title = title;
    }

    if (req.body.description !== undefined) {
      const description = req.body.description?.trim() || null;
      values.push(description);
      updates.push(`description = $${values.length}`);
      changedFields.description = description;
    }

    if (req.body.priority !== undefined) {
      const priority = req.body.priority?.trim().toLowerCase();

      if (!validPriorities.includes(priority)) {
        return res.status(400).json({
          success: false,
          message: `Invalid priority. Must be one of: ${validPriorities.join(', ')}`,
        });
      }

      values.push(priority);
      updates.push(`priority = $${values.length}`);
      changedFields.priority = priority;
    }

    if (req.body.type !== undefined) {
      const type = req.body.type?.trim().toLowerCase();

      if (!validTypes.includes(type)) {
        return res.status(400).json({
          success: false,
          message: `Invalid type. Must be one of: ${validTypes.join(', ')}`,
        });
      }

      values.push(type);
      updates.push(`type = $${values.length}`);
      changedFields.type = type;
    }

    if (req.body.status !== undefined) {
      const status = normalizeStatus(req.body.status);

      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status. Must be one of: todo, in-progress, done',
        });
      }

      values.push(status);
      updates.push(`status = $${values.length}`);
      changedFields.status = status;
    }

    if (req.body.assignee_id !== undefined) {
      const assigneeId = req.body.assignee_id || null;

      if (assigneeId && !(await isProjectMember(access.ticket.project_id, assigneeId))) {
        return res.status(400).json({
          success: false,
          message: 'Assignee must be a project member',
        });
      }

      values.push(assigneeId);
      updates.push(`assignee_id = $${values.length}`);
      changedFields.assignee_id = assigneeId;
    }

    if (req.body.due_date !== undefined) {
      const dueDate = req.body.due_date || null;
      values.push(dueDate);
      updates.push(`due_date = $${values.length}`);
      changedFields.due_date = dueDate;
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update',
      });
    }

    updates.push('updated_at = NOW()');

    await pool.query(
      `UPDATE tickets SET ${updates.join(', ')} WHERE id = $1`,
      values
    );

    const ticket = await getTicketWithMeta(ticketId);

    await logActivity(access.ticket.project_id, userId, 'updated', 'ticket', ticketId, changedFields);

    return res.status(200).json({
      success: true,
      message: 'Ticket updated successfully',
      data: {
        ticket,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update ticket status.
 */
export const updateTicketStatus = async (req, res, next) => {
  try {
    const ticketId = req.params.ticketId;
    const userId = req.user.userId;
    const status = normalizeStatus(req.body.status);

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: todo, in-progress, done',
      });
    }

    const access = await getTicketAccess(ticketId, userId);

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
        message: 'Viewers cannot update ticket status',
      });
    }

    await pool.query(
      `
      UPDATE tickets
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      `,
      [status, ticketId]
    );

    const ticket = await getTicketWithMeta(ticketId);

    await logActivity(access.ticket.project_id, userId, 'status_changed', 'ticket', ticketId, {
      from: access.ticket.status,
      to: status,
    });

    return res.status(200).json({
      success: true,
      message: 'Ticket status updated successfully',
      data: {
        ticket,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete ticket.
 */
export const deleteTicket = async (req, res, next) => {
  try {
    const ticketId = req.params.ticketId;
    const userId = req.user.userId;
    const access = await getTicketAccess(ticketId, userId);

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

    const isReporter = access.ticket.reporter_id === userId;
    const isManager = ['owner', 'admin', 'manager'].includes(access.userRole);

    if (!isReporter && !isManager) {
      return res.status(403).json({
        success: false,
        message: 'Only the ticket reporter, owner, admin, or manager can delete this ticket',
      });
    }

    await pool.query('DELETE FROM tickets WHERE id = $1', [ticketId]);

    await logActivity(access.ticket.project_id, userId, 'deleted', 'ticket', ticketId, {
      reporterId: access.ticket.reporter_id,
      assigneeId: access.ticket.assignee_id,
    });

    return res.status(200).json({
      success: true,
      message: 'Ticket deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
