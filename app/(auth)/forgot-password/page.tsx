'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AuthShell } from '@/components/auth/AuthShell';
import {
  AUTH_FIELD_CLASSES,
  AuthErrorBanner,
  AuthPasswordField,
  AuthSubmitButton,
  FieldError,
} from '@/components/auth/AuthFields';
import {
  EMPTY_VERIFICATION_CODE,
  VERIFICATION_CODE_LENGTH,
  VerificationCodeInput,
  useResendCooldown,
} from '@/components/auth/VerificationCodeInput';
import { getApiErrorCode, getApiErrorMessage } from '@/lib/api-error';
import { forgotPasswordApi, resetPasswordApi } from '@/lib/auth';
import { useLocale, useT } from '@/lib/i18n/I18nProvider';
import { msg } from '@/lib/i18n/config';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* A code the server burnt can't be retried: the boxes empty and the next step is "Resend code". */
const DEAD_CODE_ERRORS = new Set(['VERIFICATION_CODE_EXPIRED', 'VERIFICATION_TOO_MANY_ATTEMPTS']);

const passwordSchema = z
  .object({
    password: z.string().min(8, msg('Minimum 8 characters')).max(128, msg('At most 128 characters')),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: msg('Passwords do not match'),
    path: ['confirmPassword'],
  });

type PasswordFormData = z.infer<typeof passwordSchema>;

/** Step 1: the address to send a reset code to. The answer is the same whether it has an account. */
function EmailStep({ onSent }: { onSent: (email: string, cooldownSeconds: number) => void }) {
  const t = useT();
  const { locale } = useLocale();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const submit = async () => {
    const trimmed = email.trim();
    if (!EMAIL_REGEX.test(trimmed)) {
      setError(t('Enter a valid email address.'));
      return;
    }
    setError(null);
    setSending(true);
    try {
      const { resendCooldownSeconds } = await forgotPasswordApi(trimmed, locale);
      onSent(trimmed, resendCooldownSeconds);
    } catch (err) {
      setError(getApiErrorMessage(err, t('We couldn’t send a code. Please try again.')));
    } finally {
      setSending(false);
    }
  };

  return (
    <form
      method="post"
      noValidate
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
    >
      <div>
        <label htmlFor="forgot-email" className="mb-2 block text-[14px] font-medium text-[#111111] dark:text-white">
          {t('Email')}
        </label>
        <input
          id="forgot-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoFocus
          placeholder="you@email.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          aria-invalid={Boolean(error)}
          className={`${AUTH_FIELD_CLASSES.base} ${error ? AUTH_FIELD_CLASSES.error : AUTH_FIELD_CLASSES.ok}`}
        />
        <FieldError>{error ?? undefined}</FieldError>
      </div>
      <AuthSubmitButton busy={sending} busyLabel={t('Sending...')}>
        {t('Send code')}
      </AuthSubmitButton>
    </form>
  );
}

