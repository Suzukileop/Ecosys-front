import {
  clampMotifPanelPosition,
  clampMotifPanelSize,
  type MotifPanelPosition,
  type MotifPanelSize,
} from '@/components/portfolio/portfolio-hero-motif-panel';
import type { PortfolioHeroSectionSettings } from '@/components/portfolio/portfolio-settings-types';
import {
  flipHeroLayoutPresentation,
  mirrorMotifPanelPosition,
} from '@/components/portfolio/portfolio-hero-layout-flip';
import { DEFAULT_HERO_COPY_POSITION } from '@/components/portfolio/portfolio-hero-copy-settings';
import type {
  HeroMotifInstance,
  HeroMotifKind,
} from '@/components/portfolio/portfolio-hero-motifs-settings';
import {
  getRightMotifPresetPoints,
  mirrorMotifPointsHorizontally,
  ensureRightColumnMotifPoints,
  ensureLeftColumnMotifPoints,
  type RightMotifPresetShape,
} from '@/components/portfolio/portfolio-hero-motif-geometry';
import { heroVerticalCellFromPosition } from '@/components/portfolio/portfolio-hero-vertical-cell-placement';
import { resetHeroCopyElementsAfterColumns3 } from '@/components/portfolio/portfolio-hero-copy-element-layout';

/**
 * Screen division for hero groups:
 * - Copy group: headline, description, tools, CTA, availability
 * - Visual group: portrait, motif, stats
 * - columns-3: Copy | Portrait | Stats as three peer columns (xl+)
 *
 * Matches L|R, R|L, top/bottom, bottom/top, and three-column.
 */
export type HeroLayoutDivision =
  | 'horizontal-copy-left'
  | 'horizontal-copy-right'
  | 'vertical-copy-top'
  | 'vertical-copy-bottom'
  | 'columns-3';

export const DEFAULT_HERO_LAYOUT_DIVISION: HeroLayoutDivision = 'horizontal-copy-left';

/** Pixel gap between frames in vertical / columns-3 screen division. */
export const DEFAULT_HERO_VERTICAL_FRAME_GAP_PX = 16;
export const HERO_VERTICAL_FRAME_GAP_PX_MIN = 0;
export const HERO_VERTICAL_FRAME_GAP_PX_MAX = 120;

export function sanitizeHeroVerticalFrameGapPx(
  value: unknown,
  fallback: number = DEFAULT_HERO_VERTICAL_FRAME_GAP_PX
): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(
    HERO_VERTICAL_FRAME_GAP_PX_MAX,
    Math.max(HERO_VERTICAL_FRAME_GAP_PX_MIN, Math.round(n))
  );
}

export function resolveHeroVerticalFrameGapPx(presentation: {
  heroVerticalFrameGapPx?: number;
}): number {
  return sanitizeHeroVerticalFrameGapPx(
    presentation.heroVerticalFrameGapPx,
    DEFAULT_HERO_VERTICAL_FRAME_GAP_PX
  );
}

export const PORTFOLIO_HERO_LAYOUT_DIVISION_OPTIONS: {
  value: HeroLayoutDivision;
  label: string;
  description: string;
}[] = [
  {
    value: 'horizontal-copy-left',
    label: 'Copy | Visual',
    description: 'Text on the left, portrait & stats on the right.',
  },
  {
    value: 'horizontal-copy-right',
    label: 'Visual | Copy',
    description: 'Portrait & stats on the left, text on the right.',
  },
  {
    value: 'vertical-copy-top',
    label: 'Copy / Visual',
    description: 'Text on top, portrait & stats below.',
  },
  {
    value: 'vertical-copy-bottom',
    label: 'Visual / Copy',
    description: 'Portrait & stats on top, text below.',
  },
  {
    value: 'columns-3',
    label: 'Copy | Portrait | Stats',
    description: 'Three columns side by side.',
  },
];

export function isHorizontalHeroDivision(division: HeroLayoutDivision): boolean {
  return (
    division === 'horizontal-copy-left' || division === 'horizontal-copy-right'
  );
}

export function isVerticalHeroDivision(division: HeroLayoutDivision): boolean {
  return (
    division === 'vertical-copy-top' || division === 'vertical-copy-bottom'
  );
}

