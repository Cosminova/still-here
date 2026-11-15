/**
 * Writes elevation rasters in the form the client loads: packed height PNGs and
 * baked normal JPEGs, one per width tier, plus the manifest entry for each.
 *
 * Elevation is re-encoded losslessly into two 8-bit channels, because a browser
 * cannot hand a 16-bit PNG to WebGL with its precision intact.
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

export const human = (n) => (n > 1 << 20 ? `${(n / (1 << 20)).toFixed(1)} MB` : `${(n / 1024).toFixed(0)} KB`);

/**
 * Splits each 16-bit height across red (high byte) and green (low byte). PNG so
 * it stays lossless: a JPEG here would put ringing artefacts into the high byte,
 * which reads as kilometre-high cliffs.
 */
export async function writeDemTier({ source, width, height, body, scaleKm, offsetKm, outDir }) {
  const rgb = Buffer.alloc(width * height * 3);
  let min = Infinity;
  let max = -Infinity;
  for (let i = 0; i < source.length; i++) {
    const v = source[i];
    rgb[i * 3] = (v >> 8) & 255;
    rgb[i * 3 + 1] = v & 255;
    if (v < min) min = v;
    if (v > max) max = v;
  }

  const name = `${body}-dem-${width}.png`;
  const out = path.join(outDir, name);
  await sharp(rgb, { raw: { width, height, channels: 3 } })
    .png({ compressionLevel: 9, effort: 10, palette: false })
    .toFile(out);

  const minKm = min * scaleKm + offsetKm;
  const maxKm = max * scaleKm + offsetKm;
  console.log(
    `  dem   ${name.padEnd(30)} ${human(fs.statSync(out).size)}  relief ${minKm.toFixed(2)} .. ${maxKm.toFixed(2)} km`,
  );
  // Keyed by width rather than a near/far pair: the renderer picks the level
  // whose texel matches its current vertex spacing, so displacement is always
  // band-limited to the geometry that carries it.
  return { file: `bodies/${name}`, width, height, scaleKm, offsetKm, minKm, maxKm };
}

/**
 * Bakes surface normals from an elevation tier.
 *
 * Shading cannot read the packed 16-bit heights through a hardware filter, so
 * without this the only way to keep slopes from aliasing is to widen the sample
 * stencil until the detail is smeared away. Normals in an ordinary 8-bit texture
 * can be mipmapped and anisotropically filtered, which band-limits shading
 * correctly at every angle and costs one tap instead of sixteen. JPEG is fine
 * here: a slightly wrong normal is invisible, unlike a slightly wrong height.
 */
export async function writeNormalTier({ source, width, height, body, scaleKm, radiusKm, outDir }) {
  const rgb = Buffer.alloc(width * height * 3);
  const at = (x, y) => source[y * width + ((x + width) % width)];

  for (let y = 0; y < height; y++) {
    // Metre spacing of one texel, east and north, at this latitude. Longitude
    // lines converge at the poles, so the east step shrinks with cos(lat).
    const lat = (0.5 - (y + 0.5) / height) * Math.PI;
    const dEast = Math.max(Math.cos(lat), 1e-3) * ((2 * Math.PI * radiusKm) / width);
    const dNorth = (Math.PI * radiusKm) / height;
    const y0 = Math.max(y - 1, 0);
    const y1 = Math.min(y + 1, height - 1);

    for (let x = 0; x < width; x++) {
      const slopeEast = ((at(x + 1, y) - at(x - 1, y)) * scaleKm) / (2 * dEast);
      const slopeNorth = ((at(x, y1) - at(x, y0)) * scaleKm) / (2 * dNorth);
      const inv = 1 / Math.sqrt(slopeEast * slopeEast + slopeNorth * slopeNorth + 1);
      const i = (y * width + x) * 3;
      rgb[i] = Math.round((-slopeEast * inv * 0.5 + 0.5) * 255);
      rgb[i + 1] = Math.round((slopeNorth * inv * 0.5 + 0.5) * 255);
      rgb[i + 2] = Math.round((inv * 0.5 + 0.5) * 255);
    }
  }

  const name = `${body}-norm-${width}.jpg`;
  const out = path.join(outDir, name);
  await sharp(rgb, { raw: { width, height, channels: 3 } })
    .jpeg({ quality: 92, chromaSubsampling: '4:4:4', mozjpeg: true })
    .toFile(out);
  console.log(`  norm  ${name.padEnd(30)} ${human(fs.statSync(out).size)}`);
  return { file: `bodies/${name}`, width, height };
}

/**
 * Reads the client manifest so a partial rebuild adds to it rather than
 * replacing it: the raw sources for most bodies are hundreds of megabytes and
 * are not kept on every machine that rebuilds one of them.
 */
export function readManifest(file) {
  if (!fs.existsSync(file)) return {};
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}
