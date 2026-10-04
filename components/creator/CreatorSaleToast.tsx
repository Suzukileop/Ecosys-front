'use client';

import { AnimatePresence, motion } from 'framer-motion';

export type SaleToast = {
  id: number;
  tone: 'success' | 'info' | 'error';
  title: string;
  detail?: string;
  /** Shown as an inline action while the undo window is open. */
  onUndo?: () => void;
  undoing?: boolean;
};

const DOT: Record<SaleToast['tone'], string> = {
  success: 'bg-[#FF5722]',
  info: 'bg-neutral-400',
  error: 'bg-red-500',
};

export function CreatorSaleToast({ toast, onDismiss }: { toast: SaleToast | null; onDismiss: () => void }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[61] flex justify-center px-4" role="status" aria-live="polite">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-auto flex max-w-md items-center gap-4 rounded-xl border border-white/[0.08] bg-[#141414]/95 py-3 pl-5 pr-3 text-white shadow-[0_16px_40px_-12px_rgba(0,0,0,0.6)] backdrop-blur-xl"
          >
            <span aria-hidden className={`h-2 w-2 shrink-0 rounded-full ${DOT[toast.tone]}`} />
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-semibold leading-snug">{toast.title}</p>
              {toast.detail && <p className="mt-0.5 text-[13px] leading-snug text-white/60">{toast.detail}</p>}
            </div>
            {toast.onUndo ? (
              <button
                type="button"
                disabled={toast.undoing}
                onClick={toast.onUndo}
                className="shrink-0 rounded-lg px-3 py-2 text-[14px] font-semibold text-[#FF5722] transition hover:bg-white/[0.06] disabled:opacity-50"
              >
                {toast.undoing ? 'Undoing…' : 'Undo'}
              </button>
            ) : null}
            <button
              type="button"
              aria-label="Dismiss"
              onClick={onDismiss}
              className="shrink-0 rounded-lg px-2 py-2 text-[15px] leading-none text-white/40 transition hover:bg-white/[0.06] hover:text-white"
            >
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
