import { creatorProductGridClassName } from '@/components/creator/CreatorProductCard';
import { CREATOR_STUDIO_TABS, type CreatorStudioTab } from '@/components/creator/studio/types';

const block = 'animate-pulse rounded bg-neutral-200 dark:bg-neutral-700';

function SkeletonLine({ className = '' }: { className?: string }) {
  return <div className={`${block} ${className}`} aria-hidden />;
}

export function CreatorStudioHeaderSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[1280px]" aria-busy="true" aria-label="Loading creator studio">
      <div className={`relative aspect-[4.5/1] min-h-[160px] w-full overflow-hidden rounded-2xl sm:min-h-[200px] md:min-h-[240px] ${block}`} />

      <div className="px-4 sm:px-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="-mt-12 shrink-0 sm:-mt-14">
              <div className={`h-20 w-20 rounded-full border-4 border-white dark:border-neutral-950 sm:h-28 sm:w-28 ${block}`} />
            </div>
            <div className="min-w-0 space-y-2 pb-1">
              <SkeletonLine className="h-7 w-48 sm:h-8" />
              <SkeletonLine className="h-4 w-32" />
              <div className="flex flex-wrap gap-2 pt-1">
                <SkeletonLine className="h-4 w-20" />
                <SkeletonLine className="h-4 w-20" />
                <SkeletonLine className="h-4 w-16" />
              </div>
              <SkeletonLine className="h-4 w-full max-w-md" />
            </div>
          </div>
          <div className="flex flex-wrap gap-2 pb-1">
            <SkeletonLine className="h-10 w-36 rounded-full" />
            <SkeletonLine className="h-10 w-32 rounded-full" />
          </div>
        </div>

        <div className="mt-6 flex gap-4 border-b border-neutral-200 pb-3 dark:border-neutral-800">
          {CREATOR_STUDIO_TABS.map((item) => (
            <SkeletonLine key={item.id} className="h-4 w-20 shrink-0" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function CreatorStudioContentTabSkeleton() {
  return (
    <div className="min-w-0 space-y-6" aria-busy="true" aria-label="Loading content">
      <div className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 10 }, (_, i) => (
          <article
            key={i}
            className="overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
          >
            <div className={`aspect-video w-full ${block} rounded-none`} />
            <div className="space-y-3 p-4">
              <SkeletonLine className="h-4 w-4/5" />
              <div className="flex gap-2">
                <SkeletonLine className="h-5 w-14 rounded-full" />
                <SkeletonLine className="h-5 w-16 rounded-full" />
              </div>
              <SkeletonLine className="h-3 w-40" />
              <div className="flex gap-4">
                <SkeletonLine className="h-4 w-10" />
                <SkeletonLine className="h-4 w-14" />
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function CreatorProductCardSkeleton() {
  return (
    <article className="flex w-full flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
      <div className={`h-52 w-full ${block} rounded-none`} />
      <div className="space-y-3 p-4">
        <SkeletonLine className="h-4 w-4/5" />
        <SkeletonLine className="h-3 w-24" />
        <div className="flex items-center justify-between pt-1">
          <SkeletonLine className="h-6 w-16" />
          <SkeletonLine className="h-8 w-24 rounded-full" />
        </div>
      </div>
    </article>
  );
}

export function CreatorStudioProductsTabSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading products">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <SkeletonLine className="h-6 w-28" />
          <SkeletonLine className="h-4 w-72 max-w-full" />
        </div>
        <SkeletonLine className="h-11 w-full rounded-xl sm:w-72" />
      </div>

      <div className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex flex-wrap gap-3">
          <SkeletonLine className="h-10 flex-1 min-w-[10rem] rounded-xl" />
          <SkeletonLine className="h-10 w-28 rounded-xl" />
          <SkeletonLine className="h-10 w-32 rounded-xl" />
        </div>
      </div>

      <div className={creatorProductGridClassName}>
        {Array.from({ length: 10 }, (_, i) => (
          <CreatorProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function CreatorStudioVisitorsTabSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading visitors">
      <div className="space-y-2">
        <SkeletonLine className="h-6 w-28" />
        <SkeletonLine className="h-4 w-56" />
      </div>
      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="flex items-center gap-3 border-b border-neutral-200 px-5 py-4 last:border-b-0 dark:border-neutral-800">
            <div className={`h-11 w-11 rounded-full ${block}`} />
            <div className="flex-1 space-y-2">
              <SkeletonLine className="h-4 w-40" />
              <SkeletonLine className="h-3 w-24" />
            </div>
            <SkeletonLine className="h-4 w-28" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function CreatorStudioImagesTabSkeleton() {
  return (
    <div className="space-y-10" aria-busy="true" aria-label="Loading images">
      <div className="space-y-2">
        <SkeletonLine className="h-7 w-28" />
        <SkeletonLine className="h-4 w-80 max-w-full" />
      </div>
      <div className="space-y-3">
        <SkeletonLine className="h-5 w-36" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className={`aspect-square rounded-2xl ${block}`} />
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <SkeletonLine className="h-5 w-36" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className={`aspect-[16/9] rounded-2xl ${block}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function CreatorStudioSubscribersTabSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading subscribers">
      <div className="space-y-2">
        <SkeletonLine className="h-6 w-32" />
        <SkeletonLine className="h-4 w-56" />
      </div>
      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="flex items-center gap-3 border-b border-neutral-200 px-5 py-4 last:border-b-0 dark:border-neutral-800">
            <div className={`h-11 w-11 rounded-full ${block}`} />
            <div className="flex-1 space-y-2">
              <SkeletonLine className="h-4 w-40" />
              <SkeletonLine className="h-3 w-24" />
            </div>
            <SkeletonLine className="h-4 w-28" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function CreatorStudioProfileTabSkeleton() {
  return (
    <div
      className="grid gap-4 md:grid-cols-[minmax(0,1fr)_15rem]"
      aria-busy="true"
      aria-label="Loading profile information"
    >
      <div className="order-2 min-h-[480px] min-w-0 md:order-none md:col-start-1 md:row-start-1">
        <div className="flex min-h-[480px] flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex-1 p-5 sm:p-6">
            <header className="mb-5 border-b border-neutral-100 pb-4 dark:border-neutral-800">
              <SkeletonLine className="h-5 w-40" />
              <SkeletonLine className="mt-2 h-4 w-full max-w-lg" />
            </header>
            <div className="space-y-4">
              <SkeletonLine className="h-20 w-full rounded-xl" />
              <div className="grid gap-4 sm:grid-cols-2">
                <SkeletonLine className="h-10 w-full rounded-xl" />
                <SkeletonLine className="h-10 w-full rounded-xl" />
              </div>
              <SkeletonLine className="h-10 w-full rounded-xl" />
            </div>
          </div>
          <div className="flex justify-end border-t border-neutral-200 bg-neutral-50/50 px-5 py-4 dark:border-neutral-800 dark:bg-neutral-950/30 sm:px-6">
            <SkeletonLine className="h-10 w-28 rounded-full" />
          </div>
        </div>
      </div>
      <aside className="order-1 overflow-hidden rounded-2xl border border-neutral-200 bg-white p-2 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 md:hidden">
        <div className="flex gap-1 overflow-x-auto">
          {Array.from({ length: 9 }, (_, i) => (
            <SkeletonLine key={i} className="h-10 w-44 shrink-0 rounded-lg" />
          ))}
        </div>
      </aside>
      <div className="relative hidden w-60 md:col-start-2 md:row-start-1 md:block">
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white p-2 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex flex-col gap-1">
            {Array.from({ length: 9 }, (_, i) => (
              <SkeletonLine key={i} className="mx-2 h-10 w-[calc(100%-1rem)] rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function CreatorStudioTabPanelSkeleton({ tab }: { tab: CreatorStudioTab }) {
  switch (tab) {
    case 'content':
      return <CreatorStudioContentTabSkeleton />;
    case 'products':
      return <CreatorStudioProductsTabSkeleton />;
    case 'images':
      return <CreatorStudioImagesTabSkeleton />;
    case 'visitors':
      return <CreatorStudioVisitorsTabSkeleton />;
    case 'subscribers':
      return <CreatorStudioSubscribersTabSkeleton />;
    case 'profile':
      return <CreatorStudioProfileTabSkeleton />;
    default:
      return <CreatorStudioContentTabSkeleton />;
  }
}

export function CreatorStudioHubSkeleton({ tab }: { tab: CreatorStudioTab }) {
  return (
    <>
      <CreatorStudioHeaderSkeleton />
      <div className="mx-auto w-full max-w-[1280px] px-4 py-8 sm:px-6">
        <CreatorStudioTabPanelSkeleton tab={tab} />
      </div>
    </>
  );
}

export function CreatorStudioProductViewSkeleton() {
  return (
    <div className="mx-auto max-w-7xl space-y-8" aria-busy="true" aria-label="Loading product">
      <SkeletonLine className="h-4 w-28" />
      <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
        <div className="space-y-4 lg:col-span-5">
          <div className={`aspect-square w-full rounded-2xl ${block}`} />
          <div className="flex justify-between">
            <SkeletonLine className="h-8 w-24" />
            <SkeletonLine className="h-8 w-32" />
          </div>
        </div>
        <div className="space-y-4 lg:col-span-4">
          <SkeletonLine className="h-8 w-3/4" />
          <SkeletonLine className="h-4 w-full" />
          <SkeletonLine className="h-4 w-full" />
          <SkeletonLine className="h-4 w-2/3" />
          <div className="flex gap-2">
            <SkeletonLine className="h-6 w-16 rounded-full" />
            <SkeletonLine className="h-6 w-20 rounded-full" />
          </div>
        </div>
        <div className="lg:col-span-3">
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
            <SkeletonLine className="h-6 w-24" />
            <SkeletonLine className="mt-4 h-8 w-20" />
            <SkeletonLine className="mt-4 h-10 w-full rounded-xl" />
            <SkeletonLine className="mt-2 h-10 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function CreatorStudioProductEditSkeleton() {
  return (
    <div className="mx-auto max-w-4xl space-y-6" aria-busy="true" aria-label="Loading product editor">
      <div className="space-y-2">
        <SkeletonLine className="h-4 w-28" />
        <SkeletonLine className="h-8 w-40" />
      </div>
      <div className="space-y-4">
        <div className="flex justify-between gap-2">
          {Array.from({ length: 5 }, (_, i) => (
            <SkeletonLine key={i} className="hidden h-9 w-9 rounded-full sm:block" />
          ))}
        </div>
        <SkeletonLine className="h-2 w-full rounded-full sm:hidden" />
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
          <SkeletonLine className="h-5 w-32" />
          <SkeletonLine className="mt-2 h-4 w-64" />
          <div className="mt-6 space-y-4">
            <SkeletonLine className="h-10 w-full rounded-xl" />
            <div className="grid gap-4 sm:grid-cols-2">
              <SkeletonLine className="h-10 w-full rounded-xl" />
              <SkeletonLine className="h-10 w-full rounded-xl" />
            </div>
            <SkeletonLine className="h-28 w-full rounded-xl" />
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <SkeletonLine className="h-10 w-24 rounded-full" />
          <SkeletonLine className="h-10 w-32 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function CreatorStudioContentFormSkeleton() {
  return (
    <div className="mx-auto max-w-2xl space-y-6" aria-busy="true" aria-label="Loading content form">
      <div className="space-y-2">
        <SkeletonLine className="h-4 w-24" />
        <SkeletonLine className="h-8 w-48" />
      </div>
      <div className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
        <SkeletonLine className="h-10 w-full rounded-xl" />
        <div className="grid gap-4 sm:grid-cols-2">
          <SkeletonLine className="h-10 w-full rounded-xl" />
          <SkeletonLine className="h-10 w-full rounded-xl" />
        </div>
        <SkeletonLine className="h-28 w-full rounded-xl" />
        <SkeletonLine className="h-10 w-full rounded-xl" />
        <SkeletonLine className="h-10 w-full rounded-xl" />
      </div>
      <SkeletonLine className="h-10 w-32 rounded-full" />
    </div>
  );
}
