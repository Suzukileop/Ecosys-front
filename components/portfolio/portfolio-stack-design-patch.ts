import {
  DEFAULT_STACK_TITLE,
  stackBrandCardsDesignDefaults,
  stackBrandIndexDesignDefaults,
  stackBrandRowDesignDefaults,
  stackLevelBentoCategoriesDesignDefaults,
  stackLevelCategoryRowsDesignDefaults,
  stackLevelCircularCardsDesignDefaults,
  stackLevelProgressRowsDesignDefaults,
  stackLevelStarCardsDesignDefaults,
  stackLevelSvgRingsDesignDefaults,
  stackLevelTableRowsDesignDefaults,
  type PortfolioStackDesign,
  type PortfolioStackSectionSettings,
} from '@/components/portfolio/portfolio-stack-settings';

/** What picking a Stack design changes: the design, plus that design's own defaults. Shared by
 *  the Stack panel and the design picker's live previews (moved here from the panel as-is). */
export function stackDesignSettingsPatch(
  stack: Pick<PortfolioStackSectionSettings, 'titlePreset'>,
  design: PortfolioStackDesign
): Partial<PortfolioStackSectionSettings> {
  const patch = stackDesignOwnDefaults(stack, design);
  // Headers now read `headerDesignAlignment`; the designs' defaults still name the legacy
  // `headerAlignment`, so carry it over or the title never follows the design's content.
  return patch.headerAlignment
    ? { ...patch, headerDesignAlignment: patch.headerAlignment }
    : patch;
}

function stackDesignOwnDefaults(
  stack: Pick<PortfolioStackSectionSettings, 'titlePreset'>,
  design: PortfolioStackDesign
): Partial<PortfolioStackSectionSettings> {
  if (design === 'brand-cards') {
    return stackBrandCardsDesignDefaults();
  }
  if (design === 'brand-index') {
    return stackBrandIndexDesignDefaults();
  }
  if (design === 'brand-row') {
    return stackBrandRowDesignDefaults();
  }
  if (design === 'level-progress-rows') {
    return stackLevelProgressRowsDesignDefaults();
  }
  if (design === 'level-category-rows') {
    return stackLevelCategoryRowsDesignDefaults();
  }
  if (design === 'level-table-rows') {
    return stackLevelTableRowsDesignDefaults();
  }
  if (design === 'level-circular-cards') {
    return stackLevelCircularCardsDesignDefaults();
  }
  if (design === 'level-star-cards') {
    return stackLevelStarCardsDesignDefaults();
  }
  if (design === 'level-svg-rings') {
    return stackLevelSvgRingsDesignDefaults();
  }
  if (design === 'level-bento-categories') {
    return stackLevelBentoCategoriesDesignDefaults();
  }
  if (design === 'stack-tags') {
    return {
      design,
      headerAlignment: 'center',
      contentAlignment: 'center',
      showDescription: false,
      showUseCases: false,
      showCategory: false,
      ...(stack.titlePreset !== 'custom'
        ? { titlePreset: 'core-stack', title: DEFAULT_STACK_TITLE }
        : {}),
    };
  }
  return { design };
}
