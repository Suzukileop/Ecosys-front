'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Avatar } from '@/components/ui/Avatar';
import { useAuth } from '@/context/AuthContext';
import { getApiErrorMessage } from '@/lib/api-error';
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
  const nameError = trimmedName.length === 0 ? 'Your name is required.' : null;
  const usernameError =
    trimmedUsername.length > 0 && !USERNAME_PATTERN.test(trimmedUsername)
      ? '3–30 characters: letters, numbers and underscores only.'
      : trimmedUsername.length === 0
        ? 'A username is required.'
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
      pushFlashFeedback({ variant: 'success', title: 'Profile updated', description: 'Your account details were saved.' });
    } catch (error) {
      pushFlashFeedback({
        variant: 'error',
        title: 'Could not save changes',
        description: getApiErrorMessage(error, 'Please try again.'),
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatar = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      pushFlashFeedback({ variant: 'error', title: 'Unsupported file', description: 'Choose a JPG, PNG or WebP image.' });
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      pushFlashFeedback({ variant: 'error', title: 'Image too large', description: 'The maximum size is 5 MB.' });
      return;
    }
    setUploading(true);
    try {
      const updated = await uploadUserAvatar(file);
      updateUser({ avatarUrl: updated.avatarUrl });
      pushFlashFeedback({ variant: 'success', title: 'Photo updated', description: 'Your new profile photo is live.' });
    } catch (error) {
      pushFlashFeedback({
        variant: 'error',
        title: 'Upload failed',
        description: getApiErrorMessage(error, 'Please try another image.'),
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
        title="Account"
        description="Manage the identity people see across Skraft and the email you use to sign in."
      />

      <div className="flex flex-col gap-6">
        <SettingsCard title="Profile photo" description="Shown on your posts, messages and portfolio.">
          <div className="flex flex-col gap-5 px-6 py-6 sm:flex-row sm:items-center">
            <div className="relative">
              <Avatar name={user.fullName} avatarUrl={user.avatarUrl} size="xl" />
              {uploading ? (
                <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 text-white">
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
                  {uploading ? 'Uploading…' : 'Upload new photo'}
                </button>
              </div>
              <p className="text-[13px] text-[#888888] dark:text-neutral-500">JPG, PNG or WebP, up to 5 MB.</p>
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
            title="Personal information"
            description="Your name and username appear on your public profile."
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
                  Cancel
                </button>
                <button type="submit" disabled={!canSave} className={PRIMARY_BUTTON_CLASS}>
                  {saving ? <Spinner /> : null}
                  Save changes
                </button>
              </>
            }
          >
            <div className="grid gap-5 px-6 py-6 sm:grid-cols-2">
              <TextField
                label="Full name"
                value={fullName}
                maxLength={120}
                autoComplete="name"
                onChange={(event) => setFullName(event.target.value)}
                error={dirty ? nameError : null}
              />
              <TextField
                label="Username"
                prefix="@"
                value={username}
                maxLength={30}
                autoComplete="username"
                spellCheck={false}
                onChange={(event) => setUsername(event.target.value.replace(/\s/g, ''))}
                error={dirty ? usernameError : null}
                hint="Used in your profile link."
              />
            </div>
          </SettingsCard>
        </form>

        <SettingsCard title="Email address" description="Used to sign in and to receive important account notices.">
          <SettingRow
            label={security?.email ?? user.email}
            description={
              emailVerified
                ? 'Verified — you will receive account and security emails here.'
                : 'Not verified yet. Check your inbox for the verification link.'
            }
          >
            <span
              className={`inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium ${
                emailVerified
                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                  : 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
              }`}
            >
              <span
                aria-hidden
                className={`h-1.5 w-1.5 rounded-full ${emailVerified ? 'bg-emerald-500' : 'bg-amber-500'}`}
              />
              {emailVerified ? 'Verified' : 'Unverified'}
            </span>
          </SettingRow>
          <SettingRow label="Member since" description={formatSettingsDate(security?.createdAt ?? user.createdAt)} />
        </SettingsCard>

        <SettingsCard>
          <SettingRow
            label="Public profile"
            description="Bio, skills, languages and the fields visitors can see are edited in your studio."
          >
            <Link href="/dashboard/creator" className={SECONDARY_BUTTON_CLASS}>
              Open studio
            </Link>
          </SettingRow>
        </SettingsCard>
      </div>
    </div>
  );
}
