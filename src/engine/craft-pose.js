import {
  AdditiveBlending,
  CanvasTexture,
  Euler,
  Group,
  Quaternion,
  Sprite,
  SpriteMaterial,
  Vector3,
} from 'three';

/**
 * Staged poses, for the story's reconstructions of a landing or a hover.
 *
 * A pose moves the drawn model off its resting place, in metres along the
 * craft's own axes (y is its up), tilts it, and can show two effects: a glow
 * under the engines and a flat ring of blown dust on the ground. The craft's
 * recorded position is never touched, so clearing the pose puts the model
 * exactly back where the mission record has it.
 *
 * Rocket exhaust in a vacuum is close to invisible, so the glow is an
 * illustration; the story labels the scene a reconstruction for that reason.
 */

const DEG = Math.PI / 180;
// Under the engines rather than on them, so the glow lights the ground and not
// the lander's body.
const GLOW_ABOVE_GROUND_M = 0.15;
const DUST_ABOVE_GROUND_M = 0;
// Height of the dust cloud's sprite as a fraction of its radius; the ground hides the lower half.
const DUST_HEIGHT_RATIO = 0.9;

const DEFAULT_POSE = Object.freeze({
  x: 0, y: 0, z: 0, tiltX: 0, tiltZ: 0, glow: 0, dust: 0, glowSizeM: 1.8, dustRadiusM: 8,
});

export function normalisePose(pose) {
  if (!pose) return null;
  const merged = { ...DEFAULT_POSE, ...pose };
  for (const key of Object.keys(DEFAULT_POSE)) {
    if (!Number.isFinite(merged[key])) merged[key] = DEFAULT_POSE[key];
  }
  return Object.freeze(merged);
}

const offset = new Vector3();
const tilt = new Quaternion();
const euler = new Euler();

/** Moves and tilts a mesh already placed at the craft's resting place. */
export function applyPose(mesh, pose, orientation) {
  offset.set(pose.x, pose.y, pose.z).multiplyScalar(0.001).applyQuaternion(orientation);
  mesh.position.add(offset);
  if (pose.tiltX || pose.tiltZ) {
    tilt.setFromEuler(euler.set(pose.tiltX * DEG, 0, pose.tiltZ * DEG));
    mesh.quaternion.multiply(tilt);
  }
}

function radialTexture(stops) {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const g = canvas.getContext('2d');
  const gradient = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  for (const [at, colour] of stops) gradient.addColorStop(at, colour);
  g.fillStyle = gradient;
  g.fillRect(0, 0, 128, 128);
  return new CanvasTexture(canvas);
}

export function createPoseEffects() {
  const group = new Group();
  group.name = 'craft-pose-effects';
  const sets = new Map();
  let glowTexture = null;
  let dustTexture = null;
  const point = new Vector3();

  function setFor(key) {
    let set = sets.get(key);
    if (set) return set;
    // Made on first use: the textures need a document, which the offline
    // checks that build a renderer do not have.
    glowTexture ??= radialTexture([
      [0, 'rgba(255,240,215,0.95)'],
      [0.15, 'rgba(255,205,140,0.5)'],
      [0.5, 'rgba(255,160,80,0.12)'],
      [1, 'rgba(255,140,60,0)'],
    ]);
    dustTexture ??= radialTexture([
      [0, 'rgba(255,255,255,0.75)'],
      [0.45, 'rgba(255,255,255,0.35)'],
      [1, 'rgba(255,255,255,0)'],
    ]);
    const glow = new Sprite(new SpriteMaterial({
      map: glowTexture, blending: AdditiveBlending, transparent: true, depthWrite: false,
    }));
    // A cloud facing the camera rather than a disc on the ground: the terrain
    // under a lander is never the flat plane a disc would need, and the ground
    // cutting off its lower half is what makes it read as dust thrown up.
    const dust = new Sprite(new SpriteMaterial({
      map: dustTexture, color: 0xc9c2b6, transparent: true, depthWrite: false,
    }));
    glow.frustumCulled = false;
    dust.frustumCulled = false;
    group.add(glow, dust);
    set = { glow, dust };
    sets.set(key, set);
    return set;
  }

  return {
    object: group,
    hideAll() {
      for (const { glow, dust } of sets.values()) {
        glow.visible = false;
        dust.visible = false;
      }
    },
    /** `ground` is the craft's resting place relative to the camera, in km. */
    place(key, pose, ground, orientation) {
      if (!(pose.glow > 0.01) && !(pose.dust > 0.01)) return;
      const { glow, dust } = setFor(key);
      if (pose.glow > 0.01) {
        point.set(pose.x, pose.y + GLOW_ABOVE_GROUND_M, pose.z).multiplyScalar(0.001).applyQuaternion(orientation);
        glow.position.copy(ground).add(point);
        glow.scale.setScalar(pose.glowSizeM * 0.001 * (0.6 + 0.4 * pose.glow));
        glow.material.opacity = Math.min(1, pose.glow) * 0.7;
        glow.visible = true;
      }
      if (pose.dust > 0.01) {
        point.set(pose.x, DUST_ABOVE_GROUND_M, pose.z).multiplyScalar(0.001).applyQuaternion(orientation);
        dust.position.copy(ground).add(point);
        dust.scale.set(pose.dustRadiusM * 2 * 0.001, pose.dustRadiusM * DUST_HEIGHT_RATIO * 0.001, 1);
        dust.material.opacity = Math.min(1, pose.dust) * 0.6;
        dust.visible = true;
      }
    },
    forget(key) {
      const set = sets.get(key);
      if (!set) return;
      group.remove(set.glow, set.dust);
      set.glow.material.dispose();
      set.dust.material.dispose();
      sets.delete(key);
    },
    dispose() {
      for (const key of [...sets.keys()]) this.forget(key);
      glowTexture?.dispose();
      dustTexture?.dispose();
    },
  };
}
