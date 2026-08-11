'use client';

import { useEffect, useState } from 'react';

export default function ScrollProgress({ brand = false }: { brand?: boolean }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className={`fixed top-0 left-0 right-0 z-[9998] h-[2px] ${brand ? 'bg-neutral-200/80' : 'bg-white/5'}`}>
      <div
        className={
          brand
            ? 'h-full bg-gradient-to-r from-[#F97316] via-[#FB923C] to-[#EA580C] transition-[width] duration-75'
            : 'h-full bg-gradient-to-r from-[#7C3AED] via-[#2563EB] to-[#06B6D4] transition-[width] duration-75'
        }
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
