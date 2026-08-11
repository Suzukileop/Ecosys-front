/**
 * About palette — same 8 semantic tokens as Hero / Work / Services.
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

/** Local mirrors — avoid importing portfolio-about-settings (circular TDZ). */
export type AboutElementStyleTarget =
  | 'whyMeBody'
  | 'whyMeBullet'
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
  | 'whyMeBorder'
  | 'whyMeBackground'
  | 'whyMeBackgroundA'
  | 'whyMeBackgroundB'
  | 'whyMeDivider'
  | 'whyMeDecor'
  | 'whyMeHeading'
  | 'whyMeBody'
  | 'whyMeBullet'
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
  whyMeBorderColor?: string;
  whyMeBackgroundColor?: string;
  whyMeBackgroundColorA?: string;
  whyMeBackgroundColorB?: string;
  whyMeDividerColor?: string;
  whyMeDecorColor?: string;
  whyMeHeadingColor?: string;
  whyMeMarkerColor?: string;
  sidePanelMarkerColor?: string;
  useHeroPalette?: boolean;
  aboutPalette?: PortfolioAboutPalette;
  aboutColorBindings?: PortfolioAboutColorBindings;
  elementStyles?: AboutElementStyles;
  cardBackgroundEnabled?: boolean;
  sidePanelBackgroundEnabled?: boolean;
  whyMeBackgroundEnabled?: boolean;
};

export const ABOUT_COLOR_SLOT_IDS: AboutColorSlot[] = [
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
  'whyMeBorder',
  'whyMeBackground',
  'whyMeBackgroundA',
  'whyMeBackgroundB',
  'whyMeDivider',
  'whyMeDecor',
  'whyMeHeading',
  'whyMeBody',
  'whyMeBullet',
  'sideLabel',
  'sideTitle',
  'sideSubtitle',
];

export const PORTFOLIO_ABOUT_COLOR_SLOT_OPTIONS: {
  value: AboutColorSlot;
  label: string;
  description: string;
}[] = [
  { value: 'sectionBackground', label: 'Section background', description: 'Solid section fill.' },
  { value: 'sectionGradientFrom', label: 'Gradient start', description: 'Start of the section gradient.' },
  { value: 'sectionGradientTo', label: 'Gradient end', description: 'End of the section gradient.' },
  { value: 'sectionSplitA', label: 'Split zone A', description: 'First split background zone.' },
  { value: 'sectionSplitB', label: 'Split zone B', description: 'Second split background zone.' },
  { value: 'sectionDivider', label: 'Split divider', description: 'Line between split zones.' },
  { value: 'title', label: 'Section title', description: 'About heading.' },
  { value: 'subtitle', label: 'Section subtitle', description: 'Intro under the title.' },
  { value: 'accent', label: 'Accent', description: 'Rating accent, icons, and marker accents.' },
  { value: 'cardBorder', label: 'Stats card border', description: 'Outline around stat cards.' },
  { value: 'cardBackground', label: 'Stats card background', description: 'Fill behind stat values.' },
  { value: 'cardBackgroundA', label: 'Stats split A', description: 'First zone on split stat cards.' },
  { value: 'cardBackgroundB', label: 'Stats split B', description: 'Second zone on split stat cards.' },
  { value: 'cardDivider', label: 'Stats divider', description: 'Divider on split stat cards.' },
  { value: 'statsValue', label: 'Stat value', description: 'Numbers on stat cards.' },
  { value: 'statsLabel', label: 'Stat label', description: 'YEARS / CONTENT labels.' },
  { value: 'statsIcon', label: 'Stat icon', description: 'Icons on stat cards.' },
  { value: 'sidePanelBorder', label: 'Side panel border', description: 'Profile panel outline.' },
  { value: 'sidePanelBackground', label: 'Side panel background', description: 'Profile panel fill.' },
  { value: 'sidePanelBackgroundA', label: 'Side panel split A', description: 'First split zone on profile panel.' },
  { value: 'sidePanelBackgroundB', label: 'Side panel split B', description: 'Second split zone on profile panel.' },
  { value: 'sidePanelDivider', label: 'Side panel divider', description: 'Divider on profile panel.' },
  { value: 'whyMeBorder', label: 'Why me border', description: 'Outline on Why me blocks.' },
  { value: 'whyMeBackground', label: 'Why me background', description: 'Fill on Why me blocks.' },
  { value: 'whyMeBackgroundA', label: 'Why me split A', description: 'First split zone on Why me blocks.' },
  { value: 'whyMeBackgroundB', label: 'Why me split B', description: 'Second split zone on Why me blocks.' },
  { value: 'whyMeDivider', label: 'Why me divider', description: 'Divider on Why me blocks.' },
  { value: 'whyMeDecor', label: 'Why me decor', description: 'Decorative shape color.' },
  { value: 'whyMeHeading', label: 'Why me heading', description: 'Section heading above blocks.' },
  { value: 'whyMeBody', label: 'Why me body', description: 'Paragraph text in blocks.' },
  { value: 'whyMeBullet', label: 'Why me bullets', description: 'Bullet list items.' },
  { value: 'sideLabel', label: 'Side panel label', description: 'LOCATION / LANGUAGES captions (muted).' },
  { value: 'sideTitle', label: 'Side panel title', description: 'Main value in profile rows.' },
  { value: 'sideSubtitle', label: 'Side panel subtitle', description: 'Secondary profile line.' },
];

