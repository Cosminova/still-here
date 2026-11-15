/**
 * Narrated Shorts: one beat per narration line, its length taken from the
 * voice timeline (video/_kit/<name>/timeline.json), so the picture changes
 * when the voice does. The last beat is the app itself, interface on.
 */
import fs from 'node:fs';

const lerp = (a, b, t) => a + (b - a) * t;
const glide = (a, b, t) => a * Math.pow(b / a, t);

function seconds(name) {
  const file = `video/_kit/${name}/timeline.json`;
  if (!fs.existsSync(file)) return null;
  const tl = JSON.parse(fs.readFileSync(file, 'utf8'));
  return tl.lines.map((l, i) => (i === tl.lines.length - 1 ? tl.total : l.end) - (i === 0 ? 0 : l.start));
}

const orbit = (key, from, to, { phase = 40, tilt = 12, turn = 0.3, wait = false } = {}) => ({
  async setup(page, ctx) {
    if (wait) {
      await page.evaluate((k) => window.cosminova.target(k), key);
      await page.waitForFunction((k) => Boolean(window.cosminova.exoSystem?.planets?.some((p) => p.spec.key === k)), { timeout: 90000 }, key);
      await new Promise((r) => setTimeout(r, 2500));
    }
    ctx.base = await page.evaluate((k, d, p, tl) => {
      const sv = window.cosminova;
      sv.setUiVisible(false);
      sv.lookFromSun(k, d, p, tl);
      return { yaw: sv.controls.yaw, pitch: sv.controls.pitch };
    }, key, from, phase, tilt);
  },
  frame: (t, ctx) => ({ distanceRadii: glide(from, to, t), yaw: ctx.base.yaw + turn * t, pitch: ctx.base.pitch, fov: 40 }),
});

const stand = (body, sunFrom, sunTo, slug) => ({
  async setup(page) {
    await page.evaluate((k) => window.cosminova.target(k), body);
    await page.waitForFunction((k, s) => Boolean(window.cosminova.standAt(k, { sunElevationDeg: s, altitudeKm: 10 })), { timeout: 90000 }, body, sunFrom);
    if (slug) await page.evaluate((s) => window.cosminova.loadDetail(s), slug);
  },
  frame: (t) => ({ stand: { body, sunElevationDeg: lerp(sunFrom, sunTo, t), altitudeKm: 10, viewElevationDeg: 9, fov: 62 } }),
});

const hole = (from, to, fovFrom = 40, fovTo = 40) => ({
  async setup(page, ctx) {
    if (ctx.holeReady) return;
    await page.evaluate(() => {
      const sv = window.cosminova;
      sv.setView('blackHoles', true);
      sv.lookAtBlackHole('sgr-a', 260);
    });
    ctx.holeReady = true;
  },
  frame: (t) => ({ distanceRadii: glide(from, to, t), fov: lerp(fovFrom, fovTo, t) }),
});

/** The app with its interface on, the object's panel open: what a download gets. */
const app = (key, distance, { black = false } = {}) => ({
  async setup(page, ctx) {
    ctx.app = await page.evaluate(async (k, d, black) => {
      const sv = window.cosminova;
      if (black) {
        sv.setView('blackHoles', true);
        sv.lookAtBlackHole(k, d);
      } else {
        sv.target(k, d);
      }
      sv.setUiVisible(true);
      sv.ui?.togglePanel?.('inspector', true);
      return { yaw: sv.controls.yaw, pitch: sv.controls.pitch };
    }, key, distance, black);
    await new Promise((r) => setTimeout(r, 3000));
  },
  frame: (t, ctx) => ({ distanceRadii: distance * (1 - 0.12 * t), yaw: ctx.app.yaw + 0.35 * t, pitch: ctx.app.pitch, fov: 45 }),
});

function kit(name, parts, extra = {}) {
  const secs = seconds(name);
  if (!secs) return null;
  return {
    date: '2026-10-05T12:00:00.000Z',
    ...extra,
    beats: parts.map((p, i) => ({ name: `l${i}`, seconds: secs[i], ...p })),
  };
}

export function kitShots() {
  const out = {};
  out['kit-blackhole'] = kit('blackhole', [
    hole(300, 150), hole(150, 80), hole(80, 45), hole(45, 14, 40, 50), hole(14, 7, 50, 50),
    hole(7, 3, 50, 56), hole(3, 2, 56, 56), hole(2, 1.6, 56, 60), hole(1.6, 1.08, 60, 70),
    app('sgr-a', 30, { black: true }),
  ]);
  out['kit-earthlike'] = kit('earthlike', [
    orbit('earth', 3.2, 2.6, { phase: 50 }),
    orbit('exo:proxima-cen-b', 3.4, 2.6, { wait: true }),
    stand('exo:proxima-cen-b', 5, 1, 'proxima-cen-b'),
    orbit('exo:trappist-1-e', 3.4, 2.6, { wait: true }),
    stand('exo:trappist-1-e', 6, 2, 'trappist-1-e'),
    orbit('exo:teegarden-s-star-b', 3.4, 2.5, { wait: true }),
    stand('exo:teegarden-s-star-b', 8, 3, 'teegarden-s-star-b'),
    orbit('exo:teegarden-s-star-b', 2.5, 4000, { turn: 0.5 }),
    app('exo:teegarden-s-star-b', 3),
  ]);
  const earth = (from, to, views) => ({
    async setup(page, ctx) {
      if (ctx.earthReady) return;
      ctx.base = await page.evaluate(() => {
        const sv = window.cosminova;
        sv.target('earth', 1.02);
        return { yaw: sv.controls.yaw, pitch: sv.controls.pitch };
      });
      ctx.earthReady = true;
    },
    frame: (t, ctx) => ({ distanceRadii: glide(from, to, t), yaw: ctx.base.yaw + 0.04 * t, pitch: ctx.base.pitch, fov: 45, views }),
  });
  out['kit-smallearth'] = kit('smallearth', [
    earth(1.004, 1.06), earth(1.06, 5), earth(5, 160), earth(160, 4e5, { orbits: true }),
    earth(4e5, 2e11, { orbits: false }), earth(2e11, 4e14), earth(4e14, 2e16), earth(2e16, 3e16),
    app('earth', 3),
  ], { labels: { earth: 'Earth', moon: 'Moon' } });
  return out;
}
