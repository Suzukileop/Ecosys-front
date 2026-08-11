/**
 * Navigation palette — same 8 semantic tokens as the Hero section.
 * Each nav color slot binds to a token; editing a token restyles every
 * bound color at once, while concrete hex fields keep driving the render.
 */

import {
  computeLightPalette,
  DEFAULT_HERO_PALETTE,
  HERO_PALETTE_TOKEN_IDS,
  INDIGO_DARK_HERO_PALETTE,
  INDIGO_LIGHT_HERO_PALETTE,
  LIGHT_HERO_PALETTE,
  VERDANT_DARK_HERO_PALETTE,
  VERDANT_LIGHT_HERO_PALETTE,
  VIVE_DARK_HERO_PALETTE,
  VIVE_LIGHT_HERO_PALETTE,
  PORTFOLIO_HERO_PALETTE_PRESETS,
  matchHeroPalettePresetId,
  mergeHeroPalette,
  resolveHeroPaletteColor,
  type HeroPaletteTokenId,
  type PortfolioHeroPalette,
} from '@/components/portfolio/portfolio-hero-palette-settings';
import type { PortfolioNavSettings } from '@/components/portfolio/portfolio-settings-types';

export type PortfolioNavPalette = PortfolioHeroPalette;

/** Same named presets as Hero — Indigo/Ambre, Classic, Verdant/Rose, Vive. */
export const PORTFOLIO_NAV_PALETTE_PRESETS = PORTFOLIO_HERO_PALETTE_PRESETS;
export const matchNavPalettePresetId = matchHeroPalettePresetId;
export const INDIGO_DARK_NAV_PALETTE: PortfolioNavPalette = { ...INDIGO_DARK_HERO_PALETTE };
export const INDIGO_LIGHT_NAV_PALETTE: PortfolioNavPalette = { ...INDIGO_LIGHT_HERO_PALETTE };
export const VERDANT_DARK_NAV_PALETTE: PortfolioNavPalette = { ...VERDANT_DARK_HERO_PALETTE };
export const VERDANT_LIGHT_NAV_PALETTE: PortfolioNavPalette = { ...VERDANT_LIGHT_HERO_PALETTE };
export const VIVE_DARK_NAV_PALETTE: PortfolioNavPalette = { ...VIVE_DARK_HERO_PALETTE };
export const VIVE_LIGHT_NAV_PALETTE: PortfolioNavPalette = { ...VIVE_LIGHT_HERO_PALETTE };
export const LIGHT_NAV_PALETTE: PortfolioNavPalette = { ...LIGHT_HERO_PALETTE };

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

export const NAV_COLOR_SLOT_IDS: NavColorSlot[] = [
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

export const PORTFOLIO_NAV_COLOR_SLOT_OPTIONS: {
  value: NavColorSlot;
  label: string;
  description: string;
}[] = [
  { value: 'barBackground', label: 'Bar background', description: 'Outer bar / capsule fill.' },
  { value: 'barBorder', label: 'Bar border', description: 'Outline around the bar shell.' },
  { value: 'itemIcon', label: 'Item icon', description: 'Navigation icon glyphs.' },
  { value: 'itemText', label: 'Item text', description: 'Navigation labels.' },
  { value: 'itemBackground', label: 'Item background', description: 'Fill behind each nav button.' },
  { value: 'itemBorder', label: 'Item border', description: 'Outline around each nav button.' },
  {
    value: 'itemHoverIcon',
    label: 'Hover icon',
    description: 'Icon color while the pointer hovers an inactive item.',
  },
  {
    value: 'itemHoverText',
    label: 'Hover text',
    description: 'Label color while the pointer hovers an inactive item.',
  },
  {
    value: 'itemHoverBackground',
    label: 'Hover background',
    description: 'Soft fill wash on hover (rendered translucent).',
  },
  {
    value: 'itemHoverBorder',
    label: 'Hover border',
    description: 'Outline color while the pointer hovers an inactive item.',
  },
  { value: 'activeAccent', label: 'Active accent', description: 'Highlight on the active item.' },
  { value: 'handleBackground', label: 'Handle background', description: 'Open / close control fill.' },
  { value: 'handleIcon', label: 'Handle icon', description: 'Open / close control glyph.' },
  { value: 'handleBorder', label: 'Handle border', description: 'Open / close control outline.' },
  { value: 'contactBackground', label: 'Contact background', description: 'Contact CTA fill.' },
  { value: 'contactText', label: 'Contact text / icon', description: 'Contact CTA glyph and label.' },
  { value: 'contactBorder', label: 'Contact border', description: 'Contact CTA outline.' },
  { value: 'linkIconBackground', label: 'Link icon background', description: 'Mail / social circle fill.' },
  { value: 'linkIconColor', label: 'Link icon glyph', description: 'Mail / social glyph color.' },
  { value: 'linkIconBorder', label: 'Link icon border', description: 'Mail / social circle outline.' },
  {
    value: 'customExtraBackground',
    label: 'Custom extra background',
    description: 'Fill behind the custom logo / text chip.',
  },
  {
    value: 'customExtraText',
    label: 'Custom extra text',
    description: 'Label color of the custom chip.',
  },
  {
    value: 'customExtraBorder',
    label: 'Custom extra border',
    description: 'Outline around the custom chip.',
  },
];

/**
 * Validated dark-mode palette (site on black background) — same tokens as the
 * Hero defaults: exact brand orange / teal, light text, dark surfaces.
 */
export const DARK_NAV_PALETTE: PortfolioNavPalette = { ...DEFAULT_HERO_PALETTE };

/** Nav palette defaults follow the validated dark design. */
export const DEFAULT_NAV_PALETTE: PortfolioNavPalette = { ...DARK_NAV_PALETTE };

/**
 * Auto-derive the light-mode palette from a dark palette (shared with the
 * Hero): accents keep their hue, text / surfaces invert their lightness.
 */
export function computeLightNavPalette(dark: Partial<PortfolioNavPalette>): PortfolioNavPalette {
  return computeLightPalette(mergeHeroPalette(DARK_NAV_PALETTE, dark));
}

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
  contactText: 'neutre',
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

/** Change the palette token a single slot is bound to, then sync hex fields. */
export function patchNavSlotColor(
  navigation: NavPaletteHost,
  slot: NavColorSlot,
  hex: string
): NavPalettePatch {
  const bindings = mergeNavColorBindings(
    DEFAULT_NAV_COLOR_BINDINGS,
    navigation.navColorBindings
  );
  return patchNavPalette(navigation, { [bindings[slot]]: hex });
}

/** Concrete settings field for a nav color slot (for manual-mode patches). */
export function navSlotHexField(slot: NavColorSlot): string {
  return NAV_SLOT_TO_FIELD[slot];
}

/** Change which token a slot uses, then sync that slot's hex. */
export function patchNavColorBinding(
  navigation: NavPaletteHost,
  slot: NavColorSlot,
  token: HeroPaletteTokenId
): NavPalettePatch {
  const bindings = mergeNavColorBindings(DEFAULT_NAV_COLOR_BINDINGS, {
    ...navigation.navColorBindings,
    [slot]: token,
  });
  return applyNavPaletteToSettings({ ...navigation, navColorBindings: bindings });
}
