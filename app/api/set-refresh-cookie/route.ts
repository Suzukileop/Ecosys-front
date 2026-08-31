import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  let body: { refreshToken?: string };
  try {
    const raw = await request.text();
    body = raw.trim() ? (JSON.parse(raw) as { refreshToken?: string }) : {};
  } catch {
    return NextResponse.json({ error: 'Corps de requête invalide' }, { status: 400 });
  }

  const { refreshToken } = body;

  if (!refreshToken) {
    return NextResponse.json({ error: 'Refresh token requis' }, { status: 400 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set('refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7, // 7 jours
    path: '/',
  });

  return response;
}
