'use client';

import gsap from 'gsap';
import Image from 'next/image';
import { useLayoutEffect, useMemo, useRef } from 'react';
import {
  FooterSocialLinkIcon,
  type EditorialContactLink,
} from '@/components/portfolio/portfolio-section-primitives';
import type { PortfolioContactPresentationSettings } from '@/components/portfolio/portfolio-contact-settings';
import {
  DEFAULT_CONTENT_GUTTER,
  portfolioEditorialGutterX,
  type PortfolioContentGutter,
} from '@/components/portfolio/portfolio-editorial-layout';
import {
  contactLightDarkTokens,
  initialsFromName,
  prefersReducedMotion,
  runContactDesignMotion,
} from '@/components/portfolio/portfolio-contact-design-motion';

const DEFAULT_EYEBROW = 'Say hey';
const DEFAULT_TITLE = "Let's do something interesting";

function PhoneBadgeIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden>
      <path
        d="M6.5 3.5c.4 1.2.9 2.3 1.6 3.3l-1.4 1.7c.9 2 2.5 3.6 4.5 4.5l1.7-1.4c1 .7 2.1 1.2 3.3 1.6v2.3c0 .7-.6 1.2-1.3 1.1-6.1-.6-11-5.5-11.6-11.6-.1-.7.4-1.3 1.1-1.3h2.3z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Concept 11 — "Magnetic overlap": an italic eyebrow above a monumental headline that runs
 * straight into a giant email, tight line-height, a magnetic circular arrow button riding
 * beside it. A wide horizontal image slides in from the right, slipping asymmetrically
 * behind the tail end of the text for depth. Below, borderless pill badges (phone + up to
 * two social links) sit in a row — hovering one highlights it while its siblings fade to
 * 0.3. The email/arrow pull magnetically toward the cursor and the arrow spins 45° on
 * hover; the image parallaxes at its own, slightly different scroll speed from the text.
 */
