'use client';

import type { PortfolioSkillRef } from '@/components/portfolio/skill-usage-descriptions';
import { EditorialToolsGallery } from '@/components/portfolio/portfolio-tools-section';
import { stackPresentationToToolsGallery } from '@/components/portfolio/portfolio-stack-gallery-mapper';
import type { PortfolioStackPresentationSettings } from '@/components/portfolio/portfolio-stack-settings';
import { EditorialStackTags } from '@/components/portfolio/stack-designs/StackTags';

type StackGalleryProps = {
  items: PortfolioSkillRef[];
  presentation: PortfolioStackPresentationSettings;
};

export function EditorialStackGallery({ items, presentation }: StackGalleryProps) {
  if (presentation.design === 'stack-tags') {
    return <EditorialStackTags items={items} presentation={presentation} />;
  }

  const aside =
    presentation.sectionLayout === 'aside-left' ||
    presentation.sectionLayout === 'aside-right';
  const toolsPresentation = stackPresentationToToolsGallery(
    presentation,
    aside
      ? {
          levelProgressColumnsPerRow: 1,
          brandCardsColumnsPerRow:
            presentation.design === 'level-circular-cards' ||
            presentation.design === 'level-star-cards' ||
            presentation.design === 'level-svg-rings'
              ? 2
              : 1,
          ...(presentation.design === 'brand-row'
            ? { brandRowColumnsPerRow: 1 }
            : {}),
        }
      : undefined
  );

  // Stack designs that reuse Tools galleries (workflow-rail, brand-cards, level-progress-rows).
  return <EditorialToolsGallery tools={items} presentation={toolsPresentation} />;
}
