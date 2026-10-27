'use client';
import { SettingsControlSection } from './portfolio-settings-control-section';

import { useT } from '@/lib/i18n/I18nProvider';
import { Choices } from './portfolio-stack-progress-controls';
import { HeaderSteppedSlider } from './portfolio-header-style-controls';
import styles from './portfolio-stack-rail-controls.module.css';
import compactStyles from './portfolio-work-accordion-controls.module.css';
import {NpToggleRow} from './portfolio-nav-panel-ui';
import { DEFAULT_PROJECTS_SPLIT_SETTINGS, PORTFOLIO_WORK_SPLIT_IMAGE_SIDE_OPTIONS, PORTFOLIO_WORK_SPLIT_THUMBNAIL_SIZE_OPTIONS, PORTFOLIO_WORK_SPLIT_RADIUS_OPTIONS, PORTFOLIO_WORK_SPLIT_ROW_GAP_OPTIONS, type PortfolioWorkSectionSettings } from './portfolio-work-settings';

function SplitChoice<T extends string>({label,value,options,onChange,columns}:{label:string;value:T;options:{value:T;label:string;description?:string}[];onChange:(value:T)=>void;columns?:number}) {
  return <Choices label={label} value={value} options={options} onChange={onChange} columns={columns===3?3:2}
    glyph={option=><svg width="74" height="44" viewBox="0 0 74 44" fill="currentColor" aria-hidden>
      {['none','md','xl'].includes(option)?<rect x="8" y="4" width="58" height="36" rx={option==='none'?0:option==='md'?6:13} stroke="currentColor" strokeWidth="2" fillOpacity=".15"/>:<>
        <rect x={option==='left'?3:option==='right'?43:23} y="4" width="28" height="36" rx="2" opacity=".2"/>
        {[0,1].map(i=><rect key={i} x={option==='left'?39:3} y={14+i*10} width={i===0?28:21} height={i===0?3:2} rx="1" opacity={i===0?.85:.4}/>)}</>}
    </svg>}/>;
}
function SplitScale<T extends string>({label,value,options,onChange}:{label:string;value:T;options:{value:T;label:string}[];onChange:(value:T)=>void}) {
  const t=useT();
  if (options.some(option=>option.value==='tight')) return <Choices label={label} options={options} value={value} columns={3} onChange={onChange} glyph={(_,index)=><svg width="38" height="34" viewBox="0 0 38 34" fill="currentColor" aria-hidden>{[-1,0,1].map(i=><rect key={i} x="4" y={15+i*[5,9,13][index]} width="30" height="3" rx="1"/>)}</svg>}/>;
  const current=options.find(option=>option.value===value)??options[0];
  return <div className="np-text-size-slider"><HeaderSteppedSlider label={label} value={current.value} currentName={t(current.label)} steps={options.map((option,index)=>({value:option.value,tick:['L','XL','50/50'][index]}))} onChange={onChange}/></div>;
}
export function WorkSplitControls({work,onChange}:{work:PortfolioWorkSectionSettings;onChange:(patch:Partial<PortfolioWorkSectionSettings>)=>void}) {
  const t=useT();
  return <div className={`${styles.controls} ${compactStyles.controls}`}>
<SettingsControlSection title={t('Layout')} className={styles.settingsGroup}>
<NpToggleRow title={t('Alternate image sides')} checked={work.projectsSplit?.alternateSides === true} onChange={alternateSides=>onChange({projectsSplit:{...DEFAULT_PROJECTS_SPLIT_SETTINGS,...work.projectsSplit,alternateSides}})}/>
<SplitChoice
                label={t('Image placement')}
                options={PORTFOLIO_WORK_SPLIT_IMAGE_SIDE_OPTIONS}
                value={(work.projectsSplit ?? DEFAULT_PROJECTS_SPLIT_SETTINGS).imageSide ?? 'left'}
                onChange={(imageSide) =>
                  onChange({
                    projectsSplit: {
                      ...(work.projectsSplit ?? DEFAULT_PROJECTS_SPLIT_SETTINGS),
                      imageSide,
                    },
                  })
                }
                columns={2}
              />
<SplitScale
                label={t('Row spacing')}
                options={PORTFOLIO_WORK_SPLIT_ROW_GAP_OPTIONS}
                value={(work.projectsSplit ?? DEFAULT_PROJECTS_SPLIT_SETTINGS).rowGap ?? 'md'}
                onChange={(rowGap) =>
                  onChange({
                    projectsSplit: {
                      ...(work.projectsSplit ?? DEFAULT_PROJECTS_SPLIT_SETTINGS),
                      rowGap,
                    },
                  })
                }
              />
</SettingsControlSection>
<SettingsControlSection title={t('Appearance')} className={styles.settingsGroup}>
<NpToggleRow title={t('Show numbering')}
                checked={(work.projectsSplit??DEFAULT_PROJECTS_SPLIT_SETTINGS).showNumber!==false}
                onChange={showNumber=>onChange({projectsSplit:{...(work.projectsSplit??DEFAULT_PROJECTS_SPLIT_SETTINGS),showNumber}})}/>
<SplitScale
                label={t('Thumbnail size')}
                options={PORTFOLIO_WORK_SPLIT_THUMBNAIL_SIZE_OPTIONS}
                value={
                  (work.projectsSplit ?? DEFAULT_PROJECTS_SPLIT_SETTINGS).thumbnailSize ?? 'xl'
                }
                onChange={(thumbnailSize) =>
                  onChange({
                    projectsSplit: {
                      ...(work.projectsSplit ?? DEFAULT_PROJECTS_SPLIT_SETTINGS),
                      thumbnailSize,
                    },
                  })
                }
              />
<SplitChoice
                label={t('Thumbnail radius')}
                options={PORTFOLIO_WORK_SPLIT_RADIUS_OPTIONS}
                value={
                  (work.projectsSplit ?? DEFAULT_PROJECTS_SPLIT_SETTINGS).thumbnailRadius ?? 'none'
                }
                onChange={(thumbnailRadius) =>
                  onChange({
                    projectsSplit: {
                      ...(work.projectsSplit ?? DEFAULT_PROJECTS_SPLIT_SETTINGS),
                      thumbnailRadius,
                    },
                  })
                }
                columns={3}
              />
</SettingsControlSection>
</div>;
}
