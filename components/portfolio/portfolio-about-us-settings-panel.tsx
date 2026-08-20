'use client';

import { useContentMediaUpload } from '@/components/creator/creator-content-media';
import {
  AboutUsQuoteSvg,
  DEFAULT_ABOUT_US_QUOTE_SVG_URLS,
  PORTFOLIO_ABOUT_US_QUOTE_SVG_OPTIONS,
  quoteSvgSlotIndex,
  type AboutUsQuoteSvgId,
} from '@/components/portfolio/about-us-quote-svgs';
import {
  aboutUsDesignUsesSplitChrome,
  defaultsForAboutUsDesign,
  PORTFOLIO_ABOUT_US_CARD_BORDER_OPTIONS,
  PORTFOLIO_ABOUT_US_CARD_RADIUS_OPTIONS,
  PORTFOLIO_ABOUT_US_CARD_SHADOW_OPTIONS,
  PORTFOLIO_ABOUT_US_CONTENT_PLACEMENT_OPTIONS,
  PORTFOLIO_ABOUT_US_DESIGN_OPTIONS,
  PORTFOLIO_ABOUT_US_IMAGE_FRAME_OPTIONS,
  PORTFOLIO_ABOUT_US_MEDIA_SIDE_OPTIONS,
  PORTFOLIO_ABOUT_US_QUOTE_MEDIA_OPTIONS,
  PORTFOLIO_ABOUT_US_SECTION_LAYOUT_OPTIONS,
  resolveAboutUsMediaSide,
  type PortfolioAboutUsCardBorder,
  type PortfolioAboutUsCardRadius,
  type PortfolioAboutUsCardShadow,
  type PortfolioAboutUsContentPlacement,
  type PortfolioAboutUsDesign,
  type PortfolioAboutUsImageFrame,
  type PortfolioAboutUsMediaSide,
  type PortfolioAboutUsQuoteMedia,
  type PortfolioAboutUsSectionLayout,
  type PortfolioAboutUsSectionSettings,
} from '@/components/portfolio/portfolio-about-us-settings';

export type AboutUsSubSection = 'general' | 'header' | 'background';

export function normalizeAboutUsSubSection(value: string | undefined): AboutUsSubSection {
  return value === 'header' || value === 'background' ? value : 'general';
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-2xl border border-neutral-200 bg-white px-4 py-3">
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-neutral-900">{label}</span>
        {description ? <span className="mt-1 block text-sm text-neutral-500">{description}</span> : null}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 h-4 w-4 shrink-0 accent-[#EA580C]"
      />
    </label>
  );
}

function Range({
  label,
  value,
  min,
  max,
  onChange,
  suffix = '%',
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  suffix?: string;
}) {
  return (
    <label className="block">
      <span className="flex justify-between text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
        <span>{label}</span>
        <span>
          {value}
          {suffix}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-3 w-full accent-neutral-950"
      />
    </label>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const hex = /^#[0-9A-Fa-f]{6}$/.test(value) ? value : '#e5e7eb';
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-500">{label}</span>
      <div className="mt-2 flex items-center gap-2">
        <input
          type="color"
          value={hex}
          onChange={(event) => onChange(event.target.value)}
          className="h-10 w-10 shrink-0 cursor-pointer rounded-lg border border-neutral-200 bg-white p-1"
        />
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900"
        />
      </div>
    </label>
  );
}

function patchTuple<T>(values: [T, T, T, T], index: number, value: T): [T, T, T, T] {
  const next: [T, T, T, T] = [values[0], values[1], values[2], values[3]];
  next[index] = value;
  return next;
}

