/**
 * Services & Skills palette — same 8 semantic tokens as Hero / Work / Nav.
 * Concrete hex fields still drive render; bindings choose which token paints each slot.
 */

import {
  computeLightPalette,
  DEFAULT_HERO_PALETTE,
  HERO_PALETTE_TOKEN_IDS,
  mergeHeroPalette,
  resolveHeroPaletteColor,
  type HeroPaletteTokenId,
  type PortfolioHeroPalette,
} from '@/components/portfolio/portfolio-hero-palette-settings';
import type { PortfolioElementTextStyle } from '@/components/portfolio/portfolio-element-text-style';

/** Local mirrors — avoid importing portfolio-services-settings (circular TDZ). */
export type ServicesElementStyleTarget =
  | 'blockSubheading'
  | 'cardTitle'
  | 'cardBody'
  | 'price'
  | 'delivery'
  | 'tasks'
  | 'skillTitle'
  | 'skillBody'
  | 'cta';

type ServicesElementStyles = Record<ServicesElementStyleTarget, PortfolioElementTextStyle>;

type ServicesElementChromeId =
  | 'cardTitle'
  | 'cardBody'
  | 'skillTitle'
  | 'skillBody'
  | 'price'
  | 'delivery'
  | 'tasks';

type ServicesElementChromeSettings = {
  enabled: boolean;
  backgroundEnabled: boolean;
  backgroundColor: string;
  border: string;
  borderColor: string;
  borderRadius: string;
  padding: string;
  margin: string;
};

type ServicesElementChromes = Record<ServicesElementChromeId, ServicesElementChromeSettings>;

const DEFAULT_SERVICES_ELEMENT_CHROME_MIRROR: ServicesElementChromeSettings = {
  enabled: false,
  backgroundEnabled: true,
  backgroundColor: '#fafafa',
  border: 'none',
  borderColor: '#e5e5e5',
  borderRadius: 'md',
  padding: 'sm',
  margin: 'none',
};

const DEFAULT_SERVICES_ELEMENT_CHROMES_MIRROR: ServicesElementChromes = {
  cardTitle: { ...DEFAULT_SERVICES_ELEMENT_CHROME_MIRROR },
  cardBody: { ...DEFAULT_SERVICES_ELEMENT_CHROME_MIRROR },
  skillTitle: { ...DEFAULT_SERVICES_ELEMENT_CHROME_MIRROR },
  skillBody: { ...DEFAULT_SERVICES_ELEMENT_CHROME_MIRROR },
  price: { ...DEFAULT_SERVICES_ELEMENT_CHROME_MIRROR },
  delivery: { ...DEFAULT_SERVICES_ELEMENT_CHROME_MIRROR },
  tasks: { ...DEFAULT_SERVICES_ELEMENT_CHROME_MIRROR },
};

export type PortfolioServicesPalette = PortfolioHeroPalette;

export type ServicesColorSlot =
  | 'sectionBackground'
  | 'sectionGradientFrom'
  | 'sectionGradientTo'
  | 'sectionSplitA'
  | 'sectionSplitB'
  | 'sectionDivider'
  | 'title'
  | 'subtitle'
  | 'cardBorder'
  | 'cardBackground'
  | 'cardAccent'
  | 'ctaAccent'
  | 'ctaBorder'
  | 'ctaHoverBackground'
  | 'ctaHoverText'
  | 'ctaHoverBorder'
  | 'stageBackground'
  | 'stageBorder'
  | 'stagePattern'
  | 'blockSubheading'
  | 'cardTitle'
  | 'cardBody'
  | 'price'
  | 'delivery'
  | 'tasks'
  | 'tasksBullet'
  | 'skillTitle'
  | 'skillBody'
  | 'cardTitleChromeBackground'
  | 'cardTitleChromeBorder'
  | 'cardBodyChromeBackground'
  | 'cardBodyChromeBorder'
  | 'skillTitleChromeBackground'
  | 'skillTitleChromeBorder'
  | 'skillBodyChromeBackground'
  | 'skillBodyChromeBorder'
  | 'priceChromeBackground'
  | 'priceChromeBorder'
  | 'deliveryChromeBackground'
  | 'deliveryChromeBorder'
  | 'tasksChromeBackground'
  | 'tasksChromeBorder';

