'use client';

import gsap from 'gsap';
import {
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
  type MouseEvent,
  type RefObject,
} from 'react';
import { formatPhoneDisplay } from '@/lib/phone';
import { getApiErrorMessage } from '@/lib/api-error';
import { sendCreatorContactMessage } from '@/lib/marketplace-api';
import { pushFlashFeedback } from '@/stores/flashFeedbackStore';
import {
  FooterSocialLinkIcon,
  type EditorialContactLink,
} from '@/components/portfolio/portfolio-section-primitives';
import {
  DEFAULT_CONTENT_GUTTER,
  portfolioEditorialGutterX,
  type PortfolioContentGutter,
} from '@/components/portfolio/portfolio-editorial-layout';
import type { FooterDesignLayoutResolver } from '@/components/portfolio/portfolio-footer-design-layout';

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Layout settings → "Accent" maps to one of these. `contrast` follows the resolved color mode
 *  (white capsule on a dark canvas, black on a light one) instead of a fixed hue. */
const DISPATCH_ACCENTS: Record<string, string | null> = {
  mint: '#9ce8c2',
  amber: '#f2c65c',
  violet: '#c3b5fd',
  contrast: null,
};

/**
 * Sizes `textRef`'s font so its rendered box exactly fills `containerRef`'s content width —
 * on mount, on every container resize, and once web fonts settle. A vw value cannot do this:
 * the same vw maps to a different rendered width for every creator name, so only a
 * measure-then-scale pass lands flush on both gutters at any viewport. Same technique as
 * `useFitWidthTextSize` in Monumental / Editorial Grid / Inverted Wordmark — kept private
 * here rather than imported, per this family's full-bleed "bypass" convention.
 */
const MAX_WORDMARK_FONT_PX = 320;
/** Share of the fitted font size kept clear below the mask's baseline box, so descenders survive
 *  the `overflow: hidden` that makes the reveal possible. */
const DESCENDER_CLEARANCE = 0.2;

function useFitWidthTextSize(
  containerRef: RefObject<HTMLElement | null>,
  textRef: RefObject<HTMLElement | null>,
  maskRef: RefObject<HTMLElement | null>,
  text: string
) {
  useLayoutEffect(() => {
    const container = containerRef.current;
    const textEl = textRef.current;
    if (!container || !textEl) return undefined;

    const REFERENCE_PX = 100;

    const fit = () => {
      // `getBoundingClientRect()` is the border box, which still carries this container's own
      // left/right padding (the global content gutter). Fitting to that would bleed the
      // wordmark straight past the margin, so subtract the padding first.
      const style = window.getComputedStyle(container);
      const horizontalPadding = parseFloat(style.paddingLeft || '0') + parseFloat(style.paddingRight || '0');
      const targetWidth = container.getBoundingClientRect().width - horizontalPadding;
      if (targetWidth <= 0) return;

      textEl.style.fontSize = `${REFERENCE_PX}px`;
      const measuredWidth = textEl.getBoundingClientRect().width;
      if (measuredWidth <= 0) return;

      const fitted = Math.min(REFERENCE_PX * (targetWidth / measuredWidth), MAX_WORDMARK_FONT_PX);
      textEl.style.fontSize = `${fitted}px`;

      // The mask is a tight `overflow: hidden` box, and the tight leading below means the glyphs
      // overflow it — so a name with a descender (p, g, y, J) gets its tail shaved off. The
      // clearance has to scale with the fitted size, which is why it is set here and not as a
      // static `em` class: an `em` on the mask resolves against the mask's own 16px font size,
      // not against the wordmark's ~160px one, and clears about two pixels.
      const mask = maskRef.current;
      if (mask) mask.style.paddingBottom = `${fitted * DESCENDER_CLEARANCE}px`;
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
      document.fonts.ready
        .then(() => {
          if (!cancelled) fit();
        })
        .catch(() => {});
    }

    return () => {
      cancelled = true;
      observer.disconnect();
      if (resizeTimer) clearTimeout(resizeTimer);
    };
  }, [text]);
}

