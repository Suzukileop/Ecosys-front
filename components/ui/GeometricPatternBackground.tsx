'use client';

type Props = {
  className?: string;
};

function ConcentricDiamonds({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <g className="geo-bg-orbit">
        <g className="geo-bg-orbit-inner">
          {[92, 72, 52, 32].map((size, i) => (
            <rect
              key={size}
              x={100 - size / 2}
              y={100 - size / 2}
              width={size}
              height={size}
              rx="2"
              transform={`rotate(45 100 100)`}
              stroke="#F97316"
              strokeOpacity={0.2 - i * 0.035}
              strokeWidth={i === 0 ? 2 : 1.5}
              className={i % 2 === 0 ? 'geo-bg-dash' : undefined}
            />
          ))}
        </g>
      </g>
      <circle cx="100" cy="100" r="4" fill="#F97316" fillOpacity="0.4" className="geo-bg-pulse" />
      <circle cx="100" cy="100" r="10" stroke="#F97316" strokeOpacity="0.12" fill="none" className="geo-bg-dash geo-delay-2" />
    </svg>
  );
}

function RadialComposition({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={`${className} geo-bg-orbit`} fill="none" xmlns="http://www.w3.org/2000/svg">
      <g className="geo-bg-orbit-reverse geo-delay-3">
        <circle cx="100" cy="100" r="88" stroke="#F97316" strokeOpacity="0.16" strokeWidth="1.5" />
        {[0, 45, 90, 135].map((deg) => (
          <line
            key={deg}
            x1="100"
            y1="100"
            x2={100 + 88 * Math.cos((deg * Math.PI) / 180)}
            y2={100 + 88 * Math.sin((deg * Math.PI) / 180)}
            stroke="#F97316"
            strokeOpacity="0.1"
            strokeWidth="1"
          />
        ))}
      </g>
      <g className="geo-bg-orbit-inner">
        <circle cx="100" cy="100" r="62" stroke="#737373" strokeOpacity="0.14" strokeWidth="1" className="dark:stroke-neutral-500" />
        <circle cx="100" cy="100" r="36" stroke="#F97316" strokeOpacity="0.22" strokeWidth="1.5" className="geo-bg-dash" />
      </g>
      <circle cx="100" cy="100" r="5" fill="#F97316" fillOpacity="0.35" className="geo-bg-pulse geo-delay-1" />
    </svg>
  );
}

function BrandWordmarkPattern() {
  const textStyle = {
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif',
    fontSize: '15px',
    fontWeight: 600,
    letterSpacing: '0.14em',
  } as const;

  return (
    <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="geo-wordmark-light" width="300" height="168" patternUnits="userSpaceOnUse" patternTransform="rotate(-14)">
          <text x="24" y="52" style={textStyle} fill="#F97316" fillOpacity="0.1">
            No Problem
          </text>
          <text x="174" y="132" style={textStyle} fill="#737373" fillOpacity="0.07">
            No Problem
          </text>
        </pattern>
        <pattern id="geo-wordmark-dark" width="300" height="168" patternUnits="userSpaceOnUse" patternTransform="rotate(-14)">
          <text x="24" y="52" style={textStyle} fill="#FB923C" fillOpacity="0.09">
            No Problem
          </text>
          <text x="174" y="132" style={textStyle} fill="#A3A3A3" fillOpacity="0.08">
            No Problem
          </text>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#geo-wordmark-light)" className="dark:hidden" />
      <rect width="100%" height="100%" fill="url(#geo-wordmark-dark)" className="hidden dark:block" />
    </svg>
  );
}

