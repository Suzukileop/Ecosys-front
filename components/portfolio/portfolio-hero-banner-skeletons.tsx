'use client';

import type { CSSProperties, ReactNode } from 'react';
import { resolveThumbnailTheme, useThumbnailTheme } from './portfolio-thumbnail-theme';
import type { PortfolioSettings } from './portfolio-settings-types';
import {
  DEFAULT_PORTFOLIO_HERO_BANNER_DESIGN,
  resolveHeroCurrentlyLabel,
  resolveHeroSignatureWord,
  resolveHeroSpecializedInLabel,
  type PortfolioHeroBannerDesign,
} from '@/components/portfolio/portfolio-hero-banner-settings';
import {
  DEFAULT_HERO_PALETTE,
  mergeHeroPalette,
  resolveHeroPaletteColor,
} from '@/components/portfolio/portfolio-hero-palette-settings';
import type { PortfolioHeroSectionSettings } from '@/components/portfolio/portfolio-settings-types';

type HeroBannerSkeletonProps = { preview?: boolean };

/** Shared minimal Swiss editorial silhouette for both catalogue and desktop preview. */
function SwissEditorialSkeletonCanvas() {
  return (
    <div className="absolute inset-0 animate-pulse" style={{ containerType: 'size' }}>
      <span className="absolute left-[6.3%] top-[10%] h-[5%] w-[36%] rounded-[0.3cqw] bg-neutral-800" />
      <span className="absolute bottom-[5.5%] right-[7.2%] top-[17%] w-[37%] rounded-[1.2cqw_43%_0_0] bg-neutral-700 ring-1 ring-inset ring-white/[0.06]" />
      <div className="absolute bottom-[34%] left-[6.3%] flex h-[1.6%] w-[35%] items-center gap-[10%]">
        <span className="block h-full w-[32%] rounded-full bg-neutral-800" />
        <span className="block h-full w-[27%] rounded-full bg-neutral-800" />
      </div>
      <span className="absolute bottom-[5.5%] left-[6.3%] h-[19%] w-[47%] rounded-[0.4cqw] bg-neutral-800" />
    </div>
  );
}

function SwissEditorialHeroBannerSkeleton({ preview }: HeroBannerSkeletonProps = {}) {
  if (preview) {
    return (
      <section className="relative h-full w-full overflow-hidden bg-neutral-950" aria-hidden>
        <SwissEditorialSkeletonCanvas />
      </section>
    );
  }
  return (
    <section className="relative isolate min-h-[100dvh] min-h-screen w-full overflow-hidden bg-neutral-950" aria-hidden>
      <div className="relative hidden h-[100dvh] md:block">
        <SwissEditorialSkeletonCanvas />
      </div>
      <div className="relative flex min-h-[100dvh] animate-pulse flex-col px-5 pb-8 pt-16 md:hidden">
        <span className="block h-6 w-[80%] rounded-sm bg-neutral-800" />
        <span className="mx-auto mt-9 aspect-[4/5] w-[66%] rounded-[0.8rem_43%_0_0] bg-neutral-700 ring-1 ring-inset ring-white/[0.06]" />
        <div className="mt-7 flex gap-6">
          <span className="block h-3 w-24 rounded-full bg-neutral-800" />
          <span className="block h-3 w-20 rounded-full bg-neutral-800" />
        </div>
        <span className="mt-auto block h-[18vw] max-h-28 w-full rounded-sm bg-neutral-800" />
      </div>
    </section>
  );
}

/** Shared desktop canvas: percentages keep catalogue and full-size loading geometry identical. */
function PortraitIdentitySkeletonCanvas() {
  return (
    <div className="absolute inset-0 animate-pulse" style={{ containerType: 'size' }}>
      <div className="absolute left-[6.3%] right-[6.3%] top-[13%] h-[9%]">
        <span className="block h-[28%] w-[36%] rounded-full bg-neutral-800" />
        <div className="absolute bottom-0 left-[46%] flex h-[24%] w-[25%] items-center gap-[4%]">
          <span className="aspect-square h-[45%] rounded-full bg-neutral-700" />
          <span className="h-[80%] w-[53%] rounded-full bg-neutral-800" />
        </div>
      </div>
      <span className="absolute left-[6.3%] right-[6.3%] top-[27%] h-px bg-neutral-800" />
      <div className="absolute bottom-[5%] left-[6.3%] right-[6.3%] top-[31.5%] grid grid-cols-[42%_4%_1fr]">
        <span className="h-full w-[95%] rounded-[0.2cqw] bg-neutral-700 ring-1 ring-inset ring-white/[0.06]" />
        <span />
        <div className="relative min-w-0">
          <span className="block h-[20%] w-[88%] rounded-[0.4cqw] bg-neutral-800" />
          <span className="absolute bottom-0 left-0 block h-[6%] w-[38%] rounded-[0.2cqw] bg-neutral-800" />
        </div>
      </div>
    </div>
  );
}

function PortraitIdentityHeroBannerSkeleton({ preview }: HeroBannerSkeletonProps = {}) {
  if (preview) {
    return (
      <section className="relative h-full w-full overflow-hidden bg-neutral-950" aria-hidden>
        <PortraitIdentitySkeletonCanvas />
      </section>
    );
  }
  return (
    <section className="relative isolate min-h-[100dvh] min-h-screen w-full overflow-hidden bg-neutral-950" aria-hidden>
      <div className="relative hidden h-[100dvh] md:block">
        <PortraitIdentitySkeletonCanvas />
      </div>

      <div className="flex min-h-[100dvh] animate-pulse flex-col px-5 pb-8 pt-16 md:hidden">
        <span className="block h-5 w-[80%] rounded-full bg-neutral-800" />
        <div className="mt-5 flex items-center gap-2.5">
          <span className="size-2 rounded-full bg-neutral-700" />
          <span className="h-3.5 w-32 rounded-full bg-neutral-800" />
        </div>
        <span className="my-7 block h-px w-full bg-neutral-800" />
        <span className="aspect-[4/5] w-full rounded-sm bg-neutral-700 ring-1 ring-inset ring-white/[0.06]" />
        <span className="mt-7 block h-16 w-[82%] rounded-md bg-neutral-800" />
        <span className="mt-7 block h-4 w-[38%] rounded-sm bg-neutral-800" />
      </div>
    </section>
  );
}

/** One proportional canvas for the catalogue thumbnail and desktop loading preview. */
function EditorialRailSkeletonCanvas() {
  return (
    <div className="absolute inset-0 animate-pulse" style={{ containerType: 'size' }}>
      <div className="absolute bottom-[5%] left-[6.3%] right-[6.3%] top-[13%] grid grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)] gap-x-[6%]">
        <div className="relative min-w-0">
          <div className="absolute inset-x-0 bottom-[21%] top-[10%] flex flex-col justify-center">
            <div className="flex h-[2%] items-center gap-[2%]">
              <span className="aspect-square h-full rounded-full bg-neutral-700" />
              <span className="h-full w-[18%] rounded-full bg-neutral-800" />
            </div>
            <span className="mt-[7%] block h-[16%] w-[94%] rounded-[0.4cqw] bg-neutral-800" />
          </div>
          <div className="absolute inset-x-0 bottom-0 h-[11%]">
            <span className="block h-[35%] w-[58%] rounded-[0.2cqw] bg-neutral-800" />
          </div>
        </div>
        <span className="h-full w-full rounded-[1.7cqw_0.3cqw_1.7cqw_0.3cqw] bg-neutral-700 ring-1 ring-inset ring-white/[0.06]" />
      </div>
    </div>
  );
}

function EditorialRailHeroBannerSkeleton({ preview }: HeroBannerSkeletonProps = {}) {
  if (preview) {
    return (
      <section className="relative h-full w-full overflow-hidden bg-neutral-950" aria-hidden>
        <EditorialRailSkeletonCanvas />
      </section>
    );
  }
  return (
    <section className="relative isolate min-h-[100dvh] min-h-screen w-full overflow-hidden bg-neutral-950" aria-hidden>
      <div className="relative hidden h-[100dvh] md:block">
        <EditorialRailSkeletonCanvas />
      </div>

      <div className="flex min-h-[100dvh] animate-pulse flex-col px-5 pb-8 pt-16 md:hidden">
        <div className="flex items-center gap-2.5">
          <span className="size-2 rounded-full bg-neutral-700" />
          <span className="h-2.5 w-24 rounded-full bg-neutral-800" />
        </div>
        <span className="mt-8 block h-12 w-[94%] rounded-md bg-neutral-800" />
        <span className="mt-8 aspect-[3/4] w-full rounded-[1.25rem_0.25rem_1.25rem_0.25rem] bg-neutral-700 ring-1 ring-inset ring-white/[0.06]" />
        <span className="mt-7 block h-4 w-[58%] rounded-sm bg-neutral-800" />
      </div>
    </section>
  );
}

/** Shared Statement CTA composition, scaled within the catalogue or desktop viewport. */
function StatementCtaSkeletonCanvas() {
  return (
    <div className="absolute inset-0 animate-pulse" style={{ containerType: 'size' }}>
      <div className="absolute bottom-[4%] left-[6.3%] right-[6.3%] top-[15%] grid grid-cols-[74fr_26fr] grid-rows-[24%_1fr_10%] gap-x-[4%]">
        <div>
          <span className="block h-[38%] w-[88%] rounded-[0.4cqw] bg-neutral-800" />
        </div>
        <div className="flex h-[8%] items-center justify-end gap-[4%]">
          <span className="aspect-square h-[60%] rounded-full bg-neutral-700" />
          <span className="h-full w-[62%] rounded-full bg-neutral-800" />
        </div>
        <div className="flex min-h-0 items-center justify-center">
          <span className="aspect-square w-[35%] rounded-full bg-neutral-700 ring-1 ring-inset ring-white/[0.06]" />
        </div>
        <div className="flex min-h-0 flex-col justify-center">
          <div className="flex h-[18%] flex-col justify-between">
            {[100, 76].map((width) => (
              <span key={width} className="block h-[22%] rounded-full bg-neutral-800" style={{ width: `${width}%` }} />
            ))}
          </div>
          <div className="mt-[10%] flex h-[12%] items-center gap-[8%]">
            <span className="h-full w-[56%] rounded-[0.2cqw] bg-neutral-700" />
            <span className="h-[20%] w-[30%] rounded-full bg-neutral-800" />
          </div>
        </div>
        <div className="col-span-2 flex items-center gap-[4%] border-t border-neutral-800">
          {Array.from({ length: 5 }).map((_, index) => (
            <span key={index} className="h-[18%] w-[8%] rounded-full bg-neutral-800" />
          ))}
        </div>
      </div>
    </div>
  );
}

