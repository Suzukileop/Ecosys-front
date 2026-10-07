/**
 * Ultra-wide column grid for vertical hero divisions (xl+).
 * Lets copy / visual element units sit in 1, 2, or 3 columns with auto-placement.
 */

export type HeroUltraWideColumnCount = 1 | 2 | 3;

export type HeroCopyColumnSlot =
  | 'availability'
  | 'headline'
  | 'description'
  | 'tools'
  | 'cta';

export type HeroVisualColumnSlot = 'portrait' | 'stats';

export type HeroColumnIndex = 1 | 2 | 3;

export type HeroUltraWideColumnLayout = {
  /** Number of columns on xl+ when screen division is vertical. */
  columns: HeroUltraWideColumnCount;
  copySlots: Record<HeroCopyColumnSlot, HeroColumnIndex>;
  visualSlots: Record<HeroVisualColumnSlot, HeroColumnIndex>;
};

const HERO_COPY_COLUMN_SLOT_OPTIONS: {
  value: HeroCopyColumnSlot;
  label: string;
}[] = [
  { value: 'availability', label: 'Availability' },
  { value: 'headline', label: 'Headline' },
  { value: 'description', label: 'Description' },
  { value: 'tools', label: 'Tools' },
  { value: 'cta', label: 'Contact CTA' },
];

const HERO_VISUAL_COLUMN_SLOT_OPTIONS: {
  value: HeroVisualColumnSlot;
  label: string;
}[] = [
  { value: 'portrait', label: 'Portrait' },
  { value: 'stats', label: 'Stats' },
];

const ALL_IN_ONE: HeroUltraWideColumnLayout = {
  columns: 1,
  copySlots: {
    availability: 1,
    headline: 1,
    description: 1,
    tools: 1,
    cta: 1,
  },
  visualSlots: {
    portrait: 1,
    stats: 1,
  },
};

export const DEFAULT_HERO_ULTRAWIDE_COLUMN_LAYOUT: HeroUltraWideColumnLayout = {
  ...ALL_IN_ONE,
  copySlots: { ...ALL_IN_ONE.copySlots },
  visualSlots: { ...ALL_IN_ONE.visualSlots },
};

function clampColumn(value: unknown, max: HeroUltraWideColumnCount): HeroColumnIndex {
  const n = typeof value === 'number' ? Math.round(value) : 1;
  if (n >= 3 && max >= 3) return 3;
  if (n >= 2 && max >= 2) return 2;
  return 1;
}

function sanitizeSlots<T extends string>(
  value: unknown,
  keys: T[],
  max: HeroUltraWideColumnCount,
  fallback: Record<T, HeroColumnIndex>
): Record<T, HeroColumnIndex> {
  const record =
    value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  const next = { ...fallback };
  for (const key of keys) {
    next[key] = clampColumn(record[key] ?? fallback[key], max);
  }
  return next;
}

export function sanitizeHeroUltraWideColumnLayout(
  value: unknown,
  fallback: HeroUltraWideColumnLayout = DEFAULT_HERO_ULTRAWIDE_COLUMN_LAYOUT
): HeroUltraWideColumnLayout {
  if (!value || typeof value !== 'object') {
    return {
      columns: fallback.columns,
      copySlots: { ...fallback.copySlots },
      visualSlots: { ...fallback.visualSlots },
    };
  }
  const record = value as Record<string, unknown>;
  const columns: HeroUltraWideColumnCount =
    record.columns === 3 || record.columns === 2 || record.columns === 1
      ? record.columns
      : fallback.columns;

  return {
    columns,
    copySlots: sanitizeSlots(
      record.copySlots,
      HERO_COPY_COLUMN_SLOT_OPTIONS.map((o) => o.value),
      columns,
      fallback.copySlots
    ),
    visualSlots: sanitizeSlots(
      record.visualSlots,
      HERO_VISUAL_COLUMN_SLOT_OPTIONS.map((o) => o.value),
      columns,
      fallback.visualSlots
    ),
  };
}
