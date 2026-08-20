'use client';

import { useState, type FormEvent, type KeyboardEvent } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getApiErrorMessage } from '@/lib/api-error';
import { sendCreatorContactMessage } from '@/lib/marketplace-api';
import { pushFlashFeedback } from '@/stores/flashFeedbackStore';
import {
  contactFormContentPaddingClass,
  isLightContactChromeColor,
  resolveContactFormDesign,
  type PortfolioContactFormDesign,
  type PortfolioContactPresentationSettings,
} from '@/components/portfolio/portfolio-contact-settings';

const contactMessageSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120, 'Name is too long'),
  email: z.string().trim().email('Enter a valid email').max(254, 'Email is too long'),
  subject: z.string().trim().max(160, 'Subject is too long'),
  phone: z.string().trim().max(40, 'Phone is too long'),
  company: z.string().trim().max(120, 'Company is too long'),
  message: z
    .string()
    .trim()
    .min(10, 'Message must be at least 10 characters')
    .max(4000, 'Message is too long'),
});

type ContactMessageFormValues = z.infer<typeof contactMessageSchema>;

const EMPTY_FORM: ContactMessageFormValues = {
  name: '',
  email: '',
  subject: '',
  phone: '',
  company: '',
  message: '',
};

const STEPPED_FIELDS = ['name', 'email', 'subject', 'message'] as const;
type SteppedField = (typeof STEPPED_FIELDS)[number];

const STEPPED_STEP_LABELS = ['Name', 'Email', 'Subject', 'Message'] as const;

export type ContactFormChannelsMeta = {
  email?: string | null;
  phone?: string | null;
  locationLabel?: string | null;
  responseTimeLabel?: string | null;
  /** Optional; default "Available for work" when showing workspace footer. */
  availabilityLabel?: string | null;
};

const fieldClassName =
  'w-full rounded-xl border border-[color:var(--contact-border,#e5e5e5)] bg-[color:var(--contact-page,#ffffff)] px-4 py-3 text-base text-[color:var(--contact-ink,#0a0a0a)] outline-none transition placeholder:text-[color:var(--contact-muted,#737373)] focus:border-[color:var(--contact-accent,#ea580c)] focus:ring-2 focus:ring-[color:var(--contact-accent,#ea580c)]/25';

const labelClassName =
  'mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--contact-muted,#737373)]';

const inquiryLabelClassName =
  'mb-2 block text-base font-semibold text-[color:var(--contact-ink,#0a0a0a)]';

const inquiryFieldClassName =
  'w-full rounded-xl border border-[color:var(--contact-border,#e5e5e5)] bg-[color:var(--contact-page,#ffffff)] px-4 py-3 text-base text-[color:var(--contact-ink,#0a0a0a)] outline-none transition placeholder:text-[color:var(--contact-muted,#a3a3a3)] focus:border-[color:var(--contact-accent,#ea580c)] focus:ring-2 focus:ring-[color:var(--contact-accent,#ea580c)]/20';

const deskLabelClassName =
  'mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--contact-muted,#737373)]';

const deskFieldClassName =
  'w-full rounded-xl border border-[color:var(--contact-border,#e5e5e5)] bg-[color:var(--contact-page,#ffffff)] px-4 py-3 text-base text-[color:var(--contact-ink,#0a0a0a)] outline-none transition placeholder:text-[color:var(--contact-muted,#a3a3a3)] focus:border-[color:var(--contact-accent,#ea580c)] focus:ring-2 focus:ring-[color:var(--contact-accent,#ea580c)]/20';

const infoPanelLabelClassName =
  'mb-2.5 block text-base font-semibold tracking-[-0.01em] text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.18)]';

/** Light portfolios — page-fill fields with a visible border on the accent card. */
const infoPanelFieldLightClassName =
  'w-full rounded-xl border border-[color:color-mix(in_srgb,#ffffff_55%,transparent)] bg-[color:var(--contact-page,#ffffff)] px-4 py-3.5 text-base font-medium text-neutral-900 outline-none transition placeholder:font-normal placeholder:text-neutral-400 focus:border-white focus:ring-2 focus:ring-white/55 [&:-webkit-autofill]:shadow-[inset_0_0_0_1000px_#ffffff] [&:-webkit-autofill]:[-webkit-text-fill-color:#171717]';

/** Dark portfolios — page-fill fields with a visible border. */
const infoPanelFieldDarkClassName =
  'w-full rounded-xl border border-white/35 bg-[color:var(--contact-page,#ffffff)] px-4 py-3.5 text-base font-medium text-neutral-900 outline-none transition placeholder:font-normal placeholder:text-neutral-400 focus:border-white focus:ring-2 focus:ring-white/40 [&:-webkit-autofill]:shadow-[inset_0_0_0_1000px_#ffffff] [&:-webkit-autofill]:[-webkit-text-fill-color:#171717]';

const underlineFieldClassName =
  'w-full rounded-none border-0 border-b-2 border-[color:var(--contact-border,#e5e5e5)] bg-transparent px-0 py-2.5 text-base text-[color:var(--contact-ink,#0a0a0a)] outline-none transition placeholder:text-[color:var(--contact-muted,#737373)] focus:border-[color:var(--contact-accent,#ea580c)] focus:ring-0';

const underlineLabelClassName =
  'mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--contact-muted,#737373)]';

function FieldError({ message, tone = 'default' }: { message?: string; tone?: 'default' | 'on-accent' }) {
  if (!message) return null;
  return (
    <p
      className={`mt-1.5 text-xs font-medium ${
        tone === 'on-accent' ? 'text-white' : 'text-red-600'
      }`}
      role="alert"
    >
      {message}
    </p>
  );
}