export function isColumns3HeroDivision(division: HeroLayoutDivision): boolean {
  return division === 'columns-3';
}

/** In-flow frames — no section absolute portrait / meta / free copy layers. */
export function isInFlowHeroDivision(division: HeroLayoutDivision): boolean {
  return isVerticalHeroDivision(division) || isColumns3HeroDivision(division);
}

/** Peer columns in the columns-3 screen division. */
export type HeroColumns3Slot = 'copy' | 'portrait' | 'stats';

export const DEFAULT_HERO_COLUMNS_3_ORDER: HeroColumns3Slot[] = [
  'copy',
  'portrait',
  'stats',
];

export const HERO_COLUMNS_3_SLOT_OPTIONS: {
  value: HeroColumns3Slot;
  label: string;
}[] = [
  { value: 'copy', label: 'Copy' },
  { value: 'portrait', label: 'Portrait' },
  { value: 'stats', label: 'Stats' },
];

export function sanitizeHeroColumns3Order(
  value: unknown,
  fallback: HeroColumns3Slot[] = DEFAULT_HERO_COLUMNS_3_ORDER
): HeroColumns3Slot[] {
  const allowed = new Set<HeroColumns3Slot>(['copy', 'portrait', 'stats']);
  if (!Array.isArray(value)) return [...fallback];
  const seen = new Set<HeroColumns3Slot>();
  const next: HeroColumns3Slot[] = [];
  for (const item of value) {
    if (item === 'copy' || item === 'portrait' || item === 'stats') {
      if (!seen.has(item) && allowed.has(item)) {
        seen.add(item);
        next.push(item);
      }
    }
  }
  for (const slot of DEFAULT_HERO_COLUMNS_3_ORDER) {
    if (!seen.has(slot)) next.push(slot);
  }
  return next;
}

export function resolveHeroColumns3Order(presentation: {
  heroColumns3Order?: HeroColumns3Slot[];
}): HeroColumns3Slot[] {
  return sanitizeHeroColumns3Order(
    presentation.heroColumns3Order,
    DEFAULT_HERO_COLUMNS_3_ORDER
  );
}

/** Move a columns-3 slot up or down in the order list. */
export function moveHeroColumns3Slot(
  order: HeroColumns3Slot[],
  slot: HeroColumns3Slot,
  direction: -1 | 1
): HeroColumns3Slot[] {
  const current = sanitizeHeroColumns3Order(order);
  const index = current.indexOf(slot);
  if (index < 0) return current;
  const target = index + direction;
  if (target < 0 || target >= current.length) return current;
  const next = [...current];
  const [item] = next.splice(index, 1);
  next.splice(target, 0, item);
  return next;
}

/**
 * Relative width of the middle column (index 1) vs the side columns (1fr each).
 * Stored as tenths (10 = 1fr, 16 = 1.6fr, 30 = 3fr).
 */
export const DEFAULT_HERO_COLUMNS_3_MIDDLE_WEIGHT = 16;
export const HERO_COLUMNS_3_MIDDLE_WEIGHT_MIN = 10;
export const HERO_COLUMNS_3_MIDDLE_WEIGHT_MAX = 30;

export function sanitizeHeroColumns3MiddleWeight(
  value: unknown,
  fallback: number = DEFAULT_HERO_COLUMNS_3_MIDDLE_WEIGHT
): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(
    HERO_COLUMNS_3_MIDDLE_WEIGHT_MAX,
    Math.max(HERO_COLUMNS_3_MIDDLE_WEIGHT_MIN, Math.round(n))
  );
}

export function resolveHeroColumns3MiddleWeight(presentation: {
  heroColumns3MiddleWeight?: number;
}): number {
  return sanitizeHeroColumns3MiddleWeight(
    presentation.heroColumns3MiddleWeight,
    DEFAULT_HERO_COLUMNS_3_MIDDLE_WEIGHT
  );
}

/** CSS grid-template-columns for columns-3 — middle slot gets the tunable weight. */
export function heroColumns3GridTemplateColumns(
  order: HeroColumns3Slot[],
  middleWeight: number
): string {
  const weight = sanitizeHeroColumns3MiddleWeight(middleWeight) / 10;
  const slots = sanitizeHeroColumns3Order(order);
  return slots.map((_, index) => (index === 1 ? `${weight}fr` : '1fr')).join(' ');
}

