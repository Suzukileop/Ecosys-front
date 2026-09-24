'use client';

import { Fragment, useLayoutEffect, useRef, type CSSProperties, type RefObject } from 'react';
import { useReducedMotion } from 'framer-motion';
import gsap from 'gsap';
import type { LanguageProficiencyLevel, ProfileEducationEntry, ProfileSkillEntry } from '@/types/ecosystem';
import {
  noirBodySizeClass,
  noirHeadingSizeClass,
  noirLanguageAcronymSizeClass,
  type PortfolioInfoPremiumFontSize,
} from '@/components/portfolio/portfolio-info-settings';
import { terminalLanguageCode } from '@/components/portfolio/EditorialAboutMeNoirLayouts';
import { resolveSpokenLanguageLevelLabel } from '@/lib/spoken-languages';
import {
  aboutBannerScrollParent,
  aboutBannerWatchEnter,
} from '@/components/portfolio/portfolio-about-scroll-utils';

type LanguageDisplayItem = {
  name: string;
  level?: LanguageProficiencyLevel | null;
};

function joinWithAnd(items: string[]): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

/**
 * Per-row scroll reveal: divider draws in, the index number counts up, the tag
 * slides in, then the row's own content cascades — name mask, keyword words,
 * language blocks, or catalogue rows, whichever the row contains.
 */
function useIndexGsapReveal(rootRef: RefObject<HTMLDivElement | null>, motionOff: boolean) {
  useLayoutEffect(() => {
    const node = rootRef.current;
    if (!node) return undefined;
    node.setAttribute('data-pf-js', 'true');
    if (motionOff) {
      node.setAttribute('data-pf-entry', 'static');
      return undefined;
    }

    const scroller = aboutBannerScrollParent(node);
    const stopWatchers: Array<() => void> = [];

    const ctx = gsap.context(() => {
      const rows = Array.from(node.querySelectorAll<HTMLElement>('.pf-about-index-row'));

      rows.forEach((row) => {
        const divider =
          row.previousElementSibling instanceof HTMLElement &&
          row.previousElementSibling.classList.contains('pf-about-index-divider')
            ? row.previousElementSibling
            : null;
        const tag = row.querySelector<HTMLElement>('.pf-about-index-tag');
        const tagNum = row.querySelector<HTMLElement>('.pf-about-index-tag-num');
        const nameInner = row.querySelector<HTMLElement>('.pf-about-index-name-inner');
        const reveals = Array.from(row.querySelectorAll<HTMLElement>('.pf-about-index-reveal'));
        const keywords = Array.from(row.querySelectorAll<HTMLElement>('.pf-about-index-keyword'));
        const langs = Array.from(row.querySelectorAll<HTMLElement>('.pf-about-index-lang'));
        const catalogRows = Array.from(
          row.querySelectorAll<HTMLElement>('.pf-about-index-catalog-row')
        );

        if (divider) gsap.set(divider, { scaleX: 0, transformOrigin: 'left center' });
        if (tag) gsap.set(tag, { autoAlpha: 0, x: -10 });
        if (nameInner) gsap.set(nameInner, { yPercent: 110 });
        if (reveals.length) gsap.set(reveals, { autoAlpha: 0, y: 14 });
        if (keywords.length) gsap.set(keywords, { autoAlpha: 0, y: 8 });
        if (langs.length) {
          gsap.set(langs, { autoAlpha: 0, y: 20, scale: 0.9, transformOrigin: '0% 100%' });
        }
        if (catalogRows.length) gsap.set(catalogRows, { autoAlpha: 0, y: 14 });

        const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } });

        if (divider) tl.to(divider, { scaleX: 1, duration: 0.85 }, 0);
        if (tag) tl.to(tag, { autoAlpha: 1, x: 0, duration: 0.5 }, 0.08);
        if (tagNum) {
          const target = Number(tagNum.dataset.target ?? '0');
          const counter = { val: 0 };
          tl.to(
            counter,
            {
              val: target,
              duration: 0.55,
              ease: 'power1.out',
              onUpdate: () => {
                tagNum.textContent = String(Math.round(counter.val)).padStart(2, '0');
              },
              onComplete: () => {
                tagNum.textContent = String(target).padStart(2, '0');
              },
            },
            0.08
          );
        }
        if (nameInner) {
          tl.to(nameInner, { yPercent: 0, duration: 0.95, ease: 'power4.out' }, 0.16);
        }
        if (reveals.length) {
          tl.to(reveals, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.1 }, nameInner ? 0.4 : 0.2);
        }
        if (keywords.length) {
          tl.to(keywords, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.035 }, 0.24);
        }
        if (langs.length) {
          tl.to(
            langs,
            { autoAlpha: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.1, ease: 'back.out(1.6)' },
            0.22
          );
        }
        if (catalogRows.length) {
          tl.to(catalogRows, { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.08 }, 0.2);
        }

        stopWatchers.push(aboutBannerWatchEnter(row, scroller, () => tl.play()));
      });
    }, node);

    return () => {
      stopWatchers.forEach((stop) => stop());
      ctx.revert();
    };
  }, [rootRef, motionOff]);
}

