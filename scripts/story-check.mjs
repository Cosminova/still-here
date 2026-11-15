/**
 * Walks the whole story in headless Chrome: every chapter is flown to, given
 * time to arrive, photographed into shots/story/, and checked for the things a
 * screenshot alone would not prove — that the craft is actually placed at the
 * chosen date, that the camera ended up on it, and that nothing threw.
 *
 *   npm run build && npx vite preview --port 5191 &
 *   node scripts/story-check.mjs [--only=apollo11,dawn]
 */
import { mkdirSync } from 'node:fs';
import puppeteer from 'puppeteer-core';

const URL = process.env.STORY_URL ?? 'http://127.0.0.1:5191/index.html?home=0&story=1';
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const SETTLE_MS = Number(process.env.STORY_SETTLE_MS ?? 4000);
const FLIGHT_MS = 7000;
const only = (process.argv.find((a) => a.startsWith('--only=')) ?? '').slice(7).split(',').filter(Boolean);

mkdirSync('shots/story', { recursive: true });
const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--headless=new', '--no-sandbox', '--use-gl=angle'],
  defaultViewport: { width: 1440, height: 900 },
});
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(`console: ${m.text().slice(0, 300)}`);
});

await page.goto(URL, { waitUntil: 'networkidle2', timeout: 120000 });
await page.waitForFunction(() => window.stillHere && window.cosminova?.ready, { timeout: 120000 });

const chapters = await page.evaluate(() =>
  window.stillHere.chapters.map((c) => ({ id: c.id, target: c.target })),
);
let failures = 0;
for (const [index, chapter] of chapters.entries()) {
  if (only.length && !only.includes(chapter.id)) continue;
  await page.evaluate((i) => window.stillHere.goTo(i), index);
  await new Promise((resolve) => setTimeout(resolve, FLIGHT_MS + SETTLE_MS));
  const report = await page.evaluate((target) => {
    const api = window.cosminova;
    const key = target.startsWith('craft:') ? target.slice(6) : null;
    const item = key ? api.craftField.get(key) : null;
    return {
      date: api.state.date.toISOString().slice(0, 16),
      selected: api.state.target,
      present: item ? item.present : null,
      phase: item ? item.phase : null,
      altitudeKm: Number(api.controls.altitudeKm?.toPrecision(3)),
    };
  }, chapter.target);
  const ok = report.selected === chapter.target && report.present !== false;
  if (!ok) failures += 1;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${String(index).padStart(2)} ${chapter.id.padEnd(12)} ${JSON.stringify(report)}`);
  await page.screenshot({ path: `shots/story/${String(index).padStart(2, '0')}-${chapter.id}.png` });
}

for (const error of errors) console.log(error);
await browser.close();
if (failures || errors.length) {
  console.log(`\n${failures} chapter(s) failed, ${errors.length} error(s)`);
  process.exit(1);
}
console.log('\nevery chapter arrived cleanly');
