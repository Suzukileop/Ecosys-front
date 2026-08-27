'use client';

import type { CSSProperties, ReactNode } from 'react';
import type { PortfolioThemeId } from '@/components/portfolio/portfolio-themes';
import {
  portfolioThemeCssVars,
  portfolioUsesMonochromeChrome,
} from '@/components/portfolio/portfolio-themes';
import type { PortfolioCustomTheme } from '@/components/portfolio/portfolio-custom-themes';
import { customThemeToPickerTheme } from '@/components/portfolio/portfolio-custom-themes';
import {
  globalBodyFontRootStyle,
  resolvePortfolioGlobalBodyFont,
  type PortfolioGlobalBodyFont,
} from '@/components/portfolio/portfolio-global-settings';

export function PortfolioThemeRoot({
  themeId,
  customThemes = [],
  monochromeUi = false,
  bodyFont,
  bodyFontForceAll = false,
  colorMode = 'dark',
  globalStyle,
  fixedBackgroundStyle,
  patternBackgroundStyle,
  fixedMotifsLayer,
  suppressDefaultBackground = false,
  children,
}: {
  themeId: PortfolioThemeId;
  customThemes?: PortfolioCustomTheme[];
  /** Persist monochrome chrome across Noir / Blanc duplicates. */
  monochromeUi?: boolean;
  /** Site-wide portfolio typeface (Geist / Google Font / local Aeonik). */
  bodyFont?: PortfolioGlobalBodyFont;
  /**
   * Force bodyFont on every text node — overrides serif / display / hardcoded
   * Playfair stacks without exception.
   */
  bodyFontForceAll?: boolean;
  /** Global appearance — drives light vs dark float / chrome recipes. */
  colorMode?: 'dark' | 'light';
  globalStyle?: CSSProperties;
  /** Fixed viewport background image layer (insets applied via top/right/bottom/left). */
  fixedBackgroundStyle?: CSSProperties;
  /** Fixed repeating motif layer painted above the page fill / wallpaper. */
  patternBackgroundStyle?: CSSProperties;
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
  const useCustomBackground =
    Boolean(globalStyle) || suppressDefaultBackground || Boolean(fixedBackgroundStyle);

  /**
   * Keep the solid page color on its own layer (not on the root), so the
   * pattern can sit above the fill and still stay behind all content.
   * Stack (back → front): solid → fixed image → pattern → fixed motifs → children.
   */
  const { backgroundColor: solidPageColor, ...rootGlobalStyle } = globalStyle ?? {};
  const hasSolidPageColor =
    typeof solidPageColor === 'string' && solidPageColor.trim().length > 0;
  const bodyFontStyle = globalBodyFontRootStyle(bodyFont);
  const resolvedBodyFont = resolvePortfolioGlobalBodyFont(bodyFont);

  return (
    <div
      className={`pf-theme-root relative isolate min-h-screen min-h-[100dvh] overflow-x-clip ${useCustomBackground ? '' : 'bg-white'}`}
      data-portfolio-theme={themeId}
      data-portfolio-mono={mono ? 'true' : undefined}
      data-portfolio-color-mode={colorMode === 'light' ? 'light' : 'dark'}
      data-portfolio-body-font={resolvedBodyFont}
      data-portfolio-force-font="true"
      style={{
        ...portfolioThemeCssVars(themeId, pickerThemes, monochromeUi),
        ...bodyFontStyle,
        ...rootGlobalStyle,
      }}
    >
      {hasSolidPageColor ? (
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 -z-30"
          style={{ backgroundColor: solidPageColor }}
        />
      ) : null}
      {fixedBackgroundStyle ? (
        <div
          aria-hidden
          className="pointer-events-none fixed -z-20 bg-no-repeat"
          style={fixedBackgroundStyle}
        />
      ) : null}
      {patternBackgroundStyle ? (
        <div
          aria-hidden
          className="pointer-events-none fixed -z-10"
          style={patternBackgroundStyle}
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
      <div className="relative z-0">{children}</div>
    </div>
  );
}
