'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from 'react';
import type { MarketplaceContentItem } from '@/types/marketplace';
import type {
  PortfolioWorkPresentationSettings,
  PortfolioWorkProjectsFramesCardGap,
  PortfolioWorkProjectsFramesRadius,
  PortfolioWorkProjectsFramesSettings,
  PortfolioWorkProjectsFramesThumbnailSize,
} from '@/components/portfolio/portfolio-work-settings';
import {
  DEFAULT_PROJECTS_FRAMES_SETTINGS,
  DEFAULT_WORK_PRESENTATION,
  mergeProjectsFramesSettings,
} from '@/components/portfolio/portfolio-work-settings';

const FRAMES_ENTRANCE_MS = 920;
const FRAMES_ENTRANCE_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
const FRAMES_IMAGE_PARALLAX = 0.75;
const FRAMES_TEXT_PARALLAX = 1.2;
const FRAMES_PARALLAX_TRAVEL = 64;
const FRAMES_DESKTOP_MQ = '(min-width: 768px)';

function workToolLabels(item: MarketplaceContentItem, max = 10): string[] {
  return Array.from(new Set((item.toolsUsed ?? []).map((t) => t.trim()).filter(Boolean))).slice(
    0,
    max
  );
}

function workRoleLabel(item: MarketplaceContentItem): string {
  const role = item.role?.trim();
  if (role) return role;
  if (!item.category?.trim() && item.genre?.trim()) return item.genre.trim();
  return '';
}

function workCategoryLabel(item: MarketplaceContentItem): string {
  const category = item.category?.trim();
  if (category) return category;
  const genre = item.genre?.trim();
  const role = item.role?.trim();
  if (genre && genre !== role) return genre;
  return '';
}

function framesThumbSizeClass(size: PortfolioWorkProjectsFramesThumbnailSize): string {
  const base = 'relative aspect-[16/10] w-full shrink-0 overflow-hidden md:aspect-auto md:self-start';
  switch (size) {
    case 'md':
      return `${base} md:w-[min(48%,26rem)] md:min-h-[16rem] lg:w-[min(46%,28rem)] lg:min-h-[17rem] xl:min-h-[18rem]`;
    case 'lg':
      return `${base} md:w-[min(58%,34rem)] md:min-h-[20rem] lg:w-[min(56%,38rem)] lg:min-h-[22rem] xl:min-h-[23rem]`;
    case 'xl':
      return `${base} md:w-[min(74%,48rem)] md:min-h-[26rem] lg:w-[min(72%,52rem)] lg:min-h-[28rem] xl:w-[min(70%,56rem)] xl:min-h-[30rem]`;
    case 'half':
      return `${base} md:w-1/2 md:min-h-[26rem] lg:min-h-[30rem] xl:min-h-[34rem]`;
    case 'xxl':
    default:
      return `${base} md:w-[min(86%,60rem)] md:min-h-[30rem] lg:w-[min(84%,68rem)] lg:min-h-[34rem] xl:w-[min(82%,74rem)] xl:min-h-[38rem]`;
  }
}

function framesCopyMaxClass(size: PortfolioWorkProjectsFramesThumbnailSize): string {
  if (size === 'half' || size === 'xxl') return '';
  if (size === 'xl') return 'md:max-w-[min(100%,26rem)] lg:max-w-[28rem]';
  if (size === 'lg') return 'md:max-w-[min(100%,24rem)] lg:max-w-[26rem]';
  return 'md:max-w-[min(100%,22rem)] lg:max-w-[24rem]';
}

function framesCardRadiusClass(radius: PortfolioWorkProjectsFramesRadius): string {
  if (radius === 'none') return 'rounded-none';
  if (radius === 'md') return 'rounded-2xl';
  return 'rounded-[1.75rem] sm:rounded-[2rem]';
}

