const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const {chromium}=require('@playwright/test'),wp=require('next/dist/compiled/webpack/webpack'),postcss=require('postcss');
async function main(){
 const dir=__dirname,base=path.resolve(dir,'..');
 const css=await postcss([require('@tailwindcss/postcss')({base}),require('../postcss-tailwind-variants-last.cjs')]).process(fs.readFileSync(path.join(base,'app/globals.css'),'utf8'),{from:path.join(base,'app/globals.css')});
 await new Promise((resolve,reject)=>wp.webpack({mode:'development',devtool:false,entry:path.join(dir,'entry.tsx'),output:{path:path.join(dir,'build'),filename:'team.js',publicPath:''},
  resolve:{extensions:['.tsx','.ts','.js'],alias:{'@/lib/i18n/I18nProvider':path.join(dir,'../.team-rail-check/i18n.ts'),'next/dynamic':path.join(dir,'../.team-rail-check/dynamic.tsx'),'@':base}},plugins:[new wp.webpack.DefinePlugin({'process.env':JSON.stringify({NODE_ENV:'development'})})],
  module:{rules:[{test:/\.tsx?$/,use:path.join(dir,'../.masonry-check/loader.cjs')}]}
 },(err,stats)=>err||stats.hasErrors()?reject(err||new Error(stats.toString())):resolve()));
 const browser=await chromium.launch({headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('http://portrait.test/**',route=>route.fulfill({contentType:'image/jpeg',body:fs.readFileSync(path.join(base,'public/landing/hero/hero-freelance.jpg'))}));
  await page.setContent('<div id="root"></div>');
  await page.addStyleTag({content:css.css+'body{padding:48px;font-family:Arial,sans-serif}@media(max-width:768px){body{padding:20px}}'});
  await page.addScriptTag({path:path.join(dir,'build/team.js')});
  await page.locator('article').first().waitFor();await page.waitForTimeout(1000);
  await page.screenshot({path:path.join(dir,process.env.CAPTURE_ONLY?'before.png':'after.png'),fullPage:true});
  if(process.env.CAPTURE_ONLY)return;
  for(const mode of ['light','dark'])for(const count of [1,2,3,4,5,12]){
   await page.evaluate(({mode,count})=>window.renderTeam(count,{activeColorMode:mode,longText:true}),{mode,count});await page.waitForTimeout(1200);
   for(const width of [320,375,768,1024,1440,1920]){
    await page.setViewportSize({width,height:1000});await page.waitForTimeout(50);
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`Overflow at ${mode}/${count}/${width}`);
    assert.equal(await page.locator('article').count(),count);
    assert(await page.locator('article').evaluateAll(nodes=>nodes.every(el=>el.getBoundingClientRect().height-el.querySelector('.team-veil-stack').getBoundingClientRect().height<=4)),'Neighbouring cards must not stretch and leave a blank strip');
    assert(await page.locator('.team-veil-caption').evaluateAll(nodes=>nodes.every(el=>{
      const stack=el.closest('.team-veil-stack');
      return el.offsetTop>=0&&el.offsetTop+el.offsetHeight<=stack.clientHeight+1;
    })),'Caption must stay fully inside the card');
    if(mode==='light'&&count===4&&width===375)await page.screenshot({path:path.join(dir,'mobile.png'),fullPage:true});
   }
  }
  const first=page.locator('article').first();
  await first.hover();await page.waitForTimeout(550);
  assert.equal(await first.locator('.team-veil-caption').evaluate(el=>getComputedStyle(el).opacity),'1');
  assert(await first.locator('.team-veil-caption').evaluate(el=>{
    const values=getComputedStyle(el).backgroundColor.match(/[\d.]+/g).map(Number),alpha=values[3]??1;
    const channels=values.slice(0,3).map(v=>(v*alpha+255*(1-alpha))/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);
    const lum=channels.reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
    return 1.05/(lum+.05)>=4.5;
  }),'White captions must clear 4.5:1 even over a white photograph');
  await page.screenshot({path:path.join(dir,'hover.png'),fullPage:true});
  await page.mouse.move(0,0);await page.waitForTimeout(550);
  assert.equal(await first.locator('.team-veil-caption').evaluate(el=>getComputedStyle(el).opacity),'0');
  await first.focus();await page.waitForTimeout(550);
  assert.equal(await first.locator('.team-veil-caption').evaluate(el=>getComputedStyle(el).opacity),'1');
  await page.locator('article').nth(2).focus();await page.waitForTimeout(550);
  assert.equal(await page.locator('article').nth(2).locator('.team-veil-caption').evaluate(el=>getComputedStyle(el).opacity),'1','A card without social links must also reveal on keyboard focus');
  const touch=await browser.newPage({viewport:{width:375,height:1000},hasTouch:true,isMobile:true});
  await touch.route('http://portrait.test/**',route=>route.fulfill({contentType:'image/jpeg',body:fs.readFileSync(path.join(base,'public/landing/hero/hero-freelance.jpg'))}));
  await touch.setContent('<meta name="viewport" content="width=device-width,initial-scale=1"><div id="root"></div>');
  await touch.addStyleTag({content:css.css+'body{padding:20px;font-family:Arial,sans-serif}'});
  await touch.addScriptTag({path:path.join(dir,'build/team.js')});await touch.waitForTimeout(1400);
  assert(await touch.locator('.team-veil-caption').evaluateAll(nodes=>nodes.every(el=>getComputedStyle(el).opacity==='1')),'Touch captions must always be visible');
  await touch.screenshot({path:path.join(dir,'touch.png'),fullPage:true});await touch.close();
  await page.emulateMedia({reducedMotion:'reduce'});
  assert.equal(await page.locator('.team-veil-photo').first().evaluate(el=>getComputedStyle(el).transitionDuration),'0s');
  await page.locator('article a').first().focus();
  assert(await page.locator('article a').first().evaluate(el=>el===document.activeElement));
  for(const hoverVeilColumns of [2,3,4])for(const [hoverVeilGutter,expected] of Object.entries({sm:12,md:48,lg:96,xl:160})){
    await page.setViewportSize({width:1440,height:1000});
    await page.evaluate(options=>window.renderTeam(6,options),{hoverVeilColumns,hoverVeilGutter,hoverVeilStagger:false});await page.waitForTimeout(60);
    assert.equal(await page.locator('.team-profile-grid').evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').length),hoverVeilColumns);
    const cards=await page.locator('article').evaluateAll(nodes=>nodes.slice(0,2).map(el=>{const r=el.getBoundingClientRect();return{left:r.left,right:r.right}}));
    assert(Math.abs(cards[1].left-cards[0].right-expected)<1,`Veil gap must be ${expected}`);
  }
  for(const [hoverVeilRatio,ratio] of Object.entries({square:1,soft:1.25,portrait:4/3,tall:1.5,xtall:16/9})){
    await page.evaluate(options=>window.renderTeam(4,options),{hoverVeilRatio,hoverVeilPanel:'always'});await page.waitForTimeout(60);
    const size=await page.locator('.team-veil-media').first().boundingBox();
    assert(Math.abs(size.height/size.width-ratio)<.01);
    assert.equal(await page.locator('.team-veil-caption').first().evaluate(el=>getComputedStyle(el).opacity),'1');
  }
  for(const hoverVeilView of ['grid','rail'])for(const hoverVeilShowNumbers of [false,true]){
    const saved=await page.evaluate(patch=>window.mergeTeam(patch),{hoverVeilView,hoverVeilShowNumbers,profileCardsShowNumbers:!hoverVeilShowNumbers});
    assert.equal(saved.hoverVeilShowNumbers,hoverVeilShowNumbers);
    assert.equal(saved.profileCardsShowNumbers,!hoverVeilShowNumbers);
    await page.evaluate(options=>window.renderTeam(4,options),{hoverVeilView,hoverVeilShowNumbers});await page.waitForTimeout(60);
    assert.equal(await page.locator('.team-veil-index').count(),hoverVeilShowNumbers?4:0);
  }
  assert.deepEqual(await page.evaluate(()=>window.toVeilPatch({profileCardsColumns:4,profileCardsShowNumbers:false})),{hoverVeilColumns:4,hoverVeilShowNumbers:false});
  await page.evaluate(()=>window.renderTeam(6,{hoverVeilView:'grid',hoverVeilVisible:'4'}));await page.waitForTimeout(60);
  assert.equal(await page.locator('article').count(),4);
  await page.getByRole('button',{name:/View all/}).click();assert.equal(await page.locator('article').count(),6);
  await page.getByRole('button',{name:'Show less',exact:true}).click();assert.equal(await page.locator('article').count(),4);
  await page.getByRole('button',{name:'Rail',exact:true}).click();await page.waitForTimeout(60);
  const rail=page.getByRole('region',{name:'Team members'});
  await rail.focus();await page.keyboard.press('End');await page.waitForTimeout(60);assert(await rail.evaluate(el=>el.scrollLeft>0));
  await page.keyboard.press('Home');await page.waitForTimeout(60);assert(await rail.evaluate(el=>el.scrollLeft<=1));
  await page.evaluate(()=>window.renderTeam(4,{showImage:false,showSocials:false}));await page.waitForTimeout(60);
  assert.equal(await page.locator('img,a').count(),0);
  await page.evaluate(()=>window.renderTeam(0));await page.waitForTimeout(60);assert.equal(await page.locator('article').count(),0);
  assert.equal(errors.length,0,errors.join('\n'));
  console.log('PASS: Hover veil 0/1/2/3/4/5/12 members, 320–1920, light/dark, long text, visible 44px links, media/social toggles.');
 }finally{await browser.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
