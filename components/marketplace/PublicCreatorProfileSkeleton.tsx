import { PORTFOLIO_FRAME_CLASS } from '@/components/portfolio/portfolioFrame';

const block = 'animate-pulse rounded bg-neutral-200 dark:bg-neutral-700';
const hairline = 'border-black/[0.06] dark:border-white/[0.06]';

function SkeletonLine({ className = '' }: { className?: string }) {
  return <div className={`${block} ${className}`} aria-hidden />;
}

/** Mirrors the creator header card used on public profile pages. */
function PublicCreatorProfileHeaderSkeleton() {
  return (
    <div
      className={`flex flex-col items-stretch gap-8 rounded-lg border bg-white p-6 dark:bg-[#111111] sm:flex-row sm:gap-10 sm:p-10 md:gap-12 ${hairline}`}
      aria-hidden
    >
      <div className="flex w-36 shrink-0 items-center self-center sm:w-44 md:w-52 lg:w-56">
        <div className={`aspect-square w-full rounded-full ${block}`} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center gap-6">
        <SkeletonLine className="h-10 w-64 max-w-full" />
        <SkeletonLine className="h-5 w-48 max-w-full" />
        <div className="space-y-2.5">
          <SkeletonLine className="h-4 w-full max-w-xl" />
          <SkeletonLine className="h-4 w-3/4 max-w-md" />
        </div>
        <div className="flex min-w-0 flex-wrap gap-2 pt-2">
          <SkeletonLine className="h-11 w-32 rounded-lg" />
          <SkeletonLine className="h-11 w-28 rounded-lg" />
          <SkeletonLine className="h-11 w-24 rounded-lg" />
        </div>
      </div>

      <div className={`flex shrink-0 flex-row border-t pt-4 sm:w-36 sm:flex-col sm:border-l sm:border-t-0 sm:pl-8 sm:pt-0 md:w-40 ${hairline}`}>
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="flex flex-1 flex-col items-center justify-center gap-2 py-4">
            <SkeletonLine className="h-8 w-12" />
            <SkeletonLine className="h-3.5 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

function PublicCreatorProfileTabsSkeleton() {
  return (
    <div className={`mt-14 flex items-end gap-8 border-b pb-4 sm:mt-16 sm:gap-10 ${hairline}`} aria-hidden>
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className={`h-5 w-16 shrink-0 ${block}`} />
      ))}
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
      <div className={`aspect-[4/5] w-full max-w-md rounded-xl ${block}`} />
    </div>
  );
}

export function PublicCreatorProfileInfoTabSkeleton() {
  return (
    <div className="min-w-0" aria-busy="true" aria-label="Chargement des informations">
      <div className="flex flex-col divide-y divide-black/[0.06] dark:divide-white/[0.06]">
        <div className="space-y-8 pb-14 sm:pb-16">
          <SkeletonLine className="h-7 w-28" />
          <div className={`h-56 rounded-xl sm:h-72 ${block}`} />
          <div className="grid gap-x-10 gap-y-8 sm:grid-cols-3">
            {Array.from({ length: 3 }, (_, index) => (
              <div key={index} className={`space-y-2.5 border-t pt-5 ${hairline}`}>
                <SkeletonLine className="h-3.5 w-20" />
                <SkeletonLine className="h-5 w-32 max-w-full" />
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-6 py-14 sm:py-16">
          <SkeletonLine className="h-7 w-36" />
          <SkeletonLine className="h-5 w-56 max-w-full" />
          <SkeletonLine className="h-4 w-full max-w-2xl" />
          <SkeletonLine className="h-4 w-2/3 max-w-xl" />
        </div>
      </div>
    </div>
  );
}

export function PublicCreatorProfileSkeleton() {
  return (
    <div
      className={`${PORTFOLIO_FRAME_CLASS} min-w-0 overflow-x-hidden pb-24 pt-6 sm:pt-10`}
      aria-busy="true"
      aria-label="Chargement du profil créateur"
    >
      <PublicCreatorProfileHeaderSkeleton />

      <PublicCreatorProfileTabsSkeleton />

      <div className="min-w-0 pt-12 sm:pt-16">
        <PublicCreatorProfileInfoTabSkeleton />
      </div>
    </div>
  );
}
