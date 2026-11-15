/**
 * Downloads NASA's spacecraft models into public/models/ and copies the Draco
 * decoder they need into public/draco/. The models are NASA's own, from the
 * NASA 3D Resources collection, and are public domain; the list is
 * src/engine/craft-nasa-models.js. Files already present are skipped, so this
 * is safe to re-run.
 *
 * Run: npm run fetch:models
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { NASA_3D_RESOURCES, NASA_MODELS } from '../src/engine/craft-nasa-models.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'public', 'models');
const DRACO_SRC = path.join(ROOT, 'node_modules', 'three', 'examples', 'jsm', 'libs', 'draco', 'gltf');
const DRACO_OUT = path.join(ROOT, 'public', 'draco');
const DRACO_FILES = ['draco_decoder.js', 'draco_decoder.wasm', 'draco_wasm_wrapper.js'];
// A Git LFS pointer is a few hundred bytes of text; a real model is not.
const MIN_GLB_BYTES = 4096;

fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(DRACO_OUT, { recursive: true });

const human = (n) => (n > 1 << 20 ? `${(n / (1 << 20)).toFixed(1)} MB` : `${(n / 1024).toFixed(0)} KB`);

function isGlb(buffer) {
  return buffer.byteLength >= MIN_GLB_BYTES && buffer.toString('ascii', 0, 4) === 'glTF';
}

async function download(name, { path: remote }) {
  const dest = path.join(OUT, `${name}.glb`);
  if (fs.existsSync(dest) && isGlb(fs.readFileSync(dest))) {
    console.log(`  skip  ${name.padEnd(14)} ${human(fs.statSync(dest).size)}`);
    return true;
  }
  const url = NASA_3D_RESOURCES + remote.split('/').map(encodeURIComponent).join('/');
  try {
    const response = await fetch(url, { redirect: 'follow' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const buffer = Buffer.from(await response.arrayBuffer());
    if (!isGlb(buffer)) throw new Error(`not a GLB (${buffer.byteLength} bytes)`);
    // Written under a temp name so an interrupted run cannot leave a
    // truncated file that a later run would skip.
    fs.writeFileSync(`${dest}.part`, buffer);
    fs.renameSync(`${dest}.part`, dest);
    console.log(`  got   ${name.padEnd(14)} ${human(buffer.byteLength)}`);
    return true;
  } catch (error) {
    console.log(`  FAIL  ${name.padEnd(14)} ${error.message}  ${url}`);
    return false;
  }
}

for (const file of DRACO_FILES) {
  const from = path.join(DRACO_SRC, file);
  if (!fs.existsSync(from)) {
    console.error(`missing ${from}; run npm install first`);
    process.exit(1);
  }
  fs.copyFileSync(from, path.join(DRACO_OUT, file));
}
console.log(`copied the Draco decoder into public/draco`);

const entries = Object.entries(NASA_MODELS);
console.log(`fetching ${entries.length} NASA models into public/models`);
let failed = 0;
// Sequential: one host, and a burst of parallel LFS requests gets throttled.
for (const [name, spec] of entries) if (!(await download(name, spec))) failed++;

const total = fs.readdirSync(OUT).reduce((sum, f) => sum + fs.statSync(path.join(OUT, f)).size, 0);
console.log(`total ${human(total)} in public/models`);
if (failed) {
  // Not fatal: a craft without its file keeps the procedural model.
  console.warn(`${failed} model(s) failed; those craft keep their procedural models`);
}
