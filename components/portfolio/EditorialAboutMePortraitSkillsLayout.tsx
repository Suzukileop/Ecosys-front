'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion, useReducedMotion } from 'framer-motion';
import { aboutBannerScrollParent } from '@/components/portfolio/portfolio-about-scroll-utils';
import { type ProfileEducationEntry } from '@/types/profile';
import { aboutPortraitSkillsBioSizeClass, aboutPortraitSkillsListSizeClass, aboutPortraitSkillsMetaSizeClass, aboutPortraitSkillsStrengthsItemSizeClass, aboutPortraitSkillsStrengthsTitleSizeClass, ABOUT_VALUE_STEPS_SECTION_LABELS, infoContentBodySizeClass, type PortfolioInfoPremiumFontSize, type PortfolioInfoBlockLabelColor, infoBlockLabelColor } from '@/components/portfolio/portfolio-info-settings';
import { resolveSpokenLanguageLevelLabel } from '@/lib/spoken-languages';
import { type ProfileSkillEntry } from '@/lib/about-skills';
import { readPortfolioNavTopClearancePx } from '@/components/portfolio/portfolio-nav-top-clearance';
import { mediaImageResponsive } from '@/lib/media-image-url';
import { useT } from '@/lib/i18n/I18nProvider';
import { ABOUT_MEDIA_WIDTHS, ABOUT_MEDIA_SIZES, infoPortraitImageClass, type LanguageDisplayItem } from '@/components/portfolio/EditorialAboutMeCommon';
import { ABOUT_CLASSIC_LEVEL_TONE, aboutClassicLanguageCode } from '@/components/portfolio/EditorialAboutMeClassicLayout';
import contentStyles from './portfolio-info-portrait-content.module.css';

const ABOUT_PORTRAIT_SKILLS_EASE = [0.16, 1, 0.3, 1] as const;
const ABOUT_PORTRAIT_SKILLS_CLIP_EASE = [0.77, 0, 0.175, 1] as const;
const ABOUT_PORTRAIT_SKILLS_CLIP_START = 'inset(0% 0% 0% 100%)';
const ABOUT_PORTRAIT_SKILLS_CLIP_END = 'inset(0% 0% 0% 0%)';
const ABOUT_PORTRAIT_SKILLS_INTERESTS_LABEL = 'Interests';
const ABOUT_PORTRAIT_SKILLS_LANGUAGES_LABEL = 'Languages';
const ABOUT_PORTRAIT_SKILLS_RUNWAY_STEP_VH = 22;
const ABOUT_PORTRAIT_SKILLS_INDICATOR_EASE = 'power4.out';

function portraitSkillsRunwayHeight(skillCount: number): string {
  if (skillCount <= 1) return '0px';
  return `calc(${Math.min(3, skillCount - 1) * ABOUT_PORTRAIT_SKILLS_RUNWAY_STEP_VH}dvh)`;
}

function aboutPortraitSkillsTween(
  reduceMotion: boolean,
  duration: number,
  delay: number,
  ease: readonly [number, number, number, number] = ABOUT_PORTRAIT_SKILLS_EASE
) {
  if (reduceMotion) {
    return { duration: 0, delay: 0 };
  }
  return { duration, delay, ease };
}

