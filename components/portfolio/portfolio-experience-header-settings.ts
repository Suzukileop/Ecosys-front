import type { PortfolioExperienceHeaderFont } from '@/components/portfolio/portfolio-experience-settings';
import { msg } from '@/lib/i18n/config';

/**
 * Header — one shared, GSAP-animated header mounted above the Experience section, copied
 * 1:1 from the Portfolio/Work section's "Header" mechanism (chosen from 8 editorial
 * layouts). Independent of the section's own `layout` (which layout the members render in).
 */
export type PortfolioExperienceHeaderDesign =
  | 'none'
  | 'editorial'
  | 'marquee'
  | 'index'
  | 'accent-count'
  | 'serif-lead'
  | 'billboard'
  | 'masthead'
  | 'split-heading';

export type PortfolioExperienceHeaderDesignAlignment = 'left' | 'center' | 'right';

/** Bottom spacing under every Header design — one shared scale, same 4 steps everywhere. */
export type PortfolioExperienceHeaderMarginBottom = 'sm' | 'md' | 'lg' | 'xl';
export const EXPERIENCE_HEADER_MARGIN_BOTTOM_REM: Record<PortfolioExperienceHeaderMarginBottom, number> = {
  sm: 1.5,
  md: 2.5,
  lg: 4,
  xl: 6,
};

/** Title size/weight — one shared scale applied proportionally by every Header design. */
export type PortfolioExperienceHeaderTitleSize = 'sm' | 'md' | 'lg' | 'xl';
export type PortfolioExperienceHeaderTitleWeight = 'light' | 'regular' | 'semibold' | 'bold';

/** Per-element Header colors — real palette tokens only, no ad-hoc CTA/accent field. */
export type PortfolioExperienceHeaderPaletteToken = 'principal' | 'secondaire' | 'texteFort';

/** Accent count Header — its own 3-way alignment, independent of the shared left/center. */
export type PortfolioExperienceHeaderAccentCountAlignment = 'left' | 'center' | 'right';

/** Billboard Header — outline (stroke only), fill (solid color), or simple
 *  (solid color, no glow) big word. */
export type PortfolioExperienceHeaderBillboardWordStyle = 'outline' | 'fill' | 'simple';

export const EXPERIENCE_HEADER_DESIGNS: PortfolioExperienceHeaderDesign[] = [
  'none',
  'editorial',
  'marquee',
  'index',
  'accent-count',
  'serif-lead',
  'billboard',
  'masthead',
  'split-heading',
];

export const EXPERIENCE_HEADER_MARGIN_BOTTOM_STEPS: PortfolioExperienceHeaderMarginBottom[] = [
  'sm',
  'md',
  'lg',
  'xl',
];
export const EXPERIENCE_HEADER_TITLE_SIZES: PortfolioExperienceHeaderTitleSize[] = ['sm', 'md', 'lg', 'xl'];
export const EXPERIENCE_HEADER_TITLE_WEIGHTS: PortfolioExperienceHeaderTitleWeight[] = [
  'light',
  'regular',
  'semibold',
  'bold',
];
export const EXPERIENCE_HEADER_PALETTE_TOKENS: PortfolioExperienceHeaderPaletteToken[] = [
  'principal',
  'secondaire',
  'texteFort',
];
export const EXPERIENCE_HEADER_ACCENT_COUNT_ALIGNMENTS: PortfolioExperienceHeaderAccentCountAlignment[] = [
  'left',
  'center',
  'right',
];
export const EXPERIENCE_HEADER_BILLBOARD_WORD_STYLES: PortfolioExperienceHeaderBillboardWordStyle[] = [
  'outline',
  'fill',
  'simple',
];

