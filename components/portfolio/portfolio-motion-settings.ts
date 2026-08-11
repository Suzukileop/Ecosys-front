export type PortfolioGlobalMotionProfile = 'none' | 'editorial' | 'dynamic' | 'cinematic';

/** User overrides for scroll-reveal timing (seconds / pixels) + dynamic hover chrome. */
export type PortfolioMotionTiming = {
  /** Base delay before the first item starts (seconds). */
  delay: number;
  /** Enter animation duration (seconds). */
  duration: number;
  /** Extra delay per item index (seconds). */
  stagger: number;
  /** Vertical travel distance on enter (px). */
  distance: number;
  /** Upward lift on hover (px). Used by Dynamique. */
  hoverLift: number;
  /** Hover shadow blur size (px). Used by Dynamique. */
  hoverShadowSize: number;
  /** Hover shadow hex color. Used by Dynamique. */
  hoverShadowColor: string;
  /** Hover shadow opacity 0–100. Used by Dynamique. */
  hoverShadowOpacity: number;
};

export const DEFAULT_MOTION_PROFILE: PortfolioGlobalMotionProfile = 'none';

export const DEFAULT_MOTION_HOVER_SHADOW_COLOR = '#f97316';

export const MOTION_TIMING_DELAY_MIN = 0;
export const MOTION_TIMING_DELAY_MAX = 1.2;
export const MOTION_TIMING_DURATION_MIN = 0.2;
export const MOTION_TIMING_DURATION_MAX = 1.5;
export const MOTION_TIMING_STAGGER_MIN = 0;
export const MOTION_TIMING_STAGGER_MAX = 0.28;
export const MOTION_TIMING_DISTANCE_MIN = 0;
export const MOTION_TIMING_DISTANCE_MAX = 48;
export const MOTION_TIMING_HOVER_LIFT_MIN = 0;
export const MOTION_TIMING_HOVER_LIFT_MAX = 16;
export const MOTION_TIMING_HOVER_SHADOW_SIZE_MIN = 0;
export const MOTION_TIMING_HOVER_SHADOW_SIZE_MAX = 80;
export const MOTION_TIMING_HOVER_SHADOW_OPACITY_MIN = 0;
export const MOTION_TIMING_HOVER_SHADOW_OPACITY_MAX = 100;
export const MOTION_STAGGER_CAP_SECONDS = 0.9;

const DEFAULT_DYNAMIC_HOVER = {
  hoverLift: 4,
  hoverShadowSize: 40,
  hoverShadowColor: DEFAULT_MOTION_HOVER_SHADOW_COLOR,
  hoverShadowOpacity: 35,
} as const;

const IDLE_HOVER = {
  hoverLift: 0,
  hoverShadowSize: 0,
  hoverShadowColor: DEFAULT_MOTION_HOVER_SHADOW_COLOR,
  hoverShadowOpacity: 35,
} as const;

export function defaultMotionTimingForProfile(
  profile: PortfolioGlobalMotionProfile
): PortfolioMotionTiming {
  switch (profile) {
    case 'editorial':
      return { delay: 0, duration: 0.6, stagger: 0.07, distance: 20, ...IDLE_HOVER };
    case 'dynamic':
      return { delay: 0, duration: 0.55, stagger: 0.075, distance: 22, ...DEFAULT_DYNAMIC_HOVER };
    case 'cinematic':
      return { delay: 0.08, duration: 0.85, stagger: 0.12, distance: 28, ...IDLE_HOVER };
    default:
      return { delay: 0, duration: 0, stagger: 0, distance: 0, ...IDLE_HOVER };
  }
}

export const DEFAULT_MOTION_TIMING: PortfolioMotionTiming = defaultMotionTimingForProfile(
  DEFAULT_MOTION_PROFILE
);

export const PORTFOLIO_GLOBAL_MOTION_PROFILE_OPTIONS: {
  value: PortfolioGlobalMotionProfile;
  label: string;
  description: string;
  /** Short trait chips shown under the card. */
  traits: string[];
  /** One-line recipe for the selected profile. */
  recipe: string;
}[] = [
  {
    value: 'none',
    label: 'Aucun',
    description: 'Pas d’animation d’entrée — rendu immédiat, le plus stable.',
    traits: ['Instantané', 'Stable'],
    recipe: 'Aucune entrée · aucun décalage',
  },
  {
    value: 'editorial',
    label: 'Éditorial',
    description: 'Fondu doux carte par carte, déplacement léger — lecture calme.',
    traits: ['Doux', 'Stagger', 'Geom fade'],
    recipe: '0,60s · stagger 70ms · 20px · fondu hero',
  },
  {
    value: 'dynamic',
    label: 'Dynamique',
    description: 'Entrée vive + lift au survol des cartes — plus réactif.',
    traits: ['Vif', 'Hover lift', 'Stagger'],
    recipe: '0,55s · stagger 75ms · 22px · hover −4px',
  },
  {
    value: 'cinematic',
    label: 'Cinématique',
    description: 'Entrées lentes, plus de parcours, fondu géométrique hero marqué.',
    traits: ['Lent', 'Large', 'Geom fade'],
    recipe: '0,85s · stagger 120ms · 28px · fondu hero',
  },
];

