import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/adminAPI';
import GlassCard from '../../components/ui/GlassCard';
import Skeleton from '../../components/ui/Skeleton';
import Icon from '../../components/ui/Icon';
import { CheckCircle, AlertCircle, Info, Circle } from '../../components/ui/icons';

function AdminSystemStatus() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const res = await adminAPI.getSystemHealth();
        setHealth(res.data);
      } catch (err) {
        console.error('Error fetching health:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHealth();
    // Refresh every 10 seconds
    const interval = setInterval(fetchHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <GlassCard>
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-4 w-96" />
        </GlassCard>
        <GlassCard>
          <Skeleton className="h-32 mb-4" />
          <div className="grid md:grid-cols-2 gap-4">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        </GlassCard>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/15 border border-red-500/30 rounded-lg p-4">
        <p className="font-semibold text-[var(--text-heading)]">Error loading system status</p>
        <p className="text-sm text-[var(--text-primary)]">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <GlassCard className="bg-gradient-to-r from-[var(--accent)]/20 via-[var(--accent-2)]/10 to-[var(--accent)]/20 p-8 border-[var(--accent)]/30">
        <h1 className="text-4xl font-bold mb-2 text-white">System Status</h1>
        <p className="text-white/70">Real-time monitoring of backend services</p>
      </GlassCard>

      {/* Status Overview */}
      {health && (
        <div className="space-y-6">
          {/* Main Status */}
          <GlassCard>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Overall Status</h2>
              <div className={`px-4 py-2 rounded-lg font-semibold text-white flex items-center gap-2 ${
                health.status === 'healthy' ? 'bg-emerald-500/20 border border-emerald-500/30' : 'bg-red-500/20 border border-red-500/30'
              }`}>
                {health.status === 'healthy' ? (
                  <>
                    <Icon icon={CheckCircle} size={18} className="text-emerald-400" decorative />
                    <span>Healthy</span>
                  </>
                ) : (
                  <>
                    <Icon icon={AlertCircle} size={18} className="text-red-400" decorative />
                    <span>Issues Detected</span>
                  </>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <GlassCard className="p-4 bg-blue-500/10 border-blue-500/30">
                <p className="text-sm text-white/70 font-semibold">Uptime</p>
                <p className="text-3xl font-bold text-[var(--accent)] mt-2">
                  {(health.uptime / 3600).toFixed(1)}h
                </p>
                <p className="text-xs text-white/60 mt-1">
                  {(health.uptime / 86400).toFixed(2)} days
                </p>
              </GlassCard>

              <GlassCard className="p-4 bg-purple-500/10 border-purple-500/30">
                <p className="text-sm text-white/70 font-semibold">Last Updated</p>
                <p className="text-lg font-mono text-white/80 mt-2">
                  {new Date(health.timestamp).toLocaleTimeString()}
                </p>
                <p className="text-xs text-white/60 mt-1">
                  {new Date(health.timestamp).toLocaleDateString()}
                </p>
              </GlassCard>
            </div>
          </GlassCard>

          {/* Services */}
          <GlassCard>
            <h2 className="text-xl font-bold text-white mb-4">Services</h2>
            <div className="space-y-3">
              {Object.entries(health.services || {}).map(([service, status]) => (
                <GlassCard key={service} className="p-3 flex items-center justify-between">
                  <span className="font-semibold text-white capitalize">
                    {service.replace(/_/g, ' ')}
                  </span>
                  <div className="flex items-center gap-2">
                    <Icon 
                      icon={status === 'up' ? CheckCircle : AlertCircle} 
                      size={16} 
                      className={status === 'up' ? 'text-[var(--accent)]' : 'text-red-400'} 
                      decorative 
                    />
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      status === 'up' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {status === 'up' ? 'Up' : 'Down'}
                    </span>
                  </div>
                </GlassCard>
              ))}
            </div>
          </GlassCard>

          {/* Memory Usage */}
          <GlassCard>
            <h2 className="text-xl font-bold text-white mb-4">Memory Usage</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <GlassCard className="p-4 bg-orange-500/10 border-orange-500/30">
                <p className="text-sm text-white/70 font-semibold">Used Memory</p>
                <p className="text-3xl font-bold text-[var(--accent)] mt-2">{health.memory.used}</p>
              </GlassCard>
              <GlassCard className="p-4 bg-indigo-500/10 border-indigo-500/30">
                <p className="text-sm text-white/70 font-semibold">Total Memory</p>
                <p className="text-3xl font-bold text-[var(--accent)] mt-2">{health.memory.total}</p>
              </GlassCard>
            </div>
          </GlassCard>

          {/* Notes */}
          <GlassCard className="bg-blue-500/15 border-blue-500/30">
            <div className="flex items-start gap-2">
              <Icon icon={Info} size={18} className="text-blue-400 flex-shrink-0 mt-0.5" decorative />
              <div>
                <p className="font-semibold text-white">Status Updates</p>
                <p className="text-sm text-white/70 mt-2">This page updates automatically every 10 seconds.</p>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}

export default AdminSystemStatus;

