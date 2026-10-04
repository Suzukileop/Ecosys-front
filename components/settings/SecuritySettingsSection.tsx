'use client';

import { useState, type FormEvent } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getApiErrorMessage } from '@/lib/api-error';
import { changePassword, revokeAllSessions, type AccountSecurity } from '@/lib/account-settings-api';
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

const STRENGTH_LABELS = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'] as const;

function passwordScore(value: string): number {
  if (value.length < 8) return 0;
  let score = 1;
  if (value.length >= 12) score += 1;
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score += 1;
  if (/\d/.test(value) && /[^A-Za-z0-9]/.test(value)) score += 1;
  return Math.min(score, 4);
}

function providerLabel(provider: string | undefined): string {
  if (!provider || provider.toUpperCase() === 'LOCAL') return 'Email and password';
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
  const { logout } = useAuth();
  const hasPassword = security?.hasPassword ?? true;
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmingSignOut, setConfirmingSignOut] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const score = passwordScore(newPassword);
  const mismatch = confirmPassword.length > 0 && confirmPassword !== newPassword;
  const canSubmit =
    !saving &&
    newPassword.length >= 8 &&
    newPassword === confirmPassword &&
    (!hasPassword || currentPassword.length > 0);

  const resetForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handlePassword = async (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    setSaving(true);
    try {
      await changePassword({ currentPassword: hasPassword ? currentPassword : undefined, newPassword });
      resetForm();
      if (security && !security.hasPassword) onSecurityChange({ ...security, hasPassword: true });
      pushFlashFeedback({
        variant: 'success',
        title: hasPassword ? 'Password changed' : 'Password created',
        description: hasPassword
          ? 'Use your new password the next time you sign in.'
          : 'You can now also sign in with your email and password.',
      });
    } catch (error) {
      pushFlashFeedback({
        variant: 'error',
        title: 'Password not updated',
        description: getApiErrorMessage(error, 'Please check your current password and try again.'),
      });
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
        title: 'Could not sign out',
        description: getApiErrorMessage(error, 'Please try again.'),
      });
    }
  };

  const inputType = showPasswords ? 'text' : 'password';

  return (
    <div>
      <SettingsSectionHeader
        title="Security"
        description="Keep your account protected. Update your password and control where you are signed in."
      />

      <div className="flex flex-col gap-6">
        <form onSubmit={(event) => void handlePassword(event)}>
          <SettingsCard
            title={hasPassword ? 'Change password' : 'Create a password'}
            description={
              hasPassword
                ? 'Use at least 8 characters. A longer passphrase with mixed characters is stronger.'
                : `You signed up with ${providerLabel(security?.authProvider)}. Add a password to also sign in with your email.`
            }
            footer={
              <>
                <label className="mr-auto inline-flex cursor-pointer items-center gap-2 text-[14px] text-[#555555] dark:text-neutral-400">
                  <input
                    type="checkbox"
                    checked={showPasswords}
                    onChange={(event) => setShowPasswords(event.target.checked)}
                    className="h-4 w-4 rounded border-black/20 accent-[#111111] dark:accent-white"
                  />
                  Show passwords
                </label>
                <button type="submit" disabled={!canSubmit} className={PRIMARY_BUTTON_CLASS}>
                  {saving ? <Spinner /> : null}
                  {hasPassword ? 'Update password' : 'Create password'}
                </button>
              </>
            }
          >
            <div className="flex flex-col gap-5 px-6 py-6">
              {hasPassword ? (
                <div className="sm:max-w-[calc(50%-0.625rem)]">
                  <TextField
                    label="Current password"
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
                    label="New password"
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
                                  ? 'bg-red-500'
                                  : score === 2
                                    ? 'bg-amber-500'
                                    : 'bg-[#111111] dark:bg-white'
                                : 'bg-black/[0.08] dark:bg-white/[0.1]'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="w-16 text-right text-[12px] font-medium text-[#666666] dark:text-neutral-400">
                        {STRENGTH_LABELS[score]}
                      </span>
                    </div>
                  ) : null}
                </div>
                <TextField
                  label="Confirm new password"
                  type={inputType}
                  value={confirmPassword}
                  maxLength={128}
                  autoComplete="new-password"
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  error={mismatch ? 'Passwords do not match.' : null}
                />
              </div>
            </div>
          </SettingsCard>
        </form>

        <SettingsCard title="Sign-in activity">
          <SettingRow label="Sign-in method" description={providerLabel(security?.authProvider)} />
          <SettingRow label="Last sign-in" description={formatSettingsDate(security?.lastLoginAt, true)} />
          <SettingRow
            label="Active sessions"
            description={
              security
                ? `${security.activeSessions} active ${security.activeSessions === 1 ? 'session' : 'sessions'}, including this device.`
                : '—'
            }
          />
        </SettingsCard>

        <SettingsCard>
          <SettingRow
            label="Sign out of all devices"
            description={
              confirmingSignOut
                ? 'You will be signed out here too and will need to sign in again.'
                : 'Lost a device or signed in somewhere public? End every session at once.'
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
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => void handleSignOutEverywhere()}
                  disabled={signingOut}
                  className={DANGER_BUTTON_CLASS}
                >
                  {signingOut ? <Spinner /> : null}
                  Sign out everywhere
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => setConfirmingSignOut(true)} className={SECONDARY_BUTTON_CLASS}>
                Sign out everywhere
              </button>
            )}
          </SettingRow>
        </SettingsCard>
      </div>
    </div>
  );
}
