'use client';

import { useState } from 'react';
import {
  PortfolioDesignLivePreviewCard,
  usePortfolioDesignPreviewSource,
} from '@/components/portfolio/PortfolioDesignLivePreview';
import { withDesignPreview } from '@/lib/portfolio-design-preview';
import { useContentMediaUpload } from '@/components/creator/creator-content-media';
import { SectionColorModeControl } from '@/components/portfolio/portfolio-section-color-mode-control';
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
import { useT } from '@/lib/i18n/I18nProvider';
import { msg } from '@/lib/i18n/config';
import { SectionHiddenNotice, SettingsGroup, SettingsSwitchRow, SettingsTabs } from '@/components/portfolio/portfolio-settings-ui';

export type AboutUsSubSection = 'general' | 'design' | 'header' | 'background';

const ABOUT_US_SUB_SECTIONS: { id: 'general' | 'design'; label: string }[] = [
  { id: 'general', label: msg('General') },
  { id: 'design', label: msg('Design') },
];

/** About us has two tabs; any other saved id (header, background) opens Design. */
export function normalizeAboutUsSubSection(value: string | undefined): 'general' | 'design' {
  return value === 'general' || value === undefined ? 'general' : 'design';
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
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-2xl border border-[color:var(--pf-palette-bordure)] bg-transparent px-4 py-3">
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-[color:var(--pf-palette-texte-fort)]">{label}</span>
        {description ? <span className="mt-1 block text-sm text-[color:var(--pf-palette-texte-muted)]">{description}</span> : null}
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
      <span className="flex justify-between text-xs font-bold uppercase tracking-[0.16em] text-[color:var(--pf-palette-texte-muted)]">
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
      <span className="pf-stack-block-label">{label}</span>
      <div className="mt-2 flex items-center gap-2">
        <input
          type="color"
          value={hex}
          onChange={(event) => onChange(event.target.value)}
          className="h-10 w-10 shrink-0 cursor-pointer rounded-lg border border-[color:var(--pf-palette-bordure)] bg-transparent p-1"
        />
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-xl border border-[color:var(--pf-palette-bordure)] bg-transparent px-3 py-2.5 text-sm text-[color:var(--pf-palette-texte-fort)]"
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
  const t = useT();
  const slot = quoteSvgSlotIndex(selectedId);
  const custom = (urls[slot] ?? '').trim();
  const { inputRef, uploading, pickFile, onFileChange } = useContentMediaUpload({
    locale: 'fr',
    onUrlChange: (url) => onUrlsChange(patchTuple(urls, slot, url)),
  });

  return (
    <div className="space-y-3">
      <div>
        <p className="pf-stack-block-label">{t('SVG illustration')}</p>
        <p className="mt-1 text-sm text-[color:var(--pf-palette-texte-muted)]">
          {t('One visual on screen at a time. Click to switch between them.')}
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
                  ? 'border-[color:var(--pf-palette-texte-fort)] bg-[color:var(--pf-surface)] ring-2 ring-[color:var(--pf-palette-texte-fort)]'
                  : 'border-[color:var(--pf-palette-bordure)] bg-transparent hover:border-[color:var(--pf-palette-texte-muted)] hover:bg-[color:var(--pf-surface)]'
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
              <p className="mt-2 text-sm font-semibold text-[color:var(--pf-palette-texte-fort)]">{t(option.label)}</p>
            </button>
          );
        })}
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={pickFile}
          disabled={uploading}
          className="flex-1 rounded-xl border border-[color:var(--pf-palette-bordure)] px-3 py-2 text-sm font-semibold text-[color:var(--pf-palette-texte-muted)] hover:border-[color:var(--pf-palette-texte-muted)]"
        >
          {uploading ? t('Uploading…') : t('Replace this one')}
        </button>
        {custom ? (
          <button
            type="button"
            onClick={() => onUrlsChange(patchTuple(urls, slot, ''))}
            className="rounded-xl border border-[color:var(--pf-palette-bordure)] px-3 py-2 text-sm font-semibold text-[color:var(--pf-palette-texte-muted)] hover:border-[color:var(--pf-palette-texte-muted)]"
          >
            {t('Original SVG')}
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
      <span className="pf-stack-block-label">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-xl border border-[color:var(--pf-palette-bordure)] bg-transparent px-3 py-2.5 text-sm text-[color:var(--pf-palette-texte-fort)]"
      />
    </label>
  );
}

