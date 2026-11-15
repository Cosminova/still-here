/**
 * The parts of a spacecraft you can click on, and how each one works.
 *
 * Keyed by the model a craft is drawn with, so the two Pioneers or the three
 * Apollo descent stages share one list, with a craft key taking precedence
 * where craft sharing a model were different machines (Pathfinder and Phoenix
 * are both drawn with the generic lander).
 *
 * A part is found on the model in one of three ways:
 *
 *   m       a point in the model's own units, for the procedural models, which
 *           are built in metres (craft-models.js)
 *   at      fractions of the model's bounding box: x left to right, y bottom to
 *           top, z back to front
 *   match   a pattern tested against each mesh's node names and material
 *           ("mat:" prefix), for NASA's models; the part sits at the middle of
 *           everything it matches, and a click on any of it picks the part
 *
 * A part can have `match` and `at` both: `match` for what a click picks, `at`
 * for where its marker goes, when the middle of everything it matches is not
 * on any of it (the middle of six wheels is under the rover).
 *
 * `zoom` is how far the camera stands from the part when it goes there, in
 * radii of the whole craft.
 *
 * Pure data, so it can be checked without a renderer.
 */

export const DEFAULT_PART_ZOOM = 1.3;

const LANDER_PARTS = {
  pathfinder: [
    { name: 'Camera on a mast', m: [0, 1.45, 0], text: 'A stereo camera on a pop-up mast, with two eyes like yours so scientists could see in 3D. It also watched the little rover Sojourner drive around and checked which way the wind blew.' },
    { name: 'Solar petal', m: [1.9, 0.45, 0], text: 'Pathfinder landed inside airbags, wrapped in three petals. Once it stopped bouncing, the petals opened like a flower, turned it the right way up and showed their solar cells to the Sun.' },
    { name: 'Base and radio', m: [0, 0.3, 0], text: 'The middle held the computer, batteries and radio. Every picture, and every message from Sojourner, went through here on its way to Earth.' },
  ],
  phoenix: [
    { name: 'Stereo camera', m: [0, 1.45, 0], text: 'Two cameras on a mast, a little apart like your eyes, so scientists could see the ground in 3D and pick where the arm should dig.' },
    { name: 'Solar array', m: [1.9, 0.45, 0], text: 'Two round solar arrays that opened like paper fans. Phoenix landed near the north pole in summer; when winter came, there was too little sunlight and ice formed on the panels.' },
    { name: 'Landing leg', m: [-1.15, -1.1, 1.99], text: 'Phoenix landed on three legs, slowed by 12 small rocket engines that pulsed on and off. The blast blew dust away and uncovered bright ice right under the lander.' },
    { name: 'Science deck', m: [0, 0.3, 0], text: 'Little ovens baked soil from the arm\u2019s scoop and sniffed the gases that came off. That is how Phoenix proved the white stuff it dug up was water ice.' },
  ],
};

