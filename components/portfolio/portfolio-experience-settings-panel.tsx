'use client';

import { useState } from 'react';
import {
  EXPERIENCE_CARDS_GRID_GAP_PRESET_PX,
  EXPERIENCE_CARDS_GRID_GAP_PX_MAX,
  EXPERIENCE_CARDS_GRID_GAP_PX_MIN,
  PORTFOLIO_EXPERIENCE_CARDS_BORDER_RADIUS_OPTIONS,
  PORTFOLIO_EXPERIENCE_CARDS_GRID_GAP_OPTIONS,
  PORTFOLIO_EXPERIENCE_DESIGN_OPTIONS,
  PORTFOLIO_EXPERIENCE_DUOTONE_FRAME_COLOR_OPTIONS,
  PORTFOLIO_EXPERIENCE_DUOTONE_FRAME_RADIUS_OPTIONS,
  PORTFOLIO_EXPERIENCE_DUOTONE_THUMBNAIL_EFFECT_OPTIONS,
  PORTFOLIO_EXPERIENCE_DUOTONE_THUMBNAIL_HEIGHT_OPTIONS,
  PORTFOLIO_EXPERIENCE_DUOTONE_SCROLL_MODE_OPTIONS,
  PORTFOLIO_EXPERIENCE_DUOTONE_SLIDE_NAV_STYLE_OPTIONS,
  PORTFOLIO_EXPERIENCE_ENTRY_EXPAND_MODE_OPTIONS,
  PORTFOLIO_EXPERIENCE_GALLERY_COLUMNS_OPTIONS,
  PORTFOLIO_EXPERIENCE_GALLERY_THUMBNAIL_FIT_OPTIONS,
  PORTFOLIO_EXPERIENCE_GALLERY_BIG_TITLE_STYLE_OPTIONS,
  PORTFOLIO_EXPERIENCE_GALLERY_BIG_TITLE_COLOR_OPTIONS,
  PORTFOLIO_EXPERIENCE_SPOTLIGHT_TITLE_COLOR_OPTIONS,
  PORTFOLIO_EXPERIENCE_SPOTLIGHT_THUMBNAIL_FIT_OPTIONS,
  PORTFOLIO_EXPERIENCE_LOFT_THUMBNAIL_FIT_OPTIONS,
  PORTFOLIO_EXPERIENCE_LOFT_THUMBNAIL_RADIUS_OPTIONS,
  PORTFOLIO_EXPERIENCE_LOFT_COLUMNS_OPTIONS,
  PORTFOLIO_EXPERIENCE_ITEM_GAP_OPTIONS,
  PORTFOLIO_EXPERIENCE_LEGACY_FIXED_SIDE_OPTIONS,
  PORTFOLIO_EXPERIENCE_LEGACY_ITEM_GAP_OPTIONS,
  PORTFOLIO_EXPERIENCE_LEGACY_THUMBNAIL_HEIGHT_OPTIONS,
  PORTFOLIO_EXPERIENCE_LEGACY_THUMBNAIL_WIDTH_OPTIONS,
  PORTFOLIO_EXPERIENCE_PERIOD_DESIGN_OPTIONS,
  PORTFOLIO_EXPERIENCE_REPO_LINK_STYLE_OPTIONS,
  PORTFOLIO_EXPERIENCE_REEL_STATUS_STYLE_OPTIONS,
  PORTFOLIO_EXPERIENCE_TASKS_DISPLAY_OPTIONS,
  clampExperienceCardsGridGapPx,
  resolveExperienceCardsGridGapPx,
  type PortfolioExperienceSectionSettings,
} from '@/components/portfolio/portfolio-experience-settings';

export type ExperienceSubSection = 'general' | 'design';

const EXPERIENCE_SUB_SECTIONS: { id: ExperienceSubSection; label: string; description: string }[] = [
  {
    id: 'general',
    label: 'General',
    description: 'Section visibility and how responsibilities are shown.',
  },
  {
    id: 'design',
    label: 'Design',
    description: 'Choose the Experience layout design.',
  },
];

/** Maps any legacy subsection id (media, palette, etc.) to a known Experience subsection. */
export function normalizeExperienceSubSection(value: string | undefined): ExperienceSubSection {
  if (value === 'general' || value === 'design') return value;
  return 'design';
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
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-2xl border border-neutral-200/80 bg-white px-4 py-3.5">
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-neutral-950">{label}</span>
        {description ? <span className="mt-1 block text-sm text-neutral-500">{description}</span> : null}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 h-4 w-4 shrink-0 rounded border-neutral-300 text-neutral-900"
      />
    </label>
  );
}

