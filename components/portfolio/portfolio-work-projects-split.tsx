'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from 'react';
import type { MarketplaceContentItem } from '@/types/marketplace';
import type {
  PortfolioWorkPresentationSettings,
  PortfolioWorkProjectsSplitSettings,
  PortfolioWorkProjectsSplitRadius,
  PortfolioWorkProjectsSplitThumbnailSize,
} from '@/components/portfolio/portfolio-work-settings';
import {
  DEFAULT_PROJECTS_SPLIT_SETTINGS,
  DEFAULT_WORK_PRESENTATION,
  mergeProjectsSplitSettings,
} from '@/components/portfolio/portfolio-work-settings';

const SPLIT_ENTRANCE_MS = 920;
const SPLIT_ENTRANCE_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
const SPLIT_IMAGE_PARALLAX = 0.75;
const SPLIT_TEXT_PARALLAX = 1.2;
const SPLIT_PARALLAX_TRAVEL = 64;
const SPLIT_DESKTOP_MQ = '(min-width: 768px)';

const SPLIT_HEADER_HIDDEN: CSSProperties = {
  opacity: 0,
  transform: 'translate3d(0, 22px, 0)',
};

function splitThumbRadiusClass(radius: PortfolioWorkProjectsSplitRadius): string {
  if (radius === 'none') return 'rounded-none';
  if (radius === 'md') return 'rounded-2xl';
  return 'rounded-[1.75rem] sm:rounded-[2rem]';
}

function splitThumbSizeClass(
  size: PortfolioWorkProjectsSplitThumbnailSize,
  centered: boolean
): string {
  const base =
    'relative aspect-[4/5] shrink-0 overflow-hidden sm:aspect-[5/4] lg:aspect-[5/4]';
  if (centered) {
    switch (size) {
      case 'lg':
        return `${base} w-[min(100%,22rem)] sm:w-[26rem] lg:w-[30rem]`;
      case 'half':
        return `${base} w-[min(100%,36rem)] sm:w-[min(50vw,34rem)] lg:w-[min(48vw,38rem)]`;
      default:
        return `${base} w-[min(100%,28rem)] sm:w-[34rem] lg:w-[40rem] xl:w-[44rem]`;
    }
  }
  switch (size) {
    case 'lg':
      return `${base} w-full sm:w-[min(40%,20rem)] md:w-[min(38%,24rem)] lg:w-[min(36%,28rem)] xl:w-[min(34%,30rem)]`;
    case 'half':
      return `${base} w-full sm:w-1/2`;
    default:
      return `${base} w-full sm:w-[min(62%,30rem)] md:w-[min(60%,36rem)] lg:w-[min(58%,42rem)] xl:w-[min(56%,48rem)]`;
  }
}

function splitCopyMaxClass(
  size: PortfolioWorkProjectsSplitThumbnailSize,
  centered: boolean
): string {
  if (centered) return 'w-full max-w-md';
  if (size === 'half') return 'min-w-0 flex-1';
  if (size === 'lg') {
    return 'min-w-0 flex-1 sm:max-w-[min(100%,28rem)] lg:max-w-[32rem]';
  }
  return 'min-w-0 flex-1 sm:max-w-[min(100%,22rem)] lg:max-w-[26rem]';
}

