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

const DEFAULT_TITLE = 'Contact';
const DEFAULT_TAGLINE =
  'We craft digital work that moves people — let’s start something worth talking about.';

const SPLIT_MANIFESTO_CSS = `
.pf-splitmanifesto-mode {
  transition: background-color 0.5s cubic-bezier(0.16, 1, 0.3, 1), color 0.5s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}
@media (prefers-reduced-motion: reduce) {
  .pf-splitmanifesto-mode {
    transition: none !important;
  }
}
`;

function SplitManifestoStyles() {
  return <style dangerouslySetInnerHTML={{ __html: SPLIT_MANIFESTO_CSS }} />;
}

/**
 * Concept 10 — "Split manifesto": a rigid 50/50 split screen, full 100vh tall. The left half
 * is an immersive, full-bleed vertical portrait with a slow scroll-scrubbed zoom-out for
 * depth. The right half is three vertical blocks spread across the full height instead of
 * condensed in the middle: a top block (brand mark + monumental title + an airy manifesto
 * line), a central block where the email and phone are the page's two focal points — no
 * bullets, no labels, just the two of them on one wide, generously spaced row — and a bottom
 * block pairing a quiet "/ Follow" social row (left) with a magnetic "Start a project" pill
 * (right). Hovering the email, phone, or a social link is a full depth-of-field cue: that one
 * element snaps to pure ink while the rest of the text column *and* the portrait sink to 0.1
 * opacity with a 1.5px blur.
 */
