'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLayoutEffect, useRef } from 'react';
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

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Local, dedicated transition rules — same idiom as Footer's Headline Reveal design.
 *  `data-pf-no-color-transition` (already on every item below) opts each element OUT of the
 *  app-wide color-mode crossfade so THIS 0.5s rule is the only one driving its `color`/
 *  `background-color`, both for the light/dark toggle and for the GSAP focus-dim hover (which
 *  writes `color` as a plain, un-tweened style assignment — the CSS transition is what makes
 *  that instant write fade instead of snap). Opacity/filter/transform stay on GSAP `.to()`
 *  tweens, since the global crossfade rule never touches those properties anyway. */
const SERVICES_REVEAL_CSS = `
.pf-svcreveal-dim {
  transition: opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1), filter 0.5s cubic-bezier(0.16, 1, 0.3, 1), color 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
}
.pf-svcreveal-mode {
  transition: background-color 0.5s cubic-bezier(0.16, 1, 0.3, 1), color 0.5s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}
@media (prefers-reduced-motion: reduce) {
  .pf-svcreveal-dim,
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
  links: EditorialContactLink[];
  copyrightText: string;
  colorMode: 'light' | 'dark';
  /** Site-wide editorial gutter (settings.global.contentGutter) — this design is full-bleed
   *  and bypasses the legacy shell, so this is threaded in to line its own horizontal
   *  padding up with the rest of the page. */
  contentGutter?: PortfolioContentGutter;
}

/**
 * "Services Reveal" — a new Footer design that keeps the classic three-group
 * information shape of the basic legacy footer (Services / Contact / Address)
 * but elevates it into a full-bleed, Awwwards-grade close (no default headline
 * — that role is now the shared Header mechanism's job): an asymmetric
 * two-zone grid — free-floating (no chip/border) social
 * icons + the "Services" nav column on the left, "Address" (with a small geo
 * dot) and "Contact" (email/phone) on the right. At rest every link/coordinate
 * sits at a muted opacity; hovering one snaps it to full contrast while every
 * other item in the grid dims to 0.1 opacity + a 2px blur for a theatrical
 * depth-of-field focus. Social icons get a high-inertia magnetic pull toward
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
 */
export function FooterDesignServicesReveal({
  creatorName,
  email,
  phone,
  locationLabel,
  navLinks,
  links,
  copyrightText,
  colorMode,
  contentGutter = DEFAULT_CONTENT_GUTTER,
}: FooterDesignServicesRevealProps) {
  const rootRef = useRef<HTMLElement>(null);

  const isLight = colorMode === 'light';
  // Pure white/black canvas, matching every other full-bleed Footer design — not a custom
  // off-white/off-black tint, which visibly seams against the page's real background.
  const bg = isLight ? '#ffffff' : '#000000';
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
  const hairline = isLight ? 'rgba(10,10,10,0.08)' : 'rgba(250,250,247,0.1)';

  const trimmedLocation = locationLabel?.trim() || null;
  const trimmedEmail = email?.trim() || null;
  const trimmedPhone = phone?.trim() || null;
  const phoneDisplay = trimmedPhone ? formatPhoneDisplay(trimmedPhone) : null;
  const hasSocials = links.length > 0;
  const hasContact = Boolean(trimmedEmail || phoneDisplay);

  // Depth-of-field focus — resting items sit muted; hovering any link or
  // coordinate snaps it to full contrast while every other item dims to 0.1
  // opacity + a 2px blur, reverting smoothly on leave.
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    if (prefersReducedMotion()) return undefined;

    const items = Array.from(root.querySelectorAll<HTMLElement>('[data-svcreveal-item]'));
    const hoverTargets = Array.from(root.querySelectorAll<HTMLElement>('[data-svcreveal-hover]'));
    if (!items.length || !hoverTargets.length) return undefined;

    const baseColors = new Map<HTMLElement, string>();
    items.forEach((el) => baseColors.set(el, getComputedStyle(el).color));

    const onEnter = (target: HTMLElement) => {
      items.forEach((el) => {
        if (el === target) {
          gsap.to(el, {
            opacity: 1,
            filter: 'blur(0px)',
            color: ink,
            x: 5,
            duration: 0.34,
            ease: 'power2.out',
            overwrite: 'auto',
          });
        } else {
          gsap.to(el, {
            opacity: 0.1,
            filter: 'blur(1px)',
            x: 0,
            duration: 0.34,
            ease: 'power2.out',
            overwrite: 'auto',
          });
        }
      });
    };
    const onLeaveAll = () => {
      items.forEach((el) => {
        gsap.to(el, {
          opacity: 1,
          filter: 'blur(0px)',
          color: baseColors.get(el),
          x: 0,
          duration: 0.4,
          ease: 'power2.out',
          overwrite: 'auto',
        });
      });
    };

    const enterHandlers = hoverTargets.map((el) => {
      const handler = () => onEnter(el);
      el.addEventListener('pointerenter', handler);
      return handler;
    });
    const gridEl = root.querySelector<HTMLElement>('[data-svcreveal-grid]');
    gridEl?.addEventListener('pointerleave', onLeaveAll);

    return () => {
      hoverTargets.forEach((el, index) => el.removeEventListener('pointerenter', enterHandlers[index]));
      gridEl?.removeEventListener('pointerleave', onLeaveAll);
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
      style={{ backgroundColor: bg, color: ink }}
      data-pf-no-color-transition=""
    >
      <ServicesRevealStyles />

      <div
        data-svcreveal-grid
        className={`grid grid-cols-1 gap-16 pb-20 pt-24 sm:pb-28 sm:pt-32 md:grid-cols-[1fr_1.05fr] md:gap-x-14 lg:gap-x-24 lg:pb-32 lg:pt-40 ${portfolioEditorialGutterX(contentGutter)}`}
      >
        {/* Left zone — free-floating social icons above the Services nav column. */}
        <div className="flex min-w-0 flex-col gap-12">
          {hasSocials ? (
            <div className="flex flex-col gap-5">
              <p
                data-svcreveal-item
                data-pf-no-color-transition=""
                className="pf-svcreveal-dim m-0 text-xs font-semibold uppercase tracking-[0.15em]"
                style={{ color: label }}
              >
                Connect
              </p>
              <div className="flex flex-wrap items-center gap-8 sm:gap-9">
                {links.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={link.label}
                    data-svcreveal-icon
                    data-svcreveal-item
                    data-svcreveal-hover
                    data-pf-no-color-transition=""
                    className="pf-svcreveal-dim flex h-11 w-11 shrink-0 items-center justify-center"
                    style={{ color: iconRest }}
                  >
                    <FooterSocialLinkIcon link={link} bare iconClassName="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>
          ) : null}

          <div className="flex flex-col gap-5">
            <p
              data-svcreveal-item
              data-pf-no-color-transition=""
              className="pf-svcreveal-dim m-0 text-xs font-semibold uppercase tracking-[0.15em]"
              style={{ color: label }}
            >
              Services
            </p>
            <nav aria-label="Footer" className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  data-svcreveal-item
                  data-svcreveal-hover
                  data-pf-no-color-transition=""
                  className="pf-svcreveal-dim flex min-h-[44px] w-fit items-center text-[clamp(1.05rem,2vw,1.4rem)] font-medium md:min-h-0"
                  style={{ color: navRest }}
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
        </div>

        {/* Right zone — editorial address (with a static geo dot) + contact, offset for asymmetry. */}
        <div className="flex min-w-0 flex-col gap-14 sm:gap-16 md:items-end md:pt-10 md:text-right">
          {trimmedLocation ? (
            <div className="flex flex-col gap-3 md:items-end">
              <p
                data-svcreveal-item
                data-pf-no-color-transition=""
                className="pf-svcreveal-dim m-0 text-xs font-semibold uppercase tracking-[0.15em]"
                style={{ color: label }}
              >
                Address
              </p>
              <div
                data-svcreveal-item
                data-svcreveal-hover
                data-pf-no-color-transition=""
                className="pf-svcreveal-dim flex items-center gap-2 md:flex-row-reverse"
              >
                <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: ink }} />
                <span className="text-base font-normal tracking-wide sm:text-lg" style={{ color: coordText }}>
                  {trimmedLocation}
                </span>
              </div>
            </div>
          ) : null}

          {hasContact ? (
            <div className="flex flex-col gap-3 md:items-end">
              <p
                data-svcreveal-item
                data-pf-no-color-transition=""
                className="pf-svcreveal-dim m-0 text-xs font-semibold uppercase tracking-[0.15em]"
                style={{ color: label }}
              >
                Contact
              </p>
              <div className="flex flex-col gap-2.5 md:items-end">
                {trimmedEmail ? (
                  <a
                    href={`mailto:${trimmedEmail}`}
                    data-svcreveal-item
                    data-svcreveal-hover
                    data-pf-no-color-transition=""
                    className="pf-svcreveal-dim flex min-h-[44px] w-fit items-center break-all text-base sm:text-lg md:min-h-0"
                    style={{ color: coordText }}
                  >
                    {trimmedEmail}
                  </a>
                ) : null}
                {phoneDisplay ? (
                  <a
                    href={`tel:${trimmedPhone!.replace(/\s+/g, '')}`}
                    data-svcreveal-item
                    data-svcreveal-hover
                    data-pf-no-color-transition=""
                    className="pf-svcreveal-dim flex min-h-[44px] w-fit items-center text-base sm:text-lg md:min-h-0"
                    style={{ color: coordText }}
                  >
                    {phoneDisplay}
                  </a>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div
        data-svcreveal-item
        data-pf-no-color-transition=""
        className={`pf-svcreveal-dim border-t py-6 text-center text-xs font-medium tracking-wide ${portfolioEditorialGutterX(contentGutter)}`}
        style={{ borderColor: hairline, color: navRest }}
      >
        {copyrightText}
      </div>
    </footer>
  );
}

export function FooterServicesRevealWireframe() {
  return (
    <svg viewBox="0 0 120 72" className="pf-stack-mini h-[4.35rem] w-full" aria-hidden>
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
