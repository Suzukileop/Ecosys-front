'use client';

/**
 * Gallery — "Floating canvas": a dispersed, bespoke canvas of cards that float on scroll.
 *
 * What the design is built out of, in the order it reads:
 *
 *  1. **A bespoke rhythm, not a grid.** Every card takes its width, its ratio, its horizontal
 *     side and its vertical drop from one six-step table (`CANVAS_RHYTHM`). Six steps rather than
 *     two or three: a short cycle reads as a repeating pattern, six reads as a composition. A
 *     massive portrait lands next to a small square that has been dropped a hundred pixels, and
 *     nothing shares a baseline with anything.
 *  2. **Lanes, filled sequentially.** The cards are chunked into vertical lanes in order — lane
 *     one takes the first slice, lane two the next — so the owner's sort order survives both the
 *     desktop canvas (down a lane, then across) and the mobile collapse (a single column). A
 *     round-robin distribution would scramble that collapse.
 *  3. **Per-card scroll parallax.** One scrubbed ScrollTrigger drives every card at once, each at
 *     a speed taken from its own depth factor, so the canvas resolves into planes instead of
 *     sliding as one sheet. The tween lives on a wrapper of its own, never on the card: the
 *     shared gallery entrance (`useGalleryReveal`) tweens an inline `y` on the card node and the
 *     two would cancel each other. Nested layers compose.
 *  4. **A badge straddling the bottom edge.** No caption block outside the frame. The title sits
 *     in a minimal pill, centred and half-sunk into the card's own bottom border, so it reads as
 *     a fixed marker while the image floats behind it. On hover the pill rises and firms up while
 *     the media pushes in over two and a half seconds — slow enough to read as the frame
 *     breathing rather than as the UI reacting.
 *
 * Offsets are `margin`/`padding`, never `translate`: GSAP owns `transform` on these nodes, both
 * for the entrance and for the parallax, and a transform utility on the same element is silently
 * overwritten. They are declared as CSS custom properties so `globals.css` can flatten the whole
 * scatter at one breakpoint (`.pf-canvas-tile` / `.pf-canvas-lane`) — the mobile layout is a
 * fluid asymmetric column, not the desktop chaos squeezed into 380px.
 *
 * Site-wide trap respected throughout: any node that animates transform/opacity through CSS
 * carries `data-pf-no-color-transition`, otherwise the global color-mode transition rule in
 * globals.css replaces its `transition-property` and the motion silently disappears.
 */

import { useLayoutEffect, useMemo, useRef, type CSSProperties } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PortfolioDeferredMedia } from '@/components/portfolio/PortfolioDeferredMedia';
import { galleryPrefersReducedMotion } from '@/components/portfolio/portfolio-gallery-design-motion';
import { servicesColorLuminance } from '@/components/portfolio/portfolio-services-settings';
import {
  galleryAspectStyle,
  galleryItemDisplayTitle,
  type PortfolioGalleryPresentationSettings,
} from '@/components/portfolio/portfolio-gallery-settings';
import type { ProfileGalleryItem } from '@/types/ecosystem';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/* ---------------------------------------------------------------------- */
/* Scale — the single place this design is sized from                       */
/* ---------------------------------------------------------------------- */

/** One curve for every motion in this design. */
const CANVAS_EASE = 'ease-[cubic-bezier(0.16,1,0.3,1)]';

/**
 * The composition, as a six-step cycle.
 *
 * `width` is a share of the card's own lane, `widthSm` the same share once the canvas has
 * collapsed to one column (kept high and much more even — a 60% card alone on a phone is a
 * thumbnail, not a composition). `side` picks which edge of the lane the card hangs off, `lift`
 * drops it down the lane, and `depth` is its parallax speed: below 1 the card sits on a far plane
 * and barely drifts, above 1 it is the nearest thing on the canvas.
 */
const CANVAS_RHYTHM = [
  { width: 100, widthSm: 100, side: 'start', ratio: 3 / 4, lift: 0, depth: 1 },
  { width: 66, widthSm: 82, side: 'end', ratio: 1, lift: 104, depth: 0.5 },
  { width: 88, widthSm: 100, side: 'center', ratio: 4 / 5, lift: 28, depth: 0.82 },
  { width: 72, widthSm: 78, side: 'start', ratio: 4 / 3, lift: 136, depth: 0.44 },
  { width: 100, widthSm: 100, side: 'end', ratio: 2 / 3, lift: 12, depth: 1.18 },
  { width: 60, widthSm: 86, side: 'start', ratio: 1, lift: 78, depth: 0.62 },
] as const;

/** Per-lane head start, in px, so no two lanes begin on the same line. */
const CANVAS_LANE_LIFT = [0, 86, 34, 120] as const;

