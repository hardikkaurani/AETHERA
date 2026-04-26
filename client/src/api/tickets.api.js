import { createApiInstance } from './axios.config';

/**
 * Get all tickets for a project with filters.
 */
export const getProjectTickets = async (
  token,
  projectId,
  {
    status,
    priority,
    assignee,
    search,
    page = 1,
    limit = 20,
    sortBy = 'created_at',
    sortOrder = 'DESC',
  } = {}
) => {
  const api = createApiInstance(token);
  const response = await api.get(`/projects/${projectId}/tickets`, {
    params: { status, priority, assignee, search, page, limit, sortBy, sortOrder },
  });

  return response.data.data;
};

/**
 * Create a new ticket.
 */
export const createTicket = async (token, projectId, payload) => {
  const api = createApiInstance(token);
  const response = await api.post(`/projects/${projectId}/tickets`, payload);
  return response.data.data;
};

/**
 * Get a single ticket with comments.
 */
export const getTicketById = async (token, ticketId) => {
  const api = createApiInstance(token);
  const response = await api.get(`/tickets/${ticketId}`);
  return response.data.data;
};

/**
 * Update ticket details.
 */
export const updateTicket = async (token, ticketId, updates) => {
  const api = createApiInstance(token);
  const response = await api.put(`/tickets/${ticketId}`, updates);
  return response.data.data;
};

/**
 * Update ticket status.
 */
export const updateTicketStatus = async (token, ticketId, status) => {
  const api = createApiInstance(token);
  const response = await api.patch(`/tickets/${ticketId}/status`, { status });
  return response.data.data;
};

/**
 * Delete a ticket.
 */
export const deleteTicket = async (token, ticketId) => {
  const api = createApiInstance(token);
  const response = await api.delete(`/tickets/${ticketId}`);
  return response.data;
};
