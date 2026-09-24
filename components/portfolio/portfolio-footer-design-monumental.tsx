'use client';

import gsap from 'gsap';
import { useLayoutEffect, useRef, useState, type CSSProperties, type FormEvent, type RefObject } from 'react';
import { formatPhoneDisplay } from '@/lib/phone';
import { getApiErrorMessage } from '@/lib/api-error';
import { sendCreatorContactMessage } from '@/lib/marketplace-api';
import { pushFlashFeedback } from '@/stores/flashFeedbackStore';
import {
  FooterSocialLinkIcon,
  type EditorialContactLink,
} from '@/components/portfolio/portfolio-section-primitives';
import {
  resolveFooterCopyrightLabel,
  type PortfolioFooterPresentationSettings,
} from '@/components/portfolio/portfolio-footer-settings';
import type { FooterDesignLayoutResolver } from '@/components/portfolio/portfolio-footer-design-layout';
import {
  portfolioEditorialGutterX,
  DEFAULT_CONTENT_GUTTER,
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
 * headers and the Editorial Grid / Inverted Wordmark / Swiss Magnetic Footer designs) —
 * private to that file, so every full-bleed design that needs it keeps its own copy
 * rather than importing across the "bypass" full-bleed boundary.
 */
/** Same ceiling as this watermark's own static fallback (`clamp(4.5rem, 17vw, 15rem)`). */
const MAX_FONT_SIZE_PX = 240;

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
      // `getBoundingClientRect()` reports the border-box width, which still includes this
      // container's own left/right padding (the global content gutter) — fitting the text to
      // that full width ignores the gutter entirely, so the text bleeds straight past the
      // margin. Subtract the padding to get the actual available content width instead.
      const style = window.getComputedStyle(container);
      const horizontalPadding = parseFloat(style.paddingLeft || '0') + parseFloat(style.paddingRight || '0');
      const targetWidth = container.getBoundingClientRect().width - horizontalPadding;
      if (targetWidth <= 0) return;

      textEl.style.fontSize = `${REFERENCE_PX}px`;
      const measuredWidth = textEl.getBoundingClientRect().width;
      if (measuredWidth <= 0) return;

      // A short custom watermark (a handful of letters instead of a full name) needs a much
      // bigger font to fill the same width — capped at the old static clamp's own ceiling
      // (15rem) so it stays a background watermark instead of ballooning tall enough to
      // overlap the content above it.
      const fitted = REFERENCE_PX * (targetWidth / measuredWidth);
      textEl.style.fontSize = `${Math.min(fitted, MAX_FONT_SIZE_PX)}px`;
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

/**
 * Floating-label, borderless field. The base rule is a hairline; a second overlay
 * line grows from the center + thickens on focus (GSAP `scaleX`), and the label
 * lifts/shrinks whenever the field is focused or already holds a value.
 */