function QuoteSvgEditor({
  selectedId,
  urls,
  accent,
  onSelectId,
  onUrlsChange,
}: {
  selectedId: AboutUsQuoteSvgId;
  urls: [string, string, string, string];
  accent: string;
  onSelectId: (id: AboutUsQuoteSvgId) => void;
  onUrlsChange: (urls: [string, string, string, string]) => void;
}) {
  const slot = quoteSvgSlotIndex(selectedId);
  const custom = (urls[slot] ?? '').trim();
  const { inputRef, uploading, pickFile, onFileChange } = useContentMediaUpload({
    locale: 'fr',
    onUrlChange: (url) => onUrlsChange(patchTuple(urls, slot, url)),
  });

  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Illustration SVG</p>
        <p className="mt-1 text-sm text-neutral-500">
          Un seul visuel à l’écran. Cliquez pour passer de l’un à l’autre.
        </p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/svg+xml,.svg"
        className="hidden"
        onChange={onFileChange}
      />
      <div className="grid grid-cols-2 gap-2">
        {PORTFOLIO_ABOUT_US_QUOTE_SVG_OPTIONS.map((option) => {
          const active = option.value === selectedId;
          const optionCustom = (urls[quoteSvgSlotIndex(option.value)] ?? '').trim();
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onSelectId(option.value)}
              className={`rounded-2xl border p-3 text-left transition ${
                active
                  ? 'border-neutral-900 bg-neutral-50 ring-2 ring-neutral-900/10'
                  : 'border-neutral-200/80 bg-white hover:border-neutral-300 hover:bg-neutral-50/80'
              }`}
            >
              <span
                className="flex h-16 w-full items-center justify-center"
                style={{
                  color: accent,
                  ['--about-us-ink' as string]: '#171717',
                  ['--about-us-surface' as string]: '#ffffff',
                }}
              >
                {optionCustom ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={optionCustom} alt="" className="h-14 w-14 rounded-xl object-cover" />
                ) : (
                  <span className="h-14 w-14">
                    <AboutUsQuoteSvg id={option.value} />
                  </span>
                )}
              </span>
              <p className="mt-2 text-sm font-semibold text-neutral-950">{option.label}</p>
            </button>
          );
        })}
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={pickFile}
          disabled={uploading}
          className="flex-1 rounded-xl border border-neutral-200 px-3 py-2 text-sm font-semibold text-neutral-700 hover:border-neutral-300"
        >
          {uploading ? 'Téléversement…' : 'Remplacer celui-ci'}
        </button>
        {custom ? (
          <button
            type="button"
            onClick={() => onUrlsChange(patchTuple(urls, slot, ''))}
            className="rounded-xl border border-neutral-200 px-3 py-2 text-sm font-semibold text-neutral-500 hover:border-neutral-300"
          >
            SVG d’origine
          </button>
        ) : null}
      </div>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-500">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900"
      />
    </label>
  );
}

