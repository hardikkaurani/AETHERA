import { createApiInstance } from './axios.config';

/**
 * Get all projects for current user.
 */
export const getProjects = async (token, page = 1, limit = 10) => {
  const api = createApiInstance(token);
  const response = await api.get('/projects', {
    params: { page, limit },
  });

  return response.data.data;
};

/**
 * Create a new project.
 */
export const createProject = async (token, { title, description }) => {
  const api = createApiInstance(token);
  const response = await api.post('/projects', {
    title,
    description,
  });

  return response.data.data;
};

/**
 * Get single project details with members.
 */
export const getProjectById = async (token, projectId) => {
  const api = createApiInstance(token);
  const response = await api.get(`/projects/${projectId}`);
  return response.data.data;
};

/**
 * Update project details.
 */
export const updateProject = async (token, projectId, { title, description }) => {
  const api = createApiInstance(token);
  const response = await api.put(`/projects/${projectId}`, {
    title,
    description,
  });

  return response.data.data;
};

/**
 * Delete a project.
 */
export const deleteProject = async (token, projectId) => {
  const api = createApiInstance(token);
  const response = await api.delete(`/projects/${projectId}`);
  return response.data;
};

/**
 * Add a member to project by email.
 */
export const addProjectMember = async (token, projectId, { email, role = 'developer' }) => {
  const api = createApiInstance(token);
  const response = await api.post(`/projects/${projectId}/members`, {
    email,
    role,
  });

  return response.data.data;
};

/**
 * Remove a member from project.
 */
export const removeProjectMember = async (token, projectId, memberId) => {
  const api = createApiInstance(token);
  const response = await api.delete(`/projects/${projectId}/members/${memberId}`);
  return response.data;
};
