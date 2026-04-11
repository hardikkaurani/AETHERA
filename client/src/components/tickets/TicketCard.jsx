/**
 * TicketCard Component
 * Displays a single ticket in list or grid view
 * Shows title, status, priority, assignee, reporter
 */
export default function TicketCard({ ticket, onClick, onDelete }) {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'todo':
        return 'bg-slate-100 text-slate-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'done':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'bug':
        return '🐛';
      case 'feature':
        return '✨';
      case 'task':
        return '✓';
      case 'improvement':
        return '📈';
      default:
        return '📝';
    }
  };

  return (
    <div
      className="bg-white rounded-lg border border-slate-200 hover:shadow-md transition cursor-pointer p-4"
      onClick={onClick}
    >
      {/* Header with Type and Status */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{getTypeIcon(ticket.type)}</span>
          <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(ticket.status)}`}>
            {ticket.status === 'in_progress' ? 'In Progress' : ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
          </span>
        </div>
        <span className={`px-2 py-1 text-xs font-bold border rounded ${getPriorityColor(ticket.priority)}`}>
          {ticket.priority.toUpperCase()}
        </span>
      </div>

      {/* Title */}
      <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2">{ticket.title}</h3>

      {/* Description Preview */}
      {ticket.description && (
        <p className="text-sm text-slate-600 mb-3 line-clamp-2">{ticket.description}</p>
      )}

      {/* Meta Information */}
      <div className="space-y-2 text-xs text-slate-600 mb-3">
        {ticket.assignee_name && (
          <div className="flex items-center gap-2">
            <span>👤</span>
            <span>Assigned to: {ticket.assignee_name}</span>
          </div>
        )}
        {ticket.due_date && (
          <div className="flex items-center gap-2">
            <span>📅</span>
            <span>{new Date(ticket.due_date).toLocaleDateString()}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <span>💬</span>
          <span>{ticket.comment_count || 0} comments</span>
        </div>
      </div>

      {/* Footer with Actions */}
      <div className="flex gap-2 pt-2 border-t border-slate-100">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick?.();
          }}
          className="flex-1 text-blue-600 hover:text-blue-700 text-sm font-medium py-1"
        >
          View
        </button>
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="flex-1 text-red-600 hover:text-red-700 text-sm font-medium py-1"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
