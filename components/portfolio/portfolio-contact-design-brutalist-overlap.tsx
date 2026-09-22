'use client';

import gsap from 'gsap';
import Image from 'next/image';
import { useLayoutEffect, useMemo, useRef } from 'react';
import {
  FooterSocialLinkIcon,
  type EditorialContactLink,
} from '@/components/portfolio/portfolio-section-primitives';
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

const DEFAULT_TITLE = 'Get in touch';

function splitBrutalistTitle(title: string): { outline: string; solid: string } {
  const words = title.trim().split(/\s+/).filter(Boolean);
  if (words.length <= 1) return { outline: '', solid: words[0] ?? '' };
  return { outline: words.slice(0, -1).join(' '), solid: words[words.length - 1] };
}

/**
 * Concept 9 — "Brutalist overlap": a fashion-brutalist composition — a monumental two-line
 * headline (top line outlined/transparent, bottom line solid) with a hard-edged rectangular
 * thumbnail overlapping its baseline. The email sits directly beneath, massive and
 * underlined edge to edge. Metadata (headquarter address, social links) is stacked on the
 * far right in muted micro-caps. Hovering the email or a social link snaps it to full ink
 * while everything else — text and thumbnail alike — collapses to 0.1 opacity; the thumbnail
 * also drifts on slow, damped mouse-tracking parallax at rest.
 */