export function ContactDesignSplitManifesto({
  email,
  phone,
  // Dropped from this design's own visible layout — the brief restructures the right
  // column into title / email+phone / follow+CTA, with no slot for location.
  locationLabel: _locationLabel,
  links,
  heroImageUrl,
  heroImageAlt,
  ctaHref,
  ctaLabel,
  sectionTitle,
  presentation,
  contentGutter = DEFAULT_CONTENT_GUTTER,
  colorMode,
}: {
  email: string | null;
  phone: string | null;
  locationLabel: string | null;
  links: EditorialContactLink[];
  heroImageUrl: string | null;
  heroImageAlt: string;
  ctaHref: string;
  ctaLabel: string;
  sectionTitle?: string;
  presentation: PortfolioContactPresentationSettings;
  contentGutter?: PortfolioContentGutter;
  colorMode: 'light' | 'dark';
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const tokens = contactLightDarkTokens(colorMode);

  const title = sectionTitle?.trim() || DEFAULT_TITLE;
  const tagline = presentation.splitManifestoTagline?.trim() || DEFAULT_TAGLINE;
  const trimmedEmail = email?.trim() || '';
  const trimmedPhone = phone?.trim() || '';
  const displayName = heroImageAlt?.trim() || '';
  const initials = useMemo(() => initialsFromName(displayName), [displayName]);
  const brandMark = displayName ? `${displayName[0].toUpperCase()}® /` : 'Contact /';

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    if (prefersReducedMotion()) return undefined;

    return runContactDesignMotion(root, 'ContactDesignSplitManifesto', () => {
      // Depth-of-field focus — spans BOTH the text column and the portrait: hovering the
      // email, phone, or a social link snaps that one element to full ink while everything
      // else (title, tagline, the other focal point, the follow row, the CTA, and the
      // image itself) sinks to 0.1 opacity with a 1.5px blur. Each dim target rests at its
      // own `data-rest-opacity` (socials rest dimmer than the rest, at 0.6) rather than a
      // single shared "1".
      const dimItems = Array.from(root.querySelectorAll<HTMLElement>('[data-dim]'));
      const setFocus = (target: HTMLElement | null) => {
        dimItems.forEach((el) => {
          const isTarget = target ? el === target || el.contains(target) || target.contains(el) : false;
          const restOpacity = Number(el.dataset.restOpacity || 1);
          gsap.to(el, {
            opacity: target ? (isTarget ? 1 : 0.1) : restOpacity,
            filter: target && !isTarget ? 'blur(1.5px)' : 'blur(0px)',
            duration: 0.35,
            ease: 'power2.out',
            overwrite: 'auto',
          });
        });
      };
      const focusTargets = Array.from(root.querySelectorAll<HTMLElement>('[data-focus-link]'));
      const enterHandlers = focusTargets.map((el) => {
        const handler = () => setFocus(el);
        el.addEventListener('pointerenter', handler);
        return handler;
      });
      const onLeave = () => setFocus(null);
      root.addEventListener('pointerleave', onLeave);

      const image = imageRef.current;
      if (image) {
        gsap.fromTo(
          image,
          { scale: 1.08 },
          {
            scale: 1,
            ease: 'none',
            scrollTrigger: { trigger: root, start: 'top bottom', end: 'bottom top', scrub: 0.8 },
          }
        );
      }

      // Magnetic CTA — "Start a project" pulls delicately toward the cursor within a
      // proximity radius, with a smooth, damped lag rather than a snappy follow.
      const detach: Array<() => void> = [];
      if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        const magnetic = Array.from(root.querySelectorAll<HTMLElement>('[data-magnetic]'));
        magnetic.forEach((el) => {
          const moveX = gsap.quickTo(el, 'x', { duration: 0.8, ease: 'power3' });
          const moveY = gsap.quickTo(el, 'y', { duration: 0.8, ease: 'power3' });
          const onMove = (event: PointerEvent) => {
            const rect = el.getBoundingClientRect();
            moveX((event.clientX - (rect.left + rect.width / 2)) * 0.4);
            moveY((event.clientY - (rect.top + rect.height / 2)) * 0.4);
          };
          const onMagLeave = () =>
            gsap.to(el, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.35)', overwrite: 'auto' });
          el.addEventListener('pointermove', onMove);
          el.addEventListener('pointerleave', onMagLeave);
          detach.push(() => {
            el.removeEventListener('pointermove', onMove);
            el.removeEventListener('pointerleave', onMagLeave);
          });
        });
      }

      return () => {
        focusTargets.forEach((el, i) => el.removeEventListener('pointerenter', enterHandlers[i]));
        root.removeEventListener('pointerleave', onLeave);
        detach.forEach((off) => off());
      };
    });
  }, [colorMode]);

  return (
    <div
      ref={rootRef}
      className="pf-splitmanifesto-mode relative left-1/2 w-screen -translate-x-1/2 overflow-hidden"
      style={{ backgroundColor: tokens.bg }}
      data-pf-no-color-transition=""
    >
      <SplitManifestoStyles />

      <div className="flex w-full flex-col md:min-h-[100vh] md:flex-row">
        <div
          data-dim
          data-rest-opacity="1"
          data-pf-no-color-transition=""
          className="relative order-1 aspect-[16/10] w-full overflow-hidden sm:aspect-[16/9] md:aspect-auto md:w-1/2"
        >
          <div ref={imageRef} className="absolute inset-0" data-pf-no-color-transition="">
            {heroImageUrl ? (
              <Image
                src={heroImageUrl}
                alt={displayName ? `Portrait of ${displayName}` : 'Portrait'}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover object-center"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center" style={{ backgroundColor: tokens.placeholderBg }}>
                <span className="font-sans text-6xl font-semibold" style={{ color: tokens.muted }} aria-hidden>
                  {initials || '—'}
                </span>
              </div>
            )}
          </div>
        </div>

        <div
          data-right-column
          className={`order-2 flex w-full flex-col justify-between gap-16 py-16 sm:py-20 md:min-h-[100vh] md:w-1/2 md:py-24 ${portfolioEditorialGutterX(contentGutter)} md:pl-20`}
        >
          {/* Top block — brand mark, monumental title, airy manifesto line. */}
          <div data-dim data-rest-opacity="1" data-pf-no-color-transition="">
            <div className="flex items-baseline gap-4">
              <span
                className="pf-splitmanifesto-mode font-sans text-2xl font-black tracking-[-0.02em] sm:text-3xl"
                style={{ color: tokens.ink }}
                aria-hidden
              >
                {brandMark}
              </span>
              <h2
                className="pf-splitmanifesto-mode m-0 select-none font-sans text-[clamp(3.5rem,7vw,7rem)] font-black uppercase leading-[0.92] tracking-[-0.03em]"
                style={{ color: tokens.ink }}
              >
                {title}
              </h2>
            </div>
            <p
              className="pf-splitmanifesto-mode mt-8 max-w-md text-base font-light leading-[1.6] sm:text-lg md:text-xl"
              style={{ color: tokens.muted }}
            >
              {tagline}
            </p>
          </div>

          {/* Central block — email and phone, the page's two focal points, one wide row. */}
          {trimmedEmail || trimmedPhone ? (
            <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between sm:gap-10">
              {trimmedEmail ? (
                <a
                  href={`mailto:${trimmedEmail}`}
                  data-dim
                  data-focus-link
                  data-rest-opacity="1"
                  data-pf-no-color-transition=""
                  className="pf-splitmanifesto-mode block w-fit max-w-full break-all font-sans text-[clamp(1.75rem,3.5vw,3.25rem)] font-semibold leading-[1.05] tracking-[-0.01em]"
                  style={{ color: tokens.ink }}
                >
                  {trimmedEmail}
                </a>
              ) : null}
              {trimmedPhone ? (
                <a
                  href={`tel:${trimmedPhone.replace(/\s+/g, '')}`}
                  data-dim
                  data-focus-link
                  data-rest-opacity="1"
                  data-pf-no-color-transition=""
                  className="pf-splitmanifesto-mode block w-fit font-sans text-[clamp(1.75rem,3.5vw,3.25rem)] font-semibold leading-[1.05] tracking-[-0.01em] sm:text-right"
                  style={{ color: tokens.ink }}
                >
                  {trimmedPhone}
                </a>
              ) : null}
            </div>
          ) : null}

          {/* Bottom block — "/ Follow" social row left, magnetic CTA pill right. */}
          <div className="flex flex-col gap-10 sm:flex-row sm:items-end sm:justify-between">
            {links.length > 0 ? (
              <div className="flex flex-col gap-5">
                <p
                  data-dim
                  data-rest-opacity="1"
                  data-pf-no-color-transition=""
                  className="pf-splitmanifesto-mode m-0 text-xs font-semibold uppercase tracking-[0.2em]"
                  style={{ color: tokens.muted }}
                >
                  / Follow
                </p>
                <nav className="flex flex-wrap items-center gap-x-8 gap-y-3" aria-label="Social">
                  {links.map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      data-dim
                      data-focus-link
                      data-rest-opacity="0.6"
                      data-pf-no-color-transition=""
                      className="pf-splitmanifesto-mode inline-flex items-center gap-2 text-base font-medium sm:text-lg"
                      style={{ color: tokens.ink, opacity: 0.6 }}
                    >
                      <FooterSocialLinkIcon link={link} bare iconClassName="h-4 w-4" />
                      {link.label}
                    </a>
                  ))}
                </nav>
              </div>
            ) : null}

            <a
              ref={ctaRef}
              href={ctaHref}
              data-dim
              data-magnetic
              data-rest-opacity="1"
              data-pf-no-color-transition=""
              className="pf-splitmanifesto-mode inline-flex w-fit items-center gap-3 rounded-full border px-8 py-4 text-sm font-bold uppercase tracking-[0.14em] will-change-transform sm:px-10 sm:py-5 sm:text-base"
              style={{ color: tokens.ink, borderColor: tokens.border }}
            >
              {ctaLabel}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
