'use client';

import Link from 'next/link';
import type { CSSProperties } from 'react';
import { formatPhoneDisplay } from '@/lib/phone';
import {
  FooterContactIcon,
  FooterSocialLinkIcon,
  type EditorialContactLink,
} from '@/components/portfolio/portfolio-section-primitives';
import type { PortfolioFooterPresentationSettings } from '@/components/portfolio/portfolio-footer-settings';
import type { FooterDesignLayoutResolver } from '@/components/portfolio/portfolio-footer-design-layout';
import {
  portfolioEditorialGutterX,
  DEFAULT_CONTENT_GUTTER,
  type PortfolioContentGutter,
} from '@/components/portfolio/portfolio-editorial-layout';

export interface FooterDesignCenteredMinimalProps {
  creatorName: string;
  creatorId: string;
  avatarUrl?: string | null;
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
 * "Centered minimal" — purified rework of the default footer: the ringed/boxed social icons
 * are gone, so are the fine top rule and inter-block dividers; white space alone separates the
 * blocks. The identity (avatar / name / custom mark) stays crisp. Nav links, bare social icons,
 * and bare contact chips all read at full, normal opacity — hovering a nav link or icon only
 * gives that element itself a light opacity dip via plain CSS, never affecting any other element.
 * No copyright line — this design intentionally ignores the shared "Copyright" Meta toggle.
 * Literal colorMode-branched pure black / pure white, bypassing the generic per-element color
 * pickers like its siblings.
 */
export function FooterDesignCenteredMinimal({
  creatorName,
  creatorId,
  avatarUrl,
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
}: FooterDesignCenteredMinimalProps) {
  const isLight = colorMode === 'light';
  const ink = isLight ? '#000000' : '#ffffff';
  const identityBorder = isLight ? 'rgba(0,0,0,0.14)' : 'rgba(255,255,255,0.16)';
  const identityFill = isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.06)';

  const centeredIdentity = presentation.centeredIdentity ?? 'name';
  const customLogoUrl = presentation.centeredCustomLogoUrl?.trim();
  const customText = layout.text('identityText', creatorName) ?? creatorName;
  const avatarTrimmed = avatarUrl?.trim() || null;

  const centeredInitials =
    creatorName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || 'NP';

  const phoneTrimmed = presentation.showPhone ? phone?.trim() || null : null;
  const phoneDisplay = phoneTrimmed ? formatPhoneDisplay(phoneTrimmed) : null;
  const emailTrimmed = presentation.showEmail ? email?.trim() || null : null;
  const locationTrimmed = presentation.showLocation ? locationLabel?.trim() || null : null;
  const hoursTrimmed = presentation.showHours ? hoursLabel?.trim() || null : null;

  const contactItems: {
    id: string;
    label: string;
    href?: string;
    icon: 'phone' | 'email' | 'location' | 'hours';
  }[] = [];
  if (phoneDisplay) {
    contactItems.push({
      id: 'phone',
      label: phoneDisplay,
      href: `tel:${phoneTrimmed!.replace(/\s+/g, '')}`,
      icon: 'phone',
    });
  }
  if (emailTrimmed) {
    contactItems.push({ id: 'email', label: emailTrimmed, href: `mailto:${emailTrimmed}`, icon: 'email' });
  }
  if (locationTrimmed) {
    contactItems.push({ id: 'location', label: locationTrimmed, icon: 'location' });
  }
  if (hoursTrimmed) {
    contactItems.push({ id: 'hours', label: hoursTrimmed, icon: 'hours' });
  }

  const visibleLinks =
    presentation.showContactLinks !== false
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

