'use client';
import { ToolsControlGroups } from './portfolio-tools-control-groups';

import { useT } from '@/lib/i18n/I18nProvider';
import { HeaderSteppedSlider } from './portfolio-header-style-controls';
import { NpToggleRow } from './portfolio-nav-panel-ui';
import type { PortfolioStackSectionSettings } from './portfolio-stack-settings';
import { PORTFOLIO_TOOLS_TILE_SIZE_OPTIONS, PORTFOLIO_TOOLS_CARD_GAP_OPTIONS, PORTFOLIO_TOOLS_CONTENT_ALIGNMENT_OPTIONS, resolveToolsLevelIndicatorShowCategoryFilter } from './portfolio-tools-settings';
import styles from './portfolio-stack-rail-controls.module.css';

export function StackIndexControls({ stack, onChange }: {
  stack: PortfolioStackSectionSettings;
  onChange: (patch: Partial<PortfolioStackSectionSettings>) => void;
}) {
  const t = useT();
  const sizes = PORTFOLIO_TOOLS_TILE_SIZE_OPTIONS;
  const size = sizes.find(option => option.value === stack.tileSize) ?? sizes[1];
  return <ToolsControlGroups>
    <div className="np-text-size-slider"><HeaderSteppedSlider label={t('Logo size')}
      steps={sizes.map((option,index) => ({value:option.value,tick:['S','M','L','XL'][index]}))}
      value={size.value} currentName={t(size.label)} onChange={tileSize => onChange({tileSize})} /></div>
    <div>
      <p className={styles.label}>{t('Row spacing')}</p>
      <div className={styles.spacing} role="group" aria-label={t('Row spacing')}>
        {PORTFOLIO_TOOLS_CARD_GAP_OPTIONS.map((option,index) => <button type="button" key={option.value} className={styles.choice}
          aria-pressed={(stack.cardGap ?? 'medium') === option.value} onClick={() => onChange({cardGap:option.value})}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="currentColor" aria-hidden>
            {[-1,0,1].map(row => <rect key={row} x="3" y={14+row*[4,7,10,13][index]} width="26" height="3" rx="1"/>)}
          </svg><span>{index===3?'XL':t(option.label)}</span>
        </button>)}
      </div>
    </div>
    <div>
      <p className={styles.label}>{t('Content alignment')}</p>
      <div className={styles.alignment} role="group" aria-label={t('Content alignment')}>
        {PORTFOLIO_TOOLS_CONTENT_ALIGNMENT_OPTIONS.map(option => <button type="button" key={option.value} className={styles.choice}
          aria-label={t(option.label)} title={t(option.label)} aria-pressed={(stack.brandIndexContentAlignment ?? 'left')===option.value}
          onClick={() => onChange({brandIndexContentAlignment:option.value})}>
          <svg width="23" height="20" viewBox="0 0 24 20" fill="currentColor" aria-hidden><rect x={option.value==='right'?10:option.value==='center'?5:0} y="2" width="14" height="2" rx="1"/><rect x="0" y="9" width="24" height="2" rx="1"/><rect x={option.value==='right'?13:option.value==='center'?6.5:0} y="16" width="11" height="2" rx="1"/></svg>
        </button>)}
      </div>
    </div>
    <NpToggleRow title={t('Full width (1 per row)')} checked={stack.brandIndexFullWidth !== false}
      onChange={brandIndexFullWidth => onChange({brandIndexFullWidth})}/>
    <NpToggleRow title={t('Category filter')} checked={resolveToolsLevelIndicatorShowCategoryFilter(stack)}
      onChange={enabled => onChange({levelIndicatorShowCategoryFilter:enabled,levelTableShowCategoryFilter:enabled})}/>
  </ToolsControlGroups>;
}
