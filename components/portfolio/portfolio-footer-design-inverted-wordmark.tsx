'use client';

import gsap from 'gsap';
import { useLayoutEffect, useRef, type CSSProperties, type MouseEvent, type RefObject } from 'react';
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
import {
  FOOTER_INK_TOKEN_OPTIONS,
  type FooterDesignLayoutResolver,
  type FooterInkToken,
} from '@/components/portfolio/portfolio-footer-design-layout';

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Sizes `textRef`'s font so its rendered box exactly fills `containerRef`'s width — on
 * mount, on any container-width change, and once web fonts finish loading. Not vw-based:
 * the same vw value maps to a different rendered width depending on the creator name's
 * own glyph widths/length, so only a measure-then-scale pass can hit an exact width at
 * any screen size or name length without ever bleeding past the container's own edge —
 * which is the whole point here, since that container already carries this footer's
 * shared side padding. Direct port of the technique in `useFitWidthTextSize` in
 * `portfolio-section-primitives.tsx` (also used by the Work/Stack/Tools/... Billboard
 * headers and the Editorial Grid Footer) — private to that file, so every full-bleed
 * design that needs it keeps its own copy rather than importing across the "bypass"
 * full-bleed boundary.
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

interface FooterDesignInvertedWordmarkProps {
  creatorName: string;
  navLinks: { id: string; label: string; url: string }[];
  layout: FooterDesignLayoutResolver;
  links: EditorialContactLink[];
  email?: string | null;
  phone?: string | null;
  colorMode: 'light' | 'dark';
  /** Footer's own palette (honors its light/dark override) — wordmark color tokens. */
  palette?: Partial<Record<FooterInkToken, string>>;
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
 * "Inverted Wordmark" — the eighth Footer design: a radically minimal, boxless,
 * frameless editorial grid (three airy columns: internal nav / socials / direct
 * contact) sitting above a giant vertically-mirrored (scaleY(-1)) brand
 * wordmark. No separators, no cards — pure whitespace + type on a flat, pure
 * white/black canvas (no tint). Fully self-contained "bypass" design, same
 * full-bleed convention as Monumental and the Contact premium designs;
 * branches its literal Tailwind classes on the resolved `colorMode` prop
 * rather than any `.dark` class or `prefers-color-scheme` media query. The
 * wordmark's font-size is measured-and-scaled (see `useFitWidthTextSize`) to
 * exactly fill the same column width as the three nav columns above it, so
 * it can't bleed past the footer's shared global margin regardless of name
 * length. No hardcoded closing bar (copyright/credit/back-to-top) either —
 * that opposite-contrast bar was extracted into the shared Mini bar
 * catalog's own "Inverted wordmark" variant (see
 * footer-minibar-catalog-extraction memory), toggled on separately via
 * Footer > Design > "Mini bar" rather than being always-on here.
 */
