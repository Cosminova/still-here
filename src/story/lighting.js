/**
 * Choosing a moment when the Sun is up over a landing site.
 *
 * A site visited at local night is a black screen with a label on it, and on
 * the Moon night lasts two weeks. So each surface chapter searches forward from
 * today for a time when the Sun stands at a low, shadow-casting height over the
 * site, using the same latitude/longitude convention the engine places the
 * craft with (see CraftField._placeSurfaceAt).
 */
import { Vector3 } from 'three';
import { LANDING_SITES } from '../engine/craft-data.js';

const DEG = Math.PI / 180;
const DAY_MS = 86400000;
const STEPS_PER_ROTATION = 96;

/** Wanted sun height, degrees: high enough to light the ground, low enough for relief. */
const WINDOW = Object.freeze({ min: 14, max: 45, ideal: 26 });

/**
 * One solar day per body, and how far to step between attempts when a whole
 * day never brings the Sun into the window — the Martian Arctic in winter.
 */
const PLAN = Object.freeze({
  moon: { dayDays: 29.53, seasonStepDays: 0, seasons: 1 },
  mars: { dayDays: 1.0275, seasonStepDays: 30, seasons: 24 },
});

const SITE_BY_KEY = new Map(LANDING_SITES.map((site) => [site.key, site]));

const clamp = (value, lo, hi) => Math.min(hi, Math.max(lo, value));

function sunElevationDeg(universe, site, date, scratch) {
  universe.update(date);
  const body = universe.get(site.body);
  const sun = universe.get('sun');
  if (!body?.orientation || !sun) return null;
  const lat = site.latDeg * DEG;
  const lon = site.lonDeg * DEG;
  const cosLat = Math.cos(lat);
  const normal = scratch.normal
    .set(-cosLat * Math.cos(lon), Math.sin(lat), cosLat * Math.sin(lon))
    .applyQuaternion(body.orientation);
  const toSun = scratch.toSun.subVectors(sun.position, body.position).normalize();
  return Math.asin(clamp(normal.dot(toSun), -1, 1)) / DEG;
}

/**
 * @param {object} universe the engine's Universe; left at whatever date was
 *   tried last, so the caller must set the date it wants afterwards
 * @param {string} siteKey key into LANDING_SITES
 * @param {Date} from
 * @returns {Date} the first good moment, or the closest one found, or `from`
 */
export function findLitDate(universe, siteKey, from = new Date()) {
  const site = SITE_BY_KEY.get(siteKey);
  const plan = site ? PLAN[site.body] : null;
  if (!plan) return from;

  const scratch = { normal: new Vector3(), toSun: new Vector3() };
  const stepMs = (plan.dayDays * DAY_MS) / STEPS_PER_ROTATION;
  let best = { date: from, miss: Infinity };
  for (let season = 0; season < plan.seasons; season++) {
    const start = from.getTime() + season * plan.seasonStepDays * DAY_MS;
    for (let i = 0; i < STEPS_PER_ROTATION; i++) {
      const date = new Date(start + i * stepMs);
      const elevation = sunElevationDeg(universe, site, date, scratch);
      if (elevation === null) return from;
      if (elevation >= WINDOW.min && elevation <= WINDOW.max) return date;
      const miss = Math.abs(elevation - WINDOW.ideal);
      if (miss < best.miss) best = { date, miss };
    }
  }
  return best.date;
}
