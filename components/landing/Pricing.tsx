'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  brandCtaClass,
  brandFrameRadiusClass,
  brandSolidBg,
  landingPanelSurfaceClass,
  landingSectionShellClass,
} from '@/components/landing/landingBrand';

const plans = [
  {
    name: 'Free',
    priceMonthly: 0,
    priceAnnual: 0,
    badge: null,
    highlighted: false,
    description: 'Test the platform and launch your first portfolio.',
    intro: null,
    features: [
      { label: '2 templates of your choice', included: true },
      { label: 'Up to 3 items per section', included: true },
      { label: 'Custom color palette', included: true },
      { label: 'Brand badge required', included: false },
    ],
    cta: 'Start for free',
  },
  {
    name: 'Pro',
    priceMonthly: 3.99,
    priceAnnual: 3.19,
    badge: 'Popular',
    highlighted: true,
    description: 'Perfect for independent developers and content creators.',
    intro: null,
    features: [
      { label: 'No mandatory limits', included: true },
      { label: 'Developer mode enabled', included: true },
      { label: 'Access to every existing template', included: true },
      { label: 'Create new templates', included: true },
      { label: 'Remove the brand badge', included: true },
    ],
    cta: 'Choose Pro',
  },
  {
    name: 'Enterprise',
    priceMonthly: 39.99,
    priceAnnual: 31.99,
    badge: null,
    highlighted: false,
    description: 'For agencies and teams that need self-hosting.',
    intro: 'Everything in Pro, plus:',
    features: [
      { label: 'Custom domain name', included: true },
      { label: 'Self-hosting and managed DNS setup', included: true },
    ],
    cta: 'Choose Enterprise',
  },
  {
    name: 'Premium',
    priceMonthly: 99.99,
    priceAnnual: 79.99,
    badge: null,
    highlighted: false,
    description: 'Maximum flexibility, built to export your creations.',
    intro: 'Everything in Enterprise, plus:',
    features: [
      { label: 'Source code export', included: true },
      { label: 'Code generation in your selected technology', included: true },
    ],
    cta: 'Choose Premium',
  },
];

export function Pricing() {
  const [annual, setAnnual] = useState(false);

  return (
    <section id="pricing" className="lp-bg py-24 transition-colors duration-300 lg:py-32">
      <div className={landingSectionShellClass}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-10 text-center"
        >
          <h2 className="mb-8 text-3xl font-bold leading-tight lp-text md:text-5xl">
            Pricing
          </h2>

          <div className={`inline-flex items-center border border-neutral-200 bg-white p-1 dark:border-neutral-700 dark:bg-neutral-900 ${brandFrameRadiusClass}`}>
            <button
              type="button"
              onClick={() => setAnnual(false)}
              className={`rounded-lg px-5 py-2 text-sm font-semibold transition-all ${
                !annual
                  ? 'bg-black text-white dark:bg-white dark:text-black'
                  : 'text-neutral-500 dark:text-neutral-400'
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setAnnual(true)}
              className={`rounded-lg px-5 py-2 text-sm font-semibold transition-all ${
                annual
                  ? 'bg-black text-white dark:bg-white dark:text-black'
                  : 'text-neutral-500 dark:text-neutral-400'
              }`}
            >
              Annual
            </button>
          </div>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className={`relative flex min-h-[510px] flex-col border border-neutral-200 p-7 transition-all duration-300 lg:p-8 dark:border-neutral-700 ${landingPanelSurfaceClass} ${brandFrameRadiusClass}`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <span className={`inline-flex px-3 py-1 text-[10px] font-bold uppercase text-white ${brandFrameRadiusClass} ${brandSolidBg}`}>
                    {plan.badge}
                  </span>
                </div>
              )}

              <h3 className={`mb-2.5 text-base font-bold uppercase tracking-[0.18em] ${plan.highlighted ? 'text-[#F97316]' : 'lp-muted'}`}>
                {plan.name}
              </h3>

              <div className="mb-12 flex items-end gap-1 md:mb-14">
                <span className="text-[2rem] font-bold leading-none lp-text sm:text-4xl">
                  €{annual ? plan.priceAnnual.toFixed(plan.priceAnnual === 0 ? 0 : 2) : plan.priceMonthly.toFixed(plan.priceMonthly === 0 ? 0 : 2)}
                </span>
                <span className="mb-1 text-sm lp-muted">/ month</span>
              </div>

              <p className="mb-6 min-h-[52px] text-base leading-relaxed lp-muted">{plan.description}</p>

              {plan.intro && (
                <p className="mb-4 text-sm font-bold uppercase tracking-wide lp-text">{plan.intro}</p>
              )}

              <ul className="mb-8 flex-1 space-y-4">
                {plan.features.map((f) => (
                  <li key={f.label} className="flex items-start gap-2.5 text-base leading-relaxed lp-text">
                    <span className={`mt-0.5 ${f.included ? 'text-[#F97316]' : 'lp-muted'}`}>
                      {f.included ? '✓' : '△'}
                    </span>
                    {f.label}
                  </li>
                ))}
              </ul>

              <Link
                href="/register"
                className={`w-full py-3.5 text-center text-sm font-bold uppercase !rounded-full ${
                  plan.highlighted
                    ? brandCtaClass
                    : 'bg-neutral-200 text-neutral-700 transition-all hover:-translate-y-0.5 hover:bg-neutral-300 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'
                }`}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-12 border-t border-black/5 pt-8 dark:border-white/10"
        >
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
            {['Secure payment', 'Cancel anytime', '24/7 support'].map((item) => (
              <span key={item} className="flex items-center gap-2 text-sm lp-muted">
                <span className="text-[#F97316]">◆</span>
                {item}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
