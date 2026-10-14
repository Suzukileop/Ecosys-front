'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useLayoutEffect, useMemo, useRef, type CSSProperties, type ReactNode } from 'react';
import type { ProfileServiceItem } from '@/types/profile';
import { resolveHeroPaletteColor } from '@/components/portfolio/portfolio-hero-palette-settings';
import {
  DEFAULT_SERVICES_PALETTE,
  mergeServicesPalette,
} from '@/components/portfolio/portfolio-services-palette-settings';
import {
  buildPricingCards,
  featuredFill,
  ctaLookOverride,
  getScrollParent,
  mixHex,
  prefersReducedMotion,
  useServicesCardHover,
  useServicesFinePointer,
  useServicesMediaQuery,
  readableInk,
  withAlpha,
  type PricingCardData,
} from '@/components/portfolio/portfolio-services-pricing-shared';
import { resolveServicesCardElements, resolveServicesCtaLabel } from '@/components/portfolio/portfolio-services-card-elements';
import {
  useServicesPricingStyle,
  type ServicesPricingStyle,
} from '@/components/portfolio/portfolio-services-pricing-runtime';
import {
  applyServicePriceLabels,
  priceWordLabel,
  resolveBillingSuffix,
  resolveFeaturedIndex,
  SERVICES_FEATURED_DEFAULT_OPACITY,
  type PortfolioServicesListBullet,
} from '@/components/portfolio/portfolio-services-pricing-style';
import { ServicesBulletItem } from '@/components/portfolio/portfolio-services-list-marker';
import {
  DEFAULT_SERVICES_PRICING_CARDS_SETTINGS,
  mergeServicesPricingCardsSettings,
  type PortfolioServicesPresentationSettings,
  type PortfolioServicesPricingBentoMotif,
} from '@/components/portfolio/portfolio-services-settings';
import { useT } from '@/lib/i18n/I18nProvider';

/**
 * Services "Pricing Cards" — one pricing design with three card layouts the creator switches
 * between (Design → Layout):
 *
 * - Grid: large-radius editorial cards, the featured plan lifted and colour-inverted, one big
 *   price, borderless feature lines and a full-width pill button.
 * - Monolith: borderless glass slabs with monumental display prices (sized off the card's own
 *   width), micro-cap tier names, bracketed "[ Get started → ]" links; a flex row so an
 *   incomplete last row centres itself.
 * - Bento: a two-column composition where the featured card leads, spans the row, and carries a
 *   textured graphic header; the others stay minimal and outlined.
 *
 * Everything that is not layout is shared: the real price (currency, "starting at", the service's
 * own billing period), the featured card (which one, its label, colour and background opacity),
 * and one simple hover effect (lift / glow / tilt) that never touches the neighbouring cards.
 * Below 768px every layout is a single column with no hover motion and 48px tap targets.
 */

type CardsTokens = {
  ink: string;
  muted: string;
  surface: string;
  cardBg: string;
  cardBorder: string;
  hairline: string;
  isLight: boolean;
};

function cardsTokens(isLight: boolean, layout: 'grid' | 'monolith' | 'bento'): CardsTokens {
  if (layout === 'grid') {
    return {
      isLight,
      ink: isLight ? '#0a0a0a' : '#f5f5f5',
      muted: isLight ? 'rgba(10,10,10,0.58)' : 'rgba(245,245,245,0.58)',
      surface: isLight ? '#fbfbfa' : '#0b0b0b',
      cardBg: isLight ? '#fbfbfa' : '#0b0b0b',
      cardBorder: isLight ? 'rgba(10,10,10,0.1)' : 'rgba(245,245,245,0.12)',
      hairline: isLight ? 'rgba(10,10,10,0.1)' : 'rgba(245,245,245,0.12)',
    };
  }
  if (layout === 'bento') {
    return {
      isLight,
      ink: isLight ? '#0a0a0a' : '#f5f5f5',
      muted: isLight ? 'rgba(10,10,10,0.5)' : 'rgba(245,245,245,0.5)',
      surface: isLight ? '#ffffff' : '#0c0c0c',
      cardBg: isLight ? '#ffffff' : '#0c0c0c',
      cardBorder: isLight ? 'rgba(10,10,10,0.18)' : 'rgba(255,255,255,0.1)',
      hairline: isLight ? 'rgba(10,10,10,0.18)' : 'rgba(255,255,255,0.1)',
    };
  }
  return {
    isLight,
    ink: isLight ? '#0a0a0a' : '#f5f5f4',
    muted: isLight ? 'rgba(10,10,10,0.58)' : 'rgba(245,245,244,0.6)',
    surface: isLight ? '#ffffff' : '#050505',
    cardBg: isLight ? 'rgba(10,10,10,0.022)' : 'rgba(255,255,255,0.045)',
    cardBorder: isLight ? 'rgba(10,10,10,0.1)' : 'rgba(255,255,255,0.12)',
    hairline: isLight ? 'rgba(10,10,10,0.1)' : 'rgba(245,245,244,0.12)',
  };
}

