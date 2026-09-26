import type { PortfolioPresenceKind } from '@/components/portfolio/portfolio-presence';

/**
 * The immersive backdrop each presence column reveals on hover.
 *
 * Drawn rather than photographed, and deliberately so: a stock interior or a generic device shot
 * would say nothing about what the option actually builds, and would ship a megabyte per column to
 * say it. These are wireframes of the page each kind produces — a portfolio's hero and project
 * grid, a storefront's product shelf, a business landing's feature row — so the picture *is* the
 * explanation. Being vector, they stay sharp at any panel width and cost nothing to load.
 *
 * Everything paints in `currentColor`, so a single text colour on the panel drives the whole
 * drawing and it inverts correctly between themes.
 */

const FRAME = { viewBox: '0 0 400 300', preserveAspectRatio: 'xMidYMid slice' } as const;

function Portfolio() {
  return (
    <svg {...FRAME} className="h-full w-full" fill="none" aria-hidden>
      {/* masthead */}
      <rect x="28" y="26" width="46" height="6" rx="3" fill="currentColor" opacity="0.5" />
      <rect x="300" y="26" width="30" height="6" rx="3" fill="currentColor" opacity="0.2" />
      <rect x="340" y="26" width="32" height="6" rx="3" fill="currentColor" opacity="0.2" />

      {/* monumental headline */}
      <rect x="28" y="56" width="250" height="17" rx="4" fill="currentColor" opacity="0.32" />
      <rect x="28" y="80" width="170" height="17" rx="4" fill="currentColor" opacity="0.18" />

      {/* hero plate with a diagonal weave, which is what reads as "image" at a glance */}
      <rect x="28" y="114" width="344" height="94" rx="8" fill="currentColor" opacity="0.07" />
      <rect x="28" y="114" width="344" height="94" rx="8" stroke="currentColor" strokeOpacity="0.16" />
      <g opacity="0.14" stroke="currentColor" strokeWidth="1">
        {Array.from({ length: 14 }, (_, i) => (
          <line key={i} x1={28 + i * 28} y1="208" x2={28 + i * 28 + 94} y2="114" />
        ))}
      </g>

      {/* project grid */}
      {[28, 145, 262].map((x) => (
        <g key={x}>
          <rect x={x} y="226" width="110" height="46" rx="6" fill="currentColor" opacity="0.09" />
          <rect x={x} y="226" width="110" height="46" rx="6" stroke="currentColor" strokeOpacity="0.14" />
          <rect x={x + 12} y="243" width="54" height="5" rx="2.5" fill="currentColor" opacity="0.3" />
          <rect x={x + 12} y="254" width="32" height="4" rx="2" fill="currentColor" opacity="0.16" />
        </g>
      ))}
    </svg>
  );
}

function Storefront() {
  return (
    <svg {...FRAME} className="h-full w-full" fill="none" aria-hidden>
      <rect x="28" y="26" width="46" height="6" rx="3" fill="currentColor" opacity="0.5" />
      <circle cx="356" cy="29" r="9" stroke="currentColor" strokeOpacity="0.28" />
      <path d="M352 29h8M354 25.5h4" stroke="currentColor" strokeOpacity="0.4" strokeLinecap="round" />

      {/* filter rail */}
      {[28, 76, 130, 178].map((x, i) => (
        <rect
          key={x}
          x={x}
          y="54"
          width={i === 0 ? 40 : 46}
          height="14"
          rx="7"
          fill="currentColor"
          opacity={i === 0 ? 0.26 : 0.09}
        />
      ))}

      {/* product shelf — two rows of three */}
      {[0, 1].map((row) =>
        [28, 155, 282].map((x) => (
          <g key={`${row}-${x}`}>
            <rect
              x={x}
              y={90 + row * 108}
              width="90"
              height="94"
              rx="8"
              fill="currentColor"
              opacity="0.07"
            />
            <rect
              x={x}
              y={90 + row * 108}
              width="90"
              height="94"
              rx="8"
              stroke="currentColor"
              strokeOpacity="0.15"
            />
            <rect
              x={x + 10}
              y={100 + row * 108}
              width="70"
              height="48"
              rx="5"
              fill="currentColor"
              opacity="0.12"
            />
            <rect x={x + 10} y={158 + row * 108} width="46" height="5" rx="2.5" fill="currentColor" opacity="0.3" />
            <rect x={x + 10} y={169 + row * 108} width="26" height="5" rx="2.5" fill="currentColor" opacity="0.45" />
          </g>
        ))
      )}
    </svg>
  );
}

function Business() {
  return (
    <svg {...FRAME} className="h-full w-full" fill="none" aria-hidden>
      <rect x="28" y="26" width="52" height="7" rx="3.5" fill="currentColor" opacity="0.5" />
      {[268, 310].map((x) => (
        <rect key={x} x={x} y="27" width="30" height="5" rx="2.5" fill="currentColor" opacity="0.2" />
      ))}
      <rect x="348" y="21" width="24" height="17" rx="8.5" fill="currentColor" opacity="0.3" />

      {/* stated hero: headline, sub, one action */}
      <rect x="28" y="66" width="214" height="15" rx="4" fill="currentColor" opacity="0.32" />
      <rect x="28" y="88" width="148" height="15" rx="4" fill="currentColor" opacity="0.18" />
      <rect x="28" y="118" width="104" height="8" rx="4" fill="currentColor" opacity="0.12" />
      <rect x="28" y="142" width="74" height="22" rx="11" fill="currentColor" opacity="0.28" />

      {/* proposition columns */}
      {[28, 155, 282].map((x) => (
        <g key={x}>
          <rect x={x} y="190" width="90" height="1" fill="currentColor" opacity="0.2" />
          <rect x={x} y="202" width="22" height="22" rx="6" stroke="currentColor" strokeOpacity="0.22" />
          <rect x={x} y="234" width="62" height="5" rx="2.5" fill="currentColor" opacity="0.28" />
          <rect x={x} y="245" width="82" height="4" rx="2" fill="currentColor" opacity="0.13" />
          <rect x={x} y="254" width="70" height="4" rx="2" fill="currentColor" opacity="0.13" />
        </g>
      ))}

      {/* the team row, which is what separates this kind from the other two */}
      {[28, 52, 76, 100].map((x, i) => (
        <circle key={x} cx={x + 10} cy="282" r="10" fill="currentColor" opacity={0.22 - i * 0.035} />
      ))}
    </svg>
  );
}

const MOCKUPS: Record<PortfolioPresenceKind, () => React.JSX.Element> = {
  portfolio: Portfolio,
  storefront: Storefront,
  business: Business,
};

export function PortfolioPresenceMockup({
  kind,
  className = '',
}: {
  kind: PortfolioPresenceKind;
  className?: string;
}) {
  const Drawing = MOCKUPS[kind];
  return (
    <span className={`pointer-events-none block ${className}`} aria-hidden>
      <Drawing />
    </span>
  );
}
