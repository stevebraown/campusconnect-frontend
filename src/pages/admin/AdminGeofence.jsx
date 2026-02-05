import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/adminAPI';
import GlassCard from '../../components/ui/GlassCard';
import Skeleton from '../../components/ui/Skeleton';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Icon from '../../components/ui/Icon';
import { CheckCircle, AlertCircle, MapPin, Check } from '../../components/ui/icons';

function AdminGeofence() {
  const [settings, setSettings] = useState({
    enabled: true,
    centerLat: 51.505,
    centerLng: 0.05,
    radiusMeters: 1000,
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
      setError(null);
      const res = await adminAPI.getGeofenceSettings();
      if (res.success && res.data) {
        setSettings(res.data);
      }
    } catch (err) {
      console.error('Error fetching geofence settings:', err);
      setError(err?.error?.message || err?.message || 'Failed to load geofence settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    setSuccess(false);
    setError(null);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      
      // Validate inputs
      const centerLat = parseFloat(settings.centerLat);
      const centerLng = parseFloat(settings.centerLng);
      const radiusMeters = parseFloat(settings.radiusMeters);

      if (isNaN(centerLat) || centerLat < -90 || centerLat > 90) {
        setError('Center latitude must be between -90 and 90');
        setSaving(false);
        return;
      }

      if (isNaN(centerLng) || centerLng < -180 || centerLng > 180) {
        setError('Center longitude must be between -180 and 180');
        setSaving(false);
        return;
      }

      if (isNaN(radiusMeters) || radiusMeters <= 0) {
        setError('Radius must be a positive number');
        setSaving(false);
        return;
      }

      const payload = {
        enabled: settings.enabled,
        centerLat,
        centerLng,
        radiusMeters,
      };

      await adminAPI.updateGeofenceSettings(payload);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving geofence settings:', err);
      setError(err?.error?.message || err?.message || 'Failed to save geofence settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <GlassCard>
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-4 w-64" />
        </GlassCard>
        <GlassCard>
          <div className="space-y-4">
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <GlassCard>
        <div className="flex items-center gap-3 mb-2">
          <Icon icon={MapPin} size={24} className="text-[var(--accent)]" decorative />
          <h1 className="text-2xl font-bold text-white">Geofence Settings</h1>
        </div>
        <p className="text-sm text-white/70">
          Configure the campus geofence boundary for location-based features
        </p>
      </GlassCard>

      {/* Settings Form */}
      <GlassCard>
        <div className="space-y-6">
          {/* Enable/Disable Toggle */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
            <div>
              <label className="text-sm font-semibold text-white">Geofencing Enabled</label>
              <p className="text-xs text-white/60 mt-1">
                When enabled, users must be within the geofence to update their location
              </p>
            </div>
            <button
              onClick={() => handleChange('enabled', !settings.enabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.enabled ? 'bg-[var(--accent)]' : 'bg-white/20'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Center Coordinates */}
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Center Latitude"
              type="number"
              step="0.000001"
              value={settings.centerLat}
              onChange={(e) => handleChange('centerLat', e.target.value)}
              placeholder="51.505"
              disabled={!settings.enabled}
            />
            <Input
              label="Center Longitude"
              type="number"
              step="0.000001"
              value={settings.centerLng}
              onChange={(e) => handleChange('centerLng', e.target.value)}
              placeholder="0.05"
              disabled={!settings.enabled}
            />
          </div>

          {/* Radius */}
          <Input
            label="Radius (meters)"
            type="number"
            step="10"
            min="10"
            value={settings.radiusMeters}
            onChange={(e) => handleChange('radiusMeters', e.target.value)}
            placeholder="1000"
            disabled={!settings.enabled}
          />

          {/* Info Box */}
          <div className="p-4 rounded-lg bg-white/5 border border-white/10">
            <p className="text-xs text-white/70">
              <strong className="text-white">Current Configuration:</strong>
              <br />
              Center: ({settings.centerLat}, {settings.centerLng})
              <br />
              Radius: {settings.radiusMeters}m ({(settings.radiusMeters / 1000).toFixed(2)}km)
            </p>
          </div>

          {/* Proximity Suggestions Info */}
          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <p className="text-xs font-semibold text-blue-200 mb-2">Proximity Suggestions</p>
            <p className="text-xs text-white/70">
              Proximity suggestions are generated automatically when students meet all of the following criteria:
            </p>
            <ul className="text-xs text-white/60 mt-2 ml-4 list-disc space-y-1">
              <li>Distance between students is <strong className="text-white">&lt; 100m</strong></li>
              <li>Both students have <strong className="text-white">locationEnabled = true</strong></li>
              <li>Both students have <strong className="text-white">matching programme (major)</strong></li>
              <li>Students have <strong className="text-white">overlapping interests</strong></li>
            </ul>
            <p className="text-xs text-white/60 mt-2">
              Suggestions are displayed as cards (no map). Both users must be within the geofence boundary.
            </p>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-200">
              <Icon icon={AlertCircle} size={18} decorative />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-200">
              <Icon icon={CheckCircle} size={18} decorative />
              <span className="text-sm">Geofence settings saved successfully</span>
            </div>
          )}

          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={saving || !settings.enabled}
            icon={<Icon icon={Check} size={18} decorative />}
            variant="primary"
            fullWidth
          >
            {saving ? 'Saving...' : 'Save Geofence Settings'}
          </Button>
        </div>
      </GlassCard>
    </div>
  );
}

export default AdminGeofence;
