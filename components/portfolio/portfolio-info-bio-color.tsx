'use client';

import type { CSSProperties } from 'react';
import { useT } from '@/lib/i18n/I18nProvider';
import { Choices } from './portfolio-stack-progress-controls';
import { infoHeaderPaletteTokenColor } from './portfolio-info-header-settings';
import type { PortfolioInfoSectionSettings } from './portfolio-info-settings';

export function InfoBioColor({info,onChange}:{
  info:PortfolioInfoSectionSettings;
  onChange:(patch:Partial<PortfolioInfoSectionSettings>)=>void;
}) {
  const t=useT();
  const opacity=Math.max(30,Math.min(100,info.bioOpacity??100));
  return <>
    <Choices<'principal'|'texteMuted'|'texteFort'> label={t('Text color')} columns={3}
      options={[{value:'principal',label:'Primary'},{value:'texteMuted',label:'Muted text'},{value:'texteFort',label:'Strong text'}]}
      value={info.bioColor??'texteFort'} onChange={bioColor=>onChange({bioColor})}
      glyph={value=><svg width="44" height="28" viewBox="0 0 44 28" aria-hidden><circle cx="22" cy="14" r="9" fill={value==='texteMuted' ? 'var(--pf-palette-texte-muted, #a3a3a3)' : infoHeaderPaletteTokenColor(value)} stroke="currentColor" strokeOpacity=".3"/></svg>}/>
    <label className="np-field block">
      <span className="flex items-center justify-between gap-4"><span className="np-field-label">{t('Opacity')}</span><output className="text-xs tabular-nums text-[var(--np-muted)]">{opacity}%</output></span>
      <input type="range" min={30} max={100} step={1} className="np-range mt-3 w-full" value={opacity} aria-label={t('Biography')+' — '+t('Opacity')}
        style={{'--np-fill':`${(opacity-30)/70*100}%`} as CSSProperties}
        onChange={event=>onChange({bioOpacity:Number(event.target.value)})}/>
    </label>
  </>;
}
