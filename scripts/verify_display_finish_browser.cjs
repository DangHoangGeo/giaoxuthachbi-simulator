/* Pixel regression for the desktop finish pass. Use HEADED=1 to run on the desktop GPU. */
'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: process.env.HEADED !== '1' });
  try {
    const page = await browser.newPage({ viewport: { width: 1360, height: 820 }, deviceScaleFactor: 1 });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    const entry = pathToFileURL(path.join(__dirname, '../Thach_Bi_Viewer/OPEN_CHURCH.html'));
    entry.search = '?visit&lang=en';
    await page.goto(entry.href);
    await page.waitForFunction(() => window.church?.ready, null, { timeout: 180000 });

    const result = await page.evaluate(() => {
      const { THREE: T, visitOnly } = CHURCH_SIMULATOR;
      const { settings, stats } = CHURCH_DISPLAY_FINISH;
      const { renderer, scene } = church;
      church.pause();
      church.setPresentation(true);

      const patch = document.createElement('canvas');
      patch.width = patch.height = 11;
      const pixels = patch.getContext('2d', { willReadFrequently: true });
      const strength = settings.strength;
      const readLuma = (value, radius) => {
        settings.strength = value;
        renderer.render(scene, church.camera);
        const frame = renderer.domElement;
        const width = 2 * radius + 1;
        pixels.drawImage(frame, Math.floor(frame.width / 2) - radius, Math.floor(frame.height / 2) - radius,
          width, width, 0, 0, width, width);
        const rgba = pixels.getImageData(0, 0, width, width).data;
        const luma = [];
        for (let i = 0; i < rgba.length; i += 4) {
          luma.push(0.2126 * rgba[i] + 0.7152 * rgba[i + 1] + 0.0722 * rgba[i + 2]);
        }
        return Math.round(luma.sort((a, b) => a - b)[Math.floor(luma.length / 2)]);
      };
      const compare = (radius = 5) => {
        const values = { shaded: readLuma(strength, radius), reference: readLuma(0, radius) };
        settings.strength = strength;
        return values;
      };

      const results = [];
      const frontDirection = new T.Vector3(-1, -.15, -.22).normalize();
      const samples = [
        { name: 'lower entrance stone', target: [2.21, 5.12, 3.88], distances: [6, 25, 55, 100] },
        { name: 'upper façade stone', target: [2.936, 13.85, 2.36], distances: [6, 25, 55, 100] },
        { name: 'side wall stone', target: [18.2, 4.15, -10.474], distances: [6, 25, 55, 100], direction: new T.Vector3(-.18, .12, -1).normalize() },
        { name: 'inside entrance stone', target: [5.475, 4.4, 2.5], distances: [2, 4, 6], direction: new T.Vector3(1, .04, .06).normalize() },
        { name: 'beside the central moulding', target: [2.936, 13.65, 1.63], distances: [6, 25] }
      ];
      for (const mode of ['day', 'evening']) {
        church.setLighting(mode);
        for (const { name, target, distances, direction = frontDirection } of samples) {
          const readings = distances.map(distance => {
            const pos = new T.Vector3(...target).addScaledVector(direction, distance).toArray();
            church.places.displayCheck = { title: name, note: '', pos, target, interior: false };
            church.goTo('displayCheck', { mode: 'explore', instant: true });
            // At 100 m a fixed 11-pixel square spans neighbouring trim and joints.
            // Sample about 8 cm of wall, limited by the display's pixel size.
            const pixelsPerMetre = renderer.domElement.height * church.camera.projectionMatrix.elements[5] / (2 * distance);
            const radius = Math.min(5, Math.floor(.04 * pixelsPerMetre));
            return { distance, ...compare(radius) };
          });
          results.push({ mode, name, readings });
        }
      }

      // One plane has exactly zero occlusion even at an oblique angle. A
      // shallow bar added to it must shade the same surface beside the join.
      scene.children.forEach(object => { object.visible = false; });
      scene.fog = null;
      const grey = new T.MeshBasicMaterial({ color: 0xcccccc });
      const wall = new T.Mesh(new T.PlaneGeometry(45, 45), grey);
      const bar = new T.Mesh(new T.BoxGeometry(.24, 8, .26), grey);
      bar.position.z = .13;
      scene.add(wall, bar);
      const camera = church.camera;
      const target = new T.Vector3(.18, 0, 0);
      const oblique = new T.Vector3(.2, .05, 1).normalize();
      const plane = [6, 25, 55].map(distance => {
        camera.position.copy(target).addScaledVector(oblique, distance);
        camera.lookAt(target);
        camera.updateMatrixWorld(true);
        bar.visible = false;
        const flat = compare();
        bar.visible = true;
        return { distance, flat, join: compare() };
      });
      // A straight vertical join at constant depth should have the same shade
      // from top to bottom. Inspect each column across the edge of the bar.
      bar.scale.z = .2;
      bar.position.z = .026;
      camera.position.set(.12, 0, 8);
      camera.lookAt(.12, 0, 0);
      camera.updateMatrixWorld(true);
      const frame = renderer.domElement;
      const strip = document.createElement('canvas');
      strip.width = 32; strip.height = 96;
      const ctx = strip.getContext('2d', { willReadFrequently: true });
      const scan = value => {
        settings.strength = value;
        renderer.render(scene, camera);
        ctx.drawImage(frame, (frame.width - strip.width) >> 1, (frame.height - strip.height) >> 1,
          strip.width, strip.height, 0, 0, strip.width, strip.height);
        return ctx.getImageData(0, 0, strip.width, strip.height).data;
      };
      const reference = scan(0), shaded = scan(strength);
      let maxVariation = 0, darkestContact = 0;
      for (let x = 0; x < strip.width; x++) {
        const column = [];
        for (let y = 0; y < strip.height; y++) {
          const i = 4 * (y * strip.width + x);
          column.push(reference[i] - shaded[i]);
        }
        column.sort((a, b) => a - b);
        maxVariation = Math.max(maxVariation, column[90] - column[5]);
        darkestContact = Math.max(darkestContact, column[48]);
      }
      return { visitOnly, active: stats.active, reason: stats.reason, results, plane, maxVariation, darkestContact };
    });

    assert.deepEqual(errors, []);
    assert(result.visitOnly && result.active, result.reason || 'Visit-only display pass must be active');
    for (const { mode, name, readings } of result.results) {
      const differences = readings.map(({ shaded, reference }) => reference - shaded);
      if (name === 'beside the central moulding') {
        assert(differences[0] >= 5 && differences[0] <= 30, `${mode}: visible, soft contact on the modelled moulding`);
      } else {
        const luma = readings.map(({ shaded }) => shaded);
        assert(Math.max(...luma) - Math.min(...luma) <= 9, `${mode} ${name}: steady wall brightness ${luma}`);
        assert(differences.every(delta => Math.abs(delta) <= 8), `${mode} ${name}: no broad occlusion ${differences}`);
      }
    }
    for (const { distance, flat } of result.plane) {
      assert(Math.abs(flat.shaded - flat.reference) <= 2, `Flat oblique surface stays neutral at ${distance} m`);
    }
    const { join } = result.plane[0];
    assert(join.reference - join.shaded >= 5, 'A raised bar keeps a contact shadow on the same plane');
    console.log(JSON.stringify(result, null, 2));
    assert(result.darkestContact >= 5, 'The vertical join casts a visible contact shadow');
    assert(result.maxVariation <= 3, 'Contact shade is even along the vertical join');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
