'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  brandCtaClass,
  brandSolidBg,
} from '@/components/landing/landingBrand';

type BillingCycle = 'monthly' | 'annual';

type PricingFeature = {
  label: string;
  tone?: 'default' | 'emphasis' | 'warn';
};

type PricingPlan = {
  id: string;
  name: string;
  priceMonthly: string;
  priceAnnualMonthly: string;
  periodMonthly: string;
  periodAnnual: string;
  description: string;
  saving?: string;
  includesLabel?: string;
  features: PricingFeature[];
  cta: string;
  highlighted?: boolean;
  nameTone?: 'muted' | 'accent';
};

export const PORTFOLIO_UPGRADE_PATH = '/upgrade';

const PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'FREE',
    priceMonthly: '€0',
    priceAnnualMonthly: '€0',
    periodMonthly: '/ month',
    periodAnnual: '/ month',
    description: 'Test the tool and launch your first portfolio.',
    features: [
      { label: '2 templates of your choice' },
      { label: 'Limit of 3 items per section' },
      { label: 'Color palette customization' },
      { label: 'Brand badge required', tone: 'warn' },
    ],
    cta: 'START FOR FREE',
    nameTone: 'muted',
  },
  {
    id: 'pro',
    name: 'PRO',
    priceMonthly: '€3.99',
    priceAnnualMonthly: '€2.79',
    periodMonthly: '/ month',
    periodAnnual: '/ month',
    description: 'Ideal for independent developers and content creators.',
    saving: 'Save 30% yearly',
    features: [
      { label: 'No insertion limits', tone: 'emphasis' },
      { label: 'Developer Mode enabled' },
      { label: 'Access to all existing templates' },
      { label: 'Create new templates' },
      { label: 'Remove the brand logo' },
    ],
    cta: 'CHOOSE PRO PLAN',
    highlighted: true,
    nameTone: 'accent',
  },
  {
    id: 'entreprise',
    name: 'ENTERPRISE',
    priceMonthly: '€39.99',
    priceAnnualMonthly: '€31.99',
    periodMonthly: '/ month',
    periodAnnual: '/ month',
    description: 'For agencies and teams that need custom hosting.',
    saving: 'Save 20% yearly',
    includesLabel: 'EVERYTHING IN PRO, PLUS:',
    features: [
      { label: 'Custom domain name' },
      { label: 'Managed hosting and DNS setup' },
    ],
    cta: 'CHOOSE ENTERPRISE',
    nameTone: 'muted',
  },
  {
    id: 'premium',
    name: 'PREMIUM',
    priceMonthly: '€99.99',
    priceAnnualMonthly: '€79.99',
    periodMonthly: '/ month',
    periodAnnual: '/ month',
    description: 'Maximum power: ideal for exporting your creations.',
    saving: 'Save 20% yearly',
    includesLabel: 'EVERYTHING IN ENTERPRISE, PLUS:',
    features: [
      { label: 'Source code export' },
      { label: 'Code generation for your selected technology' },
    ],
    cta: 'CHOOSE PREMIUM',
    nameTone: 'muted',
  },
];

const TRUST_ITEMS = ['Secure payment', 'Cancel anytime', 'Support 24/7'] as const;

function resolvePlanPricing(plan: PricingPlan, cycle: BillingCycle) {
  const annual = cycle === 'annual';
  return {
    price: annual ? plan.priceAnnualMonthly : plan.priceMonthly,
    period: annual ? plan.periodAnnual : plan.periodMonthly,
    saving: annual ? plan.saving : undefined,
  };
}

