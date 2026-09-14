'use client';

import gsap from 'gsap';
import { useLayoutEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import {
  resolveSkillName,
  type PortfolioSkillRef,
} from '@/components/portfolio/skill-usage-descriptions';
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
import type {
  PortfolioToolsCardGap,
  PortfolioToolsContentAlignment,
  PortfolioToolsHeaderAlignment,
} from '@/components/portfolio/portfolio-tools-settings';

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

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function EditorialStackTags({
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
  const rootRef = useRef<HTMLDivElement>(null);
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
  const namesKey = names.join('\u001f');

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || namesKey.length === 0) return;
    if (prefersReducedMotion()) return;

    const chips = root.querySelectorAll<HTMLElement>('.pf-stack-tags-chip');
    if (chips.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        chips,
        { opacity: 0, y: 6 },
        {
          opacity: 1,
          y: 0,
          duration: 0.48,
          stagger: 0.06,
          ease: 'power2.out',
          overwrite: 'auto',
          immediateRender: false,
        }
      );
    }, root);

    return () => {
      ctx.revert();
    };
  }, [namesKey]);

  if (names.length === 0) {
    return null;
  }

  const rootStyle = {
    '--pf-stack-tags-ink': chipText,
    '--pf-stack-tags-fill': chipBg,
    '--pf-stack-tags-accent': accent,
  } as CSSProperties;

  const kickerInk = `color-mix(in srgb, ${accent} 30%, transparent)`;

  return (
    <div
      ref={rootRef}
      className="pf-stack-tags flex w-full max-w-none flex-col"
      data-size={tagSize}
      data-header-align={headerAlignment}
      data-content-align={contentAlignment}
      style={rootStyle}
    >
      {kicker ? (
        <p
          className={`pf-stack-tags-kicker w-full ${stackTagsKickerClass(titleSize)} ${stackTagsTextAlignClass(headerAlignment)}`}
          style={{ color: kickerInk }}
        >
          {kicker}
        </p>
      ) : null}
      {subtitle ? (
        <p
          className={`pf-stack-tags-subtitle ${stackTagsSubtitleClass(subtitleSize)} w-full max-w-none ${stackTagsTextAlignClass(headerAlignment)}`}
          style={{ color: presentation.subtitleColor }}
        >
          {subtitle}
        </p>
      ) : null}
      <ul
        className={`pf-stack-tags-list ${stackTagsListClass(tagSize)} flex w-full max-w-none list-none flex-wrap p-0 ${stackTagsGapClass(presentation.cardGap)} ${stackTagsJustifyClass(contentAlignment)}`}
        aria-label={kicker || 'Stack'}
      >
        {names.map((name, index) => (
          <li
            key={`${name}-${String(index)}`}
            className={`pf-stack-tags-chip ${stackTagsChipClass(tagSize)}`}
            data-pf-no-color-transition=""
          >
            {name}
          </li>
        ))}
      </ul>
    </div>
  );
}
