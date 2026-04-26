import pool from '../config/db.js';

const parseNumber = (value, fallback, min = 0, max = 100) => {
  const parsed = Number.parseInt(value, 10);

  if (Number.isNaN(parsed)) {
    return fallback;
  }

  return Math.min(Math.max(parsed, min), max);
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

  return {
    project,
    isMember: isOwner || Boolean(project.member_role),
  };
};

/**
 * Get project activity log.
 */
export const getProjectActivity = async (req, res, next) => {
  try {
    const projectId = req.params.projectId;
    const limit = parseNumber(req.query.limit, 50, 1, 100);
    const offset = parseNumber(req.query.offset, 0, 0, 10000);
    const access = await getProjectAccess(projectId, req.user.userId);

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

    const result = await pool.query(
      `
      SELECT
        a.id,
        a.project_id,
        a.user_id,
        a.action_type,
        a.entity_type,
        a.entity_id,
        a.details,
        a.created_at,
        u.name AS user_name,
        u.email AS user_email
      FROM activity_logs a
      LEFT JOIN users u ON u.id = a.user_id
      WHERE a.project_id = $1
      ORDER BY a.created_at DESC
      LIMIT $2 OFFSET $3
      `,
      [projectId, limit, offset]
    );

    const countResult = await pool.query(
      'SELECT COUNT(*)::INT AS total FROM activity_logs WHERE project_id = $1',
      [projectId]
    );

    return res.status(200).json({
      success: true,
      data: {
        activity: result.rows,
        total: countResult.rows[0].total,
        limit,
        offset,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user activity log.
 */
export const getUserActivity = async (req, res, next) => {
  try {
    const limit = parseNumber(req.query.limit, 50, 1, 100);
    const offset = parseNumber(req.query.offset, 0, 0, 10000);

    const result = await pool.query(
      `
      SELECT
        a.id,
        a.project_id,
        a.action_type,
        a.entity_type,
        a.entity_id,
        a.details,
        a.created_at,
        p.title AS project_title
      FROM activity_logs a
      LEFT JOIN projects p ON p.id = a.project_id
      WHERE a.user_id = $1
      ORDER BY a.created_at DESC
      LIMIT $2 OFFSET $3
      `,
      [req.user.userId, limit, offset]
    );

    const countResult = await pool.query(
      'SELECT COUNT(*)::INT AS total FROM activity_logs WHERE user_id = $1',
      [req.user.userId]
    );

    return res.status(200).json({
      success: true,
      data: {
        activity: result.rows,
        total: countResult.rows[0].total,
        limit,
        offset,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Helper: log an activity without breaking the main request.
 */
export const logActivity = async (projectId, userId, actionType, entityType, entityId, details = {}) => {
  try {
    await pool.query(
      `
      INSERT INTO activity_logs (project_id, user_id, action_type, entity_type, entity_id, details)
      VALUES ($1, $2, $3, $4, $5, $6::jsonb)
      `,
      [projectId, userId, actionType, entityType, entityId, JSON.stringify(details)]
    );
  } catch (error) {
    console.error('Activity log error:', error);
  }
};
