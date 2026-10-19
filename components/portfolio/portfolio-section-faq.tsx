'use client';

/**
 * FAQ list.
 * Split out of portfolio-section-primitives so the public portfolio only downloads the sections it
 * renders (each is loaded with next/dynamic by PublicCreatorPortfolioPage).
 */
import { trPlural } from '@/lib/i18n/active';
import { useEffect, useState, type CSSProperties } from 'react';
import type { FaqItem } from '@/types/profile';
import { PortfolioMotionItem } from '@/components/portfolio/PortfolioMotionItem';
import { PortfolioListMarker } from '@/components/portfolio/PortfolioListMarker';
import { resolveTaskListMarker } from '@/components/portfolio/portfolio-list-marker';
import { usePortfolioTaskListMarkerGlobal } from '@/components/portfolio/portfolio-task-list-marker-context';
import type { PortfolioGlobalMotionProfile } from '@/components/portfolio/portfolio-motion-settings';
import { DEFAULT_MOTION_PROFILE } from '@/components/portfolio/portfolio-motion-settings';
import { elementTextInlineStyle, elementTextStyleClass } from '@/components/portfolio/portfolio-element-text-style';
import { ServicesCardBackgroundLayers, ServicesCardForeground } from '@/components/portfolio/portfolio-services-card-background-layers';
import {
  DEFAULT_FAQ_PRESENTATION,
  faqAnswerBorderStyle,
  faqAnswerPaddingClass,
  faqContentAlignClass,
  faqExpandIconStyle,
  faqFrameClass,
  faqFrameStyle,
  faqIsCardDesign,
  faqItemAccentStyle,
  faqItemBorderCssVars,
  faqItemShellClass,
  faqListShellClass,
  faqSeparatedCardFrameClass,
  faqSummaryHorizontalPaddingClass,
  faqSummaryPaddingClass,
  type PortfolioFaqExpandIconStyle,
  type PortfolioFaqPresentationSettings,
} from '@/components/portfolio/portfolio-faq-settings';
import { FaqSectionIllustration } from '@/components/portfolio/FaqSectionIllustration';
import { useT } from '@/lib/i18n/I18nProvider';

function FaqPlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" d="M12 5v14M5 12h14" />
    </svg>
  );
}

function FaqChevronIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
    </svg>
  );
}

function FaqExpandIcon({
  style,
  className = 'h-4 w-4',
}: {
  style: PortfolioFaqExpandIconStyle;
  className?: string;
}) {
  return style === 'chevron' ? <FaqChevronIcon className={className} /> : <FaqPlusIcon className={className} />;
}

