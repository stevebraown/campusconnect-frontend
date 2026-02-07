import { API_BASE_URL } from './apiEndpoints';

/**
 * API Service
 * Handles all HTTP requests to the backend
 */

/**
 * Generic API call function
 * @param {string} endpoint - API endpoint path
 * @param {Object} options - Fetch options
 * @returns {Promise} - Response data
 */
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  // Attach JWT if present
  const jwt = localStorage.getItem('jwt');
  if (jwt) {
    defaultOptions.headers['Authorization'] = `Bearer ${jwt}`;
  }
  
  const config = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };
  
  try {
    const response = await fetch(url, config);
    
    // Parse JSON response
    const data = await response.json();
    
    // Check if response is ok
    if (!response.ok) {
      // Handle validation errors with details
      const errorMessage = data.message || data.error || 'Something went wrong';
      const errorDetails = data.details || (data.error && typeof data.error === 'string' ? [data.error] : null);
      
      throw {
        status: response.status,
        message: errorMessage,
        data: {
          ...data,
          details: errorDetails,
        },
      };
    }
    
    return {
      success: true,
      data,
      status: response.status,
    };
    
  } catch (error) {
    // Don't log geofence errors (expected if outside campus)
    const isGeofenceError = error?.data?.error?.includes('geofence') || 
                            error?.data?.error?.includes('Location outside');
    
    if (!isGeofenceError) {
      console.error('API Error:', error);
    }
    
    // Network error or JSON parse error
    if (!error.status) {
      return {
        success: false,
        error: {
          message: 'Network error. Please check your connection.',
          status: 0,
        },
      };
    }
    
    // API error with status
    return {
      success: false,
      error: {
        message: error.message,
        status: error.status,
        data: error.data,
      },
    };
  }
};

/**
 * GET request
 */
export const apiGet = async (endpoint) => {
  return apiCall(endpoint, {
    method: 'GET',
  });
};

/**
 * POST request
 */
