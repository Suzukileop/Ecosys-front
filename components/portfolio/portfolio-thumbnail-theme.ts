'use client';

import { useEffect, useMemo } from 'react';
import { usePortfolioDesignPreviewSource } from './PortfolioDesignLivePreview';
import type { PortfolioTeamPresentationSettings } from './portfolio-team-settings';
import { DEFAULT_HERO_PALETTE, LIGHT_HERO_PALETTE, type PortfolioHeroPalette } from './portfolio-hero-palette-settings';
import { resolveActivePortfolioPalette, portfolioPaletteCssVars } from './portfolio-color-mode';
import { sectionFamilyPalette } from './portfolio-section-palette-family';
import { resolveSectionActiveMode } from './portfolio-section-color-mode';
import type { PortfolioSettings } from './portfolio-settings-types';

export function resolveThumbnailTheme(global: PortfolioSettings['global'] | undefined, section: PortfolioSettings['hero'] | PortfolioSettings['team'] | PortfolioSettings['gallery'] | PortfolioSettings['experience'] | PortfolioSettings['tools'] | PortfolioSettings['stack'] | PortfolioSettings['work'] | PortfolioSettings['info'] | PortfolioSettings['aboutUs'] | PortfolioSettings['services'] | PortfolioSettings['faq'] | PortfolioSettings['footer'] | undefined) {
  const mode = resolveSectionActiveMode(section?.colorModeOverride, global?.colorMode ?? 'dark');
  const palette = sectionFamilyPalette(section?.paletteFamily, mode) ?? (global
    ? resolveActivePortfolioPalette({ ...global, colorMode: mode })
    : mode === 'light' ? LIGHT_HERO_PALETTE : DEFAULT_HERO_PALETTE);
  return { mode, palette, background: palette.fond, ink: palette.texteFort, muted: palette.texteMuted, card: palette.neutre, border: palette.bordure, accent: palette.principal };
}

export function useThumbnailTheme(section: 'hero' | 'team' | 'gallery' | 'experience' | 'tools' | 'stack' | 'work' | 'info' | 'aboutUs' | 'services' | 'faq' | 'footer', target?: HTMLElement | null) {
  const source = usePortfolioDesignPreviewSource();
  const global = source?.settings.global;
  const local = source?.settings[section];
  const theme = useMemo(() => resolveThumbnailTheme(global, local), [global, local]);
  useEffect(() => {
    if (!target) return;
    const style = target.ownerDocument.createElement('style');
    const tokens = Object.entries(portfolioPaletteCssVars(theme.palette)).map(([key, value]) => `${key}:${value}!important`).join(';');
    style.textContent = `html,body{background:${theme.background}!important;color:${theme.ink}!important;color-scheme:${theme.mode}}#preview{${tokens}}`;
    target.ownerDocument.head.appendChild(style);
    return () => style.remove();
  }, [target, theme]);
  return theme;
}

export function teamThumbnailPresentation(base: Omit<PortfolioTeamPresentationSettings, 'teamPalette'> & { teamPalette?: Partial<PortfolioHeroPalette> }, theme: ReturnType<typeof resolveThumbnailTheme>): PortfolioTeamPresentationSettings {
  return {
    ...base,
    activeColorMode: theme.mode,
    sectionBackgroundColor: theme.background,
    cardBackgroundColor: theme.card,
    cardBorderColor: theme.border,
    nameColor: theme.ink,
    responsibilityColor: theme.muted,
    socialIconColor: theme.ink,
    socialBackgroundColor: theme.card,
    titleColor: theme.ink,
    subtitleColor: theme.muted,
    teamPalette: theme.palette,
  };
}
