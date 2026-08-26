'use client';

import type { PortfolioHeroData } from '@/components/portfolio/portfolio-hero-types';
import { PortfolioHeroEditorial } from '@/components/portfolio/hero-variants/PortfolioHeroEditorial';
import { PortfolioHeroSwissEditorial } from '@/components/portfolio/hero-variants/PortfolioHeroSwissEditorial';
import { PortfolioHeroPortraitIdentity } from '@/components/portfolio/hero-variants/PortfolioHeroPortraitIdentity';
import { PortfolioHeroEditorialRail } from '@/components/portfolio/hero-variants/PortfolioHeroEditorialRail';
import { PortfolioHeroStatementCta } from '@/components/portfolio/hero-variants/PortfolioHeroStatementCta';
import { PortfolioHeroPortraitBalance } from '@/components/portfolio/hero-variants/PortfolioHeroPortraitBalance';
import { PortfolioHeroLeftPortrait } from '@/components/portfolio/hero-variants/PortfolioHeroLeftPortrait';
import { PortfolioHeroCirclePortrait } from '@/components/portfolio/hero-variants/PortfolioHeroCirclePortrait';
import { PortfolioHeroExperienceSplit } from '@/components/portfolio/hero-variants/PortfolioHeroExperienceSplit';
import { PortfolioHeroEditorialOverlap } from '@/components/portfolio/hero-variants/PortfolioHeroEditorialOverlap';
import { PortfolioHeroSelectedWorks } from '@/components/portfolio/hero-variants/PortfolioHeroSelectedWorks';
import {
  DEFAULT_CONTENT_GUTTER,
  portfolioEditorialShellClass,
} from '@/components/portfolio/portfolio-editorial-layout';
import {
  PortfolioHeroMotifsLayer,
  PortfolioHeroPrimaryMotifOverlay,
} from '@/components/portfolio/PortfolioHeroMotifsLayer';
import { usePortfolioHeroGeomFade } from '@/components/portfolio/use-portfolio-hero-geom-fade';
import {
  PortfolioHeroEditorialMetaLayer,
  PortfolioHeroEditorialPortraitLayer,
} from '@/components/portfolio/portfolio-hero-shared';
import {
  PortfolioHeroEditorialCopyLayer,
  heroDivisionCopyHasContent,
  heroDivisionVisualHasContent,
} from '@/components/portfolio/portfolio-hero-editorial-copy';
import { heroSectionBackgroundStyle } from '@/components/portfolio/portfolio-hero-background-settings';
import { portfolioHeroTopClearancePaddingClass } from '@/components/portfolio/portfolio-nav-top-clearance';
import {
  isColumns3HeroDivision,
  isInFlowHeroDivision,
  resolveHeroLayoutDivision,
} from '@/components/portfolio/portfolio-hero-layout-division';

