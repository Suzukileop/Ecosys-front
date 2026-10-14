/*
 * Loading placeholders with the exact anatomy of the News page (see HomeNewsFeed / NewsFeedPostCard):
 * a 680px feed centred in its area + a 340px (400px from xl) rail on the navbar's frame, tonal cards, 40px avatar, 15px / 13px text lines, framed 12px media,
 * a 40px action bar. The page skeleton can render before the `.news-theme` scope exists, so the card
 * tone is written out here (it matches the news-mono --gn-surface: #f7f9f9 / #16181c): square,
 * filled, no outline for the posts; the rail's boxes are outlined instead (RAIL_BOX).
 */
const CARD = 'bg-[#f7f9f9] dark:bg-[#16181c]';
/** The rail's boxes, as `.gn-rail-box` draws them: a 1px hairline (#d6dee3 / #1f2226), no fill. */
const RAIL_BOX = 'shadow-[inset_0_0_0_1px_#d6dee3] dark:shadow-[inset_0_0_0_1px_#1f2226]';
const block = 'animate-pulse rounded-md bg-black/[0.07] dark:bg-white/[0.08]';

function SkeletonLine({ className = '' }: { className?: string }) {
  return <div className={`${block} ${className}`} aria-hidden />;
}

function HomeNewsPostCardSkeleton() {
  return (
    <article className={`overflow-hidden ${CARD}`} aria-hidden>
      <div className="flex items-center gap-3 px-4 pt-4">
        <div className={`h-10 w-10 shrink-0 !rounded-full ${block}`} />
        <div className="min-w-0 flex-1 space-y-1.5">
          <SkeletonLine className="h-[15px] w-36" />
          <SkeletonLine className="h-[13px] w-24" />
        </div>
      </div>
      <div className="space-y-2 px-4 pt-3">
        <SkeletonLine className="h-[15px] w-11/12" />
        <SkeletonLine className="h-[15px] w-2/3" />
        <div className="flex gap-1.5 pt-1">
          <SkeletonLine className="h-6 w-16 !rounded-full" />
          <SkeletonLine className="h-6 w-14 !rounded-full" />
        </div>
      </div>
      <div className="px-4 pt-3">
        <div className={`aspect-[4/3] w-full !rounded-xl ${block}`} />
      </div>
      <div className="grid grid-cols-5 px-2 py-1.5">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="flex h-10 items-center justify-center">
            <SkeletonLine className="h-5 w-5 !rounded-full" />
          </div>
        ))}
      </div>
    </article>
  );
}

export function HomeNewsFeedSkeleton({ count = 2 }: { count?: number; split?: boolean }) {
  return (
    <div className="space-y-2 sm:space-y-3" aria-busy="true" aria-label="Loading news">
      {Array.from({ length: count }, (_, index) => (
        <HomeNewsPostCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function HomeNewsPageSkeleton() {
  return (
    <div className="w-full pb-24 pt-2 sm:px-8 sm:pt-6 md:px-12 lg:px-16 lg:pt-8">
      <div className="mx-auto grid w-full max-w-[600px] items-start gap-8 lg:max-w-[1240px] lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_400px] xl:gap-0">
        <div className="mx-auto flex w-full min-w-0 max-w-[680px] flex-col gap-3">
          {/* Below lg: the portfolio row, the composer row and the interest pills, as in HomeNewsFeed. */}
          <div className={`h-[4.75rem] w-full !rounded-none lg:hidden ${block}`} aria-hidden />
          <div className="flex items-center gap-3 px-4 pt-1 sm:px-0 lg:hidden" aria-hidden>
            <div className={`h-10 w-10 shrink-0 !rounded-full ${block}`} />
            <div className={`h-10 flex-1 !rounded-full ${block}`} />
            <div className={`h-10 w-10 shrink-0 !rounded-full ${block}`} />
          </div>
          <div className="flex gap-2 overflow-hidden px-4 sm:px-0 lg:hidden" aria-hidden>
            {['w-12', 'w-24', 'w-28', 'w-20'].map((width) => (
              <div key={width} className={`h-9 shrink-0 !rounded-full ${block} ${width}`} />
            ))}
          </div>
          <HomeNewsFeedSkeleton />
        </div>
        <div className="hidden space-y-6 lg:block" aria-hidden>
          {/* The rail's boxes, outlined by the hairline with no fill (`.gn-rail-box`), then the
              publish button. */}
          <div className={`h-[4.75rem] w-full ${RAIL_BOX}`} />
          <div className={`h-[25rem] w-full ${RAIL_BOX}`} />
          <div className={`h-10 w-full ${block} !rounded-full`} />
        </div>
      </div>
    </div>
  );
}
