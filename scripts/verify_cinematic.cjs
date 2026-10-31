/* Cinematic tour and technical tour checks without a browser: the shot lists,
 * the camera path as a function of film time, the scene changes, the scores,
 * the captions and their figures, and the hooks in the viewer. Clearance from the model and its fittings needs the open viewer:
 * run CHURCH_CINEMA.audit() there (see docs/simulator/guide.md). Rendering,
 * sound output and the controls are checked in the browser as well. */
const fs = require('node:fs'), vm = require('node:vm'), path = require('node:path'), assert = require('node:assert/strict');
const viewer = path.resolve(__dirname, '../Thach_Bi_Viewer');
const read = file => fs.readFileSync(path.join(viewer, file), 'utf8');
const sandbox = { window: {}, document: { getElementById: () => null }, performance, console, setInterval, clearInterval, setTimeout };
vm.createContext(sandbox);
vm.runInContext(read('cinematic-tour.js'), sandbox);
const film = sandbox.window.CHURCH_CINEMA;
const { shots, score } = film;
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const unit = v => { const n = Math.hypot(...v); return v.map(x => x / n); };
// Values made inside the sandbox compare by content, not by prototype.
const plain = value => JSON.parse(JSON.stringify(value));

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
function checkPath(reel, { indoorLimit }) {
  let previous = null, fastest = 0, quickestTurn = 0;
  for (let time = 0; time < reel.length; time += FRAME) {
    const p = film.pose(time, reel), where = `${reel.id} ${time.toFixed(2)} s`;
    assert([...p.eye, ...p.look, p.lens].every(Number.isFinite), `finite pose at ${where}`);
    assert(p.eye[1] > GROUND + 1.2, `camera above the ground at ${where}`);
    assert(p.lens >= 34 && p.lens <= 64, `lens angle at ${where}`);
    assert(dist(p.eye, p.look) > 2, `a point to look at, at ${where}`);
    const view = unit(p.look.map((v, i) => v - p.eye[i]));
    assert(Math.abs(view[0] * p.up[0] + view[1] * p.up[1] + view[2] * p.up[2]) < 0.9995, `view not along the up axis at ${where}`);
    if (previous && previous.shot === p.shot) {
      const speed = dist(p.eye, previous.eye) / FRAME;
      const turn = Math.acos(Math.min(1, view[0] * previous.view[0] + view[1] * previous.view[1] + view[2] * previous.view[2])) * 180 / Math.PI / FRAME;
      fastest = Math.max(fastest, speed); quickestTurn = Math.max(quickestTurn, turn);
      assert(speed < 12, `${p.shot.id}: ${speed.toFixed(1)} m/s at ${where}`);
      assert(turn < 40, `${p.shot.id}: turns ${turn.toFixed(1)} °/s at ${where}`);
      // Inside the building the camera travels at an unhurried pace.
      if (indoorLimit && p.eye[0] > 3 && p.eye[0] < 53 && Math.abs(p.eye[2]) < 10 && p.eye[1] < 9 && p.shot.roof) assert(speed < indoorLimit, `${p.shot.id}: ${speed.toFixed(1)} m/s indoors at ${where}`);
    }
    previous = { ...p, view };
  }
  return { fastest, quickestTurn };
}
const { fastest, quickestTurn } = checkPath(film.films.full, { indoorLimit: 3.2 });
assert(!shots.some(shot => shot.systems), 'no wiring-only scenes');
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
assert.deepEqual(plain(plan.up), [0, 0, -1]);
assert(plan.keys.every(key => key[0] === key[3]), 'plan view stays in one vertical plane');
assert(plan.keys[0][1] > 80 && Math.abs(plan.keys[0][2]) < 2, 'starts directly above the church');

