'use client';

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { MarketplaceContentItem } from '@/types/marketplace';
import type {
  PortfolioWorkPresentationSettings,
  PortfolioWorkProjectsIndexSettings,
} from '@/components/portfolio/portfolio-work-settings';
import {
  DEFAULT_PROJECTS_INDEX_SETTINGS,
  DEFAULT_WORK_PRESENTATION,
  mergeProjectsIndexSettings,
} from '@/components/portfolio/portfolio-work-settings';
import { aboutBannerScrollParent } from '@/components/portfolio/portfolio-about-scroll-utils';
import { useT } from '@/lib/i18n/I18nProvider';
import {readableMix} from './stack-designs/readable-ink';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const INDEX_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

function workToolLabels(item: MarketplaceContentItem, max = 12): string[] {
  return Array.from(new Set((item.toolsUsed ?? []).map((t) => t.trim()).filter(Boolean))).slice(
    0,
    max
  );
}

function formatIndexNumber(index: number): string {
  return String(index + 1).padStart(3, '0');
}

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function wordLetterCount(word: string): number {
  return (word.match(/\p{L}/gu) ?? []).length;
}

/** Italicize the last word when it stays readable (2+ words, 4+ letters). */
function splitEditorialTitle(title: string): { lead: string; italic: string } | null {
  const words = title.trim().split(/\s+/).filter(Boolean);
  if (words.length < 2) return null;
  const last = words[words.length - 1];
  if (wordLetterCount(last) < 4) return null;
  return { lead: words.slice(0, -1).join(' '), italic: last };
}

/** Per-word masked reveal — the last (italicized) word keeps its editorial styling. */
function RevealTitle({ text }: { text: string }) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const parts = splitEditorialTitle(text);
  const italicWord = parts?.italic ?? null;
  return (
    <>
      {words.map((word, index) => {
        const isItalic = italicWord !== null && index === words.length - 1 && word === italicWord;
        return (
          <span className="pf-work-index-word-mask" key={`${word}-${index}`}>
            <span
              className={`pf-work-index-word-inner${isItalic ? ' font-medium' : ''}`}
              style={{ transitionDelay: `${index * 0.06}s` }}
            >
              {word}
              {index < words.length - 1 ? ' ' : ''}
            </span>
          </span>
        );
      })}
    </>
  );
}

function IndexTitleAnchor({
  href,
  className,
  children,
}: {
  href: string;
  className: string;
  children: ReactNode;
}) {
  const external = /^https?:\/\//i.test(href);
  const style: CSSProperties = { color: 'inherit', textDecoration: 'none' };
  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`${className} no-underline`}
        style={style}
        data-cursor-target=""
        data-pf-no-color-transition=""
      >
        {children}
      </a>
    );
  }
  return (
    <Link
      href={href}
      className={`${className} no-underline`}
      style={style}
      data-cursor-target=""
      data-pf-no-color-transition=""
    >
      {children}
    </Link>
  );
}

function IndexStack({ tools, ink }: { tools: string[]; ink: string }) {
  const t = useT();
  if (tools.length === 0) return null;
  return (
    // Spacing instead of "·" (a wrapped line could start with an orphan dot); no extra 0.75
    // opacity on top of the already-softened ink — tools sit on a photo.
    <ul
      className="pf-work-index-reveal flex flex-wrap items-center gap-x-5 gap-y-2"
      aria-label={t('Stack')}
      style={{ transitionDelay: '0.18s' }}
    >
      {tools.map((tool) => (
        <li
          key={tool}
          className="text-xs font-medium uppercase tracking-[0.16em] sm:text-[0.8125rem]"
          style={{ color: ink }}
        >
          {tool}
        </li>
      ))}
    </ul>
  );
}

