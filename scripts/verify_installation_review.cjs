/* Read-only installation-review regression using the actual offline model.
 * In-memory storage only; no layout, schedules or equipment registers are saved.
 * Run: node scripts/verify_installation_review.cjs
 * Software/visibility checks do not release engineering or construction holds.
 */
'use strict';
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { loadStudyModel } = require('./lib/study_model.cjs');

const study = loadStudyModel();
const { SIM, CAT, model } = study, E = SIM.electrical, R = SIM.installationReview;
const plain = value => JSON.parse(JSON.stringify(value));
const sorted = values => Array.from(values).sort();
const stages = [
  ['survey', 'all', 'building'], ['distribution', 'distribution', 'systems'],
  ['containment', 'all', 'systems'], ['lighting', 'lighting', 'systems'],
  ['sound', 'sound', 'systems'], ['air', 'air', 'systems'],
  ['exit', 'exit', 'systems'], ['decoration', 'decoration', 'systems'],
  ['commission', 'all', 'building']
];
const invalidIndexes = [-1, 9, 100, 0.5, NaN, Infinity, null, undefined, '0', {}, []];
const cases = [], navigationCalls = [], forbiddenCalls = [];
let architectureRecords = [];
const originalGoTo = SIM.church.goTo;
SIM.church.goTo = (id, options) => navigationCalls.push({ id, options: plain(options) });
const mutationMethods = ['add', 'update', 'remove', 'duplicate', 'mirror', 'repeatBays', 'undo', 'redo', 'commit', 'applyScene', 'importLayout', 'resetDesign'];
const originalMethods = new Map(mutationMethods.map(key => [key, SIM[key]]));
for (const key of mutationMethods) SIM[key] = (...args) => {
  forbiddenCalls.push({ key, args: plain(args) });
  throw new Error('Read-only walkthrough called design/switch mutation: ' + key);
};

