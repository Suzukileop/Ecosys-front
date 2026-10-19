'use client';

/**
 * Work / projects section.
 * Split out of portfolio-section-primitives so the public portfolio only downloads the sections it
 * renders (each is loaded with next/dynamic by PublicCreatorPortfolioPage).
 */
import Link from 'next/link';
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { ProductThumbnailMedia } from '@/components/marketplace/ProductThumbnailMedia';
import { CreatorToolLogo } from '@/components/creator/studio/CreatorToolLogo';
import { PortfolioToolsStackedIcons } from '@/components/portfolio/portfolio-tools-stacked-icons';
import { PortfolioWorkCtaGlyph } from '@/components/portfolio/portfolio-work-cta-icons';
import type { PortfolioWorkCtaIcon } from '@/components/portfolio/portfolio-work-cta-icons';
import type { MarketplaceContentItem } from '@/types/marketplace';
import { PortfolioMotionItem } from '@/components/portfolio/PortfolioMotionItem';
import type { PortfolioGlobalMotionProfile } from '@/components/portfolio/portfolio-motion-settings';
import { DEFAULT_MOTION_PROFILE } from '@/components/portfolio/portfolio-motion-settings';
import {
  elementTextInlineStyle,
  elementTextStyleClass,
  toolsIconPixelSize,
  toolsIconShellClass,
  type PortfolioElementTextStyle,
} from '@/components/portfolio/portfolio-element-text-style';
import {
  DEFAULT_WORK_PRESENTATION,
  DEFAULT_WORK_OVERLAY_ELEMENT_BANDS,
  DEFAULT_WORK_OVERLAY_ELEMENT_PLACEMENTS,
  DEFAULT_WORK_ELEMENT_CHROMES,
  PORTFOLIO_WORK_OVERLAY_ELEMENT_IDS,
  WORK_CATEGORY_ALL_KEY,
  collectWorkCategories,
  filterWorkItemsByCategory,
  groupWorkItemsByCategory,
  normalizeWorkElementStyles,
  workCardContentAlignClass,
  workCardContentOrderClass,
  workCardContentVerticalAlignClass,
  workCardEdgeClass,
  workCardEdgeStyle,
  workCardFrameClass,
  workCardFrameStyle,
  workCardGapClass,
  workCardGridStyle,
  workCardIsStacked,
  workCardLiftClass,
  workCardLiftStyle,
  workCardMaxWidthClass,
  workCardMaxWidthFlexAlignClass,
  workCardMaxWidthJustifyClass,
  workListCardSurfaceClass,
  workListCardSurfaceStyle,
  workListMediaFlexClass,
  workListThumbClass,
  workCategoryBarAlignClass,
  workContentFrameClass,
  workContentFrameGapClass,
  workContentFrameStyle,
  workElementChromeClass,
  workElementChromeStyle,
  workCardMediaAspectClass,
  workCardMediaAspectStyle,
  workCardMediaBehaviorClass,
  workCardMediaOrderClass,
  workCardShellClass,
  workCategoryChipClass,
  workCategoryNavClass,
  workCompactGalleryGap,
  workCtaAlignClass,
  workCtaClassName,
  workCtaIconShellClass,
  workCtaIconShellStyle,
  workCtaStyle,
  workEffectiveContentPlacement,
  workNoMediaInfoWidthClass,
  workOverlayCellAbsoluteStyle,
  workOverlayCellAlignClass,
  workOverlayCellColumn,
  workOverlayCellRow,
  workOverlayCellRowAlignClass,
  workOverlayElementInk,
  workOverlayReadableColor,
  workContrastingInk,
  workToolIconShellStyle,
  workToolsBlockClass,
  workToolsBlockStyle,
  workToolsPinSpacerEnabled,
  resolveWorkItemsPerRow,
  workItemsPerRowGridClass,
  type PortfolioWorkOverlayCellPlacement,
  type PortfolioWorkOverlayElementId,
  type PortfolioWorkPresentationSettings,
} from '@/components/portfolio/portfolio-work-settings';
import { useT } from '@/lib/i18n/I18nProvider';
import { ArrowUpRight } from '@/components/portfolio/portfolio-contact-link-icons';

/** Label + optional CTA glyph (left/right) for Work project buttons. */
function WorkCtaLabelAndIcon({
  presentation,
  label,
  labelClassName,
  labelStyle,
  nowrap = false,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  presentation: Record<string, any>;
  label: string;
  labelClassName?: string;
  labelStyle?: CSSProperties;
  nowrap?: boolean;
}) {
  const showIcon = presentation.ctaShowIcon !== false;
  const position = presentation.ctaIconPosition === 'left' ? 'left' : 'right';
  const icon = (presentation.ctaIcon ?? 'arrow-up-right') as PortfolioWorkCtaIcon;
  const design = (presentation.ctaDesign ?? 'pill-accent') as PortfolioWorkPresentationSettings['ctaDesign'];
  const iconNode = showIcon ? (
    <span
      className={`shrink-0 ${workCtaIconShellClass(design, presentation as never)}`}
      style={workCtaIconShellStyle(design, presentation as never)}
    >
      <PortfolioWorkCtaGlyph variant={icon} className="h-4 w-4" />
    </span>
  ) : null;
  const labelNode = (
    <span
      className={`min-w-0 ${nowrap ? 'shrink whitespace-nowrap' : 'break-words'} ${labelClassName ?? ''}`.trim()}
      style={labelStyle}
    >
      {label}
    </span>
  );
  return (
    <>
      {position === 'left' ? iconNode : null}
      {labelNode}
      {position === 'right' ? iconNode : null}
    </>
  );
}

