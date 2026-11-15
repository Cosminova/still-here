// node scripts/_sbshot.mjs <preset> <wait1,wait2,...> [evalBefore]
import fs from 'node:fs';
import puppeteer from 'puppeteer-core';

const CHROME = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const [preset = 'solar', waits = '2', before = ''] = process.argv.slice(2);
const W = Number(process.env.W || 1400);
const H = Number(process.env.H || 860);
fs.mkdirSync('/tmp/sb', { recursive: true });

const browser = await puppeteer.launch({
  executablePath: CHROME,
  args: ['--headless=new', '--no-sandbox', '--use-gl=angle', '--hide-scrollbars'],
  defaultViewport: { width: W, height: H, deviceScaleFactor: 1 },
  protocolTimeout: 120000,
});
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errors.push(`${m.type()}: ${m.text()}`); });
await page.goto(`http://127.0.0.1:5180/sandbox.html`, { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => window.sandbox && document.getElementById('loading')?.classList.contains('is-done'), { timeout: 90000 });
await page.evaluate((p) => {
  document.getElementById('home-start')?.click();
  window.sandbox.app.loadPreset(p);
}, preset);
if (before) await page.evaluate(before);
let i = 0;
for (const w of waits.split(',')) {
  await new Promise((r) => setTimeout(r, Number(w) * 1000));
  const stats = await page.evaluate(() => {
    const { sim, app } = window.sandbox;
    return {
      t: sim.time.toFixed(0), bodies: sim.bodies.length, majors: sim.majors.length, minors: sim.minors.length,
      steps: sim.lastSteps, limited: sim.limited, rate: app.state.actualRate.toExponential(2),
      names: sim.majors.slice(0, 12).map((b) => `${b.name}:${(b.mass).toExponential(2)}:${Math.round(b.temp)}K`),
    };
  });
  const file = `/tmp/sb/${preset}-${i++}.png`;
  await page.screenshot({ path: file });
  console.log(file, JSON.stringify(stats));
}
if (process.env.EVAL_AFTER) console.log(await page.evaluate(process.env.EVAL_AFTER));
console.log('errors:', JSON.stringify(errors.slice(0, 12)));
await browser.close();
