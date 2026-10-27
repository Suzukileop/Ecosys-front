'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLayoutEffect, useMemo, useRef, type CSSProperties, type ReactNode } from 'react';
import { balancedColumns, fluidColumns, useFluidTrack } from '@/components/portfolio/portfolio-services-fluid-columns';
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
  legibleFeaturedFill,
  mixHex,
  prefersReducedMotion,
  useServicesCardHover,
  useServicesFinePointer,
  useServicesMediaQuery,
  contrastRatio,
  readableInk,
  softInk,
  withAlpha,
  type PricingCardData,
} from '@/components/portfolio/portfolio-services-pricing-shared';
import { resolveServicesCardElements, resolveServicesCtaLabel, ServicesHoverAnchor } from '@/components/portfolio/portfolio-services-card-elements';
import {
  useServicesPricingStyle,
  type ServicesPricingStyle,
} from '@/components/portfolio/portfolio-services-pricing-runtime';
import {
  applyServicePriceLabels,
  priceWordLabel,
  resolveBillingSuffix,
  resolveFeaturedIndex,
  resolveIncludedLabel,
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
 *   pattern behind its content; the others stay minimal and outlined.
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
    <span className="mb-1 block text-[length:calc(0.75rem*var(--pf-services-font-scale,1))] font-semibold uppercase tracking-[0.16em]" style={{ color }}>
      {t('From')}
    </span>
  );
}

/* ----------------------------------------------------------------------- *
 * Bento card pattern
 * ----------------------------------------------------------------------- */

/**
 * The featured Bento card's pattern, drawn *behind* its content instead of in a header strip of its
 * own: it adds no height, and a corner mask keeps it to the card's edge so it never sits under the
 * text at full strength. `color` is already picked to stay visible on the card's tint.
 */
