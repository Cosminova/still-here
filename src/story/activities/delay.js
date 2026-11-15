/**
 * Drive a rover on Mars with the real radio delay.
 *
 * Every command waits out the one-way light time between Earth and Mars at the
 * simulation's date before the rover acts on it, scaled from minutes down to
 * seconds so a game takes a minute rather than an afternoon. Hitting a rock is
 * not a crash: like Sojourner, the rover sees the hazard and refuses the move,
 * and the driver finds out one delay later.
 */
import { el, text } from '../../ui/dom.js';
import { LIGHT_KMS, distanceKm, formatLightTime } from '../space-facts.js';

const COLS = 10;
const ROWS = 6;
const CELL = 30;
const ROCKS = Object.freeze([[2, 1], [2, 2], [3, 4], [5, 2], [5, 3], [6, 0], [7, 4], [7, 5], [8, 2]]);
const START = Object.freeze([0, 3]);
const GOAL = Object.freeze([9, 1]);
const MOVES = Object.freeze({
  up: [0, -1, '\u2191'],
  down: [0, 1, '\u2193'],
  left: [-1, 0, '\u2190'],
  right: [1, 0, '\u2192'],
});
// One real minute of light travel is one second of game.
const GAME_SECONDS_PER_MINUTE = 1;

const isRock = (x, y) => ROCKS.some(([rx, ry]) => rx === x && ry === y);

export function createDelay({ api, earn, params }) {
  const canvas = el('canvas', { class: 'act-canvas', width: COLS * CELL, height: ROWS * CELL, 'aria-hidden': 'true' });
  const ctx = canvas.getContext('2d');
  const status = el('p', { class: 'act-out', 'aria-live': 'polite' });
  const queue = el('p', { class: 'act-queue' });
  const timers = new Set();
  let rover = [...START];
  let inFlight = [];
  let won = false;

  const oneWayMinutes = () => {
    const km = distanceKm(api, 'earth', 'mars');
    return km ? km / LIGHT_KMS / 60 : 12;
  };

  function draw() {
    ctx.fillStyle = '#9a5634';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (const [x, y] of ROCKS) {
      ctx.fillStyle = '#4a2a1c';
      ctx.beginPath();
      ctx.arc(x * CELL + CELL / 2, y * CELL + CELL / 2, CELL * 0.38, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#d9d2c4';
    ctx.beginPath();
    ctx.arc(GOAL[0] * CELL + CELL / 2, GOAL[1] * CELL + CELL / 2, CELL * 0.32, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1b1405';
    ctx.font = '10px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(params.goalName ?? 'Yogi', GOAL[0] * CELL + CELL / 2, GOAL[1] * CELL + CELL / 2 + 3);
    ctx.fillStyle = '#f2c14e';
    ctx.fillRect(rover[0] * CELL + 7, rover[1] * CELL + 9, CELL - 14, CELL - 18);
    ctx.fillStyle = '#222';
    for (const dx of [8, CELL - 12]) {
      ctx.fillRect(rover[0] * CELL + dx, rover[1] * CELL + 6, 4, 4);
      ctx.fillRect(rover[0] * CELL + dx, rover[1] * CELL + CELL - 10, 4, 4);
    }
  }

  function showQueue() {
    text(queue, inFlight.length ? `On their way to Mars: ${inFlight.map((m) => MOVES[m][2]).join(' ')}` : 'No commands on the way.');
  }

  function arrive(move) {
    inFlight = inFlight.slice(1);
    showQueue();
    if (won) return;
    const [dx, dy] = MOVES[move];
    const x = rover[0] + dx;
    const y = rover[1] + dy;
    if (x < 0 || y < 0 || x >= COLS || y >= ROWS || isRock(x, y)) {
      text(status, `${params.roverName ?? 'The rover'} saw a hazard and stopped. You only find out now, a whole delay after you sent the command.`);
      return;
    }
    rover = [x, y];
    draw();
    if (x === GOAL[0] && y === GOAL[1]) {
      won = true;
      text(status, params.winText ?? 'You made it! Now imagine every move taking real minutes. That is why drivers planned a whole day of moves at once.');
      earn();
    }
  }

  function send(move) {
    if (won) return;
    const minutes = oneWayMinutes();
    const delay = Math.max(2, minutes * GAME_SECONDS_PER_MINUTE) * 1000;
    inFlight = [...inFlight, move];
    showQueue();
    text(status, `Sent! Right now a radio signal takes ${formatLightTime(minutes * 60)} to reach Mars, so it arrives in ${Math.round(delay / 1000)} game seconds.`);
    const id = setTimeout(() => {
      timers.delete(id);
      arrive(move);
    }, delay);
    timers.add(id);
  }

  function reset() {
    for (const id of timers) clearTimeout(id);
    timers.clear();
    rover = [...START];
    inFlight = [];
    won = false;
    showQueue();
    text(status, `Drive to the rock called ${params.goalName ?? 'Yogi'}. Dark circles are boulders.`);
    draw();
  }

  const pad = el('div', { class: 'act-pad', role: 'group', 'aria-label': 'Send a command' }, [
    ...Object.entries(MOVES).map(([move, [, , arrow]]) =>
      el('button', { type: 'button', class: 'story-btn', 'aria-label': `Send ${move}`, text: arrow, onclick: () => send(move) }),
    ),
    el('button', { type: 'button', class: 'story-btn', text: 'Start over', onclick: reset }),
  ]);
  reset();
  return {
    node: el('div', { class: 'act' }, [canvas, pad, queue, status]),
    dispose: () => {
      for (const id of timers) clearTimeout(id);
      timers.clear();
    },
  };
}
