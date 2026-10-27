'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLayoutEffect, useRef, type CSSProperties } from 'react';
import { CreatorToolLogo } from '@/components/creator/studio/CreatorToolLogo';
import { resolveToolLevelPercent } from '@/components/creator/studio/creator-tool-logo-color';
import type { ProfileStrengthToolLevel } from '@/types/profile';
import {
  resolveSkillCategory,
  resolveSkillCustomDescription,
  resolveSkillIconUrl,
  resolveSkillLevel,
  resolveSkillLevelLabel,
  resolveSkillName,
  type PortfolioSkillRef,
} from '@/components/portfolio/skill-usage-descriptions';
import {
  resolveToolsDesignBrandColumnsPerRow,
  resolveToolsIconBackgroundEnabled,
  resolveToolsShowLevel,
  toolsBrandCardLogoPx,
  toolsBrandCardLogoTilePx,
  toolsLabelColorStyle,
  toolsShowcaseLogoPx,
  type PortfolioToolsCardGap,
  type PortfolioToolsPresentationSettings,
} from '@/components/portfolio/portfolio-tools-settings';
import { toolDisplayName } from '@/components/portfolio/stack-designs/tool-display-name';
import { mixInk, readableAccent, readableMix } from '@/components/portfolio/stack-designs/readable-ink';

type ToolsGalleryProps = {
  tools: PortfolioSkillRef[];
  presentation: PortfolioToolsPresentationSettings;
};

type BrandCardDensity = 'rich' | 'minimal';

/** Grid gutter — a CSS length (not a Tailwind class) so the column formula can subtract it. */
function brandCardsGap(gap: PortfolioToolsCardGap | undefined): string {
  if (gap === 'medium') return '16px';
  if (gap === 'large') return '32px';
  if (gap === 'xlarge') return '56px';
  return '4px';
}

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

/** Level spelled out ("Advanced") over a 4-step bar — readable without hover or a legend. */
function BrandCardLevelIndex({
  level,
  label,
  labelInk,
  track,
  fill,
}: {
  level: ProfileStrengthToolLevel;
  label: string;
  labelInk: string;
  track: string;
  fill: string;
}) {
  const percent = resolveToolLevelPercent(level);

  return (
    <span className="pf-stack-brand-cards-index">
      <span
        className="text-[0.6875rem] font-semibold uppercase leading-none tracking-[0.14em]"
        style={{ color: labelInk }}
      >
        {label}
      </span>
      <span
        aria-hidden="true"
        className="pf-stack-brand-cards-bar"
        style={{ backgroundColor: track }}
      >
        <span
          className="pf-stack-brand-cards-bar-fill"
          style={{ width: `${percent}%`, backgroundColor: fill }}
        />
      </span>
    </span>
  );
}

/**
 * Editorial brand dossier cards — quiet wash, shared left axis, spelled-out level.
 * Cards without a description of their own collapse to a compact row.
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
  const showCategory = presentation.showCategory !== false;
  const showLevel = resolveToolsShowLevel(presentation);
  const showName = presentation.showLabels !== false;
  const columnsPerRow = resolveToolsDesignBrandColumnsPerRow('brand-cards', presentation);

  const surface = presentation.cardBackgroundColor?.trim() || logoContrastBg;
  const ink = presentation.labelColor?.trim() || surface;
  const border = presentation.cardBorderColor?.trim() || ink;
  const accent = presentation.levelAccentColor?.trim() || ink;
  const wash = mixInk(ink, 4, surface);
  const washHover = mixInk(ink, 7, surface);
  const hairline = `color-mix(in srgb, ${border} 58%, transparent)`;
  const hairlineHover = mixInk(ink, 34, border);
  const descInk = presentation.descriptionColor?.trim() || readableMix(ink, 64, surface);
  const kickerInk = readableMix(ink, 46, surface);
  const levelInk = readableMix(ink, 60, surface);
  const levelTrack = mixInk(ink, 16, surface);
  const levelFill = readableAccent(accent, ink, surface);

  const densityOf = (tool: PortfolioSkillRef): BrandCardDensity =>
    showDescription && resolveSkillCustomDescription(tool) ? 'rich' : 'minimal';
  // Short-content grids can hold narrower cards (3-up from ~1200px); dossiers need ~320px.
  const minCardWidth = tools.some((tool) => densityOf(tool) !== 'minimal') ? '20rem' : '16.25rem';
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

      // Hide immediately (pre-paint) so items never flash at their static/visible
      // state before ScrollTrigger fires — only the reveal is scroll-gated.
      gsap.set(items, { y: 18, opacity: 0.22 });

      ScrollTrigger.batch(items, {
        start: 'top 90%',
        once: true,
        ...(scroller ? { scroller } : {}),
        onEnter: (batch) => {
          gsap.to(batch, {
            y: 0,
            opacity: 1,
            duration: 0.72,
            stagger: 0.08,
            ease: 'power3.out',
            overwrite: 'auto',
          });
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
      className="pf-stack-brand-cards w-full list-none p-0"
      data-icon={isHorizontal ? 'left' : 'top'}
      data-columns={columnsPerRow > 1 ? 'multi' : '1'}
      role="list"
      style={
        {
          '--pf-stack-brand-cards-cols': columnsPerRow,
          '--pf-stack-brand-cards-min': minCardWidth,
          '--pf-stack-brand-cards-gap': brandCardsGap(presentation.cardGap),
          '--pf-stack-brand-cards-accent': levelFill,
        } as CSSProperties
      }
    >
      {tools.map((tool) => {
        const name = resolveSkillName(tool);
        const displayName = toolDisplayName(name);
        const density = densityOf(tool);
        const description = resolveSkillCustomDescription(tool);
        const level = resolveSkillLevel(tool);
        const levelLabel = resolveSkillLevelLabel(tool);
        const category = resolveSkillCategory(tool);
        const key = typeof tool === 'string' ? tool : `${tool.name}-${tool.iconUrl ?? ''}`;

        const levelIndex =
          showLevel && level ? (
            <BrandCardLevelIndex
              level={level}
              label={levelLabel}
              labelInk={levelInk}
              track={levelTrack}
              fill={levelFill}
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
                    {displayName}
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
                {displayName}
              </h3>
            ) : null}

            {showName && showCategory && category ? (
              <p
                className="pf-stack-brand-cards-kicker text-[0.6875rem] font-semibold uppercase tracking-[0.16em]"
                style={{ color: kickerInk }}
              >
                {category}
              </p>
            ) : null}

            {showDescription && description ? (
              <p
                className="pf-stack-brand-cards-desc text-[0.875rem] sm:text-[0.9375rem]"
                style={{ color: descInk }}
              >
                {description}
              </p>
            ) : null}
          </div>
        );

        return (
          <li
            key={key}
            className="pf-stack-brand-cards-item min-w-0"
            data-density={density}
            data-pf-no-color-transition=""
            style={
              {
                '--pf-stack-brand-cards-hairline': hairline,
                '--pf-stack-brand-cards-hairline-hover': hairlineHover,
                '--pf-stack-brand-cards-wash': wash,
                '--pf-stack-brand-cards-wash-hover': washHover,
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