function IndexTag({ index, label, bodyColor }: { index: number; label: string; bodyColor: string }) {
  return (
    <span
      className="pf-about-index-tag block font-mono text-xs font-medium uppercase tracking-[0.28em] sm:text-sm"
      style={{ color: bodyColor, opacity: 0.55 }}
    >
      [ <span className="pf-about-index-tag-num" data-target={index}>{String(index).padStart(2, '0')}</span>{' '}
      / {label} ]
    </span>
  );
}

function IndexDivider({ cardBorder }: { cardBorder: string }) {
  return (
    <div
      className="pf-about-index-divider my-14 border-t sm:my-16"
      style={{ borderColor: cardBorder }}
      aria-hidden
    />
  );
}

function IndexRow({
  indexNumber,
  label,
  bodyColor,
  children,
}: {
  indexNumber: number;
  label: string;
  bodyColor: string;
  children: React.ReactNode;
}) {
  return (
    <section className="pf-about-index-row grid grid-cols-12 gap-x-6 gap-y-4">
      <div className="col-span-12 md:col-span-4">
        <IndexTag index={indexNumber} label={label} bodyColor={bodyColor} />
      </div>
      <div className="col-span-12 md:col-span-8">{children}</div>
    </section>
  );
}

/** Plain-text keyword line — hovering one word dims its siblings and brightens the word. */
function KeywordRow({
  items,
  bodyColor,
  subtitleColor,
  cardBorder,
}: {
  items: string[];
  bodyColor: string;
  subtitleColor: string;
  cardBorder: string;
}) {
  if (items.length === 0) return null;
  return (
    <p
      className="pf-about-index-keywords text-xl font-light leading-relaxed sm:text-2xl"
      style={
        {
          '--pf-about-index-muted': bodyColor,
          '--pf-about-index-bright': subtitleColor,
        } as CSSProperties
      }
    >
      {items.map((item, index) => (
        <Fragment key={`${item}-${index}`}>
          <span className="pf-about-index-keyword cursor-default">{item}</span>
          {index < items.length - 1 ? (
            <span className="mx-2" style={{ color: cardBorder }}>
              /
            </span>
          ) : null}
        </Fragment>
      ))}
    </p>
  );
}

function LanguageBlock({
  name,
  level,
  acronymClass,
  subtitleColor,
  bodyColor,
}: {
  name: string;
  level?: LanguageProficiencyLevel | null;
  acronymClass: string;
  subtitleColor: string;
  bodyColor: string;
}) {
  const code = terminalLanguageCode(name);
  const levelLabel = level ? resolveSpokenLanguageLevelLabel(level) : null;
  return (
    <div className="pf-about-index-lang flex items-baseline gap-3">
      <span className={`font-black tracking-tighter ${acronymClass}`} style={{ color: subtitleColor }}>
        {code}
      </span>
      <span
        className="whitespace-nowrap text-xs uppercase tracking-[0.22em] sm:text-sm"
        style={{ color: bodyColor, opacity: 0.65 }}
      >
        {name}
        {levelLabel ? ` / ${levelLabel}` : ''}
      </span>
    </div>
  );
}

