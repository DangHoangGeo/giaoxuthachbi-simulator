/* Cinematic tour checks without a browser: the shot list, the camera path as
 * a function of film time, the scene changes, the organ score and the hooks in
 * the viewer. Clearance from the model and its fittings needs the open viewer:
 * run CHURCH_CINEMA.audit() there (see docs/simulator/guide.md). Rendering,
 * sound output and the controls are checked in the browser as well. */
const fs = require('node:fs'), vm = require('node:vm'), path = require('node:path'), assert = require('node:assert/strict');
const viewer = path.resolve(__dirname, '../Thach_Bi_Viewer');
const read = file => fs.readFileSync(path.join(viewer, file), 'utf8');
const sandbox = { window: {}, document: {}, performance, console, setInterval, clearInterval, setTimeout };
vm.createContext(sandbox);
vm.runInContext(read('cinematic-tour.js'), sandbox);
const film = sandbox.window.CHURCH_CINEMA;
const { shots, score } = film;
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const unit = v => { const n = Math.hypot(...v); return v.map(x => x / n); };

// Film and music have the same length, in whole four-second bars.
assert.equal(shots.reduce((sum, shot) => sum + shot.bars, 0), score.bars, 'shots and score cover the same bars');
assert.equal(film.length, score.bars * 4);
assert(film.length >= 240 && film.length <= 360, 'a film of four to six minutes');
assert.equal(new Set(shots.map(shot => shot.id)).size, shots.length, 'scene ids are unique');
for (const shot of shots) {
  assert(Number.isInteger(shot.bars) && shot.bars >= 2, `${shot.id}: whole bars`);
  assert(shot.keys.length >= 2 && shot.keys.every(key => key.length >= 6 && key.every(Number.isFinite)), `${shot.id}: keys`);
  assert(['day', 'evening'].includes(shot.light) && typeof shot.roof === 'boolean' && ['fade', 'dip', 'cut'].includes(shot.cut), `${shot.id}: scene state`);
  if (shot.en) assert(shot.vi, `${shot.id}: caption in both languages`);
  if (shot.note) assert(shot.note.en && shot.note.vi, `${shot.id}: note in both languages`);
}

// Scene order asked for by the owner: outside and inside by day, then the
// evening, with the roof hidden only at night.
assert.deepEqual([...new Set(shots.map(shot => shot.chapter))], ['outside', 'inside', 'night']);
assert(shots.filter(shot => shot.chapter !== 'night').every(shot => shot.light === 'day' && shot.roof));
assert(shots.filter(shot => !shot.roof).length >= 2 && shots.filter(shot => !shot.roof).every(shot => shot.light === 'evening'), 'roof hidden at night only');
const last = shots[shots.length - 1];
assert(last.end && last.roof, 'the film closes with the roof back on');
// A change of light or roof is never seen: the picture is black at that moment.
assert(film.black(0) > 0.99 && film.black(film.length - 0.01) > 0.99, 'opens from and closes to black');
shots.slice(1).forEach((shot, i) => {
  const before = shots[i];
  if (shot.light !== before.light || shot.roof !== before.roof) {
    assert(film.black(shot.start - 0.001) > 0.99 && film.black(shot.start + 0.001) > 0.99, `${shot.id}: scene change under black`);
  }
});

