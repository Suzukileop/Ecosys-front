import { useEffect, useRef } from 'react';

type MouseParallaxOptions = {
  /** Max horizontal shift in px */
  x?: number;
  /** Max vertical shift in px */
  y?: number;
  /** Max subtle tilt in degrees (adds depth without distorting the pattern) */
  rotate?: number;
  /** Spring stiffness — higher = snappier */
  stiffness?: number;
  /** Velocity damping per frame at 60 fps (0–1) */
  damping?: number;
};

const DEFAULTS: Required<MouseParallaxOptions> = {
  x: 36,
  y: 26,
  rotate: 0.55,
  stiffness: 0.065,
  damping: 0.78,
};

/**
 * Smooth spring-based mouse parallax for one or more layers sharing the same ref.
 * Frame-rate independent; returns to centre when the pointer leaves the window.
 */
export function useMouseParallax(options: MouseParallaxOptions = {}) {
  const ref = useRef<HTMLDivElement>(null);
  const opts = { ...DEFAULTS, ...options };

  useEffect(() => {
    const layer = ref.current;
    if (!layer) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) return;

    let tgtX = 0;
    let tgtY = 0;
    let curX = 0;
    let curY = 0;
    let velX = 0;
    let velY = 0;
    let rafId = 0;
    let lastTs = 0;

    const onMouseMove = (e: MouseEvent) => {
      const nx = e.clientX / window.innerWidth;
      const ny = e.clientY / window.innerHeight;
      // Ease-in toward edges — movement feels more natural than linear mapping
      const ex = Math.sign(nx - 0.5) * Math.pow(Math.abs(nx - 0.5) * 2, 1.15) * 0.5;
      const ey = Math.sign(ny - 0.5) * Math.pow(Math.abs(ny - 0.5) * 2, 1.15) * 0.5;
      tgtX = ex * opts.x * 2;
      tgtY = ey * opts.y * 2;
    };

    const onMouseLeave = () => {
      tgtX = 0;
      tgtY = 0;
    };

    const tick = (ts: number) => {
      if (!lastTs) lastTs = ts;
      const dt = Math.min((ts - lastTs) / 16.667, 2.5);
      lastTs = ts;

      const stiff = opts.stiffness * dt;
      const damp = Math.pow(opts.damping, dt);

      velX = (velX + (tgtX - curX) * stiff) * damp;
      velY = (velY + (tgtY - curY) * stiff) * damp;
      curX += velX * dt;
      curY += velY * dt;

      // Snap to rest when close enough (avoids endless micro-jitter)
      if (Math.abs(tgtX - curX) < 0.04 && Math.abs(velX) < 0.04) curX = tgtX;
      if (Math.abs(tgtY - curY) < 0.04 && Math.abs(velY) < 0.04) curY = tgtY;

      const rotY = (curX / opts.x) * opts.rotate;
      const rotX = (-curY / opts.y) * opts.rotate;

      layer.style.transform = `translate3d(${curX.toFixed(2)}px, ${curY.toFixed(2)}px, 0) rotateX(${rotX.toFixed(3)}deg) rotateY(${rotY.toFixed(3)}deg)`;

      rafId = requestAnimationFrame(tick);
    };

    document.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
    rafId = requestAnimationFrame(tick);

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      cancelAnimationFrame(rafId);
    };
  }, [opts.x, opts.y, opts.rotate, opts.stiffness, opts.damping]);

  return ref;
}
