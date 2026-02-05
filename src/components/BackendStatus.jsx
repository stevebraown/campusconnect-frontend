import { useAPI } from '../hooks/useAPI';
import { checkHealth, getBackendInfo, testAPI } from '../services/api';
import GlassCard from './ui/GlassCard';
import Icon from './ui/Icon';
import { Plug, CheckCircle, XCircle, Loader } from './ui/icons';
import Skeleton from './ui/Skeleton';

function BackendStatus() {
  const { data: healthData, loading: healthLoading, error: healthError } = useAPI(checkHealth);
  const { data: infoData, loading: infoLoading } = useAPI(getBackendInfo);
  const { data: testData, loading: testLoading } = useAPI(testAPI);
  
  const isConnected = !healthError && healthData;
  
  return (
    <GlassCard className="max-w-4xl mx-auto mt-8">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <Icon icon={Plug} size={24} className="text-[var(--accent)]" decorative />
        Backend Connection Status
      </h2>
      
      {/* Connection Status */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          {healthLoading ? (
            <Icon icon={Loader} size={16} className="animate-spin text-[var(--accent)]" decorative />
          ) : isConnected ? (
            <Icon icon={CheckCircle} size={16} className="text-[var(--accent)]" decorative />
          ) : (
            <Icon icon={XCircle} size={16} className="text-red-500" decorative />
          )}
          <span className="font-semibold text-white">
            {healthLoading ? 'Connecting...' : isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        
        {healthError && (
          <GlassCard className="mt-2 border-red-500/50">
            <p className="text-red-300 text-sm">
              {healthError.message}
            </p>
          </GlassCard>
        )}
      </div>
      
      {/* Health Data */}
      {healthData && (
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <GlassCard>
            <p className="text-sm text-white/60 mb-1">Status</p>
            <p className="text-lg font-bold text-[var(--accent)] capitalize">
              {healthData.status}
            </p>
          </GlassCard>
          
          <GlassCard>
            <p className="text-sm text-white/60 mb-1">Uptime</p>
            <p className="text-lg font-bold text-[var(--accent)]">
              {Math.floor(healthData.uptime)}s
            </p>
          </GlassCard>
          
          <GlassCard>
            <p className="text-sm text-white/60 mb-1">Socket Connections</p>
            <p className="text-lg font-bold text-[var(--accent)]">
              {healthData.socketConnections || 0}
            </p>
          </GlassCard>
        </div>
      )}
      
      {/* Backend Info */}
      {infoData && (
        <GlassCard className="mb-4">
          <h3 className="font-semibold text-white mb-2">Backend Info</h3>
          <div className="space-y-1 text-sm">
            <p><span className="text-white/60">Message:</span> <span className="font-medium text-white">{infoData.message}</span></p>
            <p><span className="text-white/60">Version:</span> <span className="font-medium text-white">{infoData.version}</span></p>
            <p><span className="text-white/60">Features:</span></p>
            <ul className="ml-6 list-disc">
              {infoData.features && Object.entries(infoData.features).map(([key, value]) => (
                <li key={key} className="capitalize text-white/80">
                  {key}: <Icon 
                    icon={value ? CheckCircle : XCircle} 
                    size={14} 
                    className={value ? 'text-[var(--accent)]' : 'text-red-500'} 
                    decorative 
                  />
                </li>
              ))}
            </ul>
          </div>
        </GlassCard>
      )}
      
      {/* Test Data */}
      {testData && (
        <GlassCard>
          <h3 className="font-semibold text-white mb-2">Available Features</h3>
          <p className="text-sm text-white/70 mb-2">{testData.message}</p>
          <ul className="space-y-1">
            {testData.features && testData.features.map((feature, index) => (
              <li key={index} className="flex items-center gap-2 text-sm text-white/80">
                <Icon icon={CheckCircle} size={14} className="text-[var(--accent)]" decorative />
                {feature}
              </li>
            ))}
          </ul>
        </GlassCard>
      )}
      
      {/* Loading States */}
      {(healthLoading || infoLoading || testLoading) && (
        <div className="text-center py-4">
          <Icon icon={Loader} size={32} className="animate-spin text-[var(--accent)] mx-auto" decorative />
          <p className="text-white/70 mt-2">Loading backend data...</p>
        </div>
      )}
    </GlassCard>
  );
}

export default BackendStatus;