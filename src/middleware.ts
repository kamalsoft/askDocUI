import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const adminToken = request.cookies.get('admin_session')?.value;
  
  // Check against the password stored in your environment variables
  const isAuthenticated = adminToken === process.env.ADMIN_PASSWORD;
  const isLoginPage = request.nextUrl.pathname === '/admin/login';

  // Redirect to settings if already authenticated and hitting login page
  if (isAuthenticated && isLoginPage) {
    return NextResponse.redirect(new URL('/settings', request.url));
  }

  // If not authenticated and trying to access protected routes
  if (!isAuthenticated && !isLoginPage) {
    // For API requests, return a 401 Unauthorized
    if (request.nextUrl.pathname.startsWith('/api/system')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // For pages, redirect to the login screen
    
    const loginUrl = new URL('/admin/login', request.url);
    const response = NextResponse.redirect(loginUrl);

    // If an invalid or expired token is present, clear it from the browser
    if (adminToken) {
      response.cookies.delete('admin_session');
    }

    return response;
  }

  const response = NextResponse.next();

  // Sliding Expiration: Only set/refresh the cookie if the user is authenticated 
  // and not on a public route, to avoid unnecessary header overhead.
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/settings') || 
                           request.nextUrl.pathname.startsWith('/database');

  if (isAuthenticated && adminToken && isProtectedRoute) {
    response.cookies.set('admin_session', adminToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // Extend by another 24 hours
      path: '/',
    });
  }

  return response;
}

export const config = {
  matcher: ['/database/:path*', '/settings/:path*', '/api/system/:path*', '/admin/login'],
};