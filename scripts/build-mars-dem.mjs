/**
 * Builds Mars elevation from the Mars Orbiter Laser Altimeter.
 *
 * MOLA fired its laser at Mars about 640 million times from Mars Global Surveyor
 * between 1997 and 2001, and the MEGDR is those ranges gridded: here the 32
 * pixel-per-degree product, about 1.85 km a pixel at the equator, in metres
 * above the areoid. The areoid already carries the planet's flattening, so these
 * heights go straight onto the oblate figure the renderer draws.
 *
 * The grid starts at 0°E on its left edge; the renderer's equirectangular maps
 * put the prime meridian in the centre, so every row is rolled by half a turn.
 *
 * Run: npm run fetch:assets && npm run build:mars
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readManifest, writeDemTier, writeNormalTier } from './lib/elevation-tiers.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'data-src', 'tex', 'mars-mola-32.img');
const OUT = path.join(ROOT, 'public', 'textures', 'bodies');
const MANIFEST = path.join(ROOT, 'public', 'textures', 'bodies.json');

// From the PDS label, megt90n000fb.lbl.
const SRC_WIDTH = 11520;
const SRC_HEIGHT = 5760;

// Whole metres, offset so the Hellas floor (-8.2 km) and the summit of Olympus
// Mons (+21.2 km) both land inside an unsigned 16-bit range.
const SCALE_KM = 0.001;
const OFFSET_KM = -32.768;
const RADIUS_KM = 3389.5;

// Same split as the Moon: displacement up to 4096 (5.2 km a texel), normals one
// tier finer, and procedural relief below that.
const DEM_WIDTHS = [128, 256, 512, 1024, 2048, 4096];
const NORMAL_WIDTHS = [8192];

function readMola() {
  if (!fs.existsSync(SRC)) {
    console.error(`missing ${path.relative(ROOT, SRC)}: run npm run fetch:assets first`);
    process.exit(1);
  }
  const raw = fs.readFileSync(SRC);
  if (raw.byteLength !== SRC_WIDTH * SRC_HEIGHT * 2) {
    throw new Error(`expected ${SRC_WIDTH * SRC_HEIGHT * 2} bytes of MOLA topography, got ${raw.byteLength}`);
  }
  const metres = new Float32Array(SRC_WIDTH * SRC_HEIGHT);
  const half = SRC_WIDTH / 2;
  for (let y = 0; y < SRC_HEIGHT; y++) {
    const row = y * SRC_WIDTH;
    for (let x = 0; x < SRC_WIDTH; x++) {
      metres[row + x] = raw.readInt16BE((row + ((x + half) % SRC_WIDTH)) * 2);
    }
  }
  return metres;
}

/**
 * Area-weighted resampling along one axis: each output sample is the mean of
 * the source it covers, fractional samples at the ends weighted by overlap.
 * Point sampling at these ratios would alias crater rims into noise.
 */
function resampleAxis(src, count, length, stride, step, outLength) {
  const out = new Float32Array(count * outLength);
  const scale = length / outLength;
  const outStride = stride === 1 ? 1 : count;
  const outStep = stride === 1 ? outLength : 1;
  for (let o = 0; o < outLength; o++) {
    const start = o * scale;
    const end = start + scale;
    const first = Math.floor(start);
    const last = Math.min(Math.ceil(end), length);
    for (let line = 0; line < count; line++) {
      let sum = 0;
      for (let i = first; i < last; i++) {
        const w = Math.min(end, i + 1) - Math.max(start, i);
        sum += src[line * step + i * stride] * w;
      }
      out[line * outStep + o * outStride] = sum / scale;
    }
  }
  return out;
}

function resample(metres, width, height) {
  const across = resampleAxis(metres, SRC_HEIGHT, SRC_WIDTH, 1, SRC_WIDTH, width);
  return resampleAxis(across, width, SRC_HEIGHT, width, 1, height);
}

function encode(metres) {
  const packed = new Uint16Array(metres.length);
  for (let i = 0; i < metres.length; i++) {
    const v = Math.round((metres[i] / 1000 - OFFSET_KM) / SCALE_KM);
    packed[i] = Math.max(0, Math.min(65535, v));
  }
  return packed;
}

console.log('building Mars elevation from MOLA MEGDR 32 px/deg');
const metres = readMola();
const manifest = readManifest(MANIFEST);
manifest.mars ??= {};
manifest.mars.dem = {};
manifest.mars.norm = {};

for (const width of [...new Set([...DEM_WIDTHS, ...NORMAL_WIDTHS])].sort((a, b) => a - b)) {
  const height = width / 2;
  const source = encode(resample(metres, width, height));
  const tier = { source, width, height, body: 'mars', scaleKm: SCALE_KM, outDir: OUT };
  if (DEM_WIDTHS.includes(width)) {
    manifest.mars.dem[width] = await writeDemTier({ ...tier, offsetKm: OFFSET_KM });
  }
  manifest.mars.norm[width] = await writeNormalTier({ ...tier, radiusKm: RADIUS_KM });
}

fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 1));
console.log('merged mars dem and norm into public/textures/bodies.json');
