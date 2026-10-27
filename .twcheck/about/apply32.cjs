const fs=require('fs'),path=require('path');
const f=path.join(__dirname,'..','..','components/portfolio/portfolio-experience-lists.tsx');
let s=fs.readFileSync(f,'utf8');const eol=s.includes('\r\n')?'\r\n':'\n';s=s.replace(/\r\n/g,'\n');
const rep=(a,b)=>{if(s.split(a).length!==2)throw new Error('need one: '+a.slice(0,70));s=s.replace(a,b);};
rep(`  const secondary = experienceSecondaryStatusColor(presentation);
  const stackLabel = resolveExperienceBlockLabel(toolsLabel, 'Stack');`,`  const secondary = experienceSecondaryStatusColor(presentation);
  // The "Stack" / "Responsibilities" headings follow the per-label switches in General (blank = hidden).
  const stackLabel = experienceBlockLabelVisible(presentation, 'tools')
    ? resolveExperienceBlockLabel(toolsLabel, 'Stack')
    : '';
  const tasksLabel = experienceBlockLabelVisible(presentation, 'tasks')
    ? resolveExperienceBlockLabel(presentation.tasksLabel, 'Responsibilities')
    : '';`);
rep(`                  label={resolveExperienceBlockLabel(presentation.tasksLabel, 'Responsibilities')}
                  size="lg"`,`                  label={tasksLabel}
                  size="lg"`);
fs.writeFileSync(f,s.replace(/\n/g,eol));console.log('ok');