export type HeroColumns3VerticalAlign = 'top' | 'center' | 'bottom';

export const DEFAULT_HERO_COLUMNS_3_SLOT_VERTICAL: Record<
  HeroColumns3Slot,
  HeroColumns3VerticalAlign
> = {
  copy: 'top',
  portrait: 'top',
  stats: 'top',
};

export const PORTFOLIO_HERO_COLUMNS_3_VERTICAL_OPTIONS: {
  value: HeroColumns3VerticalAlign;
  label: string;
}[] = [
  { value: 'top', label: 'Top' },
  { value: 'center', label: 'Center' },
  { value: 'bottom', label: 'Bottom' },
];

export function sanitizeHeroColumns3VerticalAlign(
  value: unknown,
  fallback: HeroColumns3VerticalAlign = 'top'
): HeroColumns3VerticalAlign {
  if (value === 'top' || value === 'center' || value === 'bottom') return value;
  return fallback;
}

export function sanitizeHeroColumns3SlotVertical(
  value: unknown,
  fallback: Record<HeroColumns3Slot, HeroColumns3VerticalAlign> = DEFAULT_HERO_COLUMNS_3_SLOT_VERTICAL
): Record<HeroColumns3Slot, HeroColumns3VerticalAlign> {
  const record = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  return {
    copy: sanitizeHeroColumns3VerticalAlign(record.copy, fallback.copy),
    portrait: sanitizeHeroColumns3VerticalAlign(record.portrait, fallback.portrait),
    stats: sanitizeHeroColumns3VerticalAlign(record.stats, fallback.stats),
  };
}

export function resolveHeroColumns3SlotVertical(presentation: {
  heroColumns3SlotVertical?: Record<HeroColumns3Slot, HeroColumns3VerticalAlign>;
}): Record<HeroColumns3Slot, HeroColumns3VerticalAlign> {
  return sanitizeHeroColumns3SlotVertical(
    presentation.heroColumns3SlotVertical,
    DEFAULT_HERO_COLUMNS_3_SLOT_VERTICAL
  );
}

export function heroColumns3VerticalJustifyClass(align: HeroColumns3VerticalAlign): string {
  if (align === 'center') return 'xl:justify-center';
  if (align === 'bottom') return 'xl:justify-end';
  return 'xl:justify-start';
}

/** True when copy sits on the end side (right in LTR, or bottom in vertical). */
export function isHeroCopyOnEnd(division: HeroLayoutDivision): boolean {
  return (
    division === 'horizontal-copy-right' || division === 'vertical-copy-bottom'
  );
}

/** Legacy boolean flip ↔ horizontal division. */
export function heroLayoutFlippedFromDivision(division: HeroLayoutDivision): boolean {
  return division === 'horizontal-copy-right';
}

export function heroLayoutDivisionFromFlipped(flipped: boolean): HeroLayoutDivision {
  return flipped ? 'horizontal-copy-right' : 'horizontal-copy-left';
}

export function resolveHeroLayoutDivision(
  presentation: Pick<PortfolioHeroSectionSettings, 'heroLayoutDivision' | 'heroLayoutFlipped'>
): HeroLayoutDivision {
  if (
    presentation.heroLayoutDivision === 'horizontal-copy-left' ||
    presentation.heroLayoutDivision === 'horizontal-copy-right' ||
    presentation.heroLayoutDivision === 'vertical-copy-top' ||
    presentation.heroLayoutDivision === 'vertical-copy-bottom' ||
    presentation.heroLayoutDivision === 'columns-3'
  ) {
    return presentation.heroLayoutDivision;
  }
  return heroLayoutDivisionFromFlipped(Boolean(presentation.heroLayoutFlipped));
}

export function sanitizeHeroLayoutDivision(
  value: unknown,
  fallback: HeroLayoutDivision = DEFAULT_HERO_LAYOUT_DIVISION
): HeroLayoutDivision {
  if (
    value === 'horizontal-copy-left' ||
    value === 'horizontal-copy-right' ||
    value === 'vertical-copy-top' ||
    value === 'vertical-copy-bottom' ||
    value === 'columns-3'
  ) {
    return value;
  }
  return fallback;
}

