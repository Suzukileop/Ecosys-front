'use client';

import { TableExperienceHeader } from '@/components/portfolio/portfolio-section-primitives';
import type { PortfolioExperiencePresentationSettings } from '@/components/portfolio/portfolio-experience-settings';
import { DEFAULT_EXPERIENCE_PRESENTATION } from '@/components/portfolio/portfolio-experience-settings';

export function ExperienceTableHeader(props: {
  sectionTitle: string;
  sectionSubtitle?: string;
  years?: number | null;
  presentation?: PortfolioExperiencePresentationSettings;
}) {
  return (
    <TableExperienceHeader
      {...props}
      presentation={{
        ...(props.presentation ?? DEFAULT_EXPERIENCE_PRESENTATION),
        experienceDesign: 'table',
      }}
    />
  );
}
