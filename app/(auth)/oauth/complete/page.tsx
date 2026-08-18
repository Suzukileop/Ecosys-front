'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  clearRefreshCookie,
  completeOAuthRegistration,
  fetchOAuthPendingRegistration,
  type OAuthPendingProfile,
} from '@/lib/auth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { Avatar } from '@/components/ui/Avatar';
import { brandGradientBg, brandShadow } from '@/components/landing/landingBrand';
import { useAuth } from '@/context/AuthContext';

function OAuthCompleteContent() {
  const searchParams = useSearchParams();
  const { applyAuthResponse } = useAuth();
  const code = searchParams.get('code');

  const [profile, setProfile] = useState<OAuthPendingProfile | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!code) {
      setError('Missing registration session.');
      return;
    }

    fetchOAuthPendingRegistration(code)
      .then(setProfile)
      .catch(() => setError('Registration session expired. Please try again.'));
  }, [code]);

  const handleComplete = async () => {
    if (!code) return;
    if (!termsAccepted) {
      setError('You must accept the terms to continue.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await clearRefreshCookie();
      const authResponse = await completeOAuthRegistration(code, 'CREATOR');
      await applyAuthResponse(authResponse);
      window.location.replace('/dashboard/home');
    } catch {
      setError('Unable to complete registration. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (error && !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-6 dark:bg-neutral-950">
        <div className="w-full max-w-md space-y-4">
          <ErrorAlert message={error} onDismiss={() => setError(null)} />
          <Link href="/register" className="inline-flex text-sm font-medium text-[#F97316] hover:text-[#EA580C]">
            Back to register
          </Link>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-neutral-950">
        <div className="flex flex-col items-center gap-3 text-sm text-neutral-600 dark:text-neutral-400">
          <LoadingSpinner />
          Loading your profile...
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-6 dark:bg-neutral-950">
      <div className="w-full max-w-md">
        <h1 className="mb-2 text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Create your account
        </h1>
        <p className="mb-6 text-sm text-neutral-600 dark:text-neutral-400">
          No account was found for this Google profile. Confirm your details to create one automatically.
        </p>

        <div className="mb-6 flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-900">
          <Avatar name={profile.fullName} avatarUrl={profile.avatarUrl} size="lg" />
          <div>
            <p className="font-semibold text-neutral-900 dark:text-white">{profile.fullName}</p>
            <p className="text-sm text-neutral-500">{profile.email}</p>
          </div>
        </div>

        {error ? (
          <div className="mb-4">
            <ErrorAlert message={error} onDismiss={() => setError(null)} />
          </div>
        ) : null}

        <label className="mb-5 flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-[#F97316] focus:ring-[#F97316]/30"
          />
          <span className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
            I accept the{' '}
            <Link href="/terms" className="font-medium text-[#F97316] underline underline-offset-2">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="font-medium text-[#F97316] underline underline-offset-2">
              Privacy Policy
            </Link>
            .
          </span>
        </label>

        <button
          type="button"
          disabled={isSubmitting}
          onClick={handleComplete}
          className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition-all disabled:opacity-70 ${brandGradientBg} ${brandShadow}`}
        >
          {isSubmitting ? (
            <>
              <LoadingSpinner size="sm" />
              Creating account...
            </>
          ) : (
            'Complete registration'
          )}
        </button>
      </div>
    </div>
  );
}

export default function OAuthCompletePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-white dark:bg-neutral-950">
          <LoadingSpinner />
        </div>
      }
    >
      <OAuthCompleteContent />
    </Suspense>
  );
}
