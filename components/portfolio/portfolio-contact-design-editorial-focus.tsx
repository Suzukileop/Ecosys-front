'use client';

import gsap from 'gsap';
import { useLayoutEffect, useRef } from 'react';
import {
  FooterSocialLinkIcon,
  type EditorialContactLink,
} from '@/components/portfolio/portfolio-section-primitives';
import type { ContactDesignLayoutResolver } from '@/components/portfolio/portfolio-contact-design-layout';
import {
  prefersReducedMotion,
  revealOnceVisible,
  runContactDesignMotion,
} from '@/components/portfolio/portfolio-contact-design-motion';
import {
  DEFAULT_CONTENT_GUTTER,
  portfolioEditorialGutterX,
  type PortfolioContentGutter,
} from '@/components/portfolio/portfolio-editorial-layout';

/**
 * Concept 1 — "Editorial focus": a monumental, asymmetric editorial composition on a
 * deep-black full-bleed canvas (or the Contact section's own Background image/fill, painted
 * by the wrapping <section> in portfolio-section-primitives.tsx). Giant display headline on
 * the left; the real contact data (email /
 * phone / location / socials) sits offset and unboxed on the right, each link brightening
 * to pure white on its own hover, without affecting any other element. No decorative glow
 * behind the type anymore — it used to chase the cursor and, even pinned static, still
 * read as an unwanted blotch over the background; removed entirely per feedback. The
 * headline gets a one-time entrance reveal instead — each line fades and lifts in on
 * scroll-into-view, never re-triggered by hover. Disabled on `prefers-reduced-motion`;
 * the whole composition collapses to a clean vertical stack under 768px.
 */
export function ContactDesignEditorialFocus({
  email,
  phone,
  locationLabel,
  links,
  ctaHref,
  layout,
  contentGutter = DEFAULT_CONTENT_GUTTER,
}: {
  email: string | null;
  phone: string | null;
  locationLabel: string | null;
  links: EditorialContactLink[];
  ctaHref: string;
  layout: ContactDesignLayoutResolver;
  /** Same site-wide editorial gutter every other section respects — this design is
   *  full-bleed (bypasses PortfolioSectionShell), so it needs it passed in explicitly. */
  contentGutter?: PortfolioContentGutter;
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  const headlineLines = (layout.text('headline') ?? '').split('\n');
  const emailHeading = layout.text('emailLabel');
  const phoneHeading = layout.text('phoneLabel');
  const addressHeading = layout.text('addressLabel');
  const socialHeading = layout.text('socialLabel');
  const hasEmail = Boolean(email?.trim());
  const hasPhone = Boolean(phone?.trim());
  const hasLocation = Boolean(locationLabel?.trim());
  const hasLinks = links.length > 0;

  // One-time entrance reveal on the headline — each line fades and lifts in on
  // scroll-into-view. Deliberately NOT hover-triggered (a mouse-reactive version of this
  // design previously chased the cursor with a background glow and read as disturbing
  // rather than premium; the glow itself was removed entirely, not just detached from
  // the cursor — even pinned static it still read as an unwanted blotch).
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    if (prefersReducedMotion()) return undefined;

    return runContactDesignMotion(
      root,
      'ContactDesignEditorialFocus',
      (observers) => {
        const lines = Array.from(root.querySelectorAll<HTMLElement>('[data-editorialfocus-line]'));
        if (!lines.length) return;
        gsap.set(lines, { opacity: 0, y: 28 });
        revealOnceVisible(observers, root, 80, () =>
          gsap.to(lines, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.1, overwrite: 'auto' })
        );
      },
      '[data-editorialfocus-line]'
    );
  }, []);

  const itemClass =
    'block text-2xl font-light tracking-tight text-neutral-400 transition-colors sm:text-3xl';

  return (
    <div
      ref={rootRef}
      className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden"
      data-pf-no-color-transition=""
    >
      <div
        className={`relative mx-auto flex w-full max-w-[90rem] flex-col gap-16 py-24 sm:py-32 lg:min-h-[85vh] lg:flex-row lg:items-center lg:gap-8 ${portfolioEditorialGutterX(contentGutter)}`}
      >
        <div className="min-w-0 lg:w-[52%]">
          <p className="font-serif text-[clamp(2.75rem,9vw,7rem)] font-medium uppercase leading-[0.9] tracking-[-0.02em] text-white">
            {headlineLines.map((line, index) => (
              <span key={index} data-editorialfocus-line className="block">
                {line}
              </span>
            ))}
          </p>
        </div>

        <div className="min-w-0 lg:w-[48%]">
          <div className="flex flex-col gap-10 sm:gap-12 lg:items-end lg:text-right">
            {hasEmail ? (
              <div>
                {emailHeading ? (
                  <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-neutral-600">{emailHeading}</p>
                ) : null}
                <a href={`mailto:${email}`} className={`${itemClass} mt-2 break-all hover:text-white`}>
                  {email}
                </a>
              </div>
            ) : null}

            {hasPhone ? (
              <div className="lg:translate-y-[2vh]">
                {phoneHeading ? (
                  <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-neutral-600">{phoneHeading}</p>
                ) : null}
                <a href={`tel:${phone}`} className={`${itemClass} mt-2 hover:text-white`}>
                  {phone}
                </a>
              </div>
            ) : null}

            {hasLocation ? (
              <div className="lg:translate-y-[1vh]">
                {addressHeading ? (
                  <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-neutral-600">{addressHeading}</p>
                ) : null}
                <span className={`${itemClass} mt-2`}>
                  {locationLabel}
                </span>
              </div>
            ) : null}

            {hasLinks ? (
              <div className="lg:translate-y-[3vh]">
                {socialHeading ? (
                  <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-neutral-600">{socialHeading}</p>
                ) : null}
                <nav className="mt-3 flex flex-wrap items-center gap-5 lg:justify-end" aria-label="Social">
                  {links.map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className={`${itemClass} mt-0 flex items-center gap-2 text-lg hover:text-white sm:text-xl`}
                    >
                      <FooterSocialLinkIcon link={link} bare iconClassName="h-4 w-4" />
                      {link.label}
                    </a>
                  ))}
                </nav>
              </div>
            ) : null}

            {!hasEmail && !hasPhone && !hasLocation && !hasLinks ? (
              <a href={ctaHref} className={`${itemClass} hover:text-white`}>
                Get in touch →
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
