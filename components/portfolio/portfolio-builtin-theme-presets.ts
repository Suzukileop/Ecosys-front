import {
  createDefaultPortfolioSettings,
  type PortfolioSettings,
} from '@/components/portfolio/portfolio-settings-types';
import type { PortfolioBuiltinThemeId } from '@/components/portfolio/portfolio-themes';

const NOIR_ACCENT = '#171717';
const NOIR_SOFT = '#F5F5F5';
const NOIR_MUTED = '#A3A3A3';
const NOIR_BORDER = '#E5E5E5';
const NOIR_INK = '#0A0A0A';
const NOIR_WHITE = '#FFFFFF';
const NOIR_HIGHLIGHT = '#E5E5E5';

/**
 * Build pristine settings for a builtin theme.
 * Noir forces every accent / CTA / highlight hex to black–white–gray.
 */
export function createBuiltinThemeSettings(
  themeId: PortfolioBuiltinThemeId,
  customThemes: PortfolioSettings['customThemes'] = []
): PortfolioSettings {
  const base = createDefaultPortfolioSettings();
  if (themeId === 'editorial') {
    return {
      ...base,
      themeId: 'editorial',
      customThemes,
      global: {
        ...base.global,
        contentWidth: 'full',
        contentGutter: 'medium',
      },
    };
  }

  const noir: PortfolioSettings = {
    ...base,
    themeId: 'noir',
    customThemes,
    global: {
      ...base.global,
      backgroundEnabled: true,
      backgroundColor: NOIR_WHITE,
      monochromeUi: true,
      titleTypography: {
        ...base.global.titleTypography,
        color: NOIR_INK,
        highlightColor: NOIR_HIGHLIGHT,
      },
      subtitleTypography: {
        ...base.global.subtitleTypography,
        color: NOIR_MUTED,
        highlightColor: NOIR_HIGHLIGHT,
      },
      titleChrome: {
        ...base.global.titleChrome,
        backgroundColor: NOIR_SOFT,
        borderColor: NOIR_BORDER,
      },
    },
    hero: {
      ...base.hero,
      motifColor: NOIR_BORDER,
      metaAccentColor: NOIR_ACCENT,
      heroSectionBackgroundColor: NOIR_WHITE,
      creatorNameColor: NOIR_WHITE,
      portraitFrameColor: NOIR_ACCENT,
    },
    work: {
      ...base.work,
      titleColor: NOIR_INK,
      subtitleColor: NOIR_MUTED,
      ctaColor: NOIR_ACCENT,
      cardBorderColor: NOIR_BORDER,
      cardBackgroundColor: NOIR_SOFT,
    },
    services: {
      ...base.services,
      titleColor: NOIR_INK,
      subtitleColor: NOIR_MUTED,
      cardAccentColor: NOIR_ACCENT,
      cardBorderColor: NOIR_BORDER,
      cardBackgroundColor: NOIR_WHITE,
      cardBackgroundColorB: NOIR_SOFT,
      cardBackgroundAlternation: 'uniform',
      cardDesign: 'frost',
      cardDesignTints: {
        editorial: 0,
        minimal: 0,
        compact: 0,
        glass: 0,
        frost: 0,
        accent: 0,
      },
      skillsHeader: {
        ...base.services.skillsHeader,
        titleColor: NOIR_INK,
        subtitleColor: NOIR_MUTED,
      },
      servicesHeader: {
        ...base.services.servicesHeader,
        titleColor: NOIR_INK,
        subtitleColor: NOIR_MUTED,
      },
      skillsBlock: {
        ...base.services.skillsBlock,
        cardAccentColor: NOIR_ACCENT,
        cardBorderColor: NOIR_BORDER,
        cardBackgroundColor: NOIR_WHITE,
        cardBackgroundColorB: NOIR_SOFT,
        cardBackgroundAlternation: 'uniform',
        cardDesign: 'frost',
        cardDesignTints: {
          editorial: 0,
          minimal: 0,
          compact: 0,
          glass: 0,
          frost: 0,
          accent: 0,
        },
      },
      servicesBlock: {
        ...base.services.servicesBlock,
        cardAccentColor: NOIR_ACCENT,
        cardBorderColor: NOIR_BORDER,
        cardBackgroundColor: NOIR_WHITE,
        cardBackgroundColorB: NOIR_SOFT,
        cardBackgroundAlternation: 'alternate',
        cardDesign: 'frost',
        cardDesignTints: {
          editorial: 0,
          minimal: 0,
          compact: 0,
          glass: 0,
          frost: 0,
          accent: 0,
        },
      },
    },
    about: {
      ...base.about,
      titleColor: NOIR_INK,
      subtitleColor: NOIR_MUTED,
      accentColor: NOIR_ACCENT,
      cardBorderColor: '#404040',
      cardBackgroundColor: NOIR_INK,
      cardBackgroundColorA: NOIR_INK,
      cardBackgroundColorB: '#171717',
      statsValueColor: NOIR_WHITE,
      statsLabelColor: NOIR_MUTED,
      statsIconColor: NOIR_MUTED,
      statsUseAccentForRating: false,
      sidePanelBorderColor: NOIR_BORDER,
      sidePanelBackgroundColor: NOIR_WHITE,
      whyMeBorderColor: NOIR_BORDER,
      whyMeBackgroundColor: NOIR_WHITE,
      whyMeDecorColor: NOIR_SOFT,
      whyMeDecorOpacity: 55,
      whyMeHeadingColor: NOIR_MUTED,
    },
    experience: {
      ...base.experience,
      titleColor: NOIR_INK,
      subtitleColor: NOIR_MUTED,
      accentColor: NOIR_ACCENT,
      yearsColor: NOIR_INK,
      yearsHighlightColor: NOIR_INK,
    },
    faq: {
      ...base.faq,
      titleColor: NOIR_INK,
      subtitleColor: NOIR_MUTED,
      accentColor: NOIR_ACCENT,
      numberColor: NOIR_ACCENT,
      questionColor: NOIR_INK,
      answerColor: '#525252',
      cardBorderColor: NOIR_BORDER,
      cardBackgroundColor: NOIR_WHITE,
      answerAccentBorderColor: NOIR_ACCENT,
    },
    contact: {
      ...base.contact,
      titleColor: NOIR_INK,
      subtitleColor: NOIR_MUTED,
      ctaColor: NOIR_ACCENT,
      cardBorderColor: NOIR_BORDER,
      cardBackgroundColor: NOIR_WHITE,
    },
    footer: {
      ...base.footer,
      textColor: NOIR_MUTED,
      accentColor: NOIR_ACCENT,
    },
  };

  return noir;
}
