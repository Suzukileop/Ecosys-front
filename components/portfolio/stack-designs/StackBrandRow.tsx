'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLayoutEffect, useRef, type CSSProperties } from 'react';
import { CreatorToolLogo } from '@/components/creator/studio/CreatorToolLogo';
import {
  resolveSkillIconUrl,
  resolveSkillName,
  type PortfolioSkillRef,
} from '@/components/portfolio/skill-usage-descriptions';
import {
  resolveToolsDesignBrandColumnsPerRow,
  resolveToolsIconBackgroundEnabled,
  toolsBrandCardLogoPx,
  toolsBrandCardLogoTilePx,
  toolsBrandRowCellPadClass,
  toolsBrandRowGridClass,
  toolsBrandRowGridGapClass,
  type PortfolioToolsBrandGridColumnsPerRow,
  type PortfolioToolsPresentationSettings,
} from '@/components/portfolio/portfolio-tools-settings';

type ToolsGalleryProps = {
  tools: PortfolioSkillRef[];
  presentation: PortfolioToolsPresentationSettings;
};

type BrandRowStyle = CSSProperties & {
  '--pf-stack-brand-row-ink': string;
  '--pf-stack-brand-row-rule': string;
  '--pf-stack-brand-row-logo': string;
};

function toolsIconFrameBackground(presentation: PortfolioToolsPresentationSettings): string {
  return resolveToolsIconBackgroundEnabled(presentation)
    ? presentation.tileBackgroundColor
    : 'transparent';
}

function toolsLogoContrastBackground(presentation: PortfolioToolsPresentationSettings): string {
  if (resolveToolsIconBackgroundEnabled(presentation)) {
    return presentation.tileBackgroundColor;
  }
  const card = presentation.cardBackgroundColor?.trim();
  if (card && /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(card)) {
    return card;
  }
  return presentation.activeColorMode === 'dark' ? '#0a0a0a' : '#ffffff';
}

