'use client';

import { Suspense, useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { AuthShell } from '@/components/auth/AuthShell';
import { AUTH_FIELD_CLASSES, AuthErrorBanner, AuthSubmitButton, FieldError } from '@/components/auth/AuthFields';
import {
  EMPTY_VERIFICATION_CODE,
  VERIFICATION_CODE_LENGTH,
  VerificationCodeInput,
  useResendCooldown,
} from '@/components/auth/VerificationCodeInput';
import { getApiErrorCode, getApiErrorMessage } from '@/lib/api-error';
import { resendVerificationApi } from '@/lib/auth';
import {
  clearPendingVerification,
  readPendingVerification,
  safeRedirectPath,
  savePendingVerification,
  type PendingVerification,
} from '@/lib/pending-verification';
import { SIGNED_IN_HOME } from '@/lib/routes';
import { useLocale, useT } from '@/lib/i18n/I18nProvider';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* A code the server burnt (expired, too many tries) can't be retried: the boxes empty and the next
   step is "Resend code". A wrong code keeps the address and just asks again. */
const DEAD_CODE_ERRORS = new Set(['VERIFICATION_CODE_EXPIRED', 'VERIFICATION_TOO_MANY_ATTEMPTS']);

const noSubscription = () => () => {};

/**
 * The pending address from sessionStorage, read during render once on the client (the server render
 * has no storage, hence `ready`), then owned locally: later changes (an address typed on this page,
 * a resend) are kept in state and mirrored to storage by the callers.
 */
function usePendingVerification() {
  const stored = useSyncExternalStore(
    noSubscription,
    () => {
      const pending = readPendingVerification();
      return pending ? JSON.stringify(pending) : '';
    },
    () => null,
  );
  const [override, setOverride] = useState<PendingVerification | null>(null);
  const fromStorage = stored ? (JSON.parse(stored) as PendingVerification) : null;
  return { ready: stored !== null, pending: override ?? fromStorage, setPending: setOverride };
}

/** No address in this tab (new tab, private window): ask for it and send a code to it. */
function EmailStep({ onCodeSent }: { onCodeSent: (email: string, cooldownSeconds: number) => void }) {
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
      const { resendCooldownSeconds } = await resendVerificationApi(trimmed, locale);
      onCodeSent(trimmed, resendCooldownSeconds);
    } catch (err) {
      setError(
        getApiErrorCode(err) === 'TOO_MANY_VERIFICATION_EMAILS'
          ? t('You’ve requested too many codes. Please try again later.')
          : getApiErrorMessage(err, t('We couldn’t send a code. Please try again.')),
      );
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
        <label htmlFor="verify-email-address" className="mb-2 block text-[14px] font-medium text-[#111111] dark:text-white">
          {t('Email')}
        </label>
        <input
          id="verify-email-address"
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

function VerifyEmailFlow({
  ready,
  pending,
  setPending,
}: {
  ready: boolean;
  pending: PendingVerification | null;
  setPending: (next: PendingVerification) => void;
}) {
  const t = useT();
  const { locale } = useLocale();
  const { verifyEmail } = useAuth();

  const email = pending?.email ?? null;
  const redirect = safeRedirectPath(pending?.redirect);
  const resendAvailableAt = pending?.resendAvailableAt ?? 0;

  const [digits, setDigits] = useState<string[]>(EMPTY_VERIFICATION_CODE);
  const [verifying, setVerifying] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [alreadyVerified, setAlreadyVerified] = useState(false);
  const [resending, setResending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [bannerError, setBannerError] = useState<string | null>(null);
  const lastSubmitted = useRef<string | null>(null);

  const cooldown = useResendCooldown(resendAvailableAt);

  const code = digits.join('');

  const submit = useCallback(
    async (value: string) => {
      if (!email || value.length !== VERIFICATION_CODE_LENGTH || verifying || redirecting) return;
      lastSubmitted.current = value;
      setVerifying(true);
      setCodeError(null);
      setBannerError(null);
      setNotice(null);
      try {
        await verifyEmail(email, value);
        clearPendingVerification();
        setRedirecting(true);
        /* Full document navigation, like log-in: starts the signed-in app from a clean state. */
        window.location.assign(redirect ?? SIGNED_IN_HOME);
      } catch (err) {
        const errorCode = getApiErrorCode(err);
        if (errorCode === 'EMAIL_ALREADY_VERIFIED') {
          clearPendingVerification();
          setAlreadyVerified(true);
        } else if (errorCode && DEAD_CODE_ERRORS.has(errorCode)) {
          setDigits(EMPTY_VERIFICATION_CODE);
          setCodeError(getApiErrorMessage(err));
        } else if (errorCode === 'INVALID_VERIFICATION_CODE') {
          setCodeError(getApiErrorMessage(err));
        } else {
          setBannerError(getApiErrorMessage(err, t('We couldn’t verify your email. Please try again.')));
        }
      } finally {
        setVerifying(false);
      }
    },
    [email, verifying, redirecting, verifyEmail, redirect, t],
  );

  /* The sixth digit submits — once per code, so a wrong code isn't re-sent until it's edited. */
  useEffect(() => {
    if (code.length === VERIFICATION_CODE_LENGTH && code !== lastSubmitted.current) void submit(code);
  }, [code, submit]);

  const resend = async () => {
    if (!email || cooldown > 0 || resending) return;
    setResending(true);
    setBannerError(null);
    setNotice(null);
    try {
      const { resendCooldownSeconds } = await resendVerificationApi(email, locale);
      savePendingVerification(email, resendCooldownSeconds, redirect);
      setPending({ email, redirect, resendAvailableAt: Date.now() + resendCooldownSeconds * 1000 });
      setDigits(EMPTY_VERIFICATION_CODE);
      setCodeError(null);
      lastSubmitted.current = null;
      setNotice(t('A new code is on its way. Check your inbox and spam folder.'));
    } catch (err) {
      setBannerError(
        getApiErrorCode(err) === 'TOO_MANY_VERIFICATION_EMAILS'
          ? t('You’ve requested too many codes. Please try again later.')
          : getApiErrorMessage(err, t('We couldn’t send a new code. Please try again.')),
      );
    } finally {
      setResending(false);
    }
  };

  if (!ready) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner />
      </div>
    );
  }

  if (alreadyVerified) {
    return (
      <div className="space-y-6">
        <p className="text-[15px] leading-relaxed text-neutral-600 dark:text-neutral-300">
          {t('This email is already verified. You can log in.')}
        </p>
        <Link
          href="/login"
          className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[#111111] px-5 text-[15px] font-medium text-white transition-opacity hover:opacity-90 dark:bg-white dark:text-[#111111]"
        >
          {t('Log in')}
        </Link>
      </div>
    );
  }

  if (!email) {
    return (
      <EmailStep
        onCodeSent={(address, cooldownSeconds) => {
          savePendingVerification(address, cooldownSeconds);
          setPending({ email: address, resendAvailableAt: Date.now() + cooldownSeconds * 1000 });
        }}
      />
    );
  }

  const busy = verifying || redirecting;

  return (
    <>
      {bannerError ? <AuthErrorBanner message={bannerError} onDismiss={() => setBannerError(null)} /> : null}

      <form
        method="post"
        noValidate
        className="space-y-5"
        onSubmit={(event) => {
          event.preventDefault();
          void submit(code);
        }}
      >
        <div>
          <VerificationCodeInput
            digits={digits}
            onChange={(update) => {
              setDigits(update);
              setCodeError(null);
            }}
            invalid={Boolean(codeError)}
            disabled={busy}
          />
          <FieldError>{codeError ?? undefined}</FieldError>
        </div>

        <AuthSubmitButton busy={busy} busyLabel={redirecting ? t('Redirecting...') : t('Verifying...')}>
          {t('Verify email')}
        </AuthSubmitButton>
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
          <Link
            href="/register"
            onClick={() => clearPendingVerification()}
            className="font-medium text-[#111111] underline-offset-4 transition-colors hover:underline dark:text-white"
          >
            {t('Sign up with another email')}
          </Link>
        </p>
      </div>
    </>
  );
}

export default function VerifyEmailPage() {
  const t = useT();
  const { ready, pending, setPending } = usePendingVerification();
  const email = pending?.email ?? null;

  return (
    <AuthShell
      title={t('Check your email')}
      subtitle={
        !ready
          ? ''
          : email
            ? t('We sent a 6-digit code to {email}. It expires in 15 minutes.', { email })
            : t('Enter the email you signed up with and we’ll send you a new code.')
      }
      switchPrompt={t('Already verified?')}
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
        <VerifyEmailFlow ready={ready} pending={pending} setPending={setPending} />
      </Suspense>
    </AuthShell>
  );
}
