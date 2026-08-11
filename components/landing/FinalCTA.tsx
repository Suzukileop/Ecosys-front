'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { brandCtaClass, landingSectionShellClass } from '@/components/landing/landingBrand';

export function FinalCTA() {
  return (
    <section className="relative overflow-hidden lp-bg py-20 transition-colors duration-300 sm:py-24">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-[600px] w-[600px] rounded-full bg-gradient-to-br from-[#F97316]/12 via-[#FB923C]/6 to-transparent opacity-60 blur-[120px]" />
      </div>

      <div className={`relative z-10 ${landingSectionShellClass}`}>
        <div className="mx-auto max-w-3xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35, margin: '0px 0px -8% 0px' }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center"
        >
          <h2 className="mb-8 text-4xl font-bold leading-tight tracking-tight lp-text md:text-5xl lg:text-6xl">
            What are you waiting for?
          </h2>

          <Link
            href="/register"
            className={`inline-flex items-center rounded-xl px-8 py-4 text-base font-semibold sm:text-lg ${brandCtaClass}`}
          >
            Get started now →
          </Link>
        </motion.div>
        </div>
      </div>
    </section>
  );
}
