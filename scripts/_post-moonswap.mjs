import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import ffmpeg from 'ffmpeg-static';

const FONT = '/System/Library/Fonts/Supplemental/Arial Bold.ttf';
const MUSIC = path.join(os.homedir(), 'Downloads/Cosminova Music/Audio (MP3)/small-hours.mp3');
const DIR = path.resolve('video');
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'ms-'));
const DUR = 42;

// [from, to, text]
const CAPS = [
  [0.2, 3.2, 'What if planets\nreplaced our Moon?'],
  [3.4, 5.9, 'This is our Moon.\nEvery planet here sits\nat the same distance.'],
  [6.1, 10.9, 'MARS\n2× wider than the Moon'],
  [11.1, 15.9, 'VENUS\n3.5× wider'],
  [16.1, 20.9, 'NEPTUNE\n14× wider'],
  [21.1, 25.9, 'URANUS\n15× wider'],
  [26.1, 32.9, 'JUPITER\n40× wider than the Moon'],
  [33.1, 38.4, 'SATURN\nIts rings would span\n40° of the sky'],
  [38.6, 41.9, 'Explore it in Cosminova\nLink in description'],
];

function filters(size, y, label) {
  const parts = CAPS.flatMap(([a, b, text], i) => text.split('\n').map((line, j) => {
    const file = path.join(TMP, `c${i}-${j}.txt`);
    fs.writeFileSync(file, line);
    const alpha = `if(lt(t,${a}+0.3),(t-${a})/0.3,if(gt(t,${b}-0.3),(${b}-t)/0.3,1))`;
    // The first line is the name, larger; the rest are the fact under it.
    const fs_ = j === 0 ? size : Math.round(size * 0.78);
    const dy = j === 0 ? 0 : Math.round(size * 1.25 + (j - 1) * size * 0.98);
    return `drawtext=fontfile='${FONT}':textfile='${file}':fontsize=${fs_}:fontcolor=white:`
      + `borderw=${Math.round(fs_ / 13)}:bordercolor=black@0.85:`
      + `x=(w-text_w)/2:y=${y}+${dy}:enable='between(t,${a},${b})':alpha='${alpha}'`;
  }));
  // A tag over the real Moon, which at true scale is only a few pixels.
  const tag = path.join(TMP, 'tag.txt');
  fs.writeFileSync(tag, 'Moon');
  parts.push(`drawtext=fontfile='${FONT}':textfile='${tag}':fontsize=${label}:fontcolor=white:borderw=3:bordercolor=black:`
    + `x=(w-text_w)/2:y=h*0.413-${label * 1.9}:enable='between(t,3.4,5.9)'`);
  return parts.join(',');
}

const src = path.join(DIR, 'moon-swap-wide.mp4');
const audio = ['-i', MUSIC, '-map', '0:v', '-map', '1:a',
  '-af', `afade=t=in:d=1.5,afade=t=out:st=${DUR - 3}:d=3`, '-c:a', 'aac', '-b:a', '192k', '-shortest'];
const enc = ['-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-movflags', '+faststart'];

execFileSync(ffmpeg, ['-y', '-loglevel', 'error', '-i', src, ...audio.slice(0, 2),
  '-vf', filters(64, 'h*0.07', 30), ...audio.slice(2), ...enc, path.join(DIR, 'FINAL-moon-swap-16x9.mp4')]);
execFileSync(ffmpeg, ['-y', '-loglevel', 'error', '-i', src, ...audio.slice(0, 2),
  '-vf', `crop=608:1080:656:0,scale=1080:1920:flags=lanczos,${filters(78, 'h*0.10', 44)}`,
  ...audio.slice(2), ...enc, path.join(DIR, 'FINAL-moon-swap-vertical.mp4')]);
console.log('done');
