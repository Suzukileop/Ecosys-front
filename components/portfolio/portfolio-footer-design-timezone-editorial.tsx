'use client';

import gsap from 'gsap';
import { useLayoutEffect, useRef, type RefObject } from 'react';
import { formatPhoneDisplay } from '@/lib/phone';
import type { EditorialContactLink } from '@/components/portfolio/portfolio-section-primitives';
import {
  DEFAULT_CONTENT_GUTTER,
  portfolioEditorialGutterX,
  type PortfolioContentGutter,
} from '@/components/portfolio/portfolio-editorial-layout';

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Sizes `textRef`'s font so its rendered box exactly fills `containerRef`'s width — on
 * mount, on any container-width change, and once web fonts finish loading. Not vw-based:
 * the same vw value maps to a different rendered width depending on the creator name's
 * own glyph widths/length, so only a measure-then-scale pass can hit an exact width at
 * any screen size or name length. Replaces the watermark's previous "hard clip at the
 * container edge" strategy — which respected the global margin but abruptly truncated
 * long names mid-glyph — with one that fits the *whole* name inside that same margin
 * instead. Direct port of the technique in `useFitWidthTextSize` in
 * `portfolio-section-primitives.tsx` (also used by the Work/Stack/Tools/... Billboard
 * headers and the Editorial Grid / Inverted Wordmark / Swiss Magnetic / Monumental
 * Footer designs) — private to that file, so every full-bleed design that needs it keeps
 * its own copy rather than importing across the "bypass" full-bleed boundary.
 */
function useFitWidthTextSize(
  containerRef: RefObject<HTMLElement | null>,
  textRef: RefObject<HTMLElement | null>,
  text: string
) {
  useLayoutEffect(() => {
    const container = containerRef.current;
    const textEl = textRef.current;
    if (!container || !textEl) return undefined;

    const REFERENCE_PX = 100;

    const fit = () => {
      const targetWidth = container.getBoundingClientRect().width;
      if (targetWidth <= 0) return;

      textEl.style.fontSize = `${REFERENCE_PX}px`;
      const measuredWidth = textEl.getBoundingClientRect().width;
      if (measuredWidth <= 0) return;

      textEl.style.fontSize = `${REFERENCE_PX * (targetWidth / measuredWidth)}px`;
    };

    fit();

    let resizeTimer: ReturnType<typeof setTimeout> | undefined;
    const scheduleFit = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(fit, 100);
    };

    const observer = new ResizeObserver(scheduleFit);
    observer.observe(container);

    let cancelled = false;
    if (typeof document !== 'undefined' && document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (!cancelled) fit();
      }).catch(() => {});
    }

    return () => {
      cancelled = true;
      observer.disconnect();
      if (resizeTimer) clearTimeout(resizeTimer);
    };
  }, [text]);
}

/** Resting opacity per role — the whole footer sits "feutré" (subdued) by default;
 *  hovering the contact pill or a social link snaps that one element to full ink
 *  while every other item recedes to DIM_OPACITY (see the GSAP effect below). */
const REST_OPACITY = {
  pill: 0.82,
  link: 0.85,
  copyright: 0.4,
} as const;

const FOCUS_OPACITY = 1;
const DIM_OPACITY = 0.1;
const DIM_BLUR = 'blur(1.5px)';
const NO_BLUR = 'blur(0px)';

/** Explicit per-element color transition — this design opts every node out of the global
 *  `[data-pf-color-transitions='true']` color-transition rule (`data-pf-no-color-transition`,
 *  needed so that rule's blanket `transition-property` override can't strip the GSAP-managed
 *  opacity/filter tweens below) — so light/dark switches need their own, scoped-to-color-only
 *  transition to still animate smoothly instead of snapping. */
const COLOR_TRANSITION = 'background-color 0.5s ease, color 0.5s ease';

interface FooterDesignTimezoneEditorialProps {
  creatorName: string;
  creatorId: string;
  avatarUrl?: string | null;
  email?: string | null;
  phone?: string | null;
  links: EditorialContactLink[];
  copyrightText: string;
  colorMode: 'light' | 'dark';
  /** Site-wide editorial gutter (settings.global.contentGutter) — this design is full-bleed
   *  (bypasses the legacy footer shell), so it needs the same gutter every other section
   *  respects passed in explicitly to keep its content column aligned with the rest of the page. */
  contentGutter?: PortfolioContentGutter;
}

