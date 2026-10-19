'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { AuthShell } from '@/components/auth/AuthShell';
import {
  AuthErrorBanner,
  AuthPasswordField,
  AuthSubmitButton,
  AuthTextField,
} from '@/components/auth/AuthFields';
import { SocialOAuthButtons } from '@/components/auth/SocialOAuthButtons';
import { AxiosError } from 'axios';
import { getApiErrorCode, getApiErrorMessage } from '@/lib/api-error';
import { savePendingVerification } from '@/lib/pending-verification';
import { SIGNED_IN_HOME } from '@/lib/routes';
import { useLocale, useT } from '@/lib/i18n/I18nProvider';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

function resolvePostAuthDest(searchParams: URLSearchParams): string {
  const redirectTo = searchParams.get('redirect');
  if (redirectTo && redirectTo.startsWith('/') && !redirectTo.startsWith('//')) {
    return redirectTo;
  }
  return SIGNED_IN_HOME;
}

function LoginForm() {
  const t = useT();
  const { locale } = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, user, isLoading } = useAuth();
  const [apiError, setApiError] = useState<string | null>(null);
  const [submitRedirecting, setSubmitRedirecting] = useState(false);
  const navigatingRef = useRef(false);
  const alreadyAuthed = !isLoading && Boolean(user);
  const isRedirecting = submitRedirecting || alreadyAuthed;

  // Already authenticated (e.g. landed on /login with a live session): hard navigate once.
  // Soft router.push/replace + refresh caused stacked RSC paints after account switch.
  useEffect(() => {
    if (!alreadyAuthed || submitRedirecting || navigatingRef.current) return;
    navigatingRef.current = true;
    window.location.replace(resolvePostAuthDest(searchParams));
  }, [alreadyAuthed, submitRedirecting, searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const busy = isSubmitting || isRedirecting;

  const onSubmit = async (data: LoginFormData) => {
    if (busy) return;
    setApiError(null);
    try {
      await login({ ...data, locale });
      setSubmitRedirecting(true);
      // Full document navigation resets client auth/UI state from the previous account.
      window.location.assign(resolvePostAuthDest(searchParams));
    } catch (error) {
      setSubmitRedirecting(false);
      const axiosError = error as AxiosError<{ message: string }>;
      const status = axiosError.response?.status;
      if (getApiErrorCode(error) === 'EMAIL_NOT_VERIFIED') {
        /* Right password, unconfirmed address: the server has just e-mailed a fresh code (or one is
           still valid from the last minute). Continue on the code screen, then back to `redirect`. */
        const redirectTo = searchParams.get('redirect') ?? undefined;
        savePendingVerification(data.email.trim(), 60, redirectTo);
        router.push('/verify-email');
        return;
      }
      if (status === 401) {
        setApiError(t('Incorrect email or password.'));
      } else if (status === 403) {
        setApiError(t('Your account has been disabled. Contact support.'));
      } else if (status === 429) {
        setApiError(t('Too many login attempts. Please try again in a minute.'));
      } else {
        setApiError(getApiErrorMessage(error, t('We couldn’t sign you in. Please try again.')));
      }
    }
  };

  return (
    <>
      {apiError ? <AuthErrorBanner message={apiError} onDismiss={() => setApiError(null)} /> : null}

      <SocialOAuthButtons />

      {/*
        `method="post"` guards the window before hydration. React Hook Form calls
        preventDefault, but only once the page is interactive; a submit before that falls back to
        the browser's native one, and the default method is GET — which would put the password in
        the URL, and from there into history, the Referer header and every proxy log in front of
        the app. A native POST keeps it in the body.
      */}
      <form onSubmit={handleSubmit(onSubmit)} method="post" className="space-y-5" noValidate>
        <AuthTextField
          id="email"
          label={t('Email')}
          type="email"
          autoComplete="email"
          inputMode="email"
          autoFocus
          placeholder="you@email.com"
          registration={register('email')}
          error={errors.email?.message}
        />

        <AuthPasswordField
          id="password"
          label={t('Password')}
          autoComplete="current-password"
          registration={register('password')}
          error={errors.password?.message}
        />
        <div className="-mt-2 flex justify-end">
          <Link
            href="/forgot-password"
            className="text-[14px] font-medium text-neutral-500 underline-offset-4 transition-colors hover:text-[#111111] hover:underline dark:text-neutral-400 dark:hover:text-white"
          >
            {t('Forgot password?')}
          </Link>
        </div>

        <div className="pt-2">
          <AuthSubmitButton busy={busy} busyLabel={isRedirecting ? t('Redirecting...') : t('Signing in...')}>
            {t('Log in')}
          </AuthSubmitButton>
        </div>
      </form>
    </>
  );
}

export default function LoginPage() {
  const t = useT();
  return (
    <AuthShell
      title={t('Welcome back')}
      subtitle={t('Sign in to continue to Skraft.')}
      switchPrompt={t('Don\'t have an account?')}
      switchLabel={t('Register')}
      switchHref="/register"
    >
      <Suspense
        fallback={
          <div className="flex justify-center py-16">
            <LoadingSpinner />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
