'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '@/context/AuthContext';
import { getApiErrorMessage } from '@/lib/api-error';
import { deleteAccount, downloadAccountData, type AccountSecurity } from '@/lib/account-settings-api';
import { pushFlashFeedback } from '@/stores/flashFeedbackStore';
import {
  DANGER_BUTTON_CLASS,
  SECONDARY_BUTTON_CLASS,
  SettingRow,
  SettingsCard,
  SettingsSectionHeader,
  Spinner,
  TextField,
} from './settingsUi';

const CONFIRMATION_WORD = 'DELETE';

function DeleteAccountDialog({
  hasPassword,
  onClose,
}: {
  hasPassword: boolean;
  onClose: () => void;
}) {
  const { logout } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !deleting) onClose();
    };
    document.addEventListener('keydown', onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [deleting, onClose]);

  const canDelete =
    !deleting && confirmation.trim().toUpperCase() === CONFIRMATION_WORD && (!hasPassword || password.length > 0);

  const handleDelete = async (event: FormEvent) => {
    event.preventDefault();
    if (!canDelete) return;
    setDeleting(true);
    setError(null);
    try {
      await deleteAccount({ password: hasPassword ? password : undefined, confirmation: CONFIRMATION_WORD });
      await logout().catch(() => undefined);
      window.location.assign('/login');
    } catch (err) {
      setDeleting(false);
      setError(getApiErrorMessage(err, 'Your account could not be deleted. Please try again.'));
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="presentation">
      <div
        aria-hidden
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={() => (!deleting ? onClose() : undefined)}
      />
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-account-title"
        onSubmit={(event) => void handleDelete(event)}
        className="relative w-full max-w-md overflow-hidden rounded-xl border border-black/10 bg-white shadow-[0_30px_80px_-30px_rgba(0,0,0,0.45)] dark:border-white/10 dark:bg-[#111111]"
      >
        <div className="px-6 pb-2 pt-6">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-red-500/10 text-red-600 dark:text-red-400">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 3.5h.01M10.3 3.9L2.4 17.5A2 2 0 004.1 20.5h15.8a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" />
            </svg>
          </span>
          <h2 id="delete-account-title" className="mt-4 text-[20px] font-semibold text-[#111111] dark:text-white">
            Delete your account?
          </h2>
          <p className="mt-2 text-[14px] leading-relaxed text-[#666666] dark:text-neutral-400">
            Your profile, portfolio and posts will be removed from Skraft and you will be signed out everywhere.
            This cannot be undone.
          </p>
        </div>

        <div className="flex flex-col gap-4 px-6 py-5">
          {hasPassword ? (
            <TextField
              label="Password"
              type="password"
              value={password}
              autoComplete="current-password"
              onChange={(event) => setPassword(event.target.value)}
            />
          ) : null}
          <TextField
            label={`Type ${CONFIRMATION_WORD} to confirm`}
            value={confirmation}
            autoComplete="off"
            spellCheck={false}
            onChange={(event) => setConfirmation(event.target.value)}
            placeholder={CONFIRMATION_WORD}
          />
          {error ? (
            <p role="alert" className="rounded-lg bg-red-500/[0.08] px-3.5 py-2.5 text-[13px] text-red-700 dark:text-red-400">
              {error}
            </p>
          ) : null}
        </div>

        <div className="flex justify-end gap-3 border-t border-black/[0.05] bg-black/[0.015] px-6 py-4 dark:border-white/[0.05] dark:bg-white/[0.02]">
          <button type="button" onClick={onClose} disabled={deleting} className={SECONDARY_BUTTON_CLASS}>
            Cancel
          </button>
          <button
            type="submit"
            disabled={!canDelete}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 text-[14px] font-medium text-white transition-colors duration-200 hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {deleting ? <Spinner /> : null}
            Delete account
          </button>
        </div>
      </form>
    </div>,
    document.body,
  );
}

export function DataSettingsSection({ security }: { security: AccountSecurity | null }) {
  const [exporting, setExporting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      await downloadAccountData();
      pushFlashFeedback({
        variant: 'success',
        title: 'Export ready',
        description: 'A copy of your data was downloaded as a JSON file.',
      });
    } catch (error) {
      pushFlashFeedback({
        variant: 'error',
        title: 'Export failed',
        description: getApiErrorMessage(error, 'Please try again in a moment.'),
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      <SettingsSectionHeader
        title="Your data"
        description="You own your data. Take a copy with you at any time, or close your account for good."
      />

      <div className="flex flex-col gap-6">
        <SettingsCard title="Download your data">
          <SettingRow
            label="Account archive"
            description="Includes your account details, preferences, profile, follow counts and published content."
          >
            <button type="button" onClick={() => void handleExport()} disabled={exporting} className={SECONDARY_BUTTON_CLASS}>
              {exporting ? <Spinner /> : null}
              {exporting ? 'Preparing…' : 'Download JSON'}
            </button>
          </SettingRow>
        </SettingsCard>

        <section className="overflow-hidden rounded-lg border border-red-600/20 bg-white dark:border-red-400/20 dark:bg-white/[0.04]">
          <div className="border-b border-red-600/10 px-6 py-5 dark:border-red-400/10">
            <h3 className="text-[16px] font-semibold text-red-600 dark:text-red-400">Danger zone</h3>
          </div>
          <SettingRow
            label="Delete account"
            description="Permanently remove your account, portfolio and content. Purchases you made remain on record for legal reasons."
          >
            <button type="button" onClick={() => setDialogOpen(true)} className={DANGER_BUTTON_CLASS}>
              Delete account
            </button>
          </SettingRow>
        </section>
      </div>

      {dialogOpen ? (
        <DeleteAccountDialog hasPassword={security?.hasPassword ?? true} onClose={() => setDialogOpen(false)} />
      ) : null}
    </div>
  );
}
