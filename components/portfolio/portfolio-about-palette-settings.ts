/**
 * About palette — same 8 semantic tokens as Hero / Work / Services.
 * Concrete hex fields still drive render; bindings choose which token paints each slot.
 */

import { DEFAULT_HERO_PALETTE, HERO_PALETTE_TOKEN_IDS, mergeHeroPalette, resolveHeroPaletteColor, type HeroPaletteTokenId, type PortfolioHeroPalette } from '@/components/portfolio/portfolio-hero-palette-settings';
import type { PortfolioElementTextStyle } from '@/components/portfolio/portfolio-element-text-style';

/** Local mirrors — avoid importing portfolio-about-settings (circular TDZ). */
type AboutElementStyleTarget =
  | 'sideLabel'
  | 'sideTitle'
  | 'sideSubtitle';

type AboutElementStyles = Record<AboutElementStyleTarget, PortfolioElementTextStyle>;

export type PortfolioAboutPalette = PortfolioHeroPalette;

export type AboutColorSlot =
  | 'sectionBackground'
  | 'sectionGradientFrom'
  | 'sectionGradientTo'
  | 'sectionSplitA'
  | 'sectionSplitB'
  | 'sectionDivider'
  | 'title'
  | 'subtitle'
  | 'accent'
  | 'cardBorder'
  | 'cardBackground'
  | 'cardBackgroundA'
  | 'cardBackgroundB'
  | 'cardDivider'
  | 'statsValue'
  | 'statsLabel'
  | 'statsIcon'
  | 'sidePanelBorder'
  | 'sidePanelBackground'
  | 'sidePanelBackgroundA'
  | 'sidePanelBackgroundB'
  | 'sidePanelDivider'
  | 'sidePanelHeading'
  | 'sideLabel'
  | 'sideTitle'
  | 'sideSubtitle';

export type PortfolioAboutColorBindings = Record<AboutColorSlot, HeroPaletteTokenId>;

type AboutPresentationColorFields = {
  sectionBackgroundColor?: string;
  sectionBackgroundGradientFrom?: string;
  sectionBackgroundGradientTo?: string;
  sectionBackgroundColorA?: string;
  sectionBackgroundColorB?: string;
  sectionBackgroundDividerColor?: string;
  titleColor?: string;
  subtitleColor?: string;
  accentColor?: string;
  cardBorderColor?: string;
  cardBackgroundColor?: string;
  cardBackgroundColorA?: string;
  cardBackgroundColorB?: string;
  cardDividerColor?: string;
  statsValueColor?: string;
  statsLabelColor?: string;
  statsIconColor?: string;
  sidePanelBorderColor?: string;
  sidePanelBackgroundColor?: string;
  sidePanelBackgroundColorA?: string;
  sidePanelBackgroundColorB?: string;
  sidePanelDividerColor?: string;
  sidePanelHeadingColor?: string;
  sidePanelMarkerColor?: string;
  useHeroPalette?: boolean;
  aboutPalette?: PortfolioAboutPalette;
  aboutColorBindings?: PortfolioAboutColorBindings;
  elementStyles?: AboutElementStyles;
  cardBackgroundEnabled?: boolean;
  sidePanelBackgroundEnabled?: boolean;
};

const ABOUT_COLOR_SLOT_IDS: AboutColorSlot[] = [
  'sectionBackground',
  'sectionGradientFrom',
  'sectionGradientTo',
  'sectionSplitA',
  'sectionSplitB',
  'sectionDivider',
  'title',
  'subtitle',
  'accent',
  'cardBorder',
  'cardBackground',
  'cardBackgroundA',
  'cardBackgroundB',
  'cardDivider',
  'statsValue',
  'statsLabel',
  'statsIcon',
  'sidePanelBorder',
  'sidePanelBackground',
  'sidePanelBackgroundA',
  'sidePanelBackgroundB',
  'sidePanelDivider',
  'sidePanelHeading',
  'sideLabel',
  'sideTitle',
  'sideSubtitle',
];