// Camera path at 30 frames a second: finite, above the courtyard ground,
// level horizon possible, and no jumps inside a scene.
const GROUND = -2.08, FRAME = 1 / 30;
let previous = null, fastest = 0, quickestTurn = 0;
for (let time = 0; time < film.length; time += FRAME) {
  const p = film.pose(time);
  assert([...p.eye, ...p.look, p.lens].every(Number.isFinite), `finite pose at ${time.toFixed(2)} s`);
  assert(p.eye[1] > GROUND + 1.2, `camera above the ground at ${time.toFixed(2)} s`);
  assert(p.lens >= 34 && p.lens <= 64, `lens angle at ${time.toFixed(2)} s`);
  assert(dist(p.eye, p.look) > 2, `a point to look at, at ${time.toFixed(2)} s`);
  const view = unit(p.look.map((v, i) => v - p.eye[i]));
  assert(Math.abs(view[0] * p.up[0] + view[1] * p.up[1] + view[2] * p.up[2]) < 0.9995, `view not along the up axis at ${time.toFixed(2)} s`);
  if (previous && previous.shot === p.shot) {
    const speed = dist(p.eye, previous.eye) / FRAME;
    const turn = Math.acos(Math.min(1, view[0] * previous.view[0] + view[1] * previous.view[1] + view[2] * previous.view[2])) * 180 / Math.PI / FRAME;
    fastest = Math.max(fastest, speed); quickestTurn = Math.max(quickestTurn, turn);
    assert(speed < 12, `${p.shot.id}: ${speed.toFixed(1)} m/s at ${time.toFixed(2)} s`);
    assert(turn < 40, `${p.shot.id}: turns ${turn.toFixed(1)} °/s at ${time.toFixed(2)} s`);
    // Interior scenes travel at an unhurried pace.
    if (p.shot.chapter === 'inside') assert(speed < 3.2, `${p.shot.id}: ${speed.toFixed(1)} m/s indoors`);
  }
  previous = { ...p, view };
}
// Scenes joined by a plain cut that continue the same movement meet exactly.
for (const [from, to] of [['facade', 'towers'], ['side-b', 'rear'], ['rear', 'return'], ['enter', 'nave'], ['roof-off', 'night-orbit'], ['night-orbit', 'over-nave']]) {
  const a = shots.find(shot => shot.id === from), b = shots.find(shot => shot.id === to);
  assert.equal(b.index, a.index + 1); assert.equal(b.cut, 'cut');
  const end = film.pose(b.start - 1e-6), begin = film.pose(b.start);
  assert(dist(end.eye, begin.eye) < 0.01 && dist(end.look, begin.look) < 0.01 && Math.abs(end.lens - begin.lens) < 0.01, `${from} → ${to} continues`);
}
// The plan view looks straight down with side B at the top of the picture, and
// hands over to the level-horizon orbit without a visible change: both poses
// lie in the vertical plane through the look point.
const plan = shots.find(shot => shot.id === 'roof-off');
assert.deepEqual([...plan.up], [0, 0, -1]);
assert(plan.keys.every(key => key[0] === key[3]), 'plan view stays in one vertical plane');
assert(plan.keys[0][1] > 80 && Math.abs(plan.keys[0][2]) < 2, 'starts directly above the church');

// Score: sorted, inside the film, organ compass, G major with the one D sharp
// of the B major chord, a pedal note under every bar.
const scale = new Set([7, 9, 11, 0, 2, 4, 6, 3]);
let bassCover = 0;
score.events.forEach((event, i) => {
  if (i) assert(event.time >= score.events[i - 1].time, 'events in time order');
  assert(event.time >= 0 && event.length > 0.2 && event.time + event.length <= film.length + 0.25, 'note inside the film');
  assert(event.note >= 36 && event.note <= 84, `note ${event.note} within C2–C6`);
  assert(scale.has(event.note % 12), `note ${event.note} belongs to the key`);
  assert(event.level > 0 && event.level <= 1);
  if (/[pP]edal/.test(event.stops)) bassCover += event.length;
});
assert(Math.abs(bassCover - film.length) < 0.5, `pedal line covers the film (${bassCover.toFixed(1)} s)`);
assert(score.events.length > 600);

// Figures quoted in the captions are the values held in the model data.
const bundle = read('bundle.js'), text = JSON.stringify(shots);
for (const [quoted, source] of [['+36.920 m', 'crossTop: 36.92'], ['+12.472 m', 'ridge: 12.472'], ['53.016 m', '12: 53.016,'], ['+0.750 m', 'altar: 0.75'],
  ['+8.390, +15.840, +23.140 and +29.090 m', 'tower: [8.39, 15.84, 23.14, 29.09]'], ['3.100 m', 'clearEntranceWidths: [2.15, 3.1, 2.15]']]) {
  assert(text.includes(quoted), `caption quotes ${quoted}`);
  assert(bundle.includes(source), `model data holds ${source}`);
}

// Viewer hooks: the tour button starts the film, the render loop drives it,
// and every way of ending a tour stops it.
assert(bundle.includes('window.CHURCH_CINEMA.start(vi)'), 'tour button starts the film');
assert(bundle.includes('if (((K = V), J?.cinema)) window.CHURCH_CINEMA.frame(_e);'), 'render loop drives the film');
assert(bundle.includes('V && window.CHURCH_CINEMA?.stop()'), 'ending the tour stops the film');
const html = read('OPEN_CHURCH.html');
assert(/<button id="tourButton"[^>]*>▶ Cinematic tour<\/button>/.test(html), 'tour button in the page');
assert(html.indexOf('cinematic-tour.js') > 0 && html.indexOf('cinematic-tour.js') < html.indexOf('startup.js'), 'film module loads before the model starts');
assert(html.includes('cinematic-tour.css'));
// Offline and private: the module fetches nothing and stores nothing.
assert(!/\bfetch\(|XMLHttpRequest|localStorage|sessionStorage|https?:\/\//.test(read('cinematic-tour.js')), 'no network or storage use');

console.log(`Cinematic tour: ${shots.length} scenes, ${film.length} s, ${score.bars} bars, ${score.events.length} notes. ` +
  `Fastest ${fastest.toFixed(1)} m/s, quickest turn ${quickestTurn.toFixed(1)} °/s. Path, scene and score checks passed.`);
