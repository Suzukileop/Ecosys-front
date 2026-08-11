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

function ListMarkerHyperGlyph({
  style,
  className = '',
  strokeWidth = 1.75,
}: {
  style: PortfolioListMarkerStyle;
  className?: string;
  strokeWidth?: number;
}) {
  const cn = `shrink-0 ${className}`.trim();
  const sw = strokeWidth;
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
          <circle cx="10" cy="10" r={sw >= 2 ? 2.25 : 2} fill="white" />
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
            d="M4.5 10.5l3.6 3.6 7.4-8"
            stroke="currentColor"
            strokeWidth={Math.max(1.5, sw + 0.25)}
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
        className={`mt-2.5 shrink-0 ${className}`.trim()}
        style={{
          backgroundColor: color,
          width: Math.max(10, Math.round(px * 0.75)),
          height: listMarkerDashHeightPx(amount),
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
        style={{ color, width: px, height: px }}
        aria-hidden
      >
        <ListMarkerHyperGlyph style={style} className="h-full w-full" strokeWidth={amount} />
      </span>
    );
  }

  return null;
}
