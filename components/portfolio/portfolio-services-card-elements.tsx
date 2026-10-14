'use client';

import type { AnchorHTMLAttributes, CSSProperties, ReactNode } from 'react';
import { ctaLookOverride } from '@/components/portfolio/portfolio-services-pricing-shared';
import { readServicesPricingStyle } from '@/components/portfolio/portfolio-services-pricing-style';
import type { ServicesPricingStyle } from '@/components/portfolio/portfolio-services-pricing-runtime';
import type { PortfolioServicesPresentationSettings } from '@/components/portfolio/portfolio-services-settings';

/**
 * General → Card elements: the six switches every Services design must obey, whatever its layout.
 * A design asks once and then gates each piece of a card on the matching flag, so the General tab
 * stays the single source of truth (a design's own "Show tasks" style options are ANDed on top).
 */
export type ServicesCardElements = {
  title: boolean;
  description: boolean;
  price: boolean;
  delivery: boolean;
  tasks: boolean;
  cta: boolean;
  /** General → Delivery text, e.g. "{time} delivery". */
  deliveryTemplate: string;
};

export type ServicesOptInElement = 'tasks' | 'delivery' | 'cta' | 'price';

type OptInField = 'showTasks' | 'showDelivery' | 'showCta' | 'showPrice';

/** The design-level switch behind each opt-in element, per minimal design. */
export const SERVICES_OPT_IN_FIELDS: Record<ServicesOptInElement, OptInField> = {
  tasks: 'showTasks',
  delivery: 'showDelivery',
  cta: 'showCta',
  price: 'showPrice',
};

export type ServicesOptInBlock = 'mediaColumns' | 'iconCards' | 'capabilities';

/** What each minimal design shows until General says otherwise. An element missing from a block
 *  is not opt-in there (it follows the shared switch alone). */
export const SERVICES_OPT_IN_DEFAULTS: Record<ServicesOptInBlock, Partial<Record<OptInField, boolean>>> = {
  mediaColumns: { showTasks: false, showDelivery: false, showCta: false },
  iconCards: { showTasks: false, showDelivery: false, showCta: false },
  // Capabilities: title, description and tasks only.
  capabilities: { showTasks: true, showDelivery: false, showCta: false, showPrice: false },
};

type OptInSource = {
  sectionDesign?: string;
} & Partial<Record<ServicesOptInBlock, Partial<Record<OptInField, boolean>>>>;

/** Which settings block holds the opt-in switches of the active design, or null when the design
 *  shows every element by default. Media Columns and Icon Cards stay minimal (media / icon, title,
 *  description), Capabilities shows title, description and tasks, until General turns the rest on
 *  for that design. */
export function servicesOptInBlock(design: string | undefined): ServicesOptInBlock | null {
  if (design === 'services-media-columns') return 'mediaColumns';
  if (design === 'services-icon-cards') return 'iconCards';
  if (design === 'services-capabilities') return 'capabilities';
  return null;
}

/** Whether `element` is one of the active design's opt-in switches. */
export function servicesIsOptIn(design: string | undefined, element: ServicesOptInElement): boolean {
  const block = servicesOptInBlock(design);
  return Boolean(block && SERVICES_OPT_IN_FIELDS[element] in SERVICES_OPT_IN_DEFAULTS[block]);
}

/** Whether the active design lets `element` show (always true outside the minimal designs). */
export function servicesDesignAllows(source: OptInSource, element: ServicesOptInElement): boolean {
  const block = servicesOptInBlock(source.sectionDesign);
  if (!block) return true;
  const field = SERVICES_OPT_IN_FIELDS[element];
  const defaults = SERVICES_OPT_IN_DEFAULTS[block];
  if (!(field in defaults)) return true;
  return (source[block]?.[field] ?? defaults[field]) === true;
}

export function resolveServicesCardElements(
  presentation: PortfolioServicesPresentationSettings
): ServicesCardElements {
  return {
    title: presentation.showServiceTitle !== false,
    description: presentation.showServiceDescription !== false,
    price: presentation.showServicePrice !== false && servicesDesignAllows(presentation, 'price'),
    delivery: presentation.showServiceDelivery !== false && servicesDesignAllows(presentation, 'delivery'),
    tasks: presentation.showServiceTasks !== false && servicesDesignAllows(presentation, 'tasks'),
    cta: presentation.showServiceCta !== false && servicesDesignAllows(presentation, 'cta'),
    deliveryTemplate: presentation.serviceDeliveryTemplate ?? '',
  };
}

/** The three pricing designs paint their own Background frame (with their own surface tokens). */
export function servicesDesignHasOwnFrame(design: string | undefined): boolean {
  return (
    design === 'services-pricing' || design === 'services-pricing-aurora' || design === 'services-pricing-toggle'
  );
}

/**
 * Design → Background → "Background frame" (shared `pricingStyle.showFrame`) for every design
 * that does not paint its own: a full-bleed backdrop one step off the section background, with
 * vertical breathing room. Off → renders the children untouched.
 */
export function ServicesBackgroundFrame({
  presentation,
  children,
}: {
  presentation: PortfolioServicesPresentationSettings;
  children: ReactNode;
}) {
  const show =
    !servicesDesignHasOwnFrame(presentation.sectionDesign) && readServicesPricingStyle(presentation).showFrame;
  if (!show) return <>{children}</>;
  const isLight = presentation.activeColorMode !== 'dark';
  const sectionBg = presentation.sectionBackgroundColor?.trim() || (isLight ? '#ffffff' : '#0a0a0a');
  const backdrop = `color-mix(in srgb, ${isLight ? '#0a0a0a' : '#ffffff'} ${isLight ? 4 : 4.5}%, ${sectionBg})`;
  return (
    <div className="relative py-14 sm:py-20 md:py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 left-1/2 w-screen -translate-x-1/2"
        style={{ backgroundColor: backdrop }}
        data-pf-no-color-transition=""
      />
      <div className="relative z-[1]">{children}</div>
    </div>
  );
}

/** The order button's label from General → Order button. */
export function resolveServicesCtaLabel(presentation: PortfolioServicesPresentationSettings): string {
  return presentation.ctaLabel?.trim() || 'Get started';
}

type ServicesOrderButtonProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'onClick' | 'style'> & {
  pricingStyle: ServicesPricingStyle;
  label: string;
  /** Text / border colour of the filled, outline and link looks. */
  ink: string;
  /** Text colour on the filled look (the colour the button sits on). */
  surface: string;
  style?: CSSProperties;
  /** Drawn instead of `label` while the look is "Auto" — the design's own trailing icon, brackets… */
  autoContent?: ReactNode;
};

/**
 * One order button for every Services design. The destination (Contact, a section or a URL, with
 * its new-tab behaviour) comes from `pricingStyle.anchorProps`; the look and shape picked in
 * General → Order button override the design's own button, and "Auto" keeps it as designed.
 */
export function ServicesOrderButton({
  pricingStyle,
  label,
  ink,
  surface,
  style,
  autoContent,
  children,
  ...rest
}: ServicesOrderButtonProps) {
  const look = pricingStyle.style.ctaStyle;
  const override = ctaLookOverride(look, ink, surface, pricingStyle.ctaRadius);
  return (
    <a
      {...rest}
      {...pricingStyle.anchorProps}
      data-svc-cta=""
      data-pf-no-color-transition=""
      style={{
        ...style,
        ...(pricingStyle.ctaRadius != null ? { borderRadius: pricingStyle.ctaRadius } : null),
        ...override,
      }}
    >
      {look === 'auto' ? (autoContent ?? label) : label}
      {children}
    </a>
  );
}
