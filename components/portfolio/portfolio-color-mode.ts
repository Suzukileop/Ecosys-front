import {
  applyHeroPaletteToPresentation,
  computeLightPalette,
  DEFAULT_HERO_PALETTE,
  INDIGO_DARK_HERO_PALETTE,
  INDIGO_LIGHT_HERO_PALETTE,
  LIGHT_HERO_PALETTE,
  SAFRAN_DARK_HERO_PALETTE,
  SAFRAN_LIGHT_HERO_PALETTE,
  CITRON_DARK_HERO_PALETTE,
  CITRON_LIGHT_HERO_PALETTE,
  ROUGE_DARK_HERO_PALETTE,
  ROUGE_LIGHT_HERO_PALETTE,
  ECARLATE_DARK_HERO_PALETTE,
  ECARLATE_LIGHT_HERO_PALETTE,
  ARDOISE_DARK_HERO_PALETTE,
  ARDOISE_LIGHT_HERO_PALETTE,
  VERDANT_DARK_HERO_PALETTE,
  VERDANT_LIGHT_HERO_PALETTE,
  VIVE_DARK_HERO_PALETTE,
  VIVE_LIGHT_HERO_PALETTE,
  matchHeroPalettePresetId,
  mergeHeroPalette,
  type PortfolioHeroPalette,
} from '@/components/portfolio/portfolio-hero-palette-settings';
import type { CSSProperties } from 'react';
import { patchNavPalette } from '@/components/portfolio/portfolio-nav-palette-settings';
import { patchWorkPalette } from '@/components/portfolio/portfolio-work-palette-settings';
import { applyGalleryPaletteToSettings } from '@/components/portfolio/portfolio-gallery-palette-settings';
import {
  applyHeroPaletteToAbout,
  applyHeroPaletteToAboutUs,
  applyHeroPaletteToContact,
  applyHeroPaletteToExperience,
  applyHeroPaletteToFaq,
  applyHeroPaletteToFooter,
  applyHeroPaletteToServices,
  applyHeroPaletteToTeam,
  applyHeroPaletteToTools,
} from '@/components/portfolio/portfolio-section-palette';
import { syncExperiencePeriodRulePair } from '@/components/portfolio/portfolio-experience-palette-settings';
import type { PortfolioGlobalSettings } from '@/components/portfolio/portfolio-global-settings';
import type { PortfolioSettings } from '@/components/portfolio/portfolio-settings-types';

/** Site-wide appearance driven from Global → Theme. */
export type PortfolioColorMode = 'dark' | 'light';

export type PortfolioPaletteFamily =
  | 'indigo'
  | 'classic'
  | 'verdant'
  | 'vive'
  | 'safran'
  | 'citron'
  | 'rouge'
  | 'ecarlate'
  | 'ardoise'
  | 'custom';

export const PORTFOLIO_COLOR_MODE_OPTIONS: {
  value: PortfolioColorMode;
  label: string;
  description: string;
}[] = [
  {
    value: 'dark',
    label: 'Dark mode',
    description: 'Uses the dark half of the selected Global palette pair.',
  },
  {
    value: 'light',
    label: 'Light mode',
    description: 'Uses the light half of the selected Global palette pair.',
  },
];

/** Classic defaults only — prefer resolveActivePortfolioPalette for live settings. */
export function resolveColorModePalette(mode: PortfolioColorMode): PortfolioHeroPalette {
  return mode === 'light' ? { ...LIGHT_HERO_PALETTE } : { ...DEFAULT_HERO_PALETTE };
}

/** Active global palette tokens as CSS vars on `.pf-theme-root` — animatable via @property. */
export function portfolioPaletteCssVars(palette: PortfolioHeroPalette): CSSProperties {
  return {
    '--pf-palette-principal': palette.principal,
    '--pf-palette-secondaire': palette.secondaire,
    '--pf-palette-texte-fort': palette.texteFort,
    '--pf-palette-texte-muted': palette.texteMuted,
    '--pf-palette-texte-faint': palette.texteFaint,
    '--pf-palette-neutre': palette.neutre,
    '--pf-palette-fond': palette.fond,
    '--pf-palette-bordure': palette.bordure,
    '--pf-accent': palette.principal,
    '--pf-surface': palette.neutre,
    '--pf-muted-surface': palette.neutre,
    '--pf-motif': palette.bordure,
    '--pf-cta': palette.texteFort,
    '--pf-cta-hover': palette.texteMuted,
  } as CSSProperties;
}

