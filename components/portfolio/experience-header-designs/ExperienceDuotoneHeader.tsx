'use client';

import { EditorialSectionStickyHeader } from '@/components/portfolio/portfolio-section-primitives';
import type { PortfolioExperiencePresentationSettings } from '@/components/portfolio/portfolio-experience-settings';
import {
  DEFAULT_EXPERIENCE_MUTED_COLOR,
  DEFAULT_EXPERIENCE_MUTED_COLOR_DARK,
  DEFAULT_EXPERIENCE_PRESENTATION,
  DEFAULT_EXPERIENCE_TITLE_COLOR,
  DEFAULT_EXPERIENCE_TITLE_COLOR_DARK,
  ensureExperienceInkContrast,
  normalizeExperienceElementStyles,
  resolveExperienceColorMode,
  resolveExperienceTextColor,
} from '@/components/portfolio/portfolio-experience-settings';

/**
 * Catalog header for Duotone Experience (no dedicated section chrome in the live layout).
 * Matches default EditorialSectionStickyHeader title language at rest — static, not sticky.
 */
export function ExperienceDuotoneHeader({
  sectionTitle,
  sectionSubtitle,
  presentation: presentationProp,
}: {
  sectionTitle: string;
  sectionSubtitle?: string;
  presentation?: PortfolioExperiencePresentationSettings;
}) {
  const presentation: PortfolioExperiencePresentationSettings = {
    ...(presentationProp ?? DEFAULT_EXPERIENCE_PRESENTATION),
    experienceDesign: 'duotone',
  };

  const isDark = presentation.activeColorMode !== 'light';
  const colorMode = resolveExperienceColorMode(presentation);
  const styles = normalizeExperienceElementStyles(presentation.elementStyles);
  const titleColor = ensureExperienceInkContrast(
    presentation.titleColor?.trim() || resolveExperienceTextColor(styles.title, colorMode),
    isDark,
    DEFAULT_EXPERIENCE_TITLE_COLOR,
    DEFAULT_EXPERIENCE_TITLE_COLOR_DARK
  );
  const mutedColor = ensureExperienceInkContrast(
    presentation.subtitleColor?.trim() || resolveExperienceTextColor(styles.meta, colorMode),
    isDark,
    DEFAULT_EXPERIENCE_MUTED_COLOR,
    DEFAULT_EXPERIENCE_MUTED_COLOR_DARK
  );

  const subtitle = sectionSubtitle?.trim() || undefined;

  return (
    <EditorialSectionStickyHeader
      title={sectionTitle.trim() || 'Experience'}
      subtitle={subtitle}
      scrollBehavior="static"
      titleTypographyStyle={{ color: titleColor }}
      subtitleTypographyStyle={{ color: mutedColor }}
    />
  );
}
