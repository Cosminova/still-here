/**
 * The Moon.
 *
 * Every chapter is spoken by the machine itself, in an imagined voice, except
 * where `by` is 'narrator'. Dates and figures are from the NASA and NSSDCA
 * pages each chapter cites; anything shown at an approximate position says so
 * in its `note`.
 *
 * Surveyor 3 is the flagship stop: the journey opens on a reconstruction of
 * its landing (../intro.js), and its pages walk the full arc from the question
 * it was sent to answer to what is still there.
 */
import { activity, choice, future, machine, narrator } from './voice.js';

const APOLLO12_VISIT = '1969-11-20T04:00:00Z';

export const MOON = [
  {
    id: 'surveyor3',
    region: 'The Moon',
    target: 'craft:surveyor3',
    site: 'surveyor3',
    // Two days after landing, when the scoop first dug.
    date: '1967-04-22T12:00:00Z',
    speaker: 'Surveyor 3',
    title: 'The robot that bounced',
    years: '1967',
    status: 'silent',
    statusText: 'Silent since May 1967',
    learned: "The Moon's ground is firm enough for astronauts \u2014 and a rocket blast can sandblast things far away.",
    pages: [
      narrator(
        "It's 1967, and NASA is getting ready to send astronauts to the Moon. A robot has already landed safely. But what is the ground like underneath? Could it hold up a spacecraft full of people?",
        { beat: 'question', scene: { shot: 'wide', mood: 'quiet' } },
      ),
      machine(
        "Finding out was my job. I'm Surveyor 3. I carried a TV camera and a small scoop on a folding arm, and people on Earth steered the scoop by radio to dig into the Moon.",
        { beat: 'job', scene: { shot: 'close' } },
      ),
      activity('replay', {
        by: 'machine',
        beat: 'challenge',
        scene: { shot: 'low' },
        text: 'But first I had to land. Near the ground, bright rocks confused my radar, so my engines never switched off. I touched down three times before a command from Earth shut them down.',
        label: 'Watch the landing again',
      }),
      activity('parts', {
        by: 'machine',
        beat: 'how',
        text: 'Scientists drove me with radio commands and watched on TV. Tap the numbers on this real photo of me to see what my parts did.',
        photo: 'surveyorVisit',
        prompt: 'Tap a number to explore Surveyor 3',
        parts: [
          { name: 'TV camera', x: 38.5, y: 59.5, text: 'My eye. It looked up into a mirror that could tilt and turn, so it could see in every direction.' },
          { name: 'Scoop on a folding arm', x: 68, y: 72.8, text: 'A scoop 12 centimetres long on an arm that could reach 1.5 metres. It dug four trenches, up to 18 centimetres deep.' },
          { name: 'Footpad', x: 40.3, y: 90.3, text: 'Each of my three legs had shock absorbers and ended in a footpad with a crushable bottom, to soften the landing.' },
          { name: 'Solar panel and antenna', x: 30, y: 40, text: 'The solar panel made up to 85 watts from sunlight. The flat antenna beamed my pictures home to Earth.' },
          { name: 'Not part of me!', x: 62, y: 31.5, text: "That's Intrepid, the Apollo 12 lunar module, about 180 metres away. More about that soon." },
        ],
      }),
      choice({
        beat: 'how',
        question: "My scoop dug trenches, pressed down on the ground and thumped it. Predict: what was the Moon's ground like?",
        options: [
          { label: 'Deep, fluffy dust, like flour.', reply: 'That was a real worry. But the scoop met firmer stuff.' },
          { label: 'Firm soil, a bit like wet sand.', reply: 'Yes. It packed down and held its shape, a bit like wet sand.' },
          { label: 'Solid rock just under the surface.', reply: 'There were rocks around me, but the scoop could dig. The top layer was soil.' },
        ],
        answer: 1,
        rightText: 'Good prediction!',
        wrongText: 'Not quite. Here is what the scoop found.',
        reveal: 'Scientists worked out that the ground could easily hold the weight of an Apollo lunar module. It was the answer Apollo was waiting for.',
      }),
      machine(
        'In two weeks I sent home 6,326 pictures. I even watched the Earth pass in front of the Sun: an eclipse, seen from the Moon. Then night fell, and I never woke up.',
        { beat: 'learned', scene: { shot: 'arrival', mood: 'quiet' } },
      ),
      machine(
        'Two and a half years later, I had visitors. Apollo 12 landed about 180 metres away, and two astronauts walked over and took my camera and scoop home to Earth. The photo you explored was taken that day.',
        { beat: 'remains', scene: { shot: 'wide', mood: 'discovery', date: APOLLO12_VISIT } },
      ),
      choice({
        beat: 'learned',
        scene: { date: APOLLO12_VISIT },
        question: "Apollo 12's lander came down 180 metres from me, its rocket engine blasting the ground. What do you think happened to me?",
        options: [
          { label: 'Nothing. 180 metres is far too far away.', reply: 'You would think so! But there is no air on the Moon to slow flying dust down.' },
          { label: 'I got sandblasted by flying dust.', reply: 'Exactly. The engine blew dust and grit sideways at high speed, and with no air to stop it, it reached me.' },
          { label: 'I was knocked over.', reply: 'I stayed standing, luckily. But something did reach me from all that way away.' },
        ],
        answer: 1,
        rightText: 'Yes! That is what scientists found.',
        wrongText: 'Good thinking, but here is what scientists found.',
        reveal: "When my parts came back to Earth, scientists found my paint pitted on the side facing Apollo 12, as if it had been sandblasted. That's a real lesson for the Artemis missions: future landers will need to touch down well away from bases and equipment.",
      }),
      machine(
        "And today? I'm still here, on a slope inside a small crater in the Ocean of Storms. My camera isn't: it's in the National Air and Space Museum in Washington, D.C. You could go and see it.",
        { beat: 'remains', scene: { shot: 'wide', mood: 'quiet', date: 'now' } },
      ),
    ],
    file: {
      facts: [
        ['Launched', '17 April 1967'],
        ['Landed', '20 April 1967'],
        ['Last heard from', '4 May 1967'],
        ['Where it is now', 'Ocean of Storms, the Moon'],
      ],
      science: [
        'Dug and tested lunar soil, proving the ground could support a lander and astronauts.',
        'Sent back thousands of TV pictures of the surface around it.',
        'Parts brought home by Apollo 12 showed how two and a half years on the Moon change metal, glass and paint.',
      ],
      how: "A radar measured the distance to the ground, and three small 'vernier' rocket engines slowed the lander for touchdown \u2014 the same basic idea landers still use today.",
      ponder: 'Why might scientists want to study a camera that sat on the Moon for two and a half years?',
      note: 'Shown at an approximate position, beside the Apollo 12 landing site.',
      source: { label: 'NASA Science: Surveyor 3', url: 'https://science.nasa.gov/mission/surveyor-3/' },
    },
  },
  {
    id: 'apollo11',
    region: 'The Moon',
    target: 'craft:apollo11',
    site: 'apollo11',
    speaker: "Eagle's descent stage",
    title: 'The mirror that still answers',
    years: '1969',
    status: 'working',
    statusText: 'Its mirrors are still used today',
    bridge: 'Surveyor robots showed the ground was safe. Two years later, people came.',
    learned: 'The Moon is drifting about 3.8 centimetres farther from Earth every year.',
    pages: [
      narrator(
        'Can something left on the Moon more than 50 years ago still be useful today? This one is.',
        { beat: 'question', scene: { shot: 'wide', mood: 'quiet' } },
      ),
      machine(
        "I'm the bottom half of the lunar module Eagle. On July 20, 1969, I carried Neil Armstrong and Buzz Aldrin down to a flat plain called the Sea of Tranquility.",
        { beat: 'job' },
      ),
      machine(
        "When it was time to leave, my top half blasted off and I stayed behind as their launch pad. There's still a plaque on my leg: 'Here men from the planet Earth first set foot upon the Moon, July 1969 A.D. We came in peace for all mankind.'",
        { beat: 'job', scene: { shot: 'close' } },
      ),
      machine(
        'The astronauts set up a few experiments nearby. My favourite is a panel of 100 small mirrors called a laser retroreflector. It needs no power at all.',
        { beat: 'how' },
      ),
      machine(
        "Observatories on Earth still fire lasers at it and time how long the light takes to bounce back \u2014 about two and a half seconds. That's how we know the Moon is drifting away from Earth by about 3.8 centimetres every year, roughly as fast as your fingernails grow.",
        { beat: 'learned', scene: { mood: 'discovery' } },
      ),
      activity('laser', {
        beat: 'how',
        text: "Your turn. You're at an observatory on Earth. Fire a laser at Eagle's mirrors and time the echo, using the real distance to the Moon today.",
      }),
      future({
        text: "Eagle's mirrors are still working, so their story isn't over. Choose a time to look ahead.",
        horizons: [
          {
            years: 10,
            label: 'In 10 years',
            compute: 'recession',
            text: 'The mirrors will have company. In 2025 a robot lander carried a new, next-generation laser reflector to the Moon, and NASA plans more instruments like it. Astronauts may be back on the Moon too, this time near its south pole.',
          },
          {
            years: 50,
            label: 'In 50 years',
            compute: 'recession',
            text: 'People might be living and working on the Moon. Tranquility Base could become a protected heritage site: NASA has already asked future missions to keep their distance so they don\u2019t disturb the first footprints.',
          },
          {
            years: 100,
            label: 'In 100 years',
            compute: 'recession',
            text: "With no wind or rain, the footprints will probably still be there, slowly blurred by tiny meteorites. The mirrors should still be bouncing light back, though dust may make them a little dimmer. Buzz Aldrin saw the flag knocked over by the rocket blast as they left, so it is probably still lying in the dust.",
          },
        ],
      }),
    ],
    file: {
      facts: [
        ['Launched', '16 July 1969'],
        ['Landed', '20 July 1969'],
        ['Crew left', '21 July 1969'],
        ['Where it is now', 'Sea of Tranquility, the Moon'],
      ],
      science: [
        'Laser ranging to the mirrors measures the Earth\u2013Moon distance to within millimetres.',
        'Those measurements show the Moon moving about 3.8 cm farther from Earth each year.',
        "The 21.5 kg of rock and soil the crew brought home showed the Moon's dark 'seas' are ancient lava.",
      ],
      how: 'The lunar module came in two stages. The descent stage held the landing engine and legs; the ascent stage used it as a launch platform to get back to orbit.',
      ponder: 'Why do you think a simple set of mirrors, with no batteries at all, has outlasted almost everything else left on the Moon?',
      source: {
        label: 'NSSDCA: Apollo 11 Lunar Module',
        url: 'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1969-059C',
      },
    },
  },
  {
    id: 'apollo15',
    region: 'The Moon',
    target: 'craft:apollo15',
    site: 'apollo15',
    speaker: 'Lunar Roving Vehicle',
    title: 'The first moon buggy',
    years: '1971',
    status: 'silent',
    statusText: 'Parked since August 1971',
    bridge: 'Walking limited how far astronauts could explore. Apollo 15 brought wheels.',
    learned: "The 'Genesis Rock', a piece of the Moon's earliest crust, more than 4 billion years old.",
    pages: [
      narrator(
        'The first Apollo crews could only go as far as they could walk. How do you explore farther? For the last three missions, NASA packed a car.',
        { beat: 'question', scene: { shot: 'wide', mood: 'quiet' } },
      ),
      machine(
        "I'm the Lunar Roving Vehicle \u2014 the first car ever driven on another world. I travelled folded up against the side of the lunar module Falcon, and astronauts Dave Scott and Jim Irwin pulled on straps to unfold me.",
        { beat: 'job' },
      ),
      machine(
        "I ran on batteries, with a small electric motor in every one of my four wheels. My wheels were made of woven wire mesh instead of rubber tyres filled with air, which wouldn't have survived out here.",
        { beat: 'how', scene: { shot: 'low' } },
      ),
      machine(
        "Together we drove about 28 kilometres, all the way to the edge of a winding canyon called Hadley Rille. Dave and Jim picked up a chunk of very old white rock that reporters nicknamed the 'Genesis Rock'.",
        { beat: 'learned', scene: { mood: 'discovery' } },
      ),
      machine(
        "Before they left, they parked me a little way from the lander and pointed my TV camera at it, so people on Earth could watch Falcon lift off. I've been parked in that same spot ever since.",
        { beat: 'remains', scene: { shot: 'wide', mood: 'quiet' } },
      ),
      choice({
        beat: 'challenge',
        question: 'Mission rules said I could never drive farther from the lander than a certain distance. What do you think decided that limit?',
        options: [
          { label: 'How fast my wire wheels wore out.', reply: 'My wheels were tough. The limit was about keeping the astronauts safe.' },
          { label: 'How far the astronauts could walk back if I broke down.', reply: "That's it. Their backpacks only held so much oxygen." },
          { label: 'How far my radio could reach.', reply: 'My radio talked straight to Earth, so that was not the problem.' },
        ],
        answer: 1,
        reveal: "It was called the 'walkback limit'. If I broke down, Dave and Jim had to be able to walk all the way back to Falcon before their oxygen ran low. Every drive was planned around it.",
      }),
    ],
    file: {
      facts: [
        ['Launched', '26 July 1971'],
        ['Landed', '30 July 1971'],
        ['Distance driven', 'About 28 km'],
        ['Where it is now', 'Hadley\u2013Apennine, the Moon'],
      ],
      science: [
        "The 'Genesis Rock' is more than 4 billion years old \u2014 a piece of the Moon's earliest crust.",
        "Apollo 15's instruments measured heat flowing out of the Moon's interior.",
        'With a rover, crews could sample many more places, much farther from the lander.',
      ],
      how: 'Each wheel had its own motor, and both the front and back wheels could steer, so the rover could turn in a tight circle.',
      ponder: 'Three moon buggies are still parked on the Moon, from Apollo 15, 16 and 17. If you could drive one today, where would you go?',
      note: 'The rover is parked near the lunar module, shown here at the landing site.',
      source: {
        label: 'NSSDCA: Apollo 15 Lunar Module and Rover',
        url: 'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1971-063C',
      },
    },
  },
  {
    id: 'apollo17',
    region: 'The Moon',
    target: 'craft:apollo17',
    site: 'apollo17',
    speaker: 'Apollo 17 science station',
    title: 'The last footprints',
    years: '1972\u20131977',
    status: 'silent',
    statusText: 'Switched off in 1977',
    bridge: 'The last Apollo crew left science running after they went home.',
    learned: 'Moonquakes showed that the Moon has layers: a crust, a mantle and a small core.',
    pages: [
      narrator(
        'December 1972. Apollo 17 lands in a valley called Taurus\u2013Littrow. Nobody knows it yet, but these will be the last human footprints on the Moon for more than half a century. What is inside the Moon?',
        { beat: 'question', scene: { shot: 'wide', mood: 'quiet' } },
      ),
      machine(
        "I'm ALSEP \u2014 the Apollo Lunar Surface Experiments Package. I'm a set of science instruments, powered by a small nuclear generator, that astronauts Gene Cernan and Harrison Schmitt set up so I could keep working after they flew home.",
        { beat: 'job' },
      ),
      machine(
        'I measured moonquakes, heat leaking out of the ground, and the thin wisps of gas around the Moon. Harrison Schmitt was a geologist, the first scientist to walk on the Moon, and he spotted orange soil that turned out to be tiny beads of volcanic glass.',
        { beat: 'learned', scene: { shot: 'close', mood: 'discovery' } },
      ),
      machine(
        "I radioed data home for almost five years. Then, on September 30, 1977, NASA switched off all the Apollo stations at once to save money. I'm still here, quiet, with the third moon buggy parked nearby.",
        { beat: 'remains', scene: { shot: 'wide', mood: 'quiet' } },
      ),
      choice({
        beat: 'how',
        question: 'To see inside the Moon, scientists needed a big "thump" at a known time and place, so they could time the waves. How did they make one?',
        options: [
          { label: 'Astronauts jumped up and down.', reply: 'Fun, but far too gentle for instruments kilometres away to feel.' },
          { label: 'They crashed used rocket parts into the Moon.', reply: 'Yes! Spent rocket stages and lunar module ascent stages were steered into the surface on purpose.' },
          { label: 'They waited for meteorites.', reply: 'Meteorites did hit, and we heard them. But nobody knew exactly when or where they would land.' },
        ],
        answer: 1,
        reveal: 'The Moon rang like a bell for more than an hour after each crash, which surprised everyone. At my site, small explosive charges set off after the astronauts left gave more thumps, and together they revealed the layers inside the Moon.',
      }),
    ],
    file: {
      facts: [
        ['Launched', '7 December 1972'],
        ['Landed', '11 December 1972'],
        ['Switched off', '30 September 1977'],
        ['Where it is now', 'Taurus\u2013Littrow valley, the Moon'],
      ],
      science: [
        'Moonquake records from the Apollo stations showed the Moon has layers: a crust, a mantle and a small core.',
        'The orange soil is volcanic glass from fire fountains that erupted billions of years ago.',
        'Heat-flow measurements helped estimate how much heat the Moon still makes inside.',
      ],
      how: 'A radioisotope generator turned heat from decaying plutonium into electricity, so the station kept running through the two-week lunar night.',
      ponder: 'Why would scientists want instruments that keep working after the astronauts have gone home?',
      source: { label: 'NASA: Apollo 17', url: 'https://www.nasa.gov/mission/apollo-17/' },
    },
  },
];
