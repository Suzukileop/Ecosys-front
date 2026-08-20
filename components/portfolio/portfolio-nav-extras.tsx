'use client';

import { useEffect, useState, type CSSProperties, type FocusEvent, type ReactNode } from 'react';
import {
  SocialPlatformIcon,
  normalizeSocialPlatformKey,
  type SocialPlatformKey,
} from '@/components/marketplace/creator-profile-social-icons';
import { PortfolioNavContactCtaGlyph } from '@/components/portfolio/portfolio-nav-contact-cta-icons';
import {
  formatNavLabel,
  portfolioNavBarHostsInlineExtras,
  portfolioNavExtrasAllowedForBarWidth,
  portfolioNavFreeSpaceClusterClass,
  portfolioNavFreeSpaceSides,
  portfolioNavIsVertical,
  portfolioNavResolveExtrasPlacement,
  portfolioNavResolveExtrasSide,
  resolvePortfolioNavMobileChrome,
} from '@/components/portfolio/portfolio-nav-settings';
import type {
  PortfolioNavContactButtonDisplay,
  PortfolioNavContactButtonShape,
  PortfolioNavContactCtaIcon,
  PortfolioNavCustomExtraDisplay,
  PortfolioNavExtrasPlacement,
  PortfolioNavExtrasSide,
  PortfolioNavLinkIconSource,
  PortfolioNavSettings,
} from '@/components/portfolio/portfolio-settings-types';
import {
  clampPortfolioNavCustomExtraFontSizePx,
  clampPortfolioNavCustomExtraGapPx,
  clampPortfolioNavCustomExtraLogoSizePx,
  clampPortfolioNavCustomExtraPaddingX,
  clampPortfolioNavCustomExtraPaddingY,
  normalizePortfolioNavCustomExtraDisplay,
  normalizePortfolioNavCustomExtraPlacement,
  normalizePortfolioNavExtrasPlacement,
  portfolioNavContactButtonShapeClass,
  portfolioNavCustomExtraFontFamily,
  portfolioNavCustomExtraFontWeightValue,
  resolvePortfolioNavExtraAdjacentPosition,
  sanitizePortfolioNavCustomHref,
} from '@/components/portfolio/portfolio-settings-types';

export type PortfolioNavChromeLink = {
  id: string;
  href: string;
  label: string;
  source: PortfolioNavLinkIconSource;
};

