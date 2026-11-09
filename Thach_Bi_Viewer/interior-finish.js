/* Interior finish study, 10 November 2026. Metres; X from axis 1, Y up, Z from the centre line.
 *
 * Appearance only: CONCEPT · In development · Not for construction. The owner asked for an interior
 * that reads as a finished, warm church (review/interior-baseline-2026-11-10). This layer adds what
 * a decorator would add after the builder leaves:
 *   - paving joints, tone and sheen on the existing floor finish;
 *   - a honed-stone skirting and a plaster cornice on the nave side walls, bay by bay;
 *   - cross fillets and gilded rosettes that turn the boarded roof lining into framed panels;
 *   - calmer lacquer, finer joinery grain and red marble panels on the column pedestals;
 *   - sanctuary details: open flowers, a framed altar front, a credence cloth, a sanctuary lamp,
 *     and two holy-water stoups by the entrance.
 * It moves no wall, member, seat, fitting or route and changes no analysis input: the simulator
 * keeps its own reflectance schedule and geometry. Sizes are visualization proxies; mouldings,
 * fixings, stone and timber sections, artwork and products remain for the designers and the artist.
 * See docs/decoration-finishes.md.
 */
(() => {
  'use strict';
  const spec = {
    revision: '2026-11-10-interior-finish-1',
    status: 'CONCEPT · display finish and ornament proxy',
    source: 'Owner request 10 Nov 2026; nave concept of 9 Nov 2026 (review/interior-concept-2026-11-09)',
    bays: [['2′', '3'], ['3', '4'], ['4', '5'], ['5', '6'], ['6', '7'], ['7', '8'], ['8', '9']],
    doorBays: ['4–5', '8–9'],          // side doors: the skirting stops at their surrounds
    wallFace: 7.25,                     // nave face of the inner C/G wall
    pier: { half: 0.29, face: 7.07 },   // side piers stand 0.18 m proud of the wall
    skirting: { height: 0.14, depth: 0.02, cap: 0.025, capDepth: 0.032, doorClear: 1.45 },
    // Between the station finials (top +6.70) and the wall purlin's soffit (+6.96).
    cornice: { bottom: 6.76, steps: [[0.07, 0.03], [0.05, 0.06], [0.05, 0.095]] },
    ceiling: { slope: 0.7258, first: 0.58, pitch: 0.5, strips: 13, purlin: 0.14, divisions: 3,
      fillet: { width: 0.045, depth: 0.028 }, rosette: 0.075 },
    stoup: { x: 5.47, z: 1.85, y: 1.02, radius: 0.15 },
    lamp: { x: 47.2, z: 0.62, glass: 1.5 }
  };
  let flame, lampGlass;
  window.CHURCH_INTERIOR_FINISH = { spec, prepare, lighting };

  function prepare({ THREE: T, building, mat, interior, renderer, palettes, data }) {
    const im = interior.materials, K = window.CHURCH_CARVING.create(T);
    const { TR, RX, RY, RZ, SC, place, merge } = K;
    const tag = { status: spec.status, source: spec.source, revision: spec.revision };
    const root = new T.Group();
    root.name = 'Interior finish study · skirting, cornice, ceiling panels and sanctuary details';
    root.userData = { ...tag };
    building.add(root);
    const stats = { skirting: 0, cornice: 0, fillets: 0, rosettes: 0, flowers: 0, materials: 0 };

    /* ------------------------------------------------------------ textures */
    const anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    // Own seed: this study must not shift any other generator's sequence.
    let seed = 10112026;
    const rand = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
    function map(name, size, draw, colour) {
      const canvas = document.createElement('canvas'); canvas.width = canvas.height = size;
      draw(canvas.getContext('2d'), size);
      const texture = window.CHURCH_TEXTURES?.create(T, canvas) || new T.CanvasTexture(canvas);
      texture.name = `Interior finish · ${name}`;
      texture.wrapS = texture.wrapT = T.RepeatWrapping;
      texture.colorSpace = colour ? T.SRGBColorSpace : T.NoColorSpace;
      texture.anisotropy = anisotropy;
      return texture;
    }
    function grainNoise(g, size, amount) {
      const pixels = g.getImageData(0, 0, size, size), d = pixels.data;
      for (let i = 0; i < d.length; i += 4) { const n = (rand() - .5) * amount; d[i] += n; d[i + 1] += n; d[i + 2] += n; }
      g.putImageData(pixels, 0, 0);
    }
    function surface(material, values) {
      if (!material) return;
      Object.assign(material, values);
      material.userData.interiorFinish = { revision: spec.revision, status: 'CONCEPT · display finish, not measured reflectance' };
      material.needsUpdate = true; stats.materials++;
      const palette = palettes?.get(material);
      if (palette) { if ('map' in values) palette.map = material.map; if ('bumpMap' in values) palette.bump = material.bumpMap; }
    }

    // Paving: the existing 0.90 m module (four slabs across the 3.6 m repeat), now with a legible
    // joint, slab-to-slab tone and soft veining. The same seedless layout serves colour, relief and
    // roughness so joints line up in all three.
    const slabs = [];
    for (let row = 0; row < 4; row++) for (let col = 0; col < 4; col++) slabs.push({ row, col, tone: rand(), warm: rand(), polish: rand() });
    const veins = Array.from({ length: 70 }, () => ({ x: rand(), y: rand(), a: rand() * Math.PI, len: .08 + rand() * .22, bend: (rand() - .5) * .12, w: .4 + rand() * 1.4, o: .03 + rand() * .06 }));
    const paving = kind => (g, size) => {
      const cell = size / 4, joint = Math.max(2, Math.round(size / 256));
      g.fillStyle = kind === 'colour' ? '#a79f8f' : kind === 'relief' ? '#5a5a5a' : '#f2f2f2';
      g.fillRect(0, 0, size, size);
      for (const s of slabs) {
        const x = s.col * cell + joint / 2, y = s.row * cell + joint / 2, w = cell - joint;
        if (kind === 'colour') {
          const v = 222 + s.tone * 16, warm = (s.warm - .5) * 9;
          g.fillStyle = `rgb(${v + warm},${v - 3},${v - 16 - warm})`;
        } else if (kind === 'relief') g.fillStyle = '#c4c4c4';
        else { const r = 92 + s.polish * 34; g.fillStyle = `rgb(${r},${r},${r})`; }
        g.fillRect(x, y, w, w);
        if (kind === 'relief') {
          // Eased arris: the joint reads as a shallow groove, not a printed line.
          g.strokeStyle = '#9c9c9c'; g.lineWidth = joint; g.strokeRect(x + joint / 2, y + joint / 2, w - joint, w - joint);
        }
      }
      if (kind === 'colour') {
        g.lineCap = 'round';
        for (const v of veins) for (const dx of [-1, 0, 1]) for (const dy of [-1, 0, 1]) {
          const x = (v.x + dx) * size, y = (v.y + dy) * size, ex = x + Math.cos(v.a) * v.len * size, ey = y + Math.sin(v.a) * v.len * size;
          g.strokeStyle = `rgba(118,104,84,${v.o})`; g.lineWidth = v.w * size / 512;
          g.beginPath(); g.moveTo(x, y);
          g.quadraticCurveTo((x + ex) / 2 - Math.sin(v.a) * v.bend * size, (y + ey) / 2 + Math.cos(v.a) * v.bend * size, ex, ey); g.stroke();
        }
        // Soft clouding inside the stone.
        for (let i = 0; i < 46; i++) {
          const x = rand() * size, y = rand() * size, r = (.05 + rand() * .11) * size, light = rand() > .5;
          for (const dx of [-size, 0, size]) for (const dy of [-size, 0, size]) {
            const fade = g.createRadialGradient(x + dx, y + dy, 0, x + dx, y + dy, r);
            fade.addColorStop(0, light ? 'rgba(255,250,236,.07)' : 'rgba(120,108,90,.05)'); fade.addColorStop(1, 'rgba(0,0,0,0)');
            g.fillStyle = fade; g.fillRect(x + dx - r, y + dy - r, r * 2, r * 2);
          }
        }
      }
      grainNoise(g, size, kind === 'colour' ? 5 : kind === 'relief' ? 3 : 12);
    };
    const floorMaps = { map: map('paving colour', 1024, paving('colour'), true), bumpMap: map('paving relief', 1024, paving('relief')), roughnessMap: map('paving polish', 1024, paving('polish')) };
    // Honed, lightly polished stone: enough sheen to carry a soft reflection of lamps and columns.
    surface(mat.floor, { ...floorMaps, bumpScale: .0022, roughness: .7, envMapIntensity: .7 });
    for (const m of [im.whiteStone, im.stone]) surface(m, { roughness: .5, envMapIntensity: .55 });

    // Lacquer: a deep, nearly even red with faint brush drift, in place of the large blotched figure.
    const lacquerMaps = {
      map: map('red lacquer depth', 512, (g, size) => {
        g.fillStyle = '#e9e4e2'; g.fillRect(0, 0, size, size);
        for (let i = 0; i < 260; i++) {
          const x = rand() * size, light = rand() > .5;
          g.strokeStyle = light ? `rgba(255,255,255,${.03 + rand() * .05})` : `rgba(96,60,52,${.03 + rand() * .06})`;
          g.lineWidth = 1 + rand() * 7; g.beginPath(); g.moveTo(x, 0);
          g.bezierCurveTo(x + (rand() - .5) * 14, size * .33, x + (rand() - .5) * 14, size * .66, x, size); g.stroke();
        }
        grainNoise(g, size, 4);
      }, true),
      roughnessMap: map('red lacquer sheen', 512, (g, size) => {
        g.fillStyle = '#b4b4b4'; g.fillRect(0, 0, size, size);
        for (let i = 0; i < 180; i++) {
          const x = rand() * size, v = 150 + rand() * 70;
          g.strokeStyle = `rgba(${v},${v},${v},.22)`; g.lineWidth = 1 + rand() * 5;
          g.beginPath(); g.moveTo(x, 0); g.lineTo(x + (rand() - .5) * 10, size); g.stroke();
        }
        grainNoise(g, size, 10);
      })
    };
    const all = new Set();
    building.traverse(o => { if (o.isMesh) for (const m of Array.isArray(o.material) ? o.material : [o.material]) all.add(m); });
    let gilding = null, insetMarble = null;
    for (const m of all) {
      if (m.name === 'Sanctuary · oxblood lacquer') surface(m, { ...lacquerMaps, clearcoat: .55, clearcoatRoughness: .2, envMapIntensity: .55 }); // roughness stays shared with the roof timbers
      else if (m.name === 'Sanctuary · carved gilding') gilding = m;
      else if (m.name === 'Sanctuary · dark marble inset') insetMarble = m;
    }
    // Pedestal panels: deep red marble with a polish, in the red-and-gold scheme (was grey-green).
    if (insetMarble) {
      surface(insetMarble, { roughness: .24, envMapIntensity: .6, map: map('red marble panel', 256, (g, size) => {
        g.fillStyle = '#ffffff'; g.fillRect(0, 0, size, size);
        for (let i = 0; i < 26; i++) {
          const x = rand() * size, y = rand() * size;
          g.strokeStyle = `rgba(255,236,214,${.05 + rand() * .1})`; g.lineWidth = .5 + rand() * 1.6;
          g.beginPath(); g.moveTo(x, y); g.bezierCurveTo(x + 30, y - 18, x - 20, y + 60, x + 70, y + 90); g.stroke();
        }
        for (let i = 0; i < 30; i++) {
          const x = rand() * size, y = rand() * size, r = 8 + rand() * 30, fade = g.createRadialGradient(x, y, 0, x, y, r);
          fade.addColorStop(0, 'rgba(40,10,8,.16)'); fade.addColorStop(1, 'rgba(40,10,8,0)');
          g.fillStyle = fade; g.fillRect(x - r, y - r, r * 2, r * 2);
        }
        grainNoise(g, size, 6);
      }, true) });
      insetMarble.color.set('#7a2a22');
    }
    // Joinery: fine straight grain with a few cathedral arches, for pews and panelled work.
    const joinery = kind => (g, size) => {
      g.fillStyle = kind === 'colour' ? '#8a6444' : '#8c8c8c'; g.fillRect(0, 0, size, size);
      for (let i = 0; i < 900; i++) {
        const x = rand() * size, light = rand() > .5, a = .05 + rand() * .13;
        g.strokeStyle = kind === 'colour' ? (light ? `rgba(226,170,110,${a})` : `rgba(52,26,12,${a})`) : (light ? `rgba(215,215,215,${a})` : `rgba(40,40,40,${a})`);
        g.lineWidth = .3 + rand() * 1.3; g.beginPath(); g.moveTo(x, 0);
        g.bezierCurveTo(x + Math.sin(i) * 3, size * .33, x + Math.cos(i * 1.7) * 3, size * .66, x, size); g.stroke();
      }
      for (let i = 0; i < 5; i++) {
        const x = rand() * size, y = rand() * size;
        for (let k = 1; k < 7; k++) {
          g.strokeStyle = kind === 'colour' ? 'rgba(48,24,10,.11)' : 'rgba(50,50,50,.1)'; g.lineWidth = .8;
          g.beginPath(); g.ellipse(x, y, k * 3.2, k * 26, 0, Math.PI, 2 * Math.PI); g.stroke();
        }
      }
      grainNoise(g, size, kind === 'colour' ? 5 : 4);
    };
    const joineryMaps = { map: map('joinery grain', 512, joinery('colour'), true), bumpMap: map('joinery grain relief', 512, joinery('relief')) };
    surface(im.wood, { ...joineryMaps, bumpScale: .0016, roughness: .46, envMapIntensity: .5 });
    surface(im.woodInset, { ...joineryMaps, bumpScale: .0016, roughness: .52, envMapIntensity: .45 });

    /* ------------------------------------------------------------ geometry */
    const material = (name, values) => { const m = new T.MeshStandardMaterial(values); m.name = name; return m; };
    const stone = im.stone, plaster = mat.trim, timber = im.timber;
    const gold = gilding || material('Interior finish · gilding', { color: '#c7983f', metalness: .7, roughness: .4 });
    const bins = new Map();
    const add = (name, m, geometry, matrix) => { const k = name + m.uuid; if (!bins.has(k)) bins.set(k, { name, material: m, parts: [] }); bins.get(k).parts.push([geometry, matrix]); };
    const box = (name, m, w, h, d, x, y, z, matrix) => add(name, m, new T.BoxGeometry(w, h, d), matrix ? place(TR(x, y, z), matrix) : TR(x, y, z));

    const A = data.longitudinal, S = spec.skirting, C = spec.cornice, P = spec.pier;
    for (const s of [-1, 1]) {
      for (const [a, b] of spec.bays) {
        if (!(a in A) || !(b in A)) continue;
        const x0 = A[a] + P.half, x1 = A[b] - P.half, centre = (A[a] + A[b]) / 2;
        const runs = spec.doorBays.includes(`${a}–${b}`) ? [[x0, centre - S.doorClear], [centre + S.doorClear, x1]] : [[x0, x1]];
        for (const [u, v] of runs) {
          if (v - u < .1) continue;
          box('Nave wall stone skirting', stone, v - u, S.height, S.depth, (u + v) / 2, S.height / 2, s * (spec.wallFace - S.depth / 2));
          box('Nave wall stone skirting cap', stone, v - u, S.cap, S.capDepth, (u + v) / 2, S.height + S.cap / 2, s * (spec.wallFace - S.capDepth / 2));
          stats.skirting++;
        }
        // Cornice between the piers: three plaster steps growing toward the roof.
        let y = C.bottom;
        for (const [h, d] of C.steps) { box('Nave wall plaster cornice', plaster, x1 - x0, h, d, centre, y + h / 2, s * (spec.wallFace - d / 2)); y += h; }
        stats.cornice++;
      }
      // The skirting returns round the three visible faces of each pier.
      for (const name of new Set(spec.bays.flat())) {
        if (!(name in A)) continue;
        const d = spec.wallFace - P.face + S.depth;
        box('Nave pier stone skirting', stone, 2 * P.half + 2 * S.depth, S.height, d, A[name], S.height / 2, s * (spec.wallFace - d / 2));
        box('Nave pier stone skirting cap', stone, 2 * P.half + 2 * S.capDepth, S.cap, d + S.capDepth - S.depth, A[name], S.height + S.cap / 2, s * (spec.wallFace - (d + S.capDepth - S.depth) / 2));
      }
    }

    // Ceiling panels. Each bay of the lining between two purlins is divided by lacquered cross
    // fillets; a small gilded rosette marks alternate panels, so the field stays calm.
    const R = spec.ceiling, tilt = Math.atan(R.slope), liningY = window.CHURCH_SANCTUARY.roofY;
    const span = (R.pitch - R.purlin) / Math.cos(tilt), F = R.fillet;
    const rosette = K.bloom({ r: R.rosette, petals: 8, rings: 1, seg: 3 }), boss = new T.SphereGeometry(R.rosette * .26, 8, 6);
    spec.bays.forEach(([a, b], bay) => {
      if (!(a in A) || !(b in A)) return;
      const x0 = A[a] + .2, length = A[b] - A[a] - .4;
      for (const s of [-1, 1]) for (let i = 0; i < R.strips; i++) {
        const z = R.first + R.pitch * (i + .5), y = liningY(z), turn = RX(Math.PI / 2 + s * tilt);
        // Local +Z of a part becomes the lining's inward normal after `turn`.
        const normal = [0, -Math.cos(tilt), -s * Math.sin(tilt)], at = d => TR(0, y + normal[1] * d, s * z + normal[2] * d);
        for (let j = 1; j < R.divisions; j++) {
          add('Roof lining panel fillet', timber, new T.BoxGeometry(F.width, span, F.depth), place(turn, at(F.depth / 2), TR(x0 + length * j / R.divisions, 0, 0)));
          stats.fillets++;
        }
        for (let j = 0; j < R.divisions; j++) {
          if ((i + j + bay) % 2) continue;
          const x = x0 + length * (j + .5) / R.divisions;
          add('Roof lining gilded rosette', gold, rosette, place(SC(1, 1, .45), turn, at(.002), TR(x, 0, 0)));
          add('Roof lining gilded rosette', gold, boss, place(SC(1, 1, .6), turn, at(.012), TR(x, 0, 0)));
          stats.rosettes++;
        }
      }
    });

    // Altar front: a gilded fillet frames the carved panel (nave face of the altar).
    const front = building.getObjectByName('Proposed altar front panel');
    if (front) {
      const b = new T.Box3().setFromObject(front), x = b.min.x - .004, cy = (b.min.y + b.max.y) / 2, h = b.max.y - b.min.y - .1, w = b.max.z - b.min.z - .1;
      for (const e of [-1, 1]) {
        box('Altar front gilded fillet', gold, .008, .014, w, x, cy + e * h / 2, 0);
        box('Altar front gilded fillet', gold, .008, h, .014, x, cy, e * w / 2);
      }
    }
    // Credence: a linen cloth with a short fall on the two long edges.
    const credence = building.getObjectByName('Proposed credence table top');
    if (credence) {
      const b = new T.Box3().setFromObject(credence), linen = material('Interior finish · credence linen', { color: '#f7f1de', roughness: .94 });
      const cx = (b.min.x + b.max.x) / 2, cz = (b.min.z + b.max.z) / 2, w = b.max.x - b.min.x, d = b.max.z - b.min.z;
      box('Credence linen cloth', linen, w + .012, .008, d * .7, cx, b.max.y + .004, cz);
      for (const e of [-1, 1]) box('Credence linen cloth fall', linen, .006, .14, d * .7, cx + e * (w / 2 + .006), b.max.y - .066, cz);
    }
    // Flowers in the two stone planters: open blooms in place of the placeholder balls.
    const bloom = weld(merge([[K.bloom({ r: .075, petals: 6, rings: 2, seg: 3 }), RX(-Math.PI / 2)]]));
    building.traverse(o => { if (o.isMesh && o.name === 'White flower') { o.geometry = bloom; o.rotation.set((o.position.z % .3) * 1.4, o.position.x * 9, (o.position.x % .2) * 1.6); stats.flowers++; } });

    // Sanctuary lamp beside the tabernacle: a brass stand with a red glass and a living flame. A wax
    // or oil lamp, not an electrical fitting; it appears in no equipment register.
    const L = spec.lamp, floor = window.CHURCH_SANCTUARY.floorY?.(L.x, L.z) ?? .8, brass = im.brass;
    const lampAt = TR(L.x, floor, L.z);
    add('Sanctuary lamp brass stand', brass, K.turned([[.11, 0], [.11, .018], [.085, .04], [.04, .07], [.022, .11], [.018, .5], [.03, .54], [.018, .58], [.016, 1.2], [.03, 1.26], [.016, 1.3], [.02, L.glass - .1],
      [.062, L.glass - .04], [.066, L.glass - .01], [.05, L.glass]], 20), lampAt);
    lampGlass = new T.MeshStandardMaterial({ color: '#8f1414', emissive: '#ff2a12', emissiveIntensity: .5, roughness: .18, transparent: true, opacity: .86 });
    lampGlass.name = 'Interior finish · sanctuary lamp red glass';
    add('Sanctuary lamp red glass', lampGlass, K.turned([[.034, 0], [.05, .03], [.054, .11], [.046, .17], [.05, .18]], 18), place(TR(0, L.glass, 0), lampAt));
    flame = new T.MeshStandardMaterial({ color: '#fff1c2', emissive: '#ffb45a', emissiveIntensity: 2.4, roughness: .6 });
    flame.name = 'Interior finish · sanctuary lamp flame';
    add('Sanctuary lamp flame', flame, new T.SphereGeometry(.014, 8, 6), place(SC(1, 2, 1), TR(0, L.glass + .12, 0), lampAt));
    add('Sanctuary lamp brass rim', brass, new T.TorusGeometry(.05, .005, 6, 20), place(RX(Math.PI / 2), TR(0, L.glass + .18, 0), lampAt));

    // Holy-water stoups on the entrance wall, either side of the centre door.
    const W = spec.stoup;
    for (const e of [-1, 1]) {
      const at = TR(W.x, W.y, e * W.z);
      add('Holy-water stoup stone bowl', im.whiteStone, K.turned([[.02, -.16], [.05, -.13], [.06, -.08], [W.radius * .8, -.04], [W.radius, 0], [W.radius - .012, 0], [W.radius - .03, -.035], [.02, -.06], [.001, -.06]], 20), place(TR(.05, 0, 0), at));
      box('Holy-water stoup stone back', im.whiteStone, .03, .46, .3, W.x + .015, W.y + .09, e * W.z);
      box('Holy-water stoup gilded cross', gold, .008, .13, .02, W.x + .034, W.y + .2, e * W.z);
      box('Holy-water stoup gilded cross', gold, .008, .02, .08, W.x + .034, W.y + .225, e * W.z);
    }

    for (const { name, material: m, parts } of bins.values()) {
      const mesh = new T.Mesh(weld(merge(parts)), m);
      mesh.name = name; mesh.castShadow = false; mesh.receiveShadow = true;
      mesh.userData = { ...tag };
      root.add(mesh);
    }
    root.userData.stats = stats;
    window.CHURCH_INTERIOR_FINISH.stats = stats;
    data.interiorFinish = { revision: spec.revision, status: 'CONCEPT', ...stats, newEquipment: 0, newRoutes: 0, source: spec.source };
    data.assumptions?.push('Interior finish study, 10 November 2026: paving joints and sheen, nave skirting and cornice, panelled roof lining with gilded rosettes, calmer lacquer, red marble pedestal panels, a sanctuary lamp and two holy-water stoups. Display finishes and ornament proxies only: no measured reflectance, no member, fixing, product or analysis input.');

    // Weld identical corners so display batches keep their memory saving.
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
  }

  // Flames and the sanctuary lamp carry the evening; by day they only glint.
  function lighting(mode, interior) {
    const night = mode === 'evening';
    if (flame) flame.emissiveIntensity = night ? 7 : 2.4;
    if (lampGlass) lampGlass.emissiveIntensity = night ? 1.5 : .5;
    const candle = interior?.materials?.flame;
    if (candle) candle.emissiveIntensity = night ? 6 : 1.4;
  }
})();
