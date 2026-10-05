/* Electrical planning layer. Coordinates are metres in the shared world.
 * Shared power trunks + individual drops; audio trunks denote separate
 * home-run cable bundles, never mains outputs wired directly to speakers.
 * Enclosures and cable thickness are visualization proposals. No conductor,
 * protection, earthing or installation specification is inferred from art.
 */
(() => {
  'use strict';
  const SIM = window.CHURCH_SIMULATOR, CAT = window.CHURCH_SIM_CATALOG;
  if (!SIM) return;
  const SOURCES = {
    DB1: { ...SIM.BOARDS.DB1, size: [0.2, 1.1, 0.8], facing: 'x', color: '#c96440', board: 'DB1' },
    DB2: { ...SIM.BOARDS.DB2, size: [0.16, 0.62, 0.46], facing: 'x', color: '#dc9e29', board: 'DB2' },
    LC1: { label: 'LC-1 · Lighting & scene controls', where: 'Existing service-room lighting enclosure', pos: [48.895, 1.85, -0.55], size: [0.2, 0.9, 0.8], facing: 'x', color: '#dc9e29', board: 'DB1' },
    FC1: { label: 'FC-1 · Fan speed controls', where: 'Existing service-room fan enclosure', pos: [48.895, 1.95, 0.4], size: [0.2, 0.7, 0.6], facing: 'x', color: '#b46a48', board: 'DB1' },
    AV1: { label: 'AV-1 · Mixer / amplifier rack', where: 'Existing service-room sound rack', pos: [49.275, 0.95, 1.4], size: [0.8, 1.6, 0.62], facing: 'x', color: '#3985c2', board: 'DB1' }
  };
  const COLORS = { light: '#dc9e29', fan: '#b46a48', audio: '#3985c2', mic: '#8263b5', feeder: '#c84c52', decor: '#cb7a36' };
  const view = { visible: false, mode: 'building', board: 'all', kind: 'all', selected: null };
  let routes = [], layer, highlight, T, scene, savedVisibility = null, rebuildTimer;
  const objects = new Map(), enclosures = new Map();
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const length = p => p.slice(1).reduce((n, v, i) => n + Math.hypot(...v.map((a, k) => a - p[i][k])), 0);
  const clean = p => p.filter((v, i) => !i || v.some((a, k) => Math.abs(a - p[i - 1][k]) > 0.00001)).map(v => v.slice());
  const wired = it => { const t = CAT.byId[it.type]; return t.glow !== 'flame' && !!(t.light || t.fan || t.speaker || t.mic); };
  const circuitIndex = c => Math.max(0, Object.keys(SIM.CIRCUITS).indexOf(c));
  const height = (c, audio) => (audio ? 5.8 : 6.35) + circuitIndex(c) * 0.014;

  // Main perimeter: retain the missing C/G wall across the 9–10 wings as
  // ceiling containment, detouring around their outer wall / return walls.
  function perimeter(s, y) {
    return [[53.05, y, s * 7.36], [44.175, y, s * 7.36], [44.175, y, s * 13.24],
      [36.975, y, s * 13.24], [36.975, y, s * 7.36], [5.475, y, s * 7.36], [2.35, y, s * 7.36]];
  }
  function takeTo(path, stopX) {
    const out = [path[0]];
    for (let i = 1; i < path.length; i++) {
      const a = path[i - 1], b = path[i];
      if (Math.abs(a[0] - b[0]) > 0.01 && stopX <= Math.max(a[0], b[0]) && stopX >= Math.min(a[0], b[0])) {
        out.push([stopX, b[1], b[2]]); return out;
      }
      out.push(b);
    }
    return out;
  }
  function pierX(it) {
    let x = Math.max(2.35, Math.min(53.05, it.pos[0]));
    // Drop inside a solid pier beside the window/door, never through its void.
    for (const wall of SIM.GEO.walls.filter(w => w.z && Math.sign(w.z) === Math.sign(it.pos[2] || -1))) {
      const o = wall.openings.find(o => x > o.x0 - 0.1 && x < o.x1 + 0.1 && it.pos[1] < o.y1 + 0.12);
      if (o) x = Math.abs(x - o.x0) < Math.abs(x - o.x1) ? o.x0 - 0.18 : o.x1 + 0.18;
    }
    return x;
  }
  function trunkPath(source, s, y, endX) {
    const p = SOURCES[source].pos;
    if (source === 'DB2') return clean([p, [2.35, p[1], p[2]], [2.35, 7.65, p[2]],
      [2.35, 7.65, s * 7.36], [2.35, y, s * 7.36], ...takeTo(perimeter(s, y).reverse(), endX)]);
    return clean([p, [48.735, p[1], p[2]], [48.735, 4.02, p[2]], [48.735, 4.02, -3.6], [53.05, 4.02, -3.6],
      [53.05, y, -3.6], ...takeTo([[53.05, y, -3.6], ...perimeter(s, y)], endX)]);
  }
  function servicePanelRoute(it) {
    const p = SOURCES.LC1.pos, q = it.pos;
    return clean([p, [48.735, p[1], p[2]], [48.735, 4.02, p[2]], [q[0], 4.02, p[2]], [q[0], 4.02, q[2]], q]);
  }
  function branchPath(it, start) {
    const p = it.pos.slice(), s = Math.sign(p[2] || -1), x = start[0], y = start[1], z = start[2];
    const wing = Math.abs(z) > 12;
    if (it.mount !== 'pendant' && p[0] >= 5.475 && p[0] <= 53.05 && Math.abs(p[2]) < 7.2 && p[1] > 7.1) {
      if (p[0] < 5.8 || p[0] > 52.8) {
        const gx = p[0] < 5.8 ? 5.475 : 53.05;
        return clean([start, [gx, y, z], [gx, y, p[2]], [gx, p[1], p[2]], p]);
      }
      const uplight = it.type === 'uplight';
      return branchPath({ ...it, mount: 'pendant', anchorY: uplight ? 8.59 : SIM.liningY(p[2]) - 0.1 }, start);
    }
    if (it.mount === 'pendant') {
      const ay = it.anchorY ?? p[1], az = Math.abs(p[2]);
      if (!wing && az < 7.2 && Math.abs(ay - 8.59) < 0.08) {
        // Side beam → column riser → main tie → pendant cable.
        return clean([start, [x, 6.83, z], [x, 6.83, s * 3.6], [x, ay, s * 3.6], [p[0], ay, s * 3.6], [p[0], ay, p[2]], p]);
      }
      if (!wing && az < 7.2 && ay > 7.1) {
        // Follow the actual pitched lining; a horizontal ridge-height route
        // across to the eave would leave the roof envelope.
        return clean([start, [x, 7.02, z], [x, SIM.liningY(7.05) - 0.1, s * 7.05],
          [p[0], SIM.liningY(7.05) - 0.1, s * 7.05], [p[0], SIM.liningY(p[2]) - 0.1, p[2]], [p[0], ay, p[2]], p]);
      }
      return clean([start, [x, Math.min(ay, y), z], [p[0], Math.min(ay, y), z], [p[0], Math.min(ay, y), p[2]], [p[0], ay, p[2]], p]);
    }
    if (it.mount === 'floor' && p[1] < 1.6) {
      const fy = SIM.floorY(p[0], p[2]) - 0.12;
      return clean([start, [x, fy, z], [p[0], fy, z], [p[0], fy, p[2]], p]);
    }
    // Façade and tower devices return to the entrance wall, clear of doors.
    if (p[0] < 5.475) {
      if (Math.abs(p[2]) > 7.4) {
        // Stage ledge / pilaster route. The tower footprint steps in above
        // +8.39 m and +15.84 m; each higher riser returns along its ledge.
        const tz = s * 10.153;
        const out = [start, [2.35, 7.65, z], [2.35, 7.65, tz], [0.05, 7.65, tz]];
        for (const [h, tx] of [[8.39, 0.05], [15.84, 0.09], [23.14, 0.19]]) if (p[1] > h) {
          const last = out[out.length - 1]; out.push([last[0], h, tz], [tx, h, tz]);
        }
        const last = out[out.length - 1];
        return clean([...out, [last[0], p[1], tz], [p[0], p[1], tz], p]);
      }
      const door = SIM.GEO.walls.find(w => w.x)?.openings.find(o => p[2] > o.z0 && p[2] < o.z1 && p[1] < o.y1);
      const dz = door ? (p[2] < 0 ? door.z0 - 0.18 : door.z1 + 0.18) : p[2];
      return clean([start, [2.35, 7.65, z], [2.35, 7.65, dz], [2.35, p[1], dz], [2.35, p[1], p[2]], p]);
    }
    return clean([start, [x, p[1], z], [p[0], p[1], z], p]);
  }
  function makeRoutes() {
    const result = [], groups = new Map();
    function add(o, points) {
      const p = clean(points);
      result.push({ ...o, points: p, length: length(p), specification: 'Cable type / conductors / cross-section / conduit: pending electrical design' });
    }
    const b1 = SOURCES.DB1.pos, b2 = SOURCES.DB2.pos;
    const feeder = trunkPath('DB1', -1, 6.26, 2.35);
    add({ id: 'feeder:DB2', name: 'DB-1 → DB-2 feeder', source: 'DB1', board: 'DB2', circuit: 'DB2-FEED', kind: 'feeder', role: 'feeder', itemIds: [], color: COLORS.feeder, installation: 'Wall bands, wing perimeter containment, entrance wall riser' },
      [...feeder, [2.35, 7.65, -7.36], [2.35, 7.65, b2[2]], [2.35, b2[1], b2[2]], b2]);
    for (const id of ['AV1', 'LC1', 'FC1']) {
      const p = SOURCES[id].pos;
      add({ id: `feeder:${id}`, name: `DB-1 → ${id} equipment supply`, source: 'DB1', board: 'DB1', circuit: `${id}-SUPPLY`, kind: 'feeder', role: 'feeder', itemIds: [], color: COLORS.feeder, installation: 'Existing service-room wall tray / local equipment connection' },
        [b1, [48.735, b1[1], b1[2]], [48.735, 2.42, b1[2]], [48.735, 2.42, p[2]], [48.735, p[1], p[2]], p]);
    }
    for (const it of SIM.state.items.filter(i => !i.hidden && wired(i))) {
      const t = CAT.byId[it.type], audio = !!(t.speaker || t.mic);
      if (it.type === 'servicePanel') {
        add({ id: `local:${it.id}`, name: `L3 → ${it.name}`, source: 'LC1', board: 'DB1', circuit: 'L3', kind: 'light', role: 'local', itemIds: [it.id], color: COLORS.light, installation: 'Local service-room wall riser and ceiling conduit' }, servicePanelRoute(it));
        continue;
      }
      const source = audio ? 'AV1' : SIM.CIRCUITS[it.circuit]?.board === 'DB2' ? 'DB2' : t.fan ? 'FC1' : t.light ? 'LC1' : 'DB1';
      const kind = t.mic ? 'mic' : audio ? 'audio' : t.fan ? 'fan' : t.cat === 'decor' ? 'decor' : 'light';
      const feeds = [{ source, kind, audio }];
      if (t.speaker?.active) feeds.push({ source: 'DB1', kind: 'feeder', audio: false });
      for (const f of feeds) {
        const s = Math.sign(it.pos[2] || -1), key = `${f.source}:${it.circuit}:${f.kind}:${s}`;
        if (!groups.has(key)) groups.set(key, { ...f, circuit: it.circuit, s, items: [] });
        groups.get(key).items.push(it);
      }
    }
    for (const [key, g] of groups) {
      const y = height(g.circuit, g.audio), board = SOURCES[g.source].board;
      const xs = g.items.map(i => pierX(i));
      const endX = g.source === 'DB2' ? Math.max(...xs) : Math.min(...xs);
      const trunk = trunkPath(g.source, g.s, y, endX);
      const trunkId = `trunk:${key}`;
      add({ id: trunkId, name: `${g.circuit} · ${g.s < 0 ? 'B' : 'H'} · ${g.audio ? 'audio home-run bundle' : 'circuit trunk'}`, source: g.source, board, circuit: g.circuit,
        kind: g.kind, role: 'trunk', itemIds: g.items.map(i => i.id), color: COLORS[g.kind], installation: 'Concealed wall band above openings; ceiling containment at wing returns' }, trunk);
      for (const it of g.items) {
        const connection = trunkPath(g.source, g.s, y, pierX(it)), start = connection[connection.length - 1];
        const points = branchPath(it, start);
        add({ id: `drop:${key}:${it.id}`, name: `${g.circuit} → ${it.name}`, source: g.source, board, circuit: g.circuit, kind: g.kind,
          role: 'drop', itemIds: [it.id], trunkId, color: COLORS[g.kind], upstreamLength: length(connection), homeRun: g.audio,
          installation: it.mount === 'pendant' ? 'Wall / beam or roof containment, then pendant connection' : it.mount === 'floor' && it.pos[1] < 1.6 ? 'Pier drop, proposed underfloor conduit, local flexible connection' : 'Concealed pier / wall drop, local termination' }, points);
      }
    }
    return result;
  }

  // One merged mesh per run, retaining an independent selection ID. Drawn
  // diameter (48 mm) is exaggerated for readability, not a conduit schedule.
  function pipeGeometry(points, radius = 0.024) {
    const positions = [], indices = [], sides = 6;
    for (let i = 1; i < points.length; i++) {
      const a = new T.Vector3(...points[i - 1]), b = new T.Vector3(...points[i]), axis = b.clone().sub(a).normalize();
      const right = new T.Vector3().crossVectors(axis, Math.abs(axis.y) < 0.9 ? new T.Vector3(0, 1, 0) : new T.Vector3(1, 0, 0)).normalize();
      const up = new T.Vector3().crossVectors(axis, right), base = positions.length / 3;
      for (const p of [a, b]) for (let j = 0; j < sides; j++) {
        const angle = j / sides * Math.PI * 2;
        positions.push(...p.clone().addScaledVector(right, Math.cos(angle) * radius).addScaledVector(up, Math.sin(angle) * radius).toArray());
      }
      for (let j = 0; j < sides; j++) { const k = (j + 1) % sides; indices.push(base + j, base + k, base + sides + j, base + k, base + sides + k, base + sides + j); }
    }
    const geo = new T.BufferGeometry(); geo.setAttribute('position', new T.Float32BufferAttribute(positions, 3)); geo.setIndex(indices); geo.computeBoundingSphere(); return geo;
  }
  function disposeRuns() {
    for (const o of objects.values()) { o.removeFromParent(); o.geometry.dispose(); o.material.dispose(); }
    objects.clear();
  }
  function rebuild() {
    if (!layer) return;
    routes = makeRoutes(); disposeRuns();
    for (const route of routes) {
      const mesh = new T.Mesh(pipeGeometry(route.points, route.role === 'feeder' ? 0.032 : 0.024), new T.MeshBasicMaterial({ color: route.color }));
      mesh.name = 'Electrical · ' + route.name; mesh.userData.electricalId = route.id; layer.add(mesh); objects.set(route.id, mesh);
    }
    if (view.selected && !routes.some(r => r.id === view.selected) && !SOURCES[view.selected]) view.selected = null;
    for (const fx of SIM.fixtures.values()) fx.root.visible = !fx.item.hidden && (view.mode !== 'systems' || wired(fx.item));
    applyVisibility(); updateHighlight(); SIM.emit('electrical');
  }
  function init() {
    T = SIM.THREE; scene = SIM.church.scene;
    layer = new T.Group(); layer.name = 'Electrical systems · independent selectable routes'; scene.add(layer);
    for (const [id, b] of Object.entries(SOURCES)) {
      const group = new T.Group(); group.name = 'Electrical · ' + b.label; group.userData.electricalId = id;
      const box = new T.Mesh(new T.BoxGeometry(...b.size), new T.MeshStandardMaterial({ color: '#cdd4d6', roughness: 0.6 })); group.add(box); group.position.set(...b.pos);
      const faceSize = b.facing === 'x' ? [0.018, b.size[1] * 0.82, b.size[2] * 0.82] : [b.size[0] * 0.82, b.size[1] * 0.82, 0.018];
      const face = new T.Mesh(new T.BoxGeometry(...faceSize), new T.MeshBasicMaterial({ color: b.color }));
      if (b.facing === 'x') face.position.x = b.size[0] / 2 + 0.01; else face.position.z = b.size[2] / 2 + 0.01;
      group.add(face);
      for (let i = 0; i < (id === 'DB1' ? 12 : id === 'DB2' ? 6 : 4); i++) {
        const switchMesh = new T.Mesh(new T.BoxGeometry(0.04, 0.09, 0.04), new T.MeshBasicMaterial({ color: '#eff4ed' }));
        const u = (i % 6 - 2.5) * 0.08, v = Math.floor(i / 6) * 0.16;
        switchMesh.position.set(b.facing === 'x' ? b.size[0] / 2 + 0.03 : u, v, b.facing === 'x' ? u : b.size[2] / 2 + 0.03); group.add(switchMesh);
      }
      layer.add(group); enclosures.set(id, group);
    }
    rebuild();
    SIM.on('items', () => { clearTimeout(rebuildTimer); rebuildTimer = setTimeout(rebuild, 90); });
    SIM.on('select', id => { if (id && view.selected) { view.selected = null; updateHighlight(); SIM.emit('electrical'); } });
    SIM.on('frame', () => {
      // Re-apply isolation after the viewer's frame and material switches.
      if (savedVisibility) for (const [o] of savedVisibility) o.visible = false;
      if (savedVisibility) for (const fx of SIM.fixtures.values()) fx.root.visible = !fx.item.hidden && wired(fx.item);
    });
    const settings = document.getElementById('settingsPanel');
    if (settings) {
      const control = document.createElement('label'); control.className = 'switch-row';
      control.innerHTML = '<span>Electrical systems only</span><input id="electricalOnlyToggle" type="checkbox">';
      settings.querySelector('#roofToggle')?.closest('label')?.after(control);
      control.querySelector('input').addEventListener('change', e => { setMode(e.target.checked ? 'systems' : 'building'); if (e.target.checked) SIM.emit('electrical-selection'); });
    }
  }
  function matches(r) { return (view.board === 'all' || r.board === view.board) && (view.kind === 'all' || (view.kind === 'audio' ? ['audio', 'mic'].includes(r.kind) : !['audio', 'mic'].includes(r.kind))); }
  function applyVisibility() {
    if (!layer) return;
    layer.visible = view.visible;
    for (const r of routes) objects.get(r.id).visible = matches(r);
    for (const [id, o] of enclosures) o.visible = view.board === 'all' || SOURCES[id].board === view.board;
    if (highlight) highlight.visible = view.visible && (SOURCES[view.selected] ? enclosures.get(view.selected).visible : !!routes.find(r => r.id === view.selected && matches(r)));
  }
  function setMode(mode) {
    if (!scene) return;
    view.mode = mode;
    if (mode === 'systems' && !savedVisibility) {
      SIM.cancelPlacement(); SIM.setOverlay('none');
      savedVisibility = new Map();
      // Snapshot individual renderable nodes, not names or material buckets:
      // walls, roof, timber, furniture, trees, openings and terrain all vanish.
      scene.traverse(o => {
        if (!(o.isMesh || o.isLine || o.isPoints || o.isSprite)) return;
        for (let p = o; p; p = p.parent) if (p === layer || p.userData.simId || p.name === 'Simulator selection') return;
        savedVisibility.set(o, o.visible); o.visible = false;
      });
      view.visible = true;
    } else if (mode === 'building' && savedVisibility) {
      for (const [o, visible] of savedVisibility) o.visible = visible;
      savedVisibility = null;
    }
    // Non-powered decorative simulator objects also vanish during isolation.
    for (const fx of SIM.fixtures.values()) fx.root.visible = !fx.item.hidden && (mode !== 'systems' || wired(fx.item));
    const checkbox = document.getElementById('electricalOnlyToggle'); if (checkbox) checkbox.checked = mode === 'systems';
    applyVisibility(); SIM.emit('electrical');
  }
  function updateHighlight() {
    if (highlight) { highlight.removeFromParent(); highlight.geometry.dispose(); highlight.material.dispose(); highlight = null; }
    const route = routes.find(r => r.id === view.selected), board = enclosures.get(view.selected);
    if (route) highlight = new T.Mesh(pipeGeometry(route.points, 0.055), new T.MeshBasicMaterial({ color: '#49edab', depthTest: false }));
    else if (board) { board.updateMatrixWorld(true); highlight = new T.Box3Helper(new T.Box3().setFromObject(board).expandByScalar(0.06), '#49edab'); }
    if (highlight) { highlight.renderOrder = 12; layer.add(highlight); }
    applyVisibility();
  }
  function select(id) {
    if (!SOURCES[id] && !routes.some(r => r.id === id)) return;
    SIM.select(null); view.selected = id; view.visible = true;
    const r = routes.find(r => r.id === id), board = SOURCES[id];
    if (r && !matches(r)) { view.board = r.board; view.kind = ['audio', 'mic'].includes(r.kind) ? 'audio' : 'power'; }
    if (board && view.board !== 'all' && board.board !== view.board) view.board = board.board;
    updateHighlight(); SIM.emit('electrical-selection', id);
  }
  function pick(ray) {
    if (!layer?.visible) return null;
    layer.updateMatrixWorld(true);
    const rc = new T.Raycaster(); rc.ray.copy(ray);
    const hit = rc.intersectObjects([...objects.values()].filter(o => o.visible).concat([...enclosures.values()].filter(o => o.visible)), true)[0];
    if (!hit) return null;
    let o = hit.object; while (o && !o.userData.electricalId) o = o.parent;
    return o ? { id: o.userData.electricalId, distance: hit.distance } : null;
  }
  function component(it) {
    const type = CAT.byId[it.type], bounds = SIM.fixtures.get(it.id)?.proto.bounds;
    const modelSize = bounds ? [bounds.max.x - bounds.min.x, bounds.max.y - bounds.min.y, bounds.max.z - bounds.min.z] : [];
    const specs = [];
    if (type.light) { specs.push(`${it.lumens ?? type.light.lumens ?? 'N/A'} lm`, `${it.cct ?? type.light.cct ?? 'N/A'} K`); if (type.light.beam) specs.push(`${it.beam ?? type.light.beam}° beam`); }
    if (type.fan) specs.push(`${type.fan.diameter} m diameter`, `${type.fan.speeds.at(-1).watts} W at maximum speed`);
    if (type.speaker) specs.push(`${type.speaker.ratedW} W audio rating`, type.speaker.active ? 'Active / local mains + signal' : 'Passive / amplifier output', `${it.delayMs ?? 0} ms delay`);
    if (type.mic) specs.push('Microphone signal → mixer input');
    if (it.params?.length) specs.push(`${it.params.length} m strand`);
    return { id: it.id, name: it.name, type: it.type, product: type.name, circuit: it.circuit, board: SIM.CIRCUITS[it.circuit]?.board || 'DB1',
      quantity: 1, modelSize, modelSizeBasis: 'Local model envelope; excludes pendant rod. Verify product dimensions.',
      diameter: type.fan?.diameter ?? null, wattsEstimate: type.light || type.fan || type.speaker || type.mic ? SIM.itemWatts(it, true) : null,
      specs: specs.join(' · ') || 'Electrical load and product specification pending', hiddenAlternative: it.hidden, position: it.pos.slice(), procurementStatus: 'Planning category; manufacturer / model / IP / final rating pending' };
  }
  function schedule(board = view.board) {
    return SIM.state.items.filter(wired).map(component).filter(c => board === 'all' || c.board === board);
  }
  function billOfMaterials(board = view.board) {
    const groups = new Map();
    for (const c of schedule(board).filter(c => !c.hiddenAlternative)) {
      const key = JSON.stringify([c.board, c.circuit, c.type, c.modelSize, c.specs, c.wattsEstimate]);
      if (!groups.has(key)) groups.set(key, { board: c.board, circuit: c.circuit, type: c.type, product: c.product, quantity: 0, modelSize: c.modelSize, specs: c.specs, wattsEachEstimate: c.wattsEstimate, itemIds: [] });
      const g = groups.get(key); g.quantity++; g.itemIds.push(c.id);
    }
    return [...groups.values()];
  }
  function exportData() {
    return { schema: 1, units: 'metres', status: 'Proposed routing study, not installation documentation',
      sources: SOURCES, routes: routes.map(r => ({ ...r, drawnDiameter: r.role === 'feeder' ? 0.064 : 0.048, drawnDiameterBasis: 'Exaggerated visual thickness; not specified cable size' })),
      components: schedule('all'), billOfMaterials: billOfMaterials('all'), unresolved: ['Cable type and conductor sizes', 'Conduit sizing and installation method', 'Supply and phase allocation', 'Earthing / bonding and protective devices', 'Amplifier topology and speaker impedance / line voltage', 'Manufacturer product dimensions and enclosure capacities', 'Permanent routing and outlets for movable equipment'] };
  }
  function csv() {
    const rows = [['Board', 'Circuit', 'ID', 'Component', 'Product category', 'Quantity', 'Model envelope X mm', 'Model envelope Y mm', 'Model envelope Z mm', 'Fan diameter mm', 'Load estimate W', 'Category specifications', 'Status']];
    for (const c of schedule()) rows.push([c.board, c.circuit, c.id, c.name, c.product, 1, ...c.modelSize.map(n => (n * 1000).toFixed(0)), c.diameter ? c.diameter * 1000 : '', c.wattsEstimate === null ? 'Pending' : c.wattsEstimate.toFixed(1), c.specs, c.hiddenAlternative ? 'Hidden alternative / excluded from installed totals' : c.procurementStatus]);
    rows.push([], ['Route ID', 'Source', 'Board', 'Circuit', 'Destination IDs', 'Role', 'Route length m', 'Audio full home-run length m', 'Installation proposal', 'Specification status']);
    for (const r of routes.filter(matches)) rows.push([r.id, r.source, r.board, r.circuit, r.itemIds.join(' / '), r.role, r.length.toFixed(2), r.homeRun ? (r.upstreamLength + r.length).toFixed(2) : '', r.installation, r.specification]);
    return rows.map(row => row.map(v => '"' + String(v ?? '').replace(/"/g, '""') + '"').join(',')).join('\n');
  }
  function download(name, data, mime) {
    const url = URL.createObjectURL(new Blob([data], { type: mime })), a = document.createElement('a'); a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function flatPlan() {
    const visible = routes.filter(matches), projection = p => [32 + (p[0] + 1) * 8.4, 154 + p[2] * 8.4];
    const route = r => `<polyline data-act="electrical-select" data-electrical-id="${esc(r.id)}" points="${r.points.map(p => projection(p).join(',')).join(' ')}" fill="none" stroke="${r.id === view.selected ? '#00a46d' : r.color}" stroke-width="${r.id === view.selected ? 3.5 : 1.1}" tabindex="0" role="button" aria-label="${esc(r.name)}"><title>${esc(r.name)} · ${r.length.toFixed(1)} m</title></polyline>`;
    const comps = schedule().filter(c => !c.hiddenAlternative).map(c => { const p = projection(c.position); return `<circle cx="${p[0]}" cy="${p[1]}" r="2.5" fill="#263f39" data-act="electrical-component" data-id="${esc(c.id)}" tabindex="0" role="button" aria-label="${esc(c.name)}"><title>${esc(c.name)}</title></circle>`; }).join('');
    const boards = Object.entries(SOURCES).filter(([, b]) => view.board === 'all' || b.board === view.board).map(([id, b]) => { const p = projection(b.pos); return `<g data-act="electrical-select" data-electrical-id="${id}" tabindex="0" role="button" aria-label="${esc(b.label)}"><rect x="${p[0] - 4}" y="${p[1] - 4}" width="8" height="8" fill="${b.color}" stroke="#fff"/><title>${esc(b.label)}</title></g>`; }).join('');
    return `<svg class="electrical-plan" viewBox="0 0 520 302" role="group" aria-label="Flat electrical route plan. Click a wire, board or component."><rect width="520" height="302" fill="#f5f7f4"/><path d="M60 92H352V43H412V92H485V216H412V265H352V216H60Z" fill="none" stroke="#cad3cb" stroke-dasharray="4 3"/><text x="38" y="285" font-size="9" fill="#65746c">Entrance → sanctuary · top projection · heights in selected route</text>${visible.map(route).join('')}${comps}${boards}</svg>`;
  }
  function renderPanel() {
    const count = schedule().filter(c => !c.hiddenAlternative).length;
    const sel = routes.find(r => r.id === view.selected), board = SOURCES[view.selected];
    let html = `<div class="sim-card"><h3>Electrical systems</h3><p class="sim-hint">${count} connected components · ${routes.filter(matches).length} selectable runs. Power and audio use separate routes. Wire colours identify systems, not conductor colours.</p>
      <div class="electrical-actions"><button data-act="electrical-mode" data-mode="systems" class="${view.mode === 'systems' ? 'sim-primary' : ''}">Systems only</button><button data-act="electrical-mode" data-mode="building">Restore building</button><button data-act="electrical-visible">${view.visible ? 'Hide' : 'Show'} wiring</button></div>
      <div class="electrical-actions">${Object.entries(SOURCES).map(([id, b]) => `<button data-act="electrical-select" data-electrical-id="${id}">${id}</button>`).join('')}</div>
      <div class="electrical-actions">${['all', 'DB1', 'DB2'].map(b => `<button data-act="electrical-filter" data-board="${b}" aria-pressed="${b === view.board}">${b === 'all' ? 'All boards' : b}</button>`).join('')}</div>
      <div class="electrical-actions">${[['all', 'All cabling'], ['power', 'Power'], ['audio', 'Audio / mic']].map(([k, l]) => `<button data-act="electrical-kind" data-kind="${k}" aria-pressed="${k === view.kind}">${l}</button>`).join('')}</div>
      <p class="sim-hint">Concealed wall bands stay above doors and windows; drops use piers. Roof, beam and underfloor connections are proposed containment routes. Cable sizes, protective devices and installation details need engineering confirmation.</p></div>`;
    if (sel) html += `<div class="sim-card"><h3>${esc(sel.name)}</h3><dl class="electrical-details"><dt>Run ID</dt><dd>${esc(sel.id)}</dd><dt>Source</dt><dd>${esc(SOURCES[sel.source].label)}</dd><dt>Circuit / role</dt><dd>${sel.circuit} · ${sel.role}</dd><dt>Drawn length</dt><dd>${sel.length.toFixed(2)} m${sel.homeRun ? ` · full home run ${(sel.length + sel.upstreamLength).toFixed(2)} m` : ''}</dd><dt>Height range</dt><dd>${Math.min(...sel.points.map(p => p[1])).toFixed(2)}–${Math.max(...sel.points.map(p => p[1])).toFixed(2)} m</dd><dt>Installation</dt><dd>${esc(sel.installation)}</dd><dt>Specification</dt><dd>${esc(sel.specification)}</dd></dl><div class="electrical-actions"><button data-act="electrical-focus">Show route</button>${sel.itemIds.length === 1 ? `<button data-act="electrical-component" data-id="${esc(sel.itemIds[0])}">Edit component</button>` : ''}</div></div>`;
    if (board) html += `<div class="sim-card"><h3>${esc(board.label)}</h3><p>${esc(board.where)}</p><p class="sim-hint">Proposed enclosure envelope: ${board.size.map(n => Math.round(n * 1000)).join(' × ')} mm (world X / height / Z). Capacity, product dimensions and internal equipment are pending.</p><button data-act="electrical-focus">Show board</button></div>`;
    html += `<div class="sim-card"><h3>Flat route plan</h3>${flatPlan()}<p class="sim-hint">Click a route or component in the plan. Vertical runs overlap in this top view; use the run list to select each individually.</p></div>`;
    for (const b of ['DB1', 'DB2'].filter(b => view.board === 'all' || view.board === b)) {
      const components = schedule(b), active = components.filter(c => !c.hiddenAlternative), circuits = [...new Set(active.map(c => c.circuit))];
      html += `<div class="sim-card"><h3>${esc(SOURCES[b].label)} · flat schedule</h3><p class="sim-hint">${active.length} installed-study components · ${components.length - active.length} hidden alternatives. Circuit blocks below are a functional schedule, not a physical breaker arrangement.</p><div class="electrical-circuit-rail">${circuits.map(c => `<button data-act="electrical-select" data-electrical-id="${esc(routes.find(r => r.board === b && r.circuit === c)?.id || b)}"><b>${c}</b><small>${active.filter(i => i.circuit === c).length} components</small></button>`).join('')}</div>
        <div class="electrical-table-wrap"><table class="electrical-table"><thead><tr><th>Component / circuit</th><th>Qty</th><th>Size / specs</th></tr></thead><tbody>${billOfMaterials(b).map(c => `<tr><td><button data-act="electrical-component" data-id="${esc(c.itemIds[0])}">${esc(c.product)}</button><small>${c.circuit} · ${c.itemIds.length} individually selectable in run list</small></td><td>${c.quantity}</td><td><small>${c.modelSize.map(n => Math.round(n * 1000)).join(' × ')} mm model envelope</small><small>${esc(c.specs)}</small></td></tr>`).join('')}</tbody></table></div><p class="sim-hint">Dimensions are the model envelope, excluding pendant rods. Specs are representative catalogue values; confirm manufacturer and product before procurement. Passive speaker wattages are audio ratings.</p></div>`;
    }
    html += `<div class="sim-card"><h3>Selectable runs</h3><div class="electrical-run-list">${routes.filter(matches).map(r => `<button data-act="electrical-select" data-electrical-id="${esc(r.id)}" class="${r.id === view.selected ? 'selected' : ''}"><i style="background:${r.color}"></i><span>${esc(r.name)}<small>${r.source} · ${r.role} · ${r.length.toFixed(1)} m</small></span></button>`).join('')}</div><div class="electrical-actions"><button data-act="electrical-json">Export systems JSON</button><button data-act="electrical-csv">Export board schedule CSV</button></div><p class="sim-hint">Lengths are drawn centreline lengths with no spare, terminations or installation allowance. Audio bundles represent individual home runs; do not add bundle lengths to full home-run cable lengths.</p></div>`;
    return html;
  }
  function action(el) {
    switch (el.dataset.act) {
      case 'electrical-mode': {
        setMode(el.dataset.mode);
        if (el.dataset.mode === 'systems') {
          SIM.church.places['electrical-overview'] = { title: 'Electrical systems', note: 'Select a board, wire or component', pos: [64, 30, -34], target: [27, 9, 0], interior: false };
          SIM.church.goTo('electrical-overview', { mode: 'explore', instant: true });
        }
        break;
      }
      case 'electrical-visible': view.visible = !view.visible; applyVisibility(); break;
      case 'electrical-filter': view.board = el.dataset.board; applyVisibility(); break;
      case 'electrical-kind': view.kind = el.dataset.kind; applyVisibility(); break;
      case 'electrical-select': select(el.dataset.electricalId); break;
      case 'electrical-component': SIM.select(el.dataset.id); SIM.focusItem(el.dataset.id); break;
      case 'electrical-focus': {
        const r = routes.find(r => r.id === view.selected), p = SOURCES[view.selected]?.pos || r?.points[Math.floor(r.points.length / 2)];
        if (p) { SIM.church.places['electrical-focus'] = { title: r?.name || SOURCES[view.selected].label, note: 'Electrical planning route', pos: [p[0] - 7, p[1] + 5, p[2] - 8], target: p.slice(), interior: false }; SIM.church.goTo('electrical-focus', { mode: 'explore', instant: true }); } break;
      }
      case 'electrical-json': rebuild(); download('thach-bi-electrical-systems.json', JSON.stringify(exportData(), null, 2), 'application/json'); break;
      case 'electrical-csv': rebuild(); download(`thach-bi-${view.board}-schedule.csv`, '\ufeff' + csv(), 'text/csv;charset=utf-8'); break;
    }
    SIM.emit('electrical');
  }
  SIM.electrical = { SOURCES, view, get routes() { return routes; }, get layer() { return layer; }, makeRoutes, rebuild, setMode, select, pick, schedule, billOfMaterials, exportData, csv, renderPanel, action };
  SIM.on('ready', init);
})();
