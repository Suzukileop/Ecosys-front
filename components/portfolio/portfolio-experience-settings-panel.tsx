'use client';

import { useState, type CSSProperties, type ReactNode } from 'react';
import { SectionColorModeControl } from '@/components/portfolio/portfolio-section-color-mode-control';
import {
  PORTFOLIO_EXPERIENCE_CARDS_BORDER_RADIUS_OPTIONS,
  PORTFOLIO_EXPERIENCE_CARDS_CARD_WIDTH_OPTIONS,
  PORTFOLIO_EXPERIENCE_CARDS_ELEMENT_SPACING_OPTIONS,
  PORTFOLIO_EXPERIENCE_CARDS_VERTICAL_GAP_OPTIONS,
  PORTFOLIO_EXPERIENCE_DESIGN_OPTIONS,
  PORTFOLIO_EXPERIENCE_DUOTONE_FRAME_COLOR_OPTIONS,
  PORTFOLIO_EXPERIENCE_DUOTONE_FRAME_RADIUS_OPTIONS,
  PORTFOLIO_EXPERIENCE_DUOTONE_THUMBNAIL_EFFECT_OPTIONS,
  PORTFOLIO_EXPERIENCE_DUOTONE_THUMBNAIL_HEIGHT_OPTIONS,
  PORTFOLIO_EXPERIENCE_DUOTONE_STICKY_VERTICAL_GAP_OPTIONS,
  PORTFOLIO_EXPERIENCE_DUOTONE_REPO_CTA_MODE_OPTIONS,
  PORTFOLIO_EXPERIENCE_DUOTONE_SCROLL_MODE_OPTIONS,
  PORTFOLIO_EXPERIENCE_DUOTONE_SLIDE_NAV_STYLE_OPTIONS,
  PORTFOLIO_EXPERIENCE_ENTRY_EXPAND_MODE_OPTIONS,
  PORTFOLIO_EXPERIENCE_EDITORIAL_DETAIL_LAYOUT_OPTIONS,
  PORTFOLIO_EXPERIENCE_GALLERY_COLUMNS_OPTIONS,
  PORTFOLIO_EXPERIENCE_GALLERY_THUMBNAIL_FIT_OPTIONS,
  PORTFOLIO_EXPERIENCE_GALLERY_BIG_TITLE_STYLE_OPTIONS,
  PORTFOLIO_EXPERIENCE_GALLERY_BIG_TITLE_COLOR_OPTIONS,
  PORTFOLIO_EXPERIENCE_GALLERY_HEADER_ANIMATION_STYLE_OPTIONS,
  PORTFOLIO_EXPERIENCE_GALLERY_SECONDARY_TITLE_STYLE_OPTIONS,
  PORTFOLIO_EXPERIENCE_GALLERY_ROLE_COUNT_STYLE_OPTIONS,
  PORTFOLIO_EXPERIENCE_SPOTLIGHT_TITLE_COLOR_OPTIONS,
  PORTFOLIO_EXPERIENCE_SPOTLIGHT_THUMBNAIL_FIT_OPTIONS,
  PORTFOLIO_EXPERIENCE_LOFT_THUMBNAIL_FIT_OPTIONS,
  PORTFOLIO_EXPERIENCE_LOFT_THUMBNAIL_RADIUS_OPTIONS,
  PORTFOLIO_EXPERIENCE_LOFT_HOVER_EFFECT_OPTIONS,
  PORTFOLIO_EXPERIENCE_LOFT_COLUMNS_OPTIONS,
  PORTFOLIO_EXPERIENCE_LOFT_HEADING_ITALIC_WORD_OPTIONS,
  PORTFOLIO_EXPERIENCE_LOFT_HEADING_FONT_WEIGHT_OPTIONS,
  PORTFOLIO_EXPERIENCE_LOFT_LABEL_STYLE_OPTIONS,
  PORTFOLIO_EXPERIENCE_LOFT_LABEL_POSITION_OPTIONS,
  PORTFOLIO_EXPERIENCE_LOFT_SCROLL_EFFECT_STYLE_OPTIONS,
  PORTFOLIO_EXPERIENCE_ITEM_GAP_OPTIONS,
  PORTFOLIO_EXPERIENCE_LEGACY_FIXED_SIDE_OPTIONS,
  PORTFOLIO_EXPERIENCE_LEGACY_ITEM_GAP_OPTIONS,
  PORTFOLIO_EXPERIENCE_LEGACY_THUMBNAIL_HEIGHT_OPTIONS,
  PORTFOLIO_EXPERIENCE_LEGACY_THUMBNAIL_WIDTH_OPTIONS,
  PORTFOLIO_EXPERIENCE_LEGACY_ANIMATION_STYLE_OPTIONS,
  PORTFOLIO_EXPERIENCE_LEGACY_PREFIX_WEIGHT_OPTIONS,
  PORTFOLIO_EXPERIENCE_LEGACY_ACCENT_STYLE_OPTIONS,
  PORTFOLIO_EXPERIENCE_LEGACY_ACCENT_SIZE_OPTIONS,
  PORTFOLIO_EXPERIENCE_LEGACY_UNDERLINE_STYLE_OPTIONS,
  PORTFOLIO_EXPERIENCE_LEGACY_SUBTITLE_STYLE_OPTIONS,
  PORTFOLIO_EXPERIENCE_PRESS_ANIMATION_STYLE_OPTIONS,
  PORTFOLIO_EXPERIENCE_PRESS_HEADING_WEIGHT_STYLE_OPTIONS,
  PORTFOLIO_EXPERIENCE_PRESS_SUBTITLE_STYLE_OPTIONS,
  PORTFOLIO_EXPERIENCE_PRESS_HEADING_ALIGNMENT_OPTIONS,
  PORTFOLIO_EXPERIENCE_PRESS_PARALLAX_INTENSITY_OPTIONS,
  PORTFOLIO_EXPERIENCE_PERIOD_DESIGN_OPTIONS,
  PORTFOLIO_EXPERIENCE_REPO_LINK_STYLE_OPTIONS,
  PORTFOLIO_EXPERIENCE_LINK_ARROW_STYLE_OPTIONS,
  PORTFOLIO_EXPERIENCE_REEL_STATUS_STYLE_OPTIONS,
  PORTFOLIO_EXPERIENCE_REEL_SCROLL_MOTION_OPTIONS,
  PORTFOLIO_EXPERIENCE_TASKS_DISPLAY_OPTIONS,
  DEFAULT_EXPERIENCE_BLOCK_LABEL_VISIBILITY,
  DEFAULT_ACCENT_YEARS_BADGE_TEXT,
  DEFAULT_ACCENT_YEARS_LEAD_TEXT,
  DEFAULT_CENTERED_TITLE_TEXT,
  DEFAULT_CENTERED_LEAD_TEXT,
  DEFAULT_SERIF_LEAD_LABEL_TEXT,
  DEFAULT_SERIF_LEAD_TITLE_TEXT,
  PORTFOLIO_EXPERIENCE_ACCENT_YEARS_SIZE_OPTIONS,
  PORTFOLIO_EXPERIENCE_ACCENT_YEARS_RADIUS_OPTIONS,
  PORTFOLIO_EXPERIENCE_ACCENT_YEARS_COLOR_OPTIONS,
  PORTFOLIO_EXPERIENCE_CENTERED_ALIGN_OPTIONS,
  PORTFOLIO_EXPERIENCE_CENTERED_WEIGHT_OPTIONS,
  PORTFOLIO_EXPERIENCE_CENTERED_OPACITY_OPTIONS,
  PORTFOLIO_EXPERIENCE_CENTERED_SCALE_OPTIONS,
  PORTFOLIO_EXPERIENCE_CENTERED_WIDTH_OPTIONS,
  PORTFOLIO_EXPERIENCE_CENTERED_LEADING_OPTIONS,
  PORTFOLIO_EXPERIENCE_CENTERED_DIVIDER_OPTIONS,
  PORTFOLIO_EXPERIENCE_CENTERED_DIVIDER_OPACITY_OPTIONS,
  PORTFOLIO_EXPERIENCE_SERIF_LEAD_INK_OPTIONS,
  PORTFOLIO_EXPERIENCE_SERIF_LEAD_TRACKING_OPTIONS,
  PORTFOLIO_EXPERIENCE_SERIF_LEAD_LABEL_OPACITY_OPTIONS,
  PORTFOLIO_EXPERIENCE_MARQUEE_STYLE_OPTIONS,
  PORTFOLIO_EXPERIENCE_MARQUEE_DIRECTION_OPTIONS,
  PORTFOLIO_EXPERIENCE_MARQUEE_SPEED_OPTIONS,
  PORTFOLIO_EXPERIENCE_MARQUEE_FADE_OPTIONS,
  PORTFOLIO_EXPERIENCE_MARQUEE_SEPARATOR_OPTIONS,
  PORTFOLIO_EXPERIENCE_MARQUEE_WEIGHT_OPTIONS,
  PORTFOLIO_EXPERIENCE_SPOTLIGHT_MARQUEE_SPEED_OPTIONS,
  PORTFOLIO_EXPERIENCE_SPOTLIGHT_MARQUEE_DIRECTION_OPTIONS,
  PORTFOLIO_EXPERIENCE_SPOTLIGHT_MARQUEE_WEIGHT_OPTIONS,
  PORTFOLIO_EXPERIENCE_SPOTLIGHT_MARQUEE_STYLE_OPTIONS,
  PORTFOLIO_EXPERIENCE_SPOTLIGHT_MARQUEE_GAP_OPTIONS,
  CENTERED_LEAD_WEIGHT,
  CENTERED_LEAD_OPACITY,
  SERIF_LEAD_WEIGHT,
  SERIF_LEAD_LABEL_OPACITY,
  MARQUEE_WEIGHT,
  MARQUEE_FILL_OPACITY,
  type PortfolioExperienceCenteredAlign,
  type PortfolioExperienceCenteredDivider,
  type PortfolioExperienceCenteredLineHeight,
  type PortfolioExperienceCenteredMaxWidth,
  type PortfolioExperienceSerifLeadInk,
  type PortfolioExperienceSerifLeadTracking,
  type PortfolioExperienceDesign,
  type PortfolioExperienceHeaderDesign,
  type PortfolioExperienceAccentYearsBadgeColor,
  type PortfolioExperienceLinkArrowStyle,
  type PortfolioExperienceRepoLinkStyle,
  type PortfolioExperienceSectionSettings,
  type PortfolioExperienceTasksDisplay,
} from '@/components/portfolio/portfolio-experience-settings';
import {
  experienceLinkButtonPalette,
  PortfolioLinkArrowProvider,
  PortfolioLinkButton,
} from '@/components/portfolio/portfolio-link-buttons';

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
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  children: ReactNode;
  showLabel?: boolean;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={label}
      title={label}
      data-active={active ? 'true' : 'false'}
      onClick={onClick}
      className={`pf-exp-design-card rounded-2xl px-3 pt-2.5 text-left ${showLabel ? 'pb-3' : 'pb-2.5'}`}
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
        <span className="mt-2.5 block">
          <span className="pf-exp-card-label min-w-0 text-sm font-semibold leading-none tracking-tight">
            {label}
          </span>
        </span>
      ) : null}
    </button>
  );
}

