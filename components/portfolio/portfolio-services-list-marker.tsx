/**
 * General → List bullet: the marker in front of each task line, shared by the Services designs
 * that render their tasks as a vertical list (Pricing Cards, Aurora, Toggle, Cascade,
 * Capabilities). `auto` is handled by each design (it keeps its own marker); every other value
 * renders through `ServicesBulletItem`, so a bullet looks the same wherever it is used.
 */
import type { CSSProperties, ReactNode } from 'react';
import type { PortfolioServicesListBullet } from '@/components/portfolio/portfolio-services-pricing-style';

type Bullet = Exclude<PortfolioServicesListBullet, 'auto'>;

function soft(color: string, percent: number): string {
  return `color-mix(in srgb, ${color} ${percent}%, transparent)`;
}

/** The marker alone, sized in `em` so it follows each design's text size. */
export function ServicesListMarker({ bullet, index, color }: { bullet: Bullet; index: number; color: string }) {
  if (bullet === 'none') return null;
  const box = 'inline-flex h-[1.5em] w-[1.25em] shrink-0 items-center justify-center';
  switch (bullet) {
    case 'check':
      return (
        <span aria-hidden className={box} style={{ color }}>
          <svg viewBox="0 0 16 16" className="h-[0.95em] w-[0.95em]" fill="none">
            <path d="M3 8.5l3 3 7-7.5" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      );
    case 'checkCircle':
      return (
        <span aria-hidden className={box} style={{ color }}>
          <span
            className="inline-flex h-[1.2em] w-[1.2em] items-center justify-center rounded-full"
            style={{ backgroundColor: soft(color, 16) }}
          >
            <svg viewBox="0 0 16 16" className="h-[0.7em] w-[0.7em]" fill="none">
              <path d="M3.5 8.5l2.8 2.8L12.5 5" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </span>
      );
    case 'dot':
      return (
        <span aria-hidden className={box} style={{ color }}>
          <span className="h-[0.32em] w-[0.32em] rounded-full" style={{ backgroundColor: 'currentColor' }} />
        </span>
      );
    case 'dash':
      return (
        <span aria-hidden className={box} style={{ color }}>
          <span className="h-px w-[0.85em]" style={{ backgroundColor: 'currentColor' }} />
        </span>
      );
    case 'arrow':
      return (
        <span aria-hidden className={box} style={{ color }}>
          →
        </span>
      );
    case 'plus':
      return (
        <span aria-hidden className={`${box} font-medium`} style={{ color }}>
          +
        </span>
      );
    case 'number':
      return (
        <span aria-hidden className={`${box} w-[1.6em] justify-start font-mono text-[0.72em] tabular-nums`} style={{ color }}>
          {String(index + 1).padStart(2, '0')}
        </span>
      );
    default:
      return null;
  }
}

/** One task line with the chosen marker in front of it. */
export function ServicesBulletItem({
  bullet,
  index,
  markerColor,
  className = '',
  style,
  textStyle,
  dataAttrs,
  children,
}: {
  bullet: Bullet;
  index: number;
  markerColor: string;
  className?: string;
  style?: CSSProperties;
  /** Applied to the text only, so a faded text does not fade its marker. */
  textStyle?: CSSProperties;
  /** data-* hooks a design animates its lines by (e.g. Cascade's data-cc-rise). */
  dataAttrs?: Record<`data-${string}`, string>;
  children: ReactNode;
}) {
  return (
    <li {...dataAttrs} className={`flex items-start ${bullet === 'none' ? '' : 'gap-[0.6em]'} ${className}`} style={style}>
      <ServicesListMarker bullet={bullet} index={index} color={markerColor} />
      <span className="min-w-0" style={textStyle}>
        {children}
      </span>
    </li>
  );
}
