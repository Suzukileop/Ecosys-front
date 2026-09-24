'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLayoutEffect, useRef, type CSSProperties } from 'react';
import { formatPhoneDisplay } from '@/lib/phone';
import {
  FooterSocialLinkIcon,
  type EditorialContactLink,
} from '@/components/portfolio/portfolio-section-primitives';
import {
  portfolioEditorialGutterX,
  DEFAULT_CONTENT_GUTTER,
  type PortfolioContentGutter,
} from '@/components/portfolio/portfolio-editorial-layout';
import type { FooterDesignLayoutResolver } from '@/components/portfolio/portfolio-footer-design-layout';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Local, dedicated transition rules — same idiom as Footer's Headline Reveal design.
 *  `data-pf-no-color-transition` (already on every item below) opts each element OUT of the
 *  app-wide color-mode crossfade so THIS 0.5s rule is the only one driving its `color`/
 *  `background-color` for the light/dark toggle. */
const SERVICES_REVEAL_CSS = `
.pf-svcreveal-mode {
  transition: background-color 0.5s cubic-bezier(0.16, 1, 0.3, 1), color 0.5s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}
@media (prefers-reduced-motion: reduce) {
  .pf-svcreveal-mode {
    transition: none !important;
  }
}
`;

function ServicesRevealStyles() {
  return <style dangerouslySetInnerHTML={{ __html: SERVICES_REVEAL_CSS }} />;
}

