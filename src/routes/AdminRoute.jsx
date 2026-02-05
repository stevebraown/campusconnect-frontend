// Gate routes that require admin privileges
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function AdminRoute() {
  // Pull auth and role state from context
  const { currentUser, isAdmin, loading } = useAuth();

  // Keep the screen blank until auth is ready
  if (loading) return null;
  // Require a signed-in user
  if (!currentUser) return <Navigate to="/login" replace />;
  // Require admin privileges
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  // Render the nested route
  return <Outlet />;
}

export default AdminRoute;
