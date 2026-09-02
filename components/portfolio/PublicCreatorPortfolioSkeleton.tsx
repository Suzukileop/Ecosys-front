import type { PortfolioHeroBannerDesign } from '@/components/portfolio/portfolio-hero-banner-settings';
import { DEFAULT_PORTFOLIO_HERO_BANNER_DESIGN } from '@/components/portfolio/portfolio-hero-banner-settings';
import { PortfolioHeroBannerSkeleton } from '@/components/portfolio/portfolio-hero-banner-skeletons';

function Bone({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-neutral-200 ${className}`.trim()} />;
}

function WorkSectionSkeleton() {
  return (
    <div className="space-y-10 pt-16 sm:pt-20">
      <div className="space-y-3">
        <Bone className="h-3 w-24" />
        <Bone className="h-8 w-48" />
        <Bone className="h-4 w-full max-w-md" />
      </div>
      <div className="flex flex-col gap-10">
        {Array.from({ length: 2 }).map((_, index) => (
          <div
            key={index}
            className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center"
          >
            <Bone className="aspect-[16/10] w-full rounded-2xl" />
            <div className="space-y-4">
              <Bone className="h-3 w-20" />
              <Bone className="h-8 w-3/4" />
              <Bone className="h-4 w-full" />
              <Bone className="h-4 w-5/6" />
              <div className="flex gap-2.5 pt-2">
                {Array.from({ length: 3 }).map((__, toolIndex) => (
                  <Bone key={toolIndex} className="h-10 w-10 rounded-full" />
                ))}
              </div>
              <Bone className="mt-2 h-11 w-36 rounded-full bg-neutral-300" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PublicCreatorPortfolioSkeleton({
  heroBannerDesign = DEFAULT_PORTFOLIO_HERO_BANNER_DESIGN,
}: {
  heroBannerDesign?: PortfolioHeroBannerDesign;
}) {
  return (
    <div className="min-h-screen bg-white" aria-busy="true" aria-label="Loading portfolio">
      <PortfolioHeroBannerSkeleton design={heroBannerDesign} />

      <main className="mx-auto w-full px-5 pb-16 sm:px-10 sm:pb-20 md:px-16 lg:px-20 xl:px-40 2xl:px-48">
        <WorkSectionSkeleton />
      </main>
    </div>
  );
}
