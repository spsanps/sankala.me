import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
const browser = await chromium.launch();
for (const [name,origin,directory] of [['san','http://127.0.0.1:4182',new URL('./',import.meta.url).pathname],['paper','http://127.0.0.1:4183','/home/san/Projects/paper-robots/site/design/reviews/2026-09-studio/']]) {
 await mkdir(directory,{recursive:true});
 for (const width of [1440,390]) {
  const page=await browser.newPage({viewport:{width,height:1000}});
  await page.goto(origin,{waitUntil:'networkidle'});
  await page.screenshot({path:directory+name+'-'+width+'-cover.png'});
  await page.locator('img').evaluateAll(images=>images.forEach(image=>image.loading='eager'));
  await page.evaluate(()=>Promise.all([...document.images].map(image=>image.decode().catch(()=>{}))));
  await page.screenshot({path:directory+name+'-'+width+'-full.png',fullPage:true});
  if(name==='san' && width===1440) { await page.locator('#history').scrollIntoViewIfNeeded(); await page.evaluate(()=>scrollTo(0,document.getElementById('history').offsetTop-30)); await page.screenshot({path:directory+'career-1440.png'}); }
  await page.close();
 }
}
await browser.close();
