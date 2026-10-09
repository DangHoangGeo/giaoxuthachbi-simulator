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
  const view = { visible: false, mode: 'building', board: 'all', kind: 'all', system: 'all', circuit: 'all', item: 'all', selected: null };
  let routes = [], layer, highlight, T, scene, savedVisibility = null, rebuildTimer, soffitMaterial;
  const objects = new Map(), enclosures = new Map(), covers = new Map(), coverBatches = new Map();
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const length = p => p.slice(1).reduce((n, v, i) => n + Math.hypot(...v.map((a, k) => a - p[i][k])), 0);
  const clean = p => p.filter((v, i) => !i || v.some((a, k) => Math.abs(a - p[i - 1][k]) > 0.00001)).map(v => v.slice());
  const wired = it => { const t = CAT.byId[it.type]; return t.glow !== 'flame' && !!(t.light || t.fan || t.speaker || t.mic); };
  const circuitIndex = c => Math.max(0, Object.keys(SIM.CIRCUITS).indexOf(c));
  const height = (c, audio) => (audio ? 5.55 : 5.9) + circuitIndex(c) * 0.008;
  const REAR = 53.016, WALL = 7.36, WING = 13.249, ARCADE = 10.414;
  // These are routing-study clearances, not a selected containment product.
  // Main-roof paths occupy the modeled space ABOVE the ivory lining. Roofs
  // without a modeled lining need a removable, finish-matched soffit raceway;
  // they must not imply chasing the concrete roof or drilling structural wood.
  function roofY(x, z) {
    const az = Math.abs(z), main = 12.472 - (5.342 / 7.36) * az;
    const lean = 7.13 - (0.805 / 3.62) * (az - WALL);
    const wing = 9.45 - (3.125 / 3.88) * Math.abs(x - 40.575);
    const surface = az <= WALL ? main : lean;
    if (Math.abs(x - 40.575) <= 3.88 && wing > surface) return wing - 0.18;
    return az <= WALL ? main - 0.09 : lean - 0.18;
  }
  function roofLine(a, b) {
    // Include the ridge and valley transitions rather than a chord through the
    // pitched roof. Collinear samples are removed again (small cached meshes).
    const n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[2] - a[2]) / 0.08)), p = [];
    for (let i = 0; i <= n; i++) {
      const x = a[0] + (b[0] - a[0]) * i / n, z = a[2] + (b[2] - a[2]) * i / n;
      p.push([x, roofY(x, z), z]);
    }
    for (let i = p.length - 2; i > 0; i--) {
      const a = p[i - 1], b = p[i], c = p[i + 1];
      const u = b.map((v, k) => v - a[k]), v = c.map((w, k) => w - b[k]);
      if (Math.hypot(u[1]*v[2]-u[2]*v[1], u[2]*v[0]-u[0]*v[2], u[0]*v[1]-u[1]*v[0]) < 1e-8) p.splice(i, 1);
    }
    return p;
  }
  function perimeter(s, y) {
    // C/G walls are absent across 9–10. Rise in the solid end piers and follow
    // the wing roof above the opening; never span the opening at wall-band height.
    return [[REAR, y, s * WALL], [44.175, y, s * WALL],
      ...roofLine([44.175, 0, s * WALL], [36.975, 0, s * WALL]),
      [36.975, y, s * WALL], [5.475, y, s * WALL], [2.35, y, s * WALL]];
  }
  function takeTo(path, stopX) {
    // At an end pier, prefer the wall band, not the roof riser above it.
    const candidates = [];
    for (let i = 1; i < path.length; i++) {
      const a = path[i - 1], b = path[i], dx = b[0] - a[0];
      if (Math.abs(dx) > 1e-8 && stopX >= Math.min(a[0], b[0]) - 1e-8 && stopX <= Math.max(a[0], b[0]) + 1e-8) {
        const t = (stopX - a[0]) / dx;
        candidates.push({ i, p: a.map((v, k) => v + (b[k] - v) * t) });
      }
      if (Math.abs(b[0] - stopX) < 1e-8) candidates.push({ i, p: b });
    }
    candidates.sort((a, b) => a.p[1] - b.p[1] || a.i - b.i);
    const hit = candidates[0];
    return hit ? clean([...path.slice(0, hit.i), hit.p]) : clean(path);
  }
  function pierX(it) {
    let x = Math.max(2.35, Math.min(REAR, it.pos[0]));
    for (const wall of SIM.GEO.walls.filter(w => w.z && Math.sign(w.z) === Math.sign(it.pos[2] || -1) && x >= w.x0 && x <= w.x1)) {
      const o = wall.openings.find(o => x > o.x0 - 0.1 && x < o.x1 + 0.1 && it.pos[1] < o.y1 + 0.12);
      if (o) x = Math.abs(x - o.x0) < Math.abs(x - o.x1) ? o.x0 - 0.18 : o.x1 + 0.18;
    }
    return x;
  }
  function chamberFixture(it) {
    const c = window.CHURCH_SANCTUARY?.spec.chamber, p = it.pos;
    return c && p[0] >= c.x0 && p[0] <= c.x1 && Math.abs(p[2]) >= 2.8 && Math.abs(p[2]) <= c.outer && it.mount !== 'pendant';
  }
  function connectionX(it) { return chamberFixture(it) ? 48.5 : pierX(it); }
  function riserZ(z) {
    const n = window.CHURCH_SANCTUARY?.spec.niche, clear = n ? n.half + n.shell + 0.2 : 0;
    return Math.abs(z) < clear ? -clear : z;
  }
  function trunkPath(source, s, y, endX) {
    const p = SOURCES[source].pos, rz = riserZ(p[2]);
    if (source === 'DB2') return clean([p, [2.35, p[1], p[2]], [2.35, 7.65, p[2]],
      [2.35, 7.65, s * WALL], [2.35, y, s * WALL], ...takeTo(perimeter(s, y).reverse(), endX)]);
    // Ceiling top is +4.27. The old +4.02 route cut through the edge beam.
    return clean([p, [48.735, p[1], p[2]], [48.735, p[1], rz], [48.735, 4.33, rz],
      [48.735, 4.33, -3.3], [REAR, 4.33, -3.3], [REAR, y, -3.3],
      ...takeTo([[REAR, y, -3.3], ...perimeter(s, y)], endX)]);
  }
  function servicePanelRoute(it) {
    const p = SOURCES.LC1.pos, q = it.pos, rz = riserZ(p[2]);
    return clean([p, [48.735, p[1], p[2]], [48.735, p[1], rz], [48.735, 4.33, rz], [q[0], 4.33, rz], [q[0], 4.33, q[2]], q]);
  }
  function buriedY(points) {
    let y = Infinity;
    for (let i = 1; i < points.length; i++) {
      const a = points[i - 1], b = points[i], n = Math.max(1, Math.ceil(Math.hypot(b[0]-a[0], b[2]-a[2]) / 0.1));
      for (let j = 0; j <= n; j++) y = Math.min(y, SIM.floorY(a[0]+(b[0]-a[0])*j/n, a[2]+(b[2]-a[2])*j/n) - 0.12);
    }
    return y;
  }
  const proposal = (points, method, installation, coverPaths = []) => ({ points: clean(points), method, installation, coverPaths });
  const cover = (points, finish = 'timber') => ({ points: clean(points), finish, status: 'CONCEPT · removable finish-matched raceway; section, fixings and access pending' });
  function roofConnection(start, p) {
    return clean([start, ...roofLine(start, [p[0], 0, start[2]]), ...roofLine([p[0], 0, start[2]], p)]);
  }
  function branchPath(it, start) {
    const p = it.pos.slice(), s = Math.sign(p[2] || -1), [x, y, z] = start;
    const t = CAT.byId[it.type];
    if (t.mic) {
      const a=window.CHURCH_SANCTUARY?.spec.amboService;
      // Keep the complete 6 mm cable inside the 28 mm modeled service bore.
      if(a && Math.hypot(p[0]-a.socket[0],p[2]-a.socket[2])<.01 && Math.abs(p[1]-a.socket[1])<.001) {
        const deskY=a.deskY+Math.tan(a.deskSlope)*(p[0]-a.x);
        const furniturePoints=[[a.x,y,a.z],[a.x,a.deskY,a.z],[p[0],deskY,a.z],[p[0],deskY,p[2]],p];
        return {...proposal([start,[p[0],y,a.z],...furniturePoints],'underfloor-microphone',
          'Separate AV-1 home run below floor; central ambo passage through proposed hollow neck, sloped desk and removable microphone socket. Floorbox, furniture bore and access pending.'),
          furnitureConnection:'ambo',furniturePoints:clean(furniturePoints)};
      }
      return proposal([start, [p[0], y, p[2]], p], 'underfloor-microphone',
        'Separate AV-1 home run below the floor; proposed furniture cable passage to microphone base. Floorbox, floor build-up and furniture access pending.');
    }
    if (it.mount === 'floor' && p[1] - SIM.floorY(p[0], p[2]) < 2.1) {
      const fy = buriedY([start, [p[0], 0, z], p]);
      return proposal([start, [x, fy, z], [p[0], fy, z], [p[0], fy, p[2]], p], 'underfloor-local',
        'Solid-pier descent, proposed underfloor containment and local equipment lead; floor construction / outlet details pending.');
    }
    if (chamberFixture(it)) {
      const c = window.CHURCH_SANCTUARY.spec.chamber, cz = s * (c.face + c.outer) / 2;
      return proposal([start, [48.5, y, cz], [p[0], y, cz], [p[0], p[1], cz], p], 'chamber-lining',
        'Back-wall band to service space behind chamber lining; local termination behind the fitting / cornice. Removable lining and cable-entry detail pending.');
    }
    const main = SIM.GEO.mainBeams.find(b => Math.abs(p[0]-b.x)<0.19 && Math.abs(p[2]) <= b.zHalf &&
      (Math.abs((it.anchorY ?? p[1])-b.y0)<0.08 || it.type === 'uplight' && Math.abs(p[1]-b.y1)<0.08));
    const side = SIM.GEO.sideBeams.find(b => Math.abs(p[0]-b.x)<0.15 && Math.sign(p[2])===b.side && Math.abs(p[2]) >= b.zIn && Math.abs(p[2]) <= b.zOut && Math.abs((it.anchorY ?? p[1])-b.y0)<0.08);
    if (main || side) {
      const b = main || side, sx = b.x, upper = b.y1 + 0.055;
      let points, cp = [];
      if (main) {
        // Approach above the roof lining, behind both rafter proxies. A short
        // removable joint return reaches the tie top around the junction block.
        // This avoids the exposed side-beam/capital riser and all timber cores.
        // The schematic rafter/tie gap is not an approved chase or bearing detail.
        const rx=sx+0.345, roof=roofLine([rx,0,s*WALL],[rx,0,s*4.05]);
        const joint=[roof.at(-1),[rx,upper,s*4.05],[rx,upper,s*3.0],[sx,upper,s*3.0]];
        points=[start,[rx,y,s*WALL],...roof,...joint,[p[0],upper,p[2]]];
        cp.push(cover(joint));
      } else points=[start,[sx,y,s*WALL],[sx,7.055,s*WALL],[p[0],upper,p[2]]];
      if (p[1] >= b.y1 - 0.01) points.push(p);
      else {
        const besideCapital = main && Math.abs(Math.abs(p[2])-3.6)<0.48;
        const rear = sx + (besideCapital ? 0.52 : b.w / 2 + 0.055), under = b.y0 - (besideCapital ? 0.11 : 0.05);
        // The existing ambo-light canopy contacts the abacus. Connect to the
        // actual lamp-body envelope below it instead of drawing a cable through
        // that solid capital. Keep the optical position/aim and the mounting hold.
        const head = besideCapital && SIM.fixtures.get(it.id)?.head;
        let end = p;
        if (head) { head.updateWorldMatrix(true,false); end = new T.Vector3(-0.08,0,0).applyMatrix4(head.matrixWorld).toArray(); }
        const tail = [[p[0],upper,p[2]],[rear,upper,p[2]],[rear,under,p[2]],[end[0],under,p[2]],[end[0],under,end[2]],end];
        points.push(...tail); cp.push(cover(tail));
        if (head) return { ...proposal(points,'above-main-beam',
          'Above beam and covered rear-face return to lamp-body cable entry. Existing canopy/capital contact remains on mounting coordination hold; optical position unchanged.',cp),
          termination: {position:end,basis:'Proposed lamp-body entry within catalogue head envelope; selected-product connector pending'}, reviewRequired:true };
      }
      return proposal(points, main ? 'above-main-beam' : 'above-side-beam',
        'Above lining / beam tops, short covered joint and rear-face return to fitting. Roof access, rafter/tie interface and removable cover details pending; no timber drilling / notching.', cp);
    }
    if (it.mount === 'pendant') {
      const path = roofConnection(start, p), top = path.at(-1), entry = Math.min(it.anchorY ?? top[1], top[1]);
      return proposal([...path, [p[0],entry,p[2]], p], 'roof-pendant',
        'Above nave lining / covered soffit route at wings and verandas; cable continues inside the existing pendant stem. Roof build-up, supports and access pending.',
        Math.abs(p[2]) > WALL || Math.abs(p[0]-40.575)<3.88 ? [cover(path, 'soffit')] : []);
    }
    // Façade and tower routes stay on their existing wall/ledge system.
    if (p[0] < 5.475) {
      if (Math.abs(p[2]) > 7.4) {
        const tz=10.153, corner=Math.abs(p[2])>=tz ? 1 : -1;
        // Stage widths and front faces from the actual tower shell. The old
        // centreline riser passed through every arched/louvered opening.
        const stages=[[0,0,4.90,4.90],[8.39,0.09,4.65,4.72],[15.84,0.19,4.45,4.52],[23.14,0.475,3.90,3.95]];
        const lane=d=>s*(tz+corner*(d/2-0.24));
        const out=[start,[2.35,7.65,z],[2.35,7.65,s*(tz-2.45)],[0,7.65,s*(tz-2.45)],[0,7.65,lane(4.90)]];
        let stage=stages[0];
        for(const next of stages.slice(1)) if(p[1]>=next[0]) {
          const h=next[0]+0.01,last=out.at(-1);
          out.push([last[0],h,last[2]],[next[1],h,last[2]],[next[1],h,lane(next[2])]); stage=next;
        }
        const [base,tx,width]=stage, pz=s*(tz+Math.sign(Math.abs(p[2])-tz || corner)*width/2);
        let cornice=false;
        if(p[0]>0.7 && Math.abs(Math.abs(p[2])-tz)<1) {
          // Belfry glow: local lead beneath the floor/ledge, not across open air.
          const fy=base-0.06,last=out.at(-1);
          out.push([last[0],fy,last[2]],[p[0],fy,last[2]],[p[0],fy,p[2]],p);
          cornice=true;
        } else if(p[1]>29.09) {
          // The dome is narrower than the tower wall. Traverse behind the top
          // cornice finish, not across the exposed front of the cap at lamp height.
          const fy=29.03;
          out.push([tx,fy,lane(width)],[tx,fy,p[2]],[p[0],fy,p[2]],p);
          cornice=true;
        } else if(p[0]>0.7) {
          // Turn through the solid corner into the side wall, then its local base.
          out.push([tx,p[1],lane(width)],[tx,p[1],pz],[p[0],p[1],pz],p);
        } else out.push([tx,p[1],lane(width)],[tx,p[1],p[2]],p);
        return {...proposal(out,cornice?'tower-cornice':'tower-wall',cornice
          ? 'Tower pier to proposed service space behind removable cornice finish, then local fitting lead. Cornice cavity, access, weathering and cable-entry details remain unresolved.'
          : 'Solid tower corner/piers, stepped behind cornices; local ledge/fitting connection. No riser through louver openings; chase/finish and weathering details pending.'),reviewRequired:cornice};
      }
      const door = SIM.GEO.walls.find(w => w.x)?.openings.find(o => p[2]>o.z0 && p[2]<o.z1 && p[1]<o.y1);
      const dz = door ? (p[2]<0 ? door.z0-0.18 : door.z1+0.18) : p[2];
      return proposal([start,[2.35,7.65,z],[2.35,7.65,dz],[2.35,p[1],dz],[2.35,p[1],p[2]],p], 'entrance-wall', 'Concealed entrance wall band, solid pier and local termination.');
    }
    if (p[0] > 52.7) return proposal([start,[REAR,y,z],[REAR,y,p[2]],[REAR,p[1],p[2]],p], 'rear-wall', 'Rear-wall band and local termination; gable / weatherproof entry details pending.');
    if (p[0] < 5.8 && p[1] > 8.39) {
      const path=roofConnection(start,[5.32,0,p[2]]);
      return proposal([...path,[5.32,p[1],p[2]],p], 'entrance-gable', 'Above roof lining to solid front gable above terrace; local fan connection.');
    }
    if (it.mount === 'floor' && p[1] > 5.9) {
      const path=roofConnection(start,p);
      return proposal([...path,p], 'roof-local', 'Concealed roof route to local roof-mounted fitting; weatherproof cable entry pending.',
        Math.abs(p[2])>WALL || Math.abs(p[0]-40.575)<3.88 ? [cover(path,'soffit')] : []);
    }
    if (Math.abs(p[2]) > 7.6) {
      const wz = Math.abs(p[0]-40.575)<3.6 ? WING : ARCADE;
      const q=[p[0],0,s*wz], path=roofConnection(start,q);
      return proposal([...path,[p[0],p[1],s*wz],p], 'outer-wall',
        'Covered roof-soffit crossing into outer arcade / wing-gable wall, then concealed pier drop. No exposed crossing at equipment height.', [cover(path,'soffit')]);
    }
    if (p[1] > 7.1) {
      const path=roofConnection(start,p);
      return proposal([...path,p], 'roof-local', 'Above lining to a local roof fitting; roof entry / weatherproof termination pending.');
    }
    if (Math.abs(p[2]) >= 7.0) return proposal([start,[x,p[1],z],[p[0],p[1],z],p], 'side-wall', 'Concealed solid-pier / wall drop and local termination.');
    // Arbitrary imported wall locations must never get an unlabelled long
    // horizontal cable across the room. Retain the edit and identify the hold.
    const fy=buriedY([start,[p[0],0,z],p]);
    return { ...proposal([start,[x,fy,z],[p[0],fy,z],[p[0],fy,p[2]],p], 'review-local',
      'Proposed underfloor return; this location needs a concealed local riser / connection design.'), reviewRequired: true };
  }
  function makeRoutes() {
    const result = [], groups = new Map();
    function add(o, points) {
      const p = clean(points);
      result.push({ ...o, points: p, length: length(p), specification: 'Cable type / conductors / cross-section / conduit: pending electrical design',
        coordinationStatus: o.reviewRequired ? 'REVIEW REQUIRED · local concealment unresolved' : 'CONCEPT · concealed routing / installation details pending' });
    }
    const b1 = SOURCES.DB1.pos, b2 = SOURCES.DB2.pos;
    const feeder = trunkPath('DB1', -1, 6.26, 2.35);
    add({ id: 'feeder:DB2', name: 'DB-1 → DB-2 feeder', source: 'DB1', board: 'DB2', circuit: 'DB2-FEED', kind: 'feeder', role: 'feeder', itemIds: [], color: COLORS.feeder, installation: 'Wall bands, covered wing-roof crossing, entrance wall riser' },
      [...feeder, [2.35, 7.65, -7.36], [2.35, 7.65, b2[2]], [2.35, b2[1], b2[2]], b2]);
    for (const id of ['AV1', 'LC1', 'FC1']) {
      const p = SOURCES[id].pos;
      add({ id: `feeder:${id}`, name: `DB-1 → ${id} equipment supply`, source: 'DB1', board: 'DB1', circuit: `${id}-SUPPLY`, kind: 'feeder', role: 'feeder', itemIds: [], color: COLORS.feeder, installation: 'Existing service-room wall tray / local equipment connection' },
        [b1, [48.735, b1[1], b1[2]], [48.735, 2.42, b1[2]], [48.735, 2.42, p[2]], [48.735, p[1], p[2]], p]);
    }
    for (const it of SIM.state.items.filter(i => !i.hidden && wired(i))) {
      const t = CAT.byId[it.type], audio = !!(t.speaker || t.mic);
      if (it.type === 'servicePanel') {
        add({ id: `local:${it.id}`, name: `L3 → ${it.name}`, source: 'LC1', board: 'DB1', circuit: 'L3', kind: 'light', role: 'local', itemIds: [it.id], color: COLORS.light, method: 'service-ceiling', installation: 'Wall riser beside niche; containment above ceiling top +4.27 m; panel cable entry pending structural coordination.' }, servicePanelRoute(it));
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
      const xs = g.items.map(connectionX);
      const endX = g.source === 'DB2' ? Math.max(...xs) : Math.min(...xs);
      const mic = g.kind === 'mic', rack = SOURCES.AV1.pos, mz = g.s * 1.4;
      const my = mic ? Math.min(...g.items.map(it => buriedY([rack, [rack[0],0,mz], [it.pos[0],0,mz], it.pos]))) : 0;
      const micPath = x => clean([rack, [rack[0],my,rack[2]], [rack[0],my,mz], [x,my,mz]]);
      // A microphone group can contain edited items on either side of the rack.
      const mx = mic ? g.items.map(it => it.pos[0]) : [];
      const trunk = mic ? clean([...micPath(Math.min(...mx)), ...(Math.max(...mx)>rack[0] ? [[Math.max(...mx),my,mz]] : [])]) : trunkPath(g.source, g.s, y, endX);
      const trunkId = `trunk:${key}`;
      add({ id: trunkId, name: `${g.circuit} · ${g.s < 0 ? 'B' : 'H'} · ${g.audio ? 'audio home-run bundle' : 'circuit trunk'}`, source: g.source, board, circuit: g.circuit,
        kind: g.kind, role: 'trunk', itemIds: g.items.map(i => i.id), color: COLORS[g.kind], method: mic ? 'underfloor-microphone' : 'wall-roof-trunk',
        installation: mic ? 'Separate microphone home-run bundle below service-room and sanctuary floors; floor build-up / access pending.' : 'Wall bands above openings; concealed finish-matched soffit crossing over the 9–10 wing opening.' }, trunk);
      for (const it of g.items) {
        const connection = mic ? micPath(it.pos[0]) : trunkPath(g.source, g.s, y, connectionX(it)), start = connection[connection.length - 1];
        const branch = branchPath(it, start);
        add({ id: `drop:${key}:${it.id}`, name: `${g.circuit} → ${it.name}`, source: g.source, board, circuit: g.circuit, kind: g.kind,
          role: 'drop', itemIds: [it.id], trunkId, color: COLORS[g.kind], upstreamLength: length(connection), homeRun: g.audio,
          ...branch }, branch.points);
      }
    }
    // The open wing and unlined roofs need a real cover proposal, not a line
    // hidden by a UI switch. In Systems-only these covers are removed so the
    // same route vertices remain inspectable. They are not structural members.
    for (const r of result) {
      r.coverPaths ||= [];
      if (r.role === 'trunk' || r.id === 'feeder:DB2') for (let i=1;i<r.points.length;i++) {
        const a=r.points[i-1], b=r.points[i];
        if (Math.abs(a[2])===WALL && Math.abs(b[2])===WALL && a[0]>=36.975 && a[0]<=44.175 && b[0]>=36.975 && b[0]<=44.175 && a[1]>6.8 && b[1]>6.8)
          r.coverPaths.push(cover([a,b],'soffit'));
      }
      r.coverPaths = r.coverPaths.filter(c => c.points.length > 1 && length(c.points) > 1e-7);
    }
    return result;
  }

  // One merged mesh per run, retaining its selection ID. Building-view cables
  // fit within fixture stems; isolation exaggerates them for inspection. Both
  // thicknesses are display conventions, never a conductor/conduit schedule.
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
  function rebuild() {
    reviewCache = null;
    if (!layer) return;
    clearTimeout(rebuildTimer);
    routes = makeRoutes();
    const keep = new Set();
    for (const route of routes) {
      keep.add(route.id);
      const radius = view.mode === 'systems' ? (route.role === 'feeder' ? 0.032 : 0.024) : 0.003;
      const shape = JSON.stringify([radius, route.points]);
      let mesh = objects.get(route.id);
      if (!mesh) {
        mesh = new T.Mesh(pipeGeometry(route.points, radius), new T.MeshBasicMaterial({ color: route.color }));
        mesh.userData.electricalId = route.id; layer.add(mesh); objects.set(route.id, mesh);
      } else if (mesh.userData.routeShape !== shape) {
        mesh.geometry.dispose(); mesh.geometry = pipeGeometry(route.points, radius);
      }
      mesh.name = 'Electrical · ' + route.name;
      mesh.userData.routeShape = shape; mesh.material.color.set(view.mode === 'systems' ? route.color : '#343431');
    }
    for (const [id, mesh] of objects) if (!keep.has(id)) {
      mesh.removeFromParent(); mesh.geometry.dispose(); mesh.material.dispose(); objects.delete(id);
    }
    const covered = new Set();
    for (const mesh of covers.values()) mesh.userData.routeIds = [];
    for (const r of routes) for (const c of r.coverPaths) {
      const key = JSON.stringify([c.finish,c.points]); covered.add(key);
      let mesh = covers.get(key);
      if (!mesh) {
        const material = c.finish === 'timber' ? window.CHURCH_SANCTUARY.materials.wood : soffitMaterial;
        const geometry=pipeGeometry(c.points,0.026); geometry.computeVertexNormals();
        mesh = new T.Mesh(geometry,material);
        mesh.name = 'Proposed removable cable cover · '+c.finish;
        mesh.userData = { routeCover: true, finish: c.finish, status: c.status, engineeringApproved: false, routeIds: [] };
        covers.set(key,mesh); layer.add(mesh);
      }
      // Routes can share a single cover (twin lights, bundled circuits).
      if (!mesh.userData.routeIds.includes(r.id)) mesh.userData.routeIds.push(r.id);
    }
    for (const [key, mesh] of covers) if (!covered.has(key)) {
      mesh.removeFromParent(); mesh.geometry.dispose();
      covers.delete(key);
    }
    if (view.selected && !routes.some(r => r.id === view.selected) && !SOURCES[view.selected]) view.selected = null;
    for (const fx of SIM.fixtures.values()) fx.root.visible = SIM.fixtureVisible(fx.item) && (view.mode !== 'systems' || wired(fx.item));
    applyVisibility(); updateHighlight(); SIM.emit('electrical');
  }
  function init() {
    T = SIM.THREE; scene = SIM.church.scene;
    soffitMaterial = new T.MeshStandardMaterial({color:'#803c29',roughness:0.85});
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
    SIM.on('items', () => { reviewCache = null; applyVisibility(); clearTimeout(rebuildTimer); rebuildTimer = setTimeout(rebuild, 90); });
    SIM.on('select', id => { if (id && view.selected) { view.selected = null; updateHighlight(); SIM.emit('electrical'); } });
    SIM.on('frame', () => {
      // Re-apply isolation after the viewer's frame and material switches.
      if (savedVisibility) {
        for (const [o] of savedVisibility) o.visible = false;
        const ids = new Set(reviewSelection().itemIds);
        for (const fx of SIM.fixtures.values()) fx.root.visible = SIM.fixtureVisible(fx.item) && ids.has(fx.item.id);
      }
    });
    const settings = document.getElementById('settingsPanel');
    if (settings) {
      const control = document.createElement('label'); control.className = 'switch-row';
      control.innerHTML = '<span>Electrical systems only</span><input id="electricalOnlyToggle" type="checkbox">';
      settings.querySelector('#roofToggle')?.closest('label')?.after(control);
      control.querySelector('input').addEventListener('change', e => { setMode(e.target.checked ? 'systems' : 'building'); if (e.target.checked) SIM.emit('electrical-selection'); });
    }
  }
  function legacyMatches(r) { return (view.board === 'all' || r.board === view.board) && (view.kind === 'all' || (view.kind === 'audio' ? ['audio', 'mic'].includes(r.kind) : !['audio', 'mic'].includes(r.kind))); }
  let reviewCache = null;
  const SYSTEMS = { all: 'All systems', lighting: 'Lights', sound: 'Sound & microphones', air: 'Fans & ventilation', exit: 'Exit signs', decoration: 'Powered decoration', distribution: 'Distribution only' };
  function systemOf(it) {
    const type = CAT.byId[it.type];
    return it.circuit === 'E1' ? 'exit' : type.speaker || type.mic ? 'sound' : type.fan ? 'air' : type.cat === 'decor' ? 'decoration' : 'lighting';
  }
  // Read-only relationship closure. Shared trunks are context, not extra loads;
  // keeping a parent feeder never pulls sibling equipment into the selection.
  function reviewSelection() {
    const key = [view.system, view.circuit, view.item, view.board, view.kind].join('|');
    if (reviewCache?.key === key) return reviewCache.selection;
    const scoped = view.system !== 'all' || view.circuit !== 'all' || view.item !== 'all';
    const items = SIM.state.items.filter(it => wired(it) && !it.hidden &&
      (view.board === 'all' || SIM.CIRCUITS[it.circuit]?.board === view.board) &&
      (view.system === 'all' || systemOf(it) === view.system) &&
      (view.circuit === 'all' || it.circuit === view.circuit) && (view.item === 'all' || it.id === view.item));
    const itemIds = new Set(items.map(it => it.id));
    let selected = routes.filter(r => legacyMatches(r) && (!scoped || r.itemIds.some(id => itemIds.has(id))));
    if (view.system === 'distribution') selected = routes.filter(r => r.role === 'feeder' && (view.board === 'all' || r.board === view.board));
    const routeIds = new Set(selected.map(r => r.id)), sourceIds = new Set();
    if (!scoped) {
      for (const [id, source] of Object.entries(SOURCES)) if (view.board === 'all' || source.board === view.board) sourceIds.add(id);
      // A board-only view still needs both endpoints of visible feeders.
      for (const r of selected) {
        sourceIds.add(r.source);
        if (r.role === 'feeder' && SOURCES[r.id.slice(7)]) sourceIds.add(r.id.slice(7));
      }
      // Preserve the legacy power/audio selector's equipment semantics, while
      // advanced discipline/circuit filters always follow complete dependencies.
      for (const id of [...itemIds]) if (!selected.some(r => r.itemIds.includes(id))) itemIds.delete(id);
    }
    if (scoped) {
      for (let index = 0; index < selected.length; index++) {
        const r = selected[index]; sourceIds.add(r.source);
        const destination = r.role === 'feeder' && SOURCES[r.id.slice(7)] ? r.id.slice(7) : null;
        if (destination) sourceIds.add(destination);
        for (const id of [r.trunkId, r.source !== 'DB1' ? `feeder:${r.source}` : null]) {
          const parent = routes.find(p => p.id === id);
          if (parent && !routeIds.has(parent.id)) { routeIds.add(parent.id); selected.push(parent); }
        }
      }
    }
    const selection = Object.freeze({ itemIds: Object.freeze([...itemIds]), routeIds: Object.freeze([...routeIds]), sourceIds: Object.freeze([...sourceIds]) });
    reviewCache = {key, selection}; return selection;
  }
  function matches(r) { return reviewSelection().routeIds.includes(r.id); }
  function setReviewFilter(patch) {
    if (!patch || Object.keys(patch).some(k => !['system','circuit','item','board'].includes(k))) return false;
    if (patch.system !== undefined && !Object.hasOwn(SYSTEMS, patch.system) ||
        patch.circuit !== undefined && patch.circuit !== 'all' && !SIM.CIRCUITS[patch.circuit] ||
        patch.item !== undefined && patch.item !== 'all' && !SIM.state.items.some(i => i.id === patch.item && wired(i) && !i.hidden) ||
        patch.board !== undefined && !['all','DB1','DB2'].includes(patch.board)) return false;
    Object.assign(view, patch); view.kind = 'all';
    if (view.selected && !reviewSelection().routeIds.includes(view.selected) && !reviewSelection().sourceIds.includes(view.selected)) view.selected = null;
    applyVisibility(); updateHighlight(); SIM.emit('electrical'); return true;
  }
  function applyVisibility() {
    if (!layer) return;
    layer.visible = view.visible;
    const selection = reviewSelection(), matched = new Set(selection.routeIds), itemIds = new Set(selection.itemIds);
    if (view.selected && !matched.has(view.selected) && !selection.sourceIds.includes(view.selected)) view.selected = null;
    for (const r of routes) objects.get(r.id).visible = matched.has(r.id);
    const matrix = new T.Matrix4();
    for (const fx of SIM.fixtures.values()) fx.root.visible = SIM.fixtureVisible(fx.item) && (view.mode !== 'systems' || itemIds.has(fx.item.id));
    if (view.mode === 'systems' && SIM.state.selectedId && !itemIds.has(SIM.state.selectedId)) SIM.select(null);
    for (const mesh of covers.values()) mesh.visible = false;
    // Retain source covers for metadata and reuse, draw only two finish batches.
    // Switching/dimming equipment does not allocate new cover geometry.
    for (const finish of ['timber','soffit']) {
      const source=[...covers.values()].filter(m=>m.userData.finish===finish && m.userData.routeIds.some(id=>matched.has(id)));
      const shape=source.map(m=>m.geometry.id).join(','), current=coverBatches.get(finish);
      let batch=current;
      if (!batch) {
        batch=new T.Mesh(new T.BufferGeometry(),finish==='timber' ? window.CHURCH_SANCTUARY.materials.wood : soffitMaterial);
        batch.name='Cable-cover display batch · '+finish; layer.add(batch); coverBatches.set(finish,batch);
      }
      if(batch.userData.shape!==shape) {
        batch.geometry.dispose(); batch.geometry=window.CHURCH_BATCHES.merge(T,source.map(m=>({geo:m.geometry,matrix})));
        batch.userData.shape=shape;
      }
      batch.visible=view.mode==='building' && source.length>0;
    }
    for (const [id, o] of enclosures) o.visible = selection.sourceIds.includes(id);
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
    for (const fx of SIM.fixtures.values()) fx.root.visible = SIM.fixtureVisible(fx.item) && (mode !== 'systems' || wired(fx.item));
    const checkbox = document.getElementById('electricalOnlyToggle'); if (checkbox) checkbox.checked = mode === 'systems';
    SIM.church.renderer.shadowMap.needsUpdate = true;
    window.CHURCH_PERFORMANCE?.invalidate();
    rebuild();
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
    if (r && !matches(r)) { view.system = view.circuit = view.item = 'all'; view.board = r.board; view.kind = ['audio', 'mic'].includes(r.kind) ? 'audio' : 'power'; }
    if (board && !reviewSelection().sourceIds.includes(id)) { view.system = view.circuit = view.item = 'all'; }
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
    if (type.light) {
      specs.push(type.light.wattsPerBulb ? `${CAT.bulbCount(it.params)} bulbs · ${type.light.wattsPerBulb} W/bulb assumed · lumen data needed` : `${it.lumens ?? type.light.lumens ?? 'N/A'} lm`, `${it.cct ?? type.light.cct ?? 'N/A'} K`);
      if (type.light.beam) specs.push(`${it.beam ?? type.light.beam}° beam`);
    }
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
  function billOfMaterials(board = view.board, ids = null) {
    const groups = new Map();
    for (const c of schedule(board).filter(c => !c.hiddenAlternative && (!ids || ids.includes(c.id)))) {
      const key = JSON.stringify([c.board, c.circuit, c.type, c.modelSize, c.specs, c.wattsEstimate]);
      if (!groups.has(key)) groups.set(key, { board: c.board, circuit: c.circuit, type: c.type, product: c.product, quantity: 0, modelSize: c.modelSize, specs: c.specs, wattsEachEstimate: c.wattsEstimate, itemIds: [] });
      const g = groups.get(key); g.quantity++; g.itemIds.push(c.id);
    }
    return [...groups.values()];
  }
  function exportData() {
    return { schema: 1, units: 'metres', status: 'Proposed routing study, not installation documentation',
      routingRevision: '2026-10-07-concealed-1', sources: SOURCES, routes: routes.map(r => ({ ...r, drawnDiameter: r.role === 'feeder' ? 0.064 : 0.048, buildingDrawnDiameter: 0.006, drawnDiameterBasis: 'Systems-only exaggeration / building display convention; neither is a specified cable size' })),
      components: schedule('all'), billOfMaterials: billOfMaterials('all'), unresolved: ['Cable type and conductor sizes', 'Conduit sizing and installation method', 'Supply and phase allocation', 'Earthing / bonding and protective devices', 'Amplifier topology and speaker impedance / line voltage', 'Manufacturer product dimensions and enclosure capacities', 'Permanent routing and outlets for movable equipment', 'Removable beam/soffit covers: finish, fixings, access and separation', 'Sanctuary lining service space and microphone furniture/floorbox details', 'Ambo key-light canopy contact with capital: mounting coordination hold'] };
  }
  // A review snapshot is deliberately separate from the complete design export.
  function reviewExport() {
    const selected = reviewSelection(), full = exportData();
    return JSON.parse(JSON.stringify({ schema: 1, status: 'Filtered design-development review; not installation or purchase documentation',
      units: full.units, routingRevision: full.routingRevision, filters: {system:view.system, circuit:view.circuit, item:view.item, board:view.board, kind:view.kind},
      ...selected, sources: Object.fromEntries(Object.entries(full.sources).filter(([id]) => selected.sourceIds.includes(id))),
      routes: full.routes.filter(r => selected.routeIds.includes(r.id)), components: full.components.filter(c => selected.itemIds.includes(c.id)),
      lengthBasis: 'Drawn route geometry; shared trunks are context, not additional installed cable quantities. No slack, terminations or installation allowances included.',
      unresolved: full.unresolved }));
  }
  function connectionTrace(itemId) {
    if (!SIM.item(itemId) || SIM.item(itemId).hidden) return [];
    return routes.filter(r => ['drop','local'].includes(r.role) && r.itemIds.includes(itemId)).map(r => {
      const upstreamIds = [], visited = new Set();
      let source = r.source;
      while (source !== 'DB1' && !visited.has(source)) {
        visited.add(source);
        const feeder = routes.find(p => p.id === `feeder:${source}`);
        if (!feeder) break;
        upstreamIds.unshift(feeder.id); source = feeder.source;
      }
      return {branchId:r.id, source:r.source, circuit:r.circuit, kind:r.kind, upstreamIds, trunkId:r.trunkId || null};
    });
  }
  function focusReview(routeId = null) {
    const chosen = routeId === null ? routes.filter(matches) : routes.filter(r => r.id === routeId);
    if (!chosen.length || !SIM.church) return false;
    const box = new T.Box3();
    for (const r of chosen) {
      for (const point of r.points) box.expandByPoint(new T.Vector3(...point));
      // Include the source/destination enclosure envelopes so short feeder views
      // do not crop the boards even when every route vertex fits.
      for (const id of [r.source, r.role === 'feeder' ? r.id.slice(7) : null]) {
        const source = SOURCES[id]; if (!source) continue;
        for (const sign of [-1, 1]) box.expandByPoint(new T.Vector3(...source.pos.map((v,i)=>v+sign*source.size[i]/2)));
      }
    }
    const target = box.getCenter(new T.Vector3()), radius = Math.max(0.7, box.getSize(new T.Vector3()).length() / 2 + 0.25);
    // Fit a containing sphere using the smaller field of view. Reserve horizontal
    // space for the desktop inspector and map; no route coordinates are altered.
    const camera = SIM.church.camera, aspect = Math.max(0.25, (camera.aspect || 1.6) * 0.55);
    const halfV = Math.min(camera.fov || 50, 50) * Math.PI / 360;
    const halfFov = Math.min(halfV, Math.atan(Math.tan(halfV) * aspect));
    const distance = radius / Math.sin(halfFov) * 1.1;
    const pos = target.clone().add(new T.Vector3(1, 0.85, -1).normalize().multiplyScalar(distance));
    SIM.church.places['electrical-focus'] = { title: routeId ? chosen[0].name : 'Current electrical review', note: 'Drawn routes · design development', pos: pos.toArray(), target: target.toArray(), interior: false };
    SIM.church.goTo('electrical-focus', {mode:'explore', instant:true}); return true;
  }
  function connectionInspector(item) {
    if (!item) return '';
    const connections = connectionTrace(item.id);
    return `<div class="sim-card electrical-inspector"><span class="sim-eyebrow">Equipment connection review</span><h3>${esc(item.id)} · ${esc(item.name)}</h3>
      <p class="sim-hint">${esc(item.circuit)} · ${esc(SIM.CIRCUITS[item.circuit]?.label)} · X / Y / Z: ${item.pos.map(n=>n.toFixed(3)).join(' / ')} m</p>
      ${connections.map(c => {
        const branch = routes.find(r=>r.id===c.branchId), signal = ['audio','mic'].includes(c.kind);
        return `<section class="electrical-connection"><b>${signal ? (c.kind==='mic' ? 'Microphone signal' : 'Loudspeaker audio') : 'Power route'} · ${c.kind === 'mic' ? `${esc(item.id)} → ${esc(c.source)}` : `${esc(c.source)} → ${esc(item.id)}`}</b>
          <ol>${[...c.upstreamIds, c.trunkId, c.branchId].filter(Boolean).map(id=>{const r=routes.find(r=>r.id===id);return `<li><button data-act="electrical-select" data-electrical-id="${esc(id)}">${esc(r.name)}</button><small>${r.role==='feeder' ? 'Upstream power supply' : r.role==='trunk' ? 'Shared route context' : 'Equipment branch'} · ${r.length.toFixed(2)} m</small></li>`;}).join('')}</ol>
          ${signal ? `<p class="sim-hint">Rack mains supply and ${c.kind==='mic' ? 'microphone' : 'audio'} signal are separate connections.${c.kind==='mic' ? ' Route coordinates are listed from the rack; microphone signal returns toward it.' : CAT.byId[item.type].speaker?.active ? ' Active-speaker mains has its own branch.' : ' A passive loudspeaker is not a mains load.'}</p>` : ''}
          ${branch.homeRun ? `<p class="sim-hint">Individual home run: ${(branch.length+branch.upstreamLength).toFixed(2)} m; do not add shared bundle length again.</p>` : ''}</section>`;
      }).join('')}
      <p class="electrical-hold">Engineering hold · cable sizes, protection and physical control channels are pending.</p>
      <div class="electrical-actions"><button data-act="electrical-fit">Fit connected routes</button><button data-act="electrical-open-controls" data-circuit="${esc(item.circuit)}">Controls · ${esc(item.circuit)}</button><button data-act="electrical-review-json">Export this review</button></div></div>`;
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
    const selection = reviewSelection();
    const comps = schedule().filter(c => selection.itemIds.includes(c.id)).map(c => { const p = projection(c.position); return `<circle cx="${p[0]}" cy="${p[1]}" r="2.5" fill="#263f39" data-act="electrical-component" data-id="${esc(c.id)}" tabindex="0" role="button" aria-label="${esc(c.name)}"><title>${esc(c.name)}</title></circle>`; }).join('');
    const boards = Object.entries(SOURCES).filter(([id]) => selection.sourceIds.includes(id)).map(([id, b]) => { const p = projection(b.pos); return `<g data-act="electrical-select" data-electrical-id="${id}" tabindex="0" role="button" aria-label="${esc(b.label)}"><rect x="${p[0] - 4}" y="${p[1] - 4}" width="8" height="8" fill="${b.color}" stroke="#fff"/><title>${esc(b.label)}</title></g>`; }).join('');
    return `<svg class="electrical-plan" viewBox="0 0 520 302" role="group" aria-label="Flat electrical route plan. Click a wire, board or component."><rect width="520" height="302" fill="#f5f7f4"/><path d="M60 92H352V43H412V92H485V216H412V265H352V216H60Z" fill="none" stroke="#cad3cb" stroke-dasharray="4 3"/><text x="38" y="285" font-size="9" fill="#65746c">Entrance → sanctuary · top projection · heights in selected route</text>${visible.map(route).join('')}${comps}${boards}</svg>`;
  }
  function wingReviewCard() {
    const status = SIM.wingReviewStatus?.();
    const intro = '<h3>Wing review · ENGINEERING HOLD</h3><p>Smaller brass chandeliers and wall fans are concepts for review. Airflow, speech, noise, glare, fixings and concealment are not approved. See docs/engineering/wing-review.md.</p>';
    if (!status) return `<div class="sim-card">${intro}<p class="sim-hint">The current wing-layout comparison is unavailable.</p></div>`;
    const marker = SIM.state.settings.wingReviewRevision || 'none';
    return `<div class="sim-card">${intro}<dl class="electrical-details"><dt>Source review</dt><dd>${esc(status.sourceRevision)}</dd><dt>Saved migration marker</dt><dd>${esc(marker)} · history only</dd></dl><p class="sim-hint">The comparison below checks this browser layout against the source review. Counts include visible equipment, whether switched on or off.</p>${status.sides.map(s => {
      const conflicts = s.conflictIds || [], mismatches = s.mismatchingIds || [];
      return `<h3>Wing ${esc(s.side)} · ${s.current ? 'Current review' : 'Preserved or custom'}</h3><p class="sim-hint">Actual visible equipment: ${esc(s.counts.chandeliers)} chandeliers · ${esc(s.counts.wallFans)} wall fans · ${esc(s.counts.roofFans)} roof fans.</p>${mismatches.length ? `<p class="sim-hint">Mismatching equipment IDs: ${mismatches.map(esc).join(', ')}.</p>` : ''}${conflicts.length ? `<p class="sim-hint">Adoption is blocked because reserved wing IDs conflict with saved equipment: ${conflicts.map(esc).join(', ')}. Review these IDs first.</p>` : ''}<div class="electrical-actions"><button data-act="wing-adopt" data-side="${esc(s.side)}" ${conflicts.length || s.current ? 'disabled' : ''}>Use reviewed lights and fans · ${esc(s.side)}</button></div><p class="sim-hint">Replaces wing ${esc(s.side)} light/fan type, circuit, position and fixture settings; preserves light on/dim. F5 uses the held low/off mode. Saves a full browser-layout backup; use Undo to restore the preceding layout.</p>`;
    }).join('')}</div>`;
  }
  function renderPanel() {
    const selection = reviewSelection(), count = selection.itemIds.length;
    const chosen = view.item !== 'all' ? SIM.item(view.item) : null;
    const sel = routes.find(r => r.id === view.selected), board = SOURCES[view.selected];
    let html = wingReviewCard() + (SIM.installationReview?.render() || '');
    if (sel) html += `<div class="sim-card"><h3>${esc(sel.name)}</h3><dl class="electrical-details"><dt>Run ID</dt><dd>${esc(sel.id)}</dd><dt>Source</dt><dd>${esc(SOURCES[sel.source].label)}</dd><dt>Circuit / role</dt><dd>${sel.circuit} · ${sel.role}</dd><dt>Drawn length</dt><dd>${sel.length.toFixed(2)} m${sel.homeRun ? ` · full home run ${(sel.length + sel.upstreamLength).toFixed(2)} m` : ''}</dd><dt>Height range</dt><dd>${Math.min(...sel.points.map(p => p[1])).toFixed(2)}–${Math.max(...sel.points.map(p => p[1])).toFixed(2)} m</dd><dt>Installation</dt><dd>${esc(sel.installation)}</dd><dt>Specification</dt><dd>${esc(sel.specification)}</dd></dl><details><summary>Route vertices · metres</summary><div class="electrical-table-wrap"><table class="electrical-table"><thead><tr><th>Vertex</th><th>X</th><th>Y</th><th>Z</th></tr></thead><tbody>${sel.points.map((p,index)=>`<tr><td>${index+1}</td>${p.map(n=>`<td>${n.toFixed(3)}</td>`).join('')}</tr>`).join('')}</tbody></table></div><p class="sim-hint">X increases toward the sanctuary; Y is height above nave floor; negative Z is side B. Three decimals are model display precision, not survey accuracy. Export retains source coordinates.</p></details><div class="electrical-actions"><button data-act="electrical-focus">Show route</button>${sel.itemIds.length === 1 ? `<button data-act="electrical-component" data-id="${esc(sel.itemIds[0])}">Edit component</button>` : ''}</div></div>`;
    if (board) html += `<div class="sim-card"><h3>${esc(board.label)}</h3><p>${esc(board.where)}</p><p class="sim-hint">Proposed enclosure envelope: ${board.size.map(n => Math.round(n * 1000)).join(' × ')} mm (world X / height / Z). Capacity, product dimensions and internal equipment are pending.</p><button data-act="electrical-focus">Show board</button></div>`;
    html += connectionInspector(chosen);
    html += `<div class="sim-card"><h3>Electrical systems</h3><p class="sim-hint">${count} equipment in review · ${routes.filter(matches).length} selectable runs. Building view shows concealed feeds and finished cable covers. Systems only reveals enlarged, colour-coded routes for inspection.</p>
      <div class="electrical-actions"><button data-act="electrical-mode" data-mode="systems" class="${view.mode === 'systems' ? 'sim-primary' : ''}">Systems only</button><button data-act="electrical-mode" data-mode="building">Restore building</button><button data-act="electrical-fit">Fit review</button><button data-act="electrical-review-json">Export this review</button><button data-act="electrical-visible">${view.visible ? 'Hide' : 'Show'} wiring</button></div>
      <div class="electrical-actions">${Object.entries(SOURCES).map(([id, b]) => `<button data-act="electrical-select" data-electrical-id="${id}">${id}</button>`).join('')}</div>
      <div class="electrical-actions">${['all', 'DB1', 'DB2'].map(b => `<button data-act="electrical-filter" data-board="${b}" aria-pressed="${b === view.board}">${b === 'all' ? 'All boards' : b}</button>`).join('')}</div>
      <div class="electrical-actions">${[['all', 'All cabling'], ['power', 'Power'], ['audio', 'Audio / mic']].map(([k, l]) => `<button data-act="electrical-kind" data-kind="${k}" aria-pressed="${k === view.kind}">${l}</button>`).join('')}</div>
      <h3>Review layers</h3><div class="electrical-actions">${Object.entries(SYSTEMS).map(([key,label]) => `<button data-act="electrical-system" data-system="${key}" aria-pressed="${view.system === key}">${label}</button>`).join('')}</div>
      <label class="sim-field">Circuit<select data-act="electrical-review-circuit" aria-label="Review circuit"><option value="all">All circuits</option>${Object.entries(SIM.CIRCUITS).map(([id,c])=>`<option value="${id}" ${view.circuit===id?'selected':''}>${esc(c.label)}</option>`).join('')}</select></label>
      <p class="sim-hint">${chosen ? `Only ${esc(chosen.id)} · ${esc(chosen.name)}. ` : ''}Systems only hides unrelated equipment. Related upstream supplies and shared trunks stay visible; other loads on shared trunks stay hidden. This changes display only, not switches or calculations.</p>
      <div class="electrical-actions"><button data-act="electrical-review-reset">Clear review filters</button>${SIM.state.selectedId ? `<button data-act="electrical-isolate-item" data-id="${esc(SIM.state.selectedId)}">Trace selected equipment</button>` : ''}</div>
      <p class="sim-hint">Feeds follow wall bands, beam tops and covered roof paths. Microphones return under the floor through their furniture. A selected green route shows through the building so you can inspect its path. Covers, service spaces and connections are proposals awaiting installation design.</p></div>`;
    if (view.system !== 'all' || view.circuit !== 'all' || view.item !== 'all') {
      const members = SIM.state.items.filter(i => selection.itemIds.includes(i.id)), circuits = [...new Set(members.map(i=>i.circuit))];
      html += `<div class="sim-card"><h3>Equipment → circuit → controls</h3><p class="sim-hint">Shown boards: ${selection.sourceIds.map(esc).join(', ') || 'none'}. Physical terminals, independent channels, final cable sizes and protection are pending. These controls operate the simulator only.</p>
        <div class="electrical-actions">${circuits.map(c=>`<button data-act="electrical-open-controls" data-circuit="${c}">Controls · ${esc(c)}</button>`).join('')}</div>
        <div class="electrical-run-list">${members.map(i=>`<button data-act="electrical-isolate-item" data-id="${esc(i.id)}"><span>${esc(i.id)} · ${esc(i.name)}<small>${esc(i.circuit)} · ${esc(SIM.CIRCUITS[i.circuit]?.board)} · ${i.pos.map(n=>n.toFixed(3)).join(' / ')} m</small></span></button>`).join('')}</div></div>`;
    }
    html += `<div class="sim-card"><h3>Flat route plan</h3>${flatPlan()}<p class="sim-hint">Click a route or component in the plan. Vertical runs overlap in this top view; use the run list to select each individually.</p></div>`;
    for (const b of ['DB1', 'DB2'].filter(b => view.board === 'all' || view.board === b)) {
      const components = schedule(b).filter(c => selection.itemIds.includes(c.id)), active = components.filter(c => !c.hiddenAlternative), circuits = [...new Set(active.map(c => c.circuit))];
      html += `<div class="sim-card"><h3>${esc(SOURCES[b].label)} · flat schedule</h3><p class="sim-hint">${active.length} installed-study components · ${components.length - active.length} hidden alternatives. Circuit blocks below are a functional schedule, not a physical breaker arrangement.</p><div class="electrical-circuit-rail">${circuits.map(c => `<button data-act="electrical-select" data-electrical-id="${esc(routes.find(r => r.board === b && r.circuit === c)?.id || b)}"><b>${c}</b><small>${active.filter(i => i.circuit === c).length} components</small></button>`).join('')}</div>
        <div class="electrical-table-wrap"><table class="electrical-table"><thead><tr><th>Component / circuit</th><th>Qty</th><th>Size / specs</th></tr></thead><tbody>${billOfMaterials(b, selection.itemIds).map(c => `<tr><td><button data-act="electrical-component" data-id="${esc(c.itemIds[0])}">${esc(c.product)}</button><small>${c.circuit} · ${c.itemIds.length} individually selectable in run list</small></td><td>${c.quantity}</td><td><small>${c.modelSize.map(n => Math.round(n * 1000)).join(' × ')} mm model envelope</small><small>${esc(c.specs)}</small></td></tr>`).join('')}</tbody></table></div><p class="sim-hint">Dimensions are the model envelope, excluding pendant rods. Specs are representative catalogue values; confirm manufacturer and product before procurement. Passive speaker wattages are audio ratings.</p></div>`;
    }
    html += `<div class="sim-card"><h3>Selectable runs</h3><div class="electrical-run-list">${routes.filter(matches).map(r => `<button data-act="electrical-select" data-electrical-id="${esc(r.id)}" class="${r.id === view.selected ? 'selected' : ''}"><i style="background:${r.color}"></i><span>${esc(r.name)}<small>${r.source} · ${r.role} · ${r.length.toFixed(1)} m</small></span></button>`).join('')}</div><div class="electrical-actions"><button data-act="electrical-json">Export systems JSON</button><button data-act="electrical-csv">Export schedule CSV</button></div><p class="sim-hint">JSON exports the complete design. CSV contains equipment for the selected board and currently filtered routes. Lengths are drawn centreline lengths with no spare, terminations or installation allowance. Audio bundles represent individual home runs; do not add bundle lengths to full home-run cable lengths.</p></div>`;
    return html;
  }
  function action(el) {
    switch (el.dataset.act) {
      case 'electrical-step': SIM.installationReview?.go(Number(el.dataset.step)); break;
      case 'electrical-step-stop': SIM.installationReview?.stop(); break;
      case 'electrical-mode': {
        setMode(el.dataset.mode);
        if (el.dataset.mode === 'systems') {
          focusReview();
        }
        break;
      }
      case 'electrical-visible': view.visible = !view.visible; applyVisibility(); break;
      case 'electrical-filter': view.board = el.dataset.board; applyVisibility(); break;
      case 'electrical-system': setReviewFilter({system:el.dataset.system,circuit:'all',item:'all'}); break;
      case 'electrical-review-circuit': setReviewFilter({system:'all',circuit:el.value,item:'all'}); break;
      case 'electrical-review-reset': setReviewFilter({system:'all',circuit:'all',item:'all',board:'all'}); break;
      case 'electrical-isolate-item': setReviewFilter({system:'all',circuit:'all',board:'all',item:el.dataset.id}); setMode('systems'); SIM.focusItem(el.dataset.id); break;
      case 'electrical-open-controls': SIM.controls?.showCircuit(el.dataset.circuit); break;
      case 'electrical-kind': view.system = view.circuit = view.item = 'all'; view.kind = el.dataset.kind; applyVisibility(); break;
      case 'electrical-select': select(el.dataset.electricalId); break;
      case 'electrical-component': SIM.select(el.dataset.id); SIM.focusItem(el.dataset.id); break;
      case 'electrical-fit': focusReview(); break;
      case 'electrical-review-json': rebuild(); download('thach-bi-electrical-review.json', JSON.stringify(reviewExport(), null, 2), 'application/json'); break;
      case 'electrical-focus': {
        if (routes.some(r=>r.id===view.selected)) { focusReview(view.selected); break; }
        const r = routes.find(r => r.id === view.selected), p = SOURCES[view.selected]?.pos || r?.points[Math.floor(r.points.length / 2)];
        if (p) { SIM.church.places['electrical-focus'] = { title: r?.name || SOURCES[view.selected].label, note: 'Electrical planning route', pos: [p[0] - 7, p[1] + 5, p[2] - 8], target: p.slice(), interior: false }; SIM.church.goTo('electrical-focus', { mode: 'explore', instant: true }); } break;
      }
      case 'electrical-json': rebuild(); download('thach-bi-electrical-systems.json', JSON.stringify(exportData(), null, 2), 'application/json'); break;
      case 'electrical-csv': rebuild(); download(`thach-bi-${view.board}-schedule.csv`, '\ufeff' + csv(), 'text/csv;charset=utf-8'); break;
    }
    SIM.emit('electrical');
  }
  SIM.electrical = { SOURCES, view, get routes() { return routes; }, get layer() { return layer; }, makeRoutes, rebuild, setMode, setReviewFilter, reviewSelection, reviewExport, connectionTrace, focusReview, select, pick, schedule, billOfMaterials, exportData, csv, renderPanel, action };
  SIM.on('ready', init);
})();
