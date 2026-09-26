'use client';

/**
 * Gallery — "Tall row": a horizontal rail of monumental vertical cards.
 *
 * What the design is built out of, in the order it reads:
 *
 *  1. **An asymmetric rhythm.** The cards do not share a baseline: each one is dropped or lifted
 *     by its place in a three-step cycle, so the row breathes instead of ruling a straight line
 *     across the screen. The offset is `margin`, never `translate` — the shared gallery entrance
 *     (`useGalleryReveal`) tweens an inline `y` on these very nodes and would cancel a transform
 *     class on the same element.
 *  2. **A title that only exists on hover.** No permanent label welded to the bottom of the
 *     photograph. The work's name rises at the *top* of the card, letter by letter, as a filled
 *     line with the same words repeated underneath in outline — the two lines read as one
 *     typographic object, and the outline is what makes it look printed rather than captioned.
 *  3. **A cinematic push-in.** The media sits in its own transform layer inside the card's
 *     `overflow: hidden` and scales over several seconds, slowly enough that you notice the frame
 *     changing rather than the UI reacting. Its own layer on purpose: a scale on a node that also
 *     carries text softens the text, and GSAP's entrance already writes `scale` on the media node.
 *  4. **Inertia.** The rail is a real scroller — trackpad, touch and scrollbar all work natively —
 *     but a horizontal wheel gesture and the two chevrons both run through one damped animation
 *     loop, so the row glides to a stop instead of arriving at it.
 *
 * Site-wide trap respected throughout: any node that animates transform/opacity through CSS
 * carries `data-pf-no-color-transition`, otherwise the global color-mode transition rule in
 * globals.css replaces its `transition-property` and the motion silently disappears.
 */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { servicesColorLuminance } from '@/components/portfolio/portfolio-services-settings';
import type { PortfolioGalleryPresentationSettings } from '@/components/portfolio/portfolio-gallery-settings';
import type { ProfileGalleryItem } from '@/types/ecosystem';

/* ---------------------------------------------------------------------- */
/* Scale — the single place this design is sized from                      */
/* ---------------------------------------------------------------------- */

const TALL_ROW_SCALE = {
  /** Card height. Massive by design: the row is meant to own the viewport, not sit inside it. */
  height: 'h-[clamp(24rem,72vh,46rem)]',
  /** Portrait ratio. The height leads and the width follows from it, at every breakpoint. */
  ratio: 3 / 4,
  /**
   * The asymmetric rhythm, in px, as a three-step cycle. Three rather than two: a strict
   * odd/even alternation reads as a zigzag, a three-step cycle reads as a rhythm.
   */
  offsets: [0, 40, 18],
  /** The title's per-letter stagger and the outline line's extra delay, in ms. */
  letterStagger: 26,
  outlineDelay: 90,
  /** The push-in: long enough to read as the image breathing rather than as a hover state. */
  zoomMs: 2800,
  zoomScale: 1.09,
} as const;

/** One curve for the whole design. */
const TALL_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

/* ---------------------------------------------------------------------- */
/* Inertia                                                                 */
/* ---------------------------------------------------------------------- */

/** Share of the remaining distance eaten per frame. Lower = a longer glide. */
const FRICTION = 0.11;

/**
 * One damped loop shared by the wheel and the chevrons: both write a *target* scroll position and
 * the loop eases the real one toward it. Two separate mechanisms (native `scroll-behavior: smooth`
 * for the buttons, raw `scrollLeft` for the wheel) would fight each other the moment a visitor
 * used both within the same second, which is exactly when it is most visible.
 */
function useInertiaScroll(enabled: boolean) {
  const ref = useRef<HTMLDivElement | null>(null);
  const target = useRef(0);
  const frame = useRef(0);
  const animating = useRef(false);

  const stop = useCallback(() => {
    if (frame.current) cancelAnimationFrame(frame.current);
    frame.current = 0;
    animating.current = false;
  }, []);

  useEffect(() => stop, [stop]);

  const glideTo = useCallback(
    (left: number) => {
      const node = ref.current;
      if (!node) return;
      const max = node.scrollWidth - node.clientWidth;
      target.current = Math.max(0, Math.min(max, left));
      if (!enabled) {
        node.scrollLeft = target.current;
        return;
      }
      if (animating.current) return;
      animating.current = true;
      // A plain local function rather than a `useCallback` that calls itself: the loop only ever
      // reads refs, so it needs no identity of its own, and a self-referencing hook value cannot
      // see its own updates.
      const tick = () => {
        const current = ref.current;
        if (!current) return stop();
        const distance = target.current - current.scrollLeft;
        if (Math.abs(distance) < 0.5) {
          current.scrollLeft = target.current;
          return stop();
        }
        current.scrollLeft += distance * FRICTION;
        frame.current = requestAnimationFrame(tick);
      };
      frame.current = requestAnimationFrame(tick);
    },
    [enabled, stop]
  );

  /** A gesture that is not animating owns the scroll position; resync before damping from it. */
  const glideBy = useCallback(
    (delta: number) => {
      const node = ref.current;
      if (!node) return;
      if (!animating.current) target.current = node.scrollLeft;
      glideTo(target.current + delta);
    },
    [glideTo]
  );

  return { ref, glideTo, glideBy, stop, isAnimating: animating };
}

