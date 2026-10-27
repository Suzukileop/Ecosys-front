import type {PortfolioHeroBackgroundSettings} from './portfolio-hero-background-settings';
import {DEFAULT_SECTION_BACKGROUND,mergeSectionBackground,type PortfolioSectionBackgroundSettings} from './portfolio-section-background-settings';

/** Keep legacy Hero storage while sharing the section background controls and renderer. */
export function heroSectionBackgroundFields(hero:PortfolioHeroBackgroundSettings):PortfolioSectionBackgroundSettings{
 const result={...DEFAULT_SECTION_BACKGROUND};
 for(const key of Object.keys(result) as (keyof PortfolioSectionBackgroundSettings)[]){
  const heroKey=('hero'+key[0].toUpperCase()+key.slice(1)) as keyof PortfolioHeroBackgroundSettings;
  const value=hero[heroKey];
  if(value!==undefined)Object.assign(result,{[key]:value});
 }
 result.sectionBackgroundEnabled=hero.heroSectionBackgroundEnabled??!['none','transparent'].includes(hero.heroSectionBackgroundFill);
 if(['none','transparent'].includes(hero.heroSectionBackgroundFill))result.sectionBackgroundFill='solid';
 return mergeSectionBackground(result, {});
}

export function patchHeroSectionBackground(hero:PortfolioHeroBackgroundSettings,patch:Partial<PortfolioSectionBackgroundSettings>):Partial<PortfolioHeroBackgroundSettings>{
 const result:Partial<PortfolioHeroBackgroundSettings>={};
 for(const [key,value]of Object.entries(patch)){
  if(key==='sectionBackgroundEnabled')continue;
  Object.assign(result,{['hero'+key[0].toUpperCase()+key.slice(1)]:value});
 }
 if(patch.sectionBackgroundEnabled!==undefined){
  result.heroSectionBackgroundEnabled=patch.sectionBackgroundEnabled;
  if(patch.sectionBackgroundEnabled)result.heroSectionBackgroundFill=heroSectionBackgroundFields(hero).sectionBackgroundFill;
 }
 return result;
}
