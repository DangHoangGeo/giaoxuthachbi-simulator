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
    revision: '2026-11-10-interior-finish-2',
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
      fillet: { width: 0.045, depth: 0.028 }, rosette: 0.1, roundel: 0.15,
      bead: { inset: 0.07, width: 0.012, depth: 0.006 } },
    // Second pass (owner: the sanctuary and the timber ceiling are the focus).
    altar: { bed: [[.11, .022], [.05, .03]], base: [[.06, .05], [.03, .03]], endFall: .42, border: .035 },
    chair: { arm: .2, crest: { presider: .2, other: .11 } },
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
    const stats = { skirting: 0, cornice: 0, fillets: 0, panels: 0, rosettes: 0, flowers: 0, altar: 0, chairs: 0, materials: 0 };

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

    // Soft, shapeless clouds that tile: [r, g, b, a] for the light and the dark kind.
    function clouds(g, size, count, light, dark, rMin, rMax) {
      for (let i = 0; i < count; i++) {
        const x = rand() * size, y = rand() * size, r = (rMin + rand() * (rMax - rMin)) * size, c = rand() > .5 ? light : dark;
        for (const dx of [-size, 0, size]) for (const dy of [-size, 0, size]) {
          const fade = g.createRadialGradient(x + dx, y + dy, 0, x + dx, y + dy, r);
          fade.addColorStop(0, `rgba(${c[0]},${c[1]},${c[2]},${c[3]})`); fade.addColorStop(1, `rgba(${c[0]},${c[1]},${c[2]},0)`);
          g.fillStyle = fade; g.fillRect(x + dx - r, y + dy - r, r * 2, r * 2);
        }
      }
    }
    // Lacquer: a deep, even red film. The first study drew faint vertical brush strokes; on the
    // round columns and the chamber walls they read as the folds of a velvet curtain (owner review,
    // 10 November 2026). Depth now comes only from soft clouding under the clear coat, with no
    // direction, and the sheen varies just as gently.
    const lacquerMaps = {
      map: map('red lacquer depth', 512, (g, size) => {
        g.fillStyle = '#ebe6e4'; g.fillRect(0, 0, size, size);
        clouds(g, size, 44, [255, 250, 248, .05], [92, 52, 46, .06], .08, .26);
        grainNoise(g, size, 3);
      }, true),
      roughnessMap: map('red lacquer sheen', 512, (g, size) => {
        g.fillStyle = '#b4b4b4'; g.fillRect(0, 0, size, size);
        clouds(g, size, 36, [205, 205, 205, .12], [140, 140, 140, .12], .1, .3);
        grainNoise(g, size, 6);
      })
    };
    const all = new Set();
    building.traverse(o => { if (o.isMesh) for (const m of Array.isArray(o.material) ? o.material : [o.material]) all.add(m); });
    let gilding = null, insetMarble = null;
    const skies = [];
    for (const m of all) {
      if (m.name === 'Sanctuary · oxblood lacquer') surface(m, { ...lacquerMaps, clearcoat: .55, clearcoatRoughness: .2, envMapIntensity: .55 }); // roughness stays shared with the roof timbers
      else if (m.name === 'Sanctuary · carved gilding') gilding = m;
      else if (m.name === 'Sanctuary · dark marble inset') insetMarble = m;
      else if (m.name === 'Sanctuary · blue niche') skies.push([m, ['#d7ecfb', '#4aa0e6', '#1c6fc6'], 12]);
      else if (m.name === 'Sanctuary · shrine niche blue') skies.push([m, ['#d3e7f6', '#7fb2e0', '#4d8dca'], 22]);
    }
    // Blue niches: a painted sky in place of the smooth screen gradient. Same three blues and the
    // same light centre as before (approved sanctuary concept); added are soft clouds banked low and
    // round the light, a deeper rim, fine fresco grain and a few faint gilded stars above. The
    // texture spans the niche once, so clouds are drawn in metres and stay round on the wall.
    for (const [m, [inner, mid, outer], starCount] of skies) {
      const old = m.map;
      if (!old) continue;
      const W = 1 / old.repeat.x, H = 1 / old.repeat.y;
      const sky = map('painted niche sky', 1024, (g, s) => {
        const px = metres => metres / W * s, py = metres => metres / H * s;
        const shade = g.createRadialGradient(s / 2, s * .42, s * .04, s / 2, s * .5, s * .72);
        shade.addColorStop(0, inner); shade.addColorStop(.38, mid); shade.addColorStop(1, outer);
        g.fillStyle = shade; g.fillRect(0, 0, s, s);
        const blob = (x, y, r, rgba) => {
          g.save(); g.translate(x, y); g.scale(px(r), py(r));
          const f = g.createRadialGradient(0, 0, 0, 0, 0, 1);
          f.addColorStop(0, `rgba(${rgba[0]},${rgba[1]},${rgba[2]},${rgba[3]})`); f.addColorStop(.55, `rgba(${rgba[0]},${rgba[1]},${rgba[2]},${rgba[3] * .55})`); f.addColorStop(1, `rgba(${rgba[0]},${rgba[1]},${rgba[2]},0)`);
          g.fillStyle = f; g.beginPath(); g.arc(0, 0, 1, 0, 2 * Math.PI); g.fill(); g.restore();
        };
        // Cloud banks: a lower bank across the niche and a looser ring round the light.
        for (let bank = 0; bank < 16; bank++) {
          const low = bank < 9, cx = low ? (bank + rand() * .8) / 9 * s : s / 2 + Math.cos(bank * 1.9) * s * (.28 + rand() * .1);
          const cy = low ? s * (.72 + rand() * .2) : s * (.36 + Math.sin(bank * 1.9) * .2 + rand() * .06);
          for (let puff = 0; puff < 7; puff++) {
            const r = (.18 + rand() * .32) * (low ? 1 : .75);
            blob(cx + px((rand() - .5) * 1.1), cy + py((rand() - .6) * .35), r, [255, 255, 255, (low ? .1 : .06) + rand() * .07]);
            blob(cx + px((rand() - .5) * .9), cy + py(.12 + rand() * .12), r * .8, [36, 84, 150, .05]);
          }
        }
        // A deeper rim, as paint darkens toward the reveal.
        const rim = g.createRadialGradient(s / 2, s * .45, s * .3, s / 2, s * .5, s * .78);
        rim.addColorStop(0, 'rgba(14,40,92,0)'); rim.addColorStop(1, 'rgba(14,40,92,.32)');
        g.fillStyle = rim; g.fillRect(0, 0, s, s);
        // Faint gilded stars in the upper field.
        for (let i = 0; i < starCount; i++) {
          const x = (.08 + rand() * .84) * s, y = (.04 + rand() * .3) * s, r = .018 + rand() * .022;
          g.save(); g.translate(x, y); g.scale(px(r), py(r)); g.fillStyle = `rgba(244,214,140,${.45 + rand() * .3})`;
          g.beginPath();
          for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4, l = k % 2 ? .3 : 1; g.lineTo(Math.cos(a) * l, Math.sin(a) * l); }
          g.closePath(); g.fill(); g.restore();
        }
        grainNoise(g, s, 6);
      }, true);
      sky.wrapS = sky.wrapT = T.ClampToEdgeWrapping;
      sky.repeat.copy(old.repeat); sky.offset.copy(old.offset);
      surface(m, { map: sky });
      old.dispose();
      stats.skies = (stats.skies || 0) + 1;
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
        // The cornice also wraps the pier, so it reads as the pier's capital band.
        let y = C.bottom;
        for (const [h, cd] of C.steps) {
          const deep = spec.wallFace - P.face + cd;
          box('Nave pier plaster capital band', plaster, 2 * P.half + 2 * cd, h, deep, A[name], y + h / 2, s * (spec.wallFace - deep / 2));
          y += h;
        }
      }
    }

    // Entrance wall (nave face): skirting along each solid pier between the doorways, and the same
    // cornice across the full width, so the three walls of the nave share one base and one top line.
    const EN = window.CHURCH_FACADE?.spec?.entrance;
    if (EN) {
      const face = EN.wall[1], limit = P.face, solids = [];
      building.traverse(o => {
        if (!o.isMesh || o.name !== 'Entrance door wall · rear pier line') return;
        const b = new T.Box3().setFromObject(o);
        if (b.min.y < 0) solids.push([Math.max(b.min.z, -limit), Math.min(b.max.z, limit)]);
      });
      for (const [u, v] of solids) {
        // Stop clear of the jamb mouldings (0.12 m) round each doorway.
        const a = u + (u > -limit + .01 ? .12 : 0), b = v - (v < limit - .01 ? .12 : 0);
        if (b - a < .1) continue;
        const run = (name, h, d, y) => box(name, stone, d, h, b - a, face + d / 2, y, (a + b) / 2);
        run('Entrance wall stone skirting', S.height, S.depth, S.height / 2);
        run('Entrance wall stone skirting cap', S.cap, S.capDepth, S.height + S.cap / 2);
        stats.skirting++;
      }
      let y = C.bottom;
      for (const [h, d] of C.steps) { box('Entrance wall plaster cornice', plaster, d, h, 2 * limit, face + d / 2, y + h / 2, 0); y += h; }
      stats.cornice++;
    }

    // Ceiling panels. Each bay of the lining between two purlins is divided by lacquered cross
    // fillets. Every panel carries a fine gilded bead set in from its edges, and alternate panels
    // a gilded rosette on a red lacquer roundel, so the ivory field reads as framed, coffered
    // boarding (second pass: the first rosettes were gold on ivory and read only as dots).
    const R = spec.ceiling, tilt = Math.atan(R.slope), liningY = window.CHURCH_SANCTUARY.roofY;
    const span = (R.pitch - R.purlin) / Math.cos(tilt), F = R.fillet, B = R.bead;
    const rosette = K.bloom({ r: R.rosette, petals: 8, rings: 1, seg: 3 }), boss = new T.SphereGeometry(R.rosette * .26, 8, 6);
    const roundel = new T.CylinderGeometry(R.roundel, R.roundel, .012, 28), roundelRing = new T.TorusGeometry(R.roundel, .007, 5, 32);
    const panelLength = length => length / R.divisions - F.width - 2 * B.inset, panelSpan = span - 2 * B.inset;
    // The bead takes the vault's leaf gilding: the more metallic carved gilding turned grey in the
    // shade under the roof.
    const beadGold = window.CHURCH_SANCTUARY.materials?.leafGold || gold;
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
          const x = x0 + length * (j + .5) / R.divisions, lx = panelLength(length), ly = panelSpan;
          // Bead frame: two runs across the slope and two down it, mitred by overlap at the corners.
          for (const e of [-1, 1]) {
            add('Roof lining panel gilded bead', beadGold, new T.BoxGeometry(lx + B.width, B.width, B.depth), place(TR(0, e * ly / 2, 0), turn, at(B.depth / 2), TR(x, 0, 0)));
            add('Roof lining panel gilded bead', beadGold, new T.BoxGeometry(B.width, ly, B.depth), place(TR(e * lx / 2, 0, 0), turn, at(B.depth / 2), TR(x, 0, 0)));
          }
          stats.panels++;
          if ((i + j + bay) % 2) continue;
          add('Roof lining lacquer roundel', timber, roundel, place(RX(Math.PI / 2), turn, at(.006), TR(x, 0, 0)));
          add('Roof lining gilded rosette', gold, roundelRing, place(turn, at(.012), TR(x, 0, 0)));
          add('Roof lining gilded rosette', gold, rosette, place(SC(1, 1, .45), turn, at(.014), TR(x, 0, 0)));
          add('Roof lining gilded rosette', gold, boss, place(SC(1, 1, .6), turn, at(.024), TR(x, 0, 0)));
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
    // Altar (second pass). The pale stone altar stays (owner, 3 November 2026); it gains a stepped
    // bed moulding under the mensa overhang with a gilded bead, a base moulding over the foot, the
    // cloth falling over both ends, and a gilded embroidered border on every fall of the cloth.
    const bounds = o => new T.Box3().setFromObject(o);
    const altarBase = building.getObjectByName('Proposed altar stone base'), mensa = building.getObjectByName('Proposed altar mensa'), cloth = building.getObjectByName('Proposed altar linen');
    if (altarBase && mensa && cloth) {
      const b = bounds(altarBase), m = bounds(mensa), l = bounds(cloth), A2 = spec.altar, rock = altarBase.material, linen = cloth.material;
      const cx = (b.min.x + b.max.x) / 2, cz = (b.min.z + b.max.z) / 2, bw = b.max.x - b.min.x, bd = b.max.z - b.min.z;
      let y = m.min.y;
      for (const [grow, h] of A2.bed) { box('Altar mensa bed moulding', rock, bw + grow, h, bd + grow, cx, y - h / 2, cz); y -= h; }
      box('Altar gilded bead', gold, bw + .018, .012, bd + .018, cx, y - .006, cz);
      y = b.min.y;
      for (const [grow, h] of A2.base) { box('Altar base moulding', rock, bw + grow, h, bd + grow, cx, y + h / 2, cz); y += h; }
      const lx = l.max.x - l.min.x, lcx = (l.min.x + l.max.x) / 2;
      for (const e of [-1, 1]) {
        const z = e * ((l.max.z - l.min.z) / 2 + .003) + (l.min.z + l.max.z) / 2;
        box('Altar linen end fall', linen, lx, A2.endFall, .006, lcx, l.max.y - A2.endFall / 2, z);
        box('Altar linen gilded border', gold, lx + .004, A2.border, .004, lcx, l.max.y - A2.endFall + .03, z + e * .005);
        box('Altar linen gilded border', gold, lx + .004, .008, .004, lcx, l.max.y - A2.endFall + .068, z + e * .005);
      }
      building.traverse(o => {
        if (!o.isMesh || o.name !== 'Altar linen edge') return;
        const f = bounds(o), side = (f.min.x + f.max.x) / 2 < cx ? -1 : 1, x = side < 0 ? f.min.x - .002 : f.max.x + .002;
        box('Altar linen gilded border', gold, .004, A2.border, f.max.z - f.min.z, x, f.min.y + .03, (f.min.z + f.max.z) / 2);
        box('Altar linen gilded border', gold, .004, .008, f.max.z - f.min.z, x, f.min.y + .068, (f.min.z + f.max.z) / 2);
      });
      stats.altar++;
    }

    // Sanctuary chairs (second pass): arms with gilded knobs, a carved crest on the back (with a
    // gilded cross on the presider's chair), finials and a gilded frame round the upholstered back.
    // Seats, backs, legs and footprints stay as modelled; the crest adds 0.11–0.20 m of height.
    building.traverse(o => {
      if (!o.isMesh || o.name !== 'Chair back') return;
      const k = bounds(o), wood = o.material, cx = (k.min.x + k.max.x) / 2, cz = (k.min.z + k.max.z) / 2, depth = k.max.z - k.min.z;
      const presider = k.max.y - k.min.y > .8, face = k.min.x, F2 = cx - .28, seatTop = k.min.y + .155, armY = seatTop + spec.chair.arm;
      for (const e of [-1, 1]) {
        const z = cz + e * (depth / 2 - .035);
        box('Sanctuary chair arm', wood, face - (F2 - .25), .045, .055, (face + F2 - .25) / 2, armY, z);
        box('Sanctuary chair arm post', wood, .045, armY - (k.min.y + .0875), .045, F2 - .22, (armY + k.min.y + .0875) / 2, z);
        add('Sanctuary chair gilded knob', gold, new T.SphereGeometry(.03, 10, 8), TR(F2 - .25, armY + .005, z));
      }
      // Gilded frame round the back inset (inset: 0.67 / 0.51 m high, 0.15 m narrower than the back).
      const ih = presider ? .67 : .51, iw = depth - .15, iy = (k.min.y + k.max.y) / 2 + .02, fx = face - .003;
      for (const e of [-1, 1]) {
        box('Sanctuary chair gilded frame', gold, .006, .014, iw + .064, fx, iy + e * (ih / 2 + .025), cz);
        box('Sanctuary chair gilded frame', gold, .006, ih + .064, .014, fx, iy, cz + e * (iw / 2 + .025));
      }
      // Crest: a shallow arch across the top of the back, extruded through the back's thickness.
      const ch = presider ? spec.chair.crest.presider : spec.chair.crest.other, w = depth / 2, thick = k.max.x - k.min.x;
      const arch = new T.Shape();
      arch.moveTo(-w, 0); arch.lineTo(w, 0); arch.lineTo(w, ch * .45);
      arch.quadraticCurveTo(w * .55, ch * .5, w * .3, ch * .78); arch.quadraticCurveTo(w * .12, ch, 0, ch);
      arch.quadraticCurveTo(-w * .12, ch, -w * .3, ch * .78); arch.quadraticCurveTo(-w * .55, ch * .5, -w, ch * .45); arch.closePath();
      const crest = new T.ExtrudeGeometry(arch, { depth: thick, bevelEnabled: false, curveSegments: 8 });
      add('Sanctuary chair carved crest', wood, crest, place(RY(Math.PI / 2), TR(k.min.x, k.max.y, cz)));
      const finial = K.turned([[.001, 0], [.026, .008], [.03, .028], [.016, .05], [.022, .066], [.012, .085], [.001, .09]], 14);
      for (const e of [-1, 1]) add('Sanctuary chair gilded finial', gold, finial, TR(cx, k.max.y + ch * .45, cz + e * (w - .035)));
      if (presider) {
        box('Sanctuary chair gilded cross', gold, .006, .12, .022, fx, k.max.y + ch * .52, cz);
        box('Sanctuary chair gilded cross', gold, .006, .022, .08, fx, k.max.y + ch * .6, cz);
      } else add('Sanctuary chair gilded knob', gold, new T.SphereGeometry(.022, 10, 8), place(SC(.4, 1, 1), TR(fx, k.max.y + ch * .5, cz)));
      stats.chairs++;
    });

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
