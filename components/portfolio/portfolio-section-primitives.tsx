'use client';

import Link from 'next/link';
import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from 'react';
import { portfolioSectionTitleClassWithoutUppercase, portfolioSectionTitleSentenceCase } from '@/components/portfolio/portfolio-section-title';
import { scrollToPortfolioSection } from '@/components/portfolio/portfolio-nav-top-clearance';
import {
  sectionHeaderOuterLayoutClass,
  sectionHeaderSubtitleAlignClass,
  sectionHeaderTitleTextAlignClass,
  sectionHeaderTitleWrapClass,
  sectionHeaderTrailingLayoutClass,
} from '@/components/portfolio/portfolio-global-settings';
import { portfolioEditorialShellClass } from '@/components/portfolio/portfolio-editorial-layout';
import { useT } from '@/lib/i18n/I18nProvider';
import { ArrowUpRight } from '@/components/portfolio/portfolio-contact-link-icons';

export const SERIF = "'Playfair Display', serif";

export {
  portfolioEditorialShellClass,
};

/** Shared chrome for floating nav pill and sticky section titles. */
const PORTFOLIO_FLOATING_CHROME =
  'rounded-full border border-[rgba(229,229,229,0.8)] bg-[rgba(255,255,255,0.9)] p-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.08)] backdrop-blur-md dark:border-neutral-700 dark:bg-[rgba(15,15,15,0.9)]';

const PORTFOLIO_FLOATING_CHROME_LABEL =
  'px-4 py-2 text-[11px] font-bold normal-case tracking-[0.04em]';

/** Nearest scrollable ancestor (pages mode uses nested overflow-y-auto). */
export function getScrollParent(el: HTMLElement | null): HTMLElement | null {
  let node = el?.parentElement ?? null;
  while (node && node !== document.body) {
    const { overflowY } = getComputedStyle(node);
    if (
      (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') &&
      node.scrollHeight > node.clientHeight + 1
    ) {
      return node;
    }
    node = node.parentElement;
  }
  return null;
}

function useSectionTitleStuck(enabled: boolean) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [isStuck, setIsStuck] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setIsStuck(false);
      return;
    }

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const scrollRoot = getScrollParent(sentinel);
    const observer = new IntersectionObserver(
      ([entry]) => setIsStuck(!entry.isIntersecting),
      {
        root: scrollRoot,
        threshold: 0,
        rootMargin: scrollRoot ? '0px 0px 0px 0px' : '-72px 0px 0px 0px',
      }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [enabled]);

  return { sentinelRef, isStuck };
}

/**
 * Tracks whether the section enclosing the returned ref currently spans the
 * vertical center of the viewport (or pages-mode scroll pane).
 */
function useSectionCenterActive(enabled: boolean) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setActive(false);
      return;
    }

    const anchor = anchorRef.current;
    const section = anchor?.closest('section');
    if (!section) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const scrollRoot = getScrollParent(section as HTMLElement);
      const rect = section.getBoundingClientRect();
      if (scrollRoot) {
        const rootRect = scrollRoot.getBoundingClientRect();
        const centerY = rootRect.top + rootRect.height / 2;
        setActive(rect.top <= centerY && rect.bottom >= centerY);
      } else {
        const centerY = window.innerHeight / 2;
        setActive(rect.top <= centerY && rect.bottom >= centerY);
      }
    };
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    const scrollRoot = getScrollParent(section as HTMLElement);
    update();
    const scrollTarget: HTMLElement | Window = scrollRoot ?? window;
    scrollTarget.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      scrollTarget.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [enabled]);

  return { anchorRef, active };
}

function wrapSectionTitleChrome(
  node: React.ReactNode,
  chromeClass?: string,
  chromeStyle?: React.CSSProperties
) {
  const hasChrome =
    Boolean(chromeClass?.trim()) || Boolean(chromeStyle && Object.keys(chromeStyle).length > 0);
  if (!hasChrome) return node;
  return (
    <div className={chromeClass} style={chromeStyle}>
      {node}
    </div>
  );
}

/**
 * Split-screen left rail: one word per line (title only).
 * We intentionally avoid breaking a single word into multiple lines (letter-wrap).
 * If the word doesn't fit, the auto-fit logic reduces font-size instead.
 */
