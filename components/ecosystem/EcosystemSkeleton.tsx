const block = 'animate-pulse rounded bg-neutral-200 dark:bg-neutral-800';
const surface = 'rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900';

export function EcosystemHeroCardSkeleton() {
  return (
    <section className={`overflow-hidden ${surface} shadow-sm`} aria-hidden>
      <div className="flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between lg:gap-8 lg:p-8">
        <div className="min-w-0 flex-1 space-y-4 lg:max-w-2xl">
          <div className={`h-9 w-4/5 max-w-lg ${block}`} />
          <div className="space-y-2">
            <div className={`h-4 w-full ${block}`} />
            <div className={`h-4 w-full ${block}`} />
            <div className={`h-4 w-3/4 ${block}`} />
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className={`h-12 w-12 rounded-full sm:h-14 sm:w-14 ${block}`} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function EcosystemRequestsToolbarSkeleton() {
  return (
    <div className="space-y-3" aria-hidden>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className={`h-10 w-full max-w-md rounded-xl ${block}`} />
        <div className={`h-10 w-28 rounded-xl ${block}`} />
      </div>
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className={`h-9 w-28 rounded-full ${block}`} />
        ))}
      </div>
    </div>
  );
}

export function EcosystemRequestsTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className={`overflow-hidden ${surface} shadow-sm`} aria-hidden>
      <div className="hidden border-b border-neutral-200 px-6 py-3 dark:border-neutral-800 md:grid md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_auto] md:gap-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className={`h-3 w-20 ${block}`} />
        ))}
      </div>
      {Array.from({ length: rows }, (_, index) => (
        <div
          key={index}
          className="border-b border-neutral-100 px-6 py-4 last:border-b-0 dark:border-neutral-800"
        >
          <div className="grid gap-3 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_auto] md:items-center md:gap-4">
            <div className="space-y-2">
              <div className={`h-4 w-3/4 max-w-xs ${block}`} />
              <div className={`h-3 w-24 ${block}`} />
            </div>
            <div className={`h-6 w-24 rounded-full ${block}`} />
            <div className={`h-4 w-32 ${block}`} />
            <div className={`h-4 w-16 ${block}`} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function EcosystemRequestsListSkeleton({ includeHeader = true }: { includeHeader?: boolean }) {
  return (
    <section className="space-y-4" aria-busy="true" aria-label="Loading requests">
      {includeHeader && (
        <div>
          <div className={`h-6 w-36 ${block}`} />
          <div className={`mt-1 h-4 w-64 ${block}`} />
        </div>
      )}
      <EcosystemRequestsToolbarSkeleton />
      <EcosystemRequestsTableSkeleton />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className={`h-9 w-36 rounded-lg ${block}`} />
        <div className={`h-9 w-48 rounded-lg ${block}`} />
      </div>
    </section>
  );
}

export function EcosystemHubSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading ecosystem">
      <div className="flex justify-end">
        <div className={`h-10 w-36 rounded-xl ${block}`} />
      </div>
      <EcosystemHeroCardSkeleton />
      <EcosystemRequestsListSkeleton />
    </div>
  );
}

function StatusStepperSkeleton() {
  return (
    <nav className="w-full" aria-hidden>
      <div className={`${surface} px-4 py-6 shadow-sm sm:px-6`}>
        <div className="flex items-start">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className={`flex flex-col items-center ${index < 5 ? 'min-w-0 flex-1' : 'shrink-0'}`}>
              <div className="flex w-full items-center">
                {index > 0 && <div className={`h-0.5 flex-1 ${block}`} />}
                <div className={`mx-1 h-8 w-8 shrink-0 rounded-full ${block}`} />
                {index < 5 && <div className={`h-0.5 flex-1 ${block}`} />}
              </div>
              <div className={`mt-2 h-3 w-14 ${block}`} />
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
}

function PopularNichesPanelSkeleton() {
  return (
    <aside
      className="hidden h-[min(800px,calc(100vh-8rem))] w-full shrink-0 overflow-hidden rounded-2xl bg-neutral-100 dark:bg-neutral-900 xl:block xl:w-72"
      aria-hidden
    >
      <div className="flex h-full flex-col items-center justify-center px-6 text-center">
        <div className={`h-3 w-16 ${block}`} />
        <div className={`mt-3 h-5 w-40 ${block}`} />
        <div className={`mt-4 h-8 w-28 rounded-full ${block}`} />
      </div>
    </aside>
  );
}

function MainStepContentSkeleton() {
  return (
    <div className={`${surface} p-6 shadow-sm`} aria-hidden>
      <div className={`h-6 w-48 ${block}`} />
      <div className={`mt-2 h-4 w-full max-w-md ${block}`} />
      <div className="mt-6 space-y-4">
        <div className={`h-24 w-full rounded-xl ${block}`} />
        <div className={`h-24 w-full rounded-xl ${block}`} />
        <div className="flex gap-2">
          <div className={`h-10 w-28 rounded-lg ${block}`} />
          <div className={`h-10 w-32 rounded-lg ${block}`} />
        </div>
      </div>
    </div>
  );
}

export function EcosystemDetailSkeleton() {
  return (
    <div className="flex flex-col gap-8 xl:flex-row xl:items-start" aria-busy="true" aria-label="Loading ecosystem request">
      <div className="min-w-0 flex-1 space-y-6">
        <StatusStepperSkeleton />
        <MainStepContentSkeleton />
      </div>
      <PopularNichesPanelSkeleton />
    </div>
  );
}

function NicheDetailsSectionSkeleton() {
  return (
    <section className={`${surface} p-6 shadow-sm`} aria-hidden>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <div className={`h-6 w-32 ${block}`} />
          <div className={`h-4 w-56 ${block}`} />
        </div>
        <div className={`h-6 w-16 rounded-full ${block}`} />
      </div>
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} className={index === 2 || index === 7 ? 'sm:col-span-2' : undefined}>
            <div className={`h-3 w-20 ${block}`} />
            <div className={`mt-2 h-4 w-full max-w-xs ${block}`} />
          </div>
        ))}
        <div className="sm:col-span-2">
          <div className={`h-3 w-24 ${block}`} />
          <div className={`mt-2 h-20 w-full rounded-xl ${block}`} />
        </div>
      </div>
    </section>
  );
}

function AgentContentSectionSkeleton() {
  return (
    <section className={`${surface} p-6 shadow-sm`} aria-hidden>
      <div className={`h-6 w-36 ${block}`} />
      <div className={`mt-2 h-4 w-72 max-w-full ${block}`} />
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} className={`aspect-[9/16] w-full rounded-xl ${block}`} />
        ))}
      </div>
    </section>
  );
}

export function EcosystemConsultSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading niche consultation">
      <div>
        <div className={`h-4 w-32 ${block}`} />
        <div className={`mt-3 h-8 w-2/3 max-w-md ${block}`} />
      </div>
      <NicheDetailsSectionSkeleton />
      <AgentContentSectionSkeleton />
    </div>
  );
}
