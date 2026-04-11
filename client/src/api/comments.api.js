import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Create axios instance with token injection
 */
const createAxiosInstance = (token) => {
  return axios.create({
    baseURL: API_BASE_URL,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
};

/**
 * Get all comments for a ticket
 */
export const getTicketComments = async (token, ticketId) => {
  try {
    const api = createAxiosInstance(token);
    const response = await api.get(`/tickets/${ticketId}/comments`);
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch comments');
  }
};

/**
 * Create a comment on a ticket
 */
export const createComment = async (token, ticketId, { body }) => {
  try {
    const api = createAxiosInstance(token);
    const response = await api.post(`/tickets/${ticketId}/comments`, { body });
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create comment');
  }
};

/**
 * Delete a comment
 */
export const deleteComment = async (token, commentId) => {
  try {
    const api = createAxiosInstance(token);
    const response = await api.delete(`/comments/${commentId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete comment');
  }
};
