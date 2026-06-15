import { useState } from 'react';
import toast from 'react-hot-toast';
import useTickets from '../../hooks/useTickets';

/**
 * CreateTicketModal
 * Form to create a new ticket in a project
 */

// JSDoc: CreateTicketModal displays forms to compile issue details
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
  
// Sanity check inputs and passes metadata to submit endpoint
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

      toast.success('Ticket created successfully! Ã°Å¸Å½â€°');
      onSuccess();
    } catch (err) {
      toast.error(err.message || 'Failed to create ticket');
    }
  };

  return (
    // Overlay
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      {/* Modal */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="border-b border-slate-800/80 px-6 py-4 flex justify-between items-center bg-slate-900 rounded-t-2xl">
          <h2 className="text-lg font-bold text-white">Create New Ticket</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xl transition"
          >
            Ã¢Å“â€¢
          </button>
        </div>

        {/* Content */}
        <form id={formId} onSubmit={handleSubmit} className="px-6 py-4 space-y-4 overflow-y-auto flex-1 text-slate-300">
          {/* Error Alert */}
          {error && (
            <div className="p-3 bg-red-950/40 border border-red-900/50 rounded-xl">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Title Input */}
          <div>
            <label htmlFor="title" className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              id="title"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Fix login button alignment"
              className="w-full px-4 py-2 bg-slate-950 border border-slate-800 text-white rounded-xl focus:outline-none focus:border-cyan-500 transition"
              disabled={loading}
              maxLength={255}
            />
          </div>

          {/* Description Input */}
          <div>
            <label htmlFor="description" className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Add more details..."
              rows={3}
              className="w-full px-4 py-2 bg-slate-950 border border-slate-800 text-white rounded-xl focus:outline-none focus:border-cyan-500 transition resize-none"
              disabled={loading}
            />
          </div>

          {/* Type Select */}
          <div>
            <label htmlFor="type" className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
              Type
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-950 border border-slate-800 text-white rounded-xl focus:outline-none focus:border-cyan-500 transition"
              disabled={loading}
            >
              <option value="bug">Ã°Å¸Ââ€º Bug</option>
              <option value="feature">Ã¢Å“Â¨ Feature</option>
              <option value="task">Ã¢Å“â€œ Task</option>
              <option value="improvement">Ã°Å¸â€œË† Improvement</option>
            </select>
          </div>

          {/* Priority Select */}
          <div>
            <label htmlFor="priority" className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
              Priority
            </label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-950 border border-slate-800 text-white rounded-xl focus:outline-none focus:border-cyan-500 transition"
              disabled={loading}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          {/* Assignee Select */}
          {project?.members && project.members.length > 0 && (
            <div>
              <label htmlFor="assignee_id" className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
                Assign To
              </label>
              <select
                id="assignee_id"
                name="assignee_id"
                value={formData.assignee_id}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-slate-950 border border-slate-800 text-white rounded-xl focus:outline-none focus:border-cyan-500 transition"
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
            <label htmlFor="due_date" className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
              Due Date
            </label>
            <input
              id="due_date"
              type="date"
              name="due_date"
              value={formData.due_date}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-950 border border-slate-800 text-white rounded-xl focus:outline-none focus:border-cyan-500 transition"
              disabled={loading}
            />
          </div>
        </form>

        {/* Footer */}
        <div className="border-t border-slate-800/80 px-6 py-4 flex gap-2 justify-end bg-slate-900 rounded-b-2xl">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-slate-300 border border-slate-800 rounded-xl hover:bg-slate-800 font-medium transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            form={formId}
            disabled={loading}
            className="px-5 py-2 bg-gradient-to-r from-cyan-600 to-teal-650 hover:from-cyan-500 hover:to-teal-555 text-white rounded-xl font-semibold transition disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? 'Creating...' : 'Create Ticket'}
          </button>
        </div>
      </div>
    </div>
  );
}
