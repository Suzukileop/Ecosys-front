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
            <Bone className="h-4 w-full rounded-sm" />
            <Bone className="h-4 w-[65%] rounded-sm" />
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
            <Bone className={`w-full rounded-sm ${preview ? 'h-4' : 'h-10 sm:h-12'}`} />
            <Bone className={`w-[88%] rounded-sm ${preview ? 'h-4' : 'h-10 sm:h-12'}`} />
            <Bone className={`w-[70%] rounded-sm ${preview ? 'h-4' : 'h-10 sm:h-12'}`} />
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
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2">
          <Bone className="h-2.5 w-[55%]" />
          <div className="w-full border-t border-neutral-200" />
          <div className="flex items-center gap-2">
            <div className="w-14 max-w-[3.5rem] shrink-0 overflow-hidden rounded-none bg-neutral-100 ring-1 ring-neutral-200/80">
              <Bone className="aspect-[4/5] w-full rounded-none bg-neutral-300" />
            </div>
            <Bone className="h-5 w-[60%]" />
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
              ? 'minmax(0, 44%) minmax(0, 8%) minmax(0, 1fr)'
              : 'minmax(10rem, 44%) minmax(0, 8%) minmax(0, 1fr)',
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
              ? 'minmax(0, 44%) minmax(0, 8%) minmax(0, 1fr)'
              : 'minmax(10rem, 44%) minmax(0, 8%) minmax(0, 1fr)',
          }}
        >
          <div
            className={`overflow-hidden rounded-none bg-neutral-100 ring-1 ring-neutral-200/80 ${
              preview ? 'w-full max-w-[3.5rem]' : 'w-full max-w-[14rem]'
            }`}
          >
            <Bone className="aspect-[4/5] w-full rounded-none bg-neutral-300" />
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
              className={`mt-auto flex flex-wrap items-center ${
                preview ? 'gap-1.5 pt-1' : 'gap-3 pt-2'
              }`}
            >
              <Bone
                className={`rounded-lg bg-neutral-300 ${
                  preview ? 'h-5 w-14' : 'h-12 w-32 sm:h-14 sm:w-36'
                }`}
              />
              <Bone
                className={`rounded-lg ${preview ? 'h-5 w-14' : 'h-12 w-28 sm:h-14 sm:w-32'}`}
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
            <Bone className="h-4 w-[92%]" />
            <Bone className="h-4 w-[78%]" />
          </div>
          <div className="relative ml-auto aspect-[3/4] h-full max-h-full w-full overflow-hidden rounded-2xl bg-neutral-100 ring-1 ring-neutral-200/80">
            <Bone className="absolute inset-0 rounded-none bg-neutral-300" />
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
            <div className="inline-flex max-w-full overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-center ${
                    preview
                      ? 'min-h-[1.15rem] min-w-[1.65rem] px-1 py-0.5'
                      : 'min-h-[1.75rem] min-w-[2.75rem] px-2 py-1.5 sm:min-h-[2.5rem] sm:min-w-[4.5rem] sm:px-4'
                  } ${index > 0 ? 'border-l border-neutral-200' : ''}`}
                >
                  <Bone className={preview ? 'h-1 w-5' : 'h-2 w-8 sm:w-10'} />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="relative ml-auto aspect-[3/4] h-full max-h-full w-full overflow-hidden rounded-2xl bg-neutral-100 ring-1 ring-neutral-200/80">
          <Bone className="absolute inset-0 rounded-none bg-neutral-300" />
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
            <CirclePortrait className={preview ? 'w-[min(100%,2.75rem)]' : 'w-[min(100%,7.5rem)] sm:w-[min(100%,11rem)]'} />
          </div>
          <div className={`min-w-0 ${preview ? 'space-y-1.5' : 'space-y-3 sm:space-y-4'}`}>
            <div className={preview ? 'space-y-1' : 'space-y-1.5'}>
              <Bone className={`w-full ${preview ? 'h-1.5' : 'h-2.5'}`} />
              <Bone className={`w-[94%] ${preview ? 'h-1.5' : 'h-2.5'}`} />
              <Bone className={`w-[80%] ${preview ? 'h-1.5' : 'h-2.5'}`} />
              <Bone className={`w-[88%] ${preview ? 'h-1.5' : 'h-2.5'}`} />
              <Bone className={`w-[70%] ${preview ? 'h-1.5' : 'h-2.5'}`} />
            </div>
            <div className={`flex flex-wrap items-center ${preview ? 'gap-x-2 gap-y-1' : 'gap-x-5 gap-y-2'}`}>
              <Bone
                className={`rounded-full bg-neutral-300 ${
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
              <Bone key={index} className={preview ? 'h-1.5 w-6' : 'h-2.5 w-10 sm:h-3 sm:w-14'} />
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
          <Bone className={preview ? 'h-2 w-12 rounded-sm' : 'h-3 w-24 rounded-sm sm:h-4 sm:w-32'} />
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

function CinematicRevealHeroBannerSkeleton({ preview }: HeroBannerSkeletonProps = {}) {
  if (preview) {
    return (
      <section className={`${shellClass(true)} overflow-hidden bg-neutral-900`} aria-hidden>
        <div className="relative mx-auto h-full w-full">
          <div className="absolute inset-x-1 top-1/2 h-6 -translate-y-1/2 rounded-sm border-2 border-neutral-700" />
          <div className="absolute right-0.5 top-0.5 aspect-[4/5] w-[26%] rounded-lg bg-neutral-600" />
          <div className="absolute bottom-0.5 left-0.5 h-2.5 w-[30%] rounded-sm bg-neutral-500" />
          <div className="absolute bottom-0.5 right-0.5 h-2.5 w-[24%] rounded-sm bg-neutral-800" />
        </div>
      </section>
    );
  }
  return (
    <section className={`${shellClass(preview)} overflow-hidden bg-neutral-900`} aria-hidden>
      <div className="relative z-[1] mx-auto flex h-full max-w-6xl flex-1 flex-col gap-6">
        <Bone className="h-7 w-40 self-start rounded-full bg-neutral-700" />
        <div className="relative flex-1">
          <div
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
            aria-hidden
          >
            <div className="h-20 w-[80%] rounded-md border-4 border-neutral-800 sm:h-28 md:h-36" />
          </div>
          <div className="absolute right-0 top-0 aspect-[4/5] w-[24%] max-w-[14rem] overflow-hidden rounded-2xl bg-neutral-600" />
          <div className="absolute bottom-0 left-0 max-w-[14rem] space-y-3">
            <Bone className="h-2 w-24 bg-neutral-700" />
            <Bone className="h-3 w-28 rounded-sm bg-neutral-500" />
            <Bone className="h-3 w-24 rounded-sm bg-neutral-500" />
          </div>
          <Bone className="absolute bottom-0 right-0 h-10 w-40 max-w-[45%] bg-neutral-800" />
        </div>
        <div className="mt-auto flex items-center gap-6 overflow-hidden border-t border-neutral-800 pt-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <Bone key={index} className="h-2.5 w-20 shrink-0 bg-neutral-700" />
          ))}
        </div>
      </div>
    </section>
  );
}

