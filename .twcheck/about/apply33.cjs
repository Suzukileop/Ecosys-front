const fs=require('fs'),path=require('path');
const f=path.join(__dirname,'..','..','components/portfolio/portfolio-experience-lists.tsx');
let s=fs.readFileSync(f,'utf8');const eol=s.includes('\r\n')?'\r\n':'\n';s=s.replace(/\r\n/g,'\n');
const rep=(a,b)=>{if(s.split(a).length!==2)throw new Error('need one: '+a.slice(0,70));s=s.replace(a,b);};
rep("  const softBodyColor = `color-mix(in srgb, ${bodyColor} 68%, transparent)`;\n","  // Description = context (the secondary colour, full strength: a 68% fade of the body colour was too faint);\n  // tasks = the content to read (the strong ink), so the two no longer share one shade.\n  const softBodyColor = mutedColor;\n  const taskInk = titleColor;\n");
rep(`                  bodyColor={softBodyColor}
                  mutedColor={softTaskMuted}
                  isDark={isDark}
                  label={tasksLabel}
                  size="lg"`,`                  bodyColor={taskInk}
                  mutedColor={softTaskMuted}
                  isDark={isDark}
                  label={tasksLabel}
                  size="lg"
                  legibleMarkers`);
fs.writeFileSync(f,s.replace(/\n/g,eol));console.log('ok');
