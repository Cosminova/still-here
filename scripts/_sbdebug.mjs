import puppeteer from 'puppeteer-core';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const [preset = 'roche', frames = '200', speed = ''] = process.argv.slice(2);
const browser = await puppeteer.launch({
  executablePath: CHROME,
  args: ['--headless=new', '--no-sandbox', '--use-gl=angle'],
  defaultViewport: { width: 800, height: 500 },
  protocolTimeout: 20000,
});
const page = await browser.newPage();
page.on('pageerror', (e) => console.log('pageerror', e.message));
await page.goto('http://127.0.0.1:5180/sandbox.html', { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => window.sandbox && document.getElementById('loading')?.classList.contains('is-done'), { timeout: 90000 });
await page.evaluate((p) => {
  window.sandbox.app.loadPreset(p);
  window.sandbox.app.state.playing = false;
  const sim = window.sandbox.sim;
  const orig = sim.collide.bind(sim);
  window.__log = [];
  sim.collide = (a, b) => {
    const v = Math.hypot(a.vx - b.vx, a.vy - b.vy, a.vz - b.vz);
    const desc = `t=${sim.time.toFixed(0)} ${a.name}(${a.mass.toExponential(1)},r=${(a.radius / 1e3).toFixed(0)}km,tidal=${!!a.tidal},minor=${a.minor}) x ${b.name}(${b.mass.toExponential(1)},r=${(b.radius / 1e3).toFixed(0)}km,tidal=${!!b.tidal},minor=${b.minor}) v=${v.toFixed(0)}`;
    const n0 = sim.bodies.length;
    const r = orig(a, b);
    if (sim.bodies.length - n0 > 100 || (!a.minor && !b.minor)) window.__log.push(`${desc} +${sim.bodies.length - n0}`);
    return r;
  };
}, preset);
try {
  for (let f = 0; f < Number(frames); f++) {
    const r = await page.evaluate((spd) => {
      const { sim, app } = window.sandbox;
      const t0 = performance.now();
      const done = sim.advance((Number(spd) || app.state.speed) * 0.016, 14);
      const t1 = performance.now();
      return { ms: +(t1 - t0).toFixed(1), done: +done.toFixed(2), n: sim.bodies.length, minors: sim.minors.length, steps: sim.lastSteps, maxDt: +sim.maxDt.toFixed(2), t: +sim.time.toFixed(0) };
    }, speed);
    if (f % 10 === 0 || r.ms > 30) console.log(f, JSON.stringify(r));
  }
  console.log(await page.evaluate(() => {
    const { sim } = window.sandbox;
    const T = {};
    const time = (k, f) => {
      const a = performance.now();
      for (let i = 0; i < 5; i++) f();
      T[k] = +((performance.now() - a) / 5).toFixed(2);
    };
    time('computeAcc', () => sim.computeAcc());
    time('treeBuild', () => sim.tree.build(sim.minors));
    time('detect', () => sim.detectCollisions());
    time('slow', () => sim.slowUpdate(1));
    time('thermal', () => sim.thermal(1, sim.majors.filter((s) => s.lum > 0)));
    time('roche', () => sim.rocheStep(1));
    time('fragCount', () => sim.fragmentCount());
    const temps = sim.minors.map((m) => m.temp).sort((a, b) => a - b);
    T.tempMed = Math.round(temps[temps.length >> 1] || 0);
    T.tempMax = Math.round(temps[temps.length - 1] || 0);
    T.hot = temps.filter((t) => t > 1000).length;
    T.tidal = sim.minors.filter((m) => m.tidal).length;
    T.log = window.__log.slice(0, 25);
    T.majors = sim.majors.map((b) => `${b.name}:${b.mass.toExponential(2)}:${Math.round(b.temp)}`);
    return JSON.stringify(T);
  }));
} catch (e) {
  console.log('HUNG/ERR', e.message);
}
await browser.close();
