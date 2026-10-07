/**
 * Work / Projects palette — same 8 semantic tokens as Hero and Navigation.
 * Each work color slot binds to a token; editing a token restyles every
 * bound color at once, while concrete hex fields keep driving the render.
 */

import { DEFAULT_HERO_PALETTE, HERO_PALETTE_TOKEN_IDS, mergeHeroPalette, resolveHeroPaletteColor, type HeroPaletteTokenId, type PortfolioHeroPalette } from '@/components/portfolio/portfolio-hero-palette-settings';
import type { PortfolioElementTextStyle } from '@/components/portfolio/portfolio-element-text-style';

/** Local type mirror — avoid importing portfolio-work-settings (circular TDZ). */
type WorkElementStyleTarget =
  | 'cardTitle'
  | 'cardDescription'
  | 'toolsLabel'
  | 'toolsList'
  | 'categoryOnCard'
  | 'cta';

type WorkElementStyles = Record<WorkElementStyleTarget, PortfolioElementTextStyle>;

export type PortfolioWorkPalette = PortfolioHeroPalette;

/** Work color slots that can bind to a palette token. */
export type WorkColorSlot =
  | 'sectionBackground'
  | 'sectionGradientFrom'
  | 'sectionGradientTo'
  | 'sectionSplitA'
  | 'sectionSplitB'
  | 'sectionDivider'
  | 'title'
  | 'subtitle'
  | 'cardBorder'
  | 'overlayBottomRule'
  | 'cardBackground'
  | 'ctaAccent'
  | 'categoryActive'
  | 'categoryMuted'
  | 'cardTitle'
  | 'cardDescription'
  | 'toolsLabel'
  | 'toolsList'
  | 'categoryOnCard'
  | 'ctaText'
  | 'ctaBorder'
  | 'ctaHoverBackground'
  | 'ctaHoverText'
  | 'ctaHoverBorder'
  | 'toolsIconBackground'
  | 'toolsIconBorder'
  | 'contentFrameBorder'
  | 'contentFrameBackground'
  | 'categoryChromeBackground'
  | 'categoryChromeBorder'
  | 'titleChromeBackground'
  | 'titleChromeBorder'
  | 'descriptionChromeBackground'
  | 'descriptionChromeBorder'
  | 'toolsChromeBackground'
  | 'toolsChromeBorder';

export type PortfolioWorkColorBindings = Record<WorkColorSlot, HeroPaletteTokenId>;

type WorkElementChromeId = 'categoryOnCard' | 'cardTitle' | 'cardDescription' | 'tools';

type WorkElementChromeSettings = {
  enabled: boolean;
  backgroundEnabled: boolean;
  backgroundColor: string;
  border: string;
  borderColor: string;
  borderRadius: string;
  padding: string;
  margin: string;
  fitContent?: boolean;
};

type WorkElementChromes = Record<WorkElementChromeId, WorkElementChromeSettings>;

const DEFAULT_WORK_ELEMENT_CHROMES_MIRROR: WorkElementChromes = {
  categoryOnCard: {
    enabled: false,
    backgroundEnabled: true,
    backgroundColor: '#fafafa',
    border: 'none',
    borderColor: '#e5e5e5',
    borderRadius: 'md',
    padding: 'sm',
    margin: 'none',
  },
  cardTitle: {
    enabled: false,
    backgroundEnabled: true,
    backgroundColor: '#fafafa',
    border: 'none',
    borderColor: '#e5e5e5',
    borderRadius: 'md',
    padding: 'sm',
    margin: 'none',
  },
  cardDescription: {
    enabled: false,
    backgroundEnabled: true,
    backgroundColor: '#fafafa',
    border: 'none',
    borderColor: '#e5e5e5',
    borderRadius: 'md',
    padding: 'sm',
    margin: 'none',
  },
  tools: {
    enabled: false,
    backgroundEnabled: true,
    backgroundColor: '#fafafa',
    border: 'none',
    borderColor: '#e5e5e5',
    borderRadius: 'md',
    padding: 'sm',
    margin: 'none',
    fitContent: true,
  },
};

type WorkPresentationColorFields = {
  sectionBackgroundColor?: string;
  sectionBackgroundGradientFrom?: string;
  sectionBackgroundGradientTo?: string;
  sectionBackgroundColorA?: string;
  sectionBackgroundColorB?: string;
  sectionBackgroundDividerColor?: string;
  titleColor?: string;
  subtitleColor?: string;
  cardBorderColor?: string;
  overlayBottomRuleColor?: string;
  overlayBottomRuleManual?: boolean;
  cardBackgroundColor?: string;
  ctaColor?: string;
  ctaBorderColor?: string;
  ctaHoverBackgroundColor?: string;
  ctaHoverTextColor?: string;
  ctaHoverBorderColor?: string;
  toolsIconBackgroundColor?: string;
  toolsIconBorderColor?: string;
  contentFrameBorderColor?: string;
  contentFrameBackgroundColor?: string;
  /** When true, skip palette sync for info-frame border (manual hex wins). */
  contentFrameBorderManual?: boolean;
  /** When true, skip palette sync for info-frame fill (manual hex wins). */
  contentFrameBackgroundManual?: boolean;
  categoryActiveColor?: string;
  categoryMutedColor?: string;
  useHeroPalette?: boolean;
  /** Always a full palette when present (merged, never Partial). */
  workPalette?: PortfolioWorkPalette;
  workColorBindings?: PortfolioWorkColorBindings;
  elementStyles?: WorkElementStyles;
  elementChromes?: WorkElementChromes;
};

