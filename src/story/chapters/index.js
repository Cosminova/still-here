import { MOON } from './moon.js';
import { NEAR_EARTH, MARS } from './mars.js';
import { BELT, DEEP_SPACE, EPILOGUE } from './beyond.js';

/**
 * The journey in the order it is flown: outward from the Moon, then home. It
 * opens on the reconstruction of Surveyor 3 landing (../intro.js), which is
 * why the Moon comes first.
 */
export const CHAPTERS = Object.freeze([
  ...MOON,
  ...NEAR_EARTH,
  ...MARS,
  ...BELT,
  ...DEEP_SPACE,
  EPILOGUE,
]);

export const REGIONS = Object.freeze([...new Set(CHAPTERS.map((chapter) => chapter.region))]);

export const STATUS_LABELS = Object.freeze({
  silent: 'Silent',
  drifting: 'Drifting',
  working: 'Still useful',
  active: 'Still working',
});
