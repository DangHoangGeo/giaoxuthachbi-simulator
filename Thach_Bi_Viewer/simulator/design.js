/* Thạch Bi simulator · recommended starting design.
 *
 * Built on the as-drawn timber frame (section sheet 4): every fixture has a
 * structural anchor, and lights never sit above spinning fan blades.
 *  - Reading light: twin-head projectors (28° centre, 36° outer) tilted ±8°
 *    along the nave, on side brackets on the main tie beams and side beams in
 *    the beam lacquer; twin heads in the wall plaster on the entrance wall for
 *    the rear rows and the entrance aisle.
 *  - Air: 1.42 m ceiling fans mid-bay over the two side aisles; the reading
 *    beams are narrow enough to miss their blades.
 *  - Festival exterior (L7, off by default): bulb strings on the ridge, eaves,
 *    rear gable, front terrace and tower corners, plus tower-top floods.
 *  - Atmosphere: hidden uplights on top of the tie beams wash the timber roof;
 *    brass chandeliers and pier sconces give the evening character.
 *  - Sanctuary: key lights at ~45° for faces, accents for crucifix,
 *    tabernacle and statues.
 *  - Speech: slim wall-coloured columns in the corners where the side-wall
 *    piers (axes 4–9) meet the walls, time-aligned; veranda pendants for
 *    overflow; courtyard horns off.
 *  - Towers: cornice-coloured light bars and compact floods on the cornice
 *    ledges, behind the lips where they wash upward.
 * Values are a planning starting point to test, not an engineered design.
 */
