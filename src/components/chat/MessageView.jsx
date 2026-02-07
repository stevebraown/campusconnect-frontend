import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { chatAPI } from '../../services/api';
import { safetyAPI } from '../../services/api';
import {
  initializeSocket,
  registerUser,
  joinConversation,
  leaveConversation,
  onConversationMessage,
  offConversationMessage,
  onReconnect,
  offReconnect,
  getSocket,
} from '../../services/socket';
import GlassCard from '../ui/GlassCard';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Skeleton from '../ui/Skeleton';
import Icon from '../ui/Icon';
import { Send, MessageCircle } from '../ui/icons';

function MessageView({ conversation, currentUser, onMarkAsRead }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [safetyNotice, setSafetyNotice] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mark conversation as read when viewing
  useEffect(() => {
    if (conversation?.id && onMarkAsRead) {
      onMarkAsRead(conversation.id);
    }
  }, [conversation?.id, onMarkAsRead]);

  // Load messages
  useEffect(() => {
    if (!conversation?.id) {
      setMessages([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    chatAPI.getMessages(conversation.id, { limit: 50 })
      .then((res) => {
        if (res.success && res.data?.messages) {
          setMessages(res.data.messages);
        } else {
          setMessages([]);
        }
      })
      .catch(() => setMessages([]))
      .finally(() => setLoading(false));
  }, [conversation?.id]);

  // Socket: ensure connected and registered, join room, listen for new messages
  useEffect(() => {
    if (!currentUser?.uid || !conversation?.id) return;

    const socket = getSocket();
    if (!socket) {
      const s = initializeSocket({
        userId: currentUser.uid,
        username: currentUser.email || currentUser.displayName || 'User',
      });
      registerUser({
        userId: currentUser.uid,
        username: currentUser.email || currentUser.displayName || 'User',
      });
    }

    setSocketConnected(!!getSocket()?.connected);

    const rejoin = () => {
      registerUser({
        userId: currentUser.uid,
        username: currentUser.email || currentUser.displayName || 'User',
      });
      joinConversation(conversation.id, (result) => {
        if (!result.ok) console.warn('Failed to join conversation room:', result.error);
      });
    };

    const onConnect = () => {
      setSocketConnected(true);
      rejoin();
    };

    const onReconnectHandler = () => {
      setSocketConnected(true);
      rejoin();
    };

    const s = getSocket();
    if (s) {
      s.on('connect', onConnect);
      onReconnect(onReconnectHandler);
      if (s.connected) {
        rejoin();
      }
    }

    const handleNewMessage = (msg) => {
      if (msg.conversationId === conversation.id) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      }
    };

    onConversationMessage(handleNewMessage);

    return () => {
      leaveConversation(conversation.id);
      offConversationMessage(handleNewMessage);
      offReconnect(onReconnectHandler);
      if (s) s.off('connect', onConnect);
    };
  }, [conversation?.id, currentUser?.uid, currentUser?.email, currentUser?.displayName]);

  const handleSend = async (e) => {
    e.preventDefault();
    setSafetyNotice(null);
    const content = inputValue.trim();
    if (!content || !conversation?.id || sending) return;

    const safetyResult = await safetyAPI.checkContent({
      content,
      contentType: 'message',
    });
    if (safetyResult.success && safetyResult.data?.safe === false) {
      setSafetyNotice({
        action: safetyResult.data?.recommendedAction || 'block',
        flags: safetyResult.data?.flags || [],
      });
      return;
    }

    setSending(true);
    const res = await chatAPI.sendMessage(conversation.id, content);
    setSending(false);
    if (res.success && res.data?.message) {
      setMessages((prev) => {
        if (prev.some((m) => m.id === res.data.message.id)) return prev;
        return [...prev, res.data.message];
      });
      setInputValue('');
      // List refresh handled by ChatPage's global chat:new-message subscription
    }
  };

  if (!conversation) {
    return (
      <GlassCard className="flex flex-col flex-1 items-center justify-center p-8 text-center">
        <Icon icon={MessageCircle} size={48} className="text-white/30 mb-4" decorative />
        <p className="text-white/60">Select a conversation or start a new chat</p>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="flex flex-col flex-1 p-0 overflow-hidden min-h-0">
      <div className="px-4 py-3 border-b border-white/10">
        <h3 className="font-semibold text-white">{conversation.name || 'Chat'}</h3>
        <p className="text-xs text-white/50">
          {conversation.type === 'community' ? 'Community chat' : 'Private chat'}
          {socketConnected && ' • Live'}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-future min-h-[200px]">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-3/4" />
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-white/50 text-sm">
            <p>No messages yet. Say hello!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <AnimatePresence initial={false}>
              {messages.map((msg) => {
                const isOwn = msg.senderId === currentUser?.uid;
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[78%] rounded-2xl px-4 py-2.5 ${
                        isOwn
                          ? 'bg-[var(--accent)] text-white'
                          : 'bg-white/10 border border-white/10 text-white'
                      }`}
                    >
                      {!isOwn && (
                        <p className="text-xs font-semibold text-[var(--accent)] mb-0.5">
                          {msg.senderName || 'Unknown'}
                        </p>
                      )}
                      <p className="text-sm break-words">{msg.content}</p>
                      <p className="text-[11px] opacity-70 mt-1">
                        {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="border-t border-white/10 p-4">
        {safetyNotice && (
          <div className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
            Message blocked by safety checks.
          </div>
        )}
        <form onSubmit={handleSend} className="flex gap-2">
          <Input
            placeholder="Type a message…"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={sending}
            className="flex-1"
          />
          <Button type="submit" disabled={sending || !inputValue.trim()}>
            <Icon icon={Send} size={18} decorative />
          </Button>
        </form>
      </div>
    </GlassCard>
  );
}

export default MessageView;
