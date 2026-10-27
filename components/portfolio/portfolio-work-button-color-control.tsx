'use client';

import { useT } from '@/lib/i18n/I18nProvider';
import type { CSSProperties } from 'react';
import { Choices } from './portfolio-stack-progress-controls';
import { resolveHeroPaletteColor } from './portfolio-hero-palette-settings';
import { DEFAULT_WORK_PALETTE } from './portfolio-work-palette-settings';
import type { PortfolioWorkSectionSettings } from './portfolio-work-settings';

const groups = {
  'projects-board': 'projectsBoard',
  'projects-grid': 'projectsGrid',
  'projects-ledger': 'projectsLedger',
  'projects-spec': 'projectsSpec',
  'projects-duotone': 'projectsDuotone',
  'projects-cascade': 'projectsCascade',
} as const;

export function WorkButtonColorControl({work,onChange}: {
  work:PortfolioWorkSectionSettings;
  onChange:(patch:Partial<PortfolioWorkSectionSettings>)=>void;
}) {
  const t=useT();
  const design=work.sectionDesign??'projects-board';
  if (!(design in groups)) return null;
  const key=groups[design as keyof typeof groups];
  const settings=work[key];
  const palette={...DEFAULT_WORK_PALETTE,...work.workPalette};
  const opacity=Math.max(30,Math.min(100,settings?.buttonColorOpacity??100));
  return <><Choices<'principal'|'secondaire'|'texteFort'> label={t('Button color')} columns={3}
    options={[{value:'principal',label:'Primary'},{value:'secondaire',label:'Secondary'},{value:'texteFort',label:'Text'}]}
    value={settings?.buttonColor??(design==='projects-grid'?'principal':'texteFort')}
    onChange={buttonColor=>onChange({[key]:{...settings,buttonColor}})}
    glyph={value=><svg width="44" height="28" viewBox="0 0 44 28" aria-hidden>
      <circle cx="22" cy="14" r="9" fill={resolveHeroPaletteColor(palette,value)} stroke="currentColor" strokeOpacity=".3"/>
    </svg>}/>
    <label className="np-field block">
      <span className="flex items-center justify-between gap-4">
        <span className="np-field-label">{t('Opacity')}</span>
        <output className="text-xs tabular-nums text-[var(--np-muted)]">{opacity}%</output>
      </span>
      <input type="range" className="np-range mt-3 w-full" min={30} max={100} step={1}
        aria-label={t('Button color')+' — '+t('Opacity')} value={opacity}
        style={{'--np-fill':((opacity-30)/70*100)+'%'} as CSSProperties}
        onChange={event=>onChange({[key]:{...settings,buttonColorOpacity:Number(event.target.value)}})}/>
    </label>
  </>;
}
