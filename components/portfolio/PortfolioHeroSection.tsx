'use client';

import dynamic from 'next/dynamic';
import type { ReactNode } from 'react';
import type { PortfolioHeroData } from '@/components/portfolio/portfolio-hero-types';
import { heroSectionBackgroundStyle } from '@/components/portfolio/portfolio-hero-background-settings';
import { usePortfolioHeroGeomFade } from '@/components/portfolio/use-portfolio-hero-geom-fade';

/** The section renders one Hero variant, so each variant is its own chunk. */
const PortfolioHeroSwissEditorial = dynamic(() =>
  import('@/components/portfolio/hero-variants/PortfolioHeroSwissEditorial').then((m) => m.PortfolioHeroSwissEditorial)
);
const PortfolioHeroCinematicReveal = dynamic(() =>
  import('@/components/portfolio/hero-variants/PortfolioHeroCinematicReveal').then((m) => m.PortfolioHeroCinematicReveal)
);
const PortfolioHeroPortraitIdentity = dynamic(() =>
  import('@/components/portfolio/hero-variants/PortfolioHeroPortraitIdentity').then((m) => m.PortfolioHeroPortraitIdentity)
);
const PortfolioHeroEditorialRail = dynamic(() =>
  import('@/components/portfolio/hero-variants/PortfolioHeroEditorialRail').then((m) => m.PortfolioHeroEditorialRail)
);
const PortfolioHeroStatementCta = dynamic(() =>
  import('@/components/portfolio/hero-variants/PortfolioHeroStatementCta').then((m) => m.PortfolioHeroStatementCta)
);
const PortfolioHeroPortraitBalance = dynamic(() =>
  import('@/components/portfolio/hero-variants/PortfolioHeroPortraitBalance').then((m) => m.PortfolioHeroPortraitBalance)
);
const PortfolioHeroLeftPortrait = dynamic(() =>
  import('@/components/portfolio/hero-variants/PortfolioHeroLeftPortrait').then((m) => m.PortfolioHeroLeftPortrait)
);
const PortfolioHeroCirclePortrait = dynamic(() =>
  import('@/components/portfolio/hero-variants/PortfolioHeroCirclePortrait').then((m) => m.PortfolioHeroCirclePortrait)
);
const PortfolioHeroExperienceSplit = dynamic(() =>
  import('@/components/portfolio/hero-variants/PortfolioHeroExperienceSplit').then((m) => m.PortfolioHeroExperienceSplit)
);
const PortfolioHeroEditorialOverlap = dynamic(() =>
  import('@/components/portfolio/hero-variants/PortfolioHeroEditorialOverlap').then((m) => m.PortfolioHeroEditorialOverlap)
);
const PortfolioHeroSelectedWorks = dynamic(() =>
  import('@/components/portfolio/hero-variants/PortfolioHeroSelectedWorks').then((m) => m.PortfolioHeroSelectedWorks)
);
const PortfolioHeroIdentityIndex = dynamic(() =>
  import('@/components/portfolio/hero-variants/PortfolioHeroIdentityIndex').then((m) => m.PortfolioHeroIdentityIndex)
);
const PortfolioHeroStudioSplit = dynamic(() =>
  import('@/components/portfolio/hero-variants/PortfolioHeroStudioSplit').then((m) => m.PortfolioHeroStudioSplit)
);
const PortfolioHeroWorkDuo = dynamic(() =>
  import('@/components/portfolio/hero-variants/PortfolioHeroWorkDuo').then((m) => m.PortfolioHeroWorkDuo)
);
const PortfolioHeroBowlIntro = dynamic(() =>
  import('@/components/portfolio/hero-variants/PortfolioHeroBowlIntro').then((m) => m.PortfolioHeroBowlIntro)
);

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

  if (design === 'cinematic-reveal') {
    return shell(<PortfolioHeroCinematicReveal data={heroDataForVariant} />);
  }
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
