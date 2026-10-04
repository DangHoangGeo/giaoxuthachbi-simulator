/* Generate the readable HTML brief from its single Markdown source.
   Pass an absolute path to marked's ESM module if it is not installed locally. */
const fs = require('node:fs');
const path = require('node:path');
(async () => {
  const {marked} = await import(process.argv[2] || 'marked');
  const root = path.resolve(__dirname, '..');
  const source = fs.readFileSync(path.join(root, 'docs/interior-systems-plan.md'), 'utf8');
  let body = marked.parse(source);
  body = body.replace(/<h([1-6])>(.*?)<\/h\1>/g, (_, level, content) => {
    const id = content.replace(/<[^>]*>/g, '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return `<h${level} id="${id}">${content}</h${level}>`;
  }).replaceAll('<table>', '<div class="table-scroll"><table>').replaceAll('</table>', '</table></div>')
    .replaceAll('href="../Thach_Bi_Viewer/planning/index.html"', 'href="index.html"')
    .replaceAll('href="../Thach_Bi_Viewer/OPEN_CHURCH.html"', 'href="../OPEN_CHURCH.html"')
    .replaceAll('href="simulator-guide.md', 'href="../../docs/simulator-guide.md');
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Thạch Bi · Interior and systems brief</title><link rel="stylesheet" href="plan.css"><link rel="icon" href="data:,"></head><body>
<header><a class="brand" href="index.html">✝ <span>THẠCH BI <small>INTERIOR &amp; SYSTEMS BRIEF</small></span></a><nav><a href="index.html">Interactive plan</a><a href="../../docs/interior-systems-plan.md" download>Markdown source</a></nav></header>
<article class="brief">${body}</article><footer>Working design brief · 5 October 2026, simulator update 6 October 2026 · Primary research sources linked alongside the relevant guidance.</footer></body></html>\n`;
  fs.writeFileSync(path.join(root, 'Thach_Bi_Viewer/planning/brief.html'), html);
  console.log('Built planning/brief.html from docs/interior-systems-plan.md');
})().catch(error => { console.error(error); process.exitCode = 1; });