function BillingCycleToggle({
  value,
  onChange,
}: {
  value: BillingCycle;
  onChange: (cycle: BillingCycle) => void;
}) {
  return (
    <div
      className="inline-flex items-center rounded-xl border border-neutral-200 bg-neutral-100 p-1 dark:border-neutral-700 dark:bg-neutral-900"
      role="group"
      aria-label="Billing period"
    >
      {([
        { id: 'monthly', label: 'Monthly' },
        { id: 'annual', label: 'Annual' },
      ] as const).map((option) => {
        const active = value === option.id;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            aria-pressed={active}
            className={`relative min-h-9 rounded-lg px-5 text-sm font-semibold transition-all duration-300 ${
              active
                ? 'bg-black text-white dark:bg-white dark:text-black'
                : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className={className}>
      <path
        d="M3.2 8.2 6.4 11.4 12.8 4.6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function WarnIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className={className}>
      <path
        d="M8 2.4 14.2 13.2H1.8L8 2.4Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M8 6.2v3.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="8" cy="11.4" r="0.7" fill="currentColor" />
    </svg>
  );
}

function DiamondIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 12" fill="currentColor" aria-hidden className={className}>
      <path d="M6 0.6 11.4 6 6 11.4 0.6 6 6 0.6Z" />
    </svg>
  );
}

function FeatureIcon({
  tone,
  accent,
}: {
  tone?: PricingFeature['tone'];
  accent?: boolean;
}) {
  if (tone === 'warn') {
    return <WarnIcon className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400 dark:text-zinc-500" />;
  }
  return (
    <CheckIcon
      className={`mt-0.5 h-4 w-4 shrink-0 ${
        accent ? 'text-[#F97316]' : 'text-zinc-400 dark:text-zinc-500'
      }`}
    />
  );
}

/**
 * Full-page Upgrade / Pricing — aligned with landing brand (orange / lp-*).
 * Theme follows the global landing ThemeProvider (html.dark).
 */
export function PricingUpgradePage({ backHref = '/dashboard/creator' }: { backHref?: string }) {
  const router = useRouter();
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
      return;
    }
    router.push(backHref);
  };

  return (
    <main className="min-h-screen transition-colors duration-300">
      <section
        className="relative isolate min-h-screen overflow-hidden"
        aria-labelledby="portfolio-pricing-heading"
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[28rem]"
          style={{
            backgroundImage: [
              'radial-gradient(ellipse 90% 60% at 50% -10%, rgba(249,115,22,0.08), transparent 55%)',
              'radial-gradient(ellipse 50% 40% at 80% 10%, rgba(113,113,122,0.05), transparent 50%)',
            ].join(', '),
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-x-0 top-56 h-40 bg-gradient-to-b from-transparent to-[var(--lp-bg)]"
          aria-hidden
        />

        <div className="relative mx-auto w-full max-w-[1400px] px-4 pb-16 pt-6 sm:px-6 sm:pb-20 sm:pt-8 lg:px-8">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex min-h-10 items-center gap-2 rounded-full border border-black/10 bg-transparent px-4 text-sm font-medium lp-text transition hover:border-black/20 hover:bg-black/[0.03] dark:border-white/10 dark:hover:border-white/20 dark:hover:bg-white/[0.04]"
            >
              <span aria-hidden>←</span>
              Back
            </button>
          </div>

          <div className="mx-auto max-w-3xl text-center">
            <h1
              id="portfolio-pricing-heading"
              className="text-3xl font-bold tracking-tight lp-text sm:text-5xl"
            >
              Plans tailored to your ambitions
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-zinc-500 dark:text-zinc-400 sm:text-base">
              Boost your portfolio or get the source code for your interfaces in one click.
            </p>
          </div>

          <div className="mt-10 flex justify-center">
            <BillingCycleToggle value={billingCycle} onChange={setBillingCycle} />
          </div>

          <div className="mx-auto mt-10 grid w-full max-w-[1400px] gap-8 sm:grid-cols-2 xl:grid-cols-4">
            {PLANS.map((plan) => {
              const highlighted = plan.highlighted;
              const { price, period, saving } = resolvePlanPricing(plan, billingCycle);
              return (
                <article
                  key={plan.id}
                  className={`relative flex flex-col rounded-2xl border p-5 transition duration-300 sm:p-6 ${
                    highlighted
                      ? 'border-[#F97316] lp-bg-card shadow-[0_24px_48px_-24px_rgba(249,115,22,0.35)]'
                      : 'border-[var(--lp-border)] lp-bg-card hover:border-[#F97316]/35'
                  }`}
                >
                  {highlighted ? (
                    <span
                      className={`absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-[10px] font-bold tracking-wide text-white ${brandSolidBg}`}
                    >
                      MOST POPULAR
                    </span>
                  ) : null}

                  <p
                    className={`text-xs font-semibold tracking-[0.16em] ${
                      plan.nameTone === 'accent' ? 'text-[#F97316]' : 'lp-muted'
                    }`}
                  >
                    {plan.name}
                  </p>

                  <div className="mt-3 flex items-baseline gap-1.5">
                    <span className="text-3xl font-bold tracking-tight lp-text transition-all duration-300 sm:text-[2rem]">
                      {price}
                    </span>
                    <span className="text-sm lp-muted">{period}</span>
                  </div>

                  {saving ? (
                    <span className="mt-2.5 inline-flex w-fit rounded-full lp-bg-surface px-2.5 py-1 text-[11px] font-semibold lp-muted">
                      {saving}
                    </span>
                  ) : (
                    <span className="mt-2.5 inline-flex h-[26px]" aria-hidden />
                  )}

                  <p className="mt-4 text-sm leading-relaxed lp-muted">{plan.description}</p>

                  {plan.includesLabel ? (
                    <p className="mt-5 text-[11px] font-semibold tracking-[0.08em] text-[#F97316]">
                      {plan.includesLabel}
                    </p>
                  ) : (
                    <div className="mt-5" aria-hidden />
                  )}

                  <ul className="mt-3 flex flex-1 flex-col gap-2.5">
                    {plan.features.map((feature) => (
                      <li key={feature.label} className="flex items-start gap-2.5 text-sm">
                        <FeatureIcon tone={feature.tone} accent={highlighted} />
                        <span
                          className={
                            feature.tone === 'emphasis'
                              ? 'font-semibold lp-text'
                              : feature.tone === 'warn'
                                ? 'lp-muted'
                                : 'text-neutral-700 dark:text-neutral-300'
                          }
                        >
                          {feature.label}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <button
                    type="button"
                    onClick={() => setSelectedPlanId(plan.id)}
                    className={`mt-6 min-h-11 w-full rounded-xl px-4 text-xs font-bold tracking-wide ${
                      highlighted
                        ? brandCtaClass
                        : 'border border-black/10 bg-transparent lp-text transition hover:border-black/20 hover:bg-black/[0.03] dark:border-white/10 dark:hover:border-white/20 dark:hover:bg-white/[0.04]'
                    } ${
                      selectedPlanId === plan.id
                        ? 'ring-2 ring-[#FF6B00]/40 ring-offset-2 ring-offset-[var(--lp-bg)]'
                        : ''
                    }`}
                  >
                    {plan.cta}
                  </button>
                </article>
              );
            })}
          </div>

          <div className="mx-auto mt-10 w-full max-w-[1400px]">
            <div
              className="relative flex flex-col items-stretch gap-6 overflow-hidden rounded-[1.25rem] border border-[var(--lp-border)] lp-bg-card px-7 py-7 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between sm:gap-10 sm:px-10 sm:py-8"
              style={{
                boxShadow:
                  '0 0 0 1px rgba(255,107,53,0.1), 0 0 16px rgba(255,107,53,0.12), 0 12px 32px -16px rgba(255,107,53,0.18)',
              }}
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-40 dark:opacity-25"
                style={{
                  background:
                    'radial-gradient(ellipse 80% 120% at 0% 50%, rgba(255,107,53,0.07), transparent 55%), radial-gradient(ellipse 60% 100% at 100% 50%, rgba(255,107,53,0.04), transparent 50%)',
                }}
                aria-hidden
              />
              <div className="relative min-w-0 flex-1">
                <h3 className="text-xl font-bold tracking-tight lp-text sm:text-2xl">
                  Custom plan
                </h3>
                <p className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400 sm:text-[15px]">
                  <span>From €200</span>
                  <span className="text-[#FF6B35]" aria-hidden>
                    •
                  </span>
                  <span>Turnaround under one week</span>
                  <span className="text-[#FF6B35]" aria-hidden>
                    •
                  </span>
                  <span>To discuss</span>
                </p>
              </div>
              <a
                href="mailto:leopardjuliocesar8@gmail.com?subject=Custom%20plan"
                className="relative inline-flex min-h-12 shrink-0 items-center justify-center rounded-full bg-[#FF6B00] px-8 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-[#EA580C] sm:min-w-[12.5rem]"
              >
                Discuss the project →
              </a>
            </div>
          </div>

          <div className="mx-auto mt-12 flex w-full max-w-[1400px] flex-col items-center justify-center gap-3 border-t border-black/5 pt-8 text-sm lp-muted dark:border-white/5 sm:flex-row sm:gap-0">
            {TRUST_ITEMS.map((item, index) => (
              <div
                key={item}
                className={`flex items-center gap-2 px-4 ${
                  index > 0 ? 'sm:border-l sm:border-black/5 dark:sm:border-white/5' : ''
                }`}
              >
                <DiamondIcon className="h-2.5 w-2.5 text-[#F97316]" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
