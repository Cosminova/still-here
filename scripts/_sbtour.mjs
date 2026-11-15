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
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
await page.goto('http://127.0.0.1:5180/sandbox.html');
await page.evaluateOnNewDocument(() => localStorage.clear());
await page.evaluate(() => localStorage.clear());
await page.waitForFunction(() => window.sandbox && document.getElementById('loading')?.classList.contains('is-done'), { timeout: 90000 });
await page.click('#home-start');
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
await wait(2200);
await page.screenshot({ path: '/tmp/sb/tour-offer.png' });
const step = () => page.evaluate(() => ({ i: window.sandbox.tour.i, active: window.sandbox.tour.active, title: document.querySelector('.sb-tour-card h3').textContent }));
const waitStep = async (i, ms = 15000) => {
  const t = Date.now();
  while (Date.now() - t < ms) {
    const s = await step();
    if (s.i >= i || !s.active) return s;
    await wait(200);
  }
  return { timeout: true, ...(await step()) };
};
const shot = (n) => page.screenshot({ path: `/tmp/sb/tour-${n}.png` });
const earth = () => page.evaluate(() => {
  const { sim, renderer } = window.sandbox;
  return renderer.project(sim.bodies.find((b) => b.name === 'Earth' && !b.dead));
});

await page.click('[data-tour="start"]');
await wait(1500);
await shot(0);
await page.click('[data-tour="next"]');
console.log(await step());
// rotate
await page.mouse.move(500, 400);
await page.mouse.down();
await page.mouse.move(900, 300, { steps: 20 });
await page.mouse.up();
console.log('rotate ->', await waitStep(2));
// zoom
await page.mouse.move(640, 400);
for (let k = 0; k < 12; k++) {
  await page.mouse.wheel({ deltaY: -300 });
  await wait(80);
}
console.log('zoom ->', await waitStep(3));
await shot(3);
for (let k = 0; k < 4; k++) {
  await page.click('.sb-bar [data-act="faster"]');
  await wait(150);
}
console.log('speed ->', await waitStep(4));
await wait(1500);
await shot(4);
const moon = await page.evaluate(() => {
  const { sim, renderer } = window.sandbox;
  return renderer.project(sim.bodies.find((b) => b.name === 'Moon'));
});
await page.mouse.click(moon.x, moon.y);
console.log('select ->', await waitStep(5));
await page.click('.sb-props-tabs [data-tab="motion"]');
console.log('motion ->', await waitStep(6));
await shot(6);
await page.click('.sb-add-btn');
console.log('add ->', await waitStep(7));
await page.click('#sb-add-tabs [data-cat="small"]');
await wait(200);
await shot(7);
await page.click('.sb-obj[data-add="bigasteroid"]');
console.log('choose ->', await waitStep(8));
await wait(1500);
await shot(8);
const e = await earth();
await page.mouse.move(e.x - 260, e.y - 90);
await page.mouse.down();
await page.mouse.move(e.x - 200, e.y - 70, { steps: 6 });
await page.mouse.move(e.x - 120, e.y - 40, { steps: 6 });
await page.mouse.up();
console.log('throw ->', await waitStep(9));
console.log('impact ->', await waitStep(10, 25000));
console.log('moon impact ->', await waitStep(11, 40000));
await wait(1800);
await shot(11);
await page.click('.sb-bar [data-tool="laser"]');
await wait(300);
const e2 = await earth();
await page.mouse.move(e2.x, e2.y);
await page.mouse.down();
await wait(3200);
await shot('laser');
await page.mouse.up();
console.log('laser ->', await waitStep(12));
await shot(12);
await page.click('[data-tour="next"]');
await wait(500);
console.log('end', await step(), await page.evaluate(() => [localStorage.getItem('cosminova-sandbox-tour-done'), window.sandbox.app.state.laserPower]));
console.log('errors', JSON.stringify(errors));
await browser.close();
