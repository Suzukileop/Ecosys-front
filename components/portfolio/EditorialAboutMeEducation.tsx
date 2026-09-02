'use client';

import { useEffect, useRef, useState } from 'react';
import type { ProfileEducationEntry } from '@/types/ecosystem';
import type {
  PortfolioInfoContentSize,
  PortfolioInfoEducationDisplayStyle,
} from '@/components/portfolio/portfolio-info-settings';
import {
  infoContentBlockTitleSizeClass,
  infoContentBodySizeClass,
  infoContentEducationMetaSizeClass,
  infoContentEducationTitleSizeClass,
} from '@/components/portfolio/portfolio-info-settings';

export type TraitEducationColors = {
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

function traitEducationYearStackedClass(contentSize: PortfolioInfoContentSize): string {
  switch (contentSize) {
    case 'sm':
      return 'text-2xl font-semibold tracking-tight sm:text-3xl lg:leading-none';
    case 'lg':
      return 'text-4xl font-semibold tracking-tight sm:text-5xl lg:text-[3.25rem] lg:leading-none';
    case 'md':
    default:
      return 'text-3xl font-semibold tracking-tight sm:text-4xl lg:text-[2.75rem] lg:leading-none';
  }
}

function TraitEducationYearStacked({
  schoolYear,
  titleColor,
  bodyColor,
  contentSize,
}: {
  schoolYear: string;
  titleColor: string;
  bodyColor: string;
  contentSize: PortfolioInfoContentSize;
}) {
  const parsed = parseSchoolYearRange(schoolYear);
  const metaClass = infoContentEducationMetaSizeClass(contentSize);
  if (!parsed) {
    return (
      <p className={`font-medium uppercase tracking-[0.16em] ${metaClass}`} style={{ color: bodyColor }}>
        —
      </p>
    );
  }

  const yearClass = traitEducationYearStackedClass(contentSize);

  if (!parsed.end) {
    return (
      <p className={yearClass} style={{ color: titleColor }}>
        {parsed.start}
      </p>
    );
  }

  return (
    <div className={`${yearClass} leading-[1.05]`} style={{ color: titleColor }}>
      <p className="whitespace-nowrap">
        {parsed.start}
        <span aria-hidden className="ml-2 inline-block opacity-70">
          —
        </span>
      </p>
      <p className="whitespace-nowrap">{parsed.end}</p>
    </div>
  );
}

function EducationSectionHeader({
  count,
  titleColor,
  bodyColor,
  cardBorder,
  contentSize,
}: {
  count: number;
  titleColor: string;
  bodyColor: string;
  cardBorder: string;
  contentSize: PortfolioInfoContentSize;
}) {
  const sectionTitleClass = infoContentBlockTitleSizeClass(contentSize);
  const metaClass = infoContentEducationMetaSizeClass(contentSize);
  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
        <h3
          className={`text-left font-bold tracking-tight ${sectionTitleClass}`}
          style={{ color: titleColor }}
        >
          Education
        </h3>
        <p
          className={`font-semibold uppercase tracking-[0.22em] ${metaClass}`}
          style={{ color: bodyColor }}
        >
          {String(count).padStart(2, '0')} — Academic path
        </p>
      </div>
      <div className="mt-5 h-px w-full" style={{ backgroundColor: cardBorder }} aria-hidden />
    </>
  );
}

const TRAIT_EDUCATION_SECTION_TOP = 'mt-16 sm:mt-20 lg:mt-24';

