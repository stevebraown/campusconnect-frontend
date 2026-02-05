import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { helpAPI } from '../../services/api';
import { groupsAPI } from '../../services/api';
import GlassCard from '../ui/GlassCard';
import Button from '../ui/Button';
import Icon from '../ui/Icon';
import { X, ChevronDown, ChevronUp, BookOpen, Users, Shield, ExternalLink, Mail, Phone, CheckCircle } from '../ui/icons';
import { useToast } from '../../hooks/useToast';

function CategoryDetailPanel({ category, onClose }) {
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const [expandedSections, setExpandedSections] = useState({
    selfHelp: true, // Auto-expand on open
    peer: false,
    professional: false,
  });
  const [viewedSections, setViewedSections] = useState(new Set());
  const [clickedResources, setClickedResources] = useState(new Set());
  const [relevantGroups, setRelevantGroups] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(false);

  // Load relevant groups when peer section is expanded
  useEffect(() => {
    if (expandedSections.peer && category?.peer?.groupsTopics?.length > 0) {
      loadRelevantGroups();
    }
  }, [expandedSections.peer, category]);

  const loadRelevantGroups = async () => {
    setLoadingGroups(true);
    try {
      const result = await groupsAPI.getGroups({ limit: 20 });
      if (result.success && result.data?.groups) {
        // Filter groups by topic overlap
        const topics = category.peer.groupsTopics.map(t => t.toLowerCase().trim());
        const filtered = result.data.groups.filter(group => {
          const groupTopics = (group.topics || []).map(t => t.toLowerCase().trim());
          return topics.some(topic => groupTopics.includes(topic));
        });
        setRelevantGroups(filtered.slice(0, 5)); // Limit to 5
      }
    } catch (err) {
      console.error('Error loading relevant groups:', err);
    } finally {
      setLoadingGroups(false);
    }
  };

  const toggleSection = (section) => {
    const isExpanding = !expandedSections[section];
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));

    // Log view event when section is expanded for first time
    if (isExpanding && !viewedSections.has(section)) {
      logJourneyEvent('view', section);
      setViewedSections(prev => new Set([...prev, section]));
    }
  };

  const logJourneyEvent = async (action, step, resourceId = null) => {
    if (!currentUser || !category) return;
    try {
      await helpAPI.logJourneyEvent({
        categoryId: category.id,
        step,
        action,
        resourceId,
      });
    } catch (err) {
      console.error('Error logging journey event:', err);
    }
  };

  const handleResourceClick = (step, resourceId, isProfessionalService = false) => {
    const clickKey = `${step}-${resourceId}`;
    if (!clickedResources.has(clickKey)) {
      logJourneyEvent('click', step, resourceId);
      setClickedResources(prev => new Set([...prev, clickKey]));

      // Check for journey completion
      if (isProfessionalService && expandedSections.professional) {
        checkJourneyComplete();
      }
    }
  };

  const checkJourneyComplete = () => {
    // Journey is complete if:
    // 1. Professional section is expanded
    // 2. At least one professional service was clicked
    const hasClickedProfessional = Array.from(clickedResources).some(key => key.startsWith('professional-'));
    if (hasClickedProfessional) {
      addToast(
        "You've reached the professional support options for this topic. If you need urgent help, please use the most direct contact method listed.",
        { type: 'info', duration: 8000 }
      );
    }
  };

  if (!category) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <GlassCard
        className="max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">{category.label}</h2>
            <p className="text-sm text-white/60">Explore resources and support options</p>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white rounded-lg p-2 hover:bg-white/10 transition-colors"
            aria-label="Close panel"
          >
            <Icon icon={X} size={24} decorative />
          </button>
        </div>

        {/* Self-Help Section */}
        <div className="mb-4">
          <button
            onClick={() => toggleSection('selfHelp')}
            className="w-full flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Icon icon={BookOpen} size={20} className="text-[var(--accent)]" decorative />
              <h3 className="text-lg font-semibold text-white">Self-help</h3>
            </div>
            <Icon
              icon={expandedSections.selfHelp ? ChevronUp : ChevronDown}
              size={20}
              className="text-white/60"
              decorative
            />
          </button>
          {expandedSections.selfHelp && category.selfHelp?.items && (
            <div className="mt-3 space-y-3 pl-4">
              {category.selfHelp.items.map((item, index) => (
                <GlassCard key={index} className="p-4">
                  <h4 className="font-semibold text-white mb-2">{item.title}</h4>
                  <p className="text-sm text-white/70 mb-3">{item.description}</p>
                  {item.url && (
                    <Button
                      variant="primary"
                      size="sm"
                      icon={<Icon icon={ExternalLink} size={14} decorative />}
                      onClick={() => {
                        handleResourceClick('selfHelp', index.toString());
                        window.open(item.url, '_blank');
                      }}
                    >
                      View Resource
                    </Button>
                  )}
                </GlassCard>
              ))}
            </div>
          )}
        </div>

        {/* Peer Support Section */}
        <div className="mb-4">
          <button
            onClick={() => toggleSection('peer')}
            className="w-full flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Icon icon={Users} size={20} className="text-[var(--accent)]" decorative />
              <h3 className="text-lg font-semibold text-white">Peer Support</h3>
            </div>
            <Icon
              icon={expandedSections.peer ? ChevronUp : ChevronDown}
              size={20}
              className="text-white/60"
              decorative
            />
          </button>
          {expandedSections.peer && (
            <div className="mt-3 space-y-4 pl-4">
              {/* Mentors */}
              {category.peer?.mentors && category.peer.mentors.length > 0 && (
                <div>
                  <h4 className="font-semibold text-white mb-3">Mentors & Peers</h4>
                  <div className="space-y-3">
                    {category.peer.mentors.map((mentor, index) => (
                      <GlassCard key={index} className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h5 className="font-semibold text-white">{mentor.name}</h5>
                            <p className="text-sm text-white/70">{mentor.role}</p>
                          </div>
                          <div className="flex gap-2">
                            {mentor.email && (
                              <Button
                                variant="ghost"
                                size="sm"
                                icon={<Icon icon={Mail} size={14} decorative />}
                                onClick={() => {
                                  handleResourceClick('peer', `mentor-${index}`);
                                  window.location.href = `mailto:${mentor.email}`;
                                }}
                              >
                                Email
                              </Button>
                            )}
                            {mentor.url && (
                              <Button
                                variant="ghost"
                                size="sm"
                                icon={<Icon icon={ExternalLink} size={14} decorative />}
                                onClick={() => {
                                  handleResourceClick('peer', `mentor-${index}`);
                                  window.open(mentor.url, '_blank');
                                }}
                              >
                                View Profile
                              </Button>
                            )}
                          </div>
                        </div>
                      </GlassCard>
                    ))}
                  </div>
                </div>
              )}

              {/* Relevant Groups */}
              {category.peer?.groupsTopics && category.peer.groupsTopics.length > 0 && (
                <div>
                  <h4 className="font-semibold text-white mb-3">Relevant Communities</h4>
                  {loadingGroups ? (
                    <p className="text-sm text-white/60">Loading communities...</p>
                  ) : relevantGroups.length > 0 ? (
                    <div className="space-y-2">
                      {relevantGroups.map((group) => (
                        <GlassCard key={group.id} className="p-3">
                          <h5 className="font-semibold text-white mb-1">{group.title}</h5>
                          <p className="text-xs text-white/70 line-clamp-2">{group.aim}</p>
                        </GlassCard>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-white/60">No relevant communities found</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Professional Support Section */}
        <div className="mb-4">
          <button
            onClick={() => toggleSection('professional')}
            className="w-full flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Icon icon={Shield} size={20} className="text-[var(--accent)]" decorative />
              <h3 className="text-lg font-semibold text-white">Professional Support</h3>
            </div>
            <Icon
              icon={expandedSections.professional ? ChevronUp : ChevronDown}
              size={20}
              className="text-white/60"
              decorative
            />
          </button>
          {expandedSections.professional && category.professional?.services && (
            <div className="mt-3 space-y-3 pl-4">
              {category.professional.services.map((service, index) => (
                <GlassCard key={index} className="p-4">
                  <h4 className="font-semibold text-white mb-2">{service.name}</h4>
                  <p className="text-sm text-white/70 mb-3">{service.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {service.url && (
                      <Button
                        variant="primary"
                        size="sm"
                        icon={<Icon icon={ExternalLink} size={14} decorative />}
                        onClick={() => {
                          handleResourceClick('professional', index.toString(), true);
                          window.open(service.url, '_blank');
                        }}
                      >
                        Visit Website
                      </Button>
                    )}
                    {service.email && (
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Icon icon={Mail} size={14} decorative />}
                        onClick={() => {
                          handleResourceClick('professional', index.toString(), true);
                          window.location.href = `mailto:${service.email}`;
                        }}
                      >
                        Email
                      </Button>
                    )}
                    {service.phone && (
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Icon icon={Phone} size={14} decorative />}
                        onClick={() => {
                          handleResourceClick('professional', index.toString(), true);
                          window.location.href = `tel:${service.phone}`;
                        }}
                      >
                        {service.phone}
                      </Button>
                    )}
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}

export default CategoryDetailPanel;
