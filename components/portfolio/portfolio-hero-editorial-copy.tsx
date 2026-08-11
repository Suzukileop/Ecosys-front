'use client';

import { Fragment, type ReactNode } from 'react';
import type { PortfolioHeroData } from '@/components/portfolio/portfolio-hero-types';
import {
  HeroAvailabilityBadge,
  HeroToolsCards,
  HeroToolsGrid,
} from '@/components/portfolio/portfolio-hero-shared';
import { ArrowUpRight } from '@/components/portfolio/portfolio-section-primitives';
import { PortfolioNavContactCtaGlyph } from '@/components/portfolio/portfolio-nav-contact-cta-icons';
import type { PortfolioNavContactCtaIcon } from '@/components/portfolio/portfolio-settings-types';
import {
  availabilityPlacementJustifyClass,
  heroCtaClassName,
  heroCtaFallbackStyle,
  heroCtaLabelStyle,
  heroCtaSurfacePaddingClass,
  heroCtaSurfaceStyle,
  heroCtaSurfaceStyleForDesign,
  heroHeadlineClassName,
  heroHeadlineFontStyle,
  heroHeadlineSizeClassForElement,
  heroHeadlineUsesSplitLayout,
  heroMobileBlockAlignClass,
  heroMobileJustifyClass,
  heroMobileTextAlignClass,
  heroToolsIconSurfaceStyle,
  pickHeroAvailabilityBadgeProps,
  resolveSecondaryCtaDesign,
  resolveSecondaryCtaLabel,
  resolveSecondaryCtaTarget,
  resolveShowSecondaryCta,
  type HeroAlignClassOptions,
  type PortfolioHeroAvailabilityPlacement,
  type PortfolioHeroCtaIcon,
  type PortfolioHeroDesktopAlign,
} from '@/components/portfolio/portfolio-hero-settings';
import {
  elementTextStyleClass,
  elementTextInlineStyle,
} from '@/components/portfolio/portfolio-element-text-style';
import {
  heroHeadlineTextModifiers,
  normalizeHeroElementStyles,
} from '@/components/portfolio/portfolio-hero-element-styles';
import {
  heroCopyPositionStyle,
  type HeroCopyPlacementMode,
} from '@/components/portfolio/portfolio-hero-copy-settings';
import { resolveHeroSectionMinHeightVh } from '@/components/portfolio/portfolio-hero-settings';
import {
  resolveHeroHeadlineAccent,
  resolveHeroHeadlinePrefix,
  resolveHeroHeadlineEmphasisWord,
} from '@/components/portfolio/portfolio-hero-headline-settings';
import { HeroEditorialLayerFrame } from '@/components/portfolio/portfolio-hero-geometric';
import {
  DEFAULT_CONTENT_GUTTER,
} from '@/components/portfolio/portfolio-editorial-layout';
import {
  isColumns3HeroDivision,
  isInFlowHeroDivision,
  isVerticalHeroDivision,
  resolveHeroLayoutDivision,
} from '@/components/portfolio/portfolio-hero-layout-division';
import {
  heroUltraWideGridClass,
  resolveHeroUltraWideColumnLayout,
  type HeroCopyColumnSlot,
} from '@/components/portfolio/portfolio-hero-ultrawide-columns';
import {
  heroCopyElementMarginStyle,
  heroCopyElementSurfacePaintStyle,
  heroCopyElementSurfaceStyle,
  resolveHeroCopyElementsLayout,
  type HeroCopyElementId,
  type HeroCopyStatsSide,
} from '@/components/portfolio/portfolio-hero-copy-element-layout';

function buildHeadline(data: PortfolioHeroData): string {
  const { presentation } = data;
  return resolveHeroHeadlineAccent({
    specialite: data.specialite,
    fullName: data.fullName,
    nameAccent: data.nameAccent,
    valueSource: presentation.heroHeadlineValue,
  });
}