function StatementCtaHeroBannerSkeleton({ preview }: HeroBannerSkeletonProps = {}) {
  if (preview) {
    return (
      <section className="relative h-full w-full overflow-hidden bg-neutral-950" aria-hidden>
        <StatementCtaSkeletonCanvas />
      </section>
    );
  }
  return (
    <section className="relative isolate min-h-[100dvh] min-h-screen w-full overflow-hidden bg-neutral-950" aria-hidden>
      <div className="relative hidden h-[100dvh] md:block">
        <StatementCtaSkeletonCanvas />
      </div>
      <div className="flex min-h-[100dvh] animate-pulse flex-col px-5 pb-8 pt-16 md:hidden">
        <div className="flex items-center gap-2.5">
          <span className="size-2 rounded-full bg-neutral-700" />
          <span className="h-3 w-28 rounded-full bg-neutral-800" />
        </div>
        <span className="mt-8 block h-11 w-[88%] rounded-md bg-neutral-800" />
        <span className="mx-auto mt-9 aspect-square w-[56%] rounded-full bg-neutral-700 ring-1 ring-inset ring-white/[0.06]" />
        <div className="mt-8 space-y-3">
          {[100, 76].map((width) => (
            <span key={width} className="block h-3 rounded-full bg-neutral-800" style={{ width: `${width}%` }} />
          ))}
        </div>
        <div className="mt-7 flex items-center gap-5">
          <span className="h-12 w-36 rounded-sm bg-neutral-700" />
          <span className="h-3 w-24 rounded-full bg-neutral-800" />
        </div>
        <div className="mt-8 flex gap-5 border-t border-neutral-800 pt-5">
          {Array.from({ length: 4 }).map((_, index) => (
            <span key={index} className="h-3 flex-1 rounded-full bg-neutral-800" />
          ))}
        </div>
      </div>
    </section>
  );
}

/** Shared silhouette preserves Portrait balance's asymmetric title, bottom split and cut portrait. */
function PortraitBalanceSkeletonCanvas() {
  return (
    <div className="absolute inset-0 animate-pulse" style={{ containerType: 'size' }}>
      <div className="absolute bottom-[6%] left-[6.3%] right-[6.3%] top-[18%] grid grid-cols-[1.15fr_0.7fr] gap-x-[7%]">
        <div className="relative min-w-0">
          <span className="absolute left-0 top-[29%] h-[13%] w-[90%] rounded-[0.4cqw] bg-neutral-800" />
          <div className="absolute inset-x-0 bottom-0 grid h-[12%] grid-cols-[0.75fr_1fr] items-end gap-x-[12%]">
            <span className="block h-[45%] rounded-[0.2cqw] bg-neutral-800" />
            <span className="block h-full rounded-[0.3cqw] bg-neutral-800" />
          </div>
        </div>
        <div className="relative min-w-0">
          <span className="absolute inset-0 bg-neutral-700" style={{ clipPath: 'polygon(0 0, 94% 0, 100% 5%, 100% 100%, 6% 100%, 0 95%)' }} />
          <span className="absolute -top-[2%] right-0 h-[5%] w-[40%] rounded-[0.15cqw] bg-neutral-700" />
        </div>
      </div>
    </div>
  );
}

function PortraitBalanceHeroBannerSkeleton({ preview }: HeroBannerSkeletonProps = {}) {
  if (preview) {
    return (
      <section className="relative h-full w-full overflow-hidden bg-neutral-950" aria-hidden>
        <PortraitBalanceSkeletonCanvas />
      </section>
    );
  }
  return (
    <section className="relative isolate min-h-[100dvh] min-h-screen w-full overflow-hidden bg-neutral-950" aria-hidden>
      <div className="relative hidden h-[100dvh] md:block">
        <PortraitBalanceSkeletonCanvas />
      </div>
      <div className="flex min-h-[100dvh] animate-pulse flex-col px-5 pb-8 pt-16 md:hidden">
        <span className="block h-12 w-[88%] rounded-md bg-neutral-800" />
        <div className="relative mt-10">
          <span className="absolute -top-2 right-0 z-[1] h-5 w-28 rounded-sm bg-neutral-700" />
          <span className="block aspect-[5/6] w-full bg-neutral-700" style={{ clipPath: 'polygon(0 0, 94% 0, 100% 5%, 100% 100%, 6% 100%, 0 95%)' }} />
        </div>
        <div className="mt-8 grid grid-cols-[0.75fr_1fr] items-end gap-6">
          <span className="block h-4 rounded-sm bg-neutral-800" />
          <span className="block h-9 rounded-sm bg-neutral-800" />
        </div>
      </div>
    </section>
  );
}

/** Shared minimal composition: tall left portrait, right headline and bottom-aligned copy/actions. */
function LeftPortraitSkeletonCanvas() {
  return (
    <div className="absolute inset-0 animate-pulse" style={{ containerType: 'size' }}>
      <div className="absolute bottom-[6%] left-[6.3%] right-[6.3%] top-[12%] grid grid-cols-[0.9fr_1.1fr] gap-x-[6%]">
        <div className="relative min-w-0">
          <span className="absolute inset-0 bg-neutral-700" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 94%, 92% 100%, 0 100%)' }} />
          <span className="absolute left-0 top-[5%] h-[3%] w-[30%] rounded-r-sm bg-neutral-700" />
        </div>
        <div className="relative min-w-0">
          <span className="block h-[15%] w-[90%] rounded-[0.4cqw] bg-neutral-800" />
          <div className="absolute inset-x-0 bottom-0 h-[18%] border-l border-neutral-700 pl-[5%]">
            <span className="block h-[32%] w-[88%] rounded-[0.2cqw] bg-neutral-800" />
            <span className="absolute bottom-0 block h-[20%] w-[36%] rounded-[0.2cqw] bg-neutral-800" />
          </div>
        </div>
      </div>
    </div>
  );
}

function LeftPortraitHeroBannerSkeleton({ preview }: HeroBannerSkeletonProps = {}) {
  if (preview) {
    return (
      <section className="relative h-full w-full overflow-hidden bg-neutral-950" aria-hidden>
        <LeftPortraitSkeletonCanvas />
      </section>
    );
  }
  return (
    <section className="relative isolate min-h-[100dvh] min-h-screen w-full overflow-hidden bg-neutral-950" aria-hidden>
      <div className="relative hidden h-[100dvh] md:block">
        <LeftPortraitSkeletonCanvas />
      </div>
      <div className="flex min-h-[100dvh] animate-pulse flex-col px-5 pb-8 pt-16 md:hidden">
        <span className="block h-12 w-[90%] rounded-md bg-neutral-800" />
        <div className="relative mt-8 aspect-[4/5] w-full">
          <span className="absolute inset-0 bg-neutral-700" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 94%, 92% 100%, 0 100%)' }} />
          <span className="absolute left-0 top-[5%] h-3 w-[30%] rounded-r-sm bg-neutral-700" />
        </div>
        <div className="mt-8 border-l border-neutral-700 pl-4">
          <span className="block h-7 w-[88%] rounded-sm bg-neutral-800" />
          <span className="mt-6 block h-4 w-[36%] rounded-sm bg-neutral-800" />
        </div>
      </div>
    </section>
  );
}

/** Shared minimal orbit composition: circle left, copy right, signature along the bottom. */
function CirclePortraitSkeletonCanvas() {
  return (
    <div className="absolute inset-0 animate-pulse" style={{ containerType: 'size' }}>
      <div className="absolute bottom-[24%] left-[6.3%] right-[6.3%] top-[12%] grid grid-cols-[0.92fr_1.08fr] items-center gap-x-[9%]">
        <div className="relative aspect-square w-[90%]">
          <span className="absolute inset-0 rounded-full bg-neutral-700" />
          <span className="absolute -inset-[5%] rounded-full border border-neutral-800" />
          <span className="absolute -bottom-[4%] left-[30%] h-[6%] w-[40%] rounded-full bg-neutral-700" />
        </div>
        <div className="flex h-[28%] flex-col justify-between">
          <span className="block h-[28%] w-[90%] rounded-[0.3cqw] bg-neutral-800" />
          <span className="block h-[16%] w-[33%] rounded-full bg-neutral-800" />
        </div>
      </div>
      <div className="absolute bottom-[6%] left-[6.3%] right-[6.3%] flex h-[12%] items-end gap-[4%]">
        <span className="block h-full w-[64%] rounded-[0.4cqw] bg-neutral-800" />
        <span className="mb-[0.5%] block h-[28%] w-[14%] rounded-full bg-neutral-800" />
      </div>
    </div>
  );
}

function CirclePortraitHeroBannerSkeleton({ preview }: HeroBannerSkeletonProps = {}) {
  if (preview) {
    return (
      <section className="relative h-full w-full overflow-hidden bg-neutral-950" aria-hidden>
        <CirclePortraitSkeletonCanvas />
      </section>
    );
  }
  return (
    <section className="relative isolate min-h-[100dvh] min-h-screen w-full overflow-hidden bg-neutral-950" aria-hidden>
      <div className="relative hidden h-[100dvh] md:block">
        <CirclePortraitSkeletonCanvas />
      </div>
      <div className="flex min-h-[100dvh] animate-pulse flex-col px-5 pb-10 pt-20 md:hidden">
        <div className="relative mx-auto aspect-square w-[68%]">
          <span className="absolute inset-0 rounded-full bg-neutral-700" />
          <span className="absolute -inset-[5%] rounded-full border border-neutral-800" />
          <span className="absolute -bottom-2 left-[30%] h-4 w-[40%] rounded-full bg-neutral-700" />
        </div>
        <div className="mt-12 flex items-end gap-4">
          <span className="block h-14 w-[70%] rounded-md bg-neutral-800" />
          <span className="block h-4 flex-1 rounded-full bg-neutral-800" />
        </div>
        <span className="mt-8 block h-7 w-[90%] rounded-sm bg-neutral-800" />
        <span className="mt-6 block h-4 w-[33%] rounded-full bg-neutral-800" />
      </div>
    </section>
  );
}

/** Shared minimal Experience split: framed title left, portrait and experience aside right. */
function ExperienceSplitSkeletonCanvas() {
  return (
    <div className="absolute inset-0 animate-pulse" style={{ containerType: 'size' }}>
      <div className="absolute bottom-[19%] left-[6.3%] right-[6.3%] top-[24%] grid grid-cols-[0.85fr_1.15fr] items-start gap-x-[10%]">
        <div className="relative h-[78%] border-l border-neutral-700 pl-[7%]">
          <span className="block h-[28%] w-[94%] rounded-[0.4cqw] bg-neutral-800" />
          <span className="mt-[9%] block h-[5%] w-[40%] rounded-full bg-neutral-800" />
          <span className="absolute bottom-0 block h-[9%] w-[34%] rounded-[0.2cqw] bg-neutral-800" />
        </div>
        <div className="grid h-full grid-cols-[1.15fr_0.85fr] items-center gap-x-[8%]">
          <span className="block h-full w-full bg-neutral-700" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 88%, 84% 100%, 0 100%)' }} />
          <div className="flex h-[52%] flex-col justify-between">
            <span className="block h-[35%] w-[62%] rounded-[0.3cqw] bg-neutral-800" />
            <span className="block h-[18%] w-full rounded-[0.2cqw] bg-neutral-800" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ExperienceSplitHeroBannerSkeleton({ preview }: HeroBannerSkeletonProps = {}) {
  if (preview) {
    return (
      <section className="relative h-full w-full overflow-hidden bg-neutral-950" aria-hidden>
        <ExperienceSplitSkeletonCanvas />
      </section>
    );
  }
  return (
    <section className="relative isolate min-h-[100dvh] min-h-screen w-full overflow-hidden bg-neutral-950" aria-hidden>
      <div className="relative hidden h-[100dvh] md:block">
        <ExperienceSplitSkeletonCanvas />
      </div>
      <div className="flex min-h-[100dvh] animate-pulse flex-col px-5 pb-10 pt-16 md:hidden">
        <div className="border-l border-neutral-700 pl-4">
          <span className="block h-12 w-[90%] rounded-md bg-neutral-800" />
          <span className="mt-5 block h-3 w-[40%] rounded-full bg-neutral-800" />
        </div>
        <span className="mt-8 block aspect-[4/5] w-[72%] bg-neutral-700" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 88%, 84% 100%, 0 100%)' }} />
        <div className="mt-8 flex items-center gap-6">
          <span className="block h-12 w-[20%] rounded-sm bg-neutral-800" />
          <span className="block h-6 w-[52%] rounded-sm bg-neutral-800" />
        </div>
        <span className="mt-8 block h-4 w-[34%] rounded-sm bg-neutral-800" />
      </div>
    </section>
  );
}

