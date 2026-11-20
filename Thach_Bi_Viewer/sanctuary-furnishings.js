/* Sanctuary furnishings, design excellence stage 2 (20 November 2026). Metres; X from axis 1,
 * Y up, Z from the centre line. See docs/design-excellence.md (departures DX-01 to DX-04).
 *
 * Appearance only: CONCEPT · In development · Not for construction. The owner asked for a church
 * built "with all the best architecture and art", every detail resolved. The altar, ambo and
 * credence were still simple boxes. This layer develops them in the sanctuary's own vocabulary:
 *   - DX-01 altar: veined pale marble (the owner kept a pale stone altar on 3 Nov 2026), red marble
 *     corner colonnettes with gilded bases and capitals, gilded frames on the two end faces;
 *   - DX-02 ambo: the same marble with gilded bands, and a silk fall in the colour of the season
 *     (green, Ordinary Time) hanging from the nave edge of the desk;
 *   - DX-03 credence: a red-lacquer table on turned legs with a gilded apron and a lower shelf,
 *     with chalice, ciborium, cruets on a tray and lavabo bowl on its linen;
 *   - DX-04 altar candlesticks: six turned brass candlesticks under the existing candles.
 * Every footprint, the navigation boxes, the ambo microphone and its concealed cable passage,
 * the sight-line targets and all analysis inputs stay as they were. Only the six altar candles
 * rise, by the height of their sticks. Stone, lacquer, gilding, silk and the vessels are display
 * finishes, not selected products; weights, fixings and fire safety of open flames are open.
 */
