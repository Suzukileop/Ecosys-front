'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  PORTFOLIO_PRESENCE_OPTIONS,
  type PortfolioPresenceKind,
} from '@/components/portfolio/portfolio-presence';
import { PortfolioPresenceIcon } from '@/components/portfolio/portfolio-presence-icons';
import { useT } from '@/lib/i18n/I18nProvider';

type PortfolioPresencePickerProps = {
  onSelect: (kind: PortfolioPresenceKind) => void;
};

/**
 * "Build your vision" — the one screen where the creator commits to what they are building.
 *
 * Three image panels. Hover is local to the panel under the pointer — lift, image scale and
 * a white rule only (black & white chrome: no accent colour). The other two stay untouched.
 */

const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';
const EASE_CLS = 'ease-[cubic-bezier(0.16,1,0.3,1)]';
const HOVER_MS = 600;

export function PortfolioPresencePicker({ onSelect }: PortfolioPresencePickerProps) {
  const t = useT();
  const [active, setActive] = useState<PortfolioPresenceKind | null>(null);

  return (
    <section className="flex w-full flex-col justify-center lg:min-h-[calc(100dvh-5rem)]">
      <div className="mx-auto w-full max-w-[78rem] py-8 sm:py-10 lg:py-6">
        <header className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end md:gap-10">
          <h2 className="shrink-0 text-[clamp(1.75rem,3.4vw,2.75rem)] font-extrabold leading-[1.05] tracking-[-0.025em] text-[#0F1419] dark:text-[#E7E9EA]">
            {t('Build your vision')}
          </h2>
          <p className="max-w-[26rem] text-[15px] leading-5 text-[#536471] md:text-right dark:text-[#71767B]">
            {t('Choose how you present yourself. This unlocks the sections your workspace will offer.')}
          </p>
        </header>

        <div
          role="list"
          aria-label={t('Presence types')}
          className="relative flex w-full flex-col gap-2 sm:gap-4 lg:h-[clamp(26rem,56vh,34rem)] lg:flex-row lg:gap-6"
        >
          {PORTFOLIO_PRESENCE_OPTIONS.map((option) => {
            const isActive = active === option.id;

            return (
              /*
               * The pointer is tracked on this stationary wrapper, not on the button that lifts.
               * Hovering the moving card itself looped at its bottom edge: the lift pulled the card
               * out from under the pointer, `pointerleave` dropped it back, and it rose again.
               */
              <div
                key={option.id}
                role="listitem"
                className="relative flex w-full lg:h-full lg:flex-1"
                onPointerEnter={(event) => {
                  if (event.pointerType === 'touch') return;
                  setActive(option.id);
                }}
                onPointerLeave={(event) => {
                  if (event.pointerType === 'touch') return;
                  setActive((current) => (current === option.id ? null : current));
                }}
              >
              <button
                type="button"
                onClick={() => onSelect(option.id)}
                onFocus={() => setActive(option.id)}
                onBlur={() => setActive((current) => (current === option.id ? null : current))}
                /*
                 * Lift and zoom run together on one clock — same duration, same curve — so the
                 * clip edge and the still never drift out of phase. The card is a permanent
                 * compositor layer with paint containment: its clip is applied by the compositor
                 * instead of being re-rasterised against the moving still every frame.
                 */
                style={{ transition: `transform ${HOVER_MS}ms ${EASE}` }}
                className={`group/panel relative flex min-h-[17rem] w-full cursor-pointer transform-gpu flex-col justify-between overflow-hidden bg-[#0F1419] p-6 text-left will-change-transform [backface-visibility:hidden] [contain:paint] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1419] focus-visible:ring-offset-2 dark:focus-visible:ring-[#E7E9EA] dark:ring-offset-black sm:min-h-[19rem] sm:p-7 md:min-h-[21rem] md:p-8 lg:h-full lg:min-h-0 lg:p-8 ${
                  isActive
                    ? 'z-[1] -translate-y-1.5 lg:-translate-y-2'
                    : 'translate-y-0'
                }`}
              >
                {/*
                 * The still overhangs the card by 3% on every side, so its edges never meet the
                 * card's clip. At rest-scale they used to coincide, and while the card lifted the
                 * boundary re-rasterised into a flickering hairline. The zoom runs on this frame.
                 */}
                <span
                  style={{ transition: `transform ${HOVER_MS}ms ${EASE}` }}
                  className={`pointer-events-none absolute -inset-[3%] transform-gpu will-change-transform [backface-visibility:hidden] ${
                    isActive ? 'scale-[1.05]' : 'scale-100'
                  }`}
                >
                  <Image
                    src={option.image}
                    alt={t(option.imageAlt)}
                    fill
                    priority
                    unoptimized
                    sizes="(max-width: 1023px) 100vw, 33vw"
                    className="object-cover object-center"
                  />
                  {/*
                   * Foot veil — darkens from the bottom and fades out before the middle. It lives
                   * inside the zoom frame so the still and the veil are one composited layer; as
                   * siblings they were composited separately mid-animation and a subpixel sliver of
                   * unveiled still flickered along the bottom edge.
                   */}
                  <span
                    aria-hidden
                    className="absolute inset-x-0 bottom-0 h-[70%] bg-gradient-to-t from-zinc-950/90 via-zinc-950/40 to-transparent"
                  />
                </span>

                {/* Top row: spacer + arrow */}
                <span className="relative z-10 flex items-start justify-end">
                  <span
                    aria-hidden
                    className={`block transition-[transform,color] duration-[600ms] ${EASE_CLS} ${
                      isActive ? '-rotate-45 text-white' : 'rotate-0 text-white/45'
                    }`}
                  >
                    <svg
                      className="h-5 w-5 sm:h-6 sm:w-6"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.75}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </span>
                </span>

                {/* Mark — optically centred in the open field above the copy. Brand orange set inline:
                    the News/X theme remaps the `text-[#FF5722]` utility to its ink (white) with !important. */}
                <span
                  aria-hidden
                  className="relative z-10 flex flex-1 items-center justify-center"
                  style={{ color: '#FF5722' }}
                >
                  <PortfolioPresenceIcon
                    kind={option.id}
                    className="h-[2.25rem] w-[2.25rem] sm:h-[2.75rem] sm:w-[2.75rem] lg:h-[3.25rem] lg:w-[3.25rem]"
                  />
                </span>

                {/* Copy foot */}
                <span className="relative z-10 flex flex-col gap-2.5 pt-6 [text-shadow:0_1px_14px_rgba(0,0,0,0.6)] sm:gap-3 sm:pt-8">
                  <span className="text-[20px] font-extrabold leading-6 text-white lg:text-[24px] lg:leading-7">
                    {t(option.title)}
                  </span>
                  <span
                    className={`max-w-[22rem] text-[15px] font-normal leading-5 transition-colors duration-[600ms] ${EASE_CLS} ${
                      isActive ? 'text-white' : 'text-white/75'
                    }`}
                  >
                    {t(option.teaser)}
                  </span>
                  {/* White rule — grows under the active card only */}
                  <span
                    aria-hidden
                    className={`mt-1 block h-[2px] origin-left bg-white transition-transform duration-[600ms] ${EASE_CLS} ${
                      isActive ? 'w-10 scale-x-100' : 'w-10 scale-x-0'
                    }`}
                  />
                </span>
              </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