function IndexNumberBadge({
  index,
  total,
  marker,
  accent,
  ink,
  muted,
}: {
  index: number;
  total: number;
  marker: 'number' | 'bullet';
  accent: string;
  ink: string;
  muted: string;
}) {
  if (marker === 'bullet') {
    return (
      <span
        className="inline-flex h-2 w-2 shrink-0 rounded-full"
        style={{ backgroundColor: accent || muted }}
        aria-hidden
      />
    );
  }
  // Red-on-photo digits read ~2:1: the digits take the scene ink, the creator's color moves
  // to a short rule in front (shape, not text, so its contrast is decorative).
  return (
    <p
      className="flex items-center gap-3 font-mono text-xs tracking-[0.18em] tabular-nums sm:text-sm"
      aria-hidden
    >
      <span className="h-px w-6 shrink-0" style={{ backgroundColor: accent || ink }} />
      <span className="font-medium" style={{ color: ink }}>
        {formatIndexNumber(index)}
      </span>
      <span style={{ color: muted }}>/ {formatIndexNumber(total - 1)}</span>
    </p>
  );
}

/** One full-bleed project scene — background visual, index, huge title, thin description. */
function IndexScene({
  item,
  index,
  total,
  presentation,
  board,
  isFirst,
}: {
  item: MarketplaceContentItem;
  index: number;
  total: number;
  presentation: PortfolioWorkPresentationSettings;
  board: PortfolioWorkProjectsIndexSettings;
  isFirst: boolean;
}) {
  const t = useT();
  const titleColor = presentation.elementStyles?.cardTitle?.color || presentation.titleColor;
  const subtitleColor = presentation.elementStyles?.cardDescription?.color || presentation.subtitleColor;
  const accent = presentation.ctaColor || presentation.categoryActiveColor || titleColor;
  const surface = presentation.cardBackgroundColor || '#0a0a0a';
  const mobileInk = readableMix(titleColor, 100, surface);
  const mobileMuted = readableMix(subtitleColor, 100, surface);
  const media = item.mediaUrl?.trim() || null;
  const heroInk = media ? '#ffffff' : titleColor;
  const heroMuted = media ? 'rgba(255,255,255,0.78)' : subtitleColor;

  const tools = workToolLabels(item);
  const description = item.description?.trim() || '';
  const showStack = board.showStack && tools.length > 0;
  const showDescription = board.showDescription && Boolean(description);
  const href = item.linkUrl?.trim() || null;
  const title = item.title?.trim() || t('Untitled');

  return (
    <article
      className="pf-work-index-scene relative flex min-h-[var(--pf-index-height)] w-full flex-col justify-end overflow-hidden lg:absolute lg:inset-0 lg:min-h-0"
      data-scene=""
      data-scene-active={isFirst ? 'true' : 'false'}
      style={{ zIndex: index + 1, backgroundColor: surface,
        '--pf-index-mobile-ink':mobileInk,'--pf-index-mobile-muted':mobileMuted,
        '--pf-index-mobile-surface':surface,
      } as CSSProperties}
    >
      <div className="pf-work-index-scene-bg absolute inset-0 overflow-hidden" data-scene-backdrop="" data-scene-dim="" aria-hidden>
        <div className="pf-work-index-scene-media absolute -inset-[2%]" data-scene-media="">
          {media ? (
            <Image
              src={media}
              alt=""
              fill
              sizes="100vw"
              priority={isFirst}
              className="object-cover object-center"
              data-pf-no-color-transition=""
            />
          ) : null}
        </div>
        <div
          className="pf-work-index-scene-spot absolute inset-0"
          style={{ ['--pf-work-index-accent' as string]: accent }}
          aria-hidden
        />
        <div className="pf-work-index-scene-scrim absolute inset-0" aria-hidden />
      </div>
      {media && (board.mediaBorderWidth ?? 1) > 0 ? <div
        className="pf-work-index-media-border pointer-events-none absolute inset-0 z-[2]"
        style={{boxShadow:`inset 0 0 0 ${board.mediaBorderWidth ?? 1}px rgba(255,255,255,0.24)`}}
        aria-hidden="true"
        data-pf-no-color-transition=""
      /> : null}

      <div className="pf-work-index-content relative z-[1] flex w-full flex-col gap-7 px-6 pb-12 sm:px-10 sm:pb-16 lg:gap-9 lg:px-16 lg:pb-20 xl:px-24">
        {board.showNumber ? (
          <IndexNumberBadge
            index={index}
            total={total}
            marker="number"
            accent={accent}
            ink={heroInk}
            muted={heroMuted}
          />
        ) : null}

        <h3
          className="pf-work-index-scene-title max-w-5xl text-[13vw] font-semibold leading-[0.94] tracking-[-0.045em] sm:text-[9vw] lg:text-[6.2vw] xl:text-[5.4rem]"
          style={{ color: heroInk }}
        >
          {href ? (
            <IndexTitleAnchor href={href} className="text-inherit">
              <RevealTitle text={title} />
            </IndexTitleAnchor>
          ) : (
            <span className="text-inherit">
              <RevealTitle text={title} />
            </span>
          )}
        </h3>

        <div className="pf-work-index-details flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
          {showStack ? <IndexStack tools={tools} ink={heroMuted} /> : <span aria-hidden />}
          {showDescription ? (
            <p
              className="pf-work-index-reveal max-w-sm text-base leading-[1.7] sm:text-lg lg:text-right"
              style={{ color: heroMuted, transitionDelay: '0.1s' }}
            >
              {description}
            </p>
          ) : null}
        </div>
        {href?<Link href={href} target="_blank" rel="noopener noreferrer"
          className="pf-work-index-mobile-link inline-flex min-h-11 items-center justify-between gap-4 border-t pt-4 text-sm font-medium lg:hidden"
          style={{color:mobileInk,borderColor:presentation.cardBorderColor}}>
          <span>{t('View project')}</span><span aria-hidden>↗</span>
        </Link>:null}
      </div>
    </article>
  );
}

