import { apiClient, ApiClientOptions } from '@/lib/api-client';
import { ChatMessage } from '@/types/api';

export interface ChatHistoryResponseItem {
  id: string;
  title: string;
  timestamp: number;
}

export interface ConversationResponse {
  id: string;
  machine_id: string;
  title: string;
  messages: ChatMessage[];
  timestamp: number;
}

export const chatService = {
  getHistory: (options?: ApiClientOptions) =>
    apiClient<ChatHistoryResponseItem[]>('/api/chat/history', { method: 'GET', ...options }),

  getConversation: (id: string, options?: ApiClientOptions) =>
    apiClient<ConversationResponse>(`/api/chat/history?id=${id}`, { method: 'GET', ...options }),

  saveConversation: (id: string, title: string, messages: ChatMessage[], options?: ApiClientOptions) =>
    apiClient<{ success: boolean }>('/api/chat/history', {
      method: 'POST',
      body: JSON.stringify({ id, title, messages }),
      ...options,
    }),

  deleteConversation: (id: string, options?: ApiClientOptions) =>
    apiClient<{ success: boolean }>(`/api/chat/history?id=${id}`, { method: 'DELETE', ...options }),

  clearAllHistory: (options?: ApiClientOptions) =>
    apiClient<{ success: boolean }>('/api/chat/history?all=true', { method: 'DELETE', ...options }),

  updateTitle: (id: string, title: string, options?: ApiClientOptions) =>
    apiClient<{ success: boolean }>('/api/chat/history', {
      method: 'PATCH',
      body: JSON.stringify({ id, title }),
      ...options,
    }),
};
