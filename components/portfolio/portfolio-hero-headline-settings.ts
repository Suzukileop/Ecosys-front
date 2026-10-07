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

const DEFAULT_HERO_HEADLINE_PREFIX = "Hi, I'm";

export const DEFAULT_HERO_HEADLINE_SETTINGS: PortfolioHeroHeadlineSettings = {
  heroHeadlinePrefix: DEFAULT_HERO_HEADLINE_PREFIX,
  heroHeadlineValue: 'specialty',
  heroHeadlineEmphasisWord: '',
};

const MAX_HEADLINE_PREFIX_LENGTH = 80;
const MAX_HEADLINE_EMPHASIS_WORD_LENGTH = 40;

function sanitizeHeroHeadlinePrefix(value: unknown, base: string): string {
  if (typeof value !== 'string') return base;
  const trimmed = value.trim().slice(0, MAX_HEADLINE_PREFIX_LENGTH);
  return trimmed || DEFAULT_HERO_HEADLINE_PREFIX;
}

function sanitizeHeroHeadlineEmphasisWord(
  value: unknown,
  fallback: string = ''
): string {
  if (typeof value !== 'string') return fallback;
  return value.trim().slice(0, MAX_HEADLINE_EMPHASIS_WORD_LENGTH);
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