const HERO_BANNER_SKELETONS: Record<
  PortfolioHeroBannerDesign,
  (props: HeroBannerSkeletonProps) => ReactNode
> = {
  'cinematic-reveal': CinematicRevealHeroBannerSkeleton,
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
        <div className="flex items-center gap-[3%]">
          <PreviewDot color={p.principal} size="1.1em" />
          <PreviewText color={p.muted} size="5.8cqw" uppercase tracking="0.05em">
            {previewLorem(3)}
          </PreviewText>
        </div>
        <div style={{ borderTop: `1px solid ${p.bordure}` }} />
        <div className="flex flex-1 items-center gap-[6%]">
          <PreviewBox bg={p.neutre} aspect="4 / 5" width="26%" radius="6%" ring={p.bordure} />
          <PreviewText color={p.ink} size="13cqw" weight={700} clamp={2} className="min-w-0 flex-1">
            {previewLorem(2, 3)}
          </PreviewText>
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
          </div>
          <PreviewText color={p.ink} size="10cqw" weight={700} clamp={2}>
            {previewLorem(4, 2)}
          </PreviewText>
          <PreviewText color={p.muted} size="5cqw" clamp={2}>
            {previewLorem(9, 6)}
          </PreviewText>
          <div className="mt-auto flex flex-wrap gap-[4%]">
            {['UI', 'UX', '3D', 'Web'].map((tag) => (
              <PreviewPill key={tag} color={p.muted} border={p.bordure} size="4.2cqw">
                {tag}
              </PreviewPill>
            ))}
          </div>
        </div>
        <PreviewBox bg={p.neutre} aspect="3 / 4" radius="8%" ring={p.bordure} className="h-full w-full" />
      </div>
    </PreviewCardShell>
  );
}

