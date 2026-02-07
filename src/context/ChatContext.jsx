import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { chatAPI } from '../services/api';
import { onConversationMessage, offConversationMessage, onSocketStatusChange } from '../services/socket';

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const { currentUser } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const loadConversations = useCallback(async () => {
    if (!currentUser?.uid) return;
    setLoading(true);
    setError(null);
    try {
      const res = await chatAPI.getConversations({ limit: 50 });
      if (res.success && res.data?.conversations) {
        setConversations(res.data.conversations);
      } else {
        setError(res.error?.message || 'Failed to load conversations');
      }
    } catch (err) {
      setError(err?.message || 'Failed to load conversations');
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.uid]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (!currentUser?.uid) return;
    const handleNewMessage = () => loadConversations();
    onConversationMessage(handleNewMessage);
    return () => offConversationMessage(handleNewMessage);
  }, [currentUser?.uid, loadConversations]);

  // Polling fallback: when socket disconnected and chat is open, poll conversations
  useEffect(() => {
    if (!isChatOpen || !currentUser?.uid) return;

    let intervalId;
    const unsubscribe = onSocketStatusChange((connected) => {
      if (!connected && !intervalId) {
        intervalId = setInterval(loadConversations, 15000);
      } else if (connected && intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    });

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [isChatOpen, currentUser?.uid, loadConversations]);

  const markAsRead = useCallback(async (conversationId) => {
    if (!conversationId) return;
    try {
      await chatAPI.markRead(conversationId);
      setConversations((prev) =>
        prev.map((c) => (c.id === conversationId ? { ...c, unreadCount: 0 } : c))
      );
    } catch (err) {
      // Ignore - list refresh on next load will correct
    }
  }, []);

  const updateConversation = useCallback((conv) => {
    setConversations((prev) => {
      const idx = prev.findIndex((c) => c.id === conv.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], ...conv };
        return next;
      }
      return [conv, ...prev];
    });
  }, []);

  const totalUnreadChats = conversations.filter((c) => (c.unreadCount ?? 0) > 0).length;

  const value = {
    conversations,
    loading,
    error,
    loadConversations,
    markAsRead,
    updateConversation,
    totalUnreadChats,
    isChatOpen,
    setIsChatOpen,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) {
    throw new Error('useChat must be used within ChatProvider');
  }
  return ctx;
}

/** Safe hook for components that may render outside ChatProvider (e.g. SideMenu) */
export function useChatOptional() {
  return useContext(ChatContext);
}
