// Password reset flow for users who forgot credentials
import { useState } from 'react';
import GlassCard from '../../components/ui/GlassCard';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

function ForgotPassword() {
  // State for form input and submission feedback
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null);

  // Submit the reset request to Firebase
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || `HTTP ${res.status}`);
      }

      setStatus({ type: 'success', message: 'Password reset email sent.' });
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    }
  };

  return (
    <GlassCard className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-white mb-4">Forgot Password</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="email"
          label="Email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button type="submit" fullWidth>
          Send Reset Link
        </Button>
      </form>
      {status && (
        <div
          className={`${
            status.type === 'success'
              ? 'bg-green-500/20 border-green-500/50 text-green-300'
              : 'bg-red-500/20 border-red-500/50 text-red-300'
          } border rounded-lg p-3 mt-3 text-sm`}
        >
          {status.message}
        </div>
      )}
    </GlassCard>
  );
}

export default ForgotPassword;