const MODEL_PARTS = {
  surveyor: [
    { name: 'TV camera', m: [0.62, 1.6, 0.36], zoom: 1, text: 'My only eye. The camera pointed up into a mirror that could tilt and turn, so I could look all around without moving the camera. Each picture went home over the radio, one line at a time.' },
    { name: 'Solar panel', m: [0.42, 3.02, 0], text: 'Solar cells turned sunlight into electricity, up to 85 watts, about as much as one bright light bulb. Motors tilted the panel to keep it facing the Sun.' },
    { name: 'Flat antenna', m: [-0.4, 2.82, 0], text: 'A flat, square antenna aimed at Earth. It beamed my pictures 384,000 kilometres home and picked up the commands scientists sent me.' },
    { name: 'Scoop on its arm', m: [0, 0.12, -1.92], zoom: 1, text: 'Tiny motors folded the arm out. Scientists told the scoop to dig, press and drop on the ground, and watched on TV to see how the Moon\u2019s soil behaved.' },
    { name: 'Footpad', m: [0, 0.1, 2.08], zoom: 1, text: 'Each of my three legs had a shock absorber, like a car\u2019s, and a footpad with a crushable bottom that squashed to soften the landing.' },
    { name: 'Electronics box', m: [-0.71, 0.9, 0.41], zoom: 1, text: 'My computer parts and radio lived in white boxes. Mirror tops threw away heat in the blazing lunar day, and heaters kept them warm, until the first lunar night got too cold.' },
    { name: 'Landing rocket', m: [0, 0.4, 0.72], zoom: 1, text: 'Three small rocket engines slowed me for the last part of the landing. On landing day, sunlight glinting off rocks confused my radar, the engines did not switch off, and I bounced twice before I stopped.' },
  ],
  'lm-descent': [
    { name: 'Descent engine', match: /mat:blinn5SG/, text: 'One big rocket engine that could be throttled up and down, like a car\u2019s accelerator. The astronauts rode it down from orbit to a gentle touchdown, then left it here.' },
    { name: 'Landing leg', at: [0.98, 0.06, 0.5], text: 'Four legs packed with crushable honeycomb to soak up the bump. Long probes under the footpads touched the ground first and lit a \u201ccontact\u201d light, telling the pilot to shut the engine off.' },
    { name: 'Ladder and porch', at: [0.5, 0.25, 0.97], text: 'The astronauts squeezed out of the hatch onto a small porch and climbed down a ladder on the front leg. The last step was a hop: the bottom rung was about a metre above the footpad.' },
    { name: 'Storage bays', at: [0.5, 0.62, 0.8], text: 'Bays wrapped in gold foil carried the tools, TV camera and experiments. On the last three missions one bay held a folded-up car, the Lunar Roving Vehicle.' },
    { name: 'Launch pad', at: [0.5, 0.98, 0.5], text: 'The top of this stage was a launch pad. The crew\u2019s cabin blasted off from it to go home, and this half stayed on the Moon, where it still stands.' },
  ],
  viking: [
    { name: 'Digging arm', match: /mat:blinn2SG/, text: 'An arm that unrolled like a tape measure, out to about 3 metres, with a scoop on the end. It dug up soil and dropped it into the labs inside.' },
    { name: 'Cameras', at: [0.37, 0.9, 0.5], text: 'Two cameras that scanned the scene one thin strip at a time with a nodding mirror. They took the first pictures from the surface of Mars.' },
    { name: 'Biology lab', at: [0.37, 0.55, 0.5], text: 'A tiny lab, smaller than a backpack, that fed Mars soil and watched for signs that something living breathed or ate. The results puzzled scientists for decades.' },
    { name: 'Nuclear power', at: [0.2, 0.55, 0.5], text: 'Two generators turned the heat of decaying plutonium into electricity, day and night. Viking 1 kept working for more than six years.' },
    { name: 'Landing leg', at: [0.37, 0.03, 0.95], text: 'Three legs with crushable shock absorbers. Viking slowed down with a heat shield, then a parachute, then rocket engines with lots of small nozzles so it would not scorch the ground it had come to study.' },
  ],
  mer: [
    { name: 'Solar panels', match: /mat:SolarArrays/, text: 'Wings of solar cells that folded out after landing. Mars dust slowly covered them, but every so often a gust of wind blew them clean and the rover got a burst of power.' },
    { name: 'Camera mast', at: [0.55, 0.97, 0.67], text: 'A mast as tall as a person with stereo cameras on top, so scientists could see in 3D, and colour filters to tell rocks apart.' },
    { name: 'Robot arm', at: [0.5, 0.35, 0.97], text: 'An arm with a microscope, two rock sensors and a grinder that scraped the dusty outside off a rock to see what it was made of inside.' },
    { name: 'Six wheels', match: /mat:LightGrayMetal/, at: [0.12, 0.08, 0.52], text: 'Six wheels on rocker-bogie legs that let the rover climb over rocks as big as its wheels without tipping. When one wheel jammed, Spirit drove backwards, dragging it.' },
  ],
  insight: [
    { name: 'Quake detector', match: /SEIS/, text: 'A seismometer so sensitive it could feel a movement smaller than an atom. The arm set it on the ground under a dome, and it heard more than 1,300 marsquakes.' },
    { name: 'The mole', match: /HP3/, text: 'A self-hammering spike meant to dig 5 metres down and take Mars\u2019s temperature. The soil was so clumpy it would not grip, and after two years of trying it stayed near the surface.' },
    { name: 'Robot arm', match: /arm_0[23]|grapple|shovel/, text: 'A 2.4 metre arm with a claw to lift the instruments off the deck and set them on the ground, and a scoop to push soil onto the mole.' },
    { name: 'Solar panel', match: /panel_l/, text: 'Two round panels, each about 2 metres across. Dust built up on them year after year until there was not enough power, and InSight went quiet in December 2022.' },
    { name: 'Weather sensors', match: /TWINS/, text: 'Little booms that measured wind and temperature, so scientists could tell a real marsquake from the lander just shaking in a gust.' },
  ],
  ingenuity: [
    { name: 'Rotors', match: /rotors_0[12]/, text: 'Two sets of blades, each 1.2 metres across, spinning opposite ways at about 2,500 turns a minute. Mars air is so thin they had to spin much faster than a helicopter\u2019s on Earth.' },
    { name: 'Solar panel', match: /solar_panel/, text: 'A small solar panel on top charged six phone-style batteries. A flight lasted only a couple of minutes; the rest of the day was charging and keeping warm.' },
    { name: 'Cameras', match: /cams/, text: 'A camera looking down tracked the ground going by, so the helicopter knew how fast it was moving. Its job ended when the ground got too smooth to track, and a blade broke.' },
    { name: 'Legs', match: /leg_01/, text: 'Four springy legs for landing on rough ground. Ingenuity was supposed to make 5 flights; it made 72.' },
  ],
  perseverance: [
    { name: 'Mast head', match: /Mastcam_Z_cams|(^|\/)head(\/|$)/, text: 'Zoom cameras that see in 3D and a laser that zaps rocks from 7 metres away, then reads the light from the tiny spark to tell what the rock is made of.' },
    { name: 'Arm turret', match: /turret_obj|PIXL|WATSON|corring_drill/, text: 'The hand at the end of a 2-metre arm: a drill that cuts cores of rock the size of a piece of chalk, a close-up camera, and X-ray and laser instruments to check the rock first.' },
    { name: 'Sample storage', match: /(^|\/)lab(\/|$)/, text: 'Inside the belly, a small robot seals each rock core in a tube, ready for a future mission to bring back to Earth.' },
    { name: 'Nuclear battery', match: /(^|\/)rtg(\/|$)/, text: 'The fin-covered box at the back turns heat from decaying plutonium into electricity, day and night, dust or no dust. No solar panels needed.' },
    { name: 'Wheels', match: /Wheels_objs/, at: [0.94, 0.14, 0.92], text: 'Six aluminium wheels with grippy treads, thicker than Curiosity\u2019s after Curiosity\u2019s got torn on sharp rocks.' },
  ],
  kepler: [
    { name: 'Telescope and sunshade', at: [0.5, 0.97, 0.5], text: 'A telescope that stared at one patch of sky with 150,000 stars for four years. The slanted sunshade kept sunlight out of it.' },
    { name: 'Light catcher', at: [0.5, 0.3, 0.5], text: 'At the bottom of the telescope, 42 light sensors, like a giant phone camera, measured each star\u2019s brightness. A planet passing in front made its star dim very slightly.' },
    { name: 'Solar panels', match: /mat:shiny_panel/, text: 'Solar panels on the sunny side made the power. Kepler kept its back to the Sun the whole time.' },
    { name: 'Antenna', match: /mat:dish_AO/, text: 'An antenna dish that sent all those measurements back to Earth about once a month.' },
    { name: 'Spinning wheels', at: [0.5, 0.08, 0.5], text: 'Kepler turned by spinning wheels inside, with no fuel. When two of them broke, engineers balanced it using the gentle push of sunlight instead and kept finding planets.' },
  ],
  dawn: [
    { name: 'Solar wing', at: [0.88, 0.5, 0.5], text: 'Two wings almost 20 metres tip to tip, longer than a bowling lane. Out by the asteroid belt the Sun is faint, so Dawn needed huge panels.' },
    { name: 'Ion engine', at: [0.5, 0.05, 0.5], text: 'Instead of a big burst, Dawn\u2019s engines push out a gentle stream of charged xenon gas, with the force of a sheet of paper resting on your hand. Run for years, that adds up to more speed change than any other spacecraft managed on its own.' },
    { name: 'Antenna dish', at: [0.5, 0.67, 0.95], text: 'A dish antenna for talking to Earth. Dawn ran out of the gas that pointed it in 2018 and now circles Ceres silently.' },
    { name: 'Camera', at: [0.5, 0.97, 0.5], text: 'Cameras with colour filters mapped Vesta and Ceres, including the bright salty spots inside Ceres\u2019s Occator crater.' },
  ],
  near: [
    { name: 'Solar panels', at: [0.92, 0.76, 0.5], text: 'Four solar panels around the top, all facing the same way so the craft could point them at the Sun while its instruments looked at Eros.' },
    { name: 'Antenna dish', at: [0.5, 0.95, 0.5], text: 'A dish on top, between the panels, sent pictures home. In the very last minutes it beamed back close-ups of Eros as NEAR came down.' },
    { name: 'Camera and sensors', at: [0.5, 0.05, 0.5], text: 'Cameras and sensors on the bottom pointed at the asteroid. NEAR was never built to land, but it touched down gently and kept sending data for two more weeks.' },
  ],
  pioneer: [
    { name: 'Dish antenna', match: /mat:dish_AO/, text: 'A dish 2.7 metres wide that always pointed at Earth. Pioneer spun around slowly like a top, which kept it steady without using fuel.' },
    { name: 'Nuclear power', match: /mat:RTG_AO/, text: 'Two nuclear generators on long arms, kept far from the instruments so their radiation would not confuse them. Their heat turned into electricity.' },
    { name: 'Instrument box', at: [0.5, 0.79, 0.45], text: 'A six-sided box held the radio, the computer and most of the science instruments. Bolted to the struts above it is the Pioneer plaque, a picture message for anyone who might find it.' },
    { name: 'Magnetometer boom', at: [0.5, 0.03, 0.56], text: 'A long thin pole held a magnetic field sensor far from the rest of the craft, so the electronics would not fool it.' },
  ],
  voyager: [
    { name: 'Big dish', match: /mat:VoyagerDish$/, text: 'A 3.7-metre dish pointed at Earth. Its radio is about as powerful as a fridge light bulb, and by the time the signal reaches Earth it is billions of times weaker than the power a digital watch uses.' },
    { name: 'Golden Record', match: /mat:VoyagerDiskEmblem/, text: 'A gold-plated copper record with sounds and pictures from Earth: music, greetings in 55 languages, a heartbeat and a baby crying, plus instructions for playing it.' },
    { name: 'Nuclear power', at: [0.58, 0.24, 0.03], text: 'Three nuclear generators on a boom. Their power fades a little each year, so engineers keep turning instruments off to keep Voyager going.' },
    { name: 'Magnetometer boom', match: /mat:VoyagerDetailGold$/, text: 'A 13-metre boom that unfolded from a can. The sensor at the end measures magnetic fields, and helped show when Voyager 1 left the Sun\u2019s bubble in 2012.' },
  ],
};

/** The clickable parts of a craft drawn with model `modelId`, or null. */
export function partsFor(craftKey, modelId) {
  return LANDER_PARTS[craftKey] ?? MODEL_PARTS[modelId] ?? null;
}
