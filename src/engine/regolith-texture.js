import {
  DataTexture,
  LinearFilter,
  LinearMipmapLinearFilter,
  RGBAFormat,
  RepeatWrapping,
  UnsignedByteType,
} from 'three';

/**
 * Ground detail for the bodies with a measured elevation map, as a texture.
 *
 * Below the map's resolution the ground used to be computed per pixel, per
 * frame — crater octaves, a rock field, pebble noise — each faded in by the
 * pixel's distance, so the surface rebuilt itself as the camera moved. Here the
 * same job is one small tileable image made once at startup: slope in red and
 * green, albedo in blue. The terrain shader lays it over the ground at several
 * tile sizes at once, so no single repeat is ever the only thing in view, and
 * the hardware's mipmaps fade it with distance instead of any arithmetic.
 */

const SIZE = 512;

/** Deterministic hash in [0, 1). */
function hash(x, y, seed) {
  let h = (x * 374761393 + y * 668265263 + seed * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/** Value noise that wraps at `period` cells across the texture. */
function tileNoise(field, period, amp, seed) {
  const cell = SIZE / period;
  const lattice = new Float32Array((period + 1) * (period + 1));
  for (let j = 0; j <= period; j++) {
    for (let i = 0; i <= period; i++) lattice[j * (period + 1) + i] = hash(i % period, j % period, seed);
  }
  const at = (i, j) => lattice[j * (period + 1) + i];
  for (let y = 0; y < SIZE; y++) {
    const gy = y / cell;
    const y0 = Math.floor(gy);
    const fy = gy - y0;
    const sy = fy * fy * (3 - 2 * fy);
    for (let x = 0; x < SIZE; x++) {
      const gx = x / cell;
      const x0 = Math.floor(gx);
      const fx = gx - x0;
      const sx = fx * fx * (3 - 2 * fx);
      const top = at(x0, y0) * (1 - sx) + at(x0 + 1, y0) * sx;
      const bottom = at(x0, y0 + 1) * (1 - sx) + at(x0 + 1, y0 + 1) * sx;
      field[y * SIZE + x] += ((top * (1 - sy) + bottom * sy) - 0.5) * amp;
    }
  }
}

/**
 * Bowl-shaped craters wrapping at the edges, shaped like the real ones: a fresh
 * crater is about a fifth as deep as it is wide, its rim stands a few percent
 * of that above the plain, and its ejecta thins with the cube of distance and
 * is brighter than the soil around it. Weathering softens and darkens them, so
 * age decides how deep the bowl stays and whether the halo shows.
 */
function scatterCraters(height, albedo, count, seed) {
  const REACH = 2.4;
  for (let i = 0; i < count; i++) {
    const cx = hash(i, 1, seed) * SIZE;
    const cy = hash(i, 2, seed) * SIZE;
    // Many small, few large: the size distribution of real crater fields.
    const r = 1.2 + 46 * hash(i, 3, seed) ** 4;
    const age = hash(i, 4, seed);
    const depth = r * (0.4 - 0.3 * age);
    const rim = depth * 0.2;
    const halo = age < 0.2 ? 0.2 * (1 - age / 0.2) : 0;
    const reach = Math.ceil(r * REACH);
    const fx = cx % 1;
    const fy = cy % 1;
    const inv = 1 / (r * r);
    for (let dy = -reach; dy <= reach; dy++) {
      const y = (((Math.floor(cy) + dy) % SIZE) + SIZE) % SIZE;
      const ddy = (dy - fy) * (dy - fy);
      for (let dx = -reach; dx <= reach; dx++) {
        const d2 = ((dx - fx) * (dx - fx) + ddy) * inv;
        if (d2 > REACH * REACH) continue;
        const k = y * SIZE + ((((Math.floor(cx) + dx) % SIZE) + SIZE) % SIZE);
        if (d2 < 1) {
          const bowl = 1 - d2;
          height[k] += rim - (depth + rim) * bowl * (age > 0.5 ? Math.sqrt(bowl) : 1);
          albedo[k] += halo * 0.4 - 0.05 * age;
        } else {
          const d = Math.sqrt(d2);
          const fade = 1 - (d - 1) / (REACH - 1);
          const ejecta = fade / (d2 * d);
          height[k] += rim * ejecta;
          albedo[k] += halo * ejecta;
        }
      }
    }
  }
}

let cached = null;

/** The shared regolith texture, built on first use. */
export function regolithTexture() {
  if (cached) return cached;
  const height = new Float32Array(SIZE * SIZE);
  const albedo = new Float32Array(SIZE * SIZE);
  // Gentle rolling ground under the craters; on the Moon it is the craters,
  // at every scale, that make the surface.
  for (let o = 0, period = 4, amp = 2.5; o < 7; o++, period *= 2, amp *= 0.5) {
    tileNoise(height, period, amp, 11 + o);
  }
  tileNoise(albedo, 8, 0.14, 41);
  tileNoise(albedo, 32, 0.08, 43);
  scatterCraters(height, albedo, 1400, 7);

  // Slope by central differences, wrapping, normalised so the steepest few
  // percent fill the 8-bit range; the shader decides how steep that is.
  const slope = new Float32Array(SIZE * SIZE * 2);
  const magnitudes = new Float32Array(SIZE * SIZE);
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const k = y * SIZE + x;
      const sx = (height[y * SIZE + ((x + 1) % SIZE)] - height[y * SIZE + ((x + SIZE - 1) % SIZE)]) / 2;
      const sy = (height[((y + 1) % SIZE) * SIZE + x] - height[((y + SIZE - 1) % SIZE) * SIZE + x]) / 2;
      slope[k * 2] = sx;
      slope[k * 2 + 1] = sy;
      magnitudes[k] = Math.max(Math.abs(sx), Math.abs(sy));
    }
  }
  // Every seventh slope is plenty to find where the steepest few percent start.
  const sorted = magnitudes.filter((_, k) => k % 7 === 0).sort();
  const full = sorted[Math.floor(sorted.length * 0.98)] || 1;

  const data = new Uint8Array(SIZE * SIZE * 4);
  const byte = (v) => Math.max(0, Math.min(255, Math.round(v * 255)));
  for (let k = 0; k < SIZE * SIZE; k++) {
    data[k * 4] = byte(0.5 + 0.5 * Math.max(-1, Math.min(1, slope[k * 2] / full)));
    data[k * 4 + 1] = byte(0.5 + 0.5 * Math.max(-1, Math.min(1, slope[k * 2 + 1] / full)));
    data[k * 4 + 2] = byte(0.5 + albedo[k]);
    data[k * 4 + 3] = 255;
  }

  const texture = new DataTexture(data, SIZE, SIZE, RGBAFormat, UnsignedByteType);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.magFilter = LinearFilter;
  texture.minFilter = LinearMipmapLinearFilter;
  texture.generateMipmaps = true;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  cached = texture;
  return texture;
}

