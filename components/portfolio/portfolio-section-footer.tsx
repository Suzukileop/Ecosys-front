'use client';

/**
 * Portfolio footer (all footer designs).
 * Split out of portfolio-section-primitives so the public portfolio only downloads the sections it
 * renders (each is loaded with next/dynamic by PublicCreatorPortfolioPage).
 */
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { type CSSProperties, type ReactNode } from 'react';
import { mediaImageResponsive } from '@/lib/media-image-url';
import { formatPhoneDisplay } from '@/lib/phone';
import { PortfolioMotionItem } from '@/components/portfolio/PortfolioMotionItem';
import type { PortfolioGlobalMotionProfile } from '@/components/portfolio/portfolio-motion-settings';
import { DEFAULT_MOTION_PROFILE } from '@/components/portfolio/portfolio-motion-settings';
import { elementTextInlineStyle, elementTextStyleClass } from '@/components/portfolio/portfolio-element-text-style';
import {
  DEFAULT_FOOTER_PRESENTATION,
  footerDividerClass,
  footerIconStyle,
  footerLayoutClass,
  footerContentPaddingStyle,
  footerContentPaddingClassName,
  footerPatternStyle,
  footerContactCtaStyle,
  footerContactIconSizeClass,
  footerMarketplaceCtaClass,
  footerMarketplaceCtaStyle,
  footerPresetCtaClass,
  footerReadableOnBackground,
  footerColorLuminance,
  footerShellClass,
  footerTopMarginClass,
  footerTopMarginStyle,
  clampFooterColumnHeadingGapPx,
  resolveFooterCopyrightLabel,
  isFooterBackgroundLight,
  normalizeFooterElementStyles,
  resolveFooterLinkHref,
  DEFAULT_FOOTER_CONNECT_LABEL,
  DEFAULT_FOOTER_ACCENT_COLOR,
  resolveFooterMarketplaceCtaHref,
  footerPremiumFontScale,
  type PortfolioFooterPresentationSettings,
} from '@/components/portfolio/portfolio-footer-settings';
import { createFooterDesignLayoutResolver, resolveFooterSectionNavLinks, type FooterInkToken, type PortfolioFooterSectionLinkOption } from '@/components/portfolio/portfolio-footer-design-layout';
import { sectionBackgroundStyle } from '@/components/portfolio/portfolio-section-background-settings';
import { DEFAULT_CONTENT_GUTTER, type PortfolioContentGutter } from '@/components/portfolio/portfolio-editorial-layout';
import { useT } from '@/lib/i18n/I18nProvider';
import { ArrowUpRight, ContactEmailIcon, EditorialContactLink, FooterContactIcon, FooterSocialLinkIcon } from '@/components/portfolio/portfolio-contact-link-icons';

const FooterDesignMonumental = dynamic(() =>
  import('@/components/portfolio/portfolio-footer-design-monumental').then((m) => m.FooterDesignMonumental)
);
const FooterDesignContactCard = dynamic(() =>
  import('@/components/portfolio/portfolio-footer-design-contact-card').then((m) => m.FooterDesignContactCard)
);
const FooterDesignCompact = dynamic(() =>
  import('@/components/portfolio/portfolio-footer-design-compact').then((m) => m.FooterDesignCompact)
);
const FooterDesignCenteredMinimal = dynamic(() =>
  import('@/components/portfolio/portfolio-footer-design-centered-minimal').then((m) => m.FooterDesignCenteredMinimal)
);
const FooterDesignLanding = dynamic(() =>
  import('@/components/portfolio/portfolio-footer-design-landing').then((m) => m.FooterDesignLanding)
);
const FooterDesignHeroColumns = dynamic(() =>
  import('@/components/portfolio/portfolio-footer-design-hero-columns').then((m) => m.FooterDesignHeroColumns)
);
const FooterDesignSplitForm = dynamic(() =>
  import('@/components/portfolio/portfolio-footer-design-split-form').then((m) => m.FooterDesignSplitForm)
);
const FooterDesignTimezoneEditorial = dynamic(() =>
  import('@/components/portfolio/portfolio-footer-design-timezone-editorial').then((m) => m.FooterDesignTimezoneEditorial)
);
const FooterDesignInvertedWordmark = dynamic(() =>
  import('@/components/portfolio/portfolio-footer-design-inverted-wordmark').then((m) => m.FooterDesignInvertedWordmark)
);
const FooterDesignServicesReveal = dynamic(() =>
  import('@/components/portfolio/portfolio-footer-design-services-reveal').then((m) => m.FooterDesignServicesReveal)
);
const FooterDesignEditorialGrid = dynamic(() =>
  import('@/components/portfolio/portfolio-footer-design-editorial-grid').then((m) => m.FooterDesignEditorialGrid)
);
const FooterDesignHeadlineReveal = dynamic(() =>
  import('@/components/portfolio/portfolio-footer-design-headline-reveal').then((m) => m.FooterDesignHeadlineReveal)
);
const FooterDesignDispatch = dynamic(() =>
  import('@/components/portfolio/portfolio-footer-design-dispatch').then((m) => m.FooterDesignDispatch)
);

