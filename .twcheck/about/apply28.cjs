const fs=require('fs'),path=require('path');
const f=path.join(__dirname,'..','..','components/portfolio/portfolio-experience-lists.tsx');
let s=fs.readFileSync(f,'utf8');const eol=s.includes('\r\n')?'\r\n':'\n';s=s.replace(/\r\n/g,'\n');
const rep=(a,b)=>{if(s.split(a).length!==2)throw new Error('need one: '+a.slice(0,70));s=s.replace(a,b);};
rep(`            <p className="mt-4 max-w-md text-[1rem] leading-[1.65]" style={{ color: bodyColor }}>`,`            // The description is context: the softer secondary colour, so the task list below it reads first.
            <p className="mt-4 max-w-md text-[1rem] leading-[1.65]" style={{ color: muted }}>`);
rep(`                tasks={displayTasks}
                display={flags.tasksDisplay}
                bodyColor={bodyColor}
                mutedColor={muted}
                isDark={flags.isDark}
                label=""
                size="md"
                legibleMarkers`,`                tasks={displayTasks}
                display={flags.tasksDisplay}
                bodyColor={ink}
                mutedColor={muted}
                isDark={flags.isDark}
                label=""
                size="md"
                legibleMarkers`);
fs.writeFileSync(f,s.replace(/\n/g,eol));console.log('ok');
