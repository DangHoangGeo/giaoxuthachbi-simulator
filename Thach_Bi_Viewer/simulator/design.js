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
    // Sanctuary geometry from sanctuary.js: shrine niches on the column line and
    // the timber-lined chamber between axes 10 and 11.
    const sanctuary = window.CHURCH_SANCTUARY?.spec ?? { frameX: 44.175, wingX: 44.375, wingZ: 5.5, nicheBase: 2.85, chamber: { x0: 44.49, x1: 48.42, face: 3.3 }, niche: { backX: 49 } };
    const shrine = { x: sanctuary.wingX - 0.1, y: sanctuary.nicheBase, z: sanctuary.wingZ };
    const chamber = { face: sanctuary.chamber.face - 0.06, lightX: sanctuary.chamber.x0 + 0.26, sconceX: (sanctuary.chamber.x0 + sanctuary.chamber.x1) / 2 };
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
    // L8 · held wing review, 9 October. Smaller brass chandeliers match the
    // owner's intent; a separate downward optic supplies task light. The rear
    // row stays inward of the existing speaker/support envelope. No selected
    // photometry, mounting design, glare or concealment approval exists.
    for (const sign of [-1, 1]) for (const x of [38.94, 42.22]) {
      for (const [z, rows] of [[10.6, 'back'], [8.8, 'front']]) {
        add({ type: 'chandelier6Reading', name: `Wing light · ${side(sign)} · ${x < 40.5 ? 'front' : 'rear'} block · ${rows} rows`, circuit: 'L8', mount: 'pendant',
          pos: [x, 4.4, sign * z], anchorY: above(x, sign * z, 4.4), yaw: 0, mountYaw: 0, tilt: -90, lumens: 5640, beam: 100, cct: 2700,
          note: 'HELD wing concept: 6 brass candle lamps plus downward reading optic. Unverified photometry, glare, thermal design, support and maintenance. See docs/engineering/wing-review.md.' });
      }
    }
    // LA · hidden roof uplights on top of every tie beam. Axis 10 carries the
    // lobed sanctuary frame instead of a tie; the vault behind it has its own.
    for (const k of nave) add({ type: 'uplight', name: `Roof uplight · axis ${k}`, circuit: 'LA', mount: 'floor', pos: [A[k], 9.18, 0], yaw: 90, mountYaw: 90, tilt: 90 });

    // LD · chandeliers on chains from the ridge over the side-door crossings
    // and bay 6–7, plus a grand chandelier at the crossing.
    for (const k of ['4', '6', '8']) add({ type: 'chandelier8', name: `Chandelier · bay ${k}–${Number(k) + 1}`, circuit: 'LD', mount: 'pendant', pos: [A[k] + 2.25, 6.3, 0], anchorY: lining(0) - 0.13, yaw: 0, mountYaw: 0 });
    // Hung high enough that the lobed sanctuary frame and the reredos crown read below it from the nave.
    add({ type: 'chandelier12', name: 'Grand chandelier · crossing 9–10', circuit: 'LD', mount: 'pendant', pos: [(A['9'] + A['10']) / 2, 9.2, 0], anchorY: lining(0) - 0.13, yaw: 0, mountYaw: 0 });
    // Sconces on the C/G piers, facing the nave, and on the sanctuary piers.
    for (const k of ['3', '4', '5', '6', '7', '8', '9']) for (const s of [-1, 1]) {
      add({ type: 'sconce2', name: `Sconce · axis ${k} · ${side(s)}`, circuit: 'LD', mount: 'wall', pos: [A[k], 4.6, s * 7.07], yaw: -s * 90, mountYaw: -s * 90 });
    }
    for (const s of [-1, 1]) add({ type: 'sconce2', name: `Sconce · sanctuary pier · ${side(s)}`, circuit: 'LD', mount: 'wall', pos: [chamber.sconceX, 4.3, s * chamber.face], yaw: -s * 90, mountYaw: -s * 90, lumens: 560 });

    // L3 · sanctuary.
    // The ambo stands 2.3 m in front of the altar (bundle: x 41.3); the reader's head is
    // 0.32 m behind its centre. The corpus hangs inside the crucifix niche.
    const amboX = 41.3, altar = [43.95, 1.95, 0], ambo = [amboX + 0.32, 2.25, -2.62], crucifix = [sanctuary.niche.backX - 0.5, 5.1, 0];
    // Outside the frame, every head hangs from the axis-9 tie beam or side beams
    // and points away from the congregation.
    const outside = (name, type, z, y, target, o) => {
      const p = [A['9'], y - 0.005, z], a = aim(p, target);
      add({ type, name, circuit: 'L3', mount: 'pendant', pos: p, anchorY: y, ...a, mountYaw: a.yaw, ...o });
    };
    for (const z of [-1.4, 1.4]) outside(`Altar key light · ${side(z)}`, 'projector24', z, beamY, [altar[0], altar[1], z * 0.3], { beam: 24, lumens: 4500, shadow: true });
    outside('Ambo key light', 'spot15', -3.15, beamY, ambo, { beam: 15, lumens: 1900, shadow: true });
    for (const z of [-1.9, 1.9]) outside(`Sanctuary step fill · ${side(z)}`, 'projector36', z, beamY, [41.6, 0.75, z * 1.2], { lumens: 4000 });
    // The presider's chair stands inside the chamber, beyond the altar keys.
    outside('Presider chair light', 'spot15', 3.0, beamY, [46.6, 2.3, 2.2], { beam: 15, lumens: 1400, shadow: false });
    // The lacquer is dark: the frame's gilding needs its own wash from the front,
    // and the same beams carry on to the reredos crown under the vault.
    for (const s of [-1, 1]) outside(`Sanctuary frame wash · ${side(s)}`, 'projector36', s * 0.6, beamY, [sanctuary.frameX - 0.2, 9.8, s * 1.8], { beam: 50, lumens: 3500, shadow: false });
    // Inside the chamber the heads sit on the lacquered side walls directly
    // behind the front frame, hidden from the nave by the axis-10 columns.
    const inside = (name, type, y, s, target, o) => {
      const p = [chamber.lightX, y, s * chamber.face], a = aim(p, target);
      add({ type, name, circuit: 'L3', mount: 'wall', pos: p, yaw: a.yaw, tilt: a.tilt, mountYaw: -s * 90, shadow: false, ...o });
    };
    for (const s of [-1, 1]) {
      inside(`Crucifix accent · ${side(s)}`, 'spot15', 7.6, s, crucifix, { beam: 24, lumens: 700 });
      // Each wash covers the gilded side of the reredos on its own wall, aimed outside
      // the niche so that little of it reaches the blue recess; the lower pair crosses
      // the chamber to the base panels and the presider's chair.
      inside(`Reredos wash · ${side(s)}`, 'projector36', 6.7, s, [47.9, 5.0, s * 2.7], { beam: 36, lumens: 650 });
      inside(`Reredos base wash · ${side(s)}`, 'projector36', 5.4, s, [46.9, 2.3, -s * 2.3], { lumens: 1300 });
      // Gilded vault: a flood on the springing cornice, aimed up and back.
      const u = [chamber.lightX + 0.6, 8.42, s * (chamber.face - 0.3)], ua = aim(u, [47.6, 10.4, -s * 0.6]);
      add({ type: 'uplight', name: `Sanctuary vault uplight · ${side(s)}`, circuit: 'L3', mount: 'floor', pos: u, ...ua, mountYaw: ua.yaw, lumens: 2200 });
    }
    inside('Tabernacle accent', 'spot15', 4.9, -1, [47.3, 2.05, 0], { beam: 10, lumens: 300 });
    // Our Lady (left) and Saint Joseph (right) in the shrines on the column line:
    // a soft wash for the whole carved front and a narrow accent for the figure.
    const statues = { B: [shrine.x, shrine.y, -shrine.z], H: [shrine.x, shrine.y, shrine.z] };
    for (const [k, base] of Object.entries(statues)) {
      const s = Math.sign(base[2]);
      outside(`Statue accent · ${k}`, 'spot15', s * (shrine.z - 0.25), sideBeamY, [base[0], shrine.y + 1.25, base[2]], { beam: 12, lumens: 220, shadow: false });
      outside(`Shrine wash · ${k}`, 'projector36', s * (shrine.z - 0.6), sideBeamY, [base[0] - 0.2, 4.2, base[2]], { beam: 50, lumens: 2400, shadow: false });
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
    // The open service room behind the sanctuary has a door to the outside in the
    // rear gable of each side bay; each receives a lower-output pair on the wall
    // beside it. ('front' is the lantern nearer the centre.)
    for (const s of [-1, 1]) for (const e of [-1, 1]) add({ type: 'wallLantern', name: `Service door lantern · ${side(s)} · ${e < 0 ? 'front' : 'rear'}`, circuit: 'L3', mount: 'wall', pos: [52.8, 2.3, s * (5.48 + e * 1.0)], yaw: 180, mountYaw: 180, lumens: 400 });
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

    // Held wing wall-fan comparison. Keep the original four item slots so
    // existing equipment IDs remain stable; append the extra four at the end.
    const wingFan = (sign, index) => {
      const [x, targetX, targetZ] = [[39.15, 38.94, 11.5], [39.95, 38.94, 9], [41.2, 42.22, 9], [42, 42.22, 11.5]][index];
      const pos = [x, index === 0 || index === 3 ? 3.5 : 2.7, sign * 13.06];
      return { type: 'fanWall', name: `Wall fan · wing ${side(sign)} · ${index + 1} · held review`, circuit: 'F5', mount: 'wall', pos, mountYaw: -sign * 90,
        ...aim(pos, [targetX, 0.28, sign * targetZ]), speed: 1, on: true, hidden: false,
        note: 'ENGINEERING HOLD: 4 per wing at low speed cover 68/80 seats; noise and speech criteria fail. Gable anchors, concealment, sweep clearance and maintenance unapproved.' };
    };
    for (const sign of [-1, 1]) for (const index of [0, 1]) add(wingFan(sign, index));
    // Show the six existing nave wall-fan concepts by default, as requested.
    // Display visibility is separate from operation: full service keeps F2 off.
    for (const k of ['4', '6', '8']) for (const sign of [-1, 1]) {
      add({ type: 'fanWall', name: `Wall fan · axis ${k} · ${side(sign)}`, circuit: 'F2', mount: 'wall', pos: [A[k], 5.55, sign * 7.07], yaw: -sign * 90, mountYaw: -sign * 90, tilt: -38, speed: 1, hidden: false, on: false });
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
    add({ type: 'mic', name: 'Ambo microphone', circuit: 'MIC', mount: 'floor', pos: [amboX - 0.22, 1.9, -2.62], yaw: 0, mountYaw: 0 });
    add({ type: 'mic', name: 'Altar microphone', circuit: 'MIC', mount: 'floor', pos: [44.45, 1.88, 0.45], yaw: 0, mountYaw: 0 });

    // Decoration · statues in the raised shrine niches on the column line, as in the approved concept.
    add({ type: 'statueMary', name: 'Statue · Our Lady', circuit: 'DECOR', mount: 'floor', pos: statues.B, yaw: 180, mountYaw: 180 });
    add({ type: 'statueJoseph', name: 'Statue · Saint Joseph', circuit: 'DECOR', mount: 'floor', pos: statues.H, yaw: 180, mountYaw: 180 });
    for (const s of [-1, 1]) {
      // Tall items stay out of the wing benches' view of the altar, celebrant and
      // ambo (checked seat by seat), and nothing stands on the way to the shrines:
      // flowers beside the tabernacle and a palm in each front corner of the
      // chamber beside the column, as in the concept. No votive candle stands.
      add({ type: 'flowerStand', name: `Flower stand · tabernacle ${side(s)}`, circuit: 'DECOR', mount: 'floor', pos: [47.2, 0.75, s * 1.15], yaw: 180, mountYaw: 180 });
      add({ type: 'palm', name: `Palm · sanctuary ${side(s)}`, circuit: 'DECOR', mount: 'floor', pos: [sanctuary.chamber.x0 + 0.66, 0.75, s * 2.9], yaw: 0, mountYaw: 0 });
      for (const e of [-1, 1]) add({ type: 'floorFlowers', name: `Shrine flowers · ${side(s)} · ${e * s < 0 ? 'inner' : 'outer'}`, circuit: 'DECOR', mount: 'floor', pos: [shrine.x - 0.05, shrine.y, s * shrine.z + e * 0.7], yaw: 180, mountYaw: 180 });
      add({ type: 'palm', name: `Palm · entrance ${side(s)}`, circuit: 'DECOR', mount: 'floor', pos: [6.3, 0, s * 6.55], yaw: 0, mountYaw: 0 });
      add({ type: 'banner', name: `Banner · axis 9 · ${side(s)}`, circuit: 'DECOR', mount: 'wall', pos: [A['9'] - 0.315, 6.6, s * 3.6], yaw: 180, mountYaw: 180 });
    }
    add({ type: 'paschal', name: 'Paschal candle', circuit: 'DECOR', mount: 'floor', pos: [amboX - 0.53, 0.75, -1.55], yaw: 180, mountYaw: 180 });
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
    for (const sign of [-1, 1]) for (const index of [2, 3]) add({ ...wingFan(sign, index), id: `F-WING-${side(sign)}-${index + 1}` });
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
  const sanctuaryRevision = '2026-10-07-sanctuary-8';
  // Fittings and furnishings that belong to the rebuilt sanctuary take their
  // reviewed place and output. The axis-10 uplight lost its tie beam and the
  // votive candle stands stood in the way to the shrines: both are removed.
  // Everything else in a saved layout, including its switching, is left as it was.
  const sanctuaryRemoved = /^(Roof uplight · axis 10$|Votive candles ·)/;
  const sanctuaryNames = /^(Service door lantern ·|Ambo microphone$|Ambo key light$|Paschal candle$|Statue ·|Statue accent ·|Crucifix accent ·|Tabernacle accent|Reredos wash ·|Sanctuary vault uplight ·|Sconce · sanctuary pier ·|Flower stand · tabernacle|Palm · sanctuary|Shrine flowers ·|Shrine wash ·|Sanctuary frame wash ·|Reredos base wash ·|Presider chair light|Altar key light ·|Grand chandelier · crossing)/;
  // Revision 8 only lowers lamp outputs: at night the centre of the sanctuary was bright
  // enough to wash out the blue recess and the red lacquer. A layout already at revision 6
  // keeps every position it has and takes the new output of these fittings.
  const sanctuaryRetuned = /^(Crucifix accent ·|Reredos wash ·|Reredos base wash ·|Sanctuary vault uplight ·|Tabernacle accent|Altar key light ·|Ambo key light$|Presider chair light|Sanctuary frame wash ·|Shrine wash ·|Statue accent ·|Sconce · sanctuary pier ·)/;
  function upgradeSanctuary(items, design, from) {
    const names = new Map(design.filter(it => sanctuaryNames.test(it.name)).map(it => [it.name,it]));
    if (from === '2026-10-07-sanctuary-6') return items.map(it => {
      const raw = sanctuaryRetuned.test(it.name) && names.get(it.name);
      if (!raw) return it;
      // The reredos washes are also re-aimed, where they still hang in their reviewed place.
      const aimed = /^Reredos wash ·/.test(it.name) && it.pos.every((v, i) => Math.abs(v - raw.pos[i]) < 0.01) ? { yaw: raw.yaw, tilt: raw.tilt } : {};
      return { ...it, ...aimed, beam: raw.beam ?? it.beam, lumens: raw.lumens ?? it.lumens };
    });
    // The tall flower stands move from the statues to the tabernacle and take its name.
    const renamed = name => name.replace(/^Flower stand · statue /, 'Flower stand · tabernacle ');
    const kept = items.filter(it => !sanctuaryRemoved.test(it.name)).map(it => renamed(it.name) === it.name ? it : { ...it, name: renamed(it.name) }).map(it => {
      const raw=names.get(it.name);names.delete(it.name);
      return raw ? {...it,type:raw.type,pos:[...raw.pos],anchorY:raw.anchorY ?? it.anchorY,yaw:raw.yaw,mountYaw:raw.mountYaw,tilt:raw.tilt ?? it.tilt,beam:raw.beam ?? it.beam,lumens:raw.lumens ?? it.lumens} : it;
    });
    // Only the fittings this revision introduces are added; a deleted statue stays deleted.
    return [...kept, ...[...names.values()].filter(it => /^(Reredos wash ·|Reredos base wash ·|Sanctuary vault uplight ·|Sanctuary frame wash ·|Shrine wash ·|Presider chair light|Shrine flowers ·|Palm · sanctuary)/.test(it.name))];
  }

  // Conservative one-time update: only an entire untouched wing can migrate.
  // Deleted, moved, renamed, hidden or retuned items block that wing's update.
  // The exact pre-review default records are retained for audit and comparison.
  const wingReviewRevision = '2026-10-09-wing-held-1';
  const wingBefore = [
    {"id":"L63","type":"projector36","name":"Wing light · B · front block · back rows","circuit":"L8","mount":"wall","pos":[40.26,4.15,-13.06],"yaw":123.95905981967627,"tilt":-57.22322254475144,"mountYaw":90,"on":true,"hidden":false,"dim":1,"params":{},"lumens":3800,"beam":50,"shadow":false},
    {"id":"L64","type":"projector36","name":"Wing light · B · front block · front rows","circuit":"L8","mount":"wall","pos":[40.26,2.92,-13.06],"yaw":106.84380855172743,"tilt":-28.17456054434298,"mountYaw":90,"on":true,"hidden":false,"dim":1,"params":{},"lumens":4000,"beam":36,"shadow":false},
    {"id":"L65","type":"projector36","name":"Wing light · B · rear block · back rows","circuit":"L8","mount":"wall","pos":[40.86,4.15,-13.06],"yaw":55.24408744645866,"tilt":-56.97477586582589,"mountYaw":90,"on":true,"hidden":false,"dim":1,"params":{},"lumens":3800,"beam":50,"shadow":false},
    {"id":"L66","type":"projector36","name":"Wing light · B · rear block · front rows","circuit":"L8","mount":"wall","pos":[40.86,2.92,-13.06],"yaw":72.67591046002903,"tilt":-28.113168044859762,"mountYaw":90,"on":true,"hidden":false,"dim":1,"params":{},"lumens":4000,"beam":36,"shadow":false},
    {"id":"L67","type":"projector36","name":"Wing light · H · front block · back rows","circuit":"L8","mount":"wall","pos":[40.26,4.15,13.06],"yaw":-123.95905981967627,"tilt":-57.22322254475144,"mountYaw":-90,"on":true,"hidden":false,"dim":1,"params":{},"lumens":3800,"beam":50,"shadow":false},
    {"id":"L68","type":"projector36","name":"Wing light · H · front block · front rows","circuit":"L8","mount":"wall","pos":[40.26,2.92,13.06],"yaw":-106.84380855172743,"tilt":-28.17456054434298,"mountYaw":-90,"on":true,"hidden":false,"dim":1,"params":{},"lumens":4000,"beam":36,"shadow":false},
    {"id":"L69","type":"projector36","name":"Wing light · H · rear block · back rows","circuit":"L8","mount":"wall","pos":[40.86,4.15,13.06],"yaw":-55.24408744645866,"tilt":-56.97477586582589,"mountYaw":-90,"on":true,"hidden":false,"dim":1,"params":{},"lumens":3800,"beam":50,"shadow":false},
    {"id":"L70","type":"projector36","name":"Wing light · H · rear block · front rows","circuit":"L8","mount":"wall","pos":[40.86,2.92,13.06],"yaw":-72.67591046002903,"tilt":-28.113168044859762,"mountYaw":-90,"on":true,"hidden":false,"dim":1,"params":{},"lumens":4000,"beam":36,"shadow":false},
    {"id":"F240","type":"fanCeiling","name":"Ceiling fan · wing B · front","circuit":"F1","mount":"pendant","pos":[39.3,3.3,-10.15],"yaw":0,"tilt":0,"mountYaw":0,"anchorY":8.398379999999996,"on":true,"hidden":false,"dim":1,"params":{},"speed":2,"oscillate":true},
    {"id":"F241","type":"fanCeiling","name":"Ceiling fan · wing B · rear","circuit":"F1","mount":"pendant","pos":[41.85,3.3,-10.15],"yaw":0,"tilt":0,"mountYaw":0,"anchorY":8.374770000000002,"on":true,"hidden":false,"dim":1,"params":{},"speed":2,"oscillate":true},
    {"id":"F242","type":"fanCeiling","name":"Ceiling fan · wing H · front","circuit":"F1","mount":"pendant","pos":[39.3,3.3,10.15],"yaw":0,"tilt":0,"mountYaw":0,"anchorY":8.398379999999996,"on":true,"hidden":false,"dim":1,"params":{},"speed":2,"oscillate":true},
    {"id":"F243","type":"fanCeiling","name":"Ceiling fan · wing H · rear","circuit":"F1","mount":"pendant","pos":[41.85,3.3,10.15],"yaw":0,"tilt":0,"mountYaw":0,"anchorY":8.374770000000002,"on":true,"hidden":false,"dim":1,"params":{},"speed":2,"oscillate":true},
    {"id":"F244","type":"fanWall","name":"Wall fan · axis 4 · B","circuit":"F2","mount":"wall","pos":[14.475,5.55,-7.07],"yaw":90,"tilt":-38,"mountYaw":90,"on":true,"hidden":true,"dim":1,"params":{},"speed":2,"oscillate":true},
    {"id":"F245","type":"fanWall","name":"Wall fan · axis 4 · H","circuit":"F2","mount":"wall","pos":[14.475,5.55,7.07],"yaw":-90,"tilt":-38,"mountYaw":-90,"on":true,"hidden":true,"dim":1,"params":{},"speed":2,"oscillate":true},
    {"id":"F246","type":"fanWall","name":"Wall fan · axis 6 · B","circuit":"F2","mount":"wall","pos":[23.475,5.55,-7.07],"yaw":90,"tilt":-38,"mountYaw":90,"on":true,"hidden":true,"dim":1,"params":{},"speed":2,"oscillate":true},
    {"id":"F247","type":"fanWall","name":"Wall fan · axis 6 · H","circuit":"F2","mount":"wall","pos":[23.475,5.55,7.07],"yaw":-90,"tilt":-38,"mountYaw":-90,"on":true,"hidden":true,"dim":1,"params":{},"speed":2,"oscillate":true},
    {"id":"F248","type":"fanWall","name":"Wall fan · axis 8 · B","circuit":"F2","mount":"wall","pos":[32.475,5.55,-7.07],"yaw":90,"tilt":-38,"mountYaw":90,"on":true,"hidden":true,"dim":1,"params":{},"speed":2,"oscillate":true},
    {"id":"F249","type":"fanWall","name":"Wall fan · axis 8 · H","circuit":"F2","mount":"wall","pos":[32.475,5.55,7.07],"yaw":-90,"tilt":-38,"mountYaw":-90,"on":true,"hidden":true,"dim":1,"params":{},"speed":2,"oscillate":true},
  ];
  function upgradeWingReview(items, design) {
    const same = (a, b) => {
      if (typeof a === 'number' && typeof b === 'number') return Math.abs(a - b) < 1e-9;
      if (a && b && typeof a === 'object' && typeof b === 'object') {
        const keys = [...new Set([...Object.keys(a), ...Object.keys(b)])];
        return keys.every(k => same(a[k], b[k]));
      }
      return a === b;
    };
    const byId = new Map(items.map(it => [it.id, it])), replacements = new Map(), additions = [];
    for (const sign of [-1, 1]) {
      const old = wingBefore.filter(it => Math.sign(it.pos[2]) === sign && (it.circuit === 'L8' || it.type === 'fanCeiling'));
      if (!old.every(it => same(it, byId.get(it.id)))) continue;
      // Reserved-ID collisions can represent owner additions: preserve the
      // entire wing rather than silently substituting that item for a fan.
      if (design.some(it => it.id?.startsWith(`F-WING-${side(sign)}-`) && byId.has(it.id))) continue;
      const targetNames = old.map(it => it.circuit === 'L8' ? it.name : `Wall fan · wing ${side(sign)} · ${it.name.endsWith('front') ? 1 : 2} · held review`);
      if (targetNames.some(name => !design.some(it => it.name === name))) continue;
      old.forEach((it, n) => replacements.set(it.id, { ...design.find(raw => raw.name === targetNames[n]), id: it.id }));
      additions.push(...design.filter(it => it.id?.startsWith(`F-WING-${side(sign)}-`) && !byId.has(it.id)));
    }
    for (const old of wingBefore.filter(it => it.type === 'fanWall')) {
      if (same(old, byId.get(old.id))) replacements.set(old.id, { ...byId.get(old.id), hidden: false, on: false });
    }
    return [...items.map(it => replacements.get(it.id) || it), ...additions];
  }

  // Explicit adoption is separate from the conservative automatic migration.
  // Stable scope IDs come from the frozen pre-review design, never a user's
  // current positions, names or circuit membership.
  function wingReviewTargets(design, code) {
    if (!['B', 'H'].includes(code)) throw new Error('Choose wing B or H.');
    const sign = code === 'B' ? -1 : 1;
    const old = wingBefore.filter(it => Math.sign(it.pos[2]) === sign && (it.circuit === 'L8' || it.type === 'fanCeiling'));
    const targets = old.map(it => {
      const name = it.circuit === 'L8' ? it.name : `Wall fan · wing ${code} · ${it.name.endsWith('front') ? 1 : 2} · held review`;
      const raw = design.find(candidate => candidate.name === name);
      if (!raw) throw new Error('Incomplete wing review template: ' + name);
      return { ...raw, id: it.id };
    });
    return [...targets, ...design.filter(it => it.id?.startsWith(`F-WING-${code}-`))];
  }

  window.CHURCH_SIM_DESIGN = { wingReviewRevision, upgradeWingReview, wingReviewTargets, sanctuaryRevision, upgradeSanctuary, recommended, aim, upgradeLighting, lightingRevision, upgradeFacade, facadeRevision, upgradeEntrance, entranceRevision, version: '2026-10-16-tower-board' };
})();
