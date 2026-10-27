'use client';

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from 'framer-motion';
import { aboutBannerScrollParent, aboutBannerWatchEnter } from '@/components/portfolio/portfolio-about-scroll-utils';
import { type ProfileEducationEntry } from '@/types/profile';
import { aboutPlatformHeadlineSizeClass, aboutPlatformLeadSizeClass, aboutPlatformItemSizeClass, aboutPlatformSkillsTitleSizeClass, ABOUT_VALUE_STEPS_SECTION_LABELS, infoContentBodySizeClass, infoContentEducationMetaSizeClass, type PortfolioInfoPremiumFontSize, type PortfolioInfoBlockLabelColor, infoBlockLabelColor, type PortfolioInfoLanguageLevelDisplayStyle } from '@/components/portfolio/portfolio-info-settings';
import { resolveSpokenLanguageLevelLabel } from '@/lib/spoken-languages';
import { type ProfileSkillEntry } from '@/lib/about-skills';
import { type LanguageDisplayItem } from '@/components/portfolio/EditorialAboutMeCommon';
import { aboutClassicLanguageCode } from '@/components/portfolio/EditorialAboutMeClassicLayout';
import { getManifestoScrollParent } from '@/components/portfolio/EditorialAboutMeManifestoLayout';
import { ServiceIcon, resolveServiceIconKey, type ServiceIconChoice } from './portfolio-services-icon-cards-icons';
import { mergePlatformHeadlineFormat, type PlatformHeadlineFormat } from './portfolio-info-platform-settings';
import { formatInfoBio } from './portfolio-info-bio';
import contentStyles from './portfolio-info-platform-content.module.css';

function AboutPlatformSkillIcon({ variant, color }: { variant: number; color: string }) {
  const common = {
    width: 20,
    height: 20,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    color,
    strokeWidth: 1.22,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };

  switch (variant % 8) {
    case 1:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="7.15" />
          <path d="M12 5.65v2.15M12 16.2v2.15M5.65 12h2.15M16.2 12h2.15" />
          <circle cx="12" cy="12" r="1.05" fill="currentColor" stroke="none" />
        </svg>
      );
    case 2:
      return (
        <svg {...common}>
          <path d="M5.5 17.6V11.1" />
          <path d="M12 17.6V6.4" />
          <path d="M18.5 17.6v-4.7" />
          <path d="M4.4 17.6h15.2" />
        </svg>
      );
    case 3:
      return (
        <svg {...common}>
          <path d="M12 3.7l7.15 4.05v8.5L12 20.3 4.85 16.25v-8.5L12 3.7z" />
          <path d="M12 3.7v16.6" />
          <path d="M5.05 8.05L12 12.05l6.95-4" />
        </svg>
      );
    case 4:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="2.85" />
          <ellipse cx="12" cy="12" rx="9.05" ry="4.15" transform="rotate(-26 12 12)" />
        </svg>
      );
    case 5:
      return (
        <svg {...common}>
          <path d="M4.6 16.7H10V11.2h5.15V5.6H19.4" />
        </svg>
      );
    case 6:
      return (
        <svg {...common}>
          <circle cx="9.15" cy="12" r="5.05" />
          <circle cx="14.85" cy="12" r="5.05" />
        </svg>
      );
    case 7:
      return (
        <svg {...common}>
          <path d="M5 9.35V5h4.35" />
          <path d="M19 9.35V5h-4.35" />
          <path d="M5 14.65V19h4.35" />
          <path d="M19 14.65V19h-4.35" />
        </svg>
      );
    case 0:
    default:
      return (
        <svg {...common}>
          <rect x="3.6" y="3.6" width="9.4" height="9.4" rx="1.15" />
          <rect x="10.95" y="10.95" width="9.45" height="9.45" rx="1.15" />
        </svg>
      );
  }
}