export function FooterDesignInvertedWordmark({
  creatorName,
  navLinks,
  layout,
  links,
  email,
  phone,
  colorMode,
  palette,
  contentGutter = DEFAULT_CONTENT_GUTTER,
  backgroundStyle,
  fontSizeScale = 1,
}: FooterDesignInvertedWordmarkProps) {
  const rootRef = useRef<HTMLElement>(null);
  const wordmarkContainerRef = useRef<HTMLDivElement | null>(null);
  const wordmarkTextRef = useRef<HTMLSpanElement | null>(null);
  const wordmarkText = layout.text('wordmark', creatorName);
  useFitWidthTextSize(wordmarkContainerRef, wordmarkTextRef, wordmarkText ?? '');

  const isLight = colorMode === 'light';
  const pageInk = isLight ? 'text-[#0a0a0a]' : 'text-[#fafaf7]';
  const wordmarkColor = isLight ? 'text-[#0a0a0a]' : 'text-[#fafaf7]';
  const wordmarkMirrored = layout.option('wordmarkOrientation') !== 'normal';
  // "Strong text" keeps this design's own pure ink; the quieter tokens come from the Footer
  // palette so they follow the active theme (and the section's light/dark override).
  const wordmarkInkToken = layout.option('wordmarkColor') as FooterInkToken;
  const wordmarkInk =
    wordmarkInkToken === 'texteFort'
      ? undefined
      : palette?.[wordmarkInkToken] ||
        FOOTER_INK_TOKEN_OPTIONS.find((option) => option.value === wordmarkInkToken)?.swatch;

  // Gentle entrance fade for the whole grid — simple, no ScrollTrigger needed
  // since this design is otherwise hover-state driven per the brief.
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const items = root.querySelectorAll<HTMLElement>('[data-iwm-fade-in]');
    if (!items.length) return undefined;
    if (prefersReducedMotion()) return undefined;

    let ctx: gsap.Context | undefined;
    try {
      ctx = gsap.context(() => {
        gsap.fromTo(
          items,
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.05 }
        );
      }, root);
    } catch (error) {
      console.error('[FooterDesignInvertedWordmark] GSAP animation failed to initialize', error);
      ctx?.revert();
      gsap.set(items, { clearProps: 'all' });
    }

    return () => ctx?.revert();
  }, []);

  // Self-contained hover accent: the hovered link glides 5px to the right via its own tween —
  // never touches any other element on the page.
  const handleLinkEnter = (event: MouseEvent<HTMLElement>) => {
    const active = event.currentTarget;
    if (prefersReducedMotion()) {
      gsap.set(active, { x: 5 });
      return;
    }
    gsap.to(active, { x: 5, duration: 0.4, ease: 'power3.out', overwrite: 'auto' });
  };

  const handleLinkLeave = (event: MouseEvent<HTMLElement>) => {
    const active = event.currentTarget;
    if (prefersReducedMotion()) {
      gsap.set(active, { x: 0 });
      return;
    }
    gsap.to(active, { x: 0, duration: 0.4, ease: 'power3.out', overwrite: 'auto' });
  };

  const showSocials = links.length > 0;

  // Column 3 used to be hardcoded "PRIVACY POLICY" / "TERMS OF SERVICES" — decorative
  // microcopy with no backing data field anywhere in this codebase. Direct contact info
  // (already resolved for every other Footer design) is real, useful data instead.
  const trimmedEmail = email?.trim() || null;
  const trimmedPhone = phone?.trim() || null;
  const phoneDisplay = trimmedPhone ? formatPhoneDisplay(trimmedPhone) : null;
  const contactItems: { id: string; label: string; href: string }[] = [];
  if (trimmedEmail) {
    contactItems.push({ id: 'email', label: trimmedEmail, href: `mailto:${trimmedEmail}` });
  }
  if (phoneDisplay) {
    contactItems.push({ id: 'phone', label: phoneDisplay, href: `tel:${trimmedPhone!.replace(/\s+/g, '')}` });
  }
  const showContact = contactItems.length > 0;

  // Larger, geometric-sans caps with pronounced tracking (Swiss-brutalist reading) —
  // `transition-colors` compensates for `data-pf-no-color-transition` below (needed so the
  // global site-wide crossfade never fights this file's own GSAP hover tweens): the link's
  // ink color still glides smoothly across a light/dark toggle, just via its own transition.
  const linkClass = 'w-fit uppercase tracking-[0.12em] transition-colors duration-500 ease-out';
  const linkFontSize: CSSProperties = {
    fontSize: 'calc(var(--pf-footer-body-size) * var(--pf-footer-font-scale, 1))',
  };

  return (
    <footer
      id="footer"
      ref={rootRef}
      className={`relative left-1/2 isolate w-screen -translate-x-1/2 overflow-hidden transition-colors duration-500 ease-out ${pageInk}`}
      style={{ ...backgroundStyle, '--pf-footer-font-scale': fontSizeScale } as CSSProperties}
      data-pf-no-color-transition=""
    >
      <div className={`relative z-[1] w-full pb-16 pt-20 sm:pb-20 sm:pt-24 lg:pb-24 lg:pt-28 ${portfolioEditorialGutterX(contentGutter)}`}>
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-3 sm:gap-8">
          {/* Column 1 — internal nav, fine-weight geometric caps */}
          <nav aria-label="Footer" data-iwm-fade-in className="flex flex-col gap-5">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={link.url}
                data-pf-no-color-transition=""
                onMouseEnter={handleLinkEnter}
                onMouseLeave={handleLinkLeave}
                className={`group relative ${linkClass} font-normal ${pageInk}`}
                style={linkFontSize}
              >
                {link.label}
                <span
                  aria-hidden
                  className={`pointer-events-none absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 ${isLight ? 'bg-[#0a0a0a]' : 'bg-[#fafaf7]'} transition-transform duration-300 ease-out group-hover:scale-x-100`}
                />
              </a>
            ))}
          </nav>

          {/* Column 2 — social links, lighter/thinner weight, extra breathing room
              between rows so the central column reads as a distinct, airy block. */}
          <div data-iwm-fade-in className="flex flex-col gap-7">
            {showSocials
              ? links.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    data-pf-no-color-transition=""
                    onMouseEnter={handleLinkEnter}
                    onMouseLeave={handleLinkLeave}
                    className={`group relative flex w-fit items-center gap-2.5 ${linkClass} font-light ${pageInk}`}
                    style={linkFontSize}
                  >
                    <FooterSocialLinkIcon link={link} bare iconClassName="h-3.5 w-3.5" />
                    <span>{link.label}</span>
                    <span
                      aria-hidden
                      className={`pointer-events-none absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 ${isLight ? 'bg-[#0a0a0a]' : 'bg-[#fafaf7]'} transition-transform duration-300 ease-out group-hover:scale-x-100`}
                    />
                  </a>
                ))
              : null}
          </div>

          {/* Column 3 — direct contact (email / phone), real data replacing the old
              hardcoded "PRIVACY POLICY" / "TERMS OF SERVICES" placeholder microcopy. */}
          <div data-iwm-fade-in className="flex flex-col gap-5 sm:items-end">
            {showContact
              ? contactItems.map((item) => (
                  <a
                    key={item.id}
                    href={item.href}
                    data-pf-no-color-transition=""
                    onMouseEnter={handleLinkEnter}
                    onMouseLeave={handleLinkLeave}
                    className={`group relative ${linkClass} font-normal ${pageInk} sm:text-right`}
                    style={linkFontSize}
                  >
                    {item.label}
                    <span
                      aria-hidden
                      className={`pointer-events-none absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 ${isLight ? 'bg-[#0a0a0a]' : 'bg-[#fafaf7]'} transition-transform duration-300 ease-out group-hover:scale-x-100 sm:left-auto sm:right-0 sm:origin-right`}
                    />
                  </a>
                ))
              : null}
          </div>
        </div>

        {/*
          Giant mirrored wordmark. `scaleY(-1)` alone, pivoted around the
          element's own center (the default transform-origin), mirrors the
          glyphs WITHIN the element's own unchanged box — the box's top/bottom
          edges never move, only the ink inside is flipped. That keeps the
          painted glyphs inside the `overflow-visible` wordmark box, which in
          turn stays inside the `<footer>`'s own `overflow-hidden` full-bleed
          clip. A previous version added `translateY(-46%)` and pivoted around
          `center bottom` to try to "push" the baseline down — that
          combination actually shifts the painted ink 1.0–1.5x the box's own
          height BELOW the box, past the footer's own clip boundary, making
          the wordmark render completely invisible. Don't reintroduce a
          translateY/off-center pivot here without re-verifying in a real
          browser — the math is easy to get backwards.
        */}
        {wordmarkText ? (
        <div className="relative mt-16 sm:mt-20 lg:mt-24" ref={wordmarkContainerRef} data-iwm-fade-in>
          <div
            aria-hidden
            className={`select-none overflow-visible whitespace-nowrap text-center font-black uppercase tracking-tight ${
              wordmarkInk ? '' : wordmarkColor
            }`}
            style={{
              color: wordmarkInk,
              // 1.05, not 1 — a hair of extra box height so a name with real ascenders
              // (b/d/h/k/l/t) or descenders (g/j/p/q/y) never has its ink pressed flush
              // against the line box's own edge once mirrored; the tiny paddingBottom
              // below then re-seats the mirrored glyphs at a consistent, deliberate gap
              // above the bar instead of a font-dependent one. `transform` is untouched —
              // still a plain center-pivot scaleY(-1), per the warning above.
              lineHeight: 1.05,
              paddingBottom: '0.08em',
              transform: wordmarkMirrored ? 'scaleY(-1)' : undefined,
            }}
          >
            {/* Measure-then-scale to `wordmarkContainerRef`'s width (the outer div right
               above, itself unconstrained inside the section's shared side padding) instead
               of the old vw-based clamp — so the wordmark can never bleed past the footer's
               global margin regardless of name length. font-size lives on this span alone;
               everything else above (overflow-visible, the scaleY mirror, paddingBottom)
               stays exactly as documented. */}
            <span ref={wordmarkTextRef} style={{ fontSize: 'clamp(2.75rem, 15vw, 11rem)' }}>
              {wordmarkText}
            </span>
          </div>
        </div>
        ) : null}
      </div>
    </footer>
  );
}

