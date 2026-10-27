const fs=require('fs'),path=require('path');
const f=path.join(__dirname,'..','..','components/portfolio/portfolio-experience-settings-panel.tsx');
let s=fs.readFileSync(f,'utf8');const eol=s.includes('\r\n')?'\r\n':'\n';s=s.replace(/\r\n/g,'\n');
let n=0;
s=s.replace(/<ExperienceScalePill(\n\s+label=\{t\('[^']+'\)\}\n\s+options=\{[A-Z_]+\}\n)(\s+)sizes=\{\[([0-9, ]+)\]\}/g,(m,head,indent,sizes)=>{n++;return `<ExperienceOptionGrid${head}${indent}columns={${sizes.split(',').length}}`;});
console.log('replaced',n);
// drop the now-unused ExperienceScalePill component
const start=s.indexOf('function ExperienceScalePill<T extends string>({');
if(start<0)throw new Error('no def');
const rest=s.slice(start);
const endMarker='\n}\n';
const endIdx=rest.indexOf(endMarker);
const block=rest.slice(0,endIdx+endMarker.length);
if(s.split('ExperienceScalePill').length-1!==block.split('ExperienceScalePill').length-1)throw new Error('still referenced');
s=s.slice(0,start)+rest.slice(block.length).replace(/^\n/,'');
fs.writeFileSync(f,s.replace(/\n/g,eol));console.log('ok');
