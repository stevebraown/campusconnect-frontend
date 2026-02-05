import { useEffect, useState } from 'react';
import { userAPI } from '../services/api';
import GlassCard from '../components/ui/GlassCard';
import Icon from '../components/ui/Icon';
import { Key } from '../components/ui/icons';

function formatSwifinId(rawId) {
  if (!rawId) return null;
  const cleaned = String(rawId).replace(/\s+/g, '');
  if (cleaned.length !== 16) return cleaned;
  return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 8)} ${cleaned.slice(8, 12)} ${cleaned.slice(12, 16)}`;
}

function SwifinComingSoon() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [swifinId, setSwifinId] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await userAPI.getProfile();
        if (result.success && result.data?.user) {
          setSwifinId(result.data.user.swifinId || null);
        } else {
          setSwifinId(null);
        }
      } catch (err) {
        console.error('Error loading Swifin ID:', err);
        setError('Unable to load your Swifin ID right now.');
        setSwifinId(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const formattedId = formatSwifinId(swifinId);

  return (
    <div className="max-w-3xl mx-auto mt-8 space-y-6">
      {/* Header */}
      <GlassCard>
        <div className="flex items-center gap-3 mb-2">
          <Icon icon={Key} size={24} className="text-[var(--accent)]" decorative />
          <div>
            <h1 className="text-2xl font-bold text-white">Swifin Solutions (Coming Soon)</h1>
            <p className="text-sm text-white/70 mt-1">
              In future, CampusConnect will connect to additional solutions using your Swifin ID.
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Content */}
      <GlassCard>
        <div className="space-y-4">
          {loading && (
            <p className="text-sm text-white/70">Loading your Swifin ID…</p>
          )}

          {!loading && error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          {!loading && !error && (
            <>
              <div>
                <p className="text-sm text-white/70 mb-1">Your Swifin ID</p>
                {formattedId ? (
                  <p className="text-lg font-mono tracking-[0.28em] text-white bg-white/5 border border-white/10 rounded-lg px-4 py-3 inline-block">
                    {formattedId}
                  </p>
                ) : (
                  <p className="text-sm text-white/70">
                    Your Swifin ID has not been assigned yet.
                  </p>
                )}
              </div>

              <p className="text-xs text-white/60 pt-2 border-t border-white/10 mt-4">
                Coming soon – no actions available yet. This screen is for information only and does not
                connect to any external services.
              </p>
            </>
          )}
        </div>
      </GlassCard>
    </div>
  );
}

export default SwifinComingSoon;

