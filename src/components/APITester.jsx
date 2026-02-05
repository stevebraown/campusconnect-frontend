import { useState } from 'react';
import { authAPI, userAPI, matchAPI } from '../services/api';
import GlassCard from './ui/GlassCard';
import Icon from './ui/Icon';
import { TestTube, Key, User, Handshake, Lightbulb } from './ui/icons';
import Button from './ui/Button';

function APITester() {
  const [authResult, setAuthResult] = useState(null);
  const [userResult, setUserResult] = useState(null);
  const [matchResult, setMatchResult] = useState(null);
  const [loading, setLoading] = useState(null);

  const testEndpoint = async (endpoint, setter, name) => {
    setLoading(name);
    const response = await endpoint();
    setter(response);
    setLoading(null);
  };

  const ResultDisplay = ({ title, result }) => {
    if (!result) return null;

    return (
      <div className="mt-4 bg-white/5 rounded-lg p-4 border border-white/10">
        <h4 className="font-semibold text-white mb-2">{title}</h4>
        <pre className="text-xs text-white/80 overflow-x-auto bg-black/20 p-3 rounded border border-white/10">
          {JSON.stringify(result, null, 2)}
        </pre>
      </div>
    );
  };

  return (
    <GlassCard className="max-w-4xl mx-auto mt-8">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <Icon icon={TestTube} size={24} className="text-[var(--accent)]" decorative />
        API Endpoint Tester
      </h2>

      <p className="text-white/70 mb-6">
        Test different API endpoints to see real responses from the backend.
      </p>

      {/* Test Buttons Grid */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Auth API */}
        <GlassCard>
          <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
            <Icon icon={Key} size={18} className="text-[var(--accent)]" decorative />
            Auth API
          </h3>
          <Button
            onClick={() => testEndpoint(authAPI.getStatus, setAuthResult, 'auth')}
            disabled={loading === 'auth'}
            fullWidth
          >
            {loading === 'auth' ? 'Testing...' : 'Test Auth Status'}
          </Button>
          <ResultDisplay title="Auth Response" result={authResult} />
        </GlassCard>

        {/* User API */}
        <GlassCard>
          <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
            <Icon icon={User} size={18} className="text-[var(--accent)]" decorative />
            User API
          </h3>
          <Button
            onClick={() => testEndpoint(userAPI.getProfile, setUserResult, 'user')}
            disabled={loading === 'user'}
            fullWidth
          >
            {loading === 'user' ? 'Testing...' : 'Test User Profile'}
          </Button>
          <ResultDisplay title="User Response" result={userResult} />
        </GlassCard>

        {/* Match API */}
        <GlassCard>
          <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
            <Icon icon={Handshake} size={18} className="text-[var(--accent)]" decorative />
            Match API
          </h3>
          <Button
            onClick={() => testEndpoint(matchAPI.getRecommendations, setMatchResult, 'match')}
            disabled={loading === 'match'}
            fullWidth
          >
            {loading === 'match' ? 'Testing...' : 'Test Recommendations'}
          </Button>
          <ResultDisplay title="Match Response" result={matchResult} />
        </GlassCard>
      </div>

      {/* Info Box */}
      <GlassCard className="mt-6 border-[var(--accent)]/30">
        <p className="text-sm text-white/80 flex items-start gap-2">
          <Icon icon={Lightbulb} size={18} className="text-[var(--accent)] flex-shrink-0 mt-0.5" decorative />
          <span><strong>Tip:</strong> Test backend API endpoints to verify connectivity and response formats. 
          Authentication endpoints require valid Firebase ID tokens, while protected routes need a valid JWT.</span>
        </p>
      </GlassCard>
    </GlassCard>
  );
}

export default APITester;