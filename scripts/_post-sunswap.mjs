import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import ffmpeg from 'ffmpeg-static';

const FONT = '/System/Library/Fonts/Supplemental/Arial Bold.ttf';
const MUSIC = path.join(os.homedir(), 'Downloads/Cosminova Music/Audio (MP3)/lantern-moss.mp3');
const DIR = path.resolve('video');
const EQ = 'eq=brightness=0.07:contrast=1.06:saturation=1.2:gamma=1.15';
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'ms-'));
const DUR = 39;

// [from, to, text]
const CAPS = [
  [0.2, 3.4, 'What if we replaced\nthe Sun?'],
  [3.6, 6.9, 'OUR SUN\nThis is normal.'],
  [7.1, 13.9, 'SIRIUS\n25× brighter. Twice as wide.'],
  [14.1, 20.9, 'PROXIMA CENTAURI\nA dim red dwarf, 7× smaller'],
  [21.1, 30.9, 'BETELGEUSE\nA red supergiant, 760× wider than the Sun'],
  [31.1, 33.9, 'A BLACK HOLE\nSame mass. Only 6 km wide.'],
  [34.1, 36.5, 'No daylight. Ever.\nEarth’s orbit stays the same.'],
  [36.7, 38.9, 'Explore it in Cosminova\nLink in description'],
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
  return parts.join(',');
}

const src = path.join(DIR, 'sun-swap-raw.mp4');
const audio = ['-i', MUSIC, '-map', '0:v', '-map', '1:a',
  '-af', `afade=t=in:d=1.5,afade=t=out:st=${DUR - 3}:d=3`, '-c:a', 'aac', '-b:a', '192k', '-t', String(DUR)];
const enc = ['-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-movflags', '+faststart'];

execFileSync(ffmpeg, ['-y', '-loglevel', 'error', '-i', src, ...audio.slice(0, 2),
  '-vf', `${EQ},${filters(64, 'h*0.07', 30)}`, ...audio.slice(2), ...enc, path.join(DIR, 'FINAL-sun-swap-16x9.mp4')]);
execFileSync(ffmpeg, ['-y', '-loglevel', 'error', '-i', src, ...audio.slice(0, 2),
  '-vf', `${EQ},crop=608:1080:656:0,scale=1080:1920:flags=lanczos,${filters(78, 'h*0.10', 44)}`,
  ...audio.slice(2), ...enc, path.join(DIR, 'FINAL-sun-swap-vertical.mp4')]);
console.log('done');
