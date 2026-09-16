'use client';

import type { CSSProperties, ReactNode } from 'react';
import {
  sectionBackgroundStyle,
  hasOpaqueSectionBackground,
  type PortfolioSectionBackgroundSettings,
} from '@/components/portfolio/portfolio-section-background-settings';
import { portfolioNavTopScrollMarginClass } from '@/components/portfolio/portfolio-nav-top-clearance';

export function PortfolioSectionShell({
  id,
  className,
  background,
  fitContent = false,
  suppressBackground = false,
  topSpacingClass = 'pt-12 sm:pt-16 lg:pt-20',
  topSpacingStyle,
  bottomSpacingClass = 'pb-12 sm:pb-16 lg:pb-20',
  bottomSpacingStyle,
  header,
  children,
}: {
  id?: string;
  className?: string;
  background?: PortfolioSectionBackgroundSettings;
  fitContent?: boolean;
  /** When a global solid page color is active, sections without their own fill stay clear so that color shows through. An enabled section background always paints on top. */
  suppressBackground?: boolean;
  /** Global padding-top above the section title — same for every section after the hero. */
  topSpacingClass?: string;
  /** Optional CSS vars / overrides for top spacing. */
  topSpacingStyle?: CSSProperties;
  /** Global padding-bottom below section content — mirrors top spacing presets. */
  bottomSpacingClass?: string;
  /** Optional CSS vars / overrides for bottom spacing. */
  bottomSpacingStyle?: CSSProperties;
  /** Section title block — kept outside item motion so sticky title behavior still works. */
  header?: ReactNode;
  children: ReactNode;
}) {
  const bgStyle =
    !suppressBackground && background?.sectionBackgroundEnabled
      ? sectionBackgroundStyle(background)
      : undefined;
  const hasBackground = Boolean(bgStyle);
  const fullyOpaque = !suppressBackground && hasOpaqueSectionBackground(background);

  const paddingClass = `${topSpacingClass} ${bottomSpacingClass}`;

  return (
    <section
      id={id}
      style={{ ...topSpacingStyle, ...bottomSpacingStyle }}
      className={`relative isolate ${portfolioNavTopScrollMarginClass()} ${paddingClass} ${className ?? ''}`}
    >
      {bgStyle ? (
        <>
          {fullyOpaque ? (
            <div
              aria-hidden
              className="pf-theme-layer pointer-events-none absolute inset-0 left-1/2 z-0 w-screen -translate-x-1/2"
              style={{
                backgroundColor:
                  background?.sectionBackgroundColor?.trim() ||
                  background?.sectionBackgroundGradientFrom?.trim() ||
                  '#ffffff',
              }}
            />
          ) : null}
          <div
            aria-hidden
            className="pf-theme-layer pointer-events-none absolute inset-0 left-1/2 z-0 w-screen -translate-x-1/2"
            style={bgStyle}
          />
        </>
      ) : null}

      {header ? <div className="relative z-[1] min-w-0 w-full">{header}</div> : null}
      <div className="relative z-[1] min-w-0 w-full">{children}</div>
    </section>
  );
}
