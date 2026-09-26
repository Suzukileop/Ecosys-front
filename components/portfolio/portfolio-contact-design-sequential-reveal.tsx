'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image from 'next/image';
import { useForm, type UseFormRegisterReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { getApiErrorMessage } from '@/lib/api-error';
import { sendCreatorContactMessage } from '@/lib/marketplace-api';
import { pushFlashFeedback } from '@/stores/flashFeedbackStore';
import type { PortfolioContactPresentationSettings } from '@/components/portfolio/portfolio-contact-settings';
import type { ContactDesignLayoutResolver } from '@/components/portfolio/portfolio-contact-design-layout';
import {
  DEFAULT_CONTENT_GUTTER,
  portfolioEditorialGutterX,
  type PortfolioContentGutter,
} from '@/components/portfolio/portfolio-editorial-layout';
import {
  contactLightDarkTokens,
  type ContactLightDarkTokens,
} from '@/components/portfolio/portfolio-contact-design-motion';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

const sequentialMessageSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(80, 'First name is too long'),
  lastName: z.string().trim().min(1, 'Last name is required').max(80, 'Last name is too long'),
  email: z.string().trim().email('Enter a valid email').max(254, 'Email is too long'),
  message: z
    .string()
    .trim()
    .min(10, 'Message must be at least 10 characters')
    .max(4000, 'Message is too long'),
});
type SequentialFormValues = z.infer<typeof sequentialMessageSchema>;
const EMPTY_FORM: SequentialFormValues = { firstName: '', lastName: '', email: '', message: '' };

/**
 * One borderless field: a micro-caps label that floats above a hairline baseline. No box,
 * no border, no background fill — the line is the only chrome. Both the label lift and the
 * line's thicken/tint are GSAP-driven (never a CSS :focus rule), so every animated node here
 * carries data-pf-no-color-transition per the site-wide global-crossfade gotcha.
 */
function FloatingField({
  id,
  label,
  type = 'text',
  multiline = false,
  autoComplete,
  registration,
  error,
  active,
  accent,
  tokens,
}: {
  id: string;
  label: string;
  type?: string;
  multiline?: boolean;
  autoComplete?: string;
  registration: UseFormRegisterReturn;
  error?: string;
  active: boolean;
  accent: string;
  tokens: ContactLightDarkTokens;
}) {
  const labelRef = useRef<HTMLLabelElement>(null);
  const lineRef = useRef<HTMLSpanElement>(null);
  const [focused, setFocused] = useState(false);

  useLayoutEffect(() => {
    const labelEl = labelRef.current;
    const lineEl = lineRef.current;
    if (!labelEl || !lineEl) return;
    if (prefersReducedMotion()) {
      gsap.set(labelEl, { y: active ? -22 : 0, scale: active ? 0.72 : 1 });
      gsap.set(lineEl, { scaleX: focused ? 1 : 0 });
      return;
    }
    gsap.to(labelEl, {
      y: active ? -22 : 0,
      scale: active ? 0.72 : 1,
      color: focused ? accent : tokens.faint,
      duration: 0.35,
      ease: 'power2.out',
      overwrite: 'auto',
    });
    gsap.to(lineEl, {
      scaleX: focused ? 1 : 0,
      scaleY: focused ? 2.4 : 1,
      backgroundColor: accent,
      duration: 0.45,
      ease: 'power3.out',
      overwrite: 'auto',
    });
  }, [active, focused, accent, tokens]);

  const fieldClassName =
    'peer block w-full resize-none border-0 border-b bg-transparent pb-3 text-lg outline-none ring-0 focus:outline-none focus:ring-0';
  const fieldStyle = { color: tokens.ink, borderColor: tokens.border };

  return (
    <div className="relative pt-7" data-pf-no-color-transition="">
      <label
        ref={labelRef}
        htmlFor={id}
        className="pointer-events-none absolute left-0 top-7 origin-left text-[13px] font-semibold uppercase tracking-[0.16em]"
        style={{ color: tokens.faint }}
        data-pf-no-color-transition=""
      >
        {label}
      </label>
      {multiline ? (
        <textarea
          id={id}
          rows={3}
          aria-invalid={Boolean(error)}
          className={fieldClassName}
          style={fieldStyle}
          data-pf-no-color-transition=""
          {...registration}
          onFocus={() => setFocused(true)}
          onBlur={(event) => {
            setFocused(false);
            void registration.onBlur(event);
          }}
        />
      ) : (
        <input
          id={id}
          type={type}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          className={fieldClassName}
          style={fieldStyle}
          data-pf-no-color-transition=""
          {...registration}
          onFocus={() => setFocused(true)}
          onBlur={(event) => {
            setFocused(false);
            void registration.onBlur(event);
          }}
        />
      )}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px"
        style={{ backgroundColor: tokens.border }}
        data-pf-no-color-transition=""
      />
      <span
        ref={lineRef}
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px origin-left scale-x-0"
        style={{ backgroundColor: accent }}
        data-pf-no-color-transition=""
      />
      {error ? <p className="mt-2 text-xs font-medium text-red-400">{error}</p> : null}
    </div>
  );
}

