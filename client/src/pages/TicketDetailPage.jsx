import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuth from '../hooks/useAuth';
import useProjects from '../hooks/useProjects';
import useTickets from '../hooks/useTickets';
import CommentBox from '../components/comments/CommentBox';
import CommentItem from '../components/comments/CommentItem';

const formatStatusLabel = (status) => {
  if (status === 'in_progress') {
    return 'In Progress';
  }

  return status.charAt(0).toUpperCase() + status.slice(1);
};

/**
 * Ticket Detail Page
 * Shows a single ticket, comments, and edit controls.
 */

// JSDoc: TicketDetailPage presents a structured review of bugs, with comment logs
export default function TicketDetailPage() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getProject } = useProjects();
  const {
    getTicket,
    updateTicket,
    changeTicketStatus,
    removeTicket,
    addComment,
    removeComment,
    currentTicket,
    comments,
    loading,
  } = useTickets();

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [projectMembers, setProjectMembers] = useState([]);
  const [projectRole, setProjectRole] = useState(null);
  const [deletingCommentId, setDeletingCommentId] = useState(null);

  useEffect(() => {
    loadTicket();
  }, [ticketId]);

  const loadTicket = async () => {
    try {
      const data = await getTicket(ticketId);
      setEditData({
        title: data.ticket.title,
        description: data.ticket.description || '',
        priority: data.ticket.priority,
        type: data.ticket.type,
        status: data.ticket.status,
        assignee_id: data.ticket.assignee_id || '',
        due_date: data.ticket.due_date || '',
      });

      // Load project context to get members and role
      const projData = await getProject(data.ticket.project_id);
      setProjectMembers(projData.project.members || []);
      setProjectRole(projData.project.userRole);
    } catch (err) {
      toast.error('Failed to load ticket context');
      navigate('/dashboard');
    }
  };

  
