'use client';

/**
 * Contact section (all contact designs).
 * Split out of portfolio-section-primitives so the public portfolio only downloads the sections it
 * renders (each is loaded with next/dynamic by PublicCreatorPortfolioPage).
 */
import { cardsStyleCss } from '@/components/portfolio/portfolio-cards-style';
import dynamic from 'next/dynamic';
import { Fragment, type CSSProperties } from 'react';
import { normalizeSocialPlatformKey, SocialPlatformIcon, socialPlatformBrandClass } from '@/components/marketplace/creator-profile-social-icons';
import { formatPhoneDisplay } from '@/lib/phone';
import { PortfolioMotionItem } from '@/components/portfolio/PortfolioMotionItem';
import type { PortfolioGlobalMotionProfile } from '@/components/portfolio/portfolio-motion-settings';
import { DEFAULT_MOTION_PROFILE } from '@/components/portfolio/portfolio-motion-settings';
import { portfolioNavTopScrollMarginClass } from '@/components/portfolio/portfolio-nav-top-clearance';
import { elementTextInlineStyle, elementTextStyleClass } from '@/components/portfolio/portfolio-element-text-style';
import { ServicesCardBackgroundLayers, ServicesCardForeground } from '@/components/portfolio/portfolio-services-card-background-layers';
import {
  DEFAULT_CONTACT_PRESENTATION,
  contactCardFrameClass,
  contactCardFrameStyle,
  contactCardMaxWidthClass,
  contactCardPlacementClass,
  contactCardShellClass,
  contactAsideLayoutClass,
  contactChromeCssVars,
  contactCtaClassName,
  contactCtaStyle,
  contactFormStackGapClass,
  contactFormFrameClass,
  contactFormFrameStyle,
  contactInquiryFormCardClass,
  contactInquiryAccentBlockClass,
  contactInquiryChannelCardClass,
  contactChannelCardsCardClass,
  contactChannelCardsCardStyle,
  contactChannelCardsIconClass,
  contactDeskChannelCardClass,
  contactDeskFormPanelClass,
  contactDeskMaxWidthClass,
  contactInfoPanelShellClass,
  contactInfoPanelShellStyle,
  contactInfoPanelFormCardClass,
  contactInfoPanelFormCardStyle,
  contactSwissEditorialFrameClass,
  contactSwissEditorialFrameStyle,
  DEFAULT_CONTACT_SWISS_AVAILABILITY,
  DEFAULT_CONTACT_SWISS_COBALT,
  DEFAULT_CONTACT_SWISS_SUBTITLE,
  DEFAULT_CONTACT_SWISS_TITLE,
  isContactInquiryPanelDesign,
  isContactDeskDesign,
  isContactInfoPanelDesign,
  isContactChannelCardsDesign,
  isContactSwissEditorialDesign,
  isContactOwnedLayoutDesign,
  contactActiveColorMode,
  resolveContactFormDesign,
  resolveContactInquiryHeadline,
  resolveContactInquirySupporting,
  resolveContactInfoPanelHeadline,
  resolveContactInfoPanelSupporting,
  contactIconGlyphClass,
  contactIconPlacementClass,
  contactIconShellClass,
  contactIconShellStyle,
  contactIconBorderClass,
  contactItemRowShellClass,
  contactItemsLayoutClass,
  normalizeContactElementStyles,
  contactPremiumFontScale,
  type PortfolioContactElementStyles,
  type PortfolioContactIconBorder,
  type PortfolioContactIconPlacement,
  type PortfolioContactPresentationSettings,
} from '@/components/portfolio/portfolio-contact-settings';
import {
  ContactHeaderEditorialHeader,
  ContactHeaderMarqueeHeader,
  ContactHeaderIndexHeader,
  ContactHeaderAccentCountHeader,
  ContactHeaderSerifLeadHeader,
  ContactHeaderBillboardHeader,
  ContactHeaderMastheadHeader,
  ContactHeaderSplitHeadingHeader,
} from '@/components/portfolio/contact-portfolio-header-designs';
import { ContactMessageForm } from '@/components/portfolio/portfolio-contact-message-form';
import { ContactInquiryIllustration } from '@/components/portfolio/ContactInquiryIllustration';
import { createContactDesignLayoutResolver } from '@/components/portfolio/portfolio-contact-design-layout';
import { FaqSectionIllustration } from '@/components/portfolio/FaqSectionIllustration';
import { sectionBackgroundStyle } from '@/components/portfolio/portfolio-section-background-settings';
import { DEFAULT_CONTENT_GUTTER, type PortfolioContentGutter } from '@/components/portfolio/portfolio-editorial-layout';
import { useT } from '@/lib/i18n/I18nProvider';
import { ArrowUpRight, ContactEmailIcon, ContactLocationIcon, ContactPhoneIcon, EditorialContactLink, inferContactLinkPlatform } from '@/components/portfolio/portfolio-contact-link-icons';
import { SERIF } from '@/components/portfolio/portfolio-section-primitives';

const ContactDesignEditorialFocus = dynamic(() =>
  import('@/components/portfolio/portfolio-contact-design-editorial-focus').then((m) => m.ContactDesignEditorialFocus)
);
const ContactDesignSplitGrid = dynamic(() =>
  import('@/components/portfolio/portfolio-contact-design-split-grid').then((m) => m.ContactDesignSplitGrid)
);
const ContactDesignLiquidDistortion = dynamic(() =>
  import('@/components/portfolio/portfolio-contact-design-liquid-distortion').then((m) => m.ContactDesignLiquidDistortion)
);
const ContactDesignSequentialReveal = dynamic(() =>
  import('@/components/portfolio/portfolio-contact-design-sequential-reveal').then((m) => m.ContactDesignSequentialReveal)
);
const ContactDesignStudioOverlap = dynamic(() =>
  import('@/components/portfolio/portfolio-contact-design-studio-overlap').then((m) => m.ContactDesignStudioOverlap)
);
const ContactDesignBrokenGrid = dynamic(() =>
  import('@/components/portfolio/portfolio-contact-design-broken-grid').then((m) => m.ContactDesignBrokenGrid)
);
const ContactDesignNumberedNarrative = dynamic(() =>
  import('@/components/portfolio/portfolio-contact-design-numbered-narrative').then((m) => m.ContactDesignNumberedNarrative)
);
const ContactDesignMagneticOverlap = dynamic(() =>
  import('@/components/portfolio/portfolio-contact-design-magnetic-overlap').then((m) => m.ContactDesignMagneticOverlap)
);

function ContactCardShell({
  presentation,
  children,
}: {
  presentation: PortfolioContactPresentationSettings;
  children: React.ReactNode;
}) {
  const openChrome =
    presentation.cardDesign === 'tiles' ||
    presentation.cardDesign === 'channel-cards' ||
    isContactOwnedLayoutDesign(presentation.cardDesign);
  const skipOuterFill =
    presentation.cardDesign === 'tiles' ||
    presentation.cardDesign === 'channel-cards' ||
    isContactOwnedLayoutDesign(presentation.cardDesign);
  return (
    <div
      className={`relative ${openChrome ? 'overflow-visible' : 'overflow-hidden'} ${contactCardFrameClass(
        presentation
      )} ${contactCardShellClass(presentation.cardDesign)}`}
      style={{ ...contactCardFrameStyle(presentation), ...contactChromeCssVars(presentation) }}
    >
      {skipOuterFill ? null : <ServicesCardBackgroundLayers presentation={presentation} />}
      <ServicesCardForeground>{children}</ServicesCardForeground>
    </div>
  );
}

function ContactFormShell({
  presentation,
  children,
}: {
  presentation: PortfolioContactPresentationSettings;
  children: React.ReactNode;
}) {
  const formDesign = resolveContactFormDesign(presentation);
  if (formDesign === 'info-panel') {
    return (
      <div
        className={contactInfoPanelFormCardClass(presentation)}
        style={{
          ...contactInfoPanelFormCardStyle(presentation),
          ...contactChromeCssVars(presentation),
        }}
      >
        <ServicesCardForeground>{children}</ServicesCardForeground>
      </div>
    );
  }
  return (
    <div
      className={`${contactFormFrameClass(presentation)} flex h-full min-h-full w-full flex-col`}
      style={{ ...contactFormFrameStyle(presentation), ...contactChromeCssVars(presentation) }}
    >
      <ServicesCardForeground className="flex h-full min-h-0 w-full flex-1 flex-col">
        {children}
      </ServicesCardForeground>
    </div>
  );
}

function ContactChannelGlyph({
  kind,
  className = 'h-6 w-6',
}: {
  kind: 'email' | 'phone' | 'location';
  className?: string;
}) {
  if (kind === 'email') return <ContactEmailIcon className={className} />;
  if (kind === 'phone') return <ContactPhoneIcon className={className} />;
  return <ContactLocationIcon className={className} />;
}

function ContactItemIconBadge({
  presentation,
  children,
}: {
  presentation: PortfolioContactPresentationSettings;
  children: React.ReactNode;
}) {
  const withThinBorder = {
    ...presentation,
    iconBorder: (presentation.iconBorder === 'solid' ? 'solid' : 'soft') as PortfolioContactIconBorder,
  };
  return (
    <div
      className={contactIconShellClass(withThinBorder)}
      style={{
        ...contactIconShellStyle(withThinBorder),
        borderColor:
          presentation.iconBorderColor ||
          presentation.cardBorderColor ||
          'color-mix(in srgb, var(--contact-border, #a3a3a3) 55%, transparent)',
      }}
    >
      {children}
    </div>
  );
}

type ContactUnifiedItem = {
  id: string;
  href: string;
  title: string;
  subtitle: string;
  external?: boolean;
  icon: React.ReactNode;
  titleStyleTarget: 'channelValue' | 'locationValue' | 'linkLabel' | 'linksHeading' | 'linkUrl';
  subtitleStyleTarget: 'channelValue' | 'locationValue' | 'linkLabel' | 'linksHeading' | 'linkUrl';
};

function contactElementStyleForTarget(
  target: ContactUnifiedItem['titleStyleTarget'],
  elementStyles: PortfolioContactElementStyles
) {
  switch (target) {
    case 'locationValue':
      return elementStyles.locationValue;
    case 'linkLabel':
      return elementStyles.linkLabel;
    case 'linksHeading':
      return elementStyles.linksHeading;
    case 'linkUrl':
      return elementStyles.linkUrl;
    default:
      return elementStyles.channelValue;
  }
}

