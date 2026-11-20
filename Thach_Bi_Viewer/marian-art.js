/* Marian art on the doors and windows (owner, 8 November 2026).
   The church sent three concept pictures: nine relief lunettes telling the life of Our Lady
   (“Đường hành hương Đức Mẹ”) for the nine outside doors, a silver Ave Maria monogram for the
   heads of the inner C/G windows, and a 60 cm stained-glass M rose for the outer porch wall.
   The textures are pixel crops of those pictures (references/11-marian-art, packaged by
   scripts/build_marian_art_textures.py). Status: CONCEPT, PUBLICATION HOLD H8 — the author and
   licence of the pictures are not recorded. Not for construction / Không dùng để thi công.

   Door → scene (owner, 8 Nov 2026): a pilgrimage round the church, starting at the front side door
   on the H side (the left on site; the viewer is mirrored, ENG-027), down the H (G wall) side,
   across the service room, back up the B (C wall) side, ending with the Assumption over the main door. */
(() => {
  const PREFIX = 'references/11-marian-art/';
  const STATUS = 'CHURCH CONCEPT PICTURE · CONCEPT · PUBLICATION HOLD H8';
  const SOURCE = 'Church pictures received 8 Nov 2026 (owner); references/11-marian-art/provenance.json';
  const SCENES = [
    { n: 1, file: 'relief-1-annunciation.jpg', vi: 'Truyền Tin', en: 'The Annunciation', ref: 'Lc 1,26-38' },
    { n: 2, file: 'relief-2-visitation.jpg', vi: 'Mẹ Thăm Viếng', en: 'The Visitation', ref: 'Lc 1,39-56' },
    { n: 3, file: 'relief-3-nativity.jpg', vi: 'Giáng Sinh', en: 'The Nativity', ref: 'Lc 2,1-20' },
    { n: 4, file: 'relief-4-presentation.jpg', vi: 'Dâng Chúa trong Đền Thờ', en: 'The Presentation in the Temple', ref: 'Lc 2,22-35' },
    { n: 5, file: 'relief-5-cana.jpg', vi: 'Tiệc Cưới Cana', en: 'The Wedding at Cana', ref: 'Ga 2,1-11' },
    { n: 6, file: 'relief-6-cross.jpg', vi: 'Mẹ dưới chân Thập Giá', en: 'Mary at the foot of the Cross', ref: 'Ga 19,25-27' },
    { n: 7, file: 'relief-7-pentecost.jpg', vi: 'Mẹ giữa Hội Thánh sơ khai', en: 'Mary with the early Church', ref: 'Cv 1,12-14' },
    { n: 8, file: 'relief-8-woman-clothed-with-the-sun.jpg', vi: 'Mẹ được rước về trời', en: 'The woman clothed with the sun', ref: 'Kh 12,1' },
    { n: 9, file: 'relief-9-assumption.jpg', vi: 'Đức Mẹ Hồn Xác Lên Trời', en: 'The Assumption', ref: 'Kh 12,1-2' },
  ];
  // Keys: 'front H' / 'front B' / 'front main' for the three doors on the axis-2′ wall (facade.js),
  // 'G 4–5' … for the side doorways in the inner walls (bundle group names 'Inner wall G 4–5').
  const DOORS = { 'front H': 1, 'G 4–5': 2, 'G 8–9': 3, 'G 11–12': 4, 'C 11–12': 5, 'C 8–9': 6, 'C 4–5': 7, 'front B': 8, 'front main': 9 };
  const MONOGRAM = 'inner-window-m-lunette.jpg', ROSE = 'rose-window-m.jpg';

  // A canvas texture straight away, filled when the embedded picture has decoded, so materials
  // keep one texture object (render batches and the glass modes hold references to it).
  // Headless checks have no canvas or Image: they get no map and claim no texture check.
  function picture(T, file) {
    const entry = window.CHURCH_MARIAN_ART_TEXTURES?.[PREFIX + file];
    if (typeof document === 'undefined' || typeof window.Image !== 'function' || !document.createElement) return null;
    const canvas = document.createElement('canvas');
    if (!canvas?.getContext) return null;
    canvas.width = entry?.width || 256; canvas.height = entry?.height || 128;
    const texture = new T.CanvasTexture(canvas);
    texture.colorSpace = T.SRGBColorSpace; texture.anisotropy = 8; texture.name = file;
    const image = new window.Image();
    image.onload = () => {
      canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
      texture.needsUpdate = true;
      window.CHURCH_PERFORMANCE?.invalidate();
    };
    image.onerror = () => console.error('Marian art texture could not load: ' + file);
    image.src = entry?.imageUrl || PREFIX + file;
    return texture;
  }

  let cache = null;
  function create(T) {
    if (cache?.T === T) return cache;
    const textures = new Map(), tex = file => { if (!textures.has(file)) textures.set(file, picture(T, file)); return textures.get(file); };
    const reliefs = new Map();
    // Carved timber relief: the picture is already shaded, the bump map adds raking-light texture.
    const relief = n => {
      if (!reliefs.has(n)) {
        const s = SCENES[n - 1], map = tex(s.file);
        const m = new T.MeshStandardMaterial({ name: `Door relief ${n} · ${s.en} · concept`, color: '#ffffff', roughness: .62, metalness: 0, map, bumpMap: map, bumpScale: .9 });
        m.userData = { status: STATUS, source: SOURCE, scene: s };
        reliefs.set(n, m);
      }
      return reliefs.get(n);
    };
    const monoMap = tex(MONOGRAM);
    const monogram = new T.MeshStandardMaterial({ name: 'Inner window lunette · silver M monogram · concept', color: '#ffffff', roughness: .38, metalness: .08, map: monoMap, bumpMap: monoMap, bumpScale: .6 });
    monogram.userData = { status: STATUS, source: SOURCE };
    cache = { T, relief, monogram, roseMap: tex(ROSE) };
    return cache;
  }

  // Semicircular (half-elliptic) lunette, UVs 0–1 over its bounding box so the cropped picture fits:
  // centre cx, springing y0, half width a, rise b. Mirror flips u for the face seen from behind.
  function lunette(T, cx, y0, a, b, mirror = false, segments = 48) {
    const shape = new T.Shape();
    shape.moveTo(cx - a, y0); shape.lineTo(cx + a, y0); shape.absellipse(cx, y0, a, b, 0, Math.PI, false);
    const g = new T.ShapeGeometry(shape, segments), p = g.attributes.position, uv = g.attributes.uv;
    for (let i = 0; i < p.count; i++) { const u = (p.getX(i) - (cx - a)) / (2 * a); uv.setXY(i, mirror ? 1 - u : u, (p.getY(i) - y0) / b); }
    uv.needsUpdate = true;
    return g;
  }

  window.CHURCH_MARIAN_ART = { STATUS, SOURCE, SCENES, DOORS, create, lunette };
})();