/**
 * "Contact CTA" (design `minimal`) interactive body — borderless two-column layout (no central
 * rule, no icon chips). Bio, location/phone/email, and social icons render at full, plain
 * opacity at all times; hovering a link or social icon only brightens that element itself
 * (`hover:opacity-70`), never any other line in the composition. No hardcoded closing
 * copyright line either — that bar was extracted into the shared Mini bar catalog's own
 * "Contact CTA" variant (see footer-minibar-catalog-extraction memory), toggled on
 * separately via Footer > Design > "Mini bar" rather than being always-on here.
 */
function FooterContactCtaBody({
  creatorName,
  showBrand,
  brandClass,
  brandStyle,
  bio,
  descriptionClass,
  descriptionStyle,
  ctaRow,
  contactItems,
  contactLineClass,
  contactLineStyle,
  socialLinks,
  iconStyle,
  avatarUrl,
  showAvatar,
}: {
  creatorName: string;
  showBrand: boolean;
  brandClass: string;
  brandStyle: CSSProperties;
  bio: string | null;
  descriptionClass: string;
  descriptionStyle: CSSProperties;
  ctaRow: ReactNode;
  contactItems: { id: string; label: string; href?: string }[];
  contactLineClass: string;
  contactLineStyle: CSSProperties;
  socialLinks: EditorialContactLink[];
  iconStyle: CSSProperties;
  /** Optional portrait filling the wide empty gap on the right at desktop widths —
   *  opt-in via the existing site-wide "Avatar" content-visibility toggle, same one
   *  the other Footer designs (e.g. Centered minimal) already read. */
  avatarUrl?: string | null;
  showAvatar?: boolean;
}) {
  const t = useT();
  const showPortrait = Boolean(showAvatar && avatarUrl);

  const cleanBrandClass = brandClass.replace(/\bfont-(?:bold|medium|normal|semibold)\b/g, '').trim();
  const cleanDescriptionClass = descriptionClass.replace(/\bfont-(?:bold|medium)\b/g, '').trim();
  const cleanContactLineClass = contactLineClass
    .replace(/\bfont-(?:bold|medium|normal|semibold)\b/g, '')
    .trim();

  return (
    <div className="flex min-w-0 flex-col gap-10 sm:gap-12">
      <div
        className={`grid w-full grid-cols-1 gap-12 md:grid-cols-2 md:gap-12 lg:items-start lg:gap-16 xl:gap-24 ${
          showPortrait ? 'lg:grid-cols-[1.1fr_1fr_auto]' : 'lg:grid-cols-2'
        }`}
      >
        <div className="min-w-0 space-y-6 text-left sm:space-y-7 lg:pr-8 xl:pr-12">
          {showBrand ? (
            <p className={`tracking-tight font-semibold ${cleanBrandClass}`} style={{ ...brandStyle, fontWeight: 600 }}>
              {creatorName}
            </p>
          ) : null}
          {bio ? (
            <p
              data-pf-no-color-transition=""
              className={`max-w-[60ch] text-pretty ${cleanDescriptionClass}`}
              style={{
                ...descriptionStyle,
                fontSize: 'calc(var(--pf-footer-body-size) * var(--pf-footer-font-scale, 1))',
                lineHeight: 1.6,
              }}
            >
              {bio}
            </p>
          ) : null}
          {ctaRow ? (
            <div data-pf-no-color-transition="" className="inline-flex w-fit [&_a]:!font-semibold">
              {ctaRow}
            </div>
          ) : null}
        </div>

        {contactItems.length > 0 || socialLinks.length > 0 ? (
          <div className="flex min-w-0 flex-col items-start gap-6 text-left">
            {contactItems.length > 0 ? (
              <ul className="flex w-full max-w-md flex-col items-start gap-6">
                {contactItems.map((item) =>
                  item.href ? (
                    <li key={item.id} className="w-full">
                      <a
                        href={item.href}
                        data-pf-no-color-transition=""
                        className={`inline-flex min-h-11 items-center text-pretty transition-opacity duration-300 hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 rounded-sm ${cleanContactLineClass} font-medium`}
                        style={{
                          ...contactLineStyle,
                          fontSize: 'calc(var(--pf-footer-body-size) * var(--pf-footer-font-scale, 1))',
                          lineHeight: 1.4,
                        }}
                      >
                        {t(item.label)}
                      </a>
                    </li>
                  ) : (
                    <li key={item.id} className="w-full">
                      <span
                        data-pf-no-color-transition=""
                        className={`inline-flex min-h-11 items-center text-pretty ${cleanContactLineClass} font-medium`}
                        style={{
                          ...contactLineStyle,
                          fontSize: 'calc(var(--pf-footer-body-size) * var(--pf-footer-font-scale, 1))',
                          lineHeight: 1.4,
                        }}
                      >
                        {t(item.label)}
                      </span>
                    </li>
                  )
                )}
              </ul>
            ) : null}

            {socialLinks.length > 0 ? (
              <nav className="-ml-3 flex flex-wrap items-center gap-1" aria-label={t('Social')}>
                {socialLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={t(link.label)}
                    title={t(link.label)}
                    data-pf-no-color-transition=""
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full transition-opacity duration-300 hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                    style={iconStyle}
                  >
                    <FooterSocialLinkIcon link={link} bare iconClassName="h-5 w-5" />
                  </a>
                ))}
              </nav>
            ) : null}
          </div>
        ) : null}

        {showPortrait ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            {...mediaImageResponsive(avatarUrl!, [384, 640])}
            sizes="(min-width: 1280px) 288px, 256px"
            alt=""
            loading="lazy"
            decoding="async"
            className="hidden aspect-[4/5] w-full max-w-[19rem] shrink-0 self-start rounded-[1.5rem] object-cover lg:block lg:w-64 xl:w-72"
          />
        ) : null}
      </div>
    </div>
  );
}

