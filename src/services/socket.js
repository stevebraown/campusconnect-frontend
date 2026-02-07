// Socket client helpers for realtime features
import { io } from 'socket.io-client';

/**
 * Socket.io Client Service
 * Manages WebSocket connection to backend
 */

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';

let socket = null;

const proximityEvent = 'proximity:nearby-suggestion';

/**
 * Initialize socket connection
 * @param {Object} userData - User information for registration
 * @returns {Object} - Socket instance
 */
export const initializeSocket = (userData) => {
  if (socket) {
    console.log('Socket already initialized');
    return socket;
  }

  const token = localStorage.getItem('jwt') || '';
  socket = io(SOCKET_URL, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    auth: {
      token,
    },
  });

  // Connection events
  socket.on('connect', () => {
    console.log('✅ Socket connected:', socket.id);
    
    // Register user if data provided
    if (userData) {
      socket.emit('user:register', userData);
    }
  });

  socket.on('disconnect', (reason) => {
    console.log('❌ Socket disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });

  socket.on('reconnect', (attemptNumber) => {
    console.log(`🔄 Socket reconnected after ${attemptNumber} attempts`);
  });

  return socket;
};

/**
 * Listen for socket reconnect (for re-joining rooms)
 * @param {Function} callback
 */
export const onReconnect = (callback) => {
  if (socket) {
    socket.on('reconnect', callback);
  }
};

/**
 * Remove reconnect listener
 * @param {Function} callback
 */
export const offReconnect = (callback) => {
  if (socket) {
    socket.off('reconnect', callback);
  }
};

/**
 * Get current socket instance
 * @returns {Object|null} - Socket instance or null
 */
export const getSocket = () => {
  return socket;
};

/**
 * Disconnect socket
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('Socket disconnected manually');
  }
};

/**
 * Check if socket is connected
 * @returns {boolean}
 */
export const isSocketConnected = () => {
  return socket && socket.connected;
};

/**
 * Register user on socket
 * @param {Object} userData - User data {userId, username}
 */
export const registerUser = (userData) => {
  if (socket && socket.connected) {
    socket.emit('user:register', userData);
  }
};

/**
 * Send chat message
 * @param {Object} message - Message object
 */
export const sendMessage = (message) => {
  if (socket && socket.connected) {
    socket.emit('chat:send-message', message);
  }
};

/**
 * Listen for new messages
 * @param {Function} callback - Callback function
 */
export const onNewMessage = (callback) => {
  if (socket) {
    socket.on('chat:new-message', callback);
  }
};

/**
 * Remove message listener
 */
export const offNewMessage = () => {
  if (socket) {
    socket.off('chat:new-message');
  }
};

/**
 * Listen for user status changes
 * @param {Function} callback - Callback function
 */
export const onUserStatus = (callback) => {
  if (socket) {
    socket.on('user:status', callback);
  }
};

/**
 * Remove user status listener
 */
export const offUserStatus = () => {
  if (socket) {
    socket.off('user:status');
  }
};

/**
 * Emit typing indicator
 * @param {Object} data - {userId, username, isTyping}
 */
export const emitTyping = (data) => {
  if (socket && socket.connected) {
    socket.emit('chat:typing', data);
  }
};

/**
 * Listen for typing indicators
 * @param {Function} callback - Callback function
 */
export const onUserTyping = (callback) => {
  if (socket) {
    socket.on('chat:user-typing', callback);
  }
};

/**
 * Update location
 * @param {Object} locationData - {lat, lng}
 */
export const updateLocation = (locationData) => {
  if (socket && socket.connected) {
    socket.emit('location:update', locationData);
  }
};

export const onProximityMatch = (callback) => {
  if (socket) {
    socket.on(proximityEvent, callback);
  }
};

export const offProximityMatch = (callback) => {
  if (socket) {
    socket.off(proximityEvent, callback);
  }
};

/**
 * Join a conversation room for real-time messages
 * @param {string} conversationId
 * @param {Function} callback - (result) => void, result: { ok, error?, room? }
 */
export const joinConversation = (conversationId, callback) => {
  if (socket && socket.connected) {
    socket.emit('chat:join-conversation', { conversationId }, (result) => {
      if (typeof callback === 'function') callback(result);
    });
  } else if (typeof callback === 'function') {
    callback({ ok: false, error: 'Not connected' });
  }
};

/**
 * Leave a conversation room
 * @param {string} conversationId
 */
export const leaveConversation = (conversationId) => {
  if (socket && socket.connected) {
    socket.emit('chat:leave-conversation', { conversationId });
  }
};

/**
 * Listen for new messages in conversation (chat:new-message from room)
 * @param {Function} callback
 */
export const onConversationMessage = (callback) => {
  if (socket) {
    socket.on('chat:new-message', callback);
  }
};

/**
 * Remove conversation message listener
 * @param {Function} [callback] - If provided, removes only this callback; otherwise removes all
 */
export const offConversationMessage = (callback) => {
  if (socket) {
    if (typeof callback === 'function') {
      socket.off('chat:new-message', callback);
    } else {
      socket.off('chat:new-message');
    }
  }
};


export default {
  initializeSocket,
  getSocket,
  disconnectSocket,
  isSocketConnected,
  registerUser,
  sendMessage,
  onNewMessage,
  offNewMessage,
  onUserStatus,
  offUserStatus,
  emitTyping,
  onUserTyping,
  updateLocation,
  onProximityMatch,
  offProximityMatch,
};