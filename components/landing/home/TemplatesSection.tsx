import { PORTFOLIO_HERO_BANNER_DESIGN_OPTIONS } from '@/components/portfolio/portfolio-hero-banner-settings';
import { CONTAINER, ImageSlot, PrimaryCta } from '@/components/landing/home/shared';
import { getT } from '@/lib/i18n/server';

/** How many designs the gallery shows. */
const SHOWN = 6;

/**
 * Screenshot per design, keyed by design value — drop the file in /public and add it here, e.g.
 * 'cinematic-reveal': '/landing/templates/cinematic-reveal.jpg'. Designs without one show an empty frame.
 */
const IMAGES: Partial<Record<string, string>> = {};

/**
 * The designs — the product's core value. A still-image gallery (not videos: six players would
 * weigh the page down), each frame named after a real hero design the editor offers.
 */
export async function TemplatesSection() {
  const t = await getT();
  const designs = PORTFOLIO_HERO_BANNER_DESIGN_OPTIONS.slice(0, SHOWN);
  return (
    <section id="templates" data-nav-dark className="scroll-mt-20 rounded-[28px] bg-[#0B0B0B] py-20 text-white sm:rounded-[40px] sm:py-28 lg:py-36">
      <div className={CONTAINER}>
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="max-w-[18ch] text-[clamp(2rem,3.2vw,2.875rem)] font-medium leading-[1.1] tracking-[-0.03em]">
              {t('Start from a design. Make it yours.')}
            </h2>
          </div>
          <p className="max-w-sm text-[17px] leading-relaxed text-white/60">
            {t('Professional designs and a choice of layouts for every section — switch anytime, your content stays.')}
          </p>
        </div>

        {/* Gallery: the first design large on the left, the rest as a mosaic around it. */}
        <ul className="mt-12 grid gap-4 sm:mt-16 sm:grid-cols-2 lg:grid-cols-3">
          {designs.map((design, i) => {
            const name = t(design.label);
            const lead = i === 0;
            return (
              <li key={design.value} className={lead ? 'lg:col-span-2 lg:row-span-2' : ''}>
                <ImageSlot
                  slot={`template-${design.value}`}
                  src={IMAGES[design.value]}
                  alt={t('Preview of the {design} design', { design: name })}
                  tone="dark"
                  ratio={lead ? 'aspect-[4/3] lg:aspect-auto lg:h-full' : 'aspect-[4/3]'}
                  sizes={lead ? '(min-width: 1024px) 66vw, 100vw' : undefined}
                >
                  <span className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end bg-gradient-to-t from-black/75 via-black/20 to-transparent p-5 pt-16 text-[16px] font-medium sm:p-6 sm:pt-20">
                    {name}
                  </span>
                </ImageSlot>
              </li>
            );
          })}
        </ul>

        <PrimaryCta href="/register" inverted className="mt-12 sm:mt-16">
          {t('Try every design for free')}
        </PrimaryCta>
      </div>
    </section>
  );
}