/** Shared minimal magazine spread: left image window, centered identity on the right. */
function EditorialOverlapSkeletonCanvas() {
  return (
    <div className="absolute inset-0 animate-pulse" style={{ containerType: 'size' }}>
      <span className="absolute bottom-[16%] left-[9%] top-[24%] w-[38%] rounded-[0.2cqw] bg-neutral-700" />
      <div className="absolute left-[52%] right-[9%] top-[36%] h-[35%]">
        <span className="block h-[5%] w-[32%] rounded-full bg-neutral-800" />
        <span className="mt-[6%] block h-[40%] w-[88%] rounded-[0.4cqw] bg-neutral-800" />
        <span className="mt-[12%] block h-[10%] w-[72%] rounded-[0.2cqw] bg-neutral-800" />
      </div>
    </div>
  );
}

function EditorialOverlapHeroBannerSkeleton({ preview }: HeroBannerSkeletonProps = {}) {
  if (preview) {
    return (
      <section className="relative h-full w-full overflow-hidden bg-neutral-950" aria-hidden>
        <EditorialOverlapSkeletonCanvas />
      </section>
    );
  }
  return (
    <section className="relative isolate min-h-[100dvh] min-h-screen w-full overflow-hidden bg-neutral-950" aria-hidden>
      <div className="relative hidden h-[100dvh] md:block">
        <EditorialOverlapSkeletonCanvas />
      </div>
      <div className="flex min-h-[100dvh] animate-pulse flex-col px-5 pb-10 pt-16 md:hidden">
        <span className="block aspect-[5/4] w-full rounded-sm bg-neutral-700" />
        <div className="relative z-[1] -mt-6 ml-auto w-[94%] bg-neutral-950 px-4 pt-5">
          <span className="block h-3 w-[32%] rounded-full bg-neutral-800" />
          <span className="mt-5 block h-16 w-[88%] rounded-md bg-neutral-800" />
          <span className="mt-8 block h-5 w-[72%] rounded-sm bg-neutral-800" />
        </div>
      </div>
    </section>
  );
}

