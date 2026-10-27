'use client';

import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import contentStyles from './portfolio-info-banner-content.module.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from 'framer-motion';
import { aboutBannerScrollParent, aboutBannerWatchEnter } from '@/components/portfolio/portfolio-about-scroll-utils';
import { type ProfileEducationEntry } from '@/types/profile';
import { aboutBannerBioSizeClass, aboutBannerContentSizeClass, aboutBannerMetaSizeClass, type PortfolioInfoPremiumFontSize, type PortfolioInfoBlockLabelColor, infoBlockLabelColor } from '@/components/portfolio/portfolio-info-settings';
import { type ProfileSkillEntry } from '@/lib/about-skills';
import { mediaImageResponsive } from '@/lib/media-image-url';
import { useT } from '@/lib/i18n/I18nProvider';
import { ABOUT_MEDIA_WIDTHS, ABOUT_MEDIA_SIZES, infoPortraitImageClass } from '@/components/portfolio/EditorialAboutMeCommon';
import { aboutClassicMuted } from '@/components/portfolio/EditorialAboutMeClassicLayout';

const ABOUT_BANNER_PORTRAIT_CLIP_START =
  'inset(14% 20% 10% 8% round 2.75rem 0.45rem 2.1rem 0.8rem)';
const ABOUT_BANNER_PORTRAIT_CLIP_END = 'inset(0% 0% 0% 0% round 0rem)';

const ABOUT_BANNER_LABEL_CLASS =
  'mb-5 text-sm font-medium tracking-normal sm:mb-6';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/** About · banner — strengths in quiet, aligned editorial rows. */
