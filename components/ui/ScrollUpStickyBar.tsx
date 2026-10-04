'use client';

import { useCallback, type RefObject } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp } from '@fortawesome/free-solid-svg-icons';
import { useOutOfViewSticky } from '@/hooks/useOutOfViewSticky';

/** Shows a back-to-top control once `anchorRef` (usually the in-flow toolbar) has scrolled away. */
export function useBackToTop(anchorRef: RefObject<HTMLElement | null>, enabled = true) {
  const outOfView = useOutOfViewSticky(anchorRef, 72, enabled);

  const backToTop = useCallback(() => {
    (document.activeElement as HTMLElement | null)?.blur();
    anchorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [anchorRef]);

  return { visible: enabled && outOfView, backToTop };
}

/** Floating bottom-right control: labelled pill on desktop, icon-only circle on tablet and mobile. */
export function BackToTopButton({ visible, onClick }: { visible: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Back to top"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      className={`fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom))] right-5 z-30 inline-flex h-12 w-12 items-center justify-center gap-2.5 rounded-full bg-[#111111] text-[14px] font-medium text-white shadow-[0_12px_30px_-12px_rgba(0,0,0,0.45)] transition-[opacity,transform] duration-300 ease-out dark:bg-white dark:text-[#111111] sm:right-8 lg:bottom-8 lg:h-11 lg:w-auto lg:px-5 ${
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0'
      }`}
    >
      <FontAwesomeIcon icon={faArrowUp} className="h-3.5 w-3.5" />
      <span className="hidden lg:inline">Back to top</span>
    </button>
  );
}
