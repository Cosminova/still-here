/**
 * The asteroid belt and the long dark past the planets, then home.
 *
 * NEAR Shoemaker rests on Eros, which the engine does not draw, so its chapter
 * rewinds the clock to its last days in orbit, when its trajectory is known
 * and it is flying beside the asteroid it is about to land on.
 */
import { activity, choice, future, machine, narrator } from './voice.js';

export const BELT = [
  {
    id: 'dawn',
    region: 'Asteroid belt',
    target: 'craft:dawn',
    speaker: 'Dawn',
    title: 'Two worlds, one spacecraft',
    years: '2007\u20132018',
    status: 'drifting',
    statusText: 'Still circling Ceres, silent',
    live: 'sunDistance',
    bridge: 'Past Mars, out to the asteroid belt: rocky leftovers from when the planets formed.',
    learned: "Ceres' bright spots are salt, left by salty water from underground.",
    pages: [
      narrator(
        'Beyond Mars lies the asteroid belt: millions of rocky leftovers from when the planets formed. What are these leftovers really like?',
        { beat: 'question', scene: { shot: 'wide', mood: 'quiet' } },
      ),
      machine(
        "I'm Dawn. I'm the only spacecraft ever to orbit two different worlds beyond the Earth and Moon: first the giant asteroid Vesta, then the dwarf planet Ceres.",
        { beat: 'job' },
      ),
      machine(
        "My secret was my ion engine. It pushed about as hard as a sheet of paper resting on your hand \u2014 but it kept pushing for years, until I'd changed my speed by more than any spacecraft before me had managed with its own engine.",
        { beat: 'how', scene: { shot: 'close' } },
      ),
      machine(
        'At Ceres I found bright white spots inside a crater called Occator. They turned out to be salts, left behind when salty water seeped up from underground. Ceres may still hide pockets of brine deep inside.',
        { beat: 'learned', scene: { mood: 'discovery' } },
      ),
      machine(
        "In 2018 I ran out of the fuel I used to point myself at Earth. I can't talk to anyone any more, but I'm still circling Ceres, and I will be for decades to come.",
        { beat: 'remains', scene: { shot: 'wide', mood: 'quiet' } },
      ),
      choice({
        beat: 'how',
        question: 'My ion engine pushed about as hard as a sheet of paper resting on your hand. How could something that gentle take me farther than a powerful rocket engine?',
        options: [
          { label: 'It kept pushing for years without stopping.', reply: 'Yes! A tiny push that never stops adds up to a huge change in speed.' },
          { label: 'Space has no gravity, so any push works.', reply: "There's gravity everywhere in space. The Sun was pulling on me the whole time." },
          { label: 'It got stronger the farther I went.', reply: 'It actually got weaker, because my solar panels got less sunlight farther from the Sun.' },
        ],
        answer: 0,
        reveal: "Over its life my engine ran for more than five and a half years in total. A chemical rocket burns its fuel in minutes; I sipped mine, which is why I could reach and orbit two different worlds.",
      }),
      future({
        text: "I'm silent, but I'm still orbiting. Choose a time to look ahead.",
        horizons: [
          { years: 20, label: 'In 20 years', text: "Engineers chose my final orbit so I won't crash into Ceres for at least 20 years. That protects Ceres: its underground brine is one of the places in the solar system that could hold the ingredients for life, and nobody wants Earth germs landing there." },
          { years: 50, label: 'In 50 years', text: "They're more than 99% sure my orbit will last at least 50 years. Maybe a future mission will come to Ceres to look for that brine, and spot me still circling overhead." },
        ],
      }),
    ],
    file: {
      facts: [
        ['Launched', '27 September 2007'],
        ['Orbited Vesta', '2011\u20132012'],
        ['Orbited Ceres', 'From March 2015'],
        ['Mission ended', '1 November 2018'],
      ],
      science: [
        'Showed Vesta is a protoplanet \u2014 a planet that stopped growing \u2014 and the source of many meteorites found on Earth.',
        "Found that Ceres' bright spots are salts left by salty water from below.",
        'Discovered Ahuna Mons, a mountain on Ceres probably built by icy volcanism.',
      ],
      how: 'Its ion engines used electricity from solar panels to fire out charged xenon atoms at very high speed, which is gentle but extremely efficient.',
      ponder: 'Why would a very gentle engine be better than a powerful one for a long journey?',
      source: { label: 'NASA Science: Dawn', url: 'https://science.nasa.gov/mission/dawn/' },
    },
  },
  {
    id: 'near',
    region: 'Asteroid belt',
    target: 'craft:near',
    date: '2001-02-10T12:00:00Z',
    speaker: 'NEAR Shoemaker',
    title: 'The surprise landing',
    years: '1996\u20132001',
    status: 'silent',
    statusText: 'Resting on asteroid Eros',
    bridge: 'To meet the next machine, we turn the clock back to 2001.',
    learned: 'Eros is a solid but cracked piece of rock left over from the early solar system.',
    pages: [
      narrator(
        "To meet our next storyteller, we have to turn the clock back to February 2001. Look at the date at the top of the screen.",
        { scene: { shot: 'wide', mood: 'quiet' } },
      ),
      machine(
        "I'm NEAR Shoemaker. On Valentine's Day in 2000, I became the first spacecraft ever to orbit an asteroid: a peanut-shaped rock called Eros, about 34 kilometres long.",
        { beat: 'job' },
      ),
      machine(
        'For a year I circled Eros, mapping its craters, boulders and dusty hollows. I was never designed to land. But at the end of my mission, my team decided to try anyway.',
        { beat: 'challenge', scene: { shot: 'close' } },
      ),
      choice({
        beat: 'how',
        question: 'I was never built to land, and I had no legs. How fast do you think I could touch down without breaking?',
        options: [
          { label: 'As fast as a jet plane landing.', reply: 'Way too fast. I would have smashed to pieces.' },
          { label: 'As fast as a bicycle.', reply: 'Closer, but still faster than my team dared.' },
          { label: 'About walking pace.', reply: 'Yes! About 1.6 metres every second, a gentle stroll.' },
        ],
        answer: 2,
        reveal: "Eros's gravity is so weak that I drifted down slowly, firing my thrusters to brake. I touched down on the edges of my solar panels and the bottom of my body.",
      }),
      machine(
        "On February 12, 2001, I drifted down at about walking pace and touched the surface \u2014 still working! I kept sending data for about two more weeks before my team said goodbye. I'm still sitting on Eros today.",
        { beat: 'remains', scene: { mood: 'quiet' } },
      ),
    ],
    file: {
      facts: [
        ['Launched', '17 February 1996'],
        ['Orbited Eros', '14 February 2000'],
        ['Landed', '12 February 2001'],
        ['Last heard from', '28 February 2001'],
      ],
      science: [
        'First spacecraft to orbit an asteroid, and the first to land on one.',
        'Showed Eros is a solid but cracked piece of rock from the early solar system.',
        'Measured what Eros is made of, from orbit and then right on its surface.',
      ],
      how: 'With no landing legs at all, it touched down on the edges of its solar panels and the bottom of its body.',
      ponder: 'Why would scientists want to study rocks that have barely changed since the planets formed?',
      note: 'Eros is not drawn in this view, so NEAR is shown in its final days of flying beside it, just before landing.',
      source: { label: 'NASA Science: NEAR Shoemaker', url: 'https://science.nasa.gov/mission/near-shoemaker/' },
    },
  },
];

