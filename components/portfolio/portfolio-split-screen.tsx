'use client';

import {
  createContext,
  cloneElement,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
  type RefObject,
} from 'react';
import { createPortal } from 'react-dom';
import {
  splitTitleMotionClassNames,
  type PortfolioGlobalSplitTitleMotion,
} from '@/components/portfolio/portfolio-global-settings';

type SplitTitleFrameResolved = {
  className: string;
  style: CSSProperties;
  shellClassName?: string;
  shellStyle?: CSSProperties;
  offsetX?: number;
};

type VisibleBand = {
  /** Distance from viewport top to visible split area. */
  top: number;
  /** Distance from viewport bottom to visible split area. */
  bottomInset: number;
};

type SplitRailContextValue = {
  railEl: HTMLElement | null;
  titleMotion: PortfolioGlobalSplitTitleMotion;
  titleFrame: SplitTitleFrameResolved;
  /** Visible vertical band inside the rail (excludes hero/footer clip). */
  visibleBand: VisibleBand;
};

const EMPTY_TITLE_FRAME: SplitTitleFrameResolved = { className: '', style: {}, offsetX: 0 };
const EMPTY_BAND: VisibleBand = { top: 0, bottomInset: 0 };

const PortfolioSplitRailContext = createContext<SplitRailContextValue>({
  railEl: null,
  titleMotion: 'fade-up',
  titleFrame: EMPTY_TITLE_FRAME,
  visibleBand: EMPTY_BAND,
});

export function usePortfolioSplitRail() {
  return useContext(PortfolioSplitRailContext);
}

/** Nearest scrollable ancestor (pages mode uses nested overflow-y-auto). */
function getScrollParent(el: HTMLElement | null): HTMLElement | null {
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

type SplitTitlePlacement = {
  anchorRef: React.RefObject<HTMLDivElement | null>;
  active: boolean;
};

/**
 * Split-rail title placement — active when:
 * 1. the hero is nearly off-screen (only a small remnant may remain),
 * 2. the section owns the viewport center, and
 * 3. the whole title block fits in the unclipped rail band.
 * The title never slides: it stays fixed at the viewport center and only fades.
 */
function useSplitTitlePlacement(
  enabled: boolean,
  visibleBand: VisibleBand,
  titleBoxRef: RefObject<HTMLDivElement | null>
): SplitTitlePlacement {
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
      let viewTop: number;
      let viewBottom: number;

      if (scrollRoot) {
        const rootRect = scrollRoot.getBoundingClientRect();
        viewTop = rootRect.top;
        viewBottom = rootRect.bottom;
      } else {
        viewTop = 0;
        viewBottom = window.innerHeight;
      }

      const viewHeight = Math.max(1, viewBottom - viewTop);
      // Appear as the hero is almost gone — not only after it fully clears.
      // ~18% vh (min 64px) of remnant is still treated as "quasi-disparition".
      const heroAlmostGoneThreshold = Math.max(64, Math.round(viewHeight * 0.18));
      const heroAlmostGone = visibleBand.top <= heroAlmostGoneThreshold;
      if (!heroAlmostGone) {
        setActive(false);
        return;
      }

      const centerY = viewTop + viewHeight / 2;
      const ownsCenter = rect.top <= centerY && rect.bottom >= centerY;

      // Whole title block must fit inside the unclipped band so it always
      // appears complete — never partially hidden behind the footer clip.
      const halfTitle = (titleBoxRef.current?.offsetHeight ?? 0) / 2;
      const bandTop = viewTop + visibleBand.top;
      const bandBottom = viewBottom - visibleBand.bottomInset;
      // Soften the top edge while a thin hero remnant is still exiting.
      const topSlack = Math.max(16, Math.round(visibleBand.top * 0.55));
      const fitsInBand =
        centerY - halfTitle >= bandTop - topSlack &&
        centerY + halfTitle <= bandBottom + 1;

      setActive(ownsCenter && fitsInBand);
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
  }, [enabled, visibleBand.top, visibleBand.bottomInset, titleBoxRef]);

  return { anchorRef, active };
}