export function EditorialPortfolioFooter({
  creatorName,
  creatorId,
  avatarUrl: profileAvatarUrl,
  bio,
  email: profileEmail,
  phone: profilePhone,
  locationLabel: profileLocationLabel,
  hoursLabel: profileHoursLabel,
  profileVisits: _profileVisits,
  links,
  contentClassName,
  presentation = DEFAULT_FOOTER_PRESENTATION,
  transparentBase = false,
  contactHref = '#footer',
  motionProfile = DEFAULT_MOTION_PROFILE,
  bottomClearanceClass,
  sectionLinkOptions,
  sectionPalette,
  globalColorMode = 'dark',
  contentGutter = DEFAULT_CONTENT_GUTTER,
}: {
  creatorName: string;
  creatorId: string;
  avatarUrl?: string | null;
  bio?: string | null;
  email?: string | null;
  phone?: string | null;
  locationLabel?: string | null;
  hoursLabel?: string | null;
  profileVisits: number;
  links: EditorialContactLink[];
  contentClassName: string;
  presentation?: PortfolioFooterPresentationSettings;
  /** @deprecated Use presentation.marginTop instead. */
  stackOnContact?: boolean;
  /** Let the global page fill show through when the footer has no own background enabled. */
  transparentBase?: boolean;
  isAvailable?: boolean | null;
  responseTimeLabel?: string | null;
  contactHref?: string;
  motionProfile?: PortfolioGlobalMotionProfile;
  /** Nav safe-area padding on the footer so its background reaches the viewport bottom. */
  bottomClearanceClass?: string;
  /** Sections currently visible on the page (nav order + labels) — each design's Layout
   *  settings pick which of these its links column shows. */
  sectionLinkOptions?: PortfolioFooterSectionLinkOption[];
  /** Footer's own resolved palette (honors its light/dark override) — for designs that let the
   *  creator pick a palette token (e.g. Inverted wordmark's wordmark color). */
  sectionPalette?: Partial<Record<FooterInkToken, string>>;
  /** Resolved active color mode (Global → Theme, honoring the section's own override) — the
   *  premium full-bleed designs (Monumental's siblings) branch their literal colors on this
   *  instead of reading the shared CSS palette tokens. */
  globalColorMode?: 'light' | 'dark';
  /** IANA timezone id (profile.timezoneId) — only consumed by the Timezone editorial design. */
  timezoneId?: string | null;
  /** Site-wide editorial gutter (settings.global.contentGutter) — the full-bleed premium
   *  designs bypass the legacy shell, so this is threaded in explicitly wherever one of them
   *  needs to line its own horizontal padding up with the rest of the page. */
  contentGutter?: PortfolioContentGutter;
}) {
  const t = useT();
  // General → Contact details, applied once for every design: the newer full-bleed designs
  // never read these switches and showed every detail regardless.
  const email = presentation.showEmail !== false ? profileEmail : null;
  const phone = presentation.showPhone !== false ? profilePhone : null;
  const locationLabel = presentation.showLocation !== false ? profileLocationLabel : null;
  const hoursLabel = presentation.showHours !== false ? profileHoursLabel : null;
  // Every design below used to hardcode its own solid black/white canvas, silently ignoring
  // this section's own Background tab. None of them own a background by default anymore —
  // `sectionBackgroundStyle` already returns `undefined` (transparent) when the Background
  // tab is off, so the page/global wallpaper shows through until the user explicitly turns
  // this section's background on.
  const footerBackgroundStyle = sectionBackgroundStyle(presentation);
  // Multiplies every Footer design's own standardized body/label text sizes via a shared
  // `--pf-footer-font-scale` CSS custom property — see General tab's "Font size" control.
  const footerFontSizeScale = footerPremiumFontScale(presentation.premiumFontSize);
  // General → Photo replaces the profile photo in every design that shows one.
  const avatarUrl = presentation.photoUrl?.trim() || profileAvatarUrl;
  const footerLayout = createFooterDesignLayoutResolver(presentation, presentation.design);
  const footerNavLinks = resolveFooterSectionNavLinks(presentation, presentation.design, sectionLinkOptions);
  const footerNavLinkItems = footerNavLinks.map((link) => ({
    id: link.id,
    label: link.label,
    url: resolveFooterLinkHref(link.href, creatorId),
  }));

  if (presentation.design === 'monumental') {
    return (
      <FooterDesignMonumental
        creatorName={creatorName}
        creatorId={creatorId}
        email={email ?? null}
        phone={phone ?? null}
        locationLabel={locationLabel ?? null}
        links={links}
        navLinks={footerNavLinkItems}
        layout={footerLayout}
        presentation={presentation}
        contentGutter={contentGutter}
        backgroundStyle={footerBackgroundStyle}
        fontSizeScale={footerFontSizeScale}
        colorMode={globalColorMode}
      />
    );
  }

  if (presentation.design === 'compact') {
    return (
      <FooterDesignCompact
        creatorName={creatorName}
        creatorId={creatorId}
        bio={bio}
        email={email ?? null}
        phone={phone ?? null}
        locationLabel={locationLabel ?? null}
        links={links}
        layout={footerLayout}
        presentation={presentation}
        colorMode={globalColorMode}
        contentGutter={contentGutter}
        backgroundStyle={footerBackgroundStyle}
        fontSizeScale={footerFontSizeScale}
      />
    );
  }

  if (presentation.design === 'centered-minimal') {
    return (
      <FooterDesignCenteredMinimal
        creatorName={creatorName}
        creatorId={creatorId}
        avatarUrl={avatarUrl}
        email={email}
        phone={phone}
        locationLabel={locationLabel}
        hoursLabel={hoursLabel}
        links={links}
        navLinks={footerNavLinkItems}
        layout={footerLayout}
        presentation={presentation}
        colorMode={globalColorMode}
        contentGutter={contentGutter}
        backgroundStyle={footerBackgroundStyle}
        fontSizeScale={footerFontSizeScale}
      />
    );
  }

  if (presentation.design === 'landing') {
    return (
      <FooterDesignLanding
        creatorName={creatorName}
        creatorId={creatorId}
        avatarUrl={avatarUrl}
        bio={bio}
        email={email}
        phone={phone}
        locationLabel={locationLabel}
        hoursLabel={hoursLabel}
        links={links}
        navLinks={footerNavLinkItems}
        layout={footerLayout}
        presentation={presentation}
        colorMode={globalColorMode}
        contentGutter={contentGutter}
        backgroundStyle={footerBackgroundStyle}
        fontSizeScale={footerFontSizeScale}
      />
    );
  }

  if (presentation.design === 'contact-card') {
    return (
      <FooterDesignContactCard
        creatorName={creatorName}
        creatorId={creatorId}
        email={email ?? null}
        phone={phone ?? null}
        locationLabel={locationLabel ?? null}
        links={links}
        navLinks={footerNavLinkItems}
        layout={footerLayout}
        presentation={presentation}
        colorMode={globalColorMode}
        contentGutter={contentGutter}
        backgroundStyle={footerBackgroundStyle}
        fontSizeScale={footerFontSizeScale}
      />
    );
  }

  if (
    presentation.design === 'hero-columns' ||
    presentation.design === 'split-form' ||
    presentation.design === 'timezone-editorial' ||
    presentation.design === 'inverted-wordmark' ||
    presentation.design === 'services-reveal' ||
    presentation.design === 'editorial-grid' ||
    presentation.design === 'headline-reveal' ||
    presentation.design === 'dispatch'
  ) {
    const premiumCopyrightText = presentation.showCopyright
      ? resolveFooterCopyrightLabel(presentation.copyrightLabel, creatorName)
      : '';
    const premiumContactHref = contactHref ?? '#footer';

    if (presentation.design === 'hero-columns') {
      return (
        <FooterDesignHeroColumns
          creatorName={creatorName}
          creatorId={creatorId}
          avatarUrl={avatarUrl}
          bio={bio}
          email={email}
          phone={phone}
          locationLabel={locationLabel}
          links={links}
          navLinks={footerNavLinkItems}
          layout={footerLayout}
          colorMode={globalColorMode}
          contentGutter={contentGutter}
          backgroundStyle={footerBackgroundStyle}
          fontSizeScale={footerFontSizeScale}
        />
      );
    }

    if (presentation.design === 'split-form') {
      return (
        <FooterDesignSplitForm
          creatorName={creatorName}
          creatorId={creatorId}
          avatarUrl={avatarUrl}
          bio={bio}
          email={email}
          phone={phone}
          locationLabel={locationLabel}
          hoursLabel={hoursLabel}
          links={links}
          navLinks={footerNavLinkItems}
          layout={footerLayout}
          colorMode={globalColorMode}
          contentGutter={contentGutter}
          backgroundStyle={footerBackgroundStyle}
          fontSizeScale={footerFontSizeScale}
        />
      );
    }

    if (presentation.design === 'timezone-editorial') {
      return (
        <FooterDesignTimezoneEditorial
          creatorName={creatorName}
          creatorId={creatorId}
          avatarUrl={avatarUrl}
          email={email}
          phone={phone}
          links={links}
          layout={footerLayout}
          copyrightText={premiumCopyrightText}
          colorMode={globalColorMode}
          contentGutter={contentGutter}
          backgroundStyle={footerBackgroundStyle}
          fontSizeScale={footerFontSizeScale}
        />
      );
    }

    if (presentation.design === 'inverted-wordmark') {
      return (
        <FooterDesignInvertedWordmark
          creatorName={creatorName}
          navLinks={footerNavLinkItems}
          layout={footerLayout}
          links={links}
          email={email}
          phone={phone}
          colorMode={globalColorMode}
          palette={sectionPalette}
          contentGutter={contentGutter}
          backgroundStyle={footerBackgroundStyle}
          fontSizeScale={footerFontSizeScale}
        />
      );
    }

    if (presentation.design === 'editorial-grid') {
      return (
        <FooterDesignEditorialGrid
          creatorName={creatorName}
          creatorId={creatorId}
          avatarUrl={avatarUrl}
          email={email}
          phone={phone}
          locationLabel={locationLabel}
          links={links}
          navLinks={footerNavLinkItems}
          layout={footerLayout}
          contactHref={premiumContactHref}
          colorMode={globalColorMode}
          contentGutter={contentGutter}
          backgroundStyle={footerBackgroundStyle}
          fontSizeScale={footerFontSizeScale}
        />
      );
    }

    if (presentation.design === 'headline-reveal') {
      return (
        <FooterDesignHeadlineReveal
          creatorName={creatorName}
          creatorId={creatorId}
          bio={bio}
          email={email}
          phone={phone}
          locationLabel={locationLabel}
          links={links}
          navLinks={footerNavLinkItems}
          layout={footerLayout}
          copyrightText={premiumCopyrightText}
          contactHref={premiumContactHref}
          colorMode={globalColorMode}
          contentGutter={contentGutter}
          backgroundStyle={footerBackgroundStyle}
          fontSizeScale={footerFontSizeScale}
        />
      );
    }

    if (presentation.design === 'dispatch') {
      return (
        <FooterDesignDispatch
          creatorName={creatorName}
          creatorId={creatorId}
          email={email}
          phone={phone}
          locationLabel={locationLabel}
          links={links}
          navLinks={footerNavLinkItems}
          layout={footerLayout}
          colorMode={globalColorMode}
          contentGutter={contentGutter}
          backgroundStyle={footerBackgroundStyle}
          fontSizeScale={footerFontSizeScale}
        />
      );
    }

    return (
      <FooterDesignServicesReveal
        creatorName={creatorName}
        email={email}
        phone={phone}
        locationLabel={locationLabel}
        navLinks={footerNavLinkItems}
        layout={footerLayout}
        links={links}
        colorMode={globalColorMode}
        contentGutter={contentGutter}
        backgroundStyle={footerBackgroundStyle}
        fontSizeScale={footerFontSizeScale}
      />
    );
  }

  const bgStyle =
    !transparentBase && presentation.sectionBackgroundEnabled
      ? sectionBackgroundStyle(presentation)
      : undefined;
  const lightBackground = isFooterBackgroundLight(presentation);
  const shellClass = footerShellClass(
    presentation.design,
    presentation.showTopBorder,
    lightBackground
  );
  const topMarginClass = footerTopMarginClass(presentation.marginTop ?? 'none');
  const topMarginStyle = footerTopMarginStyle(presentation);
  const clearanceClass =
    bottomClearanceClass ?? 'pb-[max(0.5rem,env(safe-area-inset-bottom,0px))]';
  const dividerClass = footerDividerClass(lightBackground);
  const showContentDivider = presentation.showContentDivider !== false;
  const elementStyles = normalizeFooterElementStyles(presentation.elementStyles, presentation);
  const brandClass = elementTextStyleClass(elementStyles.brand, 'title');
  const brandStyle = elementTextInlineStyle(elementStyles.brand);
  const descriptionClass = elementTextStyleClass(elementStyles.description, 'body');
  const descriptionStyle = elementTextInlineStyle(elementStyles.description);
  const columnHeadingStyleBase = elementTextInlineStyle(elementStyles.columnHeading);
  const contactLineClass = elementTextStyleClass(elementStyles.contactLine, 'body');
  const contactLineStyleBase = elementTextInlineStyle(elementStyles.contactLine);
  const columnHeadingStyle = columnHeadingStyleBase;
  const contactLineStyle = contactLineStyleBase;
  const landingColumnTextClass = contactLineClass;
  const landingColumnTextStyle = contactLineStyle;
  const metaClass = elementTextStyleClass(elementStyles.meta, 'body');
  const metaStyle = elementTextInlineStyle(elementStyles.meta);
  const marketplaceLinkClass = elementTextStyleClass(elementStyles.marketplaceLink, 'body');
  const marketplaceLinkStyle = elementTextInlineStyle(elementStyles.marketplaceLink);
  const ctaButtonTextClass = elementTextStyleClass(elementStyles.ctaButton, 'body');
  const ctaButtonTextStyle = elementTextInlineStyle(elementStyles.ctaButton);
  const iconStyleBase = footerIconStyle(presentation.iconColor);
  const iconStyle = iconStyleBase;
  const patternStyle = footerPatternStyle(presentation);

  const phoneDisplay = phone?.trim() ? formatPhoneDisplay(phone.trim()) : null;
  const emailValue = email?.trim() || null;
  const locationValue = locationLabel?.trim() || null;
  const hoursValue = hoursLabel?.trim() || null;

  const contactItems: { id: string; label: string; href?: string; icon: 'phone' | 'email' | 'location' | 'hours' }[] =
    [];
  if (presentation.showPhone && phoneDisplay) {
    contactItems.push({
      id: 'phone',
      label: phoneDisplay,
      href: `tel:${phone!.replace(/\s+/g, '')}`,
      icon: 'phone',
    });
  }
  if (presentation.showEmail && emailValue) {
    contactItems.push({
      id: 'email',
      label: emailValue,
      href: `mailto:${emailValue}`,
      icon: 'email',
    });
  }
  if (presentation.showLocation && locationValue) {
    contactItems.push({ id: 'location', label: locationValue, icon: 'location' });
  }
  if (presentation.showHours && hoursValue) {
    contactItems.push({ id: 'hours', label: hoursValue, icon: 'hours' });
  }

  const visibleLinks = presentation.showContactLinks
    ? links.map((link) => {
        const url = link.url.trim();
        let hostname = '';
        try {
          hostname = new URL(/^https?:\/\//i.test(url) ? url : `https://${url}`).hostname.replace(
            /^www\./i,
            ''
          );
        } catch {
          hostname = '';
        }
        const rawLabel = link.label?.trim() ?? '';
        const label =
          link.type === 'WEBSITE' && /^site\s*web$/i.test(rawLabel) ? t('Website') : rawLabel || hostname || url;
        return { ...link, label };
      })
    : [];
  const ctaHref =
    contactHref?.trim() ||
    (emailValue ? `mailto:${emailValue}` : '#footer');

  const showContactIcons = presentation.showContactIcons !== false;
  const contactIconSizeClass = footerContactIconSizeClass(presentation.contactIconSize ?? 'sm');
  const renderFooterContactList = (
    items: typeof contactItems,
    centered = false,
    options?: {
      iconAlign?: 'start' | 'center';
      lineClass?: string;
      lineStyle?: CSSProperties;
      glyphStyle?: CSSProperties;
    }
  ) => {
    const lineClass = options?.lineClass ?? landingColumnTextClass;
    const lineStyle = options?.lineStyle ?? landingColumnTextStyle;
    const glyphStyle = options?.glyphStyle ?? iconStyle;
    return items.length > 0 ? (
      <ul
        className={`space-y-5 text-left flex flex-col items-start ${
          centered ? 'mx-auto w-fit' : 'w-full'
        }`}
      >
        {items.map((item) => (
          <li key={item.id} className="flex w-full justify-start">
            {item.href ? (
              <a
                href={item.href}
                className={`flex items-center text-left transition hover:opacity-80 ${
                  showContactIcons ? 'gap-3.5' : ''
                } ${lineClass}`}
                data-pf-no-color-transition=""
                style={lineStyle}
              >
                {showContactIcons ? (
                  <FooterContactIcon
                    type={item.icon}
                    className={`shrink-0 ${contactIconSizeClass}`}
                    style={glyphStyle}
                  />
                ) : null}
                <span className="min-w-0 text-left leading-none">{t(item.label)}</span>
              </a>
            ) : (
              <span
                className={`flex items-center text-left ${showContactIcons ? 'gap-3.5' : ''} ${lineClass}`}
                style={lineStyle}
              >
                {showContactIcons ? (
                  <FooterContactIcon
                    type={item.icon}
                    className={`shrink-0 ${contactIconSizeClass}`}
                    style={glyphStyle}
                  />
                ) : null}
                <span className="min-w-0 text-left leading-none">{t(item.label)}</span>
              </span>
            )}
          </li>
        ))}
      </ul>
    ) : null;
  };

  const copyrightClass = `tracking-wide font-normal ${metaClass.replace(/\bfont-(?:bold|semibold|medium)\b/g, '').trim()}`;
  const copyrightStyle = { ...metaStyle, fontWeight: 400 as const };

  const copyrightLine = presentation.showCopyright ? (
    <p className={`text-pretty ${copyrightClass}`} style={copyrightStyle}>
      {resolveFooterCopyrightLabel(presentation.copyrightLabel, creatorName)}
    </p>
  ) : null;

  const marketplaceHref = resolveFooterMarketplaceCtaHref(
    presentation.marketplaceCtaHref,
    creatorId
  );
  const marketplaceLabel =
    presentation.marketplaceCtaLabel?.trim() || t('Marketplace profile');
  const marketplaceDesign = presentation.marketplaceCtaDesign ?? 'pill-outline';
  const marketplaceShowArrow = presentation.marketplaceCtaShowArrow !== false;
  const marketplaceExternal =
    marketplaceHref.startsWith('http://') ||
    marketplaceHref.startsWith('https://') ||
    marketplaceHref.startsWith('mailto:');
  const marketplaceCtaChromeClass = footerMarketplaceCtaClass(marketplaceDesign);
  const marketplaceCtaChromeStyle = footerMarketplaceCtaStyle(presentation, { lightBackground });
  const marketplaceTextArrowStyle =
    marketplaceDesign === 'text-arrow'
      ? {
          ...marketplaceLinkStyle,
          color: footerReadableOnBackground(
            String(
              (marketplaceLinkStyle as { color?: string } | undefined)?.color ||
                presentation.accentColor ||
                '#fafafa'
            ),
            lightBackground
          ),
        }
      : null;
  const marketplaceCtaContent = (
    <>
      {marketplaceLabel}
      {marketplaceShowArrow ? <ArrowUpRight className="h-3.5 w-3.5 shrink-0" /> : null}
    </>
  );

  const marketplaceLink = presentation.showMarketplaceLink ? (
    marketplaceExternal ? (
      <a
        href={marketplaceHref}
        target={marketplaceHref.startsWith('http') ? '_blank' : undefined}
        rel={marketplaceHref.startsWith('http') ? 'noreferrer' : undefined}
        className={`${marketplaceCtaChromeClass} ${
          marketplaceDesign === 'text-arrow' ? marketplaceLinkClass : ''
        }`}
        style={{
          ...marketplaceCtaChromeStyle,
          ...(marketplaceTextArrowStyle ?? {}),
        }}
      >
        {marketplaceCtaContent}
      </a>
    ) : (
      <Link
        href={marketplaceHref}
        className={`${marketplaceCtaChromeClass} ${
          marketplaceDesign === 'text-arrow' ? marketplaceLinkClass : ''
        }`}
        style={{
          ...marketplaceCtaChromeStyle,
          ...(marketplaceTextArrowStyle ?? {}),
        }}
      >
        {marketplaceCtaContent}
      </Link>
    )
  ) : null;

  const contactCtaDesign = presentation.ctaDesign ?? 'pill-outline';
  const contactCtaChromeClass = footerPresetCtaClass(contactCtaDesign);
  const contactCtaChromeStyle = footerContactCtaStyle(presentation, { lightBackground });
  const contactCtaTextArrowStyle =
    contactCtaDesign === 'text-arrow'
      ? {
          ...ctaButtonTextStyle,
          color: footerReadableOnBackground(
            String(
              (ctaButtonTextStyle as { color?: string } | undefined)?.color ||
                presentation.accentColor ||
                '#fafafa'
            ),
            lightBackground
          ),
        }
      : null;
  const contactCtaLabel =
    presentation.design === 'minimal'
      ? footerLayout.text('ctaLabel')
      : presentation.ctaButtonLabel?.trim() || t('Contact me');
  const contactCtaButton =
    (presentation.showContactCta || presentation.design === 'minimal') && contactCtaLabel ? (
    <a
      href={ctaHref}
      className={`${contactCtaChromeClass} ${ctaButtonTextClass} max-w-full whitespace-normal text-center`}
      style={{
        ...contactCtaChromeStyle,
        ...(contactCtaTextArrowStyle ?? {}),
      }}
    >
      {presentation.showCtaIcon !== false ? (
        <FooterCtaMailIcon className="h-[1.125em] w-[1.125em] shrink-0" />
      ) : null}
      {contactCtaLabel}
    </a>
  ) : null;
  const dualCtaRowStart =
    contactCtaButton || marketplaceLink ? (
      <div className="flex flex-wrap items-center gap-3 sm:gap-3.5">
        {contactCtaButton}
        {marketplaceLink}
      </div>
    ) : null;

  let body: React.ReactNode;

  if (presentation.design === 'minimal') {
    // Design 3 — Contact CTA: name + bio + CTA | location + contact + socials
    const ctaBio = footerLayout.bio('bio', bio, 220);
    const ctaLocationItem = locationValue
      ? contactItems.find((item) => item.id === 'location') ?? {
          id: 'location',
          label: locationValue,
          icon: 'location' as const,
        }
      : null;
    const ctaContactColumnItems = [
      ...(ctaLocationItem ? [ctaLocationItem] : []),
      ...contactItems.filter((item) => item.id === 'phone' || item.id === 'email'),
    ];
    body = (
      <FooterContactCtaBody
        creatorName={creatorName}
        showBrand={footerLayout.isVisible('name')}
        brandClass={brandClass}
        brandStyle={brandStyle}
        bio={ctaBio}
        descriptionClass={descriptionClass}
        descriptionStyle={descriptionStyle}
        ctaRow={dualCtaRowStart}
        contactItems={ctaContactColumnItems}
        contactLineClass={contactLineClass}
        contactLineStyle={contactLineStyle}
        socialLinks={visibleLinks}
        iconStyle={iconStyle}
        avatarUrl={avatarUrl}
        showAvatar={footerLayout.isVisible('avatar')}
      />
    );
  } else {
    const cardBg = presentation.accentColor?.trim() || DEFAULT_FOOTER_ACCENT_COLOR;
    const cardIsLight = footerColorLuminance(cardBg) > 0.55;
    const cardText = cardIsLight ? '#0a0a0a' : '#fafafa';
    const cardMuted = cardIsLight ? 'rgba(10, 10, 10, 0.78)' : 'rgba(255, 255, 255, 0.88)';
    const cardGlyph = { color: cardText };
    const cardContactItems = contactItems.filter((item) => item.id === 'phone' || item.id === 'email');
    const cardContactList = renderFooterContactList(cardContactItems, false, {
      iconAlign: 'center',
      lineClass: 'font-semibold text-[0.9375rem]',
      lineStyle: { color: cardText, fontWeight: 600 },
      glyphStyle: cardGlyph,
    });
    const cardLocation = locationValue;
    const internalLinks = { title: t('Links'), links: footerNavLinks };
    const cardSocials =
      visibleLinks.length > 0 ? (
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <span className={`text-sm font-semibold ${descriptionClass}`} style={descriptionStyle}>
            {DEFAULT_FOOTER_CONNECT_LABEL}
          </span>
          <nav className="flex flex-wrap gap-3" aria-label={t('Social')}>
            {visibleLinks.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                aria-label={t(link.label)}
                className={`flex h-12 w-12 items-center justify-center rounded-full border transition hover:opacity-90 ${
                  lightBackground
                    ? 'border-black/10 bg-white hover:border-orange-500/30'
                    : 'border-white/15 bg-white/10 hover:border-white/40'
                }`}
                data-pf-no-color-transition=""
                style={iconStyle}
                title={t(link.label)}
              >
                <FooterSocialLinkIcon link={link} bare iconClassName="h-5 w-5" />
              </a>
            ))}
          </nav>
        </div>
      ) : null;

    body = (
      <>
        <div className="mx-auto flex w-full max-w-6xl flex-col items-stretch gap-10 lg:flex-row lg:items-start lg:justify-between lg:gap-20 xl:gap-28">
          <div className="w-full max-w-md lg:max-w-xl">
            <div
              className="rounded-2xl px-10 py-10 sm:px-12 sm:py-12"
              style={{ backgroundColor: cardBg, color: cardText }}
            >
              <div className="flex flex-col">
                {presentation.showBrand !== false ? (
                  <p
                    className="text-3xl font-semibold tracking-tight sm:text-[2rem]"
                    style={{ color: cardText, fontWeight: 600 }}
                  >
                    {creatorName}
                  </p>
                ) : null}
                {cardLocation ? (
                  <p className="mt-3.5 text-base leading-relaxed" style={{ color: cardMuted }}>
                    {cardLocation}
                  </p>
                ) : null}
                {cardContactList ? <div className="mt-8 space-y-1">{cardContactList}</div> : null}
              </div>
            </div>
            {cardSocials}
          </div>

          {internalLinks.links.length > 0 || copyrightLine ? (
            <div className="min-w-0 w-full max-w-xs shrink-0 lg:pt-2">
              {internalLinks.links.length > 0 ? (
                <>
              <h4
                className={`text-lg font-semibold ${landingColumnTextClass.replace(/\bfont-(?:bold|medium|normal|semibold)\b/g, '').trim()}`}
                style={{
                  ...landingColumnTextStyle,
                  color: columnHeadingStyle.color,
                  fontFamily: undefined,
                  fontWeight: 600,
                  textTransform: 'none',
                  letterSpacing: 'normal',
                  marginBottom: `${clampFooterColumnHeadingGapPx(presentation.columnHeadingGapPx) + 10}px`,
                }}
              >
                {internalLinks.title.trim().charAt(0).toUpperCase() +
                  internalLinks.title.trim().slice(1).toLowerCase()}
              </h4>
              <ul className="space-y-3.5">
                {internalLinks.links.map((link) => {
                  const href = resolveFooterLinkHref(link.href, creatorId);
                  const external = href.startsWith('http') || href.startsWith('mailto:');
                  const linkClass = `text-sm font-semibold transition hover:opacity-80 ${contactLineClass.replace(/\bfont-(?:bold|medium|normal|semibold)\b/g, '').trim()}`;
                  const linkStyle = { ...contactLineStyle, fontWeight: 600 };
                  return (
                    <li key={link.id}>
                      {external ? (
                        <a
                          href={href}
                          className={linkClass}
                          data-pf-no-color-transition=""
                          style={linkStyle}
                          {...(href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})}
                        >
                          {t(link.label)}
                        </a>
                      ) : (
                        <Link href={href} className={linkClass} data-pf-no-color-transition="" style={linkStyle}>
                          {t(link.label)}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
                </>
              ) : null}
              {copyrightLine ? (
                <div className={`mt-8 border-t pt-4 text-left ${dividerClass}`}>
                  {copyrightLine}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </>
    );
  }

  const fallbackBg = bgStyle || transparentBase ? '' : lightBackground ? 'bg-neutral-100' : 'bg-neutral-950';
  return (
    <footer
      id="footer"
      className={`relative isolate max-w-full overflow-x-clip ${topMarginClass} ${shellClass} ${clearanceClass} ${fallbackBg}`}
      style={{ ...topMarginStyle, '--pf-footer-font-scale': footerFontSizeScale } as CSSProperties}
    >
      {bgStyle ? (
        <>
          {(presentation.sectionBackgroundOpacity ?? 100) >= 100 ? (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 z-0"
              style={{
                backgroundColor:
                  presentation.sectionBackgroundColor?.trim() ||
                  (lightBackground ? '#ffffff' : '#0a0a0a'),
              }}
            />
          ) : null}
          <div aria-hidden className="pointer-events-none absolute inset-0 z-0" style={bgStyle} />
        </>
      ) : null}
      {patternStyle ? (
        <div aria-hidden className="pointer-events-none absolute inset-0 z-0" style={patternStyle} />
      ) : null}
      <div
        className={`relative z-[1] min-w-0 w-full pf-footer-shell-x ${contentClassName}`}
      >
        <div
          className={`min-w-0 w-full ${footerContentPaddingClassName()}`}
          style={footerContentPaddingStyle(presentation)}
        >
        <PortfolioMotionItem profile={motionProfile} index={0} className="w-full min-w-0">
          <div
            className={footerLayoutClass(presentation.design, presentation.alignment, {
              contentDivider: showContentDivider,
            })}
          >
            {body}
          </div>
        </PortfolioMotionItem>
        </div>
      </div>
    </footer>
  );
}

function FooterCtaMailIcon({ className }: { className?: string }) {
  return <ContactEmailIcon className={className} />;
}
