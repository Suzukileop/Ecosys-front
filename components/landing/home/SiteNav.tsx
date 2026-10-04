'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CONTAINER } from '@/components/landing/home/shared';

const NAV_LINKS = [
  { href: '#product', label: 'Product' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#faq', label: 'FAQ' },
] as const;

export function Wordmark({ className = '', onDark = false }: { className?: string; onDark?: boolean }) {
  return (
    <Link
      href="/"
      className={`inline-flex items-end text-[18px] font-semibold tracking-[-0.03em] ${
        onDark ? 'text-white' : 'text-[#111111]'
      } ${className}`}
    >
      Skraft
      <span aria-hidden className="mb-[5px] ml-0.5 h-[5px] w-[5px] rounded-full bg-[#FF5722]" />
    </Link>
  );
}

export function SiteNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  /* Only shown while the hero is on screen; only the open mobile menu is light. */
  const onDark = !menuOpen;

  useEffect(() => {
    const onScroll = () => {
      const hero = document.querySelector<HTMLElement>('[data-landing-hero]');
      setHidden(hero ? hero.getBoundingClientRect().bottom <= 56 : false);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
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
        className={`fixed inset-x-0 top-0 z-50 transition-transform duration-300 ease-out ${
          hidden && !menuOpen ? '-translate-y-full' : 'translate-y-0'
        }`}
      >
        <nav className={`${CONTAINER} flex h-14 items-center justify-between gap-6`} aria-label="Main">
          <Wordmark onDark={onDark} />

          <ul className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="inline-flex h-10 items-center px-4 text-[14px] text-white/70 hover:text-white"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/login"
              className="hidden h-10 items-center px-3 text-[14px] font-medium text-white hover:opacity-60 sm:inline-flex"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="hidden h-10 items-center rounded-full bg-white px-5 text-[14px] font-medium text-[#111111] hover:bg-neutral-100 sm:inline-flex"
            >
              Get started
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-controls="landing-mobile-menu"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-full md:hidden"
            >
              <span
                className={`absolute h-px w-5 ${onDark ? 'bg-white' : 'bg-[#111111]'} ${
                  menuOpen ? 'rotate-45' : '-translate-y-[4px]'
                }`}
              />
              <span
                className={`absolute h-px w-5 ${onDark ? 'bg-white' : 'bg-[#111111]'} ${
                  menuOpen ? '-rotate-45' : 'translate-y-[4px]'
                }`}
              />
            </button>
          </div>
        </nav>
      </header>

      {menuOpen ? (
        <div id="landing-mobile-menu" className="fixed inset-0 z-40 flex flex-col bg-white px-6 pb-10 pt-28 md:hidden">
          <ul className="flex flex-col">
            {NAV_LINKS.map((link, i) => (
              <li key={link.href} className="border-b border-black/[0.08]">
                <a
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between py-5 text-[32px] font-semibold tracking-[-0.03em] text-[#111111]"
                >
                  {link.label}
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
              Log in
            </Link>
            <Link
              href="/register"
              className="inline-flex h-12 items-center justify-center rounded-full bg-[#111111] text-[15px] font-medium text-white"
            >
              Get started
            </Link>
          </div>
        </div>
      ) : null}
    </>
  );
}
