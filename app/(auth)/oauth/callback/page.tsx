'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { completeOAuthCallback } from '@/lib/auth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { useAuth } from '@/context/AuthContext';
import { SIGNED_IN_HOME } from '@/lib/routes';

const OAUTH_DONE_KEY = 'oauth-exchange-done';

function OAuthCallbackContent() {
  const searchParams = useSearchParams();
  const { user, applyAuthResponse } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      window.location.replace(SIGNED_IN_HOME);
      return;
    }

    const code = searchParams.get('code');
    const oauthError = searchParams.get('error');

    if (oauthError) {
      console.error('[oauth callback]', oauthError);
      setError(
        oauthError === 'access_denied'
          ? 'Sign-in was cancelled.'
          : oauthError === 'temporarily_unavailable'
            ? 'Social sign-in is temporarily unavailable. Please try again in a few minutes.'
            : 'Unable to complete social sign-in. Please try again.',
      );
      return;
    }

    if (!code) {
      setError('This sign-in link is invalid or has expired. Please try again.');
      return;
    }

    if (sessionStorage.getItem(OAUTH_DONE_KEY) === code) {
      window.location.replace(SIGNED_IN_HOME);
      return;
    }

    completeOAuthCallback(code, applyAuthResponse)
      .then(() => {
        sessionStorage.setItem(OAUTH_DONE_KEY, code);
        window.location.replace(SIGNED_IN_HOME);
      })
      .catch(() => {
        setError('Unable to complete social sign-in. Please try again.');
      });
  }, [searchParams, user, applyAuthResponse]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-6 dark:bg-neutral-950">
        <div className="w-full max-w-md space-y-4">
          <ErrorAlert message={error} onDismiss={() => setError(null)} />
          <div className="flex gap-4 text-sm">
            <Link href="/login" className="font-medium text-[#F97316] hover:text-[#EA580C]">
              Back to login
            </Link>
            <Link href="/register" className="font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400">
              Register
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white dark:bg-neutral-950">
      <div className="flex flex-col items-center gap-3 text-sm text-neutral-600 dark:text-neutral-400">
        <LoadingSpinner />
        Completing sign-in...
      </div>
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-white dark:bg-neutral-950">
          <LoadingSpinner />
        </div>
      }
    >
      <OAuthCallbackContent />
    </Suspense>
  );
}
