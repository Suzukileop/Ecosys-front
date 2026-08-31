'use client';

import {
  resolveSkillName,
  type PortfolioSkillRef,
} from '@/components/portfolio/skill-usage-descriptions';
import { EditorialToolsGallery } from '@/components/portfolio/portfolio-tools-section';
import {
  type PortfolioToolsCardGap,
  type PortfolioToolsContentAlignment,
  type PortfolioToolsHeaderAlignment,
} from '@/components/portfolio/portfolio-tools-settings';
import { stackPresentationToToolsGallery } from '@/components/portfolio/portfolio-stack-gallery-mapper';
import type { PortfolioStackPresentationSettings } from '@/components/portfolio/portfolio-stack-settings';
import {
  resolveStackSubtitleSize,
  resolveStackTagsContentAlignment,
  resolveStackTagsHeaderAlignment,
  resolveStackTagsSize,
  resolveStackTitleSize,
  stackTagsChipClass,
  stackTagsKickerClass,
  stackTagsListClass,
  stackTagsSubtitleClass,
} from '@/components/portfolio/portfolio-stack-settings';

type StackGalleryProps = {
  items: PortfolioSkillRef[];
  presentation: PortfolioStackPresentationSettings;
  /** Embedded kicker title — used by stack-tags only. */
  embeddedTitle?: string;
  embeddedSubtitle?: string;
};

function stackTagsTextAlignClass(
  alignment: PortfolioToolsHeaderAlignment | PortfolioToolsContentAlignment
): string {
  switch (alignment) {
    case 'right':
      return 'text-right';
    case 'center':
      return 'text-center';
    default:
      return 'text-left';
  }
}

function stackTagsJustifyClass(
  alignment: PortfolioToolsHeaderAlignment | PortfolioToolsContentAlignment
): string {
  switch (alignment) {
    case 'right':
      return 'justify-end';
    case 'center':
      return 'justify-center';
    default:
      return 'justify-start';
  }
}

function stackTagsGapClass(gap: PortfolioToolsCardGap): string {
  switch (gap) {
    case 'medium':
      return 'gap-3 sm:gap-3.5';
    case 'large':
      return 'gap-3.5 sm:gap-4';
    case 'xlarge':
      return 'gap-4 sm:gap-5';
    default:
      return 'gap-2.5 sm:gap-3';
  }
}

function EditorialStackTags({
  items,
  presentation,
  embeddedTitle,
  embeddedSubtitle,
}: {
  items: PortfolioSkillRef[];
  presentation: PortfolioStackPresentationSettings;
  embeddedTitle?: string;
  embeddedSubtitle?: string;
}) {
  const names = items.map(resolveSkillName).map((name) => name.trim()).filter(Boolean);
  const headerAlignment = resolveStackTagsHeaderAlignment(presentation);
  const contentAlignment = resolveStackTagsContentAlignment(presentation);
  const accent = presentation.levelAccentColor;
  const chipBg = presentation.chipBackgroundColor;
  const chipText = presentation.chipTextColor;
  const kicker = embeddedTitle?.trim();
  const subtitle = embeddedSubtitle?.trim();
  const tagSize = resolveStackTagsSize(presentation.stackTagsSize);
  const titleSize = resolveStackTitleSize(presentation.titleSize);
  const subtitleSize = resolveStackSubtitleSize(presentation.subtitleSize);

  if (names.length === 0) {
    return null;
  }

  const tagBorder = `1px solid color-mix(in srgb, ${chipText} 24%, ${chipBg})`;

  return (
    <div className="flex w-full max-w-none flex-col">
      {kicker ? (
        <p
          className={`w-full ${stackTagsKickerClass(titleSize)} ${stackTagsTextAlignClass(headerAlignment)}`}
          style={{ color: accent }}
        >
          {kicker.toUpperCase()}
        </p>
      ) : null}
      {subtitle ? (
        <p
          className={`${stackTagsSubtitleClass(subtitleSize)} w-full max-w-none ${stackTagsTextAlignClass(headerAlignment)}`}
          style={{ color: presentation.subtitleColor }}
        >
          {subtitle}
        </p>
      ) : null}
      <ul
        className={`${stackTagsListClass(tagSize)} flex w-full max-w-none list-none flex-wrap p-0 ${stackTagsGapClass(presentation.cardGap)} ${stackTagsJustifyClass(contentAlignment)}`}
        aria-label={kicker || 'Stack'}
      >
        {names.map((name) => (
          <li
            key={name}
            className={stackTagsChipClass(tagSize)}
            style={{
              color: chipText,
              backgroundColor: chipBg,
              border: tagBorder,
            }}
          >
            {name}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function EditorialStackGallery({
  items,
  presentation,
  embeddedTitle,
  embeddedSubtitle,
}: StackGalleryProps) {
  if (presentation.design === 'stack-tags') {
    return (
      <EditorialStackTags
        items={items}
        presentation={presentation}
        embeddedTitle={embeddedTitle}
        embeddedSubtitle={embeddedSubtitle}
      />
    );
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
