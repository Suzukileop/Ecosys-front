'use client';

import gsap from 'gsap';
import Image from 'next/image';
import { useForm, type UseFormRegisterReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLayoutEffect, useRef, useState } from 'react';
import { getApiErrorMessage } from '@/lib/api-error';
import { sendCreatorContactMessage } from '@/lib/marketplace-api';
import { pushFlashFeedback } from '@/stores/flashFeedbackStore';
import {
  FooterSocialLinkIcon,
  type EditorialContactLink,
} from '@/components/portfolio/portfolio-section-primitives';
import type { PortfolioContactPresentationSettings } from '@/components/portfolio/portfolio-contact-settings';
import type { ContactDesignLayoutResolver } from '@/components/portfolio/portfolio-contact-design-layout';
import {
  DEFAULT_CONTENT_GUTTER,
  portfolioEditorialGutterX,
  type PortfolioContentGutter,
} from '@/components/portfolio/portfolio-editorial-layout';
import {
  contactLightDarkTokens,
  prefersReducedMotion,
  runContactDesignMotion,
} from '@/components/portfolio/portfolio-contact-design-motion';

const DEFAULT_TITLE = "Let's start a project together";

const narrativeMessageSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120, 'Name is too long'),
  email: z.string().trim().email('Enter a valid email').max(254, 'Email is too long'),
  message: z.string().trim().min(10, 'Message must be at least 10 characters').max(4000, 'Message is too long'),
});
type NarrativeFormValues = z.infer<typeof narrativeMessageSchema>;
const EMPTY_FORM: NarrativeFormValues = { name: '', email: '', message: '' };

/** `questionKey` → the Layout settings text element holding that row's (editable) question. */
const FIELDS: { name: keyof NarrativeFormValues; questionKey: string; type: string; multiline?: boolean }[] = [
  { name: 'name', questionKey: 'question1', type: 'text' },
  { name: 'email', questionKey: 'question2', type: 'email' },
  { name: 'message', questionKey: 'question3', type: 'text', multiline: true },
];

function NumberedRow({
  index,
  question,
  type,
  multiline,
  registration,
  error,
  ink,
  muted,
  accent,
  border,
}: {
  index: string;
  question: string;
  type: string;
  multiline?: boolean;
  registration: UseFormRegisterReturn;
  error?: string;
  ink: string;
  muted: string;
  accent: string;
  border: string;
}) {
  const [focused, setFocused] = useState(false);
  const numberRef = useRef<HTMLSpanElement>(null);
  const questionRef = useRef<HTMLSpanElement>(null);
  const lineRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    const activeColor = focused ? accent : muted;
    if (numberRef.current) {
      gsap.to(numberRef.current, { color: activeColor, duration: 0.3, ease: 'power2.out', overwrite: 'auto' });
    }
    if (questionRef.current) {
      gsap.to(questionRef.current, { color: focused ? ink : muted, duration: 0.3, ease: 'power2.out', overwrite: 'auto' });
    }
    if (lineRef.current) {
      gsap.to(lineRef.current, {
        scaleY: focused ? 2.2 : 1,
        backgroundColor: focused ? accent : border,
        duration: 0.35,
        ease: 'power3.out',
        overwrite: 'auto',
      });
    }
  }, [focused, ink, muted, accent, border]);

  const id = `pf-narrative-${registration.name}`;
  const fieldClassName =
    'w-full border-0 bg-transparent pb-4 pt-2 text-[clamp(1.25rem,2vw,1.75rem)] outline-none ring-0 focus:outline-none focus:ring-0';

  return (
    <div className="relative py-10 sm:py-12" data-pf-no-color-transition="">
      <div className="mb-4 flex items-baseline gap-3">
        <span ref={numberRef} className="text-sm font-semibold tabular-nums" style={{ color: muted }} data-pf-no-color-transition="">
          {index}
        </span>
        <span ref={questionRef} className="text-base font-medium sm:text-lg" style={{ color: muted }} data-pf-no-color-transition="">
          {question}
        </span>
      </div>
      {multiline ? (
        <textarea
          id={id}
          rows={2}
          aria-invalid={Boolean(error)}
          className={`${fieldClassName} resize-none`}
          style={{ color: ink }}
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
          aria-invalid={Boolean(error)}
          className={fieldClassName}
          style={{ color: ink }}
          data-pf-no-color-transition=""
          {...registration}
          onFocus={() => setFocused(true)}
          onBlur={(event) => {
            setFocused(false);
            void registration.onBlur(event);
          }}
        />
      )}
      <span aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-px" style={{ backgroundColor: border }} data-pf-no-color-transition="" />
      <span
        ref={lineRef}
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px origin-left"
        style={{ backgroundColor: border }}
        data-pf-no-color-transition=""
      />
      {error ? <p className="mt-2 text-xs font-medium text-red-400">{error}</p> : null}
    </div>
  );
}

