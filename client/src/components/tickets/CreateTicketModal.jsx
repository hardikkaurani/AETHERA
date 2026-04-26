import { useState } from 'react';
import toast from 'react-hot-toast';
import useTickets from '../../hooks/useTickets';

/**
 * CreateTicketModal
 * Form to create a new ticket in a project
 */
export default function CreateTicketModal({ projectId, project, onClose, onSuccess }) {
  const { createNewTicket, loading, error } = useTickets();
  const formId = 'create-ticket-form';
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    type: 'bug',
    assignee_id: '',
    due_date: '',
  });

  /**
   * Handle input change
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value === '' ? '' : value,
    }));
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!formData.title.trim()) {
        toast.error('Ticket title is required');
        return;
      }

      await createNewTicket(projectId, {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        type: formData.type,
        assignee_id: formData.assignee_id || null,
        due_date: formData.due_date || null,
      });

      toast.success('Ticket created successfully! 🎉');
      onSuccess();
    } catch (err) {
      toast.error(err.message || 'Failed to create ticket');
    }
  };

  return (
    // Overlay
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      {/* Modal */}
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-96 overflow-y-auto">
        {/* Header */}
        <div className="border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-slate-900">Create New Ticket</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <form id={formId} onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {/* Error Alert */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Title Input */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Fix login button alignment"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              disabled={loading}
              maxLength={255}
            />
          </div>

          {/* Description Input */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Add more details..."
              rows={3}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
              disabled={loading}
            />
          </div>

          {/* Type Select */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-slate-700 mb-1">
              Type
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              disabled={loading}
            >
              <option value="bug">🐛 Bug</option>
              <option value="feature">✨ Feature</option>
              <option value="task">✓ Task</option>
              <option value="improvement">📈 Improvement</option>
            </select>
          </div>

          {/* Priority Select */}
          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-slate-700 mb-1">
              Priority
            </label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              disabled={loading}
            >
              <option value="low">🟢 Low</option>
              <option value="medium">🟡 Medium</option>
              <option value="high">🟠 High</option>
              <option value="critical">🔴 Critical</option>
            </select>
          </div>

          {/* Assignee Select */}
          {project?.members && project.members.length > 0 && (
            <div>
              <label htmlFor="assignee_id" className="block text-sm font-medium text-slate-700 mb-1">
                Assign To
              </label>
              <select
                id="assignee_id"
                name="assignee_id"
                value={formData.assignee_id}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                disabled={loading}
              >
                <option value="">Unassigned</option>
                {project.members.map((member) => (
                  <option key={member.user_id} value={member.user_id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Due Date Input */}
          <div>
            <label htmlFor="due_date" className="block text-sm font-medium text-slate-700 mb-1">
              Due Date
            </label>
            <input
              id="due_date"
              type="date"
              name="due_date"
              value={formData.due_date}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              disabled={loading}
            />
          </div>
        </form>

        {/* Footer */}
        <div className="border-t border-slate-200 px-6 py-4 flex gap-2 justify-end sticky bottom-0 bg-white">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 font-medium transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form={formId}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Creating...
              </>
            ) : (
              'Create Ticket'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
