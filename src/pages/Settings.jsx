import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Icon from '../components/ui/Icon';
import { Settings as SettingsIcon, User, Bell, Shield, LogOut, MapPin } from '../components/ui/icons';

function Settings() {
  const { currentUser, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    matches: true,
    connections: true,
  });
  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    showLocation: false,
    showEmail: false,
  });
  const [locationEnabled, setLocationEnabled] = useState(false);

  // Load profile data on mount
  useEffect(() => {
    if (currentUser) {
      loadProfile();
    }
  }, [currentUser]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await userAPI.getProfile();
      if (result.success && result.data?.profile) {
        const profile = result.data.profile;
        setLocationEnabled(profile.locationEnabled === true);
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('Failed to load profile settings');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationChange = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePrivacyChange = (key) => {
    setPrivacy(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLocationEnabledChange = async (enabled) => {
    if (!currentUser) return;
    
    setLocationEnabled(enabled);
    setError(null);
    setSuccess(false);

    try {
      setSaving(true);
      const result = await userAPI.updateProfile(currentUser.uid, { locationEnabled: enabled });
      if (result.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(result.error?.message || 'Failed to update location setting');
        setLocationEnabled(!enabled); // Revert on error
      }
    } catch (err) {
      console.error('Error updating locationEnabled:', err);
      setError(err?.error?.message || 'Failed to update location setting');
      setLocationEnabled(!enabled); // Revert on error
    } finally {
      setSaving(false);
    }
  };

  const handleSave = () => {
    // TODO: Save settings to backend
    console.log('Saving settings:', { notifications, privacy });
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 space-y-6">
      {/* Header */}
      <GlassCard>
        <div className="flex items-center gap-3 mb-2">
          <Icon icon={SettingsIcon} size={24} className="text-[var(--accent)]" decorative />
          <h1 className="text-2xl font-bold text-white">Settings</h1>
        </div>
        <p className="text-white/70">Manage your account preferences and privacy settings.</p>
      </GlassCard>

      {/* Account Information */}
      <GlassCard>
        <div className="flex items-center gap-3 mb-4">
          <Icon icon={User} size={20} className="text-[var(--accent)]" decorative />
          <h2 className="text-xl font-semibold text-white">Account</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Email</label>
            <Input
              type="email"
              value={currentUser?.email || ''}
              disabled
              className="bg-white/5"
            />
            <p className="text-xs text-white/60 mt-1">Email cannot be changed</p>
          </div>
        </div>
      </GlassCard>

      {/* Notifications */}
      <GlassCard>
        <div className="flex items-center gap-3 mb-4">
          <Icon icon={Bell} size={20} className="text-[var(--accent)]" decorative />
          <h2 className="text-xl font-semibold text-white">Notifications</h2>
        </div>
        <div className="space-y-4">
          <label className="flex items-center justify-between cursor-pointer group">
            <div>
              <span className="text-white font-medium">Email Notifications</span>
              <p className="text-sm text-white/60">Receive updates via email</p>
            </div>
            <input
              type="checkbox"
              checked={notifications.email}
              onChange={() => handleNotificationChange('email')}
              className="w-5 h-5 rounded border-white/20 bg-white/5 text-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-transparent cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer group">
            <div>
              <span className="text-white font-medium">Push Notifications</span>
              <p className="text-sm text-white/60">Browser push notifications</p>
            </div>
            <input
              type="checkbox"
              checked={notifications.push}
              onChange={() => handleNotificationChange('push')}
              className="w-5 h-5 rounded border-white/20 bg-white/5 text-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-transparent cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer group">
            <div>
              <span className="text-white font-medium">New Matches</span>
              <p className="text-sm text-white/60">Get notified about new matches</p>
            </div>
            <input
              type="checkbox"
              checked={notifications.matches}
              onChange={() => handleNotificationChange('matches')}
              className="w-5 h-5 rounded border-white/20 bg-white/5 text-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-transparent cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer group">
            <div>
              <span className="text-white font-medium">Connection Requests</span>
              <p className="text-sm text-white/60">Notifications for connection requests</p>
            </div>
            <input
              type="checkbox"
              checked={notifications.connections}
              onChange={() => handleNotificationChange('connections')}
              className="w-5 h-5 rounded border-white/20 bg-white/5 text-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-transparent cursor-pointer"
            />
          </label>
        </div>
      </GlassCard>

      {/* Privacy */}
      <GlassCard>
        <div className="flex items-center gap-3 mb-4">
          <Icon icon={Shield} size={20} className="text-[var(--accent)]" decorative />
          <h2 className="text-xl font-semibold text-white">Privacy</h2>
        </div>
        <div className="space-y-4">
          <label className="flex items-center justify-between cursor-pointer group">
            <div>
              <span className="text-white font-medium">Profile Visibility</span>
              <p className="text-sm text-white/60">Allow others to find your profile</p>
            </div>
            <input
              type="checkbox"
              checked={privacy.profileVisible}
              onChange={() => handlePrivacyChange('profileVisible')}
              className="w-5 h-5 rounded border-white/20 bg-white/5 text-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-transparent cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer group">
            <div>
              <span className="text-white font-medium">Show Location</span>
              <p className="text-sm text-white/60">Display approximate location to matches</p>
            </div>
            <input
              type="checkbox"
              checked={privacy.showLocation}
              onChange={() => handlePrivacyChange('showLocation')}
              className="w-5 h-5 rounded border-white/20 bg-white/5 text-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-transparent cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer group">
            <div>
              <span className="text-white font-medium">Show Email</span>
              <p className="text-sm text-white/60">Make your email visible to connections</p>
            </div>
            <input
              type="checkbox"
              checked={privacy.showEmail}
              onChange={() => handlePrivacyChange('showEmail')}
              className="w-5 h-5 rounded border-white/20 bg-white/5 text-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-transparent cursor-pointer"
            />
          </label>
        </div>
      </GlassCard>

      {/* Location Settings */}
      <GlassCard>
        <div className="flex items-center gap-3 mb-4">
          <Icon icon={MapPin} size={20} className="text-[var(--accent)]" decorative />
          <h2 className="text-xl font-semibold text-white">Location</h2>
        </div>
        <div className="space-y-4">
          <label className="flex items-center justify-between cursor-pointer group">
            <div>
              <span className="text-white font-medium">Enable Location Sharing</span>
              <p className="text-sm text-white/60">
                Allow proximity-based suggestions when you're near students with matching programme and interests
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleLocationEnabledChange(!locationEnabled)}
              disabled={saving || loading}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                locationEnabled ? 'bg-[var(--accent)]' : 'bg-white/20'
              } ${saving || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  locationEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </label>
          {success && (
            <p className="text-xs text-green-400">Location setting saved successfully</p>
          )}
          {error && (
            <p className="text-xs text-red-400">{error}</p>
          )}
        </div>
      </GlassCard>

      {/* Actions */}
      <div className="flex gap-4">
        <Button
          variant="primary"
          onClick={handleSave}
          className="flex-1"
        >
          Save Settings
        </Button>
        <Button
          variant="ghost"
          onClick={logout}
          icon={<Icon icon={LogOut} size={18} decorative />}
          className="flex-1"
        >
          Logout
        </Button>
      </div>
    </div>
  );
}

export default Settings;