/** Multiplier applied to every `lift` and lane head start, per Dispersion step. */
const CANVAS_DISPERSION = { aligned: 0, subtle: 0.45, medium: 1, wild: 1.6 } as const;

/** Total scroll travel, in px, of a card at depth 1, per Parallax step. */
const CANVAS_PARALLAX = { off: 0, subtle: 34, medium: 64, strong: 104 } as const;

/** Floor on the vertical gap once a badge is on, so it never sits on the next image. */
const CANVAS_BADGE_CLEARANCE = 46;

/** The scatter and the parallax both belong to the multi-lane canvas only. */
const CANVAS_DESKTOP_QUERY = '(min-width: 768px)';

const CANVAS_SIDE_ALIGN = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
} as const;

/**
 * The float, as a class list: two diffuse casts that deepen and a card that rises with them.
 *
 * It sits on a layer of its own, between the parallax wrapper (GSAP writes `transform` there
 * every scroll frame) and the card (the shared entrance writes `transform` there too). A CSS
 * transition on either of those would lag the tween that owns it; here nothing else competes.
 */
const CANVAS_FLOAT =
  `group relative block w-full transition-[transform,box-shadow] duration-[620ms] ${CANVAS_EASE} ` +
  'shadow-[0_30px_60px_-32px_rgba(0,0,0,0.62),0_4px_18px_-10px_rgba(0,0,0,0.38)] ' +
  'hover:-translate-y-1.5 hover:shadow-[0_52px_92px_-38px_rgba(0,0,0,0.78),0_10px_28px_-14px_rgba(0,0,0,0.5)] ' +
  'focus-within:-translate-y-1.5 focus-within:shadow-[0_52px_92px_-38px_rgba(0,0,0,0.78),0_10px_28px_-14px_rgba(0,0,0,0.5)]';

/** Badge geometry, shared by the titled pill and the bare index. */
const CANVAS_BADGE_BASE =
  `pointer-events-none absolute bottom-0 left-1/2 z-[4] -translate-x-1/2 translate-y-1/2 rounded-full border backdrop-blur-md transition-[transform,background-color,border-color,opacity] duration-[620ms] ${CANVAS_EASE} group-hover:translate-y-[30%] group-focus-within:translate-y-[30%]`;

/* ---------------------------------------------------------------------- */
/* One card                                                                */
/* ---------------------------------------------------------------------- */

