// Groups hub with create form and tabs
import { useState } from 'react';
import { motion } from 'framer-motion';
import CreateGroupForm from './CreateGroupForm';
import GroupsList from './GroupsList';
import MyCommunities from './MyCommunities';
import RecommendedGroups from './RecommendedGroups';
import GlassCard from '../ui/GlassCard';

function GroupsPage() {
  // Track which groups tab is active
  const [activeTab, setActiveTab] = useState('all');

  return (
    <div className="max-w-6xl mx-auto mt-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">People &amp; Groups</h1>
        <p className="text-white/70 text-sm">
          Discover approved communities and submit your own for admin approval.
        </p>
      </div>

      {/* Create community form */}
      <CreateGroupForm />

      {/* Tab Navigation */}
      <GlassCard className="flex gap-1 p-1">
        {[
          { id: 'all', label: 'All Communities' },
          { id: 'my', label: 'My Communities' },
          { id: 'recommended', label: 'Recommended' },
        ].map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            animate={{
              backgroundColor: activeTab === tab.id ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
            }}
            className={`flex-1 rounded-2xl px-4 py-3 font-semibold transition-all ${
              activeTab === tab.id
                ? 'border border-white/10 text-[var(--accent)]'
                : 'border border-transparent text-white/70 hover:text-white'
            }`}
          >
            {tab.label}
          </motion.button>
        ))}
      </GlassCard>

      {/* Content */}
      {activeTab === 'all' && <GroupsList />}
      {activeTab === 'my' && <MyCommunities />}
      {activeTab === 'recommended' && <RecommendedGroups />}
    </div>
  );
}

export default GroupsPage;

