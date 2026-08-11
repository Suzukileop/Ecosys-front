'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';

type LayoutOptionCardProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  selected: boolean;
  premium?: boolean;
  variant?: 'card' | 'row';
  children: ReactNode;
};

function cardClasses(selected: boolean, premium: boolean, variant: 'card' | 'row') {
  const radius = variant === 'row' ? 'rounded-lg' : 'rounded-xl';
  const base = `relative w-full ${radius} text-left transition-[border-color,background-color] duration-150 disabled:opacity-60`;

  if (selected) {
    if (premium) {
      return `${base} border border-violet-400/45 bg-neutral-50/50 dark:border-violet-400/35 dark:bg-neutral-900/50`;
    }
    return `${base} border border-orange-400/40 bg-neutral-50/50 dark:border-orange-400/30 dark:bg-neutral-900/50`;
  }

  if (premium) {
    return `${base} border border-neutral-200/80 bg-neutral-50/50 hover:border-violet-400/30 dark:border-neutral-800 dark:bg-neutral-900/50 dark:hover:border-violet-400/25`;
  }

  return `${base} border border-neutral-200/80 bg-neutral-50/50 hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900/50 dark:hover:border-neutral-700`;
}

export function LayoutRadioIndicator({
  selected,
  premium = false,
  saving = false,
  compact = false,
}: {
  selected: boolean;
  premium?: boolean;
  saving?: boolean;
  compact?: boolean;
}) {
  const size = compact ? 'h-3.5 w-3.5' : 'h-4 w-4';

  if (saving) {
    return (
      <span className={`flex ${size} shrink-0 items-center justify-center`} aria-hidden>
        <span className="h-2.5 w-2.5 animate-spin rounded-full border-2 border-orange-400/30 border-t-orange-400" />
      </span>
    );
  }

  return (
    <span
      className={`${size} shrink-0 rounded-full border-2 ${
        selected
          ? premium
            ? 'border-violet-500 bg-violet-500'
            : 'border-orange-400 bg-orange-400'
          : 'border-neutral-300 bg-transparent dark:border-neutral-600'
      }`}
      aria-hidden
    />
  );
}

export function LayoutOptionCard({
  selected,
  premium = false,
  variant = 'card',
  className = '',
  children,
  type = 'button',
  ...props
}: LayoutOptionCardProps) {
  const padding = variant === 'row' ? 'px-2.5 py-2' : 'p-2.5';

  return (
    <button
      type={type}
      className={`${cardClasses(selected, premium, variant)} ${padding} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