/** Step 2: the e-mailed code and the new password, checked together by the server. */
function ResetStep({
  email,
  resendAvailableAt,
  onResent,
  onChangeEmail,
  onDone,
}: {
  email: string;
  resendAvailableAt: number;
  onResent: (cooldownSeconds: number) => void;
  onChangeEmail: () => void;
  onDone: () => void;
}) {
  const t = useT();
  const { locale } = useLocale();
  const [digits, setDigits] = useState<string[]>(EMPTY_VERIFICATION_CODE);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [bannerError, setBannerError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const cooldown = useResendCooldown(resendAvailableAt);
  const code = digits.join('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PasswordFormData>({ resolver: zodResolver(passwordSchema) });

  const onSubmit = async (data: PasswordFormData) => {
    if (code.length !== VERIFICATION_CODE_LENGTH) {
      setCodeError(t('Enter the 6-digit code.'));
      return;
    }
    setCodeError(null);
    setBannerError(null);
    setNotice(null);
    try {
      await resetPasswordApi(email, code, data.password);
      onDone();
    } catch (err) {
      const errorCode = getApiErrorCode(err);
      if (errorCode === 'INVALID_VERIFICATION_CODE') {
        setCodeError(getApiErrorMessage(err));
      } else if (errorCode && DEAD_CODE_ERRORS.has(errorCode)) {
        setDigits(EMPTY_VERIFICATION_CODE);
        setCodeError(getApiErrorMessage(err));
      } else {
        setBannerError(getApiErrorMessage(err, t('We couldn’t reset your password. Please try again.')));
      }
    }
  };

  const resend = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    setBannerError(null);
    setNotice(null);
    try {
      const { resendCooldownSeconds } = await forgotPasswordApi(email, locale);
      onResent(resendCooldownSeconds);
      setDigits(EMPTY_VERIFICATION_CODE);
      setCodeError(null);
      setNotice(t('A new code is on its way. Check your inbox and spam folder.'));
    } catch (err) {
      setBannerError(getApiErrorMessage(err, t('We couldn’t send a new code. Please try again.')));
    } finally {
      setResending(false);
    }
  };

  return (
    <>
      {bannerError ? <AuthErrorBanner message={bannerError} onDismiss={() => setBannerError(null)} /> : null}

      <form onSubmit={handleSubmit(onSubmit)} method="post" noValidate className="space-y-5">
        <div>
          <p className="mb-2 text-[14px] font-medium text-[#111111] dark:text-white">{t('Verification code')}</p>
          <VerificationCodeInput
            digits={digits}
            onChange={(update) => {
              setDigits(update);
              setCodeError(null);
            }}
            invalid={Boolean(codeError)}
            disabled={isSubmitting}
          />
          <FieldError>{codeError ?? undefined}</FieldError>
        </div>

        <AuthPasswordField
          id="new-password"
          label={t('New password')}
          autoComplete="new-password"
          registration={register('password')}
          error={errors.password?.message ? t(errors.password.message) : undefined}
        />

        <AuthPasswordField
          id="confirm-new-password"
          label={t('Repeat password')}
          autoComplete="new-password"
          registration={register('confirmPassword')}
          error={errors.confirmPassword?.message ? t(errors.confirmPassword.message) : undefined}
        />

        <div className="pt-2">
          <AuthSubmitButton busy={isSubmitting} busyLabel={t('Saving...')}>
            {t('Reset password')}
          </AuthSubmitButton>
        </div>
      </form>

      <div className="mt-6 space-y-3 text-[14px] text-neutral-500 dark:text-neutral-400">
        {notice ? (
          <p role="status" className="text-[#111111] dark:text-white">
            {notice}
          </p>
        ) : null}
        <p>
          {t('Didn’t get it?')}{' '}
          {cooldown > 0 ? (
            <span aria-live="polite">{t('Resend in {seconds}s', { seconds: cooldown })}</span>
          ) : (
            <button
              type="button"
              onClick={() => void resend()}
              disabled={resending}
              className="font-medium text-[#111111] underline-offset-4 transition-colors hover:underline disabled:opacity-60 dark:text-white"
            >
              {resending ? t('Sending...') : t('Resend code')}
            </button>
          )}
        </p>
        <p>
          {t('Wrong address?')}{' '}
          <button
            type="button"
            onClick={onChangeEmail}
            className="font-medium text-[#111111] underline-offset-4 transition-colors hover:underline dark:text-white"
          >
            {t('Use another email')}
          </button>
        </p>
      </div>
    </>
  );
}

/**
 * "Forgot password?" — e-mail, then the e-mailed code with a new password. Also how an account made
 * with Google gets a password from the log-in page. Every session ends on success; the user logs in
 * with the new password next. Nothing here says whether an address has an account.
 */
export default function ForgotPasswordPage() {
  const t = useT();
  const [email, setEmail] = useState<string | null>(null);
  const [resendAvailableAt, setResendAvailableAt] = useState(0);
  const [done, setDone] = useState(false);

  const title = done ? t('Password updated') : t('Reset your password');
  const subtitle = done
    ? t('You’ve been signed out everywhere. Log in with your new password.')
    : email
      ? t('If an account exists for {email}, we’ve sent it a 6-digit code. It expires in 15 minutes.', { email })
      : t('Enter your email and we’ll send you a code to choose a new password.');

  return (
    <AuthShell
      title={title}
      subtitle={subtitle}
      switchPrompt={t('Remembered it?')}
      switchLabel={t('Log in')}
      switchHref="/login"
    >
      {done ? (
        <Link
          href="/login"
          className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[#111111] px-5 text-[15px] font-medium text-white transition-opacity hover:opacity-90 dark:bg-white dark:text-[#111111]"
        >
          {t('Log in')}
        </Link>
      ) : email ? (
        <ResetStep
          email={email}
          resendAvailableAt={resendAvailableAt}
          onResent={(seconds) => setResendAvailableAt(Date.now() + seconds * 1000)}
          onChangeEmail={() => setEmail(null)}
          onDone={() => setDone(true)}
        />
      ) : (
        <EmailStep
          onSent={(address, seconds) => {
            setEmail(address);
            setResendAvailableAt(Date.now() + seconds * 1000);
          }}
        />
      )}
    </AuthShell>
  );
}
