import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import {
  initializeSocket,
  sendMessage,
  onNewMessage,
  offNewMessage,
  disconnectSocket,
  getSocket,
} from '../services/socket';
import GlassCard from './ui/GlassCard';
import Input from './ui/Input';
import Button from './ui/Button';
import Skeleton from './ui/Skeleton';
// AI safety API (campusconnect-ai) used to moderate outgoing messages.
import { safetyAPI } from '../services/api';

function RealtimeChat() {
  // State for managing chat session and UI
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [connected, setConnected] = useState(false);
  const [username, setUsername] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  // AI safety feedback for message moderation.
  const [safetyNotice, setSafetyNotice] = useState(null);

  // Anchor for auto-scrolling to the latest message
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Socket lifecycle and message subscriptions
  // Initialize socket
  useEffect(() => {
    if (isRegistered && username) {
      const userData = {
        userId: `user-${Date.now()}`,
        username: username,
      };

      const socket = initializeSocket(userData);

      // Listen for socket connection events
      socket.on('connect', () => {
        console.log('Socket connected!');
        setConnected(true);
      });

      socket.on('disconnect', () => {
        console.log('Socket disconnected!');
        setConnected(false);
      });

      // Set initial connection status
      setConnected(socket.connected);

      // Listen for new messages
      onNewMessage((message) => {
        console.log('Received message:', message);
        setMessages((prev) => [...prev, message]);
      });

      // Cleanup on unmount
      return () => {
        offNewMessage();
        const currentSocket = getSocket();
        if (currentSocket) {
          currentSocket.off('connect');
          currentSocket.off('disconnect');
        }
        disconnectSocket();
      };
    }
  }, [isRegistered, username]);

  // Handle registering a new chat participant
  const handleRegister = (e) => {
    e.preventDefault();
    if (username.trim()) {
      setIsRegistered(true);
    }
  };

  // Handle message submission to the socket
  // AI safety check before sending a message (student-facing).
  const handleSendMessage = async (e) => {
    e.preventDefault();

    // Clear prior safety notice on each attempt.
    setSafetyNotice(null);

    if (newMessage.trim() && connected) {
      // AI-driven safety moderation (campusconnect-ai).
      const safetyResult = await safetyAPI.checkContent({
        content: newMessage.trim(),
        contentType: 'message',
      });

      // If safety check reports unsafe content, block the send.
      if (safetyResult.success && safetyResult.data?.safe === false) {
        // Block unsafe content and show reason.
        setSafetyNotice({
          action: safetyResult.data?.recommendedAction || 'block',
          flags: safetyResult.data?.flags || [],
        });
        return;
      }
      // If safety API fails, proceed with existing behavior (no hard block).

      const messageData = {
        userId: `user-${Date.now()}`,
        username: username,
        text: newMessage.trim(),
      };

      sendMessage(messageData);
      setNewMessage('');
    }
  };

  // Registration Form
  if (!isRegistered) {
    return (
      <div className="mx-auto mt-10 w-full max-w-2xl">
        <GlassCard>
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/60">Chat</p>
              <h2 className="text-xl font-bold">Join the live channel</h2>
            </div>
            <div className="flex items-center gap-2 text-xs text-white/60">
              <span className="h-2 w-2 rounded-full bg-red-400 animate-pulse" />
              Disconnected
            </div>
          </div>
          <form onSubmit={handleRegister} className="mt-4 space-y-4">
            <Input
              label="Username"
              placeholder="Your handle..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
            />
            <Button type="submit" fullWidth disabled={!username.trim()}>
              Join Chat
            </Button>
          </form>
        </GlassCard>
      </div>
    );
  }

  // Chat Interface
  return (
    <div className="mx-auto mt-8 w-full max-w-5xl">
      <GlassCard className="p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/60">Chat</p>
            <h2 className="text-xl font-bold">Realtime Lounge</h2>
            <p className="text-sm text-white/60">Real-time messaging with live presence and instant delivery.</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-white/70">
            <span className={`h-2 w-2 rounded-full ${connected ? 'bg-[var(--accent)]' : 'bg-red-400'} animate-pulse`} />
            {connected ? 'Connected' : 'Connecting...'}
          </div>
        </div>

        <div className="border-b border-white/10 bg-white/5 px-5 py-3 text-sm text-white/80">
          Chatting as <span className="font-semibold text-white">{username}</span>
        </div>

        <div className="h-[440px] overflow-y-auto px-4 py-4 scrollbar-future">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-white/60">
              <Skeleton className="h-20 w-full max-w-md" />
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            <LayoutGroup>
              <div className="flex flex-col gap-3">
                <AnimatePresence initial={false}>
                  {messages.map((msg, index) => {
                    const isOwnMessage = msg.username === username;
                    return (
                      <motion.div
                        key={msg.id || index}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.2 }}
                        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[78%] rounded-2xl px-4 py-3 shadow-[0_15px_40px_rgba(0,0,0,0.35)] ${
                            isOwnMessage
                              ? 'bg-[var(--accent)] text-white'
                              : 'bg-white/10 border border-white/10 backdrop-blur-xl text-white'
                          }`}
                        >
                          <p className={`text-xs font-semibold ${isOwnMessage ? 'text-white/80' : 'text-[var(--accent)]'}`}>
                            {msg.username}
                          </p>
                          <p className="text-sm leading-relaxed break-words">{msg.text}</p>
                          <p className="text-[11px] text-white/60 mt-1">
                            {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : 'now'}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>
            </LayoutGroup>
          )}
        </div>

        <div className="border-t border-white/10 px-5 py-4">
          {/* AI safety notice for blocked/warned content */}
          {safetyNotice && (
            <div className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
              Message blocked by safety checks ({safetyNotice.action}).
            </div>
          )}
          <form onSubmit={handleSendMessage} className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="flex-1">
              <Input
                placeholder={connected ? 'Type your message…' : 'Connecting...'}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                disabled={!connected}
              />
            </div>
            <Button type="submit" disabled={!connected || !newMessage.trim()}>
              Send
            </Button>
          </form>
        </div>
      </GlassCard>
    </div>
  );
}

export default RealtimeChat;