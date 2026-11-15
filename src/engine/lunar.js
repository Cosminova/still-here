/**
 * Where the Moon is and which way it faces, on a real date.
 *
 * Every other moon here circles its planet's equator from an arbitrary phase,
 * which is harmless for Titan but not for ours: the phase decides where the
 * Sun stands over each landing site, and a uniform orbit from an arbitrary
 * epoch put Apollo 11's landing at local night. Position is the truncated
 * ELP2000 series the sky view already uses (see moonPosition in solar.js), so
 * the Moon in the sky and the Moon you fly to are the same Moon.
 *
 * Orientation follows Cassini's laws: the spin axis is tilted 1.54 degrees
 * from ecliptic north, on the far side of it from the orbit's pole, so the
 * three precess together; and the prime meridian turns with the mean
 * longitude, so it faces the mean direction of the Earth and the real Earth
 * swings about it by the libration.
 *
 * All angles are referred to the J2000 ecliptic by removing the general
 * precession, to match the planets.
 */

import { moonPosition } from '../solar.js';

const DEG = Math.PI / 180;
const PRECESSION_DEG_PER_CENTURY = 1.396971;
const EQUATOR_TILT_DEG = 1.5424;

const sinD = (deg) => Math.sin(deg * DEG);
const cosD = (deg) => Math.cos(deg * DEG);

/** Ecliptic (x, y, z with +z north) into the Y-up world frame. */
const toWorld = (x, y, z, out) => out.set(x, z, -y);

/**
 * The Moon's offset from the Earth's centre, in km, in the world frame.
 * @param {number} T Julian centuries from J2000
 * @param {import('three').Vector3} out
 */
export function moonOffset(T, out) {
  const { lambda, beta, distanceKm: r } = moonPosition(T);
  const lon = lambda - PRECESSION_DEG_PER_CENTURY * T;
  return toWorld(r * cosD(beta) * cosD(lon), r * cosD(beta) * sinD(lon), r * sinD(beta), out);
}

/** The Moon's spin axis, a unit vector in the world frame. */
export function moonPole(T, out) {
  const node = 125.0445 - 1934.1363 * T - PRECESSION_DEG_PER_CENTURY * T;
  const s = sinD(EQUATOR_TILT_DEG);
  return toWorld(-s * sinD(node), s * cosD(node), cosD(EQUATOR_TILT_DEG), out);
}

/** Unit vector from the Earth towards the Moon's mean longitude, in the ecliptic. */
export function moonMeanDirection(T, out) {
  const lon = 218.3165 + 481267.8813 * T - PRECESSION_DEG_PER_CENTURY * T;
  return toWorld(cosD(lon), sinD(lon), 0, out);
}

/** One sidereal month, in Julian centuries, for tracing the orbit. */
export const SIDEREAL_MONTH_CENTURIES = 27.321662 / 36525;