export type PortfolioServicesColorBindings = Record<ServicesColorSlot, HeroPaletteTokenId>;

type ServicesPresentationColorFields = {
  sectionBackgroundColor?: string;
  sectionBackgroundGradientFrom?: string;
  sectionBackgroundGradientTo?: string;
  sectionBackgroundColorA?: string;
  sectionBackgroundColorB?: string;
  sectionBackgroundDividerColor?: string;
  titleColor?: string;
  subtitleColor?: string;
  cardBorderColor?: string;
  cardBackgroundColor?: string;
  cardBackgroundEnabled?: boolean;
  cardBackgroundFill?: 'solid' | 'split';
  cardAccentColor?: string;
  servicesTaskBulletColor?: string;
  ctaColor?: string;
  ctaBorderColor?: string;
  ctaHoverBackgroundColor?: string;
  ctaHoverTextColor?: string;
  ctaHoverBorderColor?: string;
  stageBackgroundColor?: string;
  stageBorderColor?: string;
  stagePatternColor?: string;
  useHeroPalette?: boolean;
  servicesPalette?: PortfolioServicesPalette;
  servicesColorBindings?: PortfolioServicesColorBindings;
  elementStyles?: ServicesElementStyles;
  elementChromes?: ServicesElementChromes;
  skillsHeader?: { titleColor?: string; subtitleColor?: string };
  servicesHeader?: { titleColor?: string; subtitleColor?: string };
};

export const SERVICES_COLOR_SLOT_IDS: ServicesColorSlot[] = [
  'sectionBackground',
  'sectionGradientFrom',
  'sectionGradientTo',
  'sectionSplitA',
  'sectionSplitB',
  'sectionDivider',
  'title',
  'subtitle',
  'cardBorder',
  'cardBackground',
  'cardAccent',
  'ctaAccent',
  'ctaBorder',
  'ctaHoverBackground',
  'ctaHoverText',
  'ctaHoverBorder',
  'stageBackground',
  'stageBorder',
  'stagePattern',
  'blockSubheading',
  'cardTitle',
  'cardBody',
  'price',
  'delivery',
  'tasks',
  'tasksBullet',
  'skillTitle',
  'skillBody',
  'cardTitleChromeBackground',
  'cardTitleChromeBorder',
  'cardBodyChromeBackground',
  'cardBodyChromeBorder',
  'skillTitleChromeBackground',
  'skillTitleChromeBorder',
  'skillBodyChromeBackground',
  'skillBodyChromeBorder',
  'priceChromeBackground',
  'priceChromeBorder',
  'deliveryChromeBackground',
  'deliveryChromeBorder',
  'tasksChromeBackground',
  'tasksChromeBorder',
];