/** Fond géométrique animé — remplit les marges latérales sur grands écrans. */
export function GeometricPatternBackground({ className = '' }: Props) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none fixed bottom-0 right-0 top-0 z-0 overflow-hidden bg-neutral-50 transition-[left] duration-300 ease-in-out dark:bg-neutral-950 left-[var(--dash-sidebar-w,4.5rem)] ${className}`}
    >
      {/* Couche motifs — dérive lente */}
      <div className="geo-bg-pattern-drift absolute -inset-12 opacity-90 dark:opacity-80">
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="geo-dots" width="28" height="28" patternUnits="userSpaceOnUse">
              <circle cx="4" cy="4" r="1.25" fill="#F97316" fillOpacity="0.16" />
              <circle cx="18" cy="18" r="0.75" fill="#737373" fillOpacity="0.1" />
            </pattern>
            <pattern id="geo-lines" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)">
              <line x1="0" y1="0" x2="0" y2="20" stroke="#737373" strokeOpacity="0.1" strokeWidth="1" />
            </pattern>
            <pattern id="geo-cross" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M0 20 H40 M20 0 V40" stroke="#F97316" strokeOpacity="0.06" strokeWidth="0.75" />
            </pattern>
            <pattern id="geo-dots-dark" width="28" height="28" patternUnits="userSpaceOnUse">
              <circle cx="4" cy="4" r="1.25" fill="#FB923C" fillOpacity="0.14" />
              <circle cx="18" cy="18" r="0.75" fill="#525252" fillOpacity="0.25" />
            </pattern>
            <pattern id="geo-lines-dark" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)">
              <line x1="0" y1="0" x2="0" y2="20" stroke="#525252" strokeOpacity="0.3" strokeWidth="1" />
            </pattern>
            <pattern id="geo-cross-dark" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M0 20 H40 M20 0 V40" stroke="#FB923C" strokeOpacity="0.08" strokeWidth="0.75" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#geo-dots)" className="dark:hidden" />
          <rect width="100%" height="100%" fill="url(#geo-lines)" opacity="0.7" className="dark:hidden" />
          <rect width="100%" height="100%" fill="url(#geo-cross)" className="dark:hidden" />
          <rect width="100%" height="100%" fill="url(#geo-dots-dark)" className="hidden dark:block" />
          <rect width="100%" height="100%" fill="url(#geo-lines-dark)" opacity="0.55" className="hidden dark:block" />
          <rect width="100%" height="100%" fill="url(#geo-cross-dark)" className="hidden dark:block" />
        </svg>
      </div>

      <div className="geo-bg-pattern-drift-reverse geo-delay-4 absolute -inset-12 opacity-45 dark:opacity-38">
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="geo-diagonal" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="16" stroke="#F97316" strokeOpacity="0.07" strokeWidth="1" />
            </pattern>
            <pattern id="geo-diagonal-dark" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="16" stroke="#FB923C" strokeOpacity="0.06" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#geo-diagonal)" className="dark:hidden" />
          <rect width="100%" height="100%" fill="url(#geo-diagonal-dark)" className="hidden dark:block" />
        </svg>
      </div>

      {/* Motif wordmark « No Problem » */}
      <div className="geo-bg-wordmark-drift geo-delay-3 absolute -inset-16 opacity-90 dark:opacity-80">
        <BrandWordmarkPattern />
      </div>

      {/* Orbes lumineux — dérive organique */}
      <div className="geo-bg-orb geo-delay-1 absolute -left-24 top-[8%] h-72 w-72 rounded-full bg-[#F97316]/[0.08] blur-3xl dark:bg-[#F97316]/12" />
      <div className="geo-bg-orb geo-delay-3 absolute -right-32 bottom-[10%] h-80 w-80 rounded-full bg-[#F97316]/[0.06] blur-3xl dark:bg-[#F97316]/10" />
      <div className="geo-bg-orb geo-delay-5 absolute left-[18%] bottom-[5%] h-44 w-44 rounded-full bg-neutral-400/[0.07] blur-2xl dark:bg-neutral-500/12" />

      {/* Composition gauche */}
      <div className="geo-bg-float-slow geo-delay-2 absolute -left-20 top-[10%] h-64 w-64">
        <ConcentricDiamonds className="h-full w-full opacity-85" />
      </div>
      <div className="geo-bg-wobble geo-delay-1 absolute left-[2%] top-[42%]">
        <div className="h-14 w-14 rotate-45 border-2 border-[#F97316]/28 dark:border-[#F97316]/32" />
      </div>
      <div className="geo-bg-orbit-reverse geo-delay-4 absolute -left-10 top-[28%] h-36 w-36 rounded-full border border-dashed border-[#F97316]/22 dark:border-[#F97316]/28" />
      <div className="geo-bg-float geo-delay-2 absolute left-[6%] bottom-[20%] flex gap-3">
        {(['geo-delay-1', 'geo-delay-2', 'geo-delay-3'] as const).map((delayClass) => (
          <span
            key={delayClass}
            className={`geo-bg-dot block h-2 w-2 rotate-45 bg-[#F97316]/32 dark:bg-[#F97316]/38 ${delayClass}`}
          />
        ))}
      </div>
      <div className="geo-bg-float-alt geo-delay-3 absolute left-[10%] top-[62%] h-24 w-24 rounded-full border border-[#F97316]/18 dark:border-[#F97316]/22" />

      {/* Composition droite */}
      <div className="geo-bg-float-slow geo-delay-5 absolute -right-24 top-[14%] h-72 w-72">
        <RadialComposition className="h-full w-full" />
      </div>
      <div className="geo-bg-float geo-delay-2 absolute right-[4%] top-[36%] h-20 w-20 rotate-12 border-2 border-neutral-400/32 dark:border-neutral-500/42" />
      <div className="geo-bg-orbit geo-delay-6 absolute -right-6 bottom-[26%] h-44 w-44 rotate-45 border border-neutral-300/38 dark:border-neutral-600/48" />
      <div className="geo-bg-float-alt geo-delay-1 absolute right-[8%] bottom-[14%] flex flex-col gap-2">
        <span className="geo-bg-bar geo-delay-1 h-1.5 w-10 rounded-full bg-[#F97316]/28 dark:bg-[#F97316]/32" />
        <span className="geo-bg-bar geo-delay-3 h-1.5 w-6 rounded-full bg-[#F97316]/22 dark:bg-[#F97316]/26" />
        <span className="geo-bg-bar geo-delay-5 h-1.5 w-14 rounded-full bg-neutral-400/22 dark:bg-neutral-500/28" />
      </div>

      {/* Petits accents dispersés */}
      <div className="geo-bg-dot geo-delay-2 absolute left-[22%] top-[18%] h-3 w-3 rounded-full bg-[#F97316]/38 dark:bg-[#F97316]/42" />
      <div className="geo-bg-dot geo-delay-4 absolute right-[22%] top-[52%] h-2.5 w-2.5 rotate-45 bg-neutral-400/32 dark:bg-neutral-500/38" />
      <div className="geo-bg-float geo-delay-6 absolute right-[16%] top-[22%] h-4 w-4 rounded-sm border border-[#F97316]/32 dark:border-[#F97316]/36" />

      {/* Vignette centrale — contenu lisible */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/25 via-white/88 to-white/25 dark:from-neutral-950/15 dark:via-neutral-950/82 dark:to-neutral-950/15" />
      <div className="absolute inset-0 bg-gradient-to-b from-white/35 via-transparent to-white/45 dark:from-neutral-950/25 dark:to-neutral-950/35" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_45%,rgba(255,255,255,0.92),transparent)] dark:bg-[radial-gradient(ellipse_70%_55%_at_50%_45%,rgba(10,10,10,0.88),transparent)]" />
    </div>
  );
}
