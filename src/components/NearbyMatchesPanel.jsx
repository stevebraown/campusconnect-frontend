// Panel showing nearby match recommendations
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { matchAPI } from '../services/api';
import GlassCard from './ui/GlassCard';
import Skeleton from './ui/Skeleton';
import Icon from './ui/Icon';
import { MapPin, Users } from './ui/icons';

function NearbyMatchesPanel() {
  const { currentUser } = useAuth();
  const [nearbyMatches, setNearbyMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNearbyMatches = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Fetch AI-driven nearby matches with a 5km radius (campusconnect-ai).
        const result = await matchAPI.proposeMatches({
          preferences: { radiusMeters: 5000, minScore: 0 },
        });
        
        if (result.success && result.data?.matches) {
          // Filter and limit to nearby matches
          const matches = result.data.matches
            // Normalize AI distance fields (km preferred).
            .filter(m => (m.distanceKm ?? m.distance) !== undefined && (m.distanceKm ?? m.distance) <= 5)
            .slice(0, 5)
            .map(m => ({
              id: m.userId || m.uid || m.id,
              name: m.profile?.name || m.user?.name || 'Student',
              major: m.profile?.major || m.user?.major || '',
              distance: (m.distanceKm ?? m.distance) !== undefined ? `${(m.distanceKm ?? m.distance).toFixed(1)} km` : null,
              compatibility: m.compatibility ?? m.score ?? 0,
            }));
          
          setNearbyMatches(matches);
        } else {
          setNearbyMatches([]);
        }
      } catch (err) {
        console.error('Error fetching nearby matches:', err);
        setError(err?.error?.message || err?.message || 'Failed to load nearby matches');
        setNearbyMatches([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNearbyMatches();
  }, [currentUser]);

  if (loading) {
    return (
      <GlassCard>
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <Skeleton key={idx} className="h-16" />
          ))}
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard>
      <div className="flex items-center gap-2 mb-4">
        <Icon icon={MapPin} size={18} className="text-[var(--accent)]" decorative />
        <h3 className="text-lg font-semibold text-white">Nearby Matches</h3>
      </div>

      {error && (
        <p className="text-sm text-white/60 mb-4">
          Unable to load nearby matches. Make sure location sharing is enabled.
        </p>
      )}

      {nearbyMatches.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Icon icon={Users} size={32} className="text-white/30 mb-2" decorative />
          <p className="text-sm text-white/60">No nearby matches found</p>
          <p className="text-xs text-white/50 mt-1">
            Enable location sharing to discover students nearby
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {nearbyMatches.map((match) => (
            <div
              key={match.id}
              className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {match.name}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  {match.major && (
                    <p className="text-xs text-white/60">{match.major}</p>
                  )}
                  {match.distance && (
                    <>
                      <span className="text-white/40">•</span>
                      <p className="text-xs text-white/60">{match.distance}</p>
                    </>
                  )}
                </div>
              </div>
              {match.compatibility > 0 && (
                <div className="ml-3 text-right">
                  <p className="text-xs font-semibold text-[var(--accent)]">
                    {Math.round(match.compatibility)}%
                  </p>
                  <p className="text-xs text-white/50">match</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}

export default NearbyMatchesPanel;
