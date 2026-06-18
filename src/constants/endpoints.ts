/**
 * Centralized API endpoint registry for the askDocs local engine.
 */
export const ENDPOINTS = {
  QUERY: [{
    method: 'POST',
    url: '/api/v1/query',
    description: 'Executes the RAG query using the SKILLS registry and returns the response stream.'
  }],
  STATUS: [{
    method: 'GET',
    url: '/api/v1/status',
    description: 'Get the transformer engine status'
  }],
  METADATA: [{
    method: 'GET',
    url: '/api/v1/metadata',    
    description: 'Get available query modes and other enums for UI integration'
  }],
  CONFIG: [{
    method: 'PATCH',
      url: '/api/v1/config',
      description: 'Updates the configuration settings of the askDocs engine, such as RAG parameters and SKILLS registry.'
  },
  {
    method: 'GET',
      url: '/api/v1/config',
      description: 'Get current system environment configuration.'
  }],
  HEALTH: [{
    method: 'GET',
    url: '/api/health',
    description: 'Performs a health check on the askDocs engine to ensure all components are functioning properly.'
  }]
} as const;