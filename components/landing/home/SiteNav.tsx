'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CONTAINER } from '@/components/landing/home/shared';
import { useT } from '@/lib/i18n/I18nProvider';
import { msg } from '@/lib/i18n/config';

/*
 * One timing for every change in the bar (show/hide, backing, ink), so it all moves together.
 * No reduced-motion variant class here: globals.css drops transitions on any element whose class
 * contains "motion"; reduced motion is handled there, under [data-landing-nav].
 */
const NAV_MOTION = 'duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]';

const NAV_LINKS = [
  { href: '#how-it-works', label: msg('How it works') },
  { href: '#templates', label: msg('Designs') },
  { href: '#pricing', label: msg('Pricing') },
  { href: '#faq', label: msg('FAQ') },
  { href: '/providers', label: msg('Find a provider') },
] as const;

export function Wordmark({ className = '', onDark = false }: { className?: string; onDark?: boolean }) {
  return (
    <Link
      href="/"
      className={`inline-flex items-end text-[18px] font-semibold tracking-[-0.03em] transition-colors ${NAV_MOTION} ${
        onDark ? 'text-white' : 'text-[#111111]'
      } ${className}`}
    >
      Skraft
      <span aria-hidden className="mb-[5px] ml-0.5 h-[5px] w-[5px] rounded-full bg-[#FF5722]" />
    </Link>
  );
}

export function SiteNav() {
  const t = useT();
  const [menuOpen, setMenuOpen] = useState(false);
  const [overDark, setOverDark] = useState(true);
  const [atTop, setAtTop] = useState(true);
  const [hidden, setHidden] = useState(false);
  /* Its ink follows the section underneath (sections marked `data-nav-dark` get white ink). The open mobile menu is light. */
  const onDark = !menuOpen && overDark;

  /*
   * Headroom: hides while you scroll down to read, comes back as soon as you scroll up (the
   * moment you want to navigate). Transparent at the top of the page; once revealed further
   * down it gets a frosted backing so the links stay legible over content.
   */
  useEffect(() => {
    let lastY = window.scrollY;
    const update = () => {
      const y = window.scrollY;
      const delta = y - lastY;
      setAtTop(y < 24);
      if (y < 80) setHidden(false);
      /* A small dead zone, so trackpad jitter doesn't make the bar flicker. */
      else if (Math.abs(delta) > 6) setHidden(delta > 0);
      if (Math.abs(delta) > 6 || y < 80) lastY = y;

      /* The bar's vertical middle (h-14 → 28px). */
      const mid = 28;
      setOverDark(
        Array.from(document.querySelectorAll<HTMLElement>('[data-nav-dark]')).some((el) => {
          const rect = el.getBoundingClientRect();
          return rect.top <= mid && rect.bottom > mid;
        }),
      );
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const root = document.documentElement;
    root.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      root.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  return (
    <>
      <header
        data-landing-nav
        /* Keyboard users tabbing back into the bar always get it on screen. */
        onFocusCapture={() => setHidden(false)}
        className={`fixed inset-x-0 top-0 z-50 transition-[transform,background-color,backdrop-filter] ${NAV_MOTION} ${
          hidden && !menuOpen ? '-translate-y-full' : 'translate-y-0'
        } ${
          atTop || menuOpen
            ? 'bg-transparent backdrop-blur-0'
            : onDark
              ? 'bg-[#0B0B0B]/70 backdrop-blur-xl'
              : 'bg-white/75 backdrop-blur-xl'
        }`}
      >
        <nav className={`${CONTAINER} flex h-14 items-center justify-between gap-6`} aria-label={t('Main')}>
          <Wordmark onDark={onDark} />

          <ul className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className={`inline-flex h-10 items-center whitespace-nowrap px-3 text-[15px] transition-colors xl:px-4 ${NAV_MOTION} ${
                    onDark ? 'text-white/70 hover:text-white' : 'text-neutral-600 hover:text-[#111111]'
                  }`}
                >
                  {t(link.label)}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/login"
              className={`hidden h-10 items-center px-3 text-[14px] font-medium transition-[color,opacity] hover:opacity-60 sm:inline-flex ${NAV_MOTION} ${
                onDark ? 'text-white' : 'text-[#111111]'
              }`}
            >
              {t('Log in')}
            </Link>
            <Link
              href="/register"
              className={`hidden h-10 items-center rounded-full px-5 text-[14px] font-medium transition-colors sm:inline-flex ${NAV_MOTION} ${
                onDark ? 'bg-white text-[#111111] hover:bg-neutral-100' : 'bg-[#111111] text-white hover:bg-black'
              }`}
            >
              {t('Get started')}
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-controls="landing-mobile-menu"
              aria-label={menuOpen ? t('Close menu') : t('Open menu')}
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-full lg:hidden"
            >
              <span
                className={`absolute h-px w-5 transition-[background-color,transform] ${NAV_MOTION} ${onDark ? 'bg-white' : 'bg-[#111111]'} ${
                  menuOpen ? 'rotate-45' : '-translate-y-[4px]'
                }`}
              />
              <span
                className={`absolute h-px w-5 transition-[background-color,transform] ${NAV_MOTION} ${onDark ? 'bg-white' : 'bg-[#111111]'} ${
                  menuOpen ? '-rotate-45' : 'translate-y-[4px]'
                }`}
              />
            </button>
          </div>
        </nav>
      </header>

      {menuOpen ? (
        <div
          id="landing-mobile-menu"
          className="fixed inset-0 z-40 flex animate-[landing-menu-in_0.35s_cubic-bezier(0.22,1,0.36,1)] flex-col bg-white px-6 pb-10 pt-28 lg:hidden"
        >
          <ul className="flex flex-col">
            {NAV_LINKS.map((link, i) => (
              <li key={link.href} className="border-b border-black/[0.08]">
                <a
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between py-4 text-[24px] font-medium tracking-[-0.02em] text-[#111111]"
                >
                  {t(link.label)}
                  <span className="font-mono text-[12px] font-normal text-neutral-400">0{i + 1}</span>
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-auto grid grid-cols-2 gap-3">
            <Link
              href="/login"
              className="inline-flex h-12 items-center justify-center rounded-full border border-black/[0.12] text-[15px] font-medium text-[#111111]"
            >
              {t('Log in')}
            </Link>
            <Link
              href="/register"
              className="inline-flex h-12 items-center justify-center rounded-full bg-[#111111] text-[15px] font-medium text-white"
            >
              {t('Get started')}
            </Link>
          </div>
        </div>
      ) : null}
    </>
  );
}
