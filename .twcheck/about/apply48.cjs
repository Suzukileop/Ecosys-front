const fs=require('fs'),path=require('path');const root=path.join(__dirname,'..','..');
function edit(rel,fn){const f=path.join(root,rel);let s=fs.readFileSync(f,'utf8');const eol=s.includes('\r\n')?'\r\n':'\n';s=s.replace(/\r\n/g,'\n');
const rep=(a,b)=>{if(s.split(a).length!==2)throw new Error(rel+' need one: '+a.slice(0,70));s=s.replace(a,b);};fn(rep);fs.writeFileSync(f,s.replace(/\n/g,eol));}
const H='components/portfolio/';
edit(H+'portfolio-work-projects-ledger.tsx',rep=>{
rep("          className={`grid grid-cols-[auto_minmax(0,1fr)] items-start gap-x-4 gap-y-2 py-6 sm:gap-x-6 sm:py-7 md:grid-cols-[3rem_minmax(0,1fr)_minmax(7rem,12rem)_1.5rem] md:gap-x-6 lg:grid-cols-[3.5rem_minmax(0,1fr)_minmax(7.5rem,13rem)_1.75rem] lg:gap-x-8 lg:py-9 xl:grid-cols-[4rem_minmax(0,1fr)_minmax(8rem,14rem)_1.75rem] xl:gap-x-10 ${",
"          className={`grid items-start gap-x-4 gap-y-2 py-6 sm:gap-x-6 sm:py-7 md:gap-x-6 lg:gap-x-8 lg:py-9 xl:gap-x-10 ${\n            // Without the numbering the first column goes away, so the title sits flush left.\n            showIndex\n              ? 'grid-cols-[auto_minmax(0,1fr)] md:grid-cols-[3rem_minmax(0,1fr)_minmax(7rem,12rem)_1.5rem] lg:grid-cols-[3.5rem_minmax(0,1fr)_minmax(7.5rem,13rem)_1.75rem] xl:grid-cols-[4rem_minmax(0,1fr)_minmax(8rem,14rem)_1.75rem]'\n              : 'grid-cols-[minmax(0,1fr)] md:grid-cols-[minmax(0,1fr)_minmax(7rem,12rem)_1.5rem] lg:grid-cols-[minmax(0,1fr)_minmax(7.5rem,13rem)_1.75rem] xl:grid-cols-[minmax(0,1fr)_minmax(8rem,14rem)_1.75rem]'\n          } ${");
rep(`          ) : (
            <span className="hidden md:block" aria-hidden />
          )}

          <div className="min-w-0" data-ledger-title="" data-pf-no-color-transition="">`,`          ) : null}

          <div className="min-w-0" data-ledger-title="" data-pf-no-color-transition="">`);
rep(`            <div
              className="col-span-2 col-start-2 pt-1 md:col-span-1 md:col-start-auto md:justify-self-end md:pt-[0.85rem] md:text-right lg:pt-[0.95rem]"`,"            <div\n              className={`${showIndex ? 'col-span-2 col-start-2' : 'col-span-1 col-start-1'} pt-1 md:col-span-1 md:col-start-auto md:justify-self-end md:pt-[0.85rem] md:text-right lg:pt-[0.95rem]`}");
rep("                className=\"pf-work-ledger-panel-body pb-8 pl-0 sm:pb-10 md:pl-[4.5rem] lg:pl-[5.5rem] lg:pr-12 xl:pl-[6.5rem]\"","                className={`pf-work-ledger-panel-body pb-8 pl-0 sm:pb-10 lg:pr-12 ${showIndex ? 'md:pl-[4.5rem] lg:pl-[5.5rem] xl:pl-[6.5rem]' : ''}`}");
});
edit(H+'portfolio-work-ledger-controls.tsx',rep=>{
rep(`    <section className={styles.settingsGroup} aria-label={t('Appearance')}>
      <h4 className={styles.groupHeading}>{t('Appearance')}</h4>
      <NpToggleRow title={t('Striped rows')}`,`    <section className={styles.settingsGroup} aria-label={t('Numbering')}>
      <h4 className={styles.groupHeading}>{t('Numbering')}</h4>
      <NpToggleRow title={t('Show numbering')} checked={settings.showIndex!==false} onChange={showIndex=>onChange({projectsLedger:{...settings,showIndex}})}/>
    </section>
    {settings.showConsult!==false?<section className={styles.settingsGroup} aria-label={t('Consult link')}>
      <h4 className={styles.groupHeading}>{t('Consult link')}</h4>
      <label className="np-field block"><span className="np-field-label">{t('Consult label')}</span>
        <input className="np-input" maxLength={64} value={settings.consultLabel??''} placeholder={t('Consult this project')} onChange={event=>onChange({projectsLedger:{...settings,consultLabel:event.target.value}})}/>
      </label>
    </section>:null}
    <section className={styles.settingsGroup} aria-label={t('Appearance')}>
      <h4 className={styles.groupHeading}>{t('Appearance')}</h4>
      <NpToggleRow title={t('Striped rows')}`);
});
edit(H+'portfolio-work-settings-panel.tsx',rep=>{
rep(`          <WorkToggleRow
            label={t('Index')}
            checked={(work.projectsLedger ?? DEFAULT_PROJECTS_LEDGER_SETTINGS).showIndex !== false}
            onChange={(showIndex) =>
              onChange({
                projectsLedger: {
                  ...(work.projectsLedger ?? DEFAULT_PROJECTS_LEDGER_SETTINGS),
                  showIndex,
                },
              })
            }
          />

          <WorkToggleRow
            label={t('Role')}
            checked={(work.projectsLedger ?? DEFAULT_PROJECTS_LEDGER_SETTINGS).showRole !== false}`,`          <WorkToggleRow
            label={t('Role')}
            checked={(work.projectsLedger ?? DEFAULT_PROJECTS_LEDGER_SETTINGS).showRole !== false}`);
rep(`          {(work.projectsLedger ?? DEFAULT_PROJECTS_LEDGER_SETTINGS).showConsult !== false ? (
            <div>
              <p className="pf-stack-block-label">
                {t('Consult label')}
              </p>
              <input
                type="text"
                className="mt-2 w-full rounded-xl border border-[color:var(--pf-palette-bordure)] bg-transparent px-3 py-2 text-sm text-[color:var(--pf-palette-texte-fort)] outline-hidden focus:border-[color:var(--pf-palette-texte-muted)]"
                value={
                  (work.projectsLedger ?? DEFAULT_PROJECTS_LEDGER_SETTINGS).consultLabel ||
                  'Consult this project'
                }
                placeholder={t('Consult this project')}
                onChange={(event) =>
                  onChange({
                    projectsLedger: {
                      ...(work.projectsLedger ?? DEFAULT_PROJECTS_LEDGER_SETTINGS),
                      consultLabel: event.target.value,
                    },
                  })
                }
              />
            </div>
          ) : null}
        </>
      )
      : design === 'projects-spec' ? (`,`        </>
      )
      : design === 'projects-spec' ? (`);
});
console.log('ok');
