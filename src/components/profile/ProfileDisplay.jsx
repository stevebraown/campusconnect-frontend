// Read-only view of a user's profile
import { useAuth } from '../../context/AuthContext';
import Icon from '../ui/Icon';
import { User } from '../ui/icons';

function ProfileDisplay({ profile, onEdit }) {
  const { currentUser } = useAuth();

  if (!profile) {
    return null;
  }

  return (
    <div className="glass-panel max-w-2xl mx-auto mt-8 p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-heading)] flex items-center gap-2">
            <Icon icon={User} size={24} className="text-[var(--accent)]" decorative />
            {profile.name}
          </h2>
          <p className="text-[var(--text-muted)] mt-1">{currentUser.email}</p>
        </div>
        <button
          onClick={onEdit}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-[var(--text-primary)] rounded-lg border border-white/10 transition-colors font-medium text-sm"
        >
          Edit Profile
        </button>
      </div>

      {/* Profile Info Grid */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white/5 border border-white/10 rounded-lg p-4 backdrop-blur-sm">
          <p className="text-sm text-[var(--text-muted)] mb-1">Major</p>
          <p className="font-semibold text-[var(--text-heading)]">{profile.major}</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-lg p-4 backdrop-blur-sm">
          <p className="text-sm text-[var(--text-muted)] mb-1">Academic Year</p>
          <p className="font-semibold text-[var(--text-heading)]">{profile.year}</p>
        </div>
      </div>

      {/* Bio */}
      {profile.bio && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-[var(--text-muted)] mb-2">Bio</h3>
          <p className="text-[var(--text-primary)] bg-white/5 rounded-lg p-4 border border-white/10">
            {profile.bio}
          </p>
        </div>
      )}

      {/* Interests */}
      <div>
        <h3 className="text-sm font-medium text-[var(--text-muted)] mb-3">
          Interests ({profile.interests?.length || 0})
        </h3>
        <div className="flex flex-wrap gap-2">
          {profile.interests && profile.interests.length > 0 ? (
            profile.interests.map((interest, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-[var(--accent)] text-white rounded-full text-sm font-medium shadow-glow"
              >
                {interest}
              </span>
            ))
          ) : (
            <p className="text-[var(--text-muted)] text-sm">No interests added yet</p>
          )}
        </div>
      </div>

      {/* Profile Stats */}
      <div className="mt-6 pt-6 border-t border-white/10">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-[var(--accent)]">
              {profile.interests?.length || 0}
            </p>
            <p className="text-sm text-[var(--text-muted)]">Interests</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-[var(--accent)]">0</p>
            <p className="text-sm text-[var(--text-muted)]">Connections</p>
          </div>
        </div>
      </div>

      {/* Member Since */}
      <div className="mt-4 text-center text-sm text-[var(--text-muted)]">
        Member since {new Date(profile.createdAt).toLocaleDateString()}
      </div>
    </div>
  );
}

export default ProfileDisplay;