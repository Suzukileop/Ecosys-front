'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image from 'next/image';
import { useLayoutEffect, useMemo, useRef } from 'react';
import {
  DEFAULT_CONTENT_GUTTER,
  portfolioEditorialGutterX,
  type PortfolioContentGutter,
} from '@/components/portfolio/portfolio-editorial-layout';
import type { ContactDesignLayoutResolver } from '@/components/portfolio/portfolio-contact-design-layout';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

const DEFAULT_TITLE = "Let's talk";

/**
 * Concept 5 — "Studio overlap": an asymmetric, theatrical two-column composition — a
 * monumental headline and stacked contact blocks on the left, a full-bleed vertical
 * portrait on the right. Hovering a contact link snaps it to full ink on its own, without
 * affecting any other element; the portrait drifts on a slow horizontal scroll parallax; a massive down
 * arrow idles with a gentle infinite bob. This was the first of the premium Contact designs
 * to be genuinely light/dark aware — every other one now follows the same recipe (see
 * contactLightDarkTokens() in portfolio-contact-design-motion.ts) — mirroring the portfolio's own
 * active `settings.global.colorMode` (pure white / pure black, synced text). Below 768px
 * the two-column grid collapses to a single edge-to-edge flow, reordered via CSS grid
 * `order` (no separate mobile tree) so the image sits right under the title.
 */