export function resolveActivePortfolioPalette(
  global: Pick<PortfolioGlobalSettings, 'colorMode' | 'paletteDark' | 'paletteLight'>
): PortfolioHeroPalette {
  const mode = global.colorMode === 'light' ? 'light' : 'dark';
  // Stored slot is the source of truth — only use Classic as fill for missing keys.
  if (mode === 'light') {
    return mergeHeroPalette(LIGHT_HERO_PALETTE, global.paletteLight);
  }
  return mergeHeroPalette(DEFAULT_HERO_PALETTE, global.paletteDark);
}

/**
 * Infer family from the stored pair (for migration / UI when family is missing).
 */
export function inferPaletteFamily(
  global: Pick<PortfolioGlobalSettings, 'paletteDark' | 'paletteLight' | 'paletteFamily'>
): PortfolioPaletteFamily {
  if (
    global.paletteFamily === 'indigo' ||
    global.paletteFamily === 'classic' ||
    global.paletteFamily === 'verdant' ||
    global.paletteFamily === 'vive' ||
    global.paletteFamily === 'safran' ||
    global.paletteFamily === 'citron' ||
    global.paletteFamily === 'rouge' ||
    global.paletteFamily === 'ecarlate' ||
    global.paletteFamily === 'ardoise' ||
    global.paletteFamily === 'custom'
  ) {
    return global.paletteFamily;
  }
  const darkId = matchHeroPalettePresetId(global.paletteDark);
  const lightId = matchHeroPalettePresetId(global.paletteLight);
  if (
    (darkId === 'indigo-dark' || darkId === 'indigo-light') &&
    (lightId === 'indigo-light' || lightId === 'indigo-dark' || lightId == null)
  ) {
    return 'indigo';
  }
  if (
    (darkId === 'classic-dark' || darkId === 'classic-light') &&
    (lightId === 'classic-light' || lightId === 'classic-dark' || lightId == null)
  ) {
    return 'classic';
  }
  if (
    (darkId === 'verdant-dark' || darkId === 'verdant-light') &&
    (lightId === 'verdant-light' || lightId === 'verdant-dark' || lightId == null)
  ) {
    return 'verdant';
  }
  if (
    (darkId === 'vive-dark' || darkId === 'vive-light') &&
    (lightId === 'vive-light' || lightId === 'vive-dark' || lightId == null)
  ) {
    return 'vive';
  }
  if (
    (darkId === 'safran-dark' || darkId === 'safran-light') &&
    (lightId === 'safran-light' || lightId === 'safran-dark' || lightId == null)
  ) {
    return 'safran';
  }
  if (
    (darkId === 'citron-dark' || darkId === 'citron-light') &&
    (lightId === 'citron-light' || lightId === 'citron-dark' || lightId == null)
  ) {
    return 'citron';
  }
  if (
    (darkId === 'rouge-dark' || darkId === 'rouge-light') &&
    (lightId === 'rouge-light' || lightId === 'rouge-dark' || lightId == null)
  ) {
    return 'rouge';
  }
  if (
    (darkId === 'ecarlate-dark' || darkId === 'ecarlate-light') &&
    (lightId === 'ecarlate-light' || lightId === 'ecarlate-dark' || lightId == null)
  ) {
    return 'ecarlate';
  }
  if (
    (darkId === 'ardoise-dark' || darkId === 'ardoise-light') &&
    (lightId === 'ardoise-light' || lightId === 'ardoise-dark' || lightId == null)
  ) {
    return 'ardoise';
  }
  if (darkId?.startsWith('indigo') || lightId?.startsWith('indigo')) return 'indigo';
  if (darkId?.startsWith('classic') || lightId?.startsWith('classic')) return 'classic';
  if (darkId?.startsWith('verdant') || lightId?.startsWith('verdant')) return 'verdant';
  if (darkId?.startsWith('vive') || lightId?.startsWith('vive')) return 'vive';
  if (darkId?.startsWith('safran') || lightId?.startsWith('safran')) return 'safran';
  if (darkId?.startsWith('citron') || lightId?.startsWith('citron')) return 'citron';
  if (darkId?.startsWith('rouge') || lightId?.startsWith('rouge')) return 'rouge';
  if (darkId?.startsWith('ecarlate') || lightId?.startsWith('ecarlate')) return 'ecarlate';
  if (darkId?.startsWith('ardoise') || lightId?.startsWith('ardoise')) return 'ardoise';
  return 'custom';
}

