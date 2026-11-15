/*
 * Every page can also carry:
 *   beat   where it sits in the stop's arc: 'question', 'job', 'challenge',
 *          'how', 'learned', 'remains' or 'next' (see BEATS in story-ui.js)
 *   scene  what the camera and music do while it is shown (see scenes.js):
 *          { shot, mood, date, pose, reconstruction }
 *   photo  a key in ../photos.js, shown under the text
 */

/** One page of a chapter, spoken by the machine the chapter is about. */
export const machine = (text, extras = {}) => Object.freeze({ ...extras, by: 'machine', text });

/** One page spoken by the narrator, who frames the journey. */
export const narrator = (text, extras = {}) => Object.freeze({ ...extras, by: 'narrator', text });

/**
 * A real decision the mission faced, or a prediction about what it found, put
 * to the reader before the answer. `options` are `{ label, reply }`; `answer`
 * is the index of what was done or found, and `reveal` is what happened.
 * `rightText` and `wrongText` replace the default verdicts.
 */
export const choice = ({ by = 'machine', question, options, answer, reveal, ...extras }) =>
  Object.freeze({ ...extras, kind: 'choice', by, text: question, options: Object.freeze(options), answer, reveal });

/** A hands-on page: `activity` names one of the widgets in ../interactive.js. */
export const activity = (name, { by = 'narrator', text, beat, scene, ...params }) =>
  Object.freeze({ kind: 'activity', activity: name, by, text, beat, scene, params: Object.freeze(params) });

/**
 * What might happen next to a machine that is still working or still moving.
 * Each horizon is `{ years, label, text, jump }`; `jump` moves the simulation
 * clock there so the reader sees where the craft will be.
 */
export const future = ({ text, horizons, ...extras }) =>
  Object.freeze({ beat: 'next', ...extras, kind: 'future', by: 'narrator', text, horizons: Object.freeze(horizons) });
