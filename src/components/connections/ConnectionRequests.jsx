// List of incoming connection requests
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  getConnectionRequests, 
  acceptConnection, 
  rejectConnection 
} from '../../services/connectionService';
import GlassCard from '../ui/GlassCard';
import EmptyState from '../ui/EmptyState';
import Skeleton from '../ui/Skeleton';
import Button from '../ui/Button';
import Icon from '../ui/Icon';
import { Mail, MailOpen, CheckCircle, XCircle, Loader } from '../ui/icons';

function ConnectionRequests() {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    if (currentUser) {
      loadRequests();
    }
  }, [currentUser]);

  const loadRequests = async () => {
    setLoading(true);
    const result = await getConnectionRequests(currentUser.uid);
    
    if (result.success) {
      setRequests(result.requests);
    }
    
    setLoading(false);
  };

  const handleAccept = async (connectionId) => {
    setProcessingId(connectionId);
    
    const result = await acceptConnection(connectionId);
    
    if (result.success) {
      // Remove from requests list
      setRequests(prev => prev.filter(req => req.id !== connectionId));
      console.log('✅ Connection accepted!');
    }
    
    setProcessingId(null);
  };

  const handleReject = async (connectionId) => {
    setProcessingId(connectionId);
    
    const result = await rejectConnection(connectionId);
    
    if (result.success) {
      // Remove from requests list
      setRequests(prev => prev.filter(req => req.id !== connectionId));
      console.log('✅ Connection rejected');
    }
    
    setProcessingId(null);
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto mt-8">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <Icon icon={Mail} size={24} className="text-[var(--accent)]" decorative />
          Connection Requests
        </h2>
        <p className="text-white/70">
          People who want to connect with you
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, idx) => (
              <Skeleton key={idx} className="h-24" />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && requests.length === 0 && (
        <EmptyState
          icon={MailOpen}
          title="No Pending Requests"
          description="When someone wants to connect with you, you'll see it here"
        />
      )}

      {/* Requests List */}
      {!loading && requests.length > 0 && (
        <div className="space-y-4">
          {/* Count Badge */}
          <GlassCard className="mb-6">
            <p className="text-white/80">
              You have{' '}
              <span className="font-bold text-[var(--accent)] text-2xl">
                {requests.length}
              </span>{' '}
              pending {requests.length === 1 ? 'request' : 'requests'}
            </p>
          </GlassCard>

          {/* Request Cards */}
          {requests.map((request) => (
            <GlassCard key={request.id} className="mb-4">
              <div className="flex items-start justify-between gap-4">
                {/* User Info */}
                <div className="flex items-start gap-4 flex-1">
                  {/* Avatar */}
                  <div className="w-16 h-16 bg-gradient-to-br from-campus-green-400 to-campus-green-600 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                    {(request.fromUserName || 'U').charAt(0).toUpperCase()}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-white">
                      {request.fromUserName || 'Unknown User'}
                    </h3>
                    <p className="text-sm text-white/70 truncate">
                      {request.fromUserEmail || 'No email available'}
                    </p>
                    <p className="text-xs text-white/60 mt-2">
                      Sent {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 flex-shrink-0">
                  <Button
                    onClick={() => handleAccept(request.id)}
                    disabled={processingId === request.id}
                    size="sm"
                    icon={processingId === request.id ? <Icon icon={Loader} size={14} className="animate-spin" decorative /> : <Icon icon={CheckCircle} size={14} decorative />}
                  >
                    {processingId === request.id ? 'Processing...' : 'Accept'}
                  </Button>
                  <Button
                    onClick={() => handleReject(request.id)}
                    disabled={processingId === request.id}
                    variant="ghost"
                    size="sm"
                    icon={<Icon icon={XCircle} size={14} decorative />}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}

export default ConnectionRequests;