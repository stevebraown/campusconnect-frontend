// Summary card for top match recommendations
import GlassCard from '../ui/GlassCard';
import Button from '../ui/Button';
import Skeleton from '../ui/Skeleton';

function MatchesSummary({ matches = [] }) {
  return (
    <GlassCard>
      {/* Section header */}
      <div className="flex items-center justify-between pb-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-white/60">Matches</p>
          <h2 className="text-xl font-semibold">Top matches</h2>
        </div>
        <Button variant="ghost" size="sm">
          View all
        </Button>
      </div>

      {/* Match list or skeleton placeholder */}
      <div className="space-y-4">
        {matches.length === 0 ? (
          <div className="space-y-3">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
        ) : (
          matches.map((match) => (
            <div
              key={match.id}
              className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl transition-transform duration-200 hover:-translate-y-0.5 hover:border-white/20"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/0" aria-hidden />
              <div className="relative flex items-start gap-3">
                <img
                  src={match.imageUrl}
                  alt={match.name}
                  className="h-12 w-12 flex-shrink-0 rounded-full border border-white/20 object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-white">{match.name}</h3>
                      <p className="text-xs text-white/60">{match.major} • Class of {match.year}</p>
                    </div>
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-[var(--accent)]">
                      {match.compatibility}%
                    </span>
                  </div>

                  <div className="mt-3">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-white/50">Common interests</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(match.interests || []).slice(0, 3).map((interest, idx) => (
                        <span
                          key={idx}
                          className="rounded-full bg-white/10 px-2 py-1 text-[11px] text-white/80"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <div className="h-2 flex-1 rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-[var(--accent)] shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                        style={{ width: `${match.compatibility}%` }}
                      />
                    </div>
                    <Button size="sm" variant="ghost">
                      View
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </GlassCard>
  );
}

export default MatchesSummary;
