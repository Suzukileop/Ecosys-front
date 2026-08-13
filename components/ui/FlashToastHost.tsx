'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faCircleExclamation, faInfo, faXmark } from '@fortawesome/free-solid-svg-icons';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { parseCreatorProductFlash, type FlashVariant } from '@/lib/flash-feedback';
import { pushFlashFeedback, useFlashFeedbackStore } from '@/stores/flashFeedbackStore';

function formatToastTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

function ToastGlyph({ variant }: { variant: FlashVariant }) {
  if (variant === 'error') {
    return (
      <FontAwesomeIcon
        icon={faCircleExclamation}
        className="h-4.5 w-4.5 text-red-500 dark:text-red-400"
        fixedWidth
        aria-hidden
      />
    );
  }
  if (variant === 'info' || variant === 'neutral') {
    return (
      <FontAwesomeIcon
        icon={faInfo}
        className="h-4.5 w-4.5 text-sky-600 dark:text-sky-400"
        fixedWidth
        aria-hidden
      />
    );
  }
  return (
    <FontAwesomeIcon
      icon={faCheck}
      className="h-4.5 w-4.5 text-[#EA580C] dark:text-[#FB923C]"
      fixedWidth
      aria-hidden
    />
  );
}

function FlashToastItem({
  toast,
  onDismiss,
  fromBottom = false,
}: {
  toast: ReturnType<typeof useFlashFeedbackStore.getState>['toasts'][number];
  onDismiss: (id: string) => void;
  fromBottom?: boolean;
}) {
  const durationMs = toast.durationMs ?? 5000;
  const dismissRef = useRef(onDismiss);
  const [shownAt] = useState(() => new Date());
  const timeLabel = useMemo(() => formatToastTime(shownAt), [shownAt]);
  const hasRichBody = Boolean(toast.description || toast.actionHref);
  const enterY = fromBottom ? 16 : -12;
  const exitY = fromBottom ? 10 : -8;

  useEffect(() => {
    dismissRef.current = onDismiss;
  }, [onDismiss]);

  useEffect(() => {
    const timer = window.setTimeout(() => dismissRef.current(toast.id), durationMs);
    return () => window.clearTimeout(timer);
  }, [toast.id, durationMs]);

  if (hasRichBody) {
    return (
      <motion.div
        layout
        role="status"
        aria-live="polite"
        aria-labelledby={`flash-title-${toast.id}`}
        initial={{ opacity: 0, y: enterY, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: exitY, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 400, damping: 32 }}
        className="pointer-events-auto w-full max-w-[min(100vw-2rem,26rem)] rounded-2xl border border-neutral-200/90 bg-white/95 p-4 shadow-lg shadow-neutral-900/10 backdrop-blur-md dark:border-neutral-700 dark:bg-[#141414]/95 dark:shadow-black/40"
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5 shrink-0">
            <ToastGlyph variant={toast.variant} />
          </div>
          <div className="min-w-0 flex-1">
            <p
              id={`flash-title-${toast.id}`}
              className="text-[13px] font-bold uppercase tracking-[0.08em] text-neutral-900 dark:text-white"
            >
              {toast.title}
            </p>
            {toast.description ? (
              <p className="mt-1.5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
                {toast.description}
              </p>
            ) : null}
            {toast.actionHref && toast.actionLabel ? (
              <div className="mt-3">
                <Link
                  href={toast.actionHref}
                  className="inline-flex items-center justify-center rounded-full bg-[#F97316] px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-[#EA580C]"
                  onClick={() => onDismiss(toast.id)}
                >
                  {toast.actionLabel}
                </Link>
              </div>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => onDismiss(toast.id)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-500 dark:hover:bg-white/10 dark:hover:text-neutral-200"
            aria-label="Dismiss notification"
          >
            <FontAwesomeIcon icon={faXmark} className="h-3.5 w-3.5" fixedWidth />
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      role="status"
      aria-live="polite"
      initial={{ opacity: 0, y: enterY, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: exitY, scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
      className="pointer-events-auto inline-flex max-w-[min(100vw-2.5rem,38rem)] items-center gap-3.5 rounded-full border border-neutral-200/90 bg-white/95 py-3.5 pl-6 pr-3.5 shadow-lg shadow-neutral-900/10 backdrop-blur-md dark:border-neutral-700 dark:bg-[#141414]/95 dark:shadow-black/40"
    >
      <ToastGlyph variant={toast.variant} />
      <p className="min-w-0 truncate text-[14px] font-bold uppercase tracking-[0.08em] text-neutral-900 dark:text-white">
        {toast.title}
      </p>
      <span className="h-4 w-px shrink-0 bg-neutral-300 dark:bg-neutral-600" aria-hidden />
      <span className="shrink-0 text-[14px] font-medium tabular-nums text-neutral-500 dark:text-neutral-400">
        {timeLabel}
      </span>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="ml-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-500 dark:hover:bg-white/10 dark:hover:text-neutral-200"
        aria-label="Dismiss notification"
      >
        <FontAwesomeIcon icon={faXmark} className="h-3.5 w-3.5" fixedWidth />
      </button>
    </motion.div>
  );
}

export function FlashToastHost() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const toasts = useFlashFeedbackStore((state) => state.toasts);
  const dismiss = useFlashFeedbackStore((state) => state.dismiss);
  const consumedFlashRef = useRef<string | null>(null);

  const topToasts = useMemo(
    () => toasts.filter((toast) => toast.placement !== 'bottom'),
    [toasts]
  );
  const bottomToasts = useMemo(
    () => toasts.filter((toast) => toast.placement === 'bottom'),
    [toasts]
  );

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

  if (toasts.length === 0) return null;

  return (
    <>
      {topToasts.length > 0 ? (
        <div
          aria-label="Notifications"
          className="pointer-events-none fixed inset-x-0 top-5 z-[300] flex flex-col items-center gap-2.5 px-4"
        >
          <AnimatePresence mode="popLayout">
            {topToasts.map((toast) => (
              <FlashToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
            ))}
          </AnimatePresence>
        </div>
      ) : null}

      {bottomToasts.length > 0 ? (
        <div
          aria-label="Limit notifications"
          className="pointer-events-none fixed inset-x-0 bottom-6 z-[300] flex flex-col items-center gap-2.5 px-4"
        >
          <AnimatePresence mode="popLayout">
            {bottomToasts.map((toast) => (
              <FlashToastItem key={toast.id} toast={toast} onDismiss={dismiss} fromBottom />
            ))}
          </AnimatePresence>
        </div>
      ) : null}
    </>
  );
}
