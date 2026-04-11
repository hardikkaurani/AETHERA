import pool from '../config/db.js';

/**
 * Get all projects for current user
 * Includes projects owned by user AND projects user is a member of
 * Returns paginated results with owner info
 */
export const getProjects = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // Get projects where user is owner OR is a member
    const result = await pool.query(
      `
      SELECT DISTINCT p.id, p.title, p.description, p.owner_id, p.created_at,
             u.name as owner_name, u.email as owner_email,
             COUNT(pm.user_id) as member_count,
             MAX(CASE WHEN pm.user_id = $1 THEN pm.role ELSE 'owner' END) as role
      FROM projects p
      LEFT JOIN users u ON p.owner_id = u.id
      LEFT JOIN project_members pm ON p.id = pm.project_id AND pm.user_id != p.owner_id
      WHERE p.owner_id = $1 OR (pm.user_id = $1)
      GROUP BY p.id, u.name, u.email
      ORDER BY p.created_at DESC
      LIMIT $2 OFFSET $3
      `,
      [userId, limit, offset]
    );

    const countResult = await pool.query(
      `
      SELECT COUNT(DISTINCT p.id) as total
      FROM projects p
      LEFT JOIN project_members pm ON p.id = pm.project_id
      WHERE p.owner_id = $1 OR (pm.user_id = $1)
      `,
      [userId]
    );

    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      success: true,
      data: {
        projects: result.rows,
        pagination: {
          currentPage: page,
          totalPages,
          total,
          limit,
        },
      },
    });
  } catch (error) {
    console.error('Get projects error:', error);
    next(error);
  }
};

/**
 * Create a new project
 * Current user becomes the owner
 */
export const createProject = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { title, description } = req.body;

    // Validate input
    if (!title || title.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Project title is required',
      });
    }

    // Insert project
    const result = await pool.query(
      'INSERT INTO projects (title, description, owner_id) VALUES ($1, $2, $3) RETURNING *',
      [title, description || null, userId]
    );

    const project = result.rows[0];

    // Add owner as admin member
    await pool.query(
      'INSERT INTO project_members (project_id, user_id, role) VALUES ($1, $2, $3)',
      [project.id, userId, 'admin']
    );

    return res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: {
        project,
      },
    });
  } catch (error) {
    console.error('Create project error:', error);
    next(error);
  }
};

/**
 * Get single project details
 * Verify user has access (owner or member)
 */
export const getProjectById = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    // Get project with owner and members
    const projectResult = await pool.query(
      `
      SELECT p.*, u.name as owner_name, u.email as owner_email
      FROM projects p
      LEFT JOIN users u ON p.owner_id = u.id
      WHERE p.id = $1
      `,
      [id]
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Check if user has access
    const accessResult = await pool.query(
      `
      SELECT role FROM project_members
      WHERE project_id = $1 AND user_id = $2
      `,
      [id, userId]
    );

    const project = projectResult.rows[0];
    const isOwner = project.owner_id === userId;
    const isMember = accessResult.rows.length > 0;

    if (!isOwner && !isMember) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    // Get all members
    const membersResult = await pool.query(
      `
      SELECT pm.*, u.name, u.email, u.avatar_url
      FROM project_members pm
      JOIN users u ON pm.user_id = u.id
      WHERE pm.project_id = $1
      ORDER BY pm.joined_at DESC
      `,
      [id]
    );

    return res.status(200).json({
      success: true,
      data: {
        project: {
          ...project,
          members: membersResult.rows,
          userRole: isOwner ? 'owner' : accessResult.rows[0].role,
        },
      },
    });
  } catch (error) {
    console.error('Get project error:', error);
    next(error);
  }
};

/**
 * Update project (only owner can update)
 */
export const updateProject = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { title, description } = req.body;

    // Verify ownership
    const ownerResult = await pool.query('SELECT owner_id FROM projects WHERE id = $1', [id]);

    if (ownerResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    if (ownerResult.rows[0].owner_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only project owner can update',
      });
    }

    // Update project
    const result = await pool.query(
      'UPDATE projects SET title = COALESCE($1, title), description = COALESCE($2, description) WHERE id = $3 RETURNING *',
      [title || null, description || null, id]
    );

    return res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: {
        project: result.rows[0],
      },
    });
  } catch (error) {
    console.error('Update project error:', error);
    next(error);
  }
};

/**
 * Delete project (only owner can delete)
 */
export const deleteProject = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    // Verify ownership
    const ownerResult = await pool.query('SELECT owner_id FROM projects WHERE id = $1', [id]);

    if (ownerResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    if (ownerResult.rows[0].owner_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only project owner can delete',
      });
    }

    // Delete project (cascades to members, tickets, comments)
    await pool.query('DELETE FROM projects WHERE id = $1', [id]);

    return res.status(200).json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (error) {
    console.error('Delete project error:', error);
    next(error);
  }
};

/**
 * Add member to project (owner/admin only)
 * Add by email address
 */
export const addProjectMember = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { email, role = 'developer' } = req.body;

    // Validate role
    const validRoles = ['admin', 'manager', 'developer', 'viewer'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Must be one of: ${validRoles.join(', ')}`,
      });
    }

    // Verify current user is owner/admin
    const roleResult = await pool.query(
      `
      SELECT pm.role FROM project_members pm
      WHERE pm.project_id = $1 AND pm.user_id = $2
      `,
      [id, userId]
    );

    const userRole = roleResult.rows[0]?.role;
    const isOwner = await pool.query('SELECT owner_id FROM projects WHERE id = $1 AND owner_id = $2', [
      id,
      userId,
    ]);

    if (!isOwner.rows.length && !['admin', 'manager'].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Only owner or admin can add members',
      });
    }

    // Find user by email
    const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [email]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const newMemberId = userResult.rows[0].id;

    // Check if already member
    const existingResult = await pool.query(
      'SELECT id FROM project_members WHERE project_id = $1 AND user_id = $2',
      [id, newMemberId]
    );

    if (existingResult.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'User is already a member',
      });
    }

    // Add member
    const result = await pool.query(
      'INSERT INTO project_members (project_id, user_id, role) VALUES ($1, $2, $3) RETURNING *',
      [id, newMemberId, role]
    );

    return res.status(201).json({
      success: true,
      message: 'Member added successfully',
      data: {
        member: result.rows[0],
      },
    });
  } catch (error) {
    console.error('Add member error:', error);
    next(error);
  }
};

/**
 * Remove member from project (owner/admin only)
 */
export const removeProjectMember = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { id, memberId } = req.params;

    // Verify current user is owner/admin
    const roleResult = await pool.query(
      `
      SELECT pm.role FROM project_members pm
      WHERE pm.project_id = $1 AND pm.user_id = $2
      `,
      [id, userId]
    );

    const userRole = roleResult.rows[0]?.role;
    const isOwner = await pool.query('SELECT owner_id FROM projects WHERE id = $1 AND owner_id = $2', [
      id,
      userId,
    ]);

    if (!isOwner.rows.length && !['admin', 'manager'].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Only owner or admin can remove members',
      });
    }

    // Cannot remove owner
    const ownerCheck = await pool.query('SELECT owner_id FROM projects WHERE id = $1', [id]);
    if (ownerCheck.rows[0].owner_id === memberId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove project owner',
      });
    }

    // Remove member
    await pool.query('DELETE FROM project_members WHERE project_id = $1 AND user_id = $2', [
      id,
      memberId,
    ]);

    return res.status(200).json({
      success: true,
      message: 'Member removed successfully',
    });
  } catch (error) {
    console.error('Remove member error:', error);
    next(error);
  }
};
