/**
 * Send a radio "hello" to a far-away probe and see when it would get there.
 *
 * The journey is drawn on a logarithmic bar, because the Moon is a second and a
 * bit away and the edge of the solar system is most of a day, and on a linear
 * bar everything but the probe would sit on top of Earth. The arrival time is
 * real, worked out from the probe's distance at the simulation's date.
 */
import { el, text } from '../../ui/dom.js';
import { LIGHT_KMS, distanceKm, formatLightTime } from '../space-facts.js';

const ANIMATION_MS = 6000;
const LANDMARKS = Object.freeze([['moon', 'Moon'], ['mars', 'Mars'], ['neptune', 'Neptune']]);

export function createSignal({ api, earn, params }) {
  const bar = el('div', { class: 'act-signal', 'aria-hidden': 'true' });
  const pulse = el('span', { class: 'act-pulse' });
  const out = el('p', { class: 'act-out', 'aria-live': 'polite' });
  const send = el('button', { type: 'button', class: 'story-btn is-primary', text: 'Send a hello' });
  let frame = 0;

  function layout(total) {
    bar.replaceChildren(pulse);
    const scale = (seconds) => Math.log10(Math.max(seconds, 1)) / Math.log10(Math.max(total, 10));
    for (const [key, name] of [...LANDMARKS, [params.craft, params.name]]) {
      const km = distanceKm(api, 'earth', key);
      if (!km) continue;
      const seconds = km / LIGHT_KMS;
      if (seconds > total * 1.001) continue;
      const label = key === params.craft ? [] : [el('em', { text: name })];
      bar.append(el('span', { class: 'act-mark', style: { left: `${scale(seconds) * 100}%` }, title: name }, label));
    }
    return scale;
  }

  send.addEventListener('click', () => {
    const km = distanceKm(api, 'earth', params.craft);
    if (!km) {
      text(out, `${params.name} is not placed at this date.`);
      return;
    }
    const seconds = km / LIGHT_KMS;
    const scale = layout(seconds);
    const sent = api.state.date;
    const arrives = new Date(sent.getTime() + seconds * 1000);
    const when = arrives.toLocaleString(undefined, { weekday: 'long', hour: 'numeric', minute: '2-digit' });
    send.disabled = true;
    const start = performance.now();
    const step = (now) => {
      const f = Math.min((now - start) / ANIMATION_MS, 1);
      // Exponential in time so the pulse moves at a steady pace along the log bar.
      const t = seconds ** f;
      pulse.style.left = `${scale(t) * 100}%`;
      text(out, `Your hello has been travelling for ${formatLightTime(t)} at the speed of light\u2026`);
      if (f < 1) {
        frame = requestAnimationFrame(step);
        return;
      }
      send.disabled = false;
      text(
        out,
        `It would reach ${params.name} after ${formatLightTime(seconds)}, on ${when}. ` +
          (params.listening
            ? `If ${params.name} answered straight away, the reply would reach Earth ${formatLightTime(seconds * 2)} after you sent it.`
            : `But nobody would answer: ${params.name}'s power ran out years ago. Your hello would just keep going.`),
      );
      earn();
    };
    frame = requestAnimationFrame(step);
  });

  layout(1e5);
  return {
    node: el('div', { class: 'act' }, [
      el('div', { class: 'act-ends' }, [el('span', { text: 'Earth' }), el('span', { text: params.name })]),
      bar,
      el('div', { class: 'act-row' }, [send]),
      out,
    ]),
    dispose: () => cancelAnimationFrame(frame),
  };
}
