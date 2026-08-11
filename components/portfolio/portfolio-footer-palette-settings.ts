/**
 * Footer palette — same 8 semantic tokens as Hero / Global.
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

/** Local mirrors — avoid importing portfolio-footer-settings (circular TDZ). */
export type FooterElementStyleTarget =
  | 'brand'
  | 'description'
  | 'columnHeading'
  | 'contactLine'
  | 'socialLabel'
  | 'meta'
  | 'marketplaceLink'
  | 'ctaTitle'
  | 'ctaSubtitle'
  | 'ctaButton';

type FooterElementStyles = Record<FooterElementStyleTarget, PortfolioElementTextStyle>;

export type PortfolioFooterPalette = PortfolioHeroPalette;

export type FooterColorSlot =
  | 'sectionBackground'
  | 'sectionGradientFrom'
  | 'sectionGradientTo'
  | 'sectionSplitA'
  | 'sectionSplitB'
  | 'sectionDivider'
  | 'text'
  | 'primary'
  | 'icon'
  | 'accent'
  | 'pattern'
  | 'ctaTitle'
  | 'ctaSubtitle'
  | 'ctaButtonBackground'
  | 'ctaButtonText'
  | 'ctaButtonBorder'
  | 'brand'
  | 'description'
  | 'columnHeading'
  | 'contactLine'
  | 'socialLabel'
  | 'meta'
  | 'marketplaceLink'
  | 'ctaButtonLabel';

export type PortfolioFooterColorBindings = Record<FooterColorSlot, HeroPaletteTokenId>;

type FooterPresentationColorFields = {
  sectionBackgroundColor?: string;
  sectionBackgroundGradientFrom?: string;
  sectionBackgroundGradientTo?: string;
  sectionBackgroundColorA?: string;
  sectionBackgroundColorB?: string;
  sectionBackgroundDividerColor?: string;
  textColor?: string;
  primaryColor?: string;
  iconColor?: string;
  accentColor?: string;
  patternColor?: string;
  ctaTitleColor?: string;
  ctaSubtitleColor?: string;
  ctaButtonBackgroundColor?: string;
  ctaButtonTextColor?: string;
  ctaButtonBorderColor?: string;
  useHeroPalette?: boolean;
  footerPalette?: PortfolioFooterPalette;
  footerColorBindings?: PortfolioFooterColorBindings;
  elementStyles?: FooterElementStyles;
};

export const FOOTER_COLOR_SLOT_IDS: FooterColorSlot[] = [
  'sectionBackground',
  'sectionGradientFrom',
  'sectionGradientTo',
  'sectionSplitA',
  'sectionSplitB',
  'sectionDivider',
  'text',
  'primary',
  'icon',
  'accent',
  'pattern',
  'ctaTitle',
  'ctaSubtitle',
  'ctaButtonBackground',
  'ctaButtonText',
  'ctaButtonBorder',
  'brand',
  'description',
  'columnHeading',
  'contactLine',
  'socialLabel',
  'meta',
  'marketplaceLink',
  'ctaButtonLabel',
];

export const PORTFOLIO_FOOTER_COLOR_SLOT_OPTIONS: {
  value: FooterColorSlot;
  label: string;
  description: string;
}[] = [
  { value: 'sectionBackground', label: 'Section background', description: 'Solid section fill.' },
  { value: 'sectionGradientFrom', label: 'Gradient start', description: 'Start of the section gradient.' },
  { value: 'sectionGradientTo', label: 'Gradient end', description: 'End of the section gradient.' },
  { value: 'sectionSplitA', label: 'Split zone A', description: 'First split background zone.' },
  { value: 'sectionSplitB', label: 'Split zone B', description: 'Second split background zone.' },
  { value: 'sectionDivider', label: 'Split divider', description: 'Line between split zones.' },
  { value: 'text', label: 'Muted text', description: 'Meta / secondary labels.' },
  { value: 'primary', label: 'Primary text', description: 'Brand and contact lines.' },
  { value: 'icon', label: 'Icons', description: 'Contact and social icons.' },
  { value: 'accent', label: 'Accent', description: 'CTA / marketplace accent.' },
  { value: 'pattern', label: 'Pattern', description: 'Background motif color.' },
  { value: 'ctaTitle', label: 'CTA title', description: 'Contact CTA band headline.' },
  { value: 'ctaSubtitle', label: 'CTA subtitle', description: 'Line under the CTA title.' },
  { value: 'ctaButtonBackground', label: 'CTA button fill', description: 'Contact me button background.' },
  { value: 'ctaButtonText', label: 'CTA button text', description: 'Contact me button label.' },
  { value: 'ctaButtonBorder', label: 'CTA button border', description: 'Contact me button outline.' },
  { value: 'brand', label: 'Brand name', description: 'Creator name typography color.' },
  { value: 'description', label: 'Description', description: 'Bio / tagline under the brand.' },
  { value: 'columnHeading', label: 'Column heading', description: 'Networks / Contact headings.' },
  { value: 'contactLine', label: 'Contact line', description: 'Phone, email, location, hours.' },
  { value: 'socialLabel', label: 'Social label', description: 'Labels beside social icons.' },
  { value: 'meta', label: 'Meta', description: 'Copyright and credits.' },
  { value: 'marketplaceLink', label: 'Marketplace link', description: 'Marketplace CTA text color.' },
  { value: 'ctaButtonLabel', label: 'CTA button label', description: 'Typography color on Contact me.' },
];

