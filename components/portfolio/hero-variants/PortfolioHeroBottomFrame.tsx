'use client';

import type { PortfolioHeroPresentationSettings } from '@/components/portfolio/portfolio-hero-settings';
import type { PortfolioHeroPortraitIdentityBottomGap } from '@/components/portfolio/portfolio-hero-banner-settings';
import {
  DEFAULT_HERO_PALETTE,
  mergeHeroPalette,
  resolveHeroPaletteColor,
} from '@/components/portfolio/portfolio-hero-palette-settings';
import {
  DEFAULT_CONTENT_GUTTER,
  portfolioHeroContentShellClass,
  type PortfolioContentGutter,
} from '@/components/portfolio/portfolio-editorial-layout';

function bottomFrameMaxWidth(width: 'medium' | 'large' | 'full'): string {
  if (width === 'medium') return '36rem';
  if (width === 'large') return '52rem';
  return '100%';
}

function bottomFrameAlignClass(align: 'left' | 'center' | 'right'): string {
  if (align === 'center') return 'ml-auto mr-auto';
  if (align === 'right') return 'ml-auto mr-0';
  return 'ml-0 mr-auto';
}

function bottomFrameGapClass(gap: PortfolioHeroPortraitIdentityBottomGap): string {
  switch (gap) {
    case 'tight':
      return 'pb-8 pt-6 md:pb-10 md:pt-8';
    case 'large':
      return 'pb-12 pt-24 md:pb-14 md:pt-36 lg:pt-44';
    case 'xlarge':
      return 'pb-14 pt-36 md:pb-16 md:pt-52 lg:pt-64';
    case 'medium':
    default:
      return 'pb-10 pt-16 md:pb-12 md:pt-24';
  }
}

export function heroBottomFrameHasContent(
  presentation: Pick<
    PortfolioHeroPresentationSettings,
    'heroPortraitIdentityBottomText' | 'heroPortraitIdentityBottomLabel'
  >
): boolean {
  const text = presentation.heroPortraitIdentityBottomText?.trim() || '';
  const label = presentation.heroPortraitIdentityBottomLabel?.trim() || '';
  return text.length > 0 || label.length > 0;
}

/**
 * Shared free-text frame under any Hero banner design.
 * Hidden when both label and text are empty.
 * Side inset follows Global content gutter only (no extra internal padding).
 */
export function PortfolioHeroBottomFrame({
  presentation,
  contentGutter = DEFAULT_CONTENT_GUTTER,
  contentWidthClass,
}: {
  presentation: PortfolioHeroPresentationSettings;
  contentGutter?: PortfolioContentGutter;
  contentWidthClass?: string;
}) {
  const bottomText = presentation.heroPortraitIdentityBottomText?.trim() || '';
  const bottomLabel = presentation.heroPortraitIdentityBottomLabel?.trim() || '';
  if (!bottomText && !bottomLabel) return null;

  const palette = mergeHeroPalette(DEFAULT_HERO_PALETTE, presentation.palette);
  const fond = resolveHeroPaletteColor(palette, 'fond');
  const ink = resolveHeroPaletteColor(palette, 'texteFort');
  const muted = resolveHeroPaletteColor(palette, 'texteMuted');
  const shellX = portfolioHeroContentShellClass(contentGutter, contentWidthClass);

  const bottomWidth =
    presentation.heroPortraitIdentityBottomWidth === 'medium' ||
    presentation.heroPortraitIdentityBottomWidth === 'large' ||
    presentation.heroPortraitIdentityBottomWidth === 'full'
      ? presentation.heroPortraitIdentityBottomWidth
      : 'large';
  const bottomAlign =
    presentation.heroPortraitIdentityBottomAlign === 'left' ||
    presentation.heroPortraitIdentityBottomAlign === 'center' ||
    presentation.heroPortraitIdentityBottomAlign === 'right'
      ? presentation.heroPortraitIdentityBottomAlign
      : 'left';
  const bottomFontSizePx = (() => {
    const raw = presentation.heroPortraitIdentityBottomFontSizePx ?? 18;
    if (!Number.isFinite(raw)) return 18;
    return Math.min(48, Math.max(12, Math.round(raw)));
  })();
  const bottomBgCustom = presentation.heroPortraitIdentityBottomBgColor?.trim() || '';
  const bottomGap =
    presentation.heroPortraitIdentityBottomGap === 'tight' ||
    presentation.heroPortraitIdentityBottomGap === 'medium' ||
    presentation.heroPortraitIdentityBottomGap === 'large' ||
    presentation.heroPortraitIdentityBottomGap === 'xlarge'
      ? presentation.heroPortraitIdentityBottomGap
      : 'medium';
  const frameBg = bottomBgCustom || fond;

  return (
    <div
      className={`relative z-[1] ${shellX} ${bottomFrameGapClass(bottomGap)}`}
      style={{ backgroundColor: fond }}
    >
      <div
        className={`w-full ${bottomFrameAlignClass(bottomAlign)}`}
        style={{ maxWidth: bottomFrameMaxWidth(bottomWidth) }}
      >
        <div className="rounded-2xl" style={{ backgroundColor: frameBg }}>
          {bottomLabel ? (
            <p
              className="m-0 mb-3 font-sans font-semibold tracking-[-0.01em]"
              style={{
                color: muted,
                fontSize: `${bottomFontSizePx}px`,
                lineHeight: 1.6,
              }}
            >
              {bottomLabel}
            </p>
          ) : null}
          {bottomText ? (
            <p
              className="m-0 whitespace-pre-wrap font-sans font-normal tracking-[-0.01em] [text-wrap:pretty]"
              style={{
                color: ink,
                fontSize: `${bottomFontSizePx}px`,
                lineHeight: 1.6,
              }}
            >
              {bottomText}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
