/**
 * Plays the story's interactive pages in headless Chrome: opens each one,
 * presses its first control, and records what came back, so a broken choice,
 * activity or future shows up without clicking through the whole journey.
 * Screenshots land in shots/interactive/.
 *
 *   npm run build && npx vite preview --port 5191 &
 *   node scripts/interactive-check.mjs [--only=apollo11,voyager1]
 */
import { mkdirSync } from 'node:fs';
import puppeteer from 'puppeteer-core';

const URL = process.env.STORY_URL ?? 'http://127.0.0.1:5191/index.html?home=0&story=1';
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const only = (process.argv.find((a) => a.startsWith('--only=')) ?? '').slice(7).split(',').filter(Boolean);

// [chapter, page kind or 'activity:name', what to press, ms to wait for the result].
// What to press is a selector, or 'slide' to drag a then-and-now slider, or
// null for a page that answers without being touched.
const CASES = [
  ['surveyor3', 'activity:parts', '.story-extra .story-pin', 600],
  ['surveyor3', 'choice', '.story-option', 500],
  ['apollo11', 'activity:laser', '.story-extra .story-btn.is-primary', 4000],
  ['apollo11', 'future', '.story-option', 500],
  ['kepler', 'activity', '.story-extra .story-btn.is-primary', 3000],
  ['kepler', 'future', '.story-option', 2500],
  ['pathfinder', 'activity', '.story-extra .act-pad .story-btn', 3000],
  ['insight', 'activity:compare', 'slide', 400],
  ['perseverance', 'future', '.story-option', 500],
  ['pioneer10', 'activity', '.story-extra .story-btn.is-primary', 2500],
  ['voyager1', 'activity', '.story-extra .story-btn.is-primary', 2500],
  ['voyager1', 'future', '.story-option', 2500],
  ['epilogue', 'activity:recap', null, 300],
];

mkdirSync('shots/interactive', { recursive: true });
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
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let failures = 0;
for (const [id, kind, selector, settle] of CASES) {
  if (only.length && !only.includes(id)) continue;
  const reached = await page.evaluate(
    (id, match) => {
      const story = window.stillHere;
      const [kind, name] = match.split(':');
      const index = story.chapters.findIndex((c) => c.id === id);
      const step = story.chapters[index].pages.findIndex((p) => p.kind === kind && (!name || p.activity === name));
      if (step < 0) return false;
      if (story.index !== index || story.introPlaying) story.goTo(index);
      while (story.step < step) story.next();
      while (story.step > step) story.back();
      return story.step === step;
    },
    id,
    kind,
  );
  await wait(1200);
  const before = await page.evaluate(() => window.cosminova.state.date.toISOString().slice(0, 10));
  let pressed = false;
  if (reached && selector === 'slide') {
    pressed = await page.evaluate(() => {
      const range = document.querySelector('.story-extra .story-compare-range');
      if (!range) return false;
      range.value = '8';
      range.dispatchEvent(new Event('input', { bubbles: true }));
      return true;
    });
  } else if (reached && selector) {
    const button = await page.waitForSelector(selector, { visible: true, timeout: 10000 }).catch(() => null);
    pressed = Boolean(button) && (await button.click().then(() => true, (error) => {
      console.log(`       could not press ${selector}: ${error.message}`);
      return false;
    }));
  } else {
    pressed = reached;
  }
  await wait(settle);
  const report = await page.evaluate(() => {
    const extra = document.querySelector('.story-extra');
    const out = [...(extra?.querySelectorAll('.story-reply:not([hidden]) p, .act-out, .act-queue, .story-recap li') ?? [])]
      .map((n) => n.textContent.trim())
      .filter(Boolean);
    const clip = extra?.querySelector('.story-compare-after')?.style.clipPath;
    if (clip) out.push(`slider clip: ${clip}`);
    const images = [...(extra?.querySelectorAll('img') ?? [])];
    const broken = images.filter((img) => img.complete && img.naturalWidth === 0).map((img) => img.src);
    return { date: window.cosminova.state.date.toISOString().slice(0, 10), out, broken };
  });
  const ok = pressed && report.out.length > 0 && report.broken.length === 0;
  if (!ok) failures += 1;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${id.padEnd(12)} ${kind.padEnd(16)} ${before} -> ${report.date}`);
  for (const line of report.out) console.log(`       ${line.slice(0, 160)}`);
  for (const src of report.broken) console.log(`       broken image: ${src}`);
  await page.screenshot({ path: `shots/interactive/${id}-${kind.replace(':', '-')}.png` });
}

for (const error of errors) console.log(error);
await browser.close();
if (failures || errors.length) {
  console.log(`\n${failures} page(s) failed, ${errors.length} error(s)`);
  process.exit(1);
}
console.log('\nevery interactive page responded');
