import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { helpAI } from '../../services/api';
import GlassCard from '../ui/GlassCard';
import Button from '../ui/Button';
import Icon from '../ui/Icon';
import { Send, Bot, Loader, Trash, ExternalLink } from '../ui/icons';

const CHAT_EXPIRY_MS = 72 * 60 * 60 * 1000; // 72 hours
const MAX_QUESTION_LENGTH = 1000;
const MAX_HISTORY_MESSAGES = 10;

/**
 * Load chat history from localStorage
 * @param {string} userId - User ID for storage key
 * @returns {Array} - Array of messages or empty array
 */
function loadChatHistory(userId) {
  const key = userId ? `campusconnect_help_chat_${userId}` : 'campusconnect_help_chat_guest';
  
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return [];
    
    const chatState = JSON.parse(stored);
    const now = Date.now();
    const age = now - (chatState.lastUpdatedAt || 0);
    
    if (age > CHAT_EXPIRY_MS) {
      // Expired - clear and return empty
      localStorage.removeItem(key);
      return [];
    }
    
    return chatState.messages || [];
  } catch (err) {
    console.error('Failed to load chat history:', err);
    // Clear corrupted data
    const key = userId ? `campusconnect_help_chat_${userId}` : 'campusconnect_help_chat_guest';
    localStorage.removeItem(key);
    return [];
  }
}

/**
 * Save chat history to localStorage
 * @param {string} userId - User ID for storage key
 * @param {Array} messages - Array of messages
 */
function saveChatHistory(userId, messages) {
  const key = userId ? `campusconnect_help_chat_${userId}` : 'campusconnect_help_chat_guest';
  
  try {
    const chatState = {
      messages,
      lastUpdatedAt: Date.now(),
    };
    localStorage.setItem(key, JSON.stringify(chatState));
  } catch (err) {
    console.error('Failed to save chat history:', err);
    // Handle quota exceeded error if needed
    if (err.name === 'QuotaExceededError') {
      console.warn('localStorage quota exceeded. Clearing old chat history.');
      // Could implement LRU eviction here if needed
    }
  }
}

/**
 * Clear chat history from localStorage
 * @param {string} userId - User ID for storage key
 */
function clearChatHistory(userId) {
  const key = userId ? `campusconnect_help_chat_${userId}` : 'campusconnect_help_chat_guest';
  localStorage.removeItem(key);
}

