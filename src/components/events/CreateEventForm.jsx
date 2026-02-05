// Form for submitting new events
import { useState } from 'react';
import { eventsAPI } from '../../services/api';
import GlassCard from '../ui/GlassCard';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Icon from '../ui/Icon';
import { Calendar, Plus, AlertCircle, CheckCircle } from '../ui/icons';

function CreateEventForm() {
  // Form fields and submission state
  const [title, setTitle] = useState('');
  const [aim, setAim] = useState('');
  const [topicsInput, setTopicsInput] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Convert comma-separated topics into a list
  const parseTopics = (raw) =>
    raw
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

  // Validate inputs and submit the event
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const topics = parseTopics(topicsInput);

    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    if (!aim.trim()) {
      setError('Aim is required');
      return;
    }
    if (topics.length === 0) {
      setError('Please add at least one topic/tag');
      return;
    }
    if (!startTime) {
      setError('Start date/time is required');
      return;
    }
    if (!endTime) {
      setError('End date/time is required');
      return;
    }
    if (!location.trim()) {
      setError('Location is required');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        title: title.trim(),
        aim: aim.trim(),
        topics,
        startTime,
        endTime,
        location: location.trim(),
      };

      const result = await eventsAPI.createEvent(payload);
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to create event');
      }

      setSuccess(true);
      setTitle('');
      setAim('');
      setTopicsInput('');
      setStartTime('');
      setEndTime('');
      setLocation('');
      setTimeout(() => setSuccess(false), 3500);
    } catch (err) {
      console.error('Create event error:', err);
      setError(err?.message || 'Failed to create event');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <GlassCard className="space-y-6">
      {/* Form header */}
      <div className="flex items-center gap-3">
        <Icon icon={Calendar} size={22} className="text-[var(--accent)]" decorative />
        <div>
          <h2 className="text-xl font-semibold text-white">Create an Event</h2>
          <p className="text-sm text-white/70">
            Share upcoming activities with your cohort. New events require admin approval.
          </p>
        </div>
      </div>

      {/* Form fields */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Event Title"
          placeholder="e.g. Exam Prep Workshop"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
        />

        <label className="block space-y-2 text-sm text-white">
          <span className="font-semibold tracking-tight block text-white">Aim</span>
          <div className="relative rounded-xl border border-white/15 bg-black/30 backdrop-blur-xl focus-within:border-[var(--accent)]/70 focus-within:bg-black/40">
            <textarea
              className="w-full bg-transparent px-4 py-3 text-base text-white placeholder:text-white/50 focus:outline-none rounded-xl resize-none min-h-[80px]"
              placeholder="Briefly describe what this event is about..."
              value={aim}
              onChange={(e) => setAim(e.target.value)}
              maxLength={500}
            />
          </div>
        </label>

        <Input
          label="Topics / Tags"
          placeholder="e.g. revision, maths, wellbeing"
          hint="Separate topics with commas. These power recommendations later."
          value={topicsInput}
          onChange={(e) => setTopicsInput(e.target.value)}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block space-y-2 text-sm text-white">
            <span className="font-semibold tracking-tight block text-white">Start</span>
            <div className="relative rounded-xl border border-white/15 bg-black/30 backdrop-blur-xl focus-within:border-[var(--accent)]/70 focus-within:bg-black/40">
              <input
                type="datetime-local"
                className="w-full bg-transparent px-4 py-3 text-base text-white placeholder:text-white/50 focus:outline-none rounded-xl"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
          </label>

          <label className="block space-y-2 text-sm text-white">
            <span className="font-semibold tracking-tight block text-white">End</span>
            <div className="relative rounded-xl border border-white/15 bg-black/30 backdrop-blur-xl focus-within:border-[var(--accent)]/70 focus-within:bg-black/40">
              <input
                type="datetime-local"
                className="w-full bg-transparent px-4 py-3 text-base text-white placeholder:text-white/50 focus:outline-none rounded-xl"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </label>
        </div>

        <Input
          label="Location"
          placeholder="e.g. Library Building, Room 2.14"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          maxLength={200}
        />

        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            <Icon icon={AlertCircle} size={16} decorative />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2 text-sm text-green-200">
            <Icon icon={CheckCircle} size={16} decorative />
            <span>Your event has been submitted for approval.</span>
          </div>
        )}

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={submitting}
            icon={<Icon icon={Plus} size={18} decorative />}
          >
            {submitting ? 'Submitting…' : 'Submit Event'}
          </Button>
        </div>
      </form>
    </GlassCard>
  );
}

export default CreateEventForm;