const DARK_ABOUT_PALETTE: PortfolioAboutPalette = { ...DEFAULT_HERO_PALETTE };
export const DEFAULT_ABOUT_PALETTE: PortfolioAboutPalette = { ...DARK_ABOUT_PALETTE };

export const DEFAULT_ABOUT_COLOR_BINDINGS: PortfolioAboutColorBindings = {
  sectionBackground: 'fond',
  sectionGradientFrom: 'fond',
  sectionGradientTo: 'neutre',
  sectionSplitA: 'fond',
  sectionSplitB: 'neutre',
  sectionDivider: 'bordure',
  title: 'texteFort',
  subtitle: 'texteMuted',
  accent: 'principal',
  cardBorder: 'bordure',
  cardBackground: 'neutre',
  cardBackgroundA: 'neutre',
  cardBackgroundB: 'fond',
  cardDivider: 'bordure',
  statsValue: 'texteFort',
  statsLabel: 'texteMuted',
  statsIcon: 'texteMuted',
  sidePanelBorder: 'bordure',
  sidePanelBackground: 'neutre',
  sidePanelBackgroundA: 'neutre',
  sidePanelBackgroundB: 'fond',
  sidePanelDivider: 'bordure',
  sidePanelHeading: 'texteFort',
  sideLabel: 'texteMuted',
  sideTitle: 'texteFort',
  sideSubtitle: 'texteMuted',
};

const ABOUT_SLOT_TO_FIELD: Record<AboutColorSlot, string> = {
  sectionBackground: 'sectionBackgroundColor',
  sectionGradientFrom: 'sectionBackgroundGradientFrom',
  sectionGradientTo: 'sectionBackgroundGradientTo',
  sectionSplitA: 'sectionBackgroundColorA',
  sectionSplitB: 'sectionBackgroundColorB',
  sectionDivider: 'sectionBackgroundDividerColor',
  title: 'titleColor',
  subtitle: 'subtitleColor',
  accent: 'accentColor',
  cardBorder: 'cardBorderColor',
  cardBackground: 'cardBackgroundColor',
  cardBackgroundA: 'cardBackgroundColorA',
  cardBackgroundB: 'cardBackgroundColorB',
  cardDivider: 'cardDividerColor',
  statsValue: 'statsValueColor',
  statsLabel: 'statsLabelColor',
  statsIcon: 'statsIconColor',
  sidePanelBorder: 'sidePanelBorderColor',
  sidePanelBackground: 'sidePanelBackgroundColor',
  sidePanelBackgroundA: 'sidePanelBackgroundColorA',
  sidePanelBackgroundB: 'sidePanelBackgroundColorB',
  sidePanelDivider: 'sidePanelDividerColor',
  sidePanelHeading: 'sidePanelHeadingColor',
  sideLabel: 'elementStyles.sideLabel.color',
  sideTitle: 'elementStyles.sideTitle.color',
  sideSubtitle: 'elementStyles.sideSubtitle.color',
};

const ABOUT_ELEMENT_STYLE_SLOT: Partial<Record<AboutColorSlot, AboutElementStyleTarget>> = {
  sideLabel: 'sideLabel',
  sideTitle: 'sideTitle',
  sideSubtitle: 'sideSubtitle',
};

type AboutPaletteHost = {
  aboutPalette?: Partial<PortfolioAboutPalette>;
  aboutColorBindings?: Partial<PortfolioAboutColorBindings>;
  elementStyles?: AboutElementStyles;
};

type AboutPalettePatch = AboutPresentationColorFields;

