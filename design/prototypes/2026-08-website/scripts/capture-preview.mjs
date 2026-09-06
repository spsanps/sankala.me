import { chromium } from 'playwright';
const [,, url, out, full] = process.argv;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(700);
await page.screenshot({ path: out, fullPage: full === 'full' });
await browser.close();
console.log('shot', out);
