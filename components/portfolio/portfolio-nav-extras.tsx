'use client';

import { useEffect, useState, type CSSProperties, type FocusEvent, type ReactNode } from 'react';
import {
  SocialPlatformIcon,
  normalizeSocialPlatformKey,
  type SocialPlatformKey,
} from '@/components/marketplace/creator-profile-social-icons';
import {
  portfolioNavTriZoneSocialLinkGapClass,
  type LinkBrandIconVisualSize,
} from '@/components/portfolio/portfolio-nav-tri-zone-social';
import { PortfolioNavContactCtaGlyph, resolvePortfolioNavContactCtaIcon } from '@/components/portfolio/portfolio-nav-contact-cta-icons';
import {
  DEFAULT_CONTENT_GUTTER,
  portfolioEditorialGutterInsetLeft,
  portfolioEditorialGutterInsetRight,
  type PortfolioContentGutter,
} from '@/components/portfolio/portfolio-editorial-layout';
import {
  PORTFOLIO_NAV_IN_BAR_BRAND_LABEL,
  portfolioNavUsesEditorialBarLayout,
  portfolioNavUsesFloatingPillLayout,
  portfolioNavUsesInBarBrandLayout,
  portfolioNavUsesStructuredBarLayout,
  portfolioNavUsesTriZoneLayout,
} from '@/components/portfolio/portfolio-nav-layout-design';
import { LinkBrandIcon } from '@/components/portfolio/PortfolioLinksChrome';
import {
  DEFAULT_NAV_PALETTE,
  mergeNavPalette,
} from '@/components/portfolio/portfolio-nav-palette-settings';
import {
  formatNavLabel,
  portfolioNavLabelFontSizeClass,
  portfolioNavBarHostsInlineExtras,
  portfolioNavContrastRatio,
  portfolioNavExtrasAllowedForBarWidth,
  portfolioNavFreeSpaceClusterClass,
  portfolioNavFreeSpaceSides,
  portfolioNavInkOnAccentFill,
  portfolioNavIsVertical,
  portfolioNavResolveExtrasPlacement,
  portfolioNavResolveExtrasSide,
  resolvePortfolioNavMobileChrome,
} from '@/components/portfolio/portfolio-nav-settings';
import type {
  PortfolioNavContactButtonDisplay,
  PortfolioNavContactButtonIconPosition,
  PortfolioNavContactButtonShape,
  PortfolioNavContactCtaIcon,
  PortfolioNavCustomExtraDisplay,
  PortfolioNavEditorialBarContactChannelSettings,
  PortfolioNavEditorialBarContactLink,
  PortfolioNavExtrasPlacement,
  PortfolioNavExtrasSide,
  PortfolioNavLinkIconSource,
  PortfolioNavSettings,
} from '@/components/portfolio/portfolio-settings-types';
import { DEFAULT_PORTFOLIO_NAV_LINK_ICON_SOURCES } from '@/components/portfolio/portfolio-settings-types';
import {
  clampPortfolioNavCustomExtraFontSizePx,
  clampPortfolioNavCustomExtraGapPx,
  clampPortfolioNavCustomExtraLogoSizePx,
  clampPortfolioNavCustomExtraPaddingX,
  clampPortfolioNavCustomExtraPaddingY,
  normalizePortfolioNavContactButtonIconPosition,
  normalizePortfolioNavCustomExtraDisplay,
  normalizePortfolioNavCustomExtraPlacement,
  normalizePortfolioNavEditorialBarContactLink,
  normalizePortfolioNavExtrasPlacement,
  mergeEditorialBarContactChannelSettings,
  seedEditorialBarPhoneContactFromLegacy,
  DEFAULT_EDITORIAL_BAR_PHONE_CONTACT,
  DEFAULT_EDITORIAL_BAR_MAIL_CONTACT,
  portfolioNavContactButtonShapeClass,
  portfolioNavContactButtonShellPresentation,
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
  /** Original profile platform key — used for branded link icons (TikTok, Facebook, etc.). */
  platform?: string | null;
  /** User-uploaded icon — overrides auto-detected brand icon. */
  iconUrl?: string | null;
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

function platformToSource(platform: string): PortfolioNavLinkIconSource {
  const key = normalizeSocialPlatformKey(platform);
  if (key === 'youtube') return 'youtube';
  if (key === 'twitter') return 'twitter';
  if (key === 'linkedin') return 'linkedin';
  if (key === 'github') return 'github';
  if (key === 'instagram') return 'instagram';
  if (key === 'tiktok') return 'tiktok';
  return 'other';
}

export type PortfolioProfileLinkInput = {
  id: string;
  label: string;
  url: string;
  platform?: string | null;
  iconUrl?: string | null;
};

function isContactEmailLink(url: string): boolean {
  const trimmed = url.trim();
  return /^mailto:/i.test(trimmed) || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

function normalizeProfileLinkHref(url: string): string {
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function resolveLinkSourceFromProfileLink(link: PortfolioProfileLinkInput): PortfolioNavLinkIconSource {
  const platform = link.platform?.trim();
  if (platform) return platformToSource(platform);
  return platformToSource(link.url);
}

/** Profile Links section only — excludes contact email (that belongs to Contact). */
export function buildPortfolioNavProfileLinkOptions(
  profileLinks: PortfolioProfileLinkInput[]
): PortfolioNavChromeLink[] {
  return profileLinks
    .filter((link) => link.url.trim() && !isContactEmailLink(link.url))
    .map((link) => ({
      id: link.id,
      href: normalizeProfileLinkHref(link.url),
      label: link.label?.trim() || link.id,
      source: resolveLinkSourceFromProfileLink(link),
      platform: link.platform ?? null,
      iconUrl: link.iconUrl?.trim() ? link.iconUrl.trim() : null,
    }));
}

/** Tri-zone nav + settings picker — all profile links, never contact email. */
export function buildPortfolioNavSocialLinkOptions({
  profileLinks,
}: {
  profileLinks: PortfolioProfileLinkInput[];
}): PortfolioNavChromeLink[] {
  return buildPortfolioNavProfileLinkOptions(profileLinks);
}

export function resolveTriZoneSocialLinks(
  links: PortfolioNavChromeLink[],
  settings: Pick<PortfolioNavSettings, 'triZoneSocialLinkIds'>,
  maxLinks = 3
): PortfolioNavChromeLink[] {
  const cap = Math.max(0, maxLinks);
  const selected = (settings.triZoneSocialLinkIds ?? []).filter(
    (id): id is string => typeof id === 'string' && id.trim().length > 0
  );
  if (selected.length > 0) {
    const byId = new Map(links.map((link) => [link.id, link]));
    return selected
      .map((id) => byId.get(id))
      .filter((link): link is PortfolioNavChromeLink => Boolean(link))
      .slice(0, cap);
  }
  return links.slice(0, cap);
}

export function resolveDutenPanelSocialLinks(
  links: PortfolioNavChromeLink[],
  settings: Pick<PortfolioNavSettings, 'dutenPanelSocialLinkIds'>,
  maxLinks = 5
): PortfolioNavChromeLink[] {
  const cap = Math.max(0, maxLinks);
  const selected = (settings.dutenPanelSocialLinkIds ?? []).filter(
    (id): id is string => typeof id === 'string' && id.trim().length > 0
  );
  if (selected.length > 0) {
    const byId = new Map(links.map((link) => [link.id, link]));
    return selected
      .map((id) => byId.get(id))
      .filter((link): link is PortfolioNavChromeLink => Boolean(link))
      .slice(0, cap);
  }
  return links.slice(0, cap);
}

export function resolveEditorialBarContactHref(
  channel: PortfolioNavEditorialBarContactLink,
  opts: { phone?: string | null; email?: string | null }
): string | null {
  if (channel === 'phone') {
    const phone = opts.phone?.trim();
    if (phone) {
      return /^tel:/i.test(phone) ? phone : `tel:${phone.replace(/\s/g, '')}`;
    }
    return null;
  }
  const email = opts.email?.trim();
  if (email) {
    return /^mailto:/i.test(email) ? email : `mailto:${email}`;
  }
  return null;
}

export function resolveEditorialBarActiveContact(
  settings: Pick<
    PortfolioNavSettings,
    | 'editorialBarContactLink'
    | 'editorialBarPhoneContact'
    | 'editorialBarMailContact'
    | 'contactButtonLabel'
    | 'contactButtonDisplay'
    | 'contactButtonIcon'
    | 'contactButtonIconPosition'
    | 'contactButtonShape'
  >,
  opts: { phone?: string | null; email?: string | null }
): {
  channel: PortfolioNavEditorialBarContactLink;
  profile: PortfolioNavEditorialBarContactChannelSettings;
  href: string | null;
} {
  const channel = normalizePortfolioNavEditorialBarContactLink(
    settings.editorialBarContactLink,
    'phone'
  );
  const phoneProfile = mergeEditorialBarContactChannelSettings(
    settings.editorialBarPhoneContact ?? seedEditorialBarPhoneContactFromLegacy(settings),
    undefined,
    DEFAULT_EDITORIAL_BAR_PHONE_CONTACT
  );
  const mailProfile = mergeEditorialBarContactChannelSettings(
    settings.editorialBarMailContact,
    undefined,
    DEFAULT_EDITORIAL_BAR_MAIL_CONTACT
  );
  const profile = channel === 'phone' ? phoneProfile : mailProfile;
  const href = resolveEditorialBarContactHref(channel, opts);
  return { channel, profile, href };
}

function navShowsSocialSlot(settings: PortfolioNavSettings): boolean {
  if (portfolioNavUsesTriZoneLayout(settings)) {
    return settings.triZoneShowSocial ?? (settings.triZoneSlotMode ?? 'social') === 'social';
  }
  if (portfolioNavUsesEditorialBarLayout(settings)) {
    return settings.editorialBarShowSocial ?? (settings.editorialBarSlotMode ?? 'contact') === 'social';
  }
  return false;
}

function editorialBarContactChannelButton({
  profile,
  href,
  settings,
  compact,
}: {
  profile: PortfolioNavEditorialBarContactChannelSettings;
  href: string;
  settings: PortfolioNavSettings;
  compact?: boolean;
}) {
  const contactLabel = profile.label.trim() || 'Contact';
  const contactDisplay = profile.display;
  const contactIcon = resolvePortfolioNavContactCtaIcon(profile.icon, {
    iconOnly: contactDisplay !== 'button',
  });
  const contactIconPosition = normalizePortfolioNavContactButtonIconPosition(profile.iconPosition);
  const contactShape = profile.shape;
  const contactChrome = resolveContactButtonChrome(settings);

  return (
    <ContactFreeSpaceButton
      label={contactLabel}
      labelCase={settings.labelCase}
      labelFontSize={settings.labelFontSize ?? 'sm'}
      href={href}
      display={contactDisplay}
      icon={contactIcon}
      iconPosition={contactIconPosition}
      shape={contactShape}
      chrome={contactChrome}
      compact={compact}
    />
  );
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
    if (!enabled.has(source)) continue;
    const href = social.url.trim();
    if (!href) continue;
    links.push({
      id: social.id || source,
      href,
      label: social.label || source,
      source,
      platform: social.platform,
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

function resolveContactLabelInk(settings: PortfolioNavSettings, background: string): string {
  const configured = settings.contactButtonColor ?? '#ffffff';
  const palette = mergeNavPalette(DEFAULT_NAV_PALETTE, settings.navPalette);
  let color = configured;

  if (portfolioNavContrastRatio(configured, background) < 4.5) {
    color = portfolioNavInkOnAccentFill(background, palette);
  }

  return navReadableInk(color, background);
}

function resolveContactButtonChrome(settings: PortfolioNavSettings) {
  const background = settings.contactButtonBackgroundColor ?? '#171717';
  return {
    background,
    color: resolveContactLabelInk(settings, background),
    border: settings.contactButtonBorderColor ?? '#171717',
    borderEnabled: settings.contactButtonBorderEnabled ?? false,
    glass: settings.contactButtonGlassEffect ?? false,
    shadow: settings.contactButtonShadowEnabled ?? true,
  };
}

function resolveTriZoneContactChrome(
  settings: PortfolioNavSettings,
  display: PortfolioNavContactButtonDisplay
) {
  if (display === 'button') {
    return resolveContactButtonChrome(settings);
  }

  const linkColors = resolveLinkIconColors(settings);
  return {
    background: linkColors.background,
    color: navReadableInk(linkColors.icon, linkColors.background),
    border: linkColors.border,
    borderEnabled: true,
    glass: false,
    shadow: true,
  };
}

function customExtraHasVisibleContent(settings: PortfolioNavSettings): boolean {
  if (!(settings.customExtraEnabled ?? false)) return false;
  if (portfolioNavUsesInBarBrandLayout(settings)) return true;
  const display = normalizePortfolioNavCustomExtraDisplay(settings.customExtraDisplay);
  const logo = (settings.customExtraLogoUrl ?? '').trim();
  const text = (settings.customExtraText ?? '').trim();
  if (display === 'logo') return Boolean(logo) || Boolean(text);
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

function NavBrandLinkButton({
  link,
  iconSize = 'md',
  monochrome = false,
}: {
  link: PortfolioNavChromeLink;
  iconSize?: LinkBrandIconVisualSize;
  monochrome?: boolean;
}) {
  const external = link.source !== 'mail';
  return (
    <a
      href={link.href}
      aria-label={link.label}
      title={link.label}
      className="inline-flex shrink-0 transition hover:opacity-90"
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      <LinkBrandIcon
        url={link.href}
        platform={link.platform}
        iconUrl={link.iconUrl}
        size={iconSize}
        monochrome={monochrome}
      />
    </a>
  );
}

export function PortfolioNavBrandLinkButton({
  link,
  iconSize = 'md',
  monochrome = false,
}: {
  link: PortfolioNavChromeLink;
  iconSize?: LinkBrandIconVisualSize;
  monochrome?: boolean;
}) {
  return <NavBrandLinkButton link={link} iconSize={iconSize} monochrome={monochrome} />;
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
  labelFontSize = 'sm',
  href,
  onNavigate,
  display = 'icon',
  icon = 'phone',
  iconPosition = 'left',
  shape = 'pill',
  chrome,
  compact,
}: {
  label: string;
  labelCase: PortfolioNavSettings['labelCase'];
  labelFontSize?: PortfolioNavSettings['labelFontSize'];
  href: string;
  onNavigate?: () => void;
  display?: PortfolioNavContactButtonDisplay;
  icon?: PortfolioNavContactCtaIcon;
  iconPosition?: PortfolioNavContactButtonIconPosition;
  shape?: PortfolioNavContactButtonShape;
  chrome: ReturnType<typeof resolveContactButtonChrome>;
  compact?: boolean;
}) {
  const frame = portfolioNavContactButtonShellPresentation(shape, {
    background: chrome.background,
    color: chrome.color,
    border: chrome.border,
    borderEnabled: chrome.borderEnabled,
  });
  const shadowClass =
    chrome.shadow && frame.useShadow ? 'shadow-[0_8px_24px_rgba(0,0,0,0.12)]' : 'shadow-none';
  const glassClass = chrome.glass && frame.useGlass ? 'backdrop-blur-md' : '';
  const resolvedIcon = resolvePortfolioNavContactCtaIcon(icon, {
    iconOnly: display !== 'button',
  });
  const resolvedIconPosition = normalizePortfolioNavContactButtonIconPosition(iconPosition);
  const showIconInButton =
    display === 'button' &&
    resolvedIcon !== 'none' &&
    resolvedIconPosition !== 'none';
  const shellStyle = frame.style;
  const normalizedShape = shape ?? 'pill';
  const isMinimalFrame = normalizedShape === 'frameless' || normalizedShape === 'bottom-line';
  const buttonIconClass = compact ? 'h-4 w-4' : 'h-[1.125rem] w-[1.125rem]';
  const iconOnlyGlyphClass = compact ? 'h-5 w-5' : 'h-[1.375rem] w-[1.375rem]';

  if (display !== 'button') {
    const size = isMinimalFrame ? '' : compact ? 'h-9 w-9' : 'h-10 w-10';
    const roundClass = isMinimalFrame ? '' : 'rounded-full';
    const borderClass =
      isMinimalFrame || !chrome.borderEnabled ? '' : 'border';
    const iconClassName = `inline-flex ${size} items-center justify-center ${roundClass} ${borderClass} transition hover:opacity-90 ${shadowClass} ${glassClass} ${frame.className}`;
    const glyph = <ContactGlyph icon={resolvedIcon} className={iconOnlyGlyphClass} />;
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
  const paddingClass = isMinimalFrame
    ? compact
      ? 'px-0 py-1'
      : 'px-0 py-1.5'
    : compact
      ? 'min-h-9 px-3.5 py-1.5 text-sm'
      : 'min-h-10 px-4 py-2';
  const labelSizeClass = portfolioNavLabelFontSizeClass(labelFontSize, compact);
  const className = `inline-flex shrink-0 items-center justify-center gap-2.5 font-semibold ${labelSizeClass} ${caseClass} transition hover:opacity-90 ${shadowClass} ${glassClass} ${frame.className} ${paddingClass}`;
  const labelNode = <span>{formatNavLabel(label, labelCase)}</span>;
  const iconNode = showIconInButton ? (
    <ContactGlyph icon={resolvedIcon} className={buttonIconClass} />
  ) : null;
  const content =
    resolvedIconPosition === 'right' ? (
      <>
        {labelNode}
        {iconNode}
      </>
    ) : (
      <>
        {iconNode}
        {labelNode}
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

function InBarBrandLogo({
  settings,
  compact,
}: {
  settings: PortfolioNavSettings;
  compact?: boolean;
}) {
  const href = sanitizePortfolioNavCustomHref(settings.customExtraHref);
  const openNewTab = settings.customExtraOpenNewTab ?? true;
  const label = PORTFOLIO_NAV_IN_BAR_BRAND_LABEL;
  const ink = settings.itemTextColor ?? settings.customExtraTextColor ?? '#171717';
  const fontSize = compact ? 24 : 28;
  const className =
    'inline-flex shrink-0 items-center font-bold tracking-tight transition hover:opacity-90';
  const style: CSSProperties = {
    color: ink,
    fontSize,
    lineHeight: 1.15,
    backgroundColor: 'transparent',
  };

  if (href) {
    const external = /^https?:\/\//i.test(href);
    return (
      <a
        href={href}
        aria-label={label}
        title={label}
        className={className}
        style={style}
        {...(external && openNewTab
          ? { target: '_blank', rel: 'noopener noreferrer' }
          : null)}
      >
        {label}
      </a>
    );
  }

  return (
    <span aria-label={label} title={label} className={className} style={style}>
      {label}
    </span>
  );
}

function CustomExtraChip({ settings, compact }: { settings: PortfolioNavSettings; compact?: boolean }) {
  if (portfolioNavUsesInBarBrandLayout(settings)) {
    return <InBarBrandLogo settings={settings} compact={compact} />;
  }

  const display = normalizePortfolioNavCustomExtraDisplay(settings.customExtraDisplay) as PortfolioNavCustomExtraDisplay;
  const logoUrl = (settings.customExtraLogoUrl ?? '').trim();
  const text = (settings.customExtraText ?? '').trim();
  const wantsLogo = display === 'logo' || display === 'both';
  const showLogoImage = wantsLogo && Boolean(logoUrl);
  const showLogoFallback = wantsLogo && !logoUrl && Boolean(text);
  const showText = (display === 'text' || display === 'both') && Boolean(text);
  if (!showLogoImage && !showLogoFallback && !showText) return null;

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
  const floatingPill = portfolioNavUsesFloatingPillLayout(settings);
  const triZone = portfolioNavUsesTriZoneLayout(settings);

  const background = settings.customExtraBackgroundColor ?? '#ffffff';
  const ink = navReadableInk(settings.customExtraTextColor ?? '#171717', background);
  const brandFontSize = compact ? Math.max(9, fontSize - 1) : fontSize;
  const brandFontWeight = portfolioNavCustomExtraFontWeightValue(settings.customExtraFontWeight);

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
    fontWeight: brandFontWeight,
    fontSize: brandFontSize,
  };

  const inner = (
    <>
      {showLogoImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logoUrl}
          alt={text || 'Logo'}
          width={logoSize}
          height={logoSize}
          className="shrink-0 object-contain"
          style={{ width: logoSize, height: logoSize }}
        />
      ) : null}
      {showLogoFallback ? (
        <span
          className="inline-flex shrink-0 items-center justify-center font-semibold leading-none"
          style={{ width: logoSize, height: logoSize, fontSize: Math.max(10, logoSize * 0.46) }}
          aria-hidden
        >
          {text.charAt(0).toUpperCase()}
        </span>
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
  const className = `inline-flex min-w-0 max-w-full shrink items-center justify-center ${shapeClass} ${
    (floatingPill && wantsLogo && !showText) || (triZone && wantsLogo && !showText)
      ? '!aspect-square !rounded-full'
      : ''
  } transition hover:opacity-90`;

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
  const contactIcon = resolvePortfolioNavContactCtaIcon(settings.contactButtonIcon, {
    iconOnly: contactDisplay !== 'button',
  });
  const contactIconPosition = normalizePortfolioNavContactButtonIconPosition(
    settings.contactButtonIconPosition
  );
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
            labelFontSize={settings.labelFontSize ?? 'sm'}
            href={contactHref}
            onNavigate={onContactNavigate}
            display={contactDisplay}
            icon={contactIcon}
            iconPosition={contactIconPosition}
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
  contentGutter = DEFAULT_CONTENT_GUTTER,
  useGlobalGutterInset = false,
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
  contentGutter?: PortfolioContentGutter;
  /** Full-width bar — pin clusters to global side gutters instead of nav edge offset. */
  useGlobalGutterInset?: boolean;
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

  const clusterClassForSide = (side: 'left' | 'right') => {
    const base = portfolioNavFreeSpaceClusterClass(
      mobileChrome.placement,
      side,
      settings.edgeOffset,
      settings.edgeOffsetCloseOnMobile ?? true
    );
    if (!useGlobalGutterInset) return base;
    const gutterSide =
      side === 'left'
        ? portfolioEditorialGutterInsetLeft(contentGutter)
        : portfolioEditorialGutterInsetRight(contentGutter);
    return base
      .split(/\s+/)
      .filter((token) => !token.startsWith('left-') && !token.startsWith('right-'))
      .concat(gutterSide)
      .join(' ');
  };

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[95]"
      aria-label="Portfolio quick links"
      style={{ opacity }}
    >
      {sides.map((side) => (
        <div
          key={side}
          className={`pointer-events-auto absolute -m-4 p-4 ${clusterClassForSide(side)}`}
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

/** Center brand chip for tri-zone nav layouts (logo / name). */
export function PortfolioNavCenterBrand({
  settings,
  compact,
}: {
  settings: PortfolioNavSettings;
  compact?: boolean;
}) {
  if (!customExtraHasVisibleContent(settings)) return null;
  return <CustomExtraChip settings={settings} compact={compact} />;
}

/** Social link icons for tri-zone nav — shows up to `maxLinks` (default 3). */
export function PortfolioNavSocialIconStrip({
  settings,
  links,
  maxLinks = 3,
  compact: _compact,
  className = '',
  forceVisible = false,
}: {
  settings: PortfolioNavSettings;
  links: PortfolioNavChromeLink[];
  maxLinks?: number;
  compact?: boolean;
  className?: string;
  /** Skip tri-zone / legacy slot-mode gate (editorial bar combines items). */
  forceVisible?: boolean;
}) {
  if (!forceVisible && !navShowsSocialSlot(settings)) return null;
  if (!(settings.linkIconsEnabled ?? false) && !forceVisible) return null;
  const visible = resolveTriZoneSocialLinks(links, settings, maxLinks);
  if (visible.length === 0) return null;

  const iconSize = settings.triZoneSocialLinkSize ?? 'sm';
  const monochrome = settings.triZoneSocialLinkMonochrome ?? false;
  const gapClass = portfolioNavTriZoneSocialLinkGapClass(settings.triZoneSocialLinkGap ?? 'sm');

  return (
    <div className={`flex items-center ${gapClass} ${className}`}>
      {visible.map((link) => (
        <NavBrandLinkButton
          key={link.id}
          link={link}
          iconSize={iconSize}
          monochrome={monochrome}
        />
      ))}
    </div>
  );
}

/** Editorial bar right rail — social + phone + mail can all show together. */
export function PortfolioNavEditorialRightSlot({
  settings,
  links,
  contactPhone,
  contactEmail,
  compact,
  className = '',
}: {
  settings: PortfolioNavSettings;
  links: PortfolioNavChromeLink[];
  contactHref?: string;
  contactPhone?: string | null;
  contactEmail?: string | null;
  onContactNavigate?: () => void;
  compact?: boolean;
  className?: string;
}) {
  const showSocial = settings.editorialBarShowSocial ?? false;
  const showPhone = settings.editorialBarShowPhone ?? false;
  const showMail = settings.editorialBarShowMail ?? false;

  const phoneProfile = mergeEditorialBarContactChannelSettings(
    settings.editorialBarPhoneContact ?? seedEditorialBarPhoneContactFromLegacy(settings),
    undefined,
    DEFAULT_EDITORIAL_BAR_PHONE_CONTACT
  );
  const mailProfile = mergeEditorialBarContactChannelSettings(
    settings.editorialBarMailContact,
    undefined,
    DEFAULT_EDITORIAL_BAR_MAIL_CONTACT
  );
  const phoneHref = showPhone ? resolveEditorialBarContactHref('phone', { phone: contactPhone }) : null;
  const mailHref = showMail ? resolveEditorialBarContactHref('mail', { email: contactEmail }) : null;

  const nodes: ReactNode[] = [];

  if (showSocial) {
    nodes.push(
      <PortfolioNavSocialIconStrip
        key="social"
        settings={settings}
        links={links}
        maxLinks={3}
        compact={compact}
        forceVisible
      />
    );
  }

  if (showPhone && phoneHref) {
    nodes.push(
      <div key="phone" className="flex shrink-0 items-center">
        {editorialBarContactChannelButton({
          profile: phoneProfile,
          href: phoneHref,
          settings,
          compact,
        })}
      </div>
    );
  }

  if (showMail && mailHref) {
    nodes.push(
      <div key="mail" className="flex shrink-0 items-center">
        {editorialBarContactChannelButton({
          profile: mailProfile,
          href: mailHref,
          settings,
          compact,
        })}
      </div>
    );
  }

  if (nodes.length === 0) return null;

  return (
    <div className={`flex min-w-0 shrink-0 items-center justify-end gap-2 sm:gap-3 ${className}`}>
      {nodes}
    </div>
  );
}

/** Tri-zone right rail — social + phone + mail can all show together (like editorial bar). */
export function PortfolioNavTriZoneSideSlot({
  settings,
  links,
  contactPhone,
  contactEmail,
  compact,
  className = '',
}: {
  settings: PortfolioNavSettings;
  links: PortfolioNavChromeLink[];
  contactPhone?: string | null;
  contactEmail?: string | null;
  compact?: boolean;
  className?: string;
}) {
  const showSocial = settings.triZoneShowSocial ?? false;
  const showPhone = settings.triZoneShowPhone ?? false;
  const showMail = settings.triZoneShowMail ?? false;

  const phoneProfile = mergeEditorialBarContactChannelSettings(
    settings.editorialBarPhoneContact ?? seedEditorialBarPhoneContactFromLegacy(settings),
    undefined,
    DEFAULT_EDITORIAL_BAR_PHONE_CONTACT
  );
  const mailProfile = mergeEditorialBarContactChannelSettings(
    settings.editorialBarMailContact,
    undefined,
    DEFAULT_EDITORIAL_BAR_MAIL_CONTACT
  );
  const phoneHref = showPhone ? resolveEditorialBarContactHref('phone', { phone: contactPhone }) : null;
  const mailHref = showMail ? resolveEditorialBarContactHref('mail', { email: contactEmail }) : null;

  const nodes: ReactNode[] = [];

  if (showSocial) {
    nodes.push(
      <PortfolioNavSocialIconStrip
        key="social"
        settings={settings}
        links={links}
        maxLinks={3}
        compact={compact}
        forceVisible
      />
    );
  }

  if (showPhone && phoneHref) {
    nodes.push(
      <div key="phone" className="flex shrink-0 items-center">
        {editorialBarContactChannelButton({
          profile: phoneProfile,
          href: phoneHref,
          settings,
          compact,
        })}
      </div>
    );
  }

  if (showMail && mailHref) {
    nodes.push(
      <div key="mail" className="flex shrink-0 items-center">
        {editorialBarContactChannelButton({
          profile: mailProfile,
          href: mailHref,
          settings,
          compact,
        })}
      </div>
    );
  }

  if (nodes.length === 0) return null;

  return (
    <div className={`flex min-w-0 shrink-0 items-center justify-end gap-2 sm:gap-3 ${className}`}>
      {nodes}
    </div>
  );
}

/** @deprecated Tri-zone now uses {@link PortfolioNavTriZoneSideSlot} with triZoneShow* flags. */
export function PortfolioNavTriZoneContactCta({
  settings,
  side,
  contactHref = '#contact',
  onContactNavigate,
  compact,
  className = '',
}: {
  settings: PortfolioNavSettings;
  side: 'left' | 'right';
  contactHref?: string;
  onContactNavigate?: () => void;
  compact?: boolean;
  className?: string;
}) {
  if ((settings.triZoneSlotMode ?? 'social') !== 'contact') return null;
  if ((settings.triZoneContactSide ?? 'right') !== side) return null;

  const contactLabel = (settings.contactButtonLabel ?? 'Contact').trim() || 'Contact';
  const contactDisplay = (settings.contactButtonDisplay ?? 'icon') as PortfolioNavContactButtonDisplay;
  const contactIcon = resolvePortfolioNavContactCtaIcon(settings.contactButtonIcon, {
    iconOnly: contactDisplay !== 'button',
  });
  const contactIconPosition = normalizePortfolioNavContactButtonIconPosition(
    settings.contactButtonIconPosition
  );
  const contactShape = (settings.contactButtonShape ?? 'pill') as PortfolioNavContactButtonShape;
  const contactChrome = resolveTriZoneContactChrome(settings, contactDisplay);

  return (
    <div className={`flex shrink-0 items-center ${className}`}>
      <ContactFreeSpaceButton
        label={contactLabel}
        labelCase={settings.labelCase}
        labelFontSize={settings.labelFontSize ?? 'sm'}
        href={contactHref}
        onNavigate={onContactNavigate}
        display={contactDisplay}
        icon={contactIcon}
        iconPosition={contactIconPosition}
        shape={contactShape}
        chrome={contactChrome}
        compact={compact}
      />
    </div>
  );
}

/** Standalone Contact CTA (logo-left-nav-contact and other bar layouts). */
export function PortfolioNavContactCta({
  settings,
  contactHref = '#contact',
  onContactNavigate,
  compact,
  className = '',
}: {
  settings: PortfolioNavSettings;
  contactHref?: string;
  onContactNavigate?: () => void;
  compact?: boolean;
  className?: string;
}) {
  if (!(settings.contactButtonEnabled ?? false)) return null;

  const contactLabel = (settings.contactButtonLabel ?? 'Contact').trim() || 'Contact';
  const contactDisplay = (settings.contactButtonDisplay ?? 'button') as PortfolioNavContactButtonDisplay;
  const contactIcon = resolvePortfolioNavContactCtaIcon(settings.contactButtonIcon, {
    iconOnly: contactDisplay !== 'button',
  });
  const contactIconPosition = normalizePortfolioNavContactButtonIconPosition(
    settings.contactButtonIconPosition
  );
  const contactShape = (settings.contactButtonShape ?? 'pill') as PortfolioNavContactButtonShape;
  const contactChrome = resolveContactButtonChrome(settings);

  return (
    <div className={`flex shrink-0 items-center ${className}`}>
      <ContactFreeSpaceButton
        label={contactLabel}
        labelCase={settings.labelCase}
        labelFontSize={settings.labelFontSize ?? 'sm'}
        href={contactHref}
        onNavigate={onContactNavigate}
        display={contactDisplay}
        icon={contactIcon}
        iconPosition={contactIconPosition}
        shape={contactShape}
        chrome={contactChrome}
        compact={compact}
      />
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
  const structuredBar = portfolioNavUsesStructuredBarLayout(settings);
  if (!model.inlineInBar && !structuredBar) return null;
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
        structuredBar
          ? ''
          : side === 'left'
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
