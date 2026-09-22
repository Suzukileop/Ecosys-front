'use client';

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

const TRANSITION_MS = 420;

/**
 * Pages nav mode: swaps full-page content with a directional slide instead of an
 * abrupt cut. Keeps a snapshot of the outgoing page mounted just long enough to
 * animate it out while the incoming page animates in from the opposite edge.
 */
export function PortfolioPagesSlideViewport({
  pageId,
  direction,
  children,
}: {
  pageId: string;
  direction: 1 | -1;
  children: ReactNode;
}) {
  const [current, setCurrent] = useState<{ id: string; node: ReactNode }>({
    id: pageId,
    node: children,
  });
  const [outgoing, setOutgoing] = useState<{ id: string; node: ReactNode; direction: 1 | -1 } | null>(
    null
  );
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (pageId === current.id) return;
    setOutgoing({ id: current.id, node: current.node, direction });
    setCurrent({ id: pageId, node: children });
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setOutgoing(null), TRANSITION_MS);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
    // Only the page id (not `children`, not `direction` mid-flight) should trigger a swap.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageId]);

  // Keep the mounted page's own content fresh (settings can still change while parked on it).
  useEffect(() => {
    setCurrent((prev) => (prev.id === pageId ? { ...prev, node: children } : prev));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [children]);

  return (
    <div className="relative h-full w-full overflow-hidden">
      {outgoing ? (
        <div
          key={`out-${outgoing.id}`}
          aria-hidden
          className="pf-pages-slide pf-pages-slide-out absolute inset-0 h-full w-full overflow-y-auto"
          style={{ '--pf-pages-slide-dir': outgoing.direction } as CSSProperties}
        >
          {outgoing.node}
        </div>
      ) : null}
      <div
        key={`in-${current.id}`}
        className={`pf-pages-slide h-full w-full overflow-y-auto ${outgoing ? 'pf-pages-slide-in' : ''}`}
        style={{ '--pf-pages-slide-dir': direction } as CSSProperties}
      >
        {current.node}
      </div>
    </div>
  );
}