function mirrorVerticalAxis(y: number): number {
  return 100 - y;
}

/**
 * Default motif box inside the content-width frame (after global side margins).
 * Vertical: span the frame from its start (no outer gutter waste).
 * Horizontal: hug the visual column (right or left).
 */
export function defaultHeroMotifTransformForDivision(
  division: HeroLayoutDivision,
  kind: HeroMotifKind
): { position: MotifPanelPosition; size: MotifPanelSize } {
  if (isInFlowHeroDivision(division)) {
    if (kind === 'glow') {
      return { position: { x: 78, y: 28 }, size: { width: 52, height: 52 } };
    }
    if (kind === 'curve') {
      return { position: { x: 50, y: 22 }, size: { width: 108, height: 48 } };
    }
    if (kind === 'geometric') {
      return { position: { x: 50, y: 52 }, size: { width: 100, height: 78 } };
    }
    return { position: { x: 50, y: 58 }, size: { width: 80, height: 50 } };
  }

  if (division === 'horizontal-copy-right') {
    if (kind === 'glow') {
      return { position: { x: 22, y: 32 }, size: { width: 44, height: 44 } };
    }
    if (kind === 'curve') {
      return { position: { x: 50, y: 20 }, size: { width: 110, height: 46 } };
    }
    if (kind === 'geometric') {
      return { position: { x: 25, y: 50 }, size: { width: 50, height: 76 } };
    }
    return { position: { x: 78, y: 78 }, size: { width: 48, height: 42 } };
  }

  if (kind === 'glow') {
    return { position: { x: 78, y: 30 }, size: { width: 44, height: 44 } };
  }
  if (kind === 'curve') {
    return { position: { x: 50, y: 22 }, size: { width: 108, height: 48 } };
  }
  if (kind === 'geometric') {
    return { position: { x: 75, y: 50 }, size: { width: 50, height: 76 } };
  }
  return { position: { x: 22, y: 78 }, size: { width: 48, height: 42 } };
}

const RIGHT_MOTIF_PRESET_SHAPES: RightMotifPresetShape[] = [
  'diagonal',
  'triangle',
  'trapezoid',
  'block',
  'chevron',
  'prism',
];

function isRightMotifPresetShape(shape: string): shape is RightMotifPresetShape {
  return (RIGHT_MOTIF_PRESET_SHAPES as string[]).includes(shape);
}

function motifPointsSkewLeft(points: { x: number; y: number }[]): boolean {
  if (points.length < 3) return false;
  const avgX = points.reduce((sum, point) => sum + point.x, 0) / points.length;
  return avgX < 48;
}

/**
 * Keep geometric clip paths oriented for the visual column.
 * Copy | Visual → right-edge slash (vertical on the frame’s right).
 * Visual | Copy → mirrored left-edge slash.
 */
function orientGeometricMotifForDivision(
  motif: HeroMotifInstance,
  division: HeroLayoutDivision,
  previousPositionX: number
): Pick<HeroMotifInstance, 'points' | 'shape'> {
  if (motif.kind !== 'geometric' || !isHorizontalHeroDivision(division)) {
    return {
      points: motif.points.map((point) => ({ ...point })),
      shape: motif.shape,
    };
  }

  const targetOnLeft = division === 'horizontal-copy-right';
  const wasOnLeft = previousPositionX < 50;

  if (motif.shape !== 'custom' && isRightMotifPresetShape(motif.shape)) {
    const preset = getRightMotifPresetPoints(motif.shape);
    if (targetOnLeft) {
      return {
        points: ensureLeftColumnMotifPoints(mirrorMotifPointsHorizontally(preset)),
        shape: 'custom',
      };
    }
    return {
      points: ensureRightColumnMotifPoints(preset),
      shape: motif.shape,
    };
  }

  const sideChanged = wasOnLeft !== targetOnLeft;
  let points = motif.points.map((point) => ({ ...point }));
  if (sideChanged) {
    points = mirrorMotifPointsHorizontally(points);
  }

  points = targetOnLeft
    ? ensureLeftColumnMotifPoints(points)
    : ensureRightColumnMotifPoints(points);

  // If still left-skewed on the right column, force one more mirror.
  if (!targetOnLeft && motifPointsSkewLeft(points)) {
    points = mirrorMotifPointsHorizontally(points);
  }

  return {
    points,
    shape: 'custom',
  };
}

