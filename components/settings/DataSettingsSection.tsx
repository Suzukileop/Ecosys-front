'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '@/context/AuthContext';
import { getApiErrorMessage } from '@/lib/api-error';
import { useT } from '@/lib/i18n/I18nProvider';
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

/* The API checks this exact word, so it is typed in English whatever the interface language. */
const CONFIRMATION_WORD = 'DELETE';

function DeleteAccountDialog({
  hasPassword,
  onClose,
}: {
  hasPassword: boolean;
  onClose: () => void;
}) {
  const t = useT();
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
      setError(getApiErrorMessage(err, t('Your account could not be deleted. Please try again.')));
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4" role="presentation">
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
        className="news-theme relative max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white pb-[env(safe-area-inset-bottom)] sm:rounded-2xl sm:pb-0 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.35)] dark:bg-black dark:shadow-[0_0_0_1px_#2F3336]"
      >
        <div className="px-6 pb-2 pt-6">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F4212E]/10 text-[#F4212E]">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 3.5h.01M10.3 3.9L2.4 17.5A2 2 0 004.1 20.5h15.8a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" />
            </svg>
          </span>
          <h2 id="delete-account-title" className="mt-4 text-[20px] font-extrabold leading-6 text-[color:var(--gn-ink)]">
            {t('Delete your account?')}
          </h2>
          <p className="mt-2 text-[15px] leading-5 text-[color:var(--gn-ink2)]">
            {t(
              'Your profile, portfolio and posts will be removed from Skraft and you will be signed out everywhere. This cannot be undone.',
            )}
          </p>
        </div>

        <div className="flex flex-col gap-4 px-6 py-5">
          {hasPassword ? (
            <TextField
              label={t('Password')}
              type="password"
              value={password}
              autoComplete="current-password"
              onChange={(event) => setPassword(event.target.value)}
            />
          ) : null}
          <TextField
            label={t('Type {word} to confirm', { word: CONFIRMATION_WORD })}
            value={confirmation}
            autoComplete="off"
            spellCheck={false}
            onChange={(event) => setConfirmation(event.target.value)}
            placeholder={CONFIRMATION_WORD}
          />
          {error ? (
            <p role="alert" className="bg-[#F4212E]/[0.08] px-3.5 py-2.5 text-[13px] text-[#F4212E]">
              {error}
            </p>
          ) : null}
        </div>

        <div className="flex justify-end gap-3 px-6 pb-6 pt-1">
          <button type="button" onClick={onClose} disabled={deleting} className={SECONDARY_BUTTON_CLASS}>
            {t('Cancel')}
          </button>
          <button
            type="submit"
            disabled={!canDelete}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[#F4212E] px-5 text-[15px] font-semibold text-white transition-colors duration-150 hover:bg-[#DC1D29] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {deleting ? <Spinner /> : null}
            {t('Delete account')}
          </button>
        </div>
      </form>
    </div>,
    document.body,
  );
}

export function DataSettingsSection({ security }: { security: AccountSecurity | null }) {
  const t = useT();
  const [exporting, setExporting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      await downloadAccountData();
      pushFlashFeedback({
        variant: 'success',
        title: t('Export ready'),
        description: t('A copy of your data was downloaded as a JSON file.'),
      });
    } catch (error) {
      pushFlashFeedback({
        variant: 'error',
        title: t('Export failed'),
        description: getApiErrorMessage(error, t('Please try again in a moment.')),
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      <SettingsSectionHeader
        title={t('Your data')}
        description={t('You own your data. Take a copy with you at any time, or close your account for good.')}
      />

      <div className="flex flex-col">
        <SettingsCard title={t('Download your data')}>
          <SettingRow
            label={t('Account archive')}
            description={t('Includes your account details, preferences, profile, follow counts and published content.')}
          >
            <button type="button" onClick={() => void handleExport()} disabled={exporting} className={SECONDARY_BUTTON_CLASS}>
              {exporting ? <Spinner /> : null}
              {exporting ? t('Preparing…') : t('Download JSON')}
            </button>
          </SettingRow>
        </SettingsCard>

        <SettingsCard title={t('Danger zone')} tone="danger">
          <SettingRow
            label={t('Delete account')}
            description={t(
              'Permanently remove your account, portfolio and content. Purchases you made remain on record for legal reasons.',
            )}
          >
            <button type="button" onClick={() => setDialogOpen(true)} className={DANGER_BUTTON_CLASS}>
              {t('Delete account')}
            </button>
          </SettingRow>
        </SettingsCard>
      </div>

      {dialogOpen ? (
        <DeleteAccountDialog hasPassword={security?.hasPassword ?? true} onClose={() => setDialogOpen(false)} />
      ) : null}
    </div>
  );
}
