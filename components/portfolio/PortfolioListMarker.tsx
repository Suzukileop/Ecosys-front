'use client';

import {
  formatListMarkerIndexLabel,
  isListMarkerHyperGlyph,
  listMarkerDashHeightPx,
  listMarkerFontWeightFromAmount,
  resolveListMarkerSizePx,
  resolveListMarkerWeightAmount,
  type PortfolioListMarkerSize,
  type PortfolioListMarkerStyle,
  type PortfolioListMarkerWeight,
} from '@/components/portfolio/portfolio-list-marker';

/** Contrast ink for glyphs drawn on top of a filled marker (check-circle-fill, bar-dot). */
function listMarkerGlyphContrast(fillColor: string): string {
  const raw = fillColor.trim();
  if (!raw || raw === 'currentColor') {
    return 'var(--pf-list-marker-glyph, #ffffff)';
  }
  const hex = raw.startsWith('#') ? raw.slice(1) : raw;
  const full =
    hex.length === 3
      ? hex
          .split('')
          .map((c) => c + c)
          .join('')
      : hex;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) {
    return 'var(--pf-list-marker-glyph, #ffffff)';
  }
  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance < 0.55 ? '#ffffff' : '#111111';
}

function ListMarkerHyperGlyph({
  style,
  className = '',
  strokeWidth = 1.75,
  fillColor = 'currentColor',
}: {
  style: PortfolioListMarkerStyle;
  className?: string;
  strokeWidth?: number;
  /** Marker fill / currentColor — drives contrast for white-on-fill glyphs. */
  fillColor?: string;
}) {
  const cn = `shrink-0 ${className}`.trim();
  const sw = strokeWidth;
  const glyph = listMarkerGlyphContrast(fillColor);
  switch (style) {
    case 'disc':
      return (
        <svg className={cn} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
          <circle cx="10" cy="10" r={sw >= 2.4 ? 6 : sw >= 2 ? 5.75 : 5.5} />
        </svg>
      );
    case 'bar-dot':
      return (
        <svg className={cn} viewBox="0 0 20 20" fill="none" aria-hidden>
          <rect
            x={sw >= 2.4 ? 5.5 : 6.5}
            y="2.5"
            width={sw >= 2.4 ? 9 : 7}
            height="15"
            rx="1.5"
            fill="currentColor"
          />
          <circle cx="10" cy="10" r={sw >= 2 ? 2.25 : 2} fill={glyph} />
        </svg>
      );
    case 'bullseye':
      return (
        <svg className={cn} viewBox="0 0 20 20" fill="none" aria-hidden>
          <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth={sw} />
          <circle cx="10" cy="10" r="3.6" stroke="currentColor" strokeWidth={Math.max(1, sw - 0.2)} />
          <circle cx="10" cy="10" r={sw >= 2.4 ? 1.7 : 1.4} fill="currentColor" />
        </svg>
      );
    case 'square':
      return (
        <svg className={cn} viewBox="0 0 20 20" fill="none" aria-hidden>
          <rect x="4" y="4" width="12" height="12" rx="1.5" stroke="currentColor" strokeWidth={sw} />
        </svg>
      );
    case 'check-square':
      return (
        <svg className={cn} viewBox="0 0 20 20" fill="none" aria-hidden>
          <rect x="4" y="4" width="12" height="12" rx="1.5" stroke="currentColor" strokeWidth={sw} />
          <path
            d="M7 10.2l2.1 2.1 3.9-4.2"
            stroke="currentColor"
            strokeWidth={sw}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'check-circle':
      return (
        <svg className={cn} viewBox="0 0 20 20" fill="none" aria-hidden>
          <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth={sw} />
          <path
            d="M6.75 10.25l2.1 2.1 4.4-4.6"
            stroke="currentColor"
            strokeWidth={sw}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'check-circle-fill':
      return (
        <svg className={cn} viewBox="0 0 20 20" fill="none" aria-hidden>
          <circle cx="10" cy="10" r="8" fill="currentColor" />
          <path
            d="M6.4 10.2l2.2 2.2 4.8-5"
            stroke={glyph}
            strokeWidth={Math.max(1.6, sw + 0.15)}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'x-square':
      return (
        <svg className={cn} viewBox="0 0 20 20" fill="none" aria-hidden>
          <rect x="4" y="4" width="12" height="12" rx="1.5" stroke="currentColor" strokeWidth={sw} />
          <path
            d="M7.5 7.5l5 5M12.5 7.5l-5 5"
            stroke="currentColor"
            strokeWidth={sw}
            strokeLinecap="round"
          />
        </svg>
      );
    case 'check':
      return (
        <svg className={cn} viewBox="0 0 20 20" fill="none" aria-hidden>
          <path
            d="M3.25 10.35l4.15 4.15 9.35-9.7"
            stroke="currentColor"
            strokeWidth={Math.max(1.85, sw + 0.45)}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'arrow':
      return (
        <svg className={cn} viewBox="0 0 20 20" fill="none" aria-hidden>
          <path
            d="M3.5 10h12M11.5 5.5L16.5 10l-5 4.5"
            stroke="currentColor"
            strokeWidth={sw}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'chevron':
      return (
        <svg className={cn} viewBox="0 0 20 20" fill="none" aria-hidden>
          <path
            d="M7.5 4.5L13 10l-5.5 5.5"
            stroke="currentColor"
            strokeWidth={sw}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'chevron-double':
      return (
        <svg className={cn} viewBox="0 0 20 20" fill="none" aria-hidden>
          <path
            d="M5.5 4.5L11 10l-5.5 5.5M10 4.5L15.5 10 10 15.5"
            stroke="currentColor"
            strokeWidth={sw}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'triangle':
      return (
        <svg className={cn} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
          <path d="M7 4.25v11.5L16.25 10 7 4.25z" />
        </svg>
      );
    default:
      return null;
  }
}

/** Compact task-list bullet (Experience / Services / Global / FAQ). */
export function PortfolioListMarker({
  style,
  color,
  index = 0,
  size = 'md',
  sizePx,
  weight = 'regular',
  weightAmount,
  className = '',
}: {
  style: PortfolioListMarkerStyle;
  color: string;
  index?: number;
  size?: PortfolioListMarkerSize;
  sizePx?: number;
  weight?: PortfolioListMarkerWeight;
  weightAmount?: number;
  className?: string;
}) {
  if (style === 'none') return null;

  const px = resolveListMarkerSizePx(size, sizePx);
  const amount = resolveListMarkerWeightAmount(weight, weightAmount);
  const glyphContrast = listMarkerGlyphContrast(color);

  const label = formatListMarkerIndexLabel(index, style);
  if (label) {
    return (
      <span
        className={`mt-0.5 shrink-0 tabular-nums leading-none tracking-wide ${className}`.trim()}
        style={{
          color,
          fontSize: px,
          fontWeight: listMarkerFontWeightFromAmount(amount),
        }}
      >
        {label}
      </span>
    );
  }

  if (style === 'dash') {
    return (
      <span
        className={`mt-2.5 inline-block shrink-0 rounded-sm ${className}`.trim()}
        style={{
          backgroundColor: color,
          width: Math.max(12, Math.round(px * 0.85)),
          height: Math.max(2, listMarkerDashHeightPx(amount)),
        }}
        aria-hidden
      />
    );
  }

  if (style === 'dot') {
    const core = Math.max(3, Math.round(px * (0.28 + amount * 0.06)));
    return (
      <span
        className={`relative mt-1.5 flex shrink-0 items-center justify-center ${className}`.trim()}
        style={{ width: px, height: px }}
        aria-hidden
      >
        <span
          className="absolute inset-0 rounded-full"
          style={{ backgroundColor: `color-mix(in srgb, ${color} 18%, transparent)` }}
        />
        <span className="rounded-full" style={{ backgroundColor: color, width: core, height: core }} />
      </span>
    );
  }

  if (isListMarkerHyperGlyph(style)) {
    return (
      <span
        className={`mt-0.5 inline-flex shrink-0 items-center justify-center ${className}`.trim()}
        style={{
          color,
          width: px,
          height: px,
          ['--pf-list-marker-glyph' as string]: glyphContrast,
        }}
        aria-hidden
      >
        <ListMarkerHyperGlyph
          style={style}
          className="h-full w-full"
          strokeWidth={amount}
          fillColor={color}
        />
      </span>
    );
  }

  return null;
}
