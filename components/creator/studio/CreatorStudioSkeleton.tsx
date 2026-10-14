import type { ReactNode } from 'react';
import { creatorProductGridClassName } from '@/components/creator/CreatorProductCard';
import { CREATOR_STUDIO_TABS, type CreatorStudioTab } from '@/components/creator/studio/types';

const block = 'animate-pulse rounded bg-neutral-200 dark:bg-neutral-700';

function SkeletonLine({ className = '' }: { className?: string }) {
  return <div className={`${block} ${className}`} aria-hidden />;
}

const softBlock = 'animate-pulse rounded-md bg-black/[0.06] dark:bg-white/[0.06]';

function SoftLine({ className = '' }: { className?: string }) {
  return <div className={`${softBlock} ${className}`} aria-hidden />;
}

/* The redesigned page's own surfaces, written out (the skeleton can paint before the `.news-theme`
   scope exists): post cards in the News card tone, the rail's outlined box (`.gn-rail-box`). */
const cardTone = 'bg-[#F7F9F9] dark:bg-[#16181C]';
const railBox = 'shadow-[inset_0_0_0_1px_#D6DEE3] dark:shadow-[inset_0_0_0_1px_#1F2226]';

/** A 20px stroke glyph's place (RailGlyph) next to a label. */
function GlyphRow({ width, className = '' }: { width: string; className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <SoftLine className="h-5 w-5 shrink-0 !rounded-full" />
      <SoftLine className={`h-4 ${width}`} />
    </div>
  );
}

/** A tab's title (20px) over its one-line description, as `StudioSectionHeading` sets them. */
function TabHeadingSkeleton({ titleWidth = 'w-28', withStat = false }: { titleWidth?: string; withStat?: boolean }) {
  return (
    <div className="flex items-end justify-between gap-6 px-4 sm:px-0">
      <div className="min-w-0 space-y-2">
        <SoftLine className={`h-6 ${titleWidth}`} />
        <SoftLine className="h-4 w-72 max-w-full" />
      </div>
      {withStat ? (
        <div className="flex shrink-0 items-baseline gap-2">
          <SoftLine className="h-10 w-16" />
          <SoftLine className="h-4 w-12" />
        </div>
      ) : null}
    </div>
  );
}

/** Matches `HorizontalProfileHeader` as My Profile renders it (`railAligned`): no fill, straight on
 *  the page, `px-4 py-6 sm:px-0 sm:pt-6`, avatar · identity · a 20rem stats
 *  column of three drawers split by hairlines — so nothing jumps when the real header lands. */
