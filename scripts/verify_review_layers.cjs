/* Headless regression for electrical review filters. Uses isolated storage and
 * the actual model; no user layout, source geometry or electrical export is saved.
 * This verifies software selection/visibility, not installation engineering.
 * Run from the repository root: node scripts/verify_review_layers.cjs
 */
'use strict';
const assert = require('node:assert/strict');
const { loadStudyModel } = require('./lib/study_model.cjs');

const study = loadStudyModel();
const { SIM, CAT } = study, E = SIM.electrical;
const plain = value => JSON.parse(JSON.stringify(value));
const sorted = values => Array.from(values).sort();
const layoutSnapshot = () => {
  const layout = plain(SIM.exportLayout());
  delete layout.savedAt; // Export timestamp is metadata, not design state.
  delete layout.selectedId;
  return layout;
};
const designSnapshot = () => ({ electrical: plain(E.exportData()), layout: layoutSnapshot() });
const assertDesign = (before, message) => assert.deepEqual(designSnapshot(), before, message);
const cases = [];
let maxLengthDelta = 0;

function selection() {
  const value = E.reviewSelection();
  assert(value && typeof value === 'object', 'review selection is available');
  const result = {};
  for (const key of ['itemIds', 'routeIds', 'sourceIds']) {
    assert(value[key] && typeof value[key][Symbol.iterator] === 'function', key + ' is iterable');
    result[key] = Array.from(value[key]);
    assert(result[key].every(id => typeof id === 'string'), key + ' contains stable string IDs');
    assert.equal(new Set(result[key]).size, result[key].length, key + ' contains no duplicate IDs');
  }
  return result;
}

function filter(patch = {}) {
  E.setReviewFilter({ system: 'all', circuit: 'all', item: 'all', board: 'all', ...patch });
  return selection();
}

function checkVisibility(selected, message) {
  const items = new Set(selected.itemIds), routes = new Set(selected.routeIds), sources = new Set(selected.sourceIds);
  assert.equal(E.view.mode, 'systems', 'visibility checks use the systems view');
  for (const fx of SIM.fixtures.values()) {
    assert.equal(fx.root.visible, SIM.fixtureVisible(fx.item) && items.has(fx.item.id), message + ': fixture ' + fx.item.id);
    if (fx.item.hidden) assert.equal(fx.root.visible, false, message + ': hidden alternative remains hidden');
  }
  for (const child of E.layer.children) {
    const id = child.userData.electricalId;
    if (!id) continue; // Shared cable covers / selection helpers have other identities.
    assert.equal(child.visible, E.SOURCES[id] ? sources.has(id) : routes.has(id), message + ': route/source ' + id);
  }
}

function checkClosure(selected, message) {
  const items = new Set(selected.itemIds), routeIds = new Set(selected.routeIds), sourceIds = new Set(selected.sourceIds);
  const runs = new Map(E.routes.map(route => [route.id, route]));
  for (const id of items) assert(SIM.item(id) && !SIM.item(id).hidden, message + ': selected equipment exists and is installed');
  for (const id of routeIds) {
    const route = runs.get(id);
    assert(route, message + ': selected route exists ' + id);
    assert(sourceIds.has(route.source), message + ': source retained for ' + id);
    if (route.trunkId) assert(routeIds.has(route.trunkId), message + ': shared trunk retained for ' + id);
    if (route.role === 'drop' || route.role === 'local') {
      assert(route.itemIds.length && route.itemIds.every(item => items.has(item)), message + ': no sibling equipment drop ' + id);
    }
  }
  for (const id of sourceIds) {
    assert(E.SOURCES[id], message + ': source identity exists ' + id);
    const feeder = runs.get('feeder:' + id);
    if (feeder) {
      assert(routeIds.has(feeder.id), message + ': upstream feeder retained for ' + id);
      assert(sourceIds.has(feeder.source), message + ': upstream source retained for ' + id);
    }
  }
}

