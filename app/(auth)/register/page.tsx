'use client';

import { Suspense, useState } from 'react';
import { useForm, type UseFormRegisterReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { RegisterVisualPanel } from '@/components/auth/RegisterVisualPanel';
import { SocialOAuthButtons } from '@/components/auth/SocialOAuthButtons';
import { brandGradientBg, brandShadow } from '@/components/landing/landingBrand';
import { AxiosError } from 'axios';

const registerSchema = z
  .object({
    fullName: z.string().min(2, 'Name must be at least 2 characters'),
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

function PasswordField({
  id,
  label,
  error,
  autoComplete,
  registration,
}: {
  id: string;
  label: string;
  error?: string;
  autoComplete: string;
  registration: UseFormRegisterReturn;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          {...registration}
          type={visible ? 'text' : 'password'}
          autoComplete={autoComplete}
          className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 pr-11 text-sm text-neutral-900 transition focus:border-[#F97316]/50 focus:outline-none focus:ring-2 focus:ring-[#F97316]/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
          placeholder="••••••••"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 transition hover:text-neutral-600 dark:hover:text-neutral-300"
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )}
        </button>
      </div>
      {error ? (
        <p className="mt-1 text-xs text-red-500" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function RegisterForm() {
  const searchParams = useSearchParams();
  const { signup } = useAuth();
  const [apiError, setApiError] = useState<string | null>(null);
  const prefillEmail = searchParams.get('email') ?? '';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: prefillEmail,
      termsAccepted: false,
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setApiError(null);
    try {
      await signup({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        role: 'CREATOR',
      });
      window.location.assign('/dashboard/home');
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      if (axiosError.response?.status === 429) {
        setApiError('Too many sign-up attempts. Please try again in a minute.');
      } else {
        setApiError(axiosError.response?.data?.message || 'Something went wrong. Please try again.');
      }
    }
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-white dark:bg-neutral-950">
      <header className="flex shrink-0 items-center justify-between px-6 pt-4 sm:px-10 lg:px-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 transition hover:text-[#F97316] dark:text-neutral-400"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Go back
        </Link>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-[#F97316] hover:text-[#EA580C]">
            Log in
          </Link>
        </p>
      </header>

      <div className="flex min-h-0 flex-1 flex-col justify-center overflow-y-auto px-6 py-6 sm:px-10 lg:px-12">
        <div className="mx-auto w-full max-w-md">
          <h1 className="mb-4 text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">Register</h1>

          {apiError ? (
            <div className="mb-3">
              <ErrorAlert message={apiError} onDismiss={() => setApiError(null)} />
            </div>
          ) : null}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
            <div>
              <label htmlFor="fullName" className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Full name
              </label>
              <input
                id="fullName"
                {...register('fullName')}
                type="text"
                autoComplete="name"
                className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 transition focus:border-[#F97316]/50 focus:outline-none focus:ring-2 focus:ring-[#F97316]/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                placeholder="Alex Morgan"
              />
              {errors.fullName ? (
                <p className="mt-1 text-xs text-red-500" role="alert">
                  {errors.fullName.message}
                </p>
              ) : null}
            </div>

            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Email
              </label>
              <input
                id="email"
                {...register('email')}
                type="email"
                autoComplete="email"
                className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 transition focus:border-[#F97316]/50 focus:outline-none focus:ring-2 focus:ring-[#F97316]/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                placeholder="you@email.com"
              />
              {errors.email ? (
                <p className="mt-1 text-xs text-red-500" role="alert">
                  {errors.email.message}
                </p>
              ) : null}
            </div>

            <PasswordField
              id="password"
              label="Password"
              autoComplete="new-password"
              registration={register('password')}
              error={errors.password?.message}
            />

            <PasswordField
              id="confirmPassword"
              label="Repeat password"
              autoComplete="new-password"
              registration={register('confirmPassword')}
              error={errors.confirmPassword?.message}
            />

            <label className="flex cursor-pointer items-start gap-3">
              <input
                {...register('termsAccepted')}
                type="checkbox"
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
            {errors.termsAccepted ? (
              <p className="-mt-2 text-xs text-red-500" role="alert">
                {errors.termsAccepted.message}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition-all disabled:opacity-70 ${brandGradientBg} ${brandShadow}`}
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" />
                  Creating account...
                </>
              ) : (
                'Register'
              )}
            </button>

            <SocialOAuthButtons signup />
          </form>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="h-screen overflow-hidden lg:grid lg:grid-cols-2">
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center bg-white dark:bg-neutral-950">
            <LoadingSpinner />
          </div>
        }
      >
        <RegisterForm />
      </Suspense>
      <div className="hidden h-screen overflow-hidden p-5 lg:block lg:p-7 lg:pl-5 lg:pr-8">
        <RegisterVisualPanel />
      </div>
    </div>
  );
}
