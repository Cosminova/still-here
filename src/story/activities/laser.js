/**
 * Fire a laser at Apollo 11's mirrors and time the echo.
 *
 * The round trip is the real one for the Earth–Moon distance at the date the
 * simulation is showing, surface to surface, and it plays out in real time:
 * two and a half seconds is short enough to watch, and watching it is the point.
 */
import { el, text } from '../../ui/dom.js';
import { LIGHT_KMS, distanceKm, formatKm } from '../space-facts.js';

const EARTH_RADIUS_KM = 6371;
const MOON_RADIUS_KM = 1737.4;
// Measured by lunar laser ranging since the mirrors were placed.
const RECESSION_CM_PER_YEAR = 3.8;
const MIRROR_PLACED = Date.UTC(1969, 6, 21);
const YEAR_MS = 365.25 * 86400000;

export function createLaser({ api, earn }) {
  const pulse = el('span', { class: 'act-pulse' });
  const beam = el('div', { class: 'act-beam', 'aria-hidden': 'true' }, [pulse]);
  const out = el('p', { class: 'act-out', 'aria-live': 'polite' });
  const fire = el('button', { type: 'button', class: 'story-btn is-primary', text: 'Fire the laser' });
  let frame = 0;

  function finish(seconds) {
    const km = (seconds * LIGHT_KMS) / 2;
    const drift = ((api.state.date.getTime() - MIRROR_PLACED) / YEAR_MS) * RECESSION_CM_PER_YEAR / 100;
    text(
      out,
      `Echo after ${seconds.toFixed(3)} seconds! Light covers 299,792 km every second, so halve the trip and the mirror is ${formatKm(km)} away. ` +
        `So few photons come back that observatories count them one at a time. Since 1969 the Moon has drifted about ${drift.toFixed(1)} metres farther from Earth.`,
    );
    fire.disabled = false;
    fire.textContent = 'Fire again';
    earn();
  }

  fire.addEventListener('click', () => {
    const centres = distanceKm(api, 'earth', 'moon');
    if (!centres) {
      text(out, 'The Moon is not in view right now. Try again in a moment.');
      return;
    }
    const seconds = (2 * (centres - EARTH_RADIUS_KM - MOON_RADIUS_KM)) / LIGHT_KMS;
    fire.disabled = true;
    const start = performance.now();
    const step = (now) => {
      const t = (now - start) / 1000;
      const f = Math.min(t / seconds, 1);
      pulse.style.left = `${(f < 0.5 ? f * 2 : 2 - f * 2) * 100}%`;
      text(out, f < 0.5 ? `Pulse on its way\u2026 ${t.toFixed(2)} s` : `Bounced! Coming home\u2026 ${t.toFixed(2)} s`);
      if (f < 1) frame = requestAnimationFrame(step);
      else finish(seconds);
    };
    frame = requestAnimationFrame(step);
  });

  const node = el('div', { class: 'act' }, [
    el('div', { class: 'act-ends' }, [el('span', { text: 'Observatory on Earth' }), el('span', { text: "Eagle's mirror" })]),
    beam,
    el('div', { class: 'act-row' }, [fire]),
    out,
  ]);
  return { node, dispose: () => cancelAnimationFrame(frame) };
}
