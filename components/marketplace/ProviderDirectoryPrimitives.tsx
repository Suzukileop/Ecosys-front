'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';

/*
 * Providers directory tokens — the News design in the X palette (black & white, no accent hue).
 * The page ground (#FFF / #000) belongs to DashboardShell (`isNewsGroundPath`); blocks sit one tone
 * above it (#F7F9F9 / #16181C), square, flat, with no hairline: tone and spacing separate things.
 * `gn-card` lets the `.news-mono` scope square the block (and keep it square on the search page).
 */
export const PROVIDER_SURFACE_CLASS = 'bg-[#F7F9F9] dark:bg-[#16181C]';
/** Kept for callers that still draw an edge; it is transparent now (no lines between blocks). */
export const PROVIDER_HAIRLINE_CLASS = 'border-transparent';
/*
 * Three text tones, nothing else: ink for what is read first (names, titles, actions), secondary for
 * running text and metadata (#536471 / #71767B), tertiary for decoration.
 */
export const PROVIDER_INK_CLASS = 'text-[#0F1419] dark:text-[#E7E9EA]';
export const PROVIDER_BODY_CLASS = 'text-[#536471] dark:text-[#71767B]';
export const PROVIDER_MUTED_CLASS = 'text-[#536471] dark:text-[#71767B]';
/** Surface block: square, flat (no border, no shadow) — the one frame every panel on the page uses. */
export const PROVIDER_FRAME_CLASS = `gn-card rounded-none border-0 shadow-none ${PROVIDER_SURFACE_CLASS}`;

/** Sentence-case label used by actions, toggles and status markers. */
export const PROVIDER_LABEL_CLASS = 'text-[14px] font-semibold';

/** The ink primary button (X): black on light, off-white on dark — Search, Discuss and other primary actions. */
export const PROVIDER_ACCENT_BUTTON_CLASS =
  'bg-[#0F1419] text-white hover:bg-[#272C30] dark:bg-[#EFF3F4] dark:text-[#0F1419] dark:hover:bg-[#D7DBDC] focus-visible:ring-2 focus-visible:ring-[#0F1419]/35 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-[#E7E9EA]/45 dark:focus-visible:ring-offset-black';

/** Secondary button (X): 1px outline, ink text. */
export const PROVIDER_SECONDARY_BUTTON_CLASS =
  'border border-[#CFD9DE] bg-transparent text-[#0F1419] hover:bg-[rgba(15,20,25,0.06)] dark:border-[#536471] dark:text-[#E7E9EA] dark:hover:bg-[rgba(231,233,234,0.1)]';

/* One button geometry (h-10, square, 14px semibold) — page-level buttons are square like the News
   "Publish a post" button; only the fill tells primary and secondary apart. */
const BUTTON_BASE = `inline-flex h-10 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-none px-4 ${PROVIDER_LABEL_CLASS} transition-colors duration-200`;

const ACTION_VARIANT_CLASS = {
  link: `group/act inline-flex items-center gap-1.5 text-[15px] font-medium ${PROVIDER_INK_CLASS} underline-offset-4 transition-colors duration-200 hover:underline focus-visible:underline`,
  /** Quiet text link — secondary destinations that should not compete with the primary button. */
  ghost: `group/act inline-flex h-10 items-center gap-1.5 rounded-full px-3 ${PROVIDER_LABEL_CLASS} ${PROVIDER_MUTED_CLASS} transition-colors duration-200 hover:bg-[rgba(15,20,25,0.06)] hover:text-[#0F1419] dark:hover:bg-[rgba(231,233,234,0.1)] dark:hover:text-[#E7E9EA]`,
  primary: `${BUTTON_BASE} ${PROVIDER_ACCENT_BUTTON_CLASS}`,
  secondary: `${BUTTON_BASE} ${PROVIDER_SECONDARY_BUTTON_CLASS}`,
} as const;

type ProviderActionVariant = keyof typeof ACTION_VARIANT_CLASS;

type ProviderTextActionProps = {
  children: ReactNode;
  /** Optional glyph — follows the text colour. */
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

/** Text link by default (15px, underlined on hover); `primary` / `secondary` render the app's buttons. */
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
  } focus-visible:outline-hidden ${className}`;

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

/** Rounded-full filter pill: outline when off, ink fill when on. Shared by chips and toggles. */
/** Toggle pill (Verified only, Available only): the chips' soft geometry — filled tone at rest, ink when on. */
export function providerPillClass(active: boolean) {
  return `inline-flex h-9 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-4 text-[14px] font-medium transition-colors duration-200 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#0F1419]/35 dark:focus-visible:ring-[#E7E9EA]/45 ${
    active
      ? 'bg-[#0F1419] text-white hover:bg-[#272C30] dark:bg-[#EFF3F4] dark:text-[#0F1419] dark:hover:bg-[#D7DBDC]'
      : 'bg-[#EFF3F4] text-[#0F1419] hover:bg-[#E1E8ED] dark:bg-[#202327] dark:text-[#E7E9EA] dark:hover:bg-[#2A2D32]'
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

/**
 * Category chip (36px, rounded-full, 14px). Idle is a soft field tone on the page (#EFF3F4 / #202327),
 * no outline; active is the ink fill with inverted text, like the selected row of the News rail.
 */
export function providerChipClass(active: boolean) {
  return `inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-4 text-[14px] leading-5 transition-colors duration-150 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#0F1419]/35 dark:focus-visible:ring-[#E7E9EA]/45 ${
    active
      ? 'bg-[#0F1419] font-semibold text-white hover:bg-[#272C30] dark:bg-[#EFF3F4] dark:text-[#0F1419] dark:hover:bg-[#D7DBDC]'
      : 'bg-[#EFF3F4] font-medium text-[#0F1419] hover:bg-[#E1E8ED] dark:bg-[#202327] dark:text-[#E7E9EA] dark:hover:bg-[#2A2D32]'
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
            <span aria-hidden className="px-1.5 text-[#8B98A5] dark:text-[#536471]">
              /
            </span>
          ) : null}
          {item}
        </span>
      ))}
    </p>
  );
}
