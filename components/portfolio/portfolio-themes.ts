import type { CSSProperties } from 'react';

export type PortfolioBuiltinThemeId = 'editorial' | 'noir';

/** Builtin id or a custom theme id (`custom-…`). */
export type PortfolioThemeId = PortfolioBuiltinThemeId | (string & {});

export type PortfolioThemeColors = {
  accent: string;
  accentSoft: string;
  surface: string;
  motif: string;
};

export type PortfolioTheme = {
  id: PortfolioThemeId;
  label: string;
  description: string;
  swatches: [string, string, string, string];
  colors: PortfolioThemeColors;
  cta: string;
  ctaHover: string;
  /** True for user-created themes (can be renamed / deleted). */
  custom?: boolean;
  saved?: boolean;
};

export const PORTFOLIO_THEMES: PortfolioTheme[] = [
  {
    id: 'editorial',
    label: 'Editorial Warm',
    description: 'Warm orange accent on soft neutrals — the default portfolio look.',
    swatches: ['#EA580C', '#FFF7ED', '#F5F5F5', '#E5E5E5'],
    colors: {
      accent: '#EA580C',
      accentSoft: '#FFF7ED',
      surface: '#F5F5F5',
      motif: '#E5E5E5',
    },
    cta: '#0A0A0A',
    ctaHover: '#262626',
  },
  {
    id: 'noir',
    label: 'Noir / Blanc',
    description: 'Strict black, white, and gray — accents, frames, and social marks stay monochrome.',
    swatches: ['#0A0A0A', '#FFFFFF', '#F5F5F5', '#A3A3A3'],
    colors: {
      accent: '#171717',
      accentSoft: '#F5F5F5',
      surface: '#F5F5F5',
      motif: '#E5E5E5',
    },
    cta: '#0A0A0A',
    ctaHover: '#404040',
  },
];

const THEME_BY_ID = new Map(PORTFOLIO_THEMES.map((theme) => [theme.id, theme]));

export const DEFAULT_PORTFOLIO_THEME_ID: PortfolioBuiltinThemeId = 'editorial';

export function isBuiltinPortfolioThemeId(themeId: string): themeId is PortfolioBuiltinThemeId {
  return themeId === 'editorial' || themeId === 'noir';
}

export function isNoirPortfolioTheme(themeId: string): boolean {
  return themeId === 'noir';
}

/** Editorial Warm is the only locked builtin — personalization always forks a copy. */
export function isLockedBuiltinPortfolioTheme(themeId: string): boolean {
  return themeId === 'editorial';
}

/** Monochrome chrome (social brands + Tailwind remaps) for Noir / Blanc and its copies. */
export function portfolioUsesMonochromeChrome(
  themeId: string,
  monochromeUi?: boolean
): boolean {
  return Boolean(monochromeUi) || isNoirPortfolioTheme(themeId);
}

export function isCustomPortfolioThemeId(themeId: string): boolean {
  return themeId.startsWith('custom-');
}

export function createCustomThemeId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `custom-${crypto.randomUUID()}`;
  }
  return `custom-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function getPortfolioTheme(
  themeId: PortfolioThemeId,
  customThemes: PortfolioTheme[] = []
): PortfolioTheme {
  const custom = customThemes.find((theme) => theme.id === themeId);
  if (custom) return custom;
  return THEME_BY_ID.get(themeId) ?? PORTFOLIO_THEMES[0];
}

export function portfolioThemeCssVars(
  themeId: PortfolioThemeId,
  customThemes: PortfolioTheme[] = [],
  monochromeUi = false
): CSSProperties {
  const theme = getPortfolioTheme(themeId, customThemes);
  const { accent, accentSoft, surface, motif } = theme.colors;
  const mono = portfolioUsesMonochromeChrome(themeId, monochromeUi);

  return {
    '--pf-accent': accent,
    '--pf-accent-soft': accentSoft,
    '--pf-accent-soft-hover': mono ? '#E5E5E5' : accentSoft,
    '--pf-accent-border': mono ? '#D4D4D4' : accent,
    '--pf-accent-muted': mono ? 'rgba(23, 23, 23, 0.72)' : `${accent}BF`,
    '--pf-accent-subtle': mono ? 'rgba(23, 23, 23, 0.08)' : `${accent}14`,
    '--pf-accent-glow': mono ? 'rgba(23, 23, 23, 0.18)' : `${accent}26`,
    '--pf-surface': surface,
    '--pf-motif': motif,
    '--pf-muted-surface': accentSoft,
    '--pf-cta': theme.cta,
    '--pf-cta-hover': theme.ctaHover,
  } as CSSProperties;
}

/** Keys / paths that count as a color personalization (triggers custom theme draft). */
export function patchContainsColorChange(patch: unknown, depth = 0): boolean {
  if (patch == null || depth > 6) return false;
  if (typeof patch === 'string') {
    return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(patch.trim());
  }
  if (Array.isArray(patch)) {
    return patch.some((item) => patchContainsColorChange(item, depth + 1));
  }
  if (typeof patch !== 'object') return false;

  for (const [key, value] of Object.entries(patch as Record<string, unknown>)) {
    const keyLooksColor = /color|accent|motif|swatch|cta|highlight|background/i.test(key);
    if (keyLooksColor && typeof value === 'string' && value.trim().startsWith('#')) {
      return true;
    }
    if (patchContainsColorChange(value, depth + 1)) return true;
  }
  return false;
}

/** Neutral social brand shells for the Noir theme. */
export function portfolioMonochromeSocialBrandClass(platform: string): string {
  void platform;
  return 'pf-social-brand bg-neutral-900 text-white';
}

function expandCssHex(hex: string): string | null {
  const trimmed = hex.trim();
  if (!/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(trimmed)) return null;
  let body = trimmed.slice(1);
  if (body.length === 3) {
    body = body
      .split('')
      .map((ch) => `${ch}${ch}`)
      .join('');
  }
  if (body.length === 8) body = body.slice(0, 6);
  return body.toLowerCase();
}

function isNearAchromatic(r: number, g: number, b: number): boolean {
  return Math.max(r, g, b) - Math.min(r, g, b) <= 14;
}

/** Map any chromatic hex to a luminance-matched gray (Noir enforcement). */
export function normalizeHexForNoirTheme(hex: string): string {
  const body = expandCssHex(hex);
  if (!body) return hex;
  const r = Number.parseInt(body.slice(0, 2), 16);
  const g = Number.parseInt(body.slice(2, 4), 16);
  const b = Number.parseInt(body.slice(4, 6), 16);
  if (isNearAchromatic(r, g, b)) return `#${body.toUpperCase()}`;
  const y = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
  const channel = y.toString(16).padStart(2, '0').toUpperCase();
  return `#${channel}${channel}${channel}`;
}

/** Walk settings and force every hex color into black / white / gray. */
export function normalizeNoirPortfolioSettingsColors<T>(value: T, depth = 0): T {
  if (depth > 8 || value == null) return value;
  if (typeof value === 'string') {
    return (value.trim().startsWith('#') ? normalizeHexForNoirTheme(value) : value) as T;
  }
  if (Array.isArray(value)) {
    return value.map((item) => normalizeNoirPortfolioSettingsColors(item, depth + 1)) as T;
  }
  if (typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
      out[key] = normalizeNoirPortfolioSettingsColors(nested, depth + 1);
    }
    return out as T;
  }
  return value;
}
