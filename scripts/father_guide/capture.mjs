#!/usr/bin/env node
// Captures the screenshots and clip frames of the Vietnamese quick-start guide from the real viewer.
//   node scripts/father_guide/capture.mjs github <out>            GitHub page: repo, Code menu
//   node scripts/father_guide/capture.mjs viewer <out>            viewer stills (start, simulator, references, settings, controls, plans, evening)
//   node scripts/father_guide/capture.mjs frames <out> [orbit|walk|tour]   30 fps JPEG frames for the three clips
// Needs desktop Google Chrome (GPU, 1920x1080). The viewer is opened as a file, so a visitor's saved layout is never touched.
// Environment: FRAMES=<n> limits the frames per clip (smoke test).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { launch } from './cdp.mjs';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const [mode, outArg, which] = process.argv.slice(2);
if (!mode || !outArg) { console.error('usage: capture.mjs github|viewer|frames <out-dir> [clip]'); process.exit(1); }
const out = path.resolve(outArg); fs.mkdirSync(out, { recursive: true });
const viewerUrl = 'file://' + path.join(root, 'Thach_Bi_Viewer/OPEN_CHURCH.html');
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'guide-capture-'));
const c = await launch({ port: 9360, profile });
const raf = (n = 3) => `new Promise(r=>{let n=0;const f=()=>{if(++n>=${n})r(1);else requestAnimationFrame(f)};requestAnimationFrame(f);setTimeout(()=>r(0),800)})`;
const ease = (t) => t * t * (3 - 2 * t);
const rect = async (sel) => JSON.parse(await c.eval(`(()=>{const r=document.querySelector('${sel}').getBoundingClientRect();return JSON.stringify({cx:r.x+r.width/2,cy:r.y+r.height/2})})()`));
const click = async (sel, wait = 1200) => { const r = await rect(sel); await c.click(r.cx, r.cy); await c.sleep(wait); };
async function openViewer() {
  await c.goto(viewerUrl);
  for (let i = 0; i < 90; i++) { await c.sleep(1000); if (await c.eval('!!(window.church&&window.church.ready)')) break; }
  await c.sleep(4000);
}
try {
  await c.setViewport(1920, 1080, 1);
  if (mode === 'github') {
    await c.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'light' }] });
    await c.goto('https://github.com/DangHoangGeo/giaoxuthachbi-simulator'); await c.sleep(6000);
    await c.shot(path.join(out, 'gh-repo.png'));
    await c.click(1201, 281); await c.sleep(2500);               // the green Code button at 1920 x 1080
    await c.shot(path.join(out, 'gh-code-menu.png'));
  } else if (mode === 'viewer') {
    await openViewer();
    await c.shot(path.join(out, 'v-start.png'));
    await click('#simulatorButton', 4000); await c.shot(path.join(out, 'v-simulator.png')); await click('#simulatorButton');
    await click('#referencesButton', 3500); await c.shot(path.join(out, 'v-references.png')); await click('#closeReferences');
    await click('#ctlToggle', 2500); await c.shot(path.join(out, 'v-controls.png')); await click('#ctlToggle');
    await click('#settingsButton', 2500); await c.shot(path.join(out, 'v-settings.png'));
    await click('#roofToggle'); await click('#seating4'); await click('#closeSettings');   // plan view, roof hidden
    await c.eval(`(()=>{church.orbitCamera.position.set(24,62,0.01);church.controls.target.set(24,0,0);church.controls.update();})()`);
    await c.sleep(3000); await c.shot(path.join(out, 'v-plan4.png'));
    await click('#settingsButton'); await click('#seating2'); await click('#closeSettings'); await c.sleep(2500);
    await c.shot(path.join(out, 'v-plan2.png'));
    await click('#settingsButton'); await click('#seating4'); await click('#roofToggle');
    await c.eval(`(()=>{church.orbitCamera.position.set(-47,25,61);church.controls.target.set(20,12,0);church.controls.update();})()`);
    await click('#eveningLighting');
    for (let i = 0; i < 150 && (await c.eval('document.body.dataset.lighting')) !== 'evening'; i++) await c.sleep(2000);
    await click('#closeSettings', 4000); await c.shot(path.join(out, 'v-evening.png'));
  } else if (mode === 'frames') {
    const limit = +process.env.FRAMES || Infinity;
    const clip = async (name, n, step) => {
      fs.mkdirSync(path.join(out, name), { recursive: true });
      for (let i = 0; i < Math.min(n, limit); i++) {
        await step(i, n); await c.eval(raf());
        await c.shot(path.join(out, name, `f${String(i).padStart(4, '0')}.jpg`), { format: 'jpeg', quality: 90 });
      }
      console.log(name, 'done');
    };
    if (!which || which === 'orbit') {
      await openViewer();
      await c.eval('window.__o={p:church.orbitCamera.position.toArray(),t:church.controls.target.toArray()}');
      const a0 = (-40 * Math.PI) / 180, a1 = (50 * Math.PI) / 180;   // front of the church round to the long side
      await clip('orbit', 300, (i, n) => c.eval(`(()=>{const o=__o,a=${a0 + (a1 - a0) * ease(i / (n - 1))};const dx=o.p[0]-o.t[0],dz=o.p[2]-o.t[2];
        church.orbitCamera.position.set(o.t[0]+dx*Math.cos(a)+dz*Math.sin(a),o.p[1],o.t[2]-dx*Math.sin(a)+dz*Math.cos(a));church.controls.update();})()`));
    }
    if (!which || which === 'walk') {
      if (which === 'walk') await openViewer();
      await click('#goInside', 4000);
      await clip('walk', 390, (i, n) => c.eval(`church.setWalkPosition(${8 + 22 * ease(i / (n - 1)) * 0.9 + 22 * 0.1 * (i / (n - 1))},0,0,0.03)`));
    }
    if (!which || which === 'tour') {
      await openViewer();
      await c.eval('church.startTour()'); await c.sleep(1500);
      await c.eval('CHURCH_CINEMA.setPaused(true)');
      await c.eval(`(()=>{const s=document.createElement('style');s.textContent='.cinema-status,.cinema-controls{display:none!important}';document.head.appendChild(s)})()`);
      await clip('tour', 195, (i) => c.eval(`CHURCH_CINEMA.seek(${7 + i / 30})`));   // title card and first approach, 7 s to 13.5 s
    }
  } else { console.error('unknown mode'); process.exitCode = 1; }
} finally { c.close(); fs.rmSync(profile, { recursive: true, force: true }); }
process.exit(process.exitCode || 0);
