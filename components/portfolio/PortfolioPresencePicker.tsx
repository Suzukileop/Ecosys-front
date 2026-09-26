'use client';

import { useState } from 'react';
import { ACCENT_ORANGE } from '@/components/landing/landingBrand';
import {
  PORTFOLIO_PRESENCE_OPTIONS,
  type PortfolioPresenceKind,
} from '@/components/portfolio/portfolio-presence';
import { PortfolioPresenceIcon } from '@/components/portfolio/portfolio-presence-icons';

type PortfolioPresencePickerProps = {
  onSelect: (kind: PortfolioPresenceKind) => void;
};

/**
 * "Build your vision" — the one screen where the creator commits to what they are building.
 *
 * Three full-height panels. The one under the pointer opens up, lights from within and reveals a
 * wireframe of the page it produces; the other two recede.
 *
 * The middle of each panel carries one hairline mark and nothing else — no grid, no numeral, no
 * glow, and no longer a wireframe mockup either. The mockup could not stay: the hover is now
 * purely chromatic, which means the mark has to remain on screen to change colour, and a full
 * page wireframe drawn through it read as clutter rather than as depth. One mark, one colour
 * change, one type change.
 */

const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';
const EASE_CLS = 'ease-[cubic-bezier(0.16,1,0.3,1)]';