/** Thumbnail corners follow the card; flush images only round the outer edge. */
function framesThumbRadiusClass(
  radius: PortfolioWorkProjectsFramesRadius,
  flush: boolean,
  imageOnRight: boolean
): string {
  if (radius === 'none') return 'rounded-none';

  if (!flush) {
    if (radius === 'md') return 'rounded-xl';
    return 'rounded-[1.15rem] sm:rounded-[1.35rem]';
  }

  // Flush to card edge — round only the outer corners that meet the card shell.
  if (radius === 'md') {
    return imageOnRight
      ? 'rounded-t-2xl md:rounded-t-none md:rounded-r-2xl'
      : 'rounded-t-2xl md:rounded-t-none md:rounded-l-2xl';
  }
  return imageOnRight
    ? 'rounded-t-[1.75rem] md:rounded-t-none md:rounded-r-[2rem]'
    : 'rounded-t-[1.75rem] md:rounded-t-none md:rounded-l-[2rem]';
}

function framesCardGapClass(gap: PortfolioWorkProjectsFramesCardGap): string {
  if (gap === 'md') return 'gap-20 sm:gap-28 lg:gap-36';
  if (gap === 'xl') return 'gap-28 sm:gap-40 lg:gap-52 xl:gap-60';
  return 'gap-12 sm:gap-16 lg:gap-20 xl:gap-24';
}

function getScrollParent(node: HTMLElement | null): HTMLElement | Window {
  if (!node) return window;
  let parent: HTMLElement | null = node.parentElement;
  while (parent) {
    const { overflowY } = window.getComputedStyle(parent);
    if (overflowY === 'auto' || overflowY === 'scroll') {
      return parent;
    }
    parent = parent.parentElement;
  }
  return window;
}

function useFramesGalleryMotion(itemsKey: string): {
  rootRef: RefObject<HTMLDivElement | null>;
  revealed: ReadonlySet<string>;
} {
  const rootRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState<ReadonlySet<string>>(() => new Set());
  const revealedRef = useRef<Set<string>>(new Set());

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const motionMq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const desktopMq = window.matchMedia(FRAMES_DESKTOP_MQ);
    const rows = Array.from(root.querySelectorAll<HTMLElement>('[data-frames-row]'));

    const reveal = (id: string) => {
      if (revealedRef.current.has(id)) return;
      revealedRef.current.add(id);
      setRevealed((prev) => {
        if (prev.has(id)) return prev;
        const next = new Set(prev);
        next.add(id);
        return next;
      });
    };

    const resetParallax = () => {
      for (const row of rows) {
        const media = row.querySelector<HTMLElement>('[data-frames-media-shift]');
        const copy = row.querySelector<HTMLElement>('[data-frames-copy]');
        if (media) media.style.transform = '';
        if (copy) {
          copy.style.transform = '';
          copy.style.opacity = '';
        }
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const id = (entry.target as HTMLElement).dataset.framesId;
          if (id) reveal(id);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );

    for (const row of rows) {
      const id = row.dataset.framesId;
      if (!id || revealedRef.current.has(id)) continue;
      observer.observe(row);
    }

    let raf = 0;
    let ticking = false;

    const updateParallax = () => {
      ticking = false;
      if (motionMq.matches || !desktopMq.matches) {
        resetParallax();
        return;
      }

      const vh = window.innerHeight || 1;
      for (const row of rows) {
        const id = row.dataset.framesId;
        if (!id || !revealedRef.current.has(id)) continue;
        const media = row.querySelector<HTMLElement>('[data-frames-media-shift]');
        const copy = row.querySelector<HTMLElement>('[data-frames-copy]');
        if (!media && !copy) continue;

        const rect = row.getBoundingClientRect();
        const centered = (rect.top + rect.height * 0.5 - vh * 0.5) / vh;
        const clamped = Math.max(-1.15, Math.min(1.15, centered));

        if (media) {
          media.style.transform = `translate3d(0, ${(clamped * FRAMES_PARALLAX_TRAVEL * FRAMES_IMAGE_PARALLAX).toFixed(2)}px, 0)`;
        }
        if (copy) {
          copy.style.transform = `translate3d(0, ${(clamped * FRAMES_PARALLAX_TRAVEL * FRAMES_TEXT_PARALLAX).toFixed(2)}px, 0)`;
          const fade = Math.max(0.48, 1 - Math.max(0, Math.abs(clamped) - 0.22) * 0.85);
          copy.style.opacity = fade.toFixed(3);
        }
      }
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      raf = window.requestAnimationFrame(updateParallax);
    };

    const scrollParent = getScrollParent(root);
    const scrollTarget: EventTarget = scrollParent;
    scrollTarget.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    desktopMq.addEventListener('change', onScroll);
    motionMq.addEventListener('change', onScroll);
    onScroll();

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(raf);
      scrollTarget.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      desktopMq.removeEventListener('change', onScroll);
      motionMq.removeEventListener('change', onScroll);
      resetParallax();
    };
  }, [itemsKey]);

  return { rootRef, revealed };
}

