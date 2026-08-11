'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { landingSectionShellClass } from '@/components/landing/landingBrand';

const testimonials = [
  {
    quote:
      'I turned my studies, projects, and experience into a professional portfolio that finally shows employers what I can do.',
    name: 'Sarah M.',
    niche: 'University student',
    avatar: '/landing/avatars/avatar-4.png',
  },
  {
    quote: 'My clients discover my services and message me directly—no more juggling apps.',
    name: 'Daniel R.',
    niche: 'Freelance designer',
    avatar: '/landing/avatars/avatar-1.png',
  },
  {
    quote:
      'NoProbleme gave our small business a clear online presence where customers can understand our brand, browse what we offer, and contact us instantly—all from one page we actually enjoy sharing.',
    name: 'Emma L.',
    niche: 'Small business owner',
    avatar: '/landing/avatars/avatar-3.png',
  },
  {
    quote: 'I added my products and started receiving orders in the same place.',
    name: 'Maya T.',
    niche: 'Independent seller',
    avatar: '/landing/avatars/avatar-6.png',
  },
  {
    quote:
      'I only entered my information and NoProbleme helped me build a page that presents my work and makes booking my services easy for every new client.',
    name: 'Sofia R.',
    niche: 'Beauty professional',
    avatar: '/landing/avatars/avatar-2.png',
  },
  {
    quote:
      'Everything my customers need is now in one place: my expertise, my offers, and a direct conversation with me—no middleman getting in the way of the relationship.',
    name: 'James K.',
    niche: 'Business consultant',
    avatar: '/landing/avatars/avatar-5.png',
  },
];

export function Testimonials() {
  return (
    <section className="bg-white py-24 transition-colors duration-300 lg:py-32 dark:bg-[#0a0a0a]">
      <div className={landingSectionShellClass}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-14 text-center lg:mb-16"
        >
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900 md:text-5xl dark:text-white">
            One platform, every ambition
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
          {testimonials.map((t, i) => (
            <motion.article
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="flex h-full flex-col rounded-xl border border-neutral-200 bg-neutral-50 p-6 sm:p-7 dark:border-[#262626] dark:bg-[#161616]"
            >
              <p className="flex-1 text-[15px] leading-relaxed text-neutral-600 sm:text-base dark:text-[#d1d1d1]">
                <span aria-hidden="true">&ldquo;</span>
                {t.quote}
                <span aria-hidden="true">&rdquo;</span>
              </p>

              <div className="mt-8 flex items-center gap-3">
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-neutral-200 dark:bg-[#262626]">
                  <Image
                    src={t.avatar}
                    alt={t.name}
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-neutral-900 dark:text-white">{t.name}</div>
                  <div className="text-xs text-neutral-500 sm:text-sm dark:text-[#888888]">{t.niche}</div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