const DISPATCH_CSS = `
.pf-dispatch-mode {
  transition: background-color 0.5s cubic-bezier(0.16, 1, 0.3, 1), color 0.5s cubic-bezier(0.16, 1, 0.3, 1),
    border-color 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}
.pf-dispatch-link {
  transition: color 0.35s cubic-bezier(0.16, 1, 0.3, 1), transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
.pf-dispatch-chip {
  transition: background-color 0.35s cubic-bezier(0.16, 1, 0.3, 1), color 0.35s cubic-bezier(0.16, 1, 0.3, 1),
    border-color 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
.pf-dispatch-field input::placeholder {
  color: currentColor;
  opacity: 0.45;
}
.pf-dispatch-field input:focus {
  outline: none;
}
/* Visible keyboard focus on the capsule itself — the input inside it is borderless, so the
   ring has to live on the shell or tabbing through the footer looks like nothing happened. */
.pf-dispatch-field:focus-within {
  box-shadow: 0 0 0 2px var(--pf-dispatch-focus, currentColor);
}
.pf-dispatch-reveal {
  opacity: 0;
}
@media (prefers-reduced-motion: reduce) {
  .pf-dispatch-mode,
  .pf-dispatch-link,
  .pf-dispatch-chip {
    transition: none !important;
  }
  .pf-dispatch-reveal {
    opacity: 1 !important;
  }
}
`;

function DispatchStyles() {
  return <style dangerouslySetInnerHTML={{ __html: DISPATCH_CSS }} />;
}

/** The single accent-filled control of the whole footer: a circular submit button pulled
 *  magnetically toward the cursor inside a proximity radius, with the arrow sweeping up-right
 *  on direct hover. Same `gsap.quickTo` idiom as every other Footer design's magnetic control. */
function DispatchSubmitButton({
  accent,
  accentContrast,
  pending,
}: {
  accent: string;
  accentContrast: string;
  pending: boolean;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const arrowRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    const btn = btnRef.current;
    if (!wrap || !btn) return undefined;
    if (prefersReducedMotion()) return undefined;
    if (!window.matchMedia('(pointer: fine)').matches) return undefined;

    let ctx: gsap.Context | undefined;
    try {
      ctx = gsap.context(() => {
        const moveX = gsap.quickTo(btn, 'x', { duration: 0.55, ease: 'power3' });
        const moveY = gsap.quickTo(btn, 'y', { duration: 0.55, ease: 'power3' });
        const radius = 70;

        const onMove = (event: PointerEvent) => {
          const rect = btn.getBoundingClientRect();
          const dx = event.clientX - (rect.left + rect.width / 2);
          const dy = event.clientY - (rect.top + rect.height / 2);
          if (Math.hypot(dx, dy) < radius) {
            moveX(dx * 0.35);
            moveY(dy * 0.35);
          } else {
            moveX(0);
            moveY(0);
          }
        };

        window.addEventListener('pointermove', onMove, { passive: true });
        return () => window.removeEventListener('pointermove', onMove);
      }, wrap);
    } catch (error) {
      console.error('[FooterDesignDispatch] magnetic submit failed to initialize', error);
      ctx?.revert();
      gsap.set(btn, { clearProps: 'all' });
    }

    return () => ctx?.revert();
  }, []);

  const sweep = (to: { x: number; y: number }, ease: string) => {
    if (prefersReducedMotion()) return;
    const arrow = arrowRef.current;
    if (arrow) gsap.to(arrow, { ...to, duration: 0.4, ease, overwrite: 'auto' });
  };

  return (
    <div ref={wrapRef} className="shrink-0">
      <button
        ref={btnRef}
        type="submit"
        disabled={pending}
        aria-label="Send my email address"
        onMouseEnter={() => sweep({ x: 3, y: -3 }, 'power3.out')}
        onMouseLeave={() => sweep({ x: 0, y: 0 }, 'elastic.out(1, 0.55)')}
        data-pf-no-color-transition=""
        className="pf-dispatch-mode flex h-11 w-11 items-center justify-center rounded-full text-lg disabled:opacity-60 sm:h-12 sm:w-12"
        style={{ backgroundColor: accent, color: accentContrast }}
      >
        <span ref={arrowRef} aria-hidden className="inline-block leading-none">
          {pending ? '·' : '↗'}
        </span>
      </button>
    </div>
  );
}

