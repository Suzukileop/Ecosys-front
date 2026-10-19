'use client';

import { useEffect } from 'react';
import { PORTFOLIO_STUDIO_PREVIEW_SOURCE } from '@/lib/portfolio-studio-preview';
import { PORTFOLIO_SETTINGS_SECTIONS } from '@/components/portfolio/portfolio-settings-types';

/*
 * Click-to-edit inside the studio's live preview (the page runs in an iframe). While the studio's
 * Settings are open, the parent turns this on: hovering a section draws an outline around it with its
 * name, and clicking it tells the studio to open that section's settings — the gesture every site
 * editor has (Shopify, Webflow, Framer). The click is consumed, so a link or a button in the page does
 * not fire while editing. Off (Settings closed), the page behaves exactly like the live site.
 *
 * Sections are found the way "scroll to section" finds them: by their DOM id (hero, stack, info, work,
 * tools, services, aboutUs, experience, team, gallery, faq, contact, footer); the navigation by its
 * clearance box. Global (theme) has no block of its own, so it is never picked here.
 */

const NAV_SELECTOR = '[data-portfolio-nav-clearance-box]';
const OUTLINE = '#1D9BF0';

const SECTION_LABELS = new Map(PORTFOLIO_SETTINGS_SECTIONS.map((section) => [section.id as string, section.label]));
const BLOCK_SECTION_IDS = new Set(
  PORTFOLIO_SETTINGS_SECTIONS.map((section) => section.id as string).filter((id) => id !== 'theme' && id !== 'navigation')
);

function resolveSection(target: EventTarget | null): { element: HTMLElement; id: string } | null {
  if (!(target instanceof Element)) return null;
  const nav = target.closest<HTMLElement>(NAV_SELECTOR);
  if (nav) return { element: nav, id: 'navigation' };
  let node: HTMLElement | null = target instanceof HTMLElement ? target : target.parentElement;
  while (node && node !== document.body) {
    if (node.id && BLOCK_SECTION_IDS.has(node.id)) return { element: node, id: node.id };
    node = node.parentElement;
  }
  return null;
}

function sectionById(id: string | null): { element: HTMLElement; id: string } | null {
  if (!id) return null;
  if (id === 'navigation') {
    const element = document.querySelector<HTMLElement>(NAV_SELECTOR);
    return element ? { element, id } : null;
  }
  if (!BLOCK_SECTION_IDS.has(id)) return null;
  const element = document.getElementById(id);
  return element ? { element, id } : null;
}

export function usePortfolioStudioInspect({
  enabled,
  activeSectionId,
}: {
  enabled: boolean;
  activeSectionId?: string | null;
}) {
  useEffect(() => {
    if (!enabled || typeof document === 'undefined') return;

    const box = document.createElement('div');
    box.setAttribute('aria-hidden', 'true');
    Object.assign(box.style, {
      position: 'fixed',
      zIndex: '2147483646',
      pointerEvents: 'none',
      display: 'none',
      boxShadow: `inset 0 0 0 2px ${OUTLINE}`,
      background: 'rgba(29, 155, 240, 0.025)',
      transition: 'top 120ms ease, left 120ms ease, width 120ms ease, height 120ms ease',
    } satisfies Partial<CSSStyleDeclaration>);
    const tag = document.createElement('div');
    Object.assign(tag.style, {
      position: 'absolute',
      left: '0',
      padding: '3px 8px',
      borderRadius: '0 0 6px 0',
      background: OUTLINE,
      color: '#FFFFFF',
      font: '600 12px/16px Inter, ui-sans-serif, system-ui, sans-serif',
      whiteSpace: 'nowrap',
    } satisfies Partial<CSSStyleDeclaration>);
    box.appendChild(tag);
    document.body.appendChild(box);

    let current: { element: HTMLElement; id: string } | null = sectionById(activeSectionId ?? null);

    const place = () => {
      if (!current || !current.element.isConnected) {
        box.style.display = 'none';
        return;
      }
      const rect = current.element.getBoundingClientRect();
      const top = Math.max(0, rect.top);
      const bottom = Math.min(window.innerHeight, rect.bottom);
      if (bottom <= top) {
        box.style.display = 'none';
        return;
      }
      box.style.display = 'block';
      box.style.top = `${top}px`;
      box.style.left = `${Math.max(0, rect.left)}px`;
      box.style.width = `${Math.min(window.innerWidth, rect.right) - Math.max(0, rect.left)}px`;
      box.style.height = `${bottom - top}px`;
      tag.style.top = '0';
      tag.textContent = SECTION_LABELS.get(current.id) ?? current.id;
    };

    const onMove = (event: MouseEvent) => {
      const hit = resolveSection(event.target) ?? sectionById(activeSectionId ?? null);
      if (hit?.element === current?.element) return;
      current = hit;
      place();
    };
    const onLeave = () => {
      current = sectionById(activeSectionId ?? null);
      place();
    };
    const onClick = (event: MouseEvent) => {
      const hit = resolveSection(event.target);
      if (!hit) return;
      event.preventDefault();
      event.stopPropagation();
      window.parent.postMessage(
        { source: PORTFOLIO_STUDIO_PREVIEW_SOURCE, type: 'select-section', sectionId: hit.id },
        window.location.origin
      );
    };

    document.addEventListener('mousemove', onMove, { passive: true });
    document.documentElement.addEventListener('mouseleave', onLeave);
    document.addEventListener('click', onClick, true);
    window.addEventListener('scroll', place, { passive: true });
    window.addEventListener('resize', place);
    requestAnimationFrame(place);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.documentElement.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('click', onClick, true);
      window.removeEventListener('scroll', place);
      window.removeEventListener('resize', place);
      box.remove();
    };
  }, [enabled, activeSectionId]);
}