function prepareSplitRailHeader(node: ReactNode): ReactNode {
  if (!isValidElement(node)) return node;
  return cloneElement(node as ReactElement<Record<string, unknown>>, {
    centered: true,
    alignRight: false,
    alwaysCentered: true,
    className: 'mb-0 w-fit max-w-full',
    scrollBehavior: 'static',
    orientation: 'horizontal',
    splitRailBundle: true,
    titleChromeClass: undefined,
    titleChromeStyle: undefined,
  });
}

type RailBox = {
  left: number;
  width: number;
  clipTop: number;
  clipBottom: number;
};

const EMPTY_RAIL: RailBox = { left: 0, width: 0, clipTop: 0, clipBottom: 0 };

/**
 * Page-level split frame: left title rail is fixed; titles center inside the
 * visible band (between hero and footer), so the section title shows fully
 * inside a compact cadre as you scroll.
 */
export function PortfolioSplitScreenFrame({
  children,
  railClassName = '',
  titleMotion = 'fade-up',
  titleFrame = EMPTY_TITLE_FRAME,
}: {
  children: ReactNode;
  railClassName?: string;
  titleMotion?: PortfolioGlobalSplitTitleMotion;
  titleFrame?: SplitTitleFrameResolved;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [railEl, setRailEl] = useState<HTMLDivElement | null>(null);
  const [railBox, setRailBox] = useState<RailBox>(EMPTY_RAIL);

  const syncRailBox = useCallback(() => {
    const frame = frameRef.current;
    if (!frame || typeof window === 'undefined') {
      setRailBox(EMPTY_RAIL);
      return;
    }

    if (!window.matchMedia('(min-width: 1024px)').matches) {
      setRailBox(EMPTY_RAIL);
      return;
    }

    const rect = frame.getBoundingClientRect();
    const styles = getComputedStyle(frame);
    const gap = Number.parseFloat(styles.columnGap || styles.gap || '0') || 0;
    const leftWidth = Math.max(0, (rect.width - gap) * (2 / 5));
    const vh = window.innerHeight;

    if (leftWidth <= 0 || rect.bottom <= 0 || rect.top >= vh) {
      setRailBox(EMPTY_RAIL);
      return;
    }

    const next: RailBox = {
      left: Math.round(rect.left),
      width: Math.round(leftWidth),
      clipTop: Math.max(0, Math.round(rect.top)),
      clipBottom: Math.max(0, Math.round(vh - rect.bottom)),
    };

    setRailBox((prev) =>
      prev.left === next.left &&
      prev.width === next.width &&
      prev.clipTop === next.clipTop &&
      prev.clipBottom === next.clipBottom
        ? prev
        : next
    );
  }, []);

  useLayoutEffect(() => {
    syncRailBox();
    const frame = frameRef.current;
    const ro = typeof ResizeObserver !== 'undefined' && frame ? new ResizeObserver(syncRailBox) : null;
    if (frame && ro) ro.observe(frame);
    window.addEventListener('scroll', syncRailBox, { passive: true });
    window.addEventListener('resize', syncRailBox);
    return () => {
      ro?.disconnect();
      window.removeEventListener('scroll', syncRailBox);
      window.removeEventListener('resize', syncRailBox);
    };
  }, [syncRailBox]);

  const railVisible = railBox.width > 0;
  const visibleBand: VisibleBand = railVisible
    ? { top: railBox.clipTop, bottomInset: railBox.clipBottom }
    : EMPTY_BAND;

  return (
    <PortfolioSplitRailContext.Provider
      value={{ railEl, titleMotion, titleFrame, visibleBand }}
    >
      <div
        ref={frameRef}
        className="lg:grid lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:items-start lg:gap-10 xl:gap-14"
      >
        <div className="pointer-events-none hidden min-h-0 lg:block" aria-hidden />

        {railVisible
          ? createPortal(
              <aside
                className={`pointer-events-none fixed top-0 z-20 hidden h-[100dvh] max-h-[100dvh] lg:block ${railClassName}`.trim()}
                style={{
                  left: railBox.left,
                  width: railBox.width,
                  clipPath: `inset(${railBox.clipTop}px 0 ${railBox.clipBottom}px 0)`,
                }}
                data-portfolio-split-rail-fixed
              >
                <div
                  ref={setRailEl}
                  className="pointer-events-auto relative h-full w-full px-2 sm:px-4"
                  data-portfolio-split-rail
                />
              </aside>,
              document.body
            )
          : null}

        <div className="min-w-0 overflow-x-clip">{children}</div>
      </div>
    </PortfolioSplitRailContext.Provider>
  );
}

/**
 * Mobile: normal in-flow title.
 * Large screens: compact cadre fixed at the center of the visible left band.
 * The title never slides — it only fades when the section owns the viewport center.
 */
export function PortfolioSplitScreenTitle({ children }: { children: ReactNode }) {
  const { railEl, titleMotion, titleFrame, visibleBand } = usePortfolioSplitRail();
  const enabled = Boolean(railEl);
  const titleBoxRef = useRef<HTMLDivElement>(null);
  const { anchorRef, active } = useSplitTitlePlacement(enabled, visibleBand, titleBoxRef);
  const railHeader = prepareSplitRailHeader(children);
  const hasFrame =
    Boolean(titleFrame.className?.trim()) ||
    Boolean(titleFrame.style && Object.keys(titleFrame.style).length > 0) ||
    Boolean(titleFrame.shellClassName?.trim()) ||
    Boolean(titleFrame.shellStyle && Object.keys(titleFrame.shellStyle).length > 0);

  const cadreClass = hasFrame ? titleFrame.className : 'box-border w-full max-w-full overflow-hidden';
  const cadreStyle = hasFrame ? titleFrame.style : undefined;
  const hasShell =
    Boolean(titleFrame.shellClassName?.trim()) ||
    Boolean(titleFrame.shellStyle && Object.keys(titleFrame.shellStyle).length > 0);

  // Fixed at the viewport center of the rail — never repositioned by the
  // hero/footer clip band, so the title cannot slide while scrolling.
  const bandStyle: CSSProperties = {
    top: 0,
    bottom: 0,
  };

  const offsetX = titleFrame.offsetX ?? 0;
  const offsetStyle: CSSProperties | undefined =
    offsetX !== 0
      ? {
          transform: `translate3d(${offsetX}px, 0, 0)`,
          transition: 'transform 320ms cubic-bezier(0.22, 1, 0.36, 1)',
        }
      : undefined;

  const cadre = (
    <div
      ref={titleBoxRef}
      className={cadreClass}
      style={{ ...cadreStyle, ...(!hasShell ? offsetStyle : undefined) }}
    >
      {railHeader}
    </div>
  );

  return (
    <>
      <div ref={anchorRef as RefObject<HTMLDivElement>} className="h-px w-full shrink-0" aria-hidden />
      <div className="lg:hidden">{children}</div>
      {railEl
        ? createPortal(
            <div
              className={`absolute left-0 right-0 flex items-center justify-center overflow-hidden px-3 sm:px-4 ${splitTitleMotionClassNames(
                titleMotion,
                active
              )}`}
              style={bandStyle}
              aria-hidden={!active}
            >
              {hasShell ? (
                <div
                  className={titleFrame.shellClassName}
                  style={{ ...titleFrame.shellStyle, ...offsetStyle }}
                >
                  {cadre}
                </div>
              ) : (
                cadre
              )}
            </div>,
            railEl
          )
        : null}
    </>
  );
}