function SplitRailTitleLines({
  title,
  decorationStyle,
}: {
  title: string;
  decorationStyle?: React.CSSProperties;
}) {
  const words = title.trim().split(/\s+/).filter(Boolean);
  const hasDecoration = Boolean(decorationStyle && Object.keys(decorationStyle).length > 0);

  if (words.length <= 1) {
    const content = hasDecoration ? <span style={decorationStyle}>{title}</span> : <>{title}</>;
    return (
      <span className="block max-w-full whitespace-nowrap text-balance">
        {content}
      </span>
    );
  }

  return (
    <>
      {words.map((word, index) => (
        <span
          key={`${word}-${index}`}
          className="block max-w-full whitespace-nowrap text-balance"
        >
          {hasDecoration ? <span style={decorationStyle}>{word}</span> : word}
        </span>
      ))}
    </>
  );
}

const SPLIT_RAIL_DEFAULT_TITLE_CLASS =
  'text-3xl font-extrabold tracking-[-0.04em] text-neutral-950 sm:text-4xl lg:text-5xl lg:leading-[0.95] dark:text-white';

function useSplitRailAutoFitTitle(
  titleRef: React.RefObject<HTMLElement | null>,
  containerRef: React.RefObject<HTMLElement | null>,
  deps: unknown[]
) {
  useLayoutEffect(() => {
    const title = titleRef.current;
    const container = containerRef.current;
    if (!title || !container) return;

    const fit = () => {
      title.style.fontSize = '';
      const computed = window.getComputedStyle(title);
      let sizePx = Number.parseFloat(computed.fontSize);
      if (!Number.isFinite(sizePx)) return;

      const minPx = 14;
      const maxWidth = container.clientWidth;
      if (maxWidth <= 0) return;

      let guard = 0;
      while (title.scrollWidth > maxWidth && sizePx > minPx && guard < 96) {
        sizePx -= 1;
        title.style.fontSize = `${sizePx}px`;
        guard += 1;
      }
    };

    fit();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(fit) : null;
    ro?.observe(container);
    window.addEventListener('resize', fit);
    return () => {
      ro?.disconnect();
      window.removeEventListener('resize', fit);
    };
  }, deps);
}

function SplitRailAutoFitHeading({
  className,
  style,
  children,
  chromeClass,
  chromeStyle,
}: {
  className: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
  chromeClass?: string;
  chromeStyle?: React.CSSProperties;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  useSplitRailAutoFitTitle(titleRef, containerRef, [className, style, children]);

  return (
    <div ref={containerRef} className="w-full max-w-full">
      {wrapSectionTitleChrome(
        <h2
          ref={titleRef}
          className={`max-w-full ${className}`}
          style={style}
        >
          {children}
        </h2>,
        chromeClass,
        chromeStyle
      )}
    </div>
  );
}

function SideInfoCardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 11.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 21s7-4.438 7-10a7 7 0 10-14 0c0 5.562 7 10 7 10z"
      />
    </svg>
  );
}

function SideInfoLanguagesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.6 9h16.8M3.6 15h16.8M12 3c-2.4 2.8-3.6 5.6-3.6 9s1.2 6.2 3.6 9c2.4-2.8 3.6-5.6 3.6-9s-1.2-6.2-3.6-9z" />
    </svg>
  );
}

function SideInfoUserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function SideInfoCalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

function SideInfoClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 2" />
    </svg>
  );
}

export const SIDE_INFO_ICONS = {
  location: SideInfoCardIcon,
  languages: SideInfoLanguagesIcon,
  gender: SideInfoUserIcon,
  memberSince: SideInfoCalendarIcon,
  availability: SideInfoClockIcon,
} as const;

