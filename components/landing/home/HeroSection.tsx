import Link from 'next/link';
import { HeroBackdrop } from '@/components/landing/home/HeroBackdrop';
import { CONTAINER, PrimaryCta } from '@/components/landing/home/shared';
import { getT } from '@/lib/i18n/server';

/**
 * A full-height editorial opener: cinematic photos across the screen (HeroBackdrop cross-fades a
 * professional, a student and a freelancer, each on the right), the promise anchored bottom-left,
 * the pitch and the two ways in bottom-right, and the reassurances as a quiet footer line. The
 * scrims darken the left and the bottom, where the copy sits. Its bottom corners are rounded, so
 * the white page shows behind it and the dark-to-light edge reads as a deliberate shape.
 */
export async function HeroSection() {
  const t = await getT();
  const reassurances = [t('Free plan, no credit card'), t('Live in minutes'), t('Available in 7 languages')];
  return (
    <section
      data-landing-hero
      data-nav-dark
      className="relative isolate flex min-h-[100svh] flex-col overflow-hidden rounded-b-[28px] bg-[#0B0B0B] text-white sm:rounded-b-[40px]"
    >
      <HeroBackdrop />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,#0B0B0B_15%,rgba(11,11,11,0.6)_50%,rgba(11,11,11,0.15)_100%)] md:bg-[linear-gradient(to_right,rgba(11,11,11,0.75)_0%,rgba(11,11,11,0.3)_45%,transparent_60%)]"
      />
      <div aria-hidden className="absolute inset-x-0 bottom-0 -z-10 h-[45%] bg-gradient-to-t from-[#0B0B0B] via-[#0B0B0B]/70 to-transparent" />

      <div className={`${CONTAINER} flex flex-1 flex-col justify-end pb-10 pt-32 sm:pb-14`}>
        <div className="grid gap-10 md:grid-cols-12 md:items-end md:gap-8">
          <h1 className="max-w-[14ch] text-[clamp(2.5rem,4.6vw,4.25rem)] font-medium leading-[1.02] tracking-[-0.035em] md:col-span-7">
            {t('Your work, your store and your clients — on one page.')}
          </h1>

          <div className="md:col-span-4 md:col-start-9">
            <p className="max-w-[34rem] text-[17px] leading-relaxed text-white/70 sm:text-[18px]">
              {t('Skraft turns your projects, products and services into a page that wins clients — with messaging built in and no middleman.')}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-4">
              <PrimaryCta href="/register" inverted>
                {t('Start for free')}
              </PrimaryCta>
              <Link
                href="#templates"
                className="text-[15px] font-medium text-white underline decoration-white/30 underline-offset-[6px] transition-colors hover:decoration-white"
              >
                {t('See the designs')}
              </Link>
            </div>
          </div>
        </div>

        <ul className="mt-14 flex flex-wrap gap-x-10 gap-y-2 border-t border-white/10 pt-5 text-[14px] text-white/55 sm:mt-20">
          {reassurances.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
