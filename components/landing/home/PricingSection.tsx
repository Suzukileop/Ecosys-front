'use client';

import Link from 'next/link';
import { useState } from 'react';
import { CONTAINER } from '@/components/landing/home/shared';
import { useT } from '@/lib/i18n/I18nProvider';
import { msg } from '@/lib/i18n/config';

type Plan = {
  name: string;
  description: string;
  monthly: number;
  annual: number;
  intro: string;
  features: string[];
  cta: string;
  featured?: boolean;
};

const PLANS: Plan[] = [
  {
    name: msg('Free'),
    description: msg('For trying things out'),
    monthly: 0,
    annual: 0,
    intro: msg('Includes:'),
    features: [msg('2 templates of your choice'), msg('Up to 3 items per section'), msg('Custom color palette'), msg('Skraft badge shown')],
    cta: msg('Start for free'),
  },
  {
    name: 'Pro',
    description: msg('For independent creators and developers'),
    monthly: 3.99,
    annual: 3.19,
    intro: msg('Everything in Free, plus:'),
    features: [
      msg('No mandatory limits'),
      msg('Developer mode'),
      msg('Every existing template'),
      msg('Create new templates'),
      msg('Remove the brand badge'),
    ],
    cta: msg('Get Pro'),
    featured: true,
  },
  {
    name: 'Enterprise',
    description: msg('For agencies and teams that self-host'),
    monthly: 39.99,
    annual: 31.99,
    intro: msg('Everything in Pro, plus:'),
    features: [msg('Custom domain name'), msg('Self-hosting and managed DNS')],
    cta: msg('Get Enterprise'),
  },
  {
    name: 'Premium',
    description: msg('For full ownership of your work'),
    monthly: 99.99,
    annual: 79.99,
    intro: msg('Everything in Enterprise, plus:'),
    features: [msg('Source code export'), msg('Code generation in your stack')],
    cta: msg('Get Premium'),
  },
];

function BillingToggle({ annual, onChange }: { annual: boolean; onChange: (annual: boolean) => void }) {
  const t = useT();
  return (
    <div role="radiogroup" aria-label={t('Billing period')} className="inline-flex rounded-full bg-[#EDEDED] p-1">
      {[
        { value: false, label: t('Monthly') },
        { value: true, label: t('Annual') },
      ].map((option) => {
        const active = option.value === annual;
        return (
          <button
            key={option.label}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={`inline-flex h-10 items-center gap-2 rounded-full px-5 text-[15px] font-medium transition-colors ${
              active
                ? 'bg-white text-[#111111] shadow-[0_1px_2px_rgba(0,0,0,0.06)]'
                : 'text-neutral-500 hover:text-[#111111]'
            }`}
          >
            {t(option.label)}
            {option.value ? <span className="text-[#FF5722]">−20%</span> : null}
          </button>
        );
      })}
    </div>
  );
}

export function PricingSection() {
  const t = useT();
  const [annual, setAnnual] = useState(false);

  return (
    <section id="pricing" className="scroll-mt-20 bg-white py-20 text-[#111111] sm:py-28 lg:py-36">
      <div className={CONTAINER}>
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-end sm:justify-between sm:gap-10">
          <h2 className="max-w-[15ch] text-[clamp(2rem,3.2vw,2.875rem)] font-medium leading-[1.1] tracking-[-0.03em]">
            {t('Simple pricing that grows with you')}
            <span className="text-neutral-300">.</span>
          </h2>
          <BillingToggle annual={annual} onChange={setAnnual} />
        </div>

        <div className="mt-12 grid gap-4 sm:mt-16 md:grid-cols-2 xl:grid-cols-4">
          {PLANS.map((plan) => {
            const price = annual ? plan.annual : plan.monthly;
            return (
              <div key={plan.name} className="flex flex-col md:min-h-[540px] rounded-2xl bg-[#F4F4F4] p-7 sm:p-8">
                <h3 className="text-[24px] font-medium tracking-[-0.02em]">{t(plan.name)}</h3>
                <p className="mt-1.5 text-[16px] text-neutral-500">{t(plan.description)}</p>

                <p className="mt-8 flex items-baseline gap-1.5">
                  <span className="text-[44px] font-medium leading-none tracking-[-0.035em] tabular-nums">
                    {t.number(price, { style: 'currency', currency: 'EUR', minimumFractionDigits: price % 1 ? 2 : 0 })}
                  </span>
                  <span className="text-[15px] text-neutral-500">{t('/mo.')}</span>
                </p>

                <p className="mt-10 text-[15px] text-neutral-500">{t(plan.intro)}</p>
                <ul className="mt-4 flex-1 space-y-3.5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-[16px] leading-snug">
                      <svg
                        className="mt-[3px] h-4 w-4 shrink-0"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.5}
                        aria-hidden
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12.5l4.5 4.5L19 7.5" />
                      </svg>
                      {t(feature)}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/register"
                  className={`mt-12 inline-flex h-12 w-fit items-center rounded-full px-6 text-[15px] font-medium transition-colors ${
                    plan.featured
                      ? 'bg-[#111111] text-white hover:bg-black'
                      : 'bg-white text-[#111111] hover:bg-neutral-50'
                  }`}
                >
                  {t(plan.cta)}
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
