'use client';

import gsap from 'gsap';
import { useLayoutEffect, useRef } from 'react';
import {
  FooterSocialLinkIcon,
  type EditorialContactLink,
} from '@/components/portfolio/portfolio-section-primitives';
import type { PortfolioContactPresentationSettings } from '@/components/portfolio/portfolio-contact-settings';

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

const DEFAULT_HEADLINE = "Let's build /\nSomething";

/**
 * Concept 1 — "Editorial focus": a monumental, asymmetric editorial composition on a
 * deep-black full-bleed canvas. Giant display headline on the left; the real contact
 * data (email / phone / location / socials) sits offset and unboxed on the right.
 * Hovering any one item snaps it to pure white while every other element on screen
 * dims to near-invisible with a soft blur — a depth-of-field focus pull. An immense,
 * ultra-faint radial glow drifts behind everything, chasing the cursor with a heavy
 * lag for a sense of 3D depth under the type. All of it is disabled on touch /
 * `prefers-reduced-motion`, and the whole composition collapses to a clean vertical
 * stack under 768px (no mouse-tracking, no blur — just generous breathing room).
 */
export function ContactDesignEditorialFocus({
  email,
  phone,
  locationLabel,
  links,
  ctaHref,
  presentation,
}: {
  email: string | null;
  phone: string | null;
  locationLabel: string | null;
  links: EditorialContactLink[];
  ctaHref: string;
  presentation: PortfolioContactPresentationSettings;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  const headlineLines = (presentation.editorialFocusHeadline?.trim() || DEFAULT_HEADLINE).split('\n');
  const accent = presentation.ctaColor?.trim() || '#f97316';
  const hasEmail = Boolean(email?.trim());
  const hasPhone = Boolean(phone?.trim());
  const hasLocation = Boolean(locationLabel?.trim());
  const hasLinks = links.length > 0;

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    if (prefersReducedMotion()) return undefined;
    const fine = window.matchMedia('(pointer: fine) and (min-width: 1024px)').matches;
    if (!fine) return undefined;

    const glow = glowRef.current;
    const items = Array.from(root.querySelectorAll<HTMLElement>('[data-focus-item]'));
    const baseColors = new Map<HTMLElement, string>();
    items.forEach((el) => baseColors.set(el, getComputedStyle(el).color));

    let onMove: ((event: PointerEvent) => void) | undefined;
    if (glow) {
      // Ambient glow — heavy inertia so it reads as depth drifting under the type,
      // never as a cursor-locked spotlight.
      const moveX = gsap.quickTo(glow, 'x', { duration: 1.3, ease: 'power3' });
      const moveY = gsap.quickTo(glow, 'y', { duration: 1.3, ease: 'power3' });
      onMove = (event) => {
        const rect = root.getBoundingClientRect();
        moveX(event.clientX - rect.left);
        moveY(event.clientY - rect.top);
      };
      root.addEventListener('pointermove', onMove, { passive: true });
    }

    const onEnter = (target: HTMLElement) => {
      items.forEach((el) => {
        if (el === target) {
          gsap.to(el, { opacity: 1, filter: 'blur(0px)', color: '#ffffff', duration: 0.4, ease: 'power2.out', overwrite: 'auto' });
        } else {
          gsap.to(el, { opacity: 0.1, filter: 'blur(1.5px)', duration: 0.4, ease: 'power2.out', overwrite: 'auto' });
        }
      });
    };
    const onLeaveAll = () => {
      items.forEach((el) => {
        gsap.to(el, {
          opacity: 1,
          filter: 'blur(0px)',
          color: baseColors.get(el),
          duration: 0.5,
          ease: 'power2.out',
          overwrite: 'auto',
        });
      });
    };
    const enterHandlers = items.map((el) => {
      const enter = () => onEnter(el);
      el.addEventListener('pointerenter', enter);
      return enter;
    });
    root.addEventListener('pointerleave', onLeaveAll);

    return () => {
      if (onMove) root.removeEventListener('pointermove', onMove);
      items.forEach((el, i) => el.removeEventListener('pointerenter', enterHandlers[i]));
      root.removeEventListener('pointerleave', onLeaveAll);
    };
  }, []);

  const itemClass =
    'block text-2xl font-light tracking-tight text-neutral-400 transition-colors sm:text-3xl';

  return (
    <div
      ref={rootRef}
      className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden bg-black"
      data-pf-no-color-transition=""
    >
      <div
        ref={glowRef}
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 h-[70vmax] w-[70vmax] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0 lg:opacity-100"
        style={{
          background: `radial-gradient(circle, ${accent} 0%, transparent 65%)`,
          filter: 'blur(40px)',
        }}
      />

      <div className="relative mx-auto flex w-full max-w-[90rem] flex-col gap-16 px-6 py-24 sm:px-10 sm:py-32 lg:min-h-[85vh] lg:flex-row lg:items-center lg:gap-8 lg:px-16">
        <div className="min-w-0 lg:w-[52%]">
          <p
            className="font-serif text-[clamp(2.75rem,9vw,7rem)] font-medium uppercase leading-[0.9] tracking-[-0.02em] text-white"
            data-focus-item
          >
            {headlineLines.map((line, index) => (
              <span key={index} className="block">
                {line}
              </span>
            ))}
          </p>
        </div>

        <div className="min-w-0 lg:w-[48%]">
          <div className="flex flex-col gap-10 sm:gap-12 lg:items-end lg:text-right">
            {hasEmail ? (
              <div className="lg:translate-x-[4vw]">
                <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-neutral-600">Email</p>
                <a href={`mailto:${email}`} className={`${itemClass} mt-2 break-all hover:text-white`} data-focus-item>
                  {email}
                </a>
              </div>
            ) : null}

            {hasPhone ? (
              <div className="lg:translate-x-[1vw] lg:translate-y-[2vh]">
                <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-neutral-600">Phone</p>
                <a href={`tel:${phone}`} className={`${itemClass} mt-2 hover:text-white`} data-focus-item>
                  {phone}
                </a>
              </div>
            ) : null}

            {hasLocation ? (
              <div className="lg:translate-x-[6vw] lg:translate-y-[1vh]">
                <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-neutral-600">Address</p>
                <span className={`${itemClass} mt-2`} data-focus-item>
                  {locationLabel}
                </span>
              </div>
            ) : null}

            {hasLinks ? (
              <div className="lg:translate-x-[2vw] lg:translate-y-[3vh]">
                <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-neutral-600">Social</p>
                <nav className="mt-3 flex flex-wrap items-center gap-5 lg:justify-end" aria-label="Social">
                  {links.map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className={`${itemClass} mt-0 flex items-center gap-2 text-lg hover:text-white sm:text-xl`}
                      data-focus-item
                    >
                      <FooterSocialLinkIcon link={link} bare iconClassName="h-4 w-4" />
                      {link.label}
                    </a>
                  ))}
                </nav>
              </div>
            ) : null}

            {!hasEmail && !hasPhone && !hasLocation && !hasLinks ? (
              <a
                href={ctaHref}
                className={`${itemClass} hover:text-white`}
                data-focus-item
              >
                Get in touch →
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
