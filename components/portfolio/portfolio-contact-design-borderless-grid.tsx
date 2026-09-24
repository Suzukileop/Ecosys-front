'use client';

import gsap from 'gsap';
import { useLayoutEffect, useRef } from 'react';
import {
  FooterSocialLinkIcon,
  type EditorialContactLink,
} from '@/components/portfolio/portfolio-section-primitives';
import type { ContactDesignLayoutResolver } from '@/components/portfolio/portfolio-contact-design-layout';
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

/**
 * Smart email wrapping — a plain `break-all` chops anywhere, including mid-character
 * inside the TLD. Instead, only offer real break opportunities (`<wbr>`) right after "@"
 * and right before each "." in the domain, with the dot kept attached to the segment that
 * follows it — so ".com" always wraps as one intact unit, never split mid-character.
 */
function EmailSmartWrap({ email }: { email: string }) {
  const atIndex = email.indexOf('@');
  if (atIndex === -1) return <>{email}</>;
  const local = email.slice(0, atIndex + 1);
  const domainParts = email.slice(atIndex + 1).split('.');
  return (
    <>
      {local}
      <wbr />
      {domainParts.map((part, index) => (
        <span key={index}>
          {index > 0 ? <wbr /> : null}
          {index > 0 ? '.' : ''}
          {part}
        </span>
      ))}
    </>
  );
}

/**
 * Concept 6 — "Borderless grid": two stacked monumental headlines on the left ("Contact" /
 * "Start a conversation."); the right column mirrors that exact same top/bottom split — the
 * phone sits top-aligned with "Contact", the email sits bottom-aligned with "Start a
 * conversation.", radically enlarged into the column's real monumental focal point, underlined
 * with a hairline rule. At rest the phone and both left headlines sit at a felted 0.55
 * opacity; the email alone stays fully bright. Hovering either the phone or the email snaps
 * it to full-bright ink while everything else on screen (both headlines, the other contact
 * detail, the address, the socials) sinks to 0.08 opacity with a 2px focus blur — a real
 * depth-of-field spotlight, not just a color swap. Socials float at the bottom, no chips.
 * Below 768px the two-column grid collapses into one edge-to-edge flow: both headlines,
 * then the monumental email, then the phone — each stacked with generous, thumb-friendly
 * tap room.
 */
