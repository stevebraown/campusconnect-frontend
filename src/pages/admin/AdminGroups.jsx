import { useEffect, useState } from 'react';
import { groupsAPI } from '../../services/api';
import GlassCard from '../../components/ui/GlassCard';
import Icon from '../../components/ui/Icon';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import { Users, AlertCircle, CheckCircle, XCircle } from '../../components/ui/icons';

function AdminGroups() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('pending');

  const loadGroups = async () => {
    try {
      setLoading(true);
      setError(null);
      const apiFn =
        statusFilter === 'pending'
          ? groupsAPI.getPendingGroups
          : groupsAPI.getAllGroups;
      const result = await apiFn({ status: statusFilter, limit: 50 });
      if (result.success && result.data?.groups) {
        setGroups(result.data.groups);
      } else {
        setError(result.error?.message || 'Failed to load groups');
      }
    } catch (err) {
      console.error('Admin groups load error:', err);
      setError(err?.message || 'Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroups();
  }, [statusFilter]);

  const handleApprove = async (id) => {
    try {
      await groupsAPI.approveGroup(id);
      setGroups((prev) => prev.filter((g) => g.id !== id));
    } catch (err) {
      alert('Error approving group: ' + (err?.message || 'Unknown error'));
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt('Optional: provide a short reason for rejection') || '';
    try {
      await groupsAPI.rejectGroup(id, reason);
      setGroups((prev) => prev.filter((g) => g.id !== id));
    } catch (err) {
      alert('Error rejecting group: ' + (err?.message || 'Unknown error'));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <GlassCard>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Icon icon={Users} size={24} className="text-[var(--accent)]" decorative />
            <div>
              <h1 className="text-2xl font-bold text-white">Community Approvals</h1>
              <p className="text-sm text-white/70">
                Review student-created communities before they appear to everyone.
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
        ) : groups.length === 0 ? (
          <p className="text-sm text-white/70">
            No {statusFilter} communities at the moment.
          </p>
        ) : (
          <div className="space-y-3">
            {groups.map((group) => (
              <div
                key={group.id}
                className="flex items-start justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-white truncate">
                      {group.title}
                    </p>
                    {group.type && (
                      <span className="rounded-full bg-white/10 px-2 py-0.5 text-[0.65rem] uppercase tracking-wide text-white/70">
                        {group.type}
                      </span>
                    )}
                    <span className="text-[0.65rem] text-white/50">
                      {group.createdByRole === 'admin' ? 'Admin' : 'Student'}-created
                    </span>
                  </div>
                  <p className="text-xs text-white/70 line-clamp-2">{group.aim}</p>
                  {Array.isArray(group.topics) && group.topics.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {group.topics.slice(0, 5).map((topic) => (
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
                    Created: {group.createdAt || '—'}
                  </p>
                </div>
                <div className="ml-3 flex flex-col items-end gap-2">
                  <p className="text-xs text-white/60">
                    Members: {group.membersCount || 0}
                  </p>
                  {statusFilter === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleApprove(group.id)}
                        icon={<Icon icon={CheckCircle} size={14} decorative />}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleReject(group.id)}
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

export default AdminGroups;

