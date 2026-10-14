import { CONTAINER, PrimaryCta } from '@/components/landing/home/shared';
import { Wordmark } from '@/components/landing/home/SiteNav';
import { getT } from '@/lib/i18n/server';

/** The brand slogan as the page's sign-off: the one heading allowed above the section scale, signed with the wordmark. */
export async function ClosingCta() {
  const t = await getT();
  return (
    <section className="bg-white py-20 text-[#111111] sm:py-28 lg:py-36">
      <div className={CONTAINER}>
        <span aria-hidden className="block h-[0.45em] text-[clamp(3.5rem,5vw,4.5rem)] font-medium leading-[0.85] text-[#FF5722]">
          &ldquo;
        </span>
        <p className="mt-4 max-w-[22ch] text-[clamp(2.5rem,4.6vw,4rem)] font-medium leading-[1.05] tracking-[-0.035em]">
          {t.rich('The way you present yourself {rest}', {
            rest: <span className="text-neutral-300">{t('speaks before you do.')}</span>,
          })}
        </p>
        <div className="mt-12 flex flex-col gap-6 border-t border-black/[0.08] pt-8 sm:mt-16 sm:flex-row sm:items-center sm:justify-between">
          <Wordmark className="!text-[24px]" />
          <PrimaryCta href="/register">{t('Create your space')}</PrimaryCta>
        </div>
      </div>
    </section>
  );
}
