import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import { isProfileComplete } from '../utils/profileCompleteness';
import Skeleton from '../components/ui/Skeleton';

/**
 * OnboardingRoute - Route guard that ensures user has complete profile
 * 
 * Redirects incomplete users to /profile?onboarding=true
 * Allows access if profile is complete
 */
function OnboardingRoute() {
  console.log('🟣 OnboardingRoute rendering');
  const { currentUser, loading: authLoading } = useAuth();
  const location = useLocation();
  const [profileComplete, setProfileComplete] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkCompleteness = async () => {
      if (!currentUser) {
        setChecking(false);
        return;
      }

      try {
        const result = await userAPI.getProfile();
        if (result.success && result.data?.profile) {
          const isComplete = isProfileComplete(result.data.profile);
          setProfileComplete(isComplete);
        } else {
          // No profile or API error - assume incomplete
          setProfileComplete(false);
        }
      } catch (err) {
        console.error('Error checking profile completeness:', err);
        // On error, assume incomplete (safe default)
        setProfileComplete(false);
      } finally {
        setChecking(false);
      }
    };

    checkCompleteness();
  }, [currentUser]);

  // Wait for auth to load
  if (authLoading || checking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Skeleton className="h-12 w-12 rounded-full" />
      </div>
    );
  }

  // If not authenticated, let ProtectedRoute handle it (shouldn't happen, but safety check)
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // If profile incomplete, redirect to profile with onboarding flag
  if (profileComplete === false) {
    const redirectPath = `/profile?onboarding=true&redirect=${encodeURIComponent(location.pathname)}`;
    return <Navigate to={redirectPath} replace />;
  }

  // Profile is complete, render the nested routes
  console.log('🟣 OnboardingRoute: Profile complete, rendering Outlet');
  return <Outlet />;
}

export default OnboardingRoute;
