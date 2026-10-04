import { HeroBackdrop } from '@/components/landing/home/HeroBackdrop';
import { CONTAINER, PrimaryCta } from '@/components/landing/home/shared';

export function HeroSection() {
  return (
    <section
      data-landing-hero
      className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden bg-black pb-20 pt-28 text-white sm:pb-28 sm:pt-32"
    >
      <div className={`${CONTAINER} relative z-10 flex flex-col items-center text-center`}>
        <span aria-hidden className="h-px w-6 bg-white/60" />

        <h1 className="mt-6 pb-[0.08em] text-[clamp(3.25rem,15vw,13rem)] font-semibold leading-[0.9] tracking-[-0.06em]">
          <span className="sr-only">Skraft — build, showcase and sell.</span>
          <span aria-hidden className="block">
            Skraft
          </span>
        </h1>
      </div>

      <HeroBackdrop />

      <div aria-hidden className="h-[38vh] min-h-[240px] sm:h-[48vh]" />

      <div className={`${CONTAINER} relative z-10 flex flex-col items-center text-center sm:-mt-10`}>
        <p className="max-w-[34rem] text-[16px] leading-relaxed text-white/55 sm:text-[18px]">
          Build your portfolio, sell your products and talk to clients — all in one place.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-4">
          <PrimaryCta href="/register" inverted>
            Start for free
          </PrimaryCta>
          <a
            href="#product"
            className="text-[15px] font-medium text-white/80 underline decoration-white/25 underline-offset-[6px] hover:text-white hover:decoration-white"
          >
            How it works
          </a>
        </div>
      </div>
    </section>
  );
}
