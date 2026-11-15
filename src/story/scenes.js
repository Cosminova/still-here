/**
 * The story's camera operator and sound desk.
 *
 * A page can ask for a shot ('wide', 'close', 'low', 'high', or 'arrival' to
 * go back to how the stop was first framed), a mood for the music, and a
 * staged pose for its machine, such as Ingenuity hovering. Every move is a
 * slow ease, never a cut or a snap zoom, and stops the moment the reader takes
 * the view; with reduced motion the camera does not move at all.
 */

const SHOT_MS = 2800;
const PULL_BACK_MS = 1400;
const POSE_MS = 2200;

// Distance as a multiple of the arrival framing; pitch is the camera's height
// angle above the machine's horizon, in radians (null keeps the arrival one).
const SHOTS = Object.freeze({
  arrival: { distance: 1, pitch: null },
  wide: { distance: 2.4, pitch: 0.5 },
  close: { distance: 0.55, pitch: 0.55 },
  low: { distance: 0.85, pitch: 0.12 },
  high: { distance: 1.4, pitch: 1.2 },
});

// The music's overall level under a page: quiet for reflection, full for a
// discovery. The music engine still chooses what to play.
const MOODS = Object.freeze({ still: 0.15, quiet: 0.3, curious: 0.6, discovery: 1 });

const ease = (u) => (u < 0.5 ? 4 * u * u * u : 1 - (-2 * u + 2) ** 3 / 2);

export function createDirector(api, { reducedMotion = false } = {}) {
  let cameraFrame = 0;
  let settle = null;
  let base = null;
  let poseFrame = 0;
  let posed = null;

  function cancel() {
    if (cameraFrame) cancelAnimationFrame(cameraFrame);
    cameraFrame = 0;
    settle?.();
    settle = null;
  }

  function tween(to, ms) {
    cancel();
    const controls = api.controls;
    if (reducedMotion || ms <= 0) {
      Object.assign(controls, to);
      return Promise.resolve();
    }
    const from = Object.fromEntries(Object.keys(to).map((key) => [key, controls[key]]));
    return new Promise((resolve) => {
      settle = resolve;
      const start = performance.now();
      const step = (now) => {
        const u = Math.min(1, (now - start) / ms);
        const e = ease(u);
        for (const key of Object.keys(to)) controls[key] = from[key] + (to[key] - from[key]) * e;
        if (u < 1) {
          cameraFrame = requestAnimationFrame(step);
        } else {
          cameraFrame = 0;
          settle = null;
          resolve();
        }
      };
      cameraFrame = requestAnimationFrame(step);
    });
  }

  function unstage() {
    if (poseFrame) cancelAnimationFrame(poseFrame);
    poseFrame = 0;
    if (posed) api.setCraftPose?.(posed, null);
    posed = null;
  }

  /** Lifts a machine into a staged pose and holds it there with a slight bob. */
  function stage(key, pose) {
    unstage();
    if (!key || !pose || !api.setCraftPose) return;
    posed = key;
    if (reducedMotion) {
      api.setCraftPose(key, pose);
      return;
    }
    const start = performance.now();
    const step = (now) => {
      const t = (now - start) / 1000;
      const rise = ease(Math.min(1, (now - start) / POSE_MS));
      const bob = Math.sin(t * 1.7) * 0.04 * rise;
      api.setCraftPose(key, { ...pose, y: (pose.y ?? 0) * rise + bob });
      poseFrame = requestAnimationFrame(step);
    };
    poseFrame = requestAnimationFrame(step);
  }

  return {
    /** Remembers how the stop was framed on arrival, which shots are relative to. */
    arrived() {
      base = { distanceRadii: api.controls.distanceRadii, pitch: api.controls.pitch };
    },
    /** Plays a page's scene: its shot, mood and pose. */
    play(scene, craftKey) {
      if (scene?.mood) this.mood(scene.mood);
      if (scene?.pose) stage(craftKey, scene.pose);
      else unstage();
      const shot = SHOTS[scene?.shot];
      if (!shot || !base) return;
      tween(
        { distanceRadii: base.distanceRadii * shot.distance, pitch: shot.pitch ?? base.pitch },
        SHOT_MS,
      );
    },
    mood(name) {
      const level = MOODS[name];
      if (level !== undefined) api.ambient?.setLevel?.(level);
    },
    /** Draws back from the machine before a flight, so leaving reads as leaving. */
    pullBack() {
      unstage();
      if (reducedMotion) return Promise.resolve();
      return tween({ distanceRadii: api.controls.distanceRadii * 3.5 }, PULL_BACK_MS);
    },
    cancel,
    unstage,
    dispose() {
      cancel();
      unstage();
    },
  };
}