function StatementCtaContentPreview({ hero }: { hero: PortfolioHeroSectionSettings }) {
  const p = previewPalette(hero);
  return (
    <PreviewCardShell fond={p.fond}>
      <div className="flex h-full w-full flex-col items-center gap-[5%] p-[8%] text-center">
        <PreviewText color={p.ink} size="9cqw" weight={700} clamp={1} className="w-full">
          {previewLorem(4)}
        </PreviewText>
        <div className="flex items-center gap-[2%]">
          <PreviewDot color={p.principal} size="0.9em" />
          <PreviewText color={p.muted} size="4.8cqw" uppercase tracking="0.05em">
            {previewLorem(2, 4)}
          </PreviewText>
        </div>
        <PreviewBox bg={p.neutre} radius="50%" width="26%" ring={p.bordure} />
        <PreviewText color={p.muted} size="5cqw" clamp={2} className="w-full">
          {previewLorem(10, 6)}
        </PreviewText>
        <div className="mt-auto flex w-full items-baseline justify-between gap-[2%]" style={{ borderTop: `1px solid ${p.bordure}`, paddingTop: '5%' }}>
          {Array.from({ length: 4 }).map((_, index) => (
            <PreviewText key={index} color={p.muted} size="4cqw">
              {previewLorem(1, index)}
            </PreviewText>
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
            <PreviewText color={p.muted} size="5cqw" uppercase tracking="0.05em">
              {previewLorem(2)}
            </PreviewText>
            <div style={{ width: '30%', borderTop: `1px solid ${p.bordure}` }} />
            <PreviewText color={p.ink} size="10cqw" weight={700} clamp={2}>
              {previewLorem(3, 2)}
            </PreviewText>
          </div>
          <div className="flex flex-col gap-[4%]">
            <div className="flex flex-wrap gap-[3%]">
              {['UI', 'UX', '3D'].map((tag) => (
                <PreviewPill key={tag} color={p.muted} border={p.bordure} size="4cqw">
                  {tag}
                </PreviewPill>
              ))}
            </div>
            <div style={{ borderTop: `1px solid ${p.bordure}` }} />
            <PreviewText color={p.muted} size="4.6cqw" clamp={3}>
              {previewLorem(12, 8)}
            </PreviewText>
          </div>
        </div>
        <PreviewBox bg={p.neutre} aspect="5 / 6" radius="0px" ring={p.bordure} className="h-full w-full" />
      </div>
    </PreviewCardShell>
  );
}

function LeftPortraitContentPreview({ hero }: { hero: PortfolioHeroSectionSettings }) {
  const p = previewPalette(hero);
  return (
    <PreviewCardShell fond={p.fond}>
      <div className="grid h-full w-full grid-cols-[38%_1fr] items-stretch gap-[5%] p-[8%]">
        <PreviewBox bg={p.neutre} radius="8%" ring={p.bordure} className="h-full w-full" />
        <div className="flex min-h-0 flex-col justify-between">
          <div className="flex flex-col gap-[4%]">
            <div className="flex items-center gap-[3%]">
              <PreviewDot color={p.principal} size="0.9em" />
              <PreviewText color={p.muted} size="5cqw" uppercase tracking="0.05em">
                {previewLorem(2)}
              </PreviewText>
            </div>
            <PreviewText color={p.ink} size="10cqw" weight={700} clamp={2}>
              {previewLorem(3, 2)}
            </PreviewText>
          </div>
          <div className="flex flex-col gap-[5%]">
            <PreviewText color={p.muted} size="4.6cqw" clamp={3}>
              {previewLorem(12, 8)}
            </PreviewText>
            <PreviewPill color={p.fond} bg={p.ink} size="4.6cqw">
              {previewLorem(2, 0)}
            </PreviewPill>
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
      <div className="flex h-full w-full flex-col gap-[4%] p-[8%]">
        <div className="grid flex-1 grid-cols-2 items-center gap-[5%]">
          <div className="flex flex-col items-center gap-[5%]">
            <PreviewBox bg={p.neutre} radius="50%" width="62%" ring={p.bordure} />
            <div className="flex items-center gap-[2%]">
              <PreviewDot color={p.principal} size="0.85em" />
              <PreviewText color={p.muted} size="4.4cqw" uppercase tracking="0.04em">
                {previewLorem(2)}
              </PreviewText>
            </div>
          </div>
          <div className="flex flex-col items-center gap-[6%] text-center">
            <PreviewText color={p.muted} size="4.8cqw" clamp={3}>
              {previewLorem(11, 6)}
            </PreviewText>
            <PreviewPill color={p.fond} bg={p.ink} size="4.4cqw">
              {previewLorem(2, 0)}
            </PreviewPill>
          </div>
        </div>
        <div className="flex flex-col gap-[3%]">
          <div style={{ width: '22%', borderTop: `2px solid ${p.muted}` }} />
          <PreviewText color={p.ink} size="8.5cqw" weight={700}>
            {previewLorem(2, 2)}
          </PreviewText>
          <PreviewText color={p.muted} size="4.6cqw">
            {previewLorem(3, 4)}
          </PreviewText>
        </div>
      </div>
    </PreviewCardShell>
  );
}

function ExperienceSplitContentPreview({ hero }: { hero: PortfolioHeroSectionSettings }) {
  const p = previewPalette(hero);
  return (
    <PreviewCardShell fond={p.fond}>
      <div className="grid h-full w-full grid-cols-[1fr_38%] items-start gap-[5%] p-[8%]">
        <div
          className="flex min-w-0 flex-col gap-[6%]"
          style={{ borderRight: `1px solid ${p.bordure}`, borderBottom: `1px solid ${p.bordure}`, paddingRight: '8%', paddingBottom: '8%' }}
        >
          <PreviewText color={p.ink} size="10cqw" weight={700} clamp={2}>
            {previewLorem(3, 2)}
          </PreviewText>
          <PreviewText color={p.muted} size="4.8cqw" uppercase tracking="0.04em">
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
        <div className="flex min-w-0 flex-col items-start gap-[4%]">
          <PreviewBox bg={p.neutre} aspect="3 / 4" width="55%" ring={p.bordure} />
          <PreviewText color={p.ink} size="9cqw" weight={700} className="w-full">
            {previewLorem(1, 10)}
          </PreviewText>
          <PreviewText color={p.muted} size="4.2cqw" clamp={2} className="w-full">
            {previewLorem(6, 8)}
          </PreviewText>
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
        <PreviewBox bg={p.neutre} aspect="16 / 10" ring={p.bordure} className="absolute bottom-[8%] right-[8%] w-[68%]" />
        <div className="relative z-[1] flex max-w-[70%] flex-col gap-[3%]">
          <PreviewText color={p.ink} size="9cqw" weight={700} clamp={2}>
            {previewLorem(4, 2)}
          </PreviewText>
        </div>
        <div
          className="absolute bottom-[8%] left-[8%] z-[1] flex w-[52%] flex-col gap-[3%] p-[6%]"
          style={{ backgroundColor: p.fond, borderTopRightRadius: '18%' }}
        >
          <PreviewText color={p.principal} size="4.4cqw" uppercase tracking="0.05em">
            {previewLorem(2)}
          </PreviewText>
          <PreviewText color={p.muted} size="4.6cqw" clamp={2}>
            {previewLorem(7, 6)}
          </PreviewText>
        </div>
      </div>
    </PreviewCardShell>
  );
}

function SelectedWorksContentPreview({ hero }: { hero: PortfolioHeroSectionSettings }) {
  const p = previewPalette(hero);
  return (
    <PreviewCardShell fond={p.fond}>
      <div className="flex h-full w-full flex-col gap-[5%] p-[8%]">
        <div className="grid grid-cols-2 items-start gap-[5%]">
          <PreviewText color={p.ink} size="9.5cqw" weight={700} clamp={2}>
            {previewLorem(3, 2)}
          </PreviewText>
          <PreviewText color={p.muted} size="4.6cqw" clamp={3}>
            {previewLorem(10, 6)}
          </PreviewText>
        </div>
        <div className="mt-auto flex flex-col gap-[4%]">
          <PreviewText color={p.muted} size="4.2cqw" uppercase tracking="0.05em" className="text-right">
            {previewLorem(2, 16)}
          </PreviewText>
          <div className="grid grid-cols-3 gap-[4%]">
            {Array.from({ length: 3 }).map((_, index) => (
              <PreviewBox key={index} bg={p.neutre} aspect="4 / 5" radius="10%" ring={p.bordure} />
            ))}
          </div>
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
  // The inverted band is a fixed near-black surface regardless of site mode (same intent
  // as the abstract skeleton's hardcoded bg-neutral-900) — only the accent dot stays palette-driven.
  const bandBg = '#171717';
  const bandInk = '#FAFAFA';
  const bandMuted = '#A3A3A3';
  return (
    <PreviewCardShell fond={p.fond}>
      <div className="flex h-full w-full flex-col">
        <div className="grid grid-cols-2 gap-[5%] p-[8%]" style={{ backgroundColor: bandBg }}>
          <div className="flex flex-col gap-[4%]">
            <PreviewText color={bandMuted} size="4.4cqw" uppercase tracking="0.05em">
              {previewLorem(2)}
            </PreviewText>
            <PreviewText color={bandInk} size="8.5cqw" weight={700} clamp={2}>
              {previewLorem(3, 2)}
            </PreviewText>
          </div>
          <div className="flex flex-col gap-[4%]">
            <PreviewText color={bandMuted} size="4.2cqw" clamp={3}>
              {previewLorem(9, 8)}
            </PreviewText>
            <div className="flex items-center gap-[2%]">
              <PreviewDot color={p.principal} size="0.8em" />
              <PreviewText color={bandMuted} size="4cqw" uppercase>
                {previewLorem(2, 5)}
              </PreviewText>
            </div>
          </div>
        </div>
        <div className="relative -mt-[8%] flex-1 px-[4%]">
          <PreviewBox bg={p.neutre} aspect="16 / 9" radius="6%" ring={p.bordure} className="w-full" />
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
          <PreviewText color={p.ink} size="12cqw" weight={700}>
            {previewLorem(1, 14)}
          </PreviewText>
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
  return (
    <PreviewCardShell fond={p.fond}>
      <div className="grid h-full w-full grid-cols-[0.9fr_1.1fr] items-center gap-[5%] p-[8%]">
        <div className="flex flex-col items-center gap-[4%]">
          <PreviewPill color={p.fond} bg={p.ink} size="4.2cqw">
            {previewLorem(2, 0)}
          </PreviewPill>
          <PreviewBox bg={p.neutre} aspect="3 / 4" radius="24%" ring={p.bordure} className="w-full" />
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

function CinematicRevealContentPreview({ hero }: { hero: PortfolioHeroSectionSettings }) {
  const p = previewPalette(hero);
  return (
    <PreviewCardShell fond={p.fond}>
      <div className="relative flex h-full w-full flex-col justify-between overflow-hidden p-[8%]">
        {/* Monumental outlined family-name, layered behind everything else. */}
        <p
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-1/2 m-0 -translate-y-1/2 text-center font-black uppercase"
          style={{
            fontSize: '30cqw',
            lineHeight: 0.85,
            letterSpacing: '-0.03em',
            color: 'transparent',
            WebkitTextStroke: `1px ${p.bordure}`,
          }}
        >
          {previewLorem(1, 2).slice(0, 6)}
        </p>

        <div className="relative z-[1] flex items-center gap-[2%]">
          <PreviewDot color={p.principal} size="0.9em" />
          <PreviewText color={p.muted} size="4.4cqw" uppercase tracking="0.05em">
            {previewLorem(2)}
          </PreviewText>
        </div>

        <PreviewBox
          bg={p.neutre}
          aspect="4 / 5"
          radius="14%"
          ring={p.bordure}
          className="absolute right-[6%] top-[6%] z-[1] w-[26%]"
        />

        <div className="relative z-[1] mt-auto flex items-end justify-between gap-[4%]">
          <div className="flex max-w-[42%] flex-col gap-[6%]">
            <PreviewText color={p.principal} size="3.6cqw" weight={700} uppercase tracking="0.05em">
              {previewLorem(2, 4)}
            </PreviewText>
            <PreviewText color={p.ink} size="3.4cqw" weight={600} uppercase tracking="0.04em">
              {previewLorem(2, 0)} ↗
            </PreviewText>
          </div>
          <PreviewText color={p.muted} size="3.2cqw" clamp={3} className="max-w-[42%] text-left">
            {previewLorem(9, 6)}
          </PreviewText>
        </div>
      </div>
    </PreviewCardShell>
  );
}

const HERO_BANNER_CONTENT_PREVIEWS: Partial<
  Record<PortfolioHeroBannerDesign, (props: { hero: PortfolioHeroSectionSettings }) => ReactNode>
> = {
  'cinematic-reveal': CinematicRevealContentPreview,
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