export const DEEP_SPACE = [
  {
    id: 'pioneer11',
    region: 'Deep space',
    target: 'craft:pioneer11',
    speaker: 'Pioneer 11',
    title: 'First to Saturn',
    years: '1973\u20131995',
    status: 'drifting',
    statusText: 'Leaving the solar system, silent',
    live: 'sunDistance',
    bridge: 'Back to the present day, and out past the planets: the longest flight of the journey.',
    learned: "Saturn has a faint, thin ring that nobody had seen before, the F ring.",
    pages: [
      narrator(
        'Back to the present day. Now we leave the planets behind. Could a spacecraft even survive a trip to Saturn?',
        { beat: 'question', scene: { shot: 'wide', mood: 'quiet' } },
      ),
      machine(
        "I'm Pioneer 11. I flew past Jupiter in 1974, and Jupiter's gravity flung me right across the solar system to become the first spacecraft ever to visit Saturn, in September 1979.",
        { beat: 'job' },
      ),
      machine(
        "I took the first close-up pictures of Saturn and helped discover a new, faint ring. My path showed the spacecraft that came after me, like Voyager 2, a safe way through Saturn's ring system.",
        { beat: 'learned', scene: { shot: 'close', mood: 'discovery' } },
      ),
      machine(
        "My power came from nuclear generators that slowly faded. My last signal reached Earth in 1995. Now I'm coasting towards the constellation Aquila, the Eagle, and I'll pass near one of its stars in about four million years.",
        { beat: 'remains', scene: { shot: 'wide', mood: 'quiet' } },
      ),
      choice({
        beat: 'how',
        question: "Jupiter's gravity made me go much faster, without me burning any fuel. How is that possible?",
        options: [
          { label: "I swung past Jupiter and borrowed a tiny bit of its speed around the Sun.", reply: "That's it! It's called a gravity assist." },
          { label: "Jupiter's magnetic field pushed me.", reply: "Jupiter's magnetic field is huge, but it was gravity that did the work." },
          { label: 'I bounced off its clouds.', reply: 'Bouncing off Jupiter would have been the end of me!' },
        ],
        answer: 0,
        reveal: 'As I swung around Jupiter, it gave me some of its motion around the Sun and slowed down by an amount far too tiny to measure. Voyager 1 and 2 used the same trick to tour the outer planets.',
      }),
      future({
        text: "I'm silent, but I will never stop moving. Jump the clock ahead and watch the distance at the bottom of the card.",
        horizons: [
          { years: 10, label: 'Jump 10 years', jump: true, text: 'I travel about 2.4 times the Earth\u2013Sun distance every year. Ten years from now I will be roughly 24 times that distance farther out.' },
          { years: 100, label: 'Jump 100 years', jump: true, text: "A century from now I'll still be coasting, cold and dark, far beyond the planets." },
          { years: 4000000, label: 'In 4 million years', text: 'I will pass near a star in the constellation Aquila. Nobody will be watching, but I will still be carrying a plaque showing who sent me.' },
        ],
      }),
    ],
    file: {
      facts: [
        ['Launched', 'April 1973'],
        ['Jupiter flyby', 'December 1974'],
        ['Saturn flyby', '1 September 1979'],
        ['Last heard from', '1995'],
      ],
      science: [
        'First spacecraft to fly past Saturn, and the first close-up pictures of it.',
        "Helped discover Saturn's thin F ring.",
        "Measured Jupiter's and Saturn's magnetic fields and radiation.",
      ],
      how: "Radioisotope generators made electricity from heat, because sunlight that far out is too weak for solar panels.",
      ponder: "Pioneer 11 used Jupiter's gravity to speed up. How do you think a planet's gravity can make a spacecraft go faster?",
      source: { label: 'NASA Science: Pioneer 11', url: 'https://science.nasa.gov/mission/pioneer-11/' },
    },
  },
  {
    id: 'pioneer10',
    region: 'Deep space',
    target: 'craft:pioneer10',
    speaker: 'Pioneer 10',
    title: 'A message in a bottle',
    years: '1972\u20132003',
    status: 'drifting',
    statusText: 'Leaving the solar system, silent',
    live: 'sunDistance',
    bridge: 'Pioneer 11 had an older sister ship that went first.',
    learned: 'A spacecraft can fly safely through the asteroid belt.',
    pages: [
      machine(
        "I'm Pioneer 10. I launched in March 1972, and I was the first spacecraft to cross the asteroid belt. Nobody even knew for sure whether something could fly through without being smashed.",
        { beat: 'challenge', scene: { mood: 'quiet' } },
      ),
      machine(
        "In December 1973 I became the first spacecraft to fly past Jupiter. I sent back close-up pictures and measured how fierce the radiation around it is.",
        { beat: 'learned', scene: { shot: 'close', mood: 'discovery' } },
      ),
      machine(
        'I carry a gold-coloured plaque showing a man and a woman, and a map of where the Earth is, in case anyone out there ever finds me. My last faint signal reached Earth on January 23, 2003, from about 12 billion kilometres away.',
        { beat: 'remains' },
      ),
      machine(
        "I'm still flying, heading towards the red star Aldebaran in the constellation Taurus. I'll pass it in about two million years.",
        { beat: 'remains', scene: { shot: 'wide', mood: 'quiet' } },
      ),
      activity('signal', {
        text: "Let's send Pioneer 10 a hello from Goldstone and see how long it takes to get there, using its real distance today.",
        craft: 'craft:pioneer10',
        name: 'Pioneer 10',
        listening: false,
      }),
      future({
        text: 'Pioneer 10 will keep going for millions of years. Choose a time.',
        horizons: [
          { years: 50, label: 'Jump 50 years', jump: true, text: 'Still coasting outward at about 12 kilometres every second. The plaque is still bolted on, waiting for someone to read it.' },
          { years: 2000000, label: 'In 2 million years', text: 'Pioneer 10 will pass the red star Aldebaran. Space is so empty that it will almost certainly never hit anything along the way.' },
        ],
      }),
    ],
    file: {
      facts: [
        ['Launched', 'March 1972'],
        ['Jupiter flyby', '3 December 1973'],
        ['Last heard from', '23 January 2003'],
        ['Heading towards', 'Aldebaran, in Taurus'],
      ],
      science: [
        'First spacecraft to cross the asteroid belt, and the first to fly past Jupiter.',
        "Mapped Jupiter's intense radiation belts.",
        'Measured the solar wind far beyond the planets.',
      ],
      how: 'A big dish antenna, always pointed back at Earth, carried its signals home \u2014 more and more faintly as the years went by.',
      ponder: 'If you could put a message on a spacecraft leaving the solar system, what would you say?',
      source: { label: 'NASA Science: Pioneer 10', url: 'https://science.nasa.gov/mission/pioneer-10/' },
    },
  },
  {
    id: 'voyager1',
    region: 'Deep space',
    target: 'craft:voyager1',
    speaker: 'Voyager 1',
    title: 'Still talking from between the stars',
    years: '1977\u2013today',
    status: 'active',
    statusText: 'Still sending data home',
    live: 'sunDistance',
    bridge: 'One last stop: the farthest machine of all, and it is still talking.',
    learned: "Volcanoes erupt on Jupiter's moon Io, and Voyager 1 still reports from between the stars.",
    pages: [
      narrator(
        "One last stop, the farthest of all. And this machine isn't silent: NASA still hears from it. How far can a machine go and still phone home?",
        { beat: 'question', scene: { shot: 'wide', mood: 'still' } },
      ),
      machine(
        "I'm Voyager 1. I launched on September 5, 1977, and flew past Jupiter in 1979 and Saturn in 1980. I found volcanoes erupting on Jupiter's moon Io, the first active volcanoes ever seen beyond Earth.",
        { beat: 'learned', scene: { mood: 'discovery' } },
      ),
      machine(
        "In 1990, before switching my cameras off for good to save power, I turned around and took one last picture of home. Earth was a tiny speck in a beam of sunlight: the Pale Blue Dot. Can you find it?",
        { beat: 'learned', photo: 'paleBlueDot', scene: { mood: 'still' } },
      ),
      machine(
        "In August 2012 I crossed into interstellar space, the space between the stars. I was the first human-made object ever to get there. I carry a Golden Record of sounds, music and greetings from Earth, in case anyone ever finds me.",
        { beat: 'remains', scene: { shot: 'close' } },
      ),
      machine(
        "Around now, in late 2026, I'm reaching one light-day from Earth. A message from the Deep Space Network takes a whole day to reach me, and my answer takes another day to come back. My power fades a little every year, so my team switches my instruments off one by one to keep me going.",
        { beat: 'remains', scene: { shot: 'wide', mood: 'quiet' } },
      ),
      activity('signal', {
        by: 'machine',
        text: 'Send me a hello. I am still listening, but you will need patience.',
        craft: 'craft:voyager1',
        name: 'Voyager 1',
        listening: true,
      }),
      future({
        text: "I'm still working, so my story isn't finished. Here is what my team expects.",
        horizons: [
          { years: 5, label: 'Jump 5 years', jump: true, text: 'My nuclear generators lose about 4 watts of power every year. My team hopes to keep at least one science instrument running into the 2030s, if nothing else breaks.' },
          { years: 15, label: 'Jump 15 years', jump: true, text: 'By then my power will probably be too low to run any instruments. My radio may keep whispering for a little longer, then I will fall silent like Pioneer 10 and 11.' },
          { years: 300, label: 'In 300 years', text: 'I will reach the inner edge of the Oort Cloud, a vast shell of icy objects surrounding the Sun. Crossing it could take me 30,000 years.' },
          { years: 40000, label: 'In 40,000 years', text: 'I will pass within 1.6 light-years of a star called Gliese 445, in the constellation Camelopardalis, still carrying the Golden Record.' },
        ],
      }),
    ],
    file: {
      facts: [
        ['Launched', '5 September 1977'],
        ['Jupiter flyby', 'March 1979'],
        ['Saturn flyby', 'November 1980'],
        ['Entered interstellar space', '25 August 2012'],
      ],
      science: [
        "Discovered active volcanoes on Io, and sent close-up pictures of Saturn's rings and its moon Titan.",
        "Measured where the Sun's wind ends and interstellar space begins.",
        'Still reports what interstellar space is like: its particles, magnetic fields and waves.',
      ],
      how: "Its radio transmits with about the power of a fridge light bulb, so after crossing billions of kilometres the signal is incredibly faint. NASA's Deep Space Network catches it with dishes up to 70 metres wide, like the ones at Goldstone.",
      ponder: 'The Golden Record carries greetings in 55 languages and music from around the world. What would you put on it?',
      source: { label: 'NASA Science: Voyager 1', url: 'https://science.nasa.gov/mission/voyager/voyager-1/' },
    },
  },
];

export const EPILOGUE = {
  id: 'epilogue',
  region: 'Home',
  target: 'earth',
  speaker: 'Narrator',
  title: 'Still here',
  bridge: 'Time to go home.',
  pages: [
    narrator(
      "That's our journey, explorer: from a robot that bounced on the Moon, past Mars and the asteroids, all the way to the space between the stars.",
      { scene: { shot: 'wide', mood: 'quiet' } },
    ),
    activity('recap', {
      beat: 'learned',
      scene: { mood: 'discovery' },
      text: "Most of these machines will never move again. They matter because of what they found out. Here is one thing each of them taught us.",
    }),
    narrator(
      'Next time you look up at the Moon, or spot the little red dot of Mars, remember: there is something of ours up there, still here. New explorers are being built right now. Maybe one day, you will build one.',
      { scene: { shot: 'wide', mood: 'still' } },
    ),
  ],
};
