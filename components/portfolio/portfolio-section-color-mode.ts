import { msg } from '@/lib/i18n/config';
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
  { value: 'auto', label: msg('Auto') },
  { value: 'light', label: msg('Light') },
  { value: 'dark', label: msg('Dark') },
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

/** WCAG relative luminance of `#rgb` / `#rrggbb`; null when unparseable. */
function sectionHexLuminance(hex: string | undefined): number | null {
  const raw = hex?.trim().replace(/^#/, '') ?? '';
  const full = raw.length === 3 ? raw.replace(/./g, (c) => c + c) : raw;
  if (!/^[0-9a-f]{6}$/i.test(full)) return null;
  const channel = (offset: number) => {
    const s = parseInt(full.slice(offset, offset + 2), 16) / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4);
}

/** Luminance where black and white text reach the same contrast ratio (~4.58:1 each). */
const SECTION_INK_FLIP_LUMINANCE = 0.179;

/** Composite a section's solid fill over the page before choosing readable foregrounds. */
export function resolveSectionVisibleSurface(background: {
  sectionBackgroundEnabled: boolean;
  sectionBackgroundFill: string;
  sectionBackgroundColor: string;
  sectionBackgroundOpacity?: number;
}, backdrop: string): string {
  if (!background.sectionBackgroundEnabled || background.sectionBackgroundFill !== 'solid') return backdrop;
  const expand = (color: string) => {
    const raw = color.trim().replace(/^#/, '');
    return raw.length === 3 ? raw.replace(/./g, digit => digit + digit) : raw;
  };
  const foreground = expand(background.sectionBackgroundColor);
  const under = expand(backdrop);
  if (!/^[\da-f]{6}$/i.test(foreground) || !/^[\da-f]{6}$/i.test(under)) return backdrop;
  const alpha = Math.max(0, Math.min(100, background.sectionBackgroundOpacity ?? 100)) / 100;
  return '#' + [0, 2, 4].map(offset => Math.round(
    parseInt(foreground.slice(offset, offset + 2), 16) * alpha + parseInt(under.slice(offset, offset + 2), 16) * (1 - alpha)
  ).toString(16).padStart(2, '0')).join('');
}

type SectionFillForContrast = {
  sectionBackgroundEnabled: boolean;
  sectionBackgroundFill: 'solid' | 'gradient' | 'image' | 'split';
  sectionBackgroundColor: string;
  sectionBackgroundOpacity?: number;
  sectionBackgroundGradientFrom: string;
  sectionBackgroundGradientTo: string;
  sectionBackgroundColorA?: string;
  sectionBackgroundColorB?: string;
};

/** Light/dark reading of an opaque solid / gradient / split fill; null when unknown (image,
 *  see-through, disabled or unparseable colors). Also used by designs whose CSS would
 *  otherwise follow the site-wide mode, so they follow the section's forced mode instead. */
export function sectionFillMode(background: SectionFillForContrast): 'light' | 'dark' | null {
  if (!background.sectionBackgroundEnabled || (background.sectionBackgroundOpacity ?? 100) < 100) return null;
  const stops =
    background.sectionBackgroundFill === 'solid'
      ? [background.sectionBackgroundColor]
      : background.sectionBackgroundFill === 'gradient'
        ? [background.sectionBackgroundGradientFrom, background.sectionBackgroundGradientTo]
        : background.sectionBackgroundFill === 'split'
          ? [background.sectionBackgroundColorA, background.sectionBackgroundColorB]
          : [];
  const lums = stops.map(sectionHexLuminance);
  if (lums.length === 0 || lums.some((l) => l === null)) return null;
  return (lums as number[]).reduce((sum, l) => sum + l, 0) / lums.length < SECTION_INK_FLIP_LUMINANCE
    ? 'dark'
    : 'light';
}

/**
 * Contrast guard for 'auto' sections. An owner can paint an opaque fill from the Background
 * tab that contradicts the Global mode (black fill on a light site): the content would keep
 * the light palette's dark ink and vanish into the fill. When that happens the section is
 * treated as pinned to the mode its fill actually reads as. Explicit Light/Dark overrides,
 * see-through fills and image fills (unknown luminance) are left as they are.
 */
export function resolveSectionContrastOverride(
  override: PortfolioSectionColorMode | undefined,
  background: SectionFillForContrast,
  globalMode: 'light' | 'dark'
): PortfolioSectionColorMode {
  const mode = override ?? 'auto';
  if (mode !== 'auto') return mode;
  const fillMode = sectionFillMode(background);
  return fillMode === null || fillMode === globalMode ? 'auto' : fillMode;
}

/**
 * A section pinned to Light or Dark (override !== 'auto') needs its own opaque
 * background to actually read as an independent mode — otherwise its content
 * colors flip while the surrounding canvas keeps following Global, wrecking
 * contrast (dark text pinned over a still-dark global page, etc.). 'auto'
 * sections are left untouched. A fill the owner set from the Background tab is
 * kept — unless it reads as the opposite mode (black fill pinned to Light): the
 * explicit choice wins and the fill becomes that mode's own background, since
 * the pinned palette's ink could never be read on it.
 */
export function resolveSectionBackgroundIsolation<T extends SectionFillForContrast>(
  presentation: T,
  override: PortfolioSectionColorMode | undefined,
  fond: string
): T {
  const mode = override ?? 'auto';
  if (mode === 'auto') return presentation;
  if (presentation.sectionBackgroundEnabled) {
    const fillMode = sectionFillMode(presentation);
    if (fillMode === null || fillMode === mode) return presentation;
  }
  return {
    ...presentation,
    sectionBackgroundEnabled: true,
    sectionBackgroundFill: 'solid' as const,
    sectionBackgroundColor: fond,
    sectionBackgroundOpacity: 100,
  } as T;
}