export function ContactDesignMagneticOverlap({
  email,
  phone,
  links,
  heroImageUrl,
  heroImageAlt,
  sectionTitle,
  presentation,
  contentGutter = DEFAULT_CONTENT_GUTTER,
  colorMode,
}: {
  email: string | null;
  phone: string | null;
  links: EditorialContactLink[];
  heroImageUrl: string | null;
  heroImageAlt: string;
  sectionTitle?: string;
  presentation: PortfolioContactPresentationSettings;
  contentGutter?: PortfolioContentGutter;
  colorMode: 'light' | 'dark';
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLAnchorElement>(null);
  const arrowGlyphRef = useRef<HTMLSpanElement>(null);
  const textColRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const tokens = contactLightDarkTokens(colorMode);

  const eyebrow = presentation.magneticOverlapEyebrow?.trim() || DEFAULT_EYEBROW;
  const title = sectionTitle?.trim() || DEFAULT_TITLE;
  const trimmedEmail = email?.trim() || '';
  const trimmedPhone = phone?.trim() || '';
  const displayName = heroImageAlt?.trim() || '';
  const initials = useMemo(() => initialsFromName(displayName), [displayName]);
  const socialBadges = links.slice(0, 2);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    if (prefersReducedMotion()) return undefined;

    return runContactDesignMotion(root, 'ContactDesignMagneticOverlap', () => {
      // Badge hover — highlight one, dim its siblings.
      const badges = Array.from(root.querySelectorAll<HTMLElement>('[data-badge]'));
      const onBadgeEnter = (target: HTMLElement) => {
        badges.forEach((badge) => {
          gsap.to(badge, { opacity: badge === target ? 1 : 0.3, duration: 0.3, ease: 'power2.out', overwrite: 'auto' });
        });
      };
      const onBadgeLeaveAll = () => {
        badges.forEach((badge) => gsap.to(badge, { opacity: 1, duration: 0.3, ease: 'power2.out', overwrite: 'auto' }));
      };
      const badgeHandlers = badges.map((badge) => {
        const handler = () => onBadgeEnter(badge);
        badge.addEventListener('pointerenter', handler);
        return handler;
      });
      const badgeRow = root.querySelector<HTMLElement>('[data-badge-row]');
      badgeRow?.addEventListener('pointerleave', onBadgeLeaveAll);

      // Magnetic arrow button + 45deg spin on hover.
      const arrow = arrowRef.current;
      const glyph = arrowGlyphRef.current;
      const detach: Array<() => void> = [];
      if (arrow && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        const moveX = gsap.quickTo(arrow, 'x', { duration: 0.45, ease: 'power3' });
        const moveY = gsap.quickTo(arrow, 'y', { duration: 0.45, ease: 'power3' });
        const onMove = (event: PointerEvent) => {
          const rect = arrow.getBoundingClientRect();
          moveX((event.clientX - (rect.left + rect.width / 2)) * 0.4);
          moveY((event.clientY - (rect.top + rect.height / 2)) * 0.4);
        };
        const onEnter = () => {
          if (glyph) gsap.to(glyph, { rotate: 45, duration: 0.4, ease: 'back.out(2)', overwrite: 'auto' });
        };
        const onLeave = () => {
          gsap.to(arrow, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)', overwrite: 'auto' });
          if (glyph) gsap.to(glyph, { rotate: 0, duration: 0.4, ease: 'power2.out', overwrite: 'auto' });
        };
        arrow.addEventListener('pointermove', onMove);
        arrow.addEventListener('pointerenter', onEnter);
        arrow.addEventListener('pointerleave', onLeave);
        detach.push(() => {
          arrow.removeEventListener('pointermove', onMove);
          arrow.removeEventListener('pointerenter', onEnter);
          arrow.removeEventListener('pointerleave', onLeave);
        });
      }

      // Independent parallax — image and text column drift at different scroll speeds.
      const image = imageRef.current;
      if (image) {
        gsap.fromTo(
          image,
          { y: -40 },
          { y: 40, ease: 'none', scrollTrigger: { trigger: root, start: 'top bottom', end: 'bottom top', scrub: 0.8 } }
        );
      }
      const textCol = textColRef.current;
      if (textCol) {
        gsap.fromTo(
          textCol,
          { y: 20 },
          { y: -20, ease: 'none', scrollTrigger: { trigger: root, start: 'top bottom', end: 'bottom top', scrub: 0.8 } }
        );
      }

      return () => {
        badgeHandlers.forEach((handler, i) => badges[i].removeEventListener('pointerenter', handler));
        badgeRow?.removeEventListener('pointerleave', onBadgeLeaveAll);
        detach.forEach((off) => off());
      };
    });
  }, [colorMode]);

  return (
    <div
      ref={rootRef}
      className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden"
      style={{ backgroundColor: tokens.bg }}
      data-pf-no-color-transition=""
    >
      <div className={`relative w-full py-20 sm:py-24 md:py-28 ${portfolioEditorialGutterX(contentGutter)}`}>
        <div className="relative grid grid-cols-1 items-end gap-10 md:grid-cols-[minmax(0,1fr)_minmax(14rem,0.5fr)]">
          <div ref={textColRef} className="relative z-[1] order-2 md:order-1 md:pb-10">
            <p
              className="m-0 font-serif text-xl italic"
              style={{ color: tokens.muted }}
            >
              {eyebrow}
            </p>
            <h2
              className="m-0 mt-4 select-none font-sans text-[clamp(2.25rem,6.5vw,4.5rem)] font-black leading-[0.9] tracking-[-0.02em]"
              style={{ color: tokens.ink }}
            >
              {title}
            </h2>
            {trimmedEmail ? (
              <div className="mt-2 flex flex-wrap items-center gap-5">
                <a
                  href={`mailto:${trimmedEmail}`}
                  className="block max-w-full min-w-0 shrink break-all font-sans text-[clamp(2.25rem,6.5vw,4.5rem)] font-black leading-[0.9] tracking-[-0.02em]"
                  style={{ color: tokens.ink }}
                >
                  {trimmedEmail}
                </a>
                <a
                  ref={arrowRef}
                  href={`mailto:${trimmedEmail}`}
                  aria-label="Send an email"
                  className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full border will-change-transform"
                  style={{ borderColor: tokens.ink, color: tokens.ink }}
                  data-pf-no-color-transition=""
                >
                  <span ref={arrowGlyphRef} className="inline-block text-xl" aria-hidden data-pf-no-color-transition="">
                    ↗
                  </span>
                </a>
              </div>
            ) : null}
          </div>

          <div
            ref={imageRef}
            className="relative order-1 aspect-[4/3] w-full overflow-hidden will-change-transform md:order-2 md:-mb-16 md:translate-y-6"
            data-pf-no-color-transition=""
          >
            {heroImageUrl ? (
              <Image
                src={heroImageUrl}
                alt={displayName ? `Portrait of ${displayName}` : 'Portrait'}
                fill
                sizes="(max-width: 768px) 100vw, 45vw"
                className="object-cover object-center"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center" style={{ backgroundColor: tokens.placeholderBg }}>
                <span className="font-sans text-5xl font-semibold" style={{ color: tokens.muted }} aria-hidden>
                  {initials || '—'}
                </span>
              </div>
            )}
          </div>
        </div>

        {trimmedPhone || socialBadges.length > 0 ? (
          <div data-badge-row className="relative z-[1] mt-16 flex flex-wrap gap-4 md:mt-24">
            {trimmedPhone ? (
              <a
                href={`tel:${trimmedPhone.replace(/\s+/g, '')}`}
                data-badge
                data-pf-no-color-transition=""
                className="inline-flex items-center gap-3 rounded-full border px-6 py-3.5 text-sm font-medium"
                style={{ borderColor: tokens.border, color: tokens.ink }}
              >
                <PhoneBadgeIcon />
                {trimmedPhone}
              </a>
            ) : null}
            {socialBadges.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                data-badge
                data-pf-no-color-transition=""
                className="inline-flex items-center gap-3 rounded-full border px-6 py-3.5 text-sm font-medium"
                style={{ borderColor: tokens.border, color: tokens.ink }}
              >
                <FooterSocialLinkIcon link={link} bare iconClassName="h-4 w-4" />
                {link.label}
              </a>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