/**
 * "Timezone Editorial" — the eighth Footer design: a full-bleed, monumental
 * two-column composition on a pure white/black canvas (no default eyebrow/headline/
 * description/clock/location anymore — that role is now the shared Header mechanism's
 * job, e.g. its own "Timezone" design). A wide left column carries a contact pill
 * (square avatar crop + email/phone); a narrow right column, pinned to the far edge,
 * carries an arrow-led ("↳") list of social links, leaving the center column empty
 * for breathing room. At rest every element sits at a subdued opacity; hovering
 * the contact pill or a social link snaps that element to full ink while everything
 * else in the footer (including the giant background watermark) recedes to 0.1 opacity
 * with a soft blur, and a hovered link's "↳" glyph slides right and springs back
 * (elastic ease). The creator's name repeats gigantic and
 * near-invisible across the very bottom as a watermark. Bypasses the legacy
 * padding/pattern/shell system entirely — same full-bleed convention as Monumental
 * and Contact's premium designs — and mirrors the portfolio's real active
 * `colorMode` instead of owning a fixed canvas (see Contact's "Studio overlap").
 * Its own horizontal padding is still the site-wide editorial gutter
 * (`portfolioEditorialGutterX(contentGutter)`, same helper Contact's premium designs use),
 * not a hardcoded value — so the watermark and the two-column grid stay flush with every
 * other section's content edge regardless of the configured Global gutter.
 */
