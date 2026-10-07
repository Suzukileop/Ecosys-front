'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { getApiErrorMessage } from '@/lib/api-error';
import { useAuth } from '@/context/AuthContext';
import {
  ATS_DENSITIES,
  ATS_VARIANTS,
  CV_TEMPLATES,
  DEFAULT_ATS_DENSITY,
  buildCvData,
  cvMissingSections,
  parseAtsDensity,
  parseAtsVariant,
  parseCvTemplate,
  type AtsDensity,
  type AtsVariantId,
  type CvTemplateId,
} from '@/lib/cv-data';
import { CvDocument } from '@/components/portfolio/cv/CvTemplates';
import { CvSectionLabelsPanel } from '@/components/portfolio/cv/CvSectionLabelsPanel';
import { DensityGlyph, TemplateThumb, VariantThumb } from '@/components/portfolio/cv/CvSidebarThumbs';
import { useCvSectionLabels } from '@/components/portfolio/cv/use-cv-section-labels';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import type { CreatorProfileDto } from '@/types/profile';

/** A4 size in CSS pixels (96 dpi). */
const A4_HEIGHT_PX = (297 / 25.4) * 96;
const A4_WIDTH_PX = (210 / 25.4) * 96;
const ZOOM_MIN = 0.3;
const ZOOM_MAX = 2;
const ZOOM_STEP = 0.1;

/** Content-box width of an element, tracked across resizes. */
function useContentWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return { ref, width };
}

function cvHref(template: CvTemplateId, variant: AtsVariantId, density: AtsDensity) {
  if (template !== 'ats') return `/cv?template=${template}`;
  return `/cv?template=ats&variant=${variant}${density === DEFAULT_ATS_DENSITY ? '' : `&density=${density}`}`;
}

