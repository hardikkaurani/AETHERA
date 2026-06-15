import { useMemo } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

/**
 * Kanban Board Component
 * Displays tickets in 3 columns (todo, in_progress, done)
 * Supports drag-and-drop to update ticket status
 */
export default function KanbanBoard({
  tickets = [],
  onStatusChange,
  onTicketClick,
  loading = false,
  readOnly = false,
}) {
  /**
   * Group tickets by status
   */
  const columnData = useMemo(() => {
    const columns = {
      todo: { title: 'To Do', statuses: ['todo'], tickets: [] },
      in_progress: { title: 'In Progress', statuses: ['in_progress'], tickets: [] },
      done: { title: 'Done', statuses: ['done'], tickets: [] },
    };

    tickets.forEach((ticket) => {
      if (ticket.status === 'in_progress') {
        columns.in_progress.tickets.push(ticket);
      } else if (ticket.status === 'done') {
        columns.done.tickets.push(ticket);
      } else {
        columns.todo.tickets.push(ticket);
      }
    });

    return columns;
  }, [tickets]);

  /**
   * Handle drag end
   */
  const handleDragEnd = async (result) => {
    const { source, destination, draggableId } = result;

    if (readOnly || !destination) {
      return;
    }

    // If dropped in same position
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const ticketId = draggableId;
    const newStatus = destination.droppableId;

    // Call parent handler to update status
    if (onStatusChange) {
      await onStatusChange(ticketId, newStatus);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-slate-400 text-sm">Loading board...</p>
        </div>
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(columnData).map(([key, column]) => (
          <Droppable key={key} droppableId={key}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`min-h-[500px] rounded-2xl p-5 transition-all duration-350 border backdrop-blur-md ${
                  snapshot.isDraggingOver
                    ? 'bg-cyan-950/25 border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.05)]'
                    : 'bg-slate-900/60 border-slate-900/60'
                }`}
              >
                <h3 className="font-extrabold text-base text-slate-200 mb-5 flex items-center justify-between">
                  <span>{column.title}</span>
                  <span className="bg-slate-800/80 border border-slate-700/50 text-slate-300 text-xs font-bold px-2.5 py-0.5 rounded-lg">
                    {column.tickets.length}
                  </span>
                </h3>

                <div className="space-y-4">
                  {column.tickets.map((ticket, index) => (
                    <Draggable
                      key={ticket.id}
                      draggableId={ticket.id}
                      index={index}
                      isDragDisabled={readOnly}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          onClick={() => onTicketClick?.(ticket.id)}
                          className={`bg-slate-950/90 p-4 rounded-xl border border-slate-850 hover:border-slate-850 transition-all duration-205 ${
                            readOnly ? 'cursor-pointer' : 'cursor-move'
                          } ${
                            snapshot.isDragging
                              ? 'shadow-2xl scale-[1.03] opacity-80 border-cyan-500/50 bg-slate-900'
                              : 'shadow-md hover:shadow-lg hover:border-slate-800 hover:translate-y-[-2px]'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <h4 className="font-bold text-slate-200 text-sm leading-snug line-clamp-2 hover:text-cyan-400 transition">
                                {ticket.title}
                              </h4>
                              <p className="text-[10px] text-slate-505 mt-1.5 font-semibold">
                                {ticket.type.toUpperCase()} •{' '}
                                {new Date(ticket.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 flex gap-2 flex-wrap items-center">
                            <span
                              className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider border ${
                                ticket.priority === 'critical'
                                  ? 'bg-red-950/40 text-red-400 border-red-900/30'
                                  : ticket.priority === 'high'
                                  ? 'bg-orange-950/40 text-orange-400 border-orange-900/30'
                                  : ticket.priority === 'medium'
                                  ? 'bg-yellow-950/40 text-yellow-400 border-yellow-900/30'
                                  : 'bg-green-950/40 text-green-400 border-green-900/30'
                              }`}
                            >
                              {ticket.priority}
                            </span>
                            {ticket.assignee_name && (
                              <span className="text-[10px] font-semibold bg-cyan-950/40 text-cyan-400 border border-cyan-900/30 px-2 py-0.5 rounded">
                                👤 {ticket.assignee_name}
                              </span>
                            )}
                          </div>

                          {ticket.comment_count > 0 && (
                            <div className="mt-3 pt-3 border-t border-slate-900/60 text-[11px] text-slate-400 flex items-center gap-1.5 font-medium">
                              <span>💬</span> {ticket.comment_count} comment{ticket.comment_count !== 1 ? 's' : ''}
                            </div>
                          )}
                        </div>
                      )}
                    </Draggable>
                  ))}

                  {provided.placeholder}
                </div>

                {column.tickets.length === 0 && !provided.placeholder && (
                  <div className="text-center py-16 border border-dashed border-slate-800/80 rounded-xl bg-slate-950/10 mt-2">
                    <p className="text-xs text-slate-500 font-medium">No tickets here</p>
                  </div>
                )}
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
}
