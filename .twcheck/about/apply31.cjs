const fs=require('fs'),path=require('path');
const f=path.join(__dirname,'..','..','components/portfolio/portfolio-experience-lists.tsx');
let s=fs.readFileSync(f,'utf8');const eol=s.includes('\r\n')?'\r\n':'\n';s=s.replace(/\r\n/g,'\n');
const rep=(a,b)=>{if(s.split(a).length!==2)throw new Error('need one: '+a.slice(0,70));s=s.replace(a,b);};
const SC='var(--pf-experience-font-scale,1)';
rep(`className="font-semibold tabular-nums leading-none tracking-[-0.035em] text-[clamp(2.35rem,5.5vw,3.35rem)]"`,`// Display sizes are written as one calc() class: the shared "#experience .text-*" overrides only cover
             // body text (< 1.5rem), so the year never followed the Text size setting.
             className="font-semibold tabular-nums leading-none tracking-[-0.035em] text-[length:calc(clamp(2.35rem,5.5vw,3.35rem)*${SC})]"`);
rep(`text-[1.45rem] font-semibold leading-[1.12] tracking-[-0.035em] sm:text-[1.75rem] lg:col-start-1 lg:row-start-1 lg:text-[2rem]"`,`text-[length:calc(1.45rem*${SC})] font-semibold leading-[1.12] tracking-[-0.035em] sm:text-[length:calc(1.75rem*${SC})] lg:col-start-1 lg:row-start-1 lg:text-[length:calc(2rem*${SC})]"`);
fs.writeFileSync(f,s.replace(/\n/g,eol));console.log('ok');
