import { ECOSYSTEM_PLATFORMS, PlatformLogoIcon } from '@/components/ecosystem/PlatformLogoIcon';

export function EcosystemHeroCard() {
  return (
    <section
      aria-labelledby="ecosystem-hero-title"
      className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
    >
      <div className="flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between lg:gap-8 lg:p-8">
        <div className="min-w-0 flex-1 space-y-6 lg:max-w-2xl">
          <h2
            id="ecosystem-hero-title"
            className="text-2xl font-bold leading-snug text-neutral-900 dark:text-white sm:text-[1.75rem] lg:text-3xl"
          >
            Create content without creating content
          </h2>

          <div className="max-w-md space-y-2.5 pt-1">
            <p className="text-[15px] leading-[1.75] text-neutral-600 dark:text-neutral-400">
              Become a creator on Instagram, TikTok, YouTube, and more — even with zero skills. Tell us your niche and
              approve your model.
            </p>
            <p className="text-[15px] leading-[1.75] text-neutral-500 dark:text-neutral-500">
              Our agents handle production and publishing on your schedule.
            </p>
          </div>
        </div>

        <div
          className="flex shrink-0 flex-wrap items-center justify-start gap-3 sm:gap-4 lg:justify-end"
          role="list"
          aria-label="Supported platforms"
        >
          {ECOSYSTEM_PLATFORMS.slice(0, 5).map((platform) => (
            <span
              key={platform.id}
              role="listitem"
              title={platform.label}
              aria-label={platform.label}
              className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-neutral-200 bg-white shadow-sm transition hover:border-neutral-300 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:border-neutral-600 dark:hover:bg-neutral-700/50 sm:h-14 sm:w-14"
            >
              <PlatformLogoIcon platform={platform.id} className="h-6 w-6 shrink-0 sm:h-7 sm:w-7" />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
