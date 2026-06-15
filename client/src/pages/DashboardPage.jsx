import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuth from '../hooks/useAuth';
import useProjects from '../hooks/useProjects';
import CreateProjectModal from '../components/layout/CreateProjectModal';

/**
 * Dashboard Page
 * Shows all projects for current user with statistics and modern dark layout
 */

// JSDoc: DashboardPage queries user workspaces and displays workspace metadata
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
  
// Refetches all workspaces to reflect newly created project entries
const handleProjectCreated = () => {
    setShowCreateModal(false);
    getAllProjects();
  };

  // Compute Stats
  const totalProjects = projects.length;
  const totalMembersCount = projects.reduce((acc, p) => acc + (p.member_count || 0), 0);
  const adminProjects = projects.filter(p => p.role === 'admin' || p.role === 'owner').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      {/* Navigation / Header */}
      <header className="border-b border-slate-900 bg-slate-900/40 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
              Ã°Å¸Å¡â‚¬ Aethera
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">Welcome back, {user?.name}</p>
          </div>
          <div className="flex gap-3 items-center">
            <Link
              to="/profile"
              className="text-slate-300 hover:text-white text-sm font-medium bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl transition"
            >
              My Profile
            </Link>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-cyan-600 to-teal-650 hover:from-cyan-500 hover:to-teal-550 text-white text-sm font-bold px-4 py-2 rounded-xl transition shadow-lg shadow-cyan-950/20"
            >
              + New Project
            </button>
            <button
              onClick={logout}
              className="text-slate-400 hover:text-red-400 text-sm font-medium transition ml-2"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        
        {/* Statistics Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-900/80 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-slate-800 transition">
            <div className="absolute right-4 top-4 text-3xl opacity-20">Ã°Å¸â€œÂ</div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Projects</p>
            <h3 className="text-3xl font-extrabold text-white mt-2">{totalProjects}</h3>
            <p className="text-xs text-slate-500 mt-1">Assigned workspace instances</p>
          </div>

          <div className="bg-slate-900 border border-slate-900/80 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-slate-800 transition">
            <div className="absolute right-4 top-4 text-3xl opacity-20">Ã°Å¸â€˜Â¥</div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Collaborators</p>
            <h3 className="text-3xl font-extrabold text-white mt-2">{totalMembersCount}</h3>
            <p className="text-xs text-slate-500 mt-1">Team members across boards</p>
          </div>

          <div className="bg-slate-900 border border-slate-900/80 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-slate-800 transition">
            <div className="absolute right-4 top-4 text-3xl opacity-20">Ã°Å¸â€â€˜</div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Owner / Admin roles</p>
            <h3 className="text-3xl font-extrabold text-white mt-2">{adminProjects}</h3>
            <p className="text-xs text-slate-500 mt-1">Projects under your control</p>
          </div>
        </section>

        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-red-950/40 border border-red-900/50 rounded-2xl">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Projects Section */}
        <section className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-200">All Workspaces</h2>
          </div>

          {loading && projects.length === 0 ? (
            <div className="flex items-center justify-center min-h-64">
              <div className="space-y-4 text-center">
                <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mx-auto"></div>
                <p className="text-slate-400 text-sm">Querying active projects...</p>
              </div>
            </div>
          ) : projects.length === 0 ? (
            // Empty State
            <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-dashed border-slate-800">
              <div className="text-5xl mb-4">Ã°Å¸â€œÂ</div>
              <h2 className="text-xl font-bold text-white mb-2">No projects found</h2>
              <p className="text-slate-400 text-sm mb-6">Create your first collaborative board to get started</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold px-6 py-2.5 rounded-xl transition"
              >
                Create Workspace
              </button>
            </div>
          ) : (
            // Projects Grid
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="bg-slate-900 border border-slate-900/80 rounded-2xl hover:border-slate-800 transition shadow-lg flex flex-col justify-between"
                >
                  <div className="p-6 space-y-4">
                    {/* Project Title */}
                    <div>
                      <h3 className="text-lg font-bold text-white truncate hover:text-cyan-400 transition">
                        <Link to={`/projects/${project.id}`}>{project.title}</Link>
                      </h3>
                      {project.description && (
                        <p className="text-slate-400 text-xs mt-1.5 line-clamp-2 leading-relaxed">
                          {project.description}
                        </p>
                      )}
                    </div>

                    {/* Role Badge */}
                    <div>
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          project.role === 'admin' || project.role === 'owner'
                            ? 'bg-purple-950 text-purple-400 border border-purple-900/50'
                            : project.role === 'manager'
                            ? 'bg-blue-950 text-blue-400 border border-blue-900/50'
                            : project.role === 'developer'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/50'
                            : 'bg-slate-900 text-slate-400 border border-slate-800'
                        }`}
                      >
                        {project.role}
                      </span>
                    </div>
                  </div>

                  {/* Project Footer Meta */}
                  <div className="px-6 py-4 bg-slate-950/40 rounded-b-2xl border-t border-slate-950 flex items-center justify-between">
                    <div className="flex gap-3 text-xs text-slate-400">
                      <span>Ã°Å¸â€˜Â¥ {project.member_count}</span>
                      <span>Ã°Å¸â€œâ€¦ {new Date(project.created_at).toLocaleDateString()}</span>
                    </div>

                    <div className="flex gap-2">
                      <Link
                        to={`/projects/${project.id}`}
                        className="bg-cyan-600/20 text-cyan-400 hover:bg-cyan-500 hover:text-white border border-cyan-500/20 font-semibold px-3 py-1 rounded-xl text-xs transition"
                      >
                        Open
                      </Link>
                      {project.role === 'owner' && (
                        <button
                          onClick={() => handleDeleteProject(project.id)}
                          disabled={deletingId === project.id}
                          className="bg-red-950/40 text-red-400 hover:bg-red-900 hover:text-white border border-red-900/30 px-3 py-1 rounded-xl text-xs transition"
                        >
                          {deletingId === project.id ? 'Deleting...' : 'Delete'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
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
