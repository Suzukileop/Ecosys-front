'use client';

import { HeaderElementToggles } from '@/components/portfolio/portfolio-header-style-controls';
import { useId, useState, type CSSProperties, type ReactNode } from 'react';
import {
  PortfolioDesignLivePreviewCard,
  usePortfolioDesignPreviewSource,
} from '@/components/portfolio/PortfolioDesignLivePreview';
import { withDesignPreview } from '@/lib/portfolio-design-preview';
import { SectionColorModeControl } from '@/components/portfolio/portfolio-section-color-mode-control';
import { PORTFOLIO_EXPERIENCE_CARDS_BORDER_RADIUS_OPTIONS, PORTFOLIO_EXPERIENCE_CARDS_CARD_WIDTH_OPTIONS, PORTFOLIO_EXPERIENCE_CARDS_TITLE_SIZE_OPTIONS, PORTFOLIO_EXPERIENCE_CARDS_ELEMENT_SPACING_OPTIONS, PORTFOLIO_EXPERIENCE_CARDS_VERTICAL_GAP_OPTIONS, PORTFOLIO_EXPERIENCE_CARDS_TASKS_GAP_OPTIONS, PORTFOLIO_EXPERIENCE_DESIGN_OPTIONS, PORTFOLIO_EXPERIENCE_DUOTONE_FRAME_COLOR_OPTIONS, PORTFOLIO_EXPERIENCE_DUOTONE_FRAME_RADIUS_OPTIONS, PORTFOLIO_EXPERIENCE_DUOTONE_THUMBNAIL_EFFECT_OPTIONS, PORTFOLIO_EXPERIENCE_DUOTONE_THUMBNAIL_HEIGHT_OPTIONS, PORTFOLIO_EXPERIENCE_DUOTONE_STICKY_VERTICAL_GAP_OPTIONS, PORTFOLIO_EXPERIENCE_DUOTONE_REPO_CTA_MODE_OPTIONS, PORTFOLIO_EXPERIENCE_DUOTONE_SCROLL_MODE_OPTIONS, PORTFOLIO_EXPERIENCE_DUOTONE_SLIDE_NAV_STYLE_OPTIONS, PORTFOLIO_EXPERIENCE_ENTRY_EXPAND_MODE_OPTIONS, PORTFOLIO_EXPERIENCE_EDITORIAL_DETAIL_LAYOUT_OPTIONS, PORTFOLIO_EXPERIENCE_GALLERY_COLUMNS_OPTIONS, PORTFOLIO_EXPERIENCE_GALLERY_THUMBNAIL_FIT_OPTIONS, PORTFOLIO_EXPERIENCE_GALLERY_BIG_TITLE_STYLE_OPTIONS, PORTFOLIO_EXPERIENCE_GALLERY_BIG_TITLE_COLOR_OPTIONS, PORTFOLIO_EXPERIENCE_GALLERY_HEADER_ANIMATION_STYLE_OPTIONS, PORTFOLIO_EXPERIENCE_GALLERY_SECONDARY_TITLE_STYLE_OPTIONS, PORTFOLIO_EXPERIENCE_GALLERY_ROLE_COUNT_STYLE_OPTIONS, PORTFOLIO_EXPERIENCE_LOFT_THUMBNAIL_FIT_OPTIONS, PORTFOLIO_EXPERIENCE_LOFT_HOVER_EFFECT_OPTIONS, PORTFOLIO_EXPERIENCE_LOFT_COLUMNS_OPTIONS, PORTFOLIO_EXPERIENCE_ITEM_GAP_OPTIONS, PORTFOLIO_EXPERIENCE_LEGACY_FIXED_SIDE_OPTIONS, PORTFOLIO_EXPERIENCE_LEGACY_ITEM_GAP_OPTIONS, PORTFOLIO_EXPERIENCE_LEGACY_THUMBNAIL_HEIGHT_OPTIONS, PORTFOLIO_EXPERIENCE_LEGACY_THUMBNAIL_WIDTH_OPTIONS, PORTFOLIO_EXPERIENCE_LEGACY_ANIMATION_STYLE_OPTIONS, PORTFOLIO_EXPERIENCE_LEGACY_PREFIX_WEIGHT_OPTIONS, PORTFOLIO_EXPERIENCE_LEGACY_ACCENT_STYLE_OPTIONS, PORTFOLIO_EXPERIENCE_LEGACY_ACCENT_SIZE_OPTIONS, PORTFOLIO_EXPERIENCE_LEGACY_UNDERLINE_STYLE_OPTIONS, PORTFOLIO_EXPERIENCE_LEGACY_SUBTITLE_STYLE_OPTIONS, PORTFOLIO_EXPERIENCE_PRESS_ANIMATION_STYLE_OPTIONS, PORTFOLIO_EXPERIENCE_PRESS_HEADING_WEIGHT_STYLE_OPTIONS, PORTFOLIO_EXPERIENCE_PRESS_SUBTITLE_STYLE_OPTIONS, PORTFOLIO_EXPERIENCE_PRESS_HEADING_ALIGNMENT_OPTIONS, PORTFOLIO_EXPERIENCE_PRESS_PARALLAX_INTENSITY_OPTIONS, PORTFOLIO_EXPERIENCE_PERIOD_DESIGN_OPTIONS, PORTFOLIO_EXPERIENCE_REPO_LINK_STYLE_OPTIONS, PORTFOLIO_EXPERIENCE_LINK_ARROW_STYLE_OPTIONS, PORTFOLIO_EXPERIENCE_REEL_STATUS_STYLE_OPTIONS, PORTFOLIO_EXPERIENCE_REEL_SCROLL_MOTION_OPTIONS, PORTFOLIO_EXPERIENCE_TASKS_DISPLAY_OPTIONS, PORTFOLIO_EXPERIENCE_TOOLS_BADGE_STYLE_OPTIONS, DEFAULT_EXPERIENCE_BLOCK_LABEL_VISIBILITY, DEFAULT_ACCENT_YEARS_BADGE_TEXT, DEFAULT_ACCENT_YEARS_LEAD_TEXT, DEFAULT_CENTERED_TITLE_TEXT, DEFAULT_CENTERED_LEAD_TEXT, DEFAULT_SERIF_LEAD_LABEL_TEXT, DEFAULT_SERIF_LEAD_TITLE_TEXT, PORTFOLIO_EXPERIENCE_ACCENT_YEARS_SIZE_OPTIONS, PORTFOLIO_EXPERIENCE_ACCENT_YEARS_RADIUS_OPTIONS, PORTFOLIO_EXPERIENCE_ACCENT_YEARS_COLOR_OPTIONS, PORTFOLIO_EXPERIENCE_CENTERED_ALIGN_OPTIONS, PORTFOLIO_EXPERIENCE_CENTERED_WEIGHT_OPTIONS, PORTFOLIO_EXPERIENCE_CENTERED_OPACITY_OPTIONS, PORTFOLIO_EXPERIENCE_CENTERED_SCALE_OPTIONS, PORTFOLIO_EXPERIENCE_CENTERED_WIDTH_OPTIONS, PORTFOLIO_EXPERIENCE_CENTERED_LEADING_OPTIONS, PORTFOLIO_EXPERIENCE_CENTERED_DIVIDER_OPTIONS, PORTFOLIO_EXPERIENCE_CENTERED_DIVIDER_OPACITY_OPTIONS, PORTFOLIO_EXPERIENCE_SERIF_LEAD_INK_OPTIONS, PORTFOLIO_EXPERIENCE_SERIF_LEAD_TRACKING_OPTIONS, PORTFOLIO_EXPERIENCE_SERIF_LEAD_LABEL_OPACITY_OPTIONS, PORTFOLIO_EXPERIENCE_MARQUEE_STYLE_OPTIONS, PORTFOLIO_EXPERIENCE_MARQUEE_DIRECTION_OPTIONS, PORTFOLIO_EXPERIENCE_MARQUEE_SPEED_OPTIONS, PORTFOLIO_EXPERIENCE_MARQUEE_FADE_OPTIONS, PORTFOLIO_EXPERIENCE_MARQUEE_SEPARATOR_OPTIONS, PORTFOLIO_EXPERIENCE_MARQUEE_WEIGHT_OPTIONS, CENTERED_LEAD_WEIGHT, CENTERED_LEAD_OPACITY, SERIF_LEAD_WEIGHT, SERIF_LEAD_LABEL_OPACITY, MARQUEE_WEIGHT, MARQUEE_FILL_OPACITY, type PortfolioExperienceCardsBorderRadius, type PortfolioExperienceGalleryColumns, type PortfolioExperienceItemGap, type PortfolioExperienceLoftColumns, type PortfolioExperienceLoftHoverEffect, type PortfolioExperienceCenteredAlign, type PortfolioExperienceCenteredDivider, type PortfolioExperienceCenteredLineHeight, type PortfolioExperienceCenteredMaxWidth, type PortfolioExperienceSerifLeadInk, type PortfolioExperienceSerifLeadTracking, type PortfolioExperienceDesign, type PortfolioExperienceHeaderDesign, type PortfolioExperienceAccentYearsBadgeColor, type PortfolioExperienceLinkArrowStyle, type PortfolioExperienceRepoLinkStyle, type PortfolioExperienceSectionSettings, type PortfolioExperienceTasksDisplay, type PortfolioExperienceToolsBadgeStyle, PORTFOLIO_EXPERIENCE_PREMIUM_FONT_SIZE_OPTIONS } from '@/components/portfolio/portfolio-experience-settings';
import {
  experienceLinkButtonPalette,
  PortfolioLinkArrowProvider,
  PortfolioLinkButton,
} from '@/components/portfolio/portfolio-link-buttons';
import { SettingRow, SettingsRowsScope, useSettingsRows } from '@/components/portfolio/portfolio-settings-rows';
import { useT } from '@/lib/i18n/I18nProvider';
import { msg } from '@/lib/i18n/config';
import { SectionHiddenNotice, SettingsGroup, SettingsSwitchRow, SettingsTabs } from '@/components/portfolio/portfolio-settings-ui';

export type ExperienceSubSection = 'general' | 'header' | 'design';

type ExperienceHeaderApplyDesign = Exclude<
  PortfolioExperienceHeaderDesign,
  'none' | 'cards' | 'duotone'
>;

function MiniSlide({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 120 72" className="pf-exp-mini h-[4.35rem] w-full" aria-hidden>
      <rect className="pf-exp-mini-stage" x="1.25" y="1.25" width="117.5" height="69.5" rx="9" />
      {children}
    </svg>
  );
}

function MiniType({
  x,
  y,
  children,
  size = 8,
  anchor = 'start',
}: {
  x: number;
  y: number;
  children: string;
  size?: number;
  anchor?: 'start' | 'middle' | 'end';
}) {
  return (
    <text
      className="pf-exp-mini-type"
      x={x}
      y={y}
      fontSize={size}
      fontWeight={700}
      letterSpacing="0.14em"
      textAnchor={anchor}
    >
      {children}
    </text>
  );
}

function ExperiencePickerCard({
  active,
  label,
  onClick,
  children,
  showLabel = true,
  compact = false,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  children: ReactNode;
  showLabel?: boolean;
  /** Smaller padding/type for secondary preview-card grids (e.g. Thumbnail corners). */
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={label}
      title={label}
      data-active={active ? 'true' : 'false'}
      onClick={onClick}
      className={`pf-exp-design-card rounded-2xl text-left ${
        compact ? 'pf-exp-preview-card' : `px-3 pt-2.5 ${showLabel ? 'pb-3' : 'pb-2.5'}`
      }`}
    >
      {active ? (
        <span
          aria-hidden
          className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full"
          style={{ backgroundColor: 'var(--pf-palette-principal, #f97316)' }}
        >
          <svg viewBox="0 0 20 20" fill="none" className="h-2.5 w-2.5">
            <path
              d="M4 10.5l3.5 3.5L16 6"
              stroke="white"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      ) : null}
      {children}
      {showLabel ? (
        <span className={compact ? 'mt-1.5 block' : 'mt-2.5 block'}>
          <span
            className={`pf-exp-card-label min-w-0 font-semibold leading-none tracking-tight ${compact ? 'text-xs' : 'text-sm'}`}
          >
            {label}
          </span>
        </span>
      ) : null}
    </button>
  );
}

function ExperienceHeaderWireframe({ design }: { design: ExperienceHeaderApplyDesign }) {
  const t = useT();
  switch (design) {
    case 'editorial':
      return (
        <MiniSlide>
          <MiniType x={10} y={28}>
            {t('EXP.')}
          </MiniType>
          <rect className="pf-exp-mini-mute" x="10" y="36" width="64" height="3.2" rx="1.4" />
          <rect className="pf-exp-mini-mute" x="10" y="44" width="42" height="2.8" rx="1.4" />
          <rect className="pf-exp-mini-ink" x="78" y="36" width="22" height="10" rx="2.5" />
        </MiniSlide>
      );
    case 'milestone':
      return (
        <MiniSlide>
          <MiniType x={60} y={30} size={9} anchor="middle">
            {t('EXP.')}
          </MiniType>
          <rect className="pf-exp-mini-mute" x="28" y="42" width="64" height="3.2" rx="1.4" />
          <rect className="pf-exp-mini-mute" x="38" y="50" width="44" height="2.8" rx="1.3" />
        </MiniSlide>
      );
    case 'table':
      return (
        <MiniSlide>
          <MiniType x={10} y={22} size={6.5}>
            {t('EXP')}
          </MiniType>
          <rect className="pf-exp-mini-ink" x="10" y="28" width="82" height="12" rx="2" />
          <rect className="pf-exp-mini-mute" x="10" y="48" width="54" height="3" rx="1.4" />
        </MiniSlide>
      );
    case 'reel':
      return (
        <MiniSlide>
          <MiniType x={10} y={28}>
            {t('EXP.')}
          </MiniType>
          <rect className="pf-exp-mini-mute" x="10" y="36" width="72" height="3.4" rx="1.5" />
          <rect className="pf-exp-mini-mute" x="10" y="44" width="48" height="2.8" rx="1.4" />
        </MiniSlide>
      );
    case 'gallery':
      return (
        <MiniSlide>
          <MiniType x={10} y={30} size={15}>
            {t('EXP.')}
          </MiniType>
          <rect className="pf-exp-mini-mute" x="10" y="40" width="100" height="0.9" rx="0.4" />
          <MiniType x={10} y={56} size={6}>
            {t('ROLES')}
          </MiniType>
          <MiniType x={110} y={56} size={6} anchor="end">
            03/
          </MiniType>
        </MiniSlide>
      );
    case 'spotlight':
      return (
        <MiniSlide>
          <MiniType x={10} y={34} size={9}>
            {t('TITLE')}
          </MiniType>
          <circle className="pf-exp-mini-accent" cx="54" cy="30.5" r="1.7" />
          <MiniType x={60} y={34} size={9}>
            {t('WORK')}
          </MiniType>
        </MiniSlide>
      );
    case 'loft':
      return (
        <MiniSlide>
          <MiniType x={10} y={32} size={11}>
            {t('ROLES')}
          </MiniType>
          <MiniType x={110} y={30} size={5.5} anchor="end">
            {t('(EXP)')}
          </MiniType>
          <rect className="pf-exp-mini-mute" x="10" y="42" width="100" height="0.9" rx="0.4" />
        </MiniSlide>
      );
    case 'press':
      return (
        <MiniSlide>
          <MiniType x={10} y={26} size={11}>
            {t('ROLES')}
          </MiniType>
          <MiniType x={10} y={40} size={11}>
            {t('TAKEN')}
          </MiniType>
          <rect className="pf-exp-mini-mute" x="10" y="50" width="100" height="0.9" rx="0.4" />
        </MiniSlide>
      );
    case 'legacy':
      return (
        <MiniSlide>
          <MiniType x={60} y={28} size={9} anchor="middle">
            {t('CRAFT')}
          </MiniType>
          <rect className="pf-exp-mini-accent" x="48" y="34" width="24" height="2.2" rx="1" />
          <rect className="pf-exp-mini-mute" x="36" y="44" width="48" height="3" rx="1.4" />
          <rect className="pf-exp-mini-mute" x="44" y="52" width="32" height="2.6" rx="1.3" />
        </MiniSlide>
      );
    default: {
      const _exhaustive: never = design;
      return _exhaustive;
    }
  }
}

const EXPERIENCE_HEADER_APPLY_CARDS: { id: ExperienceHeaderApplyDesign; label: string }[] = [
  { id: 'editorial', label: msg('Accent years') },
  { id: 'milestone', label: msg('Centered') },
  { id: 'table', label: msg('Serif lead') },
  { id: 'reel', label: msg('Title stack') },
  { id: 'gallery', label: msg('Billboard') },
  { id: 'spotlight', label: msg('Marquee') },
  { id: 'loft', label: msg('Split heading') },
  { id: 'press', label: msg('Masthead') },
  { id: 'legacy', label: msg('Accent title') },
];

const EXPERIENCE_LINK_BUTTON_PREVIEW_PALETTE = experienceLinkButtonPalette({
  ink: 'var(--pf-palette-texte-fort, #f5f5f5)',
  muted: 'var(--pf-palette-texte-muted, #a3a3a3)',
  accent: 'var(--pf-palette-principal, #f97316)',
  background: 'var(--pf-palette-fond, #0a0a0a)',
  border: 'var(--pf-palette-bordure, #262626)',
});

function ExperienceLinkButtonChoiceGrid({
  value,
  onChange,
}: {
  value: PortfolioExperienceRepoLinkStyle;
  onChange: (value: PortfolioExperienceRepoLinkStyle) => void;
}) {
  const t = useT();
  return (
    <div>
      <p className="pf-exp-block-label">{t('Link button')}</p>
      <div className="grid grid-cols-2 gap-2">
        {PORTFOLIO_EXPERIENCE_REPO_LINK_STYLE_OPTIONS.map((option) => {
          const active = value === option.value;
          const compact = option.value === 'spotlight' || option.value === 'reel' || option.value === 'legacy';
          return (
            <ExperiencePickerCard
              key={option.value}
              active={active}
              label={t(option.label)}
              showLabel={false}
              onClick={() => onChange(active ? 'auto' : option.value)}
            >
              <div
                className="flex h-14 items-center justify-center overflow-visible rounded-xl"
                style={{
                  backgroundColor:
                    'color-mix(in srgb, var(--pf-palette-texte-fort, #ffffff) 6%, transparent)',
                }}
              >
                <div className={`pointer-events-none ${compact ? 'scale-[0.72]' : 'scale-90'}`}>
                  <PortfolioLinkButton
                    variant={option.value}
                    href="#link-button"
                    label={t('Link')}
                    palette={EXPERIENCE_LINK_BUTTON_PREVIEW_PALETTE}
                    preview
                  />
                </div>
              </div>
            </ExperiencePickerCard>
          );
        })}
      </div>
    </div>
  );
}