/** About · portrait skills — bold ISO code, mastery level + proportional bar underneath. */
function AboutPortraitLanguageList({
  items,
  titleColor,
}: {
  items: LanguageDisplayItem[];
  titleColor: string;
}) {
  if (items.length === 0) return null;
  return (
    <ul className="pf-about-portrait-langs" role="list">
      {items.map((item) => {
        const code = aboutClassicLanguageCode(item.name);
        const levelLabel = item.level ? resolveSpokenLanguageLevelLabel(item.level) : null;
        const tone = item.level ? ABOUT_CLASSIC_LEVEL_TONE[item.level] ?? 0.72 : 0.72;
        return (
          <li
            key={item.name}
            className="pf-about-portrait-lang"
            aria-label={levelLabel ? `${item.name}, ${levelLabel}` : item.name}
          >
            <span
              className="pf-about-portrait-lang-code"
              style={{ color: titleColor, fontFamily: 'inherit' }}
            >
              {code}
            </span>
            <span className="pf-about-portrait-lang-meta">
              <span className="pf-about-portrait-lang-name">{item.name}</span>
              {levelLabel ? (
                <span className="pf-about-portrait-lang-level">{levelLabel}</span>
              ) : null}
              <span className="pf-about-portrait-lang-bar" aria-hidden>
                <span
                  className="pf-about-portrait-lang-bar-fill"
                  style={{ transform: `scaleX(${tone})` }}
                />
              </span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}

/** About · portrait skills — sticky split frame, XXL skill rail + pinned portrait. */
export function AboutPortraitSkillsLayout({
  title,
  subtitle,
  bio,
  avatarUrl,
  fullName,
  skillItems,
  strengthItems,
  interestItems,
  languageItems,
  educationItems,
  showSkills,
  showStrengths,
  showInterests,
  showLanguages,
  showEducation,
  metaEnabled,
  titleColor,
  subtitleColor,
  bodyColor,
  cardBg,
  contentSize,
  portraitGrayscale = false,
  portraitEnabled = true,
  blockLabelColor,
}: {
  title: string;
  subtitle: string;
  bio?: string | null;
  avatarUrl?: string | null;
  fullName?: string | null;
  skillItems: ProfileSkillEntry[];
  strengthItems: string[];
  interestItems: string[];
  languageItems: LanguageDisplayItem[];
  educationItems: ProfileEducationEntry[];
  showSkills: boolean;
  showStrengths: boolean;
  showInterests: boolean;
  showLanguages: boolean;
  showEducation: boolean;
  metaLead: string;
  metaEnabled: boolean;
  titleColor: string;
  subtitleColor: string;
  bodyColor: string;
  cardBg: string;
  contentSize: PortfolioInfoPremiumFontSize;
  portraitGrayscale?: boolean;
  portraitEnabled?: boolean;
  blockLabelColor: PortfolioInfoBlockLabelColor;
}) {
  const t = useT();
  const blockTitleColor = infoBlockLabelColor(blockLabelColor, subtitleColor);
  // Keep the first client render identical to SSR; the preference is browser-only.
  const motionPreference = useReducedMotion();
  const [motionPreferenceReady, setMotionPreferenceReady] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: client-only state after hydration
  useEffect(() => setMotionPreferenceReady(true), []);
  const reduceMotion = motionPreferenceReady && motionPreference === true;
  const rootRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLElement>(null);
  const skillsWrapRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const [scrollSkillIndex, setScrollSkillIndex] = useState(0);
  const [interactionIndex, setInteractionIndex] = useState<number | null>(null);
  const [afterMotion, setAfterMotion] = useState<'armed' | 'active' | 'done'>(
    reduceMotion ? 'done' : 'armed'
  );
  const visibleSkills = skillItems.filter((item) => item.title?.trim());
  const visibleStrengths = strengthItems.map((item) => item.trim()).filter(Boolean);
  const visibleInterests = interestItems.map((item) => item.trim()).filter(Boolean);
  const visibleLanguageItems = languageItems.filter((item) => item.name.trim());
  const visibleEducation = educationItems.filter(
    (entry) => entry.title?.trim() || entry.institution?.trim() || entry.schoolYear?.trim()
  );
  const showSkillsBlock = showSkills && visibleSkills.length > 0;
  const showStrengthsBlock = showStrengths && visibleStrengths.length > 0;
  const showMetaBlock =
    metaEnabled &&
    ((showInterests && visibleInterests.length > 0) ||
      (showLanguages && visibleLanguageItems.length > 0));
  const showEducationBlock = showEducation && visibleEducation.length > 0;
  const showBentoBlock = showStrengthsBlock || showMetaBlock;
  const showAfterBlock = showBentoBlock || showEducationBlock;
  const scrollFocusEnabled = portraitEnabled && showSkillsBlock && visibleSkills.length > 1 && !reduceMotion;
  // Dense rails (4+ skills, or a sentence-long title) switch to a smaller, lighter, airier setting.
  const compactSkills =
    visibleSkills.length > 3 || visibleSkills.some((skill) => (skill.title?.trim().length ?? 0) > 26);
  const skillListClass = aboutPortraitSkillsListSizeClass(contentSize, compactSkills);
  const bioClass = aboutPortraitSkillsBioSizeClass(contentSize);
  const strengthsTitleClass = aboutPortraitSkillsStrengthsTitleSizeClass(contentSize);
  const strengthsItemClass = aboutPortraitSkillsStrengthsItemSizeClass(contentSize);
  const metaClass = aboutPortraitSkillsMetaSizeClass(contentSize);
  const kickerClass = infoContentBodySizeClass(contentSize);
  const bioText = bio?.trim() || '';
  const kickerText = subtitle.trim() || title.trim() || 'About me';
  const displayedSkillIndex = interactionIndex ?? scrollSkillIndex;
  const safeActiveIndex =
    visibleSkills.length > 0 ? Math.min(displayedSkillIndex, visibleSkills.length - 1) : 0;
  const bioDelay = reduceMotion
    ? 0
    : 0.58 + Math.min(showSkillsBlock ? visibleSkills.length : 1, 6) * 0.075;

  const avatarSrc = avatarUrl?.trim() || '';
  const portraitName = fullName?.trim() || 'Profile';
  const initials = portraitName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  const markEntryReady = useCallback(() => {
    rootRef.current?.setAttribute('data-pf-entry', 'ready');
  }, []);

  const activateSkill = useCallback((index: number) => {
    setInteractionIndex(index);
  }, []);

  useEffect(() => {
    if (reduceMotion) return undefined;
    const timeoutId = window.setTimeout(markEntryReady, 140);
    return () => window.clearTimeout(timeoutId);
  }, [markEntryReady, reduceMotion]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: client-only state after hydration
    setScrollSkillIndex((prev) => {
      const max = Math.max(0, visibleSkills.length - 1);
      return prev > max ? max : prev;
    });
  }, [visibleSkills.length]);

  useEffect(() => {
    if (interactionIndex == null || !scrollFocusEnabled) return undefined;

    let active = true;
    let frame = 0;
    const clearInteraction = () => {
      if (frame || !active) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        if (active) setInteractionIndex(null);
      });
    };

    const scrollRoot = aboutBannerScrollParent(pinRef.current ?? rootRef.current);
    const scrollTarget: HTMLElement | Window = scrollRoot ?? window;
    scrollTarget.addEventListener('scroll', clearInteraction, { passive: true });
    return () => {
      active = false;
      if (frame) window.cancelAnimationFrame(frame);
      scrollTarget.removeEventListener('scroll', clearInteraction);
    };
  }, [interactionIndex, scrollFocusEnabled]);

  useLayoutEffect(() => {
    const wrap = skillsWrapRef.current;
    const indicator = indicatorRef.current;
    if (!wrap || !indicator || !showSkillsBlock) return undefined;

    const elastic = indicator.dataset.pfReady === 'true' && !reduceMotion;
    const move = (animate: boolean) => {
      const buttons = wrap.querySelectorAll<HTMLElement>('.pf-about-portrait-skill-btn');
      const btn = buttons[safeActiveIndex];
      if (!btn) return;
      const wrapRect = wrap.getBoundingClientRect();
      const rect = btn.getBoundingClientRect();
      const inset = Math.max(7, rect.height * 0.14);
      gsap.to(indicator, {
        y: rect.top - wrapRect.top + inset,
        height: Math.max(18, rect.height - inset * 2),
        duration: animate ? 0.48 : 0,
        ease: ABOUT_PORTRAIT_SKILLS_INDICATOR_EASE,
        overwrite: 'auto',
      });
    };

    move(elastic);
    indicator.dataset.pfReady = 'true';

    const observer = new ResizeObserver(() => move(false));
    observer.observe(wrap);
    return () => observer.disconnect();
  }, [reduceMotion, safeActiveIndex, showSkillsBlock, visibleSkills.length]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const pin = pinRef.current;
    if (!root || !pin || reduceMotion) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const scroller = aboutBannerScrollParent(root);
    const skillCount = visibleSkills.length;
    const media = gsap.matchMedia();
    const ctx = gsap.context(() => {
      if (scrollFocusEnabled) {
        media.add('(min-width: 1024px)', () => {
          const navClearance = readPortfolioNavTopClearancePx() || 88;
          const runway = pin.querySelector<HTMLElement>('.pf-about-portrait-runway');
          ScrollTrigger.create({
            trigger: pin,
            ...(scroller ? { scroller } : {}),
            start: `top top+=${navClearance}`,
            end: () => `+=${runway?.offsetHeight || 0}`,
            scrub: 0.45,
            fastScrollEnd: true,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const next = Math.round(self.progress * (skillCount - 1));
              setScrollSkillIndex((prev) => (prev === next ? prev : next));
            },
          });
        });
      }

      const after = root.querySelector<HTMLElement>('.pf-about-portrait-after');
      if (after) {
        const title = after.querySelector<HTMLElement>('.pf-about-portrait-strengths-title');
        const badges = Array.from(
          after.querySelectorAll<HTMLElement>('.pf-about-portrait-badge-cell')
        );
        const cols = Array.from(
          after.querySelectorAll<HTMLElement>(
            '.pf-about-portrait-meta-col:not(.pf-about-portrait-meta-col--empty):not(.pf-about-portrait-meta-col--spacer)'
          )
        );
        const eduTitle = after.querySelector<HTMLElement>('.pf-about-portrait-education-title');
        const eduItems = Array.from(
          after.querySelectorAll<HTMLElement>('.pf-about-portrait-edu-item')
        );

        if (title) gsap.set(title, { autoAlpha: 0, y: 16 });
        if (badges.length) gsap.set(badges, { autoAlpha: 0, scale: 0.95 });
        if (cols.length) gsap.set(cols, { autoAlpha: 0, y: 15 });
        if (eduTitle) gsap.set(eduTitle, { autoAlpha: 0, y: 16 });
        if (eduItems.length) gsap.set(eduItems, { autoAlpha: 0, y: 15 });

        root.setAttribute('data-pf-after', 'active');
        setAfterMotion('active');

        const cascade = gsap.timeline({
          paused: true,
          defaults: { overwrite: 'auto' },
          onComplete: () => setAfterMotion('done'),
        });

        if (title) {
          cascade.to(title, { autoAlpha: 1, y: 0, duration: 0.55, ease: 'power3.out' }, 0);
        }
        if (badges.length) {
          cascade.to(
            badges,
            {
              autoAlpha: 1,
              scale: 1,
              duration: 0.36,
              stagger: 0.05,
              ease: 'power2.out',
            },
            title ? 0.08 : 0
          );
        }
        if (cols.length) {
          cascade.to(
            cols,
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.58,
              stagger: 0.08,
              ease: 'power2.out',
            },
            badges.length ? '>-0.04' : 0.06
          );
        }
        if (eduTitle) {
          cascade.to(
            eduTitle,
            { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power3.out' },
            badges.length || cols.length ? '>-0.1' : title ? 0.16 : 0
          );
        }
        if (eduItems.length) {
          cascade.to(
            eduItems,
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.48,
              stagger: 0.06,
              ease: 'power2.out',
            },
            eduTitle ? '>-0.06' : '>-0.04'
          );
        }

        ScrollTrigger.create({
          trigger: after,
          ...(scroller ? { scroller } : {}),
          start: 'top 82%',
          once: true,
          onEnter: () => cascade.play(),
        });

        if (cols.length) {
          ScrollTrigger.create({
            trigger: after,
            ...(scroller ? { scroller } : {}),
            start: 'bottom 22%',
            end: 'bottom -6%',
            scrub: 0.45,
            onUpdate: (self) => {
              if (cascade.progress() < 1) return;
              gsap.set(cols, { autoAlpha: 1 - self.progress });
            },
          });
        }

        const afterBox = after.getBoundingClientRect();
        const viewRoot = scroller ?? document.documentElement;
        const viewH =
          viewRoot instanceof HTMLElement ? viewRoot.clientHeight : window.innerHeight;
        if (afterBox.top < viewH * 0.88 && afterBox.bottom > 0) {
          cascade.play();
        }
      }
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
    const refreshLater = window.setTimeout(() => ScrollTrigger.refresh(), 480);
    return () => {
      window.clearTimeout(refreshId);
      window.clearTimeout(refreshLater);
      media.revert();
      ctx.revert();
    };
  }, [
    reduceMotion,
    scrollFocusEnabled,
    showAfterBlock,
    visibleEducation.length,
    visibleInterests.length,
    visibleLanguageItems.length,
    visibleSkills.length,
    visibleStrengths.length,
  ]);

  const portraitThemeStyle = {
    '--pf-about-portrait-ink': titleColor,
    '--pf-about-portrait-soft': subtitleColor,
    '--pf-about-portrait-muted': bodyColor,
    '--pf-about-portrait-fill': cardBg,
    '--pf-about-portrait-steps': String(Math.max(visibleSkills.length - 1, 0)),
  } as CSSProperties;

  const portraitPanelClass =
    'pf-about-portrait-portrait relative min-h-[18rem] w-full overflow-hidden sm:min-h-[22rem] lg:min-h-0';

  const portraitMedia = avatarSrc ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      {...mediaImageResponsive(avatarSrc, ABOUT_MEDIA_WIDTHS)}
      sizes={ABOUT_MEDIA_SIZES}
      alt={portraitName}
      className={infoPortraitImageClass(
        'pf-about-portrait-img block h-full w-full object-cover object-[50%_18%]',
        portraitGrayscale
      )}
    />
  ) : (
    <div
      className="pf-about-portrait-fallback flex h-full w-full items-center justify-center text-5xl font-semibold tracking-tight"
      style={{ backgroundColor: cardBg, color: bodyColor }}
    >
      {initials || '?'}
    </div>
  );

  const bioNode = (slot: 'desktop' | 'mobile') =>
    bioText ? (
      <motion.p
        key={`portrait-bio-${slot}`}
        className={`pf-about-portrait-bio pf-about-portrait-bio--${slot} ${bioClass}`}
        style={{ color: bodyColor }}
        data-pf-no-color-transition=""
        initial={reduceMotion ? false : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={aboutPortraitSkillsTween(reduceMotion, 0.82, bioDelay)}
      >
        {bioText}
      </motion.p>
    ) : null;

  return (
    <div
      ref={rootRef}
      className={`pf-about-portrait-root w-full ${contentStyles.content}`}
      data-portrait-enabled={portraitEnabled ? 'true' : 'false'}
      data-pf-entry={reduceMotion ? 'ready' : 'armed'}
      data-pf-after={reduceMotion || !showAfterBlock ? 'done' : afterMotion}
      style={portraitThemeStyle}
    >
      <section ref={pinRef} className="pf-about-portrait-pin">
        <div className="pf-about-portrait-sticky">
          <div className="pf-about-portrait-grid">
            <motion.p
              className="pf-about-portrait-kicker"
              style={{ color: bodyColor }}
              data-pf-no-color-transition=""
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={aboutPortraitSkillsTween(reduceMotion, 0.64, 0.08)}
            >
              {kickerText}
            </motion.p>

            <div className="pf-about-portrait-stage">
              {showSkillsBlock ? (
                <div ref={skillsWrapRef} className="pf-about-portrait-skills-wrap">
                  <span
                    ref={indicatorRef}
                    className="pf-about-portrait-indicator"
                    aria-hidden
                  />
                  <ul
                    className={`pf-about-portrait-skills${compactSkills ? ' pf-about-portrait-skills--compact' : ''}`}
                    role="list"
                    onMouseLeave={() => setInteractionIndex(null)}
                  >
                    {visibleSkills.map((skill, index) => {
                      const skillTitle = skill.title?.trim() || '';
                      const isActive = index === safeActiveIndex;
                      return (
                        <li
                          key={skill.id || `${skillTitle}-${index}`}
                          className="pf-about-portrait-skill"
                          style={{ ['--pf-about-portrait-i' as string]: index } as CSSProperties}
                        >
                          <button
                            type="button"
                            className={`pf-about-portrait-skill-btn ${
                              isActive ? 'is-active' : ''
                            } ${skillListClass}`}
                            onMouseEnter={() => activateSkill(index)}
                            onFocus={() => activateSkill(index)}
                            onClick={() => activateSkill(index)}
                            aria-pressed={isActive}
                          >
                            <span className={contentStyles.index} aria-hidden>{String(index+1).padStart(2,'0')}</span>
                            <span className="pf-about-portrait-skill-mask">
                              <motion.span
                                className="pf-about-portrait-skill-title"
                                style={{ fontFamily: 'inherit' }}
                                data-pf-no-color-transition=""
                                initial={reduceMotion ? false : { y: '108%' }}
                                animate={{ y: '0%' }}
                                transition={aboutPortraitSkillsTween(
                                  reduceMotion,
                                  0.92,
                                  0.26 + index * 0.078
                                )}
                              >
                                {skillTitle}
                              </motion.span>
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : (
                <motion.p
                  className={`pf-about-portrait-empty ${kickerClass}`}
                  style={{ color: bodyColor }}
                  data-pf-no-color-transition=""
                  initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 0.6, y: 0 }}
                  transition={aboutPortraitSkillsTween(reduceMotion, 0.7, 0.28)}
                >
                  {t('Ajoute des skills dans Creator Studio → Information.')}
                </motion.p>
              )}

            </div>

            {portraitEnabled ? <div className={portraitPanelClass}>
              <motion.div
                className="pf-about-portrait-clip"
                data-pf-no-color-transition=""
                initial={reduceMotion ? false : { clipPath: ABOUT_PORTRAIT_SKILLS_CLIP_START }}
                animate={{ clipPath: ABOUT_PORTRAIT_SKILLS_CLIP_END }}
                transition={aboutPortraitSkillsTween(
                  reduceMotion,
                  1.24,
                  0.06,
                  ABOUT_PORTRAIT_SKILLS_CLIP_EASE
                )}
                onAnimationStart={markEntryReady}
              >
                <motion.div
                  className="pf-about-portrait-shift"
                  data-pf-no-color-transition=""
                  initial={reduceMotion ? false : { scale: 1.08 }}
                  animate={{ scale: 1 }}
                  transition={aboutPortraitSkillsTween(reduceMotion, 1.4, 0.06)}
                >
                  <div className="pf-about-portrait-media" data-pf-no-color-transition="">
                    {portraitMedia}
                  </div>
                </motion.div>
              </motion.div>
            </div>

            : null}
            {bioNode('desktop')}
            {bioNode('mobile')}
          </div>
        </div>
        {scrollFocusEnabled ? (
          <div
            aria-hidden
            className="pf-about-portrait-runway"
            style={{ height: portraitSkillsRunwayHeight(visibleSkills.length) }}
          />
        ) : null}
      </section>

      {showAfterBlock ? (
        <div
          className="pf-about-portrait-after"
          data-pf-bento={showStrengthsBlock ? (showMetaBlock ? 'full' : 'bring-only') : 'meta-only'}
        >
          {showBentoBlock ? (
          <div className="pf-about-portrait-bento">
            {showStrengthsBlock ? (
              <section
                className="pf-about-portrait-strengths"
                data-pf-no-color-transition=""
              >
                <div className="pf-about-portrait-strengths-head">
                  <h3
                    className={`pf-about-portrait-strengths-title font-medium tracking-[-0.02em] ${strengthsTitleClass}`}
                    style={{ color: blockTitleColor }}
                  >
                    {ABOUT_VALUE_STEPS_SECTION_LABELS.strengths}
                  </h3>
                </div>
                <ul className="pf-about-portrait-bring-list" role="list">
                  {visibleStrengths.map((item, index) => (
                    <li
                      key={`${index}-${item}`}
                      className="pf-about-portrait-badge-cell pf-about-portrait-bring-item"
                      data-pf-no-color-transition=""
                    >
                      <span
                        className={`pf-about-portrait-bring-title font-medium tracking-[-0.015em] ${strengthsItemClass}`}
                        style={{ color: titleColor, fontFamily: 'inherit' }}
                      >
                        {item}
                      </span>
                      <svg
                        className="pf-about-portrait-bring-arrow"
                        viewBox="0 0 20 20"
                        fill="none"
                        aria-hidden
                      >
                        <path
                          d="M4 10h11.5M10 4.5L16 10l-6 5.5"
                          stroke="currentColor"
                          strokeWidth={1.5}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {showMetaBlock ? (
              <div
                className={`pf-about-portrait-meta ${
                  showStrengthsBlock ? '' : 'pf-about-portrait-meta--solo'
                }`}
                data-pf-no-color-transition=""
              >
                {showInterests && visibleInterests.length > 0 ? (
                  <div className="pf-about-portrait-meta-col pf-about-portrait-meta-col--interests">
                    <p className="pf-about-portrait-meta-kicker" style={{ color: blockTitleColor }}>
                      {ABOUT_PORTRAIT_SKILLS_INTERESTS_LABEL}
                    </p>
                    <p
                      className={`pf-about-portrait-meta-interests ${metaClass}`}
                      style={{ color: titleColor, fontFamily: 'inherit' }}
                    >
                      {`${visibleInterests.join(', ').replace(/[.]+$/u, '')}.`}
                    </p>
                  </div>
                ) : null}
                {showLanguages && visibleLanguageItems.length > 0 ? (
                  <div className="pf-about-portrait-meta-col pf-about-portrait-meta-col--languages">
                    <p className="pf-about-portrait-meta-kicker" style={{ color: blockTitleColor }}>
                      {ABOUT_PORTRAIT_SKILLS_LANGUAGES_LABEL}
                    </p>
                    <AboutPortraitLanguageList
                      items={visibleLanguageItems}
                      titleColor={titleColor}
                    />
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
          ) : null}

          {showEducationBlock ? (
            <section
              className={`pf-about-portrait-education ${
                showBentoBlock ? '' : 'pf-about-portrait-education--solo'
              }`}
              data-pf-no-color-transition=""
            >
              <div className="pf-about-portrait-education-head">
                <h3
                  className={`pf-about-portrait-education-title font-semibold tracking-[-0.02em] ${strengthsTitleClass}`}
                  style={{ color: blockTitleColor }}
                >
                  {ABOUT_VALUE_STEPS_SECTION_LABELS.education}
                </h3>
              </div>
              <ul className="pf-about-portrait-edu-list" role="list">
                {visibleEducation.map((entry, index) => (
                  <li
                    key={entry.id || `${entry.title}-${entry.schoolYear}-${index}`}
                    className="pf-about-portrait-edu-item"
                    data-pf-no-color-transition=""
                  >
                    <span className="pf-about-portrait-edu-heading">
                      {entry.title?.trim() ? (
                        <span
                          className={`pf-about-portrait-edu-title font-medium tracking-[-0.012em] ${strengthsItemClass}`}
                          style={{ color: titleColor, fontFamily: 'inherit' }}
                        >
                          {entry.title.trim()}
                        </span>
                      ) : null}
                    </span>
                    {entry.institution?.trim() || entry.schoolYear?.trim() ? (
                      <span className="pf-about-portrait-edu-meta">
                        {entry.institution?.trim() ? (
                          <span className="pf-about-portrait-edu-institution">
                            {entry.institution.trim()}
                          </span>
                        ) : null}
                        {entry.schoolYear?.trim() ? (
                          <span className="pf-about-portrait-edu-year">
                            {entry.schoolYear.trim()}
                          </span>
                        ) : null}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
