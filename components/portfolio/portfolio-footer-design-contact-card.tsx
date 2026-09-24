'use client';

import Link from 'next/link';
import gsap from 'gsap';
import { useLayoutEffect, useRef, type CSSProperties } from 'react';
import { formatPhoneDisplay } from '@/lib/phone';
import {
  FooterSocialLinkIcon,
  type EditorialContactLink,
} from '@/components/portfolio/portfolio-section-primitives';
import {
  footerColorLuminance,
  resolveFooterCopyrightLabel,
  type PortfolioFooterPresentationSettings,
} from '@/components/portfolio/portfolio-footer-settings';
import {
  DEFAULT_FOOTER_PALETTE,
  mergeFooterPalette,
} from '@/components/portfolio/portfolio-footer-palette-settings';
import { resolveHeroPaletteColor } from '@/components/portfolio/portfolio-hero-palette-settings';
import type { FooterDesignLayoutResolver } from '@/components/portfolio/portfolio-footer-design-layout';
import {
  portfolioEditorialGutterX,
  DEFAULT_CONTENT_GUTTER,
  type PortfolioContentGutter,
} from '@/components/portfolio/portfolio-editorial-layout';

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

const MAX_TILT_DEG = 4;

// `-mode` only ever touches background-color/color (the Light/Dark toggle). Every node that
// carries this class also carries data-pf-no-color-transition so the sitewide 620ms color-mode
// rule (globals.css) can't override it with its own duration.
const CONTACT_CARD_CSS = `
.pf-contactcard-mode {
  transition: background-color 0.5s ease, color 0.5s ease, border-color 0.5s ease;
}
@media (prefers-reduced-motion: reduce) {
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
  /** Section links picked in Layout settings — already filtered to visible sections. */
  navLinks: { id: string; label: string; url: string }[];
  layout: FooterDesignLayoutResolver;
  presentation: PortfolioFooterPresentationSettings;
  colorMode: 'light' | 'dark';
  /** Site-wide editorial gutter (settings.global.contentGutter) — this design is full-bleed
   *  and bypasses the legacy shell, so this is threaded in to line its own horizontal
   *  padding up with the rest of the page. */
  contentGutter?: PortfolioContentGutter;
  /** Resolved from the Footer section's own Background tab (`sectionBackgroundStyle`) —
   *  `undefined` when that tab is off, so this canvas is transparent (the page/global
   *  wallpaper shows through) by default, same as every other Footer design now. */
  backgroundStyle?: CSSProperties;
  /** Multiplies every standardized body/label text size via `--pf-footer-font-scale` —
   *  see the Footer section's General tab "Font size" control. */
  fontSizeScale?: number;
}

/**
 * "Contact card" — surgical readability pass over the original design: the accent card is
 * purged of its mini contact icons (address / phone / email now float free, at a much larger,
 * fully-contrasted ink — never the old muted tone-on-tone), and every element *outside* the
 * card (Links label + nav, Connect label, copyright) is re-pitched from illegible caption text
 * to a real typographic hierarchy (uppercase 0.14em-tracked labels, thin airy nav links) that
 * reads at full opacity. The Connect row drops its grey pastille chips so the social glyphs
 * float free with generous spacing. Hovering the card applies a real-time, damped 3D tilt (max
 * 4°, via gsap.quickTo — same smoothed-lag idiom as the site's other magnetic-hover effects),
 * a self-contained effect on the card alone. Hovering a nav link or social icon is likewise a
 * self-contained CSS opacity accent on that element only — no other element in the footer ever
 * dims. Literal colorMode-branched pure black / pure white, full-bleed and bypassing the legacy
 * padding/pattern shell — same convention as this design family's other members (Compact,
 * Landing, Centered minimal, Monumental) — with its own explicit 0.5s transition on every
 * color/background property so a Light/Dark toggle sweeps the whole composition in one fluid
 * beat.
 */
export function FooterDesignContactCard({
  creatorName,
  creatorId,
  email,
  phone,
  locationLabel,
  links,
  navLinks,
  layout,
  presentation,
  colorMode,
  contentGutter = DEFAULT_CONTENT_GUTTER,
  backgroundStyle,
  fontSizeScale = 1,
}: FooterDesignContactCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const isLight = colorMode === 'light';
  const ink = isLight ? '#0a0a0a' : '#fafafa';
  const dividerClass = isLight ? 'border-black/10' : 'border-white/10';

  const contactCardPalette = mergeFooterPalette(DEFAULT_FOOTER_PALETTE, presentation.footerPalette);
  const accent = resolveHeroPaletteColor(contactCardPalette, presentation.contactCardColorToken ?? 'principal');
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

  const connectHeading = layout.text('connectLabel');
  const linksHeading = layout.text('linksLabel');
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

  const navLinkClass = 'block w-fit font-light leading-snug tracking-wide transition-opacity duration-300 hover:opacity-70';
  const navLinkStyle: CSSProperties = {
    fontSize: 'calc(var(--pf-footer-body-size) * var(--pf-footer-font-scale, 1))',
  };

  return (
    <footer
      id="footer"
      data-creator-id={creatorId}
      className="pf-contactcard-mode relative isolate left-1/2 w-screen -translate-x-1/2 overflow-hidden"
      style={{ ...backgroundStyle, color: ink, '--pf-footer-font-scale': fontSizeScale } as CSSProperties}
      data-pf-no-color-transition=""
    >
      <ContactCardStyles />

      <div className={`relative z-[1] w-full pb-12 pt-20 sm:pt-24 lg:pb-16 lg:pt-28 ${portfolioEditorialGutterX(contentGutter)}`}>
        <div className="flex w-full flex-col items-stretch gap-12 lg:flex-row lg:items-start lg:justify-between lg:gap-20 xl:gap-28">
          {/* Left — accent card (icon-free) + free-floating Connect row. */}
          <div className="w-full max-w-md lg:max-w-xl">
            <div
              ref={cardRef}
              data-pf-no-color-transition=""
              className="pf-contactcard-mode rounded-[1.75rem] px-10 py-12 will-change-transform sm:px-14 sm:py-16"
              style={{ backgroundColor: accent, color: cardInk }}
            >
              <div className="flex flex-col">
                {layout.isVisible('name') ? (
                  <p className="text-3xl font-semibold tracking-tight sm:text-[2rem]" style={{ color: cardInk }}>
                    {creatorName}
                  </p>
                ) : null}
                {locationTrimmed ? (
                  <p
                    className="mt-4 leading-relaxed"
                    style={{ color: cardInk, fontSize: 'calc(var(--pf-footer-body-size) * var(--pf-footer-font-scale, 1))' }}
                  >
                    {locationTrimmed}
                  </p>
                ) : null}
                {phoneDisplay || emailTrimmed ? (
                  <div className="mt-8 flex flex-col gap-3">
                    {phoneDisplay ? (
                      <a
                        href={`tel:${phoneTrimmed!.replace(/\s+/g, '')}`}
                        className="w-fit font-semibold leading-snug"
                        style={{ color: cardInk, fontSize: 'calc(var(--pf-footer-body-size) * var(--pf-footer-font-scale, 1))' }}
                      >
                        {phoneDisplay}
                      </a>
                    ) : null}
                    {emailTrimmed ? (
                      <a
                        href={`mailto:${emailTrimmed}`}
                        className="w-fit break-all font-semibold leading-snug"
                        style={{ color: cardInk, fontSize: 'calc(var(--pf-footer-body-size) * var(--pf-footer-font-scale, 1))' }}
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
                {connectHeading ? (
                  <span
                    className="font-semibold uppercase tracking-[0.14em]"
                    style={{ fontSize: 'calc(var(--pf-footer-label-size) * var(--pf-footer-font-scale, 1))' }}
                  >
                    {connectHeading}
                  </span>
                ) : null}
                <nav className="flex flex-wrap items-center gap-6 sm:gap-8" aria-label="Social">
                  {visibleLinks.map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={link.label}
                      title={link.label}
                      data-pf-no-color-transition=""
                      className="inline-flex items-center justify-center transition-opacity duration-300 hover:opacity-70"
                    >
                      <FooterSocialLinkIcon link={link} bare iconClassName="h-6 w-6" />
                    </a>
                  ))}
                </nav>
              </div>
            ) : null}
          </div>

          {/* Right — Links label + nav, copyright. */}
          {navLinks.length > 0 || copyrightText ? (
            <div className="min-w-0 w-full max-w-xs shrink-0 lg:pt-2">
              {navLinks.length > 0 ? (
                <>
                  {linksHeading ? (
                    <p
                      className="mb-6 font-semibold uppercase tracking-[0.14em]"
                      style={{ fontSize: 'calc(var(--pf-footer-label-size) * var(--pf-footer-font-scale, 1))' }}
                    >
                      {linksHeading}
                    </p>
                  ) : null}
                  <ul className="space-y-4 sm:space-y-5">
                    {navLinks.map((link) => {
                      const href = link.url;
                      const external = href.startsWith('http') || href.startsWith('mailto:');
                      return (
                        <li key={link.id}>
                          {external ? (
                            <a
                              href={href}
                              data-pf-no-color-transition=""
                              className={navLinkClass}
                              style={navLinkStyle}
                              {...(href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})}
                            >
                              {link.label}
                            </a>
                          ) : (
                            <Link href={href} data-pf-no-color-transition="" className={navLinkClass} style={navLinkStyle}>
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
                  className={`font-medium uppercase tracking-[0.14em] ${
                    navLinks.length > 0 ? `mt-10 border-t pt-5 ${dividerClass}` : ''
                  }`}
                  style={{ fontSize: 'calc(var(--pf-footer-label-size) * var(--pf-footer-font-scale, 1))' }}
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
    <svg viewBox="0 0 120 72" preserveAspectRatio="none" className="pf-stack-mini h-[4.35rem] w-full" aria-hidden>
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