/**
 * Concept 4 — "Sequential reveal": a strictly narrative composition — monumental title,
 * then a cinematic clip-path image reveal, then a radically de-boxed form — read top to
 * bottom on every breakpoint (no split layout to collapse). The title does a per-letter
 * entrance + a light scroll parallax; the image unmasks via a scrubbed clip-path inset
 * with a synced zoom-settle (scale 1.12 → 1); the form drops every box/border in favour of
 * hairline baselines with GSAP floating labels; the submit control is a magnetic circle
 * that glides toward the cursor with an elastic snap-back, desktop fine-pointer only.
 * Text, the image placeholder, the hairlines and the submit circle all mirror the
 * portfolio's own active color mode (settings.global.colorMode) via the shared
 * contactLightDarkTokens() recipe in portfolio-contact-design-motion.ts.
 */
export function ContactDesignSequentialReveal({
  creatorId,
  email,
  phone = null,
  locationLabel = null,
  heroImageUrl,
  heroImageAlt,
  sectionTitle,
  presentation,
  layout,
  contentGutter = DEFAULT_CONTENT_GUTTER,
  colorMode,
}: {
  creatorId?: string;
  email: string | null;
  /** Shown in the optional "Contact details" block — already gated by General → Visibility. */
  phone?: string | null;
  locationLabel?: string | null;
  heroImageUrl: string | null;
  heroImageAlt: string;
  sectionTitle?: string;
  presentation: PortfolioContactPresentationSettings;
  layout: ContactDesignLayoutResolver;
  /** Same site-wide editorial gutter every other section respects — this design is full-bleed
   *  (bypasses PortfolioSectionShell, which would normally apply this automatically), so the
   *  title/tagline need it passed in explicitly to line up with the rest of the page. */
  contentGutter?: PortfolioContentGutter;
  /** The portfolio's real active appearance (settings.global.colorMode) — mirrors the
   *  portfolio's own mode (pure white / pure black canvas, synced text), same recipe as
   *  every other genuinely light/dark-aware premium Contact design. */
  colorMode: 'light' | 'dark';
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const imageMaskRef = useRef<HTMLDivElement>(null);
  const imageInnerRef = useRef<HTMLDivElement>(null);
  const submitRef = useRef<HTMLButtonElement>(null);
  const submitInnerRef = useRef<HTMLSpanElement>(null);

  const tokens = contactLightDarkTokens(colorMode);
  const accent = presentation.ctaColor?.trim() || '#f97316';
  const titleWord = (layout.text('title') || sectionTitle?.trim() || 'Contact').toUpperCase();
  const titleChars = useMemo(() => titleWord.split(''), [titleWord]);
  const tagline = layout.text('tagline');
  const showPortrait = layout.isVisible('portrait');
  const showCopyrightMark = layout.isVisible('copyrightMark');
  const submitLabel = layout.text('submitLabel') ?? 'Send';
  const directEmailLine = layout.text('directEmail');
  const trimmedEmail = email?.trim() || '';
  const showForm = layout.isVisible('form');
  const detailsBelowForm = layout.option('detailsPosition') === 'below';
  const trimmedPhone = phone?.trim() || '';
  const trimmedLocation = locationLabel?.trim() || '';
  const detailItems: SequentialDetailItem[] = [];
  if (layout.isVisible('details')) {
    if (trimmedEmail) {
      detailItems.push({ key: 'email', heading: layout.text('detailEmailLabel'), value: trimmedEmail, href: `mailto:${trimmedEmail}` });
    }
    if (trimmedPhone) {
      detailItems.push({
        key: 'phone',
        heading: layout.text('detailPhoneLabel'),
        value: trimmedPhone,
        href: `tel:${trimmedPhone.replace(/\s+/g, '')}`,
      });
    }
    if (trimmedLocation) {
      detailItems.push({ key: 'address', heading: layout.text('detailAddressLabel'), value: trimmedLocation, href: null });
    }
  }
  const detailCount = detailItems.length;
  // The details already carry the email — don't repeat it in the "or write directly to" line.
  const detailsShowEmail = detailItems.some((item) => item.key === 'email');
  const displayName = heroImageAlt?.trim() || '';
  const initials = useMemo(() => {
    const parts = displayName.split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
  }, [displayName]);

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SequentialFormValues>({
    resolver: zodResolver(sequentialMessageSchema),
    defaultValues: EMPTY_FORM,
  });
  const watched = watch();

  const onSubmit = async (values: SequentialFormValues) => {
    if (!creatorId?.trim()) {
      setSubmitError('Unable to send — creator is missing.');
      return;
    }
    setSubmitError(null);
    try {
      await sendCreatorContactMessage(creatorId, {
        name: `${values.firstName.trim()} ${values.lastName.trim()}`.trim(),
        email: values.email.trim(),
        message: values.message.trim(),
      });
      setSubmitted(true);
      pushFlashFeedback({
        variant: 'success',
        title: 'Message sent',
        description: 'Your message was delivered to the creator.',
      });
      reset(EMPTY_FORM);
    } catch (submitErr) {
      const message = getApiErrorMessage(submitErr, 'Unable to send your message. Please try again.');
      setSubmitError(message);
      pushFlashFeedback({ variant: 'error', title: 'Message not sent', description: message });
    }
  };

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    if (prefersReducedMotion()) return undefined;

    const observers: IntersectionObserver[] = [];
    /**
     * Plays `play()` the moment the element is actually visible, via WHICHEVER mechanism
     * notices first: GSAP's ScrollTrigger (the polished, precisely-timed path) or a plain
     * IntersectionObserver running independently alongside it as a guaranteed backstop.
     * ScrollTrigger alone isn't enough here — on a long, image-heavy page a trigger position
     * calculated before layout above it fully settles (fonts/images still loading) can end up
     * stale, and a one-shot "enter" edge that's never crossed at the (wrong) calculated pixel
     * leaves content stuck permanently hidden with nothing left to re-trigger it — confirmed
     * live (the word "CONTACT" invisible while its own "©" and the tagline showed fine, since
     * only the char spans were gated this way that time). The IntersectionObserver doesn't
     * depend on any of ScrollTrigger's position math, only on the element's real rendered
     * bounding box vs. the viewport, so it can't drift stale the same way.
     */
    function revealOnceVisible(trigger: HTMLElement, startPercent: number, play: () => void) {
      let fired = false;
      const fire = () => {
        if (fired) return;
        fired = true;
        play();
      };
      ScrollTrigger.create({ trigger, start: `top ${startPercent}%`, once: true, onEnter: fire });
      // rootMargin mirrors the ScrollTrigger's own "top N%" threshold (shrinks the effective
      // viewport by the same amount from the bottom) so both mechanisms fire at roughly the
      // same scroll position, whichever notices first — not the instant any pixel appears.
      const io = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            fire();
            io.disconnect();
          }
        },
        { threshold: 0, rootMargin: `0px 0px -${100 - startPercent}% 0px` }
      );
      io.observe(trigger);
      observers.push(io);
    }

    let ctx: gsap.Context | undefined;
    try {
      ctx = gsap.context(() => {
        const charEls = root.querySelectorAll<HTMLElement>('[data-reveal-char-inner]');
        if (charEls.length) {
          gsap.set(charEls, { yPercent: 115, autoAlpha: 0 });
          revealOnceVisible(root, 85, () =>
            gsap.to(charEls, {
              yPercent: 0,
              autoAlpha: 1,
              duration: 0.9,
              stagger: 0.028,
              ease: 'power4.out',
              overwrite: 'auto',
            })
          );
        }

        const titleBlock = root.querySelector<HTMLElement>('[data-reveal-title]');
        if (titleBlock) {
          gsap.fromTo(
            titleBlock,
            { y: 0 },
            {
              y: -40,
              ease: 'none',
              scrollTrigger: { trigger: root, start: 'top bottom', end: 'bottom top', scrub: 0.6 },
            }
          );
        }

        const taglineEl = root.querySelector<HTMLElement>('[data-reveal-tagline]');
        if (taglineEl) {
          gsap.set(taglineEl, { autoAlpha: 0, y: 16 });
          revealOnceVisible(taglineEl, 92, () =>
            gsap.to(taglineEl, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power2.out', overwrite: 'auto' })
          );
        }

        const mask = imageMaskRef.current;
        const inner = imageInnerRef.current;
        if (mask) {
          gsap.fromTo(
            mask,
            { clipPath: 'inset(100% 0% 0% 0%)' },
            {
              clipPath: 'inset(0% 0% 0% 0%)',
              ease: 'none',
              scrollTrigger: { trigger: mask, start: 'top 90%', end: 'top 20%', scrub: 0.6 },
            }
          );
        }
        if (inner) {
          gsap.fromTo(
            inner,
            { scale: 1.12 },
            {
              scale: 1,
              ease: 'none',
              scrollTrigger: { trigger: mask ?? inner, start: 'top 90%', end: 'top 10%', scrub: 0.6 },
            }
          );
        }

        const detailEls = root.querySelectorAll<HTMLElement>('[data-reveal-detail]');
        const detailsNode = root.querySelector<HTMLElement>('[data-reveal-details]');
        if (detailEls.length && detailsNode) {
          gsap.set(detailEls, { autoAlpha: 0, y: 20 });
          revealOnceVisible(detailsNode, 92, () =>
            gsap.to(detailEls, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.08, ease: 'power2.out', overwrite: 'auto' })
          );
        }

        const formFields = root.querySelectorAll<HTMLElement>('[data-reveal-field]');
        const formNode = root.querySelector<HTMLElement>('[data-reveal-form]');
        if (formFields.length && formNode) {
          gsap.set(formFields, { autoAlpha: 0, y: 20 });
          revealOnceVisible(formNode, 92, () =>
            gsap.to(formFields, {
              autoAlpha: 1,
              y: 0,
              duration: 0.7,
              stagger: 0.08,
              ease: 'power2.out',
              overwrite: 'auto',
            })
          );
        }
      }, root);
    } catch (error) {
      // Same containment as the shared Editorial-header template fix — see
      // portfolio-header-mechanism-rollout: an uncaught GSAP/ScrollTrigger init error here
      // would otherwise crash the whole React tree, not just this section.
      console.error('[ContactDesignSequentialReveal] GSAP entrance animation failed to initialize', error);
      ctx?.revert();
      gsap.set(root.querySelectorAll('[data-reveal-char-inner], [data-reveal-tagline], [data-reveal-field], [data-reveal-detail]'), {
        clearProps: 'all',
      });
    }

    const refreshId = window.setTimeout(() => {
      try {
        ScrollTrigger.refresh();
      } catch (error) {
        console.error('[ContactDesignSequentialReveal] deferred ScrollTrigger.refresh() failed', error);
      }
    }, 80);
    return () => {
      window.clearTimeout(refreshId);
      observers.forEach((io) => io.disconnect());
      ctx?.revert();
    };
  }, [titleWord, showPortrait, showForm, detailCount, detailsBelowForm]);

  useLayoutEffect(() => {
    const btn = submitRef.current;
    if (!btn) return undefined;
    if (prefersReducedMotion()) return undefined;
    const enabled = window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 768px)').matches;
    if (!enabled) return undefined;

    const inner = submitInnerRef.current;
    const moveX = gsap.quickTo(btn, 'x', { duration: 0.5, ease: 'power3' });
    const moveY = gsap.quickTo(btn, 'y', { duration: 0.5, ease: 'power3' });
    const moveInnerX = inner ? gsap.quickTo(inner, 'x', { duration: 0.4, ease: 'power3' }) : undefined;
    const moveInnerY = inner ? gsap.quickTo(inner, 'y', { duration: 0.4, ease: 'power3' }) : undefined;

    const onMove = (event: PointerEvent) => {
      const rect = btn.getBoundingClientRect();
      const relX = event.clientX - (rect.left + rect.width / 2);
      const relY = event.clientY - (rect.top + rect.height / 2);
      moveX(relX * 0.4);
      moveY(relY * 0.5);
      moveInnerX?.(relX * 0.18);
      moveInnerY?.(relY * 0.22);
    };
    const onLeave = () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)', overwrite: 'auto' });
      if (inner) gsap.to(inner, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)', overwrite: 'auto' });
    };

    btn.addEventListener('pointermove', onMove);
    btn.addEventListener('pointerleave', onLeave);
    return () => {
      btn.removeEventListener('pointermove', onMove);
      btn.removeEventListener('pointerleave', onLeave);
    };
  }, [showForm]);

  return (
    <div
      ref={rootRef}
      className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden"
      data-pf-no-color-transition=""
    >
      {/* 1 — Monumental hero entrance — uses the SAME site-wide editorial gutter
          (`portfolioEditorialGutterX`, driven by settings.global.contentGutter) every other
          section gets automatically from PortfolioSectionShell. This design bypasses that shell
          (full-bleed), so it must read the real per-account gutter value itself — a hardcoded
          px-6/10/16 guess drifted from accounts on 'narrow'/'wide' gutters, not just the
          mx-auto/max-w-[90rem] centering bug fixed earlier. No centering (no mx-auto/max-w) so
          the inset stays a constant, correct number at any viewport width. */}
      <div
        className={`flex w-full flex-col gap-10 pb-24 pt-24 sm:pb-28 sm:pt-32 lg:pb-32 ${portfolioEditorialGutterX(contentGutter)}`}
      >
        <h2
          data-reveal-title
          aria-label={titleWord}
          className="m-0 select-none font-sans text-[clamp(3.25rem,13vw,10rem)] font-black uppercase leading-[0.86] tracking-[-0.04em]"
          style={{ color: tokens.ink }}
          data-pf-no-color-transition=""
        >
          {titleChars.map((char, index) => (
            <span key={index} className="inline-block overflow-hidden align-top">
              <span data-reveal-char-inner className="inline-block will-change-transform">
                {char === ' ' ? ' ' : char}
              </span>
            </span>
          ))}
          {showCopyrightMark ? <sup className="ml-1 align-super text-[0.28em] font-medium">©</sup> : null}
        </h2>

        {tagline ? (
          <p
            data-reveal-tagline
            className="max-w-sm font-light leading-relaxed sm:text-lg"
            style={{ letterSpacing: '0.01em', color: tokens.muted }}
            data-pf-no-color-transition=""
          >
            {tagline}
          </p>
        ) : null}
      </div>

      {/* 2 — Cinematic clip-path image reveal — matches the form's own width/inset schedule
          below (sm:px-10, lg:px-0 inside the same 46rem column) so both blocks line up as one
          narrow reading column; stays edge-to-edge below sm per the mobile spec. */}
      {showPortrait ? (
      <div className="relative w-full sm:mx-auto sm:max-w-[46rem] sm:px-10 lg:px-0">
        <div
          ref={imageMaskRef}
          className="relative aspect-[4/3] w-full overflow-hidden sm:aspect-[3/2]"
          data-pf-no-color-transition=""
        >
          <div ref={imageInnerRef} className="relative h-full w-full" data-pf-no-color-transition="">
            {heroImageUrl ? (
              <Image
                src={heroImageUrl}
                alt={displayName ? `Portrait of ${displayName}` : 'Portrait'}
                fill
                sizes="100vw"
                className="object-cover object-center"
              />
            ) : (
              <div
                className="flex h-full w-full items-center justify-center"
                style={{ backgroundColor: tokens.placeholderBg }}
              >
                <span
                  className="font-sans text-6xl font-semibold"
                  style={{ color: tokens.muted }}
                  data-pf-no-color-transition=""
                  aria-hidden
                >
                  {initials || '—'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      ) : null}

      {/* 3 — Borderless, boxless form, with the optional contact details above/below it — or,
          when the form is off, the details become the closing block (email set large as the
          single call to action, phone/address beneath). */}
      {showForm || detailCount > 0 ? (
      <div className="mx-auto w-full max-w-[46rem] px-6 py-24 sm:px-10 sm:py-32 lg:px-0">
        {!showForm ? (
          <SequentialDetailsFinale items={detailItems} tokens={tokens} />
        ) : (
        <>
        {!detailsBelowForm && detailCount > 0 ? (
          <>
            <SequentialDetailsRow items={detailItems} tokens={tokens} />
            <div aria-hidden className="my-16 h-px w-full" style={{ backgroundColor: tokens.border }} />
          </>
        ) : null}
        {submitted ? (
          <p className="mb-8 text-sm font-medium" style={{ color: tokens.muted }} data-pf-no-color-transition="" role="status">
            Thanks — your message was sent.
          </p>
        ) : null}

        <form data-reveal-form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-10" noValidate>
          <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2">
            <div data-reveal-field>
              <FloatingField
                id="pf-sequential-first-name"
                label={layout.text('firstNameLabel') ?? 'First name'}
                autoComplete="given-name"
                registration={register('firstName')}
                error={errors.firstName?.message}
                active={Boolean(watched.firstName)}
                accent={accent}
                tokens={tokens}
              />
            </div>
            <div data-reveal-field>
              <FloatingField
                id="pf-sequential-last-name"
                label={layout.text('lastNameLabel') ?? 'Last name'}
                autoComplete="family-name"
                registration={register('lastName')}
                error={errors.lastName?.message}
                active={Boolean(watched.lastName)}
                accent={accent}
                tokens={tokens}
              />
            </div>
          </div>

          <div data-reveal-field>
            <FloatingField
              id="pf-sequential-email"
              label={layout.text('emailFieldLabel') ?? 'Email'}
              type="email"
              autoComplete="email"
              registration={register('email')}
              error={errors.email?.message}
              active={Boolean(watched.email)}
              accent={accent}
              tokens={tokens}
            />
          </div>

          <div data-reveal-field>
            <FloatingField
              id="pf-sequential-message"
              label={layout.text('messageLabel') ?? 'Message'}
              multiline
              registration={register('message')}
              error={errors.message?.message}
              active={Boolean(watched.message)}
              accent={accent}
              tokens={tokens}
            />
          </div>

          {submitError ? (
            <p className="text-sm text-red-400" role="alert">
              {submitError}
            </p>
          ) : null}

          <div data-reveal-field className="flex flex-wrap items-center gap-6 pt-2">
            <button
              ref={submitRef}
              type="submit"
              disabled={isSubmitting || !creatorId?.trim()}
              className="relative inline-flex h-24 w-24 shrink-0 items-center justify-center rounded-full text-xs font-bold uppercase tracking-[0.14em] disabled:cursor-not-allowed disabled:opacity-50 sm:h-28 sm:w-28"
              style={{ backgroundColor: tokens.ink, color: tokens.bg }}
              data-pf-no-color-transition=""
            >
              <span
                ref={submitInnerRef}
                className="inline-flex items-center gap-1.5"
                data-pf-no-color-transition=""
              >
                {isSubmitting ? 'Sending' : submitLabel}
                <svg
                  viewBox="0 0 16 16"
                  className="h-3.5 w-3.5"
                  fill="none"
                  aria-hidden
                  data-pf-no-color-transition=""
                >
                  <path
                    d="M4.5 11.5L11.5 4.5M11.5 4.5H6.5M11.5 4.5V9.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </button>

            {trimmedEmail && directEmailLine && !detailsShowEmail ? (
              <a
                href={`mailto:${trimmedEmail}`}
                className="text-sm font-medium underline underline-offset-4"
                style={{ color: tokens.faint, textDecorationColor: tokens.border }}
                data-pf-no-color-transition=""
              >
                {directEmailLine} {trimmedEmail}
              </a>
            ) : null}
          </div>
        </form>
        {detailsBelowForm && detailCount > 0 ? (
          <>
            <div aria-hidden className="my-16 h-px w-full" style={{ backgroundColor: tokens.border }} />
            <SequentialDetailsRow items={detailItems} tokens={tokens} />
          </>
        ) : null}
        </>
        )}
      </div>
      ) : null}
    </div>
  );
}

type SequentialDetailItem = { key: string; heading: string | null; value: string; href: string | null };

const DETAIL_HEADING_CLASS = 'text-[13px] font-semibold uppercase tracking-[0.16em]';
const DETAIL_COLUMNS: Record<number, string> = { 1: '', 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-3' };

function SequentialDetailValue({
  item,
  className,
  tokens,
}: {
  item: SequentialDetailItem;
  className: string;
  tokens: ContactLightDarkTokens;
}) {
  const spacing = item.heading ? 'mt-3' : '';
  return item.href ? (
    <a
      href={item.href}
      data-pf-no-color-transition=""
      style={{ color: tokens.ink }}
      className={`${spacing} block [overflow-wrap:anywhere] transition-opacity duration-300 hover:opacity-70 ${className}`}
    >
      {item.value}
    </a>
  ) : (
    <p className={`${spacing} ${className}`} style={{ color: tokens.ink }}>{item.value}</p>
  );
}

/** Next to the form: one quiet row of channels, same micro-caps labels as the form fields. */
function SequentialDetailsRow({ items, tokens }: { items: SequentialDetailItem[]; tokens: ContactLightDarkTokens }) {
  return (
    <div data-reveal-details className={`grid gap-x-8 gap-y-8 ${DETAIL_COLUMNS[Math.min(items.length, 3)]}`}>
      {items.map((item) => (
        <div key={item.key} data-reveal-detail className="min-w-0">
          {item.heading ? (
            <p className={DETAIL_HEADING_CLASS} style={{ color: tokens.faint }} data-pf-no-color-transition="">
              {item.heading}
            </p>
          ) : null}
          <SequentialDetailValue item={item} className="text-lg font-light leading-snug" tokens={tokens} />
        </div>
      ))}
    </div>
  );
}

/** Form off: the details close the section — the email becomes the large call to action. */
function SequentialDetailsFinale({ items, tokens }: { items: SequentialDetailItem[]; tokens: ContactLightDarkTokens }) {
  const emailItem = items.find((item) => item.key === 'email');
  const others = items.filter((item) => item.key !== 'email');
  return (
    <div data-reveal-details className="flex flex-col gap-14">
      {emailItem ? (
        <div data-reveal-detail className="min-w-0">
          {emailItem.heading ? (
            <p className={DETAIL_HEADING_CLASS} style={{ color: tokens.faint }} data-pf-no-color-transition="">
              {emailItem.heading}
            </p>
          ) : null}
          <SequentialDetailValue
            item={emailItem}
            className="text-[clamp(1.9rem,5.5vw,3.5rem)] font-semibold leading-[1.05] tracking-[-0.02em]"
            tokens={tokens}
          />
        </div>
      ) : null}
      {others.length > 0 ? (
        <div className={`grid gap-10 ${others.length > 1 ? 'sm:grid-cols-2' : ''}`}>
          {others.map((item) => (
            <div key={item.key} data-reveal-detail className="min-w-0">
              {item.heading ? (
                <p className={DETAIL_HEADING_CLASS} style={{ color: tokens.faint }} data-pf-no-color-transition="">
                  {item.heading}
                </p>
              ) : null}
              <SequentialDetailValue item={item} className="text-xl font-light leading-snug sm:text-2xl" tokens={tokens} />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
