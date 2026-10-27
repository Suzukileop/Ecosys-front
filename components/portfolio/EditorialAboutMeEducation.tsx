'use client';

import { useEffect, useRef, useState } from 'react';
import type { ProfileEducationEntry } from '@/types/profile';
import type {
  PortfolioInfoPremiumFontSize,
  PortfolioInfoEducationDisplayStyle,
} from '@/components/portfolio/portfolio-info-settings';
import {
  infoContentBlockTitleSizeClass,
  infoContentBodySizeClass,
  infoContentEducationMetaSizeClass,
  infoContentEducationTitleSizeClass,
} from '@/components/portfolio/portfolio-info-settings';
import { useT } from '@/lib/i18n/I18nProvider';

type TraitEducationColors = {
  /** Block label ("Education") — follows Info → General → Block label color. */
  labelColor: string;
  titleColor: string;
  bodyColor: string;
  accent: string;
  cardBg: string;
  cardBorder: string;
};

function parseSchoolYearRange(raw: string): { start: string; end: string | null } | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const rangeMatch = trimmed.match(/^(.+?)\s*[–—−-]{1,2}\s*(.+)$/u);
  if (rangeMatch) {
    const start = rangeMatch[1].trim();
    const end = rangeMatch[2].trim();
    if (start && end) return { start, end };
  }

  return { start: trimmed, end: null };
}

function formatYearInline(schoolYear: string): string {
  const parsed = parseSchoolYearRange(schoolYear);
  if (!parsed) return '';
  if (!parsed.end) return parsed.start;
  return `${parsed.start} — ${parsed.end}`;
}



function EducationSectionHeader({
  labelColor,
  cardBorder,
  contentSize,
}: {
  labelColor: string;
  cardBorder: string;
  contentSize: PortfolioInfoPremiumFontSize;
}) {
  const t = useT();
  const sectionTitleClass = infoContentBlockTitleSizeClass(contentSize);
  // Label only: the former "02 — Academic path" counter read as a section number.
  return (
    <>
      <h3
        className={`text-left font-bold tracking-tight ${sectionTitleClass}`}
        style={{ color: labelColor }}
      >
        {t('Education')}
      </h3>
      <div className="mt-5 h-px w-full" style={{ backgroundColor: cardBorder }} aria-hidden />
    </>
  );
}

const TRAIT_EDUCATION_SECTION_TOP = 'mt-16 sm:mt-20 lg:mt-24';

