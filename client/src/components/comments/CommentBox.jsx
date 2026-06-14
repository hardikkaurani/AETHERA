import { useState } from 'react';

/**
 * Comment Box Component
 * Textarea + submit button for adding comments to tickets
 */
export default function CommentBox({ onSubmit, loading = false, disabled = false }) {
  const [body, setBody] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (disabled || !body.trim()) {
      return;
    }

    try {
      await onSubmit(body.trim());
      setBody('');
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="flex gap-3">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={disabled ? 'You have view-only access to this ticket' : 'Add a comment...'}
          rows={3}
          className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          disabled={loading || disabled}
        />
      </div>

      <div className="mt-3 flex justify-end">
        <button
          type="submit"
          disabled={!body.trim() || loading || disabled}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white px-6 py-2 rounded-lg font-medium transition"
        >
          {loading ? 'Posting...' : 'Post Comment'}
        </button>
      </div>
    </form>
  );
}