function designSnapshot() {
  const layout = plain(SIM.exportLayout());
  delete layout.savedAt; // Only the wall-clock export timestamp is excluded.
  return { layout, electrical: plain(E.exportData()), history: plain(SIM.state.history), future: plain(SIM.state.future) };
}
function architectureNodes() {
  const nodes = [];
  model.scene.traverse(node => {
    for (let parent = node; parent; parent = parent.parent) {
      if (parent === E.layer || parent.userData.simId || parent.name === 'Simulator selection') return;
    }
    nodes.push(node);
  });
  return nodes;
}
// Hash the original architectural geometry once per unique buffer, including
// coordinates, normals, indices and UVs. A replacement or in-place edit fails.
function architectureSnapshot(nodes) {
  const hash = crypto.createHash('sha256'), geometries = new Set(), materials = new Set();
  architectureRecords = [];
  const record = value => { const json = JSON.stringify(value); architectureRecords.push(json); hash.update(json); };
  const buffer = value => hash.update(Buffer.from(value.buffer, value.byteOffset, value.byteLength));
  for (const node of nodes) {
    record([node.uuid, node.parent?.uuid || null, node.name, node.position.toArray(), node.quaternion.toArray(), node.scale.toArray(), node.geometry?.uuid || null]);
    if (node.geometry && !geometries.has(node.geometry)) {
      const geometry = node.geometry; geometries.add(geometry);
      record([geometry.uuid, geometry.groups, geometry.drawRange]);
      for (const [name, attribute] of Object.entries(geometry.attributes).sort()) {
        record([name, attribute.itemSize, attribute.normalized]); buffer(attribute.array || attribute.data.array);
      }
      if (geometry.index) buffer(geometry.index.array);
    }
    for (const material of (Array.isArray(node.material) ? node.material : [node.material]).filter(Boolean)) if (!materials.has(material)) {
      materials.add(material);
      record([material.uuid, material.type, material.color?.toArray(), material.emissive?.toArray(), material.opacity, material.transparent,
        material.roughness, material.metalness, material.side, material.depthTest, material.depthWrite,
        material.map?.uuid || null, material.normalMap?.uuid || null, material.emissiveMap?.uuid || null]);
    }
  }
  return { nodes: nodes.length, geometries: geometries.size, materials: materials.size, sha256: hash.digest('hex') };
}
function visibilitySnapshot() {
  return {
    architecture: architectureNodes().map(node => [node.uuid, node.visible]),
    fixtures: [...SIM.fixtures].map(([id, fx]) => [id, fx.root.visible]),
    electrical: E.layer.children.filter(node => node.userData.electricalId).map(node => [node.userData.electricalId, node.visible]),
    layer: E.layer.visible
  };
}
function assertPreserved(before, message) {
  assert.deepEqual(designSnapshot(), before, message + ': exact items/settings/history and complete design export');
  assert.deepEqual(forbiddenCalls, [], message + ': no switch, scene or layout mutation API');
}
function expectedItems(system, full) {
  return full.components.filter(component => !component.hiddenAlternative).filter(component => {
    const item = SIM.item(component.id), type = CAT.byId[component.type];
    const category = item.circuit === 'E1' ? 'exit' : type.speaker || type.mic ? 'sound' : type.fan ? 'air' : type.outlet ? 'power' : type.cat === 'decor' ? 'decoration' : 'lighting';
    return system === 'all' || system === category;
  }).map(component => component.id);
}
// Independent route closure from the saved full export: branch/trunk members,
// sources and upstream feeders. No walkthrough or review API derives the oracle.
function expectedSelection(system, full) {
  const itemIds = system === 'distribution' ? [] : expectedItems(system, full), items = new Set(itemIds);
  const routes = full.routes.filter(route => system === 'distribution' ? route.role === 'feeder' : system === 'all' || route.itemIds.some(id => items.has(id)));
  const routeIds = new Set(routes.map(route => route.id)), sourceIds = new Set(system === 'all' ? Object.keys(full.sources) : []);
  for (let index = 0; index < routes.length; index++) {
    const route = routes[index]; sourceIds.add(route.source);
    if (route.role === 'feeder') sourceIds.add(route.id.slice('feeder:'.length));
    for (const parentId of [route.trunkId, route.source !== 'DB1' ? 'feeder:' + route.source : null]) {
      const parent = full.routes.find(candidate => candidate.id === parentId);
      if (parent && !routeIds.has(parent.id)) { routeIds.add(parent.id); routes.push(parent); }
    }
  }
  return { itemIds: sorted(itemIds), routeIds: sorted(routeIds), sourceIds: sorted(sourceIds) };
}
function assertVisibility(message) {
  const selected = E.reviewSelection(), items = new Set(selected.itemIds), routes = new Set(selected.routeIds), sources = new Set(selected.sourceIds);
  assert.equal(E.layer.visible, E.view.visible, message + ': wiring layer visibility');
  for (const [id, fx] of SIM.fixtures) assert.equal(fx.root.visible, SIM.fixtureVisible(fx.item) && (E.view.mode !== 'systems' || items.has(id)), message + ': equipment ' + id);
  for (const node of E.layer.children) {
    const id = node.userData.electricalId;
    if (id) assert.equal(node.visible, E.SOURCES[id] ? sources.has(id) : routes.has(id), message + ': source/route ' + id);
  }
  if (E.view.mode === 'systems') {
    for (const node of architectureNodes()) if (node.isMesh || node.isLine || node.isPoints || node.isSprite) assert.equal(node.visible, false, message + ': architecture isolated ' + node.name);
  }
}
function checkInvalid(before, label) {
  const index = R.index, view = plain(E.view), visibility = visibilitySnapshot(), calls = navigationCalls.length;
  for (const candidate of invalidIndexes) {
    assert.equal(R.go(candidate), false, label + ': invalid stage rejected ' + String(candidate));
    assert.equal(R.index, index, label + ': invalid stage preserves active index');
    assert.deepEqual(plain(E.view), view, label + ': invalid stage preserves complete view');
    assert.deepEqual(visibilitySnapshot(), visibility, label + ': invalid stage preserves visible model');
    assert.equal(navigationCalls.length, calls, label + ': invalid stage does not navigate');
    assertPreserved(before, label + ': invalid stage');
  }
}
function checkStage(index, before, label) {
  const [id, system, mode] = stages[index], calls = navigationCalls.length;
  assert.equal(R.go(index), true, label + ': valid stage accepted');
  assert.equal(R.index, index, label + ': active stage index');
  assert.deepEqual(plain(E.view), { visible: true, mode, board: 'all', kind: 'all', system, circuit: 'all', item: 'all', selected: null }, label + ': complete deterministic stage view');
  const selected = E.reviewSelection(), expected = expectedSelection(system, before.electrical);
  for (const key of ['itemIds', 'routeIds', 'sourceIds']) assert.deepEqual(sorted(selected[key]), expected[key], label + ': independently selected ' + key);
  assertVisibility(label);
  SIM.frame(0, 'explore', SIM.church.camera);
  assertVisibility(label + ' after viewer frame');
  const exported = plain(E.reviewExport());
  assert.deepEqual(exported.routes, before.electrical.routes.filter(route => selected.routeIds.includes(route.id)), label + ': exact route points, lengths and specifications in review');
  assert.deepEqual(exported.components, before.electrical.components.filter(component => selected.itemIds.includes(component.id)), label + ': exact equipment records in review');
  assert.deepEqual(exported.sources, Object.fromEntries(Object.entries(before.electrical.sources).filter(([source]) => selected.sourceIds.includes(source))), label + ': exact upstream enclosure records');
  assert.equal(navigationCalls.length, calls + (selected.routeIds.length ? 1 : 0), label + ': stage focus has no extra navigation');
  if (selected.routeIds.length) assert.deepEqual(navigationCalls.at(-1), { id: 'electrical-focus', options: { mode: 'explore', instant: true } }, label + ': normal review navigation');
  const html = R.render();
  assert(html.includes('Review step ' + (index + 1) + ' of 9') && html.includes(id === 'survey' ? 'Survey and coordinate' : R.steps[index].title), label + ': current stage text');
  assert(html.includes('HOLD') && html.includes('End walkthrough') && /read-only/.test(html), label + ': engineering status remains explicit');
  assertPreserved(before, label);
  cases.push({ name: label, stage: id, system, mode, items: selected.itemIds.length, routes: selected.routeIds.length, sources: selected.sourceIds.length });
}
function checkSession(label, before) {
  const priorView = plain(E.view), priorVisibility = visibilitySnapshot();
  for (let index = 0; index < stages.length; index++) checkStage(index, before, label + ' forward ' + (index + 1));
  checkInvalid(before, label + ' while active');
  assert(/data-step="9" disabled/.test(R.render()), label + ': next disabled on final stage');
  for (let index = 7; index >= 0; index--) checkStage(index, before, label + ' previous ' + (index + 1));
  assert(/data-step="-1" disabled/.test(R.render()), label + ': previous disabled on first stage');
  // Deliberately change view only, then exercise Reset stage view via the same
  // action handler the browser uses. It must not replace the saved entry state.
  E.setReviewFilter({ system: 'sound', item: 'all', circuit: 'all', board: 'DB1' });
  E.select('AV1');
  E.action({ dataset: { act: 'electrical-step', step: '0' } });
  assert.equal(R.index, 0, label + ': Reset stage keeps index');
  assert.deepEqual(plain(E.view), { visible: true, mode: 'building', board: 'all', kind: 'all', system: 'all', circuit: 'all', item: 'all', selected: null }, label + ': Reset stage clears temporary review edits');
  assertPreserved(before, label + ': reset action');
  E.action({ dataset: { act: 'electrical-step-stop' } });
  assert.equal(R.index, -1, label + ': End walkthrough clears active index');
  assert.deepEqual(plain(E.view), priorView, label + ': restores entry mode, visible, board, kind, discipline, circuit, item and selected route');
  assert.deepEqual(visibilitySnapshot(), priorVisibility, label + ': restores every entry architecture, fixture and source visibility');
  assert.equal(R.stop(), false, label + ': repeated End safely does nothing');
  assert(R.render().includes('Start 3D walkthrough') && !R.render().includes('End walkthrough'), label + ': idle start control restored');
  assertPreserved(before, label + ': restored session');
}

