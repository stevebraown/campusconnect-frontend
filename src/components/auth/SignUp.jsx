import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../ui/Input';
import Button from '../ui/Button';
import GlassCard from '../ui/GlassCard';
import Icon from '../ui/Icon';
import { GraduationCap, CheckCircle, AlertCircle, Lightbulb } from '../ui/icons';

function SignUp({ onSwitchToLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { signup, currentUser } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard', { replace: true });
    }
  }, [currentUser, navigate]);

  // Email validation
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Password validation
  const isValidPassword = (password) => {
    return password.length >= 6;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validation
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!isValidPassword(password)) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Attempt signup
    setLoading(true);

    const result = await signup(email, password);

    if (result.success) {
      setSuccess(true);
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      
      // Auto-redirect to dashboard after successful signup (user is auto-logged in)
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 1500);
    } else {
      // Handle backend signup errors
      if (result.code === 'backend/register-failed') {
        setError(result.error || 'Failed to create account. Please try again.');
      } else {
        setError(result.error || 'Failed to create account. Please try again.');
      }
    }

    setLoading(false);
  };

  return (
    <GlassCard padding="p-0">
      <div className="border-b border-white/10 px-5 py-4">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)] block font-semibold">Create</p>
        <div className="flex items-center gap-2 text-lg font-bold mt-2">
          <Icon icon={GraduationCap} size={20} className="text-[var(--accent)]" decorative />
          <span className="text-[var(--text-heading)]">Create your account</span>
        </div>
        <p className="text-sm text-[var(--text-primary)] mt-1">Join the network and start matching today.</p>
      </div>

      {success && (
        <div className="border-b border-white/10 bg-emerald-500/15 px-5 py-3 text-sm text-[var(--text-heading)]">
          <div className="flex items-center gap-2 font-semibold">
            <Icon icon={CheckCircle} size={18} className="text-emerald-400" decorative />
            <span>Account created successfully!</span>
          </div>
          <p className="text-xs text-[var(--text-primary)]">Redirecting to dashboard...</p>
        </div>
      )}

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
          placeholder="your.email@uel.ac.uk"
          disabled={loading}
          autoComplete="email"
        />

        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 6 characters"
          disabled={loading}
          autoComplete="new-password"
        />

        <Input
          label="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Re-enter your password"
          disabled={loading}
          autoComplete="new-password"
        />

        <Button type="submit" fullWidth disabled={loading}>
          {loading ? 'Creating account…' : 'Create Account'}
        </Button>
      </form>

      {onSwitchToLogin && (
        <div className="border-t border-white/10 px-5 py-4 text-center text-sm text-[var(--text-muted)]">
          <p>
            Already have an account?{' '}
            <button className="text-[var(--accent)] font-semibold" onClick={onSwitchToLogin}>
              Log in here
            </button>
          </p>
          <div className="mt-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-xs text-[var(--text-muted)] flex items-start gap-2">
            <Icon icon={Lightbulb} size={16} className="text-[var(--accent)] flex-shrink-0 mt-0.5" decorative />
            <span>Tip: Use your university email to unlock campus-specific matching.</span>
          </div>
        </div>
      )}
    </GlassCard>
  );
}

export default SignUp;