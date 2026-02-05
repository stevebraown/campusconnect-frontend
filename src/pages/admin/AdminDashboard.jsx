import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/adminAPI';
import GlassCard from '../../components/ui/GlassCard';
import Skeleton from '../../components/ui/Skeleton';
import Icon from '../../components/ui/Icon';
import { CheckCircle, AlertCircle } from '../../components/ui/icons';

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsRes, healthRes] = await Promise.all([
          adminAPI.getStats(),
          adminAPI.getSystemHealth(),
        ]);

        setStats(statsRes.data?.stats);
        setHealth(healthRes.data);
      } catch (err) {
        console.error('Error fetching admin data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <GlassCard>
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-4 w-96" />
        </GlassCard>
        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
          {Array.from({ length: 5 }).map((_, idx) => (
            <Skeleton key={idx} className="h-32" />
          ))}
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, idx) => (
            <Skeleton key={idx} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/15 border border-red-500/30 rounded-lg p-4">
        <p className="font-semibold text-[var(--text-heading)]">Error loading admin dashboard</p>
        <p className="text-sm text-[var(--text-primary)]">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <GlassCard className="bg-gradient-to-r from-[var(--accent)]/20 via-[var(--accent-2)]/10 to-[var(--accent)]/20 p-8 border-[var(--accent)]/30">
        <h1 className="text-4xl font-bold mb-2 text-white">Admin Dashboard</h1>
        <p className="text-white/70">System overview and statistics</p>
      </GlassCard>

      {/* System Health */}
      {health && (
        <GlassCard>
          <h2 className="text-xl font-bold mb-4 text-white">System Health</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <GlassCard className="p-4 bg-emerald-500/10 border-emerald-500/30">
              <p className="text-sm text-white/60 font-semibold">Status</p>
              <div className="flex items-center gap-2 mt-1">
                {health.status === 'healthy' ? (
                  <>
                    <Icon icon={CheckCircle} size={20} className="text-[var(--accent)]" decorative />
                    <p className="text-lg font-bold text-[var(--accent)]">Healthy</p>
                  </>
                ) : (
                  <>
                    <Icon icon={AlertCircle} size={20} className="text-red-400" decorative />
                    <p className="text-lg font-bold text-red-400">Issues</p>
                  </>
                )}
              </div>
            </GlassCard>
            <GlassCard className="p-4 bg-blue-500/10 border-blue-500/30">
              <p className="text-sm text-white/60 font-semibold">Uptime</p>
              <p className="text-lg font-bold text-white mt-1">{(health.uptime / 3600).toFixed(1)}h</p>
            </GlassCard>
            <GlassCard className="p-4 bg-purple-500/10 border-purple-500/30">
              <p className="text-sm text-white/60 font-semibold">Memory</p>
              <p className="text-lg font-bold text-white mt-1">{health.memory.used}</p>
            </GlassCard>
            <GlassCard className="p-4 bg-indigo-500/10 border-indigo-500/30">
              <p className="text-sm text-white/60 font-semibold">Timestamp</p>
              <p className="text-sm font-mono text-white/80 mt-1">
                {new Date(health.timestamp).toLocaleTimeString()}
              </p>
            </GlassCard>
          </div>
        </GlassCard>
      )}

      {/* Statistics Grid */}
      {stats && (
        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
          <GlassCard>
            <p className="text-white/60 text-sm font-semibold">Total Users</p>
            <p className="text-3xl font-bold text-[var(--accent)] mt-2">{stats.totalUsers}</p>
            <p className="text-white/60 text-xs mt-2">
              {stats.newUsersThisWeek} new this week
            </p>
          </GlassCard>

          <GlassCard>
            <p className="text-white/60 text-sm font-semibold">Profiles</p>
            <p className="text-3xl font-bold text-white mt-2">{stats.totalProfiles}</p>
            <p className="text-white/60 text-xs mt-2">
              {stats.profileCompletionRate}% complete
            </p>
          </GlassCard>

          <GlassCard>
            <p className="text-white/60 text-sm font-semibold">Connections</p>
            <p className="text-3xl font-bold text-white mt-2">{stats.totalConnections}</p>
            <p className="text-white/60 text-xs mt-2">active connections</p>
          </GlassCard>

          <GlassCard>
            <p className="text-white/60 text-sm font-semibold">Matches</p>
            <p className="text-3xl font-bold text-white mt-2">{stats.totalMatches}</p>
            <p className="text-white/60 text-xs mt-2">total matches</p>
          </GlassCard>

          <GlassCard>
            <p className="text-white/60 text-sm font-semibold">Growth</p>
            <p className="text-3xl font-bold text-[var(--accent)] mt-2">
              {stats.totalUsers > 0 ? ((stats.newUsersThisWeek / stats.totalUsers) * 100).toFixed(1) : 0}%
            </p>
            <p className="text-white/60 text-xs mt-2">weekly growth</p>
          </GlassCard>
        </div>
      )}

      {/* Quick Links */}
      <div className="grid md:grid-cols-2 gap-6">
        <Link
          to="/admin/users"
          className="block"
        >
          <GlassCard className="hover:bg-white/10 transition p-6">
            <h3 className="text-lg font-bold text-white">Manage Users</h3>
            <p className="text-white/70 text-sm mt-2">View, edit, or disable user accounts</p>
            <p className="text-[var(--accent)] font-semibold mt-4">→ Go to Users</p>
          </GlassCard>
        </Link>

        <Link
          to="/admin/settings"
          className="block"
        >
          <GlassCard className="hover:bg-white/10 transition p-6">
            <h3 className="text-lg font-bold text-white">System Settings</h3>
            <p className="text-white/70 text-sm mt-2">Configure platform features and modes</p>
            <p className="text-[var(--accent)] font-semibold mt-4">→ Go to Settings</p>
          </GlassCard>
        </Link>
      </div>
    </div>
  );
}

export default AdminDashboard;

