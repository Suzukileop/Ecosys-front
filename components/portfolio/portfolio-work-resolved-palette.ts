import { resolveActivePortfolioPalette } from './portfolio-color-mode';
import { sectionFamilyPalette } from './portfolio-section-palette-family';
import { resolveSectionActiveMode, resolveSectionBackgroundIsolation, resolveSectionContrastOverride, resolveSectionVisibleSurface } from './portfolio-section-color-mode';
import { applyHeroPaletteToWork } from './portfolio-section-palette';
import { pickWorkPresentationSettings } from './portfolio-work-settings';
import type { PortfolioSettings } from './portfolio-settings-types';
import type { PortfolioHeroPalette } from './portfolio-hero-palette-settings';

/** One resolution path for the rendered cards AND their editor colour swatches. */
export function resolveWorkReadingPresentation(work:PortfolioSettings['work'],global:PortfolioSettings['global'],palette:PortfolioHeroPalette){
 const isolated=resolveSectionBackgroundIsolation(applyHeroPaletteToWork(pickWorkPresentationSettings(work),palette),work.colorModeOverride,palette.fond);
 const baseMode=resolveSectionActiveMode(work.colorModeOverride,global.colorMode??'dark');
 const surface=resolveSectionVisibleSurface(isolated,palette.fond);
 const mode=resolveSectionActiveMode(resolveSectionContrastOverride('auto',{...isolated,sectionBackgroundEnabled:true,sectionBackgroundFill:'solid',sectionBackgroundColor:surface,sectionBackgroundOpacity:100},baseMode),baseMode);
 const readingPalette=mode===baseMode?palette:sectionFamilyPalette(work.paletteFamily,mode)??resolveActivePortfolioPalette({...global,colorMode:mode});
 return {presentation:{...applyHeroPaletteToWork(isolated,readingPalette),sectionBackgroundColor:isolated.sectionBackgroundEnabled?isolated.sectionBackgroundColor:palette.fond},palette:{...readingPalette,fond:surface},mode};
}
