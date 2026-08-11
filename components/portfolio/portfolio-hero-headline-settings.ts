import { formatSpecialiteHeadline } from '@/lib/english-indefinite-article';

export type PortfolioHeroHeadlineValue = 'specialty' | 'name';

export type PortfolioHeroHeadlineSettings = {
  heroHeadlinePrefix: string;
  heroHeadlineValue: PortfolioHeroHeadlineValue;
  /**
   * Optional single word (or short phrase) shown inline after the prefix —
   * e.g. “Hi, I’m” + “leopard” — with its own typography (color, highlight, underline).
   */
  heroHeadlineEmphasisWord: string;
};

export const DEFAULT_HERO_HEADLINE_PREFIX = "Hi, I'm";

export const DEFAULT_HERO_HEADLINE_SETTINGS: PortfolioHeroHeadlineSettings = {
  heroHeadlinePrefix: DEFAULT_HERO_HEADLINE_PREFIX,
  heroHeadlineValue: 'specialty',
  heroHeadlineEmphasisWord: '',
};

export const PORTFOLIO_HERO_HEADLINE_PREFIX_OPTIONS: {
  value: string;
  label: string;
  description: string;
}[] = [
  {
    value: "Hi, I'm",
    label: "Hi, I'm",
    description: 'Friendly English greeting — default.',
  },
  {
    value: "Hello, I'm",
    label: "Hello, I'm",
    description: 'Slightly more formal English opener.',
  },
  {
    value: "I'm",
    label: "I'm",
    description: 'Short and direct — role or name only.',
  },
];

export const PORTFOLIO_HERO_HEADLINE_VALUE_OPTIONS: {
  value: PortfolioHeroHeadlineValue;
  label: string;
  description: string;
}[] = [
  {
    value: 'specialty',
    label: 'Specialty',
    description: 'Your profile specialty, e.g. "a data scientist".',
  },
  {
    value: 'name',
    label: 'Last name',
    description: 'Family name only — without first name.',
  },
];

const MAX_HEADLINE_PREFIX_LENGTH = 80;
const MAX_HEADLINE_EMPHASIS_WORD_LENGTH = 40;

export function sanitizeHeroHeadlinePrefix(value: unknown, base: string): string {
  if (typeof value !== 'string') return base;
  const trimmed = value.trim().slice(0, MAX_HEADLINE_PREFIX_LENGTH);
  return trimmed || DEFAULT_HERO_HEADLINE_PREFIX;
}

export function sanitizeHeroHeadlineEmphasisWord(
  value: unknown,
  fallback: string = ''
): string {
  if (typeof value !== 'string') return fallback;
  return value.trim().slice(0, MAX_HEADLINE_EMPHASIS_WORD_LENGTH);
}

export function resolveHeroHeadlinePrefix(prefix: string): string {
  return sanitizeHeroHeadlinePrefix(prefix, DEFAULT_HERO_HEADLINE_PREFIX);
}

export function resolveHeroHeadlineEmphasisWord(word: string | undefined): string {
  return sanitizeHeroHeadlineEmphasisWord(word, '');
}

export function isPresetHeroHeadlinePrefix(prefix: string): boolean {
  const normalized = resolveHeroHeadlinePrefix(prefix);
  return PORTFOLIO_HERO_HEADLINE_PREFIX_OPTIONS.some((option) => option.value === normalized);
}

export function resolveHeroHeadlineAccent(params: {
  specialite?: string | null;
  fullName: string;
  nameAccent: string;
  valueSource: PortfolioHeroHeadlineValue;
}): string {
  if (params.valueSource === 'name') {
    const lastName = params.nameAccent?.trim();
    if (lastName) return lastName;
    return params.fullName.trim();
  }

  const nameFallback = params.nameAccent?.trim() || params.fullName.trim();
  return formatSpecialiteHeadline(params.specialite, nameFallback);
}

export function mergeHeroHeadlineSettings(
  base: PortfolioHeroHeadlineSettings,
  patch: unknown
): PortfolioHeroHeadlineSettings {
  if (!patch || typeof patch !== 'object') return base;
  const record = patch as Record<string, unknown>;
  const valueSource = record.heroHeadlineValue;

  return {
    heroHeadlinePrefix: sanitizeHeroHeadlinePrefix(record.heroHeadlinePrefix, base.heroHeadlinePrefix),
    heroHeadlineValue:
      valueSource === 'specialty' || valueSource === 'name' ? valueSource : base.heroHeadlineValue,
    heroHeadlineEmphasisWord: sanitizeHeroHeadlineEmphasisWord(
      record.heroHeadlineEmphasisWord !== undefined
        ? record.heroHeadlineEmphasisWord
        : base.heroHeadlineEmphasisWord,
      base.heroHeadlineEmphasisWord
    ),
  };
}
