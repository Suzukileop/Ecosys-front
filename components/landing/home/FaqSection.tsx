'use client';

import { useId, useState } from 'react';
import { CONTAINER } from '@/components/landing/home/shared';
import { useT } from '@/lib/i18n/I18nProvider';
import { msg } from '@/lib/i18n/config';

const FAQS = [
  {
    q: msg('What is Skraft?'),
    a: msg('Skraft is a platform where anyone can create a portfolio, present services, or launch a simple online shop. Students, freelancers, businesses and sellers can showcase their work and connect with clients in one place.'),
  },
  {
    q: msg('Who is it for?'),
    a: msg('Anyone who wants to sell something, offer a service, or present their work online — students, independent professionals, small businesses, brands and sellers looking for a clear digital presence.'),
  },
  {
    q: msg('How do I create my portfolio or shop?'),
    a: msg('Sign up, enter your information, choose a template and customize your page. In a few clicks you can publish a portfolio, service page or product showcase ready to share with clients.'),
  },
  {
    q: msg('Can I chat with clients directly?'),
    a: msg('Yes. Built-in messaging lets you talk with customers and clients inside Skraft — no WhatsApp, email chains or other apps required. Everything stays in one place, with no middleman.'),
  },
  {
    q: msg('Is there a free plan?'),
    a: msg('Yes. You can start for free, test the platform and launch your first portfolio. Upgrade later when you need more templates, features or branding options.'),
  },
  {
    q: msg('Can I change my design later?'),
    a: msg('Yes. Switch designs and section layouts whenever you like — your projects, products and texts stay in place.'),
  },
  {
    q: msg('Can I use my own domain name?'),
    a: msg('Yes, on the Enterprise plan. Your page then lives at your own address, with managed DNS.'),
  },
  {
    q: msg('Which languages are available?'),
    a: msg('Skraft is available in 7 languages: English, French, Spanish, Portuguese, Arabic (right to left), Russian and Chinese.'),
  },
  {
    q: msg('Does my page work on phones?'),
    a: msg('Yes. Every design adapts to phones, tablets and large screens — no extra work on your side.'),
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
          className="flex w-full items-center justify-between gap-6 py-6 text-start sm:py-7"
        >
          <span
            className={`text-[18px] font-medium tracking-[-0.015em] text-[#111111] transition-opacity sm:text-[20px] ${
              open ? '' : 'hover:opacity-70'
            }`}
          >
            {q}
          </span>
          <span
            aria-hidden
            className={`relative inline-flex h-5 w-5 shrink-0 items-center justify-center text-[#FF5722] transition-transform duration-300 ${
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
  const t = useT();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="scroll-mt-20 bg-white py-20 text-[#111111] sm:py-28 lg:py-36">
      <div className={`${CONTAINER} grid gap-10 sm:gap-16 md:grid-cols-2 md:gap-12 lg:gap-20`}>
        <div className="md:sticky md:top-24 md:self-start">
          <h2 className="text-[clamp(2rem,3.2vw,2.875rem)] font-medium leading-[1.1] tracking-[-0.03em]">
            {t('Questions?')}
          </h2>
          <p className="mt-6 max-w-sm text-[17px] leading-relaxed text-neutral-500 sm:mt-8">
            {t.rich('Can’t find your answer? {link}.', {
              link: (
                <a
                  href="mailto:leopardjuliocesar8@gmail.com"
                  className="font-medium text-[#111111] underline decoration-black/20 underline-offset-4 transition-colors hover:decoration-[#111111]"
                >
                  {t('Write to us')}
                </a>
              ),
            })}
          </p>
        </div>

        <ul className="border-t border-black/[0.08]">
          {FAQS.map((faq, i) => (
            <FaqItem
              key={faq.q}
              q={t(faq.q)}
              a={t(faq.a)}
              open={open === i}
              onToggle={() => setOpen(open === i ? null : i)}
            />
          ))}
        </ul>
      </div>
    </section>
  );
}