(() => {
  'use strict';
  const spec = {
    revision: '2026-11-20-sanctuary-furnishings-1',
    status: 'CONCEPT · design excellence stage 2 · appearance only',
    source: 'Owner aim 20 Nov 2026 (docs/design-excellence.md); approved sanctuary concept; owner decisions of 3 and 9 Nov 2026',
    marble: { tile: 1.3 },
    colonnette: { r: .044 },
    candlestick: { height: .24, x: [44.3, 44.8] },
    fall: { drop: .36, inset: .03, colour: '#2d6a3f' },
    credence: { leg: .028, apron: .12, shelf: .18, inset: .06 }
  };

  function prepare({ THREE: T, building, interior, palettes, data, renderer }) {
    const im = interior?.materials || {}, K = window.CHURCH_CARVING?.create(T);
    if (!K) return;
    const { TR, RX, RY, RZ, SC, place, merge } = K;
    const tag = { status: spec.status, source: spec.source, revision: spec.revision };
    const stats = { altar: 0, colonnettes: 0, candlesticks: 0, ambo: 0, credence: 0, vessels: 0, materials: 0 };
    const root = new T.Group();
    root.name = 'Sanctuary furnishings · design excellence stage 2';
    root.userData = { ...tag };
    building.add(root);
    building.updateMatrixWorld(true);
    const one = name => building.getObjectByName(name);
    const bounds = o => new T.Box3().setFromObject(o);
    const sanctuary = window.CHURCH_SANCTUARY?.materials || {};
    const gold = sanctuary.gold || new T.MeshStandardMaterial({ name: 'Sanctuary furnishings · gilding', color: '#c7983f', metalness: .72, roughness: .3 });
    const satin = sanctuary.satin || new T.MeshStandardMaterial({ name: 'Sanctuary furnishings · red lacquer', color: '#702a20', roughness: .62 });
    const brass = im.brass || gold;

    /* ------------------------------------------------------------ textures */
    const anisotropy = Math.min(8, renderer?.capabilities?.getMaxAnisotropy?.() || 4);
    let seed = 20112026;
    const rand = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
    function map(name, size, draw, colour) {
      const canvas = document.createElement('canvas'); canvas.width = canvas.height = size;
      draw(canvas.getContext('2d'), size);
      const texture = window.CHURCH_TEXTURES?.create(T, canvas) || new T.CanvasTexture(canvas);
      texture.name = `Sanctuary furnishings · ${name}`;
      texture.wrapS = texture.wrapT = T.RepeatWrapping;
      texture.colorSpace = colour ? T.SRGBColorSpace : T.NoColorSpace;
      texture.anisotropy = anisotropy;
      return texture;
    }
    // Veined marble that tiles: a soft cloudy ground, a few long branching veins and fine hair veins.
    // `kind` 'colour' or 'relief'; the relief only marks the veins as hair-fine sinkings of the polish.
    function marble({ ground, cloudLight, cloudDark, vein, hair, count = 7, alpha = [.12, .3], width = [.4, 1.1] }) {
      const s0 = seed, veins = [];
      for (let i = 0; i < count; i++) {
        const pts = [], y0 = rand(), slope = (rand() - .5) * .9;
        for (let k = 0; k <= 24; k++) { const u = k / 24; pts.push([u, y0 + slope * u + .05 * Math.sin(u * 9 + i) + (rand() - .5) * .018]); }
        veins.push({ pts, w: width[0] + rand() * (width[1] - width[0]), o: alpha[0] + rand() * (alpha[1] - alpha[0]), branch: rand() });
      }
      seed = s0 + 17;
      return kind => (g, n) => {
        g.fillStyle = kind === 'colour' ? ground : '#808080'; g.fillRect(0, 0, n, n);
        if (kind === 'colour') for (let i = 0; i < 70; i++) {
          const x = rand() * n, y = rand() * n, r = (.06 + rand() * .2) * n, light = rand() > .45;
          for (const dx of [-n, 0, n]) for (const dy of [-n, 0, n]) {
            const f = g.createRadialGradient(x + dx, y + dy, 0, x + dx, y + dy, r);
            f.addColorStop(0, light ? cloudLight : cloudDark); f.addColorStop(1, 'rgba(0,0,0,0)');
            g.fillStyle = f; g.fillRect(x + dx - r, y + dy - r, 2 * r, 2 * r);
          }
        }
        g.lineCap = 'round'; g.lineJoin = 'round';
        for (const v of veins) for (const dy of [-1, 0, 1]) {
          g.strokeStyle = kind === 'colour' ? vein.replace('A', v.o.toFixed(2)) : `rgba(40,40,40,${(v.o * .6).toFixed(2)})`;
          g.lineWidth = v.w * n / 512;
          g.beginPath(); v.pts.forEach(([u, y], k) => (k ? g.lineTo : g.moveTo).call(g, u * n, (y + dy) * n)); g.stroke();
          if (v.branch > .4) {
            const k0 = 6 + Math.floor(v.branch * 10), [u, y] = v.pts[k0];
            g.lineWidth = v.w * .5 * n / 512; g.beginPath(); g.moveTo(u * n, (y + dy) * n);
            g.quadraticCurveTo((u + .08) * n, (y + dy - .1) * n, (u + .2) * n, (y + dy - .06) * n); g.stroke();
          }
        }
        for (let i = 0; i < 40; i++) {
          const x = rand() * n, y = rand() * n, a = rand() * Math.PI, l = (.04 + rand() * .12) * n;
          g.strokeStyle = kind === 'colour' ? hair : 'rgba(60,60,60,.25)'; g.lineWidth = .7;
          g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
        }
        const px = g.getImageData(0, 0, n, n), d = px.data;
        for (let i = 0; i < d.length; i += 4) { const e = (rand() - .5) * (kind === 'colour' ? 4 : 2); d[i] += e; d[i + 1] += e; d[i + 2] += e; }
        g.putImageData(px, 0, 0);
      };
    }
    const pale = marble({ ground: '#efe9de', cloudLight: 'rgba(255,253,246,.16)', cloudDark: 'rgba(196,184,164,.05)', vein: 'rgba(158,140,116,A)', hair: 'rgba(170,156,134,.1)', count: 8, alpha: [.1, .28] });
    const red = marble({ ground: '#7a2a22', cloudLight: 'rgba(160,74,58,.18)', cloudDark: 'rgba(60,14,10,.22)', vein: 'rgba(214,176,156,A)', hair: 'rgba(210,170,150,.1)', count: 6, alpha: [.08, .2], width: [.3, .8] });
    const paleMaps = { map: map('pale marble', 1024, pale('colour'), true), bumpMap: map('pale marble veins', 1024, pale('relief')) };
    const redMaps = { map: map('red marble', 512, red('colour'), true), bumpMap: map('red marble veins', 512, red('relief')) };
    const material = (name, values, Kind = T.MeshStandardMaterial) => {
      const m = new Kind(values); m.name = name; m.userData.sanctuaryFurnishings = { revision: spec.revision, status: 'CONCEPT · display finish, not a selected stone or product' };
      palettes?.set(m, { color: m.color.clone(), map: m.map || null, bump: m.bumpMap || null }); stats.materials++; return m;
    };
    // Polished marble: a little clear reflection over a soft ground. The altar front keeps its warmer honed field.
    const altarMarble = material('Altar · polished veined pale marble', { color: '#ffffff', ...paleMaps, bumpScale: .0006, roughness: .28, metalness: 0, envMapIntensity: .65 });
    const redMarble = material('Altar · red marble colonnette', { color: '#ffffff', ...redMaps, bumpScale: .0005, roughness: .24, envMapIntensity: .7 });
    const silk = material('Ambo fall · green silk damask', {
      color: '#ffffff', roughness: .58, sheen: .6, sheenRoughness: .45, sheenColor: new T.Color('#dfe8c8'), side: T.DoubleSide,
      map: map('green silk damask fall', 512, (g, n) => {
        g.fillStyle = spec.fall.colour; g.fillRect(0, 0, n, n);
        // Woven damask: a faint repeating lozenge with a flower, tone on tone.
        g.strokeStyle = 'rgba(160,200,150,.13)'; g.lineWidth = 2;
        for (let y = -1; y < 5; y++) for (let x = -1; x < 4; x++) {
          const cx = (x + (y % 2 ? .5 : 0)) * n / 3, cy = y * n / 4.2;
          g.beginPath(); g.moveTo(cx, cy - 34); g.lineTo(cx + 26, cy); g.lineTo(cx, cy + 34); g.lineTo(cx - 26, cy); g.closePath(); g.stroke();
          g.beginPath(); g.arc(cx, cy, 7, 0, 2 * Math.PI); g.stroke();
        }
        // Gold galloon border on three sides; the fringe is separate geometry.
        g.fillStyle = '#c9a24c';
        g.fillRect(0, 0, n, 14); g.fillRect(0, 0, 14, n); g.fillRect(n - 14, 0, 14, n); g.fillRect(0, n - 22, n, 22);
        g.fillStyle = '#8f6b25'; for (let x = 0; x < n; x += 8) { g.fillRect(x, 4, 4, 6); g.fillRect(x, n - 16, 4, 8); }
        for (let y = 0; y < n; y += 8) { g.fillRect(4, y, 6, 4); g.fillRect(n - 10, y, 6, 4); }
        // Embroidered cross with trefoil ends and rays, in gold thread.
        const cx = n / 2, cy = n * .44, arm = n * .22, w = n * .045;
        g.save(); g.translate(cx, cy);
        g.strokeStyle = 'rgba(232,200,110,.55)'; g.lineWidth = 2;
        for (let k = 0; k < 16; k++) { const a = k * Math.PI / 8 + Math.PI / 16; g.beginPath(); g.moveTo(Math.cos(a) * arm * .35, Math.sin(a) * arm * .35); g.lineTo(Math.cos(a) * arm * .75, Math.sin(a) * arm * .75); g.stroke(); }
        g.fillStyle = '#d8b25a';
        g.fillRect(-w / 2, -arm, w, arm * 2.15); g.fillRect(-arm * .75, -w / 2 - arm * .25, arm * 1.5, w);
        for (const [x, y] of [[0, -arm], [0, arm * 1.15], [-arm * .75, -arm * .25], [arm * .75, -arm * .25]]) for (const [dx, dy] of [[0, 0], [w * .7, 0], [-w * .7, 0], [0, w * .7], [0, -w * .7]]) {
          g.beginPath(); g.arc(x + dx * .9, y + dy * .9, w * .48, 0, 2 * Math.PI); g.fill();
        }
        g.fillStyle = '#9c7a2e'; g.fillRect(-1.5, -arm, 3, arm * 2.15); g.fillRect(-arm * .75, -1.5 - arm * .25, arm * 1.5, 3);
        g.restore();
      }, true)
    }, T.MeshPhysicalMaterial);
    const fringe = material('Ambo fall · gold bullion fringe', { color: '#c9a04a', metalness: .55, roughness: .45 });
    const linen = material('Sanctuary furnishings · fine linen', { color: '#fbf8ef', roughness: .9 });
    const glass = material('Credence · clear glass cruet', { color: '#e8f0ee', roughness: .05, metalness: 0, transparent: true, opacity: .32, depthWrite: false, envMapIntensity: 1 });
    const wine = material('Credence · altar wine', { color: '#5a1622', roughness: .15, transparent: true, opacity: .85 });
    const water = material('Credence · water', { color: '#cfe3e6', roughness: .05, transparent: true, opacity: .4, depthWrite: false });

    /* ------------------------------------------------------------ helpers */
    const bins = new Map();
    const add = (name, m, geometry, matrix) => { const k = name + m.uuid; if (!bins.has(k)) bins.set(k, { name, material: m, parts: [] }); bins.get(k).parts.push([geometry, matrix || new T.Matrix4()]); };
    const box = (name, m, w, h, d, x, y, z, matrix) => add(name, m, new T.BoxGeometry(w, h, d), matrix ? place(matrix, TR(x, y, z)) : TR(x, y, z));
    // World box mapping, so the marble keeps one scale on every face whatever the part's size.
    function boxUV(geometry, matrix, tile = spec.marble.tile) {
      const g = geometry.index ? geometry.toNonIndexed() : geometry.clone();
      const p = g.attributes.position, nrm = g.attributes.normal, uv = new Float32Array(p.count * 2);
      const v = new T.Vector3(), nv = new T.Vector3(), normalMatrix = new T.Matrix3().getNormalMatrix(matrix);
      for (let i = 0; i < p.count; i++) {
        v.fromBufferAttribute(p, i).applyMatrix4(matrix); nv.fromBufferAttribute(nrm, i).applyMatrix3(normalMatrix);
        const ax = Math.abs(nv.x), ay = Math.abs(nv.y), az = Math.abs(nv.z);
        const [u, w] = ax >= ay && ax >= az ? [v.z, v.y] : az >= ay ? [v.x, v.y] : [v.x, v.z];
        uv[2 * i] = u / tile + .37; uv[2 * i + 1] = w / tile + .11;
      }
      g.setAttribute('uv', new T.BufferAttribute(uv, 2));
      return g;
    }
    function reface(o, m) {
      if (!o?.isMesh) return;
      o.updateWorldMatrix(true, false);
      o.geometry = weld(boxUV(o.geometry, o.matrixWorld)); o.material = m;
    }
    // Weld identical corners so display batches keep their memory saving (verify_model checks it).
    function weld(g) {
      const pos = g.attributes.position, nor = g.attributes.normal, uv = g.attributes.uv, seen = new Map(), P2 = [], N2 = [], U2 = [], index = [];
      for (let i = 0; i < pos.count; i++) {
        const key = [pos.getX(i), pos.getY(i), pos.getZ(i), nor.getX(i), nor.getY(i), nor.getZ(i)].map(v => Math.round(v * 1e5)).join();
        let k = seen.get(key);
        if (k === undefined) { k = P2.length / 3; seen.set(key, k); P2.push(pos.getX(i), pos.getY(i), pos.getZ(i)); N2.push(nor.getX(i), nor.getY(i), nor.getZ(i)); U2.push(uv ? uv.getX(i) : 0, uv ? uv.getY(i) : 0); }
        index.push(k);
      }
      const out = new T.BufferGeometry();
      out.setAttribute('position', new T.Float32BufferAttribute(P2, 3)); out.setAttribute('normal', new T.Float32BufferAttribute(N2, 3)); out.setAttribute('uv', new T.Float32BufferAttribute(U2, 2));
      out.setIndex(index); g.dispose();
      return out;
    }

    /* ------------------------------------------------------------ DX-01 altar */
    const base = one('Proposed altar stone base'), mensa = one('Proposed altar mensa'), foot = one('Proposed altar foot');
    if (base && mensa && foot) {
      const b = bounds(base), m = bounds(mensa);
      for (const o of [base, mensa, foot]) reface(o, altarMarble);
      // The mouldings of the interior finish study share the base's old stone: give them the marble too.
      building.traverse(o => { if (o.isMesh && /^Altar (mensa bed|base) moulding$/.test(o.name)) reface(o, altarMarble); });
      // The honed front field, its carving and gilded fillet stay as approved (owner, 3 Nov 2026).
      // Engaged colonnettes at the four corners, from the top of the base moulding to the gilded bead.
      const y0 = b.min.y + .08, y1 = m.min.y - .064, h = y1 - y0, r = spec.colonnette.r;
      const shaft = K.turned([[r * .86, 0], [r, h * .1], [r * 1.03, h * .4], [r * .97, h * .75], [r * .86, h * .88], [r * .82, h * .9], [.001, h * .9]], 20);
      const plinth = K.turned([[.001, 0], [r * 1.5, 0], [r * 1.5, .022], [r * 1.38, .03], [r * 1.42, .04], [r * 1.2, .052], [r * 1.1, .062], [r * .9, .07], [.001, .07]], 20);
      const cap = K.turned([[.001, 0], [r * .84, 0], [r * .9, .01], [r * .98, .018], [r * 1.3, .05], [r * 1.5, .062], [r * 1.5, .074], [.001, .074]], 20);
      const leaves = K.capital({ r: r * .85, h: .07, flare: r * .5, leaves: 6 });
      for (const x of [b.min.x, b.max.x]) for (const z of [b.min.z, b.max.z]) {
        add('Altar red marble colonnette', redMarble, shaft, TR(x, y0 + .062, z));
        add('Altar colonnette gilded base', gold, plinth, TR(x, y0, z));
        add('Altar colonnette gilded capital', gold, cap, TR(x, y1 - .074, z));
        add('Altar colonnette gilded leaves', gold, leaves.foliage, place(SC(1, .9, 1), TR(x, y1 - .14, z)));
        stats.colonnettes++;
      }
      // Gilded frames on the two end faces, inside the colonnettes and under the linen falls.
      const fw = b.max.x - b.min.x - 2 * (r + .07), fy0 = y0 + .05, fy1 = Math.min(y1 - .08, m.max.y - .45), fx = (b.min.x + b.max.x) / 2;
      for (const z of [b.min.z - .004, b.max.z + .004]) {
        for (const y of [fy0, fy1]) box('Altar end gilded fillet', gold, fw, .014, .008, fx, y, z);
        for (const x of [fx - fw / 2, fx + fw / 2]) box('Altar end gilded fillet', gold, .014, fy1 - fy0, .008, x, (fy0 + fy1) / 2, z);
        const rose = K.bloom({ r: .07, petals: 8, rings: 2, seg: 3 });
        add('Altar end gilded rosette', gold, rose, place(SC(1, 1, .5), z < 0 ? RY(Math.PI) : RY(0), TR(fx, (fy0 + fy1) / 2, z)));
      }
      stats.altar++;
    }

    /* ------------------------------------------------------------ DX-04 candlesticks */
    // Lift each altar candle (cup, candle, flame) by the height of a turned brass stick under it.
    {
      const H = spec.candlestick.height, cups = [];
      building.traverse(o => { if (o.isMesh && o.name === 'Proposed candle cup') { const c = bounds(o).getCenter(new T.Vector3()); if (c.x > spec.candlestick.x[0] && c.x < spec.candlestick.x[1] && c.y > 1.8 && c.y < 2.2) cups.push([o, c, bounds(o).min.y]); } });
      const stick = K.turned([[.001, 0], [.07, 0], [.072, .012], [.062, .02], [.05, .045], [.03, .06], [.022, .085], [.032, .1], [.022, .115], [.016, .17], [.026, .19], [.018, .205], [.05, .215], [.056, .224], [.04, H], [.001, H]], 22);
      for (const [cup, c, bottom] of cups) {
        const parts = [];
        cup.parent.traverse(o => { if (o.isMesh && /^(Proposed candle cup|Proposed candle|Candle light symbol)$/.test(o.name)) { const p = bounds(o).getCenter(new T.Vector3()); if (Math.hypot(p.x - c.x, p.z - c.z) < .02 && p.y > bottom - .01) parts.push(o); } });
        for (const o of parts) { o.position.y += H; o.userData.liftedBy = { m: H, reason: 'Altar candlestick, ' + spec.revision }; }
        add('Altar brass candlestick', brass, stick, TR(c.x, bottom, c.z));
        stats.candlesticks++;
      }
    }

    /* ------------------------------------------------------------ DX-02 ambo */
    const pedestal = one('Proposed ambo pedestal'), amboFoot = one('Proposed ambo foot'), desk = one('Proposed sloped ambo desk');
    if (pedestal && amboFoot && desk) {
      const param = pedestal.geometry.parameters || {};
      reface(amboFoot, altarMarble);
      // The pedestal keeps its geometry (the concealed cable passage is checked against it).
      const pedestalMarble = altarMarble.clone(); pedestalMarble.name = 'Ambo · polished veined pale marble';
      palettes?.set(pedestalMarble, { color: pedestalMarble.color.clone(), map: pedestalMarble.map, bump: pedestalMarble.bumpMap });
      reface(pedestal, pedestalMarble);
      const pb = bounds(pedestal), c = pb.getCenter(new T.Vector3());
      const rTop = param.radiusTop ?? .25, rBottom = param.radiusBottom ?? .34, segs = param.radialSegments ?? 6, ph = pb.max.y - pb.min.y;
      const band = (y, r, h, name) => add(name, gold, new T.CylinderGeometry(r, r, h, segs), place(new T.Matrix4().makeRotationFromQuaternion(pedestal.getWorldQuaternion(new T.Quaternion())), TR(c.x, y, c.z)));
      const rAt = y => rBottom + (rTop - rBottom) * (y - pb.min.y) / ph;
      band(pb.max.y - .035, rAt(pb.max.y - .035) + .008, .022, 'Ambo gilded upper band');
      band(pb.min.y + .06, rAt(pb.min.y + .06) + .008, .03, 'Ambo gilded lower band');
      // Silk fall from the nave edge of the desk top.
      desk.updateWorldMatrix(true, false);
      const dp = desk.geometry.parameters || { width: .57, height: .11, depth: .82 };
      const edge = new T.Vector3(-dp.width / 2, dp.height / 2, 0).applyMatrix4(desk.matrixWorld);
      const F = spec.fall, width = dp.depth - 2 * F.inset;
      const cloth = new T.PlaneGeometry(width, F.drop, 24, 6), pos = cloth.attributes.position, uv = cloth.attributes.uv;
      for (let i = 0; i < pos.count; i++) {
        const u = uv.getX(i), fall = 1 - uv.getY(i), wave = 2 * Math.PI * 3 * u;
        pos.setZ(i, .004 + fall * fall * (.006 + .005 * Math.cos(wave)));
      }
      cloth.computeVertexNormals();
      // The plane faces +Z; turn it to face the nave (−X), hanging from the edge.
      const turn = RY(-Math.PI / 2);
      add('Ambo fall · green silk', silk, cloth, place(turn, TR(edge.x - .016, edge.y - F.drop / 2 + .012, c.z)));
      box('Ambo fall · gilded cord over the desk edge', fringe, .02, .018, width + .02, edge.x - .02, edge.y + .002, c.z);
      // Bullion fringe: short twisted tassels along the lower hem.
      const tassel = new T.CylinderGeometry(.0045, .0035, .05, 5);
      for (let k = 0; k <= 34; k++) add('Ambo fall · gold bullion fringe', fringe, tassel, TR(edge.x - .022, edge.y - F.drop - .012, c.z - width / 2 + k * width / 34));
      stats.ambo++;
    }

    /* ------------------------------------------------------------ DX-03 credence */
    const top = one('Proposed credence table top');
    if (top) {
      const t = bounds(top), C = spec.credence, cx = (t.min.x + t.max.x) / 2, cz = (t.min.z + t.max.z) / 2;
      const supports = []; building.traverse(o => { if (o.isMesh && o.name === 'Credence support') supports.push(o); });
      const floor = supports.length ? Math.min(...supports.map(o => bounds(o).min.y)) : t.min.y - .8;
      for (const o of supports) { o.parent.remove(o); o.geometry.dispose?.(); }
      top.material = satin;
      const lx = (t.max.x - t.min.x) / 2 - C.inset, lz = (t.max.z - t.min.z) / 2 - C.inset, legH = t.min.y - floor;
      const leg = K.turned([[.001, 0], [C.leg * 1.4, 0], [C.leg * 1.4, .03], [C.leg * .9, .05], [C.leg * 1.3, .1], [C.leg * .8, .16], [C.leg * .75, legH * .45], [C.leg * 1.25, legH * .52], [C.leg * .8, legH * .58], [C.leg, legH - C.apron - .02], [C.leg * 1.3, legH - C.apron], [C.leg * 1.3, legH], [.001, legH]], 16);
      const collar = new T.TorusGeometry(C.leg * 1.05, .006, 5, 16);
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
        const x = cx + sx * lx, z = cz + sz * lz;
        add('Credence turned leg · red lacquer', satin, leg, TR(x, floor, z));
        add('Credence gilded collar', gold, collar, place(RX(Math.PI / 2), TR(x, floor + legH * .52, z)));
        add('Credence gilded collar', gold, collar, place(RX(Math.PI / 2), TR(x, floor + .1, z)));
      }
      // Apron under the top, set back from its edge, with gilded fillets and a rosette on each long face.
      const ay = t.min.y - C.apron / 2, ax = lx * 2 - .02, az = lz * 2 - .02;
      for (const s of [-1, 1]) {
        box('Credence apron · red lacquer', satin, .02, C.apron, az, cx + s * lx, ay, cz);
        box('Credence apron · red lacquer', satin, ax, C.apron, .02, cx, ay, cz + s * lz);
        for (const y of [ay - C.apron / 2 + .018, ay + C.apron / 2 - .018]) {
          box('Credence apron gilded fillet', gold, .006, .01, az - .06, cx + s * (lx + .012), y, cz);
          box('Credence apron gilded fillet', gold, ax - .06, .01, .006, cx, y, cz + s * (lz + .012));
        }
        const rose = K.bloom({ r: .04, petals: 8, rings: 2, seg: 3 });
        add('Credence apron gilded rosette', gold, rose, place(SC(1, 1, .5), RY(s < 0 ? -Math.PI / 2 : Math.PI / 2), TR(cx + s * (lx + .012), ay, cz)));
        add('Credence apron gilded rosette', gold, rose, place(SC(1, 1, .5), RY(s < 0 ? Math.PI : 0), TR(cx, ay, cz + s * (lz + .012))));
      }
      // Lower shelf between the legs.
      box('Credence lower shelf · red lacquer', satin, lx * 2 - .01, .022, lz * 2 - .01, cx, floor + C.shelf, cz);
      for (const s of [-1, 1]) {
        box('Credence lower shelf gilded edge', gold, .006, .01, lz * 2 - .01, cx + s * (lx - .002), floor + C.shelf, cz);
        box('Credence lower shelf gilded edge', gold, lx * 2 - .01, .01, .006, cx, floor + C.shelf, cz + s * (lz - .002));
      }
      stats.credence++;

      // Vessels on the linen, along the table's length (Z), set a little back from the nave edge.
      const y = t.max.y + .009, vx = cx + .04, z0 = t.min.z;
      const chalice = K.turned([[.001, 0], [.055, 0], [.056, .006], [.04, .016], [.016, .03], [.012, .06], [.022, .07], [.012, .085], [.01, .1], [.02, .108], [.042, .13], [.046, .175], [.044, .178], [.001, .178]], 24);
      add('Credence gilded chalice', gold, chalice, TR(vx, y, z0 + .3));
      add('Credence gilded paten', gold, new T.CylinderGeometry(.072, .068, .006, 28), TR(vx, y + .182, z0 + .3));
      box('Credence linen pall', linen, .13, .008, .13, vx, y + .19, z0 + .3);
      box('Credence folded purificator', linen, .07, .006, .2, vx, y + .003, z0 + .43);
      const ciborium = K.turned([[.001, 0], [.05, 0], [.052, .008], [.03, .02], [.012, .04], [.01, .075], [.02, .083], [.01, .095], [.03, .105], [.056, .13], [.058, .175], [.062, .18], [.05, .2], [.028, .225], [.012, .232], [.012, .245], [.001, .245]], 24);
      add('Credence gilded ciborium', gold, ciborium, TR(vx, y, z0 + .58));
      box('Credence ciborium cross', gold, .006, .05, .006, vx, y + .27, z0 + .58);
      box('Credence ciborium cross', gold, .006, .006, .03, vx, y + .275, z0 + .58);
      // Two cruets on a small gilded tray: water and wine.
      add('Credence gilded cruet tray', gold, K.turned([[.001, 0], [.1, 0], [.11, .012], [.104, .014], [.092, .004], [.001, .004]], 28), place(SC(1, 1, .62), TR(vx, y, z0 + .84)));
      const cruet = K.turned([[.001, 0], [.026, 0], [.034, .02], [.036, .05], [.028, .085], [.012, .11], [.011, .135], [.016, .145], [.001, .145]], 18);
      const fill = K.turned([[.001, 0], [.024, 0], [.031, .02], [.033, .05], [.028, .07], [.001, .07]], 18);
      for (const [dz, liquid, name] of [[-.04, water, 'water'], [.04, wine, 'wine']]) {
        add('Credence glass cruet', glass, cruet, TR(vx, y + .012, z0 + .84 + dz));
        add(`Credence cruet ${name}`, liquid, fill, TR(vx, y + .014, z0 + .84 + dz));
      }
      // Lavabo bowl and jug, and the folded towel.
      add('Credence brass lavabo bowl', brass, K.turned([[.001, 0], [.04, 0], [.07, .02], [.085, .05], [.08, .05], [.064, .024], [.001, .006]], 26), TR(vx, y, z0 + 1.08));
      box('Credence folded lavabo towel', linen, .12, .012, .1, vx - .02, y + .006, z0 + 1.2);
      stats.vessels += 7;
    }

    /* ------------------------------------------------------------ assemble */
    for (const { name, material: m, parts } of bins.values()) {
      const marbleUV = m === altarMarble || m === redMarble;
      const geometry = merge(parts);
      const mesh = new T.Mesh(weld(marbleUV && name !== 'Altar red marble colonnette' ? boxUV(geometry, new T.Matrix4()) : geometry), m);
      mesh.name = name; mesh.castShadow = false; mesh.receiveShadow = true;
      mesh.userData = { ...tag };
      if (m === glass || m === water) mesh.renderOrder = 2;
      root.add(mesh);
    }
    root.userData.stats = stats;
    window.CHURCH_SANCTUARY_FURNISHINGS.stats = stats;
    if (data) {
      data.sanctuaryFurnishings = { revision: spec.revision, status: 'CONCEPT', departures: ['DX-01', 'DX-02', 'DX-03', 'DX-04'], ...stats, newEquipment: 0, newRoutes: 0, source: spec.source };
      data.assumptions?.push('Sanctuary furnishings, 20 November 2026 (design excellence stage 2): veined marble altar with red marble colonnettes and gilded end frames, marble ambo with gilded bands and a green silk fall, red-lacquer credence on turned legs with vessels, brass altar candlesticks. Footprints, the ambo microphone and cable passage and analysis inputs are unchanged; the altar candles rise by their sticks. Display finishes only: stone, weights, fixings and open-flame safety are not designed.');
    }
  }

  window.CHURCH_SANCTUARY_FURNISHINGS = { spec, prepare };
})();
