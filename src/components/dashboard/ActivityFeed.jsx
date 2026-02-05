// Activity timeline showing recent user events
import { AnimatePresence, motion } from 'framer-motion';
import GlassCard from '../ui/GlassCard';
import Button from '../ui/Button';
import Skeleton from '../ui/Skeleton';
import Icon from '../ui/Icon';
import { Heart, Users, Calendar, MessageCircle, Sparkles } from '../ui/icons';

function ActivityFeed({ activities }) {
  // Map activity types to display icons
  const getActivityIcon = (type) => {
    const iconMap = {
      match: Heart,
      connection: Users,
      event: Calendar,
      message: MessageCircle,
    };
    return iconMap[type] || Sparkles;
  };

  // Map activity types to gradient accents
  const getActivityAccent = (type) => {
    switch (type) {
      case 'match':
        return 'from-[var(--accent)] to-[#6ee7b7]';
      case 'connection':
        return 'from-[#7dd3fc] to-[#a5b4fc]';
      case 'event':
        return 'from-[#f472b6] to-[#c084fc]';
      default:
        return 'from-white/30 to-white/10';
    }
  };

  // Format timestamps into a short relative label
  const formatTime = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  };

  return (
    <GlassCard>
      {/* Section header */}
      <div className="flex items-center justify-between pb-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-white/60">Activity</p>
          <h2 className="text-xl font-semibold">Recent activity</h2>
        </div>
        <Button variant="ghost">View all</Button>
      </div>

      {/* Activity list or loading skeletons */}
      <div className="space-y-3">
        {activities.length === 0 ? (
          <div className="space-y-3">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {activities.map((activity) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl"
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${getActivityAccent(activity.type)} opacity-10`} aria-hidden />
                <div className="relative flex items-start gap-4">
                  <Icon
                    icon={getActivityIcon(activity.type)}
                    size={24}
                    className="text-[var(--accent)]"
                    decorative
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-white">
                      <span className="font-semibold">{activity.user}</span>{' '}
                      <span className="text-white/70">{activity.action}</span>
                    </p>
                    <p className="mt-1 text-xs text-white/60">{formatTime(activity.timestamp)}</p>
                  </div>
                  <button className="text-xs font-medium text-[var(--accent)] hover:text-white">
                    View →
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </GlassCard>
  );
}

export default ActivityFeed;
