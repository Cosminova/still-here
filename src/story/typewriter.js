/**
 * Types a page out a character at a time, the way a signal arrives.
 *
 * Only the look of it: the full text is written straight into a screen-reader
 * node by the caller, so assistive technology gets each page once instead of a
 * stream of half-words. Reduced motion skips the effect entirely.
 */
const CHARS_PER_SECOND = 55;

export function createTypewriter(node) {
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  let frame = 0;
  let full = '';
  let shown = -1;

  function stop() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
  }

  function play(value) {
    stop();
    full = value;
    shown = -1;
    if (reduced) {
      node.textContent = full;
      return;
    }
    node.textContent = '';
    const start = performance.now();
    const tick = (now) => {
      const count = Math.min(full.length, Math.floor(((now - start) / 1000) * CHARS_PER_SECOND));
      if (count !== shown) {
        shown = count;
        node.textContent = full.slice(0, count);
      }
      frame = count < full.length ? requestAnimationFrame(tick) : 0;
    };
    frame = requestAnimationFrame(tick);
  }

  /** Shows the whole page at once. Returns whether it was still typing. */
  function finish() {
    if (!frame) return false;
    stop();
    node.textContent = full;
    return true;
  }

  return { play, finish, stop };
}
