'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useT } from '@/lib/i18n/I18nProvider';
import { msg } from '@/lib/i18n/config';

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
    name: 'Free',
    priceMonthly: '€0',
    priceAnnualMonthly: '€0',
    periodMonthly: '/ month',
    periodAnnual: '/ month',
    description: msg('Test the tool and launch your first portfolio.'),
    features: [
      { label: msg('2 templates of your choice') },
      { label: msg('Limit of 3 items per section') },
      { label: msg('Color palette customization') },
      { label: msg('Brand badge required'), tone: 'warn' },
    ],
    cta: 'Start for free',
    nameTone: 'muted',
  },
  {
    id: 'pro',
    name: 'Pro',
    priceMonthly: '€3.99',
    priceAnnualMonthly: '€2.79',
    periodMonthly: '/ month',
    periodAnnual: '/ month',
    description: msg('Ideal for independent developers and content creators.'),
    saving: 'Save 30% yearly',
    features: [
      { label: msg('No insertion limits'), tone: 'emphasis' },
      { label: msg('Developer Mode enabled') },
      { label: msg('Access to all existing templates') },
      { label: msg('Create new templates') },
      { label: msg('Remove the brand logo') },
    ],
    cta: 'Choose Pro',
    highlighted: true,
    nameTone: 'accent',
  },
  {
    id: 'entreprise',
    name: 'Enterprise',
    priceMonthly: '€39.99',
    priceAnnualMonthly: '€31.99',
    periodMonthly: '/ month',
    periodAnnual: '/ month',
    description: msg('For agencies and teams that need custom hosting.'),
    saving: 'Save 20% yearly',
    includesLabel: 'Everything in Pro, plus:',
    features: [
      { label: msg('Custom domain name') },
      { label: msg('Managed hosting and DNS setup') },
    ],
    cta: 'Choose Enterprise',
    nameTone: 'muted',
  },
  {
    id: 'premium',
    name: 'Premium',
    priceMonthly: '€99.99',
    priceAnnualMonthly: '€79.99',
    periodMonthly: '/ month',
    periodAnnual: '/ month',
    description: msg('Maximum power: ideal for exporting your creations.'),
    saving: 'Save 20% yearly',
    includesLabel: 'Everything in Enterprise, plus:',
    features: [
      { label: msg('Source code export') },
      { label: msg('Code generation for your selected technology') },
    ],
    cta: 'Choose Premium',
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
  const t = useT();
  return (
    <div
      className="inline-flex items-center rounded-full bg-[#EFF3F4] p-1 dark:bg-[#202327]"
      role="group"
      aria-label={t('Billing period')}
    >
      {([
        { id: 'monthly', label: t('Monthly') },
        { id: 'annual', label: t('Annual') },
      ] as const).map((option) => {
        const active = value === option.id;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            aria-pressed={active}
            className={`relative min-h-10 rounded-full px-5 text-[15px] font-bold transition-colors duration-200 ${
              active
                ? 'bg-[#0F1419] text-white dark:bg-[#EFF3F4] dark:text-[#0F1419]'
                : 'text-[#536471] hover:text-[#0F1419] dark:text-[#71767B] dark:hover:text-[#E7E9EA]'
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

function FeatureIcon({
  tone,
  accent,
}: {
  tone?: PricingFeature['tone'];
  accent?: boolean;
}) {
  if (tone === 'warn') {
    return <WarnIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#8B98A5] dark:text-[#536471]" />;
  }
  return (
    <CheckIcon
      className={`mt-0.5 h-4 w-4 shrink-0 ${
        accent ? 'text-[#0F1419] dark:text-[#E7E9EA]' : 'text-[#536471] dark:text-[#71767B]'
      }`}
    />
  );
}

const PRIMARY_BUTTON =
  'bg-[#0F1419] text-white hover:bg-[#272C30] dark:bg-[#EFF3F4] dark:text-[#0F1419] dark:hover:bg-[#D7DBDC]';
const SECONDARY_BUTTON =
  'border border-[#CFD9DE] text-[#0F1419] hover:bg-[rgba(15,20,25,0.06)] dark:border-[#536471] dark:text-[#E7E9EA] dark:hover:bg-[rgba(231,233,234,0.1)]';

/**
 * Full-page Upgrade / Pricing — X palette (black & white): flat #F7F9F9 / #16181C plan blocks on a
 * white / black ground, square blocks and CTAs, one filled CTA (the recommended plan).
 */
export function PricingUpgradePage({ backHref = '/profile' }: { backHref?: string }) {
  const t = useT();
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
    <main className="min-h-screen bg-white text-[#0F1419] dark:bg-black dark:text-[#E7E9EA]">
      <section className="relative min-h-screen" aria-labelledby="portfolio-pricing-heading">
        <div className="mx-auto w-full max-w-[1280px] px-4 pb-16 pt-4 sm:px-6 sm:pb-20 sm:pt-6 lg:px-8">
          <div className="mb-8 flex items-center">
            <button
              type="button"
              onClick={handleBack}
              className="-ml-2 inline-flex h-10 items-center gap-2 rounded-full px-3 text-[15px] font-bold transition-colors hover:bg-[rgba(15,20,25,0.06)] dark:hover:bg-[rgba(231,233,234,0.1)]"
            >
              <span aria-hidden>←</span>
              {t('Back')}
            </button>
          </div>

          <div className="mx-auto max-w-3xl text-center">
            <h1
              id="portfolio-pricing-heading"
              className="text-[28px] font-extrabold leading-tight tracking-tight sm:text-[44px]"
            >
              {t('Plans tailored to your ambitions')}
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-[15px] leading-5 text-[#536471] dark:text-[#71767B]">
              {t('Boost your portfolio or get the source code for your interfaces in one click.')}
            </p>
          </div>

          <div className="mt-8 flex justify-center">
            <BillingCycleToggle value={billingCycle} onChange={setBillingCycle} />
          </div>

          <div className="-mx-4 mt-8 grid gap-2 sm:mx-0 sm:mt-10 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4">
            {PLANS.map((plan) => {
              const highlighted = plan.highlighted;
              const { price, period, saving } = resolvePlanPricing(plan, billingCycle);
              return (
                <article
                  key={plan.id}
                  className="relative flex flex-col bg-[#F7F9F9] p-5 sm:p-6 dark:bg-[#16181C]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[15px] font-bold">{plan.name}</p>
                    {highlighted ? (
                      <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#536471] dark:text-[#71767B]">
                        {t('Most popular')}
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-3 flex items-baseline gap-1.5">
                    <span className="text-[32px] font-extrabold leading-none tracking-tight">{price}</span>
                    <span className="text-[13px] text-[#536471] dark:text-[#71767B]">{period}</span>
                  </div>

                  {saving ? (
                    <span className="mt-3 inline-flex w-fit rounded-full bg-[rgba(15,20,25,0.06)] px-2.5 py-0.5 text-[13px] font-medium text-[#536471] dark:bg-[rgba(231,233,234,0.1)] dark:text-[#71767B]">
                      {saving}
                    </span>
                  ) : (
                    <span className="mt-3 inline-flex h-[22px]" aria-hidden />
                  )}

                  <p className="mt-4 text-[15px] leading-5 text-[#536471] dark:text-[#71767B]">{plan.description}</p>

                  {plan.includesLabel ? (
                    <p className="mt-5 text-[13px] font-bold">{plan.includesLabel}</p>
                  ) : (
                    <div className="mt-5" aria-hidden />
                  )}

                  <ul className="mt-3 flex flex-1 flex-col gap-2.5">
                    {plan.features.map((feature) => (
                      <li key={feature.label} className="flex items-start gap-2.5 text-[15px] leading-5">
                        <FeatureIcon tone={feature.tone} accent={highlighted} />
                        <span
                          className={
                            feature.tone === 'emphasis'
                              ? 'font-bold'
                              : feature.tone === 'warn'
                                ? 'text-[#536471] dark:text-[#71767B]'
                                : ''
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
                    aria-pressed={selectedPlanId === plan.id}
                    className={`mt-6 min-h-11 w-full px-4 text-[15px] font-bold transition-colors ${
                      highlighted ? PRIMARY_BUTTON : SECONDARY_BUTTON
                    } ${
                      selectedPlanId === plan.id
                        ? 'ring-2 ring-[#0F1419] ring-offset-2 ring-offset-[#F7F9F9] dark:ring-[#E7E9EA] dark:ring-offset-[#16181C]'
                        : ''
                    }`}
                  >
                    {plan.cta}
                  </button>
                </article>
              );
            })}
          </div>

          <div className="-mx-4 mt-2 flex flex-col items-stretch gap-5 bg-[#F7F9F9] px-5 py-6 sm:mx-0 sm:mt-6 sm:flex-row sm:items-center sm:justify-between sm:gap-10 sm:px-8 sm:py-7 dark:bg-[#16181C]">
            <div className="min-w-0 flex-1">
              <h2 className="text-[20px] font-extrabold leading-6">{t('Custom plan')}</h2>
              <p className="mt-1.5 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[15px] leading-5 text-[#536471] dark:text-[#71767B]">
                <span>{t('From €200')}</span>
                <span aria-hidden>·</span>
                <span>{t('Turnaround under one week')}</span>
                <span aria-hidden>·</span>
                <span>{t('To discuss')}</span>
              </p>
            </div>
            <a
              href="mailto:leopardjuliocesar8@gmail.com?subject=Custom%20plan"
              className={`inline-flex min-h-11 shrink-0 items-center justify-center px-6 text-[15px] font-bold transition-colors sm:min-w-[12.5rem] ${SECONDARY_BUTTON}`}
            >
              {t('Discuss the project')}
            </a>
          </div>

          <ul className="mt-10 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[13px] text-[#536471] dark:text-[#71767B]">
            {TRUST_ITEMS.map((item, index) => (
              <li key={item} className="flex items-center gap-2">
                {index > 0 ? <span aria-hidden>·</span> : null}
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
