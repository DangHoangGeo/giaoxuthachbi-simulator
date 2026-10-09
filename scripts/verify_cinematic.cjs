/* Cinematic tour checks without a browser: the shot list, the camera path as
 * a function of film time, the scene changes, the organ score and the hooks in
 * the viewer. Clearance from the model and its fittings needs the open viewer:
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

// ---------------------------------------------------------------- short film
// A cut for sharing: within X's 2 min 20 s, bells first, the wiring-only view
// under black, a request for engineering advice, and the design status.
const short = film.films.short, cut = short.shots, music = short.score;
assert(short.length >= 100 && short.length <= 140, `short film of ${short.length} s fits a 2 min 20 s post`);
assert.equal(cut.reduce((sum, shot) => sum + shot.bars, 0), music.bars, 'short film: shots and score cover the same bars');
assert.equal(short.length, music.bars * music.bar);
const shortPath = checkPath(short, { indoorLimit: 3.5 });
// A post shows the first frame before it plays: the lit church from outside with its title, not black.
assert(film.black(0, short) === 0 && cut[0].light === 'evening' && cut[0].roof && !cut[0].systems && cut[0].card.at === 0, 'short film opens on the lit church with its title');
assert(film.pose(0, short).eye[0] < -20 && film.pose(0, short).eye[1] > 10, 'first frame is taken from outside, above the courtyard');
assert(film.black(short.length - 0.01, short) > 0.99, 'short film closes to black');
cut.slice(1).forEach((shot, i) => {
  const before = cut[i];
  if (shot.light !== before.light || shot.roof !== before.roof || !!shot.systems !== !!before.systems) {
    assert(film.black(shot.start - 0.001, short) > 0.99 && film.black(shot.start + 0.001, short) > 0.99, `${shot.id}: scene change under black`);
  }
});
assert(cut.some(shot => shot.systems) && cut.filter(shot => shot.systems).every(shot => shot.light === 'evening'), 'wiring-only view appears, at night');
assert(!film.films.full.shots.some(shot => shot.systems), 'the long film is unchanged: no wiring-only scenes');
// Bells alone over the evening scene; they hand over to the organ as daylight comes.
const bells = music.events.filter(event => event.stops === 'bell'), pipes = music.events.filter(event => event.stops !== 'bell');
assert(bells[0].time === 0 && pipes[0].time >= 9.9, 'bells ring alone for the first ten seconds');
// The organ enters quietly beneath the bells and only reaches full strength after they stop.
const lastOpeningBell = Math.max(...bells.map(event => event.time));
assert(pipes.filter(event => event.time <= lastOpeningBell).every(event => event.level <= 0.4 && /^(celeste|voice|softPedal)$/.test(event.stops)), 'only soft strings and a flute while the last bells are struck');
// From daylight the organ grows bar by bar into the toccata, with no sudden jump.
const swell = [4, 5, 6, 7, 8].map(bar => Math.max(...pipes.filter(event => event.voice === 'melody' && event.time >= bar * music.bar && event.time < (bar + 1) * music.bar).map(event => event.level)));
assert(swell.every((level, i) => !i || (level > swell[i - 1] && level - swell[i - 1] < 0.2)), `organ grows steadily from daylight: ${swell.map(v => v.toFixed(2)).join(' ')}`);
assert(bells.every(event => event.level === 1), 'bells at full strength');
assert(bells.every(event => event.time < cut[1].start + 2.5), 'the last bell is struck within a bar of daylight');
assert(new Set(bells.map(event => event.note)).size === 2, 'two bells');
music.events.forEach((event, i) => {
  if (i) assert(event.time >= music.events[i - 1].time, 'short score in time order');
  assert(event.time >= 0 && event.time + event.length <= short.length + 0.25 && event.level > 0 && event.level <= 1 && event.note >= 36 && event.note <= 88, 'short score note in range');
});
const shortBass = music.events.filter(event => event.voice === 'bass').reduce((sum, event) => sum + event.length, 0);
assert(shortBass > (short.length - 11) * 0.97, 'pedal under the organ, from its entry to the close');
// From the door the camera makes one movement: up to the timber, along it, down to the sanctuary.
for (const [from, to] of [['enter', 'rise'], ['rise', 'timber'], ['timber', 'sanctuary']]) {
  const a = cut.find(shot => shot.id === from), b = cut.find(shot => shot.id === to);
  assert.equal(b.index, a.index + 1); assert.equal(b.cut, 'cut');
  const end = film.pose(b.start - 1e-6, short), begin = film.pose(b.start, short);
  assert(dist(end.eye, begin.eye) < 0.01 && dist(end.look, begin.look) < 0.01 && Math.abs(end.lens - begin.lens) < 0.01, `short film: ${from} → ${to} continues`);
}
assert(!/hard part/i.test(JSON.stringify(cut)), 'evening caption without "the hard part" (owner, 9 October 2026)');
// The request and the design status are on screen at the end and stay there.
const ask = cut[cut.length - 1], shortText = JSON.stringify(cut);
assert(ask.end && ask.card.hold && /advise/i.test(ask.card.title) && /not an electrical engineer/.test(ask.card.line), 'closing card asks for advice');
assert(/not approved for construction/.test(JSON.stringify(ask.card.foot)), 'closing card keeps the design status');
assert(/Model estimates, not a checked design/.test(shortText) && /Supply and earthing/.test(shortText), 'electrical captions state their status and the open questions');
// Figures in braces are filled from the open model; every such caption has a plain form.
for (const shot of cut) if (/\{\w+\}/.test(shot.note?.en || '')) assert(shot.plain && !/\{/.test(shot.plain), `${shot.id}: plain caption for use without the model`);
assert(shortText.includes('36.9 m') && bundle.includes('crossTop: 36.92') && shortText.includes('53 m') && bundle.includes('12: 53.016,'), 'short film figures follow the model data');
// Recording: the viewer reports each drawn frame, and the module can make frames one at a time.
assert(bundle.includes('J?.cinema && window.CHURCH_CINEMA.rendered?.(n.domElement)'), 'render loop reports drawn frames');
assert(typeof film.still === 'function' && typeof film.play === 'function');

// Figures quoted in the captions are the values held in the model data.
for (const [quoted, source] of [['+36.920 m', 'crossTop: 36.92'], ['+12.472 m', 'ridge: 12.472'], ['53.016 m', '12: 53.016,'], ['+0.750 m', 'altar: 0.75'],
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
assert(/<button id="shortFilmButton"[^>]*>▶ Short film · 2 min 15<\/button>/.test(html), 'short film button in the page');
assert(html.indexOf('cinematic-tour.js') > 0 && html.indexOf('cinematic-tour.js') < html.indexOf('startup.js'), 'film module loads before the model starts');
assert(html.includes('cinematic-tour.css'));
// Offline and private: the module fetches nothing and stores nothing.
assert(!/\bfetch\(|XMLHttpRequest|localStorage|sessionStorage|https?:\/\//.test(read('cinematic-tour.js')), 'no network or storage use');

console.log(`Cinematic tour: ${shots.length} scenes, ${film.length} s, ${score.bars} bars, ${score.events.length} notes. ` +
  `Fastest ${fastest.toFixed(1)} m/s, quickest turn ${quickestTurn.toFixed(1)} °/s. Path, scene and score checks passed.`);
console.log(`Short film: ${cut.length} scenes, ${short.length} s, ${music.bars} bars, ${music.events.length} notes, ${bells.length} bell strokes. ` +
  `Fastest ${shortPath.fastest.toFixed(1)} m/s, quickest turn ${shortPath.quickestTurn.toFixed(1)} °/s. Checks passed.`);