  const identity = !layout.isVisible('identity') ? null : centeredIdentity === 'avatar' ? (
      avatarTrimmed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatarTrimmed} alt={`${creatorName} avatar`} className="h-16 w-16 rounded-full object-cover" />
      ) : (
        <span
          className="flex h-16 w-16 items-center justify-center rounded-full border text-base font-semibold"
          style={{ color: ink, borderColor: identityBorder, backgroundColor: identityFill }}
          aria-label={creatorName}
        >
          {centeredInitials}
        </span>
      )
    ) : centeredIdentity === 'custom' && customLogoUrl ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={customLogoUrl} alt={customText} className="max-h-16 max-w-[15rem] object-contain" />
    ) : (
      <p className="text-2xl font-semibold tracking-tight sm:text-[1.75rem]" style={{ color: ink }}>
        {centeredIdentity === 'custom' ? customText : creatorName}
      </p>
    );

  return (
    <footer
      id="footer"
      data-creator-id={creatorId}
      className="relative isolate left-1/2 w-screen -translate-x-1/2 overflow-hidden"
      style={{ ...backgroundStyle, color: ink, '--pf-footer-font-scale': fontSizeScale } as CSSProperties}
      data-pf-no-color-transition=""
    >
      <div className={`relative z-[1] mx-auto flex w-full max-w-4xl flex-col items-center gap-10 py-20 text-center sm:gap-9 sm:py-24 lg:py-28 ${portfolioEditorialGutterX(contentGutter)}`}>
        {identity ? <div className="flex justify-center">{identity}</div> : null}

        <div className="flex w-full flex-col items-center gap-10 sm:gap-9">
          {navLinks.length > 0 ? (
            <nav
              className="flex max-w-3xl flex-wrap items-center justify-center gap-x-8 gap-y-5 sm:gap-x-10"
              aria-label="Portfolio sections"
            >
              {navLinks.map((item) => {
                return (
                  <Link
                    key={item.id}
                    href={item.url}
                    aria-label={`Go to ${item.label}`}
                    data-pf-no-color-transition=""
                    className="inline-block font-semibold uppercase transition-opacity duration-300 hover:opacity-70"
                    style={{
                      color: ink,
                      letterSpacing: '0.14em',
                      fontSize: 'calc(var(--pf-footer-body-size) * var(--pf-footer-font-scale, 1))',
                    }}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          ) : null}

          {visibleLinks.length > 0 || contactItems.length > 0 ? (
            <nav
              className="flex flex-wrap items-center justify-center gap-x-8 gap-y-6 sm:gap-x-9"
              aria-label="Social and contact links"
            >
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
                  style={{ color: ink }}
                >
                  <FooterSocialLinkIcon link={link} bare iconClassName="h-5 w-5" />
                </a>
              ))}
              {contactItems.map((item) => {
                const glyph = <FooterContactIcon type={item.icon} className="h-[1.15rem] w-[1.15rem]" />;
                if (item.href) {
                  return (
                    <a
                      key={item.id}
                      href={item.href}
                      aria-label={item.label}
                      title={item.label}
                      data-pf-no-color-transition=""
                      className="inline-flex items-center justify-center transition-opacity duration-300 hover:opacity-70"
                      style={{ color: ink }}
                    >
                      {glyph}
                    </a>
                  );
                }
                return (
                  <span
                    key={item.id}
                    aria-label={item.label}
                    title={item.label}
                    className="inline-flex items-center justify-center"
                    style={{ color: ink }}
                  >
                    {glyph}
                  </span>
                );
              })}
            </nav>
          ) : null}
        </div>
      </div>
    </footer>
  );
}

export function FooterCenteredMinimalWireframe() {
  return (
    <svg viewBox="0 0 120 72" preserveAspectRatio="none" className="pf-stack-mini h-[4.35rem] w-full" aria-hidden>
      <rect className="pf-stack-mini-stage" x="1.25" y="1.25" width="117.5" height="69.5" rx="9" />
      <rect className="pf-stack-mini-ink" x="42" y="13" width="36" height="7" rx="2" />
      <rect className="pf-stack-mini-mute" x="34" y="30" width="13" height="2.5" rx="1.25" />
      <rect className="pf-stack-mini-mute" x="53" y="30" width="14" height="2.5" rx="1.25" />
      <rect className="pf-stack-mini-mute" x="73" y="30" width="13" height="2.5" rx="1.25" />
      <circle className="pf-stack-mini-mute" cx="48" cy="48" r="2.2" />
      <circle className="pf-stack-mini-mute" cx="58" cy="48" r="2.2" />
      <circle className="pf-stack-mini-mute" cx="68" cy="48" r="2.2" />
      <circle className="pf-stack-mini-mute" cx="78" cy="48" r="2.2" />
      <rect className="pf-stack-mini-mute" x="50" y="61" width="20" height="2" rx="1" />
    </svg>
  );
}
