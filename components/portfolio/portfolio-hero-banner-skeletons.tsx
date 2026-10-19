import type { ReactNode } from 'react';
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

function Bone({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-neutral-200 ${className}`.trim()} />;
}

const HERO_SHELL =
  'relative isolate flex min-h-[100dvh] min-h-screen w-full flex-col overflow-x-clip bg-white px-5 pb-16 pt-20 sm:px-10 md:px-16 lg:px-20 xl:px-40';

const HERO_SHELL_PREVIEW =
  'relative isolate flex h-full flex-col justify-center overflow-hidden bg-white px-2 pb-2 pt-2.5';

function CirclePortrait({ className = '' }: { className?: string }) {
  return <Bone className={`aspect-square rounded-full bg-neutral-300 ${className}`.trim()} />;
}

type HeroBannerSkeletonProps = { preview?: boolean };

function shellClass(preview?: boolean) {
  return preview ? HERO_SHELL_PREVIEW : HERO_SHELL;
}

function SwissEditorialHeroBannerSkeleton({ preview }: HeroBannerSkeletonProps = {}) {
  if (preview) {
    return (
      <section className={`${shellClass(true)} bg-neutral-50`} aria-hidden>
        <div className="relative mx-auto flex w-full items-start gap-2">
          <div className="min-w-0 flex-1 space-y-2">
            <Bone className="h-4 w-full rounded-xs" />
            <Bone className="h-4 w-[65%] rounded-xs" />
          </div>
          <div className="w-14 shrink-0 overflow-hidden rounded-[0.4rem_42%_0.55rem_28%] bg-neutral-100">
            <Bone className="aspect-[3/4] w-full rounded-none bg-neutral-300" />
          </div>
        </div>
      </section>
    );
  }
  return (
    <section className={`${shellClass(preview)} bg-neutral-50`} aria-hidden>
      <div
        className={`relative mx-auto flex w-full max-w-6xl flex-col ${
          preview ? 'gap-1.5' : 'h-full flex-1 justify-between gap-6'
        }`}
      >
        <div className={`grid w-full items-start ${preview ? 'gap-2' : 'gap-8'} grid-cols-[minmax(0,1.9fr)_minmax(0,1fr)]`}>
          <div className={`min-w-0 space-y-2 ${preview ? '' : 'max-w-md'}`}>
            <Bone className={`w-full rounded-xs ${preview ? 'h-4' : 'h-10 sm:h-12'}`} />
            <Bone className={`w-[88%] rounded-xs ${preview ? 'h-4' : 'h-10 sm:h-12'}`} />
            <Bone className={`w-[70%] rounded-xs ${preview ? 'h-4' : 'h-10 sm:h-12'}`} />
          </div>
          <div
            className={`relative z-[1] justify-self-end overflow-hidden bg-neutral-100 ${
              preview
                ? 'w-14 translate-y-1 rounded-[0.4rem_42%_0.55rem_28%]'
                : 'w-36 translate-y-2 rounded-[0.85rem_46%_1.1rem_26%] sm:w-44'
            }`}
          >
            <Bone className="aspect-[3/4] w-full rounded-none bg-neutral-300" />
          </div>
        </div>

        <div className={`flex items-center ${preview ? 'gap-3' : 'gap-8'} ${preview ? 'w-[52%]' : 'max-w-md'}`}>
          <div className="space-y-1.5">
            <Bone className={`w-14 ${preview ? 'h-1.5' : 'h-2.5'}`} />
            <Bone className={`w-20 ${preview ? 'h-2' : 'h-3.5'}`} />
          </div>
          <div className={`self-stretch bg-neutral-200 ${preview ? 'h-6 w-px' : 'h-10 w-px'}`} />
          <div className="space-y-1.5">
            <Bone className={`w-16 ${preview ? 'h-1.5' : 'h-2.5'}`} />
            <Bone className={`w-24 ${preview ? 'h-2' : 'h-3.5'}`} />
          </div>
        </div>

        <Bone
          className={`relative z-[2] w-full ${preview ? 'h-8' : 'h-[4.5rem] sm:h-24'}`}
        />
      </div>
    </section>
  );
}

function PortraitIdentityHeroBannerSkeleton({ preview }: HeroBannerSkeletonProps = {}) {
  if (preview) {
    return (
      <section className={shellClass(true)} aria-hidden>
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <Bone className="h-2.5 w-[45%]" />
            <div className="flex items-center gap-1.5">
              <Bone className="size-1.5 rounded-full bg-neutral-300" />
              <Bone className="h-2 w-12" />
            </div>
          </div>
          <div className="w-full border-t border-neutral-200" />
          <div className="grid grid-cols-[42%_4%_1fr] items-start">
            <div className="relative w-full max-w-[4rem] shrink-0 overflow-hidden rounded-none bg-neutral-100 ring-1 ring-neutral-200/80">
              <Bone className="aspect-[4/5] w-full rounded-none bg-neutral-300" />
              <Bone className="absolute bottom-0 left-0 h-0.5 w-[28%] rounded-none bg-neutral-400" />
            </div>
            <div aria-hidden />
            <div className="flex min-w-0 flex-col gap-1.5">
              <Bone className="h-5 w-full" />
              <Bone className="h-2.5 w-[42%] rounded-full bg-neutral-300" />
              <div className="mt-2 flex gap-1 border-t border-neutral-200 pt-1.5">
                <Bone className="h-4 w-12 rounded-sm bg-neutral-300" />
                <Bone className="h-4 w-10 rounded-sm" />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }
  return (
    <section className={shellClass(preview)} aria-hidden>
      <div
        className={`mx-auto flex w-full max-w-6xl flex-col ${
          preview ? 'gap-2' : 'h-full flex-1 justify-center gap-0'
        }`}
      >
        {/* Top 3-col: bio ~44% | spacer | availability */}
        <div
          className="grid w-full items-end"
          style={{
            gridTemplateColumns: preview
              ? 'minmax(0, 42%) minmax(0, 4%) minmax(0, 1fr)'
              : 'minmax(10rem, 42%) minmax(1.5rem, 4%) minmax(0, 1fr)',
          }}
        >
          <div className={`min-w-0 ${preview ? 'space-y-1.5' : 'space-y-2'}`}>
            <Bone className={`w-full ${preview ? 'h-2.5' : 'h-4 sm:h-5'}`} />
            <Bone className={`w-[92%] ${preview ? 'h-2.5' : 'h-4 sm:h-5'}`} />
            <Bone className={`w-[70%] ${preview ? 'h-2.5' : 'h-4 sm:h-5'}`} />
          </div>
          <div aria-hidden />
          <Bone
            className={`justify-self-start ${preview ? 'h-2.5 w-16' : 'h-3.5 w-36 sm:h-4 sm:w-44'}`}
          />
        </div>

        {/* Hairline */}
        <div
          className={`w-full border-t border-neutral-200 ${
            preview ? 'my-1.5' : 'my-8 sm:my-10'
          }`}
        />

        {/* Bottom 3-col: portrait | spacer | name + specialty + CTAs */}
        <div
          className="grid w-full items-start"
          style={{
            gridTemplateColumns: preview
              ? 'minmax(0, 42%) minmax(0, 4%) minmax(0, 1fr)'
              : 'minmax(10rem, 42%) minmax(1.5rem, 4%) minmax(0, 1fr)',
          }}
        >
          <div
            className={`relative overflow-hidden rounded-none bg-neutral-100 ring-1 ring-neutral-200/80 ${
              preview ? 'w-full max-w-[3.5rem]' : 'w-full max-w-[14rem]'
            }`}
          >
            <Bone className="aspect-[4/5] w-full rounded-none bg-neutral-300" />
            <Bone className="absolute bottom-0 left-0 h-1 w-[28%] rounded-none bg-neutral-400" />
          </div>
          <div aria-hidden />
          <div
            className={`flex min-h-0 min-w-0 flex-col self-stretch ${
              preview ? 'gap-1.5' : 'gap-6'
            }`}
          >
            <div className={preview ? 'space-y-1' : 'space-y-3'}>
              <Bone className={`w-[min(100%,14rem)] ${preview ? 'h-5' : 'h-12 sm:h-16'}`} />
              <Bone
                className={`rounded-full bg-neutral-300 ${
                  preview ? 'h-3 w-16' : 'h-6 w-36 sm:h-7 sm:w-44'
                }`}
              />
            </div>
            <div
              className={`mt-auto flex flex-wrap items-center border-t border-neutral-200 ${
                preview ? 'gap-1.5 pt-1.5' : 'gap-3 pt-4'
              }`}
            >
              <Bone
                className={`rounded-sm bg-neutral-300 ${
                  preview ? 'h-5 w-14' : 'h-12 w-32 sm:h-14 sm:w-36'
                }`}
              />
              <Bone
                className={`rounded-sm ${preview ? 'h-5 w-14' : 'h-12 w-28 sm:h-14 sm:w-32'}`}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function EditorialRailHeroBannerSkeleton({ preview }: HeroBannerSkeletonProps = {}) {
  if (preview) {
    return (
      <section className={shellClass(true)} aria-hidden>
        <div className="mx-auto grid min-h-0 max-w-6xl grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)] items-stretch gap-x-2">
          <div className="flex min-h-0 flex-col justify-center gap-1.5">
            <div className="flex items-center gap-1">
              <Bone className="size-1 rounded-full bg-neutral-300" />
              <Bone className="h-1.5 w-10" />
              <Bone className="h-px w-7 rounded-none bg-neutral-300" />
            </div>
            <Bone className="h-4 w-[92%]" />
            <Bone className="h-4 w-[78%]" />
            <div className="mt-auto inline-flex w-fit overflow-hidden rounded-sm border border-neutral-200">
              {Array.from({ length: 4 }).map((_, index) => (
                <Bone
                  key={index}
                  className={`h-3 w-7 rounded-none ${index > 0 ? 'border-l border-neutral-200' : ''}`}
                />
              ))}
            </div>
          </div>
          <div className="relative ml-auto aspect-[3/4] h-full max-h-full w-full overflow-hidden rounded-bl-sm rounded-br-xl rounded-tl-xl rounded-tr-sm bg-neutral-100 ring-1 ring-neutral-200/80">
            <Bone className="absolute inset-0 rounded-none bg-neutral-300" />
            <Bone className="absolute left-1 top-[12%] h-[11%] w-0.5 rounded-none bg-neutral-400" />
          </div>
        </div>
      </section>
    );
  }
  return (
    <section className={shellClass(preview)} aria-hidden>
      <div
        className={`mx-auto grid min-h-0 max-w-6xl items-stretch ${
          preview
            ? 'grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)] gap-x-2'
            : 'h-full flex-1 grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)] gap-x-6 sm:gap-x-10'
        }`}
      >
        <div className="flex min-h-0 min-w-0 flex-col">
          <div
            className={`flex min-h-0 flex-1 flex-col justify-center ${
              preview ? 'gap-1.5' : 'gap-3 sm:gap-5'
            }`}
          >
            <div className="flex items-center gap-2">
              <Bone className={`shrink-0 rounded-full bg-neutral-300 ${preview ? 'h-1.5 w-1.5' : 'h-2 w-2'}`} />
              <Bone className={`rounded-full ${preview ? 'h-1.5 w-14' : 'h-2.5 w-28'}`} />
              <Bone className={`rounded-none bg-neutral-300 ${preview ? 'h-px w-8' : 'h-px w-14'}`} />
            </div>
            <div className={preview ? 'space-y-1' : 'space-y-1.5 sm:space-y-2'}>
              <Bone className={preview ? 'h-4 w-[92%]' : 'h-7 w-[92%] sm:h-10 md:h-12'} />
              <Bone className={preview ? 'h-4 w-[78%]' : 'h-7 w-[78%] sm:h-10 md:h-12'} />
            </div>
            <div className={preview ? 'space-y-1' : 'space-y-1.5'}>
              <Bone className={`w-full max-w-[22rem] ${preview ? 'h-1.5' : 'h-2.5'}`} />
              <Bone className={`w-[88%] max-w-[20rem] ${preview ? 'h-1.5' : 'h-2.5'}`} />
              <Bone className={`w-[72%] max-w-[16rem] ${preview ? 'h-1.5' : 'h-2.5'}`} />
            </div>
          </div>
          <div className={`mt-auto shrink-0 ${preview ? 'pt-1.5' : 'pt-4 sm:pt-6'}`}>
            <Bone className={`mb-1.5 ${preview ? 'h-1.5 w-10' : 'mb-2 h-2 w-16'}`} />
            <div className="inline-flex max-w-full overflow-hidden rounded-sm border border-neutral-200 bg-neutral-50">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-1.5 ${
                    preview
                      ? 'min-h-[1rem] min-w-[1.65rem] px-1 py-0.5'
                      : 'min-h-[1.75rem] min-w-[2.75rem] px-2 py-1.5 sm:min-h-[2.15rem] sm:min-w-[4.5rem] sm:px-3'
                  } ${index > 0 ? 'border-l border-neutral-200' : ''}`}
                >
                  <Bone className={preview ? 'size-0.5 bg-neutral-400' : 'h-1 w-1.5 bg-neutral-400'} />
                  <Bone className={preview ? 'h-1 w-5' : 'h-2 w-8 sm:w-10'} />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="relative ml-auto aspect-[3/4] h-full max-h-full w-full overflow-hidden rounded-bl-sm rounded-br-3xl rounded-tl-3xl rounded-tr-sm bg-neutral-100 ring-1 ring-neutral-200/80">
          <Bone className="absolute inset-0 rounded-none bg-neutral-300" />
          <Bone className="absolute left-1.5 top-[12%] h-[11%] w-0.5 rounded-none bg-neutral-400" />
        </div>
      </div>
    </section>
  );
}