function HelpAIChat({ userId }) {
  const { currentUser } = useAuth();
  const effectiveUserId = userId || currentUser?.uid;
  
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Load chat history on mount
  useEffect(() => {
    if (effectiveUserId !== undefined) {
      const history = loadChatHistory(effectiveUserId);
      setMessages(history);
    }
  }, [effectiveUserId]);

  // Save chat history whenever messages change
  useEffect(() => {
    if (effectiveUserId !== undefined && messages.length > 0) {
      saveChatHistory(effectiveUserId, messages);
    }
  }, [messages, effectiveUserId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e?.preventDefault();
    
    const trimmedInput = input.trim();
    
    if (!trimmedInput || loading || trimmedInput.length > MAX_QUESTION_LENGTH) {
      return;
    }

    // Create user message
    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmedInput,
      createdAt: Date.now(),
    };

    // Optimistically add user message
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setError(null);
    setLoading(true);

    // Build history payload (last 10 messages, excluding sources)
    // Note: Don't include the current user message in history - it's sent as the question
    const historyPayload = messages
      .slice(-MAX_HISTORY_MESSAGES)
      .map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

    try {
      const result = await helpAI.askQuestion(trimmedInput, historyPayload);

      if (result.success && result.data) {
        const assistantMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: result.data.answer,
          sources: result.data.sources || [],
          createdAt: Date.now(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error(result.error?.message || 'Failed to get AI response');
      }
    } catch (err) {
      console.error('AI Help error:', err);
      
      // Extract error message from API response
      let errorMessage = 'Something went wrong. Please try again later.';
      if (err.message) {
        errorMessage = err.message;
      } else if (err.error?.message) {
        errorMessage = err.error.message;
      } else if (err.error && typeof err.error === 'string') {
        errorMessage = err.error;
      }
      
      // If there are validation details, show them
      if (err.error?.data?.details && Array.isArray(err.error.data.details)) {
        errorMessage = err.error.data.details.join('. ');
      }
      
      setError(errorMessage);
      
      // Remove optimistic user message on error (optional - we keep it for context)
      // setMessages(messages);
    } finally {
      setLoading(false);
      // Focus input after sending
      inputRef.current?.focus();
    }
  };

  const handleClearChat = () => {
    if (window.confirm('Are you sure you want to clear the chat history?')) {
      setMessages([]);
      clearChatHistory(effectiveUserId);
      setError(null);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const characterCount = input.length;
  const trimmedInput = input.trim();
  const canSend = trimmedInput.length > 0 && trimmedInput.length <= MAX_QUESTION_LENGTH && !loading;

  return (
    <GlassCard className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-[var(--accent)]/20">
            <Icon icon={Bot} size={20} className="text-[var(--accent)]" decorative />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Ask AI</h3>
            <p className="text-xs text-white/60">Get instant help with university questions</p>
          </div>
        </div>
        {messages.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            icon={<Icon icon={Trash} size={14} decorative />}
            onClick={handleClearChat}
            title="Clear chat"
          >
            Clear
          </Button>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 min-h-[300px] max-h-[500px] pr-2">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <Icon icon={Bot} size={48} className="text-white/30 mb-4" decorative />
            <p className="text-white/70 text-sm mb-2">
              Ask me anything about UEL!
            </p>
            <p className="text-white/50 text-xs">
              I can help with student finance, accommodation, wellbeing, and more.
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-[var(--accent)] text-white'
                    : 'bg-white/10 text-white border border-white/10'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                
                {/* Sources for assistant messages */}
                {message.role === 'assistant' && message.sources && message.sources.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <p className="text-xs text-white/60 mb-2">Sources:</p>
                    <div className="flex flex-wrap gap-2">
                      {message.sources.map((url, idx) => {
                        try {
                          const urlObj = new URL(url);
                          return (
                            <a
                              key={idx}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 hover:underline break-all"
                            >
                              <span>{urlObj.hostname}</span>
                              <Icon icon={ExternalLink} size={12} decorative />
                            </a>
                          );
                        } catch {
                          // Invalid URL, skip
                          return null;
                        }
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {/* Loading indicator */}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white/10 text-white border border-white/10 rounded-2xl px-4 py-3 flex items-center gap-2">
              <Icon icon={Loader} size={16} className="animate-spin" decorative />
              <span className="text-sm text-white/70">Thinking...</span>
            </div>
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30">
          <p className="text-sm text-red-200">{error}</p>
        </div>
      )}

      {/* Input Area */}
      <form onSubmit={handleSend} className="space-y-2">
        <div className="relative">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about UEL..."
            disabled={loading}
            maxLength={MAX_QUESTION_LENGTH}
            rows={2}
            className="w-full px-4 py-3 pr-20 rounded-xl border border-white/15 bg-black/30 backdrop-blur-xl text-white placeholder:text-white/50 focus:outline-none focus:border-[var(--accent)]/70 focus:bg-black/40 focus:shadow-[0_0_0_2px_rgba(46,204,113,0.3)] resize-none disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <div className="absolute bottom-3 right-3 flex items-center gap-2">
            <span
              className={`text-xs ${
                characterCount > MAX_QUESTION_LENGTH
                  ? 'text-red-400'
                  : characterCount > MAX_QUESTION_LENGTH * 0.9
                  ? 'text-yellow-400'
                  : 'text-white/50'
              }`}
            >
              {characterCount}/{MAX_QUESTION_LENGTH}
            </span>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              icon={<Icon icon={loading ? Loader : Send} size={14} className={loading ? 'animate-spin' : ''} decorative />}
              disabled={!canSend}
            >
              Send
            </Button>
          </div>
        </div>
        <p className="text-xs text-white/50">
          Press Enter to send, Shift+Enter for new line
        </p>
      </form>
    </GlassCard>
  );
}

export default HelpAIChat;
