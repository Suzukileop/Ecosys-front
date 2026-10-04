'use client';

import { useId, useState } from 'react';
import { CONTAINER } from '@/components/landing/home/shared';

const FAQS = [
  {
    q: 'What is Skraft?',
    a: 'Skraft is a platform where anyone can create a portfolio, present services, or launch a simple online shop. Students, freelancers, businesses and sellers can showcase their work and connect with clients in one place.',
  },
  {
    q: 'Who is it for?',
    a: 'Anyone who wants to sell something, offer a service, or present their work online — students, independent professionals, small businesses, brands and sellers looking for a clear digital presence.',
  },
  {
    q: 'How do I create my portfolio or shop?',
    a: 'Sign up, enter your information, choose a template and customize your page. In a few clicks you can publish a portfolio, service page or product showcase ready to share with clients.',
  },
  {
    q: 'Can I chat with clients directly?',
    a: 'Yes. Built-in messaging lets you talk with customers and clients inside Skraft — no WhatsApp, email chains or other apps required. Everything stays in one place, with no middleman.',
  },
  {
    q: 'Is there a free plan?',
    a: 'Yes. You can start for free, test the platform and launch your first portfolio. Upgrade later when you need more templates, features or branding options.',
  },
] as const;

function FaqItem({ q, a, open, onToggle }: { q: string; a: string; open: boolean; onToggle: () => void }) {
  const id = useId();
  return (
    <li className="border-b border-black/[0.08]">
      <h3>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={id}
          className="flex w-full items-center justify-between gap-6 py-6 text-left sm:py-7"
        >
          <span
            className={`text-[19px] font-medium tracking-[-0.02em] text-[#111111] transition-opacity sm:text-[22px] ${
              open ? '' : 'hover:opacity-70'
            }`}
          >
            {q}
          </span>
          <span
            aria-hidden
            className={`relative inline-flex h-5 w-5 shrink-0 items-center justify-center text-[#111111] transition-transform duration-300 ${
              open ? 'rotate-45' : ''
            }`}
          >
            <span className="absolute h-[1.5px] w-4 bg-current" />
            <span className="absolute h-4 w-[1.5px] bg-current" />
          </span>
        </button>
      </h3>
      {open ? (
        <div id={id}>
          <p className="max-w-xl pb-7 text-[16px] leading-relaxed text-neutral-500 sm:text-[17px]">{a}</p>
        </div>
      ) : null}
    </li>
  );
}

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="scroll-mt-20 bg-white py-20 text-[#111111] sm:py-28 lg:py-36">
      <div className={`${CONTAINER} grid gap-10 sm:gap-16 md:grid-cols-2 md:gap-12 lg:gap-20`}>
        <div>
          <h2 className="text-[clamp(2.25rem,4.5vw,3.75rem)] font-semibold leading-[0.95] tracking-[-0.05em]">
            Questions?
          </h2>
          <p className="mt-6 max-w-sm text-[17px] leading-relaxed text-neutral-500 sm:mt-8">
            Can&apos;t find your answer?{' '}
            <a
              href="mailto:leopardjuliocesar8@gmail.com"
              className="font-medium text-[#111111] underline decoration-black/20 underline-offset-4 transition-colors hover:decoration-[#111111]"
            >
              Write to us
            </a>
            .
          </p>
        </div>

        <ul className="border-t border-black/[0.08]">
          {FAQS.map((faq, i) => (
            <FaqItem
              key={faq.q}
              q={faq.q}
              a={faq.a}
              open={open === i}
              onToggle={() => setOpen(open === i ? null : i)}
            />
          ))}
        </ul>
      </div>
    </section>
  );
}