/** The price pieces one card renders, already resolved against the billing setting. */
function priceView(card: PricingCardData, style: ServicesPricingStyle) {
  const { price } = card;
  const period = price.kind === 'amount' ? resolveBillingSuffix(style.style, price.period) : null;
  return { price, period };
}

/** "Starting at" marker shown above/before a figure that is a floor, not a fixed price. */
function FromMark({ show, color }: { show: boolean; color: string }) {
  const t = useT();
  if (!show) return null;
  return (
    <span className="mb-1 block text-[0.68rem] font-semibold uppercase tracking-[0.18em]" style={{ color }}>
      {t('From')}
    </span>
  );
}

/* ----------------------------------------------------------------------- *
 * Bento graphic header
 * ----------------------------------------------------------------------- */

function BentoMotifLayer({
  accent,
  fade,
  motif,
}: {
  accent: string;
  fade: string;
  motif: Exclude<PortfolioServicesPricingBentoMotif, 'none' | 'shapes'>;
}) {
  const fadeLayer = <span className="absolute inset-0" style={{ backgroundImage: fade }} />;
  if (motif === 'lines') {
    return (
      <>
        <span
          className="absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(135deg, ${accent} 0 2px, transparent 2px 16px)`,
            opacity: 0.55,
          }}
        />
        {fadeLayer}
      </>
    );
  }
  if (motif === 'dots') {
    return (
      <>
        <span
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle, ${accent} 0 2px, transparent 2.5px)`,
            backgroundSize: '18px 18px',
            opacity: 0.6,
          }}
        />
        {fadeLayer}
      </>
    );
  }
  if (motif === 'grid') {
    return (
      <>
        <span
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(${accent} 1px, transparent 1px), linear-gradient(90deg, ${accent} 1px, transparent 1px)`,
            backgroundSize: '28px 28px',
            opacity: 0.4,
          }}
        />
        {fadeLayer}
      </>
    );
  }
  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 400 160"
      preserveAspectRatio="none"
      fill="none"
      aria-hidden
    >
      {[0, 1, 2, 3].map((row) => (
        <path
          key={row}
          d={`M0 ${50 + row * 22} C 60 ${20 + row * 22}, 120 ${80 + row * 22}, 200 ${50 + row * 22} S 340 ${20 + row * 22}, 400 ${50 + row * 22}`}
          stroke={accent}
          strokeOpacity={0.7 - row * 0.14}
          strokeWidth={2}
        />
      ))}
    </svg>
  );
}

function BentoGraphicHeader({
  accent,
  tint,
  ink,
  motif,
}: {
  accent: string;
  tint: string;
  ink: string;
  motif: Exclude<PortfolioServicesPricingBentoMotif, 'none'>;
}) {
  const soft = mixHex(accent, tint, 0.55);
  return (
    <div className="relative h-32 w-full overflow-hidden sm:h-40" style={{ backgroundColor: tint }} aria-hidden>
      {motif === 'shapes' ? (
        <>
          <span
            className="absolute -right-10 -top-14 h-48 w-48"
            style={{
              background: `linear-gradient(135deg, ${accent} 0%, ${soft} 100%)`,
              borderRadius: '38% 62% 63% 37% / 41% 44% 56% 59%',
              opacity: 0.95,
            }}
          />
          <span
            className="absolute -bottom-12 -left-8 h-32 w-32 rounded-full"
            style={{ backgroundColor: soft, opacity: 0.5 }}
          />
          <span
            className="absolute right-10 top-8 h-16 w-16 rounded-[26%] border"
            style={{ borderColor: ink, opacity: 0.16, transform: 'rotate(22deg)' }}
          />
          <span
            className="absolute bottom-6 left-10 h-2 w-14 rounded-full"
            style={{ backgroundColor: ink, opacity: 0.14 }}
          />
        </>
      ) : (
        <BentoMotifLayer
          accent={accent}
          fade={`linear-gradient(115deg, transparent 0%, ${tint} 100%)`}
          motif={motif}
        />
      )}
    </div>
  );
}

/* ----------------------------------------------------------------------- *
 * The three card layouts
 * ----------------------------------------------------------------------- */

type LayoutCardProps = {
  card: PricingCardData;
  index: number;
  featured: boolean;
  tokens: CardsTokens;
  accent: string;
  /** Resolved featured fill (translucent) + the opaque colour it appears as + readable ink on it. */
  fill: { fill: string; blended: string; ink: string };
  badge: string | null;
  ctaLabel: string;
  pricingStyle: ServicesPricingStyle;
  hover: string;
  raised: boolean;
  motif: PortfolioServicesPricingBentoMotif;
  /** Bento wide card: heading above the checklist (empty hides it). */
  includedLabel: string;
};

function cardVars(tokens: CardsTokens): CSSProperties {
  return {
    '--svc-glow': tokens.ink,
    '--svc-shadow': tokens.isLight ? 'rgba(10,10,10,0.22)' : 'rgba(0,0,0,0.65)',
  } as CSSProperties;
}