/**
 * Paint the active Global palette onto Hero, Nav, page fill, and every section
 * that follows the site palette.
 */
export function applyActivePortfolioPalette(settings: PortfolioSettings): PortfolioSettings {
  const palette = resolveActivePortfolioPalette(settings.global);
  const lightPalette = resolveActivePortfolioPalette({ ...settings.global, colorMode: 'light' });
  const darkPalette = resolveActivePortfolioPalette({ ...settings.global, colorMode: 'dark' });
  const heroBase = {
    ...settings.hero,
    useHeroPalette: settings.hero.useHeroPalette !== false,
    palette,
  };
  const hero =
    heroBase.useHeroPalette === false
      ? { ...settings.hero, palette }
      : {
          ...heroBase,
          ...applyHeroPaletteToPresentation(heroBase),
          useHeroPalette: true,
        };

  const navigation =
    settings.navigation.useNavPalette === false
      ? {
          ...settings.navigation,
          navPalette: palette,
        }
      : {
          ...settings.navigation,
          ...patchNavPalette(settings.navigation, palette),
          useNavPalette: true,
        };

  const global = {
    ...settings.global,
    backgroundColor: palette.fond,
    ...(settings.global.backgroundImageEnabled
      ? {}
      : { backgroundEnabled: true, backgroundImageEnabled: false }),
  };

  const experienceNext =
    settings.experience.useHeroPalette === false
      ? { ...settings.experience }
      : {
          ...settings.experience,
          ...applyHeroPaletteToExperience(
            { ...settings.experience, useHeroPalette: true },
            palette
          ),
        };
  const periodRulePair =
    settings.experience.useHeroPalette === false
      ? null
      : syncExperiencePeriodRulePair(experienceNext, lightPalette, darkPalette);

  return {
    ...settings,
    global,
    navigation,
    hero,
    work: {
      ...settings.work,
      ...(settings.work.useHeroPalette === false
        ? { workPalette: palette }
        : (patchWorkPalette(settings.work, palette) as Partial<(typeof settings)['work']>)),
      ...(settings.work.useHeroPalette === false ? {} : { useHeroPalette: true }),
    },
    services:
      settings.services.useHeroPalette === false
        ? { ...settings.services, useHeroPalette: false }
        : {
            ...settings.services,
            ...applyHeroPaletteToServices({ ...settings.services, useHeroPalette: true }, palette),
          },
    about:
      settings.about.useHeroPalette === false
        ? { ...settings.about }
        : {
            ...settings.about,
            ...applyHeroPaletteToAbout({ ...settings.about, useHeroPalette: true }, palette),
          },
    aboutUs:
      settings.aboutUs.useHeroPalette === false
        ? { ...settings.aboutUs }
        : {
            ...settings.aboutUs,
            ...applyHeroPaletteToAboutUs({ ...settings.aboutUs, useHeroPalette: true }, palette),
          },
    experience: periodRulePair ? { ...experienceNext, ...periodRulePair } : experienceNext,
    team:
      settings.team.useHeroPalette === false
        ? { ...settings.team }
        : {
            ...settings.team,
            ...applyHeroPaletteToTeam({ ...settings.team, useHeroPalette: true }, palette),
          },
    tools:
      settings.tools.useHeroPalette === false
        ? { ...settings.tools }
        : {
            ...settings.tools,
            ...applyHeroPaletteToTools({ ...settings.tools, useHeroPalette: true }, palette),
          },
    gallery:
      settings.gallery.useHeroPalette === false
        ? { ...settings.gallery }
        : {
            ...settings.gallery,
            ...applyGalleryPaletteToSettings(settings.gallery, palette),
            useHeroPalette: true,
          },
    faq:
      settings.faq.useHeroPalette === false
        ? { ...settings.faq }
        : {
            ...settings.faq,
            ...applyHeroPaletteToFaq({ ...settings.faq, useHeroPalette: true }, palette),
          },
    contact:
      settings.contact.useHeroPalette === false
        ? { ...settings.contact }
        : {
            ...settings.contact,
            ...applyHeroPaletteToContact({ ...settings.contact, useHeroPalette: true }, palette),
          },
    footer:
      settings.footer.useHeroPalette === false
        ? { ...settings.footer }
        : {
            ...settings.footer,
            ...applyHeroPaletteToFooter({ ...settings.footer, useHeroPalette: true }, palette),
          },
  };
}

