'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Avatar } from '@/components/ui/Avatar';
import { useAuth } from '@/context/AuthContext';
import { getApiErrorMessage } from '@/lib/api-error';
import { useT } from '@/lib/i18n/I18nProvider';
import { updateUserProfile, uploadUserAvatar } from '@/lib/user-profile-api';
import { pushFlashFeedback } from '@/stores/flashFeedbackStore';
import type { AccountSecurity } from '@/lib/account-settings-api';
import {
  PRIMARY_BUTTON_CLASS,
  SECONDARY_BUTTON_CLASS,
  SettingRow,
  SettingsCard,
  SettingsSectionHeader,
  Spinner,
  TextField,
  formatSettingsDate,
} from './settingsUi';

const USERNAME_PATTERN = /^[A-Za-z0-9_]{3,30}$/;
const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

export function AccountSettingsSection({ security }: { security: AccountSecurity | null }) {
  const t = useT();
  const { user, updateUser } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [username, setUsername] = useState(user?.username ?? '');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFullName(user?.fullName ?? '');
    setUsername(user?.username ?? '');
  }, [user?.fullName, user?.username]);

  if (!user) return null;

  const trimmedName = fullName.trim();
  const trimmedUsername = username.trim();
  const nameError = trimmedName.length === 0 ? t('Your name is required.') : null;
  const usernameError =
    trimmedUsername.length > 0 && !USERNAME_PATTERN.test(trimmedUsername)
      ? t('3–30 characters: letters, numbers and underscores only.')
      : trimmedUsername.length === 0
        ? t('A username is required.')
        : null;
  const dirty = trimmedName !== (user.fullName ?? '') || trimmedUsername !== (user.username ?? '');
  const canSave = dirty && !nameError && !usernameError && !saving;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!canSave) return;
    setSaving(true);
    try {
      const updated = await updateUserProfile({
        ...(trimmedName !== user.fullName ? { fullName: trimmedName } : {}),
        ...(trimmedUsername !== user.username ? { username: trimmedUsername } : {}),
      });
      updateUser({ fullName: updated.fullName, username: updated.username, avatarUrl: updated.avatarUrl });
      pushFlashFeedback({ variant: 'success', title: t('Profile updated'), description: t('Your account details were saved.') });
    } catch (error) {
      pushFlashFeedback({
        variant: 'error',
        title: t('Could not save changes'),
        description: getApiErrorMessage(error, t('Please try again.')),
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatar = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      pushFlashFeedback({ variant: 'error', title: t('Unsupported file'), description: t('Choose a JPG, PNG or WebP image.') });
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      pushFlashFeedback({ variant: 'error', title: t('Image too large'), description: t('The maximum size is 5 MB.') });
      return;
    }
    setUploading(true);
    try {
      const updated = await uploadUserAvatar(file);
      updateUser({ avatarUrl: updated.avatarUrl });
      pushFlashFeedback({ variant: 'success', title: t('Photo updated'), description: t('Your new profile photo is live.') });
    } catch (error) {
      pushFlashFeedback({
        variant: 'error',
        title: t('Upload failed'),
        description: getApiErrorMessage(error, t('Please try another image.')),
      });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const emailVerified = security?.emailVerified ?? user.emailVerified;

  return (
    <div>
      <SettingsSectionHeader
        title={t('Account')}
        description={t('Manage the identity people see across Skraft and the email you use to sign in.')}
      />

      <div className="flex flex-col">
        <SettingsCard title={t('Profile photo')} description={t('Shown on your posts, messages and portfolio.')}>
          <div className="flex flex-col gap-5 px-4 py-4 sm:flex-row sm:items-center sm:px-0">
            <div className="relative">
              <Avatar name={user.fullName} avatarUrl={user.avatarUrl} size="xl" />
              {uploading ? (
                <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 text-white">
                  <Spinner className="h-5 w-5" />
                </span>
              ) : null}
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className={PRIMARY_BUTTON_CLASS}
                >
                  {uploading ? t('Uploading…') : t('Upload new photo')}
                </button>
              </div>
              <p className="text-[13px] leading-[18px] text-[color:var(--gn-ink2)]">{t('JPG, PNG or WebP, up to 5 MB.')}</p>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(event) => void handleAvatar(event.target.files?.[0])}
            />
          </div>
        </SettingsCard>

        <form onSubmit={(event) => void handleSubmit(event)}>
          <SettingsCard
            title={t('Personal information')}
            description={t('Your name and username appear on your public profile.')}
            footer={
              <>
                <button
                  type="button"
                  disabled={!dirty || saving}
                  onClick={() => {
                    setFullName(user.fullName ?? '');
                    setUsername(user.username ?? '');
                  }}
                  className={SECONDARY_BUTTON_CLASS}
                >
                  {t('Cancel')}
                </button>
                <button type="submit" disabled={!canSave} className={PRIMARY_BUTTON_CLASS}>
                  {saving ? <Spinner /> : null}
                  {t('Save changes')}
                </button>
              </>
            }
          >
            <div className="grid gap-5 px-4 py-4 sm:grid-cols-2 sm:px-0">
              <TextField
                label={t('Full name')}
                value={fullName}
                maxLength={120}
                autoComplete="name"
                onChange={(event) => setFullName(event.target.value)}
                error={dirty ? nameError : null}
              />
              <TextField
                label={t('Username')}
                prefix="@"
                value={username}
                maxLength={30}
                autoComplete="username"
                spellCheck={false}
                onChange={(event) => setUsername(event.target.value.replace(/\s/g, ''))}
                error={dirty ? usernameError : null}
                hint={t('Used in your profile link.')}
              />
            </div>
          </SettingsCard>
        </form>

        <SettingsCard title={t('Email address')} description={t('Used to sign in and to receive important account notices.')}>
          <SettingRow
            label={security?.email ?? user.email}
            description={
              emailVerified
                ? t('Verified — you will receive account and security emails here.')
                : t('Not verified yet. Check your inbox for the verification link.')
            }
          >
            <span
              className={`inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-[13px] font-semibold leading-[18px] ${
                emailVerified
                  ? 'bg-[color:var(--gn-field)] text-[color:var(--gn-ink)]'
                  : 'border border-[#CFD9DE] text-[color:var(--gn-ink2)] dark:border-[#536471]'
              }`}
            >
              {emailVerified ? (
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="m5 12.5 4.5 4.5L19 7.5" />
                </svg>
              ) : null}
              {emailVerified ? t('Verified') : t('Unverified')}
            </span>
          </SettingRow>
          <SettingRow label={t('Member since')} description={formatSettingsDate(security?.createdAt ?? user.createdAt, false, t.tag)} />
        </SettingsCard>

        <SettingsCard>
          <SettingRow
            label={t('Public profile')}
            description={t('Bio, skills, languages and the fields visitors can see are edited in your studio.')}
          >
            <Link href="/profile" className={SECONDARY_BUTTON_CLASS}>
              {t('Open studio')}
            </Link>
          </SettingRow>
        </SettingsCard>
      </div>
    </div>
  );
}