function checkLengths() {
  for (const route of E.routes) {
    assert(route.points.length >= 2, 'route has a measurable centreline: ' + route.id);
    assert(route.points.every(point => point.length === 3 && point.every(Number.isFinite)), 'finite metre coordinates: ' + route.id);
    let measured = 0;
    for (let i = 1; i < route.points.length; i++) {
      const previous = route.points[i - 1], next = route.points[i];
      const dx = next[0] - previous[0], dy = next[1] - previous[1], dz = next[2] - previous[2];
      measured += Math.sqrt(dx * dx + dy * dy + dz * dz);
    }
    assert(Number.isFinite(route.length) && route.length > 0, 'positive route length: ' + route.id);
    const delta = Math.abs(measured - route.length);
    maxLengthDelta = Math.max(maxLengthDelta, delta);
    assert(delta <= 1e-9, 'independent Euclidean centreline length agrees: ' + route.id + ' (delta ' + delta + ' m)');
  }
}

function checkCase(name, patch, expectedItems, before) {
  const selected = filter(patch);
  assert.deepEqual(sorted(selected.itemIds), sorted(expectedItems), name + ': equipment selection');
  checkClosure(selected, name);
  checkVisibility(selected, name);
  // Frame listeners must retain the filter after normal fixture updates.
  SIM.frame(0, 'explore', SIM.church.camera);
  checkVisibility(selected, name + ' after frame');
  assertDesign(before, name + ': review changes no saved equipment, routes or loads');
  cases.push({ name, items: selected.itemIds.length, routes: selected.routeIds.length, sources: selected.sourceIds.length });
  return selected;
}

