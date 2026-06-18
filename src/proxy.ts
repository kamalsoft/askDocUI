import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import configData from './config.json';

/**
 * Next.js 16 Proxy Middleware
 */

// Module-level flag to track initialization
let isInitialized = false;

// Maximum characters to log for payloads to keep terminal clean
const MAX_LOG_LENGTH = 1000;

const truncate = (str: string, max: number = MAX_LOG_LENGTH) => 
  str.length > max ? str.substring(0, max) + `\n... [TRUNCATED ${str.length - max} characters]` : str;

export async function proxy(request: NextRequest) {
  // Initialization log (Terminal only)
  if (!isInitialized) {
    console.log(`\x1b[35m[System Init]\x1b[0m Proxy active. Target: ${configData.apiBaseUrl}`);
    isInitialized = true;
  }

  const internalSecret = request.headers.get('X-Internal-Secret');
  const isInternalCall = Boolean(internalSecret) && internalSecret === process.env.INTERNAL_SECRET;

  const adminToken = request.cookies.get('admin_session')?.value;
  const password = process.env.ADMIN_PASSWORD;
  // Authenticated if session cookie matches OR if it's an internal call from the server (SSR)
  const isAuthenticated = (Boolean(password) && adminToken === password) || isInternalCall;

  // Proxy API requests to the backend base URL
  // This handles both the chat (/api/v1) and system info (/api/system) namespaces
  const isBackendRoute = request.nextUrl.pathname.startsWith('/api/v1') || 
                         request.nextUrl.pathname.startsWith('/api/system');

  if (isBackendRoute) {
    // Pass the full path to the backend as it expects the /api/v1 or /api/system prefix
    let backendPath = request.nextUrl.pathname;

    // Ensure path starts with a slash
    if (!backendPath.startsWith('/')) backendPath = '/' + backendPath;

    const targetUrl = new URL(backendPath + request.nextUrl.search, configData.apiBaseUrl);
    
    // 1. Capture and Log Request Payload
    let requestPayload = null;
    if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
      try {
        const clonedRequest = request.clone();
        requestPayload = await clonedRequest.json();
      } catch (e) {
        // Body is not JSON or is empty
      }
    }

    const queryParams = request.nextUrl.searchParams.toString();
    console.log(`\x1b[36m[Proxy Request]\x1b[0m ${request.method} ${request.nextUrl.pathname}${queryParams ? `?${queryParams}` : ''} -> ${targetUrl.toString()}`);
    
    if (requestPayload) {
      const rawRequest = JSON.stringify(requestPayload, null, 2);
      console.log(`\x1b[34m[Request Payload]\x1b[0m`, truncate(rawRequest));
    }

    // 2. Handle Preflight OPTIONS requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Tunnel-Skip-Bypass',
          'Access-Control-Max-Age': '86400',
        },
      });
    }
    
    // 3. Perform manual fetch to capture Response Payload
    const proxyHeaders = new Headers(request.headers);
    proxyHeaders.set('X-Tunnel-Skip-Bypass', 'true');
    proxyHeaders.delete('host'); // Avoid host header mismatch on dev tunnels
    proxyHeaders.delete('content-length'); // Let fetch calculate the correct length for the re-stringified body

    const startTime = performance.now();
    try {
      const response = await fetch(targetUrl.toString(), {
        method: request.method,
        headers: proxyHeaders,
        body: requestPayload ? JSON.stringify(requestPayload) : undefined,
        redirect: 'follow', // Allow the proxy to handle trailing slash redirects internally
      });

      const duration = (performance.now() - startTime).toFixed(2);

      const contentType = response.headers.get('content-type') || '';
      let responseData: any = null;

      if (contentType.includes('application/json')) {
        responseData = await response.json();
        console.log(`\x1b[32m[Proxy Response]\x1b[0m ${response.status} ${request.nextUrl.pathname} (${duration}ms)`);
        const rawResponse = JSON.stringify(responseData, null, 2);
        console.log(`\x1b[32m[Response Payload]\x1b[0m`, truncate(rawResponse));
      } else {
        console.log(`\x1b[32m[Proxy Response]\x1b[0m ${response.status} ${request.nextUrl.pathname} (${duration}ms) (Non-JSON response)`);
      }
      
      // 4. Construct the final response with CORS headers
      const finalResponse = responseData 
        ? NextResponse.json(responseData, { status: response.status })
        : new NextResponse(response.body, { status: response.status, headers: response.headers });

      finalResponse.headers.set('Access-Control-Allow-Origin', '*');
      finalResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      finalResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Tunnel-Skip-Bypass');
      finalResponse.headers.set('X-Tunnel-Skip-Bypass', 'true');
      
      return finalResponse;
    } catch (error: any) {
      const duration = (performance.now() - startTime).toFixed(2);
      const errorMsg = error.cause ? `${error.message} (Cause: ${error.cause})` : error.message;
      console.error(`\x1b[31m[Proxy Error]\x1b[0m Fetch failed after ${duration}ms:`, errorMsg);
      return NextResponse.json(
        { error: 'Backend service unreachable', details: error.message },
        { status: 502 }
      );
    }
  }

  const isLoginPage = request.nextUrl.pathname === '/admin/login';

  if (isAuthenticated && isLoginPage) {
    return NextResponse.redirect(new URL('/settings', request.url));
  }

  // Public API routes that are accessible without admin authentication
  const publicApiRoutes = [
    '/api/health',
    '/api/chat/history',
    '/api/v1/query',
    '/api/v1/metadata',
    '/api/v1/status',
    '/api/admin/login',
    '/api/admin/logout',
    '/api/admin/status'
  ];

  const isPublicApi = publicApiRoutes.includes(request.nextUrl.pathname);

  if (!isAuthenticated && !isLoginPage && !isPublicApi) {
    // For ALL API requests, return 401 instead of redirecting to login page
    if (request.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.json({ 
        error: 'Unauthorized', 
        message: 'Authentication required to access this resource' 
      }, { status: 401 });
    }
    
    const loginUrl = new URL('/admin/login', request.url);
    const response = NextResponse.redirect(loginUrl);

    if (adminToken) {
      response.cookies.delete('admin_session');
    }

    return response;
  }

  const response = NextResponse.next();

  const isProtectedRoute = request.nextUrl.pathname.startsWith('/settings') || 
                           request.nextUrl.pathname.startsWith('/database');

  if (isAuthenticated && adminToken && isProtectedRoute) {
    response.cookies.set('admin_session', adminToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24,
      path: '/',
    });
  }

  return response;
}

export const config = {
  matcher: [
    '/database/:path*',
    '/settings/:path*',
    '/api/:path*', // Broadened to catch all API routes for logging
    '/admin/login'
  ],
};