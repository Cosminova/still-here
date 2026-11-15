/**
 * Low-angle views of the surface craft, to prove they stand on the ground
 * rather than in it, plus a rough frame rate at each stop.
 *
 *   node scripts/side-check.mjs [--only=surveyor3,spirit]
 */
import { mkdirSync } from 'node:fs';
import puppeteer from 'puppeteer-core';

const URL = 'http://127.0.0.1:5191/index.html?home=0&story=1';
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const only = (process.argv.find((a) => a.startsWith('--only=')) ?? '--only=surveyor3,apollo11,spirit,insight')
  .slice(7).split(',').filter(Boolean);

mkdirSync('shots/side', { recursive: true });
const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--headless=new', '--no-sandbox', '--use-gl=angle'],
  defaultViewport: { width: 1280, height: 800 },
});
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 300)); });
await page.goto(URL, { waitUntil: 'networkidle2', timeout: 120000 });
await page.waitForFunction(() => window.stillHere && window.cosminova?.ready, { timeout: 120000 });

const ids = await page.evaluate(() => window.stillHere.chapters.map((c) => c.id));
for (const id of only) {
  const index = ids.indexOf(id);
  if (index < 0) continue;
  await page.evaluate((i) => window.stillHere.goTo(i), index);
  await new Promise((r) => setTimeout(r, 10000));
  await page.evaluate(() => {
    const c = window.cosminova.controls;
    c.stopFlight?.();
    c.pitch = 0.06;
    c.pitchVelocity = 0;
    c.distanceRadii *= 0.8;
    document.querySelector('.story')?.setAttribute('hidden', '');
  });
  await new Promise((r) => setTimeout(r, 2500));
  const fps = await page.evaluate(() => new Promise((resolve) => {
    let frames = 0;
    const start = performance.now();
    const tick = () => {
      frames += 1;
      if (performance.now() - start < 3000) requestAnimationFrame(tick);
      else resolve(Math.round((frames / (performance.now() - start)) * 1000));
    };
    requestAnimationFrame(tick);
  }));
  console.log(`${id.padEnd(12)} fps ${fps}`);
  await page.screenshot({ path: `shots/side/${id}.png` });
  await page.evaluate(() => document.querySelector('.story')?.removeAttribute('hidden'));
}
for (const e of errors) console.log('error:', e);
await browser.close();
