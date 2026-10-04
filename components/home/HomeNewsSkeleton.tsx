import { PORTFOLIO_FRAME_CLASS } from '@/components/portfolio/portfolioFrame';

const block = 'animate-pulse rounded bg-black/[0.06] dark:bg-white/[0.08]';

function SkeletonLine({ className = '' }: { className?: string }) {
  return <div className={`${block} ${className}`} aria-hidden />;
}

function HomeNewsPostCardSkeleton() {
  return (
    <article className="overflow-hidden border border-black/[0.06] md:rounded-lg bg-[#EEF0F2] dark:border-white/[0.08] dark:bg-[#111111]">
      <div className="flex items-center gap-3.5 px-6 pt-6 sm:px-7 sm:pt-7">
        <div className={`h-11 w-11 shrink-0 rounded-full ${block}`} />
        <div className="min-w-0 flex-1 space-y-2">
          <SkeletonLine className="h-4 w-40" />
          <SkeletonLine className="h-3.5 w-28" />
        </div>
      </div>
      <div className="space-y-3 px-6 pt-5 sm:px-7">
        <SkeletonLine className="h-6 w-20 rounded-full" />
        <SkeletonLine className="h-6 w-2/3" />
        <SkeletonLine className="h-4 w-full" />
      </div>
      <div className={`mt-6 aspect-[4/3] w-full rounded-none ${block}`} />
      <div className="mt-6 flex items-center gap-6 border-t border-black/[0.06] px-6 py-4 dark:border-white/[0.08] sm:px-7">
        <SkeletonLine className="h-5 w-16" />
        <SkeletonLine className="h-5 w-24" />
        <SkeletonLine className="ml-auto h-5 w-16" />
      </div>
    </article>
  );
}

export function HomeNewsFeedSkeleton({ count = 2 }: { count?: number; split?: boolean }) {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Loading news">
      {Array.from({ length: count }, (_, index) => (
        <HomeNewsPostCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function HomeNewsHeaderSkeleton() {
  return (
    <div
      aria-hidden
      className="border border-black/[0.06] bg-[#EEF0F2] dark:border-white/[0.08] dark:bg-[#111111] md:rounded-lg"
    >
      <div className="flex items-center gap-3.5 px-5 pt-5 sm:px-6">
        <SkeletonLine className="h-11 w-11 shrink-0 !rounded-full" />
        <SkeletonLine className="h-11 flex-1 !rounded-full" />
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-black/[0.06] px-4 py-2.5 dark:border-white/[0.08]">
        <SkeletonLine className="h-6 w-56 max-w-[60%]" />
        <SkeletonLine className="h-9 w-24 !rounded-full" />
      </div>
    </div>
  );
}

export function HomeNewsPageSkeleton() {
  return (
    <div className={`${PORTFOLIO_FRAME_CLASS} pb-24 pt-8 sm:pt-12`}>
      <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_18rem] xl:gap-16">
        <div className="-mx-4 min-w-0 max-w-[760px] sm:-mx-8 md:mx-auto md:w-full">
          <HomeNewsHeaderSkeleton />
          <div className="mt-8">
            <HomeNewsFeedSkeleton />
          </div>
        </div>
        <div className="hidden space-y-5 lg:block" aria-hidden>
          <SkeletonLine className="h-[4.5rem] w-full rounded-lg" />
          <SkeletonLine className="h-[34rem] w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
