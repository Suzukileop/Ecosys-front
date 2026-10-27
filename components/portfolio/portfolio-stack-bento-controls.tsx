'use client';
import { SettingsControlSection } from './portfolio-settings-control-section';

import { useT } from '@/lib/i18n/I18nProvider';
import { HeaderSteppedSlider } from './portfolio-header-style-controls';
import { NpToggleRow } from './portfolio-nav-panel-ui';
import { Choices, LevelSample, TableLevelSample } from './portfolio-stack-progress-controls';
import type { PortfolioStackSectionSettings } from './portfolio-stack-settings';
import {
  PORTFOLIO_TOOLS_LEVEL_BAR_STYLE_OPTIONS, PORTFOLIO_TOOLS_LEVEL_TABLE_GROUP_BY_OPTIONS,
  PORTFOLIO_TOOLS_TILE_SIZE_OPTIONS, PORTFOLIO_TOOLS_CARD_GAP_OPTIONS,
  PORTFOLIO_TOOLS_LEVEL_PROGRESS_ROW_GAP_OPTIONS, PORTFOLIO_TOOLS_LEVEL_BAR_SIZE_OPTIONS,
  PORTFOLIO_TOOLS_LEVEL_INDICATOR_DISPLAY_STYLE_OPTIONS, PORTFOLIO_TOOLS_LEVEL_INDICATOR_CARD_STYLE_OPTIONS,
  PORTFOLIO_TOOLS_CONTENT_ALIGNMENT_OPTIONS, resolveToolsLevelIndicatorDisplayStyle,
  resolveToolsLevelIndicatorFullWidth, resolveToolsLevelIndicatorShowCategoryFilter,
} from './portfolio-tools-settings';
import styles from './portfolio-stack-rail-controls.module.css';

type BentoSettings = Pick<PortfolioStackSectionSettings,
  'tileSize' | 'cardGap' | 'levelProgressRowGap' | 'levelIndicatorDisplayStyle' | 'levelIndicatorCardStyle' |
  'levelBarSize' | 'levelBarStyle' | 'brandCardsContentAlignment' | 'levelTableGroupBy' |
  'levelIndicatorShowCategoryFilter' | 'levelTableShowCategoryFilter' | 'levelIndicatorFullWidth' | 'levelTableFullWidth'>;

