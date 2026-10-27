const {chromium}=require('@playwright/test');const fs=require('node:fs');const ts=require('typescript');const assert=require('node:assert/strict');
(async()=>{
 const source=fs.readFileSync('components/portfolio/portfolio-experience-lists.tsx','utf8');
 const start=source.indexOf('    const update = () => {',source.indexOf('export function CardsExperienceList'));
 const end=source.indexOf('    const schedule = () =>',start);
 const code=ts.transpileModule(source.slice(start,end),{compilerOptions:{target:ts.ScriptTarget.ES2020}}).outputText;
 const css=fs.readFileSync('components/portfolio/portfolio-experience-cards.module.css','utf8');
 const browser=await chromium.launch({headless:true});try{
  const page=await browser.newPage({viewport:{width:1200,height:900}});
  await page.setContent(`<style>body{margin:0}.stack{height:1800px}.card{position:absolute;top:100px;left:100px;width:900px;height:600px;background:white;border:1px solid #ddd}${css}</style><div class="stack">${[1,2,3].map(i=>`<article class="card pf-exp-cards-stack-card" style="z-index:${i};top:${i===3?1000:100}px"><button>Card ${i}</button></article>`).join('')}</div>`);
  const run=()=>page.evaluate(code=>{const stack=document.querySelector('.stack');const cards=Array.from(stack.querySelectorAll('article'));new Function('stack','cards','getScrollParent','let frame=0;'+code+';update();')(stack,cards,()=>null);},code);
  await run();await page.waitForTimeout(500);
  assert.equal(await page.locator('[data-cards-central="true"]').count(),1);
  assert.equal(await page.locator('[data-cards-central="true"] button').textContent(),'Card 2');
  assert.deepEqual(await page.locator('article').evaluateAll(es=>es.map(e=>getComputedStyle(e).opacity)),['1','1','1']);
  assert.deepEqual(await page.locator('article').evaluateAll(es=>es.map(e=>getComputedStyle(e).filter)),['blur(0.8px)','blur(0px)','blur(0.8px)']);
  await page.getByRole('button',{name:'Card 1'}).focus();await run();
  assert.equal(await page.locator('[data-cards-central="true"]').count(),1);
  assert.equal(await page.locator('[data-cards-central="true"] button').textContent(),'Card 1');
  await page.setViewportSize({width:390,height:844});
  await page.waitForTimeout(500);
  assert.deepEqual(await page.locator('article').evaluateAll(es=>es.map(e=>getComputedStyle(e).filter)),['none','none','none']);
  console.log('PASS: exactly one central card; foreground wins overlap; opacity stays 1; gentle blur; keyboard focus remains unique');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
