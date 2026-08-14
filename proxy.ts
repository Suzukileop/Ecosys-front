import { NextRequest, NextResponse } from 'next/server';

const DASHBOARD_HOME = '/dashboard/home';

function safeRedirectPath(value: string | null): string | null {
  if (!value || !value.startsWith('/') || value.startsWith('//')) {
    return null;
  }
  // Overview hub is hidden — never land on bare /dashboard.
  if (value === '/dashboard') {
    return DASHBOARD_HOME;
  }
  return value;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const refreshToken = request.cookies.get('refresh_token');

  if (refreshToken) {
    if (pathname === '/') {
      return NextResponse.redirect(new URL(DASHBOARD_HOME, request.url));
    }

    if (pathname === '/dashboard') {
      return NextResponse.redirect(new URL(DASHBOARD_HOME, request.url));
    }

    if (pathname === '/login' || pathname === '/register') {
      const redirectTo =
        safeRedirectPath(request.nextUrl.searchParams.get('redirect')) ?? DASHBOARD_HOME;
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
    '/dashboard',
    '/dashboard/:path*',
    '/admin/:path*',
    '/marketplace/favorites',
    '/marketplace/purchases/:path*',
  ],
};
