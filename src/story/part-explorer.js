/**
 * Clickable parts on the machine in view.
 *
 * Numbered markers sit on the model (craft-parts.js says where), and a tap on
 * one, or on the model itself, flies the camera to that part and opens a card
 * saying how it works, the way a click on a star flies there. "Whole machine"
 * or Escape lets go and eases back out.
 *
 * Works the same in the story and in the free explorer; the engine does the
 * picking and the camera's pivot, this only draws and decides.
 */
import { DEFAULT_PART_ZOOM } from '../engine/craft-parts.js';
import { append, clear, css, el, show } from '../ui/dom.js';

// How far apart the markers must spread on screen before they are drawn;
// closer than that they pile onto a machine too small to aim at, and a tap
// on the machine itself still works.
const MIN_SPREAD_PX = 150;
const ZOOM_MS = 1100;
// Clears the free explorer's own top bar when the story header is hidden.
const HEADER_FALLBACK_PX = 52;

const ease = (u) => (u < 0.5 ? 4 * u * u * u : 1 - (-2 * u + 2) ** 3 / 2);
const craftKeyOf = (target) => (target?.startsWith('craft:') ? target.slice(6) : null);

export function createPartExplorer(api, { reducedMotion = false, speak = () => {}, onFocus = () => {} } = {}) {
  const controls = api.controls;
  let enabled = true;
  let frame = 0;
  let zoomFrame = 0;
  let shownKey = null;
  let spots = [];
  let focused = null;
  let wholeDistance = null;
  let hinted = false;
  const seen = new Map();

  const layer = el('div', { class: 'parts-layer', 'aria-label': 'Parts of the machine', role: 'group' });
  const hint = el('p', { class: 'parts-hint', hidden: true, text: 'Tap any part of the machine to see how it works' });
  const title = el('h3', { class: 'part-card-title' });
  const body = el('p', { class: 'part-card-text' });
  const count = el('span', { class: 'part-card-count' });
  const card = el('section', { class: 'part-card', hidden: true, 'aria-live': 'polite', 'aria-label': 'How this part works' }, [
    el('p', { class: 'part-card-kicker' }, ['How it works', count]),
    title,
    body,
    el('div', { class: 'part-card-nav' }, [
      el('button', { type: 'button', class: 'story-btn', 'aria-label': 'Previous part', text: '\u2190', onclick: () => step(-1) }),
      el('button', { type: 'button', class: 'story-btn part-card-whole', text: 'Whole machine', onclick: () => release() }),
      el('button', { type: 'button', class: 'story-btn', 'aria-label': 'Next part', text: '\u2192', onclick: () => step(1) }),
    ]),
  ]);
  document.body.append(layer, hint, card);

  // The story's header wraps onto two or three rows on a phone, so the card
  // and hint go under wherever it actually ends.
  function placeUnderHeader() {
    let bottom = HEADER_FALLBACK_PX;
    for (const bar of document.querySelectorAll('.story-top > *')) {
      const rect = bar.getBoundingClientRect();
      if (rect.height > 0) bottom = Math.max(bottom, rect.bottom);
    }
    const top = `${Math.round(bottom + 12)}px`;
    hint.style.top = top;
    card.style.top = top;
  }

  function seenFor(key) {
    if (!seen.has(key)) seen.set(key, new Set());
    return seen.get(key);
  }

  function stopZoom() {
    if (zoomFrame) cancelAnimationFrame(zoomFrame);
    zoomFrame = 0;
  }

  function zoomTo(distance) {
    stopZoom();
    if (!(distance > 0)) return;
    if (reducedMotion) {
      controls.distanceRadii = distance;
      return;
    }
    const from = controls.distanceRadii;
    const start = performance.now();
    const tick = (now) => {
      const u = Math.min(1, (now - start) / ZOOM_MS);
      controls.distanceRadii = from + (distance - from) * ease(u);
      zoomFrame = u < 1 ? requestAnimationFrame(tick) : 0;
    };
    zoomFrame = requestAnimationFrame(tick);
  }

  function focus(key, index) {
    const parts = api.craftParts(key);
    const part = parts?.[index];
    if (!enabled || !part || !api.focusCraftPart(key, index)) return;
    if (!focused) wholeDistance = controls.distanceRadii;
    focused = { key, index };
    hinted = true;
    seenFor(key).add(index);
    zoomTo(part.zoom ?? DEFAULT_PART_ZOOM);
    title.textContent = part.name;
    body.textContent = part.text;
    count.textContent = ` \u00b7 ${index + 1} of ${parts.length}`;
    placeUnderHeader();
    show(card, true);
    speak(`${part.name}. ${part.text}`);
    onFocus();
  }

  function step(by) {
    if (!focused) return;
    const total = api.craftParts(focused.key)?.length ?? 0;
    if (total) focus(focused.key, (focused.index + by + total) % total);
  }

  /** Lets go of the part; `restore` eases back to where the camera was before. */
  function release({ restore = true } = {}) {
    if (!focused) return;
    focused = null;
    api.focusCraftPart(null, null);
    show(card, false);
    if (restore && wholeDistance) zoomTo(wholeDistance);
    else stopZoom();
    wholeDistance = null;
  }

  function buildSpots(key, parts) {
    clear(layer);
    spots = parts.map((part, i) =>
      el('button', {
        type: 'button',
        class: 'part-spot',
        'aria-label': `${i + 1}. ${part.name}`,
        title: part.name,
        text: String(i + 1),
        onclick: () => focus(key, i),
      }),
    );
    append(layer, spots);
    shownKey = key;
  }

  function hideMarkers() {
    if (shownKey === null) return;
    clear(layer);
    spots = [];
    shownKey = null;
  }

  function hideSpots() {
    hideMarkers();
    show(hint, false);
  }

  /** The larger side of the box around the markers on screen. */
  function spread(views) {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const view of views) {
      if (!view) continue;
      minX = Math.min(minX, view.x);
      maxX = Math.max(maxX, view.x);
      minY = Math.min(minY, view.y);
      maxY = Math.max(maxY, view.y);
    }
    return Math.max(maxX - minX, maxY - minY, 0);
  }

  function update() {
    frame = requestAnimationFrame(update);
    const key = craftKeyOf(api.state?.target);
    // Something else moved the target or the camera off the part.
    if (focused && !api.craftPartFocus) release({ restore: false });
    const views = enabled && key && !controls.flying ? api.craftPartViews(key) : null;
    if (!views) {
      hideSpots();
      return;
    }
    const hintWanted = !hinted && !focused;
    if (hintWanted && hint.hidden) placeUnderHeader();
    show(hint, hintWanted);
    if (spread(views.parts) < MIN_SPREAD_PX) {
      hideMarkers();
      return;
    }
    if (shownKey !== key || spots.length !== views.parts.length) buildSpots(key, api.craftParts(key));
    const done = seenFor(key);
    views.parts.forEach((view, i) => {
      const spot = spots[i];
      if (!spot) return;
      show(spot, Boolean(view));
      if (!view) return;
      spot.style.transform = `translate(${view.x.toFixed(1)}px, ${view.y.toFixed(1)}px) translate(-50%, -50%)`;
      css(spot, 'is-behind', view.behind);
      css(spot, 'is-seen', done.has(i));
      css(spot, 'is-on', focused?.key === key && focused.index === i);
    });
  }

  function onPart(event) {
    const { key, index } = event.detail ?? {};
    if (key !== undefined && index !== undefined) focus(key, index);
  }

  function onKey(event) {
    if (event.key !== 'Escape' || !focused) return;
    const tag = event.target?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    release();
    event.preventDefault();
  }

  // Grabbing the view ends the zoom rather than fighting it.
  const canvas = api.renderer?.domElement;
  canvas?.addEventListener('pointerdown', stopZoom);
  canvas?.addEventListener('wheel', stopZoom, { passive: true });
  window.addEventListener('cosminova:craftpart', onPart);
  window.addEventListener('keydown', onKey);
  window.addEventListener('resize', placeUnderHeader);
  frame = requestAnimationFrame(update);

  return {
    /** Off during the opening reconstruction, so nothing sits over it. */
    setEnabled(on) {
      enabled = Boolean(on);
      if (!enabled) {
        release({ restore: false });
        hideSpots();
      }
    },
    release,
    get focused() {
      return focused ? { ...focused } : null;
    },
    dispose() {
      cancelAnimationFrame(frame);
      stopZoom();
      release({ restore: false });
      canvas?.removeEventListener('pointerdown', stopZoom);
      canvas?.removeEventListener('wheel', stopZoom);
      window.removeEventListener('cosminova:craftpart', onPart);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', placeUnderHeader);
      layer.remove();
      hint.remove();
      card.remove();
    },
  };
}