function useMinWidth(px: number) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${px}px)`);
    const update = () => setMatches(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, [px]);
  return matches;
}

function platformToSource(platform: string): PortfolioNavLinkIconSource | null {
  const key = normalizeSocialPlatformKey(platform);
  if (key === 'youtube') return 'youtube';
  if (key === 'twitter') return 'twitter';
  if (key === 'linkedin') return 'linkedin';
  if (key === 'github') return 'github';
  if (key === 'instagram') return 'instagram';
  if (key === 'tiktok') return 'tiktok';
  if (key === 'other') return 'other';
  return null;
}

export function buildPortfolioNavChromeLinks({
  sources,
  email,
  socialLinks,
}: {
  sources: PortfolioNavLinkIconSource[];
  email?: string | null;
  socialLinks: Array<{ id: string; platform: string; url: string; label: string }>;
}): PortfolioNavChromeLink[] {
  const enabled = new Set(sources);
  const links: PortfolioNavChromeLink[] = [];

  if (enabled.has('mail')) {
    const trimmed = email?.trim();
    if (trimmed) {
      links.push({
        id: 'mail',
        href: `mailto:${trimmed}`,
        label: 'Email',
        source: 'mail',
      });
    }
  }

  for (const social of socialLinks) {
    const source = platformToSource(social.platform);
    if (!source || !enabled.has(source)) continue;
    const href = social.url.trim();
    if (!href) continue;
    links.push({
      id: social.id || source,
      href,
      label: social.label || source,
      source,
    });
  }

  return links;
}

function MailGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z"
      />
    </svg>
  );
}

function resolveLinkIconColors(settings: PortfolioNavSettings) {
  return {
    background: settings.linkIconBackgroundColor ?? '#ffffff',
    icon: settings.linkIconColor ?? '#404040',
    border: settings.linkIconBorderColor ?? '#e5e5e5',
  };
}

function navColorLuminance(hex: string): number {
  const raw = hex.trim().replace('#', '');
  const full =
    raw.length === 3
      ? raw
          .split('')
          .map((char) => `${char}${char}`)
          .join('')
      : raw;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return 0.5;
  const toLinear = (channel: number) =>
    channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  const r = toLinear(parseInt(full.slice(0, 2), 16) / 255);
  const g = toLinear(parseInt(full.slice(2, 4), 16) / 255);
  const b = toLinear(parseInt(full.slice(4, 6), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Last-resort guard for hand-picked chip colors: swap in black or white ink
 * when the label would be practically invisible on its own background.
 */
function navReadableInk(ink: string, background: string): string {
  const inkLuminance = navColorLuminance(ink);
  const backgroundLuminance = navColorLuminance(background);
  const lighter = Math.max(inkLuminance, backgroundLuminance);
  const darker = Math.min(inkLuminance, backgroundLuminance);
  if ((lighter + 0.05) / (darker + 0.05) >= 2) return ink;
  return backgroundLuminance > 0.5 ? '#0a0a0a' : '#ffffff';
}

function resolveContactButtonChrome(settings: PortfolioNavSettings) {
  return {
    background: settings.contactButtonBackgroundColor ?? '#171717',
    color: settings.contactButtonColor ?? '#ffffff',
    border: settings.contactButtonBorderColor ?? '#171717',
    borderEnabled: settings.contactButtonBorderEnabled ?? false,
    glass: settings.contactButtonGlassEffect ?? false,
    shadow: settings.contactButtonShadowEnabled ?? true,
  };
}

function customExtraHasVisibleContent(settings: PortfolioNavSettings): boolean {
  if (!(settings.customExtraEnabled ?? false)) return false;
  const display = normalizePortfolioNavCustomExtraDisplay(settings.customExtraDisplay);
  const logo = (settings.customExtraLogoUrl ?? '').trim();
  const text = (settings.customExtraText ?? '').trim();
  if (display === 'logo') return Boolean(logo);
  if (display === 'text') return Boolean(text);
  return Boolean(logo || text);
}

/** Configurable Contact glyph — phone variants. */
function ContactGlyph({
  className,
  icon = 'phone',
}: {
  className?: string;
  icon?: PortfolioNavContactCtaIcon;
}) {
  return <PortfolioNavContactCtaGlyph variant={icon} className={className} />;
}

function LinkIconButton({
  link,
  compact,
  colors,
}: {
  link: PortfolioNavChromeLink;
  compact?: boolean;
  colors: { background: string; icon: string; border: string };
}) {
  const size = compact ? 'h-9 w-9' : 'h-10 w-10';
  const shellStyle = {
    backgroundColor: colors.background,
    borderColor: colors.border,
    color: colors.icon,
  };

  if (link.source === 'mail') {
    return (
      <a
        href={link.href}
        aria-label={link.label}
        title={link.label}
        style={shellStyle}
        className={`inline-flex ${size} items-center justify-center rounded-full border shadow-[0_8px_24px_rgba(0,0,0,0.08)] backdrop-blur-md transition hover:opacity-90`}
      >
        <MailGlyph className="h-4 w-4" />
      </a>
    );
  }

  const platform = normalizeSocialPlatformKey(link.source) as SocialPlatformKey;
  return (
    <a
      href={link.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={link.label}
      title={link.label}
      style={shellStyle}
      className={`inline-flex ${size} items-center justify-center rounded-full border shadow-[0_8px_24px_rgba(0,0,0,0.08)] backdrop-blur-md transition hover:opacity-90`}
    >
      <SocialPlatformIcon platform={platform} className="h-3.5 w-3.5" />
    </a>
  );
}

function ContactFreeSpaceButton({
  label,
  labelCase,
  href,
  onNavigate,
  display = 'icon',
  icon = 'phone',
  shape = 'pill',
  chrome,
  compact,
}: {
  label: string;
  labelCase: PortfolioNavSettings['labelCase'];
  href: string;
  onNavigate?: () => void;
  display?: PortfolioNavContactButtonDisplay;
  icon?: PortfolioNavContactCtaIcon;
  shape?: PortfolioNavContactButtonShape;
  chrome: ReturnType<typeof resolveContactButtonChrome>;
  compact?: boolean;
}) {
  const shadowClass = chrome.shadow ? 'shadow-[0_8px_24px_rgba(0,0,0,0.12)]' : 'shadow-none';
  const glassClass = chrome.glass ? 'backdrop-blur-md' : '';
  const shapeClass = portfolioNavContactButtonShapeClass(shape);
  const shellStyle = {
    backgroundColor: chrome.background,
    color: chrome.color,
    borderColor: chrome.borderEnabled ? chrome.border : 'transparent',
    borderWidth: chrome.borderEnabled ? 1 : 0,
    borderStyle: 'solid' as const,
  };

  if (display !== 'button') {
    const size = compact ? 'h-9 w-9' : 'h-10 w-10';
    const iconClassName = `inline-flex ${size} items-center justify-center ${shapeClass} transition hover:opacity-90 ${shadowClass} ${glassClass}`;
    const glyph = <ContactGlyph icon={icon} className="h-4 w-4" />;
    if (onNavigate) {
      return (
        <button
          type="button"
          onClick={onNavigate}
          aria-label={label}
          title={label}
          className={iconClassName}
          style={shellStyle}
        >
          {glyph}
        </button>
      );
    }
    return (
      <a href={href} aria-label={label} title={label} className={iconClassName} style={shellStyle}>
        {glyph}
      </a>
    );
  }

  const caseClass =
    labelCase === 'uppercase'
      ? 'uppercase tracking-[0.14em]'
      : 'normal-case tracking-normal';
  const className = `inline-flex shrink-0 items-center justify-center gap-2 ${shapeClass} text-[15px] font-semibold ${caseClass} transition hover:opacity-90 ${shadowClass} ${glassClass} ${
    compact ? 'min-h-9 px-3.5 py-1.5 text-sm' : 'min-h-10 px-4 py-2'
  }`;
  const content = (
    <>
      <ContactGlyph icon={icon} className="h-3.5 w-3.5" />
      <span>{formatNavLabel(label, labelCase)}</span>
    </>
  );

  if (onNavigate) {
    return (
      <button type="button" onClick={onNavigate} aria-label={label} className={className} style={shellStyle}>
        {content}
      </button>
    );
  }

  return (
    <a href={href} aria-label={label} className={className} style={shellStyle}>
      {content}
    </a>
  );
}

function CustomExtraChip({ settings, compact }: { settings: PortfolioNavSettings; compact?: boolean }) {
  const display = normalizePortfolioNavCustomExtraDisplay(settings.customExtraDisplay) as PortfolioNavCustomExtraDisplay;
  const logoUrl = (settings.customExtraLogoUrl ?? '').trim();
  const text = (settings.customExtraText ?? '').trim();
  const showLogo = (display === 'logo' || display === 'both') && Boolean(logoUrl);
  const showText = (display === 'text' || display === 'both') && Boolean(text);
  if (!showLogo && !showText) return null;

  const fontSize = clampPortfolioNavCustomExtraFontSizePx(
    settings.customExtraFontSizePx,
    12
  );
  const logoSize = clampPortfolioNavCustomExtraLogoSizePx(
    settings.customExtraLogoSizePx,
    20
  );
  const gap = clampPortfolioNavCustomExtraGapPx(settings.customExtraGapPx, 6);
  const padX = clampPortfolioNavCustomExtraPaddingX(settings.customExtraPaddingX, 10);
  const padY = clampPortfolioNavCustomExtraPaddingY(settings.customExtraPaddingY, 6);
  const shapeClass = portfolioNavContactButtonShapeClass(settings.customExtraShape ?? 'soft');
  const borderEnabled = settings.customExtraBorderEnabled ?? false;
  const href = sanitizePortfolioNavCustomHref(settings.customExtraHref);
  const openNewTab = settings.customExtraOpenNewTab ?? true;
  const alt = text || 'Extra';
  const label = text || 'Extra';

  const background = settings.customExtraBackgroundColor ?? '#ffffff';
  const ink = navReadableInk(settings.customExtraTextColor ?? '#171717', background);

  const shellStyle: CSSProperties = {
    backgroundColor: background,
    color: ink,
    borderColor: borderEnabled ? settings.customExtraBorderColor ?? '#e5e5e5' : 'transparent',
    borderWidth: borderEnabled ? 1 : 0,
    borderStyle: 'solid',
    gap,
    paddingLeft: padX,
    paddingRight: padX,
    paddingTop: padY,
    paddingBottom: padY,
    fontFamily: portfolioNavCustomExtraFontFamily(settings.customExtraFont),
    fontWeight: portfolioNavCustomExtraFontWeightValue(settings.customExtraFontWeight),
    fontSize: compact ? Math.max(9, fontSize - 1) : fontSize,
  };

  const inner = (
    <>
      {showLogo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logoUrl}
          alt={alt}
          width={logoSize}
          height={logoSize}
          className="shrink-0 object-contain"
          style={{ width: logoSize, height: logoSize }}
        />
      ) : null}
      {showText ? (
        <span
          className="min-w-0 truncate tracking-tight"
          // em cap scales with the font size; the vw guard keeps the chip inside narrow screens.
          style={{ maxWidth: 'min(26em, calc(100vw - 3rem))', lineHeight: 1.15 }}
        >
          {text}
        </span>
      ) : null}
    </>
  );

  // min-w-0 + shrink: inside a full-width bar the chip ellipsizes instead of being
  // cut off by the bar's overflow-hidden; hug bars still grow to fit the label.
  const className = `inline-flex min-w-0 max-w-full shrink items-center justify-center ${shapeClass} transition hover:opacity-90`;

  if (href) {
    const external = /^https?:\/\//i.test(href);
    return (
      <a
        href={href}
        aria-label={label}
        title={label}
        className={className}
        style={shellStyle}
        {...(external && openNewTab
          ? { target: '_blank', rel: 'noopener noreferrer' }
          : null)}
      >
        {inner}
      </a>
    );
  }

  return (
    <span aria-label={label} title={label} className={className} style={shellStyle}>
      {inner}
    </span>
  );
}

export type PortfolioNavExtrasModel = {
  showContact: boolean;
  iconLinks: PortfolioNavChromeLink[];
  contactLabel: string;
  /** Side for link icons when free-side (null when none / adjacent). */
  iconsSide: 'left' | 'right' | null;
  /** Side for Contact when free-side (null when none / adjacent). */
  contactSide: 'left' | 'right' | null;
  /** Side for custom extra when free-side (null when none / adjacent). */
  customSide: 'left' | 'right' | null;
  /** Adjacent slot for link icons (null when free-side / hidden). */
  iconsAdjacent: 'before' | 'after' | null;
  /** Adjacent slot for Contact (null when free-side / hidden). */
  contactAdjacent: 'before' | 'after' | null;
  /** Adjacent slot for custom extra (null when free-side / hidden). */
  customAdjacent: 'before' | 'after' | null;
  /** @deprecated Use iconsSide / contactSide / customSide. */
  extrasSide: 'left' | 'right' | null;
  /** @deprecated Shared legacy placement — icons still use extrasPlacement. */
  extrasPlacement: PortfolioNavExtrasPlacement;
  /** True when any free-side extra sits inside full-width free left/right slots. */
  inlineInBar: boolean;
  /** True when at least one extra docks before/after section buttons. */
  adjacentToNav: boolean;
  /** True when at least one extra uses free-side docking. */
  freeSideExtras: boolean;
  showCustomExtra: boolean;
  verticalExtras: boolean;
  hasAnyExtras: boolean;
};

function resolveExtraDock(opts: {
  placement: PortfolioNavExtrasPlacement;
  side: PortfolioNavExtrasSide;
  enabled: boolean;
  canFree: boolean;
  canAdjacent: boolean;
  freeSides: Array<'left' | 'right'>;
}): {
  freeSide: 'left' | 'right' | null;
  adjacent: 'before' | 'after' | null;
} {
  if (!opts.enabled) return { freeSide: null, adjacent: null };
  const adjacent = resolvePortfolioNavExtraAdjacentPosition(opts.placement, opts.side);
  if (adjacent) {
    return opts.canAdjacent
      ? { freeSide: null, adjacent }
      : { freeSide: null, adjacent: null };
  }
  if (!opts.canFree) return { freeSide: null, adjacent: null };
  return {
    freeSide: portfolioNavResolveExtrasSide(opts.freeSides, opts.side),
    adjacent: null,
  };
}

/** Resolve which extras to show for the current viewport + settings. */
export function usePortfolioNavExtrasModel(
  settings: PortfolioNavSettings,
  links: PortfolioNavChromeLink[]
): PortfolioNavExtrasModel {
  const isMdUp = useMinWidth(768);
  const isLgUp = useMinWidth(1024);
  const isXlUp = useMinWidth(1280);
  const mobileChrome = resolvePortfolioNavMobileChrome(settings, isLgUp, isXlUp);
  const freeSides = portfolioNavFreeSpaceSides(mobileChrome.placement);

  const iconsPlacement = normalizePortfolioNavExtrasPlacement(settings.extrasPlacement);
  const contactPlacement = normalizePortfolioNavExtrasPlacement(
    settings.contactExtrasPlacement ?? settings.extrasPlacement
  );
  const customPlacement = normalizePortfolioNavExtrasPlacement(
    settings.customExtraLayoutPlacement ?? settings.extrasPlacement
  );

  const contactConfigured = settings.contactButtonEnabled ?? false;
  const iconsConfigured = Boolean(settings.linkIconsEnabled && links.length > 0);
  const showContact = Boolean(contactConfigured && (isLgUp || (isMdUp && !isLgUp)));
  const showIcons = Boolean(
    iconsConfigured && (isLgUp || (isMdUp && !isLgUp && !contactConfigured))
  );
  const fullWidthOnly = portfolioNavExtrasAllowedForBarWidth(mobileChrome.barWidth);
  const canAdjacent = isMdUp;
  const canFree = isMdUp && fullWidthOnly;
  const hasIconsConfigured = showIcons;
  const hasContactConfigured = showContact;
  const showCustomConfigured = Boolean(customExtraHasVisibleContent(settings));

  // Icons + Contact still share free-side resolution (including detach), then custom is independent.
  const iconsOrContactFree =
    (iconsPlacement === 'free-side' && hasIconsConfigured && canFree) ||
    (contactPlacement === 'free-side' && hasContactConfigured && canFree);

  const groupedFree = iconsOrContactFree
    ? portfolioNavResolveExtrasPlacement({
        freeSides,
        extrasPreference: settings.extrasSide ?? 'auto',
        contactPreference: settings.contactButtonSide ?? 'auto',
        hasIcons: iconsPlacement === 'free-side' && hasIconsConfigured && canFree,
        hasContact: contactPlacement === 'free-side' && hasContactConfigured && canFree,
        contactDetached:
          (settings.contactButtonDetached ?? false) ||
          iconsPlacement !== contactPlacement ||
          (settings.extrasSide ?? 'auto') !== (settings.contactButtonSide ?? 'auto'),
      })
    : { iconsSide: null as 'left' | 'right' | null, contactSide: null as 'left' | 'right' | null };

  const iconsAdjacent =
    iconsPlacement !== 'free-side' && hasIconsConfigured && canAdjacent
      ? resolvePortfolioNavExtraAdjacentPosition(iconsPlacement, settings.extrasSide ?? 'auto')
      : null;
  const contactAdjacent =
    contactPlacement !== 'free-side' && hasContactConfigured && canAdjacent
      ? resolvePortfolioNavExtraAdjacentPosition(
          contactPlacement,
          settings.contactButtonSide ?? 'auto'
        )
      : null;

  const customDock = resolveExtraDock({
    placement: customPlacement,
    side: settings.customExtraSide ?? 'auto',
    enabled: showCustomConfigured && isMdUp,
    canFree,
    canAdjacent,
    freeSides,
  });

  const iconsSide =
    iconsPlacement === 'free-side' && hasIconsConfigured && canFree
      ? groupedFree.iconsSide
      : null;
  const contactSide =
    contactPlacement === 'free-side' && hasContactConfigured && canFree
      ? groupedFree.contactSide
      : null;
  const customSide = customDock.freeSide;
  const customAdjacent = customDock.adjacent;

  const hasIcons = Boolean(iconsSide || iconsAdjacent);
  const hasContact = Boolean(contactSide || contactAdjacent);
  const showCustomExtra = Boolean(customSide || customAdjacent);
  const hasAnyExtras = hasIcons || hasContact || showCustomExtra;
  const freeSideExtras = Boolean(iconsSide || contactSide || customSide);
  const adjacentToNav = Boolean(iconsAdjacent || contactAdjacent || customAdjacent);

  return {
    showContact: hasContact,
    iconLinks: hasIcons ? links : [],
    contactLabel: (settings.contactButtonLabel ?? 'Contact').trim() || 'Contact',
    iconsSide,
    contactSide,
    customSide,
    iconsAdjacent,
    contactAdjacent,
    customAdjacent,
    extrasSide: iconsSide ?? contactSide ?? customSide,
    extrasPlacement: iconsPlacement,
    inlineInBar:
      freeSideExtras &&
      portfolioNavBarHostsInlineExtras(mobileChrome.barWidth, mobileChrome.placement),
    adjacentToNav,
    freeSideExtras,
    showCustomExtra,
    verticalExtras: portfolioNavIsVertical(mobileChrome.placement),
    hasAnyExtras,
  };
}

/** Shared Contact + link icons cluster (optionally icons-only or contact-only). */
export function PortfolioNavExtrasCluster({
  settings,
  model,
  contactHref = '#contact',
  onContactNavigate,
  compact,
  className = '',
  includeIcons = true,
  includeContact = true,
  includeCustom = true,
}: {
  settings: PortfolioNavSettings;
  model: PortfolioNavExtrasModel;
  monochrome?: boolean;
  contactHref?: string;
  onContactNavigate?: () => void;
  /** @deprecated Display comes from settings.contactButtonDisplay. */
  iconOnlyContact?: boolean;
  compact?: boolean;
  className?: string;
  includeIcons?: boolean;
  includeContact?: boolean;
  /** When false, skip the custom chip (used to avoid duplicates on a detached Contact side). */
  includeCustom?: boolean;
}) {
  const icons = includeIcons ? model.iconLinks : [];
  const showContact = includeContact && model.showContact;
  const showCustom = includeCustom && model.showCustomExtra;
  if (!showContact && icons.length === 0 && !showCustom) return null;
  const colors = resolveLinkIconColors(settings);
  const contactChrome = resolveContactButtonChrome(settings);
  /** Side rails (left/right nav) only have a narrow edge band — labeled pills clip off-screen. */
  const contactDisplay: PortfolioNavContactButtonDisplay = model.verticalExtras
    ? 'icon'
    : ((settings.contactButtonDisplay ?? 'icon') as PortfolioNavContactButtonDisplay);
  const contactIcon = (settings.contactButtonIcon ?? 'phone') as PortfolioNavContactCtaIcon;
  const contactShape = (settings.contactButtonShape ?? 'pill') as PortfolioNavContactButtonShape;
  const customPlacement = normalizePortfolioNavCustomExtraPlacement(settings.customExtraPlacement);
  const customNode = showCustom ? <CustomExtraChip settings={settings} compact={compact} /> : null;

  const legacyNodes: ReactNode[] = [
    ...icons.map((link) => (
      <LinkIconButton key={link.id} link={link} compact={compact} colors={colors} />
    )),
    ...(showContact
      ? [
          <ContactFreeSpaceButton
            key="contact"
            label={model.contactLabel}
            labelCase={settings.labelCase}
            href={contactHref}
            onNavigate={onContactNavigate}
            display={contactDisplay}
            icon={contactIcon}
            shape={contactShape}
            chrome={contactChrome}
            compact={compact}
          />,
        ]
      : []),
  ];

  return (
    <div
      className={`flex items-center gap-2 ${
        model.verticalExtras ? 'flex-col' : 'flex-row'
      } ${className}`}
    >
      {customPlacement === 'before' ? customNode : null}
      {legacyNodes}
      {customPlacement === 'after' ? customNode : null}
    </div>
  );
}

/**
 * Floating extras when the bar is hug/medium or vertical — hidden while the menu
 * handle is showing (collapsed), so the chrome does not look detached.
 * Hover/focus handlers keep reveal-on-hover open while the pointer crosses the gap.
 */
export function PortfolioNavFreeSpaceLinks({
  settings,
  links,
  monochrome,
  opacity = 1,
  contactHref = '#contact',
  onContactNavigate,
  navRevealed = true,
  onMouseEnter,
  onMouseLeave,
  onFocusCapture,
  onBlurCapture,
}: {
  settings: PortfolioNavSettings;
  links: PortfolioNavChromeLink[];
  monochrome?: boolean;
  opacity?: number;
  contactHref?: string;
  onContactNavigate?: () => void;
  /** False while the reveal handle is showing (menu collapsed). */
  navRevealed?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onFocusCapture?: () => void;
  onBlurCapture?: (event: FocusEvent<HTMLElement>) => void;
}) {
  const isLgUp = useMinWidth(1024);
  const isXlUp = useMinWidth(1280);
  const mobileChrome = resolvePortfolioNavMobileChrome(settings, isLgUp, isXlUp);
  const model = usePortfolioNavExtrasModel(settings, links);

  if (!navRevealed) return null;
  if (!settings.enabled) return null;
  if (model.inlineInBar) return null;
  if (!model.freeSideExtras) return null;
  if (!model.hasAnyExtras) return null;

  const sides = Array.from(
    new Set(
      [model.iconsSide, model.contactSide, model.customSide].filter(Boolean) as Array<'left' | 'right'>
    )
  );
  if (sides.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[95]"
      aria-label="Portfolio quick links"
      style={{ opacity }}
    >
      {sides.map((side) => (
        <div
          key={side}
          className={`pointer-events-auto absolute -m-4 p-4 ${portfolioNavFreeSpaceClusterClass(
            mobileChrome.placement,
            side,
            settings.edgeOffset,
            settings.edgeOffsetCloseOnMobile ?? true
          )}`}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          onFocusCapture={onFocusCapture}
          onBlurCapture={onBlurCapture}
        >
          <PortfolioNavExtrasCluster
            settings={settings}
            model={model}
            monochrome={monochrome}
            contactHref={contactHref}
            onContactNavigate={onContactNavigate}
            includeIcons={model.iconsSide === side}
            includeContact={model.contactSide === side}
            includeCustom={model.customSide === side}
          />
        </div>
      ))}
    </div>
  );
}

/** Inline extras slot for wide/full horizontal bars (fills the empty side of the shell). */
export function PortfolioNavInlineExtras({
  settings,
  links,
  monochrome,
  contactHref = '#contact',
  onContactNavigate,
  side,
}: {
  settings: PortfolioNavSettings;
  links: PortfolioNavChromeLink[];
  monochrome?: boolean;
  contactHref?: string;
  onContactNavigate?: () => void;
  side: 'left' | 'right';
}) {
  const model = usePortfolioNavExtrasModel(settings, links);
  if (!model.inlineInBar) return null;
  const includeIcons = model.iconsSide === side;
  const includeContact = model.contactSide === side;
  const includeCustom = model.customSide === side;
  if (!includeIcons && !includeContact && !includeCustom) return null;

  return (
    <PortfolioNavExtrasCluster
      settings={settings}
      model={model}
      monochrome={monochrome}
      contactHref={contactHref}
      onContactNavigate={onContactNavigate}
      includeIcons={includeIcons}
      includeContact={includeContact}
      includeCustom={includeCustom}
      compact
      className={`shrink-0 ${
        side === 'left'
          ? model.verticalExtras
            ? 'mb-8'
            : 'mr-12 sm:mr-20'
          : model.verticalExtras
            ? 'mt-8'
            : 'ml-12 sm:ml-20'
      }`}
    />
  );
}

/**
 * Extras cluster immediately before/after section buttons (or above/below on vertical rails).
 */
export function PortfolioNavAdjacentExtras({
  settings,
  links,
  monochrome,
  contactHref = '#contact',
  onContactNavigate,
  position,
}: {
  settings: PortfolioNavSettings;
  links: PortfolioNavChromeLink[];
  monochrome?: boolean;
  contactHref?: string;
  onContactNavigate?: () => void;
  position: 'before' | 'after';
}) {
  const model = usePortfolioNavExtrasModel(settings, links);
  if (!model.adjacentToNav) return null;
  const includeIcons = model.iconsAdjacent === position;
  const includeContact = model.contactAdjacent === position;
  const includeCustom = model.customAdjacent === position;
  if (!includeIcons && !includeContact && !includeCustom) return null;

  return (
    <PortfolioNavExtrasCluster
      settings={settings}
      model={model}
      monochrome={monochrome}
      contactHref={contactHref}
      onContactNavigate={onContactNavigate}
      includeIcons={includeIcons}
      includeContact={includeContact}
      includeCustom={includeCustom}
      compact
      className={`shrink-0 ${
        position === 'before'
          ? model.verticalExtras
            ? 'mb-8'
            : 'mr-12 sm:mr-20'
          : model.verticalExtras
            ? 'mt-8'
            : 'ml-12 sm:ml-20'
      }`}
    />
  );
}