function GridCard({ card, featured, tokens, fill, badge, ctaLabel, pricingStyle, hover, raised }: LayoutCardProps) {
  const ink = featured ? fill.ink : tokens.ink;
  const muted = featured ? `${fill.ink}93` : tokens.muted;
  const { period } = priceView(card, pricingStyle);
  const price = applyServicePriceLabels(card.price, pricingStyle.style);
  return (
    <div
      data-svc-card=""
      data-svc-hover={hover}
      data-rest-y={raised ? -20 : 0}
      className="relative flex h-full flex-col rounded-[2rem] border p-7 sm:p-9"
      style={{
        ...cardVars(tokens),
        backgroundColor: featured ? fill.fill : tokens.cardBg,
        borderColor: pricingStyle.borderColor ?? (featured ? `${fill.ink}24` : tokens.cardBorder),
        ...(pricingStyle.borderWidthPx != null ? { borderWidth: pricingStyle.borderWidthPx } : null),
        ...(pricingStyle.cardRadiusPx != null ? { borderRadius: pricingStyle.cardRadiusPx } : null),
        boxShadow: featured ? `0 36px 60px -28px ${fill.blended}66` : 'none',
        zIndex: featured ? 2 : 1,
      }}
      data-pf-no-color-transition=""
    >
      {featured && badge ? (
        <span
          className="absolute right-7 top-8 text-[10px] font-semibold uppercase tracking-[0.26em]"
          style={{ color: muted }}
        >
          {badge}
        </span>
      ) : null}

      {card.show.title ? (
        <h3
          className={`text-xl font-black tracking-[-0.01em] sm:text-2xl ${featured && badge ? 'pr-20' : ''}`}
          style={{ color: ink }}
        >
          {card.title}
        </h3>
      ) : null}
      {card.description ? (
        <p className="mt-3 text-[0.95rem] leading-relaxed" style={{ color: muted }}>
          {card.description}
        </p>
      ) : null}

      {card.show.price ? (
        <div className="mt-8 sm:mt-9">
          <FromMark show={price.isFrom && price.kind === 'amount'} color={muted} />
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span
              className="text-[length:calc(2.5rem*var(--pf-services-font-scale,1))] font-black leading-none tracking-[-0.03em] sm:text-[length:calc(3.1rem*var(--pf-services-font-scale,1))]"
              style={{ color: ink }}
            >
              {price.text}
            </span>
            {period ? (
              <span className="text-[0.75rem] font-light tracking-[0.02em]" style={{ color: muted }}>
                {period}
              </span>
            ) : null}
          </div>
        </div>
      ) : null}
      {card.delivery ? (
        <p className="mt-2 text-[13px] font-medium" style={{ color: muted }}>
          {card.delivery}
        </p>
      ) : null}

      {card.features.length > 0 ? (
        <ul className="mt-9 flex flex-1 flex-col gap-4 sm:mt-10 sm:gap-5">
          {card.features.map((feature, i) =>
            pricingStyle.style.listBullet !== 'auto' ? (
              <ServicesBulletItem
                key={`${card.id}-f-${i}`}
                bullet={pricingStyle.style.listBullet}
                index={i}
                markerColor={pricingStyle.bulletColor ?? ink}
                className="text-[0.95rem] font-normal leading-snug"
                textStyle={{ color: ink, opacity: 0.75 }}
              >
                {feature}
              </ServicesBulletItem>
            ) : (
            <li
              key={`${card.id}-f-${i}`}
              className="text-[0.95rem] font-normal leading-snug"
              style={{ color: ink, opacity: 0.6 }}
            >
              {feature}
            </li>
            )
          )}
        </ul>
      ) : (
        <div className="flex-1" />
      )}

      {card.show.cta ? (
      <a
        {...pricingStyle.anchorProps}
        data-svc-cta=""
        className="mt-9 inline-flex min-h-[48px] w-full items-center justify-center rounded-full px-6 text-sm font-semibold sm:mt-10"
        style={{
          backgroundColor: featured ? ink : tokens.ink,
          color: featured ? fill.blended : tokens.cardBg,
          ...(pricingStyle.ctaRadius != null ? { borderRadius: pricingStyle.ctaRadius } : null),
          ...ctaLookOverride(
            pricingStyle.style.ctaStyle,
            featured ? ink : tokens.ink,
            featured ? fill.blended : tokens.cardBg,
            pricingStyle.ctaRadius
          ),
        }}
        data-pf-no-color-transition=""
      >
        {ctaLabel}
      </a>
      ) : null}
    </div>
  );
}