function ExperienceOptionGrid<T extends string>({
  label,
  options,
  value,
  onChange,
  columns = 2,
}: {
  label: string;
  options: { value: T; label: string; description: string }[];
  value: T | '';
  onChange: (value: T) => void;
  columns?: number;
}) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">{label}</p>
      <div
        className={`mt-3 grid gap-2 ${
          columns === 4
            ? 'grid-cols-2 sm:grid-cols-4'
            : columns === 3
              ? 'sm:grid-cols-2 lg:grid-cols-3'
              : columns === 1
                ? 'grid-cols-1'
                : 'sm:grid-cols-2'
        }`}
      >
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
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
  const activeMeta =
    EXPERIENCE_SUB_SECTIONS.find((section) => section.id === subSection) ?? EXPERIENCE_SUB_SECTIONS[0];
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
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Experience subsection</p>
          <p className="mt-1 text-sm text-neutral-500">{activeMeta.description}</p>
        </div>
        <select
          value={subSection}
          onChange={(event) => setSubSection(event.target.value as ExperienceSubSection)}
          className="w-full min-w-0 rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-neutral-900 sm:min-w-[12rem] sm:max-w-xs sm:flex-1"
        >
          {EXPERIENCE_SUB_SECTIONS.map((section) => (
            <option key={section.id} value={section.id}>
              {section.label}
            </option>
          ))}
        </select>
      </div>

      {subSection === 'general' ? (
        <div className="space-y-6">
          <ExperienceToggleRow
            label="Show section"
            description="Display the experience block on your public portfolio."
            checked={experience.enabled}
            onChange={(enabled) => onChange({ enabled })}
          />
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
              Content visibility
            </p>
            <p className="mt-1 text-sm text-neutral-500">
              Show or hide each element — applies to every design.
            </p>
            <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
              <ExperienceToggleRow
                label="Title"
                checked={experience.showTitle !== false}
                onChange={(showTitle) => onChange({ showTitle })}
              />
              <ExperienceToggleRow
                label="Period"
                checked={experience.showPeriod !== false}
                onChange={(showPeriod) => onChange({ showPeriod })}
              />
              <ExperienceToggleRow
                label="Organization"
                checked={experience.showOrganization !== false}
                onChange={(showOrganization) => onChange({ showOrganization })}
              />
              <ExperienceToggleRow
                label="Status & meta"
                checked={experience.showMeta !== false}
                onChange={(showMeta) => onChange({ showMeta })}
              />
              <ExperienceToggleRow
                label="Description"
                checked={experience.showDescription !== false}
                onChange={(showDescription) => onChange({ showDescription })}
              />
              <ExperienceToggleRow
                label="Tasks"
                checked={experience.showTasks !== false}
                onChange={(showTasks) => onChange({ showTasks })}
              />
              <ExperienceToggleRow
                label="Tools"
                checked={experience.showTools !== false}
                onChange={(showTools) => onChange({ showTools })}
              />
              <ExperienceToggleRow
                label="Proof / links"
                checked={experience.showProof !== false}
                onChange={(showProof) => onChange({ showProof })}
              />
              <ExperienceToggleRow
                label="Media / image"
                checked={experience.showEntryMedia !== false}
                onChange={(showEntryMedia) => onChange({ showEntryMedia })}
              />
            </div>
          </div>
          <ExperienceOptionGrid
            label="Tasks display"
            options={PORTFOLIO_EXPERIENCE_TASKS_DISPLAY_OPTIONS}
            value={experience.tasksDisplay ?? 'arrows'}
            onChange={(tasksDisplay) => onChange({ tasksDisplay })}
            columns={2}
          />
          <ExperienceOptionGrid
            label="Repository link button (Reel / Duotone / Gallery)"
            options={PORTFOLIO_EXPERIENCE_REPO_LINK_STYLE_OPTIONS}
            value={experience.repoLinkButtonStyle ?? 'icon'}
            onChange={(repoLinkButtonStyle) => onChange({ repoLinkButtonStyle })}
            columns={2}
          />
        </div>
      ) : (
        <div className="space-y-6">
          <ExperienceOptionGrid
            label="Item design"
            options={PORTFOLIO_EXPERIENCE_DESIGN_OPTIONS}
            value={experience.experienceDesign}
            onChange={(experienceDesign) => onChange({ experienceDesign })}
            columns={2}
          />
          {isTable ? (
            <ExperienceToggleRow
              label="Striped rows"
              description="Alternate subtle row backgrounds for easier scanning."
              checked={experience.tableStripedRows === true}
              onChange={(tableStripedRows) => onChange({ tableStripedRows })}
            />
          ) : null}
          {isReel ? (
            <ExperienceOptionGrid
              label="Status presentation"
              options={PORTFOLIO_EXPERIENCE_REEL_STATUS_STYLE_OPTIONS}
              value={experience.reelStatusStyle ?? 'badge'}
              onChange={(reelStatusStyle) => onChange({ reelStatusStyle })}
              columns={2}
            />
          ) : null}
          {isCards ? (
            <>
              <ExperienceOptionGrid
                label="Card gap"
                options={PORTFOLIO_EXPERIENCE_CARDS_GRID_GAP_OPTIONS}
                value={
                  (experience.cardsGridGap ?? 'md') === 'custom'
                    ? ''
                    : ((experience.cardsGridGap ?? 'md') as keyof typeof EXPERIENCE_CARDS_GRID_GAP_PRESET_PX)
                }
                onChange={(cardsGridGap) =>
                  onChange({
                    cardsGridGap,
                    cardsGridGapPx: EXPERIENCE_CARDS_GRID_GAP_PRESET_PX[cardsGridGap],
                  })
                }
                columns={4}
              />
              {experience.cardsGridGap === 'custom' ? (
                <p className="text-xs font-medium text-amber-700">
                  Manual mode — pick a preset above to leave custom spacing.
                </p>
              ) : null}
              <div>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                    Manual gap (px)
                  </p>
                  <span className="tabular-nums text-sm font-semibold text-neutral-700">
                    {resolveExperienceCardsGridGapPx(experience)}px
                  </span>
                </div>
                <p className="mt-1 text-sm text-neutral-500">
                  One value for both the horizontal gutter between columns and the vertical gutter
                  between rows.
                </p>
                <input
                  type="range"
                  min={EXPERIENCE_CARDS_GRID_GAP_PX_MIN}
                  max={EXPERIENCE_CARDS_GRID_GAP_PX_MAX}
                  step={1}
                  value={resolveExperienceCardsGridGapPx(experience)}
                  onChange={(event) => {
                    const px = clampExperienceCardsGridGapPx(Number(event.target.value), 36);
                    onChange({ cardsGridGap: 'custom', cardsGridGapPx: px });
                  }}
                  className="mt-3 h-2 w-full cursor-pointer accent-neutral-900"
                  aria-label="Card grid gap in pixels, horizontal and vertical"
                />
                <div className="mt-1 flex justify-between text-[11px] text-neutral-400">
                  <span>{EXPERIENCE_CARDS_GRID_GAP_PX_MIN}px</span>
                  <span>{EXPERIENCE_CARDS_GRID_GAP_PX_MAX}px</span>
                </div>
              </div>
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
            </>
          ) : null}
          {isDuotone && (experience.duotoneScrollMode ?? 'sticky') === 'sticky' ? (
            <ExperienceToggleRow
              label="Swap columns"
              description="Title & thumbnail on the right, info card on the left."
              checked={experience.duotoneStickySwapSides === true}
              onChange={(duotoneStickySwapSides) => onChange({ duotoneStickySwapSides })}
            />
          ) : null}
          {isGallery ? (
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                Columns per row
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {PORTFOLIO_EXPERIENCE_GALLERY_COLUMNS_OPTIONS.map((option) => {
                  const active = (experience.galleryColumns ?? 3) === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => onChange({ galleryColumns: option.value })}
                      className={`rounded-2xl border px-4 py-3 text-left transition ${
                        active
                          ? 'border-neutral-900 bg-neutral-50 ring-2 ring-neutral-900/10'
                          : 'border-neutral-200/80 bg-white hover:border-neutral-300 hover:bg-neutral-50/80'
                      }`}
                    >
                      <p className="text-sm font-semibold text-neutral-900">{option.label}</p>
                      <p className="mt-0.5 text-xs text-neutral-500">{option.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>
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
                <label className="block text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
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
                <label className="block text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
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
              <label className="block text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
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
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Columns per row</p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {PORTFOLIO_EXPERIENCE_LOFT_COLUMNS_OPTIONS.map((option) => {
                  const active = (experience.loftColumns ?? 3) === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => onChange({ loftColumns: option.value })}
                      className={`rounded-2xl border px-4 py-3 text-left transition ${
                        active
                          ? 'border-neutral-900 bg-neutral-50 ring-2 ring-neutral-900/10'
                          : 'border-neutral-200/80 bg-white hover:border-neutral-300 hover:bg-neutral-50/80'
                      }`}
                    >
                      <p className="text-sm font-semibold text-neutral-900">{option.label}</p>
                      <p className="mt-0.5 text-xs text-neutral-500">{option.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>
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
              <label className="block text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
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
              <label className="block text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
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
                  <label className="block text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
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
                  <label className="block text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
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
                <label className="block text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
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
          {showStackLabel ? (
            <div>
              <label className="block text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                Stack label
              </label>
              <p className="mt-1 text-sm text-neutral-500">
                Custom heading above the tool tags. Leave empty to use “Stack”.
              </p>
              <input
                type="text"
                value={experience.toolsLabel}
                onChange={(event) => onChange({ toolsLabel: event.target.value })}
                placeholder="Stack"
                className="mt-3 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm font-medium text-neutral-900 placeholder:text-neutral-400"
              />
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
