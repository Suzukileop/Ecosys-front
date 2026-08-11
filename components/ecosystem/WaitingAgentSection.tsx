'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { cancelRequest, validateModel } from '@/lib/ecosystem';
import { isModelReadyForReview } from '@/lib/ecosystem-steps';
import type { NicheRequestResponse } from '@/types/ecosystem';
import { getApiErrorMessage } from '@/lib/api-error';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { ValidationPreviewPanel } from '@/components/ecosystem/EcosystemDemoMedia';
import { brandShadow, brandSolidBg } from '@/components/landing/landingBrand';

const refuseSchema = z.object({
  rejectionReason: z.string().max(500).optional(),
});

type RefuseForm = z.infer<typeof refuseSchema>;

type Props = {
  request: NicheRequestResponse;
  onCancelled: () => void;
  onSkip: () => Promise<void>;
  onValidated?: () => void;
  actionsLocked?: boolean;
};

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function XCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function WaitingAgentSection({
  request,
  onCancelled,
  onSkip,
  onValidated,
  actionsLocked = false,
}: Props) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [skipping, setSkipping] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const modelReady = isModelReadyForReview(request);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RefuseForm>({
    resolver: zodResolver(refuseSchema),
    defaultValues: { rejectionReason: '' },
  });

  const onSkipClick = async () => {
    if (actionsLocked || skipping || modelReady) return;
    setSkipping(true);
    setError(null);
    try {
      await onSkip();
    } catch (e) {
      setError(getApiErrorMessage(e, 'Unable to skip to payment.'));
    } finally {
      setSkipping(false);
    }
  };

  const onConfirmCancel = async () => {
    setCancelling(true);
    setError(null);
    try {
      await cancelRequest(request.id);
      setConfirmOpen(false);
      onCancelled();
    } catch (e) {
      setError(getApiErrorMessage(e, 'Unable to cancel this request.'));
    } finally {
      setCancelling(false);
    }
  };

  const onAccept = async () => {
    if (actionsLocked || !modelReady) return;
    setBusy(true);
    setError(null);
    try {
      const res = await validateModel(request.id, { accepted: true });
      const checkout = res.checkoutUrl?.trim();
      if (checkout) {
        window.location.href = checkout;
        return;
      }
      onValidated?.();
      router.refresh();
    } catch (e) {
      setError(getApiErrorMessage(e, 'Unable to accept the model.'));
    } finally {
      setBusy(false);
    }
  };

  const onRefuseSubmit = handleSubmit(async (data) => {
    if (actionsLocked || !modelReady) return;
    setBusy(true);
    setError(null);
    try {
      await validateModel(request.id, {
        accepted: false,
        rejectionReason: data.rejectionReason?.trim() || 'Rejected by client',
      });
      setRejectOpen(false);
      reset();
      router.push('/dashboard/ecosystem');
    } catch (e) {
      setError(getApiErrorMessage(e, 'Unable to reject the proposal.'));
    } finally {
      setBusy(false);
    }
  });

  return (
    <section
      className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950"
      aria-label="Agent review"
    >
      {error && (
        <div className="border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
          <ErrorAlert message={error} onDismiss={() => setError(null)} />
        </div>
      )}

      <div
        className={`border-b px-5 py-5 sm:px-6 ${
          modelReady
            ? 'border-[#F97316]/30 bg-gradient-to-r from-[#FFF7ED] via-white to-[#FFF7ED]/60 dark:border-[#F97316]/25 dark:from-[#F97316]/15 dark:via-neutral-950 dark:to-[#F97316]/10'
            : 'border-[#F97316]/20 bg-[#FFF7ED] dark:border-[#F97316]/25 dark:bg-[#F97316]/10'
        }`}
        role="status"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-semibold ${
              modelReady
                ? 'border-[#F97316]/40 bg-white text-[#EA580C] shadow-sm dark:border-[#F97316]/50 dark:bg-neutral-950 dark:text-[#FB923C]'
                : 'border-[#F97316]/30 bg-white text-[#9A3412] dark:border-[#F97316]/40 dark:bg-neutral-950 dark:text-[#FB923C]'
            }`}
          >
            {modelReady ? (
              <>
                <CheckCircleIcon className="h-4 w-4 text-[#F97316]" />
                Model ready for review
              </>
            ) : (
              <>
                <span className="h-2 w-2 animate-pulse rounded-full bg-[#F97316]" aria-hidden />
                Waiting for your agent
              </>
            )}
          </span>
          <span className="shrink-0 rounded-full border border-[#F97316]/20 bg-white px-3 py-1 font-mono text-xs font-semibold text-[#EA580C] dark:border-[#F97316]/30 dark:bg-neutral-950">
            {request.uniqueCode}
          </span>
        </div>
        {modelReady && (
          <p className="mt-3 text-sm text-[#9A3412]/90 dark:text-[#FB923C]/90">
            Review the validation sample below, then accept to continue to payment or reject the
            proposal.
          </p>
        )}
      </div>

      <ValidationPreviewPanel
        demoUrl={request.demoContentUrl}
        agentNotes={request.agentNotes}
        waiting={!modelReady}
        skipHint={!modelReady}
        highlightReady={modelReady}
      />

      <div className="relative border-t border-neutral-200 dark:border-neutral-800">
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-neutral-50/80 to-white dark:from-neutral-900/40 dark:to-neutral-950"
          aria-hidden
        />

        <div className="relative px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-center text-xs font-medium uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
                Your decision
              </p>
              {!modelReady && (
                <p className="mt-2 text-center text-xs text-neutral-500 dark:text-neutral-400">
                  Accept and reject unlock once your agent posts the validation sample.
                </p>
              )}
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  disabled={busy || actionsLocked || !modelReady}
                  title={!modelReady ? 'Waiting for the validation sample from your agent' : undefined}
                  onClick={() => void onAccept()}
                  className={`group relative flex items-center justify-center gap-2.5 overflow-hidden rounded-2xl px-6 py-4 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-40 ${brandSolidBg} ${modelReady ? brandShadow : ''}`}
                >
                  <CheckCircleIcon className="h-5 w-5 shrink-0 opacity-90" />
                  {busy ? 'Processing…' : 'Accept model'}
                  {modelReady && (
                    <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 transition group-hover:opacity-100" />
                  )}
                </button>
                <button
                  type="button"
                  disabled={busy || actionsLocked || !modelReady}
                  title={!modelReady ? 'Waiting for the validation sample from your agent' : undefined}
                  onClick={() => setRejectOpen(true)}
                  className="flex items-center justify-center gap-2.5 rounded-2xl border border-red-200/80 bg-white px-6 py-4 text-sm font-semibold text-red-700 shadow-sm transition hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-red-900/50 dark:bg-neutral-950 dark:text-red-400 dark:hover:bg-red-950/30"
                >
                  <XCircleIcon className="h-5 w-5 shrink-0 opacity-80" />
                  Reject proposal
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-4 border-t border-neutral-100 pt-4 dark:border-neutral-800 sm:flex-row sm:items-center sm:justify-between">
              {!modelReady && (
                <button
                  type="button"
                  disabled={actionsLocked || skipping}
                  onClick={() => void onSkipClick()}
                  className="text-left text-sm font-semibold text-[#EA580C] underline-offset-2 transition hover:text-[#F97316] hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {skipping ? 'Skipping to payment…' : 'Skip model validation →'}
                </button>
              )}
              <button
                type="button"
                disabled={actionsLocked}
                onClick={() => setConfirmOpen(true)}
                className={`shrink-0 rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900/40 dark:bg-neutral-950 dark:text-red-400 dark:hover:bg-red-950/30 ${modelReady ? 'sm:ml-auto' : ''}`}
              >
                Cancel request
              </button>
            </div>
          </div>
        </div>
      </div>

      {confirmOpen && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="cancel-title"
        >
          <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-xl dark:border-neutral-700 dark:bg-neutral-950">
            <h2 id="cancel-title" className="text-lg font-semibold text-neutral-900 dark:text-white">
              Cancel this request?
            </h2>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              This action is permanent for this file. You can submit a new request afterward if
              needed.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-900"
                onClick={() => setConfirmOpen(false)}
              >
                Go back
              </button>
              <button
                type="button"
                disabled={cancelling}
                onClick={() => void onConfirmCancel()}
                className="rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-60"
              >
                {cancelling ? 'Cancelling…' : 'Confirm cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {rejectOpen && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reject-title"
        >
          <form
            onSubmit={onRefuseSubmit}
            className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-xl dark:border-neutral-700 dark:bg-neutral-950"
          >
            <h2 id="reject-title" className="text-lg font-semibold text-neutral-900 dark:text-white">
              Reject this proposal?
            </h2>
            <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
              The request will be cancelled. You can start a new one anytime.
            </p>
            <label
              htmlFor="rejectionReason"
              className="mt-4 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              Reason (optional)
            </label>
            <textarea
              id="rejectionReason"
              rows={4}
              {...register('rejectionReason')}
              className="mt-1 w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-2.5 text-sm focus:border-[#F97316]/50 focus:outline-none focus:ring-2 focus:ring-[#F97316]/15 dark:border-neutral-600 dark:bg-neutral-900 dark:text-white"
            />
            {errors.rejectionReason && (
              <p className="mt-1 text-sm text-red-600">{errors.rejectionReason.message}</p>
            )}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-600 dark:text-neutral-300"
                onClick={() => setRejectOpen(false)}
              >
                Go back
              </button>
              <button
                type="submit"
                disabled={busy}
                className="rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
              >
                {busy ? 'Sending…' : 'Confirm rejection'}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