function MonolithCard({
  card,
  featured,
  tokens,
  accent,
  fill,
  badge,
  ctaLabel,
  pricingStyle,
  hover,
  raised,
}: LayoutCardProps) {
  const { price, period } = priceView(card, pricingStyle);
  const border = featured ? withAlpha(accent, tokens.isLight ? 0.42 : 0.55) : tokens.cardBorder;
  const faint = tokens.isLight ? 'rgba(10,10,10,0.38)' : 'rgba(245,245,244,0.4)';
  const figure =
    price.kind === 'amount'
      ? price.amount
      : priceWordLabel(pricingStyle.style, price.kind, price.kind === 'free' ? 'Free' : 'Custom');
  return (
    <div
      data-svc-card=""
      data-svc-hover={hover}
      data-rest-y={raised ? -12 : 0}
      className={`pf-svc-cards-mono-card relative flex flex-col gap-6 rounded-[22px] border px-6 py-9 backdrop-blur-[12px] [container-type:inline-size] sm:gap-7 sm:px-8 md:rounded-[28px] md:px-7 ${
        featured ? 'md:py-14' : 'md:py-11'
      }`}
      style={{
        ...cardVars(tokens),
        backgroundColor: featured ? fill.fill : tokens.cardBg,
        borderColor: pricingStyle.borderColor ?? border,
        ...(pricingStyle.borderWidthPx != null ? { borderWidth: pricingStyle.borderWidthPx } : null),
        ...(pricingStyle.cardRadiusPx != null ? { borderRadius: pricingStyle.cardRadiusPx } : null),
        WebkitTapHighlightColor: 'transparent',
      }}
      data-pf-no-color-transition=""
    >
      {featured && badge ? (
        <span
          className="inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]"
          style={{ color: accent, borderColor: border }}
        >
          {badge}
        </span>
      ) : null}

      {card.show.title ? (
        <p className="text-[11px] font-medium uppercase leading-none tracking-[0.18em]" style={{ color: tokens.muted }}>
          {card.title}
        </p>
      ) : null}

      {card.show.price ? (
      <div>
        <FromMark show={price.isFrom && price.kind === 'amount'} color={faint} />
        <div className="flex min-w-0 flex-wrap items-end gap-x-2 gap-y-1">
          <span
            className="whitespace-nowrap text-[length:calc(clamp(2.25rem,13cqi,4.5rem)*var(--pf-services-font-scale,1))] font-black leading-[0.9] tracking-[-0.04em]"
            style={{ color: tokens.ink }}
          >
            {price.kind === 'amount' && price.symbolFirst ? (
              <span className="mr-1 text-[0.32em] font-semibold" style={{ opacity: 0.65 }}>
                {price.symbol}
              </span>
            ) : null}
            {figure}
            {price.kind === 'amount' && !price.symbolFirst ? (
              <span className="ml-1 text-[0.32em] font-semibold" style={{ opacity: 0.65 }}>
                {price.symbol}
              </span>
            ) : null}
          </span>
          {period ? (
            <span
              className="pb-[0.3em] text-[11px] font-medium uppercase leading-none tracking-[0.18em]"
              style={{ color: faint }}
            >
              {period}
            </span>
          ) : null}
        </div>
      </div>
      ) : null}
      {card.delivery ? (
        <p className="text-[13px] font-medium" style={{ color: tokens.muted }}>
          {card.delivery}
        </p>
      ) : null}
      {card.description ? (
        <p className="text-sm leading-[1.6]" style={{ color: tokens.muted }}>
          {card.description}
        </p>
      ) : null}

      {card.features.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {card.features.map((feature, i) =>
            pricingStyle.style.listBullet !== 'auto' ? (
              <ServicesBulletItem
                key={`${card.id}-f-${i}`}
                bullet={pricingStyle.style.listBullet}
                index={i}
                markerColor={pricingStyle.bulletColor ?? accent}
                className="text-sm leading-[1.5]"
                textStyle={{ color: tokens.muted }}
              >
                {feature}
              </ServicesBulletItem>
            ) : (
            <li key={`${card.id}-f-${i}`} className="flex items-start gap-2.5 text-sm leading-[1.5]">
              <svg viewBox="0 0 16 16" className="mt-0.5 h-3.5 w-3.5 shrink-0" fill="none" aria-hidden>
                <path
                  d="M3 8.5l3 3 7-7.5"
                  stroke={accent}
                  strokeWidth={1.6}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span style={{ color: tokens.muted }}>{feature}</span>
            </li>
            )
          )}
        </ul>
      ) : null}

      {card.show.cta ? (
      <a
        {...pricingStyle.anchorProps}
        data-svc-cta=""
        className="mt-auto flex min-h-[48px] w-full items-center justify-center gap-1.5 pt-4 text-sm font-medium tracking-[0.02em] md:w-fit md:justify-start"
        style={{
          color: tokens.ink,
          borderTop: `1px solid ${tokens.hairline}`,
          ...ctaLookOverride(pricingStyle.style.ctaStyle, tokens.ink, tokens.surface, pricingStyle.ctaRadius),
        }}
        data-pf-no-color-transition=""
      >
        {pricingStyle.style.ctaStyle === 'auto' ? (
          <span aria-hidden style={{ color: faint }}>
            [
          </span>
        ) : null}
        <span>{ctaLabel}</span>
        <span aria-hidden className="inline-block" data-pf-no-color-transition="">
          →
        </span>
        {pricingStyle.style.ctaStyle === 'auto' ? (
          <span aria-hidden style={{ color: faint }}>
            ]
          </span>
        ) : null}
      </a>
      ) : null}
    </div>
  );
}

