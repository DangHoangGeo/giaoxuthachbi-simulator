/* Thạch Bi simulator · engine. Loaded before bundle.js; the bundle calls
 * prepare() before it merges the static model into material batches, then
 * bindBatches(), start(window.church) and frame() every rendered frame.
 *
 * Responsibilities: as-drawn structure corrections, individually switchable
 * fixtures (lights, fans, loudspeakers, microphones, decorations), a fixed
 * pool of renderer lights fed by physically scaled emitters, placement and
 * picking, history and persistence. Analysis, audio and UI live in their own
 * files and talk to the engine through window.CHURCH_SIMULATOR.
 */
(() => {
  'use strict';
  const P = window.CHURCH_SIM_PHYSICS;
  const CAT = window.CHURCH_SIM_CATALOG;
  const DEG = Math.PI / 180;
  const STORAGE_KEY = 'thachbi.simulator.v1';
  const SCHEMA = 1;

  let T, ctx, church = null, ready = false;
  const handlers = {};
  const fixtures = new Map();
  const matLib = {};
  const protoCache = new Map();
  const UNUSED_PROTOTYPE_LIMIT = 32;
  let batchDepth = 0, batchDirty = false, batchItems = false;
  const batchIds = new Set();
  let Kit, simGroup, proxyGroup, haloPoints, overlayGroup, selectionHelper, ghost = null, ghostPrototype = null;
  let proxies = [], pool = null, trussBatch = null, proposedTruss = null;
  let drawnFrame = null, referenceFrame = null, frameBatches = {};
  let lightDirty = true, analysisDirty = true, saveTimer = 0, analysisTimer = 0;
  let envMode = 'day', cameraInside = 0, ambientNow = 0, adaptNow = 160, timeNow = 0;

  const CIRCUITS = {
    L1: { label: 'L1 · Central seating', cat: 'light', board: 'DB1', area: 'Nave' },
    L2: { label: 'L2 · Outer seating', cat: 'light', board: 'DB1', area: 'Nave' },
    L3: { label: 'L3 · Sanctuary', cat: 'light', board: 'DB1', area: 'Sanctuary & wings' },
    L4: { label: 'L4 · Circulation & verandas', cat: 'light', board: 'DB1', area: 'Verandas & paths' },
    LA: { label: 'LA · Roof uplight', cat: 'light', board: 'DB1', area: 'Nave' },
    LD: { label: 'LD · Chandeliers & sconces', cat: 'light', board: 'DB1', area: 'Nave' },
    L5: { label: 'L5 · Steps & paths', cat: 'light', board: 'DB1', area: 'Verandas & paths' },
    L8: { label: 'L8 · Wings · choir & ministers', cat: 'light', board: 'DB1', area: 'Sanctuary & wings' },
    L6: { label: 'L6 · Façade & towers', cat: 'light', board: 'DB2', area: 'Towers & façade' },
    L9: { label: 'L9 · Front stage & central door', cat: 'light', board: 'DB2', area: 'Towers & façade' },
    L7: { label: 'L7 · Festival exterior (strings & tower floods)', cat: 'light', board: 'DB2', area: 'Towers & façade' },
    E1: { label: 'E1 · Exit signs', cat: 'light', board: 'DB1', area: 'Verandas & paths' },
    X1: { label: 'X1 · Festival lighting', cat: 'decor', board: 'DB1' },
    F1: { label: 'F1 · Ceiling fans', cat: 'fan', board: 'DB1' },
    F2: { label: 'F2 · Wall fans', cat: 'fan', board: 'DB1' },
    F3: { label: 'F3 · Portable fans', cat: 'fan', board: 'DB1' },
    F4: { label: 'F4 · Entrance circulators (trial)', cat: 'fan', board: 'DB2' },
    V1: { label: 'V1 · Exhaust ventilation', cat: 'fan', board: 'DB1' },
    A1: { label: 'A1 · Main & delay loudspeakers', cat: 'speaker', board: 'DB1' },
    A2: { label: 'A2 · Veranda fill', cat: 'speaker', board: 'DB1' },
    A3: { label: 'A3 · Courtyard', cat: 'speaker', board: 'DB1' },
    A4: { label: 'A4 · Choir monitors', cat: 'speaker', board: 'DB1' },
    A5: { label: 'A5 · Rear fill (crowded feasts)', cat: 'speaker', board: 'DB1' },
    MIC: { label: 'Microphones', cat: 'speaker', board: 'DB1' },
    DECOR: { label: 'Decoration', cat: 'decor' },
    F5: { label: 'F5 · Wing wall fans · held review', cat: 'fan', board: 'DB1', area: 'Sanctuary wings' }
  };
  // Two boards. DB-1 in the service room behind the altar feeds everything
  // inside; DB-2, a small sub-board just inside the main doors, is fed by one
  // cable from DB-1 and switches the circuits at the front of the church, so
  // those long circuit runs back to the altar end are not needed.
  const BOARDS = {
    DB1: { label: 'DB-1 · Main board', where: 'Service room behind the altar · existing back-wall enclosure', pos: [48.895, 1.75, -1.55] },
    DB2: { label: 'DB-2 · Towers & entrance', where: 'Inside the main doors, left of the main door', pos: [2.73, 1.5, -3.3] }
  };
  const QUALITY = {
    // Both paths use the same physical shading. The texture path skips spots
    // outside each cell's cone list. Quality changes the native/texture split;
    // the two shadow sources stay fixed and resolution has its own control.
    high: { points: 24, spots: 40, shadows: 2, label: 'High · strong graphics card' },
    balanced: { points: 8, spots: 14, shadows: 2, label: 'Balanced' },
    fast: { points: 4, spots: 6, shadows: 2, label: 'Fast · lighter rendering' }
  };

  const defaults = () => ({
    adaptLux: 110, autoExposure: false, quality: 'fast', autoQuality: true, maintenance: 0.8, halos: 1,
    occupancy: 0.6, openings: 1, roofFinish: 'mixed', entranceFinish: 'slats', tempC: 28, rh: 75, ambientDbA: 40,
    lensDeg: 75, eyeHeight: 1.6, walkSpeed: 1.4, showTruss: false, frameStyle: 'drawn', timberTone: 'reference',
    overlay: 'none', snap: true, edit: true, talker: false, micDistance: 0.4, talkerDbA: 62,
    serviceHours: 1.5, servicesPerMonth: 40, tariff: 2200, mixerDb: 0, seatingPlane: 0.8, servicePanelsUpgraded: false, lightingRevision: '', facadeRevision: '', entranceRevision: '', sanctuaryRevision: '', stableLightingRevision: '', wingReviewRevision: ''
  });
  const state = { items: [], settings: defaults(), selectedId: null, history: [], future: [], scene: null, customScenes: [] };
  const estimateLimits = {
    maintenance: [0, 1], occupancy: [0, 1], openings: [0, 1], tempC: [-20, 50], rh: [0, 100],
    ambientDbA: [0, 120], talkerDbA: [0, 100], micDistance: [0.01, 10], mixerDb: [-60, 24],
    serviceHours: [0.25, 12], servicesPerMonth: [1, 120], tariff: [0, 10000]
  };
  function settingValue(key, value) {
    const fallback = defaults()[key];
    if (typeof fallback === 'boolean') return typeof value === 'boolean' ? value : fallback;
    if (typeof fallback !== 'number') return value;
    const n = value === '' || value === null ? NaN : Number(value);
    if (!Number.isFinite(n)) return fallback;
    const bounds = estimateLimits[key];
    const result = bounds ? P.clamp(n, ...bounds) : n;
    return key === 'servicesPerMonth' ? Math.round(result) : result;
  }

  const SIM = window.CHURCH_SIMULATOR = {
    prepare, bindBatches, start, frame, CIRCUITS, BOARDS, QUALITY, state, fixtures,
    get ready() { return ready; }, get church() { return church; }, get THREE() { return T; },
    on(evt, fn) { (handlers[evt] ||= new Set()).add(fn); return () => handlers[evt].delete(fn); },
    emit, batch, item: id => state.items.find(i => i.id === id), typeOf: it => CAT.byId[it.type],
    add: addItem, update: updateItem, remove: removeItem, duplicate: duplicateItem, mirror: mirrorItem,
    repeatBays: repeatAlongBays, select, beginPlacement, cancelPlacement, undo, redo, commit,
    setSetting, applyScene, saveNow, exportLayout, importLayout, resetDesign, exportSchedule,
    emitters: lightEmitters, speakers: speakerSources, fans: fanSources, mics: micSources,
    room: roomModel, floorY, structureAbove, seats: () => GEO.seats, markDirty, focusItem,
    powerSummary, setOverlay, worldFrame, refreshSeating, fixtureVisible
  };
  function emit(evt, data) {
    if (evt === 'items' && batchDepth) {
      batchItems = true;
      if (data?.id) batchIds.add(data.id);
      return;
    }
    for (const fn of handlers[evt] || []) { try { fn(data); } catch (e) { console.error(e); } }
  }
  // Synchronous transactions: every fixture updates immediately, then consumers
  // see one complete state. History/commit boundaries remain the caller's choice.
  function batch(fn) {
    batchDepth++;
    try { return fn(); }
    finally {
      if (--batchDepth === 0) {
        const dirty = batchDirty, items = batchItems, ids = [...batchIds];
        batchDirty = batchItems = false; batchIds.clear();
        if (dirty) markDirty();
        if (items) emit('items', { id: ids.length === 1 ? ids[0] : undefined, ids });
        prunePrototypes();
      }
    }
  }

  /* ------------------------------------------------------- church geometry */
  const GEO = { axes: {}, columns: [], mainBeams: [], sideBeams: [], walls: [], seats: [], seatsByLayout: {} };
  const LINING_RIDGE = 12.282, LINING_SLOPE = (12.472 - 7.13) / 7.36;
  function liningY(z) { return LINING_RIDGE - LINING_SLOPE * Math.abs(z); }

  function floorY(x, z) {
    const az = Math.abs(z);
    if (x >= 39.75 && x <= 48.65 && az <= 3.6) return 0.75;
    if (x >= 38.2 && x < 39.75 && az <= 3.6) return Math.min(0.75, (Math.floor((x - 38.2) / 0.32) + 1) * 0.15);
    if ((az > 3.6 && az <= 7.25 && x >= 40.33 && x <= 52.63) || (az <= 3.6 && x > 48.65 && x <= 52.85)) return 0.15;
    if (x >= 2.3 && x <= 53 && az <= 7.25) return 0;
    if (x >= 37.22 && x <= 43.9 && az <= 12.95) return -0.32;
    if (x >= 5.2 && x <= 52.9 && az <= 10.45) return -0.32;
    const refined = window.CHURCH_REALISM?.floorHeight?.(x, z);
    if (refined !== null && refined !== undefined) return refined;
    if (x >= -8.1 && x <= 0.99 && az <= 13.35) return -0.48;
    if (x < -8.1 && x >= -13.219 && az <= 13.35) return -2.08 + Math.min(16, Math.max(1, Math.floor((x + 13.219) / 0.32) + 1)) * 0.1;
    return -2.08;
  }
  function inWing(x, z) { return x > 37.2 && x < 43.95 && Math.abs(z) > 7.25 && Math.abs(z) < 12.98; }
  // Inside the church: the nave and sanctuary, plus the two 9–10 wings under their own roof.
  function isInterior(p) { return p[0] > 2.3 && p[0] < 53.1 && p[1] < 12.5 && (Math.abs(p[2]) < 7.3 || (inWing(p[0], p[2]) && p[1] < 9.6)); }
  function isCovered(p) { return p[0] > 2.3 && p[0] < 53.1 && (Math.abs(p[2]) < 10.6 || (p[0] > 37 && p[0] < 44 && Math.abs(p[2]) < 13)); }
  // Shared planning approximation for sound received from the enclosed room.
  // A veranda is partly coupled; an open courtyard has no enclosed reverberant field.
  function roomCouplingAt(p) { return isInterior(p) ? 1 : isCovered(p) ? 0.3 : 0; }
  // Lowest structure above a point: beam undersides, veranda slab, roof lining.
  function structureAbove(x, z, y = 0) {
    const az = Math.abs(z);
    let best = null;
    for (const b of GEO.mainBeams) if (Math.abs(x - b.x) <= b.w / 2 + 0.05 && az <= b.zHalf && b.y0 > y) best = best === null ? b.y0 : Math.min(best, b.y0);
    for (const b of GEO.sideBeams) if (Math.abs(x - b.x) <= b.w / 2 + 0.05 && az >= b.zIn && az <= b.zOut && b.y0 > y) best = best === null ? b.y0 : Math.min(best, b.y0);
    if (best !== null) return { y: best, kind: 'beam' };
    if (x >= 5.2 && x <= 52.95 && az <= 7.25) return { y: liningY(z), kind: 'roof' };
    // 9–10 wings: gabled roof, underside 9.39 m at its ridge (x 40.56), falling ≈0.79 m per m.
    if (x >= 37.22 && x <= 43.9 && az <= 12.95) return { y: Math.max(6.8, 9.39 - 0.787 * Math.abs(x - 40.56)), kind: 'roof' };
    // Verandas: tiled lean-to roof, ≈7.15 m at the inner wall falling to ≈6.45 m at the arcade.
    if (x >= 5.2 && x <= 52.9 && az <= 10.45) return { y: 6.988 - 0.2225 * (az - 8.0), kind: 'roof' };
    return null;
  }

  function computeGeometry(data) {
    const AX = data.longitudinal;
    GEO.axes = AX;
    GEO.columnAxes = ['3', '4', '5', '6', '7', '8', '9', '10', '11'];
    GEO.columns = [];
    for (const k of GEO.columnAxes) for (const s of [-1, 1]) GEO.columns.push({ key: k, x: AX[k], z: s * 3.6, r: 0.31, y0: 0, y1: 9.4 });
    // Inner C/G walls at the 14.500 m clear faces, with each bay's arched opening.
    const bays = [['2′', '3'], ['3', '4'], ['4', '5'], ['5', '6'], ['6', '7'], ['7', '8'], ['8', '9'], ['10', '11'], ['11', '12']];
    const doorBays = new Set(['4–5', '8–9', '10–11']);
    for (const s of [-1, 1]) for (const [x0, x1] of [[5.475, 37.22], [43.9, 52.85]]) {
      const openings = bays.map(([a, b]) => {
        const c = (AX[a] + AX[b]) / 2, door = doorBays.has(`${a}–${b}`);
        return { x0: c - (door ? 1.115 : 1.125), x1: c + (door ? 1.115 : 1.125), y0: door ? -0.4 : 0.65, y1: 4.31 };
      }).filter(o => o.x1 > x0 && o.x0 < x1);
      GEO.walls.push({ z: s * 7.25, x0, x1, y0: -0.4, y1: 7.13, openings });
    }
    // Entrance façade (plane inside the wall, inner face at x 2.65): solid apart from the main door and
    // the two side doors, all open in the model's default state.
    GEO.walls.push({ x: 2.35, z0: -7.25, z1: 7.25, y0: -0.4, y1: 12.5, openings: [
      { z0: -1.25, z1: 1.25, y0: -0.4, y1: 4.6 }, { z0: -6.1, z1: -4.9, y0: -0.4, y1: 3.6 }, { z0: 4.9, z1: 6.1, y0: -0.4, y1: 3.6 }] });
    // Sanctuary (sanctuary.js): the lobed timber frame on the column line, the
    // lacquered chamber walls behind it and the two shrines in its side arches.
    // Lobed openings are stepped rectangles. Kept apart from GEO.walls, which the
    // cable router reads as the building's perimeter.
    const sx = window.CHURCH_SANCTUARY?.spec;
    GEO.sanctuary = { walls: [], boxes: [] };
    if (sx) {
      const { chamber: ch, centralArch: ca, sideArch: sa, wingX: wx, wingZ: wz } = sx;
      for (const s of [-1, 1]) {
        GEO.sanctuary.walls.push({ z: s * (ch.face + ch.outer) / 2, x0: ch.x0, x1: ch.x1, y0: 0.15, y1: ch.top, openings: [] });
        for (const e of [-1, 1]) GEO.sanctuary.boxes.push({ min: [wx - 0.31, 0.15, s * wz + e * 1.03 - 0.32], max: [wx + 1.01, 2.55, s * wz + e * 1.03 + 0.32] });
        // Shelf, and the lacquered wall that closes the bay behind the shrine up to the roof.
        GEO.sanctuary.boxes.push({ min: [wx - 0.35, 2.55, s * wz - 1.38], max: [wx + 1.01, 2.85, s * wz + 1.38] },
          { min: [wx + 0.42, 2.85, s * wz - 1.75], max: [wx + 0.55, 9.5, s * wz + 1.75] });
      }
      // Lined back wall of the chamber on axis 11, in front of the service room, open
      // for the crucifix niche; the niche's reveals and blue back wall close it behind.
      const n = sx.niche, top = n.spring + n.rise;
      GEO.sanctuary.walls.push({ x: 48.5, z0: -ca.half, z1: ca.half, y0: 0, y1: 12.5, openings: [
        { z0: -n.half, z1: n.half, y0: n.floor, y1: n.spring + n.rise * 0.4 }, { z0: -n.half * 0.5, z1: n.half * 0.5, y0: n.floor, y1: top - 0.1 }] });
      GEO.sanctuary.walls.push({ x: n.backX + 0.03, z0: -n.half - 0.2, z1: n.half + 0.2, y0: n.floor - 0.2, y1: top + 0.2, openings: [] });
      for (const s of [-1, 1]) GEO.sanctuary.walls.push({ z: s * (n.half + 0.03), x0: n.mouthX, x1: n.backX + 0.1, y0: n.floor - 0.2, y1: top + 0.2, openings: [] });
      GEO.sanctuary.walls.push({ x: sx.frameX, z0: -7.25, z1: 7.25, y0: 0, y1: 12.5, openings: [
        { z0: -ca.half, z1: ca.half, y0: 0, y1: ca.spring + 0.5 }, { z0: -ca.half * 0.58, z1: ca.half * 0.58, y0: 0, y1: ca.shoulder }, { z0: -ca.half * 0.36, z1: ca.half * 0.36, y0: 0, y1: ca.crown - 0.4 },
        ...[-1, 1].flatMap(s => [{ z0: s * wz - sa.half, z1: s * wz + sa.half, y0: 0, y1: sa.spring + 0.3 }, { z0: s * wz - sa.half * 0.5, z1: s * wz + sa.half * 0.5, y0: 0, y1: sa.crown - 0.25 }])] });
    }
    GEO.occluders = P.buildOccluders({
      columns: GEO.columns.map(c => ({ x: c.x, z: c.z, r: c.r, y0: 0, y1: 9.4 })),
      boxes: [...GEO.columns.map(c => ({ min: [c.x - 0.41, 0, c.z - 0.41], max: [c.x + 0.41, 0.6, c.z + 0.41] })), ...GEO.sanctuary.boxes],
      walls: [...GEO.walls, ...GEO.sanctuary.walls]
    });
  }

  /* ------------------------------------------- as-drawn structural members */
  // Section sheet 4 (vector PDF, measured): main tie beam +8.59…+9.18 m between
  // the D/E shafts and returning to the rafters at ±4.21 m; side beams
  // +6.66…+7.00 m from the C/G piers to the shafts; purlins ~0.50 m apart.
  function correctStructure() {
    const { roofs, building, interior } = ctx;
    const timber = interior.materials.timber;
    proposedTruss = new T.Group();
    proposedTruss.name = 'Proposed truss bracing and purlins — not on the drawings';
    proposedTruss.userData = { status: 'EARLIER VISUAL PROPOSAL', proposedTruss: true };
    building.add(proposedTruss);
    const moveNames = /^(Schematic transverse tie|Proposed roof truss diagonal|Proposed truss king post|Proposed truss connection block|Proposed timber knee brace|Timber knee brace · proposed section|Proposed longitudinal roof purlin|Proposed purlin before roof valley|Proposed purlin beyond roof valley)$/;
    const moving = [];
    building.updateMatrixWorld(true);
    building.traverse(o => { if (o.isMesh && moveNames.test(o.name)) moving.push(o); });
    const tieXs = new Set();
    for (const o of moving) {
      if (o.name === 'Schematic transverse tie') tieXs.add(Number(o.getWorldPosition(new T.Vector3()).x.toFixed(3)));
      proposedTruss.attach(o);
    }
    const asDrawn = new T.Group();
    asDrawn.name = 'Timber frame as drawn — section sheet 4';
    asDrawn.userData = { status: 'MEASURED FROM SECTION SHEET 4 (VECTOR PDF)', source: 'giao-xu-thach-bi-06 · drawing 4' };
    roofs.add(asDrawn);
    const member = (w, h, d, x, y, z, name) => {
      const m = new T.Mesh(new T.BoxGeometry(w, h, d), timber);
      m.position.set(x, y, z); m.name = name; m.castShadow = true; m.receiveShadow = true;
      m.userData = { status: 'AS DRAWN · SECTION SHEET 4', source: 'Measured on the vector section: tie +8.59…+9.18 m, side beams +6.66…+7.00 m' };
      asDrawn.add(m); return m;
    };
    // The beams carry the lacquer of the columns (sanctuary.js). Their ornament follows the approved
    // timber concept (references/01-timber-frame and the 7 October interior views): gilded border
    // lines and a carved cartouche on both faces, a band near each support, carved haunches under
    // the beams and carved ends. All of it is applied decoration (O01/J09 of the beam specification).
    const gilt = window.CHURCH_SANCTUARY?.materials?.gold, carved = window.CHURCH_SANCTUARY?.materials?.carve;
    const K = gilt && carved && window.CHURCH_CARVING?.create(T);
    const gild = (geometry, x, y, z, name) => {
      const m = new T.Mesh(geometry, gilt);
      m.position.set(x, y, z); m.name = name; m.receiveShadow = true;
      m.userData = { status: 'PROPOSED FINISH · RED LACQUER AND GILDING', source: 'references/02-sanctuary/concepts/09-sanctuary-approved-concept.png' };
      asDrawn.add(m); return m;
    };
    const ornament = (geometry, material, x, y, z, yaw, name) => {
      const m = new T.Mesh(geometry, material);
      m.position.set(x, y, z); m.rotation.y = yaw; m.name = name; m.castShadow = m.receiveShadow = true;
      m.userData = { status: 'CONCEPT ORNAMENT · NOT STRUCTURAL', detail: 'O01 / J09 applied ornament', source: 'references/01-timber-frame/full-hd/2026-10-07-09-carved-connection-detail.png', engineeringApproved: false };
      asDrawn.add(m); return m;
    };
    // A haunch is three meshes: the solid bracket in the beam finish, its carved leaves, its gilding.
    const haunch = (h, x, y, z, yaw, name) => { ornament(h.body, timber, x, y, z, yaw, name); ornament(h.carve, carved, x, y, z, yaw, name + ' · foliage'); ornament(h.gilt, gilt, x, y, z, yaw, name + ' · gilding'); };
    // Haunch runs stop short of the fittings that hang under the beams: the reading lights 1.0 m
    // from the column axis under the ties, the outer reading lights and the wall fans on the piers.
    const carving = K && {
      tieHaunch: K.haunch({ run: 0.8, rise: 0.62, thick: 0.16 }), longHaunch: K.haunch({ run: 0.95, rise: 0.6, thick: 0.14 }),
      sideHaunch: K.haunch({ run: 0.8, rise: 0.52, thick: 0.13, u0: 0.24 }), pierBracket: K.haunch({ run: 0.55, rise: 0.42, thick: 0.13, u0: 0 }),
      tieCartouche: K.cartouche({ len: 1.7, r: 0.17 }), sideCartouche: K.cartouche({ len: 1.1, r: 0.1 }), longCartouche: K.cartouche({ len: 1.5, r: 0.13 }),
      end: K.cluster({ a: 0.13, b: 0.24, c: 0.07, leaves: 8, blooms: 1, size: 0.15 })
    };
    const tieLine = new T.BoxGeometry(0.012, 0.035, 5.12), tieBand = new T.BoxGeometry(0.33, 0.62, 0.08), rosette = new T.CylinderGeometry(0.15, 0.15, 0.02, 20);
    const sideBand = new T.BoxGeometry(0.25, 0.37, 0.07), sideLine = new T.BoxGeometry(0.012, 0.03, 2.48);
    const axis9 = data().longitudinal['9'];
    GEO.mainBeams = [];
    for (const x of [...tieXs].sort((a, b) => a - b)) {
      member(0.3, 0.59, 8.42, x, 8.885, 0, 'Main tie beam 0.30 × 0.59 m · as drawn');
      GEO.mainBeams.push({ x, y0: 8.59, y1: 9.18, zHalf: 4.21, w: 0.3 });
      if (!gilt) continue;
      for (const f of [-1, 1]) {
        for (const y of [8.65, 9.12]) gild(tieLine, x + f * 0.153, y, 0, 'Main tie beam gilded border');
        if (carving) gild(carving.tieCartouche, x + f * 0.15, 8.885, 0, 'Main tie beam gilded rosette').rotation.y = f * Math.PI / 2;
        else gild(rosette, x + f * 0.156, 8.885, 0, 'Main tie beam gilded rosette').rotation.z = Math.PI / 2;
      }
      for (const s of [-1, 1]) {
        gild(tieBand, x, 8.885, s * 2.6, 'Main tie beam gilded band');
        if (!carving) continue;
        // No haunch on axis 9: the ambo key light and the presider light hang there, 0.45 and
        // 0.60 m from the column axes. Lighting coordination is an open item.
        if (Math.abs(x - axis9) > 0.01) haunch(carving.tieHaunch, x, 8.59, s * 3.6, s * Math.PI / 2, 'Main tie beam carved haunch');
        ornament(carving.end.body, carved, x, 8.83, s * 4.215, s > 0 ? 0 : Math.PI, 'Main tie beam carved end');
        ornament(carving.end.accent, gilt, x, 8.83, s * 4.215, s > 0 ? 0 : Math.PI, 'Main tie beam carved end · gilding');
      }
    }
    GEO.sideBeams = [];
    for (const k of ['3', '4', '5', '6', '7', '8', '9']) {
      const x = data().longitudinal[k];
      for (const s of [-1, 1]) {
        member(0.22, 0.34, 3.15, x, 6.83, s * 5.475, 'Side beam 0.22 × 0.34 m · as drawn');
        GEO.sideBeams.push({ x, y0: 6.66, y1: 7.0, zIn: 3.9, zOut: 7.05, side: s, w: 0.22 });
        if (!gilt) continue;
        for (const z of [4.2, 6.75]) gild(sideBand, x, 6.83, s * z, 'Side beam gilded band');
        for (const f of [-1, 1]) for (const y of [6.71, 6.95]) gild(sideLine, x + f * 0.113, y, s * 5.475, 'Side beam gilded border');
        if (!carving) continue;
        for (const f of [-1, 1]) gild(carving.sideCartouche, x + f * 0.11, 6.83, s * 5.475, 'Side beam gilded cartouche').rotation.y = f * Math.PI / 2;
        haunch(carving.sideHaunch, x, 6.66, s * 3.6, -s * Math.PI / 2, 'Side beam carved haunch');
        haunch(carving.pierBracket, x, 6.66, s * 7.07, s * Math.PI / 2, 'Side beam carved pier bracket');
      }
    }
    // Lengthwise beams on the column lines (B03 of the beam specification). The owner confirmed
    // that the frames are connected along the church at column-head level; the drawings give no
    // section. 0.24 × 0.45 m, top flush with the tie beams, is a visualization proxy on engineering
    // hold: nothing is mounted on it and it is not a support in structureAbove(). Bay 9–10 ends at
    // the sanctuary frame; bay 2′–3 has no column line.
    GEO.longBeams = [];
    const lineKeys = ['3', '4', '5', '6', '7', '8', '9', '10'], frameKey = window.CHURCH_SANCTUARY?.spec.frameAxis, two = k => k.padStart(2, '0'), borders = new Map();
    for (let i = 0; i < lineKeys.length - 1; i++) {
      const a = lineKeys[i], b = lineKeys[i + 1], xa = data().longitudinal[a], xb = data().longitudinal[b], x0 = xa + 0.3, x1 = xb - (b === frameKey ? 0.28 : 0.3), mid = (x0 + x1) / 2;
      for (const s of [-1, 1]) {
        const line = s < 0 ? 'D' : 'E', z = s * 3.6, id = `B03-${line}-${two(a)}-${two(b)}`;
        member(x1 - x0, 0.45, 0.24, mid, 8.955, z, 'Longitudinal column-line beam 0.24 × 0.45 m · concept proxy').userData = {
          memberId: id, status: 'USER CONFIRMED ARRANGEMENT · SECTION IS A VISUALIZATION PROXY', source: 'docs/beams-roof-connections/SPECIFICATION.md · B03',
          materialRole: 'timber', structuralRole: 'longitudinal column-line beam', sectionStatus: 'ENGINEERING HOLD', supports: [`${a}/${line}`, `${b}/${line}`],
          connectionIds: [`J04-${line}-${two(a)}`, `J04-${line}-${two(b)}`], engineeringApproved: false };
        GEO.longBeams.push({ id, x0, x1, z, y0: 8.73, y1: 9.18, w: 0.24 });
        if (!gilt) continue;
        const key = (x1 - x0).toFixed(3);
        if (!borders.has(key)) borders.set(key, new T.BoxGeometry(x1 - x0 - 0.5, 0.03, 0.012));
        for (const f of [-1, 1]) {
          for (const y of [8.79, 9.12]) gild(borders.get(key), mid, y, z + f * 0.123, 'Longitudinal column-line beam gilded border');
          if (carving) gild(carving.longCartouche, mid, 8.955, z + f * 0.12, 'Longitudinal column-line beam gilded cartouche').rotation.y = f > 0 ? 0 : Math.PI;
        }
        if (!carving) continue;
        haunch(carving.longHaunch, xa, 8.73, z, 0, 'Longitudinal column-line beam carved haunch');
        haunch(carving.longHaunch, xb, 8.73, z, Math.PI, 'Longitudinal column-line beam carved haunch');
      }
    }
    // Purlins every ~0.50 m across the slope, split at the 9–10 roof valleys.
    const L = 40.575, U = 9.45, Pr = 3.88, N = (U - 6.325) / Pr;
    const X = (12.472 - U) / LINING_SLOPE, O = (U - 7.13) / N;
    for (const s of [-1, 1]) for (let i = 0; i < 14; i++) {
      const z = 0.58 + i * 0.5, y = liningY(z) - 0.075;
      const spans = z < X ? [[5.475, 52.85]] : (() => { const e = (z - X) / ((7.36 - X) / O); return [[5.475, L - e - 0.1], [L + e + 0.1, 52.85]]; })();
      for (const [a, b] of spans) member(b - a, 0.12, 0.09, (a + b) / 2, y, s * z, 'Purlin · as drawn spacing ~0.50 m');
    }
    GEO.trussMoved = moving.length;
    buildFrameVariants(asDrawn);
    GEO.purlinsAsDrawn = 28;
    closeEntranceBay();
    entranceSlats = buildEntranceSlats();
  }
  /* ----------------------------------------------- timber frame variants */
  // Two frames for comparison. 'drawn' follows section sheet 4: round shafts
  // and a 0.59 m tie beam across the nave at +8.59 m. 'reference' follows the
  // reference interior (05-interior-day): square posts on tall carved stone
  // plinths rising to the rafters, a high collar with curved arch braces and
  // a short upper collar, and a longitudinal plate with brackets. No low tie,
  // so the nave is open to +10.9 m. Sections are visual; an engineer must
  // size the members and the joints and resolve the roof thrust.
  const REF = { collarY: 10.9, upperY: 11.75, post: 0.56 };
  // Arch brace: a quarter ellipse from the post face (z 3.3, +7.6 m) to the
  // collar soffit (z 1.7, +10.78 m).
  const ARCH = { z0: 1.7, z1: 3.3, y0: 7.6, y1: 10.78 };
  function braceY(az) {
    if (az >= ARCH.z1) return ARCH.y0;
    if (az <= ARCH.z0) return REF.collarY - 0.18;
    const u = (az - ARCH.z0) / (ARCH.z1 - ARCH.z0);
    return ARCH.y0 + (ARCH.y1 - ARCH.y0) * Math.sqrt(1 - u * u) - 0.1;
  }
  // Pendants hung from the drawn tie beam take the arch brace above them.
  function anchorFor(it) {
    if (state.settings.frameStyle === 'reference' && it.mount === 'pendant' && Math.abs((it.anchorY ?? 0) - 8.59) < 0.03 &&
      GEO.mainBeams.some(b => Math.abs(it.pos[0] - b.x) < 0.3)) return braceY(Math.abs(it.pos[2]));
    return it.anchorY;
  }
  function buildFrameVariants(asDrawn) {
    const { building } = ctx, im = ctx.interior.materials, timber = im.timber, stone = im.whiteStone, carve = ctx.mat?.darkTrim || im.stone;
    // The sanctuary's own lacquered frame keeps its axis in both variants.
    const axes = ['3', '4', '5', '6', '7', '8', '9', '10'].filter(k => k !== window.CHURCH_SANCTUARY?.spec.frameAxis), xs = axes.map(k => data().longitudinal[k]);
    drawnFrame = new T.Group(); drawnFrame.name = 'Timber frame · as drawn (round shafts and tie beams)'; building.add(drawnFrame);
    referenceFrame = new T.Group(); referenceFrame.name = 'Timber frame · reference interior (posts, collars, arch braces)'; building.add(referenceFrame);
    building.updateMatrixWorld(true);
    const move = [];
    building.traverse(o => {
      if (!o.isMesh) return;
      const near = xs.some(x => Math.abs(o.getWorldPosition(new T.Vector3()).x - x) < 0.5);
      if (/^(Main tie beam|Longitudinal column-line beam)/.test(o.name) || (near && /^(Central column|Column head|Carved stone pedestal cap|Timber shaft foot|Timber capital collar|Carved stone column base on the dais|Gilded column (band|capital)|Column carving)/.test(o.name))) move.push(o);
    });
    for (const o of move) drawnFrame.attach(o);
    const box = (w, h, d, x, y, z, mtl, name) => {
      const m = new T.Mesh(new T.BoxGeometry(w, h, d), mtl); m.position.set(x, y, z); m.name = name;
      m.castShadow = m.receiveShadow = true; m.userData = { status: 'REFERENCE-IMAGE VARIANT · SECTIONS ILLUSTRATIVE', source: 'references/00-overview/05-interior-day.png' };
      referenceFrame.add(m); return m;
    };
    const tube = (pts, r, name) => {
      const m = new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts.map(p => new T.Vector3(...p))), 24, r, 6, false), timber);
      m.name = name; m.castShadow = m.receiveShadow = true; referenceFrame.add(m); return m;
    };
    const P = REF.post, collarHalf = (LINING_RIDGE - REF.collarY - 0.14) / LINING_SLOPE, upperHalf = (LINING_RIDGE - REF.upperY - 0.1) / LINING_SLOPE;
    // Posts take the sanctuary finish, like the round shafts of the drawn frame.
    const lacquer = window.CHURCH_SANCTUARY?.materials?.wood || timber, gilt = window.CHURCH_SANCTUARY?.materials?.gold || timber;
    axes.forEach((k, i) => {
      const x = xs[i], floor = k === '10' ? 0.75 : 0, top = liningY(3.6) - 0.08;
      for (const s of [-1, 1]) {
        const z = s * 3.6;
        // Carved stone plinth (1.1 m) with panels on all four faces.
        box(0.92, 1.1, 0.92, x, floor + 0.55, z, stone, 'Carved stone plinth · reference');
        box(1.0, 0.1, 1.0, x, floor + 0.05, z, stone, 'Plinth foot moulding');
        box(0.98, 0.09, 0.98, x, floor + 1.06, z, stone, 'Plinth cap moulding');
        for (const [dx, dz, w, d] of [[0.465, 0, 0.02, 0.62], [-0.465, 0, 0.02, 0.62], [0, 0.465, 0.62, 0.02], [0, -0.465, 0.62, 0.02]])
          box(w, 0.66, d, x + dx, floor + 0.56, z + dz, carve, 'Plinth carved panel');
        // Square post to the rafter, with a moulded capital and bolster.
        box(P, top - floor - 1.1, P, x, (top + floor + 1.1) / 2, z, lacquer, 'Square timber post · reference');
        box(P + 0.12, 0.1, P + 0.12, x, floor + 1.17, z, gilt, 'Post base fillet');
        for (const y of [floor + 2.3, 7.4]) box(P + 0.05, 0.09, P + 0.05, x, y, z, gilt, 'Gilded post band');
        box(P + 0.14, 0.14, P + 0.14, x, 9.25, z, gilt, 'Post capital');
        box(P + 0.26, 0.1, P + 0.26, x, 9.37, z, gilt, 'Post capital abacus');
        box(1.5, 0.22, 0.4, x, 9.53, z, timber, 'Capital bolster under the plate');
        // Curved arch brace from the post to the collar, both faces of the truss.
        const arc = [];
        for (let k = 0; k <= 12; k++) { const t = k / 12 * Math.PI / 2; arc.push([x, ARCH.y0 + (ARCH.y1 - ARCH.y0) * Math.sin(t), s * (ARCH.z0 + (ARCH.z1 - ARCH.z0) * Math.cos(t))]); }
        tube(arc, 0.11, 'Curved arch brace · reference');
        // Queen post from the collar to the rafter, and an upper strut.
        box(0.18, liningY(collarHalf * 0.55) - REF.collarY - 0.1, 0.18, x, (liningY(collarHalf * 0.55) + REF.collarY) / 2, s * collarHalf * 0.55, timber, 'Queen post · reference');
      }
      box(0.26, 0.34, collarHalf * 2, x, REF.collarY, 0, timber, 'Collar beam · reference');
      box(0.22, 0.24, upperHalf * 2, x, REF.upperY, 0, timber, 'Upper collar · reference');
      box(0.18, REF.upperY - REF.collarY - 0.25, 0.18, x, (REF.upperY + REF.collarY) / 2, 0, timber, 'King strut · reference');
      // Longitudinal brackets from each post to the plate.
      for (const s of [-1, 1]) for (const d of [-1, 1]) if (!(k === '3' && d < 0) && !(k === '10' && d > 0))
        tube([[x + d * 0.3, 8.55, s * 3.6], [x + d * 0.55, 9.3, s * 3.6], [x + d * 1.15, 9.62, s * 3.6]], 0.08, 'Curved plate bracket · reference');
    });
    // Longitudinal plates along the post heads (axes 3–10).
    const plateEnd = data().longitudinal['10'];
    for (const s of [-1, 1]) box(plateEnd - xs[0] + 0.6, 0.3, 0.3, (xs[0] + plateEnd) / 2, 9.79, s * 3.6, timber, 'Longitudinal plate · reference');
    referenceFrame.visible = true;
  }

  // Optional timber slat acoustic panels in the entrance hall (≈75 m²): under the
  // terrace slab and along the upper band of the entrance wall, clear of the
  // fanlight and the exit sign. One instanced mesh, shown with the roof.
  let entranceSlats = null, slatMaterial = null;
  function buildEntranceSlats() {
    const boxes = [];
    for (let i = 0; i <= 143; i++) {
      const z = -7.15 + i * 0.1, y0 = Math.abs(z) < 1.75 ? 7.15 : 5.2;
      boxes.push([4.06, 8.115, z, 2.78, 0.05, 0.045], [2.675, (y0 + 8.08) / 2, z, 0.05, 8.08 - y0, 0.045]);
    }
    // The slats keep natural timber: the structural members are lacquered, these are an acoustic lining.
    const natural = window.CHURCH_SANCTUARY?.naturalTimber;
    slatMaterial = ctx.interior.materials.timber.clone();
    slatMaterial.name = 'Entrance hall acoustic slats · natural timber';
    if (natural) { slatMaterial.color.copy(natural.color); slatMaterial.map = natural.map; slatMaterial.bumpMap = natural.bumpMap; slatMaterial.roughness = natural.roughness; }
    const mesh = new T.InstancedMesh(new T.BoxGeometry(1, 1, 1), slatMaterial, boxes.length);
    const m = new T.Matrix4(), q = new T.Quaternion();
    boxes.forEach(([x, y, z, sx, sy, sz], i) => mesh.setMatrixAt(i, m.compose(new T.Vector3(x, y, z), q, new T.Vector3(sx, sy, sz))));
    mesh.instanceMatrix.needsUpdate = true;
    mesh.name = 'Entrance hall acoustic slats (option)';
    mesh.receiveShadow = true;
    ctx.scene.add(mesh);
    return mesh;
  }
  // The entrance hall between the façade (inner face x 2.65) and axis 2′ had no
  // roof, so the sky and the back of the shrines showed from the nave. The front
  // elevation puts a terrace at +8.39 m there (it carries the three shrines) and
  // the side elevation starts the main roof at axis 2, so the nave ends in a gable
  // wall above the terrace. Added to the roof group so plan and cutaway views stay open.
  function closeEntranceBay() {
    const facade = ctx.building.getObjectByName('Source-width centre entry facade');
    const plaster = facade?.material || ctx.mat.wall;
    const bay = new T.Group();
    bay.name = 'Entrance bay closure — terrace slab and nave gable';
    bay.userData = { status: 'INFERRED FROM THE FRONT AND SIDE ELEVATIONS · CONFIRM WITH CAD', source: 'Front elevation terrace +8.39 m; side elevation roof from axis 2' };
    ctx.roofs.add(bay);
    const add = (geometry, name, x = 0, y = 0, z = 0) => {
      const m = new T.Mesh(geometry, plaster);
      m.position.set(x, y, z); m.name = name; m.castShadow = true; m.receiveShadow = true;
      bay.add(m); return m;
    };
    const x0 = 2.66, x1 = 5.475, top = 8.39, under = 8.14, half = 7.4;
    add(new T.BoxGeometry(x1 - x0, top - under, 2 * half), 'Entrance terrace slab +8.39 m', (x0 + x1) / 2, (top + under) / 2, 0);
    for (const s of [-1, 1]) add(new T.BoxGeometry(x1 - x0, under - 7.13, 0.3), 'Entrance hall side return above the eaves', (x0 + x1) / 2, (under + 7.13) / 2, s * half);
    // Gable on axis 2′, 0.30 m thick: above the slab up into the roof build-up, plus
    // the two corners where the roof drops below the slab.
    const r = z => liningY(z) + 0.12, zTop = (r(0) - top) / LINING_SLOPE, zUnder = (r(0) - under) / LINING_SLOPE;
    const prism = (pts, name) => {
      const shape = new T.Shape(pts.map(([z, y]) => new T.Vector2(z, y)));
      const m = add(new T.ExtrudeGeometry(shape, { depth: 0.3, bevelEnabled: false }), name, x1 - 0.3);
      m.rotation.y = Math.PI / 2;
    };
    prism([[-zTop, top], [zTop, top], [0, r(0)]], 'Nave gable wall above the entrance terrace · axis 2′');
    for (const s of [-1, 1]) prism(s < 0 ? [[-half - 0.15, under], [-zUnder, under], [-half - 0.15, r(half + 0.15)]] : [[zUnder, under], [half + 0.15, under], [half + 0.15, r(half + 0.15)]], 'Gable corner below the terrace · axis 2′');
  }
  function data() { return ctx.data; }

  /* --------------------------------------------- legacy lights and fixtures */
  function detachLegacyFixtures() {
    const { interior, scene } = ctx;
    const legacy = interior.group.getObjectByName('Proposed warm lighting fixtures');
    GEO.legacy = { chandeliers: [], sconces: [] };
    if (legacy) {
      legacy.updateMatrixWorld(true);
      for (const c of legacy.children) if (c.name.startsWith('Proposed nave chandelier')) GEO.legacy.chandeliers.push(c.position.x);
      legacy.removeFromParent();
    }
    for (const l of interior.lights) scene.remove(l);
    interior.lights.length = 0;
    // The earlier façade spot lights (realism.js) become switchable fixtures.
    const facade = scene.children.filter(o => o.isSpotLight && !o.castShadow);
    for (const l of facade) { scene.remove(l); scene.remove(l.target); l.intensity = 0; }
    GEO.legacy.facadeLights = facade.length;
    // Replace the static control-board/rack placeholders with the independent
    // selectable electrical models at the same service-room locations.
    if (SIM.electrical) {
      const old = [];
      ctx.building.traverse(o => {
        if (/^(Service room LED ceiling panel$|Wall enclosure · |Enclosure handle$|DB-2 indicator$|Cable tray$|19-inch sound rack$|Rack unit face$|Rack status LED$|Label · (Main board|Lighting L1|Fans · speed|Sound · amps|DB-2 Towers))/.test(o.name)) old.push(o);
      });
      for (const o of old) o.removeFromParent();
    }
  }

  /* ----------------------------------------------------------- light pool */
  function uniformBudget(q) {
    const max = ctx.renderer.capabilities?.maxFragmentUniforms || 1024;
    const need = n => n.points * 4 + (n.spots + n.shadows) * 7 + n.shadows * 6 + 150;
    const out = { ...q };
    while (need(out) > max && (out.spots > 4 || out.points > 4)) {
      out.spots = Math.max(4, Math.floor(out.spots * 0.8)); out.points = Math.max(4, Math.floor(out.points * 0.8));
      // Preserve the same shadow slots on every supported light budget.
    }
    return out;
  }
  function createPool(qualityKey) {
    const { scene } = ctx;
    if (pool) for (const l of [...pool.points, ...pool.spots, ...pool.shadows]) { scene.remove(l); if (l.target) scene.remove(l.target); l.dispose?.(); }
    const light = new URLSearchParams(location.search).get('graphics') === 'light';
    const q = uniformBudget(QUALITY[light && qualityKey !== 'fast' ? 'fast' : qualityKey] || QUALITY.balanced);
    // The independent preview-resolution policy owns framebuffer size.
    if (window.CHURCH_PERFORMANCE?.renderer === ctx.renderer) window.CHURCH_PERFORMANCE.refresh();
    else if (ctx.renderer.setPixelRatio) ctx.renderer.setPixelRatio(light ? 1 : Math.min(window.devicePixelRatio || 1, 1.5));
    pool = { key: qualityKey, size: q, points: [], spots: [], shadows: [] };
    for (let i = 0; i < q.points; i++) {
      const l = new T.PointLight(0xffffff, 0, 0, 2); l.name = 'Simulator point light ' + i; l.castShadow = false;
      scene.add(l); pool.points.push(l);
    }
    const spot = (shadow, i) => {
      const l = new T.SpotLight(0xffffff, 0, 0, 0.5, 0.5, 2);
      l.name = `Simulator ${shadow ? 'shadow ' : ''}spot ${i}`; l.castShadow = shadow;
      if (shadow) {
        l.shadow.mapSize.set(light ? 512 : 1024, light ? 512 : 1024);
        l.shadow.bias = -0.00025; l.shadow.normalBias = 0.03; l.shadow.camera.near = 0.2; l.shadow.camera.far = 60;
      }
      scene.add(l); scene.add(l.target); return l;
    };
    for (let i = 0; i < q.spots; i++) pool.spots.push(spot(false, i));
    for (let i = 0; i < q.shadows && ctx.renderer.shadowMap.enabled; i++) pool.shadows.push(spot(true, i));
    lightDirty = true;
  }

  /* ------------------------------------------------------- placement proxies */
  function buildProxies() {
    proxyGroup = new T.Group();
    proxyGroup.name = 'Simulator placement proxies';
    const mat = new T.MeshBasicMaterial({ side: T.DoubleSide });
    const plane = (w, d, x, y, z, kind, extra = {}) => {
      const m = new T.Mesh(new T.PlaneGeometry(w, d), mat);
      m.rotation.x = -Math.PI / 2; m.position.set(x, y, z);
      m.userData = { kind, ...extra }; proxyGroup.add(m); return m;
    };
    const wall = (len, h, x, y, z, normal) => {
      const m = new T.Mesh(new T.PlaneGeometry(len, h), mat);
      m.position.set(x, y, z);
      m.rotation.y = Math.atan2(normal[0], normal[2]);
      m.userData = { kind: 'wall', normal }; proxyGroup.add(m); return m;
    };
    plane(50.9, 14.5, 27.65, 0, 0, 'floor');
    plane(8.9, 7.2, 44.2, 0.75, 0, 'floor');
    for (const s of [-1, 1]) {
      plane(12.3, 3.65, 46.48, 0.15, s * 5.425, 'floor');
      plane(47.7, 3.2, 29.05, -0.32, s * 8.85, 'floor');
      plane(6.68, 2.5, 40.56, -0.32, s * 11.7, 'floor');
      wall(31.75, 7.13, 21.35, 3.565, s * 7.25, [0, 0, -s]);
      wall(8.95, 7.13, 48.37, 3.565, s * 7.25, [0, 0, -s]);
      wall(47.7, 6.3, 29.05, 2.83, s * 10.3, [0, 0, -s]);
      wall(47.7, 8.4, 29.05, 2.1, s * 10.55, [0, 0, s]);
      plane(47.7, 3.05, 29.05, 6.0, s * 8.82, 'ceiling');
    }
    // Inner faces of the lacquered sanctuary chamber walls.
    for (const w of GEO.sanctuary?.walls.filter(w => w.z) ?? []) {
      const s = Math.sign(w.z), face = window.CHURCH_SANCTUARY.spec.chamber.face;
      wall(w.x1 - w.x0, 7.5, (w.x0 + w.x1) / 2, 4.5, s * (face - 0.01), [0, 0, -s]);
    }
    plane(4.18, 3.6, 50.76, 0.15, 0, 'floor');
    plane(9.1, 26.7, -3.55, -0.48, 0, 'floor');
    plane(140, 120, 20, -2.08, 0, 'floor');
    wall(14.5, 7.13, 5.6, 3.565, 0, [1, 0, 0]);
    wall(14.5, 7.13, 52.75, 3.565, 0, [-1, 0, 0]);
    for (const c of GEO.columns) {
      const m = new T.Mesh(new T.CylinderGeometry(c.r, c.r, 8.8, 20, 1, true), mat);
      m.position.set(c.x, 5.0, c.z); m.userData = { kind: 'column', cx: c.x, cz: c.z, r: c.r }; proxyGroup.add(m);
    }
    for (const b of GEO.mainBeams) {
      const m = new T.Mesh(new T.BoxGeometry(b.w, b.y1 - b.y0, b.zHalf * 2), mat);
      m.position.set(b.x, (b.y0 + b.y1) / 2, 0); m.userData = { kind: 'beam', beam: b }; proxyGroup.add(m);
    }
    for (const b of GEO.sideBeams) {
      const m = new T.Mesh(new T.BoxGeometry(b.w, b.y1 - b.y0, b.zOut - b.zIn), mat);
      m.position.set(b.x, (b.y0 + b.y1) / 2, b.side * (b.zIn + b.zOut) / 2); m.userData = { kind: 'beam', beam: b }; proxyGroup.add(m);
    }
    // Roof lining planes (two slopes), facing down into the nave.
    for (const s of [-1, 1]) {
      const g = new T.BufferGeometry();
      const y0 = liningY(0), y1 = liningY(7.25);
      g.setAttribute('position', new T.Float32BufferAttribute([5.475, y0, 0, 52.85, y0, 0, 52.85, y1, s * 7.25, 5.475, y1, s * 7.25], 3));
      g.setIndex([0, 1, 2, 0, 2, 3]);
      const m = new T.Mesh(g, mat); m.userData = { kind: 'roof' }; proxyGroup.add(m);
    }
    proxyGroup.updateMatrixWorld(true);
    proxies = proxyGroup.children;
  }

  /* ----------------------------------------------------------- materials */
  function material(key) {
    if (!matLib[key]) {
      const d = CAT.MATERIALS[key] || { color: '#888888' };
      const m = new T.MeshStandardMaterial({ color: d.color, metalness: d.metalness ?? 0, roughness: d.roughness ?? 0.6 });
      m.name = 'Simulator · ' + key;
      matLib[key] = m;
      SIM.persistentLighting?.bindMaterial(m);
    }
    return matLib[key];
  }
  const GLOW = {
    warm: { cct: 2700, on: 7, off: [0.42, 0.4, 0.36] },
    lens: { cct: 3000, on: 12, off: [0.04, 0.04, 0.045] },
    red: { rgb: [1, 0.12, 0.05], on: 3.2, off: [0.32, 0.03, 0.03] },
    green: { rgb: [0.1, 1, 0.3], on: 2.2, off: [0.03, 0.2, 0.06] },
    fairy: { cct: 2400, on: 9, off: [0.3, 0.28, 0.22] },
    flame: { cct: 1850, on: 6, off: [0.3, 0.28, 0.25] },
    cool: { cct: 5000, on: 5, off: [0.5, 0.5, 0.5] }
  };

  /* ------------------------------------------------------ fixture models */
  function prototypeFor(type, params) {
    const key = type.id + '|' + JSON.stringify(params || {});
    if (protoCache.has(key)) {
      const proto = protoCache.get(key);
      protoCache.delete(key); protoCache.set(key, proto); // most recently used
      return proto;
    }
    const k = Kit();
    type.build(k, { params: params || {} });
    const groups = {};
    const bounds = new T.Box3();
    const tmp = new T.Box3();
    for (const [name, parts] of Object.entries(k.parts)) {
      if (!parts.length) continue;
      const byMat = new Map();
      for (const part of parts) {
        if (!byMat.has(part.mat)) byMat.set(part.mat, []);
        byMat.get(part.mat).push(part);
      }
      groups[name] = [...byMat.entries()].map(([mat, list]) => ({ mat, geo: mergeGeometries(list) }));
      const off = new T.Vector3(...pivotWorld(k, name));
      for (const g of groups[name]) { tmp.copy(g.geo.boundingBox).translate(off); bounds.union(tmp); }
    }
    const proto = { groups, pivots: k.pivots, rotorAxis: k.rotorAxis, glows: k.glows || [], bounds };
    protoCache.set(key, proto);
    return proto;
  }
  function activePrototypes() {
    const active = new Set([...fixtures.values()].map(fx => fx.proto));
    if (ghostPrototype) active.add(ghostPrototype);
    return active;
  }
  function prunePrototypes(protectedPrototype) {
    const active = activePrototypes();
    if (protectedPrototype) active.add(protectedPrototype);
    const unused = [...protoCache].filter(([, proto]) => !active.has(proto));
    for (const [key, proto] of unused.slice(0, Math.max(0, unused.length - UNUSED_PROTOTYPE_LIMIT))) {
      for (const group of Object.values(proto.groups)) for (const part of group) part.geo.dispose();
      protoCache.delete(key);
    }
  }
  function pivotWorld(k, name) {
    const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
    const hasOsc = k.parts.osc.length > 0 || (k.parts.head.length && k.pivots.osc.some(v => v));
    if (name === 'root' || name === 'stem') return [0, 0, 0];
    if (name === 'osc') return k.pivots.osc;
    if (name === 'head') return hasOsc ? add(k.pivots.osc, k.pivots.head) : k.pivots.head;
    if (name === 'rotor') return k.parts.head.length && k.rotorAxis === 'x' ? add(pivotWorld(k, 'head'), k.pivots.rotor) : k.pivots.rotor;
    return [0, 0, 0];
  }
  function mergeGeometries(list) {
    return window.CHURCH_BATCHES.merge(T, list);
  }

  const stemGeo = () => (stemGeo.g ||= new T.CylinderGeometry(1, 1, 1, 8, 1, true).translate(0, 0.5, 0));
  const canopyGeo = () => (canopyGeo.g ||= new T.CylinderGeometry(0.07, 0.07, 0.05, 14).translate(0, -0.025, 0));
  // A steel channel spanning the 4.50 m bay between two tie beams (HVLS support).
  const spreaderGeo = () => (spreaderGeo.g ||= new T.BoxGeometry(4.5, 0.2, 0.16).translate(0, -0.1, 0));

  class Fixture {
    constructor(item) {
      this.item = item;
      this.type = CAT.byId[item.type];
      this.root = new T.Group();
      this.root.name = 'Simulator · ' + item.name;
      this.root.userData.simId = item.id;
      this.oscAngle = 0;
      this.build();
    }
    build() {
      const { type, item } = this;
      this.root.clear();
      this.glowMat?.dispose();
      this.stem = this.canopy = null;
      const proto = this.proto = prototypeFor(type, item.params);
      const glowKind = GLOW[type.glow] ? type.glow : 'warm';
      this.glowMat = new T.MeshBasicMaterial({ color: 0x000000 });
      this.glowMat.name = 'Simulator glow · ' + glowKind;
      this.glowKind = glowKind;
      this.osc = proto.groups.osc || (proto.groups.head && type.fan?.oscillate) ? new T.Group() : null;
      if (this.osc) { this.osc.position.set(...proto.pivots.osc); this.root.add(this.osc); }
      this.head = proto.groups.head ? new T.Group() : null;
      if (this.head) { this.head.position.set(...proto.pivots.head); (this.osc || this.root).add(this.head); }
      this.rotor = proto.groups.rotor ? new T.Group() : null;
      if (this.rotor) {
        this.rotor.position.set(...proto.pivots.rotor);
        (this.head && proto.rotorAxis === 'x' ? this.head : this.root).add(this.rotor);
      }
      const castShadow = type.cat === 'decor' && type.id !== 'carpet';
      const parentOf = { root: this.root, head: this.head, rotor: this.rotor, osc: this.osc || this.root, stem: this.root };
      for (const [name, list] of Object.entries(proto.groups)) for (const { mat, geo } of list) {
        const mesh = new T.Mesh(geo, mat === 'glow' ? this.glowMat : material(mat));
        mesh.castShadow = castShadow && mat !== 'glow'; mesh.receiveShadow = true;
        mesh.userData.simId = item.id;
        parentOf[name].add(mesh);
      }
      if (item.mount === 'pendant') {
        const stemMat = type.cat === 'fan' ? material('bronze') : type.cat === 'speaker' ? material('black') : type.cat === 'decor' ? material('rope') : material(type.id.startsWith('chandelier') ? 'brass' : 'black');
        this.stem = new T.Mesh(stemGeo(), stemMat);
        this.stem.userData.simId = item.id;
        this.canopy = item.params?.spreader
          ? new T.Mesh(spreaderGeo(), material('steel'))
          : new T.Mesh(canopyGeo(), stemMat);
        this.root.add(this.stem, this.canopy);
      }
      this.glows = proto.glows.map(g => ({ ...g, world: new T.Vector3() }));
      this.update();
      prunePrototypes(proto); // also protects a constructor not in fixtures yet
    }
    group(name) { return name === 'head' ? this.head : name === 'rotor' ? this.rotor : name === 'osc' ? this.osc : this.root; }
    update() {
      const it = this.item, r = this.root;
      r.position.set(...it.pos);
      const mountYaw = (it.mountYaw ?? it.yaw ?? 0) * DEG;
      r.rotation.set(0, -mountYaw, 0);
      const yawRel = ((it.yaw ?? 0) * DEG) - mountYaw;
      const tilt = (it.tilt ?? 0) * DEG;
      if (this.osc) {
        this.osc.rotation.set(0, -(yawRel + this.oscAngle), 0);
        if (this.head) this.head.rotation.set(0, 0, tilt);
      } else if (this.head) this.head.rotation.set(0, -yawRel, tilt, 'YZX');
      if (this.stem) {
        const len = Math.max(0, (anchorFor(it) ?? it.pos[1]) - it.pos[1]);
        const radius = this.type.cat === 'fan' ? (this.type.fan.diameter > 2 ? 0.045 : 0.022) : this.type.cat === 'speaker' ? 0.005 : this.type.cat === 'decor' ? 0.006 : this.type.id.startsWith('chandelier') ? 0.016 : 0.012;
        this.stem.visible = this.canopy.visible = len > 0.03;
        this.stem.scale.set(radius, Math.max(len, 0.001), radius);
        this.canopy.position.set(0, len, 0);
      }
      r.visible = fixtureVisible(it);
      r.updateMatrixWorld(true);
      for (const g of this.glows) g.world.set(...g.p).applyMatrix4(this.group(g.group).matrixWorld);
      this.applyGlow();
    }
    lit() { const it = this.item; return !it.hidden && it.on && (it.dim ?? 1) > 0 && (this.type.light || this.type.glow); }
    applyGlow(view = 1) {
      const g = GLOW[this.glowKind];
      const on = this.lit();
      const base = g.rgb || P.adaptedLightColor(this.item.cct || this.type.light?.cct || g.cct || 2700, envMode === 'day' ? 5600 : 3600);
      if (on) {
        const k = g.on * (this.item.dim ?? 1) * Math.sqrt(160 / Math.max(40, adaptNow)) * (0.25 + 0.75 * view) * (this.flicker || 1);
        this.glowMat.color.setRGB(base[0] * k, base[1] * k, base[2] * k);
      } else this.glowMat.color.setRGB(...g.off);
    }
    forward() { return worldFrame(this.item).f; }
    dispose() {
      this.root.removeFromParent();
      this.glowMat.dispose();
    }
  }

  // Aim frame (forward, right, up) of an item in world coordinates.
  function worldFrame(it, extraTiltDeg = 0) {
    const yaw = (it.yaw ?? 0) * DEG, tilt = ((it.tilt ?? 0) + extraTiltDeg) * DEG;
    const f = [Math.cos(yaw) * Math.cos(tilt), Math.sin(tilt), Math.sin(yaw) * Math.cos(tilt)];
    const r = [-Math.sin(yaw), 0, Math.cos(yaw)];
    const u = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]];
    return { f, r, u };
  }

  /* ------------------------------------------------------------ emitters */
  function emitterWorld(fx, e) {
    const v = new T.Vector3(...e.pos).applyMatrix4((e.head && fx.head ? fx.head : fx.root).matrixWorld);
    return [v.x, v.y, v.z];
  }
  function lightEmitters(opts = {}) {
    const list = [];
    for (const fx of fixtures.values()) {
      const it = fx.item, L = fx.type.light;
      if (!L || it.hidden || !it.on) continue;
      const dim = it.dim ?? 1;
      if (dim <= 0) continue;
      const lumens = (it.lumens ?? L.lumens) * dim;
      const n = L.emitters.length;
      for (const e of L.emitters) {
        const lm = lumens / n, pos = emitterWorld(fx, e);
        const color = P.adaptedLightColor(it.cct ?? L.cct, envMode === 'day' ? 5600 : 3600);
        if (e.kind === 'spot') {
          const beam = it.beam ?? L.beam, field = (L.field || L.beam * 1.6) * beam / L.beam;
          const cone = P.spotCone(beam, field);
          list.push({ kind: 'spot', pos, dir: worldFrame(it).f, cd: P.peakCandela(lm, cone), cosOuter: cone.cosOuter, cosInner: cone.cosInner,
            angle: cone.angle, penumbra: cone.penumbra, lumens: lm, color, id: it.id, shadow: !!it.shadow, interior: isInterior(pos), flicker: fx.type.flicker });
        } else {
          const pair = /^(Side|Service) door lantern ·/.test(it.name) ? it.name.replace(/ · (front|rear)$/, '') : it.name.startsWith('Central front door lantern ·') ? 'Central front door lantern' : null;
          list.push({ kind: 'point', pos, cd: P.peakCandela(lm), lumens: lm, color, id: it.id, pair, interior: isInterior(pos), flicker: fx.type.flicker });
        }
      }
      if (opts.includeTiny === false) continue;
    }
    return list;
  }

  /* Assign actual emitters to the fixed renderer pool, prioritizing the view. */
  let interiorFlux = 0, poolScale = 0, viewOutside = false, renderCamera = null, lastPoolView = null;
  function updatePool() {
    if (!pool) return;
    const all = lightEmitters();
    interiorFlux = all.reduce((s, e) => s + (e.interior ? e.lumens : 0), 0);
    // From outside, interior fittings are hidden by the walls and roof; from
    // inside, the façade floods do not reach the nave. Draw the side in view.
    const emitters = all.filter(e => e.lumens >= 60 && (viewOutside ? !e.interior : e.interior || e.kind === 'point'));
    // Keep physical shadow sources fixed, including slots for switched-off lamps.
    // Their shadows must never jump to a nearer lamp when the viewer moves.
    const shadowIds = state.items.filter(it => it.shadow && !it.hidden).slice(0, pool.shadows.length).map(it => it.id);
    const wantShadow = shadowIds.map(id => all.find(e => e.id === id && e.kind === 'spot' && e.shadow));
    const shadowSet = new Set(wantShadow.filter(Boolean));
    const spots = chooseRenderEmitters(emitters.filter(e => e.kind === 'spot' && !shadowSet.has(e)), pool.spots.length);
    const points = chooseRenderEmitters(emitters.filter(e => e.kind === 'point'), pool.points.length);
    const assign = (light, e) => {
      if (!e) { light.intensity = 0; light.userData.emitter = null; return; }
      light.position.set(...e.pos);
      light.color.setRGB(...e.color);
      light.userData.emitter = e;
      if (light.isSpotLight) {
        light.angle = Math.min(e.angle, Math.PI / 2 - 0.01);
        light.penumbra = e.penumbra;
        light.target.position.set(e.pos[0] + e.dir[0], e.pos[1] + e.dir[1], e.pos[2] + e.dir[2]);
        light.target.updateMatrixWorld();
      }
      light.updateMatrixWorld();
    };
    pool.points.forEach((l, i) => assign(l, points[i]));
    pool.spots.forEach((l, i) => assign(l, spots[i]));
    const shadows = [...shadowSet];
    pool.shadows.forEach((l, i) => assign(l, wantShadow[i]));
    const detailed = new Set([...points, ...spots, ...shadows]);
    SIM.persistentLighting.update(all, detailed, Math.PI / adaptNow);
    pool.stats = { emitters: all.length, points: points.length, spots: spots.length, shadows: shadows.length, persistent: all.length - detailed.size, culled: 0 };
    if (renderCamera) lastPoolView = { pos: renderCamera.position.clone(), rotation: renderCamera.quaternion.clone() };
    poolScale = 0;
    scalePool();
    const shadowSignature = wantShadow.map(e => e ? [e.id, ...e.pos, ...e.dir, e.angle].join(',') : 'off').join('|');
    if (pool.shadowSignature !== shadowSignature) ctx.renderer.shadowMap.needsUpdate = true;
    pool.shadowSignature = shadowSignature;
  }
  // Physical candela → renderer units: S = π / adaptation illuminance.
  function scalePool() {
    const S = Math.PI / adaptNow;
    if (Math.abs(S - poolScale) < 1e-6 * S) return;
    poolScale = S;
    SIM.persistentLighting.scale(S);
    for (const l of [...pool.points, ...pool.spots, ...pool.shadows]) l.intensity = l.userData.emitter && l.userData.active !== false ? l.userData.emitter.cd * S : 0;
  }
  function chooseRenderEmitters(list, max) {
    if (list.length <= max) return list;
    const camera = renderCamera || church?.camera;
    if (!camera) return list.slice(0, max);
    const forward = camera.getWorldDirection(new T.Vector3());
    const importance = e => {
      const to = new T.Vector3(...e.pos).sub(camera.position);
      // A spotlight outside the frame can still illuminate the visible wall
      // or floor. Consider a point within its beam as well as its lens.
      const target = to.clone();
      if (e.dir) target.addScaledVector(new T.Vector3(...e.dir), 6);
      const facing = Math.max(to.clone().normalize().dot(forward), target.clone().normalize().dot(forward));
      const distance = Math.min(to.lengthSq(), target.lengthSq());
      return (0.15 + 0.85 * Math.max(0, facing)) * Math.sqrt(e.lumens) / (4 + distance);
    };
    // Decorative pairs receive two slots together so a reduced budget does
    // not leave just one side of a doorway casting light.
    const groups = new Map();
    list.forEach((e, index) => {
      const key = e.pair || index;
      if (!groups.has(key)) groups.set(key, { members: [], index, score: 0 });
      const group = groups.get(key); group.members.push(e); group.score += importance(e);
    });
    const ranked = [...groups.values()].map(g => ({ ...g, score: g.score / g.members.length }))
      .sort((a, b) => b.score - a.score || a.index - b.index);
    const chosen = [];
    for (const group of ranked) if (chosen.length + group.members.length <= max) chosen.push(...group.members);
    return chosen;
  }

  /* ------------------------------------------------------ sources for audio */
  const audienceCache = new Map();
  function audienceGrid() {
    if (audienceGrid.key === GEO.seats) return audienceGrid.cells;
    const cells = new Set();
    for (const s of GEO.seats) for (const dx of [-0.6, -0.3, 0, 0.3, 0.6]) for (const dz of [-0.3, 0, 0.3]) cells.add(Math.round((s.x + dx) * 2) + ':' + Math.round((s.z + dz) * 2));
    audienceGrid.key = GEO.seats; audienceGrid.cells = cells;
    return cells;
  }
  function reverbFactor(fx, src, spec) {
    const occ = state.settings.occupancy;
    const key = [fx.item.id, src.pos.map(v => v.toFixed(2)), src.f.map(v => v.toFixed(3)), GEO.seats.length, occ, spec.vb.join(',')].join('|');
    let frac = audienceCache.get(key);
    if (!frac) {
      const cells = audienceGrid();
      frac = P.audienceFraction(src, spec, (x, z) => cells.has(Math.round(x * 2) + ':' + Math.round(z * 2)), 1.0);
      if (audienceCache.size > 400) audienceCache.clear();
      audienceCache.set(key, frac);
    }
    const alpha = P.ABSORPTION.pewsEmpty.map((a, i) => a + (P.ABSORPTION.pewsOccupied[i] - a) * occ);
    return frac.map((f, b) => 1 - f * alpha[b]);
  }
  function speakerSources() {
    const out = [];
    for (const fx of fixtures.values()) {
      const it = fx.item, spec = fx.type.speaker;
      if (!spec || it.hidden) continue;
      const frame = worldFrame(it, spec.upward || 0);
      const pos = emitterWorld(fx, { pos: [0.06, 0, 0], head: true });
      const level1m = (spec.nominal + (it.level ?? 0) + state.settings.mixerDb);
      const watts = Math.pow(10, (level1m + 10 - spec.sensitivity) / 10);
      const src = { pos, ...frame, level1m, delayMs: it.delayMs || 0, response: spec.response, lineLength: spec.lineLength,
        // Loudspeakers outside the nave (verandas, courtyard) excite its reverberant field only through openings.
        coupling: isInterior(pos) ? 1 : isCovered(pos) ? 0.3 : 0.05 };
      const fullSpec = { ...spec, id: fx.type.id };
      if (spec.steerable) {
        // DSP beam: opening angle sets the vertical coverage above 500 Hz.
        const open = P.clamp(it.params?.opening ?? spec.opening ?? 20, 8, 45);
        fullSpec.vb = spec.vb.map((v, b) => b >= 2 ? Math.min(360, v * open / 15) : v);
      }
      src.reverbFactor = reverbFactor(fx, src, fullSpec);
      out.push({ id: it.id, item: it, on: it.on, spec: fullSpec, src, peakWatts: watts, overdriven: !spec.active && watts > spec.ratedW });
    }
    return out;
  }
  /* Time-align every loudspeaker to the talker (first microphone) so the
     voice is heard first and the system follows ~12 ms later (precedence). */
  function alignDelays({ record = true, haasMs = 12 } = {}) {
    const mic = micSources().find(m => m.on) || micSources()[0];
    const ref = mic ? [mic.pos[0] + mic.dir[0] * 0.45, mic.pos[1] + 0.05, mic.pos[2] + mic.dir[2] * 0.45] : [44.6, 2.3, 0];
    const c = roomModel().c;
    const changed = [];
    const all = speakerSources(), outside = [];
    for (const sp of all) {
      const it = sp.item;
      if (it.circuit === 'A4') { it.delayMs = 0; continue; }
      if (!isInterior(sp.src.pos)) { outside.push(sp); continue; }
      const { pos, f } = sp.src;
      const plane = floorY(pos[0] + f[0] * 6, pos[2] + f[2] * 6) + 1.2;
      let t = f[1] < -0.02 ? (pos[1] - plane) / -f[1] : 12;
      t = P.clamp(t, 3, 15);
      const aim = [pos[0] + f[0] * t, pos[1] + f[1] * t, pos[2] + f[2] * t];
      const dRef = Math.hypot(ref[0] - aim[0], ref[1] - aim[1], ref[2] - aim[2]);
      const delay = Math.max(0, (dRef - t) / c * 1000 + haasMs);
      it.delayMs = Math.round(delay * 10) / 10;
      changed.push({ id: it.id, delayMs: it.delayMs });
    }
    // Loudspeakers outside the walls are aligned to the inside system where the
    // two coverage areas meet (the nearest doors or windows): there both are
    // heard together, so neither the people inside by the windows nor those
    // outside hear the other system as a late echo.
    const inside = all.filter(sp => sp.item.circuit !== 'A4' && isInterior(sp.src.pos));
    const live = inside.filter(sp => sp.on).length ? inside.filter(sp => sp.on) : inside;
    const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
    for (const sp of outside) {
      const it = sp.item, pos = sp.src.pos, s = Math.sign(pos[2]) || 1;
      const meet = pos[0] < 2.65 ? [3.0, 1.2, P.clamp(pos[2], -2.4, 2.4)]
        : pos[0] > 52.85 ? [52.4, 1.2, P.clamp(pos[2], -3, 3)]
        : inWing(pos[0], P.clamp(pos[2], -12.9, 12.9)) && Math.abs(pos[2]) > 12.9 ? [pos[0], 1.2, s * 12.5]
        : [pos[0], 1.2, s * 7.0];
      let tIn = dist(ref, meet) / c;
      for (const o of live) tIn = Math.min(tIn, (o.item.delayMs || 0) / 1000 + dist(o.src.pos, meet) / c);
      const delay = Math.max(0, (tIn - dist(pos, meet) / c) * 1000 + haasMs);
      it.delayMs = Math.round(delay * 10) / 10;
      changed.push({ id: it.id, delayMs: it.delayMs });
    }
    markDirty();
    if (record) commit('Align loudspeaker delays');
    emit('items', {});
    return changed;
  }
  SIM.alignDelays = alignDelays;
  function fanSources() {
    const out = [];
    for (const fx of fixtures.values()) {
      const it = fx.item, f = fx.type.fan;
      if (!f || it.hidden) continue;
      const sp = f.speeds[Math.max(0, Math.min(f.speeds.length - 1, (it.speed ?? 2) - 1))];
      const running = it.on && (it.speed ?? 2) > 0;
      const pos = f.kind === 'ceiling' ? [it.pos[0], it.pos[1] - (f.rotorDrop || 0.17), it.pos[2]] : emitterWorld(fx, { pos: [0.1, 0, 0], head: true });
      out.push({ id: it.id, item: it, running, kind: f.exhaust ? 'exhaust' : f.kind, pos, diameter: f.diameter, flow: running ? sp.flow : 0, watts: running ? sp.watts : 0, dBA: running ? sp.dBA : 0, rpm: running ? sp.rpm : 0,
        yaw: (it.yaw ?? 0) * DEG, tilt: (it.tilt ?? 0) * DEG, oscillate: f.oscillate && it.oscillate !== false, sweepDeg: f.sweepDeg || 0, floorY: floorY(it.pos[0], it.pos[2]) });
    }
    return out;
  }
  function micSources() {
    const out = [];
    for (const fx of fixtures.values()) {
      if (!fx.type.mic || fx.item.hidden) continue;
      const it = fx.item;
      const pos = new T.Vector3(0.29, 0.36, 0).applyMatrix4(fx.root.matrixWorld);
      const { f } = worldFrame({ yaw: it.yaw, tilt: 0 });
      out.push({ id: it.id, item: it, pos: [pos.x, pos.y, pos.z], dir: f, on: it.on });
    }
    return out;
  }
  let roomCache = null;
  function roomModel() {
    const s = state.settings;
    const key = [s.occupancy, s.openings, s.roofFinish, s.entranceFinish, s.tempC, s.rh, GEO.seatingArea, bannerArea()].join('|');
    if (roomCache?.key !== key) roomCache = { key, room: P.roomModel({ occupancy: s.occupancy, openingsOpen: s.openings, roofFinish: s.roofFinish, entranceFinish: s.entranceFinish, tempC: s.tempC, rh: s.rh, seatingArea: GEO.seatingArea, bannerArea: bannerArea() }) };
    return roomCache.room;
  }
  function bannerArea() {
    let a = 0;
    for (const it of state.items) if (!it.hidden && CAT.byId[it.type]?.absorptionArea && isInterior(it.pos)) a += CAT.byId[it.type].absorptionArea;
    return a;
  }

  /* ----------------------------------------------------------- seats */
  function computeSeats() {
    const seats = { 2: [], 4: [] };
    const areas = { 2: 0, 4: 0 };
    ctx.building.traverse(o => {
      if (!o.isGroup || !o.name.startsWith('Proposed pew ') || !o.userData.proposedLengthM) return;
      const layout = o.userData.seatingLayout || 4;
      const L = o.userData.proposedLengthM, n = Math.floor((L - 0.075) / 0.55);
      const p = o.getWorldPosition(new T.Vector3());
      areas[layout] += L * 1.13;
      for (let i = 0; i < n; i++) {
        const off = (i - (n - 1) / 2) * 0.55;
        seats[layout].push({ x: p.x + 0.045, z: p.z + off, y: floorY(p.x, p.z), block: o.userData.seatingBlock || (Math.abs(p.z) > 4 ? 'outer' : 'central'), pew: o.name });
      }
    });
    // Benches in the 9–10 wings (choir and ministers), built by the realism layer.
    const wing = window.CHURCH_REALISM?.wingSeats || [];
    for (const layout of [2, 4]) { seats[layout].push(...wing.map(s => ({ ...s }))); areas[layout] += wing.length * 0.55 * 1.13; }
    GEO.seatsByLayout = seats;
    GEO.seatAreas = areas;
    refreshSeats();
  }
  function refreshSeats() {
    const blocks = ctx.interior.seatingState?.().blocks || window.CHURCH_PLANNING?.state?.().blocks || 4;
    GEO.seats = GEO.seatsByLayout[blocks] || [];
    GEO.seatingArea = (GEO.seatAreas?.[blocks] || 200) * 1.25;
    roomCache = null;
  }
  function fixtureVisible(it) {
    const blocks=ctx?.interior.seatingState?.().blocks || 4;
    // Two-block seating fills the nave floor; palms on the sanctuary platforms (x ≥ 38.2) stay.
    return !it.hidden && !(blocks===2 && it.type==='palm' && isInterior(it.pos) && it.pos[0]<38.2);
  }
  function refreshSeating() {
    if(!ctx)return;
    refreshSeats();
    for(const fx of fixtures.values())if(fx.item.type==='palm'){
      fx.update();syncCollider(fx.item);
      if(!fx.root.visible&&state.selectedId===fx.item.id)select(null);
    }
    markDirty();emit('seats');
  }

  /* ------------------------------------------------------------- prepare */
  function prepare(c) {
    ctx = c; T = c.THREE;
    Kit = CAT.makeKit(T);
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (saved?.settings) for (const key of Object.keys(defaults())) if (saved.settings[key] !== undefined) state.settings[key] = settingValue(key, saved.settings[key]);
    } catch { /* storage unavailable */ }
    computeGeometry(c.data);
    correctStructure();
    detachLegacyFixtures();
    buildProxies();
    simGroup = new T.Group(); simGroup.name = 'Simulator fixtures — switchable'; c.scene.add(simGroup);
    overlayGroup = new T.Group(); overlayGroup.name = 'Simulator analysis overlay'; c.scene.add(overlayGroup);
    SIM.persistentLighting.prepare(c);
    createPool(state.settings.quality);
    createHalos();
    c.data.simulator = { status: 'Interactive planning layer; analysis values are estimates', asDrawnFrame: { mainTie: '0.30 × 0.59 m at +8.59…+9.18 m', sideBeams: '0.22 × 0.34 m at +6.66…+7.00 m', purlinSpacing: '~0.50 m' }, conceptMembers: { longitudinalBeams: GEO.longBeams.map(b => b.id), section: '0.24 × 0.45 m at +8.73…+9.18 m · visualization proxy · ENGINEERING HOLD', source: 'docs/beams-roof-connections/SPECIFICATION.md · B03' }, movedProposedMembers: GEO.trussMoved };
    c.data.assumptions.push('Timber frame now follows section sheet 4 as measured on the vector PDF: main tie beam +8.59…+9.18 m (0.59 m deep), side beams +6.66…+7.00 m from the C/G piers to the D/E shafts, purlins about 0.50 m apart. The earlier king posts, diagonal braces and knee braces were not on the drawing and are now an optional "proposed bracing" layer.');
    c.data.assumptions.push('Lengthwise beams on the D and E column lines (axes 3 to 10, 14 members, IDs B03-D-03-04 to B03-E-09-10) follow the owner-confirmed arrangement of the beam specification. Their 0.24 × 0.45 m section at +8.73…+9.18 m is a visualization proxy on engineering hold; no equipment is mounted on them. Carved haunches, cartouches and beam ends are applied ornament from the approved concept art and carry nothing. No haunch stands under the axis-9 tie beam, where the ambo key light and the presider light hang close to the columns.');
  }
  function bindBatches(batches) {
    for (const batch of batches.values()) SIM.persistentLighting.bindObject(batch);
    trussBatch = batches.get(proposedTruss);
    setTrussVisible(state.settings.showTruss);
    frameBatches = { drawn: batches.get(drawnFrame), reference: batches.get(referenceFrame) };
    document.getElementById('frameStyle')?.addEventListener('change', e => setSetting('frameStyle', e.target.value));
    applyFrameStyle();
  }
  function applyFrameStyle() {
    const style = state.settings.frameStyle === 'reference' ? 'reference' : 'drawn';
    if (frameBatches.drawn) frameBatches.drawn.visible = style === 'drawn';
    if (frameBatches.reference) frameBatches.reference.visible = style === 'reference';
    for (const fx of fixtures.values()) fx.update();
    ctx.renderer.shadowMap.needsUpdate = true;
    const select = document.getElementById('frameStyle'); if (select) select.value = style;
  }
  function setTrussVisible(v) {
    if (trussBatch) trussBatch.visible = !!v;
    ctx.renderer.shadowMap.needsUpdate = true;
  }

  /* --------------------------------------------------------------- halos */
  function createHalos() {
    const g = new T.BufferGeometry();
    const N = 1024;
    g.setAttribute('position', new T.BufferAttribute(new Float32Array(N * 3), 3));
    g.setAttribute('aColor', new T.BufferAttribute(new Float32Array(N * 3), 3));
    g.setAttribute('aSize', new T.BufferAttribute(new Float32Array(N), 1));
    g.setDrawRange(0, 0);
    const m = new T.ShaderMaterial({
      uniforms: { uViewport: { value: 800 } },
      vertexShader: `attribute vec3 aColor; attribute float aSize; uniform float uViewport; varying vec3 vColor;
        void main(){ vColor=aColor; vec4 mv=modelViewMatrix*vec4(position,1.0); gl_Position=projectionMatrix*mv;
          float persp = projectionMatrix[2][3] == -1.0 ? -mv.z : 1.0;
          gl_PointSize = clamp(aSize*projectionMatrix[1][1]*uViewport*0.5/max(persp,0.05), 0.0, 256.0); }`,
      fragmentShader: `varying vec3 vColor; void main(){ vec2 c=gl_PointCoord-0.5; float d=length(c)*2.0; if(d>1.0) discard;
        float a = exp(-d*d*5.0)*(1.0-d); gl_FragColor=vec4(vColor*a, a);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
      transparent: true, depthWrite: false, blending: T.AdditiveBlending
    });
    haloPoints = new T.Points(g, m);
    haloPoints.name = 'Simulator lamp halos';
    haloPoints.frustumCulled = false;
    haloPoints.renderOrder = 5;
    ctx.scene.add(haloPoints);
  }
  function updateHalos(camera) {
    const g = haloPoints.geometry, pos = g.attributes.position.array, col = g.attributes.aColor.array, size = g.attributes.aSize.array;
    let n = 0;
    const cam = camera.position, strength = state.settings.halos;
    const base = Math.sqrt(160 / Math.max(40, adaptNow)) * strength;
    for (const fx of fixtures.values()) {
      if (!fx.lit() || !fx.glows.length) continue;
      const kind = GLOW[fx.glowKind];
      const c = kind.rgb || P.adaptedLightColor(fx.item.cct || fx.type.light?.cct || kind.cct || 2700, envMode === 'day' ? 5600 : 3600);
      let view = 1;
      if (fx.glowKind === 'lens' && fx.type.light?.beam) {
        const f = fx.forward(), g0 = fx.glows[0].world;
        const dx = cam.x - g0.x, dy = cam.y - g0.y, dz = cam.z - g0.z, d = Math.hypot(dx, dy, dz) || 1;
        const cosv = (dx * f[0] + dy * f[1] + dz * f[2]) / d;
        const cone = P.spotCone(Math.min(170, (fx.item.beam ?? fx.type.light.beam) * 1.6), Math.min(178, (fx.item.beam ?? fx.type.light.beam) * 2.4));
        view = P.smoothstep(cone.cosOuter, cone.cosInner, cosv);
      }
      fx.applyGlow(view);
      const k = (fx.item.dim ?? 1) * base * (fx.flicker || 1) * (0.15 + 0.85 * view) * (fx.glowKind === 'lens' ? 1.4 : 0.9);
      for (const gl of fx.glows) {
        if (n >= 1024) break;
        pos[n * 3] = gl.world.x; pos[n * 3 + 1] = gl.world.y; pos[n * 3 + 2] = gl.world.z;
        col[n * 3] = c[0] * k * 0.35; col[n * 3 + 1] = c[1] * k * 0.35; col[n * 3 + 2] = c[2] * k * 0.35;
        size[n] = gl.size * (0.6 + 0.4 * view);
        n++;
      }
    }
    g.setDrawRange(0, n);
    g.attributes.position.needsUpdate = g.attributes.aColor.needsUpdate = g.attributes.aSize.needsUpdate = true;
    haloPoints.material.uniforms.uViewport.value = ctx.renderer.domElement.height;
  }

  /* --------------------------------------------------------------- items */
  let nextId = 1;
  function newId(prefix) {
    let id;
    do { id = `${prefix}${nextId++}`; } while (state.items.some(i => i.id === id));
    return id;
  }
  function normalizeItem(raw) {
    const type = CAT.byId[raw.type];
    if (!type) return null;
    const num = (v, d) => Number.isFinite(Number(v)) ? Number(v) : d;
    const pos = Array.isArray(raw.pos) && raw.pos.length === 3 ? raw.pos.map(v => num(v, 0)) : null;
    if (!pos) return null;
    const prefix = { light: 'L', fan: 'F', speaker: 'S', decor: 'D' }[type.cat] || 'X';
    const params = {};
    for (const [k, p] of Object.entries(type.params || {})) {
      const value = raw.params?.[k] ?? p.value;
      params[k] = p.options ? (Object.hasOwn(p.options, value) ? value : p.value)
        : p.type === 'bool' ? !!value : P.clamp(num(value, p.value), p.min ?? -Infinity, p.max ?? Infinity);
    }
    const mount = type.mounts.includes(raw.mount) ? raw.mount : type.mounts[0];
    const it = {
      id: typeof raw.id === 'string' && raw.id ? raw.id : newId(prefix),
      type: type.id, name: String(raw.name || type.name).slice(0, 80), circuit: CIRCUITS[raw.circuit] ? raw.circuit : (type.circuit || 'DECOR'),
      mount, pos, yaw: num(raw.yaw, 0), tilt: num(raw.tilt, type.defaultTilt ?? 0), mountYaw: num(raw.mountYaw, num(raw.yaw, 0)),
      anchorY: raw.anchorY === undefined ? undefined : num(raw.anchorY, pos[1]), on: raw.on !== false, hidden: !!raw.hidden,
      dim: P.clamp(num(raw.dim, 1), 0, 1), params, note: raw.note ? String(raw.note).slice(0, 200) : undefined
    };
    if (type.light) {
      if (raw.lumens !== undefined) it.lumens = P.clamp(num(raw.lumens, type.light.lumens), 0, 100000);
      if (raw.cct !== undefined) it.cct = P.clamp(num(raw.cct, type.light.cct), 1800, 6500);
      if (raw.beam !== undefined && type.light.beam) it.beam = P.clamp(num(raw.beam, type.light.beam), 5, 160);
      it.shadow = raw.shadow ?? !!type.shadow;
    }
    if (type.fan) { it.speed = P.clamp(Math.round(num(raw.speed, 2)), 0, type.fan.speeds.length); it.oscillate = raw.oscillate !== false; }
    if (type.speaker) { it.level = P.clamp(num(raw.level, 0), -30, 12); it.delayMs = P.clamp(num(raw.delayMs, 0), 0, 400); }
    if (it.mount === 'pendant' && it.anchorY === undefined) it.anchorY = structureAbove(pos[0], pos[2], pos[1])?.y ?? pos[1];
    return it;
  }
  function addItem(raw, { record = true, select: doSelect = false } = {}) {
    const it = normalizeItem(raw);
    if (!it) return null;
    state.items.push(it);
    instantiate(it);
    if (record) commit('Add ' + it.name);
    if (doSelect) select(it.id);
    return it;
  }
  function instantiate(it) {
    const fx = new Fixture(it);
    fixtures.set(it.id, fx);
    simGroup.add(fx.root);
    syncCollider(it);
    markDirty(it);
  }
  function updateItem(id, patch, { record = true, rebuild = false } = {}) {
    const it = SIM.item(id);
    if (!it) return null;
    const before = JSON.stringify({ params: it.params, mount: it.mount });
    const normalized = normalizeItem({ ...it, ...patch });
    if (!normalized) return null;
    Object.assign(it, normalized);
    if (patch.pos && it.mount === 'pendant' && patch.anchorY === undefined) {
      const above = structureAbove(it.pos[0], it.pos[2], it.pos[1] + 0.05);
      if (above) it.anchorY = Math.max(above.y, it.pos[1]);
    }
    const fx = fixtures.get(id);
    if (rebuild || JSON.stringify({ params: it.params, mount: it.mount }) !== before) fx.build(); else fx.update();
    syncCollider(it);
    markDirty(it);
    if (record) commit('Edit ' + it.name);
    return it;
  }
  function removeItem(id, { record = true } = {}) {
    const i = state.items.findIndex(x => x.id === id);
    if (i < 0) return;
    const [it] = state.items.splice(i, 1);
    fixtures.get(id)?.dispose();
    fixtures.delete(id);
    if (!batchDepth) prunePrototypes();
    syncCollider({ id, hidden: true });
    if (state.selectedId === id) select(null);
    markDirty(it);
    if (record) commit('Remove ' + it.name);
  }
  function duplicateItem(id, offset = [0.6, 0, 0.6]) {
    const it = SIM.item(id);
    if (!it) return null;
    const copy = JSON.parse(JSON.stringify(it));
    delete copy.id;
    copy.pos = it.pos.map((v, k) => v + offset[k]);
    copy.name = it.name.replace(/( copy\d*)?$/, ' copy');
    return addItem(copy, { select: true });
  }
  function mirrorItem(id) {
    const it = SIM.item(id);
    if (!it) return null;
    const copy = JSON.parse(JSON.stringify(it));
    delete copy.id;
    copy.pos = [it.pos[0], it.pos[1], -it.pos[2]];
    copy.yaw = -it.yaw; copy.mountYaw = -(it.mountYaw ?? it.yaw);
    copy.name = mirrorName(it.name);
    return addItem(copy, { select: true });
  }
  function mirrorName(n) {
    if (/\bB\b/.test(n)) return n.replace(/\bB\b/, 'H');
    if (/\bH\b/.test(n)) return n.replace(/\bH\b/, 'B');
    return n + ' (mirrored)';
  }
  // Copies on every structural bay 3…9 (same offset from its nearest axis).
  function repeatAlongBays(id) {
    const it = SIM.item(id);
    if (!it) return [];
    const axes = ['3', '4', '5', '6', '7', '8', '9'].map(k => GEO.axes[k]);
    const ref = axes.reduce((a, b) => Math.abs(b - it.pos[0]) < Math.abs(a - it.pos[0]) ? b : a);
    const made = [];
    for (const x of axes) {
      if (Math.abs(x - ref) < 0.01) continue;
      const nx = it.pos[0] - ref + x;
      if (state.items.some(o => o.type === it.type && Math.hypot(o.pos[0] - nx, o.pos[2] - it.pos[2]) < 0.3 && Math.abs(o.pos[1] - it.pos[1]) < 0.3)) continue;
      const copy = JSON.parse(JSON.stringify(it));
      delete copy.id;
      copy.pos = [nx, it.pos[1], it.pos[2]];
      copy.name = it.name.replace(/\baxis \d+\b/i, '').trim() + ` · axis ${axisName(nx)}`;
      made.push(addItem(copy, { record: false }));
    }
    commit(`Repeat ${it.name} on ${made.length} bays`);
    return made;
  }
  function axisName(x) {
    let best = '', d = Infinity;
    for (const [k, v] of Object.entries(GEO.axes)) if (Math.abs(v - x) < d) { d = Math.abs(v - x); best = k; }
    return d < 0.6 ? best : `${best}${x > GEO.axes[best] ? '+' : '−'}${Math.abs(x - GEO.axes[best]).toFixed(1)}`;
  }
  SIM.axisName = axisName;

  const colliderById = new Map();
  function syncCollider(it) {
    const list = church?.colliders;
    const old = colliderById.get(it.id);
    if (old && list) { const i = list.indexOf(old); if (i >= 0) list.splice(i, 1); colliderById.delete(it.id); }
    const type = CAT.byId[it.type];
    if (!list || !fixtureVisible(it) || !type?.footprint || it.mount !== 'floor') return;
    // Items standing on a raised shelf (the shrine statues over the service doors) leave the floor below free.
    if (it.pos[1] - floorY(it.pos[0], it.pos[2]) > 2.1) return;
    const [w, d] = type.footprint, c = Math.cos(it.yaw * DEG), s = Math.sin(it.yaw * DEG);
    const hx = Math.abs(c) * w / 2 + Math.abs(s) * d / 2, hz = Math.abs(s) * w / 2 + Math.abs(c) * d / 2;
    const col = { label: it.name, minX: it.pos[0] - hx, maxX: it.pos[0] + hx, minZ: it.pos[2] - hz, maxZ: it.pos[2] + hz, kind: 'simulator', active: true };
    list.push(col); colliderById.set(it.id, col);
  }

  function markDirty(it) {
    if (batchDepth) {
      batchDirty = true;
      if (it) emit('items', { id: it.id });
      return;
    }
    // Object edits can move/hide a caster. Camera-only pool reassignment cannot.
    if (ctx?.renderer) ctx.renderer.shadowMap.needsUpdate = true;
    window.CHURCH_PERFORMANCE?.invalidate();
    lightDirty = true; analysisDirty = true;
    clearTimeout(analysisTimer);
    analysisTimer = setTimeout(() => emit('analysis-needed'), 160);
    scheduleSave();
    if (it) emit('items', { id: it.id });
  }

  /* ----------------------------------------------------- history & storage */
  function snapshot() { return JSON.stringify(state.items); }
  let lastSnapshot = '[]';
  function commit(label) {
    const snap = snapshot();
    if (snap === lastSnapshot) return;
    state.history.push({ label, items: lastSnapshot });
    if (state.history.length > 80) state.history.shift();
    state.future.length = 0;
    lastSnapshot = snap;
    scheduleSave();
    emit('history');
  }
  function restore(items) {
    batch(() => {
      for (const fx of fixtures.values()) fx.dispose();
      fixtures.clear();
      for (const [id] of colliderById) syncCollider({ id, hidden: true });
      state.items = [];
      for (const raw of JSON.parse(items)) { const it = normalizeItem(raw); if (it) { state.items.push(it); instantiate(it); } }
      lastSnapshot = snapshot();
      if (state.selectedId && !SIM.item(state.selectedId)) select(null);
      markDirty();
      emit('items', {});
    });
  }
  function undo() {
    const h = state.history.pop();
    if (!h) return false;
    state.future.push({ label: h.label, items: lastSnapshot });
    restore(h.items);
    emit('history');
    return h.label;
  }
  function redo() {
    const f = state.future.pop();
    if (!f) return false;
    state.history.push({ label: f.label, items: lastSnapshot });
    restore(f.items);
    emit('history');
    return f.label;
  }
  function scheduleSave() { clearTimeout(saveTimer); saveTimer = setTimeout(saveNow, 700); }
  function saveNow() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(exportLayout())); return true; } catch { return false; }
  }
  function exportLayout() {
    return { app: 'Thạch Bi church simulator', schema: SCHEMA, designVersion: window.CHURCH_SIM_DESIGN?.version, savedAt: new Date().toISOString(), scene: state.scene, settings: state.settings, customScenes: state.customScenes, items: state.items };
  }
  function importLayout(json, { record = true } = {}) {
    const obj = typeof json === 'string' ? JSON.parse(json) : json;
    if (!obj || !Array.isArray(obj.items)) throw new Error('This file does not contain a simulator layout.');
    if (obj.schema && obj.schema > SCHEMA) throw new Error('This layout was saved by a newer simulator version.');
    const valid = obj.items.map(normalizeItem).filter(Boolean);
    if (!valid.length && obj.items.length) throw new Error('No recognisable fixtures in this file.');
    if (obj.settings) for (const k of Object.keys(defaults())) if (obj.settings[k] !== undefined) state.settings[k] = settingValue(k, obj.settings[k]);
    if (Array.isArray(obj.customScenes)) state.customScenes = obj.customScenes.filter(s => s && s.name && s.items).slice(0, 20);
    const prev = lastSnapshot;
    restore(JSON.stringify(valid));
    if (record) { state.history.push({ label: 'Import layout', items: prev }); state.future.length = 0; emit('history'); }
    applySettings();
    return valid.length;
  }
  function resetDesign() {
    const prev = lastSnapshot;
    const design = window.CHURCH_SIM_DESIGN.recommended(GEO, SIM);
    restore(JSON.stringify(design));
    state.history.push({ label: 'Recommended design', items: prev }); state.future.length = 0;
    applyScene('Full service · evening', { record: false });
    alignDelays({ record: false });
    lastSnapshot = snapshot();
    emit('history');
  }

  function reviewedWingItems(side) {
    const D = window.CHURCH_SIM_DESIGN;
    return D.wingReviewTargets(D.recommended(GEO, SIM), side).map(normalizeItem);
  }
  function wingReviewStatus() {
    const fields = ['type', 'circuit', 'mount', 'pos', 'yaw', 'tilt', 'mountYaw', 'anchorY', 'hidden', 'lumens', 'beam', 'cct', 'oscillate', 'shadow', 'params'];
    const same = (a, b) => typeof a === 'number' && typeof b === 'number' ? Math.abs(a - b) < 1e-9
      : Array.isArray(a) && Array.isArray(b) ? a.length === b.length && a.every((v, n) => same(v, b[n]))
      : a && b && typeof a === 'object' && typeof b === 'object' ? Object.keys(a).length === Object.keys(b).length && Object.keys(a).every(k => same(a[k], b[k])) : a === b;
    const sides = ['B', 'H'].map(side => {
      const targets = reviewedWingItems(side);
      const ids = new Set(targets.map(it => it.id));
      const items = state.items.filter(it => ids.has(it.id) && !it.hidden);
      const mismatchingIds = targets.filter(target => {
        const prior = SIM.item(target.id);
        return !prior || fields.some(field => !same(prior[field], target[field]));
      }).map(it => it.id);
      const conflictIds = targets.filter(target => target.id.startsWith('F-WING-') && SIM.item(target.id) && SIM.item(target.id).name !== target.name).map(it => it.id);
      return { side, current: !mismatchingIds.length, mismatchingIds, conflictIds,
        counts: { chandeliers: items.filter(it => it.type === 'chandelier6Reading').length,
          wallFans: items.filter(it => it.type === 'fanWall' && it.circuit === 'F5').length,
          roofFans: items.filter(it => it.type === 'fanCeiling').length } };
    });
    return { sourceRevision: window.CHURCH_SIM_DESIGN.wingReviewRevision, sides };
  }
  function adoptWingReview(side) {
    const status = wingReviewStatus().sides.find(row => row.side === side);
    if (!status) throw new Error('Choose wing B or H.');
    if (status.conflictIds.length) throw new Error('Reserved IDs belong to renamed/custom equipment: ' + status.conflictIds.join(', ') + '. Export and resolve these records first.');
    if (status.current) return { backupKey: null, changedIds: [] };
    const previous = JSON.parse(JSON.stringify(exportLayout()));
    const history = state.history.slice(), future = state.future.slice(), selectedId = state.selectedId;
    const targets = reviewedWingItems(side);
    const scene = SCENES[state.scene] || {};
    const replacements = new Map(targets.map(target => {
      const prior = SIM.item(target.id);
      if (prior?.note) target.note = prior.note; // entered notes survive explicit adoption
      if (CAT.byId[target.type].light) {
        target.on = prior?.on ?? ((scene.L8 ?? 1) > 0);
        target.dim = prior?.dim ?? Math.min(1, scene.L8 ?? 1);
      } else {
        // The reviewed F5 low setting is separate from the old F1 roof-fan
        // speed. Never inherit a different product's speed index.
        target.on = (scene.F5 ?? 1) > 0;
        target.speed = target.on ? 1 : 0;
      }
      return [target.id, target];
    }));
    const present = new Set(previous.items.map(it => it.id));
    const items = [...previous.items.map(it => replacements.get(it.id) || it), ...targets.filter(it => !present.has(it.id))];
    let suffix = Date.now(), backupKey;
    do { backupKey = STORAGE_KEY + '.before-wing-adoption.' + suffix++; } while (localStorage.getItem(backupKey));
    // A failed durable backup must leave the current layout and history intact.
    localStorage.setItem(backupKey, JSON.stringify(previous));
    try {
      importLayout({ ...previous, items });
      state.history[state.history.length - 1].label = 'Use reviewed wing ' + side + ' lights and fans';
      state.settings.wingReviewRevision = window.CHURCH_SIM_DESIGN.wingReviewRevision;
      if (!saveNow()) throw new Error('The updated layout could not be saved; the previous layout is retained.');
    } catch (error) {
      Object.assign(state.settings, previous.settings);
      state.customScenes = previous.customScenes;
      restore(JSON.stringify(previous.items));
      state.history = history; state.future = future;
      select(selectedId); applySettings(); emit('history');
      throw error;
    }
    emit('items', {});
    return { backupKey, changedIds: targets.map(it => it.id) };
  }
  SIM.wingReviewStatus = wingReviewStatus;
  SIM.adoptWingReview = adoptWingReview;
  function exportSchedule() {
    const rows = [['ID', 'Name', 'Category', 'Type', 'Circuit', 'Axis', 'X (m)', 'Z (m)', 'Height (m)', 'Aim yaw°', 'Aim tilt°', 'On', 'Dim %', 'Lumens', 'CCT K', 'Beam°', 'Watts', 'Fan speed', 'Speaker level dB', 'Delay ms', 'Notes']];
    for (const it of state.items) {
      const t = CAT.byId[it.type];
      const watts = itemWatts(it, true);
      rows.push([it.id, it.name, t.cat, t.name, it.circuit, axisName(it.pos[0]), it.pos[0].toFixed(3), it.pos[2].toFixed(3), it.pos[1].toFixed(2), Math.round(it.yaw), Math.round(it.tilt), it.on ? 'yes' : 'no',
        t.light ? Math.round((it.dim ?? 1) * 100) : '', t.light ? Math.round(it.lumens ?? t.light.lumens) : '', t.light ? (it.cct ?? t.light.cct) : '', t.light?.beam ? (it.beam ?? t.light.beam) : '',
        watts.toFixed(0), t.fan ? it.speed : '', t.speaker ? it.level : '', t.speaker ? it.delayMs : '', it.hidden ? 'hidden in model' : (it.note || '')]);
    }
    return rows.map(r => r.map(v => /[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : v).join(',')).join('\n');
  }

  /* ------------------------------------------------------ power & energy */
  function itemWatts(it, rated = false) {
    const t = CAT.byId[it.type];
    if (!t || it.hidden || (!rated && !it.on)) return 0;
    const dim = P.clamp(Number.isFinite(it.dim) ? it.dim : 1, 0, 1);
    if (t.light?.wattsPerBulb) return t.light.wattsPerBulb * CAT.bulbCount(it.params) * (rated ? 1 : dim);
    // Strings are rated per metre (no lumen rating to scale by).
    if (t.light?.wattsPerMetre) return t.light.wattsPerMetre * Math.max(0, Number.isFinite(it.params?.length) ? it.params.length : 12) * (rated ? 1 : dim);
    if (t.light) {
      const lumens = Math.max(0, Number.isFinite(it.lumens) ? it.lumens : t.light.lumens);
      return t.light.lumens > 0 ? t.light.watts * lumens / t.light.lumens * (rated ? 1 : 0.06 + 0.94 * dim) : 0;
    }
    if (t.fan) { const n = P.clamp(Math.round(Number.isFinite(it.speed) ? it.speed : 2), 0, t.fan.speeds.length), sp = t.fan.speeds[Math.max(0, n - 1)]; return rated ? t.fan.speeds[t.fan.speeds.length - 1].watts : (n > 0 ? sp.watts : 0); }
    if (t.speaker) {
      if (t.mic) return 0;
      const spec = t.speaker, level = spec.nominal + (it.level ?? 0) + state.settings.mixerDb;
      const peak = Math.pow(10, (level + 10 - spec.sensitivity) / 10);
      const avg = Math.min(peak, spec.ratedW) / 8 / 0.7 + (spec.active ? 25 : 6);
      return rated ? (spec.active ? spec.ratedW / 2 : spec.ratedW / 3) : avg;
    }
    return 0;
  }
  function powerSummary() {
    const byCircuit = {};
    let total = 0, rated = 0;
    for (const it of state.items) {
      const w = itemWatts(it), r = itemWatts(it, true);
      const c = byCircuit[it.circuit] ||= { circuit: it.circuit, label: CIRCUITS[it.circuit]?.label || it.circuit, watts: 0, rated: 0, count: 0, on: 0 };
      c.watts += w; c.rated += r; c.count++; if (it.on && !it.hidden) c.on++;
      total += w; rated += r;
    }
    // Currents at 230 V with a 0.9 power factor (LED drivers, capacitor-run fan
    // motors, class-D amplifiers). Each breaker is the smallest standard MCB
    // that carries the full connected load at ≤ 80 % (continuous duty); C-curve
    // because LED drivers and motors draw an inrush when switched on.
    const PF = 0.9, MCB = [6, 10, 16, 20, 25, 32, 40];
    for (const c of Object.values(byCircuit)) {
      c.amps = c.watts / (230 * PF);
      c.ratedAmps = c.rated / (230 * PF);
      c.mcb = MCB.find(a => a * 0.8 >= c.ratedAmps) || 63;
    }
    // Cable: each circuit runs from its board to its fittings (plan distance
    // along the walls + 6 m up and down). DB-2 needs one feeder from DB-1.
    const run = (b, c) => { const l = state.items.filter(i => i.circuit === c && !i.hidden); if (!l.length) return 0;
      return l.reduce((t, i) => t + Math.abs(i.pos[0] - b[0]) + Math.abs(i.pos[2] - b[2]), 0) / l.length + 6; };
    let saved = 0;
    for (const c of Object.values(byCircuit)) if (CIRCUITS[c.circuit]?.board === 'DB2') { c.runDB2 = run(BOARDS.DB2.pos, c.circuit); c.runDB1 = run(BOARDS.DB1.pos, c.circuit); saved += c.runDB1 - c.runDB2; }
    const feeder = Math.abs(BOARDS.DB1.pos[0] - BOARDS.DB2.pos[0]) + Math.abs(BOARDS.DB1.pos[2] - BOARDS.DB2.pos[2]) + 3;
    const s = state.settings;
    const kWhService = total * s.serviceHours / 1000;
    return { byCircuit: Object.values(byCircuit).sort((a, b) => a.circuit.localeCompare(b.circuit)), total, rated, amps: total / (230 * PF), ratedAmps: rated / (230 * PF), cable: { feeder, saved }, kWhService, kWhMonth: kWhService * s.servicesPerMonth, costMonth: kWhService * s.servicesPerMonth * s.tariff };
  }

  /* ---------------------------------------------------------------- scenes */
  const SCENES = {
    'Full service · evening': { L9: 1, L8: 1, L7: 0, L1: 1, L2: 1, L3: 1, L4: 1, LA: 1, LD: 1, L5: 1, L6: 1, E1: 1, X1: 0, F1: 2, F2: 0, F3: 0, A1: 1, A2: 1, A3: 0, A4: 1, MIC: 1, F4: 0, V1: 1, A5: 0, DECOR: 1, F5: 1 },
    'Weekday Mass': { L9: 1, L8: 0.75, L7: 0, L1: 0.75, L2: 0.6, L3: 0.8, L4: 0.5, LA: 0.4, LD: 0.6, L5: 1, L6: 0, E1: 1, X1: 0, F1: 2, F2: 0, F3: 0, A1: 1, A2: 0, A3: 0, A4: 0, MIC: 1, F4: 0, V1: 1, A5: 0, DECOR: 1, F5: 1 },
    'Prayer & adoration': { L9: 1, L8: 0.25, L7: 0, L1: 0.2, L2: 0.2, L3: 0.45, L4: 0.25, LA: 0.5, LD: 0.35, L5: 1, L6: 0, E1: 1, X1: 0, F1: 1, F2: 0, F3: 0, A1: 0, A2: 0, A3: 0, A4: 0, MIC: 1, F4: 0, V1: 1, A5: 0, DECOR: 1, F5: 1 },
    'Christmas & festivals': { L9: 1, L8: 1, L7: 1, L1: 1, L2: 1, L3: 1, L4: 1, LA: 1, LD: 1, L5: 1, L6: 1, E1: 1, X1: 1, F1: 2, F2: 0, F3: 3, A1: 1, A2: 1, A3: 0, A4: 1, MIC: 1, F4: 0, V1: 2, A5: 0, DECOR: 1, F5: 1 },
    // Courtyard horns on: for crowds outside. Inside, their sound comes back
    // through the open windows late enough to blur speech, so use only then.
    'Festival · courtyard overflow': { L9: 1, L8: 1, L7: 1, L1: 1, L2: 1, L3: 1, L4: 1, LA: 1, LD: 1, L5: 1, L6: 1, E1: 1, X1: 1, F1: 2, F2: 0, F3: 3, A1: 1, A2: 1, A3: 1, A4: 1, MIC: 1, F4: 0, V1: 2, A5: 1, DECOR: 1, F5: 1 },
    'Cleaning': { L9: 0, L8: 1, L7: 0, L1: 1, L2: 1, L3: 0.5, L4: 1, LA: 0, LD: 0, L5: 0, L6: 0, E1: 1, X1: 0, F1: 1, F2: 0, F3: 0, A1: 0, A2: 0, A3: 0, A4: 0, MIC: 0, F4: 0, V1: 2, A5: 0, DECOR: 1, F5: 1 },
    'Night security': { L9: 1, L8: 0, L7: 0, L1: 0, L2: 0, L3: 0, L4: 0.3, LA: 0, LD: 0, L5: 1, L6: 0, E1: 1, X1: 0, F1: 0, F2: 0, F3: 0, A1: 0, A2: 0, A3: 0, A4: 0, MIC: 0, F4: 0, V1: 0, A5: 0, DECOR: 1, F5: 0 },
    'All off': { L9: 0, L8: 0, L7: 0, L1: 0, L2: 0, L3: 0, L4: 0, LA: 0, LD: 0, L5: 0, L6: 0, E1: 1, X1: 0, F1: 0, F2: 0, F3: 0, A1: 0, A2: 0, A3: 0, A4: 0, MIC: 0, F4: 0, V1: 0, A5: 0, DECOR: 1, F5: 0 }
  };
  SIM.SCENES = SCENES;
  // Reading light each scene is meant to give on the books (lux, maintained).
  const SCENE_LUX = { 'Full service · evening': 200, 'Weekday Mass': 150, 'Prayer & adoration': 50, 'Christmas & festivals': 200, 'Festival · courtyard overflow': 200, 'Cleaning': 100 };
  SIM.sceneLuxTarget = () => state.scene in SCENE_LUX ? SCENE_LUX[state.scene] : state.scene && !SCENES[state.scene] ? 150 : state.scene ? null : 200;
  function applyScene(name, { record = true } = {}) {
    const custom = state.customScenes.find(s => s.name === name);
    if (custom) {
      for (const it of state.items) {
        const s = custom.items[it.id];
        if (s) { it.on = s.on; if (s.dim !== undefined) it.dim = s.dim; if (s.speed !== undefined) it.speed = s.speed; if (s.level !== undefined) it.level = s.level; }
        fixtures.get(it.id)?.update();
      }
    } else {
      const sc = SCENES[name];
      if (!sc) return false;
      for (const it of state.items) {
        let v = sc[it.circuit];
        if (v === undefined) continue;
        // A sub-board without power (feeder off on DB-1) cannot switch anything on.
        if (CIRCUITS[it.circuit]?.board === 'DB2' && state.settings.db2Feed === false) v = 0;
        const t = CAT.byId[it.type];
        // Scene fan levels 1/2/3 = low/normal/high; 5-step (VFD) fans map to 2/4/5.
        if (t.fan) { it.on = v > 0; if (v > 0) it.speed = t.fan.speeds.length >= 5 ? [0, 2, 4, 5][v] : Math.min(v, t.fan.speeds.length); }
        else if (t.light || it.circuit === 'X1') { it.on = v > 0; if (v > 0 && t.light) it.dim = Math.min(1, v); }
        else if (t.speaker) it.on = v > 0;
        else it.on = v > 0;
        fixtures.get(it.id)?.update();
      }
    }
    state.scene = name;
    markDirty();
    if (record) commit('Scene: ' + name);
    emit('items', {});
    emit('scene', name);
    return true;
  }
  SIM.saveScene = function (name) {
    const items = {};
    for (const it of state.items) items[it.id] = { on: it.on, dim: it.dim, speed: it.speed, level: it.level };
    state.customScenes = state.customScenes.filter(s => s.name !== name);
    state.customScenes.push({ name: String(name).slice(0, 40), items });
    state.scene = name;
    scheduleSave();
    emit('scene', name);
  };

  /* ---------------------------------------------------- settings & camera */
  function setSetting(key, value) {
    if (!(key in state.settings)) return;
    value = settingValue(key, value);
    state.settings[key] = value;
    if (key === 'quality') { createPool(value); }
    if (key === 'showTruss') setTrussVisible(value);
    if (key === 'frameStyle') applyFrameStyle();
    if (key === 'timberTone') applyTimberTone();
    if (['lensDeg', 'eyeHeight', 'walkSpeed'].includes(key)) applyCamera();
    if (['occupancy', 'openings', 'roofFinish', 'entranceFinish', 'tempC', 'rh'].includes(key)) roomCache = null;
    if (key === 'roofFinish') applyRoofFinish();
    lightDirty = true;
    window.CHURCH_PERFORMANCE?.invalidate();
    const displayOnly = ['adaptLux', 'autoExposure', 'quality', 'autoQuality', 'halos', 'lensDeg', 'eyeHeight', 'walkSpeed', 'showTruss', 'timberTone', 'snap', 'edit'].includes(key);
    if (!displayOnly) {
      analysisDirty = true;
      clearTimeout(analysisTimer);
      analysisTimer = setTimeout(() => emit('analysis-needed'), 120);
    }
    scheduleSave();
    emit('settings', { key, value });
  }
  function applySettings() {
    setTrussVisible(state.settings.showTruss);
    applyFrameStyle();
    applyTimberTone(); applyCamera(); applyRoofFinish();
    if (pool?.key !== state.settings.quality) createPool(state.settings.quality);
    emit('settings', {});
  }
  // Structural timber: 'reference' is the red lacquer of the approved sanctuary image, set up
  // in sanctuary.js for every beam and roof timber. The natural tones bring back the grain.
  const TIMBER = { reference: null, natural: '#ab8d6f', light: '#c9a57a', dark: '#7c5839' };
  let timberOriginal = null;
  function applyTimberTone() {
    const timber = ctx.interior.materials.timber, natural = window.CHURCH_SANCTUARY?.naturalTimber;
    timberOriginal ||= { color: timber.color.clone(), map: timber.map, bumpMap: timber.bumpMap, roughness: timber.roughness };
    const tone = TIMBER[state.settings.timberTone];
    const look = tone ? { ...(natural || timberOriginal), color: new T.Color(tone) } : timberOriginal;
    timber.color.copy(look.color); timber.map = look.map; timber.bumpMap = look.bumpMap; timber.roughness = look.roughness;
    timber.needsUpdate = true;
    if (slatMaterial) slatMaterial.color.set(tone || TIMBER.natural);
  }
  let liningOriginal = null;
  function applyRoofFinish() {
    const lining = ctx.interior.materials.lining;
    liningOriginal ||= lining.color.clone();
    if (state.settings.roofFinish === 'tile') lining.color.set('#c98f6d');
    else if (state.settings.roofFinish === 'acoustic') lining.color.set('#e8dcc4');
    else lining.color.copy(liningOriginal);
  }
  function applyCamera() {
    if (!church?.walkCamera) return;
    const cam = church.walkCamera, s = state.settings;
    const aspect = cam.aspect || 1.6;
    const h = P.clamp(s.lensDeg, 40, 110) * DEG;
    cam.fov = aspect >= 1 ? 2 * Math.atan(Math.tan(h / 2) / aspect) / DEG : P.clamp(s.lensDeg, 40, 100);
    cam.updateProjectionMatrix();
    if (church.walk) { church.walk.eyeHeight = P.clamp(s.eyeHeight, 1.0, 1.9); church.walk.speed = P.clamp(s.walkSpeed, 0.6, 3); }
  }

  /* --------------------------------------------------------- environment */
  function applyEnvironment() {
    envMode = document.body.dataset.lighting === 'evening' ? 'evening' : 'day';
    lightDirty = true;
    for (const fx of fixtures.values()) fx.applyGlow();
  }
  // Step down to a lighter light budget when walking stutters (under ~28 fps for 2 s).
  let slowTime = 0, fpsWindow = 0;
  function watchFrameRate(dt) {
    if (!dt || dt > 0.5 || !state.settings.autoQuality || state.settings.quality === 'fast') { slowTime = fpsWindow = 0; return; }
    fpsWindow += dt;
    slowTime += dt > 1 / 28 ? dt : -dt * 0.5;
    if (slowTime < 0) slowTime = 0;
    if (fpsWindow < 3 || slowTime < 2) return;
    const next = state.settings.quality === 'high' ? 'balanced' : 'fast';
    slowTime = fpsWindow = 0;
    setSetting('quality', next);
    emit('toast', `Rendering switched to “${QUALITY[next].label.split(' ·')[0]}” for smoother walking. All lamps keep their illumination, reflections and shadow sources.`);
  }
  function environmentFrame(dt, camera) {
    const s = state.settings;
    const roofOff = church?.uiState?.().roof === false;
    const p = camera.position;
    const insideTarget = roofOff || (isCovered([p.x, p.y, p.z]) && p.y < 12.6 && p.y > -0.6) ? 1 : 0;
    cameraInside += (insideTarget - cameraInside) * Math.min(1, dt * 3 || 1);
    let target = envMode === 'day' ? Math.max(900, s.adaptLux * 11) : s.adaptLux;
    if (s.autoExposure && envMode === 'evening') {
      const local = SIM.analysis?.sampleLux?.(p.x, p.z);
      target = local ? P.clamp(local * 0.75, 20, 900) : (cameraInside > 0.5 ? s.adaptLux : 30);
      if (cameraInside < 0.5) target = Math.min(target, 40);
    }
    if (s.autoExposure && envMode === 'evening') adaptNow += (target - adaptNow) * Math.min(1, (dt || 1) * 1.5);
    else adaptNow = target;
    if (pool) scalePool();
    const { hemisphere, sun, fill, scene } = ctx;
    if (envMode === 'evening') {
      const S = Math.PI / adaptNow;
      const Eind = P.indirectIlluminance(interiorFlux, roomModel().light);
      ambientNow = Eind;
      SIM.persistentLighting.indoorAmbient(Eind * 0.95);
      hemisphere.intensity = 1.6 * S;
      hemisphere.color.set('#9bb1cf');
      hemisphere.groundColor.set('#4c4038');
      sun.intensity = 0.35 * S; fill.intensity = 0.15 * S;
      scene.environmentIntensity = 0.04;
    } else {
      SIM.persistentLighting.indoorAmbient(0);
    }
  }

  /* ----------------------------------------------------------- selection */
  function select(id) {
    state.selectedId = id && SIM.item(id) ? id : null;
    updateSelectionHelper();
    emit('select', state.selectedId);
  }
  function updateSelectionHelper() {
    if (selectionHelper) { selectionHelper.removeFromParent(); selectionHelper.geometry.dispose(); selectionHelper.material.dispose(); selectionHelper = null; }
    const fx = fixtures.get(state.selectedId);
    if (!fx) return;
    const pts = [];
    const b = fx.proto.bounds.clone().expandByScalar(0.06);
    const c = [[b.min.x, b.min.y, b.min.z], [b.max.x, b.min.y, b.min.z], [b.max.x, b.max.y, b.min.z], [b.min.x, b.max.y, b.min.z], [b.min.x, b.min.y, b.max.z], [b.max.x, b.min.y, b.max.z], [b.max.x, b.max.y, b.max.z], [b.min.x, b.max.y, b.max.z]];
    const edges = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];
    const root = fx.root;
    root.updateMatrixWorld(true);
    for (const [a, bb] of edges) {
      pts.push(new T.Vector3(...c[a]).applyMatrix4(root.matrixWorld), new T.Vector3(...c[bb]).applyMatrix4(root.matrixWorld));
    }
    // Coverage guides: light cone footprint, loudspeaker −6 dB frame, fan jet.
    const it = fx.item;
    if (fx.type.light?.beam && fx.type.light.emitters.length) {
      const e = lightEmitters().find(x => x.id === it.id);
      if (e) coverageCone(pts, e.pos, e.dir, Math.acos(P.clamp(2 * Math.cos(((it.beam ?? fx.type.light.beam) / 2) * DEG) - 1, -1, 1)) / 1, (it.beam ?? fx.type.light.beam) / 2 * DEG);
    }
    if (fx.type.speaker) {
      const sp = speakerSources().find(s => s.id === it.id);
      if (sp) coverageFrustum(pts, sp.src, sp.spec.hb[4] / 2 * DEG, sp.spec.vb[4] / 2 * DEG);
    }
    if (fx.type.fan) {
      const f = fanSources().find(s => s.id === it.id);
      if (f) {
        const y = floorY(f.pos[0], f.pos[2]) + 0.6;
        const R = f.kind === 'ceiling' ? f.diameter * 1.8 : 0;
        if (R) ringPts(pts, [f.pos[0], y, f.pos[2]], R);
      }
    }
    const g = new T.BufferGeometry().setFromPoints(pts);
    selectionHelper = new T.LineSegments(g, new T.LineBasicMaterial({ color: 0x46c38a, transparent: true, opacity: 0.9, depthTest: false }));
    selectionHelper.renderOrder = 10;
    selectionHelper.name = 'Simulator selection';
    ctx.scene.add(selectionHelper);
  }
  function ringPts(pts, c, R, n = 48) {
    for (let i = 0; i < n; i++) {
      const a0 = i / n * 2 * Math.PI, a1 = (i + 1) / n * 2 * Math.PI;
      pts.push(new T.Vector3(c[0] + Math.cos(a0) * R, c[1], c[2] + Math.sin(a0) * R), new T.Vector3(c[0] + Math.cos(a1) * R, c[1], c[2] + Math.sin(a1) * R));
    }
  }
  function coverageCone(pts, pos, dir, _unused, half) {
    const d = new T.Vector3(...dir).normalize();
    const p0 = new T.Vector3(...pos);
    const up = Math.abs(d.y) > 0.9 ? new T.Vector3(1, 0, 0) : new T.Vector3(0, 1, 0);
    const a = new T.Vector3().crossVectors(d, up).normalize(), b = new T.Vector3().crossVectors(d, a).normalize();
    const ends = [];
    for (let i = 0; i < 24; i++) {
      const th = i / 24 * 2 * Math.PI;
      const ray = d.clone().multiplyScalar(Math.cos(half)).add(a.clone().multiplyScalar(Math.sin(half) * Math.cos(th))).add(b.clone().multiplyScalar(Math.sin(half) * Math.sin(th))).normalize();
      // Intersect with the local floor plane (or 30 m).
      const fy = floorY(p0.x + ray.x * 4, p0.z + ray.z * 4);
      const t = ray.y < -0.01 ? (p0.y - fy) / -ray.y : 30;
      ends.push(p0.clone().addScaledVector(ray, Math.min(t, 40)));
    }
    for (let i = 0; i < ends.length; i++) {
      pts.push(ends[i], ends[(i + 1) % ends.length]);
      if (i % 6 === 0) pts.push(p0.clone(), ends[i]);
    }
  }
  function coverageFrustum(pts, src, h, v) {
    const p0 = new T.Vector3(...src.pos);
    const f = new T.Vector3(...src.f), r = new T.Vector3(...src.r), u = new T.Vector3(...src.u);
    const corners = [[-h, -v], [h, -v], [h, v], [-h, v]].map(([a, b]) => {
      const ray = f.clone().add(r.clone().multiplyScalar(Math.tan(a))).add(u.clone().multiplyScalar(Math.tan(b))).normalize();
      const fy = floorY(p0.x + ray.x * 6, p0.z + ray.z * 6) + 1.2;
      const t = ray.y < -0.01 ? Math.min(40, (p0.y - fy) / -ray.y) : 25;
      return p0.clone().addScaledVector(ray, t);
    });
    for (let i = 0; i < 4; i++) pts.push(p0.clone(), corners[i], corners[i], corners[(i + 1) % 4]);
  }

  /* -------------------------------------------------------------- picking */
  const raycaster = () => (raycaster.r ||= new T.Raycaster());
  const ndc = () => (ndc.v ||= new T.Vector2());
  function rayFromEvent(ev) {
    const rect = ctx.renderer.domElement.getBoundingClientRect();
    ndc().set(((ev.clientX - rect.left) / rect.width) * 2 - 1, -((ev.clientY - rect.top) / rect.height) * 2 + 1);
    raycaster().setFromCamera(ndc(), church.camera);
    return raycaster().ray;
  }
  function pickFixture(ray) {
    let best = null, bestD = Infinity;
    const inv = new T.Matrix4(), local = new T.Ray(), hit = new T.Vector3();
    for (const fx of fixtures.values()) {
      if (fx.item.hidden || !fx.root.visible) continue;
      inv.copy(fx.root.matrixWorld).invert();
      local.copy(ray).applyMatrix4(inv);
      const box = fx.proto.bounds.clone().expandByScalar(0.08);
      if (fx.stem?.visible) box.expandByPoint(new T.Vector3(0, (fx.item.anchorY ?? fx.item.pos[1]) - fx.item.pos[1], 0));
      if (local.intersectBox(box, hit)) {
        hit.applyMatrix4(fx.root.matrixWorld);
        const d = hit.distanceTo(ray.origin);
        if (d < bestD) { bestD = d; best = fx; }
      }
    }
    return best ? { fx: best, distance: bestD } : null;
  }
  function surfaceHits(ray) {
    const rc = raycaster();
    rc.ray.copy(ray); rc.near = 0.05; rc.far = 400;
    return rc.intersectObjects(proxies, false);
  }
  // Resolve a placement for a catalogue type from a ray.
  function resolvePlacement(type, ray, base = {}) {
    const hits = surfaceHits(ray);
    for (const h of hits) {
      const kind = h.object.userData.kind;
      const p = h.point;
      const n = h.face ? h.face.normal.clone().transformDirection(h.object.matrixWorld) : new T.Vector3(0, 1, 0);
      if (type.mounts.includes('wall') && (kind === 'wall' || kind === 'column')) {
        let normal = kind === 'column' ? [p.x - h.object.userData.cx, 0, p.z - h.object.userData.cz] : (h.object.userData.normal || [n.x, 0, n.z]);
        const len = Math.hypot(normal[0], normal[2]) || 1; normal = [normal[0] / len, 0, normal[2] / len];
        const heading = Math.atan2(normal[2], normal[0]) / DEG;
        const y = base.keepHeight ? base.pos[1] : (type.defaultHeight !== undefined ? floorY(p.x + normal[0] * 0.6, p.z + normal[2] * 0.6) + type.defaultHeight : p.y);
        return { mount: 'wall', pos: [p.x + normal[0] * 0.005, Math.max(y, p.y - 20), p.z + normal[2] * 0.005], mountYaw: heading, yaw: base.keepAim ? base.yaw : heading, surface: kind };
      }
      if (type.mounts.includes('floor') && (kind === 'floor' || (kind === 'beam' && n.y > 0.5))) {
        const y = kind === 'beam' ? h.object.userData.beam.y1 : floorY(p.x, p.z);
        return { mount: 'floor', pos: [p.x, y, p.z], surface: kind };
      }
      if (type.mounts.includes('pendant') && ['beam', 'roof', 'ceiling', 'floor'].includes(kind)) {
        let x = p.x, z = p.z;
        if (state.settings.snap) {
          for (const b of GEO.mainBeams) if (Math.abs(x - b.x) < 0.6 && Math.abs(z) <= b.zHalf) x = b.x;
          for (const b of GEO.sideBeams) if (Math.abs(x - b.x) < 0.6 && Math.abs(z) >= b.zIn && Math.abs(z) <= b.zOut) x = b.x;
        }
        const above = structureAbove(x, z, kind === 'floor' ? floorY(x, z) : p.y - 0.05);
        if (!above) continue;
        const fy = floorY(x, z);
        let y = base.keepHeight ? base.pos[1] : above.y - (type.defaultDrop ?? 1);
        y = P.clamp(y, fy + 2.2, above.y);
        return { mount: 'pendant', pos: [x, y, z], anchorY: above.y, surface: above.kind };
      }
    }
    return null;
  }

  /* ------------------------------------------------- pointer interaction */
  let placing = null, drag = null, pointerDown = null;
  function beginPlacement(typeId, preset = {}) {
    cancelPlacement();
    const type = CAT.byId[typeId];
    if (!type) return false;
    placing = { type, preset };
    const proto = prototypeFor(type, preset.params || Object.fromEntries(Object.entries(type.params || {}).map(([k, p]) => [k, p.value])));
    ghostPrototype = proto;
    ghost = new T.Group();
    ghost.name = 'Simulator placement preview';
    for (const list of Object.values(proto.groups)) for (const { geo } of list) {
      const m = new T.Mesh(geo, new T.MeshBasicMaterial({ color: 0x46c38a, transparent: true, opacity: 0.45, depthTest: false }));
      m.renderOrder = 11; ghost.add(m);
    }
    ghost.visible = false;
    ctx.scene.add(ghost);
    prunePrototypes();
    document.body.classList.add('sim-is-placing');
    emit('placing', type);
    return true;
  }
  function cancelPlacement() {
    if (ghost) { ghost.removeFromParent(); ghost.traverse(o => o.material?.dispose?.()); ghost = null; }
    ghostPrototype = null;
    prunePrototypes();
    if (placing) { placing = null; document.body.classList.remove('sim-is-placing'); emit('placing', null); }
  }
  function installPointer() {
    const el = ctx.renderer.domElement;
    el.addEventListener('pointerdown', ev => {
      if (ev.button !== 0 || !ready) return;
      pointerDown = { x: ev.clientX, y: ev.clientY, time: performance.now() };
      if (placing) { ev.stopImmediatePropagation(); ev.preventDefault(); return; }
      if (!document.body.classList.contains('sim-open')) return;
      const ray = rayFromEvent(ev), hit = pickFixture(ray);
      const electricalHit = SIM.electrical?.pick(ray);
      if (electricalHit && (!hit || electricalHit.distance < hit.distance - 0.18)) {
        ev.stopImmediatePropagation(); ev.preventDefault();
        SIM.electrical.select(electricalHit.id); return;
      }
      if (!state.settings.edit) return;
      if (!hit) return;
      ev.stopImmediatePropagation(); ev.preventDefault();
      const it = hit.fx.item;
      // First click selects; only an already-selected fixture can be dragged,
      // so a fixture standing in front of another is never moved by accident.
      if (state.selectedId !== it.id) { select(it.id); return; }
      el.setPointerCapture?.(ev.pointerId);
      drag = { id: it.id, start: JSON.stringify(it), moved: false, pointerId: ev.pointerId };
    }, { capture: true });
    el.addEventListener('pointermove', ev => {
      if (!ready) return;
      if (placing) {
        const res = resolvePlacement(placing.type, rayFromEvent(ev));
        ghost.visible = !!res;
        if (res) {
          const yaw = res.mountYaw ?? placing.lastYaw ?? 0;
          ghost.position.set(...res.pos);
          ghost.rotation.set(0, -yaw * DEG, 0);
          placing.last = res;
        }
        return;
      }
      if (drag && drag.pointerId === ev.pointerId) {
        ev.stopImmediatePropagation();
        if (!drag.moved && Math.hypot(ev.clientX - pointerDown.x, ev.clientY - pointerDown.y) < 5) return;
        drag.moved = true;
        const it = SIM.item(drag.id);
        if (!it || it.locked) return;
        const type = CAT.byId[it.type];
        const dy = ev.clientY - (drag.lastY ?? ev.clientY);
        drag.lastY = ev.clientY;
        if (ev.shiftKey && it.mount !== 'floor') {
          // Shift-drag: raise or lower along the rod / wall (2 cm per pixel).
          const fy = floorY(it.pos[0], it.pos[2]);
          const top = it.mount === 'pendant' ? (it.anchorY ?? it.pos[1]) : fy + 12;
          const y = P.clamp(it.pos[1] - dy * 0.02, fy + (it.mount === 'pendant' ? 2.2 : 0.3), top);
          updateItem(drag.id, { pos: [it.pos[0], y, it.pos[2]] }, { record: false });
          updateSelectionHelper();
          return;
        }
        const res = resolvePlacement(type, rayFromEvent(ev), { pos: it.pos, keepHeight: it.mount !== 'floor', keepAim: true, yaw: it.yaw });
        if (res) {
          const patch = { pos: res.pos, mount: res.mount };
          if (res.mountYaw !== undefined) { patch.yaw = it.yaw + (res.mountYaw - (it.mountYaw ?? it.yaw)); patch.mountYaw = res.mountYaw; }
          if (res.anchorY !== undefined) patch.anchorY = res.anchorY;
          updateItem(drag.id, patch, { record: false });
          updateSelectionHelper();
        }
        return;
      }
      if (state.settings.overlay !== 'none') emit('hover', { ray: rayFromEvent(ev), ev });
    }, { capture: true });
    const end = ev => {
      if (placing && pointerDown && ev.type === 'pointerup') {
        ev.stopImmediatePropagation();
        const moved = Math.hypot(ev.clientX - pointerDown.x, ev.clientY - pointerDown.y);
        if (moved < 6 && placing.last) {
          const t = placing.type;
          const res = placing.last;
          const yaw = res.mountYaw ?? 180;
          const item = { type: t.id, name: placing.preset.name || t.name, ...placing.preset, mount: res.mount, pos: res.pos, mountYaw: res.mountYaw ?? yaw, yaw: placing.preset.yaw ?? yaw, anchorY: res.anchorY, tilt: placing.preset.tilt ?? t.defaultTilt ?? 0 };
          const it = addItem(item, { select: true });
          if (it) emit('placed', it);
          if (!ev.shiftKey) cancelPlacement();
        }
        pointerDown = null;
        return;
      }
      if (drag && drag.pointerId === ev.pointerId) {
        ev.stopImmediatePropagation();
        const it = SIM.item(drag.id);
        if (drag.moved && it && JSON.stringify(it) !== drag.start) commit('Move ' + it.name);
        drag = null;
      }
      pointerDown = null;
    };
    el.addEventListener('pointerup', end, { capture: true });
    el.addEventListener('pointercancel', () => { drag = null; pointerDown = null; }, { capture: true });
    window.addEventListener('keydown', ev => {
      if (!ready || /INPUT|SELECT|TEXTAREA/.test(ev.target.tagName) || document.querySelector('dialog[open]')) return;
      if (ev.key === 'Escape' && (placing || state.selectedId)) {
        if (placing) cancelPlacement(); else select(null);
        ev.stopImmediatePropagation();
        return;
      }
      const mod = ev.ctrlKey || ev.metaKey;
      if (mod && ev.key.toLowerCase() === 'z') { ev.preventDefault(); const l = ev.shiftKey ? redo() : undo(); if (l) emit('toast', (ev.shiftKey ? 'Redo: ' : 'Undo: ') + l); return; }
      if (mod && ev.key.toLowerCase() === 'y') { ev.preventDefault(); const l = redo(); if (l) emit('toast', 'Redo: ' + l); return; }
      if (!state.selectedId || !document.body.classList.contains('sim-open')) return;
      if (ev.key === 'Delete' || ev.key === 'Backspace') { ev.preventDefault(); removeItem(state.selectedId); }
      else if (mod && ev.key.toLowerCase() === 'd') { ev.preventDefault(); duplicateItem(state.selectedId); }
    }, { capture: true });
  }
  function focusItem(id) {
    const it = SIM.item(id);
    if (!it || !church) return;
    const p = it.pos, inside = isCovered(p), fy = floorY(p[0], p[2]);
    const dir = p[0] > 30 ? -1 : 1;
    const pos = inside
      ? [p[0] - dir * 5.5, Math.max(fy + 1.7, Math.min(p[1] + 1.2, 6.2)), P.clamp(p[2] * 0.55 + (p[2] >= 0 ? -1.4 : 1.4), -6.5, 6.5)]
      : [p[0] - 14, p[1] + 7, p[2] - 14 * Math.sign(p[2] || 1)];
    church.places['simulator-focus'] = { title: it.name, note: `${CAT.byId[it.type].name} · axis ${axisName(p[0])} · ${p[1].toFixed(2)} m`, pos, target: [p[0], p[1], p[2]], interior: inside };
    church.goTo('simulator-focus', { mode: 'explore', instant: true });
  }
  function setOverlay(kind) { setSetting('overlay', kind); emit('overlay', kind); }

  /* --------------------------------------------------------------- start */
  function start(api) {
    church = api;
    if (!church) return;
    computeSeats();
    applySettings();
    let loaded = false;
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (saved?.items?.length && saved.designVersion !== window.CHURCH_SIM_DESIGN.version) {
        // Saved from an older recommended design: keep it aside and start from the new one.
        localStorage.setItem(STORAGE_KEY + '.previous', JSON.stringify(saved));
        setTimeout(() => emit('toast', 'Loaded the updated recommended design. Your earlier layout is kept as a backup in this browser.'), 1500);
      } else if (saved?.items?.length) { importLayout(saved, { record: false }); state.scene = saved.scene || null; loaded = true; }
    } catch (e) { console.warn('Saved simulator layout ignored:', e.message); }
    if (!loaded) {
      for (const raw of window.CHURCH_SIM_DESIGN.recommended(GEO, SIM)) { const it = normalizeItem(raw); if (it) { state.items.push(it); instantiate(it); } }
      applyScene('Full service · evening', { record: false });
      alignDelays({ record: false });
    }
    // Additive migration keeps the user's saved layout and circuit edits.
    if (loaded && !state.settings.servicePanelsUpgraded && !state.items.some(it => it.type === 'servicePanel')) {
      for (const raw of window.CHURCH_SIM_DESIGN.recommended(GEO, SIM).filter(it => it.type === 'servicePanel')) addItem({ ...raw, on: SCENES[state.scene]?.L3 > 0 }, { record: false });
    }
    state.settings.servicePanelsUpgraded = true;
    const D = window.CHURCH_SIM_DESIGN;
    if (loaded && state.settings.lightingRevision !== D.lightingRevision) {
      const previous = exportLayout();
      try { localStorage.setItem(STORAGE_KEY + '.before-lighting-review', JSON.stringify(previous)); } catch {}
      const items = D.upgradeLighting(state.items, D.recommended(GEO, SIM), SCENES[state.scene]);
      importLayout({ ...previous, items }, { record: false });
    }
    state.settings.lightingRevision = D.lightingRevision;
    if (loaded && state.settings.facadeRevision !== D.facadeRevision) {
      const previous = exportLayout();
      try { localStorage.setItem(STORAGE_KEY + '.before-facade-review', JSON.stringify(previous)); } catch {}
      importLayout({ ...previous, items: D.upgradeFacade(state.items, D.recommended(GEO, SIM), SCENES[state.scene]) }, { record: false });
    }
    state.settings.facadeRevision = D.facadeRevision;
    if (loaded && state.settings.entranceRevision !== D.entranceRevision) {
      const previous = exportLayout();
      try { localStorage.setItem(STORAGE_KEY + '.before-entrance-review', JSON.stringify(previous)); } catch {}
      importLayout({ ...previous, items: D.upgradeEntrance(state.items, D.recommended(GEO, SIM)) }, { record: false });
    }
    state.settings.entranceRevision = D.entranceRevision;
    if (loaded && state.settings.sanctuaryRevision !== D.sanctuaryRevision) {
      const previous = exportLayout();
      try { localStorage.setItem(STORAGE_KEY + '.before-sanctuary-review', JSON.stringify(previous)); } catch {}
      importLayout({ ...previous, items: D.upgradeSanctuary(state.items, D.recommended(GEO, SIM), state.settings.sanctuaryRevision) }, { record: false });
    }
    state.settings.sanctuaryRevision = D.sanctuaryRevision;
    if (loaded && state.settings.wingReviewRevision !== D.wingReviewRevision) {
      const previous = exportLayout();
      // If a durable backup cannot be written, preserve the saved layout.
      try {
        localStorage.setItem(STORAGE_KEY + '.before-wing-review', JSON.stringify(previous));
        importLayout({ ...previous, items: D.upgradeWingReview(state.items, D.recommended(GEO, SIM)) }, { record: false });
        state.settings.wingReviewRevision = D.wingReviewRevision;
      } catch (error) { console.warn('Wing review migration skipped; saved layout retained:', error.message); }
    } else if (!loaded) state.settings.wingReviewRevision = D.wingReviewRevision;

    if (state.settings.stableLightingRevision !== '2026-10-06-physical-lighting') {
      state.settings.autoExposure = false;
      state.settings.stableLightingRevision = '2026-10-06-physical-lighting';
    }
    saveNow();
    lastSnapshot = snapshot();
    installPointer();
    new MutationObserver(applyEnvironment).observe(document.body, { attributes: true, attributeFilter: ['data-lighting'] });
    document.getElementById('colorToggle')?.addEventListener('change', () => setTimeout(applyTimberTone, 0));
    window.addEventListener('resize', applyCamera);
    applyEnvironment();
    applyCamera();
    ready = true;
    emit('ready', SIM);
    emit('analysis-needed');
  }

  /* --------------------------------------------------------------- frame */
  let lastPoolUpdate = 0;
  function frame(dt, mode, camera) {
    if (!ready || !camera) return;
    // The viewer redraws in the same task that switches day/evening, before the lighting
    // observer has run: without this, that frame put the evening sky levels back over the
    // day ones and the church stayed dark after returning to day.
    if ((document.body.dataset.lighting === 'evening' ? 'evening' : 'day') !== envMode) applyEnvironment();
    timeNow += dt || 0;
    watchFrameRate(dt);
    if (entranceSlats) entranceSlats.visible = state.settings.entranceFinish === 'slats' && ctx.roofs.visible !== false;
    environmentFrame(dt || 0, camera);
    // Fans: blades at real speed (capped visually), wall fans oscillate.
    for (const fx of fixtures.values()) {
      const f = fx.type.fan;
      if (f && fx.rotor) {
        const it = fx.item, running = it.on && !it.hidden && (it.speed ?? 0) > 0;
        const sp = f.speeds[Math.max(0, (it.speed || 1) - 1)];
        const target = running ? Math.min(sp.rpm, 420) / 60 * 2 * Math.PI : 0;
        fx.omega = (fx.omega || 0) + (target - (fx.omega || 0)) * Math.min(1, (dt || 0) * (running ? 0.9 : 0.35));
        if (fx.rotorAxis === 'x' || fx.proto.rotorAxis === 'x') fx.rotor.rotation.x += fx.omega * (dt || 0);
        else fx.rotor.rotation.y += fx.omega * (dt || 0);
        if (fx.osc && f.oscillate && it.oscillate !== false && running) {
          fx.oscPhase = (fx.oscPhase || 0) + (dt || 0) * 2 * Math.PI / 12;
          fx.oscAngle = Math.sin(fx.oscPhase) * (f.sweepDeg / 2) * DEG;
          const yawRel = (it.yaw ?? 0) * DEG - (it.mountYaw ?? it.yaw ?? 0) * DEG;
          fx.osc.rotation.y = -(yawRel + fx.oscAngle);
          fx.osc.updateMatrixWorld(true);
          for (const g of fx.glows) g.world.set(...g.p).applyMatrix4(fx.group(g.group).matrixWorld);
        }
      }
      if (fx.type.flicker && fx.lit()) fx.flicker = 0.88 + 0.12 * Math.abs(Math.sin(timeNow * 13.1 + fx.root.id) * Math.sin(timeNow * 7.3 + fx.root.id * 0.7));
    }
    // Spend the light budget where the viewer is: inside or outside the church.
    const outside = camera ? !isCovered([camera.position.x, camera.position.y, camera.position.z]) || camera.position.y > 14 : false;
    if (outside !== viewOutside) { viewOutside = outside; lightDirty = true; }
    const now = performance.now();
    renderCamera = camera;
    if (camera && now - lastPoolUpdate > 250 && (!lastPoolView ||
      camera.position.distanceToSquared(lastPoolView.pos) > 0.25 || Math.abs(camera.quaternion.dot(lastPoolView.rotation)) < 0.999)) lightDirty = true;
    if (lightDirty && (now - lastPoolUpdate > 60 || !pool?.stats)) { lightDirty = false; lastPoolUpdate = now; updatePool(); }
    updateHalos(camera);
    if (selectionHelper && drag) selectionHelper.visible = true;
    emit('frame', { dt, mode, camera });
  }

  SIM._debugPointer = () => ({ placing: !!placing, last: placing?.last || null, pointerDown, drag });
  SIM.overlayGroup = () => overlayGroup;
  SIM.GEO = GEO;
  SIM.poolStats = () => pool?.stats || null;
  SIM.resourceStats = () => {
    const active = activePrototypes();
    return { prototypes: protoCache.size, activePrototypes: active.size,
      unusedPrototypes: [...protoCache.values()].filter(p => !active.has(p)).length,
      unusedPrototypeLimit: UNUSED_PROTOTYPE_LIMIT, primitiveGeometries: Kit?.cacheSize() };
  };
  SIM.ambient = () => ({ indirectLux: ambientNow, adaptLux: adaptNow, inside: cameraInside, env: envMode });
  SIM.pickFixture = ev => pickFixture(rayFromEvent(ev));
  SIM.resolvePlacement = (typeId, ev) => resolvePlacement(CAT.byId[typeId], rayFromEvent(ev));
  SIM.itemWatts = itemWatts;
  SIM.isInterior = isInterior;
  SIM.roomCouplingAt = roomCouplingAt;
  SIM.inWing = inWing;
  SIM.liningY = liningY;
})();
