// AI-style matching utilities
// NOTE: Production uses backend /api/ai-match/propose.

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

/**
 * AI Matching Service
 * Delegates matching to backend API
 */

/**
 * Calculate compatibility score between two users
 * @param {Object} user1 - First user profile
 * @param {Object} user2 - Second user profile
 * @returns {Object} - Compatibility details
 */
/**
 * Get AI-powered match recommendations for a user
 * @param {string} userId - Current user ID
 * @param {number} limit - Number of recommendations
 * @returns {Promise<Array>} - Array of recommended matches
 */
export const getAIRecommendations = async (userId, limit = 5) => {
  try {
    const token = localStorage.getItem('jwt');
    const res = await fetch(`${API_BASE_URL}/api/ai-match/propose`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        userId,
        preferences: { limit },
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data?.error || `HTTP ${res.status}`);
    }

    const data = await res.json().catch(() => ({}));
    const matches = data?.matches || [];
    return { success: true, matches };
  } catch (error) {
    console.error('❌ Error getting AI recommendations:', error);
    return { success: false, error: error.message, matches: [] };
  }
};

export default {
  getAIRecommendations,
};