// Score: sorted, inside the film, within the organ compass, a pedal note
// under the whole film.
let bassCover = 0;
score.events.forEach((event, i) => {
  if (i) assert(event.time >= score.events[i - 1].time, 'events in time order');
  assert(event.time >= 0 && event.length > 0.2 && event.time + event.length <= film.length + 0.25, 'note inside the film');
  assert(event.note >= 36 && event.note <= 88, `note ${event.note} within C2–E6`);
  assert(event.level > 0 && event.level <= 1);
  if (event.voice === 'bass') bassCover += event.length;
});
assert(bassCover > film.length * 0.97, `pedal line covers the film (${bassCover.toFixed(1)} s)`);
// The homeland melody stays on the five notes C D E G A.
const pentatonic = new Set([0, 2, 4, 7, 9]);
const home = score.events.filter(event => event.part === 'homeland' && event.voice === 'melody');
assert(home.length > 80 && home.every(event => pentatonic.has(event.note % 12)), 'homeland melody is pentatonic');
// Ave Maria (Bach–Gounod): complete in 41 bars, transcribed from Mutopia
// edition 2167. These lock the transcription and its place in the film.
const ave = score.events.filter(event => event.part === 'ave'), at = bar => (score.aveMaria.firstBar + bar - 1) * 4;
assert.deepEqual(plain(score.aveMaria), { firstBar: 26, bars: 41 });
const sung = ave.filter(event => event.voice === 'melody');
assert.equal(sung.length, 106, 'melody notes');
assert.deepEqual(plain(sung.slice(0, 5).map(event => [event.note, event.time])), [[76, at(5)], [77, at(6)], [79, at(7)], [74, at(7) + 3], [76, at(8)]], 'opening phrase E F G D E from bar 5');
// Sum of the 106 MIDI note numbers, as in the edition's own MIDI file (second pass of the repeat).
assert.equal(sung.reduce((sum, event) => sum + event.note, 0), 8040, 'melody pitches');
const top = sung.reduce((a, b) => (b.note > a.note ? b : a));
assert.deepEqual([top.note, top.time], [88, at(34)], 'the melody peaks on E6 in bar 34');
const broken = ave.filter(event => event.voice === 'broken');
assert.equal(broken.length, 37 * 12 + 28, 'broken chords of the prelude');
assert.deepEqual(plain(broken.slice(0, 6).map(event => event.note)), [67, 72, 76, 67, 72, 76], 'bar 1: G C E twice');
assert.deepEqual(plain(ave.filter(event => event.voice === 'bass').map(event => event.note).filter((n, i, all) => n !== all[i - 1])),
  [60, 59, 60, 59, 60, 59, 57, 50, 55, 53, 52, 50, 43, 48, 41, 42, 43, 44, 43, 36], 'bass line of the prelude');
// Where the music meets the picture: the prelude begins as the camera reaches
// the church door, the hush of bar 29 is the turn to evening, the "tutta
// forza" of bar 33 is the roof lifted away, and the final tonic of bar 37
// arrives as the orbit begins.
const scene = id => shots.find(shot => shot.id === id);
assert(at(1) > scene('enter').start && at(5) < scene('nave').start + scene('nave').duration, 'Ave Maria begins on entering');
assert.equal(at(29), scene('evening-nave').start);
assert.equal(at(33), scene('roof-off').start);
assert.equal(at(37), scene('night-orbit').start);
assert(score.events.length > 900);

const bundle = read('bundle.js'), text = JSON.stringify(shots);

// Recording: the viewer reports each drawn frame, and the module can make frames one at a time.
assert(bundle.includes('J?.cinema && window.CHURCH_CINEMA.rendered?.(n.domElement)'), 'render loop reports drawn frames');
assert(typeof film.still === 'function' && typeof film.play === 'function');
// The 2 min 15 s short film was removed on 11 October 2026 (owner's request).
assert.deepEqual(Object.keys(film.films), ['full', 'lighting', 'air', 'sound', 'grid'], 'the five-minute film and four technical tours');
assert(!/bell|toccata/i.test(JSON.stringify(score.events.map(event => event.stops))), 'no bell strokes in the remaining score');

// ------------------------------------------------------- technical tours
// Four separate tours: lighting, fans and air, sound, electrical grid. Each
// explains its system with demonstrations (circuits switched in a rehearsal in
// memory, the simulator's figures recalculated and shown in a live panel), with
// the simulator's own views (an analysis map with the roof hidden, or the wiring
// with the building hidden), and closes on the design status. The demonstrations
// are played against the real engine in verify_simulator.cjs.
const engine = read('simulator/engine.js'), analysis = read('simulator/analysis.js'), electrical = read('simulator/electrical.js');
const braces = text => [...String(text || '').matchAll(/\{(\w+)\}/g)].map(match => match[1]);
// A stand-in for the simulator, to check that every figure a caption quotes can be read and formatted.
const stand = { state: { scene: 'Full service · evening', settings: { ambientDbA: 40, talkerDbA: 62, micDistance: 0.4 }, items: [] }, SCENES: { a: { F2: 0 }, b: { F2: 0 } },
  typeOf: item => ({ cat: item.cat, speaker: item.cat === 'speaker' && item.circuit !== 'MIC', mic: item.circuit === 'MIC', fan: item.cat === 'fan' ? { exhaust: item.type === 'fanExhaust' } : undefined }),
  fans: () => stand.state.items.filter(item => item.cat === 'fan').map(item => ({ item, running: !!item.on, kind: item.type === 'fanExhaust' ? 'exhaust' : 'ceiling', pos: item.pos, diameter: 1.42, flow: item.on ? 0.8 : 0 })),
  mics: () => stand.state.items.filter(item => item.circuit === 'MIC').map((item, i) => ({ item: { feedbackMargin: 0.9 + i * 0.4 } })),
  room: () => ({ V: 7456 }), analysis: { results: {} },
  // 2 trunks, 3 drops and the DB-2 feeder: 5,008 m of drawn route in all.
  electrical: { routes: [{ id: 'feeder:DB2', role: 'feeder', itemIds: [], length: 80.7 }, { id: 't1', role: 'trunk', itemIds: ['a', 'b'], length: 2400 }, { id: 't2', role: 'trunk', itemIds: ['c'], length: 71.3 },
    { id: 'd1', role: 'drop', itemIds: ['a'], length: 1200 }, { id: 'd2', role: 'drop', itemIds: ['b'], length: 1238 }, { id: 'l1', role: 'local', itemIds: ['c'], length: 18 }] },
  powerSummary: () => ({ total: 5586.95, rated: 29573.5, outletRated: 19872 }) };