(() => {
  'use strict';
  const aim = (from, to) => {
    const dx = to[0] - from[0], dy = to[1] - from[1], dz = to[2] - from[2];
    return { yaw: Math.atan2(dz, dx) * 180 / Math.PI, tilt: Math.atan2(dy, Math.hypot(dx, dz)) * 180 / Math.PI };
  };
  const side = z => z < 0 ? 'B' : 'H';
  // Where a ledge fitting's optic sits: `reach` beyond its base along mountYaw, `rise` above it.
  const lensAt = (p, mountYaw, reach, rise) => {
    const r = mountYaw * Math.PI / 180;
    return [p[0] + reach * Math.cos(r), p[1] + rise, p[2] + reach * Math.sin(r)];
  };
  // Façade niches of the church's CAD file of 23 Oct 2026 (DWG sheet 1, E01B), adopted by the
  // owner on 24 Oct 2026; built in facade.js. Each row: code, statue type, name, Z, pedestal top,
  // niche crown, face height, niche half-width, jamb mid-height, jamb light length, statue X,
  // lip X. Side niches: 1,198 mm wide, springing +12.308; central niche: 1,422 mm wide,
  // springing +18.893, on the aedicule over the upper storey.
  const facadeNiches = [
    ['C', 'statueAssumption', 'Assumption of Our Lady', 0, 16.683, 19.604, 18.98, 0.711, 17.79, 2.0, 4.08, 3.95],
    ['B', 'statuePeter', 'Saint Peter', -5.35, 10.391, 12.907, 12.03, 0.599, 11.35, 1.3, 4.15, 4.05],
    ['H', 'statuePaul', 'Saint Paul', 5.35, 10.391, 12.907, 12.03, 0.599, 11.35, 1.3, 4.15, 4.05]];
  // The niches of the traced PDF facade (three gables) these replaced, for the one-time move.
  const facadeNichesBefore = [
    ['C', 'statueAssumption', 'Assumption of Our Lady', 0, 11.8, 15.63, 14.1, 0.925, 13.3, 2.0, 2.29, 2.13],
    ['B', 'statuePeter', 'Saint Peter', -5.48, 10.08, 12.61, 11.72, 0.525, 11.05, 1.3, 2.29, 2.13],
    ['H', 'statuePaul', 'Saint Paul', 5.48, 10.08, 12.61, 11.72, 0.525, 11.05, 1.3, 2.29, 2.13]];
  // Statue, three hidden lines and two candles per niche, as placed for a row above.
  function nicheFittings([code, type, name, z, base, crown, face, half, mid, length, nicheX, lipX]) {
    const out = [{ id: `D-FACADE-${code}`, type, name: `Façade statue · ${name}`, circuit: 'DECOR', mount: 'floor', pos: [nicheX, base, z], yaw: 180, mountYaw: 180,
      note: `${code === 'C' ? 'USER CONFIRMED subject and place.' : 'PROPOSED subject; owner to confirm the two saints.'} Generated figure on the drawn niche pedestal. Sculptor, size, material, weight and fixing pending.` }];
    const top = [lipX, crown + 0.01, z], down = aim(top, [nicheX - 0.09, face, z]);
    out.push({ id: `L-STATUE-${code}-ARCH`, type: 'nicheArchLine', name: `Hidden arch light · ${name}`, circuit: 'L10', mount: 'wall', pos: top, yaw: down.yaw, tilt: down.tilt, mountYaw: 180, lumens: code === 'C' ? 440 : 300, beam: 60, shadow: false, params: { length: code === 'C' ? 0.8 : 0.5 },
      note: 'CONCEPT: light line in a slot behind a matching lip under the arch; no lamp is seen. Slot, weatherproof product, driver place and access pending.' });
    for (const e of [-1, 1]) {
      const p = [lipX, mid, z + e * (half - 0.02)], a = aim(p, [nicheX + 0.16, mid, z]);
      out.push({ id: `L-STATUE-${code}-JAMB-${e < 0 ? '1' : '2'}`, type: 'nicheJambLine', name: `Hidden jamb light · ${name} · ${e < 0 ? 'B' : 'H'} side`, circuit: 'L10', mount: 'wall', pos: p, yaw: a.yaw, tilt: a.tilt, mountYaw: -e * 90, lumens: code === 'C' ? 260 : 140, beam: 80, shadow: false, params: { length },
        note: 'CONCEPT: light line in a slot behind a matching lip at the front edge of the jamb; no lamp is seen. Slot, weatherproof product, driver place and access pending.' });
      // The central pedestal of the CAD drawing is 0.93 m wide, so its candles stand at the
      // front corners, ahead of the cloud plinth; the side candles stand beside the feet.
      const candle = code === 'C' && nicheX > 3 ? [nicheX - 0.36, base, z + e * 0.30] : [nicheX - 0.19, base, z + e * (code === 'C' ? 0.47 : 0.31)];
      out.push({ id: `L-STATUE-${code}-CANDLE-${e < 0 ? '1' : '2'}`, type: 'nicheCandle', name: `Statue candle light · ${name} · ${e < 0 ? 'B' : 'H'} side`, circuit: 'L10', mount: 'floor', pos: candle, yaw: 180, mountYaw: 180,
        note: 'USER CONFIRMED: two candle lights on the base of each statue. CONCEPT electric candle; product, weather protection, fixing and lamp access pending.' });
    }
    return out;
  }
  // Upper façade washes from the towers' +15.84 m cornices: aimed at the face of the CAD file's
  // niche aedicule (front +3.805 m), which stands 1.6 m behind the gables they lit before.
  const CROWN_WASH_TARGET = [3.85, 19.6, 0], CROWN_WASH_TARGET_BEFORE = [2.2, 18.6, 0];

  function recommended(GEO, SIM) {
    const A = GEO.axes, items = [];
    // Stamp every original slot before retiring items, so downstream IDs never shift.
    const add = o => {
      const cat = window.CHURCH_SIM_CATALOG.byId[o.type].cat;
      const prefix = { light: 'L', fan: 'F', speaker: 'S', decor: 'D', power: 'P' }[cat] || 'X';
      items.push({ ...o, id: o.id || prefix + (items.length + 1) });
    };
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

    // L1/L2 · reading light: twin-head projectors on the main tie beams
    // (central blocks, 28°) and the side beams (outer blocks, 36°), the heads
    // tilted ±8° along the nave so the mid-bay rows are lit as well as the rows
    // under the beams. Narrow optics keep the beams off the side-aisle fan blades.
    // Owner, 19 October 2026: the reading lights take the colour of the timber and
    // should look hidden. Each head is a compact projector on a side bracket fixed
    // to the sanctuary-facing face of its beam, finished in the beam's own lacquer.
    // The body stands beside the beam and only its glare cowl reaches the soffit, so
    // from most seats behind a beam the beam itself screens it. On a tie beam the two
    // heads flank the gilded band at ±2.60 m, the one aimed toward the sanctuary on the
    // inner side, away from the side-aisle fan ahead of it; on a side beam they stand
    // either side of the gilded cartouche (4.96–6.00 m), both aimed at the old point
    // under the beam.
    // Fixing into the timber, the bracket and the product are ENGINEERING HOLD.
    const readingHead = (name, circuit, beam, faceX, soffit, z, target) => {
      const p = [faceX, soffit + 0.18, z], a = aim([faceX + 0.085, soffit, z], target);
      add({ type: 'readingProjector', name, circuit, mount: 'wall', pos: p, anchorY: soffit, ...a, mountYaw: 0, lumens: 2300, beam, params: { finish: 'timber' } });
    };
    // Since the side-aisle fans hang from the column-line beams (19 October 2026), a
    // tie-beam head aimed toward a bay with such a fan tilts 5° along the nave with a
    // 24° optic (8° and 28° before), which keeps its beam off the blades.
    const facesBeamFan = (k, dir) => dir > 0 ? +k <= 8 : +k >= 4;
    const reading = (k, s, block) => {
      const tie = block === 'central', soffit = tie ? beamY : sideBeamY, faceX = A[k] + (tie ? 0.15 : 0.11);
      for (const [dir, tag] of [[1, ''], [-1, ' · twin']]) {
        const z = tie ? s * (2.6 - dir * 0.12) : s * (dir > 0 ? 6.09 : 4.84), fan = tie && facesBeamFan(k, dir);
        const along = Math.tan((fan ? 5 : 8) * Math.PI / 180) * (soffit - 0.8);
        readingHead(`Reading light · axis ${k} · ${side(s)} ${block}${tag}`, tie ? 'L1' : 'L2', tie ? (fan ? 24 : 28) : 36, faceX, soffit, z, [A[k] + dir * along, 0.8, s * (tie ? 2.6 : 5.6)]);
      }
    };
    for (const k of nave) for (const s of [-1, 1]) reading(k, s, 'central');
    for (const k of nave) for (const s of [-1, 1]) reading(k, s, 'outer');
    // Rear rows · bay 2′–3 has no tie beam, so twin-head brackets on the inner
    // face of the entrance façade light the last rows, the centre seats and the
    // entrance aisle (solid wall between the main door and the side doors). The
    // same compact projector, finished in the wall plaster (19 October 2026).
    for (const z of [-4.2, 4.2]) {
      const s = Math.sign(z);
      const p = [facadeX, 3.45, z], a = aim(p, [8.2, 0.8, s * 5.0]);
      add({ type: 'readingProjector', name: `Rear rows light · entrance façade · ${side(z)}`, circuit: 'L1', mount: 'wall', pos: p, mountYaw: 0, yaw: a.yaw, tilt: a.tilt, lumens: 6000, beam: 44, params: { finish: 'wall' } });
      const q = [facadeX, 5.95, z], b = aim(q, [6.2, 0.8, s * 1.2]);
      add({ type: 'readingProjector', name: `Rear centre light · entrance façade · ${side(z)}`, circuit: 'L1', mount: 'wall', pos: q, mountYaw: 0, yaw: b.yaw, tilt: b.tilt, lumens: 3300, beam: 50, params: { finish: 'wall' } });
    }
    // L8 · held wing review, 9 October. Smaller brass chandeliers match the
    // owner's intent; a separate downward optic supplies task light. The rear
    // row stays inward of the existing speaker/support envelope. No selected
    // photometry, mounting design, glare or concealment approval exists.
    for (const sign of [-1, 1]) for (const x of [38.94, 42.22]) {
      for (const [z, rows] of [[10.6, 'back'], [8.8, 'front']]) {
        add({ type: 'chandelier6Reading', name: `Wing light · ${side(sign)} · ${x < 40.5 ? 'front' : 'rear'} block · ${rows} rows`, circuit: 'L8', mount: 'pendant',
          pos: [x, 3.8, sign * 10.15], anchorY: above(x, sign * 10.15, 3.85), yaw: 0, mountYaw: 0, tilt: -90, lumens: 5640, beam: 100, cct: 2700,
          note: 'HELD two-light wing concept: unchanged 5640 lm/51 W assembly. Some wing book points remain below200 lux. Photometry, glare, thermal design, support and maintenance pending. See docs/engineering/wing-review.md.' });
      }
    }
    // LA · hidden roof uplights on top of every tie beam. Axis 10 carries the
    // lobed sanctuary frame instead of a tie; the vault behind it has its own.
    for (const k of nave) add({ type: 'uplight', name: `Roof uplight · axis ${k}`, circuit: 'LA', mount: 'floor', pos: [A[k], 9.18, 0], yaw: 90, mountYaw: 90, tilt: 90 });

    // LD · chandeliers on chains from the ridge over the side-door crossings
    // and bay 6–7, plus a grand chandelier at the crossing.
    // Owner, 19 October 2026: the three nave chandeliers hang 1.0 m higher (the 6.3 m of
    // 4 October was an initial value with no recorded reason). Candles now at about
    // +6.85 m and the lowest point about +6.2 m: above the side beams (+6.66 soffit) and
    // below the tie beams (+8.59 soffit), mid-bay between them. The chain shortens; the
    // anchor stays. No seat's line to the crucifix or altar crosses them (saved seat plan,
    // 576 nave seats, eye +1.2 m) at any height from 6.3 to 8.3 m.
    for (const k of ['4', '6', '8']) add({ type: 'chandelier8', name: `Chandelier · bay ${k}–${Number(k) + 1}`, circuit: 'LD', mount: 'pendant', pos: [A[k] + 2.25, NAVE_CHANDELIER_Y, 0], anchorY: lining(0) - 0.13, yaw: 0, mountYaw: 0 });
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
    // and points away from the congregation. They take the beam lacquer like the
    // reading lights beside them (19 October 2026), so the tie shows no black heads.
    const outside = (name, type, z, y, target, o) => {
      const p = [A['9'], y - 0.005, z], a = aim(p, target);
      add({ type, name, circuit: 'L3', mount: 'pendant', pos: p, anchorY: y, ...a, mountYaw: a.yaw, params: { finish: 'timber' }, ...o });
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
    // behind the front frame, hidden from the nave by the axis-10 columns. They and
    // the vault uplights take the chamber's own lacquer (owner, 19 October 2026: all
    // the sanctuary lights), which stays red whatever the structural timber tone.
    const inside = (name, type, y, s, target, o) => {
      const p = [chamber.lightX, y, s * chamber.face], a = aim(p, target);
      add({ type, name, circuit: 'L3', mount: 'wall', pos: p, yaw: a.yaw, tilt: a.tilt, mountYaw: -s * 90, shadow: false, params: { finish: 'chamber' }, ...o });
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
      add({ type: 'uplight', name: `Sanctuary vault uplight · ${side(s)}`, circuit: 'L3', mount: 'floor', pos: u, ...ua, mountYaw: ua.yaw, lumens: 2200, params: { finish: 'chamber' } });
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
    const TX = 2.45, TZ = 10.153;
    // Festival flood on a veranda roof corner (L7, rear gable).
    const ledgeFlood = (name, circuit, p, target, beam, lumens, on = true) => {
      const a = aim([p[0], p[1] + 0.32, p[2]], target);
      add({ type: 'flood', name, circuit, mount: 'floor', pos: p, yaw: a.yaw, mountYaw: a.yaw, tilt: a.tilt, beam, lumens, on });
    };
    // Towers, revised 19 October 2026 (owner: the tower floods should be barely
    // noticed, not black and not where they were). The black floods on 0.5 m arms
    // give way to fittings in the colour of the cornice mouldings, about 0.11–0.15 m
    // tall, lying on the cornice ledges. A light bar washing the stage above lies
    // along the lip with its optic 0.06 m beyond it, just in front of the engaged
    // columns, so that their fronts and the louvres are lit as before; its two light
    // points sit in the bays either side of the central mullion. The washes over the
    // porch arches are compact floods at the free end of the same lip. Ledge, lip and
    // wall lines are ray casts on the current tower meshes (MODEL TRANSCRIPTION):
    //   ledge top   front lip / wall      side lip / wall (|z| − TZ)
    //   +8.39 m     x −0.38 / −0.05       2.83 / 2.465
    //   +15.84 m    x −0.29 / +0.05       2.705 / 2.365
    //   +23.14 m    x −0.19 / +0.335      2.605 / 2.09
    // Products, optics, fixings, weathering and safe access at height: ENGINEERING HOLD.
    const towerBar = (name, p, mountYaw, target, beam, lumens, length, reach = 0) => {
      const a = aim(lensAt(p, mountYaw, reach, 0.055), target);
      add({ type: 'ledgeBar', name, circuit: 'L6', mount: 'floor', pos: p, yaw: a.yaw, tilt: a.tilt, mountYaw, beam, lumens, cct: 3000, params: { length, outreach: reach } });
    };
    const towerFlood = (name, circuit, p, mountYaw, target, beam, lumens, reach = 0) => {
      const a = aim(lensAt(p, mountYaw, reach, 0.075), target);
      add({ type: 'ledgeFlood', name, circuit, mount: 'floor', pos: p, yaw: a.yaw, tilt: a.tilt, mountYaw, beam, lumens, params: { outreach: reach } });
    };
    // Bar origin 0.04 m behind the lip, optic 0.06 m beyond it (front x / side |z| − TZ).
    // The belfry bars take a 30° optic (was 40°): from the lip that keeps the light
    // on the belfry face rather than the sky above it.
    const front = lip => lip + 0.04, flank = lip => lip - 0.04;
    for (const s of [-1, 1]) {
      const z = s * TZ, out = d => s * (TZ + d);
      towerFlood(`Tower lower front wash · ${side(s)}`, 'L6', [-0.34, 8.39, out(1.3)], 180, [-0.28, 6.3, z], 50, 3500, 0.12);
      towerBar(`Tower stage 2 flood · ${side(s)}`, [front(-0.38), 8.39, z], 180, [-0.05, 13.5, z], 40, 7000, 2.0, 0.10);
      towerBar(`Tower stage 3 flood · ${side(s)}`, [front(-0.29), 15.84, z], 180, [0.05, 20.6, z], 40, 6000, 2.0, 0.10);
      towerBar(`Belfry front wash · ${side(s)}`, [front(-0.19), 23.14, z], 180, [0.335, 27.3, z], 30, 4500, 1.8, 0.10);
      // The dome from the 0.15 m ledge on the top cornice (+29.09 m), in front of the
      // balcony plinth and no higher than its step, head 0.06 m beyond the lip. Behind
      // the balustrade the drum leaves no room at the centre, and from the sides the
      // flood barely reaches the front of the dome (median 0 lux on its visible face).
      // Lower and closer than the old arm head, it takes 4 000 lm (was 2 500) for a
      // median about 90 % of before; the balustrade rail shades the lowest band of the
      // dome from this height (not in the light calculation).
      towerFlood(`Dome front wash · ${side(s)}`, 'L6', [0.14, 29.09, z], 180, [0.6, 30.3, z], 36, 4000, 0.12);
      add({ type: 'uplight', name: `Belfry glow · ${side(s)}`, circuit: 'L6', mount: 'floor', pos: [TX, 23.2, s * TZ], yaw: 0, mountYaw: 0, tilt: 90, lumens: 2500, cct: 2700 });
      towerFlood(`Tower lower side wash · ${side(s)}`, 'L6', [TX + 1.3, 8.39, out(2.79)], s * 90, [TX, 6.3, out(2.73)], 50, 2500, 0.12);
      towerBar(`Tower stage 2 side wash · ${side(s)}`, [TX, 8.39, out(flank(2.83))], s * 90, [TX, 13.5, out(2.465)], 40, 5000, 2.0, 0.10);
      towerBar(`Tower stage 3 side wash · ${side(s)}`, [TX, 15.84, out(flank(2.705))], s * 90, [TX, 20.6, out(2.365)], 40, 4000, 2.0, 0.10);
      towerBar(`Belfry side wash · ${side(s)}`, [TX, 23.14, out(flank(2.605))], s * 90, [TX, 27.3, out(2.09)], 30, 3000, 1.8, 0.10);
      // The doors and lower façade between the towers, from the inner corner of
      // each tower's first cornice, across its inner lip (|z| 7.32).
      towerFlood(`Façade wash · ${side(s)}`, 'L6', [-0.15, 8.39, s * 7.40], -s * 90, [2.4, 2.5, s * 1.5], 50, 6000, 0.15);
    }

    // L5 · downlights fixed high on the building for the open spaces: the
    // front stage (events) from the tower cornices, and the walkways around the
    // church from the arcade piers, the wing gables and the rear wall.
    const down = (name, p, target, beam, lumens, mount = 'floor', mountYaw) => {
      const a = aim(p, target);
      add({ type: mount === 'floor' ? 'flood' : 'projector36', name, circuit: 'L5', mount, pos: p, yaw: a.yaw, mountYaw: mountYaw ?? a.yaw, tilt: a.tilt, beam, lumens });
    };
    for (const s of [-1, 1]) {
      // The front stage from the towers' first cornices, across the front lip.
      for (const dz of [-1.7, 1.7]) towerFlood(`Stage flood · tower ${side(s)} · ${dz * s < 0 ? 'inner' : 'outer'}`, 'L5', [-0.30, 8.39, s * TZ + dz], 180, [-4.6, -0.48, s * (dz * s < 0 ? 2.2 : 7.5)], 45, 9000, 0.15);
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
    // Overlapping lower and upper washes cover the central facade: the lower pair the
    // upper storey over the doors, the upper pair the CAD file's niche aedicule and its
    // cross (+24.65 m; until 24 October 2026 the traced gables and the +21.72 m cross).
    // Both pairs stand on the towers' inner front cornices, set back behind the
    // lips beside the corner pilasters (19 October 2026: cornice colour, compact).
    for (const s of [-1, 1]) {
      towerFlood(`Central gable flood · ${side(s)}`, 'L6', [-0.15, 8.39, s * 7.70], -s * 90, [2.2, 12.8, -s * 0.8], 60, 6500);
      towerFlood(`Central crown wash · ${side(s)}`, 'L6', [-0.10, 15.84, s * 7.70], -s * 90, CROWN_WASH_TARGET, 55, 6000);
    }

    // Fans · 1.42 m ceiling fans mid-bay over the two side aisles, nothing over
    // the processional aisle. Owner, 19 October 2026: for safety the fans hang
    // from the column-line beams that join the timber columns (B03, soffit
    // +8.73 m), mid-span, on the D/E column lines (Z ±3.60, were ±4.40 from purlin
    // brackets under the lining). The owner then asked for the fans a little higher:
    // the hub rises 0.30 m to +4.20 m (blades about +4.0 m, below the 4.2 m blade
    // height where seated air falls off), so the downrod is 4.53 m (5.13 m before).
    // Bay 2′–3 has no column-line beam, so its two fans keep their purlin brackets
    // and only rise with the others. B03 is
    // a visualization proxy: its section, connections and the fan's static,
    // dynamic and torque loads on it are ENGINEERING HOLD. Trade-offs measured in
    // docs/engineering/fans-on-column-beams.md: the centre blocks get more air,
    // the outer blocks less, and the tie-beam reading lights now cross the blades.
    for (const k of ['2′', '3', '4', '5', '6', '7', '8']) for (const s of [-1, 1]) {
      const back = k === '2′', x = back ? (A['2′'] + A['3']) / 2 : A[k] + 2.25, z = s * (back ? 4.4 : 3.6), bay = back ? '2′–3' : `${k}–${Number(k) + 1}`;
      add({ type: 'fanCeiling', name: `Ceiling fan · bay ${bay} · ${side(s)} aisle`, circuit: 'F1', mount: 'pendant', pos: [x, 4.2, z], anchorY: back ? lining(z) - 0.06 : 8.73, yaw: 0, mountYaw: 0, speed: 2,
        note: back ? 'Long downrod from a purlin bracket with an anti-sway restraint; structural engineer to verify.'
          : 'Downrod from a hanger under the column-line beam B03 at mid-span, with an anti-sway restraint. B03 section, connections and fan loads: structural engineer to verify.' });
    }

    // Held wing wall-fan comparison. Keep the original four item slots so
    // existing equipment IDs remain stable; append the extra four at the end.
    const wingFan = (sign, index) => {
      const x = index === 0 ? 38.05 : 43.10;
      const pos = [x, 4.05, sign * 13.06];
      return { type: 'fanWingWall', name: `Wall fan · wing ${side(sign)} · ${index + 1} · held review`, circuit: 'F5', mount: 'wall', pos, mountYaw: -sign * 90,
        ...aim(pos, [index === 0 ? 38.94 : 42.22, 0.28, sign * 10.15]), speed: 1, on: true, hidden: false,
        note: 'ENGINEERING HOLD: two fans per wing above window openings, clear of central saints strip. Same catalog flow/power/noise; extended bracket proxy unverified. Air, noise, speech, mounting, concealment and maintenance remain held.' };
    };
    for (const sign of [-1, 1]) for (const index of [0, 1]) add(wingFan(sign, index));
    // Preserve the original six numeric slots; append ten named IDs below.
    // Display visibility is separate from operation: full service keeps F2 off.
    for (const k of ['4', '6', '8']) for (const sign of [-1, 1]) {
      add({ type: 'fanNaveWall', name: `Wall fan · axis ${k} · ${side(sign)}`, circuit: 'F2', mount: 'wall', pos: [A[k], 5.55, sign * 7.07], yaw: -sign * 90, mountYaw: -sign * 90, tilt: -38, speed: 1, hidden: false, on: false });
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
    // roof; fresh air comes in through the doors and windows. Four high
    // in the front gable (V1), two in the end gable of each 9–10 wing (V2), and
    // one over the service room behind the sanctuary wall (V3). Three circuits
    // since 18 October 2026: one 1,530 W circuit with an 86 m path to the front
    // gable needed 10 mm² in the review's hotter case; each zone passes at
    // 2.5 mm². The gable row is evenly
    // spaced about the ridge line on the wall's inner face (x 5.475), 0.70 m
    // above the terrace slab and 0.60 m below the roof lining at its outer corners.
    for (const z of [-2.4, -0.8, 0.8, 2.4]) add({ type: 'fanExhaust', name: `Exhaust fan · front gable · ${side(z)} ${Math.abs(z) > 2 ? 'outer' : 'inner'}`, circuit: 'V1', mount: 'wall', pos: [5.48, 9.4, z], yaw: 0, mountYaw: 0, speed: 1 });
    for (const s of [-1, 1]) for (const x of [39.7, 41.45]) add({ type: 'fanExhaust', name: `Exhaust fan · wing gable ${side(s)} · ${x < 40.5 ? 'front' : 'rear'}`, circuit: 'V2', mount: 'wall', pos: [x, 7.6, s * 13.13], yaw: -s * 90, mountYaw: -s * 90, speed: 1 });
    add({ type: 'fanExhaust', name: 'Exhaust fan · service room', circuit: 'V3', mount: 'wall', pos: [53.12, 3.3, 0], yaw: 180, mountYaw: 180, speed: 1 });

    // Loudspeakers · a discreet distributed system: slim 0.6 m columns painted
    // the wall colour beside the side-wall piers (axes 4–9), at 3.45 m between
    // the heights of the Stations of the Cross plaques (2.2–2.9 m) and the
    // sconces (4.6 m), turned 50° toward the back so each covers the rows behind
    // it, and time-aligned to the talker. Nothing is fixed to the timber columns.
    // Owner, 19 October 2026: off the concrete piers, into the corners where the
    // piers meet the walls, for a more open look. Each column now stands on the
    // masonry wall (Z ±7.25) on the entrance side of its pier, within the pier's
    // 0.18 m projection (the tilted top end stands about 35 mm proud of the pier
    // face), so the pier face keeps only its Station of the Cross and its sconce.
    // It still faces the rows behind it; the pier is at its back and does not
    // shade it. Moved off the pier the columns sit 0.18 m further from the outer
    // seats, so they tilt 22° down instead of 18°: in the seat calculation that
    // keeps nave clarity and the microphone margins at least as good as on the
    // piers (wing clarity is 0.01 lower; see docs/engineering/hidden-fittings.md).
    // Tilted and turned 50°, the column's lower end swings toward the pier: at
    // X axis − 0.43 m it clears the pier side by about 20 mm (the 0.58 m shaft is
    // an illustrative width). Fixing, tilt bracket, cable entry and the final pier
    // width: ENGINEERING HOLD.
    for (const k of ['4', '5', '6', '7', '8', '9']) for (const s of [-1, 1]) {
      add({ type: 'slimColumn', name: `Wall speaker · axis ${k} · ${side(s)}`, circuit: 'A1', mount: 'wall', pos: [A[k] - 0.43, 3.45, s * 7.25], yaw: -s * 140, mountYaw: -s * 90, tilt: -22, level: -6, delayMs: 0 });
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
      if (x < 40.5) {
        // Keep the original slot until all IDs are stamped; retire it below.
        add({ type: 'pendantSpeaker', name: `Wing speaker · ${side(s)} · front block`, circuit: 'A1', mount: 'pendant', pos: p, anchorY: above(x, s * 11.6, 3.0), yaw: a.yaw, mountYaw: 0, tilt: a.tilt, level: -10, delayMs: 0 });
      } else add({ type: 'slimColumn', name: `Wing speaker · ${side(s)} · toward entrance · held`, circuit: 'A1', mount: 'wall', pos: [43.72, 4.85, s * 13.06], anchorY: 4.85, yaw: 180, mountYaw: -s * 90, tilt: -50, level: -6, delayMs: s < 0 ? 22.9 : 37.1,
        note: 'ENGINEERING HOLD: two total wall speakers toward entrance (-X), raised for full fan/return-wall envelope clearance. Speech and feedback still require coordinated validation; product, concealment, fixing and commissioning pending.' });
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
    // Fittings that stand on the dais follow its level (+0.80 since the CAD file of 23 Oct 2026).
    add({ type: 'mic', name: 'Ambo microphone', circuit: 'MIC', mount: 'floor', pos: [amboX - 0.22, 1.9 + DAIS_RISE, -2.62], yaw: 0, mountYaw: 0 });
    add({ type: 'mic', name: 'Altar microphone', circuit: 'MIC', mount: 'floor', pos: [44.45, 1.88 + DAIS_RISE, 0.45], yaw: 0, mountYaw: 0 });

    // Decoration · statues in the raised shrine niches on the column line, as in the approved concept.
    add({ type: 'statueMary', name: 'Statue · Our Lady', circuit: 'DECOR', mount: 'floor', pos: statues.B, yaw: 180, mountYaw: 180 });
    add({ type: 'statueJoseph', name: 'Statue · Saint Joseph', circuit: 'DECOR', mount: 'floor', pos: statues.H, yaw: 180, mountYaw: 180 });
    for (const s of [-1, 1]) {
      // Tall items stay out of the wing benches' view of the altar, celebrant and
      // ambo (checked seat by seat), and nothing stands on the way to the shrines:
      // flowers beside the tabernacle and a palm in each front corner of the
      // chamber beside the column, as in the concept. No votive candle stands.
      add({ type: 'flowerStand', name: `Flower stand · tabernacle ${side(s)}`, circuit: 'DECOR', mount: 'floor', pos: [47.2, DAIS_Y, s * 1.15], yaw: 180, mountYaw: 180 });
      add({ type: 'palm', name: `Palm · sanctuary ${side(s)}`, circuit: 'DECOR', mount: 'floor', pos: [sanctuary.chamber.x0 + 0.66, DAIS_Y, s * 2.9], yaw: 0, mountYaw: 0 });
      for (const e of [-1, 1]) add({ type: 'floorFlowers', name: `Shrine flowers · ${side(s)} · ${e * s < 0 ? 'inner' : 'outer'}`, circuit: 'DECOR', mount: 'floor', pos: [shrine.x - 0.05, shrine.y, s * shrine.z + e * 0.7], yaw: 180, mountYaw: 180 });
      add({ type: 'palm', name: `Palm · entrance ${side(s)}`, circuit: 'DECOR', mount: 'floor', pos: [6.3, 0, s * 6.55], yaw: 0, mountYaw: 0 });
      add({ type: 'banner', name: `Banner · axis 9 · ${side(s)}`, circuit: 'DECOR', mount: 'wall', pos: [A['9'] - 0.315, 6.6, s * 3.6], yaw: 180, mountYaw: 180 });
    }
    add({ type: 'paschal', name: 'Paschal candle', circuit: 'DECOR', mount: 'floor', pos: [amboX - 0.53, DAIS_Y, -1.55], yaw: 180, mountYaw: 180 });
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
    for (const sign of [-1, 1]) for (const [saint, type, x] of [['PETER', 'saintPeterPicture', 39.7], ['PAUL', 'saintPaulPicture', 41.45]]) {
      add({ id: `D-WING-${side(sign)}-${saint}`, type, name: `Saint ${saint === 'PETER' ? 'Peter' : 'Paul'} picture · wing ${side(sign)} · concept`, circuit: 'DECOR', mount: 'wall',
        pos: [x, 2.2, sign * 13.095], yaw: -sign * 90, mountYaw: -sign * 90, on: true, hidden: false,
        note: 'USER CONFIRMED subjects/location: Peter and Paul between windows in each wing. CONCEPT 1.12 ×1.62 m frame proxy, Y2.20 centre. Actual size, height, substrate, frame, artwork and fixings pending. Unpowered.' });
    }
    for (const k of ['2′', '3', '5', '7', '9']) for (const sign of [-1, 1]) {
      add({ id: `F-NAVE-${side(sign)}-${k === '2′' ? '2P' : k}`, type: 'fanNaveWall', name: `Wall fan · axis ${k} · ${side(sign)}`, circuit: 'F2', mount: 'wall',
        pos: [A[k], 5.55, sign * 7.07], yaw: -sign * 90, mountYaw: -sign * 90, tilt: -38, speed: 1, hidden: false, on: false });
    }
    // Socket outlets, 9 October 2026 (owner request). One 16 A radial per side
    // from DB-1 serves that side's sanctuary and mid-nave points along the wall
    // band the other circuits already use, so a trip on one side leaves the
    // opposite outlet at each place live. Each tower has its own 32 A event
    // circuit at DB-2, isolated outside events. Ratings, accessories, heights
    // and fixing into piers/walls are provisional and on ENGINEERING HOLD.
    for (const sign of [-1, 1]) {
      const code = side(sign);
      add({ id: `P-SANCT-${code}`, type: 'socketDouble', name: `Socket · sanctuary side ${code} · axis 10 pier`, circuit: sign < 0 ? 'P1' : 'P2', mount: 'wall',
        pos: [43.89, 0.85, sign * 7.25], yaw: 180, mountYaw: 180,
        note: 'CONCEPT: pier face toward the nave, 0.69 m above the side platform (+0.16) and 1.17 m above the wing floor. Surface or casing box; no chase into the structural pier. ENGINEERING HOLD.' });
      add({ id: `P-NAVE-${code}`, type: 'socketDouble', name: `Socket · mid-nave side ${code} · axis 6`, circuit: sign < 0 ? 'P1' : 'P2', mount: 'wall',
        pos: [22.83, 0.45, sign * 7.25], yaw: -sign * 90, mountYaw: -sign * 90,
        note: 'CONCEPT: masonry wall between the window and the axis-6 pier, 0.45 m above the nave floor, reached between the bench rows. Not in the structural pier. ENGINEERING HOLD.' });
      add({ id: `P-TOWER-${code}`, type: 'socketEvent', name: `Event power · tower ${code} · inside the porch`, circuit: sign < 0 ? 'P3' : 'P4', mount: 'wall',
        pos: [0.45, 1.3, sign * 7.85], yaw: sign * 90, mountYaw: sign * 90, on: false,
        note: 'CONCEPT: inside the tower porch on the front pier, hidden from the front view, 1.3 m above the tower floor. Own 32 A circuit at DB-2, isolated outside events. Supply and feeder size on ENGINEERING HOLD.' });
    }
    // Façade niche statues, 9 October 2026 (owner request). The Assumption stands
    // on the pedestal of the central niche between the towers, with Saint Peter (B)
    // and Saint Paul (H) in the side niches. Owner direction the same day: no visible
    // lamps at the statues, and two candle lights on each base. Each niche is lit by
    // three concealed lines on circuit L10 at DB-2: one under the arch for the face and
    // one behind a lip on each jamb, so the niche glows and the figure stands in soft
    // relief. The electric candles stand on the pedestal top at the feet and share L10.
    // Statues (L10), towers and façade (L6) and the open front stage (L9) switch
    // separately. Since 24 October 2026 the niches are those of the church's CAD file
    // (facadeNiches above): the side niches on the upper storey at +10.391, the central
    // one in the aedicule at +16.683. Subjects of the side figures, sizes, sculptor,
    // weights, fixings, slots, lamps and drivers are proposals: CONCEPT / ENGINEERING HOLD.
    for (const row of facadeNiches) nicheFittings(row).forEach(add);
    return items.filter(it => ![...wingSoundRetiredIds, ...wingReviewRetiredIds].includes(it.id));
  }

  // Additive one-time issue for saved layouts, as for the outlets below.
  const facadeStatueRevision = '2026-10-09-facade-statues-3-concealed-light-candles';
  const facadeStatueIds = ['C', 'B', 'H'].flatMap(code => [`D-FACADE-${code}`, `L-STATUE-${code}-ARCH`, `L-STATUE-${code}-JAMB-1`, `L-STATUE-${code}-JAMB-2`, `L-STATUE-${code}-CANDLE-1`, `L-STATUE-${code}-CANDLE-2`]);
  function upgradeFacadeStatues(items, design, scene = {}) {
    return [...items, ...design.filter(it => facadeStatueIds.includes(it.id) && !items.some(have => have.id === it.id)).map(it => ({ ...it }))];
  }

  // Central façade of the CAD file of 23 Oct 2026, adopted by the owner on 24 Oct 2026: the
  // niches move back and up (facade.js), so the statues, their hidden lines and candles move
  // with them, and the two upper washes re-aim at the new aedicule. Only a fitting still at its
  // previous recommended place (and aim) moves; one the user moved or re-aimed stays as it is,
  // a deleted one stays deleted, and switching, dimming and circuits are kept.
  const facadeCadRevision = '2026-10-24-cad-facade-1';
  const near = (a, b, tol) => Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((v, i) => Math.abs(v - b[i]) <= tol);
  function upgradeFacadeCad(items, design) {
    const before = new Map(facadeNichesBefore.flatMap(nicheFittings).map(it => [it.id, it]));
    const next = new Map(design.map(it => [it.id, it])), byName = new Map(design.map(it => [it.name, it]));
    return items.map(it => {
      const old = before.get(it.id), raw = next.get(it.id);
      if (old && raw && it.type === raw.type && near(it.pos, old.pos, 0.005) && (it.mount === 'floor' || (Math.abs(it.yaw - old.yaw) < 0.01 && Math.abs((it.tilt ?? 0) - (old.tilt ?? 0)) < 0.01)))
        return { ...it, pos: [...raw.pos], yaw: raw.yaw, tilt: raw.tilt, mountYaw: raw.mountYaw };
      if (/^Central crown wash · [BH]$/.test(it.name)) {
        const want = byName.get(it.name);
        if (!want || !near(it.pos, want.pos, 0.005)) return it;
        const was = aim(lensAt(it.pos, it.mountYaw, it.params?.outreach ?? 0, 0.075), CROWN_WASH_TARGET_BEFORE);
        if (Math.abs(it.yaw - was.yaw) < 0.01 && Math.abs(it.tilt - was.tilt) < 0.01) return { ...it, yaw: want.yaw, tilt: want.tilt };
      }
      return it;
    });
  }

  // Additive one-time issue: a saved layout gains the six outlets it does not
  // have. Outlets deleted afterwards stay deleted; nothing else is touched.
  // Sanctuary dais, CAD file of 23 Oct 2026 (sections 25 and 45), adopted by the owner on
  // 24 Oct 2026: +0.80 m, 0.05 m above the +0.75 m of the earlier PDF set.
  const DAIS_Y = 0.8, DAIS_BEFORE_Y = 0.75, DAIS_RISE = DAIS_Y - DAIS_BEFORE_Y;
  const onDais = (x, z) => x >= 39.75 && x <= 48.65 && Math.abs(z) <= 3.6;

  // One-time lift for saved layouts, 24 October 2026. A dais fitting from the recommended
  // design that is still at its old default place, and any floor-standing item still
  // resting on the old +0.75 m dais surface, rise 0.05 m with the floor. ID, aim and
  // switching are kept. Anything placed at another height, moved off the dais, mounted on
  // walls or hung from the structure, and any deleted item, stays as it is.
  const daisLevelRevision = '2026-10-24-dais-0-80-1';
  function upgradeDaisLevel(items, design) {
    const next = new Map(design.filter(it => it.mount === 'floor' && Array.isArray(it.pos) && onDais(it.pos[0], it.pos[2])).map(it => [it.name, it]));
    return items.map(it => {
      if (!Array.isArray(it.pos) || it.mount !== 'floor' || !onDais(it.pos[0], it.pos[2])) return it;
      const raw = next.get(it.name);
      const atOldDefault = raw && raw.type === it.type && [raw.pos[0], raw.pos[1] - DAIS_RISE, raw.pos[2]].every((v, i) => Math.abs(v - it.pos[i]) <= 0.005);
      const onOldFloor = Math.abs(it.pos[1] - DAIS_BEFORE_Y) <= 0.005;
      return atOldDefault || onOldFloor ? { ...it, pos: [it.pos[0], it.pos[1] + DAIS_RISE, it.pos[2]] } : it;
    });
  }

  const outletRevision = '2026-10-09-socket-outlets-1';
  const outletIds = ['B', 'H'].flatMap(code => [`P-SANCT-${code}`, `P-NAVE-${code}`, `P-TOWER-${code}`]);
  function upgradeOutlets(items, design) {
    return [...items, ...design.filter(it => outletIds.includes(it.id) && !items.some(have => have.id === it.id)).map(it => ({ ...it }))];
  }

  // One-time circuit split for saved layouts: the recommended wing-gable and
  // service-room exhaust fans move from V1 to V2 and V3. Only a fan whose
  // circuit is still V1 moves; one the user put on another circuit stays there,
  // a deleted fan stays deleted and positions, speeds and switching are kept.
  const exhaustSplitRevision = '2026-10-18-exhaust-split-1';
  function upgradeExhaustSplit(items, design) {
    const moved = new Map(design.filter(it => it.type === 'fanExhaust' && it.circuit !== 'V1').map(it => [it.id, it.circuit]));
    return items.map(it => moved.has(it.id) && it.circuit === 'V1' ? { ...it, circuit: moved.get(it.id) } : it);
  }

  // One-time move for saved layouts, 19 October 2026: the reading lights onto the
  // beam faces in the beam lacquer (wall plaster on the entrance wall), the tower
  // lights onto the cornice ledges in the cornice colour, and the nave wall speakers
  // into the pier–wall corners. Only a fitting still at its previous default place
  // and aim moves; it takes the new type, mount, place, aim and finish and keeps
  // its ID, switching, dimmer, output, beam, level, delay and circuit. A fitting the
  // user moved, re-aimed or deleted stays as it is.
  const hiddenFittingsRevision = '2026-10-19-hidden-fittings-1';
  function hiddenFittingsBefore(GEO) {
    const A = GEO.axes, TZ = 10.153, before = new Map();
    const put = (name, type, pos, yaw, tilt) => before.set(name, { type, pos, yaw, tilt });
    for (const k of ['3', '4', '5', '6', '7', '8', '9']) for (const s of [-1, 1]) for (const [tag, yaw] of [['', 0], [' · twin', 180]]) {
      put(`Reading light · axis ${k} · ${side(s)} central${tag}`, 'projector36', [A[k], 8.585, s * 2.6], yaw, -81.995);
      put(`Reading light · axis ${k} · ${side(s)} outer${tag}`, 'projector36', [A[k], 6.655, s * 5.6], yaw, -81.993);
    }
    for (const s of [-1, 1]) {
      const B = side(s), z = s * TZ;
      put(`Rear rows light · entrance façade · ${B}`, 'projector36', [2.65, 3.45, s * 4.2], s * 8.202, -25.295);
      put(`Rear centre light · entrance façade · ${B}`, 'projector36', [2.65, 5.95, s * 4.2], -s * 40.2, -47.934);
      for (const [name, pos, yaw, tilt] of [
        ['Tower lower front wash', [-0.125, 8.4, s * (TZ + 0.7)], -s * 63.763, -72.127], ['Tower stage 2 flood', [-0.125, 8.4, z], 0, 84.8],
        ['Tower stage 3 flood', [-0.035, 15.88, z], 0, 84.225], ['Belfry front wash', [0.065, 23.2, z], 0, 80.538], ['Dome front wash', [0.35, 29.26, z], 0, 61.429],
        ['Tower lower side wash', [3.05, 8.4, s * (TZ + 2.585)], -s * 149.389, -73.929], ['Tower stage 2 side wash', [2.45, 8.4, s * (TZ + 2.585)], -s * 90, 84.266],
        ['Tower stage 3 side wash', [2.45, 15.88, s * (TZ + 2.46)], -s * 90, 84.096], ['Belfry side wash', [2.45, 23.2, s * (TZ + 2.36)], -s * 90, 80.538]])
        put(`${name} · ${B}`, 'corniceFlood', pos, yaw, tilt);
      for (const [name, pos, yaw, tilt] of [
        [`Façade wash · ${B}`, [-0.075, 8.4, s * 7.9], -s * 68.858, -42.191], [`Central gable flood · ${B}`, [-0.075, 8.4, s * 7.75], -s * 75.1, 24.757],
        [`Central crown wash · ${B}`, [-0.035, 15.88, s * 7.9], -s * 74.203, 16.295],
        [`Stage flood · tower ${B} · outer`, [-0.075, 8.4, s * (TZ + 1.7)], -s * 136.11, -54.737], [`Stage flood · tower ${B} · inner`, [-0.075, 8.4, s * (TZ - 1.7)], -s * 125.891, -49.003]])
        put(name, 'flood', pos, yaw, tilt);
      for (const k of ['4', '5', '6', '7', '8', '9']) put(`Wall speaker · axis ${k} · ${B}`, 'slimColumn', [A[k], 3.45, s * 7.07], -s * 140, -18);
    }
    return before;
  }
  function upgradeHiddenFittings(items, design, GEO) {
    const before = hiddenFittingsBefore(GEO), next = new Map(design.map(it => [it.name, it]));
    const turn = (a, b) => Math.abs(((a - b) % 360 + 540) % 360 - 180);
    return items.map(it => {
      const old = before.get(it.name), raw = next.get(it.name);
      if (!old || !raw || it.type !== old.type || !Array.isArray(it.pos) || it.pos.some((v, i) => Math.abs(v - old.pos[i]) > 0.005) ||
        turn(it.yaw ?? 0, old.yaw) > 0.01 || Math.abs((it.tilt ?? 0) - old.tilt) > 0.01) return it;
      const moved = { ...it, type: raw.type, mount: raw.mount, pos: [...raw.pos], yaw: raw.yaw, tilt: raw.tilt, mountYaw: raw.mountYaw, params: { ...raw.params } };
      if (raw.anchorY === undefined) delete moved.anchorY; else moved.anchorY = raw.anchorY;
      return moved;
    });
  }

  // One-time change for saved layouts, 19 October 2026 (owner: all the sanctuary lights in
  // the lacquer; nave chandeliers 1.0 m higher). The accent heads hung from the axis-9 tie
  // and side beams take the beam lacquer, the heads and vault uplights on the chamber walls
  // the chamber lacquer: only a fitting of the same type still at its default place and
  // aim and still in its metal finish changes, and only its finish. A nave chandelier still
  // at its old +6.3 m default place rises to its new height and keeps its ID, chain anchor,
  // switching and dimmer. A moved, re-aimed, re-typed, refinished or deleted item stays.
  const NAVE_CHANDELIER_Y = 7.3, NAVE_CHANDELIER_BEFORE_Y = 6.3;
  const finishChandelierRevision = '2026-10-19-sanctuary-lacquer-chandeliers-1';
  const lacqueredNames = name => /^(Altar key light · [BH]|Ambo key light|Sanctuary step fill · [BH]|Presider chair light|Sanctuary frame wash · [BH]|Statue accent · [BH]|Shrine wash · [BH]|Crucifix accent · [BH]|Reredos wash · [BH]|Reredos base wash · [BH]|Tabernacle accent|Sanctuary vault uplight · [BH])$/.test(name);
  const naveChandelier = name => /^Chandelier · bay [468]–[579]$/.test(name);
  function upgradeFinishChandeliers(items, design) {
    const next = new Map(design.filter(it => (lacqueredNames(it.name) && ['timber', 'chamber'].includes(it.params?.finish)) || (naveChandelier(it.name) && it.type === 'chandelier8')).map(it => [it.name, it]));
    const turn = (a, b) => Math.abs(((a - b) % 360 + 540) % 360 - 180);
    const at = (it, pos) => Array.isArray(it.pos) && it.pos.every((v, i) => Math.abs(v - pos[i]) <= 0.005);
    return items.map(it => {
      const raw = next.get(it.name);
      if (!raw || it.type !== raw.type) return it;
      if (naveChandelier(it.name)) return at(it, [raw.pos[0], NAVE_CHANDELIER_BEFORE_Y, raw.pos[2]]) ? { ...it, pos: [it.pos[0], raw.pos[1], it.pos[2]] } : it;
      if (!at(it, raw.pos) || turn(it.yaw ?? 0, raw.yaw) > 0.01 || Math.abs((it.tilt ?? 0) - raw.tilt) > 0.01 || ![undefined, 'black', 'bronze'].includes(it.params?.finish)) return it;
      return { ...it, params: { ...it.params, finish: raw.params.finish } };
    });
  }

  // One-time move for saved layouts, 19 October 2026 (owner: fans onto the beams that
  // join the columns, and a little higher). A side-aisle ceiling fan still at its old
  // default place (hub +3.90 m under the purlins at Z ±4.40) takes its new place and
  // anchor: under the column-line beam in bays 3–4 to 8–9, and 0.30 m higher in every
  // bay. Its ID, speed, switching and oscillation are kept. A moved or deleted fan
  // stays as it is.
  const FAN_HUB_BEFORE_Y = 3.9;
  const fanBeamRevision = '2026-10-19-fans-on-column-beams-1';
  function upgradeFanBeams(items, design) {
    const next = new Map(design.filter(it => /^Ceiling fan · bay [2-8]′?–[3-9] · [BH] aisle$/.test(it.name)).map(it => [it.name, it]));
    const heads = new Map(design.filter(it => /^Reading light · axis \d · [BH] central/.test(it.name) && it.beam === 24).map(it => [it.name, it]));
    return items.map(it => {
      const raw = next.get(it.name);
      if (!raw || it.type !== 'fanCeiling' || !Array.isArray(it.pos)) return it;
      const old = [raw.pos[0], FAN_HUB_BEFORE_Y, Math.sign(raw.pos[2]) * 4.4];
      if (!it.pos.every((v, i) => Math.abs(v - old[i]) <= 0.005)) return it;
      return { ...it, pos: [...raw.pos], anchorY: raw.anchorY, note: raw.note };
    }).map(it => {
      // A tie-beam reading head now aimed 5° / 24° takes that aim and optic if it is
      // still in its place with the earlier 8° / 28° aim; output and switching stay.
      const raw = heads.get(it.name);
      if (!raw || it.type !== raw.type || !Array.isArray(it.pos) || !it.pos.every((v, i) => Math.abs(v - raw.pos[i]) <= 0.005)) return it;
      const dir = / · twin$/.test(it.name) ? -1 : 1, axisX = raw.pos[0] - 0.15, before = aim([raw.pos[0] + 0.085, 8.59, raw.pos[2]], [axisX + dir * Math.tan(8 * Math.PI / 180) * 7.79, 0.8, Math.sign(raw.pos[2]) * 2.6]);
      if (Math.abs(((it.yaw - before.yaw) % 360 + 540) % 360 - 180) > 0.01 || Math.abs(it.tilt - before.tilt) > 0.01 || (it.beam ?? 28) !== 28) return it;
      return { ...it, yaw: raw.yaw, tilt: raw.tilt, beam: raw.beam };
    });
  }

  const naveFanRevision = '2026-10-09-eight-wall-fans-per-side';
  const naveFanLegacyIds = ['F244', 'F245', 'F246', 'F247', 'F248', 'F249'];
  function naveFanTargets(design, code) {
    if (!['B', 'H'].includes(code)) throw new Error('Choose nave side B or H.');
    return design.filter(it => it.circuit === 'F2' && Math.sign(it.pos[2]) === (code === 'B' ? -1 : 1));
  }
  function upgradeNaveFans(items, design) {
    const added = [], replacements = new Map();
    for (const code of ['B', 'H']) {
      const targets = naveFanTargets(design, code);
      const legacy = targets.filter(it => naveFanLegacyIds.includes(it.id));
      // State overrides survive. Geometry, deletion, visibility, name or notes
      // block this side's automatic additions; explicit adoption is separate.
      const fields = ['type', 'name', 'circuit', 'mount', 'pos', 'yaw', 'mountYaw', 'tilt', 'hidden', 'params', 'oscillate', 'note'];
      const untouched = legacy.every(raw => {
        const prior = items.find(it => it.id === raw.id);
        return prior && fields.every(k => JSON.stringify(prior[k]) === JSON.stringify((k === 'type' ? 'fanWall' : raw[k]) ?? (k === 'params' ? {} : k === 'oscillate' ? true : undefined)));
      });
      if (!untouched || targets.some(t => !naveFanLegacyIds.includes(t.id) && items.some(it => it.id === t.id))) continue;
      for (const t of legacy) replacements.set(t.id, { ...items.find(it => it.id === t.id), type: t.type });
      added.push(...targets.filter(t => !naveFanLegacyIds.includes(t.id)));
    }
    return [...items.map(it => replacements.get(it.id) || it), ...added];
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
  const wingReviewRevision = '2026-10-09-wing-two-light-art-2';
  const wingReviewRetiredIds = ['L64', 'L66', 'L68', 'L70', 'F-WING-B-3', 'F-WING-B-4', 'F-WING-H-3', 'F-WING-H-4'];
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
  // Frozen intermediate four-chandelier/four-wall-fan review. Only complete
  // exact records may migrate; operating overrides/notes/deletions retain it.
  const wingIntermediate = [{"id":"L63","type":"chandelier6Reading","name":"Wing light · B · front block · back rows","circuit":"L8","mount":"pendant","pos":[38.94,4.4,-10.6],"yaw":0,"tilt":-90,"mountYaw":0,"anchorY":8.115059999999996,"on":true,"hidden":false,"dim":1,"params":{},"note":"HELD wing concept: 6 brass candle lamps plus downward reading optic. Unverified photometry, glare, thermal design, support and maintenance. See docs/engineering/wing-review.md.","lumens":5640,"cct":2700,"beam":100,"shadow":false},{"id":"L64","type":"chandelier6Reading","name":"Wing light · B · front block · front rows","circuit":"L8","mount":"pendant","pos":[38.94,4.4,-8.8],"yaw":0,"tilt":-90,"mountYaw":0,"anchorY":8.115059999999996,"on":true,"hidden":false,"dim":1,"params":{},"note":"HELD wing concept: 6 brass candle lamps plus downward reading optic. Unverified photometry, glare, thermal design, support and maintenance. See docs/engineering/wing-review.md.","lumens":5640,"cct":2700,"beam":100,"shadow":false},{"id":"L65","type":"chandelier6Reading","name":"Wing light · B · rear block · back rows","circuit":"L8","mount":"pendant","pos":[42.22,4.4,-10.6],"yaw":0,"tilt":-90,"mountYaw":0,"anchorY":8.083580000000003,"on":true,"hidden":false,"dim":1,"params":{},"note":"HELD wing concept: 6 brass candle lamps plus downward reading optic. Unverified photometry, glare, thermal design, support and maintenance. See docs/engineering/wing-review.md.","lumens":5640,"cct":2700,"beam":100,"shadow":false},{"id":"L66","type":"chandelier6Reading","name":"Wing light · B · rear block · front rows","circuit":"L8","mount":"pendant","pos":[42.22,4.4,-8.8],"yaw":0,"tilt":-90,"mountYaw":0,"anchorY":8.083580000000003,"on":true,"hidden":false,"dim":1,"params":{},"note":"HELD wing concept: 6 brass candle lamps plus downward reading optic. Unverified photometry, glare, thermal design, support and maintenance. See docs/engineering/wing-review.md.","lumens":5640,"cct":2700,"beam":100,"shadow":false},{"id":"L67","type":"chandelier6Reading","name":"Wing light · H · front block · back rows","circuit":"L8","mount":"pendant","pos":[38.94,4.4,10.6],"yaw":0,"tilt":-90,"mountYaw":0,"anchorY":8.115059999999996,"on":true,"hidden":false,"dim":1,"params":{},"note":"HELD wing concept: 6 brass candle lamps plus downward reading optic. Unverified photometry, glare, thermal design, support and maintenance. See docs/engineering/wing-review.md.","lumens":5640,"cct":2700,"beam":100,"shadow":false},{"id":"L68","type":"chandelier6Reading","name":"Wing light · H · front block · front rows","circuit":"L8","mount":"pendant","pos":[38.94,4.4,8.8],"yaw":0,"tilt":-90,"mountYaw":0,"anchorY":8.115059999999996,"on":true,"hidden":false,"dim":1,"params":{},"note":"HELD wing concept: 6 brass candle lamps plus downward reading optic. Unverified photometry, glare, thermal design, support and maintenance. See docs/engineering/wing-review.md.","lumens":5640,"cct":2700,"beam":100,"shadow":false},{"id":"L69","type":"chandelier6Reading","name":"Wing light · H · rear block · back rows","circuit":"L8","mount":"pendant","pos":[42.22,4.4,10.6],"yaw":0,"tilt":-90,"mountYaw":0,"anchorY":8.083580000000003,"on":true,"hidden":false,"dim":1,"params":{},"note":"HELD wing concept: 6 brass candle lamps plus downward reading optic. Unverified photometry, glare, thermal design, support and maintenance. See docs/engineering/wing-review.md.","lumens":5640,"cct":2700,"beam":100,"shadow":false},{"id":"L70","type":"chandelier6Reading","name":"Wing light · H · rear block · front rows","circuit":"L8","mount":"pendant","pos":[42.22,4.4,8.8],"yaw":0,"tilt":-90,"mountYaw":0,"anchorY":8.083580000000003,"on":true,"hidden":false,"dim":1,"params":{},"note":"HELD wing concept: 6 brass candle lamps plus downward reading optic. Unverified photometry, glare, thermal design, support and maintenance. See docs/engineering/wing-review.md.","lumens":5640,"cct":2700,"beam":100,"shadow":false},{"id":"F240","type":"fanWall","name":"Wall fan · wing B · 1 · held review","circuit":"F5","mount":"wall","pos":[39.15,3.5,-13.06],"yaw":97.66680426181422,"tilt":-63.94867424281879,"mountYaw":90,"on":true,"hidden":false,"dim":1,"params":{},"note":"ENGINEERING HOLD: 4 per wing at low speed cover 68/80 seats; noise and speech criteria fail. Gable anchors, concealment, sweep clearance and maintenance unapproved.","speed":1,"oscillate":true},{"id":"F241","type":"fanWall","name":"Wall fan · wing B · 2 · held review","circuit":"F5","mount":"wall","pos":[39.95,2.7,-13.06],"yaw":103.96981360840223,"tilt":-30.04635493627147,"mountYaw":90,"on":true,"hidden":false,"dim":1,"params":{},"note":"ENGINEERING HOLD: 4 per wing at low speed cover 68/80 seats; noise and speech criteria fail. Gable anchors, concealment, sweep clearance and maintenance unapproved.","speed":1,"oscillate":true},{"id":"F242","type":"fanWall","name":"Wall fan · wing H · 1 · held review","circuit":"F5","mount":"wall","pos":[39.15,3.5,13.06],"yaw":-97.66680426181422,"tilt":-63.94867424281879,"mountYaw":-90,"on":true,"hidden":false,"dim":1,"params":{},"note":"ENGINEERING HOLD: 4 per wing at low speed cover 68/80 seats; noise and speech criteria fail. Gable anchors, concealment, sweep clearance and maintenance unapproved.","speed":1,"oscillate":true},{"id":"F243","type":"fanWall","name":"Wall fan · wing H · 2 · held review","circuit":"F5","mount":"wall","pos":[39.95,2.7,13.06],"yaw":-103.96981360840223,"tilt":-30.04635493627147,"mountYaw":-90,"on":true,"hidden":false,"dim":1,"params":{},"note":"ENGINEERING HOLD: 4 per wing at low speed cover 68/80 seats; noise and speech criteria fail. Gable anchors, concealment, sweep clearance and maintenance unapproved.","speed":1,"oscillate":true},{"id":"F-WING-B-3","type":"fanWall","name":"Wall fan · wing B · 3 · held review","circuit":"F5","mount":"wall","pos":[41.2,2.7,-13.06],"yaw":75.89736516026656,"tilt":-30.031965296126412,"mountYaw":90,"on":true,"hidden":false,"dim":1,"params":{},"note":"ENGINEERING HOLD: 4 per wing at low speed cover 68/80 seats; noise and speech criteria fail. Gable anchors, concealment, sweep clearance and maintenance unapproved.","speed":1,"oscillate":true},{"id":"F-WING-B-4","type":"fanWall","name":"Wall fan · wing B · 4 · held review","circuit":"F5","mount":"wall","pos":[42,3.5,-13.06],"yaw":81.9727624895681,"tilt":-63.92906953677533,"mountYaw":90,"on":true,"hidden":false,"dim":1,"params":{},"note":"ENGINEERING HOLD: 4 per wing at low speed cover 68/80 seats; noise and speech criteria fail. Gable anchors, concealment, sweep clearance and maintenance unapproved.","speed":1,"oscillate":true},{"id":"F-WING-H-3","type":"fanWall","name":"Wall fan · wing H · 3 · held review","circuit":"F5","mount":"wall","pos":[41.2,2.7,13.06],"yaw":-75.89736516026656,"tilt":-30.031965296126412,"mountYaw":-90,"on":true,"hidden":false,"dim":1,"params":{},"note":"ENGINEERING HOLD: 4 per wing at low speed cover 68/80 seats; noise and speech criteria fail. Gable anchors, concealment, sweep clearance and maintenance unapproved.","speed":1,"oscillate":true},{"id":"F-WING-H-4","type":"fanWall","name":"Wall fan · wing H · 4 · held review","circuit":"F5","mount":"wall","pos":[42,3.5,13.06],"yaw":-81.9727624895681,"tilt":-63.92906953677533,"mountYaw":-90,"on":true,"hidden":false,"dim":1,"params":{},"note":"ENGINEERING HOLD: 4 per wing at low speed cover 68/80 seats; noise and speech criteria fail. Gable anchors, concealment, sweep clearance and maintenance unapproved.","speed":1,"oscillate":true}];
  function wingReviewTargets(design, code) {
    if (!['B', 'H'].includes(code)) throw new Error('Choose wing B or H.');
    const sign = code === 'B' ? -1 : 1;
    const ids = wingBefore.filter(it => Math.sign(it.pos[2]) === sign && (it.circuit === 'L8' || it.type === 'fanCeiling') && !wingReviewRetiredIds.includes(it.id)).map(it => it.id);
    return ids.map(id => {
      const raw = design.find(it => it.id === id);
      if (!raw) throw new Error('Incomplete wing review template: ' + id);
      return { ...raw };
    });
  }
  function wingReviewScope(code) {
    if (!['B', 'H'].includes(code)) throw new Error('Choose wing B or H.');
    const sign = code === 'B' ? -1 : 1;
    return wingIntermediate.filter(it => Math.sign(it.pos[2]) === sign).map(it => it.id);
  }
  function upgradeWingReview(items, design) {
    const same = (a, b) => {
      if (typeof a === 'number' && typeof b === 'number') return Math.abs(a - b) < 1e-9;
      if (a && b && typeof a === 'object' && typeof b === 'object') return [...new Set([...Object.keys(a), ...Object.keys(b)])].every(k => same(a[k], b[k]));
      return a === b;
    };
    // The pre-review projectors had no finish setting; the default black one added on
    // 19 October 2026 still counts as untouched.
    const unfinished = it => it?.params?.finish === 'black' ? { ...it, params: Object.fromEntries(Object.entries(it.params).filter(([k]) => k !== 'finish')) } : it;
    const replacements = new Map(), retired = new Set();
    for (const code of ['B', 'H']) {
      const sign = code === 'B' ? -1 : 1;
      const original = wingBefore.filter(it => Math.sign(it.pos[2]) === sign && (it.circuit === 'L8' || it.type === 'fanCeiling'));
      const intermediate = wingIntermediate.filter(it => Math.sign(it.pos[2]) === sign);
      const hasExtra = items.some(it => it.id.startsWith(`F-WING-${code}-`));
      const untouched = (!hasExtra && original.every(it => same(it, unfinished(items.find(raw => raw.id === it.id))))) || intermediate.every(it => same(it, items.find(raw => raw.id === it.id)));
      if (!untouched) continue;
      let targets; try { targets = wingReviewTargets(design, code); } catch { continue; }
      targets.forEach(it => replacements.set(it.id, it));
      wingReviewScope(code).filter(id => wingReviewRetiredIds.includes(id)).forEach(id => retired.add(id));
    }
    for (const old of wingBefore.filter(it => it.type === 'fanWall')) if (same(old, items.find(it => it.id === old.id))) replacements.set(old.id, { ...old, hidden: false, on: false });
    return items.filter(it => !retired.has(it.id)).map(it => replacements.get(it.id) || it);
  }

  const wingArtRevision = '2026-10-09-wing-peter-paul-concept-1';
  function wingArtTargets(design, code) {
    if (!['B', 'H'].includes(code)) throw new Error('Choose wing B or H.');
    return ['PETER', 'PAUL'].map(saint => {
      const id = `D-WING-${code}-${saint}`, target = design.find(it => it.id === id);
      if (!target) throw new Error('Incomplete saints concept template: ' + id);
      return { ...target };
    });
  }
  function upgradeWingArt(items, design) {
    const additions = [];
    for (const code of ['B', 'H']) {
      let targets; try { targets = wingArtTargets(design, code); } catch { continue; }
      // A partial/edited pair stays partial. The engine runs this additive
      // first-issue migration once; subsequent deleted pictures stay deleted.
      if (!targets.some(t => items.some(it => it.id === t.id))) additions.push(...targets);
    }
    return [...items, ...additions];
  }


  const wingSoundRevision = '2026-10-09-wing-sound-art-clearance-2';
  const wingSoundRetiredIds = ['S275', 'S277'];
  const wingSoundBefore = [{"id":"S275","type":"pendantSpeaker","name":"Wing speaker · B · front block","circuit":"A1","mount":"pendant","pos":[38.94,3,-11.6],"yaw":90,"tilt":-46.39718102729638,"mountYaw":0,"anchorY":8.115059999999996,"on":true,"hidden":false,"dim":1,"params":{},"level":-10,"delayMs":25.2},{"id":"S276","type":"pendantSpeaker","name":"Wing speaker · B · rear block","circuit":"A1","mount":"pendant","pos":[42.22,3,-11.6],"yaw":90,"tilt":-46.39718102729638,"mountYaw":0,"anchorY":8.083580000000003,"on":true,"hidden":false,"dim":1,"params":{},"level":-10,"delayMs":23.7},{"id":"S277","type":"pendantSpeaker","name":"Wing speaker · H · front block","circuit":"A1","mount":"pendant","pos":[38.94,3,11.6],"yaw":-90,"tilt":-46.39718102729638,"mountYaw":0,"anchorY":8.115059999999996,"on":true,"hidden":false,"dim":1,"params":{},"level":-10,"delayMs":39.4},{"id":"S278","type":"pendantSpeaker","name":"Wing speaker · H · rear block","circuit":"A1","mount":"pendant","pos":[42.22,3,11.6],"yaw":-90,"tilt":-46.39718102729638,"mountYaw":0,"anchorY":8.083580000000003,"on":true,"hidden":false,"dim":1,"params":{},"level":-10,"delayMs":38.5}];
  function wingSoundTargets(design, code) {
    const id = code === 'B' ? 'S276' : code === 'H' ? 'S278' : null;
    if (!id) throw new Error('Choose wing B or H.');
    const target = design.find(it => it.id === id);
    if (!target) throw new Error('Incomplete wing sound review template: ' + id);
    return [{ ...target }];
  }
  function upgradeWingSound(items, design) {
    const same = (a, b) => {
      if (typeof a === 'number' && typeof b === 'number') return Math.abs(a - b) < 1e-9;
      if (a && b && typeof a === 'object' && typeof b === 'object') return [...new Set([...Object.keys(a), ...Object.keys(b)])].every(k => same(a[k], b[k]));
      return a === b;
    };
    const replacements = new Map(), retired = new Set();
    for (const code of ['B', 'H']) {
      const old = wingSoundBefore.filter(it => Math.sign(it.pos[2]) === (code === 'B' ? -1 : 1));
      if (!old.every(it => same(it, items.find(raw => raw.id === it.id)))) continue;
      let targets;
      try { targets = wingSoundTargets(design, code); } catch { continue; }
      targets.forEach(it => replacements.set(it.id, it));
      old.filter(it => wingSoundRetiredIds.includes(it.id)).forEach(it => retired.add(it.id));
    }
    return items.filter(it => !retired.has(it.id)).map(it => replacements.get(it.id) || it);
  }

  window.CHURCH_SIM_DESIGN = { facadeCadRevision, upgradeFacadeCad, facadeNiches, facadeNichesBefore, daisLevelRevision, upgradeDaisLevel, DAIS_Y, DAIS_BEFORE_Y, fanBeamRevision, upgradeFanBeams, finishChandelierRevision, upgradeFinishChandeliers, NAVE_CHANDELIER_BEFORE_Y, hiddenFittingsRevision, hiddenFittingsBefore, upgradeHiddenFittings, exhaustSplitRevision, upgradeExhaustSplit, facadeStatueRevision, facadeStatueIds, upgradeFacadeStatues, outletRevision, outletIds, upgradeOutlets, naveFanRevision, naveFanLegacyIds, naveFanTargets, upgradeNaveFans, wingArtRevision, wingArtTargets, upgradeWingArt, wingReviewRetiredIds, wingReviewScope, wingSoundRevision, wingSoundRetiredIds, wingSoundTargets, upgradeWingSound, wingReviewRevision, upgradeWingReview, wingReviewTargets, sanctuaryRevision, upgradeSanctuary, recommended, aim, upgradeLighting, lightingRevision, upgradeFacade, facadeRevision, upgradeEntrance, entranceRevision, version: '2026-10-16-tower-board' };
})();