function StatementCtaHeroBannerSkeleton({ preview }: HeroBannerSkeletonProps = {}) {
  if (preview) {
    return (
      <section className={shellClass(true)} aria-hidden>
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-2">
          <CirclePortrait className="w-[min(100%,3rem)]" />
          <Bone className="h-2 w-[60%]" />
        </div>
      </section>
    );
  }
  return (
    <section className={shellClass(preview)} aria-hidden>
      <div
        className={`mx-auto flex min-h-0 max-w-6xl flex-col ${
          preview ? 'h-full' : 'h-full flex-1'
        }`}
      >
        <div
          className={`grid items-start ${
            preview ? 'grid-cols-[minmax(0,74fr)_minmax(0,26fr)] gap-x-2' : 'grid-cols-[minmax(0,74fr)_minmax(0,26fr)] gap-x-4 sm:gap-x-8'
          }`}
        >
          <Bone className={preview ? 'h-5 w-[92%]' : 'h-8 w-[92%] sm:h-11 md:h-14'} />
          <div className={`flex items-center justify-end gap-1.5 ${preview ? '' : 'gap-2 pt-1'}`}>
            <Bone className={`shrink-0 rounded-full bg-neutral-300 ${preview ? 'h-1.5 w-1.5' : 'h-2 w-2'}`} />
            <Bone className={`rounded-full ${preview ? 'h-1.5 w-10' : 'h-2.5 w-24'}`} />
          </div>
        </div>

        <div className={`${preview ? 'h-1.5' : 'h-[clamp(1.25rem,4vh,3.5rem)]'} shrink-0`} aria-hidden />

        <div
          className={`grid min-h-0 flex-1 items-start ${
            preview ? 'grid-cols-[minmax(0,74fr)_minmax(0,26fr)] gap-x-2' : 'grid-cols-[minmax(0,74fr)_minmax(0,26fr)] gap-x-4 sm:gap-x-8'
          }`}
        >
          <div className="flex justify-center">
            <div className="relative">
              <CirclePortrait className={preview ? 'w-[min(100%,2.75rem)]' : 'w-[min(100%,7.5rem)] sm:w-[min(100%,11rem)]'} />
              <Bone className="absolute -inset-1 rounded-full border border-neutral-200 bg-transparent" />
              <Bone className={`absolute -right-1 top-[18%] rounded-full bg-neutral-400 ${preview ? 'size-1' : 'size-2'}`} />
            </div>
          </div>
          <div className={`min-w-0 ${preview ? 'space-y-1.5' : 'space-y-3 sm:space-y-4'}`}>
            <div className="flex items-center gap-1.5">
              <Bone className={preview ? 'h-px w-6 bg-neutral-400' : 'h-px w-12 bg-neutral-400'} />
              <Bone className={preview ? 'size-1 rotate-45 rounded-none bg-neutral-400' : 'size-1.5 rotate-45 rounded-none bg-neutral-400'} />
            </div>
            <div className={preview ? 'space-y-1' : 'space-y-1.5'}>
              <Bone className={`w-full ${preview ? 'h-1.5' : 'h-2.5'}`} />
              <Bone className={`w-[94%] ${preview ? 'h-1.5' : 'h-2.5'}`} />
              <Bone className={`w-[80%] ${preview ? 'h-1.5' : 'h-2.5'}`} />
              <Bone className={`w-[88%] ${preview ? 'h-1.5' : 'h-2.5'}`} />
              <Bone className={`w-[70%] ${preview ? 'h-1.5' : 'h-2.5'}`} />
            </div>
            <div className={`flex flex-wrap items-center ${preview ? 'gap-x-2 gap-y-1' : 'gap-x-5 gap-y-2'}`}>
              <Bone
                className={`rounded-sm bg-neutral-300 ${
                  preview ? 'h-4 w-12' : 'h-8 w-28 sm:h-10 sm:w-36'
                }`}
              />
              <Bone className={preview ? 'h-1.5 w-10' : 'h-2.5 w-24'} />
            </div>
          </div>
        </div>

        <div className={`mt-auto shrink-0 ${preview ? 'pt-1.5' : 'pt-4 sm:pt-6'}`}>
          <div className="h-px w-full bg-neutral-200" />
          <div
            className={`flex w-full items-baseline justify-between gap-1 ${
              preview ? 'mt-1.5' : 'mt-3 sm:mt-5 gap-2'
            }`}
          >
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-baseline gap-1">
                <Bone className={preview ? 'h-1 w-1.5 bg-neutral-400' : 'h-1.5 w-2 bg-neutral-400'} />
                <Bone className={preview ? 'h-1.5 w-6' : 'h-2.5 w-10 sm:h-3 sm:w-14'} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function PortraitBalanceHeroBannerSkeleton({ preview }: HeroBannerSkeletonProps = {}) {
  if (preview) {
    return (
      <section className={shellClass(true)} aria-hidden>
        <div className="mx-auto grid w-full max-w-6xl grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] items-stretch gap-2">
          <div className="flex flex-col justify-center gap-1.5">
            <Bone className="h-4 w-[85%]" />
            <Bone className="h-4 w-[65%]" />
          </div>
          <Bone className="aspect-[5/6] h-full w-full rounded-none bg-neutral-300" />
        </div>
      </section>
    );
  }
  return (
    <section className={shellClass(preview)} aria-hidden>
      <div
        className={`mx-auto grid min-h-0 max-w-6xl ${
          preview ? 'h-full gap-x-2' : 'h-full flex-1 gap-x-6 sm:gap-x-10'
        }`}
        style={{
          gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)',
          gridTemplateRows: 'auto minmax(0, 1fr)',
        }}
      >
        <div className={`col-start-2 row-start-1 justify-self-end ${preview ? 'mb-1' : 'mb-2 sm:mb-3'}`}>
          <Bone className={preview ? 'h-2 w-12 rounded-xs' : 'h-3 w-24 rounded-xs sm:h-4 sm:w-32'} />
        </div>

        <div className="col-start-1 row-start-2 flex min-h-0 min-w-0 flex-col self-stretch">
          <div
            className={`flex min-h-0 flex-1 flex-col justify-center ${
              preview ? 'gap-1' : 'gap-2.5 sm:gap-3.5'
            }`}
          >
            <Bone className={`rounded-full ${preview ? 'h-1.5 w-16' : 'h-2.5 w-36 sm:w-44'}`} />
            <div className={`h-px bg-neutral-300 ${preview ? 'w-8' : 'w-16 max-w-[16ch] sm:w-24'}`} />
            <div className={preview ? 'space-y-0.5' : 'space-y-1.5'}>
              <Bone className={preview ? 'h-4 w-[min(100%,14ch)]' : 'h-7 w-[min(100%,14ch)] sm:h-10 md:h-12'} />
              <Bone className={preview ? 'h-4 w-[min(100%,11ch)]' : 'h-7 w-[min(100%,11ch)] sm:h-10 md:h-12'} />
            </div>
          </div>
          <div
            className={`mt-auto flex shrink-0 flex-col ${
              preview ? 'gap-1.5 pt-1' : 'gap-3 pt-3 sm:gap-4 sm:pt-4'
            }`}
          >
            <div className={preview ? 'space-y-1' : 'space-y-2'}>
              <Bone className={preview ? 'h-1.5 w-10' : 'h-2 w-16'} />
              <div className={`flex flex-wrap ${preview ? 'gap-1' : 'gap-1.5'}`}>
                {Array.from({ length: 4 }).map((_, index) => (
                  <Bone
                    key={index}
                    className={`rounded-md border border-neutral-200 bg-neutral-100 ${
                      preview ? 'h-3 w-7' : 'h-5 w-12 sm:h-6 sm:w-14'
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className={`h-px bg-neutral-300 ${preview ? 'w-full' : 'w-full max-w-[20rem]'}`} />
            <div className={preview ? 'space-y-1' : 'space-y-1.5'}>
              <Bone className={`w-full max-w-[20rem] ${preview ? 'h-1.5' : 'h-2.5'}`} />
              <Bone className={`w-[92%] max-w-[18rem] ${preview ? 'h-1.5' : 'h-2.5'}`} />
              <Bone className={`w-[78%] max-w-[15rem] ${preview ? 'h-1.5' : 'h-2.5'}`} />
            </div>
          </div>
        </div>

        <div className="col-start-2 row-start-2 self-stretch">
          <Bone className="aspect-[5/6] h-full w-full rounded-none bg-neutral-300" />
        </div>
      </div>
    </section>
  );
}

function LeftPortraitHeroBannerSkeleton({ preview }: HeroBannerSkeletonProps = {}) {
  if (preview) {
    return (
      <section className={shellClass(true)} aria-hidden>
        <div className="mx-auto grid max-w-6xl grid-cols-[minmax(2.25rem,38%)_minmax(0,1fr)] items-stretch gap-2">
          <div className="overflow-hidden rounded-2xl bg-neutral-100 ring-1 ring-neutral-200/80">
            <Bone className="aspect-[3/4] h-full w-full rounded-2xl bg-neutral-300" />
          </div>
          <div className="flex flex-col justify-center gap-1.5">
            <Bone className="h-2.5 w-[85%]" />
            <Bone className="h-2.5 w-[60%]" />
          </div>
        </div>
      </section>
    );
  }
  return (
    <section className={shellClass(preview)} aria-hidden>
      <div
        className={`mx-auto grid max-w-6xl items-stretch gap-6 ${
          preview
            ? 'grid-cols-[minmax(2.25rem,38%)_minmax(0,1fr)] gap-2'
            : 'h-full flex-1 lg:grid-cols-[minmax(14rem,34%)_minmax(0,1fr)] lg:gap-10'
        }`}
      >
        {/* Portrait left — tall rounded frame */}
        <div
          className={`overflow-hidden rounded-2xl bg-neutral-100 ring-1 ring-neutral-200/80 ${
            preview ? 'min-h-[3.5rem]' : 'h-full min-h-[28rem]'
          }`}
        >
          <Bone
            className={`h-full w-full rounded-2xl bg-neutral-300 ${
              preview ? 'aspect-[3/4] min-h-[3.5rem]' : 'min-h-[28rem]'
            }`}
          />
        </div>

        {/* Right: availability + Hello I'm top; bio + CTAs bottom */}
        <div className={`flex min-h-0 min-w-0 flex-col ${preview ? 'gap-1' : 'h-full'}`}>
          <div className={`shrink-0 ${preview ? 'space-y-1' : 'space-y-4'}`}>
            <div className="flex items-center gap-2">
              <Bone className={`shrink-0 rounded-full bg-neutral-400 ${preview ? 'h-1 w-1' : 'h-2 w-2'}`} />
              <Bone className={preview ? 'h-1.5 w-16' : 'h-3 w-28'} />
            </div>
            <div className={preview ? 'space-y-1' : 'mt-4 space-y-2'}>
              <Bone className={preview ? 'h-2.5 w-[92%]' : 'h-10 w-[min(100%,18rem)] sm:h-12'} />
              <Bone className={preview ? 'h-2.5 w-[72%]' : 'h-10 w-[min(100%,14rem)] sm:h-12'} />
            </div>
          </div>

          <div
            className={`flex min-h-0 flex-1 flex-col items-start justify-end ${
              preview ? 'mt-1 gap-1' : 'gap-6 pt-10'
            }`}
          >
            <div className={`w-full max-w-[32rem] ${preview ? 'space-y-1' : 'space-y-2'}`}>
              <Bone className={preview ? 'h-1.5 w-full' : 'h-3 w-full'} />
              <Bone className={preview ? 'h-1.5 w-[92%]' : 'h-3 w-[92%]'} />
              <Bone className={preview ? 'h-1.5 w-[78%]' : 'h-3 w-[78%]'} />
            </div>
            <div className={`flex flex-wrap items-center ${preview ? 'gap-2' : 'gap-x-8 gap-y-3'}`}>
              <Bone
                className={`rounded-full bg-neutral-300 ${
                  preview ? 'h-3 w-12' : 'h-10 w-28'
                }`}
              />
              <Bone className={preview ? 'h-1.5 w-10' : 'h-3 w-24'} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CirclePortraitHeroBannerSkeleton({ preview }: HeroBannerSkeletonProps = {}) {
  if (preview) {
    return (
      <section className={shellClass(true)} aria-hidden>
        <div className="mx-auto flex w-full max-w-6xl items-center justify-center gap-3">
          <CirclePortrait className="h-10 w-10 max-w-none shrink-0" />
          <div className="flex flex-col gap-1.5">
            <Bone className="h-2.5 w-20" />
            <Bone className="h-2.5 w-14" />
          </div>
        </div>
      </section>
    );
  }
  /* Default: title-bottom — upper 2-col centered; bottom title with rules */
  return (
    <section className={shellClass(preview)} aria-hidden>
      <div
        className={`mx-auto flex w-full max-w-6xl flex-col ${
          preview ? 'gap-1' : 'h-full flex-1 gap-3'
        }`}
      >
        <div
          className={`grid w-full flex-1 items-center ${
            preview
              ? 'grid-cols-2 gap-2'
              : 'grid-cols-1 gap-8 md:grid-cols-2 md:gap-10'
          }`}
        >
          {/* Left: large circle + availability under */}
          <div className="flex w-full items-center justify-start self-center">
            <div className={`flex flex-col items-center ${preview ? 'gap-1' : 'gap-6'}`}>
              <CirclePortrait
                className={
                  preview
                    ? 'h-10 w-10 max-w-none'
                    : 'h-[clamp(10rem,28vw,18rem)] w-[clamp(10rem,28vw,18rem)] max-w-none'
                }
              />
              <div className="flex items-center gap-2">
                <Bone className={`shrink-0 rounded-full bg-neutral-400 ${preview ? 'h-1 w-1' : 'h-2 w-2'}`} />
                <Bone className={preview ? 'h-1.5 w-14' : 'h-3 w-28'} />
              </div>
            </div>
          </div>

          {/* Right: bio + CTAs centered */}
          <div className="flex min-w-0 items-center justify-center self-center">
            <div
              className={`flex w-full max-w-[36rem] flex-col ${
                preview ? 'gap-1.5' : 'gap-10'
              }`}
            >
              <div className={preview ? 'space-y-1' : 'space-y-2'}>
                <Bone className={preview ? 'h-1.5 w-full' : 'h-3 w-full'} />
                <Bone className={preview ? 'h-1.5 w-[94%]' : 'h-3 w-[94%]'} />
                <Bone className={preview ? 'h-1.5 w-[80%]' : 'h-3 w-[80%]'} />
              </div>
              <div className={`flex w-full justify-center ${preview ? 'gap-2' : 'gap-x-8 gap-y-3'}`}>
                <Bone
                  className={`rounded-full bg-neutral-300 ${
                    preview ? 'h-3 w-12' : 'h-10 w-28'
                  }`}
                />
                <Bone className={`self-center ${preview ? 'h-1.5 w-10' : 'h-3 w-24'}`} />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: short bar left — name/specialty — short bar right */}
        <div className={`w-full shrink-0 ${preview ? 'mt-0.5 space-y-1' : 'mt-3 space-y-4'}`}>
          <Bone
            className={`self-start rounded-none bg-neutral-400 ${
              preview ? 'h-0.5 w-8' : 'h-1.5 w-[min(7.5rem,28%)]'
            }`}
          />
          <div className={preview ? 'space-y-1' : 'space-y-2'}>
            <Bone className={preview ? 'h-2.5 w-[70%]' : 'h-10 w-[min(100%,22rem)] sm:h-12'} />
            <Bone className={preview ? 'h-2 w-[45%]' : 'h-8 w-[min(100%,14rem)]'} />
          </div>
          <div className="flex justify-end">
            <Bone
              className={`rounded-none bg-neutral-400 ${
                preview ? 'h-0.5 w-8' : 'h-1.5 w-[min(7.5rem,28%)]'
              }`}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function ExperienceSplitHeroBannerSkeleton({ preview }: HeroBannerSkeletonProps = {}) {
  if (preview) {
    return (
      <section className={shellClass(true)} aria-hidden>
        <div className="mx-auto flex w-full max-w-6xl items-center gap-2">
          <div className="flex flex-1 flex-col gap-1.5">
            <Bone className="h-3 w-[85%]" />
            <Bone className="h-3 w-[60%]" />
          </div>
          <div className="h-10 w-px shrink-0 bg-neutral-300" />
          <div className="flex flex-1 flex-col gap-1.5">
            <Bone className="h-2 w-[70%]" />
            <Bone className="h-2 w-[50%]" />
          </div>
        </div>
      </section>
    );
  }
  /* Default: bio-right — L-frame copy left; portrait + years/bio aside right */
  return (
    <section className={`${shellClass(preview)}${preview ? '' : ' justify-center'}`} aria-hidden>
      <div
        className={`mx-auto grid w-full max-w-6xl items-start ${
          preview
            ? 'grid-cols-[minmax(0,1fr)_auto] gap-2'
            : 'h-full flex-1 grid-cols-1 content-center gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-16'
        }`}
      >
        {/* Left L-frame: title + specialty + 2 CTAs */}
        <div
          className={`min-w-0 justify-self-start border-b border-r border-neutral-300 ${
            preview ? 'space-y-2 pb-1.5 pr-1.5' : 'space-y-8 pb-4 pr-4 sm:pb-5 sm:pr-5'
          }`}
        >
          <div className={preview ? 'space-y-1' : 'space-y-2'}>
            <Bone className={preview ? 'h-3 w-[88%]' : 'h-12 w-[min(100%,16rem)] sm:h-14'} />
            <Bone className={preview ? 'h-3 w-[62%]' : 'h-12 w-[min(100%,11rem)] sm:h-14'} />
          </div>
          <Bone className={preview ? 'h-2 w-20' : 'h-5 w-40'} />
          <div className={`flex flex-wrap items-center ${preview ? 'gap-1.5' : 'gap-3 sm:gap-4'}`}>
            <Bone
              className={`rounded-md bg-neutral-300 ${
                preview ? 'h-3 w-14' : 'h-10 w-28'
              }`}
            />
            <Bone
              className={`rounded-md ring-1 ring-neutral-300 ${
                preview ? 'h-3 w-14' : 'h-10 w-28'
              }`}
            />
          </div>
        </div>

        {/* Right: fixed-ish portrait + experience aside */}
        <div
          className={`flex shrink-0 items-start justify-self-end ${
            preview ? 'gap-1.5' : 'gap-6 sm:gap-8'
          }`}
        >
          <div
            className={`overflow-hidden bg-neutral-100 ${
              preview
                ? 'h-12 w-9'
                : 'h-[clamp(12rem,22vw,20rem)] w-[clamp(9rem,16vw,15rem)]'
            }`}
          >
            <Bone className="h-full w-full rounded-none bg-neutral-300" />
          </div>
          <aside
            className={`flex min-w-0 flex-col items-start ${
              preview ? 'w-[4.5rem] gap-1' : 'max-w-[20rem] gap-0'
            }`}
          >
            <Bone className={preview ? 'h-1.5 w-12' : 'h-2.5 w-24'} />
            <Bone
              className={`rounded-none bg-neutral-400 ${
                preview ? 'mt-1 h-0.5 w-6' : 'mt-4 h-1.5 w-[4.5rem]'
              }`}
            />
            <Bone
              className={`bg-neutral-300 ${
                preview ? 'mt-1.5 h-5 w-10' : 'mt-10 h-14 w-24 sm:h-16'
              }`}
            />
            <Bone className={preview ? 'mt-1 h-1.5 w-10' : 'mt-2.5 h-2.5 w-28'} />
            <div className={`w-full ${preview ? 'mt-1.5 space-y-0.5' : 'mt-10 space-y-2'}`}>
              <Bone className={preview ? 'h-1.5 w-full' : 'h-3 w-full'} />
              <Bone className={preview ? 'h-1.5 w-[90%]' : 'h-3 w-[90%]'} />
              <Bone className={preview ? 'h-1.5 w-[70%]' : 'h-3 w-[70%]'} />
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

function EditorialOverlapHeroBannerSkeleton({ preview }: HeroBannerSkeletonProps = {}) {
  if (preview) {
    return (
      <section className={`${shellClass(true)} overflow-hidden`} aria-hidden>
        <div className="relative mx-auto h-full w-full max-w-6xl">
          <Bone className="absolute bottom-0 right-0 aspect-[16/10] w-[72%] rounded-2xl bg-neutral-300" />
          <div className="relative z-[1] space-y-1.5">
            <Bone className="h-3 w-[55%]" />
            <Bone className="h-3 w-[42%]" />
          </div>
        </div>
      </section>
    );
  }
  return (
    <section className={shellClass(preview)} aria-hidden>
      <div
        className={`relative mx-auto flex w-full max-w-6xl flex-col ${
          preview ? 'min-h-[4.25rem]' : 'h-full min-h-0 flex-1 justify-center'
        }`}
      >
        <Bone
          className={`w-full rounded-2xl bg-neutral-300 ${
            preview ? 'aspect-[16/10] min-h-[4.25rem]' : 'aspect-[16/10] max-h-full'
          }`}
        />
        <div
          className={`absolute bottom-0 left-0 bg-neutral-50 ${
            preview
              ? 'w-[55%] space-y-0.5 p-1.5 [border-top-right-radius:1rem]'
              : 'w-[min(58%,42rem)] space-y-3 p-5 sm:p-7 [border-top-right-radius:clamp(3.5rem,11vw,7.5rem)]'
          }`}
        >
          <Bone className={preview ? 'h-1 w-8' : 'h-2.5 w-20'} />
          <Bone className={preview ? 'h-2.5 w-[85%]' : 'h-10 w-[min(100%,14rem)] sm:h-12'} />
          <Bone className={preview ? 'h-1 w-full' : 'h-3 w-full'} />
          <Bone className={preview ? 'h-1 w-[90%]' : 'h-3 w-[92%]'} />
          {!preview ? <Bone className="h-3 w-[78%]" /> : null}
        </div>
      </div>
    </section>
  );
}

function SelectedWorksHeroBannerSkeleton({ preview }: HeroBannerSkeletonProps = {}) {
  if (preview) {
    return (
      <section className={shellClass(true)} aria-hidden>
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2">
          <div className="grid grid-cols-2 items-start gap-2">
            <Bone className="h-3 w-[80%]" />
            <Bone className="h-1.5 w-[85%]" />
          </div>
          <Bone className="aspect-[4/5] w-[32%] rounded-2xl bg-neutral-300" />
        </div>
      </section>
    );
  }
  return (
    <section className={shellClass(preview)} aria-hidden>
      <div
        className={`mx-auto flex w-full max-w-6xl flex-col ${
          preview ? '' : 'h-full flex-1'
        }`}
      >
        <div
          className={`grid w-full ${
            preview
              ? 'grid-cols-2 items-start gap-2'
              : 'gap-6 md:grid-cols-2 md:items-start md:gap-12'
          }`}
        >
          <div className={preview ? 'space-y-1' : 'space-y-3'}>
            <Bone className={preview ? 'h-3 w-[70%]' : 'h-10 w-[min(100%,12rem)] sm:h-12'} />
            <Bone className={preview ? 'h-3 w-[90%]' : 'h-10 w-[min(100%,16rem)] sm:h-12'} />
          </div>
          <div className={preview ? 'space-y-0.5' : 'space-y-2 md:pt-1'}>
            <Bone className={preview ? 'h-1.5 w-full' : 'h-3 w-full'} />
            <Bone className={preview ? 'h-1.5 w-[96%]' : 'h-3 w-[96%]'} />
            <Bone className={preview ? 'h-1.5 w-[80%]' : 'h-3 w-[88%]'} />
            {!preview ? <Bone className="h-3 w-[72%]" /> : null}
          </div>
        </div>
        <div className={`mt-auto flex w-full flex-col ${preview ? 'gap-1 pt-1.5' : 'gap-4 pt-10'}`}>
          <div className="flex w-full justify-end">
            <Bone className={preview ? 'h-1.5 w-10' : 'h-3 w-20'} />
          </div>
          <div className={`grid grid-cols-3 ${preview ? 'gap-1' : 'gap-3 sm:gap-4'}`}>
            <Bone className="aspect-[4/5] w-full rounded-2xl bg-neutral-300" />
            <Bone className="aspect-[4/5] w-full rounded-2xl bg-neutral-300" />
            <Bone className="aspect-[4/5] w-full rounded-2xl bg-neutral-300" />
          </div>
        </div>
      </div>
    </section>
  );
}

/** Colophon: compact credits, an editorial statement facing the index, and a monumental name. */
function ColophonHeroBannerSkeleton({ preview }: HeroBannerSkeletonProps = {}) {
  if (preview) {
    return (
      <section className={`${shellClass(true)} overflow-hidden`} aria-hidden>
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-1.5">
          <div className="h-px w-full bg-neutral-300" />
          <div className="grid grid-cols-2 gap-2">
            <Bone className="h-2 w-[80%]" />
            <div className="flex flex-col gap-1">
              <Bone className="h-1.5 w-full" />
              <Bone className="h-1.5 w-full" />
            </div>
          </div>
          <Bone className="h-5 w-full rounded-none" />
        </div>
      </section>
    );
  }
  return (
    <section className={`${shellClass(false)} overflow-hidden !pb-0`} aria-hidden>
      <div className="mx-auto flex h-full w-full max-w-none flex-1 flex-col">
        <div className="h-px w-full bg-neutral-300" />
        <div className="mt-4 grid grid-cols-2 gap-6 lg:grid-cols-3">
          {['w-40', 'w-44', 'w-28'].map((width) => (
            <div key={width} className="flex flex-col gap-2">
              <Bone className={`h-3 ${width}`} />
              <Bone className="h-3 w-24" />
            </div>
          ))}
        </div>
        <div className="mt-10 grid flex-1 grid-cols-1 content-start gap-8 pb-8 lg:grid-cols-12 lg:items-center">
          <div className="flex flex-col gap-3 lg:col-span-6">
            <Bone className="ml-[12%] h-7 w-[78%]" />
            <Bone className="h-7 w-[92%]" />
            <Bone className="h-7 w-[60%]" />
          </div>
          <div className="flex flex-col lg:col-span-5 lg:col-start-8">
            {[0, 1, 2, 3].map((row) => (
              <div key={row} className="flex items-center gap-4 border-t border-neutral-200 py-4">
                <Bone className="h-3 w-6" />
                <Bone className="h-3.5 w-[55%]" />
              </div>
            ))}
          </div>
        </div>
        <div className="h-[14vw] w-full overflow-hidden">
          <Bone className="h-[15.5vw] w-full rounded-none" />
        </div>
      </div>
    </section>
  );
}

function IdentityIndexHeroBannerSkeleton({ preview }: HeroBannerSkeletonProps = {}) {
  if (preview) {
    return (
      <section className={shellClass(true)} aria-hidden>
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-1.5">
          <Bone className="h-4 w-[55%]" />
          <div className="h-px w-full bg-neutral-200" />
          <Bone className="h-2 w-[35%]" />
        </div>
      </section>
    );
  }
  return (
    <section className={shellClass(preview)} aria-hidden>
      <div
        className={`mx-auto flex w-full max-w-5xl flex-col items-center ${
          preview ? '' : 'h-full flex-1'
        }`}
      >
        <Bone
          className={`mx-auto rounded-none bg-neutral-400 ${
            preview ? 'h-0.5 w-4' : 'h-[3px] w-10'
          }`}
        />
        <Bone
          className={`mx-auto ${
            preview
              ? 'mt-1.5 h-4 w-[min(100%,8rem)]'
              : 'mt-8 h-14 w-[min(100%,20rem)] sm:h-20 sm:w-[min(100%,28rem)]'
          }`}
        />
        <div
          className={`grid w-full grid-cols-3 text-center ${
            preview ? 'mt-2 gap-2' : 'mt-10 gap-4 sm:gap-8'
          }`}
        >
          {(['w-14', 'w-16', 'w-12'] as const).map((valueWidth, index) => (
            <div
              key={index}
              className={`flex flex-col items-center ${preview ? 'gap-0.5' : 'gap-1.5'}`}
            >
              <Bone className={preview ? 'h-1 w-6' : 'h-2 w-12'} />
              <Bone className={`${preview ? 'h-2' : 'h-3.5'} ${preview ? 'w-8' : valueWidth}`} />
            </div>
          ))}
        </div>
        <div className={`w-full bg-neutral-200 ${preview ? 'mt-1.5 h-px' : 'mt-5 h-px'}`} />
        <div
          className={`mx-auto w-full max-w-xl text-center ${
            preview ? 'mt-auto space-y-0.5 pt-1.5' : 'mt-auto space-y-2 pt-10'
          }`}
        >
          <Bone className={`mx-auto w-full ${preview ? 'h-1.5' : 'h-3.5'}`} />
          <Bone className={`mx-auto w-[92%] ${preview ? 'h-1.5' : 'h-3.5'}`} />
          {!preview ? <Bone className="mx-auto h-3.5 w-[80%]" /> : null}
        </div>
      </div>
    </section>
  );
}

function StudioSplitHeroBannerSkeleton({ preview }: HeroBannerSkeletonProps = {}) {
  if (preview) {
    return (
      <section className={shellClass(true)} aria-hidden>
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-1.5">
          <div className="grid grid-cols-2 gap-2 bg-neutral-900 p-1.5">
            <Bone className="h-3 w-[80%] bg-neutral-400" />
            <Bone className="h-1.5 w-[85%] bg-neutral-500" />
          </div>
          <Bone className="-mt-2 aspect-[16/9] w-full rounded-lg bg-neutral-300" />
        </div>
      </section>
    );
  }
  return (
    <section className={shellClass(preview)} aria-hidden>
      <div
        className={`mx-auto flex w-full max-w-6xl flex-col ${
          preview ? '' : 'h-full flex-1 justify-center'
        }`}
      >
        <div
          className={`bg-neutral-900 ${
            preview ? 'px-1.5 pb-5 pt-1.5' : 'px-5 pb-24 pt-8 sm:px-8 lg:px-10 lg:pb-28 lg:pt-10'
          }`}
        >
          <div
            className={`grid ${
              preview ? 'grid-cols-2 gap-2' : 'gap-8 lg:grid-cols-2 lg:gap-x-16'
            }`}
          >
            <div className={preview ? 'space-y-1' : 'space-y-4'}>
              <Bone className={`bg-neutral-500 ${preview ? 'h-1 w-8' : 'h-2.5 w-20'}`} />
              <Bone
                className={`bg-neutral-400 ${
                  preview ? 'h-3 w-[90%]' : 'h-12 w-[min(100%,18rem)] sm:h-14'
                }`}
              />
              <Bone className={`bg-neutral-500 ${preview ? 'h-1.5 w-12' : 'h-4 w-36'}`} />
            </div>
            <div className={`flex flex-col ${preview ? 'space-y-0.5' : 'space-y-3 lg:pt-1'}`}>
              <Bone className={`bg-neutral-500 ${preview ? 'h-1 w-full' : 'h-3 w-full'}`} />
              <Bone className={`bg-neutral-500 ${preview ? 'h-1 w-[96%]' : 'h-3 w-[96%]'}`} />
              {!preview ? (
                <>
                  <Bone className="h-3 w-[88%] bg-neutral-500" />
                  <Bone className="h-3 w-[72%] bg-neutral-500" />
                </>
              ) : null}
              <div className={`flex flex-wrap ${preview ? 'mt-1 gap-1' : 'mt-5 gap-3'}`}>
                <Bone
                  className={`rounded-full bg-neutral-200 ${
                    preview ? 'h-2.5 w-10' : 'h-10 w-28'
                  }`}
                />
                <Bone
                  className={`rounded-full bg-neutral-600 ${
                    preview ? 'h-2.5 w-10' : 'h-10 w-32'
                  }`}
                />
              </div>
              <div className={`flex items-center ${preview ? 'mt-1 gap-1' : 'mt-4 gap-2.5'}`}>
                <Bone
                  className={`shrink-0 rounded-full bg-neutral-300 ${
                    preview ? 'h-1 w-1' : 'h-2 w-2'
                  }`}
                />
                <Bone className={`bg-neutral-500 ${preview ? 'h-1 w-10' : 'h-2.5 w-28'}`} />
              </div>
            </div>
          </div>
        </div>
        <div
          className={`relative z-[1] ${
            preview ? '-mt-3.5 px-0.5' : '-mt-16 px-2 sm:-mt-20 lg:-mt-24'
          }`}
        >
          <Bone
            className={`aspect-[16/9] w-full bg-neutral-300 ${
              preview
                ? 'rounded-lg'
                : 'rounded-[1.75rem] sm:rounded-[2rem] lg:rounded-[2.5rem]'
            }`}
          />
          <Bone
            className={`mx-auto rounded-none bg-neutral-400 ${
              preview ? 'mt-1.5 h-px w-6' : 'mt-8 h-[2px] w-20 lg:mt-10 lg:w-24'
            }`}
          />
        </div>
      </div>
    </section>
  );
}

function WorkDuoHeroBannerSkeleton({ preview }: HeroBannerSkeletonProps = {}) {
  if (preview) {
    return (
      <section className={shellClass(true)} aria-hidden>
        <div className="mx-auto grid max-w-6xl grid-cols-2 items-center gap-2">
          <div className="flex flex-col gap-1.5">
            <Bone className="h-3 w-[85%]" />
            <Bone className="h-3 w-[65%]" />
          </div>
          <Bone className="aspect-[3/4] w-full rounded-2xl bg-neutral-300" />
        </div>
      </section>
    );
  }
  return (
    <section className={shellClass(preview)} aria-hidden>
      <div
        className={`mx-auto grid max-w-6xl items-stretch ${
          preview
            ? 'grid-cols-[minmax(0,0.95fr)_minmax(0,1.15fr)] gap-x-2'
            : 'h-full flex-1 grid-cols-1 gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.15fr)] lg:gap-x-10'
        }`}
      >
        <div className="flex min-w-0 flex-col">
          <Bone className={preview ? 'h-1.5 w-12' : 'h-2.5 w-28'} />
          <Bone
            className={
              preview
                ? 'mt-1.5 h-3 w-[90%]'
                : 'mt-4 h-10 w-[min(100%,16rem)] sm:h-12 sm:w-[min(100%,18rem)]'
            }
          />
          <Bone
            className={
              preview
                ? 'mt-0.5 h-3 w-[75%]'
                : 'mt-1.5 h-10 w-[min(100%,14rem)] sm:h-12 sm:w-[min(100%,15rem)]'
            }
          />
          <div className={preview ? 'mt-2 space-y-0.5' : 'mt-8 space-y-2'}>
            <Bone className={`w-full max-w-[22rem] ${preview ? 'h-1.5' : 'h-3'}`} />
            <Bone className={`w-[92%] max-w-[20rem] ${preview ? 'h-1.5' : 'h-3'}`} />
            {!preview ? <Bone className="h-3 w-[78%] max-w-[17rem]" /> : null}
          </div>
          <div className={`flex flex-wrap items-center ${preview ? 'mt-1.5 gap-1' : 'mt-6 gap-2.5'}`}>
            <Bone className={`rounded-xl bg-neutral-300 ${preview ? 'h-3 w-10' : 'h-10 w-28'}`} />
            <Bone className={`rounded-xl ${preview ? 'h-3 w-10' : 'h-10 w-32'}`} />
          </div>
          <div className={`mt-auto ${preview ? 'pt-1.5' : 'pt-8 lg:pt-10'}`}>
            <Bone className={preview ? 'h-4 w-8' : 'h-12 w-20 sm:h-14 sm:w-24'} />
            <Bone className={preview ? 'mt-0.5 h-1 w-12' : 'mt-2 h-2.5 w-36'} />
          </div>
        </div>

        <div className="flex min-w-0 flex-col">
          <div className={`flex w-full items-center justify-end ${preview ? 'mb-1' : 'mb-3 lg:mb-4'}`}>
            <Bone className={preview ? 'h-1.5 w-8' : 'h-2.5 w-16'} />
          </div>
          <div className={`grid min-h-0 flex-1 grid-cols-2 ${preview ? 'gap-1' : 'gap-3 sm:gap-4'}`}>
            <Bone className="aspect-[3/4] w-full rounded-[1.75rem] bg-neutral-300" />
            <Bone className="aspect-[3/4] w-full rounded-[1.75rem] bg-neutral-300" />
          </div>
        </div>
      </div>
    </section>
  );
}

function BowlIntroHeroBannerSkeleton({ preview }: HeroBannerSkeletonProps = {}) {
  if (preview) {
    return (
      <section className={`${shellClass(true)} overflow-hidden`} aria-hidden>
        <div className="mx-auto flex w-full max-w-6xl items-center gap-2">
          <Bone className="aspect-[3/4] w-[28%] rounded-[1.2rem] bg-neutral-300" />
          <div className="flex flex-1 flex-col gap-1.5">
            <Bone className="h-4 w-[85%] bg-neutral-300" />
            <Bone className="h-4 w-[65%] bg-neutral-300" />
          </div>
        </div>
      </section>
    );
  }
  return (
    <section className={`${shellClass(preview)} overflow-hidden`} aria-hidden>
      {!preview ? (
        <div
          className="pointer-events-none absolute -right-[12%] -top-[18%] z-0 h-[40%] w-[40%] rounded-full bg-neutral-200 opacity-40"
          aria-hidden
        />
      ) : null}

      <div
        className={`relative z-[1] mx-auto grid max-w-6xl items-center ${
          preview
            ? 'grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] gap-x-2'
            : 'h-full flex-1 grid-cols-1 content-center gap-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-x-12'
        }`}
      >
        <div
          className={`mx-auto flex w-full flex-col items-center lg:mx-0 ${
            preview ? 'max-w-[3.25rem]' : 'max-w-[14rem] sm:max-w-[16rem] lg:max-w-[18rem]'
          }`}
        >
          <Bone className={`rounded-full ${preview ? 'mb-1 h-2.5 w-10' : 'mb-4 h-7 w-32'}`} />
          <div className={`relative w-full ${preview ? 'pb-2' : 'pb-[min(42%,7rem)]'}`}>
            <div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-[62%] z-0 w-[145%] -translate-x-1/2 animate-pulse bg-neutral-100"
              style={{
                aspectRatio: '2 / 1',
                borderRadius: '0 0 50% 50% / 0 0 100% 100%',
              }}
            />
            <Bone className="relative z-[1] aspect-[3/4] w-full rounded-[1.65rem] bg-neutral-300" />
            <Bone className={`relative z-[1] mx-auto ${preview ? 'mt-1 h-1.5 w-8' : 'mt-4 h-5 w-28'}`} />
          </div>
        </div>

        <div className="flex min-w-0 flex-col items-start">
          <Bone
            className={`w-full bg-neutral-300 ${
              preview ? 'h-4 max-w-[8rem]' : 'h-14 max-w-[20rem] sm:h-16 sm:max-w-[24rem] lg:h-20'
            }`}
          />
          <Bone
            className={`bg-neutral-300 ${
              preview
                ? 'mt-0.5 h-4 w-[80%] max-w-[6.5rem]'
                : 'mt-1.5 h-14 w-[88%] max-w-[18rem] sm:h-16 sm:max-w-[20rem] lg:h-20'
            }`}
          />
          <div className={`w-full max-w-[28rem] ${preview ? 'mt-1.5 space-y-0.5' : 'mt-5 space-y-2'}`}>
            <Bone className={`w-full ${preview ? 'h-1.5' : 'h-3'}`} />
            <Bone className={`w-[94%] ${preview ? 'h-1.5' : 'h-3'}`} />
            {!preview ? <Bone className="h-3 w-[82%]" /> : null}
          </div>
          <div className={`flex flex-wrap items-center ${preview ? 'mt-1.5 gap-1' : 'mt-6 gap-2.5'}`}>
            <Bone className={`rounded-full bg-neutral-300 ${preview ? 'h-3 w-10' : 'h-10 w-32'}`} />
            <Bone className={`rounded-full ${preview ? 'h-3 w-9' : 'h-10 w-28'}`} />
          </div>
        </div>
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
};

export function PortfolioHeroBannerSkeleton({
  design = DEFAULT_PORTFOLIO_HERO_BANNER_DESIGN,
  preview = false,
}: {
  design?: PortfolioHeroBannerDesign;
  preview?: boolean;
}) {
  const Render = HERO_BANNER_SKELETONS[design] ?? SwissEditorialHeroBannerSkeleton;
  return <Render preview={preview} />;
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
};

/** Mini wireframe for Hero → Banner design picker. */
export function HeroBannerDesignPreview({
  design,
  hero,
}: {
  design: PortfolioHeroBannerDesign;
  hero?: PortfolioHeroSectionSettings;
}) {
  const ContentPreview = hero ? HERO_BANNER_CONTENT_PREVIEWS[design] : undefined;
  if (ContentPreview) {
    return <ContentPreview hero={hero!} />;
  }
  return (
    <div
      className="aspect-square overflow-hidden rounded-xl border border-neutral-200/80 bg-white"
      aria-hidden
    >
      <PortfolioHeroBannerSkeleton design={design} preview />
    </div>
  );
}
