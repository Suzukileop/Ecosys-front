import { PORTFOLIO_FRAME_CLASS } from '@/components/portfolio/portfolioFrame';

const block = 'animate-pulse rounded bg-[#EFF3F4] dark:bg-[#202327]';

function SkeletonLine({ className = '' }: { className?: string }) {
  return <div className={`${block} ${className}`} aria-hidden />;
}

/** Phones: the centred compact hero of `MobileProfileHeader` (avatar, name, stats, status, bio, actions). */
function MobileHeaderSkeleton() {
  return (
    <div className="flex flex-col items-center sm:hidden" aria-hidden>
      <div className={`h-[104px] w-[104px] rounded-full ${block}`} />
      <SkeletonLine className="mt-3.5 h-6 w-48" />
      <SkeletonLine className="mt-1.5 h-4 w-32" />
      <SkeletonLine className="mt-3 h-4 w-44" />
      <SkeletonLine className="mt-2 h-3.5 w-52" />
      <div className="mt-3 flex w-full max-w-[22rem] flex-col items-center gap-2">
        <SkeletonLine className="h-3.5 w-full" />
        <SkeletonLine className="h-3.5 w-3/4" />
      </div>
      <div className="mt-5 flex w-full items-stretch gap-2">
        <SkeletonLine className="h-10 flex-1 !rounded-full" />
        <SkeletonLine className="h-10 flex-1 !rounded-full" />
        <SkeletonLine className="h-10 w-10 shrink-0 !rounded-full" />
      </div>
    </div>
  );
}

/** The three stat drawers (subscribers, stars, location): a row below lg, a stacked column from lg. */
function StatsSkeleton() {
  return (
    <div
      className="grid grid-cols-3 divide-x divide-[#CFD9DE] dark:divide-[#2F3336] lg:grid-cols-1 lg:divide-x-0 lg:divide-y [&>div]:px-3 first:[&>div]:pl-0 lg:[&>div]:px-0"
      aria-hidden
    >
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index} className="flex min-w-0 flex-col justify-center gap-2 py-3 lg:py-4">
          <SkeletonLine className={`h-6 ${index === 2 ? 'w-32' : 'w-10'} max-w-full`} />
          <SkeletonLine className="h-3.5 w-20 max-w-full" />
        </div>
      ))}
    </div>
  );
}

/** From sm: the `HorizontalProfileHeader` grid — avatar, identity, and from lg the 20rem stats column. */
function DesktopHeaderSkeleton() {
  return (
    <div
      className="hidden grid-cols-[12rem_minmax(0,1fr)] items-center gap-x-8 gap-y-4 sm:grid md:grid-cols-[14rem_minmax(0,1fr)] md:gap-x-10 lg:grid-cols-[14rem_minmax(0,1fr)_20rem] lg:gap-x-8 xl:gap-x-12"
      aria-hidden
    >
      <div className="col-start-1 row-span-2 row-start-1 self-center">
        <div className={`aspect-square w-full rounded-full ${block}`} />
      </div>

      <div className="col-start-2 row-start-1 min-w-0 self-end">
        <SkeletonLine className="h-8 w-80 max-w-full md:h-[38px]" />
      </div>

      <div className="col-start-2 row-start-2 mt-3 flex min-w-0 flex-col gap-3 self-start">
        <SkeletonLine className="h-4 w-36" />
        <SkeletonLine className="h-5 w-48 max-w-full" />
        <div className="max-w-2xl space-y-2">
          <SkeletonLine className="h-4 w-full" />
          <SkeletonLine className="h-4 w-3/4" />
        </div>
        <div className="lg:hidden">
          <StatsSkeleton />
        </div>
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <SkeletonLine className="h-12 w-36 !rounded-none" />
          <SkeletonLine className="h-11 w-36" />
        </div>
      </div>

      <div className="hidden lg:col-start-3 lg:row-span-2 lg:row-start-1 lg:block lg:self-center">
        <StatsSkeleton />
      </div>
    </div>
  );
}

function TabsSkeleton() {
  return (
    <div className="mt-4 flex min-h-11 items-center gap-7 px-4 sm:mt-8 sm:gap-10 sm:px-0" aria-hidden>
      <SkeletonLine className="h-5 w-20" />
      <SkeletonLine className="h-5 w-10" />
      <SkeletonLine className="h-5 w-16" />
      <SkeletonLine className="h-5 w-[4.5rem]" />
    </div>
  );
}