const WORK_COLOR_SLOT_IDS: WorkColorSlot[] = [
  'sectionBackground',
  'sectionGradientFrom',
  'sectionGradientTo',
  'sectionSplitA',
  'sectionSplitB',
  'sectionDivider',
  'title',
  'subtitle',
  'cardBorder',
  'overlayBottomRule',
  'cardBackground',
  'ctaAccent',
  'categoryActive',
  'categoryMuted',
  'cardTitle',
  'cardDescription',
  'toolsLabel',
  'toolsList',
  'categoryOnCard',
  'ctaText',
  'ctaBorder',
  'ctaHoverBackground',
  'ctaHoverText',
  'ctaHoverBorder',
  'toolsIconBackground',
  'toolsIconBorder',
  'contentFrameBorder',
  'contentFrameBackground',
  'categoryChromeBackground',
  'categoryChromeBorder',
  'titleChromeBackground',
  'titleChromeBorder',
  'descriptionChromeBackground',
  'descriptionChromeBorder',
  'toolsChromeBackground',
  'toolsChromeBorder',
];

const DARK_WORK_PALETTE: PortfolioWorkPalette = { ...DEFAULT_HERO_PALETTE };
export const DEFAULT_WORK_PALETTE: PortfolioWorkPalette = { ...DARK_WORK_PALETTE };

export const DEFAULT_WORK_COLOR_BINDINGS: PortfolioWorkColorBindings = {
  sectionBackground: 'fond',
  sectionGradientFrom: 'fond',
  sectionGradientTo: 'neutre',
  sectionSplitA: 'fond',
  sectionSplitB: 'neutre',
  sectionDivider: 'bordure',
  title: 'principal',
  subtitle: 'texteMuted',
  cardBorder: 'bordure',
  overlayBottomRule: 'bordure',
  cardBackground: 'neutre',
  ctaAccent: 'principal',
  categoryActive: 'principal',
  categoryMuted: 'texteMuted',
  cardTitle: 'texteFort',
  cardDescription: 'texteMuted',
  toolsLabel: 'texteFaint',
  toolsList: 'texteMuted',
  categoryOnCard: 'principal',
  /** Label on outline / circle / text CTAs — strong ink, not surface neutre. */
  ctaText: 'texteFort',
  ctaBorder: 'bordure',
  /** On filled accent CTAs, hover label follows page fill (`fond`). */
  ctaHoverBackground: 'principal',
  ctaHoverText: 'fond',
  ctaHoverBorder: 'principal',
  toolsIconBackground: 'neutre',
  toolsIconBorder: 'bordure',
  contentFrameBorder: 'bordure',
  contentFrameBackground: 'neutre',
  categoryChromeBackground: 'neutre',
  categoryChromeBorder: 'bordure',
  titleChromeBackground: 'neutre',
  titleChromeBorder: 'bordure',
  descriptionChromeBackground: 'neutre',
  descriptionChromeBorder: 'bordure',
  toolsChromeBackground: 'neutre',
  toolsChromeBorder: 'bordure',
};

