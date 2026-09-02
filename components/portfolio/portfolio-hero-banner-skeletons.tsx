import type { ReactNode } from 'react';
import {
  DEFAULT_PORTFOLIO_HERO_BANNER_DESIGN,
  type PortfolioHeroBannerDesign,
} from '@/components/portfolio/portfolio-hero-banner-settings';

function Bone({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-neutral-200 ${className}`.trim()} />;
}

const HERO_SHELL =
  'relative isolate flex min-h-[100dvh] min-h-screen w-full flex-col overflow-x-clip bg-white px-5 pb-16 pt-20 sm:px-10 md:px-16 lg:px-20 xl:px-40';

const HERO_SHELL_PREVIEW =
  'relative isolate min-h-[5.5rem] overflow-hidden bg-white px-2 pb-2 pt-2.5';

function CirclePortrait({ className = '' }: { className?: string }) {
  return <Bone className={`aspect-square rounded-full bg-neutral-300 ${className}`.trim()} />;
}

type HeroBannerSkeletonProps = { preview?: boolean };

function shellClass(preview?: boolean) {
  return preview ? HERO_SHELL_PREVIEW : HERO_SHELL;
}

function SwissEditorialHeroBannerSkeleton({ preview }: HeroBannerSkeletonProps = {}) {
  return (
    <section className={`${shellClass(preview)} bg-neutral-50`} aria-hidden>
      <div
        className={`mx-auto flex w-full max-w-6xl flex-col ${
          preview ? 'gap-2' : 'h-full flex-1 justify-center gap-8'
        }`}
      >
        {/* Top: statement ~60% left · sharp 3/4 portrait right */}
        <div className="flex w-full items-start justify-between gap-4 sm:gap-8">
          <div className={`min-w-0 space-y-2 ${preview ? 'w-[58%]' : 'w-[60%]'}`}>
            <Bone className={`w-full ${preview ? 'h-6' : 'h-16 sm:h-20'}`} />
            <Bone className={`w-[88%] ${preview ? 'h-6' : 'h-16 sm:h-20'}`} />
          </div>
          <div
            className={`shrink-0 overflow-hidden rounded-none bg-neutral-100 ring-1 ring-neutral-200/80 ${
              preview ? 'w-14' : 'w-40 sm:w-48'
            }`}
          >
            <Bone className="aspect-[3/4] w-full rounded-none bg-neutral-300" />
          </div>
        </div>

        {/* Mid: hairline · Currently / Specialized · hairline */}
        <div className={preview ? 'py-0.5' : 'py-1'}>
          <div className="border-t border-neutral-200" />
          <div
            className={`grid grid-cols-2 ${
              preview ? 'gap-x-4 py-1.5' : 'gap-x-10 py-4 sm:gap-x-16'
            }`}
          >
            <div className="space-y-1.5">
              <Bone className={`w-16 ${preview ? 'h-2' : 'h-2.5'}`} />
              <Bone className={`w-24 ${preview ? 'h-2.5' : 'h-3.5'}`} />
            </div>
            <div className="space-y-1.5">
              <Bone className={`w-20 ${preview ? 'h-2' : 'h-2.5'}`} />
              <Bone className={`w-28 ${preview ? 'h-2.5' : 'h-3.5'}`} />
            </div>
          </div>
          <div className="border-t border-neutral-200" />
        </div>

        {/* Bottom: huge signature */}
        <Bone
          className={`w-[min(100%,36rem)] ${preview ? 'h-7' : 'h-16 sm:h-20'}`}
        />
      </div>
    </section>
  );
}

function PortraitIdentityHeroBannerSkeleton({ preview }: HeroBannerSkeletonProps = {}) {
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
        <div className={`w-full bg-neutral-200 ${preview ? 'mt-2 h-px' : 'mt-10 h-px'}`} />
        <div
          className={`grid w-full grid-cols-3 text-center ${
            preview ? 'mt-1.5 gap-2' : 'mt-5 gap-4 sm:gap-8'
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
          <div className={preview ? 'mt-1.5 space-y-0.5' : 'mt-4 space-y-2'}>
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

/** Mini wireframe for Hero → Banner design picker. */
export function HeroBannerDesignPreview({ design }: { design: PortfolioHeroBannerDesign }) {
  return (
    <div
      className="overflow-hidden rounded-xl border border-neutral-200/80 bg-white"
      aria-hidden
    >
      <PortfolioHeroBannerSkeleton design={design} preview />
    </div>
  );
}