/**
 * Concept 8 — "Numbered narrative": a split, Dennis-Snellenberg-style project brief. Left,
 * a wide narrative form — a monumental headline followed by three numbered, borderless rows
 * (01/02/03), each a bare bottom-line with only the question above it — no example filler
 * text inside the field itself. Focus lights the number + question and thickens the line.
 * Right, a narrow metadata rail: circular avatar + arrow drifting together as one magnetic
 * block with a heavy, damped pull, then micro-caps labeled groups (contact / business /
 * socials). Hovering the avatar or a social link pulls that block magnetically toward the
 * cursor; nothing else in the composition dims or blurs.
 */
export function ContactDesignNumberedNarrative({
  creatorId,
  email,
  phone,
  locationLabel,
  links,
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
  phone: string | null;
  locationLabel: string | null;
  links: EditorialContactLink[];
  heroImageUrl: string | null;
  heroImageAlt: string;
  sectionTitle?: string;
  presentation: PortfolioContactPresentationSettings;
  layout: ContactDesignLayoutResolver;
  contentGutter?: PortfolioContentGutter;
  colorMode: 'light' | 'dark';
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);
  const tokens = contactLightDarkTokens(colorMode);
  const accent = presentation.ctaColor?.trim() || '#dc2626';

  const title = layout.text('title') || sectionTitle?.trim() || DEFAULT_TITLE;
  const trimmedEmail = email?.trim() || '';
  const trimmedPhone = phone?.trim() || '';
  const trimmedLocation = locationLabel?.trim() || '';
  const displayName = heroImageAlt?.trim() || '';
  const portraitUrl = layout.isVisible('portrait') ? heroImageUrl : null;
  const submitLabel = layout.text('submitLabel') ?? 'Send message';
  const contactHeading = layout.text('contactLabel');
  const businessHeading = layout.text('businessLabel');
  const socialsHeading = layout.text('socialsLabel');

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NarrativeFormValues>({ resolver: zodResolver(narrativeMessageSchema), defaultValues: EMPTY_FORM });

  const onSubmit = async (values: NarrativeFormValues) => {
    if (!creatorId?.trim()) {
      setSubmitError('Unable to send — creator is missing.');
      return;
    }
    setSubmitError(null);
    try {
      await sendCreatorContactMessage(creatorId, {
        name: values.name.trim(),
        email: values.email.trim(),
        message: values.message.trim(),
      });
      setSubmitted(true);
      pushFlashFeedback({ variant: 'success', title: 'Message sent', description: 'Your message was delivered to the creator.' });
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

    return runContactDesignMotion(root, 'ContactDesignNumberedNarrative', () => {
      // Magnetic hover — avatar+arrow (as one block) + social links. Heavier inertia
      // (longer quickTo duration) than a typical magnetic button so the pull reads as a
      // slow, damped lag rather than a snappy follow.
      const detach: Array<() => void> = [];
      if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        const magnetic = Array.from(root.querySelectorAll<HTMLElement>('[data-magnetic]'));
        magnetic.forEach((el) => {
          const moveX = gsap.quickTo(el, 'x', { duration: 0.9, ease: 'power3' });
          const moveY = gsap.quickTo(el, 'y', { duration: 0.9, ease: 'power3' });
          const onMove = (event: PointerEvent) => {
            const rect = el.getBoundingClientRect();
            moveX((event.clientX - (rect.left + rect.width / 2)) * 0.35);
            moveY((event.clientY - (rect.top + rect.height / 2)) * 0.35);
          };
          const onLeave = () => gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.35)', overwrite: 'auto' });
          el.addEventListener('pointermove', onMove);
          el.addEventListener('pointerleave', onLeave);
          detach.push(() => {
            el.removeEventListener('pointermove', onMove);
            el.removeEventListener('pointerleave', onLeave);
          });
        });
      }

      return () => {
        detach.forEach((off) => off());
      };
    });
  }, [colorMode]);

  return (
    <div
      ref={rootRef}
      className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden"
      data-pf-no-color-transition=""
    >
      <div
        className={`grid w-full grid-cols-1 gap-20 py-28 sm:py-32 md:grid-cols-[minmax(0,1fr)_minmax(16rem,0.4fr)] md:py-40 ${portfolioEditorialGutterX(contentGutter)}`}
      >
        <div className="order-2 flex flex-col md:order-1">
          <h2
            className="m-0 mb-16 select-none font-sans text-[clamp(3rem,7vw,6rem)] font-black leading-[0.88] tracking-[-0.02em] sm:mb-20"
            style={{ color: tokens.ink }}
          >
            {title}
          </h2>

          {submitted ? (
            <p className="mb-6 text-sm font-medium" style={{ color: tokens.muted }} role="status">
              Thanks — your message was sent.
            </p>
          ) : null}

          <form data-narrative-form onSubmit={handleSubmit(onSubmit)} className="flex flex-col" noValidate>
            {FIELDS.map((field, index) => (
              <NumberedRow
                key={field.name}
                index={String(index + 1).padStart(2, '0')}
                question={layout.text(field.questionKey) ?? ''}
                type={field.type}
                multiline={field.multiline}
                registration={register(field.name)}
                error={errors[field.name]?.message}
                ink={tokens.ink}
                muted={tokens.muted}
                accent={accent}
                border={tokens.border}
              />
            ))}

            {submitError ? (
              <p className="mt-4 text-sm text-red-400" role="alert">
                {submitError}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting || !creatorId?.trim()}
              className="mt-8 inline-flex w-fit items-center gap-2 text-sm font-bold uppercase tracking-[0.14em] disabled:cursor-not-allowed disabled:opacity-50"
              style={{ color: tokens.ink }}
              data-pf-no-color-transition=""
            >
              {isSubmitting ? 'Sending…' : submitLabel}
              <span aria-hidden>→</span>
            </button>
          </form>
        </div>

        <div className="order-1 flex flex-col gap-10 md:order-2">
          {portraitUrl ? (
            <div
              ref={avatarRef}
              data-magnetic
              className="flex flex-col items-start gap-4 will-change-transform"
            >
              <div
                className="relative aspect-square w-28 shrink-0 overflow-hidden rounded-full sm:w-32"
                data-pf-no-color-transition=""
              >
                <Image
                  src={portraitUrl}
                  alt={displayName ? `Portrait of ${displayName}` : 'Portrait'}
                  fill
                  sizes="8rem"
                  className="object-cover object-center"
                />
              </div>
              <span
                aria-hidden
                className="text-2xl font-light"
                style={{ color: tokens.muted, transform: 'rotate(20deg)', display: 'inline-block' }}
              >
                ↘
              </span>
            </div>
          ) : null}

          {trimmedEmail || trimmedPhone ? (
            <div className={`flex flex-col gap-3 ${portraitUrl ? 'md:mt-24 lg:mt-32' : ''}`}>
              {contactHeading ? (
                <p className="m-0 text-xs font-semibold uppercase tracking-[0.15em]" style={{ color: tokens.muted }}>
                  {contactHeading}
                </p>
              ) : null}
              {trimmedEmail ? (
                <a
                  href={`mailto:${trimmedEmail}`}
                  className="break-all text-lg font-medium sm:text-xl"
                  style={{ color: tokens.ink }}
                >
                  {trimmedEmail}
                </a>
              ) : null}
              {trimmedPhone ? (
                <a
                  href={`tel:${trimmedPhone.replace(/\s+/g, '')}`}
                  className="text-lg font-medium sm:text-xl"
                  style={{ color: tokens.ink }}
                >
                  {trimmedPhone}
                </a>
              ) : null}
            </div>
          ) : null}

          {trimmedLocation ? (
            <div className="flex flex-col gap-3">
              {businessHeading ? (
                <p className="m-0 text-xs font-semibold uppercase tracking-[0.15em]" style={{ color: tokens.muted }}>
                  {businessHeading}
                </p>
              ) : null}
              <span className="max-w-[16rem] text-lg font-medium leading-relaxed sm:text-xl" style={{ color: tokens.ink }}>
                {trimmedLocation}
              </span>
            </div>
          ) : null}

          {links.length > 0 ? (
            <div className="flex flex-col gap-3 md:mt-auto md:items-end md:text-right">
              {socialsHeading ? (
                <p className="m-0 text-xs font-semibold uppercase tracking-[0.15em]" style={{ color: tokens.muted }}>
                  {socialsHeading}
                </p>
              ) : null}
              <nav className="flex flex-wrap gap-x-8 gap-y-3 md:justify-end" aria-label="Social">
                {links.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    data-magnetic
                    className="inline-flex items-center gap-2 text-lg font-medium will-change-transform sm:text-xl"
                    style={{ color: tokens.ink }}
                    data-pf-no-color-transition=""
                  >
                    <FooterSocialLinkIcon link={link} bare iconClassName="h-5 w-5" />
                    {link.label}
                  </a>
                ))}
              </nav>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
