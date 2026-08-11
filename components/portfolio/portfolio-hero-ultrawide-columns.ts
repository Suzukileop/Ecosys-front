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

export const HERO_COPY_COLUMN_SLOT_OPTIONS: {
  value: HeroCopyColumnSlot;
  label: string;
}[] = [
  { value: 'availability', label: 'Availability' },
  { value: 'headline', label: 'Headline' },
  { value: 'description', label: 'Description' },
  { value: 'tools', label: 'Tools' },
  { value: 'cta', label: 'Contact CTA' },
];

export const HERO_VISUAL_COLUMN_SLOT_OPTIONS: {
  value: HeroVisualColumnSlot;
  label: string;
}[] = [
  { value: 'portrait', label: 'Portrait' },
  { value: 'stats', label: 'Stats' },
];

export const PORTFOLIO_HERO_ULTRAWIDE_COLUMN_OPTIONS: {
  value: HeroUltraWideColumnCount;
  label: string;
  description: string;
}[] = [
  {
    value: 1,
    label: '1 column',
    description: 'Single centered stack — default vertical layout.',
  },
  {
    value: 2,
    label: '2 columns',
    description: 'Split each unit across two columns on desktop (xl+).',
  },
  {
    value: 3,
    label: '3 columns',
    description: 'Spread elements across three columns on desktop (xl+).',
  },
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

/**
 * Automatic placement when the column count changes — spreads copy / visual
 * units so side columns are used on 2–3 column ultra-wide grids.
 */
export function autoPlaceHeroUltraWideSlots(
  columns: HeroUltraWideColumnCount
): HeroUltraWideColumnLayout {
  if (columns === 1) {
    return {
      columns: 1,
      copySlots: { ...ALL_IN_ONE.copySlots },
      visualSlots: { ...ALL_IN_ONE.visualSlots },
    };
  }

  if (columns === 2) {
    return {
      columns: 2,
      copySlots: {
        availability: 1,
        headline: 1,
        description: 1,
        tools: 2,
        cta: 2,
      },
      visualSlots: {
        portrait: 1,
        stats: 2,
      },
    };
  }

  return {
    columns: 3,
    copySlots: {
      availability: 1,
      headline: 2,
      description: 2,
      tools: 3,
      cta: 3,
    },
    visualSlots: {
      portrait: 1,
      stats: 3,
    },
  };
}

export function applyHeroUltraWideColumns(
  current: HeroUltraWideColumnLayout | undefined,
  columns: HeroUltraWideColumnCount
): HeroUltraWideColumnLayout {
  const base = sanitizeHeroUltraWideColumnLayout(current);
  if (base.columns === columns) return base;
  return autoPlaceHeroUltraWideSlots(columns);
}

/** Tailwind grid column class for xl+ (vertical multi-column layouts). */
export function heroUltraWideColClass(
  column: HeroColumnIndex,
  total: HeroUltraWideColumnCount
): string {
  if (total <= 1) return '';
  const start = Math.min(column, total) as HeroColumnIndex;
  const map: Record<HeroColumnIndex, string> = {
    1: 'xl:col-start-1',
    2: 'xl:col-start-2',
    3: 'xl:col-start-3',
  };
  return map[start];
}

export function heroUltraWideGridClass(columns: HeroUltraWideColumnCount): string {
  if (columns === 3) return 'xl:grid-cols-3 xl:gap-x-10 xl:gap-y-8';
  if (columns === 2) return 'xl:grid-cols-2 xl:gap-x-10 xl:gap-y-8';
  return '';
}

export function resolveHeroUltraWideColumnLayout(
  presentation: { heroUltraWideColumns?: HeroUltraWideColumnLayout }
): HeroUltraWideColumnLayout {
  return sanitizeHeroUltraWideColumnLayout(presentation.heroUltraWideColumns);
}
