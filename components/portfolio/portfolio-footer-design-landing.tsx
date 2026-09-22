'use client';

import gsap from 'gsap';
import Link from 'next/link';
import { useLayoutEffect, useRef } from 'react';
import { formatPhoneDisplay } from '@/lib/phone';
import { FooterSocialLinkIcon, type EditorialContactLink } from '@/components/portfolio/portfolio-section-primitives';
import {
  resolveFooterCopyrightLabel,
  resolveFooterDescription,
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

/** Real hover + fine pointer only — touch "hover" would get stuck mid-focus with no way out. */
function supportsKineticHover(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
    window.matchMedia('(min-width: 768px)').matches
  );
}

const RESTING_OPACITY = 0.55;
const UNFOCUSED_OPACITY = 0.08;
const UNFOCUSED_BLUR = 'blur(1.5px)';
const LABEL_OPACITY = 0.4;

const LANDING_CSS = `
.pf-flanding-dim {
  transition: opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1), filter 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}
.pf-flanding-mode {
  transition: background-color 0.5s cubic-bezier(0.16, 1, 0.3, 1), color 0.5s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}
@media (prefers-reduced-motion: reduce) {
  .pf-flanding-dim,
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
  presentation: PortfolioFooterPresentationSettings;
  visibleSectionLinks?: Partial<Record<PortfolioFooterAutoSectionKey, boolean>>;
  colorMode: 'light' | 'dark';
  /** Site-wide editorial gutter (settings.global.contentGutter) — this design is full-bleed
   *  and bypasses the legacy shell, so this is threaded in to line its own horizontal
   *  padding up with the rest of the page. */
  contentGutter?: PortfolioContentGutter;
}

/**
 * "Landing columns" — total rework of the three-column Swiss layout: the two vertical grey
 * rules between blocks are gone (whitespace alone separates them now), the rounded-square
 * social chips on the left are bare floating vectors, and the little phone/email/pin/clock
 * glyphs in the center column are gone entirely — just larger, breathable coordinate lines.
 * "Contact"/"Links" column labels are tiny, feutré, wide-tracked caps that never enter the
 * hover choreography. Everything else (bio, social icons, contact lines, nav links) rests at
 * RESTING_OPACITY and snaps to full ink + a damped-spring 4px lift on hover — sideways for the
 * horizontal social row, upward for the two vertical column lists — while every other member of
 * that group across all three columns sinks to a near-invisible blurred hush. The brand name is
 * the one exception: it never joins the dim group, staying crisp at all times. Literal
 * colorMode-branched pure black / pure white with an explicit 0.5s transition on every color and
 * blur property, so a Light/Dark toggle sweeps the whole purified composition in one fluid beat.
 * No boxed CTA-button chrome — same "typography and whitespace only" bypass as this design
 * family's other members (Compact, Headline reveal, Centered minimal, …).
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
  presentation,
  visibleSectionLinks,
  colorMode,
  contentGutter = DEFAULT_CONTENT_GUTTER,
}: FooterDesignLandingProps) {
  const focusGroupRef = useRef<HTMLDivElement>(null);

  const isLight = colorMode === 'light';
  const bg = isLight ? '#ffffff' : '#000000';
  const ink = isLight ? '#000000' : '#ffffff';
  const hairline = isLight ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.14)';
  const identityBorder = isLight ? 'rgba(0,0,0,0.14)' : 'rgba(255,255,255,0.16)';
  const identityFill = isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.06)';

  const brandInitials =
    creatorName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || 'NP';

  const description = presentation.showDescription
    ? resolveFooterDescription({
        source: presentation.descriptionSource,
        custom: presentation.descriptionCustom,
        bio,
        maxLength: 280,
      })
    : null;

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

  const internalLinks = resolveFooterInternalLinksColumn(presentation, visibleSectionLinks);
  const copyrightText = presentation.showCopyright
    ? resolveFooterCopyrightLabel(presentation.copyrightLabel, creatorName)
    : null;

  // Theatrical focus/spotlight, cross-column: every [data-flanding-dim] rests at
  // RESTING_OPACITY. Hovering a [data-flanding-focus-item] lifts just that element to full ink
  // — sideways for the horizontal social row (data-flanding-axis="x"), upward for everything
  // else — while every other dim target across all three columns sinks to a near-invisible
  // blurred hush. Column labels and the brand name carry neither data attribute, so they never
  // enter the choreography.
  useLayoutEffect(() => {
    const group = focusGroupRef.current;
    if (!group) return undefined;
    if (prefersReducedMotion() || !supportsKineticHover()) return undefined;

    const dimTargets = Array.from(group.querySelectorAll<HTMLElement>('[data-flanding-dim]'));
    const focusItems = Array.from(group.querySelectorAll<HTMLElement>('[data-flanding-focus-item]'));
    if (dimTargets.length === 0 || focusItems.length === 0) return undefined;

    let ctx: gsap.Context | undefined;
    try {
      ctx = gsap.context(() => {
        const onEnter = (event: Event) => {
          const target = event.currentTarget as HTMLElement;
          const axis = target.getAttribute('data-flanding-axis') === 'x' ? 'x' : 'y';
          dimTargets.forEach((el) => {
            const isTarget = el === target;
            gsap.to(el, {
              opacity: isTarget ? 1 : UNFOCUSED_OPACITY,
              filter: isTarget ? 'blur(0px)' : UNFOCUSED_BLUR,
              x: isTarget && axis === 'x' ? 4 : 0,
              y: isTarget && axis === 'y' ? -4 : 0,
              duration: isTarget ? 0.55 : 0.4,
              ease: isTarget ? 'back.out(2.2)' : 'power2.out',
              overwrite: 'auto',
            });
          });
        };
        const onLeave = () => {
          dimTargets.forEach((el) => {
            gsap.to(el, {
              opacity: RESTING_OPACITY,
              filter: 'blur(0px)',
              x: 0,
              y: 0,
              duration: 0.45,
              ease: 'power3.out',
              overwrite: 'auto',
            });
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
      console.error('[FooterDesignLanding] focus-dim animation failed to initialize', error);
      ctx?.revert();
      gsap.set(dimTargets, { clearProps: 'all' });
    }

    return () => ctx?.revert();
  }, [visibleLinks, contactItems, internalLinks, ink]);

  return (
    <footer
      id="footer"
      data-creator-id={creatorId}
      className="pf-flanding-mode relative isolate left-1/2 w-screen -translate-x-1/2 overflow-hidden"
      style={{ backgroundColor: bg, color: ink }}
    >
      <LandingStyles />

      <div className={`relative z-[1] w-full pb-10 pt-20 sm:pt-24 lg:pt-28 ${portfolioEditorialGutterX(contentGutter)}`}>
        <div
          ref={focusGroupRef}
          className="flex w-full flex-col gap-14 md:flex-row md:items-start md:justify-between md:gap-x-16 lg:gap-x-24"
        >
          {/* Left — identity, bio, bare social icons */}
          <div className="flex min-w-0 max-w-md flex-col gap-6 text-left">
            {presentation.showBrand ? (
              <div className="flex items-center gap-3">
                {presentation.showAvatar && avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl} alt="" className="h-12 w-12 rounded-full object-cover" />
                ) : presentation.showAvatar ? (
                  <span
                    className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-semibold"
                    style={{ color: ink, borderColor: identityBorder, backgroundColor: identityFill, border: '1px solid' }}
                    aria-hidden
                  >
                    {brandInitials}
                  </span>
                ) : null}
                <p className="pf-flanding-mode text-3xl font-semibold tracking-tight sm:text-[2.25rem]" style={{ color: ink }}>
                  {creatorName}
                </p>
              </div>
            ) : null}

            {description ? (
              <p
                data-flanding-dim=""
                className="pf-flanding-dim max-w-sm text-base leading-relaxed sm:text-[1.0625rem]"
                style={{ opacity: RESTING_OPACITY, color: ink }}
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
                    data-flanding-dim=""
                    data-flanding-focus-item=""
                    data-flanding-axis="x"
                    data-pf-no-color-transition=""
                    className="pf-flanding-dim inline-flex items-center justify-center"
                    style={{ opacity: RESTING_OPACITY, color: ink }}
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
              <p
                className="pf-flanding-mode text-[10px] font-semibold uppercase"
                style={{ opacity: LABEL_OPACITY, color: ink, letterSpacing: '0.16em' }}
              >
                Contact
              </p>
              <ul className="flex flex-col gap-6">
                {contactItems.map((item) => (
                  <li key={item.id}>
                    {item.href ? (
                      <a
                        href={item.href}
                        data-flanding-dim=""
                        data-flanding-focus-item=""
                        data-pf-no-color-transition=""
                        className="pf-flanding-dim inline-block w-fit text-base sm:text-[1.0625rem]"
                        style={{ opacity: RESTING_OPACITY, color: ink }}
                      >
                        {item.label}
                      </a>
                    ) : (
                      <p
                        data-flanding-dim=""
                        className="pf-flanding-dim w-fit max-w-[16rem] text-base sm:text-[1.0625rem]"
                        style={{ opacity: RESTING_OPACITY, color: ink }}
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
          {internalLinks.links.length > 0 ? (
            <div className="flex min-w-0 max-w-xs flex-col gap-5 text-left md:pt-1">
              <p
                className="pf-flanding-mode text-[10px] font-semibold uppercase"
                style={{ opacity: LABEL_OPACITY, color: ink, letterSpacing: '0.16em' }}
              >
                {internalLinks.title.trim().charAt(0).toUpperCase() + internalLinks.title.trim().slice(1).toLowerCase()}
              </p>
              <ul className="flex flex-col gap-5">
                {internalLinks.links.map((link) => {
                  const href = resolveFooterLinkHref(link.href, creatorId);
                  const external = href.startsWith('http') || href.startsWith('mailto:');
                  const itemProps = {
                    'data-flanding-dim': '',
                    'data-flanding-focus-item': '',
                    'data-pf-no-color-transition': '',
                    className: 'pf-flanding-dim inline-block w-fit text-base font-light sm:text-[1.0625rem]',
                    style: { opacity: RESTING_OPACITY, color: ink },
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

        {copyrightText ? (
          <div className="pf-flanding-mode mt-16 border-t pt-6 sm:mt-20" style={{ borderColor: hairline }}>
            <p className="pf-flanding-mode text-xs tracking-wide" style={{ opacity: LABEL_OPACITY, color: ink }}>
              {copyrightText}
            </p>
          </div>
        ) : null}
      </div>
    </footer>
  );
}

export function FooterLandingWireframe() {
  return (
    <svg viewBox="0 0 120 72" className="pf-stack-mini h-[4.35rem] w-full" aria-hidden>
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
      <rect className="pf-stack-mini-mute" x="8" y="60" width="30" height="1.5" rx="0.75" opacity={0.5} />
    </svg>
  );
}
