import type { PortfolioHeroPresentationSettings } from '@/components/portfolio/portfolio-hero-settings';
import type { PortfolioHeroCreatorNameFont, PortfolioHeroCreatorNameSize } from '@/components/portfolio/portfolio-hero-profile-settings';
import type { PortfolioHeroMetaValueSize } from '@/components/portfolio/portfolio-hero-meta-settings';
import { createElementTextStyle, normalizeElementStylesRecord, type PortfolioElementFont, type PortfolioElementTextSize, type PortfolioElementTextStyle } from '@/components/portfolio/portfolio-element-text-style';

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

const HERO_STYLE_TARGET_IDS: PortfolioHeroStyleTarget[] = [
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

const DEFAULT_HERO_HEADLINE_ACCENT_COLOR = '#ea580c';
const DEFAULT_HERO_HEADLINE_PREFIX_COLOR = '#737373';
const DEFAULT_HERO_HEADLINE_EMPHASIS_COLOR = '#0a0a0a';
const DEFAULT_HERO_DESCRIPTION_COLOR = '#737373';

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
function buildHeroElementStyleDefaults(
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