/**
 * Pins the stage and drives a scroll-scrubbed "curtain" wipe: each next project
 * slides up over the current one. Falls back to a plain stacked flow — revealed
 * per-scene via IntersectionObserver — on touch/narrow screens and reduced motion.
 */
function useIndexCurtainReveal(stageRef: RefObject<HTMLDivElement | null>, sceneCount: number, direction: 'vertical'|'horizontal') {
  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;
    stage.scrollLeft = 0;
    const scenes = Array.from(stage.querySelectorAll<HTMLElement>('[data-scene]'));
    if (scenes.length === 0) return undefined;

    const scroller = aboutBannerScrollParent(stage);
    const stBase = scroller ? { scroller } : {};
    let cleanupIo: (() => void) | undefined;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add(
        {
          isDesktop: '(min-width: 1024px) and (prefers-reduced-motion: no-preference)',
          isFallback: '(max-width: 1023px), (prefers-reduced-motion: reduce)',
        },
        (context) => {
          const conditions = context.conditions as { isDesktop: boolean } | undefined;
          if (!conditions?.isDesktop || scenes.length < 2) {
            gsap.set(scenes, { clearProps: 'transform' });
            if (prefersReducedMotion()) {
              scenes.forEach((scene) => scene.setAttribute('data-scene-active', 'true'));
              return undefined;
            }
            const io = new IntersectionObserver(
              (entries) => {
                entries.forEach((entry) => {
                  if (!entry.isIntersecting) return;
                  (entry.target as HTMLElement).setAttribute('data-scene-active', 'true');
                  io.unobserve(entry.target);
                });
              },
              { threshold: 0.35 }
            );
            scenes.forEach((scene) => io.observe(scene));
            cleanupIo = () => io.disconnect();
            return () => cleanupIo?.();
          }

          const dims = scenes.map((scene) => scene.querySelector<HTMLElement>('[data-scene-dim]'));
          const backdrops = scenes.map((scene) => scene.querySelector<HTMLElement>('[data-scene-backdrop]'));

          const axis = direction === 'horizontal' ? 'xPercent' : 'yPercent';
          gsap.set(scenes, { xPercent: 0, yPercent: 0, scale: 1 });
          gsap.set(backdrops.filter(Boolean), { scale: 1 });
          gsap.set(dims.filter(Boolean), { filter: 'brightness(1)' });
          gsap.set(scenes.slice(1), { [axis]: 100 });
          scenes.forEach((scene, i) =>
            scene.setAttribute('data-scene-active', i === 0 ? 'true' : 'false')
          );

          const viewportSpan = () => stage.clientHeight || 800;
          const tl = gsap.timeline({
            // Reveal each title once, using the *rendered* scrubbed timeline rather
            // than raw scroll progress. Reversing at a midpoint must not hide and
            // reanimate the text or toggle the scene's lighting.
            onUpdate: function () {
              const position = this.time();
              scenes.forEach((scene, i) => {
                if (i === 0 || position >= i - 0.88) {
                  scene.setAttribute('data-scene-active', 'true');
                }
              });
            },
            scrollTrigger: {
              trigger: stage,
              start: 'top top',
              end: () => `+=${(scenes.length - 1) * viewportSpan()}`,
              scrub: 0.35,
              pin: true,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              ...stBase,
            },
          });

          for (let i = 1; i < scenes.length; i += 1) {
            tl.to(scenes[i], { [axis]: 0, ease: 'none', duration: 1 }, i - 1);
            // Keep the scene edges and typography fixed. Only its clipped
            // backdrop zooms, so no gaps or text-size pulses appear at the seam.
            const backdrop = backdrops[i - 1];
            if (backdrop) tl.fromTo(backdrop, { scale: 1 }, { scale: 1.035, ease: 'none', duration: 1, immediateRender: false }, i - 1);
            const dim = dims[i - 1];
            // Darken the actual backdrop pixels, not a separately composited
            // translucent rectangle whose edge can diverge while sliding.
            if (dim) tl.fromTo(dim, { filter: 'brightness(1)' }, { filter: 'brightness(0.7)', ease: 'none', duration: 1, immediateRender: false }, i - 1);
          }

          return () => {
            gsap.set(scenes, { clearProps: 'all' });
            gsap.set(dims.filter(Boolean) as HTMLElement[], { clearProps: 'filter' });
            gsap.set(backdrops.filter(Boolean) as HTMLElement[], { clearProps: 'transform' });
          };
        }
      );
    }, stage);

    const refreshId = window.setTimeout(() => ScrollTrigger.refresh(), 140);

    return () => {
      window.clearTimeout(refreshId);
      cleanupIo?.();
      ctx.revert();
    };
  }, [stageRef, sceneCount, direction]);
}

