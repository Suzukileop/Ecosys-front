'use client';

import gsap from 'gsap';
import { useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import {
  FooterSocialLinkIcon,
  type EditorialContactLink,
} from '@/components/portfolio/portfolio-section-primitives';
import type { PortfolioContactPresentationSettings } from '@/components/portfolio/portfolio-contact-settings';

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

const DEFAULT_MARQUEE_TEXT = "Let's talk — Say hello — Reach out — ";
const MARQUEE_REPEATS = 6;

/** Curtain-reveal wrapper: masks its child in an overflow-hidden band, sliding it
 *  up from below on mount. Used for every large link in the right column. */
function CurtainLine({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const innerRef = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    const inner = innerRef.current;
    if (!inner || prefersReducedMotion()) return undefined;
    gsap.set(inner, { yPercent: 110 });
    const tween = gsap.to(inner, { yPercent: 0, duration: 0.9, ease: 'power3.out', delay });
    return () => {
      tween.kill();
    };
  }, [delay]);
  return (
    <span className="block overflow-hidden">
      <span ref={innerRef} className={`block ${className ?? ''}`}>
        {children}
      </span>
    </span>
  );
}

/** Magnetic hover — the element itself glides toward the cursor while hovered
 *  (proximity-based, not click-triggered), then springs back on leave. */
function useMagnetic(strength = 0.4, maxPx = 22) {
  const ref = useRef<HTMLElement | null>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (prefersReducedMotion()) return undefined;
    if (!window.matchMedia('(pointer: fine) and (min-width: 1024px)').matches) return undefined;

    const onMove = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const relX = event.clientX - (rect.left + rect.width / 2);
      const relY = event.clientY - (rect.top + rect.height / 2);
      const x = Math.max(-maxPx, Math.min(maxPx, relX * strength));
      const y = Math.max(-maxPx, Math.min(maxPx, relY * strength));
      gsap.to(el, { x, y, duration: 0.35, ease: 'power2.out', overwrite: 'auto' });
    };
    const onLeave = () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.4)', overwrite: 'auto' });
    };
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
    };
  }, [strength, maxPx]);
  return ref;
}

function SplitGridMarquee({ text, active }: { text: string; active: boolean }) {
  const rowRef = useRef<HTMLDivElement>(null);
  const loopRef = useRef<gsap.core.Tween | null>(null);
  const sequence = Array.from({ length: MARQUEE_REPEATS }, () => text).join('');

  useLayoutEffect(() => {
    const row = rowRef.current;
    if (!row || prefersReducedMotion()) return undefined;
    const first = row.firstElementChild as HTMLElement | null;
    const wrapWidth = first?.offsetWidth ?? 0;
    if (wrapWidth < 8) return undefined;
    gsap.set(row, { x: 0 });
    loopRef.current = gsap.to(row, { x: -wrapWidth, duration: wrapWidth / 90, ease: 'none', repeat: -1, paused: true });
    return () => {
      loopRef.current?.kill();
      loopRef.current = null;
    };
  }, [sequence]);

  useLayoutEffect(() => {
    const loop = loopRef.current;
    if (!loop) return;
    if (active) loop.play();
    else loop.pause();
  }, [active]);

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center overflow-hidden" aria-hidden>
      <div
        ref={rowRef}
        className="flex shrink-0 whitespace-nowrap text-[10vw] font-black uppercase leading-none tracking-tight transition-opacity duration-500"
        style={{ opacity: active ? 0.06 : 0, color: '#ffffff' }}
      >
        <span>{sequence}</span>
        <span>{sequence}</span>
      </div>
    </div>
  );
}

/**
 * Concept 2 — "Split grid": a broken, split-screen editorial grid with no physical
 * divider. A narrow left column carries the physical metadata (address, phone) under
 * micro-caps category labels; a wide right column carries the primary action — a
 * monumental clickable email and the social links — each wrapped in a curtain-reveal
 * mask and, on desktop, magnetically drawn toward the cursor. Hovering the email
 * fades in a faint, oversized looping marquee of a short call-to-action phrase behind
 * it. Collapses to a single-column, thumb-friendly stack under 768px with the email
 * as the central element and socials aligned in a row beneath it.
 */
export function ContactDesignSplitGrid({
  email,
  phone,
  locationLabel,
  links,
  presentation,
}: {
  email: string | null;
  phone: string | null;
  locationLabel: string | null;
  links: EditorialContactLink[];
  presentation: PortfolioContactPresentationSettings;
}) {
  const emailRef = useMagnetic(0.25, 26);
  const hoverRef = useRef<HTMLDivElement>(null);
  const [marqueeActive, setMarqueeActive] = useState(false);

  const marqueeText = presentation.premiumMarqueeText?.trim() || DEFAULT_MARQUEE_TEXT;
  const hasPhone = Boolean(phone?.trim());
  const hasLocation = Boolean(locationLabel?.trim());
  const hasLinks = links.length > 0;

  return (
    <div className="relative left-1/2 w-screen -translate-x-1/2 bg-black" data-pf-no-color-transition="">
      <div className="mx-auto grid w-full max-w-[90rem] grid-cols-1 gap-16 px-6 py-24 sm:px-10 sm:py-28 lg:min-h-[80vh] lg:grid-cols-[minmax(0,0.3fr)_minmax(0,0.7fr)] lg:items-center lg:gap-0 lg:px-16">
        <div className="flex flex-col gap-12 lg:pr-12">
          {hasLocation ? (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-neutral-600">Location</p>
              <p className="mt-3 text-base font-light text-neutral-300">{locationLabel}</p>
            </div>
          ) : null}
          {hasPhone ? (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-neutral-600">Call</p>
              <a href={`tel:${phone}`} className="mt-3 block text-base font-light text-neutral-300 hover:text-white">
                {phone}
              </a>
            </div>
          ) : null}
        </div>

        <div
          ref={hoverRef}
          className="relative flex flex-col items-center gap-10 text-center lg:items-end lg:gap-12 lg:text-right"
        >
          {email ? (
            <div className="relative w-full">
              <SplitGridMarquee text={marqueeText} active={marqueeActive} />
              <a
                ref={emailRef as RefObject<HTMLAnchorElement>}
                href={`mailto:${email}`}
                className="relative inline-block break-all text-[clamp(1.75rem,6vw,4.5rem)] font-medium leading-[0.95] tracking-tight text-white"
                onPointerEnter={() => setMarqueeActive(true)}
                onPointerLeave={() => setMarqueeActive(false)}
              >
                <CurtainLine>{email}</CurtainLine>
              </a>
            </div>
          ) : null}

          {hasLinks ? (
            <nav
              className="flex flex-wrap items-center justify-center gap-6 lg:justify-end"
              aria-label="Social"
            >
              {links.map((link, index) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-sm font-medium uppercase tracking-[0.08em] text-neutral-400 transition hover:text-white"
                >
                  <CurtainLine delay={0.05 * index} className="flex items-center gap-2">
                    <FooterSocialLinkIcon link={link} bare iconClassName="h-3.5 w-3.5" />
                    {link.label}
                  </CurtainLine>
                </a>
              ))}
            </nav>
          ) : null}
        </div>
      </div>
    </div>
  );
}