/** One "included" line: a check in a soft disc, then the text. Shared by the wide and the
 *  regular Bento cards so every list reads the same. */
function BentoCheckItem({
  ink,
  strong,
  bullet,
  index,
  markerColor,
  children,
}: {
  ink: string;
  strong: boolean;
  bullet: PortfolioServicesListBullet;
  index: number;
  /** General → List bullet color; falls back to the ink. */
  markerColor?: string | null;
  children: ReactNode;
}) {
  if (bullet !== 'auto') {
    return (
      <ServicesBulletItem
        bullet={bullet}
        index={index}
        markerColor={markerColor ?? ink}
        className="text-[0.98rem] leading-snug"
        textStyle={{ color: ink, opacity: strong ? 0.9 : 0.7 }}
      >
        {children}
      </ServicesBulletItem>
    );
  }
  return (
    <li className="flex items-start gap-3">
      <span
        aria-hidden
        className="mt-[0.1rem] inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: withAlpha(ink, strong ? 0.14 : 0.1) }}
      >
        <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none">
          <path d="M3.5 8.5l2.8 2.8L12.5 5" stroke={ink} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="text-[0.98rem] leading-snug" style={{ color: ink, opacity: strong ? 0.9 : 0.7 }}>
        {children}
      </span>
    </li>
  );
}

