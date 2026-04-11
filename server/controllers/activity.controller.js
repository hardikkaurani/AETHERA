/**
 * Activity Logger Controller
 * Tracks all project activities (ticket creation, status changes, comments, member changes)
 */
import pool from '../config/db.js';

/**
 * Get project activity log
 */
export const getProjectActivity = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    // Verify user is project member
    const memberCheck = await pool.query(
      'SELECT * FROM project_members WHERE project_id = $1 AND user_id = $2',
      [projectId, req.user.userId]
    );

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ success: false, message: 'Not a project member' });
    }

    // Get activities
    const result = await pool.query(
      `SELECT 
        a.id,
        a.project_id,
        a.user_id,
        a.action_type,
        a.entity_type,
        a.entity_id,
        a.details,
        a.created_at,
        u.name as user_name,
        u.email as user_email
      FROM activity_logs a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.project_id = $1
      ORDER BY a.created_at DESC
      LIMIT $2 OFFSET $3`,
      [projectId, limit, offset]
    );

    // Get total count
    const countResult = await pool.query(
      'SELECT COUNT(*) as total FROM activity_logs WHERE project_id = $1',
      [projectId]
    );

    res.json({
      success: true,
      data: result.rows,
      total: parseInt(countResult.rows[0].total),
      limit,
      offset,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get user activity log
 */
export const getUserActivity = async (req, res, next) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const result = await pool.query(
      `SELECT 
        a.id,
        a.project_id,
        a.action_type,
        a.entity_type,
        a.entity_id,
        a.details,
        a.created_at,
        p.title as project_title
      FROM activity_logs a
      LEFT JOIN projects p ON a.project_id = p.id
      WHERE a.user_id = $1
      ORDER BY a.created_at DESC
      LIMIT $2 OFFSET $3`,
      [req.user.userId, limit, offset]
    );

    const countResult = await pool.query(
      'SELECT COUNT(*) as total FROM activity_logs WHERE user_id = $1',
      [req.user.userId]
    );

    res.json({
      success: true,
      data: result.rows,
      total: parseInt(countResult.rows[0].total),
      limit,
      offset,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Helper: Log an activity
 */
export const logActivity = async (projectId, userId, actionType, entityType, entityId, details = {}) => {
  try {
    await pool.query(
      `INSERT INTO activity_logs (project_id, user_id, action_type, entity_type, entity_id, details)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [projectId, userId, actionType, entityType, entityId, JSON.stringify(details)]
    );
  } catch (err) {
    console.error('Error logging activity:', err);
    // Don't throw - activity logging shouldn't break main operations
  }
};