export function PortfolioPresencePicker({ onSelect }: PortfolioPresencePickerProps) {
  /*
   * Driven from state rather than `group-hover`, for two reasons: a panel has to react to what is
   * happening to its *siblings* (the spotlight dims the two that are not active), and the same
   * treatment has to fire on keyboard focus, which a hover-only rule cannot do. `null` is the
   * resting composition — all three equal, no mockups, no glow.
   */
  const [active, setActive] = useState<PortfolioPresenceKind | null>(null);

  return (
    <section className="w-full py-10 sm:py-12 lg:py-10">
      <header className="mb-10 sm:mb-12 lg:mb-12">
        <h2 className="text-[clamp(2.25rem,6vw,4.75rem)] font-semibold leading-[0.95] tracking-[-0.03em] text-neutral-950 dark:text-white">
          Build your vision
        </h2>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
          Pick how you want to present yourself. This decides which sections your workspace offers.
        </p>
      </header>

      <div
        role="list"
        aria-label="Presence types"
        /*
         * Three layouts, one element.
         *
         * Phone: a plain vertical stack. A swipe rail on a 430px screen shows one card and hides
         * the other two behind a gesture nobody is told about — stacked, all three are simply
         * there.
         *
         * Tablet: the rail, with cards at 44vw so the third is visibly cut by the right edge. That
         * overhang *is* the affordance; a rail whose last card ends flush looks like a finished
         * row and never gets swiped.
         *
         * Desktop: the three columns, no scrolling.
         */
        className="pf-scrollbar-hide flex flex-col gap-3 md:-mx-4 md:snap-x md:snap-mandatory md:flex-row md:overflow-x-auto md:px-4 md:pb-2 lg:mx-0 lg:h-[clamp(26rem,58vh,34rem)] lg:snap-none lg:gap-4 lg:overflow-visible lg:px-0 lg:pb-0"
      >
        {PORTFOLIO_PRESENCE_OPTIONS.map((option) => {
          const isActive = active === option.id;
          const isDimmed = active !== null && !isActive;

          return (
            <button
              key={option.id}
              type="button"
              role="listitem"
              onClick={() => onSelect(option.id)}
              onPointerEnter={(event) => {
                if (event.pointerType === 'touch') return;
                setActive(option.id);
              }}
              onPointerLeave={(event) => {
                if (event.pointerType === 'touch') return;
                setActive((current) => (current === option.id ? null : current));
              }}
              onFocus={() => setActive(option.id)}
              onBlur={() => setActive((current) => (current === option.id ? null : current))}
              /*
               * `flexGrow` is the one property here that cannot be animated on the compositor —
               * widening a panel is a layout change by definition. It is kept cheap deliberately:
               * three nodes, one animated layout property each, and everything else inside the
               * panel moving on opacity and transform alone.
               *
               * 1.55 rather than something larger: past roughly 1.6 the two receding panels lose
               * their titles, and a spotlight that erases its alternatives stops being a choice.
               *
               * `lg:basis-0` is what makes that figure mean anything. With the default
               * `basis: auto` the panels start at their content width and `flex-grow` only divides
               * the *leftover* space, so 1.55 moved the active panel by 13% and the gesture barely
               * registered. From a zero basis the grow values are the whole proportion: 44/28/28.
               */
              style={{ transitionTimingFunction: EASE, flexGrow: isActive ? 1.55 : 1 }}
              /*
               * Three tiers of surface, which is the whole of the depth here — no shadow stack, no
               * gradient, no glow.
               *
               * Dark:  page #0A0A0A  ·  card #121212  ·  card hovered #1A1A1A
               * Light: page #F5F5F5  ·  card #FFFFFF  ·  card hovered #FFFFFF + a 2% cast shadow
               *
               * The card used to sit on `neutral-950`, the exact value the page already paints, so
               * the border was doing the entire job of saying where a card began — which is why the
               * composition read flat. The page tones come from `DASHBOARD_MAIN_BG` and are already
               * right; only the cards had to move.
               *
               * Light mode gets the shadow and dark mode does not, deliberately: a cast shadow on
               * a near-black surface is invisible, so lifting a dark card has to be done with tone.
               */
              className={`group/panel relative flex min-h-[15rem] w-full shrink-0 snap-center flex-col justify-end overflow-hidden rounded-2xl border p-6 text-left transition-[flex-grow,opacity,border-color,background-color,box-shadow] duration-[620ms] focus-visible:outline-none sm:min-h-[17rem] sm:p-8 md:min-h-[21rem] md:w-[44vw] md:p-9 lg:h-full lg:min-h-0 lg:w-auto lg:shrink lg:basis-0 lg:p-12 ${
                isDimmed ? 'opacity-40' : 'opacity-100'
              } ${
                isActive
                  ? 'border-black/15 bg-white shadow-[0_8px_30px_rgb(0_0_0_/_0.02)] dark:border-white/10 dark:bg-[#1A1A1A] dark:shadow-none'
                  : 'border-black/[0.05] bg-white shadow-none dark:border-white/[0.04] dark:bg-[#121212]'
              }`}
            >
              {/*
               * THE RESTING MARK. The centre of a panel this tall cannot simply be empty, and the
               * icon is the one thing that belongs there — it says what the option *is* without
               * asking to be read, which a numeral never did. Large and outlined so it reads as a
               * diagram rather than a blob, and monochrome: the accent is spent on the selection
               * rule, and an orange glyph on every panel would mark all three as chosen.
               *
               * In the flow as a `flex-1` row rather than absolutely centred. Pinned to the card's
               * geometric middle it sat visibly low, because that middle includes the text block
               * at the foot; growing into whatever space the text leaves centres it in the part
               * that is actually empty, at any panel height and with no magic percentage.
               *
               * It does not fade out under the pointer: the hover is purely chromatic, so the
               * mark is the thing that changes colour and has to stay on screen to do it.
               */}
              <span
                aria-hidden
                /*
                 * The whole hover is carried on `color`. The marks stroke in `currentColor`, so one
                 * property on this wrapper repaints all three paths — no per-path classes, no
                 * second state to keep in sync, and a pure compositor-friendly colour interpolation
                 * rather than anything that repaints a filter.
                 */
                style={isActive ? { color: ACCENT_ORANGE } : undefined}
                className={`relative flex flex-1 items-center justify-center transition-[color,opacity,transform] duration-[620ms] ${EASE_CLS} ${
                  isActive
                    ? 'scale-100 opacity-100'
                    : 'scale-100 text-neutral-400 opacity-100 dark:text-neutral-700'
                }`}
              >
                <PortfolioPresenceIcon
                  kind={option.id}
                  className="h-[3rem] w-[3rem] sm:h-[3.75rem] sm:w-[3.75rem] md:h-[5rem] md:w-[5rem] lg:h-[6.5rem] lg:w-[6.5rem]"
                />
              </span>

              <span className="relative flex flex-col gap-4 sm:gap-5">
                <span className="flex flex-col gap-2 sm:gap-3">
                  {/*
                   * One tone per role, in both states. The focus is carried by the surface, the
                   * border and the two dimmed siblings — adding a text colour change on top made
                   * four things move for one event, and left the resting cards looking disabled.
                   *
                   * Nothing here changes size, weight or tracking between themes, so a mode switch
                   * cannot reflow the block.
                   */}
                  <span className={`text-[0.95rem] font-semibold uppercase leading-[1.15] tracking-[0.2em] text-[#111111] transition-colors duration-[620ms] ${EASE_CLS} dark:text-white sm:text-[1.1rem] lg:text-[1.3rem]`}>
                    {option.title}
                  </span>
                  <span className={`max-w-[24rem] text-sm leading-relaxed text-neutral-500 transition-colors duration-[620ms] ${EASE_CLS} dark:text-neutral-400`}>
                    {option.teaser}
                  </span>
                </span>

                {/* The rule that resolves on the active panel — the top bar's underline idiom,
                    scaled to the panel and carrying the accent. */}
                <span
                  aria-hidden
                  style={{ backgroundColor: ACCENT_ORANGE, transitionTimingFunction: EASE }}
                  className={`mt-1 block h-px w-full origin-left transition-transform duration-[760ms] ${
                    isActive ? 'scale-x-100' : 'scale-x-0'
                  }`}
                />
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