function FloatingCanvasCard({
  item,
  index,
  presentation,
  eager,
  onOpen,
  showTitle,
  ink,
  hairline,
  badgeDark,
}: {
  item: ProfileGalleryItem;
  index: number;
  presentation: PortfolioGalleryPresentationSettings;
  eager: boolean;
  onOpen?: (item: ProfileGalleryItem) => void;
  showTitle: boolean;
  ink: string;
  hairline: string;
  badgeDark: boolean;
}) {
  const step = CANVAS_RHYTHM[index % CANVAS_RHYTHM.length];
  const title = galleryItemDisplayTitle(item.title);
  const withTitle = showTitle && Boolean(title);
  const isInteractive = Boolean(onOpen);
  // An explicit ratio is the owner's decision and outranks the composition: the rhythm then keeps
  // only its widths and its offsets. On `auto` the per-card ratio *is* the design.
  const aspect =
    presentation.imageAspect === 'auto'
      ? { aspectRatio: `${step.ratio}` }
      : galleryAspectStyle(presentation.imageAspect);
  // Generous corners are part of the look; the section's own radius can only go further.
  const radius = `${Math.max(presentation.radius, 18)}px`;
  const badgeSkin: CSSProperties = badgeDark
    ? {
        backgroundColor: 'rgba(10,10,10,0.62)',
        borderColor: 'rgba(255,255,255,0.14)',
        color: '#ffffff',
      }
    : {
        backgroundColor: 'rgba(255,255,255,0.78)',
        borderColor: 'rgba(0,0,0,0.08)',
        color: '#111111',
      };

  const activate = () => {
    if (onOpen) onOpen(item);
  };

  return (
    <div className={CANVAS_FLOAT} data-pf-no-color-transition="" style={{ borderRadius: radius }}>
      <article
        data-gallery-reveal=""
        className={`relative block w-full ${
          isInteractive
            ? 'cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500'
            : ''
        }`}
        style={{ borderRadius: radius }}
        role={isInteractive ? 'button' : undefined}
        tabIndex={isInteractive ? 0 : undefined}
        aria-label={isInteractive ? `Open ${title || 'this media'}` : undefined}
        onClick={activate}
        onKeyDown={(event) => {
          if (!isInteractive) return;
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            activate();
          }
        }}
      >
        <div
          data-gallery-reveal-media=""
          className="relative w-full overflow-hidden"
          data-pf-no-color-transition=""
          style={{ borderRadius: radius, ...aspect }}
        >
          {/* The push-in lives on a layer of its own, inside the frame's `overflow-hidden`: a
              scale on the media node itself is what the shared entrance already animates, and a
              scale on the frame would take the hairline and the badge with it. */}
          <div
            className={`relative h-full w-full transition-transform duration-[2500ms] ${CANVAS_EASE} will-change-transform group-hover:scale-[1.075] group-focus-within:scale-[1.075]`}
            data-pf-no-color-transition=""
          >
            <PortfolioDeferredMedia
              src={item.mediaUrl}
              alt={title || 'Gallery media'}
              sizes="(max-width: 767px) 92vw, (max-width: 1279px) 44vw, 30vw"
              eager={eager}
              highPriority={eager}
              kind={item.mediaType === 'VIDEO' ? 'video' : 'image'}
              objectFit={presentation.objectFit}
              objectPosition={presentation.objectPosition}
              autoPlayVideo={item.mediaType === 'VIDEO'}
              showPlayBadge={item.mediaType === 'VIDEO'}
              noColorTransition
            />
          </div>
          {/* The translucent separation between a dark card and a dark ground — inset, so it
              never becomes a drawn box around the photograph. */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 z-[2] rounded-[inherit]"
            data-pf-no-color-transition=""
            style={{ boxShadow: `inset 0 0 0 1px ${hairline}` }}
          />
        </div>

        {/* Half in, half out: anchored to the card's own bottom border, so it stays a fixed
            marker while the image floats behind it. A self-translate, never a negative margin —
            a margin here would change the lane's flow height. */}
        {withTitle ? (
          <span
            className={`${CANVAS_BADGE_BASE} max-w-[86%] truncate px-4 py-[0.4rem] text-center text-[calc(0.72rem*var(--pf-gallery-font-scale,1))] font-medium uppercase leading-[1.35] tracking-[0.14em] opacity-90 group-hover:opacity-100 group-focus-within:opacity-100`}
            data-pf-no-color-transition=""
            style={badgeSkin}
          >
            <span className="opacity-45">{String(index + 1).padStart(2, '0')}</span>
            <span aria-hidden className="mx-2 opacity-30">
              /
            </span>
            {title}
          </span>
        ) : (
          /* Titles off: the bottom edge still needs a mark, otherwise a card dropped 130px down
             its lane reads as a mistake rather than a choice. */
          <span
            aria-hidden
            className={`${CANVAS_BADGE_BASE} px-3 py-[0.3rem] text-[calc(0.64rem*var(--pf-gallery-font-scale,1))] font-medium tabular-nums tracking-[0.14em] opacity-70 group-hover:opacity-100 group-focus-within:opacity-100`}
            data-pf-no-color-transition=""
            style={badgeDark ? badgeSkin : { ...badgeSkin, color: ink }}
          >
            {String(index + 1).padStart(2, '0')}
          </span>
        )}
      </article>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* The canvas                                                              */
/* ---------------------------------------------------------------------- */

export function GalleryFloatingCanvas({
  items,
  presentation,
  onOpen,
  showTitle,
}: {
  items: ProfileGalleryItem[];
  presentation: PortfolioGalleryPresentationSettings;
  onOpen?: (item: ProfileGalleryItem) => void;
  showTitle: boolean;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const laneCount = (presentation.floatingCanvasLanes ?? '3') === '2' ? 2 : 3;
  const dispersion = CANVAS_DISPERSION[presentation.floatingCanvasDispersion ?? 'medium'] ?? 1;
  const parallax = presentation.floatingCanvasParallax ?? 'medium';
  const badgeDark = (presentation.floatingCanvasBadge ?? 'dark') === 'dark';

  // The hairline is read off the section's own ground, not off `itemTitleColor`: this design is
  // built for a dark canvas, where a near-black default ink draws nothing at all.
  const onDark = servicesColorLuminance(presentation.sectionBackgroundColor || '#ffffff') < 0.5;
  const ink = onDark ? '#ffffff' : presentation.itemTitleColor || '#171717';
  const hairline =
    presentation.galleryPalette?.bordure ??
    `color-mix(in srgb, ${ink} ${onDark ? 14 : 12}%, transparent)`;

  const hGap = Math.max(presentation.gap, 20);
  const vGapRaw = presentation.verticalGap >= 0 ? presentation.verticalGap : presentation.gap;
  const vGap = Math.max(vGapRaw, CANVAS_BADGE_CLEARANCE);

  /** Sequential chunking, so lane order and document order are the same thing. */
  const lanes = useMemo(() => {
    const total = items.length;
    if (total === 0) return [] as { item: ProfileGalleryItem; index: number }[][];
    const count = Math.min(laneCount, total);
    const base = Math.floor(total / count);
    const remainder = total % count;
    const out: { item: ProfileGalleryItem; index: number }[][] = [];
    let cursor = 0;
    for (let lane = 0; lane < count; lane += 1) {
      // The remainder goes to the leading lanes, one card each: a single lane carrying every
      // leftover would end far below the others.
      const size = base + (lane < remainder ? 1 : 0);
      out.push(
        items.slice(cursor, cursor + size).map((item, offset) => ({ item, index: cursor + offset }))
      );
      cursor += size;
    }
    return out;
  }, [items, laneCount]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    if (galleryPrefersReducedMotion()) return undefined;
    const travel = CANVAS_PARALLAX[parallax] ?? CANVAS_PARALLAX.medium;
    if (travel <= 0) return undefined;

    const layers = Array.from(root.querySelectorAll<HTMLElement>('[data-canvas-depth]'));
    if (layers.length < 2) return undefined;

    let media: ReturnType<typeof gsap.matchMedia> | undefined;
    try {
      media = gsap.matchMedia();
      // Desktop only, and reverted automatically on the way out: on one column the cards already
      // sit in a single flow, where drifting them at different speeds only opens ragged holes.
      media.add(CANVAS_DESKTOP_QUERY, () => {
        const timeline = gsap.timeline({
          scrollTrigger: { trigger: root, start: 'top bottom', end: 'bottom top', scrub: 0.6 },
        });
        layers.forEach((layer) => {
          const raw = Number(layer.getAttribute('data-canvas-depth'));
          const depth = Number.isFinite(raw) && raw > 0 ? raw : 1;
          // Half the travel each way, so a card ends the section as far above its flow position
          // as it started below it and the canvas stays centred on its own layout.
          const amount = (travel * depth) / 2;
          if (amount < 1) return;
          timeline.fromTo(layer, { y: amount }, { y: -amount, ease: 'none', duration: 1 }, 0);
        });
        return () => {
          timeline.scrollTrigger?.kill();
          timeline.kill();
          gsap.set(layers, { clearProps: 'transform' });
        };
      });
    } catch (error) {
      console.error('[GalleryFloatingCanvas] parallax failed to initialize', error);
      media?.revert();
      gsap.set(layers, { clearProps: 'transform' });
    }

    const refreshId = window.setTimeout(() => {
      try {
        ScrollTrigger.refresh();
      } catch (error) {
        console.error('[GalleryFloatingCanvas] deferred ScrollTrigger.refresh() failed', error);
      }
    }, 80);

    return () => {
      window.clearTimeout(refreshId);
      media?.revert();
    };
  }, [items.length, laneCount, parallax]);

  if (items.length === 0) return null;

  return (
    /* `overflow-visible` everywhere down this tree: the badge hangs past its card's bottom edge
       and the float shadows bleed past their frames. */
    <div ref={rootRef} className="w-full overflow-visible">
      <div
        className="flex flex-col items-stretch overflow-visible md:flex-row md:items-start"
        style={{ columnGap: `${hGap}px`, rowGap: `${vGap}px` }}
      >
        {lanes.map((lane, laneIndex) => (
          <div
            key={laneIndex}
            className="pf-canvas-lane flex w-full min-w-0 flex-col overflow-visible md:flex-1"
            style={
              {
                rowGap: `${vGap}px`,
                '--pf-canvas-lane-lift': `${Math.round(
                  (CANVAS_LANE_LIFT[laneIndex % CANVAS_LANE_LIFT.length] ?? 0) * dispersion
                )}px`,
              } as CSSProperties
            }
          >
            {lane.map(({ item, index }) => {
              const step = CANVAS_RHYTHM[index % CANVAS_RHYTHM.length];
              return (
                <div
                  key={item.id}
                  data-canvas-depth={step.depth}
                  className="pf-canvas-tile overflow-visible will-change-transform"
                  style={
                    {
                      alignSelf: CANVAS_SIDE_ALIGN[step.side],
                      '--pf-canvas-w': `${step.width}%`,
                      '--pf-canvas-w-sm': `${step.widthSm}%`,
                      '--pf-canvas-lift': `${Math.round(step.lift * dispersion)}px`,
                    } as CSSProperties
                  }
                >
                  <FloatingCanvasCard
                    item={item}
                    index={index}
                    presentation={presentation}
                    // One eager card per lane: on a tall screen every lane head is above the fold.
                    eager={lane[0]?.index === index}
                    onOpen={onOpen}
                    showTitle={showTitle}
                    ink={ink}
                    hairline={hairline}
                    badgeDark={badgeDark}
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
