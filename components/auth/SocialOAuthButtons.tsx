'use client';

import { useEffect, useState } from 'react';
import { fetchOAuthStatus } from '@/lib/auth';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

function startGoogleOAuth(signup: boolean) {
  const params = new URLSearchParams();
  if (signup) {
    params.set('signup', 'true');
  }
  params.set('role', 'CREATOR');
  window.location.href = `${API_BASE}/api/auth/oauth/google?${params.toString()}`;
}

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export function SocialOAuthButtons({ signup = false }: { signup?: boolean }) {
  const [googleEnabled, setGoogleEnabled] = useState(false);

  useEffect(() => {
    fetchOAuthStatus()
      .then((status) => setGoogleEnabled(status.google))
      .catch(() => setGoogleEnabled(false));
  }, []);

  return (
    <div className="space-y-3">
      <div className="relative flex items-center py-1">
        <div className="grow border-t border-neutral-200 dark:border-neutral-700" />
        <span className="mx-3 shrink-0 text-xs text-neutral-500">or continue with</span>
        <div className="grow border-t border-neutral-200 dark:border-neutral-700" />
      </div>

      <button
        type="button"
        disabled={!googleEnabled}
        onClick={() => startGoogleOAuth(signup)}
        title={googleEnabled ? (signup ? 'Sign up with Google' : 'Sign in with Google') : 'Google sign-in is not configured'}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm font-medium text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
      >
        <GoogleIcon />
        Google
      </button>
    </div>
  );
}
