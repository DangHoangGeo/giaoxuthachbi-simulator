/* Display-only resolution policy. Never changes the model, lamp outputs, shadow
 * identities, analytical sampling, sound or fan settings. Works offline.
 */
(() => {
  'use strict';
  const modes = { auto: 'Automatic · smoother navigation', full: 'Full resolution', medium: '75% resolution', low: '50% · weakest computers' };
  let renderer, viewport, mode = 'auto', ratio = 1, last = 0, sampled = 0, slow = 0, frames = 0;
  let idleAt = 0, cameraState = '', invalid = true, changes = 0;
  const storageKey = 'thachbi-preview-resolution-v1';
  function baseRatio() { return Math.min(window.devicePixelRatio || 1, 1.5); }
  function automaticStart() {
    return Math.max(0.5, Math.min(baseRatio(), 1, Math.sqrt(1300000 / Math.max(1, viewport.clientWidth * viewport.clientHeight))));
  }
  function apply() {
    if (!renderer) return;
    const wanted = mode === 'auto' ? ratio : baseRatio() * ({ full: 1, medium: 0.75, low: 0.5 }[mode]);
    if (Math.abs(renderer.getPixelRatio() - wanted) > 0.001) { renderer.setPixelRatio(wanted); invalid = true; }
    const select = document.getElementById('previewResolution');
    if (select && select.value !== mode) select.value = mode;
    const label = document.getElementById('previewResolutionStatus');
    if (label) label.textContent = `${Math.round(renderer.domElement.width)} × ${Math.round(renderer.domElement.height)} pixels. All lamps, materials and calculations stay active.`;
  }
  function setMode(value) {
    if (!modes[value]) return;
    mode = value; ratio = automaticStart(); sampled = slow = frames = 0; last = 0;
    try { localStorage.setItem(storageKey, mode); } catch { /* private/offline browsing */ }
    apply(); invalid = true;
  }
  function prepare(r, v) {
    renderer = r; viewport = v;
    try { const saved = localStorage.getItem(storageKey); if (modes[saved]) mode = saved; } catch { /* unavailable */ }
    if (new URLSearchParams(location.search).get('graphics') === 'light') mode = 'low';
    ratio = automaticStart();
    const recovery = document.getElementById('graphicsRecovery');
    if (recovery) {
      const light = new URLSearchParams(location.search).get('graphics') === 'light';
      recovery.textContent = light ? 'Restore standard graphics · restart view' : 'Use light graphics · restart view';
      recovery.addEventListener('click', () => {
        window.CHURCH_SIMULATOR?.saveNow();
        const url = new URL(location.href);
        if (light) url.searchParams.delete('graphics'); else url.searchParams.set('graphics', 'light');
        location.href = url.href;
      });
    }
    const select = document.getElementById('previewResolution');
    select?.addEventListener('change', e => setMode(e.target.value));
    window.addEventListener('resize', () => { if (mode === 'auto') ratio = Math.min(ratio, automaticStart()); requestAnimationFrame(apply); });
    for (const event of ['input', 'change', 'click', 'pointerdown', 'keydown']) document.addEventListener(event, () => { invalid = true; }, true);
    document.addEventListener('visibilitychange', () => { last = 0; sampled = slow = frames = 0; invalid = true; });
    apply();
  }
  function shouldRender(now, camera) {
    const dt = last ? now - last : 0; last = now;
    // Raw RAF intervals, before the walk integration clamps dt. Startup, hidden
    // tabs and intentional idle skips cannot masquerade as slow rendering.
    if (mode === 'auto' && dt > 0 && !document.hidden) {
      sampled += Math.min(dt, 250); frames++;
      slow += dt > 38 ? Math.min(dt, 250) : -Math.min(dt, 250) * 0.5;
      slow = Math.max(0, slow);
      if (frames >= 20 && sampled > 2000 && slow > 1200 && ratio > 0.5) {
        ratio = Math.max(0.5, Math.round((ratio - 0.15) * 100) / 100);
        changes++; apply(); sampled = slow = frames = 0;
      }
    }
    const p = camera.position, q = camera.quaternion;
    const next = [p.x, p.y, p.z, q.x, q.y, q.z, q.w, camera.zoom, camera.fov].join(',');
    const moving = next !== cameraState; cameraState = next;
    if (!moving && !invalid && now - idleAt < 32) return false;
    idleAt = now; invalid = false;
    return true;
  }
  window.CHURCH_PERFORMANCE = {
    prepare, shouldRender, setMode, refresh: apply, invalidate: () => { invalid = true; },
    get renderer() { return renderer; },
    stats: () => ({ mode, pixelRatio: renderer?.getPixelRatio(), automaticReductions: changes, idleMaxFps: 30 })
  };
})();
