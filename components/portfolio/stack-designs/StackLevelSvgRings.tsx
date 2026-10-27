'use client';

import { useLayoutEffect, useRef, type CSSProperties } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  resolveToolLevelPercent,
  useToolLevelBarColor,
} from '@/components/creator/studio/creator-tool-logo-color';
import { ToolsLevelSvgRingWithLabel } from '@/components/portfolio/portfolio-tools-level-indicators';
import {
  resolveToolsDesignBrandColumnsPerRow,
  resolveToolsLevelBarSize,
  resolveToolsShowLevel,
  toolsLevelCircularRingStroke,
  toolsLevelSvgRingPx,
  type PortfolioToolsPresentationSettings,
} from '@/components/portfolio/portfolio-tools-settings';
import {
  resolveSkillIconUrl,
  resolveSkillLevel,
  resolveSkillName,
  type PortfolioSkillRef,
} from '@/components/portfolio/skill-usage-descriptions';

type ToolsGalleryProps = {
  tools: PortfolioSkillRef[];
  presentation: PortfolioToolsPresentationSettings;
};

function resolveRingFillColor(
  presentation: PortfolioToolsPresentationSettings,
  logoBarColor: string
): string {
  if (presentation.logosGrayscale === true) {
    return presentation.labelColor?.trim() || (presentation.activeColorMode === 'dark' ? '#f5f5f5' : '#171717');
  }
  return logoBarColor;
}

function ToolLevelSvgRingCardItem({
  tool,
  presentation,
  ringPx,
  showName,
  showLevel,
}: {
  tool: PortfolioSkillRef;
  presentation: PortfolioToolsPresentationSettings;
  ringPx: number;
  showName: boolean;
  showLevel: boolean;
}) {
  const name = resolveSkillName(tool);
  const level = resolveSkillLevel(tool);
  const iconUrl = resolveSkillIconUrl(tool);
  const { barColor: logoBarColor } = useToolLevelBarColor(
    name,
    iconUrl,
    presentation.labelColor,
    presentation.cardBackgroundColor
  );
  const fillColor = resolveRingFillColor(presentation, logoBarColor);
  const percent = resolveToolLevelPercent(level);
  const trackInk = `color-mix(in srgb, ${presentation.labelColor} 13%, transparent)`;
  const nameInk = presentation.labelColor;
  const longName = name.trim().length > 11 || name.trim().includes(' ');
  // The name shrinks so its longest word fits the aperture instead of breaking mid-word.
  const longestWord = Math.max(1, ...name.trim().split(/\s+/).map((word) => word.length));

  return (
    <article
      className="pf-stack-svg-rings-item"
      data-pf-no-color-transition=""
      style={
        {
          '--pf-stack-svg-rings-size': `${ringPx}px`,
          '--pf-stack-svg-rings-word': longestWord,
          '--pf-stack-svg-rings-ink': fillColor,
          '--pf-stack-svg-rings-name': nameInk,
          '--pf-stack-svg-rings-frame': presentation.cardBorderColor,
        } as CSSProperties
      }
    >
      {showLevel && level ? (
        <ToolsLevelSvgRingWithLabel
          label={showName ? name : ''}
          secondaryLabel={`${percent}%`}
          percent={percent}
          fillColor={fillColor}
          trackColor={trackInk}
          labelColor={nameInk}
          size={ringPx}
          strokeWidth={toolsLevelCircularRingStroke(ringPx, resolveToolsLevelBarSize(presentation))}
          opticalOffsetY={longName ? Math.round(ringPx * -0.008) : Math.round(ringPx * -0.016)}
          className="pf-stack-svg-rings-dial"
          labelWrapperClassName="pf-stack-svg-rings-aperture"
          labelClassName={`pf-stack-svg-rings-name${longName ? ' pf-stack-svg-rings-name--wrap' : ''}`}
          fillCircleClassName="pf-stack-svg-rings-fill"
          trackCircleClassName="pf-stack-svg-rings-track"
        />
      ) : showName ? (
        <div
          className="pf-stack-svg-rings-dial pf-stack-svg-rings-dial--name"
          style={{ width: ringPx, height: ringPx }}
        >
          <span
            className={`pf-stack-svg-rings-name${longName ? ' pf-stack-svg-rings-name--wrap' : ''}`}
          >
            {name}
          </span>
        </div>
      ) : null}
    </article>
  );
}

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function ringScrollParent(element: HTMLElement): HTMLElement | undefined {
  let parent = element.parentElement;
  while (parent && parent !== document.body) {
    if (/(auto|scroll|overlay)/.test(getComputedStyle(parent).overflowY) &&
      parent.scrollHeight > parent.clientHeight + 1) return parent;
    parent = parent.parentElement;
  }
  return undefined;
}

