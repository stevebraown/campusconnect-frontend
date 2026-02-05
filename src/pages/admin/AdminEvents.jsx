import { useEffect, useState } from 'react';
import { eventsAPI } from '../../services/api';
import GlassCard from '../../components/ui/GlassCard';
import Icon from '../../components/ui/Icon';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import { Calendar, AlertCircle, CheckCircle, XCircle } from '../../components/ui/icons';

function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('pending');

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const apiFn =
        statusFilter === 'pending'
          ? eventsAPI.getPendingEvents
          : eventsAPI.getAllEvents;
      const result = await apiFn({ status: statusFilter, limit: 50 });
      if (result.success && result.data?.events) {
        setEvents(result.data.events);
      } else {
        setError(result.error?.message || 'Failed to load events');
      }
    } catch (err) {
      console.error('Admin events load error:', err);
      setError(err?.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [statusFilter]);

  const handleApprove = async (id) => {
    try {
      await eventsAPI.approveEvent(id);
      setEvents((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      alert('Error approving event: ' + (err?.message || 'Unknown error'));
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt('Optional: provide a short reason for rejection') || '';
    try {
      await eventsAPI.rejectEvent(id, reason);
      setEvents((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      alert('Error rejecting event: ' + (err?.message || 'Unknown error'));
    }
  };

  const formatDateRange = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return '';
    const sameDay = startDate.toDateString() === endDate.toDateString();
    if (sameDay) {
      return `${startDate.toLocaleDateString()} • ${startDate.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })}–${endDate.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })}`;
    }
    return `${startDate.toLocaleString()} – ${endDate.toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <GlassCard>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Icon icon={Calendar} size={24} className="text-[var(--accent)]" decorative />
            <div>
              <h1 className="text-2xl font-bold text-white">Event Approvals</h1>
              <p className="text-sm text-white/70">
                Review student-created events before they appear in the timetable.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {['pending', 'approved', 'rejected'].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`rounded-full px-3 py-1 text-xs font-semibold border transition-all ${
                  statusFilter === status
                    ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                    : 'bg-white/5 text-white/70 border-white/15 hover:border-white/30'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* List */}
      <GlassCard className="space-y-4">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, idx) => (
              <Skeleton key={idx} className="h-20" />
            ))}
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 text-red-200">
            <Icon icon={AlertCircle} size={18} decorative />
            <span className="text-sm">{error}</span>
          </div>
        ) : events.length === 0 ? (
          <p className="text-sm text-white/70">
            No {statusFilter} events at the moment.
          </p>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <div
                key={event.id}
                className="flex items-start justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {event.title}
                  </p>
                  <p className="text-xs text-white/70 line-clamp-2 mt-1">{event.aim}</p>
                  <p className="mt-2 text-xs text-white/60">
                    {formatDateRange(event.startTime, event.endTime)}
                  </p>
                  {Array.isArray(event.topics) && event.topics.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {event.topics.slice(0, 5).map((topic) => (
                        <span
                          key={topic}
                          className="rounded-full bg-white/10 px-2 py-0.5 text-[0.65rem] text-white/70"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="mt-2 text-[0.65rem] text-white/50">
                    Location: {event.location || '—'}
                  </p>
                  <p className="text-[0.65rem] text-white/50">
                    Created: {event.createdAt || '—'} •{' '}
                    {event.createdByRole === 'admin' ? 'Admin' : 'Student'}-created
                  </p>
                </div>
                <div className="ml-3 flex flex-col items-end gap-2">
                  <p className="text-xs text-white/60">
                    Attendees: {event.attendeesCount || 0}
                  </p>
                  {statusFilter === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleApprove(event.id)}
                        icon={<Icon icon={CheckCircle} size={14} decorative />}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleReject(event.id)}
                        icon={<Icon icon={XCircle} size={14} decorative />}
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}

export default AdminEvents;

