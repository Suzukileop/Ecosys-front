'use client';

/**
 * Reusable link / button presentations for the public portfolio.
 * Every variant takes the same 5 palette tokens (already resolved by the
 * caller from the site's own theme) — none of them invent a color.
 */

export type PortfolioLinkButtonVariant = 'underline' | 'icon' | 'solid' | 'ghost';

export type PortfolioLinkButtonPalette = {
  /** Page / section background. */
  background: string;
  /** Primary text color. */
  ink: string;
  /** Secondary text color. */
  muted: string;
  /** Accent color. */
  accent: string;
  /** Discreet border / hairline color. */
  border: string;
};

export const PORTFOLIO_LINK_BUTTON_VARIANT_OPTIONS: {
  value: PortfolioLinkButtonVariant;
  label: string;
  description: string;
}[] = [
  {
    value: 'underline',
    label: 'Underline',
    description: 'Plain text with a thin underline — turns accent on hover. The quietest option.',
  },
  {
    value: 'icon',
    label: 'Icon',
    description: 'Round icon-only button with a GitHub mark — compact and iconic.',
  },
  {
    value: 'solid',
    label: 'Solid',
    description: 'Filled button, ink background — the strongest option for a single key action.',
  },
  {
    value: 'ghost',
    label: 'Ghost',
    description: 'Text + arrow, no fill — the arrow slides on hover.',
  },
];

const LINK_BUTTON_FONT = "'Inter', sans-serif";

export type PortfolioLinkButtonProps = {
  href: string;
  label: string;
  palette: PortfolioLinkButtonPalette;
  className?: string;
  /** Solid variant only — override its corner radius to match a surrounding card. Defaults to rounded-[6px]. */
  radiusClass?: string;
};

function ExternalArrowIcon({
  className,
  'data-pf-no-color-transition': noColorTransition,
}: {
  className?: string;
  'data-pf-no-color-transition'?: string;
}) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      className={className}
      aria-hidden="true"
      data-pf-no-color-transition={noColorTransition}
    >
      <path
        d="M4 12L12 4M12 4H6M12 4V10"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GithubMarkIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className={className} aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"
      />
    </svg>
  );
}

/** Variant 1 — plain text, a thin underline always visible, accent on hover. */
export function LinkUnderline({ href, label, palette, className = '' }: PortfolioLinkButtonProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`link-underline inline-block underline decoration-1 underline-offset-[3px] transition-colors duration-200 ${className}`}
      style={{
        color: palette.ink,
        textDecorationColor: palette.muted,
        fontFamily: LINK_BUTTON_FONT,
        fontWeight: 600,
        fontSize: '0.9rem',
      }}
      onMouseEnter={(event) => {
        event.currentTarget.style.textDecorationColor = palette.accent;
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.textDecorationColor = palette.muted;
      }}
    >
      {label}
    </a>
  );
}

/** Variant 2 — icon-only circle (GitHub mark), no visible label. */
export function BtnIcon({ href, label, palette, className = '' }: PortfolioLinkButtonProps) {
  const fillBase = `color-mix(in srgb, ${palette.ink} 6%, ${palette.background})`;
  const fillHover = `color-mix(in srgb, ${palette.ink} 12%, ${palette.background})`;
  const borderHover = `color-mix(in srgb, ${palette.ink} 30%, ${palette.border})`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={label}
      aria-label={label}
      className={`btn-icon inline-flex h-[2.6rem] w-[2.6rem] items-center justify-center rounded-full border transition-all duration-200 ${className}`}
      style={{ backgroundColor: fillBase, borderColor: palette.border, color: palette.ink }}
      onMouseEnter={(event) => {
        event.currentTarget.style.backgroundColor = fillHover;
        event.currentTarget.style.borderColor = borderHover;
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.backgroundColor = fillBase;
        event.currentTarget.style.borderColor = palette.border;
      }}
    >
      <GithubMarkIcon className="h-[1.1rem] w-[1.1rem]" />
    </a>
  );
}

/** Variant 3 — filled button, ink background / page-background text. Strongest of the four. */
export function BtnSolid({
  href,
  label,
  palette,
  className = '',
  radiusClass = 'rounded-[6px]',
}: PortfolioLinkButtonProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`btn-solid inline-flex items-center gap-[0.55rem] ${radiusClass} px-[1.2rem] py-[0.65rem] transition-opacity duration-200 hover:opacity-[0.85] ${className}`}
      data-pf-no-color-transition=""
      style={{
        backgroundColor: palette.ink,
        color: palette.background,
        fontFamily: LINK_BUTTON_FONT,
        fontWeight: 600,
        fontSize: '0.9rem',
      }}
    >
      <span>{label}</span>
      <ExternalArrowIcon className="h-[0.95em] w-[0.95em] shrink-0" />
    </a>
  );
}

/** Variant 4 — ghost link, text + arrow that slides on hover. */
export function LinkGhost({ href, label, palette, className = '' }: PortfolioLinkButtonProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`link-ghost group inline-flex items-center gap-[0.4rem] transition-colors duration-200 ${className}`}
      style={{ color: palette.ink, fontFamily: LINK_BUTTON_FONT, fontWeight: 600, fontSize: '0.9rem' }}
      onMouseEnter={(event) => {
        event.currentTarget.style.color = palette.accent;
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.color = palette.ink;
      }}
    >
      <span>{label}</span>
      <ExternalArrowIcon
        className="h-[0.9em] w-[0.9em] shrink-0 transition-transform duration-[250ms] ease-out group-hover:translate-x-1"
        data-pf-no-color-transition=""
      />
    </a>
  );
}

/** Renders whichever of the 4 variants is selected — the usual entry point. */
export function PortfolioLinkButton({
  variant,
  href,
  label,
  palette,
  className,
  radiusClass,
}: PortfolioLinkButtonProps & { variant: PortfolioLinkButtonVariant }) {
  switch (variant) {
    case 'icon':
      return <BtnIcon href={href} label={label} palette={palette} className={className} />;
    case 'solid':
      return (
        <BtnSolid href={href} label={label} palette={palette} className={className} radiusClass={radiusClass} />
      );
    case 'ghost':
      return <LinkGhost href={href} label={label} palette={palette} className={className} />;
    default:
      return <LinkUnderline href={href} label={label} palette={palette} className={className} />;
  }
}
