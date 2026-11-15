/**
 * The story's visual pages: a real NASA photograph, a then-and-now slider
 * between two of them, labelled parts on a photograph, and the recap at the
 * end of the journey.
 *
 * Every photograph carries a "NASA photo" tag with its date and image ID, and
 * anything added on top of one says so, so a reader can always tell a real
 * picture from something this app drew.
 */
import { append, clear, css, el, show } from '../ui/dom.js';
import { PHOTOS, photoCredit, photoLink } from './photos.js';

const nothing = () => {};

function credit(photo) {
  return el('a', {
    class: 'story-credit',
    href: photoLink(photo),
    target: '_blank',
    rel: 'noopener noreferrer',
    text: photoCredit(photo),
  });
}

function image(photo) {
  return el('img', { src: photo.src, alt: photo.alt, loading: 'lazy', decoding: 'async', draggable: 'false' });
}

export function photoFigure(key) {
  const photo = PHOTOS[key];
  if (!photo) {
    console.warn(`[story] no photo called ${key}`);
    return null;
  }
  return el('figure', { class: 'story-photo' }, [
    el('div', { class: 'story-photo-frame' }, [image(photo), el('span', { class: 'story-tag is-nasa', text: 'NASA photo' })]),
    el('figcaption', {}, [el('span', { text: photo.caption }), ' ', credit(photo)]),
  ]);
}

/** Two photographs of the same thing, years apart, with a slider between them. */
export function createCompare({ params, earn = nothing }) {
  const before = PHOTOS[params.before];
  const after = PHOTOS[params.after];
  if (!before || !after) return null;
  const top = el('div', { class: 'story-compare-after' }, [image(after)]);
  const slider = el('input', {
    type: 'range',
    min: '0',
    max: '100',
    value: '50',
    class: 'story-compare-range',
    'aria-label': `Slide between ${before.date} and ${after.date}`,
  });
  const frame = el('div', { class: 'story-compare' }, [
    el('div', { class: 'story-compare-before' }, [image(before)]),
    top,
    el('span', { class: 'story-compare-date is-before', text: before.date }),
    el('span', { class: 'story-compare-date is-after', text: after.date }),
    el('span', { class: 'story-tag is-nasa', text: 'NASA photos' }),
  ]);
  let moved = false;
  const update = () => {
    const at = Number(slider.value);
    top.style.clipPath = `inset(0 0 0 ${at}%)`;
    if (!moved && (at < 20 || at > 80)) {
      moved = true;
      earn();
    }
  };
  slider.addEventListener('input', update);
  update();
  return {
    node: el('figure', { class: 'story-photo' }, [
      el('p', { class: 'story-prompt', text: params.prompt ?? 'Then and now: drag the slider' }),
      frame,
      slider,
      el('figcaption', {}, [
        el('span', { text: `Left: ${before.caption} Right: ${after.caption}` }),
        ' ',
        credit(before),
        ' ',
        credit(after),
      ]),
    ]),
    dispose: nothing,
  };
}

/** Numbered labels on a real photograph; each one opens what that part did. */
export function createParts({ params, earn = nothing, speak = nothing }) {
  const photo = PHOTOS[params.photo];
  if (!photo) return null;
  const seen = new Set();
  const detail = el('div', { class: 'story-reply', 'aria-live': 'polite', hidden: true });
  const pins = params.parts.map((part, i) =>
    el('button', {
      type: 'button',
      class: 'story-pin',
      style: { left: `${part.x}%`, top: `${part.y}%` },
      'aria-label': part.name,
      text: String(i + 1),
      onclick: () => pick(i),
    }),
  );
  const list = el(
    'div',
    { class: 'story-pin-list', role: 'group', 'aria-label': 'Parts' },
    params.parts.map((part, i) =>
      el('button', { type: 'button', class: 'story-chip', onclick: () => pick(i) }, [
        el('span', { class: 'story-chip-num', 'aria-hidden': 'true', text: String(i + 1) }),
        el('span', { class: 'story-chip-name', text: part.name }),
      ]),
    ),
  );

  function pick(i) {
    const part = params.parts[i];
    pins.forEach((pin, j) => css(pin, 'is-on', j === i));
    [...list.children].forEach((chip, j) => css(chip, 'is-on', j === i));
    css(pins[i], 'is-seen', true);
    css(list.children[i], 'is-seen', true);
    clear(detail);
    append(detail, [el('p', { class: 'story-verdict', text: part.name }), el('p', { text: part.text })]);
    show(detail, true);
    speak(`${part.name}. ${part.text}`);
    seen.add(i);
    if (seen.size === params.parts.length) earn();
  }

  // The pins are placed in percent of the picture, so the box they sit in has
  // to be exactly the picture: its shape is set from the image once it loads.
  const picture = image(photo);
  const box = el('div', { class: 'story-pins-box' }, [picture, ...pins]);
  const fit = () => {
    if (picture.naturalWidth > 0) box.style.setProperty('--ratio', String(picture.naturalWidth / picture.naturalHeight));
  };
  picture.addEventListener('load', fit);
  fit();

  return {
    node: el('figure', { class: 'story-photo' }, [
      el('p', { class: 'story-prompt', text: params.prompt ?? 'Tap a number' }),
      el('div', { class: 'story-photo-frame' }, [
        box,
        el('span', { class: 'story-tag is-nasa', text: 'NASA photo \u00b7 numbers added' }),
      ]),
      list,
      detail,
      el('figcaption', {}, [el('span', { text: photo.caption }), ' ', credit(photo)]),
    ]),
    dispose: nothing,
  };
}

/** A button that plays a reconstruction again, like the opening landing. */
export function createReplay({ params, onReplayIntro = nothing }) {
  return {
    node: el('div', { class: 'act-row' }, [
      el('button', { type: 'button', class: 'story-btn', text: params.label ?? 'Watch it again', onclick: () => onReplayIntro() }),
    ]),
    dispose: nothing,
  };
}

/**
 * The end of the journey: one thing each machine taught us, ticked where the
 * reader actually went, and the ways to carry on.
 */
export function createRecap({ chapters = [], visited = () => new Set(), onReplayIntro = nothing, onLogbook = nothing, onExplore = nothing }) {
  const been = visited();
  const items = chapters
    .filter((chapter) => chapter.learned)
    .map((chapter) =>
      el('li', { class: been.has(chapter.id) ? 'is-visited' : '' }, [
        el('span', { class: 'story-recap-name', text: chapter.speaker }),
        el('span', { text: chapter.learned }),
      ]),
    );
  return {
    node: el('div', { class: 'story-recap' }, [
      el('p', { class: 'story-prompt', text: 'What they taught us' }),
      el('ul', {}, items),
      el('div', { class: 'act-row' }, [
        el('button', { type: 'button', class: 'story-btn', text: 'Revisit a machine', onclick: () => onLogbook() }),
        el('button', { type: 'button', class: 'story-btn', text: 'Watch the landing again', onclick: () => onReplayIntro() }),
        el('button', { type: 'button', class: 'story-btn', text: 'Explore on your own', onclick: () => onExplore() }),
      ]),
    ]),
    dispose: nothing,
  };
}
