'use client';

import { createContext, useContext, type CSSProperties, type MouseEvent, type ReactNode } from 'react';
import type {
  PortfolioExperienceLinkArrowStyle,
  PortfolioExperienceRepoLinkStyle,
} from '@/components/portfolio/portfolio-experience-settings';

/**
 * Link / button presentations harvested from Experience designs.
 * Every variant takes the same 5 palette tokens — none invent a color.
 */

export type PortfolioLinkButtonVariant = PortfolioExperienceRepoLinkStyle;

export type PortfolioLinkButtonPalette = {
  background: string;
  ink: string;
  muted: string;
  accent: string;
  border: string;
};

export function experienceLinkButtonPalette(tokens: {
  ink: string;
  muted: string;
  accent: string;
  background?: string;
  border?: string;
  isDark?: boolean;
}): PortfolioLinkButtonPalette {
  return {
    ink: tokens.ink,
    muted: tokens.muted,
    accent: tokens.accent,
    background: tokens.background?.trim() || (tokens.isDark ? '#0a0a0a' : '#ffffff'),
    border: tokens.border || (tokens.isDark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.12)'),
  };
}

const LINK_BUTTON_FONT = "'Inter', sans-serif";

export type PortfolioLinkButtonProps = {
  href: string;
  label: string;
  palette: PortfolioLinkButtonPalette;
  className?: string;
  /** Solid variant only — override its corner radius to match a surrounding card. */
  radiusClass?: string;
  /** Render a non-interactive visual (settings catalog). */
  preview?: boolean;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
};

const LinkArrowContext = createContext<PortfolioExperienceLinkArrowStyle>('northeast');

export function PortfolioLinkArrowProvider({
  value,
  children,
}: {
  value: PortfolioExperienceLinkArrowStyle;
  children: ReactNode;
}) {
  return <LinkArrowContext.Provider value={value}>{children}</LinkArrowContext.Provider>;
}

