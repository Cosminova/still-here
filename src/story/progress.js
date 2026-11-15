/**
 * Which chapters have been visited, so the logbook can mark them.
 *
 * Storage throws in a private window rather than returning null, and a lost
 * tick in the logbook is not worth breaking the story over.
 */
const KEY = 'stillhere.visited';
const BADGE_KEY = 'stillhere.badges';

function load(key) {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) ?? '[]');
    return new Set(Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : []);
  } catch (error) {
    console.warn('[story] could not read progress', error);
    return new Set();
  }
}

function withEntry(set, id, key) {
  const next = new Set(set);
  next.add(id);
  try {
    window.localStorage.setItem(key, JSON.stringify([...next]));
  } catch (error) {
    console.warn('[story] could not save progress', error);
  }
  return next;
}

export const loadVisited = () => load(KEY);

/** Returns a new set with `id` added, and saves it. */
export const withVisited = (visited, id) => withEntry(visited, id, KEY);

/** Chapters where the reader made a decision or finished an activity. */
export const loadBadges = () => load(BADGE_KEY);

export const withBadge = (badges, id) => withEntry(badges, id, BADGE_KEY);
