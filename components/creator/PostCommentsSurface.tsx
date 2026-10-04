'use client';

import { useEffect, useSyncExternalStore, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useDragControls } from 'framer-motion';
import { STUDIO_FLOAT_IN_STYLE } from '@/components/portfolio/PortfolioStudioKit';

const MOBILE_QUERY = '(max-width: 639px)';

function subscribeMobile(onChange: () => void) {
  const media = window.matchMedia(MOBILE_QUERY);
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
}

function useIsMobile() {
  return useSyncExternalStore(
    subscribeMobile,
    () => window.matchMedia(MOBILE_QUERY).matches,
    () => false
  );
}

/** Class overrides that make a `CommentThread` panel blend into its host surface. */
export const COMMENTS_INLINE_CLASS =
  '!h-auto !min-h-0 !max-h-[520px] !rounded-none !border-0 !bg-transparent !shadow-none';
export const COMMENTS_SHEET_CLASS = '!h-full !min-h-0 !rounded-none !border-0 !bg-transparent !shadow-none';

/**
 * Comments under a post: inline below the card on larger screens, a bottom sheet on phones so the
 * thread gets the full height and the composer stays pinned above the keyboard.
 */
export function PostCommentsSurface({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: (mode: 'inline' | 'sheet') => ReactNode;
}) {
  const isMobile = useIsMobile();
  const dragControls = useDragControls();
  const sheetOpen = open && isMobile;

  useEffect(() => {
    if (!sheetOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [sheetOpen, onClose]);

  if (!isMobile) {
    return open ? (
      <div className="border-t border-black/[0.06] px-3 pb-3 dark:border-white/[0.08]" style={STUDIO_FLOAT_IN_STYLE}>
        {children('inline')}
      </div>
    ) : null;
  }

  return createPortal(
    <AnimatePresence>
      {sheetOpen ? (
        <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label="Comments">
          <motion.button
            type="button"
            aria-label="Close comments"
            onClick={onClose}
            className="absolute inset-0 bg-black/45"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
          <motion.div
            className="absolute inset-x-0 bottom-0 flex h-[85dvh] flex-col overflow-hidden rounded-t-[20px] bg-white pb-[env(safe-area-inset-bottom)] dark:bg-[#111111]"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            drag="y"
            dragListener={false}
            dragControls={dragControls}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 120 || info.velocity.y > 600) onClose();
            }}
          >
            <div
              className="flex shrink-0 cursor-grab touch-none justify-center pb-2 pt-3 active:cursor-grabbing"
              onPointerDown={(event) => dragControls.start(event)}
            >
              <span aria-hidden className="h-1 w-10 rounded-full bg-black/15 dark:bg-white/20" />
            </div>
            <div className="flex min-h-0 flex-1 flex-col">{children('sheet')}</div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}
