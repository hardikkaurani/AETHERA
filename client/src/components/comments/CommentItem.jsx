import { displayText } from '../../utils/sanitize';

/**
 * Comment Item Component
 * Displays individual comment with user info, timestamp, and delete button
 * Sanitizes user input to prevent XSS attacks
 */
export default function CommentItem({ comment, onDelete, isDeleting = false }) {
  return (
    <div className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition">
      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="font-semibold text-slate-900">{displayText(comment.author_name)}</p>
          <p className="text-sm text-slate-500">{new Date(comment.created_at).toLocaleString()}</p>
        </div>

        <button
          onClick={onDelete}
          disabled={isDeleting}
          className="text-red-600 hover:text-red-800 disabled:text-slate-400 text-sm font-medium transition"
          title="Delete comment"
        >
          {isDeleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>

      {/* Body */}
      <p className="text-slate-700 whitespace-pre-wrap">{displayText(comment.body)}</p>
    </div>
  );
}
