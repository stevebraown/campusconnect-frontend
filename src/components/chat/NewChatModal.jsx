import { useState, useEffect } from 'react';
import { connectionsAPI, groupsAPI, chatAPI } from '../../services/api';
import GlassCard from '../ui/GlassCard';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Icon from '../ui/Icon';
import { X, Users, User, Search } from '../ui/icons';

function NewChatModal({ onClose, onConversationCreated }) {
  const [tab, setTab] = useState('connections');
  const [connections, setConnections] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [connRes, groupsRes] = await Promise.all([
          connectionsAPI.getConnections(),
          groupsAPI.getMyGroups({ limit: 50 }),
        ]);
        if (connRes.success && connRes.data?.connections) {
          setConnections(connRes.data.connections);
        }
        if (groupsRes.success && groupsRes.data?.groups) {
          setMyGroups(groupsRes.data.groups);
        }
      } catch (err) {
        setError(err?.message || 'Failed to load');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredConnections = connections.filter((c) => {
    const name = (c.connectedUserName || c.connectedUserId || '').toLowerCase();
    return name.includes(search.toLowerCase());
  });

  const filteredGroups = myGroups.filter((g) =>
    (g.title || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleStartWithUser = async (userId) => {
    setCreating(true);
    setError(null);
    try {
      const res = await chatAPI.getByUser(userId);
      if (res.success && res.data?.conversation) {
        onConversationCreated(res.data.conversation);
        onClose();
      } else {
        setError(res.error?.message || 'Failed to start chat');
      }
    } catch (err) {
      setError(err?.message || 'Failed to start chat');
    } finally {
      setCreating(false);
    }
  };

  const handleOpenCommunityChat = async (groupId) => {
    setCreating(true);
    setError(null);
    try {
      const res = await chatAPI.getByCommunity(groupId);
      if (res.success && res.data?.conversation) {
        onConversationCreated(res.data.conversation);
        onClose();
      } else {
        setError(res.error?.message || 'Failed to open chat');
      }
    } catch (err) {
      setError(err?.message || 'Failed to open chat');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <GlassCard
        className="max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">New Chat</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10"
            aria-label="Close"
          >
            <Icon icon={X} size={20} decorative />
          </button>
        </div>

        <div className="flex border-b border-white/10">
          <button
            onClick={() => setTab('connections')}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${
              tab === 'connections'
                ? 'text-[var(--accent)] border-b-2 border-[var(--accent)]'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Icon icon={User} size={16} decorative />
            Connections
          </button>
          <button
            onClick={() => setTab('communities')}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${
              tab === 'communities'
                ? 'text-[var(--accent)] border-b-2 border-[var(--accent)]'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Icon icon={Users} size={16} decorative />
            Communities
          </button>
        </div>

        <div className="p-4">
          <Input
            placeholder="Search…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-4"
          />
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4 scrollbar-future">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/15 border border-red-500/30 text-red-200 text-sm">
              {error}
            </div>
          )}
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-12 rounded-xl bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : tab === 'connections' ? (
            <div className="space-y-2">
              {filteredConnections.length === 0 ? (
                <p className="text-white/50 text-sm py-4">No connections found. Connect with people first.</p>
              ) : (
                filteredConnections.map((c) => {
                  const otherId = c.connectedUserId;
                  const displayName = c.connectedUserName || otherId?.slice(0, 8) || 'Unknown';
                  return (
                    <button
                      key={c.id}
                      onClick={() => handleStartWithUser(otherId)}
                      disabled={creating}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-colors text-left"
                    >
                      <div className="w-10 h-10 rounded-full bg-[var(--accent)]/30 flex items-center justify-center text-white font-semibold">
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-white">{displayName}</span>
                    </button>
                  );
                })
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredGroups.length === 0 ? (
                <p className="text-white/50 text-sm py-4">You haven't joined any communities yet.</p>
              ) : (
                filteredGroups.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => handleOpenCommunityChat(g.id)}
                    disabled={creating}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/30 flex items-center justify-center">
                      <Icon icon={Users} size={20} className="text-[var(--accent)]" decorative />
                    </div>
                    <span className="font-medium text-white">{g.title}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}

export default NewChatModal;