export function StackBentoControls({stack,onChange}:{stack:BentoSettings;onChange:(patch:Partial<BentoSettings>)=>void}) {
  const t=useT();
  const size=PORTFOLIO_TOOLS_TILE_SIZE_OPTIONS.find(option=>option.value===stack.tileSize)??PORTFOLIO_TOOLS_TILE_SIZE_OPTIONS[1];
  return <div className={styles.controls}>
    <SettingsControlSection title={t('Layout')} className={styles.settingsGroup}>
      
    <NpToggleRow title={t('Full width')} checked={resolveToolsLevelIndicatorFullWidth(stack)} onChange={enabled=>onChange({levelIndicatorFullWidth:enabled,levelTableFullWidth:enabled})}/>
    <Choices label={t('Content alignment')} options={PORTFOLIO_TOOLS_CONTENT_ALIGNMENT_OPTIONS} columns={3}
      value={stack.brandCardsContentAlignment??'left'} onChange={brandCardsContentAlignment=>onChange({brandCardsContentAlignment})}
      glyph={value=><svg width="30" height="24" viewBox="0 0 30 24" fill="currentColor" aria-hidden>{[18,28,13].map((width,i)=><rect key={i} x={value==='center'?(30-width)/2:value==='right'?30-width:0} y={3+i*8} width={width} height="2"/>)}</svg>}/>
    <Choices label={t('Row order')} options={PORTFOLIO_TOOLS_LEVEL_TABLE_GROUP_BY_OPTIONS} value={stack.levelTableGroupBy??'category'} onChange={levelTableGroupBy=>onChange({levelTableGroupBy})} glyph={value=><svg width="38" height="26" viewBox="0 0 38 26" fill="currentColor" aria-hidden>{[0,1,2].map(i=><rect key={i} x="3" y={3+i*8} width={value==='level'?32-i*8:i===0?12:28} height="3" rx="1"/>)}</svg>}/>
    <NpToggleRow title={t('Category filter')} checked={resolveToolsLevelIndicatorShowCategoryFilter(stack)} onChange={enabled=>onChange({levelIndicatorShowCategoryFilter:enabled,levelTableShowCategoryFilter:enabled})}/>
    </SettingsControlSection>
    <SettingsControlSection title={t('Cards')} className={styles.settingsGroup}>
      
    <Choices label={t('Card frame')} options={PORTFOLIO_TOOLS_LEVEL_INDICATOR_CARD_STYLE_OPTIONS}
      value={stack.levelIndicatorCardStyle??'framed'} onChange={levelIndicatorCardStyle=>onChange({levelIndicatorCardStyle})}
      glyph={value=><svg width="56" height="32" viewBox="0 0 56 32" fill="none" style={{color:'var(--np-text)'}} aria-hidden><rect x="1" y="1" width="54" height="30" rx="3" stroke={value==='framed'?'currentColor':'none'} strokeWidth="2" fill={value==='framed'?'currentColor':'none'} fillOpacity=".12"/><path d="M9 11h25M9 21h37" stroke="currentColor" strokeWidth="3"/></svg>}/>
    <div className="np-text-size-slider"><HeaderSteppedSlider label={t('Logo size')}
      steps={PORTFOLIO_TOOLS_TILE_SIZE_OPTIONS.map((option,index)=>({value:option.value,tick:['S','M','L','XL'][index]}))}
      value={size.value} currentName={t(size.label)} onChange={tileSize=>onChange({tileSize})}/></div>
    <Choices label={t('Card spacing')} options={PORTFOLIO_TOOLS_CARD_GAP_OPTIONS} columns={4}
      value={stack.cardGap??'medium'} onChange={cardGap=>onChange({cardGap})}
      glyph={(_,index)=><svg width="42" height="28" viewBox="0 0 42 28" fill="currentColor" aria-hidden>{[-1,0,1].map(col=><rect key={col} x={18+col*[5,8,12,16][index]} y="4" width="5" height="20" rx="1"/>)}</svg>}/>
    <Choices label={t('Vertical spacing')} options={PORTFOLIO_TOOLS_LEVEL_PROGRESS_ROW_GAP_OPTIONS} columns={4}
      value={stack.levelProgressRowGap??'large'} onChange={levelProgressRowGap=>onChange({levelProgressRowGap})}
      glyph={(_,index)=><svg width="34" height="32" viewBox="0 0 34 32" fill="currentColor" aria-hidden>{[-1,0,1].map(row=><rect key={row} x="4" y={14+row*[4,7,10,13][index]} width="26" height="3" rx="1"/>)}</svg>}/>
    </SettingsControlSection>
    <SettingsControlSection title={t('Levels')} className={styles.settingsGroup}>
      
    <Choices label={t('Level display')} options={PORTFOLIO_TOOLS_LEVEL_INDICATOR_DISPLAY_STYLE_OPTIONS}
      value={resolveToolsLevelIndicatorDisplayStyle({design:'level-bento-categories',levelIndicatorDisplayStyle:stack.levelIndicatorDisplayStyle})} onChange={levelIndicatorDisplayStyle=>onChange({levelIndicatorDisplayStyle})}
      glyph={value=><TableLevelSample value={value}/>}/>
    <div className="np-text-size-slider"><HeaderSteppedSlider label={t('Level display size')}
      steps={PORTFOLIO_TOOLS_LEVEL_BAR_SIZE_OPTIONS.map((option,index)=>({value:option.value,tick:['XS','S','M','L','XL'][index]}))}
      value={stack.levelBarSize??'small'} currentName={t(PORTFOLIO_TOOLS_LEVEL_BAR_SIZE_OPTIONS.find(option=>option.value===(stack.levelBarSize??'small'))!.label)} onChange={levelBarSize=>onChange({levelBarSize})}/></div>
    {resolveToolsLevelIndicatorDisplayStyle({design:'level-bento-categories',levelIndicatorDisplayStyle:stack.levelIndicatorDisplayStyle})==='progress-bar'?<Choices label={t('Bar style')} options={PORTFOLIO_TOOLS_LEVEL_BAR_STYLE_OPTIONS} value={stack.levelBarStyle??'rectangle'} onChange={levelBarStyle=>onChange({levelBarStyle})} glyph={value=><LevelSample value={value}/>}/>:null}
    </SettingsControlSection>
  </div>;
}
