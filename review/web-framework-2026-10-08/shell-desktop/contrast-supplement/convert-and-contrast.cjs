#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { createRequire } = require('node:module');
const supplementDir = __dirname;
const inputPath = '/private/tmp/thachbi-web01-shell-visual/evidence-final/contrast-colors.json';
const outputPath = path.join(supplementDir, 'contrast-calculations.json');
if (fs.existsSync(outputPath)) throw new Error(`Refusing to overwrite ${outputPath}`);
const repoRoot = '/Users/danghoang/Desktop/giaoxuthachbi_work';
const webRoot = path.join(repoRoot, 'web');
const requireWeb = createRequire(path.join(webRoot, 'package.json'));
const { chromium } = requireWeb('playwright');
const inputBytes = fs.readFileSync(inputPath);
const source = JSON.parse(inputBytes.toString('utf8'));
function sha256(bytes) { return crypto.createHash('sha256').update(bytes).digest('hex'); }
function collectCssColors(value, result = new Set()) {
  if (typeof value === 'string' && /^(?:rgb|rgba|lab|lch|oklab|oklch|color)\(/i.test(value)) result.add(value);
  else if (Array.isArray(value)) for (const item of value) collectCssColors(item, result);
  else if (value && typeof value === 'object') for (const item of Object.values(value)) collectCssColors(item, result);
  return result;
}
function matchByText(items, text) { return items.find((item) => item.text.includes(text)); }
const uniqueCssColors = [...collectCssColors(source)].sort();
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--no-first-run', '--no-default-browser-check', '--disable-sync', '--disable-background-networking', '--disable-default-apps'] });
  let canvasResult;
  try {
    const page = await browser.newPage();
    canvasResult = await page.evaluate((cssColors) => {
      const canvas = document.createElement('canvas');
      canvas.width = 1; canvas.height = 1;
      const context = canvas.getContext('2d', { colorSpace: 'srgb', willReadFrequently: true });
      if (!context) throw new Error('Canvas 2D context unavailable');
      const sentinel = 'rgba(1, 2, 3, 1)';
      const parsed = {};
      for (const css of cssColors) {
        context.clearRect(0, 0, 1, 1);
        context.fillStyle = sentinel;
        const before = context.fillStyle;
        context.fillStyle = css;
        const acceptedByCanvasParser = context.fillStyle !== before;
        context.fillRect(0, 0, 1, 1);
        const bytes = Array.from(context.getImageData(0, 0, 1, 1).data);
        parsed[css] = {
          css,
          acceptedByCanvasParser,
          rgba8: bytes,
          alpha: bytes[3] / 255,
          fullyOpaque: bytes[3] === 255,
          canvasColorSpace: context.getContextAttributes?.().colorSpace ?? 'srgb (requested; context attributes unavailable)',
        };
      }
      return parsed;
    }, uniqueCssColors);
  } finally {
    await browser.close();
  }
  const luminance = (rgba8) => {
    const linear = rgba8.slice(0, 3).map((byte) => {
      const encoded = byte / 255;
      return encoded <= 0.04045 ? encoded / 12.92 : ((encoded + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
  };
  const compare = (id, label, foregroundCss, backgroundCss, foregroundSource, backgroundBasis) => {
    const foreground = canvasResult[foregroundCss];
    const background = canvasResult[backgroundCss];
    if (!foreground || !background) throw new Error(`Missing converted color for ${id}`);
    if (!foreground.fullyOpaque || !background.fullyOpaque) throw new Error(`WCAG comparison requires opaque surfaces: ${id}`);
    const foregroundLuminance = luminance(foreground.rgba8);
    const backgroundLuminance = luminance(background.rgba8);
    const lighter = Math.max(foregroundLuminance, backgroundLuminance);
    const darker = Math.min(foregroundLuminance, backgroundLuminance);
    const ratio = (lighter + 0.05) / (darker + 0.05);
    return {
      id,
      label,
      foreground: { css: foregroundCss, rgba8: foreground.rgba8, alpha: foreground.alpha, relativeLuminance: foregroundLuminance, source: foregroundSource },
      background: { css: backgroundCss, rgba8: background.rgba8, alpha: background.alpha, relativeLuminance: backgroundLuminance, basis: backgroundBasis },
      wcagContrastRatio: ratio,
      wcagContrastRatioRounded2dp: Number(ratio.toFixed(2)),
    };
  };
  const vi = source.routes.find((route) => route.locale === 'vi');
  const en = source.routes.find((route) => route.locale === 'en');
  if (!vi || !en) throw new Error('Expected recorded Vietnamese and English routes');
  const rootCreamCss = vi.rootBackground;
  const bodyParagraph = matchByText(vi.bodyCopy, 'Trang giới thiệu nhà thờ');
  const eyebrow = matchByText(vi.bodyCopy, 'CÙNG XÂY DỰNG NHÀ THỜ');
  const footerText = vi.footerText[0];
  const preview = vi.preview.find((item) => item.label.startsWith('preview-banner'));
  const heading = vi.headings[0];
  const nav = vi.navigation[0];
  const focused = source.focused200CssTextResize;
  const comparisons = [
    compare('body-on-cream', 'Body inherited foreground against the opaque root cream', vi.body.foregroundColor, rootCreamCss, vi.body, { source: 'nearest opaque ancestor from recorded route', recordedElementBackground: vi.body.backgroundColor, ancestor: vi.body.backgroundAncestors[0] }),
    compare('heading-on-cream', 'Heading foreground against the opaque root cream', heading.foregroundColor, rootCreamCss, heading, { source: 'nearest opaque ancestor', recordedElementBackground: heading.backgroundColor, ancestor: heading.backgroundAncestors[0] }),
    compare('navigation-on-cream', 'Navigation link foreground against the opaque root cream', nav.foregroundColor, rootCreamCss, nav, { source: 'nearest opaque ancestor', recordedElementBackground: nav.backgroundColor, ancestor: nav.backgroundAncestors[0] }),
    compare('main-paragraph-on-cream', 'Main paragraph foreground against the opaque root cream', bodyParagraph.foregroundColor, rootCreamCss, bodyParagraph, { source: 'nearest opaque ancestor', recordedElementBackground: bodyParagraph.backgroundColor, ancestor: bodyParagraph.backgroundAncestors[0] }),
    compare('eyebrow-footer-on-cream', 'Eyebrow and footer foreground against the opaque root cream', eyebrow.foregroundColor, rootCreamCss, { eyebrow, footerText }, { source: 'nearest opaque ancestor for both recorded elements', eyebrowElementBackground: eyebrow.backgroundColor, footerElementBackground: footerText.backgroundColor, ancestor: eyebrow.backgroundAncestors[0] }),
    compare('preview-on-preview-background', 'Preview-banner foreground against the opaque preview banner background', preview.foregroundColor, preview.backgroundColor, preview, { source: 'the preview banner itself', recordedBackgroundAncestors: preview.backgroundAncestors }),
    compare('focus-outline-on-white', 'Focused skip-link outline against the white skip-link surface', focused.outline.color, focused.backgroundColor, focused.outline, { source: 'focused link background', recordedForegroundColor: focused.foregroundColor }),
    compare('focus-outline-on-cream', 'Focused skip-link outline against the surrounding opaque root cream', focused.outline.color, rootCreamCss, focused.outline, { source: 'adjacent page canvas outside the focused link', linkBackground: focused.backgroundColor }),
  ];
  const opaqueColorComparisons = comparisons.map((item) => ({ id: item.id, foregroundCss: item.foreground.css, foregroundRgba8: item.foreground.rgba8, backgroundCss: item.background.css, backgroundRgba8: item.background.rgba8, ratio: item.wcagContrastRatio }));
  const payload = {
    schemaVersion: 1,
    capturedAt: new Date().toISOString(),
    input: { path: inputPath, sha256: sha256(inputBytes), buildId: source.buildId, sourceHashCount: Object.keys(source.sourceHashes.before).length, sourceChangesDuringBrowserCapture: source.sourceHashes.changedPaths },
    browser: { channel: 'chrome', version: await (async () => { const b = await chromium.launch({ channel: 'chrome', headless: true }); try { return b.version(); } finally { await b.close(); } })(), playwrightVersion: requireWeb('playwright/package.json').version, canvas: { contextColorSpaceRequested: 'srgb', pixelFormat: 'unorm8', api: 'CanvasRenderingContext2D.fillStyle + getImageData(0,0,1,1)' } },
    conversions: canvasResult,
    transparency: { recordedCssTransparent: canvasResult['rgba(0, 0, 0, 0)'] ?? null, note: 'Transparent element backgrounds are preserved as alpha zero and are not treated as opaque contrast surfaces. Text-background comparisons use the nearest opaque ancestor surface recorded in the input. Focus outline comparisons use each adjacent opaque surface separately.' },
    formula: { encodedSrgbByteNormalization: 'c = byte / 255', linearization: 'c_linear = c / 12.92 when c <= 0.04045; otherwise ((c + 0.055) / 1.055)^2.4', relativeLuminance: 'L = 0.2126 R_linear + 0.7152 G_linear + 0.0722 B_linear', contrast: '(max(L_foreground, L_background) + 0.05) / (min(L_foreground, L_background) + 0.05)' },
    comparisons,
    limitations: [
      'Canvas getImageData returns 8-bit unorm sRGB channels; the ratios therefore use the exact browser conversion quantized to 8-bit, not source-gamut floating-point coordinates.',
      'Computed colors are sampled from the captured default desktop routes and the 200% CSS-root-text-size focus state; this does not test every browser, display profile, hover state, or user preference.',
      'A contrast ratio is an input to accessibility review, not a full WCAG certification. This calculation does not verify all text-size classification, non-text contrast, focus appearance requirements, use contexts, or the remaining accessibility criteria.',
      'Axe reported color-contrast as incomplete; these calculations do not convert that incomplete result into a passing axe audit.'
    ],
  };
  fs.writeFileSync(outputPath, JSON.stringify(payload, null, 2) + '\n');
  process.stdout.write(JSON.stringify({ outputPath, inputSha256: payload.input.sha256, convertedColorCount: Object.keys(canvasResult).length, transparent: payload.transparency.recordedCssTransparent, ratios: Object.fromEntries(comparisons.map((item) => [item.id, item.wcagContrastRatioRounded2dp])), noSourceChanges: payload.input.sourceChangesDuringBrowserCapture.length === 0 }, null, 2) + '\n');
})().catch((error) => {
  process.stderr.write(`${error.stack || error}\n`);
  process.exitCode = 1;
});
