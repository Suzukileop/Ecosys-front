'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { employmentTypeLabel } from '@/lib/experience-employment';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion';
import { ProductThumbnailMedia } from '@/components/marketplace/ProductThumbnailMedia';
import type { ExperienceBlockStatus, ExperienceEmploymentType, ExperienceProofLink, ProfileMediaBlock } from '@/types/profile';
import { PortfolioMotionItem } from '@/components/portfolio/PortfolioMotionItem';
import type { PortfolioGlobalMotionProfile } from '@/components/portfolio/portfolio-motion-settings';
import {
  DEFAULT_MOTION_PROFILE,
  defaultMotionTimingForProfile,
} from '@/components/portfolio/portfolio-motion-settings';
import { DEFAULT_EXPERIENCE_PRESENTATION, accentYearsCssVars, experienceYearsStyle, DEFAULT_EXPERIENCE_TITLE_COLOR, DEFAULT_EXPERIENCE_TITLE_COLOR_DARK, DEFAULT_EXPERIENCE_BODY_COLOR, DEFAULT_EXPERIENCE_BODY_COLOR_DARK, DEFAULT_EXPERIENCE_MUTED_COLOR, DEFAULT_EXPERIENCE_MUTED_COLOR_DARK, DEFAULT_EXPERIENCE_YEARS_COLOR, ensureExperienceInkContrast, CENTERED_LEAD_LINE_HEIGHT, CENTERED_LEAD_OPACITY, CENTERED_LEAD_WEIGHT, CENTERED_LEAD_WIDTH, experienceAccentColor, experienceBlockLabelVisible, experienceItemsPerRowGridClass, experienceListShellClass, experiencePeriodRuleStyle, experienceTimelineRailLineStyle, experienceTimelineRailNodeStyle, resolveExperienceColorMode, resolveExperienceTextColor, experienceYearsClass, experienceYearsHighlightStyle, resolveAccentYearsCopy, resolveAccentYearsBadgeColor, accentYearsGridAnchorEnabled, experienceCardsBorderRadiusClass, experienceCardsCardWidthClass, experienceCardsElementSpacingClasses, experienceCardsTitleFontSize, resolveExperienceCardsVerticalGapPx, type PortfolioExperienceCardsBorderRadius, experienceLegacyThumbnailAspectRatio, experienceLegacyThumbnailMaxWidth, experienceLegacyItemGapClass, type PortfolioExperienceLegacyThumbnailHeight, type PortfolioExperienceLegacyThumbnailWidth, type PortfolioExperienceLegacyItemGap, type PortfolioExperienceLegacySide, experienceDuotoneThumbnailAspectRatio, experienceDuotoneThumbnailMaxHeight, experienceDuotoneStickyLeftGapClass, experienceDuotoneStickyEditorialSpacing, experienceDuotoneScrollTitleThumbGapClass, experienceDuotoneScrollEditorialSpacing, experienceDuotoneScrollRoleStackClass, experienceDuotoneStickySectionVh, type PortfolioExperienceDuotoneThumbnailEffect, type PortfolioExperienceDuotoneThumbnailHeight, type PortfolioExperienceDuotoneStickyVerticalGap, type PortfolioExperienceDuotoneRepoCtaMode, normalizeExperienceElementStyles, resolveExperienceBlockLabel, resolveExperienceItemsPerRow, resolveExperienceRepoLinkStyle, resolveCenteredHeaderCopy, resolveExperienceYearsTemplate, resolveSerifLeadCopy, resolveSerifLeadInkColor, splitSerifLeadLines, SERIF_LEAD_LABEL_OPACITY, SERIF_LEAD_LINE_HEIGHT, SERIF_LEAD_TRACKING, SERIF_LEAD_WEIGHT, SERIF_LEAD_WIDTH, type PortfolioExperienceCenteredMaxWidth, type PortfolioExperiencePresentationSettings, type PortfolioExperiencePeriodDesign, type PortfolioExperienceTasksDisplay, type PortfolioExperienceToolsBadgeStyle, type PortfolioExperienceRepoLinkStyle, type PortfolioExperienceReelStatusStyle, type PortfolioExperienceReelScrollMotion, type PortfolioExperienceDuotoneSlideNavStyle, type PortfolioExperienceGalleryThumbnailFit, type PortfolioExperienceGalleryBigTitleStyle, type PortfolioExperienceGalleryBigTitleColor, type PortfolioExperienceItemGap, type PortfolioExperienceLoftThumbnailFit, type PortfolioExperienceLoftThumbnailRadius, type PortfolioExperienceLoftHoverEffect, experienceLoftThumbnailRadiusClass, type PortfolioExperienceLoftColumns } from '@/components/portfolio/portfolio-experience-settings';
import {
  DEFAULT_EXPERIENCE_PALETTE,
  experienceSecondaryStatusColor,
} from '@/components/portfolio/portfolio-experience-palette-settings';
import {
  DEFAULT_SECTION_BACKGROUND_COLOR,
} from '@/components/portfolio/portfolio-section-background-settings';
import {
  experienceLinkButtonPalette,
  PortfolioLinkButton,
} from '@/components/portfolio/portfolio-link-buttons';
import {
  SERIF,
  getScrollParent,
  usePortfolioFinePointerDesktop,
} from '@/components/portfolio/portfolio-section-primitives';

function splitExperienceText(text: string): { title: string | null; body: string | null } {
  const trimmed = text.trim();
  if (!trimmed) return { title: null, body: null };

  const lines = trimmed.split('\n').map((line) => line.trim()).filter(Boolean);
  if (lines.length > 1) {
    return { title: lines[0], body: lines.slice(1).join('\n') };
  }

  return { title: null, body: trimmed };
}

function resolveExperienceContent(block: ProfileMediaBlock): {
  period: string | null;
  title: string | null;
  organization: string | null;
  description: string | null;
  status: ExperienceBlockStatus | null;
  tasks: string[];
  tools: string[];
  toolIcons: Record<string, string>;
  links: ExperienceProofLink[];
  location: string | null;
  employmentType: ExperienceEmploymentType | null;
} {
  const period = block.period?.trim() || null;
  const organization = block.organization?.trim() || null;
  const status =
    block.status === 'ONGOING' || block.status === 'FINISHED' ? block.status : null;
  const tasks = (block.tasks ?? []).map((item) => item.trim()).filter(Boolean);
  const tools: string[] = [];
  const toolIcons: Record<string, string> = {};
  for (const item of block.tools ?? []) {
    let name = '';
    let iconUrl: string | null = null;
    if (typeof item === 'string') {
      name = item.trim();
    } else if (item && typeof item === 'object') {
      const record = item as { name?: unknown; value?: unknown; iconUrl?: unknown };
      name = String(record.name ?? record.value ?? '').trim();
      iconUrl =
        typeof record.iconUrl === 'string' && record.iconUrl.trim() ? record.iconUrl.trim() : null;
    }
    if (!name) continue;
    const key = name.toLowerCase();
    if (tools.some((existing) => existing.toLowerCase() === key)) continue;
    tools.push(name);
    if (iconUrl) toolIcons[name] = iconUrl;
    if (tools.length >= 20) break;
  }
  const links = (block.links ?? [])
    .filter((link) => link.url?.trim() && link.label?.trim())
    .map((link, index) => ({
      id: link.id || `proof-${index}`,
      label: link.label.trim(),
      url: link.url.trim(),
      platform: link.platform ?? null,
      sortOrder: typeof link.sortOrder === 'number' ? link.sortOrder : index,
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const location = block.location?.trim() || null;
  const employmentType = block.employmentType ?? null;

  const dedicatedTitle = block.title?.trim() || null;
  if (dedicatedTitle) {
    return {
      period,
      title: dedicatedTitle,
      organization,
      description: block.text?.trim() || null,
      status,
      tasks,
      tools,
      toolIcons,
      links,
      location,
      employmentType,
    };
  }

  const split = splitExperienceText(block.text ?? '');
  return {
    period,
    title: split.title,
    organization,
    description: split.body,
    status,
    tasks,
    tools,
    toolIcons,
    links,
    location,
    employmentType,
  };
}

function EditorialExperienceYears({
  years,
  presentation = DEFAULT_EXPERIENCE_PRESENTATION,
}: {
  years: number;
  presentation?: PortfolioExperiencePresentationSettings;
}) {
  const template = resolveExperienceYearsTemplate(presentation);
  const marker = '{years}';
  const markerIndex = template.indexOf(marker);
  const isEditorial = presentation.experienceDesign === 'editorial';
  // Milestone: this line sits centered under the section title — one flat color,
  // lighter weight, bigger size — overridden only for this design.
  const isMilestone = presentation.experienceDesign === 'milestone';
  const isDark = presentation.activeColorMode !== 'light';
  const colorMode = resolveExperienceColorMode(presentation);
  const styles = normalizeExperienceElementStyles(presentation.elementStyles);
  const yearsClass = isMilestone
    ? 'relative mx-auto mb-10 max-w-3xl border-0 bg-transparent p-0 text-center text-xl font-normal leading-relaxed shadow-none sm:text-2xl lg:text-3xl lg:mb-12'
    : experienceYearsClass(presentation);
  // Soft surrounding copy → entryBlockLabel / texteFaint (quieter than subtitle / texteMuted).
  const mutedInk = ensureExperienceInkContrast(
    resolveExperienceTextColor(styles.blockLabel, colorMode),
    isDark,
    DEFAULT_EXPERIENCE_MUTED_COLOR,
    DEFAULT_EXPERIENCE_MUTED_COLOR_DARK
  );
  // Always plain text — never a card / border / shadow around the years line.
  const yearsStyle: CSSProperties = {
    ...(isEditorial
      ? { color: mutedInk }
      : {
          ...experienceYearsStyle(presentation),
          color: ensureExperienceInkContrast(
            presentation.yearsColor?.trim() || mutedInk,
            isDark,
            DEFAULT_EXPERIENCE_YEARS_COLOR,
            DEFAULT_EXPERIENCE_MUTED_COLOR_DARK
          ),
        }),
    border: 'none',
    borderWidth: 0,
    boxShadow: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
    background: 'none',
    position: 'relative',
    transform: 'none',
    willChange: 'auto',
    padding: 0,
    marginInline: 0,
  };

  const highlightStyle = isEditorial
    ? { backgroundColor: resolveAccentYearsBadgeColor(presentation), color: '#ffffff' }
    : isMilestone
      ? { color: yearsStyle.color }
      : experienceYearsHighlightStyle(presentation);

  if (isEditorial) {
    const copy = resolveAccentYearsCopy(years, presentation);
    return (
      <p className={yearsClass} style={{ ...yearsStyle, ...accentYearsCssVars(presentation) }}>
        {copy.badge ? (
          <span className="pf-exp-accent-years-badge" style={highlightStyle}>
            {copy.badge}
          </span>
        ) : null}
        {copy.lead ? (
          <>
            {copy.badge ? ' ' : null}
            {copy.lead}
          </>
        ) : null}
      </p>
    );
  }

  if (markerIndex === -1) {
    return (
      <p className={yearsClass} style={yearsStyle}>
        {template.replaceAll(marker, String(years))}
      </p>
    );
  }

  const before = template.slice(0, markerIndex);
  const after = template.slice(markerIndex + marker.length);
  const yearsNode =
    presentation.yearsBoldYears && !isMilestone ? (
      <span className="font-bold" style={highlightStyle}>
        {years}
      </span>
    ) : (
      <span style={highlightStyle}>{years}</span>
    );

  return (
    <p className={yearsClass} style={yearsStyle}>
      {before}
      {yearsNode}
      {after}
    </p>
  );
}

/** Shared with Accent years so the lead and the 2022 column share one left edge. */
const MILESTONE_ENTRY_GRID_CLASS =
  'grid w-full grid-cols-1 sm:grid-cols-[7.5rem_1.5rem_minmax(0,1fr)] sm:items-start sm:gap-x-6 lg:grid-cols-[8.5rem_1.75rem_minmax(0,1fr)] lg:gap-x-8';

/**
 * Experience → Header design for Editorial: years lead with accent highlight.
 * Mounted in a zone above the design-owned header when `headerDesign === 'editorial'`.
 */
export function ExperienceEditorialHeader({
  years,
  presentation = DEFAULT_EXPERIENCE_PRESENTATION,
}: {
  years: number;
  presentation?: PortfolioExperiencePresentationSettings;
}) {
  const itemDesign = presentation.experienceDesign;
  const yearsLead = (
    <EditorialExperienceYears
      years={years}
      presentation={{
        ...presentation,
        experienceDesign: 'editorial',
        yearsAlignment: 'left',
      }}
    />
  );

  return (
    <div
      className={experienceListShellClass(
        presentation.listMaxWidth,
        presentation.listPlacement
      )}
    >
      {itemDesign === 'milestone' && accentYearsGridAnchorEnabled(presentation) ? (
        <div className={MILESTONE_ENTRY_GRID_CLASS}>
          <div className="min-w-0 sm:col-span-3">{yearsLead}</div>
        </div>
      ) : (
        yearsLead
      )}
    </div>
  );
}

function renderCenteredYearsLead(
  text: string,
  width: PortfolioExperienceCenteredMaxWidth = 'balanced'
): ReactNode {
  const trimmed = text.trim();
  if (width === 'wide') return trimmed;

  const fieldTail = trimmed.match(/^(.*?)\s+(in my field\.?)$/i);
  if (width === 'narrow') {
    if (fieldTail?.[1] && fieldTail[2]) {
      const head = fieldTail[1];
      const handsOn = head.match(/^(.*?)\s+(hands-on experience)$/i);
      if (handsOn?.[1] && handsOn[2]) {
        return (
          <>
            {handsOn[1]}
            <br />
            {handsOn[2]}
            <br />
            {fieldTail[2]}
          </>
        );
      }
      const words = head.split(/\s+/);
      const cut = Math.max(1, Math.ceil(words.length / 2));
      return (
        <>
          {words.slice(0, cut).join(' ')}
          <br />
          {words.slice(cut).join(' ')}
          <br />
          {fieldTail[2]}
        </>
      );
    }
    const words = trimmed.split(/\s+/);
    if (words.length < 5) return trimmed;
    const first = Math.ceil(words.length / 3);
    const second = Math.ceil((words.length * 2) / 3);
    return (
      <>
        {words.slice(0, first).join(' ')}
        <br />
        {words.slice(first, second).join(' ')}
        <br />
        {words.slice(second).join(' ')}
      </>
    );
  }

  if (fieldTail?.[1] && fieldTail[2]) {
    return (
      <>
        {fieldTail[1]}
        <br />
        {fieldTail[2]}
      </>
    );
  }
  const words = trimmed.split(/\s+/);
  if (words.length < 6) return trimmed;
  return (
    <>
      {words.slice(0, -3).join(' ')}
      <br />
      {words.slice(-3).join(' ')}
    </>
  );
}

/**
 * Experience → Header design for Milestone: centered section title + years line underneath.
 * Mounted in a zone above the design-owned sticky header when `headerDesign === 'milestone'`.
 */
export function ExperienceMilestoneHeader({
  sectionTitle,
  years,
  presentation = DEFAULT_EXPERIENCE_PRESENTATION,
}: {
  sectionTitle: string;
  sectionSubtitle?: string;
  years?: number | null;
  presentation?: PortfolioExperiencePresentationSettings;
}) {
  const headerRef = useRef<HTMLElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const leadRef = useRef<HTMLParagraphElement>(null);
  const introPlayedRef = useRef(false);
  const reduceMotion = useReducedMotion();

  const isDark = presentation.activeColorMode !== 'light';
  const colorMode = resolveExperienceColorMode(presentation);
  const styles = normalizeExperienceElementStyles(presentation.elementStyles);
  const titleColor = ensureExperienceInkContrast(
    presentation.titleColor?.trim() || resolveExperienceTextColor(styles.title, colorMode),
    isDark,
    DEFAULT_EXPERIENCE_TITLE_COLOR,
    DEFAULT_EXPERIENCE_TITLE_COLOR_DARK
  );
  const { title: displayTitle, lead: yearsLead } = resolveCenteredHeaderCopy(
    years,
    sectionTitle,
    presentation
  );
  const hasLead = Boolean(yearsLead);

  const leadWeight = presentation.centeredLeadWeight ?? 'light';
  const leadOpacity = presentation.centeredLeadOpacity ?? 'balanced';
  const scale = presentation.centeredScale ?? 'monumental';
  const maxWidth = presentation.centeredMaxWidth ?? 'balanced';
  const lineHeight = presentation.centeredLineHeight ?? 'aery';
  const align = presentation.centeredAlign ?? 'center';
  const divider = presentation.centeredDivider ?? 'none';
  const dividerOpacity = presentation.centeredDividerOpacity ?? 'ghost';
  const leadAlpha = CENTERED_LEAD_OPACITY[leadOpacity] ?? CENTERED_LEAD_OPACITY.balanced;
  const accent = experienceAccentColor(presentation.accentColor);
  const dividerColor =
    dividerOpacity === 'accent'
      ? accent
      : dividerOpacity === 'subtle'
        ? `color-mix(in srgb, ${titleColor} 15%, transparent)`
        : `color-mix(in srgb, ${titleColor} 5%, transparent)`;

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;
    const header = headerRef.current;
    const title = titleRef.current;
    const parallax = parallaxRef.current;
    if (!header || !title || !parallax) return;

    gsap.registerPlugin(ScrollTrigger);
    const reduced = reduceMotion === true;
    const lead = leadRef.current;
    const scroller = getScrollParent(header) ?? undefined;

    const ctx = gsap.context(() => {
      const bindScrollMotion = () => {
        const fade = gsap.timeline({
          scrollTrigger: {
            trigger: header,
            scroller,
            start: 'top 40%',
            end: 'top 8%',
            scrub: true,
            invalidateOnRefresh: true,
          },
        });
        fade.fromTo(parallax, { y: 0 }, { y: -44, ease: 'none' }, 0);
        if (lead) fade.fromTo(lead, { opacity: 1 }, { opacity: 0, ease: 'none' }, 0);
      };

      if (introPlayedRef.current || reduced) {
        gsap.set(title, { yPercent: 0 });
        if (lead) gsap.set(lead, { opacity: 1 });
        introPlayedRef.current = true;
        bindScrollMotion();
        return;
      }

      introPlayedRef.current = true;
      gsap.set(title, { yPercent: 110 });
      if (lead) gsap.set(lead, { opacity: 0 });

      const intro = gsap.timeline({
        defaults: { overwrite: true },
        onComplete: bindScrollMotion,
      });
      intro.to(title, { yPercent: 0, duration: 0.95, ease: 'power3.out' });
      if (lead) {
        intro.to(lead, { opacity: 1, duration: 0.9, ease: 'power2.out' }, 0.32);
      }
    }, header);

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
      ctx.revert();
      if (!header.isConnected) introPlayedRef.current = false;
    };
  }, [hasLead, reduceMotion]);

  useLayoutEffect(() => {
    const refreshId = window.setTimeout(() => ScrollTrigger.refresh(), 40);
    return () => window.clearTimeout(refreshId);
  }, [divider, lineHeight, maxWidth, scale]);

  return (
    <header
      ref={headerRef}
      className="pf-exp-centered-header w-full"
      data-scale={scale}
      data-align={align}
      data-divider={divider}
      style={
        {
          '--pf-exp-centered-lead-weight': String(CENTERED_LEAD_WEIGHT[leadWeight]),
          '--pf-exp-centered-lead-width': CENTERED_LEAD_WIDTH[maxWidth],
          '--pf-exp-centered-lead-lh': String(CENTERED_LEAD_LINE_HEIGHT[lineHeight]),
          '--pf-exp-centered-divider-color': dividerColor,
        } as CSSProperties
      }
    >
      <div ref={parallaxRef} className="pf-exp-centered-parallax">
        <div className="pf-exp-centered-title-mask">
          <h2 ref={titleRef} className="pf-exp-centered-title" style={{ color: titleColor }}>
            {displayTitle}
          </h2>
        </div>
      </div>
      {yearsLead ? (
        <p
          ref={leadRef}
          className="pf-exp-centered-lead"
          style={{
            color: `color-mix(in srgb, ${titleColor} ${Math.round(leadAlpha * 100)}%, transparent)`,
          }}
        >
          {renderCenteredYearsLead(yearsLead, maxWidth)}
        </p>
      ) : null}
      {divider !== 'none' ? (
        <div
          className="pf-exp-centered-divider"
          data-style={divider}
          aria-hidden
        />
      ) : null}
    </header>
  );
}

/** Shared Award-level task presentations — synced from General → Tasks display
 * across every Experience design. */
