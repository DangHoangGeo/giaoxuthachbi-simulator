/* Desktop check for exterior daylight defaults, night levels and saved overrides. */
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

      const day = await read();
      assert.equal(day.scene, 'Daytime visit');
      assert.equal(day.circuits, circuits.length);
      assert.equal(day.count, 133);
      assert(day.sanctuary.includes('L81'));
      assert.equal(day.exits, 5);
      assert.equal(day.watts, 0);
      assert.equal(day.emitters, 0);
      assert.equal(day.emission, 0);
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
      await sky('day');
      assert.deepEqual(await read(), day);
      if (visit) {
        assert(await page.locator('#simPanel').isHidden());
        assert.equal(await page.evaluate(() => localStorage.getItem('thachbi.simulator.v1')), null);
      } else {
        await page.evaluate(() => {
          const sim = CHURCH_SIMULATOR;
          sim.update(sim.state.items.find(item => item.circuit === 'L5').id, { on: true, dim: .42 });
          sim.saveNow();
        });
        const manual = await read();
        assert.equal(manual.on.L5, 1);
        await sky('evening');
        assert.deepEqual((await read()).switches, manual.switches);
        await page.reload();
        await ready();
        assert.deepEqual((await read()).switches, manual.switches);
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
