/* Isolated headless regression for local electrical review navigation.
 * Loads the actual viewer model with in-memory storage; no user layout or
 * generated design file is read or saved. These are software checks, not
 * GPU, installation, capacity or engineering-performance verification.
 * Run from the repository root: node scripts/verify_review_navigation.cjs
 */
'use strict';
const assert = require('node:assert/strict');
const { loadStudyModel } = require('./lib/study_model.cjs');

const study = loadStudyModel();
const { SIM, CAT, model } = study, E = SIM.electrical, T = model.THREE;
const plain = value => JSON.parse(JSON.stringify(value));
const sorted = values => Array.from(values).sort();
const byBranch = values => values.slice().sort((a, b) => a.branchId.localeCompare(b.branchId));
const layoutSnapshot = () => {
  const layout = plain(SIM.exportLayout());
  delete layout.savedAt; // Wall-clock metadata does not describe the design.
  return layout;
};
const designSnapshot = () => ({ layout: layoutSnapshot(), electrical: plain(E.exportData()) });
const assertDesign = (before, message) => assert.deepEqual(designSnapshot(), before, message);
const filter = patch => {
  assert.equal(E.setReviewFilter({ system: 'all', circuit: 'all', item: 'all', board: 'all', ...patch }), true, 'valid review filter');
  return plain(E.reviewSelection());
};
const reviewCases = [], focusCases = [], navigationCalls = [];
const originalGoTo = SIM.church.goTo;
SIM.church.goTo = (id, options) => navigationCalls.push({ id, options: plain(options) });

function checkReviewExport(name, patch, before) {
  const selected = filter(patch), viewBefore = plain(E.view), full = before.electrical;
  const review = E.reviewExport();
  assert.equal(review.schema, 1, name + ': versioned review schema');
  assert.equal(review.units, full.units, name + ': original coordinate units');
  assert.equal(review.routingRevision, full.routingRevision, name + ': original routing revision');
  assert(typeof review.status === 'string' && /review/i.test(review.status) && /not installation/i.test(review.status), name + ': development status is retained');
  assert.deepEqual(plain(review.filters), Object.fromEntries(['system', 'circuit', 'item', 'board', 'kind'].map(key => [key, E.view[key]])), name + ': exported filters identify the scope');
  for (const key of ['itemIds', 'routeIds', 'sourceIds']) {
    assert.deepEqual(sorted(review[key]), sorted(selected[key]), name + ': ' + key + ' agree with review selection');
    assert.equal(new Set(review[key]).size, review[key].length, name + ': ' + key + ' remain unique');
  }
  assert.deepEqual(sorted(Object.keys(review.sources)), sorted(selected.sourceIds), name + ': only selected enclosure records');
  for (const id of selected.sourceIds) assert.deepEqual(plain(review.sources[id]), full.sources[id], name + ': original source metadata ' + id);
  assert.deepEqual(plain(review.routes), full.routes.filter(route => selected.routeIds.includes(route.id)), name + ': exact original route points, lengths and specifications');
  assert.deepEqual(plain(review.components), full.components.filter(component => selected.itemIds.includes(component.id)), name + ': exact original equipment specifications and positions');
  assert(review.components.every(component => !component.hiddenAlternative), name + ': hidden alternatives are excluded from review quantities');
  assert.deepEqual(plain(E.view), viewBefore, name + ': export does not change review state');
  assert.deepEqual(plain(E.reviewExport()), plain(review), name + ': repeated review export is stable');
  assertDesign(before, name + ': filtering/export preserves the layout and complete design export');
  reviewCases.push({ name, items: selected.itemIds.length, routes: selected.routeIds.length, sources: selected.sourceIds.length });
  return plain(review);
}