function ExperienceTasksDisplay({
  tasks,
  display = 'editorial-dash',
  bodyColor,
  mutedColor,
  isDark,
  label = '',
  size = 'md',
  strongIndex = false,
}: {
  tasks: string[];
  display?: PortfolioExperienceTasksDisplay;
  bodyColor: string;
  mutedColor: string;
  isDark: boolean;
  label?: string;
  size?: 'md' | 'lg';
  /** Cards design only: continuous hairline rail + full-contrast numerals for
   * 'architectural-index', so the numbered list reads as the card's spine. */
  strongIndex?: boolean;
  /** Kept for callers that still pass entry tools. */
  tools?: string[];
}) {
  if (tasks.length === 0) return null;

  const textClass =
    size === 'lg'
      ? 'text-[0.98rem] leading-relaxed sm:text-[1.05rem]'
      : 'text-[0.95rem] leading-relaxed sm:text-[1.02rem]';
  const hoverWash = isDark ? 'rgba(255,255,255,0.045)' : 'rgba(0,0,0,0.035)';
  const railColor = isDark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.12)';
  const dashIdle = isDark ? 'rgb(113 113 122)' : 'rgb(161 161 170)';
  const dashHover = isDark ? 'rgb(244 244 245)' : 'rgb(39 39 42)';
  const activeInk = isDark ? '#ffffff' : bodyColor;
  const indexInk = isDark
    ? 'color-mix(in srgb, #ffffff 40%, transparent)'
    : 'color-mix(in srgb, #171717 40%, transparent)';

  const sectionLabel = label.trim() ? (
    <p
      className={
        size === 'lg'
          ? 'mb-3 text-[0.72rem] font-semibold uppercase tracking-[0.18em] sm:text-[0.78rem]'
          : 'mb-2.5 text-[0.7rem] font-semibold uppercase tracking-[0.18em]'
      }
      style={{ color: mutedColor }}
    >
      {label}
    </p>
  ) : null;

  if (display === 'engineering-grid') {
    return (
      <div>
        {sectionLabel}
        <ul className="pf-exp-tasks-grid grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-2.5">
          {tasks.map((task, index) => (
            <li
              key={`${task}-${index}`}
              data-pf-no-color-transition=""
              data-exp-task=""
              className="pf-exp-tasks-grid-cell group/task flex gap-3 px-3 py-3 sm:px-3.5 sm:py-3.5"
              style={
                {
                  color: bodyColor,
                  ['--exp-task-wash' as string]: hoverWash,
                } as CSSProperties
              }
            >
              <span
                className="pf-exp-task-index mt-0.5 shrink-0 font-mono text-[0.65rem] tracking-[0.08em]"
                style={{ color: indexInk }}
                aria-hidden
              >
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className={`${textClass} min-w-0`}>{task}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (display === 'cinematic-timeline') {
    return (
      <div>
        {sectionLabel}
        <ul
          data-pf-no-color-transition=""
          className="pf-exp-tasks-timeline relative space-y-0"
          style={
            {
              ['--exp-task-rail' as string]: railColor,
              ['--exp-task-active' as string]: activeInk,
            } as CSSProperties
          }
        >
          {tasks.map((task, index) => (
            <li
              key={`${task}-${index}`}
              data-pf-no-color-transition=""
              data-exp-task=""
              className="pf-exp-tasks-timeline-item group/task relative flex gap-4 py-3.5 pl-1 first:pt-0 last:pb-0"
              style={
                {
                  color: bodyColor,
                  ['--exp-task-active' as string]: activeInk,
                } as CSSProperties
              }
            >
              <span
                className="pf-exp-tasks-timeline-dot relative z-[1] mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ backgroundColor: mutedColor }}
                aria-hidden
              />
              <span
                className="pf-exp-task-index mt-0.5 shrink-0 font-mono text-[0.68rem] tracking-[0.1em]"
                style={{ color: indexInk }}
                aria-hidden
              >
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className={`pf-exp-tasks-timeline-copy ${textClass} min-w-0 transition-colors duration-500`}>
                {task}
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (display === 'accordion-stack') {
    return (
      <div>
        {sectionLabel}
        <ul
          className="pf-exp-tasks-lined relative space-y-0 pl-4"
          style={
            {
              ['--exp-task-rail' as string]: railColor,
              ['--exp-task-active' as string]: activeInk,
            } as CSSProperties
          }
        >
          {tasks.map((task, index) => (
            <li
              key={`${task}-${index}`}
              data-pf-no-color-transition=""
              data-exp-task=""
              className="pf-exp-tasks-lined-item group/task flex items-baseline gap-3 py-3.5 first:pt-0 last:pb-0"
              style={{ color: bodyColor }}
            >
              <span
                className="pf-exp-task-index pf-exp-tasks-lined-index shrink-0 font-mono text-[0.65rem] tracking-[0.1em]"
                style={{ color: indexInk }}
                aria-hidden
              >
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className={`${textClass} min-w-0`}>{task}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (display === 'architectural-index') {
    const indexColor = strongIndex ? activeInk : indexInk;
    return (
      <div>
        {sectionLabel}
        <ul
          className={
            strongIndex
              ? "relative space-y-7 before:absolute before:bottom-1 before:left-8 before:top-1 before:w-px before:bg-[var(--pf-arch-rail)] before:content-[''] sm:before:left-9"
              : size === 'lg'
                ? 'space-y-3.5 sm:space-y-4'
                : 'space-y-3.5'
          }
          style={strongIndex ? ({ ['--pf-arch-rail' as string]: railColor } as CSSProperties) : undefined}
        >
          {tasks.map((task, index) => (
            <li
              key={`${task}-${index}`}
              data-pf-no-color-transition=""
              data-exp-task=""
              className={
                strongIndex
                  ? 'group/arch flex items-baseline gap-6 sm:gap-7'
                  : 'group/arch flex items-baseline gap-4'
              }
              style={{ color: bodyColor }}
            >
              <span
                className={
                  strongIndex
                    ? 'pf-exp-task-index pf-exp-tasks-arch-index w-8 shrink-0 text-right font-mono text-[0.72rem] tracking-[0.06em] sm:w-9 sm:text-[0.78rem]'
                    : 'pf-exp-task-index pf-exp-tasks-arch-index shrink-0 font-mono text-[0.72rem] tracking-[0.06em] sm:text-[0.78rem]'
                }
                style={{ color: indexColor }}
                aria-hidden
              >
                {String(index + 1).padStart(2, '0')}
                {strongIndex ? null : <span className="pf-exp-tasks-arch-slash"> /</span>}
              </span>
              <span className={`${textClass} min-w-0`}>{task}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  /* editorial-dash — default Award list */
  return (
    <div>
      {sectionLabel}
      <ul className={size === 'lg' ? 'space-y-3.5 sm:space-y-4' : 'space-y-3.5'}>
        {tasks.map((task, index) => (
          <li
            key={`${task}-${index}`}
            data-pf-no-color-transition=""
            data-exp-task=""
            className="group/task flex gap-3"
            style={
              {
                color: bodyColor,
                ['--exp-task-dash' as string]: dashIdle,
                ['--exp-task-dash-hover' as string]: dashHover,
              } as CSSProperties
            }
          >
            <span
              data-pf-no-color-transition=""
              className="pf-exp-task-dash mt-0.5 shrink-0 font-light"
              aria-hidden
            >
              —
            </span>
            <span className={`${textClass} min-w-0`}>{task}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Shared Award-level tools/tech badge presentations — synced from General → Tools display
 * across every Experience design, the same way ExperienceTasksDisplay covers tasks. */
function ExperienceToolsDisplay({
  tools,
  style = 'mineral-pills',
  ink,
  muted,
  background,
  isDark,
  size = 'md',
  layout = 'wrap',
}: {
  tools: string[];
  style?: PortfolioExperienceToolsBadgeStyle;
  ink: string;
  muted: string;
  background: string;
  isDark: boolean;
  size?: 'sm' | 'md';
  /** 'scroll-x': a discreet horizontal strip with touch scroll instead of wrapping to a new
   * line — Sticky mobile tier, to avoid a staircase of wrapped tags. Editorial List and
   * Mineral Pills only; Kinetic Marquee already scrolls on its own and Numbered Index's
   * two-column grid doesn't read well as a single scrolling row. */
  layout?: 'wrap' | 'scroll-x';
}) {
  if (tools.length === 0) return null;

  const activeColor = isDark ? '#ffffff' : ink;
  const scrollX = layout === 'scroll-x';

  if (style === 'editorial-list') {
    return (
      <ul
        data-pf-no-color-transition=""
        className={
          scrollX
            ? 'pf-exp-tools-editorial pf-scrollbar-hide flex flex-nowrap items-baseline gap-y-1.5 overflow-x-auto'
            : 'pf-exp-tools-editorial flex flex-wrap items-baseline gap-y-1.5'
        }
        style={
          {
            ['--exp-tools-active' as string]: activeColor,
          } as CSSProperties
        }
      >
        {tools.map((tool, index) => (
          <li
            key={`${tool}-${index}`}
            data-pf-no-color-transition=""
            className={`pf-exp-tools-editorial-item ${scrollX ? 'shrink-0 whitespace-nowrap' : ''} ${
              size === 'sm' ? 'text-[0.85rem]' : 'text-[0.92rem] sm:text-[0.98rem]'
            }`}
            style={{ color: muted, fontFamily: REEL_SANS }}
          >
            {tool}
          </li>
        ))}
      </ul>
    );
  }

  if (style === 'kinetic-marquee') {
    const strokeColor = `color-mix(in srgb, ${ink} 14%, ${background})`;
    // Duration scales with the tool count so the apparent drift speed stays constant
    // regardless of how many words are looping.
    const durationSec = Math.max(12, tools.length * 2.4);
    return (
      <div
        data-pf-no-color-transition=""
        className="pf-exp-tools-marquee relative w-full overflow-hidden"
        style={{ ['--exp-tools-marquee-duration' as string]: `${durationSec}s` } as CSSProperties}
      >
        <span className="sr-only">{tools.join(', ')}</span>
        <div aria-hidden className="pf-exp-tools-marquee-track flex w-max items-center">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex shrink-0 items-center">
              {tools.map((tool, index) => (
                <span
                  key={`${copy}-${tool}-${index}`}
                  className={`shrink-0 whitespace-nowrap font-bold uppercase ${
                    size === 'sm'
                      ? 'text-[2.2rem] sm:text-[2.8rem]'
                      : 'text-[2.8rem] sm:text-[3.6rem]'
                  }`}
                  style={{
                    color: 'transparent',
                    WebkitTextStroke: `1px ${strokeColor}`,
                    letterSpacing: '0.01em',
                  }}
                >
                  {tool}
                  <span
                    className="mx-8 inline-block align-middle text-[0.5em]"
                    style={{ color: strokeColor }}
                  >
                    ·
                  </span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (style === 'numbered-index') {
    const indexInk = isDark
      ? 'color-mix(in srgb, #ffffff 40%, transparent)'
      : 'color-mix(in srgb, #171717 40%, transparent)';
    return (
      <ul
        data-pf-no-color-transition=""
        className="grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2"
      >
        {tools.map((tool, index) => (
          <li
            key={`${tool}-${index}`}
            data-pf-no-color-transition=""
            className="flex items-baseline gap-2"
          >
            <span
              className={`shrink-0 font-mono tracking-[0.06em] ${
                size === 'sm' ? 'text-[0.65rem]' : 'text-[0.7rem]'
              }`}
              style={{ color: indexInk }}
              aria-hidden
            >
              {String(index + 1).padStart(2, '0')} /
            </span>
            <span
              className={size === 'sm' ? 'text-[0.85rem]' : 'text-[0.92rem]'}
              style={{ color: ink, fontFamily: REEL_SANS }}
            >
              {tool}
            </span>
          </li>
        ))}
      </ul>
    );
  }

  /* mineral-pills — default */
  const pillBg = `color-mix(in srgb, ${ink} 6%, ${background})`;
  const pillBgHover = `color-mix(in srgb, ${ink} 13%, ${background})`;
  const pillInk = `color-mix(in srgb, ${ink} 82%, ${muted} 18%)`;
  return (
    <ul
      className={
        scrollX
          ? 'pf-scrollbar-hide flex flex-nowrap gap-2 overflow-x-auto'
          : 'flex flex-wrap gap-2'
      }
    >
      {tools.map((tool, index) => (
        <li
          key={`${tool}-${index}`}
          data-pf-no-color-transition=""
          className={`pf-exp-tools-pill rounded-full font-medium uppercase tracking-wider ${
            scrollX ? 'shrink-0' : ''
          } ${size === 'sm' ? 'px-3 py-1 text-[0.62rem]' : 'px-3.5 py-1.5 text-[0.68rem]'}`}
          style={
            {
              color: pillInk,
              fontFamily: REEL_SANS,
              ['--exp-tools-pill-bg' as string]: pillBg,
              ['--exp-tools-pill-bg-hover' as string]: pillBgHover,
            } as CSSProperties
          }
        >
          {tool}
        </li>
      ))}
    </ul>
  );
}

function ExperienceEditorialOngoingBadge({
  status,
  isDark,
  accentColor,
  secondaryColor,
}: {
  status: ExperienceBlockStatus | null;
  isDark: boolean;
  /** Primary/accent color token ("principal") — Ongoing derives its tint from it instead of the flat hardcoded green fallback. */
  accentColor?: string;
  /** Secondary color token ("secondaire") — Finished derives its tint from it instead of the flat neutral gray fallback. */
  secondaryColor?: string;
}) {
  if (status !== 'ONGOING' && status !== 'FINISHED') return null;
  const isOngoing = status === 'ONGOING';
  const dotColor = isOngoing ? (accentColor ?? (isDark ? '#6EE7A0' : '#1B7A3D')) : 'currentColor';
  return (
    <span
      className="inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.75rem] font-semibold tracking-[-0.01em]"
      style={
        isOngoing
          ? accentColor
            ? { backgroundColor: `color-mix(in srgb, ${accentColor} 14%, transparent)`, color: accentColor }
            : isDark
              ? { backgroundColor: '#143D28', color: '#6EE7A0' }
              : { backgroundColor: '#E8F5EC', color: '#1B7A3D' }
          : secondaryColor
            ? { backgroundColor: `color-mix(in srgb, ${secondaryColor} 14%, transparent)`, color: secondaryColor }
            : isDark
              ? { backgroundColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.55)' }
              : { backgroundColor: 'rgba(0,0,0,0.06)', color: 'rgba(0,0,0,0.55)' }
      }
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: dotColor }} aria-hidden />
      {isOngoing ? 'Ongoing' : 'Finished'}
    </span>
  );
}

function ExperienceEditorialPeriodColumn({
  period,
  periodDesign,
  presentation,
  accent,
  textColor,
  isLast,
  drawRail = false,
}: {
  period: string | null;
  periodDesign: PortfolioExperiencePeriodDesign;
  presentation: PortfolioExperiencePresentationSettings;
  accent: string;
  /** Body-tier ink (not the fainter muted/label tier) — the year needs to stay readable. */
  textColor: string;
  isLast: boolean;
  /** Draw the descending rail even on the last/only entry so GSAP can trace it. */
  drawRail?: boolean;
}) {
  const label = period || '—';
  const textClass = 'text-[0.9rem] font-medium tabular-nums tracking-[-0.01em]';

  if (periodDesign === 'badge') {
    return (
      <p
        className="pt-1 text-[11px] font-semibold uppercase tracking-[0.18em] sm:text-xs"
        style={{ color: accent, opacity: 0.92 }}
      >
        {label}
      </p>
    );
  }

  if (periodDesign === 'rule') {
    return (
      <div className="flex min-w-0 flex-col gap-2.5 pt-1">
        <p className={textClass} style={{ color: textColor }}>
          {label}
        </p>
        <div
          className="h-px w-full max-w-[4.5rem] sm:max-w-none"
          style={experiencePeriodRuleStyle(presentation)}
        />
      </div>
    );
  }

  if (periodDesign === 'rail') {
    const lineStyle = experienceTimelineRailLineStyle(presentation);
    const nodeStyle = experienceTimelineRailNodeStyle(presentation);
    return (
      // justify-end keeps the dot flush against the fixed right edge of this column — so
      // dots stay aligned in a straight vertical line down the page — regardless of how
      // long each entry's period label is. The year now reads to the left of its marker.
      <div className="relative flex justify-end self-stretch">
        <p className={`${textClass} self-start pt-1 text-right`} style={{ color: textColor }}>
          {label}
        </p>
        <div className="relative ml-2.5 flex w-3 shrink-0 justify-center sm:ml-3">
          <div
            className="relative z-10 mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full border-2 bg-transparent"
            style={nodeStyle}
          />
          {!isLast || drawRail ? (
            <div
              className="pf-exp-ed-rail-line pf-exp-lead-rail absolute top-[1.125rem] bottom-0 left-1/2 w-px"
              style={{ ...lineStyle, marginLeft: -0.5, transformOrigin: 'top center' }}
              data-pf-no-color-transition=""
            />
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <p className={textClass} style={{ color: textColor }}>
      {label}
    </p>
  );
}

function ExperienceEditorialEntry({
  period,
  title,
  organization,
  description,
  status,
  tasks,
  tools,
  toolsLabel,
  links,
  location,
  employmentType,
  accent,
  titleColor,
  mutedColor,
  bodyColor,
  isDark,
  isLast,
  isLead = false,
  expanded,
  onExpandedChange,
  periodDesign = 'plain',
  presentation,
}: {
  period: string | null;
  title: string | null;
  organization: string | null;
  description: string | null;
  status: ExperienceBlockStatus | null;
  tasks: string[];
  tools: string[];
  toolsLabel: string;
  links: ExperienceProofLink[];
  location: string | null;
  employmentType: ExperienceEmploymentType | null;
  accent: string;
  titleColor: string;
  mutedColor: string;
  bodyColor: string;
  isDark: boolean;
  isLast: boolean;
  isLead?: boolean;
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  periodDesign?: PortfolioExperiencePeriodDesign;
  presentation: PortfolioExperiencePresentationSettings;
}) {
  const reduceMotion = useReducedMotion();
  const motionDisabled = reduceMotion === true;
  const secondary = experienceSecondaryStatusColor(presentation);
  const hairline = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)';
  const linkVariant = resolveExperienceRepoLinkStyle(presentation.repoLinkButtonStyle, 'editorial');
  const linkPalette = experienceLinkButtonPalette({
    ink: titleColor,
    muted: mutedColor,
    accent,
    background: presentation.sectionBackgroundColor?.trim(),
    border: hairline,
    isDark,
  });
  const metaParts = [
    organization?.trim() || '',
    location?.trim() || '',
    employmentTypeLabel(employmentType),
  ].filter(Boolean);
  const hasDetails =
    Boolean(description?.trim()) ||
    tasks.length > 0 ||
    tools.length > 0 ||
    links.length > 0 ||
    metaParts.length > 0;
  const isAllOpen = (presentation.entryExpandMode ?? 'accordion') === 'all-open';
  const effectiveExpanded = isAllOpen ? hasDetails : expanded;
  const showExpandControl = !isAllOpen && hasDetails;
  const usesTimelineRail = periodDesign === 'rail';
  const periodGridClass = usesTimelineRail
    ? 'sm:grid-cols-[8.5rem_minmax(0,1fr)] lg:grid-cols-[9.5rem_minmax(0,1fr)]'
    : 'sm:grid-cols-[7.5rem_minmax(0,1fr)] lg:grid-cols-[8.5rem_minmax(0,1fr)]';

  const expandHoverBg = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
  const stackLabel = resolveExperienceBlockLabel(toolsLabel, 'Stack');
  const showTasksHeading = experienceBlockLabelVisible(presentation, 'tasks');
  const showStackHeading = experienceBlockLabelVisible(presentation, 'tools');
  const tasksHeading = showTasksHeading
    ? resolveExperienceBlockLabel(presentation.tasksLabel, 'Responsibilities')
    : '';
  const stackHeading = showStackHeading ? stackLabel : '';
  const panelTransition = motionDisabled
    ? { duration: 0 }
    : {
        height: { duration: 0.38, ease: [0.22, 1, 0.36, 1] as const },
        opacity: { duration: 0.26, ease: 'easeOut' as const },
      };
  const toggleExpanded = () => onExpandedChange(!expanded);

  const expandControl = showExpandControl ? (
    <button
      type="button"
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors duration-200 sm:h-9 sm:w-9"
      style={{ color: mutedColor }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = expandHoverBg;
        e.currentTarget.style.color = titleColor;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
        e.currentTarget.style.color = mutedColor;
      }}
      aria-label={effectiveExpanded ? 'Collapse role details' : 'Expand role details'}
      onClick={toggleExpanded}
    >
      <motion.span
        className="block text-xl leading-none font-light sm:text-2xl"
        aria-hidden
        animate={{ rotate: effectiveExpanded ? 45 : 0 }}
        transition={
          motionDisabled ? { duration: 0 } : { duration: 0.28, ease: [0.22, 1, 0.36, 1] }
        }
      >
        +
      </motion.span>
    </button>
  ) : null;

  const softCopy = `color-mix(in srgb, ${titleColor} 60%, transparent)`;
  const detailLayout = presentation.editorialDetailLayout ?? 'split-actions';
  const splitActions = detailLayout === 'split-actions';
  const hasStatusBadge = status === 'ONGOING' || status === 'FINISHED';
  const showDataColumn =
    splitActions &&
    effectiveExpanded &&
    (metaParts.length > 0 || hasStatusBadge || links.length > 0 || showExpandControl);

  const stackBlock =
    tools.length > 0 ? (
      <div className="min-w-0 pt-1">
        {stackHeading ? (
          <p
            className="mb-3 text-[0.72rem] font-semibold uppercase tracking-[0.18em] sm:text-[0.78rem]"
            style={{ color: `color-mix(in srgb, ${mutedColor} 65%, transparent)` }}
          >
            {stackHeading}
          </p>
        ) : null}
        <ExperienceToolsDisplay
          tools={tools}
          style={presentation.toolsBadgeStyle}
          ink={titleColor}
          muted={mutedColor}
          background={presentation.sectionBackgroundColor?.trim() || DEFAULT_SECTION_BACKGROUND_COLOR}
          isDark={isDark}
        />
      </div>
    ) : null;

  const repoLinks = links.length > 0 ? (
    <div className="flex flex-wrap items-center gap-2">
      {links.map((link) => (
        <PortfolioLinkButton
          key={link.id}
          variant={linkVariant}
          href={link.url}
          label={link.label || 'View repository'}
          palette={linkPalette}
        />
      ))}
    </div>
  ) : null;

  const detailsInner = effectiveExpanded ? (
    splitActions ? (
      <div className={`${showDataColumn ? 'mt-5 sm:mt-6 lg:mt-0' : 'mt-5 sm:mt-6'} space-y-9 sm:space-y-11`}>
        {description ? (
          <p
            className="pf-exp-lead-reveal pf-exp-ed-copy m-0 max-w-2xl p-0 text-left text-[1rem] leading-[1.8]"
            style={{ color: softCopy }}
            data-pf-lead-step="2"
            data-pf-no-color-transition=""
          >
            {description}
          </p>
        ) : null}
        {tasks.length > 0 ? (
          <div
            className="pf-exp-lead-reveal"
            data-pf-lead-step="4"
            data-pf-no-color-transition=""
          >
            {tasksHeading ? (
              <p
                className="mb-3 text-[0.72rem] font-semibold uppercase tracking-[0.18em] sm:text-[0.78rem]"
                style={{ color: `color-mix(in srgb, ${mutedColor} 65%, transparent)` }}
              >
                {tasksHeading}
              </p>
            ) : null}
            <div className="[&_ul]:space-y-4 sm:[&_ul]:space-y-5">
              <ExperienceTasksDisplay
                tasks={tasks}
                display={presentation.tasksDisplay ?? 'editorial-dash'}
                bodyColor={softCopy}
                mutedColor={`color-mix(in srgb, ${titleColor} 40%, transparent)`}
                isDark={isDark}
                label=""
                size="md"
              />
            </div>
          </div>
        ) : null}
        {stackBlock}
      </div>
    ) : (
      <div className="mt-5 space-y-9 sm:mt-6 sm:space-y-11">
        {metaParts.length > 0 ? (
          <p className="text-[0.9rem]" style={{ color: softCopy }}>
            {metaParts.join(' · ')}
          </p>
        ) : null}
        {description ? (
          <p
            className="pf-exp-lead-reveal pf-exp-ed-copy m-0 max-w-2xl p-0 text-left text-[1rem] leading-[1.8]"
            style={{ color: softCopy }}
            data-pf-lead-step="2"
            data-pf-no-color-transition=""
          >
            {description}
          </p>
        ) : null}
        {tasks.length > 0 ? (
          <div
            className="pf-exp-lead-reveal"
            data-pf-lead-step="4"
            data-pf-no-color-transition=""
          >
            {tasksHeading ? (
              <p
                className="mb-3 text-[0.72rem] font-semibold uppercase tracking-[0.18em] sm:text-[0.78rem]"
                style={{ color: `color-mix(in srgb, ${mutedColor} 65%, transparent)` }}
              >
                {tasksHeading}
              </p>
            ) : null}
            <div className="[&_ul]:space-y-4 sm:[&_ul]:space-y-5">
              <ExperienceTasksDisplay
                tasks={tasks}
                display={presentation.tasksDisplay ?? 'editorial-dash'}
                bodyColor={softCopy}
                mutedColor={`color-mix(in srgb, ${titleColor} 40%, transparent)`}
                isDark={isDark}
                label=""
                size="md"
              />
            </div>
          </div>
        ) : null}
        {stackBlock}
        {/* Stacked: repo CTA sits under STACK, in the same left column flow. */}
        {repoLinks ? <div className="pt-1">{repoLinks}</div> : null}
      </div>
    )
  ) : null;

  const detailsPanel = isAllOpen ? (
    detailsInner
  ) : (
    <AnimatePresence initial={false}>
      {effectiveExpanded ? (
        <motion.div
          key="experience-editorial-panel"
          initial={motionDisabled ? false : { height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={motionDisabled ? { opacity: 0 } : { height: 0, opacity: 0 }}
          transition={panelTransition}
          className="overflow-hidden"
        >
          {detailsInner}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );

  const titleHeading = title ? (
    <h4
      className="pf-exp-lead-reveal pf-exp-ed-copy m-0 p-0 text-left font-serif text-[1.35rem] font-bold leading-[1.18] tracking-[-0.02em] sm:text-[1.5rem] lg:text-[1.65rem]"
      style={{ color: titleColor }}
      data-pf-lead-step="1"
      data-pf-no-color-transition=""
    >
      {title}
    </h4>
  ) : null;

  const showBadgeBesideTitle = !splitActions || !effectiveExpanded;
  // Collapsed always shows meta under title. Expanded stacked keeps meta in the
  // vertical details. Expanded split moves meta to the data column.
  const titleBlock = (
    <>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {titleHeading}
        {showBadgeBesideTitle ? (
          <ExperienceEditorialOngoingBadge
            status={status}
            isDark={isDark}
            accentColor={accent}
            secondaryColor={secondary}
          />
        ) : null}
      </div>
      {!effectiveExpanded && metaParts.length > 0 ? (
        <p className="mt-2.5 text-[0.9rem]" style={{ color: bodyColor }}>
          {metaParts.join(' · ')}
        </p>
      ) : null}
    </>
  );

  const dataColumn = showDataColumn ? (
    <aside className="mt-6 flex min-h-[14rem] flex-col items-stretch sm:mt-7 lg:col-start-2 lg:row-start-2 lg:mt-0 lg:min-h-full lg:self-stretch">
      {showExpandControl ? (
        <div className="mb-3 flex justify-end lg:hidden">{expandControl}</div>
      ) : null}

      {/* Sits on the description row, not against the iframe / close control. */}
      <div
        className="pf-exp-lead-reveal pf-exp-ed-meta flex flex-wrap items-center justify-end gap-x-2.5 gap-y-1.5 lg:pt-[0.4rem]"
        style={{ color: softCopy }}
        data-pf-lead-step="3"
        data-pf-no-color-transition=""
      >
        {metaParts.length > 0 ? (
          <p className="max-w-full text-right text-[0.82rem] leading-none tracking-[-0.01em] sm:text-[0.86rem]">
            {metaParts.join(' · ')}
          </p>
        ) : null}
        <ExperienceEditorialOngoingBadge
          status={status}
          isDark={isDark}
          accentColor={accent}
          secondaryColor={secondary}
        />
      </div>

      <div className="min-h-[2.5rem] flex-1" aria-hidden />

      {links.length > 0 ? (
        <div className="mt-auto flex flex-col items-end gap-2 pt-8">{repoLinks}</div>
      ) : null}
    </aside>
  ) : null;

  return (
    <article
      className={`grid grid-cols-1 bg-transparent py-7 sm:py-8 ${periodGridClass} sm:gap-x-8 lg:gap-x-10`}
      {...(isLead ? { 'data-pf-exp-lead-card': '' } : {})}
      style={{
        border: 'none',
        borderBottom:
          !isLast && !usesTimelineRail ? `1px solid ${hairline}` : 'none',
        boxShadow: 'none',
        outline: 'none',
        backgroundColor: 'transparent',
      }}
    >
      <ExperienceEditorialPeriodColumn
        period={period}
        periodDesign={periodDesign}
        presentation={presentation}
        accent={accent}
        textColor={bodyColor}
        isLast={isLast}
        drawRail={isLead && usesTimelineRail}
      />

      <div className="min-w-0">
        <div
          className={
            showDataColumn
              ? 'lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(11.5rem,15rem)] lg:grid-rows-[auto_minmax(0,1fr)] lg:items-start lg:gap-x-10 lg:gap-y-6 xl:gap-x-14'
              : undefined
          }
        >
          <div className="min-w-0 lg:col-start-1 lg:row-start-1">
            <div className="flex items-start gap-3">
              {isAllOpen ? (
                <div className="min-w-0 flex-1">{titleBlock}</div>
              ) : (
                <button
                  type="button"
                  className="m-0 min-w-0 flex-1 appearance-none border-0 bg-transparent p-0 text-left"
                  onClick={toggleExpanded}
                  aria-expanded={effectiveExpanded}
                >
                  {titleBlock}
                </button>
              )}
              {(!splitActions || !effectiveExpanded) && showExpandControl ? expandControl : null}
            </div>
          </div>
          {showDataColumn && showExpandControl ? (
            <div className="hidden justify-end self-start lg:col-start-2 lg:row-start-1 lg:flex">
              {expandControl}
            </div>
          ) : null}
          <div className="min-w-0 lg:col-start-1 lg:row-start-2">{detailsPanel}</div>
          {dataColumn}
        </div>
      </div>
    </article>
  );
}

function EditorialExperienceBlock({
  block,
  index = 0,
  isLast = false,
  presentation = DEFAULT_EXPERIENCE_PRESENTATION,
  expanded = false,
  onExpandedChange,
}: {
  block: ProfileMediaBlock;
  index?: number;
  isLast?: boolean;
  presentation?: PortfolioExperiencePresentationSettings;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  /** @deprecated Editorial is always single-column. */
  inMultiColumn?: boolean;
  /** @deprecated Unused for editorial entries. */
  stackColumnsForSplitNav?: boolean;
}) {
  const {
    period,
    title,
    organization,
    description,
    status,
    tasks,
    tools,
    links,
    location,
    employmentType,
  } = resolveExperienceContent(block);

  const accent = experienceAccentColor(presentation.accentColor);
  const isDark = presentation.activeColorMode !== 'light';
  const colorMode = resolveExperienceColorMode(presentation);
  const styles = normalizeExperienceElementStyles(presentation.elementStyles);

  const titleColor = ensureExperienceInkContrast(
    presentation.titleColor?.trim() || resolveExperienceTextColor(styles.title, colorMode),
    isDark,
    DEFAULT_EXPERIENCE_TITLE_COLOR,
    DEFAULT_EXPERIENCE_TITLE_COLOR_DARK
  );
  const mutedColor = ensureExperienceInkContrast(
    presentation.subtitleColor?.trim() || resolveExperienceTextColor(styles.meta, colorMode),
    isDark,
    DEFAULT_EXPERIENCE_MUTED_COLOR,
    DEFAULT_EXPERIENCE_MUTED_COLOR_DARK
  );
  const bodyColor = ensureExperienceInkContrast(
    resolveExperienceTextColor(styles.tasks, colorMode) ||
      resolveExperienceTextColor(styles.description, colorMode),
    isDark,
    DEFAULT_EXPERIENCE_BODY_COLOR,
    DEFAULT_EXPERIENCE_BODY_COLOR_DARK
  );

  return (
    <ExperienceEditorialEntry
      period={presentation.showPeriod ? period : null}
      title={presentation.showTitle ? title : null}
      organization={presentation.showOrganization ? organization : null}
      description={presentation.showDescription ? description : null}
      status={presentation.showMeta ? status : null}
      tasks={presentation.showTasks ? tasks : []}
      tools={presentation.showTools ? tools : []}
      toolsLabel={presentation.toolsLabel}
      links={presentation.showProof ? links : []}
      location={presentation.showMeta ? location : null}
      employmentType={presentation.showMeta ? employmentType : null}
      accent={accent}
      titleColor={titleColor}
      mutedColor={mutedColor}
      bodyColor={bodyColor}
      isDark={isDark}
      isLast={isLast}
      isLead={index === 0}
      expanded={expanded}
      onExpandedChange={onExpandedChange ?? (() => undefined)}
      periodDesign={presentation.periodDesign ?? 'plain'}
      presentation={presentation}
    />
  );
}

export function EditorialExperienceList({
  blocks,
  presentation = DEFAULT_EXPERIENCE_PRESENTATION,
  motionProfile = DEFAULT_MOTION_PROFILE,
  forceSingleColumn = false,
}: {
  blocks: ProfileMediaBlock[];
  presentation?: PortfolioExperiencePresentationSettings;
  motionProfile?: PortfolioGlobalMotionProfile;
  /** Split-screen nav: one experience entry per row in the right pane. */
  forceSingleColumn?: boolean;
}) {
  const [openBlockId, setOpenBlockId] = useState<string | null>(() => blocks[0]?.id ?? null);

  useEffect(() => {
    if (blocks.length === 0) {
      setOpenBlockId(null);
      return;
    }
    setOpenBlockId((current) => {
      if (current && blocks.some((block) => block.id === current)) return current;
      return blocks[0]?.id ?? null;
    });
  }, [blocks]);

  if (blocks.length === 0) return null;

  const isAllOpen = (presentation.entryExpandMode ?? 'accordion') === 'all-open';
  const design = presentation.experienceDesign;
  const itemsPerRow = forceSingleColumn
    ? 1
    : resolveExperienceItemsPerRow(design, presentation.itemsPerRow);
  const gridClass = experienceItemsPerRowGridClass(itemsPerRow, design, presentation.itemGap);
  // Editorial rows are flush on the page — no card lift / orange hover shadow frame.
  const flatMotionTiming = {
    ...defaultMotionTimingForProfile(motionProfile),
    hoverLift: 0,
    hoverShadowSize: 0,
    hoverShadowOpacity: 0,
  };

  return (
    <div
      className={experienceListShellClass(
        forceSingleColumn ? 'full' : presentation.listMaxWidth,
        forceSingleColumn ? 'left' : presentation.listPlacement
      )}
    >
      <div className={`${gridClass} !gap-0 space-y-0`.trim()}>
        {blocks.map((block, index) => {
          const entry = (
            <EditorialExperienceBlock
              block={block}
              index={index}
              isLast={index === blocks.length - 1}
              presentation={presentation}
              expanded={isAllOpen || openBlockId === block.id}
              onExpandedChange={
                isAllOpen ? undefined : (next) => setOpenBlockId(next ? block.id : null)
              }
            />
          );
          if (index === 0) {
            return (
              <div key={block.id} className="h-full">
                {entry}
              </div>
            );
          }
          return (
            <PortfolioMotionItem
              key={block.id}
              profile={motionProfile}
              index={index}
              className="h-full"
              timing={flatMotionTiming}
            >
              {entry}
            </PortfolioMotionItem>
          );
        })}
      </div>
    </div>
  );
}

function extractMilestoneDisplayYear(period: string | null): string {
  if (!period?.trim()) return '—';
  const match = period.match(/\d{4}/);
  return match?.[0] ?? period.trim();
}

/** Subtle rail track + bright progress fill driven by the card’s scroll position. */
function MilestoneTimelineRail({
  articleRef,
  isLast,
  isDark,
  isLead = false,
}: {
  articleRef: RefObject<HTMLElement | null>;
  isLast: boolean;
  isDark: boolean;
  isLead?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const [progress, setProgress] = useState(0);
  const [motionOwned, setMotionOwned] = useState(false);
  const motionOwnedRef = useRef(false);
  const active = progress > 0.04 || motionOwned;

  useLayoutEffect(() => {
    if (!isLead || reduceMotion) return;
    const article = articleRef.current;
    if (!article) return;
    const section = article.closest('#experience');
    if (!section?.querySelector('.pf-exp-reel-header')) return;

    motionOwnedRef.current = true;
    setMotionOwned(true);
    const done = () => {
      motionOwnedRef.current = false;
      setMotionOwned(false);
    };
    section.addEventListener('pf-exp-lead-motion-done', done);
    const timeoutId = window.setTimeout(done, 3200);
    return () => {
      motionOwnedRef.current = false;
      section.removeEventListener('pf-exp-lead-motion-done', done);
      window.clearTimeout(timeoutId);
    };
  }, [articleRef, isLead, reduceMotion]);

  useEffect(() => {
    const article = articleRef.current;
    if (!article) return;

    const scroller = getScrollParent(article);

    const update = () => {
      if (motionOwnedRef.current) return;
      if (reduceMotion) {
        setProgress(1);
        return;
      }
      const rect = article.getBoundingClientRect();
      let viewH: number;
      let top: number;
      if (scroller) {
        const scrollerRect = scroller.getBoundingClientRect();
        viewH = scroller.clientHeight;
        top = rect.top - scrollerRect.top;
      } else {
        viewH = window.innerHeight;
        top = rect.top;
      }
      // Fill grows as the card travels through the upper half of the viewport.
      const start = viewH * 0.72;
      const end = viewH * 0.28;
      const raw = (start - top) / Math.max(start - end + rect.height * 0.35, 1);
      setProgress(Math.max(0, Math.min(1, raw)));
    };

    update();
    const onScroll = () => update();
    const target: HTMLElement | Window = scroller ?? window;
    target.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      target.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [articleRef, reduceMotion, motionOwned]);

  const trackColor = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)';
  const fillColor = isDark ? 'rgba(255,255,255,0.88)' : 'rgba(0,0,0,0.72)';
  const nodeIdle = isDark ? 'rgba(255,255,255,0.28)' : 'rgba(0,0,0,0.22)';
  const nodeActive = isDark ? 'rgba(255,255,255,0.95)' : 'rgba(0,0,0,0.88)';

  return (
    <div className="pf-exp-milestone-rail" aria-hidden>
      <div
        className={`pf-exp-milestone-rail-node${active ? ' is-active' : ''}`}
        style={{
          backgroundColor: active ? nodeActive : nodeIdle,
          boxShadow: active
            ? isDark
              ? '0 0 0 4px rgba(255,255,255,0.08)'
              : '0 0 0 4px rgba(0,0,0,0.06)'
            : undefined,
        }}
      />
      <div
        className={`pf-exp-milestone-rail-track${isLast ? ' is-last' : ''}`}
        style={{ backgroundColor: trackColor }}
      >
        <div
          className="pf-exp-milestone-rail-progress pf-exp-lead-rail"
          style={{
            backgroundColor: fillColor,
            transform: motionOwned ? 'scaleY(0)' : `scaleY(${progress})`,
            transformOrigin: 'top center',
          }}
          data-pf-no-color-transition=""
        />
      </div>
    </div>
  );
}

function MilestoneExperienceEntry({
  period,
  title,
  organization,
  description,
  status,
  tasks,
  tools,
  toolsLabel,
  links,
  location,
  employmentType,
  accent,
  titleColor,
  mutedColor,
  bodyColor,
  isDark,
  isLast,
  index,
  presentation,
}: {
  period: string | null;
  title: string | null;
  organization: string | null;
  description: string | null;
  status: ExperienceBlockStatus | null;
  tasks: string[];
  tools: string[];
  toolsLabel: string;
  links: ExperienceProofLink[];
  location: string | null;
  employmentType: ExperienceEmploymentType | null;
  accent: string;
  titleColor: string;
  mutedColor: string;
  bodyColor: string;
  isDark: boolean;
  isLast: boolean;
  index: number;
  presentation: PortfolioExperiencePresentationSettings;
}) {
  const articleRef = useRef<HTMLElement | null>(null);
  const displayYear = extractMilestoneDisplayYear(period);
  const secondary = experienceSecondaryStatusColor(presentation);
  const stackLabel = resolveExperienceBlockLabel(toolsLabel, 'Stack');
  const metaParts = [
    organization?.trim() || '',
    location?.trim() || '',
    employmentTypeLabel(employmentType),
  ].filter(Boolean);
  const cardStyle: CSSProperties = isDark
    ? {
        borderColor: 'rgba(255,255,255,0.1)',
        backgroundColor: 'rgba(255,255,255,0.04)',
      }
    : {
        borderColor: 'rgba(0,0,0,0.08)',
        backgroundColor: 'rgba(0,0,0,0.025)',
      };
  const softBodyColor = `color-mix(in srgb, ${bodyColor} 68%, transparent)`;
  const softTaskMuted = `color-mix(in srgb, ${mutedColor} 75%, transparent)`;
  const softMetaColor = `color-mix(in srgb, ${mutedColor} 88%, transparent)`;
  const linkVariant = resolveExperienceRepoLinkStyle(presentation.repoLinkButtonStyle, 'milestone');
  const linkPalette = experienceLinkButtonPalette({
    ink: titleColor,
    muted: mutedColor,
    accent,
    background: presentation.sectionBackgroundColor?.trim(),
    isDark,
  });
  return (
    <article
      ref={articleRef}
      className={`${MILESTONE_ENTRY_GRID_CLASS} gap-4 ${isLast ? 'pb-2' : 'pb-12 sm:pb-16'}`}
      {...(index === 0 ? { 'data-pf-exp-lead-card': '' } : {})}
    >
      {/* Top padding mirrors the card so 2022 sits on the title’s first line. */}
      <div
        className={`flex items-start gap-3 pt-5 sm:flex sm:flex-col sm:pt-6 lg:pt-7 ${
          accentYearsGridAnchorEnabled(presentation) ? 'sm:items-start' : 'sm:items-end'
        }`}
      >
        <div
          className={`min-w-0 w-full text-left ${
            accentYearsGridAnchorEnabled(presentation) ? '' : 'sm:pr-1 sm:text-right'
          }`}
        >
          <p
            className="font-semibold tabular-nums leading-none tracking-[-0.035em] text-[clamp(2.35rem,5.5vw,3.35rem)]"
            style={{ color: titleColor, opacity: 0.96 }}
          >
            {displayYear}
          </p>
          {period && period !== displayYear ? (
            <p
              className="mt-2.5 hidden text-[0.72rem] font-medium uppercase tracking-[0.14em] sm:block"
              style={{ color: softMetaColor }}
            >
              {period}
            </p>
          ) : null}
        </div>
      </div>

      <MilestoneTimelineRail
        articleRef={articleRef}
        isLast={isLast}
        isDark={isDark}
        isLead={index === 0}
      />

      <div
        className="min-w-0 max-w-3xl rounded-[1.35rem] border px-5 py-5 sm:rounded-[1.5rem] sm:px-7 sm:py-6 lg:px-8 lg:py-7"
        style={cardStyle}
      >
        <div className="flex flex-col lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(10rem,13rem)] lg:items-start lg:gap-x-8 xl:gap-x-10">
          {title ? (
            <h4
              className="pf-exp-lead-reveal pf-exp-ms-copy m-0 p-0 text-left text-[1.45rem] font-semibold leading-[1.12] tracking-[-0.035em] sm:text-[1.75rem] lg:col-start-1 lg:row-start-1 lg:text-[2rem]"
              style={{ color: titleColor }}
              data-pf-lead-step="1"
              data-pf-no-color-transition=""
            >
              {title}
            </h4>
          ) : null}

          {metaParts.length > 0 || status === 'ONGOING' || status === 'FINISHED' ? (
            <aside
              className={`pf-exp-lead-reveal pf-exp-ms-meta flex flex-wrap items-center gap-x-3 gap-y-2 ${
                title ? 'mt-3.5' : ''
              } lg:col-start-2 ${
                description
                  ? 'lg:row-start-2 lg:mt-6 lg:pt-[0.4rem]'
                  : 'lg:row-start-1 lg:mt-0 lg:self-center'
              } lg:flex-col lg:items-end lg:justify-start lg:self-start`}
              data-pf-lead-step="3"
              data-pf-no-color-transition=""
            >
              {metaParts.length > 0 ? (
                <p
                  className="text-[0.8125rem] font-medium lg:text-right sm:text-sm"
                  style={{ color: softMetaColor }}
                >
                  {metaParts.join(' · ')}
                </p>
              ) : null}
              <ExperienceEditorialOngoingBadge
                status={status}
                isDark={isDark}
                accentColor={accent}
                secondaryColor={secondary}
              />
            </aside>
          ) : null}

          {description ? (
            <p
              className={`pf-exp-lead-reveal pf-exp-ms-copy m-0 max-w-2xl p-0 text-left text-[0.98rem] leading-[1.8] sm:text-[1.05rem] ${
                title ? 'mt-5 sm:mt-6' : ''
              } lg:col-start-1 lg:row-start-2`}
              style={{ color: softBodyColor }}
              data-pf-lead-step="2"
              data-pf-no-color-transition=""
            >
              {description}
            </p>
          ) : null}

          <div className="lg:col-start-1 lg:row-start-3">
            {tasks.length > 0 ? (
              <div
                className="pf-exp-lead-reveal mt-7 sm:mt-8 [&_ul]:space-y-3.5 sm:[&_ul]:space-y-4"
                data-pf-lead-step="4"
                data-pf-no-color-transition=""
              >
                <ExperienceTasksDisplay
                  tasks={tasks}
                  display={presentation.tasksDisplay ?? 'editorial-dash'}
                  bodyColor={softBodyColor}
                  mutedColor={softTaskMuted}
                  isDark={isDark}
                  label={resolveExperienceBlockLabel(presentation.tasksLabel, 'Responsibilities')}
                  size="lg"
                />
              </div>
            ) : null}

            {tools.length > 0 ? (
              <div
                className="mt-8 border-t pt-6 sm:mt-9 sm:pt-7"
                style={{ borderColor: cardStyle.borderColor }}
              >
                {stackLabel ? (
                  <p
                    className="mb-3.5 text-[0.68rem] font-bold uppercase tracking-[0.18em]"
                    style={{ color: softMetaColor }}
                  >
                    {stackLabel}
                  </p>
                ) : null}
                <ExperienceToolsDisplay
                  tools={tools}
                  style={presentation.toolsBadgeStyle}
                  ink={titleColor}
                  muted={mutedColor}
                  background={presentation.sectionBackgroundColor?.trim() || DEFAULT_SECTION_BACKGROUND_COLOR}
                  isDark={isDark}
                />
              </div>
            ) : null}

            {links.length > 0 ? (
              <div className="mt-7 flex flex-col items-start gap-2.5 sm:mt-8">
                {links.map((link) => (
                  <PortfolioLinkButton
                    key={link.id}
                    variant={linkVariant}
                    href={link.url}
                    label={link.label || 'View repository'}
                    palette={linkPalette}
                  />
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}

function MilestoneExperienceBlock({
  block,
  index = 0,
  isLast = false,
  presentation = DEFAULT_EXPERIENCE_PRESENTATION,
}: {
  block: ProfileMediaBlock;
  index?: number;
  isLast?: boolean;
  presentation?: PortfolioExperiencePresentationSettings;
}) {
  const {
    period,
    title,
    organization,
    description,
    status,
    tasks,
    tools,
    links,
    location,
    employmentType,
  } = resolveExperienceContent(block);

  const accent = experienceAccentColor(presentation.accentColor);
  const isDark = presentation.activeColorMode !== 'light';
  const colorMode = resolveExperienceColorMode(presentation);
  const styles = normalizeExperienceElementStyles(presentation.elementStyles);

  const titleColor = ensureExperienceInkContrast(
    presentation.titleColor?.trim() || resolveExperienceTextColor(styles.title, colorMode),
    isDark,
    DEFAULT_EXPERIENCE_TITLE_COLOR,
    DEFAULT_EXPERIENCE_TITLE_COLOR_DARK
  );
  const mutedColor = ensureExperienceInkContrast(
    presentation.subtitleColor?.trim() || resolveExperienceTextColor(styles.meta, colorMode),
    isDark,
    DEFAULT_EXPERIENCE_MUTED_COLOR,
    DEFAULT_EXPERIENCE_MUTED_COLOR_DARK
  );
  const bodyColor = ensureExperienceInkContrast(
    resolveExperienceTextColor(styles.tasks, colorMode) ||
      resolveExperienceTextColor(styles.description, colorMode),
    isDark,
    DEFAULT_EXPERIENCE_BODY_COLOR,
    DEFAULT_EXPERIENCE_BODY_COLOR_DARK
  );

  return (
    <MilestoneExperienceEntry
      period={presentation.showPeriod ? period : null}
      title={presentation.showTitle ? title : null}
      organization={presentation.showOrganization ? organization : null}
      description={presentation.showDescription ? description : null}
      status={presentation.showMeta ? status : null}
      tasks={presentation.showTasks ? tasks : []}
      tools={presentation.showTools ? tools : []}
      toolsLabel={presentation.toolsLabel}
      links={presentation.showProof ? links : []}
      location={presentation.showMeta ? location : null}
      employmentType={presentation.showMeta ? employmentType : null}
      accent={accent}
      titleColor={titleColor}
      mutedColor={mutedColor}
      bodyColor={bodyColor}
      isDark={isDark}
      isLast={isLast}
      index={index}
      presentation={presentation}
    />
  );
}

export function MilestoneExperienceList({
  blocks,
  presentation = DEFAULT_EXPERIENCE_PRESENTATION,
  motionProfile = DEFAULT_MOTION_PROFILE,
  forceSingleColumn = false,
}: {
  blocks: ProfileMediaBlock[];
  presentation?: PortfolioExperiencePresentationSettings;
  motionProfile?: PortfolioGlobalMotionProfile;
  forceSingleColumn?: boolean;
}) {
  if (blocks.length === 0) return null;

  const flatMotionTiming = {
    ...defaultMotionTimingForProfile(motionProfile),
    hoverLift: 0,
    hoverShadowSize: 0,
    hoverShadowOpacity: 0,
  };

  return (
    <div
      className={experienceListShellClass(
        forceSingleColumn ? 'full' : presentation.listMaxWidth,
        forceSingleColumn ? 'left' : presentation.listPlacement
      )}
    >
      <div className="space-y-0">
        {blocks.map((block, index) => {
          const entry = (
            <MilestoneExperienceBlock
              block={block}
              index={index}
              isLast={index === blocks.length - 1}
              presentation={presentation}
            />
          );
          if (index === 0) {
            return (
              <div key={block.id} className="h-full">
                {entry}
              </div>
            );
          }
          return (
            <PortfolioMotionItem
              key={block.id}
              profile={motionProfile}
              index={index}
              className="h-full"
              timing={flatMotionTiming}
            >
              {entry}
            </PortfolioMotionItem>
          );
        })}
      </div>
    </div>
  );
}

function TableExperienceStatusCell({
  status,
  titleColor,
  mutedColor,
  secondaryColor,
}: {
  status: ExperienceBlockStatus | null;
  titleColor: string;
  mutedColor: string;
  secondaryColor: string;
}) {
  if (status !== 'ONGOING' && status !== 'FINISHED') {
    return <span style={{ color: mutedColor }}>—</span>;
  }
  const isOngoing = status === 'ONGOING';
  return (
    <span
      className="inline-flex items-center gap-2.5 text-[0.98rem] font-medium sm:text-[1.05rem]"
      style={{ color: isOngoing ? titleColor : secondaryColor }}
    >
      <span
        className="h-2 w-2 shrink-0 rounded-full"
        style={{ backgroundColor: isOngoing ? titleColor : secondaryColor }}
        aria-hidden
      />
      {isOngoing ? 'Ongoing' : 'Completed'}
    </span>
  );
}

function TableExperienceRow({
  period,
  title,
  organization,
  description,
  status,
  tasks,
  tools,
  links,
  location,
  employmentType,
  accent,
  secondaryColor,
  titleColor,
  mutedColor,
  isDark,
  expanded,
  onExpandedChange,
  hairlineColor,
  tasksDisplay = 'editorial-dash',
  toolsBadgeStyle = 'mineral-pills',
  striped = false,
  rowIndex = 0,
  repoLinkButtonStyle = 'icon',
  background,
}: {
  period: string | null;
  title: string | null;
  organization: string | null;
  description: string | null;
  status: ExperienceBlockStatus | null;
  tasks: string[];
  tools: string[];
  links: ExperienceProofLink[];
  location: string | null;
  employmentType: ExperienceEmploymentType | null;
  accent: string;
  secondaryColor: string;
  titleColor: string;
  mutedColor: string;
  bodyColor: string;
  isDark: boolean;
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  hairlineColor: string;
  tasksDisplay?: PortfolioExperienceTasksDisplay;
  toolsBadgeStyle?: PortfolioExperienceToolsBadgeStyle;
  striped?: boolean;
  rowIndex?: number;
  repoLinkButtonStyle?: PortfolioExperienceRepoLinkStyle;
  background?: string;
}) {
  const reduceMotion = useReducedMotion();
  const motionDisabled = reduceMotion === true;
  const orgMeta = [
    location?.trim() || '',
    employmentTypeLabel(employmentType),
  ]
    .filter(Boolean)
    .join(' · ');
  const hasDetails =
    Boolean(description?.trim()) || tasks.length > 0 || tools.length > 0 || links.length > 0;
  const panelTransition = motionDisabled
    ? { duration: 0 }
    : {
        height: { duration: 0.34, ease: [0.22, 1, 0.36, 1] as const },
        opacity: { duration: 0.22, ease: 'easeOut' as const },
      };
  const stripeBackground =
    striped && rowIndex % 2 === 1
      ? isDark
        ? 'rgba(255,255,255,0.035)'
        : 'rgba(0,0,0,0.03)'
      : 'transparent';

  const toggle = () => {
    if (!hasDetails) return;
    onExpandedChange(!expanded);
  };

  return (
    <div
      style={{
        borderBottom: `1px solid ${hairlineColor}`,
        backgroundColor: stripeBackground,
      }}
    >
      <button
        type="button"
        className="grid w-full grid-cols-1 gap-3 py-7 text-left sm:grid-cols-[8.5rem_minmax(0,1.4fr)_minmax(0,0.9fr)_8.5rem_2rem] sm:items-start sm:gap-x-5 sm:py-8 lg:grid-cols-[9.5rem_minmax(0,1.5fr)_minmax(0,1fr)_9rem_2.25rem] lg:gap-x-6"
        onClick={toggle}
        aria-expanded={hasDetails ? expanded : undefined}
        disabled={!hasDetails}
      >
        <p
          className="text-[1rem] tabular-nums leading-snug sm:pt-1 sm:text-[1.05rem]"
          style={{ color: mutedColor }}
        >
          {period || '—'}
        </p>

        <div className="min-w-0">
          {title ? (
            <p
              className="text-[1.2rem] font-semibold leading-[1.2] tracking-[-0.02em] sm:text-[1.4rem] lg:text-[1.55rem]"
              style={{ color: titleColor }}
            >
              {title}
            </p>
          ) : null}
        </div>

        <div className="min-w-0 sm:pt-1">
          {organization ? (
            <p
              className="text-[1.02rem] font-medium leading-snug sm:text-[1.08rem]"
              style={{ color: mutedColor }}
            >
              {organization}
            </p>
          ) : null}
          {orgMeta ? (
            <p
              className="mt-1.5 text-[0.9rem] sm:text-[0.95rem]"
              style={{ color: mutedColor, opacity: 0.85 }}
            >
              {orgMeta}
            </p>
          ) : null}
        </div>

        <div className="sm:pt-1">
          <TableExperienceStatusCell
            status={status}
            titleColor={titleColor}
            mutedColor={mutedColor}
            secondaryColor={secondaryColor}
          />
        </div>

        <div className="hidden items-start justify-end pt-1 sm:flex" aria-hidden>
          {hasDetails ? (
            <motion.span
              className="block text-lg leading-none sm:text-xl"
              style={{ color: mutedColor }}
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={motionDisabled ? { duration: 0 } : { duration: 0.22 }}
            >
              ▾
            </motion.span>
          ) : null}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {expanded && hasDetails ? (
          <motion.div
            key="table-experience-panel"
            initial={motionDisabled ? false : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={motionDisabled ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={panelTransition}
            className="overflow-hidden"
          >
            <div className="pb-10 sm:grid sm:grid-cols-[8.5rem_minmax(0,1fr)] sm:gap-x-5 sm:pb-11 lg:grid-cols-[9.5rem_minmax(0,1fr)] lg:gap-x-6">
              <div className="hidden sm:block" aria-hidden />
              <div className="max-w-2xl space-y-9 sm:space-y-11">
                {description ? (
                  <p
                    className="text-[0.98rem] leading-[1.8] sm:text-[1.05rem]"
                    style={{
                      color: `color-mix(in srgb, ${titleColor} 58%, transparent)`,
                    }}
                  >
                    {description}
                  </p>
                ) : null}

                {tasks.length > 0 ? (
                  <div className="[&_ul]:space-y-5 sm:[&_ul]:space-y-6 [&_.pf-exp-tasks-timeline]:space-y-1 [&_.pf-exp-tasks-grid]:gap-3">
                    <ExperienceTasksDisplay
                      tasks={tasks}
                      display={tasksDisplay}
                      bodyColor={`color-mix(in srgb, ${titleColor} 58%, transparent)`}
                      mutedColor={`color-mix(in srgb, ${titleColor} 42%, transparent)`}
                      isDark={isDark}
                      label=""
                      size="lg"
                    />
                  </div>
                ) : null}

                {tools.length > 0 ? (
                  <div className="pt-1">
                    <ExperienceToolsDisplay
                      tools={tools}
                      style={toolsBadgeStyle}
                      ink={titleColor}
                      muted={mutedColor}
                      background={background || DEFAULT_SECTION_BACKGROUND_COLOR}
                      isDark={isDark}
                    />
                  </div>
                ) : null}

                {links.length > 0 ? (
                  <div className="flex flex-col items-start gap-2.5 pt-1">
                    {links.map((link) => (
                      <PortfolioLinkButton
                        key={link.id}
                        variant={repoLinkButtonStyle}
                        href={link.url}
                        label={link.label || 'View repository'}
                        palette={experienceLinkButtonPalette({
                          ink: titleColor,
                          muted: mutedColor,
                          accent,
                          background,
                          border: hairlineColor,
                          isDark,
                        })}
                        onClick={(event) => event.stopPropagation()}
                      />
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function TableExperienceBlock({
  block,
  presentation = DEFAULT_EXPERIENCE_PRESENTATION,
  expanded,
  onExpandedChange,
  hairlineColor,
  rowIndex = 0,
}: {
  block: ProfileMediaBlock;
  presentation?: PortfolioExperiencePresentationSettings;
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  hairlineColor: string;
  rowIndex?: number;
}) {
  const {
    period,
    title,
    organization,
    description,
    status,
    tasks,
    tools,
    links,
    location,
    employmentType,
  } = resolveExperienceContent(block);

  const accent = experienceAccentColor(presentation.accentColor);
  const secondary = experienceSecondaryStatusColor(presentation);
  const isDark = presentation.activeColorMode !== 'light';
  const colorMode = resolveExperienceColorMode(presentation);
  const styles = normalizeExperienceElementStyles(presentation.elementStyles);

  const titleColor = ensureExperienceInkContrast(
    presentation.titleColor?.trim() || resolveExperienceTextColor(styles.title, colorMode),
    isDark,
    DEFAULT_EXPERIENCE_TITLE_COLOR,
    DEFAULT_EXPERIENCE_TITLE_COLOR_DARK
  );
  const mutedColor = ensureExperienceInkContrast(
    presentation.subtitleColor?.trim() || resolveExperienceTextColor(styles.meta, colorMode),
    isDark,
    DEFAULT_EXPERIENCE_MUTED_COLOR,
    DEFAULT_EXPERIENCE_MUTED_COLOR_DARK
  );
  const bodyColor = ensureExperienceInkContrast(
    resolveExperienceTextColor(styles.tasks, colorMode) ||
      resolveExperienceTextColor(styles.description, colorMode),
    isDark,
    DEFAULT_EXPERIENCE_BODY_COLOR,
    DEFAULT_EXPERIENCE_BODY_COLOR_DARK
  );

  return (
    <TableExperienceRow
      secondaryColor={secondary}
      period={presentation.showPeriod ? period : null}
      title={presentation.showTitle ? title : null}
      organization={presentation.showOrganization ? organization : null}
      description={presentation.showDescription ? description : null}
      status={presentation.showMeta ? status : null}
      tasks={presentation.showTasks ? tasks : []}
      tools={presentation.showTools ? tools : []}
      links={presentation.showProof ? links : []}
      location={presentation.showMeta ? location : null}
      employmentType={presentation.showMeta ? employmentType : null}
      accent={accent}
      titleColor={titleColor}
      mutedColor={mutedColor}
      bodyColor={bodyColor}
      isDark={isDark}
      expanded={expanded}
      onExpandedChange={onExpandedChange}
      hairlineColor={hairlineColor}
      tasksDisplay={presentation.tasksDisplay ?? 'editorial-dash'}
      toolsBadgeStyle={presentation.toolsBadgeStyle ?? 'mineral-pills'}
      striped={presentation.tableStripedRows === true}
      rowIndex={rowIndex}
      repoLinkButtonStyle={resolveExperienceRepoLinkStyle(presentation.repoLinkButtonStyle, 'table')}
      background={presentation.sectionBackgroundColor?.trim()}
    />
  );
}

export function TableExperienceHeader({
  sectionTitle,
  years,
  presentation = DEFAULT_EXPERIENCE_PRESENTATION,
}: {
  sectionTitle: string;
  sectionSubtitle?: string;
  years?: number | null;
  presentation?: PortfolioExperiencePresentationSettings;
}) {
  const headerRef = useRef<HTMLElement>(null);
  const labelRef = useRef<HTMLParagraphElement>(null);
  const leadRef = useRef<HTMLHeadingElement>(null);
  const lineRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const introPlayedRef = useRef(false);
  const reduceMotion = useReducedMotion();

  const isDark = presentation.activeColorMode !== 'light';
  const colorMode = resolveExperienceColorMode(presentation);
  const styles = normalizeExperienceElementStyles(presentation.elementStyles);
  const titleColor = ensureExperienceInkContrast(
    presentation.titleColor?.trim() || resolveExperienceTextColor(styles.title, colorMode),
    isDark,
    DEFAULT_EXPERIENCE_TITLE_COLOR,
    DEFAULT_EXPERIENCE_TITLE_COLOR_DARK
  );
  const ink = resolveSerifLeadInkColor(presentation, titleColor);
  const { label, title } = resolveSerifLeadCopy(years, sectionTitle, presentation);
  const lines = splitSerifLeadLines(title);
  const lineKey = lines.join('\n');

  const align = presentation.serifLeadAlign ?? 'left';
  const weight = presentation.serifLeadWeight ?? 'medium';
  const scale = presentation.serifLeadScale ?? 'default';
  const maxWidth = presentation.serifLeadMaxWidth ?? 'narrow';
  const lineHeight = presentation.serifLeadLineHeight ?? 'tight';
  const tracking = presentation.serifLeadTracking ?? 'editorial';
  const italic = presentation.serifLeadItalic === true;
  const motionEnabled = presentation.serifLeadMotion !== false;
  const labelOpacity = presentation.serifLeadLabelOpacity ?? 'muted';
  const divider = presentation.serifLeadDivider ?? 'none';
  const dividerOpacity = presentation.serifLeadDividerOpacity ?? 'ghost';
  const labelAlpha = SERIF_LEAD_LABEL_OPACITY[labelOpacity] ?? SERIF_LEAD_LABEL_OPACITY.muted;
  const accent = experienceAccentColor(presentation.accentColor);
  const dividerColor =
    dividerOpacity === 'accent'
      ? accent
      : dividerOpacity === 'subtle'
        ? `color-mix(in srgb, ${ink} 18%, transparent)`
        : `color-mix(in srgb, ${ink} 8%, transparent)`;

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;
    const header = headerRef.current;
    const labelEl = labelRef.current;
    const leadBlock = leadRef.current;
    if (!header || !labelEl) return;

    gsap.registerPlugin(ScrollTrigger);
    const reduced = reduceMotion === true;
    const scroller = getScrollParent(header) ?? undefined;
    const lineEls = lineRefs.current.filter((node): node is HTMLSpanElement => Boolean(node));

    const ctx = gsap.context(() => {
      const bindScrollMotion = () => {
        if (reduced || !motionEnabled) return;
        const fade = gsap.timeline({
          scrollTrigger: {
            trigger: header,
            scroller,
            start: 'top 52%',
            end: 'top 0%',
            scrub: 0.45,
            invalidateOnRefresh: true,
          },
        });
        fade.fromTo(labelEl, { y: 0 }, { y: -26, ease: 'none' }, 0);
        if (leadBlock) {
          const slideX = align === 'right' ? 16 : align === 'center' ? 0 : -16;
          fade.fromTo(
            leadBlock,
            { x: 0, opacity: 1 },
            { x: 0, opacity: 1, duration: 0.22, ease: 'none' },
            0
          );
          fade.to(leadBlock, { x: slideX, opacity: 0, duration: 0.78, ease: 'power1.in' }, 0.22);
        }
      };

      if (!motionEnabled || introPlayedRef.current || reduced) {
        gsap.set(labelEl, { opacity: 1, y: 0 });
        if (lineEls.length) gsap.set(lineEls, { yPercent: 0 });
        if (leadBlock) gsap.set(leadBlock, { x: 0, opacity: 1 });
        introPlayedRef.current = true;
        bindScrollMotion();
        return;
      }

      introPlayedRef.current = true;
      gsap.set(labelEl, { opacity: 0 });
      if (lineEls.length) gsap.set(lineEls, { yPercent: 110 });
      if (leadBlock) gsap.set(leadBlock, { x: 0, opacity: 1 });

      const intro = gsap.timeline({
        defaults: { overwrite: true },
        onComplete: bindScrollMotion,
      });
      intro.to(labelEl, { opacity: 1, duration: 0.7, ease: 'power2.out' });
      if (lineEls.length) {
        intro.to(
          lineEls,
          { yPercent: 0, duration: 0.95, ease: 'power3.out', stagger: 0.14 },
          0.12
        );
      }
    }, header);

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
      ctx.revert();
      if (!header.isConnected) introPlayedRef.current = false;
    };
  }, [align, lineKey, motionEnabled, reduceMotion]);

  useLayoutEffect(() => {
    const refreshId = window.setTimeout(() => ScrollTrigger.refresh(), 40);
    return () => window.clearTimeout(refreshId);
  }, [align, divider, italic, lineHeight, maxWidth, scale, tracking, weight]);

  return (
    <header
      ref={headerRef}
      className="pf-exp-serif-header"
      data-align={align}
      data-scale={scale}
      data-italic={italic ? 'true' : 'false'}
      style={
        {
          '--pf-exp-serif-lead-weight': String(SERIF_LEAD_WEIGHT[weight]),
          '--pf-exp-serif-lead-width': SERIF_LEAD_WIDTH[maxWidth],
          '--pf-exp-serif-lead-lh': String(SERIF_LEAD_LINE_HEIGHT[lineHeight]),
          '--pf-exp-serif-lead-tracking': SERIF_LEAD_TRACKING[tracking],
          '--pf-exp-serif-divider-color': dividerColor,
        } as CSSProperties
      }
    >
      <p
        ref={labelRef}
        className="pf-exp-serif-label"
        style={{ color: `color-mix(in srgb, ${ink} ${Math.round(labelAlpha * 100)}%, transparent)` }}
      >
        {label}
      </p>
      {lines.length > 0 ? (
        <h2
          ref={leadRef}
          className="pf-exp-serif-lead"
          style={{ color: ink, fontFamily: SERIF }}
        >
          {lines.map((line, index) => (
            <span key={`${line}-${index}`} className="pf-exp-serif-line-mask">
              <span
                ref={(node) => {
                  lineRefs.current[index] = node;
                }}
                className="pf-exp-serif-line"
              >
                {line}
              </span>
            </span>
          ))}
        </h2>
      ) : null}
      {divider !== 'none' ? (
        <div className="pf-exp-serif-divider" data-style={divider} aria-hidden />
      ) : null}
    </header>
  );
}

export function CardsExperienceHeader({
  sectionTitle,
  sectionSubtitle,
  years,
  presentation = DEFAULT_EXPERIENCE_PRESENTATION,
}: {
  sectionTitle: string;
  sectionSubtitle?: string;
  years?: number | null;
  presentation?: PortfolioExperiencePresentationSettings;
}) {
  const isDark = presentation.activeColorMode !== 'light';
  const colorMode = resolveExperienceColorMode(presentation);
  const styles = normalizeExperienceElementStyles(presentation.elementStyles);
  const titleColor = ensureExperienceInkContrast(
    presentation.titleColor?.trim() || resolveExperienceTextColor(styles.title, colorMode),
    isDark,
    DEFAULT_EXPERIENCE_TITLE_COLOR,
    DEFAULT_EXPERIENCE_TITLE_COLOR_DARK
  );
  const mutedColor = ensureExperienceInkContrast(
    presentation.subtitleColor?.trim() || resolveExperienceTextColor(styles.meta, colorMode),
    isDark,
    DEFAULT_EXPERIENCE_MUTED_COLOR,
    DEFAULT_EXPERIENCE_MUTED_COLOR_DARK
  );

  const showYears = presentation.showYears && years != null && years > 0;
  const template = resolveExperienceYearsTemplate(presentation);
  const intro = showYears ? template.replaceAll('{years}', String(years)) : null;
  const subtitle = sectionSubtitle?.trim() || '';

  const hairlineColor = isDark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.12)';

  return (
    <header
      className="mb-10 w-full border-b pb-6 sm:mb-12 sm:pb-7 lg:mb-14 lg:pb-8"
      style={{ borderColor: hairlineColor }}
    >
      <div className="flex w-full flex-row items-baseline justify-between gap-4 sm:gap-6">
        <p
          className="shrink-0 text-[0.95rem] font-medium tracking-[-0.01em] sm:text-[1.05rem]"
          style={{ color: mutedColor }}
        >
          {sectionTitle || 'Experience'}
        </p>
        {intro ? (
          <h2
            className="min-w-0 flex-1 text-right font-serif text-[clamp(2.15rem,4.8vw,3.35rem)] font-medium leading-[1.12] tracking-[-0.035em]"
            style={{ color: titleColor, fontFamily: SERIF }}
          >
            {intro}
          </h2>
        ) : null}
      </div>
      {subtitle ? (
        <p
          className="mt-3 max-w-2xl text-[0.95rem] leading-relaxed sm:text-[1.02rem]"
          style={{ color: mutedColor }}
        >
          {subtitle}
        </p>
      ) : null}
    </header>
  );
}

export function TableExperienceList({
  blocks,
  presentation = DEFAULT_EXPERIENCE_PRESENTATION,
  motionProfile = DEFAULT_MOTION_PROFILE,
  forceSingleColumn = false,
}: {
  blocks: ProfileMediaBlock[];
  presentation?: PortfolioExperiencePresentationSettings;
  motionProfile?: PortfolioGlobalMotionProfile;
  forceSingleColumn?: boolean;
}) {
  const [openBlockId, setOpenBlockId] = useState<string | null>(() => blocks[0]?.id ?? null);
  const isDark = presentation.activeColorMode !== 'light';
  const colorMode = resolveExperienceColorMode(presentation);
  const styles = normalizeExperienceElementStyles(presentation.elementStyles);
  const mutedColor = ensureExperienceInkContrast(
    presentation.subtitleColor?.trim() || resolveExperienceTextColor(styles.meta, colorMode),
    isDark,
    DEFAULT_EXPERIENCE_MUTED_COLOR,
    DEFAULT_EXPERIENCE_MUTED_COLOR_DARK
  );
  const hairlineColor = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)';

  useEffect(() => {
    if (blocks.length === 0) {
      setOpenBlockId(null);
      return;
    }
    setOpenBlockId((current) => {
      if (current && blocks.some((block) => block.id === current)) return current;
      return blocks[0]?.id ?? null;
    });
  }, [blocks]);

  if (blocks.length === 0) return null;

  const flatMotionTiming = {
    ...defaultMotionTimingForProfile(motionProfile),
    hoverLift: 0,
    hoverShadowSize: 0,
    hoverShadowOpacity: 0,
  };

  return (
    <div
      className={experienceListShellClass(
        forceSingleColumn ? 'full' : presentation.listMaxWidth,
        forceSingleColumn ? 'left' : presentation.listPlacement
      )}
    >
      <div
        className="hidden border-b sm:grid sm:grid-cols-[8.5rem_minmax(0,1.4fr)_minmax(0,0.9fr)_8.5rem_2rem] sm:gap-x-5 sm:pb-3.5 lg:grid-cols-[9.5rem_minmax(0,1.5fr)_minmax(0,1fr)_9rem_2.25rem] lg:gap-x-6"
        style={{ borderColor: hairlineColor }}
      >
        {['Period', 'Role', 'Organization', 'Status', ''].map((label) => (
          <p
            key={label || 'chevron'}
            className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] sm:text-[0.78rem]"
            style={{ color: mutedColor }}
          >
            {label}
          </p>
        ))}
      </div>

      <div>
        {blocks.map((block, index) => (
          <PortfolioMotionItem
            key={block.id}
            profile={motionProfile}
            index={index}
            timing={flatMotionTiming}
          >
            <TableExperienceBlock
              block={block}
              presentation={presentation}
              expanded={openBlockId === block.id}
              onExpandedChange={(next) => setOpenBlockId(next ? block.id : null)}
              hairlineColor={hairlineColor}
              rowIndex={index}
            />
          </PortfolioMotionItem>
        ))}
      </div>
    </div>
  );
}

function formatExperienceCardTitle(title: string): string {
  const trimmed = title.trim();
  if (!trimmed) return trimmed;
  return trimmed.charAt(0).toLocaleUpperCase('fr-FR') + trimmed.slice(1);
}

/**
 * "View repository ↗" — hovering swaps the label (and the arrow) for an identical
 * copy that slides in from below while the original slides out the top, inside an
 * `overflow: hidden` mask. A single paused timeline drives both; leaving reverses
 * it, so a fast in/out never stutters.
 */
function CardsRepoLink({
  href,
  label,
  ink,
}: {
  href: string;
  label: string;
  ink: string;
}) {
  const textCloneRef = useRef<HTMLSpanElement | null>(null);
  const arrowCloneRef = useRef<SVGSVGElement | null>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  useLayoutEffect(() => {
    const textClone = textCloneRef.current;
    const arrowClone = arrowCloneRef.current;
    if (!textClone || !arrowClone) return undefined;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return undefined;
    }

    const tl = gsap.timeline({ paused: true, defaults: { duration: 0.5, ease: 'power3.inOut' } })
      .to(textClone.parentElement, { yPercent: -100 }, 0)
      .to(arrowClone.parentElement, { yPercent: -100 }, 0);
    timelineRef.current = tl;

    return () => {
      tl.kill();
      timelineRef.current = null;
    };
  }, [label]);

  const onEnter = () => timelineRef.current?.play();
  const onLeave = () => timelineRef.current?.reverse();

  const isExternal = /^https?:\/\//i.test(href);
  const anchorProps = isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {};

  return (
    <a
      href={href}
      {...anchorProps}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className="group/repo inline-flex items-center gap-2.5 text-[0.82rem] font-medium tracking-[0.02em] outline-none focus-visible:opacity-70"
      style={{ color: ink }}
      data-pf-no-color-transition=""
    >
      <span className="relative inline-block h-[1.2em] overflow-hidden">
        <span className="block">{label}</span>
        <span ref={textCloneRef} className="absolute inset-x-0 top-full block">
          {label}
        </span>
      </span>
      <span className="relative inline-block h-[1em] w-[1em] shrink-0 overflow-hidden" aria-hidden>
        <svg viewBox="0 0 16 16" className="absolute inset-0 h-full w-full" fill="none">
          <path
            d="M4 12L12 4M12 4H6M12 4V10"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <svg
          ref={arrowCloneRef}
          viewBox="0 0 16 16"
          className="absolute inset-x-0 top-full h-full w-full"
          fill="none"
        >
          <path
            d="M4 12L12 4M12 4H6M12 4V10"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </a>
  );
}

function CardsExperienceEntry({
  period,
  title,
  organization,
  description,
  status,
  tasks,
  tools,
  links,
  location,
  employmentType,
  accent,
  titleColor,
  mutedColor,
  bodyColor,
  isDark,
  presentation,
  stackIndex = 0,
}: {
  period: string | null;
  title: string | null;
  organization: string | null;
  description: string | null;
  status: ExperienceBlockStatus | null;
  tasks: string[];
  tools: string[];
  links: ExperienceProofLink[];
  location: string | null;
  employmentType: ExperienceEmploymentType | null;
  accent: string;
  titleColor: string;
  mutedColor: string;
  bodyColor: string;
  isDark: boolean;
  presentation: PortfolioExperiencePresentationSettings;
  stackIndex?: number;
}) {
  const reduceMotion = useReducedMotion();
  const articleRef = useRef<HTMLElement | null>(null);
  const titleInnerRef = useRef<HTMLSpanElement | null>(null);
  const descRef = useRef<HTMLParagraphElement | null>(null);
  const tasksListRef = useRef<HTMLDivElement | null>(null);

  const secondary = experienceSecondaryStatusColor(presentation);
  const metaParts = [
    organization?.trim() || '',
    location?.trim() || '',
    employmentTypeLabel(employmentType),
  ].filter(Boolean);
  const statusLabel = status === 'ONGOING' ? 'Ongoing' : status === 'FINISHED' ? 'Finished' : null;
  const statusColor = status === 'ONGOING' ? accent : secondary;
  // Period, status and org/role fold into one micro-typographic label line above
  // the title instead of a floating badge — each part keeps its own ink so the
  // status word still reads as a signal, not just more grey text.
  const labelParts: { text: string; color: string }[] = [];
  if (period) labelParts.push({ text: period, color: mutedColor });
  if (statusLabel) labelParts.push({ text: statusLabel, color: statusColor });
  metaParts.forEach((part) => labelParts.push({ text: part, color: mutedColor }));

  const sectionBg = presentation.sectionBackgroundColor?.trim() || DEFAULT_SECTION_BACKGROUND_COLOR;
  // Just opaque enough for the stacking cascade to cleanly cover the card underneath —
  // no border, no inner panel. Content floats straight on this near-flat backing.
  const cardStyle: CSSProperties = isDark
    ? { backgroundColor: `color-mix(in srgb, ${sectionBg} 97%, white 3%)` }
    : { backgroundColor: '#ffffff' };
  const spacing = experienceCardsElementSpacingClasses(presentation.cardsElementSpacing);
  const radiusClass = experienceCardsBorderRadiusClass(presentation.cardsBorderRadius);
  const hasContent = Boolean(description) || tasks.length > 0 || tools.length > 0;

  // Entrance, once per card: the title slides up out of its mask, the description
  // fades/slides in right after, then the task list cascades in at a tight stagger.
  // Tasks only get a plain rise+fade (no horizontal offset) — a per-item x jitter
  // was tailored to the old hardcoded numbered list and would misalign the grid/
  // timeline-rail layouts the shared display can now render (see tasksDisplay).
  useLayoutEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const article = articleRef.current;
    if (!article) return undefined;

    gsap.registerPlugin(ScrollTrigger);
    const scroller = getScrollParent(article) ?? undefined;
    const titleInner = titleInnerRef.current;
    const desc = descRef.current;
    const taskItems = tasksListRef.current
      ? Array.from(tasksListRef.current.querySelectorAll<HTMLElement>('[data-exp-task]'))
      : [];

    // Guards the sticky-stack recede effect in CardsExperienceList: that effect
    // reads this attribute per card and holds its recede progress at 0 until
    // the card reports itself 'true' here. Without it, a fast scroll can carry
    // the NEXT card all the way to fully covering this one (recede progress 1)
    // while this card's own title/description/tasks are still mid-reveal —
    // confirmed live: on a fast fling, the covering card locks in before this
    // one's entrance timeline (real-time, ~0.9s) has caught up to the scroll
    // position, so its content visibly snaps/finishes while already fading out
    // underneath the next card. Gating removes that race entirely instead of
    // just shortening the odds of hitting it.
    article.setAttribute('data-entrance-ready', 'false');

    const ctx = gsap.context(() => {
      if (reduceMotion) {
        if (titleInner) gsap.set(titleInner, { yPercent: 0 });
        if (desc) gsap.set(desc, { autoAlpha: 1, y: 0 });
        if (taskItems.length) gsap.set(taskItems, { autoAlpha: 1, y: 0 });
        article.setAttribute('data-entrance-ready', 'true');
        return;
      }

      if (titleInner) gsap.set(titleInner, { yPercent: 110 });
      if (desc) gsap.set(desc, { autoAlpha: 0, y: 14 });
      if (taskItems.length) gsap.set(taskItems, { autoAlpha: 0, y: 10 });

      const tl = gsap.timeline({
        scrollTrigger: { trigger: article, scroller, start: 'top 82%', once: true },
        // The reveal leaves opacity/visibility inline forever unless cleared —
        // hand them back to CSS once settled so the :has()-driven hover dim
        // below (data-exp-task) can still move this same opacity property.
        onComplete: () => {
          if (taskItems.length) gsap.set(taskItems, { clearProps: 'opacity,visibility' });
          article.setAttribute('data-entrance-ready', 'true');
        },
      });
      if (titleInner) tl.to(titleInner, { yPercent: 0, duration: 0.9, ease: 'power4.out' }, 0);
      if (desc) tl.to(desc, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power2.out' }, 0.22);
      if (taskItems.length) {
        tl.to(
          taskItems,
          { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.04, ease: 'power3.out' },
          0.32
        );
      }
    }, article);

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
      ctx.revert();
    };
  }, [reduceMotion, title, description, tasks.length]);

  return (
    <article
      ref={articleRef}
      data-entrance-ready="false"
      className={`pf-exp-cards-stack-card flex min-w-0 flex-col ${spacing.cardPad} ${radiusClass}`}
      style={{ ...cardStyle, zIndex: stackIndex + 1 }}
    >
      <div className="pf-exp-cards-stack-header">
        {labelParts.length > 0 ? (
          <p
            className="mb-4 flex flex-wrap items-center gap-x-2.5 text-[0.62rem] font-semibold uppercase sm:mb-5 sm:text-[0.66rem]"
            style={{ letterSpacing: '0.18em', opacity: 0.65 }}
          >
            {labelParts.map((part, index) => (
              <span key={`${part.text}-${index}`} className="flex items-center gap-x-2.5">
                {index > 0 ? (
                  <span aria-hidden style={{ color: mutedColor, opacity: 0.45 }}>
                    &middot;
                  </span>
                ) : null}
                <span style={{ color: part.color }}>{part.text}</span>
              </span>
            ))}
          </p>
        ) : null}
        {title ? (
          <h4
            className="overflow-hidden"
            style={{
              fontSize: experienceCardsTitleFontSize(presentation.cardsTitleSize),
              lineHeight: 0.95,
              fontFamily: SERIF,
            }}
          >
            <span ref={titleInnerRef} className="block" style={{ color: titleColor }}>
              {formatExperienceCardTitle(title)}
            </span>
          </h4>
        ) : null}
      </div>

      {hasContent ? (
        <div className="mt-14 flex flex-col gap-9 sm:mt-20 sm:gap-10 lg:mt-24">
          {description ? (
            <p
              ref={descRef}
              className="max-w-2xl"
              style={{
                color: bodyColor,
                opacity: 0.6,
                fontSize: '0.98rem',
                lineHeight: 1.7,
                fontWeight: 300,
              }}
            >
              {description}
            </p>
          ) : null}

          {tasks.length > 0 ? (
            <div ref={tasksListRef} className="pf-exp-cards-tasks">
              <ExperienceTasksDisplay
                tasks={tasks}
                display={presentation.tasksDisplay ?? 'editorial-dash'}
                bodyColor={bodyColor}
                mutedColor={mutedColor}
                isDark={isDark}
                label=""
                size="lg"
                strongIndex={(presentation.tasksDisplay ?? 'editorial-dash') === 'architectural-index'}
              />
            </div>
          ) : null}

          {tools.length > 0 ? (
            <ul className="flex flex-wrap gap-x-5 gap-y-2" aria-label="Stack">
              {tools.map((tool) => (
                <li
                  key={tool}
                  className="text-[0.62rem] font-medium uppercase"
                  style={{ color: mutedColor, opacity: 0.5, letterSpacing: '0.16em' }}
                >
                  {tool}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      {links.length > 0 ? (
        <div className={`${spacing.linksGap} flex flex-col items-start gap-3`}>
          {links.map((link) => (
            <CardsRepoLink
              key={link.id}
              href={link.url}
              label={link.label || 'View repository'}
              ink={titleColor}
            />
          ))}
        </div>
      ) : null}
    </article>
  );
}

function CardsExperienceBlock({
  block,
  presentation = DEFAULT_EXPERIENCE_PRESENTATION,
  stackIndex = 0,
}: {
  block: ProfileMediaBlock;
  presentation?: PortfolioExperiencePresentationSettings;
  stackIndex?: number;
}) {
  const {
    period,
    title,
    organization,
    description,
    status,
    tasks,
    tools,
    links,
    location,
    employmentType,
  } = resolveExperienceContent(block);

  const accent = experienceAccentColor(presentation.accentColor);
  const isDark = presentation.activeColorMode !== 'light';
  const colorMode = resolveExperienceColorMode(presentation);
  const styles = normalizeExperienceElementStyles(presentation.elementStyles);

  const titleColor = ensureExperienceInkContrast(
    presentation.titleColor?.trim() || resolveExperienceTextColor(styles.title, colorMode),
    isDark,
    DEFAULT_EXPERIENCE_TITLE_COLOR,
    DEFAULT_EXPERIENCE_TITLE_COLOR_DARK
  );
  const mutedColor = ensureExperienceInkContrast(
    presentation.subtitleColor?.trim() || resolveExperienceTextColor(styles.meta, colorMode),
    isDark,
    DEFAULT_EXPERIENCE_MUTED_COLOR,
    DEFAULT_EXPERIENCE_MUTED_COLOR_DARK
  );
  const bodyColor = ensureExperienceInkContrast(
    resolveExperienceTextColor(styles.tasks, colorMode) ||
      resolveExperienceTextColor(styles.description, colorMode),
    isDark,
    DEFAULT_EXPERIENCE_BODY_COLOR,
    DEFAULT_EXPERIENCE_BODY_COLOR_DARK
  );

  return (
    <CardsExperienceEntry
      period={presentation.showPeriod ? period : null}
      title={presentation.showTitle ? title : null}
      organization={presentation.showOrganization ? organization : null}
      description={presentation.showDescription ? description : null}
      status={presentation.showMeta ? status : null}
      tasks={presentation.showTasks ? tasks : []}
      tools={presentation.showTools ? tools : []}
      links={presentation.showProof ? links : []}
      location={presentation.showMeta ? location : null}
      employmentType={presentation.showMeta ? employmentType : null}
      accent={accent}
      titleColor={titleColor}
      mutedColor={mutedColor}
      bodyColor={bodyColor}
      isDark={isDark}
      presentation={presentation}
      stackIndex={stackIndex}
    />
  );
}

/** Sticky top offset (px) each stacked card locks to — keep in sync with the
 * --pf-exp-cards-stack-top CSS custom property (6rem) above. Used to time each card's
 * neighbor progress so it reaches 1 exactly as the next card locks into place. */
const CARDS_STACK_TOP_OFFSET_PX = 96;
/** "Escalier" depth cue: every card behind the current front one keeps a small,
 * fully-legible sliver peeking out above it — like a fanned deck of cards —
 * instead of receding to near-invisibility after just one card covers it.
 * transform: scale(1 - depth * SCALE_STEP) translateY(-depth * SINK_PX).
 * `depth` is a cumulative step count (see buildCardsStackDepths below), not
 * the single 0..1 progress against just the immediate next card: a card
 * already fully covered keeps climbing an extra notch every time one more
 * card arrives in front of it, which is what actually produces a multi-layer
 * staircase instead of one receded card with everything behind it hidden at
 * an identical, frozen offset. Scale is applied before translateY in the
 * transform string on purpose: translateY then runs in the already-scaled
 * coordinate space instead of a fixed screen-pixel offset.
 *
 * Deliberately NO opacity fade here (confirmed live, not just theorized): a
 * covering card needs to stay at true 100% opacity to fully occlude whatever
 * sits behind it — even a 2-3% reduction (e.g. depth ~0.3-0.4 on a gentle
 * curve) is enough for large/bold text on a light card to ghost faintly
 * through, since CSS opacity composites the whole subtree as one blended
 * layer. Position (translateY) is the only depth cue that can't leak — it's
 * a geometry change, not a transparency one, so full occlusion is guaranteed
 * regardless of how many steps a card has climbed. */
const CARDS_STACK_SCALE_STEP = 0.02;
const CARDS_STACK_SINK_PX = 20;

/** Cumulative per-card "steps buried" — depths[i] is how many full steps of
 * cover card i has accumulated from every card ahead of it (not just its
 * immediate neighbor), so cards already covered keep compacting further back
 * as more cards arrive in front instead of freezing the moment their own
 * direct neighbor locks. `stepProgress[k]` is the 0..1 approach progress of
 * card k+1 toward covering card k. Returns an array of length
 * `stepProgress.length + 1`; index `stepProgress.length` is the sentinel base
 * case (0) for the frontmost card, which is never covered. */
function buildCardsStackDepths(stepProgress: number[]): number[] {
  const depths = new Array<number>(stepProgress.length + 1).fill(0);
  for (let i = stepProgress.length - 1; i >= 0; i -= 1) {
    depths[i] = stepProgress[i] + depths[i + 1];
  }
  return depths;
}

export function CardsExperienceList({
  blocks,
  presentation = DEFAULT_EXPERIENCE_PRESENTATION,
  forceSingleColumn = false,
}: {
  blocks: ProfileMediaBlock[];
  presentation?: PortfolioExperiencePresentationSettings;
  motionProfile?: PortfolioGlobalMotionProfile;
  forceSingleColumn?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const stackRef = useRef<HTMLDivElement | null>(null);
  const cascadeEnabled = presentation.cardsStackEffect !== 'static';
  // Reactive (not a one-time matchMedia snapshot) so resizing/rotating across the
  // breakpoint tears down/recreates the scroll listener instead of leaving it stuck
  // at mount width. Gated on a fine pointer + hover, not just width: mobile/tablet
  // (touch, no hover) always gets the plain static stack, even when wide enough in
  // landscape to clear the desktop width — only a real desktop/laptop pointer gets
  // the sticky depth cascade, matching the CSS media query below.
  const isDesktopWidth = usePortfolioFinePointerDesktop(1024);

  // Equal card height (opt-in, "Equal card height" toggle): every card is
  // stretched to match the tallest one via min-height. Two reasons this needs
  // real measurement instead of a CSS-only fix: (1) cards are sequential sticky
  // siblings, not a grid row, so there's no `align-items: stretch` to reach
  // for; (2) it's not just cosmetic here — in cascade mode, a card that's
  // SHORTER than the one it's covering would leave that taller card visibly
  // peeking out underneath, since the cover is only as big as its own box.
  // Declared (and so runs) before the recede effect below, so that effect's
  // very first measurement already sees equalized heights.
  useLayoutEffect(() => {
    if (typeof window === 'undefined' || presentation.cardsEqualHeight !== true) return undefined;
    const stack = stackRef.current;
    if (!stack) return undefined;
    const cards = Array.from(
      stack.querySelectorAll<HTMLElement>(':scope > .pf-exp-cards-stack-item > .pf-exp-cards-stack-card')
    );
    if (cards.length < 2) return undefined;

    let ticking = false;
    const equalize = () => {
      ticking = false;
      // Reset first so a shorter card's real content height is what gets
      // measured, not a min-height this same effect applied last pass.
      cards.forEach((card) => {
        card.style.minHeight = '';
      });
      const tallest = Math.max(...cards.map((card) => card.getBoundingClientRect().height));
      cards.forEach((card) => {
        card.style.minHeight = `${Math.ceil(tallest)}px`;
      });
      // Equalizing changes document height/flow, which the per-card entrance
      // ScrollTriggers and the recede effect below both depend on.
      ScrollTrigger.refresh();
    };
    const onResize = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(equalize);
    };

    equalize();
    // Re-measure once more after webfonts finish loading — text set in a
    // fallback font can wrap differently once the real one swaps in.
    let cancelled = false;
    void document.fonts?.ready?.then(() => {
      if (!cancelled) equalize();
    });
    window.addEventListener('resize', onResize);

    return () => {
      cancelled = true;
      window.removeEventListener('resize', onResize);
      cards.forEach((card) => {
        card.style.minHeight = '';
      });
    };
  }, [
    blocks,
    presentation.cardsEqualHeight,
    presentation.cardsCardWidth,
    presentation.cardsElementSpacing,
    presentation.cardsTasksGap,
    presentation.cardsTitleSize,
    presentation.tasksDisplay,
    presentation.toolsBadgeStyle,
    presentation.showTitle,
    presentation.showPeriod,
    presentation.showOrganization,
    presentation.showMeta,
    presentation.showDescription,
    presentation.showTasks,
    presentation.showTools,
    presentation.showProof,
  ]);

  // Premium stacking-cards depth cue (desktop, cascade mode only): as the next card
  // slides up and locks into the shared sticky top, the card it's about to cover
  // shrinks + sinks + fades so it visually recedes behind it instead of just vanishing
  // underneath. CSS sticky alone already handles the full-cover pinning — this is
  // vanilla JS (no GSAP/ScrollTrigger) on purpose: getBoundingClientRect() on the next
  // card per frame, rAF-throttled via a ticking flag, listening on the actual scroll
  // container (not always `window` — this app also renders inside a nested
  // overflow-y:auto "pages" container, and a scroll listener on the wrong target
  // silently never fires).
  //
  // Gating: the per-section "Scroll cascade effect" toggle (`cascadeEnabled`) is the
  // sole on/off switch here, plus the desktop breakpoint. OS-level prefers-reduced-motion
  // is still respected for accessibility. Deliberately NOT gated behind the site's global
  // motionProfile ('none'/'editorial'/...) — that setting governs section entrance/reveal
  // animations elsewhere and is unrelated to this section's own dedicated toggle; gating on
  // it too made the global switch silently override the local one, which is surprising and
  // not what the local toggle is for.
  useLayoutEffect(() => {
    if (typeof window === 'undefined' || !cascadeEnabled || !isDesktopWidth || reduceMotion) {
      return;
    }
    const stack = stackRef.current;
    if (!stack) return;

    const items = Array.from(
      stack.querySelectorAll<HTMLElement>(':scope > .pf-exp-cards-stack-item')
    );
    const pairs = items
      .map((item, index) => ({
        card: item.querySelector<HTMLElement>('.pf-exp-cards-stack-card'),
        nextItem: items[index + 1],
      }))
      .filter(
        (pair): pair is { card: HTMLElement; nextItem: HTMLElement } =>
          Boolean(pair.card && pair.nextItem)
      );
    if (pairs.length === 0) return;

    const scrollTarget: EventTarget = getScrollParent(stack) ?? window;
    let ticking = false;

    const update = () => {
      ticking = false;
      // Distance a card travels from "just entering at the viewport bottom" to
      // "locked at the sticky top" — the same range the next card scrolls through
      // while it rises to cover the current one.
      const travel = Math.max(window.innerHeight - CARDS_STACK_TOP_OFFSET_PX, 1);
      const stepProgress = pairs.map(({ nextItem }) => {
        const remaining = nextItem.getBoundingClientRect().top - CARDS_STACK_TOP_OFFSET_PX;
        return Math.min(1, Math.max(0, 1 - remaining / travel));
      });
      const depths = buildCardsStackDepths(stepProgress);
      pairs.forEach(({ card }, i) => {
        let depth = depths[i];
        // Hold this card at depth 0 (fully shown, un-receded) until its own
        // entrance reveal (title/description/tasks) has actually finished — see
        // the 'data-entrance-ready' comment in CardsExperienceEntry. Without
        // this, a fast scroll can fully cover a card before its own content
        // has finished appearing, so its reveal visibly races the next card's
        // cover instead of the two happening one after the other.
        if (card.getAttribute('data-entrance-ready') !== 'true') depth = 0;
        const scale = 1 - depth * CARDS_STACK_SCALE_STEP;
        const sink = depth * CARDS_STACK_SINK_PX;
        card.style.transform = `scale(${scale}) translateY(-${sink}px)`;
      });
    };

    const onScrollOrResize = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    };

    update();
    scrollTarget.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize);

    return () => {
      scrollTarget.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
      pairs.forEach(({ card }) => {
        card.style.transform = '';
      });
    };
  }, [
    blocks,
    cascadeEnabled,
    isDesktopWidth,
    reduceMotion,
    presentation.cardsCardWidth,
    presentation.cardsVerticalGap,
  ]);

  if (blocks.length === 0) return null;

  return (
    <div
      className={experienceCardsCardWidthClass(
        forceSingleColumn ? 'full' : presentation.cardsCardWidth
      )}
    >
      <div
        ref={stackRef}
        className={`pf-exp-cards-stack${cascadeEnabled ? '' : ' pf-exp-cards-stack--static'}`}
        style={
          {
            ['--pf-exp-cards-vertical-gap' as string]: `${resolveExperienceCardsVerticalGapPx(
              presentation.cardsVerticalGap
            )}px`,
          } as CSSProperties
        }
      >
        {blocks.map((block, index) => (
          <div key={block.id} className="pf-exp-cards-stack-item" style={{ zIndex: index + 1 }}>
            <CardsExperienceBlock
              block={block}
              presentation={presentation}
              stackIndex={index}
            />
          </div>
        ))}
        {/* Keeps the last card pinned for the same scroll beat as the others. */}
        <div className="pf-exp-cards-stack-end" aria-hidden />
      </div>
    </div>
  );
}

/** Reel design: fixed headline font pair, independent of the site's configurable fonts. */
const REEL_SERIF = "'Fraunces', serif";
const REEL_SANS = "'Inter', sans-serif";

/** Reel design: the 4 ways "Ongoing / Completed" can be presented under Period & status. */
function ReelStatusIndicator({
  status,
  presentationStyle,
  accent,
  secondaryColor,
  bodyColor,
  hairline,
}: {
  status: 'ONGOING' | 'FINISHED';
  presentationStyle: PortfolioExperienceReelStatusStyle;
  accent: string;
  secondaryColor: string;
  bodyColor: string;
  hairline: string;
}) {
  const isFinished = status === 'FINISHED';
  const color = isFinished ? secondaryColor : accent;
  const label = isFinished ? 'Completed' : 'Ongoing';

  if (presentationStyle === 'minimal') {
    return (
      <div className="mt-7 flex items-center gap-2.5">
        <span
          className="h-2 w-2 shrink-0 animate-pulse rounded-full"
          style={{ backgroundColor: color }}
          aria-hidden
        />
        <span
          className="font-mono uppercase"
          style={{ color, fontSize: '0.8rem', letterSpacing: '0.08em' }}
        >
          {label}
        </span>
      </div>
    );
  }

  if (presentationStyle === 'bar') {
    return (
      <div className="mt-7 flex items-center gap-3">
        <span
          className="h-[2px] w-8 shrink-0 rounded-full"
          style={{
            background: isFinished ? color : `linear-gradient(to right, ${color}, transparent)`,
          }}
          aria-hidden
        />
        <span className="text-[0.85rem] font-medium" style={{ color: bodyColor, fontFamily: REEL_SANS }}>
          {label}
        </span>
      </div>
    );
  }

  if (presentationStyle === 'square') {
    return (
      <div className="mt-7 flex items-center gap-2.5">
        <span className="h-[0.55rem] w-[0.55rem] shrink-0" style={{ backgroundColor: color }} aria-hidden />
        <span className="text-[0.85rem] font-bold" style={{ color: bodyColor, fontFamily: REEL_SANS }}>
          {label}
        </span>
      </div>
    );
  }

  if (presentationStyle === 'plain') {
    return (
      <p
        className={`mt-7 text-[0.95rem] ${isFinished ? 'font-normal' : 'font-bold'}`}
        style={{ color, fontFamily: REEL_SANS }}
      >
        {label}
      </p>
    );
  }

  // 'badge' — pill chip with a checkmark (Completed) or dot (Ongoing) icon.
  return (
    <div
      className="mt-7 inline-flex items-center gap-2 rounded-full border px-3.5 py-[0.45rem]"
      style={{
        borderColor: hairline,
        backgroundColor: `color-mix(in srgb, ${color} 14%, transparent)`,
      }}
    >
      {isFinished ? (
        <svg viewBox="0 0 16 16" className="h-[0.85rem] w-[0.85rem]" fill="none" aria-hidden>
          <path
            d="M3.5 8.5L6.5 11.5L12.5 4.5"
            stroke={color}
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <span className="h-[0.5rem] w-[0.5rem] shrink-0 rounded-full" style={{ backgroundColor: color }} aria-hidden />
      )}
      <span className="text-[0.85rem] font-medium" style={{ color, fontFamily: REEL_SANS }}>
        {label}
      </span>
    </div>
  );
}

/** Scroll-driven warp on the faint index watermark — enters / settles / exits distorted. */
function ReelIndexWatermark({
  index,
  titleColor,
  sectionRef,
  enabled,
}: {
  index: number;
  titleColor: string;
  sectionRef: RefObject<HTMLElement | null>;
  enabled: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const digits = String(index + 1).padStart(2, '0').split('');
  const ink = `color-mix(in srgb, ${titleColor} 5%, transparent)`;
  const animate = enabled && !reduceMotion;

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const skewX = useTransform(scrollYProgress, [0, 0.32, 0.5, 0.68, 1], [22, 5, 0, -5, -20]);
  const scaleY = useTransform(scrollYProgress, [0, 0.32, 0.5, 0.68, 1], [1.55, 1.1, 1, 1.1, 1.5]);
  const scaleX = useTransform(scrollYProgress, [0, 0.5, 1], [0.78, 1, 0.8]);
  const y = useTransform(scrollYProgress, [0, 0.5, 1], [96, 0, -110]);
  const rotate = useTransform(scrollYProgress, [0, 0.5, 1], [-7, 0, 6]);
  const blurPx = useTransform(scrollYProgress, [0, 0.3, 0.5, 0.7, 1], [12, 2.5, 0, 2.5, 10]);
  const filter = useMotionTemplate`blur(${blurPx}px)`;
  const opacity = useTransform(scrollYProgress, [0, 0.22, 0.5, 0.78, 1], [0.15, 0.9, 1, 0.9, 0.12]);
  const tracking = useTransform(scrollYProgress, [0, 0.5, 1], ['0.18em', '0em', '0.14em']);

  // Second digit lags slightly — classic editorial “liquid type” feel.
  const digit1Y = useTransform(scrollYProgress, [0, 0.5, 1], [28, 0, -36]);
  const digit1Skew = useTransform(scrollYProgress, [0, 0.5, 1], [8, 0, -10]);

  if (!animate) {
    return (
      <div className="relative h-0">
        <span
          aria-hidden
          className="pointer-events-none absolute bottom-[1.5rem] right-[6vw] select-none text-[6rem] leading-none sm:bottom-[1.75rem] sm:text-[8.5rem]"
          style={{ color: ink, fontFamily: REEL_SERIF, fontWeight: 450 }}
        >
          {digits.join('')}
        </span>
      </div>
    );
  }

  return (
    <div className="relative h-0">
      <motion.span
        aria-hidden
        className="pointer-events-none absolute bottom-[1.5rem] right-[6vw] flex select-none text-[6rem] leading-none will-change-transform sm:bottom-[1.75rem] sm:text-[8.5rem]"
        style={{
          color: ink,
          fontFamily: REEL_SERIF,
          fontWeight: 450,
          skewX,
          scaleX,
          scaleY,
          y,
          rotate,
          filter,
          opacity,
          letterSpacing: tracking,
          transformOrigin: '100% 100%',
        }}
      >
        <motion.span style={{ display: 'inline-block' }}>{digits[0]}</motion.span>
        <motion.span style={{ display: 'inline-block', y: digit1Y, skewX: digit1Skew }}>
          {digits[1]}
        </motion.span>
      </motion.span>
    </div>
  );
}

const REEL_REVEAL_EASE = [0.22, 1, 0.36, 1] as const;

const reelRevealContainer = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.11, delayChildren: 0.06 },
  },
};

/** Pass stagger through layout wrappers (grid / columns) without animating the shell itself. */
const reelRevealPassThrough = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.11 },
  },
};

const reelRevealItem = {
  hidden: { opacity: 0, y: 42, filter: 'blur(10px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.85, ease: REEL_REVEAL_EASE },
  },
};

function ReelRevealItem({
  children,
  className,
  style,
  enabled,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  enabled: boolean;
}) {
  if (!enabled) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }
  return (
    <motion.div className={className} style={style} variants={reelRevealItem}>
      {children}
    </motion.div>
  );
}

function ReelRevealGroup({
  children,
  className,
  enabled,
}: {
  children: ReactNode;
  className?: string;
  enabled: boolean;
}) {
  if (!enabled) {
    return <div className={className}>{children}</div>;
  }
  return (
    <motion.div className={className} variants={reelRevealPassThrough}>
      {children}
    </motion.div>
  );
}

function reelTwoToneTitle(title: string, titleColor: string, mutedColor: string) {
  const words = title.trim().split(/\s+/);
  const lastWord = words.pop();
  const rest = words.join(' ');
  return (
    <>
      {rest ? <span style={{ color: titleColor }}>{rest} </span> : null}
      <span style={{ color: mutedColor }}>{lastWord}</span>
    </>
  );
}

function ReelExperienceEntry({
  index,
  block,
  accent,
  secondaryColor,
  titleColor,
  mutedColor,
  bodyColor,
  hairline,
  statusStyle,
  scrollMotion,
  background,
  repoLinkButtonStyle = 'icon',
  showProof = true,
  showTools = true,
}: {
  index: number;
  block: ProfileMediaBlock;
  accent: string;
  secondaryColor: string;
  titleColor: string;
  mutedColor: string;
  bodyColor: string;
  hairline: string;
  statusStyle: PortfolioExperienceReelStatusStyle;
  scrollMotion: PortfolioExperienceReelScrollMotion;
  background: string;
  repoLinkButtonStyle?: PortfolioExperienceRepoLinkStyle;
  showProof?: boolean;
  showTools?: boolean;
  isDark?: boolean;
}) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const reduceMotion = useReducedMotion();
  const fadeReveal = scrollMotion === 'fade-reveal' && !reduceMotion;
  const indexDistort = scrollMotion === 'index-distort';

  const { period, title, organization, description, status, tasks, tools, links, location, employmentType } =
    resolveExperienceContent(block);
  const displayTools = showTools ? tools : [];

  const metaLine = [organization, location, employmentTypeLabel(employmentType) || null]
    .filter((part): part is string => Boolean(part))
    .join('  ·  ');

  const hasStatus = status === 'ONGOING' || status === 'FINISHED';
  const repoLink = showProof ? (links[0] ?? null) : null;
  const cardBackground = `color-mix(in srgb, ${titleColor} 4%, transparent)`;

  const SectionTag = fadeReveal ? motion.section : 'section';

  return (
    <SectionTag
      ref={sectionRef}
      className="relative flex w-full flex-col justify-center px-[6vw] py-[6vh]"
      style={{ minHeight: '100vh' }}
      {...(index === 0 ? { 'data-pf-exp-lead-card': '' } : {})}
      {...(fadeReveal
        ? {
            variants: reelRevealContainer,
            initial: 'hidden' as const,
            whileInView: 'show' as const,
            viewport: { once: false, amount: 0.32, margin: '0px 0px -10% 0px' },
          }
        : {})}
    >
      <ReelIndexWatermark
        index={index}
        titleColor={titleColor}
        sectionRef={sectionRef}
        enabled={indexDistort}
      />

      <ReelRevealItem enabled={fadeReveal}>
        <div className="h-px w-full shrink-0" style={{ backgroundColor: hairline }} aria-hidden />
      </ReelRevealItem>

      <ReelRevealGroup enabled={fadeReveal} className="pf-reel-bento mt-10">
        <ReelRevealItem enabled={fadeReveal} className="pf-reel-bento-lead">
          {title ? (
            <h3
              className="pf-exp-lead-reveal max-w-[15ch] text-[clamp(2.1rem,4.4vw,3.4rem)] max-[800px]:text-[1.9rem]"
              style={{
                fontFamily: REEL_SERIF,
                fontWeight: 450,
                lineHeight: 1.05,
                letterSpacing: '-0.015em',
              }}
              data-pf-lead-step="1"
              data-pf-no-color-transition=""
            >
              {reelTwoToneTitle(title, titleColor, mutedColor)}
            </h3>
          ) : null}

          {period || hasStatus || metaLine ? (
            <div className="flex flex-col gap-3">
              {period ? (
                <p
                  className="text-[1.4rem] font-semibold"
                  style={{ color: titleColor, fontFamily: REEL_SANS }}
                >
                  {period}
                </p>
              ) : null}

              {hasStatus ? (
                <ReelStatusIndicator
                  status={status as 'ONGOING' | 'FINISHED'}
                  presentationStyle={statusStyle}
                  accent={accent}
                  secondaryColor={secondaryColor}
                  bodyColor={bodyColor}
                  hairline={hairline}
                />
              ) : null}

              {metaLine ? (
                <p className="text-[0.92rem]" style={{ color: mutedColor, fontFamily: REEL_SANS }}>
                  {metaLine}
                </p>
              ) : null}
            </div>
          ) : null}
        </ReelRevealItem>

        <ReelRevealItem
          enabled={fadeReveal}
          className="pf-reel-bento-card"
          style={{ backgroundColor: cardBackground, borderColor: hairline }}
        >
          {description ? (
            <p
              className="pf-exp-lead-reveal m-0 p-0 text-left text-[1.05rem] leading-[1.85]"
              style={{ color: bodyColor, fontFamily: REEL_SANS }}
              data-pf-lead-step="2"
              data-pf-no-color-transition=""
            >
              {description}
            </p>
          ) : null}

          {tasks.length > 0 ? (
            <div
              className={`pf-reel-timeline ${description ? 'mt-9' : ''}`}
              data-pf-lead-step="4"
              data-pf-no-color-transition=""
            >
              <span className="pf-reel-timeline-rule" style={{ backgroundColor: hairline }} aria-hidden />
              <div className="pf-reel-timeline-rows">
                {tasks.map((task, taskIndex) => (
                  <div key={taskIndex} className="pf-reel-timeline-row">
                    <span
                      className="pf-reel-timeline-index font-mono text-[0.72rem] font-semibold"
                      style={{ color: titleColor }}
                    >
                      {String(taskIndex + 1).padStart(2, '0')}
                    </span>
                    <span
                      className="text-[0.98rem] leading-snug"
                      style={{ color: bodyColor, fontFamily: REEL_SANS }}
                    >
                      {task}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {displayTools.length > 0 ? (
            <div className="pf-reel-tools-row mt-12 border-t pt-8" style={{ borderColor: hairline }}>
              {displayTools.map((tool, toolIndex) => (
                <span
                  key={toolIndex}
                  data-pf-no-color-transition=""
                  className="pf-reel-tools-item text-xs font-semibold uppercase tracking-[0.18em]"
                  style={{ color: titleColor }}
                >
                  {tool}
                </span>
              ))}
            </div>
          ) : null}

          {repoLink ? (
            <div
              className={`flex justify-end ${displayTools.length > 0 ? 'mt-8' : 'mt-12 border-t pt-8'}`}
              style={displayTools.length > 0 ? undefined : { borderColor: hairline }}
            >
              <PortfolioLinkButton
                variant={repoLinkButtonStyle}
                href={repoLink.url}
                label={repoLink.label || 'View repository'}
                palette={experienceLinkButtonPalette({
                  ink: titleColor,
                  muted: mutedColor,
                  accent,
                  background,
                  border: hairline,
                })}
              />
            </div>
          ) : null}
        </ReelRevealItem>
      </ReelRevealGroup>
    </SectionTag>
  );
}

/** Sticky vertical: pinned story panel + ScrollTrigger-driven title morph between roles. */
function ReelStickyVerticalExperience({
  blocks,
  accent,
  secondaryColor,
  titleColor,
  mutedColor,
  bodyColor,
  hairline,
  background,
  statusStyle,
  repoLinkButtonStyle = 'icon',
  showProof = true,
  showTools = true,
}: {
  blocks: ProfileMediaBlock[];
  accent: string;
  secondaryColor: string;
  titleColor: string;
  mutedColor: string;
  bodyColor: string;
  hairline: string;
  background: string;
  statusStyle: PortfolioExperienceReelStatusStyle;
  repoLinkButtonStyle?: PortfolioExperienceRepoLinkStyle;
  showProof?: boolean;
  showTools?: boolean;
  isDark?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const trackRef = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const indexRef = useRef<HTMLSpanElement | null>(null);
  const footerRef = useRef<HTMLDivElement | null>(null);
  const activeRef = useRef(0);
  const directionRef = useRef(1);
  const titleSwapToken = useRef(0);
  const skipEnterOnMount = useRef(true);
  const introPlayedRef = useRef(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [displayIndex, setDisplayIndex] = useState(0);
  const [introDone, setIntroDone] = useState(false);

  const entries = useMemo(
    () => blocks.map((block) => resolveExperienceContent(block)),
    [blocks]
  );

  const active = entries[displayIndex] ?? entries[0];
  const metaLine = active
    ? [active.organization, active.location, employmentTypeLabel(active.employmentType) || null]
        .filter((part): part is string => Boolean(part))
        .join('  ·  ')
    : '';
  const hasStatus = active?.status === 'ONGOING' || active?.status === 'FINISHED';
  const repoLink = showProof ? (active?.links[0] ?? null) : null;
  const title = active?.title ?? '';
  const period = active?.period ?? null;
  const description = active?.description ?? null;
  const tasks = active?.tasks ?? [];
  const tools = active?.tools ?? [];
  const displayTools = showTools ? tools : [];

  useLayoutEffect(() => {
    if (typeof window === 'undefined' || blocks.length === 0) return;
    const track = trackRef.current;
    if (!track) return;

    gsap.registerPlugin(ScrollTrigger);
    const scroller = getScrollParent(track) ?? undefined;

    const playIntro = () => {
      if (introPlayedRef.current) return;
      introPlayedRef.current = true;

      const titleEl = titleRef.current;
      const indexEl = indexRef.current;
      const footerEl = footerRef.current;

      // Unlock CSS opacity gate first; title stays at natural left (x:0).
      setIntroDone(true);

      if (reduceMotion || !titleEl) {
        if (titleEl) gsap.set(titleEl, { clearProps: 'transform,opacity' });
        if (indexEl) gsap.set(indexEl, { clearProps: 'transform,opacity' });
        if (footerEl) gsap.set(footerEl, { clearProps: 'opacity' });
        return;
      }

      // Start from the right in GSAP only — rest position is always flush left (x:0).
      gsap.fromTo(
        titleEl,
        { x: 120, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 1.05,
          ease: 'power2.out',
          overwrite: true,
          onComplete: () => {
            gsap.set(titleEl, { clearProps: 'transform' });
          },
        }
      );
      if (indexEl) {
        gsap.fromTo(
          indexEl,
          { x: 40, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.95,
            ease: 'power2.out',
            delay: 0.04,
            overwrite: true,
            onComplete: () => {
              gsap.set(indexEl, { clearProps: 'transform' });
            },
          }
        );
      }
      if (footerEl) {
        gsap.fromTo(
          footerEl,
          { opacity: 0.2 },
          { opacity: 1, duration: 0.8, ease: 'power2.out', delay: 0.08, overwrite: true }
        );
      }
    };

    if (reduceMotion) {
      playIntro();
    }

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: track,
        scroller: scroller || undefined,
        start: 'top top',
        end: 'bottom bottom',
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const n = blocks.length;
          const next = Math.min(n - 1, Math.max(0, Math.floor(self.progress * n - 1e-9)));
          if (next === activeRef.current) return;
          directionRef.current = self.direction >= 0 ? 1 : -1;
          activeRef.current = next;
          setActiveIndex(next);
        },
      });

      ScrollTrigger.create({
        trigger: track,
        scroller: scroller || undefined,
        start: 'top 85%',
        once: true,
        onEnter: playIntro,
        // If the section is already on screen at mount, still run intro.
        onRefresh: (self) => {
          if (self.isActive || self.progress > 0) playIntro();
        },
      });
    }, track);

    // Failsafe: never leave the title parked / invisible / mid-transform.
    const failsafe = window.setTimeout(() => {
      if (!introPlayedRef.current) playIntro();
      const titleEl = titleRef.current;
      if (titleEl) gsap.set(titleEl, { x: 0, xPercent: 0, clearProps: 'transform' });
    }, 1200);

    ScrollTrigger.refresh();
    return () => {
      window.clearTimeout(failsafe);
      ctx.revert();
    };
  }, [blocks.length, reduceMotion]);

  // Soft exit → swap copy → soft enter (short travel, no remount flash).
  useEffect(() => {
    if (activeIndex === displayIndex) return;

    const dir = directionRef.current;
    const titleEl = titleRef.current;
    const indexEl = indexRef.current;
    const footerEl = footerRef.current;
    const token = ++titleSwapToken.current;

    if (reduceMotion || !titleEl) {
      setDisplayIndex(activeIndex);
      return;
    }

    const tl = gsap.timeline({
      defaults: { overwrite: 'auto' },
      onComplete: () => {
        if (token !== titleSwapToken.current) return;
        setDisplayIndex(activeIndex);
      },
    });

    tl.to(
      titleEl,
      {
        x: dir >= 0 ? -72 : 72,
        opacity: 0,
        duration: 0.55,
        ease: 'power2.inOut',
      },
      0
    );
    if (indexEl) {
      tl.to(
        indexEl,
        {
          x: dir >= 0 ? -28 : 28,
          opacity: 0,
          duration: 0.45,
          ease: 'power2.inOut',
        },
        0
      );
    }
    if (footerEl) tl.to(footerEl, { opacity: 0.45, duration: 0.4, ease: 'power1.inOut' }, 0);

    return () => {
      tl.kill();
    };
  }, [activeIndex, displayIndex, reduceMotion]);

  useLayoutEffect(() => {
    if (skipEnterOnMount.current) {
      skipEnterOnMount.current = false;
      return;
    }
    if (reduceMotion) return;
    const titleEl = titleRef.current;
    const indexEl = indexRef.current;
    const footerEl = footerRef.current;
    if (!titleEl) return;

    const dir = directionRef.current;
    gsap.fromTo(
      titleEl,
      { x: dir >= 0 ? 88 : -88, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        duration: 0.85,
        ease: 'power2.out',
        overwrite: 'auto',
        onComplete: () => {
          gsap.set(titleEl, { clearProps: 'transform' });
        },
      }
    );
    if (indexEl) {
      gsap.fromTo(
        indexEl,
        { x: dir >= 0 ? 36 : -36, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
          overwrite: 'auto',
          onComplete: () => {
            gsap.set(indexEl, { clearProps: 'transform' });
          },
        }
      );
    }
    if (footerEl) {
      gsap.to(footerEl, { opacity: 1, duration: 0.65, ease: 'power2.out', overwrite: 'auto' });
    }
  }, [displayIndex, reduceMotion]);

  const trackHeightVh = Math.max(1, blocks.length) * 100;

  return (
    <div
      ref={trackRef}
      className="pf-reel-sticky-v-track relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2"
      style={{ height: `${trackHeightVh}vh` }}
    >
      <div
        className={`pf-reel-sticky-v-pin${introDone || reduceMotion ? ' is-intro-done' : ''}`}
        style={{ backgroundColor: background }}
      >
        {/* Large index — top-right, same visual weight as Index distort watermark. */}
        <span
          ref={indexRef}
          aria-hidden
          className="pf-reel-sticky-v-index"
          style={{
            color: `color-mix(in srgb, ${titleColor} 7%, transparent)`,
            fontFamily: REEL_SERIF,
          }}
        >
          {String(displayIndex + 1).padStart(2, '0')}
        </span>

        {/* Title frame locked for the whole sticky run — hairlines never reflow with copy. */}
        <div className="pf-reel-sticky-v-title-frame">
          <div className="h-px w-full shrink-0" style={{ backgroundColor: hairline }} aria-hidden />
          <div className="pf-reel-sticky-v-title-slot">
            {title ? (
              <h3
                ref={titleRef}
                className="whitespace-nowrap text-[clamp(2.2rem,5.2vw,4.5rem)] max-[800px]:text-[1.85rem]"
                style={{
                  fontFamily: REEL_SERIF,
                  fontWeight: 450,
                  lineHeight: 1.08,
                  letterSpacing: '-0.015em',
                }}
              >
                {reelTwoToneTitle(title, titleColor, mutedColor)}
              </h3>
            ) : null}
          </div>
          <div className="h-px w-full shrink-0" style={{ backgroundColor: hairline }} aria-hidden />
        </div>

        <div ref={footerRef} className="pf-reel-sticky-v-footer">
            <div className="pf-reel-bento">
              <div className="pf-reel-bento-lead">
                {period || (hasStatus && active) || metaLine ? (
                  <div className="flex flex-col gap-3">
                    {period ? (
                      <p
                        className="text-[1.4rem] font-semibold"
                        style={{ color: titleColor, fontFamily: REEL_SANS }}
                      >
                        {period}
                      </p>
                    ) : null}
                    {hasStatus && active ? (
                      <ReelStatusIndicator
                        status={active.status as 'ONGOING' | 'FINISHED'}
                        presentationStyle={statusStyle}
                        accent={accent}
                        secondaryColor={secondaryColor}
                        bodyColor={bodyColor}
                        hairline={hairline}
                      />
                    ) : null}
                    {metaLine ? (
                      <p className="text-[0.92rem]" style={{ color: mutedColor, fontFamily: REEL_SANS }}>
                        {metaLine}
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </div>

              <div
                className="pf-reel-bento-card"
                style={{
                  backgroundColor: `color-mix(in srgb, ${titleColor} 4%, transparent)`,
                  borderColor: hairline,
                }}
              >
                {description ? (
                  <p className="text-[1.05rem] leading-[1.85]" style={{ color: bodyColor, fontFamily: REEL_SANS }}>
                    {description}
                  </p>
                ) : null}

                {tasks.length > 0 ? (
                  <div className={`pf-reel-timeline ${description ? 'mt-9' : ''}`}>
                    <span className="pf-reel-timeline-rule" style={{ backgroundColor: hairline }} aria-hidden />
                    <div className="pf-reel-timeline-rows">
                      {tasks.map((task, taskIndex) => (
                        <div key={taskIndex} className="pf-reel-timeline-row">
                          <span
                            className="pf-reel-timeline-index font-mono text-[0.72rem] font-semibold"
                            style={{ color: titleColor }}
                          >
                            {String(taskIndex + 1).padStart(2, '0')}
                          </span>
                          <span
                            className="text-[0.98rem] leading-snug"
                            style={{ color: bodyColor, fontFamily: REEL_SANS }}
                          >
                            {task}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {displayTools.length > 0 ? (
                  <div className="pf-reel-tools-row mt-12 border-t pt-8" style={{ borderColor: hairline }}>
                    {displayTools.map((tool, toolIndex) => (
                      <span
                        key={toolIndex}
                        data-pf-no-color-transition=""
                        className="pf-reel-tools-item text-xs font-semibold uppercase tracking-[0.18em]"
                        style={{ color: titleColor }}
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                ) : null}

                {repoLink ? (
                  <div
                    className={`flex justify-end ${displayTools.length > 0 ? 'mt-8' : 'mt-12 border-t pt-8'}`}
                    style={displayTools.length > 0 ? undefined : { borderColor: hairline }}
                  >
                    <PortfolioLinkButton
                      variant={repoLinkButtonStyle}
                      href={repoLink.url}
                      label={repoLink.label || 'View repository'}
                      palette={experienceLinkButtonPalette({
                        ink: titleColor,
                        muted: mutedColor,
                        accent,
                        background,
                        border: hairline,
                      })}
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </div>
      </div>
    </div>
  );
}

/** Reel design — one full-viewport section per role, plain scroll (no snap, no pager). */
export function ReelExperienceList({
  blocks,
  presentation = DEFAULT_EXPERIENCE_PRESENTATION,
}: {
  blocks: ProfileMediaBlock[];
  presentation?: PortfolioExperiencePresentationSettings;
  motionProfile?: PortfolioGlobalMotionProfile;
  forceSingleColumn?: boolean;
}) {
  if (blocks.length === 0) return null;

  const isDark = presentation.activeColorMode !== 'light';
  const colorMode = resolveExperienceColorMode(presentation);
  const styles = normalizeExperienceElementStyles(presentation.elementStyles);
  const accent = experienceAccentColor(presentation.accentColor);
  const secondary = experienceSecondaryStatusColor(presentation);
  const titleColor = ensureExperienceInkContrast(
    presentation.titleColor?.trim() || resolveExperienceTextColor(styles.title, colorMode),
    isDark,
    DEFAULT_EXPERIENCE_TITLE_COLOR,
    DEFAULT_EXPERIENCE_TITLE_COLOR_DARK
  );
  const mutedColor = ensureExperienceInkContrast(
    presentation.subtitleColor?.trim() || resolveExperienceTextColor(styles.meta, colorMode),
    isDark,
    DEFAULT_EXPERIENCE_MUTED_COLOR,
    DEFAULT_EXPERIENCE_MUTED_COLOR_DARK
  );
  const bodyColor = ensureExperienceInkContrast(
    resolveExperienceTextColor(styles.tasks, colorMode) || resolveExperienceTextColor(styles.description, colorMode),
    isDark,
    DEFAULT_EXPERIENCE_BODY_COLOR,
    DEFAULT_EXPERIENCE_BODY_COLOR_DARK
  );
  const hairline = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)';
  const background = presentation.sectionBackgroundColor?.trim() || DEFAULT_SECTION_BACKGROUND_COLOR;
  const statusStyle = presentation.reelStatusStyle ?? 'badge';
  const scrollMotion = presentation.reelScrollMotion ?? 'fade-reveal';

  if (scrollMotion === 'sticky-vertical') {
    return (
      <ReelStickyVerticalExperience
        blocks={blocks}
        accent={accent}
        secondaryColor={secondary}
        titleColor={titleColor}
        mutedColor={mutedColor}
        bodyColor={bodyColor}
        hairline={hairline}
        background={background}
        statusStyle={statusStyle}
        repoLinkButtonStyle={resolveExperienceRepoLinkStyle(presentation.repoLinkButtonStyle, 'reel')}
        showProof={presentation.showProof !== false}
        showTools={presentation.showTools !== false}
        isDark={isDark}
      />
    );
  }

  return (
    <div className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2">
      {blocks.map((block, index) => (
        <ReelExperienceEntry
          key={block.id}
          index={index}
          block={block}
          accent={accent}
          secondaryColor={secondary}
          titleColor={titleColor}
          mutedColor={mutedColor}
          bodyColor={bodyColor}
          hairline={hairline}
          statusStyle={statusStyle}
          scrollMotion={scrollMotion}
          background={background}
          repoLinkButtonStyle={resolveExperienceRepoLinkStyle(presentation.repoLinkButtonStyle, 'reel')}
          showProof={presentation.showProof !== false}
          showTools={presentation.showTools !== false}
          isDark={isDark}
        />
      ))}
    </div>
  );
}

/** Duotone thumbnail Consult pill — same liquid-inertia follow as LegacyStatusCursor. */
function DuotoneConsultCursor({
  anchor,
  containerRef,
  onDismiss,
  isDark,
}: {
  anchor: { x: number; y: number } | null;
  containerRef: RefObject<HTMLDivElement | null>;
  onDismiss: () => void;
  isDark: boolean;
}) {
  const elRef = useRef<HTMLDivElement>(null);
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  const rafId = useRef<number | null>(null);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!anchor) return;
    target.current = anchor;
    current.current = anchor;
    if (elRef.current) {
      elRef.current.style.transform = `translate3d(${anchor.x}px, ${anchor.y}px, 0) translate(-50%, -50%)`;
    }

    const handleMove = (event: MouseEvent) => {
      target.current = { x: event.clientX, y: event.clientY };
    };
    window.addEventListener('mousemove', handleMove);

    const lerpFactor = reduceMotion ? 1 : 0.18;
    const tick = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      const stillInside =
        rect &&
        target.current.x >= rect.left &&
        target.current.x <= rect.right &&
        target.current.y >= rect.top &&
        target.current.y <= rect.bottom;
      if (!stillInside) {
        onDismiss();
        return;
      }

      current.current = {
        x: current.current.x + (target.current.x - current.current.x) * lerpFactor,
        y: current.current.y + (target.current.y - current.current.y) * lerpFactor,
      };
      if (elRef.current) {
        elRef.current.style.transform = `translate3d(${current.current.x}px, ${current.current.y}px, 0) translate(-50%, -50%)`;
      }
      rafId.current = requestAnimationFrame(tick);
    };
    rafId.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [anchor, reduceMotion, containerRef, onDismiss]);

  if (!mounted) return null;

  return createPortal(
    <div
      ref={elRef}
      aria-hidden="true"
      data-pf-no-color-transition=""
      className="pointer-events-none fixed left-0 top-0 z-[999] transition-opacity duration-200 ease-out"
      style={{ opacity: anchor ? 1 : 0 }}
    >
      <div
        className="flex items-center gap-2.5 whitespace-nowrap rounded-full px-5 py-2.5 font-semibold uppercase"
        style={{
          backgroundColor: isDark ? 'rgba(255,255,255,0.94)' : 'rgba(12,12,14,0.94)',
          color: isDark ? '#0b0b0c' : '#ffffff',
          fontSize: '0.72rem',
          letterSpacing: '0.16em',
          fontFamily: REEL_SANS,
          boxShadow: '0 10px 28px -12px rgba(0,0,0,0.45)',
        }}
      >
        <span>Consult</span>
        <svg
          viewBox="0 0 24 24"
          className="h-3 w-3 shrink-0 opacity-80"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.6}
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M9 7h8v8" />
        </svg>
      </div>
    </div>,
    document.body
  );
}

function DuotoneLeftPanel({
  block,
  ink,
  muted,
  secondary,
  border,
  registerRef,
  showTitle = true,
  showPeriod = true,
  showMeta = true,
  showEntryMedia = true,
  naturalHeight = false,
  premium = false,
  accent,
  thumbnailEffect = 'grayscale',
  thumbnailHeight = 'md',
  stickyVerticalGap,
  inView = false,
  /** Scroll mode: render only the title, only the thumb, or the full stacked panel. */
  scrollPart = 'all',
  repoCtaMode = 'footer',
  consultHref,
  isDark = true,
  active,
  lane = 'active',
  titleScale = 'default',
}: {
  block: ProfileMediaBlock;
  ink: string;
  muted: string;
  secondary: string;
  border: string;
  registerRef?: (el: HTMLElement | null) => void;
  /** General → Content visibility toggles — respected here the same way Cards/Editorial do. */
  showTitle?: boolean;
  showPeriod?: boolean;
  showMeta?: boolean;
  showEntryMedia?: boolean;
  /** Size to content instead of forcing min-h-screen — for the Slide frame, whose own height
   * should be shorter than the full viewport and vertically centered within it. */
  naturalHeight?: boolean;
  /** Sticky scroll mode only: massive title pinned top, no divider, meta anchored to the
   * bottom of the screen instead of sitting right under the title, and the thumbnail as its
   * own block below the title instead of a flat void. Only used when premium is true. */
  premium?: boolean;
  /** Only needed for the 'tint' thumbnail effect. */
  accent?: string;
  thumbnailEffect?: PortfolioExperienceDuotoneThumbnailEffect;
  thumbnailHeight?: PortfolioExperienceDuotoneThumbnailHeight;
  /** Sticky mode only — when set, drives title ↔ media vertical air. */
  stickyVerticalGap?: PortfolioExperienceDuotoneStickyVerticalGap;
  /** Sticky mode: this panel is the centered active role — drives image reveal. */
  inView?: boolean;
  scrollPart?: 'all' | 'title' | 'thumb';
  repoCtaMode?: PortfolioExperienceDuotoneRepoCtaMode;
  /** Repository URL used when repoCtaMode is thumb-cursor. */
  consultHref?: string | null;
  isDark?: boolean;
  /** Desktop Sticky mode only: this panel is pinned and cross-fades between roles — same
   * absolute-layer story-reveal treatment DuotoneRightPanel used before the columns swapped
   * roles. Undefined (the default) keeps every other mode's plain, non-absolute layout. */
  active?: boolean;
  /** Sticky fade direction: above = already scrolled past, below = still ahead. */
  lane?: 'active' | 'above' | 'below';
  /** Sticky mobile tier: a smaller, more line-height-generous clamp so the giant title never
   * gets stuck at its desktop floor on narrow phones. */
  titleScale?: 'default' | 'compact';
}) {
  const { period, title, organization, status, location, employmentType } = resolveExperienceContent(block);

  const metaLine = [organization, location, employmentTypeLabel(employmentType) || null]
    .filter((part): part is string => Boolean(part))
    .join('  ·  ');

  const statusLabel = status === 'ONGOING' ? 'Ongoing' : status === 'FINISHED' ? 'Finished' : null;
  const displayPeriod = showPeriod ? period : null;
  const displayMetaLine = showMeta ? metaLine : '';
  const displayStatusLabel = showMeta ? statusLabel : null;
  const metaContent = displayPeriod || displayMetaLine || displayStatusLabel;
  const mediaUrl =
    premium && showEntryMedia && typeof block.mediaUrl === 'string' ? block.mediaUrl.trim() : '';
  const showTitleBlock = scrollPart !== 'thumb' && showTitle && Boolean(title);
  const showThumbBlock = scrollPart !== 'title' && premium && Boolean(mediaUrl);
  const enableConsultCursor =
    Boolean(consultHref) && repoCtaMode === 'thumb-cursor' && showThumbBlock;
  const [cursorAnchor, setCursorAnchor] = useState<{ x: number; y: number } | null>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const dismissCursor = useCallback(() => setCursorAnchor(null), []);
  const premiumGapClass =
    premium && scrollPart === 'all'
      ? stickyVerticalGap
        ? experienceDuotoneStickyLeftGapClass(stickyVerticalGap)
        : 'gap-10 sm:gap-14'
      : '';
  const panelMinHeight =
    !naturalHeight && stickyVerticalGap && scrollPart === 'all'
      ? `${experienceDuotoneStickySectionVh(stickyVerticalGap)}vh`
      : undefined;

  const titleNode = showTitleBlock ? (
    <h3
      data-pf-no-color-transition=""
      className="pf-duotone-left-title"
      style={{
        color: ink,
        fontFamily: REEL_SERIF,
        fontWeight: premium ? 400 : 640,
        // Compact (sticky mobile tier): a touch looser than the desktop 0.95 — the giant
        // title now wraps to 2-3 lines on a phone, and 0.95 reads cramped once it wraps.
        lineHeight: premium ? (titleScale === 'compact' ? 1.08 : 0.95) : 1.08,
        letterSpacing: '-0.02em',
        // Compact's own clamp (not just a smaller desktop floor): 6vw of a 375px phone is
        // ~1.4rem, well under the desktop clamp's 3rem floor, which is why that floor used
        // to win on every phone regardless of screen width.
        fontSize: premium
          ? titleScale === 'compact'
            ? 'clamp(2.1rem, 9vw, 3rem)'
            : 'clamp(3rem, 6vw, 5.5rem)'
          : 'clamp(2rem, 3vw, 3.1rem)',
      }}
    >
      {title}
    </h3>
  ) : null;

  const thumbNode = showThumbBlock ? (
    <div
      ref={thumbRef}
      className="pf-duotone-thumb-frame relative w-full shrink-0 overflow-hidden"
      style={{
        aspectRatio: experienceDuotoneThumbnailAspectRatio(thumbnailHeight),
        maxHeight: experienceDuotoneThumbnailMaxHeight(thumbnailHeight),
        cursor: enableConsultCursor ? 'none' : undefined,
      }}
      onMouseEnter={
        enableConsultCursor
          ? (event) => setCursorAnchor({ x: event.clientX, y: event.clientY })
          : undefined
      }
      onMouseLeave={enableConsultCursor ? dismissCursor : undefined}
    >
      <div
        data-pf-no-color-transition=""
        className="pf-duotone-thumb-reveal absolute inset-0 origin-center"
      >
        {/* Zoom on this wrapper — same opt-out pattern as sticky settle / Legacy —
            ProductThumbnailMedia's <img> cannot carry data-pf-no-color-transition. */}
        <div data-pf-no-color-transition="" className="pf-duotone-thumb-zoom">
          <ProductThumbnailMedia
            url={mediaUrl}
            alt={title || 'Experience'}
            fit="cover"
            className={
              thumbnailEffect === 'none'
                ? 'h-full w-full'
                : 'pf-duotone-media-filter h-full w-full'
            }
          />
        </div>
        {thumbnailEffect === 'tint' ? (
          <div
            className="absolute inset-0"
            style={{ backgroundColor: accent, mixBlendMode: 'color', opacity: 0.65 }}
            aria-hidden
          />
        ) : null}
      </div>
      {enableConsultCursor && consultHref ? (
        <a
          href={consultHref}
          target="_blank"
          rel="noreferrer"
          className="absolute inset-0 z-[2]"
          aria-label="Consult"
        />
      ) : null}
    </div>
  ) : null;

  const consultCursorNode = enableConsultCursor ? (
    <DuotoneConsultCursor
      anchor={cursorAnchor}
      containerRef={thumbRef}
      onDismiss={dismissCursor}
      isDark={isDark}
    />
  ) : null;

  if (active !== undefined) {
    // Desktop Sticky tier only: pinned title + thumbnail, cross-fading between roles.
    // Reuses the exact absolute/story-layer CSS the (now plain-flow) info column used
    // before the two columns swapped which one gets pinned.
    return (
      <div
        data-pf-no-color-transition=""
        data-active={active ? 'true' : 'false'}
        data-lane={lane}
        data-in-view={active ? 'true' : 'false'}
        className={`pf-duotone-right-panel pf-duotone-left-panel absolute inset-0 flex flex-col justify-center overflow-hidden ${premiumGapClass}`}
        aria-hidden={active === false}
      >
        {titleNode ? (
          <div data-pf-no-color-transition="" data-layer="0" className="pf-duotone-story-layer">
            {titleNode}
          </div>
        ) : null}
        {thumbNode ? (
          <div data-pf-no-color-transition="" data-layer="1" className="pf-duotone-story-layer">
            {thumbNode}
            {consultCursorNode}
          </div>
        ) : null}
      </div>
    );
  }

  if (scrollPart === 'title') {
    return titleNode ? (
      <div
        ref={registerRef}
        data-pf-no-color-transition=""
        className="pf-duotone-left-panel w-full"
      >
        {titleNode}
      </div>
    ) : (
      <div ref={registerRef} className="hidden" />
    );
  }

  if (scrollPart === 'thumb') {
    return thumbNode ? (
      <div
        data-pf-no-color-transition=""
        data-in-view="true"
        className="pf-duotone-left-panel w-full"
      >
        {thumbNode}
        {consultCursorNode}
      </div>
    ) : null;
  }

  return (
    <div
      ref={registerRef}
      data-pf-no-color-transition=""
      data-in-view={premium && inView ? 'true' : 'false'}
      className={`pf-duotone-left-panel relative flex w-full flex-col justify-center overflow-hidden max-[800px]:min-h-0 ${
        naturalHeight || panelMinHeight ? '' : 'min-h-screen'
      } ${premiumGapClass}`}
      style={panelMinHeight ? { minHeight: panelMinHeight } : undefined}
    >
      {titleNode}

      {/* Premium (sticky mode): the thumbnail is its own block below the title — never an
          overlapping background behind the text. */}
      {thumbNode}
      {consultCursorNode}

      {!premium ? (
        <div className="my-4 h-px w-full shrink-0" style={{ backgroundColor: border }} aria-hidden />
      ) : null}

      {/* Premium (sticky mode): period / org / status move into the right-hand card instead,
          laid out in one horizontal row — see DuotoneRightPanel. */}
      {!premium && metaContent ? (
        <div className="space-y-2">
          {displayPeriod ? (
            <p className="text-[0.95rem]" style={{ color: muted, fontFamily: REEL_SANS }}>
              {displayPeriod}
            </p>
          ) : null}
          {displayMetaLine ? (
            <p className="text-[0.95rem]" style={{ color: muted, fontFamily: REEL_SANS }}>
              {displayMetaLine}
            </p>
          ) : null}
          {displayStatusLabel ? (
            <p
              className="text-[0.95rem] font-bold"
              style={{ color: status === 'FINISHED' ? secondary : ink, fontFamily: REEL_SANS }}
            >
              {displayStatusLabel}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function DuotoneRightPanel({
  block,
  ink,
  muted,
  secondary,
  accent,
  border,
  background,
  isDark,
  active,
  lane = 'active',
  className = '',
  enhanced = false,
  bare = false,
  tasksDisplay = 'editorial-dash',
  toolsBadgeStyle = 'mineral-pills',
  showDescription = true,
  showTasks = true,
  showTools = true,
  showProof = true,
  showPeriod = true,
  showMeta = true,
  repoLinkButtonStyle = 'icon',
  premium = false,
  wideMeasure = false,
  toolsLayout = 'wrap',
  stickyVerticalGap,
  flushTop = false,
  hideRepoButton = false,
}: {
  block: ProfileMediaBlock;
  ink: string;
  muted: string;
  /** Only used by the premium (sticky-mode) meta row, for the "Finished" status color. */
  secondary: string;
  accent: string;
  border: string;
  background: string;
  isDark: boolean;
  /** Desktop Sticky tier only: this panel is pinned and cross-fades between roles. Undefined
   * (the default) keeps every other mode's plain, non-absolute layout. */
  active?: boolean;
  /** Sticky fade direction: above = already scrolled past, below = still ahead. */
  lane?: 'active' | 'above' | 'below';
  /** Extra layout classes — e.g. mobile top spacing. */
  className?: string;
  /** Slide-mode-only polish: card depth, pill lift. Off elsewhere. */
  enhanced?: boolean;
  /** True when a Screen frame already draws the boundary around this whole slide — drop this
   * panel's own card chrome (border/shadow/background/radius) so there's only ever one frame. */
  bare?: boolean;
  /** General → Tasks display setting — same options every other design offers. */
  tasksDisplay?: PortfolioExperienceTasksDisplay;
  /** General → Tools display setting — same options every other design offers. */
  toolsBadgeStyle?: PortfolioExperienceToolsBadgeStyle;
  /** General → Content visibility toggles — respected here the same way Cards/Editorial do. */
  showDescription?: boolean;
  showTasks?: boolean;
  showTools?: boolean;
  showProof?: boolean;
  /** Premium (sticky-mode) meta row only. */
  showPeriod?: boolean;
  showMeta?: boolean;
  /** General → Link button setting — harvested from each Experience design. */
  repoLinkButtonStyle?: PortfolioExperienceRepoLinkStyle;
  /** Sticky scroll mode only: squared, discreet stack chips instead of rounded pills, and the
   * period / org / status row (moved here from the left panel) laid out horizontally. */
  premium?: boolean;
  /** Sticky tablet/mobile tiers: a single full-width column, so the narrow editorial measure
   * (built for the pinned/flowing two-column desktop layout) would look absurdly cramped —
   * this swaps it for a wider, still-airy measure instead. */
  wideMeasure?: boolean;
  /** Sticky mobile tier: a discreet horizontally-scrollable strip instead of wrapping tags,
   * so the tools row never staircases down the screen. Forwarded to ExperienceToolsDisplay. */
  toolsLayout?: 'wrap' | 'scroll-x';
  /** Sticky mode only — vertical editorial rhythm between description / tasks / stack. */
  stickyVerticalGap?: PortfolioExperienceDuotoneStickyVerticalGap;
  /** Scroll mode: drop top padding so editorial top edges align with the thumbnail. */
  flushTop?: boolean;
  /** When thumb-cursor CTA is on, hide the footer repository button. */
  hideRepoButton?: boolean;
}) {
  const { description, tasks, tools, links, period, organization, status, location, employmentType } =
    resolveExperienceContent(block);
  const repoLink = showProof && !hideRepoButton ? links[0] ?? null : null;
  const displayDescription = showDescription ? description : null;
  const displayTasks = showTasks ? tasks : [];
  const displayTools = showTools ? tools : [];
  const metaLine = [organization, location, employmentTypeLabel(employmentType) || null]
    .filter((part): part is string => Boolean(part))
    .join('  ·  ');
  const statusLabel = status === 'ONGOING' ? 'Ongoing' : status === 'FINISHED' ? 'Finished' : null;
  const displayPeriod = showPeriod ? period : null;
  const displayMetaLine = showMeta ? metaLine : '';
  const displayStatusLabel = showMeta ? statusLabel : null;
  const hasMetaRow = premium && Boolean(displayPeriod || displayMetaLine || displayStatusLabel);
  // Card surface a shade off the page background — the tools badges derive their own tone
  // from the same ink/background tokens inside ExperienceToolsDisplay.
  const cardBg = `color-mix(in srgb, ${ink} 4%, ${background})`;
  const stickySpacing = flushTop
    ? experienceDuotoneScrollEditorialSpacing(stickyVerticalGap ?? 'md')
    : experienceDuotoneStickyEditorialSpacing(stickyVerticalGap ?? 'md');
  const tasksMtClass = stickyVerticalGap || flushTop ? stickySpacing.tasksMt : 'mt-10';
  const stackMtClass = stickyVerticalGap || flushTop ? stickySpacing.stackMt : 'mt-9';
  const stackGapClass = stickyVerticalGap || flushTop ? stickySpacing.stackGap : 'gap-6';
  const stackPtClass = stickyVerticalGap || flushTop ? stickySpacing.stackPt : 'pt-7';

  return (
    <div
      data-pf-no-color-transition=""
      data-active={active === undefined ? undefined : active ? 'true' : 'false'}
      data-lane={active === undefined ? undefined : lane}
      className={
        active === undefined
          ? `flex w-full flex-col justify-center ${className}`
          // No extra left padding here on top of the column gap — that used to stack with
          // the flex gap below and blow the middle gutter out past Scroll mode's. The gap
          // between the two columns comes from the row's own gap-* only, same as Scroll.
          // Pushed below dead-center on purpose: the left title/thumb column keeps its own
          // anchor, so this offset breaks the two columns' rectilinear alignment into a
          // diagonal cascade instead of a static side-by-side corridor.
          : 'pf-duotone-right-panel absolute inset-0 flex flex-col justify-center translate-y-8 lg:translate-y-12 xl:translate-y-16'
      }
      aria-hidden={active === false}
    >
      <div
        className={
          bare
            ? 'w-full'
            : premium
              ? // No left inset here (top/right/bottom only) — the pinned panel already sits
                // one column-gap away from the title column, and adding a pl on top of that
                // gap was stacking with it, blowing the middle gutter out past Scroll mode's.
                `w-full ${flushTop ? 'p-0' : 'pt-10 pr-10 pb-10 max-[800px]:p-6'}`
              : `w-full rounded-[14px] border p-10 max-[800px]:p-6 ${
                  enhanced ? 'transition-shadow duration-300' : ''
                }`
        }
        style={
          bare || premium
            ? undefined
            : {
                backgroundColor: cardBg,
                borderColor: border,
                boxShadow: enhanced ? '0 8px 20px -14px rgba(0,0,0,0.35)' : undefined,
              }
        }
      >
        {(() => {
          const animate = active !== undefined;
          const layerProps = (index: 0 | 1 | 2 | 3, extraClass = '') =>
            animate
              ? {
                  'data-pf-no-color-transition': '' as const,
                  'data-layer': String(index),
                  className: `pf-duotone-story-layer${extraClass ? ` ${extraClass}` : ''}`,
                }
              : { className: extraClass || undefined };

          return (
            <>
              {hasMetaRow ? (
                <div {...layerProps(0, 'mb-8')}>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
                    {displayPeriod ? (
                      <span className="text-[0.85rem]" style={{ color: muted, fontFamily: REEL_SANS }}>
                        {displayPeriod}
                      </span>
                    ) : null}
                    {displayMetaLine ? (
                      <span className="text-[0.85rem]" style={{ color: muted, fontFamily: REEL_SANS }}>
                        {displayMetaLine}
                      </span>
                    ) : null}
                    {displayStatusLabel ? (
                      <span
                        className="inline-flex items-center gap-1.5 text-[0.85rem] font-bold"
                        style={{
                          color: status === 'FINISHED' ? secondary : ink,
                          fontFamily: REEL_SANS,
                        }}
                      >
                        <span
                          className="h-1.5 w-1.5 shrink-0 rounded-full"
                          style={{ backgroundColor: status === 'FINISHED' ? secondary : ink }}
                          aria-hidden
                        />
                        {displayStatusLabel}
                      </span>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {displayDescription ? (
                <div {...layerProps(1)}>
                  <p
                    // Scroll/sticky two-column desktop (premium, narrow): a wide-ish measure
                    // and a much taller line-height air out the central gutter and read as
                    // editorial copy, without wrapping every line after only a few words.
                    // Sticky tablet/mobile (wideMeasure): same airy leading, full-width measure
                    // instead. Slide/mobile-plain: the original denser paragraph.
                    className={
                      wideMeasure
                        ? 'max-w-2xl text-[1.02rem] leading-[1.9]'
                        : premium
                          ? 'max-w-[58ch] text-[1.02rem] leading-[2.15]'
                          : 'text-[1.02rem] leading-[1.85]'
                    }
                    style={{ color: ink, fontFamily: REEL_SANS }}
                  >
                    {displayDescription}
                  </p>
                </div>
              ) : null}

              {displayTasks.length > 0 ? (
                <div {...layerProps(2, premium ? (displayDescription ? tasksMtClass : '') : 'mt-9')}>
                  <ExperienceTasksDisplay
                    tasks={displayTasks}
                    display={tasksDisplay}
                    bodyColor={premium ? ink : ink}
                    mutedColor={`color-mix(in srgb, ${accent} 78%, ${muted} 22%)`}
                    isDark={isDark}
                    label=""
                    size="lg"
                    tools={premium ? displayTools : undefined}
                  />
                </div>
              ) : null}
            </>
          );
        })()}

        {premium ? (
          displayTools.length > 0 || repoLink ? (
            <div
              data-pf-no-color-transition=""
              data-layer={active !== undefined ? '3' : undefined}
              className={`${active !== undefined ? 'pf-duotone-story-layer ' : ''}pf-duotone-chrome ${stackMtClass} flex flex-col ${stackGapClass} border-t ${stackPtClass}`}
              style={{ borderColor: `color-mix(in srgb, ${muted} 12%, transparent)` }}
            >
              <ExperienceToolsDisplay
                tools={displayTools}
                style={toolsBadgeStyle}
                ink={ink}
                muted={muted}
                background={background}
                isDark={isDark}
                size="md"
                layout={toolsLayout}
              />
              {repoLink ? (
                <div className="self-start">
                  <PortfolioLinkButton
                    variant={repoLinkButtonStyle}
                    href={repoLink.url}
                    label={repoLink.label || 'View repository'}
                    palette={{ background: cardBg, ink, muted, accent, border }}
                    radiusClass="rounded-[14px]"
                  />
                </div>
              ) : null}
            </div>
          ) : null
        ) : (
          <>
            {displayTools.length > 0 ? (
              <div className="mt-9">
                <ExperienceToolsDisplay
                  tools={displayTools}
                  style={toolsBadgeStyle}
                  ink={ink}
                  muted={muted}
                  background={background}
                  isDark={isDark}
                  size="md"
                  layout={toolsLayout}
                />
              </div>
            ) : null}

            {repoLink ? (
              <div className="mt-9">
                <PortfolioLinkButton
                  variant={repoLinkButtonStyle}
                  href={repoLink.url}
                  label={repoLink.label || 'View repository'}
                  palette={{ background: cardBg, ink, muted, accent, border }}
                  radiusClass="rounded-[14px]"
                />
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}

/** Duotone design: chevron used by the Slide scroll mode's prev/next controls. */
/** General → Content settings this design now respects, resolved once and passed down. */
type DuotoneContentFlags = {
  showTitle: boolean;
  showPeriod: boolean;
  showMeta: boolean;
  showDescription: boolean;
  showTasks: boolean;
  showTools: boolean;
  showProof: boolean;
  showEntryMedia: boolean;
  tasksDisplay: PortfolioExperienceTasksDisplay;
  toolsBadgeStyle: PortfolioExperienceToolsBadgeStyle;
  repoLinkButtonStyle: PortfolioExperienceRepoLinkStyle;
  isDark: boolean;
};

function DuotoneChevronIcon({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-7 w-7" aria-hidden="true">
      <path
        d={direction === 'left' ? 'M10 3.5 5 8l5 4.5' : 'M6 3.5 11 8l-5 4.5'}
        stroke="currentColor"
        strokeWidth={1.3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Duotone "Scroll" mode — plain stack, no pinning; each role and its story move together. */
function DuotoneScrollRoles({
  blocks,
  ink,
  muted,
  accent,
  secondary,
  border,
  background,
  flags,
  thumbnailEffect,
  thumbnailHeight,
  swapSides = false,
  alternateSides = false,
  verticalGap = 'md',
  repoCtaMode = 'footer',
  fullWidthTitle = false,
}: {
  blocks: ProfileMediaBlock[];
  ink: string;
  muted: string;
  accent: string;
  secondary: string;
  border: string;
  background: string;
  flags: DuotoneContentFlags;
  thumbnailEffect: PortfolioExperienceDuotoneThumbnailEffect;
  thumbnailHeight: PortfolioExperienceDuotoneThumbnailHeight;
  swapSides?: boolean;
  alternateSides?: boolean;
  verticalGap?: PortfolioExperienceDuotoneStickyVerticalGap;
  repoCtaMode?: PortfolioExperienceDuotoneRepoCtaMode;
  /** When true, the role title spans both columns above thumb + editorial. */
  fullWidthTitle?: boolean;
}) {
  // Title above the media column only (or full-bleed when fullWidthTitle); thumbnail +
  // editorial share the next row with items-start so their tops align.
  const titleThumbRowGap = experienceDuotoneScrollTitleThumbGapClass(verticalGap);
  const roleStackGap = experienceDuotoneScrollRoleStackClass(verticalGap);
  const thumbCursor = repoCtaMode === 'thumb-cursor';
  return (
    <div className={`flex w-full flex-col ${roleStackGap}`}>
      {blocks.map((block, index) => {
        const flipped = alternateSides && index % 2 === 1;
        const infoFirst = flipped ? !swapSides : swapSides;
        const { links } = resolveExperienceContent(block);
        const consultHref =
          flags.showProof && thumbCursor && links[0]?.url ? links[0].url : null;
        const mediaCol = infoFirst ? 2 : 1;
        const infoCol = infoFirst ? 1 : 2;
        return (
          <div
            key={block.id}
            className={`grid w-full items-start gap-x-14 lg:gap-x-20 xl:gap-x-28 ${titleThumbRowGap}`}
            style={{
              gridTemplateColumns: infoFirst
                ? 'minmax(0,0.95fr) minmax(0,1.1fr)'
                : 'minmax(0,1.1fr) minmax(0,0.95fr)',
            }}
          >
            <div
              className="w-full"
              style={
                fullWidthTitle
                  ? { gridColumn: '1 / -1', gridRow: 1 }
                  : { gridColumn: mediaCol, gridRow: 1 }
              }
            >
              <DuotoneLeftPanel
                block={block}
                ink={ink}
                muted={muted}
                secondary={secondary}
                border={border}
                premium
                accent={accent}
                thumbnailEffect={thumbnailEffect}
                thumbnailHeight={thumbnailHeight}
                naturalHeight
                scrollPart="title"
                {...flags}
              />
            </div>
            <div
              className="w-full self-start"
              style={{ gridColumn: mediaCol, gridRow: 2 }}
            >
              <DuotoneLeftPanel
                block={block}
                ink={ink}
                muted={muted}
                secondary={secondary}
                border={border}
                premium
                accent={accent}
                thumbnailEffect={thumbnailEffect}
                thumbnailHeight={thumbnailHeight}
                naturalHeight
                scrollPart="thumb"
                repoCtaMode={repoCtaMode}
                consultHref={consultHref}
                {...flags}
              />
            </div>
            <div
              // Deliberately NOT flush with the thumbnail's top edge (row 2 start): this
              // downward offset breaks the rectilinear title/thumb ↔ description alignment
              // so the two columns read as a diagonal cascade instead of a rigid grid.
              className="min-w-0 w-full self-start mt-10 lg:mt-16 xl:mt-24"
              style={{ gridColumn: infoCol, gridRow: 2 }}
            >
              <DuotoneRightPanel
                block={block}
                ink={ink}
                muted={muted}
                secondary={secondary}
                accent={accent}
                border={border}
                background={background}
                premium
                flushTop
                hideRepoButton={thumbCursor}
                stickyVerticalGap={verticalGap}
                {...flags}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Duotone "Slide" mode — one role at a time, chevrons top-right, smooth horizontal slide. */
/** Duotone design, Slide mode: the prev/next control — 5 presentations. */
function DuotoneSlideNav({
  navStyle,
  blocks,
  activeIndex,
  accent,
  border,
  onNavigate,
}: {
  navStyle: PortfolioExperienceDuotoneSlideNavStyle;
  blocks: ProfileMediaBlock[];
  activeIndex: number;
  accent: string;
  border: string;
  onNavigate: (index: number) => void;
}) {
  if (navStyle === 'text') {
    const linkClass =
      'group relative text-[0.85rem] font-semibold disabled:opacity-30 disabled:after:hidden';
    const underline = (
      <span
        aria-hidden
        className="absolute -bottom-1 left-0 h-px w-0 transition-[width] duration-200 ease-out group-hover:w-full"
        data-pf-no-color-transition=""
        style={{ backgroundColor: accent }}
      />
    );
    return (
      <div className="flex items-center gap-5">
        <button
          type="button"
          aria-label="Previous role"
          disabled={activeIndex === 0}
          onClick={() => onNavigate(activeIndex - 1)}
          className={linkClass}
          style={{ color: accent, fontFamily: REEL_SANS }}
        >
          Previous
          {underline}
        </button>
        <span className="h-4 w-px" style={{ backgroundColor: border }} aria-hidden />
        <button
          type="button"
          aria-label="Next role"
          disabled={activeIndex === blocks.length - 1}
          onClick={() => onNavigate(activeIndex + 1)}
          className={linkClass}
          style={{ color: accent, fontFamily: REEL_SANS }}
        >
          Next
          {underline}
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        aria-label="Previous role"
        disabled={activeIndex === 0}
        onClick={() => onNavigate(activeIndex - 1)}
        className="flex h-11 w-11 items-center justify-center rounded-full transition-[background-color,opacity,transform] duration-200 hover:scale-110 active:scale-95 disabled:opacity-30 disabled:hover:scale-100"
        data-pf-no-color-transition=""
        style={{ color: accent, backgroundColor: `color-mix(in srgb, ${accent} 12%, transparent)` }}
        onMouseEnter={(event) => {
          event.currentTarget.style.backgroundColor = `color-mix(in srgb, ${accent} 22%, transparent)`;
        }}
        onMouseLeave={(event) => {
          event.currentTarget.style.backgroundColor = `color-mix(in srgb, ${accent} 12%, transparent)`;
        }}
      >
        <DuotoneChevronIcon direction="left" />
      </button>
      <button
        type="button"
        aria-label="Next role"
        disabled={activeIndex === blocks.length - 1}
        onClick={() => onNavigate(activeIndex + 1)}
        className="flex h-11 w-11 items-center justify-center rounded-full transition-[background-color,opacity,transform] duration-200 hover:scale-110 active:scale-95 disabled:opacity-30 disabled:hover:scale-100"
        data-pf-no-color-transition=""
        style={{ color: accent, backgroundColor: `color-mix(in srgb, ${accent} 12%, transparent)` }}
        onMouseEnter={(event) => {
          event.currentTarget.style.backgroundColor = `color-mix(in srgb, ${accent} 22%, transparent)`;
        }}
        onMouseLeave={(event) => {
          event.currentTarget.style.backgroundColor = `color-mix(in srgb, ${accent} 12%, transparent)`;
        }}
      >
        <DuotoneChevronIcon direction="right" />
      </button>
    </div>
  );
}

function DuotoneSlideRoles({
  blocks,
  ink,
  muted,
  accent,
  secondary,
  border,
  background,
  activeIndex,
  onNavigate,
  navStyle,
  flags,
  frameBorderColor,
  frameRadiusPx,
  autoAdvance = false,
}: {
  blocks: ProfileMediaBlock[];
  ink: string;
  muted: string;
  accent: string;
  secondary: string;
  border: string;
  background: string;
  activeIndex: number;
  onNavigate: (index: number) => void;
  navStyle: PortfolioExperienceDuotoneSlideNavStyle;
  flags: DuotoneContentFlags;
  frameBorderColor: string | null;
  frameRadiusPx: number;
  /** General → "Auto-advance" toggle — every 5s, paused while the frame is hovered. */
  autoAdvance?: boolean;
}) {
  const frameStyle = frameBorderColor
    ? {
        border: `1px solid ${frameBorderColor}`,
        borderRadius: frameRadiusPx,
        padding: '1.75rem',
        backgroundColor: `color-mix(in srgb, ${ink} 3%, ${background})`,
      }
    : undefined;
  // The frame div below always stretches to fill its slot's full height (no centering), so its
  // bottom-left corner always coincides with the slot's own bottom-left, inset by the frame's
  // own padding — for every slide, with no per-block measurement needed.
  const frameInset = frameStyle ? '1.75rem' : '0px';

  const [frameHovered, setFrameHovered] = useState(false);
  const reduceMotion = useReducedMotion();
  useEffect(() => {
    if (!autoAdvance || frameHovered || reduceMotion === true || blocks.length <= 1) return;
    const id = window.setInterval(() => {
      onNavigate((activeIndex + 1) % blocks.length);
    }, 5000);
    return () => window.clearInterval(id);
  }, [autoAdvance, frameHovered, reduceMotion, activeIndex, blocks.length, onNavigate]);

  return (
    <div className="relative w-full">
      {/* Chevron nav: a normal-flow row above the frame, entirely outside its border — never
          inside the frame's own padding, so it can't read as nested/duplicated chrome. Living
          outside the translating track below also means it never slides with the transition. */}
      <div className="mb-4 flex w-full justify-end">
        <DuotoneSlideNav
          navStyle={navStyle}
          blocks={blocks}
          activeIndex={activeIndex}
          accent={accent}
          border={border}
          onNavigate={onNavigate}
        />
      </div>

      <div className="relative w-full">
        {/* Numbering: pinned to the frame's actual bottom-left corner, outside the translating
            track so it never slides with the glide transition. */}
        <div
          className="pointer-events-none absolute z-20 flex items-baseline gap-1.5"
          style={{ left: frameInset, bottom: frameInset }}
        >
          <span
            className="text-[0.78rem] font-semibold tracking-[0.06em]"
            style={{ color: accent, fontFamily: REEL_SANS }}
          >
            {String(activeIndex + 1).padStart(2, '0')}
          </span>
          <span className="text-[0.78rem] tracking-[0.06em]" style={{ color: muted, fontFamily: REEL_SANS }}>
            / {String(blocks.length).padStart(2, '0')}
          </span>
        </div>

        {/* The frame itself (border / radius / background / padding) is static — rendered once,
            outside the translating track — so it never glides with the transition. Only the
            content inside slides; the frame reads as a fixed window the roles pass behind. */}
        <div
          className="box-border w-full"
          style={frameStyle}
          onMouseEnter={() => setFrameHovered(true)}
          onMouseLeave={() => setFrameHovered(false)}
        >
          {/* The clip boundary lives INSIDE the frame's padding, exactly at the sliding
              content's own width — putting overflow-hidden on the padded frame instead left a
              padding-wide sliver of the neighboring slide visible at each edge, since a slide's
              translateX(100%) is 100% of the content width, not the wider padded frame. */}
          <div className="overflow-hidden">
            {/* Track: every slide is stacked in the SAME grid cell (grid-area overlap), so the
                container's intrinsic height is always the tallest slide's natural content height —
                a value fixed by the full set of slides, not by whichever one happens to be active.
                It cannot change as you move between slides, unlike auto-sizing a translating row. */}
            <div className="grid w-full grid-cols-1 items-stretch">
              {blocks.map((block, index) => (
              <div
                key={block.id}
                className="col-start-1 row-start-1 flex min-h-0 w-full items-stretch justify-center"
                style={{
                  transform: `translateX(${(index - activeIndex) * 100}%)`,
                  opacity: index === activeIndex ? 1 : 0.4,
                  pointerEvents: index === activeIndex ? 'auto' : 'none',
                  transition: 'transform 650ms cubic-bezier(0.65, 0, 0.35, 1), opacity 500ms ease',
                  willChange: 'transform',
                }}
              >
                <div className="flex h-full min-h-0 w-full">
                  <div className="flex w-[50%] shrink-0 flex-col pr-6">
                    <div className="flex flex-1 flex-col justify-center">
                      <DuotoneLeftPanel
                        block={block}
                        ink={ink}
                        muted={muted}
                        secondary={secondary}
                        border={border}
                        naturalHeight
                        {...flags}
                      />
                    </div>
                  </div>
                  <div className="flex w-[50%] flex-1 flex-col justify-center">
                    <DuotoneRightPanel
                      block={block}
                      ink={ink}
                      muted={muted}
                      secondary={secondary}
                      accent={accent}
                      border={border}
                      background={background}
                      enhanced
                      {...flags}
                    />
                  </div>
                </div>
              </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Duotone "Sticky" mode — its own fully bespoke 3-tier responsive layout (unlike Scroll and
 * Slide, which share DuotoneExperienceList's generic desktop/mobile split):
 *
 * - Desktop (xl+, ≥1280px): the original Sticky mechanic — title + thumbnail scroll in normal
 *   flow (each block sized by its own stickyVerticalGap min-height) while the description /
 *   timeline / tools panel is pinned (`position: sticky`) and cross-fades between roles,
 *   nudged below dead-center so the two columns read as a diagonal cascade rather than a
 *   rigid side-by-side corridor.
 * - Tablet (800px–1279px): sticky is deliberately OFF — a cramped two-column pin at this width
 *   reads as broken, not premium. Single unified column instead: giant title, a large centered
 *   thumbnail, then description / timeline / tools at full width.
 * - Mobile (<800px): the same single-column shape, tighter (py-8) spacing, a title clamp that
 *   actually shrinks on narrow phones (the shared desktop clamp's 3rem floor otherwise wins
 *   regardless of viewport), and a horizontally swipeable tools strip instead of wrapped tags.
 */
function DuotoneStickyExperience({
  blocks,
  ink,
  muted,
  accent,
  secondary,
  border,
  background,
  flags,
  thumbnailEffect,
  thumbnailHeight,
  swapSides,
  verticalGap,
  repoCtaMode,
}: {
  blocks: ProfileMediaBlock[];
  ink: string;
  muted: string;
  accent: string;
  secondary: string;
  border: string;
  background: string;
  flags: DuotoneContentFlags;
  thumbnailEffect: PortfolioExperienceDuotoneThumbnailEffect;
  thumbnailHeight: PortfolioExperienceDuotoneThumbnailHeight;
  swapSides: boolean;
  verticalGap: PortfolioExperienceDuotoneStickyVerticalGap;
  repoCtaMode: PortfolioExperienceDuotoneRepoCtaMode;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRefs = useRef<Array<HTMLElement | null>>([]);
  const thumbCursorCta = repoCtaMode === 'thumb-cursor';
  const sectionMinVh = experienceDuotoneStickySectionVh(verticalGap);

  useEffect(() => {
    const sections = sectionRefs.current.filter((el): el is HTMLElement => Boolean(el));
    if (sections.length === 0) return;
    // Center-band observer: switch roles when a title/thumbnail block owns the middle of the
    // viewport, with fine thresholds so the handoff stays smooth instead of snapping at 50%.
    const observer = new IntersectionObserver(
      (entries) => {
        let best: { index: number; ratio: number } | null = null;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const entryIndex = sections.indexOf(entry.target as HTMLElement);
          if (entryIndex === -1) continue;
          if (!best || entry.intersectionRatio > best.ratio) {
            best = { index: entryIndex, ratio: entry.intersectionRatio };
          }
        }
        if (best) {
          setActiveIndex((current) => (current === best!.index ? current : best!.index));
        }
      },
      { threshold: [0.2, 0.35, 0.5, 0.65, 0.8], rootMargin: '-18% 0px -18% 0px' }
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [blocks.length]);

  if (blocks.length === 0) return null;

  // Sticky-only defaults: a rail-and-index task list and a dotted editorial tools line read
  // as a deliberate timeline next to a pinned title. Swapped in only when the shared General
  // settings still sit at their own global defaults — same override precedent Cards uses for
  // tasksDisplay — so an explicit user choice elsewhere is never second-guessed.
  const tasksDisplay: PortfolioExperienceTasksDisplay =
    flags.tasksDisplay === 'editorial-dash' ? 'accordion-stack' : flags.tasksDisplay;
  const toolsBadgeStyle: PortfolioExperienceToolsBadgeStyle =
    flags.toolsBadgeStyle === 'mineral-pills' ? 'editorial-list' : flags.toolsBadgeStyle;

  return (
    <>
      {/* Desktop (xl+): title/thumbnail scrolls in flow, description/timeline/tools is pinned
          and cross-fades between roles. */}
      <div className="relative z-[1] hidden w-full xl:block">
        {/* Explicit height (not min-height/auto) so the sticky panel always has real room to
            stick — an auto-height row gives the pinned column's sticky child nothing to stick
            within, and it just sits static instead of tracking the scroll. */}
        <div
          // Same column gap as Scroll mode (gap-x-14 lg:gap-x-20 xl:gap-x-28) — no separate
          // padding added on either column, so the middle gutter reads identically tight.
          className="relative flex w-full gap-14 lg:gap-20 xl:gap-28"
          style={{ height: `${blocks.length * sectionMinVh}vh` }}
        >
          {(() => {
            // Title/thumbnail scrolls in normal flow — each block sized via its own
            // stickyVerticalGap-driven min-height (DuotoneLeftPanel's panelMinHeight) — while
            // the description/timeline/tools panel is pinned and cross-fades between roles.
            const titleColumn = (
              <div key="title" className="flex h-full min-w-0 w-[46%] shrink-0 flex-col xl:w-[48%]">
                {blocks.map((block, index) => {
                  const { links } = resolveExperienceContent(block);
                  const consultHref =
                    flags.showProof && thumbCursorCta && links[0]?.url ? links[0].url : null;
                  return (
                    <DuotoneLeftPanel
                      key={block.id}
                      block={block}
                      ink={ink}
                      muted={muted}
                      secondary={secondary}
                      border={border}
                      registerRef={(el) => {
                        sectionRefs.current[index] = el;
                      }}
                      premium
                      accent={accent}
                      thumbnailEffect={thumbnailEffect}
                      thumbnailHeight={thumbnailHeight}
                      stickyVerticalGap={verticalGap}
                      inView={index === activeIndex}
                      repoCtaMode={repoCtaMode}
                      consultHref={consultHref}
                      {...flags}
                    />
                  );
                })}
              </div>
            );
            const infoColumn = (
              <div key="info" className="relative h-full min-w-0 flex-1">
                <div className="sticky top-0 h-screen w-full">
                  {blocks.map((block, index) => (
                    <DuotoneRightPanel
                      key={block.id}
                      block={block}
                      ink={ink}
                      muted={muted}
                      secondary={secondary}
                      accent={accent}
                      border={border}
                      background={background}
                      active={index === activeIndex}
                      lane={
                        index === activeIndex ? 'active' : index < activeIndex ? 'above' : 'below'
                      }
                      premium
                      stickyVerticalGap={verticalGap}
                      hideRepoButton={thumbCursorCta}
                      {...flags}
                      tasksDisplay={tasksDisplay}
                      toolsBadgeStyle={toolsBadgeStyle}
                    />
                  ))}
                </div>
              </div>
            );
            return swapSides ? [infoColumn, titleColumn] : [titleColumn, infoColumn];
          })()}
        </div>
      </div>

      {/* Tablet (800px–1279px): single unified column — sticky pinning would only cramp two
          columns this narrow, so it's off entirely; giant title, a large centered thumbnail,
          then description / timeline / tools at full width. */}
      <div className="relative z-[1] hidden w-full min-[800px]:block xl:hidden">
        <div className="flex flex-col">
          {blocks.map((block, index) => {
            const { links } = resolveExperienceContent(block);
            const consultHref =
              flags.showProof && thumbCursorCta && links[0]?.url ? links[0].url : null;
            return (
              <div key={block.id} className={index > 0 ? 'mt-24' : ''}>
                <div className="mx-auto w-full max-w-2xl">
                  <DuotoneLeftPanel
                    block={block}
                    ink={ink}
                    muted={muted}
                    secondary={secondary}
                    border={border}
                    premium
                    naturalHeight
                    // No scroll-linked reveal here (one panel per block, normal flow) — settle
                    // straight into the resting state instead of the pre-reveal dim/zoom.
                    inView
                    accent={accent}
                    thumbnailEffect={thumbnailEffect}
                    thumbnailHeight={thumbnailHeight}
                    repoCtaMode={repoCtaMode}
                    consultHref={consultHref}
                    {...flags}
                  />
                </div>
                <div className="mt-12">
                  <DuotoneRightPanel
                    block={block}
                    ink={ink}
                    muted={muted}
                    secondary={secondary}
                    accent={accent}
                    border={border}
                    background={background}
                    premium
                    wideMeasure
                    hideRepoButton={thumbCursorCta}
                    {...flags}
                    tasksDisplay={tasksDisplay}
                    toolsBadgeStyle={toolsBadgeStyle}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile (<800px): vertical narration — tight (py-8) stacking, a title clamp that
          actually shrinks on a phone, and a swipeable tools strip instead of a wrapped stack. */}
      <div className="relative z-[1] flex w-full flex-col min-[800px]:hidden">
        {blocks.map((block) => {
          const { links } = resolveExperienceContent(block);
          const consultHref =
            flags.showProof && thumbCursorCta && links[0]?.url ? links[0].url : null;
          return (
            <div key={block.id} className="py-8">
              <DuotoneLeftPanel
                block={block}
                ink={ink}
                muted={muted}
                secondary={secondary}
                border={border}
                premium
                naturalHeight
                inView
                titleScale="compact"
                accent={accent}
                thumbnailEffect={thumbnailEffect}
                thumbnailHeight={thumbnailHeight}
                repoCtaMode={repoCtaMode}
                consultHref={consultHref}
                {...flags}
              />
              <div className="mt-8">
                <DuotoneRightPanel
                  block={block}
                  ink={ink}
                  muted={muted}
                  secondary={secondary}
                  accent={accent}
                  border={border}
                  background={background}
                  premium
                  wideMeasure
                  toolsLayout="scroll-x"
                  hideRepoButton={thumbCursorCta}
                  {...flags}
                  tasksDisplay={tasksDisplay}
                  toolsBadgeStyle={toolsBadgeStyle}
                />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

export function DuotoneExperienceList({
  blocks,
  presentation = DEFAULT_EXPERIENCE_PRESENTATION,
}: {
  blocks: ProfileMediaBlock[];
  presentation?: PortfolioExperiencePresentationSettings;
  motionProfile?: PortfolioGlobalMotionProfile;
  forceSingleColumn?: boolean;
}) {
  const scrollMode = presentation.duotoneScrollMode ?? 'sticky';
  // Slide mode's own prev/next state. Sticky now owns its own activeIndex + scroll observer
  // locally (DuotoneStickyExperience) — its pinned column and the column it watches both
  // swapped sides, and it never needs to share state with Slide.
  const [activeIndex, setActiveIndex] = useState(0);

  if (blocks.length === 0) return null;

  // Same mode-aware resolution every other Experience design uses (Cards, Reel, …):
  // presentation.titleColor / subtitleColor / accentColor are theme-agnostic (always the
  // palette's dark-mode values), and ensureExperienceInkContrast rescues them into a safe
  // fallback whenever the site's actual active mode would make them unreadable.
  const isDark = presentation.activeColorMode !== 'light';
  const colorMode = resolveExperienceColorMode(presentation);
  const styles = normalizeExperienceElementStyles(presentation.elementStyles);
  const accent = experienceAccentColor(presentation.accentColor);
  const secondary = experienceSecondaryStatusColor(presentation);
  const ink = ensureExperienceInkContrast(
    presentation.titleColor?.trim() || resolveExperienceTextColor(styles.title, colorMode),
    isDark,
    DEFAULT_EXPERIENCE_TITLE_COLOR,
    DEFAULT_EXPERIENCE_TITLE_COLOR_DARK
  );
  const muted = ensureExperienceInkContrast(
    presentation.subtitleColor?.trim() || resolveExperienceTextColor(styles.meta, colorMode),
    isDark,
    DEFAULT_EXPERIENCE_MUTED_COLOR,
    DEFAULT_EXPERIENCE_MUTED_COLOR_DARK
  );
  const border = isDark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.12)';
  // Reference color for the card/chip tints below — always a real value.
  const background = isDark
    ? presentation.sectionBackgroundColor?.trim() || DEFAULT_EXPERIENCE_PALETTE.fond
    : DEFAULT_SECTION_BACKGROUND_COLOR;
  // Explicit section fill: only in dark mode. In light mode this section paints nothing of
  // its own, same as every other section by default — the page's own background shows
  // through, instead of forcing an independent white that could drift from it.
  const sectionFill = isDark ? background : null;

  // General → Content settings this design now respects, same as Cards/Editorial/Reel.
  const flags: DuotoneContentFlags = {
    showTitle: presentation.showTitle !== false,
    showPeriod: presentation.showPeriod !== false,
    showMeta: presentation.showMeta !== false,
    showDescription: presentation.showDescription !== false,
    showTasks: presentation.showTasks !== false,
    showTools: presentation.showTools !== false,
    showProof: presentation.showProof !== false,
    showEntryMedia: presentation.showEntryMedia !== false,
    tasksDisplay: presentation.tasksDisplay,
    toolsBadgeStyle: presentation.toolsBadgeStyle,
    repoLinkButtonStyle: resolveExperienceRepoLinkStyle(presentation.repoLinkButtonStyle, 'icon'),
    isDark,
  };

  // Scroll / Slide modes only: an optional frame drawn around each full screen.
  const frameColorSetting = presentation.duotoneFrameColor ?? 'none';
  const frameRadiusSetting = presentation.duotoneFrameRadius ?? 'sm';
  const frameBorderColor =
    frameColorSetting === 'none' ? null : frameColorSetting === 'muted' ? muted : border;
  const frameRadiusPx = frameRadiusSetting === 'none' ? 0 : frameRadiusSetting === 'lg' ? 28 : 16;

  // Scroll / Sticky modes: thumbnail below the title.
  const thumbnailEffect = presentation.duotoneThumbnailEffect ?? 'grayscale';
  const thumbnailHeight = presentation.duotoneThumbnailHeight ?? 'md';
  const stickySwapSides = presentation.duotoneStickySwapSides === true;
  const stickyVerticalGap = presentation.duotoneStickyVerticalGap ?? 'md';
  const repoCtaMode = presentation.duotoneRepoCtaMode ?? 'footer';

  return (
    // No full-bleed escape hatch here: content stays within the page's own gutter / max-width,
    // exactly like every other section. Only the flat background bleeds edge to edge below,
    // the same way PortfolioSectionShell paints every other section's background.
    <div className="relative isolate w-full">
      {sectionFill ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 left-1/2 z-0 w-screen -translate-x-1/2"
          style={{ backgroundColor: sectionFill }}
        />
      ) : null}

      {scrollMode === 'sticky' ? (
        <DuotoneStickyExperience
          blocks={blocks}
          ink={ink}
          muted={muted}
          accent={accent}
          secondary={secondary}
          border={border}
          background={background}
          flags={flags}
          thumbnailEffect={thumbnailEffect}
          thumbnailHeight={thumbnailHeight}
          swapSides={stickySwapSides}
          verticalGap={stickyVerticalGap}
          repoCtaMode={repoCtaMode}
        />
      ) : (
        <>
          {/* Desktop: the selected scroll mode. */}
          <div className="relative z-[1] flex w-full flex-col max-[800px]:hidden">
            {scrollMode === 'scroll' ? (
              <DuotoneScrollRoles
                blocks={blocks}
                ink={ink}
                muted={muted}
                accent={accent}
                secondary={secondary}
                border={border}
                background={background}
                flags={flags}
                thumbnailEffect={thumbnailEffect}
                thumbnailHeight={thumbnailHeight}
                swapSides={stickySwapSides}
                alternateSides={presentation.duotoneAlternateSides === true}
                verticalGap={stickyVerticalGap}
                repoCtaMode={repoCtaMode}
                fullWidthTitle={presentation.duotoneScrollFullWidthTitle === true}
              />
            ) : (
              <DuotoneSlideRoles
                blocks={blocks}
                ink={ink}
                muted={muted}
                accent={accent}
                secondary={secondary}
                border={border}
                background={background}
                activeIndex={activeIndex}
                onNavigate={(next) => setActiveIndex(Math.max(0, Math.min(blocks.length - 1, next)))}
                navStyle={presentation.duotoneSlideNavStyle ?? 'chevron'}
                flags={flags}
                frameBorderColor={frameBorderColor}
                frameRadiusPx={frameRadiusPx}
                autoAdvance={presentation.duotoneAutoAdvance === true}
              />
            )}
          </div>

          {/* Mobile: simple stacked pairs, no pinning — regardless of desktop mode. */}
          <div className="relative z-[1] hidden w-full flex-col max-[800px]:flex">
            {blocks.map((block) => (
              <div key={block.id} className="py-10">
                <DuotoneLeftPanel
                  block={block}
                  ink={ink}
                  muted={muted}
                  secondary={secondary}
                  border={border}
                  {...flags}
                />
                <DuotoneRightPanel
                  block={block}
                  ink={ink}
                  muted={muted}
                  secondary={secondary}
                  accent={accent}
                  border={border}
                  background={background}
                  className="mt-8"
                  {...flags}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/** Gallery design — Framer/Webflow-style airy thumbnail grid, with a click-to-open detail modal. */
/** Shared detail content — description, tasks, tools, repo link — reused by all three Gallery
 * "Detail view" modes (Modal / Drawer / Inline) so they never drift out of sync. */
function GalleryDetailContent({
  block,
  ink,
  muted,
  accent,
  secondary,
  border,
  cardBg,
  isDark,
  flags,
  compact = false,
}: {
  block: ProfileMediaBlock;
  ink: string;
  muted: string;
  accent: string;
  secondary: string;
  border: string;
  cardBg: string;
  isDark: boolean;
  flags: DuotoneContentFlags;
  /** Smaller type + tighter spacing for the narrower Drawer / Inline contexts. */
  compact?: boolean;
}) {
  const { period, title, organization, description, status, tasks, tools, links, location, employmentType } =
    resolveExperienceContent(block);
  const metaLine = [organization, location, employmentTypeLabel(employmentType) || null]
    .filter((part): part is string => Boolean(part))
    .join('  ·  ');
  const repoLink = flags.showProof ? (links[0] ?? null) : null;
  const displayTasks = flags.showTasks ? tasks : [];
  const displayTools = flags.showTools ? tools : [];
  const showBadge = flags.showMeta && (status === 'ONGOING' || status === 'FINISHED');
  const combinedMeta = [flags.showPeriod ? period : null, flags.showMeta ? metaLine : null]
    .filter((part): part is string => Boolean(part))
    .join('  ·  ');

  return (
    <>
      {showBadge ? (
        <div className={compact ? 'mb-4' : 'mb-5'}>
          <ExperienceEditorialOngoingBadge
            status={status}
            isDark={isDark}
            accentColor={accent}
            secondaryColor={secondary}
          />
        </div>
      ) : null}
      {flags.showTitle && title ? (
        <h3
          className={
            compact
              ? 'mt-2 text-[1.15rem] font-semibold leading-tight'
              : 'mt-3 text-[1.6rem] font-semibold leading-tight'
          }
          style={{ color: ink }}
        >
          {title}
        </h3>
      ) : null}
      {combinedMeta ? (
        <p className={compact ? 'mt-1.5 text-[0.85rem]' : 'mt-2 text-[0.95rem]'} style={{ color: muted }}>
          {combinedMeta}
        </p>
      ) : null}

      {flags.showDescription && description ? (
        <p className={compact ? 'mt-4 text-[0.92rem] leading-relaxed' : 'mt-7 text-[1rem] leading-relaxed'} style={{ color: muted }}>
          {description}
        </p>
      ) : null}

      {displayTasks.length > 0 ? (
        <div className={compact ? 'mt-5' : 'mt-8'}>
          <ExperienceTasksDisplay
            tasks={displayTasks}
            display={flags.tasksDisplay}
            bodyColor={ink}
            mutedColor={accent}
            isDark={isDark}
            label=""
            size="md"
          />
        </div>
      ) : null}

      {displayTools.length > 0 ? (
        <div className={compact ? 'mt-5' : 'mt-8'}>
          <ExperienceToolsDisplay
            tools={displayTools}
            style={flags.toolsBadgeStyle}
            ink={ink}
            muted={muted}
            background={cardBg}
            isDark={isDark}
            size={compact ? 'sm' : 'md'}
          />
        </div>
      ) : null}

      {repoLink ? (
        <div className={compact ? 'mt-7' : 'mt-10'}>
          <PortfolioLinkButton
            variant={flags.repoLinkButtonStyle}
            href={repoLink.url}
            label={repoLink.label || 'View repository'}
            palette={{ background: cardBg, ink, muted, accent, border }}
          />
        </div>
      ) : null}
    </>
  );
}

function GalleryExperienceCard({
  block,
  accent,
  secondaryColor,
  titleColor,
  mutedColor,
  border,
  isDark,
  flags,
  thumbnailFit,
  thumbnailRadius,
  hoverEffect,
  onOpen,
}: {
  block: ProfileMediaBlock;
  accent: string;
  secondaryColor: string;
  titleColor: string;
  mutedColor: string;
  border: string;
  isDark: boolean;
  flags: DuotoneContentFlags;
  thumbnailFit: PortfolioExperienceGalleryThumbnailFit;
  thumbnailRadius: PortfolioExperienceCardsBorderRadius;
  hoverEffect: PortfolioExperienceLoftHoverEffect;
  onOpen: () => void;
}) {
  const { period, title, organization, status, tools, location, employmentType } =
    resolveExperienceContent(block);
  const metaLine = [organization, location, employmentTypeLabel(employmentType) || null]
    .filter((part): part is string => Boolean(part))
    .join('  ·  ');
  const mediaUrl = typeof block.mediaUrl === 'string' ? block.mediaUrl.trim() : '';
  const initial = (title || organization || '•').trim().charAt(0).toUpperCase();
  const displayTools = flags.showTools ? tools : [];
  const visibleTools = displayTools.slice(0, 4);
  const cardBg = `color-mix(in srgb, ${titleColor} 3%, transparent)`;
  const rimColor = isDark ? 'rgba(255,255,255,0.38)' : 'rgba(0,0,0,0.22)';
  const veilColor = isDark ? 'rgba(0,0,0,0.34)' : 'rgba(0,0,0,0.16)';

  return (
    <button
      type="button"
      onClick={onOpen}
      data-pf-no-color-transition=""
      className={`pf-loft-hover-${hoverEffect} flex h-full w-full flex-col overflow-hidden border text-left ${experienceCardsBorderRadiusClass(thumbnailRadius)}`}
      style={
        {
          borderColor: border,
          backgroundColor: cardBg,
          boxShadow: isDark ? '0 0 0 rgba(0,0,0,0)' : '0 1px 2px rgba(15,15,15,0.04)',
          ['--loft-glow' as string]: `color-mix(in srgb, ${accent} 32%, transparent)`,
          ['--loft-rim' as string]: rimColor,
          ['--loft-veil' as string]: veilColor,
        } as CSSProperties
      }
    >
      {flags.showEntryMedia ? (
        <div
          data-pf-no-color-transition=""
          className="pf-loft-card-thumb relative aspect-[4/3] w-full shrink-0 overflow-hidden"
          style={{ backgroundColor: `color-mix(in srgb, ${accent} 12%, transparent)` }}
        >
          <div data-pf-no-color-transition="" className="pf-loft-card-media absolute inset-0">
            {mediaUrl && thumbnailFit === 'contain' ? (
              <>
                {/* Frosted-glass ambient fill: the same image, blurred and scaled past the
                    frame's edges (hiding the soft blur fringe), stands in for a flat letterbox
                    color — the full image on top then reads as glass floating over it. */}
                <div className="absolute inset-0 scale-125" style={{ filter: 'blur(28px) saturate(1.15)' }} aria-hidden>
                  <ProductThumbnailMedia url={mediaUrl} alt="" fit="cover" className="h-full w-full" />
                </div>
                <div
                  className="absolute inset-0"
                  style={{ backgroundColor: isDark ? 'rgba(0,0,0,0.32)' : 'rgba(255,255,255,0.28)' }}
                  aria-hidden
                />
                <div className="absolute inset-0 p-4">
                  <ProductThumbnailMedia
                    url={mediaUrl}
                    alt={title || 'Experience'}
                    fit="contain"
                    className="h-full w-full drop-shadow-[0_12px_28px_rgba(0,0,0,0.35)]"
                  />
                </div>
              </>
            ) : mediaUrl ? (
              <ProductThumbnailMedia
                url={mediaUrl}
                alt={title || 'Experience'}
                fit="cover"
                className="h-full w-full object-top"
              />
            ) : (
              <div
                className="flex h-full w-full items-center justify-center text-[3.5rem] font-semibold"
                style={{ color: `color-mix(in srgb, ${accent} 55%, transparent)` }}
                aria-hidden
              >
                {initial}
              </div>
            )}
          </div>

          {hoverEffect === 'curtain' ? (
            <>
              <div
                data-pf-no-color-transition=""
                className="pf-loft-curtain-veil pointer-events-none absolute inset-0"
                aria-hidden
              />
              <div
                data-pf-no-color-transition=""
                className="pf-loft-curtain-glow pointer-events-none absolute inset-0"
                aria-hidden
              />
            </>
          ) : null}

          {hoverEffect === 'magnetic' ? (
            <div
              data-pf-no-color-transition=""
              className="pf-loft-magnetic-cue pointer-events-none absolute inset-0 flex items-center justify-center"
              aria-hidden
            >
              <span
                data-pf-no-color-transition=""
                className="pf-loft-magnetic-pill rounded-full px-3.5 py-1.5 font-mono text-[0.68rem] font-medium uppercase tracking-[0.14em]"
                style={{
                  color: isDark ? 'rgba(255,255,255,0.92)' : 'rgba(0,0,0,0.88)',
                  backgroundColor: isDark ? 'rgba(0,0,0,0.22)' : 'rgba(255,255,255,0.4)',
                }}
              >
                [ View case ↗ ]
              </span>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-1 flex-col gap-2.5 p-5">
        <div className="flex items-start justify-between gap-3">
          {flags.showTitle && title ? (
            <h3 className="pf-loft-card-title min-w-0 text-[1.1rem] font-semibold leading-snug" style={{ color: titleColor }}>
              {title}
            </h3>
          ) : null}
          <ExperienceEditorialOngoingBadge
            status={flags.showMeta ? status : null}
            isDark={isDark}
            accentColor={accent}
            secondaryColor={secondaryColor}
          />
        </div>
        {flags.showMeta && metaLine ? (
          <p className="text-[0.88rem]" style={{ color: mutedColor }}>
            {metaLine}
          </p>
        ) : null}
        {flags.showPeriod && period ? (
          <p className="text-[0.82rem]" style={{ color: mutedColor }}>
            {period}
          </p>
        ) : null}
        {visibleTools.length > 0 ? (
          <div className="mt-auto pt-2">
            <ExperienceToolsDisplay
              tools={visibleTools}
              style={flags.toolsBadgeStyle}
              ink={titleColor}
              muted={mutedColor}
              background={cardBg}
              isDark={isDark}
              size="sm"
            />
          </div>
        ) : null}
      </div>
    </button>
  );
}

function GalleryExperienceModal({
  block,
  ink,
  muted,
  accent,
  secondary,
  border,
  background,
  isDark,
  flags,
  thumbnailFit,
  thumbnailRadius,
  onClose,
  onPrev,
  onNext,
  canPrev,
  canNext,
}: {
  block: ProfileMediaBlock;
  ink: string;
  muted: string;
  accent: string;
  secondary: string;
  border: string;
  background: string;
  isDark: boolean;
  flags: DuotoneContentFlags;
  thumbnailFit: PortfolioExperienceGalleryThumbnailFit;
  thumbnailRadius: PortfolioExperienceCardsBorderRadius;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  canPrev: boolean;
  canNext: boolean;
}) {
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    const id = window.requestAnimationFrame(() => setEntered(true));
    return () => window.cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      else if (event.key === 'ArrowLeft' && canPrev) onPrev();
      else if (event.key === 'ArrowRight' && canNext) onNext();
    };
    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose, onPrev, onNext, canPrev, canNext]);

  const { title } = resolveExperienceContent(block);
  const mediaUrl = flags.showEntryMedia && typeof block.mediaUrl === 'string' ? block.mediaUrl.trim() : '';
  const cardBg = `color-mix(in srgb, ${ink} 4%, ${background})`;
  const overlayBg = isDark ? 'rgba(0,0,0,0.72)' : 'rgba(15,15,15,0.55)';

  // Portaled to document.body: PortfolioThemeRoot wraps the whole page in a `relative isolate`
  // container, which creates its own stacking context — no z-index inside it can ever out-rank
  // the site nav, which escapes that same box via its own createPortal(..., document.body).
  // Without this portal, z-[150] here is compared only against siblings inside the isolated
  // root, never against the nav, so the nav would keep painting above (and un-blurred by) this
  // overlay regardless of how high the z-index is set.
  return createPortal(
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center p-4 backdrop-blur-md transition-opacity duration-300 ease-out sm:p-8"
      style={{ backgroundColor: overlayBg, opacity: entered ? 1 : 0 }}
      onClick={onClose}
      role="presentation"
    >
      <div
        className={`relative flex max-h-[88vh] w-full max-w-7xl flex-col overflow-hidden ${experienceCardsBorderRadiusClass(thumbnailRadius)} ${isDark ? 'border' : 'border-0'} shadow-2xl transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] sm:flex-row`}
        style={{
          borderColor: isDark ? border : 'transparent',
          backgroundColor: cardBg,
          opacity: entered ? 1 : 0,
          transform: entered ? 'scale(1)' : 'scale(0.96)',
        }}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title ?? 'Experience details'}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 z-10 flex h-7 w-7 items-center justify-center rounded-full opacity-60 transition hover:opacity-100"
          data-pf-no-color-transition=""
          style={{ backgroundColor: `color-mix(in srgb, ${ink} 6%, transparent)`, color: ink }}
        >
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
            <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        {mediaUrl && thumbnailFit === 'contain' ? (
          <div className="relative h-56 w-full shrink-0 overflow-hidden sm:h-auto sm:w-[56%]">
            <div className="absolute inset-0 scale-125" style={{ filter: 'blur(28px) saturate(1.15)' }} aria-hidden>
              <ProductThumbnailMedia url={mediaUrl} alt="" fit="cover" className="h-full w-full" />
            </div>
            <div
              className="absolute inset-0"
              style={{ backgroundColor: isDark ? 'rgba(0,0,0,0.32)' : 'rgba(255,255,255,0.28)' }}
              aria-hidden
            />
            <div className="absolute inset-0 p-5">
              <ProductThumbnailMedia
                url={mediaUrl}
                alt={title || 'Experience'}
                fit="contain"
                className="h-full w-full drop-shadow-[0_12px_28px_rgba(0,0,0,0.35)]"
              />
            </div>
          </div>
        ) : mediaUrl ? (
          <div
            className="relative h-56 w-full shrink-0 overflow-hidden sm:h-auto sm:w-[56%]"
            style={{ backgroundColor: `color-mix(in srgb, ${accent} 12%, transparent)` }}
          >
            <ProductThumbnailMedia
              url={mediaUrl}
              alt={title || 'Experience'}
              fit="cover"
              className="absolute inset-0 h-full w-full object-top"
            />
          </div>
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col overflow-y-auto p-7 pr-8 sm:p-9 sm:pr-10">
          <GalleryDetailContent
            block={block}
            ink={ink}
            muted={muted}
            accent={accent}
            secondary={secondary}
            border={border}
            cardBg={cardBg}
            isDark={isDark}
            flags={flags}
          />
        </div>
      </div>

      {canPrev ? (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onPrev();
          }}
          aria-label="Previous"
          className="absolute left-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-white transition hover:scale-110 sm:flex"
          data-pf-no-color-transition=""
          style={{ backgroundColor: 'rgba(255,255,255,0.14)' }}
        >
          <DuotoneChevronIcon direction="left" />
        </button>
      ) : null}
      {canNext ? (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onNext();
          }}
          aria-label="Next"
          className="absolute right-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-white transition hover:scale-110 sm:flex"
          data-pf-no-color-transition=""
          style={{ backgroundColor: 'rgba(255,255,255,0.14)' }}
        >
          <DuotoneChevronIcon direction="right" />
        </button>
      ) : null}
    </div>,
    document.body
  );
}

/**
 * Sizes `textRef`'s font so its rendered box exactly fills `containerRef`'s
 * width — on mount, on any container-width change, and once web fonts
 * finish loading. Not vw-based: the same vw value maps to a different
 * rendered width depending on the word's own glyph widths, so only a
 * measure-then-scale pass can hit an exact width at any screen size or word
 * length — never overflowing, never leaving a gap.
 *
 * Measures with the *same* DOM element it then resizes (reset to a
 * reference font-size, read its real getBoundingClientRect().width, scale
 * from there) rather than a parallel canvas measurement — a canvas's font
 * resolution can silently mismatch the real element's (wrong weight, wrong
 * fallback while a webfont is still loading), which under- or over-sizes
 * the result. Measuring the live element guarantees the measurement and the
 * final render always agree.
 */
function useFitWidthTextSize(
  containerRef: RefObject<HTMLElement | null>,
  textRef: RefObject<HTMLElement | null>,
  text: string
) {
  useLayoutEffect(() => {
    const container = containerRef.current;
    const textEl = textRef.current;
    if (!container || !textEl) return undefined;

    const REFERENCE_PX = 100;

    const fit = () => {
      const targetWidth = container.getBoundingClientRect().width;
      if (targetWidth <= 0) return;

      textEl.style.removeProperty('margin-left'); // clear a stale offset from an older build
      textEl.style.fontSize = `${REFERENCE_PX}px`;
      const measuredWidth = textEl.getBoundingClientRect().width;
      if (measuredWidth <= 0) return;

      textEl.style.fontSize = `${REFERENCE_PX * (targetWidth / measuredWidth)}px`;
    };

    fit();

    let resizeTimer: ReturnType<typeof setTimeout> | undefined;
    const scheduleFit = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(fit, 100);
    };

    // A window 'resize' listener misses container-width changes that aren't
    // caused by the window itself — a dashboard preview panel resizing, a
    // sidebar collapsing, a scrollbar appearing — which is exactly what left
    // the fit stale (word not spanning the full width) in the embedded
    // preview. ResizeObserver catches every one of those directly.
    const observer = new ResizeObserver(scheduleFit);
    observer.observe(container);

    // Fonts can still be loading at first paint — re-measure once the real
    // glyph metrics are in so the fit isn't computed against a fallback font.
    let cancelled = false;
    if (typeof document !== 'undefined' && document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (!cancelled) fit();
      }).catch(() => {});
    }

    return () => {
      cancelled = true;
      observer.disconnect();
      if (resizeTimer) clearTimeout(resizeTimer);
    };
  }, [text]);
}

/** Gallery design's full-bleed outline/fill word (see {@link useFitWidthTextSize}). */
export function GalleryFitWidthTitle({
  text,
  ink,
  accent,
  isDark,
  titleStyle,
  colorMode,
}: {
  text: string;
  ink: string;
  accent: string;
  isDark: boolean;
  titleStyle: PortfolioExperienceGalleryBigTitleStyle;
  colorMode: PortfolioExperienceGalleryBigTitleColor;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const textRef = useRef<HTMLSpanElement | null>(null);
  useFitWidthTextSize(containerRef, textRef, text);

  // A flat single-tone gray stroke reads as lifeless at this size. Warming it
  // with a touch of the brand accent — plus a soft accent-tinted glow sitting
  // behind the crisp outline — gives it some depth and personality without
  // turning it into a loud filled headline. "Simple" opts back out of both,
  // for a plain tone matching the "Roles I've taken on" heading below it.
  // Light mode also needs a much stronger base tint than dark mode: the same
  // low opacity that's discreet on a dark background is nearly invisible on
  // a light one.
  const isSimple = colorMode === 'simple';
  const tintedInk = `color-mix(in srgb, ${ink} 80%, ${accent} 20%)`;
  const baseTone = colorMode === 'accent' ? accent : isSimple ? ink : tintedInk;
  const isFill = titleStyle === 'fill';
  const glowColor = `color-mix(in srgb, ${accent} 24%, transparent)`;

  const fillTone = isSimple ? baseTone : isDark ? `color-mix(in srgb, ${baseTone} 92%, transparent)` : baseTone;

  const textStyle: CSSProperties = isFill
    ? {
        color: fillTone,
        WebkitTextFillColor: fillTone,
      }
    : {
        color: 'transparent',
        WebkitTextStroke: `1.75px ${
          isSimple
            ? baseTone
            : isDark
              ? `color-mix(in srgb, ${baseTone} 28%, transparent)`
              : `color-mix(in srgb, ${baseTone} 52%, transparent)`
        }`,
        WebkitTextFillColor: 'transparent',
      };
  if (!isSimple) {
    textStyle.filter = `drop-shadow(0 0 ${isFill ? 30 : 36}px ${glowColor})`;
  }

  return (
    <div ref={containerRef} className="w-full overflow-hidden">
      <span
        ref={textRef}
        data-pf-no-color-transition=""
        aria-hidden
        className="inline-block whitespace-nowrap text-[13vw] font-black uppercase leading-none tracking-tight sm:text-[9vw]"
        style={textStyle}
      >
        {text}
      </span>
      <span className="sr-only">{text}</span>
    </div>
  );
}

export function GalleryExperienceList({
  blocks,
  presentation = DEFAULT_EXPERIENCE_PRESENTATION,
  forceSingleColumn = false,
}: {
  blocks: ProfileMediaBlock[];
  presentation?: PortfolioExperiencePresentationSettings;
  motionProfile?: PortfolioGlobalMotionProfile;
  forceSingleColumn?: boolean;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (blocks.length === 0) return null;

  const isDark = presentation.activeColorMode !== 'light';
  const colorMode = resolveExperienceColorMode(presentation);
  const styles = normalizeExperienceElementStyles(presentation.elementStyles);
  const accent = experienceAccentColor(presentation.accentColor);
  const secondary = experienceSecondaryStatusColor(presentation);
  const ink = ensureExperienceInkContrast(
    presentation.titleColor?.trim() || resolveExperienceTextColor(styles.title, colorMode),
    isDark,
    DEFAULT_EXPERIENCE_TITLE_COLOR,
    DEFAULT_EXPERIENCE_TITLE_COLOR_DARK
  );
  const muted = ensureExperienceInkContrast(
    presentation.subtitleColor?.trim() || resolveExperienceTextColor(styles.meta, colorMode),
    isDark,
    DEFAULT_EXPERIENCE_MUTED_COLOR,
    DEFAULT_EXPERIENCE_MUTED_COLOR_DARK
  );
  const border = isDark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.12)';
  const background = presentation.sectionBackgroundColor?.trim() || DEFAULT_SECTION_BACKGROUND_COLOR;

  const flags: DuotoneContentFlags = {
    showTitle: presentation.showTitle !== false,
    showPeriod: presentation.showPeriod !== false,
    showMeta: presentation.showMeta !== false,
    showDescription: presentation.showDescription !== false,
    showTasks: presentation.showTasks !== false,
    showTools: presentation.showTools !== false,
    showProof: presentation.showProof !== false,
    showEntryMedia: presentation.showEntryMedia !== false,
    tasksDisplay: presentation.tasksDisplay,
    toolsBadgeStyle: presentation.toolsBadgeStyle,
    repoLinkButtonStyle: resolveExperienceRepoLinkStyle(presentation.repoLinkButtonStyle, 'icon'),
    isDark,
  };

  const columns = presentation.galleryColumns ?? 3;
  const thumbnailFit = presentation.galleryThumbnailFit ?? 'cover';
  const thumbnailRadius = presentation.galleryThumbnailRadius ?? 'md';
  const hoverEffect = presentation.galleryHoverEffect ?? 'curtain';
  const gap = presentation.galleryGap ?? 'md';
  const gapClass: Record<PortfolioExperienceItemGap, string> = {
    sm: 'gap-4 sm:gap-5',
    md: 'gap-6 sm:gap-8',
    lg: 'gap-8 sm:gap-10',
    xl: 'gap-10 sm:gap-14',
  };
  const gridClass = forceSingleColumn
    ? `grid grid-cols-1 ${gapClass[gap]}`
    : columns === 2
      ? `grid grid-cols-1 sm:grid-cols-2 ${gapClass[gap]}`
      : `grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 ${gapClass[gap]}`;

  return (
    <>
      <div
        className={experienceListShellClass(
          forceSingleColumn ? 'full' : presentation.listMaxWidth,
          forceSingleColumn ? 'left' : presentation.listPlacement
        )}
      >
        <div className={gridClass}>
          {blocks.map((block, index) => (
            <div key={block.id} className="h-full">
              <GalleryExperienceCard
                block={block}
                accent={accent}
                secondaryColor={secondary}
                titleColor={ink}
                mutedColor={muted}
                border={border}
                isDark={isDark}
                flags={flags}
                thumbnailFit={thumbnailFit}
                thumbnailRadius={thumbnailRadius}
                hoverEffect={hoverEffect}
                onOpen={() => setOpenIndex(index)}
              />
            </div>
          ))}
        </div>
      </div>

      {openIndex !== null ? (
        <GalleryExperienceModal
          block={blocks[openIndex]}
          ink={ink}
          muted={muted}
          accent={accent}
          secondary={secondary}
          border={border}
          background={background}
          isDark={isDark}
          flags={flags}
          thumbnailFit={thumbnailFit}
          thumbnailRadius={thumbnailRadius}
          onClose={() => setOpenIndex(null)}
          onPrev={() => setOpenIndex((current) => (current !== null && current > 0 ? current - 1 : current))}
          onNext={() =>
            setOpenIndex((current) => (current !== null && current < blocks.length - 1 ? current + 1 : current))
          }
          canPrev={openIndex > 0}
          canNext={openIndex < blocks.length - 1}
        />
      ) : null}
    </>
  );
}

/** Fills a Loft card with its thumbnail — cover or the glassmorphism treatment. */
function LoftCardMedia({
  mediaUrl,
  thumbnailFit,
  isDark,
  accent,
  title,
  initial,
}: {
  mediaUrl: string;
  thumbnailFit: PortfolioExperienceLoftThumbnailFit;
  isDark: boolean;
  accent: string;
  title: string;
  initial: string;
}) {
  if (mediaUrl && thumbnailFit === 'glass') {
    return (
      <>
        <div className="absolute inset-0 scale-125" style={{ filter: 'blur(24px) saturate(1.15)' }} aria-hidden>
          <ProductThumbnailMedia url={mediaUrl} alt="" fit="cover" className="h-full w-full" />
        </div>
        <div
          className="absolute inset-0"
          style={{ backgroundColor: isDark ? 'rgba(0,0,0,0.32)' : 'rgba(255,255,255,0.28)' }}
          aria-hidden
        />
        <div className="absolute inset-0 p-6">
          <ProductThumbnailMedia
            url={mediaUrl}
            alt={title || 'Experience'}
            fit="contain"
            className="h-full w-full drop-shadow-[0_8px_20px_rgba(0,0,0,0.3)]"
          />
        </div>
      </>
    );
  }
  if (mediaUrl) {
    return <ProductThumbnailMedia url={mediaUrl} alt={title || 'Experience'} fit="cover" className="h-full w-full" />;
  }
  return (
    <div
      className="flex h-full w-full items-center justify-center text-[3rem] font-semibold"
      style={{ color: `color-mix(in srgb, ${accent} 55%, transparent)` }}
      aria-hidden
    >
      {initial}
    </div>
  );
}

/** One Loft grid card: thumbnail and title only, click to open the full
 * detail modal — everything else lives there instead of on the card. */
function LoftCard({
  block,
  ink,
  accent,
  isDark,
  flags,
  thumbnailFit,
  thumbnailRadius,
  hoverEffect,
  onOpen,
}: {
  block: ProfileMediaBlock;
  ink: string;
  accent: string;
  isDark: boolean;
  flags: DuotoneContentFlags;
  thumbnailFit: PortfolioExperienceLoftThumbnailFit;
  thumbnailRadius: PortfolioExperienceLoftThumbnailRadius;
  hoverEffect: PortfolioExperienceLoftHoverEffect;
  onOpen: () => void;
}) {
  const { title, organization } = resolveExperienceContent(block);
  const mediaUrl = flags.showEntryMedia && typeof block.mediaUrl === 'string' ? block.mediaUrl.trim() : '';
  const initial = (title || organization || '•').trim().charAt(0).toUpperCase();
  const rimColor = isDark ? 'rgba(255,255,255,0.38)' : 'rgba(0,0,0,0.22)';
  const veilColor = isDark ? 'rgba(0,0,0,0.34)' : 'rgba(0,0,0,0.16)';

  return (
    <button
      type="button"
      onClick={onOpen}
      data-pf-no-color-transition=""
      className={`pf-loft-card pf-loft-hover-${hoverEffect} flex w-full flex-col text-left`}
      style={
        {
          ['--loft-glow' as string]: `color-mix(in srgb, ${accent} 32%, transparent)`,
          ['--loft-rim' as string]: rimColor,
          ['--loft-veil' as string]: veilColor,
        } as CSSProperties
      }
    >
      {flags.showEntryMedia ? (
        <div
          data-pf-no-color-transition=""
          className={`pf-loft-card-thumb relative w-full overflow-hidden ${experienceLoftThumbnailRadiusClass(thumbnailRadius)} ${thumbnailFit === 'glass' ? 'aspect-[3/2]' : 'aspect-[4/3]'}`}
          style={{ backgroundColor: `color-mix(in srgb, ${accent} 12%, transparent)` }}
        >
          <div data-pf-no-color-transition="" className="pf-loft-card-media absolute inset-0">
            <LoftCardMedia
              mediaUrl={mediaUrl}
              thumbnailFit={thumbnailFit}
              isDark={isDark}
              accent={accent}
              title={title ?? ''}
              initial={initial}
            />
          </div>

          {hoverEffect === 'curtain' ? (
            <>
              <div
                data-pf-no-color-transition=""
                className="pf-loft-curtain-veil pointer-events-none absolute inset-0"
                aria-hidden
              />
              <div
                data-pf-no-color-transition=""
                className="pf-loft-curtain-glow pointer-events-none absolute inset-0"
                aria-hidden
              />
            </>
          ) : null}

          {hoverEffect === 'magnetic' ? (
            <div
              data-pf-no-color-transition=""
              className="pf-loft-magnetic-cue pointer-events-none absolute inset-0 flex items-center justify-center"
              aria-hidden
            >
              <span
                data-pf-no-color-transition=""
                className="pf-loft-magnetic-pill rounded-full px-3.5 py-1.5 font-mono text-[0.68rem] font-medium uppercase tracking-[0.14em]"
                style={{
                  color: isDark ? 'rgba(255,255,255,0.92)' : 'rgba(0,0,0,0.88)',
                  backgroundColor: isDark ? 'rgba(0,0,0,0.22)' : 'rgba(255,255,255,0.4)',
                }}
              >
                [ View case ↗ ]
              </span>
            </div>
          ) : null}
        </div>
      ) : null}
      {flags.showTitle && title ? (
        <p
          data-pf-no-color-transition=""
          className="pf-loft-card-title mt-4 text-left text-[0.98rem] font-semibold leading-snug"
          style={{ color: ink }}
        >
          {title}
        </p>
      ) : null}
    </button>
  );
}

/** Full detail view for a Loft card, opened on click — premium split layout:
 * the thumbnail anchors the left; identity and story flow on the right, sealed
 * by stack + proof link. Escapes PortfolioThemeRoot's `isolate` wrapper via a
 * body portal — without it, no z-index here could ever out-rank the site nav. */
function LoftExperienceModal({
  block,
  ink,
  muted,
  secondary,
  bodyColor,
  accent,
  border,
  background,
  isDark,
  flags,
  onClose,
}: {
  block: ProfileMediaBlock;
  ink: string;
  muted: string;
  secondary: string;
  bodyColor: string;
  accent: string;
  border: string;
  background: string;
  isDark: boolean;
  flags: DuotoneContentFlags;
  onClose: () => void;
}) {
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    const id = window.requestAnimationFrame(() => setEntered(true));
    return () => window.cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  const { period, title, organization, description, status, tasks, tools, links, location, employmentType } =
    resolveExperienceContent(block);
  const metaLine = [organization, location, employmentTypeLabel(employmentType) || null]
    .filter((part): part is string => Boolean(part))
    .join('  ·  ');
  const combinedMeta = [flags.showPeriod ? period : null, flags.showMeta ? metaLine : null]
    .filter((part): part is string => Boolean(part))
    .join('  ·  ');
  const mediaUrl = flags.showEntryMedia && typeof block.mediaUrl === 'string' ? block.mediaUrl.trim() : '';
  const repoLink = flags.showProof ? (links[0] ?? null) : null;
  const displayTasks = flags.showTasks ? tasks : [];
  const displayTools = flags.showTools ? tools : [];
  const initial = (title || organization || '•').trim().charAt(0).toUpperCase();
  const cardBg = `color-mix(in srgb, ${ink} 4%, ${background})`;
  const overlayBg = isDark ? 'rgba(0,0,0,0.72)' : 'rgba(15,15,15,0.55)';
  const showStatus = flags.showMeta && (status === 'ONGOING' || status === 'FINISHED');

  return createPortal(
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center py-3 backdrop-blur-md transition-opacity duration-300 ease-out sm:py-6"
      style={{ backgroundColor: overlayBg, opacity: entered ? 1 : 0 }}
      onClick={onClose}
      role="presentation"
    >
      <div
        className={`relative flex h-full w-full flex-col overflow-hidden rounded-none ${isDark ? 'border' : 'border-0'} shadow-2xl transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]`}
        style={{
          borderColor: isDark ? border : 'transparent',
          backgroundColor: cardBg,
          maxHeight: '94vh',
          opacity: entered ? 1 : 0,
          transform: entered ? 'scale(1)' : 'scale(0.96)',
        }}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title ?? 'Experience details'}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full opacity-70 transition hover:opacity-100 sm:right-6 sm:top-6"
          data-pf-no-color-transition=""
          style={{ backgroundColor: `color-mix(in srgb, ${ink} 8%, transparent)`, color: ink }}
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden>
            <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto grid min-h-full w-full grid-cols-1 items-center gap-10 px-6 py-10 sm:gap-12 sm:px-10 sm:py-12 lg:grid-cols-12 lg:gap-14 lg:px-14 lg:py-16 xl:gap-16 xl:px-16">
            {flags.showEntryMedia ? (
              <div className="relative w-full lg:col-span-6">
                <div
                  className="pf-loft-modal-thumb relative w-full overflow-hidden rounded-2xl"
                  style={{
                    aspectRatio: '4 / 3',
                    backgroundColor: `color-mix(in srgb, ${accent} 8%, transparent)`,
                  }}
                >
                  <div className="pf-loft-modal-thumb-media h-full w-full">
                    {mediaUrl ? (
                      <ProductThumbnailMedia
                        url={mediaUrl}
                        alt={title || 'Experience'}
                        fit="cover"
                        className="h-full w-full"
                      />
                    ) : (
                      <div
                        className="flex h-full w-full items-center justify-center text-[4.5rem] font-semibold"
                        style={{ color: `color-mix(in srgb, ${accent} 55%, transparent)` }}
                        aria-hidden
                      >
                        {initial}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : null}

            <div
              className={`flex min-h-0 flex-col justify-center ${
                flags.showEntryMedia ? 'lg:col-span-6' : 'lg:col-span-12 lg:max-w-2xl'
              }`}
            >
              {showStatus ? (
                <div className="mb-5 sm:mb-6">
                  <ExperienceEditorialOngoingBadge
                    status={status}
                    isDark={isDark}
                    accentColor={accent}
                    secondaryColor={secondary}
                  />
                </div>
              ) : null}

              {flags.showTitle && title ? (
                <h2
                  className="max-w-[22ch] font-serif text-[clamp(1.85rem,3.4vw,3.05rem)] font-medium leading-[1.12] tracking-[-0.03em]"
                  style={{ color: ink, fontFamily: SERIF }}
                >
                  {title}
                </h2>
              ) : null}

              {combinedMeta ? (
                <p
                  className={`text-[0.92rem] tracking-[0.02em] sm:text-[1rem] ${flags.showTitle && title ? 'mt-5 sm:mt-6' : ''}`}
                  style={{ color: muted }}
                >
                  {combinedMeta}
                </p>
              ) : null}

              {flags.showDescription && description ? (
                <p
                  className={`max-w-xl text-[1.02rem] leading-[1.75] sm:text-[1.08rem] ${
                    combinedMeta || (flags.showTitle && title) || showStatus ? 'mt-8 sm:mt-10' : ''
                  }`}
                  style={{ color: bodyColor }}
                >
                  {description}
                </p>
              ) : null}

              {displayTasks.length > 0 ? (
                <div
                  className={`max-w-xl ${
                    flags.showDescription && description ? 'mt-8 sm:mt-9' : 'mt-8 sm:mt-10'
                  }`}
                >
                  <ExperienceTasksDisplay
                    tasks={displayTasks}
                    display={flags.tasksDisplay}
                    bodyColor={bodyColor}
                    mutedColor={muted}
                    isDark={isDark}
                    label=""
                    size="lg"
                    tools={displayTools}
                  />
                </div>
              ) : null}

              {displayTools.length > 0 || repoLink ? (
                <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4 sm:mt-12">
                  {displayTools.length > 0 ? (
                    <div className="min-w-0 flex-1">
                      <ExperienceToolsDisplay
                        tools={displayTools}
                        style={flags.toolsBadgeStyle}
                        ink={ink}
                        muted={muted}
                        background={background}
                        isDark={isDark}
                        size="sm"
                      />
                    </div>
                  ) : null}
                  {repoLink ? (
                    <div className="shrink-0">
                      <PortfolioLinkButton
                        variant={flags.repoLinkButtonStyle}
                        href={repoLink.url}
                        label={repoLink.label || 'View repository'}
                        palette={{ background: cardBg, ink, muted, accent, border }}
                      />
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export function LoftExperienceList({
  blocks,
  presentation = DEFAULT_EXPERIENCE_PRESENTATION,
  forceSingleColumn = false,
}: {
  blocks: ProfileMediaBlock[];
  presentation?: PortfolioExperiencePresentationSettings;
  motionProfile?: PortfolioGlobalMotionProfile;
  forceSingleColumn?: boolean;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (blocks.length === 0) return null;

  const isDark = presentation.activeColorMode !== 'light';
  const colorMode = resolveExperienceColorMode(presentation);
  const styles = normalizeExperienceElementStyles(presentation.elementStyles);
  const accent = experienceAccentColor(presentation.accentColor);
  const secondary = experienceSecondaryStatusColor(presentation);
  const ink = ensureExperienceInkContrast(
    presentation.titleColor?.trim() || resolveExperienceTextColor(styles.title, colorMode),
    isDark,
    DEFAULT_EXPERIENCE_TITLE_COLOR,
    DEFAULT_EXPERIENCE_TITLE_COLOR_DARK
  );
  const muted = ensureExperienceInkContrast(
    presentation.subtitleColor?.trim() || resolveExperienceTextColor(styles.meta, colorMode),
    isDark,
    DEFAULT_EXPERIENCE_MUTED_COLOR,
    DEFAULT_EXPERIENCE_MUTED_COLOR_DARK
  );
  const bodyColor = ensureExperienceInkContrast(
    resolveExperienceTextColor(styles.tasks, colorMode) || resolveExperienceTextColor(styles.description, colorMode),
    isDark,
    DEFAULT_EXPERIENCE_BODY_COLOR,
    DEFAULT_EXPERIENCE_BODY_COLOR_DARK
  );
  const border = isDark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.12)';
  const background = presentation.sectionBackgroundColor?.trim() || DEFAULT_SECTION_BACKGROUND_COLOR;

  const flags: DuotoneContentFlags = {
    showTitle: presentation.showTitle !== false,
    showPeriod: presentation.showPeriod !== false,
    showMeta: presentation.showMeta !== false,
    showDescription: presentation.showDescription !== false,
    showTasks: presentation.showTasks !== false,
    showTools: presentation.showTools !== false,
    showProof: presentation.showProof !== false,
    showEntryMedia: presentation.showEntryMedia !== false,
    tasksDisplay: presentation.tasksDisplay,
    toolsBadgeStyle: presentation.toolsBadgeStyle,
    repoLinkButtonStyle: resolveExperienceRepoLinkStyle(presentation.repoLinkButtonStyle, 'icon'),
    isDark,
  };

  const thumbnailFit = presentation.loftThumbnailFit ?? 'cover';
  const thumbnailRadius = presentation.loftThumbnailRadius ?? 'md';
  const hoverEffect = presentation.loftHoverEffect ?? 'curtain';
  const columns = presentation.loftColumns ?? 3;
  const columnsClass: Record<PortfolioExperienceLoftColumns, string> = {
    2: 'xl:grid-cols-2',
    3: 'xl:grid-cols-3',
    4: 'xl:grid-cols-4',
  };
  const gap = presentation.loftGap ?? 'md';
  const gapClass: Record<PortfolioExperienceItemGap, string> = {
    sm: 'gap-4 sm:gap-5',
    md: 'gap-6 sm:gap-8',
    lg: 'gap-8 sm:gap-10',
    xl: 'gap-10 sm:gap-14',
  };

  return (
    <>
      <div
        className={experienceListShellClass(
          forceSingleColumn ? 'full' : presentation.listMaxWidth,
          forceSingleColumn ? 'left' : presentation.listPlacement
        )}
      >
        <div
          className={
            forceSingleColumn
              ? `grid grid-cols-1 ${gapClass[gap]}`
              : `grid grid-cols-1 sm:grid-cols-2 ${gapClass[gap]} ${columnsClass[columns]}`
          }
        >
          {blocks.map((block, index) => (
            <LoftCard
              key={block.id}
              block={block}
              ink={ink}
              accent={accent}
              isDark={isDark}
              flags={flags}
              thumbnailFit={thumbnailFit}
              thumbnailRadius={thumbnailRadius}
              hoverEffect={hoverEffect}
              onOpen={() => setOpenIndex(index)}
            />
          ))}
        </div>
      </div>

      {openIndex !== null ? (
        <LoftExperienceModal
          block={blocks[openIndex]}
          ink={ink}
          muted={muted}
          secondary={secondary}
          bodyColor={bodyColor}
          accent={accent}
          border={border}
          background={background}
          isDark={isDark}
          flags={flags}
          onClose={() => setOpenIndex(null)}
        />
      ) : null}
    </>
  );
}

/** Press design — one newsroom-style row: thumbnail, then a label / date line, then the
 * title, at rest. Hovering the thumbnail itself — not the row — reveals the description,
 * tasks, and stack around it, and widens the thumbnail, the way Webflow / Landbook-style
 * showcase rows do. */
function PressExperienceRow({
  block,
  ink,
  muted,
  bodyColor,
  accent,
  background,
  flags,
  thumbnailRadius,
}: {
  block: ProfileMediaBlock;
  ink: string;
  muted: string;
  bodyColor: string;
  accent: string;
  background: string;
  flags: DuotoneContentFlags;
  thumbnailRadius: PortfolioExperienceCardsBorderRadius;
}) {
  const { period, title, organization, description, tasks, tools, links } = resolveExperienceContent(block);
  const mediaUrl = flags.showEntryMedia && typeof block.mediaUrl === 'string' ? block.mediaUrl.trim() : '';
  const initial = (title || organization || '•').trim().charAt(0).toUpperCase();
  const label = flags.showMeta ? organization : null;
  const date = flags.showPeriod ? period : null;
  const displayDescription = flags.showDescription ? description : null;
  const displayTasks = flags.showTasks ? tasks.slice(0, 3) : [];
  const displayTools = flags.showTools ? tools : [];
  const repoLink = flags.showProof ? (links[0] ?? null) : null;
  const hasReveal = Boolean(displayDescription) || displayTasks.length > 0;

  const thumbnailRadiusClass = experienceCardsBorderRadiusClass(thumbnailRadius);
  const thumbnail = (
    <div
      data-pf-no-color-transition=""
      className={`pf-press-thumb relative aspect-square w-72 shrink-0 overflow-hidden sm:w-80 lg:w-96 ${thumbnailRadiusClass}`}
      style={{ backgroundColor: `color-mix(in srgb, ${accent} 12%, transparent)` }}
    >
      {mediaUrl ? (
        <ProductThumbnailMedia
          url={mediaUrl}
          alt={title || 'Experience'}
          fit="cover"
          className="h-full w-full"
        />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center text-[4.75rem] font-semibold"
          style={{ color: `color-mix(in srgb, ${accent} 55%, transparent)` }}
          aria-hidden
        >
          {initial}
        </div>
      )}
    </div>
  );

  const media = flags.showEntryMedia ? (
    repoLink ? (
      <a
        href={repoLink.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={repoLink.label || title || 'Open link'}
        className={`block shrink-0 ${thumbnailRadiusClass}`}
      >
        {thumbnail}
      </a>
    ) : (
      thumbnail
    )
  ) : null;

  return (
    <div className="pf-press-row flex items-stretch gap-5 sm:gap-7">
      {media}

      <div className="flex min-w-0 flex-1 flex-col pt-0.5">
        {label || date ? (
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            {label ? (
              <span
                className="text-[0.72rem] font-bold uppercase tracking-[0.08em]"
                style={{ color: ink }}
              >
                {label}
              </span>
            ) : null}
            {date ? (
              <span className="text-[0.72rem] uppercase tracking-[0.04em]" style={{ color: muted }}>
                {date}
              </span>
            ) : null}
          </div>
        ) : null}
        {flags.showTitle && title ? (
          <p
            className="mt-3 text-[1.15rem] font-semibold leading-snug sm:text-[1.3rem]"
            style={{ color: ink }}
          >
            {title}
          </p>
        ) : null}

        {hasReveal ? (
          <div data-pf-no-color-transition="" className="pf-press-reveal">
            <div className="overflow-hidden">
              {displayDescription ? (
                <p
                  className="mt-8 max-w-xl text-[0.95rem] leading-relaxed"
                  style={{ color: bodyColor }}
                >
                  {displayDescription}
                </p>
              ) : null}

              {displayTasks.length > 0 ? (
                <div className="mt-8">
                  <ExperienceTasksDisplay
                    tasks={displayTasks}
                    display={flags.tasksDisplay}
                    bodyColor={bodyColor}
                    mutedColor={muted}
                    isDark={flags.isDark}
                    label=""
                    size="md"
                    tools={displayTools}
                  />
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        {displayTools.length > 0 ? (
          <div data-pf-no-color-transition="" className="pf-press-stack mt-auto hidden pt-8 lg:block">
            <ExperienceToolsDisplay
              tools={displayTools}
              style={flags.toolsBadgeStyle}
              ink={ink}
              muted={muted}
              background={background}
              isDark={flags.isDark}
              size="sm"
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function PressExperienceList({
  blocks,
  presentation = DEFAULT_EXPERIENCE_PRESENTATION,
  forceSingleColumn = false,
}: {
  blocks: ProfileMediaBlock[];
  presentation?: PortfolioExperiencePresentationSettings;
  motionProfile?: PortfolioGlobalMotionProfile;
  forceSingleColumn?: boolean;
}) {
  if (blocks.length === 0) return null;

  const isDark = presentation.activeColorMode !== 'light';
  const colorMode = resolveExperienceColorMode(presentation);
  const styles = normalizeExperienceElementStyles(presentation.elementStyles);
  const accent = experienceAccentColor(presentation.accentColor);
  const ink = ensureExperienceInkContrast(
    presentation.titleColor?.trim() || resolveExperienceTextColor(styles.title, colorMode),
    isDark,
    DEFAULT_EXPERIENCE_TITLE_COLOR,
    DEFAULT_EXPERIENCE_TITLE_COLOR_DARK
  );
  const muted = ensureExperienceInkContrast(
    presentation.subtitleColor?.trim() || resolveExperienceTextColor(styles.meta, colorMode),
    isDark,
    DEFAULT_EXPERIENCE_MUTED_COLOR,
    DEFAULT_EXPERIENCE_MUTED_COLOR_DARK
  );
  const bodyColor = ensureExperienceInkContrast(
    resolveExperienceTextColor(styles.tasks, colorMode) || resolveExperienceTextColor(styles.description, colorMode),
    isDark,
    DEFAULT_EXPERIENCE_BODY_COLOR,
    DEFAULT_EXPERIENCE_BODY_COLOR_DARK
  );
  const border = isDark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.12)';
  const background = presentation.sectionBackgroundColor?.trim() || DEFAULT_SECTION_BACKGROUND_COLOR;

  const flags: DuotoneContentFlags = {
    showTitle: presentation.showTitle !== false,
    showPeriod: presentation.showPeriod !== false,
    showMeta: presentation.showMeta !== false,
    showDescription: presentation.showDescription !== false,
    showTasks: presentation.showTasks !== false,
    showTools: presentation.showTools !== false,
    showProof: presentation.showProof !== false,
    showEntryMedia: presentation.showEntryMedia !== false,
    tasksDisplay: presentation.tasksDisplay,
    toolsBadgeStyle: presentation.toolsBadgeStyle,
    repoLinkButtonStyle: resolveExperienceRepoLinkStyle(presentation.repoLinkButtonStyle, 'icon'),
    isDark,
  };

  const thumbnailRadius = presentation.pressThumbnailRadius ?? 'md';
  return (
    <div
      className={experienceListShellClass(
        forceSingleColumn ? 'full' : presentation.listMaxWidth,
        forceSingleColumn ? 'left' : presentation.listPlacement
      )}
    >
      <div className="h-px w-full" style={{ backgroundColor: border }} aria-hidden />

      <div className="mt-10 grid grid-cols-1 gap-10 sm:mt-14">
        <div className="space-y-12 sm:space-y-16">
          {blocks.map((block) => (
            <PressExperienceRow
              key={block.id}
              block={block}
              ink={ink}
              muted={muted}
              bodyColor={bodyColor}
              accent={accent}
              background={background}
              flags={flags}
              thumbnailRadius={thumbnailRadius}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/** Legacy design: small bracketed pill — the hero kicker and each card's category badge. */
function LegacyPillBadge({ text, accent }: { text: string; accent: string }) {
  if (!text.trim()) return null;
  return (
    <span
      className="inline-flex items-center rounded-full border px-4 py-1.5 font-mono text-xs font-bold uppercase tracking-widest"
      style={{
        borderColor: `color-mix(in srgb, ${accent} 28%, transparent)`,
        backgroundColor: `color-mix(in srgb, ${accent} 10%, transparent)`,
        color: accent,
      }}
    >
      [ {text} ]
    </span>
  );
}

/** Legacy design — floating status pill that trails the pointer with organic lag (lerp
 * toward the tracked mouse position every frame) while hovering the thumbnail, instead of
 * a rigid, instantly-snapping native cursor. Portaled to <body> so it isn't clipped by the
 * thumbnail's own overflow-hidden or repositioned by an ancestor's transform (the zoom
 * effect included). `anchor` is the hover-entry point — seeds the first frame so the pill
 * appears right under the pointer instead of flying in from wherever it last was. */
function LegacyStatusCursor({
  label,
  anchor,
  accent,
  containerRef,
  onDismiss,
}: {
  label: 'FINISHED' | 'ONGOING';
  anchor: { x: number; y: number } | null;
  accent: string;
  /** The thumbnail element, so every frame can re-check the pointer is still actually over
   * it — scrolling the page under a still pointer fires no mouseleave at all, which used to
   * leave this pill stuck tracking the mouse anywhere on the page. */
  containerRef: RefObject<HTMLDivElement | null>;
  onDismiss: () => void;
}) {
  const elRef = useRef<HTMLDivElement>(null);
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  const rafId = useRef<number | null>(null);
  // Client-only mount flag without setState-in-effect (the value never changes once true, so
  // an external store with a no-op subscribe is enough — getServerSnapshot keeps SSR/hydration
  // false, then the client re-render picks up true).
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!anchor) return;
    target.current = anchor;
    current.current = anchor;
    if (elRef.current) {
      elRef.current.style.transform = `translate3d(${anchor.x}px, ${anchor.y}px, 0) translate(-50%, -50%)`;
    }

    const handleMove = (event: MouseEvent) => {
      target.current = { x: event.clientX, y: event.clientY };
    };
    window.addEventListener('mousemove', handleMove);

    // Reduced motion: track the pointer 1:1, no organic lag.
    const lerpFactor = reduceMotion ? 1 : 0.18;
    const tick = () => {
      // Self-correcting: re-check the pointer is still actually over the thumbnail every
      // frame, independent of whether mouseleave fired. Scrolling the page under a
      // stationary pointer moves the thumbnail out from under it without ever dispatching
      // a mouse event, which used to leave this pill stuck, silently tracking the pointer
      // wherever it happened to be on the rest of the page.
      const rect = containerRef.current?.getBoundingClientRect();
      const stillInside =
        rect &&
        target.current.x >= rect.left &&
        target.current.x <= rect.right &&
        target.current.y >= rect.top &&
        target.current.y <= rect.bottom;
      if (!stillInside) {
        onDismiss();
        return;
      }

      current.current = {
        x: current.current.x + (target.current.x - current.current.x) * lerpFactor,
        y: current.current.y + (target.current.y - current.current.y) * lerpFactor,
      };
      if (elRef.current) {
        elRef.current.style.transform = `translate3d(${current.current.x}px, ${current.current.y}px, 0) translate(-50%, -50%)`;
      }
      rafId.current = requestAnimationFrame(tick);
    };
    rafId.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [anchor, reduceMotion, containerRef, onDismiss]);

  if (!mounted) return null;

  const isFinished = label === 'FINISHED';

  return createPortal(
    <div
      ref={elRef}
      aria-hidden="true"
      data-pf-no-color-transition=""
      className="pointer-events-none fixed left-0 top-0 z-[999] transition-opacity duration-200 ease-out"
      style={{ opacity: anchor ? 1 : 0 }}
    >
      <div
        className="flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 font-medium uppercase"
        style={{
          backgroundColor: isFinished ? 'rgba(255,255,255,0.92)' : 'rgba(8,8,10,0.92)',
          border: `1px solid ${isFinished ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.14)'}`,
          color: isFinished ? '#161616' : '#ffffff',
          fontSize: '0.72rem',
          letterSpacing: '0.14em',
          fontFamily: REEL_SANS,
        }}
      >
        {!isFinished ? (
          <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: accent }} aria-hidden />
        ) : null}
        {label}
      </div>
    </div>,
    document.body
  );
}

/** Legacy design — one feature block: image, category pill, title, description,
 * a pill-plus-circle CTA button, then a footer meta row (status left,
 * period / organization right). Alternates image side every other entry. */
function LegacyExperienceCard({
  block,
  index,
  ink,
  muted,
  faint,
  accent,
  secondary,
  border,
  background,
  isLast,
  flags,
  thumbnailRadius,
  thumbnailHeight,
  thumbnailWidth,
  itemGap,
  alternateSides,
  fixedSide,
  showTasksLegacy,
}: {
  block: ProfileMediaBlock;
  index: number;
  ink: string;
  muted: string;
  /** texteFaint tier — the quietest of the palette's text tokens, used for the description. */
  faint: string;
  accent: string;
  secondary: string;
  border: string;
  background: string;
  isLast: boolean;
  flags: DuotoneContentFlags;
  thumbnailRadius: PortfolioExperienceCardsBorderRadius;
  thumbnailHeight: PortfolioExperienceLegacyThumbnailHeight;
  thumbnailWidth: PortfolioExperienceLegacyThumbnailWidth;
  itemGap: PortfolioExperienceLegacyItemGap;
  alternateSides: boolean;
  fixedSide: PortfolioExperienceLegacySide;
  /** Off by default for this design, unlike every other design's task list. */
  showTasksLegacy: boolean;
}) {
  const { period, title, organization, description, status, links, tasks, tools } = resolveExperienceContent(block);
  const mediaUrl = flags.showEntryMedia && typeof block.mediaUrl === 'string' ? block.mediaUrl.trim() : '';
  const initial = (title || organization || '•').trim().charAt(0).toUpperCase();
  const repoLink = flags.showProof ? (links[0] ?? null) : null;
  const badgeText = flags.showMeta ? organization || '' : '';
  const reverse = alternateSides ? index % 2 === 1 : fixedSide === 'right';
  const hoverTasks = flags.showTasks && showTasksLegacy ? tasks.slice(0, 5) : [];
  const stackTools = flags.showTools ? tools : [];
  const statusLabel = status === 'ONGOING' ? 'Ongoing' : status === 'FINISHED' ? 'Completed' : null;
  const statusColor = status === 'ONGOING' ? accent : secondary;
  const showFooter = flags.showMeta && Boolean(statusLabel || period || badgeText);
  // A native CSS `cursor: url(...)` can't lag behind the pointer — it's a static image the
  // OS/browser snaps to the mouse position instantly, with no way to hook a requestAnimationFrame
  // loop into it. The floaty, liquid-inertia pointer Awwwards sites do needs a real DOM element
  // instead: hide the native cursor over the thumbnail and portal a custom pill that lerps
  // toward the tracked mouse position every frame. See LegacyStatusCursor below.
  const statusCursorLabel: 'FINISHED' | 'ONGOING' | null =
    status === 'FINISHED' ? 'FINISHED' : status === 'ONGOING' ? 'ONGOING' : null;
  const [cursorAnchor, setCursorAnchor] = useState<{ x: number; y: number } | null>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const dismissCursor = useCallback(() => setCursorAnchor(null), []);

  return (
    <div className={!isLast ? experienceLegacyItemGapClass(itemGap) : ''}>
      {/* gap-8/14 (tighter than the old gap-10/16) plus the ambient glow below: together they
          break the hard pixel-straight seam between the two columns instead of a clean,
          hermetic split down the middle. */}
      <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-14">
        {flags.showEntryMedia ? (
          <div className={`group relative ${reverse ? 'lg:order-2' : ''}`}>
            {/* Soft ambient bleed: extends past the thumbnail's own edges into the gutter,
                so the boundary between the two columns reads as a glow, not a hard line. */}
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-8 -z-10 hidden blur-3xl lg:block"
              style={{
                background: `radial-gradient(closest-side, color-mix(in srgb, ${accent} 45%, transparent), transparent 72%)`,
                opacity: 0.5,
              }}
            />
            <div
              ref={thumbRef}
              className={`relative w-full overflow-hidden ${experienceCardsBorderRadiusClass(
                thumbnailRadius
              )}`}
              style={{
                aspectRatio: experienceLegacyThumbnailAspectRatio(thumbnailHeight),
                maxWidth: experienceLegacyThumbnailMaxWidth(thumbnailWidth),
                marginLeft: 'auto',
                marginRight: 'auto',
                backgroundColor: `color-mix(in srgb, ${accent} 10%, transparent)`,
                cursor: statusCursorLabel ? 'none' : undefined,
              }}
              onMouseEnter={
                statusCursorLabel
                  ? (event) => setCursorAnchor({ x: event.clientX, y: event.clientY })
                  : undefined
              }
              onMouseLeave={statusCursorLabel ? dismissCursor : undefined}
            >
              {mediaUrl ? (
                // Zoom applied to this wrapper, not to ProductThumbnailMedia's own <img> —
                // that component can't take the data-pf-no-color-transition opt-out (it
                // doesn't forward arbitrary props), so the theme's global color-transition
                // rule (very high specificity, targets *) was silently stripping our
                // transition-property down to color-only and killing the transform
                // animation entirely — the "zoom" was really just an instant jump.
                <div className="pf-legacy-thumb-zoom h-full w-full" data-pf-no-color-transition="">
                  <ProductThumbnailMedia url={mediaUrl} alt={title || 'Experience'} fit="cover" className="h-full w-full" />
                </div>
              ) : (
                <div
                  className="flex h-full w-full items-center justify-center font-semibold"
                  style={{ fontSize: '5rem', color: `color-mix(in srgb, ${accent} 55%, transparent)` }}
                  aria-hidden
                >
                  {initial}
                </div>
              )}
            </div>
          </div>
        ) : null}

        {statusCursorLabel ? (
          <LegacyStatusCursor
            label={statusCursorLabel}
            anchor={cursorAnchor}
            accent={accent}
            containerRef={thumbRef}
            onDismiss={dismissCursor}
          />
        ) : null}

        <div className={`min-w-0 ${reverse ? 'lg:order-1' : ''}`}>
          {badgeText ? (
            <div className="mb-5">
              <LegacyPillBadge text={badgeText} accent={accent} />
            </div>
          ) : null}

          {flags.showTitle && title ? (
            <h3
              className="font-normal tracking-tight"
              style={{ color: ink, fontSize: 'clamp(3rem, 6vw, 4.5rem)', lineHeight: 1.05 }}
            >
              {title}
            </h3>
          ) : null}

          {(flags.showDescription && description) || stackTools.length > 0 || hoverTasks.length > 0 || repoLink ? (
            <div className="mt-12 space-y-12 sm:space-y-16">
              {flags.showDescription && description ? (
                // Wider measure + looser leading: shorter, airier block instead of a dense
                // uniform slab, and it fills more of the space toward the middle.
                <p className="max-w-xl text-lg leading-loose" style={{ color: faint, opacity: 0.82 }}>
                  {description}
                </p>
              ) : null}

              {stackTools.length > 0 ? (
                <ExperienceToolsDisplay
                  tools={stackTools}
                  style={flags.toolsBadgeStyle}
                  ink={ink}
                  muted={muted}
                  background={background}
                  isDark={flags.isDark}
                  size="sm"
                />
              ) : null}

              {hoverTasks.length > 0 ? (
                <div
                  className="border-t pt-6"
                  style={{ borderColor: `color-mix(in srgb, ${ink} 5%, transparent)` }}
                >
                  <div
                    className="space-y-3"
                    style={{
                      ['--pf-legacy-muted' as string]: muted,
                      ['--pf-legacy-accent' as string]: accent,
                    }}
                  >
                    {hoverTasks.map((task, taskIndex) => (
                      <div
                        key={taskIndex}
                        data-pf-no-color-transition=""
                        className="pf-legacy-task-row flex items-baseline gap-4"
                      >
                        <span className="pf-legacy-task-dash shrink-0" aria-hidden>
                          —
                        </span>
                        <span className="text-[0.98rem] leading-snug" style={{ color: faint }}>
                          {task}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {repoLink ? (
                // Extra breathing room on top of the shared space-y rhythm — reads as a
                // separate action, not just another content block stacked under the tags.
                <div className="pt-4 sm:pt-6">
                  <PortfolioLinkButton
                    variant={flags.repoLinkButtonStyle}
                    href={repoLink.url}
                    label={repoLink.label || 'View repository'}
                    palette={experienceLinkButtonPalette({
                      ink,
                      muted,
                      accent,
                      border,
                      isDark: flags.isDark,
                    })}
                  />
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      {showFooter ? (
        <div
          className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t pt-5 sm:mt-16"
          style={{ borderColor: border }}
        >
          {statusLabel ? (
            <span className="inline-flex items-center gap-2 text-[0.85rem]" style={{ color: muted }}>
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ backgroundColor: statusColor }}
                aria-hidden
              />
              {statusLabel}
            </span>
          ) : (
            <span aria-hidden />
          )}
          {period || badgeText ? (
            <span className="inline-flex items-center gap-2.5 text-[0.85rem]" style={{ color: muted }}>
              <span
                className="inline-block h-[7px] w-[7px] shrink-0 rotate-45"
                style={{ backgroundColor: accent }}
                aria-hidden
              />
              {period}
              {period && badgeText ? <span aria-hidden>|</span> : null}
              {badgeText}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function LegacyExperienceList({
  blocks,
  presentation = DEFAULT_EXPERIENCE_PRESENTATION,
  forceSingleColumn = false,
}: {
  blocks: ProfileMediaBlock[];
  presentation?: PortfolioExperiencePresentationSettings;
  motionProfile?: PortfolioGlobalMotionProfile;
  forceSingleColumn?: boolean;
}) {
  if (blocks.length === 0) return null;

  const isDark = presentation.activeColorMode !== 'light';
  const colorMode = resolveExperienceColorMode(presentation);
  const styles = normalizeExperienceElementStyles(presentation.elementStyles);
  const accent = experienceAccentColor(presentation.accentColor);
  const secondary = experienceSecondaryStatusColor(presentation);
  const ink = ensureExperienceInkContrast(
    presentation.titleColor?.trim() || resolveExperienceTextColor(styles.title, colorMode),
    isDark,
    DEFAULT_EXPERIENCE_TITLE_COLOR,
    DEFAULT_EXPERIENCE_TITLE_COLOR_DARK
  );
  const muted = ensureExperienceInkContrast(
    presentation.subtitleColor?.trim() || resolveExperienceTextColor(styles.meta, colorMode),
    isDark,
    DEFAULT_EXPERIENCE_MUTED_COLOR,
    DEFAULT_EXPERIENCE_MUTED_COLOR_DARK
  );
  // texteFaint — the quietest tier, one step below muted — for the description specifically.
  const faint = ensureExperienceInkContrast(
    resolveExperienceTextColor(styles.blockLabel, colorMode),
    isDark,
    DEFAULT_EXPERIENCE_MUTED_COLOR,
    DEFAULT_EXPERIENCE_MUTED_COLOR_DARK
  );
  const border = isDark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.12)';
  const background = presentation.sectionBackgroundColor?.trim() || DEFAULT_SECTION_BACKGROUND_COLOR;

  const flags: DuotoneContentFlags = {
    showTitle: presentation.showTitle !== false,
    showPeriod: presentation.showPeriod !== false,
    showMeta: presentation.showMeta !== false,
    showDescription: presentation.showDescription !== false,
    showTasks: presentation.showTasks !== false,
    showTools: presentation.showTools !== false,
    showProof: presentation.showProof !== false,
    showEntryMedia: presentation.showEntryMedia !== false,
    tasksDisplay: presentation.tasksDisplay,
    toolsBadgeStyle: presentation.toolsBadgeStyle,
    repoLinkButtonStyle: resolveExperienceRepoLinkStyle(presentation.repoLinkButtonStyle, 'legacy'),
    isDark,
  };

  const thumbnailRadius = presentation.legacyThumbnailRadius ?? 'xl';
  const thumbnailHeight = presentation.legacyThumbnailHeight ?? 'lg';
  const thumbnailWidth = presentation.legacyThumbnailWidth ?? 'lg';
  const itemGap = presentation.legacyItemGap ?? 'md';
  const alternateSides = presentation.legacyAlternateSides !== false;
  const fixedSide = presentation.legacyFixedSide ?? 'left';
  const showTasksLegacy = presentation.legacyShowTasks === true;

  return (
    <div
      className={experienceListShellClass(
        forceSingleColumn ? 'full' : presentation.listMaxWidth,
        forceSingleColumn ? 'left' : presentation.listPlacement
      )}
    >
      <div>
        {blocks.map((block, index) => (
          <LegacyExperienceCard
            key={block.id}
            block={block}
            index={index}
            ink={ink}
            muted={muted}
            faint={faint}
            accent={accent}
            secondary={secondary}
            border={border}
            background={background}
            isLast={index === blocks.length - 1}
            flags={flags}
            thumbnailRadius={thumbnailRadius}
            thumbnailHeight={thumbnailHeight}
            thumbnailWidth={thumbnailWidth}
            itemGap={itemGap}
            alternateSides={alternateSides}
            fixedSide={fixedSide}
            showTasksLegacy={showTasksLegacy}
          />
        ))}
      </div>
    </div>
  );
}

function experienceContentFlags(
  presentation: PortfolioExperiencePresentationSettings,
  isDark: boolean,
  nativeLink: Parameters<typeof resolveExperienceRepoLinkStyle>[1]
): DuotoneContentFlags {
  return {
    showTitle: presentation.showTitle !== false,
    showPeriod: presentation.showPeriod !== false,
    showMeta: presentation.showMeta !== false,
    showDescription: presentation.showDescription !== false,
    showTasks: presentation.showTasks !== false,
    showTools: presentation.showTools !== false,
    showProof: presentation.showProof !== false,
    showEntryMedia: presentation.showEntryMedia !== false,
    tasksDisplay: presentation.tasksDisplay,
    toolsBadgeStyle: presentation.toolsBadgeStyle,
    repoLinkButtonStyle: resolveExperienceRepoLinkStyle(presentation.repoLinkButtonStyle, nativeLink),
    isDark,
  };
}


function KineticExperienceRow({
  block,
  ink,
  muted,
  bodyColor,
  accent,
  border,
  background,
  flags,
  isLast,
}: {
  block: ProfileMediaBlock;
  ink: string;
  muted: string;
  bodyColor: string;
  accent: string;
  border: string;
  background: string;
  flags: DuotoneContentFlags;
  isLast: boolean;
}) {
  const { period, title, organization, description, status, tasks, tools, links } = resolveExperienceContent(block);
  const repoLink = flags.showProof ? (links[0] ?? null) : null;
  const displayTasks = flags.showTasks ? tasks.slice(0, 4) : [];
  const displayTools = flags.showTools ? tools : [];
  const statusLabel = status === 'ONGOING' ? 'Ongoing' : status === 'FINISHED' ? 'Done' : null;

  return (
    <article
      className="relative py-12 sm:py-16 first:pt-0 last:pb-0"
      style={{ borderBottom: isLast ? undefined : `1px solid ${border}` }}
    >
      <div className="flex items-baseline justify-between gap-6">
        {flags.showPeriod && period ? (
          <p className="font-mono text-[0.68rem] uppercase tracking-[0.22em]" style={{ color: muted }}>
            {period}
          </p>
        ) : (
          <span />
        )}
        {flags.showMeta && statusLabel ? (
          <p className="font-mono text-[0.68rem] uppercase tracking-[0.22em]" style={{ color: accent }}>
            {statusLabel}
          </p>
        ) : null}
      </div>
      {flags.showTitle && title ? (
        <h3
          className="mt-8 max-w-[12ch] text-[clamp(3.1rem,12vw,8.75rem)] font-semibold leading-[0.84] tracking-[-0.07em]"
          style={{ color: ink }}
        >
          {title}
        </h3>
      ) : null}
      <div className="mt-10 grid grid-cols-1 gap-10 sm:mt-14 sm:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] sm:items-end">
        <div>
          {flags.showMeta && organization ? (
            <p className="text-[0.95rem]" style={{ color: muted }}>
              {organization}
            </p>
          ) : null}
          {flags.showDescription && description ? (
            <p className="mt-5 max-w-sm text-[0.95rem] leading-relaxed" style={{ color: bodyColor }}>
              {description}
            </p>
          ) : null}
          {displayTasks.length > 0 ? (
            <div className="mt-8 max-w-sm">
              <ExperienceTasksDisplay
                tasks={displayTasks}
                display={flags.tasksDisplay}
                bodyColor={bodyColor}
                mutedColor={muted}
                isDark={flags.isDark}
                label=""
                size="md"
              />
            </div>
          ) : null}
        </div>
        <div className="flex flex-col items-start gap-8 sm:items-end">
          {displayTools.length > 0 ? (
            <div className="max-w-xs">
              <ExperienceToolsDisplay
                tools={displayTools}
                style={flags.toolsBadgeStyle}
                ink={ink}
                muted={muted}
                background={background}
                isDark={flags.isDark}
                size="sm"
              />
            </div>
          ) : null}
          {repoLink ? (
            <PortfolioLinkButton
              variant={flags.repoLinkButtonStyle}
              href={repoLink.url}
              label={repoLink.label || 'View repository'}
              palette={experienceLinkButtonPalette({
                ink,
                muted,
                accent,
                border,
                background,
                isDark: flags.isDark,
              })}
            />
          ) : null}
        </div>
      </div>
    </article>
  );
}

export function KineticExperienceList({
  blocks,
  presentation = DEFAULT_EXPERIENCE_PRESENTATION,
  forceSingleColumn = false,
}: {
  blocks: ProfileMediaBlock[];
  presentation?: PortfolioExperiencePresentationSettings;
  motionProfile?: PortfolioGlobalMotionProfile;
  forceSingleColumn?: boolean;
}) {
  if (blocks.length === 0) return null;

  const isDark = presentation.activeColorMode !== 'light';
  const colorMode = resolveExperienceColorMode(presentation);
  const styles = normalizeExperienceElementStyles(presentation.elementStyles);
  const accent = experienceAccentColor(presentation.accentColor);
  const ink = ensureExperienceInkContrast(
    presentation.titleColor?.trim() || resolveExperienceTextColor(styles.title, colorMode),
    isDark,
    DEFAULT_EXPERIENCE_TITLE_COLOR,
    DEFAULT_EXPERIENCE_TITLE_COLOR_DARK
  );
  const muted = ensureExperienceInkContrast(
    presentation.subtitleColor?.trim() || resolveExperienceTextColor(styles.meta, colorMode),
    isDark,
    DEFAULT_EXPERIENCE_MUTED_COLOR,
    DEFAULT_EXPERIENCE_MUTED_COLOR_DARK
  );
  const bodyColor = ensureExperienceInkContrast(
    resolveExperienceTextColor(styles.tasks, colorMode) || resolveExperienceTextColor(styles.description, colorMode),
    isDark,
    DEFAULT_EXPERIENCE_BODY_COLOR,
    DEFAULT_EXPERIENCE_BODY_COLOR_DARK
  );
  const border = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)';
  const background = presentation.sectionBackgroundColor?.trim() || DEFAULT_SECTION_BACKGROUND_COLOR;
  const flags = experienceContentFlags(presentation, isDark, 'legacy');

  return (
    <div
      className={experienceListShellClass(
        forceSingleColumn ? 'full' : presentation.listMaxWidth,
        forceSingleColumn ? 'left' : presentation.listPlacement
      )}
    >
      {blocks.map((block, index) => (
        <KineticExperienceRow
          key={block.id}
          block={block}
          ink={ink}
          muted={muted}
          bodyColor={bodyColor}
          accent={accent}
          border={border}
          background={background}
          flags={flags}
          isLast={index === blocks.length - 1}
        />
      ))}
    </div>
  );
}
