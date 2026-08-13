'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { brandFrameRadiusClass, landingSectionShellClass } from '@/components/landing/landingBrand';

const faqs = [
  {
    q: 'What is NoProbleme?',
    a: 'NoProbleme is a platform where anyone can create a portfolio, present services, or launch a simple online shop. Students, freelancers, businesses, and sellers can showcase their work and connect with clients in one place.',
  },
  {
    q: 'Who is it for?',
    a: 'Anyone who wants to sell something, offer a service, or present their work online—students, independent professionals, small businesses, brands, and sellers looking for a clear digital presence.',
  },
  {
    q: 'How do I create my portfolio or shop?',
    a: 'Sign up, enter your information, choose a template, and customize your page. In a few clicks you can publish a portfolio, service page, or product showcase ready to share with clients.',
  },
  {
    q: 'Can I chat with clients directly?',
    a: 'Yes. Built-in messaging lets you talk with customers and clients inside NoProbleme—no WhatsApp, email chains, or other apps required. Everything stays in one place, with no middleman.',
  },
  {
    q: 'Is there a free plan?',
    a: 'Yes. You can start for free, test the platform, and launch your first portfolio. Upgrade later when you need more templates, features, or branding options.',
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="lp-bg py-24 transition-colors duration-300 lg:py-32">
      <div className={landingSectionShellClass}>
        <div className="mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <h2 className="mb-4 text-3xl font-bold lp-text md:text-5xl">Frequently asked questions</h2>
          <p className="lp-muted">Everything you need to know before getting started.</p>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              className={`overflow-hidden border border-neutral-200 transition-colors hover:border-[#F97316]/25 dark:border-neutral-700 ${brandFrameRadiusClass}`}
            >
              <button
                type="button"
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between bg-white p-5 text-left transition-colors hover:bg-neutral-50 dark:bg-neutral-900 dark:hover:bg-neutral-800/80"
              >
                <span className="pr-4 font-medium lp-text">{faq.q}</span>
                <motion.span
                  animate={{ rotate: open === i ? 45 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="shrink-0 text-xl text-[#F97316]"
                >
                  +
                </motion.span>
              </button>

              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-neutral-100 bg-neutral-50 px-5 pb-5 pt-2 text-sm leading-relaxed lp-muted dark:border-neutral-800 dark:bg-neutral-900/80">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
        </div>
      </div>
    </section>
  );
}
