'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from 'framer-motion';
import { aboutBannerScrollParent, aboutBannerWatchEnter } from '@/components/portfolio/portfolio-about-scroll-utils';
import { elementTextSizeClass, resolveElementTextSizePx, resolveElementTextWeightAmount, type PortfolioElementTextStyle } from '@/components/portfolio/portfolio-element-text-style';
import { type ProfileEducationEntry } from '@/types/profile';
import { infoContentBodySizeClass, infoContentEducationMetaSizeClass, infoContentLabelSizeClass, manifestoStatementSecondarySizeClass, type PortfolioInfoPremiumFontSize, type PortfolioInfoBlockLabelColor, infoBlockLabelColor, type PortfolioInfoAboutManifestoBlocksLayout, type PortfolioInfoAboutManifestoPortraitFrame } from '@/components/portfolio/portfolio-info-settings';
import { resolveSpokenLanguageLevelLabel } from '@/lib/spoken-languages';
import { skillEntryLabels, type ProfileSkillEntry } from '@/lib/about-skills';
import { mediaImageResponsive } from '@/lib/media-image-url';
import { useT } from '@/lib/i18n/I18nProvider';
import { ABOUT_MEDIA_WIDTHS, ABOUT_MEDIA_SIZES, type LanguageDisplayItem } from '@/components/portfolio/EditorialAboutMeCommon';
import { ABOUT_CLASSIC_SERIF, aboutClassicLanguageCode } from '@/components/portfolio/EditorialAboutMeClassicLayout';

/** Vertical rhythm between manifesto folio blocks. */
const MANIFESTO_BLOCK_SPACING = 'mt-14 sm:mt-16 lg:mt-20';

const ABOUT_MANIFESTO_SERIF = ABOUT_CLASSIC_SERIF;

function manifestoBlockCellClass(
  index: number,
  layout: PortfolioInfoAboutManifestoBlocksLayout
): string {
  if (layout === 'zigzag') {
    const even = index % 2 === 0;
    const side = even
      ? 'lg:justify-self-start lg:mr-auto'
      : 'lg:justify-self-end lg:ml-auto';
    const width = even
      ? 'lg:max-w-[min(100%,46rem)]'
      : 'lg:max-w-[min(100%,34rem)]';
    const shift = even ? '' : 'lg:mt-3';
    return `min-w-0 w-full ${width} ${side} ${shift}`.trim();
  }

  const gridSlots = [
    'lg:col-span-7 lg:pr-[min(8%,2.25rem)]',
    'lg:col-span-5 lg:mt-14',
    'lg:col-span-5 lg:mt-2',
    'lg:col-span-7 lg:mt-10 lg:pl-[min(6%,1.75rem)]',
  ];
  return `min-w-0 ${gridSlots[index % gridSlots.length]}`;
}

