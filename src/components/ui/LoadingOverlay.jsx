/**
 * Loading Overlay Component
 * Displays a loading GIF with glass-styled container
 */

import GlassCard from './GlassCard';

// Import loading GIF - adjust import path once file is added to src/assets/branding/
// Place GIF file at: src/assets/branding/campusconnect.gif
// Then uncomment the line below:
// import loadingGif from '../../assets/branding/campusconnect.gif';

// For now, using a fallback spinner until GIF file is added
const loadingGif = null; // Will be set once GIF file is added

/**
 * LoadingOverlay component
 * @param {Object} props
 * @param {boolean} props.fullscreen - Whether to display as full-screen overlay
 * @param {string} props.message - Optional loading message
 * @param {string} props.className - Additional CSS classes
 */
const LoadingContent = ({ message }) => {
  if (loadingGif) {
    return (
      <div className="flex flex-col items-center justify-center gap-4">
        <img
          src={loadingGif}
          alt="Loading..."
          className="h-16 w-16 md:h-20 md:w-20 object-contain"
          aria-hidden="true"
        />
        {message && (
          <p className="text-sm text-white/70 font-medium">{message}</p>
        )}
      </div>
    );
  }
  // Fallback spinner if GIF file doesn't exist yet
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="animate-spin rounded-full h-16 w-16 md:h-20 md:w-20 border-4 border-white/20 border-t-[var(--accent)]" aria-hidden="true" />
      {message && (
        <p className="text-sm text-white/70 font-medium">{message}</p>
      )}
    </div>
  );
};

function LoadingOverlay({ fullscreen = false, message, className = '' }) {
  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <GlassCard className="p-8 md:p-12">
          <LoadingContent message={message} />
        </GlassCard>
      </div>
    );
  }

  return (
    <GlassCard className={`flex items-center justify-center p-8 md:p-12 ${className}`}>
      <LoadingContent message={message} />
    </GlassCard>
  );
}

export default LoadingOverlay;
