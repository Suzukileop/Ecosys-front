'use client';

/**
 * Split screen — the Team section's asymmetric editorial design.
 *
 * One side is a column of monumental uppercase names using its negative space as composition; the
 * other is a single vertical portrait frame that fills the whole locked height. The addressed name
 * is the only one at full contrast (the rest sit at ~22% opacity); hovering, focusing or tapping
 * another one moves the focus, and the portrait plus the museum-caption block at the bottom of the
 * text column change together on one GSAP timeline.
 *
 * The composition is full-bleed: it cancels the site's editorial gutter with the exact negative
 * margins of `settings.global.contentGutter`, so the portrait plate runs to the physical edge of the
 * page and the names start at it. Only the text column keeps a small optical inset of its own —
 * deliberately smaller than the site gutter, so the block still reads as edge-to-edge.
 *
 * The frame's height never depends on the member on screen: every name is always rendered, and the
 * caption's role line and social row reserve a fixed number of lines, so switching member can only
 * repaint — it can never resize the composition.
 *
 * Site-wide trap to respect when editing: any node that animates transform/opacity through CSS
 * needs `data-pf-no-color-transition`, otherwise the global color-mode transition rule in
 * globals.css replaces its `transition-property` and the motion silently disappears.
 */

import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import gsap from 'gsap';
import {
  teamReadableCardText,
  teamSocialIconButtonClass,
  type PortfolioTeamCornerRadius,
  type PortfolioTeamPolaroidPhotoTone,
  type PortfolioTeamPresentationSettings,
} from '@/components/portfolio/portfolio-team-settings';
import {
  portfolioEditorialGutterNegativeX,
  type PortfolioContentGutter,
} from '@/components/portfolio/portfolio-editorial-layout';
import {
  TEAM_CLEAR_PROPS,
  teamIndexLabel,
  teamPrefersReducedMotion,
  teamPremiumEase,
  useTeamSwipe,
} from '@/components/portfolio/portfolio-team-design-motion';
import {
  EASE_CLS,
  META_CLS,
  TeamMemberImage,
  TeamSocialLinks,
} from '@/components/portfolio/portfolio-team-design-primitives';
import type { ProfileTeamMember } from '@/types/ecosystem';

/**
 * The portrait frame's own corners. Kept local rather than imported from the catalogue file: that
 * file imports this design, so reaching back into it would close an import cycle.
 */
function splitFrameRadiusClass(radius: PortfolioTeamCornerRadius): string {
  if (radius === 'sm') return 'rounded-xl';
  if (radius === 'md') return 'rounded-[2rem]';
  if (radius === 'lg') return 'rounded-[3rem]';
  return 'rounded-none';
}

function splitFrameShadowClass(shadow: PortfolioTeamPresentationSettings['cardShadow']): string {
  if (shadow === 'soft') return 'shadow-sm';
  if (shadow === 'medium') return 'shadow-lg shadow-black/10';
  if (shadow === 'strong') return 'shadow-2xl shadow-black/20';
  return '';
}

/**
 * The composition's locked height, at every breakpoint it exists. A `min-h` with a floor, never a
 * hard `h`: the frame still never moves between members (nothing in it is member-dependent), but a
 * short viewport grows it instead of clipping the caption off the bottom.
 */
const SPLIT_FRAME_CLASS = 'lg:min-h-[clamp(38rem,82vh,56rem)]';

/**
 * The text column's own optical inset. It sits on the name list and the caption rather than on their
 * wrapper, because below `lg` that wrapper is `display: contents` and would drop any padding. Kept
 * well under the site gutter it replaces, and dropped entirely on the side that faces the portrait.
 */
function splitTextInsetClass(portraitRight: boolean): string {
  return portraitRight
    ? 'px-5 sm:px-6 lg:pl-8 lg:pr-0 xl:pl-10 2xl:pl-14'
    : 'px-5 sm:px-6 lg:pl-0 lg:pr-8 xl:pr-10 2xl:pr-14';
}

