#!/usr/bin/env node
// Builds the narrated Vietnamese quick-start video from the guide scenes.
//   node scripts/father_guide/build.mjs --frames <dir with orbit/ walk/ tour/ jpg frames> [--out file.mp4]
// Needs: Google Chrome (renders the 1920x1080 captions), ffmpeg/ffprobe, and the audio made by tts.mjs.
// Steps: render caption frames from index.html?frame=<scene> -> one segment per scene -> concatenate with the narration.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import os from 'node:os';
import { launch } from './cdp.mjs';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const dir = path.join(root, 'docs/guides/father-quick-start');
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 ? process.argv[i + 1] : d; };
const framesDir = arg('frames'), outFile = path.resolve(arg('out', path.join(root, 'exports/sharing/huong-dan-xem-mo-hinh-3d.mp4')));
if (!framesDir) { console.error('--frames <dir> is required'); process.exit(1); }
const load = (f) => { const c = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(dir, f), 'utf8'), c); return c.window; };
const G = load('scenes.js').GUIDE, T = load('timings.js').TIMINGS;
const work = fs.mkdtempSync(path.join(os.tmpdir(), 'guide-video-'));
const ff = (...a) => execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...a], { stdio: ['ignore', 'inherit', 'inherit'] });
const FPS = 30;

// Caption window of sentence i: from its start (a little early) to the next one's start; last one runs to the end.
const windows = (id) => { const t = T[id]; return t.sentences.map((s, i) => [i === 0 ? 0 : Math.max(0, s.start - 0.05), i + 1 < t.sentences.length ? Math.max(0, t.sentences[i + 1].start - 0.05) : t.duration]); };
const hasSpot = (sc) => (sc.spots && sc.spots.length) || sc.urlSpot || sc.kind === 'extract' || sc.kind === 'folder';

const chrome = await launch({ port: 9350, profile: path.join(work, 'chrome') });
await chrome.setViewport(1920, 1080, 1);
await chrome.send('Emulation.setDefaultBackgroundColorOverride', { color: { r: 0, g: 0, b: 0, a: 0 } });
async function render(id, k, spot, overlay, file) {
  await chrome.goto(`file://${dir}/index.html?frame=${id}&k=${k}&spot=${spot ? 1 : 0}&overlay=${overlay ? 1 : 0}`);
  for (let i = 0; i < 40 && (await chrome.eval('document.title')) !== 'ready'; i++) await chrome.sleep(150);
  await chrome.sleep(500);                                   // let images decode
  await chrome.shot(file);
}

const segs = [];
for (const sc of G.scenes) {
  const id = sc.id, D = T[id].duration, win = windows(id), out = path.join(work, `${id}.mp4`);
  if (sc.kind === 'clip') {
    const name = path.basename(sc.clip, '.mp4'), n = fs.readdirSync(path.join(framesDir, name)).filter((f) => f.endsWith('.jpg')).length;
    const stretch = Math.min(1.4, Math.max(1, D / (n / FPS)));
    const ovs = [];
    for (let k = 0; k < win.length; k++) { const f = path.join(work, `${id}-ov${k}.png`); await render(id, k, true, true, f); ovs.push(f); }
    const inputs = ['-framerate', String(FPS), '-i', path.join(framesDir, name, 'f%04d.jpg'), ...ovs.flatMap((f) => ['-loop', '1', '-t', String(D), '-i', f])];
    let fc = `[0:v]setpts=PTS*${stretch.toFixed(4)},tpad=stop_mode=clone:stop_duration=30,trim=duration=${D},fps=${FPS},format=yuv420p[b0];`;
    ovs.forEach((_, k) => { fc += `[${k + 1}:v]format=rgba[o${k}];[b${k}][o${k}]overlay=enable='between(t,${win[k][0]},${win[k][1]})':format=auto${k + 1 === ovs.length ? ',format=yuv420p[v]' : `[b${k + 1}]`};`; });
    ff(...inputs, '-filter_complex', fc.replace(/;$/, ''), '-map', '[v]', '-t', String(D), '-r', String(FPS), '-c:v', 'libx264', '-crf', '14', '-preset', 'fast', '-pix_fmt', 'yuv420p', out);
  } else {
    const list = [];
    for (let k = 0; k < win.length; k++) {
      const [a, b] = win[k];
      if (k === 0 && hasSpot(sc)) {                           // highlight appears after a short beat
        const f0 = path.join(work, `${id}-k0-off.png`); await render(id, 0, false, false, f0);
        const cut = Math.min(0.9, b - a - 0.2);
        list.push([f0, cut]); const f1 = path.join(work, `${id}-k0.png`); await render(id, 0, true, false, f1); list.push([f1, b - a - cut]);
      } else { const f = path.join(work, `${id}-k${k}.png`); await render(id, k, true, false, f); list.push([f, b - a]); }
    }
    const txt = path.join(work, `${id}.txt`);
    fs.writeFileSync(txt, list.map(([f, d]) => `file '${f}'\nduration ${d.toFixed(3)}`).join('\n') + `\nfile '${list[list.length - 1][0]}'\n`);
    ff('-f', 'concat', '-safe', '0', '-i', txt, '-vf', `fps=${FPS},format=yuv420p`, '-t', String(D), '-c:v', 'libx264', '-crf', '14', '-preset', 'fast', out);
  }
  segs.push(out); console.log('segment', id, D + ' s');
}
chrome.close();

const vlist = path.join(work, 'v.txt'); fs.writeFileSync(vlist, segs.map((f) => `file '${f}'`).join('\n'));
const alist = path.join(work, 'a.txt'); fs.writeFileSync(alist, G.scenes.map((s) => `file '${path.join(dir, 'audio', s.id + '.m4a')}'`).join('\n'));
const total = G.scenes.reduce((a, s) => a + T[s.id].duration, 0);
fs.mkdirSync(path.dirname(outFile), { recursive: true });
ff('-f', 'concat', '-safe', '0', '-i', vlist, '-f', 'concat', '-safe', '0', '-i', alist,
  '-vf', `fade=t=in:st=0:d=0.5,fade=t=out:st=${(total - 0.7).toFixed(2)}:d=0.7`, '-af', `afade=t=out:st=${(total - 0.5).toFixed(2)}:d=0.5`,
  '-c:v', 'libx264', '-crf', '20', '-preset', 'slow', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', '-shortest', outFile);
console.log('wrote', outFile, total.toFixed(1) + ' s');
fs.rmSync(work, { recursive: true, force: true });
