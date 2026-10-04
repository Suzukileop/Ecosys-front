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
    <div>
      <button
        type="button"
        disabled={!googleEnabled}
        onClick={() => startGoogleOAuth(signup)}
        title={googleEnabled ? undefined : 'Google sign-in is not configured'}
        className="flex h-12 w-full items-center justify-center gap-3 rounded-lg border border-black/[0.12] bg-white px-4 text-[15px] font-medium text-[#111111] transition-colors hover:border-black/25 hover:bg-black/[0.02] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#FF5722]/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/[0.14] dark:bg-[#111111] dark:text-white dark:hover:border-white/25 dark:hover:bg-white/[0.04]"
      >
        <GoogleIcon />
        {signup ? 'Sign up with Google' : 'Continue with Google'}
      </button>

      <div className="my-7 flex items-center gap-4" aria-hidden>
        <div className="h-px grow bg-black/[0.08] dark:bg-white/[0.1]" />
        <span className="shrink-0 text-[12px] font-medium uppercase tracking-[0.14em] text-neutral-400 dark:text-neutral-500">
          or with email
        </span>
        <div className="h-px grow bg-black/[0.08] dark:bg-white/[0.1]" />
      </div>
    </div>
  );
}