/**
 * Switch dark / light inside the selected family only.
 * Does NOT rewrite paletteDark/paletteLight from Hero (that mixed families).
 */
export function applyPortfolioColorMode(
  settings: PortfolioSettings,
  mode: PortfolioColorMode
): PortfolioSettings {
  if (settings.global.colorMode === mode) {
    return applyActivePortfolioPalette(settings);
  }

  return applyActivePortfolioPalette({
    ...settings,
    global: {
      ...settings.global,
      colorMode: mode,
      paletteFamily: inferPaletteFamily(settings.global),
    },
  });
}

/**
 * Patch tokens on the active Global slot (dark or light), then repaint the site.
 * Marks the family as custom so Light mode still flips within this edited pair.
 */
export function patchActiveGlobalPalette(
  settings: PortfolioSettings,
  patch: Partial<PortfolioHeroPalette>
): PortfolioSettings {
  const mode = settings.global.colorMode === 'light' ? 'light' : 'dark';
  const base =
    mode === 'light'
      ? mergeHeroPalette(LIGHT_HERO_PALETTE, settings.global.paletteLight)
      : mergeHeroPalette(DEFAULT_HERO_PALETTE, settings.global.paletteDark);
  const nextPalette = mergeHeroPalette(base, patch);
  const global = {
    ...settings.global,
    paletteFamily: 'custom' as const,
    ...(mode === 'light' ? { paletteLight: nextPalette } : { paletteDark: nextPalette }),
  };
  return applyActivePortfolioPalette({ ...settings, global });
}

/**
 * Load a named dark+light preset pair and select that family.
 * Light mode will then flip only within this pair.
 */
export function applyGlobalPalettePair(
  settings: PortfolioSettings,
  paletteDark: PortfolioHeroPalette,
  paletteLight: PortfolioHeroPalette | undefined,
  family: PortfolioPaletteFamily = 'custom'
): PortfolioSettings {
  const dark = mergeHeroPalette(DEFAULT_HERO_PALETTE, paletteDark);
  const light = mergeHeroPalette(
    LIGHT_HERO_PALETTE,
    paletteLight ?? computeLightPalette(dark)
  );
  return applyActivePortfolioPalette({
    ...settings,
    global: {
      ...settings.global,
      paletteFamily: family,
      paletteDark: dark,
      paletteLight: light,
    },
  });
}

