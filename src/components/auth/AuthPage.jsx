import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLocation, Navigate } from 'react-router-dom';
import SignUp from './SignUp';
import Login from './Login';
import GlassCard from '../ui/GlassCard';
import Button from '../ui/Button';

function AuthPage() {
  const { currentUser } = useAuth();
  const location = useLocation();
  const [showLogin, setShowLogin] = useState(location.pathname === '/login');

  // If user is already authenticated, redirect to dashboard
  if (currentUser) {
    return <Navigate to="/dashboard" replace />;
  }

  // Detect route changes and update showLogin state
  useEffect(() => {
    setShowLogin(location.pathname === '/login');
  }, [location.pathname]);

  return (
    <div className="relative mx-auto flex min-h-[80vh] max-w-4xl flex-col items-center justify-center px-4">
      <GlassCard className="w-full max-w-2xl p-6 md:p-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-[var(--text-muted)] block">Access</p>
            <h1 className="text-3xl font-bold text-[var(--text-heading)]">CampusConnect</h1>
            <p className="text-sm text-[var(--text-primary)] mt-1">
              {showLogin ? 'Welcome back — pick up where you left off.' : 'Create your account and join the network.'}
            </p>
          </div>
          <div className="flex gap-2 rounded-full border border-white/15 bg-black/30 p-1">
            <Button
              variant={showLogin ? 'ghost' : 'primary'}
              onClick={() => setShowLogin(false)}
              className="px-4 py-2 text-sm"
            >
              Sign Up
            </Button>
            <Button
              variant={showLogin ? 'primary' : 'ghost'}
              onClick={() => setShowLogin(true)}
              className="px-4 py-2 text-sm"
            >
              Log In
            </Button>
          </div>
        </div>

        <div className="mt-6">
          {showLogin ? (
            <Login onSwitchToSignup={() => setShowLogin(false)} />
          ) : (
            <SignUp onSwitchToLogin={() => setShowLogin(true)} />
          )}
        </div>
      </GlassCard>
    </div>
  );
}

export default AuthPage;