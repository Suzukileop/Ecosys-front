'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLayoutEffect, useRef, type CSSProperties } from 'react';
import { CreatorToolLogo } from '@/components/creator/studio/CreatorToolLogo';
import {
  resolveSkillCategory,
  resolveSkillDescription,
  resolveSkillIconUrl,
  resolveSkillName,
  resolveSkillUseCases,
  type PortfolioSkillRef,
} from '@/components/portfolio/skill-usage-descriptions';
import {
  resolveToolsIconBackgroundEnabled,
  toolsBrandCardLogoPx,
  toolsBrandCardLogoTilePx,
  type PortfolioToolsCardGap,
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

function toolsBrandIndexRowPadClass(gap: PortfolioToolsCardGap | undefined): string {
  if (gap === 'tight') return 'py-7 sm:py-8';
  if (gap === 'large') return 'py-12 sm:py-14 lg:py-16';
  if (gap === 'xlarge') return 'py-14 sm:py-16 lg:py-20';
  if (gap === 'medium') return 'py-10 sm:py-11 lg:py-12';
  return 'py-10 sm:py-12 lg:py-14';
}

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function brandIndexScrollParent(el: HTMLElement | null): HTMLElement | undefined {
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

function isLaidOut(el: HTMLElement): boolean {
  return el.getClientRects().length > 0;
}

function toolRowKey(tool: PortfolioSkillRef): string {
  return typeof tool === 'string' ? tool : `${tool.name}-${tool.iconUrl ?? ''}`;
}

/**
 * Portfolio index — logo gutter + optical text grid (name | category | description).
 * Hairlines sit on the type axis, flush to the name’s first letter.
 */
export function EditorialToolsBrandIndex({ tools, presentation }: ToolsGalleryProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const motionKey = tools.map(toolRowKey).join('\u001f');

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || motionKey.length === 0) return;
    if (prefersReducedMotion()) return;

    gsap.registerPlugin(ScrollTrigger);
    const scroller = brandIndexScrollParent(root);
    const rows = [...root.querySelectorAll<HTMLElement>('.pf-stack-brand-index-row')].filter(
      isLaidOut
    );
    const rules = [...root.querySelectorAll<HTMLElement>('.pf-stack-brand-index-rule')].filter(
      isLaidOut
    );
    if (rows.length === 0 && rules.length === 0) return;

    const ctx = gsap.context(() => {
      if (rows.length > 0) {
        // Hide immediately (pre-paint) so rows never flash at their static/visible
        // state before ScrollTrigger fires — only the reveal is scroll-gated.
        gsap.set(rows, { y: 16, opacity: 0.18 });

        ScrollTrigger.batch(rows, {
          start: 'top 92%',
          once: true,
          ...(scroller ? { scroller } : {}),
          onEnter: (batch) => {
            gsap.to(batch, {
              y: 0,
              opacity: 1,
              duration: 0.72,
              stagger: 0.065,
              ease: 'power3.out',
              overwrite: 'auto',
            });
          },
        });
      }

      rules.forEach((rule, index) => {
        gsap.set(rule, { scaleX: 0, transformOrigin: 'left center' });
        gsap.to(rule, {
          scaleX: 1,
          duration: 0.82,
          delay: Math.min(index * 0.045, 0.32),
          ease: 'power2.out',
          overwrite: 'auto',
          scrollTrigger: {
            trigger: rule,
            scroller,
            start: 'top 94%',
            once: true,
            invalidateOnRefresh: true,
          },
        });
      });
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
  const showDescription = presentation.showDescription !== false;
  const showUseCases = presentation.showUseCases !== false;
  const showCategory = presentation.showCategory !== false;
  const showName = presentation.showLabels !== false;
  const rule = presentation.cardBorderColor;
  const rowPad = toolsBrandIndexRowPadClass(presentation.cardGap);

  const rootStyle = {
    '--pf-stack-brand-index-ink': presentation.labelColor,
    '--pf-stack-brand-index-muted': presentation.descriptionColor,
    '--pf-stack-brand-index-rule': rule,
    '--pf-stack-brand-index-chip-fill': presentation.chipBackgroundColor,
    '--pf-stack-brand-index-chip-ink': presentation.chipTextColor,
  } as CSSProperties;

  return (
    <div
      ref={rootRef}
      className="pf-stack-brand-index w-full"
      data-pf-no-color-transition=""
      style={rootStyle}
    >
      <ul className="pf-stack-brand-index-list m-0 w-full list-none p-0" role="list">
        {tools.map((tool) => {
          const name = resolveSkillName(tool);
          const description = resolveSkillDescription(tool);
          const category = resolveSkillCategory(tool);
          const useCases = resolveSkillUseCases(tool);
          const key = toolRowKey(tool);
          const hasCategory = showCategory && Boolean(category);
          const hasDescription = showDescription && Boolean(description);
          const hasChips = showUseCases && useCases.length > 0;

          return (
            <li
              key={key}
              className="pf-stack-brand-index-row"
              data-pf-no-color-transition=""
            >
              <article className="pf-stack-brand-index-article">
                <div className={`pf-stack-brand-index-mark ${rowPad}`}>
                  <div
                    className="flex shrink-0 items-center justify-center rounded-[8px]"
                    style={{
                      width: framePx,
                      height: framePx,
                      backgroundColor: tileBg,
                    }}
                  >
                    <CreatorToolLogo
                      label={name}
                      iconUrl={resolveSkillIconUrl(tool)}
                      size={logoPx}
                      className="rounded-lg"
                      bgColor={logoContrastBg}
                      colorMode={logoColorMode}
                      grayscale={toolsLogosGrayscaleEnabled(presentation)}
                    />
                  </div>
                </div>

                <div className="pf-stack-brand-index-text min-w-0">
                  <div className={`pf-stack-brand-index-copy ${rowPad}`}>
                    {showName ? (
                      <h3
                        className="pf-stack-brand-index-name text-2xl font-semibold tracking-[-0.03em] sm:text-3xl lg:text-[2.15rem] lg:leading-[1.12]"
                        data-pf-no-color-transition=""
                      >
                        {name}
                      </h3>
                    ) : (
                      <span className="pf-stack-brand-index-name pf-stack-brand-index-slot" aria-hidden />
                    )}

                    {hasCategory ? (
                      <p className="pf-stack-brand-index-category">{category}</p>
                    ) : (
                      <span className="pf-stack-brand-index-category pf-stack-brand-index-slot" aria-hidden />
                    )}

                    {hasDescription ? (
                      <p className="pf-stack-brand-index-description">{description}</p>
                    ) : (
                      <span
                        className="pf-stack-brand-index-description pf-stack-brand-index-slot"
                        aria-hidden
                      />
                    )}

                    {hasChips ? (
                      <ul
                        className="pf-stack-brand-index-chips m-0 flex list-none flex-wrap p-0"
                        aria-label="Use cases"
                      >
                        {useCases.map((useCase) => (
                          <li key={useCase} className="pf-stack-brand-index-chip">
                            {useCase}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                  <div
                    className="pf-stack-brand-index-rule"
                    aria-hidden
                    data-pf-no-color-transition=""
                  />
                </div>
              </article>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
