import type { PortfolioToolsPresentationSettings } from '@/components/portfolio/portfolio-tools-settings';
import type {
  PortfolioStackPresentationSettings,
  PortfolioStackTitlePresetLegacy,
} from '@/components/portfolio/portfolio-stack-presentation';

const TOOLS_GALLERY_DEFAULTS: Pick<
  PortfolioToolsPresentationSettings,
  | 'brandDirectoryLevelStyle'
  | 'brandDirectoryColumnsPerRow'
  | 'brandDirectoryContentAlignment'
  | 'brandDirectoryFullWidth'
  | 'brandFloatGridMode'
  | 'brandFloatColumnsPerRow'
  | 'brandFloatTileDensity'
  | 'brandFloatContentAlignment'
  | 'brandFloatCardStyle'
> = {
  brandDirectoryLevelStyle: 'percentage',
  brandDirectoryColumnsPerRow: 1,
  brandDirectoryContentAlignment: 'center',
  brandDirectoryFullWidth: false,
  brandFloatGridMode: 'fluid',
  brandFloatColumnsPerRow: 3,
  brandFloatTileDensity: 'comfortable',
  brandFloatContentAlignment: 'center',
  brandFloatCardStyle: 'framed',
};

function mapStackTitlePresetToTools(
  preset: PortfolioStackTitlePresetLegacy
): PortfolioToolsPresentationSettings['titlePreset'] {
  if (preset === 'core-stack') return 'core-stack';
  if (preset === 'tech-stack') return 'tech-stack';
  if (preset === 'custom') return 'custom';
  if (preset === 'stack') return 'stack';
  if (preset === 'tools') return 'tools';
  return 'workflow-tools';
}

export type StackPresentationToToolsGalleryOverrides = Partial<
  Pick<
    PortfolioToolsPresentationSettings,
    | 'design'
    | 'levelProgressColumnsPerRow'
    | 'brandCardsColumnsPerRow'
    | 'brandRowColumnsPerRow'
  >
>;

/**
 * Adapts Stack presentation settings for shared Tools gallery renderers.
 * Stack-only fields (sectionLayout, titleSize, etc.) are omitted; Tools-only design
 * fields receive safe defaults.
 */
export function stackPresentationToToolsGallery(
  presentation: PortfolioStackPresentationSettings,
  overrides?: StackPresentationToToolsGalleryOverrides
): PortfolioToolsPresentationSettings {
  const {
    sectionLayout: _sectionLayout,
    asideTitleSticky: _asideTitleSticky,
    asideTitlePlacement: _asideTitlePlacement,
    stackTagsSize: _stackTagsSize,
    titleSize: _titleSize,
    subtitleSize: _subtitleSize,
    design,
    titlePreset,
    ...shared
  } = presentation;
  void _sectionLayout;
  void _asideTitleSticky;
  void _asideTitlePlacement;
  void _stackTagsSize;
  void _titleSize;
  void _subtitleSize;

  const galleryDesign = overrides?.design ?? design;
  if (galleryDesign === 'stack-tags') {
    throw new Error(
      'stackPresentationToToolsGallery does not support stack-tags — use EditorialStackTags instead.'
    );
  }

  return {
    ...TOOLS_GALLERY_DEFAULTS,
    ...shared,
    design: galleryDesign,
    titlePreset: mapStackTitlePresetToTools(titlePreset),
    ...(overrides ?? {}),
  };
}
