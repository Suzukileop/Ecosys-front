'use client';

import type { ReactNode } from 'react';
import type { PortfolioHeroData } from '@/components/portfolio/portfolio-hero-types';
import { heroSectionBackgroundStyle } from '@/components/portfolio/portfolio-hero-background-settings';
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
import { PortfolioHeroIdentityIndex } from '@/components/portfolio/hero-variants/PortfolioHeroIdentityIndex';
import { PortfolioHeroStudioSplit } from '@/components/portfolio/hero-variants/PortfolioHeroStudioSplit';
import { PortfolioHeroWorkDuo } from '@/components/portfolio/hero-variants/PortfolioHeroWorkDuo';
import { PortfolioHeroBowlIntro } from '@/components/portfolio/hero-variants/PortfolioHeroBowlIntro';
import { usePortfolioHeroGeomFade } from '@/components/portfolio/use-portfolio-hero-geom-fade';

export function PortfolioHeroSection(heroData: PortfolioHeroData) {
  const { sectionRef } = usePortfolioHeroGeomFade(heroData.geomFadeEnabled ?? false);
  const design = heroData.presentation.heroBannerDesign;

  // 'none' (default) = today's behavior: each banner design repaints its own Hero-palette
  // Fond color. Any other Background-tab choice takes over at the shell level instead, so
  // the variant's own Fond layer is suppressed (every variant already reads
  // `data.suppressBackground` for exactly this).
  const bgFill = heroData.presentation.heroSectionBackgroundFill;
  const customBackgroundStyle = heroSectionBackgroundStyle(heroData.presentation);
  const heroDataForVariant: PortfolioHeroData =
    bgFill && bgFill !== 'none' ? { ...heroData, suppressBackground: true } : heroData;

  const shell = (children: ReactNode) => (
    <section id="hero" ref={sectionRef} className="relative isolate overflow-x-clip">
      {customBackgroundStyle ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 left-1/2 z-0 w-screen -translate-x-1/2"
          style={customBackgroundStyle}
        />
      ) : null}
      {children}
    </section>
  );

  if (design === 'portrait-identity') {
    return shell(<PortfolioHeroPortraitIdentity data={heroDataForVariant} />);
  }
  if (design === 'editorial-rail') {
    return shell(<PortfolioHeroEditorialRail data={heroDataForVariant} />);
  }
  if (design === 'statement-cta') {
    return shell(<PortfolioHeroStatementCta data={heroDataForVariant} />);
  }
  if (design === 'portrait-balance') {
    return shell(<PortfolioHeroPortraitBalance data={heroDataForVariant} />);
  }
  if (design === 'left-portrait') {
    return shell(<PortfolioHeroLeftPortrait data={heroDataForVariant} />);
  }
  if (design === 'circle-portrait') {
    return shell(<PortfolioHeroCirclePortrait data={heroDataForVariant} />);
  }
  if (design === 'experience-split') {
    return shell(<PortfolioHeroExperienceSplit data={heroDataForVariant} />);
  }
  if (design === 'editorial-overlap') {
    return shell(<PortfolioHeroEditorialOverlap data={heroDataForVariant} />);
  }
  if (design === 'selected-works') {
    return shell(<PortfolioHeroSelectedWorks data={heroDataForVariant} />);
  }
  if (design === 'identity-index') {
    return shell(<PortfolioHeroIdentityIndex data={heroDataForVariant} />);
  }
  if (design === 'studio-split') {
    return shell(<PortfolioHeroStudioSplit data={heroDataForVariant} />);
  }
  if (design === 'work-duo') {
    return shell(<PortfolioHeroWorkDuo data={heroDataForVariant} />);
  }
  if (design === 'bowl-intro') {
    return shell(<PortfolioHeroBowlIntro data={heroDataForVariant} />);
  }

  // Default + legacy Classic → Swiss editorial (Classic permanently removed).
  return shell(<PortfolioHeroSwissEditorial data={heroDataForVariant} />);
}
