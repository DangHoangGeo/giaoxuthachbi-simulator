/* Static preview texture policy. Original procedural artwork and material
 * properties stay intact; explicit light graphics keeps smaller display images.
 * Do not pass dynamic canvases, labels, data textures or environment maps here. */
(() => {
  'use strict';
  const light = new URLSearchParams(location.search).get('graphics') === 'light';
  const images = new WeakMap();
  let count = 0, originalPixels = 0, displayPixels = 0;
  function create(T, source) {
    const texture = new T.CanvasTexture(source);
    if (!light || !source) return texture;
    let entry = images.get(source);
    if (!entry && source.width <= 256 && source.height <= 256) return texture;
    if (!entry) {
      const scale = Math.min(0.5, 512 / Math.max(source.width, source.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(source.width * scale));
      canvas.height = Math.max(1, Math.round(source.height * scale));
      const context = canvas.getContext('2d');
      context.imageSmoothingEnabled = true; context.imageSmoothingQuality = 'high';
      context.drawImage(source, 0, 0, canvas.width, canvas.height);
      entry = { canvas, provenance: { kind: 'resampled display texture', source: [source.width, source.height], display: [canvas.width, canvas.height], mode: 'light' } };
      images.set(source, entry); images.set(canvas, entry);
      count++; originalPixels += source.width * source.height; displayPixels += canvas.width * canvas.height;
    }
    texture.image = entry.canvas;
    texture.userData.displayResample = entry.provenance;
    return texture;
  }
  window.CHURCH_TEXTURES = { create, stats: () => ({ mode: light ? 'light' : 'standard', resampledImages: count, originalPixels, displayPixels }) };
})();
