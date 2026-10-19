'use client';

import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp } from '@fortawesome/free-solid-svg-icons';
import { useT } from '@/lib/i18n/I18nProvider';

/** Floating bottom-right control that appears once the window has scrolled past `threshold`. */
export function BackToTopButton({ threshold = 480 }: { threshold?: number }) {
  const t = useT();
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
      aria-label={t('Back to top')}
      title={t('Back to top')}
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
      className={`fixed bottom-8 right-6 z-40 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#0F1419] shadow-[0_0_0_1px_rgba(15,20,25,0.06),0_8px_24px_-10px_rgba(15,20,25,0.35)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:bg-[#F7F9F9] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#0F1419]/35 dark:bg-black dark:text-[#E7E9EA] dark:shadow-[0_0_0_1px_#2F3336] dark:hover:bg-[#16181C] dark:focus-visible:ring-[#E7E9EA]/45 sm:right-10 ${
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0'
      }`}
    >
      <FontAwesomeIcon icon={faArrowUp} className="h-4 w-4" aria-hidden />
    </button>
  );
}
