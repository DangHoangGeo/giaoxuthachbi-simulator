/* Actual Chrome Web Audio and responsiveness check, using isolated local storage.
 * PLAYWRIGHT_MODULE=/installed/playwright node scripts/verify_audio_browser.cjs [output-dir]
 * Output is muted at the browser device; analyser reads verify the rendered signal.
 */
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(__dirname, '..'), out = process.argv[2] || '/tmp/thachbi-audio';
(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--allow-file-access-from-files', '--autoplay-policy=no-user-gesture-required', '--mute-audio'] });
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } }), errors = [];
    page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await page.goto('file://' + path.join(root, 'Thach_Bi_Viewer/OPEN_CHURCH.html?graphics=light'));
    await page.waitForFunction(() => window.church?.ready, null, { timeout: 120000 });
    await page.evaluate(() => church.goTo('nave', { instant: true })); await page.waitForTimeout(1800);
    const cdp = await page.context().newCDPSession(page); await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    const start = await page.evaluate(async () => {
      window.arrivalCount = 0;
      const P = CHURCH_SIM_PHYSICS, original = P.sourceArrivals;
      P.sourceArrivals = (...args) => { arrivalCount++; return original(...args); };
      const A = CHURCH_SIMULATOR.audio, t = performance.now(); await A.play('pink');
      return { startedMs: performance.now() - t, playing: A.state.playing, irKey: A.state.irKey, sampleRate: A.context.sampleRate, resources: A.resources(), error: A.state.error };
    });
    assert.equal(start.resources.speakerChains, await page.evaluate(() => CHURCH_SIMULATOR.speakers().filter(s => s.on).length));
    assert(start.playing); assert(!start.error); assert(start.irKey);
    await page.waitForTimeout(1200);
    const levels = await page.evaluate(() => CHURCH_SIMULATOR.audio.outputLevels()); assert(Number.isFinite(levels.rmsDb) && levels.rmsDb > -100);
    const originalSource = fs.readFileSync(path.join(root, 'scripts/fixtures/audio-reference.cjs'), 'utf8').replace(/module\.exports =[^;]+;/, '');
    await page.evaluate(code => { window.audioReference = new Function(code + '\nreturn { referenceIR, referenceStipa };')(); }, originalSource);
    const synthesis = await page.evaluate(async () => {
      // Pause drawing only for this isolated computation comparison. Real walking
      // with audio is measured below. Both algorithms use identical room inputs.
      church.pause();
      const A = CHURCH_SIMULATOR.audio, room = CHURCH_SIMULATOR.room(), P = CHURCH_SIM_PHYSICS;
      async function measure(make) {
        let beats = 0, last = performance.now(), maxGap = 0;
        const id = setInterval(() => { const now = performance.now(); maxGap = Math.max(maxGap, now - last); last = now; beats++; }, 1);
        await new Promise(r => setTimeout(r, 10)); beats = 0; last = performance.now(); maxGap = 0;
        const start = performance.now(); const result = await make(); const totalMs = performance.now() - start;
        // Let the overdue interval actually run before closing the probe.
        await new Promise(r => setTimeout(r, 12)); clearInterval(id);
        return { totalMs, maxHeartbeatGapMs: maxGap, yieldedHeartbeats: beats, samples: result.length * result.numberOfChannels };
      }
      const trials = [];
      for (let i = 0; i < 3; i++) trials.push({
        beforeIR: await measure(() => audioReference.referenceIR(A.context, room, P)),
        afterIR: await measure(() => CHURCH_AUDIO_SYNTHESIS.makeIR(A.context, room, P)),
        beforeStipa: await measure(() => audioReference.referenceStipa(A.context, P)),
        afterStipa: await measure(() => CHURCH_AUDIO_SYNTHESIS.makeStipa(A.context, P))
      });
      const median = values => values.sort((a, b) => a - b)[Math.floor(values.length / 2)];
      const stats = Object.fromEntries(['beforeIR', 'afterIR', 'beforeStipa', 'afterStipa'].map(key => [key,
        Object.fromEntries(Object.keys(trials[0][key]).map(metric => [metric, median(trials.map(t => t[key][metric]))]))]));
      church.resume();
      return { ...stats, trials };
    });
    console.log('Synthesis measurements:', JSON.stringify(synthesis));
    assert(synthesis.beforeIR.yieldedHeartbeats > 0 && synthesis.beforeStipa.yieldedHeartbeats > 0, "baseline heartbeat probe ran");
    assert(synthesis.afterIR.yieldedHeartbeats > 5); assert(synthesis.afterStipa.yieldedHeartbeats > 5);
    assert(synthesis.afterIR.maxHeartbeatGapMs < synthesis.beforeIR.maxHeartbeatGapMs * .5);
    assert(synthesis.afterStipa.maxHeartbeatGapMs < synthesis.beforeStipa.maxHeartbeatGapMs * .5);
    const scenarios = [];
    await page.evaluate(() => {
      window.audioFrames = []; const renderer = church.renderer, render = renderer.render.bind(renderer);
      renderer.render = (...args) => { audioFrames.push(performance.now()); return render(...args); };
    });
    for (const movement of ['idle', 'walk']) {
      if (movement === 'walk') await page.keyboard.down('KeyW');
      await page.evaluate(() => { arrivalCount = 0; audioFrames = []; }); await page.waitForTimeout(4000);
      if (movement === 'walk') await page.keyboard.up('KeyW');
      scenarios.push(await page.evaluate(movement => {
        const intervals = audioFrames.slice(1).map((t, i) => t - audioFrames[i]).sort((a, b) => a - b);
        return { movement, frames: audioFrames.length, medianMs: intervals[Math.floor(intervals.length * .5)], p95Ms: intervals[Math.floor(intervals.length * .95)], arrivalCallsIncludingReadouts: arrivalCount, speakers: CHURCH_SIMULATOR.speakers().length, fanSources: CHURCH_SIMULATOR.fans().filter(f => f.running).length, lights: CHURCH_SIMULATOR.persistentLighting.stats(), level: CHURCH_SIMULATOR.audio.outputLevels() };
      }, movement));
    }
    const initialKey = await page.evaluate(() => CHURCH_SIMULATOR.audio.state.irKey);
    await page.evaluate(() => CHURCH_SIMULATOR.setSetting('entranceFinish', 'plaster'));
    await page.waitForFunction(key => CHURCH_SIMULATOR.audio.state.irKey !== key, initialKey, { timeout: 30000 });
    // A real decoded embedded sample works, then a canceled/newer play wins.
    await page.evaluate(async () => { await CHURCH_SIMULATOR.audio.play('speech-vi'); });
    assert(await page.evaluate(() => CHURCH_SIMULATOR.audio.state.playing));
    const canceled = await page.evaluate(async () => { const A = CHURCH_SIMULATOR.audio, pending = A.play('speech-en'); A.stop(); await pending; return { playing: A.state.playing, loading: A.state.loading }; });
    assert.deepEqual(canceled, { playing: false, loading: false });
    await page.evaluate(async () => { await CHURCH_SIMULATOR.audio.play('pink'); });
    // Open the actual listening panel and inspect its visible state.
    await page.evaluate(() => { document.getElementById('simulatorButton').click(); });
    await page.locator('[data-tab="speaker"]').click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(out, 'listen-desktop.jpg'), type: 'jpeg', quality: 85 });
    await page.evaluate(() => CHURCH_SIMULATOR.audio.stop());
    const phone = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
    phone.on('pageerror', e => errors.push(e.message)); phone.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await phone.goto('file://' + path.join(root, 'Thach_Bi_Viewer/OPEN_CHURCH.html?graphics=light'));
    await phone.waitForFunction(() => window.church?.ready, null, { timeout: 120000 });
    await phone.evaluate(() => { church.goTo('nave', { instant: true }); document.getElementById('simulatorButton').click(); });
    await phone.locator('[data-tab="speaker"]').click();
    await phone.locator('#simAudioSource').selectOption('pink'); await phone.locator('#simAudioPlay').click();
    await phone.waitForFunction(() => CHURCH_SIMULATOR.audio.state.playing, null, { timeout: 30000 });
    await phone.screenshot({ path: path.join(out, 'listen-phone.jpg'), type: 'jpeg', quality: 85 });
    await phone.locator('#simAudioPlay').click(); assert(!(await phone.evaluate(() => CHURCH_SIMULATOR.audio.state.playing)));
    assert.deepEqual(errors, []);
    const result = { cpuRate: 4, graphics: 'light', start, levels, synthesis, scenarios, checks: { entranceFinishRebuildsIR: true, embeddedSpeechDecoded: true, cancelCannotStartLater: true, phonePlayStop: true }, errors };
    fs.writeFileSync(path.join(out, 'checks.json'), JSON.stringify(result, null, 2) + '\n'); console.log(JSON.stringify(result, null, 2));
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
