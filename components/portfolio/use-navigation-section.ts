'use client';

import { useEffect, useState } from 'react';

/** Follow the section behind fixed navigation, not the middle of the viewport. */
export function useNavigationSection(sectionIds: string[], enabled: boolean) {
  const [active, setActive] = useState('hero');
  useEffect(() => {
    if (!enabled) return;
    let frame = 0;
    const measure = () => {
      frame = 0;
      const chrome = document.querySelector<HTMLElement>('[data-portfolio-nav-clearance-box]');
      const nav = chrome?.getBoundingClientRect();
      const probe = nav && nav.top < innerHeight / 2 ? Math.max(1, nav.top + nav.height / 2) : 48;
      const sections = sectionIds.map(id => ({ id, node: document.getElementById(id) }))
        .filter(entry => entry.node && entry.node.getBoundingClientRect().height > 0);
      const behind = sections.find(({ node }) => {
        const rect = node!.getBoundingClientRect();
        return rect.top <= probe && rect.bottom > probe;
      });
      const nearest = behind ?? sections.find(({ node }) => node!.getBoundingClientRect().bottom > probe);
      if (nearest) setActive(previous => previous === nearest.id ? previous : nearest.id);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(measure); };
    schedule();
    window.addEventListener('scroll', schedule, { passive: true, capture: true });
    window.addEventListener('resize', schedule, { passive: true });
    const observer = new ResizeObserver(schedule);
    observer.observe(document.body);
    const mutations = new MutationObserver(schedule);
    mutations.observe(document.body, { childList: true, subtree: true });
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect(); mutations.disconnect();
      window.removeEventListener('scroll', schedule, true);
      window.removeEventListener('resize', schedule);
    };
  }, [enabled, sectionIds]);
  return active;
}