function aboutPlatformFirstGlyphTop(el: HTMLElement): number | null {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      return node.textContent && /\S/.test(node.textContent)
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_REJECT;
    },
  });
  const textNode = walker.nextNode();
  if (textNode) {
    const value = textNode.textContent ?? '';
    const start = value.search(/\S/);
    if (start >= 0) {
      const range = document.createRange();
      range.setStart(textNode, start);
      range.setEnd(textNode, start + 1);
      const rect = range.getBoundingClientRect();
      if (rect.height > 0) return rect.top;
    }
  }
  const box = el.getBoundingClientRect();
  return box.height > 0 ? box.top : null;
}

function aboutPlatformLineIsResting(el: HTMLElement): boolean {
  const transform = getComputedStyle(el).transform;
  if (!transform || transform === 'none') return true;
  const match = transform.match(/matrix\(([^)]+)\)/);
  if (!match?.[1]) return true;
  const ty = Number(match[1].split(',')[5]);
  return !Number.isFinite(ty) || Math.abs(ty) < 1;
}

function aboutPlatformAlignHeader(root: HTMLElement) {
  const wrap = root.querySelector<HTMLElement>('.pf-about-platform-bio-wrap');
  const line = root.querySelector<HTMLElement>('.pf-about-platform-headline-line');
  const bio = root.querySelector<HTMLElement>('.pf-about-platform-bio');
  if (!wrap) return;
  if (window.innerWidth < 1024 || !line || !bio) {
    wrap.style.removeProperty('margin-top');
    return;
  }
  if (!aboutPlatformLineIsResting(line) || !aboutPlatformLineIsResting(bio)) return;
  for (let i = 0; i < 3; i += 1) {
    const titleTop = aboutPlatformFirstGlyphTop(line);
    const bioTop = aboutPlatformFirstGlyphTop(bio);
    if (titleTop == null || bioTop == null) return;
    const delta = titleTop - bioTop;
    if (Math.abs(delta) < 0.35) return;
    const current = Number.parseFloat(getComputedStyle(wrap).marginTop) || 0;
    wrap.style.marginTop = `${Math.round((current + delta) * 10) / 10}px`;
  }
}


/** Skill card — glassmorphic surface with a cursor-driven 3D tilt that trails
 *  the pointer (damped/lerped every frame, never snaps 1:1) instead of a
 *  direct mouse-tracking rotation. Hover elevation and the tilt rotation are
 *  deliberately split across two different elements: the outer wrapper
 *  handles the discrete spring-eased lift/scale (a plain two-state CSS
 *  transition), while this element carries only the continuously-updated
 *  tilt — mixing a damped per-frame value with a CSS transition on the same
 *  property would fight itself and read as mushy/late. */
function AboutPlatformSkillCard({
  skill,
  index,
  icon,
  cardTitleClass,
  cardBodyClass,
}: {
  skill: ProfileSkillEntry;
  index: number;
  icon?: ServiceIconChoice;
  cardTitleClass: string;
  cardBodyClass: string;
}) {
  const skillTitle = skill.title?.trim() || '';
  const skillDescription = skill.description?.trim() || '';
  // Same padding on every card — varying it per index made same-content cards
  // read as different sizes, which fought the "equal width/height" grid.
  const densityClass = 'px-5 pb-6 pt-[1.15rem] sm:px-6 sm:pb-7 sm:pt-5';

  return (
    <article
      className={`pf-about-platform-card flex flex-1 flex-col rounded-lg border ${densityClass}`}
    >
      <span className="pf-about-platform-card-mark" data-reveal="mark">
        {icon ? <ServiceIcon name={resolveServiceIconKey(icon, skillTitle, index)} size={24} strokeWidth={1.5} /> : <AboutPlatformSkillIcon variant={index} color="currentColor" />}
      </span>
      <h4
        className={`pf-about-platform-card-title mt-5 min-w-0 font-medium leading-[1.3] tracking-[-0.02em] sm:mt-6 ${cardTitleClass}`}
        data-reveal="title"
      >
        {skillTitle}
      </h4>
      {skillDescription ? <p
        className={`pf-about-platform-card-body mt-3.5 min-w-0 flex-1 leading-[1.6] sm:mt-4 ${cardBodyClass}`}
        data-reveal="body"
      >
        {skillDescription}
      </p> : null}
    </article>
  );
}

