'use client';

import gsap from 'gsap';
import Image from 'next/image';
import { useLayoutEffect, useMemo, useRef } from 'react';
import type { EditorialContactLink } from '@/components/portfolio/portfolio-section-primitives';
import {
  DEFAULT_CONTENT_GUTTER,
  portfolioEditorialGutterInsetLeft,
  portfolioEditorialGutterX,
  portfolioHeroLayerInset,
  type PortfolioContentGutter,
} from '@/components/portfolio/portfolio-editorial-layout';
import {
  contactLightDarkTokens,
  initialsFromName,
  prefersReducedMotion,
  revealOnceVisible,
  runContactDesignMotion,
} from '@/components/portfolio/portfolio-contact-design-motion';
import type { ContactDesignLayoutResolver } from '@/components/portfolio/portfolio-contact-design-layout';

const DEFAULT_TITLE = 'Contact';

/** Layout settings → "Portrait shape". */
const PORTRAIT_SHAPE_CLASS: Record<string, string> = {
  circle: 'rounded-full',
  rounded: 'rounded-[2rem]',
  square: 'rounded-none',
};

/**
 * Concept 7 — "Broken grid": a deliberately shattered composition — "CONTACT" pinned top
 * left, address/phone as minimalist lines mid-left, a vertical list of social links top
 * right, and a monumental email owning the whole bottom right. A perfectly circular
 * portrait floats centered between the social list and the email, drifting with slow,
 * damped mouse-tracking parallax. The title and email slide up out of an invisible mask on
 * scroll-entry.
 */
