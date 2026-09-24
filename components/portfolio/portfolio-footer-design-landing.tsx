'use client';

import Link from 'next/link';
import type { CSSProperties } from 'react';
import { formatPhoneDisplay } from '@/lib/phone';
import { FooterSocialLinkIcon, type EditorialContactLink } from '@/components/portfolio/portfolio-section-primitives';
import type { PortfolioFooterPresentationSettings } from '@/components/portfolio/portfolio-footer-settings';
import type { FooterDesignLayoutResolver } from '@/components/portfolio/portfolio-footer-design-layout';
import {
  portfolioEditorialGutterX,
  DEFAULT_CONTENT_GUTTER,
  type PortfolioContentGutter,
} from '@/components/portfolio/portfolio-editorial-layout';

const LABEL_OPACITY = 0.4;

const LANDING_CSS = `
.pf-flanding-mode {
  transition: background-color 0.5s cubic-bezier(0.16, 1, 0.3, 1), color 0.5s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}
@media (prefers-reduced-motion: reduce) {
  .pf-flanding-mode {
    transition: none !important;
  }
}
`;

function LandingStyles() {
  return <style dangerouslySetInnerHTML={{ __html: LANDING_CSS }} />;
}

export interface FooterDesignLandingProps {
  creatorName: string;
  creatorId: string;
  avatarUrl?: string | null;
  bio?: string | null;
  email?: string | null;
  phone?: string | null;
  locationLabel?: string | null;
  hoursLabel?: string | null;
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
 * "Landing columns" — total rework of the three-column Swiss layout: the two vertical grey
 * rules between blocks are gone (whitespace alone separates them now), the rounded-square
 * social chips on the left are bare floating vectors, and the little phone/email/pin/clock
 * glyphs in the center column are gone entirely — just larger, breathable coordinate lines.
 * "Contact"/"Links" column labels are tiny, feutré, wide-tracked caps. Everything else (bio,
 * social icons, contact lines, nav links) reads at full ink at rest — no dimmed baseline, and no
 * sibling ever dims when another element is hovered. Literal colorMode-branched pure black /
 * pure white, with an explicit 0.5s transition on the mode-bearing chrome, so a Light/Dark toggle
 * sweeps the composition smoothly.
 * No boxed CTA-button chrome — same "typography and whitespace only" bypass as this design
 * family's other members (Compact, Headline reveal, Centered minimal, …). No hardcoded
 * closing copyright line either — that bar was extracted into the shared Mini bar catalog's
 * own "Landing" variant (see footer-minibar-catalog-extraction memory), toggled on
 * separately via Footer > Design > "Mini bar" rather than being always-on here.
 */
export function FooterDesignLanding({
  creatorName,
  creatorId,
  avatarUrl,
  bio,
  email,
  phone,
  locationLabel,
  hoursLabel,
  links,
  navLinks,
  layout,
  presentation,
  colorMode,
  contentGutter = DEFAULT_CONTENT_GUTTER,
  backgroundStyle,
  fontSizeScale = 1,
}: FooterDesignLandingProps) {
  const isLight = colorMode === 'light';
  const ink = isLight ? '#000000' : '#ffffff';
  const identityBorder = isLight ? 'rgba(0,0,0,0.14)' : 'rgba(255,255,255,0.16)';
  const identityFill = isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.06)';

  const brandInitials =
    creatorName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || 'NP';

  const showName = layout.isVisible('name');
  const showAvatar = layout.isVisible('avatar');
  const description = layout.bio('bio', bio, 280);
  const contactHeading = layout.text('contactLabel');
  const linksHeading = layout.text('linksLabel');

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

  const phoneTrimmed = presentation.showPhone ? phone?.trim() || null : null;
  const phoneDisplay = phoneTrimmed ? formatPhoneDisplay(phoneTrimmed) : null;
  const emailTrimmed = presentation.showEmail ? email?.trim() || null : null;
  const locationTrimmed = presentation.showLocation ? locationLabel?.trim() || null : null;
  const hoursTrimmed = presentation.showHours ? hoursLabel?.trim() || null : null;

  const contactItems: { id: string; label: string; href?: string }[] = [];
  if (phoneDisplay) {
    contactItems.push({ id: 'phone', label: phoneDisplay, href: `tel:${phoneTrimmed!.replace(/\s+/g, '')}` });
  }
  if (emailTrimmed) {
    contactItems.push({ id: 'email', label: emailTrimmed, href: `mailto:${emailTrimmed}` });
  }
  if (locationTrimmed) {
    contactItems.push({ id: 'location', label: locationTrimmed });
  }
  if (hoursTrimmed) {
    contactItems.push({ id: 'hours', label: hoursTrimmed });
  }