function BentoPatternBackdrop({
  color,
  tint,
  motif,
}: {
  color: string;
  tint: string;
  motif: Exclude<PortfolioServicesPricingBentoMotif, 'none'>;
}) {
  // Strongest in the top-right corner, gone before the middle of the card.
  const mask = 'radial-gradient(130% 110% at 100% 0%, #000 0%, rgba(0,0,0,0.55) 38%, transparent 72%)';
  const masked: CSSProperties = { WebkitMaskImage: mask, maskImage: mask };
  let layer: ReactNode;
  if (motif === 'shapes') {
    const soft = mixHex(color, tint, 0.55);
    layer = (
      <>
        <span
          className="absolute -right-12 -top-16 h-56 w-56"
          style={{
            background: `linear-gradient(135deg, ${color} 0%, ${soft} 100%)`,
            borderRadius: '38% 62% 63% 37% / 41% 44% 56% 59%',
            opacity: 0.5,
          }}
        />
        <span
          className="absolute right-24 top-24 h-16 w-16 rounded-[26%] border-2"
          style={{ borderColor: color, opacity: 0.4, transform: 'rotate(22deg)' }}
        />
        <span className="absolute -bottom-14 -left-10 h-36 w-36 rounded-full" style={{ backgroundColor: soft, opacity: 0.3 }} />
      </>
    );
  } else if (motif === 'lines') {
    layer = (
      <span
        className="absolute inset-0"
        style={{ ...masked, backgroundImage: `repeating-linear-gradient(135deg, ${color} 0 1.5px, transparent 1.5px 16px)`, opacity: 0.5 }}
      />
    );
  } else if (motif === 'dots') {
    layer = (
      <span
        className="absolute inset-0"
        style={{ ...masked, backgroundImage: `radial-gradient(circle, ${color} 0 1.6px, transparent 2px)`, backgroundSize: '18px 18px', opacity: 0.6 }}
      />
    );
  } else if (motif === 'grid') {
    layer = (
      <span
        className="absolute inset-0"
        style={{
          ...masked,
          backgroundImage: `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`,
          backgroundSize: '28px 28px',
          opacity: 0.4,
        }}
      />
    );
  } else {
    layer = (
      <svg className="absolute inset-0 h-full w-full" style={masked} viewBox="0 0 400 300" preserveAspectRatio="none" fill="none">
        {[0, 1, 2, 3, 4].map((row) => (
          <path
            key={row}
            d={`M0 ${30 + row * 22} C 60 ${row * 22}, 120 ${60 + row * 22}, 200 ${30 + row * 22} S 340 ${row * 22}, 400 ${30 + row * 22}`}
            stroke={color}
            strokeOpacity={0.6 - row * 0.1}
            strokeWidth={1.5}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>
    );
  }
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
      {layer}
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
  /** Bento wide card: heading above the checklist ('' when hidden). */
  includedLabel: string;
};

function cardVars(tokens: CardsTokens, pricingStyle: ServicesPricingStyle): CSSProperties {
  return {
    '--svc-glow': pricingStyle.glowColor ?? tokens.ink,
    '--svc-glow-a': pricingStyle.glowAlpha,
    '--svc-shadow': tokens.isLight ? 'rgba(10,10,10,0.22)' : 'rgba(0,0,0,0.65)',
  } as CSSProperties;
}

function GridCard({
  card,
  featured,
  tokens,
  fill,
  badge,
  ctaLabel,
  pricingStyle,
  hover,
  raised,
  wide = false,
}: LayoutCardProps & {
  /** One card per row: a horizontal composition (plan and price left, what's included and the button right)
   *  instead of a tall stack that leaves the full width empty. */
  wide?: boolean;
}) {
  const ink = featured ? fill.ink : tokens.ink;
  // Secondary text on the featured card sits on a mid-tone accent: soften it only as far as stays readable.
  const muted = featured ? softInk(fill.ink, fill.blended, 0.8) : tokens.muted;
  const listInk = featured ? softInk(fill.ink, fill.blended, 0.92) : ink;
  const { period } = priceView(card, pricingStyle);
  const price = applyServicePriceLabels(card.price, pricingStyle.style);
  const isAmount = price.kind === 'amount';
  const divider = featured ? `${fill.ink}24` : tokens.cardBorder;

  const titleNode = card.show.title ? (
    <h3
      // One class, not `text-xl sm:text-2xl`: the Services font-size rules (#services .text-xl) outrank the
      // `sm:` size, which pinned the title at 20px on desktop.
      className={
        wide
          ? `text-[length:calc(1.75rem*var(--pf-services-font-scale,1))] font-semibold leading-[1.15] tracking-[-0.02em] md:text-[length:calc(2.25rem*var(--pf-services-font-scale,1))] ${featured && badge ? 'pr-20' : ''}`
          : `text-[length:calc(1.5rem*var(--pf-services-font-scale,1))] font-semibold leading-[1.2] tracking-[-0.015em] sm:text-[length:calc(1.625rem*var(--pf-services-font-scale,1))] ${featured && badge ? 'pr-20' : ''}`
      }
      style={{ color: ink }}
    >
      {card.title}
    </h3>
  ) : null;

  const descriptionNode = card.description ? (
    <p className={`mt-3 text-[0.95rem] leading-relaxed ${wide ? 'max-w-xl md:text-base md:leading-[1.7]' : ''}`} style={{ color: muted }}>
      {card.description}
    </p>
  ) : null;

  const priceNode = card.show.price ? (
    <div className={wide ? 'mt-8 md:mt-10' : 'mt-8 sm:mt-9'}>
      <FromMark show={price.isFrom && price.kind === 'amount'} color={muted} />
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span
          // A figure is the focal point; a word standing in for one ("On request", "Custom") is not.
          className={
            isAmount
              ? 'text-[length:calc(2.5rem*var(--pf-services-font-scale,1))] font-bold leading-none tracking-[-0.03em] sm:text-[length:calc(3rem*var(--pf-services-font-scale,1))]'
              : 'text-[length:calc(1.5rem*var(--pf-services-font-scale,1))] font-semibold leading-tight tracking-[-0.015em] sm:text-[length:calc(1.75rem*var(--pf-services-font-scale,1))]'
          }
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
  ) : null;

  const deliveryNode = card.delivery ? (
    <p className="mt-2 text-[13px] font-medium" style={{ color: muted }}>
      {card.delivery}
    </p>
  ) : null;

  const featuresNode =
    card.features.length > 0 ? (
      <ul className={`flex flex-1 flex-col gap-4 sm:gap-5 ${wide ? 'md:mt-0' : 'mt-9 sm:mt-10'}`}>
        {card.features.map((feature, i) =>
          pricingStyle.style.listBullet !== 'auto' ? (
            <ServicesBulletItem
              key={`${card.id}-f-${i}`}
              bullet={pricingStyle.style.listBullet}
              index={i}
              markerColor={pricingStyle.bulletColor ?? ink}
              className="text-[0.95rem] font-normal leading-snug"
              textStyle={{ color: listInk, opacity: featured ? 1 : 0.92 }}
            >
              {feature}
            </ServicesBulletItem>
          ) : (
            <li
              key={`${card.id}-f-${i}`}
              className="text-[0.95rem] font-normal leading-snug"
              style={{ color: listInk, opacity: featured ? 1 : 0.92 }}
            >
              {feature}
            </li>
          )
        )}
      </ul>
    ) : (
      <div className="flex-1" />
    );

  const ctaNode = card.show.cta ? (
    <ServicesHoverAnchor
      pricingStyle={pricingStyle}
      label={ctaLabel}
      className={`inline-flex min-h-[48px] w-full items-center justify-center rounded-full px-6 text-sm font-semibold ${
        wide ? 'mt-9 md:mt-10' : 'mt-9 sm:mt-10'
      }`}
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
    >
      {ctaLabel}
    </ServicesHoverAnchor>
  ) : null;

  const badgeNode =
    featured && badge ? (
      <span
        className="absolute right-7 top-8 text-[length:calc(0.6875rem*var(--pf-services-font-scale,1))] font-semibold uppercase tracking-[0.22em]"
        style={{ color: muted }}
      >
        {badge}
      </span>
    ) : null;

  const hasAside = card.features.length > 0 || Boolean(ctaNode);

  return (
    <div
      data-svc-card=""
      data-svc-hover={hover}
      data-rest-y={raised ? -20 : 0}
      className={
        wide
          ? `relative grid h-full gap-10 rounded-[2rem] border p-7 sm:p-9 md:gap-0 md:p-0 ${
              hasAside ? 'md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]' : ''
            }`
          : 'relative flex h-full flex-col rounded-[2rem] border p-7 sm:p-9'
      }
      style={{
        ...cardVars(tokens, pricingStyle),
        backgroundColor: featured ? fill.fill : tokens.cardBg,
        borderColor: pricingStyle.borderColor ?? (featured ? `${fill.ink}24` : tokens.cardBorder),
        ...(pricingStyle.borderWidthPx != null ? { borderWidth: pricingStyle.borderWidthPx } : null),
        ...(pricingStyle.cardRadiusPx != null ? { borderRadius: pricingStyle.cardRadiusPx } : null),
        boxShadow: featured ? `0 36px 60px -28px ${fill.blended}66` : 'none',
        zIndex: featured ? 2 : 1,
      }}
      data-pf-no-color-transition=""
    >
      {badgeNode}
      {wide ? (
        <>
          <div className="flex min-w-0 flex-col md:p-12">
            {titleNode}
            {descriptionNode}
            {priceNode}
            {deliveryNode}
          </div>
          {hasAside ? (
            <div
              className="flex min-w-0 flex-col md:border-l md:p-12"
              style={{ borderColor: divider }}
            >
              {featuresNode}
              {ctaNode}
            </div>
          ) : null}
        </>
      ) : (
        <>
          {titleNode}
          {descriptionNode}
          {priceNode}
          {deliveryNode}
          {featuresNode}
          {ctaNode}
        </>
      )}
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
  wide = false,
}: LayoutCardProps & {
  /** One card per row: plan and price on the left, description, included items and button on the right. */
  wide?: boolean;
}) {
  const { price, period } = priceView(card, pricingStyle);
  // An accent close to the page tone (white on a light page, black on a dark one) would leave the
  // featured slab with no visible edge or fill: frame it with the ink instead.
  const accentShows = contrastRatio(accent, tokens.surface) >= 1.5;
  const frameColor = accentShows ? accent : tokens.ink;
  const border = featured ? withAlpha(frameColor, tokens.isLight ? 0.42 : 0.55) : tokens.cardBorder;
  const background = featured
    ? accentShows
      ? fill.fill
      : withAlpha(tokens.ink, tokens.isLight ? 0.05 : 0.08)
    : tokens.cardBg;
  const badgeColor = contrastRatio(accent, tokens.surface) >= 3 ? accent : tokens.ink;
  // The text sits on whatever the featured fill really paints: a strong fill (Contrast at 100%) flips the
  // ink, a faint tint keeps the design's own. Everything is read off the opaque colour the fill shows as.
  const onFill = featured && accentShows;
  const ink = onFill ? readableInk(fill.blended) : tokens.ink;
  const muted = onFill ? softInk(ink, fill.blended, 0.72) : tokens.muted;
  const faint = onFill
    ? softInk(ink, fill.blended, 0.62)
    : tokens.isLight
      ? 'rgba(10,10,10,0.6)'
      : 'rgba(245,245,244,0.62)';
  const hairline = onFill ? withAlpha(ink, 0.2) : tokens.hairline;
  // Checks and bullets keep the accent unless it would melt into its own fill.
  const markColor = onFill && contrastRatio(frameColor, fill.blended) < 3 ? ink : frameColor;
  const figure =
    price.kind === 'amount'
      ? price.amount
      : priceWordLabel(pricingStyle.style, price.kind, price.kind === 'free' ? 'Free' : 'Custom');
  const badgeNode = featured && badge ? (
        // Sits on the card's top edge, out of the flow, so the featured card's title, price and button
        // stay on the same lines as its neighbours'.
        <span
          className="absolute left-6 top-0 inline-flex w-fit -translate-y-1/2 items-center gap-2 rounded-full border px-3 py-1 text-[length:calc(0.6875rem*var(--pf-services-font-scale,1))] font-semibold uppercase tracking-[0.16em] sm:left-8 md:left-7"
          style={{ color: badgeColor, borderColor: border, backgroundColor: tokens.surface }}
        >
          {badge}
        </span>
      ) : null;
  const titleNode = card.show.title ? (
        <p className="text-[length:calc(0.8125rem*var(--pf-services-font-scale,1))] font-medium uppercase leading-none tracking-[0.14em]" style={{ color: ink }}>
          {card.title}
        </p>
      ) : null;
  const priceNode = card.show.price ? (
      <div>
        <FromMark show={price.isFrom && price.kind === 'amount'} color={faint} />
        <div className="flex min-w-0 flex-wrap items-end gap-x-2 gap-y-1">
          <span
            className={
              price.kind === 'amount'
                ? 'whitespace-nowrap text-[length:calc(clamp(2.25rem,13cqi,4.5rem)*var(--pf-services-font-scale,1))] font-extrabold leading-[0.9] tracking-[-0.04em]'
                : 'text-[length:calc(clamp(1.75rem,9cqi,2.75rem)*var(--pf-services-font-scale,1))] font-semibold leading-[1.05] tracking-[-0.025em]'
            }
            style={{ color: ink }}
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
              className="pb-[0.3em] text-[length:calc(0.75rem*var(--pf-services-font-scale,1))] font-medium uppercase leading-none tracking-[0.14em]"
              style={{ color: faint }}
            >
              {period}
            </span>
          ) : null}
        </div>
      </div>
      ) : null;
  const deliveryNode = card.delivery ? (
        <p className="text-[13px] font-medium" style={{ color: muted }}>
          {card.delivery}
        </p>
      ) : null;
  const descriptionNode = card.description ? (
        <p className="text-sm leading-[1.6]" style={{ color: muted }}>
          {card.description}
        </p>
      ) : null;
  const featuresNode = card.features.length > 0 ? (
        <ul className={`grid gap-3 ${wide && card.features.length > 3 ? '@2xl:grid-cols-2 @2xl:gap-x-8' : ''}`}>
          {card.features.map((feature, i) =>
            pricingStyle.style.listBullet !== 'auto' ? (
              <ServicesBulletItem
                key={`${card.id}-f-${i}`}
                bullet={pricingStyle.style.listBullet}
                index={i}
                markerColor={pricingStyle.bulletColor ?? markColor}
                className="text-sm leading-[1.5]"
                textStyle={{ color: ink, opacity: 0.9 }}
              >
                {feature}
              </ServicesBulletItem>
            ) : (
            <li key={`${card.id}-f-${i}`} className="flex items-start gap-2.5 text-sm leading-[1.5]">
              <svg viewBox="0 0 16 16" className="mt-0.5 h-3.5 w-3.5 shrink-0" fill="none" aria-hidden>
                <path
                  d="M3 8.5l3 3 7-7.5"
                  stroke={markColor}
                  strokeWidth={1.6}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span style={{ color: ink, opacity: 0.9 }}>{feature}</span>
            </li>
            )
          )}
        </ul>
      ) : null;
  const ctaNode = card.show.cta ? (
      <ServicesHoverAnchor
        pricingStyle={pricingStyle}
        label={ctaLabel}
        className="mt-auto flex min-h-[48px] w-full items-center justify-center gap-1.5 pt-4 text-sm font-medium tracking-[0.02em] md:w-fit md:justify-start"
        style={{
          color: ink,
          // The hairline only belongs to the "auto" look. It is an inset shadow rather than `borderTop`
          // because the override sets borderStyle/borderWidth, and mixing those with a border
          // shorthand/longhand breaks React's style update when the look changes.
          ...(pricingStyle.style.ctaStyle === 'auto' ? { boxShadow: `inset 0 1px 0 ${hairline}` } : null),
          ...ctaLookOverride(pricingStyle.style.ctaStyle, ink, onFill ? fill.blended : tokens.surface, pricingStyle.ctaRadius),
        }}
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
      </ServicesHoverAnchor>
      ) : null;

  const hasAside = Boolean(descriptionNode) || card.features.length > 0 || Boolean(ctaNode);
  return (
    <div
      data-svc-card=""
      data-svc-hover={hover}
      data-rest-y={raised ? -12 : 0}
      // Same padding on every card (the lift marks the featured one), so titles, prices and buttons
      // line up across the row.
      className="pf-svc-cards-mono-card relative flex w-full flex-col gap-6 rounded-[22px] border px-6 py-9 backdrop-blur-[12px] [container-type:inline-size] sm:gap-7 sm:px-8 md:rounded-[28px] md:px-7 md:py-11"
      style={{
        ...cardVars(tokens, pricingStyle),
        backgroundColor: background,
        borderColor: pricingStyle.borderColor ?? border,
        ...(pricingStyle.borderWidthPx != null ? { borderWidth: pricingStyle.borderWidthPx } : null),
        ...(pricingStyle.cardRadiusPx != null ? { borderRadius: pricingStyle.cardRadiusPx } : null),
        WebkitTapHighlightColor: 'transparent',
      }}
      data-pf-no-color-transition=""
    >
      {badgeNode}
      {wide ? (
        // Container queries (the card is the container), so the two columns follow the card's own width: a
        // narrow card, wherever it sits, keeps the stacked reading order.
        <div
          className={`grid gap-8 ${hasAside ? '@2xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] @2xl:gap-0' : ''}`}
        >
          <div className="flex min-w-0 flex-col gap-6 sm:gap-7 @2xl:pr-10">
            {titleNode}
            {priceNode}
            {deliveryNode}
          </div>
          {hasAside ? (
            <div
              className="flex min-w-0 flex-col gap-6 sm:gap-7 @2xl:border-l @2xl:pl-10"
              style={{ borderColor: hairline }}
            >
              {descriptionNode}
              {featuresNode}
              {ctaNode}
            </div>
          ) : null}
        </div>
      ) : (
        <>
          {titleNode}
          {priceNode}
          {deliveryNode}
          {descriptionNode}
          {featuresNode}
          {ctaNode}
        </>
      )}
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
        textStyle={{ color: ink, opacity: strong ? 1 : 0.92 }}
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
      <span className="text-[0.98rem] leading-snug" style={{ color: ink, opacity: strong ? 1 : 0.92 }}>
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
  const showPattern = featured && motif !== 'none';
  // On a pale tint (light mode) the accent itself can be nearly invisible: fall back to the ink.
  const patternColor = contrastRatio(accent, fill.blended) >= 1.6 ? accent : fill.ink;
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
        className="mb-5 inline-flex w-fit items-center rounded-full px-3 py-1 text-[length:calc(0.6875rem*var(--pf-services-font-scale,1))] font-bold uppercase tracking-[0.16em]"
        style={{ backgroundColor: ink, color: featured ? fill.blended : tokens.surface }}
      >
        {badge}
      </span>
    ) : null;

  const titleEl = card.show.title ? (
    <h3
      className={`font-sans font-semibold leading-[1.05] tracking-tight ${
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
    <p className="mt-7 text-[1.05rem] font-medium" style={{ color: muted }}>
      {priceWordLabel(pricingStyle.style, 'quote', 'Price on request')}
    </p>
  ) : (
    <div className={wide ? 'mt-8' : 'mt-7'}>
      <FromMark show={price.isFrom && price.kind === 'amount'} color={muted} />
      <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-1">
        <span
          className="text-[length:calc(2.4rem*var(--pf-services-font-scale,1))] font-bold leading-none tracking-tight sm:text-[length:calc(3rem*var(--pf-services-font-scale,1))]"
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
      <ServicesHoverAnchor
        pricingStyle={pricingStyle}
        label={ctaLabel}
        className="relative inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full px-6 text-[0.95rem] font-semibold md:w-auto"
        style={{
          ...(pricingStyle.ctaRadius != null ? { borderRadius: pricingStyle.ctaRadius } : null),
          backgroundColor: featured ? ctaInk : 'transparent',
          color: featured ? ctaSurface : tokens.ink,
          borderStyle: 'solid',
          borderWidth: 1,
          borderColor: featured ? ctaInk : tokens.cardBorder,
          ...ctaLookOverride(pricingStyle.style.ctaStyle, ctaInk, ctaSurface, pricingStyle.ctaRadius),
        }}
      >
        {ctaLabel}
        <span aria-hidden className="inline-block">
          →
        </span>
      </ServicesHoverAnchor>
    </div>
  ) : null;

  const shell = (children: ReactNode) => (
    <div
      data-svc-card=""
      data-svc-hover={hover}
      data-rest-y={0}
      className={`relative flex flex-col overflow-hidden rounded-[28px] border ${wide ? 'md:col-span-2' : ''}`}
      style={{
        ...cardVars(tokens, pricingStyle),
        backgroundColor: featured ? fill.blended : tokens.cardBg,
        borderColor: pricingStyle.borderColor ?? tokens.cardBorder,
        ...(pricingStyle.borderWidthPx != null ? { borderWidth: pricingStyle.borderWidthPx } : null),
        ...(pricingStyle.cardRadiusPx != null ? { borderRadius: pricingStyle.cardRadiusPx } : null),
      }}
      data-pf-no-color-transition=""
    >
      {showPattern ? (
        <BentoPatternBackdrop
          color={patternColor}
          tint={fill.blended}
          motif={motif as Exclude<PortfolioServicesPricingBentoMotif, 'none'>}
        />
      ) : null}
      {children}
    </div>
  );

  // Wide (featured, spans the row): the offer on the left — badge, name, price, delivery and the
  // button — and what is included on the right, as a two-column checklist behind a hairline. The
  // card's whole width carries content instead of one narrow stack and an empty half.
  if (wide) {
    const features = card.features;
    return shell(
      <div className="relative z-[1] flex flex-1 flex-col md:flex-row">
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
              <p className="mb-6 text-[length:calc(0.75rem*var(--pf-services-font-scale,1))] font-semibold uppercase tracking-[0.18em]" style={{ color: muted }}>
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
    <div className="relative z-[1] flex flex-1 flex-col p-6 sm:p-9">
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

/** Narrowest a pricing card may get before its price, tasks and button start to wrap badly. */
const MIN_CARD_WIDTH = 272;
const pricingGapFor = (width: number) => (width < 640 ? 20 : width < 1024 ? 28 : 32);

const CARD_MAX_REM = 26;
const WIDE_CARD_MAX_REM = { full: 80, comfortable: 62 } as const;

/**
 * Width of the whole group of cards: capped and centred so two cards no longer stretch across the full
 * section. One card per row has its own, larger cap since it is a horizontal composition.
 */
function cardsWidthStyle(
  width: 'full' | 'comfortable',
  cols: number,
  gapPx: number,
  wide: boolean
): CSSProperties {
  if (wide) return { maxWidth: `${WIDE_CARD_MAX_REM[width]}rem`, marginInline: 'auto' };
  if (width === 'full') return {};
  return { maxWidth: `calc(${cols} * ${CARD_MAX_REM}rem + ${(cols - 1) * gapPx}px)`, marginInline: 'auto' };
}

export function ServicesPricingCardsSection({
  services,
  presentation,
}: {
  services: ProfileServiceItem[];
  presentation: PortfolioServicesPresentationSettings;
}) {
  const t = useT();
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
      return legibleFeaturedFill(base, opacity, tokens.surface);
    }
    if (layout === 'bento') {
      // Bento: the featured header is a *tint* of the accent over the card surface.
      const tint = mixHex(accent, tokens.surface, opacity / 100);
      return { fill: tint, blended: tint, ink: readableInk(tint) };
    }
    return featuredFill(accent, opacity, tokens.surface);
  })();

  const badge = style.featuredShowLabel && style.featuredLabel.trim() ? style.featuredLabel.trim() : null;
  const includedLabel = resolveIncludedLabel(
    style,
    { show: settings.showIncludedLabel, label: settings.includedLabel },
    t("What's included")
  );

  const rootRef = useRef<HTMLDivElement>(null);
  // Real width of the block → how many cards fit. `null` until measured (server render, first paint):
  // the viewport breakpoints below then act as the fallback.
  const track = useFluidTrack(rootRef, count > 0, pricingGapFor, MIN_CARD_WIDTH, layout);
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


  if (count === 0) return null;

  // Columns the grid / monolith really lays out on desktop; the featured card only stands proud of its row
  // when there are three or more across (centre of a trio) — in a pair the lift just reads as misalignment.
  const askedCols = Math.max(1, Math.min(settings.cardsPerRow, layout === 'monolith' ? 4 : 6, count));
  const desktopCols = layout === 'monolith' ? askedCols : balancedColumns(count, askedCols);
  // Once measured, the columns follow the block's real width instead of the window's breakpoints.
  const fluid = track
    ? {
        cols: layout === 'monolith' ? fluidColumns(count, askedCols, track.fit) : balancedColumns(count, Math.max(1, Math.min(askedCols, track.fit))),
        gap: track.gap,
      }
    : null;
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
        (layout === 'grid' || layout === 'monolith'
          ? fluid
            ? fluid.cols > 2
            : isLg && desktopCols > 2
          : false),
      motif: settings.graphicMotif,
      includedLabel: includedLabel ?? '',
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
    // Monolith keeps its asked-for columns: an incomplete last row is centred by the flex row below.
    const colsDesktop = Math.max(1, Math.min(settings.cardsPerRow, 4, count));
    // One card per row (with several plans): a horizontal rectangle, as wide as the Card width setting allows.
    const wideMono = (fluid ? fluid.cols : colsDesktop) === 1 && count > 1;
    const wideBasis = `${WIDE_CARD_MAX_REM[settings.cardWidth]}rem`;
    const tabletBasis = wideMono ? wideBasis : colsTablet === 1 ? '28rem' : basis(colsTablet, GAP_TABLET);
    const desktopBasis = wideMono ? wideBasis : colsDesktop === 1 ? '28rem' : basis(colsDesktop, GAP_DESKTOP);
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
          <div
            className="pf-svc-cards-mono-row"
            style={{
              ...(fluid ? { gap: fluid.gap } : null),
              ...cardsWidthStyle(settings.cardWidth, fluid ? fluid.cols : colsDesktop, fluid ? fluid.gap : GAP_DESKTOP, wideMono),
            }}
          >
            {cards.map((card, index) => (
              <div
                key={card.id}
                className="pf-svc-cards-mono-slot"
                style={
                  fluid
                    ? (() => {
                        const slot = wideMono ? wideBasis : fluid.cols === 1 ? '28rem' : basis(fluid.cols, fluid.gap);
                        return { flexBasis: slot, maxWidth: slot };
                      })()
                    : undefined
                }
              >
                <MonolithCard {...common(card, index)} wide={wideMono} />
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
            {cards.map((card, index) => {
              const wide = index === 0 && featuredIndex === 0 && count >= 3;
              // After the wide featured card the rest run two by two: an odd one out spans both columns
              // instead of sitting alone on the left; it stays one card wide, centred under the pair.
              const rest = count - (featuredIndex === 0 && count >= 3 ? 1 : 0);
              const spansRow = index === count - 1 && !wide && rest > 1 && rest % 2 === 1;
              return spansRow ? (
                <div key={card.id} className="flex md:col-span-2 md:justify-center [&>*]:w-full md:[&>*]:w-[calc(50%-0.75rem)]">
                  <BentoCard {...common(card, index)} wide={false} />
                </div>
              ) : (
                <BentoCard key={card.id} {...common(card, index)} wide={wide} />
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  const cols = balancedColumns(count, Math.max(1, Math.min(settings.cardsPerRow, count)));
  const shownCols = fluid ? fluid.cols : cols;
  // One card per row (with more than one plan): the horizontal composition, not a tall full-width stack.
  const wideGrid = shownCols === 1 && count > 1;
  const gridWidth = cardsWidthStyle(settings.cardWidth, shownCols, fluid ? fluid.gap : 32, wideGrid);
  if (settings.centerLastRow && count > 1) {
    // Same gaps and columns as the grid below, but flex-wrap + a width calc so an incomplete
    // last row can sit centered.
    return (
      <div ref={rootRef} className="relative" data-pf-no-color-transition="">
        {frame}
        <div
          className="relative z-[1] flex flex-wrap justify-center gap-5 py-4 [--pc-g:1.25rem] [--pc-c:1] sm:gap-7 sm:[--pc-g:1.75rem] md:[--pc-c:2] lg:gap-8 lg:[--pc-g:2rem] lg:[--pc-c:var(--pc-c-lg)]"
          style={
            {
              ...(fluid
                ? { gap: fluid.gap, '--pc-c': fluid.cols, '--pc-g': `${fluid.gap}px` }
                : { '--pc-c-lg': cols }),
              ...gridWidth,
            } as unknown as CSSProperties
          }
        >
          {cards.map((card, index) => (
            <div key={card.id} className="flex min-w-0 w-[calc((100%-(var(--pc-c)-1)*var(--pc-g))/var(--pc-c))] [&>*]:w-full">
              <GridCard {...common(card, index)} wide={wideGrid} />
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
        style={{
          ...(fluid ? { gap: fluid.gap, gridTemplateColumns: `repeat(${fluid.cols}, minmax(0, 1fr))` } : null),
          ...gridWidth,
        }}
      >
        {cards.map((card, index) => (
          <GridCard key={card.id} {...common(card, index)} wide={wideGrid} />
        ))}
      </div>
    </div>
  );
}
