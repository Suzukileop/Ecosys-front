'use client';
import {createPortal} from 'react-dom';
import {useRef,useLayoutEffect,useSyncExternalStore,type RefObject} from 'react';
/** Textured circle that replaces the OS cursor over the image/title — liquid-inertia follow,
 * dismissed the instant the pointer leaves the trigger's bounds. */
export function FramesViewCursor({
  anchor,
  containerRef,
  onDismiss,
  label = 'View',
}: {
  anchor: { x: number; y: number } | null;
  containerRef: RefObject<HTMLElement | null>;
  onDismiss: () => void;
  label?: string;
}) {
  const elRef = useRef<HTMLDivElement>(null);
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  const rafId = useRef<number | null>(null);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  useLayoutEffect(() => {
    if (!anchor) return;
    target.current = anchor;
    current.current = anchor;
    if (elRef.current) {
      elRef.current.style.transform = `translate3d(${anchor.x}px, ${anchor.y}px, 0) translate(-50%, -50%)`;
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const handleMove = (event: MouseEvent) => {
      target.current = { x: event.clientX, y: event.clientY };
    };
    window.addEventListener('mousemove', handleMove);

    const lerpFactor = reduceMotion ? 1 : 0.2;
    const tick = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      const stillInside =
        rect &&
        target.current.x >= rect.left &&
        target.current.x <= rect.right &&
        target.current.y >= rect.top &&
        target.current.y <= rect.bottom;
      if (!stillInside) {
        onDismiss();
        return;
      }

      current.current = {
        x: current.current.x + (target.current.x - current.current.x) * lerpFactor,
        y: current.current.y + (target.current.y - current.current.y) * lerpFactor,
      };
      if (elRef.current) {
        elRef.current.style.transform = `translate3d(${current.current.x}px, ${current.current.y}px, 0) translate(-50%, -50%)`;
      }
      rafId.current = requestAnimationFrame(tick);
    };
    rafId.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [anchor, containerRef, onDismiss]);

  if (!mounted) return null;

  return createPortal(
    <div
      ref={elRef}
      aria-hidden="true" data-project-view-cursor=""
      data-pf-no-color-transition=""
      className="pointer-events-none fixed left-0 top-0 z-[999] transition-opacity duration-200 ease-out"
      style={{ opacity: anchor ? 1 : 0 }}
    >
      <div
        className="flex h-[6.25rem] w-[6.25rem] flex-col items-center justify-center gap-1 rounded-full border border-white/25 bg-white/92 text-neutral-900 shadow-[0_18px_44px_-16px_rgba(0,0,0,0.55)]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.08) 1px, transparent 0)',
          backgroundSize: '5px 5px',
        }}
      >
        <span className="block w-full px-3 text-center text-[11px] font-medium uppercase leading-[1.45] tracking-[0.12em] [overflow-wrap:anywhere]">{label}</span>
        <span aria-hidden className="text-sm leading-none">
          ↗
        </span>
      </div>
    </div>,
    document.body
  );
}
