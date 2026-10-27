const fs=require('fs'),path=require('path');const root=path.join(__dirname,'..','..');
function edit(rel,fn){const f=path.join(root,rel);let s=fs.readFileSync(f,'utf8');const eol=s.includes('\r\n')?'\r\n':'\n';s=s.replace(/\r\n/g,'\n');
const rep=(a,b)=>{if(s.split(a).length!==2)throw new Error(rel+' need one: '+a.slice(0,70));s=s.replace(a,b);};fn(rep);fs.writeFileSync(f,s.replace(/\n/g,eol));}
edit('components/portfolio/portfolio-experience-settings.ts',rep=>{
rep(`/** Duotone design: how you move between roles. */
export type PortfolioExperienceDuotoneScrollMode`,`/** Kinetic design: vertical space between the elements of a role and between roles. */
export type PortfolioExperienceKineticSpacing = 'tight' | 'standard' | 'relaxed' | 'airy';

export const PORTFOLIO_EXPERIENCE_KINETIC_SPACING_OPTIONS: {
  value: PortfolioExperienceKineticSpacing;
  label: string;
  description: string;
}[] = [
  { value: 'tight', label: msg('Tight'), description: msg('Elements and roles sit close together.') },
  { value: 'standard', label: msg('Standard'), description: msg('Balanced spacing (default).') },
  { value: 'relaxed', label: msg('Relaxed'), description: msg('More room around each element.') },
  { value: 'airy', label: msg('Airy'), description: msg('Generous, gallery-like spacing.') },
];

/** Duotone design: how you move between roles. */
export type PortfolioExperienceDuotoneScrollMode`);
rep(`  kineticTitleWeight: PortfolioExperienceKineticTitleWeight;
`,`  kineticTitleWeight: PortfolioExperienceKineticTitleWeight;
  /** Kinetic design: vertical spacing between elements and roles. */
  kineticSpacing: PortfolioExperienceKineticSpacing;
`);
rep(`  kineticTitleWeight: 'semibold',
`,`  kineticTitleWeight: 'semibold',
  kineticSpacing: 'standard',
`);
rep(`    kineticTitleWeight: pick(`,`    kineticSpacing: pick(
      record.kineticSpacing,
      ['tight', 'standard', 'relaxed', 'airy'],
      base.kineticSpacing ?? 'standard'
    ),
    kineticTitleWeight: pick(`);
});
edit('components/portfolio/portfolio-experience-lists.tsx',rep=>{
rep(`function KineticExperienceRow({`,`/** Literal class strings (Tailwind keeps them): row padding, title gap, grid gap, description gap, tasks gap. */
const KINETIC_SPACING_CLASSES = {
  tight: { row: 'py-6 sm:py-9', title: 'mt-4 sm:mt-5', grid: 'mt-5 gap-6 sm:mt-7 sm:gap-8', description: 'mt-2', tasks: 'mt-4' },
  standard: { row: 'py-10 sm:py-14', title: 'mt-6 sm:mt-8', grid: 'mt-8 gap-8 sm:mt-12 sm:gap-10', description: 'mt-4', tasks: 'mt-6' },
  relaxed: { row: 'py-14 sm:py-20', title: 'mt-8 sm:mt-11', grid: 'mt-11 gap-10 sm:mt-16 sm:gap-12', description: 'mt-5', tasks: 'mt-8' },
  airy: { row: 'py-20 sm:py-28', title: 'mt-10 sm:mt-14', grid: 'mt-14 gap-12 sm:mt-20 sm:gap-14', description: 'mt-6', tasks: 'mt-10' },
} as const;

function KineticExperienceRow({`);
rep(`  titleWeightClass,
  isLast,
}: {`,`  titleWeightClass,
  spacing,
  isLast,
}: {`);
rep(`  titleWeightClass: string;
  isLast: boolean;`,`  titleWeightClass: string;
  spacing: (typeof KINETIC_SPACING_CLASSES)[keyof typeof KINETIC_SPACING_CLASSES];
  isLast: boolean;`);
rep(`      className="relative py-10 sm:py-14 first:pt-0 last:pb-0"`,`      className={\`relative \${spacing.row} first:pt-0 last:pb-0\`}`);
rep(`className={\`mt-6 max-w-[16ch] text-balance`,`className={\`\${spacing.title} max-w-[16ch] text-balance`);
rep(` leading-[0.96] tracking-[-0.045em] sm:mt-8\`}`,` leading-[0.96] tracking-[-0.045em]\`}`);
rep(`      <div className="mt-8 grid grid-cols-1 gap-8 sm:mt-12 sm:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] sm:items-end sm:gap-10">`,`      <div className={\`grid grid-cols-1 \${spacing.grid} sm:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] sm:items-end\`}>`);
rep(`            <p className="mt-4 max-w-md text-[1rem] leading-[1.65]" style={{ color: muted }}>`,`            <p className={\`\${spacing.description} max-w-md text-[1rem] leading-[1.65]\`} style={{ color: muted }}>`);
rep(`            <div className="mt-6 max-w-md">
              <ExperienceTasksDisplay`,`            <div className={\`\${spacing.tasks} max-w-md\`}>
              <ExperienceTasksDisplay`);
rep(`          titleWeightClass={titleWeightClass}
          isLast`,`          titleWeightClass={titleWeightClass}
          spacing={KINETIC_SPACING_CLASSES[presentation.kineticSpacing ?? 'standard']}
          isLast`);
});
edit('components/portfolio/portfolio-experience-settings-panel.tsx',rep=>{
rep(`PORTFOLIO_EXPERIENCE_KINETIC_TITLE_WEIGHT_OPTIONS, `,`PORTFOLIO_EXPERIENCE_KINETIC_TITLE_WEIGHT_OPTIONS, PORTFOLIO_EXPERIENCE_KINETIC_SPACING_OPTIONS, `);
rep(`          {design === 'kinetic' ? (
            <ExperienceScalePill
              label={t('Title weight')}
              options={PORTFOLIO_EXPERIENCE_KINETIC_TITLE_WEIGHT_OPTIONS}
              sizes={[15, 15, 15, 15]}
              value={experience.kineticTitleWeight ?? 'semibold'}
              onChange={(kineticTitleWeight) => onChange({ kineticTitleWeight })}
            />
          ) : null}`,`          {design === 'kinetic' ? (
            <>
              <ExperienceOptionGrid
                label={t('Title weight')}
                options={PORTFOLIO_EXPERIENCE_KINETIC_TITLE_WEIGHT_OPTIONS}
                value={experience.kineticTitleWeight ?? 'semibold'}
                onChange={(kineticTitleWeight) => onChange({ kineticTitleWeight })}
                columns={4}
              />
              <ExperienceOptionGrid
                label={t('Vertical spacing')}
                options={PORTFOLIO_EXPERIENCE_KINETIC_SPACING_OPTIONS}
                value={experience.kineticSpacing ?? 'standard'}
                onChange={(kineticSpacing) => onChange({ kineticSpacing })}
                columns={4}
              />
            </>
          ) : null}`);
});
console.log('ok');
