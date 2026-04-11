import { useMemo } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

/**
 * Kanban Board Component
 * Displays tickets in 3 columns (todo, in_progress, done)
 * Supports drag-and-drop to update ticket status
 */
export default function KanbanBoard({ tickets = [], onStatusChange, loading = false }) {
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

    // If dropped outside a droppable area
    if (!destination) {
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
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-slate-600">Loading board...</p>
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
                className={`min-h-96 rounded-lg p-4 transition ${
                  snapshot.isDraggingOver
                    ? 'bg-blue-50 border-2 border-blue-400'
                    : 'bg-slate-100 border-2 border-transparent'
                }`}
              >
                <h3 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
                  {column.title}
                  <span className="bg-slate-300 text-slate-700 text-xs font-semibold px-2 py-1 rounded-full">
                    {column.tickets.length}
                  </span>
                </h3>

                <div className="space-y-3">
                  {column.tickets.map((ticket, index) => (
                    <Draggable key={ticket.id} draggableId={ticket.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`bg-white p-4 rounded-lg border-l-4 cursor-move transition ${
                            snapshot.isDragging
                              ? 'shadow-lg scale-105 opacity-50'
                              : 'shadow hover:shadow-md'
                          } ${
                            ticket.priority === 'critical'
                              ? 'border-red-500'
                              : ticket.priority === 'high'
                              ? 'border-orange-500'
                              : ticket.priority === 'medium'
                              ? 'border-yellow-500'
                              : 'border-green-500'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <h4 className="font-semibold text-slate-900 text-sm line-clamp-2">
                                {ticket.title}
                              </h4>
                              <p className="text-xs text-slate-500 mt-1">
                                {ticket.type} •{' '}
                                {new Date(ticket.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          <div className="mt-3 flex gap-2 flex-wrap items-center">
                            <span
                              className={`text-xs font-medium px-2 py-1 rounded ${
                                ticket.priority === 'critical'
                                  ? 'bg-red-100 text-red-700'
                                  : ticket.priority === 'high'
                                  ? 'bg-orange-100 text-orange-700'
                                  : ticket.priority === 'medium'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-green-100 text-green-700'
                              }`}
                            >
                              {ticket.priority}
                            </span>
                            {ticket.assignee_name && (
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                👤 {ticket.assignee_name}
                              </span>
                            )}
                          </div>

                          {ticket.comment_count > 0 && (
                            <div className="mt-2 text-xs text-slate-500 flex items-center gap-1">
                              💬 {ticket.comment_count} comment{ticket.comment_count !== 1 ? 's' : ''}
                            </div>
                          )}
                        </div>
                      )}
                    </Draggable>
                  ))}

                  {provided.placeholder}
                </div>

                {column.tickets.length === 0 && !provided.placeholder && (
                  <div className="text-center py-12 text-slate-400">
                    <p className="text-sm">No tickets here</p>
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