/** Preset pairs selectable in Global → Theme. */
export function resolveGlobalPalettePresetPair(
  family: 'indigo' | 'classic' | 'verdant' | 'vive' | 'safran' | 'citron' | 'rouge' | 'ecarlate' | 'ardoise'
): { dark: PortfolioHeroPalette; light: PortfolioHeroPalette } {
  if (family === 'indigo') {
    return {
      dark: { ...INDIGO_DARK_HERO_PALETTE },
      light: { ...INDIGO_LIGHT_HERO_PALETTE },
    };
  }
  if (family === 'verdant') {
    return {
      dark: { ...VERDANT_DARK_HERO_PALETTE },
      light: { ...VERDANT_LIGHT_HERO_PALETTE },
    };
  }
  if (family === 'vive') {
    return {
      dark: { ...VIVE_DARK_HERO_PALETTE },
      light: { ...VIVE_LIGHT_HERO_PALETTE },
    };
  }
  if (family === 'safran') {
    return {
      dark: { ...SAFRAN_DARK_HERO_PALETTE },
      light: { ...SAFRAN_LIGHT_HERO_PALETTE },
    };
  }
  if (family === 'citron') {
    return {
      dark: { ...CITRON_DARK_HERO_PALETTE },
      light: { ...CITRON_LIGHT_HERO_PALETTE },
    };
  }
  if (family === 'rouge') {
    return {
      dark: { ...ROUGE_DARK_HERO_PALETTE },
      light: { ...ROUGE_LIGHT_HERO_PALETTE },
    };
  }
  if (family === 'ecarlate') {
    return {
      dark: { ...ECARLATE_DARK_HERO_PALETTE },
      light: { ...ECARLATE_LIGHT_HERO_PALETTE },
    };
  }
  if (family === 'ardoise') {
    return {
      dark: { ...ARDOISE_DARK_HERO_PALETTE },
      light: { ...ARDOISE_LIGHT_HERO_PALETTE },
    };
  }
  return {
    dark: { ...DEFAULT_HERO_PALETTE },
    light: { ...LIGHT_HERO_PALETTE },
  };
}

/**
 * Repair pairs corrupted by an older Light-mode bug that wrote dark presets
 * into the light slot (or vice versa), so toggles looked like family swaps.
 */
