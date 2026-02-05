// Dashboard list of recent connection activity
import GlassCard from '../ui/GlassCard';
import Button from '../ui/Button';
import Skeleton from '../ui/Skeleton';

function RecentConnections({ connections }) {
  return (
    <GlassCard>
      {/* Section header */}
      <div className="flex items-center justify-between pb-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-white/60">Connections</p>
          <h2 className="text-xl font-semibold">Recent connections</h2>
        </div>
        <Button variant="ghost" size="sm">
          View all
        </Button>
      </div>

      {/* List or placeholder state */}
      {connections.length === 0 ? (
        <div className="space-y-3">
          <Skeleton className="h-14" />
          <Skeleton className="h-14" />
        </div>
      ) : (
        <div className="space-y-3">
          {connections.map((connection) => (
            <div
              key={connection.id}
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl transition-colors duration-200 hover:border-white/20"
            >
              <div>
                <p className="text-sm font-semibold text-white">{connection.name}</p>
                <p className="text-xs text-white/60">{connection.major}</p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${
                    connection.connectionStatus === 'connected'
                      ? 'bg-[var(--accent)]/20 text-[var(--accent)]'
                      : 'bg-yellow-200/20 text-yellow-200'
                  }`}
                >
                  {connection.connectionStatus === 'connected' ? 'Connected' : 'Pending'}
                </span>
                <Button size="sm" variant="ghost">
                  {connection.connectionStatus === 'connected' ? 'Message' : 'Respond'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}

export default RecentConnections;