function ExperienceLinkArrowChoiceGrid({
  value,
  onChange,
}: {
  value: PortfolioExperienceLinkArrowStyle;
  onChange: (value: PortfolioExperienceLinkArrowStyle) => void;
}) {
  const t = useT();
  return (
    <div>
      <p className="pf-exp-block-label pf-exp-option-label">{t('Link arrow')}</p>
      <div
        role="radiogroup"
        aria-label={t('Link arrow')}
        className="pf-exp-segment grid gap-[3px] p-[3px]"
        data-compact="true"
        style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}
      >
        {PORTFOLIO_EXPERIENCE_LINK_ARROW_STYLE_OPTIONS.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={t(option.description)}
              title={t(option.description)}
              onClick={() => onChange(option.value)}
              data-active={active ? 'true' : 'false'}
              className="pf-exp-segment-btn px-2.5 py-2 text-center text-[1.2rem] font-medium leading-none tracking-tight"
              style={
                active
                  ? undefined
                  : { color: '#c4c4c4', WebkitTextFillColor: '#c4c4c4' }
              }
            >
              {t(option.label)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ExperienceHeaderPreview({ value }: { value: PortfolioExperienceHeaderDesign }) {
  const t = useT();
  if (value === 'none') {
    return (
      <MiniSlide>
        <MiniType x={10} y={30} size={9}>
          {t('DEFAULT')}
        </MiniType>
        <rect className="pf-exp-mini-mute" x="10" y="40" width="72" height="3" rx="1.4" />
      </MiniSlide>
    );
  }
  return <ExperienceHeaderWireframe design={value as ExperienceHeaderApplyDesign} />;
}

function ExperienceHeaderChoiceGrid({
  value,
  onChange,
}: {
  value: PortfolioExperienceHeaderDesign;
  onChange: (value: PortfolioExperienceHeaderDesign) => void;
}) {
  const t = useT();
  const [showGrid, setShowGrid] = useState(false);
  const selectedLabel = EXPERIENCE_HEADER_APPLY_CARDS.find((card) => card.id === value)?.label ?? t('Default');

  if (showGrid) {
    return (
      <div>
        <div className="flex items-center justify-between gap-3">
          <p className="pf-exp-block-label !mb-0">{t('Header designs')}</p>
          <button
            type="button"
            onClick={() => setShowGrid(false)}
            className="text-sm font-semibold text-[color:var(--pf-palette-texte-muted)] hover:text-[color:var(--pf-palette-texte-fort)]"
          >
            {t('← Back')}
          </button>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-4">
          {EXPERIENCE_HEADER_APPLY_CARDS.map((card) => {
            const active = value === card.id;
            return (
              <ExperiencePickerCard
                key={card.id}
                active={active}
                label={t(card.label)}
                onClick={() => {
                  onChange(active ? 'none' : card.id);
                  setShowGrid(false);
                }}
              >
                <ExperienceHeaderWireframe design={card.id} />
              </ExperiencePickerCard>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="pf-exp-block-label">{t('Header designs')}</p>
      <div className="group relative w-full overflow-hidden rounded-2xl border border-[color:var(--pf-palette-bordure)] p-3">
        <ExperienceHeaderPreview value={value} />
        <button
          type="button"
          onClick={() => setShowGrid(true)}
          aria-label={t('Change header design')}
          className="absolute inset-0 hidden items-center justify-center bg-black/55 opacity-0 outline-none transition-opacity duration-150 hover:opacity-100 focus-visible:opacity-100 sm:flex"
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-transparent px-4 py-2 text-sm font-semibold text-[color:var(--pf-palette-texte-fort)] shadow-lg">
            {t('Change header design')}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setShowGrid(true)}
          aria-label={t('Change header design')}
          className="absolute bottom-2 right-2 inline-flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1.5 text-xs font-semibold text-white sm:hidden"
        >
          {t('Change')}
        </button>
      </div>
      <p className="mt-2 text-sm font-semibold text-[color:var(--pf-palette-texte-fort)]">{selectedLabel}</p>
    </div>
  );
}

function ExperienceAccentYearsAdvancedSettings({
  experience,
  onChange,
}: {
  experience: PortfolioExperienceSectionSettings;
  onChange: (patch: Partial<PortfolioExperienceSectionSettings>) => void;
}) {
  const t = useT();
  const badgeColor = experience.accentYearsBadgeColor ?? 'accent';
  const swatchStyle = (id: PortfolioExperienceAccentYearsBadgeColor) => {
    if (id === 'principal') return { backgroundColor: 'var(--pf-palette-principal)' };
    if (id === 'secondaire') return { backgroundColor: 'var(--pf-palette-secondaire)' };
    return { backgroundColor: experience.accentColor || 'var(--pf-palette-principal)' };
  };

  return (
    <section className="pf-exp-layout-settings" aria-labelledby="accent-years-advanced-title">
      <h3 id="accent-years-advanced-title" className="pf-exp-layout-settings-title">
        {t('Header advanced editing')}
      </h3>
      <div className="pf-exp-layout-settings-body space-y-6">
        <div>
          <label className="pf-exp-block-label block" htmlFor="accent-years-badge-text">
            {t('Badge text')}
          </label>
          <input
            id="accent-years-badge-text"
            type="text"
            value={experience.accentYearsBadgeText ?? ''}
            onChange={(event) => onChange({ accentYearsBadgeText: event.target.value })}
            placeholder={DEFAULT_ACCENT_YEARS_BADGE_TEXT}
            className="mt-3 w-full rounded-xl border border-[color:var(--pf-palette-bordure)] bg-transparent px-3.5 py-2.5 text-sm font-medium text-[color:var(--pf-palette-texte-fort)] placeholder:text-[color:var(--pf-palette-texte-muted)]"
          />
          <p className="mt-2 text-[11px] text-[color:var(--pf-palette-texte-muted)]">{t('Use')} {'{years}'} {t('to insert the profile years count.')}</p>
        </div>
        <div>
          <label className="pf-exp-block-label block" htmlFor="accent-years-lead-text">
            {t('Lead text')}
          </label>
          <input
            id="accent-years-lead-text"
            type="text"
            value={experience.accentYearsLeadText ?? ''}
            onChange={(event) => onChange({ accentYearsLeadText: event.target.value })}
            placeholder={DEFAULT_ACCENT_YEARS_LEAD_TEXT}
            className="mt-3 w-full rounded-xl border border-[color:var(--pf-palette-bordure)] bg-transparent px-3.5 py-2.5 text-sm font-medium text-[color:var(--pf-palette-texte-fort)] placeholder:text-[color:var(--pf-palette-texte-muted)]"
          />
        </div>
        <ExperienceOptionGrid
          label={t('Font size')}
          options={PORTFOLIO_EXPERIENCE_ACCENT_YEARS_SIZE_OPTIONS}
          value={experience.accentYearsFontSize ?? 6}
          onChange={(accentYearsFontSize) => onChange({ accentYearsFontSize })}
          columns={4}
        />
        <ExperienceOptionGrid
          label={t('Badge radius')}
          options={PORTFOLIO_EXPERIENCE_ACCENT_YEARS_RADIUS_OPTIONS}
          value={experience.accentYearsBadgeRadius ?? 4}
          onChange={(accentYearsBadgeRadius) => onChange({ accentYearsBadgeRadius })}
        />
        <div>
          <p className="pf-exp-block-label pf-exp-option-label">{t('Badge color')}</p>
          <div
            role="radiogroup"
            aria-label={t('Badge color')}
            className="pf-exp-segment grid gap-[3px] p-[3px]"
            data-compact="true"
            style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}
          >
            {PORTFOLIO_EXPERIENCE_ACCENT_YEARS_COLOR_OPTIONS.map((option) => {
              const active = option.value === badgeColor;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => onChange({ accentYearsBadgeColor: option.value })}
                  data-active={active ? 'true' : 'false'}
                  className="pf-exp-segment-btn flex items-center justify-center gap-1.5 px-2 py-1.5 text-center text-[13px] font-medium tracking-tight"
                  style={
                    active
                      ? undefined
                      : { color: '#c4c4c4', WebkitTextFillColor: '#c4c4c4' }
                  }
                >
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={swatchStyle(option.value)}
                    aria-hidden
                  />
                  {t(option.label)}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function CenteredAlignGlyph({ align }: { align: PortfolioExperienceCenteredAlign }) {
  const widths = align === 'left' ? [18, 11, 15] : align === 'right' ? [15, 11, 18] : [13, 18, 13];
  const xFor = (width: number) =>
    align === 'left' ? 3 : align === 'right' ? 21 - width : (24 - width) / 2;
  return (
    <svg viewBox="0 0 24 16" className="h-3.5 w-6" aria-hidden>
      {widths.map((width, index) => (
        <rect
          key={index}
          x={xFor(width)}
          y={2 + index * 5}
          width={width}
          height={1.7}
          rx={0.85}
          fill="currentColor"
        />
      ))}
    </svg>
  );
}

function CenteredLineHeightGlyph({ value }: { value: PortfolioExperienceCenteredLineHeight }) {
  const gap = value === 'tight' ? 3.4 : value === 'spaced' ? 6.2 : 4.7;
  return (
    <svg viewBox="0 0 22 18" className="h-4 w-5" aria-hidden>
      {[0, 1, 2].map((index) => (
        <rect
          key={index}
          x={2}
          y={2 + index * gap}
          width={index === 1 ? 14 : 18}
          height={1.5}
          rx={0.75}
          fill="currentColor"
        />
      ))}
    </svg>
  );
}

function CenteredWidthGlyph({ value }: { value: PortfolioExperienceCenteredMaxWidth }) {
  const width = value === 'narrow' ? 10 : value === 'wide' ? 18 : 14;
  return (
    <svg viewBox="0 0 22 10" className="h-2.5 w-6" aria-hidden>
      <rect x={(22 - width) / 2} y={4} width={width} height={2} rx={1} fill="currentColor" />
    </svg>
  );
}

function CenteredDividerGlyph({ value }: { value: PortfolioExperienceCenteredDivider }) {
  if (value === 'none') {
    return <span className="pf-exp-centered-divider-none" aria-hidden />;
  }
  if (value === 'dot') {
    return <span className="pf-exp-centered-divider-dot" aria-hidden />;
  }
  if (value === 'full') {
    return <span className="pf-exp-centered-divider-full" aria-hidden />;
  }
  return <span className="pf-exp-centered-divider-track" aria-hidden />;
}

function CenteredSteppedSlider<T extends string>({
  label,
  options,
  value,
  onChange,
  formatValue,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  formatValue?: (option: { value: T; label: string }) => string;
}) {
  const t = useT();
  const rows = useSettingsRows();
  const index = Math.max(
    0,
    options.findIndex((option) => option.value === value)
  );
  const current = options[index];
  return (
    <SettingRow label={label} value={String(options.find((option) => option.value === value)?.label ?? '')}>
    <div>
      {rows ? null : (<div className="pf-exp-centered-slider-head">
        <p className="pf-exp-block-label">{label}</p>
        <span className="pf-exp-centered-slider-value">
          {current ? (formatValue ? formatValue(current) : current.label) : null}
        </span>
      </div>)}
      <input
        type="range"
        min={0}
        max={Math.max(options.length - 1, 0)}
        step={1}
        value={index}
        aria-label={label}
        aria-valuetext={current?.label}
        onChange={(event) => {
          const next = options[Number(event.target.value)];
          if (next) onChange(next.value);
        }}
        className="pf-exp-centered-slider"
        style={
          {
            '--pf-exp-slider-fill': `${(index / Math.max(options.length - 1, 1)) * 100}%`,
          } as CSSProperties
        }
      />
      <div className="pf-exp-centered-slider-ticks" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            data-active={option.value === value ? 'true' : 'false'}
            onClick={() => onChange(option.value)}
          >
            {t(option.label)}
          </button>
        ))}
      </div>
    </div>
    </SettingRow>
  );
}

function ExperienceCenteredLayoutSettings({
  experience,
  onChange,
}: {
  experience: PortfolioExperienceSectionSettings;
  onChange: (patch: Partial<PortfolioExperienceSectionSettings>) => void;
}) {
  const t = useT();
  const divider = experience.centeredDivider ?? 'none';
  const align = experience.centeredAlign ?? 'center';
  const weight = experience.centeredLeadWeight ?? 'light';
  const maxWidth = experience.centeredMaxWidth ?? 'balanced';
  const lineHeight = experience.centeredLineHeight ?? 'aery';
  const dividerOpacity = experience.centeredDividerOpacity ?? 'ghost';

  return (
    <section
      className="pf-exp-layout-settings pf-exp-centered-config"
      aria-labelledby="centered-layout-title"
    >
      <h3 id="centered-layout-title" className="pf-exp-layout-settings-title">
        {t('Centered layout configuration')}
      </h3>
      <div className="pf-exp-layout-settings-body space-y-7">
        <div>
          <label className="pf-exp-block-label block" htmlFor="centered-title-text">
            {t('Title')}
          </label>
          <input
            id="centered-title-text"
            type="text"
            value={experience.centeredTitleText ?? ''}
            onChange={(event) => onChange({ centeredTitleText: event.target.value })}
            placeholder={DEFAULT_CENTERED_TITLE_TEXT}
            className="pf-exp-centered-field mt-3 w-full rounded-xl border px-3.5 py-2.5 text-sm font-medium"
          />
        </div>
        <div>
          <label className="pf-exp-block-label block" htmlFor="centered-lead-text">
            {t('Sub-title')}
          </label>
          <input
            id="centered-lead-text"
            type="text"
            value={experience.centeredLeadText ?? ''}
            onChange={(event) => onChange({ centeredLeadText: event.target.value })}
            placeholder={DEFAULT_CENTERED_LEAD_TEXT}
            className="pf-exp-centered-field mt-3 w-full rounded-xl border px-3.5 py-2.5 text-sm font-medium"
          />
          <p className="mt-2 text-[11px] text-[color:var(--pf-palette-texte-muted)]">{t('Use')} {'{years}'} {t('to insert the profile years count.')}</p>
        </div>

        <div>
          <p className="pf-exp-block-label pf-exp-option-label">{t('Alignment')}</p>
          <div role="radiogroup" aria-label={t('Alignment')} className="pf-exp-centered-align">
            {PORTFOLIO_EXPERIENCE_CENTERED_ALIGN_OPTIONS.map((option) => {
              const active = option.value === align;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  aria-label={t(option.label)}
                  data-active={active ? 'true' : 'false'}
                  onClick={() => onChange({ centeredAlign: option.value })}
                  className="pf-exp-centered-align-btn"
                >
                  <CenteredAlignGlyph align={option.value} />
                  <span>{t(option.label)}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="pf-exp-block-label pf-exp-option-label">{t('Sub-title weight')}</p>
          <div role="radiogroup" aria-label={t('Sub-title weight')} className="pf-exp-centered-weight">
            {PORTFOLIO_EXPERIENCE_CENTERED_WEIGHT_OPTIONS.map((option) => {
              const active = option.value === weight;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  data-active={active ? 'true' : 'false'}
                  onClick={() => onChange({ centeredLeadWeight: option.value })}
                  className="pf-exp-centered-weight-btn"
                  style={{ fontWeight: CENTERED_LEAD_WEIGHT[option.value] }}
                >
                  {t(option.label)}
                </button>
              );
            })}
          </div>
        </div>

        <CenteredSteppedSlider
          label={t('Sub-title opacity')}
          options={PORTFOLIO_EXPERIENCE_CENTERED_OPACITY_OPTIONS}
          value={experience.centeredLeadOpacity ?? 'balanced'}
          onChange={(centeredLeadOpacity) => onChange({ centeredLeadOpacity })}
          formatValue={(option) =>
            `${option.label} ${Math.round(CENTERED_LEAD_OPACITY[option.value] * 100)}%`
          }
        />

        <CenteredSteppedSlider
          label={t('Header scale')}
          options={PORTFOLIO_EXPERIENCE_CENTERED_SCALE_OPTIONS}
          value={experience.centeredScale ?? 'monumental'}
          onChange={(centeredScale) => onChange({ centeredScale })}
        />

        <div>
          <p className="pf-exp-block-label pf-exp-option-label">{t('Max width')}</p>
          <div role="radiogroup" aria-label={t('Max width')} className="pf-exp-centered-tiles">
            {PORTFOLIO_EXPERIENCE_CENTERED_WIDTH_OPTIONS.map((option) => {
              const active = option.value === maxWidth;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  aria-label={t(option.label)}
                  data-active={active ? 'true' : 'false'}
                  onClick={() => onChange({ centeredMaxWidth: option.value })}
                  className="pf-exp-centered-tile"
                >
                  <CenteredWidthGlyph value={option.value} />
                  <span>{t(option.label)}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="pf-exp-block-label pf-exp-option-label">{t('Line height')}</p>
          <div role="radiogroup" aria-label={t('Line height')} className="pf-exp-centered-tiles">
            {PORTFOLIO_EXPERIENCE_CENTERED_LEADING_OPTIONS.map((option) => {
              const active = option.value === lineHeight;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  aria-label={t(option.label)}
                  data-active={active ? 'true' : 'false'}
                  onClick={() => onChange({ centeredLineHeight: option.value })}
                  className="pf-exp-centered-tile"
                >
                  <CenteredLineHeightGlyph value={option.value} />
                  <span>{t(option.label)}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="pf-exp-block-label pf-exp-option-label">{t('Divider')}</p>
          <div
            role="radiogroup"
            aria-label={t('Divider')}
            className="pf-exp-centered-tiles pf-exp-centered-tiles-4"
          >
            {PORTFOLIO_EXPERIENCE_CENTERED_DIVIDER_OPTIONS.map((option) => {
              const active = option.value === divider;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  aria-label={t(option.label)}
                  title={t(option.label)}
                  data-active={active ? 'true' : 'false'}
                  onClick={() => onChange({ centeredDivider: option.value })}
                  className="pf-exp-centered-tile pf-exp-centered-tile-glyph"
                >
                  <CenteredDividerGlyph value={option.value} />
                  <span>
                    {option.value === 'dot'
                      ? t('Dot')
                      : option.value === 'full'
                        ? t('Full')
                        : option.value === 'track'
                          ? t('Track')
                          : t('None')}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {divider !== 'none' ? (
          <div>
            <p className="pf-exp-block-label pf-exp-option-label">{t('Divider opacity')}</p>
            <div role="radiogroup" aria-label={t('Divider opacity')} className="pf-exp-centered-underline">
              {PORTFOLIO_EXPERIENCE_CENTERED_DIVIDER_OPACITY_OPTIONS.map((option) => {
                const active = option.value === dividerOpacity;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    data-active={active ? 'true' : 'false'}
                    data-tone={option.value}
                    onClick={() => onChange({ centeredDividerOpacity: option.value })}
                    className="pf-exp-centered-underline-btn"
                  >
                    {t(option.label)}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function SerifTrackingGlyph({ value }: { value: PortfolioExperienceSerifLeadTracking }) {
  const gap = value === 'tight' ? 3.2 : value === 'open' ? 6.4 : 4.6;
  return (
    <svg viewBox="0 0 22 12" className="h-3 w-6" aria-hidden>
      {[0, 1, 2].map((index) => (
        <rect
          key={index}
          x={2 + index * gap}
          y={3}
          width={2.2}
          height={6}
          rx={0.6}
          fill="currentColor"
        />
      ))}
    </svg>
  );
}

function ExperienceSerifLeadLayoutSettings({
  experience,
  onChange,
}: {
  experience: PortfolioExperienceSectionSettings;
  onChange: (patch: Partial<PortfolioExperienceSectionSettings>) => void;
}) {
  const t = useT();
  const align = experience.serifLeadAlign ?? 'left';
  const weight = experience.serifLeadWeight ?? 'medium';
  const maxWidth = experience.serifLeadMaxWidth ?? 'narrow';
  const lineHeight = experience.serifLeadLineHeight ?? 'tight';
  const tracking = experience.serifLeadTracking ?? 'editorial';
  const ink = experience.serifLeadInk ?? 'current';
  const divider = experience.serifLeadDivider ?? 'none';
  const dividerOpacity = experience.serifLeadDividerOpacity ?? 'ghost';

  const swatchStyle = (id: PortfolioExperienceSerifLeadInk) => {
    if (id === 'principal') return { backgroundColor: 'var(--pf-palette-principal)' };
    if (id === 'secondaire') return { backgroundColor: 'var(--pf-palette-secondaire)' };
    if (id === 'accent') return { backgroundColor: experience.accentColor || 'var(--pf-palette-principal)' };
    return { backgroundColor: 'var(--pf-palette-texte-fort, #f5f5f5)' };
  };

  return (
    <section
      className="pf-exp-layout-settings pf-exp-centered-config"
      aria-labelledby="serif-lead-layout-title"
    >
      <h3 id="serif-lead-layout-title" className="pf-exp-layout-settings-title">
        {t('Serif lead configuration')}
      </h3>
      <div className="pf-exp-layout-settings-body space-y-7">
        <div>
          <label className="pf-exp-block-label block" htmlFor="serif-lead-label-text">
            {t('Label')}
          </label>
          <input
            id="serif-lead-label-text"
            type="text"
            value={experience.serifLeadLabelText ?? ''}
            onChange={(event) => onChange({ serifLeadLabelText: event.target.value })}
            placeholder={DEFAULT_SERIF_LEAD_LABEL_TEXT}
            className="pf-exp-centered-field mt-3 w-full rounded-xl border px-3.5 py-2.5 text-sm font-medium"
          />
        </div>
        <div>
          <label className="pf-exp-block-label block" htmlFor="serif-lead-title-text">
            {t('Title')}
          </label>
          <input
            id="serif-lead-title-text"
            type="text"
            value={experience.serifLeadTitleText ?? ''}
            onChange={(event) => onChange({ serifLeadTitleText: event.target.value })}
            placeholder={DEFAULT_SERIF_LEAD_TITLE_TEXT}
            className="pf-exp-centered-field mt-3 w-full rounded-xl border px-3.5 py-2.5 text-sm font-medium"
          />
          <p className="mt-2 text-[11px] text-[color:var(--pf-palette-texte-muted)]">{t('Use')} {'{years}'} {t('to insert the profile years count.')}</p>
        </div>

        <div>
          <p className="pf-exp-block-label pf-exp-option-label">{t('Alignment')}</p>
          <div role="radiogroup" aria-label={t('Alignment')} className="pf-exp-centered-align">
            {PORTFOLIO_EXPERIENCE_CENTERED_ALIGN_OPTIONS.map((option) => {
              const active = option.value === align;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  aria-label={t(option.label)}
                  data-active={active ? 'true' : 'false'}
                  onClick={() => onChange({ serifLeadAlign: option.value })}
                  className="pf-exp-centered-align-btn"
                >
                  <CenteredAlignGlyph align={option.value} />
                  <span>{t(option.label)}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="pf-exp-block-label pf-exp-option-label">{t('Title color')}</p>
          <div
            role="radiogroup"
            aria-label={t('Title color')}
            className="pf-exp-segment grid gap-[3px] p-[3px]"
            data-compact="true"
            style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}
          >
            {PORTFOLIO_EXPERIENCE_SERIF_LEAD_INK_OPTIONS.map((option) => {
              const active = option.value === ink;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => onChange({ serifLeadInk: option.value })}
                  data-active={active ? 'true' : 'false'}
                  className="pf-exp-segment-btn flex items-center justify-center gap-1.5 px-1.5 py-1.5 text-center text-[12px] font-medium tracking-tight"
                  style={active ? undefined : { color: '#c4c4c4', WebkitTextFillColor: '#c4c4c4' }}
                >
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={swatchStyle(option.value)}
                    aria-hidden
                  />
                  {t(option.label)}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="pf-exp-block-label pf-exp-option-label">{t('Title weight')}</p>
          <div role="radiogroup" aria-label={t('Title weight')} className="pf-exp-centered-weight">
            {PORTFOLIO_EXPERIENCE_CENTERED_WEIGHT_OPTIONS.map((option) => {
              const active = option.value === weight;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  data-active={active ? 'true' : 'false'}
                  onClick={() => onChange({ serifLeadWeight: option.value })}
                  className="pf-exp-centered-weight-btn"
                  style={{ fontWeight: SERIF_LEAD_WEIGHT[option.value] }}
                >
                  {t(option.label)}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="pf-exp-block-label pf-exp-option-label">{t('Title style')}</p>
          <div
            role="radiogroup"
            aria-label={t('Title style')}
            className="pf-exp-centered-tiles"
            style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}
          >
            {(
              [
                { value: false, label: t('Roman') },
                { value: true, label: t('Italic') },
              ] as const
            ).map((option) => {
              const active = (experience.serifLeadItalic === true) === option.value;
              return (
                <button
                  key={String(option.value)}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  data-active={active ? 'true' : 'false'}
                  onClick={() => onChange({ serifLeadItalic: option.value })}
                  className="pf-exp-centered-tile"
                  style={{ fontStyle: option.value ? 'italic' : 'normal' }}
                >
                  <span>{t(option.label)}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="pf-exp-block-label pf-exp-option-label">{t('Motion')}</p>
          <div
            role="radiogroup"
            aria-label={t('Motion')}
            className="pf-exp-centered-tiles"
            style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}
          >
            {(
              [
                { value: true, label: t('On') },
                { value: false, label: t('Off') },
              ] as const
            ).map((option) => {
              const active = (experience.serifLeadMotion !== false) === option.value;
              return (
                <button
                  key={String(option.value)}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  data-active={active ? 'true' : 'false'}
                  onClick={() => onChange({ serifLeadMotion: option.value })}
                  className="pf-exp-centered-tile"
                >
                  <span>{t(option.label)}</span>
                </button>
              );
            })}
          </div>
        </div>

        <CenteredSteppedSlider
          label={t('Title scale')}
          options={PORTFOLIO_EXPERIENCE_CENTERED_SCALE_OPTIONS}
          value={experience.serifLeadScale ?? 'default'}
          onChange={(serifLeadScale) => onChange({ serifLeadScale })}
        />

        <div>
          <p className="pf-exp-block-label pf-exp-option-label">{t('Letter spacing')}</p>
          <div role="radiogroup" aria-label={t('Letter spacing')} className="pf-exp-centered-tiles">
            {PORTFOLIO_EXPERIENCE_SERIF_LEAD_TRACKING_OPTIONS.map((option) => {
              const active = option.value === tracking;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  aria-label={t(option.label)}
                  data-active={active ? 'true' : 'false'}
                  onClick={() => onChange({ serifLeadTracking: option.value })}
                  className="pf-exp-centered-tile"
                >
                  <SerifTrackingGlyph value={option.value} />
                  <span>{t(option.label)}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="pf-exp-block-label pf-exp-option-label">{t('Max width')}</p>
          <div role="radiogroup" aria-label={t('Max width')} className="pf-exp-centered-tiles">
            {PORTFOLIO_EXPERIENCE_CENTERED_WIDTH_OPTIONS.map((option) => {
              const active = option.value === maxWidth;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  aria-label={t(option.label)}
                  data-active={active ? 'true' : 'false'}
                  onClick={() => onChange({ serifLeadMaxWidth: option.value })}
                  className="pf-exp-centered-tile"
                >
                  <CenteredWidthGlyph value={option.value} />
                  <span>{t(option.label)}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="pf-exp-block-label pf-exp-option-label">{t('Line height')}</p>
          <div role="radiogroup" aria-label={t('Line height')} className="pf-exp-centered-tiles">
            {PORTFOLIO_EXPERIENCE_CENTERED_LEADING_OPTIONS.map((option) => {
              const active = option.value === lineHeight;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  aria-label={t(option.label)}
                  data-active={active ? 'true' : 'false'}
                  onClick={() => onChange({ serifLeadLineHeight: option.value })}
                  className="pf-exp-centered-tile"
                >
                  <CenteredLineHeightGlyph value={option.value} />
                  <span>{t(option.label)}</span>
                </button>
              );
            })}
          </div>
        </div>

        <CenteredSteppedSlider
          label={t('Label opacity')}
          options={PORTFOLIO_EXPERIENCE_SERIF_LEAD_LABEL_OPACITY_OPTIONS}
          value={experience.serifLeadLabelOpacity ?? 'muted'}
          onChange={(serifLeadLabelOpacity) => onChange({ serifLeadLabelOpacity })}
          formatValue={(option) =>
            `${option.label} ${Math.round(SERIF_LEAD_LABEL_OPACITY[option.value] * 100)}%`
          }
        />

        <div>
          <p className="pf-exp-block-label pf-exp-option-label">{t('Divider')}</p>
          <div
            role="radiogroup"
            aria-label={t('Divider')}
            className="pf-exp-centered-tiles pf-exp-centered-tiles-4"
          >
            {PORTFOLIO_EXPERIENCE_CENTERED_DIVIDER_OPTIONS.map((option) => {
              const active = option.value === divider;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  aria-label={t(option.label)}
                  title={t(option.label)}
                  data-active={active ? 'true' : 'false'}
                  onClick={() => onChange({ serifLeadDivider: option.value })}
                  className="pf-exp-centered-tile pf-exp-centered-tile-glyph"
                >
                  <CenteredDividerGlyph value={option.value} />
                  <span>
                    {option.value === 'dot'
                      ? t('Dot')
                      : option.value === 'full'
                        ? t('Full')
                        : option.value === 'track'
                          ? t('Track')
                          : t('None')}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {divider !== 'none' ? (
          <div>
            <p className="pf-exp-block-label pf-exp-option-label">{t('Divider opacity')}</p>
            <div role="radiogroup" aria-label={t('Divider opacity')} className="pf-exp-centered-underline">
              {PORTFOLIO_EXPERIENCE_CENTERED_DIVIDER_OPACITY_OPTIONS.map((option) => {
                const active = option.value === dividerOpacity;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    data-active={active ? 'true' : 'false'}
                    data-tone={option.value}
                    onClick={() => onChange({ serifLeadDividerOpacity: option.value })}
                    className="pf-exp-centered-underline-btn"
                  >
                    {t(option.label)}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function ExperienceMarqueeLayoutSettings({
  experience,
  onChange,
}: {
  experience: PortfolioExperienceSectionSettings;
  onChange: (patch: Partial<PortfolioExperienceSectionSettings>) => void;
}) {
  const t = useT();
  const ink = experience.marqueeInk ?? 'current';
  const style = experience.marqueeStyle ?? 'alternate';
  const weight = experience.marqueeWeight ?? 'semibold';
  const tracking = experience.marqueeTracking ?? 'editorial';
  const direction = experience.marqueeDirection ?? 'ltr';
  const speed = experience.marqueeSpeed ?? 'cruise';
  const fade = experience.marqueeEdgeFade ?? 'soft';
  const separator = experience.marqueeSeparator ?? 'dot';
  const separatorColor = experience.marqueeSeparatorColor ?? 'accent';
  const motion = experience.marqueeMotion !== false;
  const scrollLink = experience.marqueeScrollLink !== false;

  const swatchStyle = (id: PortfolioExperienceSerifLeadInk) => {
    if (id === 'principal') return { backgroundColor: 'var(--pf-palette-principal)' };
    if (id === 'secondaire') return { backgroundColor: 'var(--pf-palette-secondaire)' };
    if (id === 'accent') return { backgroundColor: experience.accentColor || 'var(--pf-palette-principal)' };
    return { backgroundColor: 'var(--pf-palette-texte-fort, #f5f5f5)' };
  };

  return (
    <section
      className="pf-exp-layout-settings pf-exp-centered-config"
      aria-labelledby="marquee-layout-title"
    >
      <h3 id="marquee-layout-title" className="pf-exp-layout-settings-title">
        {t('Marquee configuration')}
      </h3>
      <div className="pf-exp-layout-settings-body space-y-7">
        <div>
          <label className="pf-exp-block-label block" htmlFor="marquee-word-1">
            {t('Word')}
          </label>
          <input
            id="marquee-word-1"
            type="text"
            value={experience.spotlightBigTitleText ?? ''}
            onChange={(event) => onChange({ spotlightBigTitleText: event.target.value })}
            placeholder={t('Experience')}
            className="pf-exp-centered-field mt-3 w-full rounded-xl border px-3.5 py-2.5 text-sm font-medium"
          />
        </div>
        <div>
          <p className="pf-exp-block-label pf-exp-option-label">{t('Extra words')}</p>
          <div className="grid grid-cols-1 gap-2">
            {(
              [
                ['spotlightBigTitleWord2', experience.spotlightBigTitleWord2, 'Word 2'],
                ['spotlightBigTitleWord3', experience.spotlightBigTitleWord3, 'Word 3'],
                ['spotlightBigTitleWord4', experience.spotlightBigTitleWord4, 'Word 4'],
              ] as const
            ).map(([key, value, label]) => (
              <input
                key={key}
                type="text"
                value={value ?? ''}
                onChange={(event) => onChange({ [key]: event.target.value })}
                placeholder={label}
                aria-label={label}
                className="pf-exp-centered-field w-full rounded-xl border px-3.5 py-2.5 text-sm font-medium"
              />
            ))}
          </div>
        </div>

        <div>
          <p className="pf-exp-block-label pf-exp-option-label">{t('Word color')}</p>
          <div
            role="radiogroup"
            aria-label={t('Word color')}
            className="pf-exp-segment grid gap-[3px] p-[3px]"
            data-compact="true"
            style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}
          >
            {PORTFOLIO_EXPERIENCE_SERIF_LEAD_INK_OPTIONS.map((option) => {
              const active = option.value === ink;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => onChange({ marqueeInk: option.value })}
                  data-active={active ? 'true' : 'false'}
                  className="pf-exp-segment-btn flex items-center justify-center gap-1.5 px-1.5 py-1.5 text-center text-[12px] font-medium tracking-tight"
                  style={active ? undefined : { color: '#c4c4c4', WebkitTextFillColor: '#c4c4c4' }}
                >
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={swatchStyle(option.value)} aria-hidden />
                  {t(option.label)}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="pf-exp-block-label pf-exp-option-label">{t('Letter style')}</p>
          <div role="radiogroup" aria-label={t('Letter style')} className="pf-exp-centered-tiles">
            {PORTFOLIO_EXPERIENCE_MARQUEE_STYLE_OPTIONS.map((option) => {
              const active = option.value === style;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  data-active={active ? 'true' : 'false'}
                  onClick={() => onChange({ marqueeStyle: option.value })}
                  className="pf-exp-centered-tile"
                >
                  <span>{t(option.label)}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="pf-exp-block-label pf-exp-option-label">{t('Weight')}</p>
          <div role="radiogroup" aria-label={t('Weight')} className="pf-exp-centered-weight">
            {PORTFOLIO_EXPERIENCE_MARQUEE_WEIGHT_OPTIONS.map((option) => {
              const active = option.value === weight;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  data-active={active ? 'true' : 'false'}
                  onClick={() => onChange({ marqueeWeight: option.value })}
                  className="pf-exp-centered-weight-btn"
                  style={{ fontWeight: MARQUEE_WEIGHT[option.value] }}
                >
                  {t(option.label)}
                </button>
              );
            })}
          </div>
        </div>

        <CenteredSteppedSlider
          label={t('Scale')}
          options={PORTFOLIO_EXPERIENCE_CENTERED_SCALE_OPTIONS}
          value={experience.marqueeScale ?? 'default'}
          onChange={(marqueeScale) => onChange({ marqueeScale })}
        />

        <div>
          <p className="pf-exp-block-label pf-exp-option-label">{t('Letter spacing')}</p>
          <div role="radiogroup" aria-label={t('Letter spacing')} className="pf-exp-centered-tiles">
            {PORTFOLIO_EXPERIENCE_SERIF_LEAD_TRACKING_OPTIONS.map((option) => {
              const active = option.value === tracking;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  data-active={active ? 'true' : 'false'}
                  onClick={() => onChange({ marqueeTracking: option.value })}
                  className="pf-exp-centered-tile"
                >
                  <SerifTrackingGlyph value={option.value} />
                  <span>{t(option.label)}</span>
                </button>
              );
            })}
          </div>
        </div>

        <CenteredSteppedSlider
          label={t('Fill opacity')}
          options={PORTFOLIO_EXPERIENCE_SERIF_LEAD_LABEL_OPACITY_OPTIONS}
          value={experience.marqueeFillOpacity ?? 'muted'}
          onChange={(marqueeFillOpacity) => onChange({ marqueeFillOpacity })}
          formatValue={(option) =>
            `${option.label} ${Math.round(MARQUEE_FILL_OPACITY[option.value] * 100)}%`
          }
        />

        <div>
          <p className="pf-exp-block-label pf-exp-option-label">{t('Separator')}</p>
          <div
            role="radiogroup"
            aria-label={t('Separator')}
            className="pf-exp-centered-tiles"
            style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}
          >
            {PORTFOLIO_EXPERIENCE_MARQUEE_SEPARATOR_OPTIONS.map((option) => {
              const active = option.value === separator;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  data-active={active ? 'true' : 'false'}
                  onClick={() => onChange({ marqueeSeparator: option.value })}
                  className="pf-exp-centered-tile"
                >
                  <span>{t(option.label)}</span>
                </button>
              );
            })}
          </div>
        </div>

        {separator !== 'none' ? (
          <div>
            <p className="pf-exp-block-label pf-exp-option-label">{t('Separator color')}</p>
            <div
              role="radiogroup"
              aria-label={t('Separator color')}
              className="pf-exp-segment grid gap-[3px] p-[3px]"
              data-compact="true"
              style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}
            >
              {PORTFOLIO_EXPERIENCE_SERIF_LEAD_INK_OPTIONS.map((option) => {
                const active = option.value === separatorColor;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => onChange({ marqueeSeparatorColor: option.value })}
                    data-active={active ? 'true' : 'false'}
                    className="pf-exp-segment-btn flex items-center justify-center gap-1.5 px-1.5 py-1.5 text-center text-[12px] font-medium tracking-tight"
                    style={active ? undefined : { color: '#c4c4c4', WebkitTextFillColor: '#c4c4c4' }}
                  >
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={swatchStyle(option.value)} aria-hidden />
                    {t(option.label)}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        <div>
          <p className="pf-exp-block-label pf-exp-option-label">{t('Direction')}</p>
          <div
            role="radiogroup"
            aria-label={t('Direction')}
            className="pf-exp-centered-tiles"
            style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}
          >
            {PORTFOLIO_EXPERIENCE_MARQUEE_DIRECTION_OPTIONS.map((option) => {
              const active = option.value === direction;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  data-active={active ? 'true' : 'false'}
                  onClick={() => onChange({ marqueeDirection: option.value })}
                  className="pf-exp-centered-tile"
                >
                  <span>{t(option.label)}</span>
                </button>
              );
            })}
          </div>
        </div>

        <CenteredSteppedSlider
          label={t('Speed')}
          options={PORTFOLIO_EXPERIENCE_MARQUEE_SPEED_OPTIONS}
          value={speed}
          onChange={(marqueeSpeed) => onChange({ marqueeSpeed })}
        />

        <div>
          <p className="pf-exp-block-label pf-exp-option-label">{t('Edge fade')}</p>
          <div role="radiogroup" aria-label={t('Edge fade')} className="pf-exp-centered-tiles">
            {PORTFOLIO_EXPERIENCE_MARQUEE_FADE_OPTIONS.map((option) => {
              const active = option.value === fade;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  data-active={active ? 'true' : 'false'}
                  onClick={() => onChange({ marqueeEdgeFade: option.value })}
                  className="pf-exp-centered-tile"
                >
                  <span>{t(option.label)}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="pf-exp-block-label pf-exp-option-label">{t('Motion')}</p>
          <div
            role="radiogroup"
            aria-label={t('Motion')}
            className="pf-exp-centered-tiles"
            style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}
          >
            {(
              [
                { value: true, label: t('On') },
                { value: false, label: t('Off') },
              ] as const
            ).map((option) => {
              const active = motion === option.value;
              return (
                <button
                  key={String(option.value)}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  data-active={active ? 'true' : 'false'}
                  onClick={() => onChange({ marqueeMotion: option.value })}
                  className="pf-exp-centered-tile"
                >
                  <span>{t(option.label)}</span>
                </button>
              );
            })}
          </div>
        </div>

        {motion ? (
          <div>
            <p className="pf-exp-block-label pf-exp-option-label">{t('Scroll velocity')}</p>
            <div
              role="radiogroup"
              aria-label={t('Scroll velocity')}
              className="pf-exp-centered-tiles"
              style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}
            >
              {(
                [
                  { value: true, label: t('On') },
                  { value: false, label: t('Off') },
                ] as const
              ).map((option) => {
                const active = scrollLink === option.value;
                return (
                  <button
                    key={`scroll-${String(option.value)}`}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    data-active={active ? 'true' : 'false'}
                    onClick={() => onChange({ marqueeScrollLink: option.value })}
                    className="pf-exp-centered-tile"
                  >
                    <span>{t(option.label)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function ExperienceTitleStackHeaderSettings({
  experience,
  onChange,
}: {
  experience: PortfolioExperienceSectionSettings;
  onChange: (patch: Partial<PortfolioExperienceSectionSettings>) => void;
}) {
  const t = useT();
  return (
    <section className="pf-exp-layout-settings" aria-labelledby="title-stack-header-title">
      <h3 id="title-stack-header-title" className="pf-exp-layout-settings-title">
        {t('Title stack')}
      </h3>
      <div className="pf-exp-layout-settings-body space-y-6">
        <ExperienceToggleRow
          label={t('Chronology kicker')}
          description={t('Micro-label above the monumental title.')}
          checked={experience.reelKickerEnabled !== false}
          onChange={(reelKickerEnabled) => onChange({ reelKickerEnabled })}
        />
        {experience.reelKickerEnabled !== false ? (
          <div>
            <label className="pf-exp-block-label block">{t('Kicker text')}</label>
            <input
              type="text"
              value={experience.reelKickerText ?? '02 / Chronology'}
              onChange={(event) => onChange({ reelKickerText: event.target.value })}
              placeholder={t('02 / Chronology')}
              className="mt-3 w-full rounded-xl border border-[color:var(--pf-palette-bordure)] bg-transparent px-3.5 py-2.5 text-sm font-medium text-[color:var(--pf-palette-texte-fort)] placeholder:text-[color:var(--pf-palette-texte-muted)]"
            />
          </div>
        ) : null}
        <ExperienceToggleRow
          label={t('Entrance animation')}
          description={t('Title rises from a mask, kicker fades, subtitle slides in.')}
          checked={experience.reelHeaderAnimationEnabled !== false}
          onChange={(reelHeaderAnimationEnabled) => onChange({ reelHeaderAnimationEnabled })}
        />
      </div>
    </section>
  );
}

function ExperienceBillboardHeaderSettings({
  experience,
  onChange,
}: {
  experience: PortfolioExperienceSectionSettings;
  onChange: (patch: Partial<PortfolioExperienceSectionSettings>) => void;
}) {
  const t = useT();
  return (
    <section className="pf-exp-layout-settings" aria-labelledby="billboard-header-title">
      <h3 id="billboard-header-title" className="pf-exp-layout-settings-title">
        {t('Billboard')}
      </h3>
      <div className="pf-exp-layout-settings-body space-y-6">
        <ExperienceToggleRow
          label={t('Big title')}
          description={t('Full-width word above the section (e.g. EXPERIENCE).')}
          checked={experience.galleryBigTitleEnabled !== false}
          onChange={(galleryBigTitleEnabled) => onChange({ galleryBigTitleEnabled })}
        />
        {experience.galleryBigTitleEnabled !== false ? (
          <>
            <div>
              <label className="pf-exp-block-label block">{t('Big title word')}</label>
              <input
                type="text"
                value={experience.galleryBigTitleText ?? 'Experience'}
                onChange={(event) => onChange({ galleryBigTitleText: event.target.value })}
                placeholder={t('Experience')}
                className="mt-3 w-full rounded-xl border border-[color:var(--pf-palette-bordure)] bg-transparent px-3.5 py-2.5 text-sm font-medium text-[color:var(--pf-palette-texte-fort)] placeholder:text-[color:var(--pf-palette-texte-muted)]"
              />
            </div>
            <ExperienceOptionGrid
              label={t('Letter style')}
              options={PORTFOLIO_EXPERIENCE_GALLERY_BIG_TITLE_STYLE_OPTIONS}
              value={experience.galleryBigTitleStyle ?? 'outline'}
              onChange={(galleryBigTitleStyle) => onChange({ galleryBigTitleStyle })}
              columns={2}
            />
            <ExperienceOptionGrid
              label={t('Title color')}
              options={PORTFOLIO_EXPERIENCE_GALLERY_BIG_TITLE_COLOR_OPTIONS}
              value={experience.galleryBigTitleColor ?? 'current'}
              onChange={(galleryBigTitleColor) => onChange({ galleryBigTitleColor })}
              columns={3}
            />
          </>
        ) : null}
        <div>
          <label className="pf-exp-block-label block">{t('Secondary title')}</label>
          <input
            type="text"
            value={experience.gallerySecondaryTitleText ?? "Roles I've taken on"}
            onChange={(event) => onChange({ gallerySecondaryTitleText: event.target.value })}
            placeholder={t('Roles I\'ve taken on')}
            className="mt-3 w-full rounded-xl border border-[color:var(--pf-palette-bordure)] bg-transparent px-3.5 py-2.5 text-sm font-medium text-[color:var(--pf-palette-texte-fort)] placeholder:text-[color:var(--pf-palette-texte-muted)]"
          />
        </div>
        <ExperienceOptionGrid
          label={t('Secondary style')}
          options={PORTFOLIO_EXPERIENCE_GALLERY_SECONDARY_TITLE_STYLE_OPTIONS}
          value={experience.gallerySecondaryTitleStyle ?? 'editorial'}
          onChange={(gallerySecondaryTitleStyle) => onChange({ gallerySecondaryTitleStyle })}
          columns={2}
        />
        <ExperienceOptionGrid
          label={t('Role count')}
          options={PORTFOLIO_EXPERIENCE_GALLERY_ROLE_COUNT_STYLE_OPTIONS}
          value={experience.galleryRoleCountStyle ?? 'micro'}
          onChange={(galleryRoleCountStyle) => onChange({ galleryRoleCountStyle })}
          columns={3}
        />
        {(experience.galleryRoleCountStyle ?? 'micro') !== 'hidden' ? (
          <div>
            <label className="pf-exp-block-label block">{t('Role count text')}</label>
            <input
              type="text"
              value={experience.galleryRoleCountText ?? '{count} roles — click any card for the full story'}
              onChange={(event) => onChange({ galleryRoleCountText: event.target.value })}
              placeholder={t('{count} roles — click any card for the full story')}
              className="mt-3 w-full rounded-xl border border-[color:var(--pf-palette-bordure)] bg-transparent px-3.5 py-2.5 text-sm font-medium text-[color:var(--pf-palette-texte-fort)] placeholder:text-[color:var(--pf-palette-texte-muted)]"
            />
            <p className="mt-2 text-[11px] text-[color:var(--pf-palette-texte-muted)]">{t('Use')} {'{count}'} {t('for the number of roles.')}</p>
          </div>
        ) : null}
        <ExperienceToggleRow
          label={t('Entrance animation')}
          description={t('Billboard reveal on the big title, then the line below.')}
          checked={experience.galleryHeaderAnimationEnabled !== false}
          onChange={(galleryHeaderAnimationEnabled) => onChange({ galleryHeaderAnimationEnabled })}
        />
        {experience.galleryHeaderAnimationEnabled !== false ? (
          <ExperienceOptionGrid
            label={t('Animation intensity')}
            options={PORTFOLIO_EXPERIENCE_GALLERY_HEADER_ANIMATION_STYLE_OPTIONS}
            value={experience.galleryHeaderAnimationStyle ?? 'dramatic'}
            onChange={(galleryHeaderAnimationStyle) => onChange({ galleryHeaderAnimationStyle })}
            columns={3}
          />
        ) : null}
        <ExperienceToggleRow
          label={t('Scroll parallax')}
          description={t('The big title stays longer while the rest drifts away.')}
          checked={experience.galleryScrollParallaxEnabled !== false}
          onChange={(galleryScrollParallaxEnabled) => onChange({ galleryScrollParallaxEnabled })}
        />
      </div>
    </section>
  );
}

function ExperienceSplitHeadingHeaderSettings({
  experience,
  onChange,
}: {
  experience: PortfolioExperienceSectionSettings;
  onChange: (patch: Partial<PortfolioExperienceSectionSettings>) => void;
}) {
  const t = useT();
  return (
    <section className="pf-exp-layout-settings" aria-labelledby="split-heading-header-title">
      <h3 id="split-heading-header-title" className="pf-exp-layout-settings-title">
        {t('Split heading')}
      </h3>
      <div className="pf-exp-layout-settings-body space-y-6">
        <ExperienceToggleRow
          label={t('Entrance animation')}
          description={t('Title rises from a mask, label fades in from the right.')}
          checked={experience.loftHeaderAnimationEnabled !== false}
          onChange={(loftHeaderAnimationEnabled) => onChange({ loftHeaderAnimationEnabled })}
        />
      </div>
    </section>
  );
}

function ExperienceMastheadHeaderSettings({
  experience,
  onChange,
}: {
  experience: PortfolioExperienceSectionSettings;
  onChange: (patch: Partial<PortfolioExperienceSectionSettings>) => void;
}) {
  const t = useT();
  return (
    <section className="pf-exp-layout-settings" aria-labelledby="masthead-header-title">
      <h3 id="masthead-header-title" className="pf-exp-layout-settings-title">
        {t('Masthead')}
      </h3>
      <div className="pf-exp-layout-settings-body space-y-6">
        <ExperienceToggleRow
          label={t('Headline')}
          description={t('Monumental uppercase lines.')}
          checked={experience.pressHeadingEnabled !== false}
          onChange={(pressHeadingEnabled) => onChange({ pressHeadingEnabled })}
        />
        {experience.pressHeadingEnabled !== false ? (
          <div>
            <label className="pf-exp-block-label block">{t('Headline text')}</label>
            <input
              type="text"
              value={experience.pressHeadingText ?? 'Roles taken. Skills sharpened. Impact delivered.'}
              onChange={(event) => onChange({ pressHeadingText: event.target.value })}
              placeholder={t('Roles taken. Skills sharpened. Impact delivered.')}
              className="mt-3 w-full rounded-xl border border-[color:var(--pf-palette-bordure)] bg-transparent px-3.5 py-2.5 text-sm font-medium text-[color:var(--pf-palette-texte-fort)] placeholder:text-[color:var(--pf-palette-texte-muted)]"
            />
          </div>
        ) : null}
        <div>
          <label className="pf-exp-block-label block">{t('Intro line')}</label>
          <input
            type="text"
            value={experience.pressIntroText ?? ''}
            onChange={(event) => onChange({ pressIntroText: event.target.value })}
            placeholder={t('Selected roles, projects, and outcomes.')}
            className="mt-3 w-full rounded-xl border border-[color:var(--pf-palette-bordure)] bg-transparent px-3.5 py-2.5 text-sm font-medium text-[color:var(--pf-palette-texte-fort)] placeholder:text-[color:var(--pf-palette-texte-muted)]"
          />
        </div>
        <ExperienceOptionGrid
          label={t('Weight')}
          options={PORTFOLIO_EXPERIENCE_PRESS_HEADING_WEIGHT_STYLE_OPTIONS}
          value={experience.pressHeadingWeightStyle ?? 'alternating'}
          onChange={(pressHeadingWeightStyle) => onChange({ pressHeadingWeightStyle })}
          columns={2}
        />
        <ExperienceOptionGrid
          label={t('Alignment')}
          options={PORTFOLIO_EXPERIENCE_PRESS_HEADING_ALIGNMENT_OPTIONS}
          value={experience.pressHeadingAlignment ?? 'left'}
          onChange={(pressHeadingAlignment) => onChange({ pressHeadingAlignment })}
          columns={2}
        />
        <ExperienceOptionGrid
          label={t('Intro style')}
          options={PORTFOLIO_EXPERIENCE_PRESS_SUBTITLE_STYLE_OPTIONS}
          value={experience.pressSubtitleStyle ?? 'micro'}
          onChange={(pressSubtitleStyle) => onChange({ pressSubtitleStyle })}
          columns={3}
        />
        <ExperienceToggleRow
          label={t('Entrance animation')}
          description={t('Words reveal from a mask, line by line.')}
          checked={experience.pressHeaderAnimationEnabled !== false}
          onChange={(pressHeaderAnimationEnabled) => onChange({ pressHeaderAnimationEnabled })}
        />
        {experience.pressHeaderAnimationEnabled !== false ? (
          <ExperienceOptionGrid
            label={t('Reveal')}
            options={PORTFOLIO_EXPERIENCE_PRESS_ANIMATION_STYLE_OPTIONS}
            value={experience.pressHeaderAnimationStyle ?? 'staggered'}
            onChange={(pressHeaderAnimationStyle) => onChange({ pressHeaderAnimationStyle })}
            columns={3}
          />
        ) : null}
        <ExperienceToggleRow
          label={t('Scroll parallax')}
          description={t('Each line leaves at a different speed.')}
          checked={experience.pressScrollParallaxEnabled !== false}
          onChange={(pressScrollParallaxEnabled) => onChange({ pressScrollParallaxEnabled })}
        />
        {experience.pressScrollParallaxEnabled !== false ? (
          <ExperienceOptionGrid
            label={t('Parallax intensity')}
            options={PORTFOLIO_EXPERIENCE_PRESS_PARALLAX_INTENSITY_OPTIONS}
            value={experience.pressScrollParallaxIntensity ?? 'subtle'}
            onChange={(pressScrollParallaxIntensity) => onChange({ pressScrollParallaxIntensity })}
            columns={2}
          />
        ) : null}
      </div>
    </section>
  );
}

function ExperienceAccentTitleHeaderSettings({
  experience,
  onChange,
}: {
  experience: PortfolioExperienceSectionSettings;
  onChange: (patch: Partial<PortfolioExperienceSectionSettings>) => void;
}) {
  const t = useT();
  return (
    <section className="pf-exp-layout-settings" aria-labelledby="accent-title-header-title">
      <h3 id="accent-title-header-title" className="pf-exp-layout-settings-title">
        {t('Accent title')}
      </h3>
      <div className="pf-exp-layout-settings-body space-y-6">
        <ExperienceToggleRow
          label={t('Hero title')}
          description={t('Prefix plus a larger accent word.')}
          checked={experience.legacyHeadingEnabled !== false}
          onChange={(legacyHeadingEnabled) => onChange({ legacyHeadingEnabled })}
        />
        {experience.legacyHeadingEnabled !== false ? (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="pf-exp-block-label block">{t('Prefix')}</label>
                <input
                  type="text"
                  value={experience.legacyHeadingText ?? 'A Career Built on'}
                  onChange={(event) => onChange({ legacyHeadingText: event.target.value })}
                  placeholder={t('A Career Built on')}
                  className="mt-3 w-full rounded-xl border border-[color:var(--pf-palette-bordure)] bg-transparent px-3.5 py-2.5 text-sm font-medium text-[color:var(--pf-palette-texte-fort)] placeholder:text-[color:var(--pf-palette-texte-muted)]"
                />
              </div>
              <div>
                <label className="pf-exp-block-label block">{t('Accent word')}</label>
                <input
                  type="text"
                  value={experience.legacyHeadingAccentText ?? 'Craft'}
                  onChange={(event) => onChange({ legacyHeadingAccentText: event.target.value })}
                  placeholder={t('Craft')}
                  className="mt-3 w-full rounded-xl border border-[color:var(--pf-palette-bordure)] bg-transparent px-3.5 py-2.5 text-sm font-medium text-[color:var(--pf-palette-texte-fort)] placeholder:text-[color:var(--pf-palette-texte-muted)]"
                />
              </div>
            </div>
            <div>
              <label className="pf-exp-block-label block">{t('Intro sentence')}</label>
              <input
                type="text"
                value={experience.legacyIntroText ?? ''}
                onChange={(event) => onChange({ legacyIntroText: event.target.value })}
                placeholder={t('A selection of roles, teams, and problems solved along the way.')}
                className="mt-3 w-full rounded-xl border border-[color:var(--pf-palette-bordure)] bg-transparent px-3.5 py-2.5 text-sm font-medium text-[color:var(--pf-palette-texte-fort)] placeholder:text-[color:var(--pf-palette-texte-muted)]"
              />
            </div>
            <ExperienceOptionGrid
              label={t('Prefix weight')}
              options={PORTFOLIO_EXPERIENCE_LEGACY_PREFIX_WEIGHT_OPTIONS}
              value={experience.legacyPrefixWeight ?? 'light'}
              onChange={(legacyPrefixWeight) => onChange({ legacyPrefixWeight })}
              columns={3}
            />
            <ExperienceOptionGrid
              label={t('Accent style')}
              options={PORTFOLIO_EXPERIENCE_LEGACY_ACCENT_STYLE_OPTIONS}
              value={experience.legacyAccentStyle ?? 'italic-bold'}
              onChange={(legacyAccentStyle) => onChange({ legacyAccentStyle })}
              columns={3}
            />
            <ExperienceOptionGrid
              label={t('Accent size')}
              options={PORTFOLIO_EXPERIENCE_LEGACY_ACCENT_SIZE_OPTIONS}
              value={experience.legacyAccentSize ?? 'dramatic'}
              onChange={(legacyAccentSize) => onChange({ legacyAccentSize })}
              columns={3}
            />
            <ExperienceOptionGrid
              label={t('Intro style')}
              options={PORTFOLIO_EXPERIENCE_LEGACY_SUBTITLE_STYLE_OPTIONS}
              value={experience.legacySubtitleStyle ?? 'micro'}
              onChange={(legacySubtitleStyle) => onChange({ legacySubtitleStyle })}
              columns={3}
            />
            <ExperienceToggleRow
              label={t('Accent underline')}
              description={t('Hairline under the accent word.')}
              checked={experience.legacyAccentUnderline !== false}
              onChange={(legacyAccentUnderline) => onChange({ legacyAccentUnderline })}
            />
            {experience.legacyAccentUnderline !== false ? (
              <ExperienceOptionGrid
                label={t('Underline')}
                options={PORTFOLIO_EXPERIENCE_LEGACY_UNDERLINE_STYLE_OPTIONS}
                value={experience.legacyAccentUnderlineStyle ?? 'solid'}
                onChange={(legacyAccentUnderlineStyle) => onChange({ legacyAccentUnderlineStyle })}
                columns={2}
              />
            ) : null}
            <ExperienceToggleRow
              label={t('Entrance animation')}
              description={t('Prefix fades, accent word blooms, underline draws in.')}
              checked={experience.legacyHeaderAnimationEnabled !== false}
              onChange={(legacyHeaderAnimationEnabled) => onChange({ legacyHeaderAnimationEnabled })}
            />
            {experience.legacyHeaderAnimationEnabled !== false ? (
              <ExperienceOptionGrid
                label={t('Accent motion')}
                options={PORTFOLIO_EXPERIENCE_LEGACY_ANIMATION_STYLE_OPTIONS}
                value={experience.legacyHeaderAnimationStyle ?? 'bloom'}
                onChange={(legacyHeaderAnimationStyle) => onChange({ legacyHeaderAnimationStyle })}
                columns={3}
              />
            ) : null}
            <ExperienceToggleRow
              label={t('Scroll parallax')}
              description={t('The accent word stays while the prefix leaves.')}
              checked={experience.legacyScrollParallaxEnabled !== false}
              onChange={(legacyScrollParallaxEnabled) => onChange({ legacyScrollParallaxEnabled })}
            />
          </>
        ) : null}
      </div>
    </section>
  );
}

const EXPERIENCE_SUB_SECTIONS: { id: ExperienceSubSection; label: string; description: string }[] = [
  {
    id: 'general',
    label: msg('General'),
    description: msg('Section visibility and how responsibilities are shown.'),
  },
  {
    id: 'design',
    label: msg('Design'),
    description: msg('Choose the Experience layout design.'),
  },
  {
    id: 'header',
    label: msg('Header'),
    description: msg('Pick a header design — it applies above every Experience layout.'),
  },
];

/** Maps any legacy subsection id (media, palette, etc.) to a known Experience subsection. */
export function normalizeExperienceSubSection(value: string | undefined): ExperienceSubSection {
  if (value === 'general' || value === 'header' || value === 'design') return value;
  return 'design';
}

function ExperienceSwitchTrack({ checked }: { checked: boolean }) {
  return (
    <span
      className="relative h-5 w-9 shrink-0 rounded-full transition-colors duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]"
      style={{
        backgroundColor: checked
          ? 'var(--pf-palette-texte-fort, #171717)'
          : 'color-mix(in srgb, var(--pf-palette-texte-fort, #ffffff) 22%, var(--pf-palette-fond, #0a0a0a))',
      }}
    >
      <span
        className="absolute top-0.5 h-4 w-4 rounded-full transition-[left,background-color] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{
          left: checked ? '1.125rem' : '0.125rem',
          backgroundColor: checked
            ? 'var(--pf-palette-fond, #ffffff)'
            : 'var(--pf-palette-texte-fort, #ffffff)',
        }}
      />
    </span>
  );
}

function ExperienceToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  const rows = useSettingsRows();
  if (rows) return <SettingRow label={label} toggle={{ checked, onChange }} />;
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full cursor-pointer flex-col gap-1 text-left"
    >
      <span className="flex items-center justify-between gap-4">
        <span className="min-w-0 text-sm font-semibold text-[color:var(--pf-palette-texte-fort)]">{label}</span>
        <ExperienceSwitchTrack checked={checked} />
      </span>
      {description ? <span className="text-sm text-[color:var(--pf-palette-texte-muted)]">{description}</span> : null}
    </button>
  );
}

function ExperienceOptionalTextField({
  label,
  value,
  placeholder,
  checked,
  onCheckedChange,
  onValueChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  onValueChange: (value: string) => void;
}) {
  return (
    <div>
      <ExperienceToggleRow label={label} checked={checked} onChange={onCheckedChange} />
      <div
        className={`grid transition-[grid-template-rows,opacity] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          checked ? 'grid-rows-[1fr] opacity-100' : 'pointer-events-none grid-rows-[0fr] opacity-0'
        }`}
        aria-hidden={!checked}
      >
        <div className="overflow-hidden">
          <input
            type="text"
            value={value}
            disabled={!checked}
            tabIndex={checked ? 0 : -1}
            onChange={(event) => onValueChange(event.target.value)}
            placeholder={placeholder}
            className="mt-2 w-full rounded-xl border border-[color:var(--pf-palette-bordure)] bg-transparent px-3.5 py-2.5 text-sm font-medium text-[color:var(--pf-palette-texte-fort)] placeholder:text-[color:var(--pf-palette-texte-muted)]"
          />
        </div>
      </div>
    </div>
  );
}

function ExperienceVisibilityBadge({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      onClick={() => onChange(!checked)}
      className="rounded-full px-4 py-1.5 text-[13px] font-medium tracking-tight transition-colors duration-200"
      style={
        checked
          ? {
              color: 'var(--pf-palette-texte-fort, #ffffff)',
              backgroundColor: 'color-mix(in srgb, var(--pf-palette-texte-fort, #ffffff) 8%, transparent)',
              boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--pf-palette-texte-fort, #ffffff) 16%, transparent)',
            }
          : {
              color: 'color-mix(in srgb, var(--pf-palette-texte-fort, #ffffff) 30%, transparent)',
              backgroundColor: 'transparent',
            }
      }
    >
      {label}
    </button>
  );
}

function ExperienceDesignWireframe({ design }: { design: PortfolioExperienceDesign }) {
  const t = useT();
  switch (design) {
    case 'editorial':
      return (
        <MiniSlide>
          <rect className="pf-exp-mini-ink" x="8" y="10" width="24" height="52" rx="3" />
          <MiniType x={12} y={24} size={6}>
            {t('15Y')}
          </MiniType>
          <rect className="pf-exp-mini-mute" x="12" y="30" width="16" height="2.4" rx="1.2" />
          <rect className="pf-exp-mini-mute" x="12" y="36" width="12" height="2.2" rx="1.1" />
          <MiniType x={38} y={20} size={7}>
            {t('EXP.')}
          </MiniType>
          <rect className="pf-exp-mini-mute" x="38" y="26" width="48" height="3" rx="1.4" />
          <rect className="pf-exp-mini-mute" x="38" y="33" width="36" height="2.6" rx="1.3" />
          <rect className="pf-exp-mini-ink" x="86" y="40" width="26" height="22" rx="2.5" />
        </MiniSlide>
      );
    case 'milestone':
      return (
        <MiniSlide>
          <rect className="pf-exp-mini-accent" x="15.2" y="10" width="1.6" height="52" rx="0.8" />
          <circle className="pf-exp-mini-ink" cx="16" cy="16" r="2.6" />
          <circle className="pf-exp-mini-ink" cx="16" cy="36" r="2.6" />
          <circle className="pf-exp-mini-ink" cx="16" cy="56" r="2.6" />
          <rect className="pf-exp-mini-ink" x="26" y="11" width="78" height="12" rx="2.5" />
          <rect className="pf-exp-mini-mute" x="26" y="30" width="66" height="10" rx="2.5" />
          <rect className="pf-exp-mini-mute" x="26" y="48" width="72" height="12" rx="2.5" />
        </MiniSlide>
      );
    case 'table':
      return (
        <MiniSlide>
          <rect className="pf-exp-mini-ink" x="8" y="10" width="104" height="10" rx="2" />
          <rect className="pf-exp-mini-mute" x="8" y="24" width="104" height="9" rx="1.8" />
          <rect className="pf-exp-mini-mute" x="8" y="36" width="104" height="9" rx="1.8" />
          <rect className="pf-exp-mini-mute" x="8" y="48" width="104" height="9" rx="1.8" />
          <MiniType x={12} y={17.5} size={5.5}>
            01/
          </MiniType>
        </MiniSlide>
      );
    case 'cards':
      return (
        <MiniSlide>
          <rect className="pf-exp-mini-ink" x="8" y="10" width="48" height="52" rx="4" />
          <rect className="pf-exp-mini-mute" x="14" y="18" width="28" height="3" rx="1.4" />
          <rect className="pf-exp-mini-mute" x="14" y="25" width="20" height="2.4" rx="1.2" />
          <rect className="pf-exp-mini-ink" x="64" y="10" width="48" height="52" rx="4" />
          <rect className="pf-exp-mini-mute" x="70" y="18" width="28" height="3" rx="1.4" />
          <rect className="pf-exp-mini-mute" x="70" y="25" width="18" height="2.4" rx="1.2" />
        </MiniSlide>
      );
    case 'reel':
      return (
        <MiniSlide>
          <rect className="pf-exp-mini-ink" x="36" y="6" width="48" height="60" rx="6" />
          <MiniType x={60} y={24} size={7} anchor="middle">
            01/
          </MiniType>
          <rect className="pf-exp-mini-mute" x="44" y="32" width="32" height="3" rx="1.4" />
          <rect className="pf-exp-mini-mute" x="44" y="39" width="22" height="2.4" rx="1.2" />
        </MiniSlide>
      );
    case 'duotone':
      return (
        <MiniSlide>
          <MiniType x={10} y={24} size={7}>
            {t('EXP.')}
          </MiniType>
          <rect className="pf-exp-mini-mute" x="10" y="30" width="42" height="3" rx="1.4" />
          <rect className="pf-exp-mini-mute" x="10" y="37" width="32" height="2.6" rx="1.3" />
          <rect className="pf-exp-mini-mute" x="10" y="44" width="36" height="2.6" rx="1.3" />
          <rect className="pf-exp-mini-ink" x="62" y="10" width="50" height="52" rx="4" />
        </MiniSlide>
      );
    case 'gallery':
      return (
        <MiniSlide>
          <rect className="pf-exp-mini-ink" x="8" y="8" width="48" height="26" rx="3" />
          <MiniType x={14} y={24} size={6}>
            {t('EXP.')}
          </MiniType>
          <rect className="pf-exp-mini-mute" x="64" y="8" width="48" height="26" rx="3" />
          <rect className="pf-exp-mini-mute" x="8" y="38" width="48" height="26" rx="3" />
          <rect className="pf-exp-mini-ink" x="64" y="38" width="48" height="26" rx="3" />
        </MiniSlide>
      );
    case 'loft':
      return (
        <MiniSlide>
          <rect className="pf-exp-mini-ink" x="8" y="9" width="18" height="14" rx="2.5" />
          <rect className="pf-exp-mini-mute" x="32" y="12" width="72" height="3" rx="1.4" />
          <rect className="pf-exp-mini-mute" x="32" y="18" width="48" height="2.4" rx="1.2" />
          <rect className="pf-exp-mini-ink" x="8" y="29" width="18" height="14" rx="2.5" />
          <rect className="pf-exp-mini-mute" x="32" y="32" width="72" height="3" rx="1.4" />
          <rect className="pf-exp-mini-mute" x="32" y="38" width="40" height="2.4" rx="1.2" />
          <rect className="pf-exp-mini-ink" x="8" y="49" width="18" height="14" rx="2.5" />
          <rect className="pf-exp-mini-mute" x="32" y="52" width="72" height="3" rx="1.4" />
          <rect className="pf-exp-mini-mute" x="32" y="58" width="52" height="2.4" rx="1.2" />
        </MiniSlide>
      );
    case 'press':
      return (
        <MiniSlide>
          <rect className="pf-exp-mini-accent" x="8" y="10" width="104" height="1.6" rx="0.8" />
          <MiniType x={8} y={24} size={6.5}>
            01/
          </MiniType>
          <rect className="pf-exp-mini-mute" x="8" y="30" width="46" height="3" rx="1.4" />
          <rect className="pf-exp-mini-mute" x="8" y="37" width="38" height="2.6" rx="1.3" />
          <rect className="pf-exp-mini-mute" x="8" y="44" width="42" height="2.6" rx="1.3" />
          <rect className="pf-exp-mini-ink" x="66" y="28" width="46" height="3" rx="1.4" />
          <rect className="pf-exp-mini-mute" x="66" y="35" width="36" height="2.6" rx="1.3" />
          <rect className="pf-exp-mini-mute" x="66" y="42" width="42" height="2.6" rx="1.3" />
        </MiniSlide>
      );
    case 'legacy':
      return (
        <MiniSlide>
          <MiniType x={10} y={20} size={7}>
            {t('CRAFT')}
          </MiniType>
          <rect className="pf-exp-mini-ink" x="10" y="26" width="38" height="34" rx="3" />
          <rect className="pf-exp-mini-mute" x="56" y="30" width="54" height="3" rx="1.4" />
          <rect className="pf-exp-mini-mute" x="56" y="38" width="40" height="2.6" rx="1.3" />
          <rect className="pf-exp-mini-mute" x="56" y="46" width="48" height="2.6" rx="1.3" />
        </MiniSlide>
      );
    case 'kinetic':
      return (
        <MiniSlide>
          <rect className="pf-exp-mini-ink" x="8" y="12" width="104" height="11" rx="1.6" />
          <rect className="pf-exp-mini-ink" x="8" y="28" width="90" height="11" rx="1.6" />
          <rect className="pf-exp-mini-ink" x="8" y="44" width="72" height="11" rx="1.6" />
          <rect className="pf-exp-mini-mute" x="8" y="60" width="20" height="2" rx="1" />
          <rect className="pf-exp-mini-mute" x="92" y="60" width="20" height="2" rx="1" />
        </MiniSlide>
      );
    default: {
      const _exhaustive: never = design;
      return _exhaustive;
    }
  }
}

function ExperienceLayoutSettingsBand({
  children,
  motionKey,
}: {
  children: ReactNode;
  motionKey: string;
}) {
  const t = useT();
  return (
    <section className="pf-exp-layout-settings" aria-labelledby="experience-layout-settings-title">
      <h3 id="experience-layout-settings-title" className="pf-exp-layout-settings-title">
        {t('Layout settings')}
      </h3>
      <div key={motionKey} className="pf-exp-layout-settings-body space-y-7">
        {children}
      </div>
    </section>
  );
}

function ExperienceDesignChoiceGrid({
  value,
  onChange,
}: {
  value: PortfolioExperienceDesign;
  onChange: (value: PortfolioExperienceDesign) => void;
}) {
  const t = useT();
  const [showGrid, setShowGrid] = useState(false);
  const selected =
    PORTFOLIO_EXPERIENCE_DESIGN_OPTIONS.find((option) => option.value === value) ??
    PORTFOLIO_EXPERIENCE_DESIGN_OPTIONS[0];
  const previewSource = usePortfolioDesignPreviewSource();

  if (showGrid) {
    return (
      <div>
        <div className="flex items-center justify-between gap-3">
          <p className="pf-exp-block-label !mb-0">{t('Item design')}</p>
          <button
            type="button"
            onClick={() => setShowGrid(false)}
            className="text-sm font-semibold text-[color:var(--pf-palette-texte-muted)] hover:text-[color:var(--pf-palette-texte-fort)]"
          >
            {t('← Back')}
          </button>
        </div>
        {previewSource ? (
          /* In the studio: every design rendered for real, one per row. */
          <div className="mt-3 flex flex-col gap-3">
            {PORTFOLIO_EXPERIENCE_DESIGN_OPTIONS.map((option) => (
              <PortfolioDesignLivePreviewCard
                key={option.value}
                cardClassName="pf-exp-design-card"
                labelClassName="pf-exp-card-label"
                active={option.value === value}
                label={t(option.label)}
                src={withDesignPreview(previewSource.portfolioPath, { section: 'experience', design: option.value })}
                settings={previewSource.settings}
                onClick={() => {
                  onChange(option.value);
                  setShowGrid(false);
                }}
              />
            ))}
          </div>
        ) : (
        <div className="mt-3 grid grid-cols-2 gap-4">
          {PORTFOLIO_EXPERIENCE_DESIGN_OPTIONS.map((option) => {
            const active = option.value === value;
            return (
              <ExperiencePickerCard
                key={option.value}
                active={active}
                label={t(option.label)}
                onClick={() => {
                  onChange(option.value);
                  setShowGrid(false);
                }}
              >
                <ExperienceDesignWireframe design={option.value} />
              </ExperiencePickerCard>
            );
          })}
        </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <p className="pf-exp-block-label">{t('Item design')}</p>
      <div className="group relative w-full overflow-hidden rounded-2xl border border-[color:var(--pf-palette-bordure)] p-3">
        <ExperienceDesignWireframe design={value} />
        <button
          type="button"
          onClick={() => setShowGrid(true)}
          aria-label={t('Change design')}
          className="absolute inset-0 hidden items-center justify-center bg-black/55 opacity-0 outline-none transition-opacity duration-150 hover:opacity-100 focus-visible:opacity-100 sm:flex"
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-transparent px-4 py-2 text-sm font-semibold text-[color:var(--pf-palette-texte-fort)] shadow-lg">
            {t('Change design')}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setShowGrid(true)}
          aria-label={t('Change design')}
          className="absolute bottom-2 right-2 inline-flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1.5 text-xs font-semibold text-white sm:hidden"
        >
          {t('Change')}
        </button>
      </div>
      <p className="mt-2 text-sm font-semibold text-[color:var(--pf-palette-texte-fort)]">{t(selected.label)}</p>
    </div>
  );
}

function ExperienceTasksDisplayWireframe({
  display,
}: {
  display: PortfolioExperienceTasksDisplay;
}) {
  switch (display) {
    case 'engineering-grid':
      return (
        <MiniSlide>
          <rect className="pf-exp-mini-ink" x="12" y="16" width="44" height="18" rx="2.5" />
          <rect className="pf-exp-mini-mute" x="64" y="16" width="44" height="18" rx="2.5" />
          <rect className="pf-exp-mini-mute" x="12" y="40" width="44" height="18" rx="2.5" />
          <rect className="pf-exp-mini-ink" x="64" y="40" width="44" height="18" rx="2.5" />
        </MiniSlide>
      );
    case 'cinematic-timeline':
      return (
        <MiniSlide>
          <rect className="pf-exp-mini-accent" x="22" y="12" width="1.6" height="48" rx="0.8" />
          <circle className="pf-exp-mini-ink" cx="22.8" cy="18" r="2.4" />
          <circle className="pf-exp-mini-ink" cx="22.8" cy="36" r="2.4" />
          <circle className="pf-exp-mini-ink" cx="22.8" cy="54" r="2.4" />
          <rect className="pf-exp-mini-mute" x="34" y="15" width="68" height="6" rx="1.6" />
          <rect className="pf-exp-mini-mute" x="34" y="33" width="54" height="6" rx="1.6" />
          <rect className="pf-exp-mini-mute" x="34" y="51" width="62" height="6" rx="1.6" />
        </MiniSlide>
      );
    case 'editorial-dash':
      return (
        <MiniSlide>
          <rect className="pf-exp-mini-ink" x="14" y="20" width="18" height="1.6" rx="0.8" />
          <rect className="pf-exp-mini-mute" x="38" y="18" width="68" height="5.5" rx="1.5" />
          <rect className="pf-exp-mini-ink" x="14" y="36" width="18" height="1.6" rx="0.8" />
          <rect className="pf-exp-mini-mute" x="38" y="34" width="58" height="5.5" rx="1.5" />
          <rect className="pf-exp-mini-ink" x="14" y="52" width="18" height="1.6" rx="0.8" />
          <rect className="pf-exp-mini-mute" x="38" y="50" width="64" height="5.5" rx="1.5" />
        </MiniSlide>
      );
    case 'accordion-stack':
      return (
        <MiniSlide>
          <rect className="pf-exp-mini-mute" x="14" y="16" width="92" height="1" rx="0.5" />
          <rect className="pf-exp-mini-ink" x="14" y="22" width="10" height="4" rx="1" />
          <rect className="pf-exp-mini-mute" x="30" y="21" width="76" height="5.5" rx="1.4" />
          <rect className="pf-exp-mini-mute" x="14" y="34" width="92" height="1" rx="0.5" />
          <rect className="pf-exp-mini-ink" x="14" y="40" width="10" height="4" rx="1" />
          <rect className="pf-exp-mini-mute" x="30" y="39" width="64" height="5.5" rx="1.4" />
          <rect className="pf-exp-mini-mute" x="14" y="52" width="92" height="1" rx="0.5" />
          <rect className="pf-exp-mini-ink" x="14" y="58" width="10" height="4" rx="1" />
          <rect className="pf-exp-mini-mute" x="30" y="57" width="70" height="5.5" rx="1.4" />
        </MiniSlide>
      );
    case 'architectural-index':
      return (
        <MiniSlide>
          <MiniType x={14} y={24} size={7}>
            01
          </MiniType>
          <rect className="pf-exp-mini-mute" x="36" y="18" width="70" height="5" rx="1.4" />
          <MiniType x={14} y={40} size={7}>
            02
          </MiniType>
          <rect className="pf-exp-mini-mute" x="36" y="34" width="58" height="5" rx="1.4" />
          <MiniType x={14} y={56} size={7}>
            03
          </MiniType>
          <rect className="pf-exp-mini-mute" x="36" y="50" width="64" height="5" rx="1.4" />
        </MiniSlide>
      );
    default: {
      const _exhaustive: never = display;
      return _exhaustive;
    }
  }
}

function ExperienceTasksDisplayChoiceGrid({
  value,
  onChange,
}: {
  value: PortfolioExperienceTasksDisplay;
  onChange: (value: PortfolioExperienceTasksDisplay) => void;
}) {
  const t = useT();
  return (
    <div>
      <p className="pf-exp-block-label pf-exp-option-label">{t('Tasks display')}</p>
      <div
        role="radiogroup"
        aria-label={t('Tasks display')}
        className="grid grid-cols-2 gap-2"
      >
        {PORTFOLIO_EXPERIENCE_TASKS_DISPLAY_OPTIONS.map((option) => {
          const active = option.value === value;
          return (
            <ExperiencePickerCard
              key={option.value}
              active={active}
              label={t(option.label)}
              onClick={() => onChange(option.value)}
            >
              <ExperienceTasksDisplayWireframe display={option.value} />
            </ExperiencePickerCard>
          );
        })}
      </div>
    </div>
  );
}

function ExperienceToolsBadgeStyleWireframe({
  display,
}: {
  display: PortfolioExperienceToolsBadgeStyle;
}) {
  switch (display) {
    case 'mineral-pills':
      return (
        <MiniSlide>
          <rect className="pf-exp-mini-mute" x="12" y="26" width="26" height="12" rx="6" />
          <rect className="pf-exp-mini-mute" x="42" y="26" width="34" height="12" rx="6" />
          <rect className="pf-exp-mini-ink" x="80" y="26" width="26" height="12" rx="6" />
          <rect className="pf-exp-mini-mute" x="12" y="42" width="30" height="12" rx="6" />
          <rect className="pf-exp-mini-mute" x="46" y="42" width="24" height="12" rx="6" />
        </MiniSlide>
      );
    case 'editorial-list':
      return (
        <MiniSlide>
          <rect className="pf-exp-mini-mute" x="12" y="32" width="22" height="5" rx="1.4" />
          <circle className="pf-exp-mini-mute" cx="40" cy="34.5" r="1.4" />
          <rect className="pf-exp-mini-ink" x="46" y="32" width="26" height="5" rx="1.4" />
          <circle className="pf-exp-mini-mute" cx="78" cy="34.5" r="1.4" />
          <rect className="pf-exp-mini-mute" x="84" y="32" width="20" height="5" rx="1.4" />
        </MiniSlide>
      );
    case 'kinetic-marquee':
      return (
        <MiniSlide>
          <rect className="pf-exp-mini-mute" x="6" y="18" width="22" height="36" rx="2" opacity="0.32" />
          <rect className="pf-exp-mini-mute" x="34" y="18" width="22" height="36" rx="2" opacity="0.32" />
          <rect className="pf-exp-mini-mute" x="62" y="18" width="22" height="36" rx="2" opacity="0.32" />
          <rect className="pf-exp-mini-mute" x="90" y="18" width="22" height="36" rx="2" opacity="0.32" />
        </MiniSlide>
      );
    case 'numbered-index':
      return (
        <MiniSlide>
          <MiniType x={14} y={24} size={6}>
            01 /
          </MiniType>
          <rect className="pf-exp-mini-mute" x="34" y="19" width="28" height="5" rx="1.4" />
          <MiniType x={70} y={24} size={6}>
            02 /
          </MiniType>
          <rect className="pf-exp-mini-mute" x="90" y="19" width="18" height="5" rx="1.4" />
          <MiniType x={14} y={48} size={6}>
            03 /
          </MiniType>
          <rect className="pf-exp-mini-mute" x="34" y="43" width="24" height="5" rx="1.4" />
        </MiniSlide>
      );
    default: {
      const _exhaustive: never = display;
      return _exhaustive;
    }
  }
}

function ExperienceToolsBadgeStyleChoiceGrid({
  value,
  onChange,
}: {
  value: PortfolioExperienceToolsBadgeStyle;
  onChange: (value: PortfolioExperienceToolsBadgeStyle) => void;
}) {
  const t = useT();
  return (
    <div>
      <p className="pf-exp-block-label pf-exp-option-label">{t('Tools display')}</p>
      <div
        role="radiogroup"
        aria-label={t('Tools display')}
        className="grid grid-cols-2 gap-2"
      >
        {PORTFOLIO_EXPERIENCE_TOOLS_BADGE_STYLE_OPTIONS.map((option) => {
          const active = option.value === value;
          return (
            <ExperiencePickerCard
              key={option.value}
              active={active}
              label={t(option.label)}
              onClick={() => onChange(option.value)}
            >
              <ExperienceToolsBadgeStyleWireframe display={option.value} />
            </ExperiencePickerCard>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Compact alternative to a slider for an ordered axis with few options (e.g. small → large)
 * in space-constrained settings panels: each option's label is rendered at a progressively
 * larger size so the scale reads at a glance, without needing a live-preview slider.
 */
function ExperienceScalePill<T extends string>({
  label,
  options,
  sizes,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string; description?: string }[];
  /** Font size (px) for each option, in the same order as `options`. */
  sizes: number[];
  value: T;
  onChange: (value: T) => void;
}) {
  const t = useT();
  const rows = useSettingsRows();
  return (
    <SettingRow label={label} value={String(options.find((option) => option.value === value)?.label ?? '')}>
    <div>
      {rows ? null : (<p className="pf-exp-block-label pf-exp-option-label">{label}</p>)}
      <div role="radiogroup" aria-label={label} className="pf-exp-scale-pill">
        {options.map((option, index) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={active}
              title={t(option.description)}
              data-active={active ? 'true' : 'false'}
              onClick={() => onChange(option.value)}
              className="pf-exp-scale-pill-btn"
              style={{ fontSize: `${sizes[index] ?? sizes[sizes.length - 1]}px` }}
            >
              {t(option.label)}
            </button>
          );
        })}
      </div>
    </div>
    </SettingRow>
  );
}

function ExperienceOptionGrid<T extends string | number>({
  label,
  options,
  value,
  onChange,
  columns,
}: {
  label: string;
  options: { value: T; label: string; description?: string }[];
  value: T | '';
  onChange: (value: T) => void;
  columns?: number;
}) {
  const t = useT();
  const rows = useSettingsRows();
  const count = options.length;
  const cols = columns ?? (count <= 3 ? Math.max(count, 1) : 2);
  const compact = cols === count && count >= 2 && count <= 4;
  return (
    <SettingRow label={label} value={String(options.find((option) => option.value === value)?.label ?? '')}>
    <div>
      {rows ? null : (<p className="pf-exp-block-label pf-exp-option-label">{label}</p>)}
      <div
        role="radiogroup"
        aria-label={label}
        className="pf-exp-segment grid gap-[3px] p-[3px]"
        data-compact={compact ? 'true' : 'false'}
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        }}
      >
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={String(option.value)}
              type="button"
              role="radio"
              aria-checked={active}
              title={t(option.description)}
              onClick={() => onChange(option.value)}
              data-active={active ? 'true' : 'false'}
              className="pf-exp-segment-btn px-2.5 py-1.5 text-center text-[13px] font-medium tracking-tight"
              style={
                active
                  ? undefined
                  : { color: '#c4c4c4', WebkitTextFillColor: '#c4c4c4' }
              }
            >
              {t(option.label)}
            </button>
          );
        })}
      </div>
    </div>
    </SettingRow>
  );
}

/** Actual rounded-rect preview for a given thumbnail radius, used inside the "Thumbnail corners" picker. */
function ExperienceThumbnailRadiusWireframe({
  radius,
}: {
  radius: PortfolioExperienceCardsBorderRadius;
}) {
  const rx = radius === 'none' ? 0 : radius === 'xl' ? 14 : 6;
  return (
    <MiniSlide>
      <rect className="pf-exp-mini-ink" x="36" y="10" width="48" height="38" rx={rx} />
      <rect className="pf-exp-mini-mute" x="36" y="54" width="30" height="3" rx="1.4" />
      <rect className="pf-exp-mini-mute" x="36" y="60" width="20" height="2.4" rx="1.2" />
    </MiniSlide>
  );
}

function ExperienceThumbnailRadiusChoiceGrid({
  value,
  onChange,
  label = 'Thumbnail corners',
}: {
  value: PortfolioExperienceCardsBorderRadius;
  onChange: (value: PortfolioExperienceCardsBorderRadius) => void;
  label?: string;
}) {
  const t = useT();
  const rows = useSettingsRows();
  return (
    <SettingRow label={label} value={String(value ?? '')}>
    <div>
      {rows ? null : (<p className="pf-exp-block-label pf-exp-option-label">{label}</p>)}
      <div role="radiogroup" aria-label={label} className="grid grid-cols-3 gap-2">
        {PORTFOLIO_EXPERIENCE_CARDS_BORDER_RADIUS_OPTIONS.map((option) => {
          const active = option.value === value;
          return (
            <ExperiencePickerCard
              key={option.value}
              active={active}
              label={t(option.label)}
              compact
              onClick={() => onChange(option.value)}
            >
              <ExperienceThumbnailRadiusWireframe radius={option.value} />
            </ExperiencePickerCard>
          );
        })}
      </div>
    </div>
    </SettingRow>
  );
}

/** N evenly spaced bars — glyph for "columns per row" preview cards (same idea as the
 * Work/Stack/Tools panels' own columns glyph, ported to the pf-exp-mini-* palette). */
function experienceColumnsGlyph(n: number) {
  const gap = 6;
  const totalWidth = 92;
  const startX = 14;
  const barWidth = (totalWidth - gap * (n - 1)) / n;
  return Array.from({ length: n }, (_, i) => (
    <rect
      key={i}
      className="pf-exp-mini-ink"
      x={startX + i * (barWidth + gap)}
      y={18}
      width={barWidth}
      height={36}
      rx={2.5}
    />
  ));
}

function ExperienceLoftColumnsChoiceGrid({
  value,
  onChange,
}: {
  value: PortfolioExperienceLoftColumns;
  onChange: (value: PortfolioExperienceLoftColumns) => void;
}) {
  const t = useT();
  return (
    <div>
      <p className="pf-exp-block-label pf-exp-option-label">{t('Columns per row')}</p>
      <div role="radiogroup" aria-label={t('Columns per row')} className="grid grid-cols-3 gap-2">
        {PORTFOLIO_EXPERIENCE_LOFT_COLUMNS_OPTIONS.map((option) => {
          const active = option.value === value;
          return (
            <ExperiencePickerCard
              key={option.value}
              active={active}
              label={t(option.label)}
              compact
              onClick={() => onChange(option.value)}
            >
              <MiniSlide>{experienceColumnsGlyph(option.value)}</MiniSlide>
            </ExperiencePickerCard>
          );
        })}
      </div>
    </div>
  );
}

function ExperienceGalleryColumnsChoiceGrid({
  value,
  onChange,
}: {
  value: PortfolioExperienceGalleryColumns;
  onChange: (value: PortfolioExperienceGalleryColumns) => void;
}) {
  const t = useT();
  return (
    <div>
      <p className="pf-exp-block-label pf-exp-option-label">{t('Columns per row')}</p>
      <div role="radiogroup" aria-label={t('Columns per row')} className="grid grid-cols-2 gap-2">
        {PORTFOLIO_EXPERIENCE_GALLERY_COLUMNS_OPTIONS.map((option) => {
          const active = option.value === value;
          return (
            <ExperiencePickerCard
              key={option.value}
              active={active}
              label={t(option.label)}
              compact
              onClick={() => onChange(option.value)}
            >
              <MiniSlide>{experienceColumnsGlyph(option.value)}</MiniSlide>
            </ExperiencePickerCard>
          );
        })}
      </div>
    </div>
  );
}

/** Two bars with a gap sized per tier — same "2 mini-blocks, real gap" idea as Global's
 * section-spacing preview, as a static card grid instead of a slider (keeps this reading
 * as one family with the Columns-per-row cards right above it). */
function ExperienceItemGapWireframe({ gap }: { gap: PortfolioExperienceItemGap }) {
  const gapPx = gap === 'sm' ? 4 : gap === 'lg' ? 18 : gap === 'xl' ? 30 : 10;
  const barHeight = 10;
  const startY = (72 - (barHeight * 2 + gapPx)) / 2;
  return (
    <MiniSlide>
      <rect className="pf-exp-mini-ink" x="14" y={startY} width="92" height={barHeight} rx="2.5" />
      <rect className="pf-exp-mini-ink" x="14" y={startY + barHeight + gapPx} width="92" height={barHeight} rx="2.5" />
    </MiniSlide>
  );
}

function ExperienceItemGapChoiceGrid({
  value,
  onChange,
}: {
  value: PortfolioExperienceItemGap;
  onChange: (value: PortfolioExperienceItemGap) => void;
}) {
  const t = useT();
  return (
    <div>
      <p className="pf-exp-block-label pf-exp-option-label">{t('Gap')}</p>
      <div role="radiogroup" aria-label={t('Gap')} className="grid grid-cols-4 gap-2">
        {PORTFOLIO_EXPERIENCE_ITEM_GAP_OPTIONS.map((option) => {
          const active = option.value === value;
          return (
            <ExperiencePickerCard
              key={option.value}
              active={active}
              label={t(option.label)}
              compact
              onClick={() => onChange(option.value)}
            >
              <ExperienceItemGapWireframe gap={option.value} />
            </ExperiencePickerCard>
          );
        })}
      </div>
    </div>
  );
}

/** Small keyboard-accessible "i" tooltip — shows non-obvious info on hover or focus.
 * A `span` trigger, not `button`: this sits inside ExperienceOptionGridWithInfo's own
 * <button role="radio">, and a <button> can never nest another <button>. */
function ExperienceInfoTooltip({ text }: { text: string }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const tooltipId = useId();
  return (
    <span className="relative inline-flex shrink-0">
      <span
        role="button"
        tabIndex={0}
        aria-describedby={open ? tooltipId : undefined}
        aria-label={t('More info: {text}', { text })}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={(event) => event.stopPropagation()}
        className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full text-[color:var(--pf-palette-texte-muted)] transition hover:text-[color:var(--pf-palette-texte-fort)] focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
      >
        <svg viewBox="0 0 14 14" width="14" height="14" fill="none" aria-hidden="true">
          <circle cx="7" cy="7" r="6.1" stroke="currentColor" strokeWidth="1.15" />
          <circle cx="7" cy="4.35" r="0.95" fill="currentColor" />
          <rect x="6.3" y="6.05" width="1.4" height="4.4" rx="0.7" fill="currentColor" />
        </svg>
      </span>
      {open ? (
        <span
          id={tooltipId}
          role="tooltip"
          className="pointer-events-none absolute left-1/2 top-full z-20 mt-1.5 w-max max-w-[220px] -translate-x-1/2 rounded-lg bg-neutral-900 px-2.5 py-1.5 text-xs font-medium leading-snug text-white shadow-lg"
        >
          {text}
        </span>
      ) : null}
    </span>
  );
}

/** Same pill grid as ExperienceOptionGrid, plus a per-option info tooltip — for choices
 * whose names are too abstract to guess from a single word alone (e.g. Loft's "Hover
 * moment": Project Curtain / Magnetic Cue / Press In). Kept separate from the generic
 * ExperienceOptionGrid so every other design's plain pill grids are untouched. */
function ExperienceOptionGridWithInfo<T extends string | number>({
  label,
  options,
  value,
  onChange,
  columns,
}: {
  label: string;
  options: { value: T; label: string; description?: string }[];
  value: T | '';
  onChange: (value: T) => void;
  columns?: number;
}) {
  const t = useT();
  const count = options.length;
  const cols = columns ?? (count <= 3 ? Math.max(count, 1) : 2);
  const compact = cols === count && count >= 2 && count <= 4;
  return (
    <div>
      <p className="pf-exp-block-label pf-exp-option-label">{label}</p>
      <div
        role="radiogroup"
        aria-label={label}
        className="pf-exp-segment grid gap-[3px] p-[3px]"
        data-compact={compact ? 'true' : 'false'}
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        }}
      >
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={String(option.value)}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(option.value)}
              data-active={active ? 'true' : 'false'}
              className="pf-exp-segment-btn flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-center text-[13px] font-medium tracking-tight"
              style={active ? undefined : { color: '#c4c4c4', WebkitTextFillColor: '#c4c4c4' }}
            >
              <span className="truncate">{t(option.label)}</span>
              {option.description ? <ExperienceInfoTooltip text={t(option.description)} /> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** The actual micro-animation for one "Hover moment" preview card — plays on real hover,
 * keyboard focus, and (via CSS only, no JS) on a slow auto-loop on touch devices that have
 * no hover at all. Purely decorative, so it's aria-hidden — the option's own label + the
 * radio button semantics on the card carry the real accessible name. */
function ExperienceHoverMomentPreview({ effect }: { effect: PortfolioExperienceLoftHoverEffect }) {
  if (effect === 'curtain') {
    return (
      <div className="pf-exp-hover-preview" aria-hidden>
        <span className="pf-exp-hover-curtain-panel" />
      </div>
    );
  }
  if (effect === 'magnetic') {
    return (
      <div className="pf-exp-hover-preview" aria-hidden>
        <span className="pf-exp-hover-magnetic-dot" />
      </div>
    );
  }
  return (
    <div className="pf-exp-hover-preview" aria-hidden>
      <span className="pf-exp-hover-press-square" />
    </div>
  );
}

/** Loft "Hover moment" — each option shows the actual micro-interaction instead of an
 * abstract name (Project Curtain / Magnetic Cue / Press In don't self-explain otherwise). */
function ExperienceHoverMomentChoiceGrid({
  value,
  onChange,
}: {
  value: PortfolioExperienceLoftHoverEffect;
  onChange: (value: PortfolioExperienceLoftHoverEffect) => void;
}) {
  const t = useT();
  return (
    <div>
      <p className="pf-exp-block-label pf-exp-option-label">{t('Hover moment')}</p>
      <p className="-mt-2 mb-3 hidden text-[10px] italic text-[color:var(--pf-palette-texte-muted)] sm:block">
        {t('Hover to preview')}
      </p>
      <div role="radiogroup" aria-label={t('Hover moment')} className="grid grid-cols-3 gap-2">
        {PORTFOLIO_EXPERIENCE_LOFT_HOVER_EFFECT_OPTIONS.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={active}
              title={t(option.description)}
              onClick={() => onChange(option.value)}
              data-active={active ? 'true' : 'false'}
              className="pf-exp-hover-card rounded-xl text-left"
            >
              <ExperienceHoverMomentPreview effect={option.value} />
              <span className="pf-exp-hover-card-label mt-1.5 block truncate">{t(option.label)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function ExperienceSettingsPanel({
  experience,
  onChange,
  subSection: controlledSubSection,
  onSubSectionChange,
}: {
  experience: PortfolioExperienceSectionSettings;
  onChange: (patch: Partial<PortfolioExperienceSectionSettings>) => void;
  subSection?: ExperienceSubSection;
  onSubSectionChange?: (value: ExperienceSubSection) => void;
}) {
  const t = useT();
  const [uncontrolledSubSection, setUncontrolledSubSection] = useState<ExperienceSubSection>('design');
  const subSection = normalizeExperienceSubSection(controlledSubSection ?? uncontrolledSubSection);
  const setSubSection = (value: ExperienceSubSection) => {
    const next = normalizeExperienceSubSection(value);
    onSubSectionChange?.(next);
    if (controlledSubSection === undefined) setUncontrolledSubSection(next);
  };
  const design = experience.experienceDesign;
  const isEditorial = design === 'editorial';
  const isTable = design === 'table';
  const isCards = design === 'cards';
  const isReel = design === 'reel';
  const isDuotone = design === 'duotone';
  const isGallery = design === 'gallery';
  const isLoft = design === 'loft';
  const isPress = design === 'press';
  const isLegacy = design === 'legacy';
  const showStackLabel = isEditorial || design === 'milestone';

  return (
    <PortfolioLinkArrowProvider value={experience.linkArrowStyle ?? 'northeast'}>
    <div className="space-y-6">
      <SettingsTabs tabs={EXPERIENCE_SUB_SECTIONS} value={subSection} onChange={setSubSection} />

      {subSection === 'general' ? (
        <div>
          <SettingsSwitchRow
            label={t('Show section')}
            description={experience.enabled ? undefined : t('Visitors go straight to the next section.')}
            checked={experience.enabled}
            onChange={(enabled) => onChange({ enabled })}
          />
          {experience.enabled ? (
          <SettingsGroup label={t('Content shown')}>
            <div className="flex flex-wrap gap-3">
              <ExperienceVisibilityBadge
                label={t('Title')}
                checked={experience.showTitle !== false}
                onChange={(showTitle) => onChange({ showTitle })}
              />
              <ExperienceVisibilityBadge
                label={t('Period')}
                checked={experience.showPeriod !== false}
                onChange={(showPeriod) => onChange({ showPeriod })}
              />
              <ExperienceVisibilityBadge
                label={t('Organization')}
                checked={experience.showOrganization !== false}
                onChange={(showOrganization) => onChange({ showOrganization })}
              />
              <ExperienceVisibilityBadge
                label={t('Status & meta')}
                checked={experience.showMeta !== false}
                onChange={(showMeta) => onChange({ showMeta })}
              />
              <ExperienceVisibilityBadge
                label={t('Description')}
                checked={experience.showDescription !== false}
                onChange={(showDescription) => onChange({ showDescription })}
              />
              <ExperienceVisibilityBadge
                label={t('Tasks')}
                checked={experience.showTasks !== false}
                onChange={(showTasks) => onChange({ showTasks })}
              />
              <ExperienceVisibilityBadge
                label={t('Tools')}
                checked={experience.showTools !== false}
                onChange={(showTools) => onChange({ showTools })}
              />
              <ExperienceVisibilityBadge
                label={t('Proof / links')}
                checked={experience.showProof !== false}
                onChange={(showProof) => onChange({ showProof })}
              />
              <ExperienceVisibilityBadge
                label={t('Media / image')}
                checked={experience.showEntryMedia !== false}
                onChange={(showEntryMedia) => onChange({ showEntryMedia })}
              />
            </div>
          </SettingsGroup>
          ) : null}
        </div>
      ) : !experience.enabled ? (
        <SectionHiddenNotice onEnable={() => onChange({ enabled: true })} />
      ) : subSection === 'header' ? (
        <div>
          <ExperienceHeaderChoiceGrid
            value={experience.headerDesign ?? 'none'}
            onChange={(headerDesign) => onChange({ headerDesign })}
          />
          <div className="mt-6">
            <HeaderElementToggles
              design={`experience-${experience.headerDesign ?? 'none'}`}
              settings={experience}
              onPatch={(patch) => onChange(patch as Partial<PortfolioExperienceSectionSettings>)}
            />
          </div>
          {(experience.headerDesign ?? 'none') === 'editorial' ? (
            <ExperienceAccentYearsAdvancedSettings experience={experience} onChange={onChange} />
          ) : null}
          {(experience.headerDesign ?? 'none') === 'milestone' ? (
            <ExperienceCenteredLayoutSettings experience={experience} onChange={onChange} />
          ) : null}
          {(experience.headerDesign ?? 'none') === 'table' ? (
            <ExperienceSerifLeadLayoutSettings experience={experience} onChange={onChange} />
          ) : null}
          {(experience.headerDesign ?? 'none') === 'spotlight' ? (
            <ExperienceMarqueeLayoutSettings experience={experience} onChange={onChange} />
          ) : null}
          {(experience.headerDesign ?? 'none') === 'reel' ? (
            <ExperienceTitleStackHeaderSettings experience={experience} onChange={onChange} />
          ) : null}
          {(experience.headerDesign ?? 'none') === 'gallery' ? (
            <ExperienceBillboardHeaderSettings experience={experience} onChange={onChange} />
          ) : null}
          {(experience.headerDesign ?? 'none') === 'loft' ? (
            <ExperienceSplitHeadingHeaderSettings experience={experience} onChange={onChange} />
          ) : null}
          {(experience.headerDesign ?? 'none') === 'press' ? (
            <ExperienceMastheadHeaderSettings experience={experience} onChange={onChange} />
          ) : null}
          {(experience.headerDesign ?? 'none') === 'legacy' ? (
            <ExperienceAccentTitleHeaderSettings experience={experience} onChange={onChange} />
          ) : null}
        </div>
      ) : (
        <div>
          <ExperienceDesignChoiceGrid
            value={experience.experienceDesign}
            onChange={(experienceDesign) => onChange({ experienceDesign })}
          />
          <ExperienceLayoutSettingsBand motionKey={design}>
<SettingsRowsScope title={t('Layout options')}>
          {isTable ? (
            <ExperienceToggleRow
              label={t('Striped rows')}
              description={t('Alternate subtle row backgrounds for easier scanning.')}
              checked={experience.tableStripedRows === true}
              onChange={(tableStripedRows) => onChange({ tableStripedRows })}
            />
          ) : null}
          {isReel ? (
            <>
              <ExperienceOptionGrid
                label={t('Status presentation')}
                options={PORTFOLIO_EXPERIENCE_REEL_STATUS_STYLE_OPTIONS}
                value={experience.reelStatusStyle ?? 'badge'}
                onChange={(reelStatusStyle) => onChange({ reelStatusStyle })}
                columns={2}
              />
              <ExperienceOptionGrid
                label={t('Scroll motion')}
                options={PORTFOLIO_EXPERIENCE_REEL_SCROLL_MOTION_OPTIONS}
                value={experience.reelScrollMotion ?? 'fade-reveal'}
                onChange={(reelScrollMotion) => onChange({ reelScrollMotion })}
                columns={3}
              />
            </>
          ) : null}
          {isCards ? (
            <>
              <ExperienceScalePill
                label={t('Card width')}
                options={PORTFOLIO_EXPERIENCE_CARDS_CARD_WIDTH_OPTIONS}
                sizes={[17, 14, 11]}
                value={experience.cardsCardWidth ?? 'medium'}
                onChange={(cardsCardWidth) => onChange({ cardsCardWidth })}
              />
              <ExperienceScalePill
                label={t('Title size')}
                options={PORTFOLIO_EXPERIENCE_CARDS_TITLE_SIZE_OPTIONS}
                sizes={[12, 14, 16, 18]}
                value={experience.cardsTitleSize ?? 'md'}
                onChange={(cardsTitleSize) => onChange({ cardsTitleSize })}
              />
              <ExperienceScalePill
                label={t('Element spacing')}
                options={PORTFOLIO_EXPERIENCE_CARDS_ELEMENT_SPACING_OPTIONS}
                sizes={[11, 14, 17]}
                value={experience.cardsElementSpacing ?? 'md'}
                onChange={(cardsElementSpacing) => onChange({ cardsElementSpacing })}
              />
              <ExperienceScalePill
                label={t('Vertical gap')}
                options={PORTFOLIO_EXPERIENCE_CARDS_VERTICAL_GAP_OPTIONS}
                sizes={[11, 14, 17]}
                value={experience.cardsVerticalGap ?? 'md'}
                onChange={(cardsVerticalGap) => onChange({ cardsVerticalGap })}
              />
              <ExperienceThumbnailRadiusChoiceGrid
                label={t('Card border radius')}
                value={experience.cardsBorderRadius ?? 'none'}
                onChange={(cardsBorderRadius) => onChange({ cardsBorderRadius })}
              />
              <ExperienceScalePill
                label={t('Tasks gap')}
                options={PORTFOLIO_EXPERIENCE_CARDS_TASKS_GAP_OPTIONS}
                sizes={[11, 14, 17]}
                value={experience.cardsTasksGap ?? 'md'}
                onChange={(cardsTasksGap) => onChange({ cardsTasksGap })}
              />
              <ExperienceToggleRow
                label={t('Scroll cascade effect')}
                description={t('Desktop only: each card locks in place and the next rises to fully cover it, scaling down and fading as it recedes. Turn off for a plain static stack on every screen size.')}
                checked={(experience.cardsStackEffect ?? 'cascade') === 'cascade'}
                onChange={(checked) =>
                  onChange({ cardsStackEffect: checked ? 'cascade' : 'static' })
                }
              />
              <ExperienceToggleRow
                label={t('Equal card height')}
                description={t('Every card matches the height of the tallest one, so a shorter card never leaves the one behind it peeking out during the cascade.')}
                checked={experience.cardsEqualHeight === true}
                onChange={(cardsEqualHeight) => onChange({ cardsEqualHeight })}
              />
            </>
          ) : null}
          {isEditorial ? (
            <>
              <ExperienceOptionGrid
                label={t('Entry expand')}
                options={PORTFOLIO_EXPERIENCE_ENTRY_EXPAND_MODE_OPTIONS}
                value={experience.entryExpandMode ?? 'accordion'}
                onChange={(entryExpandMode) => onChange({ entryExpandMode })}
                columns={2}
              />
              <ExperienceOptionGrid
                label={t('Detail layout')}
                options={PORTFOLIO_EXPERIENCE_EDITORIAL_DETAIL_LAYOUT_OPTIONS}
                value={experience.editorialDetailLayout ?? 'split-actions'}
                onChange={(editorialDetailLayout) => onChange({ editorialDetailLayout })}
                columns={2}
              />
              <ExperienceOptionGrid
                label={t('Period / timeline')}
                options={PORTFOLIO_EXPERIENCE_PERIOD_DESIGN_OPTIONS}
                value={experience.periodDesign ?? 'plain'}
                onChange={(periodDesign) => onChange({ periodDesign })}
                columns={2}
              />
            </>
          ) : null}
          {isDuotone ? (
            <ExperienceOptionGrid
              label={t('Scroll mode')}
              options={PORTFOLIO_EXPERIENCE_DUOTONE_SCROLL_MODE_OPTIONS}
              value={experience.duotoneScrollMode ?? 'sticky'}
              onChange={(duotoneScrollMode) => onChange({ duotoneScrollMode })}
              columns={3}
            />
          ) : null}
          {isDuotone && (experience.duotoneScrollMode ?? 'sticky') === 'slide' ? (
            <>
              <ExperienceOptionGrid
                label={t('Slide navigation')}
                options={PORTFOLIO_EXPERIENCE_DUOTONE_SLIDE_NAV_STYLE_OPTIONS}
                value={experience.duotoneSlideNavStyle ?? 'chevron'}
                onChange={(duotoneSlideNavStyle) => onChange({ duotoneSlideNavStyle })}
                columns={3}
              />
              <ExperienceToggleRow
                label={t('Auto-advance')}
                description={t('Move to the next role every 5s — pauses while the frame is hovered.')}
                checked={experience.duotoneAutoAdvance === true}
                onChange={(duotoneAutoAdvance) => onChange({ duotoneAutoAdvance })}
              />
            </>
          ) : null}
          {isDuotone && experience.duotoneScrollMode === 'slide' ? (
            <>
              <ExperienceOptionGrid
                label={t('Screen frame color')}
                options={PORTFOLIO_EXPERIENCE_DUOTONE_FRAME_COLOR_OPTIONS}
                value={experience.duotoneFrameColor ?? 'none'}
                onChange={(duotoneFrameColor) => onChange({ duotoneFrameColor })}
                columns={3}
              />
              <ExperienceOptionGrid
                label={t('Screen frame radius')}
                options={PORTFOLIO_EXPERIENCE_DUOTONE_FRAME_RADIUS_OPTIONS}
                value={experience.duotoneFrameRadius ?? 'sm'}
                onChange={(duotoneFrameRadius) => onChange({ duotoneFrameRadius })}
                columns={3}
              />
            </>
          ) : null}
          {isDuotone &&
          (experience.duotoneScrollMode === 'scroll' || (experience.duotoneScrollMode ?? 'sticky') === 'sticky') ? (
            <>
              <ExperienceOptionGrid
                label={t('Thumbnail effect')}
                options={PORTFOLIO_EXPERIENCE_DUOTONE_THUMBNAIL_EFFECT_OPTIONS}
                value={experience.duotoneThumbnailEffect ?? 'grayscale'}
                onChange={(duotoneThumbnailEffect) => onChange({ duotoneThumbnailEffect })}
                columns={3}
              />
              <ExperienceOptionGrid
                label={t('Thumbnail height')}
                options={PORTFOLIO_EXPERIENCE_DUOTONE_THUMBNAIL_HEIGHT_OPTIONS}
                value={experience.duotoneThumbnailHeight ?? 'md'}
                onChange={(duotoneThumbnailHeight) => onChange({ duotoneThumbnailHeight })}
                columns={3}
              />
              <ExperienceOptionGrid
                label={t('Repository CTA')}
                options={PORTFOLIO_EXPERIENCE_DUOTONE_REPO_CTA_MODE_OPTIONS}
                value={experience.duotoneRepoCtaMode ?? 'footer'}
                onChange={(duotoneRepoCtaMode) => onChange({ duotoneRepoCtaMode })}
                columns={2}
              />
            </>
          ) : null}
          {isDuotone &&
          (experience.duotoneScrollMode === 'scroll' ||
            (experience.duotoneScrollMode ?? 'sticky') === 'sticky') ? (
            <>
              <ExperienceOptionGrid
                label={t('Vertical spacing')}
                options={PORTFOLIO_EXPERIENCE_DUOTONE_STICKY_VERTICAL_GAP_OPTIONS}
                value={experience.duotoneStickyVerticalGap ?? 'md'}
                onChange={(duotoneStickyVerticalGap) => onChange({ duotoneStickyVerticalGap })}
                columns={2}
              />
              <ExperienceToggleRow
                label={t('Swap columns')}
                description={t('Title & thumbnail on the right, info card on the left.')}
                checked={experience.duotoneStickySwapSides === true}
                onChange={(duotoneStickySwapSides) => onChange({ duotoneStickySwapSides })}
              />
              {experience.duotoneScrollMode === 'scroll' ? (
                <>
                  <ExperienceToggleRow
                    label={t('Full-width title')}
                    description={t('Role title spans the full width above both columns.')}
                    checked={experience.duotoneScrollFullWidthTitle === true}
                    onChange={(duotoneScrollFullWidthTitle) =>
                      onChange({ duotoneScrollFullWidthTitle })
                    }
                  />
                  <ExperienceToggleRow
                    label={t('Alternate sides')}
                    description={t('Flip title/info columns on every other role.')}
                    checked={experience.duotoneAlternateSides === true}
                    onChange={(duotoneAlternateSides) => onChange({ duotoneAlternateSides })}
                  />
                </>
              ) : null}
            </>
          ) : null}
          {isGallery ? (
            <ExperienceOptionGridWithInfo
              label={t('Thumbnail')}
              options={PORTFOLIO_EXPERIENCE_GALLERY_THUMBNAIL_FIT_OPTIONS}
              value={experience.galleryThumbnailFit ?? 'cover'}
              onChange={(galleryThumbnailFit) => onChange({ galleryThumbnailFit })}
              columns={2}
            />
          ) : null}
          {isGallery ? (
            <ExperienceThumbnailRadiusChoiceGrid
              value={experience.galleryThumbnailRadius ?? 'md'}
              onChange={(galleryThumbnailRadius) => onChange({ galleryThumbnailRadius })}
            />
          ) : null}
          {isGallery ? (
            <ExperienceHoverMomentChoiceGrid
              value={experience.galleryHoverEffect ?? 'curtain'}
              onChange={(galleryHoverEffect) => onChange({ galleryHoverEffect })}
            />
          ) : null}
          {isGallery ? (
            <ExperienceGalleryColumnsChoiceGrid
              value={experience.galleryColumns ?? 3}
              onChange={(galleryColumns) => onChange({ galleryColumns })}
            />
          ) : null}
          {isGallery ? (
            <ExperienceItemGapChoiceGrid
              value={experience.galleryGap ?? 'md'}
              onChange={(galleryGap) => onChange({ galleryGap })}
            />
          ) : null}
          {isLoft ? (
            <ExperienceOptionGridWithInfo
              label={t('Thumbnail')}
              options={PORTFOLIO_EXPERIENCE_LOFT_THUMBNAIL_FIT_OPTIONS}
              value={experience.loftThumbnailFit ?? 'cover'}
              onChange={(loftThumbnailFit) => onChange({ loftThumbnailFit })}
              columns={2}
            />
          ) : null}
          {isLoft ? (
            <ExperienceThumbnailRadiusChoiceGrid
              value={experience.loftThumbnailRadius ?? 'md'}
              onChange={(loftThumbnailRadius) => onChange({ loftThumbnailRadius })}
            />
          ) : null}
          {isLoft ? (
            <ExperienceHoverMomentChoiceGrid
              value={experience.loftHoverEffect ?? 'curtain'}
              onChange={(loftHoverEffect) => onChange({ loftHoverEffect })}
            />
          ) : null}
          {isLoft ? (
            <ExperienceLoftColumnsChoiceGrid
              value={experience.loftColumns ?? 3}
              onChange={(loftColumns) => onChange({ loftColumns })}
            />
          ) : null}
          {isLoft ? (
            <ExperienceItemGapChoiceGrid
              value={experience.loftGap ?? 'md'}
              onChange={(loftGap) => onChange({ loftGap })}
            />
          ) : null}
          {isPress ? (
            <ExperienceThumbnailRadiusChoiceGrid
              value={experience.pressThumbnailRadius ?? 'md'}
              onChange={(pressThumbnailRadius) => onChange({ pressThumbnailRadius })}
            />
          ) : null}

          {isLegacy ? (
            <ExperienceToggleRow
              label={t('Hero title')}
              description={t('The two-tone headline above the feature blocks.')}
              checked={experience.legacyHeadingEnabled !== false}
              onChange={(legacyHeadingEnabled) => onChange({ legacyHeadingEnabled })}
            />
          ) : null}
          {isLegacy && experience.legacyHeadingEnabled !== false ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="pf-exp-block-label block">
                    {t('Title')}
                  </label>
                  <input
                    type="text"
                    value={experience.legacyHeadingText ?? 'A Career Built on'}
                    onChange={(event) => onChange({ legacyHeadingText: event.target.value })}
                    placeholder={t('A Career Built on')}
                    className="mt-3 w-full rounded-xl border border-[color:var(--pf-palette-bordure)] bg-transparent px-3.5 py-2.5 text-sm font-medium text-[color:var(--pf-palette-texte-fort)] placeholder:text-[color:var(--pf-palette-texte-muted)]"
                  />
                </div>
                <div>
                  <label className="pf-exp-block-label block">
                    {t('Title (accent)')}
                  </label>
                  <input
                    type="text"
                    value={experience.legacyHeadingAccentText ?? 'Craft'}
                    onChange={(event) => onChange({ legacyHeadingAccentText: event.target.value })}
                    placeholder={t('Craft')}
                    className="mt-3 w-full rounded-xl border border-[color:var(--pf-palette-bordure)] bg-transparent px-3.5 py-2.5 text-sm font-medium text-[color:var(--pf-palette-texte-fort)] placeholder:text-[color:var(--pf-palette-texte-muted)]"
                  />
                </div>
              </div>
              <div>
                <label className="pf-exp-block-label block">
                  {t('Intro sentence')}
                </label>
                <input
                  type="text"
                  value={experience.legacyIntroText ?? ''}
                  onChange={(event) => onChange({ legacyIntroText: event.target.value })}
                  placeholder={t('A selection of roles, teams, and problems solved along the way.')}
                  className="mt-3 w-full rounded-xl border border-[color:var(--pf-palette-bordure)] bg-transparent px-3.5 py-2.5 text-sm font-medium text-[color:var(--pf-palette-texte-fort)] placeholder:text-[color:var(--pf-palette-texte-muted)]"
                />
              </div>
            </>
          ) : null}
          {isLegacy ? (
            <ExperienceOptionGrid
              label={t('Image corners')}
              options={PORTFOLIO_EXPERIENCE_CARDS_BORDER_RADIUS_OPTIONS}
              value={experience.legacyThumbnailRadius ?? 'xl'}
              onChange={(legacyThumbnailRadius) => onChange({ legacyThumbnailRadius })}
              columns={3}
            />
          ) : null}
          {isLegacy ? (
            <ExperienceOptionGrid
              label={t('Image height')}
              options={PORTFOLIO_EXPERIENCE_LEGACY_THUMBNAIL_HEIGHT_OPTIONS}
              value={experience.legacyThumbnailHeight ?? 'lg'}
              onChange={(legacyThumbnailHeight) => onChange({ legacyThumbnailHeight })}
              columns={3}
            />
          ) : null}
          {isLegacy ? (
            <ExperienceOptionGrid
              label={t('Image width')}
              options={PORTFOLIO_EXPERIENCE_LEGACY_THUMBNAIL_WIDTH_OPTIONS}
              value={experience.legacyThumbnailWidth ?? 'lg'}
              onChange={(legacyThumbnailWidth) => onChange({ legacyThumbnailWidth })}
              columns={3}
            />
          ) : null}
          {isLegacy ? (
            <ExperienceOptionGrid
              label={t('Spacing between entries')}
              options={PORTFOLIO_EXPERIENCE_LEGACY_ITEM_GAP_OPTIONS}
              value={experience.legacyItemGap ?? 'md'}
              onChange={(legacyItemGap) => onChange({ legacyItemGap })}
              columns={4}
            />
          ) : null}
          {isLegacy ? (
            <ExperienceToggleRow
              label={t('Alternate image side')}
              description={t('Switch the image left/right on every other entry. Off keeps it on the same side.')}
              checked={experience.legacyAlternateSides !== false}
              onChange={(legacyAlternateSides) => onChange({ legacyAlternateSides })}
            />
          ) : null}
          {isLegacy && experience.legacyAlternateSides === false ? (
            <ExperienceOptionGrid
              label={t('Image side')}
              options={PORTFOLIO_EXPERIENCE_LEGACY_FIXED_SIDE_OPTIONS}
              value={experience.legacyFixedSide ?? 'left'}
              onChange={(legacyFixedSide) => onChange({ legacyFixedSide })}
              columns={2}
            />
          ) : null}
          {isLegacy ? (
            <ExperienceToggleRow
              label={t('Show tasks')}
              description={t('Off by default for this design — the task list stays hidden unless turned on.')}
              checked={experience.legacyShowTasks === true}
              onChange={(legacyShowTasks) => onChange({ legacyShowTasks })}
            />
          ) : null}
          {/* ========== LEGACY HEADER PREMIUM OPTIONS ========== */}
          {isLegacy && experience.legacyHeadingEnabled !== false ? (
            <>
              <div className="mt-6 pt-4 border-t border-[color:var(--pf-palette-bordure)]">
                <p className="pf-exp-block-label block mb-3">{t('Header Animation')}</p>
              </div>
              <ExperienceToggleRow
                label={t('Entry animation')}
                description={t('GSAP-powered reveal animations when the header enters the viewport.')}
                checked={experience.legacyHeaderAnimationEnabled !== false}
                onChange={(legacyHeaderAnimationEnabled) => onChange({ legacyHeaderAnimationEnabled })}
              />
              {experience.legacyHeaderAnimationEnabled !== false ? (
                <ExperienceOptionGrid
                  label={t('Animation style')}
                  options={PORTFOLIO_EXPERIENCE_LEGACY_ANIMATION_STYLE_OPTIONS}
                  value={experience.legacyHeaderAnimationStyle ?? 'bloom'}
                  onChange={(legacyHeaderAnimationStyle) => onChange({ legacyHeaderAnimationStyle })}
                  columns={3}
                />
              ) : null}
              <ExperienceToggleRow
                label={t('Scroll parallax')}
                description={t('Asymmetric parallax effect on scroll — accent word stays longer.')}
                checked={experience.legacyScrollParallaxEnabled !== false}
                onChange={(legacyScrollParallaxEnabled) => onChange({ legacyScrollParallaxEnabled })}
              />
            </>
          ) : null}
          {isLegacy && experience.legacyHeadingEnabled !== false ? (
            <>
              <div className="mt-6 pt-4 border-t border-[color:var(--pf-palette-bordure)]">
                <p className="pf-exp-block-label block mb-3">{t('Typography')}</p>
              </div>
              <ExperienceOptionGrid
                label={t('Prefix weight')}
                options={PORTFOLIO_EXPERIENCE_LEGACY_PREFIX_WEIGHT_OPTIONS}
                value={experience.legacyPrefixWeight ?? 'light'}
                onChange={(legacyPrefixWeight) => onChange({ legacyPrefixWeight })}
                columns={3}
              />
              <ExperienceOptionGrid
                label={t('Accent style')}
                options={PORTFOLIO_EXPERIENCE_LEGACY_ACCENT_STYLE_OPTIONS}
                value={experience.legacyAccentStyle ?? 'italic-bold'}
                onChange={(legacyAccentStyle) => onChange({ legacyAccentStyle })}
                columns={3}
              />
              <ExperienceOptionGrid
                label={t('Accent size')}
                options={PORTFOLIO_EXPERIENCE_LEGACY_ACCENT_SIZE_OPTIONS}
                value={experience.legacyAccentSize ?? 'dramatic'}
                onChange={(legacyAccentSize) => onChange({ legacyAccentSize })}
                columns={3}
              />
              <ExperienceOptionGrid
                label={t('Subtitle style')}
                options={PORTFOLIO_EXPERIENCE_LEGACY_SUBTITLE_STYLE_OPTIONS}
                value={experience.legacySubtitleStyle ?? 'micro'}
                onChange={(legacySubtitleStyle) => onChange({ legacySubtitleStyle })}
                columns={3}
              />
            </>
          ) : null}
          {isLegacy && experience.legacyHeadingEnabled !== false ? (
            <>
              <div className="mt-6 pt-4 border-t border-[color:var(--pf-palette-bordure)]">
                <p className="pf-exp-block-label block mb-3">{t('Decorative Elements')}</p>
              </div>
              <ExperienceToggleRow
                label={t('Accent underline')}
                description={t('Show a decorative line under the accent word.')}
                checked={experience.legacyAccentUnderline !== false}
                onChange={(legacyAccentUnderline) => onChange({ legacyAccentUnderline })}
              />
              {experience.legacyAccentUnderline !== false ? (
                <ExperienceOptionGrid
                  label={t('Underline style')}
                  options={PORTFOLIO_EXPERIENCE_LEGACY_UNDERLINE_STYLE_OPTIONS}
                  value={experience.legacyAccentUnderlineStyle ?? 'solid'}
                  onChange={(legacyAccentUnderlineStyle) => onChange({ legacyAccentUnderlineStyle })}
                  columns={2}
                />
              ) : null}
            </>
          ) : null}
          {showStackLabel ? (
            <>
              <ExperienceOptionalTextField
                label={t('Stack label')}
                value={experience.toolsLabel}
                placeholder={t('Stack')}
                checked={experience.blockLabelVisibility?.tools !== false && experience.showBlockLabels !== false}
                onCheckedChange={(visible) =>
                  onChange({
                    showBlockLabels: true,
                    blockLabelVisibility: {
                      ...DEFAULT_EXPERIENCE_BLOCK_LABEL_VISIBILITY,
                      ...experience.blockLabelVisibility,
                      tools: visible,
                    },
                  })
                }
                onValueChange={(toolsLabel) => onChange({ toolsLabel })}
              />
              <ExperienceOptionalTextField
                label={t('Responsibilities label')}
                value={experience.tasksLabel}
                placeholder={t('Responsibilities')}
                checked={experience.blockLabelVisibility?.tasks !== false && experience.showBlockLabels !== false}
                onCheckedChange={(visible) =>
                  onChange({
                    showBlockLabels: true,
                    blockLabelVisibility: {
                      ...DEFAULT_EXPERIENCE_BLOCK_LABEL_VISIBILITY,
                      ...experience.blockLabelVisibility,
                      tasks: visible,
                    },
                  })
                }
                onValueChange={(tasksLabel) => onChange({ tasksLabel })}
              />
            </>
          ) : null}
          </SettingsRowsScope>
</ExperienceLayoutSettingsBand>
          <SettingsGroup label={t('Style')}>
          <SectionColorModeControl
            label={t('Color mode')}
            value={experience.colorModeOverride}
            onChange={(colorModeOverride) => onChange({ colorModeOverride })}
          />
          <ExperienceOptionGrid
            label={t('Text size')}
            options={PORTFOLIO_EXPERIENCE_PREMIUM_FONT_SIZE_OPTIONS}
            value={experience.premiumFontSize ?? 'medium'}
            onChange={(premiumFontSize) => onChange({ premiumFontSize })}
            columns={3}
          />
          </SettingsGroup>
          <SettingsGroup label={t('Details')}>
          <ExperienceTasksDisplayChoiceGrid
            value={experience.tasksDisplay ?? 'editorial-dash'}
            onChange={(tasksDisplay) => onChange({ tasksDisplay })}
          />
          <ExperienceToolsBadgeStyleChoiceGrid
            value={experience.toolsBadgeStyle ?? 'mineral-pills'}
            onChange={(toolsBadgeStyle) => onChange({ toolsBadgeStyle })}
          />
          <ExperienceLinkButtonChoiceGrid
            value={experience.repoLinkButtonStyle ?? 'auto'}
            onChange={(repoLinkButtonStyle) => onChange({ repoLinkButtonStyle })}
          />
          <ExperienceLinkArrowChoiceGrid
            value={experience.linkArrowStyle ?? 'northeast'}
            onChange={(linkArrowStyle) => onChange({ linkArrowStyle })}
          />
          </SettingsGroup>
        </div>
      )}
    </div>
    </PortfolioLinkArrowProvider>
  );
}
