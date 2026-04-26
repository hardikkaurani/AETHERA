import { createApiInstance } from './axios.config';

/**
 * Get all comments for a ticket.
 */
export const getTicketComments = async (token, ticketId) => {
  const api = createApiInstance(token);
  const response = await api.get(`/tickets/${ticketId}/comments`);
  return response.data.data;
};

/**
 * Create a comment on a ticket.
 */
export const createComment = async (token, ticketId, { body }) => {
  const api = createApiInstance(token);
  const response = await api.post(`/tickets/${ticketId}/comments`, { body });
  return response.data.data;
};

/**
 * Delete a comment.
 */
export const deleteComment = async (token, commentId) => {
  const api = createApiInstance(token);
  const response = await api.delete(`/comments/${commentId}`);
  return response.data;
};
