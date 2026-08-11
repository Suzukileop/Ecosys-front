'use client';

import { useEffect, useRef, useState } from 'react';

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.matchMedia('(pointer: coarse)').matches);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) return;

    let dotX = 0;
    let dotY = 0;
    let ringX = 0;
    let ringY = 0;

    const onMove = (e: MouseEvent) => {
      dotX = e.clientX;
      dotY = e.clientY;
    };
    window.addEventListener('mousemove', onMove);

    let raf: number;
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const tick = () => {
      ringX = lerp(ringX, dotX, 0.12);
      ringY = lerp(ringY, dotY, 0.12);

      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${dotX - 8}px, ${dotY - 8}px)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ringX - 20}px, ${ringY - 20}px)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
    };
  }, [isMobile]);

  if (isMobile) return null;

  return (
    <>
      <style>{`* { cursor: none !important; }`}</style>
      {/* Dot */}
      <div
        ref={dotRef}
        className="pointer-events-none fixed top-0 left-0 z-[99999] h-4 w-4 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#06B6D4]"
        style={{ willChange: 'transform' }}
      />
      {/* Ring */}
      <div
        ref={ringRef}
        className="pointer-events-none fixed top-0 left-0 z-[99998] h-10 w-10 rounded-full border border-[#7C3AED]/50"
        style={{ willChange: 'transform' }}
      />
    </>
  );
}