/* ---------------------------------------------------------------------- */
/* The title                                                               */
/* ---------------------------------------------------------------------- */

/**
 * One line of the title, split per character so it can rise letter by letter out of its own mask.
 * The mask is `overflow: hidden` on the line, which also clips descenders — hence the padding
 * under it, sized in `em` so it follows the type rather than a fixed pixel guess.
 */
function TallRowTitleLine({
  text,
  outline,
  color,
  revealed,
  baseDelay,
}: {
  text: string;
  /** Outline: transparent fill with a stroke, the second half of the layered-title effect. */
  outline?: boolean;
  color: string;
  /** `false` keeps the line hidden until the card is hovered or focused. */
  revealed: boolean;
  baseDelay: number;
}) {
  return (
    <span className="block overflow-hidden pb-[0.14em]" aria-hidden={outline || undefined}>
      {Array.from(text).map((character, index) => (
        <span
          key={`${character}-${index}`}
          className={`inline-block will-change-transform ${
            revealed
              ? 'translate-y-0 opacity-100'
              : 'translate-y-[110%] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100'
          }`}
          data-pf-no-color-transition=""
          style={{
            transition: `transform 760ms ${TALL_EASE} ${baseDelay + index * TALL_ROW_SCALE.letterStagger}ms, opacity 520ms ${TALL_EASE} ${
              baseDelay + index * TALL_ROW_SCALE.letterStagger
            }ms`,
            ...(outline
              ? {
                  WebkitTextStrokeWidth: '1px',
                  WebkitTextStrokeColor: color,
                  color: 'transparent',
                }
              : { color }),
          }}
        >
          {character === ' ' ? ' ' : character}
        </span>
      ))}
    </span>
  );
}

/* ---------------------------------------------------------------------- */
/* The card                                                                */
/* ---------------------------------------------------------------------- */

function TallRowCard({
  item,
  presentation,
  media,
  onOpen,
  showTitle,
  alwaysOnTitle,
  offset,
}: {
  item: ProfileGalleryItem;
  presentation: PortfolioGalleryPresentationSettings;
  media: ReactNode;
  onOpen?: () => void;
  showTitle: boolean;
  /** `Title reveal: always` — the owner wants the name readable without hovering. */
  alwaysOnTitle: boolean;
  offset: number;
}) {
  const title = (item.title ?? '').trim();
  const interactive = Boolean(onOpen);
  const radius = `${presentation.radius}px`;
  // The title sits *on* the photograph, over its own scrim — white, like every other overlay
  // caption in this section, and not `itemTitleColor`, which is an ink chosen to read against the
  // page rather than against an image.
  const ink = '#ffffff';
  // A black card on a black page needs a hairline and a shadow simply to have edges. The hairline
  // is drawn in the card's own ink so it survives a light palette too.
  const hairline = `color-mix(in srgb, ${ink} 16%, transparent)`;

  return (
    <article
      key={item.id}
      data-gallery-reveal=""
      // The rhythm is `margin-top`, not `translate-y`: the shared entrance tweens an inline `y` on
      // this node and clears it by name, which would take a transform class with it.
      style={{
        marginTop: `${offset}px`,
        borderRadius: radius,
        borderColor: hairline,
        // Diffuse and low-lying, never a hard drop: the point is depth against the page, not a
        // box around the card.
        boxShadow: '0 34px 90px -46px rgba(0,0,0,0.95), 0 2px 10px -6px rgba(0,0,0,0.6)',
      }}
      className={`group relative isolate flex aspect-[3/4] shrink-0 snap-start flex-col overflow-hidden border ${TALL_ROW_SCALE.height} ${
        interactive
          ? 'cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-current'
          : ''
      }`}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-label={interactive ? `Open ${title || 'this media'}` : undefined}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (!interactive) return;
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onOpen?.();
        }
      }}
    >
      {/* The push-in lives on its own layer inside the card's clip, so it can never blur the copy
          above it and never collides with the entrance's own transform on the media node. */}
      <div
        className="absolute inset-0 z-0 group-hover:scale-[var(--pf-tall-zoom)] group-focus-within:scale-[var(--pf-tall-zoom)]"
        data-pf-no-color-transition=""
        style={
          {
            '--pf-tall-zoom': TALL_ROW_SCALE.zoomScale,
            transition: `transform ${TALL_ROW_SCALE.zoomMs}ms ${TALL_EASE}`,
          } as CSSProperties
        }
      >
        {media}
      </div>

      {/* A scrim only where the title is. Without it a white title over a pale photograph has
          nothing to sit on, and `.pf-gallery-media-title` force-disables text-shadow site-wide. */}
      {showTitle && title ? (
        <span
          aria-hidden
          className={`pointer-events-none absolute inset-x-0 top-0 z-[5] block h-[38%] ${
            alwaysOnTitle
              ? ''
              : 'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100'
          }`}
          data-pf-no-color-transition=""
          style={{
            backgroundImage:
              'linear-gradient(to bottom, rgba(0,0,0,0.66) 0%, rgba(0,0,0,0.28) 52%, rgba(0,0,0,0) 100%)',
            transition: `opacity 620ms ${TALL_EASE}`,
          }}
        />
      ) : null}

      {showTitle && title ? (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 px-6 pt-6 sm:px-7 sm:pt-7">
          <h3 className="text-[clamp(1.1rem,1.1vw+0.85rem,1.6rem)] font-semibold uppercase leading-[1.05] tracking-[-0.02em]">
            <TallRowTitleLine text={title} color={ink} revealed={alwaysOnTitle} baseDelay={0} />
            {/* The same words again, in outline — the second line is the effect, not a repeat. */}
            <TallRowTitleLine
              text={title}
              color={ink}
              outline
              revealed={alwaysOnTitle}
              baseDelay={TALL_ROW_SCALE.outlineDelay}
            />
          </h3>
        </div>
      ) : null}
    </article>
  );
}

