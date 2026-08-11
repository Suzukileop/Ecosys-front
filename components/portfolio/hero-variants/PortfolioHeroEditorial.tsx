'use client';

import { useRef, type ReactNode } from 'react';
import type { PortfolioHeroData } from '@/components/portfolio/portfolio-hero-types';
import {
  HeroPortrait,
  HeroProfileMeta,
} from '@/components/portfolio/portfolio-hero-shared';
import {
  HeroEditorialCopyBlock,
  heroCopyBandHasContent,
  heroDivisionCopyHasContent,
  heroDivisionPortraitHasContent,
  heroDivisionStatsHasContent,
  heroDivisionVisualHasContent,
  isHeroCopyFreeMode,
} from '@/components/portfolio/portfolio-hero-editorial-copy';
import { resolveHeroVisualFreeCell } from '@/components/portfolio/portfolio-hero-settings';
import {
  motionProfileHeroEnterClass,
  motionProfileHeroImageEnterClass,
} from '@/components/portfolio/portfolio-motion-settings';
import {
  heroCopyPortraitSafeClass,
  resolvePortraitVerticalCell,
} from '@/components/portfolio/portfolio-hero-profile-settings';
import { resolveMetaVerticalCell } from '@/components/portfolio/portfolio-hero-meta-settings';
import { useHeroCopyPortraitSafeMaxWidth } from '@/components/portfolio/use-hero-copy-portrait-safe-max-width';
import {
  heroColumns3GridTemplateColumns,
  isColumns3HeroDivision,
  isHeroCopyOnEnd,
  isInFlowHeroDivision,
  isVerticalHeroDivision,
  resolveHeroColumns3MiddleWeight,
  resolveHeroColumns3Order,
  resolveHeroColumns3SlotVertical,
  resolveHeroLayoutDivision,
  resolveHeroVerticalFrameGapPx,
  type HeroColumns3Slot,
} from '@/components/portfolio/portfolio-hero-layout-division';
import {
  heroUltraWideColClass,
  heroUltraWideGridClass,
  resolveHeroUltraWideColumnLayout,
} from '@/components/portfolio/portfolio-hero-ultrawide-columns';
import {
  heroVerticalCellAlignClass,
  heroVerticalCellColumn,
  heroVerticalCellGridIndices,
  heroVerticalCellHalf,
} from '@/components/portfolio/portfolio-hero-vertical-cell-placement';
import { heroCopyPositionStyle } from '@/components/portfolio/portfolio-hero-copy-settings';

/**
 * Below xl: stacked flow — the desktop LEFT group stacks on top (copy first in
 * Copy | Visual, portrait & stats first in Visual | Copy).
 * Element alignment follows the mobile align settings (centered by default).
 * xl+ vertical: copy shrink-wraps to content, tunable px gap, then visual starts.
 * xl+ columns-3: Copy | Portrait | Stats side by side.
 * xl+ horizontal: copy in-flow; portrait/stats use section absolute layers.
 */
