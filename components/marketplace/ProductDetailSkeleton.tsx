/** Placeholder tones of the X palette: blocks on the page, pieces inside a surface. */
const block = 'animate-pulse bg-[#EFF3F4] dark:bg-[#202327]';
const surface = 'bg-[#F7F9F9] dark:bg-[#16181C]';

function PurchasePanelSkeleton() {
  return (
    <aside className={`${surface} p-5 sm:p-6`} aria-hidden>
      <div className={`h-4 w-12 ${block}`} />
      <div className={`mt-2 h-9 w-36 ${block}`} />
      <div className="mt-5 flex justify-between gap-4">
        <div className={`h-4 w-20 ${block}`} />
        <div className={`h-4 w-24 ${block}`} />
      </div>
      <div className={`mt-6 h-11 w-full ${block}`} />
      <div className="mt-6 grid grid-cols-2 gap-2">
        <div className={`h-11 ${block}`} />
        <div className={`h-11 ${block}`} />
      </div>
      <div className={`mt-2 h-11 w-full ${block}`} />
      <div className={`mt-2 h-11 w-full ${block}`} />
    </aside>
  );
}

function DetailsSkeleton() {
  return (
    <section aria-hidden>
      <div className={`mx-4 h-6 w-28 sm:mx-0 ${block}`} />
      <div className={`mt-3 p-5 sm:mt-4 sm:p-6 ${surface}`}>
        <div className="flex flex-col gap-5 lg:flex-row lg:gap-8">
          <div className="w-full space-y-4 lg:max-w-sm">
            {Array.from({ length: 3 }, (_, index) => (
              <div key={index} className="flex justify-between gap-4">
                <div className={`h-4 w-20 ${block}`} />
                <div className={`h-4 w-28 ${block}`} />
              </div>
            ))}
          </div>
          <div className="grid min-w-0 flex-1 grid-cols-2 gap-2 sm:grid-cols-3">
            {Array.from({ length: 3 }, (_, index) => (
              <div key={index} className={`h-[72px] ${block}`} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function ProductDetailSkeleton() {
  return (
    <main
      className="mx-auto max-w-7xl px-0 pb-24 pt-2 sm:px-6 sm:pt-6"
      aria-busy="true"
      aria-label="Loading product"
    >
      <div className={`mx-4 my-3 h-4 w-40 sm:mx-0 ${block}`} />
      <div className="mt-2 grid gap-6 sm:mt-4 lg:grid-cols-12 lg:gap-x-6 lg:gap-y-8">
        <div className="min-w-0 lg:col-span-8">
          <div className={`aspect-[16/10] w-full ${block}`} />
        </div>
        <div className="min-w-0 lg:col-span-4 lg:row-span-2">
          <PurchasePanelSkeleton />
        </div>
        <div className="min-w-0 space-y-4 px-4 sm:px-0 lg:col-span-8">
          <div className={`h-9 w-2/3 ${block}`} />
          <div className={`h-4 w-full max-w-xl ${block}`} />
          <div className={`h-4 w-4/5 max-w-lg ${block}`} />
          <div className={`h-[76px] w-full ${surface}`} />
        </div>
      </div>
      <div className="mt-10 md:mt-14">
        <DetailsSkeleton />
      </div>
    </main>
  );
}