export function getManifestoScrollParent(el: HTMLElement | null): HTMLElement | null {
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

function useManifestoBlocksScrollFocus(enabled: boolean, blockCount: number) {
  const blockRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [focusedIndex, setFocusedIndex] = useState(0);

  const setBlockRef = useCallback(
    (index: number) => (el: HTMLDivElement | null) => {
      blockRefs.current[index] = el;
    },
    []
  );

  useEffect(() => {
    if (!enabled || blockCount <= 1) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: client-only state after hydration
      setFocusedIndex(0);
      return;
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const refs = blockRefs.current.slice(0, blockCount).filter(Boolean) as HTMLDivElement[];
      if (refs.length === 0) return;

      const scrollRoot = getManifestoScrollParent(refs[0]);
      const centerY = scrollRoot
        ? (() => {
            const rootRect = scrollRoot.getBoundingClientRect();
            return rootRect.top + rootRect.height / 2;
          })()
        : window.innerHeight / 2;

      let bestIndex = 0;
      let bestDistance = Infinity;
      refs.forEach((el, index) => {
        const rect = el.getBoundingClientRect();
        const blockCenter = rect.top + rect.height / 2;
        const distance = Math.abs(blockCenter - centerY);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestIndex = index;
        }
      });

      setFocusedIndex((prev) => (prev === bestIndex ? prev : bestIndex));
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    const scrollRoot = getManifestoScrollParent(blockRefs.current[0]);
    const scrollTarget: HTMLElement | Window = scrollRoot ?? window;
    scrollTarget.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      scrollTarget.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [enabled, blockCount]);

  return { setBlockRef, focusedIndex };
}

function manifestoBlockFocusClass(isFocused: boolean, scrollFocus: boolean): string {
  if (!scrollFocus) return '';
  return isFocused
    ? 'opacity-100 blur-none'
    : 'opacity-[0.7]';
}

function manifestoPadIndex(index: number): string {
  return String(index + 1).padStart(2, '0');
}

function manifestoMonogramLetters(fullName?: string | null): string {
  const parts = (fullName ?? '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  const take = Math.min(parts.length, 3);
  return parts
    .slice(0, take)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

/** Drop a repeated 3+ word lead on consecutive skills (01/02 "Designing and building…"). */
function manifestoCollapseSkillLeads(labels: string[]): string[] {
  return labels.map((label, index, all) => {
    if (index === 0) return label;
    const prevWords = all[index - 1].split(/\s+/).filter(Boolean);
    const words = label.split(/\s+/).filter(Boolean);
    let shared = 0;
    while (
      shared < prevWords.length &&
      shared < words.length - 1 &&
      prevWords[shared].toLowerCase() === words[shared].toLowerCase()
    ) {
      shared += 1;
    }
    if (shared < 3) return label;
    return words.slice(shared).join(' ');
  });
}

const MANIFESTO_BLOCK_FOCUS_TRANSITION =
  'transition-[filter,opacity] duration-500 ease-out will-change-[filter,opacity]';

/** Manifesto — vertical education index; scales cleanly with multiple entries. */
function ManifestoEducationList({
  entries,
  accent,
  labelColor,
  subtitleColor,
  bodyColor,
  contentSize,
  includeLabel = true,
}: {
  entries: ProfileEducationEntry[];
  accent: string;
  labelColor?: string;
  subtitleColor: string;
  bodyColor: string;
  cardBorder: string;
  contentSize: PortfolioInfoPremiumFontSize;
  includeLabel?: boolean;
}) {
  const t = useT();
  const visible = entries.filter(
    (entry) => entry.title?.trim() || entry.institution?.trim() || entry.schoolYear?.trim()
  );
  if (visible.length === 0) return null;

  const metaClass = infoContentEducationMetaSizeClass(contentSize);
  const titleClass = infoContentBodySizeClass(contentSize);
  const bodyClass = infoContentBodySizeClass(contentSize);

  return (
    <div>
      {includeLabel ? (
        <ManifestoSectionLabel color={labelColor} contentSize={contentSize}>
        {t('Education')}
        </ManifestoSectionLabel>
      ) : null}
      <ol className={`pf-about-manifesto-edu ${includeLabel ? 'mt-5' : 'mt-0'}`}>
        {visible.map((entry, index) => {
          const year = entry.schoolYear?.trim() || '';
          const title = entry.title?.trim() || '';
          const institution = entry.institution?.trim() || '';
          const headline = title || institution;
          const subline = title && institution ? institution : '';

          return (
            <li
              key={entry.id || `${entry.title}-${entry.schoolYear}-${index}`}
              className="pf-about-manifesto-edu-row grid gap-x-6 gap-y-1 sm:grid-cols-[minmax(0,8.75rem)_1fr] sm:gap-x-10"
            >
              <span
                className={`pf-about-manifesto-edu-year tabular-nums tracking-[0.08em] sm:pt-0.5 ${metaClass}`}
                style={{ color: `color-mix(in srgb, ${accent} 58%, white)` }}
              >
                {year || '—'}
              </span>
              <div className="min-w-0">
                {headline ? (
                  <p
                    className={`pf-about-manifesto-edu-title font-medium leading-snug ${titleClass}`}
                    style={{ color: subtitleColor }}
                  >
                    {headline}
                  </p>
                ) : null}
                {subline ? (
                  <p
                    className={`pf-about-manifesto-edu-school mt-1 leading-relaxed ${bodyClass}`}
                    style={{ color: bodyColor }}
                  >
                    {subline}
                  </p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function ManifestoSectionLabel({
  children,
  accent,
  color,
  contentSize = 'medium',
}: {
  children: string;
  accent?: string;
  color?: string;
  contentSize?: PortfolioInfoPremiumFontSize;
}) {
  const labelClass = infoContentLabelSizeClass(contentSize);
  return (
    <p
      className={`pf-about-manifesto-label font-medium uppercase tracking-[0.22em] ${labelClass}`}
      style={{ color: color ?? accent }}
    >
      <span className="pf-about-manifesto-line-mask">
        <span className="pf-about-manifesto-line-shift">{children}</span>
      </span>
    </p>
  );
}

function ManifestoEditorialList({
  items,
  bodyColor: _bodyColor,
  bodySizeClass,
  numbered = false,
  quiet = false,
  indexColor,
}: {
  items: string[];
  bodyColor: string;
  bodySizeClass: string;
  numbered?: boolean;
  quiet?: boolean;
  indexColor?: string;
}) {
  return (
    <ul
      className={`pf-about-manifesto-list ${
        numbered ? 'pf-about-manifesto-list--indexed' : ''
      } ${quiet ? 'pf-about-manifesto-list--quiet' : ''}`}
    >
      {items.map((item, index) => (
        <li
          key={`${index}-${item}`}
          className={`pf-about-manifesto-item leading-relaxed ${bodySizeClass}`}
          style={{ color: 'var(--pf-about-manifesto-ink, inherit)' }}
        >
          <span className="pf-about-manifesto-line-mask">
            <span className="pf-about-manifesto-line-shift">
              {numbered ? (
                <span
                  className="pf-about-manifesto-item-index"
                  aria-hidden
                  style={indexColor ? { color: indexColor } : undefined}
                >
                  {manifestoPadIndex(index)}
                </span>
              ) : null}
              <span className="pf-about-manifesto-item-text">{item}</span>
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Skills + Strengths + Languages — one aligned index row. */
function ManifestoIndexGrid({
  skillLabels,
  strengthItems,
  languageItems,
  showSkills,
  showStrengths,
  showLanguages,
  labelColor,
  bodyColor,
  subtitleColor,
  contentSize,
  motionOff: _motionOff = false,
}: {
  skillLabels: string[];
  strengthItems: string[];
  languageItems: LanguageDisplayItem[];
  showSkills: boolean;
  showStrengths: boolean;
  showLanguages: boolean;
  labelColor?: string;
  bodyColor: string;
  subtitleColor: string;
  contentSize: PortfolioInfoPremiumFontSize;
  motionOff?: boolean;
}) {
  const t = useT();
  const showSkillsCol = showSkills && skillLabels.length > 0;
  const showStrengthsCol = showStrengths && strengthItems.length > 0;
  const showLangCol = showLanguages && languageItems.length > 0;
  if (!showSkillsCol && !showStrengthsCol && !showLangCol) return null;

  const bodySizeClass = infoContentBodySizeClass(contentSize);
  const langBodyClass = infoContentBodySizeClass(contentSize);
  const colCount = [showSkillsCol, showStrengthsCol, showLangCol].filter(Boolean).length;

  return (
    <div className="pf-about-manifesto-pair-grid" data-cols={colCount}>
      {showSkillsCol ? (
        <div className="pf-about-manifesto-col-shell min-h-0 h-full min-w-0" data-col="skills">
          <div className="pf-about-manifesto-col">
            <ManifestoSectionLabel color={labelColor} contentSize={contentSize}>
              {t('Skills')}
            </ManifestoSectionLabel>
            <ManifestoEditorialList
              items={skillLabels}
              bodyColor={bodyColor}
              bodySizeClass={bodySizeClass}
            />
          </div>
        </div>
      ) : null}
      {showStrengthsCol ? (
        <div className="pf-about-manifesto-col-shell min-h-0 h-full min-w-0" data-col="strengths">
          <div className="pf-about-manifesto-col">
            <ManifestoSectionLabel color={labelColor} contentSize={contentSize}>
              {t('Strengths')}
            </ManifestoSectionLabel>
            <ManifestoEditorialList
              items={strengthItems}
              bodyColor={bodyColor}
              bodySizeClass={bodySizeClass}
              quiet
            />
          </div>
        </div>
      ) : null}
      {showLangCol ? (
        <div className="pf-about-manifesto-col-shell min-h-0 h-full min-w-0" data-col="languages">
          <div className="pf-about-manifesto-col">
            <ManifestoSectionLabel color={labelColor} contentSize={contentSize}>
              {t('Languages')}
            </ManifestoSectionLabel>
            <ManifestoLanguageRail
              items={languageItems}
              codeColor={subtitleColor}
              bodySizeClass={langBodyClass}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ManifestoDetailsBlocks({
  blocks,
  blocksLayout,
  blocksScrollFocus,
}: {
  blocks: { key: string; node: ReactNode }[];
  blocksLayout: PortfolioInfoAboutManifestoBlocksLayout;
  blocksScrollFocus: boolean;
  motionOff?: boolean;
}) {
  const scrollFocusActive = blocksScrollFocus && blocks.length > 1;
  const { setBlockRef, focusedIndex } = useManifestoBlocksScrollFocus(
    scrollFocusActive,
    blocks.length
  );

  const renderBlock = (block: { key: string; node: ReactNode }, index: number) => (
    <div
      key={block.key}
      ref={scrollFocusActive ? setBlockRef(index) : undefined}
      className={`pf-about-manifesto-block ${manifestoBlockCellClass(index, blocksLayout)} ${
        scrollFocusActive ? MANIFESTO_BLOCK_FOCUS_TRANSITION : ''
      } ${manifestoBlockFocusClass(focusedIndex === index, scrollFocusActive)}`}
    >
      {block.node}
    </div>
  );

  if (blocksLayout === 'grid') {
    return (
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-start lg:gap-x-10 lg:gap-y-16 xl:gap-x-14 xl:gap-y-20">
        {blocks.map(renderBlock)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-10 lg:gap-y-14 xl:gap-y-16">
      {blocks.map(renderBlock)}
    </div>
  );
}

function ManifestoDetailsSection({
  educationItems,
  interestItems,
  toolItems,
  showEducation,
  showInterests,
  showSystemsTools,
  accent,
  labelColor,
  subtitleColor,
  bodyColor,
  cardBorder,
  contentSize,
  blocksLayout = 'grid',
  blocksScrollFocus = false,
  sectionTopClass = MANIFESTO_BLOCK_SPACING,
  motionOff = false,
}: {
  educationItems: ProfileEducationEntry[];
  skillItems: ProfileSkillEntry[];
  strengthItems: string[];
  interestItems: string[];
  toolItems: string[];
  showEducation: boolean;
  showSkills: boolean;
  showStrengths: boolean;
  showInterests: boolean;
  showSystemsTools: boolean;
  accent: string;
  labelColor?: string;
  subtitleColor: string;
  bodyColor: string;
  cardBorder: string;
  contentSize: PortfolioInfoPremiumFontSize;
  blocksLayout?: PortfolioInfoAboutManifestoBlocksLayout;
  blocksScrollFocus?: boolean;
  sectionTopClass?: string;
  motionOff?: boolean;
}) {
  const t = useT();
  const visibleEducation = educationItems.filter(
    (entry) => entry.title?.trim() || entry.institution?.trim() || entry.schoolYear?.trim()
  );
  const showEduBlock = showEducation && visibleEducation.length > 0;
  const showInterestsBlock = showInterests && interestItems.length > 0;
  const showToolsBlock = showSystemsTools && toolItems.length > 0;
  const bodySizeClass = infoContentBodySizeClass(contentSize);

  if (!showEduBlock && !showInterestsBlock && !showToolsBlock) {
    return null;
  }

  const blocks: { key: string; node: ReactNode }[] = [];

  if (showEduBlock) {
    blocks.push({
      key: 'education',
      node: (
        <ManifestoEducationList
          entries={educationItems}
            accent={accent}
          labelColor={labelColor}
          subtitleColor={subtitleColor}
            bodyColor={bodyColor}
          cardBorder={cardBorder}
          contentSize={contentSize}
        />
      ),
    });
  }

  if (showInterestsBlock) {
    blocks.push({
      key: 'interests',
      node: (
        <>
          <ManifestoSectionLabel color={labelColor} contentSize={contentSize}>
            {t('Interests')}
          </ManifestoSectionLabel>
          <ManifestoEditorialList
            items={interestItems}
            bodyColor={bodyColor}
            bodySizeClass={bodySizeClass}
          />
        </>
      ),
    });
  }

  if (showToolsBlock) {
    blocks.push({
      key: 'tools',
      node: (
        <>
          <ManifestoSectionLabel color={labelColor} contentSize={contentSize}>
            {t('Systems & tools')}
          </ManifestoSectionLabel>
          <ManifestoEditorialList
            items={toolItems}
            bodyColor={bodyColor}
            bodySizeClass={bodySizeClass}
          />
        </>
      ),
    });
  }

  return (
    <section className={`pf-about-manifesto-details ${sectionTopClass}`}>
      <ManifestoDetailsBlocks
        blocks={blocks}
        blocksLayout={blocksLayout}
        blocksScrollFocus={blocksScrollFocus}
        motionOff={motionOff}
      />
    </section>
  );
}

const MANIFESTO_PORTRAIT_SIZE_CLASS = 'w-full max-w-[26rem]';
const MANIFESTO_PORTRAIT_RECT_CLASS = 'w-full max-w-[22rem]';
const MANIFESTO_PORTRAIT_COMPACT_CLASS = 'size-[4.25rem] sm:size-[4.75rem]';
const MANIFESTO_PORTRAIT_COMPACT_RECT_CLASS = 'w-[4.25rem] sm:w-[4.75rem]';

function manifestoStatementSizeClass(size: PortfolioInfoPremiumFontSize, isLong: boolean): string {
  // A display line, but one step above the headline scale — not four times the bio.
  if (isLong) {
    switch (size) {
      case 'small':
        return 'pf-about-manifesto-statement--long text-[clamp(1.4rem,3.2vw,2.25rem)]';
      case 'large':
        return 'pf-about-manifesto-statement--long text-[clamp(1.9rem,4.4vw,3.25rem)]';
      case 'xlarge':
        return 'pf-about-manifesto-statement--long text-[clamp(2.15rem,5vw,3.75rem)]';
      case 'xxlarge':
        return 'pf-about-manifesto-statement--long text-[clamp(2.4rem,5.6vw,4.25rem)]';
      default:
        return 'pf-about-manifesto-statement--long text-[clamp(1.6rem,3.8vw,2.75rem)]';
    }
  }
  switch (size) {
    case 'small':
      return 'text-[clamp(1.9rem,4.6vw,3rem)]';
    case 'large':
      return 'text-[clamp(2.6rem,6.4vw,4.5rem)]';
    case 'xlarge':
      return 'text-[clamp(3rem,7.2vw,5.25rem)]';
    case 'xxlarge':
      return 'text-[clamp(3.4rem,8vw,6rem)]';
    default:
      return 'text-[clamp(2.25rem,5.6vw,3.75rem)]';
  }
}

function splitManifestoStatementLines(text: string): string[] {
  const explicit = text
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
  if (explicit.length > 1) return explicit.slice(0, 4);

  const normalized = (explicit[0] ?? text.replace(/\s+/g, ' ').trim()).trim();
  if (!normalized) return [];
  const words = normalized.split(' ');
  if (words.length <= 3) return [normalized];

  const conjunction = normalized.match(/^(.*?)\s+(and|et|&|or|ou)\s+(.+)$/i);
  if (conjunction && conjunction[1].length >= 14 && conjunction[3].split(' ').length >= 2) {
    return [`${conjunction[1]}`, `${conjunction[2]} ${conjunction[3]}`].slice(0, 3);
  }

  const punct = normalized.match(/^(.{14,}?[,;—–])\s+(.+)$/);
  if (punct && punct[2].split(' ').length >= 2) {
    return [punct[1], punct[2]].slice(0, 3);
  }

  const maxChars = normalized.length > 72 ? 42 : 26;
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (current && next.length > maxChars && lines.length < 3) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function ManifestoStatementReveal({
  text,
  className,
  color,
  extraStyle,
}: {
  text: string;
  className: string;
  color: string;
  extraStyle?: CSSProperties;
}) {
  const lines = splitManifestoStatementLines(text);

  return (
    <h2
      className={`pf-about-manifesto-statement ${className}`}
      style={{ color, fontFamily: ABOUT_MANIFESTO_SERIF, ...extraStyle }}
      aria-label={text}
    >
      <span className="pf-about-manifesto-statement-lines" aria-hidden="true">
        {lines.map((line, index) => (
          <span key={`${index}-${line.slice(0, 28)}`} className="pf-about-manifesto-line">
            <span className="pf-about-manifesto-line-inner">{line}</span>
          </span>
        ))}
      </span>
    </h2>
  );
}

function ManifestoPortraitFrame({
  frame,
  avatarSrc,
  initials,
  monogram,
  fullName,
  avatarGrayscale,
  accent,
  cardBg,
  subtitleColor,
  compact = false,
}: {
  frame: PortfolioInfoAboutManifestoPortraitFrame;
  avatarSrc: string;
  initials: string;
  monogram: string;
  fullName?: string | null;
  avatarGrayscale: boolean;
  accent: string;
  cardBg: string;
  subtitleColor: string;
  compact?: boolean;
}) {
  const t = useT();
  const imageClass = `h-full w-full object-cover object-center ${avatarGrayscale ? 'grayscale' : ''}`;
  const squareClass = compact ? MANIFESTO_PORTRAIT_COMPACT_CLASS : MANIFESTO_PORTRAIT_SIZE_CLASS;
  const rectClass = compact ? MANIFESTO_PORTRAIT_COMPACT_RECT_CLASS : MANIFESTO_PORTRAIT_RECT_CLASS;
  const mark = (monogram || initials).trim();

  if (frame === 'monogram') {
    return (
      <div
        className={`pf-about-manifesto-portrait pf-about-manifesto-portrait-clip pf-about-manifesto-monogram ${
          compact ? 'pf-about-manifesto-monogram--compact' : ''
        }`}
        style={{ borderColor: accent }}
        aria-hidden={!mark}
      >
        <span
          className="pf-about-manifesto-monogram-letters"
          style={{ color: subtitleColor, fontFamily: ABOUT_MANIFESTO_SERIF }}
        >
          {mark || '—'}
        </span>
      </div>
    );
  }

  const media = (
    <div className="pf-about-manifesto-portrait-media">
      {avatarSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img {...mediaImageResponsive(avatarSrc, ABOUT_MEDIA_WIDTHS)} sizes={ABOUT_MEDIA_SIZES} alt={fullName?.trim() || t('Profile')} className={imageClass} />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center"
          style={{ color: subtitleColor, backgroundColor: `${accent}18` }}
        >
          <span
            className="pf-about-manifesto-monogram-letters pf-about-manifesto-monogram-letters--inset"
            style={{ fontFamily: ABOUT_MANIFESTO_SERIF }}
          >
            {mark || initials}
          </span>
        </div>
      )}
    </div>
  );

  if (frame === 'instagram') {
    const ringColor = `color-mix(in srgb, ${accent} 72%, transparent)`;
    return (
      <div
        className={`pf-about-manifesto-portrait shrink-0 rounded-full ${
          compact ? 'p-[2px]' : 'p-[3px]'
        }`}
        style={{ backgroundColor: ringColor }}
      >
        <div className={`rounded-full ${compact ? 'p-[2px]' : 'p-[3px]'}`} style={{ backgroundColor: cardBg }}>
          <div
            className={`pf-about-manifesto-portrait-clip aspect-square ${squareClass} shrink-0 overflow-hidden rounded-full`}
          >
            {media}
          </div>
        </div>
      </div>
    );
  }

  const shapeClass =
    frame === 'circle'
      ? `aspect-square ${squareClass} shrink-0 overflow-hidden rounded-full`
      : frame === 'square'
        ? `aspect-square ${squareClass} shrink-0 overflow-hidden`
        : `aspect-[4/5] ${rectClass} shrink-0 overflow-hidden rounded-2xl`;

  return (
    <div
      className={`pf-about-manifesto-portrait pf-about-manifesto-portrait-clip ${shapeClass}`}
      style={frame === 'square' ? { borderColor: accent, borderWidth: 1, borderStyle: 'solid' } : undefined}
    >
      {media}
    </div>
  );
}

function ManifestoLanguageRail({
  items,
  codeColor,
  bodySizeClass,
}: {
  items: LanguageDisplayItem[];
  codeColor: string;
  bodySizeClass: string;
}) {
  if (items.length === 0) return null;

  return (
    <ul className="pf-about-manifesto-langs pf-about-manifesto-langs--iso">
      {items.map((item) => {
        const code = aboutClassicLanguageCode(item.name);
        const levelLabel = item.level ? resolveSpokenLanguageLevelLabel(item.level) : null;
        return (
          <li
            key={item.name}
            className={`pf-about-manifesto-lang ${bodySizeClass}`}
            aria-label={levelLabel ? `${item.name}, ${levelLabel}` : item.name}
          >
            <span className="pf-about-manifesto-line-mask">
              <span className="pf-about-manifesto-line-shift">
                <span className="pf-about-manifesto-lang-code" style={{ color: codeColor }}>
                  {code}
                </span>
                {levelLabel ? (
                  <>
                    <span className="pf-about-manifesto-lang-sep" aria-hidden>
                      ·
                    </span>
                    <span className="pf-about-manifesto-lang-level">{levelLabel}</span>
                  </>
                ) : null}
              </span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function manifestoParallaxTravel(): number {
  return Math.min(150, Math.max(72, (window.innerHeight || 800) * 0.12));
}

function useManifestoGsapReveal(rootRef: RefObject<HTMLDivElement | null>, motionOff: boolean) {
  useLayoutEffect(() => {
    const node = rootRef.current;
    if (!node) return undefined;
    node.setAttribute('data-pf-js', 'true');
    if (motionOff) {
      node.setAttribute('data-pf-entry', 'static');
      return undefined;
    }

    const hero = node.querySelector<HTMLElement>('.pf-about-manifesto-hero');
    const scroller =
      aboutBannerScrollParent(node) ?? getManifestoScrollParent(node) ?? undefined;
    const triggerHero = hero ?? node;
    const stBase = scroller ? { scroller } : {};
    let stopWatch: (() => void) | undefined;

    const ctx = gsap.context(() => {
      const kicker = node.querySelector<HTMLElement>('.pf-about-manifesto-kicker');
      const mark = node.querySelector<HTMLElement>('.pf-about-manifesto-kicker-mark');
      const lines = Array.from(
        node.querySelectorAll<HTMLElement>('.pf-about-manifesto-line-inner')
      );
      const ruleLine = node.querySelector<HTMLElement>('.pf-about-manifesto-rule-line');
      const ruleCap = node.querySelector<HTMLElement>('.pf-about-manifesto-rule-cap');
      const bios = Array.from(node.querySelectorAll<HTMLElement>('.pf-about-manifesto-bio'));
      const portraits = Array.from(
        node.querySelectorAll<HTMLElement>('.pf-about-manifesto-portrait-clip')
      );
      const caption = node.querySelector<HTMLElement>('.pf-about-manifesto-portrait-caption');
      const colShells = Array.from(
        node.querySelectorAll<HTMLElement>(
          '.pf-about-manifesto-pair-grid .pf-about-manifesto-col-shell'
        )
      );
      const folioLines = Array.from(
        node.querySelectorAll<HTMLElement>(
          '.pf-about-manifesto-pair-grid .pf-about-manifesto-line-shift'
        )
      );
      const detailBlocks = Array.from(
        node.querySelectorAll<HTMLElement>(
          '.pf-about-manifesto-details .pf-about-manifesto-block'
        )
      );
      const pair = node.querySelector<HTMLElement>('.pf-about-manifesto-pair');
      const photoSlot = node.querySelector<HTMLElement>(
        '.pf-about-manifesto-portrait-slot--desktop'
      );

      if (kicker) gsap.set(kicker, { autoAlpha: 0, y: 12, immediateRender: true });
      if (mark) gsap.set(mark, { scaleX: 0, transformOrigin: 'left center', immediateRender: true });
      if (lines.length) gsap.set(lines, { y: '108%', force3D: true, immediateRender: true });
      if (ruleLine) {
        gsap.set(ruleLine, { scaleX: 0, transformOrigin: 'left center', immediateRender: true });
      }
      if (ruleCap) gsap.set(ruleCap, { autoAlpha: 0, immediateRender: true });
      if (bios.length) gsap.set(bios, { autoAlpha: 0, y: 16, immediateRender: true });
      if (portraits.length) {
        gsap.set(portraits, { clipPath: 'inset(0% 0% 100% 0%)', immediateRender: true });
      }
      if (caption) gsap.set(caption, { autoAlpha: 0, immediateRender: true });
      if (folioLines.length) {
        gsap.set(folioLines, { y: 15, autoAlpha: 0, force3D: true, immediateRender: true });
      }
      if (detailBlocks.length) {
        gsap.set(detailBlocks, { autoAlpha: 0, y: 18, immediateRender: true });
      }

      node.setAttribute('data-pf-entry', 'active');

      const heroTl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } });
      if (kicker) heroTl.to(kicker, { autoAlpha: 1, y: 0, duration: 0.55 }, 0);
      if (mark) heroTl.to(mark, { scaleX: 1, duration: 0.7 }, 0.06);
      lines.forEach((line, index) => {
        heroTl.to(line, { y: '0%', duration: 0.92, force3D: true }, 0.1 + index * 0.1);
      });
      if (ruleCap) heroTl.to(ruleCap, { autoAlpha: 1, duration: 0.45 }, 0.28);
      if (ruleLine) heroTl.to(ruleLine, { scaleX: 1, duration: 0.88 }, 0.32);
      if (bios.length) {
        heroTl.to(bios, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.08 }, 0.42);
      }
      if (portraits.length) {
        heroTl.to(
          portraits,
          { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.16, ease: 'power2.inOut' },
          0.14
        );
      }
      if (caption) heroTl.to(caption, { autoAlpha: 1, duration: 0.55 }, 0.7);

      const folioTl = gsap.timeline({
        paused: true,
        defaults: { ease: 'power3.out' },
        onComplete: () => node.setAttribute('data-pf-entry', 'done'),
      });
      colShells.forEach((shell, colIndex) => {
        const shifts = Array.from(
          shell.querySelectorAll<HTMLElement>('.pf-about-manifesto-line-shift')
        );
        if (!shifts.length) return;
        folioTl.to(
          shifts,
          { y: 0, autoAlpha: 1, duration: 0.78, stagger: 0.055, force3D: true },
          colIndex * 0.12
        );
      });
      if (detailBlocks.length) {
        folioTl.to(
          detailBlocks,
          { autoAlpha: 1, y: 0, duration: 0.65, stagger: 0.08 },
          colShells.length ? '>-0.18' : 0
        );
      }

      let heroStarted = false;
      let folioStarted = false;
      const playHero = () => {
        if (heroStarted) return;
        heroStarted = true;
        heroTl.play();
      };
      const playFolio = () => {
        if (folioStarted) return;
        folioStarted = true;
        if (!heroStarted) playHero();
        folioTl.play();
      };

      heroTl.eventCallback('onComplete', playFolio);

      const heroInView = () => {
        const box = triggerHero.getBoundingClientRect();
        const viewH = window.innerHeight || 0;
        return box.top < viewH * 0.78 && box.bottom > 48;
      };

      ScrollTrigger.create({
        trigger: triggerHero,
        start: 'top 78%',
        once: true,
        onEnter: playHero,
        ...stBase,
      });

      const exitTrigger = pair ?? node;
      const mm = gsap.matchMedia();
      mm.add('(min-width: 1024px)', () => {
        if (!photoSlot) return undefined;
        gsap.fromTo(
          photoSlot,
          { y: 0 },
          {
            y: () => -manifestoParallaxTravel() * 0.8,
            ease: 'none',
            force3D: true,
            scrollTrigger: {
              trigger: node,
              start: 'top top',
              end: 'bottom top',
              scrub: 0.55,
              invalidateOnRefresh: true,
              ...stBase,
            },
          }
        );
        return undefined;
      });
      mm.add('(min-width: 768px)', () => {
        colShells.forEach((shell) => {
          const kind = shell.getAttribute('data-col');
          const speed = kind === 'strengths' ? 1 : 0.9;
          gsap.fromTo(
            shell,
            { y: 0 },
            {
              y: () => -manifestoParallaxTravel() * speed,
              ease: 'none',
              force3D: true,
              scrollTrigger: {
                trigger: exitTrigger,
                start: 'top 42%',
                end: 'bottom 18%',
                scrub: 0.55,
                invalidateOnRefresh: true,
                ...stBase,
              },
            }
          );
        });
        if (pair) {
          // Exit fade only once the columns are leaving: from 'top 42%' they were already at ~60%
          // opacity in the top fifth of the screen, while still being read.
          gsap.fromTo(
            pair,
            { autoAlpha: 1 },
            {
              autoAlpha: 0,
              ease: 'none',
              scrollTrigger: {
                trigger: pair,
                start: 'top 15%',
                end: 'bottom top',
                scrub: true,
                invalidateOnRefresh: true,
                ...stBase,
              },
            }
          );
        }
        return undefined;
      });

      const stopHeroWatch = aboutBannerWatchEnter(triggerHero, scroller, playHero);
      const onWinScroll = () => {
        if (heroInView()) playHero();
      };
      window.addEventListener('scroll', onWinScroll, { passive: true });
      scroller?.addEventListener('scroll', onWinScroll, { passive: true });
      onWinScroll();

      stopWatch = () => {
        stopHeroWatch();
        window.removeEventListener('scroll', onWinScroll);
        scroller?.removeEventListener('scroll', onWinScroll);
      };
    }, node);

    const refreshId = window.setTimeout(() => {
      try {
        ScrollTrigger.refresh();
      } catch (error) {
        // GSAP's ScrollTrigger.refresh() can throw internally on an edge case
        // (e.g. "Cannot read properties of undefined (reading 'end')") during
        // its own init-time recompute; uncaught, that crash propagates up
        // through this deferred setTimeout with no React boundary to catch it
        // and takes down the whole page. Never let a best-effort refresh do that.
        console.error('[ScrollTrigger] deferred refresh() failed', error);
      }
    }, 90);

    return () => {
      window.clearTimeout(refreshId);
      stopWatch?.();
      ctx.revert();
    };
  }, [rootRef, motionOff]);
}

export function AboutManifestoLayout({
  title: _title,
  subtitle,
  specialty,
  bio,
  avatarUrl,
  showPortrait = true,
  fullName,
  educationItems,
  skillItems,
  strengthItems,
  interestItems,
  languageItems,
  toolItems,
  showEducation,
  showSkills,
  showStrengths,
  showInterests,
  showLanguages,
  showSystemsTools,
  avatarGrayscale = false,
  portraitFrame = 'square',
  blocksLayout = 'grid',
  blocksScrollFocus = false,
  contentSize,
  accent,
  titleColor: _titleColor,
  subtitleColor,
  bodyColor,
  cardBg,
  cardBorder,
  statementStyle = null,
  colorMode = 'dark',
  blockLabelColor,
}: {
  title: string;
  subtitle: string;
  specialty?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  /** Draw the portrait; off, the layout recomposes without it. */
  showPortrait?: boolean;
  fullName?: string | null;
  educationItems: ProfileEducationEntry[];
  skillItems: ProfileSkillEntry[];
  strengthItems: string[];
  interestItems: string[];
  languageItems: LanguageDisplayItem[];
  toolItems: string[];
  showEducation: boolean;
  showSkills: boolean;
  showStrengths: boolean;
  showInterests: boolean;
  showLanguages: boolean;
  showSystemsTools: boolean;
  avatarGrayscale?: boolean;
  portraitFrame?: PortfolioInfoAboutManifestoPortraitFrame;
  blocksLayout?: PortfolioInfoAboutManifestoBlocksLayout;
  blocksScrollFocus?: boolean;
  contentSize: PortfolioInfoPremiumFontSize;
  accent: string;
  titleColor: string;
  subtitleColor: string;
  bodyColor: string;
  cardBg: string;
  cardBorder: string;
  /** Optional typography override for the statement line (color/size/weight/italic). */
  statementStyle?: PortfolioElementTextStyle | null;
  colorMode?: 'light' | 'dark';
  blockLabelColor: PortfolioInfoBlockLabelColor;
}) {
  const t = useT();
  const reduceMotion = useReducedMotion();
  const motionOff = reduceMotion === true;
  const rootRef = useRef<HTMLDivElement>(null);
  const labelColor = infoBlockLabelColor(blockLabelColor, subtitleColor);

  const bioParagraphs = (bio?.trim() || '')
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);

  const subtitleTrimmed = subtitle.trim();
  const specialtyTrimmed = specialty?.trim() || '';
  const supportingParagraphs = bioParagraphs;
  const statementFromBio =
    !subtitleTrimmed && !specialtyTrimmed && supportingParagraphs.length > 0
      ? supportingParagraphs[0]
      : '';
  const statement = subtitleTrimmed || specialtyTrimmed || statementFromBio;
  const visibleBio =
    statementFromBio && statement === statementFromBio
      ? supportingParagraphs.slice(1)
      : supportingParagraphs;

  const statementIsLong = statement.length > 72;
  const statementSizeClass = statementStyle
    ? elementTextSizeClass(statementStyle.size, 'title')
    : manifestoStatementSizeClass(contentSize, statementIsLong);
  const statementColor = statementStyle
    ? (colorMode === 'dark'
        ? statementStyle.colorDark || statementStyle.color
        : statementStyle.color) || subtitleColor
    : subtitleColor;
  const statementExtraStyle: CSSProperties | undefined = statementStyle
    ? {
        fontWeight: resolveElementTextWeightAmount(statementStyle.weight, statementStyle.weightAmount),
        fontStyle: statementStyle.italic ? 'italic' : 'normal',
        ...(statementStyle.size === 'custom'
          ? {
              fontSize: `${resolveElementTextSizePx(statementStyle.size, statementStyle.sizePx, 'title')}px`,
              lineHeight: 1.05,
            }
          : {}),
        ...(statementStyle.uppercase ? { textTransform: 'uppercase' as const, letterSpacing: '0.01em' } : {}),
      }
    : undefined;
  const skillLabels = manifestoCollapseSkillLeads(skillEntryLabels(skillItems));
  const showSkillsCol = showSkills && skillLabels.length > 0;
  const showStrengthsCol = showStrengths && strengthItems.length > 0;
  const showLangCol = showLanguages && languageItems.length > 0;
  const showIndexRow = showSkillsCol || showStrengthsCol || showLangCol;
  const secondaryBodyClass = manifestoStatementSecondarySizeClass(contentSize);

  const avatarSrc = avatarUrl?.trim() || '';
  const initials = (fullName ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
  const monogram = manifestoMonogramLetters(fullName);
  const showAvatarColumn =
    showPortrait &&
    (portraitFrame === 'monogram' ? Boolean(monogram || initials) : Boolean(avatarSrc || initials));
  const visibleEducation = educationItems.filter(
    (entry) => entry.title?.trim() || entry.institution?.trim() || entry.schoolYear?.trim()
  );
  const showDetails =
    (showEducation && visibleEducation.length > 0) ||
    (showInterests && interestItems.length > 0) ||
    (showSystemsTools && toolItems.length > 0);
  const showFolio = showIndexRow || showDetails;
  const portraitCaption = fullName?.trim() || '';

  useManifestoGsapReveal(rootRef, motionOff);

  const rootStyle = {
    '--pf-about-manifesto-accent': accent,
    '--pf-about-manifesto-line': cardBorder,
    '--pf-about-manifesto-body': bodyColor,
    '--pf-about-manifesto-ink': subtitleColor,
  } as CSSProperties;

  const portraitFrameNode = (compact: boolean) => (
    <ManifestoPortraitFrame
      frame={portraitFrame}
      avatarSrc={avatarSrc}
      initials={initials}
      monogram={monogram}
      fullName={fullName}
      avatarGrayscale={avatarGrayscale}
      accent={accent}
      cardBg={cardBg}
      subtitleColor={subtitleColor}
      compact={compact}
    />
  );

  return (
    <div
      ref={rootRef}
      className="pf-about-manifesto relative w-full"
      data-pf-entry={motionOff ? 'static' : 'armed'}
      style={rootStyle}
    >
      <div
        className={`pf-about-manifesto-hero ${
          showAvatarColumn ? '' : 'pf-about-manifesto-hero--solo'
        }`}
      >
        {showAvatarColumn ? (
          <div className="pf-about-manifesto-kicker-row" style={{ justifyContent: 'flex-start' }}>
            <div className="pf-about-manifesto-portrait-slot pf-about-manifesto-portrait-slot--mobile">
              {portraitFrameNode(false)}
            </div>
          </div>
        ) : null}

        <div
          className={`pf-about-manifesto-spread ${
            showAvatarColumn ? '' : 'pf-about-manifesto-spread--solo'
          }`}
        >
          <header className="pf-about-manifesto-copy">
            {statement ? (
              <>
                <ManifestoStatementReveal
                  text={statement}
                  className={statementSizeClass}
                  color={statementColor}
                  extraStyle={statementExtraStyle}
                />
                <div className="pf-about-manifesto-rule" aria-hidden>
                  <span
                    className="pf-about-manifesto-rule-cap"
                    style={{ backgroundColor: accent }}
                  />
                  <span
                    className="pf-about-manifesto-rule-line"
                    style={{ backgroundColor: accent }}
                  />
                </div>
              </>
            ) : null}

            {visibleBio.length > 0 ? (
              <div
                className={`pf-about-manifesto-bio-wrap ${secondaryBodyClass}`}
                style={{ color: bodyColor }}
              >
                {visibleBio.map((paragraph) => (
                  <p key={paragraph.slice(0, 48)} className="pf-about-manifesto-bio">
                    {paragraph}
                  </p>
                ))}
              </div>
            ) : null}

            {!statement && visibleBio.length === 0 ? (
              <p
                className={`pf-about-manifesto-bio pf-about-manifesto-bio--empty ${secondaryBodyClass}`}
                style={{ color: bodyColor }}
              >
                {t('Ajoute un sous-titre dans Creator Studio → Information.')}
              </p>
            ) : null}
          </header>

          {showAvatarColumn ? (
            <aside className="pf-about-manifesto-portrait-slot pf-about-manifesto-portrait-slot--desktop">
              {portraitFrameNode(false)}
              {portraitCaption ? (
                <p className="pf-about-manifesto-portrait-caption" style={{ color: bodyColor }}>
                  {portraitCaption}
                </p>
              ) : null}
            </aside>
          ) : null}
        </div>
      </div>

      {showFolio ? (
        <div className="pf-about-manifesto-folio" style={{ borderColor: cardBorder }}>
          {showIndexRow ? (
            <div className="pf-about-manifesto-pair">
              <ManifestoIndexGrid
                skillLabels={skillLabels}
                strengthItems={strengthItems}
                languageItems={languageItems}
                showSkills={showSkillsCol}
                showStrengths={showStrengthsCol}
                showLanguages={showLangCol}
                labelColor={labelColor}
                bodyColor={bodyColor}
                subtitleColor={subtitleColor}
                contentSize={contentSize}
                motionOff={motionOff}
              />
            </div>
          ) : null}

          <ManifestoDetailsSection
            educationItems={educationItems}
            skillItems={skillItems}
            strengthItems={strengthItems}
            interestItems={interestItems}
            toolItems={toolItems}
            showEducation={showEducation}
            showSkills={false}
            showStrengths={false}
            showInterests={showInterests}
            showSystemsTools={showSystemsTools}
            accent={accent}
            labelColor={labelColor}
            subtitleColor={subtitleColor}
            bodyColor={bodyColor}
            cardBorder={cardBorder}
            contentSize={contentSize}
            blocksLayout={blocksLayout}
            blocksScrollFocus={blocksScrollFocus}
            motionOff={motionOff}
            sectionTopClass={showIndexRow ? MANIFESTO_BLOCK_SPACING : 'mt-0'}
          />
        </div>
      ) : null}
    </div>
  );
}