/** Reset one motif to the division’s default frame placement + correct side orientation. */
export function resetHeroMotifToDivisionDefault(
  motif: HeroMotifInstance,
  division: HeroLayoutDivision
): HeroMotifInstance {
  const next = defaultHeroMotifTransformForDivision(division, motif.kind);
  const size = clampMotifPanelSize(
    next.size,
    motif.kind === 'pattern' ? 'left' : 'right'
  );

  if (motif.kind === 'glow') {
    const side = Math.min(size.width, size.height);
    return {
      ...motif,
      position: next.position,
      size:
        motif.primitive === 'oval'
          ? size
          : { width: side, height: side },
    };
  }

  if (motif.kind === 'geometric' && isHorizontalHeroDivision(division)) {
    const shape =
      motif.shape !== 'custom' && isRightMotifPresetShape(motif.shape)
        ? motif.shape
        : 'diagonal';
    const preset = getRightMotifPresetPoints(shape);
    const targetOnLeft = division === 'horizontal-copy-right';
    return {
      ...motif,
      position: next.position,
      size,
      shape: targetOnLeft ? 'custom' : shape,
      points: targetOnLeft
        ? ensureLeftColumnMotifPoints(mirrorMotifPointsHorizontally(preset))
        : ensureRightColumnMotifPoints(preset),
    };
  }

  const oriented = orientGeometricMotifForDivision(motif, division, motif.position.x);
  return {
    ...motif,
    position: next.position,
    size,
    ...oriented,
  };
}

/**
 * When entering vertical / columns-3: hide geometric & pattern side motifs by default.
 * Glow + curve stay on — ambient tint and strokes still work in in-flow divisions.
 * Keep position + size + shape so a round-trip back to horizontal restores shapes.
 * When leaving vertical: restore visibility only — never rewrite motif size or position.
 */
export function syncHeroMotifsToLayoutDivision(
  motifs: HeroMotifInstance[],
  division: HeroLayoutDivision,
  phase: 'enter-vertical' | 'leave-vertical' | 'apply-defaults'
): HeroMotifInstance[] {
  return motifs.map((motif) => {
    if (phase === 'enter-vertical') {
      // Soft glow + curved strokes remain usable in stacked / 3-column heroes.
      if (motif.kind === 'glow' || motif.kind === 'curve') {
        return {
          ...motif,
          enabled: true,
          visibility: {
            mobile: motif.visibility?.mobile ?? true,
            desktop: true,
          },
        };
      }
      // Hide shapes/patterns only — size/position must survive (even while invisible).
      return {
        ...motif,
        enabled: false,
        visibility: { mobile: false, desktop: false },
      };
    }

    if (phase === 'leave-vertical') {
      // Re-show with the same box the user had before vertical.
      const oriented = orientGeometricMotifForDivision(motif, division, motif.position.x);
      return {
        ...motif,
        enabled: true,
        visibility: { mobile: false, desktop: true },
        ...oriented,
      };
    }

    // apply-defaults: keep size; only refresh orientation for named presets.
    // Also revive curves/glows left fully off by older enter-vertical (pre-curve keep).
    if (
      isInFlowHeroDivision(division) &&
      (motif.kind === 'curve' || motif.kind === 'glow') &&
      !motif.enabled &&
      !motif.visibility?.mobile &&
      !motif.visibility?.desktop
    ) {
      return {
        ...motif,
        enabled: true,
        visibility: { mobile: true, desktop: true },
      };
    }

    const oriented = orientGeometricMotifForDivision(motif, division, motif.position.x);
    return {
      ...motif,
      ...oriented,
    };
  });
}

