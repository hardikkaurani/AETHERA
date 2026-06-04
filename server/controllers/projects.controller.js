import pool from '../config/db.js';
import { logActivity } from './activity.controller.js';

const validRoles = ['admin', 'manager', 'developer', 'viewer'];

const parsePage = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) || parsed < 1 ? fallback : parsed;
};

const getProjectAccess = async (projectId, userId) => {
  const result = await pool.query(
    `
    SELECT
      p.id,
      p.title,
      p.description,
      p.owner_id,
      p.created_at,
      u.name AS owner_name,
      u.email AS owner_email,
      pm.role AS member_role
    FROM projects p
    JOIN users u ON u.id = p.owner_id
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

const getProjectMembers = async (projectId) => {
  const result = await pool.query(
    `
    SELECT
      pm.project_id,
      pm.user_id,
      pm.role,
      pm.joined_at,
      u.name,
      u.email,
      u.avatar_url
    FROM project_members pm
    JOIN users u ON u.id = pm.user_id
    WHERE pm.project_id = $1
    ORDER BY
      CASE WHEN pm.role = 'admin' THEN 0 ELSE 1 END,
      pm.joined_at ASC
    `,
    [projectId]
  );

  return result.rows;
};

/**
 * Get all projects for current user.
 */
export const getProjects = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const page = parsePage(req.query.page, 1);
    const limit = Math.min(parsePage(req.query.limit, 10), 50);
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `
      SELECT
        p.id,
        p.title,
        p.description,
        p.owner_id,
        p.created_at,
        u.name AS owner_name,
        u.email AS owner_email,
        COALESCE(mc.member_count, 0) AS member_count,
        CASE
          WHEN p.owner_id = $1 THEN 'owner'
          ELSE pm.role
        END AS role
      FROM projects p
      JOIN users u ON u.id = p.owner_id
      LEFT JOIN project_members pm
        ON pm.project_id = p.id AND pm.user_id = $1
      LEFT JOIN (
        SELECT project_id, COUNT(*)::INT AS member_count
        FROM project_members
        GROUP BY project_id
      ) mc ON mc.project_id = p.id
      WHERE p.owner_id = $1 OR pm.user_id = $1
      ORDER BY p.created_at DESC
      LIMIT $2 OFFSET $3
      `,
      [userId, limit, offset]
    );

    const countResult = await pool.query(
      `
      SELECT COUNT(*)::INT AS total
      FROM projects p
      LEFT JOIN project_members pm
        ON pm.project_id = p.id AND pm.user_id = $1
      WHERE p.owner_id = $1 OR pm.user_id = $1
      `,
      [userId]
    );

    const total = countResult.rows[0].total;

    return res.status(200).json({
      success: true,
      data: {
        projects: result.rows,
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
 * Create a new project.
 */
export const createProject = async (req, res, next) => {
  const client = await pool.connect();
  let transactionStarted = false;

  try {
    const userId = req.user.userId;
    const title = req.body.title?.trim();
    const description = req.body.description?.trim() || null;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Project title is required',
      });
    }

    await client.query('BEGIN');
    transactionStarted = true;

    const projectResult = await client.query(
      `
      INSERT INTO projects (title, description, owner_id)
      VALUES ($1, $2, $3)
      RETURNING *
      `,
      [title, description, userId]
    );

    const project = projectResult.rows[0];

    await client.query(
      `
      INSERT INTO project_members (project_id, user_id, role)
      VALUES ($1, $2, 'admin')
      `,
      [project.id, userId]
    );

    await client.query('COMMIT');
    transactionStarted = false;

    await logActivity(project.id, userId, 'created', 'project', project.id, {
      title: project.title,
    });

    return res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: {
        project,
      },
    });
  } catch (error) {
    if (transactionStarted) {
      await client.query('ROLLBACK');
    }
    next(error);
  } finally {
    client.release();
  }
};

/**
 * Get single project details.
 */
export const getProjectById = async (req, res, next) => {
  try {
    const access = await getProjectAccess(req.params.id, req.user.userId);

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

    const members = await getProjectMembers(req.params.id);

    return res.status(200).json({
      success: true,
      data: {
        project: {
          ...access.project,
          members,
          userRole: access.userRole,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update project.
 */
export const updateProject = async (req, res, next) => {
  try {
    const access = await getProjectAccess(req.params.id, req.user.userId);

    if (!access) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    if (!access.isOwner) {
      return res.status(403).json({
        success: false,
        message: 'Only the project owner can update this project',
      });
    }

    const title = req.body.title === undefined ? undefined : req.body.title.trim();
    const description =
      req.body.description === undefined ? undefined : req.body.description?.trim() || null;

    if (title !== undefined && !title) {
      return res.status(400).json({
        success: false,
        message: 'Project title cannot be empty',
      });
    }

    const updates = [];
    const values = [req.params.id];

    if (title !== undefined) {
      values.push(title);
      updates.push(`title = $${values.length}`);
    }

    if (description !== undefined) {
      values.push(description);
      updates.push(`description = $${values.length}`);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update',
      });
    }

    const result = await pool.query(
      `UPDATE projects SET ${updates.join(', ')} WHERE id = $1 RETURNING *`,
      values
    );

    await logActivity(req.params.id, req.user.userId, 'updated', 'project', req.params.id, {
      title: result.rows[0].title,
    });

    return res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: {
        project: result.rows[0],
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete project.
 */
export const deleteProject = async (req, res, next) => {
  try {
    const access = await getProjectAccess(req.params.id, req.user.userId);

    if (!access) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    if (!access.isOwner) {
      return res.status(403).json({
        success: false,
        message: 'Only the project owner can delete this project',
      });
    }

    await pool.query('DELETE FROM projects WHERE id = $1', [req.params.id]);

    return res.status(200).json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add member to project by email.
 */
export const addProjectMember = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const projectId = req.params.id;
    const email = req.body.email?.trim().toLowerCase();
    const role = req.body.role || 'developer';

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Must be one of: ${validRoles.join(', ')}`,
      });
    }

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

    if (!access.isOwner && !['admin', 'manager'].includes(access.userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Only project owners, admins, or managers can add members',
      });
    }

    const userResult = await pool.query(
      'SELECT id, name, email, avatar_url FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const memberUser = userResult.rows[0];

    const existingResult = await pool.query(
      'SELECT 1 FROM project_members WHERE project_id = $1 AND user_id = $2',
      [projectId, memberUser.id]
    );

    if (existingResult.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'User is already a member of this project',
      });
    }

    const memberResult = await pool.query(
      `
      INSERT INTO project_members (project_id, user_id, role)
      VALUES ($1, $2, $3)
      RETURNING project_id, user_id, role, joined_at
      `,
      [projectId, memberUser.id, role]
    );

    const member = {
      ...memberResult.rows[0],
      name: memberUser.name,
      email: memberUser.email,
      avatar_url: memberUser.avatar_url,
    };

    await logActivity(projectId, userId, 'created', 'member', memberUser.id, {
      email: memberUser.email,
      role,
    });

    return res.status(201).json({
      success: true,
      message: 'Member added successfully',
      data: {
        member,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove member from project.
 */
export const removeProjectMember = async (req, res, next) => {
  const client = await pool.connect();
  let transactionStarted = false;

  try {
    const userId = req.user.userId;
    const projectId = req.params.id;
    const memberId = req.params.memberId;
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

    if (!access.isOwner && !['admin', 'manager'].includes(access.userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Only project owners, admins, or managers can remove members',
      });
    }

    if (memberId === access.project.owner_id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove the project owner',
      });
    }

    const memberResult = await client.query(
      `
      SELECT pm.user_id, pm.role, u.email
      FROM project_members pm
      JOIN users u ON u.id = pm.user_id
      WHERE pm.project_id = $1 AND pm.user_id = $2
      `,
      [projectId, memberId]
    );

    if (memberResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project member not found',
      });
    }

    await client.query('BEGIN');
    transactionStarted = true;

    await client.query(
      `
      UPDATE tickets
      SET assignee_id = NULL, updated_at = NOW()
      WHERE project_id = $1 AND assignee_id = $2
      `,
      [projectId, memberId]
    );

    await client.query(
      'DELETE FROM project_members WHERE project_id = $1 AND user_id = $2',
      [projectId, memberId]
    );

    await client.query('COMMIT');
    transactionStarted = false;

    const member = memberResult.rows[0];

    await logActivity(projectId, userId, 'deleted', 'member', memberId, {
      email: member.email,
      role: member.role,
    });

    return res.status(200).json({
      success: true,
      message: 'Member removed successfully',
    });
  } catch (error) {
    if (transactionStarted) {
      await client.query('ROLLBACK');
    }
    next(error);
  } finally {
    client.release();
  }
};
