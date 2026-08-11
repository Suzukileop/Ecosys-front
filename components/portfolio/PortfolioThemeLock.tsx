'use client';

import { useEffect } from 'react';

/** Portfolio is always shown in light mode — restore user theme when leaving the route. */
export function PortfolioThemeLock() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark');

    const observer = new MutationObserver(() => {
      if (root.classList.contains('dark')) {
        root.classList.remove('dark');
      }
    });
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });

    return () => {
      observer.disconnect();
      try {
        const stored = localStorage.getItem('lp-theme');
        if (!stored || stored === 'dark') root.classList.add('dark');
        else root.classList.remove('dark');
      } catch {
        root.classList.add('dark');
      }
    };
  }, []);

  return null;
}
