'use client';

import { useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { parseCreatorProductFlash, type FlashVariant } from '@/lib/flash-feedback';
import { pushFlashFeedback, useFlashFeedbackStore } from '@/stores/flashFeedbackStore';
import { useT } from '@/lib/i18n/I18nProvider';

/** How long a toast stays: short for a plain confirmation, longer when it offers an action. */
const DEFAULT_DURATION_MS = 4000;
const ACTION_DURATION_MS = 6500;

function ToastGlyph({ variant }: { variant: FlashVariant }) {
  const common = {
    className: 'h-[18px] w-[18px] shrink-0',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2.2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };
  if (variant === 'error') {
    // The one colour a toast may carry: an error has to read as one at a glance.
    return (
      <svg {...common} className={`${common.className} text-[#F4212E]`}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7.5v5.5M12 16.5h.01" />
      </svg>
    );
  }
  if (variant === 'info' || variant === 'neutral') {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v5.5M12 7.5h.01" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  );
}

type Toast = ReturnType<typeof useFlashFeedbackStore.getState>['toasts'][number];

/**
 * One toast, X style: a compact inverted bar (ink on light pages, off-white on dark ones), an icon,
 * the message in sentence case — an optional second line under it — and the action, if any, as a
 * bold text button on the right. No timestamp, no close button: it leaves by itself, and a tap
 * anywhere on it (outside the action) sends it away sooner.
 */
function FlashToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const hasAction = Boolean(toast.actionLabel && (toast.actionHref || toast.onAction));
  const durationMs = toast.durationMs ?? (hasAction ? ACTION_DURATION_MS : DEFAULT_DURATION_MS);
  const dismissRef = useRef(onDismiss);

  useEffect(() => {
    dismissRef.current = onDismiss;
  }, [onDismiss]);

  useEffect(() => {
    const timer = window.setTimeout(() => dismissRef.current(toast.id), durationMs);
    return () => window.clearTimeout(timer);
  }, [toast.id, durationMs]);

  const actionClass =
    'shrink-0 rounded-md px-2 py-1 text-[14px] font-bold leading-5 underline-offset-4 transition-opacity hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current';

  return (
    <motion.div
      role={toast.variant === 'error' ? 'alert' : 'status'}
      aria-live={toast.variant === 'error' ? 'assertive' : 'polite'}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8, transition: { duration: 0.16 } }}
      transition={{ type: 'spring', stiffness: 520, damping: 38 }}
      onClick={() => onDismiss(toast.id)}
      data-pf-no-color-transition
      className="pointer-events-auto flex w-full cursor-default items-center gap-3 rounded-xl bg-[#0F1419] py-3 pl-4 pr-3 text-white shadow-[0_10px_32px_-8px_rgba(0,0,0,0.45)] dark:bg-[#EFF3F4] dark:text-[#0F1419] dark:shadow-[0_10px_32px_-8px_rgba(0,0,0,0.8)] sm:w-auto sm:min-w-[18rem] sm:max-w-[30rem]"
    >
      <ToastGlyph variant={toast.variant} />
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-medium leading-5">{toast.title}</p>
        {toast.description ? (
          <p className="mt-0.5 text-[13px] leading-[18px] opacity-70">{toast.description}</p>
        ) : null}
      </div>
      {hasAction ? (
        toast.actionHref ? (
          <Link
            href={toast.actionHref}
            className={actionClass}
            onClick={(e) => {
              e.stopPropagation();
              onDismiss(toast.id);
            }}
          >
            {toast.actionLabel}
          </Link>
        ) : (
          <button
            type="button"
            className={actionClass}
            onClick={(e) => {
              e.stopPropagation();
              onDismiss(toast.id);
              toast.onAction?.();
            }}
          >
            {toast.actionLabel}
          </button>
        )
      ) : null}
    </motion.div>
  );
}

/**
 * The app's toast surface. One toast at a time, bottom-centre (full width on phones, above the
 * home-indicator safe area): a new message replaces the one on screen instead of stacking, so two
 * quick actions (save, then unsave) never pile up as two cards over the page.
 */
export function FlashToastHost() {
  const t = useT();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const toasts = useFlashFeedbackStore((state) => state.toasts);
  const dismiss = useFlashFeedbackStore((state) => state.dismiss);
  const consumedFlashRef = useRef<string | null>(null);
  const current = toasts.length > 0 ? toasts[toasts.length - 1] : null;

  /* Older toasts are superseded by the newest one: drop them from the store. */
  useEffect(() => {
    if (toasts.length <= 1) return;
    for (const toast of toasts.slice(0, -1)) dismiss(toast.id);
  }, [toasts, dismiss]);

  const consumeUrlFlash = useCallback(() => {
    const flash = searchParams.get('flash');
    const flashTitle = searchParams.get('flashTitle');
    if (!flash) return;

    const signature = `${pathname}?${searchParams.toString()}`;
    if (consumedFlashRef.current === signature) return;
    consumedFlashRef.current = signature;

    const parsed = parseCreatorProductFlash(flash, flashTitle);
    if (parsed) {
      pushFlashFeedback(parsed);
    }

    const params = new URLSearchParams(searchParams.toString());
    params.delete('flash');
    params.delete('flashTitle');
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  useEffect(() => {
    consumeUrlFlash();
  }, [consumeUrlFlash]);

  return (
    <div
      aria-label={t('Notifications')}
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[300] flex justify-center px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] sm:pb-6"
    >
      <AnimatePresence mode="wait" initial={false}>
        {current ? <FlashToastItem key={current.id} toast={current} onDismiss={dismiss} /> : null}
      </AnimatePresence>
    </div>
  );
}
