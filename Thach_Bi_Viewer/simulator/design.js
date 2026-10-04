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
      const p = [facadeX, 6.4, z], a = aim(p, [7.8, 0.8, s * 5.0]);
      add({ type: 'projector36', name: `Rear rows light · entrance façade · ${side(z)}`, circuit: 'L1', mount: 'wall', pos: p, mountYaw: 0, yaw: a.yaw, tilt: a.tilt, lumens: 6000, beam: 55 });
      const q = [facadeX, 5.95, z], b = aim(q, [6.2, 0.8, s * 1.2]);
      add({ type: 'projector36', name: `Rear centre light · entrance façade · ${side(z)}`, circuit: 'L1', mount: 'wall', pos: q, mountYaw: 0, yaw: b.yaw, tilt: b.tilt, lumens: 3300, beam: 50 });
    }
    // LA · hidden roof uplights on top of every tie beam.
    for (const k of [...nave, '11']) add({ type: 'uplight', name: `Roof uplight · axis ${k}`, circuit: 'LA', mount: 'floor', pos: [A[k], 9.18, 0], yaw: 90, mountYaw: 90, tilt: 90 });

    // LD · chandeliers on chains from the ridge over the side-door crossings
    // and bay 6–7, plus a grand chandelier at the crossing.
    for (const k of ['4', '6', '8']) add({ type: 'chandelier8', name: `Chandelier · bay ${k}–${Number(k) + 1}`, circuit: 'LD', mount: 'pendant', pos: [A[k] + 2.25, 6.3, 0], anchorY: lining(0) - 0.13, yaw: 0, mountYaw: 0 });
    add({ type: 'chandelier12', name: 'Grand chandelier · crossing 9–10', circuit: 'LD', mount: 'pendant', pos: [(A['9'] + A['10']) / 2, 7.2, 0], anchorY: lining(0) - 0.13, yaw: 0, mountYaw: 0 });
    // Sconces on the C/G piers, facing the nave, and on the sanctuary piers.
    for (const k of ['3', '4', '5', '6', '7', '8']) for (const s of [-1, 1]) {
      add({ type: 'sconce2', name: `Sconce · axis ${k} · ${side(s)}`, circuit: 'LD', mount: 'wall', pos: [A[k], 3.7, s * 7.07], yaw: -s * 90, mountYaw: -s * 90 });
    }
    for (const s of [-1, 1]) add({ type: 'sconce2', name: `Sconce · sanctuary pier · ${side(s)}`, circuit: 'LD', mount: 'wall', pos: [A['10'] - 0.32, 3.9, s * 3.6], yaw: 180, mountYaw: 180 });

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
    const statues = { B: [45.7, 0.15, -5.45], H: [45.7, 0.15, 5.45] };
    for (const [k, base] of Object.entries(statues)) {
      const p = [A['9'], sideBeamY - 0.005, base[2] * 1.03], a = aim(p, [base[0], 2.35, base[2]]);
      add({ type: 'spot15', name: `Statue accent · ${k}`, circuit: 'L3', mount: 'pendant', pos: p, anchorY: sideBeamY, ...a, mountYaw: a.yaw, beam: 10, lumens: 1500, shadow: false });
    }

    // L4 · a veranda lantern at every pier (axes 3–11), the rhythm of the
    // reference night view; the veranda loudspeakers hang mid-bay between them.
    for (const s of [-1, 1]) for (const k of ['3', '4', '5', '6', '7', '8', '9', '10', '11']) {
      const x = A[k];
      add({ type: 'lantern', name: `Veranda lantern · ${side(s)} · axis ${k}`, circuit: 'L4', mount: 'pendant', pos: [x, 4.55, s * 8.85], anchorY: above(x, s * 8.85, 4.55), yaw: 0, mountYaw: 0, lumens: 2000 });
    }
    // Brass sconces flanking the main door light the threshold.
    for (const s of [-1, 1]) add({ type: 'sconce2', name: `Sconce · main door · ${side(s)}`, circuit: 'LD', mount: 'wall', pos: [facadeX, 3.0, s * 2.4], yaw: 0, mountYaw: 0 });
    // E1 · exit signs.
    // Main doors: on the façade directly above the arched opening (6.67 m), visible down the nave.
    add({ type: 'exitSign', name: 'Exit sign · main doors', circuit: 'E1', mount: 'wall', pos: [facadeX, 6.95, 0], yaw: 0, mountYaw: 0 });
    for (const x of [16.725, 34.725]) for (const s of [-1, 1]) {
      add({ type: 'exitSign', name: `Exit sign · side door ${x.toFixed(1)} · ${side(s)}`, circuit: 'E1', mount: 'wall', pos: [x, 4.6, s * 7.245], yaw: -s * 90, mountYaw: -s * 90 });
    }

    // L5 · steps & paths; L6 · façade.
    for (const x of [-7.7, -14.0]) for (const s of [-1, 1]) add({ type: 'bollard', name: `Step bollard · ${x > -10 ? 'top' : 'foot'} · ${side(s)}`, circuit: 'L5', mount: 'floor', pos: [x, x > -10 ? -0.48 : -2.08, s * 9.6], yaw: 180, mountYaw: 180 });
    for (const s of [-1, 1]) add({ type: 'wallLantern', name: `Side door lantern · ${side(s)}`, circuit: 'L5', mount: 'wall', pos: [15.3, 2.25, s * 10.55], yaw: s * 90, mountYaw: s * 90 });
    for (const s of [-1, 1]) {
      const p = [-9.0, -0.48, s * 10.153], a = aim([p[0], p[1] + 0.32, p[2]], [2.45, 21, s * 10.153]);
      add({ type: 'flood', name: `Tower floodlight · ${side(s)}`, circuit: 'L6', mount: 'floor', pos: p, yaw: a.yaw, mountYaw: a.yaw, tilt: a.tilt, beam: 15, lumens: 12000 });
      const q = [-16.0, -2.08, s * 3.0], b = aim([q[0], q[1] + 0.32, q[2]], [2.4, 8.5, s * 1.5]);
      add({ type: 'flood', name: `Façade wash · ${side(s)}`, circuit: 'L6', mount: 'floor', pos: q, yaw: b.yaw, mountYaw: b.yaw, tilt: b.tilt, beam: 50, lumens: 9000 });
      const r = [27.0, -2.08, s * 18.0], c = aim([r[0], r[1] + 0.32, r[2]], [31.0, 4.0, s * 10.5]);
      add({ type: 'flood', name: `Side elevation wash · ${side(s)}`, circuit: 'L6', mount: 'floor', pos: r, yaw: c.yaw, mountYaw: c.yaw, tilt: c.tilt, beam: 50, lumens: 7000 });
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
      for (const zc of [7.9, 12.2]) strand(`tower ${side(s)} · corner ${zc < 10 ? 'inner' : 'outer'}`, [-0.36, 11.6, s * zc], 0, 21.6, 90, 'wall', 180);
      const t = [-16, SIM.floorY(-16, s * 15), s * 15], a = aim([t[0], t[1] + 0.32, t[2]], [1.0, 27.5, s * 10.3]);
      add({ type: 'flood', name: `Festival flood · tower top ${side(s)}`, circuit: 'L7', mount: 'floor', pos: t, yaw: a.yaw, mountYaw: a.yaw, tilt: a.tilt, beam: 15, lumens: 18000, on: false });
    }
    strand('front terrace between the towers', [2.15, 8.5, 0], 0, 14.8);
    for (const s of [-1, 1]) {
      const p = [64, SIM.floorY(64, s * 7), s * 7], a = aim([p[0], p[1] + 0.32, p[2]], [53.3, 11, s * 1.5]);
      add({ type: 'flood', name: `Festival flood · rear gable ${side(s)}`, circuit: 'L7', mount: 'floor', pos: p, yaw: a.yaw, mountYaw: a.yaw, tilt: a.tilt, beam: 50, lumens: 12000, on: false });
    }
    { const p = [-6, SIM.floorY(-6, 0), 0], a = aim([p[0], p[1] + 0.32, p[2]], [2.4, 15.5, 0]);
      add({ type: 'flood', name: 'Festival flood · central shrine', circuit: 'L7', mount: 'floor', pos: p, yaw: a.yaw, mountYaw: a.yaw, tilt: a.tilt, beam: 15, lumens: 8000, on: false }); }

    // Fans · 1.42 m ceiling fans mid-bay over the two side aisles (between the
    // centre and outer blocks): the 30°/40° reading beams miss the blades, and
    // nothing hangs over the processional aisle.
    for (const k of ['3', '4', '5', '6', '7', '8']) for (const s of [-1, 1]) {
      const x = A[k] + 2.25, z = s * 4.4;
      add({ type: 'fanCeiling', name: `Ceiling fan · bay ${k}–${Number(k) + 1} · ${side(s)} aisle`, circuit: 'F1', mount: 'pendant', pos: [x, 3.9, z], anchorY: lining(z) - 0.06, yaw: 0, mountYaw: 0, speed: 2,
        note: 'Long downrod from a purlin bracket with an anti-sway restraint; structural engineer to verify.' });
    }

    // Loudspeakers · a discreet distributed system: slim 0.6 m columns painted
    // the wall colour on the side-wall pilasters (axes 4–9), below the sconces,
    // turned 50° toward the back so each covers the rows behind it, and
    // time-aligned to the talker. Nothing is fixed to the timber columns.
    for (const k of ['4', '5', '6', '7', '8', '9']) for (const s of [-1, 1]) {
      add({ type: 'slimColumn', name: `Wall speaker · axis ${k} · ${side(s)}`, circuit: 'A1', mount: 'wall', pos: [A[k], 2.8, s * 7.07], yaw: -s * 140, mountYaw: -s * 90, tilt: -14, level: -6, delayMs: 0 });
    }
    for (const s of [-1, 1]) for (const x of [12.225, 25.725]) {
      add({ type: 'pendantSpeaker', name: `Veranda fill · ${side(s)} · ${x.toFixed(1)}`, circuit: 'A2', mount: 'pendant', pos: [x, 3.9, s * 8.85], anchorY: above(x, s * 8.85, 3.9), yaw: 0, mountYaw: 0, tilt: -90, level: -7 });
    }
    for (const s of [-1, 1]) {
      // On the tower fronts (x −0.14), beside the recessed central façade.
      const p = [-0.14, 6.2, s * 8.3], a = aim(p, [-24, 0, s * 5]);
      add({ type: 'horn', name: `Courtyard horn · ${side(s)}`, circuit: 'A3', mount: 'wall', pos: p, yaw: a.yaw, mountYaw: 180, tilt: a.tilt, level: -4, on: false });
    }
    add({ type: 'mic', name: 'Ambo microphone', circuit: 'MIC', mount: 'floor', pos: [42.36, 1.9, -2.62], yaw: 0, mountYaw: 0 });
    add({ type: 'mic', name: 'Altar microphone', circuit: 'MIC', mount: 'floor', pos: [44.45, 1.88, 0.45], yaw: 0, mountYaw: 0 });

    // Decoration · statues framed by the sanctuary side arches, as in the references.
    add({ type: 'statueMary', name: 'Statue · Our Lady', circuit: 'DECOR', mount: 'floor', pos: statues.B, yaw: 180, mountYaw: 180 });
    add({ type: 'statueJoseph', name: 'Statue · Saint Joseph', circuit: 'DECOR', mount: 'floor', pos: statues.H, yaw: 180, mountYaw: 180 });
    for (const s of [-1, 1]) {
      add({ type: 'flowerStand', name: `Flower stand · statue ${side(s)}`, circuit: 'DECOR', mount: 'floor', pos: [44.95, 0.15, s * 4.65], yaw: 180, mountYaw: 180 });
      add({ type: 'candleStand', name: `Votive candles · ${side(s)}`, circuit: 'DECOR', mount: 'floor', pos: [45.1, 0.15, s * 6.35], yaw: 180, mountYaw: 180 });
      add({ type: 'palm', name: `Palm · entrance ${side(s)}`, circuit: 'DECOR', mount: 'floor', pos: [6.3, 0, s * 6.55], yaw: 0, mountYaw: 0 });
      add({ type: 'banner', name: `Banner · axis 9 · ${side(s)}`, circuit: 'DECOR', mount: 'wall', pos: [A['9'] - 0.315, 6.6, s * 3.6], yaw: 180, mountYaw: 180 });
    }
    add({ type: 'paschal', name: 'Paschal candle', circuit: 'DECOR', mount: 'floor', pos: [42.05, 0.75, -1.55], yaw: 180, mountYaw: 180 });
    // Seasonal and festival items, hidden until needed.
    add({ type: 'carpet', name: 'Aisle carpet (weddings & feasts)', circuit: 'DECOR', mount: 'floor', pos: [6.2, 0, 0], yaw: 0, mountYaw: 0, hidden: true, params: { length: 32 } });
    add({ type: 'christmasTree', name: 'Christmas tree', circuit: 'X1', mount: 'floor', pos: [40.0, 0, 5.9], yaw: 180, mountYaw: 180, hidden: true });
    add({ type: 'grotto', name: 'Nativity grotto (hang đá)', circuit: 'X1', mount: 'floor', pos: [40.6, -0.32, -10.6], yaw: 90, mountYaw: 90, hidden: true });
    add({ type: 'star', name: 'Star over the crossing', circuit: 'X1', mount: 'pendant', pos: [(A['9'] + A['10']) / 2, 9.4, 0], anchorY: lining(0) - 0.13, yaw: 90, mountYaw: 90, hidden: true });
    // Festival lantern strings mid-bay, clear of the pier lanterns and of the loudspeaker bays (3–4, 6–7).
    for (const k of ['4', '5', '7', '8']) for (const s of [-1, 1]) {
      const x = A[k] + 2.25;
      add({ type: 'lanternString', name: `Red lanterns · veranda ${side(s)} · bay ${k}–${Number(k) + 1}`, circuit: 'X1', mount: 'pendant', pos: [x, 5.6, s * 8.85], anchorY: above(x, s * 8.85, 5.6), yaw: 90, mountYaw: 90, hidden: true, params: { length: 3.4 } });
    }
    for (const k of ['4', '6', '8']) add({ type: 'bunting', name: `Festival pennants · axis ${k}`, circuit: 'DECOR', mount: 'pendant', pos: [A[k], 7.2, 0], anchorY: 7.2, yaw: 0, mountYaw: 0, hidden: true, params: { length: 7 } });
    return items;
  }

  // Bump when the recommended design changes: browsers holding a layout saved
  // from an older version then load the new design (the old one is kept aside).
  window.CHURCH_SIM_DESIGN = { recommended, aim, version: '2026-10-07-wall-speakers' };
})();
