import { toast } from 'sonner';
import config from '../config.json';
import { getMachineId } from './machine-id';

/**
 * Centralized API configuration.
 * BASE_URL: The absolute backend URL consumed from config.json.
 * PROXY_BASE: The local Next.js proxy path used for client-side calls.
 */
export const BASE_URL = config.apiBaseUrl.replace(/\/$/, '');
export const PROXY_BASE = '/api';

export interface ApiClientOptions extends RequestInit {
  timeout?: number;
  retries?: number;
}

export async function apiClient<T>(
  endpoint: string,
  options: ApiClientOptions = {}
): Promise<T> {
  const isDev = process.env.NODE_ENV === 'development';
  const startTime = isDev ? performance.now() : 0;

  const isServer = typeof window === 'undefined';

  // Sanitize the endpoint: remove leading '/api' if present because PROXY_BASE already includes it
  const sanitizedEndpoint = endpoint.replace(/^\/?api\//, '');
  const path = sanitizedEndpoint.startsWith('/') ? sanitizedEndpoint : `/${sanitizedEndpoint}`;
  
  // If on server (SSR/Actions), we must use absolute URLs.
  // If on client, we use the local proxy to handle CORS and secret injection.
  const url = isServer ? `${BASE_URL}${path}` : `${PROXY_BASE}${path}`;

  const { timeout = 60000, retries = 0, ...fetchOptions } = options; 

  const headers = {
    'Content-Type': 'application/json',
    'X-Machine-ID': getMachineId(),
    ...(isServer && process.env.INTERNAL_SECRET ? { 'X-Internal-Secret': process.env.INTERNAL_SECRET } : {}),
    ...fetchOptions.headers,
  };

  let lastError: any;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      if (isDev) {
        console.groupCollapsed(
          `🚀 [API Request] ${fetchOptions.method || 'GET'} ${path} ${
            attempt > 0 ? `(Retry ${attempt}/${retries})` : ''
          }`
        );
        console.log('Full URL:', url);
        console.log('Headers:', headers);
        console.log('Timeout:', `${timeout}ms`);
        if (fetchOptions.body) {
          try {
            console.log('Body:', JSON.parse(fetchOptions.body as string));
          } catch {
            console.log('Body:', fetchOptions.body);
          }
        }
        console.groupEnd();
      }

      const response = await fetch(url, {
        ...fetchOptions,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (isDev) {
        const duration = (performance.now() - startTime).toFixed(2);
        const statusColor = response.ok ? 'color: #10b981' : 'color: #ef4444';
        console.log(`%c📦 [API Response] ${response.status} ${response.statusText} (${duration}ms) for ${path}`, statusColor);
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API Error: ${response.status} ${response.statusText} at ${url}`);
      }

      if (response.status === 204) {
        return {} as T;
      }

      return await response.json();
    } catch (error: any) {
      clearTimeout(timeoutId);
      lastError = error;

      if (error.name === 'AbortError' || error.name === 'TimeoutError') {
        const timeoutError = new Error(`Request timeout: The operation at ${url} took longer than ${timeout}ms`);
        timeoutError.name = 'TimeoutError';
        throw timeoutError; // As requested, do not retry on timeouts
      }

      if (attempt === retries) throw error;
      
      // Optional: Small backoff before retrying
      await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
    }
  }
  throw lastError;
}