/** One `ServiceCard`: cover on the left (on top on phones), specialty, title, description, price row. */
function ServiceCardSkeleton() {
  return (
    <div
      className="flex w-full flex-col overflow-hidden bg-[#F7F9F9] dark:bg-[#16181C] max-sm:-mx-4 max-sm:w-[calc(100%+2rem)] sm:flex-row"
      aria-hidden
    >
      <div className="aspect-[16/9] w-full shrink-0 animate-pulse bg-[#EFF3F4] dark:bg-[#202327] sm:aspect-auto sm:min-h-[15rem] sm:w-60 md:w-64" />
      <div className="flex min-w-0 flex-1 flex-col p-5 sm:px-8 sm:py-7">
        <SkeletonLine className="h-3.5 w-16" />
        <SkeletonLine className="mt-2.5 h-5 w-40 max-w-full" />
        <div className="mt-3.5 space-y-2.5">
          <SkeletonLine className="h-4 w-full" />
          <SkeletonLine className="h-4 w-11/12" />
          <SkeletonLine className="h-4 w-2/3" />
        </div>
        <div className="mt-auto flex items-center justify-between gap-4 pt-6">
          <SkeletonLine className="h-5 w-32" />
          <SkeletonLine className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
}

function ServicesTabSkeleton() {
  return (
    <div className="space-y-4 px-4 sm:space-y-6 sm:px-0" aria-hidden>
      <div className="space-y-2 max-sm:hidden">
        <SkeletonLine className="h-6 w-28" />
        <SkeletonLine className="h-4 w-44" />
      </div>
      <div className="flex flex-col gap-2 sm:gap-4">
        <ServiceCardSkeleton />
        <ServiceCardSkeleton />
      </div>
    </div>
  );
}

/** The lg right rail (`CreatorProfileContactRail`): "Contact" then "Links", icon + label rows. */
function ContactRailSkeleton() {
  const rows = (count: number, widths: string[]) =>
    Array.from({ length: count }, (_, index) => (
      <div key={index} className="flex min-h-10 items-center gap-3 px-3 py-2">
        <SkeletonLine className="h-[17px] w-[17px] shrink-0" />
        <SkeletonLine className={`h-4 ${widths[index % widths.length]}`} />
      </div>
    ));

  return (
    <div className="gn-rail-edge hidden self-stretch pb-8 pl-5 pt-8 lg:block" aria-hidden>
      <div className="flex flex-col gap-6">
        <div>
          <SkeletonLine className="mx-3 mb-3 h-3 w-16" />
          <div className="flex flex-col gap-0.5">{rows(2, ['w-44', 'w-32'])}</div>
        </div>
        <div>
          <SkeletonLine className="mx-3 mb-3 h-3 w-12" />
          <div className="flex flex-col gap-0.5">{rows(4, ['w-16', 'w-20', 'w-[4.5rem]', 'w-14'])}</div>
        </div>
      </div>
    </div>
  );
}

export function PublicCreatorProfileContentTabSkeleton() {
  return (
    <div className="min-w-0 space-y-8" aria-busy="true" aria-label="Chargement du contenu">
      <div className="space-y-3">
        <div className={`h-7 w-32 max-w-full ${block}`} />
        <div className={`h-4 w-72 max-w-full ${block}`} />
      </div>
      <div className={`aspect-[4/5] w-full max-w-md !rounded-none ${block}`} />
    </div>
  );
}

/** Mirrors `PublicCreatorProfileShell`: same frame, header, tabs, Services tab and contact rail. */
export function PublicCreatorProfileSkeleton() {
  return (
    <div
      className={`providers-x news-theme news-feed news-mono ${PORTFOLIO_FRAME_CLASS} !max-w-[1368px] min-w-0 overflow-x-hidden pb-24 pt-0 max-sm:px-0`}
      aria-busy="true"
      aria-label="Chargement du profil créateur"
    >
      <div className="gn-rail-under px-5 pb-6 pt-5 sm:px-0 sm:pb-10 sm:pt-6">
        <MobileHeaderSkeleton />
        <DesktopHeaderSkeleton />
      </div>

      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-8 xl:gap-12">
        <div className="min-w-0">
          <TabsSkeleton />
          <div className="pt-5 sm:pt-8">
            <ServicesTabSkeleton />
          </div>
        </div>
        <ContactRailSkeleton />
      </div>
    </div>
  );
}
