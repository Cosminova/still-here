/**
 * The opening: Surveyor 3 landing on the Moon, reconstructed in the engine at
 * the real place, on the real date, under the real sunlight.
 *
 * What happened, from NSSDCA and NASA Science: close to the ground, bright
 * reflections confused the radar, so the engines never got the signal to cut
 * off at about 4 m. The lander touched down, bounced to about 10 m, touched
 * down 20 m further on, bounced to about 3 m, and touched down a third time
 * 11 m further still, after a command from Earth had shut the engines off. It
 * slid about 30 cm and stopped. The whole sequence took 36 seconds; here it is
 * shortened, and the exhaust, nearly invisible in a vacuum, is drawn as a glow.
 * The overlay says both.
 */
import { css, el, show, text } from '../ui/dom.js';

const KEY = 'surveyor3';
const LANDING_DATE = '1967-04-20T00:04:53Z';
// The camera counts distance in half the lander's 4.2 m size.
const RADIUS_M = 2.1;
const START_M = 36;
const END_M = 15;
// Radians of downward tilt under the title card.
const TITLE_TILT = 0.09;
// Along the ground from where it came to rest, in metres.
const FIRST_M = -31.3;
const SECOND_M = -11.3;
const THIRD_M = -0.3;
const DESCENT_FROM_M = 30;
const HOP1_M = 10;
const HOP2_M = 3;
// Keeps the sun behind the camera's shoulder, so the lander is lit from the front.
const SUN_SIDE = 0.9;

const T = Object.freeze({ land1: 7, land2: 11.6, cut: 13.4, land3: 14.6, rest: 15.3, title: 19.5, auto: 34 });

const CAPTIONS = Object.freeze([
  [0.8, 'A robot is coming down to the Moon. No human has set foot here yet.'],
  [3.8, 'About 4 metres up, its engines are meant to switch off.'],
  [5.6, 'But bright rocks confuse its radar\u2026'],
  [7.0, 'Touchdown! And the engines keep firing.'],
  [8.4, 'It bounces 10 metres high\u2026'],
  [11.6, '\u2026and again, 3 metres high.'],
  [13.2, 'A command from Earth: engines off.'],
  [14.6, 'It lands a third time, slides about 30 centimetres, and stops.'],
  [17.0, 'Surveyor 3 has landed. It is still there today.'],
]);

const lerp = (a, b, u) => a + (b - a) * u;
const clamp01 = (u) => Math.max(0, Math.min(1, u));
const smooth = (a, b, x) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};
const puff = (dt, strength) => (dt < 0 ? 0 : dt < 0.2 ? (strength * dt) / 0.2 : strength * Math.exp(-(dt - 0.2) / 0.9));

/** Where the lander is at `t` seconds: `s` along its path, `y` above the ground. */
function landingAt(t) {
  if (t < T.land1) return { s: FIRST_M, y: DESCENT_FROM_M * (1 - t / T.land1) ** 1.7 };
  if (t < T.land2) {
    const u = (t - T.land1) / (T.land2 - T.land1);
    return { s: lerp(FIRST_M, SECOND_M, u), y: 4 * HOP1_M * u * (1 - u) };
  }
  if (t < T.land3) {
    const u = (t - T.land2) / (T.land3 - T.land2);
    return { s: lerp(SECOND_M, THIRD_M, u), y: 4 * HOP2_M * u * (1 - u) };
  }
  if (t < T.rest) {
    const u = (t - T.land3) / (T.rest - T.land3);
    return { s: lerp(THIRD_M, 0, 1 - (1 - u) ** 2), y: 0 };
  }
  return { s: 0, y: 0 };
}

function effectsAt(t, y) {
  const glow = t < T.cut ? 1 : clamp01(1 - (t - T.cut) / 0.3);
  const touch = puff(t - T.land1, 1) + puff(t - T.land2, 0.8) + puff(t - T.land3, 0.45);
  const blast = glow * clamp01(1 - y / 8) * 0.5;
  return { glow, dust: 0.65 * Math.min(1, touch + blast), dustRadiusM: 3.5 + 3.5 * Math.min(1, touch) };
}

function buildOverlay({ onSkip, onBegin, onSound, soundOn }) {
  const caption = el('p', { class: 'opening-caption', 'aria-live': 'polite' });
  const soundButton = el('button', { type: 'button', class: 'story-tool', onclick: onSound });
  const begin = el('button', { type: 'button', class: 'story-btn is-primary opening-begin', text: 'Begin the story', onclick: onBegin });
  const title = el('div', { class: 'opening-title', hidden: true }, [
    el('p', { class: 'opening-kicker', text: 'Still Here' }),
    el('h1', { text: 'How did this machine get here \u2014 and what did it leave us?' }),
    el('p', { class: 'opening-sub', text: 'In this story the machines speak in imagined voices. Everything they tell you really happened.' }),
    begin,
  ]);
  const root = el('div', { class: 'opening', role: 'region', 'aria-label': 'Opening: Surveyor 3 lands on the Moon' }, [
    el('div', { class: 'opening-bar is-top' }),
    el('div', { class: 'opening-bar is-bottom' }),
    el('div', { class: 'opening-label' }, [
      el('span', { class: 'story-tag is-recon', text: 'Reconstruction' }),
      el('span', { class: 'opening-place', text: 'Ocean of Storms, the Moon \u00b7 20 April 1967' }),
      el('span', { class: 'opening-note', text: 'Real place, date and sunlight. Timing shortened; engine glow drawn so you can see it.' }),
    ]),
    caption,
    title,
    el('div', { class: 'opening-controls' }, [
      soundButton,
      el('button', { type: 'button', class: 'story-tool', text: 'Skip intro', onclick: onSkip }),
    ]),
    el('div', { class: 'opening-fade' }),
  ]);
  const setSound = (on) => {
    text(soundButton, on ? 'Sound: on' : 'Sound: off');
    soundButton.setAttribute('aria-pressed', String(on));
    css(soundButton, 'is-on', on);
  };
  setSound(soundOn);
  return { root, caption, title, begin, setSound };
}

