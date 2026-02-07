// List view for the user's active connections
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getUserConnections } from '../../services/connectionService';
import GlassCard from '../ui/GlassCard';
import EmptyState from '../ui/EmptyState';
import Skeleton from '../ui/Skeleton';
import Icon from '../ui/Icon';
import { Handshake } from '../ui/icons';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const getProfileById = async (uid, token) => {
  const res = await fetch(`${API_BASE_URL}/api/users/${uid}/profile`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  if (!res.ok) {
    return { success: false, profile: null };
  }

  const data = await res.json().catch(() => ({}));
  return data?.success ? { success: true, profile: data.profile } : { success: false, profile: null };
};

function ConnectionsList({ onUserClick }) {
  const { currentUser, token } = useAuth();
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadConnections = async () => {
    setLoading(true);
    const result = await getUserConnections(currentUser.uid);

    if (result.success) {
      // Load full profiles for each connection
      const connectionsWithProfiles = await Promise.all(
        result.connections.map(async (conn) => {
          const profileResult = await getProfileById(conn.connectedUserId, token);
          return {
            ...conn,
            profile: profileResult.profile,
          };
        })
      );

      setConnections(connectionsWithProfiles);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (currentUser) {
      loadConnections();
    }
  }, [currentUser]);

  if (!currentUser) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto mt-8">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <Icon icon={Handshake} size={24} className="text-[var(--accent)]" decorative />
          My Connections
        </h2>
        <p className="text-white/70">
          Students you're connected with
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <Skeleton key={idx} className="h-24" />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && connections.length === 0 && (
        <EmptyState
          icon={Handshake}
          title="No Connections Yet"
          description="Start connecting with students to build your network!"
          actionLabel="Browse Students"
          action={() => window.location.href = '/directory'}
        />
      )}

      {/* Connections Grid */}
      {!loading && connections.length > 0 && (
        <>
          {/* Count */}
          <GlassCard className="mb-6">
            <p className="text-white/80">
              You have{' '}
              <span className="font-bold text-[var(--accent)] text-2xl">
                {connections.length}
              </span>{' '}
              {connections.length === 1 ? 'connection' : 'connections'}
            </p>
          </GlassCard>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {connections.map((connection) => {
              const profile = connection.profile;
              if (!profile || !profile.name) return null;

              return (
                <GlassCard
                  key={connection.id}
                  className="cursor-pointer hover:bg-white/10 transition-all"
                  onClick={() => onUserClick && onUserClick(profile)}
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-16 h-16 bg-gradient-to-br from-campus-green-400 to-campus-green-600 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                      {profile.name.charAt(0).toUpperCase()}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-white truncate">
                        {profile.name}
                      </h3>
                      <p className="text-sm text-white/70 truncate">
                        {profile.major || 'Major not specified'}
                      </p>
                      <p className="text-xs text-white/60 mt-1">
                        {profile.year}
                      </p>

                      {/* Common Interests Preview */}
                      {profile.interests && profile.interests.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {profile.interests.slice(0, 2).map((interest, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-[var(--accent)]/20 text-[var(--accent)] rounded-full text-xs border border-[var(--accent)]/30"
                            >
                              {interest}
                            </span>
                          ))}
                          {profile.interests.length > 2 && (
                            <span className="px-2 py-1 bg-white/10 text-white/70 rounded-full text-xs border border-white/10">
                              +{profile.interests.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Connected Since */}
                  <div className="mt-4 pt-4 border-t border-white/10 text-xs text-white/60 text-center">
                    Connected {new Date(connection.acceptedAt || connection.createdAt).toLocaleDateString()}
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default ConnectionsList;