function buildInquiryPanelMessage(values: ContactMessageFormValues): string {
  const extras = [
    values.phone.trim() ? `Phone: ${values.phone.trim()}` : null,
    values.company.trim() ? `Company: ${values.company.trim()}` : null,
  ].filter(Boolean);
  if (extras.length === 0) return values.message.trim();
  return `${extras.join('\n')}\n\n${values.message.trim()}`;
}

function ContactFormChannelsFooter({
  channelsMeta,
  showAvailability = false,
}: {
  channelsMeta?: ContactFormChannelsMeta;
  showAvailability?: boolean;
}) {
  if (!channelsMeta) return null;

  const email = channelsMeta.email?.trim() || '';
  const phone = channelsMeta.phone?.trim() || '';
  const location = channelsMeta.locationLabel?.trim() || '';
  const hasChannel = Boolean(email || phone || location);
  if (!hasChannel) return null;

  const availability =
    showAvailability
      ? channelsMeta.availabilityLabel?.trim() || 'Available for work'
      : null;

  const items = [
    email
      ? {
          key: 'email',
          label: email,
          href: `mailto:${email}`,
        }
      : null,
    phone
      ? {
          key: 'phone',
          label: phone,
          href: `tel:${phone.replace(/\s+/g, '')}`,
        }
      : null,
    location
      ? {
          key: 'location',
          label: location,
          href: null as string | null,
        }
      : null,
  ].filter(Boolean) as { key: string; label: string; href: string | null }[];

  return (
    <div className="mt-6 flex flex-col gap-3 border-t border-[color:var(--contact-border,#e5e5e5)] pt-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-[color:var(--contact-muted,#737373)]">
        {items.map((item) => (
          <li key={item.key} className="min-w-0">
            {item.href ? (
              <a
                href={item.href}
                className="truncate text-[color:var(--contact-ink,#0a0a0a)] transition hover:text-[color:var(--contact-accent,#ea580c)]"
              >
                {item.label}
              </a>
            ) : (
              <span className="truncate text-[color:var(--contact-ink,#0a0a0a)]">{item.label}</span>
            )}
          </li>
        ))}
      </ul>
      {availability ? (
        <p className="text-sm font-medium text-[color:var(--contact-accent,#ea580c)]">{availability}</p>
      ) : null}
    </div>
  );
}

function SuccessBanner({
  submitted,
  tone = 'default',
}: {
  submitted: boolean;
  tone?: 'default' | 'on-accent';
}) {
  if (!submitted) return null;
  if (tone === 'on-accent') {
    return (
      <p
        className="mb-5 rounded-xl border border-white/25 bg-black/15 px-3.5 py-3 text-sm font-medium text-white"
        role="status"
      >
        Thanks — your message was sent.
      </p>
    );
  }
  return (
    <p
      className="mb-4 rounded-xl border border-[color:var(--contact-border,#e5e5e5)] bg-[color:var(--contact-accent-soft,rgba(234,88,12,0.12))] px-3.5 py-3 text-sm text-[color:var(--contact-ink,#0a0a0a)]"
      role="status"
    >
      Thanks — your message was sent.
    </p>
  );
}