function MonumentalField({
  id,
  label,
  type = 'text',
  multiline = false,
  value,
  onChange,
  required = false,
}: {
  id: string;
  label: string;
  type?: string;
  multiline?: boolean;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const labelRef = useRef<HTMLLabelElement>(null);
  const lineRef = useRef<HTMLSpanElement>(null);
  const filled = value.trim().length > 0;
  const elevated = focused || filled;

  useLayoutEffect(() => {
    const labelEl = labelRef.current;
    const lineEl = lineRef.current;
    if (!labelEl || !lineEl) return;
    if (prefersReducedMotion()) {
      labelEl.style.transform = elevated ? 'translateY(-22px) scale(0.76)' : 'translateY(0) scale(1)';
      labelEl.style.color = elevated ? '#ffffff' : '#737373';
      lineEl.style.transform = `scaleX(${focused ? 1 : 0})`;
      return;
    }
    gsap.to(labelEl, {
      y: elevated ? -22 : 0,
      scale: elevated ? 0.76 : 1,
      color: elevated ? '#ffffff' : '#737373',
      duration: 0.35,
      ease: 'power3.out',
      overwrite: 'auto',
    });
    gsap.to(lineEl, {
      scaleX: focused ? 1 : 0,
      duration: 0.45,
      ease: 'power3.out',
      overwrite: 'auto',
    });
  }, [elevated, focused]);

  const sharedClassName =
    'w-full origin-left border-0 border-b border-white/20 bg-transparent pb-2.5 pt-6 text-base text-white outline-none transition placeholder:text-transparent focus:outline-none focus:ring-0';

  return (
    <div className="relative">
      <label
        ref={labelRef}
        htmlFor={id}
        className="pointer-events-none absolute left-0 top-3 origin-left text-base text-neutral-500"
      >
        {label}
      </label>
      {multiline ? (
        <textarea
          id={id}
          name={id}
          rows={3}
          required={required}
          value={value}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={(event) => onChange(event.target.value)}
          className={`${sharedClassName} resize-none`}
        />
      ) : (
        <input
          id={id}
          name={id}
          type={type}
          required={required}
          value={value}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={(event) => onChange(event.target.value)}
          className={sharedClassName}
        />
      )}
      <span
        ref={lineRef}
        aria-hidden
        className="pointer-events-none absolute -bottom-px left-0 h-[2px] w-full origin-center scale-x-0 bg-white"
      />
    </div>
  );
}

/** Bracketed text-link submit — magnetically pulled toward the cursor within a proximity radius. */
function MonumentalSubmit({ pending, sent, label }: { pending: boolean; sent: boolean; label: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const arrowRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    const btn = btnRef.current;
    if (!wrap || !btn) return undefined;
    if (prefersReducedMotion()) return undefined;
    if (!window.matchMedia('(pointer: fine)').matches) return undefined;

    const moveX = gsap.quickTo(btn, 'x', { duration: 0.55, ease: 'power3' });
    const moveY = gsap.quickTo(btn, 'y', { duration: 0.55, ease: 'power3' });
    const radius = 90;

    const onMove = (event: PointerEvent) => {
      const rect = wrap.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = event.clientX - cx;
      const dy = event.clientY - cy;
      const dist = Math.hypot(dx, dy);
      if (dist < radius) {
        moveX(dx * 0.45);
        moveY(dy * 0.4);
      } else {
        moveX(0);
        moveY(0);
      }
    };
    const reset = () => {
      moveX(0);
      moveY(0);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    wrap.addEventListener('pointerleave', reset);
    return () => {
      window.removeEventListener('pointermove', onMove);
      wrap.removeEventListener('pointerleave', reset);
    };
  }, []);

  const sweepArrow = () => {
    if (prefersReducedMotion()) return;
    const arrow = arrowRef.current;
    if (!arrow) return;
    gsap.fromTo(
      arrow,
      { x: -5, opacity: 0.4 },
      { x: 0, opacity: 1, duration: 0.3, ease: 'power2.out', overwrite: 'auto' }
    );
  };

  return (
    <div ref={wrapRef} className="mt-2 inline-flex w-fit">
      <button
        ref={btnRef}
        type="submit"
        disabled={pending}
        onPointerEnter={sweepArrow}
        className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-white transition disabled:cursor-not-allowed disabled:opacity-50"
        data-pf-no-color-transition=""
      >
        <span className="text-neutral-600">[</span>
        <span>{sent ? 'Message sent' : pending ? 'Sending…' : label}</span>
        <span ref={arrowRef} aria-hidden>
          →
        </span>
        <span className="text-neutral-600">]</span>
      </button>
    </div>
  );
}

/**
 * "Monumental" — the third Footer design: an asymmetric, monumental three-column
 * editorial grid on a deep-black full-bleed canvas (slogan + borderless contact
 * form / vertical nav + address / social icons + phone), with the creator's name
 * printed gigantic and near-invisible across the bottom, drifting opposite the
 * cursor for a subtle sense of depth. Bypasses the legacy padding/pattern/shell
 * system entirely — same full-bleed convention as Contact's premium designs.
 */
export function FooterDesignMonumental({
  creatorName,
  creatorId,
  email,
  phone,
  locationLabel,
  links,
  navLinks,
  layout,
  presentation,
  contentGutter = DEFAULT_CONTENT_GUTTER,
  backgroundStyle,
  fontSizeScale = 1,
}: {
  creatorName: string;
  creatorId: string;
  email: string | null;
  phone: string | null;
  locationLabel: string | null;
  links: EditorialContactLink[];
  /** Section links picked in Layout settings — already filtered to visible sections. */
  navLinks: { id: string; label: string; url: string }[];
  layout: FooterDesignLayoutResolver;
  presentation: PortfolioFooterPresentationSettings;
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
}) {
  const rootRef = useRef<HTMLElement>(null);
  const watermarkRef = useRef<HTMLDivElement>(null);
  const watermarkContainerRef = useRef<HTMLDivElement>(null);
  const watermarkText = layout.text('watermark', creatorName);
  useFitWidthTextSize(watermarkContainerRef, watermarkRef, watermarkText ?? '');

  const [values, setValues] = useState({ email: '', subject: '', message: '' });
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const mark = watermarkRef.current;
    if (!root || !mark) return undefined;
    if (prefersReducedMotion()) return undefined;
    if (!window.matchMedia('(pointer: fine) and (min-width: 1024px)').matches) return undefined;

    const moveX = gsap.quickTo(mark, 'xPercent', { duration: 1.6, ease: 'power2' });
    const onMove = (event: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      const relX = (event.clientX - rect.left) / rect.width - 0.5;
      moveX(relX * -6);
    };
    root.addEventListener('pointermove', onMove, { passive: true });
    return () => root.removeEventListener('pointermove', onMove);
  }, []);

  const handleField = (field: 'email' | 'subject' | 'message') => (value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (sent) setSent(false);
    if (error) setError(null);
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!creatorId.trim()) {
      setError('Unable to send — creator is missing.');
      return;
    }
    const emailValue = values.email.trim();
    const messageValue = values.message.trim();
    if (!/^\S+@\S+\.\S+$/.test(emailValue)) {
      setError('Enter a valid email address.');
      return;
    }
    if (messageValue.length < 10) {
      setError('Message must be at least 10 characters.');
      return;
    }
    setError(null);
    setPending(true);
    try {
      await sendCreatorContactMessage(creatorId, {
        name: emailValue.split('@')[0],
        email: emailValue,
        ...(values.subject.trim() ? { subject: values.subject.trim() } : {}),
        message: messageValue,
      });
      setSent(true);
      setValues({ email: '', subject: '', message: '' });
      pushFlashFeedback({
        variant: 'success',
        title: 'Message sent',
        description: 'Your message was delivered to the creator.',
      });
    } catch (err) {
      const message = getApiErrorMessage(err, 'Unable to send your message. Please try again.');
      setError(message);
      pushFlashFeedback({ variant: 'error', title: 'Message not sent', description: message });
    } finally {
      setPending(false);
    }
  };

  const headlineLines = layout.text('headline')?.split('\n') ?? [];
  const submitLabel = layout.text('submitLabel') ?? 'Send Message';
  const copyrightLabel = presentation.showCopyright
    ? resolveFooterCopyrightLabel(presentation.copyrightLabel, creatorName)
    : null;

  const phoneDisplay = presentation.showPhone && phone?.trim() ? formatPhoneDisplay(phone.trim()) : null;
  const locationValue = presentation.showLocation ? locationLabel?.trim() || null : null;
  const showSocials = links.length > 0;

  return (
    <footer
      id="footer"
      ref={rootRef}
      className="relative left-1/2 isolate w-screen -translate-x-1/2 overflow-hidden"
      style={{ ...backgroundStyle, '--pf-footer-font-scale': fontSizeScale } as CSSProperties}
      data-pf-no-color-transition=""
    >
      {watermarkText ? (
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-[2vh]">
          {/* Same max-width + side padding as the content grid below, so the watermark's fit
              width matches the global margins exactly. `watermarkRef` is already `inline-block`
              (shrink-wraps to its own text, unlike a plain block element) so it doubles as the
              fit hook's measurement target with no extra wrapper span needed. */}
          <div ref={watermarkContainerRef} className={`w-full overflow-hidden text-center ${portfolioEditorialGutterX(contentGutter)}`}>
            <div
              ref={watermarkRef}
              className="inline-block select-none whitespace-nowrap font-serif font-bold uppercase tracking-tight text-white/[0.05]"
              style={{ fontSize: 'clamp(4.5rem, 17vw, 15rem)', lineHeight: 1.1, paddingBottom: '0.08em' }}
            >
              {watermarkText}
            </div>
          </div>
        </div>
      ) : null}

      <div className={`relative z-[1] grid w-full grid-cols-1 gap-16 py-20 sm:py-28 lg:grid-cols-[1.5fr_0.85fr_0.85fr] lg:gap-10 lg:py-32 ${portfolioEditorialGutterX(contentGutter)}`}>
        <div className="flex min-w-0 flex-col justify-between gap-14">
          <div>
            {headlineLines.length > 0 ? (
              <p className="mb-12 font-serif text-[clamp(2.25rem,5.4vw,4.5rem)] font-medium leading-[0.98] tracking-[-0.02em] text-white">
                {headlineLines.map((line, index) => (
                  <span key={index} className="block">
                    {line}
                  </span>
                ))}
              </p>
            ) : null}

            <form onSubmit={onSubmit} className="flex max-w-md flex-col gap-8" noValidate>
              <MonumentalField
                id="footer-monument-email"
                label="Email"
                type="email"
                value={values.email}
                onChange={handleField('email')}
                required
              />
              <MonumentalField
                id="footer-monument-subject"
                label="Subject"
                value={values.subject}
                onChange={handleField('subject')}
              />
              <MonumentalField
                id="footer-monument-message"
                label="Message"
                multiline
                value={values.message}
                onChange={handleField('message')}
                required
              />

              {error ? (
                <p className="text-xs font-medium text-red-400" role="alert">
                  {error}
                </p>
              ) : null}

              <MonumentalSubmit pending={pending} sent={sent} label={submitLabel} />
            </form>
          </div>

          {copyrightLabel ? (
            <p
              className="font-medium tracking-wide text-neutral-600"
              style={{ fontSize: 'calc(var(--pf-footer-label-size) * var(--pf-footer-font-scale, 1))' }}
            >
              {copyrightLabel}
            </p>
          ) : null}
        </div>

        {/* Center column is deliberately left mostly empty — negative space between the
            form and the social/nav axis on the right, per the editorial "breathing room" spec. */}
        <div className="flex min-w-0 flex-col justify-end gap-14">
          {locationValue ? (
            <p
              className="max-w-[16rem] text-neutral-500"
              style={{ fontSize: 'calc(var(--pf-footer-body-size) * var(--pf-footer-font-scale, 1))' }}
            >
              {locationValue}
            </p>
          ) : null}
        </div>

        <div className="flex min-w-0 flex-col justify-between gap-14 lg:items-end">
          <div className="flex flex-col gap-8 lg:items-end">
            {showSocials ? (
              <div className="flex flex-wrap gap-3 lg:justify-end">
                {links.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/15 text-white transition hover:border-white/40 hover:bg-white/5"
                    aria-label={link.label}
                  >
                    <FooterSocialLinkIcon link={link} bare iconClassName="h-4 w-4" />
                  </a>
                ))}
              </div>
            ) : null}

            <nav aria-label="Footer" className="flex flex-col gap-4 lg:items-end">
              {navLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  className="w-fit font-medium uppercase tracking-[0.14em] text-neutral-400 transition hover:text-white lg:text-right"
                  style={{ fontSize: 'calc(var(--pf-footer-body-size) * var(--pf-footer-font-scale, 1))' }}
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          {phoneDisplay ? (
            <a
              href={`tel:${phone!.replace(/\s+/g, '')}`}
              className="text-neutral-500 transition hover:text-white"
              style={{ fontSize: 'calc(var(--pf-footer-body-size) * var(--pf-footer-font-scale, 1))' }}
            >
              {phoneDisplay}
            </a>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
