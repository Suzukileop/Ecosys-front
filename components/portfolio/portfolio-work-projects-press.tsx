'use client';

import Image from 'next/image';
import type { MarketplaceContentItem } from '@/types/marketplace';
import type {
  PortfolioWorkPresentationSettings,
  PortfolioWorkProjectsPressSettings,
} from '@/components/portfolio/portfolio-work-settings';
import {
  DEFAULT_PROJECTS_PRESS_SETTINGS,
  DEFAULT_WORK_PRESENTATION,
  mergeProjectsPressSettings,
  workCardRadiusClass,
} from '@/components/portfolio/portfolio-work-settings';

function workToolLabels(item: MarketplaceContentItem, max = 12): string[] {
  return Array.from(new Set((item.toolsUsed ?? []).map((t) => t.trim()).filter(Boolean))).slice(
    0,
    max
  );
}

function workRoleLabel(item: MarketplaceContentItem): string {
  const role = item.role?.trim();
  if (role) return role;
  if (!item.category?.trim() && item.genre?.trim()) return item.genre.trim();
  return '';
}

const PRESS_EYEBROW_SIZE_CLASS: Record<PortfolioWorkProjectsPressSettings['eyebrowSize'], string> = {
  sm: 'text-[0.62rem]',
  md: 'text-[0.72rem]',
  lg: 'text-[0.88rem]',
};

