// Main dashboard view for signed-in users
import { useState, useEffect, useContext, useCallback } from 'react';
import StatsCards from './StatsCards';
import { onConnectionRequestReceived, offConnectionRequestReceived, onConnectionAccepted, offConnectionAccepted, onEventCreated, offEventCreated, onEventUpdated, offEventUpdated } from '../../services/socket';
import ActivityFeed from './ActivityFeed';
import QuickActions from './QuickActions';
import MatchesSummary from './MatchesSummary';
import RecentConnections from './RecentConnections';
import OnboardingBanner from '../OnboardingBanner';
import NearbyMatchesPanel from '../NearbyMatchesPanel';
import AuthContext from '../../context/AuthContext';
import GlassCard from '../ui/GlassCard';
import Skeleton from '../ui/Skeleton';
import { userAPI, matchAPI, connectionsAPI, eventsAPI } from '../../services/api';

function Dashboard() {
  const { currentUser } = useContext(AuthContext);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      profileCompletion: 0,
      activeMatches: 0,
      pendingConnections: 0,
      eventsAttending: 0,
    },
    recentActivity: [],
    topMatches: [],
    recentConnections: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    try {
        setLoading(true);
        setError(null);

        // Fetch user profile
        const profileRes = await userAPI.getProfile();
        if (profileRes.success === false) throw new Error(profileRes.error?.message || 'Profile load failed');
        const userProfile = profileRes.data?.profile || {};

        // Fetch AI-driven match proposals (campusconnect-ai).
        const recommendationsRes = await matchAPI.proposeMatches({
          // AI preferences can be tuned without changing student UI.
          preferences: { radiusMeters: 200000, minScore: 30 },
        });
        if (recommendationsRes.success === false) throw new Error(recommendationsRes.error?.message || 'Recommendations load failed');
        const rawMatches = recommendationsRes.data?.matches || [];
        const matches = rawMatches.map((m, idx) => {
          // Normalize AI response shape into existing UI fields.
          const profile = m.profile || m.user || m.data || {};
          const name = profile.name || 'Match';
          return {
            id: m.userId || m.uid || m.id || `match-${idx}`,
            name,
            major: profile.major || 'Unknown major',
            year: profile.year || '',
            compatibility: m.compatibility ?? m.score ?? 0,
            interests: Array.isArray(profile.interests) ? profile.interests : [],
            imageUrl:
              profile.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
          };
        });

        // Fetch connection requests
        const requestsRes = await connectionsAPI.getRequests();
        if (requestsRes.success === false) throw new Error(requestsRes.error?.message || 'Requests load failed');
        const pendingRequests = requestsRes.data?.requests || [];

        // Fetch connections
        const connectionsRes = await connectionsAPI.getConnections();
        if (connectionsRes.success === false) throw new Error(connectionsRes.error?.message || 'Connections load failed');
        const connections = connectionsRes.data?.connections || [];

        // Fetch my events (RSVP'd) for eventsAttending count
        const myEventsRes = await eventsAPI.getMyEvents({ limit: 100 });
        const myEvents = myEventsRes.success && myEventsRes.data?.events ? myEventsRes.data.events : [];

        // Calculate profile completion
        const profileFields = ['name', 'major', 'year', 'interests', 'bio'];
        const completedFields = profileFields.filter(field => userProfile[field]).length;
        const profileCompletion = Math.round((completedFields / profileFields.length) * 100);

        // Build recent activity from recommendations and connections
        const recentActivity = [];
        
        // Add recent matches to activity
        matches.slice(0, 3).forEach((match, idx) => {
          recentActivity.push({
            id: `match-${idx}`,
            type: 'match',
            user: String(match.name || 'Someone'), // Ensure it's always a string
            action: 'Compatible match found',
            timestamp: new Date(),
          });
        });

        // Add recent connections to activity
        connections.slice(0, 2).forEach((conn, idx) => {
          // Get the other user's ID (the one who isn't the current user)
          // API returns fromUserId and toUserId, not user1Id/user2Id
          const otherUserId = conn.fromUserId === currentUser?.uid ? conn.toUserId : conn.fromUserId;
          // Always use a string for the user name
          const userName = typeof otherUserId === 'string' ? 'A student' : 'Someone';
          
          recentActivity.push({
            id: `conn-${idx}`,
            type: 'connection',
            user: String(userName), // Ensure it's always a string
            action: 'Connected with you',
            timestamp: new Date(conn.acceptedAt || conn.createdAt || new Date()),
          });
        });

        setDashboardData({
          stats: {
            profileCompletion,
            activeMatches: matches.length,
            pendingConnections: pendingRequests.length,
            eventsAttending: myEvents.length,
          },
          recentActivity,
          topMatches: matches.slice(0, 3),
          recentConnections: connections.slice(0, 3),
        });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err?.error?.message || err?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      fetchDashboardData();
    }
  }, [currentUser, fetchDashboardData]);

  // Real-time: refetch dashboard when connection or event events arrive
  useEffect(() => {
    if (!currentUser) return;

    const handleRequestReceived = () => fetchDashboardData();
    const handleAccepted = () => fetchDashboardData();
    const handleEventCreated = () => fetchDashboardData();
    const handleEventUpdated = () => fetchDashboardData();

    onConnectionRequestReceived(handleRequestReceived);
    onConnectionAccepted(handleAccepted);
    onEventCreated(handleEventCreated);
    onEventUpdated(handleEventUpdated);

    return () => {
      offConnectionRequestReceived(handleRequestReceived);
      offConnectionAccepted(handleAccepted);
      offEventCreated(handleEventCreated);
      offEventUpdated(handleEventUpdated);
    };
  }, [currentUser, fetchDashboardData]);

  if (loading) {
    return (
      <div className="space-y-6">
        <GlassCard>
          <Skeleton className="h-8 w-40" />
          <Skeleton className="mt-3 h-5 w-64" />
        </GlassCard>
        <Skeleton className="h-20" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <Skeleton key={idx} className="h-28" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-64" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <GlassCard>
        <p className="text-sm font-semibold text-red-300">Error loading dashboard</p>
        <p className="text-sm text-white/70">{error}</p>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-8">
      {/* Dashboard Header */}
      <GlassCard>
        <div className="flex flex-col gap-3">
          <p className="text-xs uppercase tracking-[0.2em] text-white/60">Dashboard</p>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Welcome back 👋</h1>
              <p className="text-sm text-white/70">
                Matches, connections, and live signals—all in one place.
              </p>
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70">
              {dashboardData.stats.profileCompletion}% profile complete
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Onboarding Banner */}
      <OnboardingBanner />

      {/* Quick Actions */}
      <QuickActions />

      {/* Stats Cards */}
      <StatsCards stats={dashboardData.stats} />

      {/* Main Content Grid */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column - Activity Feed */}
        <div className="lg:col-span-2 space-y-6">
          <ActivityFeed activities={dashboardData.recentActivity} />
        </div>

        {/* Right Column - Matches Summary & Nearby */}
        <div className="space-y-6">
          <NearbyMatchesPanel />
          <MatchesSummary matches={dashboardData.topMatches} />
        </div>
      </div>

      {/* Recent Connections */}
      <RecentConnections connections={dashboardData.recentConnections} />
    </div>
  );
}

export default Dashboard;
