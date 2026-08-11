import { NextRequest, NextResponse } from 'next/server';

function safeRedirectPath(value: string | null): string | null {
  if (!value || !value.startsWith('/') || value.startsWith('//')) {
    return null;
  }
  return value;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const refreshToken = request.cookies.get('refresh_token');

  if (refreshToken) {
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    if (pathname === '/login' || pathname === '/register') {
      const redirectTo =
        safeRedirectPath(request.nextUrl.searchParams.get('redirect')) ?? '/dashboard';
      return NextResponse.redirect(new URL(redirectTo, request.url));
    }
  }

  if (pathname.startsWith('/dashboard')) {
    if (!refreshToken) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  if (
    pathname.startsWith('/marketplace/favorites') ||
    pathname.startsWith('/marketplace/purchases')
  ) {
    if (!refreshToken) {
      const login = new URL('/login', request.url);
      login.searchParams.set('redirect', pathname);
      return NextResponse.redirect(login);
    }
  }

  if (pathname.startsWith('/admin')) {
    if (!refreshToken) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    // Role-based access is enforced at the page level after client-side auth
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/register',
    '/dashboard/:path*',
    '/admin/:path*',
    '/marketplace/favorites',
    '/marketplace/purchases/:path*',
  ],
};