/** Number of A4 pages the rendered sheet spans. */
function usePageCount(ready: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);
  useEffect(() => {
    const node = ref.current;
    if (!ready || !node) return;
    const observer = new ResizeObserver(() => {
      const sheet = node.firstElementChild as HTMLElement | null;
      if (sheet) setHeight(sheet.offsetHeight);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [ready]);
  const pages = height ? Math.max(1, Math.ceil((height - 1) / A4_HEIGHT_PX)) : 1;
  return { ref, pages, height };
}

function Step({
  index,
  title,
  aside,
  children,
}: {
  index: string;
  title: string;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section>
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="flex items-baseline gap-3 text-[15px] font-medium tracking-[-0.01em] text-[#111111] dark:text-white">
          <span className="text-[12px] font-normal tabular-nums text-neutral-400 dark:text-neutral-500">{index}</span>
          {title}
        </h2>
        {aside}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function PaperOption({
  active,
  label,
  onClick,
  children,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button type="button" role="radio" aria-checked={active} onClick={onClick} className="min-w-0 text-left">
      <div
        className={`overflow-hidden rounded-[6px] transition-shadow ${
          active
            ? 'ring-2 ring-[#111111] ring-offset-2 ring-offset-white dark:ring-white dark:ring-offset-[#111111]'
            : 'ring-1 ring-black/[0.08] hover:ring-black/25 dark:ring-white/10 dark:hover:ring-white/30'
        }`}
      >
        {children}
      </div>
      <span
        className={`mt-2.5 flex items-center gap-1.5 truncate text-[13px] ${
          active ? 'font-medium text-[#111111] dark:text-white' : 'text-neutral-500 dark:text-neutral-400'
        }`}
      >
        {active ? <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#FF5722]" /> : null}
        {label}
      </span>
    </button>
  );
}

export function CvGeneratorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading } = useAuth();
  const template = parseCvTemplate(searchParams.get('template'));
  const atsVariant = parseAtsVariant(searchParams.get('variant'));
  const atsDensity = parseAtsDensity(searchParams.get('density'));
  const [profile, setProfile] = useState<CreatorProfileDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [labelsOpen, setLabelsOpen] = useState(false);
  const { labels, setLabels, maxLength } = useCvSectionLabels(user?.id);

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace(`/login?redirect=${encodeURIComponent(cvHref(template, atsVariant, atsDensity))}`);
      return;
    }
    let cancelled = false;
    api
      .get<CreatorProfileDto>('/api/creator/profile')
      .then((res) => {
        if (!cancelled) setProfile(res.data);
      })
      .catch((e) => {
        if (!cancelled) setError(getApiErrorMessage(e, 'Unable to load your profile.'));
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once per user; template switches don't refetch
  }, [isLoading, user?.id]);

  const data = useMemo(
    () => (profile ? buildCvData(profile, { fullName: user?.fullName, email: user?.email }) : null),
    [profile, user?.fullName, user?.email],
  );
  const missing = data ? cvMissingSections(data) : [];
  const { ref: sheetRef, pages, height: sheetHeight } = usePageCount(Boolean(data));
  const { ref: mainRef, width: mainWidth } = useContentWidth<HTMLElement>();
  const [zoom, setZoom] = useState<'fit' | number>('fit');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const fitScale = mainWidth ? Math.min(1, Math.max(ZOOM_MIN, mainWidth / A4_WIDTH_PX)) : 1;
  const scale = zoom === 'fit' ? fitScale : zoom;
  const stepZoom = (direction: 1 | -1) => {
    const next = Math.round((scale + direction * ZOOM_STEP) * 10) / 10;
    setZoom(Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, next)));
  };

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setDrawerOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [drawerOpen]);
  const customLabelCount = Object.values(labels).filter((value) => value?.trim()).length;
  const templateInfo = CV_TEMPLATES.find((option) => option.id === template);
  const variantInfo = ATS_VARIANTS.find((variant) => variant.id === atsVariant);

  useEffect(() => {
    if (data) document.title = `${data.fullName} — CV`;
  }, [data]);

  const navigate = (
    nextTemplate: CvTemplateId,
    nextVariant: AtsVariantId = atsVariant,
    nextDensity: AtsDensity = atsDensity,
  ) => {
    router.replace(cvHref(nextTemplate, nextVariant, nextDensity), { scroll: false });
  };

  const backLink = (
    <Link
      href="/studio"
      className="whitespace-nowrap text-[13px] font-medium text-neutral-500 transition-colors hover:text-[#111111] dark:text-neutral-400 dark:hover:text-white"
    >
      ← Portfolio
    </Link>
  );

  const statusBadge = data ? (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap text-[12px] font-medium tabular-nums ${
        pages > 1 ? 'text-[#B45309] dark:text-amber-400' : 'text-neutral-500 dark:text-neutral-400'
      }`}
    >
      <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${pages > 1 ? 'bg-[#D97706]' : 'bg-emerald-500'}`} />
      {pages > 1 ? `${pages} pages` : '1 page · A4'}
    </span>
  ) : null;

  const controls = (
    <>
      <h1 className="text-[34px] font-semibold leading-[1.02] tracking-[-0.04em] text-[#111111] dark:text-white">
        Your resume<span className="text-[#FF5722]">.</span>
      </h1>

      <Step index="01" title="Template">
        <div role="radiogroup" aria-label="CV template" className="grid grid-cols-3 gap-3">
          {CV_TEMPLATES.map((option) => (
            <PaperOption
              key={option.id}
              active={option.id === template}
              label={option.id === 'ats' ? 'ATS' : option.label}
              onClick={() => navigate(option.id)}
            >
              <TemplateThumb id={option.id} />
            </PaperOption>
          ))}
        </div>
        {templateInfo ? (
          <p className="mt-4 text-[13px] leading-relaxed text-neutral-500 dark:text-neutral-400">
            {templateInfo.blurb}
          </p>
        ) : null}
      </Step>

      {template === 'ats' ? (
        <>
          <Step
            index="02"
            title="Layout"
            aside={<span className="text-[13px] text-neutral-500 dark:text-neutral-400">{variantInfo?.label}</span>}
          >
            <div role="radiogroup" aria-label="ATS layout" className="grid grid-cols-3 gap-x-3 gap-y-4">
              {ATS_VARIANTS.map((variant) => (
                <PaperOption
                  key={variant.id}
                  active={variant.id === atsVariant}
                  label={variant.label}
                  onClick={() => navigate('ats', variant.id)}
                >
                  <VariantThumb id={variant.id} />
                </PaperOption>
              ))}
            </div>
            {variantInfo ? (
              <p className="mt-4 text-[13px] leading-relaxed text-neutral-500 dark:text-neutral-400">
                {variantInfo.blurb}
              </p>
            ) : null}
          </Step>

          <Step index="03" title="Spacing">
            <div role="radiogroup" aria-label="Spacing" className="grid grid-cols-4 gap-2">
              {ATS_DENSITIES.map((density) => {
                const active = density.id === atsDensity;
                return (
                  <button
                    key={density.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => navigate('ats', atsVariant, density.id)}
                    className={`flex h-[80px] min-w-0 flex-col items-center justify-center gap-2.5 rounded-[10px] border text-[12.5px] transition-colors ${
                      active
                        ? 'border-[#111111] font-medium text-[#111111] dark:border-white dark:text-white'
                        : 'border-black/[0.08] text-neutral-500 hover:border-black/25 hover:text-[#111111] dark:border-white/[0.1] dark:text-neutral-400 dark:hover:border-white/30 dark:hover:text-white'
                    }`}
                  >
                    <DensityGlyph id={density.id} />
                    {density.label}
                  </button>
                );
              })}
            </div>
            {pages > 1 && atsDensity !== 'tight' ? (
              <p className="mt-4 text-[13px] leading-relaxed text-[#B45309] dark:text-amber-400">
                Switch to Tight to fit everything on one page.
              </p>
            ) : null}
          </Step>
        </>
      ) : null}

      <section>
        <button
          type="button"
          onClick={() => setLabelsOpen((open) => !open)}
          aria-expanded={labelsOpen}
          className="flex w-full items-baseline justify-between text-left"
        >
          <span className="flex items-baseline gap-3 text-[15px] font-medium tracking-[-0.01em] text-[#111111] dark:text-white">
            <span className="text-[12px] font-normal tabular-nums text-neutral-400 dark:text-neutral-500">
              {template === 'ats' ? '04' : '02'}
            </span>
            Section labels
          </span>
          <span className="flex items-center gap-2 text-[13px] text-neutral-500 dark:text-neutral-400">
            {customLabelCount > 0 ? `${customLabelCount} edited` : null}
            <svg
              aria-hidden
              viewBox="0 0 16 16"
              className={`h-4 w-4 transition-transform ${labelsOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="m4 6 4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </button>
        {labelsOpen ? (
          <div className="mt-5">
            <CvSectionLabelsPanel
              template={template}
              atsVariant={atsVariant}
              labels={labels}
              maxLength={maxLength}
              onChange={setLabels}
            />
          </div>
        ) : null}
      </section>

      {missing.length > 0 ? (
        <p className="text-[13px] leading-relaxed text-neutral-500 dark:text-neutral-400">
          Add {missing.join(', ')} in{' '}
          <Link
            href="/studio"
            className="font-medium text-[#111111] underline-offset-4 hover:underline dark:text-white"
          >
            My Portfolio
          </Link>{' '}
          for a more complete CV.
        </p>
      ) : null}
    </>
  );

  const downloadCta = (
    <>
      <button
        type="button"
        onClick={() => window.print()}
        disabled={!data}
        className="flex h-14 w-full items-center justify-between rounded-full bg-[#111111] pl-6 pr-2 text-[15px] font-semibold text-white disabled:opacity-40 dark:bg-white dark:text-[#111111]"
      >
        Download PDF
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FF5722] text-white">
          <svg aria-hidden viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M8 3v9m0 0 3.5-3.5M8 12 4.5 8.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>
      <p className="mt-3 text-center text-[12px] text-neutral-400 dark:text-neutral-500">
        Choose “Save as PDF” in the print dialog.
      </p>
    </>
  );

  return (
    <div className="min-h-screen bg-[#F2F2F2] print:block print:bg-white dark:bg-[#0A0A0A] lg:flex">
      <aside className="hidden shrink-0 flex-col border-r border-black/[0.06] bg-white print:hidden dark:border-white/[0.08] dark:bg-[#111111] lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-[360px]">
        <div className="flex items-center justify-between px-8 pb-2 pt-7">
          {backLink}
          {statusBadge}
        </div>
        <div className="min-h-0 flex-1 space-y-11 overflow-y-auto px-8 pb-10 pt-8">{controls}</div>
        <div className="px-8 pb-7 pt-4">{downloadCta}</div>
      </aside>

      <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-black/[0.06] bg-white/90 px-4 backdrop-blur-xl print:hidden dark:border-white/[0.08] dark:bg-[#111111]/90 sm:px-6 lg:hidden">
        <div className="flex min-w-0 items-center gap-4">
          {backLink}
          <span className="hidden sm:inline-flex">{statusBadge}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-expanded={drawerOpen}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-black/15 px-4 text-[14px] font-medium text-[#111111] dark:border-white/20 dark:text-white"
          >
            <svg
              aria-hidden
              viewBox="0 0 16 16"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M2.5 4.5h6m3 0h2M2.5 11.5h2m3 0h6" strokeLinecap="round" />
              <circle cx="10" cy="4.5" r="1.5" />
              <circle cx="6" cy="11.5" r="1.5" />
            </svg>
            Customize
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            disabled={!data}
            aria-label="Download PDF"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FF5722] text-white disabled:opacity-40"
          >
            <svg
              aria-hidden
              viewBox="0 0 16 16"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M8 3v9m0 0 3.5-3.5M8 12 4.5 8.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </header>

      {drawerOpen ? (
        <div
          className="fixed inset-0 z-40 print:hidden lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Customize resume"
        >
          <button
            type="button"
            aria-label="Close"
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 bg-black/40"
          />
          <div className="absolute inset-x-0 bottom-0 flex max-h-[88vh] flex-col rounded-t-[20px] bg-white dark:bg-[#111111] sm:inset-y-0 sm:left-0 sm:right-auto sm:max-h-none sm:w-[400px] sm:rounded-none">
            <div className="flex items-center justify-between px-6 pb-2 pt-4 sm:px-8 sm:pt-7">
              <span aria-hidden className="mx-auto h-1 w-10 rounded-full bg-black/15 dark:bg-white/20 sm:hidden" />
              <span className="hidden sm:inline-flex">{statusBadge}</span>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close"
                className="absolute right-4 top-3 flex h-9 w-9 items-center justify-center rounded-full text-neutral-500 hover:text-[#111111] dark:text-neutral-400 dark:hover:text-white sm:static"
              >
                <svg
                  aria-hidden
                  viewBox="0 0 16 16"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                >
                  <path d="m4 4 8 8M12 4l-8 8" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="min-h-0 flex-1 space-y-10 overflow-y-auto px-6 pb-8 pt-6 sm:px-8">{controls}</div>
            <div className="border-t border-black/[0.06] px-6 pb-6 pt-4 dark:border-white/[0.08] sm:px-8">
              {downloadCta}
            </div>
          </div>
        </div>
      ) : null}

      <main
        ref={mainRef}
        className="relative min-w-0 flex-1 overflow-x-auto px-4 pb-28 pt-6 print:overflow-visible print:p-0 sm:px-8 sm:pt-10 lg:px-12 lg:pt-14"
      >
        {error ? (
          <p className="text-center text-[15px] text-red-600 dark:text-red-400">{error}</p>
        ) : data ? (
          <div
            className="mx-auto print:!h-auto print:!w-auto"
            style={{ width: A4_WIDTH_PX * scale, height: sheetHeight ? sheetHeight * scale : undefined }}
          >
            <div
              ref={sheetRef}
              className="origin-top-left print:![transform:none]"
              style={{ width: A4_WIDTH_PX, transform: `scale(${scale})` }}
            >
              <CvDocument
                template={template}
                atsVariant={atsVariant}
                atsDensity={atsDensity}
                labels={labels}
                data={data}
              />
            </div>
          </div>
        ) : (
          <div className="flex justify-center py-24">
            <LoadingSpinner />
          </div>
        )}

        {data ? (
          <div className="pointer-events-none fixed inset-x-0 bottom-5 z-20 flex justify-center print:hidden lg:left-[360px]">
            <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-black/[0.08] bg-white/95 p-1 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.25)] backdrop-blur dark:border-white/[0.1] dark:bg-[#1A1A1A]/95">
              <button
                type="button"
                onClick={() => stepZoom(-1)}
                disabled={scale <= ZOOM_MIN}
                aria-label="Zoom out"
                className="flex h-9 w-9 items-center justify-center rounded-full text-[#111111] hover:bg-black/[0.05] disabled:opacity-30 dark:text-white dark:hover:bg-white/[0.08]"
              >
                <svg
                  aria-hidden
                  viewBox="0 0 16 16"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                >
                  <path d="M3.5 8h9" strokeLinecap="round" />
                </svg>
              </button>
              <span className="w-12 text-center text-[13px] font-medium tabular-nums text-[#111111] dark:text-white">
                {Math.round(scale * 100)}%
              </span>
              <button
                type="button"
                onClick={() => stepZoom(1)}
                disabled={scale >= ZOOM_MAX}
                aria-label="Zoom in"
                className="flex h-9 w-9 items-center justify-center rounded-full text-[#111111] hover:bg-black/[0.05] disabled:opacity-30 dark:text-white dark:hover:bg-white/[0.08]"
              >
                <svg
                  aria-hidden
                  viewBox="0 0 16 16"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                >
                  <path d="M3.5 8h9M8 3.5v9" strokeLinecap="round" />
                </svg>
              </button>
              <span aria-hidden className="mx-1 h-5 w-px bg-black/[0.08] dark:bg-white/[0.1]" />
              <button
                type="button"
                onClick={() => setZoom('fit')}
                aria-pressed={zoom === 'fit'}
                className={`h-9 rounded-full px-3.5 text-[13px] font-medium ${
                  zoom === 'fit'
                    ? 'bg-[#111111] text-white dark:bg-white dark:text-[#111111]'
                    : 'text-[#111111] hover:bg-black/[0.05] dark:text-white dark:hover:bg-white/[0.08]'
                }`}
              >
                Fit
              </button>
              <button
                type="button"
                onClick={() => setZoom(1)}
                aria-pressed={zoom === 1}
                className={`h-9 rounded-full px-3.5 text-[13px] font-medium ${
                  zoom === 1
                    ? 'bg-[#111111] text-white dark:bg-white dark:text-[#111111]'
                    : 'text-[#111111] hover:bg-black/[0.05] dark:text-white dark:hover:bg-white/[0.08]'
                }`}
              >
                100%
              </button>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
