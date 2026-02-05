// Recommended communities based on profile interests
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { groupsAPI } from '../../services/api';
import GlassCard from '../ui/GlassCard';
import Skeleton from '../ui/Skeleton';
import Icon from '../ui/Icon';
import Button from '../ui/Button';
import { Users, RefreshCw, AlertCircle, UserPlus, Sparkles } from '../ui/icons';

function RecommendedGroups() {
  const { currentUser } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [joining, setJoining] = useState({});

  const loadRecommended = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      setError(null);
      // AI-driven group recommendations (campusconnect-ai).
      const result = await groupsAPI.getAiRecommendedGroups({ limit: 10 });
      if (result.success && result.data?.groups) {
        setGroups(result.data.groups);
      } else {
        setError(result.error?.message || 'Failed to load recommendations');
      }
    } catch (err) {
      console.error('Load recommended groups error:', err);
      setError(err?.message || 'Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecommended();
  }, [currentUser]);

  const handleJoin = async (groupId) => {
    if (!currentUser) return;
    setJoining(prev => ({ ...prev, [groupId]: true }));
    try {
      const result = await groupsAPI.joinGroup(groupId);
      if (result.success) {
        await loadRecommended(); // Reload to update recommendations
      }
    } catch (err) {
      console.error('Join group error:', err);
    } finally {
      setJoining(prev => ({ ...prev, [groupId]: false }));
    }
  };

  if (!currentUser) {
    return null;
  }

  if (loading) {
    return (
      <GlassCard className="space-y-4">
        <div className="flex items-center gap-2">
          <Icon icon={Sparkles} size={20} className="text-[var(--accent)]" decorative />
          <h2 className="text-lg font-semibold text-white">Recommended for You</h2>
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, idx) => (
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
          <span className="text-sm">Unable to load recommendations: {error}</span>
        </div>
        <button
          type="button"
          onClick={loadRecommended}
          className="inline-flex items-center gap-2 text-xs text-white/70 hover:text-white"
        >
          <Icon icon={RefreshCw} size={14} decorative />
          Retry
        </button>
      </GlassCard>
    );
  }

  if (groups.length === 0) {
    return (
      <GlassCard className="space-y-3">
        <div className="flex items-center gap-2">
          <Icon icon={Sparkles} size={20} className="text-[var(--accent)]" decorative />
          <h2 className="text-lg font-semibold text-white">Recommended for You</h2>
        </div>
        <p className="text-sm text-white/60">
          No recommendations available. Complete your profile with interests to get personalized suggestions!
        </p>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon icon={Sparkles} size={20} className="text-[var(--accent)]" decorative />
          <h2 className="text-lg font-semibold text-white">Recommended for You</h2>
        </div>
        <p className="text-xs text-white/60">
          {groups.length} {groups.length === 1 ? 'suggestion' : 'suggestions'}
        </p>
      </div>

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
              </div>
              <Button
                variant="primary"
                size="sm"
                icon={<Icon icon={UserPlus} size={14} decorative />}
                onClick={() => handleJoin(group.id)}
                disabled={joining[group.id]}
              >
                {joining[group.id] ? '...' : 'Join'}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

export default RecommendedGroups;