export function ContactDesignBorderlessGrid({
  email,
  phone,
  locationLabel,
  links,
  sectionTitle,
  layout,
  contentGutter = DEFAULT_CONTENT_GUTTER,
  colorMode,
}: {
  email: string | null;
  phone: string | null;
  locationLabel: string | null;
  links: EditorialContactLink[];
  sectionTitle?: string;
  layout: ContactDesignLayoutResolver;
  contentGutter?: PortfolioContentGutter;
  colorMode: 'light' | 'dark';
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const tokens = contactLightDarkTokens(colorMode);

  const titleLine1 = layout.text('title') || sectionTitle?.trim() || DEFAULT_TITLE;
  const titleLine2 = layout.text('subline');
  const spotlight = layout.isVisible('spotlight');
  const hasSubline = Boolean(titleLine2);
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
        // Small spring nudge on every link — orthogonal to, and layered underneath, the
        // depth-of-field focus effect below (they animate different properties, so both
        // can run on the same element at once without fighting).
        const linkTargets = Array.from(root.querySelectorAll<HTMLElement>('[data-link]'));
        const nudgeListeners = linkTargets.map((el) => {
          const onEnter = () => {
            gsap.to(el, { x: 6, duration: 0.45, ease: 'back.out(2.4)', overwrite: 'auto' });
          };
          const onLeave = () => {
            gsap.to(el, { x: 0, duration: 0.4, ease: 'power2.out', overwrite: 'auto' });
          };
          el.addEventListener('pointerenter', onEnter);
          el.addEventListener('pointerleave', onLeave);
          return { el, onEnter, onLeave };
        });

        // Depth-of-field focus — hovering the phone or the email snaps that one element to
        // full-bright ink while every other item on screen (both headlines, the other
        // contact detail, the address, the socials) sinks to a near-invisible 0.08 opacity
        // with a soft 2px blur, isolating the hovered contact channel as the sole focus.
        const allItems = Array.from(root.querySelectorAll<HTMLElement>('[data-item]'));
        const restOpacity = new Map<HTMLElement, number>(
          allItems.map((el) => [el, Number(el.dataset.restOpacity ?? '1')])
        );
        const focusTargets = spotlight ? Array.from(root.querySelectorAll<HTMLElement>('[data-focus-item]')) : [];

        const focusListeners = focusTargets.map((target) => {
          const onEnter = () => {
            allItems.forEach((el) => {
              if (el === target) {
                gsap.to(el, { opacity: 1, filter: 'blur(0px)', duration: 0.4, ease: 'power2.out', overwrite: 'auto' });
              } else {
                gsap.to(el, { opacity: 0.08, filter: 'blur(2px)', duration: 0.4, ease: 'power2.out', overwrite: 'auto' });
              }
            });
          };
          const onLeave = () => {
            allItems.forEach((el) => {
              gsap.to(el, {
                opacity: restOpacity.get(el) ?? 1,
                filter: 'blur(0px)',
                duration: 0.4,
                ease: 'power2.out',
                overwrite: 'auto',
              });
            });
          };
          target.addEventListener('pointerenter', onEnter);
          target.addEventListener('pointerleave', onLeave);
          return { target, onEnter, onLeave };
        });

        return () => {
          nudgeListeners.forEach(({ el, onEnter, onLeave }) => {
            el.removeEventListener('pointerenter', onEnter);
            el.removeEventListener('pointerleave', onLeave);
          });
          focusListeners.forEach(({ target, onEnter, onLeave }) => {
            target.removeEventListener('pointerenter', onEnter);
            target.removeEventListener('pointerleave', onLeave);
          });
        };
      },
      '[data-item]'
    );
  }, [colorMode, spotlight, hasSubline]);

  return (
    <div
      ref={rootRef}
      className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden"
      data-pf-no-color-transition=""
    >
      <div
        className={`grid w-full grid-cols-1 gap-y-16 py-20 sm:py-24 md:grid-cols-2 md:gap-x-16 md:py-32 ${portfolioEditorialGutterX(contentGutter)}`}
      >
        <div className="flex flex-col justify-between gap-16 md:min-h-[70vh]">
          <h2
            data-item
            data-rest-opacity="0.55"
            data-pf-no-color-transition=""
            className="m-0 select-none font-sans text-[clamp(2.75rem,7.5vw,5.5rem)] font-black leading-[0.95] tracking-[-0.03em]"
            style={{ color: tokens.ink, opacity: 0.55 }}
          >
            {titleLine1}
          </h2>
          {titleLine2 ? (
            <h2
              data-item
              data-rest-opacity="0.55"
              data-pf-no-color-transition=""
              className="m-0 select-none font-sans text-[clamp(2.75rem,7.5vw,5.5rem)] font-black leading-[0.95] tracking-[-0.03em]"
              style={{ color: tokens.ink, opacity: 0.55 }}
            >
              {titleLine2}
            </h2>
          ) : null}
        </div>

        <div className="flex flex-col justify-between gap-16 md:items-end md:text-right">
          {/* Top row — the phone, baseline-aligned with "Contact" on the left. Ordered
              last on mobile: the monumental email leads the stack there, per spec. */}
          <div className="order-2 flex flex-col gap-3 md:order-1 md:items-end">
            {trimmedLocation ? (
              <span
                data-item
                data-pf-no-color-transition=""
                className="block max-w-xs text-xs font-medium uppercase leading-relaxed tracking-[0.08em]"
                style={{ color: tokens.muted }}
              >
                {trimmedLocation}
              </span>
            ) : null}
            {trimmedPhone ? (
              <a
                href={`tel:${trimmedPhone.replace(/\s+/g, '')}`}
                data-item
                data-link
                data-focus-item
                data-rest-opacity="0.55"
                data-pf-no-color-transition=""
                className="inline-block py-1 text-[clamp(1.5rem,3vw,2.125rem)] font-semibold leading-none tracking-[-0.01em]"
                style={{ color: tokens.ink, opacity: 0.55 }}
              >
                {trimmedPhone}
              </a>
            ) : null}
          </div>

          {/* Bottom row — the email, vertically opposite "Start a conversation.", radically
              enlarged into the column's real focal point. Ordered first on mobile. */}
          <div className="order-1 flex flex-col gap-10 md:order-2 md:items-end">
            {trimmedEmail ? (
              <a
                href={`mailto:${trimmedEmail}`}
                data-item
                data-link
                data-focus-item
                data-pf-no-color-transition=""
                className="inline-block max-w-full break-words py-2 text-[clamp(3rem,8.5vw,7rem)] font-black leading-[0.95] tracking-[-0.03em]"
                style={{ color: tokens.ink, opacity: 1, borderBottom: `1px solid ${tokens.ink}` }}
              >
                <EmailSmartWrap email={trimmedEmail} />
              </a>
            ) : null}

            {hasSocials ? (
              <nav
                data-item
                data-pf-no-color-transition=""
                className="flex flex-wrap items-center gap-x-8 gap-y-4 md:justify-end"
                aria-label="Social"
              >
                {links.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    data-link
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
    </div>
  );
}