try {
  assert(R && typeof R.go === 'function' && typeof R.stop === 'function', 'installation-review API loaded');
  assert.equal(R.index, -1, 'initial walkthrough is inactive');
  assert.deepEqual(plain(R.steps.map(step => [step.id, step.system, step.mode])), stages, 'nine reviewed sequence stages');
  assert(Object.isFrozen(R.steps) && R.steps.every(Object.isFrozen), 'stage definitions are immutable');
  E.rebuild();
  // The study adapter has not rendered a first frame. Resolve the existing
  // preview light pool before snapshotting its displayed source transforms.
  SIM.frame(0, 'explore', SIM.church.camera);
  const before = designSnapshot(), nodes = architectureNodes(), architecture = architectureSnapshot(nodes), originalArchitectureRecords = architectureRecords;
  assert.equal(R.stop(), false, 'End before Start safely does nothing');
  checkInvalid(before, 'before start');
  checkSession('Initially building', before);

  E.setReviewFilter({ system: 'lighting', circuit: 'L1', item: 'L78', board: 'DB1' });
  E.select('feeder:LC1');
  E.setMode('systems');
  assertPreserved(before, 'test setup of already filtered systems view');
  checkSession('Initially filtered systems', before);

  E.setMode('building');
  E.setReviewFilter({ system: 'all', circuit: 'all', item: 'all', board: 'all' });
  E.action({ dataset: { act: 'electrical-kind', kind: 'audio' } });
  E.action({ dataset: { act: 'electrical-filter', board: 'DB1' } });
  E.setMode('systems');
  E.select(E.routes.find(route => route.kind === 'audio' && route.role === 'drop').id);
  assert.equal(E.view.kind, 'audio', 'non-default legacy kind case is meaningful');
  assertPreserved(before, 'test setup of already isolated audio-kind view');
  checkSession('Initially systems with audio kind', before);
  E.setMode('building');
  const finalArchitecture = architectureSnapshot(nodes);
  const architectureDifferences = architectureRecords.map((record, index) => record === originalArchitectureRecords[index] ? null : { before: originalArchitectureRecords[index], after: record }).filter(Boolean);
  assert.deepEqual(finalArchitecture, architecture, 'architectural topology, geometry buffers, transforms and physical materials unchanged; differences: ' + JSON.stringify(architectureDifferences.slice(0, 10)));
  assertPreserved(before, 'all walkthrough sessions');
  console.log(JSON.stringify({ installationReview: 'passed', stageTransitions: cases.length, sessions: 3, invalidIndexesPerState: invalidIndexes.length,
    cases, completeDesignPreservation: true, architecture, noSwitchActions: forbiddenCalls.length === 0,
    scope: 'Headless software and visibility regression; no construction approval or engineering-target validation.' }, null, 2));
} finally {
  SIM.church.goTo = originalGoTo;
  for (const [key, fn] of originalMethods) SIM[key] = fn;
  study.dispose();
}