export function PortfolioHeroSection(heroData: PortfolioHeroData) {
  const { sectionRef, opacity: geomOpacity } = usePortfolioHeroGeomFade(
    heroData.geomFadeEnabled ?? false
  );
  const isSwissEditorial = heroData.presentation.heroBannerDesign === 'swiss-editorial';
  const isPortraitIdentity = heroData.presentation.heroBannerDesign === 'portrait-identity';
  const isEditorialRail = heroData.presentation.heroBannerDesign === 'editorial-rail';
  const isStatementCta = heroData.presentation.heroBannerDesign === 'statement-cta';
  const isPortraitBalance = heroData.presentation.heroBannerDesign === 'portrait-balance';
  const isLeftPortrait = heroData.presentation.heroBannerDesign === 'left-portrait';
  const isCirclePortrait = heroData.presentation.heroBannerDesign === 'circle-portrait';
  const isExperienceSplit = heroData.presentation.heroBannerDesign === 'experience-split';
  const isEditorialOverlap = heroData.presentation.heroBannerDesign === 'editorial-overlap';
  const isSelectedWorks = heroData.presentation.heroBannerDesign === 'selected-works';

  if (isSwissEditorial) {
    return (
      <section id="hero" ref={sectionRef} className="relative isolate overflow-x-clip">
        <PortfolioHeroSwissEditorial data={heroData} />
      </section>
    );
  }

  if (isPortraitIdentity) {
    return (
      <section id="hero" ref={sectionRef} className="relative isolate overflow-x-clip">
        <PortfolioHeroPortraitIdentity data={heroData} />
      </section>
    );
  }

  if (isEditorialRail) {
    return (
      <section id="hero" ref={sectionRef} className="relative isolate overflow-x-clip">
        <PortfolioHeroEditorialRail data={heroData} />
      </section>
    );
  }

  if (isStatementCta) {
    return (
      <section id="hero" ref={sectionRef} className="relative isolate overflow-x-clip">
        <PortfolioHeroStatementCta data={heroData} />
      </section>
    );
  }

  if (isPortraitBalance) {
    return (
      <section id="hero" ref={sectionRef} className="relative isolate overflow-x-clip">
        <PortfolioHeroPortraitBalance data={heroData} />
      </section>
    );
  }

  if (isLeftPortrait) {
    return (
      <section id="hero" ref={sectionRef} className="relative isolate overflow-x-clip">
        <PortfolioHeroLeftPortrait data={heroData} />
      </section>
    );
  }

  if (isCirclePortrait) {
    return (
      <section id="hero" ref={sectionRef} className="relative isolate overflow-x-clip">
        <PortfolioHeroCirclePortrait data={heroData} />
      </section>
    );
  }

  if (isExperienceSplit) {
    return (
      <section id="hero" ref={sectionRef} className="relative isolate overflow-x-clip">
        <PortfolioHeroExperienceSplit data={heroData} />
      </section>
    );
  }

  if (isEditorialOverlap) {
    return (
      <section id="hero" ref={sectionRef} className="relative isolate overflow-x-clip">
        <PortfolioHeroEditorialOverlap data={heroData} />
      </section>
    );
  }

  if (isSelectedWorks) {
    return (
      <section id="hero" ref={sectionRef} className="relative isolate overflow-x-clip">
        <PortfolioHeroSelectedWorks data={heroData} />
      </section>
    );
  }

  const { motifLayout, heroMotifs } = heroData.presentation;
  const contentGutter = heroData.contentGutter ?? DEFAULT_CONTENT_GUTTER;
  const contentWidthClass = heroData.contentWidthClass ?? 'max-w-none';
  const layoutDivision = resolveHeroLayoutDivision(heroData.presentation);
  const inFlowDivision = isInFlowHeroDivision(layoutDivision);
  const columns3 = isColumns3HeroDivision(layoutDivision);
  const hideEmptyParts = heroData.presentation.heroHideEmptyDivisionParts === true;
  const showCopyPart = !hideEmptyParts || heroDivisionCopyHasContent(heroData);
  const showVisualPart = !hideEmptyParts || heroDivisionVisualHasContent(heroData);
  const visualEdge =
    layoutDivision === 'horizontal-copy-right' ? 'left' : 'right';

  // Section wins: an explicit hero fill always paints on top of the global solid
  // color (same rule as the other sections). Fill "none" = show the Global page fill.
  // Fill "transparent" = paint strictly nothing, so the global color AND pattern
  // layers (below the section) stay visible through the hero.
  const transparentFill = heroData.presentation.heroSectionBackgroundFill === 'transparent';
  const ownBackgroundStyle = heroSectionBackgroundStyle(heroData.presentation);
  const backgroundStyle = transparentFill
    ? undefined
    : ownBackgroundStyle ??
      (heroData.suppressBackground ? heroData.globalBackgroundStyle : undefined);

  return (
    <section
      id="hero"
      ref={sectionRef}
      className={`relative isolate overflow-x-clip ${
        columns3
          ? 'min-h-[100dvh] min-h-screen xl:h-[100dvh] xl:max-h-[100dvh]'
          : 'min-h-[100dvh] min-h-screen'
      }`}
    >
      {backgroundStyle ? (
        <>
          {(heroData.presentation.heroSectionBackgroundOpacity ?? 100) >= 100 &&
          heroData.presentation.heroSectionBackgroundFill !== 'none' ? (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 left-1/2 z-0 w-screen -translate-x-1/2 bg-white"
            />
          ) : null}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 left-1/2 z-0 w-screen -translate-x-1/2"
            style={backgroundStyle}
          />
        </>
      ) : null}
      <PortfolioHeroMotifsLayer
        motifs={heroMotifs ?? []}
        fadeOpacity={geomOpacity}
        background={heroData.presentation}
        contentGutter={contentGutter}
        contentWidthClass={contentWidthClass}
        visualEdge={visualEdge}
        colorMode={heroData.colorMode ?? 'dark'}
      />
      {/* Free copy is section-wide only for horizontal; in-flow keeps copy inside its frame. */}
      {!inFlowDivision && showCopyPart ? <PortfolioHeroEditorialCopyLayer data={heroData} /> : null}
      <div
        className={`relative z-[1] mx-auto box-border ${contentWidthClass} ${portfolioEditorialShellClass(contentGutter)} pb-[max(7rem,calc(env(safe-area-inset-bottom,0px)+5.5rem))] sm:pb-32 xl:pb-0 ${portfolioHeroTopClearancePaddingClass()} ${
          columns3
            ? 'xl:flex xl:h-full xl:max-h-full xl:min-h-0 xl:flex-col xl:overflow-hidden'
            : ''
        }`.trim()}
      >
        <div
          className={
            columns3
              ? 'xl:flex xl:min-h-0 xl:flex-1 xl:flex-col xl:overflow-hidden'
              : undefined
          }
        >
          <PortfolioHeroEditorial data={heroData} />
        </div>
      </div>
      {!inFlowDivision ? (
        <PortfolioHeroPrimaryMotifOverlay
          motifs={heroMotifs ?? []}
          fadeOpacity={geomOpacity}
          contentGutter={contentGutter}
          contentWidthClass={contentWidthClass}
          visualEdge={visualEdge}
          colorMode={heroData.colorMode ?? 'dark'}
        />
      ) : null}
      {/* Horizontal only: absolute portrait/stats. In-flow: placed inside frames. */}
      {!inFlowDivision && showVisualPart && heroData.presentation.showPortrait ? (
        <PortfolioHeroEditorialPortraitLayer
          fullName={heroData.fullName}
          avatarUrl={heroData.avatarUrl}
          specialite={heroData.specialite}
          isAvailable={heroData.isAvailable}
          responseTimeLabel={heroData.responseTimeLabel}
          fadeOpacity={geomOpacity}
          motifLayout={motifLayout}
          profile={heroData.presentation}
          contentGutter={contentGutter}
          contentWidthClass={contentWidthClass}
          verticalDivision={false}
          layoutDivision={layoutDivision}
        />
      ) : null}
      {!inFlowDivision && showVisualPart ? (
        <PortfolioHeroEditorialMetaLayer
          yearsOfExperience={heroData.yearsOfExperience}
          workCount={heroData.workCount}
          locationLabel={heroData.locationLabel}
          fadeOpacity={geomOpacity}
          motifLayout={motifLayout}
          meta={heroData.presentation}
          contentGutter={contentGutter}
          contentWidthClass={contentWidthClass}
          verticalDivision={false}
          layoutDivision={layoutDivision}
        />
      ) : null}
    </section>
  );
}