export function ContactDesignBrutalistOverlap({
  email,
  locationLabel,
  links,
  heroImageUrl,
  heroImageAlt,
  sectionTitle,
  contentGutter = DEFAULT_CONTENT_GUTTER,
  colorMode,
}: {
  email: string | null;
  locationLabel: string | null;
  links: EditorialContactLink[];
  heroImageUrl: string | null;
  heroImageAlt: string;
  sectionTitle?: string;
  contentGutter?: PortfolioContentGutter;
  colorMode: 'light' | 'dark';
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const tokens = contactLightDarkTokens(colorMode);

  const { outline, solid } = useMemo(() => splitBrutalistTitle(sectionTitle?.trim() || DEFAULT_TITLE), [sectionTitle]);
  const trimmedEmail = email?.trim() || '';
  const trimmedLocation = locationLabel?.trim() || '';
  const displayName = heroImageAlt?.trim() || '';
  const initials = useMemo(() => initialsFromName(displayName), [displayName]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    if (prefersReducedMotion()) return undefined;

    return runContactDesignMotion(root, 'ContactDesignBrutalistOverlap', () => {
      const dimItems = Array.from(root.querySelectorAll<HTMLElement>('[data-dim]'));
      const thumb = thumbRef.current;
      const setFocus = (target: HTMLElement | null) => {
        dimItems.forEach((el) => {
          gsap.to(el, {
            opacity: target ? (el === target ? 1 : 0.1) : 1,
            duration: 0.35,
            ease: 'power2.out',
            overwrite: 'auto',
          });
        });
        if (thumb) gsap.to(thumb, { opacity: target ? 0.1 : 1, duration: 0.35, ease: 'power2.out', overwrite: 'auto' });
      };
      const focusTargets = Array.from(root.querySelectorAll<HTMLElement>('[data-focus-link]'));
      const enterHandlers = focusTargets.map((el) => {
        const handler = () => setFocus(el);
        el.addEventListener('pointerenter', handler);
        return handler;
      });
      const onLeave = () => setFocus(null);
      root.addEventListener('pointerleave', onLeave);

      let onMove: ((event: PointerEvent) => void) | undefined;
      if (thumb && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        const moveX = gsap.quickTo(thumb, 'x', { duration: 1.2, ease: 'power3' });
        const moveY = gsap.quickTo(thumb, 'y', { duration: 1.2, ease: 'power3' });
        onMove = (event) => {
          const rect = root.getBoundingClientRect();
          const relX = (event.clientX - rect.left) / rect.width - 0.5;
          const relY = (event.clientY - rect.top) / rect.height - 0.5;
          moveX(relX * 24);
          moveY(relY * 24);
        };
        root.addEventListener('pointermove', onMove);
      }

      return () => {
        focusTargets.forEach((el, i) => el.removeEventListener('pointerenter', enterHandlers[i]));
        root.removeEventListener('pointerleave', onLeave);
        if (onMove) root.removeEventListener('pointermove', onMove);
      };
    });
  }, [colorMode, outline, solid]);

  return (
    <div
      ref={rootRef}
      className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden"
      style={{ backgroundColor: tokens.bg }}
      data-pf-no-color-transition=""
    >
      <div
        className={`grid w-full grid-cols-1 gap-16 py-20 sm:py-24 md:grid-cols-[minmax(0,1fr)_minmax(12rem,0.32fr)] md:py-28 ${portfolioEditorialGutterX(contentGutter)}`}
      >
        <div className="order-1 flex flex-col md:order-1">
          {outline ? (
            <span
              data-dim
              aria-hidden
              className="m-0 select-none font-sans text-[clamp(2.5rem,9vw,6.5rem)] font-black uppercase leading-[0.86] tracking-[-0.03em]"
              style={{ color: 'transparent', WebkitTextStroke: `1.5px ${tokens.ink}` }}
            >
              {outline}
            </span>
          ) : null}

          <div className="flex flex-wrap items-end gap-6">
            <h2
              data-dim
              className="m-0 select-none font-sans text-[clamp(2.5rem,9vw,6.5rem)] font-black uppercase leading-[0.86] tracking-[-0.03em]"
              style={{ color: tokens.ink }}
            >
              {solid}
            </h2>
            <div
              ref={thumbRef}
              className="relative aspect-[3/4] w-24 shrink-0 overflow-hidden will-change-transform sm:w-28 md:w-32"
              data-pf-no-color-transition=""
            >
              {heroImageUrl ? (
                <Image
                  src={heroImageUrl}
                  alt={displayName ? `Portrait of ${displayName}` : 'Portrait'}
                  fill
                  sizes="8rem"
                  className="object-cover object-center"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center" style={{ backgroundColor: tokens.placeholderBg }}>
                  <span className="font-sans text-2xl font-semibold" style={{ color: tokens.muted }} aria-hidden>
                    {initials || '—'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {trimmedEmail ? (
            <a
              href={`mailto:${trimmedEmail}`}
              data-dim
              data-focus-link
              data-pf-no-color-transition=""
              className="mt-12 block w-full min-w-0 max-w-full break-all border-b pb-3 font-sans text-[clamp(1.5rem,4vw,2.75rem)] font-bold leading-none tracking-[-0.02em]"
              style={{ color: tokens.ink, borderColor: tokens.ink }}
            >
              {trimmedEmail}
            </a>
          ) : null}
        </div>

        <div className="order-2 flex flex-col gap-10 md:order-2 md:justify-end md:text-right">
          {trimmedLocation ? (
            <div>
              <p
                data-dim
                data-pf-no-color-transition=""
                className="m-0 text-[11px] font-semibold uppercase tracking-[0.28em]"
                style={{ color: tokens.muted }}
              >
                Headquarter
              </p>
              <p
                data-dim
                data-pf-no-color-transition=""
                className="mt-3 max-w-[14rem] text-sm font-medium leading-relaxed md:ml-auto"
                style={{ color: tokens.ink }}
              >
                {trimmedLocation}
              </p>
            </div>
          ) : null}

          {links.length > 0 ? (
            <div>
              <p
                data-dim
                data-pf-no-color-transition=""
                className="m-0 text-[11px] font-semibold uppercase tracking-[0.28em]"
                style={{ color: tokens.muted }}
              >
                Social links
              </p>
              <nav className="mt-3 flex flex-col gap-2 md:items-end" aria-label="Social">
                {links.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    data-dim
                    data-focus-link
                    data-pf-no-color-transition=""
                    className="inline-flex items-center gap-2 text-sm font-medium"
                    style={{ color: tokens.ink }}
                  >
                    <FooterSocialLinkIcon link={link} bare iconClassName="h-3.5 w-3.5" />
                    {link.label}
                  </a>
                ))}
              </nav>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
