'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';

export const PROVIDER_SURFACE_CLASS = 'bg-white dark:bg-[#111111]';
export const PROVIDER_HAIRLINE_CLASS = 'border-black/[0.06] dark:border-white/[0.08]';
/*
 * Three text tones, nothing else: ink for what is read first (names, titles, actions), body for
 * running text, muted for metadata. Muted is the lightest text on the page — it stays above WCAG AA
 * on white, so no lighter grey is ever used for words.
 */
export const PROVIDER_INK_CLASS = 'text-[#0F0F0F] dark:text-[#F1F1F1]';
export const PROVIDER_BODY_CLASS = 'text-[#3A3A3A] dark:text-[#D0D0D0]';
export const PROVIDER_MUTED_CLASS = 'text-[#606060] dark:text-[#AAAAAA]';
/** Surface + hairline + 8px radius — the one frame every panel on the page uses. */
export const PROVIDER_FRAME_CLASS = `rounded-lg border ${PROVIDER_HAIRLINE_CLASS} ${PROVIDER_SURFACE_CLASS}`;

/** Sentence-case label used by actions, toggles and status markers. */
export const PROVIDER_LABEL_CLASS = 'text-[14px] font-medium';

/* Same pill geometry as chips and switches (h-10, rounded-full, 14px medium) so buttons sit in the row
   as one family; only the fill tells them apart. */
const BUTTON_BASE = `inline-flex h-10 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full px-5 ${PROVIDER_LABEL_CLASS} transition-opacity duration-200`;

const ACTION_VARIANT_CLASS = {
  link: `group/act inline-flex items-center gap-1.5 text-[15px] font-medium ${PROVIDER_INK_CLASS} transition-colors duration-200 hover:text-[#FF5722] focus-visible:text-[#FF5722]`,
  primary: `${BUTTON_BASE} bg-[#0F0F0F] text-white hover:opacity-85 dark:bg-[#F1F1F1] dark:text-[#0F0F0F]`,
  secondary: `${BUTTON_BASE} border border-black/[0.14] ${PROVIDER_INK_CLASS} hover:opacity-85 dark:border-white/[0.14]`,
} as const;

type ProviderActionVariant = keyof typeof ACTION_VARIANT_CLASS;

type ProviderTextActionProps = {
  children: ReactNode;
  /** Optional glyph — follows the text colour, so it turns coral with the link on hover. */
  icon?: ReactNode;
  /** Arrows read as "forward" and belong after the word; status glyphs read better before it. */
  iconPlacement?: 'leading' | 'trailing';
  variant?: ProviderActionVariant;
  href?: string | null;
  onClick?: () => void;
  type?: 'button' | 'submit';
  title?: string;
  'aria-label'?: string;
  disabled?: boolean;
  className?: string;
};

/** Text link by default (15px, coral on hover); `primary` / `secondary` render the app's buttons. */
export function ProviderTextAction({
  children,
  icon,
  iconPlacement = 'trailing',
  variant = 'link',
  href,
  onClick,
  type = 'button',
  title,
  'aria-label': ariaLabel,
  disabled = false,
  className = '',
}: ProviderTextActionProps) {
  const glyph = icon ? (
    <span aria-hidden className="inline-flex shrink-0 items-center">
      {icon}
    </span>
  ) : null;

  const body = (
    <>
      {iconPlacement === 'leading' ? glyph : null}
      <span>{children}</span>
      {iconPlacement === 'trailing' ? glyph : null}
    </>
  );

  const classes = `${ACTION_VARIANT_CLASS[variant]} ${
    disabled ? 'pointer-events-none opacity-35' : ''
  } focus-visible:outline-none ${className}`;

  if (disabled || (!href && !onClick && type !== 'submit')) {
    return (
      <span className={classes} title={title} aria-label={ariaLabel} aria-disabled={disabled || undefined}>
        {body}
      </span>
    );
  }

  if (href) {
    return (
      <Link href={href} className={classes} title={title} aria-label={ariaLabel}>
        {body}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classes} title={title} aria-label={ariaLabel}>
      {body}
    </button>
  );
}

/** Rounded-full hairline pill; `active` fills it with ink. Shared by chips and toggles. */
export function providerPillClass(active: boolean) {
  return `inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border h-10 px-4 ${PROVIDER_LABEL_CLASS} transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5722]/40 ${
    active
      ? 'border-[#0F0F0F] bg-[#0F0F0F] text-white dark:border-[#F1F1F1] dark:bg-[#F1F1F1] dark:text-[#0F0F0F]'
      : `border-black/[0.14] bg-transparent ${PROVIDER_INK_CLASS} hover:border-black/30 hover:bg-black/[0.03] dark:border-white/[0.14] dark:hover:border-white/30 dark:hover:bg-white/[0.04]`
  }`;
}

function CheckGlyph() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.25} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  );
}

/** Pill toggle: hairline when off, ink fill + check when on. */
export function ProviderSwitch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={providerPillClass(checked)}
    >
      {checked ? <CheckGlyph /> : null}
      {label}
    </button>
  );
}

/** Borderless tinted suggestion chip (32px, 8px radius, 14px medium); `active` fills it with ink. */
export function providerChipClass(active: boolean) {
  return `inline-flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-3 text-[14px] font-medium leading-5 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5722]/40 ${
    active
      ? 'bg-[#0F0F0F] text-white dark:bg-[#F1F1F1] dark:text-[#0F0F0F]'
      : 'bg-black/[0.05] text-[#0F0F0F] hover:bg-black/[0.1] dark:bg-white/[0.1] dark:text-[#F1F1F1] dark:hover:bg-white/[0.2]'
  }`;
}

/** Selectable category chip. */
export function ProviderChip({
  active,
  onClick,
  children,
  title,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  title?: string;
}) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active} title={title} className={providerChipClass(active)}>
      {children}
    </button>
  );
}

/**
 * Slash-separated, purely textual list — no chips, no capsules.
 *
 * Laid out as a wrapping flex row rather than inline text: adjacent JSX spans carry no whitespace
 * between them, so an inline run has no break opportunity and a long tag list runs straight off the
 * edge of the card. Flex items wrap on their own.
 */
export function ProviderSlashList({
  items,
  className = '',
}: {
  items: string[];
  className?: string;
}) {
  if (items.length === 0) return null;
  return (
    <p className={`flex flex-wrap items-baseline ${className}`}>
      {items.map((item, index) => (
        <span key={`${item}-${index}`} className="inline-flex items-baseline whitespace-nowrap">
          {index > 0 ? (
            <span aria-hidden className="px-1.5 text-black/25 dark:text-white/30">
              /
            </span>
          ) : null}
          {item}
        </span>
      ))}
    </p>
  );
}
