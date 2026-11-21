/* Courtyard shade trees, presentation only. Metres; X from axis 1, Y up, Z from the centre line.
 * See docs/design-excellence.md, "Courtyard trees".
 *
 * CONCEPT / UNSURVEYED LANDSCAPE. realism.js plants the two rows of eight trees, their soil beds
 * and stone edging. This module grows each tree into a broad-leaved shade tree:
 *   - a tapered trunk with a root flare and a slight lean, forking at 2.2–2.8 m into four to six
 *     curved limbs, each with secondary branches, all bark-textured;
 *   - an irregular crown built from leaf clusters at the branch ends, each cluster made of leaf
 *     sprays drawn on transparent cards, so the crown has gaps and lobes, not one round mass;
 *   - the light falls off into the crown: the cards take a shaded, middle or sunlit spray from a
 *     texture atlas according to their depth and height in the crown (the display batches keep
 *     no vertex colours, so the tone is in the texture), and their normals point out of the
 *     crown so it shades as one canopy;
 *   - three slightly different leaf tints, so the sixteen trees do not look cloned.
 * The positions, beds, edging and lawn are unchanged. Species, mature size, planting, root
 * protection and drainage remain for the site design.
 */
(() => {
  'use strict';
  const spec = {
    revision: '2026-11-21-shade-trees-2',
    status: 'CONCEPT / UNSURVEYED LANDSCAPE · presentation only',
    species: 'Broad-leaved shade tree; species pending (site design)',
    ground: -2.08,
    height: [6.4, 7.6],     // ground to crown top
    clearTrunk: [2.2, 2.8], // ground to the first fork
    limbs: [4, 6],
    cardsPerCluster: [46, 64],
    card: [0.5, 0.86]
  };

  function prepare({ THREE: T, building, renderer }) {
    const landscape = building.getObjectByName('Two rows of courtyard trees');
    if (!landscape) return;
    let seed = 21112026;
    const rand = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
    const range = ([a, b]) => a + (b - a) * rand();
    const anisotropy = Math.min(8, renderer?.capabilities?.getMaxAnisotropy?.() || 4);

    /* ---------------------------------------------------------- textures */
    // Leaf atlas: three spray shapes (columns) in three tones (rows: shaded, middle, sunlit).
    const TILE = 340, ATLAS = 1024, PAD = 10;
    const atlas = document.createElement('canvas'); atlas.width = atlas.height = ATLAS;
    const g = atlas.getContext('2d');
    g.clearRect(0, 0, ATLAS, ATLAS);
    const tones = [
      { leaf: ['#1f3418', '#25401d', '#2b4a21', '#304f25'], light: 'rgba(120,150,100,.22)', vein: 'rgba(10,24,8,.35)' },
      { leaf: ['#355a26', '#3d652b', '#46702f', '#4e7a35'], light: 'rgba(190,215,140,.28)', vein: 'rgba(20,40,14,.35)' },
      { leaf: ['#5b8a39', '#679641', '#74a24a', '#86ad52'], light: 'rgba(235,245,170,.38)', vein: 'rgba(40,64,20,.3)' }
    ];
    function spray(ox, oy, tone, variant) {
      const cx = ox + TILE / 2, cy = oy + TILE / 2, local = 7 + variant * 3;
      let s = 1000 + variant * 77;
      const r = () => ((s = (Math.imul(s, 1103515245) + 12345) >>> 0) / 4294967296);
      g.save(); g.beginPath(); g.rect(ox + PAD, oy + PAD, TILE - 2 * PAD, TILE - 2 * PAD); g.clip();
      // Twigs radiate from a point near the bottom of the tile, so the spray reads as hanging foliage.
      const bx = cx + (r() - .5) * 40, by = oy + TILE - PAD - 18;
      for (let t = 0; t < local; t++) {
        const a = -Math.PI / 2 + (r() - .5) * 2.3, len = TILE * (.32 + r() * .3);
        const mx = bx + Math.cos(a) * len * .5 + (r() - .5) * 30, my = by + Math.sin(a) * len * .5;
        const ex = bx + Math.cos(a) * len, ey = by + Math.sin(a) * len;
        g.strokeStyle = '#3e3020'; g.lineWidth = 2.2; g.beginPath(); g.moveTo(bx, by); g.quadraticCurveTo(mx, my, ex, ey); g.stroke();
        const leaves = 9 + Math.floor(r() * 6);
        for (let k = 0; k < leaves; k++) {
          const f = .25 + .75 * (k / leaves), px = bx + (ex - bx) * f + (r() - .5) * 8, py = by + (ey - by) * f + (r() - .5) * 8;
          const side = k % 2 ? 1 : -1, la = a + side * (.55 + r() * .6), L = 30 + r() * 20, W = L * (.36 + r() * .1);
          g.save(); g.translate(px + Math.cos(la) * L * .45, py + Math.sin(la) * L * .45); g.rotate(la);
          g.fillStyle = tone.leaf[Math.floor(r() * tone.leaf.length)];
          g.beginPath(); g.moveTo(-L * .5, 0); g.quadraticCurveTo(-L * .1, -W * .62, L * .5, 0); g.quadraticCurveTo(-L * .1, W * .62, -L * .5, 0); g.fill();
          // The lit half of each leaf, then the midrib.
          g.fillStyle = tone.light; g.beginPath(); g.moveTo(-L * .5, 0); g.quadraticCurveTo(-L * .1, -W * .62, L * .5, 0); g.closePath(); g.fill();
          g.strokeStyle = tone.vein; g.lineWidth = 1; g.beginPath(); g.moveTo(-L * .45, 0); g.lineTo(L * .45, 0); g.stroke();
          g.restore();
        }
        // A terminal leaf at the twig tip.
        g.save(); g.translate(ex, ey); g.rotate(a); g.fillStyle = tone.leaf[1];
        g.beginPath(); g.moveTo(-18, 0); g.quadraticCurveTo(0, -10, 22, 0); g.quadraticCurveTo(0, 10, -18, 0); g.fill(); g.restore();
      }
      g.restore();
    }
    for (let row = 0; row < 3; row++) for (let col = 0; col < 3; col++) spray(col * TILE, row * TILE, tones[row], col);
    const leafMap = window.CHURCH_TEXTURES?.create(T, atlas) || new T.CanvasTexture(atlas);
    leafMap.name = 'Courtyard tree · leaf spray atlas'; leafMap.colorSpace = T.SRGBColorSpace; leafMap.anisotropy = anisotropy;
    const tints = ['#ffffff', '#eef3dc', '#f6f0e2'];
    const leafMaterials = tints.map((color, i) => {
      const m = new T.MeshStandardMaterial({ name: `Courtyard tree · leaves ${i + 1}`, map: leafMap, color, alphaTest: .42, side: T.DoubleSide, roughness: .78, metalness: 0 });
      m.userData.landscape = spec.revision; return m;
    });

    // Bark: vertical fissures, ridges and a few lichen patches; the same picture drives the bump.
    const barkCanvas = document.createElement('canvas'); barkCanvas.width = 256; barkCanvas.height = 512;
    const b = barkCanvas.getContext('2d');
    b.fillStyle = '#5d4c3b'; b.fillRect(0, 0, 256, 512);
    for (let i = 0; i < 140; i++) {
      const x = rand() * 256, y = rand() * 512, h = 40 + rand() * 160, dark = rand() > .45;
      b.strokeStyle = dark ? 'rgba(32,24,17,.55)' : 'rgba(150,132,108,.30)'; b.lineWidth = dark ? 1.5 + rand() * 2.5 : 2 + rand() * 4;
      b.beginPath(); b.moveTo(x, y); b.bezierCurveTo(x + (rand() - .5) * 14, y + h * .33, x + (rand() - .5) * 14, y + h * .66, x + (rand() - .5) * 10, y + h); b.stroke();
    }
    for (let i = 0; i < 26; i++) {
      b.fillStyle = rand() > .5 ? 'rgba(140,150,118,.22)' : 'rgba(176,170,150,.18)';
      b.beginPath(); b.ellipse(rand() * 256, rand() * 512, 6 + rand() * 18, 4 + rand() * 12, rand() * 3, 0, Math.PI * 2); b.fill();
    }
    const barkMap = window.CHURCH_TEXTURES?.create(T, barkCanvas) || new T.CanvasTexture(barkCanvas);
    barkMap.name = 'Courtyard tree · bark'; barkMap.colorSpace = T.SRGBColorSpace; barkMap.wrapS = barkMap.wrapT = T.RepeatWrapping; barkMap.anisotropy = anisotropy;
    const barkBump = new T.CanvasTexture(barkCanvas); barkBump.wrapS = barkBump.wrapT = T.RepeatWrapping;
    const bark = new T.MeshStandardMaterial({ name: 'Courtyard tree · bark', map: barkMap, bumpMap: barkBump, bumpScale: 2.2, color: '#d9d2c8', roughness: .95, metalness: 0 });
    bark.userData.landscape = spec.revision;

    /* ------------------------------------------------------- geometry */
    // A tapered tube through points with a radius at each point (parallel-transport frames),
    // capped at the base; v runs along the length in metres so the bark scale stays constant.
    function tube(out, points, radii, sides) {
      const n = points.length, base = out.p.length / 3, around = Math.max(1, Math.round(Math.PI * 2 * radii[0] / .45));
      let normal = new T.Vector3(), prevT = null, length = 0;
      const tangent = new T.Vector3(), binormal = new T.Vector3(), tmp = new T.Vector3();
      for (let i = 0; i < n; i++) {
        const a = points[Math.max(0, i - 1)], c = points[Math.min(n - 1, i + 1)];
        tangent.subVectors(c, a).normalize();
        if (!prevT) { tmp.set(0, 1, 0); if (Math.abs(tangent.y) > .9) tmp.set(1, 0, 0); normal.crossVectors(tangent, tmp).normalize(); }
        else { const axis = tmp.crossVectors(prevT, tangent); const s = axis.length(); if (s > 1e-6) normal.applyAxisAngle(axis.normalize(), Math.asin(Math.min(1, s))); }
        prevT = tangent.clone();
        binormal.crossVectors(tangent, normal).normalize();
        if (i) length += points[i].distanceTo(points[i - 1]);
        for (let j = 0; j <= sides; j++) {
          const q = j / sides * Math.PI * 2, cx = Math.cos(q), sx = Math.sin(q);
          const nx = normal.x * cx + binormal.x * sx, ny = normal.y * cx + binormal.y * sx, nz = normal.z * cx + binormal.z * sx;
          out.p.push(points[i].x + nx * radii[i], points[i].y + ny * radii[i], points[i].z + nz * radii[i]);
          out.n.push(nx, ny, nz); out.u.push(j / sides * around, length / .9);
        }
      }
      for (let i = 0; i < n - 1; i++) for (let j = 0; j < sides; j++) {
        const a = base + i * (sides + 1) + j, c = a + sides + 1;
        out.i.push(a, c, a + 1, a + 1, c, c + 1);
      }
    }
    function finish(out) {
      const geo = new T.BufferGeometry();
      geo.setAttribute('position', new T.Float32BufferAttribute(out.p, 3));
      geo.setAttribute('normal', new T.Float32BufferAttribute(out.n, 3));
      geo.setAttribute('uv', new T.Float32BufferAttribute(out.u, 2));
      geo.setIndex(out.i); geo.computeBoundingBox(); geo.computeBoundingSphere();
      return geo;
    }
    // A curved limb from start: heading (azimuth a, elevation e), length L, bending up then
    // drooping under its own weight at the tip.
    function limb(start, a, e, L, steps = 6) {
      const pts = [], h = new T.Vector3(Math.cos(a), 0, Math.sin(a));
      for (let k = 0; k <= steps; k++) {
        const t = k / steps, reach = L * Math.cos(e) * t, rise = L * Math.sin(e) * (t - .32 * t * t);
        pts.push(new T.Vector3(start.x + h.x * reach + (rand() - .5) * .05 * k, start.y + rise, start.z + h.z * reach + (rand() - .5) * .05 * k));
      }
      return pts;
    }
    const taper = (n, r0, r1) => Array.from({ length: n }, (_, k) => r0 + (r1 - r0) * Math.pow(k / (n - 1), .8));

    /* ----------------------------------------------------- the trees */
    const groups = landscape.children.filter(o => /^Tree \d+ · (left|right) row$/.test(o.name));
    const trunks = landscape.children.filter(o => o.name === 'Tree trunk');
    let trees = 0, removed = 0, cards = 0;
    const sideUV = (col, row) => [col / 3 * (TILE * 3 / ATLAS), row / 3 * (TILE * 3 / ATLAS), TILE / ATLAS];
    for (const [index, tree] of groups.entries()) {
      // The trunk realism.js planted for this tree: the nearest in plan to its branches or crown.
      const anchor = tree.children.find(o => o.isMesh)?.position;
      const trunk = trunks.reduce((best, o) => !anchor ? best : (!best || Math.hypot(o.position.x - anchor.x, o.position.z - anchor.z) < Math.hypot(best.position.x - anchor.x, best.position.z - anchor.z) ? o : best), null) || trunks[index];
      if (!trunk) continue;
      const X = trunk.position.x, Z = trunk.position.z, G = spec.ground;
      for (const o of tree.children.slice()) if (o.isMesh) { tree.remove(o); removed++; }

      const H = range(spec.height), fork = range(spec.clearTrunk), lean = new T.Vector3((rand() - .5) * .35, 0, (rand() - .5) * .35);
      // Lean slightly away from the church, as trees in an open row reach for the light.
      lean.z += Math.sign(Z) * .12;
      const wood = { p: [], n: [], u: [], i: [] };
      const trunkPts = [], trunkR = [];
      for (const [f, r] of [[-.08, .34], [.06, .29], [.25, .235], [.55, .205], [1.0, .19], [1.6, .175], [fork, .16], [fork + .55, .13]]) {
        const s = Math.min(1, f / (fork + .55));
        trunkPts.push(new T.Vector3(lean.x * s * s + (rand() - .5) * .03, f, lean.z * s * s + (rand() - .5) * .03)); trunkR.push(r);
      }
      tube(wood, trunkPts, trunkR, 14);
      const top = trunkPts[trunkPts.length - 2];
      const clusters = [];
      // A leader continues the trunk into the top of the crown.
      const leader = limb(top, rand() * 6.28, 1.35, (H - fork - 1.2) / .66, 5);
      tube(wood, leader, taper(leader.length, .12, .03), 8);
      clusters.push({ c: leader[leader.length - 1].clone().add(new T.Vector3(0, .1, 0)), r: 1.25 + rand() * .25 });
      const n = Math.round(range(spec.limbs)), turn = rand() * Math.PI * 2;
      for (let k = 0; k < n; k++) {
        // Reach out to about 2 m, so a crown spans about 6.5–7 m and the rows, 6.9 m apart, just touch.
        const a = turn + k * Math.PI * 2 / n + (rand() - .5) * .5, e = .55 + rand() * .45, L = Math.min(1.8 + rand() * .9, 2.0 / Math.cos(e));
        const start = top.clone().add(new T.Vector3(0, (rand() - .3) * .45, 0));
        const main = limb(start, a, e, L);
        tube(wood, main, taper(main.length, .105, .03), 9);
        clusters.push({ c: main[main.length - 1].clone().add(new T.Vector3(0, .25, 0)), r: 1.0 + rand() * .35 });
        for (const f of [.45, .72]) {
          const at = main[Math.round(f * (main.length - 1))], side = rand() > .5 ? 1 : -1;
          const se = .35 + rand() * .55, sub = limb(at, a + side * (.5 + rand() * .5), se, Math.min(.8 + rand() * .6, .95 / Math.cos(se)), 4);
          tube(wood, sub, taper(sub.length, .05, .016), 6);
          clusters.push({ c: sub[sub.length - 1].clone().add(new T.Vector3(0, .2, 0)), r: .8 + rand() * .35 });
        }
      }
      // Keep the crown inside the intended height: lower any cluster that would rise above it.
      for (const cl of clusters) cl.c.y = Math.min(cl.c.y, H - cl.r * .75);
      trunk.geometry.dispose();
      trunk.geometry = finish(wood); trunk.material = bark;
      trunk.position.set(X, G, Z); trunk.rotation.set(0, 0, 0); trunk.scale.set(1, 1, 1);
      trunk.userData = { ...trunk.userData, status: spec.status, revision: spec.revision, species: spec.species };

      // Crown: leaf cards in every cluster, normals out of the crown, tone from depth and height.
      const centre = clusters.reduce((s, cl) => s.add(cl.c), new T.Vector3()).multiplyScalar(1 / clusters.length);
      const lowest = Math.min(...clusters.map(cl => cl.c.y - cl.r * .7));
      const leaf = { p: [], n: [], u: [], i: [] };
      const quad = [[-.5, -.5], [.5, -.5], [.5, .5], [-.5, .5]];
      const axisU = new T.Vector3(), axisV = new T.Vector3(), out = new T.Vector3(), up = new T.Vector3(0, 1, 0);
      for (const cl of clusters) {
        const count = Math.round(range(spec.cardsPerCluster) * (cl.r / 1.1));
        for (let k = 0; k < count; k++) {
          const dir = new T.Vector3(rand() * 2 - 1, (rand() * 2 - 1) * .8, rand() * 2 - 1);
          if (dir.lengthSq() > 1 || dir.lengthSq() < .01) { k--; continue; }
          dir.normalize();
          const depth = .35 + .65 * Math.sqrt(rand()), p = cl.c.clone().addScaledVector(dir, cl.r * depth);
          p.y = Math.max(p.y, lowest);
          // Facing: out of the crown, out of the cluster and a little upward, with some scatter.
          out.subVectors(p, centre).setY((p.y - centre.y) * .6).normalize().multiplyScalar(.9).addScaledVector(dir, .8).addScaledVector(up, .35);
          out.x += (rand() - .5) * .7; out.y += (rand() - .5) * .5; out.z += (rand() - .5) * .7; out.normalize();
          axisU.crossVectors(up, out); if (axisU.lengthSq() < 1e-4) axisU.set(1, 0, 0); axisU.normalize();
          axisV.crossVectors(out, axisU).normalize();
          const spin = rand() * Math.PI * 2, cs = Math.cos(spin), sn = Math.sin(spin), size = range(spec.card);
          const su = axisU.clone().multiplyScalar(cs).addScaledVector(axisV, sn), sv = axisV.clone().multiplyScalar(cs).addScaledVector(axisU, -sn);
          // Light: sunlit high on the outside, shaded deep inside and underneath.
          const height = (p.y - lowest) / Math.max(.5, H - lowest), outward = p.distanceTo(centre) / 3.2;
          const light = .45 * height + .35 * depth + .25 * Math.min(1, outward) + (rand() - .5) * .25 - (dir.y < -.45 ? .25 : 0);
          const row = light < .5 ? 0 : light < .78 ? 1 : 2, col = Math.floor(rand() * 3);
          const [u0, v0, w] = sideUV(col, row), base = leaf.p.length / 3;
          // Smooth crown normals: mostly the direction out of the crown centre.
          const nrm = new T.Vector3().subVectors(p, centre).setY((p.y - centre.y) * 1.3 + .6).normalize().lerp(out, .35).normalize();
          for (const [qx, qy] of quad) {
            leaf.p.push(p.x + (su.x * qx + sv.x * qy) * size, p.y + (su.y * qx + sv.y * qy) * size, p.z + (su.z * qx + sv.z * qy) * size);
            leaf.n.push(nrm.x, nrm.y, nrm.z);
            leaf.u.push(u0 + (qx + .5) * w, 1 - (v0 + (.5 - qy) * w));
          }
          leaf.i.push(base, base + 1, base + 2, base, base + 2, base + 3);
          cards++;
        }
      }
      const crown = new T.Mesh(finish(leaf), leafMaterials[index % leafMaterials.length]);
      crown.position.set(X, G, Z);
      crown.name = 'Tree canopy leaf clusters'; crown.castShadow = true; crown.receiveShadow = true;
      crown.userData = { status: spec.status, revision: spec.revision, species: spec.species, source: 'Existing proposed tree rows; species and planting pending' };
      tree.add(crown);
      trees++;
    }
    landscape.userData.canopies = { revision: spec.revision, trees, removedMeshes: removed, cards };
    window.CHURCH_LANDSCAPE_TREES.stats = { trees, removedMeshes: removed, cards };
  }

  window.CHURCH_LANDSCAPE_TREES = { spec, prepare };
})();