const WORK_SLOT_TO_FIELD: Record<WorkColorSlot, string> = {
  sectionBackground: 'sectionBackgroundColor',
  sectionGradientFrom: 'sectionBackgroundGradientFrom',
  sectionGradientTo: 'sectionBackgroundGradientTo',
  sectionSplitA: 'sectionBackgroundColorA',
  sectionSplitB: 'sectionBackgroundColorB',
  sectionDivider: 'sectionBackgroundDividerColor',
  title: 'titleColor',
  subtitle: 'subtitleColor',
  cardBorder: 'cardBorderColor',
  overlayBottomRule: 'overlayBottomRuleColor',
  cardBackground: 'cardBackgroundColor',
  ctaAccent: 'ctaColor',
  categoryActive: 'categoryActiveColor',
  categoryMuted: 'categoryMutedColor',
  cardTitle: 'elementStyles.cardTitle.color',
  cardDescription: 'elementStyles.cardDescription.color',
  toolsLabel: 'elementStyles.toolsLabel.color',
  toolsList: 'elementStyles.toolsList.color',
  categoryOnCard: 'elementStyles.categoryOnCard.color',
  ctaText: 'elementStyles.cta.color',
  ctaBorder: 'ctaBorderColor',
  ctaHoverBackground: 'ctaHoverBackgroundColor',
  ctaHoverText: 'ctaHoverTextColor',
  ctaHoverBorder: 'ctaHoverBorderColor',
  toolsIconBackground: 'toolsIconBackgroundColor',
  toolsIconBorder: 'toolsIconBorderColor',
  contentFrameBorder: 'contentFrameBorderColor',
  contentFrameBackground: 'contentFrameBackgroundColor',
  categoryChromeBackground: 'elementChromes.categoryOnCard.backgroundColor',
  categoryChromeBorder: 'elementChromes.categoryOnCard.borderColor',
  titleChromeBackground: 'elementChromes.cardTitle.backgroundColor',
  titleChromeBorder: 'elementChromes.cardTitle.borderColor',
  descriptionChromeBackground: 'elementChromes.cardDescription.backgroundColor',
  descriptionChromeBorder: 'elementChromes.cardDescription.borderColor',
  toolsChromeBackground: 'elementChromes.tools.backgroundColor',
  toolsChromeBorder: 'elementChromes.tools.borderColor',
};

const WORK_ELEMENT_STYLE_SLOT: Partial<Record<WorkColorSlot, WorkElementStyleTarget>> = {
  cardTitle: 'cardTitle',
  cardDescription: 'cardDescription',
  toolsLabel: 'toolsLabel',
  toolsList: 'toolsList',
  categoryOnCard: 'categoryOnCard',
  ctaText: 'cta',
};

const WORK_CHROME_COLOR_SLOT: Partial<
  Record<WorkColorSlot, { id: WorkElementChromeId; field: 'backgroundColor' | 'borderColor' }>
> = {
  categoryChromeBackground: { id: 'categoryOnCard', field: 'backgroundColor' },
  categoryChromeBorder: { id: 'categoryOnCard', field: 'borderColor' },
  titleChromeBackground: { id: 'cardTitle', field: 'backgroundColor' },
  titleChromeBorder: { id: 'cardTitle', field: 'borderColor' },
  descriptionChromeBackground: { id: 'cardDescription', field: 'backgroundColor' },
  descriptionChromeBorder: { id: 'cardDescription', field: 'borderColor' },
  toolsChromeBackground: { id: 'tools', field: 'backgroundColor' },
  toolsChromeBorder: { id: 'tools', field: 'borderColor' },
};

type WorkPaletteHost = {
  workPalette?: Partial<PortfolioWorkPalette>;
  workColorBindings?: Partial<PortfolioWorkColorBindings>;
  elementStyles?: WorkElementStyles;
  elementChromes?: WorkElementChromes;
  contentFrameBorderManual?: boolean;
  contentFrameBackgroundManual?: boolean;
  overlayBottomRuleManual?: boolean;
};

type WorkPalettePatch = WorkPresentationColorFields;

function paintWorkElementColor(
  styles: WorkElementStyles | undefined,
  target: WorkElementStyleTarget,
  color: string
): WorkElementStyles | undefined {
  if (!styles?.[target]) return styles;
  return {
    ...styles,
    [target]: { ...styles[target], color },
  };
}

function paintWorkElementChromeColor(
  chromes: WorkElementChromes | undefined,
  id: WorkElementChromeId,
  field: 'backgroundColor' | 'borderColor',
  color: string
): WorkElementChromes {
  const base = chromes ?? DEFAULT_WORK_ELEMENT_CHROMES_MIRROR;
  const current = base[id] ?? DEFAULT_WORK_ELEMENT_CHROMES_MIRROR[id];
  return {
    ...base,
    [id]: { ...current, [field]: color },
  };
}

export function mergeWorkPalette(base: PortfolioWorkPalette, patch: unknown): PortfolioWorkPalette {
  return mergeHeroPalette(base, patch);
}

export function mergeWorkColorBindings(
  base: PortfolioWorkColorBindings,
  patch: unknown
): PortfolioWorkColorBindings {
  if (!patch || typeof patch !== 'object' || Array.isArray(patch)) return { ...base };
  const record = patch as Record<string, unknown>;
  const next = { ...base };
  for (const slot of WORK_COLOR_SLOT_IDS) {
    const value = record[slot];
    if (typeof value === 'string' && (HERO_PALETTE_TOKEN_IDS as string[]).includes(value)) {
      next[slot] = value as HeroPaletteTokenId;
    }
  }
  return next;
}

