'use client';

import { useT } from '@/lib/i18n/I18nProvider';
import { Choices } from './portfolio-stack-progress-controls';
import type { PortfolioInfoSectionSettings } from './portfolio-info-settings';
import type { CSSProperties } from 'react';

export function InfoBioStyle({info,onChange,defaultSize=20}:{info:PortfolioInfoSectionSettings;onChange:(patch:Partial<PortfolioInfoSectionSettings>)=>void;defaultSize?:number}) {
  const t=useT();
  const size = Math.max(12, Math.min(120, info.bioFontSize ?? defaultSize));
  return <>
    <Choices<'serif'|'sans'> label={t('Font family')} columns={2}
    options={[{value:'serif',label:'Serif'},{value:'sans',label:'Sans'}]}
    value={info.bioFontFamily==='sans'?'sans':'serif'}
    onChange={bioFontFamily=>onChange({bioFontFamily})}
    glyph={value=><span aria-hidden style={{fontSize:24,fontFamily:value==='sans'?'sans-serif':'serif',fontStyle:info.bioItalic?'italic':'normal'}}>Aa</span>}/>
    <label className="np-field block">
      <span className="np-field-label flex items-center justify-between"><span>{t('Text size')}</span><span className="font-normal tabular-nums">{info.bioFontSize == null ? t('Default') : `${size} px`}</span></span>
      <div className="flex items-center gap-3">
        <input type="range" min={12} max={120} step={1} className="np-range min-w-0 flex-1" value={size} aria-label={t('Text size')+' (px)'}
          style={{'--np-fill':`${((size-12)/108)*100}%`} as CSSProperties}
          onChange={event => onChange({bioFontSize:Number(event.target.value)})} />
        <button type="button" className="np-bio-size-reset shrink-0" onClick={() => onChange({bioFontSize:undefined})}>{t('Reset')}</button>
      </div>
    </label>
  </>;
}