export function AboutUsSettingsPanel({
  aboutUs,
  onChange,
}: {
  aboutUs: PortfolioAboutUsSectionSettings;
  onChange: (patch: Partial<PortfolioAboutUsSectionSettings>) => void;
  subSection?: AboutUsSubSection;
  onSubSectionChange?: (value: AboutUsSubSection) => void;
}) {
  const isSplitOverlap = aboutUs.design === 'split-overlap';
  const isSplitFounder = aboutUs.design === 'split-founder';
  const isSplitMediaLeft = aboutUs.design === 'split-media-left';
  const isSplitCard = aboutUs.design === 'split-card';
  const isSplitQuote = aboutUs.design === 'split-quote';
  const usesSplitChrome = aboutUsDesignUsesSplitChrome(aboutUs.design);
  const mediaSide = resolveAboutUsMediaSide(aboutUs.design, aboutUs.mediaSide);

  return (
    <div className="space-y-6">
      <Toggle
        label="Show section"
        description="Display About us on the public portfolio."
        checked={aboutUs.enabled}
        onChange={(enabled) => onChange({ enabled })}
      />

      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Design</p>
        <div className="mt-3 grid gap-2">
          {PORTFOLIO_ABOUT_US_DESIGN_OPTIONS.map((option) => {
            const active = option.value === aboutUs.design;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onChange(defaultsForAboutUsDesign(option.value as PortfolioAboutUsDesign))}
                className={`rounded-2xl border px-4 py-3 text-left transition ${
                  active
                    ? 'border-neutral-900 bg-neutral-50 ring-2 ring-neutral-900/10'
                    : 'border-neutral-200/80 bg-white hover:border-neutral-300 hover:bg-neutral-50/80'
                }`}
              >
                <p className="text-sm font-semibold text-neutral-950">{option.label}</p>
                <p className="mt-1 text-xs leading-relaxed text-neutral-500">{option.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {usesSplitChrome ? (
        <>
          <p className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-500">
            {isSplitQuote
              ? 'Choisissez Photo ou SVG à droite (ou à gauche). La photo vient d’Information → About us.'
              : isSplitCard
              ? 'Tout tient dans un grand cadre. La quote s’affiche par défaut. Inversez l’image à gauche ou à droite sans changer de design.'
              : isSplitFounder
                ? 'Founder is shown under the button. The task list is hidden unless you turn it on. Inversez l’image à gauche ou à droite.'
                : isSplitMediaLeft
                  ? 'Grande photo arrondie d’un côté, texte et liste de l’autre. Inversez l’image à gauche ou à droite.'
                  : 'Quote and founder stay hidden unless you turn them on. Inversez l’image à gauche ou à droite.'}
          </p>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Image</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {PORTFOLIO_ABOUT_US_MEDIA_SIDE_OPTIONS.map((option) => {
                const active = option.value === mediaSide;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => onChange({ mediaSide: option.value as PortfolioAboutUsMediaSide })}
                    className={`rounded-2xl border px-3 py-2.5 text-sm font-semibold transition ${
                      active
                        ? 'border-neutral-900 bg-neutral-50 ring-2 ring-neutral-900/10'
                        : 'border-neutral-200/80 bg-white hover:border-neutral-300 hover:bg-neutral-50/80'
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
          {isSplitQuote ? (
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                Photo ou SVG
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {PORTFOLIO_ABOUT_US_QUOTE_MEDIA_OPTIONS.map((option) => {
                  const active = (aboutUs.quoteMedia ?? 'svg') === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => onChange({ quoteMedia: option.value as PortfolioAboutUsQuoteMedia })}
                      className={`rounded-2xl border px-4 py-3 text-left transition ${
                        active
                          ? 'border-neutral-900 bg-neutral-50 ring-2 ring-neutral-900/10'
                          : 'border-neutral-200/80 bg-white hover:border-neutral-300 hover:bg-neutral-50/80'
                      }`}
                    >
                      <p className="text-sm font-semibold text-neutral-950">{option.label}</p>
                      <p className="mt-1 text-xs leading-relaxed text-neutral-500">{option.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
          {isSplitQuote && (aboutUs.quoteMedia ?? 'svg') === 'svg' ? (
            <QuoteSvgEditor
              selectedId={aboutUs.quoteSvgId ?? 'globe'}
              urls={aboutUs.quoteSvgUrls ?? DEFAULT_ABOUT_US_QUOTE_SVG_URLS}
              accent={aboutUs.accentColor}
              onSelectId={(quoteSvgId) => onChange({ quoteSvgId })}
              onUrlsChange={(quoteSvgUrls) => onChange({ quoteSvgUrls })}
            />
          ) : null}
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Placement</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {PORTFOLIO_ABOUT_US_CONTENT_PLACEMENT_OPTIONS.map((option) => {
                const active = option.value === (aboutUs.contentPlacement ?? 'left');
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      onChange({ contentPlacement: option.value as PortfolioAboutUsContentPlacement })
                    }
                    className={`rounded-2xl border px-3 py-2.5 text-sm font-semibold transition ${
                      active
                        ? 'border-neutral-900 bg-neutral-50 ring-2 ring-neutral-900/10'
                        : 'border-neutral-200/80 bg-white hover:border-neutral-300 hover:bg-neutral-50/80'
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
          <Range
            label="Largeur"
            value={aboutUs.contentWidthPercent ?? 100}
            min={50}
            max={100}
            onChange={(contentWidthPercent) => onChange({ contentWidthPercent })}
          />
          {isSplitFounder ? (
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                Forme de l’image
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {PORTFOLIO_ABOUT_US_IMAGE_FRAME_OPTIONS.map((option) => {
                  const active = option.value === (aboutUs.imageFrame ?? 'layered');
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        onChange({ imageFrame: option.value as PortfolioAboutUsImageFrame })
                      }
                      className={`rounded-2xl border px-4 py-3 text-left transition ${
                        active
                          ? 'border-neutral-900 bg-neutral-50 ring-2 ring-neutral-900/10'
                          : 'border-neutral-200/80 bg-white hover:border-neutral-300 hover:bg-neutral-50/80'
                      }`}
                    >
                      <p className="text-sm font-semibold text-neutral-950">{option.label}</p>
                      <p className="mt-1 text-xs leading-relaxed text-neutral-500">{option.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
          {isSplitCard || isSplitQuote ? (
            <div className="space-y-5">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                {isSplitQuote ? 'Carte quote' : 'Cadre'}
              </p>
              <div>
                <p className="text-xs font-semibold text-neutral-500">Arrondi</p>
                <div className="mt-2 grid grid-cols-5 gap-2">
                  {PORTFOLIO_ABOUT_US_CARD_RADIUS_OPTIONS.map((option) => {
                    const active = option.value === (aboutUs.cardRadius ?? 'lg');
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => onChange({ cardRadius: option.value as PortfolioAboutUsCardRadius })}
                        className={`rounded-2xl border px-2 py-2.5 text-sm font-semibold transition ${
                          active
                            ? 'border-neutral-900 bg-neutral-50 ring-2 ring-neutral-900/10'
                            : 'border-neutral-200/80 bg-white hover:border-neutral-300 hover:bg-neutral-50/80'
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-neutral-500">Ombre</p>
                <div className="mt-2 grid grid-cols-4 gap-2">
                  {PORTFOLIO_ABOUT_US_CARD_SHADOW_OPTIONS.map((option) => {
                    const active = option.value === (aboutUs.cardShadow ?? 'medium');
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => onChange({ cardShadow: option.value as PortfolioAboutUsCardShadow })}
                        className={`rounded-2xl border px-2 py-2.5 text-sm font-semibold transition ${
                          active
                            ? 'border-neutral-900 bg-neutral-50 ring-2 ring-neutral-900/10'
                            : 'border-neutral-200/80 bg-white hover:border-neutral-300 hover:bg-neutral-50/80'
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-neutral-500">Bordure</p>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {PORTFOLIO_ABOUT_US_CARD_BORDER_OPTIONS.map((option) => {
                    const active = option.value === (aboutUs.cardBorder ?? 'thin');
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => onChange({ cardBorder: option.value as PortfolioAboutUsCardBorder })}
                        className={`rounded-2xl border px-2 py-2.5 text-sm font-semibold transition ${
                          active
                            ? 'border-neutral-900 bg-neutral-50 ring-2 ring-neutral-900/10'
                            : 'border-neutral-200/80 bg-white hover:border-neutral-300 hover:bg-neutral-50/80'
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              {isSplitQuote ? (
                <Toggle
                  label="Fond de la quote"
                  description="Décochez pour un fond transparent. La bordure reste."
                  checked={aboutUs.cardBackgroundEnabled !== false}
                  onChange={(cardBackgroundEnabled) => onChange({ cardBackgroundEnabled })}
                />
              ) : null}
              {isSplitQuote && aboutUs.cardBackgroundEnabled === false ? null : (
                <ColorField
                  label={isSplitQuote ? 'Couleur du fond' : 'Fond du cadre'}
                  value={aboutUs.cardBackgroundColor ?? '#ffffff'}
                  onChange={(cardBackgroundColor) => onChange({ cardBackgroundColor })}
                />
              )}
              {(aboutUs.cardBorder ?? 'thin') !== 'none' ? (
                <ColorField
                  label="Couleur de bordure"
                  value={aboutUs.cardBorderColor ?? '#e5e7eb'}
                  onChange={(cardBorderColor) => onChange({ cardBorderColor })}
                />
              ) : null}
            </div>
          ) : null}
        </>
      ) : (
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
            Disposition titre / contenu
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {PORTFOLIO_ABOUT_US_SECTION_LAYOUT_OPTIONS.map((option) => {
              const active = option.value === aboutUs.sectionLayout;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onChange({ sectionLayout: option.value as PortfolioAboutUsSectionLayout })}
                  className={`rounded-2xl border px-4 py-3 text-left transition ${
                    active
                      ? 'border-neutral-900 bg-neutral-50 ring-2 ring-neutral-900/10'
                      : 'border-neutral-200/80 bg-white hover:border-neutral-300 hover:bg-neutral-50/80'
                  }`}
                >
                  <p className="text-sm font-semibold text-neutral-950">{option.label}</p>
                  <p className="mt-1 text-xs leading-relaxed text-neutral-500">{option.description}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <TextField label="Section title" value={aboutUs.title} onChange={(title) => onChange({ title })} />
      {usesSplitChrome && !isSplitQuote ? null : (
        <TextField
          label="Section subtitle"
          value={aboutUs.subtitle}
          onChange={(subtitle) => onChange({ subtitle })}
        />
      )}

      {usesSplitChrome ? (
        <>
          {isSplitFounder || isSplitCard || isSplitQuote ? (
            <Toggle
              label="Show task list"
              description="Hidden by default on this design."
              checked={aboutUs.showTasks}
              onChange={(showTasks) => onChange({ showTasks })}
            />
          ) : null}
          <Toggle
            label="Show button"
            description="Button under the text. Links to Contact."
            checked={aboutUs.showCta}
            onChange={(showCta) => onChange({ showCta })}
          />
          {aboutUs.showCta ? (
            <TextField
              label="Button label"
              value={aboutUs.ctaLabel}
              onChange={(ctaLabel) => onChange({ ctaLabel })}
            />
          ) : null}
          {isSplitOverlap || isSplitMediaLeft || isSplitCard || isSplitQuote ? (
            <Toggle
              label="Show quote"
              checked={aboutUs.showQuote}
              onChange={(showQuote) => onChange({ showQuote })}
            />
          ) : null}
          <Toggle
            label="Show founder"
            checked={aboutUs.showFounder}
            onChange={(showFounder) => onChange({ showFounder })}
          />
          {isSplitFounder && aboutUs.showFounder ? (
            <Toggle
              label="Show founder rating"
              description="Stars next to the founder name."
              checked={aboutUs.showFounderRating}
              onChange={(showFounderRating) => onChange({ showFounderRating })}
            />
          ) : null}
        </>
      ) : null}

      <p className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-500">
        Title, description, tasks, images, quote, and founder are edited in Information → About us.
      </p>
    </div>
  );
}