export const DARK_FOOTER_PALETTE: PortfolioFooterPalette = { ...DEFAULT_HERO_PALETTE };
export const DEFAULT_FOOTER_PALETTE: PortfolioFooterPalette = { ...DARK_FOOTER_PALETTE };

export function computeLightFooterPalette(
  dark: Partial<PortfolioFooterPalette>
): PortfolioFooterPalette {
  return computeLightPalette(mergeHeroPalette(DARK_FOOTER_PALETTE, dark));
}

export const DEFAULT_FOOTER_COLOR_BINDINGS: PortfolioFooterColorBindings = {
  sectionBackground: 'fond',
  sectionGradientFrom: 'fond',
  sectionGradientTo: 'neutre',
  sectionSplitA: 'fond',
  sectionSplitB: 'neutre',
  sectionDivider: 'bordure',
  text: 'texteMuted',
  primary: 'texteFort',
  icon: 'texteMuted',
  accent: 'principal',
  pattern: 'texteFaint',
  ctaTitle: 'texteFort',
  ctaSubtitle: 'texteMuted',
  ctaButtonBackground: 'principal',
  ctaButtonText: 'neutre',
  ctaButtonBorder: 'bordure',
  brand: 'texteFort',
  description: 'texteMuted',
  columnHeading: 'texteFaint',
  contactLine: 'texteFort',
  socialLabel: 'texteFort',
  meta: 'texteMuted',
  marketplaceLink: 'principal',
  ctaButtonLabel: 'neutre',
};

const FOOTER_SLOT_TO_FIELD: Record<FooterColorSlot, string> = {
  sectionBackground: 'sectionBackgroundColor',
  sectionGradientFrom: 'sectionBackgroundGradientFrom',
  sectionGradientTo: 'sectionBackgroundGradientTo',
  sectionSplitA: 'sectionBackgroundColorA',
  sectionSplitB: 'sectionBackgroundColorB',
  sectionDivider: 'sectionBackgroundDividerColor',
  text: 'textColor',
  primary: 'primaryColor',
  icon: 'iconColor',
  accent: 'accentColor',
  pattern: 'patternColor',
  ctaTitle: 'ctaTitleColor',
  ctaSubtitle: 'ctaSubtitleColor',
  ctaButtonBackground: 'ctaButtonBackgroundColor',
  ctaButtonText: 'ctaButtonTextColor',
  ctaButtonBorder: 'ctaButtonBorderColor',
  brand: 'elementStyles.brand.color',
  description: 'elementStyles.description.color',
  columnHeading: 'elementStyles.columnHeading.color',
  contactLine: 'elementStyles.contactLine.color',
  socialLabel: 'elementStyles.socialLabel.color',
  meta: 'elementStyles.meta.color',
  marketplaceLink: 'elementStyles.marketplaceLink.color',
  ctaButtonLabel: 'elementStyles.ctaButton.color',
};

const FOOTER_ELEMENT_STYLE_SLOT: Partial<Record<FooterColorSlot, FooterElementStyleTarget>> = {
  brand: 'brand',
  description: 'description',
  columnHeading: 'columnHeading',
  contactLine: 'contactLine',
  socialLabel: 'socialLabel',
  meta: 'meta',
  marketplaceLink: 'marketplaceLink',
  ctaTitle: 'ctaTitle',
  ctaSubtitle: 'ctaSubtitle',
  ctaButtonLabel: 'ctaButton',
};

type FooterPaletteHost = {
  footerPalette?: Partial<PortfolioFooterPalette>;
  footerColorBindings?: Partial<PortfolioFooterColorBindings>;
  elementStyles?: FooterElementStyles;
};

type FooterPalettePatch = FooterPresentationColorFields;

function paintFooterElementColor(
  styles: FooterElementStyles | undefined,
  target: FooterElementStyleTarget,
  color: string
): FooterElementStyles | undefined {
  if (!styles?.[target]) return styles;
  return {
    ...styles,
    [target]: { ...styles[target], color },
  };
}

export function mergeFooterPalette(
  base: PortfolioFooterPalette,
  patch: unknown
): PortfolioFooterPalette {
  return mergeHeroPalette(base, patch);
}