/** Shared minimal Selected works composition: identity above an asymmetric project rail. */
function SelectedWorksSkeletonCanvas() {
  const cards = [
    { span: 4, height: '100%' },
    { span: 3, height: '86%' },
    { span: 2, height: '75%' },
    { span: 3, height: '94%' },
  ];
  return (
    <div className="absolute inset-0 animate-pulse" style={{ containerType: 'size' }}>
      <div className="absolute left-[6.3%] right-[6.3%] top-[12%] grid h-[24%] grid-cols-[2fr_1fr] gap-x-[8%]">
        <span className="block h-[68%] w-[78%] rounded-[0.4cqw] bg-neutral-800" />
        <div className="flex h-[55%] flex-col justify-between pt-[4%]">
          <span className="block h-[12%] w-[44%] rounded-full bg-neutral-800" />
          <span className="block h-[30%] w-[92%] rounded-[0.2cqw] bg-neutral-800" />
        </div>
      </div>
      <div className="absolute bottom-[5%] left-[6.3%] right-[6.3%] top-[49%]">
        <div className="flex h-[8%] items-start justify-between border-b border-neutral-800">
          <span className="block h-[24%] w-[14%] rounded-full bg-neutral-800" />
          <span className="block h-[24%] w-[6%] rounded-full bg-neutral-800" />
        </div>
        <div className="mt-[2%] grid h-[88%] grid-cols-12 items-end gap-[1.5%]">
          {cards.map((card, index) => (
            <span key={index} className="block w-full bg-neutral-800" style={{
              gridColumn: `span ${card.span}`,
              height: card.height,
              clipPath: 'polygon(0 0, 94% 0, 100% 6%, 100% 100%, 0 100%)',
            }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function SelectedWorksHeroBannerSkeleton({ preview }: HeroBannerSkeletonProps = {}) {
  if (preview) {
    return (
      <section className="relative h-full w-full overflow-hidden bg-neutral-950" aria-hidden>
        <SelectedWorksSkeletonCanvas />
      </section>
    );
  }
  return (
    <section className="relative isolate min-h-[100dvh] min-h-screen w-full overflow-hidden bg-neutral-950" aria-hidden>
      <div className="relative hidden h-[100dvh] md:block">
        <SelectedWorksSkeletonCanvas />
      </div>
      <div className="flex min-h-[100dvh] animate-pulse flex-col overflow-hidden px-5 pb-8 pt-16 md:hidden">
        <span className="block h-16 w-[78%] rounded-md bg-neutral-800" />
        <span className="mt-7 block h-3 w-[36%] rounded-full bg-neutral-800" />
        <span className="mt-5 block h-6 w-[88%] rounded-sm bg-neutral-800" />
        <div className="mt-auto pt-12">
          <span className="mb-4 block h-px w-full bg-neutral-800" />
          <div className="flex gap-4">
            <span className="block h-[42svh] w-[82vw] shrink-0 bg-neutral-800" style={{ clipPath: 'polygon(0 0, 94% 0, 100% 6%, 100% 100%, 0 100%)' }} />
            <span className="block h-[42svh] w-[82vw] shrink-0 bg-neutral-800" style={{ clipPath: 'polygon(0 0, 94% 0, 100% 6%, 100% 100%, 0 100%)' }} />
          </div>
        </div>
      </div>
    </section>
  );
}
/** Shared minimal Colophon: editorial bio, ruled project index and oversized bottom identity. */
function ColophonSkeletonCanvas() {
  return (
    <div className="absolute inset-0 animate-pulse" style={{ containerType: 'size' }}>
      <div className="absolute left-[6.3%] right-[6.3%] top-[13%] flex h-[5%] items-start justify-between border-b border-neutral-800">
        <span className="block h-[22%] w-[12%] rounded-full bg-neutral-800" />
        <span className="block h-[22%] w-[18%] rounded-full bg-neutral-800" />
      </div>
      <span className="absolute left-[6.3%] top-[27%] h-[12%] w-[38%] rounded-[0.4cqw] bg-neutral-700" />
      <div className="absolute left-[57%] right-[6.3%] top-[29%] flex h-[28%] flex-col">
        {[76, 90, 64].map((width) => (
          <div key={width} className="flex flex-1 items-center border-t border-neutral-800">
            <span className="ml-[8%] block h-[16%] rounded-full bg-neutral-800" style={{ width: `${width - 8}%` }} />
          </div>
        ))}
      </div>
      <span className="absolute bottom-0 left-[6.3%] right-[6.3%] h-[22%] rounded-t-[0.4cqw] bg-neutral-700" />
    </div>
  );
}

function ColophonHeroBannerSkeleton({ preview }: HeroBannerSkeletonProps = {}) {
  if (preview) {
    return (
      <section className="relative h-full w-full overflow-hidden bg-neutral-950" aria-hidden>
        <ColophonSkeletonCanvas />
      </section>
    );
  }
  return (
    <section className="relative isolate min-h-[100dvh] min-h-screen w-full overflow-hidden bg-neutral-950" aria-hidden>
      <div className="relative hidden h-[100dvh] md:block">
        <ColophonSkeletonCanvas />
      </div>
      <div className="flex min-h-[100dvh] animate-pulse flex-col px-5 pt-16 md:hidden">
        <div className="flex justify-between border-b border-neutral-800 pb-5">
          <span className="block h-3 w-[24%] rounded-full bg-neutral-800" />
          <span className="block h-3 w-[30%] rounded-full bg-neutral-800" />
        </div>
        <span className="mt-8 block h-12 w-[88%] rounded-md bg-neutral-700" />
        <div className="mt-10">
          {[76, 90, 64].map((width) => (
            <div key={width} className="flex h-12 items-center border-t border-neutral-800">
              <span className="ml-[8%] block h-2 rounded-full bg-neutral-800" style={{ width: `${width - 8}%` }} />
            </div>
          ))}
        </div>
        <span className="mt-auto block h-[22vw] w-full rounded-t-md bg-neutral-700" />
      </div>
    </section>
  );
}

/** Shared minimal Identity index: centered name, three metadata columns and lower bio. */
function IdentityIndexSkeletonCanvas() {
  return (
    <div className="absolute inset-0 animate-pulse" style={{ containerType: 'size' }}>
      <span className="absolute left-[48.5%] top-[12%] h-[0.4%] w-[3%] bg-neutral-700" />
      <span className="absolute left-[22%] top-[21%] h-[14%] w-[56%] rounded-[0.4cqw] bg-neutral-800" />
      <div className="absolute left-[6.3%] right-[6.3%] top-[44%] grid h-[6%] grid-cols-3 items-center justify-items-center gap-[4%] border-b border-neutral-800 pb-[2%]">
        {[0, 1, 2].map((index) => (
          <span key={index} className="block h-[30%] w-[40%] rounded-full bg-neutral-800" />
        ))}
      </div>
      <span className="absolute bottom-[9%] left-[23%] h-[7%] w-[54%] rounded-[0.3cqw] bg-neutral-800" />
    </div>
  );
}

function IdentityIndexHeroBannerSkeleton({ preview }: HeroBannerSkeletonProps = {}) {
  if (preview) {
    return (
      <section className="relative h-full w-full overflow-hidden bg-neutral-950" aria-hidden>
        <IdentityIndexSkeletonCanvas />
      </section>
    );
  }
  return (
    <section className="relative isolate min-h-[100dvh] min-h-screen w-full overflow-hidden bg-neutral-950" aria-hidden>
      <div className="relative hidden h-[100dvh] lg:block">
        <IdentityIndexSkeletonCanvas />
      </div>
      <div className="flex min-h-[100dvh] animate-pulse flex-col px-5 pb-10 pt-20 lg:hidden">
        <span className="block h-16 w-[86%] rounded-md bg-neutral-800" />
        <div className="mt-12 space-y-4 border-b border-neutral-800 pb-5">
          {[44, 36, 40].map((width) => (
            <span key={width} className="block h-3 rounded-full bg-neutral-800" style={{ width: `${width}%` }} />
          ))}
        </div>
        <span className="mt-8 block h-10 w-[92%] rounded-sm bg-neutral-800" />
      </div>
    </section>
  );
}

/** Shared Studio split silhouette: two-column intro above a centered overlapping circular media. */
function StudioSplitSkeletonCanvas() {
  return (
    <div className="absolute inset-0 animate-pulse" style={{ containerType: 'size' }}>
      <span className="absolute inset-x-0 top-0 h-[57%] bg-neutral-900" />
      <div className="absolute left-[6.3%] right-[6.3%] top-[13%] grid h-[22%] grid-cols-[7fr_5fr] gap-x-[8%]">
        <span className="block h-[60%] w-[85%] rounded-[0.4cqw] bg-neutral-800" />
        <div className="flex h-[72%] flex-col justify-between">
          <span className="block h-[32%] w-full rounded-[0.3cqw] bg-neutral-800" />
          <span className="block h-[16%] w-[36%] rounded-full bg-neutral-800" />
        </div>
      </div>
      <span className="absolute left-1/2 top-[43%] aspect-square w-[35%] -translate-x-1/2 rounded-full bg-neutral-700 ring-1 ring-inset ring-white/[0.06]" />
    </div>
  );
}

function StudioSplitHeroBannerSkeleton({ preview }: HeroBannerSkeletonProps = {}) {
  if (preview) {
    return (
      <section className="relative h-full w-full overflow-hidden bg-neutral-950" aria-hidden>
        <StudioSplitSkeletonCanvas />
      </section>
    );
  }
  return (
    <section className="relative isolate min-h-[100dvh] min-h-screen w-full overflow-hidden bg-neutral-950" aria-hidden>
      <div className="relative hidden h-[100dvh] md:block">
        <StudioSplitSkeletonCanvas />
      </div>
      <div className="flex min-h-[100dvh] animate-pulse flex-col md:hidden">
        <div className="bg-neutral-900 px-5 pb-28 pt-20">
          <span className="block h-14 w-[85%] rounded-md bg-neutral-800" />
          <span className="mt-8 block h-7 w-full rounded-sm bg-neutral-800" />
          <span className="mt-6 block h-4 w-[36%] rounded-full bg-neutral-800" />
        </div>
        <span className="relative mx-auto -mt-16 block aspect-square w-[72%] rounded-full bg-neutral-700 ring-1 ring-inset ring-white/[0.06]" />
      </div>
    </section>
  );
}

/** Shared minimal Work duo: left identity and experience, two staggered project panels right. */
function WorkDuoSkeletonCanvas() {
  return (
    <div className="absolute inset-0 animate-pulse" style={{ containerType: 'size' }}>
      <div className="absolute bottom-[6%] left-[6.3%] right-[6.3%] top-[13%] grid grid-cols-[0.82fr_1.18fr] gap-x-[6%]">
        <div className="relative min-w-0">
          <span className="block h-[2%] w-[30%] rounded-full bg-neutral-800" />
          <span className="mt-[8%] block h-[18%] w-[90%] rounded-[0.4cqw] bg-neutral-800" />
          <span className="mt-[10%] block h-[5%] w-[38%] rounded-full bg-neutral-800" />
          <div className="absolute inset-x-0 bottom-0 flex h-[12%] items-end justify-between border-t border-neutral-800 pt-[3%]">
            <span className="block h-[20%] w-[30%] rounded-full bg-neutral-800" />
            <span className="block h-full w-[20%] rounded-[0.3cqw] bg-neutral-800" />
          </div>
        </div>
        <div className="relative grid min-w-0 grid-cols-2 gap-[4%] pt-[5%]">
          <span className="absolute right-0 top-0 h-[1.5%] w-[14%] rounded-full bg-neutral-800" />
          <span className="block h-[94%] rounded-[0.8cqw_2.5cqw_0.8cqw_2.5cqw] bg-neutral-700" />
          <span className="mt-[14%] block h-[94%] rounded-[2.5cqw_0.8cqw_2.5cqw_0.8cqw] bg-neutral-700" />
        </div>
      </div>
    </div>
  );
}

function WorkDuoHeroBannerSkeleton({ preview }: HeroBannerSkeletonProps = {}) {
  if (preview) {
    return (
      <section className="relative h-full w-full overflow-hidden bg-neutral-950" aria-hidden>
        <WorkDuoSkeletonCanvas />
      </section>
    );
  }
  return (
    <section className="relative isolate min-h-[100dvh] min-h-screen w-full overflow-hidden bg-neutral-950" aria-hidden>
      <div className="relative hidden h-[100dvh] md:block">
        <WorkDuoSkeletonCanvas />
      </div>
      <div className="flex min-h-[100dvh] animate-pulse flex-col overflow-hidden px-5 pb-10 pt-16 md:hidden">
        <span className="block h-3 w-[30%] rounded-full bg-neutral-800" />
        <span className="mt-6 block h-14 w-[90%] rounded-md bg-neutral-800" />
        <span className="mt-7 block h-4 w-[38%] rounded-full bg-neutral-800" />
        <div className="mt-10 flex items-end justify-between border-t border-neutral-800 pt-4">
          <span className="block h-3 w-[30%] rounded-full bg-neutral-800" />
          <span className="block h-10 w-[20%] rounded-sm bg-neutral-800" />
        </div>
        <div className="mt-10 flex gap-4">
          <span className="block aspect-[4/5] w-[82vw] shrink-0 rounded-[0.8rem_2rem_0.8rem_2rem] bg-neutral-700" />
          <span className="block aspect-[4/5] w-[82vw] shrink-0 rounded-[2rem_0.8rem_2rem_0.8rem] bg-neutral-700" />
        </div>
      </div>
    </section>
  );
}

/** Shared minimal Bowl intro: sculptural portrait left, specialty and restrained actions right. */
function BowlIntroSkeletonCanvas() {
  return (
    <div className="absolute inset-0 animate-pulse" style={{ containerType: 'size' }}>
      <div className="absolute bottom-[14%] left-[8%] right-[8%] top-[20%] grid grid-cols-[0.9fr_1.1fr] gap-x-[10%]">
        <div className="relative min-w-0">
          <span className="absolute bottom-[10%] left-0 h-[40%] w-full rounded-[50%_50%_16%_16%] border border-neutral-800" />
          <span className="absolute bottom-[14%] left-[8%] right-[8%] top-[3%] bg-neutral-700" style={{ borderRadius: '8% 8% 42% 42% / 8% 8% 16% 16%' }} />
          <span className="absolute left-[10%] top-0 h-[4%] w-[35%] rounded-full bg-neutral-700" />
          <span className="absolute bottom-0 left-[30%] h-[3%] w-[40%] rounded-full bg-neutral-800" />
        </div>
        <div className="relative min-w-0">
          <span className="block h-[24%] w-[94%] rounded-[0.4cqw] bg-neutral-800" />
          <div className="absolute inset-x-0 bottom-[6%] h-[18%]">
            <span className="block h-[30%] w-[88%] rounded-[0.2cqw] bg-neutral-800" />
            <span className="absolute bottom-0 block h-[20%] w-[36%] rounded-full bg-neutral-800" />
          </div>
        </div>
      </div>
    </div>
  );
}

function BowlIntroHeroBannerSkeleton({ preview }: HeroBannerSkeletonProps = {}) {
  if (preview) {
    return (
      <section className="relative h-full w-full overflow-hidden bg-neutral-950" aria-hidden>
        <BowlIntroSkeletonCanvas />
      </section>
    );
  }
  return (
    <section className="relative isolate min-h-[100dvh] min-h-screen w-full overflow-hidden bg-neutral-950" aria-hidden>
      <div className="relative hidden h-[100dvh] md:block">
        <BowlIntroSkeletonCanvas />
      </div>
      <div className="flex min-h-[100dvh] animate-pulse flex-col px-5 pb-10 pt-20 md:hidden">
        <div className="relative mx-auto w-[72%] pb-8">
          <span className="absolute bottom-6 inset-x-0 h-[40%] rounded-[50%_50%_16%_16%] border border-neutral-800" />
          <span className="relative mx-auto block aspect-[3/4] w-[84%] bg-neutral-700" style={{ borderRadius: '8% 8% 42% 42% / 8% 8% 16% 16%' }} />
          <span className="absolute -top-2 left-[10%] h-3 w-[35%] rounded-full bg-neutral-700" />
          <span className="absolute bottom-0 left-[30%] h-3 w-[40%] rounded-full bg-neutral-800" />
        </div>
        <span className="mt-9 block h-14 w-[94%] rounded-md bg-neutral-800" />
        <span className="mt-8 block h-6 w-[88%] rounded-sm bg-neutral-800" />
        <span className="mt-6 block h-4 w-[36%] rounded-full bg-neutral-800" />
      </div>
    </section>
  );
}

/** Statement overlap: two big halves around a tall portrait, a credit block and a foot bar. */
function StatementOverlapSkeletonCanvas() {
  return (
    <div className="absolute inset-0 animate-pulse" style={{ containerType: 'size' }}>
      <span className="absolute left-[37.5%] top-[14%] h-[58%] w-[29%] bg-neutral-700" />
      <span className="absolute left-[5%] top-[26%] z-10 h-[12%] w-[43%] rounded-[0.4cqw] bg-neutral-600" />
      <span className="absolute bottom-[26%] right-[5%] z-10 h-[12%] w-[36%] rounded-[0.4cqw] bg-neutral-600" />
      <span className="absolute bottom-[30%] left-[5%] h-[0.5%] w-[3%] bg-neutral-600" />
      <span className="absolute bottom-[24%] left-[5%] h-[3%] w-[14%] rounded-full bg-neutral-700" />
      <span className="absolute bottom-[19%] left-[5%] h-[2%] w-[10%] rounded-full bg-neutral-800" />
      <span className="absolute bottom-[14%] left-[5%] right-[5%] h-px bg-neutral-800" />
      <span className="absolute bottom-[7%] left-[5%] h-[3%] w-[24%] rounded-full bg-neutral-700" />
      <span className="absolute bottom-[7%] left-[40%] h-[3%] w-[18%] rounded-full bg-neutral-700" />
    </div>
  );
}

function StatementOverlapHeroBannerSkeleton({ preview }: HeroBannerSkeletonProps = {}) {
  if (preview) {
    return (
      <section className="relative h-full w-full overflow-hidden bg-neutral-950" aria-hidden>
        <StatementOverlapSkeletonCanvas />
      </section>
    );
  }
  return (
    <section className="relative isolate min-h-[100dvh] min-h-screen w-full overflow-hidden bg-neutral-950" aria-hidden>
      <div className="relative hidden h-[100dvh] md:block">
        <StatementOverlapSkeletonCanvas />
      </div>
      <div className="flex min-h-[100dvh] animate-pulse flex-col px-5 pt-16 md:hidden">
        <span className="block h-14 w-[70%] rounded-md bg-neutral-700" />
        <span className="-mt-3 mx-auto block aspect-[5/7] w-[62%] bg-neutral-800" />
        <span className="-mt-6 ml-auto block h-14 w-[70%] rounded-md bg-neutral-700" />
        <span className="mt-8 block h-4 w-[40%] rounded-full bg-neutral-800" />
      </div>
    </section>
  );
}

const HERO_BANNER_SKELETONS: Record<
  PortfolioHeroBannerDesign,
  (props: HeroBannerSkeletonProps) => ReactNode
> = {
  'swiss-editorial': SwissEditorialHeroBannerSkeleton,
  'portrait-identity': PortraitIdentityHeroBannerSkeleton,
  'editorial-rail': EditorialRailHeroBannerSkeleton,
  'statement-cta': StatementCtaHeroBannerSkeleton,
  'portrait-balance': PortraitBalanceHeroBannerSkeleton,
  'left-portrait': LeftPortraitHeroBannerSkeleton,
  'circle-portrait': CirclePortraitHeroBannerSkeleton,
  'experience-split': ExperienceSplitHeroBannerSkeleton,
  'editorial-overlap': EditorialOverlapHeroBannerSkeleton,
  'selected-works': SelectedWorksHeroBannerSkeleton,
  'identity-index': IdentityIndexHeroBannerSkeleton,
  'studio-split': StudioSplitHeroBannerSkeleton,
  'work-duo': WorkDuoHeroBannerSkeleton,
  'bowl-intro': BowlIntroHeroBannerSkeleton,
  colophon: ColophonHeroBannerSkeleton,
  'statement-overlap': StatementOverlapHeroBannerSkeleton,
};

export function PortfolioHeroBannerSkeleton({
  design = DEFAULT_PORTFOLIO_HERO_BANNER_DESIGN,
  preview = false,
  settings,
}: {
  design?: PortfolioHeroBannerDesign;
  preview?: boolean;
  settings?: PortfolioSettings | null;
}) {
  const Render = HERO_BANNER_SKELETONS[design] ?? SwissEditorialHeroBannerSkeleton;
  const thumbnailTheme = useThumbnailTheme('hero');
  const theme = settings ? resolveThumbnailTheme(settings.global, settings.hero) : thumbnailTheme;
  const canvas = theme.background;
  const ink = theme.ink;
  return <div className="hero-skeleton-theme contents"
    style={{
      '--hero-sk-canvas': canvas,
      '--hero-sk-soft': `color-mix(in srgb, ${ink} 6%, ${canvas})`,
      '--hero-sk-block': `color-mix(in srgb, ${ink} 12%, ${canvas})`,
      '--hero-sk-image': `color-mix(in srgb, ${ink} 22%, ${canvas})`,
    } as CSSProperties}>
    <Render preview={preview} />
  </div>;
}

const PREVIEW_SWISS_SERIF = "'Playfair Display', Georgia, 'Times New Roman', serif";
/** Generic filler — same Lorem ipsum convention as the real Swiss editorial banner's own
 *  empty-state fallback, just short enough for the card. */
const PREVIEW_SAMPLE_STATEMENT = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';

/** Shared palette lookup for every "real content at scale" banner preview card. */
type PreviewPalette = {
  fond: string;
  ink: string;
  muted: string;
  principal: string;
  neutre: string;
  bordure: string;
};

function previewPalette(hero: PortfolioHeroSectionSettings): PreviewPalette {
  const palette = mergeHeroPalette(DEFAULT_HERO_PALETTE, hero.palette);
  return {
    fond: resolveHeroPaletteColor(palette, 'fond'),
    ink: resolveHeroPaletteColor(palette, 'texteFort'),
    muted: resolveHeroPaletteColor(palette, 'texteMuted'),
    principal: resolveHeroPaletteColor(palette, 'principal'),
    neutre: resolveHeroPaletteColor(palette, 'neutre'),
    bordure: resolveHeroPaletteColor(palette, 'bordure'),
  };
}

const PREVIEW_LOREM_WORDS =
  'Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud'.split(
    ' '
  );

/** A short, deterministic Lorem ipsum slice — real generic filler, never fabricated identity. */
function previewLorem(count: number, start = 0): string {
  return PREVIEW_LOREM_WORDS.slice(start, start + count).join(' ');
}

/** Square card shell every banner preview renders into — sized via container query units
 *  so each design's typography scales with the card's real rendered width, not the viewport. */
function PreviewCardShell({ fond, children }: { fond: string; children: ReactNode }) {
  return (
    <div
      className="relative aspect-square overflow-hidden rounded-xl border border-neutral-200/80"
      style={{ backgroundColor: fond, containerType: 'inline-size' }}
    >
      {children}
    </div>
  );
}

function PreviewText({
  children,
  color,
  size,
  weight = 400,
  clamp,
  italic = false,
  uppercase = false,
  tracking,
  fontFamily,
  className = '',
}: {
  children: ReactNode;
  color: string;
  size: string;
  weight?: number;
  clamp?: number;
  italic?: boolean;
  uppercase?: boolean;
  tracking?: string;
  fontFamily?: string;
  className?: string;
}) {
  return (
    <p
      className={`m-0 min-w-0 ${className}`}
      style={{
        color,
        fontSize: size,
        fontWeight: weight,
        lineHeight: 1.3,
        fontStyle: italic ? 'italic' : undefined,
        textTransform: uppercase ? 'uppercase' : undefined,
        letterSpacing: tracking,
        fontFamily,
        // A single long Lorem ipsum word (e.g. "consectetur") can't wrap on its own —
        // without this it overflows past a narrow flex/grid column instead of clipping.
        overflowWrap: 'anywhere',
        ...(clamp
          ? {
              display: '-webkit-box',
              WebkitLineClamp: clamp,
              WebkitBoxOrient: 'vertical' as const,
              overflow: 'hidden',
            }
          : { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }),
      }}
    >
      {children}
    </p>
  );
}

function PreviewDot({ color, size = '1.2em' }: { color: string; size?: string }) {
  return (
    <span
      className="inline-block shrink-0 rounded-full"
      style={{ width: size, height: size, backgroundColor: color }}
    />
  );
}

function PreviewBox({
  bg,
  radius = '0px',
  aspect,
  width,
  height,
  className = '',
  ring,
}: {
  bg: string;
  radius?: string;
  aspect?: string;
  width?: string;
  height?: string;
  className?: string;
  ring?: string;
}) {
  return (
    <div
      className={`shrink-0 ${className}`}
      style={{
        backgroundColor: bg,
        borderRadius: radius,
        aspectRatio: aspect,
        width,
        height,
        boxShadow: ring ? `inset 0 0 0 1px ${ring}` : undefined,
      }}
    />
  );
}

function PreviewPill({
  children,
  color,
  border,
  bg,
  size = '4.5cqw',
}: {
  children: ReactNode;
  color: string;
  border?: string;
  bg?: string;
  size?: string;
}) {
  return (
    <span
      className="inline-block shrink-0 whitespace-nowrap rounded-full px-[8%] py-[4%]"
      style={{
        color,
        backgroundColor: bg,
        border: border ? `1px solid ${border}` : undefined,
        fontSize: size,
      }}
    >
      {children}
    </span>
  );
}

/**
 * "Real content at scale" thumbnail for Swiss editorial — reuses the design's actual
 * typography, proportions and configured labels/palette instead of an abstract skeleton,
 * abbreviated (one short statement, truncated wordmark) to fit a tiny square card.
 */
function SwissEditorialContentPreview({ hero }: { hero: PortfolioHeroSectionSettings }) {
  const palette = mergeHeroPalette(DEFAULT_HERO_PALETTE, hero.palette);
  const fond = resolveHeroPaletteColor(palette, 'fond');
  const ink = resolveHeroPaletteColor(palette, 'texteFort');
  const muted = resolveHeroPaletteColor(palette, 'texteMuted');
  const principal = resolveHeroPaletteColor(palette, 'principal');
  const neutre = resolveHeroPaletteColor(palette, 'neutre');

  // Generic Lorem ipsum filler when there's no custom signature word — matches the real
  // Swiss editorial banner's own fallback ('LOREM') for a creator with no name set.
  const signature = resolveHeroSignatureWord(hero, '').slice(0, 8);
  const currentlyLabel = resolveHeroCurrentlyLabel(hero);
  const specializedLabel = resolveHeroSpecializedInLabel(hero);

  return (
    <div
      className="relative aspect-square overflow-hidden rounded-xl border border-neutral-200/80"
      style={{ backgroundColor: fond, containerType: 'inline-size' }}
    >
      <div className="flex h-full w-full flex-col justify-between p-[7%]">
        <div className="flex items-start justify-between gap-[4%]">
          <p
            className="m-0 flex-1 overflow-hidden italic"
            style={{
              color: ink,
              fontFamily: PREVIEW_SWISS_SERIF,
              fontSize: '9.5cqw',
              lineHeight: 1.22,
              opacity: 0.92,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {PREVIEW_SAMPLE_STATEMENT}
          </p>
          <div
            className="shrink-0"
            style={{
              width: '24%',
              aspectRatio: '3 / 4',
              backgroundColor: neutre,
              borderRadius: '18% 42% 22% 30%',
            }}
          />
        </div>

        <div className="flex items-center gap-[3%]" style={{ fontSize: '5.4cqw' }}>
          <span
            className="inline-block shrink-0 rounded-full"
            style={{ width: '1.3em', height: '1.3em', backgroundColor: principal }}
          />
          <span
            className="truncate uppercase"
            style={{ color: muted, letterSpacing: '0.07em' }}
            title={`${currentlyLabel} · ${specializedLabel}`}
          >
            {currentlyLabel}
          </span>
        </div>

        <p
          className="m-0 truncate font-normal uppercase"
          style={{
            color: ink,
            fontFamily: PREVIEW_SWISS_SERIF,
            fontSize: '20cqw',
            lineHeight: 0.85,
            letterSpacing: '-0.04em',
            opacity: 0.96,
          }}
        >
          {signature}
        </p>
      </div>
    </div>
  );
}

function PortraitIdentityContentPreview({ hero }: { hero: PortfolioHeroSectionSettings }) {
  const p = previewPalette(hero);
  return (
    <PreviewCardShell fond={p.fond}>
      <div className="flex h-full w-full flex-col gap-[6%] p-[8%]">
        <div className="flex items-end justify-between gap-[6%]">
          <PreviewText color={p.ink} size="6.2cqw" weight={650} clamp={2} className="w-[48%]">
            {previewLorem(6, 4)}
          </PreviewText>
          <div className="flex items-center gap-[4%]">
            <PreviewDot color={p.principal} size="0.8em" />
            <PreviewText color={p.muted} size="4.6cqw" tracking="0.01em">
              {previewLorem(3)}
            </PreviewText>
          </div>
        </div>
        <div style={{ borderTop: `1px solid ${p.bordure}` }} />
        <div className="grid min-h-0 flex-1 grid-cols-[42%_4%_1fr] items-stretch">
          <div className="relative min-h-0 overflow-hidden" style={{ backgroundColor: p.neutre, boxShadow: `inset 0 0 0 1px ${p.bordure}` }}>
            <div className="absolute bottom-0 left-0 h-[2%] w-[28%]" style={{ backgroundColor: p.principal }} />
          </div>
          <div aria-hidden />
          <div className="flex min-w-0 flex-col">
            <PreviewText color={p.ink} size="10.5cqw" weight={500} clamp={1} className="w-full">
              {previewLorem(2, 3)}
            </PreviewText>
            <PreviewText color={p.muted} size="5.2cqw" className="mt-[4%] w-[45%]">
              {previewLorem(1)}
            </PreviewText>
            <div className="mt-auto flex gap-[3%] border-t pt-[5%]" style={{ borderColor: p.bordure }}>
              <div className="h-[1.1rem] w-[36%]" style={{ backgroundColor: p.principal }} />
              <div className="h-[1.1rem] w-[32%]" style={{ border: `1px solid ${p.ink}` }} />
            </div>
          </div>
        </div>
      </div>
    </PreviewCardShell>
  );
}

function EditorialRailContentPreview({ hero }: { hero: PortfolioHeroSectionSettings }) {
  const p = previewPalette(hero);
  return (
    <PreviewCardShell fond={p.fond}>
      <div className="grid h-full w-full grid-cols-[1.6fr_1fr] items-stretch gap-[5%] p-[8%]">
        <div className="flex min-h-0 flex-col justify-center gap-[5%]">
          <div className="flex items-center gap-[3%]">
            <PreviewDot color={p.principal} size="1em" />
            <PreviewText color={p.muted} size="5.2cqw" uppercase tracking="0.05em">
              {previewLorem(2)}
            </PreviewText>
            <span className="h-px w-[16%]" style={{ backgroundColor: p.principal, opacity: 0.65 }} />
          </div>
          <PreviewText color={p.ink} size="10cqw" weight={700} clamp={2}>
            {previewLorem(4, 2)}
          </PreviewText>
          <PreviewText color={p.muted} size="5cqw" clamp={2}>
            {previewLorem(9, 6)}
          </PreviewText>
          <div className="mt-auto flex overflow-hidden rounded-[0.2rem]" style={{ border: `1px solid ${p.bordure}` }}>
            {['UI', 'UX', '3D', 'Web'].map((tag, index) => (
              <div
                key={tag}
                className="flex min-w-0 flex-1 items-center gap-[8%] px-[4%] py-[5%]"
                style={{ borderLeft: index > 0 ? `1px solid ${p.bordure}` : undefined }}
              >
                <span className="font-mono text-[3cqw]" style={{ color: p.principal }}>
                  0{index + 1}
                </span>
                <PreviewText color={p.ink} size="3.8cqw">
                  {tag}
                </PreviewText>
              </div>
            ))}
          </div>
        </div>
        <div
          className="relative h-full w-full overflow-hidden rounded-bl-[2%] rounded-br-[9%] rounded-tl-[9%] rounded-tr-[2%]"
          style={{ backgroundColor: p.neutre, boxShadow: `inset 0 0 0 1px ${p.bordure}` }}
        >
          <span className="absolute left-[3%] top-[12%] h-[11%] w-[1%]" style={{ backgroundColor: p.principal }} />
        </div>
      </div>
    </PreviewCardShell>
  );
}

function StatementCtaContentPreview({ hero }: { hero: PortfolioHeroSectionSettings }) {
  const p = previewPalette(hero);
  return (
    <PreviewCardShell fond={p.fond}>
      <div className="grid h-full w-full grid-cols-[1.5fr_0.75fr] grid-rows-[auto_1fr_auto] gap-x-[7%] gap-y-[6%] p-[8%]">
        <PreviewText color={p.ink} size="8.8cqw" weight={700} clamp={2} className="min-w-0">
          {previewLorem(6)}
        </PreviewText>
        <div className="flex items-center justify-end gap-[4%] self-start">
          <PreviewDot color={p.principal} size="0.8em" />
          <PreviewText color={p.muted} size="4cqw" clamp={1}>
            {previewLorem(2, 4)}
          </PreviewText>
        </div>
        <div className="flex items-center justify-center">
          <div className="relative w-[42%] rounded-full p-[2%]" style={{ aspectRatio: '1', border: `1px solid ${p.bordure}` }}>
            <div className="h-full w-full rounded-full" style={{ backgroundColor: p.neutre }} />
            <span className="absolute -right-[3%] top-[18%] size-[7%] rounded-full" style={{ backgroundColor: p.principal }} />
          </div>
        </div>
        <div className="flex min-w-0 flex-col justify-center gap-[6%]">
          <div className="flex items-center gap-[5%]">
            <span className="h-px w-[24%]" style={{ backgroundColor: p.principal }} />
            <span className="size-[3%] rotate-45 border" style={{ borderColor: p.principal }} />
          </div>
          <PreviewText color={p.muted} size="4.7cqw" clamp={3}>
            {previewLorem(10, 6)}
          </PreviewText>
          <div className="flex gap-[5%]">
            <div className="h-[1rem] w-[44%] rounded-[0.15rem]" style={{ backgroundColor: p.ink }} />
            <div className="h-[1rem] w-[34%] border-b" style={{ borderColor: p.bordure }} />
          </div>
        </div>
        <div className="col-span-2 flex w-full items-baseline justify-between gap-[2%]" style={{ borderTop: `1px solid ${p.bordure}`, paddingTop: '5%' }}>
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex items-baseline gap-[8%]">
              <span className="font-mono text-[2.6cqw]" style={{ color: p.principal }}>0{index + 1}</span>
              <PreviewText color={p.muted} size="3.8cqw">{previewLorem(1, index)}</PreviewText>
            </div>
          ))}
        </div>
      </div>
    </PreviewCardShell>
  );
}

function PortraitBalanceContentPreview({ hero }: { hero: PortfolioHeroSectionSettings }) {
  const p = previewPalette(hero);
  return (
    <PreviewCardShell fond={p.fond}>
      <div className="grid h-full w-full grid-cols-[1.2fr_1fr] gap-[5%] p-[8%]">
        <div className="flex min-h-0 flex-col justify-between">
          <div className="flex flex-col gap-[4%]">
            <div className="flex w-fit items-center gap-[5%] px-[4%] py-[2.5%]" style={{ backgroundColor: p.neutre }}>
              <PreviewDot color={p.principal} size="0.75em" />
              <PreviewText color={p.muted} size="4.4cqw">{previewLorem(2)}</PreviewText>
            </div>
            <PreviewText color={p.ink} size="10cqw" weight={700} clamp={2}>
              {previewLorem(3, 2)}
            </PreviewText>
          </div>
          <div className="grid grid-cols-[0.9fr_1fr] items-end gap-[8%]">
            <div className="grid grid-cols-2 gap-x-[8%]">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="flex items-center gap-[8%] px-[6%] py-[7%]" style={{ backgroundColor: p.neutre }}>
                  <span className="font-mono text-[2.4cqw]" style={{ color: p.principal }}>0{index + 1}</span>
                  <div className="h-[0.35rem] flex-1 rounded-full" style={{ backgroundColor: p.muted }} />
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-[8%]">
              <span className="font-serif text-[12cqw] leading-[0.5]" style={{ color: p.principal }}>“</span>
              <PreviewText color={p.muted} size="4.2cqw" clamp={3}>{previewLorem(12, 8)}</PreviewText>
            </div>
          </div>
        </div>
        <div className="flex min-h-0 flex-col gap-[3%]">
          <div className="z-[2] w-fit self-end px-[5%] py-[3%]" style={{ backgroundColor: p.principal }}>
            <div className="h-[0.35rem] w-[3.5rem] rounded-full" style={{ backgroundColor: p.fond }} />
          </div>
          <div className="relative min-h-0 flex-1">
            <div className="absolute inset-0 translate-x-[4%] translate-y-[4%]" style={{ backgroundColor: p.principal, opacity: 0.42 }} />
            <PreviewBox bg={p.neutre} aspect="5 / 6" radius="0px" className="relative h-full w-full" />
          </div>
        </div>
      </div>
    </PreviewCardShell>
  );
}

function LeftPortraitContentPreview({ hero }: { hero: PortfolioHeroSectionSettings }) {
  const p = previewPalette(hero);
  return (
    <PreviewCardShell fond={p.fond}>
      <div className="grid h-full w-full grid-cols-[42%_1fr] items-stretch gap-[6%] p-[8%]">
        <div
          className="relative h-full w-full overflow-hidden"
          style={{
            backgroundColor: p.neutre,
            clipPath: 'polygon(0 0, 100% 0, 100% 92%, 84% 100%, 0 100%)',
          }}
        >
          <div className="absolute left-0 top-[7%] flex items-center gap-[5%] px-[6%] py-[4%]" style={{ backgroundColor: p.fond }}>
            <PreviewDot color={p.principal} size="0.55em" />
            <div className="h-[0.3rem] w-[2.7rem] rounded-full" style={{ backgroundColor: p.ink }} />
          </div>
          <div className="absolute bottom-[5%] right-[5%] flex size-[18%] items-center justify-center" style={{ backgroundColor: p.fond }}>
            <PreviewText color={p.principal} size="5cqw" weight={700}>AB</PreviewText>
          </div>
        </div>
        <div className="relative flex min-h-0 flex-col justify-between overflow-hidden">
          <PreviewText color={p.ink} size="10cqw" weight={700} clamp={2}>
            {previewLorem(4, 2)}
          </PreviewText>
          <span
            aria-hidden
            className="pointer-events-none absolute left-[8%] top-1/2 -translate-y-1/2 font-serif text-[30cqw] font-bold leading-none"
            style={{ color: p.ink, opacity: 0.05 }}
          >
            AB
          </span>
          <div className="relative z-[1] flex flex-col gap-[7%] p-[8%]" style={{ backgroundColor: p.neutre, boxShadow: `inset 0.25rem 0 0 ${p.principal}` }}>
            <PreviewText color={p.muted} size="4.4cqw" clamp={3}>
              {previewLorem(12, 8)}
            </PreviewText>
            <div className="flex items-center gap-[5%]">
              <span className="size-[0.9rem] rounded-full" style={{ backgroundColor: p.ink }} />
              <div className="h-[0.35rem] w-[30%] rounded-full" style={{ backgroundColor: p.ink }} />
              <div className="h-[0.35rem] w-[24%] rounded-full" style={{ backgroundColor: p.muted }} />
            </div>
          </div>
        </div>
      </div>
    </PreviewCardShell>
  );
}

function CirclePortraitContentPreview({ hero }: { hero: PortfolioHeroSectionSettings }) {
  const p = previewPalette(hero);
  return (
    <PreviewCardShell fond={p.fond}>
      <div className="flex h-full w-full flex-col gap-[7%] p-[8%]">
        <div className="grid min-h-0 flex-1 grid-cols-[44%_1fr] items-center gap-[11%]">
          <div className="relative flex aspect-square items-center justify-center rounded-full border" style={{ borderColor: p.bordure }}>
            <div className="absolute inset-[6%] rounded-full border" style={{ borderColor: p.principal }} />
            <PreviewBox bg={p.neutre} radius="50%" width="78%" ring={p.bordure} />
            <span className="absolute right-[-3%] top-[22%] size-[0.55rem] rounded-full" style={{ backgroundColor: p.principal }} />
            <span className="absolute bottom-[-7%] rounded-full border px-[7%] py-[3%]" style={{ borderColor: p.bordure, backgroundColor: p.fond }}>
              <PreviewText color={p.muted} size="3.8cqw">{previewLorem(2)}</PreviewText>
            </span>
          </div>
          <div className="flex min-w-0 flex-col items-start gap-[8%]">
            <PreviewText color={p.muted} size="4.7cqw" clamp={3}>{previewLorem(10, 6)}</PreviewText>
            <div className="flex gap-[4%]">
              <PreviewPill color={p.fond} bg={p.ink} size="4cqw">{previewLorem(1, 0)}</PreviewPill>
              <PreviewPill color={p.ink} border={p.bordure} size="4cqw">{previewLorem(1, 1)}</PreviewPill>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-end gap-[4%]">
          <PreviewText color={p.ink} size="9.5cqw" weight={700}>{previewLorem(2, 2)}</PreviewText>
          <PreviewPill color={p.principal} bg={p.fond} border={p.principal} size="3.8cqw">{previewLorem(1, 4)}</PreviewPill>
        </div>
      </div>
    </PreviewCardShell>
  );
}

function ExperienceSplitContentPreview({ hero }: { hero: PortfolioHeroSectionSettings }) {
  const p = previewPalette(hero);
  return (
    <PreviewCardShell fond={p.fond}>
      <div className="grid h-full w-full grid-cols-[46%_1fr] items-center gap-[8%] p-[8%]">
        <div className="relative flex min-w-0 flex-col gap-[8%] border-l pl-[8%]" style={{ borderColor: p.bordure }}>
          <span className="absolute -left-px top-0 h-[26%] w-[2px]" style={{ backgroundColor: p.principal }} />
          <PreviewText color={p.ink} size="10.5cqw" weight={700} clamp={2}>
            {previewLorem(3, 2)}
          </PreviewText>
          <PreviewText color={p.muted} size="4.5cqw" uppercase tracking="0.04em">
            {previewLorem(2)}
          </PreviewText>
          <div className="flex gap-[3%]">
            <PreviewPill color={p.fond} bg={p.ink} size="4.2cqw">
              {previewLorem(1, 0)}
            </PreviewPill>
            <PreviewPill color={p.muted} border={p.bordure} size="4.2cqw">
              {previewLorem(1, 1)}
            </PreviewPill>
          </div>
        </div>
        <div className="flex min-w-0 items-center gap-[8%] p-[6%]" style={{ backgroundColor: p.neutre }}>
          <div className="relative w-[46%] shrink-0 pb-[4%] pr-[4%]">
            <span className="absolute bottom-0 right-0 h-[65%] w-[65%]" style={{ backgroundColor: p.principal }} />
            <PreviewBox bg={p.bordure} aspect="4 / 5" width="100%" className="relative" />
          </div>
          <div className="flex min-w-0 flex-1 flex-col items-start gap-[8%]">
            <PreviewText color={p.principal} size="3.8cqw" uppercase tracking="0.08em">{previewLorem(2)}</PreviewText>
            <PreviewText color={p.ink} size="13cqw" weight={700}>{previewLorem(1, 10)}</PreviewText>
            <PreviewText color={p.muted} size="4cqw" clamp={3} className="w-full">{previewLorem(6, 8)}</PreviewText>
          </div>
        </div>
      </div>
    </PreviewCardShell>
  );
}

function EditorialOverlapContentPreview({ hero }: { hero: PortfolioHeroSectionSettings }) {
  const p = previewPalette(hero);
  return (
    <PreviewCardShell fond={p.fond}>
      <div className="relative h-full w-full p-[8%]">
        <div
          className="absolute left-[9%] top-[14%] h-[72%] w-[40%] overflow-hidden border"
          style={{ backgroundColor: p.neutre, borderColor: p.bordure }}
        />
        <div className="absolute left-[53%] top-[24%] z-[1] flex w-[41%] flex-col items-start gap-[7%]">
          <div className="flex items-center gap-[5%]">
            <span className="size-[0.45rem]" style={{ backgroundColor: p.principal }} />
            <PreviewText color={p.muted} size="3.8cqw" uppercase tracking="0.08em">
              {previewLorem(2)}
            </PreviewText>
          </div>
          <div className="w-full">
            <PreviewText color={p.ink} size="10cqw" weight={700} clamp={2}>{previewLorem(4, 2)}</PreviewText>
          </div>
          <div className="w-[88%] border-t pt-[7%]" style={{ borderColor: p.bordure }}>
            <PreviewText color={p.muted} size="4cqw" clamp={3}>{previewLorem(7, 6)}</PreviewText>
          </div>
        </div>
      </div>
    </PreviewCardShell>
  );
}

function SelectedWorksContentPreview({ hero }: { hero: PortfolioHeroSectionSettings }) {
  const p = previewPalette(hero);
  return (
    <PreviewCardShell fond={p.fond}>
      <div className="flex h-full w-full flex-col p-[7%]">
        <div className="grid grid-cols-[1.15fr_.85fr] items-start gap-[7%]">
          <div className="flex min-w-0 flex-col gap-[5%]">
            <PreviewText color={p.principal} size="9.5cqw" weight={700} clamp={1}>{previewLorem(1, 2)}</PreviewText>
            <PreviewText color={p.ink} size="8.5cqw" weight={700} clamp={2}>/ {previewLorem(2, 3)}</PreviewText>
          </div>
          <div className="flex flex-col gap-[10%] pt-[8%]">
            <div className="flex items-center gap-[4%]">
              <PreviewDot color={p.principal} size="0.5em" />
              <PreviewText color={p.muted} size="3.3cqw" uppercase tracking="0.1em">{previewLorem(2)}</PreviewText>
            </div>
            <div className="h-px w-full" style={{ backgroundColor: p.bordure }} />
            <PreviewText color={p.muted} size="4cqw" clamp={3}>{previewLorem(9, 6)}</PreviewText>
          </div>
        </div>
        <div className="mt-auto flex flex-col gap-[3%]">
          <div className="flex items-center justify-between border-b pb-[2%]" style={{ borderColor: p.bordure }}>
            <PreviewText color={p.muted} size="3.2cqw" uppercase tracking="0.1em">{previewLorem(2, 16)}</PreviewText>
            <PreviewText color={p.ink} size="3.2cqw" uppercase tracking="0.1em">{previewLorem(2, 18)} ↗</PreviewText>
          </div>
          <div className="grid h-[5.25rem] grid-cols-[1.35fr_1fr_.72fr_1fr] items-end gap-[3%]">
            {["100%", "84%", "70%", "90%"].map((height, index) => (
              <div key={height} className="relative w-full overflow-hidden border" style={{ height, backgroundColor: p.neutre, borderColor: p.bordure }}>
                <span className="absolute bottom-[7%] left-[7%] font-mono text-[2.6cqw]" style={{ color: p.ink }}>0{index + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PreviewCardShell>
  );
}

function StatementOverlapContentPreview({ hero }: { hero: PortfolioHeroSectionSettings }) {
  const p = previewPalette(hero);
  const serif = '"Playfair Display", Georgia, serif';
  return (
    <PreviewCardShell fond={p.fond}>
      <div className="absolute left-[37.5%] top-[14%] h-[52%] w-[29%]" style={{ backgroundColor: `color-mix(in srgb, ${p.ink} 24%, ${p.fond})` }} />
      <p className="absolute left-[5%] top-[22%] z-10 m-0" style={{ color: p.ink, fontFamily: serif, fontSize: '15cqw', lineHeight: 0.84, letterSpacing: '-0.045em' }}>
        {previewLorem(1, 0)}
      </p>
      <p className="absolute bottom-[32%] right-[5%] z-10 m-0 text-right" style={{ color: p.ink, fontFamily: serif, fontSize: '15cqw', lineHeight: 0.84, letterSpacing: '-0.045em' }}>
        {previewLorem(1, 1)}
        <span style={{ color: p.principal }}>.</span>
      </p>
      <span className="absolute bottom-[31%] left-[5%] h-[0.6cqw] w-[6cqw]" style={{ backgroundColor: p.principal }} />
      <PreviewText color={p.ink} size="4.2cqw" fontFamily={serif} className="absolute bottom-[24%] left-[5%]">
        {previewLorem(2, 3)}
      </PreviewText>
      <div className="absolute inset-x-[5%] bottom-[14%]" style={{ borderTop: `1px solid ${p.bordure}` }} />
      <PreviewText color={p.ink} size="3.4cqw" fontFamily={serif} className="absolute bottom-[6%] left-[5%]">
        {previewLorem(4, 5)}
      </PreviewText>
      <PreviewText color={p.ink} size="3.4cqw" fontFamily={serif} className="absolute bottom-[6%] left-[42%] border-b" >
        {previewLorem(2, 9)}
      </PreviewText>
    </PreviewCardShell>
  );
}

function ColophonContentPreview({ hero }: { hero: PortfolioHeroSectionSettings }) {
  const p = previewPalette(hero);
  return (
    <PreviewCardShell fond={p.fond}>
      <div className="flex h-full w-full flex-col px-[7%] pt-[8%]">
        <div style={{ borderTop: `1px solid ${p.ink}` }} />
        <div className="mt-[3%] grid grid-cols-3 gap-[4%]">
          {[0, 2, 4].map((start) => (
            <PreviewText key={start} color={start === 0 ? p.ink : p.muted} size="3.4cqw" clamp={2}>
              {previewLorem(3, start)}
            </PreviewText>
          ))}
        </div>
        <div className="mt-[9%] grid grid-cols-[1.1fr_0.9fr] items-center gap-[6%]">
          <PreviewText color={p.ink} size="6cqw" weight={500} clamp={4} className="[text-indent:1.6em]">
            {previewLorem(12, 4)}
          </PreviewText>
          <div className="flex flex-col">
            {['01', '02', '03', '04'].map((n, index) => (
              <div
                key={n}
                className="flex gap-[8%] py-[5%]"
                style={{ borderTop: `1px solid ${p.bordure}` }}
              >
                <PreviewText color={index === 1 ? p.principal : p.muted} size="3.4cqw">
                  {n}
                </PreviewText>
                <PreviewText color={p.ink} size="3.6cqw" clamp={1}>
                  {previewLorem(2, index * 2)}
                </PreviewText>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-auto overflow-hidden" style={{ height: '16cqw' }}>
          <p
            className="m-0 whitespace-nowrap font-medium"
            style={{ color: p.ink, fontSize: '18cqw', lineHeight: 1, letterSpacing: '-0.05em', marginTop: '-0.045em' }}
          >
            {previewLorem(2, 2)}
          </p>
        </div>
      </div>
    </PreviewCardShell>
  );
}

function IdentityIndexContentPreview({ hero }: { hero: PortfolioHeroSectionSettings }) {
  const p = previewPalette(hero);
  return (
    <PreviewCardShell fond={p.fond}>
      <div className="flex h-full w-full flex-col items-center gap-[5%] p-[8%] text-center">
        <div style={{ width: '14%', borderTop: `2px solid ${p.ink}` }} />
        <PreviewText color={p.ink} size="11cqw" weight={700} clamp={1} className="w-full">
          {previewLorem(2, 2)}
        </PreviewText>
        <div className="grid w-full grid-cols-3 gap-[4%]">
          {['02', '05', '12'].map((value, index) => (
            <div key={value} className="flex flex-col items-center gap-[2%]">
              <PreviewText color={p.muted} size="3.8cqw" uppercase tracking="0.05em">
                {previewLorem(1, index)}
              </PreviewText>
              <PreviewText color={p.ink} size="6cqw" weight={700}>
                {value}
              </PreviewText>
            </div>
          ))}
        </div>
        <div className="w-full" style={{ borderTop: `1px solid ${p.bordure}` }} />
        <PreviewText color={p.muted} size="4.6cqw" clamp={2} className="mt-auto w-full">
          {previewLorem(9, 6)}
        </PreviewText>
      </div>
    </PreviewCardShell>
  );
}

function StudioSplitContentPreview({ hero }: { hero: PortfolioHeroSectionSettings }) {
  const p = previewPalette(hero);
  const frameStyle = hero.heroStudioSplitFrameStyle ?? 'circle-center';
  const frameClass = frameStyle === 'circle-center'
    ? 'inset-x-[29%] bottom-[4%] aspect-square rounded-full'
    : frameStyle === 'portrait'
      ? 'left-[35%] bottom-[4%] h-[50%] w-[30%] rounded-[16%]'
      : frameStyle === 'offset-square'
        ? 'bottom-[4%] right-[8%] aspect-square w-[43%]'
        : 'inset-x-[6%] bottom-[6%] h-[48%]';
  const frameClipPath = frameStyle === 'panorama'
    ? 'polygon(0 0, 90% 0, 100% 20%, 100% 100%, 0 100%)'
    : frameStyle === 'offset-square'
      ? 'polygon(0 0, 84% 0, 100% 16%, 100% 100%, 0 100%)'
      : undefined;
  return (
    <PreviewCardShell fond={p.fond}>
      <div className="relative flex h-full w-full flex-col">
        <div className="grid h-[66%] grid-cols-[1.15fr_.85fr] gap-[7%] p-[8%]" style={{ backgroundColor: p.principal }}>
          <div className="flex flex-col gap-[4%]">
            <PreviewText color={p.fond} size="3.4cqw" uppercase tracking="0.12em">
              {previewLorem(2)}
            </PreviewText>
            <PreviewText color={p.fond} size="9.5cqw" weight={700} clamp={2}>
              {previewLorem(3, 2)}
            </PreviewText>
            <PreviewText color={p.fond} size="3.8cqw" clamp={1}>{previewLorem(2, 12)}</PreviewText>
          </div>
          <div className="flex flex-col gap-[7%]">
            <PreviewText color={p.fond} size="4cqw" clamp={3}>
              {previewLorem(9, 8)}
            </PreviewText>
            <div className="flex gap-[4%]">
              <PreviewPill color={p.principal} bg={p.fond} size="3.4cqw">{previewLorem(1)}</PreviewPill>
              <PreviewPill color={p.fond} border={p.fond} size="3.4cqw">{previewLorem(1, 1)}</PreviewPill>
            </div>
            <div className="flex items-center gap-[4%]">
              <PreviewDot color={p.fond} size="0.5em" />
              <PreviewText color={p.fond} size="3.2cqw" uppercase tracking="0.08em">{previewLorem(2, 5)}</PreviewText>
            </div>
          </div>
        </div>
        <div className={`absolute overflow-hidden border ${frameClass}`} style={{ backgroundColor: p.neutre, borderColor: p.bordure, clipPath: frameClipPath }}>
          <span className="absolute left-[20%] top-[18%] size-[38%] rounded-full border" style={{ borderColor: p.principal }} />
          <span className="absolute bottom-[16%] right-[16%] size-[24%] rotate-45 border" style={{ borderColor: p.bordure }} />
        </div>
      </div>
    </PreviewCardShell>
  );
}

function WorkDuoContentPreview({ hero }: { hero: PortfolioHeroSectionSettings }) {
  const p = previewPalette(hero);
  return (
    <PreviewCardShell fond={p.fond}>
      <div className="grid h-full w-full grid-cols-[0.95fr_1.15fr] gap-[5%] p-[8%]">
        <div className="flex min-h-0 flex-col justify-between">
          <div className="flex flex-col gap-[4%]">
            <PreviewText color={p.muted} size="4.6cqw" uppercase tracking="0.05em">
              {previewLorem(2)}
            </PreviewText>
            <PreviewText color={p.ink} size="9.5cqw" weight={700} clamp={2}>
              {previewLorem(3, 2)}
            </PreviewText>
            <PreviewText color={p.muted} size="4.4cqw" clamp={2}>
              {previewLorem(7, 6)}
            </PreviewText>
          </div>
          <div className="flex items-end justify-between gap-[4%]">
            <PreviewText color={p.muted} size="2.8cqw" uppercase tracking="0.05em" clamp={2}>
              {hero.heroWorkDuoExperienceLabel || 'Experience built through real projects'}
            </PreviewText>
            <PreviewText color={p.ink} size="12cqw" weight={700}>
              {previewLorem(1, 14)}
            </PreviewText>
          </div>
        </div>
        <div className="flex min-h-0 flex-col gap-[4%]">
          <PreviewText color={p.muted} size="4cqw" uppercase tracking="0.05em" className="text-right">
            {previewLorem(2, 16)}
          </PreviewText>
          <div className="grid flex-1 grid-cols-2 gap-[4%]">
            <PreviewBox bg={p.neutre} aspect="3 / 4" radius="10%" ring={p.bordure} />
            <PreviewBox bg={p.neutre} aspect="3 / 4" radius="10%" ring={p.bordure} />
          </div>
        </div>
      </div>
    </PreviewCardShell>
  );
}

function BowlIntroContentPreview({ hero }: { hero: PortfolioHeroSectionSettings }) {
  const p = previewPalette(hero);
  const motif = hero.heroBowlIntroMotif ?? 'bowl';
  return (
    <PreviewCardShell fond={p.fond}>
      <div className="grid h-full w-full grid-cols-[0.9fr_1.1fr] items-center gap-[5%] p-[8%]">
        <div className="relative flex flex-col items-center gap-[4%] pb-[8%]">
          <PreviewPill color={p.fond} bg={p.ink} size="4.2cqw">
            {previewLorem(2, 0)}
          </PreviewPill>
          {motif === 'bowl' ? <span className="absolute inset-x-[-8%] bottom-0 h-[42%] rounded-[50%_50%_15%_15%] border" style={{ backgroundColor: p.principal, borderColor: p.bordure, opacity: 0.26 }} /> : null}
          {motif === 'hug' ? <span className="absolute inset-x-[-3%] bottom-[3%] top-[13%] rounded-[24%_24%_45%_45%] border" style={{ borderColor: p.principal }} /> : null}
          {motif === 'orbs-top' ? <span className="absolute -left-[9%] top-[15%] size-[34%] rounded-full" style={{ backgroundColor: p.principal, opacity: 0.3 }} /> : null}
          {motif === 'orbs-bottom' ? <span className="absolute -bottom-[1%] -left-[4%] aspect-[3/4] w-[82%] rounded-[20%_20%_42%_20%] border" style={{ borderColor: p.principal }} /> : null}
          <PreviewBox bg={p.neutre} aspect="3 / 4" radius={motif === 'orbs-top' ? '14%' : '24%'} ring={p.bordure} className="relative z-[1] w-full" />
        </div>
        <div className="flex min-w-0 flex-col gap-[4%]">
          <PreviewText color={p.ink} size="9.5cqw" weight={700} clamp={2}>
            {previewLorem(3, 2)}
          </PreviewText>
          <PreviewText color={p.muted} size="4.6cqw" clamp={2}>
            {previewLorem(8, 6)}
          </PreviewText>
          <div className="flex gap-[3%]">
            <PreviewPill color={p.fond} bg={p.ink} size="4.2cqw">
              {previewLorem(1, 0)}
            </PreviewPill>
            <PreviewPill color={p.muted} border={p.bordure} size="4.2cqw">
              {previewLorem(1, 1)}
            </PreviewPill>
          </div>
        </div>
      </div>
    </PreviewCardShell>
  );
}

const HERO_BANNER_CONTENT_PREVIEWS: Partial<
  Record<PortfolioHeroBannerDesign, (props: { hero: PortfolioHeroSectionSettings }) => ReactNode>
> = {
  'swiss-editorial': SwissEditorialContentPreview,
  'portrait-identity': PortraitIdentityContentPreview,
  'editorial-rail': EditorialRailContentPreview,
  'statement-cta': StatementCtaContentPreview,
  'portrait-balance': PortraitBalanceContentPreview,
  'left-portrait': LeftPortraitContentPreview,
  'circle-portrait': CirclePortraitContentPreview,
  'experience-split': ExperienceSplitContentPreview,
  'editorial-overlap': EditorialOverlapContentPreview,
  'selected-works': SelectedWorksContentPreview,
  'identity-index': IdentityIndexContentPreview,
  'studio-split': StudioSplitContentPreview,
  'work-duo': WorkDuoContentPreview,
  'bowl-intro': BowlIntroContentPreview,
  colophon: ColophonContentPreview,
  'statement-overlap': StatementOverlapContentPreview,
};

/** Mini wireframe for Hero → Banner design picker. */
export function HeroBannerDesignPreview({
  design,
  hero,
}: {
  design: PortfolioHeroBannerDesign;
  hero?: PortfolioHeroSectionSettings;
}) {
  const ContentPreview = hero && !HERO_BANNER_SKELETONS[design]
    ? HERO_BANNER_CONTENT_PREVIEWS[design]
    : undefined;
  if (ContentPreview) {
    return <ContentPreview hero={hero!} />;
  }
  return (
    <div
      className={`${
        design === 'swiss-editorial' ||
        design === 'portrait-identity' ||
        design === 'editorial-rail' ||
        design === 'statement-cta' ||
        design === 'portrait-balance' ||
        design === 'left-portrait' ||
        design === 'circle-portrait' ||
        design === 'experience-split' ||
        design === 'editorial-overlap' ||
        design === 'selected-works' ||
        design === 'identity-index' ||
        design === 'studio-split' ||
        design === 'work-duo' ||
        design === 'bowl-intro' ||
        design === 'colophon' ||
        design === 'statement-overlap'
          ? 'aspect-[2/1] w-full'
          : 'aspect-square'
      } overflow-hidden rounded-xl border border-neutral-200/80 bg-white`}
      aria-hidden
    >
      <PortfolioHeroBannerSkeleton design={design} preview />
    </div>
  );
}