export function PortfolioHeroEditorial({ data }: { data: PortfolioHeroData }) {
  const { presentation } = data;
  const division = resolveHeroLayoutDivision(presentation);
  const vertical = isVerticalHeroDivision(division);
  const columns3 = isColumns3HeroDivision(division);
  const inFlow = isInFlowHeroDivision(division);
  const flipped = isHeroCopyOnEnd(division) && !inFlow;
  const copyOnBottom = division === 'vertical-copy-bottom';
  const frameGapPx = resolveHeroVerticalFrameGapPx(presentation);
  const frameGapStyle = { gap: `${frameGapPx}px` } as const;
  const copyFree = isHeroCopyFreeMode(presentation.heroCopyPlacementMode);
  const profile = data.motionProfile ?? 'none';
  const enterClass = motionProfileHeroEnterClass(profile);
  const imageEnterClass = motionProfileHeroImageEnterClass(profile);
  const showPortrait = presentation.showPortrait;
  const hideEmptyParts = presentation.heroHideEmptyDivisionParts === true;
  const copyHasContent = !hideEmptyParts || heroDivisionCopyHasContent(data);
  const visualHasContent = !hideEmptyParts || heroDivisionVisualHasContent(data);
  const portraitHasContent = !hideEmptyParts || heroDivisionPortraitHasContent(data);
  const statsHasContent = !hideEmptyParts || heroDivisionStatsHasContent(data);
  const ultraWide = resolveHeroUltraWideColumnLayout(presentation);
  const ultraWideActive = vertical && ultraWide.columns > 1;
  const copySafeClass = inFlow
    ? 'w-full'
    : heroCopyPortraitSafeClass(presentation.portraitSize, {
        showPortrait,
        flipped,
      });
  const copyRef = useRef<HTMLDivElement>(null);
  const safeMaxWidth = useHeroCopyPortraitSafeMaxWidth(
    copyRef,
    showPortrait && !copyFree && !inFlow,
    flipped
  );

  const metaCell = resolveMetaVerticalCell(presentation);
  const portraitCell = resolvePortraitVerticalCell(presentation);
  /** Free zone: copy elements moved into the visual frame, anchored by a 3×3 cell. */
  const freeCell = resolveHeroVisualFreeCell(presentation);
  const freeGrid = heroVerticalCellGridIndices(freeCell);
  const freeAlignClass = heroVerticalCellAlignClass(freeCell);
  const freeZoneHasContent = vertical && heroCopyBandHasContent(presentation, 'free-zone');
  const metaGrid = heroVerticalCellGridIndices(metaCell);
  const portraitGrid = heroVerticalCellGridIndices(portraitCell);
  const metaAlignClass = heroVerticalCellAlignClass(metaCell);
  const portraitAlignClass = heroVerticalCellAlignClass(portraitCell);
  const portraitHalf = heroVerticalCellHalf(portraitCell, metaCell);
  const statsHalf = heroVerticalCellHalf(metaCell, portraitCell);

  const visualCol = (slot: 'portrait' | 'stats') =>
    ultraWideActive
      ? heroUltraWideColClass(ultraWide.visualSlots[slot], ultraWide.columns)
      : '';

  /**
   * Copy units glued above/below stats — full width of the stats cell so each
   * element's own left/center/right alignment works. The stats chips row keeps
   * following the 3×3 cell column.
   */
  const statsColumn = heroVerticalCellColumn(metaCell);
  /** Tablet/mobile auto-centers the chips row; the cell column applies from xl. */
  const statsRowJustifyClass =
    statsColumn === 'left'
      ? 'justify-center xl:justify-start'
      : statsColumn === 'right'
        ? 'justify-center xl:justify-end'
        : 'justify-center';
  const statsWithOptionalCta = (
    <div className="flex w-full max-w-full flex-col gap-2 sm:gap-3" data-hero-stats-stack>
      {inFlow ? (
        <HeroEditorialCopyBlock data={data} band="above-stats" tightStack className="!px-0" />
      ) : null}
      <div className={`flex w-full max-w-full ${statsRowJustifyClass}`}>
        <HeroProfileMeta
          editorial
          meta={presentation}
          yearsOfExperience={data.yearsOfExperience}
          workCount={data.workCount}
          locationLabel={data.locationLabel}
        />
      </div>
      {inFlow ? (
        <HeroEditorialCopyBlock data={data} band="below-stats" tightStack className="!px-0" />
      ) : null}
    </div>
  );

  const copyInner = (
    <div
      className={`flex w-full min-w-0 flex-col justify-start gap-3 px-4 pb-1 pt-4 sm:gap-4 sm:px-6 sm:pt-5 ${
        flipped
          ? 'items-stretch xl:items-end xl:text-right'
          : inFlow
            ? 'items-stretch'
            : 'items-stretch xl:items-start xl:text-left'
      }`}
      data-hero-copy-frame-inner
    >
      {copyFree && vertical ? (
        <div className="relative min-h-[12rem] w-full">
          <div
            className="pointer-events-auto absolute"
            style={heroCopyPositionStyle(presentation.heroCopyPosition)}
            data-hero-copy-in-frame
          >
            <HeroEditorialCopyBlock data={data} tightStack band="in-copy" />
          </div>
        </div>
      ) : (
        <HeroEditorialCopyBlock data={data} tightStack={inFlow} band="in-copy" />
      )}
    </div>
  );

  /** Mobile / horizontal stacked copy (non-grid). */
  const copyBlockFlow = (
    <div
      ref={copyRef}
      className={`relative z-10 w-full min-w-0 ${copySafeClass} ${
        copyFree && !vertical ? 'xl:hidden' : ''
      } ${flipped ? 'xl:ml-auto' : ''} ${
        vertical ? 'xl:hidden' : flipped ? 'order-2 xl:order-none' : 'order-1 xl:order-none'
      }`.trim()}
      style={
        safeMaxWidth != null
          ? { maxWidth: safeMaxWidth, width: '100%' }
          : undefined
      }
    >
      <div
        className={`flex w-full min-w-0 flex-col justify-center gap-10 py-10 sm:gap-12 xl:gap-14 ${
          vertical ? 'min-h-0' : 'min-h-[400px]'
        } ${
          flipped
            ? 'items-stretch xl:items-end xl:text-right'
            : 'items-stretch xl:items-start xl:text-left'
        }`}
      >
        <HeroEditorialCopyBlock data={data} />
      </div>
    </div>
  );

  /**
   * Visual frame — vertical: equitable 50/50 left|right halves (portrait | stats).
   * Ultra-wide keeps its column slots; non-vertical keeps the 3×3 cell grid.
   */
  const portraitNode = showPortrait ? (
    <HeroPortrait
      fullName={data.fullName}
      avatarUrl={data.avatarUrl}
      specialite={data.specialite}
      className="aspect-[4/5] w-full object-cover"
      profile={presentation}
      isAvailable={data.isAvailable}
      responseTimeLabel={data.responseTimeLabel}
    />
  ) : null;

  /**
   * Free-zone layers:
   * - below xl the moved elements flow after the visual content (centered);
   * - from xl they sit in a 3×3 overlay spanning the whole visual frame, so
   *   they can occupy any empty cell (e.g. top-right next to the stats).
   */
  const freeZoneLayers = freeZoneHasContent ? (
    <>
      <div className="flex w-full justify-center xl:hidden" data-hero-free-zone="mobile">
        <div className="w-full max-w-md">
          <HeroEditorialCopyBlock data={data} band="free-zone" tightStack className="!px-0" />
        </div>
      </div>
      <div
        className="pointer-events-none absolute inset-0 z-40 hidden p-2 sm:p-3 xl:grid"
        style={{
          gridTemplateColumns: '1fr 1fr 1fr',
          gridTemplateRows: '1fr 1fr 1fr',
        }}
        data-hero-free-zone-grid
      >
        <div
          className={`pointer-events-auto flex min-w-0 p-2 ${freeAlignClass}`.trim()}
          style={{ gridColumn: freeGrid.column, gridRow: freeGrid.row }}
          data-hero-free-zone-cell={freeCell}
        >
          <div className="w-full">
            <HeroEditorialCopyBlock data={data} band="free-zone" tightStack className="!px-0" />
          </div>
        </div>
      </div>
    </>
  ) : null;

  const visualContents = (
    <div
      className={`relative w-full px-0 py-1 sm:p-3 ${
        ultraWideActive
          ? `grid grid-cols-1 items-stretch gap-3 ${heroUltraWideGridClass(ultraWide.columns)}`
          : ''
      }`.trim()}
      data-hero-visual-frame-inner
    >
      {ultraWideActive ? (
        <>
          {showPortrait ? (
            <div
              className={`relative flex min-h-[min(40vh,24rem)] w-full min-w-0 ${visualCol('portrait')}`.trim()}
              data-hero-portrait-cell={portraitCell}
            >
              <div
                className={`pointer-events-auto flex min-h-[min(40vh,24rem)] w-full flex-1 p-0 sm:p-2 ${portraitAlignClass}`.trim()}
              >
                {portraitNode}
              </div>
            </div>
          ) : null}
          <div
            className={`relative flex min-h-0 w-full min-w-0 xl:min-h-[min(40vh,24rem)] ${visualCol('stats')}`.trim()}
            data-hero-stats-cell={metaCell}
          >
            <div
              className={`pointer-events-auto flex w-full flex-1 items-center p-0 py-1 sm:p-2 xl:min-h-[min(40vh,24rem)] ${metaAlignClass}`.trim()}
            >
              {statsWithOptionalCta}
            </div>
          </div>
        </>
      ) : vertical ? (
        showPortrait ? (
          <div
            className="grid h-full min-h-0 w-full grid-cols-1 items-stretch gap-3 sm:gap-4 xl:min-h-[min(48vh,28rem)] xl:grid-cols-2"
            data-hero-visual-half-grid
          >
            <div
              className="pointer-events-auto z-20 flex min-h-0 min-w-0 flex-col p-0 sm:p-2"
              data-hero-visual-half="left"
            >
              {portraitHalf === 1 ? (
                <div
                  className={`flex min-h-0 w-full flex-1 xl:min-h-[min(48vh,28rem)] ${portraitAlignClass}`.trim()}
                  data-hero-portrait-cell={portraitCell}
                >
                  {portraitNode}
                </div>
              ) : null}
              {statsHalf === 1 ? (
                <div
                  className={`flex w-full flex-1 items-center py-1 xl:min-h-[min(48vh,28rem)] ${metaAlignClass}`.trim()}
                  data-hero-stats-cell={metaCell}
                >
                  {statsWithOptionalCta}
                </div>
              ) : null}
            </div>
            <div
              className="pointer-events-auto z-30 flex min-h-0 min-w-0 flex-col p-0 sm:p-2"
              data-hero-visual-half="right"
            >
              {portraitHalf === 2 ? (
                <div
                  className={`flex min-h-0 w-full flex-1 xl:min-h-[min(48vh,28rem)] ${portraitAlignClass}`.trim()}
                  data-hero-portrait-cell={portraitCell}
                >
                  {portraitNode}
                </div>
              ) : null}
              {statsHalf === 2 ? (
                <div
                  className={`flex w-full flex-1 items-center py-1 xl:min-h-[min(48vh,28rem)] ${metaAlignClass}`.trim()}
                  data-hero-stats-cell={metaCell}
                >
                  {statsWithOptionalCta}
                </div>
              ) : null}
            </div>
          </div>
        ) : (
          <div
            className={`pointer-events-auto flex w-full items-center p-0 py-1 sm:p-2 xl:min-h-[min(48vh,28rem)] ${metaAlignClass}`.trim()}
            data-hero-stats-cell={metaCell}
          >
            {statsWithOptionalCta}
          </div>
        )
      ) : (
        <div
          className="grid h-full min-h-0 w-full xl:min-h-[min(48vh,28rem)]"
          style={{
            gridTemplateColumns: '1fr 1fr 1fr',
            gridTemplateRows: '1fr 1fr 1fr',
          }}
          data-hero-visual-cell-grid
        >
          {showPortrait ? (
            <div
              className={`pointer-events-auto z-20 flex p-0 sm:p-2 ${portraitAlignClass}`.trim()}
              style={{ gridColumn: portraitGrid.column, gridRow: portraitGrid.row }}
              data-hero-portrait-cell={portraitCell}
            >
              {portraitNode}
            </div>
          ) : null}
          <div
            className={`pointer-events-auto z-30 flex items-center p-0 py-1 sm:p-2 ${metaAlignClass}`.trim()}
            style={{ gridColumn: metaGrid.column, gridRow: metaGrid.row }}
            data-hero-stats-cell={metaCell}
          >
            {statsWithOptionalCta}
          </div>
        </div>
      )}
      {freeZoneLayers}
    </div>
  );

  /** Mobile visual stack (below xl) — content-sized. */
  const visualBlockMobile = (
    <div
      className={`${imageEnterClass} relative w-full xl:hidden ${
        copyOnBottom ? 'order-1' : 'order-2'
      }`.trim()}
      data-hero-visual-frame="mobile"
    >
      {visualContents}
    </div>
  );

  /** Horizontal-only mobile visual — the desktop LEFT side stacks first (visual first when flipped). */
  const visualBlockHorizontalMobile = !vertical ? (
    <div
      className={`${imageEnterClass} ${flipped ? 'order-1' : 'order-2'} flex w-full flex-col xl:hidden`.trim()}
    >
      {showPortrait ? (
        <div className="flex w-full justify-center pt-0">
          <HeroPortrait
            fullName={data.fullName}
            avatarUrl={data.avatarUrl}
            specialite={data.specialite}
            className="aspect-[4/5] w-full object-cover"
            profile={presentation}
            isAvailable={data.isAvailable}
            responseTimeLabel={data.responseTimeLabel}
          />
        </div>
      ) : null}
      <div
        className={`relative z-30 mt-auto flex w-full justify-center ${
          showPortrait ? 'pt-4 sm:pt-6' : 'pt-0'
        } pb-0`}
      >
        <HeroProfileMeta
          editorial
          meta={presentation}
          yearsOfExperience={data.yearsOfExperience}
          workCount={data.workCount}
          locationLabel={data.locationLabel}
        />
      </div>
    </div>
  ) : null;

  if (columns3) {
    const columns3Order = resolveHeroColumns3Order(presentation);
    const middleWeight = resolveHeroColumns3MiddleWeight(presentation);
    const slotVertical = resolveHeroColumns3SlotVertical(presentation);
    const gridTemplateColumns = heroColumns3GridTemplateColumns(columns3Order, middleWeight);
    const portraitExtras = heroCopyBandHasContent(presentation, 'free-zone');

    /**
     * Desktop (xl+): top / center / bottom stay INSIDE the 100dvh column.
     * Absolute bands + max-h-full keep content inside the viewport edge.
     * Mobile: must NOT use this — parent has no fixed height, so h-full collapses to 0.
     */
    const renderViewportZones = (
      top: ReactNode,
      center: ReactNode,
      bottom: ReactNode
    ) => (
      <div className="relative h-full min-h-0 w-full overflow-hidden">
        <div className="absolute inset-x-0 top-0 z-[1] flex max-h-full flex-col justify-start gap-3 overflow-hidden">
          {top}
        </div>
        <div className="absolute inset-x-0 top-1/2 z-[1] flex max-h-full -translate-y-1/2 flex-col justify-center gap-3 overflow-hidden">
          {center}
        </div>
        <div className="absolute inset-x-0 bottom-0 z-[1] flex max-h-full flex-col justify-end gap-3 overflow-hidden">
          {bottom}
        </div>
      </div>
    );

    const renderPortraitStack = (opts?: { mobile?: boolean }) => (
      <div
        className={
          opts?.mobile
            ? 'flex w-full flex-col gap-3'
            : 'flex max-h-full min-h-0 w-full flex-col gap-3 overflow-hidden'
        }
      >
        {portraitExtras ? (
          <HeroEditorialCopyBlock data={data} band="free-zone" tightStack className="!px-0" />
        ) : null}
        {showPortrait ? (
          <div
            className={
              opts?.mobile
                ? 'flex w-full justify-center'
                : 'flex max-h-full min-h-0 w-full justify-center overflow-hidden'
            }
          >
            <HeroPortrait
              fullName={data.fullName}
              avatarUrl={data.avatarUrl}
              specialite={data.specialite}
              className={
                opts?.mobile
                  ? 'aspect-[4/5] w-full object-cover'
                  : 'aspect-[4/5] max-h-full w-full object-cover'
              }
              wrapperClass={
                opts?.mobile
                  ? 'w-full max-w-full'
                  : 'max-h-full w-full max-w-full min-h-0'
              }
              profile={presentation}
              isAvailable={data.isAvailable}
              responseTimeLabel={data.responseTimeLabel}
            />
          </div>
        ) : null}
      </div>
    );

    const renderStatsStack = (opts?: { mobile?: boolean }) => (
      <div
        className={
          opts?.mobile
            ? 'flex w-full max-w-full flex-col gap-3'
            : 'flex max-h-full w-full max-w-full flex-col gap-3 overflow-hidden'
        }
      >
        <HeroEditorialCopyBlock data={data} band="above-stats" tightStack className="!px-0" />
        <div className={`flex w-full max-w-full ${statsRowJustifyClass}`}>
          <HeroProfileMeta
            editorial
            meta={presentation}
            yearsOfExperience={data.yearsOfExperience}
            workCount={data.workCount}
            locationLabel={data.locationLabel}
          />
        </div>
        <HeroEditorialCopyBlock data={data} band="below-stats" tightStack className="!px-0" />
      </div>
    );

    const renderCopyStack = () => (
      <HeroEditorialCopyBlock data={data} tightStack band="in-copy" className="!px-0" />
    );

    const renderPortraitCol = (opts?: { mobile?: boolean }) => {
      if (opts?.mobile) {
        return (
          <div
            className={`relative w-full min-w-0 ${imageEnterClass}`.trim()}
            data-hero-portrait-column="mobile"
          >
            <div className="w-full p-2 sm:p-3">{renderPortraitStack({ mobile: true })}</div>
          </div>
        );
      }

      const align = slotVertical.portrait;
      return (
        <div
          className={`relative h-full min-h-0 w-full min-w-0 overflow-hidden ${imageEnterClass}`.trim()}
          data-hero-portrait-column
        >
          <div className="h-full min-h-0 w-full overflow-hidden p-2 sm:p-3">
            {renderViewportZones(
              align === 'top' ? renderPortraitStack() : null,
              align === 'center' ? renderPortraitStack() : null,
              align === 'bottom' ? renderPortraitStack() : null
            )}
          </div>
        </div>
      );
    };

    const renderStatsCol = (opts?: { mobile?: boolean }) => {
      if (opts?.mobile) {
        return (
          <div className="relative w-full min-w-0" data-hero-stats-column="mobile">
            <div className="w-full p-0 sm:p-3" data-hero-stats-stack>
              {renderStatsStack({ mobile: true })}
            </div>
          </div>
        );
      }

      const align = slotVertical.stats;
      return (
        <div
          className="relative h-full min-h-0 w-full min-w-0 overflow-hidden"
          data-hero-stats-column
        >
          <div className="h-full min-h-0 w-full overflow-hidden p-0 sm:p-3" data-hero-stats-stack>
            {renderViewportZones(
              align === 'top' ? renderStatsStack() : null,
              align === 'center' ? renderStatsStack() : null,
              align === 'bottom' ? renderStatsStack() : null
            )}
          </div>
        </div>
      );
    };

    const renderCopyFrame = (opts?: { mobile?: boolean }) => {
      if (opts?.mobile) {
        return (
          <div
            className={`relative z-10 w-full min-w-0 ${copySafeClass}`.trim()}
            data-hero-copy-frame="mobile"
          >
            <div
              className="w-full min-w-0 px-4 pb-1 pt-4 sm:px-6 sm:pt-5"
              data-hero-copy-frame-inner
            >
              {renderCopyStack()}
            </div>
          </div>
        );
      }

      const align = slotVertical.copy;
      return (
        <div
          className={`relative z-10 h-full min-h-0 min-w-0 overflow-hidden ${copySafeClass}`.trim()}
        >
          <div
            className="h-full min-h-0 w-full min-w-0 overflow-hidden px-4 pb-1 pt-4 sm:px-6 sm:pt-5"
            data-hero-copy-frame-inner
          >
            {renderViewportZones(
              align === 'top' ? renderCopyStack() : null,
              align === 'center' ? renderCopyStack() : null,
              align === 'bottom' ? renderCopyStack() : null
            )}
          </div>
        </div>
      );
    };

    const renderSlot = (slot: HeroColumns3Slot, opts?: { mobile?: boolean }) => {
      if (slot === 'copy') return copyHasContent ? renderCopyFrame(opts) : null;
      if (slot === 'portrait') return portraitHasContent ? renderPortraitCol(opts) : null;
      return statsHasContent ? renderStatsCol(opts) : null;
    };

    const visibleColumns3Order = columns3Order.filter((slot) => {
      if (slot === 'copy') return copyHasContent;
      if (slot === 'portrait') return portraitHasContent;
      return statsHasContent;
    });
    const visibleGridTemplateColumns =
      visibleColumns3Order.length > 0
        ? heroColumns3GridTemplateColumns(visibleColumns3Order, middleWeight)
        : gridTemplateColumns;

    return (
      <div
        className={`${enterClass} relative w-full xl:flex xl:h-full xl:min-h-0 xl:flex-1 xl:flex-col xl:overflow-hidden`.trim()}
      >
        {/* Mobile / tablet: normal document flow so content keeps intrinsic height. */}
        <div
          className="flex w-full flex-col xl:hidden"
          style={frameGapStyle}
          data-hero-division-stack="columns-3"
        >
          {visibleColumns3Order.map((slot) => (
            <div key={`m-${slot}`} className="w-full min-w-0">
              {renderSlot(slot, { mobile: true })}
            </div>
          ))}
        </div>
        <div
          className="hidden w-full xl:grid xl:h-full xl:min-h-0 xl:flex-1 xl:items-stretch xl:overflow-hidden"
          style={{ ...frameGapStyle, gridTemplateColumns: visibleGridTemplateColumns }}
          data-hero-division-grid="columns-3"
        >
          {visibleColumns3Order.map((slot) => (
            <div key={`d-${slot}`} className="h-full min-h-0 min-w-0 overflow-hidden">
              {renderSlot(slot)}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (vertical) {
    return (
      <div className={`${enterClass} relative w-full`.trim()}>
        <div className="flex flex-col xl:hidden" style={frameGapStyle}>
          {copyOnBottom ? (
            <>
              {visualHasContent ? visualBlockMobile : null}
              {copyHasContent ? (
                <div
                  className={`relative z-10 ${copySafeClass} order-2`.trim()}
                  data-hero-copy-frame="mobile"
                >
                  {copyInner}
                </div>
              ) : null}
            </>
          ) : (
            <>
              {copyHasContent ? (
                <div
                  className={`relative z-10 order-1 ${copySafeClass}`.trim()}
                  data-hero-copy-frame="mobile"
                >
                  {copyInner}
                </div>
              ) : null}
              {visualHasContent ? visualBlockMobile : null}
            </>
          )}
        </div>
        <div
          className="hidden w-full xl:flex xl:flex-col"
          style={frameGapStyle}
          data-hero-division-grid="vertical"
        >
          {copyHasContent ? (
            <div
              className={`relative w-full ${copySafeClass}`.trim()}
              style={{ order: copyOnBottom ? 2 : 1 }}
              data-hero-copy-frame
            >
              {copyInner}
            </div>
          ) : null}
          {visualHasContent ? (
            <div
              className={`relative w-full ${imageEnterClass}`.trim()}
              style={{ order: copyOnBottom ? 1 : 2 }}
              data-hero-visual-frame
            >
              {visualContents}
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className={`${enterClass} relative flex flex-col`.trim()}>
      <div className="flex flex-col gap-12 xl:block xl:gap-0">
        {copyHasContent ? copyBlockFlow : null}
        {visualHasContent ? visualBlockHorizontalMobile : null}
      </div>
    </div>
  );
}
