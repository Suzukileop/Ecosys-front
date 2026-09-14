'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLayoutEffect, useRef, type CSSProperties } from 'react';
import {
  resolveToolsLevelBarColors,
  ToolsLevelStarRating,
} from '@/components/portfolio/portfolio-tools-level-indicators';
import {
  resolveToolsCardSurfaceColor,
  resolveToolsLevelIndicatorCardFramed,
  resolveToolsShowLevel,
  toolsBrandCardsGapClass,
  toolsLevelStarCardsGridClass,
  type PortfolioToolsPresentationSettings,
} from '@/components/portfolio/portfolio-tools-settings';
import {
  resolveSkillLevel,
  resolveSkillName,
  type PortfolioSkillRef,
} from '@/components/portfolio/skill-usage-descriptions';

type ToolsGalleryProps = {
  tools: PortfolioSkillRef[];
  presentation: PortfolioToolsPresentationSettings;
};

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function stackStarsScrollParent(el: HTMLElement | null): HTMLElement | undefined {
  let node = el?.parentElement ?? null;
  while (node && node !== document.body) {
    const { overflowY } = getComputedStyle(node);
    if (
      (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') &&
      node.scrollHeight > node.clientHeight + 1
    ) {
      return node;
    }
    node = node.parentElement;
  }
  return undefined;
}

function ToolLevelStarCardItem({
  tool,
  presentation,
  showName,
  showLevel,
  starFillColor,
}: {
  tool: PortfolioSkillRef;
  presentation: PortfolioToolsPresentationSettings;
  showName: boolean;
  showLevel: boolean;
  starFillColor: string;
}) {
  const name = resolveSkillName(tool);
  const level = resolveSkillLevel(tool);
  const framed = resolveToolsLevelIndicatorCardFramed(presentation, 'level-star-cards');

  return (
    <article
      className="pf-stack-stars-card"
      data-framed={framed ? 'true' : 'false'}
      data-pf-no-color-transition=""
    >
      <div className="pf-stack-stars-row" data-pf-no-color-transition="">
        {showName ? (
          <h3 className="pf-stack-stars-name" data-pf-no-color-transition="">
            {name}
          </h3>
        ) : (
          <span className="pf-stack-stars-spacer" aria-hidden />
        )}
        {showLevel && level ? (
          <ToolsLevelStarRating
            level={level}
            toolName={name}
            fillColor={starFillColor}
            trackColor={`color-mix(in srgb, ${starFillColor} 22%, transparent)`}
            className="pf-stack-stars-meter shrink-0"
          />
        ) : null}
      </div>
    </article>
  );
}

/**
 * Editorial star cards — name and hairline rating on one optical line.
 * Default CSS is fully visible; GSAP only eases in on view when motion is allowed.
 */
export function EditorialToolsLevelStarCards({ tools, presentation }: ToolsGalleryProps) {
  const listRef = useRef<HTMLUListElement>(null);

  const showName = presentation.showLabels !== false;
  const showLevel = resolveToolsShowLevel(presentation);
  const levelBarColors = resolveToolsLevelBarColors(presentation);
  const ink = presentation.labelColor?.trim() || presentation.levelAccentColor?.trim() || 'currentColor';
  const principal = presentation.levelAccentColor?.trim() || levelBarColors.fillColor || ink;
  const starFillColor = principal;
  const rule = presentation.cardBorderColor?.trim() || ink;
  const surface = resolveToolsCardSurfaceColor(presentation);
  const framed = resolveToolsLevelIndicatorCardFramed(presentation, 'level-star-cards');
  const gridGapClass = toolsBrandCardsGapClass(presentation.cardGap);

  const toolSignature = tools
    .map((tool) => (typeof tool === 'string' ? tool : `${tool.name}-${tool.iconUrl ?? ''}`))
    .join('|');

  useLayoutEffect(() => {
    const root = listRef.current;
    if (!root || tools.length === 0 || prefersReducedMotion()) return;

    gsap.registerPlugin(ScrollTrigger);
    const scroller = stackStarsScrollParent(root);
    const ctx = gsap.context(() => {
      const items = gsap.utils.toArray<HTMLElement>(
        root.querySelectorAll('.pf-stack-stars-item')
      );
      if (items.length === 0) return;

      ScrollTrigger.batch(items, {
        start: 'top 92%',
        once: true,
        ...(scroller ? { scroller } : {}),
        onEnter: (batch) => {
          gsap.fromTo(
            batch,
            { y: 8, opacity: 0.28 },
            {
              y: 0,
              opacity: 1,
              duration: 0.68,
              stagger: 0.04,
              ease: 'power2.out',
              overwrite: 'auto',
              immediateRender: false,
            }
          );
        },
      });
    }, root);

    return () => {
      ctx.revert();
    };
  }, [toolSignature, tools.length]);

  if (tools.length === 0) return null;

  return (
    <ul
      ref={listRef}
      className={`pf-stack-stars grid w-full list-none p-0 ${toolsLevelStarCardsGridClass()} ${gridGapClass}`}
      role="list"
      data-pf-no-color-transition=""
      style={
        {
          '--pf-stack-stars-fill': starFillColor,
          '--pf-stack-stars-ink': ink,
          '--pf-stack-stars-rule': rule,
          '--pf-stack-stars-surface': framed ? surface : 'transparent',
        } as CSSProperties
      }
    >
      {tools.map((tool) => {
        const key = typeof tool === 'string' ? tool : `${tool.name}-${tool.iconUrl ?? ''}`;

        return (
          <li key={key} className="pf-stack-stars-item min-w-0" data-pf-no-color-transition="">
            <ToolLevelStarCardItem
              tool={tool}
              presentation={presentation}
              showName={showName}
              showLevel={showLevel}
              starFillColor={starFillColor}
            />
          </li>
        );
      })}
    </ul>
  );
}
