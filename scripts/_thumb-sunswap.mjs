import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';

const bg = path.resolve(process.argv[2]);
const out = path.resolve(process.argv[3] ?? 'video/THUMB-sun-swap.png');
const img = `data:image/png;base64,${fs.readFileSync(bg).toString('base64')}`;

const html = `<!doctype html><html><body style="margin:0">
<div style="position:relative;width:1280px;height:720px;overflow:hidden;font-family:'Arial Black',Impact,sans-serif">
  <img src="${img}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;
    filter:brightness(1.08) saturate(1.7) contrast(1.2)">
  <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 62% 70%,transparent 30%,rgba(0,0,0,.55) 100%)"></div>
  <div style="position:absolute;left:44px;top:34px;line-height:.95;text-transform:uppercase;
      color:#fff;font-size:96px;letter-spacing:-2px;
      -webkit-text-stroke:4px #000;paint-order:stroke fill;text-shadow:0 8px 24px rgba(0,0,0,.8)">
    What if<br><span style="color:#ffd21f">this</span> was<br>our <span style="color:#ff3b1f">Sun?</span>
  </div>
  <svg width="1280" height="720" style="position:absolute;inset:0">
    <defs><marker id="h" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
      <path d="M0,0 L6,3 L0,6 z" fill="#ff2a1a" stroke="#000" stroke-width=".6"/></marker></defs>
    <path d="M615 205 Q700 240 648 372" fill="none" stroke="#000" stroke-width="22" stroke-linecap="round"/>
    <path d="M615 205 Q700 240 648 372" fill="none" stroke="#ff2a1a" stroke-width="14" stroke-linecap="round" marker-end="url(#h)"/>
  </svg>

</div></body></html>`;

const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  args: ['--headless=new'],
  defaultViewport: { width: 1280, height: 720 },
});
const page = await browser.newPage();
await page.setContent(html, { waitUntil: 'load' });
await page.screenshot({ path: out });
await browser.close();
console.log(out);
