import type { ReactNode } from 'react';

/*
 * Loading states of the Providers directory, drawn on its exact layout (CreatorsCatalog / CreatorCard /
 * ProviderDiscoverRail): the same frame and gutters, the "■ N providers · Sort by" section line, the
 * filled provider cards, and from lg the rail — search pill, the Specialty box, the Refine box.
 * Bones use the field tone (#EFF3F4 / #202327), the tone avatars and chips already sit on.
 */

const bone = 'animate-pulse rounded bg-[#EFF3F4] dark:bg-[#202327]';

function Bone({ className = '' }: { className?: string }) {
  return <div aria-hidden className={`${bone} ${className}`} />;
}

/** One provider card: avatar · name · subtitle · rate, then meta, two bio lines, skills · actions. */
export function ProviderCardSkeleton() {
  return (
    <div aria-hidden className="flex flex-col bg-[#F7F9F9] px-5 py-5 dark:bg-[#16181C] sm:p-6">
      <div className="flex min-w-0 items-center gap-3 sm:items-start sm:gap-4">
        <div className={`h-11 w-11 shrink-0 !rounded-full sm:h-14 sm:w-14 ${bone}`} />
        <div className="min-w-0 flex-1 space-y-2 sm:pt-1">
          <Bone className="h-4 w-40 max-w-full" />
          <Bone className="h-3.5 w-56 max-w-full" />
        </div>
        <Bone className="hidden h-4 w-20 sm:block" />
      </div>

      <div className="min-w-0 sm:pl-[72px]">
        <Bone className="mt-4 h-3 w-36 sm:mt-3" />
        <div className="mt-3 space-y-2">
          <Bone className="h-3.5 w-full" />
          <Bone className="h-3.5 w-3/4" />
        </div>
        {/* sm+: skill chips left, Portfolio + Discuss right. */}
        <div className="mt-5 hidden items-center justify-between gap-4 sm:flex">
          <div className="flex gap-1.5">
            <Bone className="h-6 w-16 !rounded-full" />
            <Bone className="h-6 w-14 !rounded-full" />
            <Bone className="h-6 w-20 !rounded-full" />
          </div>
          <div className="flex items-center gap-2">
            <Bone className="h-4 w-16" />
            <Bone className="h-9 w-24 !rounded-full" />
          </div>
        </div>
        {/* Phones: rate left, actions right. */}
        <div className="mt-4 flex items-center justify-between gap-3 sm:hidden">
          <Bone className="h-4 w-20" />
          <Bone className="h-10 w-24 !rounded-full" />
        </div>
      </div>
    </div>
  );
}

/** The list alone (the page keeps its real header and rail while results load). */
export function ProviderCardListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-2 sm:gap-5" aria-busy="true" aria-label="Loading providers">
      {Array.from({ length: count }, (_, index) => (
        <ProviderCardSkeleton key={index} />
      ))}
    </div>
  );
}

/** A rail row of the Specialty / Refine boxes: 48px tall, 24px side padding. */
function RailRow({ children }: { children: ReactNode }) {
  return <div className="flex items-center gap-3 px-6 py-3.5">{children}</div>;
}

/** The whole page, for the first paint (route Suspense fallbacks). */
export function ProvidersCatalogSkeleton() {
  return (
    <div
      className="providers-x news-theme news-feed news-mono w-full pb-24 pt-2 sm:px-8 sm:pt-4 md:px-12 lg:px-16 lg:pt-3"
      aria-busy="true"
      aria-label="Loading providers"
    >
      <div className="mx-auto grid w-full max-w-[600px] items-start gap-8 lg:max-w-[1240px] lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-10 xl:grid-cols-[minmax(0,1fr)_400px] xl:gap-12">
        <div className="flex min-w-0 flex-col gap-3">
          {/* Below lg: search + Filters button, then the specialty chips. */}
          <div className="flex items-center gap-2 px-5 pt-1 sm:px-0 lg:hidden">
            <Bone className="h-11 flex-1 !rounded-full" />
            <Bone className="h-11 w-11 shrink-0 !rounded-full" />
          </div>
          <div className="flex gap-2 overflow-hidden px-5 sm:px-0 lg:hidden">
            {['w-12', 'w-24', 'w-20', 'w-24', 'w-28'].map((width, index) => (
              <Bone key={index} className={`h-9 shrink-0 !rounded-full ${width}`} />
            ))}
          </div>

          {/* "■ N providers" · "Sort by Recommended". */}
          <div className="flex min-h-8 items-center justify-between gap-4 px-5 pt-3 sm:px-1 lg:pt-0">
            <div className="flex items-center gap-2.5">
              <Bone className="h-1.5 w-1.5 !rounded-none" />
              <Bone className="h-3 w-24" />
            </div>
            <Bone className="h-3 w-32" />
          </div>

          <ProviderCardListSkeleton />
        </div>

        {/* The rail (lg+): search pill, Specialty box, Refine box. */}
        <div className="hidden min-w-0 flex-col gap-6 lg:flex">
          <Bone className="h-11 w-full !rounded-full" />

          <div className="gn-rail-box flex flex-col px-px pb-2 pt-5">
            <Bone className="mx-6 mb-3 mt-1 h-5 w-28" />
            {Array.from({ length: 7 }, (_, index) => (
              <RailRow key={index}>
                <Bone className="h-5 w-5 shrink-0 !rounded-full" />
                <Bone className={`h-4 ${['w-10', 'w-24', 'w-16', 'w-24', 'w-24', 'w-14', 'w-20'][index]}`} />
              </RailRow>
            ))}
            <RailRow>
              <Bone className="h-4 w-28" />
            </RailRow>
          </div>

          <div className="gn-rail-box flex flex-col px-px pb-2 pt-5">
            <Bone className="mx-6 mb-3 mt-1 h-5 w-20" />
            {['w-28', 'w-32'].map((width, index) => (
              <RailRow key={index}>
                <Bone className={`h-4 ${width}`} />
                <Bone className="ml-auto h-6 w-10 !rounded-full" />
              </RailRow>
            ))}
            {['w-24', 'w-24'].map((width, index) => (
              <RailRow key={`select-${index}`}>
                <Bone className={`h-4 ${width}`} />
                <Bone className="ml-auto h-4 w-12" />
              </RailRow>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
