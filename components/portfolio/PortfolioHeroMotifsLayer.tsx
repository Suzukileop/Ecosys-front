'use client';

import { heroMotifContentFrameStyle, heroMotifCurvePathD, heroMotifEffectiveZIndex, heroMotifInnerStyle, heroMotifShellStyle, isLockedMotifPrimitive, motifVisibilityClass, sanitizeHeroMotifCurveBend, sanitizeHeroMotifCurveAxis, sanitizeHeroMotifStrokeWidthPx, sanitizeMotifRotationDeg, sanitizeHeroGlowBlurPx, sanitizeHeroCurveGlowStrength, DEFAULT_HERO_CURVE_BEND, DEFAULT_HERO_CURVE_STROKE_PX, DEFAULT_HERO_CURVE_GLOW_STRENGTH, isHeroMotifViewportFixed, type HeroMotifInstance } from '@/components/portfolio/portfolio-hero-motifs-settings';
import type { PortfolioHeroBackgroundSettings } from '@/components/portfolio/portfolio-hero-background-settings';
import { normalizeMotifPositionForContentFrame } from '@/components/portfolio/portfolio-hero-motif-panel';
import { isValidProfileHexColor } from '@/components/portfolio/portfolio-hero-profile-settings';

function HeroMotifCurveStroke({ motif }: { motif: HeroMotifInstance }) {
  const axis = sanitizeHeroMotifCurveAxis(motif.curveAxis, 'diagonal');
  const bend = sanitizeHeroMotifCurveBend(motif.curveBend, DEFAULT_HERO_CURVE_BEND);
  const stroke = sanitizeHeroMotifStrokeWidthPx(
    motif.strokeWidthPx,
    DEFAULT_HERO_CURVE_STROKE_PX
  );
  const rotation = sanitizeMotifRotationDeg(motif.rotationDeg, 0);
  const glowBlur = sanitizeHeroGlowBlurPx(motif.blurPx, 0);
  const glowStrength = sanitizeHeroCurveGlowStrength(
    motif.strokeGlowStrength,
    DEFAULT_HERO_CURVE_GLOW_STRENGTH
  );
  const hex = isValidProfileHexColor(motif.color) ? motif.color.trim() : '#E5E5E5';
  const d = heroMotifCurvePathD(axis, bend);
  const showGlow = glowBlur > 0 && glowStrength > 0;
  // Stepped wider strokes (no CSS/SVG filter). Filters on near-horizontal paths
  // use a ~0-height bbox and clip/shift the halo — often upward vs the crisp stroke.
  const glowLayers = showGlow
    ? [
        {
          width: stroke + glowBlur * 0.55,
          opacity: (glowStrength / 100) * 0.2,
        },
        {
          width: stroke + glowBlur * 0.32,
          opacity: (glowStrength / 100) * 0.32,
        },
        {
          width: stroke + glowBlur * 0.16,
          opacity: (glowStrength / 100) * 0.48,
        },
      ]
    : [];

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="absolute inset-0 h-full w-full overflow-visible"
      aria-hidden
    >
      <g transform={rotation ? `rotate(${rotation} 50 50)` : undefined}>
        {glowLayers.map((layer, index) => (
          <path
            key={`curve-glow-${index}`}
            d={d}
            fill="none"
            stroke={hex}
            strokeWidth={layer.width}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeOpacity={Math.min(1, layer.opacity)}
            vectorEffect="non-scaling-stroke"
          />
        ))}
        <path
          d={d}
          fill="none"
          stroke={hex}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </g>
    </svg>
  );
}

