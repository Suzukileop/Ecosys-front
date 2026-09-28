'use client';

import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp } from '@fortawesome/free-solid-svg-icons';

/** Floating bottom-right control that appears once the window has scrolled past `threshold`. */
export function BackToTopButton({ threshold = 480 }: { threshold?: number }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > threshold);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
      title="Back to top"
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
      className={`fixed bottom-8 right-6 z-40 inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/[0.08] bg-white text-[#111111] shadow-[0_8px_24px_-12px_rgba(0,0,0,0.35)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:text-[#FF5722] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5722] dark:border-white/[0.1] dark:bg-[#111111] dark:text-white dark:hover:text-[#FF5722] sm:right-10 ${
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0'
      }`}
    >
      <FontAwesomeIcon icon={faArrowUp} className="h-4 w-4" aria-hidden />
    </button>
  );
}