function splitRowGapClass(gap: PortfolioWorkProjectsSplitSettings['rowGap']): string {
  if (gap === 'tight') return 'gap-y-12 sm:gap-y-16';
  if (gap === 'xl') return 'gap-y-36 sm:gap-y-48 lg:gap-y-60 xl:gap-y-72';
  return 'gap-y-24 sm:gap-y-36 lg:gap-y-44 xl:gap-y-52';
}

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function getScrollParent(node: HTMLElement | null): HTMLElement | Window {
  if (!node) return window;
  let parent: HTMLElement | null = node.parentElement;
  while (parent) {
    const { overflowY } = window.getComputedStyle(parent);
    if (
      (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') &&
      parent.scrollHeight > parent.clientHeight + 1
    ) {
      return parent;
    }
    parent = parent.parentElement;
  }
  return window;
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

function formatSplitIndex(index: number): string {
  return String(index + 1).padStart(2, '0');
}

function revealElement(el: HTMLElement, delayMs: number): void {
  el.style.transition = `opacity 0.85s ${SPLIT_ENTRANCE_EASE} ${delayMs}ms, transform 0.95s ${SPLIT_ENTRANCE_EASE} ${delayMs}ms`;
  el.style.opacity = '1';
  el.style.transform = 'translate3d(0, 0, 0)';
}

function showElementNow(el: HTMLElement): void {
  el.style.transition = 'none';
  el.style.opacity = '1';
  el.style.transform = 'none';
}

function SplitTextLink({
  href,
  className,
  style,
  children,
}: {
  href: string;
  className: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const external = /^https?:\/\//i.test(href);
  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        style={style}
        data-pf-no-color-transition=""
      >
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className} style={style} data-pf-no-color-transition="">
      {children}
    </Link>
  );
}

function useSplitGalleryMotion(itemsKey: string): {
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
    const desktopMq = window.matchMedia(SPLIT_DESKTOP_MQ);
    const rows = Array.from(root.querySelectorAll<HTMLElement>('[data-split-row]'));

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
        const media = row.querySelector<HTMLElement>('[data-split-media-shift]');
        const copies = row.querySelectorAll<HTMLElement>('[data-split-copy]');
        if (media) media.style.transform = '';
        copies.forEach((copy) => {
          copy.style.transform = '';
          copy.style.opacity = '';
        });
      }
    };

    const scrollParent = getScrollParent(root);
    const ioRoot = scrollParent instanceof HTMLElement ? scrollParent : null;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const id = (entry.target as HTMLElement).dataset.splitId;
          if (id) reveal(id);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.12, root: ioRoot, rootMargin: '0px 0px -8% 0px' }
    );

    for (const row of rows) {
      const id = row.dataset.splitId;
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
        const id = row.dataset.splitId;
        if (!id || !revealedRef.current.has(id)) continue;
        const media = row.querySelector<HTMLElement>('[data-split-media-shift]');
        const copies = row.querySelectorAll<HTMLElement>('[data-split-copy]');
        if (!media && copies.length === 0) continue;

        const rect = row.getBoundingClientRect();
        const centered = (rect.top + rect.height * 0.5 - vh * 0.5) / vh;
        const clamped = Math.max(-1.15, Math.min(1.15, centered));

        if (media) {
          media.style.transform = `translate3d(0, ${(clamped * SPLIT_PARALLAX_TRAVEL * SPLIT_IMAGE_PARALLAX).toFixed(2)}px, 0)`;
        }
        const fade = Math.max(0.48, 1 - Math.max(0, Math.abs(clamped) - 0.22) * 0.85);
        const textY = (clamped * SPLIT_PARALLAX_TRAVEL * SPLIT_TEXT_PARALLAX).toFixed(2);
        copies.forEach((copy) => {
          copy.style.transform = `translate3d(0, ${textY}px, 0)`;
          copy.style.opacity = fade.toFixed(3);
        });
      }
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      raf = window.requestAnimationFrame(updateParallax);
    };

    const scrollTarget: EventTarget = scrollParent;
    scrollTarget.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    desktopMq.addEventListener('change', onScroll);
    motionMq.addEventListener('change', onScroll);
    onScroll();

    const failSafe = window.setTimeout(() => {
      for (const row of rows) {
        const id = row.dataset.splitId;
        if (id) reveal(id);
      }
    }, 1800);

    return () => {
      observer.disconnect();
      window.clearTimeout(failSafe);
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
 * Split header — short hairline, italic last word, FOUC-safe entrance.
 */
export function ProjectsSplitSectionHeader({
  title,
  subtitle,
  titleColor,
  subtitleColor,
  trailing,
  className = '',
}: {
  title: string;
  subtitle?: string;
  titleColor: string;
  subtitleColor: string;
  trailing?: ReactNode;
  className?: string;
}) {
  const headerRef = useRef<HTMLElement>(null);
  const heading = title.trim();
  const sub = subtitle?.trim() || '';
  const isEmpty = !heading && !sub && !trailing;

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

    const scrollParent = getScrollParent(header);
    const ioRoot = scrollParent instanceof HTMLElement ? scrollParent : null;
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
      className={`pf-work-split-header mb-12 w-full sm:mb-16 lg:mb-20 ${className}`.trim()}
      data-pf-no-color-transition=""
      style={SPLIT_HEADER_HIDDEN}
    >
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .pf-work-split-header {
            opacity: 1 !important;
            transform: none !important;
            transition: none !important;
          }
        }
      `}</style>
      <div className="flex items-end justify-between gap-6 sm:gap-10">
        <div className="min-w-0 max-w-3xl">
          <div className="mb-5 flex items-center gap-3 sm:mb-6">
            <span
              className="h-px w-8 shrink-0 sm:w-10"
              style={{ backgroundColor: titleColor, opacity: 0.45 }}
              aria-hidden
            />
          </div>
          {heading ? (
            <h2
              className="max-w-[20ch] text-3xl font-semibold tracking-[-0.038em] sm:text-4xl lg:text-[3.05rem] lg:leading-[1.08]"
              style={{ color: titleColor }}
            >
              <EditorialTitleText text={heading} />
            </h2>
          ) : null}
          {sub ? (
            <p
              className={`max-w-xl text-base leading-[1.8] sm:text-lg sm:leading-[1.85] ${heading ? 'mt-4 sm:mt-5' : ''}`}
              style={{ color: subtitleColor }}
            >
              {sub}
            </p>
          ) : null}
        </div>
        {trailing ? <div className="shrink-0 pb-1">{trailing}</div> : null}
      </div>
    </header>
  );
}

function SplitProjectTitle({
  title,
  href,
  color,
}: {
  title: string;
  href: string | null;
  color: string;
}) {
  const headingClass =
    'text-[1.75rem] font-semibold leading-[1.12] tracking-[-0.038em] sm:text-[2rem] lg:text-[2.35rem] xl:text-[2.55rem]';
  const label = <EditorialTitleText text={title} />;

  if (!href) {
    return (
      <h3 className={headingClass} style={{ color }}>
        {label}
      </h3>
    );
  }

  return (
    <h3 className={headingClass} style={{ color }}>
      <SplitTextLink
        href={href}
        className="group/split-title inline max-w-full no-underline transition-opacity duration-500 ease-out hover:opacity-70 focus:outline-none focus-visible:opacity-70"
        style={{ color: 'inherit' }}
      >
        {label}
        <span
          aria-hidden
          className="ml-2 inline-block translate-x-0 opacity-40 transition-transform duration-500 ease-out group-hover/split-title:translate-x-1.5 group-hover/split-title:opacity-80"
        >
          →
        </span>
      </SplitTextLink>
    </h3>
  );
}

function SplitRow({
  item,
  index,
  presentation,
  settings,
  revealed,
}: {
  item: MarketplaceContentItem;
  index: number;
  presentation: PortfolioWorkPresentationSettings;
  settings: PortfolioWorkProjectsSplitSettings;
  revealed: boolean;
}) {
  const titleColor = presentation.elementStyles?.cardTitle?.color || presentation.titleColor;
  const muted = presentation.elementStyles?.cardDescription?.color || presentation.subtitleColor;
  const borderColor = presentation.cardBorderColor || muted;
  const mediaUrl = item.mediaUrl?.trim() || null;
  const description = item.description?.trim() || '';
  const href = item.linkUrl?.trim() || null;
  const showDescription = settings.showDescription !== false;
  const radiusClass = splitThumbRadiusClass(settings.thumbnailRadius ?? 'none');
  const thumbSize = settings.thumbnailSize ?? 'xl';

  const centered = settings.imageSide === 'center';
  const titleOnLeft = centered
    ? (settings.titleSide ?? 'left') !== 'right'
    : settings.imageSide === 'right';
  const titleAtBottom = centered && (settings.titleVerticalAlign ?? 'top') === 'bottom';
  const descriptionOpposite =
    centered && settings.descriptionPlacement === 'opposite' && showDescription && Boolean(description);
  const descriptionOnLeft = descriptionOpposite ? !titleOnLeft : titleOnLeft;
  const descriptionAtBottom = descriptionOpposite
    ? (settings.descriptionVerticalAlign ?? 'bottom') === 'bottom'
    : titleAtBottom;
  const baseRight = settings.imageSide === 'right';
  const imageOnRight =
    !centered &&
    (settings.alternateSides ? (index % 2 === 1 ? !baseRight : baseRight) : baseRight);
  const thumbClass = splitThumbSizeClass(thumbSize, centered);
  const copyMaxClass = splitCopyMaxClass(thumbSize, centered);
  const indexLabel = formatSplitIndex(index);
  const alignTitleRight = centered && !titleOnLeft;

  const motionStyle: CSSProperties = {
    opacity: revealed ? 1 : 0,
    transform: revealed ? 'translate3d(0, 0, 0)' : 'translate3d(0, 2.75rem, 0)',
    transition: `opacity ${SPLIT_ENTRANCE_MS}ms ${SPLIT_ENTRANCE_EASE}, transform ${SPLIT_ENTRANCE_MS}ms ${SPLIT_ENTRANCE_EASE}`,
    transitionDelay: revealed ? `${Math.min(index, 3) * 95}ms` : '0ms',
  };

  const titleOnly = (
    <div className="min-w-0">
      <div
        className={`flex items-baseline gap-x-3 sm:gap-x-4 ${alignTitleRight ? 'justify-end' : ''}`}
      >
        <span
          className="shrink-0 font-mono text-[10px] font-medium tabular-nums tracking-[0.16em] sm:text-[11px]"
          style={{ color: muted, opacity: 0.48 }}
          aria-hidden
        >
          {indexLabel}
        </span>
        <div className="min-w-0">
          <SplitProjectTitle title={item.title} href={href} color={titleColor} />
        </div>
      </div>
      {!descriptionOpposite && showDescription && description ? (
        <>
          <span
            className={`mt-5 block h-px w-8 sm:mt-6 ${alignTitleRight ? 'ml-auto' : ''}`}
            style={{ backgroundColor: muted, opacity: 0.32 }}
            aria-hidden
          />
          <p
            className={`mt-5 max-w-xl text-[15px] leading-[1.8] sm:mt-6 sm:text-base sm:leading-[1.85] ${
              alignTitleRight ? 'ml-auto' : ''
            }`}
            style={{ color: muted }}
          >
            {description}
          </p>
        </>
      ) : null}
    </div>
  );

  const descriptionOnly =
    descriptionOpposite && description ? (
      <div className="min-w-0 w-full max-w-md">
        <p
          className="m-0 max-w-xl text-[15px] leading-[1.8] sm:text-base sm:leading-[1.85]"
          style={{ color: muted }}
        >
          {description}
        </p>
      </div>
    ) : null;

  const mediaBlock = (
    <div className={`${thumbClass} ${radiusClass}`} style={{ backgroundColor: `${borderColor}44` }}>
      {mediaUrl ? (
        <div
          data-split-media-shift=""
          className="absolute -top-[20%] left-0 h-[140%] w-full will-change-transform"
        >
          <Image
            src={mediaUrl}
            alt={item.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 70vw, 60vw"
            className="object-cover object-center transition-transform duration-[1.15s] ease-out group-hover/split:scale-[1.045]"
          />
        </div>
      ) : (
        <div
          className="flex h-full w-full items-center justify-center px-6 text-center text-sm leading-[1.8]"
          style={{ color: muted }}
        >
          Add a thumbnail in Information → Portfolio
        </div>
      )}
    </div>
  );

  if (centered) {
    const renderSide = (side: 'left' | 'right') => {
      const isLeft = side === 'left';
      const hasTitle = titleOnLeft === isLeft;
      const hasDesc = Boolean(descriptionOpposite && descriptionOnLeft === isLeft);
      const isRight = !isLeft;
      const sideClass = isRight ? 'justify-self-end' : 'justify-self-start';
      const titleAlignClass = isRight ? `${sideClass} text-right` : sideClass;

      if (!hasTitle && !hasDesc) {
        return <div className="min-w-0" aria-hidden />;
      }

      if (hasTitle && !hasDesc) {
        return (
          <div
            data-split-copy=""
            className={`min-w-0 ${copyMaxClass} will-change-transform ${titleAtBottom ? 'self-end' : 'self-start'} ${titleAlignClass}`}
          >
            {titleOnly}
          </div>
        );
      }

      if (!hasTitle && hasDesc) {
        return (
          <div
            data-split-copy=""
            className={`min-w-0 text-left will-change-transform ${descriptionAtBottom ? 'self-end' : 'self-start'} ${sideClass}`}
          >
            {descriptionOnly}
          </div>
        );
      }

      return (
        <div
          data-split-copy=""
          className={`flex min-w-0 flex-col ${copyMaxClass} will-change-transform ${titleAtBottom ? 'self-end' : 'self-start'} ${titleAlignClass}`}
        >
          {titleOnly}
        </div>
      );
    };

    return (
      <article
        data-split-row=""
        data-split-id={item.id}
        className="group/split w-full"
        style={motionStyle}
      >
        <div className="flex flex-col gap-6 sm:hidden">
          <div data-split-copy="" className="will-change-transform">
            {titleOnly}
          </div>
          <div className="flex w-full justify-center">{mediaBlock}</div>
          {descriptionOpposite ? (
            <div data-split-copy="" className="will-change-transform">
              {descriptionOnly}
            </div>
          ) : null}
        </div>
        <div className="hidden sm:grid sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-stretch sm:gap-x-10 lg:gap-x-14 xl:gap-x-16">
          {renderSide('left')}
          <div className="w-max max-w-full justify-self-center self-start">{mediaBlock}</div>
          {renderSide('right')}
        </div>
      </article>
    );
  }

  return (
    <article
      data-split-row=""
      data-split-id={item.id}
      className={`group/split flex flex-col gap-6 sm:items-start sm:gap-10 lg:gap-14 xl:gap-16 ${
        imageOnRight ? 'sm:flex-row-reverse' : 'sm:flex-row'
      } ${thumbSize === 'half' ? '' : 'sm:justify-between'}`}
      style={motionStyle}
    >
      {mediaBlock}
      <div data-split-copy="" className={`will-change-transform sm:pt-0 ${copyMaxClass}`}>
        {titleOnly}
      </div>
    </article>
  );
}

/** Large thumbnail + top-aligned title — Split design only. */
export function ProjectsSplitGallery({
  items,
  presentation = DEFAULT_WORK_PRESENTATION,
}: {
  items: MarketplaceContentItem[];
  presentation?: PortfolioWorkPresentationSettings;
}) {
  const itemsKey = items.map((item) => item.id).join('|');
  const { rootRef, revealed } = useSplitGalleryMotion(itemsKey);

  if (items.length === 0) return null;

  const settings = mergeProjectsSplitSettings(
    DEFAULT_PROJECTS_SPLIT_SETTINGS,
    presentation.projectsSplit
  );

  return (
    <div
      ref={rootRef}
      data-split-gallery=""
      className={`flex flex-col ${splitRowGapClass(settings.rowGap ?? 'md')}`}
    >
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          [data-split-gallery] [data-split-row] {
            opacity: 1 !important;
            transform: none !important;
            transition: none !important;
          }
        }
      `}</style>
      {items.map((item, index) => (
        <SplitRow
          key={item.id}
          item={item}
          index={index}
          presentation={presentation}
          settings={settings}
          revealed={revealed.has(item.id)}
        />
      ))}
    </div>
  );
}

export function isProjectsSplitDesign(
  presentation: Pick<PortfolioWorkPresentationSettings, 'sectionDesign'> | undefined
): boolean {
  return presentation?.sectionDesign === 'projects-split';
}