/**
 * Frames design header — compact title + optional subtitle.
 */
export function ProjectsFramesSectionHeader({
  title,
  subtitle,
  titleColor,
  subtitleColor,
  className = '',
}: {
  title: string;
  subtitle?: string;
  titleColor: string;
  subtitleColor: string;
  className?: string;
}) {
  const heading = title.trim();
  const sub = subtitle?.trim() || '';
  if (!heading && !sub) return null;

  return (
    <header className={`mb-12 w-full sm:mb-16 lg:mb-20 ${className}`.trim()}>
      {heading ? (
        <h2
          className="max-w-3xl text-3xl font-semibold tracking-[-0.038em] sm:text-4xl lg:text-[3.05rem] lg:leading-[1.08]"
          style={{ color: titleColor }}
        >
          {heading}
        </h2>
      ) : null}
      {sub ? (
        <p
          className={`max-w-2xl text-base leading-[1.8] sm:text-lg sm:leading-[1.85] ${heading ? 'mt-4 sm:mt-5' : ''}`}
          style={{ color: subtitleColor }}
        >
          {sub}
        </p>
      ) : null}
    </header>
  );
}

/** Stack as a quiet vertical list — plain text, no chips or hairline tags. */
function FramesStackList({ tools, ink }: { tools: string[]; ink: string }) {
  if (tools.length === 0) return null;
  return (
    <ul className="m-0 flex list-none flex-col gap-1.5 p-0" aria-label="Stack">
      {tools.map((tool) => (
        <li
          key={tool}
          className="text-[13px] font-normal leading-[1.75] tracking-[-0.01em] sm:text-sm sm:leading-[1.8]"
          style={{ color: ink }}
        >
          {tool}
        </li>
      ))}
    </ul>
  );
}

function FramesConsultLink({
  href,
  label,
  accent,
}: {
  href: string;
  label: string;
  accent: string;
}) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-pf-no-color-transition=""
      className="group/cta relative inline-flex w-fit items-center gap-3 text-[13px] font-medium tracking-[0.03em] transition-opacity duration-500 ease-out hover:opacity-70 focus:outline-none focus-visible:opacity-70"
      style={{ color: accent }}
    >
      <span className="relative pb-0.5">
        {label}
        <span
          aria-hidden
          data-pf-no-color-transition=""
          className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-100 opacity-35 transition-[opacity,transform] duration-500 ease-out group-hover/cta:scale-x-110 group-hover/cta:opacity-100"
          style={{ backgroundColor: accent }}
        />
      </span>
      <span
        aria-hidden
        data-pf-no-color-transition=""
        className="inline-block transition-transform duration-500 ease-out group-hover/cta:translate-x-1.5"
      >
        →
      </span>
    </Link>
  );
}

