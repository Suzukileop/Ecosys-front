'use client';

import { useId } from 'react';

type InfoHintProps = {
  children: React.ReactNode;
  /** Horizontal anchor of the bubble relative to the icon. */
  align?: 'center' | 'start' | 'end';
  /** Opens the bubble below the icon, for hints near the top edge of a scroll container. */
  side?: 'top' | 'bottom';
  className?: string;
};

const BUBBLE_ALIGN = {
  center: 'left-1/2 -translate-x-1/2',
  start: 'left-0',
  end: 'right-0',
} as const;

/** Small "!" badge that reveals help text on hover or keyboard focus, keeping forms free of hint paragraphs. */
export function InfoHint({ children, align = 'center', side = 'top', className = '' }: InfoHintProps) {
  const tooltipId = useId();
  return (
    <span className={`group/info relative inline-flex align-middle ${className}`}>
      <button
        type="button"
        aria-label="More information"
        aria-describedby={tooltipId}
        onClick={(e) => e.preventDefault()}
        className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-neutral-300 text-[10px] font-bold leading-none text-neutral-400 transition-colors hover:border-[#111111] hover:text-[#111111] focus-visible:border-[#111111] focus-visible:text-[#111111] focus-visible:outline-none dark:border-neutral-600 dark:text-neutral-500 dark:hover:border-white dark:hover:text-white dark:focus-visible:border-white dark:focus-visible:text-white"
      >
        !
      </button>
      <span
        id={tooltipId}
        role="tooltip"
        className={`pointer-events-none absolute z-40 w-max max-w-[16rem] rounded-lg ${
          side === 'bottom' ? 'top-full mt-2 -translate-y-1' : 'bottom-full mb-2 translate-y-1'
        } bg-[#111111] px-3 py-2 text-left text-[12.5px] font-normal leading-relaxed text-white opacity-0 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.45)] transition-[opacity,transform] duration-150 group-focus-within/info:translate-y-0 group-focus-within/info:opacity-100 group-hover/info:translate-y-0 group-hover/info:opacity-100 dark:bg-white dark:text-[#111111] ${BUBBLE_ALIGN[align]}`}
      >
        {children}
      </span>
    </span>
  );
}
