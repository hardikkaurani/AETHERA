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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      {/* Modal */}
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="border-b border-slate-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-900">Add Team Member</h2>
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

          {/* Email Input */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="colleague@example.com"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              disabled={loading}
            />
            <p className="text-xs text-slate-500 mt-1">User must already have an account</p>
          </div>

          {/* Role Select */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-slate-700 mb-1">
              Role <span className="text-red-500">*</span>
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              disabled={loading}
            >
              <option value="viewer">👁️ Viewer - View only</option>
              <option value="developer">👨‍💻 Developer - Create & edit issues</option>
              <option value="manager">📋 Manager - Full access</option>
              <option value="admin">🔑 Admin - Manage team</option>
            </select>
          </div>
        </form>

        {/* Footer */}
        <div className="border-t border-slate-200 px-6 py-4 flex gap-2 justify-end">
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
                Adding...
              </>
            ) : (
              'Add Member'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
