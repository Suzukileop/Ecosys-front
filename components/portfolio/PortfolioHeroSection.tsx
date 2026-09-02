'use client';

import type { ReactNode } from 'react';
import type { PortfolioHeroData } from '@/components/portfolio/portfolio-hero-types';
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
import { PortfolioHeroBottomFrame } from '@/components/portfolio/hero-variants/PortfolioHeroBottomFrame';
import { usePortfolioHeroGeomFade } from '@/components/portfolio/use-portfolio-hero-geom-fade';

export function PortfolioHeroSection(heroData: PortfolioHeroData) {
  const { sectionRef } = usePortfolioHeroGeomFade(heroData.geomFadeEnabled ?? false);
  const design = heroData.presentation.heroBannerDesign;

  const shell = (children: ReactNode) => (
    <section id="hero" ref={sectionRef} className="relative isolate overflow-x-clip">
      {children}
      <PortfolioHeroBottomFrame
        presentation={heroData.presentation}
        contentGutter={heroData.contentGutter}
        contentWidthClass={heroData.contentWidthClass}
      />
    </section>
  );

  if (design === 'portrait-identity') {
    return shell(<PortfolioHeroPortraitIdentity data={heroData} />);
  }
  if (design === 'editorial-rail') {
    return shell(<PortfolioHeroEditorialRail data={heroData} />);
  }
  if (design === 'statement-cta') {
    return shell(<PortfolioHeroStatementCta data={heroData} />);
  }
  if (design === 'portrait-balance') {
    return shell(<PortfolioHeroPortraitBalance data={heroData} />);
  }
  if (design === 'left-portrait') {
    return shell(<PortfolioHeroLeftPortrait data={heroData} />);
  }
  if (design === 'circle-portrait') {
    return shell(<PortfolioHeroCirclePortrait data={heroData} />);
  }
  if (design === 'experience-split') {
    return shell(<PortfolioHeroExperienceSplit data={heroData} />);
  }
  if (design === 'editorial-overlap') {
    return shell(<PortfolioHeroEditorialOverlap data={heroData} />);
  }
  if (design === 'selected-works') {
    return shell(<PortfolioHeroSelectedWorks data={heroData} />);
  }
  if (design === 'identity-index') {
    return shell(<PortfolioHeroIdentityIndex data={heroData} />);
  }
  if (design === 'studio-split') {
    return shell(<PortfolioHeroStudioSplit data={heroData} />);
  }
  if (design === 'work-duo') {
    return shell(<PortfolioHeroWorkDuo data={heroData} />);
  }
  if (design === 'bowl-intro') {
    return shell(<PortfolioHeroBowlIntro data={heroData} />);
  }

  // Default + legacy Classic → Swiss editorial (Classic permanently removed).
  return shell(<PortfolioHeroSwissEditorial data={heroData} />);
}
