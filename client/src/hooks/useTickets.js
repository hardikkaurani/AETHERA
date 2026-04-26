import { useState, useCallback } from 'react';
import * as ticketsApi from '../api/tickets.api';
import * as commentsApi from '../api/comments.api';
import useAuth from './useAuth';

/**
 * useTickets Hook
 * Custom hook for managing tickets and comments
 * Encapsulates all ticket API logic in one place
 */
export const useTickets = () => {
  const { token } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [currentTicket, setCurrentTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);

  /**
   * Fetch all tickets for a project
   */
  const getAllTickets = useCallback(
    async (projectId, filters = {}) => {
      try {
        setLoading(true);
        setError(null);
        const data = await ticketsApi.getProjectTickets(token, projectId, {
          page: filters.page || 1,
          limit: filters.limit || 20,
          status: filters.status,
          priority: filters.priority,
          assignee: filters.assignee,
          search: filters.search,
          sortBy: filters.sortBy || 'created_at',
          sortOrder: filters.sortOrder || 'DESC',
        });
        setTickets(data.tickets);
        setPagination(data.pagination);
        return data;
      } catch (err) {
        const message = err.message || 'Failed to fetch tickets';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  /**
   * Create new ticket
   */
  const createNewTicket = useCallback(
    async (projectId, ticketData) => {
      try {
        setLoading(true);
        setError(null);
        const data = await ticketsApi.createTicket(token, projectId, ticketData);
        setTickets((prev) => [data.ticket, ...prev]);
        return data;
      } catch (err) {
        const message = err.message || 'Failed to create ticket';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  /**
   * Get single ticket with comments
   */
  const getTicket = useCallback(
    async (ticketId) => {
      try {
        setLoading(true);
        setError(null);
        const data = await ticketsApi.getTicketById(token, ticketId);
        setCurrentTicket(data.ticket);
        setComments(data.ticket.comments || []);
        return data;
      } catch (err) {
        const message = err.message || 'Failed to fetch ticket';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  /**
   * Update ticket
   */
  const updateTicket = useCallback(
    async (ticketId, updates) => {
      try {
        setLoading(true);
        setError(null);
        const data = await ticketsApi.updateTicket(token, ticketId, updates);
        setCurrentTicket(data.ticket);
        // Update in list
        setTickets((prev) => prev.map((t) => (t.id === ticketId ? data.ticket : t)));
        return data;
      } catch (err) {
        const message = err.message || 'Failed to update ticket';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  /**
   * Update ticket status (for Kanban)
   */
  const changeTicketStatus = useCallback(
    async (ticketId, status) => {
      try {
        const data = await ticketsApi.updateTicketStatus(token, ticketId, status);
        // Update in list
        setTickets((prev) => prev.map((t) => (t.id === ticketId ? data.ticket : t)));
        if (currentTicket?.id === ticketId) {
          setCurrentTicket(data.ticket);
        }
        return data;
      } catch (err) {
        const message = err.message || 'Failed to update status';
        setError(message);
        throw err;
      }
    },
    [token, currentTicket]
  );

  /**
   * Delete ticket
   */
  const removeTicket = useCallback(
    async (ticketId) => {
      try {
        setLoading(true);
        setError(null);
        await ticketsApi.deleteTicket(token, ticketId);
        setTickets((prev) => prev.filter((t) => t.id !== ticketId));
        return { success: true };
      } catch (err) {
        const message = err.message || 'Failed to delete ticket';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  /**
   * Add comment to ticket
   */
  const addComment = useCallback(
    async (ticketId, { body }) => {
      try {
        setLoading(true);
        setError(null);
        const data = await commentsApi.createComment(token, ticketId, { body });
        setComments((prev) => [data.comment, ...prev]);
        setCurrentTicket((prev) =>
          prev && prev.id === ticketId
            ? {
                ...prev,
                comments: [data.comment, ...(prev.comments || [])],
                comment_count: (prev.comment_count || 0) + 1,
              }
            : prev
        );
        setTickets((prev) =>
          prev.map((ticket) =>
            ticket.id === ticketId
              ? { ...ticket, comment_count: (ticket.comment_count || 0) + 1 }
              : ticket
          )
        );
        return data;
      } catch (err) {
        const message = err.message || 'Failed to add comment';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  /**
   * Remove comment
   */
  const removeComment = useCallback(
    async (commentId) => {
      try {
        setLoading(true);
        setError(null);
        await commentsApi.deleteComment(token, commentId);
        setComments((prev) => prev.filter((c) => c.id !== commentId));
        setCurrentTicket((prev) =>
          prev
            ? {
                ...prev,
                comments: (prev.comments || []).filter((comment) => comment.id !== commentId),
                comment_count: Math.max((prev.comment_count || 1) - 1, 0),
              }
            : prev
        );
        setTickets((prev) =>
          prev.map((ticket) =>
            currentTicket && ticket.id === currentTicket.id
              ? { ...ticket, comment_count: Math.max((ticket.comment_count || 1) - 1, 0) }
              : ticket
          )
        );
        return { success: true };
      } catch (err) {
        const message = err.message || 'Failed to delete comment';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [token, currentTicket]
  );

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    tickets,
    currentTicket,
    comments,
    loading,
    error,
    pagination,
    getAllTickets,
    createNewTicket,
    getTicket,
    updateTicket,
    changeTicketStatus,
    removeTicket,
    addComment,
    removeComment,
    clearError,
  };
};

export default useTickets;
