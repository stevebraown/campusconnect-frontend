// Banner prompting users to complete their profile
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import GlassCard from './ui/GlassCard';
import Button from './ui/Button';
import Icon from './ui/Icon';
import { UserCircle, X, CheckCircle } from './ui/icons';

function OnboardingBanner() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [profileComplete, setProfileComplete] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkProfile = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        const result = await userAPI.getProfile();
        // userAPI.getProfile returns { success, user, profile }
        if (result.success && result.data?.profile) {
          const profile = result.data.profile;
          // Check if profile has essential fields
          const hasName = profile.name && profile.name.trim().length > 0;
          const hasMajor = profile.major && profile.major.trim().length > 0;
          const hasYear = profile.year && profile.year > 0;
          const hasInterests = Array.isArray(profile.interests) && profile.interests.length > 0;
          
          setProfileComplete(hasName && hasMajor && hasYear && hasInterests);
        } else {
          setProfileComplete(false);
        }
      } catch (err) {
        console.error('Error checking profile:', err);
        setProfileComplete(false);
      } finally {
        setLoading(false);
      }
    };

    checkProfile();
  }, [currentUser]);

  // Don't show if profile is complete, dismissed, or still loading
  if (loading || profileComplete || dismissed) {
    return null;
  }

  return (
    <GlassCard className="border-[var(--accent)]/30 bg-gradient-to-r from-[var(--accent)]/10 to-transparent">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <Icon icon={UserCircle} size={24} className="text-[var(--accent)]" decorative />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">
                Complete Your Profile
              </h3>
              <p className="text-sm text-white/70 mb-3">
                Add your name, major, year, and interests to get better matches and connect with students on campus.
              </p>
              <Button
                variant="primary"
                onClick={() => navigate('/profile')}
                className="mt-2"
              >
                Complete Profile
              </Button>
            </div>
            <button
              onClick={() => setDismissed(true)}
              className="flex-shrink-0 p-1 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Dismiss banner"
            >
              <Icon icon={X} size={18} className="text-white/60" decorative />
            </button>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

export default OnboardingBanner;
