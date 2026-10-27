'use client';
import { SettingsControlSection } from './portfolio-settings-control-section';

import { useT } from '@/lib/i18n/I18nProvider';
import { HeaderSteppedSlider } from './portfolio-header-style-controls';
import { NpToggleRow } from './portfolio-nav-panel-ui';
import { Choices } from './portfolio-stack-progress-controls';
import type { PortfolioStackSectionSettings } from './portfolio-stack-settings';
import {
  PORTFOLIO_TOOLS_TILE_SIZE_OPTIONS, PORTFOLIO_TOOLS_LEVEL_PROGRESS_ROW_GAP_OPTIONS,
  PORTFOLIO_TOOLS_LEVEL_BAR_SIZE_OPTIONS, PORTFOLIO_TOOLS_LEVEL_TABLE_GROUP_BY_OPTIONS,
  PORTFOLIO_TOOLS_CONTENT_ALIGNMENT_OPTIONS, resolveToolsLevelIndicatorFullWidth,
  resolveToolsLevelIndicatorShowCategoryFilter,
} from './portfolio-tools-settings';
import styles from './portfolio-stack-rail-controls.module.css';

type CircularSettings = Pick<PortfolioStackSectionSettings,
  'tileSize' | 'levelProgressRowGap' | 'levelBarSize' | 'levelTableGroupBy' |
  'levelIndicatorShowCategoryFilter' | 'levelTableShowCategoryFilter' | 'brandCardsColumnsPerRow' |
  'brandCardsContentAlignment' | 'levelIndicatorFullWidth' | 'levelTableFullWidth'>;

export function StackCircularControls({stack,onChange,aside}:{
  stack:CircularSettings & {design:string};onChange:(patch:Partial<CircularSettings>)=>void;aside:boolean;
}) {
  const t=useT();
  const size=PORTFOLIO_TOOLS_TILE_SIZE_OPTIONS.find(option=>option.value===stack.tileSize)??PORTFOLIO_TOOLS_TILE_SIZE_OPTIONS[1];
  const thickness=PORTFOLIO_TOOLS_LEVEL_BAR_SIZE_OPTIONS.filter(option=>option.value!=='tight');
  const current=thickness.find(option=>option.value===stack.levelBarSize)??thickness[0];
  return <div className={styles.controls}>
    <SettingsControlSection title={t('Layout')} className={styles.settingsGroup}>
      
    <NpToggleRow title={t('Full width')} checked={resolveToolsLevelIndicatorFullWidth(stack)}
      onChange={enabled=>onChange({levelIndicatorFullWidth:enabled,levelTableFullWidth:enabled})}/>
    {!aside?<Choices label={t('Columns (large screen)')} columns={3}
      options={[{value:'1',label:'1'},{value:'2',label:'2'},{value:'3',label:'3'}]}
      value={String(stack.brandCardsColumnsPerRow??3)} onChange={value=>onChange({brandCardsColumnsPerRow:value==='1'?1:value==='2'?2:3})}
      glyph={value=><svg width="48" height="24" viewBox="0 0 48 24" fill="currentColor" aria-hidden>{Array.from({length:Number(value)},(_,index)=><rect key={index} x={index*48/Number(value)} y="3" width={48/Number(value)-3} height="18" rx="2"/>)}</svg>}/>:null}
    <Choices label={t('Content alignment')} columns={3}
      options={PORTFOLIO_TOOLS_CONTENT_ALIGNMENT_OPTIONS.map(option=>({...option,label:''}))}
      value={stack.brandCardsContentAlignment??'left'} onChange={brandCardsContentAlignment=>onChange({brandCardsContentAlignment})}
      glyph={value=><svg width="23" height="20" viewBox="0 0 24 20" fill="currentColor" role="img" aria-label={t(value==='left'?'Left':value==='center'?'Center':'Right')}><rect x={value==='right'?10:value==='center'?5:0} y="2" width="14" height="2" rx="1"/><rect x="0" y="9" width="24" height="2" rx="1"/><rect x={value==='right'?13:value==='center'?6.5:0} y="16" width="11" height="2" rx="1"/></svg>}/>
    <Choices label={t('Vertical spacing')} options={PORTFOLIO_TOOLS_LEVEL_PROGRESS_ROW_GAP_OPTIONS} columns={4}
      value={stack.levelProgressRowGap??'large'} onChange={levelProgressRowGap=>onChange({levelProgressRowGap})}
      glyph={(_,index)=><svg width="32" height="32" viewBox="0 0 32 32" fill="currentColor" aria-hidden>{[-1,0,1].map(row=><rect key={row} x="3" y={14+row*[4,7,10,13][index]} width="26" height="3" rx="1"/>)}</svg>}/>
    </SettingsControlSection>
    <SettingsControlSection title={t('Rings')} className={styles.settingsGroup}>
      
    <div className="np-text-size-slider"><HeaderSteppedSlider label={t(stack.design==='level-svg-rings'?'Ring size':'Logo size')}
      steps={PORTFOLIO_TOOLS_TILE_SIZE_OPTIONS.map((option,index)=>({value:option.value,tick:['S','M','L','XL'][index]}))}
      value={size.value} currentName={t(size.label)} onChange={tileSize=>onChange({tileSize})}/></div>
    <div className="np-text-size-slider"><HeaderSteppedSlider label={t(stack.design==='level-svg-rings'?'Thickness':'Thickness & % size')}
      steps={thickness.map((option,index)=>({value:option.value,tick:['S','M','L','XL'][index]}))}
      value={current.value} currentName={t(current.label)} onChange={levelBarSize=>onChange({levelBarSize})}/></div>
    </SettingsControlSection>
    <SettingsControlSection title={t('Organization')} className={styles.settingsGroup}>
      
    <Choices label={t('Row order')} options={PORTFOLIO_TOOLS_LEVEL_TABLE_GROUP_BY_OPTIONS}
      value={stack.levelTableGroupBy??'category'} onChange={levelTableGroupBy=>onChange({levelTableGroupBy})}
      glyph={value=><svg width="40" height="26" viewBox="0 0 40 26" fill="currentColor" aria-hidden>{value==='category'?<><rect x="2" y="3" width="14" height="6" rx="2"/><rect x="7" y="13" width="30" height="2"/><rect x="7" y="20" width="23" height="2"/></>:<><rect x="3" y="3" width="32" height="3"/><rect x="3" y="11" width="24" height="3"/><rect x="3" y="19" width="14" height="3"/></>}</svg>}/>
    <NpToggleRow title={t('Category filter')} checked={resolveToolsLevelIndicatorShowCategoryFilter(stack)}
      onChange={enabled=>onChange({levelIndicatorShowCategoryFilter:enabled,levelTableShowCategoryFilter:enabled})}/>
    </SettingsControlSection>
  </div>;
}
