import type { CSSProperties, ReactNode } from 'react';
import type { PortfolioHeroMotifLayout, PortfolioHeroMotifShape } from '@/components/portfolio/portfolio-hero-settings';
import {
  DEFAULT_HERO_MOTIF_COLOR,
  resolveMotifClipPath,
} from '@/components/portfolio/portfolio-hero-settings';
import {
  heroMotifPanelFillStyle,
  DEFAULT_HERO_BACKGROUND_SETTINGS,
  type PortfolioHeroBackgroundSettings,
} from '@/components/portfolio/portfolio-hero-background-settings';
import {
  motifPanelContainerStyle,
  type MotifPanelPosition,
  type MotifPanelSize,
} from '@/components/portfolio/portfolio-hero-motif-panel';
import type { MotifPoint } from '@/components/portfolio/portfolio-hero-motif-geometry';
import {
  DEFAULT_CONTENT_GUTTER,
  portfolioHeroLayerInset,
  type PortfolioContentGutter,
} from '@/components/portfolio/portfolio-editorial-layout';

const DEFAULT_HERO_CONTENT_WIDTH_CLASS = 'max-w-none';

/**
 * Outer shell: same max-width + centering as the hero copy / Global content width.
 * Inner shell: side-margin insets so % children match the padded content box
 * (right motif flush = start of the right side margin).
 */
export function HeroEditorialLayerFrame({
  gutter = DEFAULT_CONTENT_GUTTER,
  contentWidthClass = DEFAULT_HERO_CONTENT_WIDTH_CLASS,
  className,
  style,
  children,
}: {
  gutter?: PortfolioContentGutter;
  contentWidthClass?: string;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}) {
  return (
    <div
      className={`pointer-events-none absolute inset-y-0 left-1/2 hidden w-full -translate-x-1/2 overflow-x-clip xl:block ${contentWidthClass}`}
    >
      <div
        className={`absolute inset-y-0 overflow-x-clip ${portfolioHeroLayerInset(gutter)} ${className ?? ''}`}
        style={style}
      >
        {children}
      </div>
    </div>
  );
}

/** @deprecated Prefer HeroEditorialLayerFrame — string form ignores content width. */
export function heroContentLayerFrame(
  gutter: PortfolioContentGutter = DEFAULT_CONTENT_GUTTER,
  contentWidthClass = DEFAULT_HERO_CONTENT_WIDTH_CLASS
): string {
  return `pointer-events-none absolute inset-y-0 left-0 right-0 mx-auto hidden w-full xl:block ${contentWidthClass} ${portfolioHeroLayerInset(gutter)}`;
}

/** @deprecated Prefer HeroEditorialLayerFrame */
export const HERO_CONTENT_LAYER_FRAME = heroContentLayerFrame(DEFAULT_CONTENT_GUTTER);

export const HERO_GEOM_LAYER_SHELL = `${HERO_CONTENT_LAYER_FRAME} overflow-hidden`;

/** Portrait layer — overflow visible so free placement is not clipped at panel edges. */
export function heroPortraitLayerShell(
  gutter: PortfolioContentGutter = DEFAULT_CONTENT_GUTTER,
  contentWidthClass = DEFAULT_HERO_CONTENT_WIDTH_CLASS
): string {
  return `${heroContentLayerFrame(gutter, contentWidthClass)} overflow-visible`;
}

/** @deprecated Prefer HeroEditorialLayerFrame */
export const HERO_PORTRAIT_LAYER_SHELL = heroPortraitLayerShell(DEFAULT_CONTENT_GUTTER);

export { heroGeomLayerPositionStyle } from '@/components/portfolio/portfolio-hero-settings';

type GeomFadeProps = {
  fadeOpacity?: number;
  motifShape?: PortfolioHeroMotifShape;
  motifLayout?: PortfolioHeroMotifLayout;
  motifColor?: string;
  customMotifPoints?: MotifPoint[];
  motifPosition?: MotifPanelPosition;
  motifPanelSize?: MotifPanelSize;
  background?: PortfolioHeroBackgroundSettings;
  contentGutter?: PortfolioContentGutter;
  contentWidthClass?: string;
};

function motifPanelShellStyle(
  fadeOpacity = 1,
  position: MotifPanelPosition,
  size: MotifPanelSize
): CSSProperties {
  return motifPanelContainerStyle(position, size, fadeOpacity, '%');
}

