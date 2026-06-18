import { toast } from 'sonner';
import config from '../config.json';
import { getMachineId } from './machine-id';

/**
 * Centralized API configuration.
 * BASE_URL: The absolute backend URL consumed from config.json.
 * PROXY_BASE: The local Next.js proxy path used for client-side calls.
 */
export const BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || config.apiBaseUrl).replace(/\/$/, '');
export const PROXY_BASE = '/api';

// Define the local host for server-side proxying
const APP_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || config.apiBaseUrl).replace(/\/$/, '');

export interface ApiClientOptions extends RequestInit {
  timeout?: number;
  retries?: number;
}

export class ApiError extends Error {
  status: number;
  details?: string;
  constructor(message: string, status: number, details?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export async function apiClient<T>(
  endpoint: string,
  options: ApiClientOptions = {}
): Promise<T> {
  const isDev = process.env.NODE_ENV === 'development';
  const startTime = isDev ? performance.now() : 0;

  const isServer = typeof window === 'undefined';

  // Use the endpoint as provided. It should already include the /api prefix.
  const url = isServer ? `${APP_URL}${endpoint}` : endpoint;

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
          `🚀 [API Request] ${fetchOptions.method || 'GET'} ${endpoint} ${
            attempt > 0 ? `(Retry ${attempt}/${retries})` : ''
          }`
        );

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
        ...(isServer ? {} : { credentials: 'include' }),
      });

      clearTimeout(timeoutId);

      if (isDev) {
        const duration = (performance.now() - startTime).toFixed(2);
        const statusColor = response.ok ? 'color: #10b981' : 'color: #ef4444';
        console.log(`%c📦 [API Response] ${response.status} ${response.statusText} (${duration}ms) for ${endpoint}`, statusColor);
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || errorData.message || `API Error: ${response.status} ${response.statusText}`;
        const errorDetails = errorData.details;
        throw new ApiError(errorMessage, response.status, errorDetails);
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