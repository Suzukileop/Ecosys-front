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
          <h2 className="text-[24px] font-extrabold leading-[1.15] tracking-[-0.02em] text-[#0F1419] dark:text-[#E7E9EA] sm:text-[32px]">
            {headline}
          </h2>
          <p className="mt-3 max-w-sm text-[15px] leading-[22px] text-[#536471] dark:text-[#71767B]">{description}</p>

          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
            <button
              type="button"
              onClick={onCreate}
              disabled={createDisabled}
              className="inline-flex h-10 items-center justify-center bg-[#0F1419] px-5 text-[15px] font-bold text-white transition-colors hover:bg-[#272C30] disabled:cursor-not-allowed disabled:opacity-30 dark:bg-[#EFF3F4] dark:text-[#0F1419] dark:hover:bg-[#D7DBDC]"
            >
              {ctaLabel}
            </button>
            {createDisabled ? (
              <p className="text-[14px] text-[#536471] dark:text-[#71767B]">{disabledHint}</p>
            ) : null}
          </div>
        </div>

        <div className="order-1 min-w-0 lg:order-2" aria-hidden>
          <div className="relative ml-auto aspect-[4/3] w-full max-w-[540px] overflow-hidden bg-[#F7F9F9] dark:bg-[#16181C]">
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