function CatalogRow({
  left,
  right,
  bodyColor,
  subtitleColor,
  cardBorder,
}: {
  left: string;
  right: string;
  bodyColor: string;
  subtitleColor: string;
  cardBorder: string;
}) {
  if (!right.trim()) return null;
  return (
    <div
      className="pf-about-index-catalog-row grid grid-cols-12 gap-x-4 gap-y-1 border-b py-4 first:pt-0 last:border-b-0 last:pb-0"
      style={{ borderColor: `color-mix(in srgb, ${cardBorder} 60%, transparent)` }}
    >
      <span
        className="col-span-12 text-base sm:col-span-4 sm:text-lg"
        style={{ color: bodyColor, opacity: 0.65 }}
      >
        {left}
      </span>
      <span className="col-span-12 text-base sm:col-span-8 sm:text-lg" style={{ color: subtitleColor }}>
        {right}
      </span>
    </div>
  );
}

/** Brutalist-chic / Swiss editorial — asymmetric 12-col grid, index-numbered sections, no cards. */
export function AboutIndexEditorialLayout({
  title,
  subtitle,
  fullName,
  bio,
  educationItems,
  skillItems,
  strengthItems,
  interestItems,
  toolItems,
  languageItems,
  showEducation,
  showSkills,
  showStrengths,
  showInterests,
  showLanguages,
  showSystemsTools,
  contentSize = 'medium',
  accent,
  subtitleColor,
  bodyColor,
  cardBorder,
  className,
}: {
  title: string;
  subtitle?: string | null;
  fullName?: string | null;
  bio?: string | null;
  educationItems: ProfileEducationEntry[];
  skillItems: ProfileSkillEntry[];
  strengthItems: string[];
  interestItems: string[];
  toolItems: string[];
  languageItems: LanguageDisplayItem[];
  showEducation: boolean;
  showSkills: boolean;
  showStrengths: boolean;
  showInterests: boolean;
  showLanguages: boolean;
  showSystemsTools: boolean;
  contentSize?: PortfolioInfoPremiumFontSize;
  accent: string;
  subtitleColor: string;
  bodyColor: string;
  cardBorder: string;
  className?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const reduceMotion = Boolean(useReducedMotion());
  useIndexGsapReveal(rootRef, reduceMotion);

  const headerLabel = fullName?.trim() || title.trim();
  const roleLabel = subtitle?.trim() || '';
  const bioText = bio?.trim() ?? '';

  const visibleSkills = skillItems.map((item) => item.title?.trim()).filter((v): v is string => Boolean(v));
  const visibleStrengths = strengthItems.map((item) => item.trim()).filter(Boolean);
  const visibleInterests = interestItems.map((item) => item.trim()).filter(Boolean);
  const visibleTools = toolItems.map((item) => item.trim()).filter(Boolean);
  const visibleEducation = educationItems.filter(
    (entry) => entry.title?.trim() || entry.institution?.trim() || entry.schoolYear?.trim()
  );

  const showSkillsBlock = showSkills && visibleSkills.length > 0;
  const showStrengthsBlock = showStrengths && visibleStrengths.length > 0;
  const showSkillsSection = showSkillsBlock || showStrengthsBlock;
  const showInterestsBlock = showInterests && visibleInterests.length > 0;
  const showLanguagesBlock = showLanguages && languageItems.length > 0;
  const showToolsBlock = showSystemsTools && visibleTools.length > 0;
  const showEducationBlock = showEducation && visibleEducation.length > 0;
  const showIndexSection = showEducationBlock || showToolsBlock;

  const headingClass = noirHeadingSizeClass(contentSize);
  const bodyClass = noirBodySizeClass(contentSize);
  const acronymClass = noirLanguageAcronymSizeClass(contentSize);

  let sectionIndex = 1;

  return (
    <div ref={rootRef} className={`pf-about-index relative w-full${className ? ` ${className}` : ''}`}>
      <IndexRow indexNumber={sectionIndex++} label="Profile" bodyColor={bodyColor}>
        <div className="space-y-6">
          <div>
            <h2 className={`font-light tracking-tight ${headingClass}`} style={{ color: subtitleColor }}>
              <span className="pf-about-index-name-mask block overflow-hidden">
                <span className="pf-about-index-name-inner block">{headerLabel}</span>
              </span>
            </h2>
            {roleLabel ? (
              <p
                className="pf-about-index-reveal mt-3 text-sm uppercase tracking-[0.2em]"
                style={{ color: accent }}
              >
                {roleLabel}
              </p>
            ) : null}
          </div>
          {bioText ? (
            <p
              className={`pf-about-index-reveal font-light ${bodyClass}`}
              style={{ color: bodyColor, opacity: 0.88 }}
            >
              {bioText}
            </p>
          ) : null}
        </div>
      </IndexRow>

      {showSkillsSection ? (
        <>
          <IndexDivider cardBorder={cardBorder} />
          <IndexRow indexNumber={sectionIndex++} label="Skills" bodyColor={bodyColor}>
            <div className="space-y-8">
              {showSkillsBlock ? (
                <div className="space-y-3">
                  <p
                    className="text-sm font-semibold uppercase tracking-[0.18em]"
                    style={{ color: bodyColor, opacity: 0.5 }}
                  >
                    Core skills
                  </p>
                  <KeywordRow
                    items={visibleSkills}
                    bodyColor={bodyColor}
                    subtitleColor={subtitleColor}
                    cardBorder={cardBorder}
                  />
                </div>
              ) : null}
              {showStrengthsBlock ? (
                <div className="space-y-3">
                  <p
                    className="text-sm font-semibold uppercase tracking-[0.18em]"
                    style={{ color: bodyColor, opacity: 0.5 }}
                  >
                    Strengths
                  </p>
                  <KeywordRow
                    items={visibleStrengths}
                    bodyColor={bodyColor}
                    subtitleColor={subtitleColor}
                    cardBorder={cardBorder}
                  />
                </div>
              ) : null}
            </div>
          </IndexRow>
        </>
      ) : null}

      {showLanguagesBlock ? (
        <>
          <IndexDivider cardBorder={cardBorder} />
          <IndexRow indexNumber={sectionIndex++} label="Languages" bodyColor={bodyColor}>
            <div className="flex flex-wrap items-baseline gap-x-12 gap-y-8">
              {languageItems.map((lang) => (
                <LanguageBlock
                  key={lang.name}
                  name={lang.name}
                  level={lang.level}
                  acronymClass={acronymClass}
                  subtitleColor={subtitleColor}
                  bodyColor={bodyColor}
                />
              ))}
            </div>
          </IndexRow>
        </>
      ) : null}

      {showIndexSection ? (
        <>
          <IndexDivider cardBorder={cardBorder} />
          <IndexRow indexNumber={sectionIndex++} label="Index" bodyColor={bodyColor}>
            <div>
              {showEducationBlock
                ? visibleEducation.map((entry) => (
                    <CatalogRow
                      key={entry.id || `${entry.schoolYear}-${entry.title}-${entry.institution}`}
                      left={entry.schoolYear?.trim() || '—'}
                      right={[entry.title?.trim(), entry.institution?.trim()].filter(Boolean).join(' — ')}
                      bodyColor={bodyColor}
                      subtitleColor={subtitleColor}
                      cardBorder={cardBorder}
                    />
                  ))
                : null}
              {showToolsBlock ? (
                <CatalogRow
                  left="Systems & tools"
                  right={visibleTools.join(' · ')}
                  bodyColor={bodyColor}
                  subtitleColor={subtitleColor}
                  cardBorder={cardBorder}
                />
              ) : null}
            </div>
          </IndexRow>
        </>
      ) : null}

      {showInterestsBlock ? (
        <>
          <IndexDivider cardBorder={cardBorder} />
          <IndexRow indexNumber={sectionIndex++} label="Notes" bodyColor={bodyColor}>
            <p
              className="pf-about-index-reveal max-w-2xl font-serif text-xl italic leading-relaxed sm:text-2xl"
              style={{ color: bodyColor, opacity: 0.85 }}
            >
              Also into {joinWithAnd(visibleInterests)}.
            </p>
          </IndexRow>
        </>
      ) : null}
    </div>
  );
}
