import {
  createCustomThemeId,
  DEFAULT_PORTFOLIO_THEME_ID,
  getPortfolioTheme,
  isBuiltinPortfolioThemeId,
  isCustomPortfolioThemeId,
  type PortfolioBuiltinThemeId,
  type PortfolioTheme,
  type PortfolioThemeColors,
  type PortfolioThemeId,
} from '@/components/portfolio/portfolio-themes';
import type { PortfolioSettings } from '@/components/portfolio/portfolio-settings-types';

export type PortfolioCustomThemeSnapshot = Omit<PortfolioSettings, 'themeId' | 'customThemes' | 'updatedAt'>;

export type PortfolioCustomTheme = {
  id: string;
  name: string;
  /** Draft until the creator explicitly saves it. */
  saved: boolean;
  createdAt: string;
  updatedAt: string;
  colors: PortfolioThemeColors;
  cta: string;
  ctaHover: string;
  swatches: [string, string, string, string];
  /** Full personalization snapshot restored when this theme is selected. */
  snapshot: PortfolioCustomThemeSnapshot;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isHex(value: unknown): value is string {
  return typeof value === 'string' && /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(value.trim());
}

export function stripThemeMeta(settings: PortfolioSettings): PortfolioCustomThemeSnapshot {
  const { themeId, customThemes, updatedAt, ...rest } = settings;
  void themeId;
  void customThemes;
  void updatedAt;
  return structuredClone(rest);
}

/** Palette for theme cards / CSS vars — prefer real accents, never title highlight yellow. */
export function extractThemeColorsFromSettings(settings: PortfolioSettings): {
  colors: PortfolioThemeColors;
  cta: string;
  ctaHover: string;
  swatches: [string, string, string, string];
} {
  if (isBuiltinPortfolioThemeId(settings.themeId)) {
    const builtin = getPortfolioTheme(settings.themeId);
    return {
      colors: { ...builtin.colors },
      cta: builtin.cta,
      ctaHover: builtin.ctaHover,
      swatches: [builtin.swatches[0], builtin.swatches[1], builtin.swatches[2], builtin.swatches[3]],
    };
  }

  const accent =
    (typeof settings.contact.ctaColor === 'string' && settings.contact.ctaColor.startsWith('#')
      ? settings.contact.ctaColor
      : null) ||
    (typeof settings.about.accentColor === 'string' && settings.about.accentColor.startsWith('#')
      ? settings.about.accentColor
      : null) ||
    '#EA580C';

  const accentSoft = '#FFF7ED';
  const surface =
    settings.global.backgroundEnabled && isHex(settings.global.backgroundColor)
      ? settings.global.backgroundColor
      : '#F5F5F5';
  const motif = '#E5E5E5';

  return {
    colors: { accent, accentSoft, surface, motif },
    cta: '#0A0A0A',
    ctaHover: '#262626',
    swatches: [accent, accentSoft, surface, motif],
  };
}

export function customThemeToPickerTheme(theme: PortfolioCustomTheme): PortfolioTheme {
  return {
    id: theme.id,
    label: theme.name,
    description: theme.saved
      ? 'Saved custom theme — restores all personalizations.'
      : 'Unsaved draft — created automatically from your color changes.',
    swatches: theme.swatches,
    colors: theme.colors,
    cta: theme.cta,
    ctaHover: theme.ctaHover,
    custom: true,
    saved: theme.saved,
  };
}

export function mergeCustomThemes(stored: unknown): PortfolioCustomTheme[] {
  if (!Array.isArray(stored)) return [];
  const result: PortfolioCustomTheme[] = [];

  for (const item of stored) {
    if (!isRecord(item)) continue;
    const id = typeof item.id === 'string' && isCustomPortfolioThemeId(item.id) ? item.id : null;
    if (!id) continue;
    if (!isRecord(item.snapshot)) continue;

    const colorsRecord = isRecord(item.colors) ? item.colors : {};
    const colors: PortfolioThemeColors = {
      accent: isHex(colorsRecord.accent) ? colorsRecord.accent.trim() : '#EA580C',
      accentSoft: isHex(colorsRecord.accentSoft) ? colorsRecord.accentSoft.trim() : '#FFF7ED',
      surface: isHex(colorsRecord.surface) ? colorsRecord.surface.trim() : '#F5F5F5',
      motif: isHex(colorsRecord.motif) ? colorsRecord.motif.trim() : '#E5E5E5',
    };

    const swatchesRaw = Array.isArray(item.swatches) ? item.swatches : [];
    const swatches: [string, string, string, string] = [
      isHex(swatchesRaw[0]) ? String(swatchesRaw[0]).trim() : colors.accent,
      isHex(swatchesRaw[1]) ? String(swatchesRaw[1]).trim() : colors.accentSoft,
      isHex(swatchesRaw[2]) ? String(swatchesRaw[2]).trim() : colors.surface,
      isHex(swatchesRaw[3]) ? String(swatchesRaw[3]).trim() : colors.motif,
    ];

    result.push({
      id,
      name: typeof item.name === 'string' && item.name.trim() ? item.name.trim() : 'Personnalisé',
      saved: item.saved === true,
      createdAt: typeof item.createdAt === 'string' ? item.createdAt : new Date().toISOString(),
      updatedAt: typeof item.updatedAt === 'string' ? item.updatedAt : new Date().toISOString(),
      colors,
      cta: isHex(item.cta) ? item.cta.trim() : '#0A0A0A',
      ctaHover: isHex(item.ctaHover) ? item.ctaHover.trim() : '#262626',
      swatches,
      // Snapshot is re-merged by the caller with mergePortfolioSettings internals.
      snapshot: item.snapshot as PortfolioCustomThemeSnapshot,
    });
  }

  return result;
}

export function resolvePortfolioThemeId(stored: unknown, customThemes: PortfolioCustomTheme[]): PortfolioThemeId {
  if (typeof stored !== 'string') return DEFAULT_PORTFOLIO_THEME_ID;
  if (isBuiltinPortfolioThemeId(stored)) return stored;
  if (isCustomPortfolioThemeId(stored) && customThemes.some((theme) => theme.id === stored)) {
    return stored;
  }
  // Legacy builtin themes removed from the product.
  if (stored === 'slate' || stored === 'forest' || stored === 'monochrome') {
    return DEFAULT_PORTFOLIO_THEME_ID;
  }
  return DEFAULT_PORTFOLIO_THEME_ID;
}

export function createDraftCustomTheme(
  settings: PortfolioSettings,
  name = 'Personnalisé'
): PortfolioCustomTheme {
  const palette = extractThemeColorsFromSettings(settings);
  const now = new Date().toISOString();
  return {
    id: createCustomThemeId(),
    name,
    saved: false,
    createdAt: now,
    updatedAt: now,
    ...palette,
    snapshot: stripThemeMeta(settings),
  };
}

export function refreshCustomThemeFromSettings(
  theme: PortfolioCustomTheme,
  settings: PortfolioSettings
): PortfolioCustomTheme {
  const palette = extractThemeColorsFromSettings(settings);
  return {
    ...theme,
    updatedAt: new Date().toISOString(),
    ...palette,
    snapshot: stripThemeMeta(settings),
  };
}

/** True when live settings differ from the saved theme snapshot (or theme is still a draft). */
export function customThemeHasPendingChanges(
  theme: PortfolioCustomTheme,
  settings: PortfolioSettings
): boolean {
  if (!theme.saved) return true;
  const nextSnapshot = stripThemeMeta(settings);
  const palette = extractThemeColorsFromSettings(settings);
  return (
    JSON.stringify(theme.snapshot) !== JSON.stringify(nextSnapshot) ||
    JSON.stringify(theme.colors) !== JSON.stringify(palette.colors) ||
    theme.cta !== palette.cta ||
    theme.ctaHover !== palette.ctaHover ||
    JSON.stringify(theme.swatches) !== JSON.stringify(palette.swatches)
  );
}

export function duplicateCustomTheme(
  source: PortfolioCustomTheme,
  name?: string
): PortfolioCustomTheme {
  const now = new Date().toISOString();
  return {
    ...structuredClone(source),
    id: createCustomThemeId(),
    name: name?.trim() || `${source.name} copie`,
    saved: false,
    createdAt: now,
    updatedAt: now,
  };
}

export function duplicateBuiltinAsCustom(
  settings: PortfolioSettings,
  name?: string,
  builtinId?: PortfolioBuiltinThemeId
): PortfolioCustomTheme {
  const sourceId =
    builtinId ??
    (isBuiltinPortfolioThemeId(settings.themeId) ? settings.themeId : DEFAULT_PORTFOLIO_THEME_ID);
  const builtin = getPortfolioTheme(sourceId);
  const now = new Date().toISOString();
  // Snapshot keeps every setting as-is; palette comes from the builtin card so colors don't jump.
  return {
    id: createCustomThemeId(),
    name: name?.trim() || `${builtin.label} copie`,
    saved: false,
    createdAt: now,
    updatedAt: now,
    colors: { ...builtin.colors },
    cta: builtin.cta,
    ctaHover: builtin.ctaHover,
    swatches: [builtin.swatches[0], builtin.swatches[1], builtin.swatches[2], builtin.swatches[3]],
    snapshot: stripThemeMeta(settings),
  };
}
