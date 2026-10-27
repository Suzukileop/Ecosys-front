const fs=require('fs'),path=require('path');const root=path.join(__dirname,'..','..');
function edit(rel,fn){const f=path.join(root,rel);let s=fs.readFileSync(f,'utf8');const eol=s.includes('\r\n')?'\r\n':'\n';s=s.replace(/\r\n/g,'\n');
const rep=(a,b)=>{if(s.split(a).length!==2)throw new Error(rel+' need one: '+a.slice(0,70));s=s.replace(a,b);};fn(rep);fs.writeFileSync(f,s.replace(/\n/g,eol));}
const H='components/portfolio/';
edit(H+'portfolio-work-settings.ts',rep=>{
rep(`  consultLabel: string;
  /** Alternating row background tint, ledger-book style. */
  stripedRows: boolean;
};`,`  consultLabel: string;
  /** Look of the Consult link: the ledger's own animated link, or the shared button looks. */
  consultStyle: 'link' | 'underline' | 'outline' | 'solid' | 'pill';
  /** Alternating row background tint, ledger-book style. */
  stripedRows: boolean;
};`);
rep(`  consultLabel: 'Consult this project',
  stripedRows: false,
};

export function mergeProjectsLedgerSettings(`,`  consultLabel: 'Consult this project',
  consultStyle: 'link',
  stripedRows: false,
};

export function mergeProjectsLedgerSettings(`);
rep(`    showCount: typeof record.showCount === 'boolean' ? record.showCount : base.showCount,`,`    showCount: typeof record.showCount === 'boolean' ? record.showCount : base.showCount,
    consultStyle:
      record.consultStyle === 'link' ||
      record.consultStyle === 'underline' ||
      record.consultStyle === 'outline' ||
      record.consultStyle === 'solid' ||
      record.consultStyle === 'pill'
        ? record.consultStyle
        : base.consultStyle ?? 'link',`);
});
edit(H+'portfolio-work-projects-ledger.tsx',rep=>{
rep(`                      <LedgerConsultLink href={href} label={consultLabel} accent={accent} ink={ink} />`,`                      {consultStyle === 'link' ? (
                        <LedgerConsultLink href={href} label={consultLabel} accent={accent} ink={ink} />
                      ) : (
                        <WorkConsultButtonLink href={href} label={consultLabel} ink={ink} variant={consultStyle} />
                      )}`);
rep(`  const consultLabel = settings.consultLabel?.trim() || t('Consult this project');`,`  const consultLabel = settings.consultLabel?.trim() || t('Consult this project');
  const consultStyle = settings.consultStyle ?? 'link';`);
rep(`import { useT } from '@/lib/i18n/I18nProvider';`,`import { WorkConsultButtonLink } from '@/components/portfolio/portfolio-work-consult-link';
import { useT } from '@/lib/i18n/I18nProvider';`);
});
edit(H+'portfolio-work-ledger-controls.tsx',rep=>{
rep(`import { DEFAULT_PROJECTS_LEDGER_SETTINGS,`,`import { GridButtonChoicePreview } from './portfolio-work-grid-button';
import { useThumbnailTheme } from './portfolio-thumbnail-theme';
import { usePortfolioDesignPreviewSource } from './PortfolioDesignLivePreview';
import { resolveWorkReadingPresentation } from './portfolio-work-resolved-palette';
import { DEFAULT_PROJECTS_LEDGER_SETTINGS,`);
rep(`  const settings={...DEFAULT_PROJECTS_LEDGER_SETTINGS,...work.projectsLedger};
  return`,`  const settings={...DEFAULT_PROJECTS_LEDGER_SETTINGS,...work.projectsLedger};
  const theme=useThumbnailTheme('work');
  const source=usePortfolioDesignPreviewSource();
  const buttonInk=source?resolveWorkReadingPresentation(work,source.settings.global,theme.palette).presentation.titleColor:theme.accent;
  const consultLabel=settings.consultLabel?.trim()||t('Consult this project');
  return`);
rep(`      <label className="np-field block"><span className="np-field-label">{t('Consult label')}</span>`,`      <Choices<'link'|'underline'|'outline'|'solid'|'pill'> label={t('Button style')} columns={2}
        options={[{value:'link',label:msg('Link')},{value:'underline',label:msg('Underline')},{value:'outline',label:msg('Outline')},{value:'solid',label:msg('Solid')},{value:'pill',label:msg('Pill')}]}
        value={settings.consultStyle??'link'} onChange={consultStyle=>onChange({projectsLedger:{...settings,consultStyle}})}
        glyph={value=><GridButtonChoicePreview variant={value==='link'?'text':value} ink={buttonInk} label={consultLabel}/>}/>
      <label className="np-field block"><span className="np-field-label">{t('Consult label')}</span>`);
rep(`import { useT } from '@/lib/i18n/I18nProvider';`,`import { useT } from '@/lib/i18n/I18nProvider';
import { msg } from '@/lib/i18n/config';`);
});
console.log('ok');