function PressProjectRow({
  item,
  presentation,
  settings,
}: {
  item: MarketplaceContentItem;
  presentation: PortfolioWorkPresentationSettings;
  settings: PortfolioWorkProjectsPressSettings;
}) {
  const titleColor = presentation.elementStyles?.cardTitle?.color || presentation.titleColor;
  const muted = presentation.elementStyles?.cardDescription?.color || presentation.subtitleColor;
  const labelColor = presentation.elementStyles?.categoryOnCard?.color || titleColor;
  const toolColor = presentation.elementStyles?.toolsList?.color || muted;
  const accent = presentation.ctaColor || presentation.categoryActiveColor || titleColor;

  const mediaUrl = item.mediaUrl?.trim() || null;
  const title = item.title?.trim() || 'Untitled';
  const role = workRoleLabel(item);
  const category = item.category?.trim() || '';
  const description = item.description?.trim() || '';
  const tools = workToolLabels(item);
  const href = item.linkUrl?.trim() || null;
  const radiusClass = workCardRadiusClass(settings.thumbnailRadius ?? 'md');

  const hasReveal = Boolean(description);

  const thumbnail = (
    <div
      data-pf-no-color-transition=""
      className={`pf-press-thumb relative aspect-square w-72 shrink-0 overflow-hidden sm:w-80 lg:w-96 ${radiusClass}`}
      style={{ backgroundColor: `color-mix(in srgb, ${accent} 10%, transparent)` }}
    >
      {mediaUrl ? (
        <Image
          src={mediaUrl}
          alt={title}
          fill
          sizes="(max-width: 640px) 288px, (max-width: 1024px) 320px, 384px"
          className="object-cover"
        />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center px-6 text-center text-sm leading-relaxed"
          style={{ color: muted }}
        >
          Add a thumbnail in Information → Portfolio
        </div>
      )}
    </div>
  );

  const media = href ? (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={title}
      className={`block shrink-0 ${radiusClass}`}
    >
      {thumbnail}
    </a>
  ) : (
    thumbnail
  );

  return (
    <div className="pf-press-row flex items-stretch gap-5 sm:gap-7">
      {media}

      <div className="flex min-w-0 flex-1 flex-col pt-0.5">
        {role || category ? (
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            {role ? (
              <span
                className="text-[0.72rem] font-bold uppercase tracking-[0.08em]"
                style={{ color: labelColor }}
              >
                {role}
              </span>
            ) : null}
            {category ? (
              <span className="text-[0.72rem] uppercase tracking-[0.04em]" style={{ color: muted }}>
                {category}
              </span>
            ) : null}
          </div>
        ) : null}

        <p
          className="mt-3 text-[1.15rem] font-semibold leading-snug sm:text-[1.3rem]"
          style={{ color: titleColor }}
        >
          {href ? (
            <a href={href} target="_blank" rel="noopener noreferrer" className="hover:opacity-80">
              {title}
            </a>
          ) : (
            title
          )}
        </p>

        {hasReveal ? (
          <div data-pf-no-color-transition="" className="pf-press-reveal">
            <div className="overflow-hidden">
              <p className="mt-4 max-w-xl text-[0.95rem] leading-relaxed" style={{ color: muted }}>
                {description}
              </p>
            </div>
          </div>
        ) : null}

        {tools.length > 0 ? (
          <div
            data-pf-no-color-transition=""
            className="pf-press-stack mt-auto hidden flex-row flex-wrap gap-2 pt-8 lg:flex"
          >
            {tools.map((tool) => (
              <span
                key={tool}
                className="rounded-none border px-3 py-1 text-[0.7rem] font-medium uppercase tracking-[0.04em]"
                style={{
                  borderColor: `color-mix(in srgb, ${muted} 45%, transparent)`,
                  color: toolColor,
                }}
              >
                {tool}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

/** Press — newsroom feed. Large square thumbnails beside thin role/category
 *  metadata, title, description, and tool tags pinned to the row's bottom —
 *  same visual language as the Experience section's "Press" design. */
export function ProjectsPressGallery({
  items,
  presentation = DEFAULT_WORK_PRESENTATION,
}: {
  items: MarketplaceContentItem[];
  presentation?: PortfolioWorkPresentationSettings;
}) {
  if (items.length === 0) return null;

  const settings = mergeProjectsPressSettings(
    DEFAULT_PROJECTS_PRESS_SETTINGS,
    presentation.projectsPress
  );
  const border = presentation.cardBorderColor || presentation.subtitleColor;
  const introText = settings.introText.trim();
  const eyebrowText = (settings.eyebrowText || 'Project').trim();
  const showTwoColumn = Boolean(introText) || Boolean(eyebrowText);

  return (
    <div className="w-full">
      <div className="h-px w-full" style={{ backgroundColor: border, opacity: 0.2 }} aria-hidden />

      <div
        className={`mt-10 grid grid-cols-1 gap-10 sm:mt-14 ${
          showTwoColumn ? 'lg:grid-cols-[minmax(0,1fr)_minmax(0,3fr)] lg:gap-16' : ''
        }`}
      >
        {showTwoColumn ? (
          <div className="hidden lg:block lg:max-w-xs">
            <div
              className={
                settings.eyebrowSticky
                  ? 'lg:sticky lg:top-[calc(var(--portfolio-nav-top-clearance,5.5rem)+1.5rem)]'
                  : undefined
              }
            >
              {eyebrowText ? (
                <p
                  className={`font-bold uppercase tracking-[0.22em] ${PRESS_EYEBROW_SIZE_CLASS[settings.eyebrowSize]}`}
                  style={{ color: presentation.subtitleColor, opacity: 0.78 }}
                >
                  {eyebrowText}
                </p>
              ) : null}
              {introText ? (
                <p
                  className={eyebrowText ? 'mt-4 text-[1.05rem] leading-relaxed' : 'text-[1.05rem] leading-relaxed'}
                  style={{ color: presentation.titleColor, fontFamily: 'Georgia, "Times New Roman", serif' }}
                >
                  {introText}
                </p>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className="space-y-12 sm:space-y-16">
          {items.map((item) => (
            <PressProjectRow key={item.id} item={item} presentation={presentation} settings={settings} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function isProjectsPressDesign(
  presentation: Pick<PortfolioWorkPresentationSettings, 'sectionDesign'> | undefined
): boolean {
  return presentation?.sectionDesign === 'projects-press';
}