export interface FooterDesignDispatchProps {
  creatorName: string;
  creatorId: string;
  email?: string | null;
  phone?: string | null;
  locationLabel?: string | null;
  links: EditorialContactLink[];
  navLinks: { id: string; label: string; url: string }[];
  layout: FooterDesignLayoutResolver;
  colorMode: 'light' | 'dark';
  /** Site-wide editorial gutter (settings.global.contentGutter) — this design is full-bleed
   *  (it bypasses the legacy footer shell), so it needs the gutter passed in explicitly to keep
   *  its grid and its wordmark flush with every other section's content edge. */
  contentGutter?: PortfolioContentGutter;
  /** Resolved from the Footer section's own Background tab (`sectionBackgroundStyle`) —
   *  `undefined` when that tab is off, so this canvas stays transparent by default. */
  backgroundStyle?: CSSProperties;
  /** Multiplies every standardized body/label size via `--pf-footer-font-scale` — see the
   *  Footer section's General tab "Font size" control. */
  fontSizeScale?: number;
}

/**
 * "Dispatch" — an agency-style closing band built around a single primary action. The top row
 * reads as an L: a capture block on the left (heading, one-field email capsule with the
 * footer's only accent-filled control, then social links as outlined chips) against a ruled
 * directory on the right, where the page's own section links split across two hairline-
 * separated columns and the creator's coordinates hold the third. Underneath, the wordmark is
 * measured and scaled to land exactly on both gutters, masked in from below on first sight.
 *
 * Ergonomics drove every choice: one action, one accent; 44px+ hit targets on every chip and
 * button; the capsule carries the focus ring because its input is borderless; the email field
 * posts a real contact message through the same endpoint as the Monumental form, so it is a
 * working control rather than a decorative newsletter box.
 *
 * Reads the resolved `colorMode` prop and branches pure black / pure white literals, same
 * full-bleed convention as the rest of this design family.
 */