export function FooterDesignTimezoneEditorial({
  creatorName,
  creatorId,
  avatarUrl,
  email,
  phone,
  links,
  copyrightText,
  colorMode,
  contentGutter = DEFAULT_CONTENT_GUTTER,
}: FooterDesignTimezoneEditorialProps) {
  const rootRef = useRef<HTMLElement>(null);
  const watermarkContainerRef = useRef<HTMLDivElement>(null);
  const watermarkTextRef = useRef<HTMLDivElement>(null);
  useFitWidthTextSize(watermarkContainerRef, watermarkTextRef, creatorName);

  const isLight = colorMode === 'light';
  const bg = isLight ? '#ffffff' : '#000000';
  const ink = isLight ? '#050505' : '#fafafa';
  const watermarkInk = isLight ? 'rgba(5,5,5,0.045)' : 'rgba(250,250,250,0.05)';
  const placeholderBg = isLight ? '#ededed' : '#141414';

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    if (prefersReducedMotion()) return undefined;

    let ctx: gsap.Context | undefined;
    try {
      ctx = gsap.context(() => {
        const items = Array.from(root.querySelectorAll<HTMLElement>('[data-tze-item]'));
        const baseOpacity = new Map<HTMLElement, number>();
        items.forEach((el) => {
          const attr = el.getAttribute('data-tze-base');
          baseOpacity.set(el, attr ? Number(attr) : 0.85);
        });

        const linkTargets = Array.from(root.querySelectorAll<HTMLElement>('[data-tze-link]'));

        const onEnter = (target: HTMLElement) => {
          items.forEach((el) => {
            if (el === target) {
              gsap.to(el, {
                opacity: FOCUS_OPACITY,
                filter: NO_BLUR,
                duration: 0.32,
                ease: 'power2.out',
                overwrite: 'auto',
              });
            } else {
              gsap.to(el, {
                opacity: DIM_OPACITY,
                filter: DIM_BLUR,
                duration: 0.32,
                ease: 'power2.out',
                overwrite: 'auto',
              });
            }
          });
        };

        const onLeaveAll = () => {
          items.forEach((el) => {
            gsap.to(el, {
              opacity: baseOpacity.get(el) ?? 0.85,
              filter: NO_BLUR,
              duration: 0.4,
              ease: 'power2.out',
              overwrite: 'auto',
            });
          });
        };

        const enterHandlers = linkTargets.map((el) => {
          const arrow = el.querySelector<HTMLElement>('[data-tze-arrow]');
          const handler = () => {
            onEnter(el);
            if (!arrow) return;
            gsap.fromTo(
              arrow,
              { x: 0 },
              {
                x: 6,
                duration: 0.2,
                ease: 'power2.out',
                overwrite: 'auto',
                onComplete: () => {
                  gsap.to(arrow, { x: 0, duration: 0.7, ease: 'elastic.out(1, 0.5)', overwrite: 'auto' });
                },
              }
            );
          };
          el.addEventListener('pointerenter', handler);
          return handler;
        });

        root.addEventListener('pointerleave', onLeaveAll);

        return () => {
          linkTargets.forEach((el, index) => el.removeEventListener('pointerenter', enterHandlers[index]));
          root.removeEventListener('pointerleave', onLeaveAll);
        };
      }, root);
    } catch (error) {
      console.error('[FooterDesignTimezoneEditorial] GSAP animation failed to initialize', error);
      ctx?.revert();
      gsap.set(root.querySelectorAll('[data-tze-item]'), { clearProps: 'all' });
    }

    return () => {
      ctx?.revert();
    };
  }, []);

  const trimmedEmail = email?.trim() || '';
  const phoneDisplay = phone?.trim() ? formatPhoneDisplay(phone.trim()) : '';
  const hasContact = Boolean(trimmedEmail || phoneDisplay);
  const hasAvatar = Boolean(avatarUrl?.trim());
  const initials = (() => {
    const parts = creatorName.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '—';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
  })();

  const trimmedCopyright = copyrightText?.trim() || '';

  return (
    <footer
      id="footer"
      ref={rootRef}
      data-creator-id={creatorId}
      className="relative left-1/2 isolate w-screen -translate-x-1/2 overflow-hidden"
      style={{ backgroundColor: bg, transition: COLOR_TRANSITION }}
      data-pf-no-color-transition=""
    >
      {/* Giant, near-invisible watermark — anchored to the very bottom. The outer wrapper's
          width is also the fit hook's measurement target (see useFitWidthTextSize): the
          watermark's font-size is scaled so it always fills exactly this column's width,
          matching the global margin, instead of the old vw-based clamp bleeding past it (or
          `overflow-x-hidden` below silently truncating it mid-glyph as a fallback). It's
          height:auto so it never clips the text vertically. The text node itself keeps
          `overflow: visible` plus a generous line-height + bottom padding so descenders
          (g/j/p/y, ©) never touch the edge. */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-[4vh]">
        {/* overflow-x-hidden only (not overflow-hidden) — the wrapper must never clip
            vertically, or a tight line-height's descenders (g/j/p/y) risk getting cropped
            against this box's own edge regardless of how much paddingBottom the text below
            reserves for them. Now purely a safety net: the fit hook keeps the watermark
            within this same width by construction. */}
        <div
          ref={watermarkContainerRef}
          className={`w-full overflow-x-hidden text-center ${portfolioEditorialGutterX(contentGutter)}`}
        >
          <div
            ref={watermarkTextRef}
            data-tze-item
            data-tze-base="1"
            data-pf-no-color-transition=""
            className="inline-block select-none overflow-visible whitespace-nowrap font-sans font-black uppercase tracking-tight"
            style={{
              fontSize: 'clamp(4rem, 16vw, 14rem)',
              lineHeight: 1,
              paddingBottom: '0.22em',
              color: watermarkInk,
              transition: COLOR_TRANSITION,
            }}
          >
            {creatorName}
          </div>
        </div>
      </div>

      <div
        className={`relative z-[1] grid w-full grid-cols-1 gap-16 py-20 sm:py-28 lg:grid-cols-[1fr_auto] lg:gap-24 lg:py-32 ${portfolioEditorialGutterX(contentGutter)}`}
      >
        {/* LEFT — wide column: contact pill (no default eyebrow/headline/description
            anymore — that role is now the shared Header mechanism's job, e.g. its own
            "Timezone" design). */}
        <div className="flex min-w-0 flex-col gap-10">
          {hasContact ? (
            <div
              data-tze-item
              data-tze-link
              data-tze-base={REST_OPACITY.pill}
              data-pf-no-color-transition=""
              className="mt-2 flex w-fit items-center gap-6"
              style={{ opacity: REST_OPACITY.pill }}
            >
              <div
                className="h-14 w-14 shrink-0 overflow-hidden rounded-lg"
                style={{ backgroundColor: placeholderBg, transition: COLOR_TRANSITION }}
                aria-hidden
              >
                {hasAvatar ? (
                  // Plain <img>, not next/image — matches this design family's convention
                  // (see FooterDesignMonumental / FooterDesignHeroColumns).
                  <img
                    src={avatarUrl!}
                    alt={creatorName ? `Portrait of ${creatorName}` : 'Portrait'}
                    className="h-full w-full object-cover object-center"
                  />
                ) : (
                  <div
                    className="flex h-full w-full items-center justify-center text-xs font-semibold uppercase"
                    style={{ color: ink, opacity: 0.4, transition: COLOR_TRANSITION }}
                  >
                    {initials}
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-0.5" style={{ color: ink, transition: COLOR_TRANSITION }}>
                {trimmedEmail ? <span className="text-sm font-medium sm:text-base">{trimmedEmail}</span> : null}
                {phoneDisplay ? (
                  <span className="text-xs sm:text-sm" style={{ opacity: 0.72 }}>
                    {phoneDisplay}
                  </span>
                ) : null}
              </div>
            </div>
          ) : null}

          {trimmedCopyright ? (
            <p
              data-tze-item
              data-tze-base={REST_OPACITY.copyright}
              data-pf-no-color-transition=""
              className="mt-20 text-xs font-medium tracking-wide"
              style={{ color: ink, opacity: REST_OPACITY.copyright, transition: COLOR_TRANSITION }}
            >
              {trimmedCopyright}
            </p>
          ) : null}
        </div>

        {/* RIGHT — narrow column, pinned to the far edge: an arrow-led list of social
            links (no default local clock/location anymore — that role is now the
            shared Header mechanism's job, e.g. its own "Timezone" design). Center
            column is left empty on purpose (see the grid's `1fr_auto` template) for
            editorial breathing room. */}
        <div className="flex min-w-0 flex-col items-start lg:items-end lg:text-right">
          {links.length > 0 ? (
            <ul className="flex flex-col gap-4 lg:items-end">
              {links.map((link) => (
                <li key={link.id}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    data-tze-item
                    data-tze-link
                    data-tze-base={REST_OPACITY.link}
                    data-pf-no-color-transition=""
                    className="inline-flex items-center gap-2 text-base font-medium uppercase tracking-[0.1em] sm:text-lg lg:text-xl"
                    style={{ color: ink, opacity: REST_OPACITY.link, transition: COLOR_TRANSITION }}
                  >
                    <span data-tze-arrow aria-hidden className="inline-block">
                      ↳
                    </span>
                    <span>{link.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </footer>
  );
}

/** Tiny abstract wireframe for the settings-panel design picker thumbnail. */
export function FooterTimezoneEditorialWireframe() {
  return (
    <svg viewBox="0 0 120 72" className="pf-stack-mini h-[4.35rem] w-full" aria-hidden>
      <rect className="pf-stack-mini-stage" x="1.25" y="1.25" width="117.5" height="69.5" rx="9" />

      {/* left: contact pill */}
      <rect className="pf-stack-mini-mute" x="10" y="30" width="10" height="10" rx="2" />
      <rect className="pf-stack-mini-ink" x="24" y="31" width="24" height="3" rx="1.5" />
      <rect className="pf-stack-mini-mute" x="24" y="36.5" width="18" height="3" rx="1.5" />

      {/* right: a few right-aligned arrow-led link rows */}
      <rect className="pf-stack-mini-mute" x="90" y="28" width="20" height="3" rx="1.5" />
      <rect className="pf-stack-mini-mute" x="94" y="36" width="16" height="3" rx="1.5" />
      <rect className="pf-stack-mini-mute" x="88" y="44" width="22" height="3" rx="1.5" />
    </svg>
  );
}
