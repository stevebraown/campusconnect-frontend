// Events hub with create form and tabs
import { useState } from 'react';
import { motion } from 'framer-motion';
import CreateEventForm from './CreateEventForm';
import EventsList from './EventsList';
import MyEvents from './MyEvents';
import RecommendedEvents from './RecommendedEvents';
import GlassCard from '../ui/GlassCard';

function EventsPage() {
  // Track which events tab is active
  const [activeTab, setActiveTab] = useState('all');

  return (
    <div className="max-w-6xl mx-auto mt-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Events &amp; Timetable</h1>
        <p className="text-white/70 text-sm">
          Browse approved events and submit your own for admin approval.
        </p>
      </div>

      {/* Create event form */}
      <CreateEventForm />

      {/* Tab Navigation */}
      <GlassCard className="flex gap-1 p-1">
        {[
          { id: 'all', label: 'All Events' },
          { id: 'my', label: 'My Events' },
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
      {activeTab === 'all' && <EventsList />}
      {activeTab === 'my' && <MyEvents />}
      {activeTab === 'recommended' && <RecommendedEvents />}
    </div>
  );
}

export default EventsPage;