/* ---------------------------------------------------------------------- */
/* Chevrons                                                                */
/* ---------------------------------------------------------------------- */

function TallRowChevron({
  direction,
  disabled,
  onClick,
  ink,
  hairline,
}: {
  direction: -1 | 1;
  disabled: boolean;
  onClick: () => void;
  ink: string;
  hairline: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === -1 ? 'Previous' : 'Next'}
      className={`group/nav flex h-14 w-14 shrink-0 items-center justify-center rounded-full border focus:outline-none focus-visible:ring-2 focus-visible:ring-current ${
        disabled ? 'cursor-default opacity-25' : 'hover:-translate-y-0.5'
      }`}
      data-pf-no-color-transition=""
      style={{
        borderColor: hairline,
        color: ink,
        transition: `transform 520ms ${TALL_EASE}, opacity 520ms ${TALL_EASE}`,
      }}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.3}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
        className={`h-5 w-5 ${
          disabled ? '' : direction === -1 ? 'group-hover/nav:-translate-x-1' : 'group-hover/nav:translate-x-1'
        }`}
        data-pf-no-color-transition=""
        style={{ transition: `transform 520ms ${TALL_EASE}` }}
      >
        <path d={direction === -1 ? 'M20 12H5' : 'M4 12h15'} />
        <path d={direction === -1 ? 'm11 6-6 6 6 6' : 'm13 6 6 6-6 6'} />
      </svg>
    </button>
  );
}

/* ---------------------------------------------------------------------- */
/* The rail                                                                */
/* ---------------------------------------------------------------------- */