export function ContactMessageForm({
  creatorId,
  presentation,
  variant,
  formDesign,
  channelsMeta,
}: {
  creatorId: string;
  presentation: PortfolioContactPresentationSettings;
  /** Legacy override; map `default` via resolve. Prefer `formDesign`. */
  variant?: 'default' | PortfolioContactFormDesign;
  /** Preferred explicit form chrome. */
  formDesign?: PortfolioContactFormDesign;
  channelsMeta?: ContactFormChannelsMeta;
}) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [stepAnnounce, setStepAnnounce] = useState('');
  const [workspaceMode, setWorkspaceMode] = useState<'message' | 'quote'>('message');

  const design: PortfolioContactFormDesign =
    formDesign ??
    (variant && variant !== 'default' ? variant : undefined) ??
    resolveContactFormDesign(presentation);

  const titleFallback =
    design === 'project-brief'
      ? 'Start a project'
      : design === 'workspace-chat'
        ? "Let's connect"
        : 'Send a message';
  const title = presentation.contactFormTitle.trim() || titleFallback;
  const submitLabel =
    presentation.contactFormSubmitLabel.trim() ||
    (design === 'inquiry'
      ? 'Submit'
      : design === 'workspace-chat'
        ? workspaceMode === 'quote'
          ? 'Request Quote'
          : 'Send Message'
        : 'Send message');
  const contentPad = contactFormContentPaddingClass(
    presentation.cardPadding,
    presentation.cardDesign,
    design
  );

  const {
    register,
    handleSubmit,
    reset,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<ContactMessageFormValues>({
    resolver: zodResolver(contactMessageSchema),
    defaultValues: EMPTY_FORM,
  });

  const goToStep = (next: number) => {
    const clamped = Math.max(0, Math.min(STEPPED_FIELDS.length - 1, next));
    setStepIndex(clamped);
    setStepAnnounce(`Step ${clamped + 1} of ${STEPPED_FIELDS.length}: ${STEPPED_STEP_LABELS[clamped]}`);
  };

  const advanceStepped = async () => {
    const field = STEPPED_FIELDS[stepIndex] as SteppedField;
    const ok = await trigger(field);
    if (!ok) return;
    if (stepIndex < STEPPED_FIELDS.length - 1) {
      goToStep(stepIndex + 1);
    }
  };

  const onSubmit = async (values: ContactMessageFormValues) => {
    if (!creatorId.trim()) {
      setSubmitError('Unable to send — creator is missing.');
      return;
    }
    setSubmitError(null);
    try {
      let subject =
        values.subject.trim() ||
        (design === 'inquiry-panel' && values.company.trim() ? values.company.trim() : '') ||
        '';

      if (design === 'workspace-chat' && workspaceMode === 'quote') {
        const raw = values.subject.trim();
        subject = raw.toLowerCase().startsWith('quote:') ? raw : `Quote: ${raw}`.trimEnd();
      }

      let message = values.message.trim();
      if (design === 'inquiry-panel') {
        message = buildInquiryPanelMessage(values);
      } else if (design === 'desk' && values.phone.trim()) {
        message = `Phone: ${values.phone.trim()}\n\n${message}`;
      }

      await sendCreatorContactMessage(creatorId, {
        name: values.name.trim(),
        email: values.email.trim(),
        ...(subject ? { subject } : {}),
        message,
      });
      setSubmitted(true);
      setStepIndex(0);
      setStepAnnounce('');
      setWorkspaceMode('message');
      pushFlashFeedback({
        variant: 'success',
        title: 'Message sent',
        description: 'Your message was delivered to the creator.',
      });
      reset(EMPTY_FORM);
    } catch (error) {
      const message = getApiErrorMessage(error, 'Unable to send your message. Please try again.');
      setSubmitError(message);
      pushFlashFeedback({
        variant: 'error',
        title: 'Message not sent',
        description: message,
      });
    }
  };

  const handleSteppedKeyDown = async (event: KeyboardEvent<HTMLFormElement>) => {
    if (event.key !== 'Enter') return;
    if (stepIndex >= STEPPED_FIELDS.length - 1) return;
    const target = event.target as HTMLElement | null;
    if (target?.tagName === 'TEXTAREA') return;
    event.preventDefault();
    await advanceStepped();
  };

  const handleSteppedFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (stepIndex < STEPPED_FIELDS.length - 1) {
      await advanceStepped();
      return;
    }
    await handleSubmit(onSubmit)(event);
  };

  if (design === 'inquiry') {
    return (
      <div className={`relative z-[1] flex h-full w-full flex-col ${contentPad}`.trim()}>
        <SuccessBanner submitted={submitted} />

        <form onSubmit={handleSubmit(onSubmit)} className="flex h-full w-full flex-1 flex-col space-y-5" noValidate>
          <div>
            <label htmlFor="portfolio-contact-name" className={inquiryLabelClassName}>
              How can we call you?
            </label>
            <input
              id="portfolio-contact-name"
              type="text"
              autoComplete="name"
              placeholder="Enter your name"
              className={inquiryFieldClassName}
              aria-invalid={Boolean(errors.name)}
              {...register('name')}
            />
            <FieldError message={errors.name?.message} />
          </div>

          <div>
            <label htmlFor="portfolio-contact-email" className={inquiryLabelClassName}>
              How can we contact you?
            </label>
            <input
              id="portfolio-contact-email"
              type="email"
              autoComplete="email"
              placeholder="Enter your email"
              className={inquiryFieldClassName}
              aria-invalid={Boolean(errors.email)}
              {...register('email')}
            />
            <FieldError message={errors.email?.message} />
          </div>

          <div>
            <label htmlFor="portfolio-contact-subject" className={inquiryLabelClassName}>
              Subject{' '}
              <span className="font-normal text-[color:var(--contact-muted,#737373)]">
                (optional)
              </span>
            </label>
            <input
              id="portfolio-contact-subject"
              type="text"
              placeholder="What is this about?"
              className={inquiryFieldClassName}
              aria-invalid={Boolean(errors.subject)}
              {...register('subject')}
            />
            <FieldError message={errors.subject?.message} />
          </div>

          <div>
            <label htmlFor="portfolio-contact-message" className={inquiryLabelClassName}>
              How can we help you?
            </label>
            <textarea
              id="portfolio-contact-message"
              rows={5}
              placeholder="Enter your message"
              className={`${inquiryFieldClassName} min-h-[8.5rem] resize-y`}
              aria-invalid={Boolean(errors.message)}
              {...register('message')}
            />
            <FieldError message={errors.message?.message} />
          </div>

          <input type="hidden" {...register('phone')} />
          <input type="hidden" {...register('company')} />

          {submitError ? (
            <p className="text-sm text-red-600" role="alert">
              {submitError}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting || !creatorId.trim()}
            className="mt-auto inline-flex w-full items-center justify-center rounded-xl px-6 py-3.5 text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            style={{ backgroundColor: 'var(--contact-accent, #ea580c)' }}
          >
            {isSubmitting ? 'Sending…' : submitLabel}
          </button>
        </form>
      </div>
    );
  }

  if (design === 'inquiry-panel') {
    return (
      <div className={`relative z-[1] flex h-full w-full flex-col ${contentPad}`.trim()}>
        <SuccessBanner submitted={submitted} />

        <form onSubmit={handleSubmit(onSubmit)} className="flex h-full w-full flex-1 flex-col space-y-5" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="portfolio-contact-name" className={inquiryLabelClassName}>
                Name
              </label>
              <input
                id="portfolio-contact-name"
                type="text"
                autoComplete="name"
                placeholder="Full name"
                className={inquiryFieldClassName}
                aria-invalid={Boolean(errors.name)}
                {...register('name')}
              />
              <FieldError message={errors.name?.message} />
            </div>
            <div>
              <label htmlFor="portfolio-contact-email" className={inquiryLabelClassName}>
                Email
              </label>
              <input
                id="portfolio-contact-email"
                type="email"
                autoComplete="email"
                placeholder="Example@gmail.com"
                className={inquiryFieldClassName}
                aria-invalid={Boolean(errors.email)}
                {...register('email')}
              />
              <FieldError message={errors.email?.message} />
            </div>
            <div>
              <label htmlFor="portfolio-contact-phone" className={inquiryLabelClassName}>
                Phone
              </label>
              <input
                id="portfolio-contact-phone"
                type="tel"
                autoComplete="tel"
                placeholder="(123) 456 7890"
                className={inquiryFieldClassName}
                aria-invalid={Boolean(errors.phone)}
                {...register('phone')}
              />
              <FieldError message={errors.phone?.message} />
            </div>
            <div>
              <label htmlFor="portfolio-contact-company" className={inquiryLabelClassName}>
                Company
              </label>
              <input
                id="portfolio-contact-company"
                type="text"
                autoComplete="organization"
                placeholder="Your company"
                className={inquiryFieldClassName}
                aria-invalid={Boolean(errors.company)}
                {...register('company')}
              />
              <FieldError message={errors.company?.message} />
            </div>
          </div>

          <div>
            <label htmlFor="portfolio-contact-message" className={inquiryLabelClassName}>
              Message
            </label>
            <textarea
              id="portfolio-contact-message"
              rows={5}
              placeholder="Enter your message"
              className={`${inquiryFieldClassName} min-h-[8.5rem] resize-y`}
              aria-invalid={Boolean(errors.message)}
              {...register('message')}
            />
            <FieldError message={errors.message?.message} />
          </div>

          <input type="hidden" {...register('subject')} />

          {submitError ? (
            <p className="text-sm text-red-600" role="alert">
              {submitError}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting || !creatorId.trim()}
            className="mt-auto inline-flex w-full items-center justify-center rounded-xl px-7 py-3.5 text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            style={{ backgroundColor: 'var(--contact-accent, #ea580c)' }}
          >
            {isSubmitting ? 'Sending…' : submitLabel}
          </button>
        </form>
      </div>
    );
  }

  if (design === 'desk') {
    return (
      <div className={`relative z-[1] flex h-full w-full flex-col ${contentPad}`.trim()}>
        <SuccessBanner submitted={submitted} />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
          <div className="grid gap-5 lg:grid-cols-2 lg:gap-8">
            <div className="flex min-w-0 flex-col gap-4">
              <div>
                <label htmlFor="portfolio-contact-name" className={deskLabelClassName}>
                  Name
                </label>
                <input
                  id="portfolio-contact-name"
                  type="text"
                  autoComplete="name"
                  placeholder="Votre nom"
                  className={deskFieldClassName}
                  aria-invalid={Boolean(errors.name)}
                  {...register('name')}
                />
                <FieldError message={errors.name?.message} />
              </div>
              <div>
                <label htmlFor="portfolio-contact-phone" className={deskLabelClassName}>
                  Phone
                </label>
                <input
                  id="portfolio-contact-phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+261 34 00 000 00"
                  className={deskFieldClassName}
                  aria-invalid={Boolean(errors.phone)}
                  {...register('phone')}
                />
                <FieldError message={errors.phone?.message} />
              </div>
              <div>
                <label htmlFor="portfolio-contact-email" className={deskLabelClassName}>
                  Mail
                </label>
                <input
                  id="portfolio-contact-email"
                  type="email"
                  autoComplete="email"
                  placeholder="exemple@gmail.com"
                  className={deskFieldClassName}
                  aria-invalid={Boolean(errors.email)}
                  {...register('email')}
                />
                <FieldError message={errors.email?.message} />
              </div>
            </div>

            <div className="flex min-w-0 flex-col">
              <label htmlFor="portfolio-contact-message" className={deskLabelClassName}>
                Message
              </label>
              <textarea
                id="portfolio-contact-message"
                rows={8}
                placeholder="Votre message ici..."
                className={`${deskFieldClassName} min-h-[12rem] flex-1 resize-y lg:min-h-0`}
                aria-invalid={Boolean(errors.message)}
                {...register('message')}
              />
              <FieldError message={errors.message?.message} />
            </div>
          </div>

          <input type="hidden" {...register('subject')} />
          <input type="hidden" {...register('company')} />

          {submitError ? (
            <p className="text-sm text-red-600" role="alert">
              {submitError}
            </p>
          ) : null}

          <div className="flex items-center justify-end border-t border-[color:var(--contact-border,#e5e5e5)] pt-5">
            <button
              type="submit"
              disabled={isSubmitting || !creatorId.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-xs font-bold uppercase tracking-[0.08em] text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              style={{ backgroundColor: 'var(--contact-accent, #ea580c)' }}
            >
              {isSubmitting ? 'Sending…' : submitLabel}
              <span
                className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-white/15"
                aria-hidden
              >
                <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none">
                  <path
                    d="M4.5 11.5L11.5 4.5M11.5 4.5H6.5M11.5 4.5V9.5"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </button>
          </div>
        </form>
      </div>
    );
  }

  if (design === 'info-panel') {
    const darkChrome = isLightContactChromeColor(presentation.titleColor);
    const infoPanelFieldClassName = darkChrome
      ? infoPanelFieldDarkClassName
      : infoPanelFieldLightClassName;

    return (
      <div className={`relative z-[1] flex h-full flex-col ${contentPad}`.trim()}>
        <SuccessBanner submitted={submitted} tone="on-accent" />

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-1 flex-col gap-5" noValidate>
          <div>
            <label htmlFor="portfolio-contact-name" className={infoPanelLabelClassName}>
              Name<span className="ml-0.5 text-white/80">*</span>
            </label>
            <input
              id="portfolio-contact-name"
              type="text"
              autoComplete="name"
              placeholder="Your name"
              className={infoPanelFieldClassName}
              aria-invalid={Boolean(errors.name)}
              {...register('name')}
            />
            <FieldError message={errors.name?.message} tone="on-accent" />
          </div>

          <div>
            <label htmlFor="portfolio-contact-email" className={infoPanelLabelClassName}>
              Email<span className="ml-0.5 text-white/80">*</span>
            </label>
            <input
              id="portfolio-contact-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className={infoPanelFieldClassName}
              aria-invalid={Boolean(errors.email)}
              {...register('email')}
            />
            <FieldError message={errors.email?.message} tone="on-accent" />
          </div>

          <div>
            <label htmlFor="portfolio-contact-subject" className={infoPanelLabelClassName}>
              Subject<span className="ml-0.5 text-white/80">*</span>
            </label>
            <input
              id="portfolio-contact-subject"
              type="text"
              placeholder="What is this about?"
              className={infoPanelFieldClassName}
              aria-invalid={Boolean(errors.subject)}
              {...register('subject')}
            />
            <FieldError message={errors.subject?.message} tone="on-accent" />
          </div>

          <div className="flex flex-1 flex-col">
            <label htmlFor="portfolio-contact-message" className={infoPanelLabelClassName}>
              Message<span className="ml-0.5 text-white/80">*</span>
            </label>
            <textarea
              id="portfolio-contact-message"
              rows={5}
              placeholder="Tell me about your project…"
              className={`${infoPanelFieldClassName} min-h-[9.5rem] flex-1 resize-y`}
              aria-invalid={Boolean(errors.message)}
              {...register('message')}
            />
            <FieldError message={errors.message?.message} tone="on-accent" />
          </div>

          <input type="hidden" {...register('phone')} />
          <input type="hidden" {...register('company')} />

          {submitError ? (
            <p
              className="rounded-lg bg-black/20 px-3 py-2 text-sm font-medium text-white"
              role="alert"
            >
              {submitError}
            </p>
          ) : null}

          <div className="pt-1">
            <button
              type="submit"
              disabled={isSubmitting || !creatorId.trim()}
              className={`inline-flex items-center justify-center rounded-xl px-7 py-3.5 text-sm font-bold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60 ${
                darkChrome
                  ? 'bg-white text-neutral-950 hover:bg-white/90'
                  : 'bg-neutral-950 text-white hover:bg-neutral-800'
              }`}
            >
              {isSubmitting ? 'Sending…' : submitLabel}
            </button>
          </div>
        </form>
      </div>
    );
  }

  if (design === 'project-brief') {
    return (
      <div className={`relative z-[1] ${contentPad}`.trim()}>
        <div className="rounded-2xl border border-[color:var(--contact-border,#e5e5e5)] bg-[color:var(--contact-surface,#ffffff)] px-6 py-5 sm:px-8 sm:py-6">
          <div className="mb-5">
            <h3 className="text-xl font-semibold tracking-[-0.02em] text-[color:var(--contact-ink,#0a0a0a)]">
              {title}
            </h3>
          </div>

          <SuccessBanner submitted={submitted} />

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="portfolio-contact-name" className={labelClassName}>
                  Name
                </label>
                <input
                  id="portfolio-contact-name"
                  type="text"
                  autoComplete="name"
                  className={fieldClassName}
                  aria-invalid={Boolean(errors.name)}
                  {...register('name')}
                />
                <FieldError message={errors.name?.message} />
              </div>
              <div>
                <label htmlFor="portfolio-contact-email" className={labelClassName}>
                  Email
                </label>
                <input
                  id="portfolio-contact-email"
                  type="email"
                  autoComplete="email"
                  className={fieldClassName}
                  aria-invalid={Boolean(errors.email)}
                  {...register('email')}
                />
                <FieldError message={errors.email?.message} />
              </div>
            </div>

            <div>
              <label htmlFor="portfolio-contact-subject" className={labelClassName}>
                Subject{' '}
                <span className="font-medium normal-case tracking-normal">(optional)</span>
              </label>
              <input
                id="portfolio-contact-subject"
                type="text"
                className={fieldClassName}
                aria-invalid={Boolean(errors.subject)}
                {...register('subject')}
              />
              <FieldError message={errors.subject?.message} />
            </div>

            <div>
              <label htmlFor="portfolio-contact-message" className={labelClassName}>
                Message
              </label>
              <textarea
                id="portfolio-contact-message"
                rows={5}
                className={`${fieldClassName} min-h-[8rem] resize-y`}
                aria-invalid={Boolean(errors.message)}
                {...register('message')}
              />
              <FieldError message={errors.message?.message} />
            </div>

            <input type="hidden" {...register('phone')} />
            <input type="hidden" {...register('company')} />

            {submitError ? (
              <p className="text-sm text-red-600" role="alert">
                {submitError}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting || !creatorId.trim()}
              className="inline-flex w-full items-center justify-center rounded-xl px-6 py-3.5 text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              style={{ backgroundColor: 'var(--contact-accent, #ea580c)' }}
            >
              {isSubmitting ? 'Sending…' : submitLabel}
            </button>
          </form>

          <ContactFormChannelsFooter channelsMeta={channelsMeta} />
        </div>
      </div>
    );
  }

  if (design === 'stepped-inquiry') {
    const activeField = STEPPED_FIELDS[stepIndex];
    const isLast = stepIndex >= STEPPED_FIELDS.length - 1;

    return (
      <div className={`relative z-[1] flex h-full min-h-0 w-full flex-col ${contentPad}`.trim()}>
        <SuccessBanner submitted={submitted} />

        <div className="mb-4 flex w-full items-center gap-2" role="list" aria-label="Form steps">
          {STEPPED_STEP_LABELS.map((label, index) => {
            const active = index === stepIndex;
            const done = index < stepIndex;
            const last = index >= STEPPED_STEP_LABELS.length - 1;
            return (
              <div
                key={label}
                className={`flex min-w-0 items-center gap-2 ${last ? '' : 'flex-1'}`}
                role="listitem"
              >
                <span
                  className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition ${
                    active
                      ? 'bg-[color:var(--contact-accent,#ea580c)] text-white'
                      : done
                        ? 'bg-[color:var(--contact-accent-soft,rgba(234,88,12,0.14))] text-[color:var(--contact-ink,#0a0a0a)]'
                        : 'border border-[color:var(--contact-border,#e5e5e5)] bg-[color:var(--contact-surface,#ffffff)] text-[color:var(--contact-muted,#737373)]'
                  }`}
                  aria-current={active ? 'step' : undefined}
                >
                  {index + 1}
                </span>
                <span
                  className={`hidden shrink-0 text-xs font-semibold sm:inline ${
                    active
                      ? 'text-[color:var(--contact-ink,#0a0a0a)]'
                      : 'text-[color:var(--contact-muted,#737373)]'
                  }`}
                >
                  {label}
                </span>
                {last ? null : (
                  <span
                    className={`h-px min-w-3 flex-1 ${
                      done
                        ? 'bg-[color:var(--contact-accent,#ea580c)]'
                        : 'bg-[color:var(--contact-border,#e5e5e5)]'
                    }`}
                    aria-hidden
                  />
                )}
              </div>
            );
          })}
        </div>

        <div className="mb-5 flex w-full items-center gap-2" aria-hidden>
          {STEPPED_FIELDS.map((_, index) => (
            <span
              key={STEPPED_FIELDS[index]}
              className={`h-1.5 flex-1 rounded-full transition ${
                index <= stepIndex
                  ? 'bg-[color:var(--contact-accent,#ea580c)]'
                  : 'bg-[color:var(--contact-border,#e5e5e5)]'
              }`}
            />
          ))}
        </div>

        <p className="sr-only" aria-live="polite" aria-atomic="true">
          {stepAnnounce}
        </p>

        <form
          onSubmit={handleSteppedFormSubmit}
          onKeyDown={handleSteppedKeyDown}
          className="flex min-h-0 w-full flex-1 flex-col"
          noValidate
        >
          {activeField === 'name' ? (
            <div className="w-full">
              <label htmlFor="portfolio-contact-name" className={inquiryLabelClassName}>
                Your name
              </label>
              <input
                id="portfolio-contact-name"
                type="text"
                autoComplete="name"
                placeholder="Enter your name"
                className={inquiryFieldClassName}
                aria-invalid={Boolean(errors.name)}
                {...register('name')}
              />
              <FieldError message={errors.name?.message} />
            </div>
          ) : null}

          {activeField === 'email' ? (
            <div className="w-full">
              <label htmlFor="portfolio-contact-email" className={inquiryLabelClassName}>
                Your email
              </label>
              <input
                id="portfolio-contact-email"
                type="email"
                autoComplete="email"
                placeholder="Enter your email"
                className={inquiryFieldClassName}
                aria-invalid={Boolean(errors.email)}
                {...register('email')}
              />
              <FieldError message={errors.email?.message} />
            </div>
          ) : null}

          {activeField === 'subject' ? (
            <div className="w-full">
              <label htmlFor="portfolio-contact-subject" className={inquiryLabelClassName}>
                Subject{' '}
                <span className="font-normal text-[color:var(--contact-muted,#737373)]">
                  (optional)
                </span>
              </label>
              <input
                id="portfolio-contact-subject"
                type="text"
                placeholder="What is this about?"
                className={inquiryFieldClassName}
                aria-invalid={Boolean(errors.subject)}
                {...register('subject')}
              />
              <FieldError message={errors.subject?.message} />
            </div>
          ) : null}

          {activeField === 'message' ? (
            <div className="flex min-h-0 w-full flex-1 flex-col">
              <label htmlFor="portfolio-contact-message" className={inquiryLabelClassName}>
                Your message
              </label>
              <textarea
                id="portfolio-contact-message"
                rows={5}
                placeholder="Enter your message"
                className={`${inquiryFieldClassName} min-h-[8.5rem] flex-1 resize-y`}
                aria-invalid={Boolean(errors.message)}
                {...register('message')}
              />
              <FieldError message={errors.message?.message} />
            </div>
          ) : null}

          <input type="hidden" {...register('phone')} />
          <input type="hidden" {...register('company')} />

          {submitError ? (
            <p className="text-sm text-red-600" role="alert">
              {submitError}
            </p>
          ) : null}

          <div className="mt-auto flex w-full items-center gap-3 pt-8">
            <button
              type="button"
              disabled={stepIndex === 0 || isSubmitting}
              onClick={() => goToStep(stepIndex - 1)}
              className="inline-flex flex-1 items-center justify-center rounded-xl border border-[color:var(--contact-border,#e5e5e5)] bg-[color:var(--contact-surface,#ffffff)] px-5 py-3 text-sm font-semibold text-[color:var(--contact-ink,#0a0a0a)] transition hover:border-[color:var(--contact-accent,#ea580c)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Back
            </button>
            {isLast ? (
              <button
                type="submit"
                disabled={isSubmitting || !creatorId.trim()}
                className="inline-flex flex-1 items-center justify-center rounded-xl px-6 py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                style={{ backgroundColor: 'var(--contact-accent, #ea580c)' }}
              >
                {isSubmitting ? 'Sending…' : submitLabel}
              </button>
            ) : (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => void advanceStepped()}
                className="inline-flex flex-1 items-center justify-center rounded-xl px-6 py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                style={{ backgroundColor: 'var(--contact-accent, #ea580c)' }}
              >
                Next
              </button>
            )}
          </div>
        </form>
      </div>
    );
  }

  if (design === 'workspace-chat') {
    const isQuote = workspaceMode === 'quote';
    const workspaceCta = isQuote
      ? 'Request Quote'
      : presentation.contactFormSubmitLabel.trim() || 'Send Message';

    return (
      <div className={`relative z-[1] ${contentPad}`.trim()}>
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-lg font-bold tracking-[-0.02em] text-[color:var(--contact-ink,#0a0a0a)]">
            {title}
          </h3>
          <div
            className="inline-flex rounded-full border border-[color:var(--contact-border,#e5e5e5)] bg-[color:var(--contact-surface,#ffffff)] p-1"
            role="group"
            aria-label="Contact mode"
          >
            <button
              type="button"
              onClick={() => setWorkspaceMode('message')}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                !isQuote
                  ? 'bg-[color:var(--contact-accent,#ea580c)] text-white'
                  : 'text-[color:var(--contact-muted,#737373)] hover:text-[color:var(--contact-ink,#0a0a0a)]'
              }`}
              aria-pressed={!isQuote}
            >
              Message
            </button>
            <button
              type="button"
              onClick={() => setWorkspaceMode('quote')}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                isQuote
                  ? 'bg-[color:var(--contact-accent,#ea580c)] text-white'
                  : 'text-[color:var(--contact-muted,#737373)] hover:text-[color:var(--contact-ink,#0a0a0a)]'
              }`}
              aria-pressed={isQuote}
            >
              Quote Request
            </button>
          </div>
        </div>

        <SuccessBanner submitted={submitted} />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <div className="grid gap-3 sm:grid-cols-3">
            {(
              [
                { name: 'name' as const, label: 'Name', type: 'text', autoComplete: 'name', placeholder: 'Your name' },
                {
                  name: 'email' as const,
                  label: 'Email',
                  type: 'email',
                  autoComplete: 'email',
                  placeholder: 'you@example.com',
                },
                {
                  name: 'subject' as const,
                  label: isQuote ? 'Project' : 'Subject',
                  type: 'text',
                  autoComplete: 'off',
                  placeholder: isQuote ? 'Project title' : 'Subject',
                },
              ] as const
            ).map((field, index) => (
              <div
                key={field.name}
                className="rounded-xl border border-[color:var(--contact-border,#e5e5e5)] bg-[color:var(--contact-surface,#ffffff)] p-3.5"
              >
                <div className="mb-2 flex items-center gap-2">
                  <span
                    className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[color:var(--contact-accent-soft,rgba(234,88,12,0.14))] text-[10px] font-bold text-[color:var(--contact-accent,#ea580c)]"
                    aria-hidden
                  >
                    {index + 1}
                  </span>
                  <label
                    htmlFor={`portfolio-contact-${field.name}`}
                    className="text-[11px] font-bold uppercase tracking-[0.12em] text-[color:var(--contact-muted,#737373)]"
                  >
                    {field.label}
                  </label>
                </div>
                <input
                  id={`portfolio-contact-${field.name}`}
                  type={field.type}
                  autoComplete={field.autoComplete}
                  placeholder={field.placeholder}
                  className="w-full border-0 bg-transparent p-0 text-sm text-[color:var(--contact-ink,#0a0a0a)] outline-none placeholder:text-[color:var(--contact-muted,#a3a3a3)] focus:ring-0"
                  aria-invalid={Boolean(errors[field.name])}
                  {...register(field.name)}
                />
                <FieldError message={errors[field.name]?.message} />
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-[color:var(--contact-border,#e5e5e5)] bg-[color:var(--contact-surface,#ffffff)] p-4">
            <label htmlFor="portfolio-contact-message" className={labelClassName}>
              {isQuote ? 'Project brief' : 'Message'}
            </label>
            <textarea
              id="portfolio-contact-message"
              rows={6}
              placeholder={
                isQuote
                  ? 'Describe the project scope, timeline, and goals…'
                  : 'Write your message…'
              }
              className="mt-1 min-h-[10rem] w-full resize-y border-0 bg-transparent p-0 text-sm text-[color:var(--contact-ink,#0a0a0a)] outline-none placeholder:text-[color:var(--contact-muted,#a3a3a3)] focus:ring-0"
              aria-invalid={Boolean(errors.message)}
              {...register('message')}
            />
            <FieldError message={errors.message?.message} />
          </div>

          <input type="hidden" {...register('phone')} />
          <input type="hidden" {...register('company')} />

          {submitError ? (
            <p className="text-sm text-red-600" role="alert">
              {submitError}
            </p>
          ) : null}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !creatorId.trim()}
              className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              style={{ backgroundColor: 'var(--contact-accent, #ea580c)' }}
            >
              {isSubmitting ? 'Sending…' : workspaceCta}
            </button>
          </div>
        </form>

        <ContactFormChannelsFooter channelsMeta={channelsMeta} showAvailability />
      </div>
    );
  }

  if (design === 'minimal-underline') {
    const responseHint =
      channelsMeta?.responseTimeLabel?.trim() || 'Réponse sous 24h';

    return (
      <div className={`relative z-[1] ${contentPad}`.trim()}>
        <SuccessBanner submitted={submitted} />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label
                htmlFor="portfolio-contact-name"
                className={`${underlineLabelClassName} text-[color:var(--contact-accent,#ea580c)]`}
              >
                Name
              </label>
              <input
                id="portfolio-contact-name"
                type="text"
                autoComplete="name"
                className={underlineFieldClassName}
                aria-invalid={Boolean(errors.name)}
                {...register('name')}
              />
              <FieldError message={errors.name?.message} />
            </div>
            <div>
              <label htmlFor="portfolio-contact-email" className={underlineLabelClassName}>
                Email
              </label>
              <input
                id="portfolio-contact-email"
                type="email"
                autoComplete="email"
                className={underlineFieldClassName}
                aria-invalid={Boolean(errors.email)}
                {...register('email')}
              />
              <FieldError message={errors.email?.message} />
            </div>
          </div>

          <div>
            <label htmlFor="portfolio-contact-subject" className={underlineLabelClassName}>
              Subject
            </label>
            <input
              id="portfolio-contact-subject"
              type="text"
              className={underlineFieldClassName}
              aria-invalid={Boolean(errors.subject)}
              {...register('subject')}
            />
            <FieldError message={errors.subject?.message} />
          </div>

          <div>
            <label htmlFor="portfolio-contact-message" className={underlineLabelClassName}>
              Message
            </label>
            <textarea
              id="portfolio-contact-message"
              rows={4}
              className={`${underlineFieldClassName} min-h-[7rem] resize-y`}
              aria-invalid={Boolean(errors.message)}
              {...register('message')}
            />
            <FieldError message={errors.message?.message} />
          </div>

          <input type="hidden" {...register('phone')} />
          <input type="hidden" {...register('company')} />

          {submitError ? (
            <p className="text-sm text-red-600" role="alert">
              {submitError}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-4">
            <button
              type="submit"
              disabled={isSubmitting || !creatorId.trim()}
              className="inline-flex items-center justify-center rounded-full px-7 py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              style={{ backgroundColor: 'var(--contact-accent, #ea580c)' }}
            >
              {isSubmitting ? 'Sending…' : submitLabel}
            </button>
            <p className="text-sm text-[color:var(--contact-muted,#737373)]">{responseHint}</p>
          </div>
        </form>

        <ContactFormChannelsFooter channelsMeta={channelsMeta} />
      </div>
    );
  }

  // classic (default)
  return (
    <div className={`relative z-[1] flex h-full w-full flex-col ${contentPad}`}>
      <div className="mb-5">
        <h3 className="text-xl font-semibold tracking-[-0.02em] text-[color:var(--contact-ink,#0a0a0a)]">
          {title}
        </h3>
        <p className="mt-1 text-base text-[color:var(--contact-muted,#737373)]">
          Share a short brief — I will get back to you.
        </p>
      </div>

      <SuccessBanner submitted={submitted} />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="portfolio-contact-name" className={labelClassName}>
              Name
            </label>
            <input
              id="portfolio-contact-name"
              type="text"
              autoComplete="name"
              className={fieldClassName}
              aria-invalid={Boolean(errors.name)}
              {...register('name')}
            />
            <FieldError message={errors.name?.message} />
          </div>
          <div>
            <label htmlFor="portfolio-contact-email" className={labelClassName}>
              Email
            </label>
            <input
              id="portfolio-contact-email"
              type="email"
              autoComplete="email"
              className={fieldClassName}
              aria-invalid={Boolean(errors.email)}
              {...register('email')}
            />
            <FieldError message={errors.email?.message} />
          </div>
        </div>

        <div>
          <label htmlFor="portfolio-contact-subject" className={labelClassName}>
            Subject <span className="font-medium normal-case tracking-normal">(optional)</span>
          </label>
          <input
            id="portfolio-contact-subject"
            type="text"
            className={fieldClassName}
            aria-invalid={Boolean(errors.subject)}
            {...register('subject')}
          />
          <FieldError message={errors.subject?.message} />
        </div>

        <div>
          <label htmlFor="portfolio-contact-message" className={labelClassName}>
            Message
          </label>
          <textarea
            id="portfolio-contact-message"
            rows={5}
            className={`${fieldClassName} min-h-[8rem] resize-y`}
            aria-invalid={Boolean(errors.message)}
            {...register('message')}
          />
          <FieldError message={errors.message?.message} />
        </div>

        <input type="hidden" {...register('phone')} />
        <input type="hidden" {...register('company')} />

        {submitError ? (
          <p className="text-sm text-red-600" role="alert">
            {submitError}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting || !creatorId.trim()}
          className="inline-flex w-full items-center justify-center rounded-full px-6 py-3 text-base font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          style={{ backgroundColor: 'var(--contact-accent, #ea580c)' }}
        >
          {isSubmitting ? 'Sending…' : submitLabel}
        </button>
      </form>
    </div>
  );
}
