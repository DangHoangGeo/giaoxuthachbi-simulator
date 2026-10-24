/* Appearance refinement only. Local, deterministic surface studies for the
 * approved ivory / terracotta / son son thep vang palette. No measured product
 * reflectance, structural section, equipment or analytical input is implied.
 * See docs/decoration-finishes.md for provenance and remaining artwork holds. */
(() => {
  'use strict';
  const revision = '2026-10-25-decoration-1';
  window.CHURCH_DECORATION = { revision, prepare };

  function prepare({ THREE: T, building, mat, interior, renderer, palettes, data }) {
    const size = 256, anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    // Separate seed: decoration must not change any layout or another generator.
    let seed = 25102026;
    const rand = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
    function map(name, draw, colour = false) {
      const canvas = document.createElement('canvas'); canvas.width = canvas.height = size;
      draw(canvas.getContext('2d'));
      const texture = window.CHURCH_TEXTURES?.create(T, canvas) || new T.CanvasTexture(canvas);
      texture.name = `Decoration study · ${name}`;
      texture.wrapS = texture.wrapT = T.RepeatWrapping;
      texture.colorSpace = colour ? T.SRGBColorSpace : T.NoColorSpace;
      texture.anisotropy = anisotropy;
      return texture;
    }
    function noise(g, base, amplitude) {
      const pixels = g.getImageData(0, 0, size, size);
      for (let i = 0; i < pixels.data.length; i += 4) {
        const value = base + (rand() - .5) * amplitude;
        pixels.data[i] = pixels.data[i + 1] = pixels.data[i + 2] = value;
        pixels.data[i + 3] = 255;
      }
      g.putImageData(pixels, 0, 0);
    }
    // Seamless trowel clouds and fine aggregate, without fake cracks or dirt.
    const mineral = map('mineral plaster microtexture', g => {
      noise(g, 180, 12);
      for (let i = 0; i < 65; i++) {
        const x = rand() * size, y = rand() * size, r = 12 + rand() * 28;
        for (const dx of [-size, 0, size]) for (const dy of [-size, 0, size]) {
          const fade = g.createRadialGradient(x + dx, y + dy, 0, x + dx, y + dy, r);
          fade.addColorStop(0, 'rgba(100,100,100,.045)'); fade.addColorStop(1, 'rgba(100,100,100,0)');
          g.fillStyle = fade; g.fillRect(x + dx - r, y + dy - r, r * 2, r * 2);
        }
      }
    });
    const stoneRoughness = map('honed stone roughness', g => noise(g, 218, 14));
    const foil = map('gold leaf surface', g => {
      noise(g, 218, 22);
      // Faint leaf overlaps: roughness only, never black painted grid lines.
      g.fillStyle = 'rgb(236,236,236)';
      for (let y = 0; y < size; y += 64) {
        g.fillRect(0, y, size, 1);
        for (let x = (y / 64 % 2) * 32; x < size; x += 64) g.fillRect(x, y, 1, 64);
      }
    });
    const lacquer = map('satin lacquer roughness', g => noise(g, 235, 12));
    const changed = new Set();
    function surface(material, values) {
      if (!material) return;
      Object.assign(material, values);
      material.userData.decoration = { revision, status: 'CONCEPT · display finish, not measured reflectance' };
      material.needsUpdate = true; changed.add(material);
      // Keep reference / neutral display switching coherent with the new maps.
      const palette = palettes.get(material);
      if (palette) { palette.map = material.map; palette.bump = material.bumpMap; }
    }
    for (const m of [mat.wall, mat.trim, mat.darkTrim, mat.cap, interior.materials.lining]) {
      surface(m, { bumpMap: mineral, bumpScale: .0012, roughness: .98, roughnessMap: stoneRoughness, envMapIntensity: .3 });
    }
    for (const m of [mat.floor, interior.materials.whiteStone, interior.materials.stone]) {
      // The tile/vein colour remains; the old 7–10 mm bump exaggerated polished stone.
      surface(m, { roughness: .52, roughnessMap: stoneRoughness, bumpScale: .0008, envMapIntensity: .38 });
    }
    surface(mat.roof, { roughness: .9, envMapIntensity: .22 });
    const materials = new Set();
    building.traverse(o => { if (o.isMesh) for (const m of Array.isArray(o.material) ? o.material : [o.material]) materials.add(m); });
    for (const m of materials) {
      if (/^(Sanctuary · (carved gilding|gilded vault boarding)|Stations · gilded frame)$/.test(m.name)) {
        surface(m, { roughnessMap: foil, roughness: .48, envMapIntensity: .48 });
      } else if (/^Sanctuary · gilded (scrollwork on lacquer|relief)$/.test(m.name)) {
        // Retain the separate lacquer/metal channel masks and the drawn motif.
        // Bump affects shading only; carved geometry continues to carry relief.
        surface(m, { bumpScale: .003, envMapIntensity: .48 });
      } else if (m.name === 'Sanctuary · oxblood lacquer') {
        surface(m, { roughness: .36, roughnessMap: lacquer, clearcoat: .42, clearcoatRoughness: .28, envMapIntensity: .42 });
      } else if (m.name === 'Sanctuary · carved lacquered timber' || m.name === 'Stations · red lacquer ground') {
        surface(m, { roughnessMap: lacquer, roughness: .5, envMapIntensity: .35 });
      }
    }
    // The drawn roof timbers share the column lacquer; preserve that coordinated
    // finish while leaving the simulator's saved natural timber palette intact.
    surface(interior.materials.timber, { roughness: .36, envMapIntensity: .42 });
    const record = { revision, status: 'CONCEPT', materials: changed.size, newEquipment: 0, newRoutes: 0,
      source: 'Approved project concepts; docs/decoration-finishes.md', textureSize: size };
    building.userData.decoration = record;
    data.decoration = record;
    data.assumptions.push('Decoration surface study: mineral plaster, honed stone, satin red lacquer and gold-leaf roughness. Display-only maps, not measured optical/acoustic materials or selected construction products; geometry, equipment, routes and engineering holds unchanged.');
    window.CHURCH_DECORATION.stats = record;
  }
})();
