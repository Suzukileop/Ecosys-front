import { creatorProductGridClassName } from '@/components/creator/CreatorProductCard';
import { APP_FIELD } from '@/components/landing/landingBrand';
import { CREATOR_STUDIO_TABS, type CreatorStudioTab } from '@/components/creator/studio/types';

const block = 'animate-pulse rounded bg-neutral-200 dark:bg-neutral-700';

function SkeletonLine({ className = '' }: { className?: string }) {
  return <div className={`${block} ${className}`} aria-hidden />;
}

const softBlock = 'animate-pulse rounded-md bg-black/[0.06] dark:bg-white/[0.06]';
const hairlineFrame =
  'overflow-hidden rounded-xl bg-[#FFFFFF] dark:bg-[#111111]';

function SoftLine({ className = '' }: { className?: string }) {
  return <div className={`${softBlock} ${className}`} aria-hidden />;
}

/** Matches `HorizontalProfileHeader`: avatar · identity · Subscribers / Stars, edge to edge on phones. */
function CreatorStudioHeaderSkeleton() {
  return (
    <div className="bg-[#FFFFFF] px-5 py-7 dark:bg-[#111111] sm:rounded-xl sm:p-10">
      <div className="flex flex-col items-center gap-7 sm:flex-row sm:items-stretch sm:gap-10 md:gap-12">
        <div className="w-32 shrink-0 self-center sm:w-44 md:w-52 lg:w-56">
          <div className={`aspect-square w-full !rounded-full ${softBlock}`} />
        </div>

        <div className="flex w-full min-w-0 flex-1 flex-col items-center justify-center gap-5 sm:items-start">
          <div className="flex w-full flex-col items-center gap-2.5 sm:items-start">
            <SoftLine className="h-9 w-64 max-w-full" />
            <SoftLine className="h-4 w-48" />
          </div>
          <SoftLine className="h-4 w-56" />
          <SoftLine className="h-4 w-60 max-w-full" />
          <div className="flex w-full flex-col items-center gap-2 sm:items-start">
            <SoftLine className="h-4 w-full max-w-xl" />
            <SoftLine className="h-4 w-4/5 max-w-md" />
          </div>
        </div>

        <aside className="w-full shrink-0 border-t border-black/[0.06] pt-2 dark:border-white/[0.08] sm:w-36 sm:self-stretch sm:border-l sm:border-t-0 sm:pl-8 sm:pt-0 md:w-40">
          <div className="flex h-full w-full flex-row divide-x divide-black/[0.06] dark:divide-white/[0.08] sm:flex-col sm:divide-x-0 sm:divide-y">
            {Array.from({ length: 2 }, (_, i) => (
              <div key={i} className="flex flex-1 flex-col items-center justify-center gap-2.5 px-2 py-4">
                <SoftLine className="h-8 w-10" />
                <SoftLine className="h-4 w-20" />
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

function ContentPostCardSkeleton() {
  return (
    <article className="overflow-hidden bg-[#FFFFFF] dark:bg-[#111111] sm:rounded-xl">
      <div className="flex items-center gap-3.5 px-6 pt-6 sm:px-7 sm:pt-7">
        <div className={`h-11 w-11 shrink-0 !rounded-full ${softBlock}`} />
        <div className="min-w-0 flex-1 space-y-2">
          <SoftLine className="h-4 w-40" />
          <SoftLine className="h-3.5 w-52 max-w-full" />
        </div>
      </div>
      <div className="px-6 pb-6 sm:px-7">
        <SoftLine className="mt-4 h-4 w-2/3" />
        <div className="mt-4 flex gap-2">
          <SoftLine className="h-7 w-16 !rounded-full" />
          <SoftLine className="h-7 w-16 !rounded-full" />
        </div>
        <div className={`-mx-6 mt-3 aspect-[4/3] !rounded-none sm:mx-0 sm:!rounded-xl ${softBlock}`} />
        <div className="mt-4 flex items-center gap-5">
          <SoftLine className="h-10 w-10 !rounded-full" />
          <SoftLine className="h-10 w-10 !rounded-full" />
          <SoftLine className="ml-auto h-10 w-10 !rounded-full" />
        </div>
      </div>
    </article>
  );
}

/** Post list only — the Content tab keeps its headline, composer and status tabs on screen while loading. */
export function CreatorStudioContentPostsSkeleton({ count = 2 }: { count?: number }) {
  return (
    <div className="mx-auto w-full max-w-[760px] space-y-8" aria-busy="true" aria-label="Loading content">
      {Array.from({ length: count }, (_, i) => (
        <ContentPostCardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Headline · status tabs · News-style composer above the post cards. */
function CreatorStudioContentTabSkeleton() {
  return (
    <div className="space-y-10" aria-busy="true" aria-label="Loading content">
      <div className="w-full">
        <div className="px-5 sm:px-0">
          <SoftLine className="h-8 w-80 max-w-full" />
        </div>

        <div className="mt-6 flex gap-7 border-b border-black/[0.08] px-5 dark:border-white/[0.1] sm:px-0">
          {['w-20', 'w-14', 'w-16', 'w-12'].map((width) => (
            <SoftLine key={width} className={`mb-3 h-4 ${width}`} />
          ))}
        </div>
      </div>

      <div>
        <div className="mx-auto mb-8 w-full max-w-[760px] bg-[#FFFFFF] dark:bg-[#111111] md:rounded-xl">
          <div className="flex items-center gap-3.5 px-5 pt-5 sm:px-6">
            <div className={`h-11 w-11 shrink-0 !rounded-full ${softBlock}`} />
            <div className="h-11 flex-1 rounded-full bg-white dark:bg-white/[0.06]" />
          </div>
          <div className="mt-2 flex items-center gap-4 px-5 py-3.5 sm:px-6">
            {Array.from({ length: 4 }, (_, i) => (
              <SoftLine key={i} className="h-5 w-5 sm:w-16" />
            ))}
            <SoftLine className="ml-auto h-9 w-24 !rounded-full" />
          </div>
        </div>

        <CreatorStudioContentPostsSkeleton />
      </div>
    </div>
  );
}

function CreatorProductCardSkeleton() {
  return (
    <article className={`flex w-full flex-col ${hairlineFrame}`}>
      <div className={`aspect-[5/4] w-full ${softBlock} rounded-none`} />
      <div className="space-y-3 p-5">
        <SoftLine className="h-4 w-28" />
        <SoftLine className="h-5 w-4/5" />
        <SoftLine className="h-6 w-16 rounded-full" />
        <div className="flex items-center justify-between border-t border-black/[0.06] pt-4 dark:border-white/[0.06]">
          <SoftLine className="h-5 w-16" />
          <SoftLine className="h-9 w-24 rounded-lg" />
        </div>
      </div>
    </article>
  );
}

/** Full "My products" manager (catalog toolbar, filters, side panel). */
export function CreatorStudioProductsTabSkeleton({ insetOnMobile = false }: { insetOnMobile?: boolean }) {
  return (
    <div className={`space-y-10 ${insetOnMobile ? 'px-5 sm:px-0' : ''}`} aria-busy="true" aria-label="Loading products">
      <div className="space-y-3">
        <SoftLine className="h-9 w-56 sm:h-10" />
        <SoftLine className="h-5 w-80 max-w-full" />
      </div>

      <div className="flex flex-col gap-10 xl:flex-row xl:items-start xl:gap-12">
        <div className="min-w-0 flex-1 space-y-10">
          <div className="space-y-5">
            <div className="flex items-end justify-between gap-4 border-b border-black/[0.06] pb-3.5 dark:border-white/[0.06]">
              <div className="flex gap-7">
                <SoftLine className="h-5 w-20" />
                <SoftLine className="h-5 w-14" />
              </div>
              <SoftLine className="h-4 w-20" />
            </div>
            <div className="flex flex-col gap-3 md:flex-row">
              <SoftLine className="h-11 min-w-0 flex-1 rounded-lg" />
              <div className="flex gap-2">
                <SoftLine className="h-11 w-28 rounded-lg" />
                <SoftLine className="h-11 w-24 rounded-lg" />
              </div>
            </div>
            <div className="flex gap-2">
              <SoftLine className="h-8 w-16 rounded-full" />
              <SoftLine className="h-8 w-24 rounded-full" />
              <SoftLine className="h-8 w-20 rounded-full" />
            </div>
          </div>

          <div className="space-y-5">
            <SoftLine className="h-6 w-32" />
            <div className={creatorProductGridClassName}>
              {Array.from({ length: 6 }, (_, i) => (
                <CreatorProductCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>

        <div className="hidden w-72 shrink-0 space-y-4 xl:block">
          <SoftLine className="h-11 w-full rounded-lg" />
          <div className={hairlineFrame}>
            <div className="border-b border-black/[0.06] px-5 py-4 dark:border-white/[0.06]">
              <SoftLine className="h-5 w-24" />
            </div>
            <div className="divide-y divide-black/[0.06] dark:divide-white/[0.06]">
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-4">
                  <SoftLine className="h-4 w-28" />
                  <SoftLine className="h-4 w-5" />
                </div>
              ))}
            </div>
          </div>
          <SoftLine className="h-11 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}

/** Profile → Products: "Products" title + "Manage products" link, a format heading, a two-column grid. */
export function CreatorStudioProductsPreviewSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading products">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2.5">
          <SoftLine className="h-7 w-32" />
          <SoftLine className="h-4 w-44" />
        </div>
        <SoftLine className="h-5 w-36" />
      </div>
      <section className="space-y-4">
        <SoftLine className="h-4 w-24" />
        <div className="grid min-w-0 grid-cols-1 gap-6 sm:grid-cols-2">
          {Array.from({ length: 4 }, (_, i) => (
            <CreatorProductCardSkeleton key={i} />
          ))}
        </div>
      </section>
    </div>
  );
}

/** Status filter underline row · horizontal service rows (cover left, details right). */
export function CreatorStudioServicesTabSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading services">
      <div className="flex items-center justify-between gap-6 border-b border-black/[0.06] dark:border-white/[0.06]">
        <div className="flex gap-6">
          {['w-10', 'w-14', 'w-14', 'w-16'].map((width, i) => (
            <SoftLine key={i} className={`my-4 h-4 ${width}`} />
          ))}
        </div>
        <div className="flex items-center gap-3 py-2">
          <SoftLine className="hidden h-10 w-28 rounded-lg sm:block" />
          <SoftLine className="h-10 w-10 rounded-lg sm:w-32" />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {Array.from({ length: 3 }, (_, i) => (
          <article key={i} className="rounded-xl bg-white p-3 dark:bg-[#111111] sm:p-4">
            <div className="flex flex-col gap-5 md:flex-row md:gap-6">
              <div className={`aspect-[16/10] w-full shrink-0 !rounded-lg md:aspect-[4/3] md:w-[260px] lg:w-[300px] ${softBlock}`} />
              <div className="flex min-w-0 flex-1 flex-col px-1 pb-1 md:py-1.5">
                <SoftLine className="h-3 w-24" />
                <SoftLine className="mt-3 h-6 w-1/2" />
                <SoftLine className="mt-4 h-4 w-full" />
                <SoftLine className="mt-2 h-4 w-3/4" />
                <div className="mt-4 flex gap-1.5">
                  <SoftLine className="h-6 w-16 !rounded-full" />
                  <SoftLine className="h-6 w-20 !rounded-full" />
                </div>
                <div className="mt-auto pt-5">
                  <div className="flex items-end justify-between border-t border-black/[0.06] pt-4 dark:border-white/[0.07]">
                    <SoftLine className="h-4 w-28" />
                    <SoftLine className="h-6 w-20" />
                  </div>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function CreatorStudioVisitorsTabSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading visitors">
      <div className="space-y-2">
        <SkeletonLine className="h-6 w-28" />
        <SkeletonLine className="h-4 w-56" />
      </div>
      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 border-b border-neutral-200 px-5 py-4 last:border-b-0 dark:border-neutral-800"
          >
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

function CreatorStudioImagesTabSkeleton() {
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

function CreatorStudioSubscribersTabSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading subscribers">
      <div className="space-y-2">
        <SkeletonLine className="h-6 w-32" />
        <SkeletonLine className="h-4 w-56" />
      </div>
      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 border-b border-neutral-200 px-5 py-4 last:border-b-0 dark:border-neutral-800"
          >
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

/** Editorial field blocks: label + value lines, hairline between blocks — same rhythm as General info. */
function InformationFieldBlocks() {
  return (
    <>
      <section className="grid grid-cols-1 gap-x-8 gap-y-7 border-b border-black/[0.05] py-8 dark:border-white/[0.04] sm:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        {['w-3/4', 'w-1/2'].map((width, i) => (
          <div key={i} className="space-y-3">
            <SoftLine className="h-4 w-20" />
            <SoftLine className={`h-5 ${width}`} />
          </div>
        ))}
        <div className="space-y-3 sm:col-span-2">
          <SoftLine className="h-4 w-12" />
          <SoftLine className="h-5 w-full" />
          <SoftLine className="h-5 w-2/3" />
        </div>
      </section>
      <section className="grid grid-cols-1 gap-x-8 gap-y-7 border-b border-black/[0.05] py-8 dark:border-white/[0.04] sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="space-y-3">
            <SoftLine className="h-4 w-20" />
            <SoftLine className="h-5 w-32" />
          </div>
        ))}
      </section>
      <section className="grid grid-cols-1 gap-x-8 gap-y-7 py-8 sm:grid-cols-2">
        {Array.from({ length: 2 }, (_, i) => (
          <div key={i} className="space-y-3">
            <SoftLine className="h-4 w-28" />
            <SoftLine className="h-5 w-40" />
          </div>
        ))}
      </section>
    </>
  );
}

/**
 * `pills` — Profile → Information: section pills above one bordered card.
 * `rail` — My Portfolio: sections rail on the left, card with the floating profile header.
 */
export function CreatorStudioProfileTabSkeleton({ layout = 'pills' }: { layout?: 'pills' | 'rail' }) {
  if (layout === 'pills') {
    return (
      <div className="grid items-start gap-8" aria-busy="true" aria-label="Loading profile information">
        <div className="flex gap-2.5 overflow-hidden">
          {['w-28', 'w-24', 'w-20', 'w-24'].map((width, i) => (
            <SoftLine key={i} className={`h-10 shrink-0 !rounded-full ${width}`} />
          ))}
        </div>
        <div className="rounded-lg border border-black/10 bg-white px-5 dark:border-white/[0.06] dark:bg-[#0F0F0F] sm:px-7">
          <InformationFieldBlocks />
        </div>
      </div>
    );
  }

  return (
    <div
      className="grid items-start gap-5 pt-12 sm:pt-14 md:grid-cols-[15.5rem_minmax(0,1fr)] md:gap-6"
      aria-busy="true"
      aria-label="Loading profile information"
    >
      <div className={`hidden overflow-hidden rounded-lg md:block ${APP_FIELD} dark:bg-white/[0.06]`}>
        <div className="flex h-12 items-center border-b border-black/[0.04] px-3 dark:border-white/[0.04]">
          <SoftLine className="h-3.5 w-20" />
        </div>
        <div className="flex flex-col gap-2.5 px-2 pb-2 pt-1">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="flex min-h-11 items-center gap-2.5 px-3 py-3">
              <SoftLine className="h-4 w-4" />
              <SoftLine className="h-4 w-24" />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-black/10 bg-white dark:border-white/[0.06] dark:bg-[#0F0F0F]">
        <div className="px-5 pb-5 sm:px-7 sm:pb-6">
          <div className="-mt-12 flex flex-col items-center gap-4 sm:-mt-14 sm:flex-row sm:items-end sm:gap-4">
            <div className="shrink-0 rounded-full bg-white p-1 dark:bg-[#0F0F0F]">
              <div className={`h-24 w-24 !rounded-full sm:h-28 sm:w-28 ${softBlock}`} />
            </div>
            <div className="flex flex-col items-center gap-2.5 sm:items-start sm:pb-1.5">
              <SoftLine className="h-6 w-52" />
              <SoftLine className="h-3 w-36" />
            </div>
          </div>
        </div>
        <div className="flex gap-6 overflow-hidden border-b border-black/[0.08] px-5 dark:border-white/[0.1] md:hidden">
          {['w-20', 'w-12', 'w-20', 'w-12'].map((width, i) => (
            <SoftLine key={i} className={`mb-3 h-4 shrink-0 ${width}`} />
          ))}
        </div>
        <div className="px-5 sm:px-7">
          <InformationFieldBlocks />
        </div>
      </div>
    </div>
  );
}

export function CreatorStudioTabPanelSkeleton({ tab }: { tab: CreatorStudioTab }) {
  switch (tab) {
    case 'content':
      return <CreatorStudioContentTabSkeleton />;
    case 'services':
      return <CreatorStudioServicesTabSkeleton />;
    case 'products':
      return <CreatorStudioProductsPreviewSkeleton />;
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

/** Whole My Profile page while the header loads — same frame, card, tab strip and Manage rail as `CreatorStudioShell`. */
export function CreatorStudioHubSkeleton({ tab }: { tab: CreatorStudioTab }) {
  return (
    <div
      className="mx-auto w-full max-w-[1400px] px-0 pb-16 pt-2 sm:px-8 sm:pt-4 md:px-12 lg:px-16"
      aria-busy="true"
      aria-label="Loading creator studio"
    >
      <CreatorStudioHeaderSkeleton />

      <div className="mt-12 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_15rem] xl:gap-16">
        <div className="min-w-0">
          <div className="flex gap-8 overflow-hidden border-b border-black/[0.06] px-5 dark:border-white/[0.08] sm:px-0 lg:hidden">
            {CREATOR_STUDIO_TABS.map((item) => (
              <SoftLine key={item.id} className="my-4 h-4 w-16 shrink-0" />
            ))}
          </div>
          <div className={`py-10 sm:py-12 lg:pt-0 ${tab === 'content' ? '' : 'px-5 sm:px-0'}`}>
            <CreatorStudioTabPanelSkeleton tab={tab} />
          </div>
        </div>

        <div className="hidden lg:block">
          <div className="flex h-14 items-center border-b border-black/[0.05] px-5 dark:border-white/[0.05]">
            <SoftLine className="h-3.5 w-16" />
          </div>
          <div className="flex flex-col gap-1.5 px-2.5 py-3">
            {CREATOR_STUDIO_TABS.map((item) => (
              <div key={item.id} className="flex min-h-[3.25rem] items-center gap-3.5 px-3 py-3.5">
                <SoftLine className="h-4 w-4" />
                <SoftLine className="h-4 w-24" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function CreatorStudioProductViewSkeleton() {
  return (
    <div className="mx-auto max-w-7xl space-y-10 pb-20" aria-busy="true" aria-label="Loading product">
      <SoftLine className="h-4 w-28" />
      <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
        <div className="space-y-10 lg:col-span-8">
          <div className={`aspect-[16/10] w-full rounded-lg ${softBlock}`} />
          <div className="space-y-5">
            <div className="flex gap-2">
              <SoftLine className="h-7 w-32 rounded-full" />
              <SoftLine className="h-7 w-24 rounded-full" />
            </div>
            <SoftLine className="h-10 w-1/2" />
            <SoftLine className="h-5 w-40" />
            <SoftLine className="h-4 w-3/4" />
          </div>
        </div>
        <div className="lg:col-span-4">
          <div className={`p-5 ${hairlineFrame}`}>
            <SoftLine className="h-4 w-20" />
            <SoftLine className="mt-6 h-9 w-28" />
            <SoftLine className="mt-6 h-16 w-full rounded-lg" />
            <SoftLine className="mt-5 h-11 w-full rounded-lg" />
            <SoftLine className="mt-2 h-11 w-full rounded-lg" />
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