function EditorialFaqItem({
  item,
  index,
  isLast = false,
  presentation = DEFAULT_FAQ_PRESENTATION,
  exclusiveOpen = null,
  onExclusiveToggle,
}: {
  item: FaqItem;
  index: number;
  isLast?: boolean;
  presentation?: PortfolioFaqPresentationSettings;
  /** When exclusive accordion is on — controlled open id (null = all closed). */
  exclusiveOpen?: string | null;
  onExclusiveToggle?: (itemId: string, open: boolean) => void;
}) {
  const t = useT();
  const design = presentation.itemDesign;
  const plainExpandIcon = design === 'two-column';
  const isCard = faqIsCardDesign(design);
  const shellClass = faqItemShellClass(design, presentation.itemGap);
  const accentStyle = faqItemAccentStyle(design, presentation.accentColor);
  const accent = presentation.accentColor;
  const expandFill = presentation.cardBackgroundColor;
  const iconStyles = faqExpandIconStyle(presentation.expandIconColor, presentation.accentColor, {
    fill: expandFill,
    border: presentation.cardBorderColor,
  });
  const summaryPadding = faqSummaryPaddingClass(design, presentation.cardPadding);
  const iconRotateClass =
    presentation.expandIconStyle === 'chevron'
      ? 'group-data-[open=true]:rotate-180'
      : 'group-data-[open=true]:rotate-45';

  const questionTextStyle = {
    ...presentation.elementStyles.question,
    ...(design === 'two-column' ? { weight: 'semibold' as const, bold: false } : {}),
  };
  const questionClass = `min-w-0 flex-1 leading-snug transition-colors duration-300 ${elementTextStyleClass(questionTextStyle, 'body')}`;
  const questionStyle = elementTextInlineStyle(questionTextStyle);
  const answerClass = `whitespace-pre-line leading-relaxed ${elementTextStyleClass(presentation.elementStyles.answer, 'body')}`;
  const answerStyle = elementTextInlineStyle(presentation.elementStyles.answer);
  const align = faqContentAlignClass(presentation.itemAlign);

  const taskListBulletGlobal = usePortfolioTaskListMarkerGlobal();
  const itemMarker = resolveTaskListMarker(
    taskListBulletGlobal,
    {
      taskBulletSource: presentation.itemMarkerSource ?? 'section',
      taskBulletStyle: presentation.itemMarkerStyle ?? 'number',
      taskBulletColor:
        presentation.itemMarkerColor ||
        presentation.numberColor ||
        presentation.elementStyles.number.color ||
        accent,
      taskBulletSize: presentation.itemMarkerSize ?? 'sm',
      taskBulletSizePx: presentation.itemMarkerSizePx,
      taskBulletWeight: presentation.itemMarkerWeight ?? 'regular',
      taskBulletWeightAmount: presentation.itemMarkerWeightAmount,
    },
    presentation.numberColor || accent
  );
  const showItemMarker =
    presentation.showItemNumbers && itemMarker.style !== 'none' && design !== 'numbered-rail';
  const showRailMarker = presentation.showItemNumbers && itemMarker.style !== 'none';

  const showInlineNumber = showItemMarker;
  const isRaised = design === 'raised';
  const showQPrefix = isRaised && presentation.showItemNumbers;
  const expandable = presentation.expandable !== false;
  const exclusive = expandable && Boolean(onExclusiveToggle);
  const [localOpen, setLocalOpen] = useState(false);
  const isOpen = !expandable ? true : exclusive ? exclusiveOpen === item.id : localOpen;
  const openFill = design === 'two-column' && isOpen;
  const openQuestionColor = openFill ? '#ffffff' : undefined;
  const flushAnswers = presentation.answerFlushWithQuestion === true || isRaised;
  const answerPadding = faqAnswerPaddingClass(
    design,
    presentation.cardPadding,
    showInlineNumber || showQPrefix,
    flushAnswers
  );

  const itemMarkerNode = showQPrefix ? (
    <span
      className="mt-0.5 shrink-0 text-[15px] font-bold leading-snug sm:text-base"
      style={{ color: presentation.numberColor || accent }}
      aria-hidden
    >
      {t('Q.')}
    </span>
  ) : (
    <span className="mt-1 flex w-8 shrink-0 justify-center" style={{ color: itemMarker.color }}>
      <PortfolioListMarker
        style={itemMarker.style}
        color={itemMarker.color}
        index={index}
        size={itemMarker.size}
        sizePx={itemMarker.sizePx}
        weight={itemMarker.weight}
        weightAmount={itemMarker.weightAmount}
      />
    </span>
  );

  const questionRowClass = `flex w-full list-none items-start gap-3 sm:gap-5 bg-transparent text-left text-inherit appearance-none border-0 ${summaryPadding} ${align.row} ${
    expandable ? 'cursor-pointer' : 'cursor-default'
  }`;

  const expandIcon = expandable && presentation.showExpandIcon ? (
    <span
      className={
        plainExpandIcon
          ? `mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center text-neutral-400 transition duration-200 ${iconRotateClass}`
          : `mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border shadow-xs transition duration-200 sm:h-9 sm:w-9 ${iconRotateClass} group-data-[open=true]:border-[color:var(--faq-expand-open-border)] group-data-[open=true]:bg-[color:var(--faq-expand-open-bg)] group-data-[open=true]:text-[color:var(--faq-expand-open-color)]`
      }
      style={
        plainExpandIcon
          ? { color: openFill ? '#ffffff' : presentation.expandIconColor }
          : {
              ...iconStyles.base,
              ['--faq-expand-open-bg' as string]: String(iconStyles.open.backgroundColor ?? ''),
              ['--faq-expand-open-border' as string]: String(iconStyles.open.borderColor ?? ''),
              ['--faq-expand-open-color' as string]: String(iconStyles.open.color ?? ''),
            }
      }
      aria-hidden
    >
      <FaqExpandIcon
        style={presentation.expandIconStyle}
        className={plainExpandIcon ? 'h-5 w-5' : 'h-4 w-4'}
      />
    </span>
  ) : null;

  const answerPanel = flushAnswers ? (
    <div
      className={`flex items-start gap-3 sm:gap-5 ${answerPadding} ${faqSummaryHorizontalPaddingClass(
        design,
        presentation.cardPadding
      )} ${align.row}`}
    >
      {showQPrefix ? (
        <span
          className="invisible shrink-0 text-[15px] font-bold leading-snug sm:text-base"
          aria-hidden
        >
          {t('Q.')}
        </span>
      ) : showInlineNumber ? (
        <span className="w-8 shrink-0" aria-hidden />
      ) : null}
      <div className="min-w-0 flex-1">
        <div
          className={presentation.showAnswerAccentBorder ? 'border-l-2' : ''}
          style={
            presentation.showAnswerAccentBorder
              ? faqAnswerBorderStyle(presentation.answerAccentBorderColor)
              : undefined
          }
        >
          <p className={`${answerClass} ${align.text}`} style={openFill ? { ...answerStyle, color: 'rgba(255,255,255,0.92)' } : answerStyle}>
            {item.answer}
          </p>
        </div>
      </div>
      {expandable && presentation.showExpandIcon ? (
        <span className={plainExpandIcon ? 'h-8 w-8 shrink-0' : 'h-10 w-10 shrink-0 sm:h-9 sm:w-9'} aria-hidden />
      ) : null}
    </div>
  ) : (
    <div className={answerPadding}>
      <div
        className={`pl-3 sm:pl-6 ${presentation.showAnswerAccentBorder ? 'border-l-2' : ''}`}
        style={
          presentation.showAnswerAccentBorder
            ? faqAnswerBorderStyle(presentation.answerAccentBorderColor)
            : undefined
        }
      >
        <p
          className={`${answerClass} ${align.text}`}
          style={openFill ? { ...answerStyle, color: 'rgba(255,255,255,0.92)' } : answerStyle}
        >
          {item.answer}
        </p>
      </div>
    </div>
  );

  const toggleOpen = () => {
    if (!expandable) return;
    if (exclusive) {
      onExclusiveToggle?.(item.id, !isOpen);
      return;
    }
    setLocalOpen((open) => !open);
  };

  const details = (
    <div
      className={`group ${!isCard && design !== 'numbered-rail' ? shellClass : ''}`}
      style={{ ['--faq-accent' as string]: accent }}
      data-open={isOpen ? 'true' : 'false'}
      data-faq-card={!isCard ? item.id : undefined}
    >
      {expandable ? (
        <button type="button" className={questionRowClass} aria-expanded={isOpen} onClick={toggleOpen}>
          {showItemMarker || showQPrefix ? itemMarkerNode : null}
          <span className={`${questionClass} ${align.text}`} style={openQuestionColor ? { ...questionStyle, color: openQuestionColor } : questionStyle}>
            {item.question}
          </span>
          {expandIcon}
        </button>
      ) : (
        <div className={questionRowClass}>
          {showItemMarker || showQPrefix ? itemMarkerNode : null}
          <span className={`${questionClass} ${align.text}`} style={openQuestionColor ? { ...questionStyle, color: openQuestionColor } : questionStyle}>
            {item.question}
          </span>
        </div>
      )}
      {expandable ? (
        <div className="pf-faq-answer-fold" data-open={isOpen ? 'true' : 'false'}>
          <div className="pf-faq-answer-fold-inner">{answerPanel}</div>
        </div>
      ) : (
        answerPanel
      )}
    </div>
  );

  if (design === 'numbered-rail') {
    const railFill = presentation.cardBackgroundColor;
    return (
      <article className="grid grid-cols-[2.5rem_minmax(0,1fr)] items-start gap-x-3 sm:grid-cols-[4rem_minmax(0,1fr)] sm:gap-x-4">
        <div className="relative flex h-full min-h-[4.5rem] flex-col items-center">
          {!isLast ? (
            <div
              className="absolute bottom-0 top-10 w-px"
              style={{ backgroundColor: presentation.cardBorderColor }}
              aria-hidden
            />
          ) : null}
          {showRailMarker ? (
            itemMarker.style === 'number' || itemMarker.style === 'roman' ? (
              <div
                className="relative z-[1] flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2"
                style={{
                  borderColor: itemMarker.color,
                  color: itemMarker.color,
                  backgroundColor: railFill,
                }}
              >
                <PortfolioListMarker
                  style={itemMarker.style}
                  color={itemMarker.color}
                  index={index}
                  size={itemMarker.size}
                  sizePx={itemMarker.sizePx}
                  weight={itemMarker.weight}
                  weightAmount={itemMarker.weightAmount}
                />
              </div>
            ) : (
              <div className="relative z-[1] mt-1 flex shrink-0 items-center justify-center" style={{ color: itemMarker.color }}>
                <PortfolioListMarker
                  style={itemMarker.style}
                  color={itemMarker.color}
                  index={index}
                  size={itemMarker.size}
                  sizePx={itemMarker.sizePx}
                  weight={itemMarker.weight}
                  weightAmount={itemMarker.weightAmount}
                />
              </div>
            )
          ) : (
            <div
              className="relative z-[1] mt-1 h-3.5 w-3.5 shrink-0 rounded-full border-2"
              style={{ borderColor: accent, backgroundColor: railFill }}
              aria-hidden
            />
          )}
        </div>
        <div className="min-w-0 pb-4">{details}</div>
      </article>
    );
  }

  if (isCard) {
    const openCardStyle: CSSProperties = openFill
      ? {
          backgroundColor: accent,
          borderTopColor: accent,
          borderRightColor: accent,
          borderBottomColor: accent,
          borderLeftColor: accent,
          boxShadow: '0 16px 36px -16px rgba(15, 23, 42, 0.35)',
        }
      : {};
    return (
      <div
        className={faqSeparatedCardFrameClass(presentation, design)}
        data-faq-card={item.id}
        style={{ ...faqFrameStyle(presentation, design), ...accentStyle, ...openCardStyle }}
      >
        {openFill ? null : <ServicesCardBackgroundLayers presentation={presentation} />}
        <ServicesCardForeground>{details}</ServicesCardForeground>
      </div>
    );
  }

  return details;
}

