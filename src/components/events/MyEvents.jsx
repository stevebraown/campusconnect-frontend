// List of events the user has RSVP'd to
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { eventsAPI } from '../../services/api';
import { onEventCreated, offEventCreated, onEventUpdated, offEventUpdated } from '../../services/socket';
import GlassCard from '../ui/GlassCard';
import Skeleton from '../ui/Skeleton';
import Button from '../ui/Button';
import Icon from '../ui/Icon';
import { Calendar, RefreshCw, AlertCircle, XCircle } from '../ui/icons';

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

function MyEvents() {
  const { currentUser } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [withdrawing, setWithdrawing] = useState({});

  const loadEvents = useCallback(async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      setError(null);
      const result = await eventsAPI.getMyEvents({ limit: 50 });
      if (result.success && result.data?.events) {
        setEvents(result.data.events);
      } else {
        setError(result.error?.message || 'Failed to load your events');
      }
    } catch (err) {
      console.error('Load my events error:', err);
      setError(err?.message || 'Failed to load your events');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) loadEvents();
  }, [currentUser, loadEvents]);

  useEffect(() => {
    if (!currentUser) return;
    const handleEventCreated = () => loadEvents();
    const handleEventUpdated = () => loadEvents();
    onEventCreated(handleEventCreated);
    onEventUpdated(handleEventUpdated);
    return () => {
      offEventCreated(handleEventCreated);
      offEventUpdated(handleEventUpdated);
    };
  }, [currentUser, loadEvents]);

  const handleWithdraw = async (eventId) => {
    if (!currentUser) return;
    setWithdrawing(prev => ({ ...prev, [eventId]: true }));
    try {
      const result = await eventsAPI.withdrawFromEvent(eventId);
      if (result.success) {
        await loadEvents(); // Reload to update RSVP status
      }
    } catch (err) {
      console.error('Withdraw RSVP error:', err);
    } finally {
      setWithdrawing(prev => ({ ...prev, [eventId]: false }));
    }
  };

  if (!currentUser) {
    return null;
  }

  if (loading) {
    return (
      <GlassCard className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon icon={Calendar} size={20} className="text-[var(--accent)]" decorative />
            <h2 className="text-lg font-semibold text-white">My Events</h2>
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
          <span className="text-sm">Unable to load your events: {error}</span>
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
          <h2 className="text-lg font-semibold text-white">My Events</h2>
        </div>
        <p className="text-xs text-white/60">
          {events.length} {events.length === 1 ? 'event' : 'events'}
        </p>
      </div>

      {events.length === 0 ? (
        <p className="text-sm text-white/60">
          You haven't RSVP'd to any events yet. Explore available events to get started!
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
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<Icon icon={XCircle} size={14} decorative />}
                  onClick={() => handleWithdraw(event.id)}
                  disabled={withdrawing[event.id]}
                >
                  {withdrawing[event.id] ? '...' : 'Withdraw'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}

export default MyEvents;
