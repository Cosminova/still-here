import {
  Box3,
  Color,
  DoubleSide,
  Group,
  ShaderMaterial,
  Vector3,
} from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { CRAFT_MODELS, NASA_MODELS, modelFile } from './craft-nasa-models.js';

/**
 * NASA's own spacecraft models, loaded on first approach.
 *
 * A model is loaded once per name and part, normalised — stood up, centred,
 * measured — and then cloned per craft, so the geometry and materials are
 * shared. Its materials are replaced: the published ones are physically based
 * and expect lights and an environment map, neither of which this renderer
 * has, and a metallic surface with nothing to reflect renders black. Instead
 * each one keeps its colour and texture and is lit by the same sun direction,
 * through the same uniforms, as every procedural craft.
 */

const DEG = Math.PI / 180;
// How far a model standing on a surface is let down into it, as a fraction of
// its height. The terrain between two vertices is a flat triangle, so feet set
// exactly on the height function can float over a hollow by a few centimetres.
const GROUND_SINK = 0.02;

const BASE = import.meta.env?.BASE_URL ?? './';

/**
 * How far a model has to be raised along its own up axis to stand on the
 * ground rather than be cut by it, given its lowest point and its height in
 * model units. Models are mostly built about their middle, and a craft field
 * that puts the origin on the ground buries half of every lander.
 */
export function groundLift(minY, height) {
  return Math.max(0, -minY - height * GROUND_SINK);
}

let loader = null;
function gltfLoader() {
  if (loader) return loader;
  const draco = new DRACOLoader();
  draco.setDecoderPath(`${BASE}draco/`);
  loader = new GLTFLoader();
  loader.setDRACOLoader(draco);
  return loader;
}

/** The NASA model entry for a craft, or null when it keeps its procedural one. */
export function nasaModelFor(craftKey) {
  const entry = CRAFT_MODELS[craftKey];
  if (!entry || !NASA_MODELS[entry.model]) return null;
  return { ...NASA_MODELS[entry.model], ...entry };
}

const VERTEX = /* glsl */`
  #include <common>
  #include <logdepthbuf_pars_vertex>
  varying vec3 vNormal;
  varying vec3 vView;
  varying vec2 vUv;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    #ifdef HAS_UV
      vUv = uv;
    #else
      vUv = vec2(0.0);
    #endif
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vView = mv.xyz;
    gl_Position = projectionMatrix * mv;
    #include <logdepthbuf_vertex>
  }
`;

const FRAGMENT = /* glsl */`
  #include <common>
  #include <logdepthbuf_pars_fragment>
  uniform vec3 uSunDirView;
  uniform float uAmbient;
  uniform float uExposure;
  uniform float uFade;
  uniform vec3 uColor;
  uniform vec3 uEmissive;
  uniform float uSpec;
  uniform float uOpacity;
  #ifdef HAS_MAP
    uniform sampler2D uMap;
  #endif
  varying vec3 vNormal;
  varying vec3 vView;
  varying vec2 vUv;
  void main() {
    #include <logdepthbuf_fragment>
    vec3 albedo = uColor;
    float alpha = uOpacity;
    #ifdef HAS_MAP
      vec4 texel = texture2D(uMap, vUv);
      albedo *= texel.rgb;
      alpha *= texel.a;
    #endif
    if (alpha < 0.02) discard;
    vec3 n = normalize(vNormal);
    vec3 v = normalize(-vView);
    // Two-sided: solar panels and foil are single surfaces with no back.
    if (dot(n, v) < 0.0) n = -n;
    vec3 l = normalize(uSunDirView);
    float diffuse = max(dot(n, l), 0.0);
    vec3 h = normalize(l + v);
    float gloss = mix(12.0, 220.0, uSpec);
    float spec = pow(max(dot(n, h), 0.0), gloss) * uSpec * step(0.001, diffuse);
    vec3 colour = albedo * (diffuse + uAmbient) + vec3(spec) + uEmissive;
    gl_FragColor = vec4(colour * uExposure, alpha * uFade);
  }
`;

/**
 * A sun-lit material standing in for one of the model's own. `shared` is the
 * procedural craft material's uniforms, held by reference so the sun direction
 * set on it each frame lights these too.
 */
