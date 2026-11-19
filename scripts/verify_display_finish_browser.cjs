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
      const readLuma = value => {
        settings.strength = value;
        renderer.render(scene, church.camera);
        const frame = renderer.domElement;
        pixels.drawImage(frame, Math.floor(frame.width / 2) - 5, Math.floor(frame.height / 2) - 5, 11, 11, 0, 0, 11, 11);
        const rgba = pixels.getImageData(0, 0, 11, 11).data;
        const luma = [];
        for (let i = 0; i < rgba.length; i += 4) {
          luma.push(0.2126 * rgba[i] + 0.7152 * rgba[i + 1] + 0.0722 * rgba[i + 2]);
        }
        return Math.round(luma.sort((a, b) => a - b)[60]);
      };
      const compare = () => {
        const values = { shaded: readLuma(strength), reference: readLuma(0) };
        settings.strength = strength;
        return values;
      };

      const results = [];
      const frontDirection = new T.Vector3(-1, -.15, -.22).normalize();
      const samples = [
        { name: 'lower plaster field', target: [1.975, 5.32, 5.24], distances: [6, 25, 55, 100] },
        { name: 'upper plaster field', target: [2.936, 13.85, 2.36], distances: [6, 25, 55, 100] },
        { name: 'side plaster field', target: [19.8, 5.25, -10.474], distances: [6, 25, 55, 100], direction: new T.Vector3(-.18, .12, -1).normalize() },
        { name: 'beside the central moulding', target: [2.936, 13.65, 1.63], distances: [6, 25] }
      ];
      for (const mode of ['day', 'evening']) {
        church.setLighting(mode);
        for (const { name, target, distances, direction = frontDirection } of samples) {
          const readings = distances.map(distance => {
            const pos = new T.Vector3(...target).addScaledVector(direction, distance).toArray();
            church.places.displayCheck = { title: name, note: '', pos, target, interior: false };
            church.goTo('displayCheck', { mode: 'explore', instant: true });
            return { distance, ...compare() };
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
      return { visitOnly, active: stats.active, reason: stats.reason, results, plane };
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
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