function toolsLogoColorMode(presentation: PortfolioToolsPresentationSettings): 'light' | 'dark' {
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

function brandRowScrollParent(el: HTMLElement | null): HTMLElement | undefined {
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

function toolRowKey(tool: PortfolioSkillRef): string {
  return typeof tool === 'string' ? tool : `${tool.name}-${tool.iconUrl ?? ''}`;
}

function brandRowLayoutCols(columns: PortfolioToolsBrandGridColumnsPerRow): 1 | 2 | 3 {
  if (columns <= 1) return 1;
  if (columns === 2) return 2;
  return 3;
}

/**
 * Brand row — equal-height logo + name cells.
 * Dividers: inset 1px hairlines. Frames: hairline only. Hover: ink + logo color.
 * Default CSS stays visible if GSAP never runs.
 */
export function EditorialToolsBrandRow({ tools, presentation }: ToolsGalleryProps) {
  const rootRef = useRef<HTMLUListElement>(null);
  const motionKey = tools.map(toolRowKey).join('\u001f');

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || motionKey.length === 0) return;
    if (prefersReducedMotion()) return;

    gsap.registerPlugin(ScrollTrigger);
    const scroller = brandRowScrollParent(root);
    const cells = [...root.querySelectorAll<HTMLElement>('.pf-stack-brand-row-cell')].filter(
      isLaidOut
    );
    const verts = [...root.querySelectorAll<HTMLElement>('.pf-stack-brand-row-rule-v')].filter(
      isLaidOut
    );
    const horiz = [...root.querySelectorAll<HTMLElement>('.pf-stack-brand-row-rule-h')].filter(
      isLaidOut
    );
    if (cells.length === 0) return;

    const ctx = gsap.context(() => {
      // Hide everything immediately (pre-paint) — only the reveal is scroll-gated,
      // so nothing ever flashes at its static/visible state first.
      gsap.set(cells, { y: 12, opacity: 0.32 });
      if (verts.length > 0) gsap.set(verts, { scaleY: 0, transformOrigin: 'center top' });
      if (horiz.length > 0) gsap.set(horiz, { scaleX: 0, transformOrigin: 'left center' });

      ScrollTrigger.batch(cells, {
        start: 'top 91%',
        once: true,
        ...(scroller ? { scroller } : {}),
        onEnter: (batch) => {
          gsap.to(batch, {
            y: 0,
            opacity: 1,
            duration: 0.76,
            stagger: 0.05,
            ease: 'power3.out',
            overwrite: 'auto',
          });
        },
      });

      if (verts.length > 0) {
        ScrollTrigger.batch(verts, {
          start: 'top 94%',
          once: true,
          ...(scroller ? { scroller } : {}),
          onEnter: (batch) => {
            gsap.to(batch, {
              scaleY: 1,
              duration: 0.74,
              stagger: 0.04,
              ease: 'power2.out',
              overwrite: 'auto',
            });
          },
        });
      }

      if (horiz.length > 0) {
        ScrollTrigger.batch(horiz, {
          start: 'top 94%',
          once: true,
          ...(scroller ? { scroller } : {}),
          onEnter: (batch) => {
            gsap.to(batch, {
              scaleX: 1,
              duration: 0.8,
              stagger: 0.035,
              ease: 'power2.out',
              overwrite: 'auto',
            });
          },
        });
      }
    }, root);

    const refreshId = window.setTimeout(() => ScrollTrigger.refresh(), 80);
    return () => {
      window.clearTimeout(refreshId);
      ctx.revert();
    };
  }, [motionKey]);

  if (tools.length === 0) return null;

  const logoPx = toolsBrandCardLogoPx(presentation.tileSize);
  const tilePx = toolsBrandCardLogoTilePx(presentation.tileSize);
  const showIconBg = resolveToolsIconBackgroundEnabled(presentation);
  const tileBg = toolsIconFrameBackground(presentation);
  const logoContrastBg = toolsLogoContrastBackground(presentation);
  const logoColorMode = toolsLogoColorMode(presentation);
  const framePx = showIconBg ? tilePx : logoPx;
  const showName = presentation.showLabels !== false;
  const ink = presentation.labelColor?.trim() || '#171717';
  const rule = presentation.cardBorderColor?.trim() || ink;
  const columnsPerRow = resolveToolsDesignBrandColumnsPerRow('brand-row', presentation);
  const layoutCols = brandRowLayoutCols(columnsPerRow);
  const cellPad = toolsBrandRowCellPadClass(presentation.cardGap);
  const cellStyle = presentation.brandRowCellStyle ?? 'dividers';
  const useFrames = cellStyle === 'frames';
  const useDividers = cellStyle === 'dividers';
  const useGap = cellStyle === 'frames' || cellStyle === 'none';
  const lockedGray = toolsLogosGrayscaleEnabled(presentation);
  const cardGap = presentation.cardGap ?? 'tight';

  const rootStyle: BrandRowStyle = {
    '--pf-stack-brand-row-ink': ink,
    '--pf-stack-brand-row-rule': rule,
    '--pf-stack-brand-row-logo': `${framePx}px`,
  };

  return (
    <ul
      ref={rootRef}
      className={[
        'pf-stack-brand-row w-full list-none p-0',
        useDividers ? `grid ${toolsBrandRowGridClass(columnsPerRow)}` : '',
        useGap ? toolsBrandRowGridGapClass(cardGap) : '',
      ]
        .filter(Boolean)
        .join(' ')}
      role="list"
      data-style={cellStyle}
      data-cols={String(layoutCols)}
      data-gap={cardGap}
      data-grayscale={lockedGray ? 'true' : 'false'}
      data-pf-no-color-transition=""
      style={rootStyle}
    >
      {tools.map((tool) => {
        const name = resolveSkillName(tool);
        const key = toolRowKey(tool);

        return (
          <li
            key={key}
            className={`pf-stack-brand-row-cell${useFrames ? ' pf-stack-brand-row-cell--frame' : ''}`}
            data-pf-no-color-transition=""
            aria-label={showName ? undefined : name}
          >
            <div className={`pf-stack-brand-row-inner ${cellPad}`}>
              <div
                className="pf-stack-brand-row-mark"
                data-pf-no-color-transition=""
                style={{
                  width: framePx,
                  height: framePx,
                  backgroundColor: tileBg,
                }}
              >
                <span className="pf-stack-brand-row-logo" data-pf-no-color-transition="">
                  <CreatorToolLogo
                    label={name}
                    iconUrl={resolveSkillIconUrl(tool)}
                    size={logoPx}
                    className="rounded-md"
                    bgColor={logoContrastBg}
                    colorMode={logoColorMode}
                    grayscale={lockedGray}
                  />
                </span>
              </div>
              {showName ? (
                <span className="pf-stack-brand-row-name" data-pf-no-color-transition="">
                  {name}
                </span>
              ) : null}
            </div>
            {useDividers ? (
              <>
                <span className="pf-stack-brand-row-rule-v" aria-hidden />
                <span className="pf-stack-brand-row-rule-h" aria-hidden />
              </>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
