import { useEffect, useState } from 'react';
import * as activityApi from '../../api/activity.api';
import useAuth from '../../hooks/useAuth';

export default function ActivityFeed({ projectId }) {
  const { token } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        setLoading(true);
        const data = await activityApi.getProjectActivity(token, projectId, { limit: 15 });
        setActivities(data.activity || []);
      } catch (err) {
        setError(err.message || 'Failed to load activity feed');
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [projectId, token]);

  const formatActivityMessage = (activity) => {
    const userName = activity.user_name || 'System';
    const details = activity.details || {};
    const entityType = activity.entity_type;
    const action = activity.action_type;

    switch (entityType) {
      case 'project':
        if (action === 'created') return `created the project "${details.title || 'Unknown'}"`;
        if (action === 'updated') return `updated project settings`;
        return `deleted the project`;
      case 'ticket':
        if (action === 'created') return `created ticket "${details.title || 'Unknown'}"`;
        if (action === 'updated') {
          const updatedFields = Object.keys(details).filter(k => k !== 'updated_at');
          if (updatedFields.length > 0) {
            return `updated ticket "${details.title || 'Unknown'}" (${updatedFields.join(', ')})`;
          }
          return `updated ticket "${details.title || 'Unknown'}"`;
        }
        if (action === 'status_changed') {
          const fromStatus = details.from === 'in_progress' ? 'In Progress' : (details.from || 'Todo').toUpperCase();
          const toStatus = details.to === 'in_progress' ? 'In Progress' : (details.to || 'Todo').toUpperCase();
          return `moved ticket "${details.title || 'Unknown'}" from ${fromStatus} to ${toStatus}`;
        }
        if (action === 'deleted') return `deleted a ticket`;
        return `modified a ticket`;
      case 'comment':
        if (action === 'created' || action === 'commented') return `commented on ticket`;
        if (action === 'deleted') return `deleted a comment`;
        return `modified a comment`;
      case 'member':
        if (action === 'created') return `added ${details.email || 'a user'} as ${details.role || 'developer'}`;
        if (action === 'deleted') return `removed a member (${details.email || 'Unknown'})`;
        return `updated member role`;
      default:
        return `performed action ${action} on ${entityType}`;
    }
  };

  const getIcon = (entityType, action) => {
    if (entityType === 'ticket') {
      if (action === 'status_changed') return '🔄';
      return '🎫';
    }
    if (entityType === 'comment') return '💬';
    if (entityType === 'member') return '👤';
    if (entityType === 'project') return '📁';
    return '⚡';
  };

  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <div className="w-6 h-6 border-2 border-indigo-400 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return <p className="text-red-400 text-sm py-4">{error}</p>;
  }

  if (activities.length === 0) {
    return <p className="text-slate-400 text-sm py-4 text-center">No recent activities log.</p>;
  }

  return (
    <div className="flow-root max-h-[400px] overflow-y-auto pr-1">
      <ul className="-mb-8">
        {activities.map((activity, idx) => (
          <li key={activity.id}>
            <div className="relative pb-8">
              {idx !== activities.length - 1 && (
                <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-800" aria-hidden="true" />
              )}
              <div className="relative flex space-x-3">
                <div>
                  <span className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-sm ring-8 ring-slate-900 border border-slate-700">
                    {getIcon(activity.entity_type, activity.action_type)}
                  </span>
                </div>
                <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                  <div>
                    <p className="text-sm text-slate-300">
                      <span className="font-semibold text-slate-100">{activity.user_name}</span>{' '}
                      {formatActivityMessage(activity)}
                    </p>
                  </div>
                  <div className="text-right text-xs whitespace-nowrap text-slate-500 pt-0.5">
                    {new Date(activity.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