function convertMaterial(source, shared, hasUv, colors) {
  const map = hasUv ? source.map ?? null : null;
  const override = colors?.[source.name];
  if (map) map.anisotropy = 4;
  const metal = source.metalness ?? 0;
  const rough = source.roughness ?? 1;
  // Metals and smooth paint get a tighter, brighter highlight; that is all of
  // the physically based model that survives without an environment to reflect.
  const spec = Math.min(1, 0.06 + 0.5 * metal + 0.3 * (1 - rough));
  const opacity = source.transparent ? source.opacity ?? 1 : 1;
  const defines = {};
  if (map) defines.HAS_MAP = '';
  if (hasUv) defines.HAS_UV = '';
  return new ShaderMaterial({
    // Kept so a clickable part can be found by what it is made of (craft-parts.js).
    name: source.name ?? '',
    uniforms: {
      uSunDirView: shared.uSunDirView,
      uAmbient: shared.uAmbient,
      uExposure: shared.uExposure,
      uFade: shared.uFade,
      uColor: { value: override ? new Color(...override) : source.color ? source.color.clone() : new Color(1, 1, 1) },
      uEmissive: { value: source.emissive ? source.emissive.clone() : new Color(0, 0, 0) },
      uSpec: { value: spec },
      uOpacity: { value: opacity },
      uMap: { value: map },
    },
    defines,
    vertexShader: VERTEX,
    fragmentShader: FRAGMENT,
    side: DoubleSide,
    transparent: opacity < 1,
    depthWrite: opacity >= 1,
  });
}

/** Removes the meshes on the wrong side of a stage split, by mesh centre height. */
function keepPart(root, split, part) {
  const full = new Box3().setFromObject(root);
  const cut = full.min.y + (full.max.y - full.min.y) * split;
  const centre = new Vector3();
  const drop = [];
  root.traverse((object) => {
    if (!object.isMesh) return;
    new Box3().setFromObject(object).getCenter(centre);
    if ((centre.y < cut) !== (part === 'descent')) drop.push(object);
  });
  for (const object of drop) object.removeFromParent();
}

function replaceMaterials(root, shared, colors) {
  const converted = new Map();
  const convert = (material, hasUv) => {
    const key = `${material.uuid}|${hasUv}`;
    if (!converted.has(key)) converted.set(key, convertMaterial(material, shared, hasUv, colors));
    return converted.get(key);
  };
  root.traverse((object) => {
    if (!object.isMesh) return;
    const geometry = object.geometry;
    if (!geometry.attributes.normal) geometry.computeVertexNormals();
    const hasUv = Boolean(geometry.attributes.uv);
    object.material = Array.isArray(object.material)
      ? object.material.map((m) => convert(m, hasUv))
      : convert(object.material, hasUv);
    object.frustumCulled = false;
  });
}

async function buildTemplate(entry, shared) {
  const gltf = await gltfLoader().loadAsync(`${BASE}${modelFile(entry.model)}`);
  const root = gltf.scene;
  if (entry.rotate) root.rotation.set(entry.rotate[0] * DEG, entry.rotate[1] * DEG, entry.rotate[2] * DEG);
  root.updateMatrixWorld(true);
  // Measured whole, so one stage of a split model keeps the scale of the
  // vehicle it was part of rather than being blown up to the full length.
  const whole = new Box3().setFromObject(root).getSize(new Vector3());
  if (entry.part && entry.split) {
    keepPart(root, entry.split, entry.part);
    root.updateMatrixWorld(true);
  }
  replaceMaterials(root, shared, entry.colors);

  const box = new Box3().setFromObject(root);
  if (box.isEmpty()) throw new Error(`${entry.model}: no geometry`);
  const size = box.getSize(new Vector3());
  const centre = box.getCenter(new Vector3());
  // A model that stands on a surface has its feet at the origin, which is where
  // the craft field puts the ground; anything else turns about its middle.
  const base = entry.ground ? box.min.y + size.y * GROUND_SINK : centre.y;
  root.position.sub(new Vector3(centre.x, base, centre.z));
  const pivot = new Group();
  pivot.add(root);
  return {
    object: pivot,
    extent: Math.max(whole.x, whole.y, whole.z),
    lift: groundLift(box.min.y - base, size.y),
  };
}

const templates = new Map();

/**
 * The normalised model for an entry from nasaModelFor, loaded once and shared.
 * Resolves to null if the file is missing or fails to parse, in which case the
 * craft keeps its procedural model.
 */
export function loadCraftModel(entry, shared) {
  const key = `${entry.model}|${entry.part ?? ''}`;
  if (!templates.has(key)) {
    templates.set(key, buildTemplate(entry, shared).catch((error) => {
      console.warn(`NASA model ${entry.model} unavailable, keeping the procedural one:`, error?.message ?? error);
      return null;
    }));
  }
  return templates.get(key);
}