/** Header designs — one shared, GSAP-animated header mounted above the Experience section. */
export const PORTFOLIO_EXPERIENCE_HEADER_DESIGN_OPTIONS: {
  value: PortfolioExperienceHeaderDesign;
  label: string;
  description: string;
}[] = [
  {
    value: 'editorial',
    label: msg('Editorial'),
    description: msg('Kicker + masked line-reveal title + subtitle — premium GSAP entrance.'),
  },
  {
    value: 'marquee',
    label: msg('Marquee'),
    description: msg('Bold title over a scrolling decorative word band.'),
  },
  {
    value: 'index',
    label: msg('Index'),
    description: msg('Ledger-style divider rule, a counting numeral, and the title split by a vertical rule.'),
  },
  {
    value: 'accent-count',
    label: msg('Accent count'),
    description: msg('Small accent badge with a live count, lead line, and title.'),
  },
  {
    value: 'serif-lead',
    label: msg('Serif lead'),
    description: msg('Small label above a large serif title.'),
  },
  {
    value: 'billboard',
    label: msg('Billboard'),
    description: msg('Big faint background word behind the title, with a count line.'),
  },
  {
    value: 'masthead',
    label: msg('Masthead'),
    description: msg('Monumental uppercase headline with an intro line underneath.'),
  },
  {
    value: 'split-heading',
    label: msg('Split heading'),
    description: msg('Title left with an editorial italic word, small label top-right.'),
  },
];

export const EXPERIENCE_HEADER_PALETTE_TOKEN_OPTIONS: {
  value: PortfolioExperienceHeaderPaletteToken;
  label: string;
  description: string;
}[] = [
  { value: 'principal', label: msg('Principal'), description: msg('Global principal token.') },
  { value: 'secondaire', label: msg('Secondary'), description: msg('Global secondary token.') },
  { value: 'texteFort', label: msg('Strong text'), description: msg('Strong ink token.') },
];

export const EXPERIENCE_HEADER_ACCENT_COUNT_ALIGNMENT_OPTIONS: {
  value: PortfolioExperienceHeaderAccentCountAlignment;
  label: string;
  description: string;
}[] = [
  { value: 'left', label: msg('Left'), description: msg('Default editorial alignment.') },
  { value: 'center', label: msg('Center'), description: msg('Centered line.') },
  { value: 'right', label: msg('Right'), description: msg('Right-aligned line.') },
];

export const EXPERIENCE_HEADER_BILLBOARD_WORD_STYLE_OPTIONS: {
  value: PortfolioExperienceHeaderBillboardWordStyle;
  label: string;
  description: string;
}[] = [
  { value: 'outline', label: msg('Outline'), description: msg('Stroke only, with a soft glow.') },
  { value: 'fill', label: msg('Fill'), description: msg('Solid characters, with a soft glow.') },
  { value: 'simple', label: msg('Simple'), description: msg('Solid characters, no glow — plain.') },
];

/** Resolves a palette-token choice to a concrete color — no free-form hex,
 *  every Header element bound to one of our actual palette colors. */
export function experienceHeaderPaletteTokenColor(token: PortfolioExperienceHeaderPaletteToken): string {
  if (token === 'secondaire') return 'var(--pf-palette-secondaire, #3b82f6)';
  if (token === 'texteFort') return 'var(--pf-palette-texte-fort, #f5f5f5)';
  return 'var(--pf-palette-principal, #f97316)';
}

export function experienceHeaderDesignFontClass(
  font: PortfolioExperienceHeaderFont,
  kind: 'title' | 'subtitle'
): string {
  if (kind === 'title') {
    switch (font) {
      case 'serif':
        return 'font-serif font-bold tracking-[-0.03em]';
      case 'display':
        return 'font-black uppercase tracking-[0.08em]';
      default:
        return 'font-extrabold tracking-[-0.04em]';
    }
  }
  switch (font) {
    case 'serif':
      return 'font-serif leading-relaxed';
    case 'display':
      return 'font-bold uppercase tracking-[0.12em]';
    default:
      return 'leading-relaxed';
  }
}


/* ---------------------------------------------------------------------------------------------
 * The header fields every section's presentation carries, described once (table-driven): the
 * type, the defaults and the merge below replace ~400 hand-written lines.
 * ------------------------------------------------------------------------------------------- */