/**
 * Mouse-reactive backdrop: a soft cursor-following light spot + a light parallax
 * shift on the background image, both driven by two CSS custom properties.
 * The pointer position is only sampled on `pointermove`; the actual style write
 * is batched to one per animation frame (never more than 60/s) so it stays cheap
 * even on high-frequency pointer/trackpad input. No-ops on touch / reduced-motion.
 */
function useIndexParallax(stageRef: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;
    stage.style.setProperty('--mx', '0');
    stage.style.setProperty('--my', '0');
    if (prefersReducedMotion()) return undefined;
    if (!window.matchMedia('(pointer: fine)').matches) return undefined;

    let pendingX = 0;
    let pendingY = 0;
    let hasPending = false;
    let raf = 0;

    const flush = () => {
      raf = 0;
      if (!hasPending) return;
      hasPending = false;
      stage.style.setProperty('--mx', pendingX.toFixed(3));
      stage.style.setProperty('--my', pendingY.toFixed(3));
    };

    const onMove = (event: PointerEvent) => {
      const rect = stage.getBoundingClientRect();
      pendingX = (event.clientX - rect.left) / Math.max(1, rect.width) - 0.5;
      pendingY = (event.clientY - rect.top) / Math.max(1, rect.height) - 0.5;
      hasPending = true;
      if (!raf) raf = window.requestAnimationFrame(flush);
    };

    stage.addEventListener('pointermove', onMove, { passive: true });

    return () => {
      stage.removeEventListener('pointermove', onMove);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [stageRef]);
}