export function GalleryTallRow({
  items,
  presentation,
  header,
  renderMedia,
  onOpen,
  reduceMotion,
  showTitle,
}: {
  items: ProfileGalleryItem[];
  presentation: PortfolioGalleryPresentationSettings;
  /** The section's own heading block; the chevrons sit on its right, on the same line. */
  header?: ReactNode;
  renderMedia: (item: ProfileGalleryItem, index: number, eager: boolean) => ReactNode;
  onOpen?: (item: ProfileGalleryItem) => void;
  reduceMotion: boolean;
  showTitle: boolean;
}) {
  const { ref, glideTo, glideBy, stop, isAnimating } = useInertiaScroll(!reduceMotion);
  const [bounds, setBounds] = useState({ atStart: true, atEnd: false, scrollable: false });
  // The chevrons live on the page, not on an image, so their ink is read off the section's own
  // background — `itemTitleColor` is near-black by default and would vanish on the dark ground
  // this design is built for.
  const onDark = servicesColorLuminance(presentation.sectionBackgroundColor || '#ffffff') < 0.5;
  const ink = onDark ? '#ffffff' : presentation.itemTitleColor || '#171717';
  const hairline =
    presentation.galleryPalette?.bordure ?? `color-mix(in srgb, ${ink} 30%, transparent)`;
  const alwaysOnTitle = (presentation.tallRowTitleReveal ?? 'hover') === 'always';
  const showNav = presentation.showCarouselNav !== false && items.length > 1;

  const syncBounds = useCallback(() => {
    const node = ref.current;
    if (!node) return;
    const travel = node.scrollWidth - node.clientWidth;
    setBounds({
      atStart: node.scrollLeft <= 2,
      atEnd: travel <= 4 || node.scrollLeft >= travel - 2,
      scrollable: travel > 4,
    });
  }, [ref]);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    syncBounds();
    // A second read on the next frame: the first one can land before the cards have resolved their
    // `clamp()` height — and therefore their width — which would leave the chevrons disabled on a
    // rail that does overflow.
    const frame = requestAnimationFrame(syncBounds);
    if (typeof ResizeObserver === 'undefined') return () => cancelAnimationFrame(frame);
    // The cards, not only the viewport: the scroller's own box does not change when its content
    // grows, so observing it alone never notices the row becoming scrollable.
    const observer = new ResizeObserver(syncBounds);
    observer.observe(node);
    Array.from(node.children).forEach((child) => observer.observe(child));
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [syncBounds, ref, items.length]);

  /**
   * The damped wheel gesture, attached by hand: React registers `onWheel` as a *passive* listener
   * on the root, where `preventDefault()` is a no-op and the browser scrolls underneath the
   * animation anyway. Only a horizontal gesture is taken — swallowing vertical wheel events over a
   * full-height rail would trap the page, where the visitor scrolls and nothing but this row moves.
   */
  useEffect(() => {
    const node = ref.current;
    if (!node || reduceMotion) return;
    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
      if (node.scrollWidth - node.clientWidth <= 0) return;
      event.preventDefault();
      glideBy(event.deltaX);
    };
    node.addEventListener('wheel', onWheel, { passive: false });
    return () => node.removeEventListener('wheel', onWheel);
  }, [ref, glideBy, reduceMotion]);

  /** Step to the next card's own leading edge — the cards are a different width at every size. */
  const step = (direction: -1 | 1) => {
    const node = ref.current;
    if (!node) return;
    const cards = Array.from(node.children) as HTMLElement[];
    if (cards.length === 0) return;
    const origin = node.getBoundingClientRect().left;
    const leftOf = (card: HTMLElement) => card.getBoundingClientRect().left - origin + node.scrollLeft;
    // While a glide is running, step from where it is *heading*, not from where it is — otherwise
    // two quick presses both resolve against the same card and the second one does nothing.
    const from = isAnimating.current ? node.scrollLeft + (direction === 1 ? 8 : -8) : node.scrollLeft;
    const next =
      direction === 1
        ? cards.find((card) => leftOf(card) > from + 4)
        : [...cards].reverse().find((card) => leftOf(card) < from - 4);
    const travel = node.scrollWidth - node.clientWidth;
    glideTo(next ? leftOf(next) : direction === 1 ? travel : 0);
  };

  if (items.length === 0) return null;

  return (
    <div className="w-full min-w-0">
      {header || showNav ? (
        <div className="mb-10 flex w-full flex-wrap items-end justify-between gap-6">
          <div className="min-w-0 flex-1">{header}</div>
          {showNav ? (
            <div className="flex shrink-0 items-center gap-3">
              <TallRowChevron
                direction={-1}
                disabled={!bounds.scrollable || bounds.atStart}
                onClick={() => step(-1)}
                ink={ink}
                hairline={hairline}
              />
              <TallRowChevron
                direction={1}
                disabled={!bounds.scrollable || bounds.atEnd}
                onClick={() => step(1)}
                ink={ink}
                hairline={hairline}
              />
            </div>
          ) : null}
        </div>
      ) : null}

      <div
        ref={ref}
        onScroll={syncBounds}
        // A native touch drag owns the scroll position outright; cancelling the glide on contact
        // stops the loop from fighting the finger.
        onPointerDown={stop}
        // `items-start` so a card's own `margin-top` offset survives — stretching would flatten the
        // whole rhythm back onto one baseline. The padding is room for the offsets and the shadows,
        // which an `overflow-x-auto` row cannot get from `overflow-y: visible`.
        className="flex w-full min-w-0 items-start overflow-x-auto overscroll-x-contain pb-6 pt-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ gap: `${presentation.gap}px` }}
      >
        {items.map((item, index) => (
          <TallRowCard
            key={item.id}
            item={item}
            presentation={presentation}
            media={renderMedia(item, index, index < 3)}
            onOpen={onOpen ? () => onOpen(item) : undefined}
            showTitle={showTitle}
            alwaysOnTitle={alwaysOnTitle}
            offset={TALL_ROW_SCALE.offsets[index % TALL_ROW_SCALE.offsets.length]}
          />
        ))}
      </div>
    </div>
  );
}
