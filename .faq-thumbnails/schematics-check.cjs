const fs=require('fs'),path=require('path'),ts=require('typescript'),React=require('react'),{renderToStaticMarkup}=require('react-dom/server'),assert=require('node:assert/strict');
const source=fs.readFileSync(path.join(__dirname,'../components/portfolio/portfolio-faq-design-thumbnail.tsx'),'utf8');
const js=ts.transpileModule(source,{compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.CommonJS}}).outputText;
const mod={exports:{}};new Function('require','module','exports',js)(require,mod,mod.exports);
const designs=['kinetic-split','floating-gallery','editorial-masonry','prism-cards','star-scroll','tri-grid','split-index','centered-focus','bento-dual'];
const outputs=new Set();
for(const design of designs){
 const html=renderToStaticMarkup(React.createElement(mod.exports.FaqDesignThumbnail,{design}));
 if(design==='kinetic-split'){assert(html.includes('kinetic-questions-light.webp'));assert(!html.includes('<iframe'));continue;}
 assert(!/<img|<iframe|<animate/.test(html));
 for(const color of ['orange','blue'])assert.equal((html.match(new RegExp('data-thumbnail-accent="'+color+'"','g'))||[]).length,1,design+' '+color);
 for(const [,attrs]of html.matchAll(/<rect([^>]*)>/g)){
  const a=Object.fromEntries([...attrs.matchAll(/([\w-]+)="([^"]*)"/g)].map(x=>[x[1],x[2]]));
  assert(Number(a.x||0)+Number(a.width)<=1000,design+' horizontal bounds');
  assert(Number(a.y||0)+Number(a.height)<=365,design+' vertical bounds');
 }
 outputs.add(html.replace(/data-faq-static-preview="[^"]*"/g,''));
}
assert.equal(outputs.size,8);
console.log('PASS: Kinetic image prototype and 8 distinct FAQ diagrams, bounded geometry, no iframe/animation.');
