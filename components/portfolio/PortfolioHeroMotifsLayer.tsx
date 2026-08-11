'use client';

import {
  heroMotifContentFrameStyle,
  heroMotifCurvePathD,
  heroMotifEffectiveZIndex,
  heroMotifInnerStyle,
  heroMotifPrimitiveMaskStyle,
  heroMotifShellStyle,
  isCircularMotifPrimitive,
  isLockedMotifPrimitive,
  circularMotifShellSizeStyle,
  forceSquareMotifSize,
  motifVisibilityClass,
  sanitizeHeroMotifCurveBend,
  sanitizeHeroMotifCurveAxis,
  sanitizeHeroMotifStrokeWidthPx,
  sanitizeMotifRotationDeg,
  sanitizeHeroGlowBlurPx,
  sanitizeHeroCurveGlowStrength,
  resolveHeroMotifOpacity,
  DEFAULT_HERO_CURVE_BEND,
  DEFAULT_HERO_CURVE_STROKE_PX,
  DEFAULT_HERO_CURVE_GLOW_STRENGTH,
  isHeroMotifViewportFixed,
  type HeroMotifInstance,
} from '@/components/portfolio/portfolio-hero-motifs-settings';
import type { PortfolioHeroBackgroundSettings } from '@/components/portfolio/portfolio-hero-background-settings';
import { resolveMotifClipPath } from '@/components/portfolio/portfolio-hero-settings';
import {
  motifPanelContainerStyle,
  normalizeMotifPositionForContentFrame,
} from '@/components/portfolio/portfolio-hero-motif-panel';
import {
  HeroEditorialLayerFrame,
} from '@/components/portfolio/portfolio-hero-geometric';
import {
  DEFAULT_CONTENT_GUTTER,
  portfolioHeroLayerInset,
  type PortfolioContentGutter,
} from '@/components/portfolio/portfolio-editorial-layout';
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

/** Renders hero-scoped motifs (scroll with the Hero). Fixed glow/curve are omitted. */
export function PortfolioHeroMotifsLayer({
  motifs,
  fadeOpacity = 1,
  background,
  contentGutter = DEFAULT_CONTENT_GUTTER,
  contentWidthClass = 'max-w-[90rem]',
  visualEdge = 'right',
  colorMode = 'dark',
}: {
  motifs: HeroMotifInstance[];
  fadeOpacity?: number;
  background?: PortfolioHeroBackgroundSettings;
  contentGutter?: PortfolioContentGutter;
  contentWidthClass?: string;
  /** Geometric motifs follow the visual group: right (default) or left when flipped. */
  visualEdge?: 'left' | 'right';
  colorMode?: 'light' | 'dark';
}) {
  const sectionMotifs = motifs.filter((motif) => !isHeroMotifViewportFixed(motif));
  if (!sectionMotifs.length) return null;

  // Curves span the full viewport (ignore Global side margins / content gutters).
  const curveMotifs = sectionMotifs.filter((motif) => motif.kind === 'curve');
  const framedMotifs = sectionMotifs.filter((motif) => motif.kind !== 'curve');

  return (
    <>
      {curveMotifs.length > 0 ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 left-1/2 z-0 w-screen -translate-x-1/2 overflow-visible"
        >
          {renderMotifItems(curveMotifs, fadeOpacity, background, 'section', visualEdge, colorMode)}
        </div>
      ) : null}

      {framedMotifs.length > 0 ? (
        <>
          {/* Below xl: full section (stacked hero). Soft glow needs overflow visible. */}
          <div className="pointer-events-none absolute inset-0 overflow-visible xl:hidden">
            {renderMotifItems(framedMotifs, fadeOpacity, background, 'section', visualEdge, colorMode)}
          </div>
          {/*
            xl+: content-width frame WITHOUT overflow-x-clip — the shared HeroEditorialLayerFrame
            always clips, which erased soft glow blurs. Glows need to bloom past the panel edge.
          */}
          <div
            className={`pointer-events-none absolute inset-y-0 left-1/2 hidden w-full -translate-x-1/2 overflow-visible xl:block ${contentWidthClass}`}
          >
            <div
              className={`absolute inset-y-0 z-0 overflow-visible ${portfolioHeroLayerInset(contentGutter)}`}
            >
              {renderMotifItems(framedMotifs, fadeOpacity, background, 'frame', visualEdge, colorMode)}
            </div>
          </div>
        </>
      ) : null}
    </>
  );
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

/**
 * Desaturate overlay for the primary desktop geometric motif (legacy look).
 * Only on xl+ to match the previous right-motif overlay.
 */
export function PortfolioHeroPrimaryMotifOverlay({
  motifs,
  fadeOpacity = 1,
  contentGutter = DEFAULT_CONTENT_GUTTER,
  contentWidthClass = 'max-w-[90rem]',
  visualEdge = 'right',
  colorMode = 'dark',
}: {
  motifs: HeroMotifInstance[];
  fadeOpacity?: number;
  contentGutter?: PortfolioContentGutter;
  contentWidthClass?: string;
  visualEdge?: 'left' | 'right';
  colorMode?: 'light' | 'dark';
}) {
  const primary =
    motifs.find(
      (m) => m.kind === 'geometric' && m.enabled && m.visibility.desktop
    ) ?? null;
  if (!primary) return null;

  const position = normalizeMotifPositionForContentFrame(
    primary.position,
    isCircularMotifPrimitive(primary.primitive)
      ? forceSquareMotifSize(primary.size)
      : primary.size,
    visualEdge
  );
  // Overlay follows the motif opacity slider, same as the fill layer.
  const overlayOpacity = (resolveHeroMotifOpacity(primary, colorMode) / 100) * fadeOpacity;

  // Smooth primitives: match the fill shape (ellipse / half-disk), never a polygon.
  const overlayShapeStyle = isLockedMotifPrimitive(primary.primitive)
    ? heroMotifPrimitiveMaskStyle(primary.primitive, primary.rotationDeg)
    : {
        clipPath: resolveMotifClipPath(primary.shape, primary.points, visualEdge),
      };

  const overlaySize = isCircularMotifPrimitive(primary.primitive)
    ? forceSquareMotifSize(primary.size)
    : primary.size;
  const overlayShell = isCircularMotifPrimitive(primary.primitive)
    ? {
        left: `${position.x}%`,
        top: `${position.y}%`,
        ...circularMotifShellSizeStyle(overlaySize),
        transform: 'translate(-50%, -50%)',
        ...(overlayOpacity >= 1 ? {} : { opacity: overlayOpacity, willChange: 'opacity' as const }),
      }
    : {
        ...motifPanelContainerStyle(position, overlaySize, overlayOpacity, '%'),
      };

  return (
    <HeroEditorialLayerFrame
      gutter={contentGutter}
      contentWidthClass={contentWidthClass}
      className="z-20 overflow-hidden"
    >
      <div
        className="pointer-events-none absolute overflow-hidden"
        style={overlayShell}
      >
        <div
          className="portfolio-hero-geom-overlay absolute inset-0"
          style={overlayShapeStyle}
        />
      </div>
    </HeroEditorialLayerFrame>
  );
}
