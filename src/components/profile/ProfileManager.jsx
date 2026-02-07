// Profile flow container for view and edit states
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userAPI } from '../../services/api';
import ProfileForm from './ProfileForm';
import ProfileDisplay from './ProfileDisplay';
import GlassCard from '../ui/GlassCard';
import Skeleton from '../ui/Skeleton';

function ProfileManager() {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const result = await userAPI.getProfile();

      // userAPI.getProfile returns { success, user, profile }
      if (result.success && result.data?.profile) {
        setProfile(result.data.profile);
        setIsEditing(false);
      } else {
        // No profile exists, show form
        setProfile(null);
        setIsEditing(true);
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      // On error, show form to allow creation
      setProfile(null);
      setIsEditing(true);
    }

    setLoading(false);
  };

  // Load profile when component mounts
  useEffect(() => {
    if (currentUser) {
      loadProfile();
    }
  }, [currentUser]);

  const handleProfileComplete = (newProfile) => {
    setProfile(newProfile);
    setIsEditing(false);
    loadProfile(); // Reload to get the saved version
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  if (!currentUser) {
    return null;
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto mt-8 space-y-6">
        <GlassCard>
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-4 w-64" />
        </GlassCard>
        <GlassCard>
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
          <Skeleton className="h-32 mb-4" />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 4 }).map((_, idx) => (
              <Skeleton key={idx} className="h-8 w-24" />
            ))}
          </div>
        </GlassCard>
      </div>
    );
  }

  if (isEditing) {
    return (
      <ProfileForm
        existingProfile={profile}
        onComplete={handleProfileComplete}
      />
    );
  }

  if (profile) {
    return <ProfileDisplay profile={profile} onEdit={handleEdit} />;
  }

  // Shouldn't reach here, but just in case
  return (
    <div className="glass-panel max-w-2xl mx-auto mt-8 text-center py-12">
      <p className="text-[var(--text-muted)]">No profile found. Creating new profile...</p>
      <ProfileForm onComplete={handleProfileComplete} />
    </div>
  );
}

export default ProfileManager;