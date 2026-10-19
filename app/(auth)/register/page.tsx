'use client';

import { Suspense, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { InfoHint } from '@/components/ui/InfoHint';
import { AuthShell } from '@/components/auth/AuthShell';
import {
  AuthErrorBanner,
  AuthPasswordField,
  AuthSubmitButton,
  AuthTextField,
  FieldError,
} from '@/components/auth/AuthFields';
import { SocialOAuthButtons } from '@/components/auth/SocialOAuthButtons';
import { AxiosError } from 'axios';
import { getApiErrorMessage } from '@/lib/api-error';
import { savePendingVerification } from '@/lib/pending-verification';
import { useLocale, useT } from '@/lib/i18n/I18nProvider';
import { msg } from '@/lib/i18n/config';

const USERNAME_REGEX = /^[A-Za-z0-9_]{3,30}$/;

const PASSWORD_RULES = [
  { label: msg('8+ characters'), test: (v: string) => v.length >= 8 },
  { label: msg('One uppercase'), test: (v: string) => /[A-Z]/.test(v) },
  { label: msg('One number'), test: (v: string) => /[0-9]/.test(v) },
] as const;

const registerSchema = z
  .object({
    fullName: z.string().min(2, 'Name must be at least 2 characters'),
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(30, 'Username must be at most 30 characters')
      .regex(USERNAME_REGEX, 'Letters, numbers, and underscores only'),
    email: z.string().email('Invalid email address'),
    password: z
      .string()
      .min(8, 'Minimum 8 characters')
      .regex(/[A-Z]/, 'At least one uppercase letter')
      .regex(/[0-9]/, 'At least one number'),
    confirmPassword: z.string(),
    termsAccepted: z.boolean().refine((val) => val === true, {
      message: 'You must accept the terms to continue',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

function PasswordRules({ value, showErrors }: { value: string; showErrors: boolean }) {
  const t = useT();
  return (
    <ul className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1.5" aria-label={t('Password requirements')}>
      {PASSWORD_RULES.map((rule) => {
        const met = rule.test(value);
        const tone = met
          ? 'text-[#111111] dark:text-white'
          : showErrors
            ? 'text-[#E0431A] dark:text-[#FF7A52]'
            : 'text-neutral-400 dark:text-neutral-500';
        return (
          <li key={rule.label} className={`inline-flex items-center gap-1.5 text-[13px] transition-colors ${tone}`}>
            <span
              aria-hidden
              className={`inline-flex h-3.5 w-3.5 items-center justify-center rounded-full transition-colors ${
                met ? 'bg-[#111111] text-white dark:bg-white dark:text-[#111111]' : 'border border-current'
              }`}
            >
              {met ? (
                <svg className="h-2 w-2" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={2.2}>
                  <path d="M2.5 6.5l2.2 2.2L9.5 3.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : null}
            </span>
            {t(rule.label)}
            <span className="sr-only">{met ? t('(met)') : t('(not met)')}</span>
          </li>
        );
      })}
    </ul>
  );
}

function RegisterForm() {
  const t = useT();
  const { locale } = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signup } = useAuth();
  const [apiError, setApiError] = useState<string | null>(null);
  const prefillEmail = searchParams.get('email') ?? '';

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: prefillEmail,
      termsAccepted: false,
    },
  });

  const password = useWatch({ control, name: 'password' }) ?? '';

  const onSubmit = async (data: RegisterFormData) => {
    setApiError(null);
    try {
      /* No session yet: the account opens once the e-mailed code is confirmed on /verify-email. */
      const response = await signup({
        fullName: data.fullName,
        username: data.username.trim(),
        email: data.email,
        password: data.password,
        role: 'CREATOR',
        locale,
      });
      savePendingVerification(response.email, response.resendCooldownSeconds);
      router.push('/verify-email');
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      if (axiosError.response?.status === 429) {
        setApiError(t('Too many sign-up attempts. Please try again in a minute.'));
      } else {
        setApiError(getApiErrorMessage(error, t('We couldn’t create your account. Please try again.')));
      }
    }
  };

  return (
    <>
      {apiError ? <AuthErrorBanner message={apiError} onDismiss={() => setApiError(null)} /> : null}

      <SocialOAuthButtons signup />

      {/*
        `method="post"` guards the window before hydration. React Hook Form calls
        preventDefault, but only once the page is interactive; a submit before that falls back to
        the browser's native one, and the default method is GET — which would put the password in
        the URL, and from there into history, the Referer header and every proxy log in front of
        the app. A native POST keeps it in the body.
      */}
      <form onSubmit={handleSubmit(onSubmit)} method="post" className="space-y-5" noValidate>
        <div className="grid gap-5 sm:grid-cols-2">
          <AuthTextField
            id="fullName"
            label={t('Full name')}
            type="text"
            autoComplete="name"
            placeholder={t('Alex Morgan')}
            registration={register('fullName')}
            error={errors.fullName?.message}
          />
          <AuthTextField
            id="username"
            label={t('Username')}
            type="text"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="alex_morgan"
            labelAside={<InfoHint align="end">{t('Unique handle — case-sensitive (leopard ≠ Leopard).')}</InfoHint>}
            registration={register('username')}
            error={errors.username?.message}
          />
        </div>

        <AuthTextField
          id="email"
          label={t('Email')}
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="you@email.com"
          registration={register('email')}
          error={errors.email?.message}
        />

        <AuthPasswordField
          id="password"
          label={t('Password')}
          autoComplete="new-password"
          registration={register('password')}
          error={password ? undefined : errors.password?.message}
        >
          <PasswordRules value={password} showErrors={Boolean(errors.password)} />
        </AuthPasswordField>

        <AuthPasswordField
          id="confirmPassword"
          label={t('Repeat password')}
          autoComplete="new-password"
          registration={register('confirmPassword')}
          error={errors.confirmPassword?.message}
        />

        <div>
          <label className="flex cursor-pointer items-start gap-3">
            <input
              {...register('termsAccepted')}
              type="checkbox"
              className="mt-[3px] h-4 w-4 shrink-0 cursor-pointer rounded accent-[#111111] dark:accent-white"
            />
            <span className="text-[14px] leading-relaxed text-neutral-500 dark:text-neutral-400">
              {t('I accept the')}{' '}
              <Link
                href="/terms"
                className="font-medium text-[#111111] underline decoration-black/20 underline-offset-4 transition-colors hover:decoration-[#111111] dark:text-white dark:decoration-white/30 dark:hover:decoration-white"
              >
                {t('Terms of Service')}
              </Link>{' '}
              {t('and')}{' '}
              <Link
                href="/privacy"
                className="font-medium text-[#111111] underline decoration-black/20 underline-offset-4 transition-colors hover:decoration-[#111111] dark:text-white dark:decoration-white/30 dark:hover:decoration-white"
              >
                {t('Privacy Policy')}
              </Link>
              .
            </span>
          </label>
          <FieldError>{errors.termsAccepted?.message}</FieldError>
        </div>

        <div className="pt-2">
          <AuthSubmitButton busy={isSubmitting} busyLabel={t('Creating account...')}>
            {t('Create account')}
          </AuthSubmitButton>
        </div>
      </form>
    </>
  );
}

export default function RegisterPage() {
  const t = useT();
  return (
    <AuthShell
      title={t('Create your account')}
      subtitle={t('Start selling and sharing your work in minutes.')}
      switchPrompt={t('Already have an account?')}
      switchLabel={t('Log in')}
      switchHref="/login"
    >
      <Suspense
        fallback={
          <div className="flex justify-center py-16">
            <LoadingSpinner />
          </div>
        }
      >
        <RegisterForm />
      </Suspense>
    </AuthShell>
  );
}
