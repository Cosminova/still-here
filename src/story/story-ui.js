/**
 * The story overlay: a journey bar along the top and the storyteller's card
 * along the bottom, both outside the explorer's interface so hiding that
 * interface for a clean view of the scene leaves the story where it is.
 */
import { append, clear, css, el, show, text } from '../ui/dom.js';
import { createTypewriter } from './typewriter.js';

const NARRATOR_LABEL = 'Narrator';

/** Where a page sits in its stop's arc, shown above the words. */
const BEATS = Object.freeze({
  question: 'The question',
  job: 'The job',
  challenge: 'The challenge',
  how: 'How it worked',
  learned: 'What we learned',
  remains: 'What remains',
  next: 'What happens next',
});

function fileSection(heading, body) {
  return el('section', { class: 'story-file-part' }, [el('h3', { text: heading }), body]);
}

function buildFile(file) {
  const facts = el(
    'dl',
    { class: 'story-facts' },
    file.facts.map(([label, value]) => el('div', {}, [el('dt', { text: label }), el('dd', { text: value })])),
  );
  return [
    facts,
    fileSection('What it discovered', el('ul', {}, file.science.map((item) => el('li', { text: item })))),
    fileSection('How it worked', el('p', { text: file.how })),
    fileSection('Think about it', el('p', { class: 'story-ponder', text: file.ponder })),
    file.note ? el('p', { class: 'story-note', text: file.note }) : null,
    el('a', {
      class: 'story-source',
      href: file.source.url,
      target: '_blank',
      rel: 'noopener noreferrer',
      text: `Source: ${file.source.label}`,
    }),
  ];
}

