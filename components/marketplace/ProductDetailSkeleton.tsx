const block = 'animate-pulse rounded bg-gray-200 dark:bg-neutral-700';

function PurchasePanelSkeleton() {
  return (
    <aside className="rounded-2xl border border-stone-200 bg-stone-50 p-5 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <div className={`h-9 w-28 ${block}`} />
          <div className={`h-4 w-20 ${block}`} />
        </div>
        <div className={`h-6 w-12 rounded-md ${block}`} />
      </div>

      <div className="mt-4 flex justify-between gap-4">
        <div className={`h-4 w-14 ${block}`} />
        <div className={`h-4 w-28 ${block}`} />
      </div>

      <div className={`mt-5 h-12 w-full rounded-xl ${block}`} />
      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className={`h-11 rounded-xl ${block}`} />
        <div className={`h-11 rounded-xl ${block}`} />
      </div>

      <div className="mt-5 space-y-2">
        <div className={`h-4 w-12 ${block}`} />
        <div className="flex gap-2">
          <div className={`h-9 flex-1 rounded-lg ${block}`} />
          <div className={`h-9 w-9 rounded-full ${block}`} />
          <div className={`h-9 w-9 rounded-full ${block}`} />
        </div>
      </div>
    </aside>
  );
}

function CharacteristicsTabSkeleton() {
  return (
    <section className="space-y-4" aria-hidden>
      <div className="flex flex-wrap gap-2">
        <div className={`h-10 w-36 rounded-xl ${block}`} />
        <div className={`h-10 w-28 rounded-xl ${block}`} />
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
          <dl className="w-full shrink-0 space-y-0 lg:max-w-sm">
            {Array.from({ length: 5 }, (_, index) => (
              <div
                key={index}
                className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-x-4 border-b border-gray-100 py-3 last:border-b-0 dark:border-neutral-800"
              >
                <div className={`h-4 w-16 ${block}`} />
                <div className={`h-4 w-full max-w-[10rem] ${block}`} />
              </div>
            ))}
          </dl>

          <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-2">
            {Array.from({ length: 6 }, (_, index) => (
              <div
                key={index}
                className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3.5 dark:border-neutral-800 dark:bg-neutral-800/50"
              >
                <div className={`h-3 w-20 ${block}`} />
                <div className={`mt-2 h-5 w-24 ${block}`} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ReviewsSectionSkeleton() {
  return (
    <section className="border-t border-gray-200 pt-10 dark:border-neutral-800" aria-hidden>
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <div className={`h-6 w-48 ${block}`} />
          <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:gap-12">
            <div className="flex flex-col items-center gap-3 sm:items-start">
              <div className={`h-14 w-20 ${block}`} />
              <div className={`h-5 w-28 ${block}`} />
            </div>
            <div className="flex-1 space-y-3">
              {Array.from({ length: 5 }, (_, index) => (
                <div key={index} className={`h-2.5 w-full rounded-full ${block}`} />
              ))}
            </div>
          </div>
          {Array.from({ length: 2 }, (_, index) => (
            <div key={index} className="border-b border-gray-100 py-6 dark:border-neutral-800">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-full ${block}`} />
                <div className="space-y-2">
                  <div className={`h-4 w-32 ${block}`} />
                  <div className={`h-3 w-24 ${block}`} />
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className={`h-3 w-full ${block}`} />
                <div className={`h-3 w-4/5 ${block}`} />
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className={`h-6 w-36 ${block}`} />
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="flex items-center gap-4 rounded-xl p-2.5">
              <div className={`h-[4.5rem] w-[4.5rem] shrink-0 rounded-xl ${block}`} />
              <div className="min-w-0 flex-1 space-y-2">
                <div className={`h-4 w-3/4 ${block}`} />
                <div className={`h-3.5 w-1/2 ${block}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ProductDetailSkeleton() {
  return (
    <main
      className="mx-auto min-w-0 max-w-7xl overflow-x-hidden px-4 py-8 lg:py-10"
      aria-busy="true"
      aria-label="Loading product"
    >
      <div className={`h-4 w-40 ${block}`} />

      <div className="mt-6 grid gap-8 lg:grid-cols-12 lg:gap-10">
        <div className="order-1 min-w-0 lg:col-span-5">
          <div className={`aspect-video w-full rounded-2xl ${block}`} />

          <div className="mt-4 space-y-4">
            <div className="flex items-end justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className={`h-5 w-28 ${block}`} />
                <div className={`h-4 w-36 ${block}`} />
              </div>
              <div className="flex gap-3">
                <div className={`h-8 w-8 rounded-full ${block}`} />
                <div className={`h-8 w-8 rounded-full ${block}`} />
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-neutral-700 dark:bg-neutral-900">
              <div className={`h-14 w-14 shrink-0 rounded-full ${block}`} />
              <div className="space-y-2">
                <div className={`h-3 w-16 ${block}`} />
                <div className={`h-5 w-32 ${block}`} />
              </div>
            </div>
          </div>
        </div>

        <div className="order-3 min-w-0 space-y-6 lg:order-2 lg:col-span-4">
          <header className="space-y-4">
            <div className={`h-9 w-4/5 max-w-md ${block}`} />
            <div className="space-y-2">
              <div className={`h-4 w-full ${block}`} />
              <div className={`h-4 w-full ${block}`} />
              <div className={`h-4 w-2/3 ${block}`} />
            </div>

            <div className="space-y-3">
              <div>
                <div className={`mb-2 h-3 w-28 ${block}`} />
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 3 }, (_, index) => (
                    <div key={index} className={`h-7 w-20 rounded-full ${block}`} />
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 3 }, (_, index) => (
                  <div key={index} className={`h-7 w-16 rounded-full ${block}`} />
                ))}
              </div>
              <div>
                <div className={`mb-2 h-3 w-12 ${block}`} />
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 4 }, (_, index) => (
                    <div key={index} className={`h-7 w-14 rounded-full ${block}`} />
                  ))}
                </div>
              </div>
            </div>
          </header>
        </div>

        <div className="order-2 min-w-0 lg:order-3 lg:col-span-3">
          <div className="lg:sticky lg:top-24">
            <PurchasePanelSkeleton />
          </div>
        </div>
      </div>

      <div className="mt-12 space-y-12 border-t border-gray-200 pt-10 dark:border-neutral-800">
        <CharacteristicsTabSkeleton />
        <ReviewsSectionSkeleton />
      </div>
    </main>
  );
}