  return (
    <footer
      id="footer"
      data-creator-id={creatorId}
      className="pf-flanding-mode relative isolate left-1/2 w-screen -translate-x-1/2 overflow-hidden"
      style={{ ...backgroundStyle, color: ink, '--pf-footer-font-scale': fontSizeScale } as CSSProperties}
    >
      <LandingStyles />

      <div className={`relative z-[1] w-full pb-10 pt-20 sm:pt-24 lg:pt-28 ${portfolioEditorialGutterX(contentGutter)}`}>
        <div className="flex w-full flex-col gap-14 md:flex-row md:items-start md:justify-between md:gap-x-16 lg:gap-x-24">
          {/* Left — identity, bio, bare social icons */}
          <div className="flex min-w-0 max-w-md flex-col gap-6 text-left">
            {showName || showAvatar ? (
              <div className="flex items-center gap-3">
                {showAvatar && avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl} alt="" className="h-12 w-12 rounded-full object-cover" />
                ) : showAvatar ? (
                  <span
                    className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-semibold"
                    style={{ color: ink, borderColor: identityBorder, backgroundColor: identityFill, border: '1px solid' }}
                    aria-hidden
                  >
                    {brandInitials}
                  </span>
                ) : null}
                {showName ? (
                  <p className="pf-flanding-mode text-3xl font-semibold tracking-tight sm:text-[2.25rem]" style={{ color: ink }}>
                    {creatorName}
                  </p>
                ) : null}
              </div>
            ) : null}

            {description ? (
              <p
                className="max-w-sm leading-relaxed"
                style={{ color: ink, fontSize: 'calc(var(--pf-footer-body-size) * var(--pf-footer-font-scale, 1))' }}
              >
                {description}
              </p>
            ) : null}

            {visibleLinks.length > 0 ? (
              <nav className="flex flex-wrap items-center gap-6 sm:gap-7" aria-label="Social">
                {visibleLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={link.label}
                    title={link.label}
                    data-pf-no-color-transition=""
                    className="inline-flex items-center justify-center"
                    style={{ color: ink }}
                  >
                    <FooterSocialLinkIcon link={link} bare iconClassName="h-5 w-5" />
                  </a>
                ))}
              </nav>
            ) : null}
          </div>

          {/* Center — Contact coordinates, no glyphs */}
          {contactItems.length > 0 ? (
            <div className="flex min-w-0 max-w-xs flex-col gap-5 text-left md:pt-1">
              {contactHeading ? (
                <p
                  className="pf-flanding-mode font-semibold uppercase"
                  style={{
                    opacity: LABEL_OPACITY,
                    color: ink,
                    letterSpacing: '0.16em',
                    fontSize: 'calc(var(--pf-footer-label-size) * var(--pf-footer-font-scale, 1))',
                  }}
                >
                  {contactHeading}
                </p>
              ) : null}
              <ul className="flex flex-col gap-6">
                {contactItems.map((item) => (
                  <li key={item.id}>
                    {item.href ? (
                      <a
                        href={item.href}
                        data-pf-no-color-transition=""
                        className="inline-block w-fit"
                        style={{ color: ink, fontSize: 'calc(var(--pf-footer-body-size) * var(--pf-footer-font-scale, 1))' }}
                      >
                        {item.label}
                      </a>
                    ) : (
                      <p
                        className="w-fit max-w-[16rem]"
                        style={{ color: ink, fontSize: 'calc(var(--pf-footer-body-size) * var(--pf-footer-font-scale, 1))' }}
                      >
                        {item.label}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {/* Right — nav links, thin and airy */}
          {navLinks.length > 0 ? (
            <div className="flex min-w-0 max-w-xs flex-col gap-5 text-left md:pt-1">
              {linksHeading ? (
                <p
                  className="pf-flanding-mode font-semibold uppercase"
                  style={{
                    opacity: LABEL_OPACITY,
                    color: ink,
                    letterSpacing: '0.16em',
                    fontSize: 'calc(var(--pf-footer-label-size) * var(--pf-footer-font-scale, 1))',
                  }}
                >
                  {linksHeading}
                </p>
              ) : null}
              <ul className="flex flex-col gap-5">
                {navLinks.map((link) => {
                  const href = link.url;
                  const external = href.startsWith('http') || href.startsWith('mailto:');
                  const itemProps = {
                    'data-pf-no-color-transition': '',
                    className: 'inline-block w-fit font-light',
                    style: {
                      color: ink,
                      fontSize: 'calc(var(--pf-footer-body-size) * var(--pf-footer-font-scale, 1))',
                    },
                  } as const;
                  return (
                    <li key={link.id}>
                      {external ? (
                        <a
                          href={href}
                          {...itemProps}
                          {...(href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})}
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link href={href} {...itemProps}>
                          {link.label}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </footer>
  );
}

export function FooterLandingWireframe() {
  return (
    <svg viewBox="0 0 120 72" preserveAspectRatio="none" className="pf-stack-mini h-[4.35rem] w-full" aria-hidden>
      <rect className="pf-stack-mini-stage" x="1.25" y="1.25" width="117.5" height="69.5" rx="9" />
      <rect className="pf-stack-mini-ink" x="8" y="14" width="26" height="6" rx="2" />
      <rect className="pf-stack-mini-mute" x="8" y="26" width="30" height="2.5" rx="1.25" />
      <rect className="pf-stack-mini-mute" x="8" y="32" width="24" height="2.5" rx="1.25" />
      <circle className="pf-stack-mini-mute" cx="10" cy="42" r="1.8" />
      <circle className="pf-stack-mini-mute" cx="17" cy="42" r="1.8" />
      <circle className="pf-stack-mini-mute" cx="24" cy="42" r="1.8" />
      <rect className="pf-stack-mini-mute" x="54" y="14" width="16" height="2" rx="1" opacity={0.5} />
      <rect className="pf-stack-mini-mute" x="54" y="22" width="18" height="2.5" rx="1.25" />
      <rect className="pf-stack-mini-mute" x="54" y="30" width="18" height="2.5" rx="1.25" />
      <rect className="pf-stack-mini-mute" x="80" y="14" width="16" height="2" rx="1" opacity={0.5} />
      <rect className="pf-stack-mini-mute" x="80" y="22" width="14" height="2.5" rx="1.25" />
      <rect className="pf-stack-mini-mute" x="80" y="29" width="14" height="2.5" rx="1.25" />
      <rect className="pf-stack-mini-mute" x="80" y="36" width="14" height="2.5" rx="1.25" />
    </svg>
  );
}