/**
 * Plays the opening over the live scene and calls `onDone` when it ends, is
 * skipped, or cannot run. Returns `{ skip }`.
 *
 * `sound` is `{ on, toggle() }` from the story, so the intro and the story bar
 * share one switch.
 */
export function playIntro(api, { reducedMotion = false, sound, onDone }) {
  const controls = api.controls;
  let done = false;
  let frame = 0;
  let autoTimer = 0;
  let titleShown = false;
  let shownCaption = -1;
  const autoCenter = controls.autoCenter;

  const overlay = buildOverlay({
    onSkip: () => finish(),
    onBegin: () => finish(),
    onSound: () => overlay.setSound(sound?.toggle() ?? false),
    soundOn: sound?.on ?? false,
  });
  document.body.append(overlay.root);

  function finish() {
    if (done) return;
    done = true;
    cancelAnimationFrame(frame);
    clearTimeout(autoTimer);
    window.removeEventListener('keydown', onKey, true);
    api.setCraftPose?.(KEY, null);
    controls.lookYaw = 0;
    controls.lookPitch = 0;
    controls.autoCenter = autoCenter;
    api.ambient?.setLevel?.(0.6);
    css(overlay.root, 'is-leaving', true);
    setTimeout(() => overlay.root.remove(), reducedMotion ? 0 : 700);
    onDone?.();
  }

  function onKey(event) {
    if (event.key === 'Escape' || (titleShown && (event.key === 'Enter' || event.key === 'ArrowRight'))) {
      event.preventDefault();
      event.stopPropagation();
      finish();
    }
  }
  window.addEventListener('keydown', onKey, true);

  // Set the scene: the landing date, the lander framed low across its path.
  let yaw0 = 0;
  try {
    api.setDate(LANDING_DATE);
    api.setRate(0);
    const framed = api.lookAtCraft(KEY, START_M / RADIUS_M, 0);
    const item = api.craftField.get(KEY);
    const sun = api.universe.get('sun');
    if (!framed?.present || !item || !sun) throw new Error('Surveyor 3 is not placed at the landing date');
    const toSun = sun.position.clone().sub(item.position).normalize().applyQuaternion(item.orientation.clone().invert());
    yaw0 = Math.atan2(toSun.x, toSun.z) + SUN_SIDE;
    controls.yaw = yaw0;
    controls.pitch = reducedMotion ? 0.2 : 0.07;
    controls.distanceRadii = (reducedMotion ? END_M * 1.6 : START_M) / RADIUS_M;
    controls.autoCenter = false;
  } catch (error) {
    console.error('[story] the opening could not be set up; starting the story', error);
    finish();
    return { skip: finish };
  }
  // Across the camera's line of sight, so the hops run across the screen.
  const path = { x: Math.cos(yaw0), z: -Math.sin(yaw0) };
  api.ambient?.setLevel?.(0.35, 1);

  function showCaption(t) {
    let at = -1;
    for (let i = 0; i < CAPTIONS.length; i++) if (t >= CAPTIONS[i][0]) at = i;
    if (at === shownCaption) return;
    shownCaption = at;
    text(overlay.caption, at >= 0 ? CAPTIONS[at][1] : '');
    css(overlay.caption, 'is-on', at >= 0);
  }

  function showTitle() {
    titleShown = true;
    css(overlay.caption, 'is-on', false);
    show(overlay.title, true);
    overlay.begin.focus({ preventScroll: true });
    api.ambient?.setLevel?.(1, 3);
    autoTimer = setTimeout(finish, (T.auto - T.title) * 1000);
  }

  const start = performance.now();
  const tick = (now) => {
    if (done) return;
    const t = (now - start) / 1000;
    if (!reducedMotion) {
      const { s, y } = landingAt(t);
      api.setCraftPose?.(KEY, { x: path.x * s, z: path.z * s, y, ...effectsAt(t, y) });
      const push = smooth(T.land3, T.title + 2, t);
      const distM = lerp(START_M, END_M, push);
      controls.distanceRadii = distM / RADIUS_M;
      controls.pitch = lerp(0.07, 0.2, push);
      controls.yaw = yaw0 + 0.012 * t;
      // Follow the lander while it is off its resting place, a little behind it;
      // then tilt down, which lifts it clear of the title underneath.
      controls.lookYaw = -0.85 * Math.atan2(s, distM);
      controls.lookPitch = -0.8 * Math.atan2(y, distM) + TITLE_TILT * smooth(T.title - 1.5, T.title + 1.5, t);
    }
    showCaption(t);
    if (!titleShown && t >= T.title) showTitle();
    frame = requestAnimationFrame(tick);
  };
  frame = requestAnimationFrame(tick);

  return { skip: finish };
}
