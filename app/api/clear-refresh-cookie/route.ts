import { NextResponse } from 'next/server';

/**
 * Must mirror set-refresh-cookie attributes (path / sameSite / secure).
 * A bare cookies.delete(name) can leave the path=/ cookie alive, so proxy
 * still sees refresh_token and bounces /login → /dashboard after logout.
 */
export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set('refresh_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
    expires: new Date(0),
  });
  return response;
}