function ContactUnifiedItemRow({
  item,
  design,
  cardPadding,
  iconPlacement,
  elementStyles,
  colorMode = 'light',
}: {
  item: ContactUnifiedItem;
  design: PortfolioContactPresentationSettings['cardDesign'];
  cardPadding: PortfolioContactPresentationSettings['cardPadding'];
  iconPlacement: PortfolioContactIconPlacement;
  elementStyles: PortfolioContactElementStyles;
  colorMode?: 'light' | 'dark';
}) {
  const t = useT();
  const placement =
    design === 'directory'
      ? {
          row: 'flex flex-row items-center gap-3 text-left',
          icon: 'shrink-0',
          text: 'min-w-0 flex-1 text-left',
        }
      : contactIconPlacementClass(iconPlacement);
  const shell = contactItemRowShellClass(design, cardPadding);
  const titleStyleDefRaw = contactElementStyleForTarget(item.titleStyleTarget, elementStyles);
  const titleStyleDef =
    design === 'editorial' &&
    (item.titleStyleTarget === 'channelValue' || item.titleStyleTarget === 'locationValue')
      ? { ...titleStyleDefRaw, size: 'md' as const }
      : titleStyleDefRaw;
  const subtitleStyleDef = contactElementStyleForTarget(item.subtitleStyleTarget, elementStyles);
  const isChannelValue =
    item.titleStyleTarget === 'channelValue' ||
    item.titleStyleTarget === 'locationValue' ||
    item.titleStyleTarget === 'linkLabel';
  const titleClass = elementTextStyleClass(
    isChannelValue ? { ...titleStyleDef, weight: 'semibold' } : titleStyleDef,
    item.titleStyleTarget === 'linksHeading' || item.titleStyleTarget === 'linkUrl' ? 'label' : 'body'
  )
    .replace(/\bfont-(?:thin|extralight|light|normal|medium|semibold|bold|extrabold|black)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  const titleStyle: CSSProperties = {
    ...elementTextInlineStyle(titleStyleDef, colorMode),
    ...(isChannelValue ? { fontWeight: 600 } : null),
  };
  const subtitleClass = elementTextStyleClass(
    subtitleStyleDef,
    item.subtitleStyleTarget === 'linksHeading' || item.subtitleStyleTarget === 'linkUrl'
      ? 'label'
      : 'body'
  );
  const subtitleStyle = elementTextInlineStyle(subtitleStyleDef, colorMode);
  const showSubtitle = Boolean(item.subtitle?.trim());

  const textBlock = (
    <div className={placement.text}>
      <p
        className={`truncate ${isChannelValue ? 'font-semibold' : ''} ${titleClass}`.trim()}
        style={titleStyle}
      >
        {t(item.title)}
      </p>
      {showSubtitle ? (
        <p className={`mt-0.5 truncate ${subtitleClass}`} style={subtitleStyle}>
          {t(item.subtitle)}
        </p>
      ) : null}
    </div>
  );

  return (
    <a
      href={item.href}
      {...(item.external ? { target: '_blank', rel: 'noreferrer' } : {})}
      className={`group relative ${shell} ${placement.row}`}
    >
      {iconPlacement === 'top' ? (
        <>
          <div className={placement.icon}>{item.icon}</div>
          {textBlock}
        </>
      ) : iconPlacement === 'right' ? (
        <>
          {textBlock}
          <div className={placement.icon}>{item.icon}</div>
        </>
      ) : (
        <>
          <div className={placement.icon}>{item.icon}</div>
          {textBlock}
        </>
      )}
    </a>
  );
}

function ContactUnifiedList({
  presentation,
  visibleEmail,
  visiblePhone,
  visibleLocation,
  links,
  renderSocialIcon,
  socialBrandClass,
  elementStyles,
  includeLinks = true,
}: {
  presentation: PortfolioContactPresentationSettings;
  visibleEmail: string | null;
  visiblePhone: string | null;
  visibleLocation: string | null;
  links: EditorialContactLink[];
  renderSocialIcon?: (platform: string, className: string) => React.ReactNode;
  socialBrandClass?: (platform: string) => string;
  elementStyles: PortfolioContactElementStyles;
  /** When false, only email / phone / location rows are rendered (Directory socials sit outside). */
  includeLinks?: boolean;
}) {
  const t = useT();
  const glyphClass = contactIconGlyphClass(presentation.iconSize ?? 'sm');
  const isEditorial = presentation.cardDesign === 'editorial';
  const isDirectory = presentation.cardDesign === 'directory';
  const channelIconPresentation = isDirectory
    ? {
        ...presentation,
        iconRadius: 'full' as const,
        iconBorder: (presentation.iconBorder === 'solid' ? 'solid' : 'soft') as PortfolioContactIconBorder,
        iconBackgroundEnabled: false,
        iconColor: presentation.iconColor?.trim() || presentation.ctaColor,
      }
    : presentation;
  // Filled channel glyphs read larger than social marks — keep them one step smaller in editorial.
  const channelGlyphClass = isEditorial
    ? contactIconGlyphClass(
        presentation.iconSize === 'xl'
          ? 'lg'
          : presentation.iconSize === 'lg'
            ? 'md'
            : 'sm'
      )
    : glyphClass;
  const channelItems: ContactUnifiedItem[] = [];
  if (visibleEmail?.trim()) {
    channelItems.push(
      isEditorial
        ? {
            id: 'channel-email',
            href: `mailto:${visibleEmail.trim()}`,
            title: visibleEmail.trim(),
            subtitle: '',
            icon: (
              <ContactItemIconBadge presentation={channelIconPresentation}>
                <ContactChannelGlyph kind="email" className={channelGlyphClass} />
              </ContactItemIconBadge>
            ),
            titleStyleTarget: 'channelValue',
            subtitleStyleTarget: 'linksHeading',
          }
        : {
            id: 'channel-email',
            href: `mailto:${visibleEmail.trim()}`,
            title: visibleEmail.trim(),
            subtitle: t('Email'),
            icon: (
              <ContactItemIconBadge presentation={channelIconPresentation}>
                <ContactChannelGlyph kind="email" className={glyphClass} />
              </ContactItemIconBadge>
            ),
            titleStyleTarget: 'channelValue',
            subtitleStyleTarget: 'linksHeading',
          }
    );
  }
  if (visiblePhone?.trim()) {
    channelItems.push(
      isEditorial
        ? {
            id: 'channel-phone',
            href: `tel:${visiblePhone.trim()}`,
            title: formatPhoneDisplay(visiblePhone.trim()),
            subtitle: '',
            icon: (
              <ContactItemIconBadge presentation={channelIconPresentation}>
                <ContactChannelGlyph kind="phone" className={channelGlyphClass} />
              </ContactItemIconBadge>
            ),
            titleStyleTarget: 'channelValue',
            subtitleStyleTarget: 'linksHeading',
          }
        : {
            id: 'channel-phone',
            href: `tel:${visiblePhone.trim()}`,
            title: formatPhoneDisplay(visiblePhone.trim()),
            subtitle: t('Phone'),
            icon: (
              <ContactItemIconBadge presentation={channelIconPresentation}>
                <ContactChannelGlyph kind="phone" className={glyphClass} />
              </ContactItemIconBadge>
            ),
            titleStyleTarget: 'channelValue',
            subtitleStyleTarget: 'linksHeading',
          }
    );
  }
  if (visibleLocation?.trim()) {
    channelItems.push(
      isEditorial
        ? {
            id: 'channel-location',
            href: `https://maps.google.com/?q=${encodeURIComponent(visibleLocation.trim())}`,
            title: visibleLocation.trim(),
            subtitle: '',
            external: true,
            icon: (
              <ContactItemIconBadge presentation={channelIconPresentation}>
                <ContactChannelGlyph kind="location" className={channelGlyphClass} />
              </ContactItemIconBadge>
            ),
            titleStyleTarget: 'locationValue',
            subtitleStyleTarget: 'linksHeading',
          }
        : {
            id: 'channel-location',
            href: `https://maps.google.com/?q=${encodeURIComponent(visibleLocation.trim())}`,
            title: visibleLocation.trim(),
            subtitle: t('Location'),
            external: true,
            icon: (
              <ContactItemIconBadge presentation={channelIconPresentation}>
                <ContactChannelGlyph kind="location" className={glyphClass} />
              </ContactItemIconBadge>
            ),
            titleStyleTarget: 'locationValue',
            subtitleStyleTarget: 'linksHeading',
          }
    );
  }

  const linkItems: ContactUnifiedItem[] = includeLinks
    ? links.map((link) => {
        if (isEditorial) {
          return {
            id: link.id,
            href: link.url,
            title: contactSocialNetworkLabel(link),
            subtitle: '',
            external: true,
            icon: (
              <ContactLinkIcon
                link={link}
                presentation={presentation}
                renderSocialIcon={renderSocialIcon}
                socialBrandClass={socialBrandClass}
              />
            ),
            titleStyleTarget: 'linkLabel' as const,
            subtitleStyleTarget: 'linkUrl' as const,
          };
        }
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
        const title = link.label?.trim() || hostname || url;
        return {
          id: link.id,
          href: link.url,
          title,
          subtitle: url.replace(/^https?:\/\//, ''),
          external: true,
          icon: (
            <ContactLinkIcon
              link={link}
              presentation={presentation}
              renderSocialIcon={renderSocialIcon}
              socialBrandClass={socialBrandClass}
            />
          ),
          titleStyleTarget: 'linkLabel' as const,
          subtitleStyleTarget: 'linkUrl' as const,
        };
      })
    : [];

  const items =
    presentation.blockOrder === 'links-first'
      ? [...linkItems, ...channelItems]
      : [...channelItems, ...linkItems];

  if (items.length === 0) return null;

  return (
    <div className={contactItemsLayoutClass(presentation.cardDesign, presentation.itemGap ?? 'sm')}>
      {items.map((item) => (
        <ContactUnifiedItemRow
          key={item.id}
          item={item}
          design={presentation.cardDesign}
          cardPadding={presentation.cardPadding}
          iconPlacement={
            presentation.cardDesign === 'editorial'
              ? 'left'
              : presentation.cardDesign === 'directory'
                ? 'left'
                : (presentation.iconPlacement ?? 'left')
          }
          elementStyles={elementStyles}
        />
      ))}
    </div>
  );
}

/** Directory — social / website links as rounded logo-only chips outside the card. */
function ContactDirectorySocialIcons({
  links,
  presentation,
  renderSocialIcon,
  socialBrandClass,
  className = '',
  enlarged = false,
}: {
  links: EditorialContactLink[];
  presentation: PortfolioContactPresentationSettings;
  renderSocialIcon?: (platform: string, className: string) => React.ReactNode;
  socialBrandClass?: (platform: string) => string;
  className?: string;
  /** Directory hero socials — much larger chips. */
  enlarged?: boolean;
}) {
  const t = useT();
  if (links.length === 0) return null;
  const glyphClass = enlarged
    ? 'h-10 w-10 sm:h-12 sm:w-12'
    : contactIconGlyphClass(presentation.iconSize ?? 'sm');
  const thinBorderPresentation = {
    ...presentation,
    iconRadius: 'full' as const,
    iconBorder: (presentation.iconBorder === 'solid' ? 'solid' : 'soft') as PortfolioContactIconBorder,
    ...(enlarged ? { iconSize: 'xl' as const } : null),
  };
  const enlargedShellClass = enlarged
    ? 'flex h-20 w-20 shrink-0 items-center justify-center rounded-full sm:h-24 sm:w-24'
    : '';

  return (
    <nav
      className={`flex flex-wrap items-center justify-center gap-6 sm:gap-8 ${className}`.trim()}
      aria-label={t('Social links')}
    >
      {links.map((link) => {
        const platform = inferContactLinkPlatform(link);
        const socialKey = platform ? normalizeSocialPlatformKey(platform) : 'other';
        const isSocial = socialKey !== 'other';
        const useBrand = presentation.iconUseBrandColors !== false;
        const label =
          link.label?.trim() ||
          (platform ? platform.replace(/_/g, ' ').toLowerCase() : t('Link'));

        let iconNode: React.ReactNode;
        let shellClass = `${
          enlarged ? enlargedShellClass : contactIconShellClass(thinBorderPresentation)
        } ${contactIconBorderClass(thinBorderPresentation.iconBorder)} transition hover:opacity-90`.trim();
        let shellStyle: React.CSSProperties = {
          ...contactIconShellStyle(thinBorderPresentation),
          borderColor:
            presentation.iconBorderColor ||
            presentation.cardBorderColor ||
            'color-mix(in srgb, var(--contact-border, #a3a3a3) 55%, transparent)',
        };

        if (isSocial && platform) {
          iconNode = renderSocialIcon?.(platform, glyphClass) ?? (
            <SocialPlatformIcon platform={platform} className={glyphClass} />
          );
          if (useBrand && presentation.iconBackgroundEnabled !== false) {
            const brandClass = socialBrandClass?.(platform) ?? socialPlatformBrandClass(platform);
            shellClass = `${shellClass} ${brandClass}`.trim();
          }
        } else if (link.type === 'WEBSITE') {
          iconNode = (
            <svg
              className={glyphClass}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
              />
            </svg>
          );
        } else {
          iconNode = (
            <svg
              className={glyphClass}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              />
            </svg>
          );
        }

        return (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noreferrer"
            aria-label={label}
            title={label}
            className={shellClass}
            data-pf-no-color-transition=""
            style={shellStyle}
          >
            {iconNode}
          </a>
        );
      })}
    </nav>
  );
}

function contactSocialNetworkLabel(link: EditorialContactLink): string {
  const platform = inferContactLinkPlatform(link);
  if (platform) {
    const key = normalizeSocialPlatformKey(platform);
    switch (key) {
      case 'youtube':
        return 'YouTube';
      case 'tiktok':
        return 'TikTok';
      case 'facebook':
        return 'Facebook';
      case 'instagram':
        return 'Instagram';
      case 'linkedin':
        return 'LinkedIn';
      case 'github':
        return 'GitHub';
      case 'twitter':
        return 'X';
      default:
        break;
    }
  }
  if (link.type === 'WEBSITE') return 'Website';
  const label = link.label?.trim();
  if (label) return label;
  return 'Link';
}

function ContactLinkIcon({
  link,
  presentation,
  renderSocialIcon,
  socialBrandClass,
}: {
  link: EditorialContactLink;
  presentation: PortfolioContactPresentationSettings;
  renderSocialIcon?: (platform: string, className: string) => React.ReactNode;
  socialBrandClass?: (platform: string) => string;
}) {
  const platform = inferContactLinkPlatform(link);
  const socialKey = platform ? normalizeSocialPlatformKey(platform) : 'other';
  const isSocial = socialKey !== 'other';
  const glyphClass = contactIconGlyphClass(presentation.iconSize ?? 'sm');
  const useBrand = presentation.iconUseBrandColors !== false;

  if (isSocial && platform && useBrand) {
    const brandClass = socialBrandClass?.(platform) ?? socialPlatformBrandClass(platform);
    const iconNode = renderSocialIcon?.(platform, glyphClass) ?? (
      <SocialPlatformIcon platform={platform} className={glyphClass} />
    );
    const noFill = presentation.iconBackgroundEnabled === false;
    const withThinBorder = {
      ...presentation,
      iconBorder: (presentation.iconBorder === 'solid' ? 'solid' : 'soft') as PortfolioContactIconBorder,
    };

    return (
      <div
        className={`${contactIconShellClass(withThinBorder)} ${noFill ? '' : brandClass}`.trim()}
        style={{
          ...(noFill ? contactIconShellStyle(withThinBorder) : {}),
          borderColor:
            presentation.iconBorderColor ||
            presentation.cardBorderColor ||
            'color-mix(in srgb, var(--contact-border, #a3a3a3) 55%, transparent)',
        }}
      >
        {iconNode}
      </div>
    );
  }

  if (isSocial && platform) {
    const iconNode = renderSocialIcon?.(platform, glyphClass) ?? (
      <SocialPlatformIcon platform={platform} className={glyphClass} />
    );
    return <ContactItemIconBadge presentation={presentation}>{iconNode}</ContactItemIconBadge>;
  }

  // Website / generic links — same accent badge as email / phone / location (palette sync).
  const glyph =
    link.type === 'WEBSITE' ? (
      <svg className={glyphClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
        />
      </svg>
    ) : (
      <svg className={glyphClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
        />
      </svg>
    );

  return <ContactItemIconBadge presentation={presentation}>{glyph}</ContactItemIconBadge>;
}

export function EditorialContactSection({
  pageNavigation = false,
  creatorId,
  email,
  phone,
  locationLabel,
  links,
  ctaHref,
  ctaLabel = 'Start a project',
  responseTimeLabel,
  heroImageUrl,
  heroImageAlt,
  contentGutter = DEFAULT_CONTENT_GUTTER,
  globalColorMode = 'dark',
  paletteCssVars,
  membersOnlyNode,
  renderSocialIcon,
  socialBrandClass,
  sectionTitle,
  sectionSubtitle,
  presentation = DEFAULT_CONTACT_PRESENTATION,
  titleTypographyClass,
  titleTypographyStyle,
  subtitleTypographyClass,
  subtitleTypographyStyle,
  suppressBackground = false,
  motionProfile = DEFAULT_MOTION_PROFILE,
  topSpacingClass = 'pt-12 sm:pt-16 lg:pt-20',
  topSpacingStyle,
  bottomSpacingClass = 'pb-12 sm:pb-16 lg:pb-20',
  bottomSpacingStyle,
  previewFontScale = 1,
}: {
  /** Page navigation uses a nested scroller; sequential Contact becomes a normal static layout. */
  pageNavigation?: boolean;
  creatorId?: string;
  email?: string | null;
  phone?: string | null;
  locationLabel?: string | null;
  links: EditorialContactLink[];
  ctaHref: string;
  ctaLabel?: string;
  responseTimeLabel?: string | null;
  /** Real creator photo for "Sequential reveal"'s clip-path hero image (falls back to initials). */
  heroImageUrl?: string | null;
  heroImageAlt?: string;
  /** Same site-wide editorial gutter every other section uses — premium full-bleed designs
   *  don't go through `PortfolioSectionShell` (which applies this automatically), so they need
   *  it passed in explicitly to line their own content up with the rest of the page. */
  contentGutter?: PortfolioContentGutter;
  /** The portfolio's real active appearance (settings.global.colorMode) — every premium
   *  Contact design mirrors it now (pure white / pure black canvas, synced text). */
  globalColorMode?: 'light' | 'dark';
  /** Section-local tokens must follow Contact's override, not the surrounding site mode. */
  paletteCssVars?: CSSProperties;
  membersOnlyNode?: React.ReactNode;
  renderSocialIcon?: (platform: string, className: string) => React.ReactNode;
  socialBrandClass?: (platform: string) => string;
  sectionTitle?: string;
  sectionSubtitle?: React.ReactNode;
  presentation?: PortfolioContactPresentationSettings;
  titleTypographyClass?: string;
  titleTypographyStyle?: React.CSSProperties;
  subtitleTypographyClass?: string;
  subtitleTypographyStyle?: React.CSSProperties;
  /** When a global solid is active, sections without their own fill stay clear; an enabled section fill paints on top. */
  suppressBackground?: boolean;
  motionProfile?: PortfolioGlobalMotionProfile;
  /** Global padding-top above the section title. */
  topSpacingClass?: string;
  /** Optional CSS vars for Split screen px fine-tune. */
  topSpacingStyle?: React.CSSProperties;
  /** Global padding-bottom below section content. */
  bottomSpacingClass?: string;
  bottomSpacingStyle?: React.CSSProperties;
  /** Small readability adjustment for the studio catalogue only. */
  previewFontScale?: number;
}) {
  const t = useT();
  const contactFontScale = contactPremiumFontScale(presentation.premiumFontSize) * previewFontScale;
  const contactSectionStyle = {
    ...paletteCssVars,
    ...topSpacingStyle,
    ...bottomSpacingStyle,
    '--pf-contact-font-scale': contactFontScale,
  } as CSSProperties;
  const visibleEmail = presentation.showEmail ? (email ?? null) : null;
  const visiblePhone = presentation.showPhone ? (phone ?? null) : null;
  const visibleLocation = presentation.showLocation ? (locationLabel ?? null) : null;
  const visibleLinks = presentation.showSocialLinks ? links : [];
  const hasPrimary = Boolean(
    visibleEmail?.trim() || visiblePhone?.trim() || visibleLocation?.trim()
  );
  const hasLinks = visibleLinks.length > 0;
  const isInquiryPanel = isContactInquiryPanelDesign(presentation.cardDesign);
  const isInquiry = presentation.cardDesign === 'inquiry';
  const isDesk = isContactDeskDesign(presentation.cardDesign);
  const isInfoPanel = isContactInfoPanelDesign(presentation.cardDesign);
  const isChannelCards = isContactChannelCardsDesign(presentation.cardDesign);
  const isSwissEditorial = isContactSwissEditorialDesign(presentation.cardDesign);
  const formDesign = resolveContactFormDesign(presentation);
  const colorMode =
    presentation.useHeroPalette === false ? contactActiveColorMode(presentation) : 'light';
  const showContactForm =
    Boolean(presentation.showContactForm) ||
    isContactOwnedLayoutDesign(presentation.cardDesign) ||
    presentation.cardDesign === 'editorial' ||
    presentation.cardDesign === 'directory';
  const contactFormPlacement =
    presentation.cardDesign === 'editorial' || presentation.cardDesign === 'directory'
      ? 'side'
      : (presentation.contactFormPlacement ?? 'below');
  const hasContactList = hasPrimary || hasLinks;
  const bgStyle =
    !suppressBackground && presentation.sectionBackgroundEnabled
      ? sectionBackgroundStyle(presentation)
      : undefined;
  const resolvedCtaLabel = presentation.ctaLabel.trim() || ctaLabel;
  const elementStyles = normalizeContactElementStyles(presentation.elementStyles);
  const ctaTextClass = elementTextStyleClass(elementStyles.ctaLabel, 'label');
  const ctaLabelColor =
    presentation.useHeroPalette === false && colorMode === 'dark'
      ? elementStyles.ctaLabel.colorDark || elementStyles.ctaLabel.color
      : elementStyles.ctaLabel?.color;
  const ctaChrome = contactCtaStyle(presentation.ctaDesign, presentation.ctaColor, {
    ink: presentation.titleColor,
    label: ctaLabelColor,
  });
  const ctaTextStyle = {
    ...ctaChrome,
    ...elementTextInlineStyle(elementStyles.ctaLabel, colorMode),
    // Keep chrome fill/border; outline text must stay on ink (not neutre).
    backgroundColor: ctaChrome.backgroundColor,
    borderColor: ctaChrome.borderColor,
    color:
      presentation.ctaDesign === 'pill-outline'
        ? ctaChrome.color
        : (ctaLabelColor ?? ctaChrome.color),
  };
  const chromeVars = contactChromeCssVars(presentation);
  const formChannelsMeta = {
    email: visibleEmail,
    phone: visiblePhone,
    locationLabel: visibleLocation,
    responseTimeLabel: responseTimeLabel ?? null,
  };

  const contactFormNode = (
    <ContactMessageForm
      creatorId={creatorId ?? ''}
      presentation={presentation}
      formDesign={formDesign}
      channelsMeta={formChannelsMeta}
    />
  );

  const resolvedTitle = sectionTitle ?? t('Contact');
  const resolvedSubtitle =
    sectionSubtitle ?? (
      <>
        {t('Should you have a project in mind, I would be pleased to hear from you')}
        {responseTimeLabel?.trim() && presentation.showResponseTimeInSubtitle
          ? t(' — I typically reply {toLowerCase}.', { toLowerCase: responseTimeLabel.toLowerCase() })
          : t(' to discuss your objectives.')}
      </>
    );

  // Header — one shared, GSAP-animated header (chosen from 8 editorial layouts, same
  // mechanism as Portfolio/Work, Stack, and Tools). Count = visible contact methods
  // (email/phone/location) + visible social links, used by 3 of the 8 designs.
  const contactHeaderItemCount =
    [visibleEmail, visiblePhone, visibleLocation].filter((value) => Boolean(value?.trim())).length +
    visibleLinks.length;
  const contactHeaderProps = {
    title: resolvedTitle,
    subtitle: typeof sectionSubtitle === 'string' ? sectionSubtitle : undefined,
    presentation,
    itemCount: contactHeaderItemCount,
  };
  const renderContactHeader = () =>
    presentation.headerDesign === 'marquee' ? (
      <ContactHeaderMarqueeHeader {...contactHeaderProps} />
    ) : presentation.headerDesign === 'index' ? (
      <ContactHeaderIndexHeader {...contactHeaderProps} />
    ) : presentation.headerDesign === 'accent-count' ? (
      <ContactHeaderAccentCountHeader {...contactHeaderProps} />
    ) : presentation.headerDesign === 'serif-lead' ? (
      <ContactHeaderSerifLeadHeader {...contactHeaderProps} />
    ) : presentation.headerDesign === 'billboard' ? (
      <ContactHeaderBillboardHeader {...contactHeaderProps} />
    ) : presentation.headerDesign === 'masthead' ? (
      <ContactHeaderMastheadHeader {...contactHeaderProps} />
    ) : presentation.headerDesign === 'split-heading' ? (
      <ContactHeaderSplitHeadingHeader {...contactHeaderProps} />
    ) : (
      <ContactHeaderEditorialHeader {...contactHeaderProps} />
    );

  const withContactIllustration = (content: React.ReactNode) => {
    if (presentation.illustrationVariant === 'none') return content;
    const illustration = <FaqSectionIllustration variant={presentation.illustrationVariant} />;
    return (
      <div
        className={`grid w-full min-w-0 gap-8 lg:items-center ${
          presentation.illustrationPlacement === 'left'
            ? 'lg:grid-cols-[minmax(12rem,0.32fr)_minmax(0,1fr)]'
            : 'lg:grid-cols-[minmax(0,1fr)_minmax(12rem,0.32fr)]'
        }`}
        style={
          {
            '--faq-accent': presentation.ctaColor,
            '--faq-ink': presentation.titleColor,
            '--faq-surface': presentation.cardBackgroundColor,
          } as CSSProperties
        }
      >
        {presentation.illustrationPlacement === 'left' ? (
          <>
            {illustration}
            <div className="min-w-0">{content}</div>
          </>
        ) : (
          <>
            <div className="min-w-0">{content}</div>
            {illustration}
          </>
        )}
      </div>
    );
  };

  // Premium, full-bleed designs — each owns its whole composition (no card, no form);
  // the black canvas and internal padding live inside the design component itself, but
  // the global Section spacing setting still applies as extra padding on the wrapping
  // <section>, same as every other section on the page, keyed by presentation.cardDesign.
  // The Background tab's fill paints on this wrapping <section> itself (full-bleed, behind
  // everything, `position:relative` + `inset-0`) rather than on the design's own inner root —
  // that inner root only spans the space *between* the section's top/bottom spacing padding,
  // so painting there left that padding showing the page wallpaper instead of this section's
  // own background. Same fix shape as `PortfolioSectionShell`'s bgStyle layer.
  // General → Photo replaces the profile photo in every premium design that shows one.
  const contactPhotoUrl = presentation.photoUrl?.trim() || heroImageUrl || null;

  const contactBackgroundLayer = bgStyle ? (
    <div
      aria-hidden
      className="pf-theme-layer pointer-events-none absolute inset-0 left-1/2 z-0 w-screen -translate-x-1/2"
      style={bgStyle}
    />
  ) : null;

  if (presentation.cardDesign === 'editorial-focus') {
    return (
      <section
        id="contact"
        style={contactSectionStyle}
        className={`relative ${topSpacingClass} ${bottomSpacingClass}`}
      >
        {contactBackgroundLayer}
        <div className="relative z-[1]">
          <ContactDesignEditorialFocus
            layout={createContactDesignLayoutResolver(presentation, 'editorial-focus')}
            email={visibleEmail}
            phone={visiblePhone}
            locationLabel={visibleLocation}
            links={visibleLinks}
            ctaHref={ctaHref}
            contentGutter={contentGutter}
            colorMode={globalColorMode}
          />
        </div>
      </section>
    );
  }

  if (presentation.cardDesign === 'split-grid') {
    return (
      <section
        id="contact"
        style={contactSectionStyle}
        className={`relative ${topSpacingClass} ${bottomSpacingClass}`}
      >
        {contactBackgroundLayer}
        <div className="relative z-[1]">
          <ContactDesignSplitGrid
            contentGutter={contentGutter}
            heroImageUrl={contactPhotoUrl}
            heroImageAlt={heroImageAlt ?? ''}
            accent={presentation.ctaColor}
            layout={createContactDesignLayoutResolver(presentation, 'split-grid')}
            email={visibleEmail}
            phone={visiblePhone}
            locationLabel={visibleLocation}
            links={visibleLinks}
            colorMode={globalColorMode}
          />
        </div>
      </section>
    );
  }

  if (presentation.cardDesign === 'liquid-distortion') {
    return (
      <section
        id="contact"
        style={contactSectionStyle}
        className={`relative ${topSpacingClass} ${bottomSpacingClass}`}
      >
        {contactBackgroundLayer}
        <div className="relative z-[1]">
          <ContactDesignLiquidDistortion
            layout={createContactDesignLayoutResolver(presentation, 'liquid-distortion')}
            email={visibleEmail}
            phone={visiblePhone}
            locationLabel={visibleLocation}
            links={visibleLinks}
            contentGutter={contentGutter}
            colorMode={globalColorMode}
          />
        </div>
      </section>
    );
  }

  if (presentation.cardDesign === 'sequential-reveal') {
    return (
      <section
        id="contact"
        style={contactSectionStyle}
        className={`relative ${topSpacingClass} ${bottomSpacingClass}`}
      >
        {contactBackgroundLayer}
        <div className="relative z-[1]">
          <ContactDesignSequentialReveal
            staticLayout={pageNavigation}
            layout={createContactDesignLayoutResolver(presentation, 'sequential-reveal')}
            creatorId={creatorId}
            email={visibleEmail}
            phone={visiblePhone}
            locationLabel={visibleLocation}
            heroImageUrl={contactPhotoUrl}
            heroImageAlt={heroImageAlt ?? ''}
            sectionTitle={sectionTitle}
            presentation={presentation}
            contentGutter={contentGutter}
            colorMode={globalColorMode}
          />
        </div>
      </section>
    );
  }

  if (presentation.cardDesign === 'studio-overlap') {
    return (
      <section
        id="contact"
        style={contactSectionStyle}
        className={`relative ${topSpacingClass} ${bottomSpacingClass}`}
      >
        {contactBackgroundLayer}
        <div className="relative z-[1]">
          <ContactDesignStudioOverlap
            layout={createContactDesignLayoutResolver(presentation, 'studio-overlap')}
            email={visibleEmail}
            phone={visiblePhone}
            locationLabel={visibleLocation}
            heroImageUrl={contactPhotoUrl}
            heroImageAlt={heroImageAlt ?? ''}
            sectionTitle={sectionTitle}
            contentGutter={contentGutter}
            colorMode={globalColorMode}
          />
        </div>
      </section>
    );
  }

  if (presentation.cardDesign === 'broken-grid') {
    return (
      <section
        id="contact"
        style={contactSectionStyle}
        className={`relative ${topSpacingClass} ${bottomSpacingClass}`}
      >
        {contactBackgroundLayer}
        <div className="relative z-[1]">
          <ContactDesignBrokenGrid
            layout={createContactDesignLayoutResolver(presentation, 'broken-grid')}
            email={visibleEmail}
            phone={visiblePhone}
            locationLabel={visibleLocation}
            links={visibleLinks}
            heroImageUrl={contactPhotoUrl}
            heroImageAlt={heroImageAlt ?? ''}
            sectionTitle={sectionTitle}
            contentGutter={contentGutter}
            colorMode={globalColorMode}
          />
        </div>
      </section>
    );
  }

  if (presentation.cardDesign === 'numbered-narrative') {
    return (
      <section
        id="contact"
        style={contactSectionStyle}
        className={`relative ${topSpacingClass} ${bottomSpacingClass}`}
      >
        {contactBackgroundLayer}
        <div className="relative z-[1]">
          <ContactDesignNumberedNarrative
            layout={createContactDesignLayoutResolver(presentation, 'numbered-narrative')}
            creatorId={creatorId}
            email={visibleEmail}
            phone={visiblePhone}
            locationLabel={visibleLocation}
            links={visibleLinks}
            heroImageUrl={contactPhotoUrl}
            heroImageAlt={heroImageAlt ?? ''}
            sectionTitle={sectionTitle}
            presentation={presentation}
            contentGutter={contentGutter}
            colorMode={globalColorMode}
          />
        </div>
      </section>
    );
  }

  if (presentation.cardDesign === 'magnetic-overlap') {
    return (
      <section
        id="contact"
        style={contactSectionStyle}
        className={`relative ${topSpacingClass} ${bottomSpacingClass}`}
      >
        {contactBackgroundLayer}
        <div className="relative z-[1]">
          <ContactDesignMagneticOverlap
            layout={createContactDesignLayoutResolver(presentation, 'magnetic-overlap')}
            email={visibleEmail}
            phone={visiblePhone}
            links={visibleLinks}
            heroImageUrl={contactPhotoUrl}
            heroImageAlt={heroImageAlt ?? ''}
            sectionTitle={sectionTitle}
            contentGutter={contentGutter}
            colorMode={globalColorMode}
          />
        </div>
      </section>
    );
  }

  if (isInquiry) {
    const inquiryTitleClass =
      titleTypographyClass ??
      'text-[calc(1.875rem*var(--pf-contact-font-scale,1))] font-bold tracking-[-0.03em] text-[color:var(--contact-ink,#0a0a0a)] sm:text-[calc(2.25rem*var(--pf-contact-font-scale,1))] lg:text-[calc(2.75rem*var(--pf-contact-font-scale,1))]';
    const inquirySubtitleClass =
      subtitleTypographyClass ??
      'mt-4 max-w-md text-base leading-relaxed text-[color:var(--contact-muted,#737373)] sm:text-lg';

    const inquiryBody = (
      <div className="relative z-[1] w-full" style={chromeVars}>
        <div className="grid w-full items-stretch gap-10 lg:grid-cols-2 lg:gap-12 xl:gap-16">
          <div className="flex min-h-full min-w-0 flex-col items-center justify-center text-center">
            <p
              className="text-xs font-bold uppercase tracking-[0.2em]"
              style={{ color: 'var(--contact-accent, #ea580c)' }}
            >
              {t('Contact')}
            </p>
            <h2 className={`mt-3 ${inquiryTitleClass}`} style={titleTypographyStyle}>
              {resolvedTitle}
            </h2>
            <div className={`${inquirySubtitleClass} mx-auto`} style={subtitleTypographyStyle}>
              {resolvedSubtitle}
            </div>
            <ContactInquiryIllustration className="mt-8 sm:mt-10" />
          </div>

          <div className="flex min-h-full min-w-0 w-full flex-col">
            <PortfolioMotionItem profile={motionProfile} index={0} className="flex min-h-0 flex-1 flex-col">
              <div
                className={`${contactInquiryFormCardClass(presentation)} flex h-full min-h-full w-full flex-1 flex-col`}
                style={contactFormFrameStyle(presentation)}
              >
                {contactFormNode}
              </div>
            </PortfolioMotionItem>
            {presentation.showCta ? (
              <div className="mt-5 flex justify-center">
                <PortfolioMotionItem profile={motionProfile} index={1}>
                  <a
                    href={ctaHref}
                    {...(ctaHref.startsWith('http') || ctaHref.startsWith('mailto')
                      ? { target: '_blank', rel: 'noreferrer' }
                      : {})}
                    className={`${contactCtaClassName(presentation.ctaDesign)} ${ctaTextClass}`.trim()}
                    style={ctaTextStyle}
                  >
                    {resolvedCtaLabel}
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                </PortfolioMotionItem>
              </div>
            ) : null}
            {membersOnlyNode ? <div className="mt-4">{membersOnlyNode}</div> : null}
          </div>
        </div>
      </div>
    );

    return (
      <section
        id="contact"
        style={contactSectionStyle}
        className={`relative isolate ${portfolioNavTopScrollMarginClass()} ${topSpacingClass} ${bottomSpacingClass}`}
      >
        {bgStyle ? (
          <>
            {(presentation.sectionBackgroundOpacity ?? 100) >= 100 ? (
              <div
                aria-hidden
                className="pointer-events-none absolute top-0 left-1/2 z-0 w-screen -translate-x-1/2 -bottom-16 bg-white sm:-bottom-20"
              />
            ) : null}
            <div
              aria-hidden
              className="pointer-events-none absolute top-0 left-1/2 z-0 w-screen -translate-x-1/2 -bottom-16 sm:-bottom-20"
              style={bgStyle}
            />
          </>
        ) : null}
        {withContactIllustration(inquiryBody)}
      </section>
    );
  }

  if (isInquiryPanel) {
    const fallbackTitle =
      typeof resolvedTitle === 'string' ? resolvedTitle : t('Contact us');
    const fallbackSupporting =
      typeof sectionSubtitle === 'string'
        ? sectionSubtitle
        : t('Share a short brief about your goals. I will get back to you with next steps.');
    const inquiryHeadline = resolveContactInquiryHeadline(presentation, fallbackTitle);
    const inquirySupporting = resolveContactInquirySupporting(
      presentation,
      fallbackSupporting
    );
    const inquiryTitleClass =
      titleTypographyClass ??
      'text-[calc(1.875rem*var(--pf-contact-font-scale,1))] font-semibold tracking-[-0.03em] text-[color:var(--contact-ink,#0a0a0a)] sm:text-[calc(2.25rem*var(--pf-contact-font-scale,1))] lg:text-[calc(2.65rem*var(--pf-contact-font-scale,1))] lg:leading-[1.15]';
    const inquirySubtitleClass =
      subtitleTypographyClass ??
      'mt-4 max-w-md text-base leading-relaxed text-[color:var(--contact-muted,#737373)] sm:text-[1.05rem]';

    const inquiryPanelChannels: Array<{
      key: string;
      href: string;
      value: string;
      kind: 'email' | 'phone' | 'location';
      external?: boolean;
    }> = [];
    if (visibleEmail?.trim()) {
      inquiryPanelChannels.push({
        key: 'email',
        href: `mailto:${visibleEmail.trim()}`,
        value: visibleEmail.trim(),
        kind: 'email',
      });
    }
    if (visiblePhone?.trim()) {
      inquiryPanelChannels.push({
        key: 'phone',
        href: `tel:${visiblePhone.replace(/\s+/g, '')}`,
        value: formatPhoneDisplay(visiblePhone.trim()),
        kind: 'phone',
      });
    }
    if (visibleLocation?.trim()) {
      inquiryPanelChannels.push({
        key: 'location',
        href: `https://maps.google.com/?q=${encodeURIComponent(visibleLocation.trim())}`,
        value: visibleLocation.trim(),
        kind: 'location',
        external: true,
      });
    }

    const inquiryPanelBody = (
      <div className="relative z-[1] w-full" style={chromeVars}>
        <div className="grid w-full items-start gap-10 lg:grid-cols-2 lg:gap-12 xl:gap-16">
          <div className="flex min-w-0 flex-col">
            <p
              className="text-xs font-semibold uppercase tracking-[0.2em]"
              style={{ color: 'var(--contact-accent, #ea580c)' }}
            >
              {t('Contact')}
            </p>
            <h2 className={`mt-3 ${inquiryTitleClass}`} style={titleTypographyStyle}>
              {inquiryHeadline}
            </h2>
            <p className={inquirySubtitleClass} style={subtitleTypographyStyle}>
              {inquirySupporting}
            </p>

            {inquiryPanelChannels.length > 0 ? (
              <div className="mt-8 flex w-full max-w-lg flex-col gap-3">
                {inquiryPanelChannels.map((channel) => (
                  <a
                    key={channel.key}
                    href={channel.href}
                    {...(channel.external ? { target: '_blank', rel: 'noreferrer' } : {})}
                    className={contactInquiryChannelCardClass()}
                  >
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center bg-transparent"
                      style={{
                        color: 'var(--contact-accent, #ea580c)',
                      }}
                    >
                      <ContactChannelGlyph kind={channel.kind} className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 truncate text-[0.95rem] font-semibold leading-snug text-[color:var(--contact-ink,#0a0a0a)] sm:text-base">
                      {channel.value}
                    </span>
                  </a>
                ))}
              </div>
            ) : null}

            {visibleLinks.length > 0 ? (
              <nav
                className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3"
                aria-label={t('Social links')}
              >
                {visibleLinks.map((link, index) => {
                  const platform = inferContactLinkPlatform(link);
                  const iconNode = platform ? (
                    renderSocialIcon?.(platform, 'h-5 w-5 sm:h-6 sm:w-6') ?? (
                      <SocialPlatformIcon platform={platform} className="h-5 w-5 sm:h-6 sm:w-6" />
                    )
                  ) : (
                    <svg
                      className="h-5 w-5 sm:h-6 sm:w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.8}
                      aria-hidden
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                      />
                    </svg>
                  );
                  return (
                    <Fragment key={link.id}>
                      {index > 0 ? (
                        <span
                          aria-hidden
                          className="hidden h-5 w-px bg-[color:var(--contact-border,#e5e5e5)] sm:block"
                        />
                      ) : null}
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2.5 text-base font-semibold text-[color:var(--contact-ink,#0a0a0a)] transition hover:text-[color:var(--contact-accent,#ea580c)] sm:text-lg"
                      >
                        <span
                          className="inline-flex items-center justify-center"
                          style={{ color: 'var(--contact-accent, #ea580c)' }}
                        >
                          {iconNode}
                        </span>
                        {contactSocialNetworkLabel(link)}
                      </a>
                    </Fragment>
                  );
                })}
              </nav>
            ) : null}
          </div>

          <div className="relative min-w-0 w-full">
            <PortfolioMotionItem profile={motionProfile} index={0}>
              <div className="relative isolate">
                <div className={contactInquiryAccentBlockClass(presentation)} aria-hidden />
                <div
                  className={`${contactInquiryFormCardClass(presentation)} relative z-[1] flex h-full w-full flex-col`}
                  style={contactFormFrameStyle(presentation)}
                >
                  {contactFormNode}
                </div>
              </div>
            </PortfolioMotionItem>
            {membersOnlyNode ? <div className="relative z-[1] mt-4">{membersOnlyNode}</div> : null}
          </div>
        </div>
      </div>
    );

    return (
      <section
        id="contact"
        style={contactSectionStyle}
        className={`relative isolate ${portfolioNavTopScrollMarginClass()} ${topSpacingClass} ${bottomSpacingClass}`}
      >
        {bgStyle ? (
          <>
            {(presentation.sectionBackgroundOpacity ?? 100) >= 100 ? (
              <div
                aria-hidden
                className="pointer-events-none absolute top-0 left-1/2 z-0 w-screen -translate-x-1/2 -bottom-16 bg-white sm:-bottom-20"
              />
            ) : null}
            <div
              aria-hidden
              className="pointer-events-none absolute top-0 left-1/2 z-0 w-screen -translate-x-1/2 -bottom-16 sm:-bottom-20"
              style={bgStyle}
            />
          </>
        ) : null}
        {withContactIllustration(inquiryPanelBody)}
      </section>
    );
  }

  if (isDesk) {
    const deskChannels: {
      key: string;
      label: string;
      value: string;
      href?: string;
      kind: 'email' | 'phone' | 'location';
    }[] = [];
    if (visibleLocation?.trim()) {
      deskChannels.push({
        key: 'location',
        label: t('Location'),
        value: visibleLocation.trim(),
        kind: 'location',
      });
    }
    if (visiblePhone?.trim()) {
      deskChannels.push({
        key: 'phone',
        label: t('Phone'),
        value: formatPhoneDisplay(visiblePhone.trim()),
        href: `tel:${visiblePhone.replace(/\s+/g, '')}`,
        kind: 'phone',
      });
    }
    if (visibleEmail?.trim()) {
      deskChannels.push({
        key: 'email',
        label: t('Email'),
        value: visibleEmail.trim(),
        href: `mailto:${visibleEmail.trim()}`,
        kind: 'email',
      });
    }

    const deskChannelGrid =
      deskChannels.length >= 3
        ? 'grid gap-3 sm:grid-cols-2 lg:grid-cols-3'
        : deskChannels.length === 2
          ? 'grid gap-3 sm:grid-cols-2'
          : 'grid gap-3 sm:grid-cols-1 max-w-xl';

    const deskHeader = <div className="relative z-[1] w-full">{renderContactHeader()}</div>;

    const deskBody = (
      <div className="relative z-[1] w-full" style={chromeVars}>
        <div
          className={`w-full ${contactDeskMaxWidthClass(presentation.cardMaxWidth)} ${contactCardPlacementClass(
            presentation.cardPlacement
          )}`}
        >
          {deskHeader}
          {deskChannels.length > 0 ? (
            <div className={`${deskChannelGrid} mb-4 sm:mb-5`}>
              {deskChannels.map((channel) => {
                const inner = (
                  <>
                    <span
                      className={contactIconShellClass(presentation)}
                      style={{
                        ...contactIconShellStyle(presentation),
                        ...(presentation.iconBorder !== 'none'
                          ? {
                              borderColor:
                                presentation.iconBorderColor ||
                                presentation.cardBorderColor ||
                                'color-mix(in srgb, var(--contact-border, #a3a3a3) 55%, transparent)',
                            }
                          : null),
                      }}
                    >
                      <ContactChannelGlyph
                        kind={channel.kind}
                        className={contactIconGlyphClass(presentation.iconSize ?? 'sm')}
                      />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--contact-muted,#737373)]">
                        {t(channel.label)}
                      </span>
                      <span className="mt-1 block truncate text-sm font-semibold text-[color:var(--contact-ink,#0a0a0a)] sm:text-[0.95rem]">
                        {channel.value}
                      </span>
                    </span>
                  </>
                );
                return channel.href ? (
                  <a
                    key={channel.key}
                    href={channel.href}
                    className={`${contactDeskChannelCardClass()} transition hover:border-[color:var(--contact-accent,#ea580c)]`}
                  >
                    {inner}
                  </a>
                ) : (
                  <div key={channel.key} className={contactDeskChannelCardClass()}>
                    {inner}
                  </div>
                );
              })}
            </div>
          ) : null}

          <PortfolioMotionItem profile={motionProfile} index={0}>
            <div
              className={`${contactDeskFormPanelClass(presentation)} flex w-full flex-col`}
              style={contactFormFrameStyle(presentation)}
            >
              {contactFormNode}
            </div>
          </PortfolioMotionItem>
          {membersOnlyNode ? <div className="mt-4">{membersOnlyNode}</div> : null}
        </div>
      </div>
    );

    return (
      <section
        id="contact"
        style={contactSectionStyle}
        className={`relative isolate ${portfolioNavTopScrollMarginClass()} ${topSpacingClass} ${bottomSpacingClass}`}
      >
        {bgStyle ? (
          <>
            {(presentation.sectionBackgroundOpacity ?? 100) >= 100 ? (
              <div
                aria-hidden
                className="pointer-events-none absolute top-0 left-1/2 z-0 w-screen -translate-x-1/2 -bottom-16 bg-white sm:-bottom-20"
              />
            ) : null}
            <div
              aria-hidden
              className="pointer-events-none absolute top-0 left-1/2 z-0 w-screen -translate-x-1/2 -bottom-16 sm:-bottom-20"
              style={bgStyle}
            />
          </>
        ) : null}
        {withContactIllustration(deskBody)}
      </section>
    );
  }

  if (isInfoPanel) {
    const fallbackHeadline =
      typeof resolvedTitle === 'string' ? resolvedTitle : t('Contact Information');
    const fallbackSupporting =
      typeof sectionSubtitle === 'string'
        ? sectionSubtitle
        : t('Reach out with a short brief — I typically reply within one business day.');
    const infoHeadline = resolveContactInfoPanelHeadline(presentation, fallbackHeadline);
    const infoSupporting = resolveContactInfoPanelSupporting(
      presentation,
      fallbackSupporting
    );
    const infoTitleClass =
      titleTypographyClass ??
      'text-[calc(1.5rem*var(--pf-contact-font-scale,1))] font-bold tracking-[-0.03em] text-[color:var(--contact-ink,#0a0a0a)] sm:text-[calc(1.875rem*var(--pf-contact-font-scale,1))] lg:text-[calc(2rem*var(--pf-contact-font-scale,1))]';
    const infoSubtitleClass =
      subtitleTypographyClass ??
      'mt-3 max-w-md text-sm leading-relaxed text-[color:var(--contact-muted,#737373)] sm:text-base';

    const infoChannels: {
      key: string;
      value: string;
      href?: string;
      kind: 'email' | 'phone' | 'location';
    }[] = [];
    if (visibleLocation?.trim()) {
      infoChannels.push({
        key: 'location',
        value: visibleLocation.trim(),
        kind: 'location',
      });
    }
    if (visiblePhone?.trim()) {
      infoChannels.push({
        key: 'phone',
        value: formatPhoneDisplay(visiblePhone.trim()),
        href: `tel:${visiblePhone.replace(/\s+/g, '')}`,
        kind: 'phone',
      });
    }
    if (visibleEmail?.trim()) {
      infoChannels.push({
        key: 'email',
        value: visibleEmail.trim(),
        href: `mailto:${visibleEmail.trim()}`,
        kind: 'email',
      });
    }

    const infoPanelBody = (
      <div className="relative z-[1] w-full" style={chromeVars}>
        <div
          className={`w-full ${contactDeskMaxWidthClass(presentation.cardMaxWidth)} ${contactCardPlacementClass(
            presentation.cardPlacement
          )}`}
        >
          <PortfolioMotionItem profile={motionProfile} index={0}>
            <div
              className={contactInfoPanelShellClass(presentation)}
              style={contactInfoPanelShellStyle(presentation)}
            >
              <div className="grid items-stretch gap-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.18fr)] lg:gap-12">
                <div className="flex min-w-0 flex-col justify-center py-2 lg:py-4 lg:pr-2">
                  <h2 className={infoTitleClass} style={titleTypographyStyle}>
                    {infoHeadline}
                  </h2>
                  <p className={infoSubtitleClass} style={subtitleTypographyStyle}>
                    {infoSupporting}
                  </p>

                  {infoChannels.length > 0 ? (
                    <ul className="mt-9 flex flex-col gap-5">
                      {infoChannels.map((channel) => {
                        const row = (
                          <>
                            <span
                              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white"
                              style={{
                                backgroundColor: 'var(--contact-accent, #ea580c)',
                              }}
                            >
                              <ContactChannelGlyph kind={channel.kind} className="h-5 w-5" />
                            </span>
                            <span className="min-w-0 break-words text-[0.95rem] font-semibold leading-snug text-[color:var(--contact-ink,#0a0a0a)] sm:text-base">
                              {channel.value}
                            </span>
                          </>
                        );
                        return (
                          <li key={channel.key}>
                            {channel.href ? (
                              <a
                                href={channel.href}
                                className="flex items-center gap-4 transition hover:opacity-80"
                                data-pf-no-color-transition=""
                              >
                                {row}
                              </a>
                            ) : (
                              <div className="flex items-center gap-4">{row}</div>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  ) : null}
                </div>

                <div
                  className={contactInfoPanelFormCardClass(presentation)}
                  style={contactInfoPanelFormCardStyle(presentation)}
                >
                  {contactFormNode}
                </div>
              </div>
            </div>
          </PortfolioMotionItem>
          {membersOnlyNode ? <div className="mt-4">{membersOnlyNode}</div> : null}
        </div>
      </div>
    );

    return (
      <section
        id="contact"
        style={contactSectionStyle}
        className={`relative isolate ${portfolioNavTopScrollMarginClass()} ${topSpacingClass} ${bottomSpacingClass}`}
      >
        {bgStyle ? (
          <>
            {(presentation.sectionBackgroundOpacity ?? 100) >= 100 ? (
              <div
                aria-hidden
                className="pointer-events-none absolute top-0 left-1/2 z-0 w-screen -translate-x-1/2 -bottom-16 bg-white sm:-bottom-20"
              />
            ) : null}
            <div
              aria-hidden
              className="pointer-events-none absolute top-0 left-1/2 z-0 w-screen -translate-x-1/2 -bottom-16 sm:-bottom-20"
              style={bgStyle}
            />
          </>
        ) : null}
        {withContactIllustration(infoPanelBody)}
      </section>
    );
  }

  if (isChannelCards) {
    const hubTitleClass =
      titleTypographyClass ??
      'text-[calc(1.875rem*var(--pf-contact-font-scale,1))] font-bold tracking-[-0.03em] text-[color:var(--contact-ink,#0a0a0a)] sm:text-[calc(2.25rem*var(--pf-contact-font-scale,1))] lg:text-[calc(2.65rem*var(--pf-contact-font-scale,1))]';
    const hubSubtitleClass =
      subtitleTypographyClass ??
      'mt-3 max-w-xl text-base leading-relaxed text-[color:var(--contact-muted,#737373)] sm:text-lg';

    const hubChannels: Array<{
      key: string;
      href: string;
      kind: 'phone' | 'email' | 'location';
      title: string;
      lines: string[];
      external?: boolean;
    }> = [];
    if (visiblePhone?.trim()) {
      hubChannels.push({
        key: 'phone',
        href: `tel:${visiblePhone.replace(/\s+/g, '')}`,
        kind: 'phone',
        title: t('Phone'),
        lines: [formatPhoneDisplay(visiblePhone.trim())],
      });
    }
    if (visibleEmail?.trim()) {
      hubChannels.push({
        key: 'email',
        href: `mailto:${visibleEmail.trim()}`,
        kind: 'email',
        title: t('Email'),
        lines: [visibleEmail.trim()],
      });
    }
    if (visibleLocation?.trim()) {
      const parts = visibleLocation
        .split(/[\n,]/)
        .map((part) => part.trim())
        .filter(Boolean);
      hubChannels.push({
        key: 'location',
        href: `https://maps.google.com/?q=${encodeURIComponent(visibleLocation.trim())}`,
        kind: 'location',
        title: t('Address'),
        lines: [parts.length >= 2 ? parts.join(' / ') : visibleLocation.trim()],
        external: true,
      });
    }

    const channelCardsBody = (
      <div className="relative z-[1] w-full" style={chromeVars}>
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center text-center">
          <p
            className="text-sm font-bold uppercase tracking-[0.2em] sm:text-[0.9375rem]"
            style={{ color: 'var(--contact-accent, #ea580c)' }}
          >
            {t('Contact')}
          </p>
          <h2 className={`mt-3 ${hubTitleClass}`} style={titleTypographyStyle}>
            {resolvedTitle}
          </h2>
          <div className={`${hubSubtitleClass} mx-auto`} style={subtitleTypographyStyle}>
            {resolvedSubtitle}
          </div>

          {hubChannels.length > 0 ? (
            <div
              className={`mt-10 grid w-full gap-5 sm:mt-12 sm:gap-6 ${
                hubChannels.length === 1
                  ? 'max-w-md'
                  : hubChannels.length === 2
                    ? 'max-w-3xl sm:grid-cols-2'
                    : 'sm:grid-cols-2 lg:grid-cols-3'
              }`}
            >
              {hubChannels.map((channel, index) => (
                <PortfolioMotionItem key={channel.key} profile={motionProfile} index={index}>
                  <a
                    href={channel.href}
                    {...(channel.external ? { target: '_blank', rel: 'noreferrer' } : {})}
                    className={contactChannelCardsCardClass(presentation)}
                    style={{ ...contactChannelCardsCardStyle(presentation), ...cardsStyleCss(presentation.cardsStyle) }}
                  >
                    <span className={contactChannelCardsIconClass()}>
                      <ContactChannelGlyph kind={channel.kind} className="h-7 w-7" />
                    </span>
                    <p className="mt-5 text-lg font-semibold text-[color:var(--contact-ink,#0a0a0a)]">
                      {t(channel.title)}
                    </p>
                    <div className="mt-2 space-y-0.5 text-sm leading-relaxed text-[color:var(--contact-muted,#737373)]">
                      {channel.lines.map((line) => (
                        <p key={line} className="break-words">
                          {line}
                        </p>
                      ))}
                    </div>
                  </a>
                </PortfolioMotionItem>
              ))}
            </div>
          ) : null}

          {showContactForm ? (
            <div className="mt-10 w-full max-w-3xl sm:mt-12">
              <ContactFormShell presentation={presentation}>{contactFormNode}</ContactFormShell>
            </div>
          ) : null}

          {presentation.showCta ? (
            <div className="mt-8 flex justify-center">
              <PortfolioMotionItem profile={motionProfile} index={hubChannels.length + 1}>
                <a
                  href={ctaHref}
                  {...(ctaHref.startsWith('http') || ctaHref.startsWith('mailto')
                    ? { target: '_blank', rel: 'noreferrer' }
                    : {})}
                  className={`${contactCtaClassName(presentation.ctaDesign)} ${ctaTextClass}`.trim()}
                  style={ctaTextStyle}
                >
                  {resolvedCtaLabel}
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </PortfolioMotionItem>
            </div>
          ) : null}
          {membersOnlyNode ? <div className="mt-4">{membersOnlyNode}</div> : null}
        </div>
      </div>
    );

    return (
      <section
        id="contact"
        style={contactSectionStyle}
        className={`relative isolate ${portfolioNavTopScrollMarginClass()} ${topSpacingClass} ${bottomSpacingClass}`}
      >
        {bgStyle ? (
          <>
            {(presentation.sectionBackgroundOpacity ?? 100) >= 100 ? (
              <div
                aria-hidden
                className="pointer-events-none absolute top-0 left-1/2 z-0 w-screen -translate-x-1/2 -bottom-16 bg-white sm:-bottom-20"
              />
            ) : null}
            <div
              aria-hidden
              className="pointer-events-none absolute top-0 left-1/2 z-0 w-screen -translate-x-1/2 -bottom-16 sm:-bottom-20"
              style={bgStyle}
            />
          </>
        ) : null}
        {withContactIllustration(channelCardsBody)}
      </section>
    );
  }

  // Swiss editorial — ivory frame, serif headline + form, contact band, follow footer.
  if (isSwissEditorial) {
    const swissTitle =
      typeof resolvedTitle === 'string' && resolvedTitle.trim()
        ? resolvedTitle.trim()
        : DEFAULT_CONTACT_SWISS_TITLE;
    const swissSubtitle =
      typeof sectionSubtitle === 'string' && sectionSubtitle.trim()
        ? sectionSubtitle.trim()
        : DEFAULT_CONTACT_SWISS_SUBTITLE;
    const swissAccent = presentation.ctaColor?.trim() || DEFAULT_CONTACT_SWISS_COBALT;

    const swissChannels: Array<{
      key: string;
      label: string;
      value: string;
      href: string | null;
    }> = [];
    if (visibleEmail?.trim()) {
      swissChannels.push({
        key: 'email',
        label: 'EMAIL',
        value: visibleEmail.trim(),
        href: `mailto:${visibleEmail.trim()}`,
      });
    }
    if (visiblePhone?.trim()) {
      swissChannels.push({
        key: 'phone',
        label: 'PHONE',
        value: formatPhoneDisplay(visiblePhone.trim()),
        href: `tel:${visiblePhone.replace(/\s+/g, '')}`,
      });
    }
    if (visibleLocation?.trim()) {
      swissChannels.push({
        key: 'location',
        label: 'LOCATION',
        value: visibleLocation.trim(),
        href: `https://maps.google.com/?q=${encodeURIComponent(visibleLocation.trim())}`,
      });
    }

    const swissSocials = visibleLinks.map((link) => ({
      id: link.id,
      label: contactSocialNetworkLabel(link),
      url: link.url,
    }));

    const swissForm = (
      <ContactMessageForm
        creatorId={creatorId ?? ''}
        presentation={{ ...presentation, formDesign: 'swiss-editorial' }}
        formDesign="swiss-editorial"
        channelsMeta={formChannelsMeta}
      />
    );

    const swissBody = (
      <div className="relative z-[1] w-full">
        <div
          className={contactSwissEditorialFrameClass()}
          style={contactSwissEditorialFrameStyle({
            ctaColor: swissAccent,
            cardBackgroundEnabled: false,
            titleColor: presentation.titleColor,
            subtitleColor: presentation.subtitleColor,
            cardBorderColor: presentation.cardBorderColor,
          })}
        >
          <div className="grid gap-10 py-8 sm:py-10 md:grid-cols-2 md:items-stretch md:gap-10 md:py-12 xl:gap-14">
            <div className="flex min-w-0 gap-6 sm:gap-8 md:h-full">
              <span
                className="w-0.5 shrink-0 self-stretch min-h-[4.5rem] md:min-h-0"
                style={{ backgroundColor: 'var(--contact-swiss-accent, #1E4FD6)' }}
                aria-hidden
              />
              <div className="flex min-w-0 flex-1 flex-col justify-center py-1 pl-1 sm:pl-2 md:py-0">
                <p className="text-[14px] font-bold uppercase tracking-[0.16em] text-[color:var(--contact-ink,#0a0a0a)]">
                  {t('CONTACT')}
                </p>
                <h2
                  className="mt-4 text-[66px] font-normal leading-[1.05] tracking-[-0.03em] text-[color:var(--contact-ink,#0a0a0a)] md:mt-5 md:text-[110px] md:leading-[1.02]"
                  style={{ fontFamily: SERIF }}
                >
                  {swissTitle}
                </h2>
                <p className="mt-4 max-w-[520px] text-[18px] leading-relaxed text-[color:var(--contact-muted,#737373)] md:mt-5">
                  {swissSubtitle}
                </p>
              </div>
            </div>

            <div className="min-w-0 w-full">{swissForm}</div>
          </div>

          {swissChannels.length > 0 ? (
            <div className="border-t border-[color:var(--contact-border,#e5e5e5)] px-5 sm:px-8 lg:px-10">
              <div className="flex flex-col gap-6 py-6 md:grid md:grid-cols-3 md:gap-0 md:divide-x md:divide-[color:var(--contact-border,#e5e5e5)] md:py-0">
                {swissChannels.map((channel) => {
                  const valueNode = (
                    <span
                      className="mt-2 block break-words text-[19px] font-semibold leading-snug text-[color:var(--contact-ink,#0a0a0a)] underline decoration-[color:var(--contact-border,#d4d4d4)] underline-offset-4"
                      style={{ fontFamily: SERIF }}
                    >
                      {channel.value}
                    </span>
                  );
                  return (
                    <div key={channel.key} className="min-w-0 md:px-6 md:py-7 first:md:pl-0 last:md:pr-0">
                      <p className="text-[14px] font-bold uppercase tracking-[0.16em] text-[color:var(--contact-muted,#737373)]">
                        {t(channel.label)}
                      </p>
                      {channel.href ? (
                        <a
                          href={channel.href}
                          {...(channel.key === 'location'
                            ? { target: '_blank', rel: 'noreferrer' }
                            : {})}
                          className="transition hover:opacity-70"
                          data-pf-no-color-transition=""
                        >
                          {valueNode}
                        </a>
                      ) : (
                        valueNode
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

          <div className="border-t border-[color:var(--contact-border,#e5e5e5)] px-5 sm:px-8 lg:px-10">
            <div className="hidden py-6 md:grid md:grid-cols-3 md:items-center md:gap-6">
              <p className="text-[14px] font-bold uppercase tracking-[0.16em] text-[color:var(--contact-ink,#0a0a0a)]">
                {t('FOLLOW ME')}
              </p>
              {swissSocials.length > 0 ? (
                <nav
                  className="flex flex-wrap items-center justify-center gap-x-1 gap-y-2 text-[19px] font-semibold text-[color:var(--contact-ink,#0a0a0a)]"
                  aria-label={t('Social links')}
                >
                  {swissSocials.map((link, index) => (
                    <Fragment key={link.id}>
                      {index > 0 ? (
                        <span className="px-1.5 text-[color:var(--contact-muted,#a3a3a3)]">/</span>
                      ) : null}
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="underline decoration-[color:var(--contact-border,#d4d4d4)] underline-offset-4 transition hover:opacity-70"
                        data-pf-no-color-transition=""
                      >
                        {t(link.label)}
                      </a>
                    </Fragment>
                  ))}
                </nav>
              ) : (
                <span className="text-center text-[19px] font-semibold text-[color:var(--contact-muted,#a3a3a3)]">—</span>
              )}
              <p className="text-right text-[14px] font-bold uppercase tracking-[0.16em] text-[color:var(--contact-ink,#0a0a0a)]">
                {DEFAULT_CONTACT_SWISS_AVAILABILITY}
              </p>
            </div>

            <div className="flex flex-col items-center gap-3 py-5 text-center md:hidden">
              <p className="text-[14px] font-bold uppercase tracking-[0.16em] text-[color:var(--contact-ink,#0a0a0a)]">
                {t('FOLLOW ME')}
              </p>
              {swissSocials.length > 0 ? (
                <nav
                  className="flex flex-wrap items-center justify-center gap-x-1 gap-y-2 text-[19px] font-semibold text-[color:var(--contact-ink,#0a0a0a)]"
                  aria-label={t('Social links')}
                >
                  {swissSocials.map((link, index) => (
                    <Fragment key={link.id}>
                      {index > 0 ? (
                        <span className="px-1.5 text-[color:var(--contact-muted,#a3a3a3)]">/</span>
                      ) : null}
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="underline decoration-[color:var(--contact-border,#d4d4d4)] underline-offset-4 transition hover:opacity-70"
                        data-pf-no-color-transition=""
                      >
                        {t(link.label)}
                      </a>
                    </Fragment>
                  ))}
                </nav>
              ) : null}
            </div>
            <div className="border-t border-[color:var(--contact-border,#e5e5e5)] py-4 text-center md:hidden">
              <p className="text-[14px] font-bold uppercase tracking-[0.16em] text-[color:var(--contact-ink,#0a0a0a)]">
                {DEFAULT_CONTACT_SWISS_AVAILABILITY}
              </p>
            </div>
          </div>
        </div>
        {membersOnlyNode ? <div className="mt-6 flex justify-center">{membersOnlyNode}</div> : null}
      </div>
    );

    return (
      <section
        id="contact"
        style={contactSectionStyle}
        className={`relative isolate ${portfolioNavTopScrollMarginClass()} ${topSpacingClass} ${bottomSpacingClass}`}
      >
        {bgStyle ? (
          <>
            {(presentation.sectionBackgroundOpacity ?? 100) >= 100 ? (
              <div
                aria-hidden
                className="pointer-events-none absolute top-0 left-1/2 z-0 w-screen -translate-x-1/2 -bottom-16 bg-white sm:-bottom-20"
              />
            ) : null}
            <div
              aria-hidden
              className="pointer-events-none absolute top-0 left-1/2 z-0 w-screen -translate-x-1/2 -bottom-16 sm:-bottom-20"
              style={bgStyle}
            />
          </>
        ) : null}
        {swissBody}
      </section>
    );
  }

  // Editorial — title lives in the left column so the form aligns to the top
  // and both columns stretch to roughly equal height.
  if (presentation.cardDesign === 'editorial') {
    const editorialListCard = hasContactList ? (
      <ContactCardShell presentation={presentation}>
        <ContactUnifiedList
          presentation={presentation}
          visibleEmail={visibleEmail}
          visiblePhone={visiblePhone}
          visibleLocation={visibleLocation}
          links={visibleLinks}
          includeLinks
          renderSocialIcon={renderSocialIcon}
          socialBrandClass={socialBrandClass}
          elementStyles={elementStyles}
        />
      </ContactCardShell>
    ) : null;

    const editorialHeader = <div className="relative z-[1] w-full">{renderContactHeader()}</div>;

    const editorialBody = (
      <div className="relative z-[1] w-full" style={chromeVars}>
        <div className="grid w-full items-stretch gap-8 lg:grid-cols-2 lg:gap-10 xl:gap-12">
          <div className="flex min-w-0 flex-col">
            {editorialHeader}
            {editorialListCard}
          </div>

          <div className="flex min-h-full min-w-0 flex-col">
            {showContactForm ? (
              <PortfolioMotionItem
                profile={motionProfile}
                index={0}
                className="flex min-h-full flex-1 flex-col"
              >
                <ContactFormShell presentation={presentation}>{contactFormNode}</ContactFormShell>
              </PortfolioMotionItem>
            ) : null}
          </div>
        </div>

        {presentation.showCta ? (
          <div
            className={`mx-auto mt-10 flex max-w-3xl flex-col items-center gap-4 ${
              presentation.ctaDesign === 'full-width' ? 'w-full px-4' : ''
            }`}
          >
            <PortfolioMotionItem profile={motionProfile} index={1}>
              <a
                href={ctaHref}
                {...(ctaHref.startsWith('http') || ctaHref.startsWith('mailto')
                  ? { target: '_blank', rel: 'noreferrer' }
                  : {})}
                className={`${contactCtaClassName(presentation.ctaDesign)} ${ctaTextClass}`.trim()}
                style={ctaTextStyle}
              >
                {resolvedCtaLabel}
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </PortfolioMotionItem>
            {membersOnlyNode}
          </div>
        ) : membersOnlyNode ? (
          <div className="mt-6 flex justify-center">{membersOnlyNode}</div>
        ) : null}
      </div>
    );

    return (
      <section
        id="contact"
        style={contactSectionStyle}
        className={`relative isolate ${portfolioNavTopScrollMarginClass()} ${topSpacingClass} ${bottomSpacingClass}`}
      >
        {bgStyle ? (
          <>
            {(presentation.sectionBackgroundOpacity ?? 100) >= 100 ? (
              <div
                aria-hidden
                className="pointer-events-none absolute top-0 left-1/2 z-0 w-screen -translate-x-1/2 -bottom-16 bg-white sm:-bottom-20"
              />
            ) : null}
            <div
              aria-hidden
              className="pointer-events-none absolute top-0 left-1/2 z-0 w-screen -translate-x-1/2 -bottom-16 sm:-bottom-20"
              style={bgStyle}
            />
          </>
        ) : null}
        {withContactIllustration(editorialBody)}
      </section>
    );
  }

  // Directory — two columns: centered title + large socials left, form right.
  if (presentation.cardDesign === 'directory') {
    const directorySocials =
      visibleLinks.length > 0 ? (
        <ContactDirectorySocialIcons
          links={visibleLinks}
          presentation={presentation}
          renderSocialIcon={renderSocialIcon}
          socialBrandClass={socialBrandClass}
          enlarged
        />
      ) : null;

    const directoryHeader = <div className="relative z-[1] w-full">{renderContactHeader()}</div>;

    const directoryBody = (
      <div className="relative z-[1] w-full" style={chromeVars}>
        <div className="grid w-full items-stretch gap-8 lg:grid-cols-2 lg:gap-10 xl:gap-12">
          <div className="flex min-h-full min-w-0 flex-col items-center justify-center text-center">
            {directoryHeader}
            {directorySocials ? <div className="mt-10 w-full sm:mt-12">{directorySocials}</div> : null}
          </div>

          <div className="flex min-h-full min-w-0 flex-col">
            {showContactForm ? (
              <PortfolioMotionItem
                profile={motionProfile}
                index={0}
                className="flex min-h-full flex-1 flex-col"
              >
                <ContactFormShell presentation={presentation}>{contactFormNode}</ContactFormShell>
              </PortfolioMotionItem>
            ) : null}
          </div>
        </div>

        {presentation.showCta ? (
          <div
            className={`mx-auto mt-10 flex max-w-3xl flex-col items-center gap-4 ${
              presentation.ctaDesign === 'full-width' ? 'w-full px-4' : ''
            }`}
          >
            <PortfolioMotionItem profile={motionProfile} index={1}>
              <a
                href={ctaHref}
                {...(ctaHref.startsWith('http') || ctaHref.startsWith('mailto')
                  ? { target: '_blank', rel: 'noreferrer' }
                  : {})}
                className={`${contactCtaClassName(presentation.ctaDesign)} ${ctaTextClass}`.trim()}
                style={ctaTextStyle}
              >
                {resolvedCtaLabel}
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </PortfolioMotionItem>
            {membersOnlyNode}
          </div>
        ) : membersOnlyNode ? (
          <div className="mt-6 flex justify-center">{membersOnlyNode}</div>
        ) : null}
      </div>
    );

    return (
      <section
        id="contact"
        style={contactSectionStyle}
        className={`relative isolate ${portfolioNavTopScrollMarginClass()} ${topSpacingClass} ${bottomSpacingClass}`}
      >
        {bgStyle ? (
          <>
            {(presentation.sectionBackgroundOpacity ?? 100) >= 100 ? (
              <div
                aria-hidden
                className="pointer-events-none absolute top-0 left-1/2 z-0 w-screen -translate-x-1/2 -bottom-16 bg-white sm:-bottom-20"
              />
            ) : null}
            <div
              aria-hidden
              className="pointer-events-none absolute top-0 left-1/2 z-0 w-screen -translate-x-1/2 -bottom-16 sm:-bottom-20"
              style={bgStyle}
            />
          </>
        ) : null}
        {withContactIllustration(directoryBody)}
      </section>
    );
  }

  const contactAside =
    presentation.sectionLayout === 'aside-left' || presentation.sectionLayout === 'aside-right';
  const header = (
    <div className={`relative z-[1] ${contactAside ? 'w-full' : ''}`}>{renderContactHeader()}</div>
  );

  const contactListCard = hasContactList ? (
    <ContactCardShell presentation={presentation}>
      <ContactUnifiedList
        presentation={presentation}
        visibleEmail={visibleEmail}
        visiblePhone={visiblePhone}
        visibleLocation={visibleLocation}
        links={visibleLinks}
        includeLinks
        renderSocialIcon={renderSocialIcon}
        socialBrandClass={socialBrandClass}
        elementStyles={elementStyles}
      />
    </ContactCardShell>
  ) : null;

  const contactFormCard = showContactForm ? (
    <ContactFormShell presentation={presentation}>
      {contactFormNode}
    </ContactFormShell>
  ) : null;

  const hasListOrSocials = Boolean(contactListCard);
  const stackVertically =
    showContactForm && hasListOrSocials && contactFormPlacement === 'below';

  const contactBodyLayoutClass = stackVertically
    ? `flex flex-col ${contactFormStackGapClass(presentation.formStackGap ?? 'lg')}`
    : showContactForm && hasListOrSocials && contactFormPlacement === 'side'
      ? 'grid gap-6 lg:grid-cols-2'
      : 'flex flex-col gap-6';
  const contactBodyMaxWidth =
    showContactForm && hasListOrSocials && contactFormPlacement === 'side'
      ? 'full'
      : presentation.cardMaxWidth;

  const listBlock = contactListCard ? (
    <div className="flex w-full flex-col gap-6">{contactListCard}</div>
  ) : null;

  const body = (
    <div className="relative z-[1]">
      {(hasListOrSocials || showContactForm) && (
        <div
          className={`w-full ${contactCardMaxWidthClass(contactBodyMaxWidth)} ${contactCardPlacementClass(
            presentation.cardPlacement
          )}`}
        >
          <PortfolioMotionItem profile={motionProfile} index={0}>
            <div className={contactBodyLayoutClass}>
              {listBlock}
              {contactFormCard}
            </div>
          </PortfolioMotionItem>
        </div>
      )}

      {presentation.showCta ? (
        <div
          className={`mx-auto mt-10 flex max-w-3xl flex-col items-center gap-4 ${
            presentation.ctaDesign === 'full-width' ? 'w-full px-4' : ''
          }`}
        >
          <PortfolioMotionItem profile={motionProfile} index={hasListOrSocials || showContactForm ? 1 : 0}>
            <a
              href={ctaHref}
              {...(ctaHref.startsWith('http') || ctaHref.startsWith('mailto')
                ? { target: '_blank', rel: 'noreferrer' }
                : {})}
              className={`${contactCtaClassName(presentation.ctaDesign)} ${ctaTextClass}`.trim()}
              style={ctaTextStyle}
            >
              {resolvedCtaLabel}
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </PortfolioMotionItem>
          {membersOnlyNode}
        </div>
      ) : null}
    </div>
  );
  const illustratedBody = withContactIllustration(body);

  return (
    <section
      id="contact"
      style={contactSectionStyle}
      className={`relative isolate ${portfolioNavTopScrollMarginClass()} ${topSpacingClass} ${bottomSpacingClass}`}
    >
      {bgStyle ? (
        <>
          {(presentation.sectionBackgroundOpacity ?? 100) >= 100 ? (
            <div
              aria-hidden
              className="pointer-events-none absolute top-0 left-1/2 z-0 w-screen -translate-x-1/2 -bottom-16 bg-white sm:-bottom-20"
            />
          ) : null}
          <div
            aria-hidden
            className="pointer-events-none absolute top-0 left-1/2 z-0 w-screen -translate-x-1/2 -bottom-16 sm:-bottom-20"
            style={bgStyle}
          />
        </>
      ) : null}
      {contactAside ? (
        <div className={contactAsideLayoutClass(presentation.sectionLayout)}>
          {presentation.sectionLayout === 'aside-right' ? (
            <>
              <div className="min-w-0">{illustratedBody}</div>
              <div className="flex min-w-0 flex-col items-center justify-center self-stretch text-center">
                {header}
              </div>
            </>
          ) : (
            <>
              <div className="flex min-w-0 flex-col items-center justify-center self-stretch text-center">
                {header}
              </div>
              <div className="min-w-0">{illustratedBody}</div>
            </>
          )}
        </div>
      ) : (
        <>
          {header}
          {illustratedBody}
        </>
      )}
    </section>
  );
}
