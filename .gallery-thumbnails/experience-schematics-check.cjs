const fs=require('fs'),path=require('path'),ts=require('typescript'),React=require('react'),{renderToStaticMarkup}=require('react-dom/server'),assert=require('node:assert/strict');
const source=fs.readFileSync(path.join(__dirname,'../components/portfolio/portfolio-experience-design-thumbnail.tsx'),'utf8');
const js=ts.transpileModule(source,{compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.CommonJS}}).outputText;
const mod={exports:{}};
new Function('require','module','exports',js)(require,mod,mod.exports);
const names=['kinetic','editorial','milestone','table','cards','reel','duotone','gallery','loft','press','legacy'];
const outputs=new Set();
for(const design of names){
 const html=renderToStaticMarkup(React.createElement(mod.exports.ExperienceDesignThumbnail,{design}));
 assert(!/<img|<iframe|<animate/.test(html));
 assert(html.includes('viewBox="0 0 1000 365"'));
 assert(html.includes('data-experience-schematic="'+design+'"'));
 assert.equal((html.match(/data-thumbnail-accent="orange"/g)||[]).length,1,design+' orange accent');
 assert.equal((html.match(/data-thumbnail-accent="blue"/g)||[]).length,1,design+' blue accent');
 for(const [,attrs] of html.matchAll(/<rect([^>]*)>/g)){
  const a=Object.fromEntries([...attrs.matchAll(/([\w-]+)="([^"]*)"/g)].map(x=>[x[1],x[2]]));
  assert(Number(a.x||0)+Number(a.width)<=1000,design+' horizontal bounds');
  assert(Number(a.y||0)+Number(a.height)<=365,design+' vertical bounds');
 }
 outputs.add(html.replace(/data-experience-schematic="[^"]*"/g,''));
}
assert.equal(outputs.size,11);
console.log('PASS: 11 distinct static SVG previews, bounded geometry, no image/iframe/animation.');
