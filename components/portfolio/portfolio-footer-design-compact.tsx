'use client';

import gsap from 'gsap';
import { useLayoutEffect, useRef } from 'react';
import { formatPhoneDisplay } from '@/lib/phone';
import {
  FooterSocialLinkIcon,
  type EditorialContactLink,
} from '@/components/portfolio/portfolio-section-primitives';
import {
  resolveFooterCopyrightLabel,
  resolveFooterDescription,
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

// Readable "resting" grey for every secondary element (brand/description, phone, location,
// social icons, copyright) — the email is the sole exception, permanently at full ink (see
// EMAIL_REST_OPACITY below), never dimmed to this baseline even at rest.
const SECONDARY_REST_OPACITY = 0.5;
const EMAIL_REST_OPACITY = 1;
const UNFOCUSED_OPACITY = 0.08;
const UNFOCUSED_BLUR = 'blur(1.5px)';
const FOCUS_LIFT_PX = -4;

const COMPACT_CSS = `
.pf-footercompact-dim {
  transition: opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1), filter 0.5s cubic-bezier(0.16, 1, 0.3, 1), color 0.4s ease;
}
@media (prefers-reduced-motion: reduce) {
  .pf-footercompact-dim {
    transition: none !important;
  }
}
`;

function CompactStyles() {
  return <style dangerouslySetInnerHTML={{ __html: COMPACT_CSS }} />;
}

function Dot({ muted }: { muted: string }) {
  return (
    <span aria-hidden className="hidden text-sm sm:inline" style={{ color: muted }}>
      •
    </span>
  );
}

export interface FooterDesignCompactProps {
  creatorName: string;
  creatorId: string;
  bio?: string | null;
  email?: string | null;
  phone?: string | null;
  locationLabel?: string | null;
  links: EditorialContactLink[];
  presentation: PortfolioFooterPresentationSettings;
  colorMode: 'light' | 'dark';
  /** Site-wide editorial gutter (settings.global.contentGutter) — this design is full-bleed
   *  and bypasses the legacy shell, so this is threaded in to line its own horizontal
   *  padding up with the rest of the page. */
  contentGutter?: PortfolioContentGutter;
}

/**
 * "Compact" — total rework of the old boxed-icon horizontal utility bar into a borderless
 * composition (no default headline — that role is now the shared Header mechanism's job):
 * brand + bare (unboxed) social logos share a row with no dividing rule, and coordinates
 * settle onto one airy, dot-separated line (phone • email • address) instead of the old
 * icon-labeled stack.
 * Every secondary element (brand/description, phone, location, social icons, copyright)
 * rests at a readable 0.5 opacity — the email is the sole exception, permanently at full
 * ink with a thin permanent underline so it reads as the primary contact point even before
 * any hover. Hovering the email, phone, location, or a social logo lifts that one element
 * 4px with a snap to full ink, while everything else in the footer (including the email,
 * whenever it isn't the hovered element) sinks to 0.08 opacity with a 1.5px blur — a
 * theatrical, instant depth-of-field focus. Reads the resolved `colorMode` prop and
 * branches pure black / pure white literals, same full-bleed "bypass" convention as this
 * design family's other members (Monumental, Headline reveal, …); the canvas itself isn't
 * opted out of the site's global light/dark crossfade, so it inverts smoothly on toggle.
 */
export function FooterDesignCompact({
  creatorName,
  creatorId,
  bio,
  email,
  phone,
  locationLabel,
  links,
  presentation,
  colorMode,
  contentGutter = DEFAULT_CONTENT_GUTTER,
}: FooterDesignCompactProps) {
  const emailRef = useRef<HTMLAnchorElement>(null);
  const focusGroupRef = useRef<HTMLDivElement>(null);

  const isLight = colorMode === 'light';
  const bg = isLight ? '#ffffff' : '#000000';
  const ink = isLight ? '#000000' : '#ffffff';
  const muted = isLight ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.55)';

  const description = resolveFooterDescription({
    source: presentation.descriptionSource,
    custom: presentation.descriptionCustom,
    bio,
    maxLength: 160,
  });
  const phoneTrimmed = presentation.showPhone ? phone?.trim() || null : null;
  const phoneDisplay = phoneTrimmed ? formatPhoneDisplay(phoneTrimmed) : null;
  const emailTrimmed = email?.trim() || null;
  const locationTrimmed = presentation.showLocation ? locationLabel?.trim() || null : null;
  const copyrightText = presentation.showCopyright
    ? resolveFooterCopyrightLabel(presentation.copyrightLabel, creatorName)
    : null;

  // Theatrical focus/blur: at rest every [data-footercompact-dim] sits at its own readable
  // rest opacity (0.5 for everything, 1 for the email — see restOpacityFor below). Hovering
  // a [data-footercompact-focus-item] (email / phone / a social logo) lifts it 4px and snaps
  // it to full ink while every other dim target — including brand/description/address/
  // copyright, not just sibling links — sinks to 0.08 opacity + a 1.5px blur.
  useLayoutEffect(() => {
    const group = focusGroupRef.current;
    if (!group) return undefined;
    if (prefersReducedMotion()) return undefined;

    const dimTargets = Array.from(group.querySelectorAll<HTMLElement>('[data-footercompact-dim]'));
    const focusItems = Array.from(group.querySelectorAll<HTMLElement>('[data-footercompact-focus-item]'));
    if (dimTargets.length === 0 || focusItems.length === 0) return undefined;

    const restOpacityFor = (el: HTMLElement) => (el === emailRef.current ? EMAIL_REST_OPACITY : SECONDARY_REST_OPACITY);

    let ctx: gsap.Context | undefined;
    try {
      ctx = gsap.context(() => {
        const onEnter = (event: Event) => {
          const target = event.currentTarget as HTMLElement;
          dimTargets.forEach((el) => {
            const isTarget = el === target;
            gsap.to(el, {
              opacity: isTarget ? 1 : UNFOCUSED_OPACITY,
              y: isTarget ? FOCUS_LIFT_PX : 0,
              filter: isTarget ? 'blur(0px)' : UNFOCUSED_BLUR,
              duration: 0.4,
              ease: 'power2.out',
              overwrite: 'auto',
            });
            if (el.hasAttribute('data-footercompact-focus-item')) {
              el.style.color = isTarget ? ink : '';
            }
          });
        };
        const onLeave = () => {
          dimTargets.forEach((el) => {
            gsap.to(el, {
              opacity: restOpacityFor(el),
              y: 0,
              filter: 'blur(0px)',
              duration: 0.4,
              ease: 'power2.out',
              overwrite: 'auto',
            });
            if (el.hasAttribute('data-footercompact-focus-item')) {
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
      console.error('[FooterDesignCompact] focus-dim animation failed to initialize', error);
      ctx?.revert();
      gsap.set(dimTargets, { clearProps: 'all' });
    }

    return () => ctx?.revert();
  }, [links, phoneDisplay, emailTrimmed, locationTrimmed, ink]);

  return (
    <footer
      id="footer"
      data-creator-id={creatorId}
      className="relative isolate left-1/2 w-screen -translate-x-1/2 overflow-hidden"
      style={{ backgroundColor: bg, color: ink }}
    >
      <CompactStyles />

      <div className={`relative z-[1] w-full pb-12 pt-20 sm:pt-24 lg:pb-16 lg:pt-28 ${portfolioEditorialGutterX(contentGutter)}`}>
        <div ref={focusGroupRef} className="flex flex-col items-center gap-10 text-center sm:items-stretch sm:gap-8 sm:text-left">
          {/* 2. Brand + bare socials — no boxes, no divider. */}
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
            {presentation.showBrand || description ? (
              <div data-footercompact-dim="" className="pf-footercompact-dim max-w-xl space-y-2" style={{ opacity: SECONDARY_REST_OPACITY }}>
                {presentation.showBrand ? <p className="text-base font-semibold">{creatorName}</p> : null}
                {description ? <p className="text-base leading-[1.6]">{description}</p> : null}
              </div>
            ) : null}

            {links.length > 0 ? (
              <nav className="flex flex-wrap items-center justify-center gap-7 sm:justify-end" aria-label="Social">
                {links.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={link.label}
                    title={link.label}
                    data-footercompact-dim=""
                    data-footercompact-focus-item=""
                    data-pf-no-color-transition=""
                    className="pf-footercompact-dim inline-flex items-center justify-center p-2"
                    style={{ opacity: SECONDARY_REST_OPACITY }}
                  >
                    <FooterSocialLinkIcon link={link} bare iconClassName="h-7 w-7" />
                  </a>
                ))}
              </nav>
            ) : null}
          </div>

          {/* 3. Coordinates — one airy, dot-separated line. */}
          {phoneDisplay || emailTrimmed || locationTrimmed ? (
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
              {phoneDisplay ? (
                <a
                  href={`tel:${phoneTrimmed!.replace(/\s+/g, '')}`}
                  data-footercompact-dim=""
                  data-footercompact-focus-item=""
                  data-pf-no-color-transition=""
                  className="pf-footercompact-dim w-fit text-base"
                  style={{ opacity: SECONDARY_REST_OPACITY }}
                >
                  {phoneDisplay}
                </a>
              ) : null}
              {phoneDisplay && emailTrimmed ? <Dot muted={muted} /> : null}
              {emailTrimmed ? (
                <a
                  ref={emailRef}
                  href={`mailto:${emailTrimmed}`}
                  data-footercompact-dim=""
                  data-footercompact-focus-item=""
                  data-pf-no-color-transition=""
                  className="pf-footercompact-dim w-fit break-all border-b pb-0.5 text-base"
                  style={{ opacity: EMAIL_REST_OPACITY, color: ink, borderColor: ink }}
                >
                  {emailTrimmed}
                </a>
              ) : null}
              {(phoneDisplay || emailTrimmed) && locationTrimmed ? <Dot muted={muted} /> : null}
              {locationTrimmed ? (
                <p
                  data-footercompact-dim=""
                  className="pf-footercompact-dim w-fit max-w-xs text-base"
                  style={{ opacity: SECONDARY_REST_OPACITY }}
                >
                  {locationTrimmed}
                </p>
              ) : null}
            </div>
          ) : null}

          {/* 4. Copyright — no rule above it, pure whitespace close. */}
          {copyrightText ? (
            <p data-footercompact-dim="" className="pf-footercompact-dim text-[0.8rem]" style={{ opacity: SECONDARY_REST_OPACITY }}>
              {copyrightText}
            </p>
          ) : null}
        </div>
      </div>
    </footer>
  );
}

export function FooterCompactWireframe() {
  return (
    <svg viewBox="0 0 120 72" className="pf-stack-mini h-[4.35rem] w-full" aria-hidden>
      <rect className="pf-stack-mini-stage" x="1.25" y="1.25" width="117.5" height="69.5" rx="9" />

      {/* brand + bare social logos */}
      <rect className="pf-stack-mini-mute" x="6" y="24" width="26" height="2.5" rx="1.25" />
      <rect className="pf-stack-mini-mute" x="6" y="30" width="20" height="2" rx="1" />
      <circle className="pf-stack-mini-mute" cx="96" cy="26" r="2.4" />
      <circle className="pf-stack-mini-mute" cx="105" cy="26" r="2.4" />
      <circle className="pf-stack-mini-mute" cx="114" cy="26" r="2.4" />

      {/* dot-separated coordinates line */}
      <rect className="pf-stack-mini-mute" x="6" y="44" width="16" height="2" rx="1" />
      <circle className="pf-stack-mini-mute" cx="27" cy="45" r="0.9" />
      <rect className="pf-stack-mini-mute" x="32" y="44" width="30" height="2" rx="1" />
      <circle className="pf-stack-mini-mute" cx="67" cy="45" r="0.9" />
      <rect className="pf-stack-mini-mute" x="72" y="58" width="22" height="2" rx="1" />
    </svg>
  );
}
