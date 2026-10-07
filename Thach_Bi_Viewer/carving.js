/* Carved ornament for the timber frame and the sanctuary, metres.
   Leaves, scrolls, blooms, turned mouldings and parcel-gilt relief are generated shapes that
   follow the approved concept art. They are an appearance study only: no joinery, section,
   fixing or load path is implied by any of them. */
(() => {
  window.CHURCH_CARVING = { create };
  function create(T) {
    const V = (x, y, z) => new T.Vector3(x, y, z), M = () => new T.Matrix4();
    const TR = (x, y, z) => M().makeTranslation(x, y, z), SC = (x, y = x, z = x) => M().makeScale(x, y, z);
    const RX = a => M().makeRotationX(a), RY = a => M().makeRotationY(a), RZ = a => M().makeRotationZ(a);
    // Transforms in the order they act on the part.
    const place = (...steps) => steps.reduce((m, s) => m.premultiply(s), M());
    let seed = 20261007;
    const rand = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };

    // One geometry from many placed parts [geometry, matrix]; mirrored parts keep their outward faces.
    function merge(parts) {
      const list = [];
      let count = 0;
      for (const [source, matrix] of parts) {
        const g = source.index ? source.toNonIndexed() : source.clone();
        if (!g.attributes.normal) g.computeVertexNormals();
        if (matrix) {
          g.applyMatrix4(matrix);
          if (matrix.determinant() < 0) for (const a of [g.attributes.position, g.attributes.normal, g.attributes.uv]) {
            if (!a) continue;
            const n = a.itemSize, v = a.array;
            for (let k = 0; k < v.length; k += n * 3) for (let c = 0; c < n; c++) { const s = v[k + n + c]; v[k + n + c] = v[k + 2 * n + c]; v[k + 2 * n + c] = s; }
          }
        }
        list.push(g); count += g.attributes.position.count;
      }
      const position = new Float32Array(count * 3), normal = new Float32Array(count * 3), uv = new Float32Array(count * 2);
      let o = 0;
      for (const g of list) {
        position.set(g.attributes.position.array, o * 3); normal.set(g.attributes.normal.array, o * 3);
        if (g.attributes.uv) uv.set(g.attributes.uv.array, o * 2);
        o += g.attributes.position.count; g.dispose();
      }
      const out = new T.BufferGeometry();
      out.setAttribute('position', new T.BufferAttribute(position, 3));
      out.setAttribute('normal', new T.BufferAttribute(normal, 3));
      out.setAttribute('uv', new T.BufferAttribute(uv, 2));
      return out;
    }
    // Closed skin over rows of `ring` points, capped at both ends and facing outwards.
    function shell(pos, ring, uv) {
      const rows = pos.length / 3 / ring, idx = [];
      for (let i = 0; i < rows - 1; i++) for (let j = 0; j < ring; j++) {
        const a = i * ring + j, b = i * ring + (j + 1) % ring, c = a + ring, d = b + ring;
        idx.push(a, d, b, a, c, d);
      }
      for (const row of [0, rows - 1]) {
        const base = row * ring, centre = pos.length / 3;
        let x = 0, y = 0, z = 0;
        for (let j = 0; j < ring; j++) { x += pos[(base + j) * 3]; y += pos[(base + j) * 3 + 1]; z += pos[(base + j) * 3 + 2]; }
        pos.push(x / ring, y / ring, z / ring); uv.push(.5, row ? 1 : 0);
        for (let j = 0; j < ring; j++) { const a = base + j, b = base + (j + 1) % ring; if (row) idx.push(centre, b, a); else idx.push(centre, a, b); }
      }
      let volume = 0;
      for (let k = 0; k < idx.length; k += 3) {
        const a = idx[k] * 3, b = idx[k + 1] * 3, c = idx[k + 2] * 3;
        volume += pos[a] * (pos[b + 1] * pos[c + 2] - pos[b + 2] * pos[c + 1]) + pos[a + 1] * (pos[b + 2] * pos[c] - pos[b] * pos[c + 2]) + pos[a + 2] * (pos[b] * pos[c + 1] - pos[b + 1] * pos[c]);
      }
      if (volume < 0) for (let k = 0; k < idx.length; k += 3) { const s = idx[k + 1]; idx[k + 1] = idx[k + 2]; idx[k + 2] = s; }
      const g = new T.BufferGeometry();
      g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new T.Float32BufferAttribute(uv, 2));
      g.setIndex(idx); g.computeVertexNormals();
      return g;
    }
    // Acanthus-like leaf: grows along +Y from the origin, faces +Z, and its tip curls forward.
    function leaf({ len = 1, wid = .5, thick = .07, curl = 1, lobes = 3, cup = .3, seg = 8, fine = true } = {}) {
      const pos = [], uv = [], ring = fine ? 6 : 4;
      let cy = 0, cz = 0;
      for (let i = 0; i <= seg; i++) {
        // The blade stays nearly straight and turns over towards the tip.
        const t = i / seg, a = curl * Math.pow(t, 2.5), ny = -Math.sin(a), nz = Math.cos(a);
        if (i) { const m = curl * Math.pow((i - .5) / seg, 2.5); cy += len / seg * Math.cos(m); cz += len / seg * Math.sin(m); }
        const w = wid / 2 * Math.pow(Math.sin(Math.PI * (.1 + .9 * t)), .7) * (lobes ? .66 + .34 * Math.abs(Math.cos(lobes * Math.PI * t)) : 1), h = thick * (1 - .55 * t);
        const section = fine ? [[-w, cup * w], [-w * .5, cup * w * .25 + h * .55], [0, h], [w * .5, cup * w * .25 + h * .55], [w, cup * w], [0, -h * .4]] : [[-w, cup * w], [0, h], [w, cup * w], [0, -h * .4]];
        section.forEach(([x, d], j) => { pos.push(x, cy + ny * d, cz + nz * d); uv.push(j / ring, t); });
      }
      return shell(pos, ring, uv);
    }
    // Tapered round stem along a curve: tendrils, scrolls and volutes.
    function stem(points, r0, r1 = r0 * .3, seg = 14, radial = 6) {
      const curve = new T.CatmullRomCurve3(points.map(p => V(...p))), frames = curve.computeFrenetFrames(seg, false), pos = [], uv = [];
      for (let i = 0; i <= seg; i++) {
        const c = curve.getPointAt(i / seg), r = r0 + (r1 - r0) * i / seg, n = frames.normals[i], b = frames.binormals[i];
        for (let j = 0; j < radial; j++) {
          const a = j / radial * Math.PI * 2, p = Math.cos(a) * r, q = Math.sin(a) * r;
          pos.push(c.x + p * n.x + q * b.x, c.y + p * n.y + q * b.y, c.z + p * n.z + q * b.z); uv.push(j / radial, i / seg);
        }
      }
      return shell(pos, radial, uv);
    }
    // Points of a scroll in the XY plane, winding inwards from (cx + r·cos a0, cy + r·sin a0).
    const scroll = (cx, cy, r, turns = 1.25, a0 = 0, dir = 1, n = 12) => Array.from({ length: n + 1 }, (_, i) => {
      const t = i / n, a = a0 + dir * turns * 2 * Math.PI * t, q = r * (1 - .82 * t);
      return [cx + Math.cos(a) * q, cy + Math.sin(a) * q, 0];
    });
    // Lotus or peony facing +Z: rings of petals round a boss.
    function bloom({ r = .15, petals = 8, rings = 2, seg = 4 } = {}) {
      const parts = [];
      for (let k = 0; k < rings; k++) {
        const n = Math.max(5, petals - k * 2), size = r * (1 - k * .34), petal = leaf({ len: size, wid: size * .82, thick: size * .13, curl: .9, lobes: 0, cup: .4, seg, fine: false });
        for (let j = 0; j < n; j++) parts.push([petal, place(TR(0, r * .05, 0), RX(.22 + k * .55), RZ((j + k * .5) / n * 2 * Math.PI))]);
      }
      parts.push([new T.SphereGeometry(r * .2, 7, 5), place(SC(1, 1, .8), TR(0, 0, r * .16))]);
      return merge(parts);
    }
    // Turned moulding from a profile of [radius, height]; the surface faces away from the axis.
    function turned(profile, seg = 28) {
      const g = new T.LatheGeometry(profile.map(([r, y]) => new T.Vector2(r, y)), seg), p = g.attributes.position.array, i = g.index.array;
      let facing = 0;
      for (let k = 0; k < i.length; k += 3) {
        const a = i[k] * 3, b = i[k + 1] * 3, c = i[k + 2] * 3;
        const ux = p[b] - p[a], uy = p[b + 1] - p[a + 1], uz = p[b + 2] - p[a + 2], vx = p[c] - p[a], vy = p[c + 1] - p[a + 1], vz = p[c + 2] - p[a + 2];
        facing += (uy * vz - uz * vy) * (p[a] + p[b] + p[c]) + (ux * vy - uy * vx) * (p[a + 2] + p[b + 2] + p[c + 2]);
      }
      if (facing < 0) for (let k = 0; k < i.length; k += 3) { const s = i[k + 1]; i[k + 1] = i[k + 2]; i[k + 2] = s; }
      g.computeVertexNormals();
      return g;
    }

    /* ------------------------------------------------------------ column ornament */
    // Base mouldings of a round shaft of radius r: two tori and a scotia, 0.64 m high from y 0.
    const base = r => turned([[r + .085, 0], [r + .085, .05], [r + .1, .09], [r + .1, .14], [r + .08, .19], [r + .045, .22], [r + .04, .27], [r + .07, .3], [r + .075, .34], [r + .06, .38], [r + .03, .41], [r + .025, .47], [r + .04, .5], [r + .045, .53], [r + .03, .56], [r + .008, .6], [r + .004, .64]]);
    // Foliate capital on a shaft of radius r, from y 0 (neck) to y h (top of the abacus): three
    // tiers of leaves round a flaring bell. Returns the bell and abacus, the leaves, and the
    // gilded neck ring, volutes and fleurons apart, so that each can take its own finish.
    function capital({ r = .3, h = .8, flare = .2, leaves = 8 } = {}) {
      const core = [[turned([[r + .006, 0], [r + .034, .014], [r + .042, .034], [r + .03, .056], [r + .004, .07], [r + .004, h * .42], [r + flare * .3, h * .68], [r + flare * .85, h * .88], [r + flare, h * .92]]), null]];
      const side = 2 * (r + flare) + .08;
      core.push([new T.BoxGeometry(side, h * .06, side), TR(0, h * .97, 0)], [new T.BoxGeometry(side - .08, h * .03, side - .08), TR(0, h * .925, 0)]);
      const girth = 2 * Math.PI * r / leaves, foliage = [], gilt = [[new T.TorusGeometry(r + .036, .016, 5, 22), place(RX(Math.PI / 2), TR(0, .034, 0))]];
      const tiers = [[.3, 1.15, 1.9, .14, 0, 3], [.56, 1.2, 1.8, .12, .5, 4], [.84, 1.3, 1.7, .2, 0, 5]];
      for (const [length, width, curl, lean, turn, lobes] of tiers) {
        const blade = leaf({ len: h * length, wid: girth * width, thick: .03, curl, lobes, cup: .24, seg: 8 });
        for (let j = 0; j < leaves; j++) foliage.push([blade, place(RX(lean), TR(0, .075, r - .006 - turn * .012), RY((j + turn) / leaves * 2 * Math.PI))]);
      }
      const volute = stem(scroll(0, 0, h * .1, 1.3, -Math.PI / 2, 1), .026, .009, 10, 5), flower = bloom({ r: h * .085, petals: 6, rings: 1, seg: 3 });
      for (let j = 0; j < 4; j++) {
        const a = j * Math.PI / 2;
        for (const s of [-1, 1]) gilt.push([volute, place(SC(s, 1, 1), RY(-s * .5), TR(0, h * .82, r + flare + .02), RY(a + Math.PI / 4))]);
        gilt.push([flower, place(TR(0, h * .86, r + flare * .96), RY(a))]);
      }
      return { core: merge(core), foliage: merge(foliage), gilt: merge(gilt) };
    }
    // Deep foliage on a rounded core of half-sizes (a, b, c), seen from +Z: curled leaves fan out
    // from the middle, with blooms among them. Returns the core with two leaves in three, and
    // the blooms with the remaining leaves, for a parcel-gilt finish.
    function cluster({ a = .2, b = .3, c = .1, leaves = 14, blooms = 3, size = .18 } = {}) {
      const body = [[new T.SphereGeometry(1, 10, 6), SC(a * .78, b * .78, c * .7)]], accent = [], n = leaves + blooms;
      const blades = [leaf({ len: size, wid: size * .72, thick: size * .13, curl: 1.9, lobes: 3, seg: 6 }), leaf({ len: size * .72, wid: size * .6, thick: size * .12, curl: 2.3, lobes: 2, seg: 5, fine: false })];
      const flower = bloom({ r: size * .5, petals: 7, rings: 2, seg: 3 });
      for (let k = 0; k < n; k++) {
        // Evenly strewn over the front of the core, each part facing outwards.
        const rise = Math.asin(1 - (k + .5) / n * .92), turn = k * 2.39996 + .4;
        const p = V(a * Math.cos(turn) * Math.cos(rise), b * Math.sin(turn) * Math.cos(rise), c * Math.sin(rise));
        const normal = V(p.x / (a * a), p.y / (b * b), p.z / (c * c)).normalize(), out = V(p.x, p.y, 0);
        if (out.lengthSq() < 1e-6) out.set(0, 1, 0);
        const grow = out.addScaledVector(normal, -out.dot(normal)).normalize().applyAxisAngle(normal, (k % 2 ? .55 : -.55)), across = V().crossVectors(grow, normal);
        const m = M().makeBasis(across, grow, normal).setPosition(p);
        if (k % Math.max(2, Math.round(n / Math.max(1, blooms))) === 1 && accent.filter(x => x[0] === flower).length < blooms) accent.push([flower, m]);
        else (k % 3 === 2 ? accent : body).push([blades[k % 2], m]);
      }
      return { body: merge(body), accent: merge(accent) };
    }
    // Gilded lotus panel for one face of a die, w × h, facing +Z.
    function panel({ w = .4, h = .2 } = {}) {
      const parts = [[bloom({ r: Math.min(w, h) * .4, petals: 8, rings: 1, seg: 3 }), SC(1, 1, .5)]];
      for (const e of [-1, 1]) {
        parts.push([new T.BoxGeometry(w, .012, .012), TR(0, e * h / 2, 0)], [new T.BoxGeometry(.012, h, .012), TR(e * w / 2, 0, 0)]);
        parts.push([leaf({ len: w * .3, wid: h * .32, thick: .012, curl: .5, lobes: 2, seg: 5, fine: false }), place(RZ(-e * Math.PI / 2), TR(e * Math.min(w, h) * .3, 0, 0))]);
      }
      return merge(parts);
    }

    /* ----------------------------------------------------------------- finishes */
    function canvas(size) { const c = document.createElement('canvas'); c.width = c.height = size; return [c, c.getContext('2d')]; }
    function texture(c, colour) {
      const t = new T.CanvasTexture(c);
      t.wrapS = t.wrapT = T.RepeatWrapping; t.anisotropy = 8;
      if (colour) t.colorSpace = T.SRGBColorSpace;
      return t;
    }
    // Long grain of polished lacquer. The map stays near white, so the material colour still
    // sets the finish and the timber-tone setting keeps working.
    function grain(size = 512) {
      const [c, g] = canvas(size);
      g.fillStyle = '#f1e9e3'; g.fillRect(0, 0, size, size);
      for (let k = 0; k < 70; k++) {
        const x = rand() * size, sway = 4 + rand() * 22, phase = rand() * 6.3, dark = rand() < .6;
        g.strokeStyle = dark ? `rgba(40,8,2,${.03 + rand() * .07})` : `rgba(255,232,206,${.03 + rand() * .06})`; g.lineWidth = 3 + rand() * 30;
        for (const o of [-size, 0, size]) {
          g.beginPath();
          for (let y = -8; y <= size + 8; y += 16) { const px = x + o + Math.sin(y / size * 2 * Math.PI + phase) * sway; if (y < 0) g.moveTo(px, y); else g.lineTo(px, y); }
          g.stroke();
        }
      }
      return texture(c, true);
    }

    return { place, TR, SC, RX, RY, RZ, merge, leaf, stem, scroll, bloom, turned, base, capital, cluster, panel, grain, canvas, texture, rand };
  }
})();