function ExperienceHeaderWireframe({ design }: { design: ExperienceHeaderApplyDesign }) {
  switch (design) {
    case 'editorial':
      return (
        <MiniSlide>
          <MiniType x={10} y={28}>
            EXP.
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
            EXP.
          </MiniType>
          <rect className="pf-exp-mini-mute" x="28" y="42" width="64" height="3.2" rx="1.4" />
          <rect className="pf-exp-mini-mute" x="38" y="50" width="44" height="2.8" rx="1.3" />
        </MiniSlide>
      );
    case 'table':
      return (
        <MiniSlide>
          <MiniType x={10} y={22} size={6.5}>
            EXP
          </MiniType>
          <rect className="pf-exp-mini-ink" x="10" y="28" width="82" height="12" rx="2" />
          <rect className="pf-exp-mini-mute" x="10" y="48" width="54" height="3" rx="1.4" />
        </MiniSlide>
      );
    case 'reel':
      return (
        <MiniSlide>
          <MiniType x={10} y={28}>
            EXP.
          </MiniType>
          <rect className="pf-exp-mini-mute" x="10" y="36" width="72" height="3.4" rx="1.5" />
          <rect className="pf-exp-mini-mute" x="10" y="44" width="48" height="2.8" rx="1.4" />
        </MiniSlide>
      );
    case 'gallery':
      return (
        <MiniSlide>
          <MiniType x={10} y={30} size={15}>
            EXP.
          </MiniType>
          <rect className="pf-exp-mini-mute" x="10" y="40" width="100" height="0.9" rx="0.4" />
          <MiniType x={10} y={56} size={6}>
            ROLES
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
            TITLE
          </MiniType>
          <circle className="pf-exp-mini-accent" cx="54" cy="30.5" r="1.7" />
          <MiniType x={60} y={34} size={9}>
            WORK
          </MiniType>
        </MiniSlide>
      );
    case 'loft':
      return (
        <MiniSlide>
          <MiniType x={10} y={32} size={11}>
            ROLES
          </MiniType>
          <MiniType x={110} y={30} size={5.5} anchor="end">
            (EXP)
          </MiniType>
          <rect className="pf-exp-mini-mute" x="10" y="42" width="100" height="0.9" rx="0.4" />
        </MiniSlide>
      );
    case 'press':
      return (
        <MiniSlide>
          <MiniType x={10} y={26} size={11}>
            ROLES
          </MiniType>
          <MiniType x={10} y={40} size={11}>
            TAKEN
          </MiniType>
          <rect className="pf-exp-mini-mute" x="10" y="50" width="100" height="0.9" rx="0.4" />
        </MiniSlide>
      );
    case 'legacy':
      return (
        <MiniSlide>
          <MiniType x={60} y={28} size={9} anchor="middle">
            CRAFT
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
  { id: 'editorial', label: 'Accent years' },
  { id: 'milestone', label: 'Centered' },
  { id: 'table', label: 'Serif lead' },
  { id: 'reel', label: 'Title stack' },
  { id: 'gallery', label: 'Billboard' },
  { id: 'spotlight', label: 'Marquee' },
  { id: 'loft', label: 'Split heading' },
  { id: 'press', label: 'Masthead' },
  { id: 'legacy', label: 'Accent title' },
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
  return (
    <div>
      <p className="pf-exp-block-label">Link button</p>
      <div className="grid grid-cols-2 gap-2">
        {PORTFOLIO_EXPERIENCE_REPO_LINK_STYLE_OPTIONS.map((option) => {
          const active = value === option.value;
          const compact = option.value === 'spotlight' || option.value === 'reel' || option.value === 'legacy';
          return (
            <ExperiencePickerCard
              key={option.value}
              active={active}
              label={option.label}
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
                    label="Link"
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
  return (
    <div>
      <p className="pf-exp-block-label pf-exp-option-label">Link arrow</p>
      <div
        role="radiogroup"
        aria-label="Link arrow"
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
              aria-label={option.description}
              title={option.description}
              onClick={() => onChange(option.value)}
              data-active={active ? 'true' : 'false'}
              className="pf-exp-segment-btn px-2.5 py-2 text-center text-[1.2rem] font-medium leading-none tracking-tight"
              style={
                active
                  ? undefined
                  : { color: '#c4c4c4', WebkitTextFillColor: '#c4c4c4' }
              }
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ExperienceHeaderPreview({ value }: { value: PortfolioExperienceHeaderDesign }) {
  if (value === 'none') {
    return (
      <MiniSlide>
        <MiniType x={10} y={30} size={9}>
          DEFAULT
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
  const [showGrid, setShowGrid] = useState(false);
  const selectedLabel = EXPERIENCE_HEADER_APPLY_CARDS.find((card) => card.id === value)?.label ?? 'Default';

  if (showGrid) {
    return (
      <div>
        <div className="flex items-center justify-between gap-3">
          <p className="pf-exp-block-label !mb-0">Header designs</p>
          <button
            type="button"
            onClick={() => setShowGrid(false)}
            className="text-sm font-semibold text-neutral-500 hover:text-neutral-800"
          >
            ← Back
          </button>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-4">
          {EXPERIENCE_HEADER_APPLY_CARDS.map((card) => {
            const active = value === card.id;
            return (
              <ExperiencePickerCard
                key={card.id}
                active={active}
                label={card.label}
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
      <p className="pf-exp-block-label">Header designs</p>
      <div className="group relative w-full overflow-hidden rounded-2xl border border-neutral-200/80 p-3">
        <ExperienceHeaderPreview value={value} />
        <button
          type="button"
          onClick={() => setShowGrid(true)}
          aria-label="Change header design"
          className="absolute inset-0 hidden items-center justify-center bg-black/55 opacity-0 outline-none transition-opacity duration-150 hover:opacity-100 focus-visible:opacity-100 sm:flex"
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-neutral-900 shadow-lg">
            Change header design
          </span>
        </button>
        <button
          type="button"
          onClick={() => setShowGrid(true)}
          aria-label="Change header design"
          className="absolute bottom-2 right-2 inline-flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1.5 text-xs font-semibold text-white sm:hidden"
        >
          Change
        </button>
      </div>
      <p className="mt-2 text-sm font-semibold text-neutral-950">{selectedLabel}</p>
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
  const badgeColor = experience.accentYearsBadgeColor ?? 'accent';
  const swatchStyle = (id: PortfolioExperienceAccentYearsBadgeColor) => {
    if (id === 'principal') return { backgroundColor: 'var(--pf-palette-principal)' };
    if (id === 'secondaire') return { backgroundColor: 'var(--pf-palette-secondaire)' };
    return { backgroundColor: experience.accentColor || 'var(--pf-palette-principal)' };
  };

  return (
    <section className="pf-exp-layout-settings" aria-labelledby="accent-years-advanced-title">
      <h3 id="accent-years-advanced-title" className="pf-exp-layout-settings-title">
        Header advanced editing
      </h3>
      <div className="pf-exp-layout-settings-body space-y-6">
        <div>
          <label className="pf-exp-block-label block" htmlFor="accent-years-badge-text">
            Badge text
          </label>
          <input
            id="accent-years-badge-text"
            type="text"
            value={experience.accentYearsBadgeText ?? ''}
            onChange={(event) => onChange({ accentYearsBadgeText: event.target.value })}
            placeholder={DEFAULT_ACCENT_YEARS_BADGE_TEXT}
            className="mt-3 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm font-medium text-neutral-900 placeholder:text-neutral-400"
          />
          <p className="mt-2 text-[11px] text-neutral-500">Use {'{years}'} to insert the profile years count.</p>
        </div>
        <div>
          <label className="pf-exp-block-label block" htmlFor="accent-years-lead-text">
            Lead text
          </label>
          <input
            id="accent-years-lead-text"
            type="text"
            value={experience.accentYearsLeadText ?? ''}
            onChange={(event) => onChange({ accentYearsLeadText: event.target.value })}
            placeholder={DEFAULT_ACCENT_YEARS_LEAD_TEXT}
            className="mt-3 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm font-medium text-neutral-900 placeholder:text-neutral-400"
          />
        </div>
        <ExperienceOptionGrid
          label="Font size"
          options={PORTFOLIO_EXPERIENCE_ACCENT_YEARS_SIZE_OPTIONS}
          value={experience.accentYearsFontSize ?? 6}
          onChange={(accentYearsFontSize) => onChange({ accentYearsFontSize })}
          columns={4}
        />
        <ExperienceOptionGrid
          label="Badge radius"
          options={PORTFOLIO_EXPERIENCE_ACCENT_YEARS_RADIUS_OPTIONS}
          value={experience.accentYearsBadgeRadius ?? 4}
          onChange={(accentYearsBadgeRadius) => onChange({ accentYearsBadgeRadius })}
        />
        <div>
          <p className="pf-exp-block-label pf-exp-option-label">Badge color</p>
          <div
            role="radiogroup"
            aria-label="Badge color"
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
                  {option.label}
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
  const index = Math.max(
    0,
    options.findIndex((option) => option.value === value)
  );
  const current = options[index];
  return (
    <div>
      <div className="pf-exp-centered-slider-head">
        <p className="pf-exp-block-label">{label}</p>
        <span className="pf-exp-centered-slider-value">
          {current ? (formatValue ? formatValue(current) : current.label) : null}
        </span>
      </div>
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
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function ExperienceCenteredLayoutSettings({
  experience,
  onChange,
}: {
  experience: PortfolioExperienceSectionSettings;
  onChange: (patch: Partial<PortfolioExperienceSectionSettings>) => void;
}) {
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
        Centered layout configuration
      </h3>
      <div className="pf-exp-layout-settings-body space-y-7">
        <div>
          <label className="pf-exp-block-label block" htmlFor="centered-title-text">
            Title
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
            Sub-title
          </label>
          <input
            id="centered-lead-text"
            type="text"
            value={experience.centeredLeadText ?? ''}
            onChange={(event) => onChange({ centeredLeadText: event.target.value })}
            placeholder={DEFAULT_CENTERED_LEAD_TEXT}
            className="pf-exp-centered-field mt-3 w-full rounded-xl border px-3.5 py-2.5 text-sm font-medium"
          />
          <p className="mt-2 text-[11px] text-neutral-500">Use {'{years}'} to insert the profile years count.</p>
        </div>

        <div>
          <p className="pf-exp-block-label pf-exp-option-label">Alignment</p>
          <div role="radiogroup" aria-label="Alignment" className="pf-exp-centered-align">
            {PORTFOLIO_EXPERIENCE_CENTERED_ALIGN_OPTIONS.map((option) => {
              const active = option.value === align;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  aria-label={option.label}
                  data-active={active ? 'true' : 'false'}
                  onClick={() => onChange({ centeredAlign: option.value })}
                  className="pf-exp-centered-align-btn"
                >
                  <CenteredAlignGlyph align={option.value} />
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="pf-exp-block-label pf-exp-option-label">Sub-title weight</p>
          <div role="radiogroup" aria-label="Sub-title weight" className="pf-exp-centered-weight">
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
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <CenteredSteppedSlider
          label="Sub-title opacity"
          options={PORTFOLIO_EXPERIENCE_CENTERED_OPACITY_OPTIONS}
          value={experience.centeredLeadOpacity ?? 'balanced'}
          onChange={(centeredLeadOpacity) => onChange({ centeredLeadOpacity })}
          formatValue={(option) =>
            `${option.label} ${Math.round(CENTERED_LEAD_OPACITY[option.value] * 100)}%`
          }
        />

        <CenteredSteppedSlider
          label="Header scale"
          options={PORTFOLIO_EXPERIENCE_CENTERED_SCALE_OPTIONS}
          value={experience.centeredScale ?? 'monumental'}
          onChange={(centeredScale) => onChange({ centeredScale })}
        />

        <div>
          <p className="pf-exp-block-label pf-exp-option-label">Max width</p>
          <div role="radiogroup" aria-label="Max width" className="pf-exp-centered-tiles">
            {PORTFOLIO_EXPERIENCE_CENTERED_WIDTH_OPTIONS.map((option) => {
              const active = option.value === maxWidth;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  aria-label={option.label}
                  data-active={active ? 'true' : 'false'}
                  onClick={() => onChange({ centeredMaxWidth: option.value })}
                  className="pf-exp-centered-tile"
                >
                  <CenteredWidthGlyph value={option.value} />
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="pf-exp-block-label pf-exp-option-label">Line height</p>
          <div role="radiogroup" aria-label="Line height" className="pf-exp-centered-tiles">
            {PORTFOLIO_EXPERIENCE_CENTERED_LEADING_OPTIONS.map((option) => {
              const active = option.value === lineHeight;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  aria-label={option.label}
                  data-active={active ? 'true' : 'false'}
                  onClick={() => onChange({ centeredLineHeight: option.value })}
                  className="pf-exp-centered-tile"
                >
                  <CenteredLineHeightGlyph value={option.value} />
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="pf-exp-block-label pf-exp-option-label">Divider</p>
          <div
            role="radiogroup"
            aria-label="Divider"
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
                  aria-label={option.label}
                  title={option.label}
                  data-active={active ? 'true' : 'false'}
                  onClick={() => onChange({ centeredDivider: option.value })}
                  className="pf-exp-centered-tile pf-exp-centered-tile-glyph"
                >
                  <CenteredDividerGlyph value={option.value} />
                  <span>
                    {option.value === 'dot'
                      ? 'Dot'
                      : option.value === 'full'
                        ? 'Full'
                        : option.value === 'track'
                          ? 'Track'
                          : 'None'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {divider !== 'none' ? (
          <div>
            <p className="pf-exp-block-label pf-exp-option-label">Divider opacity</p>
            <div role="radiogroup" aria-label="Divider opacity" className="pf-exp-centered-underline">
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
                    {option.label}
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
        Serif lead configuration
      </h3>
      <div className="pf-exp-layout-settings-body space-y-7">
        <div>
          <label className="pf-exp-block-label block" htmlFor="serif-lead-label-text">
            Label
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
            Title
          </label>
          <input
            id="serif-lead-title-text"
            type="text"
            value={experience.serifLeadTitleText ?? ''}
            onChange={(event) => onChange({ serifLeadTitleText: event.target.value })}
            placeholder={DEFAULT_SERIF_LEAD_TITLE_TEXT}
            className="pf-exp-centered-field mt-3 w-full rounded-xl border px-3.5 py-2.5 text-sm font-medium"
          />
          <p className="mt-2 text-[11px] text-neutral-500">Use {'{years}'} to insert the profile years count.</p>
        </div>

        <div>
          <p className="pf-exp-block-label pf-exp-option-label">Alignment</p>
          <div role="radiogroup" aria-label="Alignment" className="pf-exp-centered-align">
            {PORTFOLIO_EXPERIENCE_CENTERED_ALIGN_OPTIONS.map((option) => {
              const active = option.value === align;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  aria-label={option.label}
                  data-active={active ? 'true' : 'false'}
                  onClick={() => onChange({ serifLeadAlign: option.value })}
                  className="pf-exp-centered-align-btn"
                >
                  <CenteredAlignGlyph align={option.value} />
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="pf-exp-block-label pf-exp-option-label">Title color</p>
          <div
            role="radiogroup"
            aria-label="Title color"
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
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="pf-exp-block-label pf-exp-option-label">Title weight</p>
          <div role="radiogroup" aria-label="Title weight" className="pf-exp-centered-weight">
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
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="pf-exp-block-label pf-exp-option-label">Title style</p>
          <div
            role="radiogroup"
            aria-label="Title style"
            className="pf-exp-centered-tiles"
            style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}
          >
            {(
              [
                { value: false, label: 'Roman' },
                { value: true, label: 'Italic' },
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
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="pf-exp-block-label pf-exp-option-label">Motion</p>
          <div
            role="radiogroup"
            aria-label="Motion"
            className="pf-exp-centered-tiles"
            style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}
          >
            {(
              [
                { value: true, label: 'On' },
                { value: false, label: 'Off' },
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
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <CenteredSteppedSlider
          label="Title scale"
          options={PORTFOLIO_EXPERIENCE_CENTERED_SCALE_OPTIONS}
          value={experience.serifLeadScale ?? 'default'}
          onChange={(serifLeadScale) => onChange({ serifLeadScale })}
        />

        <div>
          <p className="pf-exp-block-label pf-exp-option-label">Letter spacing</p>
          <div role="radiogroup" aria-label="Letter spacing" className="pf-exp-centered-tiles">
            {PORTFOLIO_EXPERIENCE_SERIF_LEAD_TRACKING_OPTIONS.map((option) => {
              const active = option.value === tracking;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  aria-label={option.label}
                  data-active={active ? 'true' : 'false'}
                  onClick={() => onChange({ serifLeadTracking: option.value })}
                  className="pf-exp-centered-tile"
                >
                  <SerifTrackingGlyph value={option.value} />
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="pf-exp-block-label pf-exp-option-label">Max width</p>
          <div role="radiogroup" aria-label="Max width" className="pf-exp-centered-tiles">
            {PORTFOLIO_EXPERIENCE_CENTERED_WIDTH_OPTIONS.map((option) => {
              const active = option.value === maxWidth;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  aria-label={option.label}
                  data-active={active ? 'true' : 'false'}
                  onClick={() => onChange({ serifLeadMaxWidth: option.value })}
                  className="pf-exp-centered-tile"
                >
                  <CenteredWidthGlyph value={option.value} />
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="pf-exp-block-label pf-exp-option-label">Line height</p>
          <div role="radiogroup" aria-label="Line height" className="pf-exp-centered-tiles">
            {PORTFOLIO_EXPERIENCE_CENTERED_LEADING_OPTIONS.map((option) => {
              const active = option.value === lineHeight;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  aria-label={option.label}
                  data-active={active ? 'true' : 'false'}
                  onClick={() => onChange({ serifLeadLineHeight: option.value })}
                  className="pf-exp-centered-tile"
                >
                  <CenteredLineHeightGlyph value={option.value} />
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <CenteredSteppedSlider
          label="Label opacity"
          options={PORTFOLIO_EXPERIENCE_SERIF_LEAD_LABEL_OPACITY_OPTIONS}
          value={experience.serifLeadLabelOpacity ?? 'muted'}
          onChange={(serifLeadLabelOpacity) => onChange({ serifLeadLabelOpacity })}
          formatValue={(option) =>
            `${option.label} ${Math.round(SERIF_LEAD_LABEL_OPACITY[option.value] * 100)}%`
          }
        />

        <div>
          <p className="pf-exp-block-label pf-exp-option-label">Divider</p>
          <div
            role="radiogroup"
            aria-label="Divider"
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
                  aria-label={option.label}
                  title={option.label}
                  data-active={active ? 'true' : 'false'}
                  onClick={() => onChange({ serifLeadDivider: option.value })}
                  className="pf-exp-centered-tile pf-exp-centered-tile-glyph"
                >
                  <CenteredDividerGlyph value={option.value} />
                  <span>
                    {option.value === 'dot'
                      ? 'Dot'
                      : option.value === 'full'
                        ? 'Full'
                        : option.value === 'track'
                          ? 'Track'
                          : 'None'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {divider !== 'none' ? (
          <div>
            <p className="pf-exp-block-label pf-exp-option-label">Divider opacity</p>
            <div role="radiogroup" aria-label="Divider opacity" className="pf-exp-centered-underline">
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
                    {option.label}
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
        Marquee configuration
      </h3>
      <div className="pf-exp-layout-settings-body space-y-7">
        <div>
          <label className="pf-exp-block-label block" htmlFor="marquee-word-1">
            Word
          </label>
          <input
            id="marquee-word-1"
            type="text"
            value={experience.spotlightBigTitleText ?? ''}
            onChange={(event) => onChange({ spotlightBigTitleText: event.target.value })}
            placeholder="Experience"
            className="pf-exp-centered-field mt-3 w-full rounded-xl border px-3.5 py-2.5 text-sm font-medium"
          />
        </div>
        <div>
          <p className="pf-exp-block-label pf-exp-option-label">Extra words</p>
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
          <p className="pf-exp-block-label pf-exp-option-label">Word color</p>
          <div
            role="radiogroup"
            aria-label="Word color"
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
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="pf-exp-block-label pf-exp-option-label">Letter style</p>
          <div role="radiogroup" aria-label="Letter style" className="pf-exp-centered-tiles">
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
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="pf-exp-block-label pf-exp-option-label">Weight</p>
          <div role="radiogroup" aria-label="Weight" className="pf-exp-centered-weight">
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
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <CenteredSteppedSlider
          label="Scale"
          options={PORTFOLIO_EXPERIENCE_CENTERED_SCALE_OPTIONS}
          value={experience.marqueeScale ?? 'default'}
          onChange={(marqueeScale) => onChange({ marqueeScale })}
        />

        <div>
          <p className="pf-exp-block-label pf-exp-option-label">Letter spacing</p>
          <div role="radiogroup" aria-label="Letter spacing" className="pf-exp-centered-tiles">
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
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <CenteredSteppedSlider
          label="Fill opacity"
          options={PORTFOLIO_EXPERIENCE_SERIF_LEAD_LABEL_OPACITY_OPTIONS}
          value={experience.marqueeFillOpacity ?? 'muted'}
          onChange={(marqueeFillOpacity) => onChange({ marqueeFillOpacity })}
          formatValue={(option) =>
            `${option.label} ${Math.round(MARQUEE_FILL_OPACITY[option.value] * 100)}%`
          }
        />

        <div>
          <p className="pf-exp-block-label pf-exp-option-label">Separator</p>
          <div
            role="radiogroup"
            aria-label="Separator"
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
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {separator !== 'none' ? (
          <div>
            <p className="pf-exp-block-label pf-exp-option-label">Separator color</p>
            <div
              role="radiogroup"
              aria-label="Separator color"
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
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        <div>
          <p className="pf-exp-block-label pf-exp-option-label">Direction</p>
          <div
            role="radiogroup"
            aria-label="Direction"
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
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <CenteredSteppedSlider
          label="Speed"
          options={PORTFOLIO_EXPERIENCE_MARQUEE_SPEED_OPTIONS}
          value={speed}
          onChange={(marqueeSpeed) => onChange({ marqueeSpeed })}
        />

        <div>
          <p className="pf-exp-block-label pf-exp-option-label">Edge fade</p>
          <div role="radiogroup" aria-label="Edge fade" className="pf-exp-centered-tiles">
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
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="pf-exp-block-label pf-exp-option-label">Motion</p>
          <div
            role="radiogroup"
            aria-label="Motion"
            className="pf-exp-centered-tiles"
            style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}
          >
            {(
              [
                { value: true, label: 'On' },
                { value: false, label: 'Off' },
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
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {motion ? (
          <div>
            <p className="pf-exp-block-label pf-exp-option-label">Scroll velocity</p>
            <div
              role="radiogroup"
              aria-label="Scroll velocity"
              className="pf-exp-centered-tiles"
              style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}
            >
              {(
                [
                  { value: true, label: 'On' },
                  { value: false, label: 'Off' },
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
                    <span>{option.label}</span>
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
  return (
    <section className="pf-exp-layout-settings" aria-labelledby="title-stack-header-title">
      <h3 id="title-stack-header-title" className="pf-exp-layout-settings-title">
        Title stack
      </h3>
      <div className="pf-exp-layout-settings-body space-y-6">
        <ExperienceToggleRow
          label="Chronology kicker"
          description="Micro-label above the monumental title."
          checked={experience.reelKickerEnabled !== false}
          onChange={(reelKickerEnabled) => onChange({ reelKickerEnabled })}
        />
        {experience.reelKickerEnabled !== false ? (
          <div>
            <label className="pf-exp-block-label block">Kicker text</label>
            <input
              type="text"
              value={experience.reelKickerText ?? '02 / Chronology'}
              onChange={(event) => onChange({ reelKickerText: event.target.value })}
              placeholder="02 / Chronology"
              className="mt-3 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm font-medium text-neutral-900 placeholder:text-neutral-400"
            />
          </div>
        ) : null}
        <ExperienceToggleRow
          label="Entrance animation"
          description="Title rises from a mask, kicker fades, subtitle slides in."
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
  return (
    <section className="pf-exp-layout-settings" aria-labelledby="billboard-header-title">
      <h3 id="billboard-header-title" className="pf-exp-layout-settings-title">
        Billboard
      </h3>
      <div className="pf-exp-layout-settings-body space-y-6">
        <ExperienceToggleRow
          label="Big title"
          description="Full-width word above the section (e.g. EXPERIENCE)."
          checked={experience.galleryBigTitleEnabled !== false}
          onChange={(galleryBigTitleEnabled) => onChange({ galleryBigTitleEnabled })}
        />
        {experience.galleryBigTitleEnabled !== false ? (
          <>
            <div>
              <label className="pf-exp-block-label block">Big title word</label>
              <input
                type="text"
                value={experience.galleryBigTitleText ?? 'Experience'}
                onChange={(event) => onChange({ galleryBigTitleText: event.target.value })}
                placeholder="Experience"
                className="mt-3 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm font-medium text-neutral-900 placeholder:text-neutral-400"
              />
            </div>
            <ExperienceOptionGrid
              label="Letter style"
              options={PORTFOLIO_EXPERIENCE_GALLERY_BIG_TITLE_STYLE_OPTIONS}
              value={experience.galleryBigTitleStyle ?? 'outline'}
              onChange={(galleryBigTitleStyle) => onChange({ galleryBigTitleStyle })}
              columns={2}
            />
            <ExperienceOptionGrid
              label="Title color"
              options={PORTFOLIO_EXPERIENCE_GALLERY_BIG_TITLE_COLOR_OPTIONS}
              value={experience.galleryBigTitleColor ?? 'current'}
              onChange={(galleryBigTitleColor) => onChange({ galleryBigTitleColor })}
              columns={3}
            />
          </>
        ) : null}
        <div>
          <label className="pf-exp-block-label block">Secondary title</label>
          <input
            type="text"
            value={experience.gallerySecondaryTitleText ?? "Roles I've taken on"}
            onChange={(event) => onChange({ gallerySecondaryTitleText: event.target.value })}
            placeholder="Roles I've taken on"
            className="mt-3 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm font-medium text-neutral-900 placeholder:text-neutral-400"
          />
        </div>
        <ExperienceOptionGrid
          label="Secondary style"
          options={PORTFOLIO_EXPERIENCE_GALLERY_SECONDARY_TITLE_STYLE_OPTIONS}
          value={experience.gallerySecondaryTitleStyle ?? 'editorial'}
          onChange={(gallerySecondaryTitleStyle) => onChange({ gallerySecondaryTitleStyle })}
          columns={2}
        />
        <ExperienceOptionGrid
          label="Role count"
          options={PORTFOLIO_EXPERIENCE_GALLERY_ROLE_COUNT_STYLE_OPTIONS}
          value={experience.galleryRoleCountStyle ?? 'micro'}
          onChange={(galleryRoleCountStyle) => onChange({ galleryRoleCountStyle })}
          columns={3}
        />
        {(experience.galleryRoleCountStyle ?? 'micro') !== 'hidden' ? (
          <div>
            <label className="pf-exp-block-label block">Role count text</label>
            <input
              type="text"
              value={experience.galleryRoleCountText ?? '{count} roles — click any card for the full story'}
              onChange={(event) => onChange({ galleryRoleCountText: event.target.value })}
              placeholder="{count} roles — click any card for the full story"
              className="mt-3 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm font-medium text-neutral-900 placeholder:text-neutral-400"
            />
            <p className="mt-2 text-[11px] text-neutral-500">Use {'{count}'} for the number of roles.</p>
          </div>
        ) : null}
        <ExperienceToggleRow
          label="Entrance animation"
          description="Billboard reveal on the big title, then the line below."
          checked={experience.galleryHeaderAnimationEnabled !== false}
          onChange={(galleryHeaderAnimationEnabled) => onChange({ galleryHeaderAnimationEnabled })}
        />
        {experience.galleryHeaderAnimationEnabled !== false ? (
          <ExperienceOptionGrid
            label="Animation intensity"
            options={PORTFOLIO_EXPERIENCE_GALLERY_HEADER_ANIMATION_STYLE_OPTIONS}
            value={experience.galleryHeaderAnimationStyle ?? 'dramatic'}
            onChange={(galleryHeaderAnimationStyle) => onChange({ galleryHeaderAnimationStyle })}
            columns={3}
          />
        ) : null}
        <ExperienceToggleRow
          label="Scroll parallax"
          description="The big title stays longer while the rest drifts away."
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
  return (
    <section className="pf-exp-layout-settings" aria-labelledby="split-heading-header-title">
      <h3 id="split-heading-header-title" className="pf-exp-layout-settings-title">
        Split heading
      </h3>
      <div className="pf-exp-layout-settings-body space-y-6">
        <ExperienceToggleRow
          label="Heading"
          description="Large narrative title on the left."
          checked={experience.loftHeadingEnabled !== false}
          onChange={(loftHeadingEnabled) => onChange({ loftHeadingEnabled })}
        />
        {experience.loftHeadingEnabled !== false ? (
          <>
            <div>
              <label className="pf-exp-block-label block">Heading text</label>
              <input
                type="text"
                value={experience.loftHeadingText ?? "Roles I've taken on"}
                onChange={(event) => onChange({ loftHeadingText: event.target.value })}
                placeholder="Roles I've taken on"
                className="mt-3 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm font-medium text-neutral-900 placeholder:text-neutral-400"
              />
            </div>
            <ExperienceOptionGrid
              label="Italic word"
              options={PORTFOLIO_EXPERIENCE_LOFT_HEADING_ITALIC_WORD_OPTIONS}
              value={experience.loftHeadingItalicWord ?? 'first'}
              onChange={(loftHeadingItalicWord) => onChange({ loftHeadingItalicWord })}
              columns={3}
            />
            <ExperienceOptionGrid
              label="Weight contrast"
              options={PORTFOLIO_EXPERIENCE_LOFT_HEADING_FONT_WEIGHT_OPTIONS}
              value={experience.loftHeadingFontWeight ?? 'light-to-bold'}
              onChange={(loftHeadingFontWeight) => onChange({ loftHeadingFontWeight })}
              columns={2}
            />
          </>
        ) : null}
        <div>
          <label className="pf-exp-block-label block">Side label</label>
          <input
            type="text"
            value={experience.loftLabelText ?? 'Experience'}
            onChange={(event) => onChange({ loftLabelText: event.target.value })}
            placeholder="Experience"
            className="mt-3 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm font-medium text-neutral-900 placeholder:text-neutral-400"
          />
        </div>
        <ExperienceOptionGrid
          label="Label style"
          options={PORTFOLIO_EXPERIENCE_LOFT_LABEL_STYLE_OPTIONS}
          value={experience.loftLabelStyle ?? 'uppercase'}
          onChange={(loftLabelStyle) => onChange({ loftLabelStyle })}
          columns={3}
        />
        <ExperienceOptionGrid
          label="Label alignment"
          options={PORTFOLIO_EXPERIENCE_LOFT_LABEL_POSITION_OPTIONS}
          value={experience.loftLabelPosition ?? 'top-aligned'}
          onChange={(loftLabelPosition) => onChange({ loftLabelPosition })}
          columns={2}
        />
        <ExperienceToggleRow
          label="Entrance animation"
          description="Title rises from a mask, label slides in from the right."
          checked={experience.loftHeaderAnimationEnabled !== false}
          onChange={(loftHeaderAnimationEnabled) => onChange({ loftHeaderAnimationEnabled })}
        />
        <ExperienceToggleRow
          label="Scroll exit"
          description="The side label slides away as you scroll."
          checked={experience.loftScrollEffectEnabled !== false}
          onChange={(loftScrollEffectEnabled) => onChange({ loftScrollEffectEnabled })}
        />
        {experience.loftScrollEffectEnabled !== false ? (
          <ExperienceOptionGrid
            label="Exit style"
            options={PORTFOLIO_EXPERIENCE_LOFT_SCROLL_EFFECT_STYLE_OPTIONS}
            value={experience.loftScrollEffectStyle ?? 'slide-right'}
            onChange={(loftScrollEffectStyle) => onChange({ loftScrollEffectStyle })}
            columns={2}
          />
        ) : null}
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
  return (
    <section className="pf-exp-layout-settings" aria-labelledby="masthead-header-title">
      <h3 id="masthead-header-title" className="pf-exp-layout-settings-title">
        Masthead
      </h3>
      <div className="pf-exp-layout-settings-body space-y-6">
        <ExperienceToggleRow
          label="Headline"
          description="Monumental uppercase lines."
          checked={experience.pressHeadingEnabled !== false}
          onChange={(pressHeadingEnabled) => onChange({ pressHeadingEnabled })}
        />
        {experience.pressHeadingEnabled !== false ? (
          <div>
            <label className="pf-exp-block-label block">Headline text</label>
            <input
              type="text"
              value={experience.pressHeadingText ?? 'Roles taken. Skills sharpened. Impact delivered.'}
              onChange={(event) => onChange({ pressHeadingText: event.target.value })}
              placeholder="Roles taken. Skills sharpened. Impact delivered."
              className="mt-3 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm font-medium text-neutral-900 placeholder:text-neutral-400"
            />
          </div>
        ) : null}
        <div>
          <label className="pf-exp-block-label block">Intro line</label>
          <input
            type="text"
            value={experience.pressIntroText ?? ''}
            onChange={(event) => onChange({ pressIntroText: event.target.value })}
            placeholder="Selected roles, projects, and outcomes."
            className="mt-3 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm font-medium text-neutral-900 placeholder:text-neutral-400"
          />
        </div>
        <ExperienceOptionGrid
          label="Weight"
          options={PORTFOLIO_EXPERIENCE_PRESS_HEADING_WEIGHT_STYLE_OPTIONS}
          value={experience.pressHeadingWeightStyle ?? 'alternating'}
          onChange={(pressHeadingWeightStyle) => onChange({ pressHeadingWeightStyle })}
          columns={2}
        />
        <ExperienceOptionGrid
          label="Alignment"
          options={PORTFOLIO_EXPERIENCE_PRESS_HEADING_ALIGNMENT_OPTIONS}
          value={experience.pressHeadingAlignment ?? 'left'}
          onChange={(pressHeadingAlignment) => onChange({ pressHeadingAlignment })}
          columns={2}
        />
        <ExperienceOptionGrid
          label="Intro style"
          options={PORTFOLIO_EXPERIENCE_PRESS_SUBTITLE_STYLE_OPTIONS}
          value={experience.pressSubtitleStyle ?? 'micro'}
          onChange={(pressSubtitleStyle) => onChange({ pressSubtitleStyle })}
          columns={3}
        />
        <ExperienceToggleRow
          label="Entrance animation"
          description="Words reveal from a mask, line by line."
          checked={experience.pressHeaderAnimationEnabled !== false}
          onChange={(pressHeaderAnimationEnabled) => onChange({ pressHeaderAnimationEnabled })}
        />
        {experience.pressHeaderAnimationEnabled !== false ? (
          <ExperienceOptionGrid
            label="Reveal"
            options={PORTFOLIO_EXPERIENCE_PRESS_ANIMATION_STYLE_OPTIONS}
            value={experience.pressHeaderAnimationStyle ?? 'staggered'}
            onChange={(pressHeaderAnimationStyle) => onChange({ pressHeaderAnimationStyle })}
            columns={3}
          />
        ) : null}
        <ExperienceToggleRow
          label="Scroll parallax"
          description="Each line leaves at a different speed."
          checked={experience.pressScrollParallaxEnabled !== false}
          onChange={(pressScrollParallaxEnabled) => onChange({ pressScrollParallaxEnabled })}
        />
        {experience.pressScrollParallaxEnabled !== false ? (
          <ExperienceOptionGrid
            label="Parallax intensity"
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
  return (
    <section className="pf-exp-layout-settings" aria-labelledby="accent-title-header-title">
      <h3 id="accent-title-header-title" className="pf-exp-layout-settings-title">
        Accent title
      </h3>
      <div className="pf-exp-layout-settings-body space-y-6">
        <ExperienceToggleRow
          label="Hero title"
          description="Prefix plus a larger accent word."
          checked={experience.legacyHeadingEnabled !== false}
          onChange={(legacyHeadingEnabled) => onChange({ legacyHeadingEnabled })}
        />
        {experience.legacyHeadingEnabled !== false ? (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="pf-exp-block-label block">Prefix</label>
                <input
                  type="text"
                  value={experience.legacyHeadingText ?? 'A Career Built on'}
                  onChange={(event) => onChange({ legacyHeadingText: event.target.value })}
                  placeholder="A Career Built on"
                  className="mt-3 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm font-medium text-neutral-900 placeholder:text-neutral-400"
                />
              </div>
              <div>
                <label className="pf-exp-block-label block">Accent word</label>
                <input
                  type="text"
                  value={experience.legacyHeadingAccentText ?? 'Craft'}
                  onChange={(event) => onChange({ legacyHeadingAccentText: event.target.value })}
                  placeholder="Craft"
                  className="mt-3 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm font-medium text-neutral-900 placeholder:text-neutral-400"
                />
              </div>
            </div>
            <div>
              <label className="pf-exp-block-label block">Intro sentence</label>
              <input
                type="text"
                value={experience.legacyIntroText ?? ''}
                onChange={(event) => onChange({ legacyIntroText: event.target.value })}
                placeholder="A selection of roles, teams, and problems solved along the way."
                className="mt-3 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm font-medium text-neutral-900 placeholder:text-neutral-400"
              />
            </div>
            <ExperienceOptionGrid
              label="Prefix weight"
              options={PORTFOLIO_EXPERIENCE_LEGACY_PREFIX_WEIGHT_OPTIONS}
              value={experience.legacyPrefixWeight ?? 'light'}
              onChange={(legacyPrefixWeight) => onChange({ legacyPrefixWeight })}
              columns={3}
            />
            <ExperienceOptionGrid
              label="Accent style"
              options={PORTFOLIO_EXPERIENCE_LEGACY_ACCENT_STYLE_OPTIONS}
              value={experience.legacyAccentStyle ?? 'italic-bold'}
              onChange={(legacyAccentStyle) => onChange({ legacyAccentStyle })}
              columns={3}
            />
            <ExperienceOptionGrid
              label="Accent size"
              options={PORTFOLIO_EXPERIENCE_LEGACY_ACCENT_SIZE_OPTIONS}
              value={experience.legacyAccentSize ?? 'dramatic'}
              onChange={(legacyAccentSize) => onChange({ legacyAccentSize })}
              columns={3}
            />
            <ExperienceOptionGrid
              label="Intro style"
              options={PORTFOLIO_EXPERIENCE_LEGACY_SUBTITLE_STYLE_OPTIONS}
              value={experience.legacySubtitleStyle ?? 'micro'}
              onChange={(legacySubtitleStyle) => onChange({ legacySubtitleStyle })}
              columns={3}
            />
            <ExperienceToggleRow
              label="Accent underline"
              description="Hairline under the accent word."
              checked={experience.legacyAccentUnderline !== false}
              onChange={(legacyAccentUnderline) => onChange({ legacyAccentUnderline })}
            />
            {experience.legacyAccentUnderline !== false ? (
              <ExperienceOptionGrid
                label="Underline"
                options={PORTFOLIO_EXPERIENCE_LEGACY_UNDERLINE_STYLE_OPTIONS}
                value={experience.legacyAccentUnderlineStyle ?? 'solid'}
                onChange={(legacyAccentUnderlineStyle) => onChange({ legacyAccentUnderlineStyle })}
                columns={2}
              />
            ) : null}
            <ExperienceToggleRow
              label="Entrance animation"
              description="Prefix fades, accent word blooms, underline draws in."
              checked={experience.legacyHeaderAnimationEnabled !== false}
              onChange={(legacyHeaderAnimationEnabled) => onChange({ legacyHeaderAnimationEnabled })}
            />
            {experience.legacyHeaderAnimationEnabled !== false ? (
              <ExperienceOptionGrid
                label="Accent motion"
                options={PORTFOLIO_EXPERIENCE_LEGACY_ANIMATION_STYLE_OPTIONS}
                value={experience.legacyHeaderAnimationStyle ?? 'bloom'}
                onChange={(legacyHeaderAnimationStyle) => onChange({ legacyHeaderAnimationStyle })}
                columns={3}
              />
            ) : null}
            <ExperienceToggleRow
              label="Scroll parallax"
              description="The accent word stays while the prefix leaves."
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
    label: 'General',
    description: 'Section visibility and how responsibilities are shown.',
  },
  {
    id: 'header',
    label: 'Header',
    description: 'Pick a header design — it applies above every Experience layout.',
  },
  {
    id: 'design',
    label: 'Design',
    description: 'Choose the Experience layout design.',
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
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full cursor-pointer flex-col gap-1 text-left"
    >
      <span className="flex items-center justify-between gap-4">
        <span className="min-w-0 text-sm font-semibold text-neutral-950">{label}</span>
        <ExperienceSwitchTrack checked={checked} />
      </span>
      {description ? <span className="text-sm text-neutral-500">{description}</span> : null}
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
            className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm font-medium text-neutral-900 placeholder:text-neutral-400"
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
  switch (design) {
    case 'editorial':
      return (
        <MiniSlide>
          <rect className="pf-exp-mini-ink" x="8" y="10" width="24" height="52" rx="3" />
          <MiniType x={12} y={24} size={6}>
            15Y
          </MiniType>
          <rect className="pf-exp-mini-mute" x="12" y="30" width="16" height="2.4" rx="1.2" />
          <rect className="pf-exp-mini-mute" x="12" y="36" width="12" height="2.2" rx="1.1" />
          <MiniType x={38} y={20} size={7}>
            EXP.
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
            EXP.
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
            EXP.
          </MiniType>
          <rect className="pf-exp-mini-mute" x="64" y="8" width="48" height="26" rx="3" />
          <rect className="pf-exp-mini-mute" x="8" y="38" width="48" height="26" rx="3" />
          <rect className="pf-exp-mini-ink" x="64" y="38" width="48" height="26" rx="3" />
        </MiniSlide>
      );
    case 'spotlight':
      return (
        <MiniSlide>
          <rect className="pf-exp-mini-ink" x="8" y="8" width="70" height="36" rx="3.5" />
          <MiniType x={14} y={28} size={7}>
            TITLE
          </MiniType>
          <rect className="pf-exp-mini-mute" x="84" y="8" width="28" height="16" rx="2.5" />
          <rect className="pf-exp-mini-mute" x="8" y="50" width="40" height="3" rx="1.4" />
          <rect className="pf-exp-mini-mute" x="8" y="57" width="28" height="2.4" rx="1.2" />
          <rect className="pf-exp-mini-ink" x="84" y="30" width="28" height="32" rx="2.5" />
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
            CRAFT
          </MiniType>
          <rect className="pf-exp-mini-ink" x="10" y="26" width="38" height="34" rx="3" />
          <rect className="pf-exp-mini-mute" x="56" y="30" width="54" height="3" rx="1.4" />
          <rect className="pf-exp-mini-mute" x="56" y="38" width="40" height="2.6" rx="1.3" />
          <rect className="pf-exp-mini-mute" x="56" y="46" width="48" height="2.6" rx="1.3" />
        </MiniSlide>
      );
    case 'asymmetric':
      return (
        <MiniSlide>
          <rect className="pf-exp-mini-ink" x="8" y="8" width="52" height="56" rx="3" />
          <rect className="pf-exp-mini-mute" x="68" y="16" width="40" height="2.2" rx="1.1" />
          <rect className="pf-exp-mini-mute" x="68" y="24" width="34" height="2" rx="1" />
          <rect className="pf-exp-mini-mute" x="68" y="32" width="38" height="2" rx="1" />
          <rect className="pf-exp-mini-mute" x="68" y="40" width="26" height="2" rx="1" />
          <rect className="pf-exp-mini-mute" x="68" y="48" width="32" height="2" rx="1" />
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
  return (
    <section className="pf-exp-layout-settings" aria-labelledby="experience-layout-settings-title">
      <h3 id="experience-layout-settings-title" className="pf-exp-layout-settings-title">
        Layout settings
      </h3>
      <div key={motionKey} className="pf-exp-layout-settings-body space-y-6">
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
  const [showGrid, setShowGrid] = useState(false);
  const selected =
    PORTFOLIO_EXPERIENCE_DESIGN_OPTIONS.find((option) => option.value === value) ??
    PORTFOLIO_EXPERIENCE_DESIGN_OPTIONS[0];

  if (showGrid) {
    return (
      <div>
        <div className="flex items-center justify-between gap-3">
          <p className="pf-exp-block-label !mb-0">Item design</p>
          <button
            type="button"
            onClick={() => setShowGrid(false)}
            className="text-sm font-semibold text-neutral-500 hover:text-neutral-800"
          >
            ← Back
          </button>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-4">
          {PORTFOLIO_EXPERIENCE_DESIGN_OPTIONS.map((option) => {
            const active = option.value === value;
            return (
              <ExperiencePickerCard
                key={option.value}
                active={active}
                label={option.label}
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
      </div>
    );
  }

  return (
    <div>
      <p className="pf-exp-block-label">Item design</p>
      <div className="group relative w-full overflow-hidden rounded-2xl border border-neutral-200/80 p-3">
        <ExperienceDesignWireframe design={value} />
        <button
          type="button"
          onClick={() => setShowGrid(true)}
          aria-label="Change design"
          className="absolute inset-0 hidden items-center justify-center bg-black/55 opacity-0 outline-none transition-opacity duration-150 hover:opacity-100 focus-visible:opacity-100 sm:flex"
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-neutral-900 shadow-lg">
            Change design
          </span>
        </button>
        <button
          type="button"
          onClick={() => setShowGrid(true)}
          aria-label="Change design"
          className="absolute bottom-2 right-2 inline-flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1.5 text-xs font-semibold text-white sm:hidden"
        >
          Change
        </button>
      </div>
      <p className="mt-2 text-sm font-semibold text-neutral-950">{selected.label}</p>
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
  return (
    <div>
      <p className="pf-exp-block-label pf-exp-option-label">Tasks display</p>
      <div
        role="radiogroup"
        aria-label="Tasks display"
        className="grid grid-cols-2 gap-2"
      >
        {PORTFOLIO_EXPERIENCE_TASKS_DISPLAY_OPTIONS.map((option) => {
          const active = option.value === value;
          return (
            <ExperiencePickerCard
              key={option.value}
              active={active}
              label={option.label}
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
              title={option.description}
              onClick={() => onChange(option.value)}
              data-active={active ? 'true' : 'false'}
              className="pf-exp-segment-btn px-2.5 py-1.5 text-center text-[13px] font-medium tracking-tight"
              style={
                active
                  ? undefined
                  : { color: '#c4c4c4', WebkitTextFillColor: '#c4c4c4' }
              }
            >
              {option.label}
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
  const isSpotlight = design === 'spotlight';
  const isLoft = design === 'loft';
  const isPress = design === 'press';
  const isLegacy = design === 'legacy';
  const showStackLabel = isEditorial || design === 'milestone';

  return (
    <PortfolioLinkArrowProvider value={experience.linkArrowStyle ?? 'northeast'}>
    <div className="space-y-6">
      <div
        role="tablist"
        aria-label="Experience settings"
        className="pf-exp-segment inline-flex w-fit max-w-full items-center gap-[3px] p-[3px]"
        data-compact="true"
      >
        {EXPERIENCE_SUB_SECTIONS.map((section) => {
          const active = subSection === section.id;
          return (
            <button
              key={section.id}
              type="button"
              role="tab"
              aria-selected={active}
              data-active={active ? 'true' : 'false'}
              className="pf-exp-segment-btn whitespace-nowrap px-3 py-1.5 text-center text-[12px] font-semibold tracking-tight"
              onClick={() => setSubSection(section.id)}
            >
              {section.label}
            </button>
          );
        })}
      </div>

      {subSection === 'general' ? (
        <div className="space-y-8">
          <ExperienceToggleRow
            label="Show section"
            checked={experience.enabled}
            onChange={(enabled) => onChange({ enabled })}
          />
          <SectionColorModeControl
            value={experience.colorModeOverride}
            onChange={(colorModeOverride) => onChange({ colorModeOverride })}
          />
          <div>
            <p className="pf-exp-block-label">Content visibility</p>
            <div className="flex flex-wrap gap-3">
              <ExperienceVisibilityBadge
                label="Title"
                checked={experience.showTitle !== false}
                onChange={(showTitle) => onChange({ showTitle })}
              />
              <ExperienceVisibilityBadge
                label="Period"
                checked={experience.showPeriod !== false}
                onChange={(showPeriod) => onChange({ showPeriod })}
              />
              <ExperienceVisibilityBadge
                label="Organization"
                checked={experience.showOrganization !== false}
                onChange={(showOrganization) => onChange({ showOrganization })}
              />
              <ExperienceVisibilityBadge
                label="Status & meta"
                checked={experience.showMeta !== false}
                onChange={(showMeta) => onChange({ showMeta })}
              />
              <ExperienceVisibilityBadge
                label="Description"
                checked={experience.showDescription !== false}
                onChange={(showDescription) => onChange({ showDescription })}
              />
              <ExperienceVisibilityBadge
                label="Tasks"
                checked={experience.showTasks !== false}
                onChange={(showTasks) => onChange({ showTasks })}
              />
              <ExperienceVisibilityBadge
                label="Tools"
                checked={experience.showTools !== false}
                onChange={(showTools) => onChange({ showTools })}
              />
              <ExperienceVisibilityBadge
                label="Proof / links"
                checked={experience.showProof !== false}
                onChange={(showProof) => onChange({ showProof })}
              />
              <ExperienceVisibilityBadge
                label="Media / image"
                checked={experience.showEntryMedia !== false}
                onChange={(showEntryMedia) => onChange({ showEntryMedia })}
              />
            </div>
          </div>
          <ExperienceTasksDisplayChoiceGrid
            value={experience.tasksDisplay ?? 'editorial-dash'}
            onChange={(tasksDisplay) => onChange({ tasksDisplay })}
          />
          <ExperienceLinkButtonChoiceGrid
            value={experience.repoLinkButtonStyle ?? 'auto'}
            onChange={(repoLinkButtonStyle) => onChange({ repoLinkButtonStyle })}
          />
          <ExperienceLinkArrowChoiceGrid
            value={experience.linkArrowStyle ?? 'northeast'}
            onChange={(linkArrowStyle) => onChange({ linkArrowStyle })}
          />
        </div>
      ) : subSection === 'header' ? (
        <div>
          <ExperienceHeaderChoiceGrid
            value={experience.headerDesign ?? 'none'}
            onChange={(headerDesign) => onChange({ headerDesign })}
          />
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
          {isTable ? (
            <ExperienceToggleRow
              label="Striped rows"
              description="Alternate subtle row backgrounds for easier scanning."
              checked={experience.tableStripedRows === true}
              onChange={(tableStripedRows) => onChange({ tableStripedRows })}
            />
          ) : null}
          {isReel ? (
            <>
              <ExperienceOptionGrid
                label="Status presentation"
                options={PORTFOLIO_EXPERIENCE_REEL_STATUS_STYLE_OPTIONS}
                value={experience.reelStatusStyle ?? 'badge'}
                onChange={(reelStatusStyle) => onChange({ reelStatusStyle })}
                columns={2}
              />
              <ExperienceOptionGrid
                label="Scroll motion"
                options={PORTFOLIO_EXPERIENCE_REEL_SCROLL_MOTION_OPTIONS}
                value={experience.reelScrollMotion ?? 'fade-reveal'}
                onChange={(reelScrollMotion) => onChange({ reelScrollMotion })}
                columns={3}
              />
            </>
          ) : null}
          {isCards ? (
            <>
              <ExperienceOptionGrid
                label="Largeur de la carte"
                options={PORTFOLIO_EXPERIENCE_CARDS_CARD_WIDTH_OPTIONS}
                value={experience.cardsCardWidth ?? 'medium'}
                onChange={(cardsCardWidth) => onChange({ cardsCardWidth })}
                columns={3}
              />
              <ExperienceOptionGrid
                label="Espacement des éléments"
                options={PORTFOLIO_EXPERIENCE_CARDS_ELEMENT_SPACING_OPTIONS}
                value={experience.cardsElementSpacing ?? 'md'}
                onChange={(cardsElementSpacing) => onChange({ cardsElementSpacing })}
                columns={3}
              />
              <ExperienceOptionGrid
                label="Gap vertical"
                options={PORTFOLIO_EXPERIENCE_CARDS_VERTICAL_GAP_OPTIONS}
                value={experience.cardsVerticalGap ?? 'md'}
                onChange={(cardsVerticalGap) => onChange({ cardsVerticalGap })}
                columns={3}
              />
              <ExperienceOptionGrid
                label="Card border radius"
                options={PORTFOLIO_EXPERIENCE_CARDS_BORDER_RADIUS_OPTIONS}
                value={experience.cardsBorderRadius ?? 'none'}
                onChange={(cardsBorderRadius) => onChange({ cardsBorderRadius })}
                columns={3}
              />
            </>
          ) : null}
          {isEditorial ? (
            <>
              <ExperienceOptionGrid
                label="Entry expand"
                options={PORTFOLIO_EXPERIENCE_ENTRY_EXPAND_MODE_OPTIONS}
                value={experience.entryExpandMode ?? 'accordion'}
                onChange={(entryExpandMode) => onChange({ entryExpandMode })}
                columns={2}
              />
              <ExperienceOptionGrid
                label="Detail layout"
                options={PORTFOLIO_EXPERIENCE_EDITORIAL_DETAIL_LAYOUT_OPTIONS}
                value={experience.editorialDetailLayout ?? 'split-actions'}
                onChange={(editorialDetailLayout) => onChange({ editorialDetailLayout })}
                columns={2}
              />
              <ExperienceOptionGrid
                label="Period / timeline"
                options={PORTFOLIO_EXPERIENCE_PERIOD_DESIGN_OPTIONS}
                value={experience.periodDesign ?? 'plain'}
                onChange={(periodDesign) => onChange({ periodDesign })}
                columns={2}
              />
            </>
          ) : null}
          {isDuotone ? (
            <ExperienceOptionGrid
              label="Scroll mode"
              options={PORTFOLIO_EXPERIENCE_DUOTONE_SCROLL_MODE_OPTIONS}
              value={experience.duotoneScrollMode ?? 'sticky'}
              onChange={(duotoneScrollMode) => onChange({ duotoneScrollMode })}
              columns={3}
            />
          ) : null}
          {isDuotone && (experience.duotoneScrollMode ?? 'sticky') === 'slide' ? (
            <>
              <ExperienceOptionGrid
                label="Slide navigation"
                options={PORTFOLIO_EXPERIENCE_DUOTONE_SLIDE_NAV_STYLE_OPTIONS}
                value={experience.duotoneSlideNavStyle ?? 'chevron'}
                onChange={(duotoneSlideNavStyle) => onChange({ duotoneSlideNavStyle })}
                columns={3}
              />
              <ExperienceToggleRow
                label="Auto-advance"
                description="Move to the next role every 5s — pauses while the frame is hovered."
                checked={experience.duotoneAutoAdvance === true}
                onChange={(duotoneAutoAdvance) => onChange({ duotoneAutoAdvance })}
              />
            </>
          ) : null}
          {isDuotone && experience.duotoneScrollMode === 'slide' ? (
            <>
              <ExperienceOptionGrid
                label="Screen frame color"
                options={PORTFOLIO_EXPERIENCE_DUOTONE_FRAME_COLOR_OPTIONS}
                value={experience.duotoneFrameColor ?? 'none'}
                onChange={(duotoneFrameColor) => onChange({ duotoneFrameColor })}
                columns={3}
              />
              <ExperienceOptionGrid
                label="Screen frame radius"
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
                label="Thumbnail effect"
                options={PORTFOLIO_EXPERIENCE_DUOTONE_THUMBNAIL_EFFECT_OPTIONS}
                value={experience.duotoneThumbnailEffect ?? 'grayscale'}
                onChange={(duotoneThumbnailEffect) => onChange({ duotoneThumbnailEffect })}
                columns={3}
              />
              <ExperienceOptionGrid
                label="Thumbnail height"
                options={PORTFOLIO_EXPERIENCE_DUOTONE_THUMBNAIL_HEIGHT_OPTIONS}
                value={experience.duotoneThumbnailHeight ?? 'md'}
                onChange={(duotoneThumbnailHeight) => onChange({ duotoneThumbnailHeight })}
                columns={3}
              />
              <ExperienceOptionGrid
                label="Repository CTA"
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
                label="Vertical spacing"
                options={PORTFOLIO_EXPERIENCE_DUOTONE_STICKY_VERTICAL_GAP_OPTIONS}
                value={experience.duotoneStickyVerticalGap ?? 'md'}
                onChange={(duotoneStickyVerticalGap) => onChange({ duotoneStickyVerticalGap })}
                columns={2}
              />
              <ExperienceToggleRow
                label="Swap columns"
                description="Title & thumbnail on the right, info card on the left."
                checked={experience.duotoneStickySwapSides === true}
                onChange={(duotoneStickySwapSides) => onChange({ duotoneStickySwapSides })}
              />
              {experience.duotoneScrollMode === 'scroll' ? (
                <>
                  <ExperienceToggleRow
                    label="Full-width title"
                    description="Role title spans the full width above both columns."
                    checked={experience.duotoneScrollFullWidthTitle === true}
                    onChange={(duotoneScrollFullWidthTitle) =>
                      onChange({ duotoneScrollFullWidthTitle })
                    }
                  />
                  <ExperienceToggleRow
                    label="Alternate sides"
                    description="Flip title/info columns on every other role."
                    checked={experience.duotoneAlternateSides === true}
                    onChange={(duotoneAlternateSides) => onChange({ duotoneAlternateSides })}
                  />
                </>
              ) : null}
            </>
          ) : null}
          {isGallery ? (
            <ExperienceOptionGrid
              label="Columns per row"
              options={PORTFOLIO_EXPERIENCE_GALLERY_COLUMNS_OPTIONS}
              value={experience.galleryColumns ?? 3}
              onChange={(galleryColumns) => onChange({ galleryColumns })}
            />
          ) : null}
          {isGallery ? (
            <ExperienceOptionGrid
              label="Thumbnail fit"
              options={PORTFOLIO_EXPERIENCE_GALLERY_THUMBNAIL_FIT_OPTIONS}
              value={experience.galleryThumbnailFit ?? 'cover'}
              onChange={(galleryThumbnailFit) => onChange({ galleryThumbnailFit })}
              columns={2}
            />
          ) : null}
          {isGallery ? (
            <ExperienceToggleRow
              label="Big title"
              description="The full-width word above the gallery (e.g. “EXPERIENCE”)."
              checked={experience.galleryBigTitleEnabled !== false}
              onChange={(galleryBigTitleEnabled) => onChange({ galleryBigTitleEnabled })}
            />
          ) : null}
          {isGallery && experience.galleryBigTitleEnabled !== false ? (
            <>
              <div>
                <label className="pf-exp-block-label block">
                  Big title word
                </label>
                <input
                  type="text"
                  value={experience.galleryBigTitleText ?? 'Experience'}
                  onChange={(event) => onChange({ galleryBigTitleText: event.target.value })}
                  placeholder="Experience"
                  className="mt-3 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm font-medium text-neutral-900 placeholder:text-neutral-400"
                />
              </div>
              <ExperienceOptionGrid
                label="Big title style"
                options={PORTFOLIO_EXPERIENCE_GALLERY_BIG_TITLE_STYLE_OPTIONS}
                value={experience.galleryBigTitleStyle ?? 'outline'}
                onChange={(galleryBigTitleStyle) => onChange({ galleryBigTitleStyle })}
                columns={2}
              />
              <ExperienceOptionGrid
                label="Big title color"
                options={PORTFOLIO_EXPERIENCE_GALLERY_BIG_TITLE_COLOR_OPTIONS}
                value={experience.galleryBigTitleColor ?? 'current'}
                onChange={(galleryBigTitleColor) => onChange({ galleryBigTitleColor })}
                columns={2}
              />
            </>
          ) : null}
          {/* Gallery premium animation & typography options */}
          {isGallery ? (
            <>
              <ExperienceToggleRow
                label="Entry animation"
                description="GSAP animations on scroll into view (scale + blur reveal)."
                checked={experience.galleryHeaderAnimationEnabled !== false}
                onChange={(galleryHeaderAnimationEnabled) => onChange({ galleryHeaderAnimationEnabled })}
              />
              {experience.galleryHeaderAnimationEnabled !== false ? (
                <ExperienceOptionGrid
                  label="Animation style"
                  options={PORTFOLIO_EXPERIENCE_GALLERY_HEADER_ANIMATION_STYLE_OPTIONS}
                  value={experience.galleryHeaderAnimationStyle ?? 'dramatic'}
                  onChange={(galleryHeaderAnimationStyle) => onChange({ galleryHeaderAnimationStyle })}
                  columns={3}
                />
              ) : null}
              <ExperienceToggleRow
                label="Scroll parallax"
                description="Asymmetric parallax on scroll — big title slow, rest fast + fade."
                checked={experience.galleryScrollParallaxEnabled !== false}
                onChange={(galleryScrollParallaxEnabled) => onChange({ galleryScrollParallaxEnabled })}
              />
              <ExperienceOptionGrid
                label="Secondary title style"
                options={PORTFOLIO_EXPERIENCE_GALLERY_SECONDARY_TITLE_STYLE_OPTIONS}
                value={experience.gallerySecondaryTitleStyle ?? 'editorial'}
                onChange={(gallerySecondaryTitleStyle) => onChange({ gallerySecondaryTitleStyle })}
                columns={2}
              />
              <div>
                <label className="pf-exp-block-label block">
                  Secondary title text
                </label>
                <input
                  type="text"
                  value={experience.gallerySecondaryTitleText ?? "Roles I've taken on"}
                  onChange={(event) => onChange({ gallerySecondaryTitleText: event.target.value })}
                  placeholder="Roles I've taken on"
                  className="mt-3 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm font-medium text-neutral-900 placeholder:text-neutral-400"
                />
              </div>
              <ExperienceOptionGrid
                label="Role count style"
                options={PORTFOLIO_EXPERIENCE_GALLERY_ROLE_COUNT_STYLE_OPTIONS}
                value={experience.galleryRoleCountStyle ?? 'micro'}
                onChange={(galleryRoleCountStyle) => onChange({ galleryRoleCountStyle })}
                columns={3}
              />
              {(experience.galleryRoleCountStyle ?? 'micro') !== 'hidden' ? (
                <div>
                  <label className="pf-exp-block-label block">
                    Role count text
                  </label>
                  <p className="mt-1 text-xs text-neutral-500">
                    Use <code className="rounded bg-neutral-100 px-1 py-0.5 text-[10px]">{'{count}'}</code> as placeholder for the number.
                  </p>
                  <input
                    type="text"
                    value={experience.galleryRoleCountText ?? '{count} roles — click any card for the full story'}
                    onChange={(event) => onChange({ galleryRoleCountText: event.target.value })}
                    placeholder="{count} roles — click any card for the full story"
                    className="mt-3 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm font-medium text-neutral-900 placeholder:text-neutral-400"
                  />
                </div>
              ) : null}
            </>
          ) : null}
          {isSpotlight ? (
            <ExperienceToggleRow
              label="Big title"
              description="The scrolling marquee title above the showcase — cycles through up to 4 words."
              checked={experience.spotlightBigTitleEnabled !== false}
              onChange={(spotlightBigTitleEnabled) => onChange({ spotlightBigTitleEnabled })}
            />
          ) : null}
          {isSpotlight && experience.spotlightBigTitleEnabled !== false ? (
            <>
              <div>
                <label className="pf-exp-block-label block">
                  Big title words
                </label>
                <p className="mt-1 text-sm text-neutral-500">
                  Up to 4 words, cycled in the scrolling title. Leave the extra ones blank to skip them.
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={experience.spotlightBigTitleText ?? 'Experience'}
                    onChange={(event) => onChange({ spotlightBigTitleText: event.target.value })}
                    placeholder="Experience"
                    className="w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm font-medium text-neutral-900 placeholder:text-neutral-400"
                  />
                  <input
                    type="text"
                    value={experience.spotlightBigTitleWord2 ?? ''}
                    onChange={(event) => onChange({ spotlightBigTitleWord2: event.target.value })}
                    placeholder="Optional"
                    className="w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm font-medium text-neutral-900 placeholder:text-neutral-400"
                  />
                  <input
                    type="text"
                    value={experience.spotlightBigTitleWord3 ?? ''}
                    onChange={(event) => onChange({ spotlightBigTitleWord3: event.target.value })}
                    placeholder="Optional"
                    className="w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm font-medium text-neutral-900 placeholder:text-neutral-400"
                  />
                  <input
                    type="text"
                    value={experience.spotlightBigTitleWord4 ?? ''}
                    onChange={(event) => onChange({ spotlightBigTitleWord4: event.target.value })}
                    placeholder="Optional"
                    className="w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm font-medium text-neutral-900 placeholder:text-neutral-400"
                  />
                </div>
              </div>
              <ExperienceOptionGrid
                label="Big title color"
                options={PORTFOLIO_EXPERIENCE_SPOTLIGHT_TITLE_COLOR_OPTIONS}
                value={experience.spotlightBigTitleColor ?? 'ink'}
                onChange={(spotlightBigTitleColor) => onChange({ spotlightBigTitleColor })}
                columns={4}
              />
            </>
          ) : null}
          {isSpotlight ? (
            <ExperienceOptionGrid
              label="Thumbnail"
              options={PORTFOLIO_EXPERIENCE_SPOTLIGHT_THUMBNAIL_FIT_OPTIONS}
              value={experience.spotlightThumbnailFit ?? 'cover'}
              onChange={(spotlightThumbnailFit) => onChange({ spotlightThumbnailFit })}
              columns={2}
            />
          ) : null}
          {/* Spotlight Marquee Premium Options */}
          {isSpotlight ? (
            <ExperienceToggleRow
              label="Marquee animation"
              description="Enable/disable the scrolling animation on the marquee."
              checked={experience.spotlightHeaderAnimationEnabled !== false}
              onChange={(spotlightHeaderAnimationEnabled) => onChange({ spotlightHeaderAnimationEnabled })}
            />
          ) : null}
          {isSpotlight && experience.spotlightHeaderAnimationEnabled !== false ? (
            <>
              <ExperienceOptionGrid
                label="Marquee speed"
                options={PORTFOLIO_EXPERIENCE_SPOTLIGHT_MARQUEE_SPEED_OPTIONS}
                value={experience.spotlightMarqueeSpeed ?? 'medium'}
                onChange={(spotlightMarqueeSpeed) => onChange({ spotlightMarqueeSpeed })}
                columns={3}
              />
              <ExperienceOptionGrid
                label="Marquee direction"
                options={PORTFOLIO_EXPERIENCE_SPOTLIGHT_MARQUEE_DIRECTION_OPTIONS}
                value={experience.spotlightMarqueeDirection ?? 'left'}
                onChange={(spotlightMarqueeDirection) => onChange({ spotlightMarqueeDirection })}
                columns={2}
              />
              <ExperienceToggleRow
                label="Pause on hover"
                description="Pause the marquee animation when the user hovers over it."
                checked={experience.spotlightMarqueePauseOnHover !== false}
                onChange={(spotlightMarqueePauseOnHover) => onChange({ spotlightMarqueePauseOnHover })}
              />
              <ExperienceToggleRow
                label="Scroll speed boost"
                description="Speed up the marquee when the user scrolls the page."
                checked={experience.spotlightScrollSpeedBoost === true}
                onChange={(spotlightScrollSpeedBoost) => onChange({ spotlightScrollSpeedBoost })}
              />
            </>
          ) : null}
          {isSpotlight ? (
            <>
              <ExperienceOptionGrid
                label="Marquee weight"
                options={PORTFOLIO_EXPERIENCE_SPOTLIGHT_MARQUEE_WEIGHT_OPTIONS}
                value={experience.spotlightMarqueeWeight ?? 'normal'}
                onChange={(spotlightMarqueeWeight) => onChange({ spotlightMarqueeWeight })}
                columns={3}
              />
              <ExperienceOptionGrid
                label="Marquee style"
                options={PORTFOLIO_EXPERIENCE_SPOTLIGHT_MARQUEE_STYLE_OPTIONS}
                value={experience.spotlightMarqueeStyle ?? 'mixed'}
                onChange={(spotlightMarqueeStyle) => onChange({ spotlightMarqueeStyle })}
                columns={3}
              />
              <ExperienceToggleRow
                label="Gradient fade"
                description="Fade the edges of the marquee with a subtle gradient."
                checked={experience.spotlightMarqueeGradientFade !== false}
                onChange={(spotlightMarqueeGradientFade) => onChange({ spotlightMarqueeGradientFade })}
              />
              <ExperienceOptionGrid
                label="Word gap"
                options={PORTFOLIO_EXPERIENCE_SPOTLIGHT_MARQUEE_GAP_OPTIONS}
                value={experience.spotlightMarqueeGap ?? 'md'}
                onChange={(spotlightMarqueeGap) => onChange({ spotlightMarqueeGap })}
                columns={3}
              />
            </>
          ) : null}
          {isLoft ? (
            <ExperienceToggleRow
              label="Heading"
              description="The plain static heading above the list."
              checked={experience.loftHeadingEnabled !== false}
              onChange={(loftHeadingEnabled) => onChange({ loftHeadingEnabled })}
            />
          ) : null}
          {isLoft && experience.loftHeadingEnabled !== false ? (
            <div>
              <label className="pf-exp-block-label block">
                Heading text
              </label>
              <input
                type="text"
                value={experience.loftHeadingText ?? "Roles I've taken on"}
                onChange={(event) => onChange({ loftHeadingText: event.target.value })}
                placeholder="Roles I've taken on"
                className="mt-3 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm font-medium text-neutral-900 placeholder:text-neutral-400"
              />
            </div>
          ) : null}
          {isLoft && experience.loftHeadingEnabled !== false ? (
            <ExperienceOptionGrid
              label="Italic word"
              options={PORTFOLIO_EXPERIENCE_LOFT_HEADING_ITALIC_WORD_OPTIONS}
              value={experience.loftHeadingItalicWord ?? 'first'}
              onChange={(loftHeadingItalicWord) => onChange({ loftHeadingItalicWord })}
              columns={3}
            />
          ) : null}
          {isLoft && experience.loftHeadingEnabled !== false ? (
            <ExperienceOptionGrid
              label="Heading weight"
              options={PORTFOLIO_EXPERIENCE_LOFT_HEADING_FONT_WEIGHT_OPTIONS}
              value={experience.loftHeadingFontWeight ?? 'light-to-bold'}
              onChange={(loftHeadingFontWeight) => onChange({ loftHeadingFontWeight })}
              columns={2}
            />
          ) : null}
          {isLoft ? (
            <ExperienceToggleRow
              label="Header animations"
              description="Enable GSAP entry and scroll animations."
              checked={experience.loftHeaderAnimationEnabled !== false}
              onChange={(loftHeaderAnimationEnabled) => onChange({ loftHeaderAnimationEnabled })}
            />
          ) : null}
          {isLoft ? (
            <div>
              <label className="pf-exp-block-label block">
                Label text
              </label>
              <input
                type="text"
                value={experience.loftLabelText ?? 'Experience'}
                onChange={(event) => onChange({ loftLabelText: event.target.value })}
                placeholder="Experience"
                className="mt-3 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm font-medium text-neutral-900 placeholder:text-neutral-400"
              />
            </div>
          ) : null}
          {isLoft ? (
            <ExperienceOptionGrid
              label="Label style"
              options={PORTFOLIO_EXPERIENCE_LOFT_LABEL_STYLE_OPTIONS}
              value={experience.loftLabelStyle ?? 'uppercase'}
              onChange={(loftLabelStyle) => onChange({ loftLabelStyle })}
              columns={3}
            />
          ) : null}
          {isLoft ? (
            <ExperienceOptionGrid
              label="Label position"
              options={PORTFOLIO_EXPERIENCE_LOFT_LABEL_POSITION_OPTIONS}
              value={experience.loftLabelPosition ?? 'top-aligned'}
              onChange={(loftLabelPosition) => onChange({ loftLabelPosition })}
              columns={2}
            />
          ) : null}
          {isLoft ? (
            <ExperienceToggleRow
              label="Scroll effect"
              description="Animate label on scroll."
              checked={experience.loftScrollEffectEnabled !== false}
              onChange={(loftScrollEffectEnabled) => onChange({ loftScrollEffectEnabled })}
            />
          ) : null}
          {isLoft && experience.loftScrollEffectEnabled !== false ? (
            <ExperienceOptionGrid
              label="Scroll style"
              options={PORTFOLIO_EXPERIENCE_LOFT_SCROLL_EFFECT_STYLE_OPTIONS}
              value={experience.loftScrollEffectStyle ?? 'slide-right'}
              onChange={(loftScrollEffectStyle) => onChange({ loftScrollEffectStyle })}
              columns={2}
            />
          ) : null}
          {isLoft ? (
            <ExperienceOptionGrid
              label="Thumbnail"
              options={PORTFOLIO_EXPERIENCE_LOFT_THUMBNAIL_FIT_OPTIONS}
              value={experience.loftThumbnailFit ?? 'cover'}
              onChange={(loftThumbnailFit) => onChange({ loftThumbnailFit })}
              columns={2}
            />
          ) : null}
          {isLoft ? (
            <ExperienceOptionGrid
              label="Thumbnail corners"
              options={PORTFOLIO_EXPERIENCE_LOFT_THUMBNAIL_RADIUS_OPTIONS}
              value={experience.loftThumbnailRadius ?? 'md'}
              onChange={(loftThumbnailRadius) => onChange({ loftThumbnailRadius })}
              columns={3}
            />
          ) : null}
          {isLoft ? (
            <ExperienceOptionGrid
              label="Hover moment"
              options={PORTFOLIO_EXPERIENCE_LOFT_HOVER_EFFECT_OPTIONS}
              value={experience.loftHoverEffect ?? 'curtain'}
              onChange={(loftHoverEffect) => onChange({ loftHoverEffect })}
              columns={1}
            />
          ) : null}
          {isLoft ? (
            <ExperienceOptionGrid
              label="Columns per row"
              options={PORTFOLIO_EXPERIENCE_LOFT_COLUMNS_OPTIONS}
              value={experience.loftColumns ?? 3}
              onChange={(loftColumns) => onChange({ loftColumns })}
            />
          ) : null}
          {isLoft ? (
            <ExperienceOptionGrid
              label="Gap"
              options={PORTFOLIO_EXPERIENCE_ITEM_GAP_OPTIONS}
              value={experience.loftGap ?? 'md'}
              onChange={(loftGap) => onChange({ loftGap })}
              columns={4}
            />
          ) : null}
          {isPress ? (
            <ExperienceToggleRow
              label="Headline"
              description="The bold headline above the two-column layout."
              checked={experience.pressHeadingEnabled !== false}
              onChange={(pressHeadingEnabled) => onChange({ pressHeadingEnabled })}
            />
          ) : null}
          {isPress && experience.pressHeadingEnabled !== false ? (
            <div>
              <label className="pf-exp-block-label block">
                Headline text
              </label>
              <input
                type="text"
                value={experience.pressHeadingText ?? 'Roles taken. Skills sharpened. Impact delivered.'}
                onChange={(event) => onChange({ pressHeadingText: event.target.value })}
                placeholder="Roles taken. Skills sharpened. Impact delivered."
                className="mt-3 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm font-medium text-neutral-900 placeholder:text-neutral-400"
              />
            </div>
          ) : null}
          {isPress ? (
            <div>
              <label className="pf-exp-block-label block">
                Intro blurb
              </label>
              <p className="mt-1 text-sm text-neutral-500">
                Small text beside the list, above the entries. Leave empty to hide it.
              </p>
              <input
                type="text"
                value={experience.pressIntroText ?? ''}
                onChange={(event) => onChange({ pressIntroText: event.target.value })}
                placeholder="Selected roles, projects, and outcomes."
                className="mt-3 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm font-medium text-neutral-900 placeholder:text-neutral-400"
              />
            </div>
          ) : null}
          {isPress ? (
            <ExperienceOptionGrid
              label="Thumbnail corners"
              options={PORTFOLIO_EXPERIENCE_CARDS_BORDER_RADIUS_OPTIONS}
              value={experience.pressThumbnailRadius ?? 'md'}
              onChange={(pressThumbnailRadius) => onChange({ pressThumbnailRadius })}
              columns={3}
            />
          ) : null}

          {/* ═══════════════════════════════════════════════════════════════
              PRESS DESIGN — Premium Animation & Typography Settings
          ═══════════════════════════════════════════════════════════════ */}
          {isPress ? (
            <ExperienceToggleRow
              label="Entry animation"
              description="Animate the headline reveal on scroll."
              checked={experience.pressHeaderAnimationEnabled !== false}
              onChange={(pressHeaderAnimationEnabled) => onChange({ pressHeaderAnimationEnabled })}
            />
          ) : null}
          {isPress && experience.pressHeaderAnimationEnabled !== false ? (
            <ExperienceOptionGrid
              label="Animation style"
              options={PORTFOLIO_EXPERIENCE_PRESS_ANIMATION_STYLE_OPTIONS}
              value={experience.pressHeaderAnimationStyle ?? 'staggered'}
              onChange={(pressHeaderAnimationStyle) => onChange({ pressHeaderAnimationStyle })}
              columns={3}
            />
          ) : null}
          {isPress && experience.pressHeadingEnabled !== false ? (
            <ExperienceOptionGrid
              label="Heading weight"
              options={PORTFOLIO_EXPERIENCE_PRESS_HEADING_WEIGHT_STYLE_OPTIONS}
              value={experience.pressHeadingWeightStyle ?? 'alternating'}
              onChange={(pressHeadingWeightStyle) => onChange({ pressHeadingWeightStyle })}
              columns={2}
            />
          ) : null}
          {isPress && experience.pressHeadingEnabled !== false ? (
            <ExperienceOptionGrid
              label="Heading alignment"
              options={PORTFOLIO_EXPERIENCE_PRESS_HEADING_ALIGNMENT_OPTIONS}
              value={experience.pressHeadingAlignment ?? 'left'}
              onChange={(pressHeadingAlignment) => onChange({ pressHeadingAlignment })}
              columns={2}
            />
          ) : null}
          {isPress ? (
            <ExperienceOptionGrid
              label="Subtitle style"
              options={PORTFOLIO_EXPERIENCE_PRESS_SUBTITLE_STYLE_OPTIONS}
              value={experience.pressSubtitleStyle ?? 'micro'}
              onChange={(pressSubtitleStyle) => onChange({ pressSubtitleStyle })}
              columns={3}
            />
          ) : null}
          {isPress ? (
            <ExperienceToggleRow
              label="Scroll parallax"
              description="Lines move at different speeds as you scroll."
              checked={experience.pressScrollParallaxEnabled !== false}
              onChange={(pressScrollParallaxEnabled) => onChange({ pressScrollParallaxEnabled })}
            />
          ) : null}
          {isPress && experience.pressScrollParallaxEnabled !== false ? (
            <ExperienceOptionGrid
              label="Parallax intensity"
              options={PORTFOLIO_EXPERIENCE_PRESS_PARALLAX_INTENSITY_OPTIONS}
              value={experience.pressScrollParallaxIntensity ?? 'subtle'}
              onChange={(pressScrollParallaxIntensity) => onChange({ pressScrollParallaxIntensity })}
              columns={2}
            />
          ) : null}

          {isLegacy ? (
            <ExperienceToggleRow
              label="Hero title"
              description="The two-tone headline above the feature blocks."
              checked={experience.legacyHeadingEnabled !== false}
              onChange={(legacyHeadingEnabled) => onChange({ legacyHeadingEnabled })}
            />
          ) : null}
          {isLegacy && experience.legacyHeadingEnabled !== false ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="pf-exp-block-label block">
                    Title
                  </label>
                  <input
                    type="text"
                    value={experience.legacyHeadingText ?? 'A Career Built on'}
                    onChange={(event) => onChange({ legacyHeadingText: event.target.value })}
                    placeholder="A Career Built on"
                    className="mt-3 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm font-medium text-neutral-900 placeholder:text-neutral-400"
                  />
                </div>
                <div>
                  <label className="pf-exp-block-label block">
                    Title (accent)
                  </label>
                  <input
                    type="text"
                    value={experience.legacyHeadingAccentText ?? 'Craft'}
                    onChange={(event) => onChange({ legacyHeadingAccentText: event.target.value })}
                    placeholder="Craft"
                    className="mt-3 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm font-medium text-neutral-900 placeholder:text-neutral-400"
                  />
                </div>
              </div>
              <div>
                <label className="pf-exp-block-label block">
                  Intro sentence
                </label>
                <input
                  type="text"
                  value={experience.legacyIntroText ?? ''}
                  onChange={(event) => onChange({ legacyIntroText: event.target.value })}
                  placeholder="A selection of roles, teams, and problems solved along the way."
                  className="mt-3 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm font-medium text-neutral-900 placeholder:text-neutral-400"
                />
              </div>
            </>
          ) : null}
          {isLegacy ? (
            <ExperienceOptionGrid
              label="Image corners"
              options={PORTFOLIO_EXPERIENCE_CARDS_BORDER_RADIUS_OPTIONS}
              value={experience.legacyThumbnailRadius ?? 'xl'}
              onChange={(legacyThumbnailRadius) => onChange({ legacyThumbnailRadius })}
              columns={3}
            />
          ) : null}
          {isLegacy ? (
            <ExperienceOptionGrid
              label="Image height"
              options={PORTFOLIO_EXPERIENCE_LEGACY_THUMBNAIL_HEIGHT_OPTIONS}
              value={experience.legacyThumbnailHeight ?? 'lg'}
              onChange={(legacyThumbnailHeight) => onChange({ legacyThumbnailHeight })}
              columns={3}
            />
          ) : null}
          {isLegacy ? (
            <ExperienceOptionGrid
              label="Image width"
              options={PORTFOLIO_EXPERIENCE_LEGACY_THUMBNAIL_WIDTH_OPTIONS}
              value={experience.legacyThumbnailWidth ?? 'lg'}
              onChange={(legacyThumbnailWidth) => onChange({ legacyThumbnailWidth })}
              columns={3}
            />
          ) : null}
          {isLegacy ? (
            <ExperienceOptionGrid
              label="Spacing between entries"
              options={PORTFOLIO_EXPERIENCE_LEGACY_ITEM_GAP_OPTIONS}
              value={experience.legacyItemGap ?? 'md'}
              onChange={(legacyItemGap) => onChange({ legacyItemGap })}
              columns={4}
            />
          ) : null}
          {isLegacy ? (
            <ExperienceToggleRow
              label="Alternate image side"
              description="Switch the image left/right on every other entry. Off keeps it on the same side."
              checked={experience.legacyAlternateSides !== false}
              onChange={(legacyAlternateSides) => onChange({ legacyAlternateSides })}
            />
          ) : null}
          {isLegacy && experience.legacyAlternateSides === false ? (
            <ExperienceOptionGrid
              label="Image side"
              options={PORTFOLIO_EXPERIENCE_LEGACY_FIXED_SIDE_OPTIONS}
              value={experience.legacyFixedSide ?? 'left'}
              onChange={(legacyFixedSide) => onChange({ legacyFixedSide })}
              columns={2}
            />
          ) : null}
          {isLegacy ? (
            <ExperienceToggleRow
              label="Show tasks"
              description="Off by default for this design — the task list stays hidden unless turned on."
              checked={experience.legacyShowTasks === true}
              onChange={(legacyShowTasks) => onChange({ legacyShowTasks })}
            />
          ) : null}
          {/* ========== LEGACY HEADER PREMIUM OPTIONS ========== */}
          {isLegacy && experience.legacyHeadingEnabled !== false ? (
            <>
              <div className="mt-6 pt-4 border-t border-neutral-200">
                <p className="pf-exp-block-label block mb-3">Header Animation</p>
              </div>
              <ExperienceToggleRow
                label="Entry animation"
                description="GSAP-powered reveal animations when the header enters the viewport."
                checked={experience.legacyHeaderAnimationEnabled !== false}
                onChange={(legacyHeaderAnimationEnabled) => onChange({ legacyHeaderAnimationEnabled })}
              />
              {experience.legacyHeaderAnimationEnabled !== false ? (
                <ExperienceOptionGrid
                  label="Animation style"
                  options={PORTFOLIO_EXPERIENCE_LEGACY_ANIMATION_STYLE_OPTIONS}
                  value={experience.legacyHeaderAnimationStyle ?? 'bloom'}
                  onChange={(legacyHeaderAnimationStyle) => onChange({ legacyHeaderAnimationStyle })}
                  columns={3}
                />
              ) : null}
              <ExperienceToggleRow
                label="Scroll parallax"
                description="Asymmetric parallax effect on scroll — accent word stays longer."
                checked={experience.legacyScrollParallaxEnabled !== false}
                onChange={(legacyScrollParallaxEnabled) => onChange({ legacyScrollParallaxEnabled })}
              />
            </>
          ) : null}
          {isLegacy && experience.legacyHeadingEnabled !== false ? (
            <>
              <div className="mt-6 pt-4 border-t border-neutral-200">
                <p className="pf-exp-block-label block mb-3">Typography</p>
              </div>
              <ExperienceOptionGrid
                label="Prefix weight"
                options={PORTFOLIO_EXPERIENCE_LEGACY_PREFIX_WEIGHT_OPTIONS}
                value={experience.legacyPrefixWeight ?? 'light'}
                onChange={(legacyPrefixWeight) => onChange({ legacyPrefixWeight })}
                columns={3}
              />
              <ExperienceOptionGrid
                label="Accent style"
                options={PORTFOLIO_EXPERIENCE_LEGACY_ACCENT_STYLE_OPTIONS}
                value={experience.legacyAccentStyle ?? 'italic-bold'}
                onChange={(legacyAccentStyle) => onChange({ legacyAccentStyle })}
                columns={3}
              />
              <ExperienceOptionGrid
                label="Accent size"
                options={PORTFOLIO_EXPERIENCE_LEGACY_ACCENT_SIZE_OPTIONS}
                value={experience.legacyAccentSize ?? 'dramatic'}
                onChange={(legacyAccentSize) => onChange({ legacyAccentSize })}
                columns={3}
              />
              <ExperienceOptionGrid
                label="Subtitle style"
                options={PORTFOLIO_EXPERIENCE_LEGACY_SUBTITLE_STYLE_OPTIONS}
                value={experience.legacySubtitleStyle ?? 'micro'}
                onChange={(legacySubtitleStyle) => onChange({ legacySubtitleStyle })}
                columns={3}
              />
            </>
          ) : null}
          {isLegacy && experience.legacyHeadingEnabled !== false ? (
            <>
              <div className="mt-6 pt-4 border-t border-neutral-200">
                <p className="pf-exp-block-label block mb-3">Decorative Elements</p>
              </div>
              <ExperienceToggleRow
                label="Accent underline"
                description="Show a decorative line under the accent word."
                checked={experience.legacyAccentUnderline !== false}
                onChange={(legacyAccentUnderline) => onChange({ legacyAccentUnderline })}
              />
              {experience.legacyAccentUnderline !== false ? (
                <ExperienceOptionGrid
                  label="Underline style"
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
                label="Stack label"
                value={experience.toolsLabel}
                placeholder="Stack"
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
                label="Responsibilities label"
                value={experience.tasksLabel}
                placeholder="Responsibilities"
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
          </ExperienceLayoutSettingsBand>
        </div>
      )}
    </div>
    </PortfolioLinkArrowProvider>
  );
}
