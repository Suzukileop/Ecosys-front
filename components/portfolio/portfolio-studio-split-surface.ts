import { resolveSectionVisibleSurface, sectionFillMode } from './portfolio-section-color-mode';

/** Share the composited accent surface between the hero and its navigation. */
export function resolveStudioSplitSurface(accent: string, opacity: number | undefined, backdrop: string) {
  const alpha = Number.isFinite(opacity) ? Math.max(0, Math.min(100, opacity!)) : 100;
  const background = {
    sectionBackgroundEnabled: true,
    sectionBackgroundFill: 'solid' as const,
    sectionBackgroundColor: accent,
    sectionBackgroundOpacity: alpha,
    sectionBackgroundGradientFrom: accent,
    sectionBackgroundGradientTo: accent,
  };
  const surface = resolveSectionVisibleSurface(background, backdrop);
  const mode = sectionFillMode({ ...background, sectionBackgroundColor: surface, sectionBackgroundOpacity: 100 }) ?? 'dark';
  return { surface, mode, ink: mode === 'dark' ? '#FFFFFF' : '#000000' };
}