function motifPanelStyle(
  shape: PortfolioHeroMotifShape,
  color: string,
  customMotifPoints: MotifPoint[],
  background: PortfolioHeroBackgroundSettings = DEFAULT_HERO_BACKGROUND_SETTINGS
): CSSProperties {
  return {
    clipPath: resolveMotifClipPath(shape, customMotifPoints),
    ...heroMotifPanelFillStyle(background, color),
  };
}

function motifClipStyle(shape: PortfolioHeroMotifShape, customMotifPoints: MotifPoint[]): CSSProperties {
  return { clipPath: resolveMotifClipPath(shape, customMotifPoints) };
}

/** Solid geometric shape behind hero content. */
export function PortfolioHeroGeometricBackground({
  fadeOpacity = 1,
  motifShape = 'diagonal',
  motifColor = DEFAULT_HERO_MOTIF_COLOR,
  customMotifPoints = [],
  motifPosition,
  motifPanelSize,
  background,
  contentGutter = DEFAULT_CONTENT_GUTTER,
  contentWidthClass = DEFAULT_HERO_CONTENT_WIDTH_CLASS,
}: GeomFadeProps) {
  if (!motifPosition || !motifPanelSize) return null;

  return (
    <HeroEditorialLayerFrame
      gutter={contentGutter}
      contentWidthClass={contentWidthClass}
      className="z-0 overflow-visible"
    >
      <div
        className="pointer-events-none absolute overflow-visible"
        style={motifPanelShellStyle(fadeOpacity, motifPosition, motifPanelSize)}
      >
        <div
          className="absolute inset-0"
          style={motifPanelStyle(motifShape, motifColor, customMotifPoints, background)}
        />
      </div>
    </HeroEditorialLayerFrame>
  );
}

/** Transparent layer above content — backdrop-filter desaturates everything underneath in zone Y. */
export function PortfolioHeroGeometricOverlay({
  fadeOpacity = 1,
  motifShape = 'diagonal',
  customMotifPoints = [],
  motifPosition,
  motifPanelSize,
  contentGutter = DEFAULT_CONTENT_GUTTER,
  contentWidthClass = DEFAULT_HERO_CONTENT_WIDTH_CLASS,
}: Pick<
  GeomFadeProps,
  | 'fadeOpacity'
  | 'motifShape'
  | 'customMotifPoints'
  | 'motifPosition'
  | 'motifPanelSize'
  | 'contentGutter'
  | 'contentWidthClass'
>) {
  if (!motifPosition || !motifPanelSize) return null;

  const clipStyle = motifClipStyle(motifShape, customMotifPoints);

  return (
    <HeroEditorialLayerFrame
      gutter={contentGutter}
      contentWidthClass={contentWidthClass}
      className="z-20 overflow-visible"
    >
      <div
        className="pointer-events-none absolute overflow-visible"
        style={motifPanelShellStyle(fadeOpacity, motifPosition, motifPanelSize)}
      >
        <div className="portfolio-hero-geom-overlay absolute inset-0" style={clipStyle} />
      </div>
    </HeroEditorialLayerFrame>
  );
}

/** Inside zone Y — legacy clipped bar (prefer PortfolioHeroEditorialMetaLayer). */
export function PortfolioHeroMetaGeomBar({
  children,
  fadeOpacity = 1,
  motifShape = 'diagonal',
  customMotifPoints = [],
  motifPosition,
  motifPanelSize,
  contentGutter = DEFAULT_CONTENT_GUTTER,
  contentWidthClass = DEFAULT_HERO_CONTENT_WIDTH_CLASS,
}: GeomFadeProps & { children: ReactNode }) {
  if (!motifPosition || !motifPanelSize) return null;

  const clipStyle = motifClipStyle(motifShape, customMotifPoints);

  return (
    <HeroEditorialLayerFrame
      gutter={contentGutter}
      contentWidthClass={contentWidthClass}
      className="z-[15] overflow-visible"
    >
      <div
        className="pointer-events-none absolute overflow-visible"
        style={motifPanelShellStyle(fadeOpacity, motifPosition, motifPanelSize)}
      >
        <div className="absolute inset-0 overflow-hidden" style={clipStyle}>
          {children}
        </div>
      </div>
    </HeroEditorialLayerFrame>
  );
}