/**
 * Magnetic cursor — lerps to the pointer, morphs into a "View project" pill over
 * any `[data-cursor-target]` link. Disabled on touch / reduced-motion.
 */
function MagneticCursor({
  stageRef,
  accent,
}: {
  stageRef: RefObject<HTMLDivElement | null>;
  accent: string;
}) {
  const t = useT();
  const cursorRef = useRef<HTMLDivElement>(null);
  const [portalHost, setPortalHost] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setPortalHost(stageRef.current?.ownerDocument.body ?? null);
  }, [stageRef]);

  useEffect(() => {
    const stage = stageRef.current;
    const cursor = cursorRef.current;
    if (!stage || !cursor) return undefined;
    const doc = stage.ownerDocument;
    const view = doc.defaultView;
    if (!view) return undefined;
    if (prefersReducedMotion()) return undefined;
    if (!view.matchMedia('(pointer: fine)').matches) return undefined;

    const moveX = gsap.quickTo(cursor, 'x', { duration: 0.3, ease: 'power3.out' });
    const moveY = gsap.quickTo(cursor, 'y', { duration: 0.3, ease: 'power3.out' });

    const onMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      if (cursor.getAttribute('data-cursor-active') !== 'true') {
        // Snap before revealing: never animate in from (0, 0) or an old position.
        gsap.set(cursor, { x: event.clientX, y: event.clientY });
      } else {
        moveX(event.clientX);
        moveY(event.clientY);
      }
      const target = event.target instanceof Element ? event.target.closest('[data-cursor-target]') : null;
      cursor.setAttribute('data-cursor-state', target && stage.contains(target) ? 'view' : 'idle');
      cursor.setAttribute('data-cursor-active', 'true');
    };
    const hide = () => {
      cursor.removeAttribute('data-cursor-active');
      cursor.setAttribute('data-cursor-state', 'idle');
    };

    stage.addEventListener('pointerenter', onMove);
    stage.addEventListener('pointermove', onMove);
    stage.addEventListener('pointerleave', hide);
    stage.addEventListener('pointercancel', hide);
    view.addEventListener('blur', hide);
    doc.addEventListener('scroll', hide, true);
    stage.setAttribute('data-cursor-ready', 'true');

    return () => {
      hide();
      moveX.tween.kill();
      moveY.tween.kill();
      stage.removeEventListener('pointerenter', onMove);
      stage.removeEventListener('pointermove', onMove);
      stage.removeEventListener('pointerleave', hide);
      stage.removeEventListener('pointercancel', hide);
      view.removeEventListener('blur', hide);
      doc.removeEventListener('scroll', hide, true);
      stage.removeAttribute('data-cursor-ready');
    };
  }, [stageRef, portalHost]);

  // Escape transformed preview wrappers: client coordinates must use the viewport.
  return portalHost ? createPortal(
    <div
      ref={cursorRef}
      className="pf-work-index-cursor"
      data-cursor-state="idle"
      aria-hidden
      style={{ ['--pf-cursor-accent' as string]: accent }}
    >
      <span className="pf-work-index-cursor-label">{t('View project')}</span>
    </div>,
    portalHost
  ) : null;
}