/** Sticky section title — sticks for the full section height until the next section title replaces it. */
export function EditorialSectionStickyHeader({
  title,
  subtitle,
  trailing,
  subtitleSerif = false,
  editorialLayout = false,
  centered = false,
  alignRight = false,
  alwaysCentered = false,
  kicker,
  className = '',
  titleTypographyClass = '',
  titleTypographyStyle,
  subtitleTypographyClass = '',
  subtitleTypographyStyle,
  titleDecorationStyle,
  subtitleDecorationStyle,
  titleChromeClass,
  titleChromeStyle,
  scrollBehavior = 'sticky',
  customTitleSizing = false,
  customSubtitleSizing = false,
  orientation = 'horizontal',
  /** Split-screen left rail: title + subtitle + trailing as one atomic block (no staggered motion). */
  splitRailBundle = false,
}: {
  title: string;
  subtitle?: React.ReactNode;
  trailing?: React.ReactNode;
  subtitleSerif?: boolean;
  /** Editorial wide layout — compact title on the nav row (lg+). */
  editorialLayout?: boolean;
  /** Center title, subtitle, and trailing content (FAQ, Contact, etc.). */
  centered?: boolean;
  /** Small label above the title (FAQ kicker, etc.). */
  kicker?: React.ReactNode;
  /** Align title, subtitle, and trailing content to the right (global override). */
  alignRight?: boolean;
  /** Keep title centered on scroll — no top-left sticky pill (Contact). */
  alwaysCentered?: boolean;
  className?: string;
  titleTypographyClass?: string;
  titleTypographyStyle?: React.CSSProperties;
  subtitleTypographyClass?: string;
  subtitleTypographyStyle?: React.CSSProperties;
  /** Inline decoration (underline/highlight) applied to a span hugging the text. */
  titleDecorationStyle?: React.CSSProperties;
  subtitleDecorationStyle?: React.CSSProperties;
  titleChromeClass?: string;
  titleChromeStyle?: React.CSSProperties;
  /** Global scroll behavior for section titles: floating pill or static. */
  scrollBehavior?: 'sticky' | 'static';
  /** When true, skip default editorial title scale (global typography controls size). */
  customTitleSizing?: boolean;
  /** When true, skip default subtitle scale and muted color. */
  customSubtitleSizing?: boolean;
  /** Global title orientation — horizontal (default) or rotated vertical rail. */
  orientation?: 'horizontal' | 'vertical';
  splitRailBundle?: boolean;
}) {
  const displayTitle = portfolioSectionTitleSentenceCase(title);
  const titleClassName = `${portfolioSectionTitleClassWithoutUppercase(
    titleTypographyClass
  )} normal-case`.trim();
  const spacingClass = className || 'mb-12 lg:mb-16';
  const stickyEnabled = scrollBehavior !== 'static';
  const pillMode = editorialLayout && stickyEnabled;
  const { sentinelRef, isStuck } = useSectionTitleStuck(stickyEnabled && !alwaysCentered);
  const centerContent = centered && !alignRight && (alwaysCentered || !isStuck || !stickyEnabled);
  const rightContent = alignRight && (alwaysCentered || !isStuck || !stickyEnabled);
  const showPill = pillMode && isStuck && !alwaysCentered;

  const positionClass = !stickyEnabled
    ? 'relative'
    : pillMode
      ? 'sticky top-16 sm:top-[4.75rem] lg:top-5'
      : isStuck
        ? 'sticky top-16 border-b border-neutral-200/70 bg-white/95 py-3 backdrop-blur-md sm:top-[4.75rem] sm:py-4 dark:border-neutral-800 dark:bg-neutral-950/95'
        : 'sticky top-16 sm:top-[4.75rem]';

  const titleSizeClass = showPill
    ? `leading-none text-neutral-950 dark:text-white ${PORTFOLIO_FLOATING_CHROME_LABEL}`
    : customTitleSizing
      ? 'text-neutral-950 dark:text-white'
      : stickyEnabled && !pillMode && isStuck
        ? 'text-3xl font-extrabold tracking-[-0.04em] text-neutral-950 sm:text-4xl lg:leading-[0.95] dark:text-white'
        : 'text-5xl font-extrabold tracking-[-0.04em] text-neutral-950 sm:text-6xl lg:text-7xl lg:leading-[0.95] dark:text-white';

  if (orientation === 'vertical') {
    return (
      <VerticalSectionTitle
        title={displayTitle}
        subtitle={subtitle}
        trailing={trailing}
        subtitleSerif={subtitleSerif}
        centered={centered}
        alignRight={alignRight}
        spacingClass={spacingClass}
        titleTypographyClass={titleClassName}
        titleTypographyStyle={titleTypographyStyle}
        titleDecorationStyle={titleDecorationStyle}
        subtitleTypographyClass={subtitleTypographyClass}
        subtitleTypographyStyle={subtitleTypographyStyle}
        subtitleDecorationStyle={subtitleDecorationStyle}
        customTitleSizing={customTitleSizing}
        customSubtitleSizing={customSubtitleSizing}
        titleChromeClass={titleChromeClass}
        titleChromeStyle={titleChromeStyle}
      />
    );
  }

  // Split left rail: one compact cadre — title, description, trailing (not a tall column).
  if (splitRailBundle) {
    return (
      <div className="flex w-full max-w-full flex-col items-center px-1 text-center sm:px-2">
        <SplitRailAutoFitHeading
          className={`${titleClassName} ${
            customTitleSizing
              ? 'text-neutral-950 dark:text-white'
              : SPLIT_RAIL_DEFAULT_TITLE_CLASS
          }`}
          style={titleTypographyStyle}
          chromeClass={titleChromeClass}
          chromeStyle={titleChromeStyle}
        >
          <SplitRailTitleLines title={displayTitle} decorationStyle={titleDecorationStyle} />
        </SplitRailAutoFitHeading>
        {subtitle ? (
          <p
            className={`mt-4 w-full max-w-full leading-relaxed ${
              customSubtitleSizing ? '' : 'text-base text-neutral-500 sm:text-lg dark:text-neutral-400'
            } ${subtitleTypographyClass}`}
            style={{
              ...(subtitleSerif ? { fontFamily: SERIF } : undefined),
              ...subtitleTypographyStyle,
            }}
          >
            {subtitleDecorationStyle && Object.keys(subtitleDecorationStyle).length > 0 ? (
              <span style={subtitleDecorationStyle}>{subtitle}</span>
            ) : (
              subtitle
            )}
          </p>
        ) : null}
        {trailing ? <div className="mt-5 flex justify-center">{trailing}</div> : null}
      </div>
    );
  }

  return (
    <>
      <div ref={sentinelRef} className="h-px w-full" aria-hidden />
      <div
        className={`z-40 w-full transition-all duration-300 ease-out ${sectionHeaderOuterLayoutClass(
          centerContent,
          rightContent
        )} ${positionClass}`}
      >
        <div
          className={sectionHeaderTitleWrapClass(
            showPill,
            centered,
            alignRight,
            PORTFOLIO_FLOATING_CHROME
          )}
        >
          {!showPill && kicker ? (
            <div
              className={`mb-3 ${sectionHeaderTitleTextAlignClass(centered, alignRight)}`}
            >
              {kicker}
            </div>
          ) : null}
          {wrapSectionTitleChrome(
            <h2
              className={`transition-all duration-300 ease-out ${sectionHeaderTitleTextAlignClass(
                centered,
                alignRight
              )} ${titleClassName} ${titleSizeClass}`}
              style={titleTypographyStyle}
            >
              {titleDecorationStyle && Object.keys(titleDecorationStyle).length > 0 ? (
                <span style={titleDecorationStyle}>{displayTitle}</span>
              ) : (
                displayTitle
              )}
            </h2>,
            titleChromeClass,
            titleChromeStyle
          )}
        </div>
      </div>
      {subtitle ? (
        <p
          className={`mt-4 max-w-2xl leading-relaxed ${
            customSubtitleSizing ? '' : 'text-base text-neutral-500 sm:text-lg dark:text-neutral-400'
          } ${sectionHeaderSubtitleAlignClass(centered, alignRight)} ${subtitleTypographyClass} ${
            trailing ? 'mb-4' : spacingClass
          }`}
          style={{
            ...(subtitleSerif ? { fontFamily: SERIF } : undefined),
            ...subtitleTypographyStyle,
          }}
        >
          {subtitleDecorationStyle && Object.keys(subtitleDecorationStyle).length > 0 ? (
            <span style={subtitleDecorationStyle}>{subtitle}</span>
          ) : (
            subtitle
          )}
        </p>
      ) : null}
      {trailing ? (
        <div className={`${spacingClass} ${sectionHeaderTrailingLayoutClass(centered, alignRight)}`}>
          {trailing}
        </div>
      ) : null}
      {!subtitle && !trailing ? <div className={spacingClass} aria-hidden /> : null}
    </>
  );
}