/** Presets for each division — groups stay together; free placement can refine later. */
export function defaultPositionsForHeroDivision(division: HeroLayoutDivision): {
  heroCopyPosition: { x: number; y: number };
  portraitPosition: { x: number; y: number };
  metaPosition: { x: number; y: number };
  motifPosition: { x: number; y: number };
} {
  switch (division) {
    case 'horizontal-copy-right':
      return {
        heroCopyPosition: { x: 78, y: 42 },
        portraitPosition: { x: 22, y: 44 },
        metaPosition: { x: 22, y: 88 },
        motifPosition: { x: 25, y: 50 },
      };
    case 'vertical-copy-top':
      return {
        heroCopyPosition: { x: 50, y: 28 },
        portraitPosition: { x: 50, y: 72 },
        metaPosition: { x: 50, y: 92 },
        motifPosition: { x: 50, y: 52 },
      };
    case 'vertical-copy-bottom':
      return {
        heroCopyPosition: { x: 50, y: 72 },
        portraitPosition: { x: 50, y: 28 },
        metaPosition: { x: 50, y: 48 },
        motifPosition: { x: 50, y: 52 },
      };
    case 'columns-3':
      return {
        heroCopyPosition: { x: 16, y: 42 },
        portraitPosition: { x: 50, y: 44 },
        metaPosition: { x: 84, y: 50 },
        motifPosition: { x: 50, y: 52 },
      };
    default:
      return {
        heroCopyPosition: { ...DEFAULT_HERO_COPY_POSITION },
        portraitPosition: { x: 80, y: 44 },
        metaPosition: { x: 75, y: 88 },
        motifPosition: { x: 75, y: 50 },
      };
  }
}

/**
 * Apply a screen division mode: sync legacy flip flag, remount group positions,
 * and mirror shapes when swapping horizontal sides.
 */
