'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DashboardHomeShell } from '@/components/DashboardHomeShell';
import { ProfileImageUploadField } from '@/components/profile/ProfileImageUploadField';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/context/AuthContext';
import { getApiErrorMessage } from '@/lib/api-error';
import { updateUserProfile, uploadUserAvatar } from '@/lib/user-profile-api';

const settingsSchema = z.object({
  fullName: z.string().min(1, 'Name is required.').max(150),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export default function UserSettingsPage() {
  const { user, isLoading, updateUser } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [saving, setSaving] = useState(false);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    values: {
      fullName: user?.fullName ?? '',
    },
  });

  const onAvatarUpload = async (file: File) => {
    setError(null);
    setSuccess(null);
    setUploadingAvatar(true);
    try {
      const updated = await uploadUserAvatar(file);
      updateUser({ avatarUrl: updated.avatarUrl, fullName: updated.fullName });
      setSuccess('Profile photo updated.');
    } catch (e) {
      setError(getApiErrorMessage(e, 'Unable to upload profile photo.'));
    } finally {
      setUploadingAvatar(false);
    }
  };

  const onSubmit = async (values: SettingsFormValues) => {
    setError(null);
    setSuccess(null);
    setSaving(true);
    try {
      const updated = await updateUserProfile({ fullName: values.fullName.trim() });
      updateUser({ fullName: updated.fullName, avatarUrl: updated.avatarUrl });
      setSuccess('Profile saved.');
    } catch (e) {
      setError(getApiErrorMessage(e, 'Unable to save profile.'));
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <DashboardHomeShell>
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <Link
            href="/dashboard"
            className="text-sm font-medium text-orange-600 hover:text-orange-700 dark:text-orange-400"
          >
            ← Dashboard
          </Link>
          <h1 className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">Profile settings</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Update your display name and profile photo.
          </p>
        </div>

        {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}
        {success && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
            {success}
          </div>
        )}

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <ProfileImageUploadField
            variant="avatar"
            imageUrl={user.avatarUrl}
            name={user.fullName}
            label="Profile photo"
            hint="JPEG, PNG or WebP — max 30 MB. Visible across the platform."
            uploading={uploadingAvatar}
            onFileSelect={onAvatarUpload}
          />
        </section>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
          noValidate
        >
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Display name
            </label>
            <input
              id="fullName"
              type="text"
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
              {...form.register('fullName')}
            />
            {form.formState.errors.fullName && (
              <p className="mt-1 text-sm text-red-600">{form.formState.errors.fullName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
            >
              {saving && <LoadingSpinner size="sm" />}
              Save changes
            </button>
          </div>
        </form>
      </div>
    </DashboardHomeShell>
  );
}
