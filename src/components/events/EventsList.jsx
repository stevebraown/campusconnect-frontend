// List of approved events with RSVP actions
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { eventsAPI } from '../../services/api';
import GlassCard from '../ui/GlassCard';
import Skeleton from '../ui/Skeleton';
import Button from '../ui/Button';
import Icon from '../ui/Icon';
import { Calendar, RefreshCw, AlertCircle, CheckCircle, XCircle } from '../ui/icons';

function formatDateRange(start, end) {
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
}

function EventsList() {
  const { currentUser } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rsvping, setRsvping] = useState({});

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await eventsAPI.getEvents({ limit: 50 });
      if (result.success && result.data?.events) {
        setEvents(result.data.events);
      } else {
        setError(result.error?.message || 'Failed to load events');
      }
    } catch (err) {
      console.error('Load events error:', err);
      setError(err?.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleRSVP = async (eventId) => {
    if (!currentUser) return;
    setRsvping(prev => ({ ...prev, [eventId]: true }));
    try {
      const result = await eventsAPI.rsvpToEvent(eventId);
      if (result.success) {
        await loadEvents(); // Reload to update RSVP status
      }
    } catch (err) {
      console.error('RSVP error:', err);
    } finally {
      setRsvping(prev => ({ ...prev, [eventId]: false }));
    }
  };

  const handleWithdraw = async (eventId) => {
    if (!currentUser) return;
    setRsvping(prev => ({ ...prev, [eventId]: true }));
    try {
      const result = await eventsAPI.withdrawFromEvent(eventId);
      if (result.success) {
        await loadEvents(); // Reload to update RSVP status
      }
    } catch (err) {
      console.error('Withdraw RSVP error:', err);
    } finally {
      setRsvping(prev => ({ ...prev, [eventId]: false }));
    }
  };

  const isRSVPd = (event) => {
    if (!currentUser || !event.attendees) return false;
    return Array.isArray(event.attendees) && event.attendees.includes(currentUser.uid);
  };

  if (loading) {
    return (
      <GlassCard className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon icon={Calendar} size={20} className="text-[var(--accent)]" decorative />
            <h2 className="text-lg font-semibold text-white">Upcoming Events</h2>
          </div>
        </div>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, idx) => (
            <Skeleton key={idx} className="h-16" />
          ))}
        </div>
      </GlassCard>
    );
  }

  if (error) {
    return (
      <GlassCard className="space-y-3">
        <div className="flex items-center gap-2 text-red-200">
          <Icon icon={AlertCircle} size={18} decorative />
          <span className="text-sm">Unable to load events: {error}</span>
        </div>
        <button
          type="button"
          onClick={loadEvents}
          className="inline-flex items-center gap-2 text-xs text-white/70 hover:text-white"
        >
          <Icon icon={RefreshCw} size={14} decorative />
          Retry
        </button>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon icon={Calendar} size={20} className="text-[var(--accent)]" decorative />
          <h2 className="text-lg font-semibold text-white">Upcoming Events</h2>
        </div>
        <p className="text-xs text-white/60">
          {events.length} approved {events.length === 1 ? 'event' : 'events'}
        </p>
      </div>

      {events.length === 0 ? (
        <p className="text-sm text-white/60">
          No approved events yet. Be the first to create one!
        </p>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <div
              key={event.id}
              className="flex items-start justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{event.title}</p>
                <p className="mt-1 text-xs text-white/70 line-clamp-2">{event.aim}</p>
                <p className="mt-2 text-xs text-white/60">
                  {formatDateRange(event.startTime, event.endTime)}
                </p>
                {Array.isArray(event.topics) && event.topics.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {event.topics.slice(0, 4).map((topic) => (
                      <span
                        key={topic}
                        className="rounded-full bg-white/10 px-2 py-0.5 text-[0.65rem] text-white/70"
                      >
                        {topic}
                      </span>
                    ))}
                    {event.topics.length > 4 && (
                      <span className="text-[0.65rem] text-white/50">
                        +{event.topics.length - 4} more
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="ml-3 flex flex-col items-end gap-2">
                <div className="text-right">
                  <p className="text-xs text-white/60">{event.location}</p>
                  <p className="text-xs text-white/60">
                    {event.attendeesCount || 0} attendee
                    {(event.attendeesCount || 0) === 1 ? '' : 's'}
                  </p>
                  <p className="text-[0.65rem] text-white/40">
                    Created by {event.createdByRole === 'admin' ? 'admin' : 'student'}
                  </p>
                </div>
                {currentUser && (
                  <Button
                    variant={isRSVPd(event) ? 'ghost' : 'primary'}
                    size="sm"
                    icon={<Icon icon={isRSVPd(event) ? XCircle : CheckCircle} size={14} decorative />}
                    onClick={() => isRSVPd(event) ? handleWithdraw(event.id) : handleRSVP(event.id)}
                    disabled={rsvping[event.id]}
                  >
                    {rsvping[event.id] ? '...' : isRSVPd(event) ? 'Withdraw' : 'RSVP'}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}

export default EventsList;

