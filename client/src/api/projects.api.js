import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Create axios instance with token injection
 */
const createAxiosInstance = (token) => {
  return axios.create({
    baseURL: `${API_BASE_URL}/projects`,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
};

/**
 * Get all projects for current user
 */
export const getProjects = async (token, page = 1, limit = 10) => {
  try {
    const api = createAxiosInstance(token);
    const response = await api.get('/', {
      params: { page, limit },
    });
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch projects');
  }
};

/**
 * Create a new project
 */
export const createProject = async (token, { title, description }) => {
  try {
    const api = createAxiosInstance(token);
    const response = await api.post('/', {
      title,
      description,
    });
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create project');
  }
};

/**
 * Get single project details with members
 */
export const getProjectById = async (token, projectId) => {
  try {
    const api = createAxiosInstance(token);
    const response = await api.get(`/${projectId}`);
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch project');
  }
};

/**
 * Update project details (title, description)
 */
export const updateProject = async (token, projectId, { title, description }) => {
  try {
    const api = createAxiosInstance(token);
    const response = await api.put(`/${projectId}`, {
      title,
      description,
    });
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update project');
  }
};

/**
 * Delete a project
 */
export const deleteProject = async (token, projectId) => {
  try {
    const api = createAxiosInstance(token);
    const response = await api.delete(`/${projectId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete project');
  }
};

/**
 * Add a member to project by email
 */
export const addProjectMember = async (token, projectId, { email, role = 'developer' }) => {
  try {
    const api = createAxiosInstance(token);
    const response = await api.post(`/${projectId}/members`, {
      email,
      role,
    });
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to add member');
  }
};

/**
 * Remove a member from project
 */
export const removeProjectMember = async (token, projectId, memberId) => {
  try {
    const api = createAxiosInstance(token);
    const response = await api.delete(`/${projectId}/members/${memberId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to remove member');
  }
};