/**
 * Editorial SVG rings — thin round-cap progress, optically centered name, draw-on-view.
 * Stroke dashoffset defaults to the final (visible) value so a GSAP miss never blanks the ring.
 */
export function EditorialToolsLevelSvgRings({ tools, presentation }: ToolsGalleryProps) {
  const rootRef = useRef<HTMLUListElement>(null);
  const ringPx = toolsLevelSvgRingPx(presentation.tileSize);
  const showName = presentation.showLabels !== false;
  const showLevel = resolveToolsShowLevel(presentation);
  const columnsPerRow = resolveToolsDesignBrandColumnsPerRow('level-svg-rings', presentation);
  const gap = presentation.levelProgressRowGap;
  const gapRem = gap === 'tight' ? 0.25 : gap === 'large' ? 2 : gap === 'xlarge' ? 3.5 : 1;

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    let ctx: gsap.Context | undefined;

    try {
      if (prefersReducedMotion()) return undefined;
      gsap.registerPlugin(ScrollTrigger);
      const scroller = ringScrollParent(root);

      ctx = gsap.context(() => {
        const circles = gsap.utils.toArray<SVGCircleElement>(
          root.querySelectorAll('.pf-stack-svg-rings-fill')
        );
        if (circles.length === 0) return;

        // Hide immediately (pre-paint) — only the reveal is scroll-gated, so the ring
        // never flashes fully drawn before snapping back to empty and animating in.
        gsap.set(circles, {
          strokeDashoffset: (_index, target) => {
            const circle = target as SVGCircleElement;
            return Number(circle.dataset.circumference ?? 0);
          },
        });

        // Trigger per ring (not once on the shared root) — with several rows of
        // rings, a single root-level trigger fires as soon as the section is
        // entered, well before the lower rows are actually in view, so their
        // draw-on animation plays out unseen and they just sit there already full.
        ScrollTrigger.batch(circles, {
          ...(scroller ? { scroller } : {}),
          start: 'top 88%',
          once: true,
          onEnter: (batch) => {
            gsap.to(batch, {
              strokeDashoffset: (_index, target) => {
                const circle = target as SVGCircleElement;
                return Number(circle.dataset.targetOffset ?? 0);
              },
              duration: 1.18,
              delay: 0.08,
              stagger: 0.075,
              ease: 'power3.out',
              overwrite: 'auto',
            });
          },
        });
      }, root);
    } catch {
      ctx?.revert();
      ctx = undefined;
    }

    return () => {
      ctx?.revert();
    };
  }, [tools, ringPx, showLevel, showName]);

  if (tools.length === 0) return null;

  return (
    <ul
      ref={rootRef}
      className="pf-stack-svg-rings-grid pf-stack-circular-root w-full list-none p-0"
      role="list"
      data-columns={columnsPerRow}
      data-align={presentation.brandCardsContentAlignment ?? 'center'}
      style={{
        '--pf-circular-gap-base': `${gapRem}rem`,
        '--pf-circular-gap-sm': `${gapRem}rem`,
        '--pf-circular-gap-lg': `${gapRem}rem`,
        rowGap: 'var(--pf-circular-gap)',
      } as CSSProperties}
    >
      {tools.map((tool) => {
        const key = typeof tool === 'string' ? tool : `${tool.name}-${tool.iconUrl ?? ''}`;

        return (
          <li key={key} className="pf-stack-svg-rings-cell pf-stack-circular-item min-w-0">
            <ToolLevelSvgRingCardItem
              tool={tool}
              presentation={presentation}
              ringPx={ringPx}
              showName={showName}
              showLevel={showLevel}
            />
          </li>
        );
      })}
    </ul>
  );
}