/** About · platform — one "index row": an italic title in a fixed 5/12 left
 *  column (sticky while its own content scrolls by) and content filling the
 *  full 7/12 right column, so nothing is squeezed into a narrow strip with a
 *  wide empty gutter beside it. Unconditional — no stagger/narrow variants;
 *  this is the one layout used everywhere below the skills grid. */
function AboutPlatformIndexSection({
  title,
  sectionTitleClass,
  titleColor,
  children,
  className = '',
}: {
  title: string;
  sectionTitleClass: string;
  titleColor: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`pf-about-platform-split mt-16 grid grid-cols-1 gap-6 sm:mt-20 lg:mt-24 lg:grid-cols-12 lg:items-start lg:gap-x-10 xl:mt-28 xl:gap-x-14 ${className}`}
    >
      <h3
        className={`pf-about-platform-split-title min-w-0 leading-[1.15] tracking-[-0.02em] lg:col-span-4 lg:sticky lg:top-[calc(var(--portfolio-nav-top-clearance,5.5rem)+1.5rem)] lg:self-start ${sectionTitleClass}`}
        style={{ color: titleColor }}
      >
        <span className="pf-about-platform-headline-mask">
          <span className="pf-about-platform-split-title-line">{title}</span>
        </span>
      </h3>
      <div className="pf-about-platform-split-body min-w-0 lg:col-start-5 lg:col-span-8">
        {children}
      </div>
    </section>
  );
}

