// Route configuration and lazy-loaded screens
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import MainLayout from '../layouts/MainLayout';
import AdminLayout from '../layouts/AdminLayout';
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';

// Public and shared routes
const Landing = lazy(() => import('../pages/Landing'));
const Dashboard = lazy(() => import('../components/dashboard/Dashboard'));
const ProfileManager = lazy(() => import('../components/profile/ProfileManager'));
const DirectoryManager = lazy(() => import('../components/directory/DirectoryManager'));
const ConnectionsManager = lazy(() => import('../components/connections/ConnectionsManager'));
const RealtimeChat = lazy(() => import('../components/RealtimeChat'));
const BackendStatus = lazy(() => import('../components/BackendStatus'));
const APITester = lazy(() => import('../components/APITester'));
const AuthPage = lazy(() => import('../components/auth/AuthPage'));
const ForgotPassword = lazy(() => import('../pages/auth/ForgotPassword'));
const Settings = lazy(() => import('../pages/Settings'));
const Help = lazy(() => import('../pages/Help'));
const SwifinComingSoon = lazy(() => import('../pages/Swifin'));
const GroupsPage = lazy(() => import('../components/groups/GroupsPage'));
const EventsPage = lazy(() => import('../components/events/EventsPage'));

// Admin-only routes
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const AdminUsers = lazy(() => import('../pages/admin/AdminUsers'));
const AdminContent = lazy(() => import('../pages/admin/AdminContent'));
const AdminSettings = lazy(() => import('../pages/admin/AdminSettings'));
const AdminAnalytics = lazy(() => import('../pages/admin/AdminAnalytics'));
const AdminSystemStatus = lazy(() => import('../pages/admin/AdminSystemStatus'));
const AdminFeatures = lazy(() => import('../pages/admin/AdminFeatures'));
const AdminGeofence = lazy(() => import('../pages/admin/AdminGeofence'));
const AdminGroups = lazy(() => import('../pages/admin/AdminGroups'));
const AdminEvents = lazy(() => import('../pages/admin/AdminEvents'));
// Admin AI monitor (campusconnect-ai testing).
const AdminAiMonitor = lazy(() => import('../pages/admin/AdminAiMonitor'));

function AppRoutes() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="p-10 text-center text-white">Loading interface…</div>}>
        <Routes>
          {/* Public layout wrapper */}
          <Route element={<MainLayout />}>
            <Route index element={<Landing />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/signup" element={<AuthPage />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Signed-in routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<ProfileManager />} />
              <Route path="/directory" element={<DirectoryManager />} />
              <Route path="/groups" element={<GroupsPage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/connections" element={<ConnectionsManager />} />
              <Route path="/chat" element={<RealtimeChat />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/help" element={<Help />} />
              <Route path="/swifin" element={<SwifinComingSoon />} />
              <Route path="/status" element={<BackendStatus />} />
              <Route path="/api-tester" element={<APITester />} />
            </Route>
          </Route>

          {/* Admin-only routes */}
          <Route element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/content" element={<AdminContent />} />
              <Route path="/admin/features" element={<AdminFeatures />} />
              <Route path="/admin/geofence" element={<AdminGeofence />} />
              <Route path="/admin/groups" element={<AdminGroups />} />
              <Route path="/admin/events" element={<AdminEvents />} />
              {/* Admin AI monitoring route (campusconnect-ai) */}
              <Route path="/admin/ai-monitor" element={<AdminAiMonitor />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
              <Route path="/admin/analytics" element={<AdminAnalytics />} />
              <Route path="/admin/system" element={<AdminSystemStatus />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default AppRoutes;
