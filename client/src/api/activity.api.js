import { createApiInstance } from './axios.config';

/**
 * Get activity log for a project.
 */
export const getProjectActivity = async (token, projectId, { limit = 50, offset = 0 } = {}) => {
  const api = createApiInstance(token);
  const response = await api.get(`/projects/${projectId}/activity`, {
    params: { limit, offset },
  });
  return response.data.data;
};

/**
 * Get activity log for current user.
 */
export const getUserActivity = async (token, { limit = 50, offset = 0 } = {}) => {
  const api = createApiInstance(token);
  const response = await api.get('/activity', {
    params: { limit, offset },
  });
  return response.data.data;
};
