import { chromium } from 'playwright';
import { readFile } from 'node:fs/promises';
const [input,output]=process.argv.slice(2);
if(!input || !output) throw new Error('Usage: node scripts/publishing/render-social-card.mjs source.html destination.jpg (start the local preview server first)');
const browser=await chromium.launch();
try { const page=await browser.newPage({viewport:{width:1200,height:630},deviceScaleFactor:1});
  await page.setContent(await readFile(input,'utf8'),{waitUntil:'networkidle'});
  await page.evaluate(()=>document.fonts.ready);
  const missing=await page.locator('img').evaluateAll(imgs=>imgs.filter(i=>!i.complete || !i.naturalWidth).length);
  if(missing) throw new Error('Social card has missing images');
  await page.screenshot({path:output,type:'jpeg',quality:92});
} finally { await browser.close(); }
