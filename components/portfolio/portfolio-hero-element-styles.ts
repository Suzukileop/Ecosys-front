import type { CSSProperties } from 'react';
import type { PortfolioHeroPresentationSettings } from '@/components/portfolio/portfolio-hero-settings';
import type { PortfolioHeroCreatorNameFont, PortfolioHeroCreatorNameSize } from '@/components/portfolio/portfolio-hero-profile-settings';
import type { PortfolioHeroMetaValueSize } from '@/components/portfolio/portfolio-hero-meta-settings';
import {
  createElementTextStyle,
  elementTextInlineStyle,
  normalizeElementStylesRecord,
  patchElementStylesRecord,
  type PortfolioElementFont,
  type PortfolioElementTextSize,
  type PortfolioElementTextStyle,
} from '@/components/portfolio/portfolio-element-text-style';

export type PortfolioHeroStyleTarget =
  | 'headline'
  | 'headlinePrefix'
  | 'headlineEmphasis'
  | 'headlineAccent'
  | 'description'
  | 'availabilityText'
  | 'cta'
  | 'toolsLabel'
  | 'toolsCardTitle'
  | 'toolsCardDescription'
  | 'toolsCardLevel'
  | 'creatorName'
  | 'metaValue'
  | 'metaLabel';

export type PortfolioHeroElementStyles = Record<PortfolioHeroStyleTarget, PortfolioElementTextStyle>;

export const HERO_STYLE_TARGET_IDS: PortfolioHeroStyleTarget[] = [
  'headline',
  'headlinePrefix',
  'headlineEmphasis',
  'headlineAccent',
  'description',
  'availabilityText',
  'cta',
  'toolsLabel',
  'toolsCardTitle',
  'toolsCardDescription',
  'toolsCardLevel',
  'creatorName',
  'metaValue',
  'metaLabel',
];

export const DEFAULT_HERO_HEADLINE_ACCENT_COLOR = '#ea580c';
export const DEFAULT_HERO_HEADLINE_PREFIX_COLOR = '#737373';
export const DEFAULT_HERO_HEADLINE_EMPHASIS_COLOR = '#0a0a0a';
export const DEFAULT_HERO_DESCRIPTION_COLOR = '#737373';

export const DEFAULT_HERO_ELEMENT_STYLES: PortfolioHeroElementStyles = {
  headline: createElementTextStyle({ color: '#0a0a0a', size: 'xl', bold: true }),
  headlinePrefix: createElementTextStyle({
    color: DEFAULT_HERO_HEADLINE_PREFIX_COLOR,
    size: 'md',
    bold: true,
    // Respect typed casing (custom prefixes like "Hi, I'm leopard") — uppercase is optional via style controls.
    uppercase: false,
  }),
  headlineEmphasis: createElementTextStyle({
    color: DEFAULT_HERO_HEADLINE_EMPHASIS_COLOR,
    size: 'md',
    bold: true,
    uppercase: false,
    decoration: 'highlight',
    highlightColor: '#fdba74',
  }),
  headlineAccent: createElementTextStyle({
    color: DEFAULT_HERO_HEADLINE_ACCENT_COLOR,
    size: 'xl',
    bold: true,
  }),
  description: createElementTextStyle({ color: DEFAULT_HERO_DESCRIPTION_COLOR, size: 'md' }),
  availabilityText: createElementTextStyle({ color: '#166534', size: 'sm', bold: true }),
  cta: createElementTextStyle({ color: '#ffffff', size: 'sm', bold: true }),
  toolsLabel: createElementTextStyle({
    color: '#a3a3a3',
    size: 'sm',
    bold: true,
    uppercase: true,
  }),
  toolsCardTitle: createElementTextStyle({ color: '#0a0a0a', size: 'md', bold: true }),
  toolsCardDescription: createElementTextStyle({ color: '#737373', size: 'sm' }),
  toolsCardLevel: createElementTextStyle({
    color: '#a3a3a3',
    size: 'sm',
    bold: true,
    uppercase: true,
  }),
  creatorName: createElementTextStyle({ color: '#0a0a0a', size: 'md', bold: true }),
  metaValue: createElementTextStyle({ color: '#0a0a0a', size: 'md', bold: true }),
  metaLabel: createElementTextStyle({
    color: '#737373',
    size: 'sm',
    bold: true,
    uppercase: true,
  }),
};