export const PORTFOLIO_SERVICES_COLOR_SLOT_OPTIONS: {
  value: ServicesColorSlot;
  label: string;
  description: string;
}[] = [
  { value: 'sectionBackground', label: 'Section background', description: 'Solid section fill.' },
  { value: 'sectionGradientFrom', label: 'Gradient start', description: 'Start of the section gradient.' },
  { value: 'sectionGradientTo', label: 'Gradient end', description: 'End of the section gradient.' },
  { value: 'sectionSplitA', label: 'Split zone A', description: 'First split background zone.' },
  { value: 'sectionSplitB', label: 'Split zone B', description: 'Second split background zone.' },
  { value: 'sectionDivider', label: 'Split divider', description: 'Line between split zones.' },
  { value: 'title', label: 'Section title', description: 'Services & Skills heading.' },
  { value: 'subtitle', label: 'Section subtitle', description: 'Intro under the title.' },
  { value: 'cardBorder', label: 'Card border', description: 'Outline around skill / service cards.' },
  { value: 'cardBackground', label: 'Card background', description: 'Fill behind card content.' },
  { value: 'cardAccent', label: 'Card accent', description: 'Accent bars, checks, price emphasis.' },
  {
    value: 'ctaAccent',
    label: 'CTA accent',
    description: 'Commander button fill / outline — same idea as Portfolio View project.',
  },
  { value: 'ctaBorder', label: 'CTA border', description: 'Outline on the Commander button.' },
  { value: 'ctaHoverBackground', label: 'CTA hover fill', description: 'Button background on hover.' },
  { value: 'ctaHoverText', label: 'CTA hover text', description: 'Button label on hover.' },
  { value: 'ctaHoverBorder', label: 'CTA hover border', description: 'Button outline on hover.' },
  { value: 'stageBackground', label: 'Stage background', description: 'Outer framed stage fill.' },
  { value: 'stageBorder', label: 'Stage border', description: 'Outer framed stage outline.' },
  { value: 'stagePattern', label: 'Stage pattern', description: 'Decorative stage pattern ink.' },
  { value: 'blockSubheading', label: 'Block subheading', description: '“Tools” / “Services” labels.' },
  { value: 'cardTitle', label: 'Service title', description: 'Title on service / pricing cards.' },
  { value: 'cardBody', label: 'Service body', description: 'Description on service cards.' },
  { value: 'price', label: 'Price', description: 'Price / “from” amount.' },
  { value: 'delivery', label: 'Delivery', description: 'Delivery line on service cards.' },
  { value: 'tasks', label: 'Tasks', description: 'Deliverable checklist on service cards.' },
  {
    value: 'tasksBullet',
    label: 'Task bullet',
    description: 'Color of the checklist marker before each task.',
  },
  { value: 'skillTitle', label: 'Skill title', description: 'Tool name on skill cards.' },
  { value: 'skillBody', label: 'Skill body', description: 'Description on skill cards.' },
  {
    value: 'cardTitleChromeBackground',
    label: 'Service title background',
    description: 'Fill behind the service title when element chrome is on.',
  },
  {
    value: 'cardTitleChromeBorder',
    label: 'Service title border',
    description: 'Border on the service title chrome.',
  },
  {
    value: 'cardBodyChromeBackground',
    label: 'Service body background',
    description: 'Fill behind the service description chrome.',
  },
  {
    value: 'cardBodyChromeBorder',
    label: 'Service body border',
    description: 'Border on the service description chrome.',
  },
  {
    value: 'skillTitleChromeBackground',
    label: 'Skill title background',
    description: 'Fill behind the skill title when element chrome is on.',
  },
  {
    value: 'skillTitleChromeBorder',
    label: 'Skill title border',
    description: 'Border on the skill title chrome.',
  },
  {
    value: 'skillBodyChromeBackground',
    label: 'Skill body background',
    description: 'Fill behind the skill description chrome.',
  },
  {
    value: 'skillBodyChromeBorder',
    label: 'Skill body border',
    description: 'Border on the skill description chrome.',
  },
  {
    value: 'priceChromeBackground',
    label: 'Price background',
    description: 'Fill behind the price when element chrome is on.',
  },
  {
    value: 'priceChromeBorder',
    label: 'Price border',
    description: 'Border on the price chrome.',
  },
  {
    value: 'deliveryChromeBackground',
    label: 'Delivery background',
    description: 'Fill behind the delivery line when element chrome is on.',
  },
  {
    value: 'deliveryChromeBorder',
    label: 'Delivery border',
    description: 'Border on the delivery chrome.',
  },
  {
    value: 'tasksChromeBackground',
    label: 'Tasks background',
    description: 'Fill behind the tasks list when element chrome is on.',
  },
  {
    value: 'tasksChromeBorder',
    label: 'Tasks border',
    description: 'Border on the tasks chrome.',
  },
];

export const DARK_SERVICES_PALETTE: PortfolioServicesPalette = { ...DEFAULT_HERO_PALETTE };
export const DEFAULT_SERVICES_PALETTE: PortfolioServicesPalette = { ...DARK_SERVICES_PALETTE };

export function computeLightServicesPalette(
  dark: Partial<PortfolioServicesPalette>
): PortfolioServicesPalette {
  return computeLightPalette(mergeHeroPalette(DARK_SERVICES_PALETTE, dark));
}

