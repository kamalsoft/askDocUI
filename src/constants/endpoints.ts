/**
 * Centralized API endpoint registry for the askDocs local engine.
 * Synced with the v1 OpenAPI specification.
 */
export const ENDPOINTS = {
  QUERY: '/api/v1/query',
  STATUS: '/api/v1/status',
  METADATA: '/api/v1/metadata',
  CONFIG: '/api/v1/config',
  HEALTH: '/health',
  API_DOCS: '/api-docs',
  HISTORY: '/api/chat/history',
  SYSTEM_INFO: '/api/system/info',
  MAINTENANCE: '/api/system/maintenance',
  BACKUP: '/api/system/backup',
} as const;