export const PORTFOLIO_HERO_STYLE_TARGET_OPTIONS: {
  value: PortfolioHeroStyleTarget;
  label: string;
  description: string;
}[] = [
  { value: 'headline', label: 'Headline', description: 'Main h1 block (combined layout).' },
  { value: 'headlinePrefix', label: 'Headline prefix', description: '“Hi, I’m” line in split headline layout.' },
  {
    value: 'headlineEmphasis',
    label: 'Emphasis word',
    description: 'Single word inline after the prefix — color, highlight, underline.',
  },
  { value: 'headlineAccent', label: 'Headline accent', description: 'Specialty / name accent span.' },
  { value: 'description', label: 'Description', description: 'Pitch paragraph under the headline.' },
  { value: 'availabilityText', label: 'Availability', description: 'Badge label, background, and border.' },
  { value: 'cta', label: 'Contact CTA', description: 'Contact button label, background, and border.' },
  { value: 'toolsLabel', label: 'Tools', description: 'Tools caption and icon chip background / border.' },
  { value: 'toolsCardTitle', label: 'Card title', description: 'Tool card title typography.' },
  { value: 'toolsCardDescription', label: 'Card description', description: 'Tool card description typography.' },
  { value: 'toolsCardLevel', label: 'Card level', description: 'Tool card level typography.' },
  { value: 'creatorName', label: 'Creator name', description: 'Caption under the portrait.' },
  { value: 'metaValue', label: 'Stat value', description: 'Numbers on years / projects / location — plus card fill & border.' },
  { value: 'metaLabel', label: 'Stat label', description: '“Years exp.” captions — plus card fill & border.' },
];

function mapCreatorNameFont(font: PortfolioHeroCreatorNameFont): PortfolioElementFont {
  return font;
}

function mapCreatorNameSize(size: PortfolioHeroCreatorNameSize): PortfolioElementTextSize {
  return size;
}

function mapMetaValueSize(size: PortfolioHeroMetaValueSize): PortfolioElementTextSize {
  if (size === 'lg') return 'lg';
  if (size === 'sm') return 'sm';
  return 'md';
}

function mapElementSizeToCreatorName(size: PortfolioElementTextSize): PortfolioHeroCreatorNameSize {
  if (size === 'xl') return 'xl';
  if (size === 'lg') return 'lg';
  if (size === 'sm') return 'sm';
  return 'md';
}

function mapElementSizeToMetaValue(size: PortfolioElementTextSize): PortfolioHeroMetaValueSize {
  if (size === 'sm') return 'sm';
  if (size === 'lg' || size === 'xl') return 'lg';
  return 'md';
}

/** Defaults derived from legacy scalar typography fields (single migration source). */
export function buildHeroElementStyleDefaults(
  presentation: Pick<
    PortfolioHeroPresentationSettings,
    | 'creatorNameColor'
    | 'creatorNameSize'
    | 'creatorNameFont'
    | 'metaValueColor'
    | 'metaLabelColor'
    | 'metaValueSize'
    | 'availabilityTextColor'
  >
): PortfolioHeroElementStyles {
  return {
    ...DEFAULT_HERO_ELEMENT_STYLES,
    creatorName: createElementTextStyle({
      color: presentation.creatorNameColor,
      font: mapCreatorNameFont(presentation.creatorNameFont),
      size: mapCreatorNameSize(presentation.creatorNameSize),
      bold: true,
    }),
    metaValue: createElementTextStyle({
      color: presentation.metaValueColor,
      size: mapMetaValueSize(presentation.metaValueSize),
      bold: true,
    }),
    metaLabel: createElementTextStyle({
      color: presentation.metaLabelColor,
      size: 'sm',
      bold: true,
      uppercase: true,
    }),
    availabilityText: createElementTextStyle({
      color: presentation.availabilityTextColor,
      size: 'sm',
      bold: true,
    }),
  };
}

export function normalizeHeroElementStyles(
  raw: unknown,
  presentation: Pick<
    PortfolioHeroPresentationSettings,
    | 'creatorNameColor'
    | 'creatorNameSize'
    | 'creatorNameFont'
    | 'metaValueColor'
    | 'metaLabelColor'
    | 'metaValueSize'
    | 'availabilityTextColor'
  >
): PortfolioHeroElementStyles {
  const defaults = buildHeroElementStyleDefaults(presentation);
  const styles = normalizeElementStylesRecord(raw, defaults, HERO_STYLE_TARGET_IDS);
  // Prefix text casing comes from the typed string (e.g. "Hi, I'm leopard") — never CSS uppercase.
  return {
    ...styles,
    headlinePrefix: {
      ...styles.headlinePrefix,
      uppercase: false,
    },
  };
}

/**
 * Size relative to the parent h1 (`em`) so typography size controls stay visible
 * at hero scale. Absolute body/title utilities used to fight the display size.
 */
