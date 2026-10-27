const fs=require('node:fs');
const assert=require('node:assert/strict');
const ts=require('typescript');
const React=require('react');
const {renderToStaticMarkup}=require('react-dom/server');
const {chromium}=require('@playwright/test');
const source=fs.readFileSync('components/portfolio/portfolio-experience-lists.tsx','utf8');
const code=ts.transpileModule(source.slice(source.indexOf('function GalleryStack('),source.indexOf('function GalleryExperienceModal(')),{compilerOptions:{jsx:ts.JsxEmit.React,target:ts.ScriptTarget.ES2020}}).outputText;
const styles=new Proxy({},{get:(_,key)=>key});
const content={period:'2024',title:'Automatisation du numéro de pension',organization:'Finance',description:'Une description suffisamment longue pour vérifier la hiérarchie de lecture.',status:'FINISHED',tasks:['Créer une interface','Vérifier les informations'],tools:['TypeScript','React'],links:[{url:'https://example.com',label:'View project'}],location:'Antananarivo'};
const mocks={React,useT:()=>s=>s,DEFAULT_EXPERIENCE_PRESENTATION:{},galleryPolish:styles,editorialStatus:styles,
 resolveExperienceContent:()=>content,employmentTypeLabel:()=>'',experienceBlockLabelVisible:(p,k)=>p.blockLabelVisibility?.[k]!==false,resolveExperienceBlockLabel:(s,f)=>s||f,
 ExperienceToolsDisplay:({tools})=>React.createElement('ul',{},tools.map(t=>React.createElement('li',{key:t},t))),
 ShowcaseExperienceStatus:()=>React.createElement('span',{},'Done'),
 ExperienceTasksDisplay:({display,label})=>React.createElement('div',{'data-task-display':display},label),
 KineticRepoLink:({shape,hover,label,href})=>React.createElement('a',{href,'data-shape':shape,'data-hover':hover},label),
 showcaseExperienceProofLabel:(s,f)=>s||f,ProductThumbnailMedia:()=>React.createElement('div',{'data-image':true}),experienceCardsBorderRadiusClass:()=>''};
const {GalleryExperienceCard:Card,GalleryDetailContent:Detail}=new Function(...Object.keys(mocks),`${code};return {GalleryExperienceCard,GalleryDetailContent};`)(...Object.values(mocks));
const flags={showTitle:true,showPeriod:true,showOrganization:true,showMeta:true,showDescription:true,showTasks:true,showTools:true,showProof:true,showEntryMedia:true,tasksDisplay:'editorial-dash'};
for(const enabled of [true,false]){
 const html=renderToStaticMarkup(React.createElement(Card,{block:{mediaUrl:'image.png'},accent:'#f00',secondaryColor:'#0a8',titleColor:'#111',mutedColor:'#555',border:'#ccc',isDark:false,flags:{...flags,galleryPresentation:{galleryDetailsEnabled:enabled}},thumbnailFit:'cover',thumbnailRadius:'none',hoverEffect:'magnetic',onOpen:()=>{}}));
 assert(html.startsWith(enabled?'<button':'<article'));
 assert.equal(html.includes('aria-haspopup="dialog"'),enabled);
 assert.equal(html.includes('pf-loft-magnetic-cue'),enabled);
}
for(const shape of ['link','rectangle','pill'])for(const hover of ['wipe','roll']){
 const html=renderToStaticMarkup(React.createElement(Detail,{block:{},ink:'#111',muted:'#555',accent:'#f00',secondary:'#0a8',border:'#ccc',cardBg:'#fff',isDark:false,flags:{...flags,galleryPresentation:{galleryButtonShape:shape,galleryButtonHover:hover,galleryButtonLabel:'Découvrir',tasksLabel:'Missions',toolsLabel:'Technologies'}}}));
 assert(html.includes(`data-shape="${shape}"`)&&html.includes(`data-hover="${hover}"`));
 assert(html.includes('Découvrir')&&html.includes('Missions')&&html.includes('Technologies'));
}
(async()=>{
 const browser=await chromium.launch();
 try{
  const page=await browser.newPage();
  const css=fs.readFileSync('components/portfolio/portfolio-experience-gallery-polish.module.css','utf8').replace(/:global\(([^)]+)\)/g,'$1');
  for(const width of [320,390,1440]){
   await page.setViewportSize({width,height:900});
   await page.setContent(`<style>*{box-sizing:border-box}body{margin:0;padding:16px}.grid{display:grid;grid-template-columns:1fr;gap:24px}.modal{display:flex;flex-direction:column;max-height:88vh;overflow:hidden}.media{height:224px;flex-shrink:0}.modalCopy{min-height:0;overflow-y:auto;flex:1;padding:36px}@media(min-width:640px){.grid{grid-template-columns:1fr 1fr}.modal{flex-direction:row}.media{height:auto;width:56%}}${css}</style><div class="grid" data-staggered="true" data-columns="2"><div class="entry">Card 1</div><div class="entry">Card 2</div></div><div class="modal"><div class="media">Image</div><div class="modalCopy"><div class="detail"><h3>Automatisation du numéro de pension</h3>${'<p class="description">Une description et des tâches avec du contenu lisible.</p>'.repeat(16)}<a href="#">Voir le projet</a></div></div></div>`);
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`overflow ${width}`);
   const second=await page.locator('.entry').nth(1).evaluate(el=>parseFloat(getComputedStyle(el).marginTop));
   assert.equal(second,width>=1100?48:0);
   const modal=await page.locator('.modal').boundingBox();assert(modal.height<=810,`Modal too tall ${width}`);
   if(width<640){assert(await page.locator('.modal').evaluate(el=>el.scrollHeight>el.clientHeight),'Mobile details must scroll');}
  }
 }finally{await browser.close()}
 console.log('PASS Gallery: actual card toggle semantics, button styles/hover/custom label, block labels, responsive stagger and modal scrolling at 320/390/1440px.');
})().catch(e=>{console.error(e);process.exitCode=1});