const HEADER_TEXT_KEYS = [
  'headerAccentCountBadgeText',
  'headerAccentCountLeadText',
  'headerSerifLeadLabelText',
  'headerSerifLeadTitleText',
  'headerSerifLeadSubtitleText',
  'headerEditorialLabelText',
  'headerEditorialTitleText',
  'headerEditorialSubtitleText',
  'headerBillboardBigWord',
  'headerBillboardCountText',
  'headerBillboardTitleText',
  'headerSplitHeadingLabelText',
  'headerSplitHeadingTitleText',
  'headerMastheadLine1Text',
  'headerMastheadLine2Text',
  'headerMastheadLine3Text',
  'headerIndexLabelText',
  'headerIndexTitleText',
  'headerIndexCountLabelText',
  'headerIndexSubtitleText',
  'headerMarqueeWord1Text',
  'headerMarqueeWord2Text',
  'headerMarqueeWord3Text',
  'headerMarqueeWord4Text',
] as const;
const HEADER_COLOR_KEYS = [
  'headerAccentCountBadgeColor',
  'headerAccentCountLeadColor',
  'headerSerifLeadLabelColor',
  'headerSerifLeadTitleColor',
  'headerSerifLeadSubtitleColor',
  'headerEditorialLabelColor',
  'headerEditorialTitleColor',
  'headerEditorialSubtitleColor',
  'headerBillboardWordColor',
  'headerBillboardTitleColor',
  'headerBillboardMetaColor',
  'headerSplitHeadingTitleColor',
  'headerSplitHeadingLabelColor',
  'headerMastheadHeadlineColor',
  'headerIndexLabelColor',
  'headerIndexNumberColor',
  'headerIndexTitleColor',
  'headerIndexSubtitleColor',
  'headerMarqueeWordColor',
] as const;
const HEADER_SIZE_KEYS = [
  'headerTitleSize',
  'headerAccentCountSize',
  'headerSerifLeadLabelSize',
  'headerSerifLeadTitleSize',
  'headerSerifLeadSubtitleSize',
  'headerEditorialLabelSize',
  'headerEditorialTitleSize',
  'headerEditorialSubtitleSize',
  'headerSplitHeadingTitleSize',
  'headerSplitHeadingLabelSize',
  'headerMastheadHeadlineSize',
  'headerIndexLabelSize',
  'headerIndexTitleSize',
  'headerIndexSubtitleSize',
  'headerMarqueeSize',
] as const;
const HEADER_WEIGHT_KEYS = [
  'headerTitleWeight',
  'headerAccentCountWeight',
  'headerSerifLeadLabelWeight',
  'headerSerifLeadTitleWeight',
  'headerSerifLeadSubtitleWeight',
  'headerEditorialLabelWeight',
  'headerEditorialTitleWeight',
  'headerEditorialSubtitleWeight',
  'headerSplitHeadingTitleWeight',
  'headerSplitHeadingLabelWeight',
  'headerMastheadHeadlineWeight',
  'headerIndexLabelWeight',
  'headerIndexTitleWeight',
  'headerIndexSubtitleWeight',
] as const;

export type ExperienceHeaderFields = { [K in (typeof HEADER_TEXT_KEYS)[number]]: string } & {
  [K in (typeof HEADER_COLOR_KEYS)[number]]: PortfolioExperienceHeaderPaletteToken;
} & {
  [K in (typeof HEADER_SIZE_KEYS)[number]]: PortfolioExperienceHeaderTitleSize;
} & {
  [K in (typeof HEADER_WEIGHT_KEYS)[number]]: PortfolioExperienceHeaderTitleWeight;
} & {
  headerDesign: PortfolioExperienceHeaderDesign;
  headerAnimationEnabled: boolean;
  /** Header elements the owner hid, as `<design>.<element>` keys. Empty = everything shown. */
  headerHiddenElements: string[];
  headerDesignAlignment: PortfolioExperienceHeaderDesignAlignment;
  headerMarginBottom: PortfolioExperienceHeaderMarginBottom;
  headerAccentCountAlignment: PortfolioExperienceHeaderAccentCountAlignment;
  headerBillboardWordStyle: PortfolioExperienceHeaderBillboardWordStyle;
};

const COLOR_DEFAULTS: Record<string, PortfolioExperienceHeaderPaletteToken> = {
  headerAccentCountBadgeColor: 'principal',
  headerAccentCountLeadColor: 'secondaire',
  headerBillboardWordColor: 'principal',
  headerBillboardTitleColor: 'principal',
  headerBillboardMetaColor: 'secondaire',
  headerSplitHeadingTitleColor: 'principal',
  headerSplitHeadingLabelColor: 'secondaire',
  headerMastheadHeadlineColor: 'principal',
  headerIndexNumberColor: 'principal',
  headerMarqueeWordColor: 'principal',
};
const WEIGHT_DEFAULT: PortfolioExperienceHeaderTitleWeight = 'regular';

