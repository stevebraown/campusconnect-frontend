// Dashboard shortcuts for common actions
import MagneticCard from '../ui/MagneticCard';
import Icon from '../ui/Icon';
import { Heart, Calendar, Search, MessageCircle } from '../ui/icons';

function QuickActions() {
  // Quick actions shown in the dashboard
  const actions = [
    {
      label: 'Browse Matches',
      icon: Heart,
      description: 'View recommended matches',
      action: () => console.log('Browse matches'),
    },
    {
      label: 'Discover Events',
      icon: Calendar,
      description: 'Find events to attend',
      action: () => console.log('Discover events'),
    },
    {
      label: 'Explore Directory',
      icon: Search,
      description: 'Search the student directory',
      action: () => console.log('Explore directory'),
    },
    {
      label: 'View Chat',
      icon: MessageCircle,
      description: 'Message your connections',
      action: () => console.log('View chat'),
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {actions.map((action, index) => (
        <MagneticCard
          key={index}
          onClick={action.action}
          className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.35)] hover:border-white/20"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" aria-hidden />
          <div className="mb-3 transition-transform duration-300 group-hover:scale-110">
            <Icon
              icon={action.icon}
              size={32}
              className="text-[var(--accent)]"
              decorative
            />
          </div>
          <h3 className="text-sm font-semibold text-white">{action.label}</h3>
          <p className="mt-1 text-xs text-white/70">{action.description}</p>
        </MagneticCard>
      ))}
    </div>
  );
}

export default QuickActions;
