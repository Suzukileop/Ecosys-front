'use client';

import { useState, type FormEvent } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getApiErrorCode, getApiErrorMessage } from '@/lib/api-error';
import { msg } from '@/lib/i18n/config';
import { useLocale, useT } from '@/lib/i18n/I18nProvider';
import type { Translator } from '@/lib/i18n/translate';
import {
  changePassword,
  revokeAllSessions,
  sendPasswordSetupCode,
  type AccountSecurity,
} from '@/lib/account-settings-api';
import {
  EMPTY_VERIFICATION_CODE,
  VERIFICATION_CODE_LENGTH,
  VerificationCodeInput,
  useResendCooldown,
} from '@/components/auth/VerificationCodeInput';
import { pushFlashFeedback } from '@/stores/flashFeedbackStore';
import {
  DANGER_BUTTON_CLASS,
  PRIMARY_BUTTON_CLASS,
  SECONDARY_BUTTON_CLASS,
  SettingRow,
  SettingsCard,
  SettingsSectionHeader,
  Spinner,
  TextField,
  formatSettingsDate,
} from './settingsUi';

const STRENGTH_LABELS = [msg('Too short'), msg('Weak'), msg('Fair'), msg('Good'), msg('Strong')] as const;

function passwordScore(value: string): number {
  if (value.length < 8) return 0;
  let score = 1;
  if (value.length >= 12) score += 1;
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score += 1;
  if (/\d/.test(value) && /[^A-Za-z0-9]/.test(value)) score += 1;
  return Math.min(score, 4);
}

/* A code the server burnt can't be retried: the boxes empty and the next step is "Resend code". */
const DEAD_CODE_ERRORS = new Set(['VERIFICATION_CODE_EXPIRED', 'VERIFICATION_TOO_MANY_ATTEMPTS']);

/** The settings field skin (tone fill, ink ring on focus), as TextField. */
const SETTINGS_CODE_BOX = (invalid: boolean) =>
  `h-12 rounded-md bg-[color:var(--gn-field)] text-[20px] font-semibold text-[color:var(--gn-ink)] outline-hidden transition-shadow duration-150 focus:shadow-[inset_0_0_0_2px_var(--gn-ink)] ${
    invalid ? 'shadow-[inset_0_0_0_1px_#F4212E]' : ''
  }`;

