/* Courtyard tree canopies, design excellence programme (20 November 2026). Metres; X from
 * axis 1, Y up, Z from the centre line. See docs/design-excellence.md, stage 5 preview.
 *
 * Presentation only: CONCEPT / UNSURVEYED LANDSCAPE. The two existing rows of eight trees
 * (realism.js) keep their positions, trunks, branches, beds and edging. Their crowns were
 * thousands of small faceted balls that read as toy trees. Each crown is now a broad,
 * layered canopy of leaf sprays drawn on transparent cards, round a dark inner mass so the
 * crown does not look hollow. Species, size, planting and drainage remain for the site design.
 */
(() => {
  'use strict';
  const spec = {
    revision: '2026-11-20-tree-canopies-1',
    status: 'CONCEPT / UNSURVEYED LANDSCAPE · presentation only',
    crown: { cards: 230, card: [0.85, 1.2], core: 6 }
  };

  function prepare({ THREE: T, building, renderer }) {
    const landscape = building.getObjectByName('Two rows of courtyard trees');
    const K = window.CHURCH_CARVING?.create(T);
    if (!landscape || !K) return;
    const { TR, RX, RY, RZ, SC, place, merge } = K;
    let seed = 20112027;
    const rand = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);

    // A spray of broad leaves on twigs, on a transparent card.
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = 512;
    const g = canvas.getContext('2d');
    g.clearRect(0, 0, 512, 512);
    const greens = ['#2f4a22', '#3b5a28', '#4a6a2f', '#58773a', '#6a8a45', '#7d9a52'];
    for (let twig = 0; twig < 7; twig++) {
      const x0 = 256 + (rand() - .5) * 80, y0 = 256 + (rand() - .5) * 80, a = rand() * Math.PI * 2, len = 140 + rand() * 90;
      g.strokeStyle = '#4a3a26'; g.lineWidth = 3; g.beginPath(); g.moveTo(x0, y0);
      const x1 = x0 + Math.cos(a) * len, y1 = y0 + Math.sin(a) * len; g.lineTo(x1, y1); g.stroke();
      for (let k = 0; k < 16; k++) {
        const t = .2 + .8 * rand(), px = x0 + (x1 - x0) * t, py = y0 + (y1 - y0) * t, side = rand() > .5 ? 1 : -1;
        const la = a + side * (.5 + rand() * .7), L = 26 + rand() * 22, W = L * (.38 + rand() * .12);
        g.save(); g.translate(px + Math.cos(la) * L * .5, py + Math.sin(la) * L * .5); g.rotate(la);
        g.fillStyle = greens[Math.floor(rand() * greens.length)];
        g.beginPath(); g.ellipse(0, 0, L * .55, W * .5, 0, 0, Math.PI * 2); g.fill();
        g.strokeStyle = 'rgba(200,220,150,.35)'; g.lineWidth = 1; g.beginPath(); g.moveTo(-L * .5, 0); g.lineTo(L * .5, 0); g.stroke();
        g.restore();
      }
    }
    const map = window.CHURCH_TEXTURES?.create(T, canvas) || new T.CanvasTexture(canvas);
    map.name = 'Courtyard tree · leaf spray card'; map.colorSpace = T.SRGBColorSpace;
    map.anisotropy = Math.min(8, renderer?.capabilities?.getMaxAnisotropy?.() || 4);
    const card = (name, color) => { const m = new T.MeshStandardMaterial({ name, map, color, alphaTest: .45, side: T.DoubleSide, roughness: .82, metalness: 0 }); m.userData.landscape = spec.revision; return m; };
    const outer = card('Courtyard tree · sunlit leaves', '#ffffff'), inner = card('Courtyard tree · shaded leaves', '#93a084');
    const core = new T.MeshStandardMaterial({ name: 'Courtyard tree · inner canopy shade', color: '#253a1c', roughness: 1 });

    const C = spec.crown, plane = new T.PlaneGeometry(1, 1), blob = new T.IcosahedronGeometry(1, 2);
    let trees = 0, removed = 0;
    for (const tree of landscape.children.filter(o => /^Tree \d+ · (left|right) row$/.test(o.name))) {
      const old = tree.children.filter(o => o.isMesh && /^(Foliage cluster|Individual foliage leaf)$/.test(o.name));
      if (!old.length) continue;
      const box = new T.Box3(); for (const o of old) box.expandByObject(o);
      const c = box.getCenter(new T.Vector3()), top = box.max.y;
      for (const o of old) tree.remove(o); removed += old.length;
      // Crown: an ellipsoid filling the old cluster cloud, slightly fuller, so it hides the branch ends.
      const R = Math.max(box.max.x - box.min.x, box.max.z - box.min.z) / 2 * (1.0 + rand() * .1), H = (box.max.y - box.min.y) / 2 * 1.08, cy = (box.min.y + box.max.y) / 2 + .05;
      const parts = { sun: [], shade: [], core: [] };
      for (let k = 0; k < C.core; k++) {
        const a = rand() * Math.PI * 2, r = rand() * R * .35;
        parts.core.push([blob, place(SC(R * (.4 + rand() * .1), H * (.45 + rand() * .1), R * (.4 + rand() * .1)), TR(c.x + Math.cos(a) * r, cy + (rand() - .4) * H * .4, c.z + Math.sin(a) * r))]);
      }
      for (let k = 0; k < C.cards; k++) {
        // Points over the ellipsoid shell, flatter underneath; each card faces roughly outward.
        const a = rand() * Math.PI * 2, ny = Math.max(-.75, 1 - 2 * rand()), up = Math.acos(ny), shell = .78 + rand() * .3;
        const nx = Math.sin(up) * Math.cos(a), nz = Math.sin(up) * Math.sin(a);
        const x = c.x + nx * R * shell, y = cy + ny * H * shell, z = c.z + nz * R * shell;
        const s = C.card[0] + rand() * (C.card[1] - C.card[0]);
        const m = place(SC(s, s, 1), RZ(rand() * Math.PI * 2), RX(-Math.PI / 2 + up + (rand() - .5) * .7), RY(-a + Math.PI / 2 + (rand() - .5) * .8), TR(x, y, z));
        (shell > .9 && ny > -.25 ? parts.sun : parts.shade).push([plane, m]);
      }
      for (const [key, material, name] of [['core', core, 'Tree canopy inner shade'], ['shade', inner, 'Tree canopy shaded leaf sprays'], ['sun', outer, 'Tree canopy sunlit leaf sprays']]) {
        if (!parts[key].length) continue;
        const mesh = new T.Mesh(weld(merge(parts[key])), material);
        mesh.name = name; mesh.castShadow = true; mesh.receiveShadow = key !== 'sun';
        mesh.userData = { status: spec.status, revision: spec.revision, source: 'Existing proposed tree rows; species and planting pending' };
        tree.add(mesh);
      }
      trees++;
    }
    // Weld identical corners so the display batches keep their memory saving.
    function weld(geo) {
      const pos = geo.attributes.position, nor = geo.attributes.normal, uv = geo.attributes.uv, seen = new Map(), P = [], N = [], U = [], index = [];
      for (let i = 0; i < pos.count; i++) {
        const key = [pos.getX(i), pos.getY(i), pos.getZ(i), nor.getX(i), nor.getY(i), nor.getZ(i), uv.getX(i), uv.getY(i)].map(v => Math.round(v * 1e5)).join();
        let k = seen.get(key);
        if (k === undefined) { k = P.length / 3; seen.set(key, k); P.push(pos.getX(i), pos.getY(i), pos.getZ(i)); N.push(nor.getX(i), nor.getY(i), nor.getZ(i)); U.push(uv.getX(i), uv.getY(i)); }
        index.push(k);
      }
      const out = new T.BufferGeometry();
      out.setAttribute('position', new T.Float32BufferAttribute(P, 3)); out.setAttribute('normal', new T.Float32BufferAttribute(N, 3)); out.setAttribute('uv', new T.Float32BufferAttribute(U, 2));
      out.setIndex(index); geo.dispose(); return out;
    }
    landscape.userData.canopies = { revision: spec.revision, trees, removedMeshes: removed };
    window.CHURCH_LANDSCAPE_TREES.stats = { trees, removedMeshes: removed };
  }

  window.CHURCH_LANDSCAPE_TREES = { spec, prepare };
})();