export function AboutUsSettingsPanel({
  aboutUs,
  onChange,
  subSection: controlledSubSection,
  onSubSectionChange,
}: {
  aboutUs: PortfolioAboutUsSectionSettings;
  onChange: (patch: Partial<PortfolioAboutUsSectionSettings>) => void;
  subSection?: AboutUsSubSection;
  onSubSectionChange?: (value: AboutUsSubSection) => void;
}) {
  const t = useT();
  const previewSource = usePortfolioDesignPreviewSource();
  const isSplitOverlap = aboutUs.design === 'split-overlap';
  const isSplitFounder = aboutUs.design === 'split-founder';
  const isSplitMediaLeft = aboutUs.design === 'split-media-left';
  const isSplitCard = aboutUs.design === 'split-card';
  const isSplitQuote = aboutUs.design === 'split-quote';
  const usesSplitChrome = aboutUsDesignUsesSplitChrome(aboutUs.design);
  const mediaSide = resolveAboutUsMediaSide(aboutUs.design, aboutUs.mediaSide);
  const [uncontrolledSubSection, setUncontrolledSubSection] = useState<'general' | 'design'>('general');
  const subSection = normalizeAboutUsSubSection(controlledSubSection ?? uncontrolledSubSection);
  const setSubSection = (value: 'general' | 'design') => {
    onSubSectionChange?.(value);
    if (controlledSubSection === undefined) setUncontrolledSubSection(value);
  };

  return (
    <div className="space-y-6">
      <SettingsTabs tabs={ABOUT_US_SUB_SECTIONS} value={subSection} onChange={setSubSection} />

      {subSection === 'general' ? (
        <div>
          <SettingsSwitchRow
            label={t('Show section')}
            description={aboutUs.enabled ? t('Display About us on the public portfolio.') : t('Visitors go straight to the next section.')}
            checked={aboutUs.enabled}
            onChange={(enabled) => onChange({ enabled })}
          />
          {aboutUs.enabled ? (
            <SettingsGroup label={t('Content')}>
      <TextField label={t('Section title')} value={aboutUs.title} onChange={(title) => onChange({ title })} />
      {usesSplitChrome && !isSplitQuote ? null : (
        <TextField
          label={t('Section subtitle')}
          value={aboutUs.subtitle}
          onChange={(subtitle) => onChange({ subtitle })}
        />
      )}

      {usesSplitChrome ? (
        <>
          {isSplitFounder || isSplitCard || isSplitQuote ? (
            <Toggle
              label={t('Show task list')}
              description={t('Hidden by default on this design.')}
              checked={aboutUs.showTasks}
              onChange={(showTasks) => onChange({ showTasks })}
            />
          ) : null}
          <Toggle
            label={t('Show button')}
            description={t('Button under the text. Links to Contact.')}
            checked={aboutUs.showCta}
            onChange={(showCta) => onChange({ showCta })}
          />
          {aboutUs.showCta ? (
            <TextField
              label={t('Button label')}
              value={aboutUs.ctaLabel}
              onChange={(ctaLabel) => onChange({ ctaLabel })}
            />
          ) : null}
          {isSplitOverlap || isSplitMediaLeft || isSplitCard || isSplitQuote ? (
            <Toggle
              label={t('Show quote')}
              checked={aboutUs.showQuote}
              onChange={(showQuote) => onChange({ showQuote })}
            />
          ) : null}
          <Toggle
            label={t('Show founder')}
            checked={aboutUs.showFounder}
            onChange={(showFounder) => onChange({ showFounder })}
          />
          {isSplitFounder && aboutUs.showFounder ? (
            <Toggle
              label={t('Show founder rating')}
              description={t('Stars next to the founder name.')}
              checked={aboutUs.showFounderRating}
              onChange={(showFounderRating) => onChange({ showFounderRating })}
            />
          ) : null}
        </>
      ) : null}

              <p className="text-[13px] leading-5 text-[color:var(--pf-palette-texte-muted)]">
                {t('Title, description, tasks, images, quote, and founder are edited in Information → About us.')}
              </p>
            </SettingsGroup>
          ) : null}
        </div>
      ) : null}

      {subSection === 'design' && !aboutUs.enabled ? (
        <SectionHiddenNotice onEnable={() => onChange({ enabled: true })} />
      ) : null}

      {subSection === 'design' && aboutUs.enabled ? (
        <div>
          <SettingsGroup label={t('Design')}>
      <div>
        {previewSource ? (
          /* In the studio: every design rendered for real, one per row. */
          <div className="flex flex-col gap-3">
            {PORTFOLIO_ABOUT_US_DESIGN_OPTIONS.map((option) => (
              <PortfolioDesignLivePreviewCard
                key={option.value}
                cardClassName="pf-stack-design-card"
                labelClassName="pf-stack-card-label"
                active={option.value === aboutUs.design}
                label={t(option.label)}
                src={withDesignPreview(previewSource.portfolioPath, {
                  section: 'aboutUs',
                  design: option.value as PortfolioAboutUsDesign,
                })}
                settings={previewSource.settings}
                onClick={() => onChange(defaultsForAboutUsDesign(option.value as PortfolioAboutUsDesign))}
              />
            ))}
          </div>
        ) : (
        <div className="grid gap-2">
          {PORTFOLIO_ABOUT_US_DESIGN_OPTIONS.map((option) => {
            const active = option.value === aboutUs.design;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onChange(defaultsForAboutUsDesign(option.value as PortfolioAboutUsDesign))}
                className={`rounded-2xl border px-4 py-3 text-left transition ${
                  active
                    ? 'border-[color:var(--pf-palette-texte-fort)] bg-[color:var(--pf-surface)] ring-2 ring-[color:var(--pf-palette-texte-fort)]'
                    : 'border-[color:var(--pf-palette-bordure)] bg-transparent hover:border-[color:var(--pf-palette-texte-muted)] hover:bg-[color:var(--pf-surface)]'
                }`}
              >
                <p className="text-sm font-semibold text-[color:var(--pf-palette-texte-fort)]">{t(option.label)}</p>
                <p className="mt-1 text-xs leading-relaxed text-[color:var(--pf-palette-texte-muted)]">{t(option.description)}</p>
              </button>
            );
          })}
        </div>
        )}
      </div>

          </SettingsGroup>
          <SettingsGroup label={t('Style')}>
      <SectionColorModeControl
        label={t('Color mode')}
        value={aboutUs.colorModeOverride}
        onChange={(colorModeOverride) => onChange({ colorModeOverride })}
      />

          </SettingsGroup>
          <SettingsGroup label={t('Layout')}>
      {usesSplitChrome ? (
        <>
          <p className="rounded-2xl border border-dashed border-[color:var(--pf-palette-bordure)] bg-transparent px-4 py-3 text-sm text-[color:var(--pf-palette-texte-muted)]">
            {isSplitQuote
              ? t('Pick Photo or SVG on the right (or left). The photo comes from Information → About us.')
              : isSplitCard
              ? t('Everything sits in one large frame. The quote shows by default. Flip the image left or right without changing the design.')
              : isSplitFounder
                ? t('Founder is shown under the button. The task list is hidden unless you turn it on. Flip the image left or right.')
                : isSplitMediaLeft
                  ? t('A large rounded photo on one side, text and list on the other. Flip the image left or right.')
                  : t('Quote and founder stay hidden unless you turn them on. Flip the image left or right.')}
          </p>
          <div>
            <p className="pf-stack-block-label">{t('Image')}</p>
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
                        ? 'border-[color:var(--pf-palette-texte-fort)] bg-[color:var(--pf-surface)] ring-2 ring-[color:var(--pf-palette-texte-fort)]'
                        : 'border-[color:var(--pf-palette-bordure)] bg-transparent hover:border-[color:var(--pf-palette-texte-muted)] hover:bg-[color:var(--pf-surface)]'
                    }`}
                  >
                    {t(option.label)}
                  </button>
                );
              })}
            </div>
          </div>
          {isSplitQuote ? (
            <div>
              <p className="pf-stack-block-label">
                {t('Photo or SVG')}
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
                          ? 'border-[color:var(--pf-palette-texte-fort)] bg-[color:var(--pf-surface)] ring-2 ring-[color:var(--pf-palette-texte-fort)]'
                          : 'border-[color:var(--pf-palette-bordure)] bg-transparent hover:border-[color:var(--pf-palette-texte-muted)] hover:bg-[color:var(--pf-surface)]'
                      }`}
                    >
                      <p className="text-sm font-semibold text-[color:var(--pf-palette-texte-fort)]">{t(option.label)}</p>
                      <p className="mt-1 text-xs leading-relaxed text-[color:var(--pf-palette-texte-muted)]">{t(option.description)}</p>
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
            <p className="pf-stack-block-label">{t('Placement')}</p>
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
                        ? 'border-[color:var(--pf-palette-texte-fort)] bg-[color:var(--pf-surface)] ring-2 ring-[color:var(--pf-palette-texte-fort)]'
                        : 'border-[color:var(--pf-palette-bordure)] bg-transparent hover:border-[color:var(--pf-palette-texte-muted)] hover:bg-[color:var(--pf-surface)]'
                    }`}
                  >
                    {t(option.label)}
                  </button>
                );
              })}
            </div>
          </div>
          <Range
            label={t('Width')}
            value={aboutUs.contentWidthPercent ?? 100}
            min={50}
            max={100}
            onChange={(contentWidthPercent) => onChange({ contentWidthPercent })}
          />
          {isSplitFounder ? (
            <div>
              <p className="pf-stack-block-label">
                {t('Image shape')}
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
                          ? 'border-[color:var(--pf-palette-texte-fort)] bg-[color:var(--pf-surface)] ring-2 ring-[color:var(--pf-palette-texte-fort)]'
                          : 'border-[color:var(--pf-palette-bordure)] bg-transparent hover:border-[color:var(--pf-palette-texte-muted)] hover:bg-[color:var(--pf-surface)]'
                      }`}
                    >
                      <p className="text-sm font-semibold text-[color:var(--pf-palette-texte-fort)]">{t(option.label)}</p>
                      <p className="mt-1 text-xs leading-relaxed text-[color:var(--pf-palette-texte-muted)]">{t(option.description)}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
          {isSplitCard || isSplitQuote ? (
            <div className="space-y-5">
              <p className="pf-stack-block-label">
                {isSplitQuote ? t('Quote card') : t('Frame')}
              </p>
              <div>
                <p className="text-xs font-semibold text-[color:var(--pf-palette-texte-muted)]">{t('Rounding')}</p>
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
                            ? 'border-[color:var(--pf-palette-texte-fort)] bg-[color:var(--pf-surface)] ring-2 ring-[color:var(--pf-palette-texte-fort)]'
                            : 'border-[color:var(--pf-palette-bordure)] bg-transparent hover:border-[color:var(--pf-palette-texte-muted)] hover:bg-[color:var(--pf-surface)]'
                        }`}
                      >
                        {t(option.label)}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-[color:var(--pf-palette-texte-muted)]">{t('Shadow')}</p>
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
                            ? 'border-[color:var(--pf-palette-texte-fort)] bg-[color:var(--pf-surface)] ring-2 ring-[color:var(--pf-palette-texte-fort)]'
                            : 'border-[color:var(--pf-palette-bordure)] bg-transparent hover:border-[color:var(--pf-palette-texte-muted)] hover:bg-[color:var(--pf-surface)]'
                        }`}
                      >
                        {t(option.label)}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-[color:var(--pf-palette-texte-muted)]">{t('Border')}</p>
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
                            ? 'border-[color:var(--pf-palette-texte-fort)] bg-[color:var(--pf-surface)] ring-2 ring-[color:var(--pf-palette-texte-fort)]'
                            : 'border-[color:var(--pf-palette-bordure)] bg-transparent hover:border-[color:var(--pf-palette-texte-muted)] hover:bg-[color:var(--pf-surface)]'
                        }`}
                      >
                        {t(option.label)}
                      </button>
                    );
                  })}
                </div>
              </div>
              {isSplitQuote ? (
                <Toggle
                  label={t('Quote background')}
                  description={t('Untick for a transparent background. The border stays.')}
                  checked={aboutUs.cardBackgroundEnabled !== false}
                  onChange={(cardBackgroundEnabled) => onChange({ cardBackgroundEnabled })}
                />
              ) : null}
              {isSplitQuote && aboutUs.cardBackgroundEnabled === false ? null : (
                <ColorField
                  label={isSplitQuote ? t('Background colour') : t('Frame background')}
                  value={aboutUs.cardBackgroundColor ?? '#ffffff'}
                  onChange={(cardBackgroundColor) => onChange({ cardBackgroundColor })}
                />
              )}
              {(aboutUs.cardBorder ?? 'thin') !== 'none' ? (
                <ColorField
                  label={t('Border colour')}
                  value={aboutUs.cardBorderColor ?? '#e5e7eb'}
                  onChange={(cardBorderColor) => onChange({ cardBorderColor })}
                />
              ) : null}
            </div>
          ) : null}
        </>
      ) : (
        <div>
          <p className="pf-stack-block-label">
            {t('Title / content layout')}
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
                      ? 'border-[color:var(--pf-palette-texte-fort)] bg-[color:var(--pf-surface)] ring-2 ring-[color:var(--pf-palette-texte-fort)]'
                      : 'border-[color:var(--pf-palette-bordure)] bg-transparent hover:border-[color:var(--pf-palette-texte-muted)] hover:bg-[color:var(--pf-surface)]'
                  }`}
                >
                  <p className="text-sm font-semibold text-[color:var(--pf-palette-texte-fort)]">{t(option.label)}</p>
                  <p className="mt-1 text-xs leading-relaxed text-[color:var(--pf-palette-texte-muted)]">{t(option.description)}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}

          </SettingsGroup>
        </div>
      ) : null}
    </div>
  );
}
