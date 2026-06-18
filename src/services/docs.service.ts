import { apiClient, ApiClientOptions } from '@/lib/api-client';
import { 
  QueryRequest, QueryResponse,
  SystemMetadata, SystemConfig,
  HealthCheck, SystemInfo
} from '@/types/api';
import { ENDPOINTS } from '@/constants/endpoints';

export const docsService = {
  query: (data: QueryRequest, options?: ApiClientOptions) => 
    apiClient<QueryResponse>(ENDPOINTS.QUERY[0].url, { method: 'POST', body: JSON.stringify(data), ...options }),

  getMetadata: (options?: ApiClientOptions) => 
    apiClient<SystemMetadata>(ENDPOINTS.METADATA[0].url, { method: 'GET', ...options }),

  getConfig: (options?: ApiClientOptions) => 
    apiClient<SystemConfig>(ENDPOINTS.CONFIG[1].url, { method: 'GET', ...options }),

  patchConfig: (config: Partial<SystemConfig>, options?: ApiClientOptions) => 
    apiClient<SystemConfig>(ENDPOINTS.CONFIG[0].url, { 
      method: 'PATCH', 
      body: JSON.stringify(config),
      ...options
    }),

  getHealth: (options?: ApiClientOptions) => 
    apiClient<HealthCheck>(ENDPOINTS.HEALTH[0].url, { method: 'GET', ...options }),

  getStatus: (options?: ApiClientOptions) => 
    apiClient<SystemInfo>(ENDPOINTS.STATUS[0].url, { method: 'GET', ...options }),
};
