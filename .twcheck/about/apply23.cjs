const fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..','..');
function edit(rel,fn){const f=path.join(root,rel);let s=fs.readFileSync(f,'utf8');const eol=s.includes('\r\n')?'\r\n':'\n';s=s.replace(/\r\n/g,'\n');
const rep=(a,b)=>{if(!s.includes(a))throw new Error(rel+' missing '+a.slice(0,60));s=s.replace(a,b);};fn(rep);fs.writeFileSync(f,s.replace(/\n/g,eol));}
edit('components/portfolio/portfolio-work-settings.ts',rep=>{
rep(`  titleStyle: 'display',
};`,`  titleStyle: 'simple',
};`);
rep(`msg('Oversized, black-weight title (default).')`,`msg('Oversized, black-weight title, overlapping the image.')`);
rep(`msg('A calmer medium-weight title at a moderate size.')`,`msg('A calmer medium-weight title at a moderate size, under the image (default).')`);
rep(`{ value: 'display', label: msg('Display'), description: msg('Oversized, black-weight title, overlapping the image.') },
  { value: 'simple', label: msg('Simple'), description: msg('A calmer medium-weight title at a moderate size, under the image (default).') },`,`{ value: 'simple', label: msg('Simple'), description: msg('A calmer medium-weight title at a moderate size, under the image (default).') },
  { value: 'display', label: msg('Display'), description: msg('Oversized, black-weight title, overlapping the image.') },`);
});
edit('components/portfolio/portfolio-work-projects-frames.tsx',rep=>{
rep(`className="relative w-full overflow-hidden shadow-[0_40px_90px_-40px_rgba(0,0,0,0.55)] max-md`,`className="relative w-full overflow-hidden max-md`);
rep(`        className="relative z-10 -mt-[clamp(0.6rem,3vw,1rem)] md:-mt-[clamp(0.75rem,1.8vw,1.1rem)] lg:-mt-[clamp(0.9rem,1.4vw,1.35rem)]"`,`        className={\`relative z-10 \${
          simpleTitle
            ? 'mt-4 sm:mt-5'
            : '-mt-[clamp(0.6rem,3vw,1rem)] md:-mt-[clamp(0.75rem,1.8vw,1.1rem)] lg:-mt-[clamp(0.9rem,1.4vw,1.35rem)]'
        }\`}`);
});
console.log('ok');
