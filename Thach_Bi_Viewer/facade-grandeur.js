/* Façade grandeur, design excellence stage 4 (20 November 2026). See docs/design-excellence.md.
 *
 * CONCEPT · In development · Not for construction. The owner found the front of the church
 * (towers and façade) still too flat. Two display measures live here; the depth measures (portal
 * orders, carving relief, cornice projection, tower openings) are in facade.js, towers.js and
 * exterior-ornament.js, each kept to the traced outlines.
 *   1. Exterior daylight balance. By day the sky and fill lights were strong against the sun, so
 *      cornices, arch orders and niches cast pale shadows. While the camera is outside the church,
 *      the sky and fill are lowered and the sun raised, so ornament reads through its shadow.
 *      Inside, the existing balance is kept. Display only: no lux or analysis input changes.
 *   2. Tone hierarchy. Carved work, arch orders, mouldings and pinnacle crowns (the accent and
 *      cap finishes) take a slightly warmer, deeper stone than the pale wall, so structure and
 *      ornament separate at courtyard distance. The owner's stone-grey wall stays as it is.
 * `?grandeur=off` restores both for comparison.
 */
(() => {
  'use strict';
  const spec = {
    revision: '2026-11-20-facade-grandeur-1',
    status: 'CONCEPT · design excellence stage 4 · display only',
    // Day light levels set by realism.lighting(): hemisphere .91, fill .33, sun 3.15.
    exterior: { hemisphere: .5, fill: .1, sun: 3.5, environment: .45,
      // Late-morning sun high in the south-east (bearing 150°, elevation 40°) rakes across the east front.
      sunFrom: [-0.383, 0.643, -0.663] },
    // Inside the nave envelope the realism balance is left alone.
    inside: { x: [1.0, 53.5], z: 11.6, y: 13 },
    tones: { darkTrim: '#aea591', cap: '#bdb4a2', recess: '#1e1712' }
  };
  let ctx = null, outside = null, mode = 'day', base = null;

  function prepare(c) {
    const off = new URLSearchParams(globalThis.location?.search || '').get('grandeur') === 'off';
    window.CHURCH_FACADE_GRANDEUR.enabled = !off;
    if (off) return;
    ctx = c;
    const { mat, palettes } = c;
    const tint = (m, colour) => {
      if (!m) return;
      m.color.set(colour); m.userData.facadeGrandeur = spec.revision; m.needsUpdate = true;
      const p = palettes?.get(m); if (p) p.color = m.color.clone();
    };
    tint(mat.darkTrim, spec.tones.darkTrim);
    tint(mat.cap, spec.tones.cap);
    if (mat.recess) mat.recess.color.set(spec.tones.recess);
    // Follow the viewer's day/evening switch and the camera, once per frame.
    const realism = window.CHURCH_REALISM;
    if (realism && !realism.__grandeur) {
      const lighting = realism.lighting, update = realism.update;
      realism.lighting = function (m, ...rest) {
        mode = m; outside = null; const r = lighting.call(this, m, ...rest);
        base = ctx.sun ? { h: ctx.hemisphere.intensity, f: ctx.fill.intensity, s: ctx.sun.intensity, e: ctx.scene?.environmentIntensity ?? 1, p: ctx.sun.position.clone() } : null;
        balance(); return r;
      };
      realism.update = function (...args) { const r = update.apply(this, args); balance(); return r; };
      realism.__grandeur = true;
    }
  }

  function balance() {
    if (!ctx || !base) return;
    if (mode === 'evening') { if (ctx.scene && 'environmentIntensity' in ctx.scene) ctx.scene.environmentIntensity = base.e; return; }
    const c = window.church, camera = typeof c?.camera === 'function' ? c.camera() : c?.camera;
    if (!camera?.position) return;
    const p = camera.position, I = spec.inside;
    const out = !(p.x > I.x[0] && p.x < I.x[1] && Math.abs(p.z) < I.z && p.y < I.y);
    if (out === outside) return;
    outside = out;
    const { sun, fill, hemisphere } = ctx;
    if (!sun || !fill || !hemisphere) return;
    // The sky environment map lights every material as ambient; it is lowered outside too.
    const scene = ctx.scene, E = scene && 'environmentIntensity' in scene;
    const X = spec.exterior, t = sun.target.position, d = base.p.distanceTo(t);
    if (out) { hemisphere.intensity = X.hemisphere; fill.intensity = X.fill; sun.intensity = X.sun; if (E) scene.environmentIntensity = X.environment; sun.position.set(t.x + X.sunFrom[0] * d, t.y + X.sunFrom[1] * d, t.z + X.sunFrom[2] * d); }
    else { hemisphere.intensity = base.h; fill.intensity = base.f; sun.intensity = base.s; if (E) scene.environmentIntensity = base.e; sun.position.copy(base.p); }
    sun.updateMatrixWorld(); if (ctx.renderer) ctx.renderer.shadowMap.needsUpdate = true;
  }

  window.CHURCH_FACADE_GRANDEUR = { spec, prepare, balance, enabled: false };
})();
