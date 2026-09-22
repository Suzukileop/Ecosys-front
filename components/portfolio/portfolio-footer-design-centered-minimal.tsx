'use client';

import gsap from 'gsap';
import Link from 'next/link';
import { useLayoutEffect, useRef } from 'react';
import { formatPhoneDisplay } from '@/lib/phone';
import {
  FooterContactIcon,
  FooterSocialLinkIcon,
  type EditorialContactLink,
} from '@/components/portfolio/portfolio-section-primitives';
import {
  resolveFooterCopyrightLabel,
  resolveFooterLinkHref,
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

const RESTING_OPACITY = 0.45;
const UNFOCUSED_OPACITY = 0.08;
const UNFOCUSED_BLUR = 'blur(1.5px)';

const CENTERED_MINIMAL_CSS = `
.pf-centeredminimal-dim {
  transition: opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1), filter 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}
@media (prefers-reduced-motion: reduce) {
  .pf-centeredminimal-dim {
    transition: none !important;
  }
}
`;

function CenteredMinimalStyles() {
  return <style dangerouslySetInnerHTML={{ __html: CENTERED_MINIMAL_CSS }} />;
}

export interface FooterDesignCenteredMinimalProps {
  creatorName: string;
  creatorId: string;
  avatarUrl?: string | null;
  email?: string | null;
  phone?: string | null;
  locationLabel?: string | null;
  hoursLabel?: string | null;
  links: EditorialContactLink[];
  presentation: PortfolioFooterPresentationSettings;
  colorMode: 'light' | 'dark';
  /** Site-wide editorial gutter (settings.global.contentGutter) — this design is full-bleed
   *  and bypasses the legacy shell, so this is threaded in to line its own horizontal
   *  padding up with the rest of the page. */
  contentGutter?: PortfolioContentGutter;
}

/**
 * "Centered minimal" — purified rework of the default footer: the ringed/boxed social icons
 * are gone, so are the fine top rule and inter-block dividers; white space alone separates the
 * blocks. The identity (avatar / name / custom mark) stays crisp and never dims. Nav links,
 * bare social icons, bare contact chips, and the copyright line all rest at low opacity and
 * snap into a spring-damped spotlight (full ink + translateY(-4px)) on hover, while every other
 * member of that group sinks to a near-invisible blurred hush — same theatrical focus-dim idiom
 * as this design family's other members (Compact, Headline reveal, …), just with a vertical
 * lift instead of a horizontal nudge. Literal colorMode-branched pure black / pure white,
 * bypassing the generic per-element color pickers like its siblings. Kinetic blur/lift is
 * skipped below 768px and on non-hover-capable pointers — mobile keeps the centered rest state
 * with roomier gaps for thumb reach instead.
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
  presentation,
  colorMode,
  contentGutter = DEFAULT_CONTENT_GUTTER,
}: FooterDesignCenteredMinimalProps) {
  const focusGroupRef = useRef<HTMLDivElement>(null);

  const isLight = colorMode === 'light';
  const bg = isLight ? '#ffffff' : '#000000';
  const ink = isLight ? '#000000' : '#ffffff';
  const identityBorder = isLight ? 'rgba(0,0,0,0.14)' : 'rgba(255,255,255,0.16)';
  const identityFill = isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.06)';

  const centeredIdentity = presentation.centeredIdentity ?? 'name';
  const centeredLinks = presentation.centeredLinks ?? [];
  const customLogoUrl = presentation.centeredCustomLogoUrl?.trim();
  const customText = presentation.centeredCustomText?.trim() || creatorName;
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

  const copyrightText =
    presentation.showCopyright !== false
      ? resolveFooterCopyrightLabel(presentation.copyrightLabel, creatorName)
      : null;

  // Theatrical focus/spotlight: every [data-centeredminimal-dim] rests at RESTING_OPACITY.
  // Hovering a [data-centeredminimal-focus-item] (nav link, social icon, contact chip) lifts
  // just that element to full ink with a damped-spring translateY(-4px), while every other dim
  // target — including the copyright line — sinks to a near-invisible blurred hush. The
  // identity block carries neither data attribute, so it never enters the choreography.
  useLayoutEffect(() => {
    const group = focusGroupRef.current;
    if (!group) return undefined;
    if (prefersReducedMotion() || !supportsKineticHover()) return undefined;

    const dimTargets = Array.from(group.querySelectorAll<HTMLElement>('[data-centeredminimal-dim]'));
    const focusItems = Array.from(group.querySelectorAll<HTMLElement>('[data-centeredminimal-focus-item]'));
    if (dimTargets.length === 0 || focusItems.length === 0) return undefined;

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
              y: isTarget ? -4 : 0,
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
      console.error('[FooterDesignCenteredMinimal] focus-dim animation failed to initialize', error);
      ctx?.revert();
      gsap.set(dimTargets, { clearProps: 'all' });
    }

    return () => ctx?.revert();
  }, [centeredLinks, visibleLinks, contactItems, ink]);

  const identity =
    centeredIdentity === 'avatar' ? (
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
      style={{ backgroundColor: bg, color: ink }}
      data-pf-no-color-transition=""
    >
      <CenteredMinimalStyles />

      <div className={`relative z-[1] mx-auto flex w-full max-w-4xl flex-col items-center gap-10 py-20 text-center sm:gap-9 sm:py-24 lg:py-28 ${portfolioEditorialGutterX(contentGutter)}`}>
        <div className="flex justify-center">{identity}</div>

        <div ref={focusGroupRef} className="flex w-full flex-col items-center gap-10 sm:gap-9">
          {centeredLinks.length > 0 ? (
            <nav
              className="flex max-w-3xl flex-wrap items-center justify-center gap-x-8 gap-y-5 sm:gap-x-10"
              aria-label="Portfolio sections"
            >
              {centeredLinks.map((item) => {
                const href = resolveFooterLinkHref(item.href, creatorId);
                return (
                  <Link
                    key={item.id}
                    href={href}
                    aria-label={`Go to ${item.label}`}
                    data-centeredminimal-dim=""
                    data-centeredminimal-focus-item=""
                    data-pf-no-color-transition=""
                    className="pf-centeredminimal-dim inline-block font-semibold uppercase"
                    style={{
                      opacity: RESTING_OPACITY,
                      color: ink,
                      letterSpacing: '0.14em',
                      fontSize: '0.8125rem',
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
                  data-centeredminimal-dim=""
                  data-centeredminimal-focus-item=""
                  data-pf-no-color-transition=""
                  className="pf-centeredminimal-dim inline-flex items-center justify-center"
                  style={{ opacity: RESTING_OPACITY, color: ink }}
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
                      data-centeredminimal-dim=""
                      data-centeredminimal-focus-item=""
                      data-pf-no-color-transition=""
                      className="pf-centeredminimal-dim inline-flex items-center justify-center"
                      style={{ opacity: RESTING_OPACITY, color: ink }}
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
                    data-centeredminimal-dim=""
                    className="pf-centeredminimal-dim inline-flex items-center justify-center"
                    style={{ opacity: RESTING_OPACITY, color: ink }}
                  >
                    {glyph}
                  </span>
                );
              })}
            </nav>
          ) : null}

          {copyrightText ? (
            <p
              data-centeredminimal-dim=""
              className="pf-centeredminimal-dim text-center text-xs tracking-wide"
              style={{ opacity: RESTING_OPACITY, color: ink }}
            >
              {copyrightText}
            </p>
          ) : null}
        </div>
      </div>
    </footer>
  );
}

export function FooterCenteredMinimalWireframe() {
  return (
    <svg viewBox="0 0 120 72" className="pf-stack-mini h-[4.35rem] w-full" aria-hidden>
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
