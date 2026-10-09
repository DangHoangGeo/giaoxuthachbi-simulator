/* Model facts for the electrical safety and efficiency review: where each wired item
 * stands, what it is, and what every quick scene switches on. Read-only: it loads the
 * actual default model in the isolated study adapter and never reads or writes a saved
 * browser layout. Catalogue values are planning values, not manufacturer nameplates. */
'use strict';
const fs = require('node:fs'), cp = require('node:child_process'), assert = require('node:assert/strict');
const { loadStudyModel } = require('./lib/study_model.cjs');
const study = loadStudyModel();
(async () => {
  try {
    const { SIM, CAT } = study, startScene = SIM.state.scene, start = SIM.powerSummary().total;
    const wired = new Set(SIM.electrical.exportData().components.filter(c => !c.hiddenAlternative).map(c => c.id));
    const items = SIM.state.items.filter(it => !it.hidden).map(it => {
      const t = CAT.byId[it.type];
      return {
        id: it.id, name: it.name, type: it.type, product: t.name, circuit: it.circuit, mount: it.mount, position: it.pos, anchorY: Number.isFinite(it.anchorY) ? it.anchorY : null,
        floorY: SIM.floorY(it.pos[0], it.pos[2]), interior: SIM.isInterior(it.pos), inWing: SIM.inWing(it.pos[0], it.pos[2]), wired: wired.has(it.id),
        category: t.outlet ? 'socket' : t.mic ? 'microphone' : t.speaker ? 'loudspeaker' : t.fan ? 'fan' : it.circuit === 'E1' ? 'exit sign' : t.light ? 'light' : 'decoration',
        light: t.light ? { catalogueLumens: t.light.lumens ?? null, catalogueWatts: t.light.watts ?? null, itemLumens: Number.isFinite(it.lumens) ? it.lumens : t.light.lumens ?? null } : null,
        fan: t.fan ? { kind: t.fan.kind, exhaust: !!t.fan.exhaust, diameter: t.fan.diameter, rotorDrop: t.fan.rotorDrop ?? null, speeds: t.fan.speeds, speed: it.speed ?? null } : null,
        outlet: t.outlet || null,
        ratedW: SIM.itemWatts(it, true)
      };
    });
    // Every quick scene, applied to the same default layout.
    const scenes = {};
    for (const name of Object.keys(SIM.SCENES)) {
      SIM.applyScene(name, { record: false });
      const summary = SIM.powerSummary(), emitters = SIM.emitters();
      scenes[name] = {
        totalW: summary.total, setting: SIM.SCENES[name],
        byCircuit: Object.fromEntries(summary.byCircuit.map(c => [c.circuit, { watts: c.watts, on: c.on, count: c.count }])),
        items: Object.fromEntries(SIM.state.items.filter(it => !it.hidden).map(it => [it.id, { on: !!it.on, watts: SIM.itemWatts(it) }])),
        interiorLumens: emitters.reduce((sum, e) => sum + (e.interior ? e.lumens : 0), 0),
        exteriorLumens: emitters.reduce((sum, e) => sum + (e.interior ? 0 : e.lumens), 0)
      };
    }
    SIM.applyScene(startScene, { record: false });
    assert(Math.abs(SIM.powerSummary().total - start) < 1e-9, 'default scene restored');
    const seats = (await study.analyse()).seats.seats;
    const stat = key => { const v = seats.map(s => s[key]).filter(Number.isFinite).sort((a, b) => a - b); return { n: v.length, min: v[0], mean: v.reduce((a, b) => a + b, 0) / v.length, max: v[v.length - 1] }; };
    const circuits = Object.fromEntries(Object.entries(SIM.CIRCUITS).map(([id, c]) => [id, { label: c.label, cat: c.cat, board: c.board, area: c.area ?? null, outlet: c.outlet ?? null }]));
    const data = {
      schema: 1, status: 'DERIVED / CONCEPT / ENGINEERING HOLD', gitRevision: cp.execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
      defaultScene: startScene, settings: SIM.exportLayout().settings, circuits, boards: SIM.BOARDS, items, scenes,
      seatScene: startScene, seatLux: stat('lux'), seatAir: stat('air'), seatCount: seats.length
    };
    fs.writeFileSync(process.argv[2], JSON.stringify(data, null, 1) + '\n');
    console.log(`Safety review facts: ${items.length} shown items, ${Object.keys(scenes).length} scenes, ${seats.length} seats.`);
  } finally { study.dispose(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