function EditorialWorkCard({
  item,
  presentation = DEFAULT_WORK_PRESENTATION,
}: {
  item: MarketplaceContentItem;
  presentation?: PortfolioWorkPresentationSettings;
}) {
  const t = useT();
  const externalLink = item.linkUrl?.trim() || null;
  const href =
    externalLink ||
    (item.creatorId ? `/marketplace/content/${item.id}` : '#work');
  const title = item.title?.trim() || t('Untitled project');
  const description =
    item.description?.trim() ||
    (item.priceInfo?.trim() && !/^https?:\/\//i.test(item.priceInfo.trim())
      ? item.priceInfo.trim()
      : null);
  const styles = normalizeWorkElementStyles(presentation.elementStyles);
  const toolsLabelText = presentation.toolsLabelText.trim() || 'Tools to use';
  const iconShellClass = toolsIconShellClass(presentation.toolsIconSize);
  const iconPixelSize = toolsIconPixelSize(presentation.toolsIconSize);
  const tools = Array.from(new Set((item.toolsUsed ?? []).map((t) => t.trim()).filter(Boolean))).slice(
    0,
    presentation.maxToolsShown
  );
  const useSplitToolsList = tools.length > 5;
  const splitAt = useSplitToolsList ? Math.ceil(tools.length / 2) : tools.length;
  const primaryTools = tools.slice(0, splitAt);
  const overflowTools = tools.slice(splitAt);
  const showStacked = presentation.toolsDisplay === 'stacked';
  const showIcons =
    presentation.showCardTools &&
    presentation.showCardToolIcons &&
    (presentation.toolsDisplay === 'icons' ||
      presentation.toolsDisplay === 'both' ||
      showStacked);
  const showList =
    presentation.showCardTools &&
    presentation.showCardToolList &&
    !showStacked &&
    (presentation.toolsDisplay === 'list' || presentation.toolsDisplay === 'both');
  const isOverlay = presentation.cardDesign === 'overlay';
  const isCompact = presentation.cardDesign === 'compact';
  const showMedia = presentation.showCardMedia !== false;
  const effectivePlacement = workEffectiveContentPlacement(presentation);
  /** Overlay without media → plain text card (no empty scrim). */
  const useOverlayChrome = isOverlay && showMedia;
  const shellClass = workCardShellClass(
    useOverlayChrome ? 'overlay' : showMedia ? presentation.cardDesign : 'stacked',
    effectivePlacement
  );
  const gridStyle = workCardGridStyle(
    showMedia ? presentation.cardDesign : 'stacked',
    effectivePlacement,
    presentation.mediaRatio
  );
  const mediaOrderClass = workCardMediaOrderClass(presentation.cardDesign, effectivePlacement);
  const contentOrderClass = workCardContentOrderClass(presentation.cardDesign, effectivePlacement);
  const edgeClass = workCardEdgeClass(presentation);
  const edgeStyle = workCardEdgeStyle(presentation);
  const frameClass = workCardFrameClass(presentation);
  const frameStyle = workCardFrameStyle(presentation);
  const liftClass = workCardLiftClass(presentation);
  const liftStyle = workCardLiftStyle(presentation);
  const edgeOnShell =
    !showMedia ||
    workCardIsStacked(
      useOverlayChrome ? 'overlay' : presentation.cardDesign,
      effectivePlacement
    );
  const contentAlign = workCardContentAlignClass(presentation.cardContentAlignment);
  const contentVerticalAlign = workCardContentVerticalAlignClass(
    presentation.cardContentVerticalAlign
  );
  const ctaAlign =
    !showMedia && presentation.noMediaInfoLayout === 'centered'
      ? 'justify-center'
      : workCtaAlignClass(presentation.ctaAlignment);
  const contentGapClass = isCompact ? 'gap-3' : 'gap-5';
  const framed = presentation.contentFrameEnabled;
  const mediaAspectClass = workCardMediaAspectClass(
    presentation.cardDesign,
    effectivePlacement,
    presentation.mediaRatio
  );
  const mediaAspectStyle = workCardMediaAspectStyle(
    presentation.cardDesign,
    effectivePlacement,
    presentation.mediaRatio
  );
  const infoWidthClass = showMedia
    ? framed
      ? 'w-full max-w-full'
      : isCompact
        ? 'w-full max-w-full space-y-2'
        : 'w-full max-w-full space-y-3'
    : `${workNoMediaInfoWidthClass(presentation.noMediaInfoLayout)} ${framed ? '' : 'space-y-3'}`;
  const toolsWidthClass = showMedia
    ? `min-w-0 ${contentAlign.block}`
    : `min-w-0 ${workNoMediaInfoWidthClass(presentation.noMediaInfoLayout)} ${
        presentation.noMediaInfoLayout === 'centered' ? '' : contentAlign.block
      }`;
  const infoShellClass = framed
    ? `flex w-full min-w-0 flex-col ${workContentFrameGapClass(presentation.contentFrameGap)} ${workContentFrameClass(presentation)} ${
        showMedia
          ? contentAlign.container
          : presentation.noMediaInfoLayout === 'centered'
            ? 'items-center'
            : contentAlign.container
      }`
    : `flex w-full min-w-0 flex-col ${contentGapClass} ${
        showMedia
          ? contentAlign.container
          : presentation.noMediaInfoLayout === 'centered'
            ? 'items-center'
            : contentAlign.container
      }`;
  const infoShellStyle = framed ? workContentFrameStyle(presentation) : undefined;
  const descTopGap = framed ? '' : isCompact ? 'mt-1.5 line-clamp-3' : 'mt-2';
  const toolsIconsTopGap = framed ? '' : presentation.showToolsLabel ? 'mt-1.5' : '';
  const toolsListTopGap = framed ? '' : showIcons ? 'mt-2' : presentation.showToolsLabel ? 'mt-1.5' : '';
  const ctaTopGap = framed ? '' : 'pt-1';
  const cardWidthClass = workCardMaxWidthClass(presentation.cardMaxWidth);
  const chromes = presentation.elementChromes ?? DEFAULT_WORK_ELEMENT_CHROMES;
  const categoryChrome = chromes.categoryOnCard;
  const titleChrome = chromes.cardTitle;
  const descriptionChrome = chromes.cardDescription;
  const toolsChrome = chromes.tools;
  const toolsChromeFit = Boolean(toolsChrome?.enabled && toolsChrome.fitContent);
  /** Pin-to-bottom fights vertical centering — only pin when aligned to top. */
  const pinToolsEligible =
    edgeOnShell && presentation.cardContentVerticalAlign !== 'center' && presentation.cardContentVerticalAlign !== 'bottom';

  const mediaInner = item.mediaUrl ? (
    <ProductThumbnailMedia
      url={item.mediaUrl}
      alt={title}
      fit="cover"
      autoPlay
      zoomOnHover
      className="h-full w-full"
    />
  ) : (
    <div className="flex h-full w-full items-center justify-center bg-neutral-200 text-sm text-neutral-500 dark:bg-neutral-800">
      {t('Preview unavailable')}
    </div>
  );

  const mediaBlock = showMedia ? (
    <Link
      href={href}
      className={`${workCardMediaBehaviorClass(presentation.cardDesign)} ${
        edgeOnShell ? '' : edgeClass
      } ${mediaOrderClass}`.trim()}
      style={edgeOnShell ? undefined : edgeStyle}
    >
      <div className={`${mediaAspectClass} w-full`} style={mediaAspectStyle}>
        {mediaInner}
      </div>
    </Link>
  ) : null;

  const contentBlock = (
    <div
      className={`flex h-full min-w-0 flex-col self-stretch lg:min-h-0 lg:py-0 ${
        edgeOnShell ? 'flex-1' : ''
      } ${contentOrderClass} ${
        framed
          ? contentAlign.container
          : showMedia
            ? contentAlign.container
            : presentation.noMediaInfoLayout === 'centered'
              ? 'items-center'
              : contentAlign.container
      }`.trim()}
    >
      <div
        className={`${infoShellClass} ${contentVerticalAlign}${
          edgeOnShell || showMedia ? ' h-full flex-1' : ''
        }`.trim()}
        style={infoShellStyle}
      >
      {presentation.showCategoryOnCard && item.genre?.trim() ? (
        <div
          className={`${workElementChromeClass(categoryChrome)} ${
            showMedia
              ? contentAlign.block
              : presentation.noMediaInfoLayout === 'centered'
                ? ''
                : contentAlign.block
          } ${showMedia ? '' : workNoMediaInfoWidthClass(presentation.noMediaInfoLayout)}`.trim()}
          style={workElementChromeStyle(categoryChrome, presentation.ctaColor)}
        >
          <p
            className={`${elementTextStyleClass(styles.categoryOnCard, 'label')} ${
              showMedia
                ? contentAlign.text
                : presentation.noMediaInfoLayout === 'centered'
                  ? 'text-center'
                  : contentAlign.text
            }`}
            style={elementTextInlineStyle(styles.categoryOnCard)}
          >
            {item.genre.trim()}
          </p>
        </div>
      ) : null}
      {presentation.showCardTitle || (presentation.showCardDescription && description) ? (
        <div
          className={`${infoWidthClass} ${
            framed ? `flex flex-col ${workContentFrameGapClass(presentation.contentFrameGap)}` : ''
          } ${
            showMedia
              ? contentAlign.block
              : presentation.noMediaInfoLayout === 'centered'
                ? ''
                : contentAlign.block
          }`.trim()}
        >
          {presentation.showCardTitle ? (
            <div
              className={workElementChromeClass(titleChrome)}
              style={workElementChromeStyle(titleChrome, presentation.ctaColor)}
            >
              <h3
                className={`break-words leading-tight tracking-[-0.02em] ${elementTextStyleClass(styles.cardTitle, 'title')} ${
                  showMedia
                    ? contentAlign.text
                    : presentation.noMediaInfoLayout === 'centered'
                      ? 'text-center'
                      : contentAlign.text
                }`}
                style={elementTextInlineStyle(styles.cardTitle)}
              >
                <Link href={href} className="transition hover:opacity-80" data-pf-no-color-transition="">
                  {title}
                </Link>
              </h3>
            </div>
          ) : null}
          {presentation.showCardDescription && description ? (
            <div
              className={workElementChromeClass(descriptionChrome)}
              style={workElementChromeStyle(descriptionChrome, presentation.ctaColor)}
            >
              <p
                className={`break-words leading-relaxed [overflow-wrap:anywhere] ${descTopGap} ${elementTextStyleClass(styles.cardDescription, 'body')} ${
                  showMedia
                    ? contentAlign.text
                    : presentation.noMediaInfoLayout === 'centered'
                      ? 'text-center'
                      : contentAlign.text
                }`}
                style={elementTextInlineStyle(styles.cardDescription)}
              >
                {description}
              </p>
            </div>
          ) : null}
        </div>
      ) : null}

      {showIcons || showList ? (
        <>
          {workToolsPinSpacerEnabled(presentation, pinToolsEligible) ? (
            <div className="hidden min-h-0 flex-1 lg:block" aria-hidden />
          ) : null}
          <div
            className={workToolsBlockClass(
              presentation,
              pinToolsEligible,
              `${toolsWidthClass} flex flex-col gap-1.5 ${
                toolsChromeFit ? '' : workElementChromeClass(toolsChrome)
              }`
            )}
            style={workToolsBlockStyle(
              presentation,
              pinToolsEligible,
              toolsChromeFit
                ? undefined
                : workElementChromeStyle(toolsChrome, presentation.ctaColor)
            )}
          >
          {presentation.showToolsLabel && (showIcons || showList) ? (
            <p
              className={`${elementTextStyleClass(styles.toolsLabel, 'label')} ${
                showMedia
                  ? contentAlign.text
                  : presentation.noMediaInfoLayout === 'centered'
                    ? 'text-center'
                    : contentAlign.text
              }`}
              style={elementTextInlineStyle(styles.toolsLabel)}
            >
              {toolsLabelText}
            </p>
          ) : null}
          {showIcons ? (
            showStacked ? (
              <div
                className={`${contentAlign.row} ${toolsIconsTopGap} ${
                  toolsChromeFit ? workElementChromeClass(toolsChrome) : ''
                }`}
                style={
                  toolsChromeFit
                    ? workElementChromeStyle(toolsChrome, presentation.ctaColor)
                    : undefined
                }
              >
                <PortfolioToolsStackedIcons
                  tools={tools}
                  sizePx={iconPixelSize + 10}
                  borderColor={
                    workToolIconShellStyle(presentation).borderColor as string | undefined
                  }
                  shellBackground={
                    workToolIconShellStyle(presentation).backgroundColor as string | undefined
                  }
                />
              </div>
            ) : (
              <div
                className={`flex flex-wrap gap-2.5 sm:gap-3 ${contentAlign.row} ${toolsIconsTopGap} ${
                  toolsChromeFit ? workElementChromeClass(toolsChrome) : ''
                }`}
                style={
                  toolsChromeFit
                    ? workElementChromeStyle(toolsChrome, presentation.ctaColor)
                    : undefined
                }
              >
                {tools.map((tool) => {
                  const _iconShellStyle = workToolIconShellStyle(presentation);
                  return (
                    <div
                      key={`icon-${tool}`}
                      title={tool}
                      aria-label={tool}
                      className={`flex shrink-0 items-center justify-center rounded-full border shadow-xs ${iconShellClass}`}
                      style={_iconShellStyle}
                    >
                      <CreatorToolLogo
                        label={tool}
                        size={iconPixelSize}
                        className="rounded-full !bg-transparent"
                        brandColor={undefined}
                        bgColor={(_iconShellStyle.backgroundColor as string | undefined) ?? undefined}
                      />
                    </div>
                  );
                })}
              </div>
            )
          ) : null}
          {showList ? (
            <>
              <div
                className={`${toolsListTopGap} lg:hidden ${
                  toolsChromeFit && !showIcons ? workElementChromeClass(toolsChrome) : ''
                }`}
                style={
                  toolsChromeFit && !showIcons
                    ? workElementChromeStyle(toolsChrome, presentation.ctaColor)
                    : undefined
                }
              >
                <EditorialWorkToolsList
                  tools={tools}
                  textStyle={styles.toolsList}
                  accentColor={presentation.ctaColor}
                />
              </div>
              {useSplitToolsList ? (
                <div
                  className={`${toolsListTopGap} hidden gap-x-8 lg:grid lg:grid-cols-2 ${
                    toolsChromeFit && !showIcons ? workElementChromeClass(toolsChrome) : ''
                  }`}
                  style={
                    toolsChromeFit && !showIcons
                      ? workElementChromeStyle(toolsChrome, presentation.ctaColor)
                      : undefined
                  }
                >
                  <EditorialWorkToolsList
                    tools={primaryTools}
                    textStyle={styles.toolsList}
                    accentColor={presentation.ctaColor}
                  />
                  <EditorialWorkToolsList
                    tools={overflowTools}
                    textStyle={styles.toolsList}
                    accentColor={presentation.ctaColor}
                  />
                </div>
              ) : (
                <div
                  className={`${toolsListTopGap} hidden lg:block ${
                    toolsChromeFit && !showIcons ? workElementChromeClass(toolsChrome) : ''
                  }`}
                  style={
                    toolsChromeFit && !showIcons
                      ? workElementChromeStyle(toolsChrome, presentation.ctaColor)
                      : undefined
                  }
                >
                  <EditorialWorkToolsList
                    tools={tools}
                    textStyle={styles.toolsList}
                    accentColor={presentation.ctaColor}
                  />
                </div>
              )}
            </>
          ) : null}
        </div>
        </>
      ) : null}

      {presentation.showCardCta ? (
        <div
          className={`flex w-full min-w-0 ${ctaTopGap} ${ctaAlign}${
            edgeOnShell &&
            !(showIcons || showList) &&
            presentation.cardContentVerticalAlign === 'top'
              ? ' mt-auto'
              : ''
          }`.trim()}
        >
          <Link
            href={href}
            className={workCtaClassName(presentation.ctaDesign, presentation)}
            style={workCtaStyle(presentation.ctaDesign, presentation)}
          >
            <WorkCtaLabelAndIcon
              presentation={presentation}
              label={presentation.ctaLabel}
              labelClassName={elementTextStyleClass(styles.cta, 'body')}
              labelStyle={(() => {
                const fontOnly = { ...elementTextInlineStyle(styles.cta) };
                delete fontOnly.color;
                return fontOnly;
              })()}
            />
          </Link>
        </div>
      ) : null}
      </div>
    </div>
  );

  if (useOverlayChrome) {
    const overlayTools = tools.slice(0, Math.min(presentation.maxToolsShown, 6));
    const overlayIconShell = toolsIconShellClass('sm');
    const overlayIconPx = toolsIconPixelSize('sm');
    const titleStyle = {
      ...elementTextInlineStyle(styles.cardTitle),
      color: workOverlayElementInk(styles.cardTitle.color, titleChrome),
    };
    const descStyle = {
      ...elementTextInlineStyle(styles.cardDescription),
      color: workOverlayElementInk(
        styles.cardDescription.color,
        descriptionChrome,
        'rgba(255,255,255,0.88)'
      ),
    };
    const toolsListStyle = {
      ...elementTextInlineStyle(styles.toolsList),
      color: workOverlayElementInk(styles.toolsList.color, toolsChrome, 'rgba(255,255,255,0.85)'),
    };
    const ctaInk = workOverlayReadableColor(styles.cta.color);
    const ctaFontStyle = (() => {
      const fontOnly = { ...elementTextInlineStyle(styles.cta) };
      delete fontOnly.color;
      return fontOnly;
    })();
    const ctaSurfaceStyle = (() => {
      const base = workCtaStyle(presentation.ctaDesign, presentation) ?? {};
      // Filled pills already use page `fond` — don't force overlay-white ink.
      if (presentation.ctaDesign === 'pill-accent' || presentation.ctaDesign === 'pill-dark') {
        return base;
      }
      // Outline / circle / text on dark scrim: keep readable resting label.
      return {
        ...base,
        ['--work-cta-text' as string]: ctaInk,
        ['--work-cta-hover-text' as string]:
          presentation.ctaDesign === 'pill-outline'
            ? ((base as Record<string, string>)['--work-cta-page-fond'] ?? ctaInk)
            : presentation.ctaColor || ctaInk,
      };
    })();
    const overlayIconStyle = workToolIconShellStyle(presentation);
    const overlayIconBg =
      (overlayIconStyle.backgroundColor as string | undefined) ?? undefined;
    const categoryCompactWidthClass =
      categoryChrome?.enabled && categoryChrome.fitContent === false
        ? '!w-fit !max-w-full lg:!w-full'
        : '!w-fit !max-w-full';
    const useFreeOverlay = presentation.overlayLayoutMode === 'free';
    const placements = presentation.overlayElementPlacements ?? DEFAULT_WORK_OVERLAY_ELEMENT_PLACEMENTS;
    const bands = presentation.overlayElementBands ?? DEFAULT_WORK_OVERLAY_ELEMENT_BANDS;
    const overlayDarkness = Math.min(
      200,
      Math.max(0, presentation.overlayMediaDarkness ?? 100)
    ) / 100;

    const categoryNode =
      presentation.showCategoryOnCard && item.genre?.trim() ? (
        <div
          className={`${categoryCompactWidthClass} ${workElementChromeClass(categoryChrome)}`}
          style={workElementChromeStyle(categoryChrome, presentation.ctaColor)}
        >
          <p
            className="text-xs font-bold uppercase tracking-[0.16em]"
            style={{
              ...elementTextInlineStyle(styles.categoryOnCard),
              color: workOverlayElementInk(styles.categoryOnCard.color, categoryChrome),
            }}
          >
            {item.genre.trim()}
          </p>
        </div>
      ) : null;

    const titleNode = presentation.showCardTitle ? (
      <div
        className={workElementChromeClass(titleChrome)}
        style={workElementChromeStyle(titleChrome, presentation.ctaColor)}
      >
        <h3
          className="line-clamp-2 break-words text-xl font-extrabold leading-tight tracking-[-0.02em] sm:text-2xl"
          style={titleStyle}
        >
          <Link href={href} className="transition hover:opacity-80" data-pf-no-color-transition="">
            {title}
          </Link>
        </h3>
      </div>
    ) : null;

    const descriptionNode =
      presentation.showCardDescription && description ? (
        <div
          className={workElementChromeClass(descriptionChrome)}
          style={workElementChromeStyle(descriptionChrome, presentation.ctaColor)}
        >
          <p
            className="line-clamp-3 max-w-xl break-words text-sm leading-relaxed [overflow-wrap:anywhere] sm:text-base"
            style={descStyle}
          >
            {description}
          </p>
        </div>
      ) : null;

    const toolsNode =
      showIcons && overlayTools.length > 0 ? (
        showStacked ? (
          <div
            className={workToolsBlockClass(
              presentation,
              false,
              workElementChromeClass(toolsChrome)
            )}
            style={workToolsBlockStyle(
              presentation,
              false,
              workElementChromeStyle(toolsChrome, presentation.ctaColor)
            )}
          >
            <PortfolioToolsStackedIcons
              tools={overlayTools}
              sizePx={overlayIconPx + 8}
              borderColor={
                typeof overlayIconStyle.borderColor === 'string'
                  ? overlayIconStyle.borderColor
                  : '#0a0a0a'
              }
              shellBackground={overlayIconBg}
            />
          </div>
        ) : (
          <div
            className={workToolsBlockClass(
              presentation,
              false,
              `flex flex-wrap gap-2 ${workElementChromeClass(toolsChrome)}`
            )}
            style={workToolsBlockStyle(
              presentation,
              false,
              workElementChromeStyle(toolsChrome, presentation.ctaColor)
            )}
          >
            {overlayTools.map((tool) => (
              <div
                key={`overlay-icon-${tool}`}
                title={tool}
                aria-label={tool}
                className={`flex shrink-0 items-center justify-center rounded-full border backdrop-blur-xs ${overlayIconShell}`}
                style={overlayIconStyle}
              >
                <CreatorToolLogo
                  label={tool}
                  size={overlayIconPx}
                  className="rounded-full !bg-transparent"
                  brandColor={undefined}
                  bgColor={overlayIconBg}
                />
              </div>
            ))}
          </div>
        )
      ) : showList && tools.length > 0 ? (
        <div
          className={workToolsBlockClass(
            presentation,
            false,
            workElementChromeClass(toolsChrome)
          )}
          style={workToolsBlockStyle(
            presentation,
            false,
            workElementChromeStyle(toolsChrome, presentation.ctaColor)
          )}
        >
          <p className="line-clamp-2 break-words text-sm" style={toolsListStyle}>
            {tools.join(' · ')}
          </p>
        </div>
      ) : null;

    const ctaNode = presentation.showCardCta ? (
      <Link
        href={href}
        className={`${workCtaClassName(presentation.ctaDesign, presentation)} shrink-0 flex-nowrap`}
        style={ctaSurfaceStyle}
      >
        <WorkCtaLabelAndIcon
          presentation={presentation}
          label={presentation.ctaLabel}
          labelClassName={elementTextStyleClass(styles.cta, 'body')}
          labelStyle={ctaFontStyle}
          nowrap
        />
      </Link>
    ) : null;

    const elementNodes: Record<PortfolioWorkOverlayElementId, ReactNode> = {
      category: categoryNode,
      title: titleNode,
      description: descriptionNode,
      tools: toolsNode,
      cta: ctaNode,
    };

    const flowElementNodes: Record<PortfolioWorkOverlayElementId, ReactNode> = {
      category:
        presentation.showCategoryOnCard && item.genre?.trim() ? (
          <div
            className={`${categoryCompactWidthClass} ${workElementChromeClass(categoryChrome)}`}
            style={workElementChromeStyle(categoryChrome, presentation.ctaColor)}
          >
            <p
              className="text-xs font-bold uppercase tracking-[0.16em]"
              style={elementTextInlineStyle(styles.categoryOnCard)}
            >
              {item.genre.trim()}
            </p>
          </div>
        ) : null,
      title: presentation.showCardTitle ? (
        <div
          className={`w-full ${workElementChromeClass(titleChrome)}`}
          style={workElementChromeStyle(titleChrome, presentation.ctaColor)}
        >
          <h3
            className="w-full break-words text-xl font-extrabold leading-tight tracking-[-0.02em] sm:text-2xl"
            style={elementTextInlineStyle(styles.cardTitle)}
          >
            <Link href={href} className="transition hover:opacity-80" data-pf-no-color-transition="">
              {title}
            </Link>
          </h3>
        </div>
      ) : null,
      description:
        presentation.showCardDescription && description ? (
          <div
            className={`w-full ${workElementChromeClass(descriptionChrome)}`}
            style={workElementChromeStyle(descriptionChrome, presentation.ctaColor)}
          >
            <p
              className="w-full max-w-none break-words text-sm leading-relaxed [overflow-wrap:anywhere] sm:text-base"
              style={elementTextInlineStyle(styles.cardDescription)}
            >
              {description}
            </p>
          </div>
        ) : null,
      tools:
        showIcons && overlayTools.length > 0 ? (
          toolsNode
        ) : showList && tools.length > 0 ? (
          <div
            className={workToolsBlockClass(
              presentation,
              false,
              workElementChromeClass(toolsChrome)
            )}
            style={workToolsBlockStyle(
              presentation,
              false,
              workElementChromeStyle(toolsChrome, presentation.ctaColor)
            )}
          >
            <p
              className="break-words text-sm"
              style={elementTextInlineStyle(styles.toolsList)}
            >
              {tools.join(' · ')}
            </p>
          </div>
        ) : null,
      cta: presentation.showCardCta ? (
        <Link
          href={href}
          className={`${workCtaClassName(presentation.ctaDesign, presentation)} shrink-0 flex-nowrap`}
          style={workCtaStyle(presentation.ctaDesign, presentation)}
        >
          <WorkCtaLabelAndIcon
            presentation={presentation}
            label={presentation.ctaLabel}
            labelClassName={elementTextStyleClass(styles.cta, 'body')}
            labelStyle={ctaFontStyle}
            nowrap
          />
        </Link>
      ) : null,
    };

    const onMediaElement = (id: PortfolioWorkOverlayElementId) =>
      bands[id] === 'on-media' ? elementNodes[id] : null;

    const stackBody = (
      <div
        className={`pointer-events-auto flex w-full min-w-0 flex-col ${
          framed
            ? `${workContentFrameGapClass(presentation.contentFrameGap)} ${workContentFrameClass(presentation)}`
            : 'gap-2.5 sm:gap-3'
        } ${contentAlign.container} ${contentAlign.text}`}
        style={framed ? workContentFrameStyle(presentation) : undefined}
      >
        {onMediaElement('category') ? <div className={contentAlign.text}>{categoryNode}</div> : null}
        {onMediaElement('title') ? <div className={contentAlign.text}>{titleNode}</div> : null}
        {onMediaElement('description') ? <div className={contentAlign.block}>{descriptionNode}</div> : null}
        {onMediaElement('tools') ? (
          <div className={showIcons && overlayTools.length > 0 ? contentAlign.row : undefined}>
            {toolsNode}
          </div>
        ) : null}
        {onMediaElement('cta') ? <div className={`flex w-full min-w-0 pt-0.5 ${ctaAlign}`}>{ctaNode}</div> : null}
      </div>
    );

    const freeCellGroups = (() => {
      const groups = new Map<PortfolioWorkOverlayCellPlacement, PortfolioWorkOverlayElementId[]>();
      for (const id of PORTFOLIO_WORK_OVERLAY_ELEMENT_IDS) {
        if (bands[id] !== 'on-media' || !elementNodes[id]) continue;
        const cell = placements[id];
        const list = groups.get(cell) ?? [];
        list.push(id);
        groups.set(cell, list);
      }
      return Array.from(groups.entries());
    })();

    /** Small screens keep the chosen top / middle / bottom band instead of one bottom pile. */
    const freeRowGroups = (['top', 'center', 'bottom'] as const).map((row) => ({
      row,
      ids: PORTFOLIO_WORK_OVERLAY_ELEMENT_IDS.filter(
        (id) =>
          bands[id] === 'on-media' &&
          elementNodes[id] &&
          workOverlayCellRow(placements[id]) === row
      ),
    }));

    const freeMobileBody = (
      <>
        {freeRowGroups.map(({ row, ids }) => {
          /** Same band = same line: left / center / right stay side by side, and wrap when too narrow. */
          const columnGroups = (['left', 'center', 'right'] as const)
            .map((col) => ({
              col,
              ids: ids.filter((id) => workOverlayCellColumn(placements[id]) === col),
            }))
            .filter((group) => group.ids.length > 0);
          return (
            <div
              key={row}
              className={`flex w-full min-w-0 flex-wrap gap-x-4 ${
                framed
                  ? `${workContentFrameGapClass(presentation.contentFrameGap)} ${
                      ids.length > 0 ? workContentFrameClass(presentation) : ''
                    }`
                  : 'gap-y-2.5 sm:gap-y-3'
              } ${
                row === 'top'
                  ? 'items-start'
                  : row === 'center'
                    ? 'my-auto items-center'
                    : 'items-end'
              }`}
              style={framed && ids.length > 0 ? workContentFrameStyle(presentation) : undefined}
            >
              {columnGroups.map(({ col, ids: columnIds }) => (
                <div
                  key={col}
                  className={`flex min-w-0 flex-1 basis-40 flex-col gap-2.5 ${
                    col === 'left'
                      ? 'items-start'
                      : col === 'center'
                        ? 'items-center'
                        : 'items-end'
                  }`}
                >
                  {columnIds.map((id) => {
                    const cell = placements[id];
                    return (
                      <div
                        key={id}
                        className={`pointer-events-auto flex w-full min-w-0 flex-col ${workOverlayCellAlignClass(
                          cell
                        )} ${
                          id === 'cta' || id === 'tools' ? workOverlayCellRowAlignClass(cell) : ''
                        }`}
                      >
                        {elementNodes[id]}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          );
        })}
      </>
    );

    const flowBand = (band: 'above' | 'below') => {
      const ids = PORTFOLIO_WORK_OVERLAY_ELEMENT_IDS.filter(
        (id) => bands[id] === band && flowElementNodes[id]
      );
      if (ids.length === 0) return null;
      return (
        <div className="flex w-full min-w-0 flex-col gap-3 p-5 sm:gap-4 sm:p-7">
          {ids.map((id) => {
            const node = flowElementNodes[id];
            const cell = placements[id];
            return (
              <div
                key={id}
                className={`flex w-full min-w-0 flex-col ${workOverlayCellAlignClass(cell)} ${
                  id === 'cta' || id === 'tools' ? workOverlayCellRowAlignClass(cell) : ''
                }`}
              >
                {node}
              </div>
            );
          })}
        </div>
      );
    };

    const overlayInner = (
      <>
        {flowBand('above')}
        <div
          className={`group relative overflow-hidden transition duration-300 hover:-translate-y-0.5 ${edgeClass}`}
          data-pf-no-color-transition=""
          style={{
            ...edgeStyle,
            ...(presentation.cardBackgroundEnabled
              ? { backgroundColor: presentation.cardBackgroundColor }
              : undefined),
          }}
        >
        <Link href={href} className="relative block">
          <div
            className={`${workCardMediaAspectClass('overlay', presentation.contentPlacement, presentation.mediaRatio)} min-h-[18rem] w-full sm:min-h-[22rem]`}
            style={mediaAspectStyle}
          >
            {mediaInner}
          </div>
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: `linear-gradient(to top, rgba(0,0,0,${Math.min(1, 0.9 * overlayDarkness)}), rgba(0,0,0,${Math.min(1, 0.45 * overlayDarkness)}), rgba(0,0,0,${Math.min(1, 0.1 * overlayDarkness)}))`,
            }}
            aria-hidden
          />
        </Link>

        {/* Mobile / tablet: free mode keeps its bands, stack mode uses the bottom pile */}
        {useFreeOverlay ? (
          <div className="pointer-events-none absolute inset-0 flex flex-col gap-3 overflow-hidden p-5 sm:gap-4 sm:p-7 lg:hidden">
            {freeMobileBody}
          </div>
        ) : (
          <div
            className={`pointer-events-none absolute inset-x-0 bottom-0 flex max-h-[78%] flex-col justify-end gap-3 overflow-hidden p-5 sm:gap-4 sm:p-7 ${contentAlign.container}`}
          >
            {stackBody}
          </div>
        )}

        {/* Large screens + free mode: absolute 3×3 cells */}
        {useFreeOverlay ? (
          <div className="pointer-events-none absolute inset-0 hidden p-5 sm:p-7 lg:block">
            {freeCellGroups.map(([cell, ids]) => {
              const needsReadableWidth = ids.some(
                (id) => id === 'title' || id === 'description' || id === 'tools'
              );
              return (
              <div
                key={cell}
                className={`pointer-events-auto absolute flex w-max max-w-[min(100%,22rem)] flex-col gap-2.5 ${
                  needsReadableWidth ? 'min-w-[min(100%,16rem)]' : ''
                } ${workOverlayCellAlignClass(cell)}`}
                style={workOverlayCellAbsoluteStyle(cell)}
              >
                {ids.map((id) => {
                  const node = elementNodes[id];
                  if (!node) return null;
                  if (id === 'cta') {
                    return (
                      <div key={id} className={`flex w-auto shrink-0 ${workOverlayCellRowAlignClass(cell)}`}>
                        {node}
                      </div>
                    );
                  }
                  if (id === 'tools') {
                    return (
                      <div key={id} className={`flex w-full ${workOverlayCellRowAlignClass(cell)}`}>
                        {node}
                      </div>
                    );
                  }
                  return <div key={id} className="w-full min-w-0">{node}</div>;
                })}
              </div>
              );
            })}
          </div>
        ) : null}
        </div>
        {flowBand('below')}
        {presentation.overlayBottomRuleEnabled ? (
          <span
            className="mx-5 mt-5 block h-px sm:mx-7 sm:mt-7"
            style={{ backgroundColor: presentation.overlayBottomRuleColor }}
            aria-hidden
          />
        ) : null}
      </>
    );
    const hasOutsideBand = PORTFOLIO_WORK_OVERLAY_ELEMENT_IDS.some(
      (id) => bands[id] === 'above' || bands[id] === 'below'
    );
    const overlayFrameStyle = hasOutsideBand
      ? { ...frameStyle, backgroundColor: 'transparent' }
      : frameStyle;

    if (frameClass) {
      return (
        <article
          className={`h-full ${cardWidthClass} ${frameClass} ${liftClass}`.trim()}
          style={{ ...overlayFrameStyle, ...liftStyle }}
        >
          {overlayInner}
        </article>
      );
    }
    return (
      <article className={`h-full ${cardWidthClass} ${liftClass}`.trim()} style={liftStyle}>
        {overlayInner}
      </article>
    );
  }

  const cardShell = (
    <div
      className={[edgeOnShell ? `${edgeClass} overflow-hidden` : '', shellClass].filter(Boolean).join(' ')}
      style={{
        ...(edgeOnShell ? edgeStyle : undefined),
        ...gridStyle,
      }}
    >
      {mediaBlock}
      {contentBlock}
    </div>
  );

  if (frameClass) {
    return (
      <article
        className={`h-full ${cardWidthClass} ${frameClass} ${liftClass}`.trim()}
        style={{ ...frameStyle, ...liftStyle }}
      >
        {cardShell}
      </article>
    );
  }

  return (
    <article className={`h-full ${cardWidthClass} ${liftClass}`.trim()} style={liftStyle}>
      {cardShell}
    </article>
  );
}

function WorkChevronIcon({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
    </svg>
  );
}

function WorkCardThumb({
  item,
  title,
  className,
}: {
  item: MarketplaceContentItem;
  title: string;
  className: string;
}) {
  const t = useT();
  return item.mediaUrl ? (
    <div className={className}>
      <ProductThumbnailMedia url={item.mediaUrl} alt={title} fit="cover" className="h-full w-full" />
    </div>
  ) : (
    <div
      className={`${className} flex items-center justify-center bg-neutral-200 text-[10px] text-neutral-500 dark:bg-neutral-800`}
    >
      {t('N/A')}
    </div>
  );
}

/** Design 2 — Liste compacte: elevated row, bold thumb, balanced content, circled action. */
function EditorialWorkListCard({
  item,
  presentation,
}: {
  item: MarketplaceContentItem;
  presentation: PortfolioWorkPresentationSettings;
}) {
  const t = useT();
  const href =
    item.linkUrl?.trim() ||
    (item.creatorId ? `/marketplace/content/${item.id}` : '#work');
  const title = item.title?.trim() || t('Untitled project');
  const description = item.description?.trim() || item.priceInfo?.trim() || null;
  const styles = normalizeWorkElementStyles(presentation.elementStyles);
  const surfaceClass = workListCardSurfaceClass(presentation);
  const surfaceStyle = workListCardSurfaceStyle(presentation);
  const contentAlign = workCardContentAlignClass(presentation.cardContentAlignment);
  const cardWidthClass = workCardMaxWidthClass(presentation.cardMaxWidth);
  const showMedia = presentation.showCardMedia !== false;
  const mediaPlacement = workEffectiveContentPlacement(presentation);
  const tools = Array.from(new Set((item.toolsUsed ?? []).map((t) => t.trim()).filter(Boolean))).slice(
    0,
    presentation.maxToolsShown
  );
  const showStacked = presentation.toolsDisplay === 'stacked';
  const showIcons =
    presentation.showCardTools &&
    presentation.showCardToolIcons &&
    (presentation.toolsDisplay === 'icons' ||
      presentation.toolsDisplay === 'both' ||
      showStacked) &&
    tools.length > 0;
  const showList =
    presentation.showCardTools &&
    presentation.showCardToolList &&
    !showStacked &&
    (presentation.toolsDisplay === 'list' || presentation.toolsDisplay === 'both') &&
    tools.length > 0;
  const iconShellClass = toolsIconShellClass('sm');
  const iconPixelSize = toolsIconPixelSize('sm');
  const chromes = presentation.elementChromes ?? DEFAULT_WORK_ELEMENT_CHROMES;
  const cta = presentation.ctaColor;

  const toolsBlock =
    showIcons || showList ? (
      <div
        className={workToolsBlockClass(
          presentation,
          false,
          `space-y-1.5 ${contentAlign.container} ${workElementChromeClass(chromes.tools)}`
        )}
        style={workToolsBlockStyle(
          presentation,
          false,
          workElementChromeStyle(chromes.tools, cta)
        )}
      >
        {showIcons ? (
          showStacked ? (
            <div className={contentAlign.row}>
              <PortfolioToolsStackedIcons
                tools={tools}
                sizePx={iconPixelSize + 8}
                borderColor={
                  workToolIconShellStyle(presentation).borderColor as string | undefined
                }
                shellBackground={
                  workToolIconShellStyle(presentation).backgroundColor as string | undefined
                }
              />
            </div>
          ) : (
            <div className={`flex flex-wrap gap-1.5 ${contentAlign.row}`}>
              {tools.map((tool) => {
                const _iconShellStyle = workToolIconShellStyle(presentation);
                return (
                  <div
                    key={`list-icon-${item.id}-${tool}`}
                    title={tool}
                    aria-label={tool}
                    className={`flex shrink-0 items-center justify-center rounded-full border shadow-xs ${iconShellClass}`}
                    style={_iconShellStyle}
                  >
                    <CreatorToolLogo
                      label={tool}
                      size={iconPixelSize}
                      className="rounded-full !bg-transparent"
                      brandColor={undefined}
                      bgColor={(_iconShellStyle.backgroundColor as string | undefined) ?? undefined}
                    />
                  </div>
                );
              })}
            </div>
          )
        ) : null}
        {showList ? (
          <p
            className={`line-clamp-1 break-words ${elementTextStyleClass(styles.toolsList, 'body')}`}
            style={elementTextInlineStyle(styles.toolsList)}
          >
            {tools.join(' · ')}
          </p>
        ) : null}
      </div>
    ) : null;

  const actionButton = (
    <span
      className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition duration-300 group-hover:scale-105 sm:h-11 sm:w-11"
      data-pf-no-color-transition=""
      style={{
        color: cta,
        borderColor: `color-mix(in srgb, ${cta} 40%, transparent)`,
        backgroundColor: `color-mix(in srgb, ${cta} 10%, transparent)`,
      }}
    >
      <span
        className="pointer-events-none absolute inset-0 rounded-full opacity-0 transition duration-300 group-hover:opacity-100"
        data-pf-no-color-transition=""
        style={{ backgroundColor: `color-mix(in srgb, ${cta} 22%, transparent)` }}
        aria-hidden
      />
      <ArrowUpRight
        className="relative h-4 w-4 transition duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 sm:h-[1.125rem] sm:w-[1.125rem]"
        noColorTransition
        style={{ color: cta }}
        aria-hidden
      />
    </span>
  );

  return (
    <Link
      href={href}
      className={`group flex w-full ${workListMediaFlexClass(mediaPlacement)} ${cardWidthClass} ${surfaceClass}`.trim()}
      style={surfaceStyle}
    >
      {showMedia ? (
        <WorkCardThumb
          item={item}
          title={title}
          className={workListThumbClass(mediaPlacement, presentation.mediaRatio)}
        />
      ) : null}

      <div
        className={
          presentation.contentFrameEnabled
            ? `flex min-w-0 w-full flex-1 flex-col ${workContentFrameGapClass(presentation.contentFrameGap)} ${workContentFrameClass(presentation)} ${contentAlign.text}`
            : `min-w-0 w-full flex-1 space-y-2 ${contentAlign.text}`
        }
        style={{
          ...(presentation.contentFrameEnabled ? workContentFrameStyle(presentation) : {}),
          maxWidth: '42rem',
        }}
      >
        {presentation.showCategoryOnCard && item.genre?.trim() ? (
          <div
            className={workElementChromeClass(chromes.categoryOnCard)}
            style={workElementChromeStyle(chromes.categoryOnCard, cta)}
          >
            <p
              className={`mb-0.5 ${elementTextStyleClass(styles.categoryOnCard, 'label')}`}
              style={elementTextInlineStyle(styles.categoryOnCard)}
            >
              {item.genre.trim()}
            </p>
          </div>
        ) : null}
        {presentation.showCardTitle ? (
          <div
            className={workElementChromeClass(chromes.cardTitle)}
            style={workElementChromeStyle(chromes.cardTitle, cta)}
          >
            <p
              className={`line-clamp-2 break-words transition duration-200 group-hover:opacity-90 ${elementTextStyleClass(styles.cardTitle, 'body')}`}
              data-pf-no-color-transition=""
              style={elementTextInlineStyle(styles.cardTitle)}
            >
              {title}
            </p>
          </div>
        ) : null}
        {presentation.showCardDescription && description ? (
          <div
            className={workElementChromeClass(chromes.cardDescription)}
            style={workElementChromeStyle(chromes.cardDescription, cta)}
          >
            <p
              className={`break-words [overflow-wrap:anywhere] sm:line-clamp-2 ${elementTextStyleClass(styles.cardDescription, 'body')}`}
              style={elementTextInlineStyle(styles.cardDescription)}
            >
              {description}
            </p>
          </div>
        ) : null}
      </div>

      {/* Mobile: tools + action on one bottom row. Desktop: tools beside circled action. */}
      <div className="flex w-full items-center justify-between gap-3 sm:ml-auto sm:w-auto sm:justify-end sm:gap-4">
        {toolsBlock ? <div className="min-w-0 flex-1 sm:flex-none">{toolsBlock}</div> : <span className="flex-1 sm:hidden" />}
        {actionButton}
      </div>
    </Link>
  );
}

/** Design 4 — Accordéon: expandable row revealing description, tools, and CTA. */
function EditorialWorkAccordionRow({
  item,
  presentation,
  defaultOpen = false,
}: {
  item: MarketplaceContentItem;
  presentation: PortfolioWorkPresentationSettings;
  defaultOpen?: boolean;
}) {
  const t = useT();
  const [open, setOpen] = useState(defaultOpen);
  const href =
    item.linkUrl?.trim() ||
    (item.creatorId ? `/marketplace/content/${item.id}` : '#work');
  const title = item.title?.trim() || t('Untitled project');
  const description = item.description?.trim() || item.priceInfo?.trim() || null;
  const styles = normalizeWorkElementStyles(presentation.elementStyles);
  const iconShellClass = toolsIconShellClass(presentation.toolsIconSize);
  const iconPixelSize = toolsIconPixelSize(presentation.toolsIconSize);
  const tools = Array.from(new Set((item.toolsUsed ?? []).map((t) => t.trim()).filter(Boolean))).slice(
    0,
    presentation.maxToolsShown
  );
  const showStacked = presentation.toolsDisplay === 'stacked';
  const showIcons =
    presentation.showCardTools &&
    presentation.showCardToolIcons &&
    (presentation.toolsDisplay === 'icons' ||
      presentation.toolsDisplay === 'both' ||
      showStacked);
  const edgeClass = workCardEdgeClass(presentation);
  const edgeStyle = workCardEdgeStyle(presentation);
  const frameClass = workCardFrameClass(presentation);
  const frameStyle = workCardFrameStyle(presentation);
  const liftClass = workCardLiftClass(presentation);
  const liftStyle = workCardLiftStyle(presentation);
  const cardWidthClass = workCardMaxWidthClass(presentation.cardMaxWidth);
  const baseFrame = [edgeClass, frameClass, 'overflow-hidden'].filter(Boolean).join(' ');
  const innerPad = presentation.cardPadding === 'none' ? 'px-4 sm:px-5' : '';
  const contentAlign = workCardContentAlignClass(presentation.cardContentAlignment);
  const ctaAlign = workCtaAlignClass(presentation.ctaAlignment);
  const showMedia = presentation.showCardMedia !== false;
  const mediaPlacement = workEffectiveContentPlacement(presentation);
  const stackedMedia = mediaPlacement === 'bottom' || mediaPlacement === 'top';
  const accordionThumbClass = stackedMedia
    ? 'aspect-[16/10] w-full shrink-0 overflow-hidden rounded-xl'
    : 'h-12 w-12 shrink-0 overflow-hidden rounded-lg';
  const chromes = presentation.elementChromes ?? DEFAULT_WORK_ELEMENT_CHROMES;
  const rowStyle: CSSProperties = {
    ...frameStyle,
    ...edgeStyle,
  };

  const accordionThumb =
    showMedia ? (
      <WorkCardThumb item={item} title={title} className={accordionThumbClass} />
    ) : null;

  const accordionTitleRow = (
    <span className="flex min-w-0 flex-1 items-center gap-4">
      {showMedia && mediaPlacement === 'side' ? accordionThumb : null}
      <span className="min-w-0 flex-1">
        {presentation.showCategoryOnCard && item.genre?.trim() ? (
          <span
            className={`mb-0.5 block ${workElementChromeClass(chromes.categoryOnCard)}`}
            style={workElementChromeStyle(chromes.categoryOnCard, presentation.ctaColor)}
          >
            <span
              className={elementTextStyleClass(styles.categoryOnCard, 'label')}
              style={elementTextInlineStyle(styles.categoryOnCard)}
            >
              {item.genre.trim()}
            </span>
          </span>
        ) : null}
        {presentation.showCardTitle ? (
          <span
            className={`block ${workElementChromeClass(chromes.cardTitle)}`}
            style={workElementChromeStyle(chromes.cardTitle, presentation.ctaColor)}
          >
            <span
              className={`block line-clamp-2 break-words ${elementTextStyleClass(styles.cardTitle, 'body')}`}
              style={elementTextInlineStyle(styles.cardTitle)}
            >
              {title}
            </span>
          </span>
        ) : null}
      </span>
      {showMedia && mediaPlacement === 'side-reverse' ? accordionThumb : null}
      <WorkChevronIcon
        className={`h-5 w-5 shrink-0 transition-transform duration-300 ${
          open ? 'rotate-180' : ''
        }`}
        style={{ color: presentation.categoryMutedColor }}
      />
    </span>
  );

  return (
    <div className={`${cardWidthClass} ${liftClass}`.trim()} style={liftStyle}>
    <div className={baseFrame} style={rowStyle}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex w-full flex-col gap-3 py-4 text-left ${innerPad}`}
        aria-expanded={open}
      >
        {stackedMedia && mediaPlacement === 'bottom' ? accordionThumb : null}
        {accordionTitleRow}
        {stackedMedia && mediaPlacement === 'top' ? accordionThumb : null}
      </button>
      <div
        className={`grid transition-all duration-300 ease-out ${
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="min-h-0 overflow-hidden">
            <div
              className={`flex flex-col pb-5 ${innerPad} ${contentAlign.container} ${
                presentation.contentFrameEnabled
                  ? `${workContentFrameGapClass(presentation.contentFrameGap)} ${workContentFrameClass(presentation)}`
                  : 'gap-4'
              }`}
              style={presentation.contentFrameEnabled ? workContentFrameStyle(presentation) : undefined}
            >
            {presentation.showCardDescription && description ? (
              <div
                className={workElementChromeClass(chromes.cardDescription)}
                style={workElementChromeStyle(chromes.cardDescription, presentation.ctaColor)}
              >
                <p
                  className={`break-words leading-relaxed [overflow-wrap:anywhere] ${elementTextStyleClass(styles.cardDescription, 'body')} ${contentAlign.text}`}
                  style={elementTextInlineStyle(styles.cardDescription)}
                >
                  {description}
                </p>
              </div>
            ) : null}
            {showIcons && tools.length > 0 ? (
              showStacked ? (
                <div
                  className={workToolsBlockClass(
                    presentation,
                    false,
                    `${contentAlign.row} ${workElementChromeClass(chromes.tools)}`
                  )}
                  style={workToolsBlockStyle(
                    presentation,
                    false,
                    workElementChromeStyle(chromes.tools, presentation.ctaColor)
                  )}
                >
                  <PortfolioToolsStackedIcons
                    tools={tools}
                    sizePx={iconPixelSize + 10}
                    borderColor={
                      workToolIconShellStyle(presentation).borderColor as string | undefined
                    }
                    shellBackground={
                      workToolIconShellStyle(presentation).backgroundColor as string | undefined
                    }
                  />
                </div>
              ) : (
                <div
                  className={workToolsBlockClass(
                    presentation,
                    false,
                    `flex flex-wrap gap-2.5 ${contentAlign.row} ${workElementChromeClass(chromes.tools)}`
                  )}
                  style={workToolsBlockStyle(
                    presentation,
                    false,
                    workElementChromeStyle(chromes.tools, presentation.ctaColor)
                  )}
                >
                  {tools.map((tool) => {
                    const _iconShellStyle = workToolIconShellStyle(presentation);
                    return (
                      <div
                        key={`acc-${item.id}-${tool}`}
                        title={tool}
                        aria-label={tool}
                        className={`flex shrink-0 items-center justify-center rounded-full border shadow-xs ${iconShellClass}`}
                        style={_iconShellStyle}
                      >
                        <CreatorToolLogo
                          label={tool}
                          size={iconPixelSize}
                          className="rounded-full !bg-transparent"
                          brandColor={undefined}
                          bgColor={(_iconShellStyle.backgroundColor as string | undefined) ?? undefined}
                        />
                      </div>
                    );
                  })}
                </div>
              )
            ) : null}
            {presentation.showCardCta ? (
              <div className={`flex w-full min-w-0 ${ctaAlign}`}>
                <Link
                  href={href}
                  className={workCtaClassName(presentation.ctaDesign, presentation)}
                  style={workCtaStyle(presentation.ctaDesign, presentation)}
                >
                  <WorkCtaLabelAndIcon
                    presentation={presentation}
                    label={presentation.ctaLabel}
                    labelClassName={elementTextStyleClass(styles.cta, 'body')}
                    labelStyle={(() => {
                      const fontOnly = { ...elementTextInlineStyle(styles.cta) };
                      delete fontOnly.color;
                      return fontOnly;
                    })()}
                  />
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}

/** Renders the full collection of work items according to the chosen gallery layout. */
export function EditorialWorkGallery({
  items,
  presentation = DEFAULT_WORK_PRESENTATION,
  motionProfile = DEFAULT_MOTION_PROFILE,
  forceSingleColumn = false,
}: {
  items: MarketplaceContentItem[];
  presentation?: PortfolioWorkPresentationSettings;
  motionProfile?: PortfolioGlobalMotionProfile;
  /** Split-screen nav: one project card per row so content matches the fixed title rail. */
  forceSingleColumn?: boolean;
}) {
  const t = useT();
  const [activeCategory, setActiveCategory] = useState(WORK_CATEGORY_ALL_KEY);
  const categories = useMemo(
    () => collectWorkCategories(items, presentation.categoryUncategorizedLabel),
    [items, presentation.categoryUncategorizedLabel]
  );
  const showFilter =
    (presentation.categoryMode === 'filter' || presentation.categoryMode === 'filter-and-group') &&
    categories.length > 1;
  const showGroups =
    presentation.categoryMode === 'group' || presentation.categoryMode === 'filter-and-group';

  useEffect(() => {
    if (activeCategory === WORK_CATEGORY_ALL_KEY) return;
    if (!categories.some((category) => category.key === activeCategory)) {
      setActiveCategory(WORK_CATEGORY_ALL_KEY);
    }
  }, [activeCategory, categories]);

  const filteredItems = useMemo(
    () => (showFilter ? filterWorkItemsByCategory(items, activeCategory) : items),
    [activeCategory, items, showFilter]
  );

  const groups = useMemo(
    () =>
      showGroups
        ? groupWorkItemsByCategory(filteredItems, presentation.categoryUncategorizedLabel)
        : [{ key: WORK_CATEGORY_ALL_KEY, label: '', items: filteredItems }],
    [filteredItems, presentation.categoryUncategorizedLabel, showGroups]
  );

  const filterBar =
    showFilter ? (
      <div className={workCategoryBarAlignClass(presentation.cardAlignment)}>
      <nav
        className={workCategoryNavClass(presentation.categoryDesign)}
        aria-label={t('Work categories')}
        style={
          presentation.categoryDesign === 'tabs'
            ? { backgroundColor: `${presentation.cardBorderColor}55` }
            : presentation.categoryDesign === 'underline'
              ? { borderColor: presentation.cardBorderColor }
              : undefined
        }
      >
        {[
          {
            key: WORK_CATEGORY_ALL_KEY,
            label: presentation.categoryAllLabel,
            count: items.length,
          },
          ...categories,
        ].map((category) => {
          const active = category.key === activeCategory;
          const activeInk = workContrastingInk(presentation.categoryActiveColor);
          return (
            <button
              key={category.key}
              type="button"
              onClick={() => setActiveCategory(category.key)}
              className={workCategoryChipClass(presentation.categoryDesign, active)}
              style={
                active
                  ? presentation.categoryDesign === 'pills'
                    ? {
                        // Actif = accent ; encre contrastée pour rester lisible clair / sombre.
                        backgroundColor: presentation.categoryActiveColor,
                        color: activeInk,
                        borderColor: presentation.categoryActiveColor,
                      }
                    : presentation.categoryDesign === 'tabs'
                      ? {
                          backgroundColor: presentation.categoryActiveColor,
                          color: activeInk,
                        }
                      : { color: presentation.categoryActiveColor }
                  : {
                      color: presentation.categoryMutedColor,
                      borderColor: presentation.cardBorderColor,
                      backgroundColor: 'transparent',
                      ['--work-cat-hover-bg' as string]: `${presentation.categoryActiveColor}29`,
                      ['--work-cat-hover-border' as string]: presentation.categoryActiveColor,
                      ['--work-cat-hover-text' as string]: presentation.categoryActiveColor,
                    }
              }
              aria-pressed={active}
            >
              {t(category.label)}
              <span className="ml-1.5 text-xs font-medium opacity-60">{category.count}</span>
            </button>
          );
        })}
      </nav>
      </div>
    ) : null;

  let motionIndex = 0;
  const galleryBlocks = groups.map((group) => {
    if (group.items.length === 0) return null;
    const block = (
      <WorkGalleryLayout
        key={group.key}
        items={group.items}
        presentation={presentation}
        motionProfile={motionProfile}
        startIndex={motionIndex}
        forceSingleColumn={forceSingleColumn}
      />
    );
    motionIndex += group.items.length;
    if (!showGroups || !group.label) return block;
    return (
      <div key={group.key} className="space-y-5">
        <div className="flex items-baseline justify-between gap-3">
          <h3
            className="text-sm font-bold uppercase tracking-[0.16em]"
            style={{ color: presentation.categoryActiveColor }}
          >
            {t(group.label)}
          </h3>
          <span className="text-xs font-medium" style={{ color: presentation.categoryMutedColor }}>
            {group.items.length}
          </span>
        </div>
        {block}
      </div>
    );
  });

  return (
    <div className="space-y-8">
      {filterBar}
      <div className={showGroups ? 'space-y-10' : undefined}>{galleryBlocks}</div>
    </div>
  );
}

function WorkGalleryCarousel({
  items,
  presentation,
  motionProfile,
  startIndex = 0,
}: {
  items: MarketplaceContentItem[];
  presentation: PortfolioWorkPresentationSettings;
  motionProfile: PortfolioGlobalMotionProfile;
  startIndex?: number;
}) {
  const t = useT();
  const [activeIndex, setActiveIndex] = useState(0);
  const cardZoneRef = useRef<HTMLDivElement>(null);
  const wheelLockRef = useRef(false);
  const itemsLengthRef = useRef(items.length);
  itemsLengthRef.current = items.length;
  const itemSignature = items.map((item) => item.id).join('|');

  useEffect(() => {
    setActiveIndex(0);
  }, [itemSignature]);

  useEffect(() => {
    if (items.length === 0) return;
    setActiveIndex((current) => Math.min(current, items.length - 1));
  }, [items.length]);

  /** Hover on the card: block page scroll and map wheel to prev/next project. */
  useEffect(() => {
    const el = cardZoneRef.current;
    if (!el) return;

    const onWheel = (event: WheelEvent) => {
      if (itemsLengthRef.current <= 1) return;

      const delta =
        Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
      if (Math.abs(delta) < 6) return;

      event.preventDefault();
      event.stopPropagation();

      if (wheelLockRef.current) return;
      wheelLockRef.current = true;

      if (delta > 0) {
        setActiveIndex((current) => (current + 1) % itemsLengthRef.current);
      } else {
        setActiveIndex(
          (current) => (current - 1 + itemsLengthRef.current) % itemsLengthRef.current
        );
      }

      window.setTimeout(() => {
        wheelLockRef.current = false;
      }, 450);
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  const carouselPresentation: PortfolioWorkPresentationSettings = {
    ...presentation,
    cardDesign:
      presentation.cardDesign === 'compact' || presentation.cardDesign === 'overlay'
        ? 'editorial'
        : presentation.cardDesign,
  };

  const canNavigate = items.length > 1;
  const safeIndex = items.length === 0 ? 0 : Math.min(activeIndex, items.length - 1);
  const activeItem = items[safeIndex] ?? null;

  /** Next projects only — max 2 peeks, large screens only (rendered below). */
  const peekItems = useMemo(() => {
    if (items.length <= 1) return [] as { item: MarketplaceContentItem; index: number }[];
    const peeks: { item: MarketplaceContentItem; index: number }[] = [];
    for (let step = 1; step < items.length && peeks.length < 2; step += 1) {
      const index = (safeIndex + step) % items.length;
      const item = items[index];
      if (!item) continue;
      peeks.push({ item, index });
    }
    return peeks;
  }, [items, safeIndex]);

  const goPrev = () => {
    if (!canNavigate) return;
    setActiveIndex((current) => (current - 1 + items.length) % items.length);
  };

  const goNext = () => {
    if (!canNavigate) return;
    setActiveIndex((current) => (current + 1) % items.length);
  };

  const accent = presentation.ctaColor || presentation.categoryActiveColor || '#e2572e';
  const border = presentation.cardBorderColor || '#e5e5e5';
  const surface = presentation.sectionBackgroundColor || '#ffffff';

  if (!activeItem) return null;

  const navButtonClassName =
    'group flex h-12 w-12 shrink-0 items-center justify-center rounded-full border transition enabled:hover:shadow-md disabled:cursor-default disabled:opacity-35 sm:h-16 sm:w-16 lg:h-[4.5rem] lg:w-[4.5rem]';
  const navButtonStyle = {
    borderColor: border,
    backgroundColor: surface,
    color: accent,
  } as const;

  const prevButton = (placement: 'side' | 'bottom') => (
    <button
      type="button"
      onClick={goPrev}
      disabled={!canNavigate}
      aria-label={t('Projet précédent')}
      className={`${navButtonClassName} ${
        placement === 'side'
          ? 'hidden enabled:hover:-translate-x-0.5 sm:flex'
          : 'enabled:hover:-translate-x-0.5'
      }`}
      data-pf-no-color-transition=""
      style={navButtonStyle}
    >
      <WorkChevronIcon
        className={`rotate-90 ${placement === 'side' ? 'h-7 w-7 sm:h-8 sm:w-8' : 'h-6 w-6'}`}
        style={{ color: accent }}
      />
    </button>
  );

  const nextButton = (placement: 'side' | 'bottom') => (
    <button
      type="button"
      onClick={goNext}
      disabled={!canNavigate}
      aria-label={t('Projet suivant')}
      className={`${navButtonClassName} ${
        placement === 'side'
          ? 'hidden enabled:hover:translate-x-0.5 sm:flex'
          : 'enabled:hover:translate-x-0.5'
      }`}
      data-pf-no-color-transition=""
      style={navButtonStyle}
    >
      <WorkChevronIcon
        className={`-rotate-90 ${placement === 'side' ? 'h-7 w-7 sm:h-8 sm:w-8' : 'h-6 w-6'}`}
        style={{ color: accent }}
      />
    </button>
  );

  return (
    <div
      className="w-full outline-hidden"
      tabIndex={0}
      role="region"
      aria-roledescription="carousel"
      aria-label={t('Portfolio projects')}
      onKeyDown={(event) => {
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          goPrev();
        } else if (event.key === 'ArrowRight') {
          event.preventDefault();
          goNext();
        }
      }}
    >
      <div className="flex w-full flex-col items-stretch">
        <div className="flex w-full items-center justify-center gap-2 sm:gap-4 lg:gap-6">
          {prevButton('side')}

          <div className="relative min-w-0 flex-1">
            <div
              ref={cardZoneRef}
              className={`mx-auto w-full overscroll-contain ${workCardMaxWidthClass(presentation.cardMaxWidth)} ${
                presentation.cardMaxWidth !== 'full'
                  ? presentation.cardAlignment === 'right'
                    ? 'ml-auto'
                    : presentation.cardAlignment === 'left'
                      ? 'mr-auto'
                      : 'mx-auto'
                  : ''
              }`.trim()}
            >
              <PortfolioMotionItem
                profile={motionProfile}
                index={startIndex}
                className="w-full min-w-0"
              >
                <div className="w-full min-w-0">
                  {items[safeIndex] ? (
                    <EditorialWorkCard
                      key={items[safeIndex].id}
                      item={items[safeIndex]}
                      presentation={carouselPresentation}
                    />
                  ) : null}
                </div>
              </PortfolioMotionItem>
            </div>
            {peekItems.length > 0 ? (
              <div
                className="mt-2.5 hidden justify-end gap-1.5 lg:flex"
                aria-label={t('Aperçus des autres projets')}
              >
                {peekItems.map(({ item, index }) => {
                  const title = item.title?.trim() || t('Projet');
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveIndex(index)}
                      title={title}
                      aria-label={t('Afficher {title}', { title })}
                      className="relative h-10 w-8 shrink-0 overflow-hidden rounded-md border transition hover:opacity-100 hover:shadow-xs focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2"
                      data-pf-no-color-transition=""
                      style={{
                        borderColor: border,
                        backgroundColor: surface,
                        opacity: 0.72,
                        ['--tw-outline-color' as string]: accent,
                      }}
                    >
                      {item.mediaUrl ? (
                        <ProductThumbnailMedia
                          url={item.mediaUrl}
                          alt=""
                          fit="cover"
                          className="h-full w-full"
                        />
                      ) : (
                        <span
                          className="flex h-full w-full items-center justify-center px-0.5 text-center text-[7px] font-bold uppercase leading-none tracking-wide"
                          style={{ color: accent }}
                        >
                          {title.slice(0, 2)}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : null}
            {canNavigate ? (
              <div
                className="mt-3 hidden items-center justify-center gap-2 sm:flex"
                role="tablist"
                aria-label={t('Projets du carrousel')}
              >
                {items.map((item, index) => {
                  const active = index === safeIndex;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      aria-label={`Projet ${index + 1} sur ${items.length}`}
                      onClick={() => setActiveIndex(index)}
                      className={`rounded-full transition ${
                        active ? 'h-2 w-2 sm:h-2.5 sm:w-2.5' : 'h-1.5 w-1.5 sm:h-2 sm:w-2 opacity-45 hover:opacity-80'
                      }`}
                      data-pf-no-color-transition=""
                      style={{
                        backgroundColor: accent,
                      }}
                    />
                  );
                })}
              </div>
            ) : null}
          </div>

          {nextButton('side')}
        </div>

        {/* Mobile: arrows + dots at the bottom */}
        {canNavigate ? (
          <div className="mt-4 flex items-center justify-center gap-4 sm:hidden">
            {prevButton('bottom')}
            <div
              className="flex items-center justify-center gap-2"
              role="tablist"
              aria-label={t('Projets du carrousel')}
            >
              {items.map((item, index) => {
                const active = index === safeIndex;
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    aria-label={`Projet ${index + 1} sur ${items.length}`}
                    onClick={() => setActiveIndex(index)}
                    className={`rounded-full transition ${
                      active ? 'h-2 w-2' : 'h-1.5 w-1.5 opacity-45 hover:opacity-80'
                    }`}
                    data-pf-no-color-transition=""
                    style={{
                      backgroundColor: accent,
                    }}
                  />
                );
              })}
            </div>
            {nextButton('bottom')}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function WorkGalleryLayout({
  items,
  presentation,
  motionProfile,
  startIndex = 0,
  forceSingleColumn = false,
}: {
  items: MarketplaceContentItem[];
  presentation: PortfolioWorkPresentationSettings;
  motionProfile: PortfolioGlobalMotionProfile;
  startIndex?: number;
  forceSingleColumn?: boolean;
}) {
  const gapClass = workCardGapClass(presentation.cardGap);
  const itemsPerRow = forceSingleColumn
    ? 1
    : resolveWorkItemsPerRow(presentation.galleryLayout, presentation.itemsPerRow);
  const widthJustify = workCardMaxWidthJustifyClass(
    presentation.cardMaxWidth,
    presentation.cardAlignment
  );
  const widthFlexAlign = workCardMaxWidthFlexAlignClass(
    presentation.cardMaxWidth,
    presentation.cardAlignment
  );
  const multiColClass = `${workItemsPerRowGridClass(itemsPerRow, presentation.cardGap)} ${widthJustify}`.trim();

  if (presentation.galleryLayout === 'carousel') {
    return (
      <WorkGalleryCarousel
        items={items}
        presentation={presentation}
        motionProfile={motionProfile}
        startIndex={startIndex}
      />
    );
  }

  if (presentation.galleryLayout === 'list') {
    return (
      <div className={`flex flex-col ${gapClass} ${widthFlexAlign}`.trim()}>
        {items.map((item, index) => (
          <PortfolioMotionItem key={item.id} profile={motionProfile} index={startIndex + index}>
            <EditorialWorkListCard item={item} presentation={presentation} />
          </PortfolioMotionItem>
        ))}
      </div>
    );
  }

  if (presentation.galleryLayout === 'accordion') {
    return (
      <div className={`flex flex-col ${gapClass} ${widthFlexAlign}`.trim()}>
        {items.map((item, index) => (
          <PortfolioMotionItem key={item.id} profile={motionProfile} index={startIndex + index}>
            <EditorialWorkAccordionRow
              item={item}
              presentation={presentation}
              defaultOpen={startIndex + index === 0}
            />
          </PortfolioMotionItem>
        ))}
      </div>
    );
  }

  if (presentation.galleryLayout === 'grid') {
    const gridPresentation: PortfolioWorkPresentationSettings = {
      ...presentation,
      cardDesign: 'compact',
    };
    const gridClass =
      `${workItemsPerRowGridClass(itemsPerRow, workCompactGalleryGap(presentation.cardGap))} ${widthJustify}`.trim();
    return (
      <div className={gridClass}>
        {items.map((item, index) => (
          <PortfolioMotionItem
            key={item.id}
            profile={motionProfile}
            index={startIndex + index}
            className="h-full min-w-0"
          >
            <EditorialWorkCard item={item} presentation={gridPresentation} />
          </PortfolioMotionItem>
        ))}
      </div>
    );
  }

  if (presentation.galleryLayout === 'overlay') {
    const overlayPresentation: PortfolioWorkPresentationSettings = {
      ...presentation,
      cardDesign: 'overlay',
      // Keep Media placement (top/bottom) — overlay chrome is always stacked.
    };
    return (
      <div className={multiColClass}>
        {items.map((item, index) => (
          <PortfolioMotionItem
            key={item.id}
            profile={motionProfile}
            index={startIndex + index}
            className="h-full min-w-0"
          >
            <EditorialWorkCard item={item} presentation={overlayPresentation} />
          </PortfolioMotionItem>
        ))}
      </div>
    );
  }

  // stack — Grille portfolio: roomy editorial cards (never compact tile density).
  // Multi-column: side-by-side media|copy squeezes — fall back to stacked top/bottom only.
  const stackPresentation: PortfolioWorkPresentationSettings = {
    ...presentation,
    cardDesign:
      presentation.cardDesign === 'compact' || presentation.cardDesign === 'overlay'
        ? 'editorial'
        : presentation.cardDesign,
    ...(itemsPerRow > 1 &&
    (presentation.contentPlacement === 'side' ||
      presentation.contentPlacement === 'side-reverse')
      ? { contentPlacement: 'bottom' as const }
      : null),
  };

  if (itemsPerRow <= 1) {
    return (
      <div className={`flex flex-col ${gapClass} ${widthFlexAlign}`.trim()}>
        {items.map((item, index) => (
          <PortfolioMotionItem key={item.id} profile={motionProfile} index={startIndex + index}>
            <EditorialWorkCard item={item} presentation={stackPresentation} />
          </PortfolioMotionItem>
        ))}
      </div>
    );
  }

  return (
    <div className={multiColClass}>
      {items.map((item, index) => (
        <PortfolioMotionItem
          key={item.id}
          profile={motionProfile}
          index={startIndex + index}
          className="h-full min-w-0"
        >
          <EditorialWorkCard item={item} presentation={stackPresentation} />
        </PortfolioMotionItem>
      ))}
    </div>
  );
}

function EditorialWorkToolsList({
  tools,
  className = '',
  textStyle,
  accentColor,
}: {
  tools: string[];
  className?: string;
  textStyle?: PortfolioElementTextStyle;
  accentColor?: string;
}) {
  if (tools.length === 0) return null;
  const accent = accentColor || '#ea580c';

  return (
    <ul className={`space-y-3 ${className}`.trim()}>
      {tools.map((tool) => (
        <li
          key={tool}
          className={`flex items-start gap-3.5 leading-relaxed ${
            textStyle ? elementTextStyleClass(textStyle, 'body') : 'text-base font-medium text-neutral-700 sm:text-lg dark:text-neutral-200'
          }`}
          style={textStyle ? elementTextInlineStyle(textStyle) : undefined}
        >
          <span
            className="relative mt-1.5 flex h-4 w-4 shrink-0 items-center justify-center"
            aria-hidden
          >
            <span
              className="absolute inset-0 rounded-full border-2 opacity-90"
              style={{ borderColor: accent }}
            />
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{
                backgroundColor: accent,
                boxShadow: `0 0 0 2px ${accent}26`,
              }}
            />
          </span>
          <span>{tool}</span>
        </li>
      ))}
    </ul>
  );
}
