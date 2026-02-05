// Form for creating a new community group
import { useState } from 'react';
import { groupsAPI } from '../../services/api';
import GlassCard from '../ui/GlassCard';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Icon from '../ui/Icon';
import { Users, Plus, AlertCircle, CheckCircle } from '../ui/icons';

// Supported community types
const GROUP_TYPES = [
  { value: 'course', label: 'Course' },
  { value: 'interest', label: 'Interest' },
  { value: 'support', label: 'Support' },
];

function CreateGroupForm() {
  // Form fields and submission state
  const [title, setTitle] = useState('');
  const [aim, setAim] = useState('');
  const [topicsInput, setTopicsInput] = useState('');
  const [type, setType] = useState('interest');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Convert comma-separated topics into a list
  const parseTopics = (raw) =>
    raw
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

  // Validate inputs and submit the community
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
      setError('Aim / purpose is required');
      return;
    }

    if (topics.length === 0) {
      setError('Please add at least one topic/tag');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        title: title.trim(),
        aim: aim.trim(),
        topics,
        type,
      };

      const result = await groupsAPI.createGroup(payload);
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to create community');
      }

      setSuccess(true);
      setTitle('');
      setAim('');
      setTopicsInput('');
      setType('interest');
      setTimeout(() => setSuccess(false), 3500);
    } catch (err) {
      console.error('Create group error:', err);
      setError(err?.message || 'Failed to create community');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <GlassCard className="space-y-6">
      {/* Form header */}
      <div className="flex items-center gap-3">
        <Icon icon={Users} size={22} className="text-[var(--accent)]" decorative />
        <div>
          <h2 className="text-xl font-semibold text-white">Create a Community</h2>
          <p className="text-sm text-white/70">
            Start a course, interest, or support community. New communities require admin approval.
          </p>
        </div>
      </div>

      {/* Form fields */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Community Title"
          placeholder="e.g. First Year Computer Science Study Group"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
        />

        <label className="block space-y-2 text-sm text-white">
          <span className="font-semibold tracking-tight block text-white">Aim / Purpose</span>
          <div className="relative rounded-xl border border-white/15 bg-black/30 backdrop-blur-xl focus-within:border-[var(--accent)]/70 focus-within:bg-black/40">
            <textarea
              className="w-full bg-transparent px-4 py-3 text-base text-white placeholder:text-white/50 focus:outline-none rounded-xl resize-none min-h-[80px]"
              placeholder="Briefly describe what this community is for..."
              value={aim}
              onChange={(e) => setAim(e.target.value)}
              maxLength={500}
            />
          </div>
        </label>

        <Input
          label="Topics / Tags"
          placeholder="e.g. algorithms, fresher support, exam prep"
          hint="Separate topics with commas. These power recommendations later."
          value={topicsInput}
          onChange={(e) => setTopicsInput(e.target.value)}
        />

        <label className="block space-y-2 text-sm text-white">
          <span className="font-semibold tracking-tight block text-white">Community Type</span>
          <div className="flex flex-wrap gap-2">
            {GROUP_TYPES.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setType(opt.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  type === opt.value
                    ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                    : 'bg-white/5 text-white/70 border-white/15 hover:border-white/30'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </label>

        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            <Icon icon={AlertCircle} size={16} decorative />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2 text-sm text-green-200">
            <Icon icon={CheckCircle} size={16} decorative />
            <span>Your community has been submitted for approval.</span>
          </div>
        )}

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={submitting}
            icon={<Icon icon={Plus} size={18} decorative />}
          >
            {submitting ? 'Submitting…' : 'Submit Community'}
          </Button>
        </div>
      </form>
    </GlassCard>
  );
}

export default CreateGroupForm;

