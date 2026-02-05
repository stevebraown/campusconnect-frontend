import { apiGet, apiPost, apiDelete, apiPatch } from './api';

// ============ USERS MANAGEMENT ============

export const adminAPI = {
  // Users
  createUser: async (email, password, role = 'user', name = '') => {
    return apiPost('/api/admin/users', { email, password, role, name });
  },
  getUsers: async (page = 1, limit = 20, search = '') => {
    return apiGet(`/api/admin/users?page=${page}&limit=${limit}&search=${search}`);
  },

  getUserDetails: async (uid) => {
    return apiGet(`/api/admin/users/${uid}`);
  },

  updateUserRole: async (uid, role) => {
    return apiPatch(`/api/admin/users/${uid}/role`, { role });
  },

  disableUser: async (uid, disabled) => {
    return apiPatch(`/api/admin/users/${uid}/disable`, { disabled });
  },

  updateUserProfile: async (uid, profile) => {
    return apiPatch(`/api/admin/users/${uid}/profile`, profile);
  },

  setUserPassword: async (uid, password) => {
    return apiPatch(`/api/admin/users/${uid}/password`, { password });
  },

  deleteUser: async (uid) => {
    return apiDelete(`/api/admin/users/${uid}`);
  },

  // Analytics
  getStats: async () => {
    return apiGet('/api/admin/analytics/stats');
  },

  getSystemHealth: async () => {
    return apiGet('/api/admin/analytics/health');
  },

  // Content
  getContent: async (page = 1, limit = 20) => {
    return apiGet(`/api/admin/content?page=${page}&limit=${limit}`);
  },

  moderateContent: async (postId, approved) => {
    return apiPatch(`/api/admin/content/${postId}/moderate`, { approved });
  },

  deleteContent: async (postId) => {
    return apiDelete(`/api/admin/content/${postId}`);
  },

  // Settings
  getSettings: async () => {
    return apiGet('/api/admin/settings');
  },

  updateSettings: async (settings) => {
    return apiPatch('/api/admin/settings', settings);
  },

  // Geofence Settings
  getGeofenceSettings: async () => {
    return apiGet('/api/admin/geofence-settings');
  },

  updateGeofenceSettings: async (settings) => {
    return apiPatch('/api/admin/geofence-settings', settings);
  },

  // AI monitoring: test matching graph and visualize raw response + metrics.
  testAiMatching: async ({ userId, tenantId, preferences = null }) => {
    const params = new URLSearchParams();
    params.append('userId', userId);
    params.append('tenantId', tenantId);
    if (preferences) {
      params.append('preferences', JSON.stringify(preferences));
    }
    return apiGet(`/api/admin/ai/matching/test?${params.toString()}`);
  },

  // AI monitoring: test events_communities graph and visualize raw response + metrics.
  testAiEventsGroups: async ({ userId, tenantId, interests = null, location = null, limit = null }) => {
    const params = new URLSearchParams();
    params.append('userId', userId);
    params.append('tenantId', tenantId);
    if (interests) {
      params.append('interests', JSON.stringify(interests));
    }
    if (location) {
      params.append('location', JSON.stringify(location));
    }
    if (limit) {
      params.append('limit', String(limit));
    }
    return apiGet(`/api/admin/ai/events-groups/test?${params.toString()}`);
  },
};

export default adminAPI;

