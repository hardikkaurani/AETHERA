import { useState, useCallback } from 'react';
import * as projectsApi from '../api/projects.api';
import useAuth from './useAuth';

/**
 * useProjects Hook
 * Custom hook for managing projects data and loading states
 * Encapsulates all project API logic in one place
 *
 * Usage:
 * const { projects, loading, error, getProjects, createProject } = useProjects();
 */
export const useProjects = () => {
  const { token } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);

  /**
   * Fetch all projects with pagination
   */
  const getAllProjects = useCallback(
    async (page = 1, limit = 10) => {
      try {
        setLoading(true);
        setError(null);
        const data = await projectsApi.getProjects(token, page, limit);
        setProjects(data.projects);
        setPagination(data.pagination);
        return data;
      } catch (err) {
        const message = err.message || 'Failed to fetch projects';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  /**
   * Create new project
   */
  const createNewProject = useCallback(
    async (projectData) => {
      try {
        setLoading(true);
        setError(null);
        const newProject = await projectsApi.createProject(token, projectData);
        // Add to projects list
        setProjects((prev) => [newProject.project, ...prev]);
        return newProject;
      } catch (err) {
        const message = err.message || 'Failed to create project';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  /**
   * Get single project details
   */
  const getProject = useCallback(
    async (projectId) => {
      try {
        setLoading(true);
        setError(null);
        const data = await projectsApi.getProjectById(token, projectId);
        return data;
      } catch (err) {
        const message = err.message || 'Failed to fetch project';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  /**
   * Update project
   */
  const editProject = useCallback(
    async (projectId, projectData) => {
      try {
        setLoading(true);
        setError(null);
        const updated = await projectsApi.updateProject(token, projectId, projectData);
        // Update in list
        setProjects((prev) =>
          prev.map((p) => (p.id === projectId ? updated.project : p))
        );
        return updated;
      } catch (err) {
        const message = err.message || 'Failed to update project';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  /**
   * Delete project
   */
  const removeProject = useCallback(
    async (projectId) => {
      try {
        setLoading(true);
        setError(null);
        await projectsApi.deleteProject(token, projectId);
        // Remove from list
        setProjects((prev) => prev.filter((p) => p.id !== projectId));
        return { success: true };
      } catch (err) {
        const message = err.message || 'Failed to delete project';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  /**
   * Add member to project
   */
  const addMember = useCallback(
    async (projectId, memberData) => {
      try {
        setLoading(true);
        setError(null);
        const result = await projectsApi.addProjectMember(token, projectId, memberData);
        return result;
      } catch (err) {
        const message = err.message || 'Failed to add member';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  /**
   * Remove member from project
   */
  const removeMember = useCallback(
    async (projectId, memberId) => {
      try {
        setLoading(true);
        setError(null);
        await projectsApi.removeProjectMember(token, projectId, memberId);
        return { success: true };
      } catch (err) {
        const message = err.message || 'Failed to remove member';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    projects,
    loading,
    error,
    pagination,
    getAllProjects,
    createNewProject,
    getProject,
    editProject,
    removeProject,
    addMember,
    removeMember,
    clearError,
  };
};

export default useProjects;