export function FooterDesignDispatch({
  creatorName,
  creatorId,
  email,
  phone,
  locationLabel,
  links,
  navLinks,
  layout,
  colorMode,
  contentGutter = DEFAULT_CONTENT_GUTTER,
  backgroundStyle,
  fontSizeScale = 1,
}: FooterDesignDispatchProps) {
  const rootRef = useRef<HTMLElement>(null);
  const wordmarkContainerRef = useRef<HTMLDivElement>(null);
  const wordmarkTextRef = useRef<HTMLSpanElement>(null);
  const wordmarkInnerRef = useRef<HTMLSpanElement>(null);
  const wordmarkMaskRef = useRef<HTMLDivElement>(null);

  const [value, setValue] = useState('');
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);

  const isLight = colorMode === 'light';
  const ink = isLight ? '#000000' : '#ffffff';
  const inkContrast = isLight ? '#ffffff' : '#000000';
  const hairline = isLight ? 'rgba(0,0,0,0.16)' : 'rgba(255,255,255,0.18)';
  const wellFill = isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.08)';

  const accentToken = layout.option('accent');
  const accent = DISPATCH_ACCENTS[accentToken] ?? ink;
  // A tinted capsule needs dark glyphs; the `contrast` accent is the ink itself, so it flips.
  const accentContrast = accent === ink ? inkContrast : '#0b0b0b';

  const heading = layout.text('signupHeading');
  const note = layout.text('signupNote');
  const wordmark = layout.text('wordmark') || creatorName;

  const emailTrimmed = email?.trim() || null;
  const phoneTrimmed = phone?.trim() || null;
  const phoneDisplay = phoneTrimmed ? formatPhoneDisplay(phoneTrimmed) : null;
  const locationTrimmed = locationLabel?.trim() || null;

  useFitWidthTextSize(wordmarkContainerRef, wordmarkTextRef, wordmarkMaskRef, wordmark);

  // Reveal on first sight. Deliberately an IntersectionObserver rather than ScrollTrigger:
  // this block sits at the very bottom of the document, where a ScrollTrigger start can fall
  // past the maximum scroll position and never fire on short pages.
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const targets = Array.from(root.querySelectorAll<HTMLElement>('.pf-dispatch-reveal'));
    const wordmarkInner = wordmarkInnerRef.current;
    if (targets.length === 0 && !wordmarkInner) return undefined;

    if (prefersReducedMotion()) {
      targets.forEach((el) => {
        el.style.opacity = '1';
      });
      return undefined;
    }

    let ctx: gsap.Context | undefined;
    let observer: IntersectionObserver | undefined;

    try {
      ctx = gsap.context(() => {
        const play = () => {
          gsap.to(targets, {
            opacity: 1,
            y: 0,
            duration: 0.85,
            ease: 'power3.out',
            stagger: 0.06,
            overwrite: 'auto',
          });
          if (wordmarkInner) {
            gsap.to(wordmarkInner, {
              yPercent: 0,
              duration: 1.15,
              ease: 'expo.out',
              delay: 0.12,
              overwrite: 'auto',
            });
          }
        };

        gsap.set(targets, { opacity: 0, y: 26 });
        // The mask lives on the wrapper; only this inner span moves. Animating the wrapper
        // instead would slide the clip window along with its content and reveal nothing.
        // 160% of this span's own height, not ~100%: the tight leading means the glyphs spill
        // above their line box, and the mask is taller than that box by the descender clearance,
        // so a 100% start would leave the ascender tips showing before the reveal plays.
        if (wordmarkInner) gsap.set(wordmarkInner, { yPercent: 160 });

        observer = new IntersectionObserver(
          (entries) => {
            if (entries.some((entry) => entry.isIntersecting)) {
              observer?.disconnect();
              play();
            }
          },
          { threshold: 0.12 }
        );
        observer.observe(root);
      }, root);
    } catch (error) {
      console.error('[FooterDesignDispatch] reveal failed to initialize', error);
      observer?.disconnect();
      ctx?.revert();
      targets.forEach((el) => {
        el.style.opacity = '1';
      });
      if (wordmarkInner) gsap.set(wordmarkInner, { clearProps: 'all' });
    }

    return () => {
      observer?.disconnect();
      ctx?.revert();
    };
  }, [wordmark]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const address = value.trim();
    if (!/^\S+@\S+\.\S+$/.test(address)) {
      setStatus({ kind: 'error', text: 'Enter a valid email address.' });
      return;
    }
    if (!creatorId.trim()) {
      setStatus({ kind: 'error', text: 'Unable to send right now.' });
      return;
    }
    setStatus(null);
    setPending(true);
    try {
      await sendCreatorContactMessage(creatorId, {
        name: address.split('@')[0],
        email: address,
        subject: 'New contact request from your portfolio',
        message: `${address} left their email address in your portfolio footer and would like to hear from you.`,
      });
      setValue('');
      setStatus({ kind: 'ok', text: 'Thank you — your address is on its way.' });
      pushFlashFeedback({
        variant: 'success',
        title: 'Address sent',
        description: 'Your email address was delivered to the creator.',
      });
    } catch (err) {
      const message = getApiErrorMessage(err, 'Unable to send your address. Please try again.');
      setStatus({ kind: 'error', text: message });
      pushFlashFeedback({ variant: 'error', title: 'Not sent', description: message });
    } finally {
      setPending(false);
    }
  };

  // Self-contained hover accent: the hovered item alone shifts and takes full ink. No sibling
  // dimming — that spotlight pattern was removed from this family on purpose.
  const handleLinkEnter = (event: MouseEvent<HTMLElement>) => {
    const el = event.currentTarget;
    el.style.color = ink;
    el.style.transform = 'translateX(4px)';
  };
  const handleLinkLeave = (event: MouseEvent<HTMLElement>) => {
    const el = event.currentTarget;
    el.style.color = '';
    el.style.transform = '';
  };

  const bodySize = 'calc(var(--pf-footer-body-size) * var(--pf-footer-font-scale, 1))';
  const labelSize = 'calc(var(--pf-footer-label-size) * var(--pf-footer-font-scale, 1))';

  // The directory mirrors the reference's rhythm: a long nav list breaks over two ruled columns
  // so no single column runs away, and the coordinates always close the row. The split is a
  // desktop-only device — once stacked, the groups render as one continuous list (see the
  // `contents` class on each group) instead of two disconnected blocks.
  const splitNav = navLinks.length >= 4;
  const navPivot = Math.ceil(navLinks.length / 2);
  const navGroups = splitNav ? [navLinks.slice(0, navPivot), navLinks.slice(navPivot)] : [navLinks];
  const coordinates: { id: string; label: string; url?: string }[] = [];
  if (locationTrimmed) coordinates.push({ id: 'location', label: locationTrimmed });
  if (phoneDisplay && phoneTrimmed) {
    coordinates.push({ id: 'phone', label: phoneDisplay, url: `tel:${phoneTrimmed.replace(/\s+/g, '')}` });
  }
  if (emailTrimmed) coordinates.push({ id: 'email', label: emailTrimmed, url: `mailto:${emailTrimmed}` });

  const directoryItem = (item: { id: string; label: string; url?: string }) =>
    item.url ? (
      <a
        key={item.id}
        href={item.url}
        {...(/^https?:\/\//i.test(item.url) ? { target: '_blank', rel: 'noreferrer' } : {})}
        data-pf-no-color-transition=""
        onMouseEnter={handleLinkEnter}
        onMouseLeave={handleLinkLeave}
        className="pf-dispatch-link flex w-fit items-center py-1"
        style={{ fontSize: bodySize }}
      >
        {item.label}
      </a>
    ) : (
      <p key={item.id} className="w-fit py-1" style={{ fontSize: bodySize, opacity: 0.75 }}>
        {item.label}
      </p>
    );

  return (
    <footer
      id="footer"
      ref={rootRef}
      data-creator-id={creatorId}
      className="pf-dispatch-mode relative isolate left-1/2 w-screen -translate-x-1/2 overflow-x-clip"
      style={
        {
          ...backgroundStyle,
          color: ink,
          '--pf-footer-font-scale': fontSizeScale,
          '--pf-dispatch-focus': accent,
        } as CSSProperties
      }
      data-pf-no-color-transition=""
    >
      <DispatchStyles />

      {/* `pb-*` carries the gap down to the wordmark on its own — it used to come from the
          copyright line's top margin, which this design no longer renders. */}
      <div
        className={`relative z-[1] w-full pb-16 pt-20 sm:pb-20 sm:pt-24 lg:pt-28 ${portfolioEditorialGutterX(contentGutter)}`}
      >
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1.15fr)_repeat(3,minmax(0,0.52fr))] lg:gap-0">
          {/* ── Capture block ─────────────────────────────────────────────── */}
          <div className="pf-dispatch-reveal flex flex-col gap-6 lg:pr-16">
            {heading ? (
              <h2
                data-pf-no-color-transition=""
                className="pf-dispatch-mode max-w-[22ch] font-semibold leading-[1.15]"
                style={{ color: ink, fontSize: `calc(${bodySize} * 1.6)` }}
              >
                {heading}
              </h2>
            ) : null}

            <form onSubmit={onSubmit} noValidate className="max-w-[30rem]">
              <div
                data-pf-no-color-transition=""
                className="pf-dispatch-field pf-dispatch-mode flex items-center gap-3 rounded-full py-2 pl-6 pr-2"
                style={{ backgroundColor: wellFill, color: ink }}
              >
                <label htmlFor="pf-dispatch-email" className="sr-only">
                  Your email address
                </label>
                <input
                  id="pf-dispatch-email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="Your email address"
                  value={value}
                  onChange={(event) => {
                    setValue(event.target.value);
                    if (status) setStatus(null);
                  }}
                  data-pf-no-color-transition=""
                  className="min-w-0 flex-1 border-0 bg-transparent py-2"
                  style={{ color: ink, fontSize: bodySize }}
                />
                <DispatchSubmitButton accent={accent} accentContrast={accentContrast} pending={pending} />
              </div>
            </form>

            <p
              role={status?.kind === 'error' ? 'alert' : 'status'}
              className="min-h-[1.25em] leading-[1.5]"
              style={{ fontSize: labelSize, opacity: status ? 1 : 0.55 }}
            >
              {status?.text ?? note ?? ''}
            </p>

            {links.length > 0 ? (
              <ul className="flex flex-wrap items-center gap-2" aria-label="Social links">
                {links.map((link) => (
                  <li key={link.id}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={link.label}
                      data-pf-no-color-transition=""
                      onMouseEnter={(event) => {
                        const el = event.currentTarget;
                        el.style.backgroundColor = ink;
                        el.style.color = inkContrast;
                        el.style.borderColor = ink;
                      }}
                      onMouseLeave={(event) => {
                        const el = event.currentTarget;
                        el.style.backgroundColor = '';
                        el.style.color = '';
                        el.style.borderColor = hairline;
                      }}
                      className="pf-dispatch-chip inline-flex h-11 items-center gap-1.5 rounded-full border px-4"
                      style={{ borderColor: hairline, color: ink }}
                    >
                      <FooterSocialLinkIcon link={link} bare iconClassName="h-4 w-4" />
                      <span aria-hidden className="text-[0.7em] leading-none opacity-70">
                        ↗
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          {/* ── Ruled directory ─────────────────────────────────────────────
              `lg:contents` dissolves this wrapper into the grid at desktop so each column lands
              in its own track; below that it is an ordinary stack, which is what keeps the
              capture block and the directory from sharing the grid's wide column gap. */}
          <div className="flex flex-col gap-10 lg:contents">
            {navLinks.length > 0 ? (
              <nav
                aria-label="Footer"
                className={`pf-dispatch-reveal flex flex-col gap-3 lg:gap-0 ${
                  splitNav ? 'lg:col-span-2 lg:grid lg:grid-cols-2' : ''
                }`}
              >
                {navGroups.map((group, index) => (
                  <div
                    // `contents` on mobile: the group boxes vanish from layout, so every link
                    // becomes a direct child of the stack above and the two halves read as one
                    // continuous list rather than two groups split by a 40px gap.
                    key={index === 0 ? 'nav-a' : 'nav-b'}
                    className="contents lg:flex lg:flex-col lg:gap-3 lg:border-l lg:pl-8"
                    style={{ borderColor: hairline }}
                  >
                    {group.map(directoryItem)}
                  </div>
                ))}
              </nav>
            ) : null}

            {coordinates.length > 0 ? (
              <div
                className="pf-dispatch-reveal flex flex-col gap-3 lg:border-l lg:pl-8"
                style={{ borderColor: hairline }}
              >
                {coordinates.map(directoryItem)}
              </div>
            ) : null}
          </div>
        </div>

      </div>

      {/* ── Monumental wordmark ─────────────────────────────────────────────
          The mask wrapper carries a little bottom padding (then pulls it back with an equal
          negative margin) so `overflow: hidden` clips below the baseline instead of shaving the
          descenders off names with a g, y or p in them. */}
      <div
        ref={wordmarkContainerRef}
        className={`relative z-[1] w-full pt-10 sm:pt-14 ${portfolioEditorialGutterX(contentGutter)}`}
      >
        {/* The measured span below is `inline-block` on purpose: the fit pass compares its box to
            the container's content width, and a block-level box always reports that same width —
            the ratio would be a constant 1 and the wordmark would never leave its reference size. */}
        <div ref={wordmarkMaskRef} className="overflow-hidden">
          <span ref={wordmarkInnerRef} className="block">
            <span
              ref={wordmarkTextRef}
              data-pf-no-color-transition=""
              className="pf-dispatch-mode inline-block whitespace-nowrap font-semibold leading-[0.82] tracking-[-0.035em]"
              style={{ color: ink, fontSize: 'clamp(3rem, 16vw, 20rem)' }}
            >
              {wordmark}
              <sup className="ml-[0.06em] align-super text-[0.16em] font-normal tracking-normal">®</sup>
            </span>
          </span>
        </div>
      </div>
    </footer>
  );
}

export function FooterDispatchWireframe() {
  return (
    <svg viewBox="0 0 120 72" preserveAspectRatio="none" className="pf-stack-mini h-[4.35rem] w-full" aria-hidden>
      <rect className="pf-stack-mini-stage" x="1.25" y="1.25" width="117.5" height="69.5" rx="9" />

      {/* capture block: heading, email capsule with accent dot, social chips */}
      <rect className="pf-stack-mini-ink" x="7" y="10" width="30" height="3" rx="1.5" />
      <rect className="pf-stack-mini-mute" x="7" y="17" width="42" height="9" rx="4.5" />
      <circle className="pf-stack-mini-accent" cx="44" cy="21.5" r="3.2" />
      <rect className="pf-stack-mini-mute" x="7" y="29.5" width="7" height="4" rx="2" />
      <rect className="pf-stack-mini-mute" x="16" y="29.5" width="7" height="4" rx="2" />
      <rect className="pf-stack-mini-mute" x="25" y="29.5" width="7" height="4" rx="2" />

      {/* ruled directory: three columns behind hairlines */}
      <rect className="pf-stack-mini-mute" x="59" y="9" width="0.8" height="26" />
      <rect className="pf-stack-mini-mute" x="79" y="9" width="0.8" height="26" />
      <rect className="pf-stack-mini-mute" x="99" y="9" width="0.8" height="26" />
      <rect className="pf-stack-mini-mute" x="63" y="10" width="12" height="2" rx="1" />
      <rect className="pf-stack-mini-mute" x="63" y="15" width="10" height="2" rx="1" />
      <rect className="pf-stack-mini-mute" x="63" y="20" width="13" height="2" rx="1" />
      <rect className="pf-stack-mini-mute" x="83" y="10" width="11" height="2" rx="1" />
      <rect className="pf-stack-mini-mute" x="83" y="15" width="13" height="2" rx="1" />
      <rect className="pf-stack-mini-mute" x="83" y="20" width="9" height="2" rx="1" />
      <rect className="pf-stack-mini-mute" x="103" y="10" width="11" height="2" rx="1" />
      <rect className="pf-stack-mini-mute" x="103" y="15" width="9" height="2" rx="1" />
      <rect className="pf-stack-mini-mute" x="103" y="20" width="12" height="2" rx="1" />

      {/* edge-to-edge wordmark */}
      <rect className="pf-stack-mini-ink" x="6" y="49" width="108" height="17" rx="2" />
    </svg>
  );
}
