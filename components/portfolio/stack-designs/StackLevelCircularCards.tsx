'use client';

import { useLayoutEffect, useRef, type CSSProperties } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CreatorToolLogo } from '@/components/creator/studio/CreatorToolLogo';
import {
  resolveToolLevelPercent,
  useToolLevelBarColor,
} from '@/components/creator/studio/creator-tool-logo-color';
import { ToolsLevelCircularRingWithLogo } from '@/components/portfolio/portfolio-tools-level-indicators';
import {
  resolveToolsDesignBrandColumnsPerRow,
  resolveToolsLevelBarSize,
  resolveToolsShowLevel,
  toolsLevelCircularCardsGridClass,
  toolsLevelCircularLogoPx,
  toolsLevelCircularRingPx,
  toolsLevelBarPercentRem,
  toolsLevelCircularRingStroke,
  toolsLevelIndicatorGridGapClass,
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

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function circularCardsScrollParent(el: HTMLElement | null): HTMLElement | undefined {
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

function toolsLogoColorMode(
  presentation: PortfolioToolsPresentationSettings
): 'light' | 'dark' {
  return presentation.activeColorMode === 'light' ? 'light' : 'dark';
}

function toolsLogosGrayscaleEnabled(presentation: PortfolioToolsPresentationSettings): boolean {
  return presentation.logosGrayscale === true;
}

function toolsLevelIndicatorFillColor(
  presentation: PortfolioToolsPresentationSettings,
  logoDerivedColor: string
): string {
  if (!toolsLogosGrayscaleEnabled(presentation)) {
    return logoDerivedColor;
  }
  const label = presentation.labelColor?.trim();
  if (label) return label;
  return presentation.activeColorMode === 'dark' ? '#f5f5f5' : '#171717';
}

function CircularCardItem({
  tool,
  presentation,
  ringPx,
  logoPx,
  logoColorMode,
  showName,
  showLevel,
  levelTrackColor,
}: {
  tool: PortfolioSkillRef;
  presentation: PortfolioToolsPresentationSettings;
  ringPx: number;
  logoPx: number;
  logoColorMode: 'light' | 'dark';
  showName: boolean;
  showLevel: boolean;
  levelTrackColor: string;
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
  const ringColor = toolsLevelIndicatorFillColor(presentation, logoBarColor);
  const percent = resolveToolLevelPercent(level);
  const logoBrandColor =
    !toolsLogosGrayscaleEnabled(presentation) && fromLogo ? logoBarColor : undefined;
  const trackColor = `color-mix(in srgb, ${levelTrackColor} 42%, transparent)`;
  const showRing = Boolean(showLevel && level && percent > 0);

  const logo = (
    <span className="pf-stack-circular-tone" data-pf-no-color-transition="">
      <CreatorToolLogo
        label={name}
        iconUrl={iconUrl}
        size={logoPx}
        className="pf-stack-circular-logo"
        colorMode={logoColorMode}
        brandColor={logoBrandColor}
        grayscale={toolsLogosGrayscaleEnabled(presentation)}
      />
    </span>
  );

  return (
    <article
      className="pf-stack-circular-card flex h-full flex-col items-center text-center"
      data-pf-no-color-transition=""
    >
      <div
        className="pf-stack-circular-scale"
        data-pf-no-color-transition=""
        style={
          {
            '--pf-stack-circular-size': `${ringPx}px`,
            '--pf-stack-circular-percent': String(percent),
            '--pf-stack-circular-fill': ringColor,
            '--pf-stack-circular-percent-size': toolsLevelBarPercentRem(
              resolveToolsLevelBarSize(presentation)
            ),
          } as CSSProperties
        }
      >
        <div
          className="pf-stack-circular-dial"
          data-pf-no-color-transition=""
          data-pf-tick={showRing ? 'on' : 'off'}
          style={{ width: ringPx, height: ringPx }}
        >
          {showRing ? (
            <ToolsLevelCircularRingWithLogo
              percent={percent}
              fillColor={ringColor}
              trackColor={trackColor}
              size={ringPx}
              strokeWidth={toolsLevelCircularRingStroke(ringPx, resolveToolsLevelBarSize(presentation))}
              className="pf-stack-circular-ring"
              logo={logo}
            />
          ) : (
            <div
              className="pf-stack-circular-ring flex items-center justify-center"
              style={{ width: ringPx, height: ringPx }}
            >
              {logo}
            </div>
          )}
        </div>

        {showName ? (
          <h3 className="pf-stack-circular-name" data-pf-no-color-transition="">
            {name}
          </h3>
        ) : null}

        {showLevel && level ? (
          <p className="pf-stack-circular-percent" data-pf-no-color-transition="" aria-hidden="true">
            {percent}%
          </p>
        ) : null}
      </div>
    </article>
  );
}

/**
 * Level circular cards — hairline ring, logo in air, whisper caption.
 * Stroke is drawn on view; default CSS keeps the finished arc if GSAP never runs.
 */
export function EditorialToolsLevelCircularCards({ tools, presentation }: ToolsGalleryProps) {
  const rootRef = useRef<HTMLUListElement>(null);

  const ringPx = toolsLevelCircularRingPx(presentation.tileSize);
  const logoPx = toolsLevelCircularLogoPx(presentation.tileSize);
  const logoColorMode = toolsLogoColorMode(presentation);
  const showName = presentation.showLabels !== false;
  const showLevel = resolveToolsShowLevel(presentation);
  const levelTrackColor = presentation.cardBorderColor;
  const columnsPerRow = resolveToolsDesignBrandColumnsPerRow('level-circular-cards', presentation);
  const ink = presentation.labelColor?.trim() || '#171717';

  const toolSignature = tools
    .map((tool) => (typeof tool === 'string' ? tool : `${tool.name}-${tool.iconUrl ?? ''}`))
    .join('|');

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || tools.length === 0) return;
    if (prefersReducedMotion()) return;

    gsap.registerPlugin(ScrollTrigger);
    const scroller = circularCardsScrollParent(root);
    let refreshA = 0;
    let refreshB = 0;

    const ctx = gsap.context(() => {
      const arcs = gsap.utils.toArray<SVGCircleElement>(
        root.querySelectorAll('.pf-stack-circular-ring svg circle[stroke-dasharray]')
      );
      if (arcs.length === 0) return;

      const targets = new Map<SVGCircleElement, number>();
      arcs.forEach((arc) => {
        const circ = Number.parseFloat(arc.getAttribute('stroke-dasharray') ?? '');
        const to = Number.parseFloat(arc.getAttribute('stroke-dashoffset') ?? '');
        if (!Number.isFinite(circ) || circ <= 0) return;
        targets.set(arc, Number.isFinite(to) ? to : 0);
        gsap.set(arc, { strokeDashoffset: circ });
      });

      ScrollTrigger.batch(arcs, {
        start: 'top 90%',
        once: true,
        ...(scroller ? { scroller } : {}),
        onEnter: (batch) => {
          gsap.to(batch, {
            strokeDashoffset: (_index, el) =>
              targets.get(el as SVGCircleElement) ?? 0,
            duration: 1.18,
            ease: 'power3.out',
            stagger: 0.065,
            overwrite: 'auto',
          });
        },
      });
    }, root);

    refreshA = window.setTimeout(() => ScrollTrigger.refresh(), 90);
    refreshB = window.setTimeout(() => ScrollTrigger.refresh(), 320);

    return () => {
      window.clearTimeout(refreshA);
      window.clearTimeout(refreshB);
      ctx.revert();
    };
  }, [toolSignature, ringPx, columnsPerRow, tools.length]);

  if (tools.length === 0) return null;

  return (
    <ul
      ref={rootRef}
      className={`pf-stack-circular-root grid w-full list-none p-0 ${toolsLevelCircularCardsGridClass(columnsPerRow)} ${toolsLevelIndicatorGridGapClass(presentation.levelProgressRowGap)}`}
      role="list"
      data-pf-no-color-transition=""
      style={{ ['--pf-stack-circular-ink' as string]: ink }}
    >
      {tools.map((tool) => {
        const key = typeof tool === 'string' ? tool : `${tool.name}-${tool.iconUrl ?? ''}`;

        return (
          <li key={key} className="pf-stack-circular-item min-w-0" data-pf-no-color-transition="">
            <CircularCardItem
              tool={tool}
              presentation={presentation}
              ringPx={ringPx}
              logoPx={logoPx}
              logoColorMode={logoColorMode}
              showName={showName}
              showLevel={showLevel}
              levelTrackColor={levelTrackColor}
            />
          </li>
        );
      })}
    </ul>
  );
}