function providerLabel(provider: string | undefined, t: Translator): string {
  if (!provider || provider.toUpperCase() === 'LOCAL') return t('Email and password');
  const lower = provider.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

export function SecuritySettingsSection({
  security,
  onSecurityChange,
}: {
  security: AccountSecurity | null;
  onSecurityChange: (next: AccountSecurity) => void;
}) {
  const t = useT();
  const { locale } = useLocale();
  const { logout } = useAuth();
  const hasPassword = security?.hasPassword ?? true;
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmingSignOut, setConfirmingSignOut] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  /* First password (account made with Google): a session alone isn't proof enough — one left open on
     a shared computer could plant its own password — so the server e-mails a code first. Step 1 sends
     it ("Continue"), step 2 creates the password with it. */
  const [codeSent, setCodeSent] = useState(false);
  const [digits, setDigits] = useState<string[]>(EMPTY_VERIFICATION_CODE);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [resendAvailableAt, setResendAvailableAt] = useState(0);
  const [sendingCode, setSendingCode] = useState(false);
  const cooldown = useResendCooldown(resendAvailableAt);
  const code = digits.join('');
  const needsCode = !hasPassword;

  const score = passwordScore(newPassword);
  const mismatch = confirmPassword.length > 0 && confirmPassword !== newPassword;
  const canSubmit =
    !saving &&
    !sendingCode &&
    newPassword.length >= 8 &&
    newPassword === confirmPassword &&
    (hasPassword ? currentPassword.length > 0 : !codeSent || code.length === VERIFICATION_CODE_LENGTH);

  const resetForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setCodeSent(false);
    setDigits(EMPTY_VERIFICATION_CODE);
    setCodeError(null);
  };

  const requestCode = async () => {
    setSendingCode(true);
    setCodeError(null);
    try {
      const cooldownSeconds = await sendPasswordSetupCode(locale);
      setCodeSent(true);
      setDigits(EMPTY_VERIFICATION_CODE);
      setResendAvailableAt(Date.now() + cooldownSeconds * 1000);
    } catch (error) {
      if (getApiErrorCode(error) === 'PASSWORD_ALREADY_SET' && security) {
        onSecurityChange({ ...security, hasPassword: true });
      }
      pushFlashFeedback({
        variant: 'error',
        title: t('Code not sent'),
        description:
          getApiErrorCode(error) === 'TOO_MANY_VERIFICATION_EMAILS'
            ? t('You’ve requested too many codes. Please try again later.')
            : getApiErrorMessage(error, t('We couldn’t send a code. Please try again.')),
      });
    } finally {
      setSendingCode(false);
    }
  };

  const handlePassword = async (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    if (needsCode && !codeSent) {
      await requestCode();
      return;
    }
    setSaving(true);
    try {
      await changePassword({
        currentPassword: hasPassword ? currentPassword : undefined,
        verificationCode: needsCode ? code : undefined,
        newPassword,
      });
      resetForm();
      if (security && !security.hasPassword) onSecurityChange({ ...security, hasPassword: true });
      pushFlashFeedback({
        variant: 'success',
        title: hasPassword ? t('Password changed') : t('Password created'),
        description: hasPassword
          ? t('Use your new password the next time you sign in.')
          : t('You can now also sign in with your email and password.'),
      });
    } catch (error) {
      const errorCode = getApiErrorCode(error);
      if (needsCode && errorCode === 'INVALID_VERIFICATION_CODE') {
        setCodeError(getApiErrorMessage(error));
      } else if (needsCode && errorCode && DEAD_CODE_ERRORS.has(errorCode)) {
        setDigits(EMPTY_VERIFICATION_CODE);
        setCodeError(getApiErrorMessage(error));
      } else {
        pushFlashFeedback({
          variant: 'error',
          title: t('Password not updated'),
          description: getApiErrorMessage(error, t('Please check your current password and try again.')),
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSignOutEverywhere = async () => {
    setSigningOut(true);
    try {
      await revokeAllSessions();
      await logout();
      window.location.assign('/login');
    } catch (error) {
      setSigningOut(false);
      setConfirmingSignOut(false);
      pushFlashFeedback({
        variant: 'error',
        title: t('Could not sign out'),
        description: getApiErrorMessage(error, t('Please try again.')),
      });
    }
  };

  const inputType = showPasswords ? 'text' : 'password';

  return (
    <div>
      <SettingsSectionHeader
        title={t('Security')}
        description={t('Keep your account protected. Update your password and control where you are signed in.')}
      />

      <div className="flex flex-col">
        <form onSubmit={(event) => void handlePassword(event)}>
          <SettingsCard
            title={hasPassword ? t('Change password') : t('Create a password')}
            description={
              hasPassword
                ? t('Use at least 8 characters. A longer passphrase with mixed characters is stronger.')
                : `${t('You signed up with {provider}. Add a password to also sign in with your email.', {
                    provider: providerLabel(security?.authProvider, t),
                  })} ${t('To confirm it’s you, we’ll email you a code.')}`
            }
            footer={
              <>
                <label className="me-auto inline-flex min-h-10 cursor-pointer items-center gap-2 text-[14px] text-[color:var(--gn-ink2)]">
                  <input
                    type="checkbox"
                    checked={showPasswords}
                    onChange={(event) => setShowPasswords(event.target.checked)}
                    className="h-4 w-4 accent-[#0F1419] dark:accent-[#EFF3F4]"
                  />
                  {t('Show passwords')}
                </label>
                <button type="submit" disabled={!canSubmit} className={PRIMARY_BUTTON_CLASS}>
                  {saving || sendingCode ? <Spinner /> : null}
                  {hasPassword ? t('Update password') : codeSent ? t('Create password') : t('Continue')}
                </button>
              </>
            }
          >
            <div className="flex flex-col gap-5 px-4 py-4 sm:px-0">
              {hasPassword ? (
                <div className="sm:max-w-[calc(50%-0.625rem)]">
                  <TextField
                    label={t('Current password')}
                    type={inputType}
                    value={currentPassword}
                    autoComplete="current-password"
                    onChange={(event) => setCurrentPassword(event.target.value)}
                  />
                </div>
              ) : null}
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="flex flex-col gap-3">
                  <TextField
                    label={t('New password')}
                    type={inputType}
                    value={newPassword}
                    maxLength={128}
                    autoComplete="new-password"
                    onChange={(event) => setNewPassword(event.target.value)}
                  />
                  {newPassword.length > 0 ? (
                    <div className="flex items-center gap-3" aria-live="polite">
                      <div className="flex flex-1 gap-1">
                        {[1, 2, 3, 4].map((step) => (
                          <span
                            key={step}
                            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                              score >= step
                                ? score <= 1
                                  ? 'bg-[#F4212E]'
                                  : score === 2
                                    ? 'bg-[color:var(--gn-ink2)]'
                                    : 'bg-[color:var(--gn-ink)]'
                                : 'bg-[color:var(--gn-field)]'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="w-16 text-end text-[12px] font-medium text-[color:var(--gn-ink2)]">
                        {t(STRENGTH_LABELS[score])}
                      </span>
                    </div>
                  ) : null}
                </div>
                <TextField
                  label={t('Confirm new password')}
                  type={inputType}
                  value={confirmPassword}
                  maxLength={128}
                  autoComplete="new-password"
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  error={mismatch ? t('Passwords do not match.') : null}
                />
              </div>

              {needsCode && codeSent ? (
                <div className="flex flex-col gap-2 sm:max-w-[26rem]">
                  <p className="text-[14px] font-semibold leading-5 text-[color:var(--gn-ink)]">{t('Verification code')}</p>
                  <p className="text-[13px] leading-[18px] text-[color:var(--gn-ink2)]">
                    {t('Enter the 6-digit code we sent to {email}.', { email: security?.email ?? '' })}
                  </p>
                  <div className="mt-1">
                    <VerificationCodeInput
                      digits={digits}
                      onChange={(update) => {
                        setDigits(update);
                        setCodeError(null);
                      }}
                      invalid={Boolean(codeError)}
                      disabled={saving}
                      boxClassName={SETTINGS_CODE_BOX}
                    />
                  </div>
                  {codeError ? <p className="text-[13px] leading-[18px] text-[#F4212E]">{codeError}</p> : null}
                  <p className="text-[13px] leading-[18px] text-[color:var(--gn-ink2)]">
                    {t('Didn’t get it?')}{' '}
                    {cooldown > 0 ? (
                      <span aria-live="polite">{t('Resend in {seconds}s', { seconds: cooldown })}</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => void requestCode()}
                        disabled={sendingCode}
                        className="font-semibold text-[color:var(--gn-ink)] underline-offset-4 hover:underline disabled:opacity-60"
                      >
                        {sendingCode ? t('Sending...') : t('Resend code')}
                      </button>
                    )}
                  </p>
                </div>
              ) : null}
            </div>
          </SettingsCard>
        </form>

        <SettingsCard title={t('Sign-in activity')}>
          <SettingRow label={t('Sign-in method')} description={providerLabel(security?.authProvider, t)} />
          <SettingRow label={t('Last sign-in')} description={formatSettingsDate(security?.lastLoginAt, true, t.tag)} />
          <SettingRow
            label={t('Active sessions')}
            description={
              security
                ? t.plural(
                    security.activeSessions,
                    '{count} active session, including this device.',
                    '{count} active sessions, including this device.',
                  )
                : '—'
            }
          />
        </SettingsCard>

        <SettingsCard>
          <SettingRow
            label={t('Sign out of all devices')}
            description={
              confirmingSignOut
                ? t('You will be signed out here too and will need to sign in again.')
                : t('Lost a device or signed in somewhere public? End every session at once.')
            }
          >
            {confirmingSignOut ? (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmingSignOut(false)}
                  disabled={signingOut}
                  className={SECONDARY_BUTTON_CLASS}
                >
                  {t('Cancel')}
                </button>
                <button
                  type="button"
                  onClick={() => void handleSignOutEverywhere()}
                  disabled={signingOut}
                  className={DANGER_BUTTON_CLASS}
                >
                  {signingOut ? <Spinner /> : null}
                  {t('Sign out everywhere')}
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => setConfirmingSignOut(true)} className={SECONDARY_BUTTON_CLASS}>
                {t('Sign out everywhere')}
              </button>
            )}
          </SettingRow>
        </SettingsCard>
      </div>
    </div>
  );
}
