'use client';

import { useState } from 'react';
import {
  ContentPostDialogShell,
  DIALOG_PRIMARY_BUTTON,
  DIALOG_SECONDARY_BUTTON,
} from '@/components/creator/ContentPostDialogShell';
import { getApiErrorMessage } from '@/lib/api-error';
import { reportContent } from '@/lib/marketplace-api';
import type { ReportReason } from '@/types/marketplace';
import { useT } from '@/lib/i18n/I18nProvider';
import { msg } from '@/lib/i18n/config';

const REASONS: { value: ReportReason; label: string; hint: string }[] = [
  { value: 'SPAM', label: msg('Spam or misleading'), hint: msg('Ads, scams, repeated or fake content') },
  { value: 'HARASSMENT', label: msg('Harassment or hate'), hint: msg('Bullying, threats or targeted abuse') },
  { value: 'INAPPROPRIATE', label: msg('Inappropriate content'), hint: msg('Violent, sexual or otherwise unsuitable') },
  { value: 'COPYRIGHT', label: msg('Copyright violation'), hint: msg('Work used without the owner’s permission') },
  { value: 'OTHER', label: msg('Something else'), hint: msg('Tell us what is wrong') },
];

/** "Report post" — reason + optional details, sent to the moderation queue. */
export function ContentPostReportDialog({
  open,
  postId,
  onClose,
  onReported,
}: {
  open: boolean;
  postId: string;
  onClose: () => void;
  /** Called once the report is accepted (the dialog closes itself right after). */
  onReported?: () => void;
}) {
  const t = useT();
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [wasOpen, setWasOpen] = useState(open);

  if (wasOpen !== open) {
    setWasOpen(open);
    if (open) {
      setReason(null);
      setDetails('');
      setSubmitting(false);
      setError(null);
      setSent(false);
    }
  }

  const submit = async () => {
    if (!reason || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await reportContent('POST', postId, reason, details.trim() || undefined);
      setSent(true);
      onReported?.();
    } catch (e) {
      setError(getApiErrorMessage(e, t('Unable to send the report.')));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ContentPostDialogShell open={open} title={sent ? t('Report sent') : t('Report post')} onClose={onClose} busy={submitting}>
      {sent ? (
        <div className="px-5 pb-5">
          <p className="text-[15px] leading-relaxed text-neutral-600 dark:text-neutral-300">
            {t('Thanks for letting us know. Our team will review this post and act if it breaks the rules.')}
          </p>
          <div className="mt-5 flex justify-end">
            <button type="button" onClick={onClose} className={DIALOG_PRIMARY_BUTTON}>
              {t('Done')}
            </button>
          </div>
        </div>
      ) : (
        <div className="px-5 pb-5">
          <p className="mb-3 text-[14px] text-neutral-500 dark:text-neutral-400">{t('Why are you reporting this post?')}</p>
          <div role="radiogroup" aria-label={t('Reason')} className="space-y-1.5">
            {REASONS.map((item) => {
              const selected = reason === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setReason(item.value)}
                  data-pf-no-color-transition
                  className={`flex w-full items-start gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors ${
                    selected
                      ? 'border-[#111111] bg-black/[0.03] dark:border-white dark:bg-white/[0.06]'
                      : 'border-black/[0.1] hover:bg-black/[0.03] dark:border-white/[0.14] dark:hover:bg-white/[0.05]'
                  }`}
                >
                  <span
                    aria-hidden
                    className={`mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2 ${
                      selected ? 'border-[#111111] dark:border-white' : 'border-neutral-300 dark:border-neutral-600'
                    }`}
                  >
                    {selected ? <span className="h-2 w-2 rounded-full bg-[#111111] dark:bg-white" /> : null}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[15px] font-semibold text-[#111111] dark:text-white">{t(item.label)}</span>
                    <span className="block text-[13px] text-neutral-500 dark:text-neutral-400">{t(item.hint)}</span>
                  </span>
                </button>
              );
            })}
          </div>

          {reason ? (
            <div className="mt-4">
              <label htmlFor="report-details" className="mb-1.5 block text-[14px] font-semibold text-[#111111] dark:text-neutral-200">
                {t('Details')} <span className="font-normal text-neutral-400">{t('(optional)')}</span>
              </label>
              <textarea
                id="report-details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                maxLength={2000}
                rows={3}
                placeholder={t('Anything that helps us understand the problem')}
                className="block w-full resize-none rounded-xl border border-black/[0.14] bg-transparent px-3.5 py-2.5 text-[15px] text-[#111111] caret-[#FF5722] outline-hidden transition-[border-color,box-shadow] duration-150 placeholder:text-neutral-400 focus:border-[#FF5722] focus:shadow-[0_0_0_3px_rgba(255,87,34,0.16)] dark:border-white/[0.16] dark:text-white dark:placeholder:text-neutral-600"
              />
            </div>
          ) : null}

          {error ? (
            <p className="mt-3 text-[14px] font-medium text-red-600 dark:text-red-400" role="alert">
              {error}
            </p>
          ) : null}

          <div className="mt-5 flex items-center justify-end gap-2">
            <button type="button" onClick={onClose} disabled={submitting} className={DIALOG_SECONDARY_BUTTON}>
              {t('Cancel')}
            </button>
            <button
              type="button"
              onClick={() => void submit()}
              disabled={!reason || submitting}
              className={DIALOG_PRIMARY_BUTTON}
            >
              {submitting ? (
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />
              ) : null}
              {t('Send report')}
            </button>
          </div>
        </div>
      )}
    </ContentPostDialogShell>
  );
}
