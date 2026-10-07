import { NextRequest, NextResponse } from 'next/server';
import { ROUTES, SIGNED_IN_HOME, isProtectedPath } from '@/lib/routes';

function safeRedirectPath(value: string | null): string | null {
  if (!value || !value.startsWith('/') || value.startsWith('//')) {
    return null;
  }
  return value;
}

/**
 * Edge gate on the session cookie only: anonymous visitors are sent to `/login` (with a return
 * path), signed-in users skip the landing and auth pages. Roles are enforced by the pages and API.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const signedIn = Boolean(request.cookies.get('refresh_token'));

  if (signedIn) {
    if (pathname === ROUTES.home) {
      return NextResponse.redirect(new URL(SIGNED_IN_HOME, request.url));
    }
    if (pathname === ROUTES.login || pathname === ROUTES.register) {
      const redirectTo = safeRedirectPath(request.nextUrl.searchParams.get('redirect')) ?? SIGNED_IN_HOME;
      return NextResponse.redirect(new URL(redirectTo, request.url));
    }
    return NextResponse.next();
  }

  if (isProtectedPath(pathname)) {
    const login = new URL(ROUTES.login, request.url);
    login.searchParams.set('redirect', `${pathname}${search}`);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

// Next reads the matcher statically, so it must be literal: keep it in sync with
// PROTECTED_ROUTE_PREFIXES in lib/routes.ts.
export const config = {
  matcher: [
    '/',
    '/login',
    '/register',
    '/feed/:path*',
    '/studio/:path*',
    '/profile/:path*',
    '/my-products/:path*',
    '/my-services/:path*',
    '/purchases/:path*',
    '/messages/:path*',
    '/notifications/:path*',
    '/search/:path*',
    '/settings/:path*',
    '/cv/:path*',
    '/admin/:path*',
  ],
};
