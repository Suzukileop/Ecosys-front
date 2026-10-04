import Link from 'next/link';
import { CONTAINER } from '@/components/landing/home/shared';

const OPTIONS = [
  {
    name: 'Enterprise',
    text: 'Turn your portfolio, storefront or business page into a standalone website on your own domain. We host it, manage the DNS and keep it fast — your brand, your address.',
    cta: 'Go Enterprise',
  },
  {
    name: 'Premium',
    text: 'Everything in Enterprise, plus the keys. Export the full source code or generate it in your own stack, and run your site anywhere you like.',
    cta: 'Go Premium',
  },
] as const;

/** Dark pitch for the plans that turn a Skraft page into a standalone website. */
export function PlansOverview() {
  return (
    <section className="bg-[#111111] py-20 text-white sm:py-28 lg:py-36">
      <div className={`${CONTAINER} lg:grid lg:grid-cols-[5fr_7fr] lg:gap-20`}>
        <h2 className="max-w-[16ch] text-[clamp(2.25rem,4.5vw,3.75rem)] font-semibold leading-[1.04] tracking-[-0.045em]">
          Your page, as a website with your own domain
        </h2>

        <div className="mt-14 grid max-w-5xl gap-x-16 gap-y-12 sm:mt-20 md:grid-cols-2 lg:mt-0 lg:block lg:border-b lg:border-white/10">
          {OPTIONS.map((option, i) => (
            <div
              key={option.name}
              className="flex flex-col lg:grid lg:grid-cols-[1fr_auto] lg:items-end lg:gap-x-12 lg:border-t lg:border-white/10 lg:py-10"
            >
              <div>
                <h3 className="text-[22px] font-semibold tracking-[-0.02em] lg:text-[28px]">{option.name}</h3>
                <p className="mt-2 max-w-[44ch] text-[15px] leading-relaxed text-white/50 sm:text-[16px] lg:mt-3 lg:max-w-[52ch] lg:text-[17px]">
                  {option.text}
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
                {option.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
