'use client';

import { useId } from 'react';
import type { PortfolioHeroPalette } from './portfolio-hero-palette-settings';

/** Read the actual canvas, including custom palettes, rather than the editor's mode. */
function isLightCanvas(color: string): boolean {
  const hex = color.replace('#', '');
  const full = hex.length === 3 ? hex.replace(/./g, c => c + c) : hex;
  if (!/^[\da-f]{6}$/i.test(full)) return false;
  const channels = [0, 2, 4].map(offset => {
    const value = parseInt(full.slice(offset, offset + 2), 16) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722 > 0.179;
}

/** Static procedural art: the resolved palette supplies every color in either mode. */
export function PortfolioHeroAdaptiveBackground({ art, palette, opacity = 100, thumbnail = false }: {
  art: 'mesh' | 'particles' | 'particle-ribbon' | 'layered-waves' | 'arc' | 'silk-arc' | 'eclipse-arc'; palette: PortfolioHeroPalette; opacity?: number; thumbnail?: boolean;
}) {
  const id = useId().replace(/:/g, '');
  const { fond, principal, secondaire, texteFort } = palette;
  const mix = (color: string, amount: number) => `color-mix(in srgb, ${color} ${amount}%, ${fond})`;
  const lightArc = isLightCanvas(fond);
  // On a light canvas the text token is dark: using it as a highlight creates a black seam.
  const arcHighlight = lightArc ? mix(principal, 28) : texteFort;
  const arcOpacities = lightArc ? [0.045, 0.12, 0.38, 0.7] : [0.12, 0.28, 0.75, 1];
  const particleThumbnail = thumbnail && (art === 'particles' || art === 'particle-ribbon');
  return <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden" style={{ backgroundColor: fond }}>
    <div className="absolute inset-0" style={{ opacity: Math.max(0, Math.min(100, opacity)) / 100 }}>
      {art === 'mesh' ? <div className="absolute inset-0" style={{ backgroundImage: [
        `radial-gradient(ellipse 45% 40% at 74% 84%, ${mix(principal, 72)}, transparent 100%)`,
        `radial-gradient(ellipse 42% 35% at 100% 48%, ${mix(principal, 54)}, transparent 100%)`,
        `radial-gradient(ellipse 55% 44% at 64% 6%, ${mix(secondaire, 45)}, transparent 100%)`,
        `radial-gradient(ellipse 38% 32% at 0% 100%, ${mix(principal, 48)}, transparent 100%)`,
        `radial-gradient(ellipse 70% 64% at 27% 33%, ${mix(texteFort, 9)}, transparent 100%)`,
      ].join(', ') }} /> : null}
      {particleThumbnail ? <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
        {/* Explicit dots survive downsampling; subpixel dashed strokes do not. */}
        {Array.from({ length: 14 }, (_, row) => Array.from({ length: 46 }, (_, column) => {
          const t = column / 45;
          const x = 160 + t * 1320;
          const ribbon = art === 'particle-ribbon';
          const y = ribbon
            ? 710 - Math.sin(t * Math.PI * 1.35 - 0.6) * 230 + row * (5 + t * 7)
            : 690 - Math.sin(t * Math.PI * 1.8 - 1.6) * 145 + row * 11;
          return <g key={`${row}-${column}`}>
            <circle cx={x.toFixed(2)} cy={y.toFixed(2)} r="6" fill={row % 4 === 0 ? principal : texteFort} opacity={0.22 + t * 0.38} />
            {!ribbon ? <circle cx={x.toFixed(2)} cy={(140 - Math.sin(t * Math.PI * 1.3) * 130 + row * 8).toFixed(2)} r="5" fill={texteFort} opacity={0.15 + t * 0.3} /> : null}
          </g>;
        }))}
      </svg> : null}
      {art === 'particles' && !thumbnail ? <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id={`${id}-fade`}><stop offset="15%" stopColor="white" stopOpacity="0" /><stop offset="60%" stopColor="white" stopOpacity="0.65" /><stop offset="100%" stopColor="white" /></linearGradient>
          <mask id={`${id}-mask`}><rect width="1440" height="900" fill={`url(#${id}-fade)`} /></mask>
        </defs>
        <g mask={`url(#${id}-mask)`}>
          {Array.from({ length: 46 }, (_, row) => thumbnail && row % 3 !== 0 ? null : <g key={row} fill="none" stroke={row % 5 === 0 ? principal : texteFort} strokeOpacity={thumbnail ? 0.65 : row % 5 === 0 ? 0.48 : 0.34} strokeWidth={thumbnail ? 5 : 1.6} strokeLinecap="round" strokeDasharray={thumbnail ? '0.1 24' : '0.1 7'}>
            <path d={`M 400 ${780 + row * 4} C 850 ${860 - row * 3}, 1030 ${410 + row * 3}, 1230 ${560 + row * 2} S 1430 ${740 - row * 3}, 1530 ${500 + row * 4}`} />
            <path d={`M 650 ${-130 + row * 3} C 950 ${10 + row * 2}, 1120 ${-10 + row * 3}, 1280 ${150 + row * 2} S 1450 ${230 - row * 3}, 1530 ${20 + row * 2}`} />
          </g>)}
        </g>
      </svg> : null}
      {art === 'layered-waves' ? <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" opacity="0.7">
        <defs>
          <linearGradient id={`${id}-tide`} x1="0" y1="0" x2="1" y2="0">
            <stop stopColor={principal} stopOpacity="0.04" />
            <stop offset="0.55" stopColor={principal} stopOpacity={lightArc ? 0.36 : 0.5} />
            <stop offset="1" stopColor={secondaire} stopOpacity={lightArc ? 0.5 : 0.65} />
          </linearGradient>
          <linearGradient id={`${id}-tide-fill`} x1="0" y1="0" x2="0" y2="1">
            <stop stopColor={principal} stopOpacity={lightArc ? 0.08 : 0.12} />
            <stop offset="1" stopColor={principal} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 1, 2].map(layer => {
          const crest = 540 + layer * 90;
          const wave = `M -80 ${700 + layer * 55} C 230 ${490 + layer * 95}, 460 ${940 - layer * 25}, 790 ${crest} S 1210 ${800 - layer * 100}, 1520 ${520 + layer * 75}`;
          return <g key={layer}>
            <path d={`${wave} L 1520 980 L -80 980 Z`} fill={`url(#${id}-tide-fill)`} />
            {Array.from({ length: 18 }, (_, row) => <path key={row} d={wave}
              transform={`translate(0 ${row * 5})`} fill="none" stroke={`url(#${id}-tide)`}
              strokeWidth={row === 0 ? 1.5 : 1} strokeOpacity={1 - row / 22}
              strokeDasharray={row % 3 === 0 ? undefined : '0.1 8'} strokeLinecap="round" />)}
          </g>;
        })}
      </svg> : null}
      {art === 'particle-ribbon' && !thumbnail ? <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id={`${id}-ribbon-fade`} x1="0" y1="0" x2="1" y2="0">
            <stop stopColor={fond} stopOpacity="0" />
            <stop offset="0.36" stopColor={principal} stopOpacity="0.12" />
            <stop offset="0.7" stopColor={principal} stopOpacity={lightArc ? 0.5 : 0.65} />
            <stop offset="1" stopColor={secondaire} stopOpacity={lightArc ? 0.4 : 0.6} />
          </linearGradient>
        </defs>
        {/* A folded ribbon stays below the copy, opening into a crest on the right. */}
        {Array.from({ length: 54 }, (_, row) => {
          if (thumbnail && row % 3 !== 0) return null;
          const fold = Math.sin(row / 53 * Math.PI);
          // Transcendental results can differ by one ULP across JS engines during hydration.
          const crestY = (655 - fold * 100).toFixed(3);
          return <path key={row}
            d={`M -80 ${690 + row * 3.2} C 300 ${860 + row * 1.5}, 580 ${870 - row * 4}, 810 ${crestY} S 1100 ${230 + row * 7}, 1520 ${340 + row * 6}`}
            fill="none" stroke={`url(#${id}-ribbon-fade)`} strokeWidth={thumbnail ? 6 : row % 6 === 0 ? 2 : 1.4}
            strokeLinecap="round" strokeDasharray={thumbnail ? '0.1 26' : '0.1 9'} strokeDashoffset={row % 2 ? (thumbnail ? 13 : 4.5) : 0} />;
        })}
      </svg> : null}
      {art === 'eclipse-arc' ? <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id={`${id}-eclipse-edge`} x1="0" y1="1" x2="1" y2="0">
            <stop stopColor={principal} stopOpacity="0" />
            <stop offset="0.4" stopColor={principal} stopOpacity="0.15" />
            <stop offset="0.7" stopColor={lightArc ? mix(principal, 65) : mix(texteFort, 80)} stopOpacity="0.8" />
            <stop offset="1" stopColor={secondaire} stopOpacity="0" />
          </linearGradient>
          <radialGradient id={`${id}-eclipse-halo`}>
            <stop offset="0.78" stopColor={principal} stopOpacity="0" />
            <stop offset="0.89" stopColor={principal} stopOpacity={lightArc ? 0.08 : 0.16} />
            <stop offset="1" stopColor={secondaire} stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* A single off-centre eclipse, rather than another sweeping ribbon. */}
        <circle cx="1280" cy="640" r="580" fill={`url(#${id}-eclipse-halo)`} />
        <circle cx="1280" cy="640" r="520" fill="none" stroke={`url(#${id}-eclipse-edge)`} strokeWidth="10" opacity={lightArc ? 0.08 : 0.15} />
        <circle cx="1280" cy="640" r="520" fill="none" stroke={`url(#${id}-eclipse-edge)`} strokeWidth="1.2" />
      </svg> : null}
      {art === 'silk-arc' ? <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id={`${id}-silk`} x1="0" y1="1" x2="1" y2="0">
            <stop stopColor={principal} stopOpacity="0" />
            <stop offset="0.35" stopColor={principal} stopOpacity="0.2" />
            <stop offset="0.7" stopColor={lightArc ? mix(principal, 65) : mix(texteFort, 75)} stopOpacity="0.85" />
            <stop offset="1" stopColor={secondaire} stopOpacity="0" />
          </linearGradient>
          <filter id={`${id}-silk-blur`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="12" /></filter>
        </defs>
        {/* One open crescent hugs the right edge, leaving the copy area quiet. */}
        <path d="M 470 970 C 1370 970, 1570 300, 1150 -160" fill="none" stroke={`url(#${id}-silk)`} strokeWidth="34" opacity={lightArc ? 0.13 : 0.25} filter={`url(#${id}-silk-blur)`} />
        <path d="M 470 970 C 1370 970, 1570 300, 1150 -160" fill="none" stroke={`url(#${id}-silk)`} strokeWidth="6" opacity={lightArc ? 0.16 : 0.25} />
        <path d="M 470 970 C 1370 970, 1570 300, 1150 -160" fill="none" stroke={`url(#${id}-silk)`} strokeWidth="1.4" opacity={lightArc ? 0.7 : 0.9} />
      </svg> : null}
      {art === 'arc' ? <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id={`${id}-arc`} x1="0" y1="1" x2="1" y2="0"><stop stopColor={principal} stopOpacity="0" /><stop offset="0.45" stopColor={principal} stopOpacity={lightArc ? 0.4 : 0.65} /><stop offset="0.74" stopColor={arcHighlight} /><stop offset="1" stopColor={lightArc ? mix(secondaire, 55) : secondaire} /></linearGradient>
          <filter id={`${id}-glow`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="15" /></filter>
          <radialGradient id={`${id}-halo`}><stop stopColor={secondaire} stopOpacity={lightArc ? 0.12 : 0.32} /><stop offset="1" stopColor={secondaire} stopOpacity="0" /></radialGradient>
        </defs>
        <ellipse cx="1200" cy="580" rx="300" ry="220" fill={`url(#${id}-halo)`} />
        <path d="M 320 810 C 920 900, 1350 640, 1440 -40" fill="none" stroke={principal} strokeWidth={lightArc ? 32 : 48} opacity={lightArc ? 0.14 : 0.35} filter={`url(#${id}-glow)`} />
        {[24, 9, 3, 1.2].map((width, index) => <path key={width} d="M 320 810 C 920 900, 1350 640, 1440 -40" fill="none" stroke={`url(#${id}-arc)`} strokeWidth={width} opacity={arcOpacities[index]} />)}
        {[0, 1, 2, 3, 4, 5].map(index => <path key={index} d={`M ${460 + index * 16} 855 C 1000 ${820 - index * 14}, 1140 ${570 - index * 8}, 1490 ${650 + index * 28}`} fill="none" stroke={`url(#${id}-arc)`} strokeWidth={index === 0 ? 2 : 0.8} opacity={(0.4 - index * 0.05) * (lightArc ? 0.5 : 1)} />)}
      </svg> : null}
    </div>
  </div>;
}