export function isMotionProfileActive(profile: PortfolioGlobalMotionProfile): boolean {
  return profile !== 'none';
}

export function motionProfileSupportsHover(profile: PortfolioGlobalMotionProfile): boolean {
  return profile === 'dynamic';
}

function clampTimingNumber(value: unknown, min: number, max: number, fallback: number): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.round(n * 1000) / 1000));
}

export function clampMotionTimingDelay(value: unknown, fallback = 0): number {
  return clampTimingNumber(value, MOTION_TIMING_DELAY_MIN, MOTION_TIMING_DELAY_MAX, fallback);
}

export function clampMotionTimingDuration(value: unknown, fallback = 0.6): number {
  return clampTimingNumber(value, MOTION_TIMING_DURATION_MIN, MOTION_TIMING_DURATION_MAX, fallback);
}

export function clampMotionTimingStagger(value: unknown, fallback = 0.07): number {
  return clampTimingNumber(value, MOTION_TIMING_STAGGER_MIN, MOTION_TIMING_STAGGER_MAX, fallback);
}

export function clampMotionTimingDistance(value: unknown, fallback = 20): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(MOTION_TIMING_DISTANCE_MAX, Math.max(MOTION_TIMING_DISTANCE_MIN, Math.round(n)));
}

export function clampMotionHoverLift(value: unknown, fallback = 4): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(MOTION_TIMING_HOVER_LIFT_MAX, Math.max(MOTION_TIMING_HOVER_LIFT_MIN, Math.round(n)));
}

export function clampMotionHoverShadowSize(value: unknown, fallback = 40): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(
    MOTION_TIMING_HOVER_SHADOW_SIZE_MAX,
    Math.max(MOTION_TIMING_HOVER_SHADOW_SIZE_MIN, Math.round(n))
  );
}

export function clampMotionHoverShadowOpacity(value: unknown, fallback = 35): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(
    MOTION_TIMING_HOVER_SHADOW_OPACITY_MAX,
    Math.max(MOTION_TIMING_HOVER_SHADOW_OPACITY_MIN, Math.round(n))
  );
}

function sanitizeMotionHex(value: unknown, fallback: string): string {
  return typeof value === 'string' && /^#[0-9a-fA-F]{6}$/.test(value) ? value : fallback;
}

function hexToRgba(hex: string, alpha: number): string {
  const raw = sanitizeMotionHex(hex, DEFAULT_MOTION_HOVER_SHADOW_COLOR).slice(1);
  const r = Number.parseInt(raw.slice(0, 2), 16);
  const g = Number.parseInt(raw.slice(2, 4), 16);
  const b = Number.parseInt(raw.slice(4, 6), 16);
  const a = Math.min(1, Math.max(0, alpha));
  return `rgba(${r},${g},${b},${Math.round(a * 1000) / 1000})`;
}

export function mergeMotionTiming(
  base: PortfolioMotionTiming,
  patch: unknown
): PortfolioMotionTiming {
  const seed = { ...base };
  if (!patch || typeof patch !== 'object' || Array.isArray(patch)) return seed;
  const record = patch as Record<string, unknown>;
  return {
    delay: clampMotionTimingDelay(record.delay, seed.delay),
    duration: clampMotionTimingDuration(record.duration, seed.duration),
    stagger: clampMotionTimingStagger(record.stagger, seed.stagger),
    distance: clampMotionTimingDistance(record.distance, seed.distance),
    hoverLift:
      'hoverLift' in record ? clampMotionHoverLift(record.hoverLift, seed.hoverLift) : seed.hoverLift,
    hoverShadowSize:
      'hoverShadowSize' in record
        ? clampMotionHoverShadowSize(record.hoverShadowSize, seed.hoverShadowSize)
        : seed.hoverShadowSize,
    hoverShadowColor:
      'hoverShadowColor' in record
        ? sanitizeMotionHex(record.hoverShadowColor, seed.hoverShadowColor)
        : seed.hoverShadowColor,
    hoverShadowOpacity:
      'hoverShadowOpacity' in record
        ? clampMotionHoverShadowOpacity(record.hoverShadowOpacity, seed.hoverShadowOpacity)
        : seed.hoverShadowOpacity,
  };
}

