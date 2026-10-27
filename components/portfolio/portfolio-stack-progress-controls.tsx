'use client';
import { ToolsControlGroups } from './portfolio-tools-control-groups';

import { useId, type ReactNode } from 'react';
import { useT } from '@/lib/i18n/I18nProvider';
import { HeaderSteppedSlider } from './portfolio-header-style-controls';
import { NpToggleRow } from './portfolio-nav-panel-ui';
import type { PortfolioStackSectionSettings } from './portfolio-stack-settings';
import {
  PORTFOLIO_TOOLS_TILE_SIZE_OPTIONS, PORTFOLIO_TOOLS_LEVEL_PROGRESS_ROW_GAP_OPTIONS,
  PORTFOLIO_TOOLS_LEVEL_TABLE_GROUP_BY_OPTIONS,
  PORTFOLIO_TOOLS_LEVEL_INDICATOR_DISPLAY_STYLE_OPTIONS, resolveToolsLevelIndicatorDisplayStyle,
  PORTFOLIO_TOOLS_LEVEL_BAR_STYLE_OPTIONS, PORTFOLIO_TOOLS_LEVEL_BAR_SIZE_OPTIONS,
  PORTFOLIO_TOOLS_CONTENT_ALIGNMENT_OPTIONS, resolveToolsLevelIndicatorFullWidth,
  resolveToolsLevelIndicatorShowCategoryFilter,
} from './portfolio-tools-settings';
import styles from './portfolio-stack-rail-controls.module.css';

export function Choices<T extends string>({label,options,value,onChange,glyph,columns=2,hideOptionLabels=false}: {
  label:string; options:{value:T;label:string;description?:string}[]; value:T;
  onChange:(value:T)=>void; glyph:(value:T,index:number)=>ReactNode; columns?:2|3|4;
  hideOptionLabels?:boolean;
}) {
  const t=useT();
  return <div><p className={styles.label}>{label}</p>
    <div className={columns===4?styles.spacing:columns===3?styles.alignment:styles.colors} role="group" aria-label={label}>
      {options.map((option,index)=><button type="button" key={option.value} className={`${styles.choice} ${hideOptionLabels?styles.choicePreviewOnly:''}`}
        aria-label={t(option.label)}
        aria-pressed={value===option.value} title={option.description?t(option.description):undefined}
        onClick={()=>onChange(option.value)}>{glyph(option.value,index)}{hideOptionLabels?null:<span>{t(option.label)}</span>}</button>)}
    </div>
  </div>;
}

export function LevelSample({value}:{value:string}) {
  const gradientId = useId();
  const rounded = value !== 'rectangle';
  return <svg width="112" height="40" viewBox="0 0 112 40" fill="currentColor" aria-hidden>
    {value === 'segments'
      ? Array.from({length:10},(_,index)=><rect key={index} x={6+index*10} y="14" width="7" height="12" rx="2" opacity={index<6?1:.18}/>)
      : <>
        {value === 'pill-gradient' ? <defs><linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="currentColor"/>
          <stop offset="100%" stopColor="currentColor" stopOpacity=".15"/>
        </linearGradient></defs> : null}
        <rect x="6" y="14" width="100" height="12" rx={rounded?6:0} opacity=".16"/>
        <rect x="6" y="14" width="68" height="12" rx={rounded?6:0}
          fill={value === 'pill-gradient' ? `url(#${gradientId})` : 'currentColor'}/>
      </>}
  </svg>;
}

export function TableLevelSample({value}:{value:string}) {
  if (value === 'progress-bar') return <LevelSample value="pill"/>;
  return <svg width="112" height="40" viewBox="0 0 112 40" fill="currentColor" aria-hidden>
    {value === 'text' ? <text x="56" y="25" textAnchor="middle" fontSize="13" fontWeight="600" letterSpacing="1">EXPERT</text>
      : value === 'stars' ? Array.from({length:5},(_,index)=><path key={index} transform={`translate(${index*21+4},12) scale(.8)`} d="m10 0 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z" opacity={index<3?1:.2}/>)
      : Array.from({length:5},(_,index)=><circle key={index} cx={14+index*21} cy="20" r="5" opacity={index<3?1:.2}/>) }
  </svg>;
}

