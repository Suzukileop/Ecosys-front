'use client';
import { SettingsControlSection } from './portfolio-settings-control-section';

import { useT } from '@/lib/i18n/I18nProvider';
import { HeaderSteppedSlider } from './portfolio-header-style-controls';
import { NpToggleRow } from './portfolio-nav-panel-ui';
import { Choices } from './portfolio-stack-progress-controls';
import type { PortfolioStackSectionSettings } from './portfolio-stack-settings';
import {
  PORTFOLIO_TOOLS_TILE_SIZE_OPTIONS, PORTFOLIO_TOOLS_CARD_GAP_OPTIONS,
  PORTFOLIO_TOOLS_LEVEL_TABLE_GROUP_BY_OPTIONS, PORTFOLIO_TOOLS_LEVEL_INDICATOR_CARD_STYLE_OPTIONS,
  resolveToolsLevelIndicatorFullWidth, resolveToolsLevelIndicatorShowCategoryFilter,
} from './portfolio-tools-settings';
import styles from './portfolio-stack-rail-controls.module.css';

type StarSettings = Pick<PortfolioStackSectionSettings,
  'tileSize' | 'cardGap' | 'levelTableGroupBy' | 'levelIndicatorShowCategoryFilter' |
  'levelTableShowCategoryFilter' | 'levelIndicatorCardStyle' | 'levelIndicatorFullWidth' | 'levelTableFullWidth'>;

export function StackStarControls({stack,onChange}:{stack:StarSettings;onChange:(patch:Partial<StarSettings>)=>void}) {
  const t=useT();
  const size=PORTFOLIO_TOOLS_TILE_SIZE_OPTIONS.find(option=>option.value===stack.tileSize)??PORTFOLIO_TOOLS_TILE_SIZE_OPTIONS[1];
  return <div className={styles.controls}>
    <SettingsControlSection title={t('Layout')} className={styles.settingsGroup}>
      
    <NpToggleRow title={t('Full width')} checked={resolveToolsLevelIndicatorFullWidth(stack)}
      onChange={enabled=>onChange({levelIndicatorFullWidth:enabled,levelTableFullWidth:enabled})}/>
    <Choices label={t('Card spacing')} options={PORTFOLIO_TOOLS_CARD_GAP_OPTIONS} columns={4}
      value={stack.cardGap??'medium'} onChange={cardGap=>onChange({cardGap})}
      glyph={(_,index)=><svg width="38" height="28" viewBox="0 0 38 28" fill="currentColor" aria-hidden>{[-1,0,1].map(row=><rect key={row} x="4" y={12+row*[4,7,10,12][index]} width="30" height="3" rx="1"/>)}</svg>}/>
    </SettingsControlSection>
    <SettingsControlSection title={t('Cards')} className={styles.settingsGroup}>
      
    <div className="np-text-size-slider"><HeaderSteppedSlider label={t('Card size')}
      steps={PORTFOLIO_TOOLS_TILE_SIZE_OPTIONS.map((option,index)=>({value:option.value,tick:['S','M','L','XL'][index]}))}
      value={size.value} currentName={t(size.label)} onChange={tileSize=>onChange({tileSize})}/></div>
    <Choices label={t('Card style')} options={PORTFOLIO_TOOLS_LEVEL_INDICATOR_CARD_STYLE_OPTIONS}
      value={stack.levelIndicatorCardStyle??'framed'} onChange={levelIndicatorCardStyle=>onChange({levelIndicatorCardStyle})}
      glyph={value=><svg width="62" height="32" viewBox="0 0 62 32" fill="none" aria-hidden><rect x="1" y="1" width="60" height="30" rx="4" stroke={value==='framed'?'currentColor':'none'}/><path d="M8 16h18" stroke="currentColor" strokeWidth="2"/><text x="32" y="20" fontSize="12" fill="currentColor">★★</text></svg>}/>
    </SettingsControlSection>
    <SettingsControlSection title={t('Organization')} className={styles.settingsGroup}>
      
    <Choices label={t('Row order')} options={PORTFOLIO_TOOLS_LEVEL_TABLE_GROUP_BY_OPTIONS}
      value={stack.levelTableGroupBy??'category'} onChange={levelTableGroupBy=>onChange({levelTableGroupBy})}
      glyph={value=><svg width="38" height="26" viewBox="0 0 38 26" fill="currentColor" aria-hidden>{[0,1,2].map(index=><rect key={index} x="3" y={3+index*8} width={value==='level'?32-index*8:index===0?12:28} height="3" rx="1"/>)}</svg>}/>
    <NpToggleRow title={t('Category filter')} checked={resolveToolsLevelIndicatorShowCategoryFilter(stack)}
      onChange={enabled=>onChange({levelIndicatorShowCategoryFilter:enabled,levelTableShowCategoryFilter:enabled})}/>
    </SettingsControlSection>
  </div>;
}