// Derive the expected supply path independently from the exported feeder graph.
// Its order runs from DB-1 toward the branch's source, separately from the trunk.
function expectedTrace(itemId, full) {
  const feeders = new Map(full.routes.filter(route => route.role === 'feeder').map(route => [route.id.slice('feeder:'.length), route]));
  return full.routes.filter(route => ['drop', 'local'].includes(route.role) && route.itemIds.includes(itemId)).map(branch => {
    const reverse = [], visited = new Set();
    let source = branch.source;
    while (source !== 'DB1') {
      assert(!visited.has(source), 'exported supply graph has no cycle for ' + itemId);
      visited.add(source);
      const feeder = feeders.get(source);
      assert(feeder, 'exported branch source has an upstream supply: ' + source);
      reverse.push(feeder.id);
      source = feeder.source;
    }
    return { branchId: branch.id, source: branch.source, circuit: branch.circuit, kind: branch.kind, upstreamIds: reverse.reverse(), trunkId: branch.trunkId || null };
  });
}

function checkTrace(itemId, full) {
  const actual = plain(E.connectionTrace(itemId)), expected = expectedTrace(itemId, full);
  assert.deepEqual(byBranch(actual), byBranch(expected), itemId + ': one independent trace per original drop/local branch');
  assert.equal(new Set(actual.map(connection => connection.branchId)).size, actual.length, itemId + ': no duplicate connection entries');
  for (const connection of actual) {
    assert(full.sources[connection.source], itemId + ': branch source exists');
    if (connection.trunkId) {
      const trunk = full.routes.find(route => route.id === connection.trunkId);
      assert(trunk && trunk.role === 'trunk' && trunk.source === connection.source && trunk.itemIds.includes(itemId), itemId + ': correct shared trunk context');
    }
  }
  return actual;
}

function checkFocus(name, routeId, before) {
  const selected = plain(E.reviewSelection());
  const routes = before.electrical.routes.filter(route => routeId === null ? selected.routeIds.includes(route.id) : route.id === routeId);
  assert(routes.length, name + ': test scope contains routes');
  const viewBefore = plain(E.view), callCount = navigationCalls.length;
  assert.equal(E.focusReview(routeId), true, name + ': valid route geometry can be focused');
  assert.equal(navigationCalls.length, callCount + 1, name + ': one navigation operation');
  assert.deepEqual(navigationCalls.at(-1), { id: 'electrical-focus', options: { mode: 'explore', instant: true } }, name + ': existing exploration navigation API');
  const place = plain(SIM.church.places['electrical-focus']);
  for (const key of ['pos', 'target']) assert(Array.isArray(place[key]) && place[key].length === 3 && place[key].every(Number.isFinite), name + ': finite ' + key);
  assert(Math.hypot(...place.pos.map((coordinate, index) => coordinate - place.target[index])) > 0, name + ': nondegenerate camera direction');

  // Independently project every route vertex through the real THREE camera.
  // This catches clipped ends, vertical paths and point-count midpoint framing.
  const sourceCamera = SIM.church.camera;
  const camera = new T.PerspectiveCamera(sourceCamera.fov, sourceCamera.aspect, sourceCamera.near, sourceCamera.far);
  camera.position.fromArray(place.pos);
  camera.up.copy(sourceCamera.up);
  camera.lookAt(new T.Vector3(...place.target));
  camera.updateMatrixWorld(true);
  let maxProjectedCoordinate = 0, vertices = 0;
  for (const route of routes) for (const point of route.points) {
    const world = new T.Vector3(...point), local = world.clone().applyMatrix4(camera.matrixWorldInverse), projected = world.project(camera);
    assert(-local.z > camera.near && -local.z < camera.far, name + ': vertex lies between camera clipping planes ' + route.id);
    assert([projected.x, projected.y, projected.z].every(Number.isFinite), name + ': finite vertex projection ' + route.id);
    assert(Math.abs(projected.x) <= 1 + 1e-8 && Math.abs(projected.y) <= 1 + 1e-8, name + ': full route fits the perspective frustum ' + route.id);
    maxProjectedCoordinate = Math.max(maxProjectedCoordinate, Math.abs(projected.x), Math.abs(projected.y));
    vertices++;
  }
  let enclosureCorners = 0;
  const sourceIds = new Set(routes.flatMap(route => [route.source, route.role === 'feeder' ? route.id.slice(7) : null]).filter(id => fullSource(id)));
  function fullSource(id) { return before.electrical.sources[id]; }
  for (const id of sourceIds) {
    const source = fullSource(id);
    for (const x of [-1,1]) for (const y of [-1,1]) for (const z of [-1,1]) {
      const point = new T.Vector3(...source.pos.map((value,axis)=>value+[x,y,z][axis]*source.size[axis]/2)).project(camera);
      assert(Math.abs(point.x)<=1+1e-8 && Math.abs(point.y)<=1+1e-8 && point.z>-1 && point.z<1, name + ': complete source enclosure fits ' + id);
      enclosureCorners++;
    }
  }
  assert.deepEqual(plain(E.view), viewBefore, name + ': framing preserves review filters and selection');
  assertDesign(before, name + ': framing preserves equipment, route coordinates and complete export');
  focusCases.push({ name, routes: routes.length, vertices, enclosureCorners, maxProjectedCoordinate });
}