/** Default token bindings — card text slots map to texteFort / texteMuted. */
export const DEFAULT_SERVICES_COLOR_BINDINGS: PortfolioServicesColorBindings = {
  sectionBackground: 'fond',
  sectionGradientFrom: 'fond',
  sectionGradientTo: 'neutre',
  sectionSplitA: 'fond',
  sectionSplitB: 'neutre',
  sectionDivider: 'bordure',
  title: 'principal',
  subtitle: 'texteMuted',
  cardBorder: 'bordure',
  cardBackground: 'neutre',
  cardAccent: 'principal',
  ctaAccent: 'principal',
  ctaBorder: 'bordure',
  ctaHoverBackground: 'principal',
  ctaHoverText: 'fond',
  ctaHoverBorder: 'principal',
  stageBackground: 'neutre',
  stageBorder: 'bordure',
  stagePattern: 'texteFaint',
  blockSubheading: 'texteFaint',
  cardTitle: 'texteFort',
  cardBody: 'texteMuted',
  price: 'texteFort',
  delivery: 'texteMuted',
  tasks: 'texteMuted',
  tasksBullet: 'principal',
  skillTitle: 'texteFort',
  skillBody: 'texteMuted',
  cardTitleChromeBackground: 'neutre',
  cardTitleChromeBorder: 'bordure',
  cardBodyChromeBackground: 'neutre',
  cardBodyChromeBorder: 'bordure',
  skillTitleChromeBackground: 'neutre',
  skillTitleChromeBorder: 'bordure',
  skillBodyChromeBackground: 'neutre',
  skillBodyChromeBorder: 'bordure',
  priceChromeBackground: 'neutre',
  priceChromeBorder: 'bordure',
  deliveryChromeBackground: 'neutre',
  deliveryChromeBorder: 'bordure',
  tasksChromeBackground: 'neutre',
  tasksChromeBorder: 'bordure',
};

const SERVICES_SLOT_TO_FIELD: Record<ServicesColorSlot, string> = {
  sectionBackground: 'sectionBackgroundColor',
  sectionGradientFrom: 'sectionBackgroundGradientFrom',
  sectionGradientTo: 'sectionBackgroundGradientTo',
  sectionSplitA: 'sectionBackgroundColorA',
  sectionSplitB: 'sectionBackgroundColorB',
  sectionDivider: 'sectionBackgroundDividerColor',
  title: 'titleColor',
  subtitle: 'subtitleColor',
  cardBorder: 'cardBorderColor',
  cardBackground: 'cardBackgroundColor',
  cardAccent: 'cardAccentColor',
  ctaAccent: 'ctaColor',
  ctaBorder: 'ctaBorderColor',
  ctaHoverBackground: 'ctaHoverBackgroundColor',
  ctaHoverText: 'ctaHoverTextColor',
  ctaHoverBorder: 'ctaHoverBorderColor',
  stageBackground: 'stageBackgroundColor',
  stageBorder: 'stageBorderColor',
  stagePattern: 'stagePatternColor',
  blockSubheading: 'elementStyles.blockSubheading.color',
  cardTitle: 'elementStyles.cardTitle.color',
  cardBody: 'elementStyles.cardBody.color',
  price: 'elementStyles.price.color',
  delivery: 'elementStyles.delivery.color',
  tasks: 'elementStyles.tasks.color',
  tasksBullet: 'servicesTaskBulletColor',
  skillTitle: 'elementStyles.skillTitle.color',
  skillBody: 'elementStyles.skillBody.color',
  cardTitleChromeBackground: 'elementChromes.cardTitle.backgroundColor',
  cardTitleChromeBorder: 'elementChromes.cardTitle.borderColor',
  cardBodyChromeBackground: 'elementChromes.cardBody.backgroundColor',
  cardBodyChromeBorder: 'elementChromes.cardBody.borderColor',
  skillTitleChromeBackground: 'elementChromes.skillTitle.backgroundColor',
  skillTitleChromeBorder: 'elementChromes.skillTitle.borderColor',
  skillBodyChromeBackground: 'elementChromes.skillBody.backgroundColor',
  skillBodyChromeBorder: 'elementChromes.skillBody.borderColor',
  priceChromeBackground: 'elementChromes.price.backgroundColor',
  priceChromeBorder: 'elementChromes.price.borderColor',
  deliveryChromeBackground: 'elementChromes.delivery.backgroundColor',
  deliveryChromeBorder: 'elementChromes.delivery.borderColor',
  tasksChromeBackground: 'elementChromes.tasks.backgroundColor',
  tasksChromeBorder: 'elementChromes.tasks.borderColor',
};

