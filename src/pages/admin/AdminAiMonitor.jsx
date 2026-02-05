/**
 * Admin AI Monitor page.
 * Purpose: Allow admins to test campusconnect-ai graphs and inspect raw inputs/responses.
 * Connection: Calls admin monitoring endpoints which proxy to AI /run-graph.
 */

import { useState } from 'react';
import GlassCard from '../../components/ui/GlassCard';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { adminAPI } from '../../services/adminAPI';

function AdminAiMonitor() {
  const [userId, setUserId] = useState('');
  const [tenantId, setTenantId] = useState('');
  const [preferences, setPreferences] = useState('{}');
  const [interests, setInterests] = useState('[]');
  const [location, setLocation] = useState('{}');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Parse JSON input safely for admin testing.
  const parseJson = (value, fallback) => {
    try {
      return JSON.parse(value);
    } catch (err) {
       console.warn('Failed to parse JSON:', err.message);
      return fallback;
    }
  };

  // Call admin AI matching test endpoint and visualize raw response.
  const handleTestMatching = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await adminAPI.testAiMatching({
        userId,
        tenantId,
        preferences: parseJson(preferences, {}),
      });
      setResult(response.data || null);
    } catch (err) {
      setError(err?.message || 'AI matching test failed');
    } finally {
      setLoading(false);
    }
  };

  // Call admin AI events/groups test endpoint and visualize raw response.
  const handleTestEventsGroups = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await adminAPI.testAiEventsGroups({
        userId,
        tenantId,
        interests: parseJson(interests, []),
        location: parseJson(location, null),
        limit: 20,
      });
      setResult(response.data || null);
    } catch (err) {
      setError(err?.message || 'AI events/groups test failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <GlassCard className="bg-gradient-to-r from-[var(--accent)]/20 via-[var(--accent-2)]/10 to-[var(--accent)]/20 p-8 border-[var(--accent)]/30">
        <h1 className="text-3xl font-bold text-white">AI Monitor</h1>
        <p className="text-white/70">Run admin-only checks against campusconnect-ai graphs.</p>
      </GlassCard>

      <GlassCard className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="User ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="uid"
          />
          <Input
            label="Tenant ID"
            value={tenantId}
            onChange={(e) => setTenantId(e.target.value)}
            placeholder="campus-tenant"
          />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Input
            label="Matching Preferences (JSON)"
            value={preferences}
            onChange={(e) => setPreferences(e.target.value)}
            placeholder='{"radiusMeters":2000,"minScore":30}'
          />
          <Input
            label="Interests (JSON array)"
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            placeholder='["ai","design"]'
          />
          <Input
            label="Location (JSON)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder='{"lat":51.5,"lng":-0.1}'
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <Button onClick={handleTestMatching} disabled={!userId || !tenantId || loading}>
            Test Matching
          </Button>
          <Button onClick={handleTestEventsGroups} disabled={!userId || !tenantId || loading}>
            Test Events/Groups
          </Button>
        </div>
      </GlassCard>

      <GlassCard className="space-y-3">
        <h2 className="text-lg font-semibold text-white">Result</h2>
        {loading && <p className="text-sm text-white/60">Running test...</p>}
        {error && <p className="text-sm text-red-300">{error}</p>}
        {!loading && !error && !result && (
          <p className="text-sm text-white/60">Run a test to see the raw AI response and metrics.</p>
        )}
        {result && (
          <pre className="max-h-[420px] overflow-auto rounded-lg bg-black/40 p-4 text-xs text-white/80">
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </GlassCard>
    </div>
  );
}

export default AdminAiMonitor;