export function FooterInvertedWordmarkWireframe() {
  return (
    <svg viewBox="0 0 120 72" preserveAspectRatio="none" className="pf-stack-mini h-[4.35rem] w-full" aria-hidden>
      <rect className="pf-stack-mini-stage" x="1.25" y="1.25" width="117.5" height="69.5" rx="9" />

      {/* Top: three airy columns of short lines (nav / social / contact). */}
      <rect className="pf-stack-mini-ink" x="9" y="12" width="20" height="3" rx="1.5" />
      <rect className="pf-stack-mini-mute" x="9" y="19" width="16" height="3" rx="1.5" />
      <rect className="pf-stack-mini-mute" x="9" y="26" width="18" height="3" rx="1.5" />

      <rect className="pf-stack-mini-mute" x="51" y="12" width="18" height="2.4" rx="1.2" />
      <rect className="pf-stack-mini-mute" x="51" y="19" width="14" height="2.4" rx="1.2" />
      <rect className="pf-stack-mini-mute" x="51" y="26" width="16" height="2.4" rx="1.2" />

      <rect className="pf-stack-mini-mute" x="93" y="12" width="18" height="2.4" rx="1.2" />
      <rect className="pf-stack-mini-mute" x="93" y="19" width="15" height="2.4" rx="1.2" />

      {/* Bottom: a wide bold glyph, mirrored, sitting on a solid bar. */}
      <text
        x="60"
        y="52"
        textAnchor="middle"
        fontSize="22"
        fontWeight={900}
        letterSpacing="-0.5"
        className="pf-stack-mini-ink"
        transform="scale(1,-1) translate(0,-98)"
      >
        AA
      </text>
    </svg>
  );
}
