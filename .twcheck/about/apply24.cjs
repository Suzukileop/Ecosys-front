const fs=require('fs'),path=require('path');const root=path.join(__dirname,'..','..');
function edit(rel,fn){const f=path.join(root,rel);let s=fs.readFileSync(f,'utf8');const eol=s.includes('\r\n')?'\r\n':'\n';s=s.replace(/\r\n/g,'\n');
const rep=(a,b)=>{if(!s.includes(a))throw new Error(rel+' missing '+a.slice(0,60));s=s.replace(a,b);};fn(rep);fs.writeFileSync(f,s.replace(/\n/g,eol));}
edit('components/portfolio/portfolio-experience-lists.tsx',rep=>{
rep(`px-3 py-1 text-[0.62rem]' : 'px-3.5 py-1.5 text-[0.68rem]'`,`px-3 py-1 text-[0.75rem]' : 'px-3.5 py-1.5 text-[0.75rem]'`);
rep(`{ backgroundColor: \`color-mix(in srgb, \${accentColor} 14%, transparent)\`, color: accentColor }`,`{ backgroundColor: \`color-mix(in srgb, \${accentColor} 14%, transparent)\`, color: \`color-mix(in srgb, \${accentColor} 72%, \${isDark ? '#fff' : '#000'})\` }`);
rep(`{ backgroundColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.55)' }`,`{ backgroundColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.72)' }`);
rep(`{ backgroundColor: 'rgba(0,0,0,0.06)', color: 'rgba(0,0,0,0.55)' }`,`{ backgroundColor: 'rgba(0,0,0,0.06)', color: 'rgba(0,0,0,0.68)' }`);
rep(`<div className="max-w-xs [&_.pf-exp-tools-pill]:!text-[0.75rem]">`,`<div className="max-w-xs">`);
});
edit('components/portfolio/portfolio-link-buttons.tsx',rep=>{rep(`fontSize: '0.72rem',
        letterSpacing: '0.18em',`,`fontSize: '0.75rem',
        letterSpacing: '0.16em',`);});
console.log('ok');