/** Full-bleed cinematic scenes — one project dominates the screen at a time. */
export function ProjectsIndexGallery({
  items,
  presentation = DEFAULT_WORK_PRESENTATION,
}: {
  items: MarketplaceContentItem[];
  presentation?: PortfolioWorkPresentationSettings;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const board = mergeProjectsIndexSettings(
    DEFAULT_PROJECTS_INDEX_SETTINGS,
    presentation.projectsIndex
  );
  const accent = presentation.ctaColor || presentation.categoryActiveColor || presentation.titleColor;

  useIndexCurtainReveal(stageRef, items.length, board.scrollDirection ?? 'vertical');
  useIndexParallax(stageRef);

  if (items.length === 0) return null;

  return (
    <div className="pf-work-index relative w-full" data-pf-no-color-transition=""
      data-index-direction={board.scrollDirection ?? 'vertical'}
      style={{'--pf-index-height':'100dvh'} as CSSProperties}>
      <style>{`
        @media (max-width: 1023px), (prefers-reduced-motion: reduce) {
          .pf-work-index-stage { height: auto; overflow: visible; }
          .pf-work-index-scene { position: relative; min-height: 100dvh; }
          [data-index-direction='horizontal'] .pf-work-index-stage {
            display: flex; overflow-x: auto; scroll-snap-type: x mandatory;
          }
          [data-index-direction='horizontal'] .pf-work-index-scene {
            flex: 0 0 100%; min-width: 0; scroll-snap-align: start;
          }
        }
        /* Darkens from ~45 % down: the number and the first title line sit around 65 % of
           the scene height, where the old ramp (0.18 → 0.8) left a bright photo under white type. */
        .pf-work-index-scene-scrim {
          background: linear-gradient(
            180deg,
            rgba(0, 0, 0, 0.06) 0%,
            rgba(0, 0, 0, 0.14) 38%,
            rgba(0, 0, 0, 0.56) 62%,
            rgba(0, 0, 0, 0.84) 100%
          );
        }
        .pf-work-index-scene-media {
          transform: translate3d(calc(var(--mx, 0) * -16px), calc(var(--my, 0) * -16px), 0)
            scale(1.04);
          transition: transform 0.25s ease-out;
          will-change: transform;
        }
        .pf-work-index-scene-spot {
          pointer-events: none;
          mix-blend-mode: soft-light;
          opacity: 0.18;
          background: radial-gradient(
            460px circle at calc(50% + var(--mx, 0) * 60%) calc(50% + var(--my, 0) * 60%),
            var(--pf-work-index-accent, #fff) 0%,
            transparent 70%
          );
        }
        .pf-work-index-scene, .pf-work-index-scene-bg {
          transition: none !important;
        }
        .pf-work-index-scene-bg {
          will-change: filter;
        }
        /* Padding + matching negative margin: at leading 0.94 the mask clipped descenders,
           and the italic last word's overhang on the right (the "g" of "booking"). */
        .pf-work-index-word-mask {
          display: inline-block;
          overflow: hidden;
          vertical-align: bottom;
          padding-bottom: 0.16em;
          margin-bottom: -0.16em;
          padding-inline-end: 0.1em;
          margin-inline-end: -0.1em;
        }
        .pf-work-index-word-inner {
          display: inline-block;
          transform: translate3d(0, 112%, 0);
          transition: transform 0.9s cubic-bezier(0.16, 1, 0.3, 1);
          will-change: transform;
        }
        .pf-work-index-scene[data-scene-active='true'] .pf-work-index-word-inner {
          transform: translate3d(0, 0, 0);
        }
        .pf-work-index-reveal {
          opacity: 0;
          transform: translate3d(0, 14px, 0);
          transition: opacity 0.7s ease, transform 0.7s ${INDEX_EASE};
        }
        .pf-work-index-scene[data-scene-active='true'] .pf-work-index-reveal {
          opacity: 1;
          transform: translate3d(0, 0, 0);
        }
        .pf-work-index-cursor {
          position: fixed;
          top: 0;
          left: 0;
          width: 14px;
          height: 14px;
          margin-left: -7px;
          margin-top: -7px;
          border-radius: 999px;
          background: var(--pf-cursor-accent, #fff);
          pointer-events: none;
          z-index: 60;
          opacity: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          transition:
            width 0.35s cubic-bezier(0.22, 1, 0.36, 1),
            height 0.35s cubic-bezier(0.22, 1, 0.36, 1),
            margin 0.35s cubic-bezier(0.22, 1, 0.36, 1),
            opacity 0.25s ease;
        }
        .pf-work-index-cursor[data-cursor-active='true'] {
          opacity: 1;
        }
        .pf-work-index-cursor[data-cursor-state='view'] {
          width: 108px;
          height: 108px;
          margin-left: -54px;
          margin-top: -54px;
        }
        .pf-work-index-cursor-label {
          opacity: 0;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #0a0a0a;
          white-space: nowrap;
          transition: opacity 0.25s ease 0.05s;
        }
        .pf-work-index-cursor[data-cursor-state='view'] .pf-work-index-cursor-label {
          opacity: 1;
        }
        @media (pointer: coarse) {
          .pf-work-index-cursor {
            display: none;
          }
        }
        .pf-work-index[data-cursor-ready='true'] [data-cursor-target] {
          cursor: none;
        }
        @media (prefers-reduced-motion: reduce) {
          .pf-work-index-word-inner,
          .pf-work-index-reveal {
            transition: none !important;
            transform: none !important;
            opacity: 1 !important;
          }
        }
        @media (max-width: 1023px) {
          .pf-work-index { min-width: 0; max-width: 100%; }
          .pf-work-index-stage {
            display: flex; flex-direction: column; gap: 28px;
          }
          .pf-work-index-scene {
            --pf-index-mobile-media-height: clamp(220px, 72vw, 440px);
            min-height: 0; justify-content: flex-start; min-width: 0;
          }
          .pf-work-index-scene-bg {
            position: relative; inset: auto; width: 100%;
            height: var(--pf-index-mobile-media-height); flex-shrink: 0;
            filter: none !important; transform: none !important; will-change: auto;
          }
          .pf-work-index-scene-media {
            inset: 0; transform: none; transition: none; will-change: auto;
          }
          .pf-work-index-scene-scrim, .pf-work-index-scene-spot { display: none; }
          .pf-work-index-media-border {
            bottom: auto; height: var(--pf-index-mobile-media-height);
          }
          .pf-work-index-content {
            flex: 1; gap: 20px; padding: 24px 20px 28px;
            background: var(--pf-index-mobile-surface);
          }
          .pf-work-index-content > p span:not(:first-child) {
            color: var(--pf-index-mobile-muted) !important;
          }
          .pf-work-index-scene-title {
            color: var(--pf-index-mobile-ink) !important;
            font-size: clamp(28px, 7.5vw, 40px); line-height: 1.12;
            letter-spacing: -0.035em; overflow-wrap: anywhere;
          }
          .pf-work-index-details { gap: 20px; }
          .pf-work-index-details > p {
            order: 0; max-width: none; font-size: 15px; line-height: 1.7;
            color: var(--pf-index-mobile-muted) !important;
          }
          .pf-work-index-details > ul {
            order: 1; gap: 8px;
          }
          .pf-work-index-details li {
            max-width: 100%; padding: 6px 9px; border-radius: 4px;
            background: color-mix(in srgb, var(--pf-index-mobile-ink) 6%, transparent);
            color: var(--pf-index-mobile-muted) !important;
            font-size: 10px; letter-spacing: .07em; line-height: 1.5;
            overflow-wrap: anywhere;
          }
          .pf-work-index-word-inner, .pf-work-index-reveal {
            transform: none !important; opacity: 1 !important; transition: none !important;
          }
          [data-index-direction='horizontal'] .pf-work-index-stage {
            flex-direction: row; gap: 0; align-items: stretch;
          }
          .pf-work-index-mobile-link { margin-top: auto; }
        }
      `}</style>

      <div ref={stageRef} className="pf-work-index-stage relative w-full lg:h-[var(--pf-index-height)] lg:overflow-hidden">
        {items.map((item, index) => (
          <IndexScene
            key={item.id}
            item={item}
            index={index}
            total={items.length}
            presentation={presentation}
            board={board}
            isFirst={index === 0}
          />
        ))}
      </div>

      <MagneticCursor stageRef={stageRef} accent={accent} />
    </div>
  );
}
