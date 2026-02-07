import { useState, useEffect } from 'react';
import { chatAPI } from '../../services/api';
import GlassCard from '../ui/GlassCard';
import Skeleton from '../ui/Skeleton';
import Icon from '../ui/Icon';
import { MessageCircle, Plus, RefreshCw, Users } from '../ui/icons';

function ConversationList({ conversations, loading, error, selectedId, onSelect, onRefresh }) {
  const formatTime = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <GlassCard className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Conversations</h2>
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </GlassCard>
    );
  }

  return (
    <GlassCard className="flex flex-col p-0 overflow-hidden min-h-0 flex-1">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Icon icon={MessageCircle} size={20} className="text-[var(--accent)]" decorative />
          Chats
        </h2>
        <button
          onClick={onRefresh}
          className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Refresh"
        >
          <Icon icon={RefreshCw} size={18} decorative />
        </button>
      </div>
      <div className="overflow-y-auto flex-1 scrollbar-future">
        {error && (
          <div className="p-4 text-red-200 text-sm">{error}</div>
        )}
        {!error && conversations.length === 0 && (
          <div className="p-6 text-center text-white/60 text-sm">
            No conversations yet. Start a new chat!
          </div>
        )}
        {conversations.map((conv) => {
          const unread = (conv.unreadCount ?? 0) > 0;
          return (
          <button
            key={conv.id}
            onClick={() => onSelect(conv)}
            className={`w-full text-left px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors flex items-start gap-3 ${
              selectedId === conv.id ? 'bg-[var(--accent)]/20 border-l-2 border-l-[var(--accent)]' : ''
            }`}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`truncate ${unread ? 'font-bold text-white' : 'font-semibold text-white'}`}>
                  {conv.name || (conv.type === 'community' ? 'Community' : 'Chat')}
                </span>
                {unread && (
                  <span className="shrink-0 min-w-[1.25rem] h-5 px-1.5 rounded-full bg-[var(--accent)] text-white text-xs font-bold flex items-center justify-center">
                    {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
                  </span>
                )}
                {conv.type === 'community' && (
                  <Icon icon={Users} size={14} className="text-white/50 shrink-0" decorative />
                )}
              </div>
              <p className="text-sm text-white/60 truncate mt-0.5">
                {conv.lastMessage || 'No messages yet'}
              </p>
              <p className="text-xs text-white/40 mt-1">
                {formatTime(conv.lastMessageAt || conv.createdAt)}
              </p>
            </div>
          </button>
          );
        })}
      </div>
    </GlassCard>
  );
}

export default ConversationList;