export function createStoryUi({
  regions, onNext, onBack, onVoice, onSound, onReplayIntro, onLogbook, onExplore, onReturn, buildExtra,
}) {
  const stops = regions.map((name) => el('li', { class: 'story-stop', text: name }));
  const clock = el('span', { class: 'story-clock', title: 'The date in the simulation' });
  const voiceButton = el('button', {
    type: 'button',
    class: 'story-tool',
    'aria-pressed': 'false',
    text: 'Read aloud',
    onclick: onVoice,
  });
  const soundButton = el('button', { type: 'button', class: 'story-tool', 'aria-pressed': 'false', text: 'Music', onclick: onSound });
  const logbookButton = el('button', { type: 'button', class: 'story-tool', text: 'Logbook', onclick: onLogbook });
  const top = el('header', { class: 'story-top' }, [
    el('div', { class: 'story-brand', text: 'STILL HERE' }),
    el('ol', { class: 'story-journey', 'aria-label': 'Journey' }, stops),
    el('div', { class: 'story-tools' }, [
      clock,
      el('button', { type: 'button', class: 'story-tool', text: 'Replay intro', onclick: onReplayIntro }),
      soundButton,
      voiceButton,
      logbookButton,
      el('button', { type: 'button', class: 'story-tool', text: 'Explore freely', onclick: onExplore }),
    ]),
  ]);

  const region = el('span', { class: 'story-region' });
  const count = el('span', { class: 'story-count' });
  const status = el('span', { class: 'story-status' });
  const title = el('h2', { class: 'story-title', id: 'story-title' });
  const beat = el('span', { class: 'story-beat' });
  const speakerName = el('span');
  const voiceTag = el('span', {
    class: 'story-voice-tag',
    text: 'imagined voice',
    title: 'The machine\u2019s words are imagined. The facts are real.',
  });
  const speaker = el('div', { class: 'story-speaker' }, [beat, speakerName, voiceTag]);
  const recon = el('p', { class: 'story-recon', hidden: true });
  const typed = el('p', { class: 'story-text', 'aria-hidden': 'true' });
  const spoken = el('p', { class: 'story-sr', 'aria-live': 'polite' });
  const extra = el('div', { class: 'story-extra', hidden: true });
  const file = el('div', { class: 'story-file', id: 'story-file', hidden: true });
  let built = null;
  let fileChapter = null;
  const live = el('p', { class: 'story-live', hidden: true });
  const flying = el('p', { class: 'story-flying', role: 'status', hidden: true });
  const dots = el('div', { class: 'story-dots', 'aria-hidden': 'true' });
  const back = el('button', { type: 'button', class: 'story-btn', text: 'Back', onclick: onBack });
  const next = el('button', { type: 'button', class: 'story-btn is-primary', text: 'Next', onclick: onNext });
  const more = el('button', {
    type: 'button',
    class: 'story-btn story-more',
    'aria-expanded': 'false',
    'aria-controls': 'story-file',
    text: 'Explore more',
    onclick: () => toggleFile(),
  });

  const card = el('section', { class: 'story-card', 'aria-labelledby': 'story-title' }, [
    el('div', { class: 'story-meta' }, [region, count, status]),
    title,
    speaker,
    recon,
    typed,
    spoken,
    extra,
    file,
    live,
    flying,
    el('footer', { class: 'story-nav' }, [back, dots, more, next]),
  ]);
  const root = el('div', { class: 'story' }, [top, card]);
  const returnButton = el('button', {
    type: 'button',
    class: 'story-return',
    text: 'Back to the story',
    hidden: true,
    onclick: onReturn,
  });
  document.body.append(root, returnButton);

  const typewriter = createTypewriter(typed);
  typed.addEventListener('click', () => typewriter.finish());

  function toggleFile(open = file.hidden) {
    if (open && fileChapter?.file) {
      clear(file);
      append(file, [el('h3', { class: 'story-file-title', text: `Mission file \u00b7 ${fileChapter.speaker}` }), buildFile(fileChapter.file)]);
    }
    show(file, open && Boolean(fileChapter?.file));
    more.setAttribute('aria-expanded', String(!file.hidden));
    text(more, file.hidden ? 'Explore more' : 'Hide mission file');
    if (!file.hidden) file.scrollIntoView?.({ block: 'nearest' });
  }

  function renderJourney(currentRegion) {
    const at = regions.indexOf(currentRegion);
    stops.forEach((stop, i) => {
      css(stop, 'is-current', i === at);
      css(stop, 'is-done', i < at);
    });
  }

  function renderDots(steps, step) {
    clear(dots);
    for (let i = 0; i < steps; i++) dots.append(el('span', { class: i === step ? 'is-on' : '' }));
  }

  /**
   * @param {object} view
   * @param {object} view.chapter
   * @param {object} view.page the page to show
   */
  function render({ chapter, index, total, step, steps, page, nextLabel, canGoBack }) {
    renderJourney(chapter.region);
    text(region, chapter.region);
    text(count, `Stop ${index + 1} of ${total}`);
    show(status, Boolean(chapter.status));
    status.className = `story-status is-${chapter.status ?? 'none'}`;
    text(status, chapter.statusText ?? '');
    text(title, chapter.years ? `${chapter.title} \u00b7 ${chapter.years}` : chapter.title);

    const narrating = page.by === 'narrator';
    css(card, 'is-narrator', narrating);
    text(beat, BEATS[page.beat] ?? '');
    show(beat, Boolean(BEATS[page.beat]));
    text(speakerName, narrating ? NARRATOR_LABEL : chapter.speaker);
    show(voiceTag, !narrating);
    text(recon, page.scene?.reconstruction ?? '');
    show(recon, Boolean(page.scene?.reconstruction));

    built?.dispose();
    built = buildExtra ? buildExtra(page) : null;
    clear(extra);
    if (built) extra.append(built.node);
    show(extra, Boolean(built));
    css(card, 'is-interactive', Boolean(built));

    text(spoken, `${narrating ? 'Narrator' : chapter.speaker}: ${page.text}`);
    typewriter.play(page.text);

    if (fileChapter !== chapter) {
      fileChapter = chapter;
      toggleFile(false);
    }
    show(more, Boolean(chapter.file));

    renderDots(steps, step);
    back.disabled = !canGoBack;
    text(next, nextLabel);
  }

  return {
    render,
    /** Returns whether a page was still being typed (and is now shown whole). */
    finishTyping: () => typewriter.finish(),
    setClock(date) {
      text(clock, date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }));
    },
    setBadges(count) {
      text(logbookButton, count > 0 ? `Logbook \u00b7 \u2605 ${count}` : 'Logbook');
    },
    setLive(value) {
      show(live, Boolean(value));
      text(live, value ?? '');
    },
    /** While flying: where to, and why this is the next stop. */
    setFlying(name, bridge) {
      show(flying, Boolean(name));
      text(flying, name ? (bridge ? `${bridge} Flying to ${name}\u2026` : `Flying to ${name}\u2026`) : '');
    },
    setVoice(on, supported) {
      voiceButton.setAttribute('aria-pressed', String(on));
      css(voiceButton, 'is-on', on);
      voiceButton.disabled = !supported;
      if (!supported) voiceButton.title = 'This browser cannot read aloud';
    },
    setSound(on) {
      soundButton.setAttribute('aria-pressed', String(on));
      css(soundButton, 'is-on', on);
      text(soundButton, on ? 'Music: on' : 'Music: off');
    },
    setExploring(on) {
      show(root, !on);
      show(returnButton, on);
      if (on) returnButton.focus({ preventScroll: true });
      else next.focus({ preventScroll: true });
    },
    /** Hides the whole overlay while the opening plays over the scene. */
    setHidden(on) {
      show(root, !on);
    },
    focusNext: () => next.focus({ preventScroll: true }),
  };
}
