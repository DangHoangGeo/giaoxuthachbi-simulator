/* Check generated texture residency and unchanged material settings in Chrome.
 * No measured-VRAM claim: RGBA8+mips is an image-dimension estimate. */
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(__dirname, '..'), out = process.argv[2] || '/tmp/thachbi-textures';
(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--allow-file-access-from-files'] });
  const results = [], errors = [];
  try {
    for (const light of [false, true]) {
      const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
      page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
      await page.goto('file://' + path.join(root, 'Thach_Bi_Viewer/OPEN_CHURCH.html') + (light ? '?graphics=light' : ''));
      await page.waitForFunction(() => window.church?.ready, null, { timeout: 120000 });
      await page.evaluate(() => church.goTo('sanctuary', { instant: true })); await page.waitForTimeout(1200);
      const inventory = await page.evaluate(() => {
        const materials = new Set(), textures = new Set(), images = new Set();
        church.scene.traverse(o => { for (const m of Array.isArray(o.material) ? o.material : [o.material]) if (m) materials.add(m); });
        for (const m of materials) for (const value of Object.values(m)) if (value?.isTexture && !value.isDataTexture) textures.add(value);
        if (church.scene.environment?.isTexture) textures.add(church.scene.environment);
        let rawCanvasBytes = 0, estimatedRGBA8MipBytes = 0;
        const entries = [];
        for (const texture of textures) {
          const image = texture.image; if (!image?.width || !image?.height) continue;
          if (!images.has(image)) { images.add(image); rawCanvasBytes += image.width * image.height * 4; }
          let w = image.width, h = image.height, bytes = w * h * 4;
          if (texture.generateMipmaps) while (w > 1 || h > 1) { w = Math.max(1, w >> 1); h = Math.max(1, h >> 1); bytes += w * h * 4; }
          estimatedRGBA8MipBytes += bytes;
          entries.push({ name: texture.name, width: image.width, height: image.height, bytes, resample: texture.userData.displayResample || null, colorSpace: texture.colorSpace, wrap: [texture.wrapS, texture.wrapT], repeat: texture.repeat.toArray() });
        }
        const properties = [...materials].map(m => ({ name: m.name, type: m.type, color: m.color?.getHex(), emissive: m.emissive?.getHex(), emissiveIntensity: m.emissiveIntensity, roughness: m.roughness, metalness: m.metalness, bumpScale: m.bumpScale, transmission: m.transmission, ior: m.ior, opacity: m.opacity, transparent: m.transparent, side: m.side, maps: Object.keys(m).filter(k => m[k]?.isTexture).sort() }));
        return { policy: CHURCH_TEXTURES.stats(), materialCount: materials.size, textureCount: textures.size, canvasCount: images.size, rawCanvasBytes, estimatedRGBA8MipBytes, entries, properties, lightGrid: CHURCH_SIMULATOR.persistentLighting.stats() };
      });
      results.push(inventory);
      const prefix = light ? 'light' : 'standard';
      for (const lighting of ['day', 'evening']) {
        await page.evaluate(mode => church.setLighting(mode), lighting); await page.waitForTimeout(700);
        await page.screenshot({ path: path.join(out, prefix + '-' + lighting + '.jpg'), type: 'jpeg', quality: 88 });
      }
      // Material toggles keep their tier and restore the exact texture objects.
      assert(await page.evaluate(() => {
        const materials = new Set(); church.scene.traverse(o => { if (o.material) for (const m of Array.isArray(o.material) ? o.material : [o.material]) materials.add(m); });
        const refs = [...materials].map(m => [m, m.map, m.bumpMap, m.roughnessMap, m.metalnessMap]);
        CHURCH_REALISM.finish(false); CHURCH_REALISM.setGlass('clear');
        CHURCH_REALISM.finish(true); CHURCH_REALISM.setGlass('stained');
        return refs.every(([m, map, bump, rough, metal]) => m.map === map && m.bumpMap === bump && m.roughnessMap === rough && m.metalnessMap === metal);
      }));
      const png = await page.evaluate(() => church.render()); assert(png.startsWith('data:image/png;base64,') && png.length > 10000);
      await page.close();
    }
    const [full, light] = results;
    assert.equal(full.policy.resampledImages, 0); assert(light.policy.resampledImages > 30);
    assert.equal(light.textureCount, full.textureCount); assert.equal(light.canvasCount, full.canvasCount);
    assert.deepEqual(light.properties, full.properties, 'physical material settings and map roles unchanged');
    assert.deepEqual(light.lightGrid.grid, full.lightGrid.grid, 'numeric lighting data untouched');
    assert(light.estimatedRGBA8MipBytes < full.estimatedRGBA8MipBytes * .4, 'at least 60% estimated image-memory reduction');
    assert(light.rawCanvasBytes < full.rawCanvasBytes * .4, 'at least 60% backing-canvas reduction');
    full.entries.forEach((a, i) => {
      const b = light.entries[i]; assert.equal(b.name, a.name); assert.equal(b.colorSpace, a.colorSpace); assert.deepEqual(b.wrap, a.wrap); assert.deepEqual(b.repeat, a.repeat);
      if (b.resample) { assert.deepEqual(b.resample.source, [a.width, a.height]); assert.deepEqual(b.resample.display, [b.width, b.height]); assert(b.width <= 512 && b.height <= 512); }
      else assert.deepEqual([b.width, b.height], [a.width, a.height]);
    });
    const phone = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
    phone.on('pageerror', e => errors.push(e.message)); phone.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await phone.goto('file://' + path.join(root, 'Thach_Bi_Viewer/OPEN_CHURCH.html?graphics=light'));
    await phone.waitForFunction(() => window.church?.ready, null, { timeout: 120000 });
    await phone.evaluate(() => { church.goTo('nave', { instant: true }); document.getElementById('discoverToggle').click(); document.getElementById('mapToggle').click(); });
    for (const mode of ['day', 'evening']) {
      await phone.evaluate(m => church.setLighting(m), mode); await phone.waitForTimeout(600);
      await phone.screenshot({ path: path.join(out, 'phone-' + mode + '.jpg'), type: 'jpeg', quality: 88 });
    }
    await phone.evaluate(() => { CHURCH_PLANNING.setLayout(2); CHURCH_SIMULATOR.setSetting('frameStyle', 'reference'); church.setRoof(false); }); await phone.waitForTimeout(600);
    await phone.screenshot({ path: path.join(out, 'phone-cutaway.jpg'), type: 'jpeg', quality: 88 });
    assert.deepEqual(errors, []);
    for (const result of results) delete result.properties;
    fs.writeFileSync(path.join(out, 'checks.json'), JSON.stringify({ results, materialPropertiesUnchanged: true, numericLightGridUnchanged: true, textureToggleIdentity: true, pngCapture: true, errors }, null, 2) + '\n');
    console.log(JSON.stringify(results.map(({ policy, textureCount, canvasCount, rawCanvasBytes, estimatedRGBA8MipBytes }) => ({ policy, textureCount, canvasCount, rawCanvasBytes, estimatedRGBA8MipBytes })), null, 2));
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