/** 1 — Timeline spine (current default). */
function EducationTimeline({
  items,
  labelColor,
  titleColor,
  bodyColor,
  accent,
  cardBorder,
  contentSize,
  sectionClassName = TRAIT_EDUCATION_SECTION_TOP,
}: {
  items: ProfileEducationEntry[];
  contentSize: PortfolioInfoPremiumFontSize;
  sectionClassName?: string;
} & Omit<TraitEducationColors, 'cardBg'>) {
  const bodyClass = infoContentBodySizeClass(contentSize);
  const metaClass = infoContentEducationMetaSizeClass(contentSize);

  return (
    <section className={sectionClassName}>
      <EducationSectionHeader labelColor={labelColor} cardBorder={cardBorder} contentSize={contentSize} />
      <ol className="relative mt-2">
        <span
          aria-hidden
          className="absolute bottom-2 left-[0.35rem] top-2 w-px sm:left-[0.4rem]"
          style={{ backgroundColor: cardBorder }}
        />
        {items.map((entry, index) => {
          const year = entry.schoolYear?.trim() || '';
          const title = entry.title?.trim() || '';
          const institution = entry.institution?.trim() || '';
          const key = entry.id || `${title}-${year}-${index}`;

          return (
            <li
              key={key}
              className="relative grid gap-2 border-b py-6 last:border-b-0 sm:grid-cols-[minmax(9rem,11rem)_minmax(0,1fr)] sm:items-baseline sm:gap-6 sm:py-7"
              style={{ borderColor: cardBorder }}
            >
              <span
                aria-hidden
                className="absolute left-[0.16rem] top-[2.05rem] h-1.5 w-1.5 rounded-full sm:top-[2.3rem]"
                style={{
                  backgroundColor: accent,
                  boxShadow: `0 0 0 3px color-mix(in srgb, ${accent} 12%, transparent)`,
                }}
              />

              <div className="pl-6 sm:pl-8">
                {year ? (
                  <p className={`font-normal tabular-nums leading-relaxed ${bodyClass}`} style={{color:bodyColor}}>
                    {formatYearInline(year)}
                  </p>
                ) : (
                  <p
                    className={`font-medium uppercase tracking-[0.16em] ${metaClass}`}
                    style={{ color: bodyColor }}
                  >
                    —
                  </p>
                )}
              </div>

              <div className="min-w-0 pl-6 sm:pl-0">
                {title ? (
                  <p
                    className={`font-medium leading-relaxed tracking-[-0.01em] ${bodyClass}`}
                    style={{ color: titleColor }}
                  >
                    {title}
                  </p>
                ) : null}
                {institution ? (
                  <p
                    className={`mt-2 max-w-2xl leading-relaxed ${bodyClass}`}
                    style={{ color: bodyColor }}
                  >
                    {institution}
                  </p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

/** 2 — Editorial magazine bands (Framer / Awwwards). */
function EducationEditorial({
  items,
  labelColor,
  titleColor,
  bodyColor,
  cardBorder,
  contentSize,
  sectionClassName = TRAIT_EDUCATION_SECTION_TOP,
}: {
  items: ProfileEducationEntry[];
  contentSize: PortfolioInfoPremiumFontSize;
  sectionClassName?: string;
} & Omit<TraitEducationColors, 'cardBg'>) {
  const entryTitleClass = infoContentEducationTitleSizeClass(contentSize);
  const metaClass = infoContentEducationMetaSizeClass(contentSize);

  return (
    <section className={sectionClassName}>
      <EducationSectionHeader labelColor={labelColor} cardBorder={cardBorder} contentSize={contentSize} />
      <ul className="pf-about-trait-edu-list mt-2">
        {items.map((entry, index) => {
          const year = entry.schoolYear?.trim() || '';
          const title = entry.title?.trim() || '';
          const institution = entry.institution?.trim() || '';
          const key = entry.id || `${title}-${year}-${index}`;
          const yearLabel = year ? formatYearInline(year) : '';

          return (
            <li key={key} className="pf-about-trait-edu-row" data-pf-no-color-transition="">
              <div className="pf-about-trait-edu-body" data-pf-no-color-transition="">
                <div className="pf-about-trait-edu-fade" data-pf-no-color-transition="">
                  <div className="relative z-[1] min-w-0">
                    {yearLabel ? (
                      <span
                        className={`font-semibold uppercase tracking-[0.2em] ${metaClass}`}
                        style={{ color: bodyColor }}
                      >
                        {yearLabel}
                      </span>
                    ) : null}
                    {title ? (
                      <p
                        className={`mt-3 max-w-4xl font-semibold leading-[1.1] tracking-tight ${entryTitleClass}`}
                        style={{ color: titleColor }}
                      >
                        {title}
                      </p>
                    ) : null}
                    {institution ? (
                      <p className="mt-2 max-w-xl text-sm leading-relaxed" style={{ color: bodyColor }}>
                        {institution}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** 3 — Soft panel grid — clear cards, plain years, fluid hover accent. */
function EducationPanels({
  items,
  labelColor,
  titleColor,
  bodyColor,
  accent,
  cardBg,
  cardBorder,
  contentSize,
  sectionClassName = TRAIT_EDUCATION_SECTION_TOP,
}: {
  items: ProfileEducationEntry[];
  contentSize: PortfolioInfoPremiumFontSize;
  sectionClassName?: string;
} & TraitEducationColors) {
  const entryTitleClass = infoContentBlockTitleSizeClass(contentSize);
  const bodyClass = infoContentBodySizeClass(contentSize);
  const metaClass = infoContentEducationMetaSizeClass(contentSize);
  const panelBg = `color-mix(in srgb, ${cardBorder} 16%, ${cardBg})`;

  return (
    <section className={sectionClassName}>
      <EducationSectionHeader labelColor={labelColor} cardBorder={cardBorder} contentSize={contentSize} />
      <ul className="mt-10 grid gap-5 sm:grid-cols-2 sm:gap-6 lg:gap-7">
        {items.map((entry, index) => {
          const year = entry.schoolYear?.trim() || '';
          const title = entry.title?.trim() || '';
          const institution = entry.institution?.trim() || '';
          const key = entry.id || `${title}-${year}-${index}`;

          return (
            <li
              key={key}
              className="flex flex-col rounded-2xl px-6 py-7 sm:px-7 sm:py-8"
              style={{ backgroundColor: panelBg }}
            >
              {year ? (
                <p
                  className={`tabular-nums tracking-tight ${metaClass}`}
                  style={{ color: bodyColor }}
                >
                  {formatYearInline(year)}
                </p>
              ) : null}

              <div className={`flex flex-1 flex-col gap-3 ${year ? 'mt-4' : ''}`}>
                {title ? (
                  <p
                    className={`font-semibold leading-snug tracking-tight ${entryTitleClass}`}
                    style={{ color: titleColor }}
                  >
                    {title}
                  </p>
                ) : null}
                {institution ? (
                  <p
                    className={`leading-relaxed ${bodyClass}`}
                    style={{ color: bodyColor }}
                  >
                    {institution}
                  </p>
                ) : null}
              </div>

              <div className="mt-6 h-px w-10" style={{ backgroundColor: accent }} aria-hidden />
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function getEducationScrollParent(el: HTMLElement | null): HTMLElement | null {
  let node = el?.parentElement ?? null;
  while (node && node !== document.body) {
    const { overflowY } = getComputedStyle(node);
    if (
      (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') &&
      node.scrollHeight > node.clientHeight + 1
    ) {
      return node;
    }
    node = node.parentElement;
  }
  return null;
}

function smoothstep(value: number): number {
  const t = Math.min(1, Math.max(0, value));
  return t * t * (3 - 2 * t);
}

function EducationCascadeItem({
  entry,
  index,
  shiftProgress,
  scrollShiftEnabled,
  titleColor,
  bodyColor,
  accent,
  contentSize,
  itemRef,
}: {
  entry: ProfileEducationEntry;
  index: number;
  shiftProgress: number;
  scrollShiftEnabled: boolean;
  titleColor: string;
  bodyColor: string;
  accent: string;
  contentSize: PortfolioInfoPremiumFontSize;
  itemRef: (el: HTMLLIElement | null) => void;
}) {
  const year = entry.schoolYear?.trim() || '';
  const title = entry.title?.trim() || '';
  const institution = entry.institution?.trim() || '';
  const eased = smoothstep(shiftProgress);
  const [cascadeEnabled, setCascadeEnabled] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(min-width: 640px)');
    const update = () => setCascadeEnabled(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  const staticCascadeClass =
    index % 2 === 0 ? 'sm:ml-0 sm:mr-[8%]' : 'sm:ml-[8%] sm:mr-0';

  const cascadeStyle =
    scrollShiftEnabled && cascadeEnabled
      ? index % 2 === 0
        ? { marginLeft: 0, marginRight: '8%' }
        : {
            marginLeft: `${eased * 8}%`,
            marginRight: `${(1 - eased) * 8}%`,
          }
      : undefined;

  const entryTitleClass = infoContentEducationTitleSizeClass(contentSize);
  const bodyClass = infoContentBodySizeClass(contentSize);
  const metaClass = infoContentEducationMetaSizeClass(contentSize);

  return (
    <li
      ref={itemRef}
      className={`grid gap-5 py-8 sm:grid-cols-[7rem_minmax(0,1fr)_auto] sm:items-start sm:gap-8 sm:py-10 ${
        scrollShiftEnabled ? '' : staticCascadeClass
      }`}
      style={cascadeStyle}
    >
      <div className="flex shrink-0 flex-col gap-3" style={{ color: bodyColor }}>
        {year ? (
          <span className={`tabular-nums tracking-tight ${metaClass}`} style={{ color: bodyColor }}>
            {formatYearInline(year)}
          </span>
        ) : null}
      </div>

      <div className="min-w-0">
        {title ? (
          <p
            className={`font-semibold leading-snug tracking-tight ${entryTitleClass}`}
            style={{ color: titleColor }}
          >
            {title}
          </p>
        ) : null}
        {institution ? (
          <p className={`mt-3 max-w-2xl leading-relaxed ${bodyClass}`} style={{ color: bodyColor }}>
            {institution}
          </p>
        ) : null}
      </div>

      <div className="hidden min-w-[3rem] sm:flex sm:items-start sm:justify-end sm:pt-3 lg:min-w-[5rem]">
        <span
          aria-hidden
          className="block h-px w-12 lg:w-16"
          style={{ backgroundColor: accent }}
        />
      </div>
    </li>
  );
}

/** 4 — Asymmetric cascade (Awwwards). */
function EducationCascade({
  items,
  labelColor,
  titleColor,
  bodyColor,
  accent,
  cardBorder,
  scrollShiftEnabled = false,
  contentSize,
  sectionClassName = TRAIT_EDUCATION_SECTION_TOP,
}: {
  items: ProfileEducationEntry[];
  scrollShiftEnabled?: boolean;
  contentSize: PortfolioInfoPremiumFontSize;
  sectionClassName?: string;
} & TraitEducationColors) {
  const sectionRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [shiftProgress, setShiftProgress] = useState<number[]>(() => items.map(() => 0));

  useEffect(() => {
    itemRefs.current.length = items.length;
  }, [items.length]);

  useEffect(() => {
    if (!scrollShiftEnabled) {
      setShiftProgress(items.map(() => 0));
      return;
    }

    const section = sectionRef.current;
    if (!section || items.length === 0) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      setShiftProgress(items.map((_, index) => (index % 2 === 1 ? 1 : 0)));
      return;
    }

    let frame = 0;
    const update = () => {
      frame = 0;
      const scrollRoot = getEducationScrollParent(section);
      const viewHeight = scrollRoot?.clientHeight ?? window.innerHeight;
      const viewTop = scrollRoot?.getBoundingClientRect().top ?? 0;
      const startLine = viewTop + viewHeight * 0.9;
      const endLine = viewTop + viewHeight * 0.52;

      const next = items.map((_, index) => {
        if (index % 2 === 0) return 0;
        const el = itemRefs.current[index];
        if (!el) return 0;
        const top = el.getBoundingClientRect().top;
        if (startLine <= endLine) return 0;
        return smoothstep((startLine - top) / (startLine - endLine));
      });

      setShiftProgress((prev) => {
        if (prev.length === next.length && prev.every((value, index) => Math.abs(value - next[index]!) < 0.004)) {
          return prev;
        }
        return next;
      });
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    const scrollTarget: HTMLElement | Window = getEducationScrollParent(section) ?? window;
    scrollTarget.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      scrollTarget.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [items.length, scrollShiftEnabled]);

  return (
    <section
      ref={scrollShiftEnabled ? sectionRef : undefined}
      className={sectionClassName}
    >
      <EducationSectionHeader labelColor={labelColor} cardBorder={cardBorder} contentSize={contentSize} />
      <ul className="mt-10">
        {items.map((entry, index) => (
          <EducationCascadeItem
            key={entry.id || `${entry.title}-${entry.schoolYear}-${index}`}
            entry={entry}
            index={index}
            shiftProgress={shiftProgress[index] ?? 0}
            scrollShiftEnabled={scrollShiftEnabled}
            titleColor={titleColor}
            bodyColor={bodyColor}
            accent={accent}
            contentSize={contentSize}
            itemRef={(el) => {
              itemRefs.current[index] = el;
            }}
          />
        ))}
      </ul>
    </section>
  );
}

export function TraitEducationBlock({
  items,
  style,
  labelColor,
  titleColor,
  bodyColor,
  accent,
  cardBg,
  cardBorder,
  cascadeScrollShift = false,
  contentSize = 'medium',
  sectionClassName = TRAIT_EDUCATION_SECTION_TOP,
}: {
  items: ProfileEducationEntry[];
  style: PortfolioInfoEducationDisplayStyle;
  cascadeScrollShift?: boolean;
  contentSize?: PortfolioInfoPremiumFontSize;
  sectionClassName?: string;
} & TraitEducationColors) {
  if (items.length === 0) return null;

  const colors = { labelColor, titleColor, bodyColor, accent, cardBg, cardBorder };
  const layoutProps = { contentSize, sectionClassName, ...colors };

  switch (style) {
    case 'editorial':
      return <EducationEditorial items={items} {...layoutProps} />;
    case 'panels':
      return <EducationPanels items={items} {...layoutProps} />;
    case 'cascade':
      return (
        <EducationCascade
          items={items}
          scrollShiftEnabled={cascadeScrollShift}
          {...layoutProps}
        />
      );
    case 'timeline':
    default:
      return <EducationTimeline items={items} {...layoutProps} />;
  }
}
