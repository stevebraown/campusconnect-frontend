/**
 * Chat Assistant API – AI-powered icebreakers and reply suggestions.
 * Calls POST /api/chat/assistant; JWT is automatically attached via apiPost.
 */

import { apiPost } from './api';
import { CHAT_ASSISTANT } from './apiEndpoints';

/**
 * Get suggested icebreakers for a new or mostly empty conversation.
 * @param {string|null} conversationId - Conversation ID (null for new conv)
 * @returns {Promise<{ success: boolean, suggestions?: string[], error?: object }>}
 */
export const suggestIcebreakers = (conversationId = null) => {
  return apiPost(CHAT_ASSISTANT, {
    action: 'suggest_icebreakers',
    conversation_id: conversationId,
  }).then((res) => {
    if (res.success && res.data?.suggestions) {
      return { ...res, suggestions: res.data.suggestions };
    }
    return res;
  });
};

/**
 * Get suggested replies for an ongoing conversation.
 * @param {string} conversationId - Conversation ID
 * @param {string|null} style - Optional tone hint (e.g. "casual and friendly")
 * @returns {Promise<{ success: boolean, suggestions?: string[], error?: object }>}
 */
export const suggestReplies = (conversationId, style = null) => {
  return apiPost(CHAT_ASSISTANT, {
    action: 'suggest_replies',
    conversation_id: conversationId,
    style,
  }).then((res) => {
    if (res.success && res.data?.suggestions) {
      return { ...res, suggestions: res.data.suggestions };
    }
    return res;
  });
};

export const chatAssistantAPI = {
  suggestIcebreakers,
  suggestReplies,
};

export default chatAssistantAPI;
