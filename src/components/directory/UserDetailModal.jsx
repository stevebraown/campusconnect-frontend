// Modal showing full profile details and connection actions
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  sendConnectionRequest,
  getConnectionStatus,
  acceptConnection,
  rejectConnection,
  CONNECTION_STATUS
} from '../../services/connectionService';
import GlassCard from '../ui/GlassCard';
import Button from '../ui/Button';
import Icon from '../ui/Icon';
import { X, Handshake, MessageCircle, Clock, CheckCircle, Loader, Sparkles } from '../ui/icons';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const getProfileById = async (uid, token) => {
  const res = await fetch(`${API_BASE_URL}/api/users/${uid}/profile`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  if (!res.ok) {
    return { success: false, profile: null };
  }

  const data = await res.json().catch(() => ({}));
  return data?.success ? { success: true, profile: data.profile } : { success: false, profile: null };
};

function UserDetailModal({ profile, onClose }) {
  const { currentUser, token } = useAuth();
  const navigate = useNavigate();
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [connectionData, setConnectionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [currentUserProfile, setCurrentUserProfile] = useState(null);
  const [message, setMessage] = useState('');

  const loadCurrentUserProfile = async () => {
    const result = await getProfileById(currentUser.uid, token);
    if (result.success) {
      setCurrentUserProfile(result.profile);
    }
  };

  const checkConnectionStatus = async () => {
    const result = await getConnectionStatus(currentUser.uid, profile.userId);
    if (result.success) {
      setConnectionStatus(result.status);
      setConnectionData(result.connection);

      // Connection accepted - Message button will use userId for chat
    }
  };

  useEffect(() => {
    if (profile && currentUser) {
      checkConnectionStatus();
      loadCurrentUserProfile();
    }
  }, [profile, currentUser]);

  const handleConnect = async () => {
    if (!currentUserProfile) {
      setMessage('Please complete your profile first');
      return;
    }

    setLoading(true);
    setMessage('');

    const result = await sendConnectionRequest(
      currentUser.uid,
      profile.userId,
      currentUserProfile
    );

    if (result.success) {
      setConnectionStatus(CONNECTION_STATUS.PENDING);
      setMessage('success');
      setTimeout(() => setMessage(''), 3000);
      // Refresh connection status to get full connection data
      await checkConnectionStatus();
    } else {
      setMessage(result.error || 'Failed to send request');
    }

    setLoading(false);
  };

  const handleAccept = async () => {
    if (!connectionData?.id) return;

    setProcessing(true);
    setMessage('');

    const result = await acceptConnection(connectionData.id);

    if (result.success) {
      setConnectionStatus(CONNECTION_STATUS.ACCEPTED);
      setMessage('success');
      setTimeout(() => setMessage(''), 3000);
      await checkConnectionStatus();
    } else {
      setMessage(result.error || 'Failed to accept connection');
    }

    setProcessing(false);
  };

  const handleReject = async () => {
    if (!connectionData?.id) return;

    setProcessing(true);
    setMessage('');

    const result = await rejectConnection(connectionData.id);

    if (result.success) {
      setConnectionStatus(null);
      setConnectionData(null);
      setMessage('Connection request rejected');
      setTimeout(() => setMessage(''), 3000);
    } else {
      setMessage(result.error || 'Failed to reject connection');
    }

    setProcessing(false);
  };

  const handleMessage = () => {
    // Navigate to chat with conversation (by-user will get or create)
    navigate(`/chat?userId=${profile.userId}`);
    onClose();
  };

  const getButtonProps = () => {
    if (loading || processing) {
      return {
        icon: <Icon icon={Loader} size={16} className="animate-spin" decorative />,
        children: loading ? 'Sending...' : 'Processing...',
      };
    }

    if (connectionStatus === CONNECTION_STATUS.PENDING) {
      // Check if this is an incoming request (user is the receiver)
      const isIncoming = connectionData?.isIncoming;
      if (isIncoming) {
        // Don't show button - we'll show Accept/Reject buttons separately
        return null;
      }
      // Outgoing request
      return {
        icon: <Icon icon={Clock} size={16} decorative />,
        children: 'Request Pending',
        variant: 'soft',
        disabled: true,
      };
    }

    if (connectionStatus === CONNECTION_STATUS.ACCEPTED) {
      return {
        icon: <Icon icon={CheckCircle} size={16} decorative />,
        children: 'Connected',
        variant: 'soft',
        disabled: true,
      };
    }

    return {
      icon: <Icon icon={Handshake} size={16} decorative />,
      children: 'Connect',
    };
  };

  if (!profile) return null;

  const isConnected = connectionStatus === CONNECTION_STATUS.ACCEPTED;
  const isPending = connectionStatus === CONNECTION_STATUS.PENDING;
  const isIncomingRequest = connectionStatus === CONNECTION_STATUS.PENDING && connectionData?.isIncoming;
  const isOutgoingRequest = connectionStatus === CONNECTION_STATUS.PENDING && connectionData?.isOutgoing;
  const canConnect = !connectionStatus;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <GlassCard
        className="max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative overflow-hidden rounded-t-2xl bg-gradient-to-r from-[var(--accent)]/20 via-[var(--accent-2)]/10 to-[var(--accent)]/20 p-6 border-b border-white/10">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="w-20 h-20 bg-[var(--accent)]/30 rounded-full flex items-center justify-center text-4xl font-bold text-white border-2 border-white/20">
                {profile.name.charAt(0).toUpperCase()}
              </div>

              {/* Name & Major */}
              <div>
                <h2 className="text-2xl font-bold mb-1 text-white">{profile.name}</h2>
                <p className="text-white/80">{profile.email}</p>
                <p className="text-white/70 text-sm mt-1">
                  {profile.major} • {profile.year}
                </p>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white rounded-lg p-2 hover:bg-white/10 transition-colors"
              aria-label="Close modal"
            >
              <Icon icon={X} size={24} decorative />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Success/Error Message */}
          {message && (
            <GlassCard className={`mb-4 p-3 ${message === 'success'
                ? 'bg-emerald-500/15 border-emerald-500/30'
                : 'bg-red-500/15 border-red-500/30'
              }`}>
              <div className="flex items-center gap-2 text-sm">
                {message === 'success' ? (
                  <>
                    <Icon icon={Sparkles} size={18} className="text-emerald-400" decorative />
                    <span className="text-white font-semibold">Connection request sent!</span>
                  </>
                ) : (
                  <>
                    <Icon icon={X} size={18} className="text-red-400" decorative />
                    <span className="text-white font-semibold">{message}</span>
                  </>
                )}
              </div>
            </GlassCard>
          )}

          {/* Bio */}
          {profile.bio && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-2">
                About
              </h3>
              <GlassCard className="p-4">
                <p className="text-white/80">{profile.bio}</p>
              </GlassCard>
            </div>
          )}

          {/* Interests */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">
              Interests ({profile.interests?.length || 0})
            </h3>
            <div className="flex flex-wrap gap-2">
              {profile.interests && profile.interests.length > 0 ? (
                profile.interests.map((interest, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-[var(--accent)]/20 text-[var(--accent)] rounded-full font-medium border border-[var(--accent)]/30"
                  >
                    {interest}
                  </span>
                ))
              ) : (
                <p className="text-white/60 text-sm">No interests listed</p>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <GlassCard className="p-4 text-center">
              <p className="text-2xl font-bold text-[var(--accent)]">
                {profile.interests?.length || 0}
              </p>
              <p className="text-sm text-white/70">Interests</p>
            </GlassCard>
            <GlassCard className="p-4 text-center">
              <p className="text-2xl font-bold text-[var(--accent)]">0</p>
              <p className="text-sm text-white/70">Connections</p>
            </GlassCard>
            <GlassCard className="p-4 text-center">
              <p className="text-2xl font-bold text-[var(--accent)]">0</p>
              <p className="text-sm text-white/70">Events</p>
            </GlassCard>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {isIncomingRequest ? (
              <>
                <Button
                  onClick={handleAccept}
                  disabled={processing}
                  fullWidth
                  icon={processing ? <Icon icon={Loader} size={16} className="animate-spin" decorative /> : <Icon icon={CheckCircle} size={16} decorative />}
                >
                  Accept
                </Button>
                <Button
                  onClick={handleReject}
                  disabled={processing}
                  variant="ghost"
                  fullWidth
                  icon={<Icon icon={X} size={16} decorative />}
                >
                  Reject
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={handleConnect}
                  disabled={!canConnect || loading || processing}
                  fullWidth
                  {...getButtonProps()}
                />
                <Button
                  variant="ghost"
                  fullWidth
                  disabled={!isConnected}
                  onClick={handleMessage}
                  icon={<Icon icon={MessageCircle} size={16} decorative />}
                >
                  Message
                </Button>
              </>
            )}
          </div>

          {/* Connection Status Info */}
          {isIncomingRequest && (
            <GlassCard className="mt-4 bg-blue-500/15 border-blue-500/30 p-3">
              <div className="flex items-center gap-2 text-sm text-white/90">
                <Icon icon={Clock} size={16} className="text-blue-400" decorative />
                <span>{profile.name} wants to connect with you</span>
              </div>
            </GlassCard>
          )}

          {isOutgoingRequest && (
            <GlassCard className="mt-4 bg-blue-500/15 border-blue-500/30 p-3">
              <div className="flex items-center gap-2 text-sm text-white/90">
                <Icon icon={Clock} size={16} className="text-blue-400" decorative />
                <span>Waiting for {profile.name} to accept your connection request</span>
              </div>
            </GlassCard>
          )}

          {isConnected && (
            <GlassCard className="mt-4 bg-emerald-500/15 border-emerald-500/30 p-3">
              <div className="flex items-center gap-2 text-sm text-white/90">
                <Icon icon={CheckCircle} size={16} className="text-emerald-400" decorative />
                <span>You and {profile.name} are connected!</span>
              </div>
            </GlassCard>
          )}

          {/* Member Since */}
          <div className="mt-6 text-center text-sm text-white/60">
            Member since {new Date(profile.createdAt).toLocaleDateString()}
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

export default UserDetailModal;