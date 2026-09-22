'use client';

import Link from 'next/link';
import gsap from 'gsap';
import { useLayoutEffect, useRef } from 'react';
import { formatPhoneDisplay } from '@/lib/phone';
import {
  FooterSocialLinkIcon,
  type EditorialContactLink,
} from '@/components/portfolio/portfolio-section-primitives';
import {
  DEFAULT_FOOTER_ACCENT_COLOR,
  DEFAULT_FOOTER_CONNECT_LABEL,
  footerColorLuminance,
  resolveFooterCopyrightLabel,
  resolveFooterInternalLinksColumn,
  resolveFooterLinkHref,
  type PortfolioFooterAutoSectionKey,
  type PortfolioFooterPresentationSettings,
} from '@/components/portfolio/portfolio-footer-settings';
import {
  portfolioEditorialGutterX,
  DEFAULT_CONTENT_GUTTER,
  type PortfolioContentGutter,
} from '@/components/portfolio/portfolio-editorial-layout';

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Rest opacities for every dimmable element — the card itself never dims at rest (it's the
// anchor visual), nav links / social icons read as a clean mid-grey, and the two caption-style
// labels (Links / Connect / copyright) sit slightly lower per the "opacity: 0.6" spec.
const CARD_REST_OPACITY = 1;
const LINK_REST_OPACITY = 0.62;
const LABEL_REST_OPACITY = 0.6;
const UNFOCUSED_OPACITY = 0.12;
const UNFOCUSED_BLUR = 'blur(1.5px)';
const MAX_TILT_DEG = 4;

// Two separate transition classes, same split as this design family's other members: `-dim`
// only ever touches opacity/filter (the GSAP focus choreography), `-mode` only ever touches
// background-color/color (the Light/Dark toggle) — kept apart so neither duration fights the
// other. Every node that carries either class also carries data-pf-no-color-transition so the
// sitewide 620ms color-mode rule (globals.css) can't override these with its own duration.
const CONTACT_CARD_CSS = `
.pf-contactcard-dim {
  transition: opacity 0.45s cubic-bezier(0.16, 1, 0.3, 1), filter 0.45s cubic-bezier(0.16, 1, 0.3, 1);
}
.pf-contactcard-mode {
  transition: background-color 0.5s ease, color 0.5s ease, border-color 0.5s ease;
}
@media (prefers-reduced-motion: reduce) {
  .pf-contactcard-dim,
  .pf-contactcard-mode {
    transition: none !important;
  }
}
`;

function ContactCardStyles() {
  return <style dangerouslySetInnerHTML={{ __html: CONTACT_CARD_CSS }} />;
}

export interface FooterDesignContactCardProps {
  creatorName: string;
  creatorId: string;
  email?: string | null;
  phone?: string | null;
  locationLabel?: string | null;
  links: EditorialContactLink[];
  presentation: PortfolioFooterPresentationSettings;
  visibleSectionLinks?: Partial<Record<PortfolioFooterAutoSectionKey, boolean>>;
  colorMode: 'light' | 'dark';
  /** Site-wide editorial gutter (settings.global.contentGutter) — this design is full-bleed
   *  and bypasses the legacy shell, so this is threaded in to line its own horizontal
   *  padding up with the rest of the page. */
  contentGutter?: PortfolioContentGutter;
}

/**
 * "Contact card" — surgical readability pass over the original design: the accent card is
 * purged of its mini contact icons (address / phone / email now float free, at a much larger,
 * fully-contrasted ink — never the old muted tone-on-tone), and every element *outside* the
 * card (Links label + nav, Connect label, copyright) is re-pitched from illegible caption text
 * to a real typographic hierarchy (uppercase 0.14em-tracked labels at 0.6 opacity, thin airy
 * nav links). The Connect row drops its grey pastille chips so the social glyphs float free
 * with generous spacing. Hovering the card applies a real-time, damped 3D tilt (max 4°, via
 * gsap.quickTo — same smoothed-lag idiom as the site's other magnetic-hover effects); hovering
 * any nav link or social icon snaps that one element to full ink while the card and every other
 * text sink to 0.12 opacity + a 1.5px blur, isolating the focused item. Literal colorMode-
 * branched pure black / pure white, full-bleed and bypassing the legacy padding/pattern shell —
 * same convention as this design family's other members (Compact, Landing, Centered minimal,
 * Monumental) — with its own explicit 0.5s transition on every color/background property so a
 * Light/Dark toggle sweeps the whole composition in one fluid beat.
 */
export function FooterDesignContactCard({
  creatorName,
  creatorId,
  email,
  phone,
  locationLabel,
  links,
  presentation,
  visibleSectionLinks,
  colorMode,
  contentGutter = DEFAULT_CONTENT_GUTTER,
}: FooterDesignContactCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);

  const isLight = colorMode === 'light';
  const bg = isLight ? '#ffffff' : '#0a0a0a';
  const ink = isLight ? '#0a0a0a' : '#fafafa';
  const dividerClass = isLight ? 'border-black/10' : 'border-white/10';

  const accent = presentation.accentColor?.trim() || DEFAULT_FOOTER_ACCENT_COLOR;
  const cardIsLight = footerColorLuminance(accent) > 0.55;
  const cardInk = cardIsLight ? '#0a0a0a' : '#fafafa';

  const phoneTrimmed = presentation.showPhone ? phone?.trim() || null : null;
  const phoneDisplay = phoneTrimmed ? formatPhoneDisplay(phoneTrimmed) : null;
  const emailTrimmed = presentation.showEmail ? email?.trim() || null : null;
  const locationTrimmed = presentation.showLocation ? locationLabel?.trim() || null : null;

  const visibleLinks = presentation.showContactLinks
    ? links.map((link) => {
        const url = link.url.trim();
        let hostname = '';
        try {
          hostname = new URL(/^https?:\/\//i.test(url) ? url : `https://${url}`).hostname.replace(
            /^www\./i,
            ''
          );
        } catch {
          hostname = '';
        }
        const rawLabel = link.label?.trim() ?? '';
        const label =
          link.type === 'WEBSITE' && /^site\s*web$/i.test(rawLabel) ? 'Website' : rawLabel || hostname || url;
        return { ...link, label };
      })
    : [];

  const internalLinks = resolveFooterInternalLinksColumn(presentation, visibleSectionLinks);
  const copyrightText = presentation.showCopyright
    ? resolveFooterCopyrightLabel(presentation.copyrightLabel, creatorName)
    : null;

  // 3D tilt — real-time cursor coordinates over the card, damped through gsap.quickTo (same
  // smoothed-lag idiom as the magnetic-hover effects elsewhere), clamped to ±4°. Skipped on
  // touch/coarse pointers and under reduced motion.
  useLayoutEffect(() => {
    const card = cardRef.current;
    if (!card) return undefined;
    if (prefersReducedMotion()) return undefined;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return undefined;

    let ctx: gsap.Context | undefined;
    try {
      ctx = gsap.context(() => {
        gsap.set(card, { transformPerspective: 1000, transformOrigin: 'center' });
        const setRotateX = gsap.quickTo(card, 'rotateX', { duration: 0.6, ease: 'power3' });
        const setRotateY = gsap.quickTo(card, 'rotateY', { duration: 0.6, ease: 'power3' });

        const onMove = (event: PointerEvent) => {
          const rect = card.getBoundingClientRect();
          const relX = (event.clientX - rect.left) / rect.width - 0.5;
          const relY = (event.clientY - rect.top) / rect.height - 0.5;
          setRotateY(relX * MAX_TILT_DEG * 2);
          setRotateX(relY * -MAX_TILT_DEG * 2);
        };
        const onLeave = () => {
          gsap.to(card, {
            rotateX: 0,
            rotateY: 0,
            duration: 0.8,
            ease: 'elastic.out(1, 0.5)',
            overwrite: 'auto',
          });
        };

        card.addEventListener('pointermove', onMove);
        card.addEventListener('pointerleave', onLeave);
        return () => {
          card.removeEventListener('pointermove', onMove);
          card.removeEventListener('pointerleave', onLeave);
        };
      }, card);
    } catch (error) {
      console.error('[FooterDesignContactCard] tilt failed to initialize', error);
      ctx?.revert();
      gsap.set(card, { clearProps: 'all' });
    }

    return () => ctx?.revert();
  }, []);

  // Focus isolation — hovering a nav link or a social icon snaps it to full ink while the card
  // and every other text sink to 0.12 opacity + a 1.5px blur. Colors are set directly on the
  // DOM node (not via GSAP tween) so every affected node needs data-pf-no-color-transition —
  // otherwise the sitewide color-mode crossfade rule fights the instant snap (see globals.css).
  useLayoutEffect(() => {
    const group = groupRef.current;
    if (!group) return undefined;
    if (prefersReducedMotion()) return undefined;

    const dimTargets = Array.from(group.querySelectorAll<HTMLElement>('[data-contactcard-dim]'));
    const focusItems = Array.from(group.querySelectorAll<HTMLElement>('[data-contactcard-focus-item]'));
    if (dimTargets.length === 0 || focusItems.length === 0) return undefined;

    const restOpacityFor = (el: HTMLElement) => Number(el.dataset.contactcardRest ?? '1');

    let ctx: gsap.Context | undefined;
    try {
      ctx = gsap.context(() => {
        const onEnter = (event: Event) => {
          const target = event.currentTarget as HTMLElement;
          dimTargets.forEach((el) => {
            const isTarget = el === target;
            gsap.to(el, {
              opacity: isTarget ? 1 : UNFOCUSED_OPACITY,
              filter: isTarget ? 'blur(0px)' : UNFOCUSED_BLUR,
              duration: 0.45,
              ease: 'power2.out',
              overwrite: 'auto',
            });
            if (el.hasAttribute('data-contactcard-focus-item')) {
              el.style.color = isTarget ? ink : '';
            }
          });
        };
        const onLeave = () => {
          dimTargets.forEach((el) => {
            gsap.to(el, {
              opacity: restOpacityFor(el),
              filter: 'blur(0px)',
              duration: 0.45,
              ease: 'power2.out',
              overwrite: 'auto',
            });
            if (el.hasAttribute('data-contactcard-focus-item')) {
              el.style.color = '';
            }
          });
        };

        focusItems.forEach((item) => {
          item.addEventListener('mouseenter', onEnter);
          item.addEventListener('mouseleave', onLeave);
        });

        return () => {
          focusItems.forEach((item) => {
            item.removeEventListener('mouseenter', onEnter);
            item.removeEventListener('mouseleave', onLeave);
          });
        };
      }, group);
    } catch (error) {
      console.error('[FooterDesignContactCard] focus-dim animation failed to initialize', error);
      ctx?.revert();
      gsap.set(dimTargets, { clearProps: 'all' });
    }

    return () => ctx?.revert();
  }, [visibleLinks.length, internalLinks.links.length, ink]);

  const navLinkClass =
    'pf-contactcard-dim block w-fit text-xl font-light leading-snug tracking-wide sm:text-2xl';

  return (
    <footer
      id="footer"
      data-creator-id={creatorId}
      className="pf-contactcard-mode relative isolate left-1/2 w-screen -translate-x-1/2 overflow-hidden"
      style={{ backgroundColor: bg, color: ink }}
      data-pf-no-color-transition=""
    >
      <ContactCardStyles />

      <div className={`relative z-[1] w-full pb-12 pt-20 sm:pt-24 lg:pb-16 lg:pt-28 ${portfolioEditorialGutterX(contentGutter)}`}>
        <div
          ref={groupRef}
          className="flex w-full flex-col items-stretch gap-12 lg:flex-row lg:items-start lg:justify-between lg:gap-20 xl:gap-28"
        >
          {/* Left — accent card (icon-free) + free-floating Connect row. */}
          <div className="w-full max-w-md lg:max-w-xl">
            <div
              ref={cardRef}
              data-contactcard-dim=""
              data-contactcard-rest={CARD_REST_OPACITY}
              data-pf-no-color-transition=""
              className="pf-contactcard-dim pf-contactcard-mode rounded-[1.75rem] px-10 py-12 will-change-transform sm:px-14 sm:py-16"
              style={{ backgroundColor: accent, color: cardInk, opacity: CARD_REST_OPACITY }}
            >
              <div className="flex flex-col">
                {presentation.showBrand !== false ? (
                  <p className="text-3xl font-semibold tracking-tight sm:text-[2rem]" style={{ color: cardInk }}>
                    {creatorName}
                  </p>
                ) : null}
                {locationTrimmed ? (
                  <p className="mt-4 text-lg leading-relaxed sm:text-xl" style={{ color: cardInk }}>
                    {locationTrimmed}
                  </p>
                ) : null}
                {phoneDisplay || emailTrimmed ? (
                  <div className="mt-8 flex flex-col gap-3">
                    {phoneDisplay ? (
                      <a
                        href={`tel:${phoneTrimmed!.replace(/\s+/g, '')}`}
                        className="w-fit text-xl font-semibold leading-snug sm:text-2xl"
                        style={{ color: cardInk }}
                      >
                        {phoneDisplay}
                      </a>
                    ) : null}
                    {emailTrimmed ? (
                      <a
                        href={`mailto:${emailTrimmed}`}
                        className="w-fit break-all text-xl font-semibold leading-snug sm:text-2xl"
                        style={{ color: cardInk }}
                      >
                        {emailTrimmed}
                      </a>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>

            {visibleLinks.length > 0 ? (
              <div className="mt-8 flex flex-wrap items-center gap-6 sm:gap-7">
                <span
                  data-contactcard-dim=""
                  data-contactcard-rest={LABEL_REST_OPACITY}
                  className="pf-contactcard-dim text-sm font-semibold uppercase tracking-[0.14em] sm:text-base"
                  style={{ opacity: LABEL_REST_OPACITY }}
                >
                  {DEFAULT_FOOTER_CONNECT_LABEL}
                </span>
                <nav className="flex flex-wrap items-center gap-6 sm:gap-8" aria-label="Social">
                  {visibleLinks.map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={link.label}
                      title={link.label}
                      data-contactcard-dim=""
                      data-contactcard-focus-item=""
                      data-contactcard-rest={LINK_REST_OPACITY}
                      data-pf-no-color-transition=""
                      className="pf-contactcard-dim inline-flex items-center justify-center"
                      style={{ opacity: LINK_REST_OPACITY }}
                    >
                      <FooterSocialLinkIcon link={link} bare iconClassName="h-6 w-6" />
                    </a>
                  ))}
                </nav>
              </div>
            ) : null}
          </div>

          {/* Right — Links label + nav, copyright. */}
          {internalLinks.links.length > 0 || copyrightText ? (
            <div className="min-w-0 w-full max-w-xs shrink-0 lg:pt-2">
              {internalLinks.links.length > 0 ? (
                <>
                  <p
                    data-contactcard-dim=""
                    data-contactcard-rest={LABEL_REST_OPACITY}
                    className="pf-contactcard-dim text-sm font-semibold uppercase tracking-[0.14em] sm:text-base"
                    style={{ opacity: LABEL_REST_OPACITY }}
                  >
                    {internalLinks.title}
                  </p>
                  <ul className="mt-6 space-y-4 sm:space-y-5">
                    {internalLinks.links.map((link) => {
                      const href = resolveFooterLinkHref(link.href, creatorId);
                      const external = href.startsWith('http') || href.startsWith('mailto:');
                      return (
                        <li key={link.id}>
                          {external ? (
                            <a
                              href={href}
                              data-contactcard-dim=""
                              data-contactcard-focus-item=""
                              data-contactcard-rest={LINK_REST_OPACITY}
                              data-pf-no-color-transition=""
                              className={navLinkClass}
                              style={{ opacity: LINK_REST_OPACITY }}
                              {...(href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})}
                            >
                              {link.label}
                            </a>
                          ) : (
                            <Link
                              href={href}
                              data-contactcard-dim=""
                              data-contactcard-focus-item=""
                              data-contactcard-rest={LINK_REST_OPACITY}
                              data-pf-no-color-transition=""
                              className={navLinkClass}
                              style={{ opacity: LINK_REST_OPACITY }}
                            >
                              {link.label}
                            </Link>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </>
              ) : null}

              {copyrightText ? (
                <p
                  data-contactcard-dim=""
                  data-contactcard-rest={LABEL_REST_OPACITY}
                  className={`pf-contactcard-dim text-xs font-medium uppercase tracking-[0.14em] sm:text-sm ${
                    internalLinks.links.length > 0 ? `mt-10 border-t pt-5 ${dividerClass}` : ''
                  }`}
                  style={{ opacity: LABEL_REST_OPACITY }}
                >
                  {copyrightText}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </footer>
  );
}

export function FooterContactCardWireframe() {
  return (
    <svg viewBox="0 0 120 72" className="pf-stack-mini h-[4.35rem] w-full" aria-hidden>
      <rect className="pf-stack-mini-stage" x="1.25" y="1.25" width="117.5" height="69.5" rx="9" />
      <rect className="pf-stack-mini-accent" x="8" y="12" width="42" height="42" rx="6" opacity={0.85} />
      <rect className="pf-stack-mini-ink" x="15" y="19" width="20" height="4" rx="2" />
      <rect className="pf-stack-mini-ink" x="15" y="28" width="26" height="2.5" rx="1.25" />
      <rect className="pf-stack-mini-ink" x="15" y="34" width="22" height="2.5" rx="1.25" />
      <rect className="pf-stack-mini-ink" x="15" y="40" width="24" height="2.5" rx="1.25" />
      <circle className="pf-stack-mini-mute" cx="16" cy="58" r="2" />
      <circle className="pf-stack-mini-mute" cx="24" cy="58" r="2" />
      <circle className="pf-stack-mini-mute" cx="32" cy="58" r="2" />
      <rect className="pf-stack-mini-mute" x="76" y="18" width="16" height="2.5" rx="1.25" />
      <rect className="pf-stack-mini-mute" x="76" y="27" width="16" height="2.5" rx="1.25" />
      <rect className="pf-stack-mini-mute" x="76" y="36" width="16" height="2.5" rx="1.25" />
      <rect className="pf-stack-mini-mute" x="76" y="58" width="28" height="2" rx="1" />
    </svg>
  );
}
