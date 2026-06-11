import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const adminToken = request.cookies.get('admin_session')?.value;
  
  const password = process.env.ADMIN_PASSWORD;
  const isAuthenticated = Boolean(password) && adminToken === password;
  const isLoginPage = request.nextUrl.pathname === '/admin/login';

  if (isAuthenticated && isLoginPage) {
    return NextResponse.redirect(new URL('/settings', request.url));
  }

  if (!isAuthenticated && !isLoginPage) {
    if (request.nextUrl.pathname.startsWith('/api/system')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
  matcher: ['/database/:path*', '/settings/:path*', '/api/system/:path*', '/admin/login'],
};