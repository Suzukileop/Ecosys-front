const fs=require('fs'),path=require('path');
const f=path.join(__dirname,'..','..','components/portfolio/portfolio-experience-lists.tsx');
let s=fs.readFileSync(f,'utf8');const eol=s.includes('\r\n')?'\r\n':'\n';s=s.replace(/\r\n/g,'\n');
const rep=(a,b)=>{if(s.split(a).length!==2)throw new Error('need exactly one: '+a.slice(0,70));s=s.replace(a,b);};
rep(`      className="relative py-12 sm:py-16 first:pt-0 last:pb-0"
      style={{ borderBottom: isLast ? undefined : \`1px solid \${border}\` }}`,`      className="relative py-10 sm:py-14 first:pt-0 last:pb-0"
      style={{ borderBottom: isLast ? undefined : \`1px solid \${border}\` }}`);
rep(`          className="mt-8 max-w-[12ch] text-[clamp(3.1rem,12vw,8.75rem)] font-semibold leading-[0.84] tracking-[-0.07em]"`,`          // Display, but a title: it leads the row without swallowing it (was up to 140px at 0.84 leading).
          // One class so the Text size setting scales it with the rest of the row.
          className="mt-6 max-w-[16ch] text-balance text-[length:calc(clamp(2.5rem,6.4vw,5.25rem)*var(--pf-experience-font-scale,1))] font-semibold leading-[0.96] tracking-[-0.045em] sm:mt-8"`);
rep(`      <div className="mt-10 grid grid-cols-1 gap-10 sm:mt-14 sm:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] sm:items-end">`,`      <div className="mt-8 grid grid-cols-1 gap-8 sm:mt-12 sm:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] sm:items-end sm:gap-10">`);
rep(`            <p className="text-[0.95rem]" style={{ color: muted }}>
              {organization}
            </p>`,`            // The organisation is the second fact of the row: full ink and a step above the body copy.
            <p className="text-[1.2rem] font-medium leading-snug tracking-[-0.01em]" style={{ color: ink }}>
              {organization}
            </p>`);
rep(`            <p className="mt-5 max-w-sm text-[0.95rem] leading-relaxed" style={{ color: bodyColor }}>`,`            <p className="mt-4 max-w-md text-[1rem] leading-[1.65]" style={{ color: bodyColor }}>`);
rep(`            <div className="mt-8 max-w-sm">
              <ExperienceTasksDisplay
                tasks={displayTasks}
                display={flags.tasksDisplay}
                bodyColor={bodyColor}
                mutedColor={muted}
                isDark={flags.isDark}
                label=""
                size="md"
              />`,`            <div className="mt-6 max-w-md">
              <ExperienceTasksDisplay
                tasks={displayTasks}
                display={flags.tasksDisplay}
                bodyColor={bodyColor}
                mutedColor={muted}
                isDark={flags.isDark}
                label=""
                size="md"
                legibleMarkers
              />`);
fs.writeFileSync(f,s.replace(/\n/g,eol));console.log('ok');