/**
 * Below `lg` the portrait carries a fixed ratio and the text flows around it; from `lg` up it fills
 * the column, so the frame height is what sizes it — never the other way round.
 */
const SPLIT_PORTRAIT_CLASS = 'aspect-[4/5] sm:aspect-[3/4] lg:aspect-auto lg:h-full';

/**
 * Name scale by roster size. A five-person team gets display type; past that the same monumental
 * treatment would run the column off any screen, so the step down keeps the list readable as a list.
 */
function splitNameSizeClass(count: number): string {
  if (count > 8) return 'text-[calc(clamp(1.25rem,3.4vw,2.35rem)*var(--pf-team-font-scale,1))]';
  if (count > 5) return 'text-[calc(clamp(1.5rem,4.4vw,3.25rem)*var(--pf-team-font-scale,1))]';
  return 'text-[calc(clamp(1.9rem,5.6vw,4.5rem)*var(--pf-team-font-scale,1))]';
}

/** Vertical rhythm of the name column, tied to the same roster size as the type scale. */
function splitNameGapClass(count: number): string {
  if (count > 8) return 'gap-1';
  if (count > 5) return 'gap-1.5 sm:gap-2';
  return 'gap-2 sm:gap-3';
}

function splitToneClass(tone: PortfolioTeamPolaroidPhotoTone): string {
  if (tone === 'color') return '';
  if (tone === 'monochrome') return 'grayscale contrast-[1.06] saturate-[0.9]';
  return `grayscale contrast-[1.06] saturate-[0.9] transition-[filter] duration-[1100ms] ${EASE_CLS} group-hover/portrait:grayscale-0 group-hover/portrait:contrast-100 group-hover/portrait:saturate-100`;
}

