'use client';

import gsap from 'gsap';
import { useLayoutEffect, useRef } from 'react';
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
  prefersReducedMotion,
  runContactDesignMotion,
} from '@/components/portfolio/portfolio-contact-design-motion';

const DEFAULT_TITLE = 'Get in touch.';
const DEFAULT_SUBLINE = 'Start a conversation.';

/**
 * Concept 6 — "Borderless grid": two stacked monumental headlines on the left, separated by
 * a huge vertical void; on the right, raw contact data with no icons and no labels at all —
 * address small, phone massive, email gigantic — each just larger than the last. Socials
 * float at the bottom with no circular chips. At rest every item on the right sits at 0.35
 * opacity; hovering one snaps it to full ink with a 6px spring nudge right while every other
 * item on screen collapses to 0.08 opacity + a 1.5px blur, radically isolating the target.
 */
export function ContactDesignBorderlessGrid({
  email,
  phone,
  locationLabel,
  links,
  sectionTitle,
  presentation,
  contentGutter = DEFAULT_CONTENT_GUTTER,
  colorMode,
}: {
  email: string | null;
  phone: string | null;
  locationLabel: string | null;
  links: EditorialContactLink[];
  sectionTitle?: string;
  presentation: PortfolioContactPresentationSettings;
  contentGutter?: PortfolioContentGutter;
  colorMode: 'light' | 'dark';
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const tokens = contactLightDarkTokens(colorMode);

  const titleLine1 = sectionTitle?.trim() || DEFAULT_TITLE;
  const titleLine2 = presentation.borderlessGridSubline?.trim() || DEFAULT_SUBLINE;
  const trimmedEmail = email?.trim() || '';
  const trimmedPhone = phone?.trim() || '';
  const trimmedLocation = locationLabel?.trim() || '';
  const hasSocials = links.length > 0;

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    if (prefersReducedMotion()) return undefined;

    return runContactDesignMotion(
      root,
      'ContactDesignBorderlessGrid',
      () => {
        const items = Array.from(root.querySelectorAll<HTMLElement>('[data-item]'));
        gsap.set(items, { opacity: 0.35 });

        const setStates = (target: HTMLElement | null) => {
          items.forEach((el) => {
            if (target && el === target) {
              gsap.to(el, {
                opacity: 1,
                x: 6,
                filter: 'blur(0px)',
                duration: 0.45,
                ease: 'back.out(2.4)',
                overwrite: 'auto',
              });
            } else if (target) {
              gsap.to(el, {
                opacity: 0.08,
                filter: 'blur(1.5px)',
                duration: 0.35,
                ease: 'power2.out',
                overwrite: 'auto',
              });
            } else {
              gsap.to(el, {
                opacity: 0.35,
                x: 0,
                filter: 'blur(0px)',
                duration: 0.4,
                ease: 'power2.out',
                overwrite: 'auto',
              });
            }
          });
        };

        const linkTargets = Array.from(root.querySelectorAll<HTMLElement>('[data-link]'));
        const enterHandlers = linkTargets.map((el) => {
          const handler = () => setStates(el);
          el.addEventListener('pointerenter', handler);
          return handler;
        });
        const infoColumn = root.querySelector<HTMLElement>('[data-info-column]');
        const onLeave = () => setStates(null);
        infoColumn?.addEventListener('pointerleave', onLeave);

        return () => {
          linkTargets.forEach((el, i) => el.removeEventListener('pointerenter', enterHandlers[i]));
          infoColumn?.removeEventListener('pointerleave', onLeave);
        };
      },
      '[data-item]'
    );
  }, [colorMode]);

  return (
    <div
      ref={rootRef}
      className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden"
      style={{ backgroundColor: tokens.bg }}
      data-pf-no-color-transition=""
    >
      <div
        className={`grid w-full grid-cols-1 gap-y-16 py-20 sm:py-24 md:grid-cols-2 md:gap-x-16 md:py-32 ${portfolioEditorialGutterX(contentGutter)}`}
      >
        <div className="flex flex-col justify-between gap-16 md:min-h-[60vh]">
          <h2
            className="m-0 select-none font-sans text-[clamp(2.75rem,7.5vw,5.5rem)] font-black leading-[0.95] tracking-[-0.03em]"
            style={{ color: tokens.ink }}
          >
            {titleLine1}
          </h2>
          <h2
            className="m-0 select-none font-sans text-[clamp(2.75rem,7.5vw,5.5rem)] font-black leading-[0.95] tracking-[-0.03em]"
            style={{ color: tokens.ink }}
          >
            {titleLine2}
          </h2>
        </div>

        <div
          data-info-column
          className="flex flex-col justify-between gap-16 md:items-end md:text-right"
        >
          <div className="flex flex-col gap-10 md:items-end">
            {trimmedLocation ? (
              <span
                data-item
                data-pf-no-color-transition=""
                className="block max-w-xs text-base font-medium leading-relaxed"
                style={{ color: tokens.ink }}
              >
                {trimmedLocation}
              </span>
            ) : null}
            {trimmedPhone ? (
              <a
                href={`tel:${trimmedPhone.replace(/\s+/g, '')}`}
                data-item
                data-link
                data-pf-no-color-transition=""
                className="block text-[clamp(1.75rem,4.5vw,3rem)] font-bold leading-none tracking-[-0.02em]"
                style={{ color: tokens.ink }}
              >
                {trimmedPhone}
              </a>
            ) : null}
            {trimmedEmail ? (
              <a
                href={`mailto:${trimmedEmail}`}
                data-item
                data-link
                data-pf-no-color-transition=""
                className="block w-full min-w-0 max-w-full break-all text-[clamp(2.25rem,6.5vw,4.25rem)] font-bold leading-[0.95] tracking-[-0.02em]"
                style={{ color: tokens.ink }}
              >
                {trimmedEmail}
              </a>
            ) : null}
          </div>

          {hasSocials ? (
            <nav
              className="flex flex-wrap items-center gap-x-8 gap-y-4 md:justify-end"
              aria-label="Social"
            >
              {links.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  data-item
                  data-link
                  data-pf-no-color-transition=""
                  className="inline-flex items-center"
                  style={{ color: tokens.ink }}
                  aria-label={link.label}
                >
                  <FooterSocialLinkIcon link={link} bare iconClassName="h-6 w-6" />
                </a>
              ))}
            </nav>
          ) : null}
        </div>
      </div>
    </div>
  );
}
