'use client';

import Link from 'next/link';
import { LayoutGroup, motion, useReducedMotion } from 'framer-motion';

export type HeaderSegmentOption = {
  href: string;
  label: string;
  active: boolean;
};

type HeaderSegmentToggleProps = {
  options: [HeaderSegmentOption, HeaderSegmentOption];
  ariaLabel: string;
  /** Unique layout id so Products / Service Provider pills animate independently. */
  layoutId: string;
};

export function HeaderSegmentToggle({
  options,
  ariaLabel,
  layoutId,
}: HeaderSegmentToggleProps) {
  const reduceMotion = useReducedMotion();

  return (
    <LayoutGroup id={layoutId}>
      <div
        role="tablist"
        aria-label={ariaLabel}
        className="inline-flex items-center rounded-full bg-neutral-100 p-1 dark:bg-neutral-800/80"
      >
        {options.map((option) => (
          <Link
            key={option.href}
            href={option.href}
            scroll={false}
            prefetch
            role="tab"
            aria-selected={option.active}
            className={`relative rounded-full px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide transition-colors duration-300 ease-out sm:px-4 sm:text-xs ${
              option.active
                ? 'text-neutral-900 dark:text-white'
                : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200'
            }`}
          >
            {option.active ? (
              <motion.span
                layoutId={`${layoutId}-pill`}
                className="absolute inset-0 rounded-full border border-neutral-200/80 bg-white shadow-sm dark:border-neutral-600 dark:bg-neutral-950"
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : { type: 'spring', stiffness: 380, damping: 34, mass: 0.65 }
                }
                aria-hidden
              />
            ) : null}
            <span className="relative z-10">{option.label}</span>
          </Link>
        ))}
      </div>
    </LayoutGroup>
  );
}
