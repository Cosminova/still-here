/**
 * Kepler's method by hand: slide a planet across a star and watch the light dip.
 *
 * The planet is drawn larger than life so it can be seen, but the dip is
 * computed from the true size ratio, which is the lesson: an Earth crossing a
 * Sun-like star dims it by less than a hundredth of a percent.
 */
import { el, text } from '../../ui/dom.js';

const W = 340;
const H = 150;
const STAR = Object.freeze({ x: 80, y: 75, r: 52 });
const PLOT = Object.freeze({ x: 170, y: 20, w: 160, h: 110 });
const PLANETS = Object.freeze({
  earth: { label: 'Earth-sized', ratio: 0.00917, drawn: 6 },
  jupiter: { label: 'Jupiter-sized', ratio: 0.10045, drawn: 15 },
});

/** Area shared by two circles, as a fraction of the first one's area. */
function covered(r1, r2, d) {
  if (d >= r1 + r2) return 0;
  if (d <= Math.abs(r1 - r2)) return r2 <= r1 ? (r2 * r2) / (r1 * r1) : 1;
  const a = r1 * r1 * Math.acos((d * d + r1 * r1 - r2 * r2) / (2 * d * r1));
  const b = r2 * r2 * Math.acos((d * d + r2 * r2 - r1 * r1) / (2 * d * r2));
  const c = 0.5 * Math.sqrt((-d + r1 + r2) * (d + r1 - r2) * (d - r1 + r2) * (d + r1 + r2));
  return (a + b - c) / (Math.PI * r1 * r1);
}

/** Fraction of starlight lost with the planet at `pos` (-1..1 across the star). */
const dipAt = (planet, pos) => covered(1, planet.ratio, Math.abs(pos) * 1.4);

export function createTransit({ earn }) {
  const canvas = el('canvas', { class: 'act-canvas', width: W, height: H, 'aria-hidden': 'true' });
  const ctx = canvas.getContext('2d');
  const slider = el('input', { type: 'range', min: '-100', max: '100', value: '-100', 'aria-label': 'Planet position' });
  const out = el('p', { class: 'act-out', 'aria-live': 'polite' });
  let planet = PLANETS.earth;
  let frame = 0;
  let crossed = false;

  function draw() {
    const pos = Number(slider.value) / 100;
    ctx.clearRect(0, 0, W, H);
    const glow = ctx.createRadialGradient(STAR.x, STAR.y, 4, STAR.x, STAR.y, STAR.r);
    glow.addColorStop(0, '#fff6d8');
    glow.addColorStop(1, '#f2b84b');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(STAR.x, STAR.y, STAR.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#05070c';
    ctx.beginPath();
    ctx.arc(STAR.x + pos * STAR.r * 1.4, STAR.y + 6, planet.drawn, 0, Math.PI * 2);
    ctx.fill();

    // The light curve, scaled so its own dip fills the plot.
    const depth = planet.ratio * planet.ratio;
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.strokeRect(PLOT.x, PLOT.y, PLOT.w, PLOT.h);
    ctx.strokeStyle = '#7fd1ff';
    ctx.beginPath();
    for (let i = 0; i <= 80; i++) {
      const p = -1 + (2 * i) / 80;
      const x = PLOT.x + (i / 80) * PLOT.w;
      const y = PLOT.y + 15 + (dipAt(planet, p) / depth) * (PLOT.h - 30);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    const now = dipAt(planet, pos);
    ctx.fillStyle = '#f2c14e';
    ctx.beginPath();
    ctx.arc(PLOT.x + ((pos + 1) / 2) * PLOT.w, PLOT.y + 15 + (now / depth) * (PLOT.h - 30), 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#9aa6b8';
    ctx.font = '11px system-ui, sans-serif';
    ctx.fillText('Starlight Kepler sees', PLOT.x, PLOT.y - 6);

    const percent = (now * 100).toPrecision(2);
    text(out, now > 0
      ? `The star is ${percent}% dimmer. ${planet === PLANETS.earth
        ? 'That is like spotting a flea crawling across a car headlight. Kepler could.'
        : 'A giant planet blocks about 1% of the light, much easier to see.'}`
      : 'Slide the planet across the star, or press Play.');
    if (now > 0 && Math.abs(pos) < 0.05 && !crossed) {
      crossed = true;
      earn();
    }
  }

  function play() {
    cancelAnimationFrame(frame);
    const start = performance.now();
    const step = (t) => {
      const f = Math.min((t - start) / 4000, 1);
      slider.value = String(Math.round(-100 + f * 200));
      draw();
      if (f < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
  }

  const sizes = Object.entries(PLANETS).map(([key, p]) =>
    el('button', {
      type: 'button',
      class: `story-btn${key === 'earth' ? ' is-on' : ''}`,
      text: p.label,
      onclick: (event) => {
        planet = p;
        for (const b of sizes) b.classList.toggle('is-on', b === event.currentTarget);
        draw();
      },
    }),
  );
  slider.addEventListener('input', draw);
  draw();
  return {
    node: el('div', { class: 'act' }, [
      canvas,
      slider,
      el('div', { class: 'act-row' }, [el('button', { type: 'button', class: 'story-btn is-primary', text: 'Play', onclick: play }), ...sizes]),
      out,
    ]),
    dispose: () => cancelAnimationFrame(frame),
  };
}
