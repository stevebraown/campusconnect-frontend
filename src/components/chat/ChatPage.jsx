import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { chatAPI } from '../../services/api';
import { initializeSocket, registerUser, onConversationMessage, offConversationMessage } from '../../services/socket';
import ConversationList from './ConversationList';
import MessageView from './MessageView';
import NewChatModal from './NewChatModal';
import GlassCard from '../ui/GlassCard';
import Button from '../ui/Button';
import Icon from '../ui/Icon';
import { Plus, MessageCircle } from '../ui/icons';

function ChatPage() {
  const { currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNewChat, setShowNewChat] = useState(false);

  const loadConversations = useCallback(async () => {
    if (!currentUser) return;
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
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Resolve ?userId= or ?communityId= or ?conversationId= from URL
  useEffect(() => {
    const userId = searchParams.get('userId');
    const communityId = searchParams.get('communityId');
    const conversationId = searchParams.get('conversationId');

    if (conversationId) {
      const existing = conversations.find((c) => c.id === conversationId);
      if (existing) {
        setSelectedConversation(existing);
      } else {
        chatAPI.getConversation(conversationId).then((res) => {
          if (res.success && res.data?.conversation) {
            const conv = res.data.conversation;
            setSelectedConversation(conv);
            setConversations((prev) => {
              const idx = prev.findIndex((c) => c.id === conv.id);
              if (idx >= 0) {
                const next = [...prev];
                next[idx] = conv;
                return next;
              }
              return [conv, ...prev];
            });
          }
        });
      }
      return;
    }

    if (userId && currentUser?.uid) {
      chatAPI.getByUser(userId).then((res) => {
        if (res.success && res.data?.conversation) {
          const conv = res.data.conversation;
          setSelectedConversation(conv);
          setConversations((prev) => {
            const idx = prev.findIndex((c) => c.id === conv.id);
            if (idx >= 0) return prev;
            return [conv, ...prev];
          });
        }
      });
      return;
    }

    if (communityId && currentUser?.uid) {
      chatAPI.getByCommunity(communityId).then((res) => {
        if (res.success && res.data?.conversation) {
          const conv = res.data.conversation;
          setSelectedConversation(conv);
          setConversations((prev) => {
            const idx = prev.findIndex((c) => c.id === conv.id);
            if (idx >= 0) return prev;
            return [conv, ...prev];
          });
        }
      });
    }
  }, [searchParams.get('userId'), searchParams.get('communityId'), searchParams.get('conversationId'), currentUser?.uid]);

  // Subscribe to new messages and refresh conversation list for any incoming message
  useEffect(() => {
    if (!currentUser?.uid) return;
    const handleConversationMessage = () => {
      loadConversations();
    };
    onConversationMessage(handleConversationMessage);
    return () => offConversationMessage(handleConversationMessage);
  }, [currentUser?.uid, loadConversations]);

  // Initialize socket when user is logged in
  useEffect(() => {
    if (!currentUser?.uid) return;
    const socket = initializeSocket({
      userId: currentUser.uid,
      username: currentUser.email || currentUser.displayName || 'User',
    });
    socket.on('connect', () => {
      registerUser({
        userId: currentUser.uid,
        username: currentUser.email || currentUser.displayName || 'User',
      });
    });
  }, [currentUser?.uid, currentUser?.email, currentUser?.displayName]);

  const handleConversationCreated = (conv) => {
    setConversations((prev) => {
      const idx = prev.findIndex((c) => c.id === conv.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = conv;
        return next;
      }
      return [conv, ...prev];
    });
    setSelectedConversation(conv);
  };

  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto mt-8">
        <GlassCard className="p-8 text-center">
          <p className="text-white/70">Please sign in to use chat.</p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto mt-6 h-[calc(100vh-12rem)] min-h-[400px]">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-white">Messages</h1>
        <p className="text-sm text-white/60">
          Chat with your connections and communities
        </p>
      </div>

      <div className="flex gap-4 h-full min-h-0">
        <div className="w-80 shrink-0 flex flex-col min-h-0">
          <div className="mb-2">
            <Button
              onClick={() => setShowNewChat(true)}
              icon={<Icon icon={Plus} size={18} decorative />}
              fullWidth
            >
              New Chat
            </Button>
          </div>
          <ConversationList
            conversations={conversations}
            loading={loading}
            error={error}
            selectedId={selectedConversation?.id}
            onSelect={setSelectedConversation}
            onRefresh={loadConversations}
          />
        </div>
        <div className="flex-1 min-w-0 flex flex-col">
          <MessageView
            conversation={selectedConversation}
            currentUser={currentUser}
          />
        </div>
      </div>

      {showNewChat && (
        <NewChatModal
          onClose={() => setShowNewChat(false)}
          onConversationCreated={handleConversationCreated}
        />
      )}
    </div>
  );
}

export default ChatPage;