export function StackProgressControls({stack,onChange,aside}:{
  stack:PortfolioStackSectionSettings;onChange:(patch:Partial<PortfolioStackSectionSettings>)=>void;aside:boolean;
}) {
  const t=useT();
  const size=PORTFOLIO_TOOLS_TILE_SIZE_OPTIONS.find(option=>option.value===stack.tileSize)??PORTFOLIO_TOOLS_TILE_SIZE_OPTIONS[1];
  const barSize=PORTFOLIO_TOOLS_LEVEL_BAR_SIZE_OPTIONS.find(option=>option.value===stack.levelBarSize)??PORTFOLIO_TOOLS_LEVEL_BAR_SIZE_OPTIONS[1];
  const fullWidth=resolveToolsLevelIndicatorFullWidth(stack);
  const isTable=stack.design==='level-table-rows';
  const display=resolveToolsLevelIndicatorDisplayStyle({design:isTable?'level-table-rows':'level-progress-rows',levelIndicatorDisplayStyle:stack.levelIndicatorDisplayStyle});
  return <ToolsControlGroups>
    <div className="np-text-size-slider"><HeaderSteppedSlider label={t('Logo size')}
      steps={PORTFOLIO_TOOLS_TILE_SIZE_OPTIONS.map((option,index)=>({value:option.value,tick:['S','M','L','XL'][index]}))}
      value={size.value} currentName={t(size.label)} onChange={tileSize=>onChange({tileSize})}/></div>
    <Choices label={t('Vertical spacing')} options={PORTFOLIO_TOOLS_LEVEL_PROGRESS_ROW_GAP_OPTIONS} columns={4}
      value={stack.levelProgressRowGap??'large'} onChange={levelProgressRowGap=>onChange({levelProgressRowGap})}
      glyph={(_,index)=><svg width="32" height="32" viewBox="0 0 32 32" fill="currentColor" aria-hidden>{[-1,0,1].map(row=><rect key={row} x="3" y={14+row*[4,7,10,13][index]} width="26" height="3" rx="1"/>)}</svg>}/>
    <Choices label={t('Row order')} options={PORTFOLIO_TOOLS_LEVEL_TABLE_GROUP_BY_OPTIONS}
      value={stack.levelTableGroupBy??'category'} onChange={levelTableGroupBy=>onChange({levelTableGroupBy})}
      glyph={value=><svg width="40" height="26" viewBox="0 0 40 26" fill="currentColor" aria-hidden>{value==='category'?<><rect x="2" y="3" width="14" height="6" rx="2"/><rect x="7" y="13" width="30" height="2"/><rect x="7" y="20" width="23" height="2"/></>:<><rect x="3" y="3" width="32" height="3"/><rect x="3" y="11" width="24" height="3"/><rect x="3" y="19" width="14" height="3"/></>}</svg>}/>
    <NpToggleRow title={t('Category filter')} checked={resolveToolsLevelIndicatorShowCategoryFilter(stack)}
      onChange={enabled=>onChange({levelIndicatorShowCategoryFilter:enabled,levelTableShowCategoryFilter:enabled})}/>
    {isTable?<Choices label={t('Level display')} options={PORTFOLIO_TOOLS_LEVEL_INDICATOR_DISPLAY_STYLE_OPTIONS}
      value={display} onChange={levelIndicatorDisplayStyle=>onChange({levelIndicatorDisplayStyle})}
      glyph={value=><TableLevelSample value={value}/>}/>:null}
    {!isTable || display==='progress-bar' ? <Choices label={t('Bar style')} options={PORTFOLIO_TOOLS_LEVEL_BAR_STYLE_OPTIONS}
        value={stack.levelBarStyle??'rectangle'} onChange={levelBarStyle=>onChange({levelBarStyle})} glyph={value=><LevelSample value={value}/>}/>
      :null}
      <div className="np-text-size-slider"><HeaderSteppedSlider label={t(isTable && display!=='progress-bar' ? 'Percentage size' : 'Bar & % size')}
        steps={PORTFOLIO_TOOLS_LEVEL_BAR_SIZE_OPTIONS.map((option,index)=>({value:option.value,tick:['XS','S','M','L','XL'][index]}))}
        value={barSize.value} currentName={t(barSize.label)} onChange={levelBarSize=>onChange({levelBarSize})}/></div>
    {!aside && !isTable?<Choices label={t('Columns (large screen)')} options={[{value:'1',label:'1'},{value:'2',label:'2'}]}
      value={String(stack.levelProgressColumnsPerRow??1)} onChange={value=>onChange({levelProgressColumnsPerRow:value==='2'?2:1})}
      glyph={value=><svg width="48" height="24" viewBox="0 0 48 24" fill="currentColor" aria-hidden>{value==='1'?<rect x="3" y="3" width="42" height="18" rx="2"/>:<><rect x="1" y="3" width="21" height="18" rx="2"/><rect x="26" y="3" width="21" height="18" rx="2"/></>}</svg>}/>:null}
    <NpToggleRow title={t('Full width')} checked={fullWidth}
      onChange={enabled=>onChange({levelIndicatorFullWidth:enabled,levelTableFullWidth:enabled})}/>
    {!fullWidth?<div><p className={styles.label}>{t('List alignment')}</p><div className={styles.alignment} role="group" aria-label={t('List alignment')}>
      {PORTFOLIO_TOOLS_CONTENT_ALIGNMENT_OPTIONS.map(option=><button type="button" key={option.value} className={styles.choice}
        aria-label={t(option.label)} title={t(option.label)} aria-pressed={(stack.levelProgressContentAlignment??'center')===option.value}
        onClick={()=>onChange({levelProgressContentAlignment:option.value})}>
        <svg width="23" height="20" viewBox="0 0 24 20" fill="currentColor" aria-hidden><rect x={option.value==='right'?10:option.value==='center'?5:0} y="2" width="14" height="2" rx="1"/><rect x="0" y="9" width="24" height="2" rx="1"/><rect x={option.value==='right'?13:option.value==='center'?6.5:0} y="16" width="11" height="2" rx="1"/></svg>
      </button>)}
    </div></div>:null}
  </ToolsControlGroups>;
}
