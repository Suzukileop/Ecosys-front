'use client';

import Image from 'next/image';
import { STUDIO_FLOAT_IN_STYLE } from '@/components/portfolio/PortfolioStudioKit';

type CreatorEmptyGuideProps = {
  headline: string;
  description: string;
  ctaLabel: string;
  onCreate: () => void;
  createDisabled?: boolean;
  disabledHint?: string;
  imageSrc: string;
  ariaLabel: string;
};

export function CreatorEmptyGuide({
  headline,
  description,
  ctaLabel,
  onCreate,
  createDisabled = false,
  disabledHint = 'Complete your profile to unlock.',
  imageSrc,
  ariaLabel,
}: CreatorEmptyGuideProps) {
  return (
    <section
      style={STUDIO_FLOAT_IN_STYLE}
      className="flex w-full min-h-0 flex-1 items-center py-8 sm:py-12"
      aria-label={ariaLabel}
    >
      <div className="grid w-full items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-14">
        <div className="order-2 min-w-0 lg:order-1">
          <h2 className="text-[32px] font-semibold leading-[1.1] tracking-[-0.03em] text-[#111111] dark:text-white sm:text-[40px]">
            {headline}
          </h2>
          <p className="mt-4 max-w-sm text-base text-neutral-400 dark:text-neutral-500">{description}</p>

          <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-3">
            <button
              type="button"
              onClick={onCreate}
              disabled={createDisabled}
              className="inline-flex h-11 items-center justify-center rounded-full bg-[#111111] px-6 text-[15px] font-medium text-white transition-[opacity,transform] hover:opacity-85 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-30 dark:bg-white dark:text-[#111111]"
            >
              {ctaLabel}
            </button>
            {createDisabled ? (
              <p className="text-sm text-neutral-400 dark:text-neutral-500">{disabledHint}</p>
            ) : null}
          </div>
        </div>

        <div className="order-1 min-w-0 lg:order-2" aria-hidden>
          <div className="relative ml-auto aspect-[4/3] w-full max-w-[540px] overflow-hidden rounded-[24px] bg-neutral-100 dark:bg-neutral-900">
            <Image
              src={imageSrc}
              alt=""
              fill
              priority
              sizes="(min-width: 1024px) 540px, 100vw"
              className="object-cover dark:opacity-90"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
