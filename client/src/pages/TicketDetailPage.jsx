import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useTickets from '../hooks/useTickets';
import CommentBox from '../components/comments/CommentBox';
import CommentItem from '../components/comments/CommentItem';

/**
 * Ticket Detail Page
 * Shows single ticket with full details and comments
 * Allows editing ticket and adding comments
 */
export default function TicketDetailPage() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const { getTicket, updateTicket, removeTicket, addComment, removeComment, currentTicket, comments, loading, error } =
    useTickets();

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [deletingCommentId, setDeletingCommentId] = useState(null);

  /**
   * Load ticket on mount
   */
  useEffect(() => {
    loadTicket();
  }, [ticketId]);

  /**
   * Load ticket details
   */
  const loadTicket = async () => {
    try {
      const data = await getTicket(ticketId);
      setEditData({
        title: data.ticket.title,
        description: data.ticket.description,
        priority: data.ticket.priority,
        type: data.ticket.type,
        assignee_id: data.ticket.assignee_id,
        due_date: data.ticket.due_date,
      });
    } catch (err) {
      toast.error('Failed to load ticket');
      navigate('/dashboard');
    }
  };

  /**
   * Handle ticket delete
   */
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

  /**
   * Handle ticket update
   */
  const handleUpdateTicket = async () => {
    try {
      const updates = {};
      if (editData.title !== currentTicket.title) updates.title = editData.title;
      if (editData.description !== currentTicket.description) updates.description = editData.description;
      if (editData.priority !== currentTicket.priority) updates.priority = editData.priority;
      if (editData.type !== currentTicket.type) updates.type = editData.type;
      if (editData.assignee_id !== currentTicket.assignee_id) updates.assignee_id = editData.assignee_id;
      if (editData.due_date !== currentTicket.due_date) updates.due_date = editData.due_date;

      if (Object.keys(updates).length === 0) {
        setIsEditing(false);
        return;
      }

      await updateTicket(ticketId, updates);
      toast.success('Ticket updated');
      setIsEditing(false);
      loadTicket();
    } catch (err) {
      toast.error(err.message);
    }
  };

  /**
   * Handle delete comment
   */
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

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
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
                  {currentTicket.status === 'in_progress' ? 'In Progress' : currentTicket.status}
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
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleDeleteTicket}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
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

            {/* Comments Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Comments</h2>

              {/* Add Comment */}
              <CommentBox
                onSubmit={async (body) => {
                  try {
                    await addComment(ticketId, { body });
                    toast.success('Comment added!');
                  } catch (err) {
                    toast.error(err.message);
                  }
                }}
                loading={loading}
              />

              {/* Comment List */}
              {comments.length > 0 ? (
                <div className="mt-8 space-y-4">
                  {comments.map((comment) => (
                    <CommentItem
                      key={comment.id}
                      comment={comment}
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

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Details Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Details</h3>

              <div className="space-y-4">
                {/* Reporter */}
                <div>
                  <label className="text-sm font-medium text-slate-600">Reporter</label>
                  <p className="text-slate-900">{currentTicket.reporter_name}</p>
                </div>

                {/* Assignee */}
                {isEditing ? (
                  <div>
                    <label className="text-sm font-medium text-slate-600">Assign To</label>
                    <input
                      type="text"
                      value={editData.assignee_id || 'Unassigned'}
                      className="w-full px-2 py-1 border border-slate-300 rounded"
                      disabled
                    />
                  </div>
                ) : (
                  <div>
                    <label className="text-sm font-medium text-slate-600">Assignee</label>
                    <p className="text-slate-900">{currentTicket.assignee_name || 'Unassigned'}</p>
                  </div>
                )}

                {/* Due Date */}
                {isEditing ? (
                  <div>
                    <label className="text-sm font-medium text-slate-600">Due Date</label>
                    <input
                      type="date"
                      value={editData.due_date || ''}
                      onChange={(e) => setEditData({ ...editData, due_date: e.target.value })}
                      className="w-full px-2 py-1 border border-slate-300 rounded"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="text-sm font-medium text-slate-600">Due Date</label>
                    <p className="text-slate-900">
                      {currentTicket.due_date ? new Date(currentTicket.due_date).toLocaleDateString() : 'No due date'}
                    </p>
                  </div>
                )}

                {/* Created Date */}
                <div>
                  <label className="text-sm font-medium text-slate-600">Created</label>
                  <p className="text-slate-900">{new Date(currentTicket.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Priority Card */}
            {isEditing ? (
              <div className="bg-white rounded-lg shadow p-6">
                <label className="text-sm font-medium text-slate-600">Priority</label>
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
              </div>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
}