function FramesCard({
  item,
  index,
  presentation,
  board,
  imageOnRight,
  revealed,
}: {
  item: MarketplaceContentItem;
  index: number;
  presentation: PortfolioWorkPresentationSettings;
  board: PortfolioWorkProjectsFramesSettings;
  imageOnRight: boolean;
  revealed: boolean;
}) {
  const role = workRoleLabel(item);
  const category = workCategoryLabel(item);
  const description = item.description?.trim() || '';
  const tools = workToolLabels(item);
  const href = item.linkUrl?.trim() || null;
  const mediaUrl = item.mediaUrl?.trim() || null;

  const accent = presentation.ctaColor || presentation.categoryActiveColor;
  const titleColor = presentation.elementStyles?.cardTitle?.color || presentation.titleColor;
  const muted = presentation.elementStyles?.cardDescription?.color || presentation.subtitleColor;
  const cardBg = presentation.cardBackgroundEnabled
    ? presentation.cardBackgroundColor
    : 'transparent';
  const border =
    presentation.cardBorder === 'none' ? 'transparent' : presentation.cardBorderColor;
  const ruleColor = border === 'transparent' ? muted : border;

  const showRole = board.showRole && Boolean(role);
  const showCategory = board.showCategory && Boolean(category);
  const showMeta = showRole || showCategory;
  const showDescription = board.showDescription && Boolean(description);
  const showStack = board.showStack && tools.length > 0;
  const showConsult = board.showConsult && Boolean(href);
  const consultLabel = board.consultLabel.trim() || 'Consult';
  const flushImage = board.imagePadding === false;
  const radius = board.radius;
  const halfSplit = board.thumbnailSize === 'half';
  const showForceLine = presentation.cardBorder === 'none' && !flushImage;
  const flushTopPad = radius === 'none' ? 'md:pt-0' : radius === 'md' ? 'md:pt-4' : 'md:pt-5';

  const motionStyle: CSSProperties = {
    opacity: revealed ? 1 : 0,
    transform: revealed ? 'translate3d(0, 0, 0)' : 'translate3d(0, 2.75rem, 0)',
    transition: `opacity ${FRAMES_ENTRANCE_MS}ms ${FRAMES_ENTRANCE_EASE}, transform ${FRAMES_ENTRANCE_MS}ms ${FRAMES_ENTRANCE_EASE}`,
    transitionDelay: revealed ? `${Math.min(index, 3) * 95}ms` : '0ms',
  };

  const media = (
    <div
      className={`${framesThumbSizeClass(board.thumbnailSize)} ${framesThumbRadiusClass(
        radius,
        flushImage,
        imageOnRight
      )} ${halfSplit ? 'md:basis-1/2 md:grow-0' : ''}`}
      style={{ backgroundColor: border === 'transparent' ? `${muted}22` : `${border}66` }}
    >
      {mediaUrl ? (
        <div
          data-frames-media-shift=""
          className="absolute -top-[20%] left-0 h-[140%] w-full will-change-transform"
        >
          <Image
            src={mediaUrl}
            alt={item.title}
            fill
            sizes="(max-width: 768px) 100vw, 70vw"
            className="object-cover object-center transition-transform duration-[1.15s] ease-out group-hover/frame:scale-[1.045]"
          />
        </div>
      ) : (
        <div
          className="flex h-full min-h-[11rem] w-full items-center justify-center px-6 text-center text-sm leading-[1.8]"
          style={{ color: muted }}
        >
          Add a thumbnail in Information → Portfolio
        </div>
      )}
    </div>
  );

  const info = (
    <div
      data-frames-copy=""
      className={`flex min-w-0 flex-col will-change-transform ${
        halfSplit ? 'md:w-1/2 md:basis-1/2 md:grow-0 md:shrink-0' : `flex-1 ${framesCopyMaxClass(board.thumbnailSize)}`
      } ${
        flushImage
          ? imageOnRight
            ? `px-5 pb-8 pt-6 sm:px-6 ${flushTopPad} md:pb-8 md:pl-6 md:pr-10 lg:pr-14`
            : `px-5 pb-8 pt-6 sm:px-6 ${flushTopPad} md:pb-8 md:pr-6 md:pl-10 lg:pl-14`
          : imageOnRight
            ? 'px-0.5 pb-1 pt-0 md:pl-1 md:pr-3 lg:pr-6'
            : 'px-0.5 pb-1 pt-0 md:pr-1 md:pl-3 lg:pl-6'
      }`}
    >
      {showMeta ? (
        <p className="mb-4 flex flex-wrap items-baseline gap-x-2.5 gap-y-1 text-[10px] font-medium uppercase tracking-[0.2em] sm:mb-5 sm:text-[11px]">
          {showRole ? <span style={{ color: accent }}>{role}</span> : null}
          {showRole && showCategory ? (
            <span style={{ color: muted, opacity: 0.4 }} aria-hidden>
              ·
            </span>
          ) : null}
          {showCategory ? <span style={{ color: muted }}>{category}</span> : null}
        </p>
      ) : null}

      <h3
        className="text-[1.65rem] font-semibold leading-[1.12] tracking-[-0.038em] sm:text-[1.9rem] lg:text-[2.15rem] xl:text-[2.35rem]"
        style={{ color: titleColor }}
      >
        {item.title}
      </h3>

      {showDescription ? (
        <p
          className="mt-5 max-w-xl text-[15px] leading-[1.8] sm:mt-6 sm:text-base sm:leading-[1.85]"
          style={{ color: muted }}
        >
          {description}
        </p>
      ) : null}

      {showStack || showConsult ? (
        <div className="mt-8 flex flex-col items-start gap-8 sm:mt-10 sm:gap-9">
          {showStack ? <FramesStackList tools={tools} ink={muted} /> : null}
          {showConsult && href ? (
            <FramesConsultLink href={href} label={consultLabel} accent={accent || titleColor} />
          ) : null}
        </div>
      ) : null}
    </div>
  );

  return (
    <article
      data-frames-row=""
      data-frames-id={item.id}
      className={`group/frame relative ${
        presentation.cardBorder === 'none' ? 'border-0' : 'border'
      } ${framesCardRadiusClass(radius)}`}
      style={{
        backgroundColor: cardBg,
        borderColor: border,
        ...motionStyle,
      }}
    >
      <div className={`flex flex-col ${flushImage ? 'p-0' : 'p-4 sm:p-5 md:p-6 lg:p-8'}`}>
        {showForceLine ? (
          <div
            className="mb-6 h-px w-full shrink-0 sm:mb-7 md:mb-8"
            style={{ backgroundColor: ruleColor, opacity: 0.32 }}
            aria-hidden
          />
        ) : null}
        <div
          className={`flex flex-col md:items-start ${
            flushImage ? 'gap-8 md:gap-12 lg:gap-16' : 'gap-8 sm:gap-10 md:gap-14 lg:gap-16'
          } ${imageOnRight ? 'md:flex-row-reverse' : 'md:flex-row'} ${
            halfSplit ? '' : 'md:justify-between'
          }`}
        >
          {media}
          {info}
        </div>
      </div>
    </article>
  );
}

