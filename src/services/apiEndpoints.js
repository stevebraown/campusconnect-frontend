/**
 * API Endpoints Configuration
 * Centralized definition of all backend API endpoints
 */

// Base URL - will use environment variable in production
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

/**
 * API Endpoints
 */
export const API_ENDPOINTS = {
  // Health & Test
  ROOT: '/',
  HEALTH: '/api/health',
  TEST: '/api/test',
  
  // Auth
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    STATUS: '/api/auth/status',
  },
  
  // Users
  USERS: {
    PROFILE: '/api/users/profile',
    UPDATE: '/api/users/update',
    SEARCH: '/api/users/search',
    NEARBY: '/api/users/nearby',
  },
  
  // Matching
  MATCH: {
    RECOMMENDATIONS: '/api/match/recommendations',
    NEARBY: '/api/match/nearby',
    BY_INTERESTS: '/api/match/interests',
    COMPATIBILITY: '/api/match/compatibility',
  },
};

/**
 * Build full URL for an endpoint
 * @param {string} endpoint - Endpoint path
 * @returns {string} - Full URL
 */
export const buildUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`;
};

export default API_ENDPOINTS;