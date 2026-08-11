/**
 * Loading placeholder matching the editorial hero:
 * left copy, right grey triangle motif, soft-rounded portrait card, circular meta badges.
 * Greyscale only (white / neutral gray).
 */
function Bone({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-neutral-200 ${className}`.trim()} />;
}

function HeroCopySkeleton() {
  return (
    <div className="flex w-full min-w-0 max-w-[42rem] flex-col items-start gap-7 sm:gap-9 lg:gap-11">
      {/* Availability pill */}
      <Bone className="h-9 w-44 rounded-full" />

      {/* Headline: small prefix + large title */}
      <div className="w-full space-y-3">
        <Bone className="h-3 w-24 rounded" />
        <Bone className="h-12 w-[min(100%,22rem)] sm:h-14 lg:h-16" />
        <Bone className="h-12 w-[min(92%,28rem)] sm:h-14 lg:h-16" />
      </div>

      {/* Pitch */}
      <div className="w-full max-w-xl space-y-2.5">
        <Bone className="h-3.5 w-full" />
        <Bone className="h-3.5 w-[96%]" />
        <Bone className="h-3.5 w-[88%]" />
        <Bone className="h-3.5 w-[70%]" />
      </div>

      {/* Contact CTA */}
      <Bone className="h-12 w-36 rounded-full bg-neutral-300" />

      {/* Tool icons — three small circles */}
      <div className="flex items-center gap-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Bone key={index} className="h-10 w-10 rounded-full bg-neutral-200" />
        ))}
      </div>
    </div>
  );
}

/** Soft-rounded portrait card (not circular) + name line underneath. */
function HeroPortraitSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`relative flex flex-col items-center ${className}`.trim()}>
      <div className="w-full overflow-hidden rounded-[1.75rem] bg-white p-2 shadow-sm ring-1 ring-neutral-100">
        <div className="aspect-[4/5] w-full animate-pulse rounded-[1.35rem] bg-neutral-300" />
      </div>
      <Bone className="mt-4 h-4 w-36 bg-neutral-300" />
    </div>
  );
}

/** Circular meta badges (icon + value + label). */
function HeroMetaBadgesSkeleton() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 lg:justify-start">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="flex h-[6.75rem] w-[6.75rem] flex-col items-center justify-center rounded-full border border-neutral-200 bg-white sm:h-28 sm:w-28"
        >
          <Bone className="h-3.5 w-3.5 rounded-full bg-neutral-300" />
          <Bone className="mt-2 h-5 w-10 bg-neutral-300" />
          <Bone className="mt-1.5 h-2 w-12" />
        </div>
      ))}
    </div>
  );
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

export function PublicCreatorPortfolioSkeleton() {
  return (
    <div className="min-h-screen bg-white" aria-busy="true" aria-label="Loading portfolio">
      <section className="relative isolate min-h-[100dvh] min-h-screen overflow-x-clip bg-white">
        {/* Light grey right triangle motif */}
        <div aria-hidden className="pointer-events-none absolute inset-0 z-0 hidden lg:block">
          <div className="relative mx-auto h-full w-full px-16 xl:px-40 2xl:px-48">
            <div
              className="absolute inset-y-[6%] right-0 w-[48%] bg-neutral-200"
              style={{
                clipPath: 'polygon(22% 0%, 100% 0%, 100% 100%, 0% 100%)',
              }}
            />
          </div>
        </div>

        <div className="relative z-10 w-full px-5 pb-28 pt-20 sm:px-10 sm:pt-24 md:px-16 lg:px-20 lg:pb-0 xl:px-40 xl:pt-28 2xl:px-48">
          <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,22rem)] lg:gap-10 xl:block">
            <HeroCopySkeleton />

            {/* Mobile / tablet portrait in flow */}
            <div className="mx-auto w-full max-w-[18rem] lg:mx-0 xl:hidden">
              <HeroPortraitSkeleton />
            </div>
          </div>

          {/* Mobile meta badges */}
          <div className="mt-12 flex justify-center xl:hidden">
            <HeroMetaBadgesSkeleton />
          </div>
        </div>

        {/* Desktop absolute portrait + meta on the motif */}
        <div aria-hidden className="pointer-events-none absolute inset-0 z-20 hidden xl:block">
          <div className="relative mx-auto h-full w-full px-16 xl:px-40 2xl:px-48">
            <div
              className="absolute w-[min(18rem,24%)] -translate-x-1/2 -translate-y-1/2"
              style={{ left: '78%', top: '42%' }}
            >
              <HeroPortraitSkeleton />
            </div>
            <div
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: '72%', top: '88%' }}
            >
              <HeroMetaBadgesSkeleton />
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto w-full px-5 pb-16 sm:px-10 sm:pb-20 md:px-16 lg:px-20 xl:px-40 2xl:px-48">
        <WorkSectionSkeleton />
      </main>
    </div>
  );
}
