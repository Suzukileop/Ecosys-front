import type { PortfolioPresenceKind } from '@/components/portfolio/portfolio-presence';

/**
 * The resting mark on each presence panel — drawn, not from an icon font.
 *
 * Font Awesome's glyphs are filled shapes at a fixed optical weight: blown up to 100px in the
 * middle of a panel they read as administrative furniture, which is the opposite of what a panel
 * whose whole job is to feel like a choice needs. These are Feather/Lucide-style constructions
 * instead: one viewBox, one stroke weight, round joins, no fills anywhere.
 *
 * `vector-effect: non-scaling-stroke` is what makes the stroke width mean device pixels rather
 * than user units. Without it a 1.75-unit stroke in a 24-unit box rendered at 104px would come out
 * near eight pixels thick — heavier than the glyphs it replaced — and it would change weight every
 * time the panel resized. Opted out of scaling, 1.75 is 1.75px at every size.
 *
 * 1.75 rather than 1: a true single pixel measured correctly but read as *faint* at 104px, closer
 * to disabled than to delicate. This is the same correction the bar's icons needed.
 */

const SVG_PROPS = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  vectorEffect: 'non-scaling-stroke',
} as const;

/** Portfolio — stacked layers: a body of work, seen edge on. */
function LayersMark() {
  return (
    <svg {...SVG_PROPS} className="h-full w-full" aria-hidden>
      <path vectorEffect="non-scaling-stroke" d="M12 2.75 2.75 7.5 12 12.25 21.25 7.5 12 2.75Z" />
      <path vectorEffect="non-scaling-stroke" d="M2.75 12 12 16.75 21.25 12" />
      <path vectorEffect="non-scaling-stroke" d="M2.75 16.5 12 21.25 21.25 16.5" />
    </svg>
  );
}

/** Storefront — a shopping bag reduced to four lines and a handle. */
function BagMark() {
  return (
    <svg {...SVG_PROPS} className="h-full w-full" aria-hidden>
      <path
        vectorEffect="non-scaling-stroke"
        d="M4.25 7.75h15.5l-1.15 13.5H5.4L4.25 7.75Z"
      />
      <path vectorEffect="non-scaling-stroke" d="M8.75 10V6.5a3.25 3.25 0 0 1 6.5 0V10" />
    </svg>
  );
}

/** Business presence — a wireframe sphere: reach, drawn rather than illustrated. */
function GlobeMark() {
  return (
    <svg {...SVG_PROPS} className="h-full w-full" aria-hidden>
      <circle vectorEffect="non-scaling-stroke" cx="12" cy="12" r="9.25" />
      <ellipse vectorEffect="non-scaling-stroke" cx="12" cy="12" rx="4" ry="9.25" />
      <path vectorEffect="non-scaling-stroke" d="M2.75 12h18.5" />
      <path vectorEffect="non-scaling-stroke" d="M4.6 6.75h14.8M4.6 17.25h14.8" />
    </svg>
  );
}

const MARKS: Record<PortfolioPresenceKind, () => React.JSX.Element> = {
  portfolio: LayersMark,
  storefront: BagMark,
  business: GlobeMark,
};

export function PortfolioPresenceIcon({
  kind,
  className = '',
}: {
  kind: PortfolioPresenceKind;
  className?: string;
}) {
  const Mark = MARKS[kind];
  return (
    <span className={`pointer-events-none block ${className}`} aria-hidden>
      <Mark />
    </span>
  );
}