const SERVICES_ELEMENT_STYLE_SLOT: Partial<Record<ServicesColorSlot, ServicesElementStyleTarget>> = {
  blockSubheading: 'blockSubheading',
  cardTitle: 'cardTitle',
  cardBody: 'cardBody',
  price: 'price',
  delivery: 'delivery',
  tasks: 'tasks',
  skillTitle: 'skillTitle',
  skillBody: 'skillBody',
};

const SERVICES_CHROME_COLOR_SLOT: Partial<
  Record<ServicesColorSlot, { id: ServicesElementChromeId; field: 'backgroundColor' | 'borderColor' }>
> = {
  cardTitleChromeBackground: { id: 'cardTitle', field: 'backgroundColor' },
  cardTitleChromeBorder: { id: 'cardTitle', field: 'borderColor' },
  cardBodyChromeBackground: { id: 'cardBody', field: 'backgroundColor' },
  cardBodyChromeBorder: { id: 'cardBody', field: 'borderColor' },
  skillTitleChromeBackground: { id: 'skillTitle', field: 'backgroundColor' },
  skillTitleChromeBorder: { id: 'skillTitle', field: 'borderColor' },
  skillBodyChromeBackground: { id: 'skillBody', field: 'backgroundColor' },
  skillBodyChromeBorder: { id: 'skillBody', field: 'borderColor' },
  priceChromeBackground: { id: 'price', field: 'backgroundColor' },
  priceChromeBorder: { id: 'price', field: 'borderColor' },
  deliveryChromeBackground: { id: 'delivery', field: 'backgroundColor' },
  deliveryChromeBorder: { id: 'delivery', field: 'borderColor' },
  tasksChromeBackground: { id: 'tasks', field: 'backgroundColor' },
  tasksChromeBorder: { id: 'tasks', field: 'borderColor' },
};

/** Map element chrome ids to palette slots for the settings panel. */
export const SERVICES_ELEMENT_CHROME_COLOR_SLOTS: Record<
  ServicesElementChromeId,
  { background: ServicesColorSlot; border: ServicesColorSlot }
> = {
  cardTitle: {
    background: 'cardTitleChromeBackground',
    border: 'cardTitleChromeBorder',
  },
  cardBody: {
    background: 'cardBodyChromeBackground',
    border: 'cardBodyChromeBorder',
  },
  skillTitle: {
    background: 'skillTitleChromeBackground',
    border: 'skillTitleChromeBorder',
  },
  skillBody: {
    background: 'skillBodyChromeBackground',
    border: 'skillBodyChromeBorder',
  },
  price: {
    background: 'priceChromeBackground',
    border: 'priceChromeBorder',
  },
  delivery: {
    background: 'deliveryChromeBackground',
    border: 'deliveryChromeBorder',
  },
  tasks: {
    background: 'tasksChromeBackground',
    border: 'tasksChromeBorder',
  },
};

type ServicesBlockChrome = {
  cardBackgroundColor?: string;
  cardBackgroundColorA?: string;
  cardBackgroundColorB?: string;
  cardBorderColor?: string;
  cardAccentColor?: string;
  cardDividerColor?: string;
  cardDecorColor?: string;
  cardBackgroundEnabled?: boolean;
  stageBackgroundColor?: string;
  stageBorderColor?: string;
  stagePatternColor?: string;
};

type ServicesPaletteHost = {
  servicesPalette?: Partial<PortfolioServicesPalette>;
  servicesColorBindings?: Partial<PortfolioServicesColorBindings>;
  elementStyles?: ServicesElementStyles;
  elementChromes?: ServicesElementChromes;
  skillsHeader?: { titleColor?: string; subtitleColor?: string };
  servicesHeader?: { titleColor?: string; subtitleColor?: string };
  skillsBlock?: ServicesBlockChrome;
  servicesBlock?: ServicesBlockChrome;
  cardDesign?: string;
  cardBackgroundEnabled?: boolean;
  cardBackgroundFill?: 'solid' | 'split';
};

type ServicesPalettePatch = ServicesPresentationColorFields & {
  skillsBlock?: ServicesBlockChrome;
  servicesBlock?: ServicesBlockChrome;
};

