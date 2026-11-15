/**
 * The interactive pages of a chapter: decisions, hands-on activities, and the
 * look ahead for machines that are still working or still moving.
 *
 * Each builder returns `{ node, dispose }`; the story card shows the node under
 * the typed text and disposes it when the page changes.
 */
import { append, clear, css, el, show } from '../ui/dom.js';
import { createDelay } from './activities/delay.js';
import { createLaser } from './activities/laser.js';
import { createSignal } from './activities/signal.js';
import { createTransit } from './activities/transit.js';
import { createCompare, createParts, createRecap, createReplay, photoFigure } from './media.js';

const ACTIVITIES = Object.freeze({
  laser: createLaser,
  delay: createDelay,
  transit: createTransit,
  signal: createSignal,
  parts: createParts,
  compare: createCompare,
  replay: createReplay,
  recap: createRecap,
});

const YEAR_MS = 365.25 * 86400000;
// Lunar laser ranging since 1969.
const MOON_RECESSION_CM_PER_YEAR = 3.8;
const APOLLO11 = Date.UTC(1969, 6, 21);

/** Numbers a horizon can ask for, worked out for the date it describes. */
const COMPUTED = Object.freeze({
  recession: (date) => {
    const metres = ((date.getTime() - APOLLO11) / YEAR_MS) * MOON_RECESSION_CM_PER_YEAR / 100;
    return `By ${date.getUTCFullYear()} the Moon will be about ${metres.toFixed(1)} metres farther from Earth than on the day Eagle landed.`;
  },
});

function createChoice(page, { earn, speak }) {
  const reply = el('div', { class: 'story-reply', 'aria-live': 'polite', hidden: true });
  const buttons = page.options.map((option, i) =>
    el('button', { type: 'button', class: 'story-option', text: option.label, onclick: () => pick(i) }),
  );
  function pick(i) {
    const right = i === page.answer;
    buttons.forEach((button, j) => {
      button.disabled = true;
      css(button, 'is-right', j === page.answer);
      css(button, 'is-wrong', j === i && !right);
    });
    clear(reply);
    append(reply, [
      el('p', {
        class: 'story-verdict',
        text: right
          ? (page.rightText ?? 'Yes! That is what they did.')
          : (page.wrongText ?? 'Good thinking, but here is what really happened.'),
      }),
      el('p', { text: page.options[i].reply }),
      el('p', { class: 'story-reveal', text: page.reveal }),
    ]);
    show(reply, true);
    speak(`${page.options[i].reply} ${page.reveal}`);
    earn();
  }
  return {
    node: el('div', { class: 'story-choice' }, [
      el('p', { class: 'story-prompt', text: 'You decide' }),
      el('div', { class: 'story-options', role: 'group', 'aria-label': 'Choose an answer' }, buttons),
      reply,
    ]),
    dispose() {},
  };
}

function createFuture(page, { onHorizon, onToday, today, earn }) {
  const detail = el('div', { class: 'story-reply', 'aria-live': 'polite', hidden: true });
  const buttons = page.horizons.map((horizon) =>
    el('button', { type: 'button', class: 'story-option', text: horizon.label, onclick: () => pick(horizon) }),
  );
  const back = el('button', { type: 'button', class: 'story-btn', text: 'Back to today', hidden: true });

  function pick(horizon) {
    for (const button of buttons) css(button, 'is-right', button.textContent === horizon.label);
    const date = new Date(today().getTime() + horizon.years * YEAR_MS);
    clear(detail);
    append(detail, [
      el('p', { class: 'story-verdict', text: horizon.jump ? `The clock now reads ${date.getUTCFullYear()}. Look where it is.` : horizon.label }),
      el('p', { text: horizon.text }),
      horizon.compute && COMPUTED[horizon.compute] ? el('p', { class: 'story-reveal', text: COMPUTED[horizon.compute](date) }) : null,
      el('p', { class: 'story-note', text: 'This is what scientists expect or hope, not a promise. The future of space is still being decided.' }),
    ]);
    show(detail, true);
    show(back, Boolean(horizon.jump));
    onHorizon(horizon.jump ? date : null);
    earn();
  }
  back.addEventListener('click', () => {
    for (const button of buttons) css(button, 'is-right', false);
    show(detail, false);
    show(back, false);
    onToday();
  });
  return {
    node: el('div', { class: 'story-choice' }, [
      el('p', { class: 'story-prompt', text: 'What happens next?' }),
      el('div', { class: 'story-options', role: 'group', 'aria-label': 'Look ahead' }, buttons),
      detail,
      back,
    ]),
    dispose() {},
  };
}

/**
 * @param {object} page a chapter page
 * @param {object} ctx `{ api, earn, speak, onHorizon, onToday, today, chapters,
 *   visited, onReplayIntro, onLogbook, onExplore }`
 * @returns {{node: HTMLElement, dispose: Function}|null}
 */
export function buildInteractive(page, ctx) {
  if (page.kind === 'choice') return createChoice(page, ctx);
  if (page.kind === 'future') return createFuture(page, ctx);
  if (page.kind !== 'activity') {
    const figure = page.photo ? photoFigure(page.photo) : null;
    return figure ? { node: figure, dispose() {} } : null;
  }
  const make = ACTIVITIES[page.activity];
  if (!make) {
    console.warn(`[story] no activity called ${page.activity}`);
    return null;
  }
  return make({ ...ctx, params: page.params });
}
