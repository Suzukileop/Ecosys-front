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
  resolveToolsLevelIndicatorCardFramed,
  resolveToolsShowLevel,
  toolsLevelCircularCardsGridClass,
  toolsLevelIndicatorGridGapClass,
  toolsLevelRingStroke,
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

function mixLogoPrincipal(logoColor: string, principal: string, fromLogo: boolean): string {
  const accent = principal.trim();
  if (!accent) return logoColor;
  if (!fromLogo) return accent;
  if (logoColor.toLowerCase() === accent.toLowerCase()) return logoColor;
  return `color-mix(in srgb, ${logoColor} 64%, ${accent} 36%)`;
}

function resolveRingFillColor(
  presentation: PortfolioToolsPresentationSettings,
  logoBarColor: string,
  fromLogo: boolean
): string {
  const principal = presentation.levelAccentColor?.trim() || presentation.labelColor;
  if (presentation.logosGrayscale === true) {
    return presentation.labelColor?.trim() || principal;
  }
  return mixLogoPrincipal(logoBarColor, principal, fromLogo);
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
  const { barColor: logoBarColor, fromLogo } = useToolLevelBarColor(
    name,
    iconUrl,
    presentation.labelColor,
    presentation.cardBackgroundColor
  );
  const fillColor = resolveRingFillColor(presentation, logoBarColor, fromLogo);
  const percent = resolveToolLevelPercent(level);
  const framed = resolveToolsLevelIndicatorCardFramed(presentation, 'level-svg-rings');
  const trackInk = `color-mix(in srgb, ${fillColor} 12%, transparent)`;
  const nameInk = presentation.labelColor;
  const longName = name.trim().length > 11 || name.trim().includes(' ');

  return (
    <article
      className={`pf-stack-svg-rings-item${framed ? ' pf-stack-svg-rings-item--framed' : ''}`}
      data-pf-no-color-transition=""
      style={
        {
          '--pf-stack-svg-rings-size': `${ringPx}px`,
          '--pf-stack-svg-rings-ink': fillColor,
          '--pf-stack-svg-rings-name': nameInk,
          '--pf-stack-svg-rings-frame': presentation.cardBorderColor,
        } as CSSProperties
      }
    >
      {showLevel && level ? (
        <ToolsLevelSvgRingWithLabel
          label={showName ? name : ''}
          percent={percent}
          fillColor={fillColor}
          trackColor={trackInk}
          labelColor={nameInk}
          size={ringPx}
          strokeWidth={toolsLevelRingStroke(ringPx, resolveToolsLevelBarSize(presentation))}
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

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    let ctx: gsap.Context | undefined;

    try {
      if (prefersReducedMotion()) return undefined;
      gsap.registerPlugin(ScrollTrigger);

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
      className={`pf-stack-svg-rings-grid grid w-full list-none p-0 ${toolsLevelCircularCardsGridClass(columnsPerRow)} ${toolsLevelIndicatorGridGapClass(presentation.levelProgressRowGap)}`}
      role="list"
    >
      {tools.map((tool) => {
        const key = typeof tool === 'string' ? tool : `${tool.name}-${tool.iconUrl ?? ''}`;

        return (
          <li key={key} className="pf-stack-svg-rings-cell min-w-0">
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
