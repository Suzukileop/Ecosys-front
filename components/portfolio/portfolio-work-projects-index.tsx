'use client';

import {
  useEffect,
  useLayoutEffect,
  useRef,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from 'react';
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

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const INDEX_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
const INDEX_HIDDEN: CSSProperties = {
  opacity: 0,
  transform: 'translate3d(0, 28px, 0)',
};

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

function EditorialTitleText({ text }: { text: string }) {
  const parts = splitEditorialTitle(text);
  if (!parts) return <>{text}</>;
  return (
    <>
      {parts.lead}{' '}
      <span className="font-medium italic tracking-[-0.03em]">{parts.italic}</span>
    </>
  );
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
              className={`pf-work-index-word-inner${isItalic ? ' font-medium italic' : ''}`}
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

function revealElement(el: HTMLElement, delayMs: number): void {
  el.style.transition = `opacity 0.85s ${INDEX_EASE} ${delayMs}ms, transform 0.95s ${INDEX_EASE} ${delayMs}ms`;
  el.style.opacity = '1';
  el.style.transform = 'translate3d(0, 0, 0)';
  el.dataset.revealed = 'true';
}

function showElementNow(el: HTMLElement): void {
  el.style.transition = 'none';
  el.style.opacity = '1';
  el.style.transform = 'none';
  el.dataset.revealed = 'true';
}

/**
 * Index header — editorial kicker, italic last word, trailing hairline.
 * Hidden in JSX (FOUC-safe), revealed via IntersectionObserver.
 * Kept for backward compatibility — the shared Header (Header → Design) mounts
 * above every project layout now, so this is no longer rendered by default.
 */
export function ProjectsIndexSectionHeader({
  title,
  subtitle,
  titleColor,
  subtitleColor,
  titleClassName = '',
  titleStyle,
  trailing,
  entryCount,
  accent,
  className = '',
}: {
  title: string;
  subtitle?: string;
  titleColor: string;
  subtitleColor: string;
  titleClassName?: string;
  titleStyle?: CSSProperties;
  trailing?: ReactNode;
  entryCount?: number;
  accent?: string;
  className?: string;
}) {
  const headerRef = useRef<HTMLElement>(null);
  const heading = title.trim();
  const sub = subtitle?.trim() || '';
  const isEmpty = !heading && !sub && !trailing;
  const resolvedTitleColor =
    (typeof titleStyle?.color === 'string' && titleStyle.color.trim()) || titleColor;
  const {
    fontSize: _fs,
    lineHeight: _lh,
    letterSpacing: _ls,
    fontStyle: incomingFontStyle,
    ...restTitleStyle
  } = titleStyle ?? {};
  const allowItalicWord = incomingFontStyle !== 'italic';
  const mark = accent || subtitleColor;
  const countLabel =
    typeof entryCount === 'number' && entryCount > 0
      ? String(entryCount).padStart(2, '0')
      : '';

  useEffect(() => {
    const header = headerRef.current;
    if (!header || isEmpty) return;

    if (prefersReducedMotion()) {
      showElementNow(header);
      return;
    }

    let revealed = false;
    const reveal = () => {
      if (revealed) return;
      revealed = true;
      revealElement(header, 0);
    };

    const ioRoot = aboutBannerScrollParent(header) ?? null;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            reveal();
            observer.disconnect();
          }
        });
      },
      { threshold: 0.12, root: ioRoot, rootMargin: '40px 0px' }
    );
    observer.observe(header);
    const failSafe = window.setTimeout(reveal, 1600);

    return () => {
      window.clearTimeout(failSafe);
      observer.disconnect();
    };
  }, [heading, sub, isEmpty]);

  if (isEmpty) return null;

  return (
    <header
      ref={headerRef}
      className={`pf-work-index-header mb-12 w-full sm:mb-16 lg:mb-20 ${className}`.trim()}
      data-pf-no-color-transition=""
      style={INDEX_HIDDEN}
    >
      <div className="flex items-end justify-between gap-6 sm:gap-10">
        <div className="min-w-0 max-w-3xl">
          <div className="mb-5 flex items-center gap-3 sm:mb-6">
            <span
              className="h-px w-7 shrink-0 sm:w-9"
              style={{ backgroundColor: mark, opacity: 0.7 }}
              aria-hidden
            />
            <p
              className="text-xs font-semibold uppercase tracking-[0.24em] sm:text-sm"
              style={{ color: subtitleColor }}
            >
              {countLabel || 'Index'}
            </p>
          </div>
          {heading ? (
            <h2
              className={
                titleClassName.trim() ||
                'font-semibold tracking-[-0.045em]'
              }
              style={{
                ...restTitleStyle,
                color: resolvedTitleColor,
                fontSize: 'clamp(2.35rem, 5.6vw, 4.25rem)',
                lineHeight: 1.06,
              }}
            >
              {allowItalicWord ? <EditorialTitleText text={heading} /> : heading}
            </h2>
          ) : null}
          {sub ? (
            <p
              className={`max-w-md text-[15px] leading-[1.6] sm:text-base ${heading ? 'mt-4' : ''}`}
              style={{ color: subtitleColor, opacity: 0.86 }}
            >
              {sub}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-3 pb-1">
          {trailing}
          <span
            className="hidden h-px w-16 sm:block lg:w-24"
            style={{ backgroundColor: mark, opacity: 0.35 }}
            aria-hidden
          />
        </div>
      </div>
    </header>
  );
}

function IndexStack({ tools, ink }: { tools: string[]; ink: string }) {
  if (tools.length === 0) return null;
  return (
    <ul
      className="pf-work-index-reveal flex flex-wrap items-center gap-x-0 gap-y-1.5"
      aria-label="Stack"
      style={{ transitionDelay: '0.18s' }}
    >
      {tools.map((tool, index) => (
        <li
          key={tool}
          className="flex items-center text-xs font-medium uppercase tracking-[0.14em] sm:text-sm"
          style={{ color: ink, opacity: 0.75 }}
        >
          {index > 0 ? (
            <span className="mx-2.5 opacity-40" aria-hidden>
              ·
            </span>
          ) : null}
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
  muted,
}: {
  index: number;
  total: number;
  marker: 'number' | 'bullet';
  accent: string;
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
  return (
    <p
      className="flex items-baseline gap-2 font-mono text-xs tracking-[0.18em] tabular-nums sm:text-sm"
      aria-hidden
    >
      <span style={{ color: accent }}>{formatIndexNumber(index)}</span>
      <span style={{ color: muted, opacity: 0.55 }}>/ {formatIndexNumber(total - 1)}</span>
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
  const titleColor = presentation.elementStyles?.cardTitle?.color || presentation.titleColor;
  const subtitleColor = presentation.elementStyles?.cardDescription?.color || presentation.subtitleColor;
  const accent = presentation.ctaColor || presentation.categoryActiveColor || titleColor;
  const surface = presentation.cardBackgroundColor || '#0a0a0a';
  const media = item.mediaUrl?.trim() || null;
  const heroInk = media ? '#ffffff' : titleColor;
  const heroMuted = media ? 'rgba(255,255,255,0.78)' : subtitleColor;

  const tools = workToolLabels(item);
  const description = item.description?.trim() || '';
  const showStack = board.showStack && tools.length > 0;
  const showDescription = board.showDescription && Boolean(description);
  const href = item.linkUrl?.trim() || null;
  const title = item.title?.trim() || 'Untitled';

  return (
    <article
      className="pf-work-index-scene relative flex min-h-[100dvh] w-full flex-col justify-end overflow-hidden lg:absolute lg:inset-0"
      data-scene=""
      data-scene-active={isFirst ? 'true' : 'false'}
      style={{ zIndex: index + 1, backgroundColor: surface }}
    >
      <div className="pf-work-index-scene-bg absolute inset-0 overflow-hidden" aria-hidden>
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
        <div className="pf-work-index-scene-dim absolute inset-0" data-scene-dim="" aria-hidden />
      </div>

      <div className="relative z-[1] flex w-full flex-col gap-7 px-6 pb-12 sm:px-10 sm:pb-16 lg:gap-9 lg:px-16 lg:pb-20 xl:px-24">
        {board.showNumber ? (
          <IndexNumberBadge
            index={index}
            total={total}
            marker={board.indexMarker ?? 'number'}
            accent={accent}
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

        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
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
      </div>
    </article>
  );
}

/**
 * Pins the stage and drives a scroll-scrubbed "curtain" wipe: each next project
 * slides up over the current one. Falls back to a plain stacked flow — revealed
 * per-scene via IntersectionObserver — on touch/narrow screens and reduced motion.
 */
function useIndexCurtainReveal(stageRef: RefObject<HTMLDivElement | null>, sceneCount: number) {
  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;
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

          gsap.set(scenes.slice(1), { yPercent: 100 });
          scenes.forEach((scene, i) =>
            scene.setAttribute('data-scene-active', i === 0 ? 'true' : 'false')
          );

          const viewportSpan = () => (scroller ? scroller.clientHeight : window.innerHeight) || 800;
          let lastActive = 0;

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: stage,
              start: 'top top',
              end: () => `+=${(scenes.length - 1) * viewportSpan()}`,
              scrub: 0.35,
              pin: true,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              onUpdate: (self) => {
                const active = Math.min(
                  scenes.length - 1,
                  Math.round(self.progress * (scenes.length - 1))
                );
                if (active === lastActive) return;
                lastActive = active;
                scenes.forEach((scene, i) =>
                  scene.setAttribute('data-scene-active', i === active ? 'true' : 'false')
                );
              },
              ...stBase,
            },
          });

          for (let i = 1; i < scenes.length; i += 1) {
            tl.to(scenes[i], { yPercent: 0, ease: 'none', duration: 1 }, i - 1);
            tl.to(scenes[i - 1], { scale: 0.94, ease: 'none', duration: 1 }, i - 1);
            const dim = dims[i - 1];
            if (dim) tl.to(dim, { opacity: 0.45, ease: 'none', duration: 1 }, i - 1);
          }

          return () => {
            gsap.set(scenes, { clearProps: 'all' });
            gsap.set(dims.filter(Boolean) as HTMLElement[], { clearProps: 'all' });
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
  }, [stageRef, sceneCount]);
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
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    const cursor = cursorRef.current;
    if (!stage || !cursor) return undefined;
    if (prefersReducedMotion()) return undefined;
    if (!window.matchMedia('(pointer: fine)').matches) return undefined;

    const moveX = gsap.quickTo(cursor, 'x', { duration: 0.3, ease: 'power3.out' });
    const moveY = gsap.quickTo(cursor, 'y', { duration: 0.3, ease: 'power3.out' });

    const onMove = (event: PointerEvent) => {
      moveX(event.clientX);
      moveY(event.clientY);
    };
    const onEnter = () => cursor.setAttribute('data-cursor-state', 'view');
    const onLeave = () => cursor.setAttribute('data-cursor-state', 'idle');

    stage.addEventListener('pointermove', onMove);
    stage.setAttribute('data-cursor-ready', 'true');
    const targets = Array.from(stage.querySelectorAll<HTMLElement>('[data-cursor-target]'));
    targets.forEach((el) => {
      el.addEventListener('pointerenter', onEnter);
      el.addEventListener('pointerleave', onLeave);
    });
    cursor.setAttribute('data-cursor-active', 'true');

    return () => {
      stage.removeEventListener('pointermove', onMove);
      stage.removeAttribute('data-cursor-ready');
      targets.forEach((el) => {
        el.removeEventListener('pointerenter', onEnter);
        el.removeEventListener('pointerleave', onLeave);
      });
    };
  }, [stageRef]);

  return (
    <div
      ref={cursorRef}
      className="pf-work-index-cursor"
      data-cursor-state="idle"
      aria-hidden
      style={{ ['--pf-cursor-accent' as string]: accent }}
    >
      <span className="pf-work-index-cursor-label">View project</span>
    </div>
  );
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

  useIndexCurtainReveal(stageRef, items.length);
  useIndexParallax(stageRef);

  if (items.length === 0) return null;

  return (
    <div className="pf-work-index relative w-full" data-pf-no-color-transition="">
      <style>{`
        .pf-work-index-scene-scrim {
          background: linear-gradient(
            180deg,
            rgba(0, 0, 0, 0.08) 0%,
            rgba(0, 0, 0, 0.18) 42%,
            rgba(0, 0, 0, 0.8) 100%
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
          opacity: 0;
          background: radial-gradient(
            460px circle at calc(50% + var(--mx, 0) * 60%) calc(50% + var(--my, 0) * 60%),
            var(--pf-work-index-accent, #fff) 0%,
            transparent 70%
          );
          transition: opacity 0.6s ease;
        }
        .pf-work-index-scene[data-scene-active='true'] .pf-work-index-scene-spot {
          opacity: 0.55;
        }
        .pf-work-index-scene-dim {
          pointer-events: none;
          background: #000;
          opacity: 0;
        }
        .pf-work-index-word-mask {
          display: inline-block;
          overflow: hidden;
          vertical-align: bottom;
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
      `}</style>

      <div ref={stageRef} className="pf-work-index-stage relative w-full lg:h-[100dvh] lg:overflow-hidden">
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

export function isProjectsIndexDesign(
  presentation: Pick<PortfolioWorkPresentationSettings, 'sectionDesign'> | undefined
): boolean {
  return presentation?.sectionDesign === 'projects-index';
}
