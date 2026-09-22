/**
 * Per-section light/dark override — independent of Global → Theme's site-wide
 * `colorMode`. 'auto' (default) follows the Global toggle; 'light'/'dark' pins
 * this section to that half of the active palette pair regardless of Global.
 */
export type PortfolioSectionColorMode = 'auto' | 'light' | 'dark';

export const PORTFOLIO_SECTION_COLOR_MODE_OPTIONS: {
  value: PortfolioSectionColorMode;
  label: string;
}[] = [
  { value: 'auto', label: 'Auto' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

export function mergeSectionColorMode(
  value: unknown,
  fallback: PortfolioSectionColorMode = 'auto'
): PortfolioSectionColorMode {
  return value === 'light' || value === 'dark' || value === 'auto' ? value : fallback;
}

/** Picks the auto / light / dark variant a section should paint with. */
export function resolveSectionPalette<T>(
  override: PortfolioSectionColorMode | undefined,
  palettes: { auto: T; light: T; dark: T }
): T {
  if (override === 'light') return palettes.light;
  if (override === 'dark') return palettes.dark;
  return palettes.auto;
}

/** Resolves the concrete light/dark mode a section renders in (drives `activeColorMode`-style fields). */
export function resolveSectionActiveMode(
  override: PortfolioSectionColorMode | undefined,
  globalMode: 'light' | 'dark'
): 'light' | 'dark' {
  return override === 'light' || override === 'dark' ? override : globalMode;
}

/**
 * A section pinned to Light or Dark (override !== 'auto') needs its own opaque
 * background to actually read as an independent mode — otherwise its content
 * colors flip while the surrounding canvas keeps following Global, wrecking
 * contrast (dark text pinned over a still-dark global page, etc.). 'auto'
 * sections, and any section whose owner already turned its own background on
 * from the Background tab, are left untouched.
 */
export function resolveSectionBackgroundIsolation<
  T extends { sectionBackgroundEnabled: boolean; sectionBackgroundFill: 'solid' | 'gradient' | 'image' | 'split' },
>(presentation: T, override: PortfolioSectionColorMode | undefined, fond: string): T {
  if ((override ?? 'auto') === 'auto' || presentation.sectionBackgroundEnabled) {
    return presentation;
  }
  return {
    ...presentation,
    sectionBackgroundEnabled: true,
    sectionBackgroundFill: 'solid' as const,
    sectionBackgroundColor: fond,
  } as T;
}