export function mergeFooterColorBindings(
  base: PortfolioFooterColorBindings,
  patch: unknown
): PortfolioFooterColorBindings {
  if (!patch || typeof patch !== 'object' || Array.isArray(patch)) return { ...base };
  const record = patch as Record<string, unknown>;
  const next = { ...base };
  for (const slot of FOOTER_COLOR_SLOT_IDS) {
    const value = record[slot];
    if (typeof value === 'string' && (HERO_PALETTE_TOKEN_IDS as string[]).includes(value)) {
      next[slot] = value as HeroPaletteTokenId;
    }
  }
  return next;
}

/** Push palette + bindings into every bound concrete footer hex field. */
export function applyFooterPaletteToSettings(footer: FooterPaletteHost): FooterPalettePatch {
  const palette = mergeFooterPalette(DEFAULT_FOOTER_PALETTE, footer.footerPalette);
  const bindings = mergeFooterColorBindings(DEFAULT_FOOTER_COLOR_BINDINGS, footer.footerColorBindings);
  let elementStyles = footer.elementStyles ? { ...footer.elementStyles } : undefined;

  const patch: Record<string, unknown> = {
    footerPalette: palette,
    footerColorBindings: bindings,
  };

  const resolve = (slot: FooterColorSlot) => resolveHeroPaletteColor(palette, bindings[slot]);

  for (const slot of FOOTER_COLOR_SLOT_IDS) {
    const hex = resolve(slot);
    const elementTarget = FOOTER_ELEMENT_STYLE_SLOT[slot];
    if (elementTarget) {
      elementStyles = paintFooterElementColor(elementStyles, elementTarget, hex);
      // Keep legacy flat CTA title/subtitle colors in sync when those slots paint element styles.
      if (slot === 'ctaTitle') patch.ctaTitleColor = hex;
      if (slot === 'ctaSubtitle') patch.ctaSubtitleColor = hex;
    } else {
      patch[FOOTER_SLOT_TO_FIELD[slot]] = hex;
    }
  }

  if (elementStyles) {
    patch.elementStyles = elementStyles;
  }

  return patch as FooterPalettePatch;
}

export function patchFooterPalette(
  footer: FooterPaletteHost,
  palettePatch: Partial<PortfolioFooterPalette>
): FooterPalettePatch {
  const palette = mergeFooterPalette(DEFAULT_FOOTER_PALETTE, {
    ...footer.footerPalette,
    ...palettePatch,
  });
  return applyFooterPaletteToSettings({ ...footer, footerPalette: palette });
}

export function patchFooterSlotColor(
  footer: FooterPaletteHost,
  slot: FooterColorSlot,
  hex: string
): FooterPalettePatch {
  const bindings = mergeFooterColorBindings(DEFAULT_FOOTER_COLOR_BINDINGS, footer.footerColorBindings);
  return patchFooterPalette(footer, { [bindings[slot]]: hex });
}

export function patchFooterColorBinding(
  footer: FooterPaletteHost,
  slot: FooterColorSlot,
  token: HeroPaletteTokenId
): FooterPalettePatch {
  const bindings = mergeFooterColorBindings(DEFAULT_FOOTER_COLOR_BINDINGS, {
    ...footer.footerColorBindings,
    [slot]: token,
  });
  return applyFooterPaletteToSettings({ ...footer, footerColorBindings: bindings });
}

export function patchFooterColorFieldManual(
  footer: FooterPaletteHost,
  slot: FooterColorSlot,
  hex: string
): FooterPalettePatch {
  const elementTarget = FOOTER_ELEMENT_STYLE_SLOT[slot];
  if (elementTarget) {
    const elementStyles = paintFooterElementColor(footer.elementStyles, elementTarget, hex);
    const patch: FooterPalettePatch = elementStyles ? { elementStyles } : {};
    if (slot === 'ctaTitle') patch.ctaTitleColor = hex;
    if (slot === 'ctaSubtitle') patch.ctaSubtitleColor = hex;
    return patch;
  }
  return { [FOOTER_SLOT_TO_FIELD[slot]]: hex } as FooterPalettePatch;
}

export function patchFooterColorField(
  footer: FooterPaletteHost & { useHeroPalette?: boolean },
  slot: FooterColorSlot,
  hex: string
): FooterPalettePatch {
  if (footer.useHeroPalette === false) {
    return patchFooterColorFieldManual(footer, slot, hex);
  }
  return patchFooterSlotColor(footer, slot, hex);
}

export const FOOTER_STYLE_TARGET_COLOR_SLOT: Record<FooterElementStyleTarget, FooterColorSlot> = {
  brand: 'brand',
  description: 'description',
  columnHeading: 'columnHeading',
  contactLine: 'contactLine',
  socialLabel: 'socialLabel',
  meta: 'meta',
  marketplaceLink: 'marketplaceLink',
  ctaTitle: 'ctaTitle',
  ctaSubtitle: 'ctaSubtitle',
  ctaButton: 'ctaButtonLabel',
};