interface FooterDesignServicesRevealProps {
  creatorName: string;
  email?: string | null;
  phone?: string | null;
  locationLabel?: string | null;
  navLinks: { id: string; label: string; url: string }[];
  layout: FooterDesignLayoutResolver;
  links: EditorialContactLink[];
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
 * "Services Reveal" — a new Footer design that keeps the classic three-group
 * information shape of the basic legacy footer (Services / Contact / Address)
 * but elevates it into a full-bleed, Awwwards-grade close (no default headline
 * — that role is now the shared Header mechanism's job): an asymmetric
 * two-zone grid — free-floating (no chip/border) social
 * icons + the "Services" nav column on the left, "Address" (with a small geo
 * dot) and "Contact" (email/phone) on the right. Every link/coordinate reads
 * at full, normal contrast at all times; hovering one just nudges that single
 * element and brightens it to full ink, without affecting any other item in
 * the grid. Social icons get a high-inertia magnetic pull toward
 * the cursor plus a small reactive rotation on direct hover (desktop/
 * pointer-fine only). Fully self-contained "bypass" design — full-bleed, no
 * shared padding/pattern shell, literal Tailwind classes branched on the
 * resolved `colorMode` prop (no `.dark` class, no `prefers-color-scheme`) —
 * same convention as Monumental / Hero Columns / Inverted Wordmark.
 *
 * Data-model gaps handled gracefully:
 * - There is no dedicated "services list" field in this codebase, so the
 *   resolved `navLinks` double as the Services column, per the brief.
 * - There is no live geolocation/timezone data field, so the address gets a
 *   plain static dot/pin instead of a fabricated ticking clock.
 *
 * No hardcoded closing copyright line either — that bar was extracted into the shared
 * Mini bar catalog's own "Services reveal" variant (see footer-minibar-catalog-extraction
 * memory), toggled on separately via Footer > Design > "Mini bar" rather than being
 * always-on here.
 */
export function FooterDesignServicesReveal({
  creatorName,
  email,
  phone,
  locationLabel,
  navLinks,
  layout,
  links,
  colorMode,
  contentGutter = DEFAULT_CONTENT_GUTTER,
  backgroundStyle,
  fontSizeScale = 1,
}: FooterDesignServicesRevealProps) {
  const rootRef = useRef<HTMLElement>(null);

  const isLight = colorMode === 'light';
  const ink = isLight ? '#0a0a0a' : '#fafaf7';
  // Section labels (Connect / Services / Address / Contact) — one harmonized, legible tone.
  const label = isLight ? 'rgba(10,10,10,0.55)' : 'rgba(250,250,247,0.55)';
  // Real coordinate values (address, email, phone) — a legible, silvery resting tone; the
  // old 0.4-opacity "muted" read as invisible next to a near-black/near-white stage.
  const coordText = isLight ? 'rgba(38,38,46,0.66)' : 'rgba(220,220,228,0.66)';
  // Services nav links — resting brightness reined in from full "ink" to a felted tone.
  const navRest = isLight ? 'rgba(10,10,10,0.55)' : 'rgba(250,250,247,0.55)';
  // Social icons — refined, slightly brighter than body text since the glyphs are tiny.
  const iconRest = isLight ? 'rgba(10,10,10,0.72)' : 'rgba(250,250,247,0.72)';

  const trimmedLocation = locationLabel?.trim() || null;
  const trimmedEmail = email?.trim() || null;
  const trimmedPhone = phone?.trim() || null;
  const phoneDisplay = trimmedPhone ? formatPhoneDisplay(trimmedPhone) : null;
  const hasSocials = links.length > 0;
  const hasContact = Boolean(trimmedEmail || phoneDisplay);
  const connectHeading = layout.text('connectLabel');
  const navHeading = layout.text('navLabel');
  const addressHeading = layout.text('addressLabel');
  const contactHeading = layout.text('contactLabel');
  const headingClass = 'pf-svcreveal-color m-0 font-semibold uppercase tracking-[0.15em]';
  const headingStyle: CSSProperties = {
    color: label,
    fontSize: 'calc(var(--pf-footer-label-size) * var(--pf-footer-font-scale, 1))',
  };

  // Self-contained hover accent — hovering a link or coordinate nudges that single
  // element a few px and brightens it to full ink; reverts on leave. No other
  // element in the grid is ever touched by this.
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    if (prefersReducedMotion()) return undefined;

    const hoverTargets = Array.from(root.querySelectorAll<HTMLElement>('[data-svcreveal-hover]'));
    if (!hoverTargets.length) return undefined;

    const baseColors = new Map<HTMLElement, string>();
    hoverTargets.forEach((el) => baseColors.set(el, getComputedStyle(el).color));

    const enterHandlers = hoverTargets.map((el) => {
      const handler = () => {
        gsap.to(el, { color: ink, x: 5, duration: 0.34, ease: 'power2.out', overwrite: 'auto' });
      };
      el.addEventListener('pointerenter', handler);
      return handler;
    });
    const leaveHandlers = hoverTargets.map((el) => {
      const handler = () => {
        gsap.to(el, { color: baseColors.get(el), x: 0, duration: 0.4, ease: 'power2.out', overwrite: 'auto' });
      };
      el.addEventListener('pointerleave', handler);
      return handler;
    });

    return () => {
      hoverTargets.forEach((el, index) => {
        el.removeEventListener('pointerenter', enterHandlers[index]);
        el.removeEventListener('pointerleave', leaveHandlers[index]);
      });
    };
  }, [navLinks.length, links.length, trimmedLocation, trimmedEmail, phoneDisplay, ink]);

  // 3) Magnetic social icons — high-inertia pull within a ~65px radius, plus a
  // small reactive micro-rotation on direct hover. Pointer-fine + motion gated;
  // touch/coarse-pointer devices simply get normal tappable icons.
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    if (prefersReducedMotion()) return undefined;
    if (!window.matchMedia('(pointer: fine)').matches) return undefined;

    const icons = Array.from(root.querySelectorAll<HTMLElement>('[data-svcreveal-icon]'));
    if (!icons.length) return undefined;

    const radius = 65;
    const movers = icons.map((icon) => ({
      icon,
      moveX: gsap.quickTo(icon, 'x', { duration: 0.75, ease: 'power3.out' }),
      moveY: gsap.quickTo(icon, 'y', { duration: 0.75, ease: 'power3.out' }),
    }));

    const onMove = (event: PointerEvent) => {
      movers.forEach(({ icon, moveX, moveY }) => {
        const rect = icon.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = event.clientX - cx;
        const dy = event.clientY - cy;
        const dist = Math.hypot(dx, dy);
        if (dist < radius) {
          const pull = 1 - dist / radius;
          moveX(dx * 0.5 * pull);
          moveY(dy * 0.5 * pull);
        } else {
          moveX(0);
          moveY(0);
        }
      });
    };

    const enterHandlers = icons.map((icon) => {
      const handler = () => {
        gsap.to(icon, { rotate: 12, duration: 0.3, ease: 'back.out(2)', overwrite: 'auto' });
      };
      icon.addEventListener('pointerenter', handler);
      return handler;
    });
    const leaveHandlers = icons.map((icon) => {
      const handler = () => {
        gsap.to(icon, { rotate: 0, duration: 0.4, ease: 'power3.out', overwrite: 'auto' });
      };
      icon.addEventListener('pointerleave', handler);
      return handler;
    });

    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      icons.forEach((icon, index) => {
        icon.removeEventListener('pointerenter', enterHandlers[index]);
        icon.removeEventListener('pointerleave', leaveHandlers[index]);
      });
    };
  }, [links.length]);

  return (
    <footer
      id="footer"
      ref={rootRef}
      aria-label={creatorName ? `${creatorName} — site footer` : 'Site footer'}
      className="pf-svcreveal-mode relative left-1/2 isolate w-screen -translate-x-1/2 overflow-hidden"
      style={{ ...backgroundStyle, color: ink, '--pf-footer-font-scale': fontSizeScale } as CSSProperties}
      data-pf-no-color-transition=""
    >
      <ServicesRevealStyles />

      <div
        className={`grid grid-cols-1 gap-16 pb-20 pt-24 sm:pb-28 sm:pt-32 md:grid-cols-[1fr_1.05fr] md:gap-x-14 lg:gap-x-24 lg:pb-32 lg:pt-40 ${portfolioEditorialGutterX(contentGutter)}`}
      >
        {/* Left zone — free-floating social icons above the Services nav column. */}
        <div className="flex min-w-0 flex-col gap-12">
          {hasSocials ? (
            <div className="flex flex-col gap-5">
              {connectHeading ? (
                <p data-pf-no-color-transition="" className={headingClass} style={headingStyle}>
                  {connectHeading}
                </p>
              ) : null}
              <div className="flex flex-wrap items-center gap-8 sm:gap-9">
                {links.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={link.label}
                    data-svcreveal-icon
                    data-svcreveal-hover
                    data-pf-no-color-transition=""
                    className="pf-svcreveal-color flex h-11 w-11 shrink-0 items-center justify-center"
                    style={{ color: iconRest }}
                  >
                    <FooterSocialLinkIcon link={link} bare iconClassName="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>
          ) : null}

          {navLinks.length > 0 ? (
          <div className="flex flex-col gap-5">
            {navHeading ? (
              <p data-pf-no-color-transition="" className={headingClass} style={headingStyle}>
                {navHeading}
              </p>
            ) : null}
            <nav aria-label="Footer" className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  data-svcreveal-hover
                  data-pf-no-color-transition=""
                  className="pf-svcreveal-color flex min-h-[44px] w-fit items-center font-medium md:min-h-0"
                  style={{ color: navRest, fontSize: 'calc(var(--pf-footer-body-size) * var(--pf-footer-font-scale, 1))' }}
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
          ) : null}
        </div>

        {/* Right zone — editorial address (with a static geo dot) + contact, offset for asymmetry. */}
        <div className="flex min-w-0 flex-col gap-14 sm:gap-16 md:items-end md:pt-10 md:text-right">
          {trimmedLocation ? (
            <div className="flex flex-col gap-3 md:items-end">
              {addressHeading ? (
                <p data-pf-no-color-transition="" className={headingClass} style={headingStyle}>
                  {addressHeading}
                </p>
              ) : null}
              <div
                data-svcreveal-hover
                data-pf-no-color-transition=""
                className="pf-svcreveal-color flex items-center gap-2 md:flex-row-reverse"
              >
                <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: ink }} />
                <span
                  className="font-normal tracking-wide"
                  style={{ color: coordText, fontSize: 'calc(var(--pf-footer-body-size) * var(--pf-footer-font-scale, 1))' }}
                >
                  {trimmedLocation}
                </span>
              </div>
            </div>
          ) : null}

          {hasContact ? (
            <div className="flex flex-col gap-3 md:items-end">
              {contactHeading ? (
                <p data-pf-no-color-transition="" className={headingClass} style={headingStyle}>
                  {contactHeading}
                </p>
              ) : null}
              <div className="flex flex-col gap-2.5 md:items-end">
                {trimmedEmail ? (
                  <a
                    href={`mailto:${trimmedEmail}`}
                    data-svcreveal-hover
                    data-pf-no-color-transition=""
                    className="pf-svcreveal-color flex min-h-[44px] w-fit items-center break-all md:min-h-0"
                    style={{ color: coordText, fontSize: 'calc(var(--pf-footer-body-size) * var(--pf-footer-font-scale, 1))' }}
                  >
                    {trimmedEmail}
                  </a>
                ) : null}
                {phoneDisplay ? (
                  <a
                    href={`tel:${trimmedPhone!.replace(/\s+/g, '')}`}
                    data-svcreveal-hover
                    data-pf-no-color-transition=""
                    className="pf-svcreveal-color flex min-h-[44px] w-fit items-center md:min-h-0"
                    style={{ color: coordText, fontSize: 'calc(var(--pf-footer-body-size) * var(--pf-footer-font-scale, 1))' }}
                  >
                    {phoneDisplay}
                  </a>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </footer>
  );
}

export function FooterServicesRevealWireframe() {
  return (
    <svg viewBox="0 0 120 72" preserveAspectRatio="none" className="pf-stack-mini h-[4.35rem] w-full" aria-hidden>
      <rect className="pf-stack-mini-stage" x="1.25" y="1.25" width="117.5" height="69.5" rx="9" />

      {/* Asymmetric info row — social icons + services nav left, address/contact right. */}
      <circle className="pf-stack-mini-mute" cx="13" cy="20" r="3.2" />
      <circle className="pf-stack-mini-mute" cx="23" cy="20" r="3.2" />
      <circle className="pf-stack-mini-mute" cx="33" cy="20" r="3.2" />
      <rect className="pf-stack-mini-mute" x="9" y="34" width="22" height="3" rx="1.5" />
      <rect className="pf-stack-mini-mute" x="9" y="42" width="18" height="3" rx="1.5" />
      <rect className="pf-stack-mini-mute" x="9" y="50" width="26" height="3" rx="1.5" />

      <rect className="pf-stack-mini-mute" x="80" y="26" width="31" height="2.6" rx="1.3" />
      <rect className="pf-stack-mini-mute" x="86" y="34" width="25" height="2.6" rx="1.3" />
      <rect className="pf-stack-mini-accent" x="93" y="42" width="18" height="2.6" rx="1.3" />
    </svg>
  );
}
