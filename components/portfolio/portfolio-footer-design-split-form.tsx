'use client';

import gsap from 'gsap';
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type FormEvent } from 'react';
import { formatPhoneDisplay } from '@/lib/phone';
import { getApiErrorMessage } from '@/lib/api-error';
import { sendCreatorContactMessage } from '@/lib/marketplace-api';
import { pushFlashFeedback } from '@/stores/flashFeedbackStore';
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

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Decorative dropdown options — no backing data field, plain UI chrome like Monumental's
 *  own hardcoded field labels. */
const PROJECT_TYPE_OPTIONS = ['Web Design', 'Branding', 'Product', 'Other'];

/** Every color-bearing style in this design carries this exact transition so the whole
 *  canvas (background, hairlines, text) inverts in one smooth 0.5s pass when the portfolio's
 *  color mode toggles — kept local/explicit rather than the app-wide crossfade class (whose
 *  ~620ms shared timing is meant for the rest of the page) so this design gets its own
 *  precise, self-contained 0.5s feel. Combined with `data-pf-no-color-transition` on every
 *  node the focus-group hover system below also animates, so that GSAP's own opacity/x/blur
 *  tweens on those nodes are never fought by a competing CSS transition. */
const MODE_TRANSITION = 'color 0.5s ease, background-color 0.5s ease, border-color 0.5s ease';

/** Abstract geometric brand mark — a square, a triangle and a dot. Derived purely from
 *  SVG shapes (no fabricated logo asset/data field exists for this), used both as the
 *  small overlay on the identity photo and as the closing mark at the foot of the column. */
function SplitFormMark({ tone, size = 26 }: { tone: string; size?: number }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden>
      <rect x="1.25" y="1.25" width="29.5" height="29.5" rx="3" fill="none" stroke={tone} strokeWidth="1.4" />
      <path d="M16 7.5 L25 24.5 H7 Z" fill="none" stroke={tone} strokeWidth="1.4" strokeLinejoin="round" />
      <circle cx="16" cy="18.5" r="3" fill={tone} />
    </svg>
  );
}

/**
 * Borderless floating-label field — same mechanism as Monumental's `MonumentalField`
 * (label lifts/shrinks + a hairline grows via GSAP `scaleX` on focus, 0.4s-ish feel),
 * themed through props so it can render on either a pure-white or pure-black canvas.
 */
function SplitFormField({
  id,
  label,
  type = 'text',
  multiline = false,
  value,
  onChange,
  required = false,
  ink,
  muted,
  hairline,
}: {
  id: string;
  label: string;
  type?: string;
  multiline?: boolean;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  ink: string;
  muted: string;
  hairline: string;
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
      labelEl.style.color = elevated ? ink : muted;
      lineEl.style.transform = `scaleX(${focused ? 1 : 0})`;
      return;
    }
    gsap.to(labelEl, {
      y: elevated ? -22 : 0,
      scale: elevated ? 0.76 : 1,
      color: elevated ? ink : muted,
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
  }, [elevated, focused, ink, muted]);

  const sharedClassName =
    'w-full origin-left border-0 border-b bg-transparent pb-2.5 pt-6 text-base outline-none transition placeholder:text-transparent focus:outline-none focus:ring-0';

  return (
    <div className="relative" data-pf-no-color-transition="">
      <label
        ref={labelRef}
        htmlFor={id}
        className="pointer-events-none absolute left-0 top-3 origin-left text-base"
        style={{ color: muted }}
        data-pf-no-color-transition=""
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
          style={{ color: ink, borderColor: hairline, transition: MODE_TRANSITION }}
          data-pf-no-color-transition=""
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
          style={{ color: ink, borderColor: hairline, transition: MODE_TRANSITION }}
          data-pf-no-color-transition=""
        />
      )}
      <span
        ref={lineRef}
        aria-hidden
        data-pf-no-color-transition=""
        className="pointer-events-none absolute -bottom-px left-0 h-[2px] w-full origin-center scale-x-0"
        style={{ backgroundColor: ink }}
      />
    </div>
  );
}

/** Borderless "select" — a button-driven listbox rather than a native `<select>`, so the
 *  micro-arrow can genuinely track `aria-expanded` (open/closed), not just focus. Plain
 *  CSS transform + transition, no GSAP needed per spec. */