/** 1 — Timeline spine (current default). */
function EducationTimeline({
  items,
  titleColor,
  bodyColor,
  accent,
  cardBorder,
  contentSize,
  sectionClassName = TRAIT_EDUCATION_SECTION_TOP,
}: {
  items: ProfileEducationEntry[];
  contentSize: PortfolioInfoContentSize;
  sectionClassName?: string;
} & Omit<TraitEducationColors, 'cardBg'>) {
  const entryTitleClass = infoContentEducationTitleSizeClass(contentSize);
  const bodyClass = infoContentBodySizeClass(contentSize);
  const metaClass = infoContentEducationMetaSizeClass(contentSize);

  return (
    <section className={sectionClassName}>
      <EducationSectionHeader
        count={items.length}
        titleColor={titleColor}
        bodyColor={bodyColor}
        cardBorder={cardBorder}
        contentSize={contentSize}
      />
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
              className="group relative grid gap-4 border-b py-8 last:border-b-0 sm:grid-cols-[minmax(7rem,11rem)_minmax(0,1fr)_auto] sm:items-start sm:gap-8 sm:py-10"
              style={{ borderColor: cardBorder }}
            >
              <span
                aria-hidden
                className="absolute left-0 top-[2.15rem] h-2 w-2 -translate-x-[0.15rem] rounded-full sm:top-[2.6rem]"
                style={{
                  backgroundColor: accent,
                  boxShadow: `0 0 0 4px color-mix(in srgb, ${accent} 22%, transparent)`,
                }}
              />

              <div className="pl-6 sm:pl-8">
                {year ? (
                  <TraitEducationYearStacked
                    schoolYear={year}
                    titleColor={titleColor}
                    bodyColor={bodyColor}
                    contentSize={contentSize}
                  />
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
                    className={`font-semibold leading-snug tracking-tight ${entryTitleClass}`}
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
                <div
                  className="mt-5 h-[2px] w-0 transition-[width] duration-500 ease-out group-hover:w-16"
                  style={{ backgroundColor: accent }}
                  aria-hidden
                />
              </div>

              <p
                className="hidden pl-6 font-mono text-xs tabular-nums sm:block sm:pl-0 sm:pt-2"
                style={{ color: bodyColor }}
              >
                {String(index + 1).padStart(2, '0')}
              </p>
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
  titleColor,
  bodyColor,
  accent,
  cardBorder,
  contentSize,
  sectionClassName = TRAIT_EDUCATION_SECTION_TOP,
}: {
  items: ProfileEducationEntry[];
  contentSize: PortfolioInfoContentSize;
  sectionClassName?: string;
} & Omit<TraitEducationColors, 'cardBg'>) {
  const entryTitleClass = infoContentEducationTitleSizeClass(contentSize);
  const bodyClass = infoContentBodySizeClass(contentSize);
  const metaClass = infoContentEducationMetaSizeClass(contentSize);

  return (
    <section className={sectionClassName}>
      <EducationSectionHeader
        count={items.length}
        titleColor={titleColor}
        bodyColor={bodyColor}
        cardBorder={cardBorder}
        contentSize={contentSize}
      />
      <ul className="mt-2">
        {items.map((entry, index) => {
          const year = entry.schoolYear?.trim() || '';
          const title = entry.title?.trim() || '';
          const institution = entry.institution?.trim() || '';
          const key = entry.id || `${title}-${year}-${index}`;
          const yearLabel = year ? formatYearInline(year) : '';
          const parsed = year ? parseSchoolYearRange(year) : null;

          return (
            <li
              key={key}
              className="group relative overflow-hidden border-b py-10 sm:py-14"
              style={{ borderColor: cardBorder }}
            >
              {parsed?.start ? (
                <span
                  aria-hidden
                  className="pointer-events-none absolute -right-2 top-1/2 -translate-y-1/2 select-none text-[clamp(4.5rem,14vw,9rem)] font-bold leading-none tracking-tighter opacity-[0.07]"
                  style={{ color: titleColor }}
                >
                  {parsed.start}
                </span>
              ) : null}

              <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-12">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className="font-mono text-[0.7rem] tabular-nums tracking-widest"
                      style={{ color: accent }}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    {yearLabel ? (
                      <span
                        className={`font-semibold uppercase tracking-[0.2em] ${metaClass}`}
                        style={{ color: bodyColor }}
                      >
                        {yearLabel}
                      </span>
                    ) : null}
                  </div>
                  {title ? (
                    <p
                      className={`mt-4 max-w-4xl font-semibold leading-[1.1] tracking-tight ${entryTitleClass}`}
                      style={{ color: titleColor }}
                    >
                      {title}
                    </p>
                  ) : null}
                </div>

                {institution ? (
                  <p
                    className={`max-w-sm leading-relaxed lg:max-w-xs lg:text-right ${bodyClass}`}
                    style={{ color: bodyColor }}
                  >
                    {institution}
                  </p>
                ) : null}
              </div>

              <div
                className="mt-8 h-px w-12 transition-[width] duration-500 group-hover:w-28"
                style={{ backgroundColor: accent }}
                aria-hidden
              />
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
  titleColor,
  bodyColor,
  accent,
  cardBg,
  cardBorder,
  contentSize,
  sectionClassName = TRAIT_EDUCATION_SECTION_TOP,
}: {
  items: ProfileEducationEntry[];
  contentSize: PortfolioInfoContentSize;
  sectionClassName?: string;
} & TraitEducationColors) {
  const entryTitleClass = infoContentBlockTitleSizeClass(contentSize);
  const bodyClass = infoContentBodySizeClass(contentSize);
  const metaClass = infoContentEducationMetaSizeClass(contentSize);
  const panelBg = `color-mix(in srgb, ${cardBorder} 16%, ${cardBg})`;

  return (
    <section className={sectionClassName}>
      <EducationSectionHeader
        count={items.length}
        titleColor={titleColor}
        bodyColor={bodyColor}
        cardBorder={cardBorder}
        contentSize={contentSize}
      />
      <ul className="mt-10 grid gap-5 sm:grid-cols-2 sm:gap-6 lg:gap-7">
        {items.map((entry, index) => {
          const year = entry.schoolYear?.trim() || '';
          const title = entry.title?.trim() || '';
          const institution = entry.institution?.trim() || '';
          const key = entry.id || `${title}-${year}-${index}`;

          return (
            <li
              key={key}
              className="group flex flex-col rounded-2xl px-6 py-7 transition-[transform] duration-300 ease-out hover:-translate-y-0.5 sm:px-7 sm:py-8"
              style={{ backgroundColor: panelBg }}
            >
              {year ? (
                <p
                  className={`tabular-nums tracking-tight opacity-65 ${metaClass}`}
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
                    className={`leading-relaxed opacity-80 ${bodyClass}`}
                    style={{ color: bodyColor }}
                  >
                    {institution}
                  </p>
                ) : null}
              </div>

              <div
                className="mt-6 h-px w-10 transition-[width] duration-500 ease-out group-hover:w-20"
                style={{ backgroundColor: accent }}
                aria-hidden
              />
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
  contentSize: PortfolioInfoContentSize;
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
  const indexNumClass =
    contentSize === 'sm'
      ? 'text-4xl sm:text-5xl'
      : contentSize === 'lg'
        ? 'text-6xl sm:text-7xl'
        : 'text-5xl sm:text-6xl';

  return (
    <li
      ref={itemRef}
      className={`grid gap-5 py-8 sm:grid-cols-[7rem_minmax(0,1fr)_auto] sm:items-start sm:gap-8 sm:py-10 ${
        scrollShiftEnabled ? '' : staticCascadeClass
      }`}
      style={cascadeStyle}
    >
      <div className="flex shrink-0 flex-col gap-3" style={{ color: bodyColor }}>
        <span
          className={`font-bold leading-none tracking-tighter opacity-25 ${indexNumClass}`}
          style={{ color: titleColor }}
        >
          {String(index + 1).padStart(2, '0')}
        </span>
        {year ? (
          <span
            className={`tabular-nums tracking-tight opacity-80 ${metaClass}`}
            style={{ color: bodyColor }}
          >
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
  titleColor,
  bodyColor,
  accent,
  cardBg,
  cardBorder,
  scrollShiftEnabled = false,
  contentSize,
  sectionClassName = TRAIT_EDUCATION_SECTION_TOP,
}: {
  items: ProfileEducationEntry[];
  scrollShiftEnabled?: boolean;
  contentSize: PortfolioInfoContentSize;
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
      <EducationSectionHeader
        count={items.length}
        titleColor={titleColor}
        bodyColor={bodyColor}
        cardBorder={cardBorder}
        contentSize={contentSize}
      />
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
  titleColor,
  bodyColor,
  accent,
  cardBg,
  cardBorder,
  cascadeScrollShift = false,
  contentSize = 'md',
  sectionClassName = TRAIT_EDUCATION_SECTION_TOP,
}: {
  items: ProfileEducationEntry[];
  style: PortfolioInfoEducationDisplayStyle;
  cascadeScrollShift?: boolean;
  contentSize?: PortfolioInfoContentSize;
  sectionClassName?: string;
} & TraitEducationColors) {
  if (items.length === 0) return null;

  const colors = { titleColor, bodyColor, accent, cardBg, cardBorder };
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