/** About · platform — Jasper split: Playfair headline, stair skills, typographic langs. */
export function AboutPlatformLayout({
  title: _title,
  bio,
  subtitle,
  specialty,
  skillItems,
  strengthItems,
  educationItems,
  languageItems,
  interestItems,
  showSkills,
  showStrengths,
  showLanguages,
  showEducation,
  showInterests,
  showLanguageFlags: _showLanguageFlags,
  languageLevelStyle: _languageLevelStyle,
  headlineText,
  headlineFormat,
  skillIcons,
  filledCards = false,
  strengthsSectionTitle,
  accent,
  titleColor,
  bodyColor,
  cardBg,
  cardBorder,
  contentSize,
  blockLabelColor,
}: {
  title: string;
  bio?: string | null;
  subtitle?: string;
  specialty?: string | null;
  skillItems: ProfileSkillEntry[];
  strengthItems: string[];
  educationItems: ProfileEducationEntry[];
  languageItems: LanguageDisplayItem[];
  interestItems: string[];
  showSkills: boolean;
  showStrengths: boolean;
  showLanguages: boolean;
  showEducation: boolean;
  showInterests: boolean;
  showLanguageFlags: boolean;
  languageLevelStyle: PortfolioInfoLanguageLevelDisplayStyle;
  headlineText: string;
  headlineFormat?: PlatformHeadlineFormat;
  skillIcons?: Record<string, ServiceIconChoice>;
  filledCards?: boolean;
  strengthsSectionTitle: string;
  accent: string;
  titleColor: string;
  bodyColor: string;
  cardBg: string;
  cardBorder: string;
  contentSize: PortfolioInfoPremiumFontSize;
  blockLabelColor: PortfolioInfoBlockLabelColor;
}) {
  const reduceMotion = useReducedMotion();
  const motionDisabled = reduceMotion === true;
  const blockTitleColor = infoBlockLabelColor(blockLabelColor, titleColor);
  const rootRef = useRef<HTMLDivElement>(null);
  const [hasEntered, setHasEntered] = useState(false);
  const [motionState, setMotionState] = useState<'armed' | 'active' | 'done'>('armed');
  const headlineClass = aboutPlatformHeadlineSizeClass(contentSize);
  const leadClass = aboutPlatformLeadSizeClass(contentSize, true);
  const strengthsTitleClass = aboutPlatformSkillsTitleSizeClass(contentSize);
  const itemClass = aboutPlatformItemSizeClass(contentSize);
  const cardBodyClass = infoContentBodySizeClass(contentSize);
  const metaClass = infoContentEducationMetaSizeClass(contentSize);
  const format = mergePlatformHeadlineFormat(headlineFormat);
  const headlineLines = formatInfoBio(headlineText, format.bioCase)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  const displayHeadlineLines =
    headlineLines.length > 0 ? headlineLines : [specialty?.trim() || 'Built for clarity'];
  const bioText = bio?.trim() || subtitle?.trim() || '';
  const visibleSkills = skillItems.filter((item) => item.title?.trim());
  const visibleStrengths = strengthItems.map((item) => item.trim()).filter(Boolean);
  const visibleEducation = educationItems.filter(
    (entry) => entry.title?.trim() || entry.institution?.trim() || entry.schoolYear?.trim()
  );
  const visibleInterests = interestItems.map((item) => item.trim()).filter(Boolean);
  const showSkillsBlock = showSkills && visibleSkills.length > 0;
  const showStrengthsBlock = showStrengths && visibleStrengths.length > 0;
  const showLanguagesBlock = showLanguages && languageItems.length > 0;
  const showEducationBlock = showEducation && visibleEducation.length > 0;
  const showInterestsBlock = showInterests && visibleInterests.length > 0;

  useEffect(() => {
    if (motionDisabled) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: client-only state after hydration
      setHasEntered(true);
      return;
    }

    const node = rootRef.current;
    if (!node) return;
    const scrollRoot = getManifestoScrollParent(node);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setHasEntered(true);
          observer.disconnect();
        }
      },
      { root: scrollRoot, threshold: 0.16, rootMargin: '0px 0px -10% 0px' }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [motionDisabled]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const prefersReduce =
      motionDisabled || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduce) {
      const alignHeader = () => aboutPlatformAlignHeader(root);
      alignHeader();
      void document.fonts?.ready.then(alignHeader);
      window.addEventListener('resize', alignHeader);
      return () => window.removeEventListener('resize', alignHeader);
    }

    const scroller = aboutBannerScrollParent(root);
    const header = root.querySelector<HTMLElement>('.pf-about-platform-header');
    const kicker = root.querySelector<HTMLElement>('.pf-about-platform-kicker');
    const lines = Array.from(root.querySelectorAll<HTMLElement>('.pf-about-platform-headline-line'));
    const bio = root.querySelector<HTMLElement>('.pf-about-platform-bio');
    const skillRises = Array.from(root.querySelectorAll<HTMLElement>('.pf-about-platform-skill-rise'));
    const badges = Array.from(root.querySelectorAll<HTMLElement>('.pf-about-platform-word'));
    const langs = Array.from(root.querySelectorAll<HTMLElement>('.pf-about-platform-lang'));
    const eduRows = Array.from(root.querySelectorAll<HTMLElement>('.pf-about-platform-edu-row'));
    const strengths = root.querySelector<HTMLElement>('.pf-about-platform-strengths');
    const languages = root.querySelector<HTMLElement>('.pf-about-platform-languages');
    const education = root.querySelector<HTMLElement>('.pf-about-platform-education');

    let stopHeaderWatch: (() => void) | undefined;
    let headerFallbackId: number | undefined;
    const extraStops: Array<() => void> = [];
    const ctx = gsap.context(() => {
      const playWhenVisible = (trigger: HTMLElement, play: () => void) => {
        let started = false;
        const run = () => {
          if (started) return;
          started = true;
          play();
        };

        const isInView = () => {
          const box = trigger.getBoundingClientRect();
          const port = scroller?.getBoundingClientRect();
          const top = port?.top ?? 0;
          const bottom = port ? port.bottom : window.innerHeight;
          const height = Math.max(1, bottom - top);
          return box.top < top + height * 0.82 && box.bottom > top + height * 0.16;
        };

        const io = new IntersectionObserver(
          (entries) => {
            if (entries.some((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.12)) {
              run();
            }
          },
          {
            root: scroller ?? null,
            threshold: [0.12, 0.24],
            rootMargin: '0px 0px -14% 0px',
          }
        );
        io.observe(trigger);
        extraStops.push(() => io.disconnect());

        ScrollTrigger.create({
          trigger,
          ...(scroller ? { scroller } : {}),
          start: 'top 82%',
          once: true,
          onEnter: run,
        });

        const onScroll = () => {
          if (isInView()) run();
        };
        const scrollTarget: HTMLElement | Window = scroller ?? window;
        scrollTarget.addEventListener('scroll', onScroll, { passive: true });
        extraStops.push(() => scrollTarget.removeEventListener('scroll', onScroll));
        if (isInView()) run();
      };

      const playIn = (
        items: HTMLElement[],
        trigger: HTMLElement | null,
        from: gsap.TweenVars,
        to: gsap.TweenVars
      ) => {
        if (!items.length || !trigger) return;
        gsap.set(items, { ...from, immediateRender: true });
        const tween = gsap.to(items, {
          ...to,
          paused: true,
          overwrite: 'auto',
          immediateRender: false,
        });
        playWhenVisible(trigger, () => tween.play());
      };

      if (header) {
        const headerIntro = gsap.timeline({
          paused: true,
          defaults: { ease: 'power3.out', force3D: true, overwrite: 'auto' },
          onComplete: () => {
            if (lines.length) gsap.set(lines, { willChange: 'auto' });
            if (bio) gsap.set(bio, { willChange: 'auto' });
            aboutPlatformAlignHeader(root);
          },
        });

        if (kicker) gsap.set(kicker, { autoAlpha: 0, y: 0, immediateRender: true });
        if (lines.length) gsap.set(lines, { y: '0%', autoAlpha: 0, immediateRender: true });
        if (bio) gsap.set(bio, { y: 0, autoAlpha: 0, immediateRender: true });
        aboutPlatformAlignHeader(root);

        if (kicker) {
          gsap.set(kicker, { autoAlpha: 0, y: 8 });
          headerIntro.to(kicker, { autoAlpha: 1, y: 0, duration: 0.48 }, 0);
        }
        if (lines.length) {
          gsap.set(lines, { y: '108%', autoAlpha: 1, willChange: 'transform' });
          headerIntro.to(lines, { y: '0%', duration: 0.88, stagger: 0.08 }, 0.04);
        }
        if (bio) {
          const risePx = Math.round((lines[0]?.offsetHeight || 48) * 1.08);
          gsap.set(bio, { y: risePx, autoAlpha: 0, willChange: 'transform,opacity' });
          headerIntro.to(bio, { y: 0, autoAlpha: 1, duration: 0.88 }, 0.04);
        }

        let headerStarted = false;
        const playHeaderIntro = () => {
          if (headerStarted) return;
          headerStarted = true;
          requestAnimationFrame(() => headerIntro.play());
        };
        const stopNested = aboutBannerWatchEnter(header, scroller, playHeaderIntro);
        const stopViewport = aboutBannerWatchEnter(header, undefined, playHeaderIntro);
        ScrollTrigger.create({
          trigger: header,
          start: 'top 90%',
          once: true,
          onEnter: playHeaderIntro,
        });
        if (scroller) {
          ScrollTrigger.create({
            trigger: header,
            scroller,
            start: 'top 90%',
            once: true,
            onEnter: playHeaderIntro,
          });
        }
        const onWinScroll = () => {
          const box = header.getBoundingClientRect();
          if (box.top < window.innerHeight * 0.9 && box.bottom > 40) playHeaderIntro();
        };
        window.addEventListener('scroll', onWinScroll, { passive: true });
        scroller?.addEventListener('scroll', onWinScroll, { passive: true });
        headerFallbackId = window.setTimeout(onWinScroll, 280);
        stopHeaderWatch = () => {
          if (headerFallbackId != null) window.clearTimeout(headerFallbackId);
          window.removeEventListener('scroll', onWinScroll);
          scroller?.removeEventListener('scroll', onWinScroll);
          stopNested();
          stopViewport();
        };
      }

      setMotionState('active');

      const splitLines = Array.from(
        root.querySelectorAll<HTMLElement>('.pf-about-platform-split-title-line')
      );
      splitLines.forEach((line) => {
        const title = line.closest<HTMLElement>('.pf-about-platform-split-title') ?? line;
        gsap.set(line, { y: '108%', immediateRender: true, force3D: true });
        const tween = gsap.to(line, {
          y: '0%',
          duration: 0.88,
          ease: 'power3.out',
          paused: true,
          overwrite: 'auto',
          force3D: true,
        });
        playWhenVisible(title, () => tween.play());
      });

      // Each card reveals in two phases as it scrolls into view: the frame
      // itself first (a slide + fade), then its own icon → title → body
      // cascade in quick, tight succession — triggered independently per
      // card rather than one shared stagger across the whole grid.
      skillRises.forEach((rise) => {
        const mark = rise.querySelector<HTMLElement>('[data-reveal="mark"]');
        const title = rise.querySelector<HTMLElement>('[data-reveal="title"]');
        const body = rise.querySelector<HTMLElement>('[data-reveal="body"]');
        gsap.set(rise, { y: 34, autoAlpha: 0, immediateRender: true });
        if (mark) gsap.set(mark, { y: 10, autoAlpha: 0, immediateRender: true });
        if (title) gsap.set(title, { y: 10, autoAlpha: 0, immediateRender: true });
        if (body) gsap.set(body, { y: 10, autoAlpha: 0, immediateRender: true });
        const tl = gsap.timeline({
          paused: true,
          defaults: { ease: 'power3.out', force3D: true, overwrite: 'auto' },
          // The one-shot reveal leaves inline transform/opacity behind, which
          // (being inline) would permanently outrank the icon's own hover
          // spring and the body's rest/hover opacity swing below — hand
          // those two back to CSS once the entrance settles.
          onComplete: () => {
            if (mark) gsap.set(mark, { clearProps: 'transform,opacity,visibility' });
            if (body) gsap.set(body, { clearProps: 'transform,opacity,visibility' });
          },
        });
        tl.to(rise, { y: 0, autoAlpha: 1, duration: 0.8 }, 0);
        if (mark) tl.to(mark, { y: 0, autoAlpha: 1, duration: 0.42 }, 0.22);
        if (title) tl.to(title, { y: 0, autoAlpha: 1, duration: 0.46 }, 0.3);
        if (body) tl.to(body, { y: 0, autoAlpha: 1, duration: 0.5 }, 0.38);
        playWhenVisible(rise, () => tl.play());
      });

      playIn(
        badges,
        strengths,
        { x: 36, autoAlpha: 0 },
        {
          x: 0,
          autoAlpha: 1,
          duration: 0.72,
          stagger: 0.08,
          ease: 'power3.out',
          // The words keep their final inline transform: clearing it handed them back to the
          // CSS "hidden until animated" baseline (translateX 36px) and left them indented.
        }
      );
      playIn(
        langs,
        languages,
        { x: 36, autoAlpha: 0 },
        { x: 0, autoAlpha: 1, duration: 0.72, stagger: 0.08, ease: 'power3.out' }
      );
      playIn(
        eduRows,
        education,
        { x: 36, autoAlpha: 0 },
        { x: 0, autoAlpha: 1, duration: 0.72, stagger: 0.08, ease: 'power3.out' }
      );

      const interestList = root.querySelector<HTMLElement>('.pf-about-platform-split-list');
      playIn(
        Array.from(root.querySelectorAll<HTMLElement>('.pf-about-platform-split-list > *')),
        interestList?.closest('.pf-about-platform-split') ?? interestList,
        { y: 18, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.72, stagger: 0.08, ease: 'power3.out' }
      );

    }, root);

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
    const alignHeader = () => aboutPlatformAlignHeader(root);
    void document.fonts?.ready.then(() => {
      alignHeader();
      ScrollTrigger.refresh();
    });
    window.addEventListener('resize', alignHeader);
    return () => {
      extraStops.forEach((stop) => stop());
      stopHeaderWatch?.();
      window.clearTimeout(refreshId);
      window.removeEventListener('resize', alignHeader);
      ctx.revert();
    };
  }, [
    motionDisabled,
    showSkillsBlock,
    showStrengthsBlock,
    showLanguagesBlock,
    showEducationBlock,
    showInterestsBlock,
    visibleSkills.length,
    visibleStrengths.length,
    languageItems.length,
    visibleEducation.length,
    visibleInterests.length,
  ]);

  return (
    <div
      ref={rootRef}
      className={`pf-about-platform-root w-full ${contentStyles.content}`}
      data-platform-headline-font={format.bioFontFamily}
      data-platform-filled-cards={filledCards ? 'true' : 'false'}
      data-pf-entry={motionDisabled || hasEntered ? 'in' : 'armed'}
      data-pf-motion={motionDisabled ? 'reduce' : motionState}
      style={
        {
          '--pf-about-platform-accent': accent,
          '--pf-about-platform-ink': titleColor,
          '--pf-about-platform-muted': bodyColor,
          '--pf-about-platform-line': cardBorder,
          '--pf-about-platform-fill': cardBg,
          '--platform-headline-font': format.bioFontFamily === 'default' ? 'var(--info-default-font-family, inherit)' : format.bioFontFamily === 'sans' ? 'ui-sans-serif, system-ui, sans-serif' : "'Playfair Display', Georgia, serif",
          '--platform-headline-style': format.bioItalic ? 'italic' : 'normal',
          '--platform-headline-weight': format.bioBold ? 700 : 500,
        } as CSSProperties
      }
    >
      <header className="pf-about-platform-header grid gap-5 sm:gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.9fr)] lg:items-start lg:gap-x-16 lg:gap-y-5 xl:gap-x-24">
        <h2
          className={`pf-about-platform-headline leading-[1.12] tracking-[-0.025em] lg:col-start-1 lg:row-start-1 ${headlineClass}`}
          style={{ color: titleColor, lineHeight: format.bioLineHeight ?? 1.12, fontSize: format.bioFontSize ? `clamp(12px, 8vw, ${format.bioFontSize}px)` : undefined }}
        >
          {displayHeadlineLines.map((line, index) => (
            <span key={`${index}-${line}`} className="pf-about-platform-headline-mask">
              <span className="pf-about-platform-headline-line">{line}</span>
            </span>
          ))}
        </h2>
        {bioText ? (
          <div className="pf-about-platform-bio-wrap min-w-0 lg:col-start-2 lg:row-start-1 lg:self-start">
            <p
              className={`pf-about-platform-bio min-w-0 w-full max-w-xl !leading-[1.55] tracking-[-0.005em] lg:max-w-none ${leadClass}`}
              style={{ color: bodyColor }}
            >
              {bioText}
            </p>
          </div>
        ) : null}
      </header>

      {showSkillsBlock ? (
        <section
          className="pf-about-platform-skills mt-12 sm:mt-16 lg:mt-20"
          data-count={String(visibleSkills.length)}
        >
          <div className="pf-about-platform-skills-grid" data-count={String(visibleSkills.length)}>
            {visibleSkills.map((skill, index) => (
              <div key={skill.id} className="pf-about-platform-skill-slot flex min-h-0 flex-col">
                <div className="pf-about-platform-skill-shift">
                  <div className="pf-about-platform-skill-rise">
                    <AboutPlatformSkillCard
                      skill={skill}
                      index={index}
                      icon={skillIcons?.[skill.id] ?? 'auto'}
                      cardTitleClass={itemClass}
                      cardBodyClass={cardBodyClass}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {showStrengthsBlock ? (
        <AboutPlatformIndexSection
          title={strengthsSectionTitle}
          sectionTitleClass={strengthsTitleClass}
          titleColor={blockTitleColor}
          className="pf-about-platform-strengths"
        >
          <div className="pf-about-platform-words flex flex-wrap items-baseline gap-x-9 gap-y-5">
            {visibleStrengths.map((item, index) => (
              <span
                key={`${index}-${item}`}
                className={`pf-about-platform-word ${cardBodyClass}`}
                data-pf-no-color-transition=""
              >
                {item}
              </span>
            ))}
          </div>
        </AboutPlatformIndexSection>
      ) : null}

      {showLanguagesBlock ? (
        <AboutPlatformIndexSection
          title={ABOUT_VALUE_STEPS_SECTION_LABELS.languages}
          sectionTitleClass={strengthsTitleClass}
          titleColor={blockTitleColor}
          className="pf-about-platform-languages"
        >
          <ul className="pf-about-platform-langs">
            {languageItems.map((item) => {
              const code = aboutClassicLanguageCode(item.name);
              const levelLabel = item.level ? resolveSpokenLanguageLevelLabel(item.level) : null;
              return (
                <li key={item.name} className="pf-about-platform-lang" data-pf-no-color-transition="">
                  <span aria-hidden className="pf-about-platform-lang-code" style={{ color: titleColor }}>
                    {code}
                  </span>
                  <span className="pf-about-platform-lang-name">{item.name}</span>
                  {levelLabel ? (
                    <span className="pf-about-platform-lang-level" data-pf-no-color-transition="">
                      {levelLabel}
                    </span>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </AboutPlatformIndexSection>
      ) : null}

      {showEducationBlock ? (
        <AboutPlatformIndexSection
          title={ABOUT_VALUE_STEPS_SECTION_LABELS.education}
          sectionTitleClass={strengthsTitleClass}
          titleColor={blockTitleColor}
          className="pf-about-platform-education"
        >
          <ol className="pf-about-platform-edu-list">
            {visibleEducation.map((entry, index) => {
              const degree = entry.title?.trim() || '';
              const institution = entry.institution?.trim() || '';
              const year = entry.schoolYear?.trim() || '';
              const headline = degree || institution;
              const detail = degree && institution ? institution : '';

              return (
                <li
                  key={entry.id || `${entry.title}-${entry.schoolYear}-${index}`}
                  className="pf-about-platform-edu-row"
                  data-pf-no-color-transition=""
                >
                  <span className="pf-about-platform-edu-year" style={{ color: bodyColor }}>
                    {year || '—'}
                  </span>
                  <div className="pf-about-platform-edu-body min-w-0">
                    {headline ? (
                      <p className="pf-about-platform-edu-title-track min-w-0">
                        <span
                          className={`pf-about-platform-edu-degree font-medium leading-[1.2] tracking-[-0.02em] ${itemClass}`}
                          style={{ color: titleColor }}
                        >
                          {headline}
                        </span>
                      </p>
                    ) : null}
                    {detail ? (
                      <span className="pf-about-platform-edu-meta-mask mt-3 block">
                        <span
                          className={`pf-about-platform-edu-school block leading-relaxed ${metaClass}`}
                          style={{ color: bodyColor }}
                        >
                          <span className="pf-about-platform-edu-meta-slash" aria-hidden="true">
                            /
                          </span>
                          {detail}
                        </span>
                      </span>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ol>
        </AboutPlatformIndexSection>
      ) : null}

      {showInterestsBlock ? (
        <AboutPlatformIndexSection
          title={ABOUT_VALUE_STEPS_SECTION_LABELS.interests}
          sectionTitleClass={strengthsTitleClass}
          titleColor={blockTitleColor}
          className="pf-about-platform-interests"
        >
          <ul className="pf-about-platform-split-list space-y-3 sm:space-y-4">
            {visibleInterests.map((item, index) => (
              <li
                key={`${index}-${item}`}
                className={`pf-about-platform-split-item font-medium leading-[1.2] tracking-[-0.02em] ${itemClass}`}
                style={{ color: bodyColor }}
              >
                {item}
              </li>
            ))}
          </ul>
        </AboutPlatformIndexSection>
      ) : null}
    </div>
  );
}