function SplitFormSelect({
  id,
  label,
  value,
  options,
  onChange,
  ink,
  muted,
  hairline,
  panelBg,
}: {
  id: string;
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  ink: string;
  muted: string;
  hairline: string;
  panelBg: string;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const filled = value.trim().length > 0;
  const elevated = open || filled;

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    const onPointerDown = (event: PointerEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className="relative" data-pf-no-color-transition="">
      <label
        htmlFor={id}
        className="pointer-events-none absolute left-0 top-3 origin-left text-base transition motion-reduce:transition-none"
        style={{
          color: elevated ? ink : muted,
          transform: elevated ? 'translateY(-22px) scale(0.76)' : 'translateY(0) scale(1)',
        }}
        data-pf-no-color-transition=""
      >
        {label}
      </label>
      <button
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between border-0 border-b bg-transparent pb-2.5 pt-6 text-left text-base outline-none"
        style={{ color: ink, borderColor: hairline, transition: MODE_TRANSITION }}
        data-pf-no-color-transition=""
      >
        <span>{value || ' '}</span>
        <span
          aria-hidden
          data-pf-no-color-transition=""
          className="ml-3 inline-flex shrink-0 transition-transform duration-300 motion-reduce:transition-none"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          <svg viewBox="0 0 12 8" className="h-2.5 w-3" aria-hidden>
            <path d="M1 1l5 5 5-5" fill="none" stroke={muted} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>
      {open ? (
        <ul
          role="listbox"
          aria-labelledby={id}
          className="absolute left-0 right-0 top-full z-10 mt-2 overflow-hidden rounded-md border py-1 shadow-lg"
          style={{ backgroundColor: panelBg, borderColor: hairline, transition: MODE_TRANSITION }}
          data-pf-no-color-transition=""
        >
          {options.map((option) => (
            <li key={option}>
              <button
                type="button"
                role="option"
                aria-selected={value === option}
                onClick={() => {
                  onChange(option);
                  setOpen(false);
                }}
                className="block w-full px-4 py-2.5 text-left text-sm transition hover:opacity-70"
                style={{ color: ink, transition: MODE_TRANSITION }}
                data-pf-no-color-transition=""
              >
                {option}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

/** Minimalist rectangle submit — inverted contrast vs. the canvas (near-black button on
 *  white / near-white button on black), per spec. */
function SplitFormSubmit({
  pending,
  sent,
  ink,
  bg,
  label,
}: {
  pending: boolean;
  sent: boolean;
  ink: string;
  bg: string;
  label: string;
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      data-pf-no-color-transition=""
      className="inline-flex shrink-0 items-center justify-center px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.18em] disabled:cursor-not-allowed disabled:opacity-50"
      style={{ backgroundColor: ink, color: bg, transition: MODE_TRANSITION }}
    >
      {sent ? 'Message sent' : pending ? 'Sending…' : label}
    </button>
  );
}

export interface FooterDesignSplitFormProps {
  creatorName: string;
  creatorId: string;
  avatarUrl?: string | null;
  bio?: string | null;
  email?: string | null;
  phone?: string | null;
  locationLabel?: string | null;
  hoursLabel?: string | null;
  links: EditorialContactLink[];
  navLinks: { id: string; label: string; url: string }[];
  layout: FooterDesignLayoutResolver;
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
 * "Split form" — an asymmetric, full-bleed two-column split: a suspended portrait card,
 * circular profile pill and massive contact details on the left; a giant display headline
 * and a fully borderless GSAP floating-label contact form (name / email / message + a
 * pivoting-arrow project-type dropdown) on the right. A hairline divider gives way to a
 * compact "NAVIGATION" / "VISIT US" sub-footer beneath both columns.
 *
 * Purified pass: bio, pull-quote and the duplicate hours line under the phone number are
 * gone, leaving one immense breathing gap between the identity row and "/ CONTACT"; the
 * send button stands alone without a consent caption. Email, nav links and social icons
 * read at full ink at rest — no dimmed baseline. This mirrors the portfolio's own active
 * `colorMode` — pure white / pure black, synced text — same convention as Contact's
 * "Studio overlap" design, and every color-bearing node carries its own explicit 0.5s
 * transition (see `MODE_TRANSITION`) so the whole canvas inverts smoothly on a light/dark
 * toggle. Below 768px the grid reorders via CSS `order` (no separate mobile tree) so the
 * headline + form render first, ahead of the identity card, to maximize conversion.
 */
export function FooterDesignSplitForm({
  creatorName,
  creatorId,
  avatarUrl,
  email,
  phone,
  locationLabel,
  hoursLabel,
  links,
  navLinks,
  layout,
  colorMode,
  contentGutter = DEFAULT_CONTENT_GUTTER,
  backgroundStyle,
  fontSizeScale = 1,
}: FooterDesignSplitFormProps) {
  const rootRef = useRef<HTMLElement>(null);

  const isLight = colorMode === 'light';
  // Not the canvas paint anymore (see `backgroundStyle`) — only used below for the inverted
  // submit button's text color (fill = ink, text = this contrast base).
  const bg = isLight ? '#ffffff' : '#000000';
  const ink = isLight ? '#0a0a0a' : '#ffffff';
  const muted = isLight ? '#6b6b6b' : '#8a8a8a';
  const hairline = isLight ? 'rgba(10,10,10,0.16)' : 'rgba(255,255,255,0.18)';
  const cardBg = isLight ? '#f2f2f0' : '#0d0d0d';

  const [values, setValues] = useState({ name: '', email: '', message: '' });
  const [projectType, setProjectType] = useState('');
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleField = (field: 'name' | 'email' | 'message') => (value: string) => {
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
    const nameValue = values.name.trim();
    const emailValue = values.email.trim();
    const messageValue = values.message.trim();
    if (!nameValue) {
      setError('Enter your name.');
      return;
    }
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
        name: nameValue,
        email: emailValue,
        ...(projectType ? { subject: projectType } : {}),
        message: messageValue,
      });
      setSent(true);
      setValues({ name: '', email: '', message: '' });
      setProjectType('');
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
  const resolvedDescription = layout.text('description');
  const projectQuestion = layout.text('projectQuestion');
  const submitLabel = layout.text('submitLabel') ?? 'Send message';
  const contactHeading = layout.text('contactLabel');
  const navHeading = layout.text('navLabel');
  const visitHeading = layout.text('visitLabel');
  const showPortrait = layout.isVisible('portrait');
  const showMark = layout.isVisible('mark');
  const showName = layout.isVisible('name');

  const trimmedEmail = email?.trim() || null;
  const trimmedLocation = locationLabel?.trim() || null;
  const trimmedHours = hoursLabel?.trim() || null;
  const phoneDisplay = phone?.trim() ? formatPhoneDisplay(phone.trim()) : '';
  const showSocials = links.length > 0;
  const initial = creatorName.trim().charAt(0).toUpperCase() || '•';

  return (
    <footer
      id="footer"
      ref={rootRef}
      className="relative left-1/2 isolate w-screen -translate-x-1/2 overflow-hidden"
      style={{ ...backgroundStyle, transition: MODE_TRANSITION, '--pf-footer-font-scale': fontSizeScale } as CSSProperties}
    >
      <div className={`relative z-[1] flex w-full flex-col py-20 sm:py-24 lg:py-28 ${portfolioEditorialGutterX(contentGutter)}`}>
        <div className="grid grid-cols-1 gap-y-16 lg:grid-cols-2 lg:gap-x-16 xl:gap-x-24">
          {/* Left column — identity & info. Reordered after the form on mobile (order-2)
              per the "headline + form first" conversion rule, restored to the true left
              column at lg. */}
          <div className="order-2 flex min-w-0 flex-col lg:order-1">
            {showPortrait ? (
              <div className="relative aspect-[4/5] w-full max-w-sm overflow-hidden" data-pf-no-color-transition="">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={creatorName ? `Portrait of ${creatorName}` : 'Portrait'}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div
                    className="flex h-full w-full items-center justify-center"
                    style={{ backgroundColor: cardBg, transition: MODE_TRANSITION }}
                  >
                    <span className="text-6xl font-semibold" style={{ color: muted }} aria-hidden>
                      {initial}
                    </span>
                  </div>
                )}
                {showMark ? (
                  <div
                    className="absolute left-5 top-5"
                    style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.45))' }}
                    data-pf-no-color-transition=""
                  >
                    <SplitFormMark tone="#ffffff" />
                  </div>
                ) : null}
              </div>
            ) : null}

            {/* No small circular avatar here — the large portrait right above already
               shows the profile photo; repeating it at thumbnail size next to the name
               was pure redundancy. */}
            {showName ? (
              <div className={showPortrait ? 'mt-6' : ''}>
                <span
                  className="font-semibold uppercase tracking-[0.1em]"
                  style={{
                    color: ink,
                    transition: MODE_TRANSITION,
                    fontSize: 'calc(var(--pf-footer-body-size) * var(--pf-footer-font-scale, 1))',
                  }}
                >
                  {creatorName}
                </span>
              </div>
            ) : null}

            {/* Immense breathing gap — the whole point of purifying this column down to
                photo + name + contact. */}
            <div className={showPortrait || showName ? 'mt-20 sm:mt-28 lg:mt-36' : ''}>
              {contactHeading ? (
                <p
                  className="mb-3 font-light uppercase tracking-[0.12em]"
                  style={{
                    color: muted,
                    transition: MODE_TRANSITION,
                    fontSize: 'calc(var(--pf-footer-label-size) * var(--pf-footer-font-scale, 1))',
                  }}
                >
                  {contactHeading}
                </p>
              ) : null}
              <div className="flex flex-col gap-2">
                {phoneDisplay ? (
                  <a
                    href={`tel:${phone!.replace(/\s+/g, '')}`}
                    className="text-[clamp(1.6rem,3.4vw,2.5rem)] font-bold leading-none tracking-tight"
                    style={{ color: ink, transition: MODE_TRANSITION }}
                  >
                    {phoneDisplay}
                  </a>
                ) : null}
                {trimmedEmail ? (
                  <a
                    href={`mailto:${trimmedEmail}`}
                    className="w-fit break-all font-medium"
                    style={{
                      color: ink,
                      transition: MODE_TRANSITION,
                      fontSize: 'calc(var(--pf-footer-body-size) * var(--pf-footer-font-scale, 1))',
                    }}
                    data-pf-no-color-transition=""
                  >
                    {trimmedEmail}
                  </a>
                ) : null}
              </div>
            </div>

            {showMark ? (
              <div className="mt-12">
                <SplitFormMark tone={ink} />
              </div>
            ) : null}
          </div>

          {/* Right column — immersive form. Order-1 on mobile so it renders right under
              the headline before anything else. */}
          <div className="order-1 flex min-w-0 flex-col justify-center lg:order-2">
            {headlineLines.length > 0 ? (
              <h2
                className="mb-6 text-[clamp(2.75rem,7.5vw,6rem)] font-black leading-[0.95] tracking-[-0.02em]"
                style={{ color: ink, transition: MODE_TRANSITION }}
              >
                {headlineLines.map((line, index) => (
                  <span key={index} className="block">
                    {line}
                  </span>
                ))}
              </h2>
            ) : null}
            {resolvedDescription ? (
              <p
                className="max-w-md"
                style={{
                  color: muted,
                  transition: MODE_TRANSITION,
                  fontSize: 'calc(var(--pf-footer-body-size) * var(--pf-footer-font-scale, 1))',
                }}
              >
                {resolvedDescription}
              </p>
            ) : null}

            <form
              onSubmit={onSubmit}
              className={`flex max-w-xl flex-col gap-8 ${headlineLines.length > 0 || resolvedDescription ? 'mt-10' : ''}`}
              noValidate
            >
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                <SplitFormField
                  id="footer-split-form-name"
                  label="Name"
                  value={values.name}
                  onChange={handleField('name')}
                  required
                  ink={ink}
                  muted={muted}
                  hairline={hairline}
                />
                <SplitFormField
                  id="footer-split-form-email"
                  label="Email"
                  type="email"
                  value={values.email}
                  onChange={handleField('email')}
                  required
                  ink={ink}
                  muted={muted}
                  hairline={hairline}
                />
              </div>

              <SplitFormField
                id="footer-split-form-message"
                label="Message"
                multiline
                value={values.message}
                onChange={handleField('message')}
                required
                ink={ink}
                muted={muted}
                hairline={hairline}
              />

              {projectQuestion ? (
                <SplitFormSelect
                  id="footer-split-form-project-type"
                  label={projectQuestion}
                  value={projectType}
                  options={PROJECT_TYPE_OPTIONS}
                  onChange={setProjectType}
                  ink={ink}
                  muted={muted}
                  hairline={hairline}
                  panelBg={cardBg}
                />
              ) : null}

              {error ? (
                <p className="text-xs font-medium text-red-500" role="alert">
                  {error}
                </p>
              ) : null}

              <div className="pt-2">
                <SplitFormSubmit pending={pending} sent={sent} ink={ink} bg={bg} label={submitLabel} />
              </div>
            </form>
          </div>
        </div>

        <div
          className="order-3 mt-20 h-px w-full lg:mt-28"
          style={{ backgroundColor: hairline, transition: MODE_TRANSITION }}
        />

        <div className="order-3 mt-14 grid grid-cols-1 gap-12 sm:grid-cols-2 lg:mt-16">
          <div>
            {navHeading ? (
              <p
                className="mb-6 font-light uppercase tracking-[0.12em]"
                style={{
                  color: muted,
                  transition: MODE_TRANSITION,
                  fontSize: 'calc(var(--pf-footer-label-size) * var(--pf-footer-font-scale, 1))',
                }}
              >
                {navHeading}
              </p>
            ) : null}
            <nav aria-label="Footer" className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  className="w-fit font-medium"
                  style={{
                    color: ink,
                    transition: MODE_TRANSITION,
                    fontSize: 'calc(var(--pf-footer-body-size) * var(--pf-footer-font-scale, 1))',
                  }}
                  data-pf-no-color-transition=""
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          <div className="sm:text-right">
            {visitHeading ? (
              <p
                className="font-light uppercase tracking-[0.12em]"
                style={{
                  color: muted,
                  transition: MODE_TRANSITION,
                  fontSize: 'calc(var(--pf-footer-label-size) * var(--pf-footer-font-scale, 1))',
                }}
              >
                {visitHeading}
              </p>
            ) : null}
            {trimmedLocation ? (
              <p
                className={`${visitHeading ? 'mt-6' : ''} max-w-md text-[clamp(1.4rem,2.8vw,2.15rem)] font-semibold leading-tight sm:ml-auto`}
                style={{ color: ink, transition: MODE_TRANSITION }}
              >
                {trimmedLocation}
              </p>
            ) : null}
            {trimmedHours ? (
              <p
                className="mt-3"
                style={{
                  color: muted,
                  transition: MODE_TRANSITION,
                  fontSize: 'calc(var(--pf-footer-body-size) * var(--pf-footer-font-scale, 1))',
                }}
              >
                {trimmedHours}
              </p>
            ) : null}
            {showSocials ? (
              <div className="mt-6 flex flex-wrap gap-4 sm:justify-end">
                {links.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border"
                    style={{ borderColor: hairline, color: ink, transition: MODE_TRANSITION }}
                    data-pf-no-color-transition=""
                    aria-label={link.label}
                  >
                    <FooterSocialLinkIcon link={link} bare iconClassName="h-5 w-5" />
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </footer>
  );
}

/** Mini wireframe canvas + preview for the settings-panel picker — same `.pf-stack-*`
 *  house convention as every other section's Design tab thumbnails: a card + circle on
 *  the left half, a bold headline bar and a few hairline "field" lines on the right. */
export function FooterSplitFormWireframe() {
  return (
    <svg viewBox="0 0 120 72" preserveAspectRatio="none" className="pf-stack-mini h-[4.35rem] w-full" aria-hidden>
      <rect className="pf-stack-mini-stage" x="1.25" y="1.25" width="117.5" height="69.5" rx="9" />
      <rect className="pf-stack-mini-mute" x="9" y="9" width="40" height="28" rx="2" />
      <circle className="pf-stack-mini-mute" cx="15.5" cy="45.5" r="3.2" />
      <rect className="pf-stack-mini-mute" x="22" y="43.8" width="22" height="2.6" rx="1.3" />
      <rect className="pf-stack-mini-mute" x="9" y="54" width="30" height="2.4" rx="1.2" />
      <rect className="pf-stack-mini-mute" x="9" y="60" width="18" height="2.4" rx="1.2" />
      <rect className="pf-stack-mini-ink" x="63" y="10" width="48" height="8" rx="1.5" />
      <rect className="pf-stack-mini-ink" x="63" y="21" width="34" height="8" rx="1.5" />
      <rect className="pf-stack-mini-mute" x="63" y="41" width="48" height="1.6" />
      <rect className="pf-stack-mini-mute" x="63" y="51" width="48" height="1.6" />
      <rect className="pf-stack-mini-mute" x="63" y="61" width="26" height="1.6" />
    </svg>
  );
}
