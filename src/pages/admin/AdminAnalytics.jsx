import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/adminAPI';

function AdminAnalytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await adminAPI.getStats();
        setStats(res.data?.stats);
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    // Refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--accent)]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/15 border border-red-500/30 rounded-lg p-4">
        <p className="font-semibold text-[var(--text-heading)]">Error loading analytics</p>
        <p className="text-sm text-[var(--text-primary)]">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel bg-gradient-to-r from-[var(--accent)]/20 via-[var(--accent-2)]/10 to-[var(--accent)]/20 rounded-lg p-8 border border-[var(--accent)]/30">
        <h1 className="text-4xl font-bold mb-2 text-[var(--text-heading)]">Analytics</h1>
        <p className="text-[var(--text-primary)]">Platform usage and engagement metrics</p>
      </div>

      {/* Key Metrics */}
      {stats && (
        <div className="space-y-6">
          {/* Main Metrics Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="bg-white rounded-lg p-6 shadow border border-campus-gray-200">
              <p className="text-campus-gray-600 text-sm font-semibold">Total Users</p>
              <p className="text-4xl font-bold text-campus-green-600 mt-3">{stats.totalUsers}</p>
              <div className="mt-4 pt-4 border-t border-campus-gray-200">
                <p className="text-xs text-campus-gray-600">
                  <span className="font-semibold text-green-600">{stats.newUsersThisWeek}</span> new this week
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow border border-campus-gray-200">
              <p className="text-campus-gray-600 text-sm font-semibold">Profiles</p>
              <p className="text-4xl font-bold text-blue-600 mt-3">{stats.totalProfiles}</p>
              <div className="mt-4 pt-4 border-t border-campus-gray-200">
                <p className="text-xs text-campus-gray-600">
                  <span className="font-semibold text-blue-600">{stats.profileCompletionRate}%</span> complete
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow border border-campus-gray-200">
              <p className="text-campus-gray-600 text-sm font-semibold">Active Connections</p>
              <p className="text-4xl font-bold text-purple-600 mt-3">{stats.totalConnections}</p>
              <div className="mt-4 pt-4 border-t border-campus-gray-200">
                <p className="text-xs text-campus-gray-600">
                  <span className="font-semibold">Engagement metric</span>
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow border border-campus-gray-200">
              <p className="text-campus-gray-600 text-sm font-semibold">Total Matches</p>
              <p className="text-4xl font-bold text-pink-600 mt-3">{stats.totalMatches}</p>
              <div className="mt-4 pt-4 border-t border-campus-gray-200">
                <p className="text-xs text-campus-gray-600">
                  <span className="font-semibold">Avg per user</span>
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow border border-campus-gray-200">
              <p className="text-campus-gray-600 text-sm font-semibold">Weekly Growth</p>
              <p className="text-4xl font-bold text-orange-600 mt-3">
                {stats.totalUsers > 0 ? ((stats.newUsersThisWeek / stats.totalUsers) * 100).toFixed(1) : 0}%
              </p>
              <div className="mt-4 pt-4 border-t border-campus-gray-200">
                <p className="text-xs text-campus-gray-600">
                  <span className="font-semibold">User growth rate</span>
                </p>
              </div>
            </div>
          </div>

          {/* Insights */}
          <div className="bg-white rounded-lg p-8 shadow border border-campus-gray-200">
            <h2 className="text-xl font-bold text-campus-gray-900 mb-4">Platform Insights</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-campus-gray-50 rounded-lg">
                <span className="text-campus-gray-700">Users with Complete Profiles</span>
                <span className="font-bold text-campus-green-600">{stats.profileCompletionRate}%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-campus-gray-50 rounded-lg">
                <span className="text-campus-gray-700">Average Matches per User</span>
                <span className="font-bold text-blue-600">
                  {stats.totalUsers > 0 ? (stats.totalMatches / stats.totalUsers).toFixed(1) : 0}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-campus-gray-50 rounded-lg">
                <span className="text-campus-gray-700">Connection Success Rate</span>
                <span className="font-bold text-purple-600">
                  {stats.totalMatches > 0 ? ((stats.totalConnections / stats.totalMatches) * 100).toFixed(1) : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminAnalytics;

