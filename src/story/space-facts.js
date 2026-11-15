/**
 * Live distances for the story, read from the engine at whatever date the
 * simulation is showing, so a number on screen is the number for that moment.
 */
export const AU_KM = 149597870.7;
export const LIGHT_KMS = 299792.458;

/** Position of a body key or a `craft:` key, or null when it is not placed. */
export function positionOf(api, key) {
  if (key.startsWith('craft:')) {
    const item = api.craftField.get(key.slice(6));
    return item?.present ? item.position : null;
  }
  return api.universe.get(key)?.position ?? null;
}

/** Centre-to-centre distance in km, or null when either end is missing. */
export function distanceKm(api, from, to) {
  const a = positionOf(api, from);
  const b = positionOf(api, to);
  return a && b ? a.distanceTo(b) : null;
}

export function formatKm(km) {
  if (km >= 1e9) return `${(km / 1e9).toFixed(1)} billion km`;
  if (km >= 1e6) return `${Math.round(km / 1e6)} million km`;
  return `${Math.round(km).toLocaleString()} km`;
}

export function formatLightTime(seconds) {
  const hours = seconds / 3600;
  if (hours >= 1) return `${hours.toFixed(1)} hours`;
  if (seconds >= 60) return `${Math.max(1, Math.round(seconds / 60))} minutes`;
  return `${seconds.toFixed(1)} seconds`;
}