export const apiPost = async (endpoint, data) => {
  // Debug logging in development
  if (import.meta.env.DEV && endpoint.includes('/help/ai')) {
    console.log('📤 Sending AI Help request:', {
      question: data?.question?.substring(0, 50),
      questionLength: data?.question?.length,
      historyLength: data?.history?.length || 0,
    });
  }
  return apiCall(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

/**
 * PUT request
 */
export const apiPut = async (endpoint, data) => {
  return apiCall(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

/**
 * PATCH request
 */
export const apiPatch = async (endpoint, data) => {
  return apiCall(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
};

/**
 * DELETE request
 */
export const apiDelete = async (endpoint) => {
  return apiCall(endpoint, {
    method: 'DELETE',
  });
};

/**
 * Health Check - Test backend connection
 */
export const checkHealth = async () => {
  return apiGet('/api/health');
};

/**
 * Get Backend Info
 */
export const getBackendInfo = async () => {
  return apiGet('/');
};

/**
 * Test API Connection
 */
export const testAPI = async () => {
  return apiGet('/api/test');
};

/**
 * Auth API calls
 */
export const authAPI = {
  /**
   * Get current authenticated user (backend JWT)
   * Mirrors GET /api/auth/me
   */
  getMe: () => apiGet('/api/auth/me'),
};

/**
 * User API calls
 */
export const userAPI = {
  // Get current user's profile (returns { success, user, profile })
  getProfile: () => apiGet('/api/users/me'),
  // Get directory of all users (public profiles, excludes current user)
  getAllUsers: (limit = 50, offset = 0) => {
    const query = `?limit=${limit}&offset=${offset}`;
    return apiGet(`/api/users${query}`);
  },
  // Get a specific user's profile by ID
  getUser: (id) => apiGet(`/api/users/${id}`),
  // Update own profile (requires ownership)
  updateProfile: (id, data) => apiPut(`/api/users/${id}`, data),
  // Update location (requires ownership, enforces geofence)
  updateLocation: (id, payload) => apiPatch(`/api/users/${id}/location`, payload),
  // Get current user settings (notifications, privacy)
  getSettings: () => apiGet('/api/users/me/settings'),
  // Update current user settings (notifications, privacy)
  updateSettings: (settings) => apiPatch('/api/users/me/settings', settings),
};

/**
 * Match API calls
 */
export const matchAPI = {
  getRecommendations: (radiusKm) => {
    const q = typeof radiusKm === 'number' ? `?radiusKm=${radiusKm}` : '';
    return apiGet(`/api/match/recommendations${q}`);
  },
  // AI-driven matching proposals via campusconnect-ai (student-facing).
  proposeMatches: (payload = {}) => {
    return apiPost('/api/ai-match/propose', payload);
  },
  confirmMatch: (userId, compatibility = null) =>
    apiPost('/api/match/confirm', { userId, compatibility }),
  getMyMatches: () => apiGet('/api/match/mine'),
};

/**
 * Connections API calls
 */
export const connectionsAPI = {
  sendRequest: (toUserId) => apiPost('/api/connections/request', { toUserId }),
  getRequests: () => apiGet('/api/connections/requests'),
  getConnections: () => apiGet('/api/connections/list'),
  acceptConnection: (id) => apiPatch(`/api/connections/${id}/accept`, {}),
  rejectConnection: (id) => apiPatch(`/api/connections/${id}/reject`, {}),
  getConnectionStatus: (userId) => apiGet(`/api/connections/status/${userId}`),
  getThreadId: (userId) => apiGet(`/api/connections/thread/${userId}`),
};

/**
 * Groups API calls
 */
export const groupsAPI = {
  createGroup: (data) => apiPost('/api/groups', data),
  getGroups: (params = {}) => {
    const query = new URLSearchParams();
    if (params.limit) query.append('limit', params.limit);
    if (params.offset) query.append('offset', params.offset);
    if (params.type) query.append('type', params.type);
    const queryString = query.toString();
    return apiGet(`/api/groups${queryString ? `?${queryString}` : ''}`);
  },
  getGroup: (id) => apiGet(`/api/groups/${id}`),
  joinGroup: (id) => apiPost(`/api/groups/${id}/join`, {}),
  leaveGroup: (id) => apiPost(`/api/groups/${id}/leave`, {}),
  getMyGroups: (params = {}) => {
    const query = new URLSearchParams();
    if (params.limit) query.append('limit', params.limit);
    if (params.offset) query.append('offset', params.offset);
    const queryString = query.toString();
    return apiGet(`/api/groups/my/joined${queryString ? `?${queryString}` : ''}`);
  },
  getRecommendedGroups: (limit = 10) => {
    return apiGet(`/api/groups/recommended?limit=${limit}`);
  },
  // AI-driven group recommendations via campusconnect-ai (student-facing).
  getAiRecommendedGroups: (payload = {}) => {
    return apiPost('/api/groups/recommendations', payload);
  },
  // Admin routes
  getPendingGroups: (params = {}) => {
    const query = new URLSearchParams();
    if (params.limit) query.append('limit', params.limit);
    if (params.offset) query.append('offset', params.offset);
    const queryString = query.toString();
    return apiGet(`/api/groups/admin/pending${queryString ? `?${queryString}` : ''}`);
  },
  getAllGroups: (params = {}) => {
    const query = new URLSearchParams();
    if (params.status) query.append('status', params.status);
    if (params.limit) query.append('limit', params.limit);
    if (params.offset) query.append('offset', params.offset);
    const queryString = query.toString();
    return apiGet(`/api/groups/admin/all${queryString ? `?${queryString}` : ''}`);
  },
  approveGroup: (id) => apiPatch(`/api/groups/${id}/approve`, {}),
  rejectGroup: (id, reason) => apiPatch(`/api/groups/${id}/reject`, { reason }),
};

/**
 * Events API calls
 */
export const eventsAPI = {
  createEvent: (data) => apiPost('/api/events', data),
  getEvents: (params = {}) => {
    const query = new URLSearchParams();
    if (params.limit) query.append('limit', params.limit);
    if (params.offset) query.append('offset', params.offset);
    const queryString = query.toString();
    return apiGet(`/api/events${queryString ? `?${queryString}` : ''}`);
  },
  getEvent: (id) => apiGet(`/api/events/${id}`),
  rsvpToEvent: (id) => apiPost(`/api/events/${id}/rsvp`, {}),
  withdrawFromEvent: (id) => apiPost(`/api/events/${id}/withdraw`, {}),
  getMyEvents: (params = {}) => {
    const query = new URLSearchParams();
    if (params.limit) query.append('limit', params.limit);
    if (params.offset) query.append('offset', params.offset);
    const queryString = query.toString();
    return apiGet(`/api/events/my/rsvpd${queryString ? `?${queryString}` : ''}`);
  },
  getRecommendedEvents: (limit = 10) => {
    return apiGet(`/api/events/recommended?limit=${limit}`);
  },
  // AI-driven events/groups recommendations via campusconnect-ai (student-facing).
  getAiRecommendedEventsGroups: (payload = {}) => {
    return apiPost('/api/events/recommendations', payload);
  },
  // Admin routes
  getPendingEvents: (params = {}) => {
    const query = new URLSearchParams();
    if (params.limit) query.append('limit', params.limit);
    if (params.offset) query.append('offset', params.offset);
    const queryString = query.toString();
    return apiGet(`/api/events/admin/pending${queryString ? `?${queryString}` : ''}`);
  },
  getAllEvents: (params = {}) => {
    const query = new URLSearchParams();
    if (params.status) query.append('status', params.status);
    if (params.limit) query.append('limit', params.limit);
    if (params.offset) query.append('offset', params.offset);
    const queryString = query.toString();
    return apiGet(`/api/events/admin/all${queryString ? `?${queryString}` : ''}`);
  },
  approveEvent: (id) => apiPatch(`/api/events/${id}/approve`, {}),
  rejectEvent: (id, reason) => apiPatch(`/api/events/${id}/reject`, { reason }),
};

/**
 * Help & Support API calls
 */
export const helpAPI = {
  getCategories: () => apiGet('/api/help/categories'),
  getCategory: (id) => apiGet(`/api/help/categories/${id}`),
  logJourneyEvent: (data) => apiPost('/api/help/journeys', data),
  // Admin routes
  createCategory: (data) => apiPost('/api/help/admin/categories', data),
  updateCategory: (id, data) => apiPatch(`/api/help/admin/categories/${id}`, data),
  deleteCategory: (id) => apiDelete(`/api/help/admin/categories/${id}`),
  getJourneyEvents: (params = {}) => {
    const query = new URLSearchParams();
    if (params.limit) query.append('limit', params.limit);
    if (params.categoryId) query.append('categoryId', params.categoryId);
    if (params.step) query.append('step', params.step);
    if (params.userId) query.append('userId', params.userId);
    const queryString = query.toString();
    return apiGet(`/api/help/admin/journeys${queryString ? `?${queryString}` : ''}`);
  },
};

/**
 * AI Help & Support API calls
 */
export const helpAI = {
  askQuestion: (question, history = []) => {
    return apiPost('/api/help/ai', { question, history });
  },
};

/**
 * Onboarding API calls (AI-driven validation/next steps)
 */
export const onboardingAPI = {
  // AI-driven onboarding step validation via campusconnect-ai.
  step: (payload = {}) => {
    return apiPost('/api/onboarding/step', payload);
  },
};

/**
 * Chat API calls
 */
export const chatAPI = {
  getConversations: (params = {}) => {
    const query = new URLSearchParams();
    if (params.limit) query.append('limit', params.limit);
    if (params.offset) query.append('offset', params.offset);
    const queryString = query.toString();
    return apiGet(`/api/chat/conversations${queryString ? `?${queryString}` : ''}`);
  },
  getConversation: (id) => apiGet(`/api/chat/conversations/${id}`),
  createConversation: (data) => apiPost('/api/chat/conversations', data),
  getMessages: (conversationId, params = {}) => {
    const query = new URLSearchParams();
    if (params.limit) query.append('limit', params.limit);
    if (params.before) query.append('before', params.before);
    const queryString = query.toString();
    return apiGet(`/api/chat/conversations/${conversationId}/messages${queryString ? `?${queryString}` : ''}`);
  },
  sendMessage: (conversationId, content) =>
    apiPost(`/api/chat/conversations/${conversationId}/messages`, { content }),
  getByCommunity: (communityId) => apiGet(`/api/chat/conversations/by-community/${communityId}`),
  getByUser: (userId) => apiGet(`/api/chat/conversations/by-user/${userId}`),
};

/**
 * Safety API calls (AI-driven content moderation)
 */
export const safetyAPI = {
  // AI-driven safety check via campusconnect-ai.
  checkContent: (payload = {}) => {
    return apiPost('/api/safety/check', payload);
  },
};

export default {
  get: apiGet,
  post: apiPost,
  put: apiPut,
  patch: apiPatch,
  delete: apiDelete,
  checkHealth,
  getBackendInfo,
  testAPI,
  authAPI,
  userAPI,
  matchAPI,
  connectionsAPI,
  groupsAPI,
  eventsAPI,
  helpAPI,
  helpAI,
  // AI-driven onboarding and safety helpers.
  onboardingAPI,
  safetyAPI,
  chatAPI,
};