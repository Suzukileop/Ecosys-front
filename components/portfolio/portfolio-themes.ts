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

const PORTFOLIO_THEMES: PortfolioTheme[] = [
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

function isNoirPortfolioTheme(themeId: string): boolean {
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

/** Neutral social brand shells for the Noir theme. */
export function portfolioMonochromeSocialBrandClass(platform: string): string {
  void platform;
  return 'pf-social-brand bg-neutral-900 text-white';
}
