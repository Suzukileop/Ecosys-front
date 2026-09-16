'use client';

import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CreatorToolLogo } from '@/components/creator/studio/CreatorToolLogo';
import {
  resolveSkillIconUrl,
  resolveSkillName,
  type PortfolioSkillRef,
} from '@/components/portfolio/skill-usage-descriptions';
import {
  resolveToolsDesignContentAlignment,
  resolveToolsIconBackgroundEnabled,
  toolsLogoSizePx,
  toolsTileSizePx,
  toolsWorkflowRailGapClass,
  type PortfolioToolsPresentationSettings,
} from '@/components/portfolio/portfolio-tools-settings';

type ToolsGalleryProps = {
  tools: PortfolioSkillRef[];
  presentation: PortfolioToolsPresentationSettings;
};

function toolsIconFrameBackground(presentation: PortfolioToolsPresentationSettings): string {
  return resolveToolsIconBackgroundEnabled(presentation)
    ? presentation.tileBackgroundColor
    : 'transparent';
}

function toolsLogoContrastBackground(
  presentation: PortfolioToolsPresentationSettings
): string {
  if (resolveToolsIconBackgroundEnabled(presentation)) {
    return presentation.tileBackgroundColor;
  }
  const card = presentation.cardBackgroundColor?.trim();
  if (card && /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(card)) {
    return card;
  }
  return presentation.activeColorMode === 'dark' ? '#0a0a0a' : '#ffffff';
}

function toolsLogoColorMode(
  presentation: PortfolioToolsPresentationSettings
): 'light' | 'dark' {
  return presentation.activeColorMode === 'light' ? 'light' : 'dark';
}

function toolsLogosGrayscaleEnabled(presentation: PortfolioToolsPresentationSettings): boolean {
  return presentation.logosGrayscale === true;
}

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function isLaidOut(el: HTMLElement): boolean {
  return el.getClientRects().length > 0;
}

function stackRailScrollParent(el: HTMLElement | null): HTMLElement | undefined {
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

function stackRailDockClass(
  alignment: ReturnType<typeof resolveToolsDesignContentAlignment>
): string {
  if (alignment === 'left') return 'mr-auto';
  if (alignment === 'right') return 'ml-auto';
  return 'mx-auto';
}

/**
 * Core stack rail — logo + caption on one optical baseline.
 * Default CSS is fully visible; GSAP only staggers on view when motion is allowed.
 */
export function EditorialToolsWorkflow({ tools, presentation }: ToolsGalleryProps) {
  const railRef = useRef<HTMLUListElement>(null);

  const tilePx = toolsTileSizePx(presentation.tileSize);
  const logoPx = toolsLogoSizePx(presentation.tileSize);
  const showIconBg = resolveToolsIconBackgroundEnabled(presentation);
  const tileBg = toolsIconFrameBackground(presentation);
  const logoContrastBg = toolsLogoContrastBackground(presentation);
  const logoColorMode = toolsLogoColorMode(presentation);
  const framePx = showIconBg ? tilePx : logoPx;
  const showLabels = presentation.showLabels !== false;
  const lockedGray = toolsLogosGrayscaleEnabled(presentation);
  const alignment = resolveToolsDesignContentAlignment('workflow-rail', presentation);
  const labelInk = presentation.labelColor?.trim() || '#171717';

  const toolSignature = tools
    .map((tool) => (typeof tool === 'string' ? tool : `${tool.name}-${tool.iconUrl ?? ''}`))
    .join('|');

  useLayoutEffect(() => {
    const root = railRef.current;
    if (!root || prefersReducedMotion()) return;

    gsap.registerPlugin(ScrollTrigger);
    let ctx: gsap.Context | undefined;
    let refreshA = 0;
    let refreshB = 0;

    const scroller = stackRailScrollParent(root);
    const laidOut = [...root.querySelectorAll<HTMLElement>('.pf-stack-rail-item')].filter(
      isLaidOut
    );
    if (laidOut.length === 0) return;

    ctx = gsap.context(() => {
      // Hide immediately (pre-paint) — a timeline's own .set() only runs once the
      // scroll-gated timeline plays, which flashed items visible until then.
      gsap.set(laidOut, { opacity: 0, y: 10 });

      // Trigger per item (not once on the shared root) — when the rail wraps to
      // several rows, a single root-level trigger fires as soon as the section is
      // entered, well before the lower rows are actually in view, so their reveal
      // plays out unseen and they just sit there already visible.
      ScrollTrigger.batch(laidOut, {
        start: 'top 88%',
        once: true,
        ...(scroller ? { scroller } : {}),
        onEnter: (batch) => {
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            duration: 0.84,
            ease: 'power2.out',
            stagger: 0.055,
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
      ctx?.revert();
    };
  }, [toolSignature, framePx, showLabels]);

  if (tools.length === 0) return null;

  return (
    <ul
      ref={railRef}
      className={`pf-stack-rail ${stackRailDockClass(alignment)} ${toolsWorkflowRailGapClass(presentation.cardGap)}`}
      role="list"
      data-pf-stack-rail-locked-gray={lockedGray ? 'true' : 'false'}
      data-pf-no-color-transition=""
      style={{
        ['--pf-stack-rail-col' as string]: `${framePx}px`,
        ['--pf-stack-rail-mark' as string]: `${framePx}px`,
        ['--pf-stack-rail-ink' as string]: labelInk,
      }}
    >
      {tools.map((tool) => {
        const name = resolveSkillName(tool);
        const key = typeof tool === 'string' ? tool : `${tool.name}-${tool.iconUrl ?? ''}`;
        return (
          <li
            key={key}
            className="pf-stack-rail-item"
            data-pf-no-color-transition=""
          >
            <div
              className="pf-stack-rail-mark"
              data-pf-no-color-transition=""
              style={{ backgroundColor: tileBg }}
            >
              <div className="pf-stack-rail-tone" data-pf-no-color-transition="">
                <div className="pf-stack-rail-zoom" data-pf-no-color-transition="">
                  <CreatorToolLogo
                    label={name}
                    iconUrl={resolveSkillIconUrl(tool)}
                    size={logoPx}
                    className="rounded-md"
                    bgColor={logoContrastBg}
                    colorMode={logoColorMode}
                    grayscale={lockedGray}
                  />
                </div>
              </div>
            </div>
            {showLabels ? (
              <span className="pf-stack-rail-name" data-pf-no-color-transition="">
                {name}
              </span>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