try {
  for (const method of ['reviewExport', 'focusReview', 'connectionTrace']) assert.equal(typeof E[method], 'function', method + ' API is implemented');
  E.rebuild();
  filter({});
  const before = designSnapshot(), full = before.electrical;
  const installed = full.components.filter(component => !component.hiddenAlternative);
  E.setMode('systems');
  assertDesign(before, 'systems view preserves source design');

  checkReviewExport('All systems', {}, before);
  checkReviewExport('Lighting', { system: 'lighting' }, before);
  const db2Review = checkReviewExport('DB-2 lighting', { system: 'lighting', board: 'DB2' }, before);
  assert(db2Review.itemIds.length && db2Review.routeIds.includes('feeder:DB2') && db2Review.sourceIds.includes('DB1') && db2Review.sourceIds.includes('DB2'), 'DB-2 review retains its main-board supply and both enclosure endpoints');
  checkFocus('DB-2 complete review', null, before);
  checkReviewExport('Circuit L1', { circuit: 'L1' }, before);
  checkReviewExport('Distribution', { system: 'distribution' }, before);

  assert(SIM.item('L78') && !SIM.item('L78').hidden, 'L78 remains available as the chandelier trace case');
  const l78Review = checkReviewExport('Chandelier L78', { item: 'L78' }, before);
  assert.deepEqual(l78Review.itemIds, ['L78'], 'individual review excludes sibling equipment');
  const l78 = checkTrace('L78', full);
  assert.equal(l78.length, 1, 'L78 has one lighting connection');
  assert.equal(l78[0].source, 'LC1', 'L78 originates at lighting controls');
  assert.deepEqual(l78[0].upstreamIds, ['feeder:LC1'], 'L78 trace includes the main-board lighting supply');
  assert(l78[0].trunkId && l78Review.routeIds.includes(l78[0].trunkId), 'L78 review retains the exact shared circuit trunk');
  checkFocus('L78 complete connection', null, before);

  const db2Item = installed.find(component => component.board === 'DB2');
  assert(db2Item, 'installed DB-2 equipment is available');
  const db2Trace = checkTrace(db2Item.id, full);
  assert(db2Trace.length && db2Trace.every(connection => connection.source === 'DB2' && connection.upstreamIds.length === 1 && connection.upstreamIds[0] === 'feeder:DB2'), 'DB-2 equipment traces through the DB-1 → DB-2 feeder');

  const microphones = installed.filter(component => CAT.byId[component.type].mic);
  assert(microphones.length, 'microphone trace cases are available');
  for (const microphone of microphones) {
    checkReviewExport('Microphone ' + microphone.id, { system: 'sound', item: microphone.id }, before);
    const trace = checkTrace(microphone.id, full);
    assert.equal(trace.length, 1, microphone.id + ': one microphone signal connection');
    assert.equal(trace[0].source, 'AV1', microphone.id + ': signal originates at the mixer/rack');
    assert.equal(trace[0].kind, 'mic', microphone.id + ': signal remains distinct from mains');
    assert.deepEqual(trace[0].upstreamIds, ['feeder:AV1'], microphone.id + ': upstream rack power is supply context');
    checkFocus('Microphone connection ' + microphone.id, null, before);
  }
  const passive = installed.find(component => CAT.byId[component.type].speaker && !CAT.byId[component.type].speaker.active);
  assert(passive, 'passive speaker trace case is available');
  const passiveTrace = checkTrace(passive.id, full);
  assert.equal(passiveTrace.length, 1, 'passive loudspeaker has a single audio branch, not a mains branch');
  assert.equal(passiveTrace[0].kind, 'audio', 'passive loudspeaker remains audio');
  assert.equal(passiveTrace[0].source, 'AV1', 'passive loudspeaker audio originates at the rack');
  assert.deepEqual(passiveTrace[0].upstreamIds, ['feeder:AV1'], 'rack mains remains upstream context for the passive signal branch');
  for (const component of installed) checkTrace(component.id, full);
  assertDesign(before, 'connection inspection preserves the full design');

  filter({});
  checkFocus('All routes', null, before);
  const feeder = full.routes.find(route => route.id === 'feeder:DB2');
  assert(feeder && feeder.length > 40, 'long DB-2 feeder framing is a meaningful test');
  checkFocus('Long DB-2 feeder', feeder.id, before);
  const vertical = full.routes.find(route => {
    const spans = [0, 1, 2].map(axis => Math.max(...route.points.map(point => point[axis])) - Math.min(...route.points.map(point => point[axis])));
    return ['drop', 'local'].includes(route.role) && route.length < 2 && spans[1] > 0.5 && Math.hypot(spans[0], spans[2]) < 0.2;
  });
  assert(vertical, 'short nearly vertical branch framing is a meaningful test');
  checkFocus('Short vertical branch', vertical.id, before);
  const local = full.routes.find(route => route.role === 'local');
  assert(local, 'service-room local branch is available');
  const localTrace = checkTrace(local.itemIds[0], full);
  assert(localTrace.some(connection => connection.branchId === local.id && connection.trunkId === null), 'local service-panel branch has no fabricated shared trunk');
  checkFocus('Local service-panel branch', local.id, before);

  // The legacy board buttons bypass setReviewFilter. They must clear a stale
  // route/enclosure inspector while preserving a valid upstream main board.
  E.select(l78[0].branchId);
  assert.equal(E.view.selected, l78[0].branchId, 'L78 branch can be selected before changing boards');
  E.action({ dataset: { act: 'electrical-filter', board: 'DB2' } });
  assert.equal(E.view.selected, null, 'board change clears an excluded selected route');
  assert(!E.reviewSelection().routeIds.includes(l78[0].branchId), 'DB-2 board view excludes the previous L78 route');
  filter({});
  E.select('LC1');
  assert.equal(E.view.selected, 'LC1', 'lighting enclosure can be selected before changing boards');
  E.action({ dataset: { act: 'electrical-filter', board: 'DB2' } });
  assert.equal(E.view.selected, null, 'board change clears an excluded selected enclosure');
  filter({});
  E.select('DB1');
  E.action({ dataset: { act: 'electrical-filter', board: 'DB2' } });
  assert.equal(E.view.selected, 'DB1', 'board change preserves the selected main board when it remains upstream context');
  assert(E.reviewSelection().sourceIds.includes('DB1'), 'selected upstream main board remains in the DB-2 review');
  assertDesign(before, 'board buttons and route/enclosure selection preserve the layout/full export');
  filter({});

  // Editing a detached review snapshot must not alter the live design or scope.
  const detachedBefore = plain(E.reviewExport()), detached = E.reviewExport();
  detached.routes[0].points[0][0] += 1000;
  detached.routes[0].length = -1;
  detached.components[0].position[0] += 1000;
  detached.sources[Object.keys(detached.sources)[0]].pos[0] += 1000;
  detached.itemIds.push('test-only-export-id');
  detached.filters.system = 'test-only-export-filter';
  assert.deepEqual(plain(E.reviewExport()), detachedBefore, 'exported review records are detached from the live model and scope');
  assertDesign(before, 'editing a review snapshot cannot mutate the full layout/export');

  const callsBeforeBadId = navigationCalls.length, placeBeforeBadId = plain(SIM.church.places['electrical-focus']);
  assert.equal(E.focusReview('route-does-not-exist'), false, 'bad route ID cannot fall back to a populated review scope');
  assert.equal(navigationCalls.length, callsBeforeBadId, 'bad route ID does not navigate from a populated scope');
  assert.deepEqual(plain(SIM.church.places['electrical-focus']), placeBeforeBadId, 'bad route ID preserves the current navigation place');
  assertDesign(before, 'bad route ID in a populated scope preserves the layout/full export');

  const empty = checkReviewExport('Empty valid intersection', { system: 'sound', circuit: 'L1' }, before);
  assert.deepEqual(empty.itemIds, [], 'valid unmatched filter contains no equipment');
  assert.deepEqual(empty.routeIds, [], 'valid unmatched filter contains no routes');
  assert.deepEqual(empty.sources, {}, 'empty review adds no unrelated enclosures');
  for (const id of [null, 'route-does-not-exist']) {
    const callsBefore = navigationCalls.length, placeBefore = plain(SIM.church.places['electrical-focus']), viewBefore = plain(E.view);
    assert.equal(E.focusReview(id), false, 'empty scope / bad route ID returns false safely');
    assert.equal(navigationCalls.length, callsBefore, 'empty scope / bad route ID does not navigate');
    assert.deepEqual(plain(SIM.church.places['electrical-focus']), placeBefore, 'failed focus preserves the current navigation place');
    assert.deepEqual(plain(E.view), viewBefore, 'failed focus preserves review state');
    assertDesign(before, 'failed focus preserves the layout/full export');
  }
  const hidden = full.components.find(component => component.hiddenAlternative);
  assert(hidden, 'hidden alternative provides a safe trace case');
  for (const id of ['equipment-does-not-exist', hidden.id, null]) assert.deepEqual(plain(E.connectionTrace(id)), [], 'unknown/hidden item has no installed connection trace');
  const currentView = plain(E.view);
  assert.equal(E.setReviewFilter({ item: 'equipment-does-not-exist' }), false, 'invalid item filter is rejected safely');
  assert.deepEqual(plain(E.view), currentView, 'invalid item filter preserves the existing review scope');
  assertDesign(before, 'safe invalid and empty paths preserve all design data');

  // Exercise separate active audio and mains branches only in this isolated model.
  E.setMode('building');
  filter({});
  const existingActive = SIM.state.items.find(item => !item.hidden && CAT.byId[item.type].speaker?.active);
  const active = existingActive || SIM.add({ type: 'steerableColumn', name: 'Review navigation regression · active speaker', circuit: 'A1', mount: 'wall', pos: [25.725, 3.1, -7.07] }, { record: false });
  assert(active, 'active speaker can be created in the isolated model');
  E.rebuild();
  const activeBefore = designSnapshot();
  E.setMode('systems');
  const activeReview = checkReviewExport('Active speaker', { system: 'sound', item: active.id }, activeBefore);
  assert.deepEqual(activeReview.itemIds, [active.id], 'active audio and power routes refer to one equipment quantity');
  const activeTrace = checkTrace(active.id, activeBefore.electrical);
  assert.equal(activeTrace.length, 2, 'active speaker retains separate audio and mains connection entries');
  const signal = activeTrace.find(connection => connection.kind === 'audio'), power = activeTrace.find(connection => connection.kind === 'feeder');
  assert(signal && power, 'active signal and power have distinct kinds');
  assert.equal(signal.source, 'AV1', 'active signal originates at the rack');
  assert.deepEqual(signal.upstreamIds, ['feeder:AV1'], 'active signal includes rack supply context');
  assert.equal(power.source, 'DB1', 'active mains originates at DB-1');
  assert.deepEqual(power.upstreamIds, [], 'active local mains does not acquire the rack feeder');
  assert.notEqual(signal.branchId, power.branchId, 'active connection identities are distinct');
  assert.notEqual(signal.trunkId, power.trunkId, 'active audio and mains do not share a trunk');
  checkFocus('Active speaker complete connection', null, activeBefore);
  E.setMode('building');
  filter({});
  if (!existingActive) SIM.remove(active.id, { record: false });
  E.rebuild();
  assertDesign(before, 'test-only active speaker removal restores the original layout/full export');

  console.log(JSON.stringify({ reviewNavigation: 'passed', reviewCases, focusCases, installedConnectionsChecked: installed.length, completeDesignPreservation: 'passed', scope: 'Headless software regression; GPU rendering and engineering performance remain unverified' }, null, 2));
} finally {
  SIM.church.goTo = originalGoTo;
  study.dispose();
}
