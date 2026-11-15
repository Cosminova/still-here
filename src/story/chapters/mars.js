/**
 * Out of the Earth–Moon system: Kepler, then the Martian surface.
 *
 * Kepler's and Ingenuity's chapters are the only ones in this file that are not
 * on a landing site the engine already had; Ingenuity's position is
 * approximate, and its chapter says so.
 */
import { activity, choice, future, machine, narrator } from './voice.js';

export const NEAR_EARTH = [
  {
    id: 'kepler',
    region: 'Around the Sun',
    target: 'craft:kepler',
    speaker: 'Kepler space telescope',
    title: 'The planet counter',
    years: '2009\u20132018',
    status: 'drifting',
    statusText: 'Drifting around the Sun',
    live: 'sunDistance',
    bridge: 'Not every machine we left behind sits on the ground. Next: one that circles the Sun.',
    learned: 'Planets are common: there are probably more planets than stars in our galaxy.',
    pages: [
      narrator(
        'How do you find a planet around another star, when it is far too small and dim to see?',
        { beat: 'question', scene: { shot: 'wide', mood: 'quiet' } },
      ),
      machine(
        "I'm the Kepler space telescope. For nine years I followed Earth around the Sun, a little way behind it, staring at one patch of stars.",
        { beat: 'job' },
      ),
      machine(
        'My trick was patience. When a planet passes in front of its star, the star dims very slightly \u2014 like a moth flying past a faraway streetlight. I watched about 150,000 stars at once, waiting for those tiny blinks.',
        { beat: 'how', scene: { shot: 'close' } },
      ),
      activity('transit', {
        by: 'machine',
        beat: 'how',
        text: 'Try it yourself. Slide a planet across a star and watch my light meter. Then switch to a giant planet and see how much easier it is.',
      }),
      machine(
        "In 2013, the second of the spinning wheels that kept me pointed steadily broke. Engineers came up with a clever fix: they balanced me against the gentle push of sunlight itself, and I kept hunting for planets for five more years.",
        { beat: 'challenge' },
      ),
      machine(
        'In 2018 I ran out of fuel, and NASA switched me off. By then I had found more than 2,600 confirmed planets. Now I drift around the Sun, slowly falling farther and farther behind the Earth.',
        { beat: 'learned', scene: { shot: 'wide', mood: 'discovery' } },
      ),
      future({
        text: "I'm switched off, but I'm still moving. My year is a little longer than Earth's, about 372 days, so the gap between us keeps changing. Jump the clock ahead and watch the distance at the bottom of the card.",
        horizons: [
          { years: 10, label: 'Jump 10 years', jump: true, text: "Still drifting. Astronomers are still finding planets in my old data, years after I went quiet. My successors, like TESS, are hunting the nearest, brightest stars." },
          { years: 50, label: 'Jump 50 years', jump: true, text: "Nothing out here wears me down quickly: no air, no weather. I'll keep circling the Sun, silent, while the planets I found are studied by telescopes that might one day sniff their air for signs of life." },
          { years: 100, label: 'Jump 100 years', jump: true, text: "Earth and I will keep drifting apart and closer again, over and over. Nobody plans to switch me back on. My job is done, and my planet list will still be used." },
        ],
      }),
    ],
    file: {
      facts: [
        ['Launched', '7 March 2009'],
        ['Retired', '30 October 2018'],
        ['Planets found', 'More than 2,600 confirmed'],
        ['Where it is now', 'Orbiting the Sun, trailing behind Earth'],
      ],
      science: [
        'Found more than 2,600 confirmed exoplanets \u2014 planets around other stars.',
        'Showed that planets are common: there are probably more planets than stars in our galaxy.',
        'Found that many stars have small, rocky planets at distances where liquid water could exist.',
      ],
      how: 'Its camera had 42 light detectors and measured the brightness of stars so precisely that it could notice a dip far smaller than one part in a thousand.',
      ponder: 'If most stars have planets, how many planets might there be in the Milky Way?',
      source: { label: 'NASA Science: Kepler', url: 'https://science.nasa.gov/mission/kepler/' },
    },
  },
];

