// Compact card for a user in the directory grid
import MagneticCard from '../ui/MagneticCard';
import Button from '../ui/Button';

function UserCard({ profile, onClick }) {
  // Limit interests shown on card
  const displayInterests = profile.interests?.slice(0, 3) || [];
  const remainingInterests = (profile.interests?.length || 0) - displayInterests.length;

  return (
    <MagneticCard
      onClick={() => onClick(profile)}
      className="relative overflow-hidden cursor-pointer group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" aria-hidden />
      <div className="relative flex flex-col h-full">
        {/* Header with Avatar */}
        <div className="flex items-start gap-3 mb-4">
          {/* Avatar Circle */}
          <div className="h-12 w-12 flex-shrink-0 rounded-full bg-gradient-to-br from-[var(--accent)] to-[#6ee7b7] flex items-center justify-center text-white text-lg font-bold">
            {profile.name.charAt(0).toUpperCase()}
          </div>
          
          {/* User Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-white truncate">
              {profile.name}
            </h3>
            <p className="text-xs text-white/70 truncate">
              {profile.major}
            </p>
            <p className="text-xs text-white/50 mt-0.5">
              {profile.year}
            </p>
          </div>
        </div>

        {/* Bio Preview */}
        {profile.bio && (
          <p className="text-sm text-white/80 mb-3 line-clamp-2">
            {profile.bio}
          </p>
        )}

        {/* Interests */}
        <div className="flex flex-wrap gap-1 mb-3">
          {displayInterests.map((interest, index) => (
            <span
              key={index}
              className="rounded-full bg-white/10 px-2 py-1 text-[11px] text-white/80"
            >
              {interest}
            </span>
          ))}
          {remainingInterests > 0 && (
            <span className="rounded-full bg-white/5 px-2 py-1 text-[11px] text-white/60">
              +{remainingInterests} more
            </span>
          )}
        </div>

        {/* View Profile Button */}
        <div className="mt-auto pt-3 border-t border-white/10">
          <Button size="sm" fullWidth>
            View Profile
          </Button>
        </div>
      </div>
    </MagneticCard>
  );
}

export default UserCard;