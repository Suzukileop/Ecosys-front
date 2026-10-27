const fs=require('fs'),path=require('path');const root=path.join(__dirname,'..','..');
function edit(rel,fn){const f=path.join(root,rel);let s=fs.readFileSync(f,'utf8');const eol=s.includes('\r\n')?'\r\n':'\n';s=s.replace(/\r\n/g,'\n');
const rep=(a,b)=>{if(s.split(a).length!==2)throw new Error(rel+' need one: '+a.slice(0,70));s=s.replace(a,b);};fn(rep);fs.writeFileSync(f,s.replace(/\n/g,eol));}
edit('components/portfolio/portfolio-experience-settings.ts',rep=>{
rep(`/** Duotone design: how you move between roles. */
export type PortfolioExperienceDuotoneScrollMode = 'sticky' | 'scroll' | 'slide';`,`/** Kinetic design: weight of the role title. */
export type PortfolioExperienceKineticTitleWeight = 'regular' | 'medium' | 'semibold' | 'bold';

export const PORTFOLIO_EXPERIENCE_KINETIC_TITLE_WEIGHT_OPTIONS: {
  value: PortfolioExperienceKineticTitleWeight;
  label: string;
  description: string;
}[] = [
  { value: 'regular', label: msg('Regular'), description: msg('A light, airy title.') },
  { value: 'medium', label: msg('Medium'), description: msg('A calm, editorial title.') },
  { value: 'semibold', label: msg('Semibold'), description: msg('Firm without being heavy (default).') },
  { value: 'bold', label: msg('Bold'), description: msg('A strong, poster-like title.') },
];

/** Duotone design: how you move between roles. */
export type PortfolioExperienceDuotoneScrollMode = 'sticky' | 'scroll' | 'slide';`);
rep(`  /** Duotone design: how you move between roles. */
  duotoneScrollMode: PortfolioExperienceDuotoneScrollMode;`,`  /** Kinetic design: weight of the role title. */
  kineticTitleWeight: PortfolioExperienceKineticTitleWeight;
  /** Duotone design: how you move between roles. */
  duotoneScrollMode: PortfolioExperienceDuotoneScrollMode;`);
rep(`  duotoneScrollMode: 'sticky',`,`  kineticTitleWeight: 'semibold',
  duotoneScrollMode: 'sticky',`);
rep(`    duotoneScrollMode: pick(
      record.duotoneScrollMode,`,`    kineticTitleWeight: pick(
      record.kineticTitleWeight,
      ['regular', 'medium', 'semibold', 'bold'],
      base.kineticTitleWeight ?? 'semibold'
    ),
    duotoneScrollMode: pick(
      record.duotoneScrollMode,`);
});
edit('components/portfolio/portfolio-experience-lists.tsx',rep=>{
rep(`  flags,
  isLast,
}: {
  block: ProfileMediaBlock;
  ink: string;
  muted: string;
  bodyColor: string;`,`  flags,
  titleWeightClass,
  isLast,
}: {
  block: ProfileMediaBlock;
  ink: string;
  muted: string;
  bodyColor: string;`);
rep(`  flags: DuotoneContentFlags;
  isLast: boolean;
}) {
  const t = useT();
  const { period, title, organization, description, status, tasks, tools, links } = resolveExperienceContent(block);
  const repoLink = flags.showProof ? (links[0] ?? null) : null;
  const displayTasks = flags.showTasks ? tasks.slice(0, 4) : [];
  const displayTools = flags.showTools ? tools : [];
  const statusLabel = status === 'ONGOING' ? t('Ongoing') : status === 'FINISHED' ? t('Done') : null;

  return (
    <article
      className="relative py-10`,`  flags: DuotoneContentFlags;
  titleWeightClass: string;
  isLast: boolean;
}) {
  const t = useT();
  const { period, title, organization, description, status, tasks, tools, links } = resolveExperienceContent(block);
  const repoLink = flags.showProof ? (links[0] ?? null) : null;
  const displayTasks = flags.showTasks ? tasks.slice(0, 4) : [];
  const displayTools = flags.showTools ? tools : [];
  const statusLabel = status === 'ONGOING' ? t('Ongoing') : status === 'FINISHED' ? t('Done') : null;

  return (
    <article
      className="relative py-10`);
rep(`*var(--pf-experience-font-scale,1))] font-semibold leading-[0.96] tracking-[-0.045em] sm:mt-8"`,`*var(--pf-experience-font-scale,1))] \${titleWeightClass} leading-[0.96] tracking-[-0.045em] sm:mt-8\`}`);
rep(`          className="mt-6 max-w-[16ch] text-balance text-[length:calc(clamp(2.5rem,6.4vw,5.25rem)`,`          className={\`mt-6 max-w-[16ch] text-balance text-[length:calc(clamp(2.5rem,6.4vw,5.25rem)`);
rep(`          flags={flags}
          isLast={index === blocks.length - 1}
        />
      ))}
    </div>
  );
}`,`          flags={flags}
          titleWeightClass={titleWeightClass}
          isLast={index === blocks.length - 1}
        />
      ))}
    </div>
  );
}`);
rep(`  const flags = experienceContentFlags(presentation, isDark, 'legacy');

  return (
    <div
      className={experienceListShellClass(
        forceSingleColumn ? 'full' : presentation.listMaxWidth,
        forceSingleColumn ? 'left' : presentation.listPlacement
      )}
    >
      {blocks.map((block, index) => (
        <KineticExperienceRow`,`  const flags = experienceContentFlags(presentation, isDark, 'legacy');
  const titleWeightClass =
    presentation.kineticTitleWeight === 'regular'
      ? 'font-normal'
      : presentation.kineticTitleWeight === 'medium'
        ? 'font-medium'
        : presentation.kineticTitleWeight === 'bold'
          ? 'font-bold'
          : 'font-semibold';

  return (
    <div
      className={experienceListShellClass(
        forceSingleColumn ? 'full' : presentation.listMaxWidth,
        forceSingleColumn ? 'left' : presentation.listPlacement
      )}
    >
      {blocks.map((block, index) => (
        <KineticExperienceRow`);
});
edit('components/portfolio/portfolio-experience-settings-panel.tsx',rep=>{
rep(`          {design === 'kinetic' ? null : (
          <NpCollapsibleSection title={t('Layout options')}>
          <SettingsRowsScope title={t('Layout options')}>
          {isTable ? (`,`          <NpCollapsibleSection title={t('Layout options')}>
          <SettingsRowsScope title={t('Layout options')}>
          {design === 'kinetic' ? (
            <ExperienceScalePill
              label={t('Title weight')}
              options={PORTFOLIO_EXPERIENCE_KINETIC_TITLE_WEIGHT_OPTIONS}
              sizes={[15, 15, 15, 15]}
              value={experience.kineticTitleWeight ?? 'semibold'}
              onChange={(kineticTitleWeight) => onChange({ kineticTitleWeight })}
            />
          ) : null}
          {isTable ? (`);
rep(`          </SettingsRowsScope>
          </NpCollapsibleSection>
          )}
          <NpCollapsibleSection title={t('Details')}>`,`          </SettingsRowsScope>
          </NpCollapsibleSection>
          <NpCollapsibleSection title={t('Details')}>`);
rep(`          {/* Kinetic has no layout option of its own: no empty section. */}
`,``);
});
console.log('ok');