function HeroMotifItem({
  motif,
  fadeOpacity,
  background,
  layout = 'section',
  visualEdge = 'right',
  colorMode = 'dark',
}: {
  motif: HeroMotifInstance;
  fadeOpacity: number;
  background?: PortfolioHeroBackgroundSettings;
  /** `frame` = desktop content-width box; `section` = full hero (mobile). */
  layout?: 'section' | 'frame';
  /** Which content-frame edge the geometric (visual-group) motif hugs. */
  visualEdge?: 'left' | 'right';
  colorMode?: 'light' | 'dark';
}) {
  if (!motif.enabled) return null;
  // Glow "On" must paint on desktop even after in-flow switches cleared visibility
  // flags (or left only Mobile on). Ambient tint is otherwise invisible in preview.
  const visibility =
    motif.kind === 'glow'
      ? {
          mobile: motif.visibility.mobile,
          desktop: true,
        }
      : motif.visibility;
  if (!visibility.mobile && !visibility.desktop) return null;

  // Pattern follows the copy column (opposite of the visual/portrait edge).
  // Glow / geometric hug the visual edge.
  const frameEdge: 'left' | 'right' =
    motif.kind === 'pattern'
      ? visualEdge === 'right'
        ? 'left'
        : 'right'
      : visualEdge;

  const shellStyle =
    layout === 'frame' &&
    !isLockedMotifPrimitive(motif.primitive) &&
    motif.kind !== 'glow' &&
    motif.kind !== 'curve'
      ? heroMotifContentFrameStyle(
          {
            ...motif,
            position: normalizeMotifPositionForContentFrame(
              motif.position,
              motif.size,
              frameEdge
            ),
          },
          fadeOpacity,
          frameEdge,
          colorMode
        )
      : // Circles / ovals / half-circles / glow / curves: free left%/top%.
        heroMotifShellStyle(motif, fadeOpacity, colorMode);

  const isGlow = motif.kind === 'glow';
  const isCurve = motif.kind === 'curve';
  const zIndex = heroMotifEffectiveZIndex(motif);

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 ${
        isGlow || isCurve ? 'overflow-visible' : 'overflow-hidden'
      } ${motifVisibilityClass(visibility)}`}
      style={{ zIndex }}
    >
      <div
        className={`pointer-events-none absolute ${
          isGlow || isCurve ? 'overflow-visible' : 'overflow-hidden'
        }`}
        style={shellStyle}
      >
        {isCurve ? (
          <HeroMotifCurveStroke motif={motif} />
        ) : (
          <div
            className="absolute inset-0"
            style={heroMotifInnerStyle(motif, background, frameEdge)}
          />
        )}
      </div>
    </div>
  );
}

function renderMotifItems(
  motifs: HeroMotifInstance[],
  fadeOpacity: number,
  background: PortfolioHeroBackgroundSettings | undefined,
  layout: 'section' | 'frame',
  visualEdge: 'left' | 'right',
  colorMode: 'light' | 'dark'
) {
  return motifs.map((motif) => (
    <HeroMotifItem
      key={motif.id}
      motif={motif}
      fadeOpacity={fadeOpacity}
      background={background}
      layout={layout}
      visualEdge={visualEdge}
      colorMode={colorMode}
    />
  ));
}

/**
 * Glow / curve motifs pinned to the viewport — stay visible while scrolling the site.
 * Placement % is relative to the screen (full-bleed), not the Hero section.
 */
export function PortfolioFixedMotifsLayer({
  motifs,
  background,
  visualEdge = 'right',
  colorMode = 'dark',
}: {
  motifs: HeroMotifInstance[];
  background?: PortfolioHeroBackgroundSettings;
  visualEdge?: 'left' | 'right';
  colorMode?: 'light' | 'dark';
}) {
  const fixedMotifs = motifs.filter(
    (motif) =>
      isHeroMotifViewportFixed(motif) &&
      motif.enabled &&
      (motif.visibility.mobile || motif.visibility.desktop || motif.kind === 'glow')
  );
  if (!fixedMotifs.length) return null;

  const curveMotifs = fixedMotifs.filter((motif) => motif.kind === 'curve');
  const glowMotifs = fixedMotifs.filter((motif) => motif.kind === 'glow');

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-visible" data-portfolio-fixed-motifs="">
      {curveMotifs.length > 0
        ? renderMotifItems(curveMotifs, 1, background, 'section', visualEdge, colorMode)
        : null}
      {glowMotifs.length > 0
        ? renderMotifItems(glowMotifs, 1, background, 'section', visualEdge, colorMode)
        : null}
    </div>
  );
}
