/**
 * Which spacecraft are drawn with NASA's own 3D models.
 *
 * The models are NASA's published ones from the NASA 3D Resources collection
 * (github.com/nasa/NASA-3D-Resources), fetched into public/models/ by
 * `npm run fetch:models`. Craft not listed here, and any craft whose file is
 * missing or fails to load, keep their procedural model: NASA publishes nothing
 * for Surveyor, Sojourner or Phoenix, nor for other agencies' craft.
 *
 * Pure data, so the fetch script can read it without pulling in three.js.
 */

export const NASA_3D_RESOURCES =
  'https://raw.githubusercontent.com/nasa/NASA-3D-Resources/master/3D%20Models/';

/**
 * Model name -> path inside the collection, and how to stand it up.
 *
 * `rotate` is degrees about X, Y, Z applied before anything else, for models
 * not authored with +Y up. Everything is centred and scaled at load, so a
 * model's own units and origin do not matter.
 *
 * `ground` puts the model's feet at its origin, where the ground is.
 * `extentM` is the real length of the model's longest dimension, where that is
 * not what the mission record's size measures: the record gives the LM's
 * descent stage as 4.2 m across, but the model's longest span is the 9.4 m
 * between footpads. `split` is the height, as a fraction, between the LM's
 * descent and ascent stages. `colors` replaces the linear base colour of
 * materials by name, where the published file has one plainly wrong.
 */
export const NASA_MODELS = {
  lm: { path: 'Apollo Lunar Module/Apollo Lunar Module.glb', ground: true, extentM: 9.4, split: 0.455 },
  viking: { path: 'Viking Lander/Viking Lander.glb', ground: true, extentM: 3 },
  mer: {
    path: 'Mars Exploration Rover - Opportunity (MER-B)/Mars Exploration Rover - Opportunity (MER-B).glb',
    ground: true,
    extentM: 2.3,
  },
  insight: { path: 'InSight Cruise Lander/InSight Cruise Lander (panels deployed).glb', ground: true },
  ingenuity: { path: 'Ingenuity Mars Helicopter/Ingenuity Mars Helicopter.glb', ground: true },
  perseverance: { path: 'Mars 2020 Perseverance Rover/Mars 2020 Perseverance Rover.glb', ground: true },
  kepler: { path: 'Kepler (A)/Kepler (A).glb' },
  dawn: { path: 'Dawn/Dawn.glb' },
  near: { path: 'NEAR Shoemaker/NEAR Shoemaker.glb' },
  pioneer: { path: 'Pioneer 10/Pioneer 10.glb' },
  voyager: { path: 'Voyager Probe (A)/Voyager Probe (A).glb' },
  cassini: { path: 'Cassini-Huygens (A)/Cassini-Huygens (A) (without Hyugens).glb' },
  juno: { path: 'Juno (B)/Juno (B).glb' },
  // The file's "bus:black" is authored blue-violet, which drew the whole
  // spacecraft lavender.
  galileo: { path: 'Galileo/Galileo.glb', colors: { 'bus:black': [0.03, 0.03, 0.035] } },
  hubble: { path: 'Hubble Space Telescope (A)/Hubble Space Telescope (A).glb' },
  jwst: { path: 'James Webb Space Telescope (B)/James Webb Space Telescope (B).glb' },
  chandra: { path: 'Chandra X-ray Observatory/Chandra X-ray Observatory.glb' },
  spitzer: { path: 'Spitzer Space Telescope/Spitzer Space Telescope.glb' },
  tess: { path: 'Transiting Exoplanet Survey Satellite (TESS) (A)/Transiting Exoplanet Survey Satellite (TESS) (A).glb' },
  lro: { path: 'Lunar Reconnaissance Orbiter (A)/Lunar Reconnaissance Orbiter (A).glb' },
  ladee: { path: 'Lunar Atmosphere and Dust Environment Explorer (LADEE)/Lunar Atmosphere and Dust Environment Explorer (LADEE).glb' },
  clementine: { path: 'Clementine/Clementine.glb' },
  messenger: { path: 'MErcury Surface, Space ENvironment, GEochemistry, and Ranging (MESSENGER)/MErcury Surface, Space ENvironment, GEochemistry, and Ranging (MESSENGER).glb' },
  mro: { path: 'Mars Reconnaissance Orbiter (MRO) (C)/Mars Reconnaissance Orbiter (MRO) (C).glb' },
  parker: { path: 'Parker Solar Probe/Parker Solar Probe.glb' },
  osirisrex: { path: 'Origins, Spectral Interpretation, Resource Identification, and Security - Regolith Explorer (OSIRIS-REx)/OSIRIS-REx.glb' },
  rosetta: { path: 'Rosetta/Rosetta.glb' },
  deepimpact: { path: 'Deep Impact (EPOXI)/Deep Impact.glb' },
  stardust: { path: 'Stardust/Stardust.glb' },
  // The model's long axis is the radial wire boom, 72 m tip to tip; the record's
  // 3.2 m is the bus alone.
  ulysses: { path: 'Ulysses/Ulysses.glb', extentM: 72 },
};

/**
 * Craft key -> model, with `part` for the Lunar Module: what stands at the
 * Apollo sites is the descent stage, the ascent stage having flown back up to
 * the command module, while Apollo 10's Snoopy is the ascent stage alone.
 */
export const CRAFT_MODELS = {
  apollo11: { model: 'lm', part: 'descent' },
  apollo12: { model: 'lm', part: 'descent' },
  apollo14: { model: 'lm', part: 'descent' },
  apollo15: { model: 'lm', part: 'descent' },
  apollo16: { model: 'lm', part: 'descent' },
  apollo17: { model: 'lm', part: 'descent' },
  'apollo10-lm': { model: 'lm', part: 'ascent' },
  viking1: { model: 'viking' },
  viking2: { model: 'viking' },
  spirit: { model: 'mer' },
  opportunity: { model: 'mer' },
  insight: { model: 'insight' },
  ingenuity: { model: 'ingenuity' },
  perseverance: { model: 'perseverance' },
  kepler: { model: 'kepler' },
  dawn: { model: 'dawn' },
  near: { model: 'near' },
  pioneer10: { model: 'pioneer' },
  pioneer11: { model: 'pioneer' },
  voyager1: { model: 'voyager' },
  voyager2: { model: 'voyager' },
  cassini: { model: 'cassini' },
  juno: { model: 'juno' },
  galileo: { model: 'galileo' },
  hubble: { model: 'hubble' },
  jwst: { model: 'jwst' },
  chandra: { model: 'chandra' },
  spitzer: { model: 'spitzer' },
  tess: { model: 'tess' },
  lro: { model: 'lro' },
  ladee: { model: 'ladee' },
  clementine: { model: 'clementine' },
  messenger: { model: 'messenger' },
  mro: { model: 'mro' },
  parker: { model: 'parker' },
  'osiris-rex': { model: 'osirisrex' },
  rosetta: { model: 'rosetta' },
  'deep-impact': { model: 'deepimpact' },
  stardust: { model: 'stardust' },
  ulysses: { model: 'ulysses' },
};

/** Local file for a model name, relative to the site root. */
export const modelFile = (name) => `models/${name}.glb`;
