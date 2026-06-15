import { useState } from 'react';
import toast from 'react-hot-toast';
import useProjects from '../../hooks/useProjects';

/**
 * Create Project Modal
 * Form to create a new project
 * Shows loading state during submission
 */
export default function CreateProjectModal({ onClose, onSuccess }) {
  const { createNewProject, loading, error } = useProjects();
  const formId = 'create-project-form';
  const [formData, setFormData] = useState({
    title: '',
    description: '',
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
      if (!formData.title.trim()) {
        toast.error('Project title is required');
        return;
      }

      await createNewProject({
        title: formData.title,
        description: formData.description,
      });

      toast.success('Project created successfully! 🎉');
      onSuccess();
    } catch (err) {
      toast.error(err.message || 'Failed to create project');
    }
  };

  return (
    // Overlay
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      {/* Modal */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="border-b border-slate-800/85 px-6 py-4 flex justify-between items-center bg-slate-900 rounded-t-2xl">
          <h2 className="text-lg font-bold text-white">Create New Project</h2>
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

          {/* Title Input */}
          <div>
            <label htmlFor="title" className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
              Project Title <span className="text-red-400">*</span>
            </label>
            <input
              id="title"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Mobile App Redesign"
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl focus:outline-none focus:border-cyan-500 transition placeholder:text-slate-600"
              disabled={loading}
              maxLength={150}
            />
            <p className="text-[10px] text-slate-500 mt-1">{formData.title.length}/150</p>
          </div>

          {/* Description Input */}
          <div>
            <label htmlFor="description" className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
              Description (Optional)
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Brief description of your project..."
              rows={4}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl focus:outline-none focus:border-cyan-500 transition resize-none placeholder:text-slate-600"
              disabled={loading}
              maxLength={500}
            />
            <p className="text-[10px] text-slate-500 mt-1">{formData.description.length}/500</p>
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
            {loading ? 'Creating...' : 'Create Project'}
          </button>
        </div>
      </div>
    </div>
  );
}
