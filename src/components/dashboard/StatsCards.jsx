// Dashboard stat tiles with animated cards
import { motion } from 'framer-motion';
import GlassCard from '../ui/GlassCard';
import Icon from '../ui/Icon';
import { User, Heart, Mail, Calendar } from '../ui/icons';

function StatsCards({ stats }) {
  // Metric definitions for each stat card
  const cards = [
    {
      title: 'Profile Completion',
      value: `${stats.profileCompletion}%`,
      icon: User,
      accent: 'from-[var(--accent)] to-[#6ee7b7]',
      description: 'Complete your profile to match better',
      withProgress: true,
    },
    {
      title: 'Active Matches',
      value: stats.activeMatches,
      icon: Heart,
      accent: 'from-[#7dd3fc] to-[#818cf8]',
      description: 'People interested in connecting',
    },
    {
      title: 'Pending Requests',
      value: stats.pendingConnections,
      icon: Mail,
      accent: 'from-[#fcd34d] to-[#f97316]',
      description: 'Awaiting your response',
    },
    {
      title: 'Events Attending',
      value: stats.eventsAttending,
      icon: Calendar,
      accent: 'from-[#a5b4fc] to-[#c084fc]',
      description: 'Upcoming events on your calendar',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <GlassCard className="relative overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-br ${card.accent} opacity-10`} aria-hidden />
            <div className="relative flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/60">{card.title}</p>
                <p className="mt-2 text-3xl font-bold text-white">{card.value}</p>
                <p className="mt-2 text-xs text-white/70">{card.description}</p>
              </div>
              <Icon
                icon={card.icon}
                size={32}
                className="text-[var(--accent)] opacity-80"
                decorative
              />
            </div>

            {card.withProgress && (
              <>
                {/* Progress visualization for profile completion */}
                <div className="mt-4 h-2 rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-[var(--accent)] shadow-[0_0_20px_rgba(16,185,129,0.45)] transition-all"
                  style={{ width: `${stats.profileCompletion}%` }}
                />
                </div>
              </>
            )}
          </GlassCard>
        </motion.div>
      ))}
    </div>
  );
}

export default StatsCards;
