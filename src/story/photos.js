/**
 * The real NASA photographs the story shows, with the date each was taken and
 * its NASA image ID, so every one can be traced back to images.nasa.gov.
 * Files are resized copies in public/story/.
 *
 * Anything the story draws itself is labelled a reconstruction or an
 * illustration instead; nothing here is retouched beyond resizing.
 */

const base = import.meta.env?.BASE_URL ?? './';

export const PHOTOS = Object.freeze({
  surveyorVisit: {
    src: `${base}story/as12-48-7134.jpg`,
    id: 'AS12-48-7134',
    date: '20 November 1969',
    alt: 'An Apollo 12 astronaut in a white spacesuit stands beside the spidery Surveyor 3 lander on grey lunar soil, with the Apollo 12 lunar module on the horizon behind.',
    caption: 'An Apollo 12 astronaut beside Surveyor 3. The lunar module Intrepid is on the horizon.',
  },
  vikingFirst: {
    src: `${base}story/pia00381.jpg`,
    id: 'PIA00381',
    date: '20 July 1976',
    alt: 'A black-and-white strip of Martian ground with small angular rocks and sand, and one of the lander\u2019s footpads at the right.',
    caption: 'The first photograph ever taken on the surface of Mars, minutes after Viking 1 landed.',
  },
  insightFirstSelfie: {
    src: `${base}story/pia22876.jpg`,
    id: 'PIA22876',
    date: '6 December 2018',
    alt: 'InSight seen from above on red-brown ground, its two round solar panels clean and dark.',
    caption: 'InSight\u2019s first selfie, ten days after landing.',
  },
  insightLastSelfie: {
    src: `${base}story/pia25287.jpg`,
    id: 'PIA25287',
    date: '24 April 2022',
    alt: 'InSight seen from above, its solar panels and deck coated in orange-brown dust.',
    caption: 'InSight\u2019s final selfie, covered in dust.',
  },
  ingenuityShadow: {
    src: `${base}story/pia24584.jpg`,
    id: 'PIA24584',
    date: '19 April 2021',
    alt: 'A black-and-white view looking straight down at Martian ground, with the dark shadow of a small helicopter and its rotors.',
    caption: 'Ingenuity\u2019s own shadow, photographed while it hovered on the first flight.',
  },
  opportunityLast: {
    src: `${base}story/pia22929.jpg`,
    id: 'PIA22929',
    date: '10 June 2018',
    alt: 'A dark grey frame full of speckled noise, with its bottom quarter missing and black.',
    caption: 'The last image Opportunity sent. The dust storm made the sky so dark that it is almost all noise, and the bottom never arrived.',
  },
  paleBlueDot: {
    src: `${base}story/pia00452.jpg`,
    id: 'PIA00452',
    date: '14 February 1990',
    alt: 'Streaks of scattered sunlight across black space, with Earth a single tiny pale-blue dot inside one of them.',
    caption: 'The Pale Blue Dot: Earth, from about 6 billion kilometres away. Look for the tiny speck in the light ray.',
  },
});

export const photoCredit = (photo) => `NASA photo \u00b7 ${photo.date} \u00b7 ${photo.id}`;
export const photoLink = (photo) => `https://images.nasa.gov/details/${photo.id}`;
