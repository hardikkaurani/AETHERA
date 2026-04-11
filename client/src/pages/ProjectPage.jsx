import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useProjects from '../hooks/useProjects';
import useTickets from '../hooks/useTickets';
import ManageMembersModal from '../components/layout/ManageMembersModal';
import CreateTicketModal from '../components/tickets/CreateTicketModal';
import TicketCard from '../components/tickets/TicketCard';
import KanbanBoard from '../components/tickets/KanbanBoard';

/**
 * Project Page
 * Shows single project details, members, and tickets
 * Allows managing project members and tickets
 */
export default function ProjectPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getProject, editProject, removeProject, addMember, removeMember, loading: projectLoading, error } =
    useProjects();
  const { getAllTickets, removeTicket, changeTicketStatus, tickets, loading: ticketsLoading } = useTickets();

  const [project, setProject] = useState(null);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showCreateTicketModal, setShowCreateTicketModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ title: '', description: '' });
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'kanban'

  /**
   * Load project and tickets on mount
   */
  useEffect(() => {
    loadProject();
    loadTickets();
  }, [id]);

  /**
   * Load tickets for project
   */
  const loadTickets = async () => {
    try {
      await getAllTickets(id);
    } catch (err) {
      toast.error('Failed to load tickets');
    }
  };

  /**
   * Handle ticket status change (from Kanban drag-and-drop)
   */
  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      await changeTicketStatus(ticketId, newStatus);
      await loadTickets();
      toast.success('Ticket status updated');
    } catch (err) {
      toast.error(err.message);
      await loadTickets(); // Refresh to reset UI
    }
  };

  /**
   * Load project details
   */
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

  /**
   * Handle project delete
   */
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

  /**
   * Handle project update
   */
  const handleUpdateProject = async () => {
    try {
      await editProject(id, editData);
      toast.success('Project updated');
      setIsEditing(false);
      loadProject();
    } catch (err) {
      toast.error(err.message);
    }
  };

  /**
   * Check if user is owner or has admin role
   */
  const isOwner = project?.owner_id === project?.userRole || project?.userRole === 'owner';
  const canManageMembers =
    isOwner || project?.userRole === 'admin' || project?.userRole === 'manager';

  if (projectLoading && !project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="space-y-4">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-600 text-center">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 font-semibold mb-4">Project not found</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={editData.title}
                    onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                    className="w-full text-3xl font-bold text-slate-900 border border-slate-300 rounded px-2 py-1"
                  />
                  <textarea
                    value={editData.description}
                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                    className="w-full border border-slate-300 rounded px-2 py-1 resize-none"
                    rows={3}
                  />
                </div>
              ) : (
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">{project.title}</h1>
                  {project.description && (
                    <p className="text-slate-600 mt-2">{project.description}</p>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-2 ml-4">
              {isOwner && (
                <>
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleUpdateProject}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="bg-slate-400 hover:bg-slate-500 text-white px-4 py-2 rounded-lg font-medium transition"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={handleDeleteProject}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="flex gap-2 text-sm text-slate-600">
            <span>👤 {project.owner_name}</span>
            <span>📅 {new Date(project.created_at).toLocaleDateString()}</span>
            <span>👥 {project.members?.length || 0} members</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Members Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-900">Team Members</h2>
                {canManageMembers && (
                  <button
                    onClick={() => setShowMembersModal(true)}
                    className="bg-blue-100 text-blue-600 hover:bg-blue-200 px-2 py-1 rounded text-sm font-medium transition"
                  >
                    + Add
                  </button>
                )}
              </div>

              {project.members && project.members.length > 0 ? (
                <div className="space-y-3">
                  {project.members.map((member) => (
                    <div key={member.user_id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{member.name}</p>
                        <p className="text-xs text-slate-500">{member.email}</p>
                        <span
                          className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded ${
                            member.role === 'admin'
                              ? 'bg-purple-100 text-purple-800'
                              : member.role === 'manager'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {member.role}
                        </span>
                      </div>

                      {canManageMembers && member.user_id !== project.owner_id && (
                        <button
                          onClick={() => removeMember(id, member.user_id)}
                          className="text-red-600 hover:text-red-700 text-sm font-medium"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-600 text-center py-8">No members yet</p>
              )}
            </div>
          </div>

          {/* Tickets Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-3">Tickets</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setViewMode('list')}
                      className={`px-3 py-1 rounded text-sm font-medium transition ${
                        viewMode === 'list'
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      }`}
                    >
                      📋 List
                    </button>
                    <button
                      onClick={() => setViewMode('kanban')}
                      className={`px-3 py-1 rounded text-sm font-medium transition ${
                        viewMode === 'kanban'
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      }`}
                    >
                      📊 Kanban
                    </button>
                  </div>
                </div>
                {canManageMembers && (
                  <button
                    onClick={() => setShowCreateTicketModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
                  >
                    + Create Ticket
                  </button>
                )}
              </div>

              {ticketsLoading ? (
                <div className="text-center py-12">
                  <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-slate-600">Loading tickets...</p>
                </div>
              ) : tickets && tickets.length > 0 ? (
                viewMode === 'list' ? (
                  <div className="grid grid-cols-1 gap-4">
                    {tickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        onClick={() => navigate(`/tickets/${ticket.id}`)}
                        className="cursor-pointer"
                      >
                        <TicketCard
                          ticket={ticket}
                          onDelete={async () => {
                            if (window.confirm('Delete this ticket?')) {
                              try {
                                await removeTicket(ticket.id);
                                await loadTickets();
                                toast.success('Ticket deleted');
                              } catch (err) {
                                toast.error(err.message);
                              }
                            }
                          }}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <KanbanBoard
                    tickets={tickets}
                    onStatusChange={handleStatusChange}
                    loading={ticketsLoading}
                  />
                )
              ) : (
                <div className="text-center py-12 border-2 border-dashed border-slate-300 rounded-lg">
                  <p className="text-slate-600 mb-2">No tickets yet</p>
                  {canManageMembers && (
                    <button
                      onClick={() => setShowCreateTicketModal(true)}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Create the first ticket
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Manage Members Modal */}
      {showMembersModal && (
        <ManageMembersModal
          projectId={id}
          onClose={() => setShowMembersModal(false)}
          onSuccess={() => {
            loadProject();
            setShowMembersModal(false);
          }}
        />
      )}

      {/* Create Ticket Modal */}
      {showCreateTicketModal && (
        <CreateTicketModal
          projectId={id}
          project={project}
          onClose={() => setShowCreateTicketModal(false)}
          onSuccess={() => {
            loadTickets();
            setShowCreateTicketModal(false);
          }}
        />
      )}
    </div>
  );
}
