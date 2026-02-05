import { connectionsAPI } from './api';

/**
 * Connection Status Types
 */
export const CONNECTION_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
};

/**
 * Send a connection request
 * @param {string} fromUserId - User sending request (not used, kept for API compatibility)
 * @param {string} toUserId - User receiving request
 * @param {Object} fromUserData - Sender's profile data (not used, kept for API compatibility)
 * @returns {Promise<Object>}
 */
export const sendConnectionRequest = async (fromUserId, toUserId, fromUserData) => {
  try {
    const result = await connectionsAPI.sendRequest(toUserId);
    
    if (result.success) {
      console.log('✅ Connection request sent');
      return { success: true, connectionId: result.data?.connectionId };
    } else {
      return { 
        success: false, 
        error: result.error?.message || result.error || 'Failed to send connection request'
      };
    }
  } catch (error) {
    console.error('❌ Error sending connection request:', error);
    return { success: false, error: error.message || 'Network error' };
  }
};

/**
 * Get all connection requests for a user
 * @param {string} userId - User ID (not used, backend uses JWT to identify user)
 * @returns {Promise<Object>}
 */
export const getConnectionRequests = async (userId) => {
  try {
    const result = await connectionsAPI.getRequests();
    
    if (result.success) {
      const requests = result.data?.requests || [];
      console.log(`✅ Found ${requests.length} pending requests`);
      return { success: true, requests };
    } else {
      return { success: false, error: result.error?.message || result.error, requests: [] };
    }
  } catch (error) {
    console.error('❌ Error getting connection requests:', error);
    return { success: false, error: error.message, requests: [] };
  }
};

/**
 * Get all connections for a user (accepted only)
 * @param {string} userId - User ID (not used, backend uses JWT to identify user)
 * @returns {Promise<Object>}
 */
export const getUserConnections = async (userId) => {
  try {
    const result = await connectionsAPI.getConnections();
    
    if (result.success) {
      const connections = result.data?.connections || [];
      console.log(`✅ Found ${connections.length} connections`);
      return { success: true, connections };
    } else {
      return { success: false, error: result.error?.message || result.error, connections: [] };
    }
  } catch (error) {
    console.error('❌ Error getting connections:', error);
    return { success: false, error: error.message, connections: [] };
  }
};

/**
 * Accept a connection request
 * @param {string} connectionId - Connection document ID
 * @returns {Promise<Object>}
 */
export const acceptConnection = async (connectionId) => {
  try {
    const result = await connectionsAPI.acceptConnection(connectionId);
    
    if (result.success) {
      console.log('✅ Connection accepted:', connectionId);
      return { success: true };
    } else {
      return { success: false, error: result.error?.message || result.error };
    }
  } catch (error) {
    console.error('❌ Error accepting connection:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Reject a connection request
 * @param {string} connectionId - Connection document ID
 * @returns {Promise<Object>}
 */
export const rejectConnection = async (connectionId) => {
  try {
    const result = await connectionsAPI.rejectConnection(connectionId);
    
    if (result.success) {
      console.log('✅ Connection rejected:', connectionId);
      return { success: true };
    } else {
      return { success: false, error: result.error?.message || result.error };
    }
  } catch (error) {
    console.error('❌ Error rejecting connection:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Remove/cancel a connection
 * @param {string} connectionId - Connection document ID
 * @returns {Promise<Object>}
 */
export const removeConnection = async (connectionId) => {
  try {
    // Backend doesn't have a delete endpoint yet, so we'll reject it for now
    // TODO: Add DELETE /api/connections/:id endpoint
    const result = await connectionsAPI.rejectConnection(connectionId);
    
    if (result.success) {
      console.log('✅ Connection removed:', connectionId);
      return { success: true };
    } else {
      return { success: false, error: result.error?.message || result.error };
    }
  } catch (error) {
    console.error('❌ Error removing connection:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Check connection status between two users
 * @param {string} userId1 - First user ID (current user from JWT - not used, backend uses JWT)
 * @param {string} userId2 - Second user ID (other user)
 * @returns {Promise<Object>}
 */
export const getConnectionStatus = async (userId1, userId2) => {
  try {
    const result = await connectionsAPI.getConnectionStatus(userId2);
    
    if (result.success) {
      return {
        success: true,
        status: result.data?.status || null,
        connection: result.data?.connection || null,
      };
    }
    
    return { success: true, status: null, connection: null };
  } catch (error) {
    console.error('❌ Error checking connection status:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get thread ID for a connection (returns null if not connected)
 * @param {string} userId1 - First user ID (current user from JWT - not used)
 * @param {string} userId2 - Second user ID (other user)
 * @returns {Promise<Object>}
 */
export const getThreadId = async (userId1, userId2) => {
  try {
    const result = await connectionsAPI.getThreadId(userId2);
    
    if (result.success) {
      return {
        success: true,
        threadId: result.data?.threadId || null,
      };
    }
    
    return { success: true, threadId: null };
  } catch (error) {
    console.error('❌ Error getting thread ID:', error);
    return { success: false, error: error.message, threadId: null };
  }
};

export default {
  sendConnectionRequest,
  getConnectionRequests,
  getUserConnections,
  acceptConnection,
  rejectConnection,
  removeConnection,
  getConnectionStatus,
  getThreadId,
  CONNECTION_STATUS,
};