import puppeteer from 'puppeteer-core';

const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  args: ['--headless=new', '--no-sandbox', '--use-gl=angle'],
  defaultViewport: { width: 1280, height: 800 },
  timeout: 120000,
});
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.goto('http://127.0.0.1:5180/sandbox.html');
await page.waitForFunction(() => window.sandbox && document.getElementById('loading')?.classList.contains('is-done'), { timeout: 90000 });
await page.click('#home-start');
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
await wait(1000);
await page.evaluate(() => {
  const { tour, app } = window.sandbox;
  tour.start();
  app.loadPreset('earthmoon');
  tour.i = 7;
  tour.next();
  app.state.addKey = 'bigasteroid';
  app.setTool('add');
});
await wait(1800);
const rel = () => page.evaluate(() => {
  const { sim, cam } = window.sandbox;
  const e = sim.bodies.find((b) => b.name === 'Earth');
  const a = sim.bodies.find((b) => b.name.startsWith('Giant'));
  if (!a) return 'none: ' + sim.bodies.map((b) => b.name).join(',') + ' | ' + [...document.querySelectorAll('.sb-notice')].map((n) => n.textContent).join(' / ') + ' tool=' + window.sandbox.app.state.tool;
  const r = [a.x - e.x, a.y - e.y, a.z - e.z];
  const v = [a.vx - e.vx, a.vy - e.vy, a.vz - e.vz];
  const d = Math.hypot(...r);
  const vr = (r[0] * v[0] + r[1] * v[1] + r[2] * v[2]) / d;
  const vt = Math.sqrt(Math.max(0, Math.hypot(...v) ** 2 - vr * vr));
  return `d=${(d / 1e3).toFixed(0)}km vr=${vr.toFixed(0)} vt=${vt.toFixed(0)} camDist=${(cam.dist / 1e3).toFixed(0)}km speed=${window.sandbox.app.state.speed}`;
});
const e = await page.evaluate(() => {
  const { sim, renderer } = window.sandbox;
  return renderer.project(sim.bodies.find((b) => b.name === 'Earth'));
});
console.log('earth px', e.x.toFixed(0), e.y.toFixed(0), 'r', e.r.toFixed(0));
await page.mouse.move(e.x - 260, e.y - 90);
await page.mouse.down();
await page.mouse.move(e.x - 200, e.y - 70, { steps: 6 });
await page.mouse.move(e.x - 120, e.y - 40, { steps: 6 });
await page.mouse.up();
for (let k = 0; k < 6; k++) {
  console.log(await rel());
  await wait(1500);
}
console.log('errors', JSON.stringify(errors));
await browser.close();