// Commits modified fields to the database and re-fetches logs
const handleUpdateTicket = async () => {
    try {
      await updateTicket(ticketId, editData);
      toast.success('Ticket updated');
      setIsEditing(false);
      await loadTicket();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDeleteTicket = async () => {
    if (!window.confirm('Are you sure you want to delete this ticket?')) {
      return;
    }

    try {
      await removeTicket(ticketId);
      toast.success('Ticket deleted');
      navigate(`/projects/${currentTicket.project_id}`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  
// Sends DELETE comment request and updates comment listing state
const handleDeleteComment = async (commentId) => {
    try {
      setDeletingCommentId(commentId);
      await removeComment(ticketId, commentId);
      toast.success('Comment removed');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeletingCommentId(null);
    }
  };

  if (loading && !currentTicket) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-400">Querying issue details...</p>
        </div>
      </div>
    );
  }

  if (!currentTicket) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="text-center p-8 bg-slate-900 border border-slate-800 rounded-2xl max-w-md">
          <p className="text-red-400 font-semibold mb-4 text-lg">Ticket not found or deleted</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-gradient-to-r from-cyan-600 to-teal-650 hover:from-cyan-500 hover:to-teal-555 text-white px-6 py-2.5 rounded-xl font-medium transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  
// Evaluates ticket modification privileges for current user
const canEditTicket = Boolean(projectRole) && projectRole !== 'viewer';
  const canDeleteTicket =
    currentTicket.reporter_id === user?.id ||
    ['owner', 'admin', 'manager'].includes(projectRole);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-12">
      {/* Navigation bar */}
      <nav className="border-b border-slate-900 bg-slate-900/40 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to={`/projects/${currentTicket.project_id}`}
              className="text-slate-400 hover:text-white transition flex items-center gap-1.5 text-sm font-medium"
            >
              ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â Ãƒâ€šÃ‚Â Back to Project
            </Link>
            <span className="text-slate-800">/</span>
            <span className="text-slate-300 text-sm font-semibold truncate max-w-[200px]">
              Issue #{currentTicket.id.slice(0, 8)}
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
            <div className="flex-1 w-full">
              {isEditing ? (
                <input
                  type="text"
                  value={editData.title}
                  onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                  className="w-full text-2xl font-bold bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2 focus:outline-none focus:border-cyan-500 mb-4 focus:ring-1 focus:ring-cyan-500/35"
                />
              ) : (
                <h1 className="text-3xl font-extrabold text-white tracking-tight mb-3">
                  {currentTicket.title}
                </h1>
              )}

              <div className="flex gap-2 flex-wrap">
                <span className="px-3 py-1 bg-slate-950 border border-slate-800 text-slate-300 rounded-xl text-xs font-bold uppercase tracking-wider">
                  {formatStatusLabel(currentTicket.status)}
                </span>
                <span
                  className={`px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider border ${
                    currentTicket.priority === 'critical'
                      ? 'bg-red-950/60 text-red-400 border-red-900/50'
                      : currentTicket.priority === 'high'
                        ? 'bg-orange-950/60 text-orange-400 border-orange-900/50'
                        : currentTicket.priority === 'medium'
                          ? 'bg-yellow-950/60 text-yellow-400 border-yellow-900/50'
                          : 'bg-emerald-950/60 text-emerald-400 border-emerald-900/50'
                  }`}
                >
                  {currentTicket.priority}
                </span>
                <span className="px-3 py-1 bg-blue-950/60 text-blue-400 border border-blue-900/50 rounded-xl text-xs font-bold uppercase tracking-wider">
                  {currentTicket.type}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              {isEditing ? (
                <>
                  <button
                    onClick={handleUpdateTicket}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-xl font-semibold transition shadow-lg shadow-emerald-950/20"
                  >
                    Save Changes
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
                  {canEditTicket && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="bg-gradient-to-r from-cyan-600 to-teal-650 hover:from-cyan-500 hover:to-teal-555 text-white px-5 py-2 rounded-xl font-semibold transition shadow-lg shadow-cyan-950/20"
                    >
                      Edit Issue
                    </button>
                  )}
                  {canDeleteTicket && (
                    <button
                      onClick={handleDeleteTicket}
                      className="bg-red-950/60 hover:bg-red-900/60 text-red-400 border border-red-900/50 px-5 py-2 rounded-xl font-semibold transition"
                    >
                      Delete
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Card Columns */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description Card */}
            <div className="bg-slate-900 border border-slate-900/80 rounded-2xl p-6 shadow-xl">
              <h2 className="text-lg font-bold text-white mb-4">Description</h2>
              {isEditing ? (
                <textarea
                  value={editData.description}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-800 text-white rounded-xl focus:outline-none focus:border-cyan-500 transition resize-none focus:ring-1 focus:ring-cyan-500/35"
                  rows={5}
                />
              ) : (
                <p className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">
                  {currentTicket.description || 'No description provided'}
                </p>
              )}
            </div>

            {/* Comments Card */}
            <div className="bg-slate-900 border border-slate-900/80 rounded-2xl p-6 shadow-xl">
              <h2 className="text-lg font-bold text-white mb-6">Comments</h2>

              <CommentBox
                onSubmit={async (body) => {
                  try {
                    await addComment(ticketId, { body });
                    toast.success('Comment added');
                  } catch (err) {
                    toast.error(err.message);
                  }
                }}
                loading={loading}
                disabled={!canEditTicket}
              />

              {comments.length > 0 ? (
                <div className="mt-8 space-y-4">
                  {comments.map((comment) => (
                    <CommentItem
                      key={comment.id}
                      comment={comment}
                      canDelete={
                        comment.author_id === user?.id ||
                        ['owner', 'admin', 'manager'].includes(projectRole)
                      }
                      onDelete={() => handleDeleteComment(comment.id)}
                      isDeleting={deletingCommentId === comment.id}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-center py-8 text-sm">No comments yet</p>
              )}
            </div>
          </div>

          {/* Sidebar Details Panel */}
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-900/80 rounded-2xl p-6 shadow-xl">
              <h3 className="text-base font-bold text-white mb-5 border-b border-slate-800 pb-3">Details</h3>

              <div className="space-y-5 text-sm">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Reporter</label>
                  <p className="text-slate-200 mt-1 font-semibold">{currentTicket.reporter_name}</p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</label>
                  {isEditing ? (
                    <select
                      value={editData.status}
                      onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-350 rounded-xl px-3 py-1.5 mt-1 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="todo">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="done">Done</option>
                    </select>
                  ) : (
                    <p className="text-slate-200 mt-1 font-semibold">{formatStatusLabel(currentTicket.status)}</p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Assignee</label>
                  {isEditing ? (
                    <select
                      value={editData.assignee_id}
                      onChange={(e) => setEditData({ ...editData, assignee_id: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-350 rounded-xl px-3 py-1.5 mt-1 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="">Unassigned</option>
                      {projectMembers.map((member) => (
                        <option key={member.user_id} value={member.user_id}>
                          {member.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-slate-200 mt-1 font-semibold">{currentTicket.assignee_name || 'Unassigned'}</p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Due Date</label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={editData.due_date}
                      onChange={(e) => setEditData({ ...editData, due_date: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-350 rounded-xl px-3 py-1.5 mt-1 focus:outline-none focus:border-cyan-500"
                    />
                  ) : (
                    <p className="text-slate-200 mt-1 font-semibold">
                      {currentTicket.due_date ? new Date(currentTicket.due_date).toLocaleDateString() : 'No due date'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Created</label>
                  <p className="text-slate-300 mt-1">{new Date(currentTicket.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-900/80 rounded-2xl p-6 shadow-xl">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Priority Settings</label>
              {isEditing ? (
                <select
                  value={editData.priority}
                  onChange={(e) => setEditData({ ...editData, priority: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-350 rounded-xl px-3 py-1.5 mt-2 focus:outline-none focus:border-cyan-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              ) : (
                <p className="text-slate-200 mt-2 font-semibold text-sm capitalize">{currentTicket.priority}</p>
              )}
            </div>

            <div className="bg-slate-900 border border-slate-900/80 rounded-2xl p-6 shadow-xl">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Issue Type</label>
              {isEditing ? (
                <select
                  value={editData.type}
                  onChange={(e) => setEditData({ ...editData, type: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-350 rounded-xl px-3 py-1.5 mt-2 focus:outline-none focus:border-cyan-500"
                >
                  <option value="bug">Bug</option>
                  <option value="feature">Feature</option>
                  <option value="task">Task</option>
                  <option value="improvement">Improvement</option>
                </select>
              ) : (
                <p className="text-slate-200 mt-2 font-semibold text-sm capitalize">{currentTicket.type}</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
