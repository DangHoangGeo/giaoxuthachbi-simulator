/* Thạch Bi simulator · recommended starting design.
 *
 * Built on the as-drawn timber frame (section sheet 4): every fixture has a
 * structural anchor, and lights never sit above spinning fan blades.
 *  - Reading light: twin-head projectors (28° centre, 36° outer) tilted ±8°
 *    along the nave under the main tie beams and side beams; twin-head
 *    projectors on the entrance wall for the rear rows and the entrance aisle.
 *  - Air: 1.42 m ceiling fans mid-bay over the two side aisles; the reading
 *    beams are narrow enough to miss their blades.
 *  - Festival exterior (L7, off by default): bulb strings on the ridge, eaves,
 *    rear gable, front terrace and tower corners, plus tower-top floods.
 *  - Atmosphere: hidden uplights on top of the tie beams wash the timber roof;
 *    brass chandeliers and pier sconces give the evening character.
 *  - Sanctuary: key lights at ~45° for faces, accents for crucifix,
 *    tabernacle and statues.
 *  - Speech: slim wall-coloured columns on the side-wall pilasters (axes 4–9),
 *    time-aligned; veranda pendants for overflow; courtyard horns off.
 * Values are a planning starting point to test, not an engineered design.
 */
(() => {
  'use strict';
  const aim = (from, to) => {
    const dx = to[0] - from[0], dy = to[1] - from[1], dz = to[2] - from[2];
    return { yaw: Math.atan2(dz, dx) * 180 / Math.PI, tilt: Math.atan2(dy, Math.hypot(dx, dz)) * 180 / Math.PI };
  };
  const side = z => z < 0 ? 'B' : 'H';

  function recommended(GEO, SIM) {
    const A = GEO.axes, items = [];
    const add = o => items.push(o);
    const lining = z => SIM.liningY(z);
    const beamY = 8.59, sideBeamY = 6.66;
    const facadeX = 2.65; // inner face of the entrance façade; the nave is open to it
    const above = (x, z, y) => SIM.structureAbove(x, z, y)?.y ?? y;
    for (const x of [50.0, 51.9]) add({ type: 'servicePanel', name: `Service-room ceiling panel · ${x.toFixed(1)} m`, circuit: 'L3', mount: 'pendant', pos: [x, 4.14, 0], anchorY: 4.15, note: 'Retains the existing ceiling-panel geometry; product light/output values are provisional.' });
    const nave = ['3', '4', '5', '6', '7', '8', '9'];

    // L1/L2 · reading light: twin-head projectors under the main tie beams
    // (central blocks, 28°) and the side beams (outer blocks, 36°), the heads
    // tilted ±8° along the nave so the mid-bay rows are lit as well as the rows
    // under the beams. Narrow optics keep the beams off the side-aisle fan blades.
    const reading = (k, z, y, circuit, block, beam) => {
      for (const [dir, tag] of [[1, ''], [-1, ' · twin']]) {
        const p = [A[k], y - 0.005, z], a = aim(p, [A[k] + dir * Math.tan(8 * Math.PI / 180) * (y - 0.8), 0.8, z]);
        add({ type: 'projector36', name: `Reading light · axis ${k} · ${side(z)} ${block}${tag}`, circuit, mount: 'pendant', pos: p, anchorY: y, ...a, mountYaw: a.yaw, lumens: 2300, beam });
      }
    };
    for (const k of nave) for (const z of [-2.6, 2.6]) reading(k, z, beamY, 'L1', 'central', 28);
    for (const k of nave) for (const z of [-5.6, 5.6]) reading(k, z, sideBeamY, 'L2', 'outer', 36);
    // Rear rows · bay 2′–3 has no tie beam, so twin-head brackets on the inner
    // face of the entrance façade light the last rows, the centre seats and the
    // entrance aisle (solid wall between the main door and the side doors).
    for (const z of [-4.2, 4.2]) {
      const s = Math.sign(z);
      const p = [facadeX, 3.45, z], a = aim(p, [8.2, 0.8, s * 5.0]);
      add({ type: 'projector36', name: `Rear rows light · entrance façade · ${side(z)}`, circuit: 'L1', mount: 'wall', pos: p, mountYaw: 0, yaw: a.yaw, tilt: a.tilt, lumens: 6000, beam: 44 });
      const q = [facadeX, 5.95, z], b = aim(q, [6.2, 0.8, s * 1.2]);
      add({ type: 'projector36', name: `Rear centre light · entrance façade · ${side(z)}`, circuit: 'L1', mount: 'wall', pos: q, mountYaw: 0, yaw: b.yaw, tilt: b.tilt, lumens: 3300, beam: 50 });
    }
    // L8 · the two 9–10 wings (choir H, ministers B). The benches face the nave,
    // so the light comes over the shoulder from the solid centre of each end
    // gable, between its windows. Per block: a high head for the three back
    // rows, whose beam crosses the fan plane only beside the gable, clear of
    // the wing fans; and a head just below the fan blades for the two front
    // rows, so no light passes through the blades (no flicker).
    for (const s of [-1, 1]) for (const [mx, bx] of [[40.26, 38.94], [40.86, 42.22]]) {
      const block = bx < 40.5 ? 'front' : 'rear';
      const hi = [mx, 4.15, s * 13.06], a = aim(hi, [bx, 0.48, s * 11.1]);
      add({ type: 'projector36', name: `Wing light · ${side(s)} · ${block} block · back rows`, circuit: 'L8', mount: 'wall', pos: hi, mountYaw: -s * 90, yaw: a.yaw, tilt: a.tilt, lumens: 3800, beam: 50 });
      const lo = [mx, 2.92, s * 13.06], b = aim(lo, [bx, 0.48, s * 8.7]);
      add({ type: 'projector36', name: `Wing light · ${side(s)} · ${block} block · front rows`, circuit: 'L8', mount: 'wall', pos: lo, mountYaw: -s * 90, yaw: b.yaw, tilt: b.tilt, lumens: 4000, beam: 36 });
    }
    // LA · hidden roof uplights on top of every tie beam.
    for (const k of [...nave, '10']) add({ type: 'uplight', name: `Roof uplight · axis ${k}`, circuit: 'LA', mount: 'floor', pos: [A[k], 9.18, 0], yaw: 90, mountYaw: 90, tilt: 90 });

    // LD · chandeliers on chains from the ridge over the side-door crossings
    // and bay 6–7, plus a grand chandelier at the crossing.
    for (const k of ['4', '6', '8']) add({ type: 'chandelier8', name: `Chandelier · bay ${k}–${Number(k) + 1}`, circuit: 'LD', mount: 'pendant', pos: [A[k] + 2.25, 6.3, 0], anchorY: lining(0) - 0.13, yaw: 0, mountYaw: 0 });
    add({ type: 'chandelier12', name: 'Grand chandelier · crossing 9–10', circuit: 'LD', mount: 'pendant', pos: [(A['9'] + A['10']) / 2, 7.2, 0], anchorY: lining(0) - 0.13, yaw: 0, mountYaw: 0 });
    // Sconces on the C/G piers, facing the nave, and on the sanctuary piers.
    for (const k of ['3', '4', '5', '6', '7', '8', '9']) for (const s of [-1, 1]) {
      add({ type: 'sconce2', name: `Sconce · axis ${k} · ${side(s)}`, circuit: 'LD', mount: 'wall', pos: [A[k], 4.6, s * 7.07], yaw: -s * 90, mountYaw: -s * 90 });
    }
    for (const s of [-1, 1]) add({ type: 'sconce2', name: `Sconce · sanctuary pier · ${side(s)}`, circuit: 'LD', mount: 'wall', pos: [A['11'] - 0.37, 4.3, s * 3.6], yaw: 180, mountYaw: 180 });

    // L3 · sanctuary.
    const altar = [43.95, 1.95, 0], ambo = [42.9, 2.25, -2.62], crucifix = [48.0, 5.0, 0];
    for (const z of [-1.4, 1.4]) {
      const p = [A['9'], beamY - 0.005, z], a = aim(p, [altar[0], altar[1], z * 0.3]);
      add({ type: 'spot15', name: `Altar key light · ${side(z)}`, circuit: 'L3', mount: 'pendant', pos: p, anchorY: beamY, ...a, mountYaw: a.yaw, beam: 24, lumens: 3500, shadow: true });
    }
    { const p = [A['9'], beamY - 0.005, -3.15], a = aim(p, ambo);
      add({ type: 'spot15', name: 'Ambo key light', circuit: 'L3', mount: 'pendant', pos: p, anchorY: beamY, ...a, mountYaw: a.yaw, beam: 15, lumens: 2500, shadow: true }); }
    for (const z of [-1.9, 1.9]) {
      const p = [A['9'], beamY - 0.005, z], a = aim(p, [41.6, 0.75, z * 1.2]);
      add({ type: 'projector36', name: `Sanctuary step fill · ${side(z)}`, circuit: 'L3', mount: 'pendant', pos: p, anchorY: beamY, ...a, mountYaw: a.yaw, lumens: 4000 });
    }
    for (const s of [-1, 1]) {
      const p = [A['10'] + 0.33, 6.6, s * 3.6], a = aim(p, crucifix);
      add({ type: 'spot15', name: `Crucifix accent · ${side(s)}`, circuit: 'L3', mount: 'wall', pos: p, yaw: a.yaw, tilt: a.tilt, mountYaw: 0, beam: 15, lumens: 1200, shadow: false });
    }
    { const p = [A['10'] + 0.33, 4.6, -3.6], a = aim(p, [47.55, 2.5, 0]);
      add({ type: 'spot15', name: 'Tabernacle accent', circuit: 'L3', mount: 'wall', pos: p, yaw: a.yaw, tilt: a.tilt, mountYaw: 0, beam: 10, lumens: 900, shadow: false }); }
    // Our Lady (left) and Saint Joseph (right) in the side alcoves at axis 11.
    const statues = { B: [49.7, 0.83, -5.55], H: [49.7, 0.83, 5.55] };
    for (const [k, base] of Object.entries(statues)) {
      const p = [A['9'], sideBeamY - 0.005, base[2]], a = aim(p, [base[0], 2.7, base[2]]);
      add({ type: 'spot15', name: `Statue accent · ${k}`, circuit: 'L3', mount: 'pendant', pos: p, anchorY: sideBeamY, ...a, mountYaw: a.yaw, beam: 12, lumens: 1800, shadow: false });
    }

    // L4 · a veranda lantern at every pier (axes 3–11), the rhythm of the
    // reference night view; the veranda loudspeakers hang mid-bay between them.
    for (const s of [-1, 1]) for (const k of ['3', '4', '5', '6', '7', '8', '9', '10', '11']) {
      const x = A[k];
      add({ type: 'lantern', name: `Veranda lantern · ${side(s)} · axis ${k}`, circuit: 'L4', mount: 'pendant', pos: [x, 4.55, s * 8.85], anchorY: above(x, s * 8.85, 4.55), yaw: 0, mountYaw: 0, lumens: 2000 });
    }
    // Only the middle of the three front doors receives decorative lanterns.
    for (const s of [-1, 1]) add({ type: 'wallLantern', name: `Central front door lantern · ${side(s)}`, circuit: 'L9', mount: 'wall', pos: [2.2, 3.0, s * 2.4], yaw: 180, mountYaw: 180 });
    // Matching pairs on all six exterior side doors, on solid wall beside the
    // arch, outside the leaf swing and stair landing. B/H share exact offsets.
    for (const s of [-1, 1]) for (const x of [16.725, 34.725, 46.425]) for (const e of [-1, 1]) {
      add({ type: 'wallLantern', name: `Side door lantern · ${side(s)} · ${x.toFixed(3)} · ${e < 0 ? 'front' : 'rear'}`, circuit: 'L5', mount: 'wall', pos: [x + e * 1.425, 2.6, s * 10.55], yaw: s * 90, mountYaw: s * 90 });
    }
    // The two service-room doors receive lower-output pairs in the alcoves.
    for (const s of [-1, 1]) for (const e of [-1, 1]) add({ type: 'wallLantern', name: `Service door lantern · ${side(s)} · ${e < 0 ? 'front' : 'rear'}`, circuit: 'L3', mount: 'wall', pos: [49.6 + e * 0.65, 2.05, s * 3.7], yaw: s * 90, mountYaw: s * 90, lumens: 400 });
    // E1 · exit signs.
    // Main doors: on the façade directly above the arched opening (6.67 m), visible down the nave.
    add({ type: 'exitSign', name: 'Exit sign · main doors', circuit: 'E1', mount: 'wall', pos: [facadeX, 6.95, 0], yaw: 0, mountYaw: 0 });
    for (const x of [16.725, 34.725]) for (const s of [-1, 1]) {
      add({ type: 'exitSign', name: `Exit sign · side door ${x.toFixed(1)} · ${side(s)}`, circuit: 'E1', mount: 'wall', pos: [x, 4.6, s * 7.245], yaw: -s * 90, mountYaw: -s * 90 });
    }

    // L5 · steps & paths; L6 · façade. Nothing stands on the courtyard, the
    // platform or the steps where people walk: every exterior light is fixed
    // to the building, on the tower faces and ledges or the terrace.
    const TX = 2.45, TZ = 10.153, ledge = TX - (4.9 + 0.45) / 2 + 0.15; // front edge of the stage-1 cornice
    const ledgeFlood = (name, circuit, p, target, beam, lumens, on = true) => {
      const a = aim([p[0], p[1] + 0.32, p[2]], target);
      add({ type: 'flood', name, circuit, mount: 'floor', pos: p, yaw: a.yaw, mountYaw: a.yaw, tilt: a.tilt, beam, lumens, on });
    };
    const towerWash = (name, p, target, mountYaw, beam, lumens) => {
      const reach = 0.5, r = mountYaw * Math.PI / 180;
      const a = aim([p[0] + reach * Math.cos(r), p[1] + 0.32, p[2] + reach * Math.sin(r)], target);
      add({ type: 'corniceFlood', name, circuit: 'L6', mount: 'floor', pos: p, yaw: a.yaw, tilt: a.tilt, mountYaw, beam, lumens, cct: 3000, params: { outreach: reach } });
    };
    for (const s of [-1, 1]) {
      // Base plates sit on the actual cornices; projecting arms keep the
      // emitting heads outside the wall thickness, mouldings and pilasters.
      towerWash(`Tower lower front wash · ${side(s)}`, [-0.125, 8.4, s * (TZ + 0.7)], [-0.28, 6.3, s * TZ], 180, 50, 3500);
      towerWash(`Tower stage 2 flood · ${side(s)}`, [-0.125, 8.4, s * TZ], [-0.19, 13.5, s * TZ], 180, 40, 7000);
      towerWash(`Tower stage 3 flood · ${side(s)}`, [-0.035, 15.88, s * TZ], [-0.09, 20.6, s * TZ], 180, 40, 6000);
      towerWash(`Belfry front wash · ${side(s)}`, [0.065, 23.2, s * TZ], [0.195, 27.3, s * TZ], 180, 40, 4500);
      towerWash(`Dome front wash · ${side(s)}`, [0.35, 29.26, s * TZ], [0.95, 31.6, s * TZ], 180, 36, 2500);
      add({ type: 'uplight', name: `Belfry glow · ${side(s)}`, circuit: 'L6', mount: 'floor', pos: [TX, 23.2, s * TZ], yaw: 0, mountYaw: 0, tilt: 90, lumens: 2500, cct: 2700 });
      towerWash(`Tower lower side wash · ${side(s)}`, [TX + 0.6, 8.4, s * (TZ + 2.585)], [TX, 6.3, s * (TZ + 2.73)], s * 90, 50, 2500);
      towerWash(`Tower stage 2 side wash · ${side(s)}`, [TX, 8.4, s * (TZ + 2.585)], [TX, 13.5, s * (TZ + 2.605)], s * 90, 40, 5000);
      towerWash(`Tower stage 3 side wash · ${side(s)}`, [TX, 15.88, s * (TZ + 2.46)], [TX, 20.6, s * (TZ + 2.505)], s * 90, 40, 4000);
      towerWash(`Belfry side wash · ${side(s)}`, [TX, 23.2, s * (TZ + 2.36)], [TX, 27.3, s * (TZ + 2.23)], s * 90, 40, 3000);
      // The doors and lower façade between the towers, from the inner tower corners.
      ledgeFlood(`Façade wash · ${side(s)}`, 'L6', [ledge, 8.4, s * 7.9], [2.4, 2.5, s * 1.5], 50, 6000);
    }

    // L5 · downlights fixed high on the building for the open spaces: the
    // front stage (events) from the tower cornices, and the walkways around the
    // church from the arcade piers, the wing gables and the rear wall.
    const down = (name, p, target, beam, lumens, mount = 'floor', mountYaw) => {
      const a = aim(p, target);
      add({ type: mount === 'floor' ? 'flood' : 'projector36', name, circuit: 'L5', mount, pos: p, yaw: a.yaw, mountYaw: mountYaw ?? a.yaw, tilt: a.tilt, beam, lumens });
    };
    for (const s of [-1, 1]) {
      for (const dz of [-1.7, 1.7]) down(`Stage flood · tower ${side(s)} · ${dz * s < 0 ? 'inner' : 'outer'}`, [ledge, 8.4, s * TZ + dz], [-4.6, -0.48, s * (dz * s < 0 ? 2.2 : 7.5)], 45, 9000);
      for (const k of ['4', '6', '11']) down(`Path light · axis ${k} · ${side(s)}`, [A[k], 5.9, s * 10.75], [A[k], -2.08, s * 14.5], 50, 2500, 'wall', s * 90);
      down(`Path light · wing gable ${side(s)}`, [40.575, 6.2, s * 13.13], [40.575, -2.08, s * 17], 55, 3000, 'wall', s * 90);
      down(`Path light · rear · ${side(s)}`, [53.2, 5.2, s * 4.5], [57.5, -2.08, s * 5], 55, 3000, 'wall', 0);
    }

    // L7 · festival exterior: bulb strings along the ridge, the main and veranda
    // eaves and the rear gable, across the front terrace and up the tower corners,
    // plus floods on the tower tops and the central shrine. Off except at feasts.
    const strand = (name, pos, yaw, length, slope = 0, mount = 'floor', mountYaw = yaw) =>
      add({ type: 'bulbString', name: `Festival lights · ${name}`, circuit: 'L7', mount, pos, yaw, mountYaw, on: false, params: { length, slope, spacing: 0.6 } });
    strand('roof ridge', [29.16, 12.69, 0], 90, 47.3);
    for (const s of [-1, 1]) {
      strand(`main eave ${side(s)} · nave`, [21.35, 7.32, s * 7.3], 90, 31.7);
      strand(`main eave ${side(s)} · sanctuary`, [48.4, 7.32, s * 7.3], 90, 8.9);
      strand(`veranda eave ${side(s)} · nave`, [21.35, 6.47, s * 10.6], 90, 31.7);
      strand(`veranda eave ${side(s)} · sanctuary`, [48.4, 6.47, s * 10.6], 90, 8.9);
      strand(`rear gable ${side(s)}`, [53.45, 10.0, s * 3.65], 0, 9.07, -s * 36.4);
      // Up the corner pilasters of the first three tower stages, which step in as they rise.
      [[0, 8.39, 4.9, 4.9], [8.39, 15.84, 4.65, 4.72], [15.84, 23.14, 4.45, 4.52]].forEach(([y0, y1, d, u], i) => {
        for (const e of [-1, 1]) strand(`tower ${side(s)} · stage ${i + 1} · ${e < 0 ? 'inner' : 'outer'} corner`, [2.45 - u / 2 - 0.4, (y0 + y1) / 2, s * (10.153 + e * (d / 2 - 0.12))], 0, y1 - y0 - 0.6, 90, 'wall', 180);
      });
      // Belfry and dome lit from the +23.14 m ledge of each tower.
    }
    strand('front terrace between the towers', [2.15, 8.5, 0], 0, 14.8);
    for (const s of [-1, 1]) {
      // Rear gable from the rear corners of the veranda roofs.
      ledgeFlood(`Festival flood · rear gable ${side(s)}`, 'L7', [52.6, 6.55, s * 9.8], [53.3, 12.5, s * 1.5], 40, 9000, false);
    }
    // Overlapping lower and upper washes cover the full shrine, including the
    // entablature between the doors and niche and the +21.72 m cross ornament.
    // Both pairs are mounted on the towers' existing inner front cornices.
    for (const s of [-1, 1]) {
      ledgeFlood(`Central gable flood · ${side(s)}`, 'L6', [ledge, 8.4, s * 7.75], [2.2, 12.8, -s * 0.8], 60, 6500);
      ledgeFlood(`Central crown wash · ${side(s)}`, 'L6', [-0.035, 15.88, s * 7.9], [2.2, 18.6, 0], 55, 6000);
    }

    // Fans · 1.42 m ceiling fans mid-bay over the two side aisles (between the
    // centre and outer blocks): the 30°/40° reading beams miss the blades, and
    // nothing hangs over the processional aisle.
    for (const k of ['2′', '3', '4', '5', '6', '7', '8']) for (const s of [-1, 1]) {
      const x = k === '2′' ? (A['2′'] + A['3']) / 2 : A[k] + 2.25, z = s * 4.4, bay = k === '2′' ? '2′–3' : `${k}–${Number(k) + 1}`;
      add({ type: 'fanCeiling', name: `Ceiling fan · bay ${bay} · ${side(s)} aisle`, circuit: 'F1', mount: 'pendant', pos: [x, 3.9, z], anchorY: lining(z) - 0.06, yaw: 0, mountYaw: 0, speed: 2,
        note: 'Long downrod from a purlin bracket with an anti-sway restraint; structural engineer to verify.' });
    }

    // Wings at 9–10 (choir and ministers' benches): two fans each under the gabled roof.
    for (const s of [-1, 1]) for (const x of [39.3, 41.85]) {
      add({ type: 'fanCeiling', name: `Ceiling fan · wing ${side(s)} · ${x < 40.5 ? 'front' : 'rear'}`, circuit: 'F1', mount: 'pendant', pos: [x, 3.3, s * 10.15], anchorY: above(x, s * 10.15, 3.3), yaw: 0, mountYaw: 0, speed: 2 });
    }
    // Optional: small oscillating wall fans on the side-wall pilasters, above the
    // sconces, for the hottest days. Hidden until shown (F2).
    for (const k of ['4', '6', '8']) for (const s of [-1, 1]) {
      add({ type: 'fanWall', name: `Wall fan · axis ${k} · ${side(s)}`, circuit: 'F2', mount: 'wall', pos: [A[k], 5.55, s * 7.07], yaw: -s * 90, mountYaw: -s * 90, tilt: -38, speed: 1, hidden: true });
    }
    // Trial: two large circulators on the inside of the entrance wall, blowing
    // down the nave (F4, off). Compare the air map with them on and off. Each is
    // centred on the solid pier between the main door (opening ±1.55 m) and a
    // side door (4.55–6.45 m), within the upper band: clear of both fanlights
    // and above the rear-row spotlights, so no beam passes through the blades.
    // Aimed 8° inward and 14° down, the two throws meet over the centre blocks,
    // which the side-aisle ceiling fans reach least, and stay inside the column
    // line. Anywhere on the pier gives the same seat air within 0.02 m/s; the aim
    // decides it.
    for (const s of [-1, 1]) add({ type: 'fanWallLarge', name: `Entrance circulator · ${side(s)}`, circuit: 'F4', mount: 'wall', pos: [facadeX + 0.005, 6.0, s * 3.05], yaw: -s * 8, mountYaw: 0, tilt: -14, speed: 2, on: false });
    // Ventilation: exhaust fans draw out the hot air that collects under the
    // roof; fresh air comes in through the doors and windows (V1). Four high
    // in the front gable, two in the end gable of each 9–10 wing, and one over
    // the service room behind the sanctuary wall. The gable row is evenly
    // spaced about the ridge line on the wall's inner face (x 5.475), 0.70 m
    // above the terrace slab and 0.60 m below the roof lining at its outer corners.
    for (const z of [-2.4, -0.8, 0.8, 2.4]) add({ type: 'fanExhaust', name: `Exhaust fan · front gable · ${side(z)} ${Math.abs(z) > 2 ? 'outer' : 'inner'}`, circuit: 'V1', mount: 'wall', pos: [5.48, 9.4, z], yaw: 0, mountYaw: 0, speed: 1 });
    for (const s of [-1, 1]) for (const x of [39.7, 41.45]) add({ type: 'fanExhaust', name: `Exhaust fan · wing gable ${side(s)} · ${x < 40.5 ? 'front' : 'rear'}`, circuit: 'V1', mount: 'wall', pos: [x, 7.6, s * 13.13], yaw: -s * 90, mountYaw: -s * 90, speed: 1 });
    add({ type: 'fanExhaust', name: 'Exhaust fan · service room', circuit: 'V1', mount: 'wall', pos: [53.12, 3.3, 0], yaw: 180, mountYaw: 180, speed: 1 });

    // Loudspeakers · a discreet distributed system: slim 0.6 m columns painted
    // the wall colour on the side-wall pilasters (axes 4–9), between the Stations
    // of the Cross plaques (2.2–2.9 m) and the sconces (4.6 m), with clear
    // gaps so each pilaster reads as one ordered column of fittings,
    // turned 50° toward the back so each covers the rows behind it, and
    // time-aligned to the talker. Nothing is fixed to the timber columns.
    for (const k of ['4', '5', '6', '7', '8', '9']) for (const s of [-1, 1]) {
      add({ type: 'slimColumn', name: `Wall speaker · axis ${k} · ${side(s)}`, circuit: 'A1', mount: 'wall', pos: [A[k], 3.45, s * 7.07], yaw: -s * 140, mountYaw: -s * 90, tilt: -18, level: -6, delayMs: 0 });
    }
    // Back of the church: two slim columns on the inside of the entrance wall,
    // aimed steeply at the entrance hall and the last rows. Each is on the solid
    // pier between the main door and a side door, below the circulator and
    // clear of both door openings.
    for (const s of [-1, 1]) {
      const p = [facadeX + 0.005, 3.6, s * 3.05], a = aim(p, [7.5, 1.2, s * 3.6]);
      add({ type: 'slimColumn', name: `Wall speaker · entrance hall · ${side(s)}`, circuit: 'A5', mount: 'wall', pos: p, yaw: a.yaw, mountYaw: 0, tilt: a.tilt, level: -9, delayMs: 0, on: false });
    }
    // Wings: the wall speakers face the back of the nave, so each wing gets two
    // small pendants, one over each bench block behind the fans, just below the
    // blade level and aimed down toward the front rows: close to every bench,
    // so they need little level and add little to the reverberant sound that
    // returns to the altar microphones.
    for (const s of [-1, 1]) for (const x of [38.94, 42.22]) {
      const p = [x, 3.0, s * 11.6], a = aim(p, [x, 0.9, s * 9.6]);
      add({ type: 'pendantSpeaker', name: `Wing speaker · ${side(s)} · ${x < 40.5 ? 'front' : 'rear'} block`, circuit: 'A1', mount: 'pendant', pos: p, anchorY: above(x, s * 11.6, 3.0), yaw: a.yaw, mountYaw: 0, tilt: a.tilt, level: -10, delayMs: 0 });
    }
    for (const s of [-1, 1]) for (const x of [12.225, 25.725]) {
      add({ type: 'pendantSpeaker', name: `Veranda fill · ${side(s)} · ${x.toFixed(1)}`, circuit: 'A2', mount: 'pendant', pos: [x, 3.9, s * 8.85], anchorY: above(x, s * 8.85, 3.9), yaw: 0, mountYaw: 0, tilt: -90, level: -7 });
    }
    for (const s of [-1, 1]) {
      // On the tower fronts (x −0.14), beside the recessed central façade.
      const p = [-0.14, 6.2, s * 8.3], a = aim(p, [-24, 0, s * 5]);
      add({ type: 'horn', name: `Courtyard horn · ${side(s)}`, circuit: 'A3', mount: 'wall', pos: p, yaw: a.yaw, mountYaw: 180, tilt: a.tilt, level: -4, on: false });
      // A second horn on each tower, on the outer half of its front.
      const q = [-0.14, 6.2, s * 11.9], b = aim(q, [-24, 0, s * 15]);
      add({ type: 'horn', name: `Tower horn · ${side(s)} · outer`, circuit: 'A3', mount: 'wall', pos: q, yaw: b.yaw, mountYaw: 180, tilt: b.tilt, level: -4, on: false });
      // Two on each side, on the outer arcade piers, for the side courtyards.
      for (const k of ['5', '8']) {
        const r = [A[k], 5.6, s * 10.75], c = aim(r, [A[k], 0, s * 22]);
        add({ type: 'horn', name: `Side courtyard horn · axis ${k} · ${side(s)}`, circuit: 'A3', mount: 'wall', pos: r, yaw: c.yaw, mountYaw: s * 90, tilt: c.tilt, level: -6, on: false });
      }
    }
    add({ type: 'mic', name: 'Ambo microphone', circuit: 'MIC', mount: 'floor', pos: [42.36, 1.9, -2.62], yaw: 0, mountYaw: 0 });
    add({ type: 'mic', name: 'Altar microphone', circuit: 'MIC', mount: 'floor', pos: [44.45, 1.88, 0.45], yaw: 0, mountYaw: 0 });

    // Decoration · statues in the side alcoves either side of the crucifix, as in the reference interior.
    add({ type: 'statueMary', name: 'Statue · Our Lady', circuit: 'DECOR', mount: 'floor', pos: statues.B, yaw: 180, mountYaw: 180 });
    add({ type: 'statueJoseph', name: 'Statue · Saint Joseph', circuit: 'DECOR', mount: 'floor', pos: statues.H, yaw: 180, mountYaw: 180 });
    for (const s of [-1, 1]) {
      add({ type: 'flowerStand', name: `Flower stand · statue ${side(s)}`, circuit: 'DECOR', mount: 'floor', pos: [49.45, 0.15, s * 6.6], yaw: 180, mountYaw: 180 });
      add({ type: 'candleStand', name: `Votive candles · ${side(s)}`, circuit: 'DECOR', mount: 'floor', pos: [48.1, 0.15, s * 6.2], yaw: 180, mountYaw: 180 });
      add({ type: 'palm', name: `Palm · entrance ${side(s)}`, circuit: 'DECOR', mount: 'floor', pos: [6.3, 0, s * 6.55], yaw: 0, mountYaw: 0 });
      add({ type: 'banner', name: `Banner · axis 9 · ${side(s)}`, circuit: 'DECOR', mount: 'wall', pos: [A['9'] - 0.315, 6.6, s * 3.6], yaw: 180, mountYaw: 180 });
    }
    add({ type: 'paschal', name: 'Paschal candle', circuit: 'DECOR', mount: 'floor', pos: [42.05, 0.75, -1.55], yaw: 180, mountYaw: 180 });
    // Seasonal and festival items, hidden until needed.
    add({ type: 'carpet', name: 'Aisle carpet (weddings & feasts)', circuit: 'DECOR', mount: 'floor', pos: [6.2, 0, 0], yaw: 0, mountYaw: 0, hidden: true, params: { length: 32 } });
    add({ type: 'christmasTree', name: 'Christmas tree · front stage', circuit: 'X1', mount: 'floor', pos: [-4.2, -0.48, -5.6], yaw: 180, mountYaw: 180, hidden: true });
    add({ type: 'grotto', name: 'Nativity grotto (hang đá) · front stage', circuit: 'X1', mount: 'floor', pos: [-4.2, -0.48, 5.6], yaw: 180, mountYaw: 180, hidden: true });
    add({ type: 'star', name: 'Star over the crossing', circuit: 'X1', mount: 'pendant', pos: [(A['9'] + A['10']) / 2, 9.4, 0], anchorY: lining(0) - 0.13, yaw: 90, mountYaw: 90, hidden: true });
    // Festival lantern strings mid-bay, clear of the pier lanterns and of the loudspeaker bays (3–4, 6–7).
    for (const k of ['4', '5', '7', '8']) for (const s of [-1, 1]) {
      const x = A[k] + 2.25;
      add({ type: 'lanternString', name: `Red lanterns · veranda ${side(s)} · bay ${k}–${Number(k) + 1}`, circuit: 'X1', mount: 'pendant', pos: [x, 5.6, s * 8.85], anchorY: above(x, s * 8.85, 5.6), yaw: 90, mountYaw: 90, hidden: true, params: { length: 3.4 } });
    }
    for (const k of ['4', '6', '8']) add({ type: 'bunting', name: `Festival pennants · axis ${k}`, circuit: 'DECOR', mount: 'pendant', pos: [A[k], 7.2, 0], anchorY: 7.2, yaw: 0, mountYaw: 0, hidden: true, params: { length: 7 } });
    // Everything fixed to the towers and the front façade is switched at DB-2
    // inside the main doors: the stage floods on the tower cornices and the
    // central entrance lanterns form circuit L9 (L6 floods and L7 festival lights are
    // already there).
    for (const it of items) if (/^Stage flood · tower/.test(it.name)) it.circuit = 'L9';
    return items;
  }

  const lightingRevision = '2026-10-05-balanced-doors-towers';
  const reviewedLight = it => /^(Sconce · main door|Side door lantern|Tower lantern|Central front door lantern|Service door lantern|Tower (stage [23] (flood|side wash)|side wash|lower (front|side) wash)|Belfry (& dome flood|front wash|side wash)|Dome front wash) ·/.test(it.name);
  function upgradeLighting(items, design, scene = {}) {
    const old = items.filter(reviewedLight), byName = new Map(old.map(it => [it.name, it]));
    const revised = design.filter(reviewedLight).map(raw => {
      const sideTag = raw.name.endsWith(' · B') ? 'B' : 'H';
      let prior = byName.get(raw.name);
      if (!prior && raw.name.startsWith('Central front door lantern')) prior = byName.get(`Sconce · main door · ${sideTag}`);
      if (!prior && raw.name.startsWith('Belfry front wash')) prior = byName.get(`Belfry & dome flood · ${sideTag}`);
      if (!prior && /^Side door lantern · [BH] · 16.725 · front$/.test(raw.name)) prior = byName.get(raw.name.split(' · ').slice(0, 2).join(' · '));
      const neighbour = prior || old.find(it => it.circuit === raw.circuit);
      const level = scene[raw.circuit];
      return { ...raw, ...(prior ? { id: prior.id, hidden: prior.hidden } : {}),
        on: prior ? prior.on : level !== undefined ? level > 0 : neighbour?.on ?? true,
        dim: prior?.dim ?? (level > 0 ? Math.min(1, level) : neighbour?.dim ?? 1) };
    });
    return [...items.filter(it => !reviewedLight(it)), ...revised];
  }

  const facadeRevision = '2026-10-05-continuous-facade-wash-2';
  const facadeLight = it => /^(Façade wash|Central gable flood|Central crown wash) ·/.test(it.name);
  function upgradeFacade(items, design, scene = {}) {
    const byName = new Map(items.filter(facadeLight).map(it => [it.name, it]));
    const revised = design.filter(facadeLight).map(raw => {
      const prior = byName.get(raw.name);
      const neighbour = prior || items.find(it => it.circuit === raw.circuit);
      const level = scene[raw.circuit];
      return { ...raw, ...(prior ? { id: prior.id, hidden: prior.hidden } : {}),
        on: prior ? prior.on : level !== undefined ? level > 0 : neighbour?.on ?? true,
        dim: prior?.dim ?? (level > 0 ? Math.min(1, level) : neighbour?.dim ?? 1) };
    });
    return [...items.filter(it => !facadeLight(it)), ...revised];
  }

  // Entrance wall review: saved layouts keep each fitting's switching, level
  // and circuit, and take only its corrected position and aim.
  const entranceRevision = '2026-10-07-entrance-wall-2';
  const entranceFitting = it => /^(Entrance circulator|Exhaust fan · front gable|Wall speaker · entrance hall) ·/.test(it.name);
  function upgradeEntrance(items, design) {
    const byName = new Map(design.filter(entranceFitting).map(raw => [raw.name, raw]));
    return items.map(it => {
      const raw = entranceFitting(it) && byName.get(it.name);
      return raw ? { ...it, pos: [...raw.pos], yaw: raw.yaw, mountYaw: raw.mountYaw, tilt: raw.tilt ?? it.tilt } : it;
    });
  }

  // Bump when the recommended design changes: browsers holding a layout saved
  // from an older version then load the new design (the old one is kept aside).
  // This lighting review migrates only the reviewed fixtures, preserving the
  // rest of saved layouts. A removed fitting stays removed after the revision.
  window.CHURCH_SIM_DESIGN = { recommended, aim, upgradeLighting, lightingRevision, upgradeFacade, facadeRevision, upgradeEntrance, entranceRevision, version: '2026-10-16-tower-board' };
})();
