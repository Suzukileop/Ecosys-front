const block = 'animate-pulse rounded bg-neutral-200 dark:bg-neutral-700';

function SkeletonLine({ className = '' }: { className?: string }) {
  return <div className={`${block} ${className}`} aria-hidden />;
}

function HomeNewsPostCardSkeleton({ split = false }: { split?: boolean }) {
  if (split) {
    return (
      <div className="flex h-full min-h-0 w-full items-center justify-center">
        <div className="mx-auto flex h-full min-h-0 w-full max-w-[min(100%,88rem)] flex-col gap-4 px-1 sm:px-2 lg:flex-row lg:items-stretch lg:gap-5">
          <article className="flex min-h-0 w-full shrink-0 flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900 lg:h-full lg:w-[calc((100%-1.5rem)/2)] lg:max-w-[calc((100%-1.5rem)/2)]">
            <div className="shrink-0 p-4">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 shrink-0 rounded-full ${block}`} />
                <div className="min-w-0 flex-1 space-y-2">
                  <SkeletonLine className="h-4 w-36" />
                  <SkeletonLine className="h-3 w-24" />
                </div>
              </div>
            </div>
            <div className={`relative mx-4 mb-2 min-h-[min(60vw,20rem)] flex-1 rounded-xl lg:min-h-0 ${block}`} />
            <div className="shrink-0 border-t border-neutral-200 p-4 dark:border-neutral-800">
              <div className="flex items-center gap-3">
                <SkeletonLine className="h-8 w-14 rounded-lg" />
                <SkeletonLine className="h-8 w-14 rounded-lg" />
                <SkeletonLine className="ml-auto h-4 w-20" />
              </div>
            </div>
          </article>
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900 lg:h-full">
            <div className="min-h-0 flex-1 space-y-4 p-5">
              <SkeletonLine className="h-7 w-2/3 max-w-xs" />
              <SkeletonLine className="h-3 w-20" />
              <SkeletonLine className="h-4 w-full" />
              <SkeletonLine className="h-4 w-5/6" />
            </div>
            <div className="mt-auto shrink-0 p-4">
              <SkeletonLine className="h-11 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 w-full items-center justify-center">
      <article className="flex min-h-0 w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900 lg:h-full">
        <div className="shrink-0 space-y-3 p-4">
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 shrink-0 rounded-full ${block}`} />
            <div className="min-w-0 flex-1 space-y-2">
              <SkeletonLine className="h-4 w-36" />
              <SkeletonLine className="h-3 w-24" />
            </div>
          </div>
          <SkeletonLine className="h-6 w-2/3 max-w-xs" />
          <SkeletonLine className="h-3 w-20" />
        </div>

        <div className={`relative mx-4 mb-2 min-h-[min(60vw,20rem)] flex-1 rounded-xl lg:min-h-0 ${block}`} />

        <div className="shrink-0 border-t border-neutral-200 p-4 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <SkeletonLine className="h-8 w-14 rounded-lg" />
            <SkeletonLine className="h-8 w-14 rounded-lg" />
            <SkeletonLine className="h-8 w-14 rounded-lg" />
            <SkeletonLine className="ml-auto h-4 w-20" />
          </div>
        </div>
      </article>
    </div>
  );
}

export function HomeNewsHeaderSkeleton({ split = false }: { split?: boolean }) {
  const alignShell = split
    ? 'mx-auto w-full max-w-[min(100%,88rem)] px-1 sm:px-2'
    : 'mx-auto w-full max-w-xl xl:max-w-2xl';

  return (
    <div className={`${alignShell} py-1`} aria-hidden>
      <div className="inline-flex max-w-full flex-col items-start gap-3 rounded-2xl border border-neutral-200/70 bg-white/90 px-4 py-2.5 shadow-sm dark:border-neutral-800/70 dark:bg-neutral-950/90 sm:flex-row sm:items-center sm:gap-4 sm:px-5">
        <SkeletonLine className="h-5 w-44 max-w-full" />
        <SkeletonLine className="h-9 w-36 rounded-full" />
      </div>
    </div>
  );
}

export function HomeNewsFeedSkeleton({
  count = 2,
  split = false,
}: {
  count?: number;
  split?: boolean;
}) {
  return (
    <div className="snap-y snap-proximity" aria-busy="true" aria-label="Chargement des actualités">
      {Array.from({ length: count }, (_, index) => (
        <section
          key={index}
          className="flex min-h-0 snap-center snap-always scroll-mt-6 items-center justify-center pb-10 pt-2"
        >
          <HomeNewsPostCardSkeleton split={split} />
        </section>
      ))}
    </div>
  );
}

export function HomeNewsPageSkeleton() {
  return (
    <>
      <HomeNewsHeaderSkeleton />
      <HomeNewsFeedSkeleton />
    </>
  );
}
