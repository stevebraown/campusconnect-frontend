import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../ui/Input';
import Button from '../ui/Button';
import GlassCard from '../ui/GlassCard';
import Icon from '../ui/Icon';
import { Lock, AlertCircle } from '../ui/icons';

function Login({ onSwitchToSignup }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, currentUser } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard', { replace: true });
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    // Attempt login
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      // Success! User is now logged in - redirect to dashboard
      setEmail('');
      setPassword('');
      navigate('/dashboard', { replace: true });
    } else {
      // Handle Firebase errors
      if (result.code === 'auth/user-not-found') {
        setError('No account found with this email. Please sign up first.');
      } else if (result.code === 'auth/wrong-password') {
        setError('Incorrect password. Please try again.');
      } else if (result.code === 'auth/invalid-email') {
        setError('Invalid email address');
      } else if (result.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later.');
      } else if (result.code === 'auth/invalid-credential') {
        setError('Invalid email or password. Please check your credentials.');
      } else {
        setError(result.error || 'Failed to log in. Please try again.');
      }
    }

    setLoading(false);
  };

  return (
    <GlassCard padding="p-0">
      <div className="border-b border-white/10 px-5 py-4">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)] block font-semibold">Login</p>
        <div className="flex items-center gap-2 text-lg font-bold mt-2">
          <Icon icon={Lock} size={20} className="text-[var(--accent)]" decorative />
          <span className="text-[var(--text-heading)]">Welcome back</span>
        </div>
        <p className="text-sm text-[var(--text-primary)] mt-1">Enter your campus credentials to continue.</p>
      </div>

      {error && (
        <div className="border-b border-white/10 bg-red-500/15 px-5 py-3 text-sm text-[var(--text-heading)]">
          <div className="flex items-center gap-2 font-semibold">
            <Icon icon={AlertCircle} size={18} className="text-red-400" decorative />
            <span>{error}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5">
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your.email@university.edu"
          disabled={loading}
          autoComplete="email"
        />

        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          disabled={loading}
          autoComplete="current-password"
        />

        <Button type="submit" fullWidth disabled={loading}>
          {loading ? 'Logging in…' : 'Log In'}
        </Button>
      </form>

      <div className="border-t border-white/10 px-5 py-4 text-center text-sm text-[var(--text-muted)]">
        <p className="text-[var(--text-primary)]">
          Don't have an account?{' '}
          <button className="text-[var(--accent)] font-semibold hover:opacity-80" onClick={onSwitchToSignup}>
            Sign up here
          </button>
        </p>
        <button
          className="mt-2 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          onClick={() => alert('Password reset coming soon!')}
        >
          Forgot your password?
        </button>
      </div>
    </GlassCard>
  );
}

export default Login;