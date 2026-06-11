import { apiClient, ApiClientOptions, BASE_URL } from '@/lib/api-client';
import { 
  QueryRequest, QueryResponse, SystemStatus, 
  SystemMetadata, SystemConfig, HealthCheck 
} from '@/types/api';
import { ENDPOINTS } from '@/constants/endpoints';

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
    const baseUrl = BASE_URL;
    return `${baseUrl}${ENDPOINTS.API_DOCS}`;
  },

  deleteHistory: (id: string) => 
    apiClient(`${ENDPOINTS.HISTORY}?id=${id}`, { method: 'DELETE' }),

  clearAllHistory: () =>
    apiClient(`${ENDPOINTS.HISTORY}?all=true`, { method: 'DELETE' }),

  getHistory: () =>
    apiClient(ENDPOINTS.HISTORY),

  getHistoryItem: (id: string) =>
    apiClient(`${ENDPOINTS.HISTORY}?id=${id}`),

  saveConversation: (id: string, title: string, messages: any[]) =>
    apiClient(ENDPOINTS.HISTORY, {
      method: 'POST',
      body: JSON.stringify({ id, title, messages })
    }),

  updateChatTitle: (id: string, title: string) =>
    apiClient(ENDPOINTS.HISTORY, { 
      method: 'PATCH', 
      body: JSON.stringify({ id, title }) 
    }),

  getSystemInfo: () =>
    apiClient(ENDPOINTS.SYSTEM_INFO),

  performMaintenance: (action?: 'vacuum' | 'integrity') =>
    apiClient(ENDPOINTS.MAINTENANCE, { 
      method: 'POST',
      body: JSON.stringify({ action: action || 'vacuum' })
    }),

  getBackupUrl: () => ENDPOINTS.BACKUP,
};