export function ContactDesignBrokenGrid({
  email,
  phone,
  locationLabel,
  links,
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
  links: EditorialContactLink[];
  heroImageUrl: string | null;
  heroImageAlt: string;
  sectionTitle?: string;
  contentGutter?: PortfolioContentGutter;
  colorMode: 'light' | 'dark';
  layout: ContactDesignLayoutResolver;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const circleRef = useRef<HTMLDivElement>(null);
  const tokens = contactLightDarkTokens(colorMode);

  const title = layout.text('title') || sectionTitle?.trim() || DEFAULT_TITLE;
  const trimmedEmail = email?.trim() || '';
  const trimmedPhone = phone?.trim() || '';
  const trimmedLocation = locationLabel?.trim() || '';
  const displayName = heroImageAlt?.trim() || '';
  const initials = useMemo(() => initialsFromName(displayName), [displayName]);
  const showPortrait = layout.isVisible('portrait');
  const portraitShapeClass = PORTRAIT_SHAPE_CLASS[layout.option('portraitShape')] ?? PORTRAIT_SHAPE_CLASS.circle;

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    if (prefersReducedMotion()) return undefined;

    return runContactDesignMotion(
      root,
      'ContactDesignBrokenGrid',
      (observers) => {
        // Entrance — title and email slide up out of their mask on scroll-entry.
        const maskLines = Array.from(root.querySelectorAll<HTMLElement>('[data-mask-line]'));
        maskLines.forEach((line) => {
          gsap.set(line, { yPercent: 100 });
          revealOnceVisible(observers, line, 88, () =>
            gsap.to(line, { yPercent: 0, duration: 1, ease: 'power4.out', overwrite: 'auto' })
          );
        });

        const circle = circleRef.current;

        // Mouse-tracking parallax on the circular portrait — slow, heavily damped.
        let onMove: ((event: PointerEvent) => void) | undefined;
        if (circle && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
          const moveX = gsap.quickTo(circle, 'x', { duration: 1.1, ease: 'power3' });
          const moveY = gsap.quickTo(circle, 'y', { duration: 1.1, ease: 'power3' });
          onMove = (event) => {
            const rect = root.getBoundingClientRect();
            const relX = (event.clientX - rect.left) / rect.width - 0.5;
            const relY = (event.clientY - rect.top) / rect.height - 0.5;
            moveX(relX * 36);
            moveY(relY * 36);
          };
          root.addEventListener('pointermove', onMove);
        }

        return () => {
          if (onMove) root.removeEventListener('pointermove', onMove);
        };
      },
      '[data-mask-line]'
    );
  }, [colorMode, title, showPortrait]);

  return (
    <div
      ref={rootRef}
      className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden"
      data-pf-no-color-transition=""
    >
      <div
        className={`relative flex w-full flex-col gap-16 py-20 sm:py-24 md:min-h-[92vh] md:py-24 ${portfolioEditorialGutterX(contentGutter)}`}
      >
        <div
          className={`order-1 flex items-start justify-between md:absolute md:top-24 ${portfolioHeroLayerInset(contentGutter)}`}
        >
          <h2
            className="m-0 block overflow-hidden select-none font-sans text-[clamp(2.75rem,8vw,5.5rem)] font-black uppercase leading-[0.9] tracking-[-0.03em]"
            style={{ color: tokens.ink }}
          >
            <span data-mask-line className="block will-change-transform">
              {title}
            </span>
          </h2>

          {links.length > 0 ? (
            <nav className="hidden flex-col items-end gap-3 md:flex" aria-label="Social">
              {links.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  data-pf-no-color-transition=""
                  className="text-[11px] font-semibold uppercase tracking-[0.3em]"
                  style={{ color: tokens.ink }}
                >
                  {link.label}
                </a>
              ))}
            </nav>
          ) : null}
        </div>

        {showPortrait ? (
        <div
          ref={circleRef}
          className={`order-2 relative mx-auto aspect-square w-56 shrink-0 overflow-hidden ${portraitShapeClass} will-change-transform sm:w-64 md:absolute md:left-1/2 md:top-1/2 md:mx-0 md:w-72 md:-translate-x-1/2 md:-translate-y-1/2 lg:w-80`}
          data-pf-no-color-transition=""
        >
          {heroImageUrl ? (
            <Image
              src={heroImageUrl}
              alt={displayName ? `Portrait of ${displayName}` : 'Portrait'}
              fill
              sizes="(max-width: 768px) 16rem, 20rem"
              className="object-cover object-center"
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center"
              style={{ backgroundColor: tokens.placeholderBg }}
            >
              <span className="font-sans text-4xl font-semibold" style={{ color: tokens.muted }} aria-hidden>
                {initials || '—'}
              </span>
            </div>
          )}
        </div>
        ) : null}

        {links.length > 0 ? (
          <nav className="order-3 flex flex-wrap justify-center gap-x-6 gap-y-3 md:hidden" aria-label="Social">
            {links.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                data-pf-no-color-transition=""
                className="text-[11px] font-semibold uppercase tracking-[0.3em]"
                style={{ color: tokens.ink }}
              >
                {link.label}
              </a>
            ))}
          </nav>
        ) : null}

        {trimmedLocation || trimmedPhone ? (
          <div
            className={`order-4 flex flex-col gap-3 text-center md:absolute md:top-[42%] md:-translate-y-1/2 md:text-left ${portfolioEditorialGutterInsetLeft(contentGutter)}`}
          >
            {trimmedLocation ? (
              <span
                data-pf-no-color-transition=""
                className="block max-w-[16rem] text-sm font-medium leading-relaxed"
                style={{ color: tokens.muted }}
              >
                {trimmedLocation}
              </span>
            ) : null}
            {trimmedPhone ? (
              <a
                href={`tel:${trimmedPhone.replace(/\s+/g, '')}`}
                data-pf-no-color-transition=""
                className="block border-t pt-2 text-base font-medium"
                style={{ color: tokens.ink, borderColor: tokens.border }}
              >
                {trimmedPhone}
              </a>
            ) : null}
          </div>
        ) : null}

        {trimmedEmail ? (
          <div
            className={`order-5 md:absolute md:bottom-16 md:flex md:justify-end ${portfolioHeroLayerInset(contentGutter)}`}
          >
            <a
              href={`mailto:${trimmedEmail}`}
              data-pf-no-color-transition=""
              className="m-0 block w-full min-w-0 overflow-hidden break-all text-center font-sans text-[clamp(2.25rem,8vw,5.5rem)] font-black leading-[0.92] tracking-[-0.03em] md:text-right"
              style={{ color: tokens.ink }}
            >
              <span data-mask-line className="block will-change-transform">
                {trimmedEmail}
              </span>
            </a>
          </div>
        ) : null}
      </div>
    </div>
  );
}
