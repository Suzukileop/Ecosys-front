/**
 * Navigation palette — same 8 semantic tokens as the Hero section.
 * Each nav color slot binds to a token; editing a token restyles every
 * bound color at once, while concrete hex fields keep driving the render.
 */

import { DEFAULT_HERO_PALETTE, HERO_PALETTE_TOKEN_IDS, mergeHeroPalette, resolveHeroPaletteColor, type HeroPaletteTokenId, type PortfolioHeroPalette } from '@/components/portfolio/portfolio-hero-palette-settings';
import type { PortfolioNavSettings } from '@/components/portfolio/portfolio-settings-types';

export type PortfolioNavPalette = PortfolioHeroPalette;

/** Nav color slots that can bind to a palette token. */
export type NavColorSlot =
  | 'barBackground'
  | 'barBorder'
  | 'itemIcon'
  | 'itemText'
  | 'itemBackground'
  | 'itemBorder'
  | 'itemHoverIcon'
  | 'itemHoverText'
  | 'itemHoverBackground'
  | 'itemHoverBorder'
  | 'activeAccent'
  | 'handleBackground'
  | 'handleIcon'
  | 'handleBorder'
  | 'contactBackground'
  | 'contactText'
  | 'contactBorder'
  | 'linkIconBackground'
  | 'linkIconColor'
  | 'linkIconBorder'
  | 'customExtraBackground'
  | 'customExtraText'
  | 'customExtraBorder';

export type PortfolioNavColorBindings = Record<NavColorSlot, HeroPaletteTokenId>;

/** Slots frozen when the custom extra keeps hand-picked hex colors. */
const NAV_CUSTOM_EXTRA_SLOTS: NavColorSlot[] = [
  'customExtraBackground',
  'customExtraText',
  'customExtraBorder',
];

const NAV_COLOR_SLOT_IDS: NavColorSlot[] = [
  'barBackground',
  'barBorder',
  'itemIcon',
  'itemText',
  'itemBackground',
  'itemBorder',
  'itemHoverIcon',
  'itemHoverText',
  'itemHoverBackground',
  'itemHoverBorder',
  'activeAccent',
  'handleBackground',
  'handleIcon',
  'handleBorder',
  'contactBackground',
  'contactText',
  'contactBorder',
  'linkIconBackground',
  'linkIconColor',
  'linkIconBorder',
  'customExtraBackground',
  'customExtraText',
  'customExtraBorder',
];

/**
 * Validated dark-mode palette (site on black background) — same tokens as the
 * Hero defaults: exact brand orange / teal, light text, dark surfaces.
 */
const DARK_NAV_PALETTE: PortfolioNavPalette = { ...DEFAULT_HERO_PALETTE };

/** Nav palette defaults follow the validated dark design. */
export const DEFAULT_NAV_PALETTE: PortfolioNavPalette = { ...DARK_NAV_PALETTE };

export const DEFAULT_NAV_COLOR_BINDINGS: PortfolioNavColorBindings = {
  barBackground: 'neutre',
  barBorder: 'bordure',
  itemIcon: 'texteMuted',
  itemText: 'texteMuted',
  itemBackground: 'neutre',
  itemBorder: 'bordure',
  itemHoverIcon: 'principal',
  itemHoverText: 'texteFort',
  itemHoverBackground: 'principal',
  itemHoverBorder: 'principal',
  activeAccent: 'principal',
  handleBackground: 'neutre',
  handleIcon: 'texteFort',
  handleBorder: 'bordure',
  contactBackground: 'principal',
  contactText: 'texteFort',
  contactBorder: 'bordure',
  linkIconBackground: 'neutre',
  linkIconColor: 'texteMuted',
  linkIconBorder: 'bordure',
  customExtraBackground: 'neutre',
  customExtraText: 'texteFort',
  customExtraBorder: 'bordure',
};

/** Concrete PortfolioNavSettings hex field for each slot. */
const NAV_SLOT_TO_FIELD: Record<NavColorSlot, string> = {
  barBackground: 'barBackgroundColor',
  barBorder: 'barBorderColor',
  itemIcon: 'itemIconColor',
  itemText: 'itemTextColor',
  itemBackground: 'itemBackgroundColor',
  itemBorder: 'itemBorderColor',
  itemHoverIcon: 'itemHoverIconColor',
  itemHoverText: 'itemHoverTextColor',
  itemHoverBackground: 'itemHoverBackgroundColor',
  itemHoverBorder: 'itemHoverBorderColor',
  activeAccent: 'activeAccentColor',
  handleBackground: 'menuHandleBackgroundColor',
  handleIcon: 'menuHandleIconColor',
  handleBorder: 'menuHandleBorderColor',
  contactBackground: 'contactButtonBackgroundColor',
  contactText: 'contactButtonColor',
  contactBorder: 'contactButtonBorderColor',
  linkIconBackground: 'linkIconBackgroundColor',
  linkIconColor: 'linkIconColor',
  linkIconBorder: 'linkIconBorderColor',
  customExtraBackground: 'customExtraBackgroundColor',
  customExtraText: 'customExtraTextColor',
  customExtraBorder: 'customExtraBorderColor',
};

type NavPaletteHost = {
  navPalette?: Partial<PortfolioNavPalette>;
  navColorBindings?: Partial<PortfolioNavColorBindings>;
  /** Custom extra keeps its hand-picked hex colors instead of palette tokens. */
  customExtraColorsManual?: boolean;
};

type NavPalettePatch = Partial<PortfolioNavSettings>;

export function mergeNavPalette(base: PortfolioNavPalette, patch: unknown): PortfolioNavPalette {
  return mergeHeroPalette(base, patch);
}

export function mergeNavColorBindings(
  base: PortfolioNavColorBindings,
  patch: unknown
): PortfolioNavColorBindings {
  if (!patch || typeof patch !== 'object' || Array.isArray(patch)) return { ...base };
  const record = patch as Record<string, unknown>;
  const next = { ...base };
  for (const slot of NAV_COLOR_SLOT_IDS) {
    const value = record[slot];
    if (typeof value === 'string' && (HERO_PALETTE_TOKEN_IDS as string[]).includes(value)) {
      next[slot] = value as HeroPaletteTokenId;
    }
  }
  return next;
}

/**
 * Push palette + bindings into every bound concrete nav hex field.
 * Render paths keep reading hex — no runtime token lookup required.
 */
export function applyNavPaletteToSettings(navigation: NavPaletteHost): NavPalettePatch {
  const palette = mergeNavPalette(DEFAULT_NAV_PALETTE, navigation.navPalette);
  const bindings = mergeNavColorBindings(DEFAULT_NAV_COLOR_BINDINGS, navigation.navColorBindings);

  const patch: Record<string, unknown> = {
    navPalette: palette,
    navColorBindings: bindings,
  };
  const skipCustomExtra = navigation.customExtraColorsManual === true;
  for (const slot of NAV_COLOR_SLOT_IDS) {
    if (skipCustomExtra && NAV_CUSTOM_EXTRA_SLOTS.includes(slot)) continue;
    patch[NAV_SLOT_TO_FIELD[slot]] = resolveHeroPaletteColor(palette, bindings[slot]);
  }
  return patch as NavPalettePatch;
}

/** Patch palette tokens, then sync every bound hex field. */
export function patchNavPalette(
  navigation: NavPaletteHost,
  palettePatch: Partial<PortfolioNavPalette>
): NavPalettePatch {
  const palette = mergeNavPalette(DEFAULT_NAV_PALETTE, {
    ...navigation.navPalette,
    ...palettePatch,
  });
  return applyNavPaletteToSettings({ ...navigation, navPalette: palette });
}