function paintServicesElementColor(
  styles: ServicesElementStyles | undefined,
  target: ServicesElementStyleTarget,
  color: string
): ServicesElementStyles | undefined {
  if (!styles?.[target]) return styles;
  return {
    ...styles,
    [target]: { ...styles[target], color },
  };
}

function paintServicesElementChromeColor(
  chromes: ServicesElementChromes | undefined,
  id: ServicesElementChromeId,
  field: 'backgroundColor' | 'borderColor',
  color: string
): ServicesElementChromes {
  const base = chromes ?? DEFAULT_SERVICES_ELEMENT_CHROMES_MIRROR;
  const current = base[id] ?? DEFAULT_SERVICES_ELEMENT_CHROMES_MIRROR[id];
  return {
    ...base,
    [id]: { ...current, [field]: color },
  };
}

export function mergeServicesPalette(
  base: PortfolioServicesPalette,
  patch: unknown
): PortfolioServicesPalette {
  return mergeHeroPalette(base, patch);
}

export function mergeServicesColorBindings(
  base: PortfolioServicesColorBindings,
  patch: unknown
): PortfolioServicesColorBindings {
  if (!patch || typeof patch !== 'object' || Array.isArray(patch)) return { ...base };
  const record = patch as Record<string, unknown>;
  const next = { ...base };
  for (const slot of SERVICES_COLOR_SLOT_IDS) {
    const value = record[slot];
    if (typeof value === 'string' && (HERO_PALETTE_TOKEN_IDS as string[]).includes(value)) {
      next[slot] = value as HeroPaletteTokenId;
    }
  }
  return next;
}

function paintServicesBlockChrome(
  block: ServicesBlockChrome | undefined,
  resolve: (slot: ServicesColorSlot) => string
): ServicesBlockChrome | undefined {
  if (!block) return undefined;
  // Preserve cardBackgroundEnabled — palette only refreshes hex tokens, never re-opens fill.
  return {
    ...block,
    cardBackgroundColor: resolve('cardBackground'),
    cardBackgroundColorA: resolve('cardBackground'),
    cardBackgroundColorB: resolve('cardAccent'),
    cardBorderColor: resolve('cardBorder'),
    cardAccentColor: resolve('cardAccent'),
    cardDividerColor: resolve('cardBorder'),
    cardDecorColor: resolve('cardAccent'),
    stageBackgroundColor: resolve('stageBackground'),
    stageBorderColor: resolve('stageBorder'),
    stagePatternColor: resolve('stagePattern'),
  };
}

/** Push palette + bindings into every bound concrete services hex field. */
export function applyServicesPaletteToSettings(services: ServicesPaletteHost): ServicesPalettePatch {
  const palette = mergeServicesPalette(DEFAULT_SERVICES_PALETTE, services.servicesPalette);
  const bindings = mergeServicesColorBindings(DEFAULT_SERVICES_COLOR_BINDINGS, services.servicesColorBindings);
  let elementStyles = services.elementStyles ? { ...services.elementStyles } : undefined;
  let elementChromes: ServicesElementChromes | undefined = services.elementChromes
    ? { ...services.elementChromes }
    : undefined;

  const patch: Record<string, unknown> = {
    servicesPalette: palette,
    servicesColorBindings: bindings,
  };

  const resolve = (slot: ServicesColorSlot) => resolveHeroPaletteColor(palette, bindings[slot]);

  for (const slot of SERVICES_COLOR_SLOT_IDS) {
    const hex = resolve(slot);
    const elementTarget = SERVICES_ELEMENT_STYLE_SLOT[slot];
    const chromeTarget = SERVICES_CHROME_COLOR_SLOT[slot];
    if (elementTarget) {
      elementStyles = paintServicesElementColor(elementStyles, elementTarget, hex);
    } else if (chromeTarget) {
      elementChromes = paintServicesElementChromeColor(
        elementChromes,
        chromeTarget.id,
        chromeTarget.field,
        hex
      );
    } else {
      patch[SERVICES_SLOT_TO_FIELD[slot]] = hex;
    }
  }

  if (elementStyles) patch.elementStyles = elementStyles;
  if (elementChromes) patch.elementChromes = elementChromes;

  // Keep split / alternate / divider / decor chrome in sync with bound card tokens.
  patch.cardBackgroundColorA = resolve('cardBackground');
  patch.cardBackgroundColorB = resolve('cardAccent');
  patch.cardDividerColor = resolve('cardBorder');
  patch.cardDecorColor = resolve('cardAccent');
  // CTA colors come from dedicated palette slots (ctaAccent / ctaBorder / hover*).

  // Keep per-block chrome in sync (separated / distinct must not keep stale white fills).
  const skillsBlock = paintServicesBlockChrome(services.skillsBlock, resolve);
  if (skillsBlock) patch.skillsBlock = skillsBlock;
  const servicesBlock = paintServicesBlockChrome(services.servicesBlock, resolve);
  if (servicesBlock) patch.servicesBlock = servicesBlock;

  // Keep distinct-section headers in sync with section title / subtitle slots.
  if (services.skillsHeader) {
    patch.skillsHeader = {
      ...services.skillsHeader,
      titleColor: resolve('title'),
      subtitleColor: resolve('subtitle'),
    };
  }
  if (services.servicesHeader) {
    patch.servicesHeader = {
      ...services.servicesHeader,
      titleColor: resolve('title'),
      subtitleColor: resolve('subtitle'),
    };
  }

  return patch as ServicesPalettePatch;
}

