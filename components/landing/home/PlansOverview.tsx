import Link from 'next/link';
import { CONTAINER } from '@/components/landing/home/shared';
import { msg } from '@/lib/i18n/config';
import { getT } from '@/lib/i18n/server';

const OPTIONS = [
  {
    name: 'Enterprise',
    text: msg('Turn your portfolio, storefront or business page into a standalone website on your own domain. We host it, manage the DNS and keep it fast — your brand, your address.'),
    cta: msg('Go Enterprise'),
  },
  {
    name: 'Premium',
    text: msg('Everything in Enterprise, plus the keys. Export the full source code or generate it in your own stack, and run your site anywhere you like.'),
    cta: msg('Go Premium'),
  },
] as const;

/** Dark pitch for the plans that turn a Skraft page into a standalone website. */
export async function PlansOverview() {
  const t = await getT();
  return (
    <section className="bg-[#111111] py-20 text-white sm:py-28 lg:py-36">
      <div className={`${CONTAINER} lg:grid lg:grid-cols-[5fr_7fr] lg:gap-20`}>
        <h2 className="max-w-[16ch] text-[clamp(1.75rem,2.6vw,2.25rem)] font-medium leading-[1.15] tracking-[-0.025em]">
          {t('Your page, as a website with your own domain')}
        </h2>

        <div className="mt-14 grid max-w-5xl gap-x-16 gap-y-12 sm:mt-20 md:grid-cols-2 lg:mt-0 lg:block lg:border-b lg:border-white/10">
          {OPTIONS.map((option, i) => (
            <div
              key={option.name}
              className="flex flex-col lg:grid lg:grid-cols-[1fr_auto] lg:items-end lg:gap-x-12 lg:border-t lg:border-white/10 lg:py-10"
            >
              <div>
                <h3 className="text-[20px] font-medium tracking-[-0.015em] lg:text-[22px]">{option.name}</h3>
                <p className="mt-2 max-w-[44ch] text-[15px] leading-relaxed text-white/50 sm:text-[16px] lg:mt-3 lg:max-w-[52ch] lg:text-[17px]">
                  {t(option.text)}
                </p>
              </div>
              <Link
                href="/register"
                className={`mt-7 inline-flex h-11 w-fit items-center rounded-lg px-5 text-[14px] font-medium transition-colors lg:mt-0 ${
                  i === 0
                    ? 'bg-white text-[#111111] hover:bg-neutral-200'
                    : 'text-white ring-1 ring-inset ring-white/20 hover:bg-white/[0.06]'
                }`}
              >
                {t(option.cta)}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
