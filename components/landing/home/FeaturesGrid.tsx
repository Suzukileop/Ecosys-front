import type { ReactNode } from 'react';
import { CONTAINER } from '@/components/landing/home/shared';
import { msg } from '@/lib/i18n/config';
import { getT } from '@/lib/i18n/server';

/* 24-unit glyphs, 1.75 stroke — the same line weight as the rest of the site's icons. */
const ICONS: Record<string, ReactNode> = {
  languages: <path d="M4 5h10M9 3v2m-3.5 0c.6 3.4 2.8 6.4 6 8M12.5 5c-.7 3.8-3.3 7-7.5 9m8.5 6 3.5-9 3.5 9m-6-2.5h5" />,
  theme: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 3.5v17a8.5 8.5 0 0 0 0-17Z" fill="currentColor" stroke="none" />
    </>
  ),
  mobile: (
    <>
      <rect x="7" y="2.5" width="10" height="19" rx="2.5" />
      <path d="M11 18.5h2" />
    </>
  ),
  domain: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17M12 3.5c2.4 2.3 3.6 5.1 3.6 8.5s-1.2 6.2-3.6 8.5c-2.4-2.3-3.6-5.1-3.6-8.5S9.6 5.8 12 3.5Z" />
    </>
  ),
};

/* Only what holds for every offer — the per-offer benefits live in "How it works" (FeatureRows). */
const FEATURES: { icon: string; title: string; text: string; plan?: string }[] = [
  { icon: 'languages', title: msg('7 languages'), text: msg('The whole interface in English, French, Spanish, Portuguese, Arabic, Russian and Chinese.') },
  { icon: 'theme', title: msg('Light and dark'), text: msg('Every design works in light and dark mode, with your own colors.') },
  { icon: 'mobile', title: msg('Made for phones'), text: msg('Every page adapts to phones, tablets and large screens.') },
  { icon: 'domain', title: msg('Your own domain'), text: msg('Your page becomes a website at your own address.'), plan: 'Enterprise' },
];

/** What comes with every page — the reasons to pick Skraft over a site builder plus a chat app. */
export async function FeaturesGrid() {
  const t = await getT();
  return (
    <section id="features" className="scroll-mt-20 bg-white pb-16 pt-20 text-[#111111] sm:pb-20 sm:pt-28 lg:pb-24 lg:pt-36">
      <div className={CONTAINER}>
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="max-w-[20ch] text-[clamp(2rem,3.2vw,2.875rem)] font-medium leading-[1.1] tracking-[-0.03em]">
              {t('Everything you need. Nothing to plug in.')}
            </h2>
          </div>
          <p className="max-w-sm text-[17px] leading-relaxed text-neutral-500">
            {t('Built into every Skraft page, whatever you use it for.')}
          </p>
        </div>

        <ul className="mt-12 grid gap-x-8 gap-y-10 sm:mt-16 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <li key={feature.icon} className="border-t border-black/[0.08] pt-6">
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                className="h-8 w-8 text-[#FF5722]"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.75}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {ICONS[feature.icon]}
              </svg>
              <h3 className="mt-5 flex items-center gap-2 text-[20px] font-medium tracking-[-0.015em]">
                {t(feature.title)}
                {feature.plan && (
                  <span className="rounded-full px-2 py-0.5 text-[12px] font-medium text-neutral-500 ring-1 ring-inset ring-black/10">
                    {feature.plan}
                  </span>
                )}
              </h3>
              <p className="mt-2 text-[16px] leading-relaxed text-neutral-600">{t(feature.text)}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