export function patchServicesPalette(
  services: ServicesPaletteHost,
  palettePatch: Partial<PortfolioServicesPalette>
): ServicesPalettePatch {
  const palette = mergeServicesPalette(DEFAULT_SERVICES_PALETTE, {
    ...services.servicesPalette,
    ...palettePatch,
  });
  return applyServicesPaletteToSettings({ ...services, servicesPalette: palette });
}

export function patchServicesSlotColor(
  services: ServicesPaletteHost,
  slot: ServicesColorSlot,
  hex: string
): ServicesPalettePatch {
  const bindings = mergeServicesColorBindings(DEFAULT_SERVICES_COLOR_BINDINGS, services.servicesColorBindings);
  return patchServicesPalette(services, { [bindings[slot]]: hex });
}

export function patchServicesColorBinding(
  services: ServicesPaletteHost,
  slot: ServicesColorSlot,
  token: HeroPaletteTokenId
): ServicesPalettePatch {
  const bindings = mergeServicesColorBindings(DEFAULT_SERVICES_COLOR_BINDINGS, {
    ...services.servicesColorBindings,
    [slot]: token,
  });
  return applyServicesPaletteToSettings({ ...services, servicesColorBindings: bindings });
}

export function patchServicesColorFieldManual(
  services: ServicesPaletteHost,
  slot: ServicesColorSlot,
  hex: string
): ServicesPalettePatch {
  const elementTarget = SERVICES_ELEMENT_STYLE_SLOT[slot];
  if (elementTarget) {
    const elementStyles = paintServicesElementColor(services.elementStyles, elementTarget, hex);
    return elementStyles ? { elementStyles } : {};
  }
  const chromeTarget = SERVICES_CHROME_COLOR_SLOT[slot];
  if (chromeTarget) {
    return {
      elementChromes: paintServicesElementChromeColor(
        services.elementChromes,
        chromeTarget.id,
        chromeTarget.field,
        hex
      ),
    };
  }
  return { [SERVICES_SLOT_TO_FIELD[slot]]: hex } as ServicesPalettePatch;
}

export function patchServicesColorField(
  services: ServicesPaletteHost & { useHeroPalette?: boolean },
  slot: ServicesColorSlot,
  hex: string
): ServicesPalettePatch {
  if (services.useHeroPalette === false) {
    return patchServicesColorFieldManual(services, slot, hex);
  }
  return patchServicesSlotColor(services, slot, hex);
}

export const SERVICES_STYLE_TARGET_COLOR_SLOT: Record<ServicesElementStyleTarget, ServicesColorSlot> = {
  blockSubheading: 'blockSubheading',
  cardTitle: 'cardTitle',
  cardBody: 'cardBody',
  price: 'price',
  delivery: 'delivery',
  tasks: 'tasks',
  skillTitle: 'skillTitle',
  skillBody: 'skillBody',
  cta: 'ctaAccent',
};