for (const [circuit, cat, type, n] of [['L1', 'light', 'projector36', 32], ['L2', 'light', 'projector36', 28], ['L3', 'light', 'spot15', 27], ['L8', 'light', 'spot15', 4], ['LA', 'light', 'uplight', 7], ['LD', 'light', 'chandelier8', 4], ['LD', 'light', 'sconce2', 16],
  ['F1', 'fan', 'fanCeiling', 14], ['F2', 'fan', 'fanNaveWall', 16], ['F5', 'fan', 'fanWingWall', 4], ['V1', 'fan', 'fanExhaust', 4], ['V2', 'fan', 'fanExhaust', 4], ['V3', 'fan', 'fanExhaust', 1], ['A1', 'speaker', 'slimColumn', 14], ['A2', 'speaker', 'pendantSpeaker', 4], ['A3', 'speaker', 'horn', 8], ['MIC', 'speaker', 'mic', 2]]) {
  for (let i = 0; i < n; i++) stand.state.items.push({ circuit, cat, type, on: circuit !== 'F2', pos: [10 + i, 4, i % 2 ? 4.4 : -4.4] });
}
const seat = (block, lux, air, sti) => ({ block, lux, air, sti });
const stats = (avg, min) => ({ avg, min });
stand.analysis.results.seats = { n: 368, seats: [seat('central', 330, 0.33, 0.64), seat('outer', 350, 0.38, 0.62), seat('wing', 214, 0.22, 0.49)], lux: stats(312.4, 121.6), air: stats(0.328, 0.062), sti: stats(0.601, 0.422),
  spl: stats(68.8, 66.9), noise: stats(45.2, 45), luxOk: 89.1, airOk: 80.4, stiOk: 64.9, splSpread: 2.77, blocks: { wing: { lux: stats(214.1, 121.6), air: stats(0.22, 0.062), sti: stats(0.49, 0.422) } } };
sandbox.window.CHURCH_SIMULATOR = stand;
const figures = plain(film.figures());
sandbox.window.CHURCH_SIMULATOR = undefined;
assert.deepEqual([figures.lights, figures.lightCircuits, figures.chandeliers, figures.sconces, figures.fans, figures.speakers, figures.mics], ['118', '6', '4', '16', '43', '26', '2'], 'counts by kind');
assert.deepEqual([figures.fansOn, figures.F1on, figures.F1size, figures.F1side, figures.F2idle, figures.exhaustFans, figures.exhaustOn, figures.V1, figures.V2, figures.V3, figures.exhaust, figures.ach], ['27', '14', '1.42', '4.4', '16', '9', '9', '4', '4', '1', '25,900', '3.5'], 'fan figures');
// With every lamp and fan off, light, air and noise figures are left out, so those captions use their plain wording.
sandbox.window.CHURCH_SIMULATOR = { ...stand, fans: () => stand.fans().map(fan => ({ ...fan, running: false, flow: 0 })), analysis: { results: { seats: { ...stand.analysis.results.seats, lux: stats(0, 0), air: stats(0, 0), noise: stats(40, 40) } } } };
const off = plain(film.figures());
sandbox.window.CHURCH_SIMULATOR = undefined;
assert(['luxAvg', 'luxOk', 'wingLux', 'airAvg', 'airOk', 'wingAir', 'noise', 'fansOn', 'exhaustOn', 'ach'].every(key => !(key in off)) && off.F1on === '0' && off.routes === '6' && off.lights === '118', 'nothing is quoted for light or air when nothing is on');
assert.deepEqual([figures.luxAvg, figures.luxMin, figures.luxOk, figures.naveLux, figures.wingLux, figures.airAvg, figures.wingAirMin, figures.stiAvg, figures.stiMin, figures.splSpread, figures.fbLow, figures.fbHigh],
  ['312', '122', '89', '340', '214', '0.33', '0.06', '0.60', '0.42', '2.8', '0.9', '1.3'], 'seat figures are rounded for reading, not altered');