function CreatorStudioHeaderSkeleton() {
  return (
    <div className="border-b border-[#E1E8ED] px-5 pb-6 pt-5 dark:border-[#2F3336] sm:px-0 sm:pt-6 sm:pb-10">
      {/* Phones: MobileProfileHeader — centred avatar, name, two short lines, one row of buttons. */}
      <div className="flex flex-col items-center sm:hidden">
        <div className={`h-[104px] w-[104px] !rounded-full ${softBlock}`} />
        <SoftLine className="mt-4 h-6 w-48" />
        <SoftLine className="mt-2 h-4 w-32" />
        <SoftLine className="mt-3 h-4 w-44" />
        <SoftLine className="mt-2 h-3.5 w-52" />
        <div className="mt-5 flex w-full gap-2">
          <SoftLine className="h-10 flex-1 !rounded-lg" />
          <SoftLine className="h-10 flex-1 !rounded-lg" />
          <SoftLine className="h-10 w-10 !rounded-lg" />
        </div>
      </div>
      <div className="hidden grid-cols-[96px_minmax(0,1fr)] items-center gap-x-4 gap-y-4 sm:grid sm:grid-cols-[12rem_minmax(0,1fr)] sm:gap-x-8 md:grid-cols-[14rem_minmax(0,1fr)] md:gap-x-10 lg:grid-cols-[14rem_minmax(0,1fr)_20rem] lg:gap-x-8 xl:gap-x-12">
        <div className="col-start-1 row-start-1 sm:row-span-2 sm:self-center">
          <div className={`aspect-square w-full !rounded-full ${softBlock}`} />
        </div>

        <div className="col-start-2 row-start-1 flex min-w-0 flex-col gap-2.5 sm:self-end">
          <SoftLine className="h-8 w-72 max-w-full" />
          <SoftLine className="h-4 w-48 max-w-full" />
        </div>

        <div className="col-span-2 flex min-w-0 flex-col gap-3 sm:col-span-1 sm:col-start-2 sm:row-start-2 sm:mt-3 sm:self-start">
          <SoftLine className="h-4 w-36" />
          <SoftLine className="h-4 w-44" />
          <SoftLine className="h-4 w-full max-w-xl" />
          <SoftLine className="h-4 w-4/5 max-w-md" />
        </div>

        <div className="hidden lg:col-start-3 lg:row-span-2 lg:row-start-1 lg:block lg:self-center">
          <div className="flex flex-col divide-y divide-[#CFD9DE] dark:divide-[#2F3336]">
            {['w-24', 'w-16', 'w-28'].map((width) => (
              <div key={width} className="flex flex-col gap-2 py-4">
                <SoftLine className="h-6 w-8" />
                <SoftLine className={`h-3.5 ${width}`} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** A News card (NewsFeedPostCard): square, tonal, 40px avatar, two lines, framed media, actions. */
function ContentPostCardSkeleton() {
  return (
    <article className={`overflow-hidden ${cardTone}`}>
      <div className="flex items-center gap-3 px-5 pt-4">
        <div className={`h-10 w-10 shrink-0 !rounded-full ${softBlock}`} />
        <div className="min-w-0 flex-1 space-y-1.5">
          <SoftLine className="h-4 w-36" />
          <SoftLine className="h-3.5 w-24" />
        </div>
      </div>
      <div className="space-y-2 px-5 pt-3">
        <SoftLine className="h-4 w-11/12" />
        <SoftLine className="h-4 w-2/3" />
      </div>
      <div className={`mt-3 aspect-[4/3] w-full !rounded-none ${softBlock}`} />
      <div className="flex items-center gap-4 px-4 py-2">
        <SoftLine className="h-9 w-9 !rounded-full" />
        <SoftLine className="h-9 w-9 !rounded-full" />
        <SoftLine className="h-9 w-9 !rounded-full" />
        <SoftLine className="ml-auto h-9 w-9 !rounded-full" />
      </div>
    </article>
  );
}

/** Post list only — the Content tab keeps its headline and status tabs on screen while loading. */
export function CreatorStudioContentPostsSkeleton({ count = 2 }: { count?: number }) {
  return (
    <div className="flex w-full flex-col gap-2 sm:gap-5" aria-busy="true" aria-label="Loading content">
      {Array.from({ length: count }, (_, i) => (
        <ContentPostCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * CreatorStudioContentTab: from xl the status bar in the left gutter (four 40px glyph buttons; from
 * 2xl with their labels, in a 128px column), the 640px posts column centred — from 2xl 712px, 160px
 * in and ending with the bio column; below xl the text tabs under the title.
 */
function CreatorStudioContentTabSkeleton() {
  return (
    <div className="relative w-full" aria-busy="true" aria-label="Loading content">
      <div className="absolute left-0 top-0 hidden flex-col gap-2 xl:flex 2xl:w-32">
        {['w-20', 'w-14', 'w-16', 'w-12'].map((width) => (
          <div key={width} className="flex h-10 items-center gap-3">
            <SoftLine className="h-10 w-10 shrink-0 !rounded-full 2xl:h-5 2xl:w-5" />
            <SoftLine className={`hidden h-4 2xl:block ${width}`} />
          </div>
        ))}
      </div>
      <div className="mx-auto w-full max-w-[640px] 2xl:ml-[160px] 2xl:mr-0 2xl:max-w-[712px]">
        <div className="space-y-2 px-4 sm:px-0">
          <SoftLine className="h-6 w-28" />
          <SoftLine className="h-4 w-64 max-w-full" />
        </div>
        <div className="mt-4 flex gap-6 px-4 sm:px-0 xl:hidden">
          {['w-20', 'w-14', 'w-16', 'w-12'].map((width) => (
            <SoftLine key={width} className={`my-3 h-4 ${width}`} />
          ))}
        </div>
        <div className="mt-4 sm:mt-6">
          <CreatorStudioContentPostsSkeleton />
        </div>
      </div>
    </div>
  );
}

function CreatorProductCardSkeleton() {
  return (
    <article className={`flex w-full flex-col ${cardTone}`}>
      <div className={`aspect-[4/3] w-full ${softBlock} rounded-none`} />
      <div className="space-y-2.5 p-5">
        <SoftLine className="h-3 w-16" />
        <SoftLine className="h-5 w-4/5" />
        <SoftLine className="h-4 w-28" />
        <div className="flex items-center justify-between pt-3">
          <SoftLine className="h-5 w-16" />
          <SoftLine className="h-9 w-9 rounded-full" />
        </div>
      </div>
    </article>
  );
}

/** "My products" while it loads: the News frame — tabs, section line, grid, then the rail from lg. */
export function CreatorStudioProductsTabSkeleton({ insetOnMobile = false }: { insetOnMobile?: boolean }) {
  const inset = insetOnMobile ? 'px-5 sm:px-0' : '';
  return (
    <div
      className="grid w-full items-start gap-8 pb-24 pt-2 sm:pt-4 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-10 lg:pt-3 xl:grid-cols-[minmax(0,1fr)_400px] xl:gap-12"
      aria-busy="true"
      aria-label="Loading products"
    >
      <div className="flex min-w-0 flex-col gap-3">
        <div className={`flex gap-8 pb-3.5 pt-3.5 shadow-[inset_0_-1px_0_#EFF3F4] dark:shadow-[inset_0_-1px_0_#2F3336] ${inset}`}>
          <SoftLine className="h-5 w-24" />
          <SoftLine className="h-5 w-16" />
        </div>
        <div className={`flex min-h-8 items-center justify-between gap-4 pt-2 ${inset}`}>
          <SoftLine className="h-3 w-36" />
          <SoftLine className="h-3 w-40" />
        </div>
        <SoftLine className={`h-6 w-28 ${insetOnMobile ? 'mx-5 sm:mx-0' : ''}`} />
        <div className={creatorProductGridClassName}>
          {Array.from({ length: 6 }, (_, i) => (
            <CreatorProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
      <div className="hidden flex-col gap-6 lg:flex" aria-hidden>
        <SoftLine className="h-11 w-full rounded-full" />
        <SoftLine className="h-12 w-full rounded-full" />
        <div className={`h-[200px] ${railBox}`} />
        <div className={`h-[260px] ${railBox}`} />
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

/* My services bones: the field tone (#EFF3F4 / #202327) — the tone the service media already sit on —
   so they read on the filled rows and on the page ground alike. */
const serviceBone = 'animate-pulse rounded bg-[#EFF3F4] dark:bg-[#202327]';

function ServiceBone({ className = '' }: { className?: string }) {
  return <div aria-hidden className={`${serviceBone} ${className}`} />;
}

/** One service row: media · specialty, title, two description lines, status · delivery · price · ↗ ⋮. */
function ServiceRowSkeleton() {
  return (
    <div
      aria-hidden
      className="flex flex-col gap-3 bg-[#F7F9F9] p-3 dark:bg-[#16181C] sm:flex-row sm:items-center sm:gap-5 sm:p-4"
    >
      <div
        className={`aspect-[16/9] w-full shrink-0 !rounded-none sm:aspect-auto sm:h-28 sm:w-44 sm:self-start md:h-[136px] md:w-52 ${serviceBone}`}
      />
      <div className="min-w-0 flex-1 px-1 sm:px-0">
        <ServiceBone className="h-3 w-16" />
        <ServiceBone className="mt-2 h-[18px] w-48 max-w-full" />
        <ServiceBone className="mt-2.5 h-3.5 w-full max-w-sm" />
        <ServiceBone className="mt-1.5 h-3.5 w-2/3 max-w-xs" />
        <ServiceBone className="mt-3 h-3 w-36" />
      </div>
      {/* Phones: price left, actions right under a hairline. From sm: the price column (eyebrow over
          the figure, right-aligned, 160px) then the actions. */}
      <div className="flex items-center justify-between gap-3 border-t border-black/[0.06] px-1 pt-2 dark:border-white/[0.07] sm:contents">
        <div className="flex items-baseline gap-1.5 sm:w-40 sm:shrink-0 sm:flex-col sm:items-end sm:gap-1.5">
          <ServiceBone className="h-2.5 w-12" />
          <ServiceBone className="h-[18px] w-20" />
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          <ServiceBone className="h-9 w-9 !rounded-full" />
          <ServiceBone className="h-9 w-9 !rounded-full" />
        </div>
      </div>
    </div>
  );
}

/** A rail box row (Specialty): 48px tall, 24px side padding — glyph, label, count. */
function ServiceRailRow({ label, withCount = true }: { label: string; withCount?: boolean }) {
  return (
    <div className="flex items-center gap-3 px-6 py-3.5">
      <ServiceBone className="h-5 w-5 shrink-0 !rounded-full" />
      <ServiceBone className={`h-4 ${label}`} />
      {withCount ? <ServiceBone className="ml-auto h-3 w-3" /> : null}
    </div>
  );
}

/**
 * Mirrors My services on its exact layout (CreatorStudioServicesTab):
 *  - `withHeader` (the My services page): below lg the page header — title, hourly rate, a full-width
 *    "New service" on phones — then "■ N services · N / 8 slots", the underline status tabs and the
 *    service rows; from lg the same list beside the sticky rail — the "My services" box (title,
 *    subtitle, hourly rate), the Specialty box, the "View as a client" row and the "New service" pill.
 *  - without it (studio tab): the status tabs and the rows only.
 */
export function CreatorStudioServicesTabSkeleton({ withHeader = false }: { withHeader?: boolean }) {
  const inset = withHeader ? 'px-5 sm:px-0' : '';

  const list = (
    <div
      className={`flex w-full min-w-0 flex-col gap-6 pb-24 sm:gap-10 ${withHeader ? 'pt-4 sm:pt-10 lg:pt-6' : ''}`}
      aria-busy="true"
      aria-label="Loading services"
    >
      {withHeader ? (
        <div className={`grid grid-cols-1 gap-y-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start sm:gap-x-6 lg:hidden ${inset}`}>
          <div className="min-w-0 space-y-2">
            <ServiceBone className="h-6 w-36" />
            <ServiceBone className="hidden h-4 w-72 max-w-full sm:block" />
          </div>
          <ServiceBone className="order-3 mt-1 h-11 w-full !rounded-full sm:order-none sm:mt-0 sm:h-9 sm:w-32" />
          <ServiceBone className="order-2 h-4 w-56 max-w-full sm:order-none sm:col-span-2" />
        </div>
      ) : null}

      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          {withHeader ? (
            <div className="flex min-h-8 items-center justify-between gap-4 px-5 sm:px-1 lg:min-h-0">
              <div className="flex items-center gap-2.5">
                <ServiceBone className="h-1.5 w-1.5 !rounded-none" />
                <ServiceBone className="h-3 w-20" />
              </div>
              <ServiceBone className="h-3 w-20" />
            </div>
          ) : null}
          <div
            className={`flex items-center gap-5 shadow-[inset_0_-1px_0_#EFF3F4] dark:shadow-[inset_0_-1px_0_#2F3336] sm:gap-8 ${
              withHeader ? 'mx-5 sm:mx-0' : ''
            }`}
          >
            {['w-10', 'w-16', 'w-14', 'w-16'].map((width, i) => (
              <ServiceBone key={i} className={`my-4 h-4 ${width}`} />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }, (_, i) => (
            <ServiceRowSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );

  if (!withHeader) return list;

  return (
    <div className="grid w-full items-start lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-10 xl:grid-cols-[minmax(0,1fr)_400px] xl:gap-12">
      {list}
      <div className="hidden flex-col gap-6 self-start pt-6 lg:flex" aria-hidden>
        {/* "My services" box: title, two subtitle lines, then the hourly rate under a hairline. */}
        <div className="gn-rail-box flex flex-col px-px pb-5 pt-5">
          <ServiceBone className="mx-6 mb-3 mt-1 h-5 w-36" />
          <ServiceBone className="mx-6 h-3.5 w-64 max-w-[calc(100%-3rem)]" />
          <div className="mx-6 mt-4 border-t border-[color:var(--gn-line)] pt-4">
            <ServiceBone className="h-4 w-48" />
          </div>
        </div>

        {/* Specialty box: All + the specialties in use, each with its count. */}
        <div className="gn-rail-box flex flex-col px-px pb-2 pt-5">
          <ServiceBone className="mx-6 mb-3 mt-1 h-5 w-28" />
          <ServiceRailRow label="w-10" />
          <ServiceRailRow label="w-20" />
          <ServiceRailRow label="w-24" />
        </div>

        {/* "View as a client" row: circle glyph, title over one line, chevron. */}
        <div className="gn-rail-box flex items-center gap-4 px-6 py-4">
          <ServiceBone className="h-11 w-11 shrink-0 !rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <ServiceBone className="h-4 w-32" />
            <ServiceBone className="h-3.5 w-48 max-w-full" />
          </div>
          <ServiceBone className="h-4 w-4 shrink-0" />
        </div>

        <ServiceBone className="h-12 w-full !rounded-full" />
      </div>
    </div>
  );
}

/**
 * Visitors / Subscribers (studio-list-ui): the heading with its large figure on the right, then the
 * list open on the page — a small-caps day label over rows of a 44px avatar, two lines, the date.
 */
function PeopleListSkeleton({ label }: { label: string }) {
  return (
    <div className="space-y-6" aria-busy="true" aria-label={label}>
      <TabHeadingSkeleton withStat />
      {[3, 4].map((rows, group) => (
        <div key={group}>
          <SoftLine className="mx-4 mb-2 h-3 w-16 sm:mx-0" />
          {Array.from({ length: rows }, (_, i) => (
            <div key={i} className="flex min-h-[68px] items-center gap-3.5 px-4 py-3 sm:px-0">
              <div className={`h-11 w-11 shrink-0 !rounded-full ${softBlock}`} />
              <div className="min-w-0 flex-1 space-y-2">
                <SoftLine className="h-4 w-40" />
                <SoftLine className="h-3 w-28" />
              </div>
              <SoftLine className="h-3 w-8" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function CreatorStudioVisitorsTabSkeleton() {
  return <PeopleListSkeleton label="Loading visitors" />;
}

function CreatorStudioSubscribersTabSkeleton() {
  return <PeopleListSkeleton label="Loading subscribers" />;
}

/** Photos (CreatorStudioImagesTab): the bento — the current photo 2×2, the others 4:5 around it. */
function CreatorStudioImagesTabSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading photos">
      <TabHeadingSkeleton titleWidth="w-24" />
      <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 sm:gap-x-4">
        <div className="col-span-2 flex flex-col sm:row-span-2">
          <div className={`aspect-[4/5] w-full !rounded-none sm:aspect-auto sm:flex-1 ${softBlock}`} />
          <SoftLine className="mt-2 h-3.5 w-44" />
        </div>
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i}>
            <div className={`aspect-[4/5] w-full !rounded-none ${softBlock}`} />
            <SoftLine className="mt-2 h-3.5 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** General Info (PortfolioGeneralInfoStudio): small-caps block titles over outlined fields. */
function InformationFieldBlocks() {
  const field = 'h-10 w-full rounded-md border border-[#CFD9DE] dark:border-[#333639]';
  return (
    <>
      <section className="grid grid-cols-1 gap-x-6 gap-y-6 pb-6 pt-2">
        <SoftLine className="h-3 w-16" />
        <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          {['w-12', 'w-16'].map((width) => (
            <div key={width} className="space-y-2">
              <SoftLine className={`h-3.5 ${width}`} />
              <div className={field} />
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <SoftLine className="h-3.5 w-8" />
          <div className={`${field} !h-[76px]`} />
        </div>
      </section>
      <section className="grid grid-cols-1 gap-x-6 gap-y-6 py-6 sm:grid-cols-2 lg:grid-cols-3">
        <SoftLine className="col-span-full h-3 w-14" />
        {['w-12', 'w-14', 'w-20'].map((width) => (
          <div key={width} className="space-y-2">
            <SoftLine className={`h-3.5 ${width}`} />
            <div className={field} />
          </div>
        ))}
      </section>
      <section className="grid grid-cols-1 gap-x-6 gap-y-6 pb-8 pt-6 sm:grid-cols-2">
        <SoftLine className="col-span-full h-3 w-24" />
        {['w-28', 'w-20'].map((width) => (
          <div key={width} className="space-y-2">
            <SoftLine className={`h-3.5 ${width}`} />
            <div className={field} />
          </div>
        ))}
      </section>
    </>
  );
}

/* ── My Profile → Profile, read mode (ProfileSectionsOverview) ───────────────────────────────── */

/**
 * A section's heading line: the 17px bold name on the left; on the right who can see it (a 32px pill)
 * and "Edit". `picker: false` for the sections without a picker of their own.
 */
function ProfileSectionHeadingSkeleton({ titleWidth, picker = true }: { titleWidth: string; picker?: boolean }) {
  return (
    <div className="mb-3 flex min-h-10 items-center justify-between gap-3 px-1">
      <SoftLine className={`h-[18px] ${titleWidth}`} />
      <div className="flex items-center gap-4">
        {picker ? <SoftLine className="h-8 w-[4.5rem] !rounded-full" /> : null}
        <SoftLine className="h-4 w-10" />
      </div>
    </div>
  );
}

/** The section's block: square, the module tone, edge to edge on phones (as `BLOCK_CLASS`). */
function ProfileBlockSkeleton({ children }: { children: ReactNode }) {
  return <div className={`-mx-4 px-5 py-5 sm:mx-0 sm:p-6 ${cardTone}`}>{children}</div>;
}

/** General Info's sheet: label · value · who-sees-it per row, a faint divider between rows. */
function ProfileSheetSkeleton({ rows }: { rows: [string, string][] }) {
  return (
    <div className="divide-y divide-[#EFF3F4] dark:divide-[#202327]">
      {rows.map(([labelWidth, valueWidth], i) => (
        <div
          key={i}
          className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 py-3.5 first:pt-0 last:pb-0 sm:grid-cols-[10rem_minmax(0,1fr)_auto]"
        >
          <SoftLine className={`col-start-1 h-3.5 ${labelWidth}`} />
          <SoftLine className={`col-start-1 h-4 ${valueWidth} sm:col-start-2 sm:row-start-1`} />
          <SoftLine className="col-start-2 row-span-2 row-start-1 h-8 w-[4.5rem] !rounded-full sm:col-start-3 sm:row-span-1" />
        </div>
      ))}
    </div>
  );
}

/** A cloud of 36px chips (languages, stack): `logo` adds the 20px tool logo's place. */
function ProfileChipsSkeleton({ widths, logo = false }: { widths: string[]; logo?: boolean }) {
  return (
    <div className="flex flex-wrap gap-2">
      {widths.map((width, i) => (
        <div key={i} className={`flex h-9 items-center gap-2 rounded-full bg-white px-3 dark:bg-[#202327] ${width}`}>
          {logo ? <SoftLine className="h-5 w-5 shrink-0 !rounded-full" /> : null}
          <SoftLine className="h-3.5 flex-1" />
        </div>
      ))}
    </div>
  );
}

/**
 * My Profile's sections while the profile loads — the read view exactly, so nothing jumps when it
 * lands: the text menu with its hairline (the first tab marked), then General Info's sheet, Languages,
 * My Role, Stack and FAQ, each a heading line over its square tonal block.
 */
function ProfileSectionsSkeleton() {
  return (
    <div className="flex flex-col gap-8 sm:gap-10" aria-busy="true" aria-label="Loading profile information">
      <div className="-mx-4 flex gap-7 overflow-hidden border-b border-[#EFF3F4] px-4 dark:border-[#2F3336] sm:mx-0 sm:px-0">
        {['w-20', 'w-14', 'w-11', 'w-10', 'w-9', 'w-8', 'w-14'].map((width, i) => (
          <div key={i} className="relative flex h-12 shrink-0 items-center">
            <SoftLine className={`h-4 ${width}`} />
            {i === 0 ? <span aria-hidden className="absolute inset-x-0 bottom-0 h-[2px] rounded-full bg-black/[0.12] dark:bg-white/[0.14]" /> : null}
          </div>
        ))}
      </div>

      <section>
        <ProfileSectionHeadingSkeleton titleWidth="w-28" picker={false} />
        <ProfileBlockSkeleton>
          <ProfileSheetSkeleton
            rows={[
              ['w-20', 'w-16'],
              ['w-24', 'w-36'],
              ['w-24', 'w-20'],
              ['w-14', 'w-12'],
              ['w-16', 'w-44'],
              ['w-20', 'w-28'],
              ['w-24', 'w-20'],
            ]}
          />
        </ProfileBlockSkeleton>
      </section>

      <section>
        <ProfileSectionHeadingSkeleton titleWidth="w-24" />
        <ProfileBlockSkeleton>
          <ProfileChipsSkeleton widths={['w-32', 'w-36', 'w-32', 'w-24']} />
        </ProfileBlockSkeleton>
      </section>

      <section>
        <ProfileSectionHeadingSkeleton titleWidth="w-20" picker={false} />
        <ProfileBlockSkeleton>
          <div className="max-w-2xl space-y-2.5">
            <SoftLine className="h-[18px] w-56 max-w-full" />
            <SoftLine className="h-4 w-full" />
            <SoftLine className="h-4 w-3/5" />
            <div className="space-y-2.5 pt-2">
              {['w-11/12', 'w-4/5'].map((width) => (
                <div key={width} className="flex items-center gap-3">
                  <SoftLine className="h-4 w-4 shrink-0" />
                  <SoftLine className={`h-4 ${width}`} />
                </div>
              ))}
            </div>
          </div>
        </ProfileBlockSkeleton>
      </section>

      <section>
        <ProfileSectionHeadingSkeleton titleWidth="w-16" />
        <ProfileBlockSkeleton>
          <ProfileChipsSkeleton logo widths={['w-24', 'w-32', 'w-32', 'w-24', 'w-20', 'w-20', 'w-24', 'w-24']} />
        </ProfileBlockSkeleton>
      </section>

      <section>
        <ProfileSectionHeadingSkeleton titleWidth="w-12" />
        <ProfileBlockSkeleton>
          <div className="divide-y divide-[#EFF3F4] dark:divide-[#202327]">
            {['w-3/4', 'w-2/3', 'w-4/5'].map((width) => (
              <div key={width} className="flex min-h-12 items-center justify-between gap-4 py-1 first:pt-0 last:pb-0">
                <SoftLine className={`h-4 ${width}`} />
                <SoftLine className="h-4 w-4 shrink-0" />
              </div>
            ))}
          </div>
        </ProfileBlockSkeleton>
      </section>
    </div>
  );
}

/**
 * `pills` — My Profile → Profile: the read view (ProfileSectionsOverview) — text menu, then sections.
 * `rail` — My Portfolio: sections rail on the left, card with the floating profile header.
 */
export function CreatorStudioProfileTabSkeleton({ layout = 'pills' }: { layout?: 'pills' | 'rail' }) {
  if (layout === 'pills') {
    return (
      <div className="px-4 sm:px-0">
        <ProfileSectionsSkeleton />
      </div>
    );
  }
  /* My Portfolio's editor, shape for shape: the identity block and the form block in the main column,
     the News rail on the right from md (the "Sections" box, then "Your page"). */
  return (
    <div
      className="grid items-start gap-5 md:grid-cols-[minmax(0,1fr)_16.5rem] md:gap-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-10 xl:grid-cols-[232px_minmax(0,1fr)_300px]"
      aria-busy="true"
      aria-label="Loading profile information"
    >
      <div className="hidden flex-col xl:flex">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="flex h-12 items-center gap-4 px-3">
            <SoftLine className="h-5 w-5" />
            <SoftLine className="h-3.5 w-28" />
          </div>
        ))}
      </div>

      <div className="flex min-w-0 flex-col gap-6">
        <div className="flex items-center gap-4 bg-[color:var(--gn-surface)] p-5 sm:p-6">
          <div className={`h-14 w-14 shrink-0 !rounded-full sm:h-16 sm:w-16 ${softBlock}`} />
          <div className="flex flex-col gap-2.5">
            <SoftLine className="h-5 w-48" />
            <SoftLine className="h-3 w-64" />
          </div>
        </div>
        <div className="bg-[color:var(--gn-surface)]">
          <div className="flex gap-2 overflow-hidden px-5 pt-4 md:hidden">
            {['w-24', 'w-16', 'w-24', 'w-16'].map((width, i) => (
              <SoftLine key={i} className={`h-10 shrink-0 !rounded-full ${width}`} />
            ))}
          </div>
          <div className="px-5 sm:px-7">
            <InformationFieldBlocks />
          </div>
        </div>
      </div>

      <div className="hidden flex-col gap-6 md:flex">
        <div className="gn-rail-box flex flex-col px-px pb-3 pt-5">
          <SoftLine className="mx-6 mb-3 h-5 w-28" />
          {Array.from({ length: 9 }, (_, i) => (
            <div key={i} className="flex items-center gap-3 px-6 py-2.5">
              <SoftLine className="h-5 w-5" />
              <SoftLine className="h-3.5 w-28" />
            </div>
          ))}
        </div>
        <SoftLine className="h-12 w-full !rounded-full" />
        <div className="flex flex-col xl:hidden">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="flex h-12 items-center gap-4 px-3">
              <SoftLine className="h-5 w-5" />
              <SoftLine className="h-3.5 w-28" />
            </div>
          ))}
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

/**
 * Whole My Profile page while the header loads — CreatorStudioShell's layout exactly: the header,
 * then the tab panel and, from lg, the 320px rail: the outlined "Manage" box (title, seven 48px
 * glyph rows) over the "Publish a post" pill, 24px apart.
 */
export function CreatorStudioHubSkeleton({ tab }: { tab: CreatorStudioTab }) {
  return (
    <div
      className="mx-auto w-full max-w-[1368px] pb-16 pt-0 sm:px-8 md:px-12 lg:px-16"
      aria-busy="true"
      aria-label="Loading creator studio"
    >
      <CreatorStudioHeaderSkeleton />

      <div className="mt-1 grid items-start gap-8 sm:mt-6 lg:mt-0 lg:grid-cols-[minmax(0,1fr)_20rem] xl:gap-12">
        <div className="min-w-0 lg:pt-8">
          <div className="flex gap-8 overflow-hidden px-4 sm:px-0 lg:hidden">
            {CREATOR_STUDIO_TABS.map((item) => (
              <SoftLine key={item.id} className="my-4 h-4 w-16 shrink-0" />
            ))}
          </div>
          <div className={`pt-4 sm:pt-6 lg:pt-0 ${tab === 'content' ? '' : 'px-4 sm:px-0'}`}>
            <CreatorStudioTabPanelSkeleton tab={tab} />
          </div>
        </div>

        <div className="hidden flex-col gap-6 pb-8 pt-8 lg:flex">
          <div className={`pb-2 pt-5 ${railBox}`}>
            <SoftLine className="mx-6 mb-3 mt-1 h-6 w-24" />
            {CREATOR_STUDIO_TABS.map((item, i) => (
              <GlyphRow key={item.id} width={['w-20', 'w-16', 'w-16', 'w-14', 'w-14', 'w-24', 'w-14'][i % 7]} className="h-12 px-6" />
            ))}
          </div>
          {tab === 'content' ? <SoftLine className="h-10 w-full !rounded-full" /> : null}
        </div>
      </div>
    </div>
  );
}

export function CreatorStudioProductViewSkeleton() {
  return (
    <div className="space-y-4 pb-20 sm:space-y-6" aria-busy="true" aria-label="Loading product">
      <SoftLine className="mx-4 h-4 w-28 sm:mx-0" />
      {/* The product page's layout: one column, then the 340px rail (400px from xl). */}
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-10 xl:grid-cols-[minmax(0,1fr)_400px] xl:gap-12">
        <div className="min-w-0 space-y-8">
          <div className={`aspect-[16/10] w-full rounded-none ${softBlock}`} />
          <div className="space-y-4 px-4 sm:px-0">
            <SoftLine className="h-9 w-1/2" />
            <SoftLine className="h-4 w-40" />
            <SoftLine className="h-4 w-3/4" />
          </div>
        </div>
        <div className={`order-first mx-4 p-6 sm:mx-0 lg:order-none ${railBox}`}>
          <SoftLine className="h-4 w-28" />
          <SoftLine className="mt-5 h-9 w-28" />
          <SoftLine className="mt-6 h-12 w-full rounded-full" />
          <SoftLine className="mt-3 h-12 w-full rounded-full" />
          <SoftLine className="mt-2 h-11 w-full rounded-full" />
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
