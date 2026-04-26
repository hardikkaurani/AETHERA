import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

      const projectData = await getProject(data.ticket.project_id);
      setProjectMembers(projectData.project.members || []);
      setProjectRole(projectData.project.userRole);
    } catch (err) {
      toast.error('Failed to load ticket');
      navigate('/dashboard');
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

  const handleUpdateTicket = async () => {
    try {
      const updates = {};

      if (editData.title !== currentTicket.title) updates.title = editData.title;
      if (editData.description !== (currentTicket.description || '')) updates.description = editData.description;
      if (editData.priority !== currentTicket.priority) updates.priority = editData.priority;
      if (editData.type !== currentTicket.type) updates.type = editData.type;
      if ((editData.assignee_id || null) !== currentTicket.assignee_id) {
        updates.assignee_id = editData.assignee_id || null;
      }
      if ((editData.due_date || null) !== (currentTicket.due_date || null)) {
        updates.due_date = editData.due_date || null;
      }

      if (editData.status !== currentTicket.status) {
        await changeTicketStatus(ticketId, editData.status);
      }

      if (Object.keys(updates).length > 0) {
        await updateTicket(ticketId, updates);
      }

      if (Object.keys(updates).length === 0 && editData.status === currentTicket.status) {
        setIsEditing(false);
        return;
      }

      toast.success('Ticket updated');
      setIsEditing(false);
      await loadTicket();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) {
      return;
    }

    try {
      setDeletingCommentId(commentId);
      await removeComment(commentId);
      toast.success('Comment deleted');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeletingCommentId(null);
    }
  };

  if (loading && !currentTicket) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="space-y-4">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-600">Loading ticket...</p>
        </div>
      </div>
    );
  }

  if (!currentTicket) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-600">Ticket not found</p>
      </div>
    );
  }

  const canEditTicket = Boolean(projectRole) && projectRole !== 'viewer';
  const canDeleteTicket =
    currentTicket.reporter_id === user?.id ||
    ['owner', 'admin', 'manager'].includes(projectRole);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              {isEditing ? (
                <input
                  type="text"
                  value={editData.title}
                  onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                  className="text-3xl font-bold text-slate-900 w-full border border-slate-300 rounded px-2 py-1 mb-2"
                />
              ) : (
                <h1 className="text-3xl font-bold text-slate-900 mb-2">{currentTicket.title}</h1>
              )}

              <div className="flex gap-3 flex-wrap">
                <span className="px-3 py-1 bg-slate-100 text-slate-800 rounded-full text-sm font-medium">
                  {formatStatusLabel(currentTicket.status)}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    currentTicket.priority === 'critical'
                      ? 'bg-red-100 text-red-800'
                      : currentTicket.priority === 'high'
                        ? 'bg-orange-100 text-orange-800'
                        : currentTicket.priority === 'medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                  }`}
                >
                  {currentTicket.priority}
                </span>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {currentTicket.type}
                </span>
              </div>
            </div>

            <div className="flex gap-2 ml-4">
              {isEditing ? (
                <>
                  <button
                    onClick={handleUpdateTicket}
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
                  {canEditTicket && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
                    >
                      Edit
                    </button>
                  )}
                  {canDeleteTicket && (
                    <button
                      onClick={handleDeleteTicket}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition"
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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Description</h2>
              {isEditing ? (
                <textarea
                  value={editData.description}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg resize-none"
                  rows={5}
                />
              ) : (
                <p className="text-slate-700 whitespace-pre-wrap">
                  {currentTicket.description || 'No description provided'}
                </p>
              )}
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Comments</h2>

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
                <p className="text-slate-500 text-center py-8">No comments yet</p>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Details</h3>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-600">Reporter</label>
                  <p className="text-slate-900">{currentTicket.reporter_name}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-600">Status</label>
                  {isEditing ? (
                    <select
                      value={editData.status}
                      onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                      className="w-full px-2 py-1 border border-slate-300 rounded mt-1"
                    >
                      <option value="todo">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="done">Done</option>
                    </select>
                  ) : (
                    <p className="text-slate-900">{formatStatusLabel(currentTicket.status)}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-600">Assignee</label>
                  {isEditing ? (
                    <select
                      value={editData.assignee_id}
                      onChange={(e) => setEditData({ ...editData, assignee_id: e.target.value })}
                      className="w-full px-2 py-1 border border-slate-300 rounded mt-1"
                    >
                      <option value="">Unassigned</option>
                      {projectMembers.map((member) => (
                        <option key={member.user_id} value={member.user_id}>
                          {member.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-slate-900">{currentTicket.assignee_name || 'Unassigned'}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-600">Due Date</label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={editData.due_date}
                      onChange={(e) => setEditData({ ...editData, due_date: e.target.value })}
                      className="w-full px-2 py-1 border border-slate-300 rounded mt-1"
                    />
                  ) : (
                    <p className="text-slate-900">
                      {currentTicket.due_date ? new Date(currentTicket.due_date).toLocaleDateString() : 'No due date'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-600">Created</label>
                  <p className="text-slate-900">{new Date(currentTicket.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <label className="text-sm font-medium text-slate-600">Priority</label>
              {isEditing ? (
                <select
                  value={editData.priority}
                  onChange={(e) => setEditData({ ...editData, priority: e.target.value })}
                  className="w-full px-2 py-1 border border-slate-300 rounded mt-2"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              ) : (
                <p className="text-slate-900 mt-2">{currentTicket.priority}</p>
              )}
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <label className="text-sm font-medium text-slate-600">Type</label>
              {isEditing ? (
                <select
                  value={editData.type}
                  onChange={(e) => setEditData({ ...editData, type: e.target.value })}
                  className="w-full px-2 py-1 border border-slate-300 rounded mt-2"
                >
                  <option value="bug">Bug</option>
                  <option value="feature">Feature</option>
                  <option value="task">Task</option>
                  <option value="improvement">Improvement</option>
                </select>
              ) : (
                <p className="text-slate-900 mt-2">{currentTicket.type}</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
