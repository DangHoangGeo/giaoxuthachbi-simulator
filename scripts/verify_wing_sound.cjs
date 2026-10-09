/* Held two-speaker design: stable IDs, conservative migration, real fixtures,
 * exact scoped adoption/history and numerical parity with the frozen study. */
'use strict';
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), assert = require('node:assert/strict'), crypto = require('node:crypto');
const { loadStudyModel, root, sources } = require('./lib/study_model.cjs');
const clone = x => JSON.parse(JSON.stringify(x));
const out = process.argv[2] || 'review/wing-sound-2026-10-09/headless';
fs.mkdirSync(out, { recursive: true });
const fingerprints = () => Object.fromEntries([...sources, 'scripts/verify_wing_sound.cjs'].map(p => [p, crypto.createHash('sha256').update(fs.readFileSync(path.join(root, p))).digest('hex')]));
const sourceHashes = fingerprints(), study = loadStudyModel(), { SIM } = study;
const baseline = require('../review/wing-sound-2026-10-09/sweep/baseline-layout.json');
const expected = require('../review/wing-sound-2026-10-09/current-4-block/column-y4.4-tilt-50-level-6.json');
const context = { window: {} }; vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root, 'Thach_Bi_Viewer/simulator/design.js'), 'utf8'), context);
const D = context.window.CHURCH_SIM_DESIGN, cases = [];
(async () => {
  const defaults = clone(SIM.exportLayout()), altered = new Set(['S275','S276','S277','S278']);
  const retired = new Set([...D.wingReviewRetiredIds, ...D.wingSoundRetiredIds]);
  const changedWing = new Set(['L63','L64','L65','L66','L67','L68','L69','L70','F240','F241','F242','F243',...D.wingReviewRetiredIds]);
  const art = ['D-WING-B-PETER','D-WING-B-PAUL','D-WING-H-PETER','D-WING-H-PAUL'];
  assert.equal(defaults.items.length, baseline.items.filter(i => !retired.has(i.id)).length + art.length);
  assert.deepEqual(defaults.items.map(i => i.id), [...baseline.items.filter(i => !retired.has(i.id)).map(i => i.id), ...art]);
  for (const i of baseline.items.filter(i => !altered.has(i.id) && !changedWing.has(i.id))) assert.deepEqual(defaults.items.find(j => j.id === i.id), i, 'unchanged equipment ' + i.id);
  for (const [side,id] of [['B','S276'],['H','S278']]) {
    const i = SIM.item(id); assert.equal(i.mount,'wall'); assert.equal(i.type,'slimColumn'); assert.equal(i.yaw,180);
    assert.equal(SIM.wingSoundStatus().sides.find(s => s.side === side).current,true);
    const sp = SIM.speakers().find(s => s.id === id); assert(sp.src.f[0] < 0 && Math.abs(sp.src.f[2]) < 1e-12);
  }
  const migrated = clone(D.upgradeWingSound(clone(baseline.items), defaults.items));
  const migratedExpected = baseline.items.filter(i => !D.wingSoundRetiredIds.includes(i.id)).map(i => altered.has(i.id) ? defaults.items.find(j => j.id === i.id) : i);
  assert.deepEqual(migrated, migratedExpected, 'untouched speaker pairs migrate exactly and all other equipment remains');
  assert.deepEqual(clone(D.upgradeWingSound(migrated, defaults.items)), migrated, 'idempotent migration');
  for (const id of altered) for (const change of ['delete','move','gain','delay','mute','hide','name','note','circuit']) {
    const input = clone(baseline.items), i = input.find(j => j.id === id);
    if (change === 'delete') input.splice(input.indexOf(i),1);
    else if (change === 'move') i.pos[0] += .1;
    else if (change === 'gain') i.level -= 1;
    else if (change === 'delay') i.delayMs += 1;
    else if (change === 'mute') i.on = false;
    else if (change === 'hide') i.hidden = true;
    else if (change === 'name') i.name = 'Owner speaker';
    else if (change === 'note') i.note = 'Owner note';
    else i.circuit = 'A5';
    const output = clone(D.upgradeWingSound(input, defaults.items)), sideIds = id === 'S275' || id === 'S276' ? ['S275','S276'] : ['S277','S278'];
    assert.deepEqual(output.filter(j => sideIds.includes(j.id)), input.filter(j => sideIds.includes(j.id)), 'edited pair preserved ' + id + '/' + change);
    for (const j of input.filter(j => !altered.has(j.id))) assert.deepEqual(output.find(k => k.id === j.id),j);
    cases.push({id,change,preserved:true});
  }
  SIM.importLayout(clone(baseline), {record:false});
  SIM.update('S276',{on:false,note:'Owner annotation'},{record:false});
  const before = clone(SIM.exportLayout()), result = SIM.adoptWingSound('B'), after = clone(SIM.state.items);
  assert(result.backupKey); assert.deepEqual(clone(result.changedIds),['S276']); assert.deepEqual(clone(result.retiredIds),['S275']);
  assert.equal(SIM.item('S276').on,false); assert.equal(SIM.item('S276').note,'Owner annotation');
  for (const i of before.items.filter(i => !['S275','S276'].includes(i.id))) assert.deepEqual(clone(SIM.item(i.id)),i);
  assert.equal(SIM.undo(),'Use reviewed wing B speaker'); assert.deepEqual(clone(SIM.state.items),before.items);
  assert.equal(SIM.redo(),'Use reviewed wing B speaker'); assert.deepEqual(clone(SIM.state.items),after);
  assert.deepEqual(clone(SIM.adoptWingSound('B')),{backupKey:null,changedIds:[],retiredIds:[]});
  SIM.importLayout(defaults,{record:false});
  for (const i of SIM.state.items) assert.equal(SIM.fixtures.get(i.id).type.id,i.type,'fixture matches ' + i.id);
  const electrical = clone(SIM.electrical.exportData());
  assert(!electrical.components.some(i => ['S275','S277'].includes(i.id)));
  for (const id of ['S276','S278']) {
    const routes = electrical.routes.filter(r => ['drop','local'].includes(r.role) && r.itemIds.includes(id));
    assert(routes.length); routes.forEach(r => assert.deepEqual(r.points.at(-1),clone(SIM.item(id).pos)));
  }
  // Isolate sound/calculation regression from the later coordinated geometry.
  // The historical complete four-block candidate remains an exact comparator.
  SIM.importLayout(clone(expected.layout), {record:false});
  const analysis = await study.analyse(), seats = clone(analysis.seats.seats);
  assert.equal(seats.length,368);
  for (let n=0;n<seats.length;n++) for (const field of ['x','y','z','block','pew','lux','air','noise','sti','spl','echo']) assert.deepEqual(seats[n][field],expected.seats[n][field],`historical candidate/calculation parity seat${n}/${field}`);
  assert.deepEqual(fingerprints(),sourceHashes,'sources frozen');
  const historicalStatus = clone(SIM.wingSoundStatus());
  SIM.importLayout(defaults,{record:false});
  const report = {historicalStatus,status:'PASS software preservation/parity; ENGINEERING HOLD remains',sourceHashes,cases,receiverCount:seats.length,
    wingSoundStatus:clone(SIM.wingSoundStatus()), electrical:{components:electrical.components.length,routes:electrical.routes.length},
    worstWingSti:Math.min(...seats.filter(s=>s.block==='wing').map(s=>s.sti)),
    limits:['No selected product/directivity or mounting/concealment approval','Every wing remains below STI0.60; feedback remains below3dB','Passing this audit does not accept the design']};
  fs.writeFileSync(path.join(out,'sound-results.json'),JSON.stringify(report,null,2)+'\n');
  console.log('PASS: stable IDs,36 edited-pair migrations, scoped adoption/history, fixtures/routes and all368 numerical receiver parity');
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>study.dispose());
