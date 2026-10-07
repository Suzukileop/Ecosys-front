'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSearchParams } from 'next/navigation';
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
import { getApiErrorMessage } from '@/lib/api-error';
import { SIGNED_IN_HOME } from '@/lib/routes';

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
      await login(data);
      setSubmitRedirecting(true);
      // Full document navigation resets client auth/UI state from the previous account.
      window.location.assign(resolvePostAuthDest(searchParams));
    } catch (error) {
      setSubmitRedirecting(false);
      const axiosError = error as AxiosError<{ message: string }>;
      const status = axiosError.response?.status;
      if (status === 401) {
        setApiError('Incorrect email or password.');
      } else if (status === 403) {
        setApiError('Your account has been disabled. Contact support.');
      } else if (status === 429) {
        setApiError('Too many login attempts. Please try again in a minute.');
      } else {
        setApiError(getApiErrorMessage(error, 'We couldn’t sign you in. Please try again.'));
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
          label="Email"
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
          label="Password"
          autoComplete="current-password"
          registration={register('password')}
          error={errors.password?.message}
        />

        <div className="pt-2">
          <AuthSubmitButton busy={busy} busyLabel={isRedirecting ? 'Redirecting...' : 'Signing in...'}>
            Log in
          </AuthSubmitButton>
        </div>
      </form>
    </>
  );
}

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to continue to Skraft."
      switchPrompt="Don't have an account?"
      switchLabel="Register"
      switchHref="/register"
      image={{ src: '/auth/login.jpg', alt: 'A quiet, sunlit creator workspace' }}
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
