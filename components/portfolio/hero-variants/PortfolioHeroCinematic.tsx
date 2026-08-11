'use client';

import type { PortfolioHeroData } from '@/components/portfolio/portfolio-hero-types';
import {
  HeroAvailabilityBadge,
  HeroCtas,
  HeroSpecialite,
  HeroPortrait,
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

function CinematicAvailabilitySlot({
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

export function PortfolioHeroCinematic({ data }: { data: PortfolioHeroData }) {
  const profile = data.motionProfile ?? 'none';
  return (
    <div
      className={`${motionProfileHeroEnterClass(profile)} overflow-hidden border border-neutral-200 dark:border-neutral-800 xl:grid xl:grid-cols-[42%_58%]`.trim()}
    >
      <div
        className={`${motionProfileHeroImageEnterClass(profile)} relative min-h-[280px] lg:min-h-[520px]`.trim()}
      >
        <HeroPortrait
          fullName={data.fullName}
          avatarUrl={data.avatarUrl}
          className="absolute inset-0 h-full w-full object-cover"
          wrapperClass="h-full w-full"
          profile={data.presentation}
          isAvailable={data.isAvailable}
          responseTimeLabel={data.responseTimeLabel}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-black/20" />
        {data.stats.length > 0 ? (
          <div className="absolute bottom-0 left-0 right-0 flex gap-6 border-t border-white/10 bg-black/40 px-6 py-4 backdrop-blur-sm xl:hidden">
            {data.stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-xl font-bold text-white">{stat.value}</p>
                <p className="text-[9px] font-bold uppercase tracking-wider text-white/60">{stat.label}</p>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div className="flex flex-col justify-center bg-neutral-950 px-6 py-10 text-white sm:px-10 lg:px-12 lg:py-14">
        <CinematicAvailabilitySlot data={data} slot="top-left" />
        <CinematicAvailabilitySlot data={data} slot="top-center" />
        <CinematicAvailabilitySlot data={data} slot="top-right" />
        <CinematicAvailabilitySlot data={data} slot="above-headline" />

        <HeroTitle
          fullName={data.fullName}
          nameLead={data.nameLead}
          nameAccent={data.nameAccent}
          isVerified={data.isVerified}
          accentClass="text-orange-400"
          sizeClass="text-4xl sm:text-5xl lg:text-[3.25rem]"
          darkSurface
        />

        <CinematicAvailabilitySlot data={data} slot="below-headline" />

        <HeroSpecialite specialite={data.specialite} darkSurface />

        <p className="mt-5 max-w-lg text-base leading-relaxed text-neutral-300 sm:text-lg">
          {data.description}
        </p>

        <CinematicAvailabilitySlot data={data} slot="below-description" />
        <CinematicAvailabilitySlot data={data} slot="above-tools" />

        <div className="mt-8">
          <HeroCtas
            creatorId={data.creatorId}
            fullName={data.fullName}
            showWorkCta={data.showWorkCta}
            showContactCta={data.showContactCta}
            contactHref={data.contactHref}
            workHref={data.workHref}
            onNavigateSection={data.onNavigateSection}
            primaryClass="inline-flex items-center gap-2 bg-orange-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-orange-400"
            secondaryClass="inline-flex items-center gap-2 border border-white/25 bg-white/5 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10"
          />
        </div>

        <CinematicAvailabilitySlot data={data} slot="below-tools" />

        {data.stats.length > 0 ? (
          <div className="mt-10 hidden xl:block">
            <HeroStatsRow
              stats={data.stats}
              valueClass="text-white"
              labelClass="text-white/60"
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