function AboutBannerStrengthsIntro({
  label,
  labelColor,
  strengthItems,
  textColor,
  bodyClass,
}: {
  label?: string;
  labelColor: string;
  strengthItems: string[];
  textColor: string;
  bodyClass: string;
}) {
  const visible = strengthItems.map((item) => item.trim()).filter(Boolean);
  if (visible.length === 0) return null;

  return (
    <section className="pf-about-banner-folio-child pf-about-banner-strengths">
      {label?.trim() ? (
        <p className={`${ABOUT_BANNER_LABEL_CLASS} text-left`} style={{ color: labelColor }}>
          {label.trim()}
        </p>
      ) : null}
      <ul className="pf-about-banner-strength-badges list-none">
        {visible.map((item, index) => (
          <li
            key={`${index}-${item}`}
            className="pf-about-banner-strength-badge-cell"
            data-pf-no-color-transition=""
          >
            <span
              className={`pf-about-banner-strength-badge font-medium tracking-[-0.018em] ${bodyClass}`}
              style={{ color: textColor }}
            >
              {item}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** About · banner — skills folio: uneven magazine columns, title / whisper description. */
function AboutBannerSkillsFooter({
  label,
  labelColor,
  skills,
  titleColor,
  bodyColor,
  bodyClass,
  descClass,
}: {
  label: string;
  labelColor: string;
  skills: ProfileSkillEntry[];
  titleColor: string;
  bodyColor: string;
  bodyClass: string;
  descClass: string;
}) {
  const visible = skills.filter((item) => item.title?.trim());
  if (visible.length === 0) return null;

  return (
    <section className="pf-about-banner-folio-child pf-about-banner-skills">
      <p className={ABOUT_BANNER_LABEL_CLASS} style={{ color: labelColor }}>
        {label}
      </p>

      <ul className="pf-about-banner-skills-grid list-none" data-count={String(visible.length)}>
        {visible.map((skill) => {
          const skillTitle = skill.title?.trim() || '';
          const skillDescription = skill.description?.trim() || '';
          return (
            <li
              key={skill.id}
              className="pf-about-banner-skill-cell min-w-0"
              data-pf-no-color-transition=""
            >
              <div className="pf-about-banner-skill min-w-0" data-pf-no-color-transition="">
                <p
                  className={`pf-about-banner-skill-title mb-4 font-medium leading-snug tracking-[-0.01em] sm:mb-5 ${bodyClass}`}
                  style={{ color: titleColor }}
                >
                  {skillTitle}
                </p>
                {skillDescription ? (
                  <p
                    className={`pf-about-banner-skill-desc leading-[1.65] ${descClass}`}
                    style={{ color: bodyColor }}
                  >
                    {skillDescription}
                  </p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** About · banner — education block below strengths (left-aligned). */
function AboutBannerEducationBlock({
  educationItems,
  showEducation,
  educationLabel,
  labelColor,
  textColor,
  bodyColor,
  bodyClass,
  metaClass,
}: {
  educationItems: ProfileEducationEntry[];
  showEducation: boolean;
  educationLabel: string;
  labelColor: string;
  textColor: string;
  bodyColor: string;
  bodyClass: string;
  metaClass: string;
}) {
  const visibleEducation = educationItems.filter(
    (entry) => entry.title?.trim() || entry.institution?.trim() || entry.schoolYear?.trim()
  );
  if (!showEducation || visibleEducation.length === 0) return null;

  return (
    <section className="pf-about-banner-education min-w-0 text-left">
      <p className={`${ABOUT_BANNER_LABEL_CLASS} text-left`} style={{ color: labelColor }}>
        {educationLabel}
      </p>
      <ol className="text-left">
        {visibleEducation.map((entry, index) => {
          const title = entry.title?.trim() || '';
          const institution = entry.institution?.trim() || '';
          const year = entry.schoolYear?.trim() || '';
          const headline = title || institution;
          const showInstitutionLine = Boolean(institution && title);

          return (
            <li
              key={entry.id || `${entry.title}-${entry.schoolYear}-${index}`}
              className="pf-about-banner-edu-item min-w-0"
            >
              <p className={`${contentStyles.year} ${metaClass}`} style={{ color: bodyColor }}>
                {year}
              </p>
              <div className={contentStyles.educationDetails}>
              {headline ? (
                <p
                  className={`font-medium leading-snug tracking-[-0.01em] ${bodyClass}`}
                  style={{ color: textColor }}
                >
                  {headline}
                </p>
              ) : null}
              {showInstitutionLine ? (
                <p className={`mt-1.5 leading-relaxed ${metaClass}`}>
                  {showInstitutionLine ? (
                    <span className="pf-about-banner-edu-institution" style={{ color: bodyColor }}>
                      {institution}
                    </span>
                  ) : null}
                </p>
              ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

/** About · banner — interests locked with education on the folio baseline. */
function AboutBannerInterestsBlock({
  interestItems,
  showInterests,
  interestsLabel,
  labelColor,
  textColor,
  bodyColor,
  bodyClass,
}: {
  interestItems: string[];
  showInterests: boolean;
  interestsLabel: string;
  labelColor: string;
  textColor: string;
  bodyColor: string;
  bodyClass: string;
}) {
  const visibleInterests = interestItems.map((item) => item.trim()).filter(Boolean);
  if (!showInterests || visibleInterests.length === 0) return null;

  return (
    <section className="pf-about-banner-interests min-w-0 text-left">
      <p className={`${ABOUT_BANNER_LABEL_CLASS} text-left`} style={{ color: labelColor }}>
        {interestsLabel}
      </p>
      <p
        className={`text-left leading-[1.85] tracking-[-0.01em] ${bodyClass}`}
        style={{ color: textColor }}
      >
        {visibleInterests.map((item, index) => (
          <span key={`${index}-${item}`}>
            {index > 0 ? (
              <span
                aria-hidden
                className="mx-2.5 select-none font-light sm:mx-3"
                style={{ color: bodyColor, opacity: 0.45 }}
              >
                /
              </span>
            ) : null}
            {item}
          </span>
        ))}
      </p>
    </section>
  );
}

/** About · banner — XXL centered headline, portrait bottom-left, bio bottom-right. */
export function AboutBannerLayout({
  title: _title,
  subtitle,
  bio,
  specialty: _specialty,
  avatarUrl,
  showPortrait = true,
  fullName,
  skillItems,
  showSkills,
  skillsLabel,
  strengthItems,
  showStrengths,
  strengthsLabel,
  educationItems,
  interestItems,
  showEducation,
  showInterests,
  educationLabel,
  interestsLabel,
  contentSize,
  skillsTitleColor,
  subtitleColor,
  bodyColor,
  cardBg,
  cardBorder,
  portraitGrayscale,
  blockLabelColor,
}: {
  title: string;
  subtitle: string;
  bio?: string | null;
  specialty?: string | null;
  avatarUrl?: string | null;
  /** Draw the portrait; off, the layout recomposes without it. */
  showPortrait?: boolean;
  fullName?: string | null;
  skillItems: ProfileSkillEntry[];
  showSkills: boolean;
  skillsLabel: string;
  strengthItems: string[];
  showStrengths: boolean;
  strengthsLabel?: string;
  educationItems: ProfileEducationEntry[];
  interestItems: string[];
  showEducation: boolean;
  showInterests: boolean;
  educationLabel: string;
  interestsLabel: string;
  contentSize: PortfolioInfoPremiumFontSize;
  skillsTitleColor: string;
  subtitleColor: string;
  bodyColor: string;
  cardBg: string;
  cardBorder: string;
  portraitGrayscale: boolean;
  blockLabelColor: PortfolioInfoBlockLabelColor;
}) {
  const t = useT();
  const labelColor = infoBlockLabelColor(blockLabelColor, aboutClassicMuted(bodyColor, 100));
  const bioText = bio?.trim() || subtitle?.trim() || '';
  const bioClass = aboutBannerBioSizeClass(contentSize);
  const bodyClass = aboutBannerContentSizeClass(contentSize);
  const metaClass = aboutBannerMetaSizeClass(contentSize);
  const showSkillsBlock = showSkills && skillItems.some((item) => item.title?.trim());
  const showStrengthsBlock = showStrengths && strengthItems.some((item) => item.trim());
  const showEducationBlock =
    showEducation &&
    educationItems.some(
      (entry) => entry.title?.trim() || entry.institution?.trim() || entry.schoolYear?.trim()
    );
  const showInterestsBlock =
    showInterests && interestItems.some((item) => item.trim());
  const showFolio =
    showSkillsBlock || showStrengthsBlock || showEducationBlock || showInterestsBlock;
  const showMetaLockup = showEducationBlock || showInterestsBlock;

  const reduceMotion = useReducedMotion();
  const [motionState, setMotionState] = useState<'armed' | 'active' | 'done'>('armed');
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || reduceMotion) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const scroller = aboutBannerScrollParent(root);
    const cover = root.querySelector<HTMLElement>('.pf-about-banner-cover');
    const lines = Array.from(root.querySelectorAll<HTMLElement>('.pf-about-banner-line-inner'));
    const portrait = root.querySelector<HTMLElement>('.pf-about-banner-portrait');
    const portraitShift = root.querySelector<HTMLElement>('.pf-about-banner-portrait-shift');
    const bio = root.querySelector<HTMLElement>('.pf-about-banner-bio');
    const skills = Array.from(root.querySelectorAll<HTMLElement>('.pf-about-banner-skill-cell'));
    const badges = Array.from(root.querySelectorAll<HTMLElement>('.pf-about-banner-strength-badge-cell'));
    const skillsSection = root.querySelector<HTMLElement>('.pf-about-banner-skills');
    const strengthsSection = root.querySelector<HTMLElement>('.pf-about-banner-strengths');
    const meta = root.querySelector<HTMLElement>('.pf-about-banner-folio-meta');
    const interestsShift = root.querySelector<HTMLElement>('.pf-about-banner-interests-shift');

    const stopWatchers: Array<() => void> = [];
    const media = gsap.matchMedia();

    const ctx = gsap.context(() => {
      if (cover) {
        if (lines.length) {
          gsap.set(lines, { y: '108%', clipPath: 'inset(100% 0 0 0)' });
        }
        if (portrait) {
          gsap.set(portrait, { clipPath: ABOUT_BANNER_PORTRAIT_CLIP_START });
        }
        if (portraitShift) {
          gsap.set(portraitShift, { scale: 1.1 });
        }
        if (bio) {
          gsap.set(bio, { x: 72, autoAlpha: 0 });
        }

        /* Kill CSS safety as soon as GSAP owns the nodes — do not wait for play(). */
        setMotionState('active');

        const coverIntro = gsap.timeline({
          paused: true,
          defaults: { ease: 'power2.out' },
          onComplete: () => setMotionState('done'),
        });

        if (lines.length) {
          coverIntro.to(
            lines,
            {
              y: '0%',
              clipPath: 'inset(0% 0 0 0)',
              duration: 0.98,
              stagger: 0.12,
            },
            0
          );
        }
        if (portrait) {
          coverIntro.to(
            portrait,
            { clipPath: ABOUT_BANNER_PORTRAIT_CLIP_END, duration: 1.2 },
            0.22
          );
        }
        if (portraitShift) {
          coverIntro.to(portraitShift, { scale: 1, duration: 1.28 }, 0.22);
        }
        if (bio) {
          coverIntro.to(bio, { x: 0, autoAlpha: 1, duration: 0.95 }, 0.38);
        }

        stopWatchers.push(
          aboutBannerWatchEnter(cover, scroller, () => {
            coverIntro.play();
          })
        );
      }

      if (skills.length && skillsSection) {
        gsap.set(skills, { y: 36, autoAlpha: 0 });
        const skillsIntro = gsap.to(skills, {
          y: 0,
          autoAlpha: 1,
          duration: 0.85,
          stagger: 0.12,
          ease: 'power2.out',
          paused: true,
        });
        stopWatchers.push(
          aboutBannerWatchEnter(skillsSection, scroller, () => {
            skillsIntro.play();
          })
        );
      }

      if (badges.length && strengthsSection) {
        gsap.set(badges, { autoAlpha: 0, scale: 0.9, transformOrigin: '50% 50%' });
        const badgesIntro = gsap.to(badges, {
          autoAlpha: 1,
          scale: 1,
          duration: 0.5,
          stagger: 0.05,
          ease: 'power2.out',
          paused: true,
        });
        stopWatchers.push(
          aboutBannerWatchEnter(strengthsSection, scroller, () => {
            badgesIntro.play();
          })
        );
      }

      media.add('(min-width: 1024px)', () => {
        if (!meta || !interestsShift) return undefined;
        gsap.fromTo(
          interestsShift,
          { y: 0, autoAlpha: 1 },
          {
            y: () => -Math.round(Math.max(48, meta.offsetHeight * 0.25)),
            autoAlpha: 0,
            ease: 'none',
            scrollTrigger: {
              trigger: meta,
              ...(scroller ? { scroller } : {}),
              start: 'top 80%',
              end: 'bottom top',
              scrub: 0.7,
              invalidateOnRefresh: true,
            },
          }
        );
        return undefined;
      });
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
      stopWatchers.forEach((stop) => stop());
      media.revert();
      ctx.revert();
    };
  }, [
    reduceMotion,
    showSkillsBlock,
    showStrengthsBlock,
    showMetaLockup,
    showEducationBlock,
    showInterestsBlock,
    skillItems.length,
    strengthItems.length,
  ]);

  const motionMode = reduceMotion ? 'reduce' : motionState;

  const initials = (fullName ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  const portraitName = fullName?.trim() || 'Profile';

  return (
    <div
      ref={rootRef}
      className={`pf-about-banner relative z-[1] w-full ${contentStyles.content}`}
      style={{ '--banner-detail-border': cardBorder } as CSSProperties}
      data-pf-motion={motionMode}
    >
      <div className="pf-about-banner-cover flex w-full flex-col pt-8 sm:pt-10 lg:pt-14">
        {/* Phones stack portrait over bio (a 13rem portrait left a 47px bio column); wider
            screens put the bio beside it, with a larger portrait from 1024px. */}
        <div
          className={`pf-about-banner-pair grid grid-cols-1 items-start gap-y-8 ${
            showPortrait ? 'sm:items-center sm:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] lg:grid-cols-[minmax(0,21rem)_minmax(0,1fr)]' : ''
          }`}
        >
          {showPortrait ? (
          <div className="pf-about-banner-portrait-frame max-w-[13rem] sm:max-w-none">
            <div
              className="pf-about-banner-portrait aspect-[3/4] w-full overflow-hidden"
              style={{ backgroundColor: cardBg }}
              data-pf-no-color-transition=""
            >
              <div
                className="pf-about-banner-portrait-shift h-full w-full"
                data-pf-no-color-transition=""
              >
                <div
                  className="pf-about-banner-portrait-zoom h-full w-full"
                  data-pf-no-color-transition=""
                >
                  {avatarUrl?.trim() ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      {...mediaImageResponsive(avatarUrl.trim(), ABOUT_MEDIA_WIDTHS)}
                      sizes={ABOUT_MEDIA_SIZES}
                      alt={portraitName}
                      className={infoPortraitImageClass(
                        'pf-about-banner-portrait-img block h-full w-full object-cover object-[50%_18%]',
                        portraitGrayscale
                      )}
                    />
                  ) : (
                    <div
                      className="flex h-full w-full items-center justify-center text-3xl font-semibold tracking-tight"
                      style={{ color: bodyColor }}
                    >
                      {initials || '?'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          ) : null}

          <div className={`pf-about-banner-bio-slot min-w-0 ${showPortrait ? '' : 'max-w-4xl'}`}>
            <blockquote
              className={`pf-about-banner-bio leading-[1.65] ${bioClass}`}
              style={{
                color: bodyColor,
                borderColor: cardBorder,
                fontFamily: 'inherit',
              }}
              data-pf-no-color-transition=""
            >
              {bioText ? (
                bioText
              ) : (
                <span className="opacity-60">{t('Add a bio in Creator Studio → Information.')}</span>
              )}
            </blockquote>
          </div>
        </div>
      </div>

      {showFolio ? (
        <div
          className="pf-about-banner-folio"
          style={{ borderColor: cardBorder }}
        >
          {showSkillsBlock ? (
            <AboutBannerSkillsFooter
              label={skillsLabel}
              labelColor={labelColor}
              skills={skillItems}
              titleColor={skillsTitleColor}
              bodyColor={bodyColor}
              bodyClass={bodyClass}
              descClass={metaClass}
            />
          ) : null}

          {showStrengthsBlock ? (
            <AboutBannerStrengthsIntro
              label={strengthsLabel}
              labelColor={labelColor}
              strengthItems={strengthItems}
              textColor={subtitleColor}
              bodyClass={bodyClass}
            />
          ) : null}

          {showMetaLockup ? (
            <div className="pf-about-banner-folio-child pf-about-banner-folio-meta">
              <AboutBannerEducationBlock
                educationItems={educationItems}
                showEducation={showEducation}
                educationLabel={educationLabel}
                labelColor={labelColor}
                textColor={subtitleColor}
                bodyColor={bodyColor}
                bodyClass={bodyClass}
                metaClass={metaClass}
              />
              {showInterestsBlock ? (
                <div
                  className="pf-about-banner-interests-shift"
                  data-pf-no-color-transition=""
                >
                  <AboutBannerInterestsBlock
                    interestItems={interestItems}
                    showInterests={showInterests}
                    interestsLabel={interestsLabel}
                    labelColor={labelColor}
                    textColor={subtitleColor}
                    bodyColor={bodyColor}
                    bodyClass={bodyClass}
                  />
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
