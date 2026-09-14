'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLayoutEffect, useRef, type CSSProperties } from 'react';
import { CreatorToolLogo } from '@/components/creator/studio/CreatorToolLogo';
import { resolveToolLevelPercent } from '@/components/creator/studio/creator-tool-logo-color';
import type { ProfileStrengthToolLevel } from '@/types/ecosystem';
import {
  resolveSkillCategory,
  resolveSkillDescription,
  resolveSkillIconUrl,
  resolveSkillLevel,
  resolveSkillLevelLabel,
  resolveSkillName,
  resolveSkillUseCases,
  type PortfolioSkillRef,
} from '@/components/portfolio/skill-usage-descriptions';
import {
  resolveToolsDesignBrandColumnsPerRow,
  resolveToolsIconBackgroundEnabled,
  resolveToolsShowLevel,
  toolsBrandCardLogoPx,
  toolsBrandCardLogoTilePx,
  toolsBrandCardsGapClass,
  toolsBrandGridLargeColumnsClass,
  toolsLabelColorStyle,
  toolsShowcaseLogoPx,
  type PortfolioToolsPresentationSettings,
} from '@/components/portfolio/portfolio-tools-settings';

type ToolsGalleryProps = {
  tools: PortfolioSkillRef[];
  presentation: PortfolioToolsPresentationSettings;
};

const LEVEL_MICRO_INDEX: Record<ProfileStrengthToolLevel, string> = {
  beginner: '01',
  intermediate: '02',
  advanced: '03',
  expert: '04',
};

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function isLaidOut(el: HTMLElement): boolean {
  return el.getClientRects().length > 0;
}

