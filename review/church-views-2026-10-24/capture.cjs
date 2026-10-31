/* Desktop captures of the owner's current working model; no model files are edited. */
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '../..');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || path.join(root, 'web/node_modules/playwright'));
const shots = [
  { id: '01-front-day', title: 'Front façade · daylight', pos: [-92, 8, 0], target: [1, 16, 0], fov: 29, light: 'day' },
  { id: '02-front-corner-day', title: 'Front and long side · daylight', pos: [-47, 19, 58], target: [20, 13, 0], fov: 43, light: 'day' },
  { id: '03-opposite-corner-evening', title: 'Opposite front corner · evening', pos: [-47, 19, -58], target: [20, 13, 0], fov: 43, light: 'evening' },
  { id: '04-facade-detail-day', title: 'Central façade and shrines · daylight', pos: [-28, 13, 0], target: [3, 13, 0], fov: 43, light: 'day' },
  { id: '05-nave-day', title: 'Nave toward sanctuary · daylight', pos: [8, 1.7, 0], target: [46, 5, 0], fov: 54, light: 'day' },
  { id: '06-sanctuary-evening', title: 'Sanctuary · evening', pos: [32.3, 2.5, 0], target: [47.5, 5.7, 0], fov: 53, light: 'evening' },
];
const sha = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
(async () => {
  const out = path.join(__dirname, 'model-inputs'); fs.mkdirSync(out, { recursive: true });
  const sourceFiles = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', 'Thach_Bi_Viewer'], { cwd: root, encoding: 'utf8' }).trim().split('\n').filter(f => /\.(js|html|css)$/.test(f));
  const sources = Object.fromEntries(sourceFiles.map(f => [f, sha(path.join(root, f))]));
  const browser = await chromium.launch({ channel: 'chrome', headless: process.env.HEADED !== '1', args: ['--allow-file-access-from-files'] });
  const errors = [];
  try {
    const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
    page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await page.goto('file://' + path.join(root, 'Thach_Bi_Viewer/OPEN_CHURCH.html') + '?visit');
    await page.waitForFunction(() => window.church?.ready, null, { timeout: 180000 });
    await page.waitForTimeout(1500);
    for (const shot of shots) {
      const data = await page.evaluate(s => {
        church.goTo('nave', { instant: true, mode: 'explore' }); church.pause(); church.setRoof(true); church.setGrid(false);
        church.setLighting(s.light); church.setPresentation(true);
        const cam = church.camera; cam.position.set(...s.pos); cam.fov = s.fov; cam.zoom = 1; cam.updateProjectionMatrix();
        church.controls.target.set(...s.target); church.controls.update();
        return church.render();
      }, shot);
      const file = path.join(out, shot.id + '.png'); fs.writeFileSync(file, Buffer.from(data.split(',')[1], 'base64'));
      shot.sha256 = sha(file); console.log('Captured ' + shot.id);
    }
    const record = {
      capturedAt: new Date().toISOString(), sourceCommit: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(),
      sourceStatus: 'Owner working tree, including uncommitted CAD façade revision 2026-10-24-cad-facade-1; HEAD alone does not reproduce these images.',
      viewport: { width: 1920, height: 1080 }, mode: 'visit-only', projection: 'perspective', roof: true, grid: false,
      notes: 'Actual WebGL canvas captures; no artwork, drawing overlay or engineering-layout import/export. Cameras and display lighting only. No physical equipment change.',
      sourceSha256: sources, shots, errors,
    };
    fs.writeFileSync(path.join(out, 'capture.json'), JSON.stringify(record, null, 2) + '\n');
    if (errors.length) throw new Error(JSON.stringify(errors));
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