/** Resolve timing for a profile — uses stored overrides when active. */
export function resolveMotionTiming(
  profile: PortfolioGlobalMotionProfile,
  timing?: PortfolioMotionTiming | null
): PortfolioMotionTiming {
  if (!isMotionProfileActive(profile)) {
    return defaultMotionTimingForProfile('none');
  }
  const fallback = defaultMotionTimingForProfile(profile);
  if (!timing) return fallback;
  return mergeMotionTiming(fallback, timing);
}

export function motionProfileStaggerSeconds(
  profile: PortfolioGlobalMotionProfile,
  index: number,
  timing?: PortfolioMotionTiming | null
): number {
  if (!isMotionProfileActive(profile)) return 0;
  const resolved = resolveMotionTiming(profile, timing);
  return Math.min(index * resolved.stagger, MOTION_STAGGER_CAP_SECONDS);
}

export function motionProfileDurationSeconds(
  profile: PortfolioGlobalMotionProfile,
  timing?: PortfolioMotionTiming | null
): number {
  if (!isMotionProfileActive(profile)) return 0;
  return resolveMotionTiming(profile, timing).duration;
}

export function motionProfileBaseDelaySeconds(
  profile: PortfolioGlobalMotionProfile,
  timing?: PortfolioMotionTiming | null
): number {
  if (!isMotionProfileActive(profile)) return 0;
  return resolveMotionTiming(profile, timing).delay;
}

export function motionProfileEntryOffset(
  profile: PortfolioGlobalMotionProfile,
  timing?: PortfolioMotionTiming | null
): number {
  if (!isMotionProfileActive(profile)) return 0;
  return resolveMotionTiming(profile, timing).distance;
}

export function motionProfileHoverLift(
  profile: PortfolioGlobalMotionProfile,
  timing?: PortfolioMotionTiming | null
): number {
  if (!motionProfileSupportsHover(profile)) return 0;
  return resolveMotionTiming(profile, timing).hoverLift;
}

/** CSS box-shadow for Dynamique hover — size + color from timing. */
export function motionProfileHoverBoxShadow(
  profile: PortfolioGlobalMotionProfile,
  timing?: PortfolioMotionTiming | null
): string | undefined {
  if (!motionProfileSupportsHover(profile)) return undefined;
  const resolved = resolveMotionTiming(profile, timing);
  const size = resolved.hoverShadowSize;
  if (size <= 0 || resolved.hoverShadowOpacity <= 0) return undefined;
  const y = Math.round(size * 0.45);
  const spread = Math.round(-size * 0.6);
  const color = hexToRgba(resolved.hoverShadowColor, resolved.hoverShadowOpacity / 100);
  return `0 ${y}px ${size}px ${spread}px ${color}`;
}

export function formatMotionHoverRecipe(timing: PortfolioMotionTiming): string {
  const lift = clampMotionHoverLift(timing.hoverLift);
  const size = clampMotionHoverShadowSize(timing.hoverShadowSize);
  return `hover −${lift}px · ombre ${size}px`;
}

export function motionProfileItemHoverClass(profile: PortfolioGlobalMotionProfile): string {
  if (profile === 'dynamic') {
    return 'rounded-[inherit] transition duration-200 will-change-transform';
  }
  return '';
}

/** CSS enter classes for hero — only when a motion profile is active. */
export function motionProfileHeroEnterClass(profile: PortfolioGlobalMotionProfile): string {
  return isMotionProfileActive(profile) ? 'portfolio-hero-enter' : '';
}

export function motionProfileHeroImageEnterClass(profile: PortfolioGlobalMotionProfile): string {
  return isMotionProfileActive(profile) ? 'portfolio-hero-image-enter' : '';
}

export function motionProfileEnablesHeroGeomFade(profile: PortfolioGlobalMotionProfile): boolean {
  return profile === 'cinematic' || profile === 'editorial';
}

export function mergeMotionProfile(
  base: PortfolioGlobalMotionProfile,
  patch: unknown
): PortfolioGlobalMotionProfile {
  if (patch === 'none' || patch === 'editorial' || patch === 'dynamic' || patch === 'cinematic') {
    return patch;
  }
  return base;
}

/** Migrate legacy sectionReveal.enabled → editorial profile. */
export function resolveMotionProfileFromStorage(
  record: Record<string, unknown> | null,
  base: PortfolioGlobalMotionProfile
): PortfolioGlobalMotionProfile {
  const motionProfile = record?.motionProfile;
  if (
    motionProfile === 'none' ||
    motionProfile === 'editorial' ||
    motionProfile === 'dynamic' ||
    motionProfile === 'cinematic'
  ) {
    return motionProfile;
  }

  const legacyReveal = record?.sectionReveal;
  if (legacyReveal && typeof legacyReveal === 'object') {
    const enabled = (legacyReveal as Record<string, unknown>).enabled;
    if (enabled === true) return 'editorial';
  }

  return base;
}

export function formatMotionSeconds(value: number): string {
  return `${Math.round(value * 1000)}ms`;
}
