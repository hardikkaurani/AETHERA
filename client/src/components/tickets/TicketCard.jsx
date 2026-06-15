/**
 * TicketCard Component
 * Displays a single ticket in list or grid view
 * Shows title, status, priority, assignee, reporter
 */

// JSDoc: TicketCard displays bug type, priority levels, and assignment tags
export default function TicketCard({ ticket, onClick, onDelete }) {
  
// Maps priority level string to colored badge border CSS tailwind classes
const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-950/40 text-red-400 border-red-900/30';
      case 'high':
        return 'bg-orange-950/40 text-orange-400 border-orange-900/30';
      case 'medium':
        return 'bg-yellow-950/40 text-yellow-400 border-yellow-900/30';
      case 'low':
        return 'bg-green-950/40 text-green-400 border-green-900/30';
      default:
        return 'bg-slate-900 text-slate-400 border-slate-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'todo':
        return 'bg-slate-900 text-slate-300 border border-slate-800/80';
      case 'in_progress':
        return 'bg-cyan-950/40 text-cyan-400 border border-cyan-900/30';
      case 'done':
        return 'bg-green-950/40 text-green-400 border border-green-900/30';
      default:
        return 'bg-slate-900 text-slate-350 border border-slate-800/80';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'bug':
        return 'Ã°Å¸Ââ€º';
      case 'feature':
        return 'Ã¢Å“Â¨';
      case 'task':
        return 'Ã¢Å“â€œ';
      case 'improvement':
        return 'Ã°Å¸â€œË†';
      default:
        return 'Ã°Å¸â€œÂ';
    }
  };

  return (
    <div
      className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-900 hover:border-slate-800/85 hover:shadow-lg transition-all duration-200 cursor-pointer p-5 flex flex-col justify-between min-h-[200px]"
      onClick={onClick}
    >
      <div>
        {/* Header with Type and Status */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">{getTypeIcon(ticket.type)}</span>
            <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-lg ${getStatusColor(ticket.status)}`}>
              {ticket.status === 'in_progress' ? 'In Progress' : ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
            </span>
          </div>
          <span className={`px-2 py-0.5 text-[10px] font-bold border rounded uppercase tracking-wider ${getPriorityColor(ticket.priority)}`}>
            {ticket.priority}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-bold text-slate-200 mb-2 line-clamp-2 hover:text-cyan-400 transition text-sm leading-snug">{ticket.title}</h3>

        {/* Description Preview */}
        {ticket.description && (
          <p className="text-xs text-slate-500 mb-4 line-clamp-2 leading-relaxed">{ticket.description}</p>
        )}
      </div>

      <div>
        {/* Meta Information */}
        <div className="space-y-2 text-xs text-slate-450 mb-4 pt-3 border-t border-slate-950/40">
          {ticket.assignee_name && (
            <div className="flex items-center gap-2">
              <span>Ã°Å¸â€˜Â¤</span>
              <span>Assigned to: <span className="text-slate-300 font-medium">{ticket.assignee_name}</span></span>
            </div>
          )}
          {ticket.due_date && (
            <div className="flex items-center gap-2">
              <span>Ã°Å¸â€œâ€¦</span>
              <span>Due: <span className="text-slate-300 font-medium">{new Date(ticket.due_date).toLocaleDateString()}</span></span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span>Ã°Å¸â€™Â¬</span>
            <span>{ticket.comment_count || 0} comments</span>
          </div>
        </div>

        {/* Footer with Actions */}
        <div className="flex gap-3 pt-3 border-t border-slate-950/40">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick?.();
            }}
            className="flex-1 bg-slate-950 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold py-2 rounded-xl transition"
          >
            View Details
          </button>
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="flex-1 bg-red-950/30 border border-red-900/20 text-red-400 hover:text-red-300 hover:bg-red-950/50 text-xs font-semibold py-2 rounded-xl transition"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
