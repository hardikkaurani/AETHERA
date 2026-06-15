import { useState } from 'react';
import toast from 'react-hot-toast';
import useProjects from '../../hooks/useProjects';

/**
 * Manage Members Modal
 * Add new members to project by email
 */
export default function ManageMembersModal({ projectId, onClose, onSuccess }) {
  const { addMember, loading, error } = useProjects();
  const formId = 'manage-members-form';
  const [formData, setFormData] = useState({
    email: '',
    role: 'developer',
  });

  /**
   * Handle input change
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!formData.email.trim()) {
        toast.error('Email is required');
        return;
      }

      await addMember(projectId, {
        email: formData.email,
        role: formData.role,
      });

      toast.success('Member added successfully!');
      setFormData({ email: '', role: 'developer' });
      onSuccess();
    } catch (err) {
      toast.error(err.message || 'Failed to add member');
    }
  };

  return (
    // Overlay
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      {/* Modal */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="border-b border-slate-800/85 px-6 py-4 flex justify-between items-center bg-slate-900 rounded-t-2xl">
          <h2 className="text-lg font-bold text-white">Add Team Member</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xl transition"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <form id={formId} onSubmit={handleSubmit} className="px-6 py-5 space-y-4 text-slate-350">
          {/* Error Alert */}
          {error && (
            <div className="p-3 bg-red-950/40 border border-red-900/50 rounded-xl">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Email Input */}
          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
              Email Address <span className="text-red-400">*</span>
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="colleague@example.com"
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl focus:outline-none focus:border-cyan-500 transition placeholder:text-slate-600"
              disabled={loading}
            />
            <p className="text-[10px] text-slate-500 mt-1">User must already have an account</p>
          </div>

          {/* Role Select */}
          <div>
            <label htmlFor="role" className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
              Role <span className="text-red-400">*</span>
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl focus:outline-none focus:border-cyan-500 transition"
              disabled={loading}
            >
              <option value="viewer" className="bg-slate-900">👁️ Viewer - View only</option>
              <option value="developer" className="bg-slate-900">👨‍💻 Developer - Create & edit issues</option>
              <option value="manager" className="bg-slate-900">📋 Manager - Full access</option>
              <option value="admin" className="bg-slate-900">🔑 Admin - Manage team</option>
            </select>
          </div>
        </form>

        {/* Footer */}
        <div className="border-t border-slate-800/85 px-6 py-4 flex gap-2 justify-end bg-slate-900 rounded-b-2xl">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-slate-300 border border-slate-800 rounded-xl hover:bg-slate-850 font-medium transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            form={formId}
            disabled={loading}
            className="px-5 py-2 bg-gradient-to-r from-cyan-600 to-teal-650 hover:from-cyan-500 hover:to-teal-555 text-white rounded-xl font-semibold transition disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? 'Adding...' : 'Add Member'}
          </button>
        </div>
      </div>
    </div>
  );
}
