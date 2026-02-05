import GlassCard from '../../components/ui/GlassCard';
import Icon from '../../components/ui/Icon';
import { Wrench } from '../../components/ui/icons';

function AdminFeatures() {
  return (
    <div className="space-y-6">
      <GlassCard>
        <div className="flex items-center gap-3 mb-4">
          <Icon icon={Wrench} size={24} className="text-[var(--accent)]" decorative />
          <h2 className="text-2xl font-bold text-white">Feature Management</h2>
        </div>
        <p className="text-white/70 mb-4">
          Configure feature flags and experimental modules for the CampusConnect platform.
        </p>
        <p className="text-white/60 text-sm">
          This section allows administrators to enable or disable platform features, manage experimental functionality, and control feature rollouts.
        </p>
      </GlassCard>
    </div>
  );
}

export default AdminFeatures;