/** Push palette + bindings into every bound concrete work hex field. */
export function applyWorkPaletteToSettings(work: WorkPaletteHost): WorkPalettePatch {
  const palette = mergeWorkPalette(DEFAULT_WORK_PALETTE, work.workPalette);
  const bindings = mergeWorkColorBindings(DEFAULT_WORK_COLOR_BINDINGS, work.workColorBindings);
  let elementStyles = work.elementStyles ? { ...work.elementStyles } : undefined;
  let elementChromes: WorkElementChromes | undefined = work.elementChromes
    ? { ...work.elementChromes }
    : undefined;

  const patch: Record<string, unknown> = {
    workPalette: palette,
    workColorBindings: bindings,
  };

  for (const slot of WORK_COLOR_SLOT_IDS) {
    // Manual overrides on the info frame keep their hex until the token binding changes.
    if (slot === 'contentFrameBorder' && work.contentFrameBorderManual) continue;
    if (slot === 'contentFrameBackground' && work.contentFrameBackgroundManual) continue;
    if (slot === 'overlayBottomRule' && work.overlayBottomRuleManual) continue;

    const hex = resolveHeroPaletteColor(palette, bindings[slot]);
    const elementTarget = WORK_ELEMENT_STYLE_SLOT[slot];
    const chromeTarget = WORK_CHROME_COLOR_SLOT[slot];
    if (elementTarget) {
      elementStyles = paintWorkElementColor(elementStyles, elementTarget, hex);
    } else if (chromeTarget) {
      elementChromes = paintWorkElementChromeColor(
        elementChromes,
        chromeTarget.id,
        chromeTarget.field,
        hex
      );
    } else {
      patch[WORK_SLOT_TO_FIELD[slot]] = hex;
    }
  }

  if (elementStyles) patch.elementStyles = elementStyles;
  if (elementChromes) patch.elementChromes = elementChromes;
  return patch as WorkPalettePatch;
}

export function patchWorkPalette(
  work: WorkPaletteHost,
  palettePatch: Partial<PortfolioWorkPalette>
): WorkPalettePatch {
  const palette = mergeWorkPalette(DEFAULT_WORK_PALETTE, {
    ...work.workPalette,
    ...palettePatch,
  });
  return applyWorkPaletteToSettings({ ...work, workPalette: palette });
}

function patchWorkSlotColor(
  work: WorkPaletteHost,
  slot: WorkColorSlot,
  hex: string
): WorkPalettePatch {
  const bindings = mergeWorkColorBindings(DEFAULT_WORK_COLOR_BINDINGS, work.workColorBindings);
  return patchWorkPalette(work, { [bindings[slot]]: hex });
}

export function patchWorkColorBinding(
  work: WorkPaletteHost,
  slot: WorkColorSlot,
  token: HeroPaletteTokenId
): WorkPalettePatch {
  const bindings = mergeWorkColorBindings(DEFAULT_WORK_COLOR_BINDINGS, {
    ...work.workColorBindings,
    [slot]: token,
  });
  const clearManual: WorkPalettePatch =
    slot === 'contentFrameBorder'
      ? { contentFrameBorderManual: false }
      : slot === 'contentFrameBackground'
        ? { contentFrameBackgroundManual: false }
        : slot === 'overlayBottomRule'
          ? { overlayBottomRuleManual: false }
        : {};
  return applyWorkPaletteToSettings({
    ...work,
    ...clearManual,
    workColorBindings: bindings,
  });
}

/** Manual-mode patch for a single color slot. */
export function patchWorkColorFieldManual(
  work: WorkPaletteHost,
  slot: WorkColorSlot,
  hex: string
): WorkPalettePatch {
  const elementTarget = WORK_ELEMENT_STYLE_SLOT[slot];
  if (elementTarget) {
    const elementStyles = paintWorkElementColor(work.elementStyles, elementTarget, hex);
    return elementStyles ? { elementStyles } : {};
  }
  const chromeTarget = WORK_CHROME_COLOR_SLOT[slot];
  if (chromeTarget) {
    return {
      elementChromes: paintWorkElementChromeColor(
        work.elementChromes,
        chromeTarget.id,
        chromeTarget.field,
        hex
      ),
    };
  }
  if (slot === 'contentFrameBorder') {
    return { contentFrameBorderColor: hex, contentFrameBorderManual: true };
  }
  if (slot === 'contentFrameBackground') {
    return { contentFrameBackgroundColor: hex, contentFrameBackgroundManual: true };
  }
  if (slot === 'overlayBottomRule') {
    return { overlayBottomRuleColor: hex, overlayBottomRuleManual: true };
  }
  return { [WORK_SLOT_TO_FIELD[slot]]: hex } as WorkPalettePatch;
}

export function patchWorkColorField(
  work: WorkPaletteHost & { useHeroPalette?: boolean },
  slot: WorkColorSlot,
  hex: string
): WorkPalettePatch {
  if (work.useHeroPalette === false) {
    return patchWorkColorFieldManual(work, slot, hex);
  }
  return patchWorkSlotColor(work, slot, hex);
}
