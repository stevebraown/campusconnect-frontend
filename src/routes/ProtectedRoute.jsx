// Gate routes that require an authenticated user
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute() {
  // Pull auth state from context
  const { currentUser, loading } = useAuth();

  // Show a lightweight loader while auth is resolving
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[var(--accent)]"></div>
      </div>
    );
  }

  // Redirect signed-out users to login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Render the nested route
  return <Outlet />;
}

export default ProtectedRoute;
