/**
 * The logbook: every machine on the journey, grouped by where it rests, with
 * a tick for each one already visited. Choosing one flies straight there,
 * which is how a teacher jumps to the chapter a lesson is about.
 */
import { clear, el } from '../ui/dom.js';
import { STATUS_LABELS } from './chapters/index.js';

function groupByRegion(chapters) {
  const groups = new Map();
  chapters.forEach((chapter, index) => {
    const list = groups.get(chapter.region) ?? [];
    groups.set(chapter.region, [...list, { chapter, index }]);
  });
  return groups;
}

function entry({ chapter, index }, { visited, badges, current, onPick }) {
  const seen = visited.has(chapter.id);
  const earned = badges.has(chapter.id);
  const name = chapter.status ? chapter.speaker : chapter.title;
  const sub = chapter.status ? `${chapter.title} \u00b7 ${chapter.years}` : 'The end of the journey';
  return el('li', {}, [
    el(
      'button',
      {
        type: 'button',
        class: `logbook-item${index === current ? ' is-current' : ''}${seen ? ' is-visited' : ''}`,
        'aria-current': index === current ? 'step' : null,
        onclick: () => onPick(index),
      },
      [
        el('span', { class: 'logbook-tick', 'aria-label': seen ? 'Visited' : 'Not visited yet', text: seen ? '\u2713' : '' }),
        el('span', { class: 'logbook-text' }, [
          el('span', { class: 'logbook-name', text: name }),
          el('span', { class: 'logbook-sub', text: sub }),
        ]),
        earned ? el('span', { class: 'logbook-badge', title: 'Badge earned', 'aria-label': 'Badge earned', text: '\u2605' }) : null,
        chapter.status
          ? el('span', { class: `story-status is-${chapter.status}`, text: STATUS_LABELS[chapter.status] })
          : null,
      ],
    ),
  ]);
}

export function createLogbook({ chapters, onJump, onRestart }) {
  const list = el('div', { class: 'logbook-list' });
  const closeButton = el('button', { type: 'button', class: 'story-btn', text: 'Close', onclick: () => close() });
  const restartButton = el('button', {
    type: 'button',
    class: 'story-btn',
    text: 'Start the journey again',
    onclick: () => {
      close();
      onRestart();
    },
  });
  const panel = el(
    'div',
    { class: 'logbook-panel', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'logbook-title' },
    [
      el('header', { class: 'logbook-head' }, [
        el('div', {}, [
          el('h2', { id: 'logbook-title', text: 'Logbook' }),
          el('p', { text: 'Every machine on the journey. Choose one to fly straight there. \u2605 marks a stop where you made a decision or tried the activity.' }),
        ]),
        closeButton,
      ]),
      list,
      el('footer', { class: 'logbook-foot' }, [restartButton]),
    ],
  );
  const root = el('div', { class: 'logbook', hidden: true }, [panel]);
  root.addEventListener('click', (event) => {
    if (event.target === root) close();
  });
  document.body.append(root);

  let returnFocus = null;

  function open(visited, current, badges = new Set()) {
    clear(list);
    const onPick = (index) => {
      close();
      onJump(index);
    };
    for (const [region, items] of groupByRegion(chapters)) {
      list.append(
        el('section', { class: 'logbook-group' }, [
          el('h3', { text: region }),
          el('ul', {}, items.map((item) => entry(item, { visited, badges, current, onPick }))),
        ]),
      );
    }
    returnFocus = document.activeElement;
    root.hidden = false;
    closeButton.focus({ preventScroll: true });
  }

  function close() {
    if (root.hidden) return;
    root.hidden = true;
    returnFocus?.focus?.({ preventScroll: true });
  }

  return {
    open,
    close,
    get isOpen() {
      return !root.hidden;
    },
  };
}