export function ContactDesignStudioOverlap({
  email,
  phone,
  locationLabel,
  heroImageUrl,
  heroImageAlt,
  sectionTitle,
  contentGutter = DEFAULT_CONTENT_GUTTER,
  colorMode,
  layout,
}: {
  email: string | null;
  phone: string | null;
  locationLabel: string | null;
  heroImageUrl: string | null;
  heroImageAlt: string;
  sectionTitle?: string;
  /** Same site-wide editorial gutter every other section respects — this design is
   *  full-bleed (bypasses PortfolioSectionShell), so it needs it passed in explicitly. */
  contentGutter?: PortfolioContentGutter;
  /** The portfolio's real active appearance (settings.global.colorMode) — used to keep
   *  text/ink legible; the canvas fill itself comes from the Contact section's own
   *  Background tab, painted by the wrapping <section> in portfolio-section-primitives.tsx. */
  colorMode: 'light' | 'dark';
  layout: ContactDesignLayoutResolver;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLDivElement>(null);

  const isLight = colorMode === 'light';
  const ink = isLight ? '#0a0a0a' : '#ffffff';
  const muted = isLight ? '#8f8f8f' : '#7d7d7d';
  const labelInk = isLight ? 'rgba(10,10,10,0.42)' : 'rgba(255,255,255,0.42)';
  const placeholderBg = isLight ? '#ededed' : '#141414';

  const title = layout.text('title') || sectionTitle?.trim() || DEFAULT_TITLE;
  const trimmedEmail = email?.trim() || '';
  const trimmedPhone = phone?.trim() || '';
  const trimmedLocation = locationLabel?.trim() || '';
  const hasEnquiries = Boolean(trimmedEmail || trimmedPhone);
  const hasAddress = Boolean(trimmedLocation);
  const showPortrait = layout.isVisible('portrait');
  const showArrow = layout.isVisible('arrow');
  const enquiriesHeading = layout.text('enquiriesLabel');
  const addressHeading = layout.text('addressLabel');
  const displayName = heroImageAlt?.trim() || '';
  const initials = useMemo(() => {
    const parts = displayName.split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
  }, [displayName]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    if (prefersReducedMotion()) return undefined;

    let ctx: gsap.Context | undefined;
    try {
      ctx = gsap.context(() => {
        // Hover accent — every element here starts, and stays, fully visible; GSAP only
        // ever adjusts the directly-hovered link's own color, never any sibling's.
        const linkTargets = Array.from(root.querySelectorAll<HTMLElement>('[data-studio-link]'));
        const linkBaseColors = new Map<HTMLElement, string>();
        linkTargets.forEach((el) => linkBaseColors.set(el, getComputedStyle(el).color));

        const linkHandlers = linkTargets.map((el) => {
          const onEnter = () => {
            gsap.to(el, { color: ink, duration: 0.3, ease: 'power2.out', overwrite: 'auto' });
          };
          const onLeave = () => {
            gsap.to(el, { color: linkBaseColors.get(el), duration: 0.3, ease: 'power2.out', overwrite: 'auto' });
          };
          el.addEventListener('pointerenter', onEnter);
          el.addEventListener('pointerleave', onLeave);
          return { el, onEnter, onLeave };
        });

        // Idle arrow — gentle infinite bob, always on regardless of scroll position.
        const arrow = arrowRef.current;
        if (arrow) {
          gsap.to(arrow, { y: 10, duration: 1.4, ease: 'sine.inOut', repeat: -1, yoyo: true });
        }

        // Slow horizontal parallax on the portrait — continuous scrub, self-corrects on
        // every scroll tick, so it can't get stuck in a wrong state the way a one-shot
        // "enter" toggle can.
        const image = imageRef.current;
        if (image) {
          gsap.fromTo(
            image,
            { xPercent: -3 },
            {
              xPercent: 3,
              ease: 'none',
              scrollTrigger: { trigger: root, start: 'top bottom', end: 'bottom top', scrub: 0.8 },
            }
          );
        }

        return () => {
          linkHandlers.forEach(({ el, onEnter, onLeave }) => {
            el.removeEventListener('pointerenter', onEnter);
            el.removeEventListener('pointerleave', onLeave);
          });
        };
      }, root);
    } catch (error) {
      // Same containment as the other premium Contact designs — see
      // portfolio-header-mechanism-rollout / contact-premium-designs: an uncaught GSAP/
      // ScrollTrigger init error here would otherwise crash the whole React tree.
      console.error('[ContactDesignStudioOverlap] GSAP failed to initialize', error);
      ctx?.revert();
    }

    const refreshId = window.setTimeout(() => {
      try {
        ScrollTrigger.refresh();
      } catch (error) {
        console.error('[ContactDesignStudioOverlap] deferred ScrollTrigger.refresh() failed', error);
      }
    }, 80);
    return () => {
      window.clearTimeout(refreshId);
      ctx?.revert();
    };
  }, [ink, showPortrait, showArrow]);

  const itemClass = 'transition-none';

  return (
    <div
      ref={rootRef}
      className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden"
      data-pf-no-color-transition=""
    >
      <div
        className={`grid w-full grid-cols-1 gap-y-14 py-16 sm:py-20 ${showPortrait ? 'md:grid-cols-2' : 'md:grid-cols-1'} md:grid-rows-[auto_1fr_auto] md:items-stretch md:gap-x-16 md:py-0 ${portfolioEditorialGutterX(contentGutter)}`}
      >
        <h2
          className={`order-1 m-0 select-none font-sans text-[clamp(3rem,10vw,6.5rem)] font-black leading-[0.88] tracking-[-0.03em] md:order-1 md:col-start-1 md:row-start-1 md:pt-20`}
          style={{ color: ink }}
        >
          {title}
        </h2>

        {showPortrait ? (
        <div
          className="relative order-2 aspect-[4/5] w-full overflow-hidden sm:aspect-[3/2] md:order-2 md:col-start-2 md:row-start-1 md:row-span-3 md:aspect-auto md:min-h-[70vh]"
          data-pf-no-color-transition=""
        >
          <div ref={imageRef} className="absolute -inset-x-10 inset-y-0" data-pf-no-color-transition="">
            {heroImageUrl ? (
              <Image
                src={heroImageUrl}
                alt={displayName ? `Portrait of ${displayName}` : 'Portrait'}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover object-center"
              />
            ) : (
              <div
                className="flex h-full w-full items-center justify-center"
                style={{ backgroundColor: placeholderBg }}
              >
                <span className="font-sans text-6xl font-semibold" style={{ color: muted }} aria-hidden>
                  {initials || '—'}
                </span>
              </div>
            )}
          </div>
        </div>
        ) : null}

        <div className="order-3 flex flex-col gap-10 md:order-3 md:col-start-1 md:row-start-2 md:self-center">
          {hasEnquiries ? (
            <div>
              {enquiriesHeading ? (
                <p
                  className={`m-0 mb-3 ${itemClass} text-[11px] font-semibold uppercase tracking-[0.28em]`}
                  style={{ color: labelInk }}
                >
                  {enquiriesHeading}
                </p>
              ) : null}
              <div className="flex flex-col gap-1.5">
                {trimmedEmail ? (
                  <a
                    href={`mailto:${trimmedEmail}`}
                    data-studio-link
                    data-pf-no-color-transition=""
                    className={`${itemClass} break-all text-[clamp(1.1rem,2.4vw,1.5rem)] font-medium`}
                    style={{ color: muted }}
                  >
                    {trimmedEmail}
                  </a>
                ) : null}
                {trimmedPhone ? (
                  <a
                    href={`tel:${trimmedPhone.replace(/\s+/g, '')}`}
                    data-studio-link
                    data-pf-no-color-transition=""
                    className={`${itemClass} text-[clamp(1.1rem,2.4vw,1.5rem)] font-medium`}
                    style={{ color: muted }}
                  >
                    {trimmedPhone}
                  </a>
                ) : null}
              </div>
            </div>
          ) : null}

          {hasAddress ? (
            <div>
              {addressHeading ? (
                <p
                  className={`m-0 mb-3 ${itemClass} text-[11px] font-semibold uppercase tracking-[0.28em]`}
                  style={{ color: labelInk }}
                >
                  {addressHeading}
                </p>
              ) : null}
              <p
                className={`max-w-xs ${itemClass} text-[clamp(1.05rem,2vw,1.3rem)] font-medium leading-snug`}
                style={{ color: muted }}
              >
                {trimmedLocation}
              </p>
            </div>
          ) : null}
        </div>

        {showArrow ? (
        <div
          ref={arrowRef}
          aria-hidden
          className="order-4 w-fit md:order-4 md:col-start-1 md:row-start-3 md:pb-16"
        >
          <svg viewBox="0 0 40 56" className="h-12 w-9 sm:h-14 sm:w-10">
            <path
              d="M20 2V50M20 50L4 34M20 50L36 34"
              stroke={ink}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </div>
        ) : null}
      </div>
    </div>
  );
}