export const DEFAULT_EXPERIENCE_HEADER_FIELDS = {
  ...Object.fromEntries(HEADER_TEXT_KEYS.map((key) => [key, ''])),
  ...Object.fromEntries(HEADER_COLOR_KEYS.map((key) => [key, COLOR_DEFAULTS[key] ?? 'texteFort'])),
  ...Object.fromEntries(HEADER_SIZE_KEYS.map((key) => [key, 'md'])),
  ...Object.fromEntries(HEADER_WEIGHT_KEYS.map((key) => [key, WEIGHT_DEFAULT])),
  headerDesign: 'none',
  headerAnimationEnabled: true,
  headerHiddenElements: [],
  headerDesignAlignment: 'left',
  headerMarginBottom: 'md',
  headerAccentCountAlignment: 'left',
  headerBillboardWordStyle: 'outline',
} as unknown as ExperienceHeaderFields;

function pickOf<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}

/** Merges the header fields of `patch` over `base`; `mergeHidden` is the shared hidden-elements merger. */
export function mergeExperienceHeaderFields(
  base: Partial<ExperienceHeaderFields>,
  record: Record<string, unknown>,
  mergeHidden: (value: unknown, fallback: string[] | undefined) => string[]
): ExperienceHeaderFields {
  const out: Record<string, unknown> = {};
  const fallbackOf = (key: string) => (base as Record<string, unknown>)[key] ?? (DEFAULT_EXPERIENCE_HEADER_FIELDS as Record<string, unknown>)[key];
  for (const key of HEADER_TEXT_KEYS) {
    out[key] = typeof record[key] === 'string' ? record[key] : (fallbackOf(key) as string);
  }
  for (const key of HEADER_COLOR_KEYS) {
    out[key] = pickOf(record[key], EXPERIENCE_HEADER_PALETTE_TOKENS, fallbackOf(key) as PortfolioExperienceHeaderPaletteToken);
  }
  for (const key of HEADER_SIZE_KEYS) {
    out[key] = pickOf(record[key], EXPERIENCE_HEADER_TITLE_SIZES, fallbackOf(key) as PortfolioExperienceHeaderTitleSize);
  }
  for (const key of HEADER_WEIGHT_KEYS) {
    out[key] = pickOf(record[key], EXPERIENCE_HEADER_TITLE_WEIGHTS, fallbackOf(key) as PortfolioExperienceHeaderTitleWeight);
  }
  out.headerDesign = pickOf(record.headerDesign, EXPERIENCE_HEADER_DESIGNS, (fallbackOf('headerDesign') as PortfolioExperienceHeaderDesign) ?? 'none');
  out.headerAnimationEnabled = true;
  out.headerHiddenElements = mergeHidden(record.headerHiddenElements, base.headerHiddenElements);
  out.headerDesignAlignment = pickOf(record.headerDesignAlignment, ['left', 'center', 'right'] as const, fallbackOf('headerDesignAlignment') as PortfolioExperienceHeaderDesignAlignment);
  out.headerMarginBottom = pickOf(record.headerMarginBottom, EXPERIENCE_HEADER_MARGIN_BOTTOM_STEPS, fallbackOf('headerMarginBottom') as PortfolioExperienceHeaderMarginBottom);
  out.headerAccentCountAlignment = pickOf(record.headerAccentCountAlignment, EXPERIENCE_HEADER_ACCENT_COUNT_ALIGNMENTS, fallbackOf('headerAccentCountAlignment') as PortfolioExperienceHeaderAccentCountAlignment);
  out.headerBillboardWordStyle = pickOf(record.headerBillboardWordStyle, EXPERIENCE_HEADER_BILLBOARD_WORD_STYLES, fallbackOf('headerBillboardWordStyle') as PortfolioExperienceHeaderBillboardWordStyle);
  return out as ExperienceHeaderFields;
}