function HeroContactCta({
  href,
  design,
  showIcon = true,
  icon = 'phone',
  presentation,
  onNavigateSection,
  className = '',
  textClassName = '',
  surfacePaddingClass = '',
}: {
  href: string;
  design: PortfolioHeroData['presentation']['ctaDesign'];
  showIcon?: boolean;
  icon?: PortfolioHeroCtaIcon;
  presentation: PortfolioHeroData['presentation'];
  onNavigateSection?: PortfolioHeroData['onNavigateSection'];
  className?: string;
  textClassName?: string;
  surfacePaddingClass?: string;
}) {
  const labelStyle = heroCtaLabelStyle(design, presentation);
  const surfaceStyle = heroCtaSurfaceStyle(presentation);
  return (
    <a
      href={href}
      className={`${heroCtaClassName(design)} ${surfacePaddingClass} ${textClassName} ${className}`.trim()}
      style={{ ...heroCtaFallbackStyle(design), ...surfaceStyle, ...labelStyle }}
      onClick={(event) => {
        if (!onNavigateSection) return;
        event.preventDefault();
        const id = href.replace(/^#/, '') || 'contact';
        onNavigateSection(id === 'footer' ? 'contact' : id);
      }}
    >
      {showIcon ? (
        <PortfolioNavContactCtaGlyph
          variant={icon as PortfolioNavContactCtaIcon}
          className="h-4 w-4 shrink-0"
        />
      ) : null}
      Contact me
      {design === 'text-arrow' ? <ArrowUpRight className="h-4 w-4" /> : null}
    </a>
  );
}

/** Secondary link/button beside Contact — points to a selectable section. */
function HeroSecondaryCta({
  label,
  target,
  design,
  presentation,
  onNavigateSection,
  className = '',
  textClassName = '',
}: {
  label: string;
  target: string;
  design: PortfolioHeroData['presentation']['secondaryCtaDesign'];
  presentation: PortfolioHeroData['presentation'];
  onNavigateSection?: PortfolioHeroData['onNavigateSection'];
  className?: string;
  textClassName?: string;
}) {
  const href = `#${target}`;
  const displayLabel = label.trim() || 'View my work';
  const isTextArrow = design === 'text-arrow';
  const designClass = isTextArrow
    ? 'inline-flex items-center gap-2 px-0 py-2 text-sm font-bold underline underline-offset-4 transition'
    : heroCtaClassName(design);
  const labelStyle = heroCtaLabelStyle(design, presentation);
  const surfaceStyle = isTextArrow
    ? undefined
    : heroCtaSurfaceStyleForDesign(presentation, design);
  return (
    <a
      href={href}
      className={`${designClass} ${textClassName} ${className}`.trim()}
      style={{ ...heroCtaFallbackStyle(design), ...surfaceStyle, ...labelStyle }}
      data-hero-secondary-cta
      onClick={(event) => {
        if (!onNavigateSection) return;
        event.preventDefault();
        onNavigateSection(target);
      }}
    >
      {displayLabel}
      {design === 'text-arrow' ? <ArrowUpRight className="h-4 w-4" /> : null}
    </a>
  );
}

function HeroCtaPair({
  data,
  contactNode,
}: {
  data: PortfolioHeroData;
  contactNode: ReactNode;
}) {
  const { presentation } = data;
  const showSecondary = resolveShowSecondaryCta(presentation);
  if (!showSecondary) return <>{contactNode}</>;

  const elementStyles = normalizeHeroElementStyles(presentation.elementStyles, presentation);
  const secondaryDesign = resolveSecondaryCtaDesign(presentation);
  const useCtaTextChrome =
    secondaryDesign === 'pill-outline' || secondaryDesign === 'text-arrow';
  const ctaTextClass = useCtaTextChrome
    ? elementTextStyleClass(elementStyles.cta, 'label')
    : '';

  return (
    <div className="flex flex-wrap items-center gap-4 sm:gap-5" data-hero-cta-pair>
      {contactNode}
      <HeroSecondaryCta
        label={resolveSecondaryCtaLabel(presentation)}
        target={resolveSecondaryCtaTarget(presentation)}
        design={secondaryDesign}
        presentation={presentation}
        onNavigateSection={data.onNavigateSection}
        textClassName={ctaTextClass}
      />
    </div>
  );
}

/** Contact CTA sits next to the stats chips (vertical division only). */
export function isHeroCtaBesideStats(
  presentation: PortfolioHeroData['presentation']
): boolean {
  const layout = resolveHeroCopyElementsLayout(presentation);
  return (
    isInFlowHeroDivision(resolveHeroLayoutDivision(presentation)) &&
    layout.cta.statsSide !== 'in-copy'
  );
}

/** @deprecated Use isHeroCtaBesideStats */
export function isHeroCtaBelowStats(
  presentation: PortfolioHeroData['presentation']
): boolean {
  return isHeroCtaBesideStats(presentation);
}

export function resolveHeroCtaStatsSide(
  presentation: PortfolioHeroData['presentation']
): 'above' | 'below' | null {
  if (!isHeroCtaBesideStats(presentation)) return null;
  const side = resolveHeroCopyElementsLayout(presentation).cta.statsSide;
  return side === 'above-stats' ? 'above' : 'below';
}

export function heroCopyBandHasContent(
  presentation: PortfolioHeroData['presentation'],
  band: Exclude<HeroCopyStatsSide, 'in-copy'>
): boolean {
  if (!isInFlowHeroDivision(resolveHeroLayoutDivision(presentation))) return false;
  const layout = resolveHeroCopyElementsLayout(presentation);
  return (Object.keys(layout) as HeroCopyElementId[]).some(
    (id) => layout[id].statsSide === band
  );
}

function heroCopyElementHasRenderableContent(
  data: PortfolioHeroData,
  element: HeroCopyElementId
): boolean {
  const { presentation } = data;
  switch (element) {
    case 'availability':
      return presentation.showAvailabilityBadge;
    case 'headline':
      return Boolean(buildHeadline(data).trim());
    case 'description':
      return Boolean(data.description?.trim());
    case 'tools':
      return data.tools.length > 0;
    case 'cta':
      return Boolean(data.showContactCta || resolveShowSecondaryCta(presentation));
    default:
      return false;
  }
}

function heroCopyElementsOnSide(
  presentation: PortfolioHeroData['presentation'],
  side: HeroCopyStatsSide
): HeroCopyElementId[] {
  const layout = resolveHeroCopyElementsLayout(presentation);
  return (Object.keys(layout) as HeroCopyElementId[]).filter(
    (id) => layout[id].statsSide === side
  );
}

/** True when the Copy frame would show at least one element. */
export function heroDivisionCopyHasContent(data: PortfolioHeroData): boolean {
  return heroCopyElementsOnSide(data.presentation, 'in-copy').some((id) =>
    heroCopyElementHasRenderableContent(data, id)
  );
}

function heroStatsWouldRender(data: PortfolioHeroData): boolean {
  const meta = data.presentation;
  if (meta.showStats === false) return false;
  if (data.yearsOfExperience != null && data.yearsOfExperience > 0 && meta.showYearsCard) {
    return true;
  }
  if (data.workCount != null && data.workCount > 0 && meta.showProjectsCard) return true;
  if (data.locationLabel?.trim() && meta.showLocationCard) return true;
  return false;
}

/** Portrait column (columns-3) / visual portrait half content. */
export function heroDivisionPortraitHasContent(data: PortfolioHeroData): boolean {
  return (
    Boolean(data.presentation.showPortrait) ||
    heroCopyElementsOnSide(data.presentation, 'free-zone').some((id) =>
      heroCopyElementHasRenderableContent(data, id)
    )
  );
}

/** Stats column / stats half content (chips + glued copy bands). */
export function heroDivisionStatsHasContent(data: PortfolioHeroData): boolean {
  if (heroStatsWouldRender(data)) return true;
  return (['above-stats', 'below-stats'] as const).some((band) =>
    heroCopyElementsOnSide(data.presentation, band).some((id) =>
      heroCopyElementHasRenderableContent(data, id)
    )
  );
}

/** True when the Visual frame would show portrait, stats, or moved copy. */
export function heroDivisionVisualHasContent(data: PortfolioHeroData): boolean {
  return heroDivisionPortraitHasContent(data) || heroDivisionStatsHasContent(data);
}

/** Standalone Contact row for stats-adjacent placement. */
export function HeroEditorialContactCta({
  data,
  className = '',
}: {
  data: PortfolioHeroData;
  className?: string;
}) {
  if (!data.showContactCta && !resolveShowSecondaryCta(data.presentation)) return null;

  const { presentation } = data;
  const division = resolveHeroLayoutDivision(presentation);
  const vertical = isInFlowHeroDivision(division);
  const flipped = division === 'horizontal-copy-right';
  const desktopEnd = flipped;
  const elementStyles = normalizeHeroElementStyles(presentation.elementStyles, presentation);
  const ctaTextClass = elementTextStyleClass(elementStyles.cta, 'label');
  const ctaJustifyClass = heroMobileJustifyClass(presentation.mobileAlignCta, desktopEnd, {
    ...(vertical ? { respectAlignOnDesktop: true } : {}),
    desktopAlign: presentation.desktopAlignCta,
  });
  const layout = resolveHeroCopyElementsLayout(presentation);

  const contactNode = data.showContactCta ? (
    <HeroContactCta
      href={data.contactHref}
      design={presentation.ctaDesign}
      showIcon={presentation.showCtaIcon !== false}
      icon={presentation.ctaIcon ?? 'phone'}
      presentation={presentation}
      onNavigateSection={data.onNavigateSection}
      textClassName={
        presentation.ctaDesign === 'pill-outline' || presentation.ctaDesign === 'text-arrow'
          ? ctaTextClass
          : ''
      }
      surfacePaddingClass={heroCtaSurfacePaddingClass(presentation)}
    />
  ) : null;

  return (
    <div
      className={`flex w-full min-w-0 px-4 sm:px-6 ${ctaJustifyClass} ${className}`.trim()}
      style={heroCopyElementSurfaceStyle(layout.cta)}
      data-hero-cta-beside-stats
    >
      <HeroCtaPair data={data} contactNode={contactNode} />
    </div>
  );
}

export function HeroEditorialCopyBlock({
  data,
  align = 'start',
  className = '',
  /** Pack elements directly under each other (vertical division frames). */
  tightStack = false,
  /**
   * Which band to render. `in-copy` = main text column;
   * `above-stats` / `below-stats` = glued to the stats cell.
   */
  band = 'in-copy',
  /**
   * columns-3: only render elements whose desktopVerticalAlign matches.
   * Omit to render every element in the band.
   */
  desktopVerticalBand,
}: {
  data: PortfolioHeroData;
  align?: 'start' | 'end';
  className?: string;
  tightStack?: boolean;
  band?: HeroCopyStatsSide;
  desktopVerticalBand?: 'top' | 'center' | 'bottom';
}) {
  const { presentation } = data;
  const division = resolveHeroLayoutDivision(presentation);
  const vertical = isInFlowHeroDivision(division);
  const columns3 = isColumns3HeroDivision(division);
  const flipped = division === 'horizontal-copy-right';
  const desktopEnd = align === 'end' || flipped;
  /** Per-element align options: in-flow divisions respect the align on desktop, and an explicit desktop align (non-auto) overrides the layout side on xl+. */
  const alignOptsFor = (desktopAlign: PortfolioHeroDesktopAlign): HeroAlignClassOptions => ({
    ...(vertical ? { respectAlignOnDesktop: true } : {}),
    desktopAlign,
  });
  /** Each element keeps its own left/center/right — also inside stats bands. */
  const alignFor = (value: 'left' | 'center' | 'right'): 'left' | 'center' | 'right' => value;
  const elementsLayout = resolveHeroCopyElementsLayout(presentation);
  const sideOf = (id: HeroCopyElementId): HeroCopyStatsSide =>
    vertical ? elementsLayout[id].statsSide : 'in-copy';
  const inBand = (id: HeroCopyElementId) => {
    if (sideOf(id) !== band) return false;
    if (!desktopVerticalBand || !columns3) return true;
    return (elementsLayout[id].desktopVerticalAlign ?? 'top') === desktopVerticalBand;
  };
  const surfaceOf = (id: HeroCopyElementId) => {
    const layout = elementsLayout[id];
    // Tools pill/bar: follow palette Neutre (toolsIconBackground) instead of a stale white hex.
    // Old saves used radius 12 (default) or 64 (old max) on a full-width box — flat bottom.
    // Promote those to a true pill; leave intentional mid-range radii alone.
    const toolsLayout =
      id === 'tools' &&
      layout.backgroundEnabled &&
      (layout.backgroundRadiusPx === 12 || layout.backgroundRadiusPx === 64)
        ? { ...layout, backgroundRadiusPx: 999 }
        : layout;
    if (
      id === 'tools' &&
      toolsLayout.backgroundEnabled &&
      presentation.useHeroPalette !== false
    ) {
      return heroCopyElementSurfaceStyle(toolsLayout, presentation.toolsIconBackgroundColor);
    }
    return heroCopyElementSurfaceStyle(id === 'tools' ? toolsLayout : layout);
  };

  const toolsPillStyle = (() => {
    const layout = elementsLayout.tools;
    const toolsLayout =
      layout.backgroundEnabled &&
      (layout.backgroundRadiusPx === 12 || layout.backgroundRadiusPx === 64)
        ? { ...layout, backgroundRadiusPx: 999 }
        : layout;
    if (toolsLayout.backgroundEnabled && presentation.useHeroPalette !== false) {
      return heroCopyElementSurfacePaintStyle(toolsLayout, presentation.toolsIconBackgroundColor);
    }
    return heroCopyElementSurfacePaintStyle(toolsLayout);
  })();

  const showCta = data.showContactCta || resolveShowSecondaryCta(presentation);
  const ctaBesideStats = sideOf('cta') !== 'in-copy';
  /** In horizontal mode, above/below-stats and free-zone fall back to below-tools. */
  const ctaPlacement =
    (presentation.ctaPlacement === 'below-stats' ||
      presentation.ctaPlacement === 'above-stats' ||
      presentation.ctaPlacement === 'free-zone') &&
    !vertical
      ? 'below-tools'
      : presentation.ctaPlacement;
  const hasTools = data.tools.length > 0;
  const toolsDisplayDesign = presentation.toolsDisplayDesign ?? 'icons';
  const headline = buildHeadline(data);
  const headlinePrefix = resolveHeroHeadlinePrefix(presentation.heroHeadlinePrefix);
  const headlineEmphasisWord = resolveHeroHeadlineEmphasisWord(
    presentation.heroHeadlineEmphasisWord
  );
  const showAvailability = presentation.showAvailabilityBadge;
  const elementStyles = normalizeHeroElementStyles(presentation.elementStyles, presentation);
  const splitHeadline = heroHeadlineUsesSplitLayout(presentation.headlineFont);
  const headlinePrefixMods = heroHeadlineTextModifiers(elementStyles.headlinePrefix, {
    forceNormalCase: true,
    part: 'prefix',
    compact: splitHeadline,
  });
  const headlineEmphasisMods = heroHeadlineTextModifiers(elementStyles.headlineEmphasis, {
    forceNormalCase: true,
    part: 'emphasis',
    compact: splitHeadline,
  });
  const headlineAccentMods = heroHeadlineTextModifiers(elementStyles.headlineAccent, {
    part: 'accent',
  });
  const ctaTextClass = elementTextStyleClass(elementStyles.cta, 'label');
  const availabilityTextClass = elementTextStyleClass(elementStyles.availabilityText, 'label');
  const availabilityTextStyle = elementTextInlineStyle(elementStyles.availabilityText);

  const headlineSizeClass = heroHeadlineSizeClassForElement(
    presentation.headlineFont,
    elementStyles.headline.size === 'custom' ? 'xl' : elementStyles.headline.size
  );

  const ultraWide = resolveHeroUltraWideColumnLayout(presentation);
  const ultraWideActive =
    band === 'in-copy' && isVerticalHeroDivision(division) && ultraWide.columns > 1;
  const cols = ultraWide.columns;
  const slotCol = (slot: HeroCopyColumnSlot) => ultraWide.copySlots[slot];

  const stackGap = tightStack
    ? 'gap-3 sm:gap-4'
    : 'gap-8 sm:gap-10 lg:gap-12';
  const toolsGap = tightStack ? 'gap-2' : 'gap-3';
  const ctaAlign = alignFor(presentation.mobileAlignCta);
  const ctaJustifyClass = heroMobileJustifyClass(
    ctaAlign,
    desktopEnd,
    alignOptsFor(presentation.desktopAlignCta)
  );
  const ctaInlinePushClass =
    ctaAlign === 'right' ? 'ml-auto' : ctaAlign === 'center' ? 'mx-auto' : '';

  const availabilityBadge = showAvailability ? (
    <HeroAvailabilityBadge
      isAvailable={data.isAvailable}
      responseTimeLabel={data.responseTimeLabel}
      layoutFlipped={flipped}
      placementContext="inline"
      textClassName={availabilityTextClass}
      textStyle={availabilityTextStyle}
      {...pickHeroAvailabilityBadgeProps(presentation)}
      marginTopPx={0}
      marginBottomPx={0}
    />
  ) : null;

  const contactOnly = data.showContactCta ? (
    <HeroContactCta
      href={data.contactHref}
      design={presentation.ctaDesign}
      showIcon={presentation.showCtaIcon !== false}
      icon={presentation.ctaIcon ?? 'phone'}
      presentation={presentation}
      onNavigateSection={data.onNavigateSection}
      textClassName={
        presentation.ctaDesign === 'pill-outline' || presentation.ctaDesign === 'text-arrow'
          ? ctaTextClass
          : ''
      }
      surfacePaddingClass={heroCtaSurfacePaddingClass(presentation)}
    />
  ) : null;

  const contactCta = showCta ? <HeroCtaPair data={data} contactNode={contactOnly} /> : null;

  const contactCtaRow = contactCta ? (
    <div className={`flex w-full min-w-0 ${ctaJustifyClass}`} style={surfaceOf('cta')}>
      {contactCta}
    </div>
  ) : null;

  const desktopPlacement = presentation.availabilityPlacement;
  const mobilePlacement =
    presentation.mobileAvailabilityPlacement ?? presentation.availabilityPlacement;

  const availabilityAt = (slot: PortfolioHeroAvailabilityPlacement) => {
    if (!availabilityBadge) return null;
    const onMobile = mobilePlacement === slot;
    const onDesktop = desktopPlacement === slot;
    if (!onMobile && !onDesktop) return null;

    const visibility =
      onMobile && onDesktop ? 'flex' : onMobile ? 'flex xl:hidden' : 'hidden xl:flex';
    const activePlacement =
      onDesktop && onMobile
        ? desktopPlacement
        : onDesktop
          ? desktopPlacement
          : mobilePlacement;
    const justify = availabilityPlacementJustifyClass(
      activePlacement,
      presentation.mobileAvailabilityAlign,
      desktopEnd,
      alignOptsFor(presentation.desktopAvailabilityAlign)
    );

    return (
      <div className={`${visibility} w-full ${justify}`} style={surfaceOf('availability')}>
        {availabilityBadge}
      </div>
    );
  };

  type CopyUnit = {
    key: string;
    slot: HeroCopyColumnSlot;
    element: HeroCopyElementId;
    node: ReactNode;
  };

  const units: CopyUnit[] = [];
  const pushUnit = (
    key: string,
    slot: HeroCopyColumnSlot,
    element: HeroCopyElementId,
    node: ReactNode
  ) => {
    if (node == null) return;
    if (!inBand(element)) return;
    units.push({ key, slot, element, node });
  };

  if (inBand('availability') && band !== 'in-copy') {
    const desktopAbove = desktopPlacement === 'above-portrait';
    const mobileAbove = mobilePlacement === 'above-portrait';
    if (!(desktopAbove && mobileAbove)) {
      const visibility =
        desktopAbove && !mobileAbove
          ? 'flex xl:hidden'
          : mobileAbove && !desktopAbove
            ? 'hidden xl:flex'
            : 'flex';
      pushUnit(
        'availability-beside-stats',
        'availability',
        'availability',
        <div
          className={`${visibility} w-full min-w-0 ${heroMobileJustifyClass(
            alignFor(presentation.mobileAvailabilityAlign),
            desktopEnd,
            alignOptsFor(presentation.desktopAvailabilityAlign)
          )}`}
          style={surfaceOf('availability')}
        >
          {availabilityBadge}
        </div>
      );
    }
  }

  if (band === 'in-copy' && inBand('availability')) {
    pushUnit(
      'availability-top',
      'availability',
      'availability',
      <div className="flex w-full min-w-0 flex-col gap-3 empty:hidden">
        {availabilityAt('top-left')}
        {availabilityAt('top-center')}
        {availabilityAt('top-right')}
        {availabilityAt('above-headline')}
      </div>
    );
  }

  pushUnit(
    'headline',
    'headline',
    'headline',
    <h1
      className={`w-full max-w-full min-w-0 break-words [overflow-wrap:anywhere] leading-[0.92] ${headlineSizeClass} ${heroHeadlineClassName(presentation.headlineFont)} ${heroMobileTextAlignClass(alignFor(presentation.mobileAlignHeadline), desktopEnd, alignOptsFor(presentation.desktopAlignHeadline))}`.trim()}
      style={{
        ...heroHeadlineFontStyle(presentation.headlineFont),
        ...surfaceOf('headline'),
      }}
    >
      {splitHeadline ? (
        <>
          <span className="block break-words [overflow-wrap:anywhere]">
            <span className={headlinePrefixMods.className.trim()} style={headlinePrefixMods.style}>
              {headlinePrefix}
            </span>
            {headlineEmphasisWord ? (
              <span
                className={`ml-[0.35em] inline ${headlineEmphasisMods.className}`.trim()}
                style={headlineEmphasisMods.style}
              >
                {headlineEmphasisWord}
              </span>
            ) : null}
          </span>
          <span
            className={`mt-2 block break-words [overflow-wrap:anywhere] ${headlineAccentMods.className}`.trim()}
            style={headlineAccentMods.style}
          >
            {headline}
          </span>
        </>
      ) : (
        <>
          <span className="block break-words [overflow-wrap:anywhere]">
            <span className={headlinePrefixMods.className.trim()} style={headlinePrefixMods.style}>
              {headlinePrefix}
            </span>
            {headlineEmphasisWord ? (
              <span
                className={`ml-[0.35em] inline ${headlineEmphasisMods.className}`.trim()}
                style={headlineEmphasisMods.style}
              >
                {headlineEmphasisWord}
              </span>
            ) : null}
          </span>
          <span
            className={`mt-1 block break-words [overflow-wrap:anywhere] sm:mt-1.5 ${headlineAccentMods.className}`.trim()}
            style={headlineAccentMods.style}
          >
            {headline}
            {data.isVerified ? (
              <sup className="ml-1 align-super text-[0.42em] font-bold leading-none text-neutral-400 dark:text-neutral-500">
                ©
              </sup>
            ) : null}
          </span>
        </>
      )}
    </h1>
  );

  if (band === 'in-copy' && inBand('availability')) {
    pushUnit(
      'availability-below-headline',
      'availability',
      'availability',
      <div className="flex w-full min-w-0 flex-col gap-3 empty:hidden">
        {availabilityAt('below-headline')}
      </div>
    );
  }

  if (showCta && !ctaBesideStats && ctaPlacement === 'after-headline') {
    pushUnit('cta-after-headline', 'cta', 'cta', contactCtaRow);
  }

  pushUnit(
    'description',
    'description',
    'description',
    <p
      className={`w-full max-w-2xl min-w-0 break-words [overflow-wrap:anywhere] leading-relaxed ${elementTextStyleClass(elementStyles.description, 'body')} ${heroMobileTextAlignClass(alignFor(presentation.mobileAlignDescription), desktopEnd, alignOptsFor(presentation.desktopAlignDescription))} ${heroMobileBlockAlignClass(alignFor(presentation.mobileAlignDescription), desktopEnd, alignOptsFor(presentation.desktopAlignDescription))}`.trim()}
      style={{
        ...elementTextInlineStyle(elementStyles.description),
        ...surfaceOf('description'),
      }}
    >
      {data.description}
    </p>
  );

  if (band === 'in-copy' && inBand('availability')) {
    pushUnit(
      'availability-below-description',
      'availability',
      'availability',
      <div className="flex w-full min-w-0 flex-col gap-3 empty:hidden">
        {availabilityAt('below-description')}
      </div>
    );
  }

  if (showCta && !ctaBesideStats && ctaPlacement === 'below-pitch') {
    pushUnit('cta-below-pitch', 'cta', 'cta', contactCtaRow);
  }

  if (band === 'in-copy' && inBand('availability')) {
    pushUnit(
      'availability-above-tools',
      'availability',
      'availability',
      <div className="flex w-full min-w-0 flex-col gap-3 empty:hidden">
        {availabilityAt('above-tools')}
      </div>
    );
  }

  if (
    (hasTools && inBand('tools')) ||
    (showCta && !ctaBesideStats && ctaPlacement === 'with-tools' && inBand('cta'))
  ) {
    pushUnit(
      'tools',
      'tools',
      hasTools && inBand('tools') ? 'tools' : 'cta',
      <div
        className="flex w-full flex-col gap-1.5"
        style={heroCopyElementMarginStyle(elementsLayout.tools)}
      >
        {hasTools && inBand('tools') && presentation.showToolsLabel ? (
          <p
            className={`w-full ${elementTextStyleClass(elementStyles.toolsLabel, 'label')} ${heroMobileTextAlignClass(alignFor(presentation.mobileAlignTools), desktopEnd, alignOptsFor(presentation.desktopAlignTools))}`}
            style={elementTextInlineStyle(elementStyles.toolsLabel)}
          >
            {presentation.toolsLabelText.trim() || 'Preferred tools'}
          </p>
        ) : null}
        <div
          className={`flex w-full flex-wrap items-center ${toolsGap} ${heroMobileJustifyClass(alignFor(presentation.mobileAlignTools), desktopEnd, alignOptsFor(presentation.desktopAlignTools))}`}
        >
          {hasTools && inBand('tools') ? (
            toolsDisplayDesign !== 'icons' ? (
              <HeroToolsCards
                tools={data.toolDetails?.length ? data.toolDetails : data.tools}
                design={toolsDisplayDesign}
                presentation={presentation}
              />
            ) : (
              <div
                className={`flex min-w-0 max-w-full flex-wrap items-center ${toolsGap} ${
                  elementsLayout.tools.backgroundEnabled ? 'w-fit' : ''
                }`}
                style={toolsPillStyle}
              >
                <HeroToolsGrid
                  tools={data.tools}
                  layout="row"
                  onDark
                  arrangement={presentation.toolsIconArrangement ?? 'spaced'}
                  showIconBackground={presentation.toolsIconBackgroundEnabled !== false}
                  iconSurfaceStyle={heroToolsIconSurfaceStyle(presentation)}
                  surfaceBackgroundColor={
                    elementsLayout.tools.backgroundEnabled
                      ? presentation.useHeroPalette !== false
                        ? presentation.toolsIconBackgroundColor
                        : elementsLayout.tools.backgroundColor
                      : presentation.toolsIconBackgroundColor
                  }
                  iconSizePx={presentation.toolsIconSizePx}
                  iconPaddingPx={presentation.toolsIconPaddingPx}
                  iconGapPx={presentation.toolsIconGapPx}
                  iconMarginPx={presentation.toolsIconMarginPx}
                />
              </div>
            )
          ) : null}
          {showCta &&
          !ctaBesideStats &&
          ctaPlacement === 'with-tools' &&
          contactCta &&
          inBand('cta') &&
          toolsDisplayDesign === 'icons' ? (
            hasTools && inBand('tools') ? (
              <div className={`flex shrink-0 ${ctaInlinePushClass}`.trim()}>{contactCta}</div>
            ) : (
              contactCtaRow
            )
          ) : null}
        </div>
        {toolsDisplayDesign !== 'icons' &&
        showCta &&
        !ctaBesideStats &&
        ctaPlacement === 'with-tools' &&
        contactCta &&
        inBand('cta') ? (
          <div className={`mt-2 flex w-full ${ctaJustifyClass}`}>{contactCta}</div>
        ) : null}
      </div>
    );
  }

  if (band === 'in-copy' && inBand('availability')) {
    pushUnit(
      'availability-below-tools',
      'availability',
      'availability',
      <div className="flex w-full min-w-0 flex-col gap-3 empty:hidden">
        {availabilityAt('below-tools')}
      </div>
    );
  }

  if (showCta && !ctaBesideStats && ctaPlacement === 'below-tools') {
    pushUnit('cta-below-tools', 'cta', 'cta', contactCtaRow);
  }

  if (showCta && ctaBesideStats && inBand('cta') && band !== 'in-copy') {
    pushUnit('cta-beside-stats', 'cta', 'cta', contactCtaRow);
  }

  if (units.length === 0) return null;

  if (ultraWideActive) {
    return (
      <div
        className={`grid w-full min-w-0 grid-cols-1 items-start ${stackGap} ${heroUltraWideGridClass(cols)} ${className}`.trim()}
      >
        {Array.from({ length: cols }, (_, i) => i + 1).map((col) => (
          <div
            key={col}
            className={`flex w-full min-w-0 flex-col items-stretch ${stackGap}`}
          >
            {units
              .filter((unit) => slotCol(unit.slot) === col)
              .map((unit) => (
                <Fragment key={unit.key}>{unit.node}</Fragment>
              ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className={`flex w-full min-w-0 flex-col items-stretch ${stackGap} ${className}`.trim()}
    >
      {units.map((unit) => (
        <Fragment key={unit.key}>{unit.node}</Fragment>
      ))}
    </div>
  );
}

export function PortfolioHeroEditorialCopyLayer({ data }: { data: PortfolioHeroData }) {
  const { heroCopyPlacementMode, heroCopyPosition } = data.presentation;
  const contentGutter = data.contentGutter ?? DEFAULT_CONTENT_GUTTER;
  const contentWidthClass = data.contentWidthClass ?? 'max-w-none';

  if (heroCopyPlacementMode !== 'free') return null;

  return (
    <HeroEditorialLayerFrame
      gutter={contentGutter}
      contentWidthClass={contentWidthClass}
      className="z-[12] overflow-visible"
      style={{ minHeight: `${resolveHeroSectionMinHeightVh(data.presentation)}vh` }}
    >
      <div className="pointer-events-auto absolute" style={heroCopyPositionStyle(heroCopyPosition)}>
        <HeroEditorialCopyBlock data={data} />
      </div>
    </HeroEditorialLayerFrame>
  );
}

export function isHeroCopyFreeMode(mode: HeroCopyPlacementMode): boolean {
  return mode === 'free';
}