/**
 * Fragment-stage sampling. uDetailCell and uDetailFrac place the render anchor
 * in exact whole metres plus a remainder (offset by 2^24 so the cell is never
 * negative), so a tile size that is a power of two metres wraps with integer
 * arithmetic and the pattern holds still however far the anchor has moved.
 */
export const REGOLITH_GLSL = /* glsl */ `
  uniform ivec3 uDetailCell;
  uniform vec3 uDetailFrac;
  uniform sampler2D uRegolith;
  uniform float uHasRegolith;
  uniform float uRegolithRelief;
  uniform float uRegolithContrast;

  // One tile size, 2^bits metres, triplanar. xyz is a slope in the body frame,
  // w the albedo factor around 0.5.
  vec4 regolithLayer(vec3 dir, vec3 relMetres, int bits, vec2 shift) {
    float tile = float(1 << bits);
    ivec3 wrapped = uDetailCell & ivec3((1 << bits) - 1);
    vec3 p = (vec3(wrapped) + uDetailFrac + relMetres) / tile;
    vec3 w = dir * dir;
    w *= w;
    w /= (w.x + w.y + w.z);
    vec4 tx = texture2D(uRegolith, p.yz + shift);
    vec4 ty = texture2D(uRegolith, p.zx + shift.yx);
    vec4 tz = texture2D(uRegolith, p.xy - shift);
    vec2 gx = tx.rg * 2.0 - 1.0;
    vec2 gy = ty.rg * 2.0 - 1.0;
    vec2 gz = tz.rg * 2.0 - 1.0;
    vec3 grad = w.x * vec3(0.0, gx.x, gx.y) + w.y * vec3(gy.y, 0.0, gy.x) + w.z * vec3(gz.x, gz.y, 0.0);
    return vec4(grad, w.x * tx.b + w.y * ty.b + w.z * tz.b);
  }

  // Each layer fades out once a tile spans too few pixels for the remainder to
  // stay exact at that range; past the last one the baked normal map carries on.
  void addLayer(inout vec4 sum, vec3 dir, vec3 relMetres, int bits, vec2 shift, float amp, float footprintM) {
    float tile = float(1 << bits);
    float fade = 1.0 - smoothstep(tile / 96.0, tile / 24.0, footprintM);
    if (fade < 0.002) return;
    vec4 layer = regolithLayer(dir, relMetres, bits, shift);
    sum.xyz += layer.xyz * amp * fade;
    sum.w += (layer.w - 0.5) * fade;
  }

  vec4 regolith(vec3 dir, vec3 relMetres, float footprintM) {
    vec4 sum = vec4(0.0);
    addLayer(sum, dir, relMetres, 1, vec2(0.0), 0.55, footprintM);
    addLayer(sum, dir, relMetres, 4, vec2(0.37, 0.61), 0.45, footprintM);
    addLayer(sum, dir, relMetres, 7, vec2(0.13, 0.89), 0.35, footprintM);
    addLayer(sum, dir, relMetres, 10, vec2(0.71, 0.29), 0.3, footprintM);
    // Its largest craters are about a kilometre and a half across, a pixel on
    // the best global map, so it fills the gap down from orbit without drawing
    // craters the real map would contradict.
    addLayer(sum, dir, relMetres, 13, vec2(0.53, 0.17), 0.3, footprintM);
    return sum;
  }
`;
