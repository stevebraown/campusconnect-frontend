// Connections hub with tabs and user detail modal
import { useState } from 'react';
import { motion } from 'framer-motion';
import ConnectionRequests from './ConnectionRequests';
import ConnectionsList from './ConnectionsList';
import UserDetailModal from '../directory/UserDetailModal';
import GlassCard from '../ui/GlassCard';

function ConnectionsManager() {
  const [activeTab, setActiveTab] = useState('connections');
  const [selectedUser, setSelectedUser] = useState(null);

  const handleUserClick = (profile) => {
    setSelectedUser(profile);
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
  };

  return (
    <>
      <div className="mx-auto w-full max-w-5xl">
        {/* Tab Navigation - Glass Style */}
        <GlassCard className="mb-8 flex gap-1 p-1">
          {[
            { id: 'connections', label: 'My Connections' },
            { id: 'requests', label: 'Requests' },
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
      </div>

      {/* Content */}
      {activeTab === 'connections' && (
        <ConnectionsList onUserClick={handleUserClick} />
      )}
      
      {activeTab === 'requests' && (
        <ConnectionRequests />
      )}

      {/* User Detail Modal */}
      <UserDetailModal profile={selectedUser} onClose={handleCloseModal} />
    </>
  );
}

export default ConnectionsManager;