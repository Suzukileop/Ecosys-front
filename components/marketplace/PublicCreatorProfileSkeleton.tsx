const block = 'animate-pulse rounded bg-neutral-200 dark:bg-neutral-700';

function SkeletonLine({ className = '' }: { className?: string }) {
  return <div className={`${block} ${className}`} aria-hidden />;
}

/** Mirrors the split-card creator header used on public profile pages. */
function PublicCreatorProfileHeaderSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <div className="grid min-w-0 md:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-4 p-5 sm:p-6">
          <div className="flex min-w-0 items-start gap-4">
            <div className={`h-20 w-20 shrink-0 rounded-2xl sm:h-24 sm:w-24 ${block}`} />
            <div className="min-w-0 flex-1 space-y-2 pt-1">
              <SkeletonLine className="h-7 w-40 max-w-full" />
              <SkeletonLine className="h-4 w-28 max-w-full" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            {Array.from({ length: 3 }, (_, index) => (
              <div key={index} className="min-w-0 space-y-2">
                <SkeletonLine className="h-6 w-8" />
                <SkeletonLine className="h-3 w-14 max-w-full" />
              </div>
            ))}
          </div>

          <SkeletonLine className="h-4 w-full max-w-md" />
          <SkeletonLine className="h-4 w-32 max-w-full" />

          <div className="flex min-w-0 flex-wrap gap-2">
            <SkeletonLine className="h-10 w-32 rounded-full" />
            <SkeletonLine className="h-10 w-24 rounded-full" />
            <SkeletonLine className="h-10 w-44 rounded-full" />
          </div>
        </div>

        <div className={`min-h-[220px] w-full min-w-0 md:min-h-[280px] ${block} rounded-none`} />
      </div>
    </div>
  );
}

export function CreatorTrustMetricsRowSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`grid min-w-0 gap-3 md:grid-cols-3 ${className}`} aria-hidden>
      {Array.from({ length: 3 }, (_, index) => (
        <div
          key={index}
          className="min-h-[5.5rem] min-w-0 rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div className={`h-3 w-24 max-w-full ${block}`} />
          <div className={`mt-4 h-7 w-20 max-w-full ${block}`} />
          <div className={`mt-2 h-3 w-28 max-w-full ${block}`} />
        </div>
      ))}
    </div>
  );
}

function PublicCreatorProfileTabsSkeleton() {
  return (
    <div
      className="mt-4 flex items-end justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800"
      aria-hidden
    >
      <nav className="flex min-w-0 flex-1 gap-1 overflow-x-auto">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="shrink-0 px-4 py-3">
            <div className={`h-4 w-16 ${block}`} />
          </div>
        ))}
      </nav>
      <div className={`mb-3 h-4 w-28 shrink-0 ${block}`} />
    </div>
  );
}

export function PublicCreatorProfileContentTabSkeleton() {
  return (
    <div className="min-w-0 space-y-6" aria-busy="true" aria-label="Chargement du contenu">
      <div className="space-y-2">
        <div className={`h-6 w-28 max-w-full ${block}`} />
        <div className={`h-4 w-72 max-w-full ${block}`} />
      </div>
      <div className={`aspect-[4/5] w-full max-w-md rounded-2xl ${block}`} />
    </div>
  );
}

export function PublicCreatorProfileInfoTabSkeleton() {
  return (
    <div className="min-w-0 space-y-4" aria-busy="true" aria-label="Chargement des informations">
      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900/80">
        <div className="space-y-4 border-b border-neutral-200 px-5 py-5 sm:px-6 sm:py-6 dark:border-neutral-800">
          <SkeletonLine className="h-3 w-20" />
          <div className={`min-h-[8rem] rounded-2xl ${block}`} />
        </div>
        <div className="space-y-4 border-b border-neutral-200 px-5 py-5 sm:px-6 sm:py-6 dark:border-neutral-800">
          <SkeletonLine className="h-3 w-24" />
          <div className={`min-h-[8rem] rounded-2xl ${block}`} />
        </div>
        <div className="space-y-4 px-5 py-5 sm:px-6 sm:py-6">
          <SkeletonLine className="h-3 w-16" />
          <div className="grid gap-3 lg:grid-cols-5">
            <div className={`min-h-[11rem] rounded-2xl lg:col-span-2 ${block}`} />
            <div className={`min-h-[11rem] rounded-2xl lg:col-span-3 ${block}`} />
          </div>
        </div>
        <div className="space-y-3 border-t border-neutral-200 px-5 py-5 sm:px-6 sm:py-6 dark:border-neutral-800">
          <SkeletonLine className="h-3 w-24" />
          <div className="grid gap-3 sm:grid-cols-2">
            <div className={`min-h-[6.5rem] rounded-2xl ${block}`} />
            <div className={`min-h-[6.5rem] rounded-2xl ${block}`} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className={`min-h-[4.5rem] rounded-2xl ${block}`} />
            <div className={`min-h-[4.5rem] rounded-2xl ${block}`} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function PublicCreatorProfileSkeleton() {
  return (
    <div className="mx-auto w-full min-w-0 max-w-[1280px] overflow-x-hidden" aria-busy="true" aria-label="Chargement du profil créateur">
      <div className="px-4 sm:px-6">
        <PublicCreatorProfileHeaderSkeleton />
        <div className="mt-4">
          <CreatorTrustMetricsRowSkeleton />
        </div>
      </div>

      <div className="px-4 sm:px-6">
        <PublicCreatorProfileTabsSkeleton />
      </div>

      <div className="min-w-0 px-4 py-8 sm:px-6">
        <PublicCreatorProfileInfoTabSkeleton />
      </div>
    </div>
  );
}
