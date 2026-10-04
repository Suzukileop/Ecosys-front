'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';

/**
 * Design tokens + shared atoms for the Service Providers directory.
 *
 * Surfaces are plain white / near-black frames with a hairline border on the shell's page ground;
 * type is sentence case at reading size, and the coral accent is kept for hover, dots and stars.
 */

/** Signature coral — hover accent, dots and stars; never a large fill. */
export const PROVIDER_ACCENT = '#FF5722';

export const PROVIDER_SURFACE_CLASS = 'bg-white dark:bg-[#111111]';
export const PROVIDER_HAIRLINE_CLASS = 'border-black/[0.06] dark:border-white/[0.08]';
export const PROVIDER_INK_CLASS = 'text-[#111111] dark:text-white';
export const PROVIDER_MUTED_CLASS = 'text-neutral-500 dark:text-neutral-400';
/** Surface + hairline + 8px radius — the one frame every panel on the page uses. */
export const PROVIDER_FRAME_CLASS = `rounded-lg border ${PROVIDER_HAIRLINE_CLASS} ${PROVIDER_SURFACE_CLASS}`;

/** Sentence-case label used by actions, toggles and status markers. */
export const PROVIDER_LABEL_CLASS = 'text-[14px] font-medium';
/** @deprecated Kept for existing imports; now resolves to {@link PROVIDER_LABEL_CLASS}. */
export const providerMicroLabelClass = PROVIDER_LABEL_CLASS;

const BUTTON_BASE =
  'inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-[15px] font-medium transition-opacity duration-200';

const ACTION_VARIANT_CLASS = {
  link: `group/act inline-flex items-center gap-1.5 text-[15px] font-medium ${PROVIDER_INK_CLASS} transition-colors duration-200 hover:text-[#FF5722] focus-visible:text-[#FF5722]`,
  primary: `${BUTTON_BASE} bg-[#111111] text-white hover:opacity-85 dark:bg-white dark:text-[#111111]`,
  secondary: `${BUTTON_BASE} border border-black/[0.12] ${PROVIDER_INK_CLASS} hover:opacity-85 dark:border-white/[0.12]`,
} as const;

export type ProviderActionVariant = keyof typeof ACTION_VARIANT_CLASS;

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
      ? 'border-[#111111] bg-[#111111] text-white dark:border-white dark:bg-white dark:text-[#111111]'
      : `border-black/[0.12] bg-transparent ${PROVIDER_INK_CLASS} hover:border-black/30 dark:border-white/[0.12] dark:hover:border-white/30`
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
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      title={title}
      className={`relative ${providerPillClass(false)} ${active ? 'border-black/30 dark:border-white/30' : ''}`}
    >
      {children}
      <span
        aria-hidden
        className={`pointer-events-none absolute inset-x-4 -bottom-[7px] h-[2px] rounded-full bg-[#FF5722] transition-[opacity,transform] duration-300 ${
          active ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0'
        }`}
      />
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
            <span aria-hidden className="px-1.5 text-black/20 dark:text-white/25">
              /
            </span>
          ) : null}
          {item}
        </span>
      ))}
    </p>
  );
}