function repairCorruptedGlobalPalettePair(
  global: PortfolioGlobalSettings
): PortfolioGlobalSettings {
  const family = inferPaletteFamily(global);
  const darkId = matchHeroPalettePresetId(global.paletteDark);
  const lightId = matchHeroPalettePresetId(global.paletteLight);
  const lightLooksDark =
    lightId === 'classic-dark' ||
    lightId === 'indigo-dark' ||
    lightId === 'verdant-dark' ||
    lightId === 'vive-dark' ||
    lightId === 'safran-dark' ||
    lightId === 'citron-dark' ||
    lightId === 'rouge-dark' ||
    lightId === 'ecarlate-dark' ||
    lightId === 'ardoise-dark' ||
    (lightId == null &&
      typeof global.paletteLight?.fond === 'string' &&
      /^#0/i.test(global.paletteLight.fond.trim()));
  const darkLooksLight =
    darkId === 'classic-light' ||
    darkId === 'indigo-light' ||
    darkId === 'verdant-light' ||
    darkId === 'vive-light' ||
    darkId === 'safran-light' ||
    darkId === 'citron-light' ||
    darkId === 'rouge-light' ||
    darkId === 'ecarlate-light' ||
    darkId === 'ardoise-light' ||
    (darkId == null &&
      typeof global.paletteDark?.fond === 'string' &&
      /^#f/i.test(global.paletteDark.fond.trim()));

  if (!lightLooksDark && !darkLooksLight) {
    return { ...global, paletteFamily: family };
  }

  if (family === 'indigo') {
    return {
      ...global,
      paletteFamily: 'indigo',
      paletteDark: darkLooksLight
        ? { ...INDIGO_DARK_HERO_PALETTE }
        : mergeHeroPalette(DEFAULT_HERO_PALETTE, global.paletteDark),
      paletteLight: lightLooksDark
        ? { ...INDIGO_LIGHT_HERO_PALETTE }
        : mergeHeroPalette(LIGHT_HERO_PALETTE, global.paletteLight),
    };
  }
  if (family === 'verdant') {
    return {
      ...global,
      paletteFamily: 'verdant',
      paletteDark: darkLooksLight
        ? { ...VERDANT_DARK_HERO_PALETTE }
        : mergeHeroPalette(DEFAULT_HERO_PALETTE, global.paletteDark),
      paletteLight: lightLooksDark
        ? { ...VERDANT_LIGHT_HERO_PALETTE }
        : mergeHeroPalette(LIGHT_HERO_PALETTE, global.paletteLight),
    };
  }
  if (family === 'vive') {
    return {
      ...global,
      paletteFamily: 'vive',
      paletteDark: darkLooksLight
        ? { ...VIVE_DARK_HERO_PALETTE }
        : mergeHeroPalette(DEFAULT_HERO_PALETTE, global.paletteDark),
      paletteLight: lightLooksDark
        ? { ...VIVE_LIGHT_HERO_PALETTE }
        : mergeHeroPalette(LIGHT_HERO_PALETTE, global.paletteLight),
    };
  }
  if (family === 'safran') {
    return {
      ...global,
      paletteFamily: 'safran',
      paletteDark: darkLooksLight
        ? { ...SAFRAN_DARK_HERO_PALETTE }
        : mergeHeroPalette(DEFAULT_HERO_PALETTE, global.paletteDark),
      paletteLight: lightLooksDark
        ? { ...SAFRAN_LIGHT_HERO_PALETTE }
        : mergeHeroPalette(LIGHT_HERO_PALETTE, global.paletteLight),
    };
  }
  if (family === 'citron') {
    return {
      ...global,
      paletteFamily: 'citron',
      paletteDark: darkLooksLight
        ? { ...CITRON_DARK_HERO_PALETTE }
        : mergeHeroPalette(DEFAULT_HERO_PALETTE, global.paletteDark),
      paletteLight: lightLooksDark
        ? { ...CITRON_LIGHT_HERO_PALETTE }
        : mergeHeroPalette(LIGHT_HERO_PALETTE, global.paletteLight),
    };
  }
  if (family === 'rouge') {
    return {
      ...global,
      paletteFamily: 'rouge',
      paletteDark: darkLooksLight
        ? { ...ROUGE_DARK_HERO_PALETTE }
        : mergeHeroPalette(DEFAULT_HERO_PALETTE, global.paletteDark),
      paletteLight: lightLooksDark
        ? { ...ROUGE_LIGHT_HERO_PALETTE }
        : mergeHeroPalette(LIGHT_HERO_PALETTE, global.paletteLight),
    };
  }
  if (family === 'ecarlate') {
    return {
      ...global,
      paletteFamily: 'ecarlate',
      paletteDark: darkLooksLight
        ? { ...ECARLATE_DARK_HERO_PALETTE }
        : mergeHeroPalette(DEFAULT_HERO_PALETTE, global.paletteDark),
      paletteLight: lightLooksDark
        ? { ...ECARLATE_LIGHT_HERO_PALETTE }
        : mergeHeroPalette(LIGHT_HERO_PALETTE, global.paletteLight),
    };
  }
  if (family === 'ardoise') {
    return {
      ...global,
      paletteFamily: 'ardoise',
      paletteDark: darkLooksLight
        ? { ...ARDOISE_DARK_HERO_PALETTE }
        : mergeHeroPalette(DEFAULT_HERO_PALETTE, global.paletteDark),
      paletteLight: lightLooksDark
        ? { ...ARDOISE_LIGHT_HERO_PALETTE }
        : mergeHeroPalette(LIGHT_HERO_PALETTE, global.paletteLight),
    };
  }
  if (family === 'classic') {
    return {
      ...global,
      paletteFamily: 'classic',
      paletteDark: darkLooksLight
        ? { ...DEFAULT_HERO_PALETTE }
        : mergeHeroPalette(DEFAULT_HERO_PALETTE, global.paletteDark),
      paletteLight: lightLooksDark
        ? { ...LIGHT_HERO_PALETTE }
        : mergeHeroPalette(LIGHT_HERO_PALETTE, global.paletteLight),
    };
  }

  // Custom / unknown: rebuild the missing half from the intact side.
  if (lightLooksDark && !darkLooksLight) {
    const dark = mergeHeroPalette(DEFAULT_HERO_PALETTE, global.paletteDark);
    return {
      ...global,
      paletteFamily: 'custom',
      paletteDark: dark,
      paletteLight: computeLightPalette(dark),
    };
  }
  if (darkLooksLight && !lightLooksDark) {
    const light = mergeHeroPalette(LIGHT_HERO_PALETTE, global.paletteLight);
    return {
      ...global,
      paletteFamily: 'custom',
      paletteLight: light,
      paletteDark: mergeHeroPalette(DEFAULT_HERO_PALETTE, global.paletteDark),
    };
  }
  return { ...global, paletteFamily: family };
}

/**
 * Seed Global pair from legacy Hero palette when stored settings lack the pair.
 */
export function seedGlobalPalettePairFromHero(
  global: PortfolioGlobalSettings,
  heroPalette: PortfolioHeroPalette | undefined,
  hadStoredPair: boolean
): PortfolioGlobalSettings {
  if (hadStoredPair) {
    return repairCorruptedGlobalPalettePair(global);
  }
  const mode = global.colorMode === 'light' ? 'light' : 'dark';
  const fromHero = mergeHeroPalette(
    mode === 'light' ? LIGHT_HERO_PALETTE : DEFAULT_HERO_PALETTE,
    heroPalette
  );
  const presetId = matchHeroPalettePresetId(fromHero);
  const family: PortfolioPaletteFamily = presetId?.startsWith('indigo')
    ? 'indigo'
    : presetId?.startsWith('classic')
      ? 'classic'
      : presetId?.startsWith('verdant')
        ? 'verdant'
        : presetId?.startsWith('vive')
          ? 'vive'
          : presetId?.startsWith('safran')
            ? 'safran'
            : presetId?.startsWith('citron')
              ? 'citron'
              : presetId?.startsWith('rouge')
                ? 'rouge'
                : presetId?.startsWith('ecarlate')
                  ? 'ecarlate'
                  : presetId?.startsWith('ardoise')
                    ? 'ardoise'
                    : 'custom';

  if (family === 'indigo') {
    return {
      ...global,
      paletteFamily: 'indigo',
      paletteDark: { ...INDIGO_DARK_HERO_PALETTE },
      paletteLight: { ...INDIGO_LIGHT_HERO_PALETTE },
    };
  }
  if (family === 'classic') {
    return {
      ...global,
      paletteFamily: 'classic',
      paletteDark: { ...DEFAULT_HERO_PALETTE },
      paletteLight: { ...LIGHT_HERO_PALETTE },
    };
  }
  if (family === 'verdant') {
    return {
      ...global,
      paletteFamily: 'verdant',
      paletteDark: { ...VERDANT_DARK_HERO_PALETTE },
      paletteLight: { ...VERDANT_LIGHT_HERO_PALETTE },
    };
  }
  if (family === 'vive') {
    return {
      ...global,
      paletteFamily: 'vive',
      paletteDark: { ...VIVE_DARK_HERO_PALETTE },
      paletteLight: { ...VIVE_LIGHT_HERO_PALETTE },
    };
  }
  if (family === 'safran') {
    return {
      ...global,
      paletteFamily: 'safran',
      paletteDark: { ...SAFRAN_DARK_HERO_PALETTE },
      paletteLight: { ...SAFRAN_LIGHT_HERO_PALETTE },
    };
  }
  if (family === 'citron') {
    return {
      ...global,
      paletteFamily: 'citron',
      paletteDark: { ...CITRON_DARK_HERO_PALETTE },
      paletteLight: { ...CITRON_LIGHT_HERO_PALETTE },
    };
  }
  if (family === 'rouge') {
    return {
      ...global,
      paletteFamily: 'rouge',
      paletteDark: { ...ROUGE_DARK_HERO_PALETTE },
      paletteLight: { ...ROUGE_LIGHT_HERO_PALETTE },
    };
  }
  if (family === 'ecarlate') {
    return {
      ...global,
      paletteFamily: 'ecarlate',
      paletteDark: { ...ECARLATE_DARK_HERO_PALETTE },
      paletteLight: { ...ECARLATE_LIGHT_HERO_PALETTE },
    };
  }
  if (family === 'ardoise') {
    return {
      ...global,
      paletteFamily: 'ardoise',
      paletteDark: { ...ARDOISE_DARK_HERO_PALETTE },
      paletteLight: { ...ARDOISE_LIGHT_HERO_PALETTE },
    };
  }

  if (mode === 'light') {
    return {
      ...global,
      paletteFamily: 'custom',
      paletteLight: fromHero,
      paletteDark: mergeHeroPalette(DEFAULT_HERO_PALETTE, global.paletteDark),
    };
  }
  return {
    ...global,
    paletteFamily: 'custom',
    paletteDark: fromHero,
    paletteLight: computeLightPalette(fromHero),
  };
}