function LinkArrowGlyph({
  style,
  className,
}: {
  style: PortfolioExperienceLinkArrowStyle;
  className?: string;
}) {
  if (style === 'chevron') {
    return (
      <svg viewBox="0 0 16 16" className={className} fill="none" aria-hidden>
        <path
          d="M6 3.5 11 8 6 12.5"
          stroke="currentColor"
          strokeWidth={1.35}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (style === 'east') {
    return (
      <svg viewBox="0 0 16 16" className={className} fill="none" aria-hidden>
        <path
          d="M2.75 8h9.5M9 4.25 13.25 8 9 11.75"
          stroke="currentColor"
          strokeWidth={1.35}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" aria-hidden>
      <path
        d="M4.5 11.5 11.5 4.5M5.5 4.5h6v6"
        stroke="currentColor"
        strokeWidth={1.35}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LinkExitArrow({ className = 'h-[1em] w-[1em]' }: { className?: string }) {
  const style = useContext(LinkArrowContext);
  return (
    <span className={`pf-link-exit-arrow ${className}`} data-arrow={style} aria-hidden>
      <LinkArrowGlyph style={style} className="pf-link-exit-arrow-icon is-out" />
      <LinkArrowGlyph style={style} className="pf-link-exit-arrow-icon is-in" />
    </span>
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

function LinkShell({
  href,
  label,
  className,
  style,
  preview,
  onClick,
  title,
  onMouseEnter,
  onMouseLeave,
  children,
}: {
  href: string;
  label: string;
  className: string;
  style?: CSSProperties;
  preview?: boolean;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
  title?: string;
  onMouseEnter?: (event: MouseEvent<HTMLElement>) => void;
  onMouseLeave?: (event: MouseEvent<HTMLElement>) => void;
  children: ReactNode;
}) {
  if (preview) {
    return (
      <span
        aria-hidden
        className={className}
        style={style}
        data-pf-no-color-transition=""
        data-pf-link=""
      >
        {children}
      </span>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={title ?? label}
      aria-label={title ?? label}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={className}
      style={style}
      data-pf-no-color-transition=""
      data-pf-link=""
    >
      {children}
    </a>
  );
}

/** Editorial — accent outline pill + ↗ */
function LinkEditorial({ href, label, palette, className = '', preview, onClick }: PortfolioLinkButtonProps) {
  return (
    <LinkShell
      href={href}
      label={label}
      preview={preview}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-[0.82rem] font-semibold transition hover:opacity-80 ${className}`}
      style={{ borderColor: palette.accent, color: palette.accent }}
    >
      <span>{label}</span>
      <LinkExitArrow className="h-[0.95em] w-[0.95em]" />
    </LinkShell>
  );
}

/** Milestone — accent text + hover-translating arrow */
function LinkMilestone({ href, label, palette, className = '', preview, onClick }: PortfolioLinkButtonProps) {
  return (
    <LinkShell
      href={href}
      label={label}
      preview={preview}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 text-sm font-semibold transition hover:opacity-90 ${className}`}
      style={{ color: palette.accent }}
    >
      <span>{label}</span>
      <LinkExitArrow className="h-[0.95em] w-[0.95em]" />
    </LinkShell>
  );
}

/** Table — ink underline + arrow */
function LinkTable({ href, label, palette, className = '', preview, onClick }: PortfolioLinkButtonProps) {
  return (
    <LinkShell
      href={href}
      label={label}
      preview={preview}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 text-sm font-medium underline decoration-1 underline-offset-[0.28em] transition-opacity duration-200 hover:opacity-70 ${className}`}
      style={{ color: palette.ink }}
    >
      <span>{label}</span>
      <LinkExitArrow className="h-[0.95em] w-[0.95em]" />
    </LinkShell>
  );
}

/** Cards — accent label + arrow */
function LinkCards({ href, label, palette, className = '', preview, onClick }: PortfolioLinkButtonProps) {
  return (
    <LinkShell
      href={href}
      label={label}
      preview={preview}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 text-sm font-semibold transition hover:opacity-80 ${className}`}
      style={{ color: palette.accent }}
    >
      <span>{label}</span>
      <LinkExitArrow className="h-[0.95em] w-[0.95em]" />
    </LinkShell>
  );
}

/** Reel — hairline underline that grows in on hover + SVG corner arrow */
function LinkReel({ href, label, palette, className = '', preview, onClick }: PortfolioLinkButtonProps) {
  return (
    <LinkShell
      href={href}
      label={label}
      preview={preview}
      onClick={onClick}
      className={`pf-reel-repo-link relative inline-flex w-fit items-center gap-2.5 pb-1 font-semibold ${className}`}
      style={{
        color: palette.ink,
        fontSize: '1.05rem',
        fontFamily: LINK_BUTTON_FONT,
      }}
    >
      {label}
      <LinkExitArrow className="h-4 w-4" />
      <span
        aria-hidden
        data-pf-no-color-transition=""
        className="pf-reel-repo-link-rule absolute inset-x-0 bottom-0 h-px"
        style={{ backgroundColor: palette.ink }}
      />
    </LinkShell>
  );
}

/** Duotone / Gallery / Loft — icon-only GitHub circle */
function BtnIcon({ href, label, palette, className = '', preview, onClick }: PortfolioLinkButtonProps) {
  const fillBase = `color-mix(in srgb, ${palette.ink} 6%, ${palette.background})`;
  const fillHover = `color-mix(in srgb, ${palette.ink} 12%, ${palette.background})`;
  const borderHover = `color-mix(in srgb, ${palette.ink} 30%, ${palette.border})`;
  return (
    <LinkShell
      href={href}
      label={label}
      preview={preview}
      onClick={onClick}
      title={label}
      className={`inline-flex h-[2.6rem] w-[2.6rem] items-center justify-center rounded-full border transition-all duration-200 ${className}`}
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
    </LinkShell>
  );
}

/** Spotlight — inverted uppercase pill + SVG arrow */
function LinkSpotlight({ href, label, palette, className = '', preview, onClick }: PortfolioLinkButtonProps) {
  return (
    <LinkShell
      href={href}
      label={label}
      preview={preview}
      onClick={onClick}
      className={`group/link inline-flex w-fit items-center rounded-full px-7 py-3.5 text-[0.82rem] font-semibold uppercase tracking-[0.14em] transition-transform duration-300 ease-out hover:-translate-y-0.5 ${className}`}
      style={{ backgroundColor: palette.ink, color: palette.background }}
    >
      <span>{label}</span>
      <LinkExitArrow className="ml-3.5 h-3.5 w-3.5 opacity-80" />
    </LinkShell>
  );
}

/** Legacy — mono uppercase hairline + ↗ */
function LinkLegacy({ href, label, palette, className = '', preview, onClick }: PortfolioLinkButtonProps) {
  return (
    <LinkShell
      href={href}
      label={label}
      preview={preview}
      onClick={onClick}
      className={`pf-legacy-repo-link inline-flex w-fit items-center gap-2 font-mono uppercase ${className}`}
      style={{
        fontSize: '0.72rem',
        letterSpacing: '0.18em',
        ['--pf-legacy-muted' as string]: palette.muted,
        ['--pf-legacy-accent' as string]: palette.accent,
      }}
    >
      {/* A thin rule that grows from a third-width to full on hover, instead of a static
          full-width border — a quieter resting state, a more deliberate hover moment. */}
      <span className="pf-legacy-repo-link-label relative pb-1">
        {label}
        <span className="pf-legacy-repo-link-rule absolute inset-x-0 bottom-0 h-px" aria-hidden />
      </span>
      <LinkExitArrow className="h-[0.85em] w-[0.85em]" />
    </LinkShell>
  );
}

function LinkUnderline({ href, label, palette, className = '', preview, onClick }: PortfolioLinkButtonProps) {
  return (
    <LinkShell
      href={href}
      label={label}
      preview={preview}
      onClick={onClick}
      className={`inline-block underline decoration-1 underline-offset-[3px] transition-colors duration-200 ${className}`}
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
    </LinkShell>
  );
}

function BtnSolid({
  href,
  label,
  palette,
  className = '',
  radiusClass = 'rounded-[6px]',
  preview,
  onClick,
}: PortfolioLinkButtonProps) {
  return (
    <LinkShell
      href={href}
      label={label}
      preview={preview}
      onClick={onClick}
      className={`inline-flex items-center gap-[0.55rem] ${radiusClass} px-[1.2rem] py-[0.65rem] transition-opacity duration-200 hover:opacity-[0.85] ${className}`}
      style={{
        backgroundColor: palette.ink,
        color: palette.background,
        fontFamily: LINK_BUTTON_FONT,
        fontWeight: 600,
        fontSize: '0.9rem',
      }}
    >
      <span>{label}</span>
      <LinkExitArrow className="h-[0.95em] w-[0.95em]" />
    </LinkShell>
  );
}

function LinkGhost({ href, label, palette, className = '', preview, onClick }: PortfolioLinkButtonProps) {
  return (
    <LinkShell
      href={href}
      label={label}
      preview={preview}
      onClick={onClick}
      className={`group inline-flex items-center gap-[0.4rem] transition-colors duration-200 ${className}`}
      style={{ color: palette.ink, fontFamily: LINK_BUTTON_FONT, fontWeight: 600, fontSize: '0.9rem' }}
      onMouseEnter={(event) => {
        event.currentTarget.style.color = palette.accent;
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.color = palette.ink;
      }}
    >
      <span>{label}</span>
      <LinkExitArrow className="h-[0.9em] w-[0.9em]" />
    </LinkShell>
  );
}

export function PortfolioLinkButton({
  variant,
  href,
  label,
  palette,
  className,
  radiusClass,
  preview,
  onClick,
}: PortfolioLinkButtonProps & { variant: PortfolioLinkButtonVariant }) {
  const shared = { href, label, palette, className, preview, onClick };
  switch (variant) {
    case 'editorial':
      return <LinkEditorial {...shared} />;
    case 'milestone':
      return <LinkMilestone {...shared} />;
    case 'table':
      return <LinkTable {...shared} />;
    case 'cards':
      return <LinkCards {...shared} />;
    case 'reel':
      return <LinkReel {...shared} />;
    case 'icon':
    case 'duotone':
      return <BtnIcon {...shared} />;
    case 'spotlight':
      return <LinkSpotlight {...shared} />;
    case 'legacy':
      return <LinkLegacy {...shared} />;
    case 'solid':
      return <BtnSolid {...shared} radiusClass={radiusClass} />;
    case 'ghost':
      return <LinkGhost {...shared} />;
    case 'underline':
      return <LinkUnderline {...shared} />;
    case 'auto':
      return <BtnIcon {...shared} />;
  }
}
