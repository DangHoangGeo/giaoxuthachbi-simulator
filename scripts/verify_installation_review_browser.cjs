/* Desktop Chrome interaction with the local offline viewer and isolated storage.
 * Run: PLAYWRIGHT_MODULE=$PWD/web/node_modules/playwright HEADED=1 \
 *      node scripts/verify_installation_review_browser.cjs
 * Screenshots/JSON are review evidence, not construction or engineering approval.
 */
'use strict';
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(__dirname, '..');
const out = process.argv[2] ? path.resolve(process.argv[2]) : path.join(root, 'review/print-sequence-2026-10-09/desktop');
fs.mkdirSync(out, { recursive: true });
const sorted = values => Array.from(values).sort();
const stages = [
  ['survey', 'all', 'building'], ['distribution', 'distribution', 'systems'],
  ['containment', 'all', 'systems'], ['lighting', 'lighting', 'systems'],
  ['sound', 'sound', 'systems'], ['air', 'air', 'systems'],
  ['exit', 'exit', 'systems'], ['decoration', 'decoration', 'systems'],
  ['commission', 'all', 'building']
];
function expectedSelection(system, full, classification) {
  const itemIds = system === 'distribution' ? [] : full.components.filter(component => !component.hiddenAlternative && (system === 'all' || classification[component.id] === system)).map(component => component.id);
  const items = new Set(itemIds), routes = full.routes.filter(route => system === 'distribution' ? route.role === 'feeder' : system === 'all' || route.itemIds.some(id => items.has(id)));
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

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: process.env.HEADED !== '1', args: ['--allow-file-access-from-files'] });
  let page;
  const errors = [], snapshots = [], panelChecks = [], screenshotFiles = [];
  try {
    page = await browser.newPage({ viewport: { width: 1600, height: 1000 }, acceptDownloads: true });
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    await page.goto('file://' + path.join(root, 'Thach_Bi_Viewer/OPEN_CHURCH.html'));
    await page.waitForFunction(() => window.church?.ready && window.CHURCH_SIMULATOR?.installationReview, null, { timeout: 180000 });
    await page.evaluate(() => { church.pause(); church.goTo('nave', { instant: true }); church.setLighting('day'); church.render(); });
    // Initial acoustic analysis writes its calculated microphone margins into
    // exported records. Compare a settled source model, not a startup transition.
    await page.waitForFunction(() => CHURCH_SIMULATOR.analysis.results.seats && !CHURCH_SIMULATOR.analysis.busy, null, { timeout: 180000 });
    async function designSnapshot() {
      return page.evaluate(() => {
        const SIM = CHURCH_SIMULATOR, layout = JSON.parse(JSON.stringify(SIM.exportLayout())); delete layout.savedAt;
        return { layout, electrical: SIM.electrical.exportData(), history: SIM.state.history, future: SIM.state.future };
      });
    }
    async function visibilitySnapshot() {
      return page.evaluate(() => {
        const SIM = CHURCH_SIMULATOR, E = SIM.electrical, architecture = [];
        church.scene.traverse(node => {
          if (!(node.isMesh || node.isLine || node.isPoints || node.isSprite)) return;
          for (let parent = node; parent; parent = parent.parent) if (parent === E.layer || parent.userData.simId || parent.name === 'Simulator selection') return;
          architecture.push([node.uuid, node.visible]);
        });
        return { architecture, fixtures: [...SIM.fixtures].map(([id, fixture]) => [id, fixture.root.visible]),
          electrical: E.layer.children.filter(node => node.userData.electricalId).map(node => [node.userData.electricalId, node.visible]), layer: E.layer.visible };
      });
    }
    const before = await designSnapshot();
    const classification = await page.evaluate(() => Object.fromEntries(CHURCH_SIMULATOR.state.items.map(item => {
      const type = CHURCH_SIM_CATALOG.byId[item.type];
      return [item.id, item.circuit === 'E1' ? 'exit' : type.speaker || type.mic ? 'sound' : type.fan ? 'air' : type.cat === 'decor' ? 'decoration' : 'lighting'];
    })));
    const priorView = await page.evaluate(() => ({ ...CHURCH_SIMULATOR.electrical.view }));
    const priorVisibility = await visibilitySnapshot();
    await page.locator('#simulatorButton').click();
    await page.locator('#simPanel [data-tab=wiring]').click();
    const card = page.locator('.installation-review');
    const start = () => card.getByRole('button', { name: 'Start 3D walkthrough', exact: true });
    const previous = () => card.getByRole('button', { name: 'Previous', exact: true });
    const next = () => card.getByRole('button', { name: 'Next review step', exact: true });
    const reset = () => card.getByRole('button', { name: 'Reset stage view', exact: true });
    const end = () => card.getByRole('button', { name: 'End walkthrough', exact: true });
    async function screenshot(name) {
      if (await reset().count()) await reset().scrollIntoViewIfNeeded();
      else await start().scrollIntoViewIfNeeded();
      const file = name + '.png'; await page.screenshot({ path: path.join(out, file) }); screenshotFiles.push(file);
    }
    async function inspectPanel(name) {
      const dimensions = await page.evaluate(() => {
        const panel = document.getElementById('simPanel'), body = document.getElementById('simBody'), p = panel.getBoundingClientRect(), b = body.getBoundingClientRect();
        return { viewport: [innerWidth, innerHeight], panel: [p.left, p.top, p.right, p.bottom], body: [b.left, b.top, b.right, b.bottom],
          clientHeight: body.clientHeight, scrollHeight: body.scrollHeight, overflow: getComputedStyle(body).overflowY };
      });
      assert(dimensions.panel[1] >= 0 && dimensions.panel[3] <= dimensions.viewport[1], name + ': panel stays within desktop height');
      assert(dimensions.clientHeight >= 180, name + ': useful body height remains available');
      assert(['auto', 'scroll'].includes(dimensions.overflow), name + ': body scroll is enabled');
      assert(dimensions.scrollHeight > dimensions.clientHeight, name + ': long Wiring panel exercises scroll');
      for (const button of [previous(), reset(), next(), end()]) {
        await button.scrollIntoViewIfNeeded();
        const bounds = await button.boundingBox(), body = await page.locator('#simBody').boundingBox();
        assert(bounds && body && bounds.y >= body.y - 1 && bounds.y + bounds.height <= body.y + body.height + 1, name + ': every walkthrough button can be reached inside the scroll body');
      }
      panelChecks.push({ name, ...dimensions });
    }
    async function inspectStage(index, name) {
      const [id, system, mode] = stages[index];
      await page.waitForFunction(i => CHURCH_SIMULATOR.installationReview.index === i && document.querySelector('.installation-review')?.textContent.includes('Review step ' + (i + 1) + ' of 9'), index);
      await page.waitForFunction(() => {
        const selected = CHURCH_SIMULATOR.electrical.reviewSelection(), plan = document.querySelector('.electrical-plan');
        return plan && JSON.stringify([...selected.itemIds].sort()) === JSON.stringify([...plan.querySelectorAll('[data-id]')].map(node => node.dataset.id).sort()) &&
          JSON.stringify([...selected.routeIds].sort()) === JSON.stringify([...plan.querySelectorAll('polyline[data-electrical-id]')].map(node => node.dataset.electricalId).sort());
      });
      const state = await page.evaluate(() => {
        const SIM = CHURCH_SIMULATOR, E = SIM.electrical, selected = E.reviewSelection(), camera = church.camera;
        church.render(); camera.updateMatrixWorld(true);
        const routes = E.routes.filter(route => selected.routeIds.includes(route.id));
        return { index: SIM.installationReview.index, view: { ...E.view }, ...selected, lighting: document.body.dataset.lighting,
          visibleItems: [...SIM.fixtures].filter(([, fixture]) => fixture.root.visible).map(([item]) => item),
          ordinaryVisibleItems: [...SIM.fixtures].filter(([, fixture]) => SIM.fixtureVisible(fixture.item)).map(([item]) => item),
          visibleSources: E.layer.children.filter(node => node.userData.electricalId && E.SOURCES[node.userData.electricalId] && node.visible).map(node => node.userData.electricalId),
          visibleRoutes: E.layer.children.filter(node => node.userData.electricalId && !E.SOURCES[node.userData.electricalId] && node.visible).map(node => node.userData.electricalId),
          planIds: [...document.querySelectorAll('.electrical-plan [data-id]')].map(node => node.dataset.id),
          planRoutes: [...document.querySelectorAll('.electrical-plan polyline[data-electrical-id]')].map(node => node.dataset.electricalId),
          planSources: [...document.querySelectorAll('.electrical-plan g[data-electrical-id]')].map(node => node.dataset.electricalId),
          circuitIds: [...new Set(selected.itemIds.map(item => SIM.item(item).circuit))].sort(),
          points: routes.flatMap(route => route.points.map(point => camera.position.clone().fromArray(point).project(camera).toArray())) };
      });
      const expected = expectedSelection(system, before.electrical, classification);
      assert.deepEqual(state.view, { visible: true, mode, board: 'all', kind: 'all', system, circuit: 'all', item: 'all', selected: null }, name + ': deterministic complete stage view');
      for (const key of ['itemIds', 'routeIds', 'sourceIds']) assert.deepEqual(sorted(state[key]), expected[key], name + ': independent ' + key);
      assert.deepEqual(sorted(state.visibleItems), mode === 'systems' ? expected.itemIds : sorted(state.ordinaryVisibleItems), name + ': visible equipment matches stage mode');
      assert.deepEqual(sorted(state.visibleSources), expected.sourceIds, name + ': physical source enclosures match');
      assert.deepEqual(sorted(state.visibleRoutes), expected.routeIds, name + ': physical route objects match');
      assert.deepEqual(sorted(state.planIds), expected.itemIds, name + ': 2D equipment IDs match');
      assert.deepEqual(sorted(state.planRoutes), expected.routeIds, name + ': 2D route IDs match');
      assert.deepEqual(sorted(state.planSources), expected.sourceIds, name + ': 2D source IDs match');
      if (expected.routeIds.length) assert(state.points.length && state.points.every(point => point.every(Number.isFinite) && Math.abs(point[0]) < 1 && Math.abs(point[1]) < 1 && point[2] > -1 && point[2] < 1), name + ': actual camera frames every selected route vertex');
      else assert.deepEqual(state.points, [], name + ': empty valid stage adds no unrelated routes');
      assert((await card.innerText()).includes('HOLD') && /read-only/i.test(await card.innerText()), name + ': holds and review status visible');
      assert.deepEqual(await designSnapshot(), before, name + ': exact layout/settings/items and full electrical export preserved');
      await inspectPanel(name);
      delete state.points; snapshots.push({ name, stage: id, ...state });
      return state;
    }

    await start().click();
    await inspectStage(0, '01-survey-day');
    assert(await previous().isDisabled(), 'Previous disabled at start');
    for (let index = 1; index < stages.length; index++) {
      await next().click();
      if (index === 5) await page.setViewportSize({ width: 1366, height: 768 });
      await inspectStage(index, String(index + 1).padStart(2, '0') + '-' + stages[index][0] + (index > 5 ? '-evening' : '-day'));
      if (index === 1 || index === 3 || index === 5) await screenshot(String(index + 1).padStart(2, '0') + '-' + stages[index][0] + '-day');
      if (index === 3) {
        await page.locator('select[data-act=electrical-review-circuit]').selectOption('L1');
        await page.waitForFunction(() => CHURCH_SIMULATOR.electrical.view.circuit === 'L1');
        await reset().click();
        await inspectStage(3, '04-lighting-reset-from-L1');
        await next().click();
        await inspectStage(4, '05-sound-next');
        await previous().click();
        await inspectStage(3, '04-lighting-previous');
      }
      if (index === 5) {
        await page.evaluate(() => { church.setLighting('evening'); church.render(); });
        await inspectStage(5, '06-air-evening-short-desktop');
        await screenshot('06-air-evening-short-desktop');
        await page.setViewportSize({ width: 1600, height: 1000 });
        await reset().click();
        await inspectStage(5, '06-air-reset-evening');
      }
    }
    assert(await next().isDisabled(), 'Next disabled on final stage');
    // Use real wheel scrolling, then the browser's normal bring-into-view and
    // Reset action. Scrolling must preserve the step and all operating data.
    await page.locator('#simBody').hover(); await page.mouse.wheel(0, 2200);
    await page.waitForFunction(() => document.getElementById('simBody').scrollTop > 0);
    assert.equal(await page.evaluate(() => CHURCH_SIMULATOR.installationReview.index), 8, 'scroll keeps final stage');
    await reset().click(); await inspectStage(8, '09-commission-reset-after-scroll');
    await end().click(); await start().waitFor();
    assert.equal(await page.evaluate(() => CHURCH_SIMULATOR.installationReview.index), -1, 'End stops walkthrough');
    assert.deepEqual(await page.evaluate(() => ({ ...CHURCH_SIMULATOR.electrical.view })), priorView, 'End restores complete original building view');
    assert.deepEqual(await visibilitySnapshot(), priorVisibility, 'End restores original architectural, fixture, source and route visibility');
    assert.deepEqual(await designSnapshot(), before, 'End preserves every design record');
    await page.evaluate(() => { church.goTo('nave', { instant: true }); church.render(); });
    await screenshot('10-restored-building-evening');

    // Enter the walkthrough while already isolated with a non-default legacy
    // cable kind, board and selected route, then stop after entering Systems.
    await page.locator('[data-act=electrical-kind][data-kind=audio]').click();
    await page.locator('[data-act=electrical-filter][data-board=DB1]').click();
    await page.locator('[data-act=electrical-mode][data-mode=systems]').click();
    const audioRoute = await page.evaluate(() => CHURCH_SIMULATOR.electrical.routes.find(route => route.kind === 'audio' && route.role === 'drop').id);
    await page.locator('button[data-act=electrical-select][data-electrical-id="' + audioRoute + '"]').last().click();
    await page.waitForFunction(id => CHURCH_SIMULATOR.electrical.view.selected === id, audioRoute);
    const isolatedView = await page.evaluate(() => ({ ...CHURCH_SIMULATOR.electrical.view })), isolatedVisibility = await visibilitySnapshot();
    assert.equal(isolatedView.kind, 'audio', 'already-isolated legacy kind case is meaningful');
    await start().click(); await inspectStage(0, '11-restart-from-isolated-audio');
    await next().click(); await inspectStage(1, '12-distribution-from-isolated-audio');
    await end().click(); await start().waitFor();
    assert.deepEqual(await page.evaluate(() => ({ ...CHURCH_SIMULATOR.electrical.view })), isolatedView, 'End restores original systems mode, kind, board and selected route');
    assert.deepEqual(await visibilitySnapshot(), isolatedVisibility, 'End restores original isolated source and fixture visibility');
    assert(await page.locator('#electricalOnlyToggle').isChecked(), 'view-settings isolation checkbox reflects restored systems view');
    assert.deepEqual(await designSnapshot(), before, 'already-isolated session actuates no switches');
    await screenshot('13-restored-isolated-audio-evening');

    await page.reload();
    await page.waitForFunction(() => window.church?.ready && window.CHURCH_SIMULATOR?.installationReview, null, { timeout: 180000 });
    await page.evaluate(() => church.pause());
    await page.waitForFunction(() => CHURCH_SIMULATOR.analysis.results.seats && !CHURCH_SIMULATOR.analysis.busy, null, { timeout: 180000 });
    assert.equal(await page.evaluate(() => CHURCH_SIMULATOR.installationReview.index), -1, 'walkthrough progress does not persist');
    assert.deepEqual(await page.evaluate(() => ({ ...CHURCH_SIMULATOR.electrical.view })), priorView, 'temporary review state does not persist');
    assert.deepEqual(await designSnapshot(), before, 'reload retains full source design and operating state');
    assert.deepEqual(errors, [], 'desktop viewer has no page or console errors');
    fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify({ status: 'passed', headed: process.env.HEADED === '1', browser: 'Chrome', url: 'Thach_Bi_Viewer/OPEN_CHURCH.html',
      snapshots, panelChecks, screenshots: screenshotFiles, unchangedFullDesign: true, buildingRestoration: true, initiallySystemsRestoration: true, reload: true, errors,
      scope: 'Actual desktop software/GPU interaction evidence; no construction approval or engineering-target validation.' }, null, 2) + '\n');
    for (const file of ['failure.json', 'failure.png']) fs.rmSync(path.join(out, file), { force: true });
    console.log('PASS: nine read-only desktop stages, next/previous/reset/end, day/evening IDs and circuits, two desktop heights, scrolling, exact design preservation and building/already-systems restoration.');
  } catch (error) {
    if (page) await page.screenshot({ path: path.join(out, 'failure.png') }).catch(() => {});
    fs.writeFileSync(path.join(out, 'failure.json'), JSON.stringify({ status: 'failed', error: error.message, errors, snapshots, panelChecks, screenshots: screenshotFiles }, null, 2) + '\n');
    throw error;
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
