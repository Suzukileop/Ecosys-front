const {chromium}=require('@playwright/test');
const fs=require('node:fs');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true});
 try {
  const page=await browser.newPage();
  const css=fs.readFileSync('components/portfolio/portfolio-experience-duotone-polish.module.css','utf8');
  for(const width of [320,390,768,1440]) for(const status of ['signature','stamp']) {
   await page.setViewportSize({width,height:900});
   await page.setContent(`<style>*{box-sizing:border-box}body{margin:0;padding:24px;background:#16130e;color:#e9e6df;font-family:Arial}p{margin:0}main{max-width:680px;margin:auto}.lead{display:flex;flex-direction:column}h3{margin:0}.image{height:200px;background:#333}${css}</style><main><div class="lead"><div><h3>Automatisation du numéro de pension</h3><div class="titleMeta" data-status="${status}" style="margin-top:20px"><span class="titlePeriod">2023—2026</span><span>Studio · Antananarivo · Full-time</span><span class="titleStatus">En cours</span></div></div><div class="image"></div></div><div class="tasks"><ul><li data-exp-task><span>01</span><span>Créer une interface claire pour les utilisateurs</span></li></ul></div><div class="tools">TypeScript · React · Java</div></main>`);
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`overflow at ${width}/${status}`);
   const heading=await page.locator('h3').boundingBox();
   const meta=await page.locator('.titleMeta').boundingBox();
   const image=await page.locator('.image').boundingBox();
   assert.equal(Math.round(meta.y-heading.y-heading.height),20,`Title spacing ${width}/${status}`);
   assert.equal(Math.round(image.y-meta.y-meta.height),24,`Image spacing ${width}/${status}`);
   assert.equal(await page.locator('[data-exp-task] > span:last-child').evaluate(el=>getComputedStyle(el).fontWeight),'400');
  }
  console.log('PASS Duotone: both statuses at 320/390/768/1440px, no overflow or metadata overlap, regular task weight.');
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
