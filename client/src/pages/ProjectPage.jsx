import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuth from '../hooks/useAuth';
import useProjects from '../hooks/useProjects';
import useTickets from '../hooks/useTickets';
import ManageMembersModal from '../components/layout/ManageMembersModal';
import CreateTicketModal from '../components/tickets/CreateTicketModal';
import TicketCard from '../components/tickets/TicketCard';
import KanbanBoard from '../components/tickets/KanbanBoard';
import ActivityFeed from '../components/layout/ActivityFeed';

/**
 * Project Page
 * Shows single project details, members, activities, and tickets.
 */

// JSDoc: ProjectPage manages individual project workspace tabs and view selection
export default function ProjectPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getProject, editProject, removeProject, removeMember, loading: projectLoading } = useProjects();
  const { getAllTickets, removeTicket, changeTicketStatus, tickets, loading: ticketsLoading } = useTickets();

  const [project, setProject] = useState(null);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showCreateTicketModal, setShowCreateTicketModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ title: '', description: '' });
  const [viewMode, setViewMode] = useState('list');

  // Filters State
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
  });

  useEffect(() => {
    loadProject();
  }, [id]);

  useEffect(() => {
    loadTickets();
  }, [id, filters.status, filters.priority]);

  const loadProject = async () => {
    try {
      const data = await getProject(id);
      setProject(data.project);
      setEditData({
        title: data.project.title,
        description: data.project.description || '',
      });
    } catch (err) {
      toast.error('Failed to load project');
      navigate('/dashboard');
    }
  };

  const loadTickets = async () => {
    try {
      await getAllTickets(id, {
        status: filters.status || undefined,
        priority: filters.priority || undefined,
        search: filters.search || undefined,
      });
    } catch (err) {
      toast.error(err.message || 'Failed to load tickets');
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadTickets();
  };

  
// Handles kanban board status changes locally for instant visual response
const handleStatusChange = async (ticketId, newStatus) => {
    try {
      await changeTicketStatus(ticketId, newStatus);
      await loadTickets();
      toast.success('Ticket status updated');
    } catch (err) {
      toast.error(err.message);
      await loadTickets();
    }
  };

  const handleDeleteProject = async () => {
    if (!window.confirm('Are you sure you want to delete this project?')) {
      return;
    }

    try {
      await removeProject(id);
      toast.success('Project deleted');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleUpdateProject = async () => {
    try {
      await editProject(id, editData);
      toast.success('Project updated');
      setIsEditing(false);
      await loadProject();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleRemoveMember = async (member) => {
    if (!window.confirm(`Remove ${member.name} from this project?`)) {
      return;
    }

    try {
      await removeMember(id, member.user_id);
      toast.success('Member removed');
      await Promise.all([loadProject(), loadTickets()]);
    } catch (err) {
      toast.error(err.message || 'Failed to remove member');
    }
  };

  const handleDeleteTicket = async (ticketId) => {
    if (!window.confirm('Delete this ticket?')) {
      return;
    }

    try {
      await removeTicket(ticketId);
      await loadTickets();
      toast.success('Ticket deleted');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const isOwner = project?.owner_id === user?.id || project?.userRole === 'owner';
  const canManageMembers = isOwner || project?.userRole === 'admin' || project?.userRole === 'manager';
  
// Evaluates permissions: read-only for Viewer role
const canCreateTickets = project?.userRole !== 'viewer';

  if (projectLoading && !project) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-400">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="text-center p-8 bg-slate-900 border border-slate-800 rounded-2xl max-w-md">
          <p className="text-red-400 font-semibold mb-4 text-lg">Project not found or deleted</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-gradient-to-r from-cyan-600 to-teal-605 hover:from-cyan-500 hover:to-teal-555 text-white px-6 py-2.5 rounded-xl font-medium transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-12">
      {/* Upper Navigation Bar */}
      <nav className="border-b border-slate-900 bg-slate-900/40 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className="text-slate-400 hover:text-white transition flex items-center gap-1.5 text-sm font-medium"
            >
              ÃƒÂ¢Ã¢â‚¬Â Ã‚Â Back to Projects
            </Link>
            <span className="text-slate-800">/</span>
            <span className="text-slate-300 text-sm font-semibold truncate max-w-[200px]">
              {project.title}
            </span>
          </div>
          <Link
            to="/profile"
            className="text-slate-300 hover:text-white text-sm font-medium bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 px-3 py-1.5 rounded-xl transition"
          >
            My Profile
          </Link>
        </div>
      </nav>

      {/* Header Banner */}
      <header className="bg-slate-900/60 border-b border-slate-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-4 w-full max-w-2xl bg-slate-950 p-6 rounded-2xl border border-slate-800">
                  <input
                    type="text"
                    value={editData.title}
                    onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                    className="w-full text-2xl font-bold bg-slate-900 border border-slate-800 text-white rounded-xl px-4 py-2 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/35"
                    placeholder="Project Title"
                  />
                  <textarea
                    value={editData.description}
                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-4 py-2 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/35 resize-none"
                    rows={3}
                    placeholder="Project Description"
                  />
                </div>
              ) : (
                <div>
                  <h1 className="text-3xl font-extrabold text-white tracking-tight bg-gradient-to-r from-cyan-200 via-slate-100 to-teal-100 bg-clip-text text-transparent">
                    {project.title}
                  </h1>
                  {project.description && (
                    <p className="text-slate-400 mt-2 max-w-3xl leading-relaxed">
                      {project.description}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              {isOwner &&
                (isEditing ? (
                  <>
                    <button
                      onClick={handleUpdateProject}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-xl font-semibold transition shadow-lg shadow-emerald-950/20"
                    >
                      Save Settings
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-5 py-2 rounded-xl font-semibold transition"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="bg-gradient-to-r from-cyan-600 to-teal-650 hover:from-cyan-500 hover:to-teal-555 text-white px-5 py-2 rounded-xl font-semibold transition shadow-lg shadow-cyan-950/20"
                    >
                      Edit Project
                    </button>
                    <button
                      onClick={handleDeleteProject}
                      className="bg-red-950/60 hover:bg-red-900/60 text-red-400 border border-red-900/50 px-5 py-2 rounded-xl font-semibold transition"
                    >
                      Delete Project
                    </button>
                  </>
                ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-xs text-slate-400 mt-6 pt-6 border-t border-slate-900/60">
            <span className="flex items-center gap-1">ÃƒÂ°Ã…Â¸Ã¢â‚¬ËœÃ‚Â¤ Created by: <strong>{project.owner_name}</strong></span>
            <span className="text-slate-700">ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢</span>
            <span>ÃƒÂ°Ã…Â¸Ã¢â‚¬Å“Ã¢â‚¬Â¦ {new Date(project.created_at).toLocaleDateString()}</span>
            <span className="text-slate-700">ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢</span>
            <span>ÃƒÂ°Ã…Â¸Ã¢â‚¬ËœÃ‚Â¥ {project.members?.length || 0} Team Members</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column (Members + Activity Logs) */}
          <div className="lg:col-span-1 space-y-8">
            
            {/* Team Members Section */}
            <div className="bg-slate-900 border border-slate-900/80 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>ÃƒÂ°Ã…Â¸Ã¢â‚¬ËœÃ‚Â¥</span> Team Members
                </h2>
                {canManageMembers && (
                  <button
                    onClick={() => setShowMembersModal(true)}
                    className="bg-cyan-600/20 text-cyan-400 hover:bg-cyan-600/30 border border-cyan-500/20 px-2.5 py-1 rounded-xl text-xs font-semibold transition"
                  >
                    + Invite
                  </button>
                )}
              </div>

              {project.members?.length ? (
                <div className="space-y-3">
                  {project.members.map((member) => (
                    <div key={member.user_id} className="flex items-center justify-between p-3 bg-slate-950/60 border border-slate-900/50 rounded-xl hover:border-slate-800 transition">
                      <div className="flex-1 min-w-0 pr-2">
                        <p className="font-semibold text-slate-200 text-sm truncate">{member.name}</p>
                        <p className="text-xs text-slate-500 truncate">{member.email}</p>
                        <span
                          className={`inline-block mt-1.5 px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded ${
                            member.role === 'admin'
                              ? 'bg-purple-950 text-purple-400 border border-purple-900/50'
                              : member.role === 'manager'
                                ? 'bg-blue-950 text-blue-400 border border-blue-900/50'
                                : member.role === 'viewer'
                                  ? 'bg-slate-900 text-slate-400 border border-slate-800/80'
                                  : 'bg-emerald-950 text-emerald-400 border border-emerald-900/50'
                          }`}
                        >
                          {member.role}
                        </span>
                      </div>

                      {canManageMembers && member.user_id !== project.owner_id && (
                        <button
                          onClick={() => handleRemoveMember(member)}
                          className="text-red-400/80 hover:text-red-400 text-xs font-semibold p-1 hover:bg-red-950/20 rounded transition"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-center py-6 text-sm">No other members listed.</p>
              )}
            </div>

            {/* Project Activity Log Section */}
            <div className="bg-slate-900 border border-slate-900/80 rounded-2xl p-6 shadow-xl">
              <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                <span>ÃƒÂ¢Ã…Â¡Ã‚Â¡</span> Project Activity Log
              </h2>
              <ActivityFeed projectId={id} />
            </div>

          </div>

          {/* Right Column (Tickets Search, Filter, Kanban/List view) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Filter and Search Bar */}
            <div className="bg-slate-900 border border-slate-900/80 rounded-2xl p-6 shadow-xl">
              <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-4 items-end md:items-center justify-between">
                <div className="flex-1 w-full space-y-1">
                  <label htmlFor="search" className="text-xs font-semibold text-slate-400 tracking-wide uppercase">Search Issues</label>
                  <div className="relative">
                    <input
                      id="search"
                      type="text"
                      placeholder="Type query & press enter..."
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl pl-4 pr-10 py-2 text-sm focus:outline-none focus:border-cyan-500 transition"
                    />
                    <button type="submit" className="absolute right-3 top-2.5 text-slate-500 hover:text-cyan-400">
                      ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂÃ‚Â
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                  <div className="flex-1 md:flex-initial space-y-1">
                    <label htmlFor="filter-status" className="text-xs font-semibold text-slate-400 tracking-wide uppercase">Status</label>
                    <select
                      id="filter-status"
                      value={filters.status}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      className="w-full md:w-32 bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-cyan-500"
                    >
                      <option value="">All Statuses</option>
                      <option value="todo">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="done">Done</option>
                    </select>
                  </div>

                  <div className="flex-1 md:flex-initial space-y-1">
                    <label htmlFor="filter-priority" className="text-xs font-semibold text-slate-400 tracking-wide uppercase">Priority</label>
                    <select
                      id="filter-priority"
                      value={filters.priority}
                      onChange={(e) => handleFilterChange('priority', e.target.value)}
                      className="w-full md:w-32 bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-cyan-500"
                    >
                      <option value="">All Priorities</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>
              </form>
            </div>

            {/* Tickets Main Display Card */}
            <div className="bg-slate-900 border border-slate-900/80 rounded-2xl p-6 shadow-xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-extrabold text-white">Project Work items</h2>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => setViewMode('list')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                        viewMode === 'list'
                          ? 'bg-gradient-to-r from-cyan-600 to-teal-650 text-white shadow-md shadow-cyan-950/20'
                          : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      ÃƒÂ°Ã…Â¸Ã¢â‚¬Å“Ã¢â‚¬Â¹ List Layout
                    </button>
                    <button
                      onClick={() => setViewMode('kanban')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                        viewMode === 'kanban'
                          ? 'bg-gradient-to-r from-cyan-600 to-teal-650 text-white shadow-md shadow-cyan-950/20'
                          : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      ÃƒÂ°Ã…Â¸Ã¢â‚¬Å“Ã…Â  Kanban Board
                    </button>
                  </div>
                </div>

                {canCreateTickets && (
                  <button
                    onClick={() => setShowCreateTicketModal(true)}
                    className="bg-gradient-to-r from-cyan-600 to-teal-650 hover:from-cyan-500 hover:to-teal-555 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition shadow-lg shadow-cyan-950/20 w-full sm:w-auto"
                  >
                    + Create Ticket
                  </button>
                )}
              </div>

              {ticketsLoading ? (
                <div className="text-center py-16">
                  <div className="w-8 h-8 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-slate-400 text-sm">Querying active issues...</p>
                </div>
              ) : tickets?.length ? (
                viewMode === 'list' ? (
                  <div className="grid grid-cols-1 gap-4">
                    {tickets.map((ticket) => (
                      <TicketCard
                        key={ticket.id}
                        ticket={ticket}
                        onClick={() => navigate(`/tickets/${ticket.id}`)}
                        onDelete={
                          ticket.reporter_id === user?.id || canManageMembers
                            ? () => handleDeleteTicket(ticket.id)
                            : undefined
                        }
                      />
                    ))}
                  </div>
                ) : (
                  <KanbanBoard
                    tickets={tickets}
                    onStatusChange={handleStatusChange}
                    onTicketClick={(ticketId) => navigate(`/tickets/${ticketId}`)}
                    loading={ticketsLoading}
                    readOnly={!canCreateTickets}
                  />
                )
              ) : (
                <div className="text-center py-16 border border-dashed border-slate-800 rounded-2xl bg-slate-950/20">
                  <p className="text-slate-400 mb-3 text-sm">No tickets found matching current filters.</p>
                  {canCreateTickets && (
                    <button
                      onClick={() => setShowCreateTicketModal(true)}
                      className="text-cyan-400 hover:text-cyan-300 font-semibold text-sm"
                    >
                      Create the first ticket to get started!
                    </button>
                  )}
                </div>
              )}
            </div>

          </div>

        </div>
      </main>

      {/* Modals */}
      {showMembersModal && (
        <ManageMembersModal
          projectId={id}
          onClose={() => setShowMembersModal(false)}
          onSuccess={async () => {
            await loadProject();
            setShowMembersModal(false);
          }}
        />
      )}

      {showCreateTicketModal && (
        <CreateTicketModal
          projectId={id}
          project={project}
          onClose={() => setShowCreateTicketModal(false)}
          onSuccess={async () => {
            await loadTickets();
            setShowCreateTicketModal(false);
          }}
        />
      )}
    </div>
  );
}