export function TeamSplitScreen({
  members,
  presentation,
  contentGutter,
}: {
  members: ProfileTeamMember[];
  presentation: PortfolioTeamPresentationSettings;
  /** Site-wide editorial gutter — this design is full-bleed and cancels it, so it has to read the
   *  real per-account value rather than assume the default. */
  contentGutter?: PortfolioContentGutter;
}) {
  const [activeId, setActiveId] = useState(members[0]?.id ?? '');
  const [socialsOpen, setSocialsOpen] = useState(false);
  const active = members.find((member) => member.id === activeId) ?? members[0];
  const activeIndex = Math.max(0, members.findIndex((member) => member.id === active?.id));
  const swapRef = useRef<HTMLDivElement | null>(null);
  const veilRef = useRef<HTMLSpanElement | null>(null);
  const captionRef = useRef<HTMLDivElement | null>(null);
  const previousIndex = useRef(activeIndex);
  const firstRender = useRef(true);
  const baseId = useId();

  /** Wraps, so a swipe or an arrow key never dead-ends on the first or last member. */
  const step = useCallback(
    (direction: 1 | -1) => {
      if (members.length < 2) return;
      setActiveId((current) => {
        const index = members.findIndex((member) => member.id === current);
        const from = index < 0 ? 0 : index;
        return members[(from + direction + members.length) % members.length].id;
      });
    },
    [members]
  );

  // Mobile: the portrait is the one immersive surface, so it is what you swipe through.
  useTeamSwipe(swapRef, step, members.length < 2);

  useEffect(() => {
    const direction = activeIndex >= previousIndex.current ? 1 : -1;
    previousIndex.current = activeIndex;
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const swap = swapRef.current;
    const caption = captionRef.current;
    if (!swap || teamPrefersReducedMotion()) return;
    const ease = teamPremiumEase();
    const veil = veilRef.current;
    const lines = caption ? Array.from(caption.querySelectorAll<HTMLElement>('[data-split-line]')) : [];
    let tween: gsap.core.Timeline | undefined;
    try {
      tween = gsap.timeline();
      // A vertical curtain keyed to the direction you moved through the list, not a crossfade: the
      // new portrait is already in place and is simply uncovered, which is what stops the swap
      // reading as a load. The counter-slide carries the direction of the choice.
      tween.fromTo(
        swap,
        {
          clipPath: direction === 1 ? 'inset(100% 0% 0% 0%)' : 'inset(0% 0% 100% 0%)',
          scale: 1.07,
          yPercent: direction * 2.5,
        },
        {
          clipPath: 'inset(0% 0% 0% 0%)',
          scale: 1,
          yPercent: 0,
          duration: 1.05,
          ease,
          clearProps: TEAM_CLEAR_PROPS,
        }
      );
      if (veil) {
        tween.fromTo(veil, { opacity: 0.55 }, { opacity: 0, duration: 1.15, ease, clearProps: 'opacity' }, 0);
      }
      if (lines.length > 0) {
        // The caption is the portrait's museum label: it has to land on the same beat, so its
        // stagger starts inside the curtain rather than after it.
        tween.fromTo(
          lines,
          { autoAlpha: 0, y: 16 },
          { autoAlpha: 1, y: 0, duration: 0.78, ease, stagger: 0.07, clearProps: TEAM_CLEAR_PROPS },
          0.1
        );
      }
    } catch (error) {
      console.error('[Team split screen] GSAP swap failed', error);
      gsap.set([swap, ...(veil ? [veil] : []), ...lines], { clearProps: TEAM_CLEAR_PROPS });
    }
    return () => {
      tween?.kill();
    };
  }, [activeId, activeIndex]);

  if (!active) return null;
  const readable = teamReadableCardText(presentation);
  const portraitRight = (presentation.splitPortraitSide ?? 'right') === 'right';
  const revealSocials = presentation.splitSocialsReveal !== false;
  const toneCls = splitToneClass(presentation.splitPhotoTone ?? 'monochrome');
  const textInset = splitTextInsetClass(portraitRight);
  const frameRadius = splitFrameRadiusClass(presentation.splitPanelRadius ?? 'none');
  // Socials one step up: at this scale the default icons read as an afterthought in the caption.
  const socialPresentation = {
    ...presentation,
    socialIconSize:
      presentation.socialIconSize === 'sm'
        ? ('md' as const)
        : presentation.socialIconSize === 'md'
          ? ('lg' as const)
          : ('xl' as const),
  };
  // The social row's slot keeps its height whether the links are shown or not, so deploying them
  // can never nudge the caption — or the locked frame above it.
  const socialSlotClass = teamSocialIconButtonClass(socialPresentation.socialIconSize).split(' ')[0] ?? 'h-9';
  const socialsVisible = !revealSocials || socialsOpen;

  const onListKeyDown = (event: ReactKeyboardEvent<HTMLUListElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      event.preventDefault();
      step(1);
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      event.preventDefault();
      step(-1);
    }
  };

  return (
    <article
      /* `contents` below `lg` lets the three blocks order themselves around the portrait — names,
         portrait, caption — so a tap on a name shows its result immediately underneath instead of
         off-screen above. From `lg` up the wrapper becomes the text column again. */
      /* Full-bleed: no max-width and no centring margin — the negative gutter below is what makes
         the plate reach the page edge, so re-boxing it here would undo the whole composition.
         `w-auto`, not `w-full`: a fixed width would let the negative margins only slide the block
         left, keeping it one gutter short of the right edge — auto lets them widen it instead. */
      className={`grid w-auto max-w-none grid-cols-1 gap-10 lg:gap-12 xl:gap-16 ${portfolioEditorialGutterNegativeX(contentGutter)} ${
        portraitRight
          ? 'lg:grid-cols-[minmax(0,1.04fr)_minmax(0,0.96fr)]'
          : 'lg:grid-cols-[minmax(0,0.96fr)_minmax(0,1.04fr)]'
      } ${SPLIT_FRAME_CLASS} lg:items-stretch`}
    >
      <div
        className={`contents lg:flex lg:min-w-0 lg:flex-col lg:justify-between lg:gap-12 ${
          portraitRight ? 'lg:order-1' : 'lg:order-2'
        }`}
      >
        <ul
          className={`order-1 flex min-w-0 list-none flex-col ${textInset} ${splitNameGapClass(members.length)}`}
          role="tablist"
          aria-orientation="vertical"
          aria-label="Team members"
          onKeyDown={onListKeyDown}
          data-team-reveal=""
        >
          {members.map((member, index) => {
            const isActive = member.id === active.id;
            return (
              <li key={member.id} className="min-w-0">
                <button
                  type="button"
                  role="tab"
                  id={`${baseId}-tab-${index}`}
                  aria-selected={isActive}
                  aria-controls={`${baseId}-portrait`}
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => setActiveId(member.id)}
                  onFocus={() => setActiveId(member.id)}
                  // Hover moves the focus and stays there: restoring the default on leave would
                  // make the composition flicker every time the pointer crossed the column.
                  onPointerEnter={(event) => {
                    if (event.pointerType === 'mouse') setActiveId(member.id);
                  }}
                  className={`group/name flex w-full items-baseline gap-3 text-left uppercase transition-[opacity,transform] duration-[620ms] ${EASE_CLS} focus:outline-none focus-visible:underline focus-visible:decoration-1 focus-visible:underline-offset-8 sm:gap-5 ${
                    isActive
                      ? 'translate-x-0 opacity-100'
                      : // A pointer that cannot hover never gets the reveal, so on touch the resting
                        // contrast has to carry the list on its own — at 22% it reads as ghost text
                        // with nothing to suggest the names are the control.
                        'opacity-[0.22] hover:opacity-100 [@media(hover:none)]:opacity-50 lg:-translate-x-1 lg:hover:translate-x-0'
                  }`}
                  data-pf-no-color-transition=""
                >
                  {/* The index only exists on the addressed name — a caption for the one portrait
                      on screen, rather than a numbered list competing with the names. */}
                  <span
                    aria-hidden
                    className={`${META_CLS} w-[2.4ch] shrink-0 transition-opacity duration-[620ms] ${EASE_CLS} ${
                      isActive ? 'opacity-70' : 'opacity-0'
                    }`}
                    style={{ color: readable.muted }}
                    data-pf-no-color-transition=""
                  >
                    {teamIndexLabel(index)}
                  </span>
                  <span
                    className={`min-w-0 break-words font-bold leading-[0.88] tracking-[-0.045em] ${splitNameSizeClass(members.length)}`}
                    style={{ color: readable.strong }}
                  >
                    {member.name}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        {/* Museum label: a hairline, then the role, the counter and the links as one compact block
            pinned to the bottom of the column — a footnote to the portrait, never a second title. */}
        <div
          ref={captionRef}
          className={`order-3 flex min-w-0 flex-col ${textInset}`}
          data-team-reveal=""
        >
          <span
            aria-hidden
            className="mb-6 block h-px w-full"
            style={{ backgroundColor: presentation.cardBorderColor }}
          />
          <span className={`${META_CLS} flex items-center gap-2`} style={{ color: readable.muted }} data-split-line="">
            <span style={{ color: readable.strong }}>{teamIndexLabel(activeIndex)}</span>
            <span className="opacity-50">/ {teamIndexLabel(members.length - 1)}</span>
          </span>
          {presentation.showResponsibility ? (
            // Two lines reserved: a one-line role and a two-line one have to occupy the same box,
            // or every switch would move the links underneath them.
            <p
              className="mt-4 h-[2.9em] overflow-hidden text-[calc(0.78rem*var(--pf-team-font-scale,1))] font-medium uppercase leading-[1.45] tracking-[0.2em] sm:text-[calc(0.85rem*var(--pf-team-font-scale,1))]"
              style={{ color: readable.strong }}
              data-split-line=""
            >
              {active.responsibility}
            </p>
          ) : null}
          {presentation.showSocials ? (
            <div className="mt-6" data-split-line="">
              {revealSocials ? (
                <button
                  type="button"
                  aria-expanded={socialsOpen}
                  aria-controls={`${baseId}-socials`}
                  onClick={() => setSocialsOpen((open) => !open)}
                  // Hovering is enough on a mouse — the click stays for touch and keyboards.
                  onPointerEnter={(event) => {
                    if (event.pointerType === 'mouse') setSocialsOpen(true);
                  }}
                  className={`group/more inline-flex items-center gap-2 ${META_CLS} focus:outline-none focus-visible:ring-1 focus-visible:ring-current`}
                  style={{ color: readable.strong }}
                  data-pf-no-color-transition=""
                >
                  <span className="relative pb-1">
                    Social links
                    {/* The underline draws itself in from the left instead of appearing — the whole
                        micro-interaction on an otherwise silent control. */}
                    <span
                      aria-hidden
                      className={`absolute inset-x-0 bottom-0 block h-px origin-left transition-transform duration-[620ms] ${EASE_CLS} ${
                        socialsOpen ? 'scale-x-100' : 'scale-x-0 group-hover/more:scale-x-100'
                      }`}
                      style={{ backgroundColor: readable.strong }}
                      data-pf-no-color-transition=""
                    />
                  </span>
                  <span
                    aria-hidden
                    className={`block text-[1.1em] leading-none transition-transform duration-[620ms] ${EASE_CLS} ${
                      socialsOpen ? 'rotate-[135deg]' : 'rotate-0'
                    }`}
                    data-pf-no-color-transition=""
                  >
                    +
                  </span>
                </button>
              ) : null}
              {/* The slot is always this tall, open or shut, so deploying the links never resizes
                  the caption; only their opacity and offset change. */}
              <div
                id={`${baseId}-socials`}
                className={`${socialSlotClass} overflow-hidden ${revealSocials ? 'mt-4' : ''}`}
              >
                <div
                  className={`transition-[transform,opacity] duration-[620ms] ${EASE_CLS} ${
                    socialsVisible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0'
                  }`}
                  aria-hidden={socialsVisible ? undefined : true}
                  data-pf-no-color-transition=""
                >
                  <TeamSocialLinks
                    member={active}
                    presentation={socialPresentation}
                    align="justify-start"
                    spacing="wide"
                  />
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
      {/* The portrait frame: one vertical plate filling the locked height, nothing drawn around it. */}
      <div
        id={`${baseId}-portrait`}
        role="tabpanel"
        aria-labelledby={`${baseId}-tab-${activeIndex}`}
        aria-label={presentation.showName ? active.name : undefined}
        className={`group/portrait relative order-2 w-full min-w-0 overflow-hidden ${frameRadius} ${splitFrameShadowClass(presentation.cardShadow)} ${SPLIT_PORTRAIT_CLASS} ${
          portraitRight ? 'lg:order-2' : 'lg:order-1'
        }`}
        data-team-reveal=""
      >
        <div ref={swapRef} className="h-full w-full" data-pf-no-color-transition="">
          {/* `cover` is forced, not read from the settings: this frame is fixed, so a `contain` fit
              would letterbox a landscape photo inside a full-height plate. */}
          <TeamMemberImage
            member={active}
            presentation={{ ...presentation, imageAspect: 'portrait', imageFit: 'cover' }}
            className={toneCls}
            fill
            reveal
          />
        </div>
        <span
          ref={veilRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[2] block opacity-0"
          data-pf-no-color-transition=""
          style={{ backgroundColor: '#0a0a0a' }}
        />
        {/* The name printed on the plate itself, bottom-left — the caption in the text column stays
            the role and the links, so the two blocks never repeat each other. */}
        {presentation.showName ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[3] flex items-end p-5 sm:p-7 lg:p-9">
            <span
              aria-hidden
              className="absolute inset-x-0 bottom-0 block h-2/5 bg-gradient-to-t from-black/70 via-black/25 to-transparent"
            />
            <h3
              className="relative font-serif text-[calc(clamp(1.1rem,1.9vw,1.75rem)*var(--pf-team-font-scale,1))] font-semibold leading-[1.05] tracking-[-0.03em] text-white"
              aria-hidden
            >
              {active.name}
            </h3>
          </div>
        ) : null}
      </div>
    </article>
  );
}
