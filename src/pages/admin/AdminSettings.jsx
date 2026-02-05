import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/adminAPI';
import GlassCard from '../../components/ui/GlassCard';
import Skeleton from '../../components/ui/Skeleton';
import Button from '../../components/ui/Button';
import Icon from '../../components/ui/Icon';
import { CheckCircle, AlertCircle } from '../../components/ui/icons';

function AdminSettings() {
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    signupEnabled: true,
    matchingEnabled: true,
    connectionsEnabled: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getSettings();
      setSettings(res.data || {});
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    setSuccess(false);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      await adminAPI.updateSettings(settings);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <GlassCard>
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-4 w-96" />
        </GlassCard>
        <GlassCard className="max-w-2xl">
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <Skeleton key={idx} className="h-20" />
            ))}
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <GlassCard className="bg-gradient-to-r from-[var(--accent)]/20 via-[var(--accent-2)]/10 to-[var(--accent)]/20 p-8 border-[var(--accent)]/30">
        <h1 className="text-4xl font-bold mb-2 text-white">System Settings</h1>
        <p className="text-white/70">Configure platform features and behavior</p>
      </GlassCard>

      {/* Messages */}
      {error && (
        <GlassCard className="bg-red-500/15 border-red-500/30 p-4">
          <div className="flex items-center gap-2">
            <Icon icon={AlertCircle} size={18} className="text-red-400" decorative />
            <div>
              <p className="font-semibold text-white">Error</p>
              <p className="text-sm text-white/70">{error}</p>
            </div>
          </div>
        </GlassCard>
      )}

      {success && (
        <GlassCard className="bg-emerald-500/15 border-emerald-500/30 p-4">
          <div className="flex items-center gap-2">
            <Icon icon={CheckCircle} size={18} className="text-emerald-400" decorative />
            <p className="font-semibold text-white">Settings saved successfully</p>
          </div>
        </GlassCard>
      )}

      {/* Settings Card */}
      <GlassCard className="p-8 max-w-2xl">
        <div className="space-y-6">
          {/* Maintenance Mode */}
          <GlassCard className="flex items-center justify-between p-4">
            <div>
              <h3 className="font-semibold text-white">Maintenance Mode</h3>
              <p className="text-sm text-white/70 mt-1">
                Temporarily disable all features except admin access
              </p>
            </div>
            <button
              onClick={() => handleToggle('maintenanceMode')}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                settings.maintenanceMode ? 'bg-red-600' : 'bg-white/20'
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  settings.maintenanceMode ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </GlassCard>

          {/* Signup */}
          <GlassCard className="flex items-center justify-between p-4">
            <div>
              <h3 className="font-semibold text-white">Allow Sign-up</h3>
              <p className="text-sm text-white/70 mt-1">
                Allow new users to register accounts
              </p>
            </div>
            <button
              onClick={() => handleToggle('signupEnabled')}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                settings.signupEnabled ? 'bg-[var(--accent)]' : 'bg-white/20'
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  settings.signupEnabled ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </GlassCard>

          {/* Matching */}
          <GlassCard className="flex items-center justify-between p-4">
            <div>
              <h3 className="font-semibold text-white">Enable Matching</h3>
              <p className="text-sm text-white/70 mt-1">
                Allow users to find and view matches
              </p>
            </div>
            <button
              onClick={() => handleToggle('matchingEnabled')}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                settings.matchingEnabled ? 'bg-[var(--accent)]' : 'bg-white/20'
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  settings.matchingEnabled ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </GlassCard>

          {/* Connections */}
          <GlassCard className="flex items-center justify-between p-4">
            <div>
              <h3 className="font-semibold text-white">Enable Connections</h3>
              <p className="text-sm text-white/70 mt-1">
                Allow users to send and accept connection requests
              </p>
            </div>
            <button
              onClick={() => handleToggle('connectionsEnabled')}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                settings.connectionsEnabled ? 'bg-[var(--accent)]' : 'bg-white/20'
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  settings.connectionsEnabled ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </GlassCard>
        </div>

        {/* Save Button */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <Button
            onClick={handleSave}
            disabled={saving}
            fullWidth
            size="lg"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </GlassCard>
    </div>
  );
}

export default AdminSettings;

