import puppeteer from 'puppeteer-core';

const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  args: ['--headless=new', '--no-sandbox', '--use-gl=angle'],
  defaultViewport: { width: 1280, height: 800 },
});
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
await page.goto('http://127.0.0.1:5180/sandbox.html');
await page.waitForFunction(() => window.sandbox && document.getElementById('loading')?.classList.contains('is-done'), { timeout: 90000 });
await page.click('#home-start');
await new Promise((r) => setTimeout(r, 900));
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const info = () => page.evaluate(() => {
  const { sim, app, cam } = window.sandbox;
  return { n: sim.bodies.length, names: sim.majors.map((b) => b.name).join(','), tool: app.state.tool, sel: app.state.selected && sim.byId(app.state.selected)?.name, focus: cam.focusId && sim.byId(cam.focusId)?.name, dist: cam.dist.toExponential(2) };
});

// Earth & Moon, paused, Add tool with an asteroid.
await page.evaluate(() => {
  const { app } = window.sandbox;
  app.loadPreset('earthmoon');
  app.state.playing = false;
});
await wait(1500);
const earthPx = await page.evaluate(() => {
  const { sim, renderer } = window.sandbox;
  const e = sim.bodies.find((b) => b.name === 'Earth');
  return renderer.project(e);
});
console.log('earth on screen', JSON.stringify(earthPx));
await page.evaluate(() => {
  const { app } = window.sandbox;
  app.state.addKey = 'bigasteroid';
  app.setTool('add');
});
await page.mouse.click(earthPx.x + 120, earthPx.y + 10);
await wait(300);
console.log('after click-add', JSON.stringify(await info()));
// Drag-throw another.
await page.mouse.move(earthPx.x - 200, earthPx.y - 60);
await page.mouse.down();
await page.mouse.move(earthPx.x - 150, earthPx.y - 40, { steps: 6 });
await page.mouse.move(earthPx.x - 90, earthPx.y - 20, { steps: 6 });
await page.mouse.up();
await wait(300);
console.log('after throw', JSON.stringify(await info()));
const vel = await page.evaluate(() => window.sandbox.sim.minors.concat(window.sandbox.sim.majors).filter((b) => /Asteroid|Psyche|Large/.test(b.name)).map((b) => `${b.name}:${Math.hypot(b.vx, b.vy, b.vz).toFixed(0)}`));
console.log('asteroid speeds', JSON.stringify(vel));

// Laser on Earth for 2 s.
await page.evaluate(() => {
  const { app } = window.sandbox;
  app.setTool('laser');
  app.state.laserPower = 1e25;
  app.state.playing = false;
});
const t0 = await page.evaluate(() => window.sandbox.sim.bodies.find((b) => b.name === 'Earth').temp);
await page.mouse.move(earthPx.x, earthPx.y);
await page.mouse.down();
await wait(2000);
await page.screenshot({ path: '/tmp/sb/laser.png' });
await page.mouse.up();
const t1 = await page.evaluate(() => {
  const e = window.sandbox.sim.bodies.find((b) => b.name === 'Earth');
  const ms = window.sandbox.sim.minors;
  const rs = ms.map((m) => m.radius).sort((a, b) => a - b);
  return { temp: e.temp, max: Math.max(...e.heat), frags: ms.length, simT: window.sandbox.sim.time, rMin: rs[0], rMed: rs[rs.length >> 1], rMax: rs[rs.length - 1], kinds: [...new Set(ms.map((m) => m.kind + ':' + m.name))].slice(0, 6), earthMass: e.mass, laserE: e.laserE };
});
console.log('laser temp', t0.toFixed(0), '->', JSON.stringify(t1));

// Select tool: double-click Earth focuses, wheel zooms.
await page.evaluate(() => window.sandbox.app.setTool('select'));
await page.mouse.click(earthPx.x, earthPx.y);
await wait(100);
await page.mouse.click(earthPx.x, earthPx.y);
await wait(1400);
console.log('after focus', JSON.stringify(await info()));
await page.mouse.move(640, 400);
await page.mouse.wheel({ deltaY: -400 });
await wait(300);
console.log('after zoom', JSON.stringify(await info()));
await page.screenshot({ path: '/tmp/sb/focus.png' });
console.log('errors', JSON.stringify(errors));
await browser.close();
