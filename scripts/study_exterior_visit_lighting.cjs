/* Compare the direct maintained electric light on the exterior walking planes. */
'use strict';
const { loadStudyModel } = require('./lib/study_model.cjs');
const { SIM, P, dispose } = loadStudyModel();
try {
  const axes = SIM.GEO.axes;
  const probes = { verandas: [], front: [], sides: [], rear: [] };
  const bays = [['2′', '3'], ['3', '4'], ['4', '5'], ['5', '6'], ['6', '7'],
    ['7', '8'], ['8', '9'], ['10', '11'], ['11', '12']];
  for (const [start, end] of bays) {
    for (const fraction of [.2, .5, .8]) {
      const x = axes[start] + fraction * (axes[end] - axes[start]);
      for (const sign of [-1, 1]) {
        for (const z of [8, 8.85, 9.8]) probes.verandas.push([x, -.30, sign * z]);
        probes.sides.push([x, -2.06, sign * 14.5]);
      }
    }
  }
  for (const x of [-6, -5.5, -5, -4, -3, -2]) {
    for (const z of [-4, 0, 4]) probes.front.push([x, SIM.floorY(x, z) + .02, z]);
  }
  for (const z of [-8, -4, 0, 4, 8]) probes.rear.push([57.5, -2.06, z]);

  const exterior = ['L4', 'L5', 'L6', 'L7', 'L9', 'L10', 'LW'];
  for (const scene of ['Full service · evening', 'Evening visit', 'Daytime visit']) {
    SIM.applyScene(scene, { record: false });
    const emitters = SIM.emitters();
    const outside = SIM.state.items.filter(it => exterior.includes(it.circuit) || ['L151', 'L152', 'L153', 'L154'].includes(it.id));
    const maintenance = SIM.state.settings.maintenance;
    const samples = {};
    for (const [name, points] of Object.entries(probes)) {
      const readings = points.map(point => ({
        point, lux: P.illuminance(point, [0, 1, 0], emitters, SIM.GEO.occluders) * maintenance
      }));
      const darkest = readings.reduce((a, b) => a.lux <= b.lux ? a : b);
      samples[name] = { count: points.length, darkest, meanLux: readings.reduce((sum, r) => sum + r.lux, 0) / points.length };
    }
    console.log(JSON.stringify({ scene, maintenance, exteriorW: outside.reduce((sum, it) => sum + SIM.itemWatts(it), 0), samples }));
  }
} finally {
  dispose();
}