export const DARK_ABOUT_PALETTE: PortfolioAboutPalette = { ...DEFAULT_HERO_PALETTE };
export const DEFAULT_ABOUT_PALETTE: PortfolioAboutPalette = { ...DARK_ABOUT_PALETTE };

export function computeLightAboutPalette(
  dark: Partial<PortfolioAboutPalette>
): PortfolioAboutPalette {
  return computeLightPalette(mergeHeroPalette(DARK_ABOUT_PALETTE, dark));
}

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
  whyMeBorder: 'bordure',
  whyMeBackground: 'neutre',
  whyMeBackgroundA: 'neutre',
  whyMeBackgroundB: 'fond',
  whyMeDivider: 'bordure',
  whyMeDecor: 'principal',
  whyMeHeading: 'texteFaint',
  whyMeBody: 'texteMuted',
  whyMeBullet: 'texteMuted',
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
  whyMeBorder: 'whyMeBorderColor',
  whyMeBackground: 'whyMeBackgroundColor',
  whyMeBackgroundA: 'whyMeBackgroundColorA',
  whyMeBackgroundB: 'whyMeBackgroundColorB',
  whyMeDivider: 'whyMeDividerColor',
  whyMeDecor: 'whyMeDecorColor',
  whyMeHeading: 'whyMeHeadingColor',
  whyMeBody: 'elementStyles.whyMeBody.color',
  whyMeBullet: 'elementStyles.whyMeBullet.color',
  sideLabel: 'elementStyles.sideLabel.color',
  sideTitle: 'elementStyles.sideTitle.color',
  sideSubtitle: 'elementStyles.sideSubtitle.color',
};

const ABOUT_ELEMENT_STYLE_SLOT: Partial<Record<AboutColorSlot, AboutElementStyleTarget>> = {
  whyMeBody: 'whyMeBody',
  whyMeBullet: 'whyMeBullet',
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
    // Keep whyMeBackgroundEnabled as the user's show/hide choice — only paint the hex.
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
  patch.whyMeMarkerColor = principal;
  patch.sidePanelMarkerColor = principal;

  if (elementStyles) patch.elementStyles = elementStyles;

  return patch as AboutPalettePatch;
}

export function patchAboutPalette(
  about: AboutPaletteHost,
  palettePatch: Partial<PortfolioAboutPalette>
): AboutPalettePatch {
  const palette = mergeAboutPalette(DEFAULT_ABOUT_PALETTE, {
    ...about.aboutPalette,
    ...palettePatch,
  });
  return applyAboutPaletteToSettings({ ...about, aboutPalette: palette });
}

export function patchAboutSlotColor(
  about: AboutPaletteHost,
  slot: AboutColorSlot,
  hex: string
): AboutPalettePatch {
  const bindings = mergeAboutColorBindings(DEFAULT_ABOUT_COLOR_BINDINGS, about.aboutColorBindings);
  return patchAboutPalette(about, { [bindings[slot]]: hex });
}

export function patchAboutColorBinding(
  about: AboutPaletteHost,
  slot: AboutColorSlot,
  token: HeroPaletteTokenId
): AboutPalettePatch {
  const bindings = mergeAboutColorBindings(DEFAULT_ABOUT_COLOR_BINDINGS, {
    ...about.aboutColorBindings,
    [slot]: token,
  });
  return applyAboutPaletteToSettings({ ...about, aboutColorBindings: bindings });
}

export function patchAboutColorFieldManual(
  about: AboutPaletteHost,
  slot: AboutColorSlot,
  hex: string
): AboutPalettePatch {
  const elementTarget = ABOUT_ELEMENT_STYLE_SLOT[slot];
  if (elementTarget) {
    const elementStyles = paintAboutElementColor(about.elementStyles, elementTarget, hex);
    return elementStyles ? { elementStyles } : {};
  }
  return { [ABOUT_SLOT_TO_FIELD[slot]]: hex } as AboutPalettePatch;
}

export function patchAboutColorField(
  about: AboutPaletteHost & { useHeroPalette?: boolean },
  slot: AboutColorSlot,
  hex: string
): AboutPalettePatch {
  if (about.useHeroPalette === false) {
    return patchAboutColorFieldManual(about, slot, hex);
  }
  return patchAboutSlotColor(about, slot, hex);
}

export const ABOUT_STYLE_TARGET_COLOR_SLOT: Record<AboutElementStyleTarget, AboutColorSlot> = {
  whyMeBody: 'whyMeBody',
  whyMeBullet: 'whyMeBullet',
  sideLabel: 'sideLabel',
  sideTitle: 'sideTitle',
  sideSubtitle: 'sideSubtitle',
};
