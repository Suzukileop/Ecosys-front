'use client';

import type { PortfolioHeroData } from '@/components/portfolio/portfolio-hero-types';
import {
  HeroAvailabilityBadge,
  HeroCtas,
  HeroSpecialite,
  HeroPortrait,
  HeroSideNav,
  HeroStatsRow,
  HeroTitle,
} from '@/components/portfolio/portfolio-hero-shared';
import {
  motionProfileHeroEnterClass,
  motionProfileHeroImageEnterClass,
} from '@/components/portfolio/portfolio-motion-settings';
import {
  availabilityPlacementJustifyClass,
  pickHeroAvailabilityBadgeProps,
  type PortfolioHeroAvailabilityPlacement,
} from '@/components/portfolio/portfolio-hero-settings';

function MinimalAvailabilitySlot({
  data,
  slot,
}: {
  data: PortfolioHeroData;
  slot: PortfolioHeroAvailabilityPlacement;
}) {
  if (!data.presentation.showAvailabilityBadge) return null;
  const desktop = data.presentation.availabilityPlacement;
  const mobile =
    data.presentation.mobileAvailabilityPlacement ?? data.presentation.availabilityPlacement;
  const onMobile = mobile === slot;
  const onDesktop = desktop === slot;
  if (!onMobile && !onDesktop) return null;

  const visibility =
    onMobile && onDesktop ? 'flex' : onMobile ? 'flex xl:hidden' : 'hidden xl:flex';
  const justify = availabilityPlacementJustifyClass(
    onDesktop ? desktop : mobile,
    data.presentation.mobileAvailabilityAlign,
    false,
    { desktopAlign: data.presentation.desktopAvailabilityAlign }
  );

  return (
    <div className={`mb-6 w-full ${visibility} ${justify}`}>
      <HeroAvailabilityBadge
        isAvailable={data.isAvailable}
        responseTimeLabel={data.responseTimeLabel}
        {...pickHeroAvailabilityBadgeProps(data.presentation)}
      />
    </div>
  );
}

export function PortfolioHeroMinimal({ data }: { data: PortfolioHeroData }) {
  const profile = data.motionProfile ?? 'none';
  return (
    <div className={`${motionProfileHeroEnterClass(profile)} xl:grid xl:grid-cols-[1fr_auto] xl:gap-16`.trim()}>
      <div className="mx-auto max-w-2xl text-center xl:mx-0 xl:max-w-none xl:text-left">
        <MinimalAvailabilitySlot data={data} slot="top-left" />
        <MinimalAvailabilitySlot data={data} slot="top-center" />
        <MinimalAvailabilitySlot data={data} slot="top-right" />
        <MinimalAvailabilitySlot data={data} slot="above-headline" />

        <div className={`${motionProfileHeroImageEnterClass(profile)} mx-auto mb-8 w-24 sm:w-28 xl:mx-0`.trim()}>
          <HeroPortrait
            fullName={data.fullName}
            avatarUrl={data.avatarUrl}
            className="aspect-square w-full object-cover"
            wrapperClass="w-full"
            profile={data.presentation}
            isAvailable={data.isAvailable}
            responseTimeLabel={data.responseTimeLabel}
          />
        </div>

        <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-neutral-400">
          Créateur · Portfolio
        </p>

        <div className="mt-3">
          <HeroTitle
            fullName={data.fullName}
            nameLead={data.nameLead}
            nameAccent={data.nameAccent}
            isVerified={data.isVerified}
            accentClass="text-orange-600 dark:text-orange-400"
            sizeClass="text-3xl sm:text-4xl xl:text-5xl"
          />
        </div>

        <MinimalAvailabilitySlot data={data} slot="below-headline" />

        <HeroSpecialite specialite={data.specialite} />

        <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-neutral-600 dark:text-neutral-300 xl:mx-0">
          {data.description}
        </p>

        <MinimalAvailabilitySlot data={data} slot="below-description" />
        <MinimalAvailabilitySlot data={data} slot="above-tools" />

        <div className="mt-8 flex justify-center xl:justify-start">
          <HeroCtas
            creatorId={data.creatorId}
            fullName={data.fullName}
            showWorkCta={data.showWorkCta}
            showContactCta={data.showContactCta}
            contactHref={data.contactHref}
            workHref={data.workHref}
            onNavigateSection={data.onNavigateSection}
          />
        </div>

        <MinimalAvailabilitySlot data={data} slot="below-tools" />

        <HeroStatsRow
          stats={data.stats}
          className="mx-auto mt-10 grid max-w-md grid-cols-3 gap-4 border-t border-neutral-200/80 pt-8 dark:border-neutral-800 xl:mx-0"
        />
      </div>

      <div className="mt-12 xl:mt-0 xl:pt-8">
        <HeroSideNav items={data.navItems} />
      </div>
    </div>
  );
}