try {
  assert.equal(typeof E.setReviewFilter, 'function', 'electrical review-filter API is implemented');
  assert.equal(typeof E.reviewSelection, 'function', 'electrical review-selection API is implemented');
  E.rebuild();
  const before = designSnapshot();
  const normalVisibility = new Map([...SIM.fixtures].map(([id, fx]) => [id, fx.root.visible]));
  const checkNormalVisibility = message => {
    for (const [id, visible] of normalVisibility) assert.equal(SIM.fixtures.get(id).root.visible, visible, message + ': ' + id);
  };
  const installed = before.electrical.components.filter(component => !component.hiddenAlternative);
  const itemsMatching = predicate => installed.filter(component => predicate(SIM.item(component.id), CAT.byId[component.type])).map(component => component.id);
  checkLengths();
  E.setMode('systems');
  assertDesign(before, 'entering systems view preserves the saved design');

  const lighting = checkCase('Lighting', { system: 'lighting' }, itemsMatching((item, type) => !!type.light && type.cat !== 'decor' && item.circuit !== 'E1'), before);
  assert(lighting.sourceIds.includes('LC1') && lighting.sourceIds.includes('DB1'), 'lighting shows operator controls and upstream main board');
  assert(lighting.routeIds.includes('feeder:LC1'), 'lighting retains the LC-1 supply');

  const db2 = checkCase('DB-2 lighting', { system: 'lighting', board: 'DB2' }, itemsMatching((item, type) => !!type.light && type.cat !== 'decor' && item.circuit !== 'E1' && SIM.CIRCUITS[item.circuit]?.board === 'DB2'), before);
  assert(db2.itemIds.length > 0, 'DB-2 lighting case has equipment');
  assert(db2.routeIds.includes('feeder:DB2') && db2.sourceIds.includes('DB2') && db2.sourceIds.includes('DB1'), 'DB-2 lighting retains its feeder and both boards');

  const boardOnly = checkCase('DB-2 board only', { board: 'DB2' }, itemsMatching(item => SIM.CIRCUITS[item.circuit]?.board === 'DB2'), before);
  assert(boardOnly.sourceIds.includes('DB1') && boardOnly.sourceIds.includes('DB2'), 'board-only filter retains both feeder endpoint enclosures');

  const sound = checkCase('Sound', { system: 'sound' }, itemsMatching((_item, type) => !!(type.speaker || type.mic)), before);
  assert(sound.itemIds.some(id => CAT.byId[SIM.item(id).type].mic), 'sound includes microphones');
  assert(sound.routeIds.includes('feeder:AV1') && sound.sourceIds.includes('AV1') && sound.sourceIds.includes('DB1'), 'sound retains the mixer/rack supply');
  const air = checkCase('Air', { system: 'air' }, itemsMatching((_item, type) => !!type.fan), before);
  assert(air.routeIds.includes('feeder:FC1') && air.sourceIds.includes('FC1'), 'air retains its speed-control supply');
  checkCase('Exit signs', { system: 'exit' }, itemsMatching(item => item.circuit === 'E1'), before);
  checkCase('Powered decoration', { system: 'decoration' }, itemsMatching((_item, type) => type.cat === 'decor'), before);
  const distribution = checkCase('Distribution', { system: 'distribution' }, [], before);
  assert(distribution.routeIds.length > 0 && distribution.routeIds.every(id => E.routes.find(route => route.id === id).role === 'feeder'), 'distribution contains supply feeders');

  const chandelier = SIM.item('L78') || SIM.state.items.find(item => !item.hidden && item.type.startsWith('chandelier'));
  assert(chandelier, 'an installed chandelier is available for individual review');
  const one = checkCase('Individual chandelier', { item: chandelier.id }, [chandelier.id], before);
  assert(one.routeIds.some(id => E.routes.find(route => route.id === id).role === 'trunk'), 'individual review retains a shared circuit trunk');
  assert(one.routeIds.includes('feeder:LC1'), 'individual chandelier retains upstream lighting supply');
  checkCase('Circuit L1', { circuit: 'L1' }, itemsMatching(item => item.circuit === 'L1'), before);

  const hiddenAlternative = before.electrical.components.find(component => component.hiddenAlternative);
  assert(hiddenAlternative, 'the default design provides a hidden alternative to protect');
  for (const invalid of [{ system: 'nonexistent' }, { circuit: 'nonexistent' }, { item: 'nonexistent' }, { board: 'nonexistent' }, { system: 'air', circuit: 'nonexistent' }, { item: hiddenAlternative.id }]) {
    const previousView = plain(E.view), previousSelection = selection();
    assert.equal(E.setReviewFilter(invalid), false, 'invalid or hidden filter value is rejected safely');
    assert.deepEqual(plain(E.view), previousView, 'invalid filter leaves the current filter unchanged: ' + JSON.stringify(invalid));
    assert.deepEqual(selection(), previousSelection, 'invalid filter leaves current selection unchanged');
    checkVisibility(previousSelection, 'invalid filter');
    assertDesign(before, 'invalid filter leaves design unchanged');
  }

  // No active DSP speaker exists in the default design. This isolated test item
  // exercises its two separate connections and is removed before final checks.
  E.setMode('building');
  checkNormalVisibility('building restores normal fixture states while the circuit filter remains active');
  filter();
  const existingActive = SIM.state.items.find(item => !item.hidden && CAT.byId[item.type].speaker?.active);
  const active = existingActive || SIM.add({ type: 'steerableColumn', name: 'Review regression · active speaker', circuit: 'A1', mount: 'wall', pos: [25.725, 3.1, -7.07] }, { record: false });
  assert(active, 'an active speaker is available in the isolated test model');
  E.rebuild();
  const activeBefore = designSnapshot();
  E.setMode('systems');
  const activeSelection = checkCase('Active speaker', { system: 'sound', item: active.id }, [active.id], activeBefore);
  const activeDrops = E.routes.filter(route => activeSelection.routeIds.includes(route.id) && route.role === 'drop' && route.itemIds.includes(active.id));
  assert.equal(activeDrops.length, 2, 'active speaker keeps separate signal and local mains routes');
  assert(activeDrops.some(route => route.source === 'AV1' && route.kind === 'audio') && activeDrops.some(route => route.source === 'DB1' && route.kind === 'feeder'), 'active speaker signal and power have the correct independent origins');
  assert(activeSelection.routeIds.includes('feeder:AV1'), 'active speaker retains the rack supply');
  checkLengths();
  E.setMode('building');
  checkNormalVisibility('building restores normal fixture states while individual sound review remains active');
  filter();
  if (!existingActive) SIM.remove(active.id, { record: false });
  E.rebuild();
  assertDesign(before, 'test-only active speaker removal restores the original design');

  for (const mode of ['systems', 'building', 'systems', 'building']) {
    E.setMode(mode);
    assertDesign(before, 'repeated mode changes preserve the original design');
  }
  checkNormalVisibility('building restores normal fixture visibility');
  assert([...SIM.fixtures.values()].filter(fx => fx.item.hidden).every(fx => !fx.root.visible), 'building restoration never resurrects hidden alternatives');
  checkLengths();
  console.log(JSON.stringify({ reviewLayers: 'passed', cases, routeCount: E.routes.length, maxLengthDeltaMetres: maxLengthDelta, designAndExportPreservation: 'passed', scope: 'Headless software regression; GPU rendering and engineering performance are unverified' }, null, 2));
} finally {
  study.dispose();
}
