'use client';

import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import type { PortfolioThemeId } from '@/components/portfolio/portfolio-themes';
import {
  portfolioThemeCssVars,
  portfolioUsesMonochromeChrome,
} from '@/components/portfolio/portfolio-themes';
import type { PortfolioCustomTheme } from '@/components/portfolio/portfolio-custom-themes';
import { customThemeToPickerTheme } from '@/components/portfolio/portfolio-custom-themes';
import type { PortfolioHeroPalette } from '@/components/portfolio/portfolio-hero-palette-settings';
import { portfolioPaletteCssVars } from '@/components/portfolio/portfolio-color-mode';

export function PortfolioThemeRoot({
  themeId,
  customThemes = [],
  monochromeUi = false,
  colorMode = 'dark',
  activePalette,
  fixedBackgroundStyle,
  fixedMotifsLayer,
  suppressDefaultBackground = false,
  children,
}: {
  themeId: PortfolioThemeId;
  customThemes?: PortfolioCustomTheme[];
  /** Persist monochrome chrome across Noir / Blanc duplicates. */
  monochromeUi?: boolean;
  /** Global appearance — drives light vs dark float / chrome recipes. */
  colorMode?: 'dark' | 'light';
  /** Active global palette — drives animatable CSS vars on the root. */
  activePalette?: PortfolioHeroPalette;
  /** Fixed viewport background image layer (insets applied via top/right/bottom/left). */
  fixedBackgroundStyle?: CSSProperties;
  /**
   * Fixed glow/curve motifs — painted above the pattern, always behind page content
   * (Hero, Portfolio cards, nav, …).
   */
  fixedMotifsLayer?: ReactNode;
  /** When true, skip the default white page fill (solid color and/or fixed image active). */
  suppressDefaultBackground?: boolean;
  children: ReactNode;
}) {
  const pickerThemes = customThemes.map(customThemeToPickerTheme);
  const mono = portfolioUsesMonochromeChrome(themeId, monochromeUi);
  const useCustomBackground = suppressDefaultBackground || Boolean(fixedBackgroundStyle);
  const paletteVars = activePalette ? portfolioPaletteCssVars(activePalette) : undefined;
  /** Arm color transitions after first paint — avoids animating the initial load. */
  const [colorTransitionsReady, setColorTransitionsReady] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setColorTransitionsReady(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const mode = colorMode === 'light' ? 'light' : 'dark';
    root.setAttribute('data-portfolio-color-mode', mode);
    const assigned: string[] = [];
    if (activePalette) {
      const nextVars = {
        '--pf-palette-fond': activePalette.fond,
        '--pf-palette-texte-muted': activePalette.texteMuted,
        '--pf-palette-bordure': activePalette.bordure,
      } as const;
      for (const [key, value] of Object.entries(nextVars)) {
        if (!value) continue;
        root.style.setProperty(key, value);
        assigned.push(key);
      }
    }
    return () => {
      root.removeAttribute('data-portfolio-color-mode');
      for (const key of assigned) root.style.removeProperty(key);
    };
  }, [colorMode, activePalette]);

  return (
    <div
      className={`pf-theme-root relative isolate min-h-screen min-h-[100dvh] overflow-x-clip ${useCustomBackground ? '' : 'pf-theme-page-fill'}`}
      data-portfolio-theme={themeId}
      data-portfolio-mono={mono ? 'true' : undefined}
      data-portfolio-color-mode={colorMode === 'light' ? 'light' : 'dark'}
      data-pf-color-transitions={colorTransitionsReady ? 'true' : undefined}
      data-portfolio-force-font="true"
      style={{
        ...portfolioThemeCssVars(themeId, pickerThemes, monochromeUi),
        ...paletteVars,
        colorScheme: colorMode === 'light' ? 'light' : 'dark',
      }}
    >
      {fixedBackgroundStyle ? (
        <div
          aria-hidden
          className="pf-theme-layer pointer-events-none fixed -z-20 bg-no-repeat"
          style={fixedBackgroundStyle}
        />
      ) : null}
      {fixedMotifsLayer ? (
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 -z-[5] overflow-visible"
          data-portfolio-fixed-motifs-slot=""
        >
          {fixedMotifsLayer}
        </div>
      ) : null}
      <div className="pf-theme-content relative z-0">{children}</div>
    </div>
  );
}
