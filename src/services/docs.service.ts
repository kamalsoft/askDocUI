import { apiClient, ApiClientOptions, BASE_URL } from '@/lib/api-client';
import { 
  QueryRequest, QueryResponse, SystemStatus, 
  SystemMetadata, SystemConfig, HealthCheck 
} from '@/types/api';
import { ENDPOINTS } from '../constants/endpoints';

export const docsService = {
  query: (data: QueryRequest, options?: ApiClientOptions) => 
    apiClient<QueryResponse>(ENDPOINTS.QUERY, { method: 'POST', body: JSON.stringify(data), ...options }),

  getStatus: (options?: ApiClientOptions) => 
    apiClient<SystemStatus>(ENDPOINTS.STATUS, options),

  getMetadata: (options?: ApiClientOptions) => 
    apiClient<SystemMetadata>(ENDPOINTS.METADATA, options),

  getConfig: (options?: ApiClientOptions) => 
    apiClient<SystemConfig>(ENDPOINTS.CONFIG, options),

  patchConfig: (config: Partial<SystemConfig>, options?: ApiClientOptions) => 
    apiClient<SystemConfig>(ENDPOINTS.CONFIG, { 
      method: 'PATCH', 
      body: JSON.stringify(config),
      ...options
    }),

  getHealth: (options?: ApiClientOptions) => 
    apiClient<HealthCheck>(ENDPOINTS.HEALTH, options),

  getSwaggerUrl: () => {
    const baseUrl = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
    return `${baseUrl}${ENDPOINTS.API_DOCS}`;
  },

  deleteHistory: (id: string) => 
    fetch(`${ENDPOINTS.HISTORY}?id=${id}`, { method: 'DELETE' }).then(res => res.json()),

  clearAllHistory: () =>
    fetch(`${ENDPOINTS.HISTORY}?all=true`, { method: 'DELETE' }).then(res => res.json()),

  getHistory: () =>
    fetch(ENDPOINTS.HISTORY).then(res => res.json()),

  getHistoryItem: (id: string) =>
    fetch(`${ENDPOINTS.HISTORY}?id=${id}`).then(res => res.json()),

  saveConversation: (id: string, title: string, messages: any[]) =>
    fetch(ENDPOINTS.HISTORY, {
      method: 'POST',
      body: JSON.stringify({ id, title, messages })
    }).then(res => res.json()),

  updateChatTitle: (id: string, title: string) =>
    fetch(ENDPOINTS.HISTORY, { 
      method: 'PATCH', 
      body: JSON.stringify({ id, title }) 
    }).then(res => res.json()),

  getSystemInfo: () =>
    fetch(ENDPOINTS.SYSTEM_INFO).then(res => res.json()),
};