export const MARS = [
  {
    id: 'viking1',
    region: 'Mars',
    target: 'craft:viking1',
    site: 'viking1',
    speaker: 'Viking 1 lander',
    title: 'The first to stay',
    years: '1976\u20131982',
    status: 'silent',
    statusText: 'Silent since November 1982',
    bridge: 'From the Moon to Mars, where machines had to land all on their own.',
    learned: 'The first pictures from the surface of Mars, and a soil that behaved strangely.',
    pages: [
      narrator(
        'Mars is about seven months away, even when the planets line up well. Could a machine land there by itself, and look for life?',
        { beat: 'question', scene: { shot: 'wide', mood: 'quiet' } },
      ),
      machine(
        "I'm the Viking 1 lander. On July 20, 1976 \u2014 seven years to the day after Apollo 11 landed on the Moon \u2014 I touched down on a plain called Chryse Planitia and became the first spacecraft to work successfully on the surface of Mars.",
        { beat: 'job' },
      ),
      machine(
        'Minutes after landing, I took the first picture ever made on the surface of Mars. Later I tested the soil for signs of life with a tiny robot laboratory, and the results were so puzzling that scientists still discuss them.',
        { beat: 'learned', photo: 'vikingFirst', scene: { mood: 'discovery' } },
      ),
      choice({
        beat: 'how',
        question: 'How would you test Martian soil for life with a robot that is 300 million kilometres from the nearest scientist?',
        options: [
          { label: 'Look for footprints or tracks with the camera.', reply: 'My cameras did watch, but anything alive there would be far too small to see.' },
          { label: "Feed the soil a 'soup' of nutrients and sniff for gas.", reply: "That's one of the tests I ran! Living things eat and breathe out gas." },
          { label: 'Listen with a microphone.', reply: 'Microbes are very quiet. A sniff works better than a listen.' },
        ],
        answer: 1,
        reveal: "Gas did come out! But another instrument found no organic molecules, the building blocks of life. Today most scientists think very reactive chemicals in the soil, like the perchlorate Phoenix later found, made the gas, not life.",
      }),
      machine(
        'I was built to work for 90 days. I kept going for more than six years, reporting Martian weather, until a mistaken software command in 1982 accidentally pointed my antenna away from Earth.',
        { beat: 'remains', scene: { shot: 'wide', mood: 'quiet' } },
      ),
    ],
    file: {
      facts: [
        ['Launched', '20 August 1975'],
        ['Landed', '20 July 1976'],
        ['Last heard from', 'November 1982'],
        ['Where it is now', 'Chryse Planitia, Mars'],
      ],
      science: [
        'Sent the first pictures ever taken on the surface of Mars.',
        "Measured Mars' thin carbon-dioxide air and its weather for years.",
        'Its life-detection tests found the soil surprisingly reactive, which is now thought to come from chemistry rather than life.',
      ],
      how: 'A heat shield, a parachute and finally rocket engines slowed it from more than 16,000 km/h to a gentle touchdown.',
      ponder: 'If a robot got confusing results when testing for life, what would you design for the next mission to find out more?',
      note: 'Its position is known only approximately.',
      source: { label: 'NASA Science: Viking 1', url: 'https://science.nasa.gov/mission/viking-1/' },
    },
  },
  {
    id: 'pathfinder',
    region: 'Mars',
    target: 'craft:pathfinder',
    site: 'pathfinder',
    speaker: 'Sojourner',
    title: 'The little rover that could',
    years: '1997',
    status: 'silent',
    statusText: 'Silent since September 1997',
    bridge: 'Viking stood still. Twenty-one years later, NASA sent wheels.',
    learned: 'Rounded pebbles showed that giant floods once rushed across Mars.',
    pages: [
      machine(
        "Hi! I'm Sojourner, the first rover ever to drive on Mars. I'm about the size of a microwave oven and I weigh about 10 kilograms.",
        { beat: 'job', scene: { shot: 'close' } },
      ),
      machine(
        'I rode down on July 4, 1997, folded up inside the Pathfinder lander. It hit the ground wrapped in giant airbags and bounced across the surface like a beach ball before rolling to a stop.',
        { beat: 'how' },
      ),
      machine(
        'My top speed was one centimetre per second, and my drivers needed patience: every command took about ten minutes to cross the gap between Earth and Mars.',
        { beat: 'challenge', scene: { shot: 'low' } },
      ),
      activity('delay', {
        by: 'machine',
        beat: 'challenge',
        text: "You're my driver now. Get me to the rock called Yogi, one of the rocks I really studied. Each command waits out the real radio delay to Mars today, sped up from minutes to seconds.",
        roverName: 'Sojourner',
        goalName: 'Yogi',
        winText: "You made it to Yogi! My real drivers planned a whole day of moves at once, then waited to see what happened. I could also spot hazards and stop myself, because nobody on Earth could react in time.",
      }),
      machine(
        'I was only expected to last a week. I lasted almost three months, sniffing rocks with my X-ray instrument. The rounded pebbles we found told scientists something amazing: long ago, giant floods of water rushed through this valley.',
        { beat: 'learned', scene: { shot: 'wide', mood: 'discovery' } },
      ),
    ],
    file: {
      facts: [
        ['Launched', '4 December 1996'],
        ['Landed', '4 July 1997'],
        ['Last heard from', '27 September 1997'],
        ['Where it is now', 'Ares Vallis, Mars'],
      ],
      science: [
        'First rover on another planet, proving that wheels could explore Mars.',
        'Rounded pebbles and rocks made of cemented gravel showed that water once flowed here.',
        'Its airbag landing system was reused to land the rovers Spirit and Opportunity.',
      ],
      how: 'Instead of large landing engines, airbags inflated around the lander just before impact so it could simply bounce until it stopped.',
      ponder: 'Why might rounded pebbles be a clue that water once flowed somewhere?',
      source: { label: 'NASA Science: Mars Pathfinder', url: 'https://science.nasa.gov/mission/mars-pathfinder/' },
    },
  },
  {
    id: 'spirit',
    region: 'Mars',
    target: 'craft:spirit',
    site: 'spirit',
    speaker: 'Spirit',
    title: 'Stuck, but not finished',
    years: '2004\u20132010',
    status: 'silent',
    statusText: 'Silent since March 2010',
    bridge: 'Sojourner proved wheels work on Mars. Next came rovers built to drive for kilometres.',
    learned: 'Silica dug up by a broken wheel: a sign of ancient hot springs on Mars.',
    pages: [
      machine(
        "I'm Spirit, one of two twin rovers. I landed in Gusev Crater on January 4, 2004, for a mission that was supposed to last 90 days.",
        { beat: 'job' },
      ),
      machine(
        'In 2006, one of my front wheels stopped turning. With a wheel stuck, I could barely make progress. My drivers on Earth had to think of something.',
        { beat: 'challenge', scene: { shot: 'low' } },
      ),
      choice({
        beat: 'challenge',
        question: 'One of my six wheels is stuck. What should my drivers do?',
        options: [
          { label: 'Keep driving forwards and push through.', reply: 'We tried that, but the stuck wheel acted like a brake and dug in.' },
          { label: 'Drive backwards and drag the broken wheel behind.', reply: "That's what they did! Pulling a stuck wheel is easier than pushing it." },
          { label: 'Park for good and just take pictures.', reply: 'That would have been safe, but I still had so much left to explore.' },
        ],
        answer: 1,
        reveal: 'I drove backwards for the rest of my mission, dragging the stuck wheel behind me like a plough. And that plough was about to dig up a surprise.',
      }),
      machine(
        "And that's how I made my biggest discovery. In 2007, my dragging wheel scraped up soil that was almost pure silica \u2014 the kind of thing made by hot springs or steam vents. On Earth, places like that are full of life.",
        { beat: 'learned', scene: { shot: 'close', mood: 'discovery' } },
      ),
      machine(
        "In 2009 my wheels broke through a crust into soft sand, and I got stuck. I kept doing science from where I sat until my last message on March 22, 2010. I'd lasted more than six years.",
        { beat: 'remains', scene: { shot: 'wide', mood: 'quiet' } },
      ),
    ],
    file: {
      facts: [
        ['Launched', '10 June 2003'],
        ['Landed', '4 January 2004'],
        ['Last heard from', '22 March 2010'],
        ['Where it is now', 'Gusev Crater, Mars'],
      ],
      science: [
        'Found nearly pure silica, a sign of ancient hot springs or steam vents.',
        'Found rocks changed by water, showing Gusev was once a wetter place.',
        'Showed a rover could keep doing science for years beyond its planned 90 days.',
      ],
      how: "A 'rocker-bogie' suspension let the six wheels climb over rocks while keeping the rover level.",
      ponder: "Spirit's broken wheel led to its biggest discovery. Can you think of a time a problem led you somewhere unexpected?",
      note: 'Shown at its landing site. It came to rest a few kilometres away.',
      source: {
        label: 'NASA Science: Spirit and Opportunity',
        url: 'https://science.nasa.gov/mission/mars-exploration-rovers-spirit-and-opportunity/',
      },
    },
  },
  {
    id: 'opportunity',
    region: 'Mars',
    target: 'craft:opportunity',
    site: 'opportunity',
    speaker: 'Opportunity',
    title: 'A marathon on Mars',
    years: '2004\u20132018',
    status: 'silent',
    statusText: 'Silent since June 2018',
    bridge: 'Spirit had a twin, on the other side of Mars.',
    learned: "Hematite 'blueberries' proved this part of Mars was once soaked in water.",
    pages: [
      machine(
        "I'm Opportunity, Spirit's twin. I landed on January 25, 2004, on the other side of the planet \u2014 and rolled straight into a small crater. Scientists called it a hole in one.",
        { beat: 'job' },
      ),
      machine(
        "Right in front of me was layered rock, and in it were little grey balls we nicknamed 'blueberries'. They're made of an iron mineral called hematite that can form in water. It was proof: this place was once soaked.",
        { beat: 'learned', scene: { shot: 'close', mood: 'discovery' } },
      ),
      machine(
        'I was built for 90 days and less than a kilometre of driving. I kept going for almost 15 years and more than 45 kilometres \u2014 farther than a marathon.',
        { beat: 'how', scene: { shot: 'wide' } },
      ),
      choice({
        beat: 'challenge',
        question: 'A dust storm is wrapping the whole of Mars, and my solar panels are going dark. What can a solar-powered rover do?',
        options: [
          { label: 'Drive out of the storm.', reply: 'The storm covered the entire planet. There was nowhere to drive to.' },
          { label: 'Go to sleep, keeping only a clock running, and wait.', reply: "That's what I did. I shut almost everything down to wait for the sky to clear." },
          { label: 'Wipe the panels clean with my arm.', reply: 'I had no wiper. Sometimes the wind cleaned my panels for me, but not in a storm like this.' },
        ],
        answer: 1,
        reveal: 'Sleeping was my best chance. When the sky cleared, the plan was for my panels to recharge my batteries and wake me up.',
      }),
      machine(
        "In June 2018 a dust storm wrapped the whole planet and blocked the sunlight from my solar panels. My last data showed very low power and a very dark sky. A reporter turned it into a famous line: 'My battery is low and it's getting dark.' Engineers tried to wake me more than a thousand times. I never answered.",
        { beat: 'remains', photo: 'opportunityLast', scene: { shot: 'wide', mood: 'still' } },
      ),
    ],
    file: {
      facts: [
        ['Launched', 'July 2003'],
        ['Landed', '25 January 2004'],
        ['Last heard from', '10 June 2018'],
        ['Where it is now', 'Perseverance Valley, Endeavour Crater, Mars'],
      ],
      science: [
        "Found hematite 'blueberries' and layered rock that formed in water.",
        'Found clay minerals at Endeavour Crater, made by water gentle enough for life.',
        'Drove more than 45 km, a record for driving on another world when it ended.',
      ],
      how: 'It ran on solar panels. Gusts of Martian wind sometimes blew the dust off them, which gave the rover a sudden boost of power.',
      ponder: "Opportunity's panels were sometimes cleaned by the wind. What other ways could you keep a robot powered on Mars?",
      note: 'Shown at its landing site. It came to rest many kilometres away, on the rim of Endeavour Crater.',
      source: {
        label: 'NASA Science: Spirit and Opportunity',
        url: 'https://science.nasa.gov/mission/mars-exploration-rovers-spirit-and-opportunity/',
      },
    },
  },
  {
    id: 'phoenix',
    region: 'Mars',
    target: 'craft:phoenix',
    site: 'phoenix-site',
    speaker: 'Phoenix',
    title: 'Ice at the top of the world',
    years: '2008',
    status: 'silent',
    statusText: 'Silent since November 2008',
    bridge: 'The rovers found signs of ancient water. Phoenix went north to dig for water that is still there, as ice.',
    learned: "There is water ice just under the ground in Mars' Arctic.",
    pages: [
      machine(
        "I'm Phoenix. On May 25, 2008, I landed far in the north of Mars, on the Arctic plains, where the ground stays frozen solid.",
        { beat: 'job' },
      ),
      machine(
        'My robotic arm scraped a trench, and bright white chunks appeared under the soil.',
        { beat: 'challenge', scene: { shot: 'close' } },
      ),
      choice({
        beat: 'how',
        question: 'Were those white chunks water ice or salt? I have no taste buds and no time to waste. How could I tell?',
        options: [
          { label: 'Watch them for a few days.', reply: "Smart! In Mars' thin air, ice slowly turns straight into vapour. Salt would just sit there." },
          { label: 'Lick them.', reply: 'No tongue, sorry. And please never lick anything from another planet.' },
          { label: 'Hit them with my scoop.', reply: 'Both ice and salt are hard, so that would not tell you much.' },
        ],
        answer: 0,
        reveal: "Four days later, some of the chunks had vanished. They were ice! It was the first time anyone had touched water ice on Mars.",
      }),
      machine(
        'I also found a kind of salt called perchlorate in the soil, and with a laser pointed at the sky I watched snow falling from Martian clouds. It turned to vapour before it reached the ground.',
        { beat: 'learned', scene: { shot: 'wide', mood: 'discovery' } },
      ),
      machine(
        'I knew the Arctic winter would end me. The Sun sank, the cold deepened, and my last signal came on November 2, 2008. Pictures from orbit later showed that heavy frost had broken one of my solar panels.',
        { beat: 'remains', scene: { mood: 'still' } },
      ),
    ],
    file: {
      facts: [
        ['Launched', '4 August 2007'],
        ['Landed', '25 May 2008'],
        ['Last heard from', '2 November 2008'],
        ['Where it is now', 'Vastitas Borealis, Mars'],
      ],
      science: [
        'Confirmed water ice just below the surface of the Martian Arctic.',
        'Found perchlorate salts, which matter both for possible life and for future astronauts.',
        'Detected snow falling from clouds in the Martian sky.',
      ],
      how: 'Phoenix landed on three legs using rocket engines, then dug with a robotic arm 2.35 metres long.',
      ponder: 'Water ice under the ground could be useful for future astronauts. What could they use it for?',
      source: { label: 'NASA Science: Phoenix', url: 'https://science.nasa.gov/mission/phoenix/' },
    },
  },
  {
    id: 'insight',
    region: 'Mars',
    target: 'craft:insight',
    site: 'insight',
    speaker: 'InSight',
    title: "Listening to Mars' heartbeat",
    years: '2018\u20132022',
    status: 'silent',
    statusText: 'Silent since December 2022',
    bridge: "Phoenix scratched the surface. InSight listened to what is deep inside.",
    learned: 'Mars has a liquid metal core, and it is bigger than expected.',
    pages: [
      machine(
        "I'm InSight. I landed on November 26, 2018, on a flat plain called Elysium Planitia. I'm not a rover \u2014 I was built to stay in one place and listen. What is inside Mars?",
        { beat: 'question', scene: { shot: 'wide', mood: 'quiet' } },
      ),
      machine(
        'My robotic arm set a super-sensitive seismometer on the ground. Over four years it recorded more than 1,300 marsquakes, and even the thumps of meteorites hitting the planet.',
        { beat: 'how', scene: { shot: 'close' } },
      ),
      machine(
        "Quake waves change as they travel through different layers, a bit like sound passing through a wall. By studying them, scientists measured the size of Mars' core for the first time. It's liquid metal, and bigger than expected.",
        { beat: 'learned', scene: { mood: 'discovery' } },
      ),
      choice({
        beat: 'challenge',
        question: "I also had a self-hammering heat probe called 'the mole', meant to dig 5 metres down. But the soil was clumpy, and the mole just bounced in place. What would you try?",
        options: [
          { label: "Press on the mole with the robot arm's scoop.", reply: 'That is what the team tried, very carefully, from millions of kilometres away.' },
          { label: 'Pour water on the soil to soften it.', reply: 'I carried no water, and water would freeze or boil away on Mars anyway.' },
          { label: 'Give up straight away.', reply: 'The team never gave up straight away. They tried for almost two years.' },
        ],
        answer: 0,
        reveal: "Pressing and even scraping soil on top of the mole got it just below the surface, but never deep enough. In January 2021 the team said goodbye to it. Even failures teach engineers: the next digging tools will be designed for soil like this.",
      }),
      activity('compare', {
        by: 'machine',
        beat: 'remains',
        scene: { shot: 'wide', mood: 'still' },
        text: "Slowly, dust covered my solar panels, and my power faded. Drag the slider to see it happen. My final contact with Earth came in December 2022.",
        before: 'insightFirstSelfie',
        after: 'insightLastSelfie',
        prompt: 'Then and now: drag to see the dust build up',
      }),
    ],
    file: {
      facts: [
        ['Launched', '5 May 2018'],
        ['Landed', '26 November 2018'],
        ['Last heard from', '15 December 2022'],
        ['Where it is now', 'Elysium Planitia, Mars'],
      ],
      science: [
        'Recorded more than 1,300 marsquakes.',
        "Measured the size of Mars' liquid metal core for the first time.",
        "Mapped the layers of Mars' crust and detected meteorite impacts by their vibrations.",
      ],
      how: 'Its seismometer sat under a dome that shielded it from wind and temperature swings, so it could sense vibrations smaller than the width of an atom.',
      ponder: "How could quake waves tell you what's deep inside a planet you can't dig into?",
      source: { label: 'NASA Science: InSight', url: 'https://science.nasa.gov/mission/insight/' },
    },
  },
  {
    id: 'ingenuity',
    region: 'Mars',
    target: 'craft:ingenuity',
    site: 'ingenuity',
    speaker: 'Ingenuity',
    title: 'The first flight on another world',
    years: '2021\u20132024',
    status: 'silent',
    statusText: 'Grounded since January 2024',
    bridge: 'Every machine so far drove or stood still. The next one flew.',
    learned: "Powered flight works, even in the thin air of Mars.",
    pages: [
      machine(
        "I'm Ingenuity, a little helicopter with a body about the size of a tissue box and blades longer than your arm. I weigh 1.8 kilograms. Could anything fly in air this thin? Finding out was my job.",
        { beat: 'job', scene: { shot: 'close' } },
      ),
      machine(
        "Mars' air is only about 1% as thick as Earth's, so my blades had to spin about 2,400 times a minute. On April 19, 2021, I climbed 3 metres and hovered: 39 seconds, the first powered, controlled flight on another planet. I even photographed my own shadow.",
        {
          beat: 'how',
          photo: 'ingenuityShadow',
          scene: {
            shot: 'low',
            mood: 'discovery',
            pose: { y: 3 },
            reconstruction: 'Reconstruction: hovering 3 metres up, like the first flight. Ingenuity really rests here on the ground, with a damaged rotor blade.',
          },
        },
      ),
      machine(
        'I was meant to make five test flights. I made 72, scouting ahead for Perseverance and flying about 17 kilometres in all.',
        { beat: 'learned', scene: { shot: 'wide' } },
      ),
      machine(
        "On my 72nd flight, in January 2024, my rotor blades were damaged and I could never fly again. I'm still standing in the sand of Jezero Crater, carrying a tiny piece of fabric from the Wright brothers' first aeroplane.",
        { beat: 'remains', scene: { shot: 'close', mood: 'quiet' } },
      ),
      choice({
        beat: 'learned',
        question: 'I steered by watching the ground with a camera and tracking bumps and pebbles. On my last flight I flew over smooth, rippled sand. What do you think went wrong?',
        options: [
          { label: "The smooth sand gave my camera nothing to track.", reply: "That's what the investigation found." },
          { label: 'A dust devil hit me.', reply: 'Dust devils are real on Mars, but this time the problem was underneath me.' },
          { label: 'My battery died in the air.', reply: 'My battery was fine. The problem was knowing where I was.' },
        ],
        answer: 0,
        reveal: "Without features to track, I misjudged how fast I was moving and hit the sand hard enough to break my blades. Engineers are using that lesson to design bigger Mars helicopters.",
      }),
    ],
    file: {
      facts: [
        ['Launched', '30 July 2020, with Perseverance'],
        ['First flight', '19 April 2021'],
        ['Last flight', '18 January 2024'],
        ['Where it is now', 'Jezero Crater, Mars'],
      ],
      science: [
        'Proved that powered flight is possible in the thin air of Mars.',
        'Scouted routes and interesting rocks from the air for Perseverance.',
        'Showed that future missions could use helicopters to explore places rovers cannot reach.',
      ],
      how: "Radio signals take several minutes to reach Mars, so nobody could fly it live. It flew itself, using a camera pointed at the ground to track where it was.",
      ponder: "Why can't someone on Earth fly Ingenuity with a joystick, like a drone?",
      note: 'Shown at an approximate position in Jezero Crater.',
      source: {
        label: 'NASA Science: Ingenuity Mars Helicopter',
        url: 'https://science.nasa.gov/mission/mars-2020-perseverance/ingenuity-mars-helicopter/',
      },
    },
  },
  {
    id: 'perseverance',
    region: 'Mars',
    target: 'craft:perseverance',
    site: 'perseverance-site',
    speaker: 'Perseverance',
    title: 'Still exploring',
    years: '2021\u2013today',
    status: 'active',
    statusText: 'Still exploring Mars',
    bridge: 'Ingenuity rode to Mars under the belly of a rover that is still working.',
    learned: "A rock with 'leopard spots' that might be a sign of ancient life. Scientists are still testing it.",
    pages: [
      narrator(
        'Did Mars ever have life? Not every machine here is silent. One is still searching, right now.',
        { beat: 'question', scene: { shot: 'wide', mood: 'quiet' } },
      ),
      machine(
        "I'm Perseverance. I landed on February 18, 2021, in Jezero Crater, an ancient lake bed where a river once flowed in and left a fan of mud and sand called a delta.",
        { beat: 'job' },
      ),
      machine(
        "I'm about the size of a car, and I run on a nuclear power source, so dust storms can't starve me the way they did Opportunity. My job is to look for signs of ancient life, and to seal the most interesting rocks in sample tubes.",
        { beat: 'how', scene: { shot: 'close' } },
      ),
      machine(
        "In 2024 I found a rock nicknamed Cheyava Falls covered in tiny 'leopard spots'. On Earth, patterns like that can be made by microbes. In 2025 NASA called it a potential sign of ancient life, maybe the clearest found yet. 'Potential' is the important word: scientists are still testing other explanations.",
        { beat: 'learned', scene: { mood: 'discovery' } },
      ),
      machine(
        'I also carried MOXIE, an experiment that turned the carbon dioxide in Mars\u2019 air into oxygen. It made about as much as a small dog breathes in ten hours, and showed future astronauts could make their own air on Mars.',
        { beat: 'learned' },
      ),
      choice({
        beat: 'how',
        question: "Between 2022 and 2023, I left ten of my sealed sample tubes lying on the ground on purpose, at a spot called Three Forks. Why?",
        options: [
          { label: 'They were empty.', reply: 'They were full of carefully chosen rock, soil and even air.' },
          { label: 'As a backup, in case something happens to me.', reply: 'Exactly. Never keep all your treasure in one place.' },
          { label: 'To mark the way back.', reply: 'I have very good maps. These tubes had a more important job.' },
        ],
        answer: 1,
        reveal: "It is the first sample depot ever made on another planet. If I break down, a future mission could still pick up the backup set. I'm carrying the rest of my samples with me.",
      }),
      future({
        text: "I'm still working, so nobody knows how my story ends. Here is what might happen.",
        horizons: [
          {
            years: 3,
            label: 'In a few years',
            text: "I'm exploring the rim of Jezero Crater, where some of the oldest rocks on Mars are found. My nuclear power source was designed to last at least 14 years, which could keep me going into the 2030s.",
          },
          {
            years: 15,
            label: 'In 15 years',
            text: 'My power will be fading. My sample tubes might be on their way to Earth, or still waiting on Mars. Whether and how a mission will fetch them is still being decided.',
          },
          {
            years: 50,
            label: 'In 50 years',
            text: 'Maybe astronauts will walk up to me, the way the Apollo 12 crew walked up to Surveyor 3, and see what decades on Mars have done to me. Maybe one of them will be you.',
          },
        ],
      }),
    ],
    file: {
      facts: [
        ['Launched', '30 July 2020'],
        ['Landed', '18 February 2021'],
        ['Power', 'Nuclear (radioisotope generator)'],
        ['Where it is now', 'Jezero Crater, Mars'],
      ],
      science: [
        'Found rocks in Jezero formed in water, confirming the crater once held a lake.',
        "Found 'leopard spots' in the Cheyava Falls rock, a potential sign of ancient microbes that needs labs on Earth to check.",
        "MOXIE made oxygen from Mars' air, a first step toward air and rocket fuel for astronauts.",
      ],
      how: "During landing it compared camera pictures with maps to steer away from hazards, then a rocket-powered 'sky crane' lowered it to the ground on cables.",
      ponder: 'If a rock might hold signs of life, why would scientists want to study it in a lab on Earth instead of only on Mars?',
      note: 'Shown at its landing site. It has driven many kilometres since.',
      source: {
        label: 'NASA Science: Mars 2020 Perseverance',
        url: 'https://science.nasa.gov/mission/mars-2020-perseverance/',
      },
    },
  },
];