export function applyHeroLayoutDivision(
  settings: PortfolioHeroSectionSettings,
  next: HeroLayoutDivision
): PortfolioHeroSectionSettings {
  const current = resolveHeroLayoutDivision(settings);
  if (current === next) {
    // Re-selecting columns-3 / vertical: revive curves & glows left fully off by
    // older enter-vertical (curves used to be nuked with shapes).
    const heroMotifs = isInFlowHeroDivision(next)
      ? syncHeroMotifsToLayoutDivision(settings.heroMotifs ?? [], next, 'apply-defaults')
      : settings.heroMotifs;
    return {
      ...settings,
      heroLayoutDivision: next,
      heroLayoutFlipped: heroLayoutFlippedFromDivision(next),
      ...(heroMotifs ? { heroMotifs } : {}),
    };
  }

  // Horizontal L ↔ R: reuse proven flip (mirrors placements + motif shapes).
  if (
    isHorizontalHeroDivision(current) &&
    isHorizontalHeroDivision(next) &&
    current !== next
  ) {
    const flipped = flipHeroLayoutPresentation(settings);
    return {
      ...flipped,
      heroLayoutDivision: next,
      heroLayoutFlipped: heroLayoutFlippedFromDivision(next),
    };
  }

  // Vertical top ↔ bottom: mirror Y for both groups; keep motifs hidden policy as-is.
  if (
    isVerticalHeroDivision(current) &&
    isVerticalHeroDivision(next) &&
    current !== next
  ) {
    const rightMotifSize = clampMotifPanelSize(settings.motifPanelSize, 'right');
    const leftMotifSize = clampMotifPanelSize(settings.leftMotifSize, 'left');
    const heroMotifs = (settings.heroMotifs ?? []).map((motif) => {
      const size = clampMotifPanelSize(
        motif.size,
        motif.kind === 'pattern' ? 'left' : 'right'
      );
      return {
        ...motif,
        position: clampMotifPanelPosition(
          { x: motif.position.x, y: mirrorVerticalAxis(motif.position.y) },
          motif.kind === 'pattern' ? 'left' : 'right',
          size
        ),
        size,
      };
    });

    return {
      ...settings,
      heroLayoutDivision: next,
      heroLayoutFlipped: false,
      leftMotifEnabled: false,
      portraitPosition: {
        x: settings.portraitPosition.x,
        y: mirrorVerticalAxis(settings.portraitPosition.y),
      },
      portraitPositionVertical: (() => {
        const nextPos = {
          x: (settings.portraitPositionVertical ?? settings.portraitPosition).x,
          y: mirrorVerticalAxis((settings.portraitPositionVertical ?? settings.portraitPosition).y),
        };
        return nextPos;
      })(),
      portraitVerticalCell: heroVerticalCellFromPosition({
        x: (settings.portraitPositionVertical ?? settings.portraitPosition).x,
        y: mirrorVerticalAxis((settings.portraitPositionVertical ?? settings.portraitPosition).y),
      }),
      metaPosition: {
        x: settings.metaPosition.x,
        y: mirrorVerticalAxis(settings.metaPosition.y),
      },
      metaPositionVertical: {
        x: (settings.metaPositionVertical ?? settings.metaPosition).x,
        y: mirrorVerticalAxis((settings.metaPositionVertical ?? settings.metaPosition).y),
      },
      metaVerticalCell: heroVerticalCellFromPosition({
        x: (settings.metaPositionVertical ?? settings.metaPosition).x,
        y: mirrorVerticalAxis((settings.metaPositionVertical ?? settings.metaPosition).y),
      }),
      heroCopyPosition: {
        x: settings.heroCopyPosition.x,
        y: mirrorVerticalAxis(settings.heroCopyPosition.y),
      },
      motifPosition: mirrorMotifPanelPosition(
        {
          x: settings.motifPosition.x,
          y: mirrorVerticalAxis(settings.motifPosition.y),
        },
        'right',
        rightMotifSize
      ),
      leftMotifPosition: mirrorMotifPanelPosition(
        {
          x: settings.leftMotifPosition.x,
          y: mirrorVerticalAxis(settings.leftMotifPosition.y),
        },
        'left',
        leftMotifSize
      ),
      heroMotifs,
    };
  }

  // Crossing axis (horizontal ↔ vertical / columns-3): apply division presets.
  // Do NOT flip presentation first — that mirrored motif points and left them inverted
  // after returning to Copy | Visual.
  const presets = defaultPositionsForHeroDivision(next);

  const leavingColumns3 =
    isColumns3HeroDivision(current) && !isColumns3HeroDivision(next);
  const enteringInFlow =
    !isInFlowHeroDivision(current) && isInFlowHeroDivision(next);
  const leavingInFlow =
    isInFlowHeroDivision(current) && !isInFlowHeroDivision(next);

  // columns-3 → vertical: both are in-flow, but shapes must stay hidden like enter-vertical.
  const motifPhase: 'enter-vertical' | 'leave-vertical' | 'apply-defaults' =
    enteringInFlow || (leavingColumns3 && isVerticalHeroDivision(next))
      ? 'enter-vertical'
      : leavingInFlow
        ? 'leave-vertical'
        : 'apply-defaults';

  const heroMotifs = syncHeroMotifsToLayoutDivision(
    settings.heroMotifs ?? [],
    next,
    motifPhase
  );

  const hadPatternMotif = (settings.heroMotifs ?? []).some((motif) => motif.kind === 'pattern');

  // columns-3 routes copy units into portrait/stats — wipe that when leaving so
  // horizontal / vertical layouts don't look scrambled.
  const copyLayoutReset = leavingColumns3
    ? {
        heroCopyElementsLayout: resetHeroCopyElementsAfterColumns3(
          settings.heroCopyElementsLayout
        ),
        ctaPlacement:
          settings.ctaPlacement === 'above-stats' ||
          settings.ctaPlacement === 'below-stats' ||
          settings.ctaPlacement === 'free-zone'
            ? ('below-tools' as const)
            : settings.ctaPlacement,
        heroColumns3SlotVertical: { ...DEFAULT_HERO_COLUMNS_3_SLOT_VERTICAL },
      }
    : {};

  // Motif size/position are preserved across horizontal ↔ in-flow. In-flow only
  // hides them by default — returning to horizontal must not redimension them.
  return {
    ...settings,
    heroLayoutDivision: next,
    heroLayoutFlipped: heroLayoutFlippedFromDivision(next),
    heroCopyPosition: presets.heroCopyPosition,
    // Keep portrait/stats free-placement coords — horizontal and vertical stores are separate.
    leftMotifEnabled: enteringInFlow || (leavingColumns3 && isVerticalHeroDivision(next))
      ? false
      : leavingInFlow
        ? hadPatternMotif
        : settings.leftMotifEnabled,
    heroMotifs,
    ...copyLayoutReset,
  };
}
