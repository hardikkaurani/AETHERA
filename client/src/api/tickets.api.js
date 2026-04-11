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
 * Get all tickets for a project with filters
 */
export const getProjectTickets = async (
  token,
  projectId,
  { status, priority, assignee, search, page = 1, limit = 20, sortBy = 'created_at', sortOrder = 'DESC' } = {}
) => {
  try {
    const api = createAxiosInstance(token);
    const response = await api.get(`/projects/${projectId}/tickets`, {
      params: { status, priority, assignee, search, page, limit, sortBy, sortOrder },
    });
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch tickets');
  }
};

/**
 * Create a new ticket
 */
export const createTicket = async (token, projectId, { title, description, priority, type, assignee_id, due_date }) => {
  try {
    const api = createAxiosInstance(token);
    const response = await api.post(`/projects/${projectId}/tickets`, {
      title,
      description,
      priority,
      type,
      assignee_id,
      due_date,
    });
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create ticket');
  }
};

/**
 * Get single ticket with comments
 */
export const getTicketById = async (token, ticketId) => {
  try {
    const api = createAxiosInstance(token);
    const response = await api.get(`/tickets/${ticketId}`);
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch ticket');
  }
};

/**
 * Update ticket details
 */
export const updateTicket = async (token, ticketId, updates) => {
  try {
    const api = createAxiosInstance(token);
    const response = await api.put(`/tickets/${ticketId}`, updates);
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update ticket');
  }
};

/**
 * Update ticket status (for Kanban)
 */
export const updateTicketStatus = async (token, ticketId, status) => {
  try {
    const api = createAxiosInstance(token);
    const response = await api.patch(`/tickets/${ticketId}/status`, { status });
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update status');
  }
};

/**
 * Delete a ticket
 */
export const deleteTicket = async (token, ticketId) => {
  try {
    const api = createAxiosInstance(token);
    const response = await api.delete(`/tickets/${ticketId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete ticket');
  }
};
