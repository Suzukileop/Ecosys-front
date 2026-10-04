'use client';

import { useState } from 'react';
import { reportContent } from '@/lib/marketplace-api';
import { getApiErrorMessage } from '@/lib/api-error';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import type { ReportReason } from '@/types/marketplace';

const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: 'SPAM', label: 'Spam' },
  { value: 'HARASSMENT', label: 'Harassment' },
  { value: 'INAPPROPRIATE', label: 'Inappropriate content' },
  { value: 'COPYRIGHT', label: 'Copyright violation' },
  { value: 'OTHER', label: 'Other' },
];

type CommentReportModalProps = {
  commentId: string;
  open: boolean;
  onClose: () => void;
  onReported?: () => void;
};

export function CommentReportModal({ commentId, open, onClose, onReported }: CommentReportModalProps) {
  const [reason, setReason] = useState<ReportReason>('SPAM');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!open) return null;

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await reportContent('COMMENT', commentId, reason, details.trim() || undefined);
      setSuccess(true);
      onReported?.();
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setDetails('');
        setReason('SPAM');
      }, 1200);
    } catch (e) {
      setError(getApiErrorMessage(e, 'Unable to send the report.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Close"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-comment-title"
        className="relative w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-5 shadow-xl dark:border-neutral-700 dark:bg-neutral-900"
      >
        <h2 id="report-comment-title" className="text-lg font-bold text-neutral-900 dark:text-white">
          Report this comment
        </h2>
        <p className="mt-1 text-sm text-neutral-500">
          Our team will review your report.
        </p>

        {error && (
          <div className="mt-3">
            <ErrorAlert message={error} onDismiss={() => setError(null)} />
          </div>
        )}

        {success ? (
          <p className="mt-4 text-sm font-medium text-green-700 dark:text-green-400">
            Report sent. Thank you.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            <div>
              <label htmlFor="report-reason" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Reason
              </label>
              <select
                id="report-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value as ReportReason)}
                className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-950"
              >
                {REPORT_REASONS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="report-details" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Details (optional)
              </label>
              <textarea
                id="report-details"
                rows={3}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-950"
                placeholder="Describe the issue…"
              />
            </div>
          </div>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-xl border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300"
          >
            Cancel
          </button>
          {!success && (
            <button
              type="button"
              onClick={() => void submit()}
              disabled={submitting}
              className="inline-flex items-center rounded-xl bg-[#111111] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-85 disabled:opacity-40 dark:bg-white dark:text-[#111111]"
            >
              {submitting ? <LoadingSpinner size="sm" /> : 'Send report'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
