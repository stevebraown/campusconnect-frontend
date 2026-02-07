import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { chatAPI } from '../../services/api';
import { initializeSocket, registerUser } from '../../services/socket';
import ConversationList from './ConversationList';
import MessageView from './MessageView';
import NewChatModal from './NewChatModal';
import GlassCard from '../ui/GlassCard';
import Button from '../ui/Button';
import Icon from '../ui/Icon';
import { Plus, MessageCircle } from '../ui/icons';

function ChatPage() {
  const { currentUser } = useAuth();
  const { conversations, loading, error, loadConversations, markAsRead, updateConversation } = useChat();
  const [searchParams] = useSearchParams();
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [showNewChat, setShowNewChat] = useState(false);

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
            updateConversation(conv);
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
          updateConversation(conv);
        }
      });
      return;
    }

    if (communityId && currentUser?.uid) {
      chatAPI.getByCommunity(communityId).then((res) => {
        if (res.success && res.data?.conversation) {
          const conv = res.data.conversation;
          setSelectedConversation(conv);
          updateConversation(conv);
        }
      });
    }
  }, [searchParams.get('userId'), searchParams.get('communityId'), searchParams.get('conversationId'), currentUser?.uid]);

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
    updateConversation(conv);
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
            onMarkAsRead={markAsRead}
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
