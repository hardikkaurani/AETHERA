import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuth from '../hooks/useAuth';
import useProjects from '../hooks/useProjects';
import CreateProjectModal from '../components/layout/CreateProjectModal';

/**
 * Dashboard Page
 * Shows all projects for current user
 * Allows creating new projects
 * Navigation to individual project pages
 */
export default function DashboardPage() {
  const { user, logout } = useAuth();
  const { projects, loading, error, getAllProjects, removeProject } = useProjects();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  /**
   * Load projects on mount
   */
  useEffect(() => {
    getAllProjects();
  }, [getAllProjects]);

  /**
   * Handle project deletion
   */
  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingId(projectId);
      await removeProject(projectId);
      toast.success('Project deleted successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to delete project');
    } finally {
      setDeletingId(null);
    }
  };

  /**
   * Handle successful project creation
   */
  const handleProjectCreated = () => {
    setShowCreateModal(false);
    getAllProjects();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">🐛 Bug Tracker</h1>
            <p className="text-sm text-slate-600 mt-1">Welcome, {user?.name}!</p>
          </div>
          <div className="flex gap-4 items-center">
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
            >
              + New Project
            </button>
            <button
              onClick={logout}
              className="text-slate-600 hover:text-slate-900 font-medium transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && projects.length === 0 ? (
          <div className="flex items-center justify-center min-h-96">
            <div className="space-y-4">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
              <p className="text-slate-600 text-center">Loading projects...</p>
            </div>
          </div>
        ) : projects.length === 0 ? (
          // Empty State
          <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-slate-300">
            <div className="text-5xl mb-4">📁</div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">No projects yet</h2>
            <p className="text-slate-600 mb-6">Create your first project to get started</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition"
            >
              Create First Project
            </button>
          </div>
        ) : (
          // Projects Grid
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition border border-slate-200"
              >
                <div className="p-6">
                  {/* Project Title */}
                  <h3 className="text-xl font-bold text-slate-900 mb-2 truncate">
                    {project.title}
                  </h3>

                  {/* Project Description */}
                  {project.description && (
                    <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                      {project.description}
                    </p>
                  )}

                  {/* Project Meta */}
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                    <span>👥 {project.member_count} members</span>
                    <span>{new Date(project.created_at).toLocaleDateString()}</span>
                  </div>

                  {/* User Role Badge */}
                  <div className="mb-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        project.role === 'admin'
                          ? 'bg-purple-100 text-purple-800'
                          : project.role === 'manager'
                          ? 'bg-blue-100 text-blue-800'
                          : project.role === 'developer'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      {project.role}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      to={`/projects/${project.id}`}
                      className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium py-2 px-3 rounded text-center transition"
                    >
                      Open
                    </Link>
                    {project.role === 'owner' && (
                      <button
                        onClick={() => handleDeleteProject(project.id)}
                        disabled={deletingId === project.id}
                        className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-medium py-2 px-3 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deletingId === project.id ? '...' : 'Delete'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Project Modal */}
      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleProjectCreated}
        />
      )}
    </div>
  );
}
