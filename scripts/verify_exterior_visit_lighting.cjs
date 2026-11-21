/* Desktop check for exterior visit lighting, tower ledge display and saved overrides. */
'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: process.env.HEADED !== '1' });
  const eveningLevels = { L4: 1, L5: 1, L6: .5, L7: 0, L9: .8, L10: .75, LW: .75 };
  const circuits = Object.keys(eveningLevels);
  try {
    for (const visit of [false, true]) {
      const context = await browser.newContext({ viewport: { width: 1360, height: 820 } });
      const page = await context.newPage(), errors = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
      const entry = pathToFileURL(path.join(__dirname, '../Thach_Bi_Viewer/OPEN_CHURCH.html'));
      entry.search = visit ? '?visit&lang=en' : '?lang=en';
      const ready = () => page.waitForFunction(() => window.church?.ready, null, { timeout: 180000 });
      await page.goto(entry.href);
      await ready();
      const read = () => page.evaluate(circuits => {
        const sim = CHURCH_SIMULATOR;
        const outside = item => circuits.includes(item.circuit) || ['L151', 'L152', 'L153', 'L154'].includes(item.id);
        const items = sim.state.items.filter(outside);
        const power = sim.powerSummary().byCircuit.filter(row => circuits.includes(row.circuit));
        const lamp = sim.fixtures.get(items.find(item => item.type === 'wallLantern').id);
        return {
          scene: sim.state.scene, count: items.length, circuits: power.length,
          watts: items.reduce((sum, item) => sum + sim.itemWatts(item), 0),
          sanctuary: sim.state.items.filter(item => item.circuit === 'L3' && !outside(item) && item.on).map(item => item.id),
          on: Object.fromEntries(power.map(row => [row.circuit, row.on])),
          emitters: sim.emitters().filter(e => outside(sim.item(e.id))).length,
          emission: lamp.glowMat.emissive.getHex(),
          exits: sim.state.items.filter(item => item.circuit === 'E1' && item.on).length,
          switches: items.map(({ id, circuit, on, dim }) => ({ id, circuit, on, dim }))
        };
      }, circuits);
      const sky = mode => page.evaluate(mode => { church.setLighting(mode); church.render(); }, mode);
      const ledgeModels = () => page.evaluate(() => {
        church.render();
        const fittings = [...CHURCH_SIMULATOR.fixtures.values()]
          .filter(fx => ['ledgeBar', 'ledgeFlood'].includes(fx.item.type));
        const drawn = ({ root }) => root.visible && root.children.some(part => part.visible);
        return {
          tower: fittings.filter(fx => fx.item.circuit !== 'LW').filter(drawn).length,
          wing: fittings.filter(fx => fx.item.circuit === 'LW').filter(drawn).length,
          litTowerEmitters: CHURCH_SIMULATOR.emitters().filter(e =>
            fittings.some(fx => fx.item.id === e.id && fx.item.circuit !== 'LW')).length
        };
      });

      const day = await read();
      assert.equal(day.scene, 'Daytime visit');
      assert.equal(day.circuits, circuits.length);
      assert.equal(day.count, 133);
      assert(day.sanctuary.includes('L81'));
      assert.equal(day.exits, 5);
      assert.equal(day.watts, 0);
      assert.equal(day.emitters, 0);
      assert.equal(day.emission, 0);
      assert.deepEqual(await ledgeModels(), { tower: 0, wing: 4, litTowerEmitters: 0 });
      await sky('evening');
      const night = await read();
      assert.equal(night.scene, 'Evening visit');
      assert(night.emitters > 0 && night.watts > 0 && night.emission > 0);
      for (const { circuit, on, dim } of night.switches) {
        const level = circuit === 'L3' ? 1 : eveningLevels[circuit];
        assert.equal(on, level > 0, circuit);
        if (on) assert.equal(dim, level, circuit);
      }
      assert.equal(night.on.L7, 0);
      assert(circuits.every(c => c === 'L7' || night.on[c] > 0));
      assert.equal(night.exits, day.exits);
      assert.deepEqual(night.sanctuary, day.sanctuary);
      assert.deepEqual(await ledgeModels(), { tower: 0, wing: 4, litTowerEmitters: 40 });
      if (!visit) {
        await page.evaluate(() => CHURCH_SIMULATOR.ui.setOpen(true));
        assert.deepEqual(await ledgeModels(), { tower: 28, wing: 4, litTowerEmitters: 40 });
        await page.evaluate(() => church.setPresentation(true));
        assert.deepEqual(await ledgeModels(), { tower: 0, wing: 4, litTowerEmitters: 40 });
        await page.evaluate(() => {
          church.setPresentation(false);
          CHURCH_SIMULATOR.ui.setOpen(false);
        });
      }
      await page.evaluate(() => CHURCH_SIMULATOR.electrical.setMode('systems'));
      assert.deepEqual(await ledgeModels(), { tower: 28, wing: 4, litTowerEmitters: 40 });
      await page.evaluate(() => CHURCH_SIMULATOR.electrical.setMode('building'));
      assert.deepEqual(await ledgeModels(), { tower: 0, wing: 4, litTowerEmitters: 40 });
      await sky('day');
      assert.deepEqual(await read(), day);
      if (visit) {
        assert(await page.locator('#simPanel').isHidden());
        assert.equal(await page.evaluate(() => localStorage.getItem('thachbi.simulator.v1')), null);
      } else {
        await page.evaluate(() => {
          const sim = CHURCH_SIMULATOR;
          sim.update(sim.state.items.find(item => item.circuit === 'L5').id, { on: true, dim: .42 });
          sim.update('L160', { pos: [-.34, 7, -11.453] });
          sim.saveNow();
        });
        const manual = await read();
        assert.equal(manual.on.L5, 1);
        await sky('evening');
        assert.deepEqual((await read()).switches, manual.switches);
        await page.reload();
        await ready();
        assert.deepEqual((await read()).switches, manual.switches);
        assert.deepEqual(await page.evaluate(() => CHURCH_SIMULATOR.item('L160').pos), [-.34, 7, -11.453]);
        assert.equal((await ledgeModels()).tower, 1, 'A saved fixture moved off the ledge remains visible');
        await page.evaluate(() => CHURCH_SIMULATOR.applyScene('Night security'));
        await sky('evening');
        await sky('day');
        assert.equal((await read()).scene, 'Night security');
      }
      assert.deepEqual(errors, []);
      console.log(JSON.stringify({ visitOnly: visit, fixtures: day.count, daytimeW: day.watts, eveningW: night.watts, exits: day.exits }));
      await context.close();
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