export function EditorialFaqList({
  items,
  presentation = DEFAULT_FAQ_PRESENTATION,
  motionProfile = DEFAULT_MOTION_PROFILE,
  askCtaHref = '#contact',
  askCtaLabel = 'Ask a question',
  updatedLabel,
}: {
  items: FaqItem[];
  presentation?: PortfolioFaqPresentationSettings;
  motionProfile?: PortfolioGlobalMotionProfile;
  askCtaHref?: string;
  askCtaLabel?: string;
  updatedLabel?: string | null;
}) {
  const [exclusiveOpenId, setExclusiveOpenId] = useState<string | null>(null);
  const exclusive = presentation.expandable !== false && presentation.accordionExclusive === true;

  useEffect(() => {
    if (!exclusive || !exclusiveOpenId) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest(`[data-faq-card="${CSS.escape(exclusiveOpenId)}"]`)) return;
      setExclusiveOpenId(null);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [exclusive, exclusiveOpenId]);
  const illustrationVariant = presentation.illustrationVariant ?? 'none';
  const showIllustration = illustrationVariant !== 'none';
  const illustrationPlacement = presentation.illustrationPlacement ?? 'right';
  const isRaised = presentation.itemDesign === 'raised';
  const accent = presentation.accentColor || '#f97316';

  const handleExclusiveToggle = (itemId: string, open: boolean) => {
    setExclusiveOpenId((current) => {
      if (open) return itemId;
      return current === itemId ? null : current;
    });
  };

  if (items.length === 0) return null;

  const itemBorderVars = faqItemBorderCssVars(presentation.cardBorderColor);
  const separatedCards = faqIsCardDesign(presentation.itemDesign);

  const list = (
    <div
      className={faqListShellClass(presentation.itemDesign, presentation.itemGap)}
      style={itemBorderVars}
    >
      {items.map((item, index) => (
        <PortfolioMotionItem key={item.id} profile={motionProfile} index={index}>
          <EditorialFaqItem
            item={item}
            index={index}
            isLast={index === items.length - 1}
            presentation={presentation}
            exclusiveOpen={exclusive ? exclusiveOpenId : null}
            onExclusiveToggle={exclusive ? handleExclusiveToggle : undefined}
          />
        </PortfolioMotionItem>
      ))}
    </div>
  );

  const footer = isRaised ? (
    <div className="mt-10 flex flex-col gap-5 border-t border-neutral-200/80 pt-6 sm:flex-row sm:items-center sm:justify-between dark:border-white/[0.08]">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-neutral-500 dark:text-neutral-400">
        <span className="inline-flex items-center gap-1.5">
          <span style={{ color: accent }} aria-hidden>
            ✦
          </span>
          {items.length} {trPlural(items.length, 'question', 'questions')}
        </span>
        {updatedLabel ? (
          <span className="inline-flex items-center gap-1.5">
            <span style={{ color: accent }} aria-hidden>
              ✦
            </span>
            {updatedLabel}
          </span>
        ) : null}
      </div>
      {askCtaHref ? (
        <a
          href={askCtaHref}
          className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_-10px_rgba(249,115,22,0.7)] transition hover:brightness-105"
          data-pf-no-color-transition=""
          style={{ backgroundColor: accent }}
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          {askCtaLabel}
        </a>
      ) : null}
    </div>
  ) : null;

  const framedList = separatedCards ? (
    <>
      {list}
      {footer}
    </>
  ) : (
    <div className={`${faqFrameClass(presentation)} relative overflow-x-hidden`} style={faqFrameStyle(presentation)}>
      <ServicesCardBackgroundLayers presentation={presentation} />
      <ServicesCardForeground>
        {list}
        {footer}
      </ServicesCardForeground>
    </div>
  );

  if (!showIllustration) return framedList;

  const illustration = (
    <div
      className="flex items-center justify-center"
      style={{
        ['--faq-accent' as string]: presentation.accentColor,
        ['--faq-ink' as string]: presentation.titleColor || presentation.questionColor,
        ['--faq-surface' as string]: presentation.cardBackgroundColor,
      }}
    >
      <FaqSectionIllustration variant={illustrationVariant} />
    </div>
  );

  return (
    <div
      className={`grid w-full items-center gap-8 lg:gap-12 ${
        illustrationPlacement === 'left'
          ? 'lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.35fr)]'
          : 'lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.9fr)]'
      }`}
    >
      {illustrationPlacement === 'left' ? (
        <>
          {illustration}
          <div className="min-w-0">{framedList}</div>
        </>
      ) : (
        <>
          <div className="min-w-0">{framedList}</div>
          {illustration}
        </>
      )}
    </div>
  );
}
