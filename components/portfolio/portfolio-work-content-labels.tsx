'use client';

import { useT } from '@/lib/i18n/I18nProvider';
import styles from './portfolio-stack-rail-controls.module.css';
import { WorkButtonColorControl } from './portfolio-work-button-color-control';
import * as W from './portfolio-work-settings';

type Work = W.PortfolioWorkSectionSettings;
type Group = 'projectsBoard'|'projectsAccordion'|'projectsFrames'|'projectsGrid'|'projectsShowcase'|'projectsLedger'|'projectsSpec'|'projectsCase'|'projectsPress'|'projectsDuotone'|'projectsCascade';
type Field<S> = {name: Extract<keyof S,string>; label:string; placeholder:string; max?:number; multiline?:boolean; visible?:(settings:S)=>boolean};

/** Copy lives beside its design controls; stored per-design values are preserved. */
export function WorkContentLabels({work,onChange,scope='content'}:{work:Work;onChange:(patch:Partial<Work>)=>void;scope?:'content'|'consult'}) {
  const t=useT();
  const fields:{id:string;label:string;placeholder:string;value:string;max:number;multiline?:boolean;update:(value:string)=>void}[]=[];
  function add<K extends Group>(key:K,defaults:Work[K],definitions:Field<Work[K]>[]) {
    const settings={...defaults,...work[key]};
    definitions.forEach(field=>{
      const consult=field.name==='consultLabel'||(field.name==='linkLabel'&&key!=='projectsSpec');
      if(consult!==(scope==='consult'))return;
      if(field.visible && !field.visible(settings))return;
      fields.push({id:`${key}-${field.name}`,label:field.label,placeholder:field.placeholder,value:String(settings[field.name]??''),max:field.max??64,multiline:field.multiline,
        update:value=>onChange({[key]:{...settings,[field.name]:field.multiline?W.limitChars(value,field.max??64):value}})});
    });
  }
  switch(work.sectionDesign) {
    case 'projects-board': add('projectsBoard',W.DEFAULT_PROJECTS_BOARD_SETTINGS,[{name:'consultLabel',label:'Case study link label',placeholder:'View project',max:32,visible:s=>s.showConsultOnHover}]);break;
    case 'projects-accordion': add('projectsAccordion',W.DEFAULT_PROJECTS_ACCORDION_SETTINGS,[
      {name:'toolsLabel',label:'Tools label',placeholder:'Tools I use',max:48,visible:s=>s.showTools&&s.showToolsLabel},
      {name:'consultLabel',label:'Consult button label',placeholder:'Consult',max:32,visible:s=>s.showConsult}]);break;
    case 'projects-frames': add('projectsFrames',W.DEFAULT_PROJECTS_FRAMES_SETTINGS,[{name:'consultLabel',label:'Consult button label',placeholder:'Consult',max:32,visible:s=>s.showConsult}]);break;
    case 'projects-grid': add('projectsGrid',W.DEFAULT_PROJECTS_GRID_SETTINGS,[{name:'consultLabel',label:'Consult button label',placeholder:'View project'}]);break;
    case 'projects-showcase': add('projectsShowcase',W.DEFAULT_PROJECTS_SHOWCASE_SETTINGS,[{name:'categoryLabel',label:'Category label',placeholder:'Category',max:40,visible:s=>s.showCategory}]);break;
    case 'projects-ledger': add('projectsLedger',W.DEFAULT_PROJECTS_LEDGER_SETTINGS,[{name:'consultLabel',label:'Consult label',placeholder:'Consult this project',visible:s=>s.showConsult}]);break;
    case 'projects-spec': add('projectsSpec',W.DEFAULT_PROJECTS_SPEC_SETTINGS,[
      {name:'descriptionLabel',label:'Description label',placeholder:'Summary',max:40,visible:s=>s.showFieldLabels&&s.showDescription},
      {name:'stackLabel',label:'Stack label',placeholder:'Stack',max:40,visible:s=>s.showFieldLabels&&s.showStack},
      {name:'linkLabel',label:'Link label',placeholder:'Link',max:40,visible:s=>s.showFieldLabels&&s.showConsult},
      {name:'consultLabel',label:'Consult label',placeholder:'Consult this project',visible:s=>s.showConsult}]);break;
    case 'projects-case': add('projectsCase',W.DEFAULT_PROJECTS_CASE_SETTINGS,[
      {name:'descriptionLabel',label:'Description label',placeholder:'Summary',max:40,visible:s=>s.showFieldLabels&&s.showDescription},
      {name:'stackLabel',label:'Stack label',placeholder:'Stack',max:40,visible:s=>s.showFieldLabels&&s.showStack},
      {name:'consultLabel',label:'Consult label',placeholder:'Consult this project',visible:s=>s.showConsult}]);break;
    case 'projects-duotone': add('projectsDuotone',W.DEFAULT_PROJECTS_DUOTONE_SETTINGS,[{name:'linkLabel',label:'Consult button label',placeholder:'View project'}]);break;
    case 'projects-cascade': add('projectsCascade',W.DEFAULT_PROJECTS_CASCADE_SETTINGS,[{name:'linkLabel',label:'Consult button label',placeholder:'View project',visible:s=>s.showLink}]);break;
    case 'projects-press': add('projectsPress',W.DEFAULT_PROJECTS_PRESS_SETTINGS,[
      {name:'eyebrowText',label:'Eyebrow',placeholder:'Project'},
      {name:'introText',label:'Intro text',placeholder:'Optional left-column blurb, under the eyebrow.',max:W.PROJECTS_PRESS_INTRO_MAX_CHARS,multiline:true}]);break;
  }
  if(!fields.length)return null;
  const inputs=fields.map(field=><label key={field.id} className="np-field block">
      <span className="np-field-label">{t(field.label)}</span>
      {field.multiline?<textarea className="np-input resize-y leading-relaxed" rows={3} value={field.value} placeholder={t(field.placeholder)} onChange={event=>field.update(event.target.value)}/>
        :<input className="np-input" maxLength={field.max} value={field.value} placeholder={t(field.placeholder)} onChange={event=>field.update(event.target.value)}/>}
      {field.multiline?<span className="np-field-label text-right">{W.countChars(field.value)} / {field.max} {t('characters')}</span>:null}
    </label>);
  return scope==='consult'?<>{inputs}<WorkButtonColorControl work={work} onChange={onChange}/></>:<section className={styles.settingsGroup} aria-label={t('Labels')}>
    <h4 className={styles.groupHeading}>{t('Labels')}</h4>
    {inputs}
  </section>;
}