assert.deepEqual([figures.routes, figures.km, figures.trunks, figures.drops, figures.wired, figures.feederM, figures.kwNow, figures.kwFixed], ['6', '5.0', '2', '3', '3', '81', '5.6', '9.7'],
  'wiring figures: drawn route length, and loads with the socket allowance kept apart');
assert.deepEqual(plain(film.figures()), {}, 'no figures without the simulator: captions then use their plain wording');

const circuitIds = [...engine.matchAll(/\n    (\w+): \{ label: '/g)].map(match => match[1]), sceneNames = [...engine.matchAll(/\n    '([^']+)': \{ L10:/g)].map(match => match[1]);
assert(circuitIds.includes('L1') && circuitIds.includes('MIC') && sceneNames.length >= 7, 'circuits and scenes read from the simulator');
const settingRanges = engine.match(/mixerDb: \[-60, 24\]/);
function checkDemo(shot, tour) {
  const demo = shot.demo, id = shot.id;
  assert(tour.technical && demo.title?.length === 2 && demo.title.every(Boolean), `${id}: panel title in both languages`);
  assert(demo.rows.length <= 6 && demo.stats.length >= 1 && demo.stats.length <= 4, `${id}: at most six rows and four figures fit beside the picture`);
  for (const row of demo.rows) {
    if (typeof row === 'string') assert(/^@(light|fan|sound)$/.test(row) || circuitIds.includes(row), `${id}: row ${row} is a circuit or a system`);
    else assert(row.setting === 'mixerDb' && settingRanges && row.en && row.vi && row.unit, `${id}: a setting row names a simulator setting in both languages`);
  }
  for (const key of demo.stats) { const spec = film.stats[key]; assert(spec?.en && spec.vi && typeof spec.digits === 'number', `${id}: figure ${key} is described in both languages`); }
  const steps = demo.steps, caption = shot.card?.at !== undefined ? shot.card.at - 1.2 : shot.duration - 1.2;
  assert(steps.length >= 1 && steps[0].at === 0, `${id}: the first step is at the start of the scene`);
  steps.forEach((step, i) => {
    assert(i === 0 || step.at >= steps[i - 1].at + 7, `${id}@${step.at}: each step stays long enough to read (7 s)`);
    assert(step.at <= caption - 5, `${id}@${step.at}: the last step stays 5 s before the caption goes`);
    // Reading pace: a figure counts as one word; at most 32 words, and 4.8 words a second while the step is on screen.
    if (step.note) {
      const words = step.note.en.replace(/\{\w+\}/g, 'N').split(/\s+/).length, seconds = Math.min(i + 1 < steps.length ? steps[i + 1].at : Infinity, caption) - step.at;
      assert(words <= 32 && words / seconds <= 4.8, `${id}@${step.at}: ${words} words in ${seconds} s is too fast to read`);
    }
    assert(step.scene || step.set || step.feeder !== undefined || step.setting || i === 0, `${id}@${step.at}: the step changes something`);
    if (step.scene) assert(sceneNames.includes(step.scene), `${id}@${step.at}: ${step.scene} is a built-in scene`);
    for (const [circuit, value] of Object.entries(step.set || {})) {
      assert(circuitIds.includes(circuit) && Number.isFinite(value) && value >= 0 && value <= (/^(F|V)/.test(circuit) ? 3 : 1), `${id}@${step.at}: ${circuit} set to a value the simulator accepts`);
      if (!/^(L|F|V|E)/.test(circuit)) assert(value === 0 || value === 1, `${id}@${step.at}: ${circuit} is on or off`);
    }
    for (const key of Object.keys(step.setting || {})) assert(key === 'mixerDb', `${id}@${step.at}: only the mixer level is a borrowed setting`);
    assert(step.say?.length === 2 || (step.scene && !step.say), `${id}@${step.at}: the action is named in both languages`);
    if (step.note) assert(step.note.en && step.note.vi && step.plain?.en && step.plain?.vi, `${id}@${step.at}: explanation and plain wording in both languages`);
    else assert(shot.note?.en && shot.note?.vi, `${id}@${step.at}: the scene's own note explains it`);
    assert(!/\b(complies|compliant|certified|guaranteed|approved for construction|ready to purchase)\b/i.test(JSON.stringify(step)), `${id}@${step.at}: no claim of approval or compliance`);
  });
  if (demo.breaker) assert(demo.foot?.length === 2 && /planning allowance/.test(demo.foot[0]) && /tạm tính/.test(demo.foot[1]), `${id}: breakers are called a planning allowance, not a protection design`);
}
// The aims beside the panel's figures are the simulator's own target ranges.
for (const [key, target, from, to] of [['luxAvg', 'target: [200, 300]', 200], ['airAvg', 'target: [0.3, 0.8]', 0.3, 0.8], ['splAvg', 'target: [68, 76]', 68, 76], ['stiAvg', 'target: [0.6, 1]', 0.6], ['noise', 'target: [0, 40]', undefined, 40]]) {
  const spec = film.stats[key];
  assert(analysis.includes(target), `${key}: ${target} is the simulator's range`);
  if (from !== undefined) assert(spec.ok(from) && !spec.ok(from - 0.001), `${key}: meets the aim from ${from}`);
  if (to !== undefined) assert(spec.ok(to) && !spec.ok(to + 0.001), `${key}: meets the aim up to ${to}`);
}
assert(film.stats.ach.ok(4) && film.stats.ach.ok(6) && !film.stats.ach.ok(3.9) && analysis.includes('comfort target in a hot climate with people: 4–6'), 'air changes: aim 4 to 6 as in the simulator');
assert(film.stats.fbLow.ok(3) && !film.stats.fbLow.ok(2.9) && /margin < 3/.test(analysis), 'feedback margin: aim 3 dB as in the simulator');

const tours = ['lighting', 'air', 'sound', 'grid'].map(id => film.films[id]), tourLines = [];
for (const tour of tours) {
  const cut = tour.shots, music = tour.score, name = `${tour.id} tour`;
  assert(tour.technical && tour.file && tour.file !== film.films.full.file, `${name}: its own video file name`);
  assert.equal(cut.reduce((sum, shot) => sum + shot.bars, 0), music.bars, `${name}: shots and score cover the same bars`);
  assert.equal(tour.length, music.bars * 4);
  assert(tour.length >= 120 && tour.length <= 180, `${name}: ${tour.length} s, between two and three minutes`);
  assert.equal(new Set(cut.map(shot => shot.id)).size, cut.length, `${name}: scene ids are unique`);
  for (const shot of cut) {
    assert(Number.isInteger(shot.bars) && shot.bars >= 3, `${shot.id}: at least twelve seconds`);
    assert(shot.keys.length >= 2 && shot.keys.every(key => key.length >= 6 && key.every(Number.isFinite)), `${shot.id}: keys`);
    assert(['day', 'evening'].includes(shot.light) && typeof shot.roof === 'boolean' && ['fade', 'dip', 'cut'].includes(shot.cut), `${shot.id}: scene state`);
    assert(shot.card || shot.en, `${shot.id}: a card or a caption`);
    if (shot.en) assert(shot.vi, `${shot.id}: caption in both languages`);
    if (shot.en && !shot.demo?.steps?.every(step => step.note)) assert(shot.note?.en && shot.note?.vi && (!braces(shot.note.en).length || (shot.plain?.en && shot.plain?.vi)), `${shot.id}: note in both languages, with plain wording where it quotes a figure`);
    // Every figure a text quotes exists, and the text has a plain form for use without it.
    const texts = [[shot.note?.en, shot.plain?.en], [shot.note?.vi, shot.plain?.vi], [shot.card?.line, shot.card?.plain?.line], [shot.card?.second, shot.card?.plain?.second],
      ...(shot.card?.foot || []).map((line, i) => [line, shot.card.plain?.foot?.[i]])];
    for (const step of shot.demo?.steps || []) if (step.note) texts.push([step.note.en, step.plain?.en], [step.note.vi, step.plain?.vi]);
    // A figure is one of the model (read when a scene starts) or one of a step: a statistic, its change {d_x} or its earlier value {p_x}, and a few more.
    const known = key => key in figures || key in film.stats || (/^[dp]_/.test(key) && key.slice(2) in film.stats) || ['splSpread', 'naveAir', 'echo', 'luxAim', 'hours'].includes(key) || /^A_[A-Z0-9]+$/.test(key);
    for (const [text, fallback] of texts) {
      for (const key of braces(text)) assert(known(key), `${shot.id}: figure {${key}} is read from the model`);
      if (braces(text).length) assert(fallback && !braces(fallback).length, `${shot.id}: plain wording for “${String(text).slice(0, 40)}…”`);
    }
    // The same figures in both languages.
    assert.deepEqual(braces(shot.note?.en).sort(), braces(shot.note?.vi).sort(), `${shot.id}: English and Vietnamese quote the same figures`);
    for (const step of shot.demo?.steps || []) if (step.note) assert.deepEqual(braces(step.note.en).sort(), braces(step.note.vi).sort(), `${shot.id}@${step.at}: English and Vietnamese quote the same figures`);
    if (shot.overlay) {
      assert(film.maps[shot.overlay] && analysis.includes(`${shot.overlay}: { label:`), `${shot.id}: ${shot.overlay} is one of the simulator's maps`);
      assert(!shot.roof && plain(shot.up).join() === '0,0,-1', `${shot.id}: the map is seen from above with the roof hidden, side B at the top`);
    }
    if (shot.systems) {
      assert(tour.wiring && new RegExp(`[{ ]${shot.systems}: '`).test(electrical.match(/const SYSTEMS = \{[^}]*\}/)[0]), `${shot.id}: ${shot.systems} is one of the simulator's wiring filters`);
      assert(!shot.overlay, `${shot.id}: the wiring-only view has no analysis map`);
    }
    if (shot.board) assert(['DB1', 'DB2'].includes(shot.board) && shot.systems, `${shot.id}: a board filter belongs to a wiring-only scene`);
    if (shot.demo) checkDemo(shot, tour);
    if (shot.mark) {
      const circuits = shot.mark.circuits || [], sources = shot.mark.sources || [];
      assert(shot.mark.en && shot.mark.vi && circuits.length + sources.length, `${shot.id}: rings have a key in both languages`);
      for (const circuit of circuits) assert(new RegExp(`\\n    ${circuit}: \\{ label: '`).test(engine), `${shot.id}: circuit ${circuit} exists in the simulator`);
      for (const source of sources) assert(new RegExp(`\\n    ${source}: \\{ `).test(electrical), `${shot.id}: enclosure ${source} exists in the simulator`);
    }
  }
  assert(cut.filter(shot => shot.demo).length >= 4 && cut.filter(shot => shot.demo?.steps.length >= 3).length >= 3 && cut.filter(shot => shot.overlay || shot.systems).length >= 1, `${name}: at least four demonstrations, three of them with several steps, and a simulator view`);
  assert(!tour.wiring === !cut.some(shot => shot.systems), `${name}: only the electrical tour uses the wiring-only view`);
  const route = checkPath(tour, { indoorLimit: 3.2 });
  assert(film.black(0, tour) > 0.99 && film.black(tour.length - 0.01, tour) > 0.99, `${name}: opens from and closes to black`);
  cut.slice(1).forEach((shot, i) => {
    const before = cut[i];
    if (shot.light !== before.light || shot.roof !== before.roof || shot.systems !== before.systems || shot.board !== before.board || shot.overlay !== before.overlay) assert(film.black(shot.start - 0.001, tour) > 0.99 && film.black(shot.start + 0.001, tour) > 0.99, `${shot.id}: scene change under black`);
    if (shot.cut === 'cut') {
      const end = film.pose(shot.start - 1e-6, tour), begin = film.pose(shot.start, tour);
      assert(dist(end.eye, begin.eye) < 0.01 && dist(end.look, begin.look) < 0.01 && Math.abs(end.lens - begin.lens) < 0.01 && plain(end.up).join() === plain(begin.up).join(), `${before.id} → ${shot.id} continues`);
    }
  });
  // Opening card names the tour; the closing card states the status and stays to the end.
  const first = cut[0], close = cut[cut.length - 1], words = JSON.stringify(cut);
  assert(first.card && /Technical tour/.test(first.card.small) && /Tham quan kỹ thuật/.test(first.card.small) && first.card.title.includes(' · '), `${name}: opening card in both languages`);
  assert(/simulator estimates/.test(JSON.stringify(first.card.foot)) && /\{scene\}/.test(JSON.stringify(first.card.foot)), `${name}: opening card says whose figures these are and for which scene`);
  assert(close.end && close.roof && close.card.hold && close.card.at >= 12, `${name}: closing card after the last caption has been read`);
  if (tour.wiring) assert(/not a wiring design/.test(close.card.title) && /chưa phải thiết kế điện/.test(close.card.line), `${name}: closing card says a routing study, not a wiring design`);
  else assert(/Estimates, not measurements/.test(close.card.title) && /chưa phải số đo/.test(close.card.line), `${name}: closing card says estimates, not measurements`);
  assert(/not a construction-approved design/.test(JSON.stringify(close.card.foot)) && /chưa phải thiết kế được duyệt để thi công/.test(JSON.stringify(close.card.foot)), `${name}: closing card keeps the design status`);
  assert(/Still open:/.test(JSON.stringify(close.card.foot)) && /Còn để ngỏ:/.test(JSON.stringify(close.card.foot)), `${name}: closing card lists what is still open`);
  assert(!/\b(complies|compliant|certified|guaranteed|approved for construction|ready to purchase)\b/i.test(words), `${name}: no claim of approval or compliance`);
  // Quiet music: the homeland melody only, soft throughout, ending before the picture fades.
  music.events.forEach((event, i) => {
    if (i) assert(event.time >= music.events[i - 1].time, `${name}: score in time order`);
    assert(event.part === 'quiet' && event.time >= 0 && event.length > 0.2 && event.time + event.length <= tour.length - 0.99, `${name}: note inside the tour`);
    assert(event.note >= 36 && event.note <= 88 && event.level > 0 && event.level <= 0.45, `${name}: soft notes within the organ compass`);
  });
  assert(music.events.filter(event => event.voice === 'melody').every(event => pentatonic.has(event.note % 12)), `${name}: homeland melody is pentatonic`);
  tourLines.push(`${tour.name}: ${cut.length} scenes, ${tour.length} s, ${music.bars} bars, ${music.events.length} notes, fastest ${route.fastest.toFixed(1)} m/s, quickest turn ${route.quickestTurn.toFixed(1)} °/s.`);
}
// The aims shown beside each map are the simulator's own target ranges.
for (const [kind, target, shown] of [['lux', 'target: [200, 300]', '200 or more'], ['air', 'target: [0.3, 0.8]', '0.3 to 0.8'], ['spl', 'target: [68, 76]', '68 to 76'], ['sti', 'target: [0.6, 1]', '0.60 or more']]) {
  assert(analysis.includes(`${kind}: { label:`) && analysis.includes(target) && film.maps[kind].aim.includes(shown) && film.maps[kind].en && film.maps[kind].vi, `${kind}: map key follows the simulator's target`);
}
// The wiring key names only the kinds of route the simulator draws.
for (const kind of Object.keys(film.wires.kinds)) assert(new RegExp(`[{ ]${kind}: '#`).test(electrical.match(/const COLORS = \{[^}]*\}/)[0]), `${kind} is a route kind of the simulator`);
assert(/not cable sizes/.test(film.wires.aim) && /không phải tiết diện cáp/.test(film.wires.aim), 'wiring key says the drawn thickness is not a cable size');
// What each tour is about.
const [lighting, air, sound, grid] = tours.map(tour => JSON.stringify(tour.shots));
assert(/DB-1/.test(grid) && /DB-2/.test(grid) && /LC-1/.test(grid) && /FC-1/.test(grid) && /AV-1/.test(grid), 'electrical tour: both boards and the three control enclosures');
assert(['all', 'lighting', 'air', 'sound'].every(system => grid.includes(`"systems":"${system}"`)), 'electrical tour: the wiring on its own, then lighting, fans and sound routes');
assert(/as drawn/.test(grid) && /not cable sizes/.test(grid) && /not mains power/.test(grid) && /separate allowance/.test(grid),
  'electrical tour: route length is not cable, audio lines are not mains, socket outlets are kept apart from fixed loads');
assert(/supply and earthing/.test(grid) && /voltage drop/.test(grid) && /emergency lighting/.test(grid), 'electrical tour: names what the electrical engineer still has to design');
assert(/L1/.test(lighting) && /L3/.test(lighting) && /DB-2/.test(lighting) && /"overlay":"lux"/.test(lighting), 'lighting tour: circuits, second board and the light map');
assert(/F1/.test(air) && /F2/.test(air) && ['V1', 'V2', 'V3'].every(circuit => air.includes(`"${circuit}"`)) && /"overlay":"air"/.test(air) && /No air conditioning/.test(air), 'fans tour: ceiling, wall and exhaust fans and the air-speed map');
assert(/centre line/.test(air) && /stays clear/.test(air), 'fans tour: the clear central view is stated');
assert(/A1/.test(sound) && /MIC/.test(sound) && /"overlay":"spl"/.test(sound) && /"overlay":"sti"/.test(sound) && /feedback/.test(sound), 'sound tour: microphones, loudspeakers, both speech maps and feedback');
assert(/not the modelled sound system/.test(sound), 'sound tour: the background music is not the sound system');
// The films never switch a fitting, a scene or a setting themselves. Every call they
// make is a reading, the map on show, the wiring view, the simulator's own frame
// update, or the rehearsal, which lends the switches and gives them back.
const calls = [...new Set(read('cinematic-tour.js').match(/(\bsim|\bwiring|\brehearsal|CHURCH_SIMULATOR)\??\.[A-Za-z_.?]*\(/g))].sort();
assert.deepEqual(calls, ['CHURCH_SIMULATOR.rehearsal.end(', 'CHURCH_SIMULATOR?.frame(', 'rehearsal.circuits(', 'rehearsal.feeder(', 'rehearsal.reset(', 'rehearsal.scene(', 'rehearsal.setting(', 'sim.analysis.run(', 'sim.analysis?.run(',
  'sim.electrical.setMode(', 'sim.fans(', 'sim.mics(', 'sim.powerSummary(', 'sim.rehearsal.end(', 'sim.rehearsal.reset(', 'sim.room(', 'sim.sceneLuxTarget?.(', 'sim.setOverlay(', 'sim.speakers(', 'sim.state.items.filter(',
  'sim.typeOf(', 'sim?.rehearsal?.begin(', 'wiring.rebuild(', 'wiring.reviewSelection(', 'wiring.setMode(', 'wiring.setReviewFilter('],
  'no simulator call that changes fittings, scenes or settings except through the rehearsal, the map and the wiring view on show');
assert(!/(\bsim|\bwiring|CHURCH_SIMULATOR)\??\.(applyScene|update|add|remove|duplicate|mirror|commit|undo|redo|saveNow|saveScene|importLayout|resetDesign|setSetting)\(/.test(read('cinematic-tour.js')), 'no direct edit of the design');
assert(read('simulator/engine.js').includes('if (rehearsalBase) return false;') && read('simulator/engine.js').includes('if (rehearsalBase) return;'), 'while a rehearsal lasts the simulator stores nothing and records no history');

// Figures quoted in the captions are the values held in the model data.
for (const [quoted, source] of [['+36.920 m', 'crossTop: 36.92'], ['+12.472 m', 'ridge: 12.472'], ['53.016 m', '12: 53.016,'], ['+0.800 m', 'altar: 0.8'],
  ['+8.390, +15.840, +23.140 and +29.090 m', 'tower: [8.39, 15.84, 23.14, 29.09]'], ['3.100 m', 'clearEntranceWidths: [2.15, 3.1, 2.15]']]) {
  assert(text.includes(quoted), `caption quotes ${quoted}`);
  assert(bundle.includes(source), `model data holds ${source}`);
}

// Finishes named in the captions are the ones recorded for the model.
assert(/red clay tiles/.test(text) && read('realism.js').includes('Terracotta tile · reference finish'), 'roof caption follows the tile finish');
const sanctuaryNotes = fs.readFileSync(path.resolve(__dirname, '../docs/sanctuary-model.md'), 'utf8');
assert(/sơn son thếp vàng/.test(text) && /lacquer/.test(sanctuaryNotes) && /gilded/.test(sanctuaryNotes), 'sanctuary caption follows the recorded finishes');
assert(/proposed finish|art proposal/i.test(text), 'finishes are presented as proposals');
assert(/not a construction-approved design/.test(text), 'closing card keeps the design status');

// Viewer hooks: the tour button starts the film, the render loop drives it,
// and every way of ending a tour stops it.
assert(bundle.includes('window.CHURCH_CINEMA.start(vi)'), 'tour button starts the film');
assert(bundle.includes('if (((K = V), J?.cinema)) window.CHURCH_CINEMA.frame(_e);'), 'render loop drives the film');
assert(bundle.includes('V && window.CHURCH_CINEMA?.stop()'), 'ending the tour stops the film');
const html = read('OPEN_CHURCH.html');
assert(/<button id="tourButton"[^>]*>▶ Cinematic tour<\/button>/.test(html), 'tour button in the page');
assert(!/shortFilmButton|Short film/.test(html), 'no short film button or help text in the page');
for (const [id, label] of [['lighting', 'Lights'], ['air', 'Fans'], ['sound', 'Sound'], ['grid', 'Wiring']]) assert(new RegExp(`<button data-film="${id}"[^>]*>${label}</button>`).test(html), `${id} tour button in the page`);
assert(/Technical tours/.test(html) && /estimates, not measurements/.test(html), 'tours are named in the Discover menu and explained in the help');
assert(html.indexOf('cinematic-tour.js') > 0 && html.indexOf('cinematic-tour.js') < html.indexOf('startup.js'), 'film module loads before the model starts');
assert(html.includes('cinematic-tour.css'));
// Offline and private: the module fetches nothing and stores nothing.
assert(!/\bfetch\(|XMLHttpRequest|localStorage|sessionStorage|https?:\/\//.test(read('cinematic-tour.js')), 'no network or storage use');

console.log(`Cinematic tour: ${shots.length} scenes, ${film.length} s, ${score.bars} bars, ${score.events.length} notes. ` +
  `Fastest ${fastest.toFixed(1)} m/s, quickest turn ${quickestTurn.toFixed(1)} °/s. Path, scene and score checks passed.`);
for (const line of tourLines) console.log(line);
console.log(`Technical tours: ${tours.length} tours, ${Object.keys(figures).length} figures read from a stand-in model. Caption, map, wiring view, path and score checks passed.`);
