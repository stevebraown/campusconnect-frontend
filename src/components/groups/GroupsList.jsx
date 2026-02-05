// List of approved communities with join actions
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { groupsAPI } from '../../services/api';
import GlassCard from '../ui/GlassCard';
import Skeleton from '../ui/Skeleton';
import Button from '../ui/Button';
import Icon from '../ui/Icon';
import { Users, RefreshCw, AlertCircle, UserPlus, UserMinus } from '../ui/icons';

function GroupsList() {
  const { currentUser } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [joining, setJoining] = useState({});

  const loadGroups = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await groupsAPI.getGroups({ limit: 50 });
      if (result.success && result.data?.groups) {
        setGroups(result.data.groups);
      } else {
        setError(result.error?.message || 'Failed to load communities');
      }
    } catch (err) {
      console.error('Load groups error:', err);
      setError(err?.message || 'Failed to load communities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroups();
  }, []);

  const handleJoin = async (groupId) => {
    if (!currentUser) return;
    setJoining(prev => ({ ...prev, [groupId]: true }));
    try {
      const result = await groupsAPI.joinGroup(groupId);
      if (result.success) {
        await loadGroups(); // Reload to update membership status
      }
    } catch (err) {
      console.error('Join group error:', err);
    } finally {
      setJoining(prev => ({ ...prev, [groupId]: false }));
    }
  };

  const handleLeave = async (groupId) => {
    if (!currentUser) return;
    setJoining(prev => ({ ...prev, [groupId]: true }));
    try {
      const result = await groupsAPI.leaveGroup(groupId);
      if (result.success) {
        await loadGroups(); // Reload to update membership status
      }
    } catch (err) {
      console.error('Leave group error:', err);
    } finally {
      setJoining(prev => ({ ...prev, [groupId]: false }));
    }
  };

  const isMember = (group) => {
    if (!currentUser || !group.members) return false;
    return Array.isArray(group.members) && group.members.includes(currentUser.uid);
  };

  if (loading) {
    return (
      <GlassCard className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon icon={Users} size={20} className="text-[var(--accent)]" decorative />
            <h2 className="text-lg font-semibold text-white">Communities</h2>
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
          <span className="text-sm">Unable to load communities: {error}</span>
        </div>
        <button
          type="button"
          onClick={loadGroups}
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
          <Icon icon={Users} size={20} className="text-[var(--accent)]" decorative />
          <h2 className="text-lg font-semibold text-white">Communities</h2>
        </div>
        <p className="text-xs text-white/60">
          {groups.length} approved {groups.length === 1 ? 'community' : 'communities'}
        </p>
      </div>

      {groups.length === 0 ? (
        <p className="text-sm text-white/60">
          No approved communities yet. Be the first to create one!
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
                  <p className="text-sm font-semibold text-white truncate">{group.title}</p>
                  {group.type && (
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-[0.65rem] uppercase tracking-wide text-white/70">
                      {group.type}
                    </span>
                  )}
                </div>
                <p className="text-xs text-white/70 line-clamp-2">{group.aim}</p>
                {Array.isArray(group.topics) && group.topics.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {group.topics.slice(0, 4).map((topic) => (
                      <span
                        key={topic}
                        className="rounded-full bg-white/10 px-2 py-0.5 text-[0.65rem] text-white/70"
                      >
                        {topic}
                      </span>
                    ))}
                    {group.topics.length > 4 && (
                      <span className="text-[0.65rem] text-white/50">
                        +{group.topics.length - 4} more
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="ml-3 flex flex-col items-end gap-2">
                <div className="text-right">
                  <p className="text-xs text-white/60">
                    {group.membersCount || 0} member{(group.membersCount || 0) === 1 ? '' : 's'}
                  </p>
                  <p className="text-[0.65rem] text-white/40">
                    Created by {group.createdByRole === 'admin' ? 'admin' : 'student'}
                  </p>
                </div>
                {currentUser && (
                  <Button
                    variant={isMember(group) ? 'ghost' : 'primary'}
                    size="sm"
                    icon={<Icon icon={isMember(group) ? UserMinus : UserPlus} size={14} decorative />}
                    onClick={() => isMember(group) ? handleLeave(group.id) : handleJoin(group.id)}
                    disabled={joining[group.id]}
                  >
                    {joining[group.id] ? '...' : isMember(group) ? 'Leave' : 'Join'}
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

export default GroupsList;

