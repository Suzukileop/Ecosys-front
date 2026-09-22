'use client';

import { useRef, useEffect } from 'react';
import type { PortfolioExperiencePresentationSettings } from '@/components/portfolio/portfolio-experience-settings';
import {
  DEFAULT_EXPERIENCE_MUTED_COLOR,
  DEFAULT_EXPERIENCE_MUTED_COLOR_DARK,
  DEFAULT_EXPERIENCE_PRESENTATION,
  DEFAULT_EXPERIENCE_TITLE_COLOR,
  DEFAULT_EXPERIENCE_TITLE_COLOR_DARK,
  ensureExperienceInkContrast,
  normalizeExperienceElementStyles,
  resolveExperienceColorMode,
  resolveExperienceTextColor,
} from '@/components/portfolio/portfolio-experience-settings';

/**
 * Loft design header — Editorial split heading: title left, "Experience" label right.
 * Fixed shape now — the old per-field heading/label text/style/position and scroll-linked
 * slide/fade controls were removed (unused customization surface, and the scroll listener
 * added weight for no visible benefit). Only the load-in reveal stays configurable.
 */
export function ExperienceLoftHeader({
  presentation: presentationProp,
}: {
  presentation?: PortfolioExperiencePresentationSettings;
}) {
  const presentation: PortfolioExperiencePresentationSettings = {
    ...(presentationProp ?? DEFAULT_EXPERIENCE_PRESENTATION),
    experienceDesign: 'loft',
  };

  const titleRef = useRef<HTMLHeadingElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  const isDark = presentation.activeColorMode !== 'light';
  const colorMode = resolveExperienceColorMode(presentation);
  const styles = normalizeExperienceElementStyles(presentation.elementStyles);

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

  const animationsEnabled = presentation.loftHeaderAnimationEnabled !== false;

  // Load-in entry reveal only — title rises from a mask, label fades in from the right.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const title = titleRef.current;
    const label = labelRef.current;

    if (!animationsEnabled) {
      if (title) {
        title.style.opacity = '1';
        title.style.transform = 'translateY(0)';
      }
      if (label) {
        label.style.opacity = '1';
        label.style.transform = 'translateX(0)';
      }
      return;
    }

    const timers: ReturnType<typeof setTimeout>[] = [];
    if (title) {
      const t = setTimeout(() => {
        title.style.transition =
          'opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1), transform 0.9s cubic-bezier(0.22, 1, 0.36, 1)';
        title.style.opacity = '1';
        title.style.transform = 'translateY(0)';
      }, 150);
      timers.push(t);
    }
    if (label) {
      const t = setTimeout(() => {
        label.style.transition =
          'opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1), transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)';
        label.style.opacity = '1';
        label.style.transform = 'translateX(0)';
      }, 400);
      timers.push(t);
    }
    return () => timers.forEach(clearTimeout);
  }, [animationsEnabled]);

  const initialOpacity = animationsEnabled ? 0 : 1;
  const initialTitleTransform = animationsEnabled ? 'translateY(100%)' : 'translateY(0)';
  const initialLabelTransform = animationsEnabled ? 'translateX(20px)' : 'translateX(0)';

  return (
    <div className="mb-14 sm:mb-20" data-experience-header="loft">
      <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-4">
        <div className="overflow-hidden">
          <h2
            ref={titleRef}
            className="max-w-4xl text-[clamp(2.75rem,7.5vw,5.5rem)] font-normal leading-[1.06] tracking-tight"
            style={{ color: ink, opacity: initialOpacity, transform: initialTitleTransform }}
          >
            Roles I&apos;ve taken on
          </h2>
        </div>
        <span
          ref={labelRef}
          className="whitespace-nowrap text-[0.7rem] font-medium uppercase"
          style={{
            color: muted,
            letterSpacing: '0.14em',
            opacity: initialOpacity,
            transform: initialLabelTransform,
          }}
        >
          Experience
        </span>
      </div>
    </div>
  );
}
