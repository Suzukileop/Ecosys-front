import { CONTAINER, PrimaryCta } from '@/components/landing/home/shared';

export function ClosingCta() {
  return (
    <section className="bg-white py-24 text-[#111111] sm:py-32 lg:py-44">
      <div className={CONTAINER}>
        <figure>
          <blockquote className="relative">
            <span
              aria-hidden
              className="block h-[0.5em] text-[clamp(6rem,14vw,14rem)] font-semibold leading-[0.8] text-[#FF5722]"
            >
              &ldquo;
            </span>
            <p className="mt-6 max-w-[16ch] text-[clamp(3rem,9vw,9.5rem)] font-semibold leading-[0.92] tracking-[-0.06em] sm:mt-10">
              The way you present yourself <span className="text-neutral-300">speaks before you do.</span>
            </p>
          </blockquote>
          <figcaption className="mt-12 flex items-center gap-3 text-[13px] font-medium uppercase tracking-[0.16em] text-neutral-500 sm:mt-16">
            <span aria-hidden className="h-px w-6 bg-black/20" />
            Skraft
          </figcaption>
        </figure>
        <PrimaryCta href="/register" className="mt-12 sm:mt-16">
          Create your space
        </PrimaryCta>
      </div>
    </section>
  );
}