function surfaceLuminance(hex: string): number {
  const raw = hex.replace('#', '').trim();
  if (raw.length !== 6 || !/^[0-9a-fA-F]+$/.test(raw)) return 0;
  const channel = (start: number) => {
    const c = parseInt(raw.slice(start, start + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4);
}

function inkOnCard(surfaceHex: string, strong: string, muted: string): { strong: string; muted: string } {
  if (surfaceLuminance(surfaceHex) > 0.55) {
    return { strong: '#15151a', muted: '#65656d' };
  }
  return { strong, muted };
}

function paintAboutElementColor(
  styles: AboutElementStyles | undefined,
  target: AboutElementStyleTarget,
  color: string
): AboutElementStyles | undefined {
  if (!styles?.[target]) return styles;
  return {
    ...styles,
    [target]: { ...styles[target], color },
  };
}

export function mergeAboutPalette(
  base: PortfolioAboutPalette,
  patch: unknown
): PortfolioAboutPalette {
  return mergeHeroPalette(base, patch);
}

export function mergeAboutColorBindings(
  base: PortfolioAboutColorBindings,
  patch: unknown
): PortfolioAboutColorBindings {
  if (!patch || typeof patch !== 'object' || Array.isArray(patch)) return { ...base };
  const record = patch as Record<string, unknown>;
  const next = { ...base };
  for (const slot of ABOUT_COLOR_SLOT_IDS) {
    const value = record[slot];
    if (typeof value === 'string' && (HERO_PALETTE_TOKEN_IDS as string[]).includes(value)) {
      next[slot] = value as HeroPaletteTokenId;
    }
  }
  return next;
}

/** Push palette + bindings into every bound concrete about hex field. */
export function applyAboutPaletteToSettings(about: AboutPaletteHost): AboutPalettePatch {
  const palette = mergeAboutPalette(DEFAULT_ABOUT_PALETTE, about.aboutPalette);
  const bindings = mergeAboutColorBindings(DEFAULT_ABOUT_COLOR_BINDINGS, about.aboutColorBindings);
  let elementStyles = about.elementStyles ? { ...about.elementStyles } : undefined;

  const patch: Record<string, unknown> = {
    aboutPalette: palette,
    aboutColorBindings: bindings,
    cardBackgroundEnabled: true,
    sidePanelBackgroundEnabled: true,
  };

  const resolve = (slot: AboutColorSlot) => resolveHeroPaletteColor(palette, bindings[slot]);
  const statsSurface = resolve('cardBackground');
  const onStats = inkOnCard(statsSurface, resolve('statsValue'), resolve('statsLabel'));
  const sideSurface = resolve('sidePanelBackground');
  const onSide = inkOnCard(sideSurface, resolve('sideTitle'), resolve('sideSubtitle'));

  for (const slot of ABOUT_COLOR_SLOT_IDS) {
    const hex = resolve(slot);
    const elementTarget = ABOUT_ELEMENT_STYLE_SLOT[slot];
    if (elementTarget) {
      // Micro-labels stay muted — principal/accent is reserved for icons & markers.
      if (elementTarget === 'sideLabel') {
        elementStyles = paintAboutElementColor(
          elementStyles,
          elementTarget,
          resolveHeroPaletteColor(palette, 'texteMuted')
        );
        continue;
      }
      // Why-me body/bullet honor their own bindings (do not collapse onto muted ink).
      const cardText =
        elementTarget === 'sideTitle'
          ? onSide.strong
          : elementTarget === 'sideSubtitle'
            ? onSide.muted
            : hex;
      elementStyles = paintAboutElementColor(elementStyles, elementTarget, cardText);
    } else if (slot === 'statsValue') {
      patch.statsValueColor = onStats.strong;
    } else if (slot === 'statsLabel' || slot === 'statsIcon') {
      patch[ABOUT_SLOT_TO_FIELD[slot]] = onStats.muted;
    } else {
      patch[ABOUT_SLOT_TO_FIELD[slot]] = hex;
    }
  }

  // Icon soft washes + Why me / Infos markers track palette principal.
  const principal = resolveHeroPaletteColor(palette, 'principal');
  patch.sidePanelMarkerColor = principal;

  if (elementStyles) patch.elementStyles = elementStyles;

  return patch as AboutPalettePatch;
}
