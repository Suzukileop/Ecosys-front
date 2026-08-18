'use client';

import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  PORTFOLIO_PRESENCE_OPTIONS,
  type PortfolioPresenceKind,
} from '@/components/portfolio/portfolio-presence';

type PortfolioPresencePickerProps = {
  onSelect: (kind: PortfolioPresenceKind) => void;
};

export function PortfolioPresencePicker({ onSelect }: PortfolioPresencePickerProps) {
  return (
    <div className="w-full px-1 py-4 sm:py-8">
      <div className="mb-6 text-left sm:mb-8">
        <h2 className="text-lg font-extrabold tracking-tight text-slate-900 sm:text-xl dark:text-white">
          Build your vision
        </h2>
      </div>

      <div className="flex flex-col items-stretch gap-8 lg:flex-row lg:items-center lg:justify-start lg:gap-14 xl:gap-16">
        <div
          className="grid w-full min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:flex-[1.55] lg:gap-6"
          role="list"
          aria-label="Presence types"
        >
          {PORTFOLIO_PRESENCE_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              role="listitem"
              onClick={() => onSelect(option.id)}
              className="group relative flex min-h-[12.5rem] flex-col items-center justify-center gap-4 rounded-2xl border border-neutral-200 bg-white px-5 py-8 text-center shadow-sm transition hover:bg-neutral-50 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800/80 sm:min-h-[14.5rem] sm:px-6 sm:py-10 lg:min-h-[16rem]"
            >
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-orange-50 text-[#FF6B00] dark:bg-orange-500/10 dark:text-[#FF6B00] sm:h-16 sm:w-16">
                <FontAwesomeIcon
                  icon={option.icon}
                  className="h-6 w-6 sm:h-7 sm:w-7"
                  aria-hidden
                />
              </span>
              <span className="flex max-w-[16rem] flex-col gap-1">
                <span className="text-base font-extrabold leading-snug tracking-tight text-slate-900 sm:text-lg dark:text-white">
                  {option.title}
                </span>
                <span className="text-sm leading-snug text-zinc-600 dark:text-zinc-400">
                  {option.teaser}
                </span>
              </span>
            </button>
          ))}
        </div>

        <div className="flex w-full min-w-0 max-w-sm shrink-0 flex-col items-center lg:max-w-md">
          <div className="relative flex w-full items-center justify-center">
            <Image
              src="/SVG/undraw_decide_g91m-light.svg"
              alt=""
              width={960}
              height={559}
              unoptimized
              className="h-auto w-full object-contain dark:hidden"
              priority
            />
            <Image
              src="/SVG/undraw_decide_g91m-dark.svg"
              alt=""
              width={960}
              height={559}
              unoptimized
              className="hidden h-auto w-full object-contain dark:block"
              priority
            />
          </div>
          <p className="mt-4 w-full text-center text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
            Pick how you want to present yourself. This filters the sections shown in the sidebar.
          </p>
        </div>
      </div>
    </div>
  );
}