/** Horizontal image + info frames — Projects frames design only. */
export function ProjectsFramesGallery({
  items,
  presentation = DEFAULT_WORK_PRESENTATION,
}: {
  items: MarketplaceContentItem[];
  presentation?: PortfolioWorkPresentationSettings;
}) {
  const itemsKey = items.map((item) => item.id).join('|');
  const { rootRef, revealed } = useFramesGalleryMotion(itemsKey);

  const board = mergeProjectsFramesSettings(
    DEFAULT_PROJECTS_FRAMES_SETTINGS,
    presentation.projectsFrames
  );

  if (items.length === 0) return null;

  return (
    <div
      ref={rootRef}
      data-frames-gallery=""
      className={`flex w-full flex-col ${framesCardGapClass(board.cardGap)}`}
    >
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          [data-frames-gallery] [data-frames-row] {
            opacity: 1 !important;
            transform: none !important;
            transition: none !important;
          }
        }
      `}</style>
      {items.map((item, index) => {
        const baseRight = board.imageSide === 'right';
        const imageOnRight = board.alternateSides
          ? index % 2 === 1
            ? !baseRight
            : baseRight
          : baseRight;
        return (
          <FramesCard
            key={item.id}
            item={item}
            index={index}
            presentation={presentation}
            board={board}
            imageOnRight={imageOnRight}
            revealed={revealed.has(item.id)}
          />
        );
      })}
    </div>
  );
}

export function isProjectsFramesDesign(
  presentation: Pick<PortfolioWorkPresentationSettings, 'sectionDesign'> | undefined
): boolean {
  return presentation?.sectionDesign === 'projects-frames';
}
