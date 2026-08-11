import {
  clampMotifPanelPosition,
  clampMotifPanelSize,
  type MotifPanelPosition,
} from '@/components/portfolio/portfolio-hero-motif-panel';
import {
  getRightMotifPresetPoints,
  mirrorMotifPointsHorizontally,
  sanitizeMotifPoints,
  type MotifPoint,
  type RightMotifPresetShape,
} from '@/components/portfolio/portfolio-hero-motif-geometry';
import type { MetaRowPosition } from '@/components/portfolio/portfolio-hero-meta-settings';
import type { PortraitPosition } from '@/components/portfolio/portfolio-hero-profile-settings';
import type { HeroCopyPosition } from '@/components/portfolio/portfolio-hero-copy-settings';
import type { PortfolioHeroSectionSettings } from '@/components/portfolio/portfolio-settings-types';

export function mirrorHorizontalVw(x: number): number {
  return 100 - x;
}

export function mirrorPortraitPosition(position: PortraitPosition): PortraitPosition {
  return {
    x: mirrorHorizontalVw(position.x),
    y: position.y,
  };
}

export function mirrorMetaRowPosition(position: MetaRowPosition): MetaRowPosition {
  return {
    x: mirrorHorizontalVw(position.x),
    y: position.y,
  };
}

export function mirrorHeroCopyPosition(position: HeroCopyPosition): HeroCopyPosition {
  return {
    x: mirrorHorizontalVw(position.x),
    y: position.y,
  };
}

export function mirrorMotifPanelPosition(
  position: MotifPanelPosition,
  side: 'left' | 'right',
  size: { width: number; height: number }
): MotifPanelPosition {
  return clampMotifPanelPosition(
    { x: mirrorHorizontalVw(position.x), y: position.y },
    side,
    size
  );
}

function currentRightMotifPoints(settings: PortfolioHeroSectionSettings): MotifPoint[] {
  if (settings.motifShape === 'custom') {
    return sanitizeMotifPoints(settings.customMotifPoints);
  }
  return getRightMotifPresetPoints(settings.motifShape as RightMotifPresetShape);
}

/** Toggle hero column layout and mirror every horizontal placement + motif shapes. */
export function flipHeroLayoutPresentation(
  settings: PortfolioHeroSectionSettings
): PortfolioHeroSectionSettings {
  const rightMotifSize = clampMotifPanelSize(settings.motifPanelSize, 'right');
  const leftMotifSize = clampMotifPanelSize(settings.leftMotifSize, 'left');

  const heroMotifs = (settings.heroMotifs ?? []).map((motif) => {
    const side = motif.kind === 'pattern' ? 'left' : 'right';
    const size = clampMotifPanelSize(motif.size, side);
    const shouldMirrorPoints =
      motif.kind === 'geometric' ||
      (motif.kind === 'pattern' && motif.pattern === 'custom');
    const curveAxis =
      motif.kind === 'curve'
        ? motif.curveAxis === 'diagonal'
          ? ('diagonal-alt' as const)
          : motif.curveAxis === 'diagonal-alt'
            ? ('diagonal' as const)
            : motif.curveAxis
        : motif.curveAxis;
    return {
      ...motif,
      position: mirrorMotifPanelPosition(motif.position, side, size),
      size,
      points: shouldMirrorPoints
        ? mirrorMotifPointsHorizontally(motif.points)
        : motif.points.map((point) => ({ ...point })),
      shape: motif.kind === 'geometric' ? ('custom' as const) : motif.shape,
      pattern: motif.kind === 'pattern' && motif.pattern === 'custom' ? 'custom' : motif.pattern,
      ...(curveAxis ? { curveAxis } : {}),
      ...(motif.kind === 'curve' && typeof motif.curveBend === 'number'
        ? { curveBend: -motif.curveBend }
        : {}),
    };
  });

  return {
    ...settings,
    heroLayoutFlipped: !settings.heroLayoutFlipped,
    portraitPosition: mirrorPortraitPosition(settings.portraitPosition),
    metaPosition: mirrorMetaRowPosition(settings.metaPosition),
    heroCopyPosition: mirrorHeroCopyPosition(settings.heroCopyPosition),
    motifPosition: mirrorMotifPanelPosition(settings.motifPosition, 'right', rightMotifSize),
    leftMotifPosition: mirrorMotifPanelPosition(settings.leftMotifPosition, 'left', leftMotifSize),
    customMotifPoints: mirrorMotifPointsHorizontally(currentRightMotifPoints(settings)),
    motifShape: 'custom',
    leftCustomMotifPoints:
      settings.leftMotifPattern === 'custom'
        ? mirrorMotifPointsHorizontally(settings.leftCustomMotifPoints)
        : settings.leftCustomMotifPoints,
    heroMotifs,
  };
}
