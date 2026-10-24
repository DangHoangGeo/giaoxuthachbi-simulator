/* Assemble metadata and the offline gallery. Image bytes are never transformed. */
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const root = path.resolve(__dirname, '../..');
const gallery = path.join(root, 'Thach_Bi_Viewer/references/00-overview/2026-10-24');
const selection = JSON.parse(fs.readFileSync(path.join(__dirname, 'selection.json')));
const capture = JSON.parse(fs.readFileSync(path.join(__dirname, 'model-inputs/capture.json')));
const sha = b => crypto.createHash('sha256').update(b).digest('hex');
const descriptions = [
  ['Mặt tiền · Ban ngày', 'Updated central shrine, triple window and twin towers, viewed from the forecourt.'],
  ['Góc trước và bên hông · Ban ngày', 'Front three-quarter view with the long terracotta nave roof and side wing.'],
  ['Góc trước đối diện · Chiều tối', 'Opposite front corner with an illustrative warm evening lighting treatment.'],
  ['Chi tiết mặt tiền · Ban ngày', 'Central Assumption shrine, side saints, triple louvers, cresting and carved doors.'],
  ['Lòng nhà thờ · Ban ngày', 'Red lacquer timber columns, gilded carvings and the clear processional view toward the altar. Fan concealment is illustrative only.'],
  ['Cung thánh · Buổi tối', 'Red-and-gold sanctuary with the central Crucifix, Our Lady and Saint Joseph with the infant Jesus.'],
];
const assets = selection.entries.map((s, i) => {
  const bytes = fs.readFileSync(path.join(gallery, s.master));
  const source = fs.readFileSync(path.join(root, s.modelCapture));
  if (sha(source) !== capture.shots[i].sha256) throw Error('Source capture hash mismatch: ' + s.id);
  return { ...s, title: capture.shots[i].title, titleVi: descriptions[i][0], description: descriptions[i][1], status: 'CONCEPT',
    nativePixels: [bytes.readUInt32BE(16), bytes.readUInt32BE(20)], resampled: false, sha256: sha(bytes), bytes: bytes.length,
    sourceCaptureSha256: sha(source), visualReview: 'Reviewed against the associated source for major composition, new facade arrangement, obvious generation defects and iconography; generated details remain approximate.' };
});
const manifest = {
  date: '2026-10-24', title: 'Updated model presentation views', tool: selection.tool, mode: 'edit',
  status: 'CONCEPT — In development / Đang phát triển — Not for construction / Không dùng để thi công',
  sourceCommit: capture.sourceCommit, sourceStatus: capture.sourceStatus,
  captureManifest: '../../../../review/church-views-2026-10-24/model-inputs/capture.json',
  prompts: '../../../../review/church-views-2026-10-24/prompts.json',
  corrections: ['../../../../review/church-views-2026-10-24/corrections.json', '../../../../review/church-views-2026-10-24/evening-correction.json', '../../../../review/church-views-2026-10-24/nave-exit-sign-correction.json'],
  author: 'Thạch Bi Church design simulator project; AI-assisted image editing',
  source: 'Project-created 3D viewer captures only; no third-party drawings or photographs supplied to the generator.',
  license: 'CC BY 4.0 to the extent the project holds rights; see NOTICE.md. Generated-image copyright varies by jurisdiction.',
  credit: 'Thạch Bi Church design simulator project, https://github.com/DangHoangGeo/giaoxuthachbi-simulator, CC BY 4.0; AI-generated presentation concept.',
  limitations: [
    'Independent generated views are not dimensionally consistent survey, as-built photography or fabrication drawings. Geometry, sculpture and relief may drift.',
    'Landscape, stone paving pattern, finish detail and evening illumination are proposed atmosphere. No surveyed site context or photometric performance is established.',
    'Visible fans and hangers are omitted in the nave artwork to illustrate all-hidden intent. Physical concealment, airflow, noise, support and service access remain unresolved; the model and equipment remain unchanged.',
    'Exit signs are shown in the final nave concept; their pictured symbols/placement do not establish code compliance.',
    'Existing facade, structure, drainage, maintenance, statue fit, ventilation discharge, lighting and sound engineering holds remain open.',
    'Local image delivery only; no website content selection or deployment change.',
  ], assets,
};
fs.writeFileSync(path.join(gallery, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
const esc = s => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
const cards = assets.map((a, i) => `<article id="${a.id}"><h2>${esc(a.title)}</h2><p lang="vi" class="vi">${a.titleVi}</p><a href="${a.master}"><img src="${a.master}" width="1672" height="941" loading="${i ? 'lazy' : 'eager'}" alt="Generated concept: ${esc(a.description)}"></a><p>${esc(a.description)}</p><p class="links"><a href="${a.master}" download>Download native PNG</a> · 1672 × 941 · <a href="../../../../${a.modelCapture}">Open source 3D capture</a></p><details><summary>Compare with source model / So sánh với mô hình</summary><img src="../../../../${a.modelCapture}" width="1920" height="1080" loading="lazy" alt="Actual 3D viewer capture for ${esc(a.title)}"></details></article>`).join('\n');
fs.writeFileSync(path.join(gallery, 'index.html'), `<!doctype html>
<html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Thạch Bi Church · Updated model views · 24 October 2026</title>
<style>
*{box-sizing:border-box}body{margin:0;background:#f3f0e9;color:#302923;font:17px/1.65 Georgia,serif}header,main,footer{max-width:1440px;margin:auto;padding:32px 48px}header{padding-bottom:0}h1{font-size:42px;line-height:1.18;margin:20px 0}h2{font-size:28px;margin:0}.status{background:#4f2922;color:#fff7e8;padding:15px 20px;font:600 15px/1.7 system-ui,sans-serif;letter-spacing:.02em}.intro{max-width:1000px}.vi{color:#705f50;margin:2px 0 20px}a{color:#71432b;text-underline-offset:4px}nav{display:flex;gap:12px 24px;flex-wrap:wrap;padding:20px 0}article{padding:30px 0 40px;border-top:1px solid #cfc5b9;scroll-margin:24px}img{display:block;width:100%;height:auto;background:#e2ddd4}article>a{display:block}article>p{margin:15px 0}.links,summary,footer{font:15px/1.7 system-ui,sans-serif}summary{cursor:pointer;padding:12px 0}footer{border-top:1px solid #cfc5b9}footer p{max-width:1100px}.note{padding:18px 22px;background:#e8e0d3}.links a{white-space:nowrap}
</style>
<header><div class="status">CONCEPT · Đang phát triển / In development<br>Không dùng để thi công / Not for construction</div><p>THẠCH BI CHURCH · 24 OCTOBER 2026</p><h1>Updated model, six viewpoints</h1><p lang="vi" class="vi">Sáu góc nhìn từ mô hình mới</p><p class="intro">Presentation concepts edited from desktop captures of the owner's updated model. Four façade/exterior views and two interior views, with refined materials, carving and light. Download the native images below or compare each with its source capture.</p><nav>${assets.map((a,i)=>`<a href="#${a.id}">${String(i+1).padStart(2,'0')} ${a.title}</a>`).join('')}</nav><p class="note">Native 1672 × 941 PNGs, without upscaling. Generated proportions and small details may vary. Landscaping and evening light are illustrative. The nave's concealed-fan appearance is a concept; engineering, maintenance and performance holds remain open. These are not site photographs.</p></header>
<main>${cards}</main><footer><p>Generated with the built-in image generator from project-created model captures. <a href="manifest.json">Asset provenance</a> · <a href="../../../../review/church-views-2026-10-24/prompts.json">Exact prompts</a> · <a href="../../../../docs/church-view-renderings.md">Design record</a> · <a href="../../../../NOTICE.md">Licences and limitations</a></p><p>${manifest.credit}</p><p><strong>CONCEPT · In development / Đang phát triển · Not for construction / Không dùng để thi công</strong></p></footer></html>\n`);
console.log('Built six-image gallery and provenance manifest; native image bytes unchanged.');