function BentoCard({
  card,
  featured,
  tokens,
  accent,
  fill,
  badge,
  ctaLabel,
  pricingStyle,
  hover,
  motif,
  includedLabel,
  wide,
}: LayoutCardProps & { wide: boolean }) {
  const { period } = priceView(card, pricingStyle);
  const price = applyServicePriceLabels(card.price, pricingStyle.style);
  const showHeader = featured && motif !== 'none';
  // The featured card is painted with the accent tint, so its text is picked against that tint
  // (not the page): `fill.ink` is the readable ink for it.
  const ink = featured ? fill.ink : tokens.ink;
  const muted = featured ? withAlpha(fill.ink, 0.72) : tokens.muted;
  const hairline = featured ? withAlpha(fill.ink, 0.16) : tokens.hairline;
  const ctaInk = featured ? fill.ink : tokens.ink;
  const ctaSurface = featured ? fill.blended : tokens.surface;

  const badgeEl =
    featured && badge ? (
      <span
        className="mb-5 inline-flex w-fit items-center rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em]"
        style={{ backgroundColor: ink, color: featured ? fill.blended : tokens.surface }}
      >
        {badge}
      </span>
    ) : null;

  const titleEl = card.show.title ? (
    <h3
      className={`font-sans font-black leading-[1.05] tracking-tight ${
        wide ? 'text-2xl sm:text-[2rem]' : 'text-2xl sm:text-[1.7rem]'
      }`}
      style={{ color: ink }}
    >
      {card.title}
    </h3>
  ) : null;

  const descriptionEl = card.description ? (
    <p className="mt-3 max-w-[46ch] text-[0.95rem] leading-relaxed" style={{ color: muted }}>
      {card.description}
    </p>
  ) : null;

  const priceEl = !card.show.price ? null : price.kind === 'quote' ? (
    <p className="mt-7 text-[1.05rem] font-medium italic" style={{ color: muted }}>
      {priceWordLabel(pricingStyle.style, 'quote', 'Price on request')}
    </p>
  ) : (
    <div className={wide ? 'mt-8' : 'mt-7'}>
      <FromMark show={price.isFrom && price.kind === 'amount'} color={muted} />
      <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-1">
        <span
          className="text-[length:calc(2.4rem*var(--pf-services-font-scale,1))] font-black leading-none tracking-tight sm:text-[length:calc(3rem*var(--pf-services-font-scale,1))]"
          style={{ color: ink }}
        >
          {price.text}
        </span>
        {period ? (
          <span className="text-[0.85rem] font-light tracking-wide" style={{ color: muted }}>
            {period}
          </span>
        ) : null}
      </div>
    </div>
  );

  const deliveryEl = card.delivery ? (
    <p className="mt-2 text-[13px] font-medium" style={{ color: muted }}>
      {card.delivery}
    </p>
  ) : null;

  const ctaEl = card.show.cta ? (
    <div className="mt-auto pt-8 sm:pt-9">
      <a
        {...pricingStyle.anchorProps}
        data-svc-cta=""
        className="group relative inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full px-6 text-[0.95rem] font-semibold md:w-auto"
        style={{
          ...(pricingStyle.ctaRadius != null ? { borderRadius: pricingStyle.ctaRadius } : null),
          backgroundColor: featured ? ctaInk : 'transparent',
          color: featured ? ctaSurface : tokens.ink,
          borderStyle: 'solid',
          borderWidth: 1,
          borderColor: featured ? ctaInk : tokens.cardBorder,
          ...ctaLookOverride(pricingStyle.style.ctaStyle, ctaInk, ctaSurface, pricingStyle.ctaRadius),
        }}
        data-pf-no-color-transition=""
      >
        {ctaLabel}
        <span aria-hidden className="inline-block transition-transform duration-300 ease-out group-hover:translate-x-1">
          →
        </span>
      </a>
    </div>
  ) : null;

  const shell = (children: ReactNode) => (
    <div
      data-svc-card=""
      data-svc-hover={hover}
      data-rest-y={0}
      className={`relative flex flex-col overflow-hidden rounded-[28px] border ${wide ? 'md:col-span-2' : ''}`}
      style={{
        ...cardVars(tokens),
        backgroundColor: featured ? fill.blended : tokens.cardBg,
        borderColor: pricingStyle.borderColor ?? tokens.cardBorder,
        ...(pricingStyle.borderWidthPx != null ? { borderWidth: pricingStyle.borderWidthPx } : null),
        ...(pricingStyle.cardRadiusPx != null ? { borderRadius: pricingStyle.cardRadiusPx } : null),
      }}
      data-pf-no-color-transition=""
    >
      {showHeader ? (
        <BentoGraphicHeader accent={accent} tint={fill.blended} ink={tokens.ink} motif={motif as Exclude<PortfolioServicesPricingBentoMotif, 'none'>} />
      ) : (
        <div className="h-2 w-full" aria-hidden />
      )}
      {children}
    </div>
  );

  // Wide (featured, spans the row): the offer on the left — badge, name, price, delivery and the
  // button — and what is included on the right, as a two-column checklist behind a hairline. The
  // card's whole width carries content instead of one narrow stack and an empty half.
  if (wide) {
    const features = card.features;
    return shell(
      <div className="flex flex-1 flex-col md:flex-row">
        <div className="flex flex-col p-6 sm:p-9 md:w-[42%] md:shrink-0 lg:p-12">
          {badgeEl}
          {titleEl}
          {descriptionEl}
          {priceEl}
          {deliveryEl}
          {ctaEl}
        </div>
        {features.length > 0 ? (
          <div
            className="flex flex-1 flex-col justify-center border-t p-6 sm:p-9 md:border-l md:border-t-0 lg:p-12"
            style={{ borderColor: hairline }}
          >
            {includedLabel ? (
              <p className="mb-6 text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: muted }}>
                {includedLabel}
              </p>
            ) : null}
            <ul
              className={`grid list-none gap-x-10 gap-y-4 pl-0 ${features.length > 3 ? 'lg:grid-cols-2' : ''}`}
            >
              {features.map((feature, i) => (
                <BentoCheckItem key={`${card.id}-f-${i}`} ink={ink} strong bullet={pricingStyle.style.listBullet} markerColor={pricingStyle.bulletColor} index={i}>
                  {feature}
                </BentoCheckItem>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    );
  }

  return shell(
    <div className="flex flex-1 flex-col p-6 sm:p-9">
      {badgeEl}
      {titleEl}
      {descriptionEl}
      {priceEl}
      {deliveryEl}

      {card.features.length > 0 ? (
        <ul className="mt-7 flex list-none flex-col gap-4 pl-0 sm:mt-8">
          {card.features.map((feature, i) => (
            <BentoCheckItem
              key={`${card.id}-f-${i}`}
              ink={ink}
              strong={featured}
              bullet={pricingStyle.style.listBullet}
              markerColor={pricingStyle.bulletColor}
              index={i}
            >
              {feature}
            </BentoCheckItem>
          ))}
        </ul>
      ) : null}

      {ctaEl}
    </div>
  );
}

/* ----------------------------------------------------------------------- *
 * Section
 * ----------------------------------------------------------------------- */

const GRID_COLS_LG: Record<number, string> = {
  1: 'lg:grid-cols-1',
  2: 'lg:grid-cols-2',
  3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-4',
};

function basis(columns: number, gapPx: number): string {
  return `calc((100% - ${gapPx * (columns - 1)}px) / ${columns})`;
}

export function ServicesPricingCardsSection({
  services,
  presentation,
}: {
  services: ProfileServiceItem[];
  presentation: PortfolioServicesPresentationSettings;
}) {
  const settings = mergeServicesPricingCardsSettings(DEFAULT_SERVICES_PRICING_CARDS_SETTINGS, presentation.pricingCards);
  const layout = settings.layout;
  const pricingStyle = useServicesPricingStyle(presentation);
  const style = pricingStyle.style;
  const isLight = presentation.activeColorMode === 'light';
  const tokens = cardsTokens(isLight, layout);

  const show = resolveServicesCardElements(presentation);
  const built = useMemo(
    () => buildPricingCards(services, show),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `show` is rebuilt every render; its six flags are the real deps
    [services, show.title, show.description, show.price, show.delivery, show.tasks, show.cta, show.deliveryTemplate]
  );
  const featuredAt = resolveFeaturedIndex(
    style,
    built.map((card) => card.popularFlag)
  );
  // Bento leads with the featured card; the other layouts keep the creator's order.
  const cards =
    layout !== 'bento' || featuredAt <= 0
      ? built
      : [built[featuredAt], ...built.filter((_, i) => i !== featuredAt)];
  const featuredIndex = layout === 'bento' ? (featuredAt >= 0 ? 0 : -1) : featuredAt;
  const count = cards.length;

  const palette = mergeServicesPalette(DEFAULT_SERVICES_PALETTE, presentation.servicesPalette);
  const accent =
    pricingStyle.featuredColor ??
    (layout === 'grid'
      ? resolveHeroPaletteColor(palette, 'principal')
      : presentation.cardAccentColor || presentation.ctaColor || '#f97316');

  const defaultOpacity =
    layout === 'grid'
      ? SERVICES_FEATURED_DEFAULT_OPACITY.cardsGrid
      : layout === 'monolith'
        ? SERVICES_FEATURED_DEFAULT_OPACITY.cardsMonolith
        : SERVICES_FEATURED_DEFAULT_OPACITY.cardsBento;
  const opacity = style.featuredOpacity ?? defaultOpacity;
  const fill = (() => {
    if (layout === 'grid') {
      // The raw palette colour reads neon next to near-black cards, so the default blends a little
      // of the card tone in; an explicit opacity from the creator is honoured as set.
      const base = style.featuredOpacity == null ? mixHex(accent, tokens.surface, 0.85) : accent;
      return featuredFill(base, opacity, tokens.surface);
    }
    if (layout === 'bento') {
      // Bento: the featured header is a *tint* of the accent over the card surface.
      const tint = mixHex(accent, tokens.surface, opacity / 100);
      return { fill: tint, blended: tint, ink: readableInk(tint) };
    }
    return featuredFill(accent, opacity, tokens.surface);
  })();

  const badge = style.featuredShowLabel && style.featuredLabel.trim() ? style.featuredLabel.trim() : null;

  const rootRef = useRef<HTMLDivElement>(null);
  const finePointer = useServicesFinePointer();
  const isLg = useServicesMediaQuery('(min-width: 1024px)');
  const isMd = useServicesMediaQuery('(min-width: 768px)');
  const itemsKey = `${cards.map((card) => card.id).join('|')}|${layout}`;

  // Entrance — cards rise in once, staggered, when the block scrolls into view.
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || count === 0) return undefined;
    const els = Array.from(root.querySelectorAll<HTMLElement>('[data-svc-card]'));
    const rest = (el: Element) => Number((el as HTMLElement).dataset.restY ?? 0) || 0;
    if (prefersReducedMotion()) {
      gsap.set(els, { y: (_i: number, el: Element) => rest(el), opacity: 1 });
      return undefined;
    }
    let ctx: gsap.Context | undefined;
    let refreshId = 0;
    try {
      gsap.registerPlugin(ScrollTrigger);
      ctx = gsap.context(() => {
        gsap.set(els, { y: (_i: number, el: Element) => rest(el) + 36, opacity: 0 });
        gsap.to(els, {
          y: (_i: number, el: Element) => rest(el),
          opacity: 1,
          duration: 0.85,
          ease: 'power3.out',
          stagger: 0.1,
          clearProps: 'opacity',
          scrollTrigger: { trigger: root, scroller: getScrollParent(root), start: 'top 88%', once: true },
        });
      }, root);
      refreshId = window.setTimeout(() => {
        try {
          ScrollTrigger.refresh();
        } catch (error) {
          console.error('[ServicesPricingCards] deferred refresh() failed', error);
        }
      }, 90);
    } catch (error) {
      console.error('[ServicesPricingCards] entrance setup failed', error);
    }
    return () => {
      window.clearTimeout(refreshId);
      ctx?.revert();
    };
    // `itemsKey` covers the card list + layout; `isLg` re-seats the featured card's lift.
  }, [itemsKey, count, isLg, isMd]);

  useServicesCardHover(rootRef, style.hoverEffect, finePointer, itemsKey);

  // Magnetic order buttons (fine pointer only).
  useEffect(() => {
    const root = rootRef.current;
    if (!root || !finePointer || prefersReducedMotion()) return undefined;
    const ctas = Array.from(root.querySelectorAll<HTMLElement>('[data-svc-cta]'));
    const cleanups: Array<() => void> = [];
    ctas.forEach((el) => {
      const moveX = gsap.quickTo(el, 'x', { duration: 0.45, ease: 'power3' });
      const moveY = gsap.quickTo(el, 'y', { duration: 0.45, ease: 'power3' });
      const onMove = (event: PointerEvent) => {
        const rect = el.getBoundingClientRect();
        moveX((event.clientX - (rect.left + rect.width / 2)) * 0.3);
        moveY((event.clientY - (rect.top + rect.height / 2)) * 0.3);
      };
      const onLeave = () => gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)', overwrite: 'auto' });
      el.addEventListener('pointermove', onMove);
      el.addEventListener('pointerleave', onLeave);
      cleanups.push(() => {
        el.removeEventListener('pointermove', onMove);
        el.removeEventListener('pointerleave', onLeave);
        gsap.killTweensOf(el);
        gsap.set(el, { clearProps: 'x,y' });
      });
    });
    return () => cleanups.forEach((off) => off());
  }, [finePointer, itemsKey]);

  if (count === 0) return null;

  const common = (card: PricingCardData, index: number): LayoutCardProps => {
    const featured = index === featuredIndex;
    return {
      card,
      index,
      featured,
      tokens,
      accent,
      fill,
      badge,
      ctaLabel: resolveServicesCtaLabel(presentation),
      pricingStyle,
      hover: style.hoverEffect,
      raised:
        featured &&
        count > 1 &&
        (layout === 'grid' ? isLg && settings.cardsPerRow > 1 : layout === 'monolith' ? isMd : false),
      motif: settings.graphicMotif,
      includedLabel: settings.includedLabel,
    };
  };

  const frame = style.showFrame ? (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 left-1/2 z-0 w-screen -translate-x-1/2"
      style={{ backgroundColor: tokens.surface }}
      data-pf-no-color-transition=""
    />
  ) : null;

  if (layout === 'monolith') {
    const GAP_TABLET = 24;
    const GAP_DESKTOP = 32;
    const colsTablet = Math.max(1, Math.min(settings.cardsPerRow, 2, count));
    const colsDesktop = Math.max(1, Math.min(settings.cardsPerRow, 4, count));
    const tabletBasis = colsTablet === 1 ? '28rem' : basis(colsTablet, GAP_TABLET);
    const desktopBasis = colsDesktop === 1 ? '28rem' : basis(colsDesktop, GAP_DESKTOP);
    return (
      <div ref={rootRef} className="relative" data-pf-no-color-transition="">
        <style>{`
          .pf-svc-cards-mono-row { display: flex; flex-wrap: wrap; justify-content: center; gap: 16px; }
          .pf-svc-cards-mono-slot { flex: 0 1 100%; min-width: 0; max-width: 100%; display: flex; }
          .pf-svc-cards-mono-slot > * { width: 100%; }
          @media (min-width: 768px) {
            .pf-svc-cards-mono-row { gap: ${GAP_TABLET}px; }
            .pf-svc-cards-mono-slot { flex-basis: ${tabletBasis}; max-width: ${tabletBasis}; }
          }
          @media (min-width: 1024px) {
            .pf-svc-cards-mono-row { gap: ${GAP_DESKTOP}px; }
            .pf-svc-cards-mono-slot { flex-basis: ${desktopBasis}; max-width: ${desktopBasis}; }
          }
        `}</style>
        {frame}
        <div className={`relative z-[1] w-full ${style.showFrame ? 'py-14 sm:py-20 md:py-24' : ''}`}>
          <div className="pf-svc-cards-mono-row">
            {cards.map((card, index) => (
              <div key={card.id} className="pf-svc-cards-mono-slot">
                <MonolithCard {...common(card, index)} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (layout === 'bento') {
    return (
      <div ref={rootRef} className="relative" data-pf-no-color-transition="">
        {frame}
        <div className={`relative z-[1] w-full ${style.showFrame ? 'py-10 sm:py-14 md:py-16' : ''}`}>
          <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
            {cards.map((card, index) => (
              <BentoCard key={card.id} {...common(card, index)} wide={index === 0 && featuredIndex === 0 && count >= 3} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const cols = Math.max(1, Math.min(settings.cardsPerRow, count));
  if (settings.centerLastRow && count > 1) {
    // Same gaps and columns as the grid below, but flex-wrap + a width calc so an incomplete
    // last row can sit centered.
    return (
      <div ref={rootRef} className="relative" data-pf-no-color-transition="">
        {frame}
        <div
          className="relative z-[1] flex flex-wrap justify-center gap-5 py-4 [--pc-g:1.25rem] [--pc-c:1] sm:gap-7 sm:[--pc-g:1.75rem] md:[--pc-c:2] lg:gap-8 lg:[--pc-g:2rem] lg:[--pc-c:var(--pc-c-lg)]"
          style={{ '--pc-c-lg': cols } as CSSProperties}
        >
          {cards.map((card, index) => (
            <div key={card.id} className="flex min-w-0 w-[calc((100%-(var(--pc-c)-1)*var(--pc-g))/var(--pc-c))] [&>*]:w-full">
              <GridCard {...common(card, index)} />
            </div>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div ref={rootRef} className="relative" data-pf-no-color-transition="">
      {frame}
      <div
        className={`relative z-[1] grid grid-cols-1 gap-5 py-4 sm:gap-7 md:grid-cols-2 lg:gap-8 ${GRID_COLS_LG[cols]} ${
          count === 1 ? 'mx-auto max-w-xl' : ''
        }`}
      >
        {cards.map((card, index) => (
          <GridCard key={card.id} {...common(card, index)} />
        ))}
      </div>
    </div>
  );
}