/**
 * Vertical (rotated) section title. On large screens it is fixed and centered
 * vertically, appearing only while its own section owns the middle of the
 * viewport — so a single title shows at a time and never bleeds into the
 * section above or below. On small screens it renders inline in normal flow.
 */
function VerticalSectionTitle({
  title,
  subtitle,
  trailing,
  subtitleSerif = false,
  centered = false,
  alignRight = false,
  spacingClass,
  titleTypographyClass = '',
  titleTypographyStyle,
  titleDecorationStyle,
  subtitleTypographyClass = '',
  subtitleTypographyStyle,
  subtitleDecorationStyle,
  customTitleSizing = false,
  customSubtitleSizing = false,
  titleChromeClass,
  titleChromeStyle,
}: {
  title: string;
  subtitle?: React.ReactNode;
  trailing?: React.ReactNode;
  subtitleSerif?: boolean;
  centered?: boolean;
  alignRight?: boolean;
  spacingClass: string;
  titleTypographyClass?: string;
  titleTypographyStyle?: React.CSSProperties;
  titleDecorationStyle?: React.CSSProperties;
  subtitleTypographyClass?: string;
  subtitleTypographyStyle?: React.CSSProperties;
  subtitleDecorationStyle?: React.CSSProperties;
  customTitleSizing?: boolean;
  customSubtitleSizing?: boolean;
  titleChromeClass?: string;
  titleChromeStyle?: React.CSSProperties;
}) {
  const { anchorRef, active } = useSectionCenterActive(true);

  const verticalTitleSize = customTitleSizing
    ? 'text-neutral-950 dark:text-white'
    : 'text-5xl font-black tracking-[-0.02em] text-neutral-950 sm:text-6xl lg:text-7xl dark:text-white';

  // For upright vertical text a highlight band should run alongside the column,
  // so flip the marker gradient from vertical (to bottom) to horizontal (to right).
  const toVerticalDecoration = (
    decoration?: React.CSSProperties
  ): React.CSSProperties | undefined => {
    if (!decoration || !decoration.backgroundImage) return decoration;
    return {
      ...decoration,
      backgroundImage: String(decoration.backgroundImage).replace(
        'linear-gradient(',
        'linear-gradient(to right, '
      ),
    };
  };
  const verticalTitleDecoration = toVerticalDecoration(titleDecorationStyle);
  const verticalSubtitleDecoration = toVerticalDecoration(subtitleDecorationStyle);

  const flowJustify = 'justify-center xl:justify-start';
  const flowJustifyResolved = centered
    ? 'justify-center'
    : alignRight
      ? 'justify-center xl:justify-end'
      : flowJustify;

  const fixedPositionClass = centered
    ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
    : alignRight
      ? 'top-1/2 right-6 -translate-y-1/2 xl:right-10'
      : 'top-1/2 left-6 -translate-y-1/2 xl:left-10';

  const titleNode = wrapSectionTitleChrome(
    <h2
      className={`${titleTypographyClass} ${verticalTitleSize}`}
      style={{
        writingMode: 'vertical-rl',
        textOrientation: 'upright',
        letterSpacing: '-0.05em',
        lineHeight: 1,
        ...titleTypographyStyle,
      }}
    >
      {verticalTitleDecoration && Object.keys(verticalTitleDecoration).length > 0 ? (
        <span style={verticalTitleDecoration}>{title}</span>
      ) : (
        title
      )}
    </h2>,
    titleChromeClass,
    titleChromeStyle
  );

  return (
    <>
      <div ref={anchorRef} className="h-px w-full" aria-hidden />
      {/* In-flow on small screens */}
      <div className={`mb-10 flex w-full items-start ${flowJustifyResolved} lg:hidden`}>{titleNode}</div>
      {/* Fixed & centered on large screens, visible only while the section owns the viewport center */}
      <div
        className={`pointer-events-none fixed z-30 hidden transition-opacity duration-500 ease-out lg:flex ${fixedPositionClass} ${
          active ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {titleNode}
      </div>
      {subtitle ? (
        <p
          className={`mt-4 max-w-2xl leading-relaxed ${
            customSubtitleSizing ? '' : 'text-base text-neutral-500 sm:text-lg dark:text-neutral-400'
          } ${sectionHeaderSubtitleAlignClass(centered, alignRight)} ${subtitleTypographyClass} ${
            trailing ? 'mb-4' : spacingClass
          }`}
          style={{
            ...(subtitleSerif ? { fontFamily: SERIF } : undefined),
            ...subtitleTypographyStyle,
          }}
        >
          {verticalSubtitleDecoration && Object.keys(verticalSubtitleDecoration).length > 0 ? (
            <span style={verticalSubtitleDecoration}>{subtitle}</span>
          ) : (
            subtitle
          )}
        </p>
      ) : null}
      {trailing ? (
        <div className={`${spacingClass} ${sectionHeaderTrailingLayoutClass(centered, alignRight)}`}>
          {trailing}
        </div>
      ) : null}
    </>
  );
}

/** True only for a genuine desktop/laptop pointer: wide viewport AND a persistent,
 * precise pointer (mouse/trackpad) with hover support. Width alone is not a reliable
 * "desktop" signal — large tablets (e.g. a 12.9" iPad in portrait is exactly 1024px
 * wide, wider still in landscape) would otherwise be misclassified as desktop. Used
 * to gate depth/parallax effects that are only legible with a hovering cursor and
 * should stay static on touch, regardless of how wide the touch screen is. */
export function usePortfolioFinePointerDesktop(minWidthPx = 1024) {
  const query = `(min-width: ${minWidthPx}px) and (hover: hover) and (pointer: fine)`;
  return useSyncExternalStore(
    (onStoreChange) => {
      const mq = window.matchMedia(query);
      mq.addEventListener('change', onStoreChange);
      return () => mq.removeEventListener('change', onStoreChange);
    },
    () => window.matchMedia(query).matches,
    () => false
  );
}

/** Order / Commander / GET CTA — Contact → tel → footer (plain <a>, not next/link). */
type ServicesOrderCtaNav = {
  href: string;
  onNavigate?: (href: string) => void;
};

const ServicesOrderCtaHrefContext = createContext<ServicesOrderCtaNav>({ href: '#contact' });

export function ServicesOrderCtaHrefProvider({
  href,
  onNavigate,
  children,
}: {
  href: string;
  onNavigate?: (href: string) => void;
  children: ReactNode;
}) {
  const value = useMemo(
    () => ({ href: href || '#contact', onNavigate }),
    [href, onNavigate]
  );
  return (
    <ServicesOrderCtaHrefContext.Provider value={value}>
      {children}
    </ServicesOrderCtaHrefContext.Provider>
  );
}

export function useServicesOrderCtaNav(): ServicesOrderCtaNav {
  const value = useContext(ServicesOrderCtaHrefContext);
  return value.href ? value : { href: '#contact', onNavigate: value.onNavigate };
}

export function handleServicesOrderCtaClick(
  event: ReactMouseEvent<HTMLAnchorElement>,
  href: string,
  onNavigate?: (href: string) => void
) {
  if (href.startsWith('tel:') || href.startsWith('mailto:') || /^https?:/i.test(href)) {
    return;
  }
  if (onNavigate) {
    event.preventDefault();
    onNavigate(href);
    return;
  }
  if (href.startsWith('#')) {
    event.preventDefault();
    scrollToPortfolioSection(href.slice(1));
  }
}

export function MarketplaceProfileLink({
  creatorId,
  color,
}: {
  creatorId: string;
  /** Accent color from the Work palette (Section title / Principal). */
  color?: string;
}) {
  const t = useT();
  return (
    <Link
      href={`/providers/${creatorId}`}
      className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.14em] transition hover:opacity-75"
      data-pf-no-color-transition=""
      style={color ? { color } : undefined}
    >
      {t('View all projects')}
      <ArrowUpRight className="h-3.5 w-3.5" />
    </Link>
  );
}