function brandCardsScrollParent(el: HTMLElement | null): HTMLElement | undefined {
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

function mixInk(color: string, percent: number, surface: string): string {
  return `color-mix(in srgb, ${color} ${percent}%, ${surface})`;
}

function BrandCardLevelIndex({
  level,
  label,
  ink,
  accent,
  surface,
}: {
  level: ProfileStrengthToolLevel;
  label: string;
  ink: string;
  accent: string;
  surface: string;
}) {
  const index = LEVEL_MICRO_INDEX[level];
  const percent = resolveToolLevelPercent(level);

  return (
    <span className="pf-stack-brand-cards-index" title={label}>
      <span className="sr-only">{label}</span>
      <span
        aria-hidden="true"
        className="text-[0.6875rem] font-medium tabular-nums leading-none tracking-[0.16em]"
        style={{ color: mixInk(ink, 42, surface) }}
      >
        {index}
      </span>
      <span
        aria-hidden="true"
        className="pf-stack-brand-cards-bar"
        style={{ backgroundColor: mixInk(ink, 12, surface) }}
      >
        <span
          className="pf-stack-brand-cards-bar-fill"
          style={{
            width: `${percent}%`,
            backgroundColor: accent,
          }}
        />
      </span>
    </span>
  );
}

/**
 * Editorial brand dossier cards — quiet wash, shared left axis, micro level index.
 */
export function EditorialToolsBrandCards({ tools, presentation }: ToolsGalleryProps) {
  const listRef = useRef<HTMLUListElement>(null);

  const iconPlacement = presentation.brandCardsIconPlacement ?? 'top';
  const isHorizontal = iconPlacement === 'left';
  const logoPx = isHorizontal
    ? toolsShowcaseLogoPx(presentation.tileSize)
    : toolsBrandCardLogoPx(presentation.tileSize);
  const tilePx = isHorizontal
    ? Math.round(logoPx * 1.55)
    : toolsBrandCardLogoTilePx(presentation.tileSize);
  const showIconBg = resolveToolsIconBackgroundEnabled(presentation);
  const tileBg = toolsIconFrameBackground(presentation);
  const logoContrastBg = toolsLogoContrastBackground(presentation);
  const logoColorMode = toolsLogoColorMode(presentation);
  const framePx = showIconBg ? tilePx : logoPx;
  const showDescription = presentation.showDescription !== false;
  const showUseCases = presentation.showUseCases !== false;
  const showCategory = presentation.showCategory !== false;
  const showLevel = resolveToolsShowLevel(presentation);
  const showName = presentation.showLabels !== false;
  const columnsPerRow = resolveToolsDesignBrandColumnsPerRow('brand-cards', presentation);

  const surface = presentation.cardBackgroundColor?.trim() || logoContrastBg;
  const ink = presentation.labelColor?.trim() || surface;
  const border = presentation.cardBorderColor?.trim() || ink;
  const accent = presentation.levelAccentColor?.trim() || ink;
  const chipInk = presentation.chipTextColor?.trim() || ink;
  const wash = mixInk(ink, 4, surface);
  const hairline = `color-mix(in srgb, ${border} 58%, transparent)`;
  const hairlineHover = mixInk(ink, 34, border);
  const descInk = mixInk(ink, 60, surface);
  const kickerInk = mixInk(ink, 38, surface);
  const useInk = mixInk(chipInk, 72, surface);
  const logoHairline = showIconBg ? `color-mix(in srgb, ${ink} 10%, transparent)` : 'transparent';
  const logoWash = showIconBg ? mixInk(ink, 4, tileBg === 'transparent' ? surface : tileBg) : 'transparent';

  useLayoutEffect(() => {
    const root = listRef.current;
    if (!root || tools.length === 0) return;
    if (prefersReducedMotion()) return;

    gsap.registerPlugin(ScrollTrigger);
    const scroller = brandCardsScrollParent(root);
    const ctx = gsap.context(() => {
      const items = gsap.utils
        .toArray<HTMLElement>(root.querySelectorAll('.pf-stack-brand-cards-item'))
        .filter(isLaidOut);
      if (items.length === 0) return;

      ScrollTrigger.batch(items, {
        start: 'top 90%',
        once: true,
        ...(scroller ? { scroller } : {}),
        onEnter: (batch) => {
          gsap.fromTo(
            batch,
            { y: 18, opacity: 0.22 },
            {
              y: 0,
              opacity: 1,
              duration: 0.72,
              stagger: 0.08,
              ease: 'power3.out',
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
  }, [tools, iconPlacement, columnsPerRow]);

  if (tools.length === 0) return null;

  return (
    <ul
      ref={listRef}
      className={`pf-stack-brand-cards grid w-full list-none grid-cols-1 p-0 ${toolsBrandGridLargeColumnsClass(columnsPerRow)} ${toolsBrandCardsGapClass(presentation.cardGap)}`}
      data-icon={isHorizontal ? 'left' : 'top'}
      role="list"
    >
      {tools.map((tool) => {
        const name = resolveSkillName(tool);
        const description = resolveSkillDescription(tool);
        const useCases = resolveSkillUseCases(tool);
        const level = resolveSkillLevel(tool);
        const levelLabel = resolveSkillLevelLabel(tool);
        const category = resolveSkillCategory(tool);
        const key = typeof tool === 'string' ? tool : `${tool.name}-${tool.iconUrl ?? ''}`;

        const levelIndex =
          showLevel && level ? (
            <BrandCardLevelIndex
              level={level}
              label={levelLabel}
              ink={ink}
              accent={accent}
              surface={surface}
            />
          ) : null;

        const logoTile = (
          <div
            className="pf-stack-brand-cards-logo"
            data-pf-no-color-transition=""
            style={{
              width: framePx,
              height: framePx,
              backgroundColor: logoWash,
              borderColor: logoHairline,
              borderWidth: showIconBg ? 1 : 0,
            }}
          >
            <CreatorToolLogo
              label={name}
              iconUrl={resolveSkillIconUrl(tool)}
              size={logoPx}
              className="rounded-[2px]"
              bgColor={logoContrastBg}
              colorMode={logoColorMode}
              grayscale={toolsLogosGrayscaleEnabled(presentation)}
            />
          </div>
        );

        const copyBlock = (
          <div className="pf-stack-brand-cards-copy">
            {isHorizontal ? (
              <div className="pf-stack-brand-cards-head">
                {showName ? (
                  <h3
                    className="pf-stack-brand-cards-name min-w-0 text-[1.0625rem] font-medium leading-[1.2] tracking-[-0.022em] sm:text-[1.125rem]"
                    style={toolsLabelColorStyle(presentation.labelColor)}
                  >
                    {name}
                  </h3>
                ) : (
                  <span />
                )}
                {levelIndex}
              </div>
            ) : showName ? (
              <h3
                className="pf-stack-brand-cards-name text-[1.0625rem] font-medium leading-[1.2] tracking-[-0.022em] sm:text-[1.125rem]"
                style={toolsLabelColorStyle(presentation.labelColor)}
              >
                {name}
              </h3>
            ) : null}

            {showName && showCategory && category ? (
              <p
                className="pf-stack-brand-cards-kicker text-[0.625rem] font-medium uppercase tracking-[0.18em]"
                style={{ color: kickerInk }}
              >
                {category}
              </p>
            ) : null}

            {showDescription && description ? (
              <p
                className="pf-stack-brand-cards-desc text-[0.8125rem] sm:text-[0.875rem]"
                style={{ color: descInk }}
              >
                {description}
              </p>
            ) : null}

            {showUseCases && useCases.length > 0 ? (
              <ul className="pf-stack-brand-cards-uses mt-auto flex list-none flex-wrap items-baseline p-0">
                {useCases.map((useCase, index) => (
                  <li
                    key={useCase}
                    className="text-[0.6875rem] font-medium leading-[1.5] tracking-[0.02em]"
                    style={{ color: useInk }}
                  >
                    {index > 0 ? (
                      <span className="px-1.5" aria-hidden="true">
                        ·
                      </span>
                    ) : null}
                    {useCase}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        );

        return (
          <li
            key={key}
            className="pf-stack-brand-cards-item min-w-0"
            data-pf-no-color-transition=""
            style={
              {
                '--pf-stack-brand-cards-hairline': hairline,
                '--pf-stack-brand-cards-hairline-hover': hairlineHover,
                '--pf-stack-brand-cards-wash': wash,
              } as CSSProperties
            }
          >
            <div className="pf-stack-brand-cards-scale" data-pf-no-color-transition="">
              <article
                className="pf-stack-brand-cards-surface"
                data-pf-no-color-transition=""
              >
                {isHorizontal ? (
                  <>
                    {logoTile}
                    {copyBlock}
                  </>
                ) : (
                  <>
                    <div className="pf-stack-brand-cards-mast">
                      {logoTile}
                      {levelIndex}
                    </div>
                    {copyBlock}
                  </>
                )}
              </article>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
