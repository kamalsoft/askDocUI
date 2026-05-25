import { toast } from 'sonner';

export const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://switching-paintball-vista-quizzes.trycloudflare.com'; //|| 'http://localhost:5001'

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

  // Normalize URL construction to prevent double-slashes or missing slashes
  const baseUrl = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${baseUrl}${path}`;

  const { timeout = 60000, retries = 0, ...fetchOptions } = options; 

  const headers = {
    'Content-Type': 'application/json',
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