function heroHeadlinePartSizeClass(
  size: PortfolioElementTextSize,
  part: 'prefix' | 'emphasis' | 'accent',
  compact: boolean
): string {
  if (part === 'accent') {
    switch (size) {
      case 'sm':
        return 'text-[0.62em]';
      case 'md':
        return 'text-[0.78em]';
      case 'lg':
        return 'text-[0.9em]';
      default:
        return 'text-[1em]';
    }
  }
  // Split display fonts use a compact prefix line; other fonts stay near full h1 size.
  if (compact) {
    switch (size) {
      case 'sm':
        return 'text-[0.3em] tracking-[0.22em]';
      case 'md':
        return 'text-[0.42em] tracking-[0.2em]';
      case 'lg':
        return 'text-[0.55em] tracking-[0.14em]';
      default:
        return 'text-[0.7em] tracking-[0.1em]';
    }
  }
  switch (size) {
    case 'sm':
      return 'text-[0.72em]';
    case 'md':
      return 'text-[0.88em]';
    case 'lg':
      return 'text-[1em]';
    default:
      return 'text-[1.12em]';
  }
}

/** Color, size, font, and weight modifiers for headline spans (prefix / emphasis / accent). */
export function heroHeadlineTextModifiers(
  style: PortfolioElementTextStyle,
  options?: {
    forceNormalCase?: boolean;
    /** Which headline part — drives em-based size relative to the h1. */
    part?: 'prefix' | 'emphasis' | 'accent';
    /** Compact prefix line (split display fonts). */
    compact?: boolean;
  }
): {
  className: string;
  style: CSSProperties;
} {
  const part = options?.part ?? 'accent';
  const compact = options?.compact === true;
  const parts: string[] = [heroHeadlinePartSizeClass(style.size, part, compact)];
  if (style.font === 'serif') {
    parts.push('font-serif');
  } else if (style.font === 'display') {
    parts.push('font-serif tracking-tight');
  } else {
    parts.push('font-sans');
  }
  if (style.italic) parts.push('italic');
  if (style.bold) parts.push('font-bold');
  if (options?.forceNormalCase) {
    // Beat parent headline fonts that bake in `uppercase` (display / oswald / bebas / anton).
    parts.push('normal-case');
  } else if (style.uppercase) {
    parts.push('uppercase');
  }
  return {
    className: parts.join(' '),
    style: elementTextInlineStyle(style),
  };
}

export function patchHeroElementStyle(
  styles: PortfolioHeroElementStyles,
  target: PortfolioHeroStyleTarget,
  patch: Partial<PortfolioElementTextStyle>,
  presentation: Pick<
    PortfolioHeroPresentationSettings,
    | 'creatorNameColor'
    | 'creatorNameSize'
    | 'creatorNameFont'
    | 'metaValueColor'
    | 'metaLabelColor'
    | 'metaValueSize'
    | 'availabilityTextColor'
  >
): PortfolioHeroElementStyles {
  const defaults = buildHeroElementStyleDefaults(presentation);
  return patchElementStylesRecord(styles, target, patch, defaults, HERO_STYLE_TARGET_IDS);
}

/** Keep legacy scalar fields in sync when typography is edited from the unified panel. */
export function syncHeroLegacyTypographyFromElementStyles(
  styles: PortfolioHeroElementStyles
): Pick<
  PortfolioHeroPresentationSettings,
  | 'creatorNameColor'
  | 'creatorNameSize'
  | 'creatorNameFont'
  | 'metaValueColor'
  | 'metaLabelColor'
  | 'metaValueSize'
  | 'availabilityTextColor'
> {
  return {
    creatorNameColor: styles.creatorName.color,
    creatorNameSize: mapElementSizeToCreatorName(styles.creatorName.size),
    creatorNameFont: styles.creatorName.font as PortfolioHeroCreatorNameFont,
    metaValueColor: styles.metaValue.color,
    metaLabelColor: styles.metaLabel.color,
    metaValueSize: mapElementSizeToMetaValue(styles.metaValue.size),
    availabilityTextColor: styles.availabilityText.color,
  };
}

/** When legacy portrait / stats fields change, refresh matching element styles. */
export function syncHeroElementStylesFromLegacyPatch(
  styles: PortfolioHeroElementStyles,
  patch: unknown,
  presentation: PortfolioHeroPresentationSettings
): PortfolioHeroElementStyles {
  if (!patch || typeof patch !== 'object') return styles;
  const record = patch as Record<string, unknown>;
  const defaults = buildHeroElementStyleDefaults(presentation);
  let next: PortfolioHeroElementStyles = { ...styles };

  if (
    'creatorNameColor' in record ||
    'creatorNameSize' in record ||
    'creatorNameFont' in record
  ) {
    next = { ...next, creatorName: defaults.creatorName };
  }
  if ('metaValueColor' in record || 'metaValueSize' in record) {
    next = { ...next, metaValue: defaults.metaValue };
  }
  if ('metaLabelColor' in record) {
    next = { ...next, metaLabel: defaults.metaLabel };
  }
  if ('availabilityTextColor' in record) {
    next = { ...next, availabilityText: defaults.availabilityText };
  }

  return normalizeHeroElementStyles(next, presentation);
}
