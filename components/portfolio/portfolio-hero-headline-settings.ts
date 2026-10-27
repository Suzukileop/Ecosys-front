export type PortfolioHeroHeadlineValue = 'specialty' | 'name';

export type PortfolioHeroHeadlineSettings = {
  /** Full greeting template per banner; an empty entry keeps that design's original text. */
  heroGreetingOverrides?: Record<string,string>;
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
    heroGreetingOverrides: record.heroGreetingOverrides&&typeof record.heroGreetingOverrides==='object'&&!Array.isArray(record.heroGreetingOverrides)?Object.fromEntries(Object.entries(record.heroGreetingOverrides).filter(([key,value])=>key.length<80&&typeof value==='string').map(([key,value])=>[key,(value as string).slice(0,500)])):base.heroGreetingOverrides??{},
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
export function resolveHeroGreeting(presentation:{heroBannerDesign:string;heroGreetingOverrides?:Record<string,string>},fallback:string,name:string,specialty=''):string{
 const template=presentation.heroGreetingOverrides?.[presentation.heroBannerDesign]?.trim();
 if(!template)return fallback;
 return template.replace(/\{(name|specialty)\}/g,(_,token)=>token==='name'?name:specialty);
}
