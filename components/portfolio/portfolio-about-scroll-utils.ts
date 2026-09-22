/** Shared GSAP/ScrollTrigger reveal helpers for the Info → About designs. */

/** Nearest overflow scroller — pages mode and Live Preview nest overflow-y-auto shells. */
export function aboutBannerScrollParent(el: HTMLElement | null): HTMLElement | undefined {
  if (!el) return undefined;

  const pageScroll = el.closest('.pf-page-scroll');
  if (
    pageScroll instanceof HTMLElement &&
    pageScroll.scrollHeight > pageScroll.clientHeight + 1
  ) {
    return pageScroll;
  }

  let node = el.parentElement;
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
  return undefined;
}

export function aboutBannerWatchEnter(
  target: HTMLElement,
  scroller: HTMLElement | undefined,
  onEnter: () => void
): () => void {
  let played = false;
  const play = () => {
    if (played) return;
    played = true;
    onEnter();
  };

  const io = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) play();
    },
    {
      root: scroller ?? null,
      threshold: 0.12,
      rootMargin: '0px 0px -12% 0px',
    }
  );
  io.observe(target);

  const rootBox = scroller?.getBoundingClientRect();
  const topBound = rootBox?.top ?? 0;
  const viewH = rootBox?.height ?? window.innerHeight ?? 0;
  const rect = target.getBoundingClientRect();
  if (rect.top < topBound + viewH * 0.82 && rect.bottom > topBound + viewH * 0.12) {
    play();
  }

  return () => {
    io.disconnect